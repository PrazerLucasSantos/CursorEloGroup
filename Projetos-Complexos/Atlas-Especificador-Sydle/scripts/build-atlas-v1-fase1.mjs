/**
 * Atlas V1 — Fase 1 (Da demanda ao kick-off)
 *
 * Gera os 4 arquivos canônicos do épico:
 *   data/subprojects/atlas-v1/epics/atlas-v1-fase1/
 *     - forms.json           (25 classes)
 *     - workspaces.json      (6 workspaces por visão de usuário)
 *     - flows.json           (1 flow com 23 etapas — flow-patlas-fase1-proposta-contrato)
 *     - class-groups.json    (agrupamento da aba Classes)
 *
 * Regenerar:  node scripts/build-atlas-v1-fase1.mjs
 *
 * Convenções:
 *   - IDs com prefixo "patlas-".
 *   - Linguagem visível ao usuário: negócio (sem termos técnicos).
 *   - Status sempre textOptions + relevance:'highlight'.
 *   - Cada classe principal tem 1+ preset realista para apresentação.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas-v1/epics/atlas-v1-fase1')
const formsPath = path.join(epicDir, 'forms.json')
const workspacesPath = path.join(epicDir, 'workspaces.json')
const flowsPath = path.join(epicDir, 'flows.json')
const classGroupsPath = path.join(epicDir, 'class-groups.json')

// ============================================================================
// CONSTANTES DE DOMÍNIO
// ============================================================================

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const TIPOS_ORGANIZACAO = [
  'MTI', 'Unidade MTI', 'Cliente/Órgão', 'Parceiro', 'Fornecedor', 'Órgão externo', 'Outro',
]

const STATUS_ORG = ['Ativa', 'Inativa', 'Em validação', 'Bloqueada', 'Suspensa']

const SOLUCOES_MTI = [
  'MTI Cloud', 'MTI Workspace', 'MTI Simplifica', 'MTI Data Security',
  'MTI IA', 'MTI Lab', 'MTI QI', 'MTI Connect', 'MTI SaaS', 'Outra',
]

const METRICAS_PRODUTO = ['USN', 'HST', 'UST', 'Unidade', 'Usuário', 'Mês', 'Projeto', 'Execução', 'Licença', 'Outro']
const METRICAS_LICENCA = ['USN', 'Usuário', 'Licença', 'Unidade', 'Mês', 'Projeto', 'Outro']
const METRICAS_SERVICO = ['HST', 'UST', 'Unidade', 'Execução', 'Projeto', 'Mês', 'Usuário', 'Outro']

const COBRANCA = ['Mensal', 'Anual', 'Sob demanda', 'Por execução', 'Única', 'Pro-rata', 'Outro']

const STATUS_PARCERIA = [
  'Ativa', 'Homologada', 'Paralisada', 'Suspensa', 'Em homologação', 'Em reajuste', 'Em validação',
]

const STATUS_PRODUTO = ['Ativo', 'Inativo', 'Suspenso', 'Paralisado', 'Em validação', 'Em homologação']

const TIPO_CONTRATACAO = ['Objeto específico', 'Catálogo do produto', 'Catálogo geral/ecossistema']

const INDICE_REAJUSTE = ['IPCA', 'ICTI', 'Outro']

const MODELO_VENDA = ['Por licença', 'Por usuário', 'Por pacote', 'Por consumo', 'Por catálogo', 'Outro']

const STATUS_DEMANDA = [
  'Recebida', 'Em análise DIRC', 'Aguardando complemento', 'Em composição de proposta',
  'Enviada ao parceiro', 'Aguardando parceiro', 'Convertida em proposta', 'Rejeitada', 'Cancelada',
]

const ORIGEM_DEMANDA = ['E-mail', 'WhatsApp', 'Marketplace/site comercial', 'Reunião', 'Parceiro', 'Portal futuro', 'Outro']

const TIPO_DEMANDA = [
  'Nova contratação', 'Renovação', 'Ampliação', 'Substituição',
  'Proposta complementar', 'Estudo de viabilidade', 'Outro',
]

const STATUS_PROPOSTA = [
  'Em composição', 'Em análise DIRC', 'Aguardando parceiro', 'Em revisão',
  'Em geração de documento', 'Em assinatura', 'Aprovada', 'Enviada ao cliente',
  'Aguardando retorno do cliente', 'Contrato recebido', 'Contrato cadastrado', 'Cancelada',
]

const STATUS_ITEM_PROPOSTA = ['Em composição', 'Aceito', 'Ajustado', 'Substituído', 'Removido', 'Cancelado']

const ORIGEM_ITEM_PROPOSTA = ['Produto vigente', 'Licença', 'Serviço', 'Manual']

const TIPO_DOCUMENTO = ['Proposta', 'Contrato', 'Handover', 'Termo', 'Anexo', 'Outro']

const STATUS_DOCUMENTO_TEMPLATE = ['Rascunho', 'Publicado', 'Arquivado', 'Substituído']
const STATUS_DOCUMENTO_GERADO = [
  'Gerado', 'Em revisão', 'Enviado para assinatura', 'Assinado', 'Enviado ao cliente', 'Cancelado',
]

const DOMINIO_WORKFLOW = ['Proposta', 'Contrato', 'Documento', 'Assinatura', 'Handover', 'Outro']

const AREA_DONA = ['DIRC', 'DTIC', 'Presidência', 'Parceiro', 'Pós-vendas', 'Sistema']

const STATUS_WORKFLOW = ['Rascunho', 'Ativo', 'Suspenso', 'Substituído', 'Arquivado']

const TIPO_ETAPA_WF = [
  'Entrada', 'Edição', 'Revisão', 'Assinatura', 'Notificação',
  'Contrato', 'Integração', 'Externa', 'Encerramento',
]

const GRUPO_ASSINATURA = ['DIRC', 'Parceiro', 'DTIC', 'Presidência']

const STATUS_ASSINATURA = [
  'Pendente', 'Enviado', 'Assinado', 'Ajuste solicitado', 'Reprovado', 'Cancelado', 'Dispensado',
]

const RESULTADO_ASSINATURA = ['Assinado', 'Ajuste', 'Reprovado', 'Dispensado']

const STATUS_CONTRATO = [
  'Recebido', 'Em revisão', 'Itens revisados', 'Cliente cadastrado',
  'Integrações pendentes', 'Publicação pendente', 'Publicado',
  'Handover gerado', 'Kick-off agendado', 'Finalizado', 'Cancelado',
]

const TIPO_DIVERGENCIA = [
  'Redução de escopo', 'Alteração de quantidade', 'Item removido', 'Item substituído',
  'Ajuste de valor', 'Erro do cliente', 'Adequação contratual', 'Outro',
]

const STATUS_INTEGRACAO = [
  'Não enviado', 'Pendente', 'Enviado', 'Confirmado', 'Erro', 'Reprocessado', 'Dispensado',
]

const TIPO_INTEGRACAO_EVENTO = ['Cadastro', 'Consulta', 'Envio', 'Retorno', 'Reprocessamento', 'Cancelamento']

const SISTEMA_INTEGRACAO = ['Protheus', 'ServiceNow', 'CMDB futuro', 'ClickSense futuro', 'Outro']

const STATUS_RECORRENCIA = ['Configurada', 'Pendente', 'Suspensa', 'Cancelada']

const STATUS_PUBLICACAO = ['Pendente', 'Registrada', 'Inválida', 'Cancelada']

const STATUS_HANDOVER = [
  'Pendente', 'Gerado', 'Enviado', 'Aguardando kick-off', 'Kick-off agendado', 'Concluído', 'Cancelado',
]

const STATUS_KICKOFF = ['Aguardando agendamento', 'Agendado', 'Realizado', 'Reagendar', 'Cancelado']

const TIPO_NOTIFICACAO = ['Assinatura', 'Atraso', 'Proposta', 'Contrato', 'Cliente', 'Pós-vendas', 'Integração', 'Kick-off']
const CANAL_NOTIFICACAO = ['E-mail', 'Sistema', 'Portal futuro', 'Manual']
const STATUS_NOTIFICACAO = ['Pendente', 'Enviada', 'Erro', 'Reenviada', 'Cancelada']

const TIPO_HISTORICO = [
  'Criado', 'Alterado', 'Enviado', 'Aprovado', 'Assinado', 'Reprovado',
  'Cancelado', 'Integrado', 'Erro', 'Notificado',
]

const STATUS_PESSOA = ['Ativo', 'Inativo', 'Bloqueado', 'Substituído', 'Aguardando validação']
const VINCULO_PESSOA = ['MTI interno', 'Parceiro', 'Cliente', 'Terceiro', 'Outro']
const PAPEL_ASSINATURA = ['DIRC', 'Parceiro', 'DTIC', 'Presidência', 'Pós-vendas', 'Técnico', 'Outro']

const TIPO_AUTENTICACAO = ['MT Login', 'Gov.br', 'AD/LDAP', 'Usuário e senha', 'Integração futura']
const PERFIL_USUARIO = [
  'Administrador Atlas', 'Analista DIRC', 'Parceiro', 'Assinante DTIC', 'Presidência',
  'Pós-vendas', 'Cliente/consulta', 'Consulta interna',
]
const GRUPOS_ACESSO = ['Administração', 'Catálogo', 'Propostas', 'Assinaturas', 'Contratos', 'Integrações', 'Painéis']
const STATUS_USUARIO = ['Ativo', 'Inativo', 'Bloqueado', 'Aguardando primeiro acesso', 'Aguardando validação']

const TIPO_ESTRUTURA = ['Presidência', 'Diretoria', 'Gerência', 'Unidade', 'Coordenação', 'Núcleo', 'Outra']
const STATUS_ESTRUTURA = ['Ativa', 'Inativa', 'Substituída', 'Em revisão']

const TIPO_CARGO = [
  'Presidente', 'Diretor', 'Gerente', 'Analista', 'Assinante',
  'Responsável técnico', 'Pós-vendas', 'Cliente', 'Parceiro', 'Outro',
]
const STATUS_CARGO = ['Ativo', 'Inativo', 'Em revisão']

const COMPLEXIDADE_SERVICO = ['Sem complexidade', 'Baixa', 'Média', 'Alta', 'Especial']
const CATEGORIA_SERVICO = [
  'Serviço técnico', 'Implantação', 'Sustentação', 'Consultoria',
  'Treinamento', 'Cloud', 'SaaS', 'Outro',
]

const RESULTADO_DIRC = ['Prosseguir', 'Solicitar complemento', 'Enviar ao parceiro', 'Rejeitar', 'Cancelar']

const PRIORIDADE = ['Normal', 'Alta', 'Urgente']

// Paleta de cores dos ícones dos presets
const COLORS = [
  '#0c1ba8', '#7c3aed', '#0d9488', '#0369a1', '#059669',
  '#1e40af', '#b45309', '#dc2626', '#6d28d9', '#0891b2',
]
const pick = (i) => COLORS[i % COLORS.length]

// IDs canônicos (referenciados em vários formulários)
const F_ORG = 'form-patlas-organizacao'
const F_PES = 'form-patlas-pessoa'
const F_USR = 'form-patlas-usuario'
const F_EST = 'form-patlas-estrutura-mti'
const F_CGF = 'form-patlas-cargo-funcao'
const F_PV = 'form-patlas-produto-vigente'
const F_LIC = 'form-patlas-catalogo-licenca'
const F_SRV = 'form-patlas-catalogo-servico'
const F_DEM = 'form-patlas-demanda'
const F_PRP = 'form-patlas-proposta'
const F_PRI = 'form-patlas-proposta-item'
const F_DTP = 'form-patlas-documento-template'
const F_DGD = 'form-patlas-documento-gerado'
const F_WFM = 'form-patlas-workflow-modelo'
const F_WFE = 'form-patlas-workflow-etapa'
const F_TRA = 'form-patlas-tramite-assinatura'
const F_CTR = 'form-patlas-contrato'
const F_CTI = 'form-patlas-contrato-item'
const F_REC = 'form-patlas-recorrencia-cobranca'
const F_PUB = 'form-patlas-publicacao-contrato'
const F_IGE = 'form-patlas-integracao-evento'
const F_HOV = 'form-patlas-handover'
const F_KOF = 'form-patlas-kickoff'
const F_NTF = 'form-patlas-notificacao'
const F_HST = 'form-patlas-historico-processo'

// ============================================================================
// HELPERS
// ============================================================================

/** Cria um FormField com defaults consistentes. */
function f(id, label, type, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.currency ? { currency: true } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
    spec: opts.spec ?? '',
  }
}

/** Cria uma FormSection (aba ou painel de acordeão). */
function sec(id, title, icon) {
  return { id, title, ...(icon ? { icon } : {}) }
}

/** Cria um FormMethod. */
function m(id, name, icon, kind = 'destaque') {
  return { id, name, icon, kind }
}

/** Cria um FormExampleValuePreset. */
function p(id, name, color, fieldValues, embeddedRowsByFieldId) {
  return {
    id,
    name,
    iconColor: color,
    ...(fieldValues ? { fieldValues } : {}),
    ...(embeddedRowsByFieldId ? { embeddedRowsByFieldId } : {}),
  }
}

// ============================================================================
// FORM 1 — ORGANIZAÇÃO
// ============================================================================

const orgSections = [
  sec('sec-patlas-org-dados', 'Dados principais', 'business'),
  sec('sec-patlas-org-contatos', 'Contatos', 'contacts'),
  sec('sec-patlas-org-endereco', 'Endereço', 'location_on'),
  sec('sec-patlas-org-vinculos', 'Vínculos', 'hub'),
  sec('sec-patlas-org-status', 'Status e observações', 'flag'),
]

