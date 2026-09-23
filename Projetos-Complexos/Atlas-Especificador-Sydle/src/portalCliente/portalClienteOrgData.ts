/** Cadastro organizacional — Portal ↔ Back-office (Fase 1).
 * Dados publicados pela MTI aparecem no portal; alterações do parceiro
 * ficam em rascunho até envio para aprovação. */

export type StatusHabilitacao =
  | 'Incompleta'
  | 'Em apresentação'
  | 'Completa – aguardando MTI'
  | 'Aprovada pela MTI'
  | 'Reprovada pela MTI'

export type StatusAprovacaoCadastro =
  | 'Vigente'
  | 'Rascunho local'
  | 'Aguardando MTI'
  | 'Ajuste solicitado'

export type StatusDoc = 'Pendente' | 'Aprovado' | 'Recusado' | 'Vencido'
export type ModoVencimento = 'Automático (backend)' | 'Manual / Recorrente'
/** Opções alinhadas aos textOptions / referências do back-office (forms.json). */
export const OPCOES_TIPO_CONTA = ['Conta corrente', 'Conta poupança', 'Conta salário', 'Pagamento'] as const
export const OPCOES_TIPO_CHAVE_PIX = ['CPF', 'CNPJ', 'E-mail', 'Telefone', 'Chave aleatória'] as const
export const OPCOES_BANCO = [
  'Banco do Brasil',
  'Bradesco',
  'Caixa Econômica Federal',
  'Itaú Unibanco',
  'Santander',
  'Banco Safra',
  'Banrisul',
  'BTG Pactual',
  'Nubank',
  'Inter',
  'C6 Bank',
  'Sicoob',
  'Sicredi',
  'Outro',
] as const

/** Conta corrente/poupança: oculta campos Pix. */
export function contaOcultaPix(tipoConta: string): boolean {
  return tipoConta === 'Conta corrente' || tipoConta === 'Conta poupança'
}

/** Tipo de chave Pix informado: mostra só Pix (oculta demais campos bancários). */
export function contaModoSomentePix(tipoChavePix?: string): boolean {
  return Boolean(tipoChavePix?.trim())
}
export const OPCOES_TIPO_TRIBUTO = [
  'ISS',
  'IRRF',
  'CSLL',
  'PIS',
  'COFINS',
  'INSS',
  'ICMS',
  'IPI',
  'IRPJ',
  'CPP',
  'CBS',
  'IBS',
] as const
export const OPCOES_REGIME_TRIBUTACAO = [
  'Simples Nacional',
  'Lucro Presumido',
  'Lucro Real',
  'MEI',
  'Imune / Isento',
] as const
export const OPCOES_TIPO_EMAIL = ['Pessoal', 'Comercial', 'Institucional', 'MT Login', 'Outro'] as const
export const OPCOES_CONDICAO_CARGO = ['Titular', 'Substituto', 'Suplente'] as const
export const OPCOES_CARGO_REF = [
  'Diretor DIRC',
  'Analista DIRC',
  'Analista DTIC',
  'Gerente de Projetos',
  'Fiscal de Contrato',
  'Responsável legal',
  'Analista comercial',
  'Gestor de contratos',
] as const
export const OPCOES_UNIDADE_CAMINHO = [
  'MTI',
  'MTI/GDP',
  'MTI/DIRC',
  'MTI/DTIC',
  'MTI/DIRADM',
  'MTI/UGP',
  'EloGroup',
  'SEPLAG/GECON',
] as const
export const OPCOES_PESSOA_REF = [
  'Felipe Oliveira Costa',
  'Ricardo Almeida Ferreira',
  'Carlos Eduardo Souza',
  'Helena Ribeiro Lima',
  'Carlos Gestor Cliente',
  'Mariana Alves Pereira',
] as const
export const OPCOES_BOOLEAN = ['Não', 'Sim'] as const

export type OrigemDado = 'MTI' | 'Parceiro'

export interface GrupoMippProgresso {
  id: string
  nome: string
  preenchidos: number
  total: number
}

/** Etapa documentacional (back-office: Etapa → Grupo → Documento). */
export interface EtapaDocumentacional {
  id: string
  nome: string
  ordem: number
  preenchidos: number
  total: number
  grupos: GrupoMippProgresso[]
}

export interface DadosUnidade {
  nome: string
  sigla: string
  tipoCadastro: 'Parceiro' | 'Cliente' | 'MTI'
  ativo: boolean
  produtoParceria: string
  caminho: string
  /** Código Protheus do cliente/parceiro. */
  codigoClienteParceiro: string
  /** Data da última atualização (somente leitura). */
  dataUltimaAtualizacao: string
}

