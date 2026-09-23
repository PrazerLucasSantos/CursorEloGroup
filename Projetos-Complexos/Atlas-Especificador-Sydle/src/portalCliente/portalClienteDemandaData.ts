/** Demanda — Consol. 1.0 / Documentador F3.
 * Portais: Cliente e Parceiro. Back-office MTI = Projeto Atlas (épicos/classes), não portal.
 */

import { contatoPessoaDemo, responsavelDaOrgCliente } from './demandaOrgMti'

export type StatusDemanda =
  | 'Aguardando cadastro gestor/fiscal'
  | 'Aguardando gestor'
  | 'Aguardando pré-análise MTI'
  | 'Aguardando análise'
  | 'Aguardando parceiro'
  | 'Em análise'
  | 'Proposta parceiro · aguardando MTI'
  | 'Aguardando assinatura do atendimento'
  | 'Aguardando autorização patrocinador'
  | 'Em atendimento · parceiro'
  | 'Aguardando validação MTI'
  | 'Devolvida para correção'
  | 'Aguardando autorização'
  | 'Em orçamento'
  | 'Aguardando assinatura OS (gerente operação)'
  | 'Em homologação'
  | 'Aguardando assinatura do termo'
  | 'Dilatação de prazo'
  | 'Recusada'
  | 'Não autorizada'
  | 'Efetivado · entregue'
  | 'Aprovada · em atendimento'
  | 'Sem cobertura · definir pagamento'

export type TipoAnaliseDemanda = 'Licenciamento' | 'Serviço'

export type StatusHomologacao =
  | 'Não iniciado'
  | 'Em elaboração'
  | 'Aguardando assinatura'
  | 'Ajuste solicitado'
  | 'Assinado'
  | 'Recusado'

export type StatusSla = 'No prazo' | 'Em risco' | 'Estourado' | 'Dilatado'

export type StatusServiceNow =
  | 'Não enviado'
  | 'Aguardando autorização de execução'
  | 'Enviado · aprovada e em atendimento'
  | 'Erro de integração'

export type RegraFilaDemanda =
  | 'Consumo · gerente + titular da parceria'
  | 'Suporte · 1+N grupos · distribuição por carga'
  | 'Suporte · grupo/classe de serviço'
  | 'Parceiro notificado · fila parceria'
  | 'Aguardando definição'

export type SuporteCriterioDistribuicao =
  | 'Menor carga + disponibilidade'
  | 'Redistribuição manual MTI'
  | 'Aguardando distribuição'

export type OrigemDemanda = 'Cliente' | 'Parceiro' | 'MTI'

/** Natureza da demanda na abertura (consumo contratual × suporte). */
export type TipoDemanda = 'Consumo' | 'Suporte'

/**
 * Tipos exibidos no seletor — Suporte permanece no enum para demos legadas,
 * mas F3 (call Luis 17/09) trata Suporte como backlog.
 */
export const TIPOS_DEMANDA: TipoDemanda[] = ['Consumo', 'Suporte']

/** Call Luis 17/09 — Suporte fora do tronco F3 (backlog / 2ª fase). */
export const SUPORTE_BACKLOG_F3 = true

/** OS Global (guarda-chuva) × Dedicada (consumo pontual) — call Luis 17/09. */
export type TipoOs = 'Global' | 'Dedicada'

/**
 * Natureza/métrica do contrato — imutável por aditivo (serviço ≠ SN/licenciamento).
 * Call Luis 17/09 · RN-C1…C4.
 */
export type MetricaContrato = 'Serviço' | 'Licenciamento'

/** Abertura sem produto: MTI qualifica (descrição obrigatória; solução opcional). */
export const SOLUCAO_A_QUALIFICAR = 'A qualificar (MTI)'

/** Perfis: portais (Cliente/Parceiro) e ator MTI no Projeto Atlas (BO). */
export type PerfilDemo = 'Cliente' | 'Parceiro' | 'MTI'

/** Cargos do portal Cliente — N2: Gestor e Fiscal com as mesmas três ações (L6). */
export type CargoCliente = 'Demandante' | 'Gestor' | 'Fiscal'

/** Decisão registrada por gestor ou fiscal na autorização paralela (P02). */
export type DecisaoN2 = 'aprovar' | 'devolver' | 'recusar'

export type RegistroAuthN2 = {
  decisao: DecisaoN2
  motivo?: string
  em: string
  quem: string
}

export type AcaoDemanda =
  | 'aprovar_gestor'
  | 'recusar_gestor'
  | 'devolver_gestor'
  | 'iniciar_analise'
  | 'qualificar'
  | 'parceiro_iniciar'
  | 'parceiro_declarar'
  | 'validar_parceiro'
  | 'via_contrato'
  | 'assinar_atendimento'
  | 'enviar_orcamento'
  | 'enviar_proposta_orcamento'
  | 'aceitar_orcamento'
  | 'recusar_orcamento'
  | 'devolver_correcao'
  | 'recusar'
  | 'ajustar_enviar'
  | 'assinar_os_orcamento'
  | 'assinar_homologacao'
  | 'autorizar_servicenow'
  | 'encerrar_termo_raer'
  | 'solicitar_ajuste_termo'
  | 'solicitar_proposta'
  | 'definir_pagamento'
  | 'sem_cobertura'
  | 'conferir_quantitativos'
  | 'devolver_quantitativos'
  | 'mti_executar_declarar'
  | 'solicitar_dilacao'
  | 'aceitar_dilacao'
  | 'recusar_dilacao'
  | 'assinar_orcamento'
  | 'devolver_orcamento_ajuste'
  | 'recusar_termo'
  | 'regenerar_termo'
  | 'cadastrar_cargos'
  | 'reaproveitar_como_nova'
  | 'restituir_n2'
  | 'registrar_autorizacao_patrocinio' // Luis 17/09: patrocínio após qualificação MTI

/**
 * Cadeia de orçamento (calls 09/11/17):
 * elaboração → assinaturas (Vendas + Parceiro) → proposta ao cliente → Aceito/Recusado.
 */
export type StatusOrcamento =
  | 'Em elaboração'
  | 'Aguardando assinaturas'
  | 'Proposta enviada'
  | 'Aceito'
  | 'Recusado'
  | 'Devolvido'

export type OrcamentoItem = {
  id: string
  descricao: string
  quantidade: number
  valorUnitario: number
  catalogoVersao: string
}

export type OrcamentoDemanda = {
  numero: string
  status: StatusOrcamento
  itens: OrcamentoItem[]
  validade?: string
  observacoes?: string
  enviadoEm?: string
}

export interface DemandaAnexo {
  id: string
  nome: string
  tamanhoKb: number
}

/** Registro textual (padrão Observações Sydle: autor / data + conteúdo). */
export interface DemandaRegistroTexto {
  id: string
  autor: string
  em: string
  conteudo: string
}

export type DemandaAtendimentoRegistrosKey =
  | 'necDetalhada'
  | 'descricaoAtendimentoMti'
  | 'casoNegocio'
  | 'riscoDesempenho'
  | 'riscoNaoDesempenho'
  | 'habilitadores'
  | 'barreiras'
  | 'emEscopo'
  | 'foraEscopo'
  | 'consideracoes'
  | 'anotacoes'

/** NEC + Descrição MTI — mesmo padrão Observações (antes dos demais registros). */
export const DEMANDA_ATENDIMENTO_NEC_DESC: {
  key: 'necDetalhada' | 'descricaoAtendimentoMti'
  label: string
}[] = [
  { key: 'necDetalhada', label: 'NEC / necessidade detalhada' },
  { key: 'descricaoAtendimentoMti', label: 'Descrição do atendimento (MTI)' },
]

export const DEMANDA_ATENDIMENTO_REGISTROS: {
  key: DemandaAtendimentoRegistrosKey
  label: string
}[] = [
  { key: 'casoNegocio', label: 'Caso de negócio' },
  { key: 'riscoDesempenho', label: 'Risco de desempenho' },
  { key: 'riscoNaoDesempenho', label: 'Risco de não desempenho' },
  { key: 'habilitadores', label: 'Habilitadores' },
  { key: 'barreiras', label: 'Barreiras' },
  { key: 'emEscopo', label: 'Em escopo' },
  { key: 'foraEscopo', label: 'Fora de escopo' },
  { key: 'consideracoes', label: 'Considerações' },
  { key: 'anotacoes', label: 'Anotações' },
]

export interface DemandaHistorico {
  id: string
  em: string
  por: string
  perfil: PerfilDemo
  /** Preenchido quando a ação foi do perfil Cliente. */
  cargo?: CargoCliente
  acao: string
  detalhe?: string
}

export interface Demanda {
  id: string
  numero: string
  /** Título/nome descritivo (além do número). */
  nome?: string
  status: StatusDemanda
  clienteSolicitante: string
  descricao: string
  /** Consumo de itens/créditos do contrato ou suporte técnico. */
  tipo: TipoDemanda
  /** Estratégico | Operacional. */
  categoria?: 'Estratégico' | 'Operacional'
  /** Crítico | Alto | Moderado | Baixo | Planejado. */
  prioridade?: 'Crítico' | 'Alto' | 'Moderado' | 'Baixo' | 'Planejado'
  /** Organização tipo MTI (departamento). */
  departamento?: string
  /** Organização filha do departamento (Organização pai = departamento). */
  unidadeNegocio?: string
  /** Solução do contrato ou «Outros». */
  produtoSolucao: string
  /** Nº contrato quando informado. */
  numeroContrato?: string
  origem: OrigemDemanda
  contatoCliente: string
  /** CPF do responsável pela abertura. */
  contatoCpf?: string
  /** E-mail do responsável pela abertura. */
  contatoEmail?: string
  contatoSecundario?: string
  /** E-mail do contato secundário. */
  contatoSecundarioEmail?: string
  /** Telefone do contato secundário. */
  contatoSecundarioNumero?: string
  /** Telefone do contato principal (portal → Atlas). */
  contatoNumero?: string
  /** Cargo do responsável pela abertura (classe Cargo). */
  contatoCargo?: string
  /** Cargo do contato secundário. */
  contatoSecundarioCargo?: string
  /**
   * Responsável da Organização cliente (campo Responsável da UO tipo Cliente).
   * Distinto do responsável pela abertura.
   */
  responsavelOrg?: string
  responsavelOrgEmail?: string
  responsavelOrgNumero?: string
  /** Cargo do responsável da organização cliente. */
  responsavelOrgCargo?: string
  dataEvento: string
  anexos: DemandaAnexo[]
  criadoEm: string
  atualizadoEm: string
  observacoes?: string
  /** 1 solução + parceria → parceiro já notificado. */
  parceiroNotificado: boolean
  /** Data/hora da notificação ao parceiro (ISO). */
  parceiroNotificadoEm?: string
  /** MTI já qualificou (quando não caiu automático). */
  qualificado: boolean
  /** Data/hora da (re)qualificação MTI (ISO). */
  qualificadoEm?: string
  parceiroNome?: string
  motivoUltimaAcao?: string
  /** Atendimento via contrato. */
  catalogos?: string
  itensCatalogo?: string
  /** @deprecated Preferir descricaoAtendimentoMti (lista Observações). Mantido p/ métodos. */
  descricaoAtendimento?: string
  /** Descrição do atendimento MTI — lista (padrão Observações). */
  descricaoAtendimentoMti?: DemandaRegistroTexto[]
  /** NEC / necessidade detalhada — lista (padrão Observações). */
  necDetalhada?: DemandaRegistroTexto[]
  /** Registros textuais do atendimento MTI (padrão Observações). */
  casoNegocio?: DemandaRegistroTexto[]
  riscoDesempenho?: DemandaRegistroTexto[]
  riscoNaoDesempenho?: DemandaRegistroTexto[]
  habilitadores?: DemandaRegistroTexto[]
  barreiras?: DemandaRegistroTexto[]
  emEscopo?: DemandaRegistroTexto[]
  foraEscopo?: DemandaRegistroTexto[]
  consideracoes?: DemandaRegistroTexto[]
  anotacoes?: DemandaRegistroTexto[]
  /** Modalidade do serviço (Com projeto | Sem projeto) — condicional a Tipo = Serviço. */
  modalidadeServico?: 'Com projeto' | 'Sem projeto'
  /** Fabricante da solução (licenciamento). */
  fabricante?: string
  /** Snapshot contábil / valores do contrato para a execução. */
  saldoContabilizar?: string
  /** Decisão definitiva da MTI no atendimento. */
  deliberacaoMti?:
    | 'Solicitado ajuste (devolver)'
    | 'Reprovado'
    | 'Aprovado · via contrato'
    | 'Aprovado · via orçamento'
    | 'Aprovado · sem cobertura'
  osVinculada?: string
  /** Proposta comercial quando status = Em orçamento (RF-CLI-02/04). */
  orcamento?: OrcamentoDemanda
  /** Call recente: tipo na análise (muda campos). */
  tipoAnalise?: TipoAnaliseDemanda
  /** Natureza do contrato (próprio × gestão/patrocínio × sem). */
  contratoNatureza?: 'Próprio do cliente' | 'Patrocinado (gestão)' | 'Sem contrato'
  /**
   * Luis 17/09: autorização do patrocinador (contrato de gestão) ocorre
   * DEPOIS da qualificação MTI e ANTES das assinaturas do atendimento/OS.
   */
  patrocinioAutorizado?: boolean
  patrocinioAutorizadoEm?: string
  patrocinioAutorizadoPor?: string
  /**
   * Métrica contratual imutável (serviço × licenciamento).
   * Aditivo só amplia itens da mesma métrica — call Luis 17/09.
   */
  metricaContrato?: MetricaContrato
  /** Versão de catálogo vigente apontada pelo contrato. */
  catalogoVersaoVigente?: string
  /**
   * Tipo de OS: Global (guarda-chuva, consumos parciais) ou Dedicada (exato do pedido).
   * Definido na OS e orientado pelo produto (pacote × individual).
   */
  tipoOs?: TipoOs
  /**
   * Call Luis 17/09 · L02: recusa do termo NÃO reabre a demanda.
   * Demanda permanece concluída; só o ciclo do termo fica recusado.
   */
  termoRecusado?: boolean
  /** SLA começa na abertura (RN14 · data de início). */
  slaInicio?: string
  slaPrazoDeclarado?: string
  slaStatus?: StatusSla
  /** SLA execução — pós assinaturas / start parceiro. */
  slaExecucaoInicio?: string
  slaExecucaoStatus?: 'Não iniciado' | 'Em execução' | StatusSla
  /** RN14 · data de finalização da contagem do SLA. */
  slaFinalizacao?: string
  /**
   * RN14 · prazo de SLA para assinatura do orçamento
   * (só quando houver caminho de orçamento).
   */
  slaPrazoAssinaturaOrcamento?: string
  /** Via contrato — NEC / valores. */
  necAtendimento?: string
  valoresContrato?: string
  /** Assinaturas via contrato. */
  assinaturaGestor?: boolean
  assinaturaFiscal?: boolean
  assinaturaSolicitante?: boolean
  /**
   * P02 · G02a — autorização paralela do contratante (Consumo).
   * Status só fecha quando ambos registram; prevalece a ação mais restritiva.
   */
  exigeAuthContratante?: boolean
  authGestor?: RegistroAuthN2
  authFiscal?: RegistroAuthN2
  /** Ciência do alerta de saúde do contrato (abertura / OS). */
  saudeAckRegistrado?: boolean
  saudeAckEm?: string
  /** Entregável / homologação. */
  entregavel?: string
  /** Anexos/comprovações enviados pelo parceiro ao declarar atendida. */
  anexosComprovacao?: DemandaAnexo[]
  homologacaoStatus?: StatusHomologacao
  /** Cadeia orçamento: Vendas (MTI) → Parceiro (se notificado) → Cliente. */
  orcamentoAssinadoVendas?: boolean
  orcamentoAssinadoParceiro?: boolean
  orcamentoAssinadoCliente?: boolean
  orcamentoAssinadoGerenteArea?: boolean
  osAssinadaGerenteOperacao?: boolean
  /** Parceiro efetivou / bateu ponto na execução (após autorização SN). */
  parceiroIniciouAtendimento?: boolean
  /** Execução licença (call 17/09): credenciais, appliance, comprovação, qtd. */
  credenciaisLicenca?: string
  applianceLicenca?: string
  comprovacaoFabricanteAnexos?: DemandaAnexo[]
  quantidadeExecutada?: number
  /** Dilatação tripartite (Cliente + MTI + Parceiro). */
  dilacaoNovoPrazo?: string
  dilacaoMotivo?: string
  dilacaoSolicitadaPor?: PerfilDemo
  dilacaoAckCliente?: boolean
  dilacaoAckMti?: boolean
  dilacaoAckParceiro?: boolean
  definirPagamento?: 'Indenização' | 'Nova contratação' | 'Desistiu' | 'Ainda não definido'
  /** R16 — fila e responsáveis */
  regraFila?: RegraFilaDemanda
  gerenteParceria?: string
  responsavelTitular?: string
  substituto1?: string
  substituto2?: string
  /** Individual | Coletivo | Somente MTI (15/09). */
  modalidadeParceria?: 'Individual' | 'Coletivo' | 'Somente MTI'
  /** @deprecated Preferir suporteGrupos — mantido para compatibilidade de demo. */
  suporteGrupo?: string
  /** 1+N grupos de apoio (Luís: ex. Infra + Rede). */
  suporteGrupos?: string[]
  /** Resultado da distribuição automática por grupo (nome + carga). */
  suporteProfissionais?: string
  suporteCriterioDistribuicao?: SuporteCriterioDistribuicao
  suporte24x7?: boolean
  /** R17 ServiceNow */
  serviceNowStatus?: StatusServiceNow
  serviceNowEm?: string
  serviceNowId?: string
  /** R18 RAER */
  raerStatus?: 'Não iniciado' | 'Em elaboração' | 'Vinculado ao termo' | 'Concluído'
  homologAjuste?: boolean
  homologAjustePor?: 'Cliente' | 'MTI'
  /** Caminho comercial escolhido na deliberação (retorno de quantitativos). */
  caminhoComercial?: 'via_contrato' | 'orcamento' | 'sem_cobertura'
  /** Conferência P04 — quantitativos OK antes de autorizar (L7/E12). */
  quantitativosConferidos?: boolean
  /** Quem executa após SN (P05). */
  executorTipo?: 'Parceiro' | 'MTI'
  /** Assinaturas do termo (L3) — mesmas três papéis do atendimento. */
  termoAssinaturaGestor?: boolean
  termoAssinaturaFiscal?: boolean
  termoAssinaturaSolicitante?: boolean
  historico: DemandaHistorico[]
}

export const STATUS_DEMANDA: StatusDemanda[] = [
  'Aguardando cadastro gestor/fiscal',
  'Aguardando gestor',
  'Aguardando pré-análise MTI',
  'Aguardando análise',
  'Aguardando parceiro',
  'Em análise',
  'Proposta parceiro · aguardando MTI',
  'Aguardando assinatura do atendimento',
  'Aguardando autorização patrocinador',
  'Em atendimento · parceiro',
  'Aguardando validação MTI',
  'Devolvida para correção',
  'Aguardando autorização',
  'Em orçamento',
  'Aguardando assinatura OS (gerente operação)',
  'Em homologação',
  'Aguardando assinatura do termo',
  'Dilatação de prazo',
  'Recusada',
  'Não autorizada',
  'Efetivado · entregue',
  'Aprovada · em atendimento',
  'Sem cobertura · definir pagamento',
]

/** Estágios 1–9 da linha do tempo (cliente · parceiro · MTI). */
export const TIMELINE_ESTAGIOS = [
  '1. Abertura (SLA inicia)',
  '2. Hierarquia cliente',
  '3. Pré-análise MTI',
  '4. Análise / parceiro / fila',
  '5. Parecer ou efetivação',
  '6. Execução / ServiceNow',
  '7. Validação MTI',
  '8. Homologação / RAER',
  '9. Efetivado / fim',
] as const

export function regraFilaPorDemanda(demanda: Pick<Demanda, 'tipo' | 'parceiroNotificado'>): RegraFilaDemanda {
  if (demanda.parceiroNotificado) return 'Parceiro notificado · fila parceria'
  if (demanda.tipo === 'Suporte') return 'Suporte · 1+N grupos · distribuição por carga'
  return 'Consumo · gerente + titular da parceria'
}

/** Roster demo por grupo — carga de tarefas para sorteio proporcional (Luiz). */
const ROSTER_SUPORTE_DEMO: Record<string, { nome: string; tarefas: number; disponivel: boolean }[]> = {
  'Grupo Infra · backup': [
    { nome: 'Marcos Infra', tarefas: 6, disponivel: true },
    { nome: 'Julia Infra', tarefas: 6, disponivel: true },
    { nome: 'Paulo Infra', tarefas: 3, disponivel: true },
    { nome: 'Renata Infra', tarefas: 6, disponivel: false },
  ],
  'Grupo Rede · conectividade': [
    { nome: 'Bruno Rede', tarefas: 5, disponivel: true },
    { nome: 'Carla Rede', tarefas: 2, disponivel: true },
    { nome: 'Diego Rede', tarefas: 5, disponivel: true },
  ],
  'Squad MTI CLOUD · sobreaviso': [
    { nome: 'Ana Cloud', tarefas: 4, disponivel: true },
    { nome: 'Luís Cloud', tarefas: 2, disponivel: true },
    { nome: 'Marta Cloud', tarefas: 4, disponivel: true },
  ],
  'Squad suporte · triagem': [
    { nome: 'Fernanda Triagem', tarefas: 5, disponivel: true },
    { nome: 'Gustavo Triagem', tarefas: 3, disponivel: true },
  ],
  'Squad suporte · sobreaviso MTI': [
    { nome: 'Helena Suporte', tarefas: 4, disponivel: true },
    { nome: 'Igor Suporte', tarefas: 1, disponivel: true },
  ],
}

const ROSTER_SUPORTE_PADRAO = [
  { nome: 'Profissional A', tarefas: 4, disponivel: true },
  { nome: 'Profissional B', tarefas: 2, disponivel: true },
]

/** Qualifica tipo → 1+N grupos de apoio (complemento Luiz). */
export function encaminharSuporteGrupos(
  produtoSolucao: string,
  descricao: string,
): { grupos: string[]; regime24x7: boolean } {
  const d = descricao.toLowerCase()
  if (/\bbackup\b/.test(d) || (/\binfra\b/.test(d) && /\brede\b/.test(d))) {
    return {
      grupos: ['Grupo Infra · backup', 'Grupo Rede · conectividade'],
      regime24x7: false,
    }
  }
  if (produtoSolucao.includes('CLOUD')) {
    return { grupos: ['Squad MTI CLOUD · sobreaviso'], regime24x7: true }
  }
  if (produtoSolucao === SOLUCAO_OUTROS) {
    return { grupos: ['Squad suporte · triagem'], regime24x7: false }
  }
  return { grupos: ['Squad suporte · sobreaviso MTI'], regime24x7: false }
}

