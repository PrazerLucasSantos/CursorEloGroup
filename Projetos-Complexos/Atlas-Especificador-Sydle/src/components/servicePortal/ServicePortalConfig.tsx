import { useEffect, useMemo, useState } from 'react'
import type {
  FlowStep,
  ServicePortalCatalogService,
  ServicePortalDef,
  ServicePortalHomeCatalogSection,
  ServicePortalSubtype,
} from '../../types'
import {
  clearInlineServicePortalHomeFields,
  getServicePortalNestedCatalogs,
  hasInlineServicePortalHomeContent,
  homePageDataFromStep,
  defToHomePageData,
} from '../../utils/servicePortalHomeData'
import FlowStepConfigAutosizeTextarea from '../FlowStepConfigAutosizeTextarea'
import ServicePortalServiceConfig from './ServicePortalServiceConfig'

const chevron = (
  <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface Props {
  step: FlowStep
  onUpdateStep: (patch: Partial<FlowStep>) => void
  /** Portais reutilizáveis (página inicial) do épico. */
  homePortals: ServicePortalDef[]
  /** Etapas do fluxo atual (dropdown de destino ao clicar num serviço do catálogo). */
  flowSteps: FlowStep[]
  /** Copia a config legada (inline na etapa) para um novo portal e vincula. */
  onMigrateInlineHomeToNewPortal: () => void
}

interface CatalogServiceRow {
  catalog: ServicePortalHomeCatalogSection
  service: ServicePortalCatalogService
}

function collectCatalogServices(
  catalogs: ServicePortalHomeCatalogSection[],
): CatalogServiceRow[] {
  const rows: CatalogServiceRow[] = []
  for (const catalog of catalogs) {
    for (const service of catalog.services ?? []) {
      rows.push({ catalog, service })
    }
  }
  return rows
}

export default function ServicePortalConfig({
  step,
  onUpdateStep,
  homePortals,
  flowSteps,
  onMigrateInlineHomeToNewPortal,
}: Props) {
  const [openPortalLinked, setOpenPortalLinked] = useState(true)
  const [openRole, setOpenRole] = useState(false)
  const [openProto, setOpenProto] = useState(false)
  const [openProtoServices, setOpenProtoServices] = useState(false)
  const [openServiceProtoById, setOpenServiceProtoById] = useState<Record<string, boolean>>({})
  const servicePortalSubtype = step.servicePortalSubtype?.trim() ?? ''
  const hasLockedServicePortalSubtype =
    servicePortalSubtype === 'homePage' || servicePortalSubtype === 'service'

  const linkedId = step.linkedServicePortalId?.trim() ?? ''
  const linkedDef = linkedId ? homePortals.find((p) => p.id === linkedId) : undefined
  const hasLegacyInline = hasInlineServicePortalHomeContent(step)

  /** Dados da home efetiva (portal vinculado tem prioridade; senão, inline legado). */
  const homePageData = useMemo(() => {
    if (linkedDef) return defToHomePageData(linkedDef)
    return homePageDataFromStep(step)
  }, [linkedDef, step])

  const catalogServiceRows = useMemo(
    () => collectCatalogServices(getServicePortalNestedCatalogs(homePageData)),
    [homePageData],
  )

  useEffect(() => {
    setOpenPortalLinked(true)
    setOpenRole(false)
    setOpenProto(false)
    setOpenProtoServices(false)
    setOpenServiceProtoById({})
  }, [step.id])

  useEffect(() => {
    setOpenProtoServices(false)
    setOpenServiceProtoById({})
  }, [linkedId])

  function toggleServiceProto(serviceId: string) {
    setOpenServiceProtoById((prev) => ({ ...prev, [serviceId]: !prev[serviceId] }))
  }

  function setServiceNavigateStep(serviceId: string, targetStepId: string) {
    const base = { ...(step.servicePortalServiceNavigateStepIds ?? {}) }
    const v = targetStepId.trim()
    if (v === '') delete base[serviceId]
    else base[serviceId] = v
    onUpdateStep({
      servicePortalServiceNavigateStepIds: Object.keys(base).length > 0 ? base : undefined,
    })
  }

  function setLinkedPortalId(id: string | undefined) {
    if (id) {
      onUpdateStep({ linkedServicePortalId: id, ...clearInlineServicePortalHomeFields() })
    } else {
      onUpdateStep({ linkedServicePortalId: undefined })
    }
  }

  return (
    <>
      {!hasLockedServicePortalSubtype ? (
        <div className="flow-step-config__section">
          <label className="acc__field">
            <span className="acc__label">Subtipo</span>
            <select
              className="acc__input acc__select"
              value={servicePortalSubtype}
              onChange={(e) =>
                onUpdateStep({
                  servicePortalSubtype: e.target.value === '' ? undefined : (e.target.value as ServicePortalSubtype),
                })
              }
            >
              <option value="">Selecione</option>
              <option value="homePage">Página inicial</option>
              <option value="service">Serviço</option>
            </select>
          </label>
        </div>
      ) : null}

      {hasLockedServicePortalSubtype && servicePortalSubtype === 'homePage' ? (
        <div className="flow-step-config__bpmn">
          <div className={`acc${openPortalLinked ? ' acc--open' : ''}`}>
            <button
              type="button"
              className="acc__header"
              onClick={() => setOpenPortalLinked((v) => !v)}
              aria-expanded={openPortalLinked}
              aria-label="Portal vinculado, expandir ou recolher"
            >
              <span className="acc__header-main">
                <span className="acc__name">Portal vinculado</span>
              </span>
              {chevron}
            </button>
            {openPortalLinked ? (
              <div className="acc__body">
                {hasLegacyInline && !linkedId ? (
                  <>
                    <p className="flow-step-config__placeholder-msg" style={{ marginTop: 0 }}>
                      Esta etapa ainda tem configuração de página embutida (formato antigo). Importe para um portal
                      reutilizável para continuar editando na aba <strong>Portais</strong>.
                    </p>
                    <button
                      type="button"
                      className="acc__nested-add"
                      onClick={onMigrateInlineHomeToNewPortal}
                      style={{ width: '100%', marginBottom: '0.65rem' }}
                    >
                      Importar conteúdo desta etapa para um novo portal
                    </button>
                  </>
                ) : null}

                {linkedId && !linkedDef ? (
                  <p className="flow-step-config__placeholder-msg" role="alert">
                    O id <code>{linkedId}</code> não corresponde a nenhum portal deste épico. Escolha outro ou crie um
                    novo.
                  </p>
                ) : null}

                <label className="acc__field">
                  <span className="acc__label">Portal</span>
                  <select
                    className="acc__input acc__select"
                    value={linkedId}
                    onChange={(e) => {
                      const v = e.target.value.trim()
                      setLinkedPortalId(v === '' ? undefined : v)
                    }}
                  >
                    <option value="">(selecione)</option>
                    {homePortals.map((p) => (
                      <option key={p.id} value={p.id}>
                        {(p.name || 'Portal').trim() || p.id}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="acc__field">
                  <span className="acc__label">Descrição do portal (preview)</span>
                  <FlowStepConfigAutosizeTextarea
                    className="acc__input acc__textarea flow-step-config__textarea-doc"
                    value={step.servicePortalPresentationDescription ?? ''}
                    onChange={(e) =>
                      onUpdateStep({
                        servicePortalPresentationDescription: e.target.value === '' ? undefined : e.target.value,
                      })
                    }
                    placeholder="Contexto desta etapa, o que o usuário vê no portal, escopo do vínculo…"
                  />
                </label>

                {homePortals.length === 0 ? (
                  <p className="flow-step-config__placeholder-msg">
                    Ainda não há portais neste épico. Use a aba <strong>Portais</strong> na lista do épico para criar ou
                    importar definições.
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
                <div className={`acc acc--nested${openProtoServices ? ' acc--open' : ''}`}>
                  <button
                    type="button"
                    className="acc__header acc__header--nested"
                    onClick={() => setOpenProtoServices((v) => !v)}
                    aria-expanded={openProtoServices}
                    aria-label="Serviços, expandir ou recolher"
                  >
                    <span className="acc__header-main">
                      <span className="acc__name">Serviços</span>
                    </span>
                    {chevron}
                  </button>
                  {openProtoServices ? (
                    <div className="acc__body acc__body--nested">
                      {linkedId && !linkedDef ? (
                        <p className="flow-step-config__placeholder-msg" style={{ margin: 0 }}>
                          Selecione um portal vinculado válido para listar os serviços.
                        </p>
                      ) : !linkedDef && !hasLegacyInline ? (
                        <p className="flow-step-config__placeholder-msg" style={{ margin: 0 }}>
                          Selecione um portal vinculado para listar os serviços do catálogo.
                        </p>
                      ) : catalogServiceRows.length === 0 ? (
                        <p className="flow-step-config__placeholder-msg" style={{ margin: 0 }}>
                          Nenhum serviço cadastrado no catálogo deste portal.
                        </p>
                      ) : (
                        <div className="acc__nested-list">
                          {catalogServiceRows.map(({ catalog, service }, idx) => {
                            const svcOpen = Boolean(openServiceProtoById[service.id])
                            const serviceName =
                              service.name.trim() || `Serviço ${idx + 1}`
                            const catalogName =
                              catalog.name.trim() || 'Catálogo'
                            const navTarget =
                              step.servicePortalServiceNavigateStepIds?.[service.id] ?? ''
                            return (
                              <div
                                key={service.id}
                                className={`acc acc--nested${svcOpen ? ' acc--open' : ''}`}
                              >
                                <button
                                  type="button"
                                  className="acc__header acc__header--nested"
                                  onClick={() => toggleServiceProto(service.id)}
                                  aria-expanded={svcOpen}
                                  aria-label={`${serviceName}, expandir ou recolher`}
                                >
                                  <span className="acc__header-main">
                                    {service.icon ? (
                                      <span
                                        className="material-symbols-outlined"
                                        aria-hidden
                                        style={{ fontSize: '1.1rem', opacity: 0.85 }}
                                      >
                                        {service.icon}
                                      </span>
                                    ) : null}
                                    <span className="acc__name">{serviceName}</span>
                                  </span>
                                  {chevron}
                                </button>
                                {svcOpen ? (
                                  <div className="acc__body acc__body--nested">
                                    <p
                                      className="flow-step-config__placeholder-msg"
                                      style={{ margin: '0 0 0.65rem' }}
                                    >
                                      Catálogo: <strong>{catalogName}</strong>
                                    </p>
                                    <label className="acc__field">
                                      <span className="acc__label">Etapa ao clicar no serviço</span>
                                      <select
                                        className="acc__input acc__select"
                                        value={navTarget}
                                        onChange={(e) =>
                                          setServiceNavigateStep(service.id, e.target.value)
                                        }
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
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {servicePortalSubtype === 'service' ? (
        <ServicePortalServiceConfig step={step} onUpdateStep={onUpdateStep} />
      ) : null}
    </>
  )
}
