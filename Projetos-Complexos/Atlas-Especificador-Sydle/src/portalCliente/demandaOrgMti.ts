/**
 * Hierarquia Organização tipo MTI (demo) — departamento → unidades filhas
 * (Organização pai = departamento). Espelha presets UO do Atlas.
 */
export type OrgMtiNode = {
  nome: string
  pai?: string
}

/** Departamentos e unidades de negócio MTI usados na Demanda. */
export const ORGS_MTI: OrgMtiNode[] = [
  { nome: 'Empresa Mato-grossense de Tecnologia da Informação' },
  { nome: 'Gabinete do Diretor-Presidente', pai: 'Empresa Mato-grossense de Tecnologia da Informação' },
  { nome: 'Gabinete da Diretoria Administrativa', pai: 'Gabinete do Diretor-Presidente' },
  {
    nome: 'Gabinete da Diretoria de Tecnologia da Informação e Comunicação',
    pai: 'Gabinete do Diretor-Presidente',
  },
  {
    nome: 'Gabinete da Diretoria de Relacionamento com o Cliente',
    pai: 'Gabinete do Diretor-Presidente',
  },
  { nome: 'Unidade de Gestão de Projetos', pai: 'Gabinete do Diretor-Presidente' },
  { nome: 'Unidade de Gestão de Apoio à Governança', pai: 'Gabinete do Diretor-Presidente' },
  {
    nome: 'Gerência de Gestão Estratégica',
    pai: 'Unidade de Gestão de Apoio à Governança',
  },
  {
    nome: 'Unidade de Gestão Administrativa',
    pai: 'Gabinete da Diretoria Administrativa',
  },
  {
    nome: 'Unidade de Gestão de Aquisições e Contratos',
    pai: 'Gabinete da Diretoria Administrativa',
  },
  {
    nome: 'Gerência de Contratos',
    pai: 'Unidade de Gestão de Aquisições e Contratos',
  },
  {
    nome: 'Unidade de Gestão de Soluções Digitais de Governo',
    pai: 'Gabinete da Diretoria de Tecnologia da Informação e Comunicação',
  },
  {
    nome: 'Unidade de Gestão de Serviços de Tecnologia da Informação e Comunicação',
    pai: 'Gabinete da Diretoria de Tecnologia da Informação e Comunicação',
  },
  {
    nome: 'Unidade de Gestão de Vendas',
    pai: 'Gabinete da Diretoria de Relacionamento com o Cliente',
  },
  {
    nome: 'Unidade de Gestão de Parcerias e Novos Negócios',
    pai: 'Gabinete da Diretoria de Relacionamento com o Cliente',
  },
  {
    nome: 'Gerência de Parceria e Inovação',
    pai: 'Unidade de Gestão de Parcerias e Novos Negócios',
  },
]

/** Departamentos = qualquer Organização MTI (pode ser selecionada como departamento). */
export function departamentosMti(): string[] {
  return ORGS_MTI.map((o) => o.nome)
}

/** Unidades de negócio = filhos cujo Organização pai = departamento. */
export function unidadesNegocioDoDepartamento(departamento?: string): string[] {
  if (!departamento?.trim()) return []
  return ORGS_MTI.filter((o) => o.pai === departamento).map((o) => o.nome)
}

export const CATEGORIAS_DEMANDA = ['Estratégico', 'Operacional'] as const
export const PRIORIDADES_DEMANDA = [
  'Crítico',
  'Alto',
  'Moderado',
  'Baixo',
  'Planejado',
] as const

/** Responsável cadastrado na Organização tipo Cliente (campo UO.Responsável). */
export type OrgClienteResponsavel = {
  nome: string
  email: string
  telefone: string
  cargo?: string
}

const ORG_CLIENTE_RESPONSAVEL: Record<string, OrgClienteResponsavel> = {
  'Secretaria de Estado de Planejamento e Gestão': {
    nome: 'Ricardo Almeida Ferreira',
    email: 'ricardo.ferreira@seplag.mt.gov.br',
    telefone: '(65) 3613-3000',
    cargo: 'Diretor DIRC',
  },
  'SEPLAG - Secretaria de Estado de Planejamento e Gestao': {
    nome: 'Ricardo Almeida Ferreira',
    email: 'ricardo.ferreira@seplag.mt.gov.br',
    telefone: '(65) 3613-3000',
    cargo: 'Diretor DIRC',
  },
}

export function responsavelDaOrgCliente(clienteSolicitante?: string): OrgClienteResponsavel | undefined {
  if (!clienteSolicitante?.trim()) return undefined
  const key = clienteSolicitante.trim()
  if (ORG_CLIENTE_RESPONSAVEL[key]) return ORG_CLIENTE_RESPONSAVEL[key]
  // match parcial (portal vs Atlas)
  const hit = Object.entries(ORG_CLIENTE_RESPONSAVEL).find(
    ([nome]) =>
      key.toLowerCase().includes('seplag') && nome.toLowerCase().includes('planejamento'),
  )
  return hit?.[1]
}

/** Contatos demo de pessoas (e-mail / telefone) para abertura e secundário. */
const PESSOA_CONTATO_DEMO: Record<string, { email: string; telefone: string; cargo?: string }> = {
  'Lucas Costa': {
    email: 'lucas.costa@seplag.mt.gov.br',
    telefone: '(65) 99999-0101',
    cargo: 'Demandante',
  },
  'Ana Paula Ribeiro': {
    email: 'ana.ribeiro@seplag.mt.gov.br',
    telefone: '(65) 99999-0202',
    cargo: 'Gestor',
  },
  'Bernardo Almeida': {
    email: 'bernardo.almeida@seplag.mt.gov.br',
    telefone: '(65) 99999-0303',
    cargo: 'Fiscal',
  },
  'Ricardo Almeida Ferreira': {
    email: 'ricardo.ferreira@seplag.mt.gov.br',
    telefone: '(65) 3613-3000',
    cargo: 'Diretor DIRC',
  },
  'Helena Ribeiro Lima': {
    email: 'helena.lima@seplag.mt.gov.br',
    telefone: '(65) 99999-0404',
    cargo: 'Analista DIRC',
  },
}

export function contatoPessoaDemo(nome?: string) {
  if (!nome?.trim()) return undefined
  return PESSOA_CONTATO_DEMO[nome.trim()]
}
