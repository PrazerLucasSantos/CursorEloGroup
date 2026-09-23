import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormDef, FormExampleValuePreset, WorkspaceDef, WorkspacePackage } from '../../types'
import { formHighlightRowsFromExamplePreset } from '../../utils/formExamplePresets'
import { PRESET_ICON_COLOR_CHOICES, resolvePresetIconBackground } from '../../utils/presetIconColor'
import { findFormById, formIdentityTitleLines } from '../../utils/linkedForm'
import { workspaceMethodNavKey } from '../../utils/flowStep'
import { workspaceExplorerCssVars } from '../../utils/workspaceExplorerTheme'
import { FORM_NEN_ANALISE_DECISAO } from '../../utils/nenAnaliseDecisaoMethods'
import { isDemandaLiveForm, livePresetsFromDemandas } from '../../utils/demandaAtlasLive'
import { useDemandasShared } from '../../shared/demandaSharedStore'
import {
  formatFormHighlightTagText,
  splitHighlightRowsIntoTags,
} from '../../utils/formHighlightTags'
import FormCanvas from '../FormCanvas'
import WorkspaceNotificationPanel from './WorkspaceNotificationPanel'
import { WORKSPACE_NOTIFICATION_SAMPLES, type WorkspaceNotificationItem } from './workspaceNotificationSamples'
import './workspaceExplorer.css'

interface Props {
  workspace: WorkspaceDef
  /** Formulários do épico (resolver `linkedFormId` e presets de exemplo). */
  epicForms: FormDef[]
  onChange?: (patch: Partial<WorkspaceDef>) => void
  /** Preview de etapa workspace: navegação ao clicar num método (modo leitura do formulário). */
  workspaceMethodNavigate?: {
    targetsByMethodKey: Record<string, string>
    onNavigateToStep: (stepId: string) => void
  }
}

const HANDLE_PX = 5
const DEF_PACKAGES_W = 220
const DEF_OBJECTS_W = 280
/** Largura mínima da coluna «pacotes» */
const MIN_PACKAGES_W = 140
/** Largura mínima da coluna «objetos» */
const MIN_OBJECTS_W = 160
/** Largura mínima reservada para «detalhes» (coluna flex) */
const MIN_DETAIL_W = 120

function filterPackagesBySearch(packages: WorkspacePackage[], q: string): WorkspacePackage[] {
  const t = q.trim().toLowerCase()
  if (!t) return packages
  return packages
    .map((pkg) => {
      const pkgMatch = pkg.name.toLowerCase().includes(t)
      const classes = pkg.classes ?? []
      const clsFiltered = classes.filter((c) => c.name.toLowerCase().includes(t))
      if (pkgMatch) return pkg
      if (clsFiltered.length > 0) return { ...pkg, classes: clsFiltered }
      return null
    })
    .filter((x): x is WorkspacePackage => x != null)
}

function mainInnerWidthPx(mainEl: HTMLDivElement | null): number {
  if (!mainEl) return 800
  const r = mainEl.getBoundingClientRect()
  const cs = getComputedStyle(mainEl)
  const pl = parseFloat(cs.paddingLeft) || 0
  const pr = parseFloat(cs.paddingRight) || 0
  return Math.max(0, r.width - pl - pr)
}

type ObjectListingCardModel = {
  key: string
  form: FormDef
  preset: FormExampleValuePreset
  pkgName: string
  clsName: string
}

type ObjectListingClassGroup = {
  groupKey: string
  pkgName: string
  clsName: string
  cards: ObjectListingCardModel[]
}

/** Classe selecionada na árvore de pacotes (filtra a coluna de objetos). */
type ActiveClassSelection = { packageId: string; classId: string }

function mergeLiveDemandaPresets(
  form: FormDef,
  demandas: import('../../portalCliente/portalClienteDemandaData').Demanda[],
): FormDef {
  if (!isDemandaLiveForm(form.id)) return form
  const live = livePresetsFromDemandas(demandas, form.id)
  if (!live.length) return form
  const liveIds = new Set(live.map((p) => p.id))
  const staticP = (form.exampleValuePresets ?? []).filter((p) => !liveIds.has(p.id))
  return { ...form, exampleValuePresets: [...live, ...staticP] }
}