export interface DadosCadastroOrg {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  naturezaJuridica: string
  inscricaoMunicipal: string
  inscricaoEstadual: string
  cnae: string
  cnaeSecundaria: string
  cnpjValidado: boolean
}

export interface ContaBancaria {
  id: string
  banco: string
  /** Legado — não exibido no layout atual (anexo Sydle). */
  codigo?: string
  agencia: string
  tipoConta: string
  numeroConta: string
  cpfCnpj?: string
  tipoChavePix?: string
  chavePix?: string
  origem: OrigemDado
}

export interface DocumentoMipp {
  id: string
  /** Etapa documentacional (ex.: Habilitação documental). */
  etapa: string
  grupo: string
  tipo: string
  modoVencimento: ModoVencimento
  arquivo?: string
  dataAnexo?: string
  dataVencimento?: string
  numero?: string
  status: StatusDoc
  observacaoAjuste?: string
  origem: OrigemDado
}

export interface DocExecucao {
  id: string
  tipo: string
  arquivo?: string
  dataAnexo?: string
  ativo: boolean
  observacao?: string
  url?: string
  origem: OrigemDado
  status: StatusDoc
}

export interface TributoLinha {
  id: string
  tipo: string
  aliquotaPct: string
  documento?: string
}

export interface TributosEncargos {
  regimeTributacao: string
  isentoIcms: boolean
  isentoIcmsDoc?: string
  isentoInscricaoEstadual: boolean
  isentoIeDoc?: string
  observacao?: string
  linhas: TributoLinha[]
}

export interface ContatoEmail {
  id: string
  tipo: string
  email: string
  principal: boolean
}

export interface ContatoTelefone {
  id: string
  tipo: string
  pais: string
  ddi: string
  numero: string
}

export interface ContatoEndereco {
  id: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  pais: string
}

export interface ContatoRedeSocial {
  id: string
  rede: string
  url: string
  usuario: string
}

export interface DadosContato {
  emails: ContatoEmail[]
  telefones: ContatoTelefone[]
  enderecos: ContatoEndereco[]
  redesSociais: ContatoRedeSocial[]
}

export interface UsuarioOrg {
  id: string
  nome: string
  cpf: string
  email: string
  cargo: string
  condicao: string
  origem: OrigemDado
  /** Alinhado ao boolean Ativo do back-office (pessoa no cargo). */
  ativo: boolean
}

export interface CargoAtribuido {
  id: string
  cargo: string
  unidade: string
  titular?: string
}

export interface ConviteCadastro {
  id: string
  email: string
  cargo: string
  ativo: boolean
  enviadoEm: string
}

/** Snapshot editável — o que o parceiro altera no portal. */
export interface SnapshotCadastro {
  dadosUnidade: DadosUnidade
  dadosCadastro: DadosCadastroOrg
  contasBancarias: ContaBancaria[]
  documentosMipp: DocumentoMipp[]
  docsExecucao: DocExecucao[]
  tributos: TributosEncargos
  contato: DadosContato
  usuarios: UsuarioOrg[]
  cargosAtribuidos: CargoAtribuido[]
  limiteUsuarios: number
  usuariosCadastrados: number
  convites: ConviteCadastro[]
}

export interface CadastroOrganizacional {
  orgNome: string
  orgSigla: string
  cnpj: string
  responsavel: string
  ndaAssinado: boolean
  statusHabilitacao: StatusHabilitacao
  statusAprovacao: StatusAprovacaoCadastro
  acessoComercialBloqueado: boolean
  motivoAjusteMti?: string
  mensagemEnvio?: string
  dataUltimoEnvio?: string
  /** Versão vigente no back-office (visível no portal). */
  publicado: SnapshotCadastro
  /** Rascunho do parceiro (enviado para aprovação). */
  rascunho: SnapshotCadastro
  grupos: GrupoMippProgresso[]
}

function cloneSnapshot(s: SnapshotCadastro): SnapshotCadastro {
  return structuredClone(s)
}

