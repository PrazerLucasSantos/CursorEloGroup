import { useEffect, useState } from 'react'
import type { FormDef, WorkspaceDef, WorkspacePackage, WorkspacePackageClass } from '../../types'
import {
  DEFAULT_WS_CHROME,
  resolveWorkspaceHex,
  selectExplorerHeaderForeground,
  WORKSPACE_EXPLORER_HEADER_FG_OPTIONS,
} from '../../utils/workspaceExplorerTheme'

interface Props {
  workspace: WorkspaceDef
  epicForms: FormDef[]
  onChange: (patch: Partial<WorkspaceDef>) => void
}

function classAccordionKey(packageId: string, classId: string) {
  return `${packageId}::${classId}`
}

function objectListingClassKey(packageId: string, classId: string) {
  return `objlist::${packageId}::${classId}`
}

/** Classes com formulário do épico referenciado (para listagem de objetos). */
function toggleLinkedFormExamplePresetId(
  current: string[] | undefined,
  presetId: string,
  checked: boolean,
): string[] | undefined {
  const base = current ?? []
  if (checked) {
    if (base.includes(presetId)) return base.length ? base : undefined
    const next = [...base, presetId]
    return next
  }
  const next = base.filter((id) => id !== presetId)
  return next.length > 0 ? next : undefined
}

function collectClassesWithLinkedForm(
  pkgs: WorkspacePackage[],
): { pkg: WorkspacePackage; cls: WorkspacePackageClass }[] {
  const rows: { pkg: WorkspacePackage; cls: WorkspacePackageClass }[] = []
  for (const pkg of pkgs) {
    for (const cls of pkg.classes ?? []) {
      if (cls.linkedFormId) rows.push({ pkg, cls })
    }
  }
  return rows
}