function collectObjectListingGroups(
  workspace: WorkspaceDef,
  epicForms: FormDef[],
  demandas: import('../../portalCliente/portalClienteDemandaData').Demanda[] = [],
): ObjectListingClassGroup[] {
  const out: ObjectListingClassGroup[] = []
  for (const pkg of workspace.packages ?? []) {
    for (const cls of pkg.classes ?? []) {
      if (!cls.linkedFormId) continue
      const raw = findFormById(epicForms, cls.linkedFormId)
      if (!raw) continue
      const form = mergeLiveDemandaPresets(raw, demandas)
      const allPresets = form.exampleValuePresets ?? []
      if (allPresets.length === 0) continue
      const ids = cls.linkedFormExamplePresetIds
      const chosen: FormExampleValuePreset[] =
        ids === undefined
          ? [...allPresets]
          : ids
              .map((id) => allPresets.find((p) => p.id === id))
              .filter((p): p is FormExampleValuePreset => p != null)
      if (chosen.length === 0) continue
      const pkgName = (pkg.name || 'Pacote').trim() || 'Pacote'
      const clsName = (cls.name || 'Classe').trim() || 'Classe'
      out.push({
        groupKey: `${pkg.id}::${cls.id}`,
        pkgName,
        clsName,
        cards: chosen.map((preset) => ({
          key: `${pkg.id}::${cls.id}::${preset.id}`,
          form,
          preset,
          pkgName,
          clsName,
        })),
      })
    }
  }
  return out
}

function findObjectListingCard(
  objectListingGroups: ObjectListingClassGroup[],
  key: string,
): ObjectListingCardModel | null {
  for (const g of objectListingGroups) {
    const c = g.cards.find((x) => x.key === key)
    if (c) return c
  }
  return null
}

function objectCardSearchBlob(card: ObjectListingCardModel): string {
  const idLines = formIdentityTitleLines(card.form, {
    nestedFormId: card.form.id,
    canvasAncestors: [],
    examplePreset: card.preset,
  }).join(' ')
  const hl = formHighlightRowsFromExamplePreset(card.form, card.preset)
    .map((r) => `${r.label} ${r.value}`)
    .join(' ')
  const presetName = (card.preset.name || '').trim()
  return `${idLines} ${hl} ${card.clsName} ${card.pkgName} ${presetName}`.toLowerCase()
}