/** Sorteio por menor carga entre disponíveis — um profissional por grupo acionado. */
export function distribuirProfissionaisSuporte(grupos: string[]): {
  profissionais: string
  criterio: SuporteCriterioDistribuicao
} {
  const linhas = grupos.map((grupo) => {
    const roster = ROSTER_SUPORTE_DEMO[grupo] ?? ROSTER_SUPORTE_PADRAO
    const candidatos = roster.filter((p) => p.disponivel)
    const pool = candidatos.length > 0 ? candidatos : roster
    const escolhido = pool.reduce((menor, atual) =>
      atual.tarefas < menor.tarefas ? atual : menor,
    )
    return `${grupo}: ${escolhido.nome} (${escolhido.tarefas} tarefas)`
  })
  return {
    profissionais: linhas.join('\n'),
    criterio: 'Menor carga + disponibilidade',
  }
}

/** Monta campos de suporte na abertura (qualificação + encaminhamento + distribuição). */
export function montarSuporteNaAbertura(
  produtoSolucao: string,
  descricao: string,
): Pick<
  Demanda,
  | 'suporteGrupo'
  | 'suporteGrupos'
  | 'suporteProfissionais'
  | 'suporteCriterioDistribuicao'
  | 'suporte24x7'
  | 'regraFila'
> {
  const { grupos, regime24x7 } = encaminharSuporteGrupos(produtoSolucao, descricao)
  const { profissionais, criterio } = distribuirProfissionaisSuporte(grupos)
  return {
    regraFila: 'Suporte · 1+N grupos · distribuição por carga',
    suporteGrupos: grupos,
    suporteGrupo: grupos.join(' · '),
    suporteProfissionais: profissionais,
    suporteCriterioDistribuicao: criterio,
    suporte24x7: regime24x7,
  }
}

export function estagioTimeline(status: StatusDemanda): number {
  switch (status) {
    case 'Aguardando cadastro gestor/fiscal':
    case 'Aguardando gestor':
    case 'Devolvida para correção':
      return 2
    case 'Aguardando pré-análise MTI':
      return 3
    case 'Aguardando análise':
    case 'Aguardando parceiro':
    case 'Proposta parceiro · aguardando MTI':
      return 4
    case 'Em análise':
    case 'Aguardando assinatura do atendimento':
    case 'Aguardando autorização patrocinador':
    case 'Em orçamento':
    case 'Aguardando assinatura OS (gerente operação)':
    case 'Sem cobertura · definir pagamento':
      return 5
    case 'Em atendimento · parceiro':
    case 'Aprovada · em atendimento':
    case 'Dilatação de prazo':
      return 6
    case 'Aguardando validação MTI':
      return 7
    case 'Aguardando autorização':
    case 'Em homologação':
    case 'Aguardando assinatura do termo':
      return 8
    case 'Efetivado · entregue':
    case 'Recusada':
    case 'Não autorizada':
      return 9
    default:
      return 1
  }
}

export function labelTimeline(status: StatusDemanda): string {
  const n = estagioTimeline(status)
  return `Estágio ${n} de 9 · ${TIMELINE_ESTAGIOS[n - 1] ?? '—'}`
}

/**
 * Visibilidade de campos nos portais cliente/parceiro.
 * Só exibe o que já existe ou cujo status do fluxo já alcançou o preenchimento.
 * Atlas/MTI continua mostrando tudo.
 */
export type VisibilidadeCamposDemanda = {
  solucaoInformada: boolean
  contrato: boolean
  naturezaContrato: boolean
  observacoes: boolean
  anexos: boolean
  contatoSecundario: boolean
  slaExecucao: boolean
  slaFinalizacao: boolean
  slaAssinaturaOrcamento: boolean
  parceiro: boolean
  qualificacao: boolean
  responsaveisFila: boolean
  atendimento: boolean
  assinaturasAtendimento: boolean
  orcamento: boolean
  os: boolean
  tipoOs: boolean
  metrica: boolean
  semCobertura: boolean
  entregavel: boolean
  homologacao: boolean
  raer: boolean
  serviceNow: boolean
  termoRecusado: boolean
  n2Auth: boolean
  motivoUltimaAcao: boolean
}

export function visibilidadeCamposDemandaPortal(d: Demanda): VisibilidadeCamposDemanda {
  const est = estagioTimeline(d.status)
  const solucaoInformada =
    Boolean(d.produtoSolucao?.trim()) && d.produtoSolucao !== SOLUCAO_A_QUALIFICAR
  const contrato = Boolean(d.numeroContrato?.trim())
  const homologAvancada =
    Boolean(d.homologacaoStatus) && d.homologacaoStatus !== 'Não iniciado'
  const raerAvancado = Boolean(d.raerStatus) && d.raerStatus !== 'Não iniciado'
  const snEnviado = Boolean(d.serviceNowStatus) && d.serviceNowStatus !== 'Não enviado'
  const atendimento =
    Boolean(d.catalogos?.trim()) ||
    Boolean(d.itensCatalogo?.trim()) ||
    Boolean(d.descricaoAtendimento?.trim()) ||
    Boolean(d.descricaoAtendimentoMti?.length) ||
    Boolean(d.necAtendimento?.trim()) ||
    Boolean(d.necDetalhada?.length) ||
    Boolean(d.valoresContrato?.trim()) ||
    d.status === 'Aguardando assinatura do atendimento' ||
    (est >= 5 && d.caminhoComercial === 'via_contrato')
  const assinaturasAtendimento =
    d.assinaturaGestor === true ||
    d.assinaturaFiscal === true ||
    d.assinaturaSolicitante === true ||
    d.status === 'Aguardando assinatura do atendimento' ||
    (est >= 5 && atendimento)
  const os =
    Boolean(d.osVinculada?.trim()) ||
    d.status === 'Aguardando assinatura OS (gerente operação)' ||
    d.status === 'Aprovada · em atendimento' ||
    d.status === 'Em atendimento · parceiro' ||
    d.status === 'Dilatação de prazo' ||
    est >= 6
  const orcamento = Boolean(d.orcamento)
  const slaEncerrada =
    d.status === 'Recusada' ||
    d.status === 'Não autorizada' ||
    d.status === 'Efetivado · entregue'
  const parceiro =
    d.parceiroNotificado ||
    Boolean(d.parceiroNome?.trim()) ||
    d.status === 'Aguardando parceiro' ||
    d.status === 'Proposta parceiro · aguardando MTI' ||
    d.status === 'Em análise' ||
    est >= 4
  const qualificacao = d.qualificado || est >= 3 || solucaoInformada || contrato
  const entregavel =
    Boolean(d.entregavel?.trim()) ||
    Boolean(d.anexosComprovacao?.length) ||
    d.status === 'Aguardando validação MTI' ||
    est >= 7
  const homologacao =
    homologAvancada ||
    d.termoRecusado === true ||
    d.status === 'Em homologação' ||
    d.status === 'Aguardando assinatura do termo' ||
    d.status === 'Efetivado · entregue' ||
    est >= 8
  const semCobertura =
    d.status === 'Sem cobertura · definir pagamento' ||
    Boolean(d.definirPagamento && d.definirPagamento !== 'Ainda não definido') ||
    d.caminhoComercial === 'sem_cobertura'

  return {
    solucaoInformada,
    contrato,
    naturezaContrato: Boolean(d.contratoNatureza) && (contrato || qualificacao),
    observacoes: Boolean(d.observacoes?.trim()),
    anexos: d.anexos.length > 0,
    contatoSecundario: Boolean(d.contatoSecundario?.trim()),
    slaExecucao:
      Boolean(d.slaExecucaoInicio) ||
      (d.slaExecucaoStatus != null && d.slaExecucaoStatus !== 'Não iniciado') ||
      est >= 6,
    slaFinalizacao: Boolean(d.slaFinalizacao) || slaEncerrada,
    slaAssinaturaOrcamento:
      orcamento || Boolean(d.slaPrazoAssinaturaOrcamento?.trim()),
    parceiro,
    qualificacao,
    responsaveisFila:
      parceiro &&
      (Boolean(d.gerenteParceria) ||
        Boolean(d.responsavelTitular) ||
        Boolean(d.substituto1) ||
        Boolean(d.substituto2) ||
        est >= 4),
    atendimento,
    assinaturasAtendimento,
    orcamento,
    os: os && (Boolean(d.osVinculada?.trim()) || est >= 6 || d.status === 'Aguardando assinatura OS (gerente operação)'),
    tipoOs: Boolean(d.tipoOs) && (Boolean(d.osVinculada?.trim()) || est >= 5),
    metrica: Boolean(d.metricaContrato) && (contrato || qualificacao || est >= 5),
    semCobertura,
    entregavel,
    homologacao,
    raer: raerAvancado || homologacao,
    serviceNow: snEnviado || est >= 6,
    termoRecusado: d.termoRecusado === true,
    n2Auth:
      d.exigeAuthContratante !== false &&
      (Boolean(d.authGestor) ||
        Boolean(d.authFiscal) ||
        d.status === 'Aguardando gestor' ||
        d.status === 'Aguardando cadastro gestor/fiscal'),
    motivoUltimaAcao: Boolean(d.motivoUltimaAcao?.trim()),
  }
}

/** Abas do detalhe portal: oculta seções ainda sem conteúdo no status atual. */
export function tabVisivelPortal(
  tabId: string,
  v: VisibilidadeCamposDemanda,
): boolean {
  switch (tabId) {
    case 'andamento':
    case 'solicitacao':
    case 'sla':
    case 'necessidade':
    case 'acoes':
    case 'historico':
      return true
    case 'fila':
      return v.parceiro || v.qualificacao || v.responsaveisFila || v.n2Auth
    case 'analise':
    case 'atendimento-mti':
      return v.qualificacao || v.atendimento
    case 'atendimento':
    case 'atendimento-parceiro':
      return v.atendimento || v.assinaturasAtendimento
    case 'assinaturas':
      return v.assinaturasAtendimento || v.os
    case 'entregavel':
      return v.entregavel || v.homologacao || v.raer || v.termoRecusado
    case 'os-orc':
      return v.os || v.tipoOs || v.orcamento || v.metrica || v.semCobertura
    case 'projeto':
      return v.atendimento || v.serviceNow || v.entregavel
    default:
      return true
  }
}

export const ORIGENS_DEMANDA: OrigemDemanda[] = ['Cliente', 'Parceiro', 'MTI']

/** Origens na abertura pelo portal (MTI abre no back-office). */
export const ORIGENS_PORTAL: OrigemDemanda[] = ['Cliente', 'Parceiro']

export const PERFIS_PORTAL: { id: Exclude<PerfilDemo, 'MTI'>; label: string; hint: string }[] = [
  { id: 'Cliente', label: 'Cliente', hint: 'Portal do cliente' },
  { id: 'Parceiro', label: 'Parceiro', hint: 'Portal do parceiro · canal Demanda' },
]

/** @deprecated Use PERFIS_PORTAL nos portais. MTI opera no Projeto Atlas (épicos/classes). */
export const PERFIS_DEMO: { id: PerfilDemo; label: string; hint: string }[] = [
  ...PERFIS_PORTAL,
  { id: 'MTI', label: 'MTI', hint: 'Projeto Atlas (BO) — não é portal' },
]

export const CARGOS_CLIENTE: { id: CargoCliente; label: string; hint: string }[] = [
  { id: 'Demandante', label: 'Solicitante', hint: 'Abre demanda; não delibera autorização' },
  { id: 'Gestor', label: 'Gestor', hint: 'Aprovar / devolver / recusar' },
  { id: 'Fiscal', label: 'Fiscal', hint: 'Mesmas ações do gestor' },
]

export const CLIENTE_PORTAL = 'SEPLAG - Secretaria de Estado de Planejamento e Gestao'
export const USUARIO_LOGADO = 'Lucas Costa'
/** Telefone do usuário logado (espelhado em Contato · número na Demanda Atlas). */
export const CONTATO_NUMERO_LOGADO = '(65) 99123-4567'
export const CONTATOS_CLIENTE = [
  'Ana Paula Ribeiro',
  'Carlos Eduardo Souza',
  'Fernanda Lima Santos',
  'Ricardo Almeida Ferreira',
  'Juliana Mendes Costa',
  'Pedro Henrique Alves',
  'Mariana Souza Oliveira',
  'Bruno Ferreira Dias',
  'Camila Rocha Nunes',
  'Thiago Barbosa Lima',
]
/** Contatos secundários: todos os cadastrados (exceto o principal logado) + opção Todos. */
export const CONTATO_SECUNDARIO_TODOS = 'Todos'
export const CONTATOS_SECUNDARIOS = [
  CONTATO_SECUNDARIO_TODOS,
  ...CONTATOS_CLIENTE.filter((c) => c !== USUARIO_LOGADO),
]

/** Solução vinculada a contrato/OS (fonte 20/07 + card Sydle). */
export type SolucaoContrato = {
  nome: string
  parceria: boolean
  parceiro?: string
}

/** Detalhe exibido ao selecionar solução (card / tow chip do contrato). */
export type ContratoDemanda = {
  numero: string
  /** Nome curto para chip. */
  nome: string
  /** Texto de vínculo das soluções à OS (referência interna). */
  resumoVinculo: string
  contratante: string
  contratada: string
  vigenciaInicio: string
  vigenciaFim: string
  fundamento: string
  processoAdministrativo: string
  ordemServico: string
  saldoTotal: number
  saldoConsumido: number
  osAbertas: number
  provisionado: number
  solucoes: SolucaoContrato[]
  /**
   * G02a — há Gestor E Fiscal cadastrados no vínculo?
   * `true`/omitido → Consumo passa por autorização paralela (N2).
   * `false` → EXC-CARG: N2 não é pulado; a demanda fica «Aguardando cadastro
   *   gestor/fiscal» até o administrador do cliente cadastrar (decisão 17/09).
   */
  temGestorFiscalCadastrados?: boolean
}

/** Contratos do portal (alinhados a portalClienteData) + soluções/parceria (fonte 20/07). */
export const CONTRATOS_CLIENTE: ContratoDemanda[] = [
  {
    numero: '001/2026/FIPLAN',
    nome: 'OS FIPLAN — SEFAZ-MT',
    resumoVinculo:
      'Soluções MTI HOST, MTI LAB, MTI Soluções e MTI DevSec.Gov/FIPLAN, vinculadas à Ordem de Serviço nº 001/2026/FIPLAN.',
    contratante: 'Secretaria de Estado de Fazenda de Mato Grosso (SEFAZ-MT)',
    contratada: 'Empresa Mato-grossense de Tecnologia da Informação (MTI)',
    vigenciaInicio: '2026-04-01',
    vigenciaFim: '2028-04-01',
    fundamento: 'Art. 75, IX, da Lei nº 14.133/2021',
    processoAdministrativo: 'SEFAZ-PRO-2025/08022',
    ordemServico: '001/2026/FIPLAN',
    saldoTotal: 3200000,
    saldoConsumido: 980000,
    osAbertas: 2,
    provisionado: 187500,
    solucoes: [
      { nome: 'MTI HOST', parceria: false },
      { nome: 'MTI LAB', parceria: false },
      { nome: 'MTI Soluções', parceria: false },
      { nome: 'MTI DevSec.Gov/FIPLAN', parceria: true, parceiro: 'EloGroup' },
    ],
    temGestorFiscalCadastrados: true,
  },
  {
    numero: 'CT-2026-0142',
    nome: 'MTI CLOUD + DevSec.Gov',
    resumoVinculo:
      'Soluções MTI CLOUD e DevSec.Gov vinculadas ao contrato CT-2026-0142.',
    contratante: 'Órgão cliente PJ (portal demo)',
    contratada: 'Empresa Mato-grossense de Tecnologia da Informação (MTI)',
    vigenciaInicio: '2025-04-01',
    vigenciaFim: '2027-03-31',
    fundamento: 'Art. 75, IX, da Lei nº 14.133/2021',
    processoAdministrativo: '—',
    ordemServico: '—',
    saldoTotal: 2400000,
    saldoConsumido: 876500,
    osAbertas: 2,
    provisionado: 1680000,
    solucoes: [
      { nome: 'MTI CLOUD — Serviços em nuvem', parceria: true, parceiro: 'Parceiro Cloud MT' },
      { nome: 'DevSec.Gov — Governança de riscos', parceria: true, parceiro: 'EloGroup' },
    ],
    temGestorFiscalCadastrados: true,
  },
  {
    numero: 'CT-2025-0891',
    nome: 'MTI Simplifica',
    resumoVinculo: 'Solução MTI Simplifica vinculada ao contrato CT-2025-0891.',
    contratante: 'Órgão cliente PJ (portal demo)',
    contratada: 'Empresa Mato-grossense de Tecnologia da Informação (MTI)',
    vigenciaInicio: '2024-06-01',
    vigenciaFim: '2026-05-31',
    fundamento: 'Art. 75, IX, da Lei nº 14.133/2021',
    processoAdministrativo: '—',
    ordemServico: '—',
    saldoTotal: 580000,
    saldoConsumido: 412300,
    osAbertas: 1,
    provisionado: 420000,
    solucoes: [{ nome: 'MTI Simplifica — Desburocratização', parceria: true, parceiro: 'EloGroup' }],
    /** Demo G02a · EXC-CARG — sem Gestor+Fiscal no vínculo → pausa até cadastro (N2 nunca é pulado). */
    temGestorFiscalCadastrados: false,
  },
]

export const SOLUCAO_OUTROS = 'Outros'

export type SolucaoCatalogo = SolucaoContrato & { numeroContrato: string }

/** Lista plana de soluções (seleção na abertura — contrato derivado). */
export function todasSolucoesCatalogo(): SolucaoCatalogo[] {
  return CONTRATOS_CLIENTE.flatMap((c) =>
    c.solucoes.map((s) => ({ ...s, numeroContrato: c.numero })),
  )
}

export function contratoPorNumero(numeroContrato: string | undefined): ContratoDemanda | undefined {
  if (!numeroContrato) return undefined
  return CONTRATOS_CLIENTE.find((c) => c.numero === numeroContrato)
}

export function solucaoNoCatalogo(nomeSolucao: string): SolucaoCatalogo | undefined {
  if (!nomeSolucao || nomeSolucao === SOLUCAO_OUTROS) return undefined
  return todasSolucoesCatalogo().find((s) => s.nome === nomeSolucao)
}

export function contratoPorSolucao(nomeSolucao: string): ContratoDemanda | undefined {
  const s = solucaoNoCatalogo(nomeSolucao)
  return s ? contratoPorNumero(s.numeroContrato) : undefined
}

export function solucoesDoContrato(numeroContrato: string) {
  return contratoPorNumero(numeroContrato)?.solucoes ?? []
}

export function formatVigenciaContrato(c: ContratoDemanda): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }
  return `${fmt(c.vigenciaInicio)} a ${fmt(c.vigenciaFim)}`
}

export function saldoGlobalContrato(c: ContratoDemanda): number {
  return Math.max(0, c.saldoTotal - c.saldoConsumido)
}

/** Status de saúde do contrato (Luis 15/09 · Discovery Fase 3).
 * Base: OS emitidas (provisionado) + projeção de consumo.
 * Faixas: Saudável | Atenção (déficit ≤ acréscimo 25%) | Crítico (déficit > 25%).
 */
export type StatusSaudeContrato = 'Saudável' | 'Atenção' | 'Crítico'

export type AvaliacaoSaudeContrato = {
  status: StatusSaudeContrato
  /** Comprometimento projetado = consumo até o momento + total provisionado (OS emitidas). */
  projetado: number
  capacidade: number
  deficit: number
  /** Limite de acréscimo formalizado = 25% da capacidade do contrato. */
  limiteAcrescimo25: number
  mensagem: string
}

/**
 * Saúde do contrato (Luis 15/09 — Fontes Atlas / Discovery).
 * «A saúde é basicamente baseada nas ordens de serviço emitidas.»
 * Projeção = consumo até o momento + total provisionado (valores das OS abertas).
 * - Saudável: sem déficit projetado (projetado ≤ capacidade).
 * - Atenção: há déficit, mas acréscimo formalizado de até 25% pode cobri-lo.
 * - Crítico: déficit projetado supera o limite de acréscimo de 25%.
 * Comportamento: alerta informativo na abertura e na geração de OS («vai avisar»).
 * Não bloqueia o fluxo — fontes não definem ACK/ciência obrigatório.
 */
export function avaliarSaudeValores(
  capacidade: number,
  consumido: number,
  provisionado: number,
): AvaliacaoSaudeContrato {
  const projetado = consumido + provisionado
  const deficit = Math.max(0, projetado - capacidade)
  const limiteAcrescimo25 = capacidade * 0.25
  if (deficit <= 0) {
    return {
      status: 'Saudável',
      projetado,
      capacidade,
      deficit: 0,
      limiteAcrescimo25,
      mensagem:
        'Comprometimento das OS emitidas dentro da capacidade do contrato.',
    }
  }
  if (deficit <= limiteAcrescimo25) {
    return {
      status: 'Atenção',
      projetado,
      capacidade,
      deficit,
      limiteAcrescimo25,
      mensagem:
        'Há um déficit projetado, mas um acréscimo formalizado dentro do limite de 25% pode cobri-lo.',
    }
  }
  return {
    status: 'Crítico',
    projetado,
    capacidade,
    deficit,
    limiteAcrescimo25,
    mensagem: 'O déficit projetado supera o limite de acréscimo de 25%.',
  }
}

export function avaliarSaudeContrato(c: ContratoDemanda): AvaliacaoSaudeContrato {
  return avaliarSaudeValores(c.saldoTotal, c.saldoConsumido, c.provisionado)
}

/**
 * Saúde ao projetar OS nova (17/09: OS nova → saúde do contrato com a OS na projeção).
 * Inclui o valor da OS nova no provisionado.
 */
export function avaliarSaudeComNovaOs(
  c: ContratoDemanda,
  valorOsNova: number,
): AvaliacaoSaudeContrato {
  return avaliarSaudeValores(
    c.saldoTotal,
    c.saldoConsumido,
    c.provisionado + Math.max(0, valorOsNova),
  )
}

/** G02a — Consumo exige N2 paralelo só se o vínculo tem Gestor e Fiscal. */
export function vinculoExigeAuthContratante(numeroContrato?: string): boolean {
  const c = contratoPorNumero(numeroContrato)
  if (!c) return false
  return c.temGestorFiscalCadastrados !== false
}

/**
 * G02a · EXC-CARG — o vínculo EXISTE mas não tem Gestor e Fiscal cadastrados.
 * Decisão 17/09: N2 nunca é pulado. Sem cargos, a demanda NÃO vai direto à MTI;
 * fica em «Aguardando cadastro gestor/fiscal» até o administrador do cliente cadastrar.
 */
