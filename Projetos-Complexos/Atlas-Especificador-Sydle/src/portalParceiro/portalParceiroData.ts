export type StatusFluxo =
  | 'Rascunho (parceiro)'
  | 'Aguardando análise MTI'
  | 'Ajuste solicitado'
  | 'Homologado'
  | 'Ativo (publicado)'
  | 'Paralisado'
  | 'Reprovado'

export type Complexidade =
  | 'Muito Baixa'
  | 'Baixa'
  | 'Média'
  | 'Alta'
  | 'Muito Alta'
  | ''

export type StatusProduto =
  | 'Ativo'
  | 'Suspenso'
  | 'Reajuste de Preço'
  | 'Homologado'
  | 'Paralisado'
  | 'Concluído'
  | 'Rascunho'
  | 'Em análise'
  | 'Ajuste solicitado'
  | string

export type PeriodoMinimo =
  | '12 meses'
  | '24 meses'
  | '36 meses'
  | '48 meses'
  | '60 meses'
  | ''

/** Produto no portal do parceiro (validação 17/08). Custo/markup/% ficam no backoffice MTI. */
export type ProdutoParceiro = {
  id: string
  identificador: string
  tipo: 'Licença' | 'Serviço'
  metrica: string
  valorUnitario: number
  status: StatusProduto
  complexidade?: Complexidade
  peso?: number
  quantidadeMetrica?: number
  grupo?: string
  categoria?: string
  partNumber?: string
  descricaoSolucao?: string
  modeloVenda?: string
  cobranca?: string
  periodoMinimo?: PeriodoMinimo
  codigoProtheus?: string
  codigoSiag?: string
  /** Herdado do catálogo — somente leitura no portal. */
  tipoOferta?: 'Universal' | 'Individualizado'
  /**
   * Campos Protheus da reunião 21/08/2026 — ainda não existiam no Atlas.
   * No protótipo os rótulos aparecem em MAIÚSCULAS para destacar o gap.
   * Valores como texto simples (decisão 24/08: sem classes novas).
   */
  nomeCientifico?: string
  tipoProtheus?: string
  grupoErp?: string
  localPadrao?: string
  grupoTributario?: string
  codigoNatureza?: string
  origem?: string
  impostoRenda?: string
  calculaInss?: string
  retemPis?: string
  retemCofins?: string
  retemCsll?: string
  contaContabil?: string
}

export type GrupoParceiro = {
  id: string
  nome: string
  descricao?: string
  parceria: string
  ativo: boolean
}

export type CatalogoParceiro = {
  id: string
  identificador: string
  versao: string
  parceria: string
  statusFluxo: StatusFluxo
  /** Homologação institucional da parceria (DIREX) — PDF F3. */
  statusParceria?: string
  dataHomologacaoDirex?: string
  justificativaMti?: string
  mensagemEnvio?: string
  /** Toggle MTI — herda Tipo de Oferta no produto. */
  ehUniversal?: boolean
  produtos: ProdutoParceiro[]
  atualizadoEm: string
  historico?: { em: string; status: StatusFluxo; detalhe?: string }[]
}

export const PARCEIRO_LOGADO = {
  organizacao: 'EloGroup / EloGP',
  usuario: 'Ana Parceira',
  iniciais: 'AP',
}

export const PARCERIAS = ['MTI SIMPLIFICA', 'MTI HOST'] as const

export const COMPLEXIDADES: Complexidade[] = [
  'Muito Baixa',
  'Baixa',
  'Média',
  'Alta',
  'Muito Alta',
]

export const STATUS_PRODUTO: StatusProduto[] = [
  'Rascunho',
  'Ativo',
  'Suspenso',
  'Reajuste de Preço',
  'Homologado',
  'Paralisado',
  'Concluído',
]

export const PERIODOS_MINIMOS: PeriodoMinimo[] = [
  '12 meses',
  '24 meses',
  '36 meses',
  '48 meses',
  '60 meses',
]

export const MODELOS_VENDA = [
  'Por licença',
  'Por serviço',
  'Por pacote',
  'Perpétuo',
  'Por UST',
] as const

