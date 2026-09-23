import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import type {
  EpicClassGroup,
  FlowListItem,
  FlowStep,
  FormDef,
  ServicePortalDef,
  WorkspaceDef,
} from '../types'
import type { PresentationExportOutcome } from '../types/presentationExport'
import {
  defaultExportBasename,
  sanitizeExportBasename,
  zipRelativeExportPathFromPresentationJson,
} from '../utils/presentationFilename'
import { flowStepTypeDisplayLabel } from '../utils/flowStep'
import { EPIC_CLASS_UNGROUPED_ORDER_KEY, orderFormsInClassBucket } from '../utils/classGroupMemberOrder'

export type EpicListTab = 'presentations' | 'classes' | 'workspaces' | 'portals'

const STEP_DRAG_HANDLE_ICON = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <circle cx="5.5" cy="3.5" r="1.25" />
    <circle cx="10.5" cy="3.5" r="1.25" />
    <circle cx="5.5" cy="8" r="1.25" />
    <circle cx="10.5" cy="8" r="1.25" />
    <circle cx="5.5" cy="12.5" r="1.25" />
    <circle cx="10.5" cy="12.5" r="1.25" />
  </svg>
)

/** Indicador visual na lista de apresentações — triângulo contornado, alinhado ao ⋯ ao lado. */
function presentationExportZipRelativePath(out: PresentationExportOutcome): string {
  const jsonBasename =
    out.kind === 'saved-in-project'
      ? out.relativePath.replace(/\\/g, '/').split('/').pop() ?? 'apresentacao.json'
      : out.filename
  return zipRelativeExportPathFromPresentationJson(jsonBasename)
}

const PRESENTATION_EXPORT_COPY_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PRESENTATION_EXPORT_CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function PresentationExportCopyCmd({ label, command }: { label: string; command: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="form-list__export-cmd">
      <span className="form-list__export-cmd-label">{label}</span>
      <div className="form-list__export-cmd-pre-wrap">
        <pre className="form-list__export-cmd-pre">
          <code>{command}</code>
        </pre>
        <button
          type="button"
          className={`form-list__export-cmd-copy${copied ? ' form-list__export-cmd-copy--done' : ''}`}
          title={copied ? 'Copiado' : 'Copiar para a área de transferência'}
          aria-label={copied ? 'Copiado para a área de transferência' : 'Copiar comando'}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(command)
            } catch {
              window.prompt('Copie o comando (Ctrl+C) e feche esta janela:', command)
            }
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
        >
          {copied ? PRESENTATION_EXPORT_CHECK_ICON : PRESENTATION_EXPORT_COPY_ICON}
        </button>
      </div>
    </div>
  )
}

const CLASS_GROUP_ADD_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
)

const CLASS_GROUP_REMOVE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M3 7h5l2-2h6l2 2h5v12H3V7z" strokeLinejoin="round" />
    <path d="M9 14h6" strokeLinecap="round" />
  </svg>
)

function scrollableAncestors(el: HTMLElement | null): HTMLElement[] {
  const out: HTMLElement[] = []
  if (!el) return out
  let p: HTMLElement | null = el.parentElement
  while (p) {
    const st = window.getComputedStyle(p)
    if (/(auto|scroll|overlay)/.test(st.overflowY) || /(auto|scroll|overlay)/.test(st.overflowX)) {
      out.push(p)
    }
    p = p.parentElement
  }
  out.push(document.documentElement)
  return out
}

/** Retângulo do item «Grupo» (linha do submenu) para alinhar o flyout como submenu nativo. */
function syncClassGroupFlyoutToSubmenuRow(
  anchor: HTMLElement | null,
  estW: number,
): { left: number; top: number; maxHeight: number } | null {
  if (!anchor) return null
  const r = anchor.getBoundingClientRect()
  /** Espaço entre o menu principal e o painel de grupos (lado a lado, sem sobreposição). */
  const gapPx = 2
  let left = r.right + gapPx
  const top = r.top
  const maxH = Math.max(120, window.innerHeight - top - 12)
  if (left + estW > window.innerWidth - 8) {
    left = r.left - estW - gapPx
  }
  if (left < 8) left = 8
  if (left + estW > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - estW - 8)
  }
  return { left, top, maxHeight: maxH }
}

const FLOW_PRESENTATION_PLAY_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M9 8v8l8-4-8-4z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinejoin="round"
    />
  </svg>
)

interface Props {
  epicName: string
  listTab: EpicListTab
  onListTabChange: (tab: EpicListTab) => void
  forms: FormDef[]
  activeFormId: string | null
  onSelectForm: (id: string) => void
  onAddForm: () => void
  onRemoveForm: (id: string) => void
  onRenameForm: (id: string, name: string) => void
  onDuplicateForm: (id: string) => void
  /** Grupos da aba Classes — persistidos em `class-groups.json`. */
  classGroups?: EpicClassGroup[]
  classGroupAssignments?: Record<string, string>
  onAssignFormToClassGroup?: (formId: string, groupId: string | null) => void
  onCreateClassGroupAndAssign?: (formId: string, name: string) => void
  onRenameClassGroup?: (groupId: string, name: string) => void
  onRemoveClassGroup?: (groupId: string) => void
  /** Ordem persistida das classes por id de grupo (ou `EPIC_CLASS_UNGROUPED_ORDER_KEY` para «Sem grupo»). */
  classGroupMemberOrder?: Record<string, string[]>
  onReorderFormsInClassGroup?: (classGroupKey: string, fromIndex: number, toIndex: number) => void
  portals: ServicePortalDef[]
  activePortalId: string | null
  onSelectPortal: (id: string) => void
  onAddPortal: () => void
  onRemovePortal: (id: string) => void
  onRenamePortal: (id: string, name: string) => void
  workspaces: WorkspaceDef[]
  activeWorkspaceId: string | null
  onSelectWorkspace: (id: string) => void
  onAddWorkspace: () => void
  onRemoveWorkspace: (id: string) => void
  onRenameWorkspace: (id: string, name: string) => void
  /** Apresentações (fluxos) com etapas */
  flows: Array<FlowListItem & { steps: FlowStep[] }>
  onAddFlow: () => void
  onAddFlowStep: (flowId: string) => void
  onReorderFlowSteps: (flowId: string, fromIndex: number, toIndex: number) => void
  onRemoveFlowStep: (flowId: string, stepId: string) => void
  onRenameFlowStep: (flowId: string, stepId: string, title: string) => void
  onRemoveFlow: (flowId: string) => void
  onRenameFlow: (flowId: string, name: string) => void
  activeFlowId: string | null
  activeStepId: string | null
  onSelectFlowStep: (flowId: string, stepId: string) => void
  /** Abre modo apresentação em tela cheia para o fluxo indicado. */
  onOpenFlowPresentation?: (flowId: string) => void
  /** Exporta `presentation.json` para o viewer estático (Netlify). `fileBasename` sem `.json`. */
  onExportPresentationViewer?: (
    flowId: string,
    fileBasename: string,
  ) => Promise<PresentationExportOutcome | null | void>
  headerAction?: ReactNode
}