export function vinculoSemCargosContratante(numeroContrato?: string): boolean {
  const c = contratoPorNumero(numeroContrato)
  if (!c) return false
  return c.temGestorFiscalCadastrados === false
}

export type ResultadoJoinN2 = 'aguardar' | 'aprovada' | 'devolvida' | 'recusada'

/**
 * Join P02 — ambos devem finalizar; prevalece a ação mais restritiva
 * (recusar > devolver > aprovar).
 */
export function resolverJoinN2(
  authGestor?: RegistroAuthN2,
  authFiscal?: RegistroAuthN2,
): ResultadoJoinN2 {
  if (!authGestor || !authFiscal) return 'aguardar'
  const decisoes = [authGestor.decisao, authFiscal.decisao]
  if (decisoes.includes('recusar')) return 'recusada'
  if (decisoes.includes('devolver')) return 'devolvida'
  return 'aprovada'
}

/** Exibe alerta de saúde quando ≠ Saudável (Luis 15/09: «vai avisar» — não bloqueia). */
export function saudeExibeAlerta(c: ContratoDemanda | undefined): boolean {
  if (!c) return false
  return avaliarSaudeContrato(c).status !== 'Saudável'
}

/** @deprecated Alias de saudeExibeAlerta — fontes não exigem ACK. */
export function saudeExigeAck(c: ContratoDemanda | undefined): boolean {
  return saudeExibeAlerta(c)
}

export function percentualConsumidoContrato(c: ContratoDemanda): number {
  if (c.saldoTotal <= 0) return 0
  return Math.min(100, Math.round((c.saldoConsumido / c.saldoTotal) * 100))
}

export function roteamentoAutomaticoParceiro(
  numeroContrato: string | undefined,
  produtoSolucao: string,
): { notificarParceiro: boolean; parceiroNome?: string } {
  if (!numeroContrato || produtoSolucao === SOLUCAO_OUTROS) {
    return { notificarParceiro: false }
  }
  const s = solucoesDoContrato(numeroContrato).find((x) => x.nome === produtoSolucao)
  if (!s?.parceria) return { notificarParceiro: false }
  return { notificarParceiro: true, parceiroNome: s.parceiro }
}

export type DemandaFormDraft = {
  origem: OrigemDemanda
  tipo: TipoDemanda | ''
  contatoSecundario: string
  /** Responsável pela abertura (nome). */
  responsavelAbertura: string
  contatoCpf: string
  contatoEmail: string
  contatoNumero: string
  dataEvento: string
  numeroContrato: string
  produtoSolucao: string
  descricao: string
  observacoes: string
  anexos: { nome: string; tamanhoKb: number }[]
  /** Demo: abrir como demandante (nível 2). */
  comoDemandante: boolean
  /** Cargo do ator que abre (Cliente) — pré-aprova o próprio papel no N2 paralelo. */
  openerCargo?: CargoCliente
  /**
   * Campo legado do draft (não bloqueia mais).
   * Fontes: saúde é alerta informativo; não há ACK obrigatório.
   */
  saudeAckCritica: boolean
}

export function emptyDemandaDraft(origem: OrigemDemanda = 'Cliente'): DemandaFormDraft {
  return {
    origem,
    tipo: '',
    contatoSecundario: '',
    responsavelAbertura: '',
    contatoCpf: '',
    contatoEmail: '',
    contatoNumero: '',
    dataEvento: new Date().toISOString().slice(0, 10),
    numeroContrato: '',
    produtoSolucao: '',
    descricao: '',
    observacoes: '',
    anexos: [],
    comoDemandante: false,
    saudeAckCritica: false,
  }
}

export function nextNumeroDemanda(existentes: Demanda[]): string {
  const year = new Date().getFullYear()
  const seq = existentes.length + 1 + Math.floor(Math.random() * 8)
  return `DEM-${year}-${String(seq).padStart(4, '0')}`
}

export function badgeClassStatusDemanda(status: StatusDemanda): string {
  switch (status) {
    case 'Aguardando cadastro gestor/fiscal':
    case 'Aguardando gestor':
    case 'Aguardando pré-análise MTI':
    case 'Aguardando análise':
    case 'Aguardando parceiro':
    case 'Proposta parceiro · aguardando MTI':
    case 'Aguardando autorização':
    case 'Aguardando validação MTI':
    case 'Aguardando assinatura do atendimento':
    case 'Aguardando autorização patrocinador':
    case 'Aguardando assinatura OS (gerente operação)':
    case 'Aguardando assinatura do termo':
    case 'Sem cobertura · definir pagamento':
      return 'pc-badge--pendente'
    case 'Em análise':
    case 'Em orçamento':
    case 'Em atendimento · parceiro':
    case 'Em homologação':
    case 'Dilatação de prazo':
      return 'pc-badge--em-analise'
    case 'Devolvida para correção':
      return 'pc-badge--ajuste'
    case 'Recusada':
    case 'Não autorizada':
      return 'pc-badge--recusado'
    case 'Aprovada · em atendimento':
    case 'Efetivado · entregue':
      return 'pc-badge--aprovado'
    default:
      return 'pc-badge--neutral'
  }
}

export function badgeClassSla(status?: string): string {
  switch (status) {
    case 'No prazo':
      return 'pc-badge--aprovado'
    case 'Em risco':
    case 'Dilatado':
      return 'pc-badge--ajuste'
    case 'Estourado':
      return 'pc-badge--recusado'
    case 'Em execução':
      return 'pc-badge--em-analise'
    case 'Não iniciado':
    default:
      return 'pc-badge--pendente'
  }
}

