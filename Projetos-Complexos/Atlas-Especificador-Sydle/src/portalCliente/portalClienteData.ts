/** Dados mock e tipos — Portal do Cliente Atlas (fontes: Modelagem 22/05, 26/05; PEAP F3 iv.1). */

export type CatalogoOrigem = 'Produtos vigentes' | 'Licenças comerciais' | 'Serviços comerciais'

export type StatusContratoItem = 'contratado' | 'ausente' | 'parcial'

export interface CatalogoItem {
  id: string
  codigoAtlas: string
  descricao: string
  solucao: string
  origem: CatalogoOrigem
  valorUnitario: number
  versaoCatalogo: string
  ambiente: 'Produção' | 'Homologação'
  statusNoContrato: StatusContratoItem
  quantidadeContratada?: number
  quantidadeConsumida?: number
  /** Atributos DIRC / PDF F3 — exibidos no catálogo do cliente. */
  periodoMinimo?: string
  grupoAtendimento?: string
  universal?: boolean
  individualizado?: boolean
  partNumber?: string
}

export interface ContratoCliente {
  id: string
  numero: string
  parceria: string
  vigenciaInicio: string
  vigenciaFim: string
  saldoTotal: number
  saldoConsumido: number
  /** Valor em OS abertas ainda não homologadas (fonte Demanda 20/07). */
  saldoProvisionado?: number
  /** Previsão de faturamento do mês seguinte. */
  previsaoFaturamento?: number
  /** Faturamento do mês anterior. */
  faturamentoMesAnterior?: number
  status: 'Vigente' | 'A vencer' | 'Encerrado'
  itensContratados: number
  /** Versão do catálogo apostilada no contrato (RN-VER-03 / RF-CLI-05). */
  versaoCatalogoApostilada: string
  /** Versão publicada pela MTI ainda sem apostila — cliente não consome. */
  versaoCatalogoPendente?: string
  /** Unidades/secretarias no mesmo contrato (RN-CLI-01/04 — cliente = PJ). */
  secretarias?: { id: string; nome: string; saldoAlocado: number; saldoConsumido: number }[]
}

export interface OrdemServico {
  id: string
  numero: string
  contrato: string
  catalogoVersao: string
  catalogoNome: string
  descricao: string
  status: 'Rascunho' | 'Em execução' | 'Aguardando assinatura' | 'Concluída'
  abertura: string
  valor: number
  /** PDF PEAP F3: OS independente ou a partir de orçamento. */
  origem?: 'Independente' | 'Orçamento'
  orcamentoRef?: string
  secretaria?: string
}

export interface CotacaoItem {
  id: string
  origem: CatalogoOrigem
  codigoAtlas: string
  descricao: string
  solucao: string
  quantidade: number
  valorUnitario: number
}

export interface Solicitacao {
  id: string
  tipo: 'Cotação' | 'Contrato' | 'OS' | 'Demanda' | 'Orçamento'
  nome: string
  status: 'Pendente' | 'Em análise' | 'Aprovado' | 'Recusado' | 'Em execução'
  situacao: 'Ativa' | 'Encerrada'
  atualizadoEm: string
}

export const SOLUCOES_COTACAO = [
  'MTI CLOUD — Prospecção de serviços em nuvem / 002/2026',
  'MTI Autonomy — Robotização e automação / 001/2026',
  'MTI DevSec.Gov — Governança de riscos / 003/2026',
  'MTI Simplifica — Desburocratização / 005/2026',
]

