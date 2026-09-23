import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type {
  BpmnPossiblePath,
  FlowActivityType,
  FlowListItem,
  FlowStep,
  FormDef,
  ServicePortalDef,
  ServicePortalSubtype,
  WorkspaceDef,
} from '../types'
import { bpmnRulesListResolved, resolvedActivityType, stepNeedsTypeChoice } from '../utils/flowStep'
import FlowStepConfigAutosizeTextarea from './FlowStepConfigAutosizeTextarea'
import { ServicePortalConfig } from './servicePortal'
import FlowWorkspaceStepConfig from './workspace/FlowWorkspaceStepConfig'

const FlowStepHtmlEditor = lazy(() => import('./FlowStepHtmlEditor'))

const TYPE_OPTIONS: { value: FlowActivityType; label: string; hint: string }[] = [
  { value: 'html', label: 'HTML livre', hint: 'Conteúdo HTML na etapa.' },
  { value: 'bpmnActivity', label: 'Atividade BPMN', hint: 'Tarefa no processo.' },
  { value: 'method', label: 'Método', hint: 'Como BPMN, sem entradas/saídas, SLA e eventos na configuração.' },
  { value: 'servicePortal', label: 'Portal de serviços', hint: 'Integração externa.' },
  { value: 'workspace', label: 'Workspace', hint: 'Explorer com pacotes, classes e objetos de exemplo.' },
  { value: 'class', label: 'Classe', hint: 'Exibe uma classe (formulário) em modo leitura.' },
]

const SERVICE_PORTAL_SUBTYPE_OPTIONS: { value: ServicePortalSubtype; label: string; hint: string }[] = [
  { value: 'homePage', label: 'Página inicial', hint: 'Landing ou vitrine principal do portal.' },
  { value: 'service', label: 'Serviço', hint: 'Tela/fluxo de execução de um serviço específico.' },
]

type BpmnConfigSection = 'activity' | 'form' | 'actors' | 'io' | 'rules' | 'transitions' | 'sla' | 'events'
type ClassConfigSection = 'title' | 'form' | 'description' | 'prototype'

interface Props {
  flow: FlowListItem | null
  step: FlowStep | null
  epicForms: FormDef[]
  /** Definições de portal reutilizáveis (página inicial) do épico. */
  servicePortals: ServicePortalDef[]
  /** Workspaces reutilizáveis do épico. */
  workspaces: WorkspaceDef[]
  onMigrateInlineHomeToNewPortal: (flowId: string, stepId: string) => void
  onSetStepType: (flowId: string, stepId: string, type: FlowActivityType, patch?: Partial<FlowStep>) => void
  onUpdateStep: (flowId: string, stepId: string, patch: Partial<FlowStep>) => void
}

function FieldHelpLabel({
  id,
  label,
  help,
  openId,
  onToggle,
}: {
  id: string
  label: string
  help: string
  openId: string | null
  onToggle: (id: string) => void
}) {
  const isOpen = openId === id
  return (
    <span className="acc__label flow-step-config__label-help">
      <span className="flow-step-config__label-help-head">
        <span>{label}</span>
        <button
          type="button"
          className="flow-step-config__help"
          onClick={() => onToggle(id)}
          aria-label={`Ajuda sobre ${label}`}
          aria-expanded={isOpen}
          aria-controls={`help-${id}`}
        >
          ?
        </button>
      </span>
      {isOpen ? (
        <span id={`help-${id}`} className="flow-step-config__help-card" role="note">
          {help}
        </span>
      ) : null}
    </span>
  )
}

