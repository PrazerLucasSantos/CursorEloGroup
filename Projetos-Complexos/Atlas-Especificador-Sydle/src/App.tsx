import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type {
  Subproject,
  Epic,
  EpicClassGroup,
  FlowActivityType,
  FlowListItem,
  FlowStep,
  FormDef,
  FormField,
  FormMethod,
  FormSectionLayout,
  ServicePortalDef,
  ServicePortalHomePageData,
  WorkspaceDef,
} from './types'
import {
  useDataTree,
  saveForms,
  saveFlows,
  savePortals,
  saveWorkspaces,
  saveClassGroups,
  exportHtml,
  savePresentationExportJson,
  createSubproject,
  deleteSubproject,
  createEpic,
  deleteEpic,
  renameSubproject,
  renameEpic,
} from './dataLoader'
import { generateFormHtml } from './exportHtmlGenerator'
import ListPage from './components/pages/ListPage'
import FormList, { type EpicListTab } from './components/FormList'
import FormsResizableLayout from './components/FormsResizableLayout'
import Sidebar from './components/Sidebar'
import FormCanvas from './components/FormCanvas'
import FlowPresentationFullscreen from './components/FlowPresentationFullscreen'
import FlowPresentationStepCanvas from './components/FlowPresentationStepCanvas'
import FlowStepConfigPanel from './components/FlowStepConfigPanel'
import ServicePortalHomePageCanvas from './components/ServicePortalHomePageCanvas'
import { getActiveExamplePreset, migrateEpicForms, stripFieldIdFromAllPresets } from './utils/formExamplePresets'
import { flushCanvasRuntimeToActivePreset } from './utils/canvasRuntimeToPreset'
import { canvasRuntimeFieldKey } from './utils/canvasRuntimeValueKey'
import {
  addSelectedEtapasToOrgPreset,
  addSelectedGruposToCatEtapaPreset,
  FIELD_CAT_ETAPA_GRUPOS_SELECAO,
  FIELD_ETAPAS_SELECAO,
  parseEtapasSelecionadas,
  parseGruposSelecionadosEtapa,
} from './utils/atlasProtoOrgMethods'
import {
  EPIC_CLASS_UNGROUPED_ORDER_KEY,
  reconcileMemberOrderByGroup,
  stripFormIdFromAllOrders,
} from './utils/classGroupMemberOrder'
import { stripFieldIdFromVisibilityRules } from './utils/fieldVisibilityRules'
import { patchFieldById, removeFieldById } from './utils/formTree'
import {
  addFormSection,
  addFormSubSection,
  applySectionLayoutChange,
  getFirstTopLevelSectionId,
  isSectionedForm,
  removeFormSection,
  renameFormSection,
  reorderFormSections,
  setFormSectionIcon,
} from './utils/formSections'
import { normalizeFlowsFromEpic } from './utils/flowList'
import {
  clearInlineServicePortalHomeFields,
  defToHomePageData,
  homePageDataFromStep,
  newEmptyHomePageData,
  stripInlineServicePortalHomeWhenLinked,
} from './utils/servicePortalHomeData'
import ServicePortalHomePageConfigNested from './components/servicePortal/ServicePortalHomePageConfigNested'
import WorkspaceConfigPanel from './components/workspace/WorkspaceConfigPanel'
import WorkspacePreviewCanvas from './components/workspace/WorkspacePreviewCanvas'
import AtlasDemandaBoPanel from './components/AtlasDemandaBoPanel'
import { buildPresentationPayload } from './presentation/buildPresentationPayload'
import type { PresentationExportOutcome } from './types/presentationExport'
import { toExportJsonFilename } from './utils/presentationFilename'
import './App.css'
import { useDisableInputSpellcheck } from './hooks/useDisableInputSpellcheck'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** `false` = botão «Exportar HTML» sempre inactivo (exportação para `formularios-html/` em pausa). Passar a `true` para reactivar. */
const EXPORT_FORM_HTML_ENABLED = false

type EpicClassGroupsBundle = {
  groups: EpicClassGroup[]
  assignments: Record<string, string>
  memberOrderByGroup: Record<string, string[]>
}

function normalizeEpicClassGroups(epic: Epic, formList: FormDef[]): EpicClassGroupsBundle {
  const formIds = new Set(formList.map((f) => f.id))
  const groups = epic.classGroups ?? []
  const groupIds = new Set(groups.map((g) => g.id))
  const raw = epic.classGroupAssignments ?? {}
  const assignments: Record<string, string> = {}
  for (const [fid, gid] of Object.entries(raw)) {
    if (!formIds.has(fid)) continue
    if (!groupIds.has(gid)) continue
    assignments[fid] = gid
  }
  const memberOrderByGroup = reconcileMemberOrderByGroup(
    formList,
    groups,
    assignments,
    epic.classGroupMemberOrder,
  )
  return { groups, assignments, memberOrderByGroup }
}

function pruneClassGroupsBundle(bundle: EpicClassGroupsBundle, formList: FormDef[]): EpicClassGroupsBundle {
  const formIds = new Set(formList.map((f) => f.id))
  const groupIds = new Set(bundle.groups.map((g) => g.id))
  const assignments: Record<string, string> = {}
  for (const [fid, gid] of Object.entries(bundle.assignments)) {
    if (!formIds.has(fid)) continue
    if (!groupIds.has(gid)) continue
    assignments[fid] = gid
  }
  const memberOrderByGroup = reconcileMemberOrderByGroup(
    formList,
    bundle.groups,
    assignments,
    bundle.memberOrderByGroup,
  )
  return { groups: bundle.groups, assignments, memberOrderByGroup }
}

type View =
  | { page: 'subprojects' }
  | { page: 'epics'; subprojectId: string }
  | { page: 'forms'; subprojectId: string; epicId: string }

type NameDialogState =
  | { action: 'create'; target: 'subproject' }
  | { action: 'create'; target: 'epic'; subprojectId: string }
  | { action: 'rename'; target: 'subproject'; subprojectId: string }
  | { action: 'rename'; target: 'epic'; subprojectId: string; epicId: string }

type DuplicateFormDialogState = {
  sourceFormId: string
  sourceFormName: string
}

type DeleteConfirmState =
  | { kind: 'subproject'; id: string; label: string }
  | { kind: 'epic'; subprojectId: string; epicId: string; label: string }
  | { kind: 'form'; formId: string; label: string }
  | { kind: 'flow'; flowId: string; label: string }
  | { kind: 'workspace'; workspaceId: string; label: string }
  | { kind: 'portal'; portalId: string; label: string }