export const COBRANCAS = ['Mensal', 'Anual', 'Conforme homologação', 'Única'] as const

export const GRUPOS_EXEMPLO = [
  'Análise e Modelagem de Processos',
  'Automação de processos',
  'Infraestrutura',
] as const

export const GRUPOS_INICIAIS: GrupoParceiro[] = [
  {
    id: 'g1',
    nome: 'Análise e Modelagem de Processos',
    descricao: 'Serviços de discovery e modelagem.',
    parceria: 'MTI SIMPLIFICA',
    ativo: true,
  },
  {
    id: 'g2',
    nome: 'Automação de processos',
    descricao: 'Automação e RPA.',
    parceria: 'MTI SIMPLIFICA',
    ativo: true,
  },
  {
    id: 'g3',
    nome: 'Infraestrutura',
    descricao: 'Hospedagem e nuvem.',
    parceria: 'MTI HOST',
    ativo: true,
  },
]

const baseDirC = {
  cobranca: 'Mensal' as const,
  periodoMinimo: '12 meses' as PeriodoMinimo,
  modeloVenda: 'Por serviço',
}

/** Defaults Protheus (reunião 21/08) — texto simples na classe Produto. */
const baseProtheus = {
  tipoProtheus: 'SW',
  grupoErp: '32',
  localPadrao: '01',
  grupoTributario: '001',
  codigoNatureza: 'Venda de Serviços',
  origem: '0',
  impostoRenda: 'Não',
  calculaInss: 'Não',
  retemPis: 'Não',
  retemCofins: 'Não',
  retemCsll: 'Não',
  contaContabil: '30100101001',
}