export const CATALOGO_MTI: CatalogoItem[] = [
  {
    id: 'c1',
    codigoAtlas: 'ATLAS-SRV-0012401',
    descricao: 'Treinamento técnico presencial — módulo introdutório cloud',
    solucao: 'MTI CLOUD',
    origem: 'Serviços comerciais',
    valorUnitario: 1250,
    versaoCatalogo: 'v3.2',
    ambiente: 'Produção',
    statusNoContrato: 'contratado',
    quantidadeContratada: 40,
    quantidadeConsumida: 8,
    periodoMinimo: '12 meses',
    grupoAtendimento: 'UG-CLOUD',
    universal: true,
    individualizado: false,
    partNumber: 'CLOUD-TRN-01',
  },
  {
    id: 'c2',
    codigoAtlas: 'ATLAS-LIC-001666G',
    descricao: 'EXECUÇÃO DE ANÁLISE DAST (Um par de Ciclos, Teste e Reteste)',
    solucao: 'MTI DevSec.Gov',
    origem: 'Licenças comerciais',
    valorUnitario: 60937.2,
    versaoCatalogo: 'v2.1',
    ambiente: 'Produção',
    statusNoContrato: 'contratado',
    quantidadeContratada: 4,
    quantidadeConsumida: 2,
    periodoMinimo: '12 meses',
    grupoAtendimento: 'UG-DEVSEC',
    universal: false,
    individualizado: true,
    partNumber: 'DEVSEC-DAST-01',
  },
  {
    id: 'c3',
    codigoAtlas: 'ATLAS-PRD-0010796',
    descricao: 'MTI Autonomy — Licenciamento de Solução de Robotização',
    solucao: 'MTI Autonomy',
    origem: 'Produtos vigentes',
    valorUnitario: 185000,
    versaoCatalogo: 'v1.8',
    ambiente: 'Produção',
    statusNoContrato: 'parcial',
    quantidadeContratada: 1,
    quantidadeConsumida: 0,
  },
  {
    id: 'c4',
    codigoAtlas: 'ATLAS-SRV-0045120',
    descricao: 'Modelagem As Is/To Be — complexidade média',
    solucao: 'MTI Autonomy',
    origem: 'Serviços comerciais',
    valorUnitario: 24525,
    versaoCatalogo: 'v1.8',
    ambiente: 'Produção',
    statusNoContrato: 'ausente',
  },
  {
    id: 'c5',
    codigoAtlas: 'ATLAS-LIC-002301A',
    descricao: 'Licença MTI Simplifica — pacote anual',
    solucao: 'MTI Simplifica',
    origem: 'Licenças comerciais',
    valorUnitario: 42000,
    versaoCatalogo: 'v4.0',
    ambiente: 'Produção',
    statusNoContrato: 'ausente',
  },
  {
    id: 'c6',
    codigoAtlas: 'ATLAS-SRV-0098712',
    descricao: 'Discovery — imersão em contexto e personas',
    solucao: 'MTI Simplifica',
    origem: 'Serviços comerciais',
    valorUnitario: 3791.4,
    versaoCatalogo: 'v4.0',
    ambiente: 'Produção',
    statusNoContrato: 'contratado',
    quantidadeContratada: 20,
    quantidadeConsumida: 12,
  },
  {
    id: 'c8',
    codigoAtlas: 'ATLAS-SRV-0033500',
    descricao: 'Workshop cloud avançado — módulo 2026 (nova versão)',
    solucao: 'MTI CLOUD',
    origem: 'Serviços comerciais',
    valorUnitario: 2100,
    versaoCatalogo: 'v3.5',
    ambiente: 'Produção',
    statusNoContrato: 'ausente',
  },
]

export const CONTRATOS_CLIENTE: ContratoCliente[] = [
  {
    id: 'ct1',
    numero: 'CT-2026-0142',
    parceria: 'MTI CLOUD + DevSec.Gov',
    vigenciaInicio: '2025-04-01',
    vigenciaFim: '2027-03-31',
    saldoTotal: 2400000,
    saldoConsumido: 876500,
    saldoProvisionado: 1680000,
    previsaoFaturamento: 185000,
    faturamentoMesAnterior: 142300,
    status: 'Vigente',
    itensContratados: 12,
    versaoCatalogoApostilada: 'v3.2',
    versaoCatalogoPendente: 'v3.5',
    secretarias: [
      { id: 'sec-seplag', nome: 'SEPLAG — Planejamento', saldoAlocado: 1400000, saldoConsumido: 520000 },
      { id: 'sec-saude', nome: 'SES — Saúde', saldoAlocado: 1000000, saldoConsumido: 356500 },
    ],
  },
  {
    id: 'ct2',
    numero: 'CT-2025-0891',
    parceria: 'MTI Simplifica',
    vigenciaInicio: '2024-06-01',
    vigenciaFim: '2026-05-31',
    saldoTotal: 580000,
    saldoConsumido: 412300,
    saldoProvisionado: 420000,
    previsaoFaturamento: 38000,
    faturamentoMesAnterior: 51200,
    status: 'A vencer',
    itensContratados: 6,
    versaoCatalogoApostilada: 'v4.0',
    secretarias: [
      { id: 'sec-seplag-2', nome: 'SEPLAG — Planejamento', saldoAlocado: 580000, saldoConsumido: 412300 },
    ],
  },
]