function App() {
  useDisableInputSpellcheck()
  const { tree, loading, refetch } = useDataTree()
  const [view, setView] = useState<View>({ page: 'subprojects' })
  const [filaDemandaOpen, setFilaDemandaOpen] = useState(false)
  const [activeFormId, setActiveFormId] = useState<string | null>(null)
  /** Incrementado após «Salvar» no canvas para recarregar valores do preset. */
  const [canvasSaveEpoch, setCanvasSaveEpoch] = useState(0)
  const [epicListTab, setEpicListTab] = useState<EpicListTab>('classes')
  const [localForms, setLocalForms] = useState<Record<string, FormDef[]>>({})
  /** Lista completa de fluxos do épico (sobrescreve leitura da árvore até bater com arquivo após refetch) */
  const [localFlows, setLocalFlows] = useState<Record<string, FlowListItem[]>>({})
  /** Etapa selecionada na aba Apresentações (painel de configuração). */
  const [activeFlowStep, setActiveFlowStep] = useState<{ flowId: string; stepId: string } | null>(null)
  const [activePortalId, setActivePortalId] = useState<string | null>(null)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null)
  const [localPortals, setLocalPortals] = useState<Record<string, ServicePortalDef[]>>({})
  const [localWorkspaces, setLocalWorkspaces] = useState<Record<string, WorkspaceDef[]>>({})
  const [localClassGroups, setLocalClassGroups] = useState<Record<string, EpicClassGroupsBundle>>({})
  const [syncConflict, setSyncConflict] = useState(false)
  const [showSpecs, setShowSpecs] = useState(false)
  /** Modo apresentação em tela cheia (play na lista de fluxos). */
  const [flowPresentationFullscreenOpen, setFlowPresentationFullscreenOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (window.location.hash === '#fila-demanda' || params.get('fila') === 'demanda') {
      setFilaDemandaOpen(true)
    }
  }, [])

  const [nameDialog, setNameDialog] = useState<NameDialogState | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [duplicateFormDialog, setDuplicateFormDialog] = useState<DuplicateFormDialogState | null>(null)
  const [duplicateFormNameDraft, setDuplicateFormNameDraft] = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const localFormsRef = useRef(localForms)
  localFormsRef.current = localForms
  const localFlowsRef = useRef(localFlows)
  localFlowsRef.current = localFlows
  const localPortalsRef = useRef(localPortals)
  localPortalsRef.current = localPortals
  const localWorkspacesRef = useRef(localWorkspaces)
  localWorkspacesRef.current = localWorkspaces
  const localClassGroupsRef = useRef(localClassGroups)
  localClassGroupsRef.current = localClassGroups

  useEffect(() => {
    if (!deleteConfirm) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !deleteBusy) setDeleteConfirm(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteConfirm, deleteBusy])

  useEffect(() => {
    if (view.page !== 'forms') {
      setSyncConflict(false)
      return
    }
    const key = `${view.subprojectId}/${view.epicId}`
    const localF = localFormsRef.current[key]
    const localFl = localFlowsRef.current[key]
    const localP = localPortalsRef.current[key]
    const localW = localWorkspacesRef.current[key]
    const localCg = localClassGroupsRef.current[key]
    if (!localF && !localFl && !localP && !localW && !localCg) {
      setSyncConflict(false)
      return
    }

    const sub = tree.subprojects.find((s) => s.id === view.subprojectId)
    const epic = sub?.epics.find((e) => e.id === view.epicId)
    if (!epic) return

    let conflict = false

    if (localF) {
      if (JSON.stringify(localF) === JSON.stringify(epic.forms)) {
        setLocalForms((prev) => {
          const copy = { ...prev }
          delete copy[key]
          return copy
        })
      } else {
        conflict = true
      }
    }

    if (localFl) {
      const treeFlows = normalizeFlowsFromEpic(epic.flows)
      if (JSON.stringify(localFl) === JSON.stringify(treeFlows)) {
        setLocalFlows((prev) => {
          const copy = { ...prev }
          delete copy[key]
          return copy
        })
      } else {
        conflict = true
      }
    }

    if (localP) {
      const treeP = epic.portals ?? []
      if (JSON.stringify(localP) === JSON.stringify(treeP)) {
        setLocalPortals((prev) => {
          const copy = { ...prev }
          delete copy[key]
          return copy
        })
      } else {
        conflict = true
      }
    }

    if (localW) {
      const treeW = epic.workspaces ?? []
      if (JSON.stringify(localW) === JSON.stringify(treeW)) {
        setLocalWorkspaces((prev) => {
          const copy = { ...prev }
          delete copy[key]
          return copy
        })
      } else {
        conflict = true
      }
    }

    if (localCg) {
      const treeForms = migrateEpicForms(epic.forms)
      const treeCg = normalizeEpicClassGroups(epic, treeForms)
      if (JSON.stringify(pruneClassGroupsBundle(localCg, treeForms)) === JSON.stringify(treeCg)) {
        setLocalClassGroups((prev) => {
          const copy = { ...prev }
          delete copy[key]
          return copy
        })
      } else {
        conflict = true
      }
    }

    setSyncConflict(conflict)
  }, [tree, view])

  function loadFromFile() {
    if (view.page !== 'forms') return
    const key = `${view.subprojectId}/${view.epicId}`
    setLocalForms((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })
    setLocalFlows((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })
    setLocalPortals((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })
    setLocalWorkspaces((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })
    setLocalClassGroups((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })
    setActiveFormId(null)
    setActiveFlowStep(null)
    setActivePortalId(null)
    setActiveWorkspaceId(null)
    setSyncConflict(false)
  }

  function keepLocalState() {
    if (view.page !== 'forms') return
    const key = `${view.subprojectId}/${view.epicId}`
    const lf = localForms[key]
    if (lf) {
      saveForms(view.subprojectId, view.epicId, lf)
    }
    const lfl = localFlows[key]
    if (lfl) {
      void saveFlows(view.subprojectId, view.epicId, lfl)
    }
    const lp = localPortals[key]
    if (lp) {
      void savePortals(view.subprojectId, view.epicId, lp)
    }
    const lw = localWorkspaces[key]
    if (lw) {
      void saveWorkspaces(view.subprojectId, view.epicId, lw)
    }
    const lcg = localClassGroups[key]
    if (lcg) {
      void saveClassGroups(view.subprojectId, view.epicId, {
        groups: lcg.groups,
        assignments: lcg.assignments,
        memberOrderByGroup: lcg.memberOrderByGroup,
      })
    }
    setSyncConflict(false)
  }

  const findSubproject = useCallback(
    (id: string) => tree.subprojects.find((s) => s.id === id),
    [tree],
  )

  const findEpic = useCallback(
    (sub: Subproject, id: string) => sub.epics.find((e) => e.id === id),
    [],
  )

  function epicKey(subId: string, epicId: string) {
    return `${subId}/${epicId}`
  }

  function clearLocalStateForSubproject(subId: string) {
    const pred = (k: string) => k.startsWith(`${subId}/`)
    setLocalForms((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (pred(k)) delete next[k]
      })
      return next
    })
    setLocalFlows((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (pred(k)) delete next[k]
      })
      return next
    })
    setLocalPortals((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (pred(k)) delete next[k]
      })
      return next
    })
    setLocalWorkspaces((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (pred(k)) delete next[k]
      })
      return next
    })
    setLocalClassGroups((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (pred(k)) delete next[k]
      })
      return next
    })
  }

  function clearLocalStateForEpic(subId: string, eid: string) {
    const k = epicKey(subId, eid)
    setLocalForms((prev) => {
      const next = { ...prev }
      delete next[k]
      return next
    })
    setLocalFlows((prev) => {
      const next = { ...prev }
      delete next[k]
      return next
    })
    setLocalPortals((prev) => {
      const next = { ...prev }
      delete next[k]
      return next
    })
    setLocalWorkspaces((prev) => {
      const next = { ...prev }
      delete next[k]
      return next
    })
    setLocalClassGroups((prev) => {
      const next = { ...prev }
      delete next[k]
      return next
    })
  }

  async function executeConfirmedDelete() {
    if (!deleteConfirm || deleteBusy) return
    const dc = deleteConfirm
    setDeleteBusy(true)
    try {
      if (dc.kind === 'subproject') {
        const subprojectId = dc.id
        const r = await deleteSubproject(subprojectId)
        if (!r.ok) {
          window.alert(r.error)
          return
        }
        clearLocalStateForSubproject(subprojectId)
        setView((v) => {
          if (v.page === 'subprojects') return v
          if ('subprojectId' in v && v.subprojectId === subprojectId) {
            return { page: 'subprojects' }
          }
          return v
        })
        setActiveFormId(null)
        setActiveFlowStep(null)
        setActivePortalId(null)
        setActiveWorkspaceId(null)
        setDeleteConfirm(null)
        await refetch()
        return
      }
      if (dc.kind === 'epic') {
        const { subprojectId, epicId } = dc
        const r = await deleteEpic(subprojectId, epicId)
        if (!r.ok) {
          window.alert(r.error)
          return
        }
        clearLocalStateForEpic(subprojectId, epicId)
        if (view.page === 'forms' && view.subprojectId === subprojectId && view.epicId === epicId) {
          setActiveFormId(null)
          setActiveFlowStep(null)
          setActivePortalId(null)
          setActiveWorkspaceId(null)
          setView({ page: 'epics', subprojectId })
        }
        setDeleteConfirm(null)
        await refetch()
        return
      }
      if (dc.kind === 'form') {
        removeForm(dc.formId)
      } else if (dc.kind === 'flow') {
        removeFlow(dc.flowId)
      } else if (dc.kind === 'workspace') {
        removeWorkspace(dc.workspaceId)
      } else if (dc.kind === 'portal') {
        removeHomePortal(dc.portalId)
      }
      setDeleteConfirm(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  async function submitNameDialog() {
    const n = nameDraft.trim()
    if (!n || !nameDialog || nameSaving) return
    setNameSaving(true)
    try {
      if (nameDialog.action === 'create') {
        if (nameDialog.target === 'subproject') {
          const r = await createSubproject(n)
          if (!r.ok) {
            window.alert(r.error)
            return
          }
        } else {
          const r = await createEpic(nameDialog.subprojectId, n)
          if (!r.ok) {
            window.alert(r.error)
            return
          }
        }
      } else if (nameDialog.target === 'subproject') {
        const r = await renameSubproject(nameDialog.subprojectId, n)
        if (!r.ok) {
          window.alert(r.error)
          return
        }
      } else {
        const r = await renameEpic(nameDialog.subprojectId, nameDialog.epicId, n)
        if (!r.ok) {
          window.alert(r.error)
          return
        }
      }
      setNameDialog(null)
      setNameDraft('')
      await refetch()
    } finally {
      setNameSaving(false)
    }
  }

  function getEpicForms(sub: Subproject, epic: Epic): FormDef[] {
    const key = epicKey(sub.id, epic.id)
    const raw = localForms[key] ?? epic.forms
    return migrateEpicForms(raw)
  }

  function setEpicForms(subId: string, epicId: string, forms: FormDef[]) {
    const key = epicKey(subId, epicId)
    setLocalForms((prev) => ({ ...prev, [key]: forms }))
    saveForms(subId, epicId, forms)
  }

  function getEpicClassGroups(sub: Subproject, epic: Epic, formList: FormDef[]): EpicClassGroupsBundle {
    const key = epicKey(sub.id, epic.id)
    const local = localClassGroups[key]
    if (local) {
      return pruneClassGroupsBundle(local, formList)
    }
    return normalizeEpicClassGroups(epic, formList)
  }

  async function setEpicClassGroupsBundle(subId: string, epicId: string, bundle: EpicClassGroupsBundle) {
    const key = epicKey(subId, epicId)
    setLocalClassGroups((prev) => ({ ...prev, [key]: bundle }))
    try {
      await saveClassGroups(subId, epicId, {
        groups: bundle.groups,
        assignments: bundle.assignments,
        memberOrderByGroup: bundle.memberOrderByGroup,
      })
    } catch (err) {
      console.error('Falha ao gravar class-groups.json', err)
    }
  }

  function assignFormToClassGroup(formId: string, groupId: string | null) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const forms = getEpicForms(a.sub, a.epic)
    const bundle = getEpicClassGroups(a.sub, a.epic, forms)
    const nextAssign = { ...bundle.assignments }
    if (groupId == null) delete nextAssign[formId]
    else nextAssign[formId] = groupId
    const stripped = stripFormIdFromAllOrders(bundle.memberOrderByGroup, formId)
    const targetKey = groupId ?? EPIC_CLASS_UNGROUPED_ORDER_KEY
    const nextOrder = { ...stripped }
    nextOrder[targetKey] = [...(nextOrder[targetKey] ?? []), formId]
    const memberOrderByGroup = reconcileMemberOrderByGroup(
      forms,
      bundle.groups,
      nextAssign,
      nextOrder,
    )
    void setEpicClassGroupsBundle(view.subprojectId, view.epicId, {
      ...bundle,
      assignments: nextAssign,
      memberOrderByGroup,
    })
  }

  function createClassGroupAndAssign(formId: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed || view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const forms = getEpicForms(a.sub, a.epic)
    const bundle = getEpicClassGroups(a.sub, a.epic, forms)
    const id = `cg-${uid()}`
    const nextGroups = [...bundle.groups, { id, name: trimmed }]
    const nextAssign = { ...bundle.assignments, [formId]: id }
    const stripped = stripFormIdFromAllOrders(bundle.memberOrderByGroup, formId)
    const nextOrder = { ...stripped, [id]: [...(stripped[id] ?? []), formId] }
    const memberOrderByGroup = reconcileMemberOrderByGroup(forms, nextGroups, nextAssign, nextOrder)
    void setEpicClassGroupsBundle(view.subprojectId, view.epicId, {
      groups: nextGroups,
      assignments: nextAssign,
      memberOrderByGroup,
    })
  }

  function renameClassGroup(groupId: string, name: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const forms = getEpicForms(a.sub, a.epic)
    const bundle = getEpicClassGroups(a.sub, a.epic, forms)
    const nextGroups = bundle.groups.map((g) => (g.id === groupId ? { ...g, name } : g))
    void setEpicClassGroupsBundle(view.subprojectId, view.epicId, { ...bundle, groups: nextGroups })
  }

  function removeClassGroup(groupId: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const forms = getEpicForms(a.sub, a.epic)
    const bundle = getEpicClassGroups(a.sub, a.epic, forms)
    const nextGroups = bundle.groups.filter((g) => g.id !== groupId)
    const nextAssign = { ...bundle.assignments }
    for (const fid of Object.keys(nextAssign)) {
      if (nextAssign[fid] === groupId) delete nextAssign[fid]
    }
    const nextOrder = { ...bundle.memberOrderByGroup }
    delete nextOrder[groupId]
    const memberOrderByGroup = reconcileMemberOrderByGroup(forms, nextGroups, nextAssign, nextOrder)
    void setEpicClassGroupsBundle(view.subprojectId, view.epicId, {
      groups: nextGroups,
      assignments: nextAssign,
      memberOrderByGroup,
    })
  }

  function reorderFormsInClassGroup(classGroupKey: string, fromIndex: number, toIndex: number) {
    if (view.page !== 'forms') return
    if (fromIndex === toIndex) return
    const a = getActiveEpic()
    if (!a) return
    const forms = getEpicForms(a.sub, a.epic)
    const bundle = getEpicClassGroups(a.sub, a.epic, forms)
    const ordered = [...(bundle.memberOrderByGroup[classGroupKey] ?? [])]
    const groupIds = new Set(bundle.groups.map((g) => g.id))
    const validIds = new Set(
      forms
        .filter((f) => {
          if (classGroupKey === EPIC_CLASS_UNGROUPED_ORDER_KEY) {
            const gid = bundle.assignments[f.id]
            return gid == null || !groupIds.has(gid)
          }
          return bundle.assignments[f.id] === classGroupKey
        })
        .map((f) => f.id),
    )
    const list = ordered.filter((id) => validIds.has(id))
    for (const id of validIds) {
      if (!list.includes(id)) list.push(id)
    }
    if (fromIndex < 0 || fromIndex >= list.length) return
    if (toIndex < 0 || toIndex >= list.length) return
    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
    const memberOrderByGroup = reconcileMemberOrderByGroup(
      forms,
      bundle.groups,
      bundle.assignments,
      { ...bundle.memberOrderByGroup, [classGroupKey]: list },
    )
    void setEpicClassGroupsBundle(view.subprojectId, view.epicId, { ...bundle, memberOrderByGroup })
  }

  function getEpicPortals(sub: Subproject, epic: Epic): ServicePortalDef[] {
    const key = epicKey(sub.id, epic.id)
    return localPortals[key] ?? epic.portals ?? []
  }

  async function setEpicPortals(subId: string, epicId: string, portals: ServicePortalDef[]) {
    const key = epicKey(subId, epicId)
    setLocalPortals((prev) => ({ ...prev, [key]: portals }))
    try {
      await savePortals(subId, epicId, portals)
    } catch (err) {
      console.error('Falha ao gravar portals.json', err)
    }
  }

  function getEpicWorkspaces(sub: Subproject, epic: Epic): WorkspaceDef[] {
    const key = epicKey(sub.id, epic.id)
    return localWorkspaces[key] ?? epic.workspaces ?? []
  }

  async function setEpicWorkspaces(subId: string, epicId: string, workspaces: WorkspaceDef[]) {
    const key = epicKey(subId, epicId)
    setLocalWorkspaces((prev) => ({ ...prev, [key]: workspaces }))
    try {
      await saveWorkspaces(subId, epicId, workspaces)
    } catch (err) {
      console.error('Falha ao gravar workspaces.json', err)
    }
  }

  const getEpicFlowsList = useCallback((sub: Subproject, epic: Epic) => {
    const key = epicKey(sub.id, epic.id)
    return localFlows[key] ?? normalizeFlowsFromEpic(epic.flows)
  }, [localFlows])

  function normalizeFlowsForSave(flows: FlowListItem[]): FlowListItem[] {
    return flows.map((flow) => ({
      ...flow,
      steps: (flow.steps ?? []).map((s) => stripInlineServicePortalHomeWhenLinked(s)),
    }))
  }

  async function setEpicFlowsList(subId: string, epicId: string, flows: FlowListItem[]) {
    const key = epicKey(subId, epicId)
    const next = normalizeFlowsForSave(flows)
    setLocalFlows((prev) => ({ ...prev, [key]: next }))
    try {
      await saveFlows(subId, epicId, next)
    } catch (err) {
      console.error('Falha ao gravar flows.json', err)
    }
  }

  function goHome() {
    setView({ page: 'subprojects' })
    setActiveFormId(null)
    setActiveFlowStep(null)
    setActivePortalId(null)
    setActiveWorkspaceId(null)
    setEpicListTab('classes')
  }

  function getBreadcrumbs(): { label: string; onClick: () => void }[] {
    const crumbs: { label: string; onClick: () => void }[] = []
    if (view.page === 'subprojects') return crumbs

    const sub = findSubproject(view.subprojectId)
    if (!sub) return crumbs
    crumbs.push({
      label: sub.name,
      onClick: () => {
        setView({ page: 'epics', subprojectId: view.subprojectId })
        setActiveFormId(null)
        setActiveFlowStep(null)
        setActivePortalId(null)
        setActiveWorkspaceId(null)
        setEpicListTab('classes')
      },
    })
    if (view.page === 'epics') return crumbs

    const epic = findEpic(sub, view.epicId)
    if (!epic) return crumbs
    crumbs.push({ label: epic.name, onClick: () => {} })
    return crumbs
  }

  // -- Active epic + form --

  function getActiveEpic(): { sub: Subproject; epic: Epic } | null {
    if (view.page !== 'forms') return null
    const sub = findSubproject(view.subprojectId)
    if (!sub) return null
    const epic = findEpic(sub, view.epicId)
    if (!epic) return null
    return { sub, epic }
  }

  const active = getActiveEpic()
  const epicForms = active ? getEpicForms(active.sub, active.epic) : []
  const epicClassGroupsBundle: EpicClassGroupsBundle = active
    ? getEpicClassGroups(active.sub, active.epic, epicForms)
    : { groups: [], assignments: {}, memberOrderByGroup: {} }
  const epicPortals: ServicePortalDef[] = active ? getEpicPortals(active.sub, active.epic) : []
  const epicWorkspaces: WorkspaceDef[] = active ? getEpicWorkspaces(active.sub, active.epic) : []
  const activePortal: ServicePortalDef | null = activePortalId
    ? epicPortals.find((p) => p.id === activePortalId) ?? null
    : null
  const activeWorkspace: WorkspaceDef | null = activeWorkspaceId
    ? epicWorkspaces.find((w) => w.id === activeWorkspaceId) ?? null
    : null
  const flowsWithSteps = useMemo(() => {
    if (view.page !== 'forms') return []
    const { subprojectId, epicId } = view as Extract<View, { page: 'forms' }>
    const sub = tree.subprojects.find((s) => s.id === subprojectId)
    const epic = sub?.epics.find((e) => e.id === epicId)
    if (!sub || !epic) return []
    const list = localFlows[epicKey(sub.id, epic.id)] ?? normalizeFlowsFromEpic(epic.flows)
    return list.map((f) => ({ ...f, steps: f.steps ?? [] }))
  }, [view, tree.subprojects, localFlows])
  const activeForm = epicForms.find((f) => f.id === activeFormId) ?? null

  type FlowWithSteps = (typeof flowsWithSteps)[number]
  const flowSidebarSelection = useMemo((): { flow: FlowWithSteps | null; step: FlowStep | null } => {
    if (!activeFlowStep || view.page !== 'forms') return { flow: null, step: null }
    const flow = flowsWithSteps.find((f) => f.id === activeFlowStep.flowId) ?? null
    const step = flow?.steps.find((s) => s.id === activeFlowStep.stepId) ?? null
    return { flow, step }
  }, [activeFlowStep, flowsWithSteps, view.page])

  const presentationFullscreenModel = useMemo(() => {
    if (view.page !== 'forms' || !flowPresentationFullscreenOpen || !activeFlowStep) return null
    const pf = flowsWithSteps.find((f) => f.id === activeFlowStep.flowId)
    if (!pf) return null
    const ps = pf.steps.find((s) => s.id === activeFlowStep.stepId)
    if (!ps) return null
    return { flow: pf, step: ps }
  }, [view.page, flowPresentationFullscreenOpen, activeFlowStep, flowsWithSteps])

  useEffect(() => {
    if (view.page !== 'forms' || !activeFlowStep) return
    const flow = flowsWithSteps.find((f) => f.id === activeFlowStep.flowId)
    const step = flow?.steps.find((s) => s.id === activeFlowStep.stepId)
    if (!flow || !step) setActiveFlowStep(null)
  }, [view.page, flowsWithSteps, activeFlowStep])

  useEffect(() => {
    if (!activeFlowStep && flowPresentationFullscreenOpen) setFlowPresentationFullscreenOpen(false)
  }, [activeFlowStep, flowPresentationFullscreenOpen])

  useEffect(() => {
    if (view.page !== 'forms' && flowPresentationFullscreenOpen) setFlowPresentationFullscreenOpen(false)
  }, [view.page, flowPresentationFullscreenOpen])

  useEffect(() => {
    if (view.page !== 'forms' || !activeWorkspaceId) return
    const ws = epicWorkspaces.find((w) => w.id === activeWorkspaceId)
    if (!ws) setActiveWorkspaceId(null)
  }, [view.page, epicWorkspaces, activeWorkspaceId])

  async function exportPresentationViewer(
    flowId: string,
    fileBasename: string,
  ): Promise<PresentationExportOutcome | null> {
    if (view.page !== 'forms') return null
    const a = getActiveEpic()
    if (!a) return null
    const flow = flowsWithSteps.find((f) => f.id === flowId)
    if (!flow?.steps?.length) return null
    const initialStepId =
      activeFlowStep?.flowId === flowId ? activeFlowStep.stepId : undefined
    const payload = buildPresentationPayload({
      bundle: { forms: epicForms, portals: epicPortals, workspaces: epicWorkspaces },
      flow,
      epicName: a.epic.name,
      initialStepId,
    })
    const json = JSON.stringify(payload, null, 2)
    const filename = toExportJsonFilename(fileBasename)
    const saved = await savePresentationExportJson(filename, json)
    if (saved.ok && saved.relativePath) {
      return { kind: 'saved-in-project', relativePath: saved.relativePath }
    }
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const aEl = document.createElement('a')
    aEl.href = url
    aEl.download = filename
    aEl.click()
    URL.revokeObjectURL(url)
    return {
      kind: 'downloaded',
      filename,
      reason: saved.error,
    }
  }

  function patchFlowStep(flowId: string, stepId: string, patch: Partial<FlowStep>) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicFlowsList(a.sub, a.epic)
    const next = list.map((flow) => {
      if (flow.id !== flowId) return flow
      return {
        ...flow,
        steps: (flow.steps ?? []).map((s) =>
          s.id === stepId ? stripInlineServicePortalHomeWhenLinked({ ...s, ...patch }) : s,
        ),
      }
    })
    void setEpicFlowsList(view.subprojectId, view.epicId, next)
  }

  function setFlowStepType(flowId: string, stepId: string, type: FlowActivityType, extraPatch?: Partial<FlowStep>) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicFlowsList(a.sub, a.epic)
    const flow = list.find((f) => f.id === flowId)
    const step = flow?.steps?.find((s) => s.id === stepId)
    if (!step || (step.type != null && step.type !== '')) return
    const patch: Partial<FlowStep> = { type, ...(extraPatch ?? {}) }
    if (type === 'html' && step.htmlContent === undefined) patch.htmlContent = ''
    const next = list.map((f) => {
      if (f.id !== flowId) return f
      return {
        ...f,
        steps: (f.steps ?? []).map((s) =>
          s.id === stepId ? stripInlineServicePortalHomeWhenLinked({ ...s, ...patch }) : s,
        ),
      }
    })
    void setEpicFlowsList(view.subprojectId, view.epicId, next)
  }

  function migrateInlineHomeToNewPortal(flowId: string, stepId: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicFlowsList(a.sub, a.epic)
    const flow = list.find((f) => f.id === flowId)
    const step = flow?.steps?.find((s) => s.id === stepId)
    if (!step) return
    const data = homePageDataFromStep(step)
    const id = uid()
    const portals = getEpicPortals(a.sub, a.epic)
    const p: ServicePortalDef = { id, name: `Portal (migrado: ${step.title})`, ...data }
    void setEpicPortals(view.subprojectId, view.epicId, [...portals, p])
    patchFlowStep(flowId, stepId, { linkedServicePortalId: id, ...clearInlineServicePortalHomeFields() })
    setEpicListTab('portals')
    setActivePortalId(id)
    setActiveFormId(null)
    setActiveFlowStep(null)
    setActiveWorkspaceId(null)
  }

  function addHomePortalFromList() {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicPortals(a.sub, a.epic)
    const id = uid()
    const n = list.length + 1
    const p: ServicePortalDef = { id, name: `Novo portal ${n}`, ...newEmptyHomePageData() }
    void setEpicPortals(view.subprojectId, view.epicId, [...list, p])
    setActivePortalId(id)
    setActiveWorkspaceId(null)
    setEpicListTab('portals')
  }

  function removeHomePortal(portalId: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicPortals(a.sub, a.epic)
    void setEpicPortals(
      view.subprojectId,
      view.epicId,
      list.filter((p) => p.id !== portalId),
    )
    if (activePortalId === portalId) setActivePortalId(null)
  }

  function renameHomePortal(portalId: string, name: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicPortals(a.sub, a.epic)
    void setEpicPortals(
      view.subprojectId,
      view.epicId,
      list.map((p) => (p.id === portalId ? { ...p, name } : p)),
    )
  }

  function patchActivePortal(home: Partial<ServicePortalHomePageData>) {
    if (view.page !== 'forms' || !activePortalId) return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicPortals(a.sub, a.epic)
    void setEpicPortals(
      view.subprojectId,
      view.epicId,
      list.map((p) => (p.id === activePortalId ? { ...p, ...home } : p)),
    )
  }

  function patchActiveWorkspace(patch: Partial<WorkspaceDef>) {
    if (view.page !== 'forms' || !activeWorkspaceId) return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicWorkspaces(a.sub, a.epic)
    void setEpicWorkspaces(
      view.subprojectId,
      view.epicId,
      list.map((w) => (w.id === activeWorkspaceId ? { ...w, ...patch } : w)),
    )
  }

  function addWorkspaceFromList() {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicWorkspaces(a.sub, a.epic)
    const id = uid()
    const n = list.length + 1
    const w: WorkspaceDef = { id, name: `Novo workspace ${n}` }
    void setEpicWorkspaces(view.subprojectId, view.epicId, [...list, w])
    setActiveWorkspaceId(id)
    setEpicListTab('workspaces')
  }

  function removeWorkspace(workspaceId: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicWorkspaces(a.sub, a.epic)
    void setEpicWorkspaces(
      view.subprojectId,
      view.epicId,
      list.filter((w) => w.id !== workspaceId),
    )
    if (activeWorkspaceId === workspaceId) setActiveWorkspaceId(null)
  }

  function renameWorkspace(workspaceId: string, name: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicWorkspaces(a.sub, a.epic)
    void setEpicWorkspaces(
      view.subprojectId,
      view.epicId,
      list.map((w) => (w.id === workspaceId ? { ...w, name } : w)),
    )
  }

  // -- Form CRUD --

  function addForm() {
    if (view.page !== 'forms') return
    const id = uid()
    const form: FormDef = { id, name: 'Nova classe', fields: [] }
    setEpicForms(view.subprojectId, view.epicId, [...epicForms, form])
    setActiveFormId(id)
  }

  function addFlow() {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicFlowsList(a.sub, a.epic)
    const item: FlowListItem = { id: uid(), name: 'Nova apresentação', steps: [] }
    void setEpicFlowsList(view.subprojectId, view.epicId, [...list, item])
  }

  function addFlowStep(flowId: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicFlowsList(a.sub, a.epic)
    const step: FlowStep = { id: uid(), title: 'Nova etapa' }
    const next = list.map((f) =>
      f.id === flowId ? { ...f, steps: [...(f.steps ?? []), step] } : f,
    )
    void setEpicFlowsList(view.subprojectId, view.epicId, next)
  }

  function reorderFlowSteps(flowId: string, fromIndex: number, toIndex: number) {
    if (view.page !== 'forms') return
    if (fromIndex === toIndex) return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicFlowsList(a.sub, a.epic)
    const next = list.map((f) => {
      if (f.id !== flowId) return f
      const steps = [...(f.steps ?? [])]
      if (fromIndex < 0 || fromIndex >= steps.length) return f
      if (toIndex < 0 || toIndex >= steps.length) return f
      const [moved] = steps.splice(fromIndex, 1)
      steps.splice(toIndex, 0, moved)
      return { ...f, steps }
    })
    void setEpicFlowsList(view.subprojectId, view.epicId, next)
  }

  function removeFlowStep(flowId: string, stepId: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicFlowsList(a.sub, a.epic)
    const next = list.map((f) =>
      f.id === flowId ? { ...f, steps: (f.steps ?? []).filter((s) => s.id !== stepId) } : f,
    )
    void setEpicFlowsList(view.subprojectId, view.epicId, next)
    if (activeFlowStep?.flowId === flowId && activeFlowStep?.stepId === stepId) {
      setActiveFlowStep(null)
    }
  }

  function removeFlow(flowId: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicFlowsList(a.sub, a.epic)
    const next = list.filter((f) => f.id !== flowId)
    void setEpicFlowsList(view.subprojectId, view.epicId, next)
    if (activeFlowStep?.flowId === flowId) setActiveFlowStep(null)
  }

  function renameFlow(flowId: string, name: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicFlowsList(a.sub, a.epic)
    const next = list.map((f) => (f.id === flowId ? { ...f, name } : f))
    void setEpicFlowsList(view.subprojectId, view.epicId, next)
  }

  function renameFlowStep(flowId: string, stepId: string, title: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    if (!a) return
    const list = getEpicFlowsList(a.sub, a.epic)
    const next = list.map((f) =>
      f.id === flowId
        ? {
            ...f,
            steps: (f.steps ?? []).map((s) => (s.id === stepId ? { ...s, title } : s)),
          }
        : f,
    )
    void setEpicFlowsList(view.subprojectId, view.epicId, next)
  }

  function removeForm(formId: string) {
    if (view.page !== 'forms') return
    const a = getActiveEpic()
    const nextForms = epicForms.filter((f) => f.id !== formId)
    setEpicForms(view.subprojectId, view.epicId, nextForms)
    if (activeFormId === formId) setActiveFormId(null)
    if (a) {
      const bundle = getEpicClassGroups(a.sub, a.epic, epicForms)
      const nextAssign = { ...bundle.assignments }
      delete nextAssign[formId]
      const nextOrder = stripFormIdFromAllOrders(bundle.memberOrderByGroup, formId)
      void setEpicClassGroupsBundle(view.subprojectId, view.epicId, {
        ...bundle,
        assignments: nextAssign,
        memberOrderByGroup: reconcileMemberOrderByGroup(
          nextForms,
          bundle.groups,
          nextAssign,
          nextOrder,
        ),
      })
    }
  }

  function renameForm(formId: string, name: string) {
    if (view.page !== 'forms') return
    setEpicForms(
      view.subprojectId,
      view.epicId,
      epicForms.map((f) => (f.id === formId ? { ...f, name } : f)),
    )
  }

  function openDuplicateFormDialog(formId: string) {
    if (view.page !== 'forms') return
    const source = epicForms.find((f) => f.id === formId)
    if (!source) return
    setDuplicateFormDialog({ sourceFormId: source.id, sourceFormName: source.name })
    setDuplicateFormNameDraft(`${source.name} (cópia)`)
  }

  function submitDuplicateForm() {
    if (view.page !== 'forms' || !duplicateFormDialog) return
    const source = epicForms.find((f) => f.id === duplicateFormDialog.sourceFormId)
    if (!source) {
      setDuplicateFormDialog(null)
      setDuplicateFormNameDraft('')
      return
    }
    const nextName = duplicateFormNameDraft.trim()
    if (!nextName) return
    if (nextName === source.name.trim()) {
      window.alert('O nome da classe duplicada deve ser diferente da classe original.')
      return
    }

    let nextId = uid()
    while (epicForms.some((f) => f.id === nextId)) nextId = uid()
    const clone =
      typeof structuredClone === 'function'
        ? structuredClone(source)
        : (JSON.parse(JSON.stringify(source)) as FormDef)
    const duplicated: FormDef = { ...clone, id: nextId, name: nextName }
    const a = getActiveEpic()
    let nextClassBundle: EpicClassGroupsBundle | null = null
    const nextForms = [...epicForms, duplicated]
    if (a) {
      const cg = getEpicClassGroups(a.sub, a.epic, epicForms)
      const gid = cg.assignments[source.id]
      const groupIds = new Set(cg.groups.map((g) => g.id))
      const effectiveGroup = gid && groupIds.has(gid) ? gid : null
      const nextAssign = { ...cg.assignments }
      if (effectiveGroup) nextAssign[nextId] = effectiveGroup
      const bucketKey = effectiveGroup ?? EPIC_CLASS_UNGROUPED_ORDER_KEY
      const ord = [...(cg.memberOrderByGroup[bucketKey] ?? [])]
      const ix = ord.indexOf(source.id)
      if (ix >= 0) ord.splice(ix + 1, 0, nextId)
      else ord.push(nextId)
      nextClassBundle = {
        ...cg,
        assignments: nextAssign,
        memberOrderByGroup: reconcileMemberOrderByGroup(nextForms, cg.groups, nextAssign, {
          ...cg.memberOrderByGroup,
          [bucketKey]: ord,
        }),
      }
    }
    setEpicForms(view.subprojectId, view.epicId, nextForms)
    if (nextClassBundle) {
      void setEpicClassGroupsBundle(view.subprojectId, view.epicId, nextClassBundle)
    }
    setActiveFormId(nextId)
    setDuplicateFormDialog(null)
    setDuplicateFormNameDraft('')
  }

  function updateActiveForm(updater: (form: FormDef) => FormDef) {
    if (view.page !== 'forms' || !activeFormId) return
    setEpicForms(
      view.subprojectId,
      view.epicId,
      epicForms.map((f) => (f.id === activeFormId ? updater(f) : f)),
    )
  }

  function handleSaveCanvasValues(runtimeMap: Record<string, string>) {
    if (view.page !== 'forms' || !activeForm) return
    updateActiveForm((form) => flushCanvasRuntimeToActivePreset(form, epicForms, runtimeMap))
    setCanvasSaveEpoch((n) => n + 1)
  }

  function handleOrgHtmlAction(action: string, runtimeMap: Record<string, string>) {
    if (view.page !== 'forms' || !activeForm) return

    if (action === 'incluir-grupos-etapa') {
      if (activeForm.id !== 'form-patlasv4-proto-cat-etapa-documentacional') return
      const key = canvasRuntimeFieldKey(activeForm.id, [], FIELD_CAT_ETAPA_GRUPOS_SELECAO)
      const selected = parseGruposSelecionadosEtapa(
        runtimeMap[key],
        getActiveExamplePreset(activeForm),
      )
      if (!selected.length) {
        alert('Selecione ao menos um grupo em Grupos de documentos.')
        return
      }
      let added: string[] = []
      let skipped: string[] = []
      updateActiveForm((form) => {
        const flushed = flushCanvasRuntimeToActivePreset(form, epicForms, runtimeMap)
        const result = addSelectedGruposToCatEtapaPreset(flushed, epicForms, selected)
        added = result.added
        skipped = result.skipped
        return result.form
      })
      setCanvasSaveEpoch((n) => n + 1)
      if (!added.length && skipped.length) {
        alert(`Os grupos já estão na lista: ${skipped.join(', ')}.`)
      }
      return
    }

    if (action !== 'adicionar-etapas') return
    const key = canvasRuntimeFieldKey(activeForm.id, [], FIELD_ETAPAS_SELECAO)
    const selected = parseEtapasSelecionadas(
      runtimeMap[key],
      getActiveExamplePreset(activeForm),
    )
    if (!selected.length) {
      alert('Selecione ao menos uma etapa em Etapas a incluir.')
      return
    }
    let added: string[] = []
    let skipped: string[] = []
    updateActiveForm((form) => {
      const flushed = flushCanvasRuntimeToActivePreset(form, epicForms, runtimeMap)
      const result = addSelectedEtapasToOrgPreset(flushed, epicForms, selected)
      added = result.added
      skipped = result.skipped
      return result.form
    })
    setCanvasSaveEpoch((n) => n + 1)
    if (!added.length && skipped.length) {
      alert(`As etapas já estão incluídas: ${skipped.join(', ')}.`)
    }
  }

  function updateFormFields(updater: (fields: FormField[]) => FormField[]) {
    updateActiveForm((form) => ({ ...form, fields: updater(form.fields) }))
  }

  const defaultNewField = (): FormField => ({
    id: uid(),
    type: 'text',
    label: 'Novo campo',
    size: 'medium',
    readOnly: false,
    hidden: false,
    required: false,
    multiple: false,
    relevance: 'common',
  })

  function addField() {
    updateActiveForm((form) => {
      const nf = { ...defaultNewField() }
      if (isSectionedForm(form) && form.sections?.length) {
        ;(nf as FormField).sectionId =
          getFirstTopLevelSectionId(form) ?? form.sections[0].id
      }
      return { ...form, fields: [...form.fields, nf] }
    })
  }

  function setFormSectionLayout(layout: FormSectionLayout) {
    updateActiveForm((form) => applySectionLayoutChange(form, layout))
  }

  function handleAddFormSubSection(parentTabSectionId: string) {
    updateActiveForm((form) => addFormSubSection(form, parentTabSectionId))
  }

  function handleAddFormSection() {
    updateActiveForm((form) => addFormSection(form))
  }

  function handleRemoveFormSection(sectionId: string) {
    updateActiveForm((form) => removeFormSection(form, sectionId))
  }

  function handleRenameFormSection(sectionId: string, title: string) {
    updateActiveForm((form) => renameFormSection(form, sectionId, title))
  }

  function handleSetSectionIcon(sectionId: string, icon: string) {
    updateActiveForm((form) => setFormSectionIcon(form, sectionId, icon))
  }

  function handleReorderFormSections(fromIndex: number, toIndex: number) {
    updateActiveForm((form) => reorderFormSections(form, fromIndex, toIndex))
  }

  function addFormMethod() {
    updateActiveForm((form) => ({
      ...form,
      methods: [
        ...(form.methods ?? []),
        { id: uid(), name: 'Novo método', icon: 'star', kind: 'destaque' },
      ],
    }))
  }

  function updateFormMethod(methodId: string, patch: Partial<FormMethod>) {
    updateActiveForm((form) => ({
      ...form,
      methods: (form.methods ?? []).map((m) => (m.id === methodId ? { ...m, ...patch } : m)),
    }))
  }

  function removeFormMethod(methodId: string) {
    updateActiveForm((form) => ({
      ...form,
      methods: (form.methods ?? []).filter((m) => m.id !== methodId),
    }))
  }

  function updateField(fieldId: string, patch: Partial<FormField>) {
    updateFormFields((fields) => patchFieldById(fields, fieldId, patch))
  }

  function updateFieldSpecInForm(formId: string, fieldId: string, spec: string) {
    if (view.page !== 'forms') return
    setEpicForms(
      view.subprojectId,
      view.epicId,
      epicForms.map((form) =>
        form.id === formId ? { ...form, fields: patchFieldById(form.fields, fieldId, { spec }) } : form,
      ),
    )
  }

  function removeField(fieldId: string) {
    updateActiveForm((form) => {
      const stripped = stripFieldIdFromAllPresets(form, fieldId)
      const next = { ...stripped, fields: removeFieldById(stripped.fields, fieldId) }
      return stripFieldIdFromVisibilityRules(next, fieldId)
    })
  }

  function reorderFields(fromIndex: number, toIndex: number) {
    updateActiveForm((form) => {
      const next = [...form.fields]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { ...form, fields: next }
    })
  }

  // -- Render --

  const breadcrumbs = getBreadcrumbs()

  function renderPage() {
    if (loading) {
      return (
        <div className="list-page" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: '#888' }}>Carregando dados...</p>
        </div>
      )
    }

    switch (view.page) {
      case 'subprojects':
        return (
          <ListPage
            title="Subprojetos"
            items={tree.subprojects}
            onSelect={(id) => setView({ page: 'epics', subprojectId: id })}
            onAdd={() => {
              setNameDraft('')
              setNameDialog({ action: 'create', target: 'subproject' })
            }}
            onRename={(id) => {
              const s = tree.subprojects.find((x) => x.id === id)
              if (!s) return
              setNameDraft(s.name)
              setNameDialog({ action: 'rename', target: 'subproject', subprojectId: id })
            }}
            onRemove={(id) => {
              const s = tree.subprojects.find((x) => x.id === id)
              setDeleteConfirm({ kind: 'subproject', id, label: s?.name ?? id })
            }}
            addLabel="Novo subprojeto"
            emptyLabel="Nenhum subprojeto. Use o botão abaixo para criar."
          />
        )

      case 'epics': {
        const sub = findSubproject(view.subprojectId)
        if (!sub) return null
        return (
          <ListPage
            title={sub.name}
            items={sub.epics}
            onSelect={(id) => {
              setView({ page: 'forms', subprojectId: view.subprojectId, epicId: id })
              setActiveFormId(null)
              setActiveFlowStep(null)
              setActivePortalId(null)
              setActiveWorkspaceId(null)
              setEpicListTab('classes')
              setLocalForms((prev) => {
                const key = epicKey(view.subprojectId, id)
                const copy = { ...prev }
                delete copy[key]
                return copy
              })
              setLocalFlows((prev) => {
                const key = epicKey(view.subprojectId, id)
                const copy = { ...prev }
                delete copy[key]
                return copy
              })
              setLocalPortals((prev) => {
                const key = epicKey(view.subprojectId, id)
                const copy = { ...prev }
                delete copy[key]
                return copy
              })
              setLocalWorkspaces((prev) => {
                const key = epicKey(view.subprojectId, id)
                const copy = { ...prev }
                delete copy[key]
                return copy
              })
            }}
            emptyLabel="Nenhum épico. Use o botão abaixo para criar."
            onAdd={() => {
              setNameDraft('')
              setNameDialog({
                action: 'create',
                target: 'epic',
                subprojectId: view.subprojectId,
              })
            }}
            onRename={(epicId) => {
              const e = sub.epics.find((x) => x.id === epicId)
              if (!e) return
              setNameDraft(e.name)
              setNameDialog({
                action: 'rename',
                target: 'epic',
                subprojectId: view.subprojectId,
                epicId,
              })
            }}
            onRemove={(epicId) => {
              const e = sub.epics.find((x) => x.id === epicId)
              setDeleteConfirm({
                kind: 'epic',
                subprojectId: view.subprojectId,
                epicId,
                label: e?.name ?? epicId,
              })
            }}
            addLabel="Novo épico"
          />
        )
      }

      case 'forms':
        return (
          <FormsResizableLayout
            renderFormList={(headerAction) => (
              <FormList
                epicName={active?.epic.name ?? ''}
                listTab={epicListTab}
                onListTabChange={(tab) => {
                  setEpicListTab(tab)
                  if (tab === 'classes') {
                    setActiveFlowStep(null)
                    setActivePortalId(null)
                    setActiveWorkspaceId(null)
                  } else if (tab === 'presentations') {
                    setActiveFormId(null)
                    setActivePortalId(null)
                    setActiveWorkspaceId(null)
                  } else if (tab === 'portals') {
                    setActiveFormId(null)
                    setActiveFlowStep(null)
                    setActiveWorkspaceId(null)
                  } else if (tab === 'workspaces') {
                    setActiveFormId(null)
                    setActiveFlowStep(null)
                    setActivePortalId(null)
                  }
                }}
                forms={epicForms}
                activeFormId={activeFormId}
                onSelectForm={setActiveFormId}
                onAddForm={addForm}
                onRemoveForm={(formId) => {
                  const f = epicForms.find((x) => x.id === formId)
                  setDeleteConfirm({
                    kind: 'form',
                    formId,
                    label: (f?.name ?? '').trim() || formId,
                  })
                }}
                onRenameForm={renameForm}
                onDuplicateForm={openDuplicateFormDialog}
                classGroups={epicClassGroupsBundle.groups}
                classGroupAssignments={epicClassGroupsBundle.assignments}
                classGroupMemberOrder={epicClassGroupsBundle.memberOrderByGroup}
                onAssignFormToClassGroup={assignFormToClassGroup}
                onCreateClassGroupAndAssign={createClassGroupAndAssign}
                onRenameClassGroup={renameClassGroup}
                onRemoveClassGroup={removeClassGroup}
                onReorderFormsInClassGroup={reorderFormsInClassGroup}
                portals={epicPortals}
                activePortalId={activePortalId}
                onSelectPortal={setActivePortalId}
                onAddPortal={addHomePortalFromList}
                onRemovePortal={(portalId) => {
                  const p = epicPortals.find((x) => x.id === portalId)
                  setDeleteConfirm({
                    kind: 'portal',
                    portalId,
                    label: (p?.name ?? '').trim() || portalId,
                  })
                }}
                onRenamePortal={renameHomePortal}
                workspaces={epicWorkspaces}
                activeWorkspaceId={activeWorkspaceId}
                onSelectWorkspace={setActiveWorkspaceId}
                onAddWorkspace={addWorkspaceFromList}
                onRemoveWorkspace={(workspaceId) => {
                  const w = epicWorkspaces.find((x) => x.id === workspaceId)
                  setDeleteConfirm({
                    kind: 'workspace',
                    workspaceId,
                    label: (w?.name ?? '').trim() || workspaceId,
                  })
                }}
                onRenameWorkspace={renameWorkspace}
                flows={flowsWithSteps}
                onAddFlow={addFlow}
                onAddFlowStep={addFlowStep}
                onReorderFlowSteps={reorderFlowSteps}
                onRemoveFlowStep={removeFlowStep}
                onRenameFlowStep={renameFlowStep}
                onRemoveFlow={(flowId) => {
                  const f = flowsWithSteps.find((x) => x.id === flowId)
                  setDeleteConfirm({
                    kind: 'flow',
                    flowId,
                    label: (f?.name ?? '').trim() || flowId,
                  })
                }}
                onRenameFlow={renameFlow}
                activeFlowId={activeFlowStep?.flowId ?? null}
                activeStepId={activeFlowStep?.stepId ?? null}
                onSelectFlowStep={(flowId, stepId) => setActiveFlowStep({ flowId, stepId })}
                onOpenFlowPresentation={(flowId) => {
                  const flow = flowsWithSteps.find((f) => f.id === flowId)
                  if (!flow?.steps?.length) return
                  setEpicListTab('presentations')
                  setActiveFormId(null)
                  setActivePortalId(null)
                  setActiveWorkspaceId(null)
                  setActiveFlowStep({ flowId, stepId: flow.steps[0].id })
                  setFlowPresentationFullscreenOpen(true)
                }}
                onExportPresentationViewer={exportPresentationViewer}
                headerAction={headerAction}
              />
            )}
            showSidebar={
              (epicListTab === 'classes' && !!activeForm) ||
              (epicListTab === 'presentations' && !!activeFlowStep) ||
              (epicListTab === 'portals' && !!activePortal) ||
              (epicListTab === 'workspaces' && !!activeWorkspace)
            }
            sidebar={
              epicListTab === 'presentations' ? (
                <FlowStepConfigPanel
                  key={`${activeFlowStep?.flowId ?? ''}-${activeFlowStep?.stepId ?? 'none'}`}
                  flow={flowSidebarSelection.flow}
                  step={flowSidebarSelection.step}
                  epicForms={epicForms}
                  servicePortals={epicPortals}
                  workspaces={epicWorkspaces}
                  onMigrateInlineHomeToNewPortal={migrateInlineHomeToNewPortal}
                  onSetStepType={setFlowStepType}
                  onUpdateStep={patchFlowStep}
                />
              ) : epicListTab === 'portals' && activePortal ? (
                <aside key={activePortal.id} className="sidebar flow-step-config">
                  <header className="panel-header">
                    <h2 className="panel-header__title">Portal</h2>
                    <p className="flow-step-config__subtitle">{activePortal.name}</p>
                  </header>
                  <div className="flow-step-config__body flow-step-config__body--bpmn">
                    <ServicePortalHomePageConfigNested
                      data={defToHomePageData(activePortal)}
                      onChange={(patch) => patchActivePortal(patch)}
                    />
                  </div>
                </aside>
              ) : epicListTab === 'workspaces' && activeWorkspace ? (
                <WorkspaceConfigPanel
                  key={activeWorkspace.id}
                  workspace={activeWorkspace}
                  epicForms={epicForms}
                  onChange={patchActiveWorkspace}
                />
              ) : activeForm ? (
                <Sidebar
                  key={activeForm.id}
                  formName={activeForm.name}
                  form={activeForm}
                  epicForms={epicForms}
                  onAddField={addField}
                  onUpdateField={updateField}
                  onRemoveField={removeField}
                  onReorderFields={reorderFields}
                  onOpenLinkedForm={setActiveFormId}
                  onSetSectionLayout={setFormSectionLayout}
                  onAddFormSection={handleAddFormSection}
                  onRemoveFormSection={handleRemoveFormSection}
                  onRenameFormSection={handleRenameFormSection}
                  onSetSectionIcon={handleSetSectionIcon}
                  onReorderFormSections={handleReorderFormSections}
                  onAddFormSubSection={handleAddFormSubSection}
                  onAddFormMethod={addFormMethod}
                  onUpdateFormMethod={updateFormMethod}
                  onRemoveFormMethod={removeFormMethod}
                  onMutateForm={updateActiveForm}
                />
              ) : null
            }
            canvas={
                <div className="canvas-shell">
                <header className="panel-header panel-header--canvas">
                  <div className="panel-header__leading">
                    {epicListTab === 'classes' && activeForm ? (
                      <div
                        className="canvas-mode-segmented"
                        role="radiogroup"
                        aria-label="Modo do canvas da classe"
                      >
                        <button
                          type="button"
                          className={`canvas-mode-segmented__btn${(activeForm.defaultCanvasMode ?? 'edit') === 'edit' ? ' canvas-mode-segmented__btn--active' : ''}`}
                          role="radio"
                          aria-checked={(activeForm.defaultCanvasMode ?? 'edit') === 'edit'}
                          onClick={() =>
                            updateActiveForm((f) => ({ ...f, defaultCanvasMode: 'edit' }))
                          }
                        >
                          <span className="canvas-mode-segmented__btn-label">
                            <svg
                              className="canvas-mode-segmented__icon"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            Edição
                          </span>
                        </button>
                        <button
                          type="button"
                          className={`canvas-mode-segmented__btn${(activeForm.defaultCanvasMode ?? 'edit') === 'read' ? ' canvas-mode-segmented__btn--active' : ''}`}
                          role="radio"
                          aria-checked={(activeForm.defaultCanvasMode ?? 'edit') === 'read'}
                          onClick={() =>
                            updateActiveForm((f) => ({ ...f, defaultCanvasMode: 'read' }))
                          }
                        >
                          <span className="canvas-mode-segmented__btn-label">
                            <svg
                              className="canvas-mode-segmented__icon"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Visualização
                          </span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="panel-header__actions">
                    <button
                      type="button"
                      className="panel-header__btn"
                      disabled={
                        !EXPORT_FORM_HTML_ENABLED || epicListTab !== 'classes' || !activeForm
                      }
                      title={
                        !EXPORT_FORM_HTML_ENABLED
                          ? 'Exportação HTML em pausa; a opção voltará a ficar disponível.'
                          : undefined
                      }
                      onClick={async () => {
                        if (!activeForm) return
                        const html = generateFormHtml(activeForm, epicForms)
                        const slug = activeForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                        const filename = `${slug}.html`
                        try {
                          await exportHtml(filename, html)
                          alert(`Classe exportada para formularios-html/${filename}`)
                        } catch {
                          alert('Erro ao exportar a classe')
                        }
                      }}
                    >
                      Exportar HTML
                    </button>
                  </div>
                </header>
                <div className="canvas-shell__body">
                  {epicListTab === 'portals' ? (
                    activePortal ? (
                      <ServicePortalHomePageCanvas
                        label={activePortal.name}
                        data={defToHomePageData(activePortal)}
                      />
                    ) : (
                      <section className="canvas canvas--empty" aria-label="Portais do épico">
                        <div className="canvas__placeholder">
                          <span className="canvas__placeholder-icon">🧭</span>
                          <p className="canvas__placeholder-title">Portais</p>
                          <p className="canvas__placeholder-hint">Selecione ou crie um portal reutilizável.</p>
                        </div>
                      </section>
                    )
                  ) : epicListTab === 'workspaces' ? (
                    activeWorkspace ? (
                      <WorkspacePreviewCanvas
                        label={activeWorkspace.name}
                        workspace={activeWorkspace}
                        epicForms={epicForms}
                      />
                    ) : (
                      <section className="canvas canvas--empty" aria-label="Workspaces do épico">
                        <div className="canvas__placeholder">
                          <span className="canvas__placeholder-icon">🗂️</span>
                          <p className="canvas__placeholder-title">Workspaces</p>
                          <p className="canvas__placeholder-hint">Selecione ou crie um workspace na lista à esquerda.</p>
                        </div>
                      </section>
                    )
                  ) : epicListTab === 'presentations' ? (
                    <FlowPresentationStepCanvas
                      bundle={{
                        forms: epicForms,
                        portals: epicPortals,
                        workspaces: epicWorkspaces,
                      }}
                      flow={flowSidebarSelection.flow}
                      step={flowSidebarSelection.step}
                      showSpecs={showSpecs}
                      onToggleSpecs={() => setShowSpecs((v) => !v)}
                      onNavigateToStep={(flowId, stepId) => setActiveFlowStep({ flowId, stepId })}
                    />
                  ) : activeForm ? (
                    <FormCanvas
                      key={`${activeForm.id}-${canvasSaveEpoch}`}
                      form={activeForm}
                      epicForms={epicForms}
                      showSpecs={showSpecs}
                      onToggleSpecs={() => setShowSpecs((v) => !v)}
                      onUpdateFieldSpec={updateFieldSpecInForm}
                      onSaveCanvas={handleSaveCanvasValues}
                      onOrgHtmlAction={handleOrgHtmlAction}
                      canvasReadOnly={(activeForm.defaultCanvasMode ?? 'edit') === 'read'}
                    />
                  ) : (
                    <section className="canvas canvas--empty">
                      <div className="canvas__placeholder">
                        <span className="canvas__placeholder-icon">📄</span>
                        <p>Selecione ou crie uma classe</p>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            }
          />
        )
    }
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <button className="app-header__home" onClick={goHome}>
            {tree.projectName || 'Elo especificações'}
          </button>
          {breadcrumbs.length > 0 && (
            <nav className="breadcrumb">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="breadcrumb__item">
                  <span className="breadcrumb__sep">/</span>
                  {i < breadcrumbs.length - 1 ? (
                    <button className="breadcrumb__link" onClick={crumb.onClick}>
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="breadcrumb__current">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <div className="app-header__ops">
            <button
              type="button"
              className="app-header__ops-btn app-header__ops-btn--primary"
              onClick={() => setFilaDemandaOpen(true)}
              title="Fila operacional Demanda F3 (mesmo store do portal cliente)"
            >
              Fila Demanda · MTI
            </button>
            <a className="app-header__ops-link" href="/portal-cliente.html">
              Portal cliente
            </a>
            <a className="app-header__ops-link" href="/portal-parceiro.html">
              Portal parceiro
            </a>
          </div>
        </div>
      </header>

      <AtlasDemandaBoPanel open={filaDemandaOpen} onClose={() => setFilaDemandaOpen(false)} />

      {syncConflict && view.page === 'forms' && (
        <div className="sync-banner">
          <span className="sync-banner__text">
            Os arquivos (classes, apresentações, portais e/ou workspaces) foram alterados externamente e diferem do
            estado atual da tela.
          </span>
          <div className="sync-banner__actions">
            <button className="sync-banner__btn sync-banner__btn--file" onClick={loadFromFile}>
              Carregar do arquivo
            </button>
            <button className="sync-banner__btn sync-banner__btn--state" onClick={keepLocalState}>
              Manter estado da tela
            </button>
          </div>
        </div>
      )}

      {view.page === 'forms' ? (
        renderPage()
      ) : (
        <div className="app-body app-body--page">
          {renderPage()}
        </div>
      )}

      {presentationFullscreenModel && activeFlowStep && (
        <FlowPresentationFullscreen
          flow={presentationFullscreenModel.flow}
          activeStepId={activeFlowStep.stepId}
          onSelectStep={(stepId) =>
            setActiveFlowStep({ flowId: presentationFullscreenModel.flow.id, stepId })
          }
          onClose={() => setFlowPresentationFullscreenOpen(false)}
          stepPreview={
            <FlowPresentationStepCanvas
              bundle={{
                forms: epicForms,
                portals: epicPortals,
                workspaces: epicWorkspaces,
              }}
              flow={presentationFullscreenModel.flow}
              step={presentationFullscreenModel.step}
              showSpecs={showSpecs}
              onToggleSpecs={() => setShowSpecs((v) => !v)}
              onNavigateToStep={(flowId, stepId) => setActiveFlowStep({ flowId, stepId })}
            />
          }
        />
      )}

      {nameDialog ? (
        <div
          className="app-name-dialog-overlay"
          role="presentation"
          onClick={() => {
            if (!nameSaving) setNameDialog(null)
          }}
        >
          <div
            className="app-name-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-name-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="app-name-dialog-title">
              {nameDialog.action === 'create'
                ? nameDialog.target === 'subproject'
                  ? 'Novo subprojeto'
                  : 'Novo épico'
                : nameDialog.target === 'subproject'
                  ? 'Renomear subprojeto'
                  : 'Renomear épico'}
            </h3>
            <div className="app-name-dialog__field">
              <label htmlFor="app-name-dialog-input">Nome</label>
              <input
                id="app-name-dialog-input"
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                disabled={nameSaving}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void submitNameDialog()
                  }
                  if (e.key === 'Escape' && !nameSaving) setNameDialog(null)
                }}
              />
            </div>
            <div className="app-name-dialog__actions">
              <button
                type="button"
                className="app-name-dialog__cancel"
                disabled={nameSaving}
                onClick={() => setNameDialog(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="app-name-dialog__submit"
                disabled={nameSaving || !nameDraft.trim()}
                onClick={() => void submitNameDialog()}
              >
                {nameDialog.action === 'create' ? 'Criar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {duplicateFormDialog ? (
        <div
          className="app-name-dialog-overlay"
          role="presentation"
          onClick={() => {
            setDuplicateFormDialog(null)
            setDuplicateFormNameDraft('')
          }}
        >
          <div
            className="app-name-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-duplicate-form-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="app-duplicate-form-dialog-title">Duplicar classe</h3>
            <p className="app-delete-dialog__desc">
              Classe original:{' '}
              <strong className="app-delete-dialog__strong">
                {duplicateFormDialog.sourceFormName.trim() || duplicateFormDialog.sourceFormId}
              </strong>
            </p>
            <div className="app-name-dialog__field">
              <label htmlFor="app-duplicate-form-dialog-input">Nome da classe duplicada</label>
              <input
                id="app-duplicate-form-dialog-input"
                type="text"
                value={duplicateFormNameDraft}
                autoFocus
                onChange={(e) => setDuplicateFormNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    submitDuplicateForm()
                  }
                  if (e.key === 'Escape') {
                    setDuplicateFormDialog(null)
                    setDuplicateFormNameDraft('')
                  }
                }}
              />
            </div>
            <div className="app-name-dialog__actions">
              <button
                type="button"
                className="app-name-dialog__cancel"
                onClick={() => {
                  setDuplicateFormDialog(null)
                  setDuplicateFormNameDraft('')
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="app-name-dialog__submit"
                disabled={!duplicateFormNameDraft.trim()}
                onClick={submitDuplicateForm}
              >
                Duplicar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteConfirm ? (
        <div
          className="app-name-dialog-overlay"
          role="presentation"
          onClick={() => {
            if (!deleteBusy) setDeleteConfirm(null)
          }}
        >
          <div
            className="app-name-dialog app-delete-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="app-delete-dialog-title"
            aria-describedby="app-delete-dialog-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="app-delete-dialog-title">Confirmar exclusão</h3>
            <p id="app-delete-dialog-desc" className="app-delete-dialog__desc">
              {deleteConfirm.kind === 'subproject' ? (
                <>
                  Ao excluir o subprojeto{' '}
                  <strong className="app-delete-dialog__strong">{deleteConfirm.label}</strong>, todos os épicos nele
                  contidos e as respectivas dependências serão apagados permanentemente do disco — incluindo classes
                  (formulários), fluxos e apresentações, portais, workspaces e restantes ficheiros do subprojeto.
                </>
              ) : deleteConfirm.kind === 'epic' ? (
                <>
                  Ao excluir o épico{' '}
                  <strong className="app-delete-dialog__strong">{deleteConfirm.label}</strong>, todas as dependências
                  associadas a este épico serão apagadas permanentemente do disco — incluindo classes (formulários),
                  fluxos e apresentações, portais, workspaces e demais dados gravados na pasta do épico.
                </>
              ) : deleteConfirm.kind === 'form' ? (
                <>
                  Ao excluir a classe{' '}
                  <strong className="app-delete-dialog__strong">{deleteConfirm.label}</strong>, toda a definição deste
                  formulário neste épico (campos, secções, métodos, regras de visibilidade e valores de exemplo) deixa de
                  existir no ficheiro. Referências noutros formulários, fluxos ou workspaces a esta classe podem ficar
                  inválidas.
                </>
              ) : deleteConfirm.kind === 'flow' ? (
                <>
                  Ao excluir a apresentação{' '}
                  <strong className="app-delete-dialog__strong">{deleteConfirm.label}</strong>, o fluxo completo — todas
                  as etapas, pré-visualização, HTML livre, BPMN e restantes configurações — será removido do ficheiro do
                  épico.
                </>
              ) : deleteConfirm.kind === 'workspace' ? (
                <>
                  Ao excluir o workspace{' '}
                  <strong className="app-delete-dialog__strong">{deleteConfirm.label}</strong>, a estrutura de pacotes,
                  classes e ligações definida neste workspace deixa de existir no ficheiro do épico.
                </>
              ) : (
                <>
                  Ao excluir o portal{' '}
                  <strong className="app-delete-dialog__strong">{deleteConfirm.label}</strong>, toda a definição da
                  página inicial deste portal será removida. Etapas de fluxo ou outros elementos que referenciem este
                  portal podem ficar inconsistentes.
                </>
              )}{' '}
              <span className="app-delete-dialog__warn">Esta ação não pode ser desfeita.</span>
            </p>
            <div className="app-name-dialog__actions">
              <button
                type="button"
                className="app-name-dialog__cancel"
                disabled={deleteBusy}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="app-delete-dialog__confirm"
                disabled={deleteBusy}
                onClick={() => void executeConfirmedDelete()}
              >
                {deleteBusy ? 'A excluir…' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default App