const SNAPSHOT_INICIAL: SnapshotCadastro = {
  dadosUnidade: {
    nome: 'EloGroup',
    sigla: 'ELO',
    tipoCadastro: 'Parceiro',
    ativo: true,
    produtoParceria: 'Soluções Digitais — Transformação',
    caminho: 'ELO',
    codigoClienteParceiro: 'C0001234',
    dataUltimaAtualizacao: '2026-07-15',
  },
  dadosCadastro: {
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'EloGroup Consultoria e Tecnologia Ltda',
    nomeFantasia: 'EloGroup',
    naturezaJuridica: 'Sociedade Empresária Limitada',
    inscricaoMunicipal: '123456-0',
    inscricaoEstadual: '172.16.1.3',
    cnae: '6201-5/01 — Desenvolvimento de programas de computador sob encomenda',
    cnaeSecundaria: '6202-3/00 — Desenvolvimento e licenciamento de programas de computador customizáveis',
    cnpjValidado: true,
  },
  contasBancarias: [
    {
      id: 'cb1',
      banco: 'Banco do Brasil',
      agencia: '1234-5',
      tipoConta: 'Conta corrente',
      numeroConta: '98765-4',
      cpfCnpj: '12.345.678/0001-90',
      origem: 'MTI',
    },
  ],
  documentosMipp: [
    {
      id: 'd1',
      etapa: 'Habilitação documental',
      grupo: 'Habilitação jurídica',
      tipo: 'Prova de inscrição no CNPJ',
      modoVencimento: 'Manual / Recorrente',
      arquivo: 'cnpj_elogroup.pdf',
      dataAnexo: '2026-05-10',
      numero: '12.345.678/0001-90',
      status: 'Aprovado',
      origem: 'Parceiro',
    },
    {
      id: 'd2',
      etapa: 'Habilitação documental',
      grupo: 'Habilitação jurídica',
      tipo: 'Certidão de débitos relativos a créditos tributários federais e dívida ativa da União',
      modoVencimento: 'Automático (backend)',
      arquivo: 'cnd_federal.pdf',
      dataAnexo: '2026-05-12',
      dataVencimento: '2027-05-15',
      numero: 'CND-2026-88421',
      status: 'Aprovado',
      origem: 'Parceiro',
    },
    {
      id: 'd3',
      etapa: 'Habilitação documental',
      grupo: 'Habilitação jurídica',
      tipo: 'Prova de regularidade com o FGTS',
      modoVencimento: 'Automático (backend)',
      status: 'Pendente',
      origem: 'Parceiro',
    },
    {
      id: 'd4',
      etapa: 'Habilitação documental',
      grupo: 'Qualificação técnica',
      tipo: 'Atestado de capacidade técnica e qualificação de equipe',
      modoVencimento: 'Manual / Recorrente',
      status: 'Pendente',
      origem: 'Parceiro',
    },
    {
      id: 'd5',
      etapa: 'Habilitação documental',
      grupo: 'Qualificação financeira',
      tipo: 'Balanço Patrimonial (último exercício)',
      modoVencimento: 'Manual / Recorrente',
      status: 'Pendente',
      origem: 'Parceiro',
    },
    {
      id: 'd6',
      etapa: 'Habilitação documental',
      grupo: 'Compliance',
      tipo: 'Certidão negativa de licitantes inidôneos (TCU)',
      modoVencimento: 'Automático (backend)',
      status: 'Pendente',
      origem: 'Parceiro',
    },
    {
      id: 'd7',
      etapa: 'Pré-rito parceria',
      grupo: 'Pré-rito parceria',
      tipo: 'Minuta de termo de parceria',
      modoVencimento: 'Manual / Recorrente',
      status: 'Pendente',
      origem: 'Parceiro',
    },
  ],
  docsExecucao: [
    {
      id: 'ex1',
      tipo: 'Papel timbrado',
      arquivo: 'papel_timbrado_elogroup.pdf',
      dataAnexo: '2026-05-20',
      ativo: true,
      observacao: 'Modelo institucional vigente para propostas.',
      origem: 'MTI',
      status: 'Aprovado',
    },
    {
      id: 'ex2',
      tipo: 'Logo marca',
      ativo: true,
      url: 'https://elogroup.com.br/assets/logo.svg',
      observacao: 'URL pública da marca.',
      origem: 'Parceiro',
      status: 'Pendente',
    },
    {
      id: 'ex3',
      tipo: 'Modelo de proposta',
      ativo: false,
      observacao: 'Aguardando revisão do comercial.',
      origem: 'Parceiro',
      status: 'Pendente',
    },
  ],
  tributos: {
    regimeTributacao: 'Lucro Presumido',
    isentoIcms: false,
    isentoInscricaoEstadual: false,
    linhas: [
      { id: 'tr1', tipo: 'ISS', aliquotaPct: '5,00', documento: 'declaracao_iss.pdf' },
      { id: 'tr2', tipo: 'PIS', aliquotaPct: '0,65' },
      { id: 'tr3', tipo: 'COFINS', aliquotaPct: '3,00' },
    ],
  },
  contato: {
    emails: [
      { id: 'e1', tipo: 'Institucional', email: 'contato@elogroup.com.br', principal: true },
      { id: 'e2', tipo: 'Comercial', email: 'financeiro@elogroup.com.br', principal: false },
    ],
    telefones: [
      { id: 't1', tipo: 'Comercial', pais: 'Brasil', ddi: '+55', numero: '(65) 3027-4500' },
      { id: 't2', tipo: 'Celular', pais: 'Brasil', ddi: '+55', numero: '(65) 99999-1234' },
    ],
    enderecos: [
      {
        id: 'en1',
        cep: '78048-000',
        logradouro: 'Av. Historiador Rubens de Mendonça',
        numero: '1894',
        complemento: 'Sala 1201',
        bairro: 'Bosque da Saúde',
        cidade: 'Cuiabá',
        uf: 'MT',
        pais: 'Brasil',
      },
    ],
    redesSociais: [
      {
        id: 'rs1',
        rede: 'LinkedIn',
        url: 'https://www.linkedin.com/company/elogroup',
        usuario: 'elogroup',
      },
      {
        id: 'rs2',
        rede: 'Instagram',
        url: 'https://www.instagram.com/elogroup',
        usuario: '@elogroup',
      },
    ],
  },
  usuarios: [
    {
      id: 'u1',
      nome: 'Felipe Oliveira Costa',
      cpf: '123.456.789-00',
      email: 'felipe.costa@elogroup.com.br',
      cargo: 'Responsável legal',
      condicao: 'Titular',
      origem: 'MTI',
      ativo: true,
    },
    {
      id: 'u2',
      nome: 'Mariana Alves Pereira',
      cpf: '987.654.321-00',
      email: 'mariana.pereira@elogroup.com.br',
      cargo: 'Analista comercial',
      condicao: 'Titular',
      origem: 'Parceiro',
      ativo: false,
    },
  ],
  cargosAtribuidos: [
    { id: 'ca1', cargo: 'Responsável legal', unidade: 'EloGroup', titular: 'Felipe Oliveira Costa' },
    { id: 'ca2', cargo: 'Analista comercial', unidade: 'EloGroup', titular: 'Mariana Alves Pereira' },
    { id: 'ca3', cargo: 'Gestor de contratos', unidade: 'EloGroup' },
  ],
  limiteUsuarios: 20,
  usuariosCadastrados: 2,
  convites: [
    {
      id: 'cv1',
      email: 'joao.silva@elogroup.com.br',
      cargo: 'Gestor de contratos',
      ativo: true,
      enviadoEm: '2026-07-10',
    },
  ],
}

