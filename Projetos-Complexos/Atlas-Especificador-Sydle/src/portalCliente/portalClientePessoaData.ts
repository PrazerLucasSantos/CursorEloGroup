/** Meus dados — espelho da classe (03) Pessoa do protótipo Atlas. */

export type PerfilPessoa = 'MTI' | 'Parceiro' | 'Cliente'
export type CondicaoCargo = 'Titular' | 'Substituto' | 'Suplente'
export type StatusVinculo =
  | 'Ativo'
  | 'Inativo'
  | 'Suspenso'
  | 'Aguardando validação Protheus'

export const OPCOES_PERFIL_PESSOA: PerfilPessoa[] = ['MTI', 'Parceiro', 'Cliente']
export const OPCOES_CONDICAO_CARGO_PESSOA: CondicaoCargo[] = ['Titular', 'Substituto', 'Suplente']
export const OPCOES_STATUS_VINCULO: StatusVinculo[] = [
  'Ativo',
  'Inativo',
  'Suspenso',
  'Aguardando validação Protheus',
]
export const OPCOES_SEXO = ['Masculino', 'Feminino'] as const
export const OPCOES_GENERO = ['Homem', 'Mulher', 'Não binário', 'Outro'] as const
export const OPCOES_DEFICIENCIA = [
  'Nenhuma',
  'Visual',
  'Auditiva',
  'Física',
  'Intelectual',
  'Múltipla',
] as const
export const OPCOES_PAIS = ['Brasil', 'Argentina', 'Paraguai', 'Bolívia', 'Outro'] as const
export const OPCOES_NATURALIDADE = [
  'Cuiabá/MT',
  'Várzea Grande/MT',
  'Brasília/DF',
  'São Paulo/SP',
  'Outro',
] as const
export const OPCOES_ESTADO_CIVIL = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União estável',
] as const
export const OPCOES_COR_RACA = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena'] as const
export const OPCOES_TIPO_EMAIL_PESSOA = [
  'Pessoal',
  'Comercial',
  'Institucional',
  'MT Login',
  'Outro',
] as const
export const OPCOES_TIPO_FILIACAO = ['Pai', 'Mãe', 'Tutor', 'Curador', 'Outro'] as const
export const OPCOES_REGIAO_UF = [
  'Todos',
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const

export interface PessoaDocumento {
  id: string
  tipo: string
  numero: string
  camposAdicionais?: string
  arquivo?: string
  arquivoKb?: number
  vencimento?: string
}

export interface PessoaFiliacao {
  id: string
  nome: string
  tipoVinculo: string
  documento?: string
  documentoKb?: number
}

export interface PessoaTelefone {
  id: string
  tipo: string
  pais: string
  ddi: string
  numero: string
}

export interface PessoaEmail {
  id: string
  tipo: string
  email: string
}

export interface PessoaEndereco {
  id: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  pais: string
}

export interface PessoaRedeSocial {
  id: string
  rede: string
  url: string
  usuario: string
}

/** Espelho dos campos do formulário (03) Pessoa. */
export interface PessoaCadastro {
  // Principal
  nome: string
  outrosNomes: string
  foto?: string
  fotoKb?: number
  cpf: string
  dataNascimento: string
  falecido: boolean
  // Complementares
  perfil: PerfilPessoa | ''
  organizacao: string
  unidadeOrganizacional: string
  cargo: string
  matricula: string
  condicaoCargo: CondicaoCargo | ''
  regiaoAtuacao: string
  statusVinculoFuncional: StatusVinculo | ''
  dataValidacaoProtheus: string
  // Demográficas
  sexo: string
  genero: string
  deficiencias: string
  paisNascimento: string
  nacionalidade: string
  naturalidade: string
  estadoCivil: string
  corRaca: string
  // Contato
  emailPrincipal: string
  documentos: PessoaDocumento[]
  filiacoes: PessoaFiliacao[]
  telefones: PessoaTelefone[]
  emails: PessoaEmail[]
  enderecos: PessoaEndereco[]
  redesSociais: PessoaRedeSocial[]
  // Credenciais (última seção na UI)
  ativoParaAcesso: boolean
  login: string
  senha: string
  tokenCertificado: string
}

export const USUARIO_PORTAL_INICIAIS = 'LC'

/** Usuário logado no portal (avatar LC) — perfil Cliente. */
export const PESSOA_LOGADA_INICIAL: PessoaCadastro = {
  nome: 'Lucas Costa',
  outrosNomes: '',
  foto: undefined,
  cpf: '123.456.789-09',
  dataNascimento: '1991-04-12',
  falecido: false,
  perfil: 'Cliente',
  organizacao: 'Secretaria de Estado de Planejamento e Gestão',
  unidadeOrganizacional: 'SEPLAG/GECON',
  cargo: 'Fiscal de Contrato',
  matricula: '',
  condicaoCargo: 'Titular',
  regiaoAtuacao: 'MT',
  statusVinculoFuncional: 'Ativo',
  dataValidacaoProtheus: '',
  sexo: 'Masculino',
  genero: 'Homem',
  deficiencias: 'Nenhuma',
  paisNascimento: 'Brasil',
  nacionalidade: 'Brasil',
  naturalidade: 'Cuiabá/MT',
  estadoCivil: 'Casado(a)',
  corRaca: 'Parda',
  emailPrincipal: 'lucas.costa@seplag.mt.gov.br',
  documentos: [
    {
      id: 'doc-1',
      tipo: 'CPF',
      numero: '123.456.789-09',
      arquivo: 'cpf_lucas_costa.pdf',
      arquivoKb: 12.5,
    },
    {
      id: 'doc-2',
      tipo: 'RG',
      numero: '2.345.678 SSP/MT',
      arquivo: 'rg_lucas_costa.pdf',
      arquivoKb: 84.2,
      vencimento: '2032-08-15',
    },
  ],
  filiacoes: [
    { id: 'fil-1', nome: 'Maria Aparecida Costa', tipoVinculo: 'Mãe' },
    { id: 'fil-2', nome: 'José Antonio Costa', tipoVinculo: 'Pai' },
  ],
  telefones: [
    {
      id: 'tel-1',
      tipo: 'Celular',
      pais: 'Brasil',
      ddi: '+55',
      numero: '(65) 99123-4567',
    },
    {
      id: 'tel-2',
      tipo: 'Institucional',
      pais: 'Brasil',
      ddi: '+55',
      numero: '(65) 3613-1200',
    },
  ],
  emails: [
    {
      id: 'em-1',
      tipo: 'Institucional',
      email: 'lucas.costa@seplag.mt.gov.br',
    },
    {
      id: 'em-2',
      tipo: 'Pessoal',
      email: 'lucas.costa@email.com',
    },
  ],
  enderecos: [
    {
      id: 'end-1',
      cep: '78048-000',
      logradouro: 'Avenida Historiador Rubens de Mendonça',
      numero: '4150',
      complemento: 'Bloco B',
      bairro: 'Centro Político Administrativo',
      cidade: 'Cuiabá',
      estado: 'Mato Grosso',
      pais: 'Brasil',
    },
  ],
  redesSociais: [
    {
      id: 'rs-1',
      rede: 'LinkedIn',
      url: 'https://linkedin.com/in/lucascosta',
      usuario: 'lucascosta',
    },
  ],
  ativoParaAcesso: true,
  login: 'lucas.costa',
  senha: '••••••••',
  tokenCertificado: '',
}

export function clonePessoa(p: PessoaCadastro): PessoaCadastro {
  return structuredClone(p)
}

export function newRowId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}