export default function FormList({
  epicName,
  listTab,
  onListTabChange,
  forms,
  activeFormId,
  onSelectForm,
  onAddForm,
  onRemoveForm,
  onRenameForm,
  onDuplicateForm,
  classGroups = [],
  classGroupAssignments = {},
  onAssignFormToClassGroup,
  onCreateClassGroupAndAssign,
  onRenameClassGroup,
  onRemoveClassGroup,
  classGroupMemberOrder = {},
  onReorderFormsInClassGroup,
  portals,
  activePortalId,
  onSelectPortal,
  onAddPortal,
  onRemovePortal,
  onRenamePortal,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onAddWorkspace,
  onRemoveWorkspace,
  onRenameWorkspace,
  flows,
  onAddFlow,
  onAddFlowStep,
  onReorderFlowSteps,
  onRemoveFlowStep,
  onRenameFlowStep,
  onRemoveFlow,
  onRenameFlow,
  activeFlowId,
  activeStepId,
  onSelectFlowStep,
  onOpenFlowPresentation,
  onExportPresentationViewer,
  headerAction,
}: Props) {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [openFlowAccIds, setOpenFlowAccIds] = useState<Set<string>>(() => new Set())
  const [stepDrag, setStepDrag] = useState<{ flowId: string; index: number } | null>(null)
  const [stepDropOver, setStepDropOver] = useState<{ flowId: string; index: number } | null>(null)
  const [presentationExportDialog, setPresentationExportDialog] = useState<{
    flowId: string
  } | null>(null)
  const [presentationExportBasename, setPresentationExportBasename] = useState('')
  const [presentationExportOutcome, setPresentationExportOutcome] =
    useState<PresentationExportOutcome | null>(null)
  const [presentationExportBusy, setPresentationExportBusy] = useState(false)
  const [classGroupDialogFormId, setClassGroupDialogFormId] = useState<string | null>(null)
  const [classGroupNameDraft, setClassGroupNameDraft] = useState('')
  const [openFormGroupSubmenuFor, setOpenFormGroupSubmenuFor] = useState<string | null>(null)
  const [openClassAccIds, setOpenClassAccIds] = useState<Set<string>>(() => new Set())
  const [classFormDrag, setClassFormDrag] = useState<{ bucketKey: string; index: number } | null>(null)
  const [classFormDropOver, setClassFormDropOver] = useState<{ bucketKey: string; index: number } | null>(
    null,
  )
  const classGroupSubmenuRowRef = useRef<HTMLLIElement | null>(null)
  const [classGroupFlyoutStyle, setClassGroupFlyoutStyle] = useState<{
    left: number
    top: number
    maxHeight: number
  } | null>(null)

  const closePresentationExportDialog = useCallback(() => {
    setPresentationExportDialog(null)
    setPresentationExportOutcome(null)
    setPresentationExportBusy(false)
  }, [])

  function handleStepDragStart(flowId: string, index: number, e: DragEvent) {
    setOpenMenuKey(null)
    setStepDrag({ flowId, index })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', `${flowId}:${index}`)
  }

  function handleStepDragEnd() {
    setStepDrag(null)
    setStepDropOver(null)
  }

  function handleStepDragOver(flowId: string, index: number, e: DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!stepDrag || stepDrag.flowId !== flowId) {
      setStepDropOver(null)
      return
    }
    setStepDropOver({ flowId, index })
  }

  function handleStepDrop(flowId: string, index: number, e: DragEvent) {
    e.preventDefault()
    if (stepDrag && stepDrag.flowId === flowId && stepDrag.index !== index) {
      onReorderFlowSteps(flowId, stepDrag.index, index)
    }
    setStepDrag(null)
    setStepDropOver(null)
  }

  function handleClassFormDragStart(bucketKey: string, index: number, e: DragEvent) {
    if (!onReorderFormsInClassGroup) return
    setOpenMenuKey(null)
    setClassFormDrag({ bucketKey, index })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', `${bucketKey}:${index}`)
  }

  function handleClassFormDragEnd() {
    setClassFormDrag(null)
    setClassFormDropOver(null)
  }

  function handleClassFormDragOver(bucketKey: string, index: number, e: DragEvent) {
    if (!onReorderFormsInClassGroup) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!classFormDrag || classFormDrag.bucketKey !== bucketKey) {
      setClassFormDropOver(null)
      return
    }
    setClassFormDropOver({ bucketKey, index })
  }

  function handleClassFormDrop(bucketKey: string, index: number, e: DragEvent) {
    if (!onReorderFormsInClassGroup) return
    e.preventDefault()
    if (
      classFormDrag &&
      classFormDrag.bucketKey === bucketKey &&
      classFormDrag.index !== index
    ) {
      onReorderFormsInClassGroup(bucketKey, classFormDrag.index, index)
    }
    setClassFormDrag(null)
    setClassFormDropOver(null)
  }

  function trySelectFlowStep(e: ReactMouseEvent, flowId: string, stepId: string) {
    if ((e.target as HTMLElement).closest('[data-flow-step-chrome]')) return
    setOpenFlowAccIds((prev) => new Set(prev).add(flowId))
    onSelectFlowStep(flowId, stepId)
  }

  function toggleFlowAccordion(flowId: string) {
    setOpenFlowAccIds((prev) => {
      const next = new Set(prev)
      if (next.has(flowId)) next.delete(flowId)
      else next.add(flowId)
      return next
    })
  }

  useEffect(() => {
    if (!openMenuKey) return
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.form-list__menu')) {
        setOpenMenuKey(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [openMenuKey])

  useEffect(() => {
    if (!openMenuKey) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuKey(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openMenuKey])

  useEffect(() => {
    if (!presentationExportDialog) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (presentationExportOutcome) return
      if (presentationExportBusy) return
      closePresentationExportDialog()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [
    presentationExportDialog,
    presentationExportOutcome,
    presentationExportBusy,
    closePresentationExportDialog,
  ])

  useEffect(() => {
    if (editingKey) nameInputRef.current?.focus()
  }, [editingKey])

  const flowIdsKey = flows.map((f) => f.id).join('|')
  useEffect(() => {
    const valid = new Set(flows.map((f) => f.id))
    setOpenFlowAccIds((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)))
      if (next.size === prev.size && [...prev].every((id) => next.has(id))) return prev
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só quando o conjunto de ids de fluxos muda
  }, [flowIdsKey])

  function toggleClassAccordion(accId: string) {
    setOpenClassAccIds((prev) => {
      const next = new Set(prev)
      if (next.has(accId)) next.delete(accId)
      else next.add(accId)
      return next
    })
  }

  useEffect(() => {
    if (!openMenuKey) setOpenFormGroupSubmenuFor(null)
  }, [openMenuKey])

  const syncClassGroupFlyoutFromMenu = useCallback(() => {
    if (!openFormGroupSubmenuFor || !openMenuKey?.startsWith('form:')) {
      setClassGroupFlyoutStyle(null)
      return
    }
    const formIdFromKey = openMenuKey.slice('form:'.length)
    if (formIdFromKey !== openFormGroupSubmenuFor) {
      setClassGroupFlyoutStyle(null)
      return
    }
    const estW = 148
    const pos = syncClassGroupFlyoutToSubmenuRow(classGroupSubmenuRowRef.current, estW)
    setClassGroupFlyoutStyle(pos)
  }, [openFormGroupSubmenuFor, openMenuKey])

  useLayoutEffect(() => {
    syncClassGroupFlyoutFromMenu()
  }, [syncClassGroupFlyoutFromMenu, listTab, classGroups.length, forms.length])

  useEffect(() => {
    if (!openFormGroupSubmenuFor) return
    const anchor = classGroupSubmenuRowRef.current
    if (!anchor) return
    const roots = scrollableAncestors(anchor)
    const onScrollOrResize = () => {
      syncClassGroupFlyoutFromMenu()
    }
    roots.forEach((root) => root.addEventListener('scroll', onScrollOrResize, true))
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      roots.forEach((root) => root.removeEventListener('scroll', onScrollOrResize, true))
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [openFormGroupSubmenuFor, openMenuKey, syncClassGroupFlyoutFromMenu])

  useEffect(() => {
    if (!classGroupDialogFormId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setClassGroupDialogFormId(null)
      setClassGroupNameDraft('')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [classGroupDialogFormId])

  const classAccIdsKey = `${classGroups.map((g) => g.id).join('|')}|${classGroups.length}`
  useEffect(() => {
    const valid = new Set(classGroups.map((g) => g.id))
    valid.add(EPIC_CLASS_UNGROUPED_ORDER_KEY)
    setOpenClassAccIds((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)))
      if (next.size === prev.size && [...prev].every((id) => next.has(id))) return prev
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- quando os ids de grupos mudam
  }, [classAccIdsKey])

  useEffect(() => {
    if (!openMenuKey?.startsWith('classGroup:')) return
    const gid = openMenuKey.slice('classGroup:'.length)
    if (!classGroups.some((g) => g.id === gid)) setOpenMenuKey(null)
  }, [openMenuKey, classGroups])

  useEffect(() => {
    if (!editingKey?.startsWith('renameClassGroup:')) return
    const gid = editingKey.slice('renameClassGroup:'.length)
    if (!classGroups.some((g) => g.id === gid)) setEditingKey(null)
  }, [editingKey, classGroups])

  const groupAssign = classGroupAssignments
  const groupedClassUi = classGroups.length > 0
  const ungroupedClassForms = useMemo(
    () =>
      orderFormsInClassBucket(
        EPIC_CLASS_UNGROUPED_ORDER_KEY,
        forms,
        groupAssign,
        classGroups,
        classGroupMemberOrder,
      ),
    [forms, classGroups, groupAssign, classGroupMemberOrder],
  )

  const rootClassGroups = useMemo(
    () => classGroups.filter((g) => !g.parentGroupId),
    [classGroups],
  )

  const childClassGroupsByParent = useMemo(() => {
    const map = new Map<string, EpicClassGroup[]>()
    for (const g of classGroups) {
      if (!g.parentGroupId) continue
      const arr = map.get(g.parentGroupId) ?? []
      arr.push(g)
      map.set(g.parentGroupId, arr)
    }
    return map
  }, [classGroups])

  const epicTabsScrollRef = useRef<HTMLDivElement>(null)
  const epicTabsRowRef = useRef<HTMLDivElement>(null)
  const [epicScrollNav, setEpicScrollNav] = useState({
    overflow: false,
    canLeft: false,
    canRight: false,
  })

  const updateEpicScrollNav = useCallback(() => {
    const el = epicTabsScrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflow = scrollWidth > clientWidth + 1
    const maxScroll = scrollWidth - clientWidth
    setEpicScrollNav({
      overflow,
      canLeft: overflow && scrollLeft > 2,
      canRight: overflow && scrollLeft < maxScroll - 2,
    })
  }, [])

  useLayoutEffect(() => {
    updateEpicScrollNav()
  }, [updateEpicScrollNav])

  useEffect(() => {
    const scrollEl = epicTabsScrollRef.current
    const rowEl = epicTabsRowRef.current
    if (!scrollEl) return
    const ro = new ResizeObserver(() => updateEpicScrollNav())
    ro.observe(scrollEl)
    if (rowEl) ro.observe(rowEl)
    return () => ro.disconnect()
  }, [updateEpicScrollNav])

  function scrollEpicTabs(dir: 'prev' | 'next') {
    const el = epicTabsScrollRef.current
    if (!el) return
    const amount = Math.max(120, Math.floor(el.clientWidth * 0.75))
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' })
  }

  function renderClassGroupNode(g: EpicClassGroup, nested: boolean): ReactNode {
    const inGroup = orderFormsInClassBucket(
      g.id,
      forms,
      groupAssign,
      classGroups,
      classGroupMemberOrder,
    )
    const childGroups = childClassGroupsByParent.get(g.id) ?? []
    const open = openClassAccIds.has(g.id)
    const groupMenuKey = `classGroup:${g.id}`

    return (
      <div
        className={`flow-acc${open ? ' flow-acc--open' : ''}${nested ? ' flow-acc--nested' : ''}`}
      >
        <div
          role="button"
          tabIndex={0}
          className="flow-acc__trigger"
          aria-expanded={open}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('[data-class-group-acc-chrome]')) return
            toggleClassAccordion(g.id)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if ((e.target as HTMLElement).closest('[data-class-group-acc-chrome]')) return
              toggleClassAccordion(g.id)
            }
          }}
        >
          <span className="flow-acc__chevron" aria-hidden>
            ›
          </span>
          {editingKey === `renameClassGroup:${g.id}` ? (
            <input
              ref={nameInputRef}
              data-class-group-acc-chrome
              className="form-list__name flow-acc__title-input"
              value={g.name}
              onChange={(e) => onRenameClassGroup!(g.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter' || e.key === 'Escape') {
                  e.preventDefault()
                  setEditingKey(null)
                }
              }}
              onBlur={() => setEditingKey(null)}
            />
          ) : (
            <span className="flow-acc__title">{g.name}</span>
          )}
          {hasClassGroupAccordionMenu ? (
            <div className="flow-acc__play-and-menu" data-class-group-acc-chrome>
              <div
                className="form-list__menu flow-acc__flow-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="form-list__more"
                  aria-label={`Mais opções do grupo ${g.name}`}
                  aria-expanded={openMenuKey === groupMenuKey}
                  aria-haspopup="menu"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuKey((prev) => (prev === groupMenuKey ? null : groupMenuKey))
                  }}
                >
                  ⋯
                </button>
                {openMenuKey === groupMenuKey && (
                  <ul className="form-list__dropdown" role="menu">
                    <li role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="form-list__dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuKey(null)
                          setEditingKey(`renameClassGroup:${g.id}`)
                        }}
                      >
                        Renomear
                      </button>
                    </li>
                    <li role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="form-list__dropdown-item form-list__dropdown-item--danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuKey(null)
                          setEditingKey(null)
                          onRemoveClassGroup!(g.id)
                        }}
                      >
                        Remover
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </div>
        {open ? (
          <div className="flow-acc__panel" id={`class-acc-panel-${g.id}`}>
            {inGroup.length > 0 ? (
              <ul className="form-list__items form-list__items--class-acc">
                {inGroup.map((cf, idx) =>
                  renderClassFormRow(cf, { bucketKey: g.id, formIndex: idx }),
                )}
              </ul>
            ) : childGroups.length === 0 ? (
              <p className="flow-acc__empty-steps">Nenhuma classe neste grupo.</p>
            ) : null}
            {childGroups.length > 0 ? (
              <div className="flow-acc-list flow-acc-list--nested" role="list">
                {childGroups.map((cg) => (
                  <div key={cg.id} role="listitem">
                    {renderClassGroupNode(cg, true)}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  const hasClassGroupActions = Boolean(onAssignFormToClassGroup && onCreateClassGroupAndAssign)
  const hasClassGroupAccordionMenu = Boolean(onRenameClassGroup && onRemoveClassGroup)

  function renderClassFormRow(f: FormDef, dragCtx?: { bucketKey: string; formIndex: number }) {
    const assignedGid = groupAssign[f.id]
    const assignableGroups = classGroups.filter((g) => g.id !== assignedGid)
    const groupSubOpen = openFormGroupSubmenuFor === f.id
    const canReorder = Boolean(dragCtx && onReorderFormsInClassGroup)
    const bk = dragCtx?.bucketKey
    const fi = dragCtx?.formIndex
    const isDragging =
      canReorder &&
      bk != null &&
      fi != null &&
      classFormDrag?.bucketKey === bk &&
      classFormDrag.index === fi
    const isDragOver =
      canReorder &&
      bk != null &&
      fi != null &&
      classFormDropOver?.bucketKey === bk &&
      classFormDropOver.index === fi
    const menuClassName = canReorder ? 'form-list__menu flow-acc__step-menu' : 'form-list__menu'

    const formRowBody = (
      <>
        <div
          className="form-list__card"
          role="button"
          tabIndex={0}
          onClick={() => {
            setOpenMenuKey(null)
            onSelectForm(f.id)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpenMenuKey(null)
              onSelectForm(f.id)
            }
          }}
        >
          {editingKey === `form:${f.id}` ? (
            <input
              ref={nameInputRef}
              className="form-list__name"
              value={f.name}
              onChange={(e) => onRenameForm(f.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter' || e.key === 'Escape') {
                  e.preventDefault()
                  setEditingKey(null)
                }
              }}
              onBlur={() => setEditingKey(null)}
            />
          ) : (
            <span className="form-list__name-text">{f.name}</span>
          )}
        </div>
        <div className={menuClassName}>
          <button
            type="button"
            className="form-list__more"
            aria-label="Mais opções"
            aria-expanded={openMenuKey === `form:${f.id}`}
            aria-haspopup="menu"
            onClick={(e) => {
              e.stopPropagation()
              setClassFormDrag(null)
              setClassFormDropOver(null)
              const k = `form:${f.id}`
              setOpenFormGroupSubmenuFor(null)
              setOpenMenuKey((prev) => (prev === k ? null : k))
            }}
          >
            ⋯
          </button>
          {openMenuKey === `form:${f.id}` && (
            <ul className="form-list__dropdown" role="menu">
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="form-list__dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuKey(null)
                    onSelectForm(f.id)
                    setEditingKey(`form:${f.id}`)
                  }}
                >
                  Renomear
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="form-list__dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuKey(null)
                    onDuplicateForm(f.id)
                  }}
                >
                  Duplicar
                </button>
              </li>
              {hasClassGroupActions ? (
                <li
                  role="none"
                  className="form-list__dropdown-submenu-wrap"
                  data-class-group-submenu-wrap
                  ref={openFormGroupSubmenuFor === f.id ? classGroupSubmenuRowRef : undefined}
                  onMouseEnter={() => setOpenFormGroupSubmenuFor(f.id)}
                  onMouseLeave={() => {
                    setOpenFormGroupSubmenuFor((prev) => (prev === f.id ? null : prev))
                  }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="form-list__dropdown-item form-list__dropdown-item--flyout-trigger"
                    aria-expanded={groupSubOpen}
                    aria-haspopup="menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Grupo
                    <span className="form-list__dropdown-flyout-cue" aria-hidden>
                      ›
                    </span>
                  </button>
                  {groupSubOpen && openFormGroupSubmenuFor === f.id ? (
                    <ul
                      className="form-list__dropdown form-list__dropdown--class-group-flyout"
                      role="menu"
                      data-class-group-flyout
                      style={
                        classGroupFlyoutStyle
                          ? {
                              position: 'fixed',
                              left: classGroupFlyoutStyle.left,
                              top: classGroupFlyoutStyle.top,
                              maxHeight: classGroupFlyoutStyle.maxHeight,
                              overflowY: 'auto',
                              zIndex: 10055,
                            }
                          : {
                              position: 'fixed',
                              left: -9999,
                              top: 0,
                              visibility: 'hidden' as const,
                              pointerEvents: 'none' as const,
                              zIndex: 10055,
                            }
                      }
                    >
                      {assignableGroups.map((g) => (
                        <li key={g.id} role="none">
                          <button
                            type="button"
                            role="menuitem"
                            className="form-list__dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuKey(null)
                              setOpenFormGroupSubmenuFor(null)
                              onAssignFormToClassGroup!(f.id, g.id)
                            }}
                          >
                            {g.name}
                          </button>
                        </li>
                      ))}
                      {assignableGroups.length > 0 ? (
                        <li className="form-list__dropdown-footer-sep" aria-hidden role="presentation" />
                      ) : null}
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="form-list__dropdown-item form-list__dropdown-item--with-leading-icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuKey(null)
                            setOpenFormGroupSubmenuFor(null)
                            setClassGroupDialogFormId(f.id)
                            setClassGroupNameDraft('')
                          }}
                        >
                          <span className="form-list__dropdown-item-icon" aria-hidden>
                            {CLASS_GROUP_ADD_ICON}
                          </span>
                          <span>Adicionar grupo</span>
                        </button>
                      </li>
                      {assignedGid ? (
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            className="form-list__dropdown-item form-list__dropdown-item--with-leading-icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuKey(null)
                              setOpenFormGroupSubmenuFor(null)
                              onAssignFormToClassGroup!(f.id, null)
                            }}
                          >
                            <span className="form-list__dropdown-item-icon" aria-hidden>
                              {CLASS_GROUP_REMOVE_ICON}
                            </span>
                            <span>Remover do grupo</span>
                          </button>
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                </li>
              ) : null}
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="form-list__dropdown-item form-list__dropdown-item--danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuKey(null)
                    setEditingKey(null)
                    onRemoveForm(f.id)
                  }}
                >
                  Deletar
                </button>
              </li>
            </ul>
          )}
        </div>
      </>
    )

    return (
      <li
        key={f.id}
        className={`form-list__item${f.id === activeFormId ? ' form-list__item--active' : ''}${
          canReorder ? ` flow-acc__step${isDragging ? ' flow-acc__step--dragging' : ''}${isDragOver ? ' flow-acc__step--drag-over' : ''}` : ''
        }`}
        onDragOver={
          canReorder && bk != null && fi != null
            ? (e) => handleClassFormDragOver(bk, fi, e)
            : undefined
        }
        onDrop={canReorder && bk != null && fi != null ? (e) => handleClassFormDrop(bk, fi, e) : undefined}
      >
        {canReorder && dragCtx ? (
          <div
            className={`flow-acc__step-btn flow-acc__step-btn--class-form${
              f.id === activeFormId ? ' flow-acc__step-btn--active' : ''
            }`}
          >
            <span
              data-class-form-chrome
              className="acc__drag-handle flow-acc__step-drag"
              draggable
              onDragStart={(e) => handleClassFormDragStart(dragCtx.bucketKey, dragCtx.formIndex, e)}
              onDragEnd={handleClassFormDragEnd}
              onClick={(e) => e.stopPropagation()}
              title="Arrastar para reordenar"
            >
              {STEP_DRAG_HANDLE_ICON}
            </span>
            {formRowBody}
          </div>
        ) : (
          formRowBody
        )}
      </li>
    )
  }

  return (
    <>
    <aside className="form-list">
      <header className="panel-header">
        <h2 className="panel-header__title">{epicName}</h2>
        {headerAction ? <div className="panel-header__actions">{headerAction}</div> : null}
      </header>

      <div
        className={`form-list__tabs-wrap canvas__tabs-wrap${epicScrollNav.overflow ? ' canvas__tabs-wrap--scrollable' : ''}`}
      >
        <button
          type="button"
          className="canvas__tabs-nav canvas__tabs-nav--prev"
          disabled={!epicScrollNav.overflow || !epicScrollNav.canLeft}
          onClick={() => scrollEpicTabs('prev')}
          aria-label="Rolar abas para a esquerda"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden className="canvas__tabs-nav-icon">
            <path
              d="M12 5l-5 5 5 5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div
          className="canvas__tabs-scrollport form-list__tabs-scrollport"
          ref={epicTabsScrollRef}
          onScroll={updateEpicScrollNav}
        >
          <div ref={epicTabsRowRef} className="canvas__tabs form-list__epic-tabs" role="tablist" aria-label="Recursos do épico">
            <button
              type="button"
              role="tab"
              id="epic-list-tab-presentations"
              aria-selected={listTab === 'presentations'}
              aria-controls="epic-list-panel-presentations"
              tabIndex={listTab === 'presentations' ? 0 : -1}
              className={`form-list__epic-tab canvas__tab${listTab === 'presentations' ? ' canvas__tab--active' : ''}`}
              onClick={() => {
                setEditingKey(null)
                setOpenMenuKey(null)
                onListTabChange('presentations')
              }}
            >
              Apresentações
            </button>
            <button
              type="button"
              role="tab"
              id="epic-list-tab-classes"
              aria-selected={listTab === 'classes'}
              aria-controls="epic-list-panel-classes"
              tabIndex={listTab === 'classes' ? 0 : -1}
              className={`form-list__epic-tab canvas__tab${listTab === 'classes' ? ' canvas__tab--active' : ''}`}
              onClick={() => {
                setEditingKey(null)
                setOpenMenuKey(null)
                onListTabChange('classes')
              }}
            >
              Classes
            </button>
            <button
              type="button"
              role="tab"
              id="epic-list-tab-workspaces"
              aria-selected={listTab === 'workspaces'}
              aria-controls="epic-list-panel-workspaces"
              tabIndex={listTab === 'workspaces' ? 0 : -1}
              className={`form-list__epic-tab canvas__tab${listTab === 'workspaces' ? ' canvas__tab--active' : ''}`}
              onClick={() => {
                setEditingKey(null)
                setOpenMenuKey(null)
                onListTabChange('workspaces')
              }}
            >
              Workspaces
            </button>
            <button
              type="button"
              role="tab"
              id="epic-list-tab-portals"
              aria-selected={listTab === 'portals'}
              aria-controls="epic-list-panel-portals"
              tabIndex={listTab === 'portals' ? 0 : -1}
              className={`form-list__epic-tab canvas__tab${listTab === 'portals' ? ' canvas__tab--active' : ''}`}
              onClick={() => {
                setEditingKey(null)
                setOpenMenuKey(null)
                onListTabChange('portals')
              }}
            >
              Portais
            </button>
          </div>
        </div>
        <button
          type="button"
          className="canvas__tabs-nav canvas__tabs-nav--next"
          disabled={!epicScrollNav.overflow || !epicScrollNav.canRight}
          onClick={() => scrollEpicTabs('next')}
          aria-label="Rolar abas para a direita"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden className="canvas__tabs-nav-icon">
            <path
              d="M8 5l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        id="epic-list-panel-presentations"
        role="tabpanel"
        aria-labelledby="epic-list-tab-presentations"
        hidden={listTab !== 'presentations'}
        className="form-list__panel form-list__panel--flows"
      >
        <div className="form-list__flow-scroll">
          <div className="flow-acc-list" role="list">
            {flows.map((f) => {
              const open = openFlowAccIds.has(f.id)
              return (
                <div key={f.id} className={`flow-acc${open ? ' flow-acc--open' : ''}`} role="listitem">
                  <div
                    role="button"
                    tabIndex={0}
                    className="flow-acc__trigger"
                    aria-expanded={open}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('[data-flow-acc-chrome]')) return
                      toggleFlowAccordion(f.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if ((e.target as HTMLElement).closest('[data-flow-acc-chrome]')) return
                        toggleFlowAccordion(f.id)
                      }
                    }}
                  >
                    <span className="flow-acc__chevron" aria-hidden>
                      ›
                    </span>
                    {editingKey === `renameFlow:${f.id}` ? (
                      <input
                        ref={nameInputRef}
                        data-flow-acc-chrome
                        className="form-list__name flow-acc__title-input"
                        value={f.name}
                        onChange={(e) => onRenameFlow(f.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          if (e.key === 'Enter' || e.key === 'Escape') {
                            e.preventDefault()
                            setEditingKey(null)
                          }
                        }}
                        onBlur={() => setEditingKey(null)}
                      />
                    ) : (
                      <span className="flow-acc__title">{f.name}</span>
                    )}
                    <div className="flow-acc__play-and-menu" data-flow-acc-chrome>
                      {f.steps.length > 0 ? (
                        <span
                          className="flow-acc__play"
                          role={onOpenFlowPresentation ? 'button' : undefined}
                          tabIndex={onOpenFlowPresentation ? 0 : undefined}
                          aria-label={
                            onOpenFlowPresentation
                              ? `Abrir apresentação em tela cheia (${f.steps.length} etapa${f.steps.length === 1 ? '' : 's'})`
                              : `${f.steps.length} etapa${f.steps.length === 1 ? '' : 's'}`
                          }
                          onClick={
                            onOpenFlowPresentation
                              ? (e) => {
                                  e.stopPropagation()
                                  onOpenFlowPresentation(f.id)
                                }
                              : undefined
                          }
                          onKeyDown={
                            onOpenFlowPresentation
                              ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    onOpenFlowPresentation(f.id)
                                  }
                                }
                              : undefined
                          }
                        >
                          {FLOW_PRESENTATION_PLAY_ICON}
                        </span>
                      ) : null}
                      <div
                        className="form-list__menu flow-acc__flow-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="form-list__more"
                          aria-label="Mais opções da apresentação"
                          aria-expanded={openMenuKey === `flow:${f.id}`}
                          aria-haspopup="menu"
                          onClick={(e) => {
                            e.stopPropagation()
                            const k = `flow:${f.id}`
                            setOpenMenuKey((prev) => (prev === k ? null : k))
                          }}
                        >
                          ⋯
                        </button>
                      {openMenuKey === `flow:${f.id}` && (
                        <ul className="form-list__dropdown" role="menu">
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              className="form-list__dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuKey(null)
                                setEditingKey(`renameFlow:${f.id}`)
                              }}
                            >
                              Renomear
                            </button>
                          </li>
                          {onExportPresentationViewer ? (
                            <li role="none">
                              <button
                                type="button"
                                role="menuitem"
                                className="form-list__dropdown-item"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuKey(null)
                                  setPresentationExportDialog({ flowId: f.id })
                                  setPresentationExportBasename(defaultExportBasename(f.name))
                                  setPresentationExportOutcome(null)
                                }}
                              >
                                Exportar
                              </button>
                            </li>
                          ) : null}
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              className="form-list__dropdown-item form-list__dropdown-item--danger"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuKey(null)
                                setEditingKey(null)
                                onRemoveFlow(f.id)
                              }}
                            >
                              Deletar
                            </button>
                          </li>
                        </ul>
                      )}
                      </div>
                    </div>
                  </div>
                  {open ? (
                    <div className="flow-acc__panel" id={`flow-acc-panel-${f.id}`}>
                      {f.steps.length === 0 ? (
                        <p className="flow-acc__empty-steps">Nenhuma etapa ainda.</p>
                      ) : (
                        <ul className="flow-acc__steps">
                          {f.steps.map((s, stepIndex) => {
                            const isActive = f.id === activeFlowId && s.id === activeStepId
                            const typeLabel = flowStepTypeDisplayLabel(s)
                            const stepMenuKey = `flowStep:${f.id}:${s.id}`
                            const isDragging =
                              stepDrag?.flowId === f.id && stepDrag?.index === stepIndex
                            const isDragOver =
                              stepDropOver?.flowId === f.id &&
                              stepDropOver?.index === stepIndex &&
                              stepDrag &&
                              stepDrag.flowId === f.id &&
                              stepDrag.index !== stepIndex
                            return (
                              <li
                                key={s.id}
                                className={`flow-acc__step${isDragging ? ' flow-acc__step--dragging' : ''}${isDragOver ? ' flow-acc__step--drag-over' : ''}`}
                                onDragOver={(e) => handleStepDragOver(f.id, stepIndex, e)}
                                onDrop={(e) => handleStepDrop(f.id, stepIndex, e)}
                              >
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className={`flow-acc__step-btn${isActive ? ' flow-acc__step-btn--active' : ''}`}
                                  aria-label={`Etapa ${stepIndex + 1}: ${s.title}, ${typeLabel}`}
                                  aria-pressed={isActive}
                                  onClick={(e) => trySelectFlowStep(e, f.id, s.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      if ((e.target as HTMLElement).closest('[data-flow-step-chrome]')) return
                                      setOpenFlowAccIds((prev) => new Set(prev).add(f.id))
                                      onSelectFlowStep(f.id, s.id)
                                    }
                                  }}
                                >
                                  <span
                                    data-flow-step-chrome
                                    className="acc__drag-handle flow-acc__step-drag"
                                    draggable
                                    onDragStart={(e) => handleStepDragStart(f.id, stepIndex, e)}
                                    onDragEnd={handleStepDragEnd}
                                    onClick={(e) => e.stopPropagation()}
                                    title="Arrastar para reordenar"
                                  >
                                    {STEP_DRAG_HANDLE_ICON}
                                  </span>
                                  <span className="flow-acc__step-num" aria-hidden="true">
                                    {stepIndex + 1}
                                  </span>
                                  <span className="flow-acc__step-main">
                                    {editingKey === `renameFlowStep:${f.id}:${s.id}` ? (
                                      <input
                                        ref={nameInputRef}
                                        data-flow-step-chrome
                                        className="form-list__name flow-acc__step-title-input"
                                        value={s.title}
                                        onChange={(e) => onRenameFlowStep(f.id, s.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                          e.stopPropagation()
                                          if (e.key === 'Enter' || e.key === 'Escape') {
                                            e.preventDefault()
                                            setEditingKey(null)
                                          }
                                        }}
                                        onBlur={() => setEditingKey(null)}
                                        aria-label="Renomear etapa"
                                      />
                                    ) : (
                                      <span className="flow-acc__step-title">{s.title}</span>
                                    )}
                                    <span className="flow-acc__step-type">{typeLabel}</span>
                                  </span>
                                  <div
                                    data-flow-step-chrome
                                    className="form-list__menu flow-acc__step-menu"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      className="form-list__more"
                                      aria-label="Mais opções da etapa"
                                      aria-expanded={openMenuKey === stepMenuKey}
                                      aria-haspopup="menu"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setOpenMenuKey((prev) => (prev === stepMenuKey ? null : stepMenuKey))
                                      }}
                                    >
                                      ⋯
                                    </button>
                                    {openMenuKey === stepMenuKey && (
                                      <ul className="form-list__dropdown" role="menu">
                                        <li role="none">
                                          <button
                                            type="button"
                                            role="menuitem"
                                            className="form-list__dropdown-item"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setOpenMenuKey(null)
                                              setEditingKey(`renameFlowStep:${f.id}:${s.id}`)
                                            }}
                                          >
                                            Renomear
                                          </button>
                                        </li>
                                        <li role="none">
                                          <button
                                            type="button"
                                            role="menuitem"
                                            className="form-list__dropdown-item form-list__dropdown-item--danger"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setOpenMenuKey(null)
                                              setEditingKey(null)
                                              onRemoveFlowStep(f.id, s.id)
                                            }}
                                          >
                                            Deletar
                                          </button>
                                        </li>
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                      <button type="button" className="flow-acc__add-step" onClick={() => onAddFlowStep(f.id)}>
                        + Nova etapa
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        {flows.length === 0 && <p className="form-list__empty">Nenhuma apresentação</p>}

        <button type="button" className="form-list__add" onClick={onAddFlow}>
          + Nova apresentação
        </button>
      </div>

      <div
        id="epic-list-panel-classes"
        role="tabpanel"
        aria-labelledby="epic-list-tab-classes"
        hidden={listTab !== 'classes'}
        className={`form-list__panel${groupedClassUi ? ' form-list__panel--flows' : ''}`}
      >
        {groupedClassUi ? (
          <div className="form-list__flow-scroll">
            <div className="flow-acc-list" role="list">
              {rootClassGroups.map((g) => (
                <div key={g.id} role="listitem">
                  {renderClassGroupNode(g, false)}
                </div>
              ))}
              {ungroupedClassForms.length > 0 ? (
                <div
                  className={`flow-acc${openClassAccIds.has(EPIC_CLASS_UNGROUPED_ORDER_KEY) ? ' flow-acc--open' : ''}`}
                  role="listitem"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    className="flow-acc__trigger"
                    aria-expanded={openClassAccIds.has(EPIC_CLASS_UNGROUPED_ORDER_KEY)}
                    onClick={() => toggleClassAccordion(EPIC_CLASS_UNGROUPED_ORDER_KEY)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleClassAccordion(EPIC_CLASS_UNGROUPED_ORDER_KEY)
                      }
                    }}
                  >
                    <span className="flow-acc__chevron" aria-hidden>
                      ›
                    </span>
                    <span className="flow-acc__title">Sem grupo</span>
                  </div>
                  {openClassAccIds.has(EPIC_CLASS_UNGROUPED_ORDER_KEY) ? (
                    <div className="flow-acc__panel" id="class-acc-panel-ungrouped">
                      <ul className="form-list__items form-list__items--class-acc">
                        {ungroupedClassForms.map((cf, idx) =>
                          renderClassFormRow(cf, {
                            bucketKey: EPIC_CLASS_UNGROUPED_ORDER_KEY,
                            formIndex: idx,
                          }),
                        )}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <ul className="form-list__items">{forms.map((f) => renderClassFormRow(f))}</ul>
        )}

        {forms.length === 0 && <p className="form-list__empty">Nenhuma classe</p>}

        <button type="button" className="form-list__add" onClick={onAddForm}>
          + Nova classe
        </button>
      </div>

      <div
        id="epic-list-panel-workspaces"
        role="tabpanel"
        aria-labelledby="epic-list-tab-workspaces"
        hidden={listTab !== 'workspaces'}
        className="form-list__panel"
      >
        <ul className="form-list__items">
          {workspaces.map((w) => (
            <li
              key={w.id}
              className={`form-list__item ${w.id === activeWorkspaceId ? 'form-list__item--active' : ''}`}
            >
              <div
                className="form-list__card"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setOpenMenuKey(null)
                  onSelectWorkspace(w.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setOpenMenuKey(null)
                    onSelectWorkspace(w.id)
                  }
                }}
              >
                {editingKey === `workspace:${w.id}` ? (
                  <input
                    ref={nameInputRef}
                    className="form-list__name"
                    value={w.name}
                    onChange={(e) => onRenameWorkspace(w.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        e.preventDefault()
                        setEditingKey(null)
                      }
                    }}
                    onBlur={() => setEditingKey(null)}
                  />
                ) : (
                  <span className="form-list__name-text">{w.name || w.id}</span>
                )}
              </div>
              <div className="form-list__menu">
                <button
                  type="button"
                  className="form-list__more"
                  aria-label="Mais opções"
                  aria-expanded={openMenuKey === `workspace:${w.id}`}
                  aria-haspopup="menu"
                  onClick={(e) => {
                    e.stopPropagation()
                    const k = `workspace:${w.id}`
                    setOpenMenuKey((prev) => (prev === k ? null : k))
                  }}
                >
                  ⋯
                </button>
                {openMenuKey === `workspace:${w.id}` && (
                  <ul className="form-list__dropdown" role="menu">
                    <li role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="form-list__dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuKey(null)
                          onSelectWorkspace(w.id)
                          setEditingKey(`workspace:${w.id}`)
                        }}
                      >
                        Editar
                      </button>
                    </li>
                    <li role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="form-list__dropdown-item form-list__dropdown-item--danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuKey(null)
                          setEditingKey(null)
                          onRemoveWorkspace(w.id)
                        }}
                      >
                        Deletar
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>

        {workspaces.length === 0 && <p className="form-list__empty">Nenhum workspace</p>}

        <button type="button" className="form-list__add" onClick={onAddWorkspace}>
          + Novo workspace
        </button>
      </div>

      <div
        id="epic-list-panel-portals"
        role="tabpanel"
        aria-labelledby="epic-list-tab-portals"
        hidden={listTab !== 'portals'}
        className="form-list__panel"
      >
        <ul className="form-list__items">
          {portals.map((p) => (
            <li
              key={p.id}
              className={`form-list__item ${p.id === activePortalId ? 'form-list__item--active' : ''}`}
            >
              <div
                className="form-list__card"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setOpenMenuKey(null)
                  onSelectPortal(p.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setOpenMenuKey(null)
                    onSelectPortal(p.id)
                  }
                }}
              >
                {editingKey === `portal:${p.id}` ? (
                  <input
                    ref={nameInputRef}
                    className="form-list__name"
                    value={p.name}
                    onChange={(e) => onRenamePortal(p.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        e.preventDefault()
                        setEditingKey(null)
                      }
                    }}
                    onBlur={() => setEditingKey(null)}
                  />
                ) : (
                  <span className="form-list__name-text">{p.name || p.id}</span>
                )}
              </div>
              <div className="form-list__menu">
                <button
                  type="button"
                  className="form-list__more"
                  aria-label="Mais opções"
                  aria-expanded={openMenuKey === `portal:${p.id}`}
                  aria-haspopup="menu"
                  onClick={(e) => {
                    e.stopPropagation()
                    const k = `portal:${p.id}`
                    setOpenMenuKey((prev) => (prev === k ? null : k))
                  }}
                >
                  ⋯
                </button>
                {openMenuKey === `portal:${p.id}` && (
                  <ul className="form-list__dropdown" role="menu">
                    <li role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="form-list__dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuKey(null)
                          onSelectPortal(p.id)
                          setEditingKey(`portal:${p.id}`)
                        }}
                      >
                        Editar
                      </button>
                    </li>
                    <li role="none">
                      <button
                        type="button"
                        role="menuitem"
                        className="form-list__dropdown-item form-list__dropdown-item--danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuKey(null)
                          setEditingKey(null)
                          onRemovePortal(p.id)
                        }}
                      >
                        Deletar
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>

        {portals.length === 0 && <p className="form-list__empty">Nenhum portal</p>}

        <button type="button" className="form-list__add" onClick={onAddPortal}>
          + Novo portal
        </button>
      </div>
    </aside>

    {presentationExportDialog && onExportPresentationViewer ? (
      <div className="form-list__export-overlay" role="presentation">
        <div
          className="form-list__export-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={
            presentationExportOutcome ? 'presentation-export-result-title' : 'presentation-export-title'
          }
          onClick={(e) => e.stopPropagation()}
        >
          {presentationExportOutcome ? (
            <>
              <h3 id="presentation-export-result-title" className="form-list__export-title">
                Exportação concluída
              </h3>
              {presentationExportOutcome.kind === 'saved-in-project' ? (
                <>
                  <p className="form-list__export-result-lead">
                    O arquivo JSON foi salvo no projeto em:
                  </p>
                  <p className="form-list__export-path-wrap">
                    <code className="form-list__export-path">
                      {presentationExportOutcome.relativePath.replace(/\\/g, '/')}
                    </code>
                  </p>
                </>
              ) : (
                <>
                  <p className="form-list__export-result-lead">
                    {presentationExportOutcome.reason
                      ? `Não foi possível gravar no projeto (${presentationExportOutcome.reason}). `
                      : null}
                    O arquivo foi baixado pelo navegador como{' '}
                    <code className="form-list__export-path-inline">
                      {presentationExportOutcome.filename}
                    </code>{' '}
                    (em geral na pasta de Downloads). Para gerar o ZIP, mova esse arquivo para a
                    pasta <code className="form-list__export-path-inline">exports/presentations/</code>{' '}
                    na raiz do projeto, mantendo o nome{' '}
                    <code className="form-list__export-path-inline">
                      {presentationExportOutcome.filename}
                    </code>
                    .
                  </p>
                </>
              )}
              <h4 className="form-list__export-steps-title">Passo a passo para gerar o ZIP</h4>
              <ol className="form-list__export-steps">
                <li>
                  Abra o terminal na raiz do projeto (a pasta onde está o arquivo{' '}
                  <code>package.json</code>).
                </li>
                <li>
                  Copie o primeiro comando abaixo, cole no terminal e pressione Enter. Aguarde o build
                  terminar.
                </li>
                <li>
                  Copie o segundo comando abaixo, cole no terminal e pressione Enter. Será gerado
                  um arquivo ZIP na pasta <code>exports/zips/</code>, com o mesmo nome base do JSON
                  (pacote estático pronto para publicar, por exemplo na Netlify).
                </li>
              </ol>
              <PresentationExportCopyCmd label="Comando 1 — compilar o viewer" command="npm run build" />
              <PresentationExportCopyCmd
                label="Comando 2 — montar o ZIP"
                command={`npm run zip:presentation -- ./${
                  presentationExportOutcome.kind === 'saved-in-project'
                    ? presentationExportOutcome.relativePath.replace(/\\/g, '/')
                    : `exports/presentations/${presentationExportOutcome.filename}`
                }`}
              />
              <p className="form-list__export-zip-note">
                Saída do segundo comando (na raiz do projeto):{' '}
                <code>{presentationExportZipRelativePath(presentationExportOutcome)}</code>
              </p>
              <div className="form-list__export-actions form-list__export-actions--solo">
                <button
                  type="button"
                  className="form-list__export-submit"
                  onClick={closePresentationExportDialog}
                >
                  Fechar
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 id="presentation-export-title" className="form-list__export-title">
                Exportar apresentação
              </h3>
              <p className="form-list__export-hint">
                Nome do arquivo (sem extensão; será gravado como .json). Letras acentuadas e
                caracteres especiais são normalizados ao confirmar.
              </p>
              <form
                className="form-list__export-form"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const base = sanitizeExportBasename(presentationExportBasename)
                  setPresentationExportBusy(true)
                  try {
                    const out = await onExportPresentationViewer(presentationExportDialog.flowId, base)
                    if (out == null) {
                      closePresentationExportDialog()
                      return
                    }
                    setPresentationExportOutcome(out)
                  } finally {
                    setPresentationExportBusy(false)
                  }
                }}
              >
                <label className="form-list__export-label" htmlFor="presentation-export-filename">
                  Nome do arquivo
                </label>
                <input
                  id="presentation-export-filename"
                  className="form-list__export-input"
                  type="text"
                  value={presentationExportBasename}
                  onChange={(e) => setPresentationExportBasename(e.target.value)}
                  autoComplete="off"
                  autoFocus
                  disabled={presentationExportBusy}
                />
                <div className="form-list__export-actions">
                  <button
                    type="button"
                    className="form-list__export-cancel"
                    disabled={presentationExportBusy}
                    onClick={closePresentationExportDialog}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="form-list__export-submit"
                    disabled={presentationExportBusy}
                  >
                    {presentationExportBusy ? 'Exportando…' : 'Exportar'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    ) : null}

    {classGroupDialogFormId && onCreateClassGroupAndAssign ? (
      <div
        className="form-list__export-overlay"
        role="presentation"
        onClick={() => {
          setClassGroupDialogFormId(null)
          setClassGroupNameDraft('')
        }}
      >
        <div
          className="form-list__export-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="class-group-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="class-group-dialog-title" className="form-list__export-title">
            Novo grupo
          </h3>
          <p className="form-list__export-hint">
            Defina um nome para o grupo; a classe atual será colocada nele.
          </p>
          <form
            className="form-list__export-form"
            onSubmit={(e) => {
              e.preventDefault()
              const name = classGroupNameDraft.trim()
              if (!name || !classGroupDialogFormId) return
              onCreateClassGroupAndAssign(classGroupDialogFormId, name)
              setClassGroupDialogFormId(null)
              setClassGroupNameDraft('')
            }}
          >
            <label className="form-list__export-label" htmlFor="class-group-name-input">
              Nome do grupo
            </label>
            <input
              id="class-group-name-input"
              className="form-list__export-input"
              type="text"
              value={classGroupNameDraft}
              onChange={(e) => setClassGroupNameDraft(e.target.value)}
              autoComplete="off"
              autoFocus
            />
            <div className="form-list__export-actions">
              <button
                type="button"
                className="form-list__export-cancel"
                onClick={() => {
                  setClassGroupDialogFormId(null)
                  setClassGroupNameDraft('')
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="form-list__export-submit"
                disabled={!classGroupNameDraft.trim()}
              >
                Criar e atribuir
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null}
    </>
  )
}