function buildGrupos(docs: DocumentoMipp[]): GrupoMippProgresso[] {
  const map = new Map<string, { preenchidos: number; total: number }>()
  for (const d of docs) {
    const g = map.get(d.grupo) ?? { preenchidos: 0, total: 0 }
    g.total++
    if (d.arquivo && d.status !== 'Recusado') g.preenchidos++
    map.set(d.grupo, g)
  }
  return [...map.entries()].map(([nome, v], i) => ({
    id: `g-${i}`,
    nome,
    preenchidos: v.preenchidos,
    total: v.total,
  }))
}

const ORDEM_ETAPAS = ['Habilitação documental', 'Pré-rito parceria', 'Execução da parceria']

/** Agrupa documentos em Etapa → Grupo (espelho do back-office). */
export function buildEtapas(docs: DocumentoMipp[]): EtapaDocumentacional[] {
  const byEtapa = new Map<string, DocumentoMipp[]>()
  for (const d of docs) {
    const list = byEtapa.get(d.etapa) ?? []
    list.push(d)
    byEtapa.set(d.etapa, list)
  }
  const nomes = [
    ...ORDEM_ETAPAS.filter((n) => byEtapa.has(n)),
    ...[...byEtapa.keys()].filter((n) => !ORDEM_ETAPAS.includes(n)),
  ]
  return nomes.map((nome, i) => {
    const docsEtapa = byEtapa.get(nome) ?? []
    const grupos = buildGrupos(docsEtapa).map((g, gi) => ({
      ...g,
      id: `e${i}-g${gi}`,
    }))
    const preenchidos = grupos.reduce((a, g) => a + g.preenchidos, 0)
    const total = grupos.reduce((a, g) => a + g.total, 0)
    return {
      id: `etapa-${i}`,
      nome,
      ordem: i + 1,
      preenchidos,
      total,
      grupos,
    }
  })
}