export default function FlowStepConfigPanel({
  flow,
  step,
  epicForms,
  servicePortals,
  workspaces,
  onMigrateInlineHomeToNewPortal,
  onSetStepType,
  onUpdateStep,
}: Props) {
  const [pendingType, setPendingType] = useState<FlowActivityType | null>(null)
  const [pendingServicePortalSubtype, setPendingServicePortalSubtype] = useState<ServicePortalSubtype | null>(null)
  const [openHelpId, setOpenHelpId] = useState<string | null>(null)
  const [bpmnOpen, setBpmnOpen] = useState<Record<BpmnConfigSection, boolean>>(() => ({
    activity: true,
    form: false,
    actors: false,
    io: false,
    rules: false,
    transitions: false,
    sla: false,
    events: false,
  }))

  const [htmlPresentationAccordionOpen, setHtmlPresentationAccordionOpen] = useState(true)
  const [classOpen, setClassOpen] = useState<Record<ClassConfigSection, boolean>>(() => ({
    title: true,
    form: false,
    description: false,
    prototype: false,
  }))
  const [openClassMethodProtoById, setOpenClassMethodProtoById] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setBpmnOpen({
      activity: true,
      form: false,
      actors: false,
      io: false,
      rules: false,
      transitions: false,
      sla: false,
      events: false,
    })
    setPendingServicePortalSubtype(null)
    setOpenHelpId(null)
    setHtmlPresentationAccordionOpen(true)
    setClassOpen({
      title: true,
      form: false,
      description: false,
      prototype: false,
    })
    setOpenClassMethodProtoById({})
  }, [flow?.id, step?.id])

  useEffect(() => {
    setOpenClassMethodProtoById({})
  }, [step?.linkedFormId])

  useEffect(() => {
    if (pendingType !== 'servicePortal') {
      setPendingServicePortalSubtype(null)
    }
  }, [pendingType])

  if (!flow || !step) {
    return (
      <aside className="sidebar flow-step-config">
        <header className="panel-header">
          <h2 className="panel-header__title">Atividade</h2>
        </header>
        <p className="sidebar__empty">Selecione uma etapa na lista de fluxos.</p>
      </aside>
    )
  }

  const flowId = flow.id
  const stepId = step.id
  /** Referência estável para o TS após o guard `!step` (funções abaixo fecham sobre ela). */
  const st: FlowStep = step
  const needsType = stepNeedsTypeChoice(st)
  const resolved = resolvedActivityType(st)
  const flowSteps = flow.steps ?? []
  const possiblePaths = st.bpmnPossiblePaths ?? []
  const methodFormType = st.methodFormType === 'output' ? 'output' : 'input'
  const isMethodOutputForm = resolved === 'method' && methodFormType === 'output'
  const confirmNavId = st.bpmnFormConfirmNavigateStepId?.trim() ?? ''
  const confirmNavInFlow = confirmNavId ? flowSteps.some((s) => s.id === confirmNavId) : false
  const linkedClassFormId = st.linkedFormId?.trim() ?? ''
  const linkedClassForm = useMemo(
    () => (linkedClassFormId ? epicForms.find((f) => f.id === linkedClassFormId) : undefined),
    [epicForms, linkedClassFormId],
  )

  function updatePossiblePath(index: number, patch: Partial<BpmnPossiblePath>) {
    onUpdateStep(flowId, stepId, {
      bpmnPossiblePaths: possiblePaths.map((path, i) => (i === index ? { ...path, ...patch } : path)),
    })
  }

  function addPossiblePath() {
    onUpdateStep(flowId, stepId, {
      bpmnPossiblePaths: [...possiblePaths, { key: '', value: '' }],
    })
  }

  function removePossiblePath(index: number) {
    const next = possiblePaths.filter((_, i) => i !== index)
    onUpdateStep(flowId, stepId, {
      bpmnPossiblePaths: next.length > 0 ? next : undefined,
    })
  }

  const businessRules = bpmnRulesListResolved(st)

  function updateBusinessRule(index: number, value: string) {
    const base = bpmnRulesListResolved(st)
    const next = base.map((r, i) => (i === index ? value : r))
    const allEmpty = next.every((s) => !s.trim())
    onUpdateStep(flowId, stepId, {
      bpmnRuleList: allEmpty ? undefined : next,
      bpmnRules: undefined,
    })
  }

  function addBusinessRule() {
    const base = bpmnRulesListResolved(st)
    onUpdateStep(flowId, stepId, {
      bpmnRuleList: [...base, ''],
      bpmnRules: undefined,
    })
  }

  function removeBusinessRule(index: number) {
    const base = bpmnRulesListResolved(st)
    const next = base.filter((_, i) => i !== index)
    const allEmpty = next.every((s) => !s.trim())
    onUpdateStep(flowId, stepId, {
      bpmnRuleList: allEmpty ? undefined : next,
      bpmnRules: undefined,
    })
  }

  function confirmType() {
    if (!pendingType) return
    const typePatch =
      pendingType === 'servicePortal' && pendingServicePortalSubtype
        ? { servicePortalSubtype: pendingServicePortalSubtype }
        : undefined
    onSetStepType(flowId, stepId, pendingType, typePatch)
    setPendingType(null)
    setPendingServicePortalSubtype(null)
  }

  function toggleBpmnSection(id: BpmnConfigSection) {
    setBpmnOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleClassSection(id: ClassConfigSection) {
    setClassOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleClassMethodProto(methodId: string) {
    setOpenClassMethodProtoById((prev) => ({ ...prev, [methodId]: !prev[methodId] }))
  }

  function setClassMethodNavigateStep(methodId: string, targetStepId: string) {
    const base = { ...(st.classMethodNavigateStepIds ?? {}) }
    const v = targetStepId.trim()
    if (v === '') delete base[methodId]
    else base[methodId] = v
    onUpdateStep(flowId, stepId, {
      classMethodNavigateStepIds: Object.keys(base).length > 0 ? base : undefined,
    })
  }

  function formMethodKindLabel(kind: string): string {
    if (kind === 'menu') return 'Menu'
    return 'Destaque'
  }

  function toggleHelp(id: string) {
    setOpenHelpId((prev) => (prev === id ? null : id))
  }

  return (
    <aside className="sidebar flow-step-config">
      <header className="panel-header">
        <h2 className="panel-header__title">Atividade</h2>
        <p className="flow-step-config__subtitle">
          {flow.name} · {step.title}
        </p>
      </header>

      <div
        className={`flow-step-config__body${resolved === 'html' ? ' flow-step-config__body--html-fill' : ''}${resolved === 'bpmnActivity' || resolved === 'method' || resolved === 'servicePortal' || resolved === 'workspace' || resolved === 'class' ? ' flow-step-config__body--bpmn' : ''}`}
      >
        {needsType ? (
          <section className="flow-step-config__section">
            <h3 className="flow-step-config__heading">Definir tipo</h3>
            <p className="flow-step-config__intro">
              Escolha o tipo desta etapa. <strong>Não poderá ser alterado depois.</strong>
            </p>
            <div className="flow-step-config__type-grid" role="radiogroup" aria-label="Tipo da etapa">
              {TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flow-step-config__type-card">
                  <input
                    type="radio"
                    name="flow-step-type"
                    value={opt.value}
                    checked={pendingType === opt.value}
                    onChange={() => setPendingType(opt.value)}
                  />
                  <span className="flow-step-config__type-card-title">{opt.label}</span>
                  <span className="flow-step-config__type-card-hint">{opt.hint}</span>
                </label>
              ))}
            </div>
            {pendingType === 'servicePortal' ? (
              <section className="flow-step-config__section">
                <h3 className="flow-step-config__heading">Subtipo do portal de serviços</h3>
                <div className="flow-step-config__type-grid" role="radiogroup" aria-label="Subtipo do portal de serviços">
                  {SERVICE_PORTAL_SUBTYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flow-step-config__type-card">
                      <input
                        type="radio"
                        name="flow-step-service-portal-subtype"
                        value={opt.value}
                        checked={pendingServicePortalSubtype === opt.value}
                        onChange={() => setPendingServicePortalSubtype(opt.value)}
                      />
                      <span className="flow-step-config__type-card-title">{opt.label}</span>
                      <span className="flow-step-config__type-card-hint">{opt.hint}</span>
                    </label>
                  ))}
                </div>
              </section>
            ) : null}
            <button
              type="button"
              className="flow-step-config__confirm"
              disabled={!pendingType || (pendingType === 'servicePortal' && !pendingServicePortalSubtype)}
              onClick={confirmType}
            >
              Confirmar tipo
            </button>
          </section>
        ) : resolved === 'html' ? (
          <section className="flow-step-config__section flow-step-config__section--html-fill">
            <h3 className="flow-step-config__heading">HTML livre</h3>
            <p className="flow-step-config__intro">
              Vincule uma classe para preencher placeholders <code>{'{{id_do_campo}}'}</code> no preview com o preset
              de exemplo activo.
            </p>
            <label className="acc__field">
              <span className="acc__label">Classe / formulário (modelo)</span>
              <select
                className="acc__input"
                value={st.linkedFormId ?? ''}
                onChange={(e) =>
                  onUpdateStep(flowId, stepId, {
                    linkedFormId: e.target.value.trim() === '' ? undefined : e.target.value,
                  })
                }
              >
                <option value="">— Nenhum (HTML estático) —</option>
                {epicForms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.id})
                  </option>
                ))}
              </select>
            </label>
            <div className={`acc${htmlPresentationAccordionOpen ? ' acc--open' : ''} flow-step-config__html-pres-acc`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => setHtmlPresentationAccordionOpen((v) => !v)}
                aria-expanded={htmlPresentationAccordionOpen}
              >
                <span className="acc__header-main">
                  <span className="acc__name">Header</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {htmlPresentationAccordionOpen ? (
                <div className="acc__body flow-step-config__html-pres-body">
                  <label className="acc__field acc__field--row flow-step-config__html-pres-toggle-row">
                    <span className="acc__label">Mostrar header</span>
                    <button
                      type="button"
                      className={`acc__toggle${st.htmlPresentationShowHeader ? ' acc__toggle--on' : ''}`}
                      onClick={() =>
                        onUpdateStep(flowId, stepId, {
                          htmlPresentationShowHeader: !st.htmlPresentationShowHeader,
                        })
                      }
                      role="switch"
                      aria-checked={Boolean(st.htmlPresentationShowHeader)}
                      aria-label="Mostrar header"
                    >
                      <span className="acc__toggle-thumb" />
                    </button>
                  </label>
                  <label className="acc__field">
                    <span className="acc__label">Título do header</span>
                    <input
                      type="text"
                      className="acc__input"
                      value={st.htmlPresentationHeaderTitle ?? ''}
                      placeholder={st.title?.trim() || 'Título da página'}
                      disabled={!st.htmlPresentationShowHeader}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          htmlPresentationHeaderTitle:
                            e.target.value.trim() === '' ? undefined : e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              ) : null}
            </div>
            <div className="flow-step-config__label flow-step-config__label--editor">
              <span className="flow-step-config__label-text">Conteúdo HTML</span>
              <Suspense fallback={<p className="flow-step-config__editor-loading">Carregando editor…</p>}>
                <FlowStepHtmlEditor
                  key={stepId}
                  value={step.htmlContent ?? ''}
                  onChange={(htmlContent) => onUpdateStep(flowId, stepId, { htmlContent })}
                />
              </Suspense>
            </div>
          </section>
        ) : resolved === 'bpmnActivity' || resolved === 'method' ? (
          <div className="flow-step-config__bpmn">
            <div className={`acc${bpmnOpen.activity ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleBpmnSection('activity')}
                aria-expanded={bpmnOpen.activity}
                aria-label="Atividade, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Atividade</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {bpmnOpen.activity ? (
                <div className="acc__body">
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-name"
                      label="Nome da atividade"
                      help="Nome que identifica a atividade no fluxo. Deve ser curto, objetivo e orientado a ação."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <input
                      type="text"
                      className="acc__input"
                      value={step.bpmnActivityKey ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          bpmnActivityKey: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="ex.: Formalizar contrato"
                    />
                  </label>
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-type"
                      label="Tipo da atividade"
                      help="Atividade de usuário: tarefa humana típica no processo. Formulário de entrada: etapa centrada em coleta ou validação por formulário."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <select
                      className="acc__input acc__select"
                      value={step.bpmnTaskType === 'entryForm' ? 'entryForm' : 'userTask'}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          bpmnTaskType: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                    >
                      <option value="userTask">Atividade de usuário</option>
                      <option value="entryForm">Formulário de entrada</option>
                    </select>
                  </label>
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-objective"
                      label="Objetivo"
                      help="Descreva o objetivo da etapa e o que precisa acontecer nela para orientar quem vai executar ou validar."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <FlowStepConfigAutosizeTextarea
                      className="acc__input acc__textarea flow-step-config__textarea-doc"
                      value={step.bpmnDescription ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          bpmnDescription: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="Objetivo e contexto desta atividade…"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className={`acc${bpmnOpen.form ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleBpmnSection('form')}
                aria-expanded={bpmnOpen.form}
                aria-label="Formulário, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Formulário</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {bpmnOpen.form ? (
                <div className="acc__body">
                  <p className="flow-step-config__bpmn-subhead">Associação ao processo</p>
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-form"
                      label="Formulário associado"
                      help="Seleciona o formulário usado nesta atividade para coleta/consulta de dados."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <select
                      className={`acc__input acc__select${step.linkedFormId ? '' : ' flow-step-config__select--empty'}`}
                      value={step.linkedFormId ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        onUpdateStep(flowId, stepId, { linkedFormId: v ? v : undefined })
                      }}
                    >
                      <option value="">— Nenhum —</option>
                      {epicForms.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {resolved === 'method' ? (
                    <label className="acc__field">
                      <FieldHelpLabel
                        id="method-form-type"
                        label="Tipo de formulário"
                        help="Formulário de entrada: igual ao modo edição com botões de ação. Formulário de saída: mesmo layout base, mas em somente leitura e sem botões vermelho/verde."
                        openId={openHelpId}
                        onToggle={toggleHelp}
                      />
                      <select
                        className="acc__input acc__select"
                        value={methodFormType}
                        onChange={(e) => {
                          const v = e.target.value === 'output' ? 'output' : 'input'
                          onUpdateStep(flowId, stepId, {
                            methodFormType: v,
                            bpmnFormConfirmNavigateStepId:
                              v === 'output' ? undefined : st.bpmnFormConfirmNavigateStepId,
                          })
                        }}
                      >
                        <option value="input">Formulário de entrada</option>
                        <option value="output">Formulário de saída</option>
                      </select>
                    </label>
                  ) : null}
                  <p className="flow-step-config__bpmn-subhead">Prototipação</p>
                  {isMethodOutputForm ? (
                    <p className="flow-step-config__placeholder-msg">
                      No modo «Formulário de saída», o preview fica sem os botões vermelho/verde; por isso não há etapa
                      de confirmação.
                    </p>
                  ) : (
                    <label className="acc__field">
                      <FieldHelpLabel
                        id="bpmn-form-confirm-nav"
                        label="Etapa ao confirmar (botão verde)"
                        help="Só no preview desta ferramenta: ao clicar no botão verde do rodapé do formulário, a etapa selecionada na lista de fluxos muda para a escolhida (mesmo fluxo). Não substitui descrição de rotas do processo em produção."
                        openId={openHelpId}
                        onToggle={toggleHelp}
                      />
                      <select
                        className={`acc__input acc__select${confirmNavId && confirmNavInFlow ? '' : ' flow-step-config__select--empty'}`}
                        value={confirmNavInFlow ? confirmNavId : confirmNavId ? '__orphan__' : ''}
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === '' || v === '__orphan__') {
                            onUpdateStep(flowId, stepId, { bpmnFormConfirmNavigateStepId: undefined })
                            return
                          }
                          onUpdateStep(flowId, stepId, { bpmnFormConfirmNavigateStepId: v })
                        }}
                      >
                        <option value="">— Nenhuma —</option>
                        {confirmNavId && !confirmNavInFlow ? (
                          <option value="__orphan__">(etapa removida ou outro fluxo)</option>
                        ) : null}
                        {flowSteps.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title?.trim() || s.id}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              ) : null}
            </div>

            <div className={`acc${bpmnOpen.actors ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleBpmnSection('actors')}
                aria-expanded={bpmnOpen.actors}
                aria-label="Atores, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Atores</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {bpmnOpen.actors ? (
                <div className="acc__body">
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-role"
                      label="Papel / responsável"
                      help="Papel organizacional responsável por executar a atividade (ex.: Ordenador de despesa)."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <input
                      type="text"
                      className="acc__input"
                      value={step.assigneeRole ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          assigneeRole: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="ex.: gestor_compras"
                    />
                  </label>
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-role-description"
                      label="Descrição do papel"
                      help="Explique de onde vem o ator, quem é, quais regras definem o atendimento por essa pessoa ou perfil (ex.: matriz no RH, delegação, plantão)."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <FlowStepConfigAutosizeTextarea
                      className="acc__input acc__textarea flow-step-config__textarea-doc"
                      value={step.assigneeRoleDetail ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          assigneeRoleDetail: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="Ex.: ator resolvido pelo cadastro de lotação; só gestores com alçada acima de X…"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            {resolved === 'bpmnActivity' ? (
            <div className={`acc${bpmnOpen.io ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleBpmnSection('io')}
                aria-expanded={bpmnOpen.io}
                aria-label="Entradas e saídas, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Entradas e saídas</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {bpmnOpen.io ? (
                <div className="acc__body">
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-inputs"
                      label="Entradas"
                      help="Liste dados, documentos ou identificadores necessários para iniciar a atividade (um item por linha). Com formulário associado, cite rótulos ou ids de campo quando fizer sentido para rastreabilidade."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <FlowStepConfigAutosizeTextarea
                      className="acc__input acc__textarea flow-step-config__textarea-doc"
                      value={step.bpmnInputs ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          bpmnInputs: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="Um item por linha (ex.: Identificador do empenho)."
                    />
                  </label>
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-outputs"
                      label="Saídas"
                      help="Liste resultados gerados pela atividade (status, justificativa, documentos, atualizações etc.), um item por linha. Com formulário associado, cite campos alterados ou produzidos quando ajudar o leitor."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <FlowStepConfigAutosizeTextarea
                      className="acc__input acc__textarea flow-step-config__textarea-doc"
                      value={step.bpmnOutputs ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          bpmnOutputs: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="Um item por linha (ex.: Status: Aprovado ou Rejeitado)."
                    />
                  </label>
                </div>
              ) : null}
            </div>
            ) : null}

            <div className={`acc${bpmnOpen.rules ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleBpmnSection('rules')}
                aria-expanded={bpmnOpen.rules}
                aria-label="Regras de negócio, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Regras de negócio</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {bpmnOpen.rules ? (
                <div className="acc__body">
                  <div className="flow-step-config__rules-block">
                    <FieldHelpLabel
                      id="bpmn-rules"
                      label="Regras"
                      help="Uma entrada por regra (validações, políticas, lógica de ramificação em texto). Para condição → destino enxuto use Caminhos possíveis; para um salto único no preview use «Etapa ao confirmar» no formulário."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <div className="flow-step-config__rules">
                      {businessRules.length > 0 ? (
                        <div className="flow-step-config__rules-list">
                          {businessRules.map((rule, index) => {
                            const rnLabel = `RN${index + 1}`
                            return (
                            <div key={`rule-${index}`} className="flow-step-config__rules-card">
                              <div className="flow-step-config__rules-card-head">
                                <span className="flow-step-config__rules-card-title">{rnLabel}</span>
                                <button
                                  type="button"
                                  className="flow-step-config__rules-remove"
                                  onClick={() => removeBusinessRule(index)}
                                  aria-label={`Remover ${rnLabel}`}
                                >
                                  <span className="material-symbols-outlined" aria-hidden>
                                    delete
                                  </span>
                                </button>
                              </div>
                              <FlowStepConfigAutosizeTextarea
                                className="acc__input acc__textarea flow-step-config__textarea-doc flow-step-config__rules-textarea"
                                value={rule}
                                onChange={(e) => updateBusinessRule(index, e.target.value)}
                                placeholder="Ex.: aprovação exige anexo e alçada do gestor."
                                aria-label={`Texto de ${rnLabel}`}
                              />
                            </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="flow-step-config__placeholder-msg">Nenhuma regra cadastrada.</p>
                      )}
                      <button type="button" className="acc__nested-add flow-step-config__rules-add" onClick={addBusinessRule}>
                        + Adicionar regra
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={`acc${bpmnOpen.transitions ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleBpmnSection('transitions')}
                aria-expanded={bpmnOpen.transitions}
                aria-label="Caminhos possíveis, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Caminhos possíveis</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {bpmnOpen.transitions ? (
                <div className="acc__body">
                  <div className="flow-step-config__paths-block">
                    <FieldHelpLabel
                      id="bpmn-paths"
                      label="Caminhos possíveis"
                      help="Prototipação: uma linha por saída (condição → destino em texto). A lógica e validações ficam em Regras de negócio; o botão verde no formulário cobre um salto único no preview desta ferramenta."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <div className="flow-step-config__paths">
                      {possiblePaths.length > 0 ? (
                        <div className="flow-step-config__paths-list">
                          {possiblePaths.map((path, index) => (
                            <div key={`${index}-${path.key}-${path.value}`} className="flow-step-config__paths-card">
                              <div className="flow-step-config__paths-card-head">
                                <span className="flow-step-config__paths-card-title">Caminho {index + 1}</span>
                                <button
                                  type="button"
                                  className="flow-step-config__paths-remove"
                                  onClick={() => removePossiblePath(index)}
                                  aria-label={`Remover caminho ${index + 1}`}
                                >
                                  <span className="material-symbols-outlined" aria-hidden>
                                    delete
                                  </span>
                                </button>
                              </div>
                              <div className="flow-step-config__paths-card-fields">
                                <label className="acc__field flow-step-config__paths-field">
                                  <span className="acc__label">Condição</span>
                                  <input
                                    type="text"
                                    className="acc__input"
                                    value={path.key}
                                    onChange={(e) => updatePossiblePath(index, { key: e.target.value })}
                                    placeholder="Ex.: Aprovado, valor acima do limite…"
                                    autoComplete="off"
                                  />
                                </label>
                                <span className="flow-step-config__paths-arrow" aria-hidden>
                                  →
                                </span>
                                <label className="acc__field flow-step-config__paths-field">
                                  <span className="acc__label">Destino</span>
                                  <input
                                    type="text"
                                    className="acc__input"
                                    value={path.value}
                                    onChange={(e) => updatePossiblePath(index, { value: e.target.value })}
                                    placeholder="Ex.: próxima etapa ou nome da atividade"
                                    autoComplete="off"
                                  />
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="flow-step-config__placeholder-msg">Nenhum caminho cadastrado.</p>
                      )}
                      <button type="button" className="acc__nested-add flow-step-config__paths-add" onClick={addPossiblePath}>
                        + Adicionar caminho
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {resolved === 'bpmnActivity' ? (
            <div className={`acc${bpmnOpen.sla ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleBpmnSection('sla')}
                aria-expanded={bpmnOpen.sla}
                aria-label="SLA, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">SLA</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {bpmnOpen.sla ? (
                <div className="acc__body">
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-sla"
                      label="Tempo máximo de execução"
                      help="SLA da atividade: prazo esperado para conclusão a partir do início da etapa."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <input
                      type="text"
                      className="acc__input"
                      value={step.bpmnSla ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          bpmnSla: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="ex.: 2 dias"
                    />
                  </label>
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-sla-exceeded"
                      label="Se ultrapassar o SLA"
                      help="Descreva o comportamento quando o prazo máximo for estourado: escalonamento, notificação, mudança de rota, penalidade, registro em auditoria etc."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <FlowStepConfigAutosizeTextarea
                      className="acc__input acc__textarea flow-step-config__textarea-doc"
                      value={step.bpmnSlaIfExceeded ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          bpmnSlaIfExceeded: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="Ex.: notificar gestor imediato; reatribuir para fila de urgência…"
                    />
                  </label>
                </div>
              ) : null}
            </div>
            ) : null}

            {resolved === 'bpmnActivity' ? (
            <div className={`acc${bpmnOpen.events ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleBpmnSection('events')}
                aria-expanded={bpmnOpen.events}
                aria-label="Eventos, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Eventos</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {bpmnOpen.events ? (
                <div className="acc__body">
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-on-start"
                      label="Ao iniciar"
                      help="Eventos/ações automáticas disparadas quando a atividade começa (ex.: registrar log, notificar área)."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <FlowStepConfigAutosizeTextarea
                      className="acc__input acc__textarea flow-step-config__textarea-doc"
                      value={step.bpmnOnStartEvent ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          bpmnOnStartEvent: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="Ações disparadas ao iniciar a atividade."
                    />
                  </label>
                  <label className="acc__field">
                    <FieldHelpLabel
                      id="bpmn-on-complete"
                      label="Ao concluir"
                      help="Eventos/ações automáticas disparadas quando a atividade termina (ex.: atualizar status, registrar histórico)."
                      openId={openHelpId}
                      onToggle={toggleHelp}
                    />
                    <FlowStepConfigAutosizeTextarea
                      className="acc__input acc__textarea flow-step-config__textarea-doc"
                      value={step.bpmnOnCompleteEvent ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          bpmnOnCompleteEvent: e.target.value === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="Ações disparadas ao finalizar a atividade."
                    />
                  </label>
                </div>
              ) : null}
            </div>
            ) : null}
          </div>
        ) : resolved === 'servicePortal' ? (
          <ServicePortalConfig
            step={st}
            onUpdateStep={(patch: Partial<FlowStep>) => onUpdateStep(flowId, stepId, patch)}
            homePortals={servicePortals}
            flowSteps={flow.steps ?? []}
            onMigrateInlineHomeToNewPortal={() => onMigrateInlineHomeToNewPortal(flowId, stepId)}
          />
        ) : resolved === 'workspace' ? (
          <FlowWorkspaceStepConfig
            step={st}
            workspaces={workspaces}
            epicForms={epicForms}
            flowSteps={flow.steps ?? []}
            onUpdateStep={(patch) => onUpdateStep(flowId, stepId, patch)}
          />
        ) : resolved === 'class' ? (
          <div className="flow-step-config__bpmn">
            <div className={`acc${classOpen.title ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleClassSection('title')}
                aria-expanded={classOpen.title}
                aria-label="Título, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Título</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {classOpen.title ? (
                <div className="acc__body">
                  <label className="acc__field">
                    <span className="acc__label">Título da classe (preview)</span>
                    <input
                      type="text"
                      className="acc__input"
                      value={st.classPresentationTitle ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          classPresentationTitle: e.target.value.trim() === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder={st.title?.trim() || 'Classe'}
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className={`acc${classOpen.form ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleClassSection('form')}
                aria-expanded={classOpen.form}
                aria-label="Formulário associado, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Formulário associado</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {classOpen.form ? (
                <div className="acc__body">
                  <label className="acc__field">
                    <span className="acc__label">Classe/Formulário</span>
                    <select
                      className={`acc__input acc__select${st.linkedFormId ? '' : ' flow-step-config__select--empty'}`}
                      value={st.linkedFormId ?? ''}
                      onChange={(e) => {
                        const v = e.target.value.trim()
                        onUpdateStep(flowId, stepId, {
                          linkedFormId: v === '' ? undefined : v,
                          classMethodNavigateStepIds: undefined,
                        })
                      }}
                    >
                      <option value="">— Nenhum —</option>
                      {epicForms.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {st.linkedFormId && !epicForms.some((f) => f.id === st.linkedFormId) ? (
                    <p className="flow-step-config__placeholder-msg" role="alert">
                      O id <code>{st.linkedFormId}</code> não corresponde a nenhuma classe deste épico.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className={`acc${classOpen.description ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleClassSection('description')}
                aria-expanded={classOpen.description}
                aria-label="Descrição da classe, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Descrição da classe</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {classOpen.description ? (
                <div className="acc__body">
                  <label className="acc__field">
                    <span className="acc__label">Descrição</span>
                    <FlowStepConfigAutosizeTextarea
                      className="acc__input acc__textarea flow-step-config__textarea-doc"
                      value={st.classPresentationDescription ?? ''}
                      onChange={(e) =>
                        onUpdateStep(flowId, stepId, {
                          classPresentationDescription: e.target.value.trim() === '' ? undefined : e.target.value,
                        })
                      }
                      placeholder="Contexto da classe, objetivo da tela e o que deve ser observado nesta etapa."
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className={`acc${classOpen.prototype ? ' acc--open' : ''}`}>
              <button
                type="button"
                className="acc__header"
                onClick={() => toggleClassSection('prototype')}
                aria-expanded={classOpen.prototype}
                aria-label="Prototipação, expandir ou recolher seção de configuração"
              >
                <span className="acc__header-main">
                  <span className="acc__name">Prototipação</span>
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {classOpen.prototype ? (
                <div className="acc__body">
                  {!linkedClassFormId ? (
                    <p className="flow-step-config__placeholder-msg" style={{ margin: 0 }}>
                      Associe um formulário acima para listar os métodos da classe.
                    </p>
                  ) : !linkedClassForm ? (
                    <p className="flow-step-config__placeholder-msg" role="alert" style={{ margin: 0 }}>
                      O id <code>{linkedClassFormId}</code> não corresponde a nenhum formulário deste épico.
                    </p>
                  ) : (linkedClassForm.methods ?? []).length === 0 ? (
                    <p className="flow-step-config__placeholder-msg" style={{ margin: 0 }}>
                      Este formulário não tem métodos configurados (aba Métodos do formulário).
                    </p>
                  ) : (
                    <div className="acc__nested-list">
                      {(linkedClassForm.methods ?? []).map((method) => {
                        const mOpen = Boolean(openClassMethodProtoById[method.id])
                        const methodTitle = (method.name || 'Método').trim() || 'Método'
                        const navTargetRaw = st.classMethodNavigateStepIds?.[method.id]?.trim() ?? ''
                        const navInFlow = navTargetRaw ? flowSteps.some((s) => s.id === navTargetRaw) : false
                        const navSelectValue =
                          navInFlow ? navTargetRaw : navTargetRaw ? '__orphan__' : ''
                        return (
                          <div key={method.id} className={`acc acc--nested${mOpen ? ' acc--open' : ''}`}>
                            <button
                              type="button"
                              className="acc__header acc__header--nested"
                              onClick={() => toggleClassMethodProto(method.id)}
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
                              <svg
                                className="acc__chevron"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden
                              >
                                <path
                                  d="M4 6l4 4 4-4"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            {mOpen ? (
                              <div className="acc__body acc__body--nested">
                                <p className="flow-step-config__placeholder-msg" style={{ margin: '0 0 0.65rem' }}>
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
                                    value={navSelectValue}
                                    onChange={(e) => {
                                      const v = e.target.value
                                      if (v === '' || v === '__orphan__') {
                                        setClassMethodNavigateStep(method.id, '')
                                        return
                                      }
                                      setClassMethodNavigateStep(method.id, v)
                                    }}
                                  >
                                    <option value="">— Nenhuma —</option>
                                    {navTargetRaw && !navInFlow ? (
                                      <option value="__orphan__">(etapa removida ou outro fluxo)</option>
                                    ) : null}
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
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <section className="flow-step-config__section">
            <p className="flow-step-config__placeholder-msg">
              Tipo não reconhecido: <code>{step.type}</code>
            </p>
          </section>
        )}
      </div>
    </aside>
  )
}
