import { forwardRef, useId, useLayoutEffect, useState, type ReactNode, type RefObject } from 'react'
import type { FlowStep } from '../types'
import { assigneeRoleDetailText, bpmnRulesListResolved } from '../utils/flowStep'
import eloGroupLogo from '../assets/elo-group-logo.svg'

export interface FlowStepActivityPreviewDeckProps {
  step: FlowStep
  /** Linha pequena acima do título (ex.: «Atividade de usuário» ou «Workspace»). */
  heroTypeLabel: string
  /** Título principal do hero (ex.: nome da atividade ou do workspace). */
  heroHeadline: string
  /** `aria-label` da `<section>` principal. */
  sectionAriaLabel: string
  /** Bloco final dentro de `flow-bpmn-preview__panels` (ex.: `flow-bpmn-preview__form-frame` + conteúdo). */
  children: ReactNode
  /** Faixa de papel abaixo do hero. */
  showAssigneeSubhero?: boolean
  /**
   * Texto antes do nome do papel na faixa (ex.: «Atendimento realizado por » na BPMN, «Acessado por: » no workspace).
   */
  assigneeSubheroPrefix?: string
  /**
   * Só atividade BPMN: objetivo, «detalhamento» (entradas/saídas, regras, caminhos, SLA, eventos).
   * Na etapa workspace use `false` — lá o papel vem de `showAssigneeSubhero` + dados da sidebar, não de campos BPMN.
   */
  showActivityMetadata?: boolean
  /**
   * Tipo «Método»: mesmo detalhamento que BPMN, exceto entradas/saídas, SLA e eventos (ainda configuráveis no JSON legado, mas não exibidos aqui).
   */
  omitIoSlaEventsFromSpecDetail?: boolean
}

/**
 * Capa comum do preview de etapa no fluxo: hero, opcionalmente faixa de papel (`showAssigneeSubhero`),
 * opcionalmente painéis BPMN (`showActivityMetadata`), depois o slot (`children`).
 */