export const CADASTRO_ORG_INICIAL: CadastroOrganizacional = {
  orgNome: 'EloGroup',
  orgSigla: 'ELO',
  cnpj: '12.345.678/0001-90',
  responsavel: 'Felipe Oliveira Costa',
  ndaAssinado: false,
  statusHabilitacao: 'Em apresentação',
  statusAprovacao: 'Vigente',
  acessoComercialBloqueado: true,
  publicado: cloneSnapshot(SNAPSHOT_INICIAL),
  rascunho: cloneSnapshot(SNAPSHOT_INICIAL),
  grupos: buildGrupos(SNAPSHOT_INICIAL.documentosMipp),
}

export function cloneCadastro(c: CadastroOrganizacional): CadastroOrganizacional {
  return structuredClone(c)
}

export function hasDraftChanges(c: CadastroOrganizacional): boolean {
  return JSON.stringify(c.publicado) !== JSON.stringify(c.rascunho)
}

export function syncGruposFromRascunho(c: CadastroOrganizacional): CadastroOrganizacional {
  return { ...c, grupos: buildGrupos(c.rascunho.documentosMipp) }
}

export function enviarRascunhoParaAprovacao(c: CadastroOrganizacional): CadastroOrganizacional {
  return {
    ...c,
    statusAprovacao: 'Aguardando MTI',
    statusHabilitacao: 'Completa – aguardando MTI',
    motivoAjusteMti: undefined,
    dataUltimoEnvio: new Date().toISOString().slice(0, 10),
  }
}

/** Simula aprovação no back-office: rascunho vira publicado. */
export function aprovarNoBackoffice(c: CadastroOrganizacional): CadastroOrganizacional {
  const publicado = cloneSnapshot(c.rascunho)
  return {
    ...c,
    publicado,
    rascunho: cloneSnapshot(publicado),
    statusAprovacao: 'Vigente',
    statusHabilitacao: 'Aprovada pela MTI',
    acessoComercialBloqueado: false,
    motivoAjusteMti: undefined,
    orgNome: publicado.dadosUnidade.nome,
    orgSigla: publicado.dadosUnidade.sigla,
    cnpj: publicado.dadosCadastro.cnpj,
    grupos: buildGrupos(publicado.documentosMipp),
  }
}

/** Simula solicitar ajuste no back-office. */
export function solicitarAjusteBackoffice(c: CadastroOrganizacional, motivo: string): CadastroOrganizacional {
  return {
    ...c,
    statusAprovacao: 'Ajuste solicitado',
    statusHabilitacao: 'Em apresentação',
    motivoAjusteMti: motivo,
  }
}

export function pctGrupo(g: GrupoMippProgresso): number {
  if (g.total <= 0) return 0
  return Math.round((g.preenchidos / g.total) * 100)
}

export function progressoGeral(grupos: GrupoMippProgresso[]): { preenchidos: number; total: number; pct: number } {
  const preenchidos = grupos.reduce((a, g) => a + g.preenchidos, 0)
  const total = grupos.reduce((a, g) => a + g.total, 0)
  return { preenchidos, total, pct: total > 0 ? Math.round((preenchidos / total) * 100) : 0 }
}

export function badgeClassStatusHabilitacao(s: StatusHabilitacao): string {
  const map: Record<StatusHabilitacao, string> = {
    Incompleta: 'pc-badge--rascunho',
    'Em apresentação': 'pc-badge--em-analise',
    'Completa – aguardando MTI': 'pc-badge--aguardando-assinatura',
    'Aprovada pela MTI': 'pc-badge--aprovado',
    'Reprovada pela MTI': 'pc-badge--recusado',
  }
  return map[s]
}

export function badgeClassStatusAprovacao(s: StatusAprovacaoCadastro): string {
  const map: Record<StatusAprovacaoCadastro, string> = {
    Vigente: 'sy-badge--success',
    'Rascunho local': 'sy-badge--neutral',
    'Aguardando MTI': 'sy-badge--warning',
    'Ajuste solicitado': 'sy-badge--danger',
  }
  return map[s]
}

export function badgeClassStatusDoc(s: StatusDoc): string {
  const map: Record<StatusDoc, string> = {
    Pendente: 'sy-badge--warning',
    Aprovado: 'sy-badge--success',
    Recusado: 'sy-badge--danger',
    Vencido: 'sy-badge--neutral',
  }
  return map[s]
}

export type SecaoCadastroId =
  | 'resumo'
  | 'unidade'
  | 'cadastro'
  | 'tributos'
  | 'contato'
  | 'usuarios'
  | 'documentos'
  | 'envio'

/** Accordion id for "Documentos de execução da parceria" na aba Documentos. */
export const GRUPO_EXECUCAO_ID = 'docs-execucao'
