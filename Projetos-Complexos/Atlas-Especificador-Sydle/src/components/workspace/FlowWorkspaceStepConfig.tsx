import { useEffect, useMemo, useState } from 'react'
import type { FlowStep, FormDef, WorkspaceDef, WorkspacePackage, WorkspacePackageClass } from '../../types'
import { findFormById } from '../../utils/linkedForm'
import { workspaceMethodNavKey } from '../../utils/flowStep'
import FlowStepConfigAutosizeTextarea from '../FlowStepConfigAutosizeTextarea'

interface Props {
  step: FlowStep
  workspaces: WorkspaceDef[]
  epicForms: FormDef[]
  /** Etapas do fluxo atual (dropdown de destino ao clicar no método). */
  flowSteps: FlowStep[]
  onUpdateStep: (patch: Partial<FlowStep>) => void
}

const chevron = (
  <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function protoClassKey(packageId: string, classId: string) {
  return `${packageId}::${classId}`
}

function formMethodKindLabel(kind: string): string {
  if (kind === 'menu') return 'Menu'
  return 'Destaque'
}

function collectClassesWithLinkedForm(
  ws: WorkspaceDef | undefined,
): { pkg: WorkspacePackage; cls: WorkspacePackageClass }[] {
  if (!ws) return []
  const out: { pkg: WorkspacePackage; cls: WorkspacePackageClass }[] = []
  for (const pkg of ws.packages ?? []) {
    for (const cls of pkg.classes ?? []) {
      if (cls.linkedFormId?.trim()) out.push({ pkg, cls })
    }
  }
  return out
}

export default function FlowWorkspaceStepConfig({
  step,
  workspaces,
  epicForms,
  flowSteps,
  onUpdateStep,
}: Props) {
  const [openLinked, setOpenLinked] = useState(true)
  const [openRole, setOpenRole] = useState(false)
  const [openProto, setOpenProto] = useState(false)
  const [openClassProtoByKey, setOpenClassProtoByKey] = useState<Record<string, boolean>>({})
  const [openMethodProtoByKey, setOpenMethodProtoByKey] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setOpenLinked(true)
    setOpenRole(false)
    setOpenProto(false)
    setOpenClassProtoByKey({})
    setOpenMethodProtoByKey({})
  }, [step.id])

  const linkedId = step.linkedWorkspaceId?.trim() ?? ''
  const linkedDef = linkedId ? workspaces.find((w) => w.id === linkedId) : undefined

  const classesWithForm = useMemo(() => collectClassesWithLinkedForm(linkedDef), [linkedDef])

  useEffect(() => {
    setOpenClassProtoByKey({})
    setOpenMethodProtoByKey({})
  }, [linkedId])

  function toggleClassProto(packageId: string, classId: string) {
    const k = protoClassKey(packageId, classId)
    setOpenClassProtoByKey((prev) => ({ ...prev, [k]: !prev[k] }))
  }

  function toggleMethodProto(packageId: string, classId: string, methodId: string) {
    const k = workspaceMethodNavKey(packageId, classId, methodId)
    setOpenMethodProtoByKey((prev) => ({ ...prev, [k]: !prev[k] }))
  }

  function setMethodNavigateStep(methodKey: string, targetStepId: string) {
    const base = { ...(step.workspaceMethodNavigateStepIds ?? {}) }
    const v = targetStepId.trim()
    if (v === '') delete base[methodKey]
    else base[methodKey] = v
    onUpdateStep({
      workspaceMethodNavigateStepIds: Object.keys(base).length > 0 ? base : undefined,
    })
  }

  return (
    <div className="flow-step-config__bpmn">
        <div className={`acc${openLinked ? ' acc--open' : ''}`}>
          <button
            type="button"
            className="acc__header"
            onClick={() => setOpenLinked((v) => !v)}
            aria-expanded={openLinked}
            aria-label="Workspace vinculado, expandir ou recolher"
          >
            <span className="acc__header-main">
              <span className="acc__name">Workspace vinculado</span>
            </span>
            {chevron}
          </button>
          {openLinked ? (
            <div className="acc__body">
              {linkedId && !linkedDef ? (
                <p className="flow-step-config__placeholder-msg" role="alert">
                  O id <code>{linkedId}</code> não corresponde a nenhum workspace deste épico. Escolha outro ou crie um
                  novo.
                </p>
              ) : null}

              <label className="acc__field">
                <span className="acc__label">Workspace</span>
                <select
                  className="acc__input acc__select"
                  value={linkedId}
                  onChange={(e) => {
                    const v = e.target.value.trim()
                    onUpdateStep({ linkedWorkspaceId: v === '' ? undefined : v })
                  }}
                >
                  <option value="">(selecione)</option>
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {(w.name || 'Workspace').trim() || w.id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="acc__field">
                <span className="acc__label">Descrição do workspace (preview)</span>
                <FlowStepConfigAutosizeTextarea
                  className="acc__input acc__textarea flow-step-config__textarea-doc"
                  value={step.workspacePresentationDescription ?? ''}
                  onChange={(e) =>
                    onUpdateStep({
                      workspacePresentationDescription: e.target.value === '' ? undefined : e.target.value,
                    })
                  }
                  placeholder="Contexto desta etapa, o que o usuário faz no Explorer, escopo do vínculo…"
                />
              </label>

              {workspaces.length === 0 ? (
                <p className="flow-step-config__placeholder-msg">
                  Ainda não há workspaces neste épico. Use a aba <strong>Workspaces</strong> na lista do épico para
                  criar ou importar definições.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={`acc${openRole ? ' acc--open' : ''}`}>
          <button
            type="button"
            className="acc__header"
            onClick={() => setOpenRole((v) => !v)}
            aria-expanded={openRole}
            aria-label="Papel, expandir ou recolher"
          >
            <span className="acc__header-main">
              <span className="acc__name">Papel</span>
            </span>
            {chevron}
          </button>
          {openRole ? (
            <div className="acc__body">
              <label className="acc__field">
                <span className="acc__label">Nome do papel</span>
                <input
                  type="text"
                  className="acc__input"
                  value={step.assigneeRole ?? ''}
                  onChange={(e) =>
                    onUpdateStep({ assigneeRole: e.target.value === '' ? undefined : e.target.value })
                  }
                  placeholder="ex.: gestor_compras"
                />
              </label>
              <label className="acc__field">
                <span className="acc__label">Descrição do papel</span>
                <FlowStepConfigAutosizeTextarea
                  className="acc__input acc__textarea flow-step-config__textarea-doc"
                  value={step.assigneeRoleDetail ?? ''}
                  onChange={(e) =>
                    onUpdateStep({ assigneeRoleDetail: e.target.value === '' ? undefined : e.target.value })
                  }
                  placeholder="Quem executa, origem do ator, regras de atendimento…"
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className={`acc${openProto ? ' acc--open' : ''}`}>
          <button
            type="button"
            className="acc__header"
            onClick={() => setOpenProto((v) => !v)}
            aria-expanded={openProto}
            aria-label="Prototipação, expandir ou recolher"
          >
            <span className="acc__header-main">
              <span className="acc__name">Prototipação</span>
            </span>
            {chevron}
          </button>
          {openProto ? (
            <div className="acc__body">
              {!linkedDef ? (
                <p className="flow-step-config__placeholder-msg" style={{ margin: 0 }}>
                  Selecione um workspace vinculado para listar as classes com formulário.
                </p>
              ) : classesWithForm.length === 0 ? (
                <p className="flow-step-config__placeholder-msg" style={{ margin: 0 }}>
                  Nenhuma classe com formulário vinculado neste workspace.
                </p>
              ) : (
                <div className="acc__nested-list">
                  {classesWithForm.map(({ pkg, cls }) => {
                    const k = protoClassKey(pkg.id, cls.id)
                    const clsOpen = Boolean(openClassProtoByKey[k])
                    const formId = cls.linkedFormId!.trim()
                    const linkedForm = findFormById(epicForms, formId)
                    const pkgName = (pkg.name || 'Pacote').trim() || 'Pacote'
                    const clsName = (cls.name || 'Classe').trim() || 'Classe'
                    return (
                      <div key={k} className={`acc acc--nested${clsOpen ? ' acc--open' : ''}`}>
                        <button
                          type="button"
                          className="acc__header acc__header--nested"
                          onClick={() => toggleClassProto(pkg.id, cls.id)}
                          aria-expanded={clsOpen}
                          aria-label={`${clsName}, expandir ou recolher`}
                        >
                          <span className="acc__header-main">
                            <span className="acc__name">{clsName}</span>
                          </span>
                          {chevron}
                        </button>
                        {clsOpen ? (
                          <div className="acc__body acc__body--nested">
                            <p className="flow-step-config__placeholder-msg" style={{ margin: '0 0 0.5rem' }}>
                              Pacote: <strong>{pkgName}</strong>
                            </p>
                            {!linkedForm ? (
                              <p className="flow-step-config__placeholder-msg" role="alert" style={{ margin: 0 }}>
                                O id <code>{formId}</code> não corresponde a nenhum formulário deste épico.
                              </p>
                            ) : (
                              <>
                                <p className="flow-step-config__placeholder-msg" style={{ margin: '0 0 0.65rem' }}>
                                  Formulário: <strong>{linkedForm.name}</strong>
                                </p>
                                {(linkedForm.methods ?? []).length === 0 ? (
                                  <p className="flow-step-config__placeholder-msg" style={{ margin: 0 }}>
                                    Este formulário não tem métodos configurados (aba Métodos do formulário).
                                  </p>
                                ) : (
                                  <div className="acc__nested-list">
                                    {(linkedForm.methods ?? []).map((method) => {
                                      const mk = workspaceMethodNavKey(pkg.id, cls.id, method.id)
                                      const mOpen = Boolean(openMethodProtoByKey[mk])
                                      const methodTitle = (method.name || 'Método').trim() || 'Método'
                                      const navTarget = step.workspaceMethodNavigateStepIds?.[mk] ?? ''
                                      return (
                                        <div key={method.id} className={`acc acc--nested${mOpen ? ' acc--open' : ''}`}>
                                          <button
                                            type="button"
                                            className="acc__header acc__header--nested"
                                            onClick={() => toggleMethodProto(pkg.id, cls.id, method.id)}
                                            aria-expanded={mOpen}
                                            aria-label={`${methodTitle}, expandir ou recolher`}
                                          >
                                            <span className="acc__header-main">
                                              {method.icon ? (
                                                <span
                                                  className="material-symbols-outlined"
                                                  aria-hidden
                                                  style={{ fontSize: '1.1rem', opacity: 0.85 }}
                                                >
                                                  {method.icon}
                                                </span>
                                              ) : null}
                                              <span className="acc__name">{methodTitle}</span>
                                            </span>
                                            {chevron}
                                          </button>
                                          {mOpen ? (
                                            <div className="acc__body acc__body--nested">
                                              <p
                                                className="flow-step-config__placeholder-msg"
                                                style={{ margin: '0 0 0.65rem' }}
                                              >
                                                Tipo: <strong>{formMethodKindLabel(method.kind)}</strong>
                                                {method.icon ? (
                                                  <>
                                                    {' '}
                                                    · ícone Material: <code>{method.icon}</code>
                                                  </>
                                                ) : null}
                                              </p>
                                              <label className="acc__field">
                                                <span className="acc__label">Etapa ao clicar no método</span>
                                                <select
                                                  className="acc__input acc__select"
                                                  value={navTarget}
                                                  onChange={(e) => setMethodNavigateStep(mk, e.target.value)}
                                                >
                                                  <option value="">— Nenhuma —</option>
                                                  {flowSteps.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                      {s.title?.trim() || s.id}
                                                    </option>
                                                  ))}
                                                </select>
                                              </label>
                                            </div>
                                          ) : null}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </>
                            )}
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
  )
}
