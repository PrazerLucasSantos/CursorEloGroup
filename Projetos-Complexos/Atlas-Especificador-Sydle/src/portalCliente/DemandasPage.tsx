import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { AnexoLoadedItem, AnexoUpload } from './AnexoField'
import { PESSOA_LOGADA_INICIAL } from './portalClientePessoaData'
import { formatBRL } from './portalClienteData'
import { useDemandasShared } from '../shared/demandaSharedStore'
import {
  CARGOS_CLIENTE,
  CLIENTE_PORTAL,
  CONTATOS_SECUNDARIOS,
  CONTRATOS_CLIENTE,
  PERFIS_DEMO,
  SOLUCAO_A_QUALIFICAR,
  SOLUCAO_OUTROS,
  STATUS_DEMANDA,
  SUPORTE_BACKLOG_F3,
  TIPOS_DEMANDA,
  acoesDisponiveis,
  aplicarAcao,
  badgeClassSla,
  badgeClassStatusDemanda,
  contratoPorNumero,
  contratoPorSolucao,
  criarDemandaDeDraft,
  DEMANDA_ATENDIMENTO_REGISTROS,
  DEMANDA_ATENDIMENTO_NEC_DESC,
  emptyDemandaDraft,
  estagioTimeline,
  formatDataDemanda,
  formatVigenciaContrato,
  labelTimeline,
  proximoPassoCliente,
  resumoRelogiosSla,
  type ResumoRelogioSla,
  percentualConsumidoContrato,
  saldoGlobalContrato,
  avaliarSaudeContrato,
  saudeExibeAlerta,
  solucaoNoCatalogo,
  todasSolucoesCatalogo,
  tabVisivelPortal,
  TIMELINE_ESTAGIOS,
  USUARIO_LOGADO,
  visibilidadeCamposDemandaPortal,
  type ContratoDemanda,
  type AcaoDemanda,
  type AcaoDef,
  type CargoCliente,
  type Demanda,
  type DemandaFormDraft,
  type DemandaRegistroTexto,
  type MetricaContrato,
  type OrigemDemanda,
  type OrcamentoItem,
  type PerfilDemo,
  type StatusDemanda,
  type TipoAnaliseDemanda,
  type TipoDemanda,
  type TipoOs,
} from './portalClienteDemandaData'

type Painel = 'lista' | 'detalhe'
type NovaPasso = 'tipo' | 'ident' | 'desc'

function draftComResponsavel(origem: OrigemDemanda): DemandaFormDraft {
  const tel =
    PESSOA_LOGADA_INICIAL.telefones.find((t) => t.tipo === 'Celular')?.numero ??
    PESSOA_LOGADA_INICIAL.telefones[0]?.numero ??
    ''
  return {
    ...emptyDemandaDraft(origem),
    responsavelAbertura: PESSOA_LOGADA_INICIAL.nome,
    contatoCpf: PESSOA_LOGADA_INICIAL.cpf,
    contatoEmail: PESSOA_LOGADA_INICIAL.emailPrincipal,
    contatoNumero: tel,
  }
}

type Props = {
  onHome: () => void
  onToast: (msg: string) => void
  /** Ao registrar demanda — sincroniza Meu painel / solicitações do portal. */
  onDemandaCriada?: (demanda: Demanda) => void
  /** Abre direto o formulário de nova demanda. */
  abrirNovaAoMontar?: boolean
  /**
   * `mti` = simulação do Projeto Atlas / BO (não é portal).
   * `cliente` = portal do cliente.
   * `parceiro` = portal do parceiro.
   */
  modo?: 'cliente' | 'mti' | 'parceiro'
  /** Filtro inicial de status (ex.: vindo do Dash). */
  filtroStatusInicial?: StatusDemanda | ''
  /**
   * Trava o perfil e esconde o seletor.
   * Sem isso, a tela permite trocar Cliente / Parceiro / MTI para teste.
   */
  perfilFixo?: 'Cliente' | 'Parceiro' | 'MTI'
}