function parseDataDemanda(iso?: string): Date | null {
  if (!iso?.trim()) return null
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Demanda encerrada para fins de contagem de SLA (RN14). */
export function demandaSlaEncerrada(status: StatusDemanda): boolean {
  return (
    status === 'Recusada' ||
    status === 'Não autorizada' ||
    status === 'Efetivado · entregue'
  )
}

/**
 * RN14 · tempo total apurado desde a recepção (início do SLA)
 * até a finalização ou até o momento.
 */
export function formatTempoTotalSla(demanda: Demanda, agora = new Date()): string {
  const inicio = parseDataDemanda(demanda.slaInicio || demanda.criadoEm)
  if (!inicio) return '—'
  const fim =
    parseDataDemanda(demanda.slaFinalizacao) ||
    (demandaSlaEncerrada(demanda.status)
      ? parseDataDemanda(demanda.atualizadoEm) || agora
      : agora)
  const ms = Math.max(0, fim.getTime() - inicio.getTime())
  const totalHoras = Math.floor(ms / (1000 * 60 * 60))
  if (totalHoras < 1) return 'Menos de 1 h'
  const dias = Math.floor(totalHoras / 24)
  const horas = totalHoras % 24
  if (dias >= 1) {
    return horas > 0
      ? `${dias.toLocaleString('pt-BR')} d ${horas} h`
      : `${dias.toLocaleString('pt-BR')} d`
  }
  return `${totalHoras.toLocaleString('pt-BR')} h`
}

/** Garante data de finalização do SLA ao encerrar a demanda. */
export function aplicarFinalizacaoSla(d: Demanda, quando?: string): Demanda {
  if (!demandaSlaEncerrada(d.status) || d.slaFinalizacao) return d
  return { ...d, slaFinalizacao: quando || d.atualizadoEm || hojeIso() }
}

/** Data ISO → dd/mm/aaaa (exibição portais). */
export function formatDataDemanda(iso?: string): string {
  const d = parseDataDemanda(iso)
  if (!d) return '—'
  return d.toLocaleDateString('pt-BR')
}

export type ProximoPassoCliente = {
  titulo: string
  texto: string
}

/**
 * Orientação ao cliente após registro ou em cada etapa (portais).
 * Fontes: RN-01/N2 (11–15/09) · dois relógios SLA (§7 discovery).
 */
export function proximoPassoCliente(d: Demanda): ProximoPassoCliente {
  switch (d.status) {
    case 'Aguardando gestor': {
      const temG = Boolean(d.authGestor)
      const temF = Boolean(d.authFiscal)
      if (temG && !temF) {
        return {
          titulo: 'Autorização N2 em andamento',
          texto:
            'O gestor já registrou sua decisão. Aguarde o fiscal do cliente (aprovação em paralelo). Depois a MTI inicia a pré-análise.',
        }
      }
      if (!temG && temF) {
        return {
          titulo: 'Autorização N2 em andamento',
          texto:
            'O fiscal já registrou sua decisão. Aguarde o gestor do cliente. Depois a MTI inicia a pré-análise.',
        }
      }
      return {
        titulo: 'Autorização N2 (gestor e fiscal)',
        texto:
          'Gestor e fiscal do cliente devem aprovar em paralelo — ou devolver/recusar. A demanda só segue para a MTI após as duas autorizações.',
      }
    }
    case 'Aguardando cadastro gestor/fiscal':
      return {
        titulo: 'Cadastro no vínculo',
        texto:
          'O administrador do cliente deve cadastrar gestor e fiscal no órgão. Em seguida a demanda retorna à autorização N2.',
      }
    case 'Aguardando pré-análise MTI':
    case 'Aguardando análise':
      return {
        titulo: 'Análise da MTI',
        texto:
          'A MTI vai qualificar contrato/produto e definir o caminho (via contrato, orçamento ou devolução). Você será avisado se precisar ajustar algo.',
      }
    case 'Aguardando parceiro':
    case 'Proposta parceiro · aguardando MTI':
    case 'Em análise':
      return {
        titulo: 'Análise em curso',
        texto:
          'Parceiro e/ou MTI estão analisando a demanda. Aguarde notificação — pode ser solicitado complemento ou assinatura.',
      }
    case 'Devolvida para correção':
      return {
        titulo: 'Ajuste solicitado',
        texto:
          'Corrija descrição, anexos ou dados indicados e reenvie pela aba Ações. O SLA da demanda continua contando (não reinicia).',
      }
    case 'Aguardando assinatura do atendimento':
      return {
        titulo: 'Assinaturas do atendimento',
        texto:
          'Gestor, fiscal e solicitante devem assinar o detalhamento (via contrato). O SLA de execução só inicia após a autorização da execução.',
      }
    case 'Em orçamento':
      return {
        titulo: 'Orçamento em elaboração',
        texto:
          'Aguarde a proposta de orçamento. Você poderá aceitar ou recusar; há SLA de assinatura conforme validade do orçamento.',
      }
    case 'Aguardando assinatura OS (gerente operação)':
      return {
        titulo: 'Assinatura da OS',
        texto: 'Aguarde a assinatura do gerente de operação na ordem de serviço antes da execução formal.',
      }
    case 'Aprovada · em atendimento':
    case 'Em atendimento · parceiro':
      return {
        titulo: 'Execução em andamento',
        texto:
          'A execução está autorizada — o SLA de execução está ativo. Acompanhe entregas, dilações e homologação.',
      }
    case 'Em homologação':
    case 'Aguardando assinatura do termo':
      return {
        titulo: 'Homologação e termo',
        texto:
          'Assinem gestor, fiscal e solicitante o termo de homologação. Recusa do termo não reabre a demanda — a MTI regenera o documento.',
      }
    case 'Efetivado · entregue':
      return {
        titulo: 'Demanda concluída',
        texto:
          'Entrega efetivada. Novo escopo exige nova demanda. Se o termo foi recusado, a MTI pode regenerá-lo para reassinatura.',
      }
    case 'Recusada':
    case 'Não autorizada':
      return {
        titulo: 'Demanda encerrada',
        texto:
          'Você pode restituir (se foi quem recusou) ou abrir nova demanda reaproveitando estes dados (novo número e SLA).',
      }
    case 'Sem cobertura · definir pagamento':
      return {
        titulo: 'Sem cobertura contratual',
        texto: 'Defina com a MTI indenização, nova contratação ou desistência — não há execução automática.',
      }
    case 'Dilatação de prazo':
      return {
        titulo: 'Dilação de prazo',
        texto: 'Aguarde autorização das partes (cliente, parceiro, MTI) para o novo prazo de execução.',
      }
    case 'Aguardando autorização patrocinador':
      return {
        titulo: 'Patrocínio',
        texto: 'Aguarde registro da autorização do contrato de gestão/patrocinador antes das assinaturas.',
      }
    case 'Aguardando autorização':
      return {
        titulo: 'Autorização MTI',
        texto: 'A MTI confere quantitativos e autoriza envio ao ServiceNow / execução.',
      }
    case 'Aguardando validação MTI':
      return {
        titulo: 'Validação MTI',
        texto: 'Parceiro declarou conclusão — aguarde validação da MTI.',
      }
    default:
      return {
        titulo: 'Acompanhe a demanda',
        texto: 'Consulte status, SLA e ações disponíveis nas abas abaixo.',
      }
  }
}

export type ResumoRelogioSla = {
  id: 'demanda' | 'execucao'
  rotulo: string
  situacao: string
  inicioExibicao: string
  tempoDecorrido?: string
  prazoDeclarado?: string
  hint: string
  ativo: boolean
  encerrado: boolean
}

/** Dois relógios SLA (RN-01 + §7 discovery F3). */
export function resumoRelogiosSla(d: Demanda, agora = new Date()): ResumoRelogioSla[] {
  const encerrada = demandaSlaEncerrada(d.status)
  const execIniciado =
    Boolean(d.slaExecucaoInicio) ||
    (d.slaExecucaoStatus != null && d.slaExecucaoStatus !== 'Não iniciado')

  let tempoExec: string | undefined
  if (execIniciado && d.slaExecucaoInicio) {
    const inicio = parseDataDemanda(d.slaExecucaoInicio)
    if (inicio) {
      const fim =
        parseDataDemanda(d.slaFinalizacao) ||
        (encerrada ? parseDataDemanda(d.atualizadoEm) || agora : agora)
      const ms = Math.max(0, fim.getTime() - inicio.getTime())
      const h = Math.floor(ms / (1000 * 60 * 60))
      tempoExec = h < 1 ? 'Menos de 1 h' : h >= 24 ? `${Math.floor(h / 24)} d` : `${h} h`
    }
  }

  return [
    {
      id: 'demanda',
      rotulo: 'SLA da demanda',
      situacao: encerrada && d.slaFinalizacao ? 'Encerrado' : d.slaStatus || 'No prazo',
      inicioExibicao: formatDataDemanda(d.slaInicio || d.criadoEm),
      tempoDecorrido: formatTempoTotalSla(d, agora),
      prazoDeclarado: d.slaPrazoDeclarado,
      hint: 'RN-01 · inicia no registro. Mede o atendimento até autorização pela hierarquia e MTI.',
      ativo: !encerrada,
      encerrado: encerrada,
    },
    {
      id: 'execucao',
      rotulo: 'SLA de execução',
      situacao: d.slaExecucaoStatus || 'Não iniciado',
      inicioExibicao: execIniciado
        ? formatDataDemanda(d.slaExecucaoInicio)
        : 'Aguardando autorização',
      tempoDecorrido: tempoExec,
      prazoDeclarado: execIniciado ? d.slaPrazoDeclarado : undefined,
      hint: 'Inicia na autorização da execução no Atlas (após assinaturas). Prazo conforme contrato, catálogo ou OS.',
      ativo: execIniciado && !encerrada,
      encerrado: encerrada,
    },
  ]
}

export type AcaoPayload = {
  motivo?: string
  catalogos?: string
  itensCatalogo?: string
  descricaoAtendimento?: string
  osVinculada?: string
  parceiroNome?: string
  descricao?: string
  produtoSolucao?: string
  numeroContrato?: string
  orcamentoItens?: OrcamentoItem[]
  orcamentoValidade?: string
  orcamentoObs?: string
  tipoAnalise?: TipoAnaliseDemanda
  entregavel?: string
  /** Comprovações do parceiro (declarar atendida). */
  anexosComprovacao?: DemandaAnexo[]
  necAtendimento?: string
  valoresContrato?: string
  prazoExecucao?: string
  assinarPapel?: 'Gestor' | 'Fiscal' | 'Solicitante'
  decisaoAssinatura?: 'Assinar' | 'Devolver para correção'
  osAcao?: 'Vincular OS existente' | 'Criar nova OS' | 'Autorizar consumo em OS existente'
  /** Tipo de OS Global × Dedicada (Luis 17/09). OS NÃO é pré-condição de faturamento (#03: contrato+saldo). */
  tipoOs?: TipoOs
  /** Natureza da cobertura definida na qualificação MTI. */
  contratoNatureza?: 'Próprio do cliente' | 'Patrocinado (gestão)' | 'Sem contrato'
  /** Métrica do contrato (imutável) — filtro de itens na composição. */
  metricaContrato?: MetricaContrato
  catalogoVersaoVigente?: string
  definirPagamento?: 'Indenização' | 'Nova contratação' | 'Desistiu' | 'Ainda não definido'
  temContrato?: boolean
  /** Dilação — justificativa e novo prazo. */
  dilacaoPrazo?: string
  /** Papel ao assinar o termo (L3). */
  assinarTermoPapel?: 'Gestor' | 'Fiscal' | 'Solicitante'
  /** Decisão no termo: assinar | recusar (L02 — demanda concluída; termo recusado). */
  decisaoTermo?: 'Assinar' | 'Recusar'
  /** Ciência do alerta de saúde (autorização OS / SN). */
  saudeAckOs?: boolean
  /** Restituir pós-recusa N2: aceitar ou pedir ajuste. */
  decisaoRestituir?: 'aceitar' | 'ajustar'
  /** Execução licença — call 17/09. */
  credenciaisLicenca?: string
  applianceLicenca?: string
  comprovacaoFabricanteAnexos?: DemandaAnexo[]
  quantidadeExecutada?: number
}

export type AcaoDef = {
  id: AcaoDemanda
  label: string
  kind: 'primary' | 'secondary' | 'danger'
  precisaMotivo?: boolean
  precisaAtendimento?: boolean
  precisaOrcamento?: boolean
  precisaEntregavel?: boolean
  precisaTipoAnalise?: boolean
  precisaAssinaturaAtendimento?: boolean
  precisaEncerrarTermo?: boolean
  precisaDilacao?: boolean
  precisaAssinaturaTermo?: boolean
  precisaSaudeAck?: boolean
  /** Campos de licença (credenciais / appliance / comprovação / qtd). */
  precisaLicencaExecucao?: boolean
  /** Formulário completo de qualificação/requalificação MTI. */
  precisaQualificacao?: boolean
}

/** Orçamento pronto para o cliente quando Vendas (+ Parceiro, se houver) assinaram. */
export function orcamentoAssinaturasInternasOk(d: Demanda): boolean {
  if (!d.orcamentoAssinadoVendas) return false
  if (d.parceiroNotificado && !d.orcamentoAssinadoParceiro) return false
  return true
}

/** Dilatação liberada quando Cliente + MTI (+ Parceiro, se notificado) aceitam. */
export function dilacaoAcksCompletos(d: Demanda): boolean {
  if (!d.dilacaoAckCliente || !d.dilacaoAckMti) return false
  if (d.parceiroNotificado && !d.dilacaoAckParceiro) return false
  return true
}

export function acoesDisponiveis(
  demanda: Demanda,
  perfil: PerfilDemo,
  cargo: CargoCliente = 'Gestor',
): AcaoDef[] {
  const s = demanda.status
  const out: AcaoDef[] = []
  const cargoN2 = cargo === 'Gestor' || cargo === 'Fiscal'

  if (perfil === 'Parceiro' && !demanda.parceiroNotificado) {
    return []
  }

  // EXC-CARG — vínculo sem gestor/fiscal: N2 nunca é pulado.
  // Admin do cliente (Gestor/Fiscal) ou MTI registra o cadastro → segue ao N2.
  if (s === 'Aguardando cadastro gestor/fiscal') {
    if (perfil === 'MTI' || (perfil === 'Cliente' && cargoN2)) {
      out.push({
        id: 'cadastrar_cargos',
        label: 'Registrar cadastro de gestor/fiscal e enviar',
        kind: 'primary',
      })
    }
    return out
  }

  // REAP + restituir (call Luis 17/09) — recusa N2 não “morre”.
  if (s === 'Recusada' || s === 'Não autorizada') {
    if (perfil === 'Cliente' && cargoN2 && s === 'Recusada') {
      const meuReg =
        cargo === 'Fiscal' ? demanda.authFiscal : cargo === 'Gestor' ? demanda.authGestor : undefined
      if (meuReg?.decisao === 'recusar') {
        out.push({
          id: 'restituir_n2',
          label: 'Restituir processo (aceitar ou solicitar ajuste)',
          kind: 'primary',
          precisaMotivo: true,
        })
      }
    }
    if (perfil === 'Cliente' || perfil === 'MTI') {
      out.push({
        id: 'reaproveitar_como_nova',
        label: 'Abrir nova demanda com estes dados',
        kind: 'secondary',
      })
    }
    return out
  }

  // Termo recusado · demanda concluída (L02 Luis) — regenerar termo, não nova demanda.
  if (s === 'Efetivado · entregue' && demanda.termoRecusado) {
    if (perfil === 'MTI') {
      out.push({
        id: 'regenerar_termo',
        label: 'Regenerar termo · todos reassinar',
        kind: 'primary',
        precisaMotivo: true,
      })
    }
    if (perfil === 'Cliente' || perfil === 'MTI') {
      out.push({
        id: 'reaproveitar_como_nova',
        label: 'Abrir nova demanda (opcional)',
        kind: 'secondary',
      })
    }
    return out
  }

  // Pós-efetivado sem termo recusado — ajuste de escopo = nova demanda (fora F3 fino).
  if ((perfil === 'Cliente' || perfil === 'MTI') && s === 'Efetivado · entregue') {
    out.push({
      id: 'reaproveitar_como_nova',
      label: 'Abrir nova demanda de escopo adicional (mesmo projeto)',
      kind: 'secondary',
    })
    return out
  }

  // CLIENTE — N2 paralelo (gestor E fiscal); só quem ainda não registrou
  if (perfil === 'Cliente' && cargoN2 && s === 'Aguardando gestor') {
    const jaRegistrou = cargo === 'Fiscal' ? Boolean(demanda.authFiscal) : Boolean(demanda.authGestor)
    if (!jaRegistrou) {
      out.push(
        { id: 'aprovar_gestor', label: 'Aprovar', kind: 'primary' },
        { id: 'devolver_gestor', label: 'Devolver para correção', kind: 'secondary', precisaMotivo: true },
        { id: 'recusar_gestor', label: 'Recusar', kind: 'danger', precisaMotivo: true },
      )
    }
  }

  // MTI — Projeto Atlas (BO); nunca portal
  if (perfil === 'MTI') {
    const precisaQualif =
      !demanda.qualificado ||
      demanda.produtoSolucao === SOLUCAO_A_QUALIFICAR ||
      demanda.produtoSolucao === SOLUCAO_OUTROS

    // Pré-análise / fila de análise: iniciar + qualificar
    if (s === 'Aguardando pré-análise MTI' || s === 'Aguardando análise') {
      out.push({
        id: 'iniciar_analise',
        label: 'Iniciar análise',
        kind: 'primary',
        precisaTipoAnalise: true,
      })
      out.push({
        id: 'qualificar',
        label: precisaQualif ? 'Qualificar demanda' : 'Requalificar (mesma demanda)',
        kind: precisaQualif ? 'primary' : 'secondary',
        precisaQualificacao: true,
      })
      out.push(
        { id: 'devolver_correcao', label: 'Devolver para correção', kind: 'secondary', precisaMotivo: true },
        { id: 'recusar', label: 'Recusar', kind: 'danger', precisaMotivo: true },
      )
    }

    // Em análise: qualificar/requalificar; deliberar só após qualificado e sem pendência de parecer
    if (s === 'Em análise') {
      out.push({
        id: 'qualificar',
        label: precisaQualif ? 'Qualificar demanda' : 'Requalificar (mesma demanda)',
        kind: precisaQualif ? 'primary' : 'secondary',
        precisaQualificacao: true,
      })
      if (demanda.qualificado && !precisaQualif) {
        if (!demanda.parceiroNotificado) {
          out.push(
            {
              id: 'via_contrato',
              label: 'Atendimento via contrato (definitivo)',
              kind: 'primary',
              precisaAtendimento: true,
              precisaTipoAnalise: true,
            },
            { id: 'enviar_orcamento', label: 'Enviar para orçamento (definitivo)', kind: 'secondary' },
            { id: 'sem_cobertura', label: 'Sem cobertura (trilha própria)', kind: 'secondary' },
          )
        }
        // Com parceiro notificado: aguarda parecer (status tende a Aguardando parceiro)
      }
      out.push(
        { id: 'devolver_correcao', label: 'Devolver para correção', kind: 'secondary', precisaMotivo: true },
        { id: 'recusar', label: 'Recusar', kind: 'danger', precisaMotivo: true },
      )
    }

    // Parecer do parceiro já na MTI → deliberação definitiva (+ requalificar se preciso)
    if (s === 'Proposta parceiro · aguardando MTI') {
      out.push(
        {
          id: 'via_contrato',
          label: 'Atendimento via contrato (definitivo)',
          kind: 'primary',
          precisaAtendimento: true,
          precisaTipoAnalise: true,
        },
        { id: 'enviar_orcamento', label: 'Enviar para orçamento (definitivo)', kind: 'secondary' },
        { id: 'sem_cobertura', label: 'Sem cobertura (trilha própria)', kind: 'secondary' },
        {
          id: 'qualificar',
          label: 'Requalificar (mesma demanda)',
          kind: 'secondary',
          precisaQualificacao: true,
        },
        { id: 'devolver_correcao', label: 'Devolver para correção', kind: 'secondary', precisaMotivo: true },
        { id: 'recusar', label: 'Recusar', kind: 'danger', precisaMotivo: true },
      )
    }

    // Aguardando parceiro: MTI só acompanha / pode requalificar se errou o vínculo
    if (s === 'Aguardando parceiro') {
      out.push({
        id: 'qualificar',
        label: 'Requalificar (mesma demanda)',
        kind: 'secondary',
        precisaQualificacao: true,
      })
    }

    if (s === 'Aguardando autorização patrocinador') {
      out.push({
        id: 'registrar_autorizacao_patrocinio',
        label: 'Registrar autorização do patrocinador (pós-qualificação)',
        kind: 'primary',
      })
    }
    if (s === 'Aguardando validação MTI') {
      out.push(
        { id: 'validar_parceiro', label: 'Validar atendimento do parceiro (OK)', kind: 'primary' },
        {
          id: 'devolver_correcao',
          label: 'Devolver ao parceiro (corrige execução)',
          kind: 'secondary',
          precisaMotivo: true,
        },
        { id: 'recusar', label: 'Recusar atendimento do parceiro', kind: 'danger', precisaMotivo: true },
      )
    }
    if (s === 'Em homologação' || s === 'Aguardando assinatura do termo') {
      out.push({
        id: 'solicitar_ajuste_termo',
        label: 'Solicitar ajuste no termo (regerar + reassinar)',
        kind: 'secondary',
        precisaMotivo: true,
      })
      out.push({
        id: 'recusar_termo',
        label: 'Recusar termo → demanda concluída · termo recusado',
        kind: 'danger',
        precisaMotivo: true,
      })
    }
    // Caminho orçamento: gerente de operação assina OS (9/11 · T2)
    if (s === 'Aguardando assinatura OS (gerente operação)') {
      out.push({
        id: 'assinar_os_orcamento',
        label: 'Assinar OS (gerente de operação)',
        kind: 'primary',
      })
    }
    // Conferência quantitativos (L7) antes de autorizar
    if (s === 'Aguardando autorização' && !demanda.quantitativosConferidos) {
      out.push(
        { id: 'conferir_quantitativos', label: 'Quantitativos conferem (OK)', kind: 'primary' },
        {
          id: 'devolver_quantitativos',
          label: 'Quantitativos NÃO conferem → devolve DEMANDA',
          kind: 'danger',
          precisaMotivo: true,
        },
      )
    }
    // Autorização de execução = MTI (comum) → SN — só após quantitativos OK
    if (
      (s === 'Aguardando autorização' && demanda.quantitativosConferidos) ||
      s === 'Aprovada · em atendimento'
    ) {
      const ctAuth = contratoPorNumero(demanda.numeroContrato)
      out.push({
        id: 'autorizar_servicenow',
        label: 'Autorizar execução → ServiceNow',
        kind: 'primary',
        precisaSaudeAck: saudeExibeAlerta(ctAuth),
      })
    }
    if (
      (s === 'Aprovada · em atendimento' || s === 'Em atendimento · parceiro') &&
      demanda.serviceNowStatus === 'Enviado · aprovada e em atendimento'
    ) {
      if (!demanda.parceiroNotificado || demanda.executorTipo === 'MTI') {
        out.push({
          id: 'mti_executar_declarar',
          label: 'MTI executar / declarar conclusão técnica',
          kind: 'primary',
          precisaEntregavel: true,
        })
      }
      out.push({
        id: 'solicitar_dilacao',
        label: 'Solicitar dilação / alteração de estimativa',
        kind: 'secondary',
        precisaDilacao: true,
        precisaMotivo: true,
      })
      out.push({
        id: 'encerrar_termo_raer',
        label: 'Encerrar · gerar termo (+ vínculo RAER stub)',
        kind: 'secondary',
        precisaEncerrarTermo: true,
      })
    }
    if (s === 'Em orçamento') {
      const st = demanda.orcamento?.status
      if (!st || st === 'Em elaboração' || st === 'Recusado' || st === 'Devolvido') {
        out.push({
          id: 'enviar_proposta_orcamento',
          label: 'Enviar composição para assinaturas (Vendas/Parceiro)',
          kind: 'primary',
          precisaOrcamento: true,
        })
      }
      if (st === 'Aguardando assinaturas' && !demanda.orcamentoAssinadoVendas) {
        out.push({
          id: 'assinar_orcamento',
          label: 'Assinar orçamento (Vendas)',
          kind: 'primary',
        })
      }
    }
    if (s === 'Dilatação de prazo' && !demanda.dilacaoAckMti) {
      out.push(
        { id: 'aceitar_dilacao', label: 'Aceitar dilação', kind: 'primary' },
        { id: 'recusar_dilacao', label: 'Recusar dilação', kind: 'danger', precisaMotivo: true },
      )
    }
  }

  // PARCEIRO — menu propositivo (Luis 11/09) + execução pós-autorização (17/09)
  // Sem "sem cobertura" (deliberação MTI) · bater ponto só após SN.
  if (perfil === 'Parceiro' && demanda.parceiroNotificado) {
    // Só age após qualificação MTI (notificação). Parecer / proposta antes da deliberação.
    if (
      (s === 'Aguardando parceiro' ||
        s === 'Aguardando análise' ||
        s === 'Em análise' ||
        s === 'Proposta parceiro · aguardando MTI') &&
      demanda.qualificado
    ) {
      out.push(
        {
          id: 'via_contrato',
          label: 'Propor: atendimento via contrato',
          kind: 'secondary',
          precisaAtendimento: true,
          precisaTipoAnalise: true,
        },
        { id: 'enviar_orcamento', label: 'Propor: enviar para orçamento', kind: 'secondary' },
        { id: 'devolver_correcao', label: 'Propor: devolver para correção', kind: 'secondary', precisaMotivo: true },
        { id: 'recusar', label: 'Propor: recusar', kind: 'danger', precisaMotivo: true },
      )
    }
    // Orçamento — composição e assinatura do parceiro (cadeia Vendas → Parceiro → Cliente)
    if (s === 'Em orçamento') {
      const st = demanda.orcamento?.status
      if (!st || st === 'Em elaboração' || st === 'Recusado' || st === 'Devolvido') {
        out.push({
          id: 'enviar_proposta_orcamento',
          label: 'Enviar composição para assinaturas',
          kind: 'primary',
          precisaOrcamento: true,
        })
      }
      if (st === 'Aguardando assinaturas') {
        if (!demanda.orcamentoAssinadoParceiro) {
          out.push({
            id: 'assinar_orcamento',
            label: 'Assinar orçamento (Parceiro)',
            kind: 'primary',
          })
        }
        out.push({
          id: 'devolver_orcamento_ajuste',
          label: 'Solicitar ajuste na composição',
          kind: 'secondary',
          precisaMotivo: true,
        })
      }
    }
    // Execução — após autorização SN (não na análise)
    if (
      demanda.tipo === 'Consumo' &&
      (s === 'Em atendimento · parceiro' || s === 'Aprovada · em atendimento') &&
      demanda.serviceNowStatus === 'Enviado · aprovada e em atendimento'
    ) {
      if (!demanda.parceiroIniciouAtendimento) {
        out.push({
          id: 'parceiro_iniciar',
          label: 'Efetivar / iniciar atendimento',
          kind: 'primary',
          precisaTipoAnalise: true,
          precisaLicencaExecucao: true,
        })
      }
      out.push({
        id: 'parceiro_declarar',
        label: 'Declarar atendida',
        kind: 'primary',
        precisaEntregavel: true,
        precisaLicencaExecucao: true,
      })
      out.push({
        id: 'solicitar_dilacao',
        label: 'Solicitar dilação / alteração de estimativa',
        kind: 'secondary',
        precisaDilacao: true,
        precisaMotivo: true,
      })
    }
    if (s === 'Dilatação de prazo' && !demanda.dilacaoAckParceiro) {
      out.push(
        { id: 'aceitar_dilacao', label: 'Aceitar dilação', kind: 'primary' },
        { id: 'recusar_dilacao', label: 'Recusar dilação', kind: 'danger', precisaMotivo: true },
      )
    }
  }

  // CLIENTE — assinaturas e orçamento
  if (perfil === 'Cliente' && (cargoN2 || cargo === 'Demandante') && s === 'Aguardando assinatura do atendimento') {
    out.push({
      id: 'assinar_atendimento',
      label: 'Assinar / devolver atendimento',
      kind: 'primary',
      precisaAssinaturaAtendimento: true,
    })
  }

  if (perfil === 'Cliente' && (s === 'Em homologação' || s === 'Aguardando assinatura do termo')) {
    out.push({
      id: 'assinar_homologacao',
      label: 'Assinar termo de homologação',
      kind: 'primary',
      precisaAssinaturaTermo: true,
    })
    out.push({
      id: 'solicitar_ajuste_termo',
      label: 'Solicitar ajuste no termo (regerar + reassinar)',
      kind: 'secondary',
      precisaMotivo: true,
    })
    out.push({
      id: 'recusar_termo',
      label: 'Recusar termo → demanda concluída · termo recusado',
      kind: 'danger',
      precisaMotivo: true,
    })
  }

  // Solicitante / gestor / fiscal avaliam orçamento (call 17/09: aceitar · devolver · recusar)
  if (
    perfil === 'Cliente' &&
    (cargoN2 || cargo === 'Demandante') &&
    s === 'Em orçamento' &&
    demanda.orcamento?.status === 'Proposta enviada'
  ) {
    out.push(
      { id: 'aceitar_orcamento', label: 'Aceitar orçamento', kind: 'primary' },
      {
        id: 'devolver_orcamento_ajuste',
        label: 'Devolver orçamento para correção',
        kind: 'secondary',
        precisaMotivo: true,
      },
      { id: 'recusar_orcamento', label: 'Recusar orçamento', kind: 'danger', precisaMotivo: true },
    )
  }

  // Dilatação — Cliente recebe/aceita
  if (
    perfil === 'Cliente' &&
    (s === 'Aprovada · em atendimento' || s === 'Em atendimento · parceiro') &&
    demanda.serviceNowStatus === 'Enviado · aprovada e em atendimento'
  ) {
    out.push({
      id: 'solicitar_dilacao',
      label: 'Solicitar dilação / alteração de estimativa',
      kind: 'secondary',
      precisaDilacao: true,
      precisaMotivo: true,
    })
  }
  if (perfil === 'Cliente' && s === 'Dilatação de prazo' && !demanda.dilacaoAckCliente) {
    out.push(
      { id: 'aceitar_dilacao', label: 'Aceitar dilação', kind: 'primary' },
      { id: 'recusar_dilacao', label: 'Recusar dilação', kind: 'danger', precisaMotivo: true },
    )
  }

  if (perfil === 'Cliente' && s === 'Devolvida para correção') {
    out.push({ id: 'ajustar_enviar', label: 'Ajustar e enviar', kind: 'primary' })
  }

  // Sem cobertura — definir pagamento (11/09: indenização|contratar|desistir).
  // Pedido automático de proposta no portal = fora do momento (11/09).
  if (perfil === 'Cliente' && s === 'Sem cobertura · definir pagamento') {
    out.push({ id: 'definir_pagamento', label: 'Definir pagamento', kind: 'primary' })
  }

  return out
}

function hojeIso() {
  return new Date().toISOString().slice(0, 10)
}

function pushHist(
  d: Demanda,
  perfil: PerfilDemo,
  acao: string,
  detalhe?: string,
  cargo?: CargoCliente,
): DemandaHistorico[] {
  return [
    {
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      em: new Date().toISOString(),
      por: USUARIO_LOGADO,
      perfil,
      cargo: perfil === 'Cliente' ? cargo : undefined,
      acao,
      detalhe,
    },
    ...d.historico,
  ]
}

export function aplicarAcao(
  demanda: Demanda,
  perfil: PerfilDemo,
  acao: AcaoDemanda,
  payload: AcaoPayload = {},
  cargo: CargoCliente = 'Gestor',
  existentes: Demanda[] = [],
):
  | { ok: true; demanda: Demanda; toast: string; novaDemanda?: Demanda }
  | { ok: false; erro: string } {
  const permitidas = acoesDisponiveis(demanda, perfil, cargo).map((a) => a.id)
  if (!permitidas.includes(acao)) {
    return { ok: false, erro: 'Ação não disponível neste status/perfil.' }
  }

  const precisaMotivo = [
    'recusar_gestor',
    'devolver_gestor',
    'devolver_correcao',
    'recusar',
    'recusar_orcamento',
    'solicitar_ajuste_termo',
    'devolver_quantitativos',
    'solicitar_dilacao',
    'recusar_dilacao',
    'devolver_orcamento_ajuste',
    'recusar_termo',
    'regenerar_termo',
    'restituir_n2',
  ].includes(acao)
  if (precisaMotivo && !payload.motivo?.trim()) {
    return { ok: false, erro: 'Informe o motivo.' }
  }

  let next: Demanda = { ...demanda, atualizadoEm: hojeIso() }

  switch (acao) {
    case 'aprovar_gestor':
    case 'devolver_gestor':
    case 'recusar_gestor': {
      const papel: 'gestor' | 'fiscal' = cargo === 'Fiscal' ? 'fiscal' : 'gestor'
      const ja = papel === 'fiscal' ? next.authFiscal : next.authGestor
      if (ja) {
        return {
          ok: false,
          erro: `${papel === 'fiscal' ? 'Fiscal' : 'Gestor'} já registrou decisão nesta autorização.`,
        }
      }
      const decisao: DecisaoN2 =
        acao === 'aprovar_gestor' ? 'aprovar' : acao === 'devolver_gestor' ? 'devolver' : 'recusar'
      const registro: RegistroAuthN2 = {
        decisao,
        motivo: payload.motivo?.trim() || undefined,
        em: hojeIso(),
        quem: USUARIO_LOGADO,
      }
      next = {
        ...next,
        authGestor: papel === 'gestor' ? registro : next.authGestor,
        authFiscal: papel === 'fiscal' ? registro : next.authFiscal,
        exigeAuthContratante: true,
      }
      const join = resolverJoinN2(next.authGestor, next.authFiscal)
      const papelLabel = papel === 'fiscal' ? 'Fiscal' : 'Gestor'
      if (join === 'aguardar') {
        const falta = next.authGestor ? 'fiscal' : 'gestor'
        next = {
          ...next,
          status: 'Aguardando gestor',
          historico: pushHist(
            next,
            perfil,
            `${papelLabel} registrou «${decisao}» — aguarda ${falta}`,
            payload.motivo,
            cargo,
          ),
        }
        return {
          ok: true,
          demanda: next,
          toast: `${papelLabel}: ${decisao} registrado — aguardando o ${falta} concluir a autorização`,
        }
      }
      if (join === 'recusada') {
        next = {
          ...next,
          status: 'Recusada',
          slaFinalizacao: next.slaFinalizacao || hojeIso(),
          motivoUltimaAcao: payload.motivo || next.authGestor?.motivo || next.authFiscal?.motivo,
          historico: pushHist(
            next,
            perfil,
            `Recusa registrada — demanda Recusada (${papelLabel} registrou por último); solicitante pode abrir nova com estes dados`,
            payload.motivo,
            cargo,
          ),
        }
        return {
          ok: true,
          demanda: next,
          toast: 'Demanda Recusada — use «Abrir nova demanda com estes dados» se quiser reaproveitar',
        }
      }
      if (join === 'devolvida') {
        next = {
          ...next,
          status: 'Devolvida para correção',
          motivoUltimaAcao: payload.motivo || next.authGestor?.motivo || next.authFiscal?.motivo,
          historico: pushHist(
            next,
            perfil,
            `Devolução registrada — volta ao solicitante`,
            payload.motivo,
            cargo,
          ),
        }
        return { ok: true, demanda: next, toast: 'Devolvida ao solicitante' }
      }
      next = {
        ...next,
        status: 'Aguardando pré-análise MTI',
        historico: pushHist(
          next,
          perfil,
          'Gestor e fiscal aprovaram → pré-análise MTI',
          undefined,
          cargo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Autorização concluída (gestor + fiscal) — aguardando pré-análise MTI',
      }
    }

    case 'iniciar_analise':
      next = {
        ...next,
        status: 'Em análise',
        tipoAnalise: payload.tipoAnalise || next.tipoAnalise,
        historico: pushHist(
          next,
          perfil,
          'Iniciou análise',
          payload.tipoAnalise ? `Tipo: ${payload.tipoAnalise}` : undefined,
        ),
      }
      return { ok: true, demanda: next, toast: 'Análise iniciada' }

    case 'qualificar': {
      const nome = payload.parceiroNome?.trim()
      const produto = payload.produtoSolucao?.trim()
      const natureza = payload.contratoNatureza || next.contratoNatureza
      const contratoNro = payload.numeroContrato?.trim()
      const catalogosQ = payload.catalogos?.trim()
      const itensQ = payload.itensCatalogo?.trim()
      const metricaQ = payload.metricaContrato || next.metricaContrato
      const versaoCat = payload.catalogoVersaoVigente?.trim()

      if (!produto) {
        return { ok: false, erro: 'Informe o produto / solução / item qualificado.' }
      }
      if (!natureza) {
        return { ok: false, erro: 'Informe a natureza da cobertura (próprio, patrocinado ou sem contrato).' }
      }
      if (natureza !== 'Sem contrato' && !contratoNro) {
        return { ok: false, erro: 'Informe o contrato que cobre esta demanda.' }
      }
      if (!catalogosQ) {
        return { ok: false, erro: 'Informe o catálogo vinculado.' }
      }
      if (!itensQ) {
        return { ok: false, erro: 'Informe o(s) item(ns) de catálogo que serão consumidos.' }
      }
      if (natureza !== 'Sem contrato' && !metricaQ) {
        return {
          ok: false,
          erro: 'Informe a métrica do contrato (Serviço ou Licenciamento) — imutável na demanda.',
        }
      }

      const eraQualificado = next.qualificado
      let statusApos: StatusDemanda = next.status
      if (nome) {
        statusApos = 'Aguardando parceiro'
      } else if (
        next.status === 'Aguardando pré-análise MTI' ||
        next.status === 'Aguardando análise' ||
        next.status === 'Aguardando parceiro'
      ) {
        statusApos = 'Em análise'
      }

      const tipoAnaliseDerivado: TipoAnaliseDemanda | undefined =
        metricaQ === 'Licenciamento'
          ? 'Licenciamento'
          : metricaQ === 'Serviço'
            ? 'Serviço'
            : next.tipoAnalise

      next = {
        ...next,
        produtoSolucao: produto,
        numeroContrato: natureza === 'Sem contrato' ? undefined : contratoNro || next.numeroContrato,
        contratoNatureza: natureza,
        metricaContrato: metricaQ || next.metricaContrato,
        catalogoVersaoVigente: versaoCat || next.catalogoVersaoVigente,
        catalogos: catalogosQ,
        itensCatalogo: itensQ,
        tipoAnalise: tipoAnaliseDerivado || next.tipoAnalise,
        qualificado: true,
        qualificadoEm: new Date().toISOString(),
        parceiroNotificado: Boolean(nome),
        parceiroNotificadoEm: nome ? new Date().toISOString() : undefined,
        parceiroNome: nome || undefined,
        status: statusApos,
        historico: pushHist(
          next,
          perfil,
          eraQualificado ? 'Requalificou produto/contrato/itens/parceiro' : 'Qualificou produto/contrato/itens/parceiro',
          [
            `Produto: ${produto}`,
            natureza ? `Cobertura: ${natureza}` : null,
            contratoNro && natureza !== 'Sem contrato' ? `Contrato: ${contratoNro}` : null,
            catalogosQ ? `Catálogo: ${catalogosQ}` : null,
            itensQ ? `Itens: ${itensQ}` : null,
            metricaQ ? `Métrica: ${metricaQ}` : null,
            versaoCat ? `Versão catálogo: ${versaoCat}` : null,
            nome ? `Parceiro: ${nome}` : 'Sem parceria — segue MTI',
          ]
            .filter(Boolean)
            .join(' · '),
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: nome
          ? `${eraQualificado ? 'Requalificado' : 'Qualificado'} — parceiro ${nome} notificado (aguarda parecer)`
          : natureza === 'Patrocinado (gestão)'
            ? `${eraQualificado ? 'Requalificado' : 'Qualificado'} — cobertura patrocinada (autorização do patrocinador após deliberação)`
            : natureza === 'Sem contrato'
              ? `${eraQualificado ? 'Requalificado' : 'Qualificado'} — sem contrato (trilha indenização / nova contratação)`
              : `${eraQualificado ? 'Requalificado' : 'Qualificado'} — segue só MTI`,
      }
    }

    case 'parceiro_iniciar': {
      if (next.tipo === 'Suporte') {
        return { ok: false, erro: 'Suporte não usa efetivação de atendimento pelo parceiro — cai no grupo.' }
      }
      if (next.serviceNowStatus !== 'Enviado · aprovada e em atendimento') {
        return {
          ok: false,
          erro: 'Efetivar atendimento só após autorização da execução (ServiceNow).',
        }
      }
      const tipo = payload.tipoAnalise || next.tipoAnalise
      if (tipo === 'Licenciamento') {
        if (!payload.credenciaisLicenca?.trim()) {
          return { ok: false, erro: 'Informe as credenciais da licença.' }
        }
        if (!payload.applianceLicenca?.trim()) {
          return { ok: false, erro: 'Informe appliance / ambiente da licença.' }
        }
      }
      next = {
        ...next,
        status: next.parceiroNotificado ? 'Em atendimento · parceiro' : next.status,
        tipoAnalise: tipo || next.tipoAnalise,
        parceiroIniciouAtendimento: true,
        credenciaisLicenca: payload.credenciaisLicenca?.trim() || next.credenciaisLicenca,
        applianceLicenca: payload.applianceLicenca?.trim() || next.applianceLicenca,
        comprovacaoFabricanteAnexos:
          payload.comprovacaoFabricanteAnexos ?? next.comprovacaoFabricanteAnexos,
        quantidadeExecutada:
          payload.quantidadeExecutada != null ? payload.quantidadeExecutada : next.quantidadeExecutada,
        slaExecucaoStatus: next.slaExecucaoStatus === 'Não iniciado' ? 'Em execução' : next.slaExecucaoStatus,
        slaExecucaoInicio: next.slaExecucaoInicio || hojeIso(),
        historico: pushHist(
          next,
          perfil,
          'Parceiro efetivou / iniciou atendimento',
          tipo === 'Licenciamento'
            ? `Licenciamento · credenciais/appliance registrados`
            : payload.tipoAnalise
              ? `Tipo: ${payload.tipoAnalise}`
              : 'Start do atendimento (consumo)',
        ),
      }
      return { ok: true, demanda: next, toast: 'Atendimento iniciado pelo parceiro' }
    }

    case 'parceiro_declarar': {
      const ent = payload.entregavel?.trim()
      if (!ent) return { ok: false, erro: 'Informe a declaração / entregável.' }
      if (next.tipoAnalise === 'Licenciamento') {
        if (!(payload.credenciaisLicenca?.trim() || next.credenciaisLicenca?.trim())) {
          return { ok: false, erro: 'Licenciamento: informe as credenciais.' }
        }
        if (!(payload.applianceLicenca?.trim() || next.applianceLicenca?.trim())) {
          return { ok: false, erro: 'Licenciamento: informe appliance / ambiente.' }
        }
      }
      const comps = payload.anexosComprovacao ?? []
      const fab = payload.comprovacaoFabricanteAnexos ?? []
      next = {
        ...next,
        status: 'Aguardando validação MTI',
        entregavel: ent,
        anexosComprovacao: comps.length ? comps : next.anexosComprovacao,
        credenciaisLicenca: payload.credenciaisLicenca?.trim() || next.credenciaisLicenca,
        applianceLicenca: payload.applianceLicenca?.trim() || next.applianceLicenca,
        comprovacaoFabricanteAnexos: fab.length ? fab : next.comprovacaoFabricanteAnexos,
        quantidadeExecutada:
          payload.quantidadeExecutada != null ? payload.quantidadeExecutada : next.quantidadeExecutada,
        homologacaoStatus: 'Não iniciado',
        historico: pushHist(
          next,
          perfil,
          'Parceiro declarou atendida',
          [
            ent,
            comps.length ? `${comps.length} anexo(s)` : null,
            next.tipoAnalise === 'Licenciamento' && payload.quantidadeExecutada != null
              ? `qtd ${payload.quantidadeExecutada}`
              : null,
          ]
            .filter(Boolean)
            .join(' · '),
        ),
      }
      return { ok: true, demanda: next, toast: 'Declarada atendida — aguardando validação MTI' }
    }

    case 'validar_parceiro':
      next = {
        ...next,
        status: 'Aguardando assinatura do termo',
        homologacaoStatus: 'Aguardando assinatura',
        raerStatus: 'Vinculado ao termo',
        termoAssinaturaGestor: false,
        termoAssinaturaFiscal: false,
        termoAssinaturaSolicitante: false,
        historico: pushHist(
          next,
          perfil,
          'MTI validou atendimento do parceiro → termo + RAER para assinatura',
          next.entregavel?.slice(0, 120),
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Validado — termo + RAER enviados a gestor/fiscal/solicitante',
      }

    case 'assinar_homologacao': {
      const papel =
        payload.assinarTermoPapel ||
        (cargo === 'Demandante' ? 'Solicitante' : cargo === 'Fiscal' ? 'Fiscal' : 'Gestor')
      const termoAssinaturaGestor = papel === 'Gestor' || next.termoAssinaturaGestor
      const termoAssinaturaFiscal = papel === 'Fiscal' || next.termoAssinaturaFiscal
      const termoAssinaturaSolicitante = papel === 'Solicitante' || next.termoAssinaturaSolicitante
      const todas = Boolean(termoAssinaturaGestor && termoAssinaturaFiscal && termoAssinaturaSolicitante)
      next = {
        ...next,
        termoAssinaturaGestor,
        termoAssinaturaFiscal,
        termoAssinaturaSolicitante,
        status: todas ? 'Efetivado · entregue' : 'Aguardando assinatura do termo',
        homologacaoStatus: todas ? 'Assinado' : 'Aguardando assinatura',
        slaFinalizacao: todas ? next.slaFinalizacao || hojeIso() : next.slaFinalizacao,
        raerStatus: todas
          ? next.raerStatus === 'Não iniciado'
            ? 'Concluído'
            : next.raerStatus || 'Concluído'
          : next.raerStatus || 'Vinculado ao termo',
        historico: pushHist(
          next,
          perfil,
          todas
            ? '3ª assinatura do termo → Efetivado · entregue'
            : `Assinou termo (${papel}) — faltam outras assinaturas`,
          undefined,
          cargo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: todas
          ? 'Termo assinado (gestor+fiscal+solicitante) — demanda efetivada'
          : `Assinatura do termo registrada (${papel})`,
      }
    }

    case 'autorizar_servicenow': {
      if (!next.quantitativosConferidos) {
        return {
          ok: false,
          erro: 'Confera os quantitativos antes de autorizar. Se não conferem, devolva a demanda.',
        }
      }
      const ctSn = contratoPorNumero(next.numeroContrato)
      const alertaSaude = ctSn ? avaliarSaudeContrato(ctSn) : null
      const os = next.osVinculada?.trim() || `OS-DIG-${next.numero}`
      const snId = `SN-${next.numero.replace('DEM-', '')}`
      const executor: 'Parceiro' | 'MTI' =
        next.executorTipo || (next.parceiroNotificado ? 'Parceiro' : 'MTI')
      next = {
        ...next,
        status: executor === 'Parceiro' ? 'Em atendimento · parceiro' : 'Aprovada · em atendimento',
        executorTipo: executor,
        osVinculada: os,
        serviceNowStatus: 'Enviado · aprovada e em atendimento',
        serviceNowEm: hojeIso(),
        serviceNowId: snId,
        slaExecucaoInicio: next.slaExecucaoInicio || hojeIso(),
        slaExecucaoStatus: 'Em execução',
        historico: pushHist(
          next,
          perfil,
          next.caminhoComercial === 'orcamento'
            ? 'Autorizou execução (após assinatura da OS) → ServiceNow'
            : 'Autorizou execução (sem reassinar OS) → ServiceNow',
          `${os} · ${snId} · executor: ${executor}${
            alertaSaude && alertaSaude.status !== 'Saudável'
              ? ` · alerta saúde: ${alertaSaude.status}`
              : ''
          }`,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: `ServiceNow: aprovada e em atendimento (${snId}) · executor ${executor}`,
      }
    }

    case 'encerrar_termo_raer': {
      const itens = payload.necAtendimento?.trim() || payload.entregavel?.trim()
      if (!itens) return { ok: false, erro: 'Informe os itens/atividades do termo.' }
      next = {
        ...next,
        status: 'Aguardando assinatura do termo',
        entregavel: itens,
        homologacaoStatus: 'Aguardando assinatura',
        raerStatus: 'Vinculado ao termo',
        termoAssinaturaGestor: false,
        termoAssinaturaFiscal: false,
        termoAssinaturaSolicitante: false,
        historico: pushHist(
          next,
          perfil,
          'Encerrou atendimento · termo + RAER enviados para assinatura',
          itens.slice(0, 120),
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Termo + RAER enviados a gestor/fiscal/solicitante',
      }
    }

    case 'solicitar_ajuste_termo': {
      if (!payload.motivo?.trim()) return { ok: false, erro: 'Informe o motivo do ajuste.' }
      const termoJaAssinadoPorAlguem =
        Boolean(next.termoAssinaturaGestor) ||
        Boolean(next.termoAssinaturaFiscal) ||
        Boolean(next.termoAssinaturaSolicitante) ||
        next.status === 'Efetivado · entregue'
      // Call Luis 17/09 · L03: ajuste com assinaturas → regenerar termo + todos reassinar
      // (mesma demanda; NÃO abre nova demanda).
      next = {
        ...next,
        status: 'Aguardando assinatura do termo',
        homologacaoStatus: 'Aguardando assinatura',
        homologAjuste: true,
        homologAjustePor: perfil === 'Cliente' ? 'Cliente' : 'MTI',
        termoRecusado: false,
        termoAssinaturaGestor: false,
        termoAssinaturaFiscal: false,
        termoAssinaturaSolicitante: false,
        motivoUltimaAcao: payload.motivo,
        historico: pushHist(
          next,
          perfil,
          termoJaAssinadoPorAlguem
            ? 'Ajuste no termo com assinatura(s) → termo regenerado; todos reassinar'
            : 'Solicitou ajuste no termo — MTI regenera e recolhe assinaturas',
          payload.motivo,
          cargo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: termoJaAssinadoPorAlguem
          ? 'Termo regenerado — gestor, fiscal e solicitante devem assinar de novo'
          : 'Ajuste solicitado — termo regenerado para nova coleta de assinaturas',
      }
    }

    case 'via_contrato': {
      if (!next.qualificado) {
        return { ok: false, erro: 'Qualifique a demanda (produto, contrato, catálogo e itens) antes de deliberar.' }
      }
      if (!payload.catalogos?.trim() || !payload.itensCatalogo?.trim()) {
        return { ok: false, erro: 'Informe catálogos e itens (plural).' }
      }
      if (!payload.necAtendimento?.trim() || !payload.valoresContrato?.trim()) {
        return { ok: false, erro: 'Informe NEC e valores/contabilidade do contrato.' }
      }
      // Parceiro = propositivo; MTI = definitivo
      if (perfil === 'Parceiro') {
        next = {
          ...next,
          status: 'Proposta parceiro · aguardando MTI',
          tipoAnalise: payload.tipoAnalise || next.tipoAnalise,
          catalogos: payload.catalogos.trim(),
          itensCatalogo: payload.itensCatalogo.trim(),
          descricaoAtendimento: payload.descricaoAtendimento?.trim() || undefined,
          necAtendimento: payload.necAtendimento.trim(),
          valoresContrato: payload.valoresContrato.trim(),
          historico: pushHist(
            next,
            perfil,
            'Parceiro propôs: atendimento via contrato (aguarda deliberação MTI)',
            payload.necAtendimento.slice(0, 80),
          ),
        }
        return {
          ok: true,
          demanda: next,
          toast: 'Proposta registrada — aguardando deliberação definitiva da MTI',
        }
      }
      // 17/09: deliberação definitiva só sem parceiro OU após proposta do parceiro
      if (next.parceiroNotificado && next.status !== 'Proposta parceiro · aguardando MTI') {
        return {
          ok: false,
          erro: 'Com parceiro notificado, aguarde o parecer (proposta) antes da deliberação definitiva.',
        }
      }
      const naturezaVia =
        payload.contratoNatureza || next.contratoNatureza || 'Próprio do cliente'
      const precisaPatrocinio =
        naturezaVia === 'Patrocinado (gestão)' && !next.patrocinioAutorizado
      let metricaVia = payload.metricaContrato || next.metricaContrato
      if (!metricaVia && payload.tipoAnalise === 'Licenciamento') metricaVia = 'Licenciamento'
      if (!metricaVia && payload.tipoAnalise === 'Serviço') metricaVia = 'Serviço'
      const detalheVia = [
        payload.necAtendimento.slice(0, 60),
        payload.tipoOs ? `OS ${payload.tipoOs}` : '',
        naturezaVia,
      ]
        .filter((x) => Boolean(x))
        .join(' · ')
      const histVia = precisaPatrocinio
        ? 'Via contrato definitivo — aguarda autorização do patrocinador (pós-qualificação)'
        : 'Via contrato definitivo — aguarda assinaturas gestor/fiscal/solicitante'
      next = {
        ...next,
        status: precisaPatrocinio
          ? 'Aguardando autorização patrocinador'
          : 'Aguardando assinatura do atendimento',
        caminhoComercial: 'via_contrato',
        contratoNatureza: naturezaVia,
        quantitativosConferidos: false,
        tipoAnalise: payload.tipoAnalise || next.tipoAnalise,
        metricaContrato: metricaVia,
        catalogoVersaoVigente:
          payload.catalogoVersaoVigente?.trim() || next.catalogoVersaoVigente,
        catalogos: payload.catalogos.trim(),
        itensCatalogo: payload.itensCatalogo.trim(),
        descricaoAtendimento: payload.descricaoAtendimento?.trim() || undefined,
        necAtendimento: payload.necAtendimento.trim(),
        valoresContrato: payload.valoresContrato.trim(),
        osVinculada: payload.osVinculada?.trim() || next.osVinculada,
        tipoOs: payload.tipoOs || next.tipoOs,
        slaPrazoDeclarado: payload.prazoExecucao?.trim() || next.slaPrazoDeclarado,
        slaExecucaoStatus: 'Não iniciado',
        assinaturaGestor: undefined,
        assinaturaFiscal: undefined,
        assinaturaSolicitante: undefined,
        historico: pushHist(next, perfil, histVia, detalheVia),
      }
      return {
        ok: true,
        demanda: next,
        toast: precisaPatrocinio
          ? 'Via contrato — registre a autorização do patrocinador antes das assinaturas do cliente'
          : 'Via contrato — aguardando assinaturas do atendimento',
      }
    }

    case 'registrar_autorizacao_patrocinio': {
      if (next.contratoNatureza !== 'Patrocinado (gestão)') {
        return {
          ok: false,
          erro: 'Autorização de patrocinador só se aplica a cobertura Patrocinado (gestão).',
        }
      }
      next = {
        ...next,
        patrocinioAutorizado: true,
        patrocinioAutorizadoEm: hojeIso(),
        patrocinioAutorizadoPor: perfil,
        status: 'Aguardando assinatura do atendimento',
        historico: pushHist(
          next,
          perfil,
          'Registrou autorização do patrocinador (pós-qualificação) → assinaturas do atendimento',
          next.numeroContrato,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Patrocínio autorizado — aguardando assinaturas gestor/fiscal/solicitante',
      }
    }

    case 'assinar_atendimento': {
      const decisao = payload.decisaoAssinatura || 'Assinar'
      if (decisao === 'Devolver para correção') {
        if (!payload.motivo?.trim()) return { ok: false, erro: 'Informe o motivo da devolução.' }
        // BPMN: devolve para MTI redetalhar (não só ao solicitante)
        next = {
          ...next,
          status: 'Em análise',
          motivoUltimaAcao: payload.motivo,
          assinaturaGestor: false,
          assinaturaFiscal: false,
          assinaturaSolicitante: false,
          quantitativosConferidos: false,
          historico: pushHist(
            next,
            perfil,
            'Devolveu atendimento → MTI redetalha via contrato',
            payload.motivo,
            cargo,
          ),
        }
        return { ok: true, demanda: next, toast: 'Devolvida à MTI para redetalhar o atendimento' }
      }
      const papel = payload.assinarPapel || (cargo === 'Demandante' ? 'Solicitante' : cargo === 'Fiscal' ? 'Fiscal' : 'Gestor')
      const osAcao = payload.osAcao || 'Criar nova OS'
      const tipoOs: TipoOs =
        payload.tipoOs ||
        next.tipoOs ||
        (osAcao === 'Autorizar consumo em OS existente' || osAcao === 'Vincular OS existente'
          ? 'Global'
          : 'Dedicada')
      const os =
        (osAcao === 'Vincular OS existente' || osAcao === 'Autorizar consumo em OS existente') &&
        next.osVinculada
          ? next.osVinculada
          : next.osVinculada?.trim() || `OS-DIG-${next.numero}`
      const assinaturaGestor = papel === 'Gestor' || next.assinaturaGestor
      const assinaturaFiscal = papel === 'Fiscal' || next.assinaturaFiscal
      const assinaturaSolicitante = papel === 'Solicitante' || next.assinaturaSolicitante
      const todasAssinaturas = Boolean(assinaturaGestor && assinaturaFiscal && assinaturaSolicitante)
      // Via contrato: após 3 assinaturas → conferir quantitativos → autorizar (E21 sem reassinar OS)
      // #03 Luis: OS operacional pode existir; faturamento exige contrato+saldo, não OS.
      next = {
        ...next,
        status: todasAssinaturas ? 'Aguardando autorização' : 'Aguardando assinatura do atendimento',
        caminhoComercial: 'via_contrato',
        quantitativosConferidos: false,
        tipoOs,
        osVinculada: os,
        assinaturaGestor,
        assinaturaFiscal,
        assinaturaSolicitante,
        slaExecucaoStatus: 'Não iniciado',
        serviceNowStatus: todasAssinaturas
          ? 'Aguardando autorização de execução'
          : next.serviceNowStatus || 'Não enviado',
        historico: pushHist(
          next,
          perfil,
          todasAssinaturas
            ? `Assinaturas OK · OS ${tipoOs} · conferir quantitativos (faturamento = contrato+saldo)`
            : `Assinou atendimento (${papel}) — faltam outras assinaturas`,
          `${papel} · ${osAcao} · ${tipoOs} · ${os}`,
          cargo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: todasAssinaturas
          ? `Assinaturas OK · ${os} · aguardando MTI autorizar execução → SN`
          : `Assinatura registrada (${papel})`,
      }
    }

    case 'enviar_orcamento':
      if (perfil === 'Parceiro') {
        if (!next.qualificado) {
          return { ok: false, erro: 'Demanda ainda não qualificada pela MTI.' }
        }
        next = {
          ...next,
          status: 'Proposta parceiro · aguardando MTI',
          historico: pushHist(next, perfil, 'Parceiro propôs: enviar para orçamento (aguarda MTI)'),
        }
        return {
          ok: true,
          demanda: next,
          toast: 'Proposta de orçamento registrada — aguardando deliberação da MTI',
        }
      }
      if (next.parceiroNotificado && next.status !== 'Proposta parceiro · aguardando MTI') {
        return {
          ok: false,
          erro: 'Com parceiro notificado, aguarde o parecer (proposta) antes de enviar para orçamento.',
        }
      }
      if (!next.qualificado) {
        return { ok: false, erro: 'Qualifique a demanda (produto, contrato, catálogo e itens) antes de enviar para orçamento.' }
      }
      next = {
        ...next,
        status: 'Em orçamento',
        caminhoComercial: 'orcamento',
        quantitativosConferidos: false,
        orcamento: {
          numero: `ORC-${next.numero.replace('DEM-', '')}`,
          status: 'Em elaboração',
          itens: [],
        },
        slaPrazoAssinaturaOrcamento:
          next.slaPrazoAssinaturaOrcamento || 'Conforme validade do orçamento',
        historico: pushHist(next, perfil, 'MTI enviou para orçamento'),
      }
      return { ok: true, demanda: next, toast: 'Demanda enviada para orçamento — elabore a proposta' }

    case 'enviar_proposta_orcamento': {
      const itens = payload.orcamentoItens?.filter((i) => i.descricao.trim() && i.quantidade > 0) ?? []
      if (itens.length === 0) {
        return { ok: false, erro: 'Inclua ao menos um item na proposta de orçamento.' }
      }
      const num =
        next.orcamento?.numero ?? `ORC-${next.numero.replace('DEM-', '')}`
      // Cadeia: composição → assinaturas Vendas (+ Parceiro) → cliente
      next = {
        ...next,
        status: 'Em orçamento',
        orcamento: {
          numero: num,
          status: 'Aguardando assinaturas',
          itens,
          validade: payload.orcamentoValidade || undefined,
          observacoes: payload.orcamentoObs?.trim() || undefined,
          enviadoEm: hojeIso(),
        },
        orcamentoAssinadoVendas: false,
        orcamentoAssinadoParceiro: false,
        orcamentoAssinadoCliente: false,
        slaPrazoAssinaturaOrcamento:
          next.slaPrazoAssinaturaOrcamento ||
          (payload.orcamentoValidade
            ? `Até ${payload.orcamentoValidade}`
            : 'Conforme validade do orçamento'),
        historico: pushHist(
          next,
          perfil,
          'Enviou composição de orçamento para assinaturas (Vendas/Parceiro)',
          `${itens.length} item(ns) · ${num}`,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: `Composição ${num} pronta — aguarda assinatura Vendas${next.parceiroNotificado ? ' e Parceiro' : ''}`,
      }
    }

    case 'assinar_orcamento': {
      if (!next.orcamento || next.orcamento.status !== 'Aguardando assinaturas') {
        return { ok: false, erro: 'Não há orçamento aguardando assinaturas.' }
      }
      let orcamentoAssinadoVendas = next.orcamentoAssinadoVendas
      let orcamentoAssinadoParceiro = next.orcamentoAssinadoParceiro
      if (perfil === 'MTI') {
        orcamentoAssinadoVendas = true
      } else if (perfil === 'Parceiro') {
        orcamentoAssinadoParceiro = true
      } else {
        return { ok: false, erro: 'Assinatura interna do orçamento é de Vendas (MTI) ou Parceiro.' }
      }
      const parcial: Demanda = {
        ...next,
        orcamentoAssinadoVendas,
        orcamentoAssinadoParceiro,
      }
      const completas = orcamentoAssinaturasInternasOk(parcial)
      next = {
        ...parcial,
        orcamento: {
          ...next.orcamento,
          status: completas ? 'Proposta enviada' : 'Aguardando assinaturas',
        },
        historico: pushHist(
          next,
          perfil,
          completas
            ? `Assinou orçamento (${perfil === 'MTI' ? 'Vendas' : 'Parceiro'}) → proposta liberada ao cliente`
            : `Assinou orçamento (${perfil === 'MTI' ? 'Vendas' : 'Parceiro'}) — faltam assinaturas`,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: completas
          ? 'Orçamento assinado — cliente pode aceitar, devolver ou recusar'
          : 'Assinatura registrada — aguardando demais signatários',
      }
    }

    case 'devolver_orcamento_ajuste': {
      if (!payload.motivo?.trim()) return { ok: false, erro: 'Informe o motivo do ajuste.' }
      next = {
        ...next,
        status: 'Em orçamento',
        motivoUltimaAcao: payload.motivo,
        orcamento: next.orcamento
          ? { ...next.orcamento, status: 'Em elaboração' }
          : undefined,
        orcamentoAssinadoVendas: false,
        orcamentoAssinadoParceiro: false,
        orcamentoAssinadoCliente: false,
        historico: pushHist(
          next,
          perfil,
          perfil === 'Cliente'
            ? 'Cliente devolveu orçamento para correção'
            : 'Solicitou ajuste na composição do orçamento',
          payload.motivo,
          perfil === 'Cliente' ? cargo : undefined,
        ),
      }
      return { ok: true, demanda: next, toast: 'Orçamento devolvido para ajuste na composição' }
    }

    case 'aceitar_orcamento': {
      if (!next.orcamento || next.orcamento.status !== 'Proposta enviada') {
        return { ok: false, erro: 'Não há proposta de orçamento liberada para o cliente.' }
      }
      if (!orcamentoAssinaturasInternasOk(next)) {
        return {
          ok: false,
          erro: 'Aguarde assinaturas de Vendas e do Parceiro (quando houver) antes de aceitar.',
        }
      }
      const itensTxt = next.orcamento.itens
        .map((i) => `${i.descricao} (${i.quantidade}×)`)
        .join('; ')
      next = {
        ...next,
        status: 'Aguardando assinatura OS (gerente operação)',
        caminhoComercial: 'orcamento',
        quantitativosConferidos: false,
        catalogos: next.catalogos || `Orçamento ${next.orcamento.numero}`,
        itensCatalogo: next.itensCatalogo || itensTxt,
        descricaoAtendimento:
          next.descricaoAtendimento ||
          `Atendimento via orçamento ${next.orcamento.numero} aceito pelo cliente.`,
        orcamento: { ...next.orcamento, status: 'Aceito' },
        orcamentoAssinadoCliente: true,
        historico: pushHist(
          next,
          perfil,
          'Cliente aceitou orçamento → aguarda assinatura OS (gerente operação)',
          undefined,
          cargo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Orçamento aceito — MTI/gerente assina a OS e autoriza a execução',
      }
    }

    case 'recusar_orcamento':
      next = {
        ...next,
        status: 'Em orçamento',
        motivoUltimaAcao: payload.motivo,
        orcamento: next.orcamento
          ? { ...next.orcamento, status: 'Recusado' }
          : undefined,
        historico: pushHist(next, perfil, 'Cliente recusou orçamento', payload.motivo, cargo),
      }
      return { ok: true, demanda: next, toast: 'Orçamento recusado — parceiro/MTI pode reenviar proposta' }

    case 'devolver_correcao':
      if (perfil === 'Parceiro') {
        next = {
          ...next,
          status: 'Proposta parceiro · aguardando MTI',
          motivoUltimaAcao: payload.motivo,
          historico: pushHist(next, perfil, 'Parceiro propôs: devolver para correção', payload.motivo),
        }
        return {
          ok: true,
          demanda: next,
          toast: 'Proposta de devolução registrada — aguardando deliberação da MTI',
        }
      }
      // Validação MTI → devolve ao parceiro executar de novo
      if (demanda.status === 'Aguardando validação MTI') {
        next = {
          ...next,
          status: 'Em atendimento · parceiro',
          motivoUltimaAcao: payload.motivo,
          historico: pushHist(
            next,
            perfil,
            'MTI devolveu atendimento ao parceiro (corrige execução)',
            payload.motivo,
          ),
        }
        return { ok: true, demanda: next, toast: 'Devolvida ao parceiro para correção da execução' }
      }
      next = {
        ...next,
        status: 'Devolvida para correção',
        motivoUltimaAcao: payload.motivo,
        historico: pushHist(next, perfil, 'Devolveu demanda para correção (objeto = demanda)', payload.motivo),
      }
      return { ok: true, demanda: next, toast: 'Devolvida ao cliente para correção' }

    case 'recusar':
      if (perfil === 'Parceiro') {
        next = {
          ...next,
          status: 'Proposta parceiro · aguardando MTI',
          motivoUltimaAcao: payload.motivo,
          historico: pushHist(next, perfil, 'Parceiro propôs: recusar', payload.motivo),
        }
        return {
          ok: true,
          demanda: next,
          toast: 'Proposta de recusa registrada — aguardando deliberação da MTI',
        }
      }
      next = {
        ...next,
        status: 'Recusada',
        slaFinalizacao: next.slaFinalizacao || hojeIso(),
        motivoUltimaAcao: payload.motivo,
        historico: pushHist(
          next,
          perfil,
          'Recusou demanda (definitivo) — esta instância Recusada; solicitante pode abrir nova com estes dados',
          payload.motivo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Demanda Recusada — use «Abrir nova demanda com estes dados» se quiser reaproveitar',
      }

    case 'ajustar_enviar': {
      const desc = payload.descricao?.trim() ?? next.descricao
      const prod = payload.produtoSolucao?.trim() ?? next.produtoSolucao
      const ctr = payload.numeroContrato ?? next.numeroContrato
      const mudou = prod !== next.produtoSolucao || ctr !== next.numeroContrato
      const rota = roteamentoAutomaticoParceiro(ctr, prod)
      // Consumo: N2 sempre (17/09). EXC-CARG só com contrato sem cargos.
      const semCargos =
        next.tipo === 'Consumo' && vinculoSemCargosContratante(ctr || undefined)
      if (next.tipo === 'Consumo' && semCargos) {
        next = {
          ...next,
          descricao: desc,
          produtoSolucao: prod,
          numeroContrato: ctr,
          status: 'Aguardando cadastro gestor/fiscal',
          exigeAuthContratante: false,
          authGestor: undefined,
          authFiscal: undefined,
          qualificado: false,
          qualificadoEm: undefined,
          parceiroNotificado: false,
          parceiroNotificadoEm: undefined,
          parceiroNome: rota.parceiroNome,
          historico: pushHist(
            next,
            perfil,
            'Reenviou — aguarda cadastro de gestor e fiscal no vínculo',
            undefined,
            cargo,
          ),
        }
        return {
          ok: true,
          demanda: next,
          toast: 'Demanda reenviada — aguarda cadastro de gestor e fiscal',
        }
      }
      if (next.tipo === 'Consumo') {
        let authGestor: RegistroAuthN2 | undefined
        let authFiscal: RegistroAuthN2 | undefined
        if (cargo === 'Gestor') {
          authGestor = { decisao: 'aprovar', em: hojeIso(), quem: USUARIO_LOGADO }
        } else if (cargo === 'Fiscal') {
          authFiscal = { decisao: 'aprovar', em: hojeIso(), quem: USUARIO_LOGADO }
        }
        next = {
          ...next,
          descricao: desc,
          produtoSolucao: prod,
          numeroContrato: ctr,
          status: 'Aguardando gestor',
          exigeAuthContratante: true,
          authGestor,
          authFiscal,
          qualificado: mudou ? false : next.qualificado,
          qualificadoEm: mudou ? undefined : next.qualificadoEm,
          parceiroNotificado: false,
          parceiroNotificadoEm: undefined,
          parceiroNome: rota.parceiroNome,
          historico: pushHist(
            next,
            perfil,
            mudou
              ? 'Reenviou com alteração → nova autorização (gestor e fiscal)'
              : 'Reenviou após correção → nova autorização (gestor e fiscal)',
            undefined,
            cargo,
          ),
        }
        return {
          ok: true,
          demanda: next,
          toast: 'Demanda reenviada — aguardando autorização paralela (gestor e fiscal)',
        }
      }
      next = {
        ...next,
        descricao: desc,
        produtoSolucao: prod,
        numeroContrato: ctr,
        status: rota.notificarParceiro ? 'Aguardando parceiro' : 'Aguardando pré-análise MTI',
        exigeAuthContratante: false,
        authGestor: undefined,
        authFiscal: undefined,
        qualificado: mudou ? rota.notificarParceiro : next.qualificado || rota.notificarParceiro,
        qualificadoEm:
          mudou && rota.notificarParceiro
            ? new Date().toISOString()
            : mudou
              ? undefined
              : next.qualificadoEm || (rota.notificarParceiro ? new Date().toISOString() : undefined),
        parceiroNotificado: mudou ? rota.notificarParceiro : next.parceiroNotificado || rota.notificarParceiro,
        parceiroNotificadoEm:
          mudou && rota.notificarParceiro
            ? new Date().toISOString()
            : mudou
              ? undefined
              : next.parceiroNotificadoEm ||
                (rota.notificarParceiro ? new Date().toISOString() : undefined),
        parceiroNome: rota.parceiroNome ?? (mudou ? undefined : next.parceiroNome),
        historico: pushHist(
          next,
          perfil,
          mudou ? 'Reenviou com alteração (requalificar se preciso)' : 'Reenviou após correção',
          undefined,
          cargo,
        ),
      }
      return { ok: true, demanda: next, toast: 'Demanda reenviada — aguardando análise' }
    }
    case 'assinar_os_orcamento': {
      const os = next.osVinculada?.trim() || `OS-DIG-${next.numero}`
      next = {
        ...next,
        status: 'Aguardando autorização',
        caminhoComercial: 'orcamento',
        quantitativosConferidos: false,
        osVinculada: os,
        osAssinadaGerenteOperacao: true,
        historico: pushHist(
          next,
          perfil,
          'Gerente assinou OS → conferir quantitativos → autorizar',
          os,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: `OS ${os} assinada — confira quantitativos e autorize a execução`,
      }
    }

    case 'solicitar_proposta':
      next = {
        ...next,
        status: 'Sem cobertura · definir pagamento',
        caminhoComercial: 'sem_cobertura',
        historico: pushHist(
          next,
          perfil,
          'Cliente solicitou proposta pelo portal (sem cobertura) — CRM diferido',
          undefined,
          cargo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Pedido de proposta registrado — defina o pagamento (indenização | nova | desistir)',
      }

    case 'definir_pagamento': {
      const forma = payload.definirPagamento
      if (!forma || forma === 'Ainda não definido') {
        return { ok: false, erro: 'Selecione indenização, nova contratação ou desistência.' }
      }
      // Fontes: rito posterior incompleto (PD25); desistência NÃO fecha estado formal da demanda
      next = {
        ...next,
        status: 'Sem cobertura · definir pagamento',
        caminhoComercial: 'sem_cobertura',
        definirPagamento: forma,
        historico: pushHist(
          next,
          perfil,
          `Definiu pagamento: ${forma} (não autoriza execução · rito posterior incompleto)`,
          forma === 'Desistiu' ? 'Estado final da demanda NÃO fechado nas fontes' : undefined,
          cargo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast:
          forma === 'Desistiu'
            ? 'Desistência registrada — estado final da demanda permanece aberto (fontes)'
            : `Pagamento registrado: ${forma} — não inicia execução`,
      }
    }

    case 'sem_cobertura':
      if (perfil === 'Parceiro') {
        if (!next.qualificado) {
          return { ok: false, erro: 'Demanda ainda não qualificada pela MTI.' }
        }
        next = {
          ...next,
          status: 'Proposta parceiro · aguardando MTI',
          historico: pushHist(next, perfil, 'Parceiro propôs: sem cobertura (aguarda MTI)'),
        }
        return {
          ok: true,
          demanda: next,
          toast: 'Proposta «sem cobertura» registrada — aguardando deliberação da MTI',
        }
      }
      if (next.parceiroNotificado && next.status !== 'Proposta parceiro · aguardando MTI') {
        return {
          ok: false,
          erro: 'Com parceiro notificado, aguarde o parecer antes de deliberar «sem cobertura».',
        }
      }
      if (!next.qualificado) {
        return { ok: false, erro: 'Qualifique a demanda antes de deliberar «sem cobertura».' }
      }
      next = {
        ...next,
        status: 'Sem cobertura · definir pagamento',
        caminhoComercial: 'sem_cobertura',
        historico: pushHist(
          next,
          perfil,
          'MTI deliberou: sem cobertura → cliente define indenização|nova|desistir',
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Sem cobertura — cliente deve definir pagamento (não autoriza execução)',
      }

    case 'conferir_quantitativos':
      next = {
        ...next,
        quantitativosConferidos: true,
        historico: pushHist(
          next,
          perfil,
          `Quantitativos OK${next.tipoOs ? ` · OS ${next.tipoOs}` : ''} → autorizar execução (PV/faturamento = contrato+saldo; OS não obrigatória)`,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Quantitativos OK — autorize a execução → ServiceNow',
      }

    case 'devolver_quantitativos': {
      const origem = next.caminhoComercial
      const statusVolta: StatusDemanda =
        origem === 'orcamento' ? 'Em orçamento' : 'Em análise'
      next = {
        ...next,
        status: statusVolta,
        quantitativosConferidos: false,
        motivoUltimaAcao: payload.motivo,
        historico: pushHist(
          next,
          perfil,
          `Quantitativos NÃO conferem → devolve DEMANDA (${origem || 'via_contrato'})`,
          payload.motivo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast:
          origem === 'orcamento'
            ? 'Devolvida para elaborar/corrigir orçamento'
            : 'Devolvida para MTI redetalhar via contrato',
      }
    }

    case 'mti_executar_declarar': {
      const ent = payload.entregavel?.trim()
      if (!ent) return { ok: false, erro: 'Informe a conclusão técnica / entregável.' }
      next = {
        ...next,
        executorTipo: 'MTI',
        entregavel: ent,
        status: 'Em homologação',
        homologacaoStatus: 'Em elaboração',
        historico: pushHist(
          next,
          perfil,
          'MTI executou / declarou conclusão técnica (sem parceiro · rito PD)',
          ent.slice(0, 120),
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Conclusão técnica MTI registrada — encerre com termo + RAER',
      }
    }

    case 'solicitar_dilacao': {
      const prazo = payload.dilacaoPrazo?.trim()
      if (!prazo) return { ok: false, erro: 'Informe o novo prazo / estimativa.' }
      // Solicitante já manifesta aceite; demais partes precisam aceitar (17/09).
      const dilacaoAckCliente = perfil === 'Cliente'
      const dilacaoAckMti = perfil === 'MTI'
      const dilacaoAckParceiro = perfil === 'Parceiro'
      const parcial: Demanda = {
        ...next,
        status: 'Dilatação de prazo',
        slaPrazoDeclarado: prazo,
        slaExecucaoStatus: 'Dilatado',
        slaStatus: 'Dilatado',
        dilacaoNovoPrazo: prazo,
        dilacaoMotivo: payload.motivo,
        dilacaoSolicitadaPor: perfil,
        dilacaoAckCliente,
        dilacaoAckMti,
        dilacaoAckParceiro,
        motivoUltimaAcao: payload.motivo,
      }
      const completa = dilacaoAcksCompletos(parcial)
      const statusVolta: StatusDemanda = next.parceiroNotificado
        ? 'Em atendimento · parceiro'
        : 'Aprovada · em atendimento'
      next = {
        ...parcial,
        status: completa ? statusVolta : 'Dilatação de prazo',
        historico: pushHist(
          next,
          perfil,
          completa
            ? 'Dilação solicitada e confirmada (todas as partes)'
            : 'Solicitou dilação — aguarda aceite das demais partes',
          `${prazo} · ${payload.motivo}`,
          perfil === 'Cliente' ? cargo : undefined,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: completa
          ? 'Dilação confirmada'
          : 'Dilação solicitada — aguardando aceite das demais partes',
      }
    }

    case 'aceitar_dilacao': {
      if (next.status !== 'Dilatação de prazo') {
        return { ok: false, erro: 'Não há dilação pendente de aceite.' }
      }
      const dilacaoAckCliente = perfil === 'Cliente' ? true : next.dilacaoAckCliente
      const dilacaoAckMti = perfil === 'MTI' ? true : next.dilacaoAckMti
      const dilacaoAckParceiro = perfil === 'Parceiro' ? true : next.dilacaoAckParceiro
      const parcial: Demanda = {
        ...next,
        dilacaoAckCliente,
        dilacaoAckMti,
        dilacaoAckParceiro,
      }
      const completa = dilacaoAcksCompletos(parcial)
      const statusVolta: StatusDemanda = next.parceiroNotificado
        ? 'Em atendimento · parceiro'
        : 'Aprovada · em atendimento'
      next = {
        ...parcial,
        status: completa ? statusVolta : 'Dilatação de prazo',
        slaPrazoDeclarado: completa
          ? next.dilacaoNovoPrazo || next.slaPrazoDeclarado
          : next.slaPrazoDeclarado,
        historico: pushHist(
          next,
          perfil,
          completa
            ? 'Dilação aceita por todas as partes — prazo atualizado'
            : `Aceitou dilação (${perfil}) — faltam aceites`,
          next.dilacaoNovoPrazo,
          perfil === 'Cliente' ? cargo : undefined,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: completa
          ? 'Dilação confirmada — atendimento retomado com novo prazo'
          : 'Aceite registrado — aguardando demais partes',
      }
    }

    case 'recusar_dilacao': {
      if (!payload.motivo?.trim()) return { ok: false, erro: 'Informe o motivo da recusa.' }
      const statusVolta: StatusDemanda = next.parceiroNotificado
        ? 'Em atendimento · parceiro'
        : 'Aprovada · em atendimento'
      next = {
        ...next,
        status: statusVolta,
        motivoUltimaAcao: payload.motivo,
        dilacaoAckCliente: false,
        dilacaoAckMti: false,
        dilacaoAckParceiro: false,
        slaExecucaoStatus: 'Em execução',
        slaStatus: 'No prazo',
        historico: pushHist(
          next,
          perfil,
          'Recusou dilação — mantém prazo anterior',
          payload.motivo,
          perfil === 'Cliente' ? cargo : undefined,
        ),
      }
      return { ok: true, demanda: next, toast: 'Dilação recusada — prazo anterior mantido' }
    }

    case 'recusar_termo':
      // Call Luis 17/09 · L02: termo recusado; demanda CONCLUÍDA (ciclos independentes).
      next = {
        ...next,
        status: 'Efetivado · entregue',
        homologacaoStatus: 'Recusado',
        termoRecusado: true,
        homologAjuste: false,
        slaFinalizacao: next.slaFinalizacao || hojeIso(),
        motivoUltimaAcao: payload.motivo,
        historico: pushHist(
          next,
          perfil,
          'Recusou o termo — demanda permanece CONCLUÍDA; só o termo fica recusado',
          payload.motivo,
          cargo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Termo recusado · demanda concluída — MTI pode regenerar o termo',
      }

    case 'regenerar_termo': {
      if (!payload.motivo?.trim()) return { ok: false, erro: 'Informe o motivo da regeneração.' }
      next = {
        ...next,
        status: 'Aguardando assinatura do termo',
        homologacaoStatus: 'Aguardando assinatura',
        termoRecusado: false,
        homologAjuste: true,
        homologAjustePor: 'MTI',
        termoAssinaturaGestor: false,
        termoAssinaturaFiscal: false,
        termoAssinaturaSolicitante: false,
        raerStatus: next.raerStatus === 'Não iniciado' ? 'Vinculado ao termo' : next.raerStatus,
        motivoUltimaAcao: payload.motivo,
        historico: pushHist(
          next,
          perfil,
          'Regenerou termo após recusa/ajuste — todos devem assinar novamente',
          payload.motivo,
          cargo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Termo regenerado — gestor, fiscal e solicitante devem assinar de novo',
      }
    }

    case 'restituir_n2': {
      // Call Luis 17/09: quem recusou pode restituir (aceitar) ou pedir ajuste.
      const papel: 'gestor' | 'fiscal' = cargo === 'Fiscal' ? 'fiscal' : 'gestor'
      const meu = papel === 'fiscal' ? next.authFiscal : next.authGestor
      if (!meu || meu.decisao !== 'recusar') {
        return { ok: false, erro: 'Só quem registrou a recusa pode restituir o processo.' }
      }
      const decisaoRest = payload.decisaoRestituir || 'aceitar'
      if (decisaoRest === 'ajustar') {
        next = {
          ...next,
          status: 'Devolvida para correção',
          authGestor: undefined,
          authFiscal: undefined,
          exigeAuthContratante: true,
          motivoUltimaAcao: payload.motivo,
          historico: pushHist(
            next,
            perfil,
            `${papel === 'fiscal' ? 'Fiscal' : 'Gestor'} restituiu a recusa → solicitou ajuste`,
            payload.motivo,
            cargo,
          ),
        }
        return {
          ok: true,
          demanda: next,
          toast: 'Recusa restituída — demanda devolvida ao solicitante para ajuste',
        }
      }
      // aceitar: limpa a própria recusa e registra aprovação; reavalia join
      const registro: RegistroAuthN2 = {
        decisao: 'aprovar',
        motivo: payload.motivo?.trim() || 'Restituiu recusa e aprovou',
        em: hojeIso(),
        quem: USUARIO_LOGADO,
      }
      next = {
        ...next,
        authGestor: papel === 'gestor' ? registro : next.authGestor,
        authFiscal: papel === 'fiscal' ? registro : next.authFiscal,
        exigeAuthContratante: true,
        status: 'Aguardando gestor',
      }
      const join = resolverJoinN2(next.authGestor, next.authFiscal)
      if (join === 'aprovada') {
        next = {
          ...next,
          status: 'Aguardando pré-análise MTI',
          historico: pushHist(
            next,
            perfil,
            `${papel === 'fiscal' ? 'Fiscal' : 'Gestor'} restituiu e aprovou → pré-análise MTI`,
            payload.motivo,
            cargo,
          ),
        }
        return {
          ok: true,
          demanda: next,
          toast: 'Processo restituído e aprovado — aguardando pré-análise MTI',
        }
      }
      next = {
        ...next,
        historico: pushHist(
          next,
          perfil,
          `${papel === 'fiscal' ? 'Fiscal' : 'Gestor'} restituiu a recusa e aprovou — aguarda o outro`,
          payload.motivo,
          cargo,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Recusa restituída · aprovação registrada — aguardando o outro papel',
      }
    }

    case 'cadastrar_cargos':
      // EXC-CARG resolvido — N2 nunca é pulado: segue à autorização paralela.
      next = {
        ...next,
        status: 'Aguardando gestor',
        exigeAuthContratante: true,
        authGestor: undefined,
        authFiscal: undefined,
        historico: pushHist(
          next,
          perfil,
          'Cadastro de gestor/fiscal concluído → autorização em paralelo',
          undefined,
          perfil === 'Cliente' ? cargo : undefined,
        ),
      }
      return {
        ok: true,
        demanda: next,
        toast: 'Cargos cadastrados — demanda enviada à autorização (gestor e fiscal)',
      }

    case 'reaproveitar_como_nova': {
      const rNova = reaproveitarComoNova(next, existentes.length ? existentes : [next])
      if (!rNova.ok) return { ok: false, erro: rNova.erro }
      const novaDemanda = rNova.demanda
      const posEfetivado = next.status === 'Efetivado · entregue'
      next = {
        ...next,
        historico: pushHist(
          next,
          perfil,
          posEfetivado
            ? `Ajuste pós-assinatura → abriu nova demanda ${novaDemanda.numero} (termo original imutável)`
            : `Reaproveitada como nova demanda ${novaDemanda.numero} (instância separada)`,
          undefined,
          perfil === 'Cliente' ? cargo : undefined,
        ),
      }
      return {
        ok: true,
        demanda: next,
        novaDemanda,
        toast: `Nova demanda ${novaDemanda.numero} criada com os dados reaproveitados`,
      }
    }

    default:
      return { ok: false, erro: 'Ação desconhecida.' }
  }
}

export function criarDemandaDeDraft(
  draft: DemandaFormDraft,
  existentes: Demanda[],
): { ok: true; demanda: Demanda } | { ok: false; erro: string } {
  if (!draft.descricao.trim()) return { ok: false, erro: 'Informe a descrição da demanda.' }
  if (!draft.tipo) return { ok: false, erro: 'Selecione o tipo da demanda (Consumo).' }
  if (draft.tipo === 'Suporte' && SUPORTE_BACKLOG_F3) {
    return {
      ok: false,
      erro: 'Suporte indisponível no momento. Use demanda de Consumo.',
    }
  }
  const dataEvento = draft.dataEvento || hojeIso().slice(0, 10)
  // Call Luis 17/09: solução e contrato OPCIONAIS — só a descrição é obrigatória.

  let produtoSolucao = draft.produtoSolucao.trim()
  let numeroContrato = draft.numeroContrato?.trim() || ''

  if (!produtoSolucao) {
    produtoSolucao = SOLUCAO_A_QUALIFICAR
  }

  if (produtoSolucao === SOLUCAO_OUTROS || produtoSolucao === SOLUCAO_A_QUALIFICAR) {
    // Mantém contrato só se o usuário informou explicitamente no draft.
    numeroContrato = draft.numeroContrato?.trim() || ''
  } else {
    const sol = solucaoNoCatalogo(produtoSolucao)
    if (!sol) return { ok: false, erro: 'Selecione uma solução válida do catálogo ou deixe em branco para a MTI qualificar.' }
    // Contrato derivado da solução, salvo se o draft já trouxe outro (requalificação futura).
    numeroContrato = draft.numeroContrato?.trim() || sol.numeroContrato
  }

  const temContrato = Boolean(numeroContrato)
  const contratoVinculo = temContrato ? contratoPorNumero(numeroContrato) : undefined

  const hoje = hojeIso()
  const openerCargo: CargoCliente | undefined =
    draft.origem === 'Cliente'
      ? draft.openerCargo ?? (draft.comoDemandante ? 'Demandante' : 'Gestor')
      : undefined
  const comoDemandante = openerCargo === 'Demandante' || draft.comoDemandante
  const precisaQualificar =
    produtoSolucao === SOLUCAO_OUTROS || produtoSolucao === SOLUCAO_A_QUALIFICAR
  const rota = roteamentoAutomaticoParceiro(
    precisaQualificar ? undefined : numeroContrato || undefined,
    precisaQualificar ? SOLUCAO_OUTROS : produtoSolucao,
  )

  /**
   * Toda abertura segue para autorização paralela gestor + fiscal (antes da MTI).
   * Gestor e fiscal sempre existem no vínculo; parceiro só após qualificação MTI.
   */
  let authGestor: RegistroAuthN2 | undefined
  let authFiscal: RegistroAuthN2 | undefined
  let statusInicial: StatusDemanda
  let parceiroJa: boolean
  let qualificadoJa: boolean
  let exigeAuthContratanteFlag = false

  if (draft.origem === 'Cliente' || draft.origem === 'Parceiro') {
    if (openerCargo === 'Gestor') {
      authGestor = { decisao: 'aprovar', em: hoje, quem: USUARIO_LOGADO }
    } else if (openerCargo === 'Fiscal') {
      authFiscal = { decisao: 'aprovar', em: hoje, quem: USUARIO_LOGADO }
    }
    statusInicial = 'Aguardando gestor'
    parceiroJa = false
    qualificadoJa = false
    exigeAuthContratanteFlag = true
  } else if (draft.tipo === 'Consumo') {
    statusInicial = 'Aguardando gestor'
    parceiroJa = false
    qualificadoJa = false
    exigeAuthContratanteFlag = true
  } else {
    statusInicial = rota.notificarParceiro
      ? 'Aguardando parceiro'
      : 'Aguardando pré-análise MTI'
    parceiroJa = rota.notificarParceiro
    qualificadoJa = rota.notificarParceiro
  }

  const suporteAbertura =
    draft.tipo === 'Suporte'
      ? montarSuporteNaAbertura(produtoSolucao, draft.descricao.trim())
      : null

  const detalheRota = exigeAuthContratanteFlag
    ? authGestor || authFiscal
      ? `${openerCargo} já registrou aprovação do próprio papel · aguarda o outro`
      : 'Aguarda autorização de gestor e fiscal (antes da MTI)'
    : precisaQualificar
      ? temContrato
        ? `Contrato ${numeroContrato} informado · após N2 a MTI qualifica o produto`
        : 'Abertura só com descrição — após N2 a MTI qualifica contrato/produto'
      : draft.tipo === 'Suporte' && suporteAbertura
        ? `Suporte → grupos: ${suporteAbertura.suporteGrupos?.join(', ')} · ${suporteAbertura.suporteCriterioDistribuicao}`
        : 'Aguarda autorização de gestor e fiscal'

  const metricaInferida: MetricaContrato | undefined = contratoVinculo
    ? undefined // preenchido na qualificação MTI / via contrato
    : undefined

  const orgResp = responsavelDaOrgCliente(CLIENTE_PORTAL)
  const opener = draft.responsavelAbertura.trim() || USUARIO_LOGADO
  const openerDemo = contatoPessoaDemo(opener)
  const secDemo = contatoPessoaDemo(draft.contatoSecundario.trim())

  const demanda: Demanda = {
    id: crypto.randomUUID(),
    numero: nextNumeroDemanda(existentes),
    status: statusInicial,
    clienteSolicitante: CLIENTE_PORTAL,
    descricao: draft.descricao.trim(),
    tipo: draft.tipo,
    produtoSolucao,
    numeroContrato: temContrato ? numeroContrato : undefined,
    origem: draft.origem,
    contatoCliente: opener,
    contatoCpf: draft.contatoCpf.trim() || undefined,
    contatoEmail: draft.contatoEmail.trim() || openerDemo?.email || undefined,
    contatoSecundario: draft.contatoSecundario.trim() || undefined,
    contatoSecundarioCargo: secDemo?.cargo,
    contatoSecundarioEmail: secDemo?.email,
    contatoSecundarioNumero: secDemo?.telefone,
    contatoNumero: draft.contatoNumero.trim() || openerDemo?.telefone || CONTATO_NUMERO_LOGADO,
    contatoCargo: openerDemo?.cargo || openerCargo || undefined,
    responsavelOrg: orgResp?.nome,
    responsavelOrgCargo: orgResp?.cargo,
    responsavelOrgEmail: orgResp?.email,
    responsavelOrgNumero: orgResp?.telefone,
    dataEvento,
    anexos: draft.anexos.map((a, i) => ({
      id: `up-${i}-${Date.now()}`,
      nome: a.nome,
      tamanhoKb: a.tamanhoKb,
    })),
    criadoEm: hoje,
    atualizadoEm: hoje,
    observacoes: draft.observacoes.trim() || undefined,
    parceiroNotificado: parceiroJa,
    parceiroNotificadoEm: parceiroJa ? hoje : undefined,
    qualificado: qualificadoJa,
    qualificadoEm: qualificadoJa ? hoje : undefined,
    parceiroNome: rota.parceiroNome,
    slaInicio: hoje,
    slaPrazoDeclarado: draft.tipo === 'Suporte' ? '24 horas' : 'Conforme contrato/OS',
    slaStatus: 'No prazo',
    slaExecucaoStatus: 'Não iniciado',
    contratoNatureza: temContrato ? 'Próprio do cliente' : 'Sem contrato',
    metricaContrato: metricaInferida,
    catalogoVersaoVigente: undefined,
    homologacaoStatus: 'Não iniciado',
    exigeAuthContratante: exigeAuthContratanteFlag || undefined,
    authGestor,
    authFiscal,
    saudeAckRegistrado: undefined,
    saudeAckEm: undefined,
    regraFila: regraFilaPorDemanda({
      tipo: draft.tipo,
      parceiroNotificado: parceiroJa,
    }),
    gerenteParceria: rota.notificarParceiro ? 'Carlos Gerente Parceria' : undefined,
    responsavelTitular: rota.notificarParceiro
      ? 'Ana Titular Atendimento'
      : draft.tipo === 'Suporte'
        ? undefined
        : 'Ana Titular Atendimento',
    substituto1: 'Pedro Equipe',
    substituto2: 'Carlos Gerente Parceria',
    ...(draft.tipo === 'Suporte' ? suporteAbertura : { suporte24x7: false }),
    serviceNowStatus: 'Não enviado',
    raerStatus: 'Não iniciado',
    historico: [
      {
        id: `h-${Date.now()}`,
        em: new Date().toISOString(),
        por: USUARIO_LOGADO,
        perfil: draft.origem === 'MTI' ? 'MTI' : draft.origem === 'Parceiro' ? 'Parceiro' : 'Cliente',
        cargo: openerCargo ?? (draft.origem === 'Cliente' ? 'Gestor' : undefined),
        acao: 'Registrou demanda',
        detalhe: [
          `Tipo: ${draft.tipo}`,
          `SLA iniciado em ${hoje}`,
          detalheRota,
          contratoVinculo && avaliarSaudeContrato(contratoVinculo).status !== 'Saudável'
            ? `Alerta saúde: ${avaliarSaudeContrato(contratoVinculo).status}`
            : null,
        ]
          .filter(Boolean)
          .join(' · '),
      },
    ],
  }
  return { ok: true, demanda }
}

/**
 * REAP — reaproveitar uma demanda (recusada / não autorizada / efetivada) como
 * NOVA demanda separada. Copia solução, contrato, descrição, anexos e observações;
 * gera novo número/SLA e passa pelo roteamento normal (N2 / EXC-CARG / MTI).
 * A demanda de origem permanece intacta (decisão 17/09).
 */
export function reaproveitarComoNova(
  origem: Demanda,
  existentes: Demanda[],
): { ok: true; demanda: Demanda } | { ok: false; erro: string } {
  const draft: DemandaFormDraft = {
    origem: origem.origem === 'MTI' ? 'Cliente' : origem.origem,
    tipo: origem.tipo,
    contatoSecundario: origem.contatoSecundario ?? '',
    dataEvento: hojeIso(),
    numeroContrato: origem.numeroContrato ?? '',
    produtoSolucao: origem.produtoSolucao,
    descricao: origem.descricao,
    observacoes: origem.observacoes ?? '',
    anexos: origem.anexos.map((a) => ({ nome: a.nome, tamanhoKb: a.tamanhoKb })),
    comoDemandante: false,
    // Ciência de saúde já registrada na origem — não rebloquear a cópia.
    saudeAckCritica: true,
  }
  const r = criarDemandaDeDraft(draft, existentes)
  if (!r.ok) return r
  const nova: Demanda = {
    ...r.demanda,
    historico: [
      {
        id: `h-reap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        em: new Date().toISOString(),
        por: USUARIO_LOGADO,
        perfil: r.demanda.origem,
        acao: `Aberta a partir da ${origem.numero} (reaproveitar dados) — instância separada`,
        detalhe: `Origem: ${origem.status}`,
      },
      ...r.demanda.historico,
    ],
  }
  return { ok: true, demanda: nova }
}

/**
 * Seed demo F3 — exatamente 1 demanda completa por status de `STATUS_DEMANDA`.
 * Compartilhada (localStorage) entre portal cliente e portal parceiro.
 * `parceiroNotificado: true` + EloGroup em todas para o parceiro ver o catálogo inteiro.
 */
function hist(
  id: string,
  em: string,
  por: string,
  perfil: PerfilDemo,
  acao: string,
  detalhe?: string,
  cargo?: CargoCliente,
): DemandaHistorico {
  return { id, em, por, perfil, acao, detalhe, cargo }
}

function seedBase(
  seq: number,
  status: StatusDemanda,
  descricao: string,
  extra: Partial<Demanda> & { historico: DemandaHistorico[] },
): Demanda {
  const n = String(1000 + seq).padStart(4, '0')
  const dia = String((seq % 20) + 1).padStart(2, '0')
  const criado = `2026-09-${dia}`
  const orgResp = responsavelDaOrgCliente(CLIENTE_PORTAL)
  const openerDemo = contatoPessoaDemo(USUARIO_LOGADO)
  const secDemo = contatoPessoaDemo('Ana Paula Ribeiro')
  const base: Demanda = {
    id: `dem-seed-${seq}`,
    numero: `DEM-2026-${n}`,
    nome: `Demanda demo ${n}`,
    status,
    clienteSolicitante: CLIENTE_PORTAL,
    descricao,
    tipo: 'Consumo',
    categoria: seq % 2 === 0 ? 'Operacional' : 'Estratégico',
    prioridade: (['Crítico', 'Alto', 'Moderado', 'Baixo', 'Planejado'] as const)[seq % 5],
    departamento: 'Gabinete da Diretoria de Relacionamento com o Cliente',
    unidadeNegocio: 'Unidade de Gestão de Parcerias e Novos Negócios',
    produtoSolucao: 'MTI Simplifica — Desburocratização',
    numeroContrato: 'CT-2025-0891',
    origem: 'Cliente',
    contatoCliente: USUARIO_LOGADO,
    contatoCpf: '123.456.789-09',
    contatoEmail: openerDemo?.email || 'lucas.costa@seplag.mt.gov.br',
    contatoNumero: openerDemo?.telefone || CONTATO_NUMERO_LOGADO,
    contatoCargo: openerDemo?.cargo || 'Demandante',
    contatoSecundario: 'Ana Paula Ribeiro',
    contatoSecundarioCargo: secDemo?.cargo,
    contatoSecundarioEmail: secDemo?.email,
    contatoSecundarioNumero: secDemo?.telefone,
    responsavelOrg: orgResp?.nome,
    responsavelOrgCargo: orgResp?.cargo,
    responsavelOrgEmail: orgResp?.email,
    responsavelOrgNumero: orgResp?.telefone,
    dataEvento: criado,
    anexos: [{ id: `an-${seq}`, nome: `oficio-demanda-${n}.pdf`, tamanhoKb: 180 + seq * 7 }],
    criadoEm: criado,
    atualizadoEm: `2026-09-21`,
    observacoes: `Exemplo completo · status «${status}» · demo (cliente + parceiro).`,
    parceiroNotificado: true,
    parceiroNotificadoEm: criado,
    qualificado: true,
    qualificadoEm: criado,
    parceiroNome: 'EloGroup',
    regraFila: 'Parceiro notificado · fila parceria',
    gerenteParceria: 'Carlos Gerente Parceria',
    responsavelTitular: 'Ana Titular Atendimento',
    substituto1: 'Pedro Equipe',
    substituto2: 'Carlos Gerente Parceria',
    modalidadeParceria: 'Individual',
    slaInicio: criado,
    slaPrazoDeclarado: 'Conforme contrato/OS',
    slaStatus: 'No prazo',
    slaExecucaoStatus: 'Não iniciado',
    serviceNowStatus: 'Não enviado',
    raerStatus: 'Não iniciado',
    homologacaoStatus: 'Não iniciado',
    contratoNatureza: 'Próprio do cliente',
    metricaContrato: 'Serviço',
    catalogoVersaoVigente: 'v4.0',
    tipoAnalise: 'Serviço',
    tipoOs: 'Dedicada',
    exigeAuthContratante: true,
    ...extra,
  }
  return {
    ...base,
    parceiroNotificadoEm: base.parceiroNotificado
      ? base.parceiroNotificadoEm || criado
      : undefined,
    qualificadoEm: base.qualificado ? base.qualificadoEm || criado : undefined,
  }
}

export const DEMANDAS_INICIAIS: Demanda[] = [
  seedBase(1, 'Aguardando cadastro gestor/fiscal',
    'Ampliação de licenças Simplifica — vínculo sem gestor/fiscal cadastrados.',
    {
      numeroContrato: 'CT-2025-0891',
      produtoSolucao: 'MTI Simplifica — Desburocratização',
      exigeAuthContratante: false,
      qualificado: false,
      historico: [
        hist('s1-a', '2026-09-01T09:00:00', USUARIO_LOGADO, 'Cliente', 'Registrou demanda',
          'Aguarda cadastro de gestor e fiscal', 'Demandante'),
      ],
    }),
  seedBase(2, 'Aguardando gestor',
    'Expansão de créditos HOST — aguarda autorização paralela gestor e fiscal.',
    {
      numeroContrato: '001/2026/FIPLAN',
      produtoSolucao: 'MTI HOST',
      parceiroNome: 'EloGroup',
      metricaContrato: 'Serviço',
      historico: [
        hist('s2-a', '2026-09-02T09:10:00', USUARIO_LOGADO, 'Cliente', 'Registrou demanda',
          'SLA iniciado · encaminhada à autorização', 'Demandante'),
        hist('s2-b', '2026-09-02T09:12:00', 'Sistema Atlas', 'MTI', 'Abriu fila de autorização',
          'Aguarda gestor e fiscal do contratante'),
      ],
    }),
  seedBase(3, 'Aguardando pré-análise MTI',
    'Consumo DevSec.Gov — autorização aprovada; fila de pré-análise MTI.',
    {
      numeroContrato: '001/2026/FIPLAN',
      produtoSolucao: 'MTI DevSec.Gov/FIPLAN',
      tipoAnalise: 'Licenciamento',
      metricaContrato: 'Licenciamento',
      authGestor: { decisao: 'aprovar', em: '2026-09-03T10:00:00', quem: 'Gestor SEPLAG' },
      authFiscal: { decisao: 'aprovar', em: '2026-09-03T10:15:00', quem: 'Fiscal SEPLAG' },
      historico: [
        hist('s3-a', '2026-09-03T09:00:00', USUARIO_LOGADO, 'Cliente', 'Registrou demanda', undefined, 'Demandante'),
        hist('s3-b', '2026-09-03T10:00:00', 'Gestor SEPLAG', 'Cliente', 'Aprovou', undefined, 'Gestor'),
        hist('s3-c', '2026-09-03T10:15:00', 'Fiscal SEPLAG', 'Cliente', 'Aprovou', undefined, 'Fiscal'),
      ],
    }),
  seedBase(4, 'Aguardando análise',
    'Abertura só com descrição — produto a qualificar pela MTI.',
    {
      produtoSolucao: SOLUCAO_A_QUALIFICAR,
      numeroContrato: undefined,
      qualificado: false,
      contratoNatureza: 'Sem contrato',
      historico: [
        hist('s4-a', '2026-09-04T08:30:00', USUARIO_LOGADO, 'Cliente', 'Registrou demanda',
          'Só descrição · MTI qualifica contrato/produto', 'Demandante'),
        hist('s4-b', '2026-09-04T11:00:00', 'Gestor SEPLAG', 'Cliente', 'Aprovou', undefined, 'Gestor'),
        hist('s4-c', '2026-09-04T11:20:00', 'Fiscal SEPLAG', 'Cliente', 'Aprovou', undefined, 'Fiscal'),
      ],
    }),
  seedBase(5, 'Aguardando parceiro',
    'MTI qualificou e notificou EloGroup — aguarda início da análise do parceiro.',
    {
      numeroContrato: 'CT-2025-0891',
      produtoSolucao: 'MTI Simplifica — Desburocratização',
      historico: [
        hist('s5-a', '2026-09-05T09:00:00', USUARIO_LOGADO, 'Cliente', 'Registrou demanda', undefined, 'Demandante'),
        hist('s5-b', '2026-09-05T14:00:00', 'Analista MTI', 'MTI', 'Qualificou demanda',
          'Parceiro EloGroup notificado'),
      ],
    }),
  seedBase(6, 'Em análise',
    'Parceiro iniciou análise propositiva — composição de atendimento em andamento.',
    {
      numeroContrato: 'CT-2026-0142',
      produtoSolucao: 'DevSec.Gov — Governança de riscos',
      tipoAnalise: 'Licenciamento',
      metricaContrato: 'Licenciamento',
      historico: [
        hist('s6-a', '2026-09-06T09:00:00', USUARIO_LOGADO, 'Cliente', 'Registrou demanda', undefined, 'Demandante'),
        hist('s6-b', '2026-09-06T15:00:00', 'Analista EloGroup', 'Parceiro', 'Iniciou análise',
          'Modo propositivo · parecer em elaboração'),
      ],
    }),
  seedBase(7, 'Proposta parceiro · aguardando MTI',
    'Parceiro enviou parecer/proposta — MTI delibera o encaminhamento.',
    {
      numeroContrato: 'CT-2025-0891',
      produtoSolucao: 'MTI Simplifica — Desburocratização',
      descricaoAtendimento: 'Pacote discovery + 2 licenças anuais Simplifica.',
      historico: [
        hist('s7-a', '2026-09-07T10:00:00', 'Analista EloGroup', 'Parceiro', 'Enviou parecer à MTI',
          'Proposta de atendimento anexada'),
      ],
    }),
  seedBase(8, 'Aguardando assinatura do atendimento',
    'Via contrato detalhada — aguarda assinaturas gestor, fiscal e solicitante.',
    {
      numeroContrato: '001/2026/FIPLAN',
      produtoSolucao: 'MTI HOST',
      catalogos: 'Catálogo Cloud IaaS; Catálogo Backup',
      itensCatalogo: 'VM 4vCPU · Storage 200GB · Backup diário',
      descricaoAtendimento: 'Provisionar VM e backup conforme ofício SEPLAG.',
      necAtendimento: 'Ampliar capacidade sob saldo contratual vigente.',
      valoresContrato: 'Consumo catálogo · sem aditivo',
      caminhoComercial: 'via_contrato',
      assinaturaGestor: false,
      assinaturaFiscal: false,
      assinaturaSolicitante: false,
      historico: [
        hist('s8-a', '2026-09-08T11:00:00', 'Analista MTI', 'MTI', 'Via contrato · detalhou atendimento',
          'Encaminhou para assinaturas do contratante'),
      ],
    }),
  seedBase(80, 'Aguardando autorização patrocinador',
    'Cobertura por contrato de gestão — aguarda autorização do patrocinador (pós-qualificação).',
    {
      numeroContrato: 'CT-GESTÃO-2026-SEPLAG',
      produtoSolucao: 'MTI Simplifica — Desburocratização',
      contratoNatureza: 'Patrocinado (gestão)',
      caminhoComercial: 'via_contrato',
      catalogos: 'Catálogo Simplifica',
      itensCatalogo: 'Licenças anuais Simplifica',
      necAtendimento: 'Consumo sob contrato de gestão SEPLAG.',
      valoresContrato: 'Conforme catálogo gestão',
      patrocinioAutorizado: false,
      historico: [
        hist('s80-a', '2026-09-10T10:00:00', 'Analista MTI', 'MTI', 'Via contrato · cobertura patrocinada',
          'Aguarda autorização do patrocinador antes das assinaturas'),
      ],
    }),
  seedBase(9, 'Em atendimento · parceiro',
    'OS dedicada em execução pelo parceiro — sprints registradas no Atlas/SN.',
    {
      numeroContrato: 'CT-2025-0891',
      produtoSolucao: 'MTI Simplifica — Desburocratização',
      osVinculada: 'OS-DED-2026-1009',
      tipoOs: 'Dedicada',
      tipoAnalise: 'Serviço',
      executorTipo: 'Parceiro',
      parceiroIniciouAtendimento: true,
      slaExecucaoInicio: '2026-09-12',
      slaExecucaoStatus: 'Em execução',
      serviceNowStatus: 'Enviado · aprovada e em atendimento',
      serviceNowId: 'SN-PRJ-44102',
      serviceNowEm: '2026-09-12',
      historico: [
        hist('s9-a', '2026-09-12T09:00:00', 'Analista MTI', 'MTI', 'Autorizou OS → ServiceNow'),
        hist('s9-b', '2026-09-12T10:30:00', 'Analista EloGroup', 'Parceiro', 'Efetivou / iniciou atendimento',
          'Sprint 1 · histórias cadastradas'),
      ],
    }),
  seedBase(10, 'Aguardando validação MTI',
    'Parceiro declarou entrega — MTI analisa comprovações antes da homologação.',
    {
      numeroContrato: '001/2026/FIPLAN',
      produtoSolucao: 'MTI DevSec.Gov/FIPLAN',
      tipoAnalise: 'Licenciamento',
      metricaContrato: 'Licenciamento',
      osVinculada: 'OS-DED-2026-1010',
      parceiroIniciouAtendimento: true,
      credenciaisLicenca: '10 contas · domínio seplag.mt.gov.br',
      applianceLicenca: 'Tenant FIPLAN-PROD · appliance ativado',
      quantidadeExecutada: 10,
      entregavel: '10 contas liberadas · credenciais e appliance anexados',
      anexosComprovacao: [
        { id: 'ac-10', nome: 'comprovante-fabricante.pdf', tamanhoKb: 640 },
        { id: 'ac-10b', nome: 'lista-credenciais.xlsx', tamanhoKb: 88 },
      ],
      comprovacaoFabricanteAnexos: [
        { id: 'ac-10', nome: 'comprovante-fabricante.pdf', tamanhoKb: 640 },
      ],
      executorTipo: 'Parceiro',
      slaExecucaoStatus: 'No prazo',
      serviceNowStatus: 'Enviado · aprovada e em atendimento',
      serviceNowId: 'SN-INC-55210',
      historico: [
        hist('s10-a', '2026-09-15T16:00:00', 'Analista EloGroup', 'Parceiro', 'Declarou atendida',
          'Licenciamento · credenciais/appliance · aguarda validação MTI'),
      ],
    }),
  seedBase(11, 'Devolvida para correção',
    'MTI devolveu para o solicitante ajustar descrição e anexos (mesma demanda · SLA não reinicia).',
    {
      numeroContrato: 'CT-2026-0142',
      produtoSolucao: 'MTI CLOUD — Serviços em nuvem',
      parceiroNome: 'Parceiro Cloud MT',
      motivoUltimaAcao: 'Informar quantitativo de vCPU e anexo do ofício original.',
      anexos: [],
      historico: [
        hist('s11-a', '2026-09-10T09:00:00', USUARIO_LOGADO, 'Cliente', 'Registrou demanda', undefined, 'Demandante'),
        hist('s11-b', '2026-09-14T11:00:00', 'Analista MTI', 'MTI', 'Devolveu para correção',
          'Informar quantitativo de vCPU e anexo do ofício original.'),
      ],
    }),
  seedBase(12, 'Aguardando autorização',
    'Orçamento aceito pelo cliente — aguarda autorização/geração da OS.',
    {
      numeroContrato: 'CT-2025-0891',
      produtoSolucao: 'MTI Simplifica — Desburocratização',
      caminhoComercial: 'orcamento',
      orcamentoAssinadoCliente: true,
      orcamentoAssinadoGerenteArea: true,
      quantitativosConferidos: true,
      slaPrazoAssinaturaOrcamento: 'Até 2026-10-15',
      orcamento: {
        numero: 'ORC-2026-1012',
        status: 'Aceito',
        enviadoEm: '2026-09-13',
        validade: '2026-10-15',
        observacoes: 'Catálogo v4.0 · aceito pelo gestor SEPLAG.',
        itens: [
          { id: 'oi12a', descricao: 'Licença Simplifica — pacote anual', quantidade: 2, valorUnitario: 42000, catalogoVersao: 'v4.0' },
          { id: 'oi12b', descricao: 'Discovery — imersão e personas', quantidade: 5, valorUnitario: 3791.4, catalogoVersao: 'v4.0' },
        ],
      },
      historico: [
        hist('s12-a', '2026-09-13T10:00:00', 'Analista EloGroup', 'Parceiro', 'Enviou orçamento', 'ORC-2026-1012'),
        hist('s12-b', '2026-09-14T09:30:00', USUARIO_LOGADO, 'Cliente', 'Aceitou orçamento',
          'Pronto para autorizar OS', 'Gestor'),
      ],
    }),
  seedBase(13, 'Em orçamento',
    'Saldo insuficiente no contrato — MTI/parceiro montando orçamento complementar.',
    {
      numeroContrato: '001/2026/FIPLAN',
      produtoSolucao: 'MTI HOST',
      caminhoComercial: 'orcamento',
      slaPrazoAssinaturaOrcamento: 'Conforme validade do orçamento',
      orcamentoAssinadoVendas: false,
      orcamentoAssinadoParceiro: false,
      orcamento: {
        numero: 'ORC-2026-1013',
        status: 'Aguardando assinaturas',
        enviadoEm: '2026-09-12',
        observacoes: 'Itens fora do provisionado · aguarda assinatura Vendas e Parceiro.',
        itens: [
          { id: 'oi13a', descricao: 'UST adicional — sustentação', quantidade: 80, valorUnitario: 185, catalogoVersao: 'v3.2' },
        ],
      },
      historico: [
        hist('s13-a', '2026-09-11T09:30:00', 'Analista MTI', 'MTI', 'Iniciou caminho orçamento',
          'Sem cobertura parcial no saldo'),
        hist('s13-b', '2026-09-12T14:00:00', 'Analista EloGroup', 'Parceiro', 'Enviou composição para assinaturas',
          'ORC-2026-1013'),
      ],
    }),
  seedBase(14, 'Aguardando assinatura OS (gerente operação)',
    'OS nova gerada a partir do orçamento — aguarda assinatura do gerente de operação.',
    {
      numeroContrato: 'CT-2025-0891',
      produtoSolucao: 'MTI Simplifica — Desburocratização',
      osVinculada: 'OS-NEW-2026-1014',
      tipoOs: 'Global',
      caminhoComercial: 'orcamento',
      orcamentoAssinadoCliente: true,
      osAssinadaGerenteOperacao: false,
      orcamento: {
        numero: 'ORC-2026-1014',
        status: 'Aceito',
        enviadoEm: '2026-09-10',
        validade: '2026-10-10',
        itens: [
          { id: 'oi14a', descricao: 'Pacote Simplifica guarda-chuva', quantidade: 1, valorUnitario: 95000, catalogoVersao: 'v4.0' },
        ],
      },
      historico: [
        hist('s14-a', '2026-09-16T10:00:00', 'Analista MTI', 'MTI', 'Gerou OS nova',
          'Aguarda assinatura gerente de operação'),
      ],
    }),
  seedBase(15, 'Em homologação',
    'Entrega validada pela MTI — termo em elaboração com RAER.',
    {
      numeroContrato: 'CT-2026-0142',
      produtoSolucao: 'DevSec.Gov — Governança de riscos',
      tipoAnalise: 'Licenciamento',
      metricaContrato: 'Licenciamento',
      osVinculada: 'OS-DED-2026-1015',
      entregavel: 'Matriz de riscos e controles entregues',
      homologacaoStatus: 'Em elaboração',
      raerStatus: 'Em elaboração',
      executorTipo: 'Parceiro',
      serviceNowStatus: 'Enviado · aprovada e em atendimento',
      serviceNowId: 'SN-PRJ-66115',
      slaExecucaoStatus: 'No prazo',
      historico: [
        hist('s15-a', '2026-09-17T11:00:00', 'Analista MTI', 'MTI', 'Validou entrega · abriu homologação'),
      ],
    }),
  seedBase(16, 'Aguardando assinatura do termo',
    'Termo + RAER prontos — aguarda assinaturas gestor, fiscal e solicitante.',
    {
      numeroContrato: 'CT-2026-0142',
      produtoSolucao: 'MTI CLOUD — Serviços em nuvem',
      parceiroNome: 'Parceiro Cloud MT',
      osVinculada: 'OS-2026-1016',
      tipoOs: 'Global',
      entregavel: 'Itens OS atestados · consumo 2.200 de 2.447 UST',
      homologacaoStatus: 'Aguardando assinatura',
      raerStatus: 'Vinculado ao termo',
      termoAssinaturaGestor: false,
      termoAssinaturaFiscal: false,
      termoAssinaturaSolicitante: false,
      serviceNowStatus: 'Enviado · aprovada e em atendimento',
      serviceNowId: 'SN-INC-88421',
      serviceNowEm: '2026-09-01',
      slaExecucaoStatus: 'No prazo',
      historico: [
        hist('s16-a', '2026-09-18T12:00:00', 'Analista MTI', 'MTI', 'Encerrou atendimento · termo + RAER',
          'Encaminhou para assinaturas do contratante'),
      ],
    }),
  seedBase(17, 'Dilatação de prazo',
    'Prazo de execução — aguarda aceite tripartite Cliente + MTI + Parceiro.',
    {
      numeroContrato: 'CT-2025-0891',
      produtoSolucao: 'MTI Simplifica — Desburocratização',
      osVinculada: 'OS-DED-2026-1017',
      slaStatus: 'Dilatado',
      slaExecucaoStatus: 'Dilatado',
      slaExecucaoInicio: '2026-09-05',
      serviceNowStatus: 'Enviado · aprovada e em atendimento',
      serviceNowId: 'SN-PRJ-77117',
      dilacaoNovoPrazo: '2026-10-15',
      dilacaoMotivo: 'Dependência de ambiente do cliente',
      dilacaoSolicitadaPor: 'Parceiro',
      dilacaoAckCliente: false,
      dilacaoAckMti: false,
      dilacaoAckParceiro: true,
      historico: [
        hist('s17-a', '2026-09-18T09:00:00', 'Analista EloGroup', 'Parceiro', 'Solicitou dilação',
          '+10 dias úteis · dependência de ambiente do cliente'),
      ],
    }),
  seedBase(18, 'Recusada',
    'Demanda recusada na qualificação MTI — fora do objeto contratual. Solicitante pode abrir nova com estes dados.',
    {
      produtoSolucao: SOLUCAO_A_QUALIFICAR,
      numeroContrato: undefined,
      motivoUltimaAcao: 'Fora do objeto contratual vigente.',
      contratoNatureza: 'Sem contrato',
      slaFinalizacao: '2026-09-12',
      historico: [
        hist('s18-a', '2026-09-08T09:00:00', USUARIO_LOGADO, 'Cliente', 'Registrou demanda', undefined, 'Demandante'),
        hist('s18-b', '2026-09-12T11:00:00', 'Analista MTI', 'MTI', 'Recusou demanda',
          'Fora do objeto contratual vigente. · reaproveitamento disponível'),
      ],
    }),
  seedBase(19, 'Não autorizada',
    'Recusada na autorização pelo fiscal — instância não autorizada; reaproveitar ou restituir.',
    {
      numeroContrato: '001/2026/FIPLAN',
      produtoSolucao: 'MTI HOST',
      motivoUltimaAcao: 'Fiscal: demanda sem alinhamento com o plano de consumo do órgão.',
      slaFinalizacao: '2026-09-09',
      authGestor: { decisao: 'aprovar', em: '2026-09-09T10:00:00', quem: 'Gestor SEPLAG' },
      authFiscal: {
        decisao: 'recusar',
        em: '2026-09-09T11:00:00',
        quem: 'Fiscal SEPLAG',
        motivo: 'Sem alinhamento com o plano de consumo do órgão.',
      },
      historico: [
        hist('s19-a', '2026-09-09T09:00:00', USUARIO_LOGADO, 'Cliente', 'Registrou demanda', undefined, 'Demandante'),
        hist('s19-b', '2026-09-09T10:00:00', 'Gestor SEPLAG', 'Cliente', 'Aprovou', undefined, 'Gestor'),
        hist('s19-c', '2026-09-09T11:00:00', 'Fiscal SEPLAG', 'Cliente', 'Recusou',
          'Sem alinhamento com o plano de consumo · restituir ou reaproveitar', 'Fiscal'),
      ],
    }),
  seedBase(20, 'Efetivado · entregue',
    'Termo assinado — demanda concluída. Medição/PV na fronteira P08.',
    {
      numeroContrato: 'CT-2026-0142',
      produtoSolucao: 'MTI CLOUD — Serviços em nuvem',
      parceiroNome: 'Parceiro Cloud MT',
      osVinculada: 'OS-2026-1020',
      tipoOs: 'Global',
      entregavel: 'Consumo homologado · 2.447 UST',
      homologacaoStatus: 'Assinado',
      raerStatus: 'Concluído',
      termoAssinaturaGestor: true,
      termoAssinaturaFiscal: true,
      termoAssinaturaSolicitante: true,
      termoRecusado: false,
      serviceNowStatus: 'Enviado · aprovada e em atendimento',
      serviceNowId: 'SN-INC-90220',
      slaExecucaoStatus: 'No prazo',
      slaExecucaoInicio: '2026-09-10',
      slaFinalizacao: '2026-09-19',
      historico: [
        hist('s20-a', '2026-09-19T10:00:00', 'Gestor SEPLAG', 'Cliente', 'Assinou termo', undefined, 'Gestor'),
        hist('s20-b', '2026-09-19T10:20:00', 'Fiscal SEPLAG', 'Cliente', 'Assinou termo', undefined, 'Fiscal'),
        hist('s20-c', '2026-09-19T10:40:00', USUARIO_LOGADO, 'Cliente', 'Assinou termo',
          'Demanda efetivada · entregue', 'Demandante'),
      ],
    }),
  seedBase(21, 'Aprovada · em atendimento',
    'OS global autorizada — execução em andamento (Atlas → ServiceNow).',
    {
      numeroContrato: 'CT-2025-0891',
      produtoSolucao: 'MTI Simplifica — Desburocratização',
      osVinculada: 'OS-GLB-2026-1021',
      tipoOs: 'Global',
      executorTipo: 'Parceiro',
      assinaturaGestor: true,
      assinaturaFiscal: true,
      assinaturaSolicitante: true,
      slaExecucaoInicio: '2026-09-15',
      slaExecucaoStatus: 'Em execução',
      serviceNowStatus: 'Aguardando autorização de execução',
      saudeAckRegistrado: undefined,
      saudeAckEm: undefined,
      historico: [
        hist(
          's21-a',
          '2026-09-14T16:00:00',
          USUARIO_LOGADO,
          'Cliente',
          'Abriu demanda',
          'Alerta saúde: Crítico (OS emitidas + projeção)',
          'Gestor',
        ),
        hist('s21-b', '2026-09-15T09:00:00', 'Analista MTI', 'MTI', 'OS autorizada · em atendimento',
          'Aguarda push ServiceNow'),
      ],
    }),
  seedBase(22, 'Sem cobertura · definir pagamento',
    'Sem saldo/contrato aplicável — cliente deve escolher indenização, nova contratação ou desistência.',
    {
      produtoSolucao: SOLUCAO_A_QUALIFICAR,
      numeroContrato: undefined,
      contratoNatureza: 'Sem contrato',
      caminhoComercial: 'sem_cobertura',
      definirPagamento: 'Ainda não definido',
      historico: [
        hist('s22-a', '2026-09-16T09:00:00', USUARIO_LOGADO, 'Cliente', 'Registrou demanda',
          'Sem contrato informado', 'Demandante'),
        hist('s22-b', '2026-09-17T14:00:00', 'Analista MTI', 'MTI', 'Sem cobertura contratual',
          'Aguarda definição: indenização · nova contratação · desistência'),
      ],
    }),
]

/** Garante cobertura: uma seed por status do enum. */
void (function assertSeedPorStatus() {
  const covered = new Set(DEMANDAS_INICIAIS.map((d) => d.status))
  const missing = STATUS_DEMANDA.filter((s) => !covered.has(s))
  if (missing.length && typeof console !== 'undefined') {
    console.warn('[DEMANDAS_INICIAIS] status sem seed:', missing.join(', '))
  }
})()

/** Orçamentos aceitos prontos para gerar OS (PDF PEAP F3). */
export function demandaParaSolicitacaoPortal(d: Demanda): {
  id: string
  tipo: 'Demanda'
  nome: string
  status: 'Pendente' | 'Em análise' | 'Aprovado' | 'Recusado' | 'Em execução'
  situacao: 'Ativa' | 'Encerrada'
  atualizadoEm: string
} {
  const statusMap: Partial<
    Record<StatusDemanda, 'Pendente' | 'Em análise' | 'Aprovado' | 'Recusado' | 'Em execução'>
  > = {
    'Aguardando cadastro gestor/fiscal': 'Pendente',
    'Aguardando gestor': 'Pendente',
    'Aguardando pré-análise MTI': 'Pendente',
    'Aguardando análise': 'Pendente',
    'Aguardando parceiro': 'Pendente',
    'Em análise': 'Em análise',
    'Aguardando assinatura do atendimento': 'Pendente',
    'Em atendimento · parceiro': 'Em execução',
    'Aguardando validação MTI': 'Em análise',
    'Devolvida para correção': 'Pendente',
    'Aguardando autorização': 'Pendente',
    'Em orçamento': 'Em análise',
    'Aguardando assinatura OS (gerente operação)': 'Pendente',
    'Em homologação': 'Em análise',
    'Aguardando assinatura do termo': 'Pendente',
    'Dilatação de prazo': 'Em análise',
    Recusada: 'Recusado',
    'Não autorizada': 'Recusado',
    'Efetivado · entregue': 'Aprovado',
    'Aprovada · em atendimento': 'Em execução',
  }
  const encerrada = d.status === 'Recusada' || d.status === 'Não autorizada' || d.status === 'Efetivado · entregue'
  return {
    id: d.id,
    tipo: 'Demanda',
    nome: `${d.numero} — ${d.descricao.slice(0, 56)}`,
    status: statusMap[d.status] ?? 'Pendente',
    situacao: encerrada ? 'Encerrada' : 'Ativa',
    atualizadoEm: d.atualizadoEm.slice(0, 10),
  }
}

export function demandaParaPainel(d: Demanda): {
  id: string
  protocolo: string
  titulo: string
  status: 'Em andamento' | 'Concluído' | 'Aguardando'
  situacao:
    | 'Em análise'
    | 'Solicitação concluída'
    | 'Aguardando resposta do solicitante'
    | 'Aguardando análise'
  solicitadoEm: string
  atualizadoEm: string
  criadoEm: string
  etapaProcesso: 'Novo' | 'Em andamento' | 'Encerrado'
  historico: { autor: string; data: string; mensagem: string }[]
} {
  const aguardandoCliente =
    d.status === 'Devolvida para correção' || d.status === 'Aguardando autorização'
  const concluido =
    d.status === 'Recusada' ||
    d.status === 'Não autorizada' ||
    d.status === 'Aprovada · em atendimento'
  return {
    id: `dem-painel-${d.id}`,
    protocolo: d.numero.replace('DEM-', ''),
    titulo: `Demanda ${d.numero} — ${d.tipo} · ${d.produtoSolucao}`,
    status: concluido ? 'Concluído' : aguardandoCliente ? 'Aguardando' : 'Em andamento',
    situacao: aguardandoCliente
      ? 'Aguardando resposta do solicitante'
      : concluido
        ? 'Solicitação concluída'
        : d.status === 'Aguardando análise' ||
            d.status === 'Aguardando gestor' ||
            d.status === 'Aguardando cadastro gestor/fiscal'
          ? 'Aguardando análise'
          : 'Em análise',
    solicitadoEm: d.criadoEm.slice(0, 10),
    atualizadoEm: d.atualizadoEm.includes('T') ? d.atualizadoEm : `${d.atualizadoEm}T12:00:00`,
    criadoEm: d.criadoEm.includes('T') ? d.criadoEm : `${d.criadoEm}T09:00:00`,
    etapaProcesso: concluido ? 'Encerrado' : 'Em andamento',
    historico: d.historico.slice(0, 4).map((h) => ({
      autor: h.por,
      data: h.em,
      mensagem: h.detalhe ? `${h.acao}: ${h.detalhe}` : h.acao,
    })),
  }
}

/** Orçamentos aceitos prontos para gerar OS (PDF PEAP F3). */
export function orcamentosAceitosParaOs(demandas: Demanda[] = DEMANDAS_INICIAIS): {
  demandaNumero: string
  orcamentoNumero: string
  contrato?: string
  catalogoVersao: string
  descricao: string
  valorTotal: number
}[] {
  return demandas
    .filter((d) => d.orcamento?.status === 'Aceito')
    .map((d) => {
      const itens = d.orcamento!.itens
      const versao = itens[0]?.catalogoVersao ?? 'v1.0'
      const valorTotal = itens.reduce((a, i) => a + i.quantidade * i.valorUnitario, 0)
      return {
        demandaNumero: d.numero,
        orcamentoNumero: d.orcamento!.numero,
        contrato: d.numeroContrato,
        catalogoVersao: versao,
        descricao: d.descricao,
        valorTotal,
      }
    })
}