const formOrganizacao = {
  id: F_ORG,
  name: 'Organização',
  sectionLayout: 'tabs',
  sections: orgSections,
  defaultCanvasMode: 'read',
  metadata: 'Cadastra MTI, unidades MTI, clientes, órgãos, parceiros e demais organizações.',
  fields: [
    f('patlas-org-nome', 'Nome da organização', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-org-dados' }),
    f('patlas-org-tipo', 'Tipo da organização', 'textOptions', { required: true, relevance: 'highlight', options: TIPOS_ORGANIZACAO, sectionId: 'sec-patlas-org-dados' }),
    f('patlas-org-cnpj', 'CNPJ', 'text', { required: false, relevance: 'highlight', sectionId: 'sec-patlas-org-dados', spec: 'Obrigatório para pessoa jurídica. Máscara CNPJ.' }),
    f('patlas-org-razao', 'Razão social', 'text', { size: 'large', sectionId: 'sec-patlas-org-dados' }),
    f('patlas-org-fantasia', 'Nome fantasia', 'text', { sectionId: 'sec-patlas-org-dados' }),
    f('patlas-org-sigla', 'Sigla', 'text', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-org-dados' }),
    f('patlas-org-email', 'E-mail institucional', 'text', { sectionId: 'sec-patlas-org-contatos' }),
    f('patlas-org-tel', 'Telefone institucional', 'text', { sectionId: 'sec-patlas-org-contatos' }),
    f('patlas-org-site', 'Site', 'text', { size: 'large', relevance: 'advanced', sectionId: 'sec-patlas-org-contatos' }),
    f('patlas-org-cep', 'CEP', 'text', { size: 'small', sectionId: 'sec-patlas-org-endereco' }),
    f('patlas-org-end', 'Endereço', 'text', { size: 'large', sectionId: 'sec-patlas-org-endereco' }),
    f('patlas-org-numero', 'Número', 'text', { size: 'small', sectionId: 'sec-patlas-org-endereco' }),
    f('patlas-org-comp', 'Complemento', 'text', { sectionId: 'sec-patlas-org-endereco' }),
    f('patlas-org-bairro', 'Bairro', 'text', { sectionId: 'sec-patlas-org-endereco' }),
    f('patlas-org-municipio', 'Município', 'text', { sectionId: 'sec-patlas-org-endereco' }),
    f('patlas-org-uf', 'UF', 'textOptions', { size: 'small', options: UFS, sectionId: 'sec-patlas-org-endereco' }),
    f('patlas-org-superior', 'Organização superior', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlas-org-vinculos' }),
    f('patlas-org-responsavel', 'Responsável principal', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-org-vinculos' }),
    f('patlas-org-contatos', 'Contatos de notificação', 'embeddedReference', { multiple: true, linkedFormId: F_PES, embeddedDisplay: 'table', size: 'large', sectionId: 'sec-patlas-org-vinculos' }),
    f('patlas-org-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_ORG, sectionId: 'sec-patlas-org-status' }),
    f('patlas-org-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-org-status' }),
  ],
  methods: [
    m('patlas-org-meth-validar', 'Validar organização', 'verified', 'destaque'),
    m('patlas-org-meth-inativar', 'Inativar organização', 'block', 'menu'),
    m('patlas-org-meth-reativar', 'Reativar organização', 'restart_alt', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-org-p-mti', 'MTI — Organização interna', pick(0), {
      'patlas-org-nome': 'MTI — Companhia Mato-grossense de Tecnologia da Informação',
      'patlas-org-tipo': 'MTI',
      'patlas-org-cnpj': '03.507.415/0001-44',
      'patlas-org-sigla': 'MTI',
      'patlas-org-uf': 'MT',
      'patlas-org-municipio': 'Cuiabá',
      'patlas-org-status': 'Ativa',
    }),
    p('patlas-org-p-dirc', 'DIRC — Unidade MTI', pick(1), {
      'patlas-org-nome': 'DIRC — Diretoria Comercial da MTI',
      'patlas-org-tipo': 'Unidade MTI',
      'patlas-org-sigla': 'DIRC',
      'patlas-org-status': 'Ativa',
    }),
    p('patlas-org-p-parceiro', 'Parceiro ativo (Atos)', pick(2), {
      'patlas-org-nome': 'Atos Brasil Tecnologia LTDA.',
      'patlas-org-tipo': 'Parceiro',
      'patlas-org-cnpj': '42.000.111/0001-22',
      'patlas-org-fantasia': 'Atos Brasil',
      'patlas-org-sigla': 'ATOS',
      'patlas-org-uf': 'SP',
      'patlas-org-municipio': 'São Paulo',
      'patlas-org-status': 'Ativa',
    }),
    p('patlas-org-p-cliente', 'Cliente/Órgão identificado (TJMT)', pick(3), {
      'patlas-org-nome': 'Tribunal de Justiça do Estado de Mato Grosso',
      'patlas-org-tipo': 'Cliente/Órgão',
      'patlas-org-cnpj': '03.535.606/0001-10',
      'patlas-org-sigla': 'TJMT',
      'patlas-org-uf': 'MT',
      'patlas-org-municipio': 'Cuiabá',
      'patlas-org-status': 'Em validação',
    }),
  ],
  activeExamplePresetId: 'patlas-org-p-cliente',
}

// ============================================================================
// FORM 2 — PESSOA
// ============================================================================

const pesSections = [
  sec('sec-patlas-pes-dados', 'Dados pessoais', 'person'),
  sec('sec-patlas-pes-contato', 'Contato', 'mail'),
  sec('sec-patlas-pes-org', 'Organização e função', 'business'),
  sec('sec-patlas-pes-assinatura', 'Assinatura e notificações', 'edit_note'),
  sec('sec-patlas-pes-obs', 'Observações', 'sticky_note_2'),
]

const formPessoa = {
  id: F_PES,
  name: 'Pessoa',
  sectionLayout: 'tabs',
  sections: pesSections,
  defaultCanvasMode: 'read',
  metadata: 'Cadastra pessoas vinculadas a organizações (MTI interno, cliente, parceiro, terceiro).',
  fields: [
    f('patlas-pes-nome', 'Nome completo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-pes-dados' }),
    f('patlas-pes-cpf', 'CPF', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-pes-dados' }),
    f('patlas-pes-rg', 'RG', 'text', { sectionId: 'sec-patlas-pes-dados' }),
    f('patlas-pes-matricula', 'Matrícula', 'text', { relevance: 'highlight', sectionId: 'sec-patlas-pes-dados', spec: 'Obrigatória para vínculo MTI interno.' }),
    f('patlas-pes-email', 'E-mail', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-pes-contato' }),
    f('patlas-pes-tel', 'Telefone', 'text', { sectionId: 'sec-patlas-pes-contato' }),
    f('patlas-pes-end', 'Endereço', 'text', { size: 'large', relevance: 'advanced', sectionId: 'sec-patlas-pes-contato' }),
    f('patlas-pes-org', 'Organização', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-pes-org' }),
    f('patlas-pes-vinculo', 'Tipo de vínculo', 'textOptions', { required: true, options: VINCULO_PESSOA, sectionId: 'sec-patlas-pes-org' }),
    f('patlas-pes-cargo', 'Cargo/Função', 'reference', { linkedFormId: F_CGF, sectionId: 'sec-patlas-pes-org' }),
    f('patlas-pes-lotacao', 'Lotação/Unidade', 'reference', { linkedFormId: F_EST, sectionId: 'sec-patlas-pes-org' }),
    f('patlas-pes-assina', 'Pode assinar', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlas-pes-assinatura' }),
    f('patlas-pes-papel', 'Papel de assinatura', 'textOptions', { options: PAPEL_ASSINATURA, sectionId: 'sec-patlas-pes-assinatura' }),
    f('patlas-pes-notif', 'Recebe notificações', 'boolean', { sectionId: 'sec-patlas-pes-assinatura' }),
    f('patlas-pes-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PESSOA, sectionId: 'sec-patlas-pes-obs' }),
    f('patlas-pes-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-pes-obs' }),
  ],
  methods: [
    m('patlas-pes-meth-validar', 'Validar pessoa', 'verified', 'destaque'),
    m('patlas-pes-meth-usuario', 'Vincular usuário', 'badge', 'destaque'),
    m('patlas-pes-meth-bloquear', 'Bloquear pessoa', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-pes-p-dirc', 'Analista DIRC', pick(0), {
      'patlas-pes-nome': 'Mariana Oliveira',
      'patlas-pes-cpf': '012.345.678-90',
      'patlas-pes-matricula': 'MTI-00214',
      'patlas-pes-email': 'mariana.oliveira@mti.mt.gov.br',
      'patlas-pes-vinculo': 'MTI interno',
      'patlas-pes-assina': false,
      'patlas-pes-notif': true,
      'patlas-pes-status': 'Ativo',
    }),
    p('patlas-pes-p-presidencia', 'Assinante Presidência', pick(1), {
      'patlas-pes-nome': 'Carlos Eduardo Santos',
      'patlas-pes-cpf': '987.654.321-00',
      'patlas-pes-matricula': 'MTI-00001',
      'patlas-pes-email': 'presidencia@mti.mt.gov.br',
      'patlas-pes-vinculo': 'MTI interno',
      'patlas-pes-assina': true,
      'patlas-pes-papel': 'Presidência',
      'patlas-pes-notif': true,
      'patlas-pes-status': 'Ativo',
    }),
    p('patlas-pes-p-parceiro', 'Contato parceiro', pick(2), {
      'patlas-pes-nome': 'Felipe Garcia',
      'patlas-pes-cpf': '111.222.333-44',
      'patlas-pes-email': 'felipe.garcia@atosbrasil.com.br',
      'patlas-pes-vinculo': 'Parceiro',
      'patlas-pes-assina': true,
      'patlas-pes-papel': 'Parceiro',
      'patlas-pes-status': 'Ativo',
    }),
    p('patlas-pes-p-cliente', 'Solicitante cliente', pick(3), {
      'patlas-pes-nome': 'Juliana Pereira',
      'patlas-pes-email': 'juliana.pereira@tjmt.jus.br',
      'patlas-pes-vinculo': 'Cliente',
      'patlas-pes-status': 'Aguardando validação',
    }),
  ],
  activeExamplePresetId: 'patlas-pes-p-dirc',
}

// ============================================================================
// FORM 3 — USUÁRIO
// ============================================================================

const usrSections = [
  sec('sec-patlas-usr-acesso', 'Dados de acesso', 'login'),
  sec('sec-patlas-usr-perfil', 'Perfil e permissões', 'manage_accounts'),
  sec('sec-patlas-usr-org', 'Organização', 'business'),
  sec('sec-patlas-usr-seg', 'Segurança', 'security'),
  sec('sec-patlas-usr-status', 'Status', 'flag'),
]

const formUsuario = {
  id: F_USR,
  name: 'Usuário',
  sectionLayout: 'tabs',
  sections: usrSections,
  defaultCanvasMode: 'read',
  metadata: 'Controla o acesso ao sistema/protótipo. Cliente só recebe credencial após contrato recebido.',
  fields: [
    f('patlas-usr-nome', 'Nome do usuário', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-usr-acesso' }),
    f('patlas-usr-login', 'Login', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-usr-acesso' }),
    f('patlas-usr-email', 'E-mail', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-usr-acesso' }),
    f('patlas-usr-pessoa', 'Pessoa vinculada', 'reference', { required: true, linkedFormId: F_PES, sectionId: 'sec-patlas-usr-acesso' }),
    f('patlas-usr-org', 'Organização', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlas-usr-org' }),
    f('patlas-usr-auth', 'Tipo de autenticação', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_AUTENTICACAO, sectionId: 'sec-patlas-usr-acesso' }),
    f('patlas-usr-perfil', 'Perfil principal', 'textOptions', { required: true, relevance: 'highlight', options: PERFIL_USUARIO, sectionId: 'sec-patlas-usr-perfil' }),
    f('patlas-usr-cargo', 'Cargo/Função atual', 'reference', { linkedFormId: F_CGF, sectionId: 'sec-patlas-usr-perfil' }),
    f('patlas-usr-grupos', 'Grupos de acesso', 'textOptions', { multiple: true, options: GRUPOS_ACESSO, sectionId: 'sec-patlas-usr-perfil' }),
    f('patlas-usr-assinatura', 'Assinatura habilitada', 'boolean', { sectionId: 'sec-patlas-usr-seg' }),
    f('patlas-usr-receber', 'Recebe e-mail', 'boolean', { sectionId: 'sec-patlas-usr-seg' }),
    f('patlas-usr-ativo', 'Ativo', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-usr-status' }),
    f('patlas-usr-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_USUARIO, sectionId: 'sec-patlas-usr-status' }),
    f('patlas-usr-ultimo', 'Data último acesso', 'date', { relevance: 'advanced', sectionId: 'sec-patlas-usr-status' }),
    f('patlas-usr-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-usr-status' }),
  ],
  methods: [
    m('patlas-usr-meth-cred', 'Enviar credenciais', 'mail', 'destaque'),
    m('patlas-usr-meth-recred', 'Reenviar credenciais', 'forward_to_inbox', 'menu'),
    m('patlas-usr-meth-bloquear', 'Bloquear acesso', 'block', 'menu'),
    m('patlas-usr-meth-reativar', 'Reativar acesso', 'restart_alt', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-usr-p-admin', 'Administrador Atlas', pick(0), {
      'patlas-usr-nome': 'Mariana Oliveira',
      'patlas-usr-login': 'mariana.oliveira',
      'patlas-usr-email': 'mariana.oliveira@mti.mt.gov.br',
      'patlas-usr-auth': 'MT Login',
      'patlas-usr-perfil': 'Administrador Atlas',
      'patlas-usr-grupos': ['Administração', 'Catálogo', 'Propostas', 'Painéis'],
      'patlas-usr-ativo': true,
      'patlas-usr-status': 'Ativo',
    }),
    p('patlas-usr-p-parceiro', 'Usuário parceiro', pick(2), {
      'patlas-usr-nome': 'Felipe Garcia',
      'patlas-usr-login': 'felipe.atos',
      'patlas-usr-email': 'felipe.garcia@atosbrasil.com.br',
      'patlas-usr-auth': 'Gov.br',
      'patlas-usr-perfil': 'Parceiro',
      'patlas-usr-grupos': ['Propostas', 'Assinaturas'],
      'patlas-usr-ativo': true,
      'patlas-usr-status': 'Ativo',
    }),
    p('patlas-usr-p-cliente', 'Cliente (aguardando contrato)', pick(7), {
      'patlas-usr-nome': 'Juliana Pereira',
      'patlas-usr-login': 'juliana.tjmt',
      'patlas-usr-email': 'juliana.pereira@tjmt.jus.br',
      'patlas-usr-auth': 'Gov.br',
      'patlas-usr-perfil': 'Cliente/consulta',
      'patlas-usr-ativo': false,
      'patlas-usr-status': 'Aguardando primeiro acesso',
    }),
  ],
  activeExamplePresetId: 'patlas-usr-p-admin',
}

// ============================================================================
// FORM 4 — ESTRUTURA MTI
// ============================================================================

const formEstrutura = {
  id: F_EST,
  name: 'Estrutura MTI',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Diretoria, gerência, unidade e demais estruturas internas da MTI. Assinaturas devem ser configuradas por cargo/função/estrutura, não por pessoa fixa.',
  fields: [
    f('patlas-est-nome', 'Nome da estrutura', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-est-sigla', 'Sigla', 'text', { size: 'small', relevance: 'highlight' }),
    f('patlas-est-tipo', 'Tipo da estrutura', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_ESTRUTURA }),
    f('patlas-est-superior', 'Estrutura superior', 'reference', { linkedFormId: F_EST }),
    f('patlas-est-titular', 'Responsável titular', 'reference', { linkedFormId: F_PES }),
    f('patlas-est-substituto', 'Responsável substituto', 'reference', { linkedFormId: F_PES }),
    f('patlas-est-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_ESTRUTURA }),
    f('patlas-est-inicio', 'Data início vigência', 'date'),
    f('patlas-est-fim', 'Data fim vigência', 'date'),
    f('patlas-est-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-est-meth-revisar', 'Revisar estrutura', 'edit_note', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-est-p-dirc', 'DIRC', pick(0), {
      'patlas-est-nome': 'DIRC — Diretoria Comercial',
      'patlas-est-sigla': 'DIRC',
      'patlas-est-tipo': 'Diretoria',
      'patlas-est-status': 'Ativa',
    }),
    p('patlas-est-p-dtic', 'DTIC', pick(1), {
      'patlas-est-nome': 'DTIC — Diretoria de Tecnologia',
      'patlas-est-sigla': 'DTIC',
      'patlas-est-tipo': 'Diretoria',
      'patlas-est-status': 'Ativa',
    }),
    p('patlas-est-p-presidencia', 'Presidência', pick(2), {
      'patlas-est-nome': 'Presidência da MTI',
      'patlas-est-sigla': 'PRES',
      'patlas-est-tipo': 'Presidência',
      'patlas-est-status': 'Ativa',
    }),
    p('patlas-est-p-pos', 'Pós-vendas', pick(4), {
      'patlas-est-nome': 'Pós-vendas e Sucesso do Cliente',
      'patlas-est-sigla': 'POS',
      'patlas-est-tipo': 'Coordenação',
      'patlas-est-status': 'Ativa',
    }),
  ],
  activeExamplePresetId: 'patlas-est-p-dirc',
}

// ============================================================================
// FORM 5 — CARGO/FUNÇÃO
// ============================================================================

const formCargo = {
  id: F_CGF,
  name: 'Cargo / Função',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Define funções que recebem permissões, atividades e assinaturas.',
  fields: [
    f('patlas-cgf-nome', 'Nome do cargo/função', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-cgf-tipo', 'Tipo', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_CARGO }),
    f('patlas-cgf-estrutura', 'Estrutura vinculada', 'reference', { linkedFormId: F_EST }),
    f('patlas-cgf-org', 'Organização vinculada', 'reference', { linkedFormId: F_ORG }),
    f('patlas-cgf-titular', 'Ocupante titular', 'reference', { relevance: 'highlight', linkedFormId: F_PES }),
    f('patlas-cgf-substituto', 'Ocupante substituto', 'reference', { linkedFormId: F_PES }),
    f('patlas-cgf-pode-demanda', 'Pode registrar demanda', 'boolean'),
    f('patlas-cgf-pode-editar', 'Pode editar proposta', 'boolean'),
    f('patlas-cgf-pode-aprovar', 'Pode aprovar proposta', 'boolean'),
    f('patlas-cgf-pode-assinar', 'Pode assinar documento', 'boolean', { relevance: 'highlight' }),
    f('patlas-cgf-pode-contrato', 'Pode finalizar contrato', 'boolean'),
    f('patlas-cgf-pode-catalogo', 'Pode administrar catálogo', 'boolean'),
    f('patlas-cgf-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_CARGO }),
    f('patlas-cgf-inicio', 'Data início', 'date'),
    f('patlas-cgf-fim', 'Data fim', 'date'),
  ],
  methods: [
    m('patlas-cgf-meth-substituir', 'Substituir ocupante', 'swap_horiz', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlas-cgf-p-dirc-analista', 'Analista DIRC', pick(0), {
      'patlas-cgf-nome': 'Analista DIRC',
      'patlas-cgf-tipo': 'Analista',
      'patlas-cgf-pode-demanda': true,
      'patlas-cgf-pode-editar': true,
      'patlas-cgf-pode-aprovar': false,
      'patlas-cgf-pode-assinar': false,
      'patlas-cgf-pode-catalogo': false,
      'patlas-cgf-status': 'Ativo',
    }),
    p('patlas-cgf-p-dtic-assinante', 'Assinante DTIC', pick(1), {
      'patlas-cgf-nome': 'Assinante DTIC',
      'patlas-cgf-tipo': 'Assinante',
      'patlas-cgf-pode-assinar': true,
      'patlas-cgf-status': 'Ativo',
    }),
    p('patlas-cgf-p-pres', 'Presidente', pick(2), {
      'patlas-cgf-nome': 'Presidente da MTI',
      'patlas-cgf-tipo': 'Presidente',
      'patlas-cgf-pode-assinar': true,
      'patlas-cgf-pode-aprovar': true,
      'patlas-cgf-status': 'Ativo',
    }),
    p('patlas-cgf-p-parceiro', 'Assinante Parceiro', pick(3), {
      'patlas-cgf-nome': 'Representante Parceiro',
      'patlas-cgf-tipo': 'Parceiro',
      'patlas-cgf-pode-assinar': true,
      'patlas-cgf-status': 'Ativo',
    }),
  ],
  activeExamplePresetId: 'patlas-cgf-p-dirc-analista',
}

// ============================================================================
// FORM 6 — PRODUTO VIGENTE
// ============================================================================

const pvSections = [
  sec('sec-patlas-pv-ident', 'Identificação do produto', 'inventory_2'),
  sec('sec-patlas-pv-cobr', 'Cobrança e valores', 'paid'),
  sec('sec-patlas-pv-resp', 'Responsáveis e atendimento', 'support_agent'),
  sec('sec-patlas-pv-cod', 'Códigos e integrações', 'qr_code_2'),
  sec('sec-patlas-pv-cat', 'Catálogo e parceria', 'handshake'),
  sec('sec-patlas-pv-status', 'Status e observações', 'flag'),
]

const formProdutoVigente = {
  id: F_PV,
  name: 'Produto Vigente',
  sectionLayout: 'tabs',
  sections: pvSections,
  defaultCanvasMode: 'read',
  metadata: 'Produto comercial vigente da MTI. Só produtos Ativos podem ser selecionados em nova proposta.',
  fields: [
    f('patlas-pv-descricao', 'Descrição do produto', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true, sectionId: 'sec-patlas-pv-ident' }),
    f('patlas-pv-solucao', 'Solução', 'textOptions', { required: true, relevance: 'highlight', options: SOLUCOES_MTI, sectionId: 'sec-patlas-pv-ident' }),
    f('patlas-pv-metrica', 'Métrica', 'textOptions', { size: 'small', required: true, relevance: 'highlight', options: METRICAS_PRODUTO, sectionId: 'sec-patlas-pv-cobr' }),
    f('patlas-pv-cobranca', 'Cobrança', 'textOptions', { required: true, relevance: 'highlight', options: COBRANCA, sectionId: 'sec-patlas-pv-cobr' }),
    f('patlas-pv-valor', 'Valor unitário (R$)', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-pv-cobr' }),
    f('patlas-pv-fator', 'Fator de conversão', 'decimal', { size: 'small', sectionId: 'sec-patlas-pv-cobr' }),
    f('patlas-pv-focal-vendas', 'Focal de vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-pv-resp' }),
    f('patlas-pv-focal-pos', 'Focal de pós-vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-pv-resp' }),
    f('patlas-pv-unidade', 'Unidade DTIC', 'reference', { linkedFormId: F_EST, sectionId: 'sec-patlas-pv-resp' }),
    f('patlas-pv-parceiro', 'Parceiro', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlas-pv-cat' }),
    f('patlas-pv-link-cat', 'Link do catálogo de parceria', 'text', { size: 'large', relevance: 'advanced', sectionId: 'sec-patlas-pv-cat' }),
    f('patlas-pv-siag-item', 'Código SIAG — item específico', 'text', { sectionId: 'sec-patlas-pv-cod' }),
    f('patlas-pv-protheus-item', 'Código Protheus — item específico', 'text', { sectionId: 'sec-patlas-pv-cod' }),
    f('patlas-pv-siag-prod', 'Código SIAG — catálogo do produto', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-pv-cod' }),
    f('patlas-pv-protheus-prod', 'Código Protheus — catálogo do produto', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-pv-cod' }),
    f('patlas-pv-siag-ger', 'Código SIAG — catálogo geral/ecossistema', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-pv-cod' }),
    f('patlas-pv-protheus-ger', 'Código Protheus — catálogo geral/ecossistema', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-pv-cod' }),
    f('patlas-pv-status', 'Status do produto', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PRODUTO, sectionId: 'sec-patlas-pv-status' }),
    f('patlas-pv-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-pv-status' }),
  ],
  methods: [
    m('patlas-pv-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
    m('patlas-pv-meth-historico', 'Visualizar histórico', 'history', 'menu'),
    m('patlas-pv-meth-bloquear', 'Bloquear comercialização', 'block', 'menu'),
    m('patlas-pv-meth-reativar', 'Reativar produto', 'restart_alt', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-pv-p-saas-ativo', 'Produto ativo MTI SaaS', pick(0), {
      'patlas-pv-descricao': 'MTI SaaS — Licença de Ambiente X-VIA de Interoperabilidade',
      'patlas-pv-solucao': 'MTI SaaS',
      'patlas-pv-metrica': 'Licença',
      'patlas-pv-cobranca': 'Anual',
      'patlas-pv-valor': 18713.25,
      'patlas-pv-siag-item': '0016793',
      'patlas-pv-protheus-item': '32000443',
      'patlas-pv-status': 'Ativo',
    }),
    p('patlas-pv-p-cloud-demanda', 'Produto MTI Cloud sob demanda', pick(1), {
      'patlas-pv-descricao': 'MTI Cloud — Instância padrão (vCPU, RAM, Storage)',
      'patlas-pv-solucao': 'MTI Cloud',
      'patlas-pv-metrica': 'Mês',
      'patlas-pv-cobranca': 'Sob demanda',
      'patlas-pv-valor': 587.4,
      'patlas-pv-siag-item': '0019912',
      'patlas-pv-protheus-item': '32000511',
      'patlas-pv-status': 'Ativo',
    }),
    p('patlas-pv-p-paralisado', 'Produto paralisado (consulta)', pick(7), {
      'patlas-pv-descricao': 'MTI Connect — Pacote legado de integração on-premise',
      'patlas-pv-solucao': 'MTI Connect',
      'patlas-pv-metrica': 'Unidade',
      'patlas-pv-cobranca': 'Anual',
      'patlas-pv-valor': 4980,
      'patlas-pv-status': 'Paralisado',
    }),
  ],
  activeExamplePresetId: 'patlas-pv-p-saas-ativo',
}

// ============================================================================
// FORM 7 — CATÁLOGO DE LICENÇA
// ============================================================================

const licSections = [
  sec('sec-patlas-lic-dados', 'Dados principais', 'license'),
  sec('sec-patlas-lic-cobr', 'Cobrança e vigência', 'paid'),
  sec('sec-patlas-lic-val', 'Valores e distribuição', 'payments'),
  sec('sec-patlas-lic-cod', 'Códigos e formas de contratação', 'qr_code_2'),
  sec('sec-patlas-lic-ref', 'Referência histórica', 'history'),
  sec('sec-patlas-lic-obs', 'Observações', 'sticky_note_2'),
]

const formCatalogoLicenca = {
  id: F_LIC,
  name: 'Catálogo de Licença',
  sectionLayout: 'tabs',
  sections: licSections,
  defaultCanvasMode: 'read',
  metadata: 'Licença comercial homologada por parceria. Universal = pode compor catálogo maior; Individualizado = pode ser contratada como item específico.',
  fields: [
    f('patlas-lic-parceria', 'Parceria', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-lic-dados' }),
    f('patlas-lic-objeto', 'Objeto comercial', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-lic-dados' }),
    f('patlas-lic-produto', 'Produto catálogo comercial', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-lic-dados' }),
    f('patlas-lic-partnum', 'PART Number', 'text', { relevance: 'highlight', sectionId: 'sec-patlas-lic-dados' }),
    f('patlas-lic-grupo', 'Grupo', 'text', { sectionId: 'sec-patlas-lic-dados' }),
    f('patlas-lic-metrica', 'Métrica', 'textOptions', { size: 'small', required: true, relevance: 'highlight', options: METRICAS_LICENCA, sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-versao', 'Versão catálogo', 'text', { size: 'small', sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-status', 'Status parceria', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PARCERIA, sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-recor', 'Recorrência de cobrança', 'textOptions', { required: true, relevance: 'highlight', options: COBRANCA, sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-modelo', 'Modelo de venda', 'textOptions', { options: MODELO_VENDA, sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-vigencia', 'Vigência', 'text', { size: 'small', sectionId: 'sec-patlas-lic-cobr', spec: 'Ex.: 12 meses' }),
    f('patlas-lic-universal', 'Universal', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-individualizado', 'Individualizado', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-valor', 'Valor unitário (R$)', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-lic-val' }),
    f('patlas-lic-custo', 'Custo parceiro (R$)', 'decimal', { currency: true, sectionId: 'sec-patlas-lic-val' }),
    f('patlas-lic-markup', 'Markup', 'decimal', { size: 'small', sectionId: 'sec-patlas-lic-val' }),
    f('patlas-lic-dist-parc', 'Distribuição parceiro', 'decimal', { size: 'small', sectionId: 'sec-patlas-lic-val' }),
    f('patlas-lic-dist-mti', 'Distribuição MTI', 'decimal', { size: 'small', sectionId: 'sec-patlas-lic-val' }),
    f('patlas-lic-siag-item', 'Código SIAG — item específico', 'text', { sectionId: 'sec-patlas-lic-cod' }),
    f('patlas-lic-protheus-item', 'Código Protheus — item específico', 'text', { sectionId: 'sec-patlas-lic-cod' }),
    f('patlas-lic-siag-prod', 'Código SIAG — catálogo do produto', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-lic-cod' }),
    f('patlas-lic-protheus-prod', 'Código Protheus — catálogo do produto', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-lic-cod' }),
    f('patlas-lic-siag-ger', 'Código SIAG — catálogo geral/ecossistema', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-lic-cod' }),
    f('patlas-lic-protheus-ger', 'Código Protheus — catálogo geral/ecossistema', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-lic-cod' }),
    f('patlas-lic-data-preco', 'Data atualização preço', 'date', { sectionId: 'sec-patlas-lic-ref' }),
    f('patlas-lic-indice', 'Índice de reajuste', 'textOptions', { options: INDICE_REAJUSTE, sectionId: 'sec-patlas-lic-ref' }),
    f('patlas-lic-homolog', 'Última homologação', 'date', { sectionId: 'sec-patlas-lic-ref' }),
    f('patlas-lic-obs', 'Observações gerais', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-lic-obs' }),
  ],
  methods: [
    m('patlas-lic-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
    m('patlas-lic-meth-historico', 'Visualizar histórico', 'history', 'menu'),
    m('patlas-lic-meth-bloquear', 'Bloquear comercialização', 'block', 'menu'),
    m('patlas-lic-meth-reativar', 'Reativar licença', 'restart_alt', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-lic-p-workspace', 'Licença MTI Workspace ativa', pick(0), {
      'patlas-lic-objeto': 'MTI Workspace — Soluções de Colaboração e Produtividade em Nuvem',
      'patlas-lic-produto': 'MTI Workspace Enterprise Standard Ecrypt - 5 TB',
      'patlas-lic-grupo': 'Mínimo 300 Contas, 5 TB de Armazenamento',
      'patlas-lic-metrica': 'USN',
      'patlas-lic-versao': '5.0',
      'patlas-lic-status': 'Ativa',
      'patlas-lic-recor': 'Anual',
      'patlas-lic-modelo': 'Por licença',
      'patlas-lic-vigencia': '12 meses',
      'patlas-lic-universal': true,
      'patlas-lic-individualizado': false,
      'patlas-lic-valor': 1070.92,
      'patlas-lic-custo': 907.56,
      'patlas-lic-markup': 1.18,
      'patlas-lic-dist-parc': 0.84,
      'patlas-lic-dist-mti': 0.16,
      'patlas-lic-siag-item': '111055',
      'patlas-lic-protheus-item': '32000089',
    }),
    p('patlas-lic-p-paralisada', 'Licença paralisada', pick(7), {
      'patlas-lic-objeto': 'MTI Workspace — Versão legada',
      'patlas-lic-produto': 'MTI Workspace Frontline Starter Ecrypt - 5 GB',
      'patlas-lic-metrica': 'USN',
      'patlas-lic-versao': '4.0',
      'patlas-lic-status': 'Paralisada',
      'patlas-lic-recor': 'Anual',
      'patlas-lic-universal': false,
      'patlas-lic-individualizado': true,
      'patlas-lic-valor': 241.05,
    }),
    p('patlas-lic-p-simplifica', 'MTI Simplifica — Solução Adicional', pick(1), {
      'patlas-lic-objeto': 'MTI Simplifica — Solução Adicional (Justiça Digital)',
      'patlas-lic-produto': 'VLCS | VALOR DO LICENCIAMENTO COMO SERVIÇO (Mensal)',
      'patlas-lic-metrica': 'USN',
      'patlas-lic-versao': '1.5',
      'patlas-lic-status': 'Ativa',
      'patlas-lic-recor': 'Mensal',
      'patlas-lic-modelo': 'Por catálogo',
      'patlas-lic-universal': false,
      'patlas-lic-individualizado': true,
      'patlas-lic-valor': 32112.2,
      'patlas-lic-markup': 1.25,
    }),
  ],
  activeExamplePresetId: 'patlas-lic-p-workspace',
}

// ============================================================================
// FORM 8 — CATÁLOGO DE SERVIÇO
// ============================================================================

const srvSections = [
  sec('sec-patlas-srv-ident', 'Identificação do serviço', 'support_agent'),
  sec('sec-patlas-srv-cobr', 'Cobrança e recorrência', 'paid'),
  sec('sec-patlas-srv-val', 'Valores e distribuição', 'payments'),
  sec('sec-patlas-srv-cod', 'Códigos e formas de contratação', 'qr_code_2'),
  sec('sec-patlas-srv-rea', 'Reajuste e homologação', 'history'),
  sec('sec-patlas-srv-obs', 'Observações', 'sticky_note_2'),
]

const formCatalogoServico = {
  id: F_SRV,
  name: 'Catálogo de Serviço',
  sectionLayout: 'tabs',
  sections: srvSections,
  defaultCanvasMode: 'read',
  metadata: 'Serviço técnico homologado por parceria. Valor unitário fica na aba Valores e distribuição.',
  fields: [
    f('patlas-srv-parceria', 'Parceria / nome comercial', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-srv-ident' }),
    f('patlas-srv-produto', 'Produto do catálogo comercial', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-srv-ident' }),
    f('patlas-srv-descricao', 'Descrição do serviço', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-srv-ident' }),
    f('patlas-srv-grupo', 'Grupo', 'text', { sectionId: 'sec-patlas-srv-ident' }),
    f('patlas-srv-categoria', 'Categoria do objeto comercial', 'textOptions', { required: true, relevance: 'highlight', options: CATEGORIA_SERVICO, sectionId: 'sec-patlas-srv-ident' }),
    f('patlas-srv-metrica', 'Métrica', 'textOptions', { size: 'small', required: true, relevance: 'highlight', options: METRICAS_SERVICO, sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-complexidade', 'Complexidade', 'textOptions', { relevance: 'highlight', options: COMPLEXIDADE_SERVICO, sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-qtd-hst', 'Quantidade HST/UST por execução', 'decimal', { sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-versao', 'Versão catálogo', 'text', { size: 'small', sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-status', 'Status parceria', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PARCERIA, sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-tipo-cobr', 'Tipo de cobrança', 'textOptions', { required: true, relevance: 'highlight', options: COBRANCA, sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-recor', 'Recorrência cobrança', 'textOptions', { required: true, options: COBRANCA, sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-universal', 'Universal', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-individualizado', 'Individualizado', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-valor', 'Valor de comercialização unitário (R$)', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-srv-val' }),
    f('patlas-srv-custo', 'Custo unitário parceiro (R$)', 'decimal', { currency: true, sectionId: 'sec-patlas-srv-val' }),
    f('patlas-srv-markup', 'Markup', 'decimal', { size: 'small', sectionId: 'sec-patlas-srv-val' }),
    f('patlas-srv-dist-parc', 'Distribuição parceiro', 'decimal', { size: 'small', sectionId: 'sec-patlas-srv-val' }),
    f('patlas-srv-dist-mti', 'Distribuição MTI', 'decimal', { size: 'small', sectionId: 'sec-patlas-srv-val' }),
    f('patlas-srv-siag-item', 'Código SIAG — item específico', 'text', { sectionId: 'sec-patlas-srv-cod' }),
    f('patlas-srv-protheus-item', 'Código Protheus — item específico', 'text', { sectionId: 'sec-patlas-srv-cod' }),
    f('patlas-srv-siag-prod', 'Código SIAG — catálogo do produto', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-srv-cod' }),
    f('patlas-srv-protheus-prod', 'Código Protheus — catálogo do produto', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-srv-cod' }),
    f('patlas-srv-siag-ger', 'Código SIAG — catálogo geral/ecossistema', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-srv-cod' }),
    f('patlas-srv-protheus-ger', 'Código Protheus — catálogo geral/ecossistema', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-srv-cod' }),
    f('patlas-srv-data-preco', 'Data atualização preço', 'date', { sectionId: 'sec-patlas-srv-rea' }),
    f('patlas-srv-indice', 'Índice de reajuste', 'textOptions', { options: INDICE_REAJUSTE, sectionId: 'sec-patlas-srv-rea' }),
    f('patlas-srv-homolog', 'Última homologação', 'date', { sectionId: 'sec-patlas-srv-rea' }),
    f('patlas-srv-obs', 'Observações gerais', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-srv-obs' }),
  ],
  methods: [
    m('patlas-srv-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
    m('patlas-srv-meth-historico', 'Visualizar histórico', 'history', 'menu'),
    m('patlas-srv-meth-bloquear', 'Bloquear comercialização', 'block', 'menu'),
    m('patlas-srv-meth-reativar', 'Reativar serviço', 'restart_alt', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-srv-p-cloud', 'Serviço técnico cloud ativo', pick(0), {
      'patlas-srv-produto': 'Implantação assistida — MTI Cloud',
      'patlas-srv-descricao': 'Pacote de implantação assistida em nuvem com até 5 instâncias.',
      'patlas-srv-categoria': 'Implantação',
      'patlas-srv-metrica': 'UST',
      'patlas-srv-complexidade': 'Média',
      'patlas-srv-qtd-hst': 120,
      'patlas-srv-versao': '2.1',
      'patlas-srv-status': 'Ativa',
      'patlas-srv-tipo-cobr': 'Por execução',
      'patlas-srv-recor': 'Por execução',
      'patlas-srv-universal': true,
      'patlas-srv-individualizado': true,
      'patlas-srv-valor': 12500,
    }),
    p('patlas-srv-p-treinamento', 'Serviço de treinamento sob demanda', pick(1), {
      'patlas-srv-produto': 'Treinamento — Operação MTI Workspace',
      'patlas-srv-descricao': 'Treinamento operacional para até 30 colaboradores.',
      'patlas-srv-categoria': 'Treinamento',
      'patlas-srv-metrica': 'Execução',
      'patlas-srv-complexidade': 'Baixa',
      'patlas-srv-versao': '1.4',
      'patlas-srv-status': 'Ativa',
      'patlas-srv-tipo-cobr': 'Sob demanda',
      'patlas-srv-recor': 'Sob demanda',
      'patlas-srv-universal': true,
      'patlas-srv-individualizado': true,
      'patlas-srv-valor': 4800,
    }),
    p('patlas-srv-p-paralisado', 'Serviço paralisado', pick(7), {
      'patlas-srv-produto': 'Sustentação on-premise legada',
      'patlas-srv-categoria': 'Sustentação',
      'patlas-srv-metrica': 'HST',
      'patlas-srv-status': 'Paralisada',
      'patlas-srv-tipo-cobr': 'Mensal',
      'patlas-srv-recor': 'Mensal',
      'patlas-srv-universal': false,
      'patlas-srv-individualizado': true,
      'patlas-srv-valor': 280,
    }),
  ],
  activeExamplePresetId: 'patlas-srv-p-cloud',
}

// ============================================================================
// FORM 9 — DEMANDA / EVENTO COMERCIAL
// ============================================================================

const demSections = [
  sec('sec-patlas-dem-resumo', 'Resumo da demanda', 'summarize'),
  sec('sec-patlas-dem-cliente', 'Cliente e solicitante', 'badge'),
  sec('sec-patlas-dem-necess', 'Necessidade', 'lightbulb'),
  sec('sec-patlas-dem-dirc', 'Análise DIRC', 'fact_check'),
  sec('sec-patlas-dem-anexos', 'Anexos', 'attach_file'),
  sec('sec-patlas-dem-hist', 'Histórico', 'history'),
]

const formDemanda = {
  id: F_DEM,
  name: 'Demanda / Evento Comercial',
  sectionLayout: 'tabs',
  sections: demSections,
  defaultCanvasMode: 'read',
  metadata: 'Registro inicial vindo de e-mail, WhatsApp, marketplace, reunião ou parceiro. NÃO vira proposta automaticamente — DIRC analisa antes.',
  fields: [
    f('patlas-dem-protocolo', 'Protocolo da demanda', 'text', { size: 'small', required: true, relevance: 'identity', sectionId: 'sec-patlas-dem-resumo' }),
    f('patlas-dem-origem', 'Origem', 'textOptions', { required: true, relevance: 'highlight', options: ORIGEM_DEMANDA, sectionId: 'sec-patlas-dem-resumo' }),
    f('patlas-dem-tipo', 'Tipo da demanda', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_DEMANDA, sectionId: 'sec-patlas-dem-resumo' }),
    f('patlas-dem-data-receb', 'Data de recebimento', 'date', { required: true, sectionId: 'sec-patlas-dem-resumo' }),
    f('patlas-dem-cliente', 'Cliente/órgão interessado', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-dem-cliente' }),
    f('patlas-dem-solicitante', 'Solicitante/contato', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-dem-cliente' }),
    f('patlas-dem-parceiro', 'Parceiro de origem', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlas-dem-cliente' }),
    f('patlas-dem-solucao', 'Solução de interesse', 'textOptions', { relevance: 'highlight', options: SOLUCOES_MTI, sectionId: 'sec-patlas-dem-necess' }),
    f('patlas-dem-descricao', 'Descrição da necessidade', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlas-dem-necess' }),
    f('patlas-dem-prioridade', 'Prioridade', 'textOptions', { relevance: 'highlight', options: PRIORIDADE, sectionId: 'sec-patlas-dem-necess' }),
    f('patlas-dem-prazo', 'Prazo desejado', 'date', { sectionId: 'sec-patlas-dem-necess' }),
    f('patlas-dem-anexos', 'Anexos', 'file', { multiple: true, size: 'large', sectionId: 'sec-patlas-dem-anexos' }),
    f('patlas-dem-resp-dirc', 'Responsável DIRC', 'reference', { relevance: 'highlight', linkedFormId: F_PES, sectionId: 'sec-patlas-dem-dirc' }),
    f('patlas-dem-resultado', 'Resultado da análise', 'textOptions', { relevance: 'highlight', options: RESULTADO_DIRC, sectionId: 'sec-patlas-dem-dirc' }),
    f('patlas-dem-comp-need', 'Necessita complemento?', 'boolean', { sectionId: 'sec-patlas-dem-dirc' }),
    f('patlas-dem-comp-text', 'Complemento solicitado', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-dem-dirc' }),
    f('patlas-dem-justif', 'Justificativa da decisão', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-dem-dirc' }),
    f('patlas-dem-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DEMANDA, sectionId: 'sec-patlas-dem-resumo' }),
    f('patlas-dem-historico', 'Histórico', 'embeddedReference', { multiple: true, linkedFormId: F_HST, embeddedDisplay: 'table', size: 'large', relevance: 'advanced', sectionId: 'sec-patlas-dem-hist' }),
  ],
  methods: [
    m('patlas-dem-meth-iniciar', 'Iniciar análise', 'play_arrow', 'destaque'),
    m('patlas-dem-meth-comp', 'Solicitar complemento', 'help', 'menu'),
    m('patlas-dem-meth-parceiro', 'Enviar ao parceiro', 'forward', 'menu'),
    m('patlas-dem-meth-proposta', 'Criar proposta', 'request_quote', 'destaque'),
    m('patlas-dem-meth-rejeitar', 'Rejeitar demanda', 'thumb_down', 'menu'),
    m('patlas-dem-meth-cancelar', 'Cancelar demanda', 'cancel', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-dem-p-cot001', 'COT-2026-001 — Recebida por e-mail', pick(0), {
      'patlas-dem-protocolo': 'COT-2026-001',
      'patlas-dem-origem': 'E-mail',
      'patlas-dem-tipo': 'Nova contratação',
      'patlas-dem-data-receb': '2026-02-04',
      'patlas-dem-solucao': 'MTI Workspace',
      'patlas-dem-descricao': 'TJMT solicita estimativa para implantação MTI Workspace Enterprise (300 contas, 5 TB).',
      'patlas-dem-prioridade': 'Alta',
      'patlas-dem-status': 'Em análise DIRC',
    }),
    p('patlas-dem-p-cot002', 'COT-2026-002 — Recebida por parceiro', pick(1), {
      'patlas-dem-protocolo': 'COT-2026-002',
      'patlas-dem-origem': 'Parceiro',
      'patlas-dem-tipo': 'Ampliação',
      'patlas-dem-data-receb': '2026-02-12',
      'patlas-dem-solucao': 'MTI Simplifica',
      'patlas-dem-descricao': 'Parceiro Atos relata ampliação de contrato com Justiça Digital — 250 USN adicionais.',
      'patlas-dem-prioridade': 'Normal',
      'patlas-dem-status': 'Em composição de proposta',
    }),
    p('patlas-dem-p-cot003', 'COT-2026-003 — Aguardando complemento', pick(6), {
      'patlas-dem-protocolo': 'COT-2026-003',
      'patlas-dem-origem': 'WhatsApp',
      'patlas-dem-tipo': 'Estudo de viabilidade',
      'patlas-dem-data-receb': '2026-02-18',
      'patlas-dem-solucao': 'MTI IA',
      'patlas-dem-descricao': 'Solicitação informal de IA para análise de processos — sem volumetria definida.',
      'patlas-dem-prioridade': 'Normal',
      'patlas-dem-comp-need': true,
      'patlas-dem-comp-text': 'Faltam dados de volumetria e janela de operação.',
      'patlas-dem-status': 'Aguardando complemento',
    }),
  ],
  activeExamplePresetId: 'patlas-dem-p-cot001',
}

// ============================================================================
// FORM 10 — PROPOSTA
// ============================================================================

const prpSections = [
  sec('sec-patlas-prp-com', 'Dados comerciais', 'request_quote'),
  sec('sec-patlas-prp-clipar', 'Cliente e parceiro', 'badge'),
  sec('sec-patlas-prp-escopo', 'Escopo e objetivo', 'description'),
  sec('sec-patlas-prp-itens', 'Itens da proposta', 'list_alt'),
  sec('sec-patlas-prp-val', 'Valores e vigência', 'payments'),
  sec('sec-patlas-prp-doc', 'Documento', 'article'),
  sec('sec-patlas-prp-wf', 'Workflow e assinaturas', 'edit_note'),
  sec('sec-patlas-prp-envio', 'Envio ao cliente', 'send'),
  sec('sec-patlas-prp-hist', 'Histórico', 'history'),
]

const formProposta = {
  id: F_PRP,
  name: 'Proposta',
  sectionLayout: 'tabs',
  sections: prpSections,
  defaultCanvasMode: 'read',
  metadata: 'Proposta comercial montada pela DIRC (ou parceiro autorizado). Cliente não monta proposta na Fase 1. Mudança no catálogo NÃO altera proposta já criada (snapshot).',
  fields: [
    f('patlas-prp-numero', 'Número da proposta', 'text', { size: 'small', required: true, relevance: 'identity', sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-ano', 'Ano', 'number', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-data', 'Data da proposta', 'date', { required: true, sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-demanda', 'Demanda de origem', 'reference', { linkedFormId: F_DEM, sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-origem', 'Origem da demanda', 'textOptions', { options: ORIGEM_DEMANDA, sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-cliente', 'Cliente/órgão', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-prp-clipar' }),
    f('patlas-prp-uf', 'UF do cliente', 'textOptions', { size: 'small', options: UFS, sectionId: 'sec-patlas-prp-clipar' }),
    f('patlas-prp-solucao', 'Solução principal', 'textOptions', { required: true, relevance: 'highlight', options: SOLUCOES_MTI, sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-tem-parc', 'Parceiro envolvido?', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlas-prp-clipar' }),
    f('patlas-prp-parceiros', 'Parceiros', 'reference', { multiple: true, linkedFormId: F_ORG, sectionId: 'sec-patlas-prp-clipar' }),
    f('patlas-prp-focal', 'Focal de vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-prp-clipar' }),
    f('patlas-prp-apoio', 'Ajudante/apoio', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-prp-clipar' }),
    f('patlas-prp-projeto', 'Projeto', 'text', { sectionId: 'sec-patlas-prp-escopo' }),
    f('patlas-prp-objetivo', 'Objetivo', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlas-prp-escopo' }),
    f('patlas-prp-escopo', 'Escopo resumido', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlas-prp-escopo' }),
    f('patlas-prp-caract', 'Características/detalhamento', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-prp-escopo' }),
    f('patlas-prp-tipo-contr', 'Tipo de contratação', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_CONTRATACAO, sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-vigencia', 'Vigência em meses', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-prp-val' }),
    f('patlas-prp-valor-total', 'Valor total previsto', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-prp-val' }),
    f('patlas-prp-status', 'Status comercial', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PROPOSTA, sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-itens', 'Itens da proposta', 'embeddedReference', { multiple: true, required: true, linkedFormId: F_PRI, embeddedDisplay: 'table', size: 'large', sectionId: 'sec-patlas-prp-itens' }),
    f('patlas-prp-doc', 'Documento gerado', 'reference', { linkedFormId: F_DGD, sectionId: 'sec-patlas-prp-doc' }),
    f('patlas-prp-wfm', 'Modelo de workflow', 'reference', { linkedFormId: F_WFM, sectionId: 'sec-patlas-prp-wf' }),
    f('patlas-prp-wfv', 'Versão do workflow', 'text', { size: 'small', sectionId: 'sec-patlas-prp-wf' }),
    f('patlas-prp-tramites', 'Trâmites de assinatura', 'embeddedReference', { multiple: true, linkedFormId: F_TRA, embeddedDisplay: 'table', size: 'large', sectionId: 'sec-patlas-prp-wf' }),
    f('patlas-prp-data-envio', 'Data de envio ao cliente', 'date', { sectionId: 'sec-patlas-prp-envio' }),
    f('patlas-prp-destin', 'Destinatários do envio', 'text', { size: 'large', sectionId: 'sec-patlas-prp-envio' }),
    f('patlas-prp-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-prp-envio' }),
    f('patlas-prp-historico', 'Histórico', 'embeddedReference', { multiple: true, linkedFormId: F_HST, embeddedDisplay: 'table', size: 'large', relevance: 'advanced', sectionId: 'sec-patlas-prp-hist' }),
  ],
  methods: [
    m('patlas-prp-meth-montar', 'Montar itens do catálogo', 'add_shopping_cart', 'destaque'),
    m('patlas-prp-meth-manual', 'Adicionar item manual', 'add_circle', 'menu'),
    m('patlas-prp-meth-recalc', 'Recalcular valores', 'calculate', 'menu'),
    m('patlas-prp-meth-gerar', 'Gerar documento da proposta', 'description', 'destaque'),
    m('patlas-prp-meth-parceiro', 'Enviar para parceiro', 'forward', 'menu'),
    m('patlas-prp-meth-wf', 'Submeter ao workflow', 'rocket_launch', 'destaque'),
    m('patlas-prp-meth-enviar', 'Enviar proposta ao cliente', 'send', 'destaque'),
    m('patlas-prp-meth-reabrir', 'Reabrir para ajuste', 'edit', 'menu'),
    m('patlas-prp-meth-cancelar', 'Cancelar proposta', 'cancel', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-prp-p-001-comp', 'PROP-2026-001 — Em composição', pick(0), {
      'patlas-prp-numero': 'PROP-2026-001',
      'patlas-prp-ano': 2026,
      'patlas-prp-data': '2026-02-05',
      'patlas-prp-uf': 'MT',
      'patlas-prp-solucao': 'MTI Workspace',
      'patlas-prp-tem-parc': false,
      'patlas-prp-projeto': 'TJMT — Workspace Enterprise',
      'patlas-prp-objetivo': 'Modernização da plataforma de colaboração para 300 servidores do TJMT.',
      'patlas-prp-escopo': '300 contas Workspace Enterprise Standard, 5 TB armazenamento, suporte 12 meses.',
      'patlas-prp-tipo-contr': 'Catálogo do produto',
      'patlas-prp-vigencia': 12,
      'patlas-prp-valor-total': 385530,
      'patlas-prp-status': 'Em composição',
    }),
    p('patlas-prp-p-002-parc', 'PROP-2026-002 — Aguardando parceiro', pick(1), {
      'patlas-prp-numero': 'PROP-2026-002',
      'patlas-prp-ano': 2026,
      'patlas-prp-data': '2026-02-13',
      'patlas-prp-uf': 'MT',
      'patlas-prp-solucao': 'MTI Simplifica',
      'patlas-prp-tem-parc': true,
      'patlas-prp-tipo-contr': 'Catálogo geral/ecossistema',
      'patlas-prp-vigencia': 12,
      'patlas-prp-valor-total': 813054.4,
      'patlas-prp-status': 'Aguardando parceiro',
    }),
    p('patlas-prp-p-003-dirc-parc', 'PROP-2026-003 — Em assinatura DIRC/Parceiro', pick(2), {
      'patlas-prp-numero': 'PROP-2026-003',
      'patlas-prp-ano': 2026,
      'patlas-prp-data': '2026-02-19',
      'patlas-prp-uf': 'MT',
      'patlas-prp-solucao': 'MTI Cloud',
      'patlas-prp-tem-parc': true,
      'patlas-prp-tipo-contr': 'Objeto específico',
      'patlas-prp-vigencia': 24,
      'patlas-prp-valor-total': 240000,
      'patlas-prp-status': 'Em assinatura',
    }),
    p('patlas-prp-p-004-dtic', 'PROP-2026-004 — Em assinatura DTIC', pick(3), {
      'patlas-prp-numero': 'PROP-2026-004',
      'patlas-prp-ano': 2026,
      'patlas-prp-data': '2026-02-21',
      'patlas-prp-uf': 'MT',
      'patlas-prp-solucao': 'MTI SaaS',
      'patlas-prp-tem-parc': false,
      'patlas-prp-tipo-contr': 'Objeto específico',
      'patlas-prp-vigencia': 12,
      'patlas-prp-valor-total': 74853,
      'patlas-prp-status': 'Em assinatura',
    }),
    p('patlas-prp-p-005-pres', 'PROP-2026-005 — Em assinatura Presidência', pick(4), {
      'patlas-prp-numero': 'PROP-2026-005',
      'patlas-prp-ano': 2026,
      'patlas-prp-data': '2026-02-22',
      'patlas-prp-uf': 'MT',
      'patlas-prp-solucao': 'MTI Workspace',
      'patlas-prp-tem-parc': false,
      'patlas-prp-tipo-contr': 'Catálogo do produto',
      'patlas-prp-vigencia': 12,
      'patlas-prp-valor-total': 385530,
      'patlas-prp-status': 'Em assinatura',
    }),
    p('patlas-prp-p-006-cli', 'PROP-2026-006 — Enviada ao cliente', pick(5), {
      'patlas-prp-numero': 'PROP-2026-006',
      'patlas-prp-ano': 2026,
      'patlas-prp-data': '2026-02-24',
      'patlas-prp-uf': 'MT',
      'patlas-prp-solucao': 'MTI Workspace',
      'patlas-prp-tem-parc': false,
      'patlas-prp-tipo-contr': 'Catálogo do produto',
      'patlas-prp-vigencia': 12,
      'patlas-prp-valor-total': 385530,
      'patlas-prp-data-envio': '2026-02-25',
      'patlas-prp-destin': 'juliana.pereira@tjmt.jus.br; presidencia@tjmt.jus.br',
      'patlas-prp-status': 'Enviada ao cliente',
    }),
  ],
  activeExamplePresetId: 'patlas-prp-p-001-comp',
}

// ============================================================================
// FORM 11 — ITEM DA PROPOSTA
// ============================================================================

const priSections = [
  sec('sec-patlas-pri-origem', 'Origem do item', 'category'),
  sec('sec-patlas-pri-snap', 'Dados copiados do catálogo', 'content_copy'),
  sec('sec-patlas-pri-qv', 'Quantidade e valores', 'calculate'),
  sec('sec-patlas-pri-contr', 'Contratação e recorrência', 'paid'),
  sec('sec-patlas-pri-resp', 'Parceiro e responsáveis', 'support_agent'),
  sec('sec-patlas-pri-justif', 'Justificativas', 'edit_note'),
]

const formItemProposta = {
  id: F_PRI,
  name: 'Item da Proposta',
  sectionLayout: 'tabs',
  sections: priSections,
  defaultCanvasMode: 'read',
  metadata: 'Snapshot do catálogo no momento da composição. Justificativa obrigatória se origem = Manual. Valor total = quantidade × valor unitário.',
  fields: [
    f('patlas-pri-prp', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP, sectionId: 'sec-patlas-pri-origem' }),
    f('patlas-pri-origem', 'Origem do item', 'textOptions', { required: true, relevance: 'highlight', options: ORIGEM_ITEM_PROPOSTA, sectionId: 'sec-patlas-pri-origem' }),
    f('patlas-pri-pv', 'Produto vigente', 'reference', { linkedFormId: F_PV, sectionId: 'sec-patlas-pri-origem' }),
    f('patlas-pri-lic', 'Licença', 'reference', { linkedFormId: F_LIC, sectionId: 'sec-patlas-pri-origem' }),
    f('patlas-pri-srv', 'Serviço', 'reference', { linkedFormId: F_SRV, sectionId: 'sec-patlas-pri-origem' }),
    f('patlas-pri-descricao', 'Descrição do item', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true, sectionId: 'sec-patlas-pri-snap' }),
    f('patlas-pri-solucao', 'Solução', 'text', { relevance: 'highlight', sectionId: 'sec-patlas-pri-snap' }),
    f('patlas-pri-parceria', 'Parceria', 'reference', { relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-pri-snap' }),
    f('patlas-pri-grupo', 'Grupo', 'text', { sectionId: 'sec-patlas-pri-snap' }),
    f('patlas-pri-categoria', 'Categoria', 'text', { sectionId: 'sec-patlas-pri-snap' }),
    f('patlas-pri-metrica', 'Métrica', 'textOptions', { size: 'small', required: true, relevance: 'highlight', options: METRICAS_PRODUTO, sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-tipo-contr', 'Tipo de contratação', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_CONTRATACAO, sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-siag', 'Código SIAG usado', 'text', { sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-protheus', 'Código Protheus usado', 'text', { sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-qtd', 'Quantidade', 'decimal', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-valor-unit', 'Valor unitário', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-valor-total', 'Valor total', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-custo', 'Custo parceiro', 'decimal', { currency: true, relevance: 'advanced', sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-markup', 'Markup', 'decimal', { size: 'small', relevance: 'advanced', sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-dist-parc', 'Distribuição parceiro', 'decimal', { size: 'small', relevance: 'advanced', sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-dist-mti', 'Distribuição MTI', 'decimal', { size: 'small', relevance: 'advanced', sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-recor', 'Recorrência de cobrança', 'textOptions', { required: true, options: COBRANCA, sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-modelo', 'Modelo de venda', 'textOptions', { options: MODELO_VENDA, sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-universal', 'Universal', 'boolean', { sectionId: 'sec-patlas-pri-snap' }),
    f('patlas-pri-individualizado', 'Individualizado', 'boolean', { sectionId: 'sec-patlas-pri-snap' }),
    f('patlas-pri-versao', 'Versão catálogo', 'text', { size: 'small', sectionId: 'sec-patlas-pri-snap' }),
    f('patlas-pri-parceiro', 'Parceiro', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlas-pri-resp' }),
    f('patlas-pri-unidade', 'Unidade DTIC', 'reference', { linkedFormId: F_EST, sectionId: 'sec-patlas-pri-resp' }),
    f('patlas-pri-focal-vendas', 'Focal de vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-pri-resp' }),
    f('patlas-pri-focal-pos', 'Focal de pós-vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-pri-resp' }),
    f('patlas-pri-justif-man', 'Justificativa item manual', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-pri-justif', spec: 'Obrigatória se origem = Manual.' }),
    f('patlas-pri-justif-aj', 'Justificativa de ajuste', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-pri-justif' }),
    f('patlas-pri-status', 'Status do item', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_ITEM_PROPOSTA, sectionId: 'sec-patlas-pri-justif' }),
  ],
  methods: [
    m('patlas-pri-meth-substituir', 'Substituir item', 'swap_horiz', 'menu'),
    m('patlas-pri-meth-remover', 'Remover item', 'delete', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-pri-p-licenca', 'Linha de licença Workspace', pick(0), {
      'patlas-pri-origem': 'Licença',
      'patlas-pri-descricao': 'MTI Workspace Enterprise Standard Ecrypt - 5 TB',
      'patlas-pri-solucao': 'MTI Workspace',
      'patlas-pri-metrica': 'USN',
      'patlas-pri-tipo-contr': 'Catálogo do produto',
      'patlas-pri-siag': '111055',
      'patlas-pri-protheus': '32000089',
      'patlas-pri-qtd': 300,
      'patlas-pri-valor-unit': 1070.92,
      'patlas-pri-valor-total': 321276,
      'patlas-pri-recor': 'Anual',
      'patlas-pri-status': 'Aceito',
    }),
    p('patlas-pri-p-servico', 'Linha de serviço técnico', pick(1), {
      'patlas-pri-origem': 'Serviço',
      'patlas-pri-descricao': 'Implantação assistida — MTI Cloud',
      'patlas-pri-solucao': 'MTI Cloud',
      'patlas-pri-metrica': 'UST',
      'patlas-pri-tipo-contr': 'Objeto específico',
      'patlas-pri-qtd': 1,
      'patlas-pri-valor-unit': 12500,
      'patlas-pri-valor-total': 12500,
      'patlas-pri-recor': 'Por execução',
      'patlas-pri-status': 'Em composição',
    }),
    p('patlas-pri-p-manual', 'Item manual com justificativa', pick(7), {
      'patlas-pri-origem': 'Manual',
      'patlas-pri-descricao': 'Customização externa — integração API SEFAZ-MT',
      'patlas-pri-metrica': 'Projeto',
      'patlas-pri-tipo-contr': 'Objeto específico',
      'patlas-pri-qtd': 1,
      'patlas-pri-valor-unit': 58000,
      'patlas-pri-valor-total': 58000,
      'patlas-pri-recor': 'Única',
      'patlas-pri-justif-man': 'Cliente exige integração específica não coberta pelo catálogo vigente.',
      'patlas-pri-status': 'Em composição',
    }),
  ],
  activeExamplePresetId: 'patlas-pri-p-licenca',
}

// ============================================================================
// FORM 12 — MODELO DE DOCUMENTO
// ============================================================================

const formModeloDocumento = {
  id: F_DTP,
  name: 'Modelo de Documento',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Template HTML reutilizável para propostas, contratos, handovers e termos. Template publicado não deve ser editado — alteração cria nova versão.',
  fields: [
    f('patlas-dtp-nome', 'Nome do modelo', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-dtp-tipo', 'Tipo do documento', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_DOCUMENTO }),
    f('patlas-dtp-aplic', 'Solução/parceria aplicável', 'reference', { relevance: 'highlight', linkedFormId: F_ORG }),
    f('patlas-dtp-versao', 'Versão', 'text', { size: 'small', required: true, relevance: 'highlight' }),
    f('patlas-dtp-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DOCUMENTO_TEMPLATE }),
    f('patlas-dtp-conteudo', 'Conteúdo HTML/template', 'text', { size: 'large', textLong: true, required: true }),
    f('patlas-dtp-criado', 'Criado por', 'reference', { linkedFormId: F_PES, relevance: 'advanced' }),
    f('patlas-dtp-data-cri', 'Data criação', 'date', { relevance: 'advanced' }),
    f('patlas-dtp-publ', 'Publicado por', 'reference', { linkedFormId: F_PES, relevance: 'advanced' }),
    f('patlas-dtp-data-pub', 'Data publicação', 'date', { relevance: 'advanced' }),
    f('patlas-dtp-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-dtp-meth-publicar', 'Publicar versão', 'publish', 'destaque'),
    m('patlas-dtp-meth-versao', 'Criar nova versão', 'add_circle', 'menu'),
    m('patlas-dtp-meth-arquivar', 'Arquivar', 'inventory_2', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-dtp-p-proposta', 'Modelo padrão de proposta', pick(0), {
      'patlas-dtp-nome': 'Proposta comercial — padrão MTI',
      'patlas-dtp-tipo': 'Proposta',
      'patlas-dtp-versao': '3.1',
      'patlas-dtp-status': 'Publicado',
    }),
    p('patlas-dtp-p-contrato', 'Modelo padrão de contrato', pick(1), {
      'patlas-dtp-nome': 'Contrato comercial — padrão MTI',
      'patlas-dtp-tipo': 'Contrato',
      'patlas-dtp-versao': '2.4',
      'patlas-dtp-status': 'Publicado',
    }),
    p('patlas-dtp-p-handover', 'Modelo padrão de handover', pick(2), {
      'patlas-dtp-nome': 'Termo de handover técnico',
      'patlas-dtp-tipo': 'Handover',
      'patlas-dtp-versao': '1.2',
      'patlas-dtp-status': 'Publicado',
    }),
  ],
  activeExamplePresetId: 'patlas-dtp-p-proposta',
}

// ============================================================================
// FORM 13 — DOCUMENTO GERADO
// ============================================================================

const formDocumentoGerado = {
  id: F_DGD,
  name: 'Documento Gerado',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Instância de documento gerada a partir de um modelo (template). Vinculada a uma proposta ou contrato.',
  fields: [
    f('patlas-dgd-titulo', 'Título do documento', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-dgd-tipo', 'Tipo do documento', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_DOCUMENTO }),
    f('patlas-dgd-prp', 'Proposta vinculada', 'reference', { linkedFormId: F_PRP }),
    f('patlas-dgd-ctr', 'Contrato vinculado', 'reference', { linkedFormId: F_CTR }),
    f('patlas-dgd-modelo', 'Modelo usado', 'reference', { required: true, linkedFormId: F_DTP }),
    f('patlas-dgd-versao-mod', 'Versão do modelo', 'text', { size: 'small', required: true, relevance: 'highlight' }),
    f('patlas-dgd-versao-prp', 'Versão da proposta', 'text', { size: 'small' }),
    f('patlas-dgd-arquivo', 'Documento gerado', 'file'),
    f('patlas-dgd-status', 'Status do documento', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DOCUMENTO_GERADO }),
    f('patlas-dgd-data-ger', 'Data geração', 'date'),
    f('patlas-dgd-gerado-por', 'Gerado por', 'reference', { linkedFormId: F_PES }),
  ],
  methods: [
    m('patlas-dgd-meth-baixar', 'Baixar documento', 'download', 'destaque'),
    m('patlas-dgd-meth-prev', 'Pré-visualizar', 'preview', 'menu'),
    m('patlas-dgd-meth-assinar', 'Enviar para assinatura', 'edit_note', 'destaque'),
    m('patlas-dgd-meth-cliente', 'Enviar ao cliente', 'send', 'menu'),
    m('patlas-dgd-meth-cancelar', 'Cancelar documento', 'cancel', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-dgd-p-proposta', 'Proposta PROP-2026-001 — Gerada', pick(0), {
      'patlas-dgd-titulo': 'Proposta PROP-2026-001 — TJMT (Workspace Enterprise)',
      'patlas-dgd-tipo': 'Proposta',
      'patlas-dgd-versao-mod': '3.1',
      'patlas-dgd-status': 'Gerado',
      'patlas-dgd-data-ger': '2026-02-07',
    }),
    p('patlas-dgd-p-assinatura', 'Proposta PROP-2026-005 — Em assinatura', pick(3), {
      'patlas-dgd-titulo': 'Proposta PROP-2026-005 — TJMT',
      'patlas-dgd-tipo': 'Proposta',
      'patlas-dgd-versao-mod': '3.1',
      'patlas-dgd-status': 'Enviado para assinatura',
      'patlas-dgd-data-ger': '2026-02-22',
    }),
    p('patlas-dgd-p-contrato', 'Contrato CT-2026-001 — Assinado', pick(2), {
      'patlas-dgd-titulo': 'Contrato CT-2026-001 — TJMT',
      'patlas-dgd-tipo': 'Contrato',
      'patlas-dgd-versao-mod': '2.4',
      'patlas-dgd-status': 'Assinado',
      'patlas-dgd-data-ger': '2026-03-04',
    }),
  ],
  activeExamplePresetId: 'patlas-dgd-p-assinatura',
}

// ============================================================================
// FORM 14 — WORKFLOW MODELO
// ============================================================================

const formWorkflowModelo = {
  id: F_WFM,
  name: 'Workflow',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Modelo de workflow reutilizável por domínio (proposta, contrato, documento, assinatura, handover).',
  fields: [
    f('patlas-wfm-nome', 'Nome do workflow', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-wfm-dominio', 'Domínio', 'textOptions', { required: true, relevance: 'highlight', options: DOMINIO_WORKFLOW }),
    f('patlas-wfm-area', 'Área dona', 'textOptions', { required: true, relevance: 'highlight', options: AREA_DONA }),
    f('patlas-wfm-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_WORKFLOW }),
    f('patlas-wfm-versao', 'Versão ativa', 'text', { size: 'small' }),
    f('patlas-wfm-descricao', 'Descrição', 'text', { size: 'large', textLong: true }),
    f('patlas-wfm-etapas', 'Etapas', 'embeddedReference', { multiple: true, linkedFormId: F_WFE, embeddedDisplay: 'table', size: 'large' }),
  ],
  methods: [
    m('patlas-wfm-meth-ativar', 'Ativar workflow', 'play_arrow', 'destaque'),
    m('patlas-wfm-meth-versao', 'Criar nova versão', 'add_circle', 'menu'),
    m('patlas-wfm-meth-arquivar', 'Arquivar', 'inventory_2', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-wfm-p-proposta', 'Workflow — Aprovação de proposta', pick(0), {
      'patlas-wfm-nome': 'Aprovação de Proposta Comercial',
      'patlas-wfm-dominio': 'Proposta',
      'patlas-wfm-area': 'DIRC',
      'patlas-wfm-status': 'Ativo',
      'patlas-wfm-versao': '2.0',
      'patlas-wfm-descricao': 'Fluxo: composição DIRC → análise parceiro (se houver) → assinaturas DIRC/Parceiro → DTIC → Presidência → envio ao cliente.',
    }),
    p('patlas-wfm-p-contrato', 'Workflow — Contrato recebido', pick(1), {
      'patlas-wfm-nome': 'Recepção e Operacionalização de Contrato',
      'patlas-wfm-dominio': 'Contrato',
      'patlas-wfm-area': 'DIRC',
      'patlas-wfm-status': 'Ativo',
      'patlas-wfm-versao': '1.3',
      'patlas-wfm-descricao': 'Contrato recebido → revisão de itens → cadastro cliente → recorrência → publicação → integrações → handover → kick-off.',
    }),
  ],
  activeExamplePresetId: 'patlas-wfm-p-proposta',
}

// ============================================================================
// FORM 15 — WORKFLOW ETAPA
// ============================================================================

const formWorkflowEtapa = {
  id: F_WFE,
  name: 'Etapa do Workflow',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Cada etapa do workflow define ordem, tipo, área responsável, regras de avanço e SLA.',
  fields: [
    f('patlas-wfe-nome', 'Nome da etapa', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-wfe-ordem', 'Ordem', 'number', { size: 'small', required: true, relevance: 'highlight' }),
    f('patlas-wfe-tipo', 'Tipo da etapa', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_ETAPA_WF }),
    f('patlas-wfe-area', 'Área responsável', 'textOptions', { required: true, options: AREA_DONA }),
    f('patlas-wfe-cargo', 'Cargo/Função responsável', 'reference', { linkedFormId: F_CGF }),
    f('patlas-wfe-exige-ass', 'Exige assinatura', 'boolean'),
    f('patlas-wfe-paralela', 'Assinatura paralela?', 'boolean'),
    f('patlas-wfe-bloqueia', 'Bloqueia avanço', 'boolean', { relevance: 'highlight' }),
    f('patlas-wfe-sla', 'SLA em dias', 'number', { size: 'small' }),
    f('patlas-wfe-prox-aprov', 'Próxima etapa aprovada', 'text'),
    f('patlas-wfe-retorno-aj', 'Retorno por ajuste', 'text'),
    f('patlas-wfe-retorno-rep', 'Retorno por reprovação', 'text'),
  ],
  exampleValuePresets: [
    p('patlas-wfe-p-comp', 'Composição DIRC', pick(0), {
      'patlas-wfe-nome': 'Composição DIRC',
      'patlas-wfe-ordem': 1,
      'patlas-wfe-tipo': 'Edição',
      'patlas-wfe-area': 'DIRC',
      'patlas-wfe-exige-ass': false,
      'patlas-wfe-bloqueia': false,
      'patlas-wfe-sla': 3,
    }),
    p('patlas-wfe-p-parc', 'Análise do parceiro', pick(2), {
      'patlas-wfe-nome': 'Análise do parceiro',
      'patlas-wfe-ordem': 2,
      'patlas-wfe-tipo': 'Revisão',
      'patlas-wfe-area': 'Parceiro',
      'patlas-wfe-exige-ass': false,
      'patlas-wfe-bloqueia': true,
      'patlas-wfe-sla': 5,
    }),
    p('patlas-wfe-p-ass-dtic', 'Assinatura DTIC', pick(1), {
      'patlas-wfe-nome': 'Assinatura DTIC',
      'patlas-wfe-ordem': 4,
      'patlas-wfe-tipo': 'Assinatura',
      'patlas-wfe-area': 'DTIC',
      'patlas-wfe-exige-ass': true,
      'patlas-wfe-paralela': false,
      'patlas-wfe-bloqueia': true,
      'patlas-wfe-sla': 2,
    }),
  ],
  activeExamplePresetId: 'patlas-wfe-p-comp',
}

// ============================================================================
// FORM 16 — TRÂMITE DE ASSINATURA
// ============================================================================

const traSections = [
  sec('sec-patlas-tra-doc', 'Documento e proposta', 'description'),
  sec('sec-patlas-tra-ass', 'Assinante', 'badge'),
  sec('sec-patlas-tra-stat', 'Status e prazo', 'schedule'),
  sec('sec-patlas-tra-res', 'Resultado', 'fact_check'),
  sec('sec-patlas-tra-hist', 'Histórico', 'history'),
]

const formTramiteAssinatura = {
  id: F_TRA,
  name: 'Trâmite de Assinatura',
  sectionLayout: 'tabs',
  sections: traSections,
  defaultCanvasMode: 'read',
  metadata: 'Pendência de assinatura por cargo/função (não por pessoa). Ajuste/reprovação retorna para revisão.',
  fields: [
    f('patlas-tra-prp', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP, sectionId: 'sec-patlas-tra-doc' }),
    f('patlas-tra-doc', 'Documento', 'reference', { required: true, linkedFormId: F_DGD, sectionId: 'sec-patlas-tra-doc' }),
    f('patlas-tra-grupo', 'Grupo de assinatura', 'textOptions', { required: true, relevance: 'highlight', options: GRUPO_ASSINATURA, sectionId: 'sec-patlas-tra-ass' }),
    f('patlas-tra-area', 'Área', 'textOptions', { required: true, options: GRUPO_ASSINATURA, sectionId: 'sec-patlas-tra-ass' }),
    f('patlas-tra-cargo', 'Cargo/Função assinante', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_CGF, sectionId: 'sec-patlas-tra-ass' }),
    f('patlas-tra-usuario', 'Usuário executante', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-tra-ass' }),
    f('patlas-tra-status', 'Status da pendência', 'textOptions', { required: true, relevance: 'identity', options: STATUS_ASSINATURA, sectionId: 'sec-patlas-tra-stat' }),
    f('patlas-tra-data-env', 'Data de envio', 'date', { sectionId: 'sec-patlas-tra-stat' }),
    f('patlas-tra-data-ass', 'Data de assinatura', 'date', { sectionId: 'sec-patlas-tra-stat' }),
    f('patlas-tra-dias', 'Dias pendentes', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-tra-stat' }),
    f('patlas-tra-bloqueia', 'Bloqueia fluxo', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-tra-stat' }),
    f('patlas-tra-resultado', 'Resultado', 'textOptions', { relevance: 'highlight', options: RESULTADO_ASSINATURA, sectionId: 'sec-patlas-tra-res' }),
    f('patlas-tra-motivo', 'Motivo do ajuste/reprovação', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-tra-res' }),
    f('patlas-tra-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-tra-hist' }),
  ],
  methods: [
    m('patlas-tra-meth-enviar', 'Enviar para assinatura', 'send', 'menu'),
    m('patlas-tra-meth-ajuste', 'Solicitar ajuste', 'edit_note', 'menu'),
    m('patlas-tra-meth-reprovar', 'Reprovar', 'cancel', 'menu'),
    m('patlas-tra-meth-dispensar', 'Dispensar assinatura', 'block', 'menu'),
    m('patlas-tra-meth-assinar', 'Assinar', 'verified', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlas-tra-p-dirc-pend', 'Assinatura DIRC — Pendente', pick(0), {
      'patlas-tra-grupo': 'DIRC',
      'patlas-tra-area': 'DIRC',
      'patlas-tra-status': 'Pendente',
      'patlas-tra-dias': 2,
      'patlas-tra-bloqueia': true,
    }),
    p('patlas-tra-p-parc-ass', 'Parceiro — Assinada', pick(2), {
      'patlas-tra-grupo': 'Parceiro',
      'patlas-tra-area': 'Parceiro',
      'patlas-tra-status': 'Assinado',
      'patlas-tra-data-ass': '2026-02-21',
      'patlas-tra-dias': 0,
      'patlas-tra-bloqueia': false,
      'patlas-tra-resultado': 'Assinado',
    }),
    p('patlas-tra-p-dtic-aj', 'DTIC — Ajuste solicitado', pick(6), {
      'patlas-tra-grupo': 'DTIC',
      'patlas-tra-area': 'DTIC',
      'patlas-tra-status': 'Ajuste solicitado',
      'patlas-tra-dias': 3,
      'patlas-tra-bloqueia': true,
      'patlas-tra-resultado': 'Ajuste',
      'patlas-tra-motivo': 'Revisar quantidade de USN — divergência com a demanda original.',
    }),
    p('patlas-tra-p-pres-ass', 'Presidência — Assinada', pick(2), {
      'patlas-tra-grupo': 'Presidência',
      'patlas-tra-area': 'Presidência',
      'patlas-tra-status': 'Assinado',
      'patlas-tra-data-ass': '2026-02-24',
      'patlas-tra-dias': 1,
      'patlas-tra-bloqueia': false,
      'patlas-tra-resultado': 'Assinado',
    }),
    p('patlas-tra-p-dispensada', 'Parceiro — Dispensada (sem parceiro)', pick(7), {
      'patlas-tra-grupo': 'Parceiro',
      'patlas-tra-area': 'Parceiro',
      'patlas-tra-status': 'Dispensado',
      'patlas-tra-bloqueia': false,
      'patlas-tra-resultado': 'Dispensado',
    }),
  ],
  activeExamplePresetId: 'patlas-tra-p-dirc-pend',
}

// ============================================================================
// FORM 17 — CONTRATO
// ============================================================================

const ctrSections = [
  sec('sec-patlas-ctr-dados', 'Dados do contrato', 'gavel'),
  sec('sec-patlas-ctr-prp', 'Proposta vinculada', 'request_quote'),
  sec('sec-patlas-ctr-cli', 'Cliente', 'business'),
  sec('sec-patlas-ctr-itens', 'Itens contratados', 'list_alt'),
  sec('sec-patlas-ctr-rec', 'Recorrência', 'event_repeat'),
  sec('sec-patlas-ctr-pub', 'Publicação', 'campaign'),
  sec('sec-patlas-ctr-int', 'Integrações', 'sync'),
  sec('sec-patlas-ctr-hand', 'Handover e kick-off', 'rocket_launch'),
  sec('sec-patlas-ctr-hist', 'Histórico', 'history'),
]

const formContrato = {
  id: F_CTR,
  name: 'Contrato',
  sectionLayout: 'tabs',
  sections: ctrSections,
  defaultCanvasMode: 'read',
  metadata: 'Contrato recebido do cliente (anexo obrigatório). Divergências (downsizing, ajuste de valor, substituição) precisam de tipo e justificativa. Publicação é mandatória.',
  fields: [
    f('patlas-ctr-numero', 'Número/identificador do contrato', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-ctr-dados' }),
    f('patlas-ctr-prp', 'Proposta vinculada', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_PRP, sectionId: 'sec-patlas-ctr-prp' }),
    f('patlas-ctr-cliente', 'Cliente/órgão', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-ctr-cli' }),
    f('patlas-ctr-anexo', 'Anexo contrato recebido', 'file', { required: true, size: 'large', sectionId: 'sec-patlas-ctr-dados' }),
    f('patlas-ctr-data-ret', 'Data retorno à MTI', 'date', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-ctr-dados' }),
    f('patlas-ctr-status', 'Status do contrato', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_CONTRATO, sectionId: 'sec-patlas-ctr-dados' }),
    f('patlas-ctr-itens', 'Itens contratados', 'embeddedReference', { multiple: true, required: true, linkedFormId: F_CTI, embeddedDisplay: 'table', size: 'large', sectionId: 'sec-patlas-ctr-itens' }),
    f('patlas-ctr-divergencia', 'Há divergência?', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlas-ctr-itens' }),
    f('patlas-ctr-tipo-div', 'Tipo de divergência', 'textOptions', { options: TIPO_DIVERGENCIA, sectionId: 'sec-patlas-ctr-itens' }),
    f('patlas-ctr-justif-div', 'Justificativa da divergência', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-ctr-itens' }),
    f('patlas-ctr-cli-cad', 'Cliente cadastrado formalmente?', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlas-ctr-cli' }),
    f('patlas-ctr-cred-env', 'Credenciais enviadas?', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlas-ctr-cli' }),
    f('patlas-ctr-rec-conf', 'Recorrências configuradas?', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlas-ctr-rec' }),
    f('patlas-ctr-extr-pub', 'Extrato de publicação registrado?', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-ctr-pub' }),
    f('patlas-ctr-int-prot', 'Integração Protheus', 'textOptions', { relevance: 'highlight', options: STATUS_INTEGRACAO, sectionId: 'sec-patlas-ctr-int' }),
    f('patlas-ctr-int-snow', 'Integração ServiceNow', 'textOptions', { relevance: 'highlight', options: STATUS_INTEGRACAO, sectionId: 'sec-patlas-ctr-int' }),
    f('patlas-ctr-hand-ger', 'Handover gerado?', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlas-ctr-hand' }),
    f('patlas-ctr-kick-ag', 'Kick-off agendado?', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlas-ctr-hand' }),
    f('patlas-ctr-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-ctr-hist' }),
  ],
  methods: [
    m('patlas-ctr-meth-registrar', 'Registrar contrato recebido', 'add_box', 'destaque'),
    m('patlas-ctr-meth-revisar', 'Revisar itens contratados', 'fact_check', 'destaque'),
    m('patlas-ctr-meth-cliente', 'Cadastrar cliente', 'person_add', 'menu'),
    m('patlas-ctr-meth-cred', 'Enviar credenciais', 'mail', 'menu'),
    m('patlas-ctr-meth-recor', 'Configurar recorrências', 'event_repeat', 'menu'),
    m('patlas-ctr-meth-publ', 'Registrar publicação', 'campaign', 'menu'),
    m('patlas-ctr-meth-prot', 'Enviar integração Protheus', 'sync', 'menu'),
    m('patlas-ctr-meth-snow', 'Enviar integração ServiceNow', 'sync', 'menu'),
    m('patlas-ctr-meth-hov', 'Gerar handover', 'description', 'destaque'),
    m('patlas-ctr-meth-pos', 'Notificar pós-vendas', 'notifications_active', 'menu'),
    m('patlas-ctr-meth-kof', 'Agendar kick-off', 'event', 'destaque'),
    m('patlas-ctr-meth-fim', 'Finalizar Fase 1', 'flag', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlas-ctr-p-001', 'CT-2026-001 — Contrato recebido', pick(0), {
      'patlas-ctr-numero': 'CT-2026-001',
      'patlas-ctr-data-ret': '2026-03-01',
      'patlas-ctr-status': 'Recebido',
      'patlas-ctr-divergencia': false,
      'patlas-ctr-extr-pub': false,
      'patlas-ctr-int-prot': 'Não enviado',
      'patlas-ctr-int-snow': 'Não enviado',
    }),
    p('patlas-ctr-p-002', 'CT-2026-002 — Itens revisados com downsizing', pick(6), {
      'patlas-ctr-numero': 'CT-2026-002',
      'patlas-ctr-data-ret': '2026-03-04',
      'patlas-ctr-status': 'Itens revisados',
      'patlas-ctr-divergencia': true,
      'patlas-ctr-tipo-div': 'Redução de escopo',
      'patlas-ctr-justif-div': 'Cliente reduziu de 300 para 250 contas por restrição orçamentária.',
      'patlas-ctr-extr-pub': false,
      'patlas-ctr-int-prot': 'Pendente',
      'patlas-ctr-int-snow': 'Pendente',
    }),
    p('patlas-ctr-p-003', 'CT-2026-003 — Publicação pendente', pick(7), {
      'patlas-ctr-numero': 'CT-2026-003',
      'patlas-ctr-data-ret': '2026-03-06',
      'patlas-ctr-status': 'Publicação pendente',
      'patlas-ctr-divergencia': false,
      'patlas-ctr-cli-cad': true,
      'patlas-ctr-cred-env': false,
      'patlas-ctr-rec-conf': true,
      'patlas-ctr-extr-pub': false,
      'patlas-ctr-int-prot': 'Confirmado',
      'patlas-ctr-int-snow': 'Pendente',
    }),
    p('patlas-ctr-p-004', 'CT-2026-004 — Integração pendente', pick(7), {
      'patlas-ctr-numero': 'CT-2026-004',
      'patlas-ctr-data-ret': '2026-03-08',
      'patlas-ctr-status': 'Integrações pendentes',
      'patlas-ctr-divergencia': false,
      'patlas-ctr-cli-cad': true,
      'patlas-ctr-cred-env': true,
      'patlas-ctr-rec-conf': true,
      'patlas-ctr-extr-pub': true,
      'patlas-ctr-int-prot': 'Erro',
      'patlas-ctr-int-snow': 'Confirmado',
    }),
    p('patlas-ctr-p-005', 'CT-2026-005 — Kick-off agendado', pick(2), {
      'patlas-ctr-numero': 'CT-2026-005',
      'patlas-ctr-data-ret': '2026-03-10',
      'patlas-ctr-status': 'Kick-off agendado',
      'patlas-ctr-divergencia': false,
      'patlas-ctr-cli-cad': true,
      'patlas-ctr-cred-env': true,
      'patlas-ctr-rec-conf': true,
      'patlas-ctr-extr-pub': true,
      'patlas-ctr-int-prot': 'Confirmado',
      'patlas-ctr-int-snow': 'Confirmado',
      'patlas-ctr-hand-ger': true,
      'patlas-ctr-kick-ag': true,
    }),
  ],
  activeExamplePresetId: 'patlas-ctr-p-001',
}

// ============================================================================
// FORM 18 — ITEM CONTRATADO
// ============================================================================

const formContratoItem = {
  id: F_CTI,
  name: 'Item Contratado',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Item efetivamente contratado (após revisão do contrato recebido). Pode divergir do item original da proposta.',
  fields: [
    f('patlas-cti-ctr', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlas-cti-pri', 'Item da proposta de origem', 'reference', { required: true, linkedFormId: F_PRI }),
    f('patlas-cti-descricao', 'Descrição contratada', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true }),
    f('patlas-cti-origem', 'Origem do item', 'textOptions', { required: true, relevance: 'highlight', options: ORIGEM_ITEM_PROPOSTA }),
    f('patlas-cti-alterado', 'Alterado no contrato?', 'boolean', { relevance: 'highlight' }),
    f('patlas-cti-motivo', 'Motivo da alteração', 'text', { size: 'large', textLong: true }),
    f('patlas-cti-qtd', 'Quantidade contratada', 'decimal', { size: 'small', required: true, relevance: 'highlight' }),
    f('patlas-cti-valor-unit', 'Valor unitário contratado', 'decimal', { required: true, relevance: 'highlight', currency: true }),
    f('patlas-cti-valor-total', 'Valor total contratado', 'decimal', { required: true, relevance: 'highlight', currency: true }),
    f('patlas-cti-metrica', 'Métrica', 'text', { size: 'small' }),
    f('patlas-cti-recor', 'Recorrência', 'textOptions', { options: COBRANCA }),
    f('patlas-cti-siag', 'Código SIAG usado', 'text'),
    f('patlas-cti-protheus', 'Código Protheus usado', 'text'),
    f('patlas-cti-parceiro', 'Parceiro', 'reference', { linkedFormId: F_ORG }),
    f('patlas-cti-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  exampleValuePresets: [
    p('patlas-cti-p-conforme', 'Item contratado conforme proposta', pick(0), {
      'patlas-cti-descricao': 'MTI Workspace Enterprise Standard Ecrypt - 5 TB',
      'patlas-cti-origem': 'Licença',
      'patlas-cti-alterado': false,
      'patlas-cti-qtd': 300,
      'patlas-cti-valor-unit': 1070.92,
      'patlas-cti-valor-total': 321276,
      'patlas-cti-metrica': 'USN',
      'patlas-cti-recor': 'Anual',
    }),
    p('patlas-cti-p-downsizing', 'Item contratado com downsizing', pick(6), {
      'patlas-cti-descricao': 'MTI Workspace Enterprise Standard Ecrypt - 5 TB',
      'patlas-cti-origem': 'Licença',
      'patlas-cti-alterado': true,
      'patlas-cti-motivo': 'Cliente reduziu de 300 para 250 contas por restrição orçamentária.',
      'patlas-cti-qtd': 250,
      'patlas-cti-valor-unit': 1070.92,
      'patlas-cti-valor-total': 267730,
      'patlas-cti-metrica': 'USN',
      'patlas-cti-recor': 'Anual',
    }),
  ],
  activeExamplePresetId: 'patlas-cti-p-conforme',
}

// ============================================================================
// FORM 19 — RECORRÊNCIA DE COBRANÇA
// ============================================================================

const formRecorrencia = {
  id: F_REC,
  name: 'Recorrência de Cobrança',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Configuração de cobrança recorrente para um item contratado. Estado consultivo nesta Fase 1 (cobrança real fora de escopo).',
  fields: [
    f('patlas-rec-ctr', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlas-rec-cti', 'Item contratado', 'reference', { required: true, relevance: 'identity', linkedFormId: F_CTI }),
    f('patlas-rec-tipo', 'Tipo de recorrência', 'textOptions', { required: true, relevance: 'highlight', options: COBRANCA }),
    f('patlas-rec-inicio', 'Data início cobrança', 'date'),
    f('patlas-rec-fim', 'Data fim cobrança', 'date'),
    f('patlas-rec-dia', 'Dia previsto de cobrança', 'number', { size: 'small' }),
    f('patlas-rec-valor', 'Valor recorrente', 'decimal', { relevance: 'highlight', currency: true }),
    f('patlas-rec-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_RECORRENCIA }),
    f('patlas-rec-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-rec-meth-configurar', 'Configurar recorrência', 'event_repeat', 'destaque'),
    m('patlas-rec-meth-suspender', 'Suspender', 'pause', 'menu'),
    m('patlas-rec-meth-cancelar', 'Cancelar', 'cancel', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-rec-p-anual', 'Anual configurada', pick(0), {
      'patlas-rec-tipo': 'Anual',
      'patlas-rec-inicio': '2026-03-15',
      'patlas-rec-fim': '2027-03-14',
      'patlas-rec-dia': 15,
      'patlas-rec-valor': 321276,
      'patlas-rec-status': 'Configurada',
    }),
    p('patlas-rec-p-mensal', 'Mensal pendente', pick(6), {
      'patlas-rec-tipo': 'Mensal',
      'patlas-rec-inicio': '2026-04-01',
      'patlas-rec-dia': 5,
      'patlas-rec-valor': 12500,
      'patlas-rec-status': 'Pendente',
    }),
  ],
  activeExamplePresetId: 'patlas-rec-p-anual',
}

// ============================================================================
// FORM 20 — PUBLICAÇÃO DO CONTRATO
// ============================================================================

const formPublicacao = {
  id: F_PUB,
  name: 'Publicação do Contrato',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Publicação obrigatória para validade do processo. Sem este registro, o contrato não avança operacionalmente.',
  fields: [
    f('patlas-pub-ctr', 'Contrato', 'reference', { required: true, relevance: 'identity', linkedFormId: F_CTR }),
    f('patlas-pub-extr', 'Extrato de publicação', 'file', { required: true, relevance: 'highlight', size: 'large' }),
    f('patlas-pub-numero', 'Número da publicação', 'text'),
    f('patlas-pub-data', 'Data da publicação', 'date', { required: true, relevance: 'highlight' }),
    f('patlas-pub-veiculo', 'Veículo/local da publicação', 'text', { size: 'large', spec: 'Diário oficial, portal, outro.' }),
    f('patlas-pub-registrado', 'Registrado por', 'reference', { linkedFormId: F_PES }),
    f('patlas-pub-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PUBLICACAO }),
    f('patlas-pub-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-pub-meth-registrar', 'Registrar publicação', 'campaign', 'destaque'),
    m('patlas-pub-meth-invalidar', 'Invalidar', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-pub-p-doe', 'Publicada — DOE-MT', pick(0), {
      'patlas-pub-numero': 'DOE-MT 2026-03-12 — Edição 28.945',
      'patlas-pub-data': '2026-03-12',
      'patlas-pub-veiculo': 'Diário Oficial do Estado de Mato Grosso',
      'patlas-pub-status': 'Registrada',
    }),
    p('patlas-pub-p-pendente', 'Pendente de extrato', pick(6), {
      'patlas-pub-status': 'Pendente',
    }),
  ],
  activeExamplePresetId: 'patlas-pub-p-doe',
}

// ============================================================================
// FORM 21 — EVENTO DE INTEGRAÇÃO
// ============================================================================

const formIntegracaoEvento = {
  id: F_IGE,
  name: 'Evento de Integração',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Registra envio/retorno de integrações com Protheus, ServiceNow e sistemas futuros. Status Pendente, Erro, Não enviado ou Dispensado exige justificativa.',
  fields: [
    f('patlas-ige-sistema', 'Sistema', 'textOptions', { required: true, relevance: 'identity', options: SISTEMA_INTEGRACAO }),
    f('patlas-ige-processo', 'Processo relacionado', 'reference', { required: true, linkedFormId: F_PRP }),
    f('patlas-ige-ctr', 'Contrato relacionado', 'reference', { linkedFormId: F_CTR }),
    f('patlas-ige-tipo', 'Tipo de evento', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_INTEGRACAO_EVENTO }),
    f('patlas-ige-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_INTEGRACAO }),
    f('patlas-ige-data', 'Data do evento', 'date'),
    f('patlas-ige-payload', 'Payload/dados enviados', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
    f('patlas-ige-retorno', 'Retorno recebido', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
    f('patlas-ige-justif', 'Justificativa', 'text', { size: 'large', textLong: true, spec: 'Obrigatória se Pendente, Erro, Não enviado ou Dispensado.' }),
    f('patlas-ige-tentativas', 'Tentativas', 'number', { size: 'small' }),
    f('patlas-ige-responsavel', 'Responsável', 'reference', { linkedFormId: F_PES }),
  ],
  methods: [
    m('patlas-ige-meth-reproc', 'Reprocessar', 'replay', 'destaque'),
    m('patlas-ige-meth-dispensar', 'Dispensar evento', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-ige-p-prot-conf', 'Protheus — Confirmado', pick(0), {
      'patlas-ige-sistema': 'Protheus',
      'patlas-ige-tipo': 'Cadastro',
      'patlas-ige-status': 'Confirmado',
      'patlas-ige-data': '2026-03-09',
      'patlas-ige-tentativas': 1,
    }),
    p('patlas-ige-p-snow-erro', 'ServiceNow — Erro', pick(7), {
      'patlas-ige-sistema': 'ServiceNow',
      'patlas-ige-tipo': 'Envio',
      'patlas-ige-status': 'Erro',
      'patlas-ige-data': '2026-03-10',
      'patlas-ige-justif': 'Timeout na chamada do endpoint /api/v1/contracts. Reenvio agendado.',
      'patlas-ige-tentativas': 2,
    }),
    p('patlas-ige-p-disp', 'CMDB — Dispensado (fora de escopo Fase 1)', pick(8), {
      'patlas-ige-sistema': 'CMDB futuro',
      'patlas-ige-tipo': 'Cadastro',
      'patlas-ige-status': 'Dispensado',
      'patlas-ige-justif': 'CMDB ainda não implementado na Fase 1 — dispensado conforme escopo.',
    }),
  ],
  activeExamplePresetId: 'patlas-ige-p-prot-conf',
}

// ============================================================================
// FORM 22 — HANDOVER
// ============================================================================

const formHandover = {
  id: F_HOV,
  name: 'Handover',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Transferência operacional para pós-vendas após o contrato estar consolidado.',
  fields: [
    f('patlas-hov-numero', 'Número/identificador do handover', 'text', { required: true, relevance: 'identity' }),
    f('patlas-hov-ctr', 'Contrato', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_CTR }),
    f('patlas-hov-cliente', 'Cliente/órgão', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG }),
    f('patlas-hov-prp', 'Proposta vinculada', 'reference', { required: true, linkedFormId: F_PRP }),
    f('patlas-hov-doc', 'Documento de handover', 'reference', { linkedFormId: F_DGD }),
    f('patlas-hov-resp-dirc', 'Responsável DIRC', 'reference', { linkedFormId: F_PES }),
    f('patlas-hov-resp-pos', 'Responsável pós-vendas', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_PES }),
    f('patlas-hov-resp-tec', 'Responsável técnico', 'reference', { linkedFormId: F_PES }),
    f('patlas-hov-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_HANDOVER }),
    f('patlas-hov-data-ger', 'Data geração', 'date'),
    f('patlas-hov-data-env', 'Data envio pós-vendas', 'date'),
    f('patlas-hov-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-hov-meth-gerar', 'Gerar documento de handover', 'description', 'destaque'),
    m('patlas-hov-meth-enviar', 'Enviar para pós-vendas', 'send', 'destaque'),
    m('patlas-hov-meth-kof', 'Agendar kick-off', 'event', 'menu'),
    m('patlas-hov-meth-concluir', 'Concluir handover', 'check_circle', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-hov-p-gerado', 'Handover gerado', pick(0), {
      'patlas-hov-numero': 'HOV-2026-001',
      'patlas-hov-status': 'Gerado',
      'patlas-hov-data-ger': '2026-03-13',
    }),
    p('patlas-hov-p-aguard', 'Aguardando kick-off', pick(1), {
      'patlas-hov-numero': 'HOV-2026-002',
      'patlas-hov-status': 'Aguardando kick-off',
      'patlas-hov-data-ger': '2026-03-13',
      'patlas-hov-data-env': '2026-03-14',
    }),
    p('patlas-hov-p-concluido', 'Concluído', pick(2), {
      'patlas-hov-numero': 'HOV-2026-003',
      'patlas-hov-status': 'Concluído',
      'patlas-hov-data-ger': '2026-03-10',
      'patlas-hov-data-env': '2026-03-11',
    }),
  ],
  activeExamplePresetId: 'patlas-hov-p-aguard',
}

// ============================================================================
// FORM 23 — KICK-OFF
// ============================================================================

const formKickoff = {
  id: F_KOF,
  name: 'Kick-off',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Reunião de partida com cliente, MTI e (se houver) parceiro. Kick-off agendado é o marco final da Fase 1.',
  fields: [
    f('patlas-kof-ctr', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlas-kof-hov', 'Handover', 'reference', { required: true, linkedFormId: F_HOV }),
    f('patlas-kof-cliente', 'Cliente/órgão', 'reference', { required: true, relevance: 'identity', linkedFormId: F_ORG }),
    f('patlas-kof-data', 'Data prevista', 'date', { required: true, relevance: 'highlight' }),
    f('patlas-kof-mti', 'Participantes MTI', 'reference', { multiple: true, linkedFormId: F_PES }),
    f('patlas-kof-cli', 'Participantes cliente', 'text', { size: 'large' }),
    f('patlas-kof-parc', 'Participantes parceiro', 'reference', { multiple: true, linkedFormId: F_PES }),
    f('patlas-kof-link', 'Link/local da reunião', 'text', { size: 'large' }),
    f('patlas-kof-pauta', 'Pauta', 'text', { size: 'large', textLong: true }),
    f('patlas-kof-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_KICKOFF }),
    f('patlas-kof-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-kof-meth-agendar', 'Agendar kick-off', 'event', 'destaque'),
    m('patlas-kof-meth-realizado', 'Marcar como realizado', 'check_circle', 'destaque'),
    m('patlas-kof-meth-reagendar', 'Reagendar', 'event_repeat', 'menu'),
    m('patlas-kof-meth-cancelar', 'Cancelar', 'cancel', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-kof-p-agendado', 'Agendado', pick(0), {
      'patlas-kof-data': '2026-03-22',
      'patlas-kof-cli': 'Juliana Pereira (TJMT); Ricardo Almeida (TJMT)',
      'patlas-kof-link': 'https://meet.google.com/abc-defg-hij',
      'patlas-kof-pauta': '1) Apresentação dos times. 2) Cronograma de implantação. 3) Pontos de atenção. 4) Próximos passos.',
      'patlas-kof-status': 'Agendado',
    }),
    p('patlas-kof-p-aguardando', 'Aguardando agendamento', pick(6), {
      'patlas-kof-status': 'Aguardando agendamento',
    }),
    p('patlas-kof-p-realizado', 'Realizado', pick(2), {
      'patlas-kof-data': '2026-03-18',
      'patlas-kof-status': 'Realizado',
    }),
  ],
  activeExamplePresetId: 'patlas-kof-p-agendado',
}

// ============================================================================
// FORM 24 — NOTIFICAÇÃO
// ============================================================================

const formNotificacao = {
  id: F_NTF,
  name: 'Notificação',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Mensagens enviadas (e-mail, sistema, portal futuro) durante o ciclo da Fase 1.',
  fields: [
    f('patlas-ntf-titulo', 'Título', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-ntf-tipo', 'Tipo', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_NOTIFICACAO }),
    f('patlas-ntf-dest', 'Destinatário', 'text', { required: true, size: 'large' }),
    f('patlas-ntf-canal', 'Canal', 'textOptions', { required: true, relevance: 'highlight', options: CANAL_NOTIFICACAO }),
    f('patlas-ntf-msg', 'Mensagem', 'text', { size: 'large', textLong: true, required: true }),
    f('patlas-ntf-processo', 'Processo relacionado', 'text', { size: 'large' }),
    f('patlas-ntf-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_NOTIFICACAO }),
    f('patlas-ntf-data', 'Data envio', 'date'),
    f('patlas-ntf-tent', 'Tentativas', 'number', { size: 'small' }),
  ],
  methods: [
    m('patlas-ntf-meth-reenviar', 'Reenviar', 'forward_to_inbox', 'destaque'),
    m('patlas-ntf-meth-cancelar', 'Cancelar', 'cancel', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-ntf-p-cred', 'Envio de credenciais — Enviada', pick(0), {
      'patlas-ntf-titulo': 'Credenciais de acesso ao Atlas',
      'patlas-ntf-tipo': 'Cliente',
      'patlas-ntf-dest': 'juliana.pereira@tjmt.jus.br',
      'patlas-ntf-canal': 'E-mail',
      'patlas-ntf-msg': 'Olá, suas credenciais foram criadas. Acesse o Atlas com seu login Gov.br.',
      'patlas-ntf-processo': 'Contrato CT-2026-005',
      'patlas-ntf-status': 'Enviada',
      'patlas-ntf-data': '2026-03-15',
    }),
    p('patlas-ntf-p-atr', 'Atraso de assinatura — Pendente', pick(6), {
      'patlas-ntf-titulo': 'Pendência de assinatura — DTIC',
      'patlas-ntf-tipo': 'Assinatura',
      'patlas-ntf-dest': 'dtic@mti.mt.gov.br',
      'patlas-ntf-canal': 'E-mail',
      'patlas-ntf-msg': 'A proposta PROP-2026-004 aguarda assinatura DTIC há 3 dias.',
      'patlas-ntf-status': 'Pendente',
      'patlas-ntf-tent': 1,
    }),
  ],
  activeExamplePresetId: 'patlas-ntf-p-cred',
}

// ============================================================================
// FORM 25 — HISTÓRICO DO PROCESSO
// ============================================================================

const formHistorico = {
  id: F_HST,
  name: 'Histórico do Processo',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Linha do tempo de eventos relevantes em propostas, contratos e integrações.',
  fields: [
    f('patlas-hst-data', 'Data/hora', 'text', { required: true, relevance: 'highlight' }),
    f('patlas-hst-processo', 'Processo', 'text', { size: 'large', required: true }),
    f('patlas-hst-tipo', 'Tipo de evento', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_HISTORICO }),
    f('patlas-hst-usuario', 'Usuário responsável', 'reference', { linkedFormId: F_PES }),
    f('patlas-hst-st-ant', 'Status anterior', 'text', { relevance: 'advanced' }),
    f('patlas-hst-st-novo', 'Status novo', 'text', { relevance: 'advanced' }),
    f('patlas-hst-desc', 'Descrição', 'text', { size: 'large', textLong: true, required: true, relevance: 'identity' }),
  ],
  exampleValuePresets: [
    p('patlas-hst-p-criado', 'Criação da proposta', pick(0), {
      'patlas-hst-data': '2026-02-05 10:24',
      'patlas-hst-processo': 'PROP-2026-001',
      'patlas-hst-tipo': 'Criado',
      'patlas-hst-st-novo': 'Em composição',
      'patlas-hst-desc': 'Proposta criada a partir da demanda COT-2026-001.',
    }),
    p('patlas-hst-p-assinado', 'Assinatura realizada', pick(2), {
      'patlas-hst-data': '2026-02-24 16:08',
      'patlas-hst-processo': 'PROP-2026-005',
      'patlas-hst-tipo': 'Assinado',
      'patlas-hst-st-ant': 'Em assinatura',
      'patlas-hst-st-novo': 'Aprovada',
      'patlas-hst-desc': 'Presidente assinou a proposta PROP-2026-005 — aprovada para envio ao cliente.',
    }),
  ],
  activeExamplePresetId: 'patlas-hst-p-criado',
}

// ============================================================================
// AGREGADO DE FORMS
// ============================================================================

const forms = [
  formOrganizacao,
  formPessoa,
  formUsuario,
  formEstrutura,
  formCargo,
  formProdutoVigente,
  formCatalogoLicenca,
  formCatalogoServico,
  formDemanda,
  formProposta,
  formItemProposta,
  formModeloDocumento,
  formDocumentoGerado,
  formWorkflowModelo,
  formWorkflowEtapa,
  formTramiteAssinatura,
  formContrato,
  formContratoItem,
  formRecorrencia,
  formPublicacao,
  formIntegracaoEvento,
  formHandover,
  formKickoff,
  formNotificacao,
  formHistorico,
]

// ============================================================================
// WORKSPACES (6) — por visão de usuário
// ============================================================================

function cls(id, name, linkedFormId, presetIds) {
  return {
    id,
    name,
    ...(linkedFormId ? { linkedFormId } : {}),
    ...(presetIds && presetIds.length > 0 ? { linkedFormExamplePresetIds: presetIds } : {}),
  }
}

const workspaces = [
  // 4.1 Administração Atlas — Identidade, estrutura, permissões, histórico
  {
    id: 'ws-patlas-administracao',
    name: 'Administração Atlas',
    explorerChromeColor: '#1e40af',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'AD',
    packages: [
      {
        id: 'pkg-patlas-adm-identidade',
        name: 'Identidade',
        classes: [
          cls('cls-patlas-adm-org', 'Organizações', F_ORG),
          cls('cls-patlas-adm-pes', 'Pessoas', F_PES),
          cls('cls-patlas-adm-usr', 'Usuários', F_USR),
        ],
      },
      {
        id: 'pkg-patlas-adm-estrutura',
        name: 'Estrutura e permissões',
        classes: [
          cls('cls-patlas-adm-est', 'Estrutura MTI', F_EST),
          cls('cls-patlas-adm-cgf', 'Cargos / Funções', F_CGF),
        ],
      },
      {
        id: 'pkg-patlas-adm-auditoria',
        name: 'Auditoria',
        classes: [
          cls('cls-patlas-adm-hst', 'Histórico', F_HST),
        ],
      },
    ],
  },

  // 4.2 Catálogo Comercial — Produtos, licenças, serviços
  {
    id: 'ws-patlas-catalogo',
    name: 'Catálogo Comercial',
    explorerChromeColor: '#0d9488',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'CT',
    packages: [
      {
        id: 'pkg-patlas-cat-produtos',
        name: 'Produtos vigentes',
        classes: [
          cls('cls-patlas-cat-pv', 'Produtos vigentes', F_PV),
        ],
      },
      {
        id: 'pkg-patlas-cat-licencas',
        name: 'Licenças',
        classes: [
          cls('cls-patlas-cat-lic', 'Catálogo de Licenças', F_LIC),
        ],
      },
      {
        id: 'pkg-patlas-cat-servicos',
        name: 'Serviços',
        classes: [
          cls('cls-patlas-cat-srv', 'Catálogo de Serviços', F_SRV),
        ],
      },
      {
        id: 'pkg-patlas-cat-bloqueados',
        name: 'Itens bloqueados / paralisados',
        classes: [
          cls('cls-patlas-cat-pv-bloq', 'Produtos paralisados', F_PV, ['patlas-pv-p-paralisado']),
          cls('cls-patlas-cat-lic-bloq', 'Licenças paralisadas', F_LIC, ['patlas-lic-p-paralisada']),
          cls('cls-patlas-cat-srv-bloq', 'Serviços paralisados', F_SRV, ['patlas-srv-p-paralisado']),
        ],
      },
    ],
  },

  // 4.3 DIRC / Propostas — Demandas, propostas em construção, documentos
  {
    id: 'ws-patlas-dirc-propostas',
    name: 'DIRC / Propostas',
    explorerChromeColor: '#7c3aed',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'DI',
    packages: [
      {
        id: 'pkg-patlas-dirc-demandas',
        name: 'Demandas recebidas',
        classes: [
          cls('cls-patlas-dirc-dem', 'Demandas', F_DEM),
        ],
      },
      {
        id: 'pkg-patlas-dirc-propostas',
        name: 'Propostas',
        classes: [
          cls('cls-patlas-dirc-prp', 'Propostas', F_PRP),
          cls('cls-patlas-dirc-pri', 'Itens da proposta', F_PRI),
        ],
      },
      {
        id: 'pkg-patlas-dirc-doc',
        name: 'Documentos',
        classes: [
          cls('cls-patlas-dirc-dtp', 'Modelos de documento', F_DTP),
          cls('cls-patlas-dirc-dgd', 'Documentos gerados', F_DGD),
        ],
      },
      {
        id: 'pkg-patlas-dirc-parc',
        name: 'Análise do parceiro',
        classes: [
          cls('cls-patlas-dirc-prp-parc', 'Propostas aguardando parceiro', F_PRP, ['patlas-prp-p-002-parc']),
        ],
      },
    ],
  },

  // 4.4 Parceiro — vê apenas o que está vinculado
  {
    id: 'ws-patlas-parceiro',
    name: 'Parceiro',
    explorerChromeColor: '#b45309',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'PA',
    packages: [
      {
        id: 'pkg-patlas-parc-demandas',
        name: 'Demandas vinculadas',
        classes: [
          cls('cls-patlas-parc-dem', 'Demandas vinculadas', F_DEM, ['patlas-dem-p-cot002']),
        ],
      },
      {
        id: 'pkg-patlas-parc-propostas',
        name: 'Propostas para análise',
        classes: [
          cls('cls-patlas-parc-prp', 'Propostas com parceiro', F_PRP, ['patlas-prp-p-002-parc', 'patlas-prp-p-003-dirc-parc']),
        ],
      },
      {
        id: 'pkg-patlas-parc-itens',
        name: 'Itens da parceria',
        classes: [
          cls('cls-patlas-parc-pri', 'Itens vinculados ao parceiro', F_PRI),
        ],
      },
      {
        id: 'pkg-patlas-parc-pend',
        name: 'Pendências de assinatura',
        classes: [
          cls('cls-patlas-parc-tra', 'Assinaturas do parceiro', F_TRA, ['patlas-tra-p-parc-ass', 'patlas-tra-p-dispensada']),
        ],
      },
    ],
  },

  // 4.5 Assinaturas e Contratos — DTIC, Presidência, Pós-vendas
  {
    id: 'ws-patlas-assinaturas-contratos',
    name: 'Assinaturas e Contratos',
    explorerChromeColor: '#0c1ba8',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'AC',
    packages: [
      {
        id: 'pkg-patlas-ac-tramites',
        name: 'Trâmites de assinatura',
        classes: [
          cls('cls-patlas-ac-tra', 'Trâmites de assinatura', F_TRA),
          cls('cls-patlas-ac-wfm', 'Workflows ativos', F_WFM),
        ],
      },
      {
        id: 'pkg-patlas-ac-contratos',
        name: 'Contratos',
        classes: [
          cls('cls-patlas-ac-ctr', 'Contratos recebidos', F_CTR),
          cls('cls-patlas-ac-cti', 'Itens contratados', F_CTI),
        ],
      },
      {
        id: 'pkg-patlas-ac-publ',
        name: 'Publicações',
        classes: [
          cls('cls-patlas-ac-pub', 'Publicações', F_PUB),
        ],
      },
      {
        id: 'pkg-patlas-ac-integ',
        name: 'Integrações',
        classes: [
          cls('cls-patlas-ac-ige', 'Eventos de integração', F_IGE),
        ],
      },
      {
        id: 'pkg-patlas-ac-handover',
        name: 'Handover',
        classes: [
          cls('cls-patlas-ac-hov', 'Handovers', F_HOV),
        ],
      },
      {
        id: 'pkg-patlas-ac-kickoff',
        name: 'Kick-off',
        classes: [
          cls('cls-patlas-ac-kof', 'Kick-offs', F_KOF),
        ],
      },
    ],
  },

  // 4.6 Visão Operacional — Indicadores e filas
  {
    id: 'ws-patlas-visao-operacional',
    name: 'Visão Operacional',
    explorerChromeColor: '#059669',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'VO',
    packages: [
      {
        id: 'pkg-patlas-vo-demandas',
        name: 'Filas iniciais',
        classes: [
          cls('cls-patlas-vo-dem', 'Demandas recebidas', F_DEM),
          cls('cls-patlas-vo-prp-comp', 'Propostas em composição', F_PRP, ['patlas-prp-p-001-comp']),
        ],
      },
      {
        id: 'pkg-patlas-vo-parc-ass',
        name: 'Em parceiro / em assinatura',
        classes: [
          cls('cls-patlas-vo-prp-parc', 'Aguardando parceiro', F_PRP, ['patlas-prp-p-002-parc']),
          cls('cls-patlas-vo-prp-ass', 'Em assinatura', F_PRP, ['patlas-prp-p-003-dirc-parc', 'patlas-prp-p-004-dtic', 'patlas-prp-p-005-pres']),
        ],
      },
      {
        id: 'pkg-patlas-vo-cliente',
        name: 'Aguardando cliente',
        classes: [
          cls('cls-patlas-vo-prp-cli', 'Enviadas ao cliente', F_PRP, ['patlas-prp-p-006-cli']),
          cls('cls-patlas-vo-ctr-aguard', 'Contratos aguardando retorno', F_CTR, ['patlas-ctr-p-001']),
        ],
      },
      {
        id: 'pkg-patlas-vo-pos-recebimento',
        name: 'Pós-recebimento',
        classes: [
          cls('cls-patlas-vo-ctr-rec', 'Contratos recebidos', F_CTR, ['patlas-ctr-p-001', 'patlas-ctr-p-002']),
          cls('cls-patlas-vo-pub-pend', 'Publicações pendentes', F_PUB, ['patlas-pub-p-pendente']),
          cls('cls-patlas-vo-int-erro', 'Integrações com erro', F_IGE, ['patlas-ige-p-snow-erro']),
        ],
      },
      {
        id: 'pkg-patlas-vo-encerramento',
        name: 'Encerramento',
        classes: [
          cls('cls-patlas-vo-hov-pend', 'Handover pendente', F_HOV, ['patlas-hov-p-gerado', 'patlas-hov-p-aguard']),
          cls('cls-patlas-vo-kof-pend', 'Kick-off pendente', F_KOF, ['patlas-kof-p-aguardando']),
          cls('cls-patlas-vo-notif', 'Notificações pendentes', F_NTF, ['patlas-ntf-p-atr']),
        ],
      },
    ],
  },
]

// ============================================================================
// FLOW — Fase 1: Da demanda ao kick-off (23 etapas)
// ============================================================================

const flow = {
  id: 'flow-patlas-fase1-proposta-contrato',
  name: 'Fase 1 — Da demanda ao kick-off',
  steps: [
    {
      id: 'step-patlas-f1-inicio',
      title: 'Visão geral da Fase 1',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Fase 1 — Da demanda ao kick-off',
      htmlContent: `<div style="padding:32px 48px;max-width:920px;margin:0 auto;font-family:'Inter',system-ui,sans-serif;color:#0f172a;">
  <h1 style="font-size:1.85rem;margin:0 0 12px 0;">Fase 1 — Da demanda ao kick-off</h1>
  <p style="font-size:1.05rem;line-height:1.55;color:#334155;">Jornada de ponta a ponta no <strong>Atlas</strong>, partindo da identificação da demanda até o agendamento do kick-off com o cliente. Esta apresentação demonstra cada tela, regra de negócio e perfil envolvido.</p>
  <h2 style="font-size:1.1rem;margin:24px 0 8px 0;color:#1e40af;">O que muda entre a Fase 1 e o sistema completo?</h2>
  <ul style="line-height:1.7;color:#334155;">
    <li><strong>Cliente não monta proposta na Fase 1</strong> — a composição é interna (DIRC ou parceiro autorizado).</li>
    <li><strong>Parceiro só vê</strong> processos vinculados à sua organização.</li>
    <li><strong>Cadastro formal do cliente</strong> ocorre <em>após</em> o contrato voltar assinado.</li>
    <li><strong>Assinaturas por cargo/função</strong>, nunca por pessoa fixa.</li>
    <li><strong>Publicação do contrato</strong> é mandatória.</li>
    <li><strong>Kick-off agendado</strong> é o marco final operacional da Fase 1.</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:24px 0 8px 0;color:#1e40af;">Fora desta Fase 1</h2>
  <p style="color:#475569;">OS completa, RAER, nota fiscal, DAR, faturamento, BI/CMDB, ClickSense, medição de consumo, conciliação financeira e portal completo do cliente.</p>
</div>`,
    },
    {
      id: 'step-patlas-f1-demanda',
      title: 'Registrar demanda',
      type: 'class',
      linkedFormId: F_DEM,
      classPresentationTitle: 'Registrar demanda',
      classPresentationDescription: 'A demanda chega por e-mail, WhatsApp, marketplace, reunião ou parceiro. É registrada e fica aguardando análise da DIRC.',
      classMethodNavigateStepIds: {
        'patlas-dem-meth-iniciar': 'step-patlas-f1-analise-dirc',
        'patlas-dem-meth-proposta': 'step-patlas-f1-proposta',
      },
    },
    {
      id: 'step-patlas-f1-analise-dirc',
      title: 'Análise inicial da DIRC',
      type: 'class',
      linkedFormId: F_DEM,
      classPresentationTitle: 'Análise da DIRC',
      classPresentationDescription: 'A DIRC decide se prossegue, solicita complemento, envia ao parceiro, rejeita ou cancela. Demanda só vira proposta após decisão positiva.',
      classMethodNavigateStepIds: {
        'patlas-dem-meth-comp': 'step-patlas-f1-demanda',
        'patlas-dem-meth-parceiro': 'step-patlas-f1-parceiro',
        'patlas-dem-meth-proposta': 'step-patlas-f1-catalogo',
      },
    },
    {
      id: 'step-patlas-f1-catalogo',
      title: 'Selecionar produtos, licenças e serviços',
      type: 'workspace',
      linkedWorkspaceId: 'ws-patlas-catalogo',
      assigneeRole: 'Analista DIRC',
      workspacePresentationDescription: 'Catálogo Comercial completo: produtos vigentes, licenças e serviços. Itens paralisados/suspensos aparecem só para consulta. A seleção copia os dados como snapshot para o item da proposta.',
      workspaceMethodNavigateStepIds: {
        'pkg-patlas-cat-produtos::cls-patlas-cat-pv::patlas-pv-meth-selecionar': 'step-patlas-f1-proposta',
        'pkg-patlas-cat-licencas::cls-patlas-cat-lic::patlas-lic-meth-selecionar': 'step-patlas-f1-proposta',
        'pkg-patlas-cat-servicos::cls-patlas-cat-srv::patlas-srv-meth-selecionar': 'step-patlas-f1-proposta',
      },
    },
    {
      id: 'step-patlas-f1-proposta',
      title: 'Compor proposta',
      type: 'class',
      linkedFormId: F_PRP,
      classPresentationTitle: 'Composição da proposta',
      classPresentationDescription: 'DIRC monta a proposta com itens do catálogo (snapshot) ou item manual (com justificativa).',
      classMethodNavigateStepIds: {
        'patlas-prp-meth-montar': 'step-patlas-f1-catalogo',
        'patlas-prp-meth-manual': 'step-patlas-f1-itens',
        'patlas-prp-meth-gerar': 'step-patlas-f1-documento',
        'patlas-prp-meth-parceiro': 'step-patlas-f1-parceiro',
        'patlas-prp-meth-wf': 'step-patlas-f1-workflow',
      },
    },
    {
      id: 'step-patlas-f1-itens',
      title: 'Revisar itens da proposta',
      type: 'class',
      linkedFormId: F_PRI,
      classPresentationTitle: 'Itens da proposta',
      classPresentationDescription: 'Cada item da proposta preserva snapshot do catálogo. Valor total = quantidade × valor unitário. Item manual exige justificativa.',
    },
    {
      id: 'step-patlas-f1-parceiro',
      title: 'Análise do parceiro',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      bpmnActivityKey: 'Análise do parceiro',
      bpmnDescription: 'Quando há parceiro envolvido, a proposta vai para análise/ajuste do parceiro antes das assinaturas internas.',
      assigneeRole: 'Parceiro vinculado',
      assigneeRoleDetail: 'Parceiro identificado em "Parceiros" da proposta. Só vê processos vinculados à própria organização.',
      bpmnRuleList: [
        'Sem parceiro: etapa é dispensada automaticamente.',
        'Parceiro pode aceitar, ajustar (volta para proposta) ou rejeitar.',
        'Parceiro inativo/suspenso NÃO pode ser indicado em nova proposta.',
      ],
      bpmnPossiblePaths: [
        { key: 'Aceito pelo parceiro', value: 'step-patlas-f1-documento' },
        { key: 'Ajuste solicitado', value: 'step-patlas-f1-itens' },
        { key: 'Sem parceiro (dispensado)', value: 'step-patlas-f1-documento' },
      ],
      bpmnSla: '5 dias úteis',
      bpmnSlaIfExceeded: 'Notifica DIRC e abre alerta na Visão Operacional.',
    },
    {
      id: 'step-patlas-f1-documento',
      title: 'Gerar documento da proposta',
      type: 'class',
      linkedFormId: F_DGD,
      classPresentationTitle: 'Documento gerado',
      classPresentationDescription: 'A proposta vira documento (PDF/HTML) a partir de um modelo publicado. Modelo em rascunho não pode ser usado.',
      classMethodNavigateStepIds: {
        'patlas-dgd-meth-assinar': 'step-patlas-f1-workflow',
      },
    },
    {
      id: 'step-patlas-f1-workflow',
      title: 'Iniciar workflow de aprovação',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      bpmnActivityKey: 'Submeter proposta ao workflow',
      bpmnDescription: 'A proposta entra no workflow de aprovação. Cada etapa exige assinatura por cargo/função.',
      assigneeRole: 'DIRC',
      bpmnRuleList: [
        'Workflow padrão: DIRC/Parceiro → DTIC → Presidência.',
        'Ajuste em qualquer assinatura volta para revisão da proposta.',
        'Reprovação encerra o ciclo (precisa nova proposta).',
      ],
      bpmnPossiblePaths: [
        { key: 'Assinatura DIRC/Parceiro', value: 'step-patlas-f1-assinatura-dirc-parceiro' },
      ],
    },
    {
      id: 'step-patlas-f1-assinatura-dirc-parceiro',
      title: 'Assinatura DIRC / Parceiro',
      type: 'class',
      linkedFormId: F_TRA,
      classPresentationTitle: 'Assinatura DIRC/Parceiro',
      classPresentationDescription: 'Primeira camada de assinatura. Parceiro só assina se houver vínculo na proposta — caso contrário a assinatura é dispensada.',
      classMethodNavigateStepIds: {
        'patlas-tra-meth-assinar': 'step-patlas-f1-assinatura-dtic',
        'patlas-tra-meth-ajuste': 'step-patlas-f1-proposta',
        'patlas-tra-meth-reprovar': 'step-patlas-f1-proposta',
      },
    },
    {
      id: 'step-patlas-f1-assinatura-dtic',
      title: 'Assinatura DTIC',
      type: 'class',
      linkedFormId: F_TRA,
      classPresentationTitle: 'Assinatura DTIC',
      classPresentationDescription: 'Diretoria de Tecnologia avalia aderência técnica do escopo. Ajuste/reprovação volta para a proposta.',
      classMethodNavigateStepIds: {
        'patlas-tra-meth-assinar': 'step-patlas-f1-assinatura-presidencia',
        'patlas-tra-meth-ajuste': 'step-patlas-f1-proposta',
        'patlas-tra-meth-reprovar': 'step-patlas-f1-proposta',
      },
    },
    {
      id: 'step-patlas-f1-assinatura-presidencia',
      title: 'Assinatura Presidência',
      type: 'class',
      linkedFormId: F_TRA,
      classPresentationTitle: 'Assinatura Presidência',
      classPresentationDescription: 'Última camada. Aprovação libera o envio ao cliente.',
      classMethodNavigateStepIds: {
        'patlas-tra-meth-assinar': 'step-patlas-f1-envio-cliente',
        'patlas-tra-meth-ajuste': 'step-patlas-f1-proposta',
        'patlas-tra-meth-reprovar': 'step-patlas-f1-proposta',
      },
    },
    {
      id: 'step-patlas-f1-envio-cliente',
      title: 'Enviar proposta ao cliente',
      type: 'class',
      linkedFormId: F_PRP,
      classPresentationTitle: 'Envio ao cliente',
      classPresentationDescription: 'Após aprovada, a proposta é enviada ao cliente (e-mail/portal). Atlas aguarda o retorno.',
      classMethodNavigateStepIds: {
        'patlas-prp-meth-enviar': 'step-patlas-f1-contratacao-externa',
      },
    },
    {
      id: 'step-patlas-f1-contratacao-externa',
      title: 'Apoiar contratação externa',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Contratação externa (fora do Atlas)',
      htmlContent: `<div style="padding:32px 48px;max-width:880px;margin:0 auto;font-family:'Inter',system-ui,sans-serif;color:#0f172a;">
  <h1 style="font-size:1.55rem;margin:0 0 8px 0;">Contratação ocorre fora do Atlas</h1>
  <p style="line-height:1.55;color:#334155;">O cliente executa o processo de contratação no seu próprio ambiente (compras, jurídico, contratos). O Atlas:</p>
  <ul style="line-height:1.7;color:#334155;">
    <li>Registra a <strong>data de envio</strong> da proposta ao cliente.</li>
    <li>Monitora o status <em>Aguardando retorno do cliente</em>.</li>
    <li>Notifica o focal de vendas em caso de atraso.</li>
    <li>Não interfere no ciclo interno do cliente; aguarda o contrato voltar.</li>
  </ul>
  <p style="margin-top:18px;padding:12px 16px;background:#eff6ff;border-left:4px solid #1e40af;color:#1e3a8a;">Quando o contrato assinado retornar à MTI, será registrado em <strong>Contrato recebido</strong>.</p>
</div>`,
    },
    {
      id: 'step-patlas-f1-contrato-recebido',
      title: 'Registrar contrato recebido',
      type: 'class',
      linkedFormId: F_CTR,
      classPresentationTitle: 'Contrato recebido',
      classPresentationDescription: 'O contrato volta assinado. Anexo e data de retorno são obrigatórios. Se houver divergência (downsizing, substituição, ajuste de valor), tipo e justificativa são exigidos.',
      classMethodNavigateStepIds: {
        'patlas-ctr-meth-registrar': 'step-patlas-f1-itens-contratados',
        'patlas-ctr-meth-revisar': 'step-patlas-f1-itens-contratados',
        'patlas-ctr-meth-cliente': 'step-patlas-f1-cadastro-cliente',
        'patlas-ctr-meth-recor': 'step-patlas-f1-recorrencia',
        'patlas-ctr-meth-publ': 'step-patlas-f1-publicacao',
        'patlas-ctr-meth-prot': 'step-patlas-f1-integracoes',
        'patlas-ctr-meth-snow': 'step-patlas-f1-integracoes',
        'patlas-ctr-meth-hov': 'step-patlas-f1-handover',
        'patlas-ctr-meth-kof': 'step-patlas-f1-kickoff',
        'patlas-ctr-meth-fim': 'step-patlas-f1-fim',
      },
    },
    {
      id: 'step-patlas-f1-itens-contratados',
      title: 'Revisar itens contratados',
      type: 'class',
      linkedFormId: F_CTI,
      classPresentationTitle: 'Itens contratados',
      classPresentationDescription: 'Comparativo proposta × contrato. Cada divergência precisa de motivo registrado.',
    },
    {
      id: 'step-patlas-f1-cadastro-cliente',
      title: 'Cadastrar cliente e enviar credenciais',
      type: 'class',
      linkedFormId: F_USR,
      classPresentationTitle: 'Cadastro formal do cliente',
      classPresentationDescription: 'O cliente é cadastrado formalmente APÓS o contrato recebido. Recebe credenciais via Gov.br ou MT Login.',
      classMethodNavigateStepIds: {
        'patlas-usr-meth-cred': 'step-patlas-f1-recorrencia',
      },
    },
    {
      id: 'step-patlas-f1-recorrencia',
      title: 'Configurar recorrências',
      type: 'class',
      linkedFormId: F_REC,
      classPresentationTitle: 'Recorrência de cobrança',
      classPresentationDescription: 'Define ciclo de cobrança (mensal, anual, sob demanda, etc.) para cada item contratado. A cobrança real está fora da Fase 1.',
    },
    {
      id: 'step-patlas-f1-publicacao',
      title: 'Registrar publicação obrigatória',
      type: 'class',
      linkedFormId: F_PUB,
      classPresentationTitle: 'Publicação do contrato',
      classPresentationDescription: 'Extrato e data da publicação (Diário Oficial, portal, etc.) são MANDATÓRIOS para validade do processo.',
    },
    {
      id: 'step-patlas-f1-integracoes',
      title: 'Registrar integrações',
      type: 'class',
      linkedFormId: F_IGE,
      classPresentationTitle: 'Eventos de integração',
      classPresentationDescription: 'Protheus e ServiceNow precisam ter status rastreável. Erros e pendências exigem justificativa.',
    },
    {
      id: 'step-patlas-f1-handover',
      title: 'Gerar handover',
      type: 'class',
      linkedFormId: F_HOV,
      classPresentationTitle: 'Handover',
      classPresentationDescription: 'Transferência operacional para pós-vendas. Documento de handover é gerado e enviado.',
      classMethodNavigateStepIds: {
        'patlas-hov-meth-gerar': 'step-patlas-f1-handover',
        'patlas-hov-meth-enviar': 'step-patlas-f1-kickoff',
        'patlas-hov-meth-kof': 'step-patlas-f1-kickoff',
      },
    },
    {
      id: 'step-patlas-f1-kickoff',
      title: 'Agendar kick-off',
      type: 'class',
      linkedFormId: F_KOF,
      classPresentationTitle: 'Kick-off',
      classPresentationDescription: 'Reunião de partida com MTI, cliente e parceiro (se houver). Kick-off agendado encerra operacionalmente a Fase 1.',
      classMethodNavigateStepIds: {
        'patlas-kof-meth-agendar': 'step-patlas-f1-fim',
        'patlas-kof-meth-realizado': 'step-patlas-f1-fim',
      },
    },
    {
      id: 'step-patlas-f1-fim',
      title: 'Encerramento operacional da Fase 1',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Fase 1 encerrada',
      htmlContent: `<div style="padding:32px 48px;max-width:920px;margin:0 auto;font-family:'Inter',system-ui,sans-serif;color:#0f172a;">
  <h1 style="font-size:1.85rem;margin:0 0 12px 0;color:#059669;">Fase 1 concluída</h1>
  <p style="font-size:1.05rem;line-height:1.55;color:#334155;">A jornada da demanda ao kick-off foi demonstrada. A partir daqui o processo entra em <strong>operação contínua</strong> (cobrança recorrente, sustentação, medição de consumo, faturamento, BI e demais funcionalidades), que estão <em>fora do escopo</em> desta Fase 1.</p>
  <h2 style="font-size:1.1rem;margin:24px 0 8px 0;color:#1e40af;">O que ficou pronto</h2>
  <ul style="line-height:1.7;color:#334155;">
    <li>Identidade (organizações, pessoas, usuários, estrutura MTI, cargos/funções).</li>
    <li>Catálogo comercial (produtos vigentes, licenças e serviços).</li>
    <li>Demanda → análise DIRC → composição de proposta.</li>
    <li>Documento, workflow e assinaturas por cargo/função.</li>
    <li>Envio ao cliente e acompanhamento da contratação externa.</li>
    <li>Contrato recebido, revisão de itens, cadastro do cliente, credenciais.</li>
    <li>Recorrência, publicação e integrações.</li>
    <li>Handover e kick-off — marco final operacional.</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:24px 0 8px 0;color:#b45309;">Fora desta Fase 1</h2>
  <p style="color:#475569;">OS completa, RAER, NF, DAR, pagamento, faturamento completo, BI/CMDB, ClickSense, medição de consumo, conciliação financeira, portal completo do cliente.</p>
</div>`,
    },
  ],
}

const flows = [flow]

// ============================================================================
// CLASS-GROUPS (organização da aba Classes do editor)
// ============================================================================

const G_IDENTIDADE = 'grp-patlas-v1-identidade'
const G_CATALOGO = 'grp-patlas-v1-catalogo'
const G_PROPOSTA = 'grp-patlas-v1-proposta'
const G_DOCWF = 'grp-patlas-v1-doc-wf'
const G_CONTRATO = 'grp-patlas-v1-contrato'
const G_OPS = 'grp-patlas-v1-ops'

const classGroups = {
  groups: [
    { id: G_IDENTIDADE, name: 'Identidade e administração' },
    { id: G_CATALOGO, name: 'Catálogo comercial' },
    { id: G_PROPOSTA, name: 'Demanda e proposta' },
    { id: G_DOCWF, name: 'Documento e workflow' },
    { id: G_CONTRATO, name: 'Contrato e operacionalização' },
    { id: G_OPS, name: 'Notificações e histórico' },
  ],
  assignments: {
    [F_ORG]: G_IDENTIDADE,
    [F_PES]: G_IDENTIDADE,
    [F_USR]: G_IDENTIDADE,
    [F_EST]: G_IDENTIDADE,
    [F_CGF]: G_IDENTIDADE,
    [F_PV]: G_CATALOGO,
    [F_LIC]: G_CATALOGO,
    [F_SRV]: G_CATALOGO,
    [F_DEM]: G_PROPOSTA,
    [F_PRP]: G_PROPOSTA,
    [F_PRI]: G_PROPOSTA,
    [F_DTP]: G_DOCWF,
    [F_DGD]: G_DOCWF,
    [F_WFM]: G_DOCWF,
    [F_WFE]: G_DOCWF,
    [F_TRA]: G_DOCWF,
    [F_CTR]: G_CONTRATO,
    [F_CTI]: G_CONTRATO,
    [F_REC]: G_CONTRATO,
    [F_PUB]: G_CONTRATO,
    [F_IGE]: G_CONTRATO,
    [F_HOV]: G_CONTRATO,
    [F_KOF]: G_CONTRATO,
    [F_NTF]: G_OPS,
    [F_HST]: G_OPS,
  },
  memberOrderByGroup: {
    [G_IDENTIDADE]: [F_ORG, F_PES, F_USR, F_EST, F_CGF],
    [G_CATALOGO]: [F_PV, F_LIC, F_SRV],
    [G_PROPOSTA]: [F_DEM, F_PRP, F_PRI],
    [G_DOCWF]: [F_DTP, F_DGD, F_WFM, F_WFE, F_TRA],
    [G_CONTRATO]: [F_CTR, F_CTI, F_REC, F_PUB, F_IGE, F_HOV, F_KOF],
    [G_OPS]: [F_NTF, F_HST],
  },
}

// ============================================================================
// ESCRITA DOS ARQUIVOS
// ============================================================================

if (!fs.existsSync(epicDir)) {
  fs.mkdirSync(epicDir, { recursive: true })
}

fs.writeFileSync(formsPath, JSON.stringify(forms, null, 2) + '\n', 'utf-8')
fs.writeFileSync(workspacesPath, JSON.stringify(workspaces, null, 2) + '\n', 'utf-8')
fs.writeFileSync(flowsPath, JSON.stringify(flows, null, 2) + '\n', 'utf-8')
fs.writeFileSync(classGroupsPath, JSON.stringify(classGroups, null, 2) + '\n', 'utf-8')

const totalPresets = forms.reduce((acc, f) => acc + (f.exampleValuePresets?.length ?? 0), 0)
const totalMethods = forms.reduce((acc, f) => acc + (f.methods?.length ?? 0), 0)
const totalFields = forms.reduce((acc, f) => acc + f.fields.length, 0)
const totalPackages = workspaces.reduce((acc, w) => acc + (w.packages?.length ?? 0), 0)
const totalClasses = workspaces.reduce(
  (acc, w) => acc + (w.packages ?? []).reduce((a, p) => a + (p.classes?.length ?? 0), 0),
  0,
)

console.log(`Atlas V1 — Fase 1 gerado em ${epicDir}`)
console.log(`  • forms.json          → ${forms.length} classes / ${totalFields} campos / ${totalMethods} métodos / ${totalPresets} presets`)
console.log(`  • workspaces.json     → ${workspaces.length} workspaces / ${totalPackages} pacotes / ${totalClasses} classes vinculadas`)
console.log(`  • flows.json          → 1 flow / ${flow.steps.length} etapas`)
console.log(`  • class-groups.json   → ${classGroups.groups.length} grupos`)