const FlowStepActivityPreviewDeck = forwardRef<HTMLElement, FlowStepActivityPreviewDeckProps>(
  function FlowStepActivityPreviewDeck(
    {
      step,
      heroTypeLabel,
      heroHeadline,
      sectionAriaLabel,
      children,
      showAssigneeSubhero = true,
      showActivityMetadata = true,
      omitIoSlaEventsFromSpecDetail = false,
      assigneeSubheroPrefix = 'Atendimento realizado por ',
    },
    ref,
  ) {
    const roleDetailPanelId = useId()
    const specDetailRegionId = useId()
    const [roleDetailOpen, setRoleDetailOpen] = useState(false)
    const [specDetailOpen, setSpecDetailOpen] = useState(false)

    useLayoutEffect(() => {
      const el =
        ref != null && typeof ref === 'object' && 'current' in ref
          ? (ref as RefObject<HTMLElement | null>).current
          : null
      if (el) {
        el.scrollTop = 0
        el.scrollLeft = 0
      }
    }, [ref, step.id])

    const assigneeRoleLabel = step.assigneeRole?.trim() || 'Papel'
    const roleDescriptionText = assigneeRoleDetailText(step).trim()
    const hasRoleDescription = Boolean(roleDescriptionText)
    const activityDescriptionRaw = step.bpmnDescription?.trim() ?? ''
    const hasObjective = Boolean(activityDescriptionRaw)
    const inputItems = (step.bpmnInputs ?? '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    const outputItems = (step.bpmnOutputs ?? '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    const rulesItems = bpmnRulesListResolved(step)
      .map((item) => item.trim())
      .filter(Boolean)
    const possiblePaths = (step.bpmnPossiblePaths ?? [])
      .map((path) => ({ key: path.key.trim(), value: path.value.trim() }))
      .filter((path) => path.key || path.value)
    const slaMaxRaw = step.bpmnSla?.trim() ?? ''
    const slaExceededRaw = step.bpmnSlaIfExceeded?.trim() ?? ''
    const hasSlaMax = Boolean(slaMaxRaw)
    const hasSlaExceeded = Boolean(slaExceededRaw)
    const hasSlaSection = hasSlaMax || hasSlaExceeded
    const onStartRaw = step.bpmnOnStartEvent?.trim() ?? ''
    const onCompleteRaw = step.bpmnOnCompleteEvent?.trim() ?? ''
    const hasOnStart = Boolean(onStartRaw)
    const hasOnComplete = Boolean(onCompleteRaw)
    const hasEventsSection = hasOnStart || hasOnComplete
    const hasInputs = inputItems.length > 0
    const hasOutputs = outputItems.length > 0
    const hasIoSection = hasInputs || hasOutputs
    const hasRulesSection = rulesItems.length > 0
    const hasTransitionsSection = possiblePaths.length > 0
    const omitIoSlaEvents = omitIoSlaEventsFromSpecDetail === true
    const showIoSection = !omitIoSlaEvents && hasIoSection
    const showSlaSection = !omitIoSlaEvents && hasSlaSection
    const showEventsSection = !omitIoSlaEvents && hasEventsSection
    const hasSpecDetailContent =
      showIoSection || hasRulesSection || hasTransitionsSection || showSlaSection || showEventsSection
    const hasObjectivePanel = hasObjective || hasSpecDetailContent
    const specDetailShown = specDetailOpen && hasSpecDetailContent

    return (
      <section ref={ref} className="canvas flow-bpmn-preview" aria-label={sectionAriaLabel}>
        <div className="flow-bpmn-preview__deck">
          <header className="flow-bpmn-preview__hero" role="banner">
            <div className="flow-bpmn-preview__hero-inner">
              <div className="flow-bpmn-preview__hero-titles">
                <p className="flow-bpmn-preview__hero-type" aria-label={`Tipo: ${heroTypeLabel}`}>
                  {heroTypeLabel}
                </p>
                <h1 className="flow-bpmn-preview__headline">{heroHeadline}</h1>
              </div>
              <img src={eloGroupLogo} alt="Logo EloGroup" className="flow-bpmn-preview__hero-logo" />
            </div>
          </header>
          {showAssigneeSubhero ? (
            <div className="flow-bpmn-preview__subhero" role="note" aria-label="Papel responsável pela atividade">
              <div className="flow-bpmn-preview__subhero-row">
                <span className="flow-bpmn-preview__subhero-line">
                  <span className="flow-bpmn-preview__subhero-text">{assigneeSubheroPrefix}</span>
                  <span className="flow-bpmn-preview__subhero-role">{assigneeRoleLabel}</span>
                </span>
                {hasRoleDescription ? (
                  <button
                    type="button"
                    className={`flow-bpmn-preview__subhero-help${roleDetailOpen ? ' flow-bpmn-preview__subhero-help--active' : ''}`}
                    aria-expanded={roleDetailOpen}
                    aria-controls={roleDetailPanelId}
                    onClick={() => setRoleDetailOpen((open) => !open)}
                    aria-label={roleDetailOpen ? 'Ocultar descrição do papel' : 'Mostrar descrição do papel'}
                  >
                    <span className="flow-bpmn-preview__subhero-help-char" aria-hidden>
                      ?
                    </span>
                  </button>
                ) : null}
              </div>
              {hasRoleDescription && roleDetailOpen ? (
                <p id={roleDetailPanelId} className="flow-bpmn-preview__subhero-role-detail">
                  {roleDescriptionText}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flow-bpmn-preview__panels">
            {showActivityMetadata && hasObjectivePanel ? (
              <article
                className="flow-bpmn-preview__panel flow-bpmn-preview__panel--actors"
                aria-label="Objetivo da atividade"
              >
                {hasObjective ? (
                  <div className="flow-bpmn-preview__actor-block">
                    <span className="flow-bpmn-preview__actor-label">Objetivo</span>
                    <p className="flow-bpmn-preview__actor-value flow-bpmn-preview__actor-value--detail">
                      {activityDescriptionRaw}
                    </p>
                  </div>
                ) : null}
                {hasSpecDetailContent ? (
                  <button
                    type="button"
                    className={`flow-bpmn-preview__spec-toggle${specDetailShown ? ' flow-bpmn-preview__spec-toggle--open' : ''}`}
                    aria-expanded={specDetailShown}
                    aria-controls={specDetailRegionId}
                    onClick={() => setSpecDetailOpen((v) => !v)}
                  >
                    <span className="flow-bpmn-preview__spec-toggle-label">
                      {specDetailShown ? 'Ocultar detalhamento da atividade' : 'Mostrar detalhamento da atividade'}
                    </span>
                    <svg
                      className="flow-bpmn-preview__spec-toggle-chevron"
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
                ) : null}
              </article>
            ) : null}

            {showActivityMetadata && specDetailShown ? (
              <div id={specDetailRegionId} className="flow-bpmn-preview__spec-detail-stack">
                {showIoSection ? (
                  <article
                    className="flow-bpmn-preview__panel flow-bpmn-preview__panel--actors"
                    aria-label="Entradas e saídas"
                  >
                    <h2 className="flow-bpmn-preview__spec-block-title">Entradas e saídas</h2>
                    <div className="flow-bpmn-preview__subcard-stack">
                      {hasInputs ? (
                        <div className="flow-bpmn-preview__subcard">
                          <div className="flow-bpmn-preview__subcard-field">
                            <span className="flow-bpmn-preview__subcard-field-label">Entradas</span>
                            <ul className="flow-bpmn-preview__list flow-bpmn-preview__list--in-subcard">
                              {inputItems.map((item, index) => (
                                <li key={`${item}-${index}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null}
                      {hasOutputs ? (
                        <div className="flow-bpmn-preview__subcard">
                          <div className="flow-bpmn-preview__subcard-field">
                            <span className="flow-bpmn-preview__subcard-field-label">Saídas</span>
                            <ul className="flow-bpmn-preview__list flow-bpmn-preview__list--in-subcard">
                              {outputItems.map((item, index) => (
                                <li key={`${item}-${index}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ) : null}

                {hasRulesSection ? (
                  <article
                    className="flow-bpmn-preview__panel flow-bpmn-preview__panel--actors"
                    aria-label="Regras de negócio"
                  >
                    <h2 className="flow-bpmn-preview__spec-block-title">Regras de negócio</h2>
                    <div className="flow-bpmn-preview__subcard-stack">
                      {rulesItems.map((item, index) => (
                        <div
                          key={`rn-${item}-${index}`}
                          className="flow-bpmn-preview__subcard flow-bpmn-preview__subcard--rule-inline"
                        >
                          <span className="flow-bpmn-preview__subcard-rule-id">{`RN${index + 1}`}</span>
                          <p className="flow-bpmn-preview__subcard-text">{item}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ) : null}

                {hasTransitionsSection ? (
                  <article
                    className="flow-bpmn-preview__panel flow-bpmn-preview__panel--actors"
                    aria-label="Caminhos possíveis"
                  >
                    <h2 className="flow-bpmn-preview__spec-block-title">Caminhos possíveis</h2>
                    <div className="flow-bpmn-preview__subcard-stack">
                      {possiblePaths.map((path, index) => {
                        const pathKey = path.key
                        const pathVal = path.value
                        const showKey = Boolean(pathKey)
                        const showVal = Boolean(pathVal)
                        const showArrow = showKey && showVal
                        return (
                          <div key={`${pathKey}-${pathVal}-${index}`} className="flow-bpmn-preview__trans-path">
                            <p className="flow-bpmn-preview__subcard-kicker">{`Caminho ${index + 1}`}</p>
                            <div className="flow-bpmn-preview__trans-path-row">
                              {showKey ? (
                                <div className="flow-bpmn-preview__trans-path-chip">
                                  <span className="flow-bpmn-preview__trans-path-chip-label">Condição</span>
                                  <p className="flow-bpmn-preview__trans-path-chip-value">{pathKey}</p>
                                </div>
                              ) : null}
                              {showArrow ? (
                                <span className="flow-bpmn-preview__trans-path-arrow" aria-hidden>
                                  →
                                </span>
                              ) : null}
                              {showVal ? (
                                <div className="flow-bpmn-preview__trans-path-chip">
                                  <span className="flow-bpmn-preview__trans-path-chip-label">Destino</span>
                                  <p className="flow-bpmn-preview__trans-path-chip-value">{pathVal}</p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </article>
                ) : null}

                {showSlaSection ? (
                  <article className="flow-bpmn-preview__panel flow-bpmn-preview__panel--actors" aria-label="SLA">
                    <h2 className="flow-bpmn-preview__spec-block-title">SLA</h2>
                    <div className="flow-bpmn-preview__subcard-stack">
                      {hasSlaMax ? (
                        <div className="flow-bpmn-preview__subcard">
                          <div className="flow-bpmn-preview__subcard-field">
                            <span className="flow-bpmn-preview__subcard-field-label">Tempo máximo de execução</span>
                            <p className="flow-bpmn-preview__subcard-field-value">{slaMaxRaw}</p>
                          </div>
                        </div>
                      ) : null}
                      {hasSlaExceeded ? (
                        <div className="flow-bpmn-preview__subcard">
                          <div className="flow-bpmn-preview__subcard-field">
                            <span className="flow-bpmn-preview__subcard-field-label">Se ultrapassar o SLA</span>
                            <p className="flow-bpmn-preview__subcard-field-value">{slaExceededRaw}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ) : null}

                {showEventsSection ? (
                  <article className="flow-bpmn-preview__panel flow-bpmn-preview__panel--actors" aria-label="Eventos">
                    <h2 className="flow-bpmn-preview__spec-block-title">Eventos</h2>
                    <div className="flow-bpmn-preview__subcard-stack">
                      {hasOnStart ? (
                        <div className="flow-bpmn-preview__subcard">
                          <div className="flow-bpmn-preview__subcard-field">
                            <span className="flow-bpmn-preview__subcard-field-label">Ao iniciar</span>
                            <p className="flow-bpmn-preview__subcard-field-value">{onStartRaw}</p>
                          </div>
                        </div>
                      ) : null}
                      {hasOnComplete ? (
                        <div className="flow-bpmn-preview__subcard">
                          <div className="flow-bpmn-preview__subcard-field">
                            <span className="flow-bpmn-preview__subcard-field-label">Ao concluir</span>
                            <p className="flow-bpmn-preview__subcard-field-value">{onCompleteRaw}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ) : null}
              </div>
            ) : null}

            {children}
          </div>
        </div>
      </section>
    )
  },
)

export default FlowStepActivityPreviewDeck