function WorkspaceObjectExampleCard({
  form,
  preset,
  isSelected,
  onActivate,
  fieldValueOverrides,
}: {
  form: FormDef
  preset: FormExampleValuePreset
  isSelected: boolean
  onActivate: () => void
  /** Valores do atendimento atualizados por métodos (ex.: status). */
  fieldValueOverrides?: Record<string, string>
}) {
  const avatarBg = resolvePresetIconBackground(preset)
  const effectivePreset = useMemo((): FormExampleValuePreset => {
    if (!fieldValueOverrides || Object.keys(fieldValueOverrides).length === 0) return preset
    return {
      ...preset,
      fieldValues: {
        ...(preset.fieldValues ?? {}),
        ...fieldValueOverrides,
      },
    }
  }, [preset, fieldValueOverrides])
  const identityLines = useMemo(
    () =>
      formIdentityTitleLines(form, {
        nestedFormId: form.id,
        canvasAncestors: [],
        examplePreset: effectivePreset,
      }),
    [form, effectivePreset],
  )
  const highlightRows = useMemo(
    () => formHighlightRowsFromExamplePreset(form, effectivePreset),
    [form, effectivePreset],
  )
  const { tags: tagRows, textRows: textHighlightRows } = useMemo(
    () => splitHighlightRowsIntoTags(form, highlightRows),
    [form, highlightRows],
  )
  const identitySingleLine = identityLines.length === 1
  return (
    <button
      type="button"
      className={`workspace-explorer__object-card${isSelected ? ' workspace-explorer__object-card--active' : ''}`}
      aria-current={isSelected ? 'true' : undefined}
      onClick={onActivate}
    >
      <div className="canvas__form-read-identity-wrap workspace-explorer__object-card__read">
        <div
          className={`canvas__form-read-identity${identitySingleLine ? ' canvas__form-read-identity--single-line' : ''}`}
        >
          <span
            className="canvas__form-read-identity-avatar canvas__form-read-identity-avatar--gloss"
            style={{ background: avatarBg }}
            aria-hidden
          />
          <div className="canvas__form-read-identity-text" aria-label={identityLines.join(', ')}>
            {identityLines.map((line, i) => (
              <span
                key={`${i}:${line}`}
                className={`canvas__form-read-identity-line${i === 0 ? ' canvas__form-read-identity-line--primary' : ' canvas__form-read-identity-line--subtitle'}`}
              >
                {line}
              </span>
            ))}
          </div>
        </div>
        {tagRows.length > 0 ? (
          <div className="workspace-explorer__object-card__tags" role="list" aria-label="Tags">
            {tagRows.map((tag) => (
              <span
                key={tag.id}
                className={`workspace-explorer__object-tag workspace-explorer__object-tag--${tag.tone}`}
                role="listitem"
                title={`${tag.label}: ${tag.value}`}
              >
                <span className="material-symbols-outlined workspace-explorer__object-tag-icon" aria-hidden>
                  {tag.tone === 'success'
                    ? 'check_circle'
                    : tag.tone === 'danger'
                      ? 'cancel'
                      : tag.tone === 'consumo' || tag.tone === 'suporte'
                        ? 'category'
                        : 'info'}
                </span>
                <span className="workspace-explorer__object-tag-text">
                  {formatFormHighlightTagText(tag.label, tag.value)}
                </span>
              </span>
            ))}
          </div>
        ) : null}
        {textHighlightRows.length > 0 ? (
          <div className="canvas__form-read-highlight" role="region" aria-label="Campos em destaque">
            {textHighlightRows.map((row) => (
              <div key={row.id} className="canvas__form-read-highlight-row">
                <span className="canvas__form-read-highlight-key">{row.label}</span>
                <span className="canvas__form-read-highlight-sep" aria-hidden>
                  :
                </span>
                <span className="canvas__form-read-highlight-val">{row.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  )
}

export default function WorkspaceExplorer({ workspace, epicForms, workspaceMethodNavigate }: Props) {
  const mainRef = useRef<HTMLDivElement>(null)
  const pkgSearchInputRef = useRef<HTMLInputElement>(null)
  const objSearchInputRef = useRef<HTMLInputElement>(null)
  const [packagesW, setPackagesW] = useState(DEF_PACKAGES_W)
  const [objectsW, setObjectsW] = useState(DEF_OBJECTS_W)
  const [pkgSearch, setPkgSearch] = useState('')
  const [objSearch, setObjSearch] = useState('')
  const [expandedPkgs, setExpandedPkgs] = useState<Record<string, boolean>>({})
  const [activeClass, setActiveClass] = useState<ActiveClassSelection | null>(null)
  /** Objeto (cenário) selecionado na listagem; o painel de detalhe só muda com novo clique aqui, não com a classe ativa. */
  const [activeObjectKey, setActiveObjectKey] = useState<string | null>(null)
  /** Patches de atendimento por objeto (métodos da Análise atualizam status no card). */
  const [attendanceFieldOverrides, setAttendanceFieldOverrides] = useState<
    Record<string, Record<string, string>>
  >({})
  const [dragging, setDragging] = useState<'packages' | 'objects' | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifTab, setNotifTab] = useState<'notifications' | 'alerts'>('notifications')
  const [notifItems, setNotifItems] = useState<WorkspaceNotificationItem[]>(() => [
    ...WORKSPACE_NOTIFICATION_SAMPLES,
  ])
  const [demandas] = useDemandasShared()
  const [methodToast, setMethodToast] = useState<string | null>(null)
  const notifWrapRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({
    clientX: 0,
    packagesW: DEF_PACKAGES_W,
    objectsW: DEF_OBJECTS_W,
  })

  const unreadNotifCount = useMemo(() => notifItems.filter((i) => !i.read).length, [notifItems])

  useEffect(() => {
    if (!notifOpen) return
    const onDocPointer = (e: PointerEvent) => {
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotifOpen(false)
    }
    document.addEventListener('pointerdown', onDocPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDocPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [notifOpen])

  const onPackagesHandleDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      dragStartRef.current = { clientX: e.clientX, packagesW, objectsW }
      setDragging('packages')
    },
    [packagesW, objectsW],
  )

  const onObjectsHandleDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      dragStartRef.current = { clientX: e.clientX, packagesW, objectsW }
      setDragging('objects')
    },
    [packagesW, objectsW],
  )

  useEffect(() => {
    if (!dragging) return

    const onMove = (e: PointerEvent) => {
      const inner = mainInnerWidthPx(mainRef.current)
      const chrome = 2 * HANDLE_PX
      const dx = e.clientX - dragStartRef.current.clientX

      if (dragging === 'packages') {
        const maxP = inner - chrome - MIN_OBJECTS_W - MIN_DETAIL_W
        const raw = dragStartRef.current.packagesW + dx
        const next = Math.round(
          Math.min(Math.max(MIN_PACKAGES_W, raw), Math.max(MIN_PACKAGES_W, maxP)),
        )
        setPackagesW(next)
      } else {
        const pkg = dragStartRef.current.packagesW
        const maxO = inner - chrome - pkg - MIN_DETAIL_W
        const raw = dragStartRef.current.objectsW + dx
        const next = Math.round(
          Math.min(Math.max(MIN_OBJECTS_W, raw), Math.max(MIN_OBJECTS_W, maxO)),
        )
        setObjectsW(next)
      }
    }

    const onUp = () => {
      setDragging(null)
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
    }
  }, [dragging])

  useEffect(() => {
    const next: Record<string, boolean> = {}
    ;(workspace.packages ?? []).forEach((p) => {
      next[p.id] = true
    })
    setExpandedPkgs(next)
    setPkgSearch('')
    setObjSearch('')
    setActiveClass(null)
    setActiveObjectKey(null)
  }, [workspace.id])

  useEffect(() => {
    if (!activeClass) return
    const pkg = (workspace.packages ?? []).find((p) => p.id === activeClass.packageId)
    const cls = pkg?.classes?.find((c) => c.id === activeClass.classId)
    if (!pkg || !cls) setActiveClass(null)
  }, [workspace.packages, activeClass])

  useEffect(() => {
    setExpandedPkgs((prev) => {
      let changed = false
      const copy = { ...prev }
      for (const p of workspace.packages ?? []) {
        if (copy[p.id] === undefined) {
          copy[p.id] = true
          changed = true
        }
      }
      return changed ? copy : prev
    })
  }, [workspace.packages])

  const objectListingGroups = useMemo(
    () => collectObjectListingGroups(workspace, epicForms, demandas),
    [workspace, epicForms, demandas],
  )

  useEffect(() => {
    if (!methodToast) return
    const t = window.setTimeout(() => setMethodToast(null), 4200)
    return () => window.clearTimeout(t)
  }, [methodToast])

  useEffect(() => {
    if (!activeObjectKey) return
    const found = findObjectListingCard(objectListingGroups, activeObjectKey)
    if (!found) setActiveObjectKey(null)
  }, [objectListingGroups, activeObjectKey])

  const groupsScopedToActiveClass = useMemo(() => {
    if (!activeClass) return []
    const k = `${activeClass.packageId}::${activeClass.classId}`
    return objectListingGroups.filter((g) => g.groupKey === k)
  }, [objectListingGroups, activeClass])

  const filteredObjectGroups = useMemo(() => {
    const q = objSearch.trim().toLowerCase()
    const base = groupsScopedToActiveClass
    if (!q) return base
    return base
      .map((g) => ({
        ...g,
        cards: g.cards.filter((c) => objectCardSearchBlob(c).includes(q)),
      }))
      .filter((g) => g.cards.length > 0)
  }, [groupsScopedToActiveClass, objSearch])

  const flatFilteredObjectCards = useMemo(
    () => filteredObjectGroups.flatMap((g) => g.cards),
    [filteredObjectGroups],
  )

  /** Texto do header cinza da listagem: «Classe: N itens» (com classe selecionada em Pacotes). */
  const objectsPanelHeaderLabel = useMemo(() => {
    const n = flatFilteredObjectCards.length
    const itemWord = n === 1 ? 'item' : 'itens'
    if (!activeClass) {
      return 'Objetos'
    }
    const pkg = workspace.packages?.find((p) => p.id === activeClass.packageId)
    const cls = pkg?.classes?.find((c) => c.id === activeClass.classId)
    const name = (cls?.name?.trim() || 'Classe').trim() || 'Classe'
    return `${name}: ${n} ${itemWord}`
  }, [activeClass, workspace.packages, flatFilteredObjectCards.length])

  const detailFormView = useMemo((): { form: FormDef; remountKey: string; isAnalise: boolean } | null => {
    if (!activeObjectKey) return null
    const c = findObjectListingCard(objectListingGroups, activeObjectKey)
    if (!c) return null
    const overrides = attendanceFieldOverrides[activeObjectKey]
    let form: FormDef = { ...c.form, activeExamplePresetId: c.preset.id }
    if (overrides && Object.keys(overrides).length > 0) {
      form = {
        ...form,
        exampleValuePresets: (form.exampleValuePresets ?? []).map((p) =>
          p.id !== c.preset.id
            ? p
            : {
                ...p,
                fieldValues: {
                  ...(p.fieldValues ?? {}),
                  ...overrides,
                },
              },
        ),
      }
    }
    return {
      form,
      remountKey: c.key,
      isAnalise: c.form.id === FORM_NEN_ANALISE_DECISAO,
    }
  }, [objectListingGroups, activeObjectKey, attendanceFieldOverrides])

  const onAnaliseMethodApplied = useCallback(
    (info: {
      methodId: string
      fieldPatches: Record<string, string>
      preferSectionId?: string
      toast?: string
    }) => {
      if (info.toast) setMethodToast(info.toast)
      if (!activeObjectKey || !info.fieldPatches || Object.keys(info.fieldPatches).length === 0) return
      setAttendanceFieldOverrides((prev) => ({
        ...prev,
        [activeObjectKey]: {
          ...(prev[activeObjectKey] ?? {}),
          ...info.fieldPatches,
        },
      }))
    },
    [activeObjectKey],
  )

  const filteredPackages = useMemo(
    () => filterPackagesBySearch(workspace.packages ?? [], pkgSearch),
    [workspace.packages, pkgSearch],
  )

  function togglePkgExpanded(id: string) {
    setExpandedPkgs((prev) => {
      const isOpen = prev[id] !== false
      return { ...prev, [id]: !isOpen }
    })
  }

  const headerTitle = (workspace.name?.trim() || 'Workspace').trim()
  return (
    <div
      className="workspace-explorer"
      style={workspaceExplorerCssVars(workspace)}
      role="application"
      aria-label="Workspace Explorer"
    >
      <header className="workspace-explorer__topbar">
        <div className="workspace-explorer__topbar-left">
          <button type="button" className="workspace-explorer__topbar-menu" aria-label="Menu">
            {/* SVG em vez de ligature Material: o glifo «menu» fica alto na caixa-em e desalinha do texto */}
            <svg className="workspace-explorer__topbar-menu-svg" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M4 7h16M4 12h16M4 17h16"
              />
            </svg>
          </button>
          <h1 className="workspace-explorer__topbar-title">{headerTitle}</h1>
        </div>
        <div className="workspace-explorer__topbar-right">
          <button type="button" className="workspace-explorer__topbar-icon" aria-label="Novo">
            <span className="material-symbols-outlined" aria-hidden>
              add
            </span>
          </button>
          <button type="button" className="workspace-explorer__topbar-icon" aria-label="Favoritos">
            <span className="material-symbols-outlined" aria-hidden>
              star
            </span>
          </button>
          <div className="workspace-explorer__bell-wrap" ref={notifWrapRef}>
            <button
              type="button"
              className={`workspace-explorer__topbar-icon${notifOpen ? ' workspace-explorer__topbar-icon--active' : ''}`}
              aria-label={
                unreadNotifCount > 0
                  ? `Notificações, ${unreadNotifCount} não lidas`
                  : 'Notificações'
              }
              aria-expanded={notifOpen}
              aria-haspopup="dialog"
              onClick={() => setNotifOpen((o) => !o)}
            >
              <span className="material-symbols-outlined" aria-hidden>
                notifications
              </span>
            </button>
            {unreadNotifCount > 0 ? (
              <span className="workspace-explorer__bell-badge" aria-hidden>
                {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
              </span>
            ) : null}
            {notifOpen ? (
              <WorkspaceNotificationPanel
                items={notifItems}
                activeTab={notifTab}
                onTabChange={setNotifTab}
                onMarkAllRead={() => setNotifItems((prev) => prev.map((i) => ({ ...i, read: true })))}
                onClearAll={() => {
                  const kind = notifTab === 'alerts' ? 'alert' : 'notification'
                  setNotifItems((prev) => prev.filter((i) => i.kind !== kind))
                }}
                onToggleRead={(id) =>
                  setNotifItems((prev) =>
                    prev.map((i) => (i.id === id ? { ...i, read: !i.read } : i)),
                  )
                }
                onDismiss={(id) => setNotifItems((prev) => prev.filter((i) => i.id !== id))}
              />
            ) : null}
          </div>
          <span
            className="workspace-explorer__topbar-avatar canvas__form-read-identity-avatar canvas__form-read-identity-avatar--gloss"
            style={{ background: resolvePresetIconBackground(undefined) }}
            title="Usuário"
            aria-label="Usuário"
            role="img"
          />
        </div>
      </header>

      <div ref={mainRef} className="workspace-explorer__main">
        <section
          className="workspace-explorer__pane workspace-explorer__pane--packages"
          style={{ flex: `0 0 ${packagesW}px` }}
          aria-label="Pacotes do workspace"
        >
          <div className="workspace-explorer__packages-shell">
            <header
              className="panel-header workspace-explorer__packages-panel-header"
              role="region"
              aria-label="Ações da listagem de pacotes"
            >
              <div className="panel-header__actions workspace-explorer__packages-panel-header-actions">
                <button
                  type="button"
                  className="workspace-explorer__chrome-icon-btn"
                  aria-label="Limpar busca e reabrir pacotes"
                  onClick={() => {
                    setPkgSearch('')
                    const next: Record<string, boolean> = {}
                    ;(workspace.packages ?? []).forEach((p) => {
                      next[p.id] = true
                    })
                    setExpandedPkgs(next)
                  }}
                >
                  <span className="material-symbols-outlined workspace-explorer__chrome-refresh-icon" aria-hidden>
                    refresh
                  </span>
                </button>
                <button type="button" className="workspace-explorer__chrome-icon-btn" aria-label="Expandir vista">
                  <span className="material-symbols-outlined workspace-explorer__chrome-expand-icon" aria-hidden>
                    web_asset
                  </span>
                </button>
              </div>
            </header>
            <div className="workspace-explorer__packages-search-strip">
              <div className="workspace-explorer__packages-search-track">
                <div className="workspace-explorer__packages-search-field">
                  <span className="material-symbols-outlined workspace-explorer__packages-search-lead" aria-hidden>
                    search
                  </span>
                  <input
                    ref={pkgSearchInputRef}
                    type="search"
                    className="workspace-explorer__packages-search-input"
                    placeholder="Buscar"
                    value={pkgSearch}
                    onChange={(e) => setPkgSearch(e.target.value)}
                    aria-label="Buscar pacotes e classes"
                    autoComplete="off"
                  />
                </div>
                <button
                  type="button"
                  className="workspace-explorer__packages-search-focus-out"
                  aria-label="Focar campo de busca"
                  onClick={() => pkgSearchInputRef.current?.focus()}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    center_focus_strong
                  </span>
                </button>
              </div>
            </div>
            <div className="workspace-explorer__packages-tree">
              {(workspace.packages ?? []).length === 0 ? (
                <p className="workspace-explorer__packages-tree-empty">Nenhum pacote configurado.</p>
              ) : filteredPackages.length === 0 ? (
                <p className="workspace-explorer__packages-tree-empty">Nenhum resultado para a busca.</p>
              ) : (
                <ul className="workspace-explorer__pkg-tree-list" role="tree">
                  {filteredPackages.map((pkg) => {
                    const open = expandedPkgs[pkg.id] !== false
                    const classes = pkg.classes ?? []
                    return (
                      <li key={pkg.id} className="workspace-explorer__pkg-tree-node" role="treeitem">
                        <button
                          type="button"
                          className="workspace-explorer__pkg-tree-trigger"
                          aria-expanded={open}
                          onClick={() => togglePkgExpanded(pkg.id)}
                        >
                          <span
                            className={`material-symbols-outlined workspace-explorer__pkg-tree-chevron${open ? ' workspace-explorer__pkg-tree-chevron--open' : ''}`}
                            aria-hidden
                          >
                            chevron_right
                          </span>
                          <span className="workspace-explorer__pkg-tree-label">
                            {(pkg.name || 'Pacote').trim() || 'Pacote'}
                          </span>
                        </button>
                        {open ? (
                          <ul className="workspace-explorer__class-tree-list" role="group">
                            {classes.length === 0 ? (
                              <li className="workspace-explorer__class-tree-empty">Sem classes neste pacote.</li>
                            ) : (
                              classes.map((c, idx) => {
                                const isActive =
                                  activeClass?.packageId === pkg.id && activeClass?.classId === c.id
                                return (
                                  <li key={c.id} className="workspace-explorer__class-tree-item">
                                    <button
                                      type="button"
                                      className={`workspace-explorer__class-tree-row${isActive ? ' workspace-explorer__class-tree-row--active' : ''}`}
                                      aria-current={isActive ? 'true' : undefined}
                                      aria-label={`Classe ${(c.name || 'Classe').trim() || 'Classe'}, listar objetos`}
                                      onClick={() => setActiveClass({ packageId: pkg.id, classId: c.id })}
                                    >
                                      <span
                                        className="workspace-explorer__class-tree-dot"
                                        style={{
                                          background:
                                            PRESET_ICON_COLOR_CHOICES[idx % PRESET_ICON_COLOR_CHOICES.length],
                                        }}
                                        aria-hidden
                                      />
                                      <span className="workspace-explorer__class-tree-label" title={c.name}>
                                        {(c.name || 'Classe').trim() || 'Classe'}
                                      </span>
                                    </button>
                                  </li>
                                )
                              })
                            )}
                          </ul>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>

        <div
          className="workspace-explorer__resize-handle"
          style={{ width: HANDLE_PX, flex: `0 0 ${HANDLE_PX}px` }}
          role="separator"
          aria-orientation="vertical"
          aria-label="Ajustar largura da coluna de pacotes"
          tabIndex={0}
          onPointerDown={onPackagesHandleDown}
        />

        <section
          className="workspace-explorer__pane workspace-explorer__pane--objects"
          style={{ flex: `0 0 ${objectsW}px` }}
          aria-label="Objetos do workspace"
        >
          <div className="workspace-explorer__objects-shell">
            <header
              className="panel-header workspace-explorer__objects-panel-header"
              role="region"
              aria-label={objectsPanelHeaderLabel}
            >
              <p className="panel-header__title panel-header__title--form workspace-explorer__objects-panel-header-title">
                {objectsPanelHeaderLabel}
              </p>
              <div className="panel-header__actions workspace-explorer__objects-panel-header-actions">
                <button
                  type="button"
                  className="workspace-explorer__chrome-icon-btn"
                  aria-label="Limpar busca de objetos"
                  onClick={() => setObjSearch('')}
                >
                  <span className="material-symbols-outlined workspace-explorer__chrome-refresh-icon" aria-hidden>
                    refresh
                  </span>
                </button>
                <button type="button" className="workspace-explorer__chrome-icon-btn" aria-label="Expandir vista">
                  <span className="material-symbols-outlined workspace-explorer__chrome-expand-icon" aria-hidden>
                    web_asset
                  </span>
                </button>
              </div>
            </header>
            <div className="workspace-explorer__objects-search-strip">
              <div className="workspace-explorer__objects-search-track">
                <div className="workspace-explorer__objects-search-field">
                  <span className="material-symbols-outlined workspace-explorer__objects-search-lead" aria-hidden>
                    search
                  </span>
                  <input
                    ref={objSearchInputRef}
                    type="search"
                    className="workspace-explorer__objects-search-input"
                    placeholder="Buscar"
                    value={objSearch}
                    onChange={(e) => setObjSearch(e.target.value)}
                    aria-label="Buscar objetos"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
            <div className="workspace-explorer__objects-filter-icon-strip">
              <button
                type="button"
                className="workspace-explorer__objects-filter-icon-btn"
                disabled
                aria-label="Filtros"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  filter_list
                </span>
              </button>
            </div>
            <div className="workspace-explorer__objects-grouping-strip" role="toolbar" aria-label="Agrupamento e ordenação">
              <div className="workspace-explorer__objects-grouping-selects">
                <select
                  className="acc__input acc__select workspace-explorer__objects-grouping-select"
                  aria-label="Agrupar por"
                  defaultValue=""
                >
                  <option value="">Agrupado por</option>
                </select>
                <select
                  className="acc__input acc__select workspace-explorer__objects-grouping-select"
                  aria-label="Critério de data"
                  defaultValue=""
                >
                  <option value="">Data da última alteração</option>
                </select>
              </div>
              <button type="button" className="workspace-explorer__objects-grouping-sort" aria-label="Direção da ordenação">
                <span className="material-symbols-outlined" aria-hidden>
                  arrow_downward
                </span>
              </button>
            </div>
            <div className="workspace-explorer__objects-body">
              <div className="workspace-explorer__objects-scroll">
                {objectListingGroups.length === 0 ? (
                  <p className="workspace-explorer__objects-empty">Nenhum item encontrado.</p>
                ) : !activeClass ? (
                  <p className="workspace-explorer__objects-empty">
                    Selecione uma classe na coluna Pacotes para listar os objetos de exemplo dessa classe.
                  </p>
                ) : groupsScopedToActiveClass.length === 0 ? (
                  <p className="workspace-explorer__objects-empty">Nenhum item encontrado.</p>
                ) : flatFilteredObjectCards.length === 0 ? (
                  <p className="workspace-explorer__objects-empty">Nenhum resultado para a busca.</p>
                ) : (
                  <div className="workspace-explorer__object-list" role="list">
                    {flatFilteredObjectCards.map((c) => (
                      <WorkspaceObjectExampleCard
                        key={c.key}
                        form={c.form}
                        preset={c.preset}
                        isSelected={activeObjectKey === c.key}
                        onActivate={() => setActiveObjectKey(c.key)}
                        fieldValueOverrides={attendanceFieldOverrides[c.key]}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div
          className="workspace-explorer__resize-handle"
          style={{ width: HANDLE_PX, flex: `0 0 ${HANDLE_PX}px` }}
          role="separator"
          aria-orientation="vertical"
          aria-label="Ajustar largura da coluna de objetos"
          tabIndex={0}
          onPointerDown={onObjectsHandleDown}
        />

        <section
          className="workspace-explorer__pane workspace-explorer__pane--detail"
          aria-label={detailFormView ? (detailFormView.form.name?.trim() || 'Formulário do objeto') : 'Detalhe do objeto'}
        >
          <div
            className={`workspace-explorer__detail-body${!detailFormView ? ' workspace-explorer__detail-body--empty' : ''}`}
          >
            {detailFormView ? (
              <FormCanvas
                key={detailFormView.remountKey}
                form={detailFormView.form}
                epicForms={epicForms}
                canvasReadOnly
                allowFieldEditsWhileReadMethods={detailFormView.isAnalise}
                showSpecs={false}
                emptyHint="generic"
                onBuiltInMethodApplied={onAnaliseMethodApplied}
                onReadModeMethodClick={
                  workspaceMethodNavigate && activeObjectKey
                    ? (methodId) => {
                        const parts = activeObjectKey.split('::')
                        if (parts.length < 3) return
                        const target = workspaceMethodNavigate.targetsByMethodKey[
                          workspaceMethodNavKey(parts[0], parts[1], methodId)
                        ]
                        if (target) workspaceMethodNavigate.onNavigateToStep(target)
                      }
                    : undefined
                }
              />
            ) : (
              <p className="workspace-explorer__detail-empty">
                Clique em um objeto na listagem do meio para ver o formulário com os valores de exemplo desse
                cenário.
              </p>
            )}
          </div>
        </section>
      </div>
      {methodToast && (
        <div
          className="workspace-explorer__toast"
          role="status"
          style={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            zIndex: 40,
            maxWidth: 420,
            padding: '12px 16px',
            borderRadius: 10,
            background: '#0f3d4c',
            color: '#fff',
            fontSize: 13,
            boxShadow: '0 8px 24px rgba(15,61,76,.28)',
          }}
        >
          {methodToast}
        </div>
      )}
    </div>
  )
}