function PainelContrato({
  contrato,
  compact = false,
}: {
  contrato: ContratoDemanda
  compact?: boolean
}) {
  const pct = percentualConsumidoContrato(contrato)
  const saldo = saldoGlobalContrato(contrato)
  const saude = avaliarSaudeContrato(contrato)
  const tone =
    saude.status === 'Saudável' ? 'ok' : saude.status === 'Atenção' ? 'warn' : 'crit'

  return (
    <article className="sy-dem-ctr-panel" aria-label={`Contrato ${contrato.numero}`}>
      <header className="sy-dem-ctr-panel__head">
        <div className="sy-dem-ctr-panel__id">
          <span className="sy-dem-ctr-panel__nro">{contrato.numero}</span>
          <h4 className="sy-dem-ctr-panel__nome">{contrato.nome}</h4>
          {!compact ? (
            <p className="sy-dem-ctr-panel__resumo">{contrato.resumoVinculo}</p>
          ) : null}
        </div>
        <span
          className={`sy-dem-ctr-panel__saude sy-dem-ctr-panel__saude--${tone}`}
          title={saude.mensagem}
        >
          {saude.status}
        </span>
      </header>

      <div className="sy-dem-ctr-panel__kpis">
        <div className="sy-dem-ctr-panel__kpi">
          <span>Saldo global</span>
          <strong>{formatBRL(saldo)}</strong>
        </div>
        <div className="sy-dem-ctr-panel__kpi">
          <span>Consumo acumulado</span>
          <strong>
            {formatBRL(contrato.saldoConsumido)} · {pct}%
          </strong>
        </div>
        <div className="sy-dem-ctr-panel__kpi">
          <span>OS abertas</span>
          <strong>{contrato.osAbertas}</strong>
        </div>
        <div className="sy-dem-ctr-panel__kpi">
          <span>Provisionado</span>
          <strong>{formatBRL(contrato.provisionado)}</strong>
        </div>
      </div>

      <div className="sy-dem-ctr-panel__bar" aria-hidden>
        <div
          className={`sy-dem-ctr-panel__bar-fill sy-dem-ctr-panel__bar-fill--${tone}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className="sy-dem-ctr-panel__saude-msg">{saude.mensagem}</p>

      {!compact ? (
        <>
          <div className="sy-dem-ctr-panel__meta-row">
            <span>
              <strong>Vigência</strong> {formatVigenciaContrato(contrato)}
            </span>
            <span>
              <strong>OS ref.</strong> {contrato.ordemServico}
            </span>
          </div>
          <dl className="sy-dem-ctr-panel__dl">
            <div>
              <dt>Contratante</dt>
              <dd>{contrato.contratante}</dd>
            </div>
            <div>
              <dt>Contratada</dt>
              <dd>{contrato.contratada}</dd>
            </div>
            <div>
              <dt>Processo administrativo</dt>
              <dd>{contrato.processoAdministrativo}</dd>
            </div>
            <div>
              <dt>Fundamento legal</dt>
              <dd>{contrato.fundamento}</dd>
            </div>
            {contrato.solucoes.length > 0 ? (
              <div className="sy-dem-ctr-panel__solucoes">
                <dt>Soluções vinculadas</dt>
                <dd>
                  <ul>
                    {contrato.solucoes.map((s) => (
                      <li key={s.nome}>
                        {s.nome}
                        {s.parceria && s.parceiro ? ` · ${s.parceiro}` : ''}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>
        </>
      ) : null}
    </article>
  )
}

/** Conteúdo da aba SLA — dois relógios + estágio (simples e organizado). */
function AbaSla({
  d,
  asTag,
  showOrcamento = false,
}: {
  d: Demanda
  asTag: boolean
  showOrcamento?: boolean
}) {
  const [demanda, execucao] = resumoRelogiosSla(d)
  const estagio = estagioTimeline(d.status)
  const estagioLabel = TIMELINE_ESTAGIOS[estagio - 1] ?? '—'
  const orcamentoSla =
    d.slaPrazoAssinaturaOrcamento ||
    (d.orcamento?.validade ? `Até ${d.orcamento.validade}` : null)

  function bloco(r: ResumoRelogioSla) {
    return (
      <article
        key={r.id}
        className={`sy-dem-sla-aba__bloco${r.ativo ? ' is-active' : ''}`}
      >
        <header className="sy-dem-sla-aba__bloco-head">
          <h4 className="sy-dem-sla-aba__bloco-title">{r.rotulo}</h4>
          <DemFlag asTag={asTag} badgeClass={badgeClassSla(r.situacao)}>
            {r.situacao}
          </DemFlag>
        </header>
        <dl className="sy-dem-sla-aba__dl">
          <div>
            <dt>Início</dt>
            <dd>{r.inicioExibicao}</dd>
          </div>
          {r.tempoDecorrido ? (
            <div>
              <dt>Tempo</dt>
              <dd>{r.tempoDecorrido}</dd>
            </div>
          ) : null}
          {r.prazoDeclarado ? (
            <div>
              <dt>Prazo</dt>
              <dd>{r.prazoDeclarado}</dd>
            </div>
          ) : null}
        </dl>
      </article>
    )
  }

  return (
    <section className="sy-dem-sla-aba" aria-label="SLA">
      <p className="sy-dem-sla-aba__lead">
        A demanda conta desde o registro. A execução só após autorização e assinaturas.
        {d.slaFinalizacao
          ? ` Contagem encerrada em ${formatDataDemanda(d.slaFinalizacao)}.`
          : ''}
      </p>

      <div className="sy-dem-sla-aba__grid">
        {bloco(demanda)}
        {bloco(execucao)}
      </div>

      <div className="sy-dem-sla-aba__rodape">
        <div className="sy-dem-sla-aba__estagio">
          <span className="sy-dem-sla-aba__estagio-kicker">Linha do tempo</span>
          <strong>
            Estágio {estagio} de {TIMELINE_ESTAGIOS.length}
          </strong>
          <span>{estagioLabel}</span>
        </div>
        {showOrcamento && orcamentoSla ? (
          <div className="sy-dem-sla-aba__orc">
            <span className="sy-dem-sla-aba__estagio-kicker">Assinatura do orçamento</span>
            <strong>{orcamentoSla}</strong>
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** Resumo pós-registro: confirmação, próximo passo do cliente e SLA. */
function BannerPosEnvioDemanda({
  d,
  asTag,
  onDismiss,
}: {
  d: Demanda
  asTag: boolean
  onDismiss: () => void
}) {
  const passo = proximoPassoCliente(d)
  return (
    <section className="sy-dem-pos-envio" aria-label="Demanda registrada">
      <div className="sy-dem-pos-envio__hero">
        <span className="material-symbols-outlined sy-dem-pos-envio__icon" aria-hidden>
          task_alt
        </span>
        <div>
          <h3 className="sy-dem-pos-envio__title">Demanda registrada</h3>
          <p className="sy-dem-pos-envio__sub">
            <strong>{d.numero}</strong> · {d.tipo} · {d.status}
          </p>
          <p className="sy-dem-pos-envio__sla-note">
            SLA iniciado em <strong>{formatDataDemanda(d.slaInicio || d.criadoEm)}</strong>
            {' · '}
            detalhes na aba SLA
          </p>
        </div>
        <button
          type="button"
          className="sy-dem-pos-envio__dismiss"
          onClick={onDismiss}
          aria-label="Ocultar resumo de confirmação"
        >
          <span className="material-symbols-outlined" aria-hidden>
            close
          </span>
        </button>
      </div>
      <div className="sy-dem-pos-envio__passo">
        <span className="sy-dem-pos-envio__passo-kicker">Próximo passo do cliente</span>
        <strong className="sy-dem-pos-envio__passo-titulo">{passo.titulo}</strong>
        <p className="sy-dem-pos-envio__passo-texto">{passo.texto}</p>
      </div>
    </section>
  )
}

/** Abas do detalhe — cliente (mínimo + solicitação). */
const DEMANDA_DETAIL_TABS = [
  { id: 'andamento', title: 'Dados da demanda' },
  { id: 'solicitacao', title: 'Dados da solicitação' },
  { id: 'sla', title: 'SLA' },
  { id: 'necessidade', title: 'Contrato e solução' },
  { id: 'acoes', title: 'Ações' },
] as const

/**
 * Abas MTI / parceiro (visão operacional completa).
 * `solicitacao` = só o que o cliente/parceiro informou na abertura.
 */
const DEMANDA_DETAIL_TABS_OPERACIONAL = [
  { id: 'andamento', title: 'Dados da demanda' },
  { id: 'solicitacao', title: 'Dados da solicitação' },
  { id: 'sla', title: 'SLA' },
  { id: 'necessidade', title: 'Contrato e solução' },
  { id: 'fila', title: 'Responsáveis e parceiros' },
  { id: 'atendimento-mti', title: 'Atendimento MTI' },
  { id: 'atendimento-parceiro', title: 'Atendimento parceiro' },
  { id: 'assinaturas', title: 'Assinaturas' },
  { id: 'entregavel', title: 'Entrega / termo' },
  { id: 'os-orc', title: 'OS / orçamento' },
  { id: 'projeto', title: 'Projeto / execução' },
  { id: 'historico', title: 'Histórico' },
  { id: 'acoes', title: 'Ações' },
] as const

/** @deprecated Use DEMANDA_DETAIL_TABS_OPERACIONAL */
const DEMANDA_DETAIL_TABS_PARCEIRO = DEMANDA_DETAIL_TABS_OPERACIONAL

/**
 * Tags coloridas só no Atlas / BO MTI.
 * Portais cliente e parceiro: texto simples, sem cor de badge.
 */
function DemFlag({
  asTag,
  badgeClass,
  children,
  title,
  extraClass,
}: {
  asTag: boolean
  badgeClass?: string
  children: ReactNode
  title?: string
  extraClass?: string
}) {
  if (!asTag) {
    return (
      <span className={`pc-dem-plain${extraClass ? ` ${extraClass}` : ''}`} title={title} role="listitem">
        {children}
      </span>
    )
  }
  return (
    <span
      className={`pc-badge ${badgeClass ?? ''}${extraClass ? ` ${extraClass}` : ''}`}
      title={title}
      role="listitem"
    >
      {children}
    </span>
  )
}

/** Painel de aba — layout modal Carta Consulta / Sydle. */
function DemandaTabPanel({
  id,
  activeId,
  children,
}: {
  id: string
  activeId: string
  children: ReactNode
}) {
  if (activeId !== id) return null
  return (
    <div
      className="sy-carta-tabpanel"
      role="tabpanel"
      id={`dem-tab-${id}`}
      aria-labelledby={`dem-tab-btn-${id}`}
    >
      {children}
    </div>
  )
}

/** dd/mm/aaaa hh:mm — cabeçalho de registro textual (padrão Observações). */
function formatRegistroEm(quando: Date = new Date()): string {
  const dd = String(quando.getDate()).padStart(2, '0')
  const mm = String(quando.getMonth() + 1).padStart(2, '0')
  const yyyy = quando.getFullYear()
  const hh = String(quando.getHours()).padStart(2, '0')
  const mi = String(quando.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
}

function novoRegistroTexto(autor: string): DemandaRegistroTexto {
  return {
    id: `reg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    autor,
    em: formatRegistroEm(),
    conteudo: '',
  }
}

/**
 * Campo de lista textual do Atendimento MTI (anexo Observações):
 * rótulo + círculo «+»; cada registro = acordeão Autor/data, Conteúdo e exclusão.
 */
function DemandaAtendimentoRegistrosField({
  label,
  registros,
  editable,
  onChange,
}: {
  label: string
  registros: DemandaRegistroTexto[]
  editable: boolean
  onChange: (next: DemandaRegistroTexto[]) => void
}) {
  const [openById, setOpenById] = useState<Record<string, boolean>>({})

  function toggleOpen(id: string) {
    setOpenById((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }))
  }

  function addRegistro() {
    if (!editable) return
    const novo = novoRegistroTexto(PESSOA_LOGADA_INICIAL.nome || USUARIO_LOGADO)
    setOpenById((prev) => ({ ...prev, [novo.id]: true }))
    onChange([...registros, novo])
  }

  function removeRegistro(id: string) {
    if (!editable) return
    onChange(registros.filter((r) => r.id !== id))
    setOpenById((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function patchConteudo(id: string, conteudo: string) {
    if (!editable) return
    onChange(registros.map((r) => (r.id === id ? { ...r, conteudo } : r)))
  }

  const hasRows = registros.length > 0

  return (
    <div className={`sy-dem-registros${hasRows ? ' sy-dem-registros--boxed' : ''}`}>
      <span className="sy-dem-label">{label}</span>
      {hasRows ? (
        <div className="sy-dem-registros__stack">
          {registros.map((r) => {
            const open = openById[r.id] ?? true
            return (
              <div key={r.id} className="sy-dem-registros__item">
                <div
                  className={`sy-dem-registros__header${open ? ' sy-dem-registros__header--open' : ''}`}
                >
                  <button
                    type="button"
                    className={`sy-dem-registros__trigger${open ? ' sy-dem-registros__trigger--open' : ''}`}
                    onClick={() => toggleOpen(r.id)}
                    aria-expanded={open}
                  >
                    <svg
                      className="sy-dem-registros__chevron"
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
                    <span className="sy-dem-registros__title">
                      {r.autor} / {r.em}
                    </span>
                  </button>
                  {editable ? (
                    <div className="sy-dem-registros__actions">
                      <button
                        type="button"
                        className="sy-dem-registros__icon-btn"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeRegistro(r.id)
                        }}
                        aria-label={`Excluir registro de ${label}`}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="sy-dem-registros__icon-btn"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        aria-label="Mais opções"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>
                    </div>
                  ) : null}
                </div>
                {open ? (
                  <div className="sy-dem-registros__panel">
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Conteúdo</span>
                      <textarea
                        className="sy-dem-input sy-dem-input--area"
                        rows={3}
                        readOnly={!editable}
                        placeholder="vazio"
                        value={r.conteudo}
                        onChange={(e) => patchConteudo(r.id, e.target.value)}
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
      {editable ? (
        <button
          type="button"
          className="sy-dem-registros__add"
          onClick={addRegistro}
          aria-label={hasRows ? `Adicionar outro registro em ${label}` : `Adicionar registro em ${label}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

/** Botões de ação segmentados (estilo Sim/Não) — texto da ação no botão; campos abaixo. */
function SyAcaoBotoes({
  opcoes,
  ativaId,
  onSelect,
  ariaLabel,
}: {
  opcoes: { id: string; label: string }[]
  ativaId: string | null
  onSelect: (opcao: { id: string; label: string } | null) => void
  ariaLabel?: string
}) {
  return (
    <div className="sy-sim-nao-field">
      <div className="sy-sim-nao sy-sim-nao--acoes" role="group" aria-label={ariaLabel ?? 'Ações'}>
        {opcoes.map((o) => {
          const on = ativaId === o.id
          return (
            <button
              key={o.id}
              type="button"
              className={`sy-sim-nao__btn${on ? ' is-on' : ''}`}
              aria-pressed={on}
              onClick={() => onSelect(on ? null : o)}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const ACOES_DECISAO_N2 = ['aprovar_gestor', 'devolver_gestor', 'recusar_gestor'] as const

export default function DemandasPage({
  onHome,
  onToast,
  onDemandaCriada,
  abrirNovaAoMontar,
  modo = 'cliente',
  filtroStatusInicial = '',
  perfilFixo,
}: Props) {
  const modoMti = modo === 'mti'
  /** Portal do parceiro (chrome); a visão de dados segue o perfil selecionado. */
  const portalParceiro = modo === 'parceiro' || perfilFixo === 'Parceiro'
  /** Listagem/header Sydle (portal cliente e parceiro). MTI Atlas mantém layout de fila. */
  const listaSydle = !modoMti
  const portalCamposCondicionais = !modoMti
  const esconderSimulador = Boolean(perfilFixo) || modoMti
  const [painel, setPainel] = useState<Painel>('lista')
  const [criando, setCriando] = useState(Boolean(abrirNovaAoMontar))
  const [demandas, setDemandas] = useDemandasShared()
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null)
  /** Destaca confirmação + próximo passo logo após registrar demanda. */
  const [posEnvioDemandaId, setPosEnvioDemandaId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<string>('andamento')
  const [filtroStatus, setFiltroStatus] = useState<StatusDemanda | ''>(filtroStatusInicial)
  const [filtroNumero, setFiltroNumero] = useState('')
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')
  const [listaPage, setListaPage] = useState(1)
  const [perfil, setPerfil] = useState<PerfilDemo>(() => {
    if (perfilFixo) return perfilFixo
    if (modoMti) return 'MTI'
    if (portalParceiro) return 'Parceiro'
    const p = PESSOA_LOGADA_INICIAL.perfil
    if (p === 'Parceiro') return 'Parceiro'
    return 'Cliente'
  })
  const [cargoCliente, setCargoCliente] = useState<CargoCliente>(() =>
    perfilFixo === 'Cliente' || modo === 'cliente' ? 'Demandante' : 'Gestor',
  )
  const [draft, setDraft] = useState<DemandaFormDraft>(() =>
    draftComResponsavel(
      PESSOA_LOGADA_INICIAL.perfil === 'Parceiro' ? 'Parceiro' : 'Cliente',
    ),
  )
  const [formaPagamentoDraft, setFormaPagamentoDraft] = useState<
    'Indenização' | 'Nova contratação' | 'Desistiu' | ''
  >('')
  const [acaoAtiva, setAcaoAtiva] = useState<AcaoDef | null>(null)
  const [motivo, setMotivo] = useState('')
  const [catalogos, setCatalogos] = useState('')
  const [itensCatalogo, setItensCatalogo] = useState('')
  const [descricaoAtendimento, setDescricaoAtendimento] = useState('')
  const [osVinculada, setOsVinculada] = useState('')
  const [parceiroQualif, setParceiroQualif] = useState('EloGroup')
  const [naturezaQualif, setNaturezaQualif] = useState<
    'Próprio do cliente' | 'Patrocinado (gestão)' | 'Sem contrato'
  >('Próprio do cliente')
  const [produtoQualif, setProdutoQualif] = useState('')
  const [ajusteDesc, setAjusteDesc] = useState('')
  const [ajusteProd, setAjusteProd] = useState('')
  const [ajusteCtr, setAjusteCtr] = useState('')
  const [orcItens, setOrcItens] = useState<OrcamentoItem[]>([])
  const [orcValidade, setOrcValidade] = useState('')
  const [orcObs, setOrcObs] = useState('')
  const [tipoAnaliseDraft, setTipoAnaliseDraft] = useState<TipoAnaliseDemanda>('Licenciamento')
  const [entregavelDraft, setEntregavelDraft] = useState('')
  const [anexosComprovacaoDraft, setAnexosComprovacaoDraft] = useState<
    { id: string; nome: string; tamanhoKb: number }[]
  >([])
  const [necDraft, setNecDraft] = useState('')
  const [valoresDraft, setValoresDraft] = useState('')
  const [prazoExecDraft, setPrazoExecDraft] = useState('')
  const [decisaoAssina, setDecisaoAssina] = useState<'Assinar' | 'Devolver para correção'>('Assinar')
  const [papelAssina, setPapelAssina] = useState<'Gestor' | 'Fiscal' | 'Solicitante'>('Gestor')
  const [papelTermo, setPapelTermo] = useState<'Gestor' | 'Fiscal' | 'Solicitante'>('Gestor')
  const [dilacaoPrazoDraft, setDilacaoPrazoDraft] = useState('')
  const [credenciaisDraft, setCredenciaisDraft] = useState('')
  const [applianceDraft, setApplianceDraft] = useState('')
  const [qtdExecutadaDraft, setQtdExecutadaDraft] = useState('')
  const [comprovFabDraft, setComprovFabDraft] = useState<
    { id: string; nome: string; tamanhoKb: number }[]
  >([])
  const [osAcaoDraft, setOsAcaoDraft] = useState<
    'Vincular OS existente' | 'Criar nova OS' | 'Autorizar consumo em OS existente'
  >('Criar nova OS')
  const [tipoOsDraft, setTipoOsDraft] = useState<TipoOs>('Dedicada')
  const [metricaDraft, setMetricaDraft] = useState<MetricaContrato>('Serviço')
  const [catalogoVersaoDraft, setCatalogoVersaoDraft] = useState('1.5')
  const [decisaoRestituir, setDecisaoRestituir] = useState<'aceitar' | 'ajustar'>('aceitar')
  const [novaPasso, setNovaPasso] = useState<NovaPasso>('tipo')


  useEffect(() => {
    if (abrirNovaAoMontar) abrirNova()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na montagem / flag
  }, [abrirNovaAoMontar])

  const selecionada = useMemo(
    () => demandas.find((d) => d.id === selecionadaId) ?? null,
    [demandas, selecionadaId],
  )

  const visCampos = useMemo(() => {
    if (!selecionada || !portalCamposCondicionais) return null
    return visibilidadeCamposDemandaPortal(selecionada)
  }, [selecionada, portalCamposCondicionais])

  /** Visão de abas/campos segue o perfil sob teste (não o portal de origem). */
  const modoParceiro = perfil === 'Parceiro'
  const vistaMti = perfil === 'MTI'

  const acoes = useMemo(
    () => (selecionada ? acoesDisponiveis(selecionada, perfil, cargoCliente) : []),
    [selecionada, perfil, cargoCliente],
  )

  const detailTabs = useMemo(() => {
    const base =
      modoMti || vistaMti || modoParceiro
        ? DEMANDA_DETAIL_TABS_OPERACIONAL
        : DEMANDA_DETAIL_TABS
    let tabs =
      !portalCamposCondicionais || !visCampos
        ? [...base]
        : base.filter((tab) => tabVisivelPortal(tab.id, visCampos))
    // Sem ações no status atual → não exibe a aba (exceto visão MTI).
    if (!modoMti && !vistaMti && acoes.length === 0) {
      tabs = tabs.filter((t) => t.id !== 'acoes')
    }
    return tabs
  }, [modoParceiro, portalCamposCondicionais, visCampos, modoMti, vistaMti, acoes.length])

  useEffect(() => {
    if (!detailTabs.some((t) => t.id === detailTab)) {
      setDetailTab(detailTabs[0]?.id ?? 'andamento')
    }
  }, [detailTabs, detailTab])

  const filtradas = useMemo(() => {
    let list = [...demandas]
    if (filtroStatus) list = list.filter((d) => d.status === filtroStatus)
    if (filtroNumero.trim()) {
      const q = filtroNumero.trim().toLowerCase()
      list = list.filter((d) => d.numero.toLowerCase().includes(q))
    }
    const dataRef = (d: (typeof demandas)[0]) => d.dataEvento || d.criadoEm
    if (filtroDataInicio.trim()) {
      list = list.filter((d) => dataRef(d).slice(0, 10) >= filtroDataInicio)
    }
    if (filtroDataFim.trim()) {
      list = list.filter((d) => dataRef(d).slice(0, 10) <= filtroDataFim)
    }
    if (perfil === 'Parceiro') {
      list = list.filter((d) => d.parceiroNotificado || d.origem === 'Parceiro')
    } else if (perfil === 'Cliente') {
      // Cliente: demandas da organização (exclui rascunhos só de parceiro não notificados)
      list = list.filter((d) => d.origem !== 'Parceiro' || d.parceiroNotificado)
    }
    // MTI: vê todas
    return list.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
  }, [demandas, filtroStatus, filtroNumero, filtroDataInicio, filtroDataFim, perfil])

  const PAGE_SIZE = 10
  const listaTotalPages = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE))
  const listaPageSafe = Math.min(listaPage, listaTotalPages)
  const filtradasPage = useMemo(() => {
    const start = (listaPageSafe - 1) * PAGE_SIZE
    return filtradas.slice(start, start + PAGE_SIZE)
  }, [filtradas, listaPageSafe])

  const filtroDataLabel = useMemo(() => {
    const fmt = (iso: string) => {
      if (!iso) return ''
      const [y, m, d] = iso.split('-')
      if (!y || !m || !d) return iso
      return `${d}/${m}/${y}`
    }
    if (filtroDataInicio && filtroDataFim) return `${fmt(filtroDataInicio)} - ${fmt(filtroDataFim)}`
    if (filtroDataInicio) return fmt(filtroDataInicio)
    if (filtroDataFim) return fmt(filtroDataFim)
    return ''
  }, [filtroDataInicio, filtroDataFim])

  useEffect(() => {
    setListaPage(1)
  }, [filtroStatus, filtroNumero, filtroDataInicio, filtroDataFim, perfil])

  useEffect(() => {
    if (!selecionadaId) return
    const aindaVisivel = filtradas.some((d) => d.id === selecionadaId)
    if (!aindaVisivel) {
      setSelecionadaId(null)
      setPainel('lista')
      setCriando(false)
    }
  }, [perfil, filtradas, selecionadaId])

  const podeAbrirDemanda = perfil === 'Cliente' || perfil === 'Parceiro' || perfil === 'MTI'
  const origemCadastro: OrigemDemanda =
    perfil === 'Parceiro' ? 'Parceiro' : perfil === 'MTI' ? 'MTI' : 'Cliente'
  const labelAtor =
    perfil === 'MTI'
      ? 'MTI · Projeto Atlas (back-office)'
      : perfil === 'Cliente'
        ? `Cliente · ${cargoCliente}`
        : 'Parceiro'

  function trocarPerfil(proximo: PerfilDemo) {
    setPerfil(proximo)
    setAcaoAtiva(null)
    setMotivo('')
    if (proximo === 'Cliente' && !cargoCliente) setCargoCliente('Demandante')
  }

  const telefonePrincipal =
    PESSOA_LOGADA_INICIAL.telefones.find((t) => t.tipo === 'Celular')?.numero ??
    PESSOA_LOGADA_INICIAL.telefones[0]?.numero ??
    '—'
  const contratoSelecionado =
    (draft.numeroContrato ? contratoPorNumero(draft.numeroContrato) : undefined) ??
    (draft.produtoSolucao &&
    draft.produtoSolucao !== SOLUCAO_OUTROS &&
    draft.produtoSolucao !== SOLUCAO_A_QUALIFICAR
      ? contratoPorSolucao(draft.produtoSolucao)
      : undefined)
  const tipoEscolhido = Boolean(draft.tipo)

  function patchDraft(partial: Partial<DemandaFormDraft>) {
    setDraft((d) => ({ ...d, ...partial }))
  }

  function escolherTipo(t: TipoDemanda) {
    if (t === 'Suporte' && SUPORTE_BACKLOG_F3) {
      onToast('Suporte indisponível no momento. Selecione Consumo.')
      return
    }
    patchDraft({ tipo: t })
    setNovaPasso('ident')
  }

  function voltarTipoDemanda() {
    patchDraft({ tipo: '', produtoSolucao: '', numeroContrato: '' })
    setNovaPasso('tipo')
  }

  function avancarIdent() {
    setNovaPasso('desc')
  }

  function abrirLista() {
    setPainel('lista')
    setSelecionadaId(null)
    setPosEnvioDemandaId(null)
    setCriando(false)
    setAcaoAtiva(null)
    setNovaPasso('tipo')
  }

  function abrirNova() {
    setDraft({
      ...draftComResponsavel(origemCadastro),
      comoDemandante: perfil === 'Cliente' && cargoCliente === 'Demandante',
      openerCargo: perfil === 'Cliente' ? cargoCliente : undefined,
      saudeAckCritica: false,
    })
    setNovaPasso('tipo')
    setCriando(true)
    setAcaoAtiva(null)
  }

  function abrirDetalhe(id: string) {
    setSelecionadaId(id)
    setPosEnvioDemandaId((prev) => (prev === id ? prev : null))
    setPainel('detalhe')
    setCriando(false)
    setAcaoAtiva(null)
    setDetailTab('andamento')
    const d = demandas.find((x) => x.id === id)
    if (d) {
      setAjusteDesc(d.descricao)
      setAjusteProd(d.produtoSolucao)
      setAjusteCtr(d.numeroContrato ?? '')
    }
  }

  function submitNova(e: FormEvent) {
    e.preventDefault()
    const r = criarDemandaDeDraft(
      {
        ...draft,
        comoDemandante: perfil === 'Cliente' && cargoCliente === 'Demandante',
        openerCargo: perfil === 'Cliente' ? cargoCliente : undefined,
      },
      demandas,
    )
    if (!r.ok) {
      onToast(r.erro)
      return
    }
    setDemandas((rows) => [r.demanda, ...rows])
    onDemandaCriada?.(r.demanda)
    onToast(
      `${r.demanda.numero} registrada · ${r.demanda.status}` +
        (r.demanda.parceiroNotificado ? ` · parceiro ${r.demanda.parceiroNome}` : ''),
    )
    setSelecionadaId(r.demanda.id)
    setPosEnvioDemandaId(r.demanda.id)
    setDetailTab('andamento')
    setPainel('detalhe')
    setCriando(false)
    setNovaPasso('tipo')
  }

  function abrirAcao(a: AcaoDef) {
    setAcaoAtiva(a)
    setMotivo('')
    setCatalogos(selecionada?.catalogos ?? '')
    setItensCatalogo(selecionada?.itensCatalogo ?? '')
    setDescricaoAtendimento(selecionada?.descricaoAtendimento ?? '')
    setOsVinculada(selecionada?.osVinculada ?? '')
    setProdutoQualif(selecionada?.produtoSolucao === SOLUCAO_OUTROS || selecionada?.produtoSolucao === SOLUCAO_A_QUALIFICAR ? '' : (selecionada?.produtoSolucao ?? ''))
    setParceiroQualif(selecionada?.parceiroNome ?? '')
    setNaturezaQualif(selecionada?.contratoNatureza ?? 'Próprio do cliente')
    setAjusteCtr(selecionada?.numeroContrato ?? '')
    setTipoAnaliseDraft(selecionada?.tipoAnalise ?? 'Licenciamento')
    setEntregavelDraft(selecionada?.entregavel ?? '')
    setAnexosComprovacaoDraft(
      (selecionada?.anexosComprovacao ?? []).map((a) => ({ ...a })),
    )
    setCredenciaisDraft(selecionada?.credenciaisLicenca ?? '')
    setApplianceDraft(selecionada?.applianceLicenca ?? '')
    setQtdExecutadaDraft(
      selecionada?.quantidadeExecutada != null ? String(selecionada.quantidadeExecutada) : '',
    )
    setComprovFabDraft((selecionada?.comprovacaoFabricanteAnexos ?? []).map((a) => ({ ...a })))
    setNecDraft(selecionada?.necAtendimento ?? '')
    setValoresDraft(selecionada?.valoresContrato ?? '')
    setPrazoExecDraft(selecionada?.slaPrazoDeclarado ?? '')
    setDecisaoAssina('Assinar')
    setPapelAssina(
      cargoCliente === 'Demandante' ? 'Solicitante' : cargoCliente === 'Fiscal' ? 'Fiscal' : 'Gestor',
    )
    setOsAcaoDraft('Criar nova OS')
    setTipoOsDraft(selecionada?.tipoOs ?? 'Dedicada')
    setMetricaDraft(selecionada?.metricaContrato ?? 'Serviço')
    setCatalogoVersaoDraft(selecionada?.catalogoVersaoVigente ?? '1.5')
    setDecisaoRestituir('aceitar')
    if (a.precisaOrcamento) {
      const existing = selecionada?.orcamento?.itens ?? []
      setOrcItens(
        existing.length
          ? existing.map((i) => ({ ...i }))
          : [
              {
                id: crypto.randomUUID(),
                descricao: '',
                quantidade: 1,
                valorUnitario: 0,
                catalogoVersao: 'v1.0',
              },
            ],
      )
      setOrcValidade(selecionada?.orcamento?.validade ?? '')
      setOrcObs(selecionada?.orcamento?.observacoes ?? '')
    }
  }

  function confirmarAcao() {
    if (!selecionada || !acaoAtiva) return
    const r = aplicarAcao(
      selecionada,
      perfil,
      acaoAtiva.id as AcaoDemanda,
      {
        motivo,
        catalogos,
        itensCatalogo,
        descricaoAtendimento,
        osVinculada,
        parceiroNome: parceiroQualif,
        produtoSolucao: acaoAtiva.id === 'ajustar_enviar' ? ajusteProd : produtoQualif || ajusteProd,
        contratoNatureza: naturezaQualif,
        descricao: ajusteDesc,
        numeroContrato: ajusteCtr || undefined,
        orcamentoItens: orcItens,
        orcamentoValidade: orcValidade,
        orcamentoObs: orcObs,
        tipoAnalise: tipoAnaliseDraft,
        entregavel: entregavelDraft || necDraft,
        anexosComprovacao: anexosComprovacaoDraft,
        credenciaisLicenca: credenciaisDraft,
        applianceLicenca: applianceDraft,
        comprovacaoFabricanteAnexos: comprovFabDraft,
        quantidadeExecutada: qtdExecutadaDraft.trim()
          ? Number(qtdExecutadaDraft.replace(',', '.'))
          : undefined,
        necAtendimento: necDraft || entregavelDraft,
        valoresContrato: valoresDraft,
        prazoExecucao: prazoExecDraft,
        decisaoAssinatura: decisaoAssina,
        assinarPapel: papelAssina,
        assinarTermoPapel: papelTermo,
        dilacaoPrazo: dilacaoPrazoDraft,
        osAcao: osAcaoDraft,
        tipoOs: tipoOsDraft,
        metricaContrato: metricaDraft,
        catalogoVersaoVigente: catalogoVersaoDraft,
        decisaoRestituir,
        definirPagamento: formaPagamentoDraft || undefined,
      },
      cargoCliente,
      demandas,
    )
    if (!r.ok) {
      onToast(r.erro)
      return
    }
    const nova = r.novaDemanda
    setDemandas((rows) => {
      const atualizadas = rows.map((d) => (d.id === r.demanda.id ? r.demanda : d))
      return nova ? [nova, ...atualizadas] : atualizadas
    })
    onToast(r.toast)
    setAcaoAtiva(null)
    if (nova) {
      onDemandaCriada?.(nova)
      setSelecionadaId(nova.id)
      setPainel('detalhe')
      setDetailTab('andamento')
    }
  }

  const trail = painel === 'lista' || criando ? ['Demandas'] : ['Demandas', selecionada?.numero ?? 'Detalhe']

  return (
    <section className={`pc-page pc-page--demanda${listaSydle && !criando ? ' pc-page--demanda-sydle' : ''}`}>
      {!(listaSydle && !criando) && (
      <nav className="pc-breadcrumb" aria-label="Trilha">
        <button type="button" onClick={onHome}>
          <span className="material-symbols-outlined" aria-hidden>
            home
          </span>
        </button>
        {trail.map((t, i) => (
          <span key={`${t}-${i}`}>
            <span>/</span>
            {i < trail.length - 1 ? (
              <button type="button" className="pc-linkish" onClick={abrirLista}>
                {t}
              </button>
            ) : (
              <span>{t}</span>
            )}
          </span>
        ))}
      </nav>
      )}

      {!esconderSimulador && (
        <div className="pc-dem-papel" role="group" aria-label="Perfil sob teste">
          <span className="pc-dem-papel__label">Testar como</span>
          {PERFIS_DEMO.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`pc-dem-papel__btn${perfil === p.id ? ' pc-dem-papel__btn--on' : ''}`}
              title={p.hint}
              onClick={() => trocarPerfil(p.id)}
            >
              {p.label}
            </button>
          ))}
          {perfil === 'Cliente' && (
            <>
              <span className="pc-dem-papel__label pc-dem-papel__label--cargo">Cargo</span>
              {CARGOS_CLIENTE.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`pc-dem-papel__btn pc-dem-papel__btn--cargo${cargoCliente === c.id ? ' pc-dem-papel__btn--on' : ''}`}
                  title={c.hint}
                  onClick={() => setCargoCliente(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </>
          )}
          <p className="pc-dem-papel__hint" role="status">
            Visualizando como <strong>{labelAtor}</strong>
            {' · '}
            {filtradas.length} demanda(s) no escopo
            {perfil === 'Parceiro'
              ? ' (notificadas ou abertas pelo parceiro)'
              : perfil === 'Cliente'
                ? ' (visão cliente)'
                : ' (todas — back-office MTI)'}
            . Lista, ações e abas mudam conforme o perfil.
          </p>
        </div>
      )}
      {modoMti && (
        <div className="pc-dem-papel" role="status">
          <span className="pc-dem-papel__label">Ambiente</span>
          <span className="pc-dem-papel__btn pc-dem-papel__btn--on">MTI · Projeto Atlas</span>
          <p className="pc-dem-papel__hint">
            Simulação do back-office (classe Demanda). Não é portal.
          </p>
        </div>
      )}

      {criando && (
        <div
          className="pc-modal-backdrop"
          role="presentation"
          onClick={abrirLista}
        >
          <form
            className="pc-modal pc-modal--demanda"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dem-nova-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitNova}
          >
            <div className="pc-modal__topbar">
              <div className="pc-modal__topbar-title">
                <span className="material-symbols-outlined" aria-hidden>
                  inbox
                </span>
                <div>
                  <h2 id="dem-nova-title">
                    {tipoEscolhido
                      ? `Nova demanda de ${draft.tipo === 'Consumo' ? 'consumo' : 'suporte'}`
                      : 'Nova demanda'}
                  </h2>
                  <p>{CLIENTE_PORTAL}</p>
                </div>
              </div>
              <button type="button" className="pc-modal__close" aria-label="Fechar" onClick={abrirLista}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="pc-modal__scroll">
              <div className="sy-dem-form sy-dem-form--panel">
                {!tipoEscolhido ? (
                  <section className="sy-dem-section sy-dem-section--tipo">
                    <h3 className="sy-dem-section__title">Selecione o tipo da demanda</h3>
                    <fieldset className="sy-dem-tipo sy-dem-tipo--compact">
                      <legend className="sr-only">Tipo da demanda</legend>
                      <div className="sy-dem-tipo__opts" role="radiogroup" aria-label="Tipo da demanda">
                        {(SUPORTE_BACKLOG_F3
                          ? TIPOS_DEMANDA.filter((t) => t !== 'Suporte')
                          : TIPOS_DEMANDA
                        ).map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`sy-dem-tipo__opt${t === 'Consumo' ? ' sy-dem-tipo__opt--consumo' : ' sy-dem-tipo__opt--suporte'}`}
                            onClick={() => escolherTipo(t)}
                          >
                            <span className="material-symbols-outlined" aria-hidden>
                              {t === 'Consumo' ? 'shopping_cart' : 'support_agent'}
                            </span>
                            <span className="sy-dem-tipo__name">{t}</span>
                            <small>
                              {t === 'Consumo'
                                ? 'Itens, créditos ou licenças do contrato'
                                : 'Atendimento técnico ou incidente'}
                            </small>
                          </button>
                        ))}
                      </div>
                      {SUPORTE_BACKLOG_F3 && (
                        <p className="pc-org-dados__hint" style={{ marginTop: '0.75rem' }}>
                          Nesta fase, apenas demanda de <strong>Consumo</strong> (Suporte em backlog).
                        </p>
                      )}
                    </fieldset>
                  </section>
                ) : (
                  <>
                    <div className="sy-dem-tipo-bar">
                      <button type="button" className="pc-linkish sy-dem-tipo-bar__back" onClick={voltarTipoDemanda}>
                        <span className="material-symbols-outlined" aria-hidden>
                          arrow_back
                        </span>
                        Voltar
                      </button>
                      <span className="sy-dem-tipo-bar__chip">
                        Tipo: <strong>{draft.tipo}</strong>
                      </span>
                    </div>

                    <section className="sy-dem-section">
                      <h3 className="sy-dem-section__title">Identificação</h3>
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Cliente solicitante</span>
                          <input className="sy-dem-input" value={CLIENTE_PORTAL} readOnly />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--4">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Responsável pela abertura da demanda</span>
                          <input
                            className="sy-dem-input"
                            value={draft.responsavelAbertura}
                            readOnly
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">CPF</span>
                          <input className="sy-dem-input" value={draft.contatoCpf} readOnly />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">E-mail</span>
                          <input className="sy-dem-input" value={draft.contatoEmail} readOnly />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Contato</span>
                          <input className="sy-dem-input" value={draft.contatoNumero} readOnly />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Contato secundário (opcional)</span>
                          <select
                            className="sy-dem-input"
                            value={draft.contatoSecundario}
                            onChange={(e) => patchDraft({ contatoSecundario: e.target.value })}
                          >
                            <option value="">Não informar</option>
                            {CONTATOS_SECUNDARIOS.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </section>

                    <section className="sy-dem-section">
                      <h3 className="sy-dem-section__title">Contrato e solução</h3>
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Contrato (opcional)</span>
                          <select
                            className="sy-dem-input"
                            value={draft.numeroContrato}
                            onChange={(e) => {
                              const nro = e.target.value
                              patchDraft({
                                numeroContrato: nro,
                                saudeAckCritica: false,
                              })
                            }}
                          >
                            <option value="">Não informar</option>
                            {CONTRATOS_CLIENTE.map((c) => (
                              <option key={c.numero} value={c.numero}>
                                {c.numero} · {c.nome}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Solução (opcional)</span>
                          <select
                            className="sy-dem-input"
                            value={draft.produtoSolucao}
                            onChange={(e) => {
                              const nome = e.target.value
                              if (!nome) {
                                patchDraft({
                                  produtoSolucao: '',
                                  saudeAckCritica: false,
                                })
                                return
                              }
                              if (nome === SOLUCAO_OUTROS || nome === SOLUCAO_A_QUALIFICAR) {
                                patchDraft({
                                  produtoSolucao: nome,
                                  saudeAckCritica: false,
                                })
                                return
                              }
                              const sol = solucaoNoCatalogo(nome)
                              patchDraft({
                                produtoSolucao: nome,
                                numeroContrato: sol?.numeroContrato || draft.numeroContrato,
                                saudeAckCritica: false,
                              })
                            }}
                          >
                            <option value="">Não informar</option>
                            {todasSolucoesCatalogo()
                              .filter(
                                (s) =>
                                  !draft.numeroContrato || s.numeroContrato === draft.numeroContrato,
                              )
                              .map((s) => (
                                <option key={`${s.numeroContrato}-${s.nome}`} value={s.nome}>
                                  {s.nome}
                                  {s.parceria ? ` · parceria${s.parceiro ? `: ${s.parceiro}` : ''}` : ''}
                                </option>
                              ))}
                            <option value={SOLUCAO_OUTROS}>Outros</option>
                          </select>
                        </label>

                        {contratoSelecionado && (
                          <PainelContrato contrato={contratoSelecionado} />
                        )}
                      </div>
                    </section>

                    <section className="sy-dem-section">
                      <h3 className="sy-dem-section__title">Necessidade</h3>
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">
                            Descrição da demanda <span className="pc-req">*</span>
                          </span>
                          <textarea
                            className="sy-dem-input sy-dem-input--area"
                            rows={4}
                            value={draft.descricao}
                            onChange={(e) => patchDraft({ descricao: e.target.value })}
                            required
                            placeholder="Descreva com suas palavras o que precisa"
                          />
                        </label>

                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Observações</span>
                          <textarea
                            className="sy-dem-input sy-dem-input--area"
                            rows={2}
                            value={draft.observacoes}
                            onChange={(e) => patchDraft({ observacoes: e.target.value })}
                          />
                        </label>
                      </div>
                    </section>

                    <section className="sy-dem-section">
                      <h3 className="sy-dem-section__title">Anexos</h3>
                      <AnexoUpload
                        multiple
                        onFiles={(files) =>
                          patchDraft({
                            anexos: [
                              ...draft.anexos,
                              ...files.filter((f) => !draft.anexos.some((a) => a.nome === f.nome)),
                            ],
                          })
                        }
                      />
                      {draft.anexos.length > 0 && (
                        <div className="pc-anexo-list">
                          {draft.anexos.map((a) => (
                            <AnexoLoadedItem
                              key={a.nome}
                              nome={a.nome}
                              tamanhoKb={a.tamanhoKb}
                              onClear={() =>
                                patchDraft({ anexos: draft.anexos.filter((x) => x.nome !== a.nome) })
                              }
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  </>
                )}
              </div>
            </div>

            <div className="pc-fab-footer pc-modal__footer" role="toolbar" aria-label="Salvar ou cancelar">
              <button
                type="button"
                className="pc-fab pc-fab--cancel"
                onClick={abrirLista}
                aria-label="Fechar / cancelar / sair"
                title="Cancelar"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  close
                </span>
              </button>
              {tipoEscolhido && (
                <button
                  type="submit"
                  className="pc-fab pc-fab--save"
                  aria-label="Salvar e confirmar"
                  title="Registrar demanda"
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    check
                  </span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {!criando && (
            <>
              {listaSydle ? (
                <header className="pp-dem-head" role="toolbar" aria-label="Demandas">
                  <h1 className="pp-dem-head__title">Demandas</h1>
                  <div className="pp-dem-head__toolbar">
                    {podeAbrirDemanda && (
                      <button
                        type="button"
                        className="pp-dem-btn-solicitar"
                        onClick={abrirNova}
                      >
                        Solicitar Nova Demanda
                      </button>
                    )}
                    <button
                      type="button"
                      className="pp-dem-btn-favorito"
                      aria-label="Favoritar serviço"
                      title="Favoritar serviço"
                      onClick={() => onToast('Favorito do serviço (protótipo).')}
                    >
                      <span className="material-symbols-outlined" aria-hidden>
                        bookmark
                      </span>
                    </button>
                    <span className="pp-dem-head__spacer" aria-hidden />
                  </div>
                </header>
              ) : (
                <header className="pc-page-head">
                  <div>
                    <h1>Fila de demandas — Back-office MTI</h1>
                    <p>Pré-análise, qualificação, atendimento, OS, execução e homologação.</p>
                  </div>
                </header>
              )}

              <div className={`pc-table-wrap${listaSydle ? ' pp-dem-lista' : ''}`}>
                {listaSydle ? (
                  <div className="pp-dem-filtros" role="search" aria-label="Filtrar demandas">
                    <label className="pp-dem-filtro">
                      <span className="pp-dem-filtro__label">Nº Demanda</span>
                      <span className="pp-dem-filtro__field">
                        <input
                          type="search"
                          className="pp-dem-filtro__input"
                          value={filtroNumero}
                          onChange={(e) => setFiltroNumero(e.target.value)}
                          placeholder=""
                          aria-label="Filtrar por número da demanda"
                        />
                        <span className="material-symbols-outlined" aria-hidden>
                          search
                        </span>
                      </span>
                    </label>
                    <div className="pp-dem-filtro">
                      <span className="pp-dem-filtro__label" id="pp-dem-filtro-data-label">
                        Data da Solicitação
                      </span>
                      <div
                        className="pp-dem-filtro__field pp-dem-filtro__field--range"
                        role="group"
                        aria-labelledby="pp-dem-filtro-data-label"
                      >
                        <span className={`pp-dem-filtro__range-text${filtroDataLabel ? '' : ' is-placeholder'}`}>
                          {filtroDataLabel || 'dd/mm/aaaa'}
                        </span>
                        <label className="pp-dem-filtro__cal" title="Data inicial">
                          <span className="material-symbols-outlined" aria-hidden>
                            calendar_month
                          </span>
                          <input
                            type="date"
                            className="pp-dem-filtro__date-native"
                            value={filtroDataInicio}
                            onChange={(e) => setFiltroDataInicio(e.target.value)}
                            aria-label="Data inicial da solicitação"
                          />
                        </label>
                        <label className="pp-dem-filtro__cal" title="Data final">
                          <span className="material-symbols-outlined" aria-hidden>
                            calendar_month
                          </span>
                          <input
                            type="date"
                            className="pp-dem-filtro__date-native"
                            value={filtroDataFim}
                            onChange={(e) => setFiltroDataFim(e.target.value)}
                            aria-label="Data final da solicitação"
                          />
                        </label>
                      </div>
                    </div>
                    <label className="pp-dem-filtro">
                      <span className="pp-dem-filtro__label">Status</span>
                      <span className="pp-dem-filtro__field">
                        <select
                          className="pp-dem-filtro__input pp-dem-filtro__select"
                          value={filtroStatus}
                          onChange={(e) => setFiltroStatus(e.target.value as StatusDemanda | '')}
                          aria-label="Filtrar por status"
                        >
                          <option value=""> </option>
                          {STATUS_DEMANDA.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined" aria-hidden>
                          expand_more
                        </span>
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="pc-dem-filtro-status">
                    <select
                      className="sy-dem-input pc-dem-filtro-status__select"
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value as StatusDemanda | '')}
                      aria-label="Filtrar por status"
                    >
                      <option value="">Status</option>
                      {STATUS_DEMANDA.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {filtradas.length === 0 ? (
                  <p className="pc-empty">
                    {perfil === 'Parceiro'
                      ? 'Nenhuma demanda visível para o parceiro (só após roteamento/qualificação).'
                      : 'Nenhuma demanda encontrada.'}
                  </p>
                ) : listaSydle ? (
                  <>
                    <table className="pp-dem-table">
                      <thead>
                        <tr>
                          <th>Número da Demanda</th>
                          <th>Tipo da Solicitação</th>
                          <th>Solução</th>
                          <th>Status</th>
                          <th className="pp-dem-table__col-nav" aria-hidden />
                        </tr>
                      </thead>
                      <tbody>
                        {filtradasPage.map((d) => (
                          <tr
                            key={d.id}
                            className="pp-dem-table__row"
                            onClick={() => abrirDetalhe(d.id)}
                          >
                            <td>
                              <span className="pp-dem-table__numero">{d.numero}</span>
                            </td>
                            <td>
                              <DemFlag
                                asTag={modoMti}
                                badgeClass={
                                  d.tipo === 'Consumo' ? 'pc-badge--consumo' : 'pc-badge--suporte'
                                }
                              >
                                {d.tipo}
                              </DemFlag>
                            </td>
                            <td>
                              <span className="pc-dem-clip">
                                {portalCamposCondicionais &&
                                (!d.produtoSolucao?.trim() ||
                                  d.produtoSolucao === SOLUCAO_A_QUALIFICAR)
                                  ? '—'
                                  : d.produtoSolucao}
                              </span>
                            </td>
                            <td>
                              <DemFlag asTag={modoMti} badgeClass={badgeClassStatusDemanda(d.status)}>
                                {d.status}
                              </DemFlag>
                              {(!portalCamposCondicionais || d.termoRecusado) && d.termoRecusado ? (
                                <DemFlag
                                  asTag={modoMti}
                                  badgeClass="pc-badge--recusado"
                                  extraClass="pp-dem-table__flag-extra"
                                >
                                  Termo recusado
                                </DemFlag>
                              ) : null}
                            </td>
                            <td className="pp-dem-table__col-nav">
                              <span className="material-symbols-outlined" aria-hidden>
                                chevron_right
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <nav className="pp-dem-pager" aria-label="Paginação da lista">
                      <button
                        type="button"
                        className="pp-dem-pager__btn"
                        disabled={listaPageSafe <= 1}
                        onClick={() => setListaPage(1)}
                        aria-label="Primeira página"
                      >
                        <span className="material-symbols-outlined" aria-hidden>
                          first_page
                        </span>
                      </button>
                      <button
                        type="button"
                        className="pp-dem-pager__btn"
                        disabled={listaPageSafe <= 1}
                        onClick={() => setListaPage((p) => Math.max(1, p - 1))}
                        aria-label="Página anterior"
                      >
                        <span className="material-symbols-outlined" aria-hidden>
                          chevron_left
                        </span>
                      </button>
                      {Array.from({ length: listaTotalPages }, (_, i) => i + 1)
                        .filter((n) => {
                          if (listaTotalPages <= 5) return true
                          return Math.abs(n - listaPageSafe) <= 1 || n === 1 || n === listaTotalPages
                        })
                        .map((n, idx, arr) => {
                          const prev = arr[idx - 1]
                          const showEllipsis = prev != null && n - prev > 1
                          return (
                            <span key={n} className="pp-dem-pager__nums">
                              {showEllipsis ? <span className="pp-dem-pager__ellipsis">…</span> : null}
                              <button
                                type="button"
                                className={`pp-dem-pager__page${n === listaPageSafe ? ' is-active' : ''}`}
                                onClick={() => setListaPage(n)}
                                aria-label={`Página ${n}`}
                                aria-current={n === listaPageSafe ? 'page' : undefined}
                              >
                                {n}
                              </button>
                            </span>
                          )
                        })}
                      <button
                        type="button"
                        className="pp-dem-pager__btn"
                        disabled={listaPageSafe >= listaTotalPages}
                        onClick={() => setListaPage((p) => Math.min(listaTotalPages, p + 1))}
                        aria-label="Próxima página"
                      >
                        <span className="material-symbols-outlined" aria-hidden>
                          chevron_right
                        </span>
                      </button>
                      <button
                        type="button"
                        className="pp-dem-pager__btn"
                        disabled={listaPageSafe >= listaTotalPages}
                        onClick={() => setListaPage(listaTotalPages)}
                        aria-label="Última página"
                      >
                        <span className="material-symbols-outlined" aria-hidden>
                          last_page
                        </span>
                      </button>
                    </nav>
                  </>
                ) : (
                  <table className="pc-table pc-table--demanda">
                    <thead>
                      <tr>
                        <th>Número</th>
                        <th>Status</th>
                        <th>Tipo</th>
                        <th>Solução</th>
                        {modoMti && <th>ServiceNow</th>}
                        <th>Atualizado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtradas.map((d) => (
                        <tr key={d.id} className="pc-table__row-click" onClick={() => abrirDetalhe(d.id)}>
                          <td>
                            <button type="button" className="pc-linkish" onClick={() => abrirDetalhe(d.id)}>
                              {d.numero}
                            </button>
                          </td>
                          <td>
                            <DemFlag asTag={modoMti} badgeClass={badgeClassStatusDemanda(d.status)}>
                              {d.status}
                            </DemFlag>
                          </td>
                          <td>
                            <DemFlag
                              asTag={modoMti}
                              badgeClass={
                                d.tipo === 'Consumo' ? 'pc-badge--em-analise' : 'pc-badge--pendente'
                              }
                            >
                              {d.tipo}
                            </DemFlag>
                          </td>
                          <td>
                            <span className="pc-dem-clip">
                              {portalCamposCondicionais &&
                              (!d.produtoSolucao?.trim() ||
                                d.produtoSolucao === SOLUCAO_A_QUALIFICAR)
                                ? '—'
                                : d.produtoSolucao}
                            </span>
                          </td>
                          {modoMti && (
                            <td>
                              <span className="pc-dem-clip pc-dem-clip--sm">
                                {d.serviceNowStatus || 'Não enviado'}
                              </span>
                            </td>
                          )}
                          <td>{d.atualizadoEm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {painel === 'detalhe' && selecionada && !criando && (
            <div
              className="pc-modal-backdrop"
              role="presentation"
              onClick={abrirLista}
            >
              <div
                className="pc-modal pc-modal--demanda pc-modal--carta"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dem-detalhe-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pc-modal__topbar sy-carta-topbar">
                  <div className="pc-modal__topbar-title">
                    <div>
                      <h2 id="dem-detalhe-title">{selecionada.numero}</h2>
                      <p className="pc-dem-detail__cliente">
                        {selecionada.clienteSolicitante || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="sy-carta-topbar__actions">
                    <button type="button" className="pc-modal__icon-btn" aria-label="Notificações" title="Notificações">
                      <span className="material-symbols-outlined" aria-hidden>
                        notifications
                      </span>
                    </button>
                    <button type="button" className="pc-modal__close" aria-label="Fechar" onClick={abrirLista}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                <div className="pc-modal__scroll sy-carta-scroll">
                  {!modoMti &&
                  posEnvioDemandaId === selecionada.id &&
                  perfil === 'Cliente' ? (
                    <BannerPosEnvioDemanda
                      d={selecionada}
                      asTag={modoMti}
                      onDismiss={() => setPosEnvioDemandaId(null)}
                    />
                  ) : null}

                  <div className="sy-carta-tabs-wrap">
                    <span className="sy-carta-tabs-label">
                      {!modoMti ? 'Seções' : 'Dados'} <span className="pc-req">*</span>
                    </span>
                    <div className="sy-carta-tabs" role="tablist" aria-label="Seções da demanda">
                      {detailTabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          id={`dem-tab-btn-${tab.id}`}
                          aria-selected={detailTab === tab.id}
                          aria-controls={`dem-tab-${tab.id}`}
                          className={`sy-carta-tab${detailTab === tab.id ? ' is-active' : ''}`}
                          onClick={() => setDetailTab(tab.id)}
                        >
                          {tab.title}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sy-dem-form sy-dem-form--panel sy-carta-body">
                    <DemandaTabPanel id="acoes" activeId={detailTab}>
                      <div className="sy-carta-help" role="note">
                        <span className="material-symbols-outlined sy-carta-help__icon" aria-hidden>
                          help
                        </span>
                        <p>
                          Status: <strong>{selecionada.status}</strong>
                          {' · '}
                          {labelTimeline(selecionada.status)}. Ações disponíveis para{' '}
                          <strong>{labelAtor}</strong> nesta etapa.
                        </p>
                      </div>

                      {(selecionada.status === 'Recusada' ||
                        selecionada.status === 'Não autorizada') && (
                          <div className="sy-carta-help sy-dem-n2-painel" role="status">
                            <span className="material-symbols-outlined sy-carta-help__icon" aria-hidden>
                              content_copy
                            </span>
                            <p>
                              Demanda <strong>{selecionada.status}</strong>. É possível abrir uma nova
                              demanda reaproveitando estes dados.
                            </p>
                          </div>
                        )}

                      {selecionada.status === 'Efetivado · entregue' && selecionada.termoRecusado && (
                          <div className="sy-carta-help sy-dem-n2-painel" role="status">
                            <span className="material-symbols-outlined sy-carta-help__icon" aria-hidden>
                              gavel
                            </span>
                            <p>
                              Termo recusado. A demanda permanece concluída. A MTI regenera o termo para
                              nova assinatura.
                            </p>
                          </div>
                        )}

                      {selecionada.status === 'Efetivado · entregue' && !selecionada.termoRecusado && (
                          <div className="sy-carta-help sy-dem-n2-painel" role="status">
                            <span className="material-symbols-outlined sy-carta-help__icon" aria-hidden>
                              lock
                            </span>
                            <p>
                              Demanda concluída. Novo escopo: abra outra demanda. Ajuste no termo:
                              regenerar e reassinar.
                            </p>
                          </div>
                        )}

                      {selecionada.status === 'Recusada' && (
                          <div className="sy-carta-help sy-dem-n2-painel" role="status">
                            <span className="material-symbols-outlined sy-carta-help__icon" aria-hidden>
                              undo
                            </span>
                            <p>
                              Quem recusou pode restituir (aceitar ou pedir ajuste). Também é possível
                              abrir nova demanda com estes dados.
                            </p>
                          </div>
                        )}

                      {selecionada.status === 'Aguardando gestor' &&
                        selecionada.exigeAuthContratante !== false && (
                          <div className="sy-carta-help sy-dem-n2-painel" role="status">
                            <span className="material-symbols-outlined sy-carta-help__icon" aria-hidden>
                              group
                            </span>
                            <p>
                              Autorização do gestor e do fiscal em paralelo.
                              {' '}
                              Gestor:{' '}
                              <strong>
                                {selecionada.authGestor
                                  ? selecionada.authGestor.decisao
                                  : 'pendente'}
                              </strong>
                              {' · '}
                              Fiscal:{' '}
                              <strong>
                                {selecionada.authFiscal
                                  ? selecionada.authFiscal.decisao
                                  : 'pendente'}
                              </strong>
                              . A etapa encerra quando ambos registram; vale a decisão mais restritiva.
                            </p>
                          </div>
                        )}

                      {acoes.length === 0 ? (
                        modoMti ? (
                        <p className="pc-dem-acoes-empty">
                          Nenhuma ação para <strong>{labelAtor}</strong> em «{selecionada.status}».
                          {perfil === 'Parceiro' && !selecionada.parceiroNotificado
                            ? ' Parceiro ainda não foi notificado.'
                            : ' Aguarde o avanço por outro perfil.'}
                        </p>
                        ) : null
                      ) : (
                        <div className="sy-carta-acoes">
                          <p className="sy-carta-acoes__meta">
                            {acoes.length} ação(ões) nesta etapa · {labelAtor}
                          </p>
                          {(() => {
                            const decisaoN2 = acoes.filter((a) =>
                              (ACOES_DECISAO_N2 as readonly string[]).includes(a.id),
                            )
                            const outras = acoes.filter(
                              (a) => !(ACOES_DECISAO_N2 as readonly string[]).includes(a.id),
                            )
                            const selecionar = (a: AcaoDef | null) => {
                              if (!a) {
                                setAcaoAtiva(null)
                                return
                              }
                              abrirAcao(a)
                            }
                            return (
                              <>
                                {decisaoN2.length > 0 && (
                                  <SyAcaoBotoes
                                    ariaLabel="Decisão: aprovar, devolver ou recusar"
                                    opcoes={decisaoN2.map((a) => ({ id: a.id, label: a.label }))}
                                    ativaId={
                                      acaoAtiva &&
                                      (ACOES_DECISAO_N2 as readonly string[]).includes(acaoAtiva.id)
                                        ? acaoAtiva.id
                                        : null
                                    }
                                    onSelect={(op) => {
                                      if (!op) {
                                        selecionar(null)
                                        return
                                      }
                                      const full = decisaoN2.find((a) => a.id === op.id) ?? null
                                      selecionar(full)
                                    }}
                                  />
                                )}
                                {outras.map((a) => (
                                  <SyAcaoBotoes
                                    key={a.id}
                                    ariaLabel={a.label}
                                    opcoes={[{ id: a.id, label: a.label }]}
                                    ativaId={acaoAtiva?.id === a.id ? a.id : null}
                                    onSelect={(op) => {
                                      if (!op) {
                                        selecionar(null)
                                        return
                                      }
                                      selecionar(a)
                                    }}
                                  />
                                ))}
                              </>
                            )
                          })()}
                        </div>
                      )}

                      {acaoAtiva && (
                        <div className="sy-sim-nao-expand sy-dem-form">
                  {acaoAtiva.precisaMotivo && (
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Motivo *</span>
                      <textarea
                        className="sy-dem-input sy-dem-input--area"
                        rows={3}
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                      />
                    </label>
                  )}
                  {acaoAtiva.id === 'restituir_n2' && (
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Como restituir *</span>
                      <select
                        className="sy-dem-input"
                        value={decisaoRestituir}
                        onChange={(e) =>
                          setDecisaoRestituir(e.target.value as 'aceitar' | 'ajustar')
                        }
                      >
                        <option value="aceitar">Aceitar / aprovar e seguir</option>
                        <option value="ajustar">Solicitar ajuste (devolver ao solicitante)</option>
                      </select>
                    </label>
                  )}
                  {acaoAtiva.precisaSaudeAck && selecionada?.numeroContrato && (() => {
                    const ctAck =
                      contratoPorSolucao(selecionada.produtoSolucao) ??
                      contratoPorNumero(selecionada.numeroContrato)
                    if (!ctAck || !saudeExibeAlerta(ctAck)) return null
                    const saude = avaliarSaudeContrato(ctAck)
                    const tone = saude.status === 'Atenção' ? 'warn' : 'crit'
                    return (
                      <div className={`sy-dem-field sy-dem-saude-alerta sy-dem-saude-alerta--${tone}`}>
                        <span className="sy-dem-label">Saúde do contrato</span>
                        <input
                          className={`sy-dem-input sy-dem-saude sy-dem-saude--${tone}`}
                          type="text"
                          readOnly
                          value={`${saude.status} — ${saude.mensagem}`}
                        />
                      </div>
                    )
                  })()}
                  {acaoAtiva.precisaTipoAnalise && (
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Tipo na análise *</span>
                      <select
                        className="sy-dem-input"
                        value={tipoAnaliseDraft}
                        onChange={(e) => setTipoAnaliseDraft(e.target.value as TipoAnaliseDemanda)}
                      >
                        <option value="Licenciamento">Licenciamento</option>
                        <option value="Serviço">Serviço</option>
                      </select>
                    </label>
                  )}
                  {acaoAtiva.precisaEntregavel && (
                    <div className="sy-dem-row sy-dem-row--1">
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Declaração / entregável *</span>
                        <textarea
                          className="sy-dem-input sy-dem-input--area"
                          rows={3}
                          value={entregavelDraft}
                          onChange={(e) => setEntregavelDraft(e.target.value)}
                          placeholder="Ex.: 10 contas liberadas · credenciais anexadas / appliance ativado"
                        />
                      </label>
                      <div className="sy-dem-field">
                        <span className="sy-dem-label">Comprovações / anexos</span>
                        <AnexoUpload
                          multiple
                          onFiles={(files) =>
                            setAnexosComprovacaoDraft((prev) => [
                              ...prev,
                              ...files
                                .filter((f) => !prev.some((a) => a.nome === f.nome))
                                .map((f) => ({
                                  id: crypto.randomUUID(),
                                  nome: f.nome,
                                  tamanhoKb: f.tamanhoKb,
                                })),
                            ])
                          }
                        />
                        {anexosComprovacaoDraft.length > 0 && (
                          <div className="pc-anexo-list" style={{ marginTop: '0.45rem' }}>
                            {anexosComprovacaoDraft.map((a) => (
                              <AnexoLoadedItem
                                key={a.id}
                                nome={a.nome}
                                tamanhoKb={a.tamanhoKb}
                                onClear={() =>
                                  setAnexosComprovacaoDraft((prev) =>
                                    prev.filter((x) => x.id !== a.id),
                                  )
                                }
                              />
                            ))}
                          </div>
                        )}
                        <span className="pc-org-dados__hint">
                          Anexe evidências (credenciais, docs, artefatos). A MTI verá na validação.
                        </span>
                      </div>
                    </div>
                  )}
                  {(acaoAtiva.id === 'parceiro_iniciar' ||
                    acaoAtiva.id === 'parceiro_declarar' ||
                    acaoAtiva.precisaLicencaExecucao) &&
                    (tipoAnaliseDraft === 'Licenciamento' ||
                      selecionada?.tipoAnalise === 'Licenciamento') && (
                    <div className="sy-dem-row sy-dem-row--1">
                      <p className="pc-org-dados__hint">
                        Execução de licença (call 17/09): credenciais, appliance e comprovação do
                        fabricante.
                      </p>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Credenciais *</span>
                        <textarea
                          className="sy-dem-input sy-dem-input--area"
                          rows={2}
                          value={credenciaisDraft}
                          onChange={(e) => setCredenciaisDraft(e.target.value)}
                          placeholder="Usuários / chaves / acessos liberados"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Appliance / ambiente *</span>
                        <input
                          className="sy-dem-input"
                          value={applianceDraft}
                          onChange={(e) => setApplianceDraft(e.target.value)}
                          placeholder="Ex.: tenant XYZ · appliance ativado"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Quantidade executada</span>
                        <input
                          className="sy-dem-input"
                          type="number"
                          min={0}
                          step="any"
                          value={qtdExecutadaDraft}
                          onChange={(e) => setQtdExecutadaDraft(e.target.value)}
                          placeholder="Pode ser parcial vs OS"
                        />
                      </label>
                      <div className="sy-dem-field">
                        <span className="sy-dem-label">Comprovação do fabricante</span>
                        <AnexoUpload
                          multiple
                          onFiles={(files) =>
                            setComprovFabDraft((prev) => [
                              ...prev,
                              ...files
                                .filter((f) => !prev.some((a) => a.nome === f.nome))
                                .map((f) => ({
                                  id: crypto.randomUUID(),
                                  nome: f.nome,
                                  tamanhoKb: f.tamanhoKb,
                                })),
                            ])
                          }
                        />
                        {comprovFabDraft.length > 0 && (
                          <div className="pc-anexo-list" style={{ marginTop: '0.45rem' }}>
                            {comprovFabDraft.map((a) => (
                              <AnexoLoadedItem
                                key={a.id}
                                nome={a.nome}
                                tamanhoKb={a.tamanhoKb}
                                onClear={() =>
                                  setComprovFabDraft((prev) => prev.filter((x) => x.id !== a.id))
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {acaoAtiva.id === 'aceitar_dilacao' && selecionada && (
                    <div className="sy-carta-help sy-dem-n2-painel" role="status">
                      <span className="material-symbols-outlined sy-carta-help__icon" aria-hidden>
                        schedule
                      </span>
                      <p>
                        Novo prazo proposto: <strong>{selecionada.dilacaoNovoPrazo || '—'}</strong>
                        {selecionada.dilacaoMotivo ? ` · ${selecionada.dilacaoMotivo}` : ''}. Aceite
                        tripartite: Cliente, MTI
                        {selecionada.parceiroNotificado ? ' e Parceiro' : ''}.
                      </p>
                    </div>
                  )}
                  {(acaoAtiva.id === 'qualificar' || acaoAtiva.precisaQualificacao) && (
                    <div className="sy-dem-row sy-dem-row--1">
                      <p className="pc-org-dados__hint" style={{ margin: 0 }}>
                        Qualificação MTI (Luis 17/09): produto/item, contrato, catálogo, itens, cobertura e
                        parceiro. Requalificar corrige a mesma demanda.
                      </p>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Natureza da cobertura *</span>
                        <select
                          className="sy-dem-input"
                          value={naturezaQualif}
                          onChange={(e) =>
                            setNaturezaQualif(
                              e.target.value as
                                | 'Próprio do cliente'
                                | 'Patrocinado (gestão)'
                                | 'Sem contrato',
                            )
                          }
                        >
                          <option value="Próprio do cliente">Próprio do cliente</option>
                          <option value="Patrocinado (gestão)">Patrocinado (gestão)</option>
                          <option value="Sem contrato">Sem contrato</option>
                        </select>
                      </label>
                      {naturezaQualif !== 'Sem contrato' && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Contrato *</span>
                          <select
                            className="sy-dem-input"
                            value={ajusteCtr}
                            onChange={(e) => {
                              const nro = e.target.value
                              setAjusteCtr(nro)
                              const sol = todasSolucoesCatalogo().find((x) => x.numeroContrato === nro)
                              if (sol?.parceiro) setParceiroQualif(sol.parceiro)
                            }}
                          >
                            <option value="">Selecione o contrato</option>
                            {CONTRATOS_CLIENTE.map((c) => (
                              <option key={c.numero} value={c.numero}>
                                {c.numero} — {c.nome}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Produto / solução / item *</span>
                        <select
                          className="sy-dem-input"
                          value={produtoQualif}
                          onChange={(e) => {
                            const nome = e.target.value
                            setProdutoQualif(nome)
                            const sol = solucaoNoCatalogo(nome)
                            if (sol?.numeroContrato) {
                              setAjusteCtr(sol.numeroContrato)
                            }
                            if (sol?.parceiro) setParceiroQualif(sol.parceiro)
                            else if (sol && !sol.parceria) setParceiroQualif('')
                          }}
                        >
                          <option value="">Selecione ou digite abaixo</option>
                          {todasSolucoesCatalogo()
                            .filter(
                              (s) => !ajusteCtr || s.numeroContrato === ajusteCtr,
                            )
                            .map((s) => (
                              <option key={`${s.numeroContrato}-${s.nome}`} value={s.nome}>
                                {s.nome}
                              </option>
                            ))}
                        </select>
                        <input
                          className="sy-dem-input"
                          style={{ marginTop: '0.35rem' }}
                          value={produtoQualif}
                          onChange={(e) => setProdutoQualif(e.target.value)}
                          placeholder="Ou informe o nome do produto/item"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Catálogo *</span>
                        <input
                          className="sy-dem-input"
                          value={catalogos}
                          onChange={(e) => setCatalogos(e.target.value)}
                          placeholder="Ex.: Catálogo MTI Cloud · parceria EloGroup"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Itens do catálogo *</span>
                        <textarea
                          className="sy-dem-input"
                          rows={3}
                          value={itensCatalogo}
                          onChange={(e) => setItensCatalogo(e.target.value)}
                          placeholder="Itens que serão consumidos (um por linha ou separados por ;)"
                        />
                      </label>
                      {naturezaQualif !== 'Sem contrato' && (
                        <>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Métrica do contrato *</span>
                            <select
                              className="sy-dem-input"
                              value={metricaDraft}
                              onChange={(e) => setMetricaDraft(e.target.value as MetricaContrato)}
                            >
                              <option value="Serviço">Serviço (UST/HST)</option>
                              <option value="Licenciamento">Licenciamento (SN)</option>
                            </select>
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Versão de catálogo vigente</span>
                            <input
                              className="sy-dem-input"
                              value={catalogoVersaoDraft}
                              onChange={(e) => setCatalogoVersaoDraft(e.target.value)}
                              placeholder="Ex.: 1.5 · aditivo → 1.9"
                            />
                          </label>
                        </>
                      )}
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Parceiro (vazio = só MTI / catálogo próprio)</span>
                        <input
                          className="sy-dem-input"
                          value={parceiroQualif}
                          onChange={(e) => setParceiroQualif(e.target.value)}
                          placeholder="Nome do parceiro"
                        />
                      </label>
                      <p className="pc-org-dados__hint">
                        Com parceiro → status «Aguardando parceiro» (parecer antes da deliberação).
                        Patrocínio assina depois da qualificação.
                      </p>
                    </div>
                  )}
                  {acaoAtiva.precisaAtendimento && (
                    <div className="sy-dem-row sy-dem-row--1">
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Métrica do contrato (imutável) *</span>
                        <select
                          className="sy-dem-input"
                          value={metricaDraft}
                          onChange={(e) => setMetricaDraft(e.target.value as MetricaContrato)}
                        >
                          <option value="Serviço">Serviço (UST/HST) — sem SN</option>
                          <option value="Licenciamento">Licenciamento (SN) — sem serviço</option>
                        </select>
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Versão de catálogo vigente</span>
                        <input
                          className="sy-dem-input"
                          value={catalogoVersaoDraft}
                          onChange={(e) => setCatalogoVersaoDraft(e.target.value)}
                          placeholder="Ex.: 1.5 · aditivo → 1.9"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Tipo de OS *</span>
                        <select
                          className="sy-dem-input"
                          value={tipoOsDraft}
                          onChange={(e) => setTipoOsDraft(e.target.value as TipoOs)}
                        >
                          <option value="Dedicada">Dedicada — consome exatamente o pedido</option>
                          <option value="Global">Global (guarda-chuva) — consumos parciais</option>
                        </select>
                      </label>
                      <p className="pc-org-dados__hint">
                        A natureza/métrica do contrato não muda. Aditivo só amplia itens da mesma métrica.
                      </p>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Catálogos de produtos *</span>
                        <input
                          className="sy-dem-input"
                          value={catalogos}
                          onChange={(e) => setCatalogos(e.target.value)}
                          placeholder="Catálogo A; Catálogo B"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Itens do catálogo *</span>
                        <input
                          className="sy-dem-input"
                          value={itensCatalogo}
                          onChange={(e) => setItensCatalogo(e.target.value)}
                          placeholder="Item 1; Item 2"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">NEC / necessidade *</span>
                        <textarea
                          className="sy-dem-input sy-dem-input--area"
                          rows={2}
                          value={necDraft}
                          onChange={(e) => setNecDraft(e.target.value)}
                          placeholder="Necessidade detalhada conforme tipo"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Valores / contabilidade do contrato *</span>
                        <textarea
                          className="sy-dem-input sy-dem-input--area"
                          rows={2}
                          value={valoresDraft}
                          onChange={(e) => setValoresDraft(e.target.value)}
                          placeholder="Snapshot saldo/consumo/provisionamento"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Descrição do atendimento *</span>
                        <textarea
                          className="sy-dem-input sy-dem-input--area"
                          rows={2}
                          value={descricaoAtendimento}
                          onChange={(e) => setDescricaoAtendimento(e.target.value)}
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Prazo / SLA de execução previsto</span>
                        <input
                          className="sy-dem-input"
                          value={prazoExecDraft}
                          onChange={(e) => setPrazoExecDraft(e.target.value)}
                          placeholder="Ex.: 24h ou 21 dias (conta após assinaturas)"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">OS a vincular (se houver)</span>
                        <input
                          className="sy-dem-input"
                          value={osVinculada}
                          onChange={(e) => setOsVinculada(e.target.value)}
                          placeholder="Vazio = criar após assinatura"
                        />
                      </label>
                      <p className="pc-muted">
                        Ao confirmar, a demanda vai para assinatura (gestor/fiscal/solicitante). A
                        execução e o SLA de execução só começam depois das assinaturas.
                      </p>
                    </div>
                  )}
                  {acaoAtiva.precisaAssinaturaAtendimento && (
                    <div className="sy-dem-row sy-dem-row--1">
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Seu papel</span>
                        <select
                          className="sy-dem-input"
                          value={papelAssina}
                          onChange={(e) =>
                            setPapelAssina(e.target.value as 'Gestor' | 'Fiscal' | 'Solicitante')
                          }
                        >
                          <option value="Gestor">Gestor</option>
                          <option value="Fiscal">Fiscal</option>
                          <option value="Solicitante">Solicitante</option>
                        </select>
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Decisão</span>
                        <select
                          className="sy-dem-input"
                          value={decisaoAssina}
                          onChange={(e) =>
                            setDecisaoAssina(e.target.value as 'Assinar' | 'Devolver para correção')
                          }
                        >
                          <option value="Assinar">Assinar</option>
                          <option value="Devolver para correção">Devolver para correção</option>
                        </select>
                      </label>
                      {decisaoAssina === 'Assinar' && (
                        <>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">OS após assinatura</span>
                            <select
                              className="sy-dem-input"
                              value={osAcaoDraft}
                              onChange={(e) => {
                                const v = e.target.value as
                                  | 'Vincular OS existente'
                                  | 'Criar nova OS'
                                  | 'Autorizar consumo em OS existente'
                                setOsAcaoDraft(v)
                                if (v === 'Autorizar consumo em OS existente') setTipoOsDraft('Global')
                                if (v === 'Criar nova OS') setTipoOsDraft('Dedicada')
                              }}
                            >
                              <option value="Criar nova OS">Criar nova OS (tipicamente Dedicada)</option>
                              <option value="Vincular OS existente">Vincular OS existente</option>
                              <option value="Autorizar consumo em OS existente">
                                Autorizar consumo em OS existente (Global)
                              </option>
                            </select>
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Tipo de OS</span>
                            <select
                              className="sy-dem-input"
                              value={tipoOsDraft}
                              onChange={(e) => setTipoOsDraft(e.target.value as TipoOs)}
                            >
                              <option value="Dedicada">Dedicada</option>
                              <option value="Global">Global (guarda-chuva)</option>
                            </select>
                          </label>
                          <p className="pc-org-dados__hint">
                            OS nova: saúde do contrato. OS existente: saúde da OS.
                          </p>
                        </>
                      )}
                      {decisaoAssina === 'Devolver para correção' && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Motivo *</span>
                          <textarea
                            className="sy-dem-input sy-dem-input--area"
                            rows={3}
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ex.: pediu 10 contas, mas o escopo/OS é de 5"
                          />
                        </label>
                      )}
                    </div>
                  )}
                  {acaoAtiva.precisaEncerrarTermo && (
                    <div className="sy-dem-row sy-dem-row--1">
                      <p className="pc-muted">
                        Gera o termo de homologação e o RAER. Assinam: gestor, fiscal e solicitante.
                      </p>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Itens OS / atividades do termo *</span>
                        <textarea
                          className="sy-dem-input sy-dem-input--area"
                          rows={3}
                          value={necDraft}
                          onChange={(e) => setNecDraft(e.target.value)}
                          placeholder="Itens autorizados na OS + o que foi executado"
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Artefatos / comprovações</span>
                        <textarea
                          className="sy-dem-input sy-dem-input--area"
                          rows={2}
                          value={entregavelDraft}
                          onChange={(e) => setEntregavelDraft(e.target.value)}
                          placeholder="Modelagem, requisitos, protótipos, evidências"
                        />
                      </label>
                    </div>
                  )}
                  {acaoAtiva.precisaAssinaturaTermo && (
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Assinar termo como *</span>
                      <select
                        className="sy-dem-input"
                        value={papelTermo}
                        onChange={(e) =>
                          setPapelTermo(e.target.value as 'Gestor' | 'Fiscal' | 'Solicitante')
                        }
                      >
                        <option value="Gestor">Gestor</option>
                        <option value="Fiscal">Fiscal</option>
                        <option value="Solicitante">Solicitante</option>
                      </select>
                      <span className="pc-org-dados__hint">
                        Pendentes:{' '}
                        {[
                          !selecionada.termoAssinaturaGestor && 'Gestor',
                          !selecionada.termoAssinaturaFiscal && 'Fiscal',
                          !selecionada.termoAssinaturaSolicitante && 'Solicitante',
                        ]
                          .filter(Boolean)
                          .join(', ') || 'nenhuma — 3ª assinatura efetiva'}
                      </span>
                    </label>
                  )}
                  {acaoAtiva.precisaDilacao && (
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Novo prazo / estimativa *</span>
                      <input
                        className="sy-dem-input"
                        value={dilacaoPrazoDraft}
                        onChange={(e) => setDilacaoPrazoDraft(e.target.value)}
                        placeholder="Ex.: +10 dias úteis · 2026-10-01"
                      />
                    </label>
                  )}
                  {acaoAtiva.id === 'ajustar_enviar' && (
                    <div className="sy-dem-row sy-dem-row--1">
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Produto / solução</span>
                        <select
                          className="sy-dem-input"
                          value={ajusteProd}
                          onChange={(e) => {
                            const nome = e.target.value
                            setAjusteProd(nome)
                            if (!nome || nome === SOLUCAO_OUTROS) {
                              setAjusteCtr('')
                              return
                            }
                            setAjusteCtr(solucaoNoCatalogo(nome)?.numeroContrato ?? '')
                          }}
                        >
                          <option value="">Selecione</option>
                          {todasSolucoesCatalogo().map((s) => (
                            <option key={`${s.numeroContrato}-${s.nome}`} value={s.nome}>
                              {s.nome}
                            </option>
                          ))}
                          <option value={SOLUCAO_OUTROS}>{SOLUCAO_OUTROS}</option>
                        </select>
                      </label>
                      {ajusteProd &&
                        ajusteProd !== SOLUCAO_OUTROS &&
                        (() => {
                          const ct = contratoPorSolucao(ajusteProd) ?? contratoPorNumero(ajusteCtr)
                          return ct ? <PainelContrato contrato={ct} compact /> : null
                        })()}
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Descrição</span>
                        <textarea
                          className="sy-dem-input sy-dem-input--area"
                          rows={3}
                          value={ajusteDesc}
                          onChange={(e) => setAjusteDesc(e.target.value)}
                        />
                      </label>
                    </div>
                  )}
                  {acaoAtiva.precisaOrcamento && (
                    <div className="sy-dem-row sy-dem-row--1">
                      <p className="pc-muted">
                        Monte a proposta com itens do catálogo (versão vigente). O cliente aceita ou
                        recusa.
                      </p>
                      {orcItens.map((item, idx) => (
                        <div key={item.id} className="sy-dem-row sy-dem-row--2" style={{ marginBottom: 8 }}>
                          <label className="sy-dem-field" style={{ gridColumn: '1 / -1' }}>
                            <span className="sy-dem-label">Item {idx + 1}</span>
                            <input
                              className="sy-dem-input"
                              value={item.descricao}
                              onChange={(e) =>
                                setOrcItens((rows) =>
                                  rows.map((r) =>
                                    r.id === item.id ? { ...r, descricao: e.target.value } : r,
                                  ),
                                )
                              }
                              placeholder="Descrição do item"
                            />
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Qtd</span>
                            <input
                              className="sy-dem-input"
                              type="number"
                              min={1}
                              value={item.quantidade}
                              onChange={(e) =>
                                setOrcItens((rows) =>
                                  rows.map((r) =>
                                    r.id === item.id
                                      ? { ...r, quantidade: Number(e.target.value) || 1 }
                                      : r,
                                  ),
                                )
                              }
                            />
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Valor unit.</span>
                            <input
                              className="sy-dem-input"
                              type="number"
                              min={0}
                              value={item.valorUnitario}
                              onChange={(e) =>
                                setOrcItens((rows) =>
                                  rows.map((r) =>
                                    r.id === item.id
                                      ? { ...r, valorUnitario: Number(e.target.value) || 0 }
                                      : r,
                                  ),
                                )
                              }
                            />
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Versão catálogo</span>
                            <input
                              className="sy-dem-input"
                              value={item.catalogoVersao}
                              onChange={(e) =>
                                setOrcItens((rows) =>
                                  rows.map((r) =>
                                    r.id === item.id
                                      ? { ...r, catalogoVersao: e.target.value }
                                      : r,
                                  ),
                                )
                              }
                            />
                          </label>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="pc-btn"
                        onClick={() =>
                          setOrcItens((rows) => [
                            ...rows,
                            {
                              id: crypto.randomUUID(),
                              descricao: '',
                              quantidade: 1,
                              valorUnitario: 0,
                              catalogoVersao: 'v1.0',
                            },
                          ])
                        }
                      >
                        + Item
                      </button>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Validade da proposta</span>
                        <input
                          className="sy-dem-input"
                          type="date"
                          value={orcValidade}
                          onChange={(e) => setOrcValidade(e.target.value)}
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Observações</span>
                        <textarea
                          className="sy-dem-input sy-dem-input--area"
                          rows={2}
                          value={orcObs}
                          onChange={(e) => setOrcObs(e.target.value)}
                        />
                      </label>
                    </div>
                  )}
                  {acaoAtiva.id === 'definir_pagamento' && (
                    <label className="sy-dem-field">
                      <span className="sy-dem-label">Forma de pagamento (sem cobertura)</span>
                      <select
                        className="sy-dem-input"
                        value={formaPagamentoDraft}
                        onChange={(e) =>
                          setFormaPagamentoDraft(
                            e.target.value as 'Indenização' | 'Nova contratação' | 'Desistiu' | '',
                          )
                        }
                      >
                        <option value="">Selecione</option>
                        <option value="Indenização">Indenização</option>
                        <option value="Nova contratação">Nova contratação</option>
                        <option value="Desistiu">Desistir</option>
                      </select>
                      <span className="pc-org-dados__hint">
                        Não autoriza execução automaticamente. CRM permanece diferido.
                      </span>
                    </label>
                  )}
                        </div>
                      )}

              {selecionada.orcamento && (
                <div className="pc-consumo-aviso" style={{ marginBottom: '1.25rem' }}>
                  <strong>
                    Orçamento {selecionada.orcamento.numero} · {selecionada.orcamento.status}
                  </strong>
                  {selecionada.orcamento.validade && (
                    <p className="pc-muted">Validade: {selecionada.orcamento.validade}</p>
                  )}
                  {selecionada.orcamento.observacoes && <p>{selecionada.orcamento.observacoes}</p>}
                  {selecionada.orcamento.itens.length > 0 && (
                    <div className="pc-table-wrap" style={{ marginTop: 8 }}>
                      <table className="pc-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Versão</th>
                            <th>Qtd</th>
                            <th>Unitário</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selecionada.orcamento.itens.map((i) => (
                            <tr key={i.id}>
                              <td>{i.descricao}</td>
                              <td>{i.catalogoVersao}</td>
                              <td>{i.quantidade}</td>
                              <td>
                                {i.valorUnitario.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </td>
                              <td>
                                {(i.quantidade * i.valorUnitario).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

                    </DemandaTabPanel>

                  <DemandaTabPanel id="sla" activeId={detailTab}>
                    <AbaSla
                      d={selecionada}
                      asTag={modoMti}
                      showOrcamento={
                        !portalCamposCondicionais || Boolean(visCampos?.slaAssinaturaOrcamento)
                      }
                    />
                  </DemandaTabPanel>

                  <DemandaTabPanel id="andamento" activeId={detailTab}>
                    {!modoMti &&
                    perfil === 'Cliente' &&
                    posEnvioDemandaId !== selecionada.id ? (
                      <div className="sy-dem-proximo-passo" role="note">
                        <span className="sy-dem-proximo-passo__kicker">Próximo passo do cliente</span>
                        <strong>{proximoPassoCliente(selecionada).titulo}</strong>
                        <p>{proximoPassoCliente(selecionada).texto}</p>
                      </div>
                    ) : null}

                    <section className="sy-dem-section" aria-label="Dados da demanda">
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Número</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.numero}
                          />
                        </label>
                        <div className="sy-dem-field sy-dem-field--destaque">
                          <span className="sy-dem-label">Tipo</span>
                          <div className="sy-dem-flags">
                            <DemFlag
                              asTag={modoMti}
                              badgeClass={
                                selecionada.tipo === 'Consumo'
                                  ? 'pc-badge--consumo'
                                  : 'pc-badge--suporte'
                              }
                            >
                              {selecionada.tipo}
                            </DemFlag>
                          </div>
                        </div>
                      </div>
                      <div className="sy-dem-row sy-dem-row--2">
                        <div className="sy-dem-field sy-dem-field--destaque">
                          <span className="sy-dem-label">Status</span>
                          <div className="sy-dem-flags">
                            <DemFlag
                              asTag={modoMti}
                              badgeClass={badgeClassStatusDemanda(selecionada.status)}
                            >
                              {selecionada.status}
                            </DemFlag>
                            {(!portalCamposCondicionais || visCampos?.termoRecusado) &&
                            selecionada.termoRecusado ? (
                              <DemFlag asTag={modoMti} badgeClass="pc-badge--recusado">
                                Termo recusado
                              </DemFlag>
                            ) : null}
                          </div>
                        </div>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Origem</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.origem || '—'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Data da solicitação</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.criadoEm || '—'}
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Atualizado em</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.atualizadoEm || '—'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Nome da demanda</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.nome || '—'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Categoria</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.categoria || '—'}
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Prioridade</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.prioridade || '—'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Departamento</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.departamento || '—'}
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Unidade de negócio</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.unidadeNegocio || '—'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Qualificado pela MTI em</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={
                              selecionada.qualificadoEm
                                ? new Date(selecionada.qualificadoEm).toLocaleString('pt-BR')
                                : selecionada.qualificado
                                  ? selecionada.atualizadoEm || '—'
                                  : '—'
                            }
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Parceiro notificado em</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={
                              selecionada.parceiroNotificadoEm
                                ? new Date(selecionada.parceiroNotificadoEm).toLocaleString('pt-BR')
                                : selecionada.parceiroNotificado
                                  ? selecionada.atualizadoEm || '—'
                                  : '—'
                            }
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Solução (vigente)</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={
                              !selecionada.produtoSolucao?.trim() ||
                              selecionada.produtoSolucao === SOLUCAO_A_QUALIFICAR
                                ? '—'
                                : selecionada.produtoSolucao
                            }
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Contrato (vigente)</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.numeroContrato || '—'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Natureza da cobertura</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.contratoNatureza || '—'}
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Parceria</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.parceiroNome || '—'}
                          />
                        </label>
                      </div>
                    </section>
                  </DemandaTabPanel>

                  <DemandaTabPanel id="solicitacao" activeId={detailTab}>
                    <section className="sy-dem-section" aria-label="Dados da solicitação">
                      <p className="sy-dem-solicitacao__lead">
                        Campos informados na abertura da demanda.
                      </p>
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Cliente solicitante</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.clienteSolicitante}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Responsável</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.responsavelOrg || '—'}
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Cargo (responsável)</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.responsavelOrgCargo || '—'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">E-mail (responsável)</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.responsavelOrgEmail || '—'}
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Contato (responsável)</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.responsavelOrgNumero || '—'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--4">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Responsável pela abertura da demanda</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.contatoCliente}
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Cargo (abertura)</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.contatoCargo || '—'}
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">CPF</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.contatoCpf || '—'}
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">E-mail</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.contatoEmail || '—'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Contato</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.contatoNumero || telefonePrincipal}
                          />
                        </label>
                      </div>
                      {selecionada.contatoSecundario ? (
                        <>
                          <div className="sy-dem-row sy-dem-row--2">
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">Contato secundário</span>
                              <input
                                className="sy-dem-input"
                                type="text"
                                readOnly
                                value={selecionada.contatoSecundario}
                              />
                            </label>
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">Cargo (contato secundário)</span>
                              <input
                                className="sy-dem-input"
                                type="text"
                                readOnly
                                value={selecionada.contatoSecundarioCargo || '—'}
                              />
                            </label>
                          </div>
                          <div className="sy-dem-row sy-dem-row--2">
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">E-mail (contato secundário)</span>
                              <input
                                className="sy-dem-input"
                                type="text"
                                readOnly
                                value={selecionada.contatoSecundarioEmail || '—'}
                              />
                            </label>
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">Contato (secundário)</span>
                              <input
                                className="sy-dem-input"
                                type="text"
                                readOnly
                                value={selecionada.contatoSecundarioNumero || '—'}
                              />
                            </label>
                          </div>
                        </>
                      ) : null}
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Solução</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={
                              !selecionada.produtoSolucao?.trim() ||
                              selecionada.produtoSolucao === SOLUCAO_A_QUALIFICAR
                                ? 'Não informado'
                                : selecionada.produtoSolucao
                            }
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Contrato</span>
                          <input
                            className="sy-dem-input"
                            type="text"
                            readOnly
                            value={selecionada.numeroContrato || 'Não informado'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">
                            Descrição da demanda <span className="pc-req">*</span>
                          </span>
                          <textarea
                            className="sy-dem-input sy-dem-input--area"
                            readOnly
                            rows={3}
                            value={selecionada.descricao}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Observações</span>
                          <textarea
                            className="sy-dem-input sy-dem-input--area"
                            readOnly
                            rows={2}
                            value={selecionada.observacoes || '—'}
                          />
                        </label>
                      </div>
                      <div className="sy-dem-row sy-dem-row--1">
                        <div className="sy-dem-field">
                          <span className="sy-dem-label">Anexos</span>
                          {selecionada.anexos.length === 0 ? (
                            <input className="sy-dem-input" type="text" readOnly value="—" />
                          ) : (
                            <div className="pc-anexo-list" style={{ marginTop: '0.35rem' }}>
                              {selecionada.anexos.map((a) => (
                                <AnexoLoadedItem key={a.id} nome={a.nome} tamanhoKb={a.tamanhoKb} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  </DemandaTabPanel>

                  <DemandaTabPanel id="necessidade" activeId={detailTab}>
                    <p className="sy-dem-solicitacao__lead">
                      Detalhe do contrato vigente (KPIs). Solução/natureza/parceria vigentes estão em
                      Dados da demanda; o informado na abertura está em Dados da solicitação.
                    </p>
                    {(!portalCamposCondicionais || visCampos?.contrato) &&
                      selecionada.numeroContrato &&
                      selecionada.produtoSolucao !== SOLUCAO_OUTROS &&
                      (() => {
                        const ct =
                          contratoPorSolucao(selecionada.produtoSolucao) ??
                          contratoPorNumero(selecionada.numeroContrato)
                        if (!ct) {
                          return (
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">Contrato</span>
                              <input
                                className="sy-dem-input"
                                type="text"
                                readOnly
                                value={selecionada.numeroContrato}
                              />
                            </label>
                          )
                        }
                        return (
                          <>
                            {selecionada.catalogoVersaoVigente ||
                            selecionada.catalogos ||
                            selecionada.orcamento?.itens[0]?.catalogoVersao ? (
                              <p className="sy-dem-ctr-panel__cat-ver">
                                Catálogo vigente:{' '}
                                <strong>
                                  {selecionada.catalogoVersaoVigente ||
                                    selecionada.catalogos ||
                                    selecionada.orcamento?.itens[0]?.catalogoVersao}
                                </strong>
                              </p>
                            ) : null}
                            <PainelContrato contrato={ct} />
                          </>
                        )
                      })()}
                    {(!selecionada.numeroContrato ||
                      selecionada.produtoSolucao === SOLUCAO_OUTROS) && (
                      <p className="sy-dem-solicitacao__lead">Sem contrato vigente vinculado.</p>
                    )}
                  </DemandaTabPanel>

                  <DemandaTabPanel id="fila" activeId={detailTab}>
                    <p className="sy-dem-solicitacao__lead">
                      Fila de atendimento (gerente · titular · substitutos · modalidade). Parceria e
                      qualificação ficam em Dados da demanda.
                    </p>
                    {(!portalCamposCondicionais || visCampos?.responsaveisFila) && (
                      <>
                        <div className="sy-dem-row sy-dem-row--2">
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Gerente da parceria</span>
                            <input
                              className="sy-dem-input"
                              readOnly
                              value={selecionada.gerenteParceria || '—'}
                            />
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Responsável titular</span>
                            <input
                              className="sy-dem-input"
                              readOnly
                              value={selecionada.responsavelTitular || '—'}
                            />
                          </label>
                        </div>
                        <div className="sy-dem-row sy-dem-row--2">
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Substituto 1</span>
                            <input
                              className="sy-dem-input"
                              readOnly
                              value={selecionada.substituto1 || '—'}
                            />
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Substituto 2 (sempre gerente)</span>
                            <input
                              className="sy-dem-input"
                              readOnly
                              value={selecionada.substituto2 || selecionada.gerenteParceria || '—'}
                            />
                          </label>
                        </div>
                        <div className="sy-dem-row sy-dem-row--2">
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Modalidade da parceria</span>
                            <input
                              className="sy-dem-input"
                              readOnly
                              value={selecionada.modalidadeParceria || '—'}
                            />
                          </label>
                          <span className="sy-dem-field" aria-hidden />
                        </div>
                      </>
                    )}
                  </DemandaTabPanel>

                  <DemandaTabPanel id="analise" activeId={detailTab}>
                    <div className="sy-dem-row sy-dem-row--2">
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Tipo</span>
                        <input className="sy-dem-input" readOnly value={selecionada.tipo} />
                      </label>
                      {(!portalCamposCondicionais || visCampos?.qualificacao) && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Tipo na análise</span>
                          <input className="sy-dem-input" readOnly value={selecionada.tipoAnalise || '—'} />
                        </label>
                      )}
                    </div>
                  </DemandaTabPanel>

                  <DemandaTabPanel id="atendimento-mti" activeId={detailTab}>
                    {(!portalCamposCondicionais || visCampos?.atendimento) && (
                      <>
                        <div className="sy-dem-row sy-dem-row--2">
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Tipo da análise</span>
                            <input className="sy-dem-input" readOnly value={selecionada.tipoAnalise || '—'} />
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Modalidade do serviço</span>
                            <input
                              className="sy-dem-input"
                              readOnly
                              value={
                                selecionada.tipoAnalise === 'Serviço'
                                  ? selecionada.modalidadeServico || '—'
                                  : '—'
                              }
                            />
                          </label>
                        </div>
                        <div className="sy-dem-row sy-dem-row--2">
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Parceria</span>
                            <input className="sy-dem-input" readOnly value={selecionada.parceiroNome || '—'} />
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Solução</span>
                            <input
                              className="sy-dem-input"
                              readOnly
                              value={
                                !selecionada.produtoSolucao?.trim() ||
                                selecionada.produtoSolucao === SOLUCAO_A_QUALIFICAR
                                  ? '—'
                                  : selecionada.produtoSolucao
                              }
                            />
                          </label>
                        </div>
                        <div className="sy-dem-row sy-dem-row--2">
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Fabricante</span>
                            <input className="sy-dem-input" readOnly value={selecionada.fabricante || '—'} />
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Catálogo</span>
                            <input className="sy-dem-input" readOnly value={selecionada.catalogos || '—'} />
                          </label>
                        </div>
                        <div className="sy-dem-row sy-dem-row--1">
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Produtos</span>
                            <input className="sy-dem-input" readOnly value={selecionada.itensCatalogo || '—'} />
                          </label>
                        </div>
                        <div className="sy-dem-registros-list" aria-label="NEC e descrição do atendimento">
                          {DEMANDA_ATENDIMENTO_NEC_DESC.map(({ key, label }) => (
                            <DemandaAtendimentoRegistrosField
                              key={key}
                              label={label}
                              registros={selecionada[key] ?? []}
                              editable={modoMti || perfil === 'MTI'}
                              onChange={(next) => {
                                setDemandas((rows) =>
                                  rows.map((d) =>
                                    d.id === selecionada.id
                                      ? { ...d, [key]: next.length ? next : undefined }
                                      : d,
                                  ),
                                )
                              }}
                            />
                          ))}
                        </div>
                        <div className="sy-dem-row sy-dem-row--2">
                          {(Boolean(selecionada.valoresContrato?.trim()) || !portalCamposCondicionais) && (
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">Valores / contabilidade do contrato</span>
                              <input className="sy-dem-input" readOnly value={selecionada.valoresContrato || '—'} />
                            </label>
                          )}
                          {(Boolean(selecionada.saldoContabilizar?.trim()) || !portalCamposCondicionais) && (
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">Saldo a contabilizar</span>
                              <input
                                className="sy-dem-input"
                                readOnly
                                value={selecionada.saldoContabilizar || '—'}
                              />
                            </label>
                          )}
                        </div>
                        {(Boolean(selecionada.deliberacaoMti?.trim()) ||
                          Boolean(selecionada.caminhoComercial) ||
                          !portalCamposCondicionais) && (
                          <div className="sy-dem-row sy-dem-row--1">
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">Deliberação da MTI</span>
                              <input
                                className="sy-dem-input"
                                readOnly
                                value={
                                  selecionada.deliberacaoMti ||
                                  (selecionada.caminhoComercial === 'via_contrato'
                                    ? 'Aprovado · via contrato'
                                    : selecionada.caminhoComercial === 'orcamento'
                                      ? 'Aprovado · via orçamento'
                                      : selecionada.caminhoComercial === 'sem_cobertura'
                                        ? 'Aprovado · sem cobertura'
                                        : '—')
                                }
                              />
                            </label>
                          </div>
                        )}
                        <div className="sy-dem-registros-list" aria-label="Registros do atendimento MTI">
                          {DEMANDA_ATENDIMENTO_REGISTROS.map(({ key, label }) => (
                            <DemandaAtendimentoRegistrosField
                              key={key}
                              label={label}
                              registros={selecionada[key] ?? []}
                              editable={modoMti || perfil === 'MTI'}
                              onChange={(next) => {
                                setDemandas((rows) =>
                                  rows.map((d) =>
                                    d.id === selecionada.id
                                      ? { ...d, [key]: next.length ? next : undefined }
                                      : d,
                                  ),
                                )
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </DemandaTabPanel>

                  <DemandaTabPanel id="atendimento-parceiro" activeId={detailTab}>
                    {(!portalCamposCondicionais || visCampos?.atendimento || selecionada.parceiroNome) && (
                      <>
                        <div className="sy-dem-row sy-dem-row--2">
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Parceria</span>
                            <input className="sy-dem-input" readOnly value={selecionada.parceiroNome || '—'} />
                          </label>
                          <label className="sy-dem-field">
                            <span className="sy-dem-label">Atendimento iniciado</span>
                            <input
                              className="sy-dem-input"
                              readOnly
                              value={selecionada.parceiroIniciouAtendimento ? 'Sim' : 'Não'}
                            />
                          </label>
                        </div>
                        {(Boolean(selecionada.caminhoComercial) || !portalCamposCondicionais) && (
                          <div className="sy-dem-row sy-dem-row--1">
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">Caminho / parecer proposto</span>
                              <input
                                className="sy-dem-input"
                                readOnly
                                value={
                                  selecionada.caminhoComercial === 'via_contrato'
                                    ? 'Via contrato'
                                    : selecionada.caminhoComercial === 'orcamento'
                                      ? 'Orçamento'
                                      : selecionada.caminhoComercial === 'sem_cobertura'
                                        ? 'Sem cobertura'
                                        : selecionada.caminhoComercial || '—'
                                }
                              />
                            </label>
                          </div>
                        )}
                        {(Boolean(selecionada.entregavel?.trim()) || !portalCamposCondicionais) && (
                          <div className="sy-dem-row sy-dem-row--1">
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">Declaração / entregável (parceiro)</span>
                              <textarea
                                className="sy-dem-input sy-dem-input--area"
                                readOnly
                                rows={2}
                                value={selecionada.entregavel || ''}
                              />
                            </label>
                          </div>
                        )}
                        {(selecionada.anexosComprovacao?.length || !portalCamposCondicionais) && (
                          <div className="sy-dem-row sy-dem-row--1">
                            <label className="sy-dem-field">
                              <span className="sy-dem-label">Comprovações</span>
                              <input
                                className="sy-dem-input"
                                readOnly
                                value={
                                  selecionada.anexosComprovacao?.length
                                    ? selecionada.anexosComprovacao.map((a) => a.nome).join(', ')
                                    : '—'
                                }
                              />
                            </label>
                          </div>
                        )}
                      </>
                    )}
                  </DemandaTabPanel>

                  <DemandaTabPanel id="assinaturas" activeId={detailTab}>
                    <div className="sy-dem-row sy-dem-row--2">
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Patrocínio autorizado</span>
                        <input
                          className="sy-dem-input"
                          readOnly
                          value={
                            selecionada.contratoNatureza === 'Patrocinado (gestão)'
                              ? selecionada.patrocinioAutorizado
                                ? 'Sim'
                                : 'Pendente'
                              : '—'
                          }
                        />
                      </label>
                      <span className="sy-dem-field" aria-hidden />
                    </div>
                    {(!portalCamposCondicionais || visCampos?.assinaturasAtendimento) && (
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Assinatura · gestor</span>
                          <input
                            className="sy-dem-input"
                            readOnly
                            value={selecionada.assinaturaGestor ? 'Sim' : 'Pendente'}
                          />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Assinatura · fiscal</span>
                          <input
                            className="sy-dem-input"
                            readOnly
                            value={selecionada.assinaturaFiscal ? 'Sim' : 'Pendente'}
                          />
                        </label>
                      </div>
                    )}
                    <div className="sy-dem-row sy-dem-row--2">
                      {(!portalCamposCondicionais || visCampos?.assinaturasAtendimento) && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Assinatura · solicitante</span>
                          <input
                            className="sy-dem-input"
                            readOnly
                            value={selecionada.assinaturaSolicitante ? 'Sim' : 'Pendente'}
                          />
                        </label>
                      )}
                      {(!portalCamposCondicionais || visCampos?.os) && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Nº da OS</span>
                          <input className="sy-dem-input" readOnly value={selecionada.osVinculada || '—'} />
                        </label>
                      )}
                    </div>
                  </DemandaTabPanel>

                  <DemandaTabPanel id="entregavel" activeId={detailTab}>
                    {(!portalCamposCondicionais || visCampos?.entregavel) && (
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Entregável / declaração</span>
                          <textarea
                            className="sy-dem-input sy-dem-input--area"
                            readOnly
                            rows={2}
                            value={selecionada.entregavel || ''}
                          />
                        </label>
                      </div>
                    )}
                    <div className="sy-dem-row sy-dem-row--2">
                      {(!portalCamposCondicionais || visCampos?.homologacao || visCampos?.termoRecusado) && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Termo de homologação</span>
                          <input
                            className="sy-dem-input"
                            readOnly
                            value={
                              selecionada.termoRecusado
                                ? `${selecionada.homologacaoStatus || 'Recusado'} · demanda concluída`
                                : selecionada.homologacaoStatus || 'Não iniciado'
                            }
                          />
                        </label>
                      )}
                      {(!portalCamposCondicionais || visCampos?.raer) && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">RAER</span>
                          <input
                            className="sy-dem-input"
                            readOnly
                            value={selecionada.raerStatus || 'Não iniciado'}
                          />
                        </label>
                      )}
                    </div>
                  </DemandaTabPanel>

                  <DemandaTabPanel id="os-orc" activeId={detailTab}>
                    <div className="sy-dem-row sy-dem-row--2">
                      {(!portalCamposCondicionais || visCampos?.tipoOs) && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Tipo de OS</span>
                          <input
                            className="sy-dem-input"
                            readOnly
                            value={selecionada.tipoOs || '—'}
                          />
                        </label>
                      )}
                      {(!portalCamposCondicionais || visCampos?.metrica) && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Métrica do contrato</span>
                          <input
                            className="sy-dem-input"
                            readOnly
                            value={
                              selecionada.metricaContrato
                                ? `${selecionada.metricaContrato}${selecionada.catalogoVersaoVigente ? ` · catálogo ${selecionada.catalogoVersaoVigente}` : ''}`
                                : '—'
                            }
                          />
                        </label>
                      )}
                      {(!portalCamposCondicionais || visCampos?.orcamento) && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Orçamento vinculado</span>
                          <input
                            className="sy-dem-input"
                            readOnly
                            value={
                              selecionada.orcamento
                                ? `${selecionada.orcamento.numero} · ${selecionada.orcamento.status}`
                                : '—'
                            }
                          />
                        </label>
                      )}
                      {(!portalCamposCondicionais || visCampos?.semCobertura) && (
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Definir pagamento</span>
                          <input
                            className="sy-dem-input"
                            readOnly
                            value={selecionada.definirPagamento || 'Ainda não definido'}
                          />
                        </label>
                      )}
                    </div>
                    {(!portalCamposCondicionais || visCampos?.motivoUltimaAcao) &&
                      selecionada.motivoUltimaAcao && (
                      <div className="sy-dem-row sy-dem-row--1">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">Motivo da última ação</span>
                          <input className="sy-dem-input" readOnly value={selecionada.motivoUltimaAcao} />
                        </label>
                      </div>
                    )}
                  </DemandaTabPanel>

                  <DemandaTabPanel id="projeto" activeId={detailTab}>
                    <p className="sy-dem-solicitacao__lead">
                      Execução técnica (Luis): épico · projeto · status OS · executor · sprints · progresso
                      0–100%. Orquestração detalhada no SN; Atlas retém o que alimenta o termo.
                    </p>
                    <div className="sy-dem-row sy-dem-row--2">
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Executor</span>
                        <input
                          className="sy-dem-input"
                          readOnly
                          value={selecionada.executorTipo || '—'}
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">ServiceNow</span>
                        <input
                          className="sy-dem-input"
                          readOnly
                          value={selecionada.serviceNowStatus || 'Não enviado'}
                        />
                      </label>
                    </div>
                    <div className="sy-dem-row sy-dem-row--2">
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">OS vinculada</span>
                        <input
                          className="sy-dem-input"
                          readOnly
                          value={selecionada.osVinculada || '—'}
                        />
                      </label>
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Tipo OS</span>
                        <input
                          className="sy-dem-input"
                          readOnly
                          value={selecionada.tipoOs || '—'}
                        />
                      </label>
                    </div>
                    <div className="sy-dem-row sy-dem-row--1">
                      <label className="sy-dem-field">
                        <span className="sy-dem-label">Entregável / declaração técnica</span>
                        <textarea
                          className="sy-dem-input"
                          readOnly
                          rows={3}
                          value={selecionada.entregavel || '—'}
                        />
                      </label>
                    </div>
                    {selecionada.serviceNowId ? (
                      <div className="sy-dem-row sy-dem-row--2">
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">ID ServiceNow</span>
                          <input className="sy-dem-input" readOnly value={selecionada.serviceNowId} />
                        </label>
                        <label className="sy-dem-field">
                          <span className="sy-dem-label">SN em</span>
                          <input
                            className="sy-dem-input"
                            readOnly
                            value={selecionada.serviceNowEm || '—'}
                          />
                        </label>
                      </div>
                    ) : null}
                  </DemandaTabPanel>

                  <DemandaTabPanel id="historico" activeId={detailTab}>
                    <ul className="pc-dem-hist">
                      {selecionada.historico.map((h) => (
                        <li key={h.id}>
                          <strong>{h.acao}</strong>
                          <span>
                            {h.perfil}
                            {h.cargo ? ` · ${h.cargo}` : ''} · {h.por} ·{' '}
                            {new Date(h.em).toLocaleString('pt-BR')}
                          </span>
                          {h.detalhe && <em>{h.detalhe}</em>}
                        </li>
                      ))}
                    </ul>
                  </DemandaTabPanel>
                  </div>
                </div>

                <div className="pc-fab-footer pc-modal__footer sy-carta-fabs" role="toolbar" aria-label="Confirmar ou fechar">
                  <button
                    type="button"
                    className="pc-fab pc-fab--cancel"
                    onClick={abrirLista}
                    aria-label="Fechar modal"
                    title="Fechar"
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      close
                    </span>
                  </button>
                  <button
                    type="button"
                    className="pc-fab pc-fab--save"
                    onClick={() => {
                      if (!acaoAtiva) {
                        onToast('Selecione uma ação na aba Ações para registrar.')
                        setDetailTab('acoes')
                        return
                      }
                      confirmarAcao()
                    }}
                    aria-label="Confirmar e registrar ação"
                    title="Confirmar e registrar"
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      check
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
    </section>
  )
}