const chevron = (
  <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function newWorkspaceItemId(): string {
  return crypto.randomUUID?.() ?? `ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export default function WorkspaceConfigPanel({ workspace, epicForms, onChange }: Props) {
  const [openGeneral, setOpenGeneral] = useState(true)
  const [openPackagesSection, setOpenPackagesSection] = useState(true)
  const [openObjectListingSection, setOpenObjectListingSection] = useState(true)
  const [openPackageById, setOpenPackageById] = useState<Record<string, boolean>>({})
  const [openClassByKey, setOpenClassByKey] = useState<Record<string, boolean>>({})
  const [openObjectListingClassByKey, setOpenObjectListingClassByKey] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setOpenPackageById({})
    setOpenClassByKey({})
    setOpenObjectListingClassByKey({})
  }, [workspace.id])

  const chromeHex = resolveWorkspaceHex(workspace.explorerChromeColor, DEFAULT_WS_CHROME)
  const packages = workspace.packages ?? []
  const objectListingClasses = collectClassesWithLinkedForm(packages)

  function setPackages(next: WorkspacePackage[]) {
    onChange({ packages: next.length > 0 ? next : undefined })
  }

  function addPackage() {
    const id = newWorkspaceItemId()
    const n = packages.length + 1
    setPackages([...packages, { id, name: `Novo pacote ${n}`, classes: [] }])
    setOpenPackageById((prev) => ({ ...prev, [id]: true }))
  }

  function updatePackage(packageId: string, patch: Partial<WorkspacePackage>) {
    setPackages(packages.map((p) => (p.id === packageId ? { ...p, ...patch } : p)))
  }

  function removePackage(packageId: string) {
    setPackages(packages.filter((p) => p.id !== packageId))
    setOpenPackageById((prev) => {
      const next = { ...prev }
      delete next[packageId]
      return next
    })
  }

  function togglePackageOpen(packageId: string) {
    setOpenPackageById((prev) => ({ ...prev, [packageId]: !prev[packageId] }))
  }

  function toggleClassAccordion(packageId: string, classId: string) {
    const k = classAccordionKey(packageId, classId)
    setOpenClassByKey((prev) => ({ ...prev, [k]: !prev[k] }))
  }

  function addClass(packageId: string) {
    const cid = newWorkspaceItemId()
    setPackages(
      packages.map((p) => {
        if (p.id !== packageId) return p
        const classes = p.classes ?? []
        const cn = classes.length + 1
        return { ...p, classes: [...classes, { id: cid, name: `Nova classe ${cn}` }] }
      }),
    )
    setOpenClassByKey((prev) => ({
      ...prev,
      [classAccordionKey(packageId, cid)]: true,
    }))
  }

  function updateClass(packageId: string, classId: string, patch: Partial<WorkspacePackageClass>) {
    setPackages(
      packages.map((p) => {
        if (p.id !== packageId) return p
        const classes = (p.classes ?? []).map((c) => (c.id === classId ? { ...c, ...patch } : c))
        return { ...p, classes }
      }),
    )
  }

  function toggleObjectListingClassOpen(packageId: string, classId: string) {
    const k = objectListingClassKey(packageId, classId)
    setOpenObjectListingClassByKey((prev) => ({ ...prev, [k]: !prev[k] }))
  }

  function removeClass(packageId: string, classId: string) {
    setPackages(
      packages.map((p) => {
        if (p.id !== packageId) return p
        const classes = (p.classes ?? []).filter((c) => c.id !== classId)
        return { ...p, classes: classes.length > 0 ? classes : undefined }
      }),
    )
    const k = classAccordionKey(packageId, classId)
    const ok = objectListingClassKey(packageId, classId)
    setOpenClassByKey((prev) => {
      if (!(k in prev)) return prev
      const next = { ...prev }
      delete next[k]
      return next
    })
    setOpenObjectListingClassByKey((prev) => {
      if (!(ok in prev)) return prev
      const next = { ...prev }
      delete next[ok]
      return next
    })
  }

  return (
    <aside className="sidebar flow-step-config workspace-config-panel">
      <header className="panel-header">
        <h2 className="panel-header__title">Workspace</h2>
        <p className="flow-step-config__subtitle">{workspace.name || workspace.id}</p>
      </header>
      <div className="flow-step-config__body flow-step-config__body--bpmn">
        <div className="flow-step-config__bpmn">
          <div className={`acc${openGeneral ? ' acc--open' : ''}`}>
            <button
              type="button"
              className="acc__header"
              onClick={() => setOpenGeneral((v) => !v)}
              aria-expanded={openGeneral}
              aria-label="Configurações gerais, expandir ou recolher seção de configuração"
            >
              <span className="acc__header-main">
                <span className="acc__name">Configurações gerais</span>
              </span>
              {chevron}
            </button>
            {openGeneral ? (
              <div className="acc__body">
                <label className="acc__field">
                  <span className="acc__label">Cor do workspace</span>
                  <div className="workspace-config-panel__color-row">
                    <input
                      type="color"
                      className="workspace-config-panel__color-native"
                      aria-label="Escolher cor do workspace"
                      value={chromeHex}
                      onChange={(e) => onChange({ explorerChromeColor: e.target.value })}
                    />
                    <input
                      type="text"
                      className="acc__input"
                      value={workspace.explorerChromeColor ?? ''}
                      onChange={(e) =>
                        onChange({
                          explorerChromeColor:
                            e.target.value.trim() === '' ? undefined : e.target.value.trim(),
                        })
                      }
                      placeholder={DEFAULT_WS_CHROME}
                      spellCheck={false}
                    />
                  </div>
                </label>
                <label className="acc__field">
                  <span className="acc__label">Texto e ícones do header</span>
                  <select
                    className="acc__input acc__select"
                    value={selectExplorerHeaderForeground(workspace)}
                    onChange={(e) =>
                      onChange({
                        explorerHeaderForeground: e.target.value as '#ffffff' | '#000000',
                        explorerIconColor: undefined,
                        explorerHeaderText: undefined,
                      })
                    }
                    aria-label="Cor do texto e dos ícones do header: branco ou preto"
                  >
                    {WORKSPACE_EXPLORER_HEADER_FG_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="acc__field">
                  <span className="acc__label">Nome do workspace</span>
                  <input
                    type="text"
                    className="acc__input"
                    value={workspace.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                  />
                </label>
                <label className="acc__field">
                  <span className="acc__label">Iniciais no avatar</span>
                  <input
                    type="text"
                    className="acc__input"
                    value={(workspace.explorerUserInitials ?? '').toUpperCase()}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 4)
                      onChange({ explorerUserInitials: v.trim() === '' ? undefined : v.toUpperCase() })
                    }}
                    placeholder="Ex.: MF (até 4 caracteres)"
                    maxLength={4}
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div className={`acc${openPackagesSection ? ' acc--open' : ''}`}>
            <button
              type="button"
              className="acc__header"
              onClick={() => setOpenPackagesSection((v) => !v)}
              aria-expanded={openPackagesSection}
              aria-label="Pacotes, expandir ou recolher seção de configuração"
            >
              <span className="acc__header-main">
                <span className="acc__name">Pacotes</span>
              </span>
              {chevron}
            </button>
            {openPackagesSection ? (
              <div className="acc__body">
                {packages.map((pkg) => {
                  const pkgOpen = !!openPackageById[pkg.id]
                  const classes = pkg.classes ?? []
                  return (
                    <div key={pkg.id} className={`acc acc--nested${pkgOpen ? ' acc--open' : ''}`}>
                      <button
                        type="button"
                        className="acc__header acc__header--nested"
                        onClick={() => togglePackageOpen(pkg.id)}
                        aria-expanded={pkgOpen}
                        aria-label={`${pkg.name}, expandir ou recolher`}
                      >
                        <span className="acc__header-main">
                          <span className="acc__name">{pkg.name.trim() || 'Pacote'}</span>
                        </span>
                        {chevron}
                      </button>
                      {pkgOpen ? (
                        <div className="acc__body acc__body--nested">
                          <label className="acc__field">
                            <span className="acc__label">Nome do pacote</span>
                            <input
                              type="text"
                              className="acc__input"
                              value={pkg.name}
                              onChange={(e) => updatePackage(pkg.id, { name: e.target.value })}
                            />
                          </label>
                          <div className="acc__nested-section">
                            <h4 className="flow-step-config__heading workspace-config-panel__subheading">
                              Classes
                            </h4>
                            {classes.length === 0 ? (
                              <p className="acc__nested-empty">Nenhuma classe neste pacote.</p>
                            ) : (
                              <div className="acc__nested-list">
                                {classes.map((cls) => {
                                  const ck = classAccordionKey(pkg.id, cls.id)
                                  const clsOpen = Boolean(openClassByKey[ck])
                                  return (
                                    <div
                                      key={cls.id}
                                      className={`acc acc--nested${clsOpen ? ' acc--open' : ''}`}
                                    >
                                      <button
                                        type="button"
                                        className="acc__header acc__header--nested"
                                        onClick={() => toggleClassAccordion(pkg.id, cls.id)}
                                        aria-expanded={clsOpen}
                                        aria-label={`${(cls.name || 'Classe').trim() || 'Classe'}, expandir ou recolher`}
                                      >
                                        <span className="acc__header-main">
                                          <span className="acc__name">
                                            {(cls.name || 'Classe').trim() || 'Classe'}
                                          </span>
                                        </span>
                                        {chevron}
                                      </button>
                                      {clsOpen ? (
                                        <div className="acc__body acc__body--nested">
                                          <label className="acc__field">
                                            <span className="acc__label">Nome</span>
                                            <input
                                              type="text"
                                              className="acc__input"
                                              value={cls.name}
                                              onChange={(e) =>
                                                updateClass(pkg.id, cls.id, { name: e.target.value })
                                              }
                                              aria-label="Nome da classe"
                                            />
                                          </label>
                                          <label className="acc__field">
                                            <span className="acc__label">Formulário</span>
                                            <select
                                              className="acc__input acc__select"
                                              value={cls.linkedFormId ?? ''}
                                              onChange={(e) => {
                                                const v = e.target.value || undefined
                                                const formChanged = v !== cls.linkedFormId
                                                updateClass(pkg.id, cls.id, {
                                                  linkedFormId: v,
                                                  ...(formChanged ? { linkedFormExamplePresetIds: undefined } : {}),
                                                })
                                              }}
                                              aria-label="Formulário associado à classe"
                                            >
                                              <option value="">— Nenhum —</option>
                                              {epicForms.map((f) => (
                                                <option key={f.id} value={f.id}>
                                                  {f.name}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
                                          <div className="workspace-config-panel__class-acc-actions">
                                            <button
                                              type="button"
                                              className="workspace-config-panel__btn-danger"
                                              onClick={() => removeClass(pkg.id, cls.id)}
                                            >
                                              Remover classe
                                            </button>
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            <button
                              type="button"
                              className="sidebar__add-btn"
                              onClick={() => addClass(pkg.id)}
                            >
                              <span className="sidebar__add-icon">+</span>
                              Adicionar classe
                            </button>
                          </div>
                          <div className="workspace-config-panel__pkg-actions">
                            <button
                              type="button"
                              className="workspace-config-panel__btn-danger"
                              onClick={() => removePackage(pkg.id)}
                            >
                              Remover pacote
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
                <button type="button" className="sidebar__add-btn" onClick={addPackage}>
                  <span className="sidebar__add-icon">+</span>
                  Adicionar pacote
                </button>
              </div>
            ) : null}
          </div>

          <div className={`acc${openObjectListingSection ? ' acc--open' : ''}`}>
            <button
              type="button"
              className="acc__header"
              onClick={() => setOpenObjectListingSection((v) => !v)}
              aria-expanded={openObjectListingSection}
              aria-label="Listagem de objetos, expandir ou recolher seção de configuração"
            >
              <span className="acc__header-main">
                <span className="acc__name">Listagem de objetos</span>
              </span>
              {chevron}
            </button>
            {openObjectListingSection ? (
              <div className="acc__body">
                <p className="acc__nested-hint workspace-config-panel__object-listing-intro">
                  Um painel por classe que já tenha um formulário referenciado em Pacotes. Em cada classe, escolha
                  um ou mais cenários de exemplo desse formulário para a listagem de objetos.
                </p>
                {objectListingClasses.length === 0 ? (
                  <p className="acc__nested-empty">Nenhuma classe com formulário referenciado.</p>
                ) : (
                  <div className="acc__nested-list workspace-config-panel__object-listing-list">
                    {objectListingClasses.map(({ pkg, cls }) => {
                      const k = objectListingClassKey(pkg.id, cls.id)
                      const rowOpen = Boolean(openObjectListingClassByKey[k])
                      const linkedForm = epicForms.find((f) => f.id === cls.linkedFormId)
                      const formPresets = linkedForm?.exampleValuePresets ?? []
                      const selectedIds = new Set(cls.linkedFormExamplePresetIds ?? [])
                      return (
                        <div key={k} className={`acc acc--nested${rowOpen ? ' acc--open' : ''}`}>
                          <button
                            type="button"
                            className="acc__header acc__header--nested"
                            onClick={() => toggleObjectListingClassOpen(pkg.id, cls.id)}
                            aria-expanded={rowOpen}
                            aria-label={`${(cls.name || 'Classe').trim() || 'Classe'}, listagem de objetos`}
                          >
                            <span className="acc__header-main">
                              <span className="acc__name">{(cls.name || 'Classe').trim() || 'Classe'}</span>
                              <span className="workspace-config-panel__object-listing-ctx">
                                {pkg.name.trim() || 'Pacote'}
                              </span>
                            </span>
                            {chevron}
                          </button>
                          {rowOpen ? (
                            <div className="acc__body acc__body--nested">
                              <div className="acc__field">
                                <span className="acc__label">Pacote</span>
                                <p className="workspace-config-panel__muted-line">{pkg.name}</p>
                              </div>
                              <div className="acc__field">
                                <span className="acc__label">Classe</span>
                                <p className="workspace-config-panel__muted-line">{cls.name}</p>
                              </div>
                              <div className="acc__field">
                                <span className="acc__label">Formulário referenciado</span>
                                <p className="workspace-config-panel__muted-line">
                                  {linkedForm?.name ?? cls.linkedFormId ?? '—'}
                                </p>
                              </div>
                              {linkedForm && formPresets.length === 0 ? (
                                <p className="acc__nested-hint">
                                  Este formulário ainda não tem cenários de exemplo. Crie-os na aba «Valores de
                                  exemplo» ao editar o formulário no épico.
                                </p>
                              ) : null}
                              {linkedForm && formPresets.length > 0 ? (
                                <div className="acc__field">
                                  <span className="acc__label">Valores de exemplo do formulário</span>
                                  <div
                                    className="workspace-config-panel__preset-checkboxes"
                                    role="group"
                                    aria-label="Cenários de exemplo do formulário para listagem de objetos"
                                  >
                                    {formPresets.map((pr) => (
                                      <label
                                        key={pr.id}
                                        className="workspace-config-panel__preset-check-row"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedIds.has(pr.id)}
                                          onChange={(e) =>
                                            updateClass(pkg.id, cls.id, {
                                              linkedFormExamplePresetIds: toggleLinkedFormExamplePresetId(
                                                cls.linkedFormExamplePresetIds,
                                                pr.id,
                                                e.target.checked,
                                              ),
                                            })
                                          }
                                        />
                                        <span className="workspace-config-panel__preset-check-label">
                                          {pr.name.trim() || 'Cenário'}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                              <p className="acc__nested-hint">
                                Outras opções da listagem de objetos (colunas, filtros, ordenação) poderão ser
                                definidas aqui.
                              </p>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  )
}