/** Eventos em tempo real para painel direito (fonte Demanda 20/07 — web system). */
export const EVENTOS_PORTAL = [
  { id: 'ev1', tipo: 'OS', texto: 'OS-2026-0045 — etapa de esteira concluída (62%)', quando: 'há 12 min' },
  { id: 'ev2', tipo: 'Demanda', texto: 'DEM-2026-0088 aguardando autorização do cliente', quando: 'há 1 h' },
  { id: 'ev3', tipo: 'Contrato', texto: 'CT-2026-0142 — previsão de faturamento atualizada', quando: 'hoje' },
] as const

export const ORDENS_SERVICO: OrdemServico[] = [
  {
    id: 'os1',
    numero: 'OS-2026-0045',
    contrato: 'CT-2026-0142',
    catalogoVersao: 'v3.2',
    catalogoNome: 'MTI CLOUD — Serviços',
    descricao: 'Treinamento técnico presencial (8 unidades)',
    status: 'Em execução',
    abertura: '2026-05-12',
    valor: 10000,
    origem: 'Orçamento',
    orcamentoRef: 'ORC-2026-0012',
    secretaria: 'SEPLAG — Planejamento',
  },
  {
    id: 'os2',
    numero: 'OS-2026-0031',
    contrato: 'CT-2026-0142',
    catalogoVersao: 'v2.1',
    catalogoNome: 'MTI DevSec.Gov — Licenças',
    descricao: 'Análise DAST — 2 ciclos',
    status: 'Aguardando assinatura',
    abertura: '2026-04-28',
    valor: 121874.4,
    origem: 'Independente',
  },
  {
    id: 'os3',
    numero: 'OS-2025-0198',
    contrato: 'CT-2025-0891',
    catalogoVersao: 'v4.0',
    catalogoNome: 'MTI Simplifica — Serviços',
    descricao: 'Discovery — imersão em contexto',
    status: 'Concluída',
    abertura: '2025-11-03',
    valor: 75828,
    origem: 'Orçamento',
    orcamentoRef: 'ORC-2025-0088',
  },
]

export const SOLICITACOES_INICIAIS: Solicitacao[] = [
  {
    id: 's1',
    tipo: 'Cotação',
    nome: 'COT-2026-1187 — MTI CLOUD treinamentos',
    status: 'Em análise',
    situacao: 'Ativa',
    atualizadoEm: '2026-06-20',
  },
  {
    id: 's2',
    tipo: 'Contrato',
    nome: 'CT-2026-0142 — renovação parcial',
    status: 'Aprovado',
    situacao: 'Encerrada',
    atualizadoEm: '2026-06-15',
  },
  {
    id: 's3',
    tipo: 'OS',
    nome: 'OS-2026-0045 — treinamento cloud',
    status: 'Em execução',
    situacao: 'Ativa',
    atualizadoEm: '2026-06-18',
  },
  {
    id: 's4',
    tipo: 'Demanda',
    nome: 'Demanda portal — MTI Autonomy licença',
    status: 'Pendente',
    situacao: 'Ativa',
    atualizadoEm: '2026-06-22',
  },
]

export function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function pctConsumido(consumido: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((consumido / total) * 100))
}

export function labelStatusContrato(s: StatusContratoItem): string {
  return { contratado: 'No contrato', ausente: 'Ausente', parcial: 'Parcial' }[s]
}