export const CATALOGOS_INICIAIS: CatalogoParceiro[] = [
  {
    id: 'cat-simplifica-15',
    identificador: 'Catálogo MTI Simplifica',
    versao: '9.4',
    parceria: 'MTI SIMPLIFICA',
    statusFluxo: 'Rascunho (parceiro)',
    statusParceria: 'Homologada (DIREX)',
    dataHomologacaoDirex: '2025-11-10',
    mensagemEnvio: 'Rascunho gerado ao salvar a parceria — montagem pelo parceiro.',
    atualizadoEm: '2026-08-20',
    ehUniversal: false,
    produtos: [
      {
        id: 'p1',
        identificador: 'Implantação MTI Simplifica',
        tipo: 'Serviço',
        metrica: 'UST',
        valorUnitario: 15000,
        status: 'Rascunho',
        complexidade: 'Alta',
        grupo: 'Análise e Modelagem de Processos',
        categoria: 'Automação e Processos',
        partNumber: 'SIM-IMP-01',
        descricaoSolucao: 'Implantação e capacitação no ecossistema Simplifica.',
        modeloVenda: 'Por serviço',
        nomeCientifico: 'MTI EloGroup Implantação MTI Simplifica',
        codigoProtheus: '32000609',
        ...baseDirC,
        ...baseProtheus,
      },
      {
        id: 'p2',
        identificador: 'Sustentação Simplifica — mensal',
        tipo: 'Serviço',
        metrica: 'UST',
        valorUnitario: 4120,
        status: 'Rascunho',
        complexidade: 'Média',
        grupo: 'Análise e Modelagem de Processos',
        categoria: 'Automação e Processos',
        partNumber: 'SIM-SUS-01',
        descricaoSolucao: 'Sustentação mensal da solução Simplifica.',
        modeloVenda: 'Por UST',
        cobranca: 'Mensal',
        periodoMinimo: '12 meses',
        nomeCientifico: 'MTI EloGroup Sustentação Simplifica mensal',
        codigoProtheus: '32000610',
        ...baseProtheus,
      },
      {
        id: 'p3',
        identificador: 'Licença plataforma Simplifica',
        tipo: 'Licença',
        metrica: 'USN',
        valorUnitario: 45000,
        status: 'Rascunho',
        grupo: 'Análise e Modelagem de Processos',
        partNumber: 'SIM-LIC-01',
        descricaoSolucao: 'Licenciamento perpétuo da plataforma.',
        modeloVenda: 'Perpétuo',
        cobranca: 'Única',
        periodoMinimo: '12 meses',
        nomeCientifico: 'MTI EloGroup Licença plataforma Simplifica',
        codigoProtheus: '32000611',
        ...baseProtheus,
      },
    ],
  },
  {
    id: 'cat-host-aguardando',
    identificador: 'Catálogo MTI HOST',
    versao: '2.0',
    parceria: 'MTI HOST',
    statusFluxo: 'Aguardando análise MTI',
    statusParceria: 'Homologada (DIREX)',
    mensagemEnvio: 'Revisão de valores unitários HOST.',
    atualizadoEm: '2026-07-28',
    produtos: [
      {
        id: 'h1',
        identificador: 'Serviço de hospedagem',
        tipo: 'Serviço',
        metrica: 'USN',
        valorUnitario: 152,
        status: 'Em análise',
        grupo: 'Infraestrutura',
        categoria: 'Nuvem',
        partNumber: 'HOST-VCPU-01',
        descricaoSolucao: 'Hospedagem em nuvem compartilhada.',
        modeloVenda: 'Por serviço',
        cobranca: 'Mensal',
        periodoMinimo: '24 meses',
        nomeCientifico: 'MTI EloGroup Serviço de hospedagem',
        codigoProtheus: '32000076',
        ...baseProtheus,
      },
    ],
  },
  {
    id: 'cat-simplifica-ajuste',
    identificador: 'Catálogo MTI Simplifica',
    versao: '9.4-adj',
    parceria: 'MTI SIMPLIFICA',
    statusFluxo: 'Ajuste solicitado',
    statusParceria: 'Homologada (DIREX)',
    dataHomologacaoDirex: '2025-11-10',
    justificativaMti:
      'Valor unitário diverge da referência. Corrigir e reenviar (sem custo/markup no CSV).',
    atualizadoEm: '2026-07-30',
    produtos: [
      {
        id: 'a1',
        identificador: 'Implantação MTI Simplifica',
        tipo: 'Serviço',
        metrica: 'UST',
        valorUnitario: 25000,
        status: 'Ajuste solicitado',
        complexidade: 'Alta',
        grupo: 'Análise e Modelagem de Processos',
        categoria: 'Automação e Processos',
        partNumber: 'SIM-IMP-01',
        descricaoSolucao: 'Implantação Simplifica — valores em revisão.',
        modeloVenda: 'Por serviço',
        cobranca: 'Conforme homologação',
        periodoMinimo: '12 meses',
        nomeCientifico: 'MTI EloGroup Implantação MTI Simplifica',
        codigoProtheus: '32000609',
        ...baseProtheus,
      },
    ],
  },
]

export function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function badgeClass(status: StatusFluxo): string {
  if (status.startsWith('Rascunho')) return 'rascunho'
  if (status.startsWith('Aguardando')) return 'aguardando'
  if (status.startsWith('Ajuste')) return 'ajuste'
  if (status.startsWith('Homologado') || status.startsWith('Ativo')) return 'ok'
  if (status.startsWith('Reprovado') || status.startsWith('Paralisado')) return 'off'
  return 'neutro'
}

export function podeEditar(status: StatusFluxo): boolean {
  return status === 'Rascunho (parceiro)' || status === 'Ajuste solicitado'
}

export function podeEnviar(status: StatusFluxo): boolean {
  return podeEditar(status)
}

export function pushHistorico(
  cat: CatalogoParceiro,
  status: StatusFluxo,
  detalhe?: string,
): CatalogoParceiro['historico'] {
  return [{ em: new Date().toISOString(), status, detalhe }, ...(cat.historico ?? [])]
}

export function emptyProduto(): ProdutoParceiro {
  return {
    id: crypto.randomUUID(),
    identificador: 'Novo produto',
    tipo: 'Serviço',
    metrica: 'UST',
    valorUnitario: 0,
    status: 'Rascunho',
    complexidade: 'Média',
    grupo: 'Análise e Modelagem de Processos',
    categoria: 'Automação e Processos',
    modeloVenda: 'Por serviço',
    cobranca: 'Mensal',
    periodoMinimo: '12 meses',
    nomeCientifico: '',
    ...baseProtheus,
  }
}
