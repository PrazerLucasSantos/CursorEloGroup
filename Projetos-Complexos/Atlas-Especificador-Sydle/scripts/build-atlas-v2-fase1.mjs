/**
 * Atlas V2 — Fase 1 (versão fiel e completa do requisito)
 *
 * Implementa fielmente REQUISITO-CURSOR-ATLAS-FASE1-COMPLETO-FIEL-PROJETO.md.
 *
 * Gera 4 arquivos do épico:
 *   data/subprojects/atlas-v2/epics/atlas-v2-fase1/
 *     - forms.json           (31 classes)
 *     - workspaces.json      (6 workspaces)
 *     - flows.json           (1 flow, 22 etapas — flow-patlas-fase1-proposta-contrato)
 *     - class-groups.json
 *
 * Regenerar:   node scripts/build-atlas-v2-fase1.mjs
 *
 * Convenções:
 *   - IDs com prefixo patlas-.
 *   - Linguagem de negócio (sem termos técnicos).
 *   - Status: textOptions + relevance:'highlight'.
 *   - Presets reais (SEMA, SEPLAG, SETASC, propostas 98 e 3, organograma MTI).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildFlowDetalhado } from './data/atlas-v2-flow-detalhado.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas-v2/epics/atlas-v2-fase1')

// ============================================================================
// CONSTANTES DE DOMÍNIO (fielmente do requisito)
// ============================================================================

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const TIPOS_ORGANIZACAO = ['MTI', 'Unidade MTI', 'Cliente/Órgão', 'Parceiro', 'Fornecedor', 'Órgão externo', 'Outro']
const STATUS_ORG = ['Ativa', 'Inativa', 'Em validação', 'Bloqueada', 'Suspensa']

const STATUS_PESSOA = ['Ativo', 'Inativo', 'Bloqueado', 'Substituído', 'Aguardando validação']
const VINCULO_PESSOA = ['MTI interno', 'Parceiro', 'Cliente', 'Terceiro', 'Outro']
const PAPEL_ASSINATURA = ['DIRC', 'Parceiro', 'DTIC', 'Presidência', 'Complementar', 'Pós-vendas', 'Técnico', 'Outro']

const TIPO_AUTENTICACAO = ['MT Login', 'Gov.br', 'AD/LDAP', 'Usuário e senha', 'Integração futura']
const PERFIL_USUARIO = [
  'Administrador Atlas', 'Analista DIRC', 'Parceiro', 'Assinante DTIC',
  'Presidência', 'Pós-vendas', 'Cliente/consulta', 'Consulta interna',
]
const GRUPOS_ACESSO = ['Administração', 'Catálogo', 'Propostas', 'Assinaturas', 'Contratos', 'Integrações', 'Painéis']
const STATUS_USUARIO = ['Ativo', 'Inativo', 'Bloqueado', 'Aguardando primeiro acesso', 'Aguardando validação']

const TIPO_ESTRUTURA = ['Presidência', 'Diretoria', 'Gabinete', 'Unidade', 'Gerência', 'Coordenação', 'Núcleo', 'Outra']
const STATUS_ESTRUTURA = ['Ativa', 'Inativa', 'Substituída', 'Em revisão']

const TIPO_CARGO = [
  'Presidente', 'Diretor', 'Gerente', 'Analista', 'Assinante',
  'Responsável técnico', 'Pós-vendas', 'Cliente', 'Parceiro', 'Outro',
]
const STATUS_CARGO = ['Ativo', 'Inativo', 'Em revisão']

const SOLUCOES = [
  'MTI CLOUD', 'MTI WORKSPACE', 'MTI SIMPLIFICA', 'MTI DATA SECURITY',
  'MTI IA', 'MTI LAB', 'MTI QI', 'MTI CONNECT', 'MTI SAAS', 'MTI NOW',
  'MTI HOST', 'MTI VALIDA', 'MTI EDGE GUARD', 'MTI LOG SISTEMAS',
  'MTI CAV', 'MTI DEVSEC.Gov', 'MTI Autonomy', 'Moeda de Serviços', 'Outra',
]

const METRICAS_PRODUTO = ['USN', 'HST', 'UST', 'Unidade', 'Usuário', 'Mês', 'Projeto', 'Execução', 'Licença', 'Outro']
const METRICAS_LICENCA = ['USN', 'Usuário', 'Licença', 'Unidade', 'Mês', 'Projeto', 'Outro']
const METRICAS_SERVICO = ['HST', 'UST', 'USN', 'Unidade', 'Execução', 'Projeto', 'Mês', 'Usuário', 'Outro']

const COBRANCA = ['Mensal', 'Anual', 'Sob Demanda', 'Por execução', 'Única', 'Pro-rata', 'Outro']
const RECORRENCIA_SERV = ['Mensal', 'Anual', 'Sob demanda', 'Por execução', 'Por Homologação', 'Única']
const STATUS_PARCERIA = ['Ativa', 'Homologada', 'Paralisada', 'Suspensa', 'Em homologação', 'Em reajuste', 'Em validação']
const STATUS_PRODUTO = ['Ativo', 'Inativo', 'Suspenso', 'Paralisado', 'Em validação', 'Em homologação']

const TIPO_CONTRATACAO = ['Objeto específico', 'Catálogo do produto', 'Catálogo geral/ecossistema']
const INDICE_REAJUSTE = ['IPCA', 'ICTI', 'Outro']
const MODELO_VENDA = ['Por Licença', 'Por Usuário', 'Por Pacote', 'Por Consumo', 'Por Catálogo', 'Outro']

const COMPLEXIDADE_SERVICO = ['Sem complexidade', 'Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta', 'Especial']
const CATEGORIA_SERVICO = [
  'Serviço técnico', 'Implantação', 'Sustentação', 'Consultoria',
  'Treinamento', 'Cloud', 'SaaS', 'Outro',
]

const STATUS_DEMANDA = [
  'Recebida', 'Em análise DIRC', 'Aguardando complemento', 'Em composição de proposta',
  'Enviada ao parceiro', 'Aguardando parceiro', 'Convertida em proposta', 'Rejeitada', 'Cancelada',
]
const ORIGEM_DEMANDA = ['E-mail', 'WhatsApp', 'Marketplace/site comercial', 'Reunião', 'Parceiro', 'Portal futuro', 'Outro']
const TIPO_DEMANDA = [
  'Nova contratação', 'Renovação', 'Ampliação', 'Substituição',
  'Proposta complementar', 'Estudo de viabilidade', 'Outro',
]
const RESULTADO_DIRC = ['Prosseguir', 'Solicitar complemento', 'Enviar ao parceiro', 'Rejeitar', 'Cancelar']
const PRIORIDADE = ['Normal', 'Alta', 'Urgente']

const STATUS_PROPOSTA = [
  'Em composição', 'Em análise DIRC', 'Aguardando parceiro', 'Em revisão',
  'Documento gerado', 'Em assinatura', 'Aprovada', 'Enviada ao cliente',
  'Aguardando retorno do cliente', 'Contrato recebido', 'Contrato cadastrado',
  'Em Contratação', 'Suspensa', 'Cancelada',
]
const STATUS_ITEM_PROPOSTA = ['Em composição', 'Aceito', 'Ajustado', 'Substituído', 'Removido', 'Cancelado']
const ORIGEM_ITEM_PROPOSTA = ['Produto vigente', 'Licença', 'Serviço', 'Manual']
const RECORRENCIA_ITEM = ['Mensal', 'Anual', 'Sob demanda', 'Por execução', 'Única', 'Pro-rata']

const TIPO_DOCUMENTO = ['Proposta', 'Contrato', 'Handover', 'Termo', 'Anexo', 'Outro']
const STATUS_DOC_TEMPLATE = ['Rascunho', 'Publicado', 'Arquivado', 'Substituído']
const STATUS_DOC_GERADO = [
  'Gerado', 'Em revisão', 'Enviado para assinatura', 'Assinado', 'Enviado ao cliente', 'Cancelado',
]

const ORIGEM_PARAMETRO = ['Proposta', 'Cliente', 'Parceiro', 'Item da proposta', 'Contrato', 'Manual', 'Sistema']

const DOMINIO_WORKFLOW = ['Proposta', 'Contrato', 'Documento', 'Assinatura', 'Handover', 'Outro']
const AREA_WORKFLOW = ['DIRC', 'DTIC', 'Presidência', 'Parceiro', 'Pós-vendas', 'Sistema', 'Gestão Administrativa']
const STATUS_WORKFLOW = ['Rascunho', 'Ativo', 'Suspenso', 'Substituído', 'Arquivado']
const TIPO_ETAPA_WF = [
  'Entrada', 'Edição', 'Revisão', 'Assinatura', 'Notificação',
  'Contrato', 'Integração', 'Externa', 'Encerramento',
]
const AREA_ETAPA = ['DIRC', 'Parceiro', 'DTIC', 'Presidência', 'Cliente', 'Pós-vendas', 'Sistema', 'Gestão Administrativa']

const GRUPO_ASSINATURA = ['DIRC', 'Parceiro', 'DTIC', 'Presidência', 'Complementar']
const AREA_ASSINATURA = ['DIRC', 'Parceiro', 'DTIC', 'Presidência', 'Gestão Administrativa']
const STATUS_ASSINATURA = [
  'Pendente', 'Enviado', 'Assinado', 'Ajuste solicitado', 'Reprovado', 'Cancelado', 'Dispensado',
]
const RESULTADO_ASSINATURA = ['Assinado', 'Ajuste', 'Reprovado', 'Dispensado']

const CANAL_ENVIO = ['E-mail', 'Portal futuro', 'Link', 'Outro']
const STATUS_ENVIO = ['Enviado', 'Erro', 'Reenviado', 'Cancelado']
const STATUS_EXTERNO = [
  'Aguardando cliente', 'Em contratação externa', 'Documentação solicitada',
  'Documentação enviada', 'Contrato assinado recebido', 'Recusada', 'Sem retorno',
]

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

// Paleta de cores dos presets
const COLORS = ['#0c1ba8', '#7c3aed', '#0d9488', '#0369a1', '#059669', '#1e40af', '#b45309', '#dc2626', '#6d28d9', '#0891b2']
const pick = (i) => COLORS[i % COLORS.length]

// IDs canônicos
const F_ORG = 'form-patlas-organizacao'
const F_PES = 'form-patlas-pessoa'
const F_USR = 'form-patlas-usuario'
const F_EST = 'form-patlas-estrutura-mti'
const F_CGF = 'form-patlas-cargo-funcao'
const F_PV = 'form-patlas-produto-vigente'
const F_LIC = 'form-patlas-catalogo-licenca'
const F_SRV = 'form-patlas-catalogo-servico'
const F_UNI = 'form-patlas-catalogo-universal'
const F_CPP = 'form-patlas-catalogo-parceria'
const F_DEM = 'form-patlas-demanda'
const F_PRP = 'form-patlas-proposta'
const F_PRI = 'form-patlas-proposta-item'
const F_DTP = 'form-patlas-documento-template'
const F_DPM = 'form-patlas-documento-parametro'
const F_DGD = 'form-patlas-documento-gerado'
const F_WFM = 'form-patlas-workflow-modelo'
const F_WFE = 'form-patlas-workflow-etapa'
const F_TRA = 'form-patlas-tramite-assinatura'
const F_ENV = 'form-patlas-envio-proposta'
const F_EXT = 'form-patlas-contratacao-externa'
const F_CTR = 'form-patlas-contrato'
const F_CTI = 'form-patlas-contrato-item'
const F_REC = 'form-patlas-recorrencia-cobranca'
const F_PUB = 'form-patlas-publicacao-contrato'
const F_IGE = 'form-patlas-integracao-evento'
const F_HOV = 'form-patlas-handover'
const F_KOF = 'form-patlas-kickoff'
const F_NTF = 'form-patlas-notificacao'
const F_HST = 'form-patlas-historico-processo'
const F_VOP = 'form-patlas-visao-operacional-fase1'

// ============================================================================
// HELPERS
// ============================================================================

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

const sec = (id, title, icon) => ({ id, title, ...(icon ? { icon } : {}) })
const m = (id, name, icon, kind = 'destaque') => ({ id, name, icon, kind })
const p = (id, name, color, fieldValues, embeddedRowsByFieldId) => ({
  id, name, iconColor: color,
  ...(fieldValues ? { fieldValues } : {}),
  ...(embeddedRowsByFieldId ? { embeddedRowsByFieldId } : {}),
})
const cls = (id, name, linkedFormId, presetIds) => ({
  id, name,
  ...(linkedFormId ? { linkedFormId } : {}),
  ...(presetIds && presetIds.length > 0 ? { linkedFormExamplePresetIds: presetIds } : {}),
})

// ============================================================================
// FORM 1 — ORGANIZAÇÃO
// ============================================================================

const orgSec = [
  sec('sec-patlas-org-dados', 'Dados principais', 'business'),
  sec('sec-patlas-org-contatos', 'Contatos', 'contacts'),
  sec('sec-patlas-org-endereco', 'Endereço', 'location_on'),
  sec('sec-patlas-org-vinculos', 'Vínculos', 'hub'),
  sec('sec-patlas-org-status', 'Status e observações', 'flag'),
]

const formOrganizacao = {
  id: F_ORG, name: 'Organização', sectionLayout: 'tabs', sections: orgSec, defaultCanvasMode: 'read',
  metadata: 'Cadastra MTI, unidades MTI, clientes, órgãos, parceiros e demais organizações envolvidas.',
  fields: [
    f('patlas-org-nome', 'Nome da organização', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-org-dados' }),
    f('patlas-org-tipo', 'Tipo da organização', 'textOptions', { required: true, relevance: 'highlight', options: TIPOS_ORGANIZACAO, sectionId: 'sec-patlas-org-dados' }),
    f('patlas-org-cnpj', 'CNPJ', 'text', { relevance: 'highlight', sectionId: 'sec-patlas-org-dados', spec: 'Obrigatório para pessoa jurídica.' }),
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
      'patlas-org-tipo': 'MTI', 'patlas-org-cnpj': '03.507.415/0001-44',
      'patlas-org-sigla': 'MTI', 'patlas-org-uf': 'MT', 'patlas-org-municipio': 'Cuiabá',
      'patlas-org-status': 'Ativa',
    }),
    p('patlas-org-p-dirc', 'DIRC — Unidade MTI', pick(1), {
      'patlas-org-nome': 'DIRC — Diretoria de Relacionamento com Cliente',
      'patlas-org-tipo': 'Unidade MTI', 'patlas-org-sigla': 'DIRC', 'patlas-org-status': 'Ativa',
    }),
    p('patlas-org-p-dtic', 'DTIC — Unidade MTI', pick(2), {
      'patlas-org-nome': 'DTIC — Diretoria de Tecnologia da Informação e Comunicação',
      'patlas-org-tipo': 'Unidade MTI', 'patlas-org-sigla': 'DTIC', 'patlas-org-status': 'Ativa',
    }),
    p('patlas-org-p-parceiro', 'Parceiro ativo — Atos Brasil', pick(3), {
      'patlas-org-nome': 'Atos Brasil Tecnologia LTDA.',
      'patlas-org-tipo': 'Parceiro', 'patlas-org-cnpj': '42.000.111/0001-22',
      'patlas-org-fantasia': 'Atos Brasil', 'patlas-org-sigla': 'ATOS',
      'patlas-org-uf': 'SP', 'patlas-org-municipio': 'São Paulo', 'patlas-org-status': 'Ativa',
    }),
    p('patlas-org-p-zadara', 'Parceiro Zadara', pick(4), {
      'patlas-org-nome': 'Zadara Storage Inc.',
      'patlas-org-tipo': 'Parceiro', 'patlas-org-sigla': 'ZADARA', 'patlas-org-status': 'Ativa',
    }),
    p('patlas-org-p-sema', 'Cliente/Órgão SEMA', pick(5), {
      'patlas-org-nome': 'Secretaria de Estado de Meio Ambiente',
      'patlas-org-tipo': 'Cliente/Órgão', 'patlas-org-sigla': 'SEMA',
      'patlas-org-uf': 'MT', 'patlas-org-municipio': 'Cuiabá', 'patlas-org-status': 'Ativa',
    }),
    p('patlas-org-p-seplag', 'Cliente/Órgão SEPLAG', pick(6), {
      'patlas-org-nome': 'Secretaria de Estado de Planejamento e Gestão',
      'patlas-org-tipo': 'Cliente/Órgão', 'patlas-org-sigla': 'SEPLAG',
      'patlas-org-uf': 'MT', 'patlas-org-municipio': 'Cuiabá', 'patlas-org-status': 'Ativa',
    }),
    p('patlas-org-p-setasc', 'Cliente/Órgão SETASC', pick(7), {
      'patlas-org-nome': 'Secretaria de Estado de Assistência Social e Cidadania',
      'patlas-org-tipo': 'Cliente/Órgão', 'patlas-org-sigla': 'SETASC',
      'patlas-org-uf': 'MT', 'patlas-org-municipio': 'Cuiabá', 'patlas-org-status': 'Em validação',
    }),
  ],
  activeExamplePresetId: 'patlas-org-p-sema',
}

// ============================================================================
// FORM 2 — PESSOA  (com Data de nascimento conforme V2)
// ============================================================================

const pesSec = [
  sec('sec-patlas-pes-dados', 'Dados pessoais', 'person'),
  sec('sec-patlas-pes-contato', 'Contato', 'mail'),
  sec('sec-patlas-pes-org', 'Organização e função', 'business'),
  sec('sec-patlas-pes-assinatura', 'Assinatura e notificações', 'edit_note'),
  sec('sec-patlas-pes-obs', 'Observações', 'sticky_note_2'),
]

const formPessoa = {
  id: F_PES, name: 'Pessoa', sectionLayout: 'tabs', sections: pesSec, defaultCanvasMode: 'read',
  metadata: 'Pessoas vinculadas a MTI, parceiros e clientes. Pode existir sem usuário.',
  fields: [
    f('patlas-pes-nome', 'Nome completo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-pes-dados' }),
    f('patlas-pes-cpf', 'CPF', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-pes-dados' }),
    f('patlas-pes-rg', 'RG', 'text', { sectionId: 'sec-patlas-pes-dados' }),
    f('patlas-pes-matricula', 'Matrícula', 'text', { relevance: 'highlight', sectionId: 'sec-patlas-pes-dados', spec: 'Obrigatória para vínculo MTI.' }),
    f('patlas-pes-nasc', 'Data de nascimento', 'date', { sectionId: 'sec-patlas-pes-dados' }),
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
    p('patlas-pes-p-luis', 'Luis Santos — Focal de vendas DIRC', pick(0), {
      'patlas-pes-nome': 'Luis Santos', 'patlas-pes-cpf': '012.345.678-90',
      'patlas-pes-matricula': 'MTI-00214', 'patlas-pes-email': 'luis.santos@mti.mt.gov.br',
      'patlas-pes-vinculo': 'MTI interno', 'patlas-pes-papel': 'DIRC',
      'patlas-pes-notif': true, 'patlas-pes-status': 'Ativo',
    }),
    p('patlas-pes-p-icaro', 'Icaro — Focal MTI Cloud', pick(1), {
      'patlas-pes-nome': 'Icaro Alves', 'patlas-pes-cpf': '111.222.333-44',
      'patlas-pes-matricula': 'MTI-00188', 'patlas-pes-email': 'icaro.alves@mti.mt.gov.br',
      'patlas-pes-vinculo': 'MTI interno', 'patlas-pes-papel': 'Técnico',
      'patlas-pes-status': 'Ativo',
    }),
    p('patlas-pes-p-presidencia', 'Presidente MTI', pick(2), {
      'patlas-pes-nome': 'Carlos Eduardo Santos', 'patlas-pes-cpf': '987.654.321-00',
      'patlas-pes-matricula': 'MTI-00001', 'patlas-pes-email': 'presidencia@mti.mt.gov.br',
      'patlas-pes-vinculo': 'MTI interno', 'patlas-pes-assina': true,
      'patlas-pes-papel': 'Presidência', 'patlas-pes-notif': true, 'patlas-pes-status': 'Ativo',
    }),
    p('patlas-pes-p-dtic', 'Diretor DTIC', pick(3), {
      'patlas-pes-nome': 'Patrícia Andrade', 'patlas-pes-cpf': '222.333.444-55',
      'patlas-pes-matricula': 'MTI-00050', 'patlas-pes-email': 'dtic@mti.mt.gov.br',
      'patlas-pes-vinculo': 'MTI interno', 'patlas-pes-assina': true,
      'patlas-pes-papel': 'DTIC', 'patlas-pes-status': 'Ativo',
    }),
    p('patlas-pes-p-parceiro', 'Contato parceiro Atos', pick(4), {
      'patlas-pes-nome': 'Felipe Garcia', 'patlas-pes-cpf': '333.444.555-66',
      'patlas-pes-email': 'felipe.garcia@atosbrasil.com.br',
      'patlas-pes-vinculo': 'Parceiro', 'patlas-pes-assina': true,
      'patlas-pes-papel': 'Parceiro', 'patlas-pes-status': 'Ativo',
    }),
    p('patlas-pes-p-cliente-sema', 'Solicitante SEMA', pick(5), {
      'patlas-pes-nome': 'Juliana Pereira', 'patlas-pes-email': 'juliana.pereira@sema.mt.gov.br',
      'patlas-pes-vinculo': 'Cliente', 'patlas-pes-status': 'Aguardando validação',
    }),
  ],
  activeExamplePresetId: 'patlas-pes-p-luis',
}

// ============================================================================
// FORM 3 — USUÁRIO
// ============================================================================

const usrSec = [
  sec('sec-patlas-usr-acesso', 'Dados de acesso', 'login'),
  sec('sec-patlas-usr-perfil', 'Perfil e permissões', 'manage_accounts'),
  sec('sec-patlas-usr-org', 'Organização', 'business'),
  sec('sec-patlas-usr-seg', 'Segurança', 'security'),
  sec('sec-patlas-usr-status', 'Status', 'flag'),
]

const formUsuario = {
  id: F_USR, name: 'Usuário', sectionLayout: 'tabs', sections: usrSec, defaultCanvasMode: 'read',
  metadata: 'Acesso, autenticação, perfis e credenciais. Cliente só recebe credenciais após contrato recebido.',
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
      'patlas-usr-nome': 'Luis Santos', 'patlas-usr-login': 'luis.santos',
      'patlas-usr-email': 'luis.santos@mti.mt.gov.br', 'patlas-usr-auth': 'MT Login',
      'patlas-usr-perfil': 'Administrador Atlas',
      'patlas-usr-grupos': ['Administração', 'Catálogo', 'Propostas', 'Painéis'],
      'patlas-usr-ativo': true, 'patlas-usr-status': 'Ativo',
    }),
    p('patlas-usr-p-parceiro', 'Usuário parceiro Atos', pick(2), {
      'patlas-usr-nome': 'Felipe Garcia', 'patlas-usr-login': 'felipe.atos',
      'patlas-usr-email': 'felipe.garcia@atosbrasil.com.br', 'patlas-usr-auth': 'Gov.br',
      'patlas-usr-perfil': 'Parceiro',
      'patlas-usr-grupos': ['Propostas', 'Assinaturas'],
      'patlas-usr-ativo': true, 'patlas-usr-status': 'Ativo',
    }),
    p('patlas-usr-p-cliente-sema', 'Cliente SEMA — aguardando primeiro acesso', pick(5), {
      'patlas-usr-nome': 'Juliana Pereira', 'patlas-usr-login': 'juliana.sema',
      'patlas-usr-email': 'juliana.pereira@sema.mt.gov.br', 'patlas-usr-auth': 'Gov.br',
      'patlas-usr-perfil': 'Cliente/consulta', 'patlas-usr-ativo': false,
      'patlas-usr-status': 'Aguardando primeiro acesso',
    }),
  ],
  activeExamplePresetId: 'patlas-usr-p-admin',
}

// ============================================================================
// FORM 4 — ESTRUTURA MTI  (com tabs + organograma completo)
// ============================================================================

const estSec = [
  sec('sec-patlas-est-ident', 'Identificação', 'business'),
  sec('sec-patlas-est-hier', 'Hierarquia', 'account_tree'),
  sec('sec-patlas-est-resp', 'Responsáveis', 'badge'),
  sec('sec-patlas-est-vig', 'Vigência', 'event'),
  sec('sec-patlas-est-obs', 'Observações', 'sticky_note_2'),
]

// Organograma MTI completo (do requisito, seção 7.4)
const ORGANOGRAMA = [
  // Gabinete do Diretor Presidente
  { id: 'patlas-est-p-gab-pres', nome: 'Gabinete do Diretor Presidente', sigla: 'GAB-PRES', tipo: 'Gabinete' },
  { id: 'patlas-est-p-uaj', nome: 'Unidade de Assessoria Jurídica', sigla: 'UAJ', tipo: 'Unidade', parent: 'patlas-est-p-gab-pres' },
  { id: 'patlas-est-p-uas', nome: 'Unidade de Assessoria', sigla: 'UAS', tipo: 'Unidade', parent: 'patlas-est-p-gab-pres' },
  { id: 'patlas-est-p-ugp', nome: 'Unidade de Gestão de Projetos', sigla: 'UGP', tipo: 'Unidade', parent: 'patlas-est-p-gab-pres' },
  { id: 'patlas-est-p-ugcrs', nome: 'Unidade de Gestão de Conformidade, Riscos e Segurança da Informação', sigla: 'UGCRS', tipo: 'Unidade', parent: 'patlas-est-p-gab-pres' },
  { id: 'patlas-est-p-usci', nome: 'Unidade Setorial de Controle Interno', sigla: 'USCI', tipo: 'Unidade', parent: 'patlas-est-p-gab-pres' },
  { id: 'patlas-est-p-ugsg', nome: 'Unidade de Gestão de Suporte à Governança', sigla: 'UGSG', tipo: 'Unidade', parent: 'patlas-est-p-gab-pres' },
  { id: 'patlas-est-p-gepp', nome: 'Gerência de Escritório de Processos e Planejamento', sigla: 'GEPP', tipo: 'Gerência', parent: 'patlas-est-p-gab-pres' },
  { id: 'patlas-est-p-gge', nome: 'Gerência de Gestão Estratégica', sigla: 'GGE', tipo: 'Gerência', parent: 'patlas-est-p-gab-pres' },
  // Diretoria de TIC
  { id: 'patlas-est-p-gab-dtic', nome: 'Gabinete da Diretoria de TIC', sigla: 'DTIC', tipo: 'Diretoria' },
  { id: 'patlas-est-p-ugsdg', nome: 'Unidade de Gestão de Soluções Digitais de Governo', sigla: 'UGSDG', tipo: 'Unidade', parent: 'patlas-est-p-gab-dtic' },
  { id: 'patlas-est-p-uggd', nome: 'Unidade de Gestão de Governo Digital', sigla: 'UGGD', tipo: 'Unidade', parent: 'patlas-est-p-gab-dtic' },
  { id: 'patlas-est-p-ugat', nome: 'Unidade de Gestão de Arquitetura Tecnológica', sigla: 'UGAT', tipo: 'Unidade', parent: 'patlas-est-p-gab-dtic' },
  { id: 'patlas-est-p-ugstic', nome: 'Unidade de Gestão de Serviços de TIC', sigla: 'UGSTIC', tipo: 'Unidade', parent: 'patlas-est-p-gab-dtic' },
  { id: 'patlas-est-p-uggdc', nome: 'Unidade de Gestão de Governança de Dados e Defesa Cibernética', sigla: 'UGGDC', tipo: 'Unidade', parent: 'patlas-est-p-gab-dtic' },
  { id: 'patlas-est-p-ugitic', nome: 'Unidade de Gestão de Infraestrutura de TIC', sigla: 'UGITI', tipo: 'Unidade', parent: 'patlas-est-p-gab-dtic' },
  // Diretoria de Relacionamento com Cliente (DIRC)
  { id: 'patlas-est-p-gab-dirc', nome: 'Gabinete da Diretoria de Relacionamento com Cliente', sigla: 'DIRC', tipo: 'Diretoria' },
  { id: 'patlas-est-p-ugv', nome: 'Unidade de Gestão de Vendas', sigla: 'UGV', tipo: 'Unidade', parent: 'patlas-est-p-gab-dirc' },
  { id: 'patlas-est-p-ugpv', nome: 'Unidade de Gestão de Pós-Venda', sigla: 'UGPV', tipo: 'Unidade', parent: 'patlas-est-p-gab-dirc' },
  { id: 'patlas-est-p-ugpnn', nome: 'Unidade de Gestão de Parceria e Novos Negócios', sigla: 'UGPNN', tipo: 'Unidade', parent: 'patlas-est-p-gab-dirc' },
  { id: 'patlas-est-p-gpi', nome: 'Gerência de Parceria e Inovação', sigla: 'GPI', tipo: 'Gerência', parent: 'patlas-est-p-gab-dirc' },
  // Diretoria de Gestão Administrativa (DAFI)
  { id: 'patlas-est-p-gab-dafi', nome: 'Gabinete da Diretoria de Gestão Administrativa', sigla: 'DAFI', tipo: 'Diretoria' },
  { id: 'patlas-est-p-uga', nome: 'Unidade de Gestão Administrativa', sigla: 'UGA', tipo: 'Unidade', parent: 'patlas-est-p-gab-dafi' },
  { id: 'patlas-est-p-ugoff', nome: 'Unidade de Gestão Orçamentária, Financeira e Faturamento', sigla: 'UGOFF', tipo: 'Unidade', parent: 'patlas-est-p-gab-dafi' },
  { id: 'patlas-est-p-ugcf', nome: 'Unidade de Gestão Contábil e Fiscal', sigla: 'UGCF', tipo: 'Unidade', parent: 'patlas-est-p-gab-dafi' },
  { id: 'patlas-est-p-ugpe', nome: 'Unidade de Gestão de Pessoas', sigla: 'UGPE', tipo: 'Unidade', parent: 'patlas-est-p-gab-dafi' },
  { id: 'patlas-est-p-ugac', nome: 'Unidade de Gestão de Aquisições e Contratos', sigla: 'UGAC', tipo: 'Unidade', parent: 'patlas-est-p-gab-dafi' },
  { id: 'patlas-est-p-gc', nome: 'Gerência de Contratos', sigla: 'GC', tipo: 'Gerência', parent: 'patlas-est-p-gab-dafi' },
  { id: 'patlas-est-p-gaq', nome: 'Gerência de Aquisições', sigla: 'GAQ', tipo: 'Gerência', parent: 'patlas-est-p-gab-dafi' },
  { id: 'patlas-est-p-gfc', nome: 'Gerência de Faturamento e Cobrança', sigla: 'GFC', tipo: 'Gerência', parent: 'patlas-est-p-gab-dafi' },
]

const estruturaPresets = ORGANOGRAMA.map((row, idx) => p(row.id, `${row.sigla || row.nome.slice(0, 18)} — ${row.tipo}`, pick(idx), {
  'patlas-est-nome': row.nome,
  'patlas-est-sigla': row.sigla || '',
  'patlas-est-tipo': row.tipo,
  'patlas-est-status': 'Ativa',
}))

const formEstrutura = {
  id: F_EST, name: 'Estrutura MTI', sectionLayout: 'tabs', sections: estSec, defaultCanvasMode: 'read',
  metadata: 'Presidência, diretorias, gabinetes, unidades e gerências da MTI. Assinaturas são por cargo/função sobre a estrutura, não por pessoa fixa.',
  fields: [
    f('patlas-est-nome', 'Nome da estrutura', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-est-ident' }),
    f('patlas-est-sigla', 'Sigla', 'text', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-est-ident' }),
    f('patlas-est-tipo', 'Tipo da estrutura', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_ESTRUTURA, sectionId: 'sec-patlas-est-ident' }),
    f('patlas-est-superior', 'Estrutura superior', 'reference', { linkedFormId: F_EST, sectionId: 'sec-patlas-est-hier' }),
    f('patlas-est-titular', 'Responsável titular', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-est-resp' }),
    f('patlas-est-substituto', 'Responsável substituto', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-est-resp' }),
    f('patlas-est-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_ESTRUTURA, sectionId: 'sec-patlas-est-vig' }),
    f('patlas-est-inicio', 'Data início vigência', 'date', { sectionId: 'sec-patlas-est-vig' }),
    f('patlas-est-fim', 'Data fim vigência', 'date', { sectionId: 'sec-patlas-est-vig' }),
    f('patlas-est-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-est-obs' }),
  ],
  methods: [
    m('patlas-est-meth-revisar', 'Revisar estrutura', 'edit_note', 'menu'),
    m('patlas-est-meth-substituir', 'Registrar substituição', 'swap_horiz', 'menu'),
  ],
  exampleValuePresets: estruturaPresets,
  activeExamplePresetId: 'patlas-est-p-gab-dirc',
}

// ============================================================================
// FORM 5 — CARGO/FUNÇÃO
// ============================================================================

const formCargo = {
  id: F_CGF, name: 'Cargo / Função', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Função que recebe permissões e assinaturas. Workflow aponta para Cargo/Função — pessoa executante é o ocupante atual.',
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
  methods: [m('patlas-cgf-meth-substituir', 'Substituir ocupante', 'swap_horiz', 'destaque')],
  exampleValuePresets: [
    p('patlas-cgf-p-dirc-analista', 'Analista DIRC', pick(0), {
      'patlas-cgf-nome': 'Analista DIRC', 'patlas-cgf-tipo': 'Analista',
      'patlas-cgf-pode-demanda': true, 'patlas-cgf-pode-editar': true,
      'patlas-cgf-status': 'Ativo',
    }),
    p('patlas-cgf-p-dirc-diretor', 'Diretor DIRC', pick(1), {
      'patlas-cgf-nome': 'Diretor DIRC', 'patlas-cgf-tipo': 'Diretor',
      'patlas-cgf-pode-aprovar': true, 'patlas-cgf-pode-assinar': true,
      'patlas-cgf-status': 'Ativo',
    }),
    p('patlas-cgf-p-dtic-assinante', 'Assinante DTIC', pick(2), {
      'patlas-cgf-nome': 'Diretor DTIC', 'patlas-cgf-tipo': 'Diretor',
      'patlas-cgf-pode-assinar': true, 'patlas-cgf-status': 'Ativo',
    }),
    p('patlas-cgf-p-presidente', 'Presidente da MTI', pick(3), {
      'patlas-cgf-nome': 'Presidente da MTI', 'patlas-cgf-tipo': 'Presidente',
      'patlas-cgf-pode-aprovar': true, 'patlas-cgf-pode-assinar': true,
      'patlas-cgf-pode-contrato': true, 'patlas-cgf-status': 'Ativo',
    }),
    p('patlas-cgf-p-dafi-complementar', 'Diretor DAFI (assinatura complementar)', pick(4), {
      'patlas-cgf-nome': 'Diretor de Gestão Administrativa (DAFI)', 'patlas-cgf-tipo': 'Diretor',
      'patlas-cgf-pode-assinar': true, 'patlas-cgf-pode-contrato': true,
      'patlas-cgf-status': 'Ativo',
    }),
    p('patlas-cgf-p-parceiro', 'Representante Parceiro', pick(5), {
      'patlas-cgf-nome': 'Representante Parceiro', 'patlas-cgf-tipo': 'Parceiro',
      'patlas-cgf-pode-assinar': true, 'patlas-cgf-status': 'Ativo',
    }),
    p('patlas-cgf-p-pos', 'Pós-vendas', pick(6), {
      'patlas-cgf-nome': 'Analista Pós-vendas', 'patlas-cgf-tipo': 'Pós-vendas',
      'patlas-cgf-status': 'Ativo',
    }),
    p('patlas-cgf-p-cat', 'Administrador de Catálogo', pick(7), {
      'patlas-cgf-nome': 'Administrador de Catálogo', 'patlas-cgf-tipo': 'Analista',
      'patlas-cgf-pode-catalogo': true, 'patlas-cgf-status': 'Ativo',
    }),
  ],
  activeExamplePresetId: 'patlas-cgf-p-dirc-analista',
}

// ============================================================================
// FORM 6 — PRODUTO VIGENTE
// ============================================================================

const pvSec = [
  sec('sec-patlas-pv-ident', 'Identificação do produto', 'inventory_2'),
  sec('sec-patlas-pv-cobr', 'Cobrança e valores', 'paid'),
  sec('sec-patlas-pv-resp', 'Responsáveis e atendimento', 'support_agent'),
  sec('sec-patlas-pv-cod', 'Códigos e integrações', 'qr_code_2'),
  sec('sec-patlas-pv-cat', 'Catálogo e parceria', 'handshake'),
  sec('sec-patlas-pv-status', 'Status e observações', 'flag'),
]

const formProdutoVigente = {
  id: F_PV, name: 'Produto Vigente', sectionLayout: 'tabs', sections: pvSec, defaultCanvasMode: 'read',
  metadata: 'Produto comercial vigente. Origem: planilha "Produtos Vigentes (TODOS)". Só Ativo pode ser selecionado em nova proposta.',
  fields: [
    f('patlas-pv-descricao', 'Descrição do produto', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true, sectionId: 'sec-patlas-pv-ident' }),
    f('patlas-pv-solucao', 'Solução', 'textOptions', { required: true, relevance: 'highlight', options: SOLUCOES, sectionId: 'sec-patlas-pv-ident' }),
    f('patlas-pv-metrica', 'Métrica', 'textOptions', { size: 'small', required: true, relevance: 'highlight', options: METRICAS_PRODUTO, sectionId: 'sec-patlas-pv-cobr' }),
    f('patlas-pv-cobranca', 'Cobrança', 'textOptions', { required: true, relevance: 'highlight', options: COBRANCA, sectionId: 'sec-patlas-pv-cobr' }),
    f('patlas-pv-valor', 'Valor unitário', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-pv-cobr' }),
    f('patlas-pv-fator', 'Fator de conversão (FC)', 'decimal', { size: 'small', sectionId: 'sec-patlas-pv-cobr' }),
    f('patlas-pv-focal-vendas', 'Focal de vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-pv-resp' }),
    f('patlas-pv-focal-pos', 'Focal de pós-vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-pv-resp' }),
    f('patlas-pv-unidade', 'Unidade DTIC', 'reference', { required: true, linkedFormId: F_EST, sectionId: 'sec-patlas-pv-resp' }),
    f('patlas-pv-parceiro', 'Parceiro', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlas-pv-cat' }),
    f('patlas-pv-link-cat', 'Link catálogo de parceria', 'text', { size: 'large', relevance: 'advanced', sectionId: 'sec-patlas-pv-cat' }),
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
    m('patlas-pv-meth-cat', 'Visualizar no catálogo', 'menu_book', 'menu'),
    m('patlas-pv-meth-bloquear', 'Bloquear comercialização', 'block', 'menu'),
    m('patlas-pv-meth-reativar', 'Reativar produto', 'restart_alt', 'menu'),
  ],
  exampleValuePresets: [
    // Preset 1 — direto da planilha
    p('patlas-pv-p-cloud-zadara', 'MTI CLOUD — Infraestrutura Híbrida (Zadara)', pick(0), {
      'patlas-pv-descricao': 'MTI CLOUD - DISPONIBILIZAÇÃO DE INFRAESTRUTURA EM NUVEM HÍBRIDA',
      'patlas-pv-solucao': 'MTI CLOUD',
      'patlas-pv-metrica': 'USN', 'patlas-pv-cobranca': 'Sob Demanda',
      'patlas-pv-valor': 1.0, 'patlas-pv-fator': 1,
      'patlas-pv-siag-item': '0005315', 'patlas-pv-protheus-item': '32000192',
      'patlas-pv-status': 'Ativo',
    }),
    // Preset 2 — direto da planilha
    p('patlas-pv-p-creditos', 'MTI Créditos de Serviço em TIC (Moeda)', pick(1), {
      'patlas-pv-descricao': 'MTI Créditos de Serviço em TIC - Serviços de TIC em Ecossistema Soberano',
      'patlas-pv-solucao': 'Moeda de Serviços',
      'patlas-pv-metrica': 'HST', 'patlas-pv-cobranca': 'Sob Demanda',
      'patlas-pv-valor': 282.58, 'patlas-pv-fator': 1,
      'patlas-pv-siag-item': '0018787', 'patlas-pv-protheus-item': '32000598',
      'patlas-pv-status': 'Ativo',
    }),
    p('patlas-pv-p-paralisado', 'MTI Connect — Pacote legado (paralisado)', pick(7), {
      'patlas-pv-descricao': 'MTI Connect — Pacote legado on-premise',
      'patlas-pv-solucao': 'MTI CONNECT',
      'patlas-pv-metrica': 'Unidade', 'patlas-pv-cobranca': 'Anual',
      'patlas-pv-valor': 4980, 'patlas-pv-status': 'Paralisado',
    }),
  ],
  activeExamplePresetId: 'patlas-pv-p-cloud-zadara',
}

// ============================================================================
// FORM 7 — CATÁLOGO DE LICENÇA
// ============================================================================

const licSec = [
  sec('sec-patlas-lic-dados', 'Dados principais', 'license'),
  sec('sec-patlas-lic-cobr', 'Cobrança e vigência', 'paid'),
  sec('sec-patlas-lic-val', 'Valores e distribuição', 'payments'),
  sec('sec-patlas-lic-cod', 'Códigos e formas de contratação', 'qr_code_2'),
  sec('sec-patlas-lic-ref', 'Referência histórica', 'history'),
  sec('sec-patlas-lic-obs', 'Observações', 'sticky_note_2'),
]

const formCatalogoLicenca = {
  id: F_LIC, name: 'Catálogo de Licença', sectionLayout: 'tabs', sections: licSec, defaultCanvasMode: 'read',
  metadata: 'Origem: planilha "CATÁLOGO DE LICENÇAS". Universal=Sim → pode compor catálogo maior; Individualizado=Sim → contratada como objeto específico.',
  fields: [
    f('patlas-lic-parceria', 'Parceria', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-lic-dados' }),
    f('patlas-lic-objeto', 'Objeto comercial', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-lic-dados' }),
    f('patlas-lic-produto', 'Produto catálogo comercial', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-lic-dados' }),
    f('patlas-lic-partnum', 'PART Number', 'text', { relevance: 'highlight', sectionId: 'sec-patlas-lic-dados' }),
    f('patlas-lic-grupo', 'Grupo', 'text', { sectionId: 'sec-patlas-lic-dados' }),
    f('patlas-lic-metrica', 'Métrica', 'textOptions', { size: 'small', required: true, relevance: 'highlight', options: METRICAS_LICENCA, sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-versao', 'Versão catálogo', 'text', { size: 'small', sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-status', 'Status parceria', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PARCERIA, sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-recor', 'Recorrência da cobrança', 'textOptions', { required: true, relevance: 'highlight', options: COBRANCA, sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-modelo', 'Modelo de venda', 'textOptions', { required: true, options: MODELO_VENDA, sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-vigencia', 'Vigência', 'text', { size: 'small', sectionId: 'sec-patlas-lic-cobr', spec: 'Ex.: 12 meses' }),
    f('patlas-lic-universal', 'Universal', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-individualizado', 'Individualizado', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-lic-cobr' }),
    f('patlas-lic-valor', 'Valor unitário', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-lic-val' }),
    f('patlas-lic-custo', 'Custo parceiro', 'decimal', { currency: true, sectionId: 'sec-patlas-lic-val' }),
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
    f('patlas-lic-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-lic-obs' }),
  ],
  methods: [
    m('patlas-lic-meth-selecionar', 'Selecionar licença para proposta', 'add_shopping_cart', 'destaque'),
    m('patlas-lic-meth-historico', 'Ver referência histórica', 'history', 'menu'),
    m('patlas-lic-meth-bloquear', 'Bloquear licença', 'block', 'menu'),
    m('patlas-lic-meth-reativar', 'Reativar licença', 'restart_alt', 'menu'),
  ],
  exampleValuePresets: [
    // Preset direto da planilha do requisito
    p('patlas-lic-p-workspace-5gb', 'MTI Workspace Frontline Starter Ecrypto 5GB (Paralisado)', pick(7), {
      'patlas-lic-objeto': 'MTI Workspace Frontline Starter Ecrypto - 5 GB',
      'patlas-lic-produto': 'MTI Workspace Frontline Starter Ecrypto - 5 GB',
      'patlas-lic-metrica': 'USN', 'patlas-lic-valor': 241.85,
      'patlas-lic-versao': '8.0', 'patlas-lic-grupo': 'Mínimo 300 Contas, 5 GB de Armazenamento',
      'patlas-lic-modelo': 'Por Licença', 'patlas-lic-custo': 204.96,
      'patlas-lic-markup': 1.18, 'patlas-lic-dist-parc': 0.84, 'patlas-lic-dist-mti': 0.16,
      'patlas-lic-vigencia': '12 Meses', 'patlas-lic-siag-item': '111063',
      'patlas-lic-protheus-item': '32000122',
      'patlas-lic-universal': true, 'patlas-lic-individualizado': false,
      'patlas-lic-status': 'Paralisada', 'patlas-lic-recor': 'Anual',
    }),
    p('patlas-lic-p-workspace-5tb', 'MTI Workspace Enterprise Standard 5TB (Ativa)', pick(0), {
      'patlas-lic-objeto': 'MTI Workspace Enterprise Standard Ecrypto - 5 TB',
      'patlas-lic-produto': 'MTI Workspace Enterprise Standard Ecrypto - 5 TB',
      'patlas-lic-metrica': 'USN', 'patlas-lic-valor': 1070.92,
      'patlas-lic-versao': '5.0', 'patlas-lic-grupo': 'Mínimo 300 Contas, 5 TB de Armazenamento',
      'patlas-lic-modelo': 'Por Licença', 'patlas-lic-custo': 907.56, 'patlas-lic-markup': 1.18,
      'patlas-lic-vigencia': '12 Meses', 'patlas-lic-siag-item': '111055',
      'patlas-lic-protheus-item': '32000089',
      'patlas-lic-universal': true, 'patlas-lic-individualizado': false,
      'patlas-lic-status': 'Ativa', 'patlas-lic-recor': 'Anual',
    }),
    p('patlas-lic-p-simplifica', 'MTI Simplifica — VLCS (Mensal)', pick(2), {
      'patlas-lic-objeto': 'MTI Simplifica — Solução Adicional (Justiça Digital)',
      'patlas-lic-produto': 'VLCS | Valor do Licenciamento Como Serviço (Mensal)',
      'patlas-lic-metrica': 'USN', 'patlas-lic-valor': 32112.2,
      'patlas-lic-versao': '1.5', 'patlas-lic-modelo': 'Por Catálogo',
      'patlas-lic-markup': 1.25,
      'patlas-lic-universal': false, 'patlas-lic-individualizado': true,
      'patlas-lic-status': 'Ativa', 'patlas-lic-recor': 'Mensal',
    }),
  ],
  activeExamplePresetId: 'patlas-lic-p-workspace-5gb',
}

// ============================================================================
// FORM 8 — CATÁLOGO DE SERVIÇO
// ============================================================================

const srvSec = [
  sec('sec-patlas-srv-ident', 'Identificação do serviço', 'support_agent'),
  sec('sec-patlas-srv-cobr', 'Cobrança e recorrência', 'paid'),
  sec('sec-patlas-srv-val', 'Valores e distribuição', 'payments'),
  sec('sec-patlas-srv-cod', 'Códigos e formas de contratação', 'qr_code_2'),
  sec('sec-patlas-srv-rea', 'Reajuste e homologação', 'history'),
  sec('sec-patlas-srv-obs', 'Observações', 'sticky_note_2'),
]

const formCatalogoServico = {
  id: F_SRV, name: 'Catálogo de Serviço', sectionLayout: 'tabs', sections: srvSec, defaultCanvasMode: 'read',
  metadata: 'Origem: planilha "CATÁLOGO DE SERVIÇOS". Column 26 renomeada para Observações/Controle interno.',
  fields: [
    f('patlas-srv-parceria', 'Parceria / Nome Comercial', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-srv-ident' }),
    f('patlas-srv-produto', 'Produto de Catálogo Comercial', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-srv-ident' }),
    f('patlas-srv-descricao', 'Descrição do serviço', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-srv-ident' }),
    f('patlas-srv-grupo', 'Grupo', 'text', { sectionId: 'sec-patlas-srv-ident' }),
    f('patlas-srv-categoria', 'Categoria do objeto comercial', 'text', { size: 'large', required: true, relevance: 'highlight', sectionId: 'sec-patlas-srv-ident' }),
    f('patlas-srv-metrica', 'Métrica', 'textOptions', { size: 'small', required: true, relevance: 'highlight', options: METRICAS_SERVICO, sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-complexidade', 'Complexidade', 'textOptions', { relevance: 'highlight', options: COMPLEXIDADE_SERVICO, sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-qtd-hst', 'Quantidade HST/UST por execução', 'decimal', { sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-versao', 'Versão catálogo', 'text', { size: 'small', sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-status', 'Status parceria', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PARCERIA, sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-tipo-cobr', 'Tipo cobrança', 'textOptions', { required: true, relevance: 'highlight', options: COBRANCA, sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-recor', 'Recorrência cobrança', 'textOptions', { options: RECORRENCIA_SERV, sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-universal', 'Universal', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-individualizado', 'Individualizado', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlas-srv-cobr' }),
    f('patlas-srv-valor', 'Valor de comercialização unitário', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-srv-val' }),
    f('patlas-srv-custo', 'Custo unitário parceiro', 'decimal', { currency: true, sectionId: 'sec-patlas-srv-val' }),
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
    f('patlas-srv-obs', 'Observações / Controle interno', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-srv-obs', spec: 'Originalmente "Column 26" na planilha — renomeada.' }),
  ],
  methods: [
    m('patlas-srv-meth-selecionar', 'Selecionar serviço para proposta', 'add_shopping_cart', 'destaque'),
    m('patlas-srv-meth-historico', 'Ver referência histórica', 'history', 'menu'),
    m('patlas-srv-meth-bloquear', 'Bloquear serviço', 'block', 'menu'),
    m('patlas-srv-meth-reativar', 'Reativar serviço', 'restart_alt', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-srv-p-simplifica-plano', 'MTI Simplifica — Elaborar Plano de Projeto (Presencial)', pick(0), {
      'patlas-srv-produto': 'Elaborar Plano de Projeto (Presencial)',
      'patlas-srv-complexidade': 'Média', 'patlas-srv-qtd-hst': 10,
      'patlas-srv-valor': 1610.20, 'patlas-srv-versao': '46143',
      'patlas-srv-grupo': 'MTI SIMPLIFICA - Serviços para Ambientação',
      'patlas-srv-recor': 'Por Homologação',
      'patlas-srv-categoria': 'MTI Simplifica - Serviços de Solução SaaS de Simplificação e Desburocratização de Processos',
      'patlas-srv-metrica': 'UST', 'patlas-srv-markup': 1.25,
      'patlas-srv-universal': false, 'patlas-srv-individualizado': true,
      'patlas-srv-status': 'Ativa', 'patlas-srv-tipo-cobr': 'Sob Demanda',
    }),
    p('patlas-srv-p-cloud-impl', 'Implantação assistida — MTI Cloud', pick(1), {
      'patlas-srv-produto': 'Implantação assistida — MTI Cloud',
      'patlas-srv-categoria': 'MTI Cloud - Serviços técnicos',
      'patlas-srv-descricao': 'Pacote de implantação assistida em nuvem (até 5 instâncias).',
      'patlas-srv-metrica': 'UST', 'patlas-srv-complexidade': 'Média',
      'patlas-srv-qtd-hst': 120, 'patlas-srv-versao': '2.1',
      'patlas-srv-status': 'Ativa', 'patlas-srv-tipo-cobr': 'Por execução',
      'patlas-srv-recor': 'Por execução',
      'patlas-srv-universal': true, 'patlas-srv-individualizado': true,
      'patlas-srv-valor': 12500,
    }),
    p('patlas-srv-p-treinamento', 'Treinamento — Operação MTI Workspace', pick(2), {
      'patlas-srv-produto': 'Treinamento — Operação MTI Workspace',
      'patlas-srv-categoria': 'Treinamento operacional', 'patlas-srv-metrica': 'Execução',
      'patlas-srv-complexidade': 'Baixa', 'patlas-srv-versao': '1.4',
      'patlas-srv-status': 'Ativa', 'patlas-srv-tipo-cobr': 'Sob Demanda',
      'patlas-srv-recor': 'Sob demanda',
      'patlas-srv-universal': true, 'patlas-srv-individualizado': true,
      'patlas-srv-valor': 4800,
    }),
    p('patlas-srv-p-paralisado', 'Sustentação on-premise legada (Paralisado)', pick(7), {
      'patlas-srv-produto': 'Sustentação on-premise legada',
      'patlas-srv-categoria': 'Sustentação', 'patlas-srv-metrica': 'HST',
      'patlas-srv-status': 'Paralisada', 'patlas-srv-tipo-cobr': 'Mensal',
      'patlas-srv-universal': false, 'patlas-srv-individualizado': true,
      'patlas-srv-valor': 280,
    }),
  ],
  activeExamplePresetId: 'patlas-srv-p-simplifica-plano',
}

// ============================================================================
// FORM 9 — CATÁLOGO UNIVERSAL  (NOVO em V2)
// ============================================================================

const formCatalogoUniversal = {
  id: F_UNI, name: 'Catálogo Universal', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Apoia contratação Tipo 3 (créditos/ecossistema ou composição ampla). Itens selecionados também geram snapshot na proposta.',
  fields: [
    f('patlas-uni-produto', 'Produto de catálogo', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-uni-descricao', 'Descrição', 'text', { size: 'large', textLong: true }),
    f('patlas-uni-metrica', 'Métrica base', 'textOptions', { required: true, relevance: 'highlight', options: METRICAS_PRODUTO }),
    f('patlas-uni-valor', 'Valor unitário', 'decimal', { required: true, relevance: 'highlight', currency: true }),
    f('patlas-uni-peso', 'Peso', 'decimal', { size: 'small' }),
    f('patlas-uni-mb', 'Complexidade muito baixa', 'decimal', { size: 'small' }),
    f('patlas-uni-vmb', 'Valor complexidade muito baixa', 'decimal', { currency: true }),
    f('patlas-uni-b', 'Complexidade baixa', 'decimal', { size: 'small' }),
    f('patlas-uni-vb', 'Valor complexidade baixa', 'decimal', { currency: true }),
    f('patlas-uni-m', 'Complexidade média', 'decimal', { size: 'small' }),
    f('patlas-uni-vm', 'Valor complexidade média', 'decimal', { currency: true }),
    f('patlas-uni-a', 'Complexidade alta', 'decimal', { size: 'small' }),
    f('patlas-uni-va', 'Valor complexidade alta', 'decimal', { currency: true }),
    f('patlas-uni-ma', 'Complexidade muito alta', 'decimal', { size: 'small' }),
    f('patlas-uni-vma', 'Valor complexidade muito alta', 'decimal', { currency: true }),
    f('patlas-uni-recor', 'Recorrência', 'textOptions', { options: COBRANCA }),
    f('patlas-uni-cvu', 'Conversor valor unitário', 'decimal', { size: 'small', relevance: 'advanced' }),
    f('patlas-uni-cmb', 'Conversor muito baixa', 'decimal', { size: 'small', relevance: 'advanced' }),
    f('patlas-uni-cb', 'Conversor baixa', 'decimal', { size: 'small', relevance: 'advanced' }),
    f('patlas-uni-cm', 'Conversor média', 'decimal', { size: 'small', relevance: 'advanced' }),
    f('patlas-uni-ca', 'Conversor alta', 'decimal', { size: 'small', relevance: 'advanced' }),
    f('patlas-uni-cma', 'Conversor muito alta', 'decimal', { size: 'small', relevance: 'advanced' }),
    f('patlas-uni-siag', 'Código SIAG', 'text' ),
    f('patlas-uni-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PRODUTO }),
    f('patlas-uni-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-uni-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
    m('patlas-uni-meth-historico', 'Visualizar histórico', 'history', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-uni-p-creditos-tic', 'Créditos de TIC — Ecossistema Soberano', pick(0), {
      'patlas-uni-produto': 'Créditos de Serviço em TIC — Ecossistema Soberano',
      'patlas-uni-descricao': 'Moeda de créditos para composição de serviços no ecossistema soberano.',
      'patlas-uni-metrica': 'HST', 'patlas-uni-valor': 282.58, 'patlas-uni-peso': 1,
      'patlas-uni-mb': 0.5, 'patlas-uni-vmb': 141.29,
      'patlas-uni-b': 0.8, 'patlas-uni-vb': 226.06,
      'patlas-uni-m': 1, 'patlas-uni-vm': 282.58,
      'patlas-uni-a': 1.5, 'patlas-uni-va': 423.87,
      'patlas-uni-ma': 2, 'patlas-uni-vma': 565.16,
      'patlas-uni-recor': 'Sob Demanda', 'patlas-uni-siag': '0018787',
      'patlas-uni-status': 'Ativo',
    }),
    p('patlas-uni-p-pacote-soberano', 'Pacote ampliado — Ecossistema Soberano', pick(2), {
      'patlas-uni-produto': 'Pacote ampliado de serviços ecossistema soberano',
      'patlas-uni-metrica': 'USN', 'patlas-uni-valor': 1, 'patlas-uni-recor': 'Anual',
      'patlas-uni-status': 'Em homologação',
    }),
  ],
  activeExamplePresetId: 'patlas-uni-p-creditos-tic',
}

// ============================================================================
// FORM 10 — CATÁLOGO POR PARCERIA  (NOVO em V2)
// ============================================================================

const cppSec = [
  sec('sec-patlas-cpp-ident', 'Identificação', 'handshake'),
  sec('sec-patlas-cpp-tec', 'Parâmetros técnicos', 'memory'),
  sec('sec-patlas-cpp-comp', 'Complexidade e métrica', 'tune'),
  sec('sec-patlas-cpp-val', 'Valores', 'payments'),
  sec('sec-patlas-cpp-cod', 'Códigos e contratação', 'qr_code_2'),
  sec('sec-patlas-cpp-hist', 'Histórico', 'history'),
  sec('sec-patlas-cpp-obs', 'Observações', 'sticky_note_2'),
]

const CATALOGOS_PARCERIA = [
  'MTI CLOUD', 'MTI CONNECT', 'MTI DATA SECURITY', 'MTI DevSec.Gov',
  'MTI HOST', 'MTI IA', 'MTI LAB', 'MTI NOW',
  'MTI QI', 'MTI SAAS', 'MTI SIMPLIFICA', 'MTI WORKSPACE',
]

const formCatalogoParceria = {
  id: F_CPP, name: 'Catálogo por Parceria', sectionLayout: 'tabs', sections: cppSec, defaultCanvasMode: 'read',
  metadata: 'Catálogos específicos por parceria (MTI CLOUD, MTI CONNECT, MTI DATA SECURITY, DevSec.Gov, MTI HOST, MTI IA, MTI LAB, MTI NOW, MTI QI, MTI SAAS, MTI SIMPLIFICA, MTI WORKSPACE). Núcleo fixo + campos dinâmicos por parceria (vCPU, RAM, capacidade, etc).',
  fields: [
    // Identificação
    f('patlas-cpp-parceria', 'Parceria', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-cpp-ident' }),
    f('patlas-cpp-categoria', 'Categoria de objeto comercial', 'text', { size: 'large', required: true, relevance: 'highlight', sectionId: 'sec-patlas-cpp-ident' }),
    f('patlas-cpp-info', 'Informação complementar', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-cpp-ident' }),
    f('patlas-cpp-partnum', 'PART Number / ID Number', 'text', { sectionId: 'sec-patlas-cpp-ident' }),
    f('patlas-cpp-produto', 'Produto catálogo comercial', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlas-cpp-ident' }),
    f('patlas-cpp-espec', 'Especificação / descrição da solução', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-cpp-ident' }),
    // Parâmetros técnicos (campos dinâmicos)
    f('patlas-cpp-vcpu', 'vCPU', 'text', { size: 'small', sectionId: 'sec-patlas-cpp-tec' }),
    f('patlas-cpp-ram', 'Memória RAM', 'text', { size: 'small', sectionId: 'sec-patlas-cpp-tec' }),
    f('patlas-cpp-cap', 'Capacidade', 'text', { sectionId: 'sec-patlas-cpp-tec' }),
    f('patlas-cpp-tag', 'Tag da máquina', 'text', { sectionId: 'sec-patlas-cpp-tec' }),
    f('patlas-cpp-qtd-h', 'Qtde horas/mês', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-tec' }),
    f('patlas-cpp-qtd-usn', 'Qtde USN', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-tec' }),
    f('patlas-cpp-peso-hst', 'Peso HST', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-tec' }),
    f('patlas-cpp-unidade', 'Unidade DTIC', 'reference', { linkedFormId: F_EST, sectionId: 'sec-patlas-cpp-tec' }),
    f('patlas-cpp-sol-ofer', 'Solução ofertada', 'text', { sectionId: 'sec-patlas-cpp-tec' }),
    f('patlas-cpp-sol-desc', 'Descrição da solução ofertada', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlas-cpp-tec' }),
    // Complexidade e métrica
    f('patlas-cpp-metrica', 'Métrica', 'textOptions', { size: 'small', relevance: 'highlight', options: METRICAS_PRODUTO, sectionId: 'sec-patlas-cpp-comp' }),
    f('patlas-cpp-modelo', 'Modelo de venda', 'textOptions', { options: MODELO_VENDA, sectionId: 'sec-patlas-cpp-comp' }),
    f('patlas-cpp-c-mb', 'Muito baixa complexidade', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-comp' }),
    f('patlas-cpp-c-b', 'Baixa complexidade', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-comp' }),
    f('patlas-cpp-c-m', 'Média complexidade', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-comp' }),
    f('patlas-cpp-c-a', 'Alta complexidade', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-comp' }),
    f('patlas-cpp-c-ma', 'Muito alta complexidade', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-comp' }),
    f('patlas-cpp-vpc', 'Valor por complexidade', 'decimal', { currency: true, sectionId: 'sec-patlas-cpp-comp' }),
    // Valores
    f('patlas-cpp-vcusto', 'Valor custo', 'decimal', { currency: true, sectionId: 'sec-patlas-cpp-val' }),
    f('patlas-cpp-vcom', 'Valor comercialização', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-cpp-val' }),
    f('patlas-cpp-markup', 'Markup', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-val' }),
    f('patlas-cpp-tipo-cobr', 'Tipo cobrança', 'textOptions', { required: true, relevance: 'highlight', options: COBRANCA, sectionId: 'sec-patlas-cpp-val' }),
    f('patlas-cpp-recor', 'Recorrência de cobrança', 'textOptions', { options: COBRANCA, sectionId: 'sec-patlas-cpp-val' }),
    f('patlas-cpp-dist-parc', 'Distribuição parceiro', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-val' }),
    f('patlas-cpp-dist-mti', 'Distribuição MTI', 'decimal', { size: 'small', sectionId: 'sec-patlas-cpp-val' }),
    f('patlas-cpp-status', 'Status parceria', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PARCERIA, sectionId: 'sec-patlas-cpp-ident' }),
    f('patlas-cpp-vigencia', 'Vigência', 'text', { size: 'small', sectionId: 'sec-patlas-cpp-val' }),
    f('patlas-cpp-periodo', 'Período mínimo', 'text', { size: 'small', sectionId: 'sec-patlas-cpp-val' }),
    // Códigos e contratação
    f('patlas-cpp-catalogo', 'Catálogo', 'text', { sectionId: 'sec-patlas-cpp-cod' }),
    f('patlas-cpp-versao', 'Versão catálogo', 'text', { size: 'small', sectionId: 'sec-patlas-cpp-cod' }),
    f('patlas-cpp-siag', 'Código SIAG', 'text', { sectionId: 'sec-patlas-cpp-cod' }),
    f('patlas-cpp-protheus', 'Código Protheus', 'text', { sectionId: 'sec-patlas-cpp-cod' }),
    f('patlas-cpp-universal', 'Universal', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlas-cpp-cod' }),
    f('patlas-cpp-individualizado', 'Individualizado', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlas-cpp-cod' }),
    // Histórico
    f('patlas-cpp-data-preco', 'Data atualização preço', 'date', { sectionId: 'sec-patlas-cpp-hist' }),
    f('patlas-cpp-indice', 'Índice de reajuste', 'textOptions', { options: INDICE_REAJUSTE, sectionId: 'sec-patlas-cpp-hist' }),
    f('patlas-cpp-homolog', 'Última homologação', 'text', { sectionId: 'sec-patlas-cpp-hist' }),
    f('patlas-cpp-status-atual', 'Status atual', 'textOptions', { options: STATUS_PRODUTO, sectionId: 'sec-patlas-cpp-hist' }),
    f('patlas-cpp-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlas-cpp-obs' }),
  ],
  methods: [
    m('patlas-cpp-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
    m('patlas-cpp-meth-hist', 'Visualizar histórico', 'history', 'menu'),
  ],
  exampleValuePresets: CATALOGOS_PARCERIA.map((nome, idx) => p(
    `patlas-cpp-p-${nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    `Catálogo ${nome}`,
    pick(idx),
    {
      'patlas-cpp-categoria': nome,
      'patlas-cpp-catalogo': nome,
      'patlas-cpp-produto': `Item exemplo — ${nome}`,
      'patlas-cpp-metrica': nome.includes('CLOUD') ? 'USN' : nome.includes('LAB') || nome.includes('CONNECT') ? 'UST' : 'Unidade',
      'patlas-cpp-status': 'Ativa',
      'patlas-cpp-tipo-cobr': nome.includes('CLOUD') || nome.includes('SAAS') ? 'Mensal' : 'Anual',
      'patlas-cpp-vcom': 0,
      'patlas-cpp-universal': nome === 'MTI WORKSPACE' || nome === 'MTI CLOUD',
      'patlas-cpp-individualizado': true,
    },
  )),
  activeExamplePresetId: 'patlas-cpp-p-mti-workspace',
}

// ============================================================================
// FORM 11 — DEMANDA
// ============================================================================

const demSec = [
  sec('sec-patlas-dem-resumo', 'Resumo da demanda', 'summarize'),
  sec('sec-patlas-dem-cliente', 'Cliente e solicitante', 'badge'),
  sec('sec-patlas-dem-necess', 'Necessidade', 'lightbulb'),
  sec('sec-patlas-dem-dirc', 'Análise DIRC', 'fact_check'),
  sec('sec-patlas-dem-anexos', 'Anexos', 'attach_file'),
  sec('sec-patlas-dem-hist', 'Histórico', 'history'),
]

const formDemanda = {
  id: F_DEM, name: 'Demanda', sectionLayout: 'tabs', sections: demSec, defaultCanvasMode: 'read',
  metadata: 'Demanda chega por canal externo, parceiro ou portal futuro. Não vira proposta automaticamente — DIRC analisa.',
  fields: [
    f('patlas-dem-protocolo', 'Protocolo da demanda', 'text', { size: 'small', required: true, relevance: 'identity', sectionId: 'sec-patlas-dem-resumo' }),
    f('patlas-dem-origem', 'Origem', 'textOptions', { required: true, relevance: 'highlight', options: ORIGEM_DEMANDA, sectionId: 'sec-patlas-dem-resumo' }),
    f('patlas-dem-tipo', 'Tipo da demanda', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_DEMANDA, sectionId: 'sec-patlas-dem-resumo' }),
    f('patlas-dem-data-receb', 'Data de recebimento', 'date', { required: true, sectionId: 'sec-patlas-dem-resumo' }),
    f('patlas-dem-cliente', 'Cliente/órgão interessado', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-dem-cliente' }),
    f('patlas-dem-solicitante', 'Solicitante/contato', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-dem-cliente' }),
    f('patlas-dem-parceiro', 'Parceiro de origem', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlas-dem-cliente' }),
    f('patlas-dem-solucao', 'Solução de interesse', 'textOptions', { relevance: 'highlight', options: SOLUCOES, sectionId: 'sec-patlas-dem-necess' }),
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
    p('patlas-dem-p-001', 'COT-2026-001 — SEMA (MTI Cloud) — por e-mail', pick(0), {
      'patlas-dem-protocolo': 'COT-2026-001', 'patlas-dem-origem': 'E-mail',
      'patlas-dem-tipo': 'Nova contratação', 'patlas-dem-data-receb': '2026-02-04',
      'patlas-dem-solucao': 'MTI CLOUD',
      'patlas-dem-descricao': 'SEMA solicita estimativa para infraestrutura em nuvem híbrida — projeto monitoramento ambiental.',
      'patlas-dem-prioridade': 'Alta', 'patlas-dem-status': 'Em análise DIRC',
    }),
    p('patlas-dem-p-002', 'COT-2026-002 — SEPLAG (MTI Simplifica) — por parceiro', pick(2), {
      'patlas-dem-protocolo': 'COT-2026-002', 'patlas-dem-origem': 'Parceiro',
      'patlas-dem-tipo': 'Ampliação', 'patlas-dem-data-receb': '2026-02-12',
      'patlas-dem-solucao': 'MTI SIMPLIFICA',
      'patlas-dem-descricao': 'SEPLAG via parceiro: ampliação de Justiça Digital com 250 USN adicionais.',
      'patlas-dem-prioridade': 'Normal', 'patlas-dem-status': 'Em composição de proposta',
    }),
    p('patlas-dem-p-003', 'COT-2026-003 — SETASC (MTI Lab) — aguardando complemento', pick(6), {
      'patlas-dem-protocolo': 'COT-2026-003', 'patlas-dem-origem': 'WhatsApp',
      'patlas-dem-tipo': 'Estudo de viabilidade', 'patlas-dem-data-receb': '2026-02-18',
      'patlas-dem-solucao': 'MTI LAB',
      'patlas-dem-descricao': 'SETASC: estudo de IA aplicada a triagem assistencial — volumetria não definida.',
      'patlas-dem-prioridade': 'Normal', 'patlas-dem-comp-need': true,
      'patlas-dem-comp-text': 'Faltam dados de volumetria e janela de operação.',
      'patlas-dem-status': 'Aguardando complemento',
    }),
  ],
  activeExamplePresetId: 'patlas-dem-p-001',
}

// ============================================================================
// FORM 12 — PROPOSTA
// ============================================================================

const prpSec = [
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
  id: F_PRP, name: 'Proposta', sectionLayout: 'tabs', sections: prpSec, defaultCanvasMode: 'read',
  metadata: 'Origem: planilha "Propostas". Proposta NÃO é contrato. Cliente não monta proposta na Fase 1. Snapshot do catálogo é obrigatório.',
  fields: [
    f('patlas-prp-numero', 'Número da proposta', 'text', { size: 'small', required: true, relevance: 'identity', sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-ano', 'Ano', 'number', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-data', 'Data da proposta', 'date', { required: true, sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-demanda', 'Demanda de origem', 'reference', { linkedFormId: F_DEM, sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-origem', 'Origem da demanda', 'textOptions', { options: ORIGEM_DEMANDA, sectionId: 'sec-patlas-prp-com' }),
    f('patlas-prp-cliente', 'Cliente/órgão', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG, sectionId: 'sec-patlas-prp-clipar' }),
    f('patlas-prp-uf', 'UF/Estado', 'textOptions', { size: 'small', options: UFS, sectionId: 'sec-patlas-prp-clipar' }),
    f('patlas-prp-produto', 'Produto/solução principal', 'textOptions', { required: true, relevance: 'highlight', options: SOLUCOES, sectionId: 'sec-patlas-prp-com' }),
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
    // Direto da planilha
    p('patlas-prp-p-98-sema', 'Proposta 98/2025 — SEMA (MTI Cloud) — Suspensa', pick(7), {
      'patlas-prp-numero': '98', 'patlas-prp-ano': 2025, 'patlas-prp-data': '2025-08-12',
      'patlas-prp-uf': 'MT', 'patlas-prp-produto': 'MTI CLOUD',
      'patlas-prp-tem-parc': true, 'patlas-prp-projeto': 'Infraestrutura SEMA',
      'patlas-prp-objetivo': 'Disponibilizar infraestrutura em nuvem híbrida para monitoramento.',
      'patlas-prp-escopo': 'MTI Cloud — USN sob demanda, 12 meses.',
      'patlas-prp-tipo-contr': 'Catálogo do produto',
      'patlas-prp-vigencia': 12, 'patlas-prp-valor-total': 169127.04,
      'patlas-prp-status': 'Suspensa',
    }),
    // Direto da planilha
    p('patlas-prp-p-3-seplag', 'Proposta 3/2025 — SEPLAG (Simplifica + Host) — Em Contratação', pick(2), {
      'patlas-prp-numero': '3', 'patlas-prp-ano': 2025, 'patlas-prp-data': '2025-03-04',
      'patlas-prp-uf': 'MT', 'patlas-prp-produto': 'MTI SIMPLIFICA',
      'patlas-prp-tem-parc': false, 'patlas-prp-projeto': 'Justiça Digital — SEPLAG',
      'patlas-prp-objetivo': 'Implantar SaaS de simplificação e desburocratização de processos.',
      'patlas-prp-escopo': 'MTI Simplifica + MTI Host — vigência 24 meses.',
      'patlas-prp-tipo-contr': 'Catálogo geral/ecossistema',
      'patlas-prp-vigencia': 24, 'patlas-prp-valor-total': 16563415.72,
      'patlas-prp-status': 'Em Contratação',
    }),
    p('patlas-prp-p-2026-001', 'PROP-2026-001 — SEMA (Cloud) — Em composição', pick(0), {
      'patlas-prp-numero': 'PROP-2026-001', 'patlas-prp-ano': 2026, 'patlas-prp-data': '2026-02-05',
      'patlas-prp-uf': 'MT', 'patlas-prp-produto': 'MTI CLOUD', 'patlas-prp-tem-parc': true,
      'patlas-prp-projeto': 'Monitoramento ambiental SEMA',
      'patlas-prp-objetivo': 'Infraestrutura híbrida USN sob demanda.',
      'patlas-prp-escopo': 'MTI Cloud com Zadara — 12 meses.',
      'patlas-prp-tipo-contr': 'Catálogo do produto', 'patlas-prp-vigencia': 12,
      'patlas-prp-valor-total': 240000, 'patlas-prp-status': 'Em composição',
    }),
    p('patlas-prp-p-2026-002', 'PROP-2026-002 — SEPLAG (Simplifica) — Aguardando parceiro', pick(1), {
      'patlas-prp-numero': 'PROP-2026-002', 'patlas-prp-ano': 2026, 'patlas-prp-data': '2026-02-13',
      'patlas-prp-uf': 'MT', 'patlas-prp-produto': 'MTI SIMPLIFICA', 'patlas-prp-tem-parc': true,
      'patlas-prp-tipo-contr': 'Catálogo geral/ecossistema', 'patlas-prp-vigencia': 12,
      'patlas-prp-valor-total': 813054.4, 'patlas-prp-status': 'Aguardando parceiro',
    }),
    p('patlas-prp-p-2026-003', 'PROP-2026-003 — SETASC (MTI Lab) — Em assinatura', pick(3), {
      'patlas-prp-numero': 'PROP-2026-003', 'patlas-prp-ano': 2026, 'patlas-prp-data': '2026-02-22',
      'patlas-prp-uf': 'MT', 'patlas-prp-produto': 'MTI LAB', 'patlas-prp-tem-parc': false,
      'patlas-prp-tipo-contr': 'Objeto específico', 'patlas-prp-vigencia': 12,
      'patlas-prp-valor-total': 74853, 'patlas-prp-status': 'Em assinatura',
    }),
    p('patlas-prp-p-2026-004', 'PROP-2026-004 — Documento gerado', pick(4), {
      'patlas-prp-numero': 'PROP-2026-004', 'patlas-prp-ano': 2026, 'patlas-prp-data': '2026-02-24',
      'patlas-prp-uf': 'MT', 'patlas-prp-produto': 'MTI WORKSPACE', 'patlas-prp-tem-parc': false,
      'patlas-prp-tipo-contr': 'Catálogo do produto', 'patlas-prp-vigencia': 12,
      'patlas-prp-valor-total': 385530, 'patlas-prp-status': 'Documento gerado',
    }),
    p('patlas-prp-p-2026-005', 'PROP-2026-005 — Enviada ao cliente', pick(5), {
      'patlas-prp-numero': 'PROP-2026-005', 'patlas-prp-ano': 2026, 'patlas-prp-data': '2026-02-26',
      'patlas-prp-uf': 'MT', 'patlas-prp-produto': 'MTI CLOUD', 'patlas-prp-tem-parc': false,
      'patlas-prp-tipo-contr': 'Catálogo do produto', 'patlas-prp-vigencia': 24,
      'patlas-prp-valor-total': 480000, 'patlas-prp-data-envio': '2026-02-27',
      'patlas-prp-destin': 'juliana.pereira@sema.mt.gov.br',
      'patlas-prp-status': 'Enviada ao cliente',
    }),
  ],
  activeExamplePresetId: 'patlas-prp-p-98-sema',
}

// ============================================================================
// FORM 13 — ITEM DA PROPOSTA
// ============================================================================

const priSec = [
  sec('sec-patlas-pri-origem', 'Origem do item', 'category'),
  sec('sec-patlas-pri-snap', 'Dados copiados do catálogo', 'content_copy'),
  sec('sec-patlas-pri-qv', 'Quantidade e valores', 'calculate'),
  sec('sec-patlas-pri-contr', 'Contratação e recorrência', 'paid'),
  sec('sec-patlas-pri-resp', 'Parceiro e responsáveis', 'support_agent'),
  sec('sec-patlas-pri-justif', 'Justificativas', 'edit_note'),
]

const formItemProposta = {
  id: F_PRI, name: 'Item da Proposta', sectionLayout: 'tabs', sections: priSec, defaultCanvasMode: 'read',
  metadata: 'Snapshot do catálogo. Item manual exige justificativa. Valor total = quantidade × valor unitário.',
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
    f('patlas-pri-siag-uso', 'Código SIAG usado', 'text', { sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-protheus-uso', 'Código Protheus usado', 'text', { sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-siag-item', 'Código SIAG — item específico', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-protheus-item', 'Código Protheus — item específico', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-siag-prod', 'Código SIAG — catálogo do produto', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-protheus-prod', 'Código Protheus — catálogo do produto', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-siag-ger', 'Código SIAG — catálogo geral', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-protheus-ger', 'Código Protheus — catálogo geral', 'text', { relevance: 'advanced', sectionId: 'sec-patlas-pri-contr' }),
    f('patlas-pri-qtd', 'Quantidade', 'decimal', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-valor-unit', 'Valor unitário', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-valor-total', 'Valor total', 'decimal', { required: true, relevance: 'highlight', currency: true, sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-custo', 'Custo parceiro', 'decimal', { currency: true, relevance: 'advanced', sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-markup', 'Markup', 'decimal', { size: 'small', relevance: 'advanced', sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-dist-parc', 'Distribuição parceiro', 'decimal', { size: 'small', relevance: 'advanced', sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-dist-mti', 'Distribuição MTI', 'decimal', { size: 'small', relevance: 'advanced', sectionId: 'sec-patlas-pri-qv' }),
    f('patlas-pri-recor', 'Recorrência de cobrança', 'textOptions', { required: true, options: RECORRENCIA_ITEM, sectionId: 'sec-patlas-pri-contr' }),
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
    p('patlas-pri-p-licenca', 'Snapshot — Licença MTI Workspace 5TB', pick(0), {
      'patlas-pri-origem': 'Licença',
      'patlas-pri-descricao': 'MTI Workspace Enterprise Standard Ecrypto - 5 TB',
      'patlas-pri-solucao': 'MTI WORKSPACE', 'patlas-pri-metrica': 'USN',
      'patlas-pri-tipo-contr': 'Catálogo do produto',
      'patlas-pri-siag-uso': '111055', 'patlas-pri-protheus-uso': '32000089',
      'patlas-pri-qtd': 300, 'patlas-pri-valor-unit': 1070.92, 'patlas-pri-valor-total': 321276,
      'patlas-pri-recor': 'Anual', 'patlas-pri-status': 'Aceito',
    }),
    p('patlas-pri-p-cloud', 'Snapshot — Produto MTI Cloud (Zadara)', pick(1), {
      'patlas-pri-origem': 'Produto vigente',
      'patlas-pri-descricao': 'MTI CLOUD - DISPONIBILIZAÇÃO DE INFRAESTRUTURA EM NUVEM HÍBRIDA',
      'patlas-pri-solucao': 'MTI CLOUD', 'patlas-pri-metrica': 'USN',
      'patlas-pri-tipo-contr': 'Catálogo do produto',
      'patlas-pri-siag-uso': '0005315', 'patlas-pri-protheus-uso': '32000192',
      'patlas-pri-qtd': 1000, 'patlas-pri-valor-unit': 1.0, 'patlas-pri-valor-total': 1000,
      'patlas-pri-recor': 'Sob demanda', 'patlas-pri-status': 'Em composição',
    }),
    p('patlas-pri-p-manual', 'Snapshot — Item Manual (justificativa obrigatória)', pick(7), {
      'patlas-pri-origem': 'Manual',
      'patlas-pri-descricao': 'Customização externa — integração SEFAZ-MT',
      'patlas-pri-metrica': 'Projeto', 'patlas-pri-tipo-contr': 'Objeto específico',
      'patlas-pri-qtd': 1, 'patlas-pri-valor-unit': 58000, 'patlas-pri-valor-total': 58000,
      'patlas-pri-recor': 'Única',
      'patlas-pri-justif-man': 'Integração específica não coberta pelo catálogo vigente.',
      'patlas-pri-status': 'Em composição',
    }),
  ],
  activeExamplePresetId: 'patlas-pri-p-licenca',
}

// ============================================================================
// FORM 14 — MODELO DE DOCUMENTO
// ============================================================================

const formModeloDocumento = {
  id: F_DTP, name: 'Modelo de Documento', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Template reutilizável. Modelo publicado não pode ser editado; alteração gera nova versão.',
  fields: [
    f('patlas-dtp-nome', 'Nome do modelo', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-dtp-tipo', 'Tipo do documento', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_DOCUMENTO }),
    f('patlas-dtp-aplic', 'Solução/parceria aplicável', 'reference', { relevance: 'highlight', linkedFormId: F_ORG }),
    f('patlas-dtp-versao', 'Versão', 'text', { size: 'small', required: true, relevance: 'highlight' }),
    f('patlas-dtp-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DOC_TEMPLATE }),
    f('patlas-dtp-conteudo', 'Conteúdo HTML/template', 'text', { size: 'large', textLong: true, required: true }),
    f('patlas-dtp-parametros', 'Parâmetros', 'embeddedReference', { multiple: true, linkedFormId: F_DPM, embeddedDisplay: 'table', size: 'large' }),
    f('patlas-dtp-criado', 'Criado por', 'reference', { linkedFormId: F_PES, relevance: 'advanced' }),
    f('patlas-dtp-data-cri', 'Data criação', 'date', { relevance: 'advanced' }),
    f('patlas-dtp-publ', 'Publicado por', 'reference', { linkedFormId: F_PES, relevance: 'advanced' }),
    f('patlas-dtp-data-pub', 'Data publicação', 'date', { relevance: 'advanced' }),
    f('patlas-dtp-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-dtp-meth-prev', 'Pré-visualizar modelo', 'preview', 'menu'),
    m('patlas-dtp-meth-publicar', 'Publicar modelo', 'publish', 'destaque'),
    m('patlas-dtp-meth-versao', 'Criar nova versão', 'add_circle', 'menu'),
    m('patlas-dtp-meth-arquivar', 'Arquivar modelo', 'inventory_2', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-dtp-p-proposta', 'Modelo padrão de proposta', pick(0), {
      'patlas-dtp-nome': 'Proposta comercial — padrão MTI', 'patlas-dtp-tipo': 'Proposta',
      'patlas-dtp-versao': '3.1', 'patlas-dtp-status': 'Publicado',
    }),
    p('patlas-dtp-p-contrato', 'Modelo padrão de contrato', pick(1), {
      'patlas-dtp-nome': 'Contrato comercial — padrão MTI', 'patlas-dtp-tipo': 'Contrato',
      'patlas-dtp-versao': '2.4', 'patlas-dtp-status': 'Publicado',
    }),
    p('patlas-dtp-p-handover', 'Modelo padrão de handover', pick(2), {
      'patlas-dtp-nome': 'Termo de handover técnico', 'patlas-dtp-tipo': 'Handover',
      'patlas-dtp-versao': '1.2', 'patlas-dtp-status': 'Publicado',
    }),
  ],
  activeExamplePresetId: 'patlas-dtp-p-proposta',
}

// ============================================================================
// FORM 15 — PARÂMETRO DE DOCUMENTO  (NOVO em V2)
// ============================================================================

const formParametroDocumento = {
  id: F_DPM, name: 'Parâmetro de Documento', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Placeholder usado em modelos para gerar documentos com dados da proposta, cliente, contrato, etc.',
  fields: [
    f('patlas-dpm-nome', 'Nome do parâmetro', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-dpm-placeholder', 'Placeholder', 'text', { required: true, relevance: 'highlight', spec: 'Ex.: {{cliente}}, {{valor_total}}' }),
    f('patlas-dpm-origem', 'Origem do dado', 'textOptions', { required: true, relevance: 'highlight', options: ORIGEM_PARAMETRO }),
    f('patlas-dpm-campo', 'Campo de origem', 'text', { size: 'large' }),
    f('patlas-dpm-obrigatorio', 'Obrigatório', 'boolean', { required: true, relevance: 'highlight' }),
    f('patlas-dpm-padrao', 'Valor padrão', 'text', { size: 'large' }),
    f('patlas-dpm-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  exampleValuePresets: [
    p('patlas-dpm-p-cliente', '{{cliente}} — Nome do cliente', pick(0), {
      'patlas-dpm-nome': 'Nome do cliente/órgão', 'patlas-dpm-placeholder': '{{cliente}}',
      'patlas-dpm-origem': 'Cliente', 'patlas-dpm-campo': 'organizacao.nome', 'patlas-dpm-obrigatorio': true,
    }),
    p('patlas-dpm-p-valor', '{{valor_total}} — Valor total da proposta', pick(1), {
      'patlas-dpm-nome': 'Valor total da proposta', 'patlas-dpm-placeholder': '{{valor_total}}',
      'patlas-dpm-origem': 'Proposta', 'patlas-dpm-campo': 'proposta.valor_total', 'patlas-dpm-obrigatorio': true,
    }),
    p('patlas-dpm-p-parceiro', '{{parceiro}} — Parceiro envolvido', pick(2), {
      'patlas-dpm-nome': 'Nome do parceiro', 'patlas-dpm-placeholder': '{{parceiro}}',
      'patlas-dpm-origem': 'Parceiro', 'patlas-dpm-campo': 'parceiro.nome', 'patlas-dpm-obrigatorio': false,
    }),
    p('patlas-dpm-p-vigencia', '{{vigencia_meses}} — Vigência em meses', pick(3), {
      'patlas-dpm-nome': 'Vigência em meses', 'patlas-dpm-placeholder': '{{vigencia_meses}}',
      'patlas-dpm-origem': 'Proposta', 'patlas-dpm-campo': 'proposta.vigencia_meses', 'patlas-dpm-obrigatorio': true,
      'patlas-dpm-padrao': '12',
    }),
  ],
  activeExamplePresetId: 'patlas-dpm-p-cliente',
}

// ============================================================================
// FORM 16 — DOCUMENTO GERADO
// ============================================================================

const formDocumentoGerado = {
  id: F_DGD, name: 'Documento Gerado', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Instância de documento gerada a partir de um modelo publicado. Vinculada à proposta ou contrato.',
  fields: [
    f('patlas-dgd-titulo', 'Título do documento', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-dgd-tipo', 'Tipo do documento', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_DOCUMENTO }),
    f('patlas-dgd-prp', 'Proposta vinculada', 'reference', { linkedFormId: F_PRP }),
    f('patlas-dgd-ctr', 'Contrato vinculado', 'reference', { linkedFormId: F_CTR }),
    f('patlas-dgd-modelo', 'Modelo usado', 'reference', { required: true, linkedFormId: F_DTP }),
    f('patlas-dgd-versao-mod', 'Versão do modelo', 'text', { size: 'small', required: true, relevance: 'highlight' }),
    f('patlas-dgd-versao-prp', 'Versão da proposta', 'text', { size: 'small' }),
    f('patlas-dgd-arquivo', 'Documento gerado', 'file'),
    f('patlas-dgd-status', 'Status do documento', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DOC_GERADO }),
    f('patlas-dgd-data-ger', 'Data geração', 'date'),
    f('patlas-dgd-gerado-por', 'Gerado por', 'reference', { linkedFormId: F_PES }),
    f('patlas-dgd-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-dgd-meth-baixar', 'Baixar documento', 'download', 'destaque'),
    m('patlas-dgd-meth-assinar', 'Enviar para assinatura', 'edit_note', 'destaque'),
    m('patlas-dgd-meth-cliente', 'Enviar ao cliente', 'send', 'menu'),
    m('patlas-dgd-meth-cancelar', 'Cancelar documento', 'cancel', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-dgd-p-prp-sema', 'Proposta SEMA — Gerado', pick(0), {
      'patlas-dgd-titulo': 'Proposta PROP-2026-001 — SEMA',
      'patlas-dgd-tipo': 'Proposta', 'patlas-dgd-versao-mod': '3.1',
      'patlas-dgd-status': 'Gerado', 'patlas-dgd-data-ger': '2026-02-07',
    }),
    p('patlas-dgd-p-prp-ass', 'Proposta — Em assinatura', pick(3), {
      'patlas-dgd-titulo': 'Proposta PROP-2026-003 — SETASC',
      'patlas-dgd-tipo': 'Proposta', 'patlas-dgd-versao-mod': '3.1',
      'patlas-dgd-status': 'Enviado para assinatura', 'patlas-dgd-data-ger': '2026-02-22',
    }),
    p('patlas-dgd-p-ctr', 'Contrato CT-2026-001 — Assinado', pick(2), {
      'patlas-dgd-titulo': 'Contrato CT-2026-001 — SEMA', 'patlas-dgd-tipo': 'Contrato',
      'patlas-dgd-versao-mod': '2.4', 'patlas-dgd-status': 'Assinado',
      'patlas-dgd-data-ger': '2026-03-04',
    }),
  ],
  activeExamplePresetId: 'patlas-dgd-p-prp-ass',
}

// ============================================================================
// FORM 17 — MODELO DE WORKFLOW
// ============================================================================

const formWorkflowModelo = {
  id: F_WFM, name: 'Modelo de Workflow', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Modelo reutilizável por domínio (proposta, contrato, documento, assinatura, handover).',
  fields: [
    f('patlas-wfm-nome', 'Nome do workflow', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-wfm-dominio', 'Domínio', 'textOptions', { required: true, relevance: 'highlight', options: DOMINIO_WORKFLOW }),
    f('patlas-wfm-area', 'Área dona', 'textOptions', { required: true, relevance: 'highlight', options: AREA_WORKFLOW }),
    f('patlas-wfm-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_WORKFLOW }),
    f('patlas-wfm-versao', 'Versão ativa', 'text', { size: 'small' }),
    f('patlas-wfm-descricao', 'Descrição', 'text', { size: 'large', textLong: true }),
    f('patlas-wfm-etapas', 'Etapas', 'embeddedReference', { multiple: true, linkedFormId: F_WFE, embeddedDisplay: 'table', size: 'large' }),
  ],
  methods: [
    m('patlas-wfm-meth-versao', 'Criar versão', 'add_circle', 'menu'),
    m('patlas-wfm-meth-ativar', 'Ativar workflow', 'play_arrow', 'destaque'),
    m('patlas-wfm-meth-suspender', 'Suspender workflow', 'pause', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-wfm-p-proposta', 'Aprovação de Proposta Comercial', pick(0), {
      'patlas-wfm-nome': 'Aprovação de Proposta Comercial', 'patlas-wfm-dominio': 'Proposta',
      'patlas-wfm-area': 'DIRC', 'patlas-wfm-status': 'Ativo', 'patlas-wfm-versao': '2.0',
      'patlas-wfm-descricao': 'DIRC → parceiro (se houver) → DTIC → complementar (DAFI, opcional) → Presidência → envio ao cliente.',
    }),
    p('patlas-wfm-p-contrato', 'Operacionalização de Contrato', pick(2), {
      'patlas-wfm-nome': 'Recepção e Operacionalização de Contrato',
      'patlas-wfm-dominio': 'Contrato', 'patlas-wfm-area': 'DIRC',
      'patlas-wfm-status': 'Ativo', 'patlas-wfm-versao': '1.3',
      'patlas-wfm-descricao': 'Contrato recebido → revisão → cadastro cliente → integrações → recorrência → publicação → handover → kick-off.',
    }),
    p('patlas-wfm-p-dafi', 'Aprovação complementar DAFI (opcional)', pick(4), {
      'patlas-wfm-nome': 'Aprovação Complementar — DAFI/Gestão Administrativa',
      'patlas-wfm-dominio': 'Assinatura', 'patlas-wfm-area': 'Gestão Administrativa',
      'patlas-wfm-status': 'Ativo', 'patlas-wfm-versao': '1.0',
      'patlas-wfm-descricao': 'Quando exigida pelo modelo de proposta — antes da Presidência.',
    }),
  ],
  activeExamplePresetId: 'patlas-wfm-p-proposta',
}

// ============================================================================
// FORM 18 — ETAPA DO WORKFLOW
// ============================================================================

const formWorkflowEtapa = {
  id: F_WFE, name: 'Etapa do Workflow', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Cada etapa define ordem, tipo, área, regras de avanço e SLA.',
  fields: [
    f('patlas-wfe-nome', 'Nome da etapa', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-wfe-ordem', 'Ordem', 'number', { size: 'small', required: true, relevance: 'highlight' }),
    f('patlas-wfe-tipo', 'Tipo da etapa', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_ETAPA_WF }),
    f('patlas-wfe-area', 'Área responsável', 'textOptions', { required: true, options: AREA_ETAPA }),
    f('patlas-wfe-cargo', 'Cargo/Função responsável', 'reference', { linkedFormId: F_CGF }),
    f('patlas-wfe-exige-ass', 'Exige assinatura', 'boolean'),
    f('patlas-wfe-paralela', 'Assinatura paralela?', 'boolean'),
    f('patlas-wfe-bloqueia', 'Bloqueia avanço', 'boolean', { relevance: 'highlight' }),
    f('patlas-wfe-sla', 'SLA em dias', 'number', { size: 'small' }),
    f('patlas-wfe-prox-aprov', 'Próxima etapa aprovada', 'text'),
    f('patlas-wfe-retorno-aj', 'Retorno por ajuste', 'text'),
    f('patlas-wfe-retorno-rep', 'Retorno por reprovação', 'text'),
    f('patlas-wfe-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  exampleValuePresets: [
    p('patlas-wfe-p-comp', 'Composição DIRC', pick(0), {
      'patlas-wfe-nome': 'Composição DIRC', 'patlas-wfe-ordem': 1, 'patlas-wfe-tipo': 'Edição',
      'patlas-wfe-area': 'DIRC', 'patlas-wfe-bloqueia': false, 'patlas-wfe-sla': 3,
    }),
    p('patlas-wfe-p-parc', 'Análise do parceiro', pick(2), {
      'patlas-wfe-nome': 'Análise do parceiro', 'patlas-wfe-ordem': 2, 'patlas-wfe-tipo': 'Revisão',
      'patlas-wfe-area': 'Parceiro', 'patlas-wfe-bloqueia': true, 'patlas-wfe-sla': 5,
    }),
    p('patlas-wfe-p-dtic', 'Assinatura DTIC', pick(1), {
      'patlas-wfe-nome': 'Assinatura DTIC', 'patlas-wfe-ordem': 4, 'patlas-wfe-tipo': 'Assinatura',
      'patlas-wfe-area': 'DTIC', 'patlas-wfe-exige-ass': true, 'patlas-wfe-bloqueia': true, 'patlas-wfe-sla': 2,
    }),
    p('patlas-wfe-p-dafi', 'Assinatura complementar DAFI (opcional)', pick(4), {
      'patlas-wfe-nome': 'Assinatura complementar — DAFI', 'patlas-wfe-ordem': 5, 'patlas-wfe-tipo': 'Assinatura',
      'patlas-wfe-area': 'Gestão Administrativa', 'patlas-wfe-exige-ass': true, 'patlas-wfe-bloqueia': false, 'patlas-wfe-sla': 2,
    }),
    p('patlas-wfe-p-pres', 'Assinatura Presidência', pick(3), {
      'patlas-wfe-nome': 'Assinatura Presidência', 'patlas-wfe-ordem': 6, 'patlas-wfe-tipo': 'Assinatura',
      'patlas-wfe-area': 'Presidência', 'patlas-wfe-exige-ass': true, 'patlas-wfe-bloqueia': true, 'patlas-wfe-sla': 2,
    }),
    p('patlas-wfe-p-envio', 'Envio ao cliente', pick(5), {
      'patlas-wfe-nome': 'Envio ao cliente', 'patlas-wfe-ordem': 7, 'patlas-wfe-tipo': 'Externa',
      'patlas-wfe-area': 'Sistema', 'patlas-wfe-bloqueia': false, 'patlas-wfe-sla': 1,
    }),
  ],
  activeExamplePresetId: 'patlas-wfe-p-comp',
}

// ============================================================================
// FORM 19 — TRÂMITE DE ASSINATURA
// ============================================================================

const traSec = [
  sec('sec-patlas-tra-doc', 'Documento e proposta', 'description'),
  sec('sec-patlas-tra-ass', 'Assinante', 'badge'),
  sec('sec-patlas-tra-stat', 'Status e prazo', 'schedule'),
  sec('sec-patlas-tra-res', 'Resultado', 'fact_check'),
  sec('sec-patlas-tra-hist', 'Histórico', 'history'),
]

const formTramiteAssinatura = {
  id: F_TRA, name: 'Trâmite de Assinatura', sectionLayout: 'tabs', sections: traSec, defaultCanvasMode: 'read',
  metadata: 'Pendência por cargo/função. Sem parceiro: dispensa parceiro. DAFI/Gestão Administrativa é assinatura Complementar opcional.',
  fields: [
    f('patlas-tra-prp', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP, sectionId: 'sec-patlas-tra-doc' }),
    f('patlas-tra-doc', 'Documento', 'reference', { required: true, linkedFormId: F_DGD, sectionId: 'sec-patlas-tra-doc' }),
    f('patlas-tra-grupo', 'Grupo de assinatura', 'textOptions', { required: true, relevance: 'highlight', options: GRUPO_ASSINATURA, sectionId: 'sec-patlas-tra-ass' }),
    f('patlas-tra-area', 'Área', 'textOptions', { required: true, options: AREA_ASSINATURA, sectionId: 'sec-patlas-tra-ass' }),
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
    m('patlas-tra-meth-assinar', 'Assinar', 'verified', 'destaque'),
    m('patlas-tra-meth-ajuste', 'Solicitar ajuste', 'edit_note', 'menu'),
    m('patlas-tra-meth-reprovar', 'Reprovar', 'cancel', 'menu'),
    m('patlas-tra-meth-dispensar', 'Dispensar assinatura', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-tra-p-dirc-pend', 'DIRC — Pendente', pick(0), {
      'patlas-tra-grupo': 'DIRC', 'patlas-tra-area': 'DIRC',
      'patlas-tra-status': 'Pendente', 'patlas-tra-dias': 2, 'patlas-tra-bloqueia': true,
    }),
    p('patlas-tra-p-parc-ass', 'Parceiro — Assinado', pick(2), {
      'patlas-tra-grupo': 'Parceiro', 'patlas-tra-area': 'Parceiro',
      'patlas-tra-status': 'Assinado', 'patlas-tra-data-ass': '2026-02-21',
      'patlas-tra-dias': 0, 'patlas-tra-bloqueia': false, 'patlas-tra-resultado': 'Assinado',
    }),
    p('patlas-tra-p-dtic-aj', 'DTIC — Ajuste solicitado', pick(6), {
      'patlas-tra-grupo': 'DTIC', 'patlas-tra-area': 'DTIC',
      'patlas-tra-status': 'Ajuste solicitado', 'patlas-tra-dias': 3,
      'patlas-tra-bloqueia': true, 'patlas-tra-resultado': 'Ajuste',
      'patlas-tra-motivo': 'Revisar quantidade de USN — divergência com a demanda original.',
    }),
    p('patlas-tra-p-compl-dafi', 'Complementar DAFI — Assinada', pick(4), {
      'patlas-tra-grupo': 'Complementar', 'patlas-tra-area': 'Gestão Administrativa',
      'patlas-tra-status': 'Assinado', 'patlas-tra-data-ass': '2026-02-23',
      'patlas-tra-dias': 1, 'patlas-tra-bloqueia': false, 'patlas-tra-resultado': 'Assinado',
    }),
    p('patlas-tra-p-pres-ass', 'Presidência — Assinada', pick(3), {
      'patlas-tra-grupo': 'Presidência', 'patlas-tra-area': 'Presidência',
      'patlas-tra-status': 'Assinado', 'patlas-tra-data-ass': '2026-02-24',
      'patlas-tra-dias': 1, 'patlas-tra-bloqueia': false, 'patlas-tra-resultado': 'Assinado',
    }),
    p('patlas-tra-p-disp', 'Parceiro — Dispensada (sem parceiro)', pick(7), {
      'patlas-tra-grupo': 'Parceiro', 'patlas-tra-area': 'Parceiro',
      'patlas-tra-status': 'Dispensado', 'patlas-tra-bloqueia': false,
      'patlas-tra-resultado': 'Dispensado',
    }),
  ],
  activeExamplePresetId: 'patlas-tra-p-dirc-pend',
}

// ============================================================================
// FORM 20 — ENVIO DA PROPOSTA  (NOVO em V2)
// ============================================================================

const formEnvioProposta = {
  id: F_ENV, name: 'Envio da Proposta', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Registra o envio formal da proposta ao cliente após aprovação no workflow.',
  fields: [
    f('patlas-env-prp', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP }),
    f('patlas-env-doc', 'Documento enviado', 'reference', { required: true, linkedFormId: F_DGD }),
    f('patlas-env-cliente', 'Cliente/órgão', 'reference', { required: true, relevance: 'highlight', linkedFormId: F_ORG }),
    f('patlas-env-canal', 'Canal de envio', 'textOptions', { required: true, relevance: 'highlight', options: CANAL_ENVIO }),
    f('patlas-env-dest', 'Destinatários', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-env-data', 'Data de envio', 'date', { required: true, relevance: 'highlight' }),
    f('patlas-env-quem', 'Enviado por', 'reference', { linkedFormId: F_PES }),
    f('patlas-env-status', 'Status do envio', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_ENVIO }),
    f('patlas-env-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-env-meth-enviar', 'Enviar proposta', 'send', 'destaque'),
    m('patlas-env-meth-reenviar', 'Reenviar proposta', 'forward_to_inbox', 'menu'),
    m('patlas-env-meth-manual', 'Registrar envio manual', 'edit_note', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-env-p-sema', 'SEMA — E-mail enviado', pick(0), {
      'patlas-env-canal': 'E-mail',
      'patlas-env-dest': 'juliana.pereira@sema.mt.gov.br',
      'patlas-env-data': '2026-02-27', 'patlas-env-status': 'Enviado',
    }),
    p('patlas-env-p-seplag', 'SEPLAG — Reenviado', pick(2), {
      'patlas-env-canal': 'E-mail',
      'patlas-env-dest': 'contratos@seplag.mt.gov.br',
      'patlas-env-data': '2026-03-02', 'patlas-env-status': 'Reenviado',
    }),
  ],
  activeExamplePresetId: 'patlas-env-p-sema',
}

// ============================================================================
// FORM 21 — CONTRATAÇÃO EXTERNA  (NOVO em V2)
// ============================================================================

const formContratacaoExterna = {
  id: F_EXT, name: 'Contratação Externa', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Atlas acompanha o processo de contratação que ocorre fora dos seus limites (compras, jurídico do cliente).',
  fields: [
    f('patlas-ext-prp', 'Proposta enviada', 'reference', { required: true, linkedFormId: F_PRP }),
    f('patlas-ext-cliente', 'Cliente/órgão', 'reference', { required: true, relevance: 'identity', linkedFormId: F_ORG }),
    f('patlas-ext-status', 'Status externo', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_EXTERNO }),
    f('patlas-ext-apoio', 'Apoio prestado', 'text', { size: 'large', textLong: true, spec: 'Certidões, documentos, arquitetura etc.' }),
    f('patlas-ext-ult-cont', 'Data último contato', 'date', { relevance: 'highlight' }),
    f('patlas-ext-prox', 'Próxima ação', 'text', { size: 'large', textLong: true }),
    f('patlas-ext-resp', 'Responsável MTI', 'reference', { linkedFormId: F_PES }),
    f('patlas-ext-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  methods: [
    m('patlas-ext-meth-atualizar', 'Atualizar status externo', 'sync', 'destaque'),
    m('patlas-ext-meth-apoio', 'Registrar apoio prestado', 'support_agent', 'menu'),
    m('patlas-ext-meth-receber', 'Marcar contrato recebido', 'inventory_2', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlas-ext-p-aguardando', 'SEMA — Aguardando cliente', pick(6), {
      'patlas-ext-status': 'Aguardando cliente', 'patlas-ext-ult-cont': '2026-03-01',
      'patlas-ext-prox': 'Follow-up por e-mail em 7 dias.',
    }),
    p('patlas-ext-p-doc', 'SEPLAG — Documentação solicitada', pick(7), {
      'patlas-ext-status': 'Documentação solicitada', 'patlas-ext-ult-cont': '2026-03-03',
      'patlas-ext-apoio': 'Enviadas certidões CNDT, CND federal e estadual.',
    }),
    p('patlas-ext-p-recebido', 'SETASC — Contrato assinado recebido', pick(2), {
      'patlas-ext-status': 'Contrato assinado recebido', 'patlas-ext-ult-cont': '2026-03-09',
    }),
    p('patlas-ext-p-sem-ret', 'Sem retorno (>30 dias)', pick(5), {
      'patlas-ext-status': 'Sem retorno',
    }),
  ],
  activeExamplePresetId: 'patlas-ext-p-aguardando',
}

// ============================================================================
// FORM 22 — CONTRATO
// ============================================================================

const ctrSec = [
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
  id: F_CTR, name: 'Contrato', sectionLayout: 'tabs', sections: ctrSec, defaultCanvasMode: 'read',
  metadata: 'Anexo + data de retorno obrigatórios. Divergência exige tipo e justificativa. Publicação é mandatória.',
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
    m('patlas-ctr-meth-prot', 'Registrar integração Protheus', 'sync', 'menu'),
    m('patlas-ctr-meth-snow', 'Registrar integração ServiceNow', 'sync', 'menu'),
    m('patlas-ctr-meth-hov', 'Gerar handover', 'description', 'destaque'),
    m('patlas-ctr-meth-pos', 'Notificar pós-vendas', 'notifications_active', 'menu'),
    m('patlas-ctr-meth-kof', 'Agendar kick-off', 'event', 'destaque'),
    m('patlas-ctr-meth-fim', 'Finalizar Fase 1', 'flag', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlas-ctr-p-001-sema', 'CT-2026-001 — SEMA (Contrato recebido)', pick(0), {
      'patlas-ctr-numero': 'CT-2026-001', 'patlas-ctr-data-ret': '2026-03-01',
      'patlas-ctr-status': 'Recebido', 'patlas-ctr-divergencia': false,
      'patlas-ctr-extr-pub': false, 'patlas-ctr-int-prot': 'Não enviado', 'patlas-ctr-int-snow': 'Não enviado',
    }),
    p('patlas-ctr-p-002-seplag', 'CT-2026-002 — SEPLAG (Downsizing)', pick(6), {
      'patlas-ctr-numero': 'CT-2026-002', 'patlas-ctr-data-ret': '2026-03-04',
      'patlas-ctr-status': 'Itens revisados',
      'patlas-ctr-divergencia': true, 'patlas-ctr-tipo-div': 'Redução de escopo',
      'patlas-ctr-justif-div': 'Cliente reduziu de 300 para 250 USN por restrição orçamentária.',
      'patlas-ctr-extr-pub': false, 'patlas-ctr-int-prot': 'Pendente', 'patlas-ctr-int-snow': 'Pendente',
    }),
    p('patlas-ctr-p-003', 'CT-2026-003 — Publicação pendente', pick(7), {
      'patlas-ctr-numero': 'CT-2026-003', 'patlas-ctr-data-ret': '2026-03-06',
      'patlas-ctr-status': 'Publicação pendente',
      'patlas-ctr-cli-cad': true, 'patlas-ctr-cred-env': false, 'patlas-ctr-rec-conf': true,
      'patlas-ctr-extr-pub': false, 'patlas-ctr-int-prot': 'Confirmado', 'patlas-ctr-int-snow': 'Pendente',
    }),
    p('patlas-ctr-p-004', 'CT-2026-004 — Integração Protheus pendente', pick(7), {
      'patlas-ctr-numero': 'CT-2026-004', 'patlas-ctr-data-ret': '2026-03-08',
      'patlas-ctr-status': 'Integrações pendentes',
      'patlas-ctr-cli-cad': true, 'patlas-ctr-cred-env': true, 'patlas-ctr-rec-conf': true,
      'patlas-ctr-extr-pub': true, 'patlas-ctr-int-prot': 'Erro', 'patlas-ctr-int-snow': 'Confirmado',
    }),
    p('patlas-ctr-p-005', 'CT-2026-005 — Handover pendente', pick(3), {
      'patlas-ctr-numero': 'CT-2026-005', 'patlas-ctr-data-ret': '2026-03-09',
      'patlas-ctr-status': 'Handover gerado',
      'patlas-ctr-cli-cad': true, 'patlas-ctr-cred-env': true, 'patlas-ctr-rec-conf': true,
      'patlas-ctr-extr-pub': true, 'patlas-ctr-int-prot': 'Confirmado', 'patlas-ctr-int-snow': 'Confirmado',
      'patlas-ctr-hand-ger': true,
    }),
    p('patlas-ctr-p-006', 'CT-2026-006 — Kick-off agendado', pick(2), {
      'patlas-ctr-numero': 'CT-2026-006', 'patlas-ctr-data-ret': '2026-03-10',
      'patlas-ctr-status': 'Kick-off agendado',
      'patlas-ctr-cli-cad': true, 'patlas-ctr-cred-env': true, 'patlas-ctr-rec-conf': true,
      'patlas-ctr-extr-pub': true, 'patlas-ctr-int-prot': 'Confirmado', 'patlas-ctr-int-snow': 'Confirmado',
      'patlas-ctr-hand-ger': true, 'patlas-ctr-kick-ag': true,
    }),
  ],
  activeExamplePresetId: 'patlas-ctr-p-001-sema',
}

// ============================================================================
// FORM 23 — ITEM CONTRATADO
// ============================================================================

const formContratoItem = {
  id: F_CTI, name: 'Item Contratado', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Item efetivamente contratado. Pode divergir do item da proposta — exige motivo.',
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
    f('patlas-cti-recor', 'Recorrência', 'textOptions', { options: RECORRENCIA_ITEM }),
    f('patlas-cti-siag', 'Código SIAG usado', 'text'),
    f('patlas-cti-protheus', 'Código Protheus usado', 'text'),
    f('patlas-cti-parceiro', 'Parceiro', 'reference', { linkedFormId: F_ORG }),
    f('patlas-cti-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
  ],
  exampleValuePresets: [
    p('patlas-cti-p-conforme', 'Item contratado conforme proposta', pick(0), {
      'patlas-cti-descricao': 'MTI Workspace Enterprise Standard Ecrypto - 5 TB',
      'patlas-cti-origem': 'Licença', 'patlas-cti-alterado': false,
      'patlas-cti-qtd': 300, 'patlas-cti-valor-unit': 1070.92, 'patlas-cti-valor-total': 321276,
      'patlas-cti-metrica': 'USN', 'patlas-cti-recor': 'Anual',
    }),
    p('patlas-cti-p-downsizing', 'Item com redução de escopo', pick(6), {
      'patlas-cti-descricao': 'MTI Workspace Enterprise Standard Ecrypto - 5 TB',
      'patlas-cti-origem': 'Licença', 'patlas-cti-alterado': true,
      'patlas-cti-motivo': 'Cliente reduziu de 300 para 250 contas.',
      'patlas-cti-qtd': 250, 'patlas-cti-valor-unit': 1070.92, 'patlas-cti-valor-total': 267730,
      'patlas-cti-metrica': 'USN', 'patlas-cti-recor': 'Anual',
    }),
  ],
  activeExamplePresetId: 'patlas-cti-p-conforme',
}

// ============================================================================
// FORM 24 — RECORRÊNCIA DE COBRANÇA
// ============================================================================

const formRecorrencia = {
  id: F_REC, name: 'Recorrência de Cobrança', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Configurada por item contratado. Cobrança real está fora da Fase 1.',
  fields: [
    f('patlas-rec-ctr', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlas-rec-cti', 'Item contratado', 'reference', { required: true, relevance: 'identity', linkedFormId: F_CTI }),
    f('patlas-rec-tipo', 'Tipo de recorrência', 'textOptions', { required: true, relevance: 'highlight', options: RECORRENCIA_ITEM }),
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
      'patlas-rec-tipo': 'Anual', 'patlas-rec-inicio': '2026-03-15',
      'patlas-rec-fim': '2027-03-14', 'patlas-rec-dia': 15,
      'patlas-rec-valor': 321276, 'patlas-rec-status': 'Configurada',
    }),
    p('patlas-rec-p-mensal', 'Mensal pendente', pick(6), {
      'patlas-rec-tipo': 'Mensal', 'patlas-rec-inicio': '2026-04-01',
      'patlas-rec-dia': 5, 'patlas-rec-valor': 12500, 'patlas-rec-status': 'Pendente',
    }),
  ],
  activeExamplePresetId: 'patlas-rec-p-anual',
}

// ============================================================================
// FORM 25 — PUBLICAÇÃO DO CONTRATO
// ============================================================================

const formPublicacao = {
  id: F_PUB, name: 'Publicação do Contrato', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Publicação obrigatória — contrato não finaliza sem ela.',
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
    p('patlas-pub-p-doe', 'DOE-MT — Registrada', pick(0), {
      'patlas-pub-numero': 'DOE-MT 2026-03-12 — Edição 28.945',
      'patlas-pub-data': '2026-03-12',
      'patlas-pub-veiculo': 'Diário Oficial do Estado de Mato Grosso',
      'patlas-pub-status': 'Registrada',
    }),
    p('patlas-pub-p-pendente', 'Pendente de extrato', pick(6), { 'patlas-pub-status': 'Pendente' }),
  ],
  activeExamplePresetId: 'patlas-pub-p-doe',
}

// ============================================================================
// FORM 26 — EVENTO DE INTEGRAÇÃO
// ============================================================================

const formIntegracaoEvento = {
  id: F_IGE, name: 'Evento de Integração', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Protheus/ServiceNow precisam ter status rastreável. Pendente/Erro/Não enviado/Dispensado exige justificativa.',
  fields: [
    f('patlas-ige-sistema', 'Sistema', 'textOptions', { required: true, relevance: 'identity', options: SISTEMA_INTEGRACAO }),
    f('patlas-ige-processo', 'Processo relacionado', 'reference', { required: true, linkedFormId: F_PRP }),
    f('patlas-ige-ctr', 'Contrato relacionado', 'reference', { linkedFormId: F_CTR }),
    f('patlas-ige-tipo', 'Tipo de evento', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_INTEGRACAO_EVENTO }),
    f('patlas-ige-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_INTEGRACAO }),
    f('patlas-ige-data', 'Data do evento', 'date'),
    f('patlas-ige-payload', 'Payload/dados enviados', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
    f('patlas-ige-retorno', 'Retorno recebido', 'text', { size: 'large', textLong: true, relevance: 'advanced' }),
    f('patlas-ige-justif', 'Justificativa', 'text', { size: 'large', textLong: true, spec: 'Obrigatória se status Pendente/Erro/Não enviado/Dispensado.' }),
    f('patlas-ige-tentativas', 'Tentativas', 'number', { size: 'small' }),
    f('patlas-ige-responsavel', 'Responsável', 'reference', { linkedFormId: F_PES }),
  ],
  methods: [
    m('patlas-ige-meth-registrar', 'Registrar evento', 'add_box', 'destaque'),
    m('patlas-ige-meth-reproc', 'Reprocessar', 'replay', 'destaque'),
    m('patlas-ige-meth-dispensar', 'Marcar como dispensado', 'block', 'menu'),
    m('patlas-ige-meth-erro', 'Registrar erro', 'error', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-ige-p-prot-conf', 'Protheus — Confirmado', pick(0), {
      'patlas-ige-sistema': 'Protheus', 'patlas-ige-tipo': 'Cadastro',
      'patlas-ige-status': 'Confirmado', 'patlas-ige-data': '2026-03-09', 'patlas-ige-tentativas': 1,
    }),
    p('patlas-ige-p-snow-erro', 'ServiceNow — Erro', pick(7), {
      'patlas-ige-sistema': 'ServiceNow', 'patlas-ige-tipo': 'Envio',
      'patlas-ige-status': 'Erro', 'patlas-ige-data': '2026-03-10',
      'patlas-ige-justif': 'Timeout em /api/v1/contracts — reenvio agendado.',
      'patlas-ige-tentativas': 2,
    }),
    p('patlas-ige-p-disp', 'CMDB — Dispensado (fora de escopo)', pick(8), {
      'patlas-ige-sistema': 'CMDB futuro', 'patlas-ige-tipo': 'Cadastro',
      'patlas-ige-status': 'Dispensado',
      'patlas-ige-justif': 'CMDB não implementado na Fase 1 — dispensado conforme escopo.',
    }),
    p('patlas-ige-p-prot-pend', 'Protheus — Pendente', pick(6), {
      'patlas-ige-sistema': 'Protheus', 'patlas-ige-tipo': 'Envio',
      'patlas-ige-status': 'Pendente',
      'patlas-ige-justif': 'Aguardando validação de cadastro fiscal.',
    }),
  ],
  activeExamplePresetId: 'patlas-ige-p-prot-conf',
}

// ============================================================================
// FORM 27 — HANDOVER
// ============================================================================

const formHandover = {
  id: F_HOV, name: 'Handover', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Transferência operacional para pós-vendas após contrato consolidado.',
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
      'patlas-hov-numero': 'HOV-2026-001', 'patlas-hov-status': 'Gerado',
      'patlas-hov-data-ger': '2026-03-13',
    }),
    p('patlas-hov-p-aguard', 'Aguardando kick-off', pick(1), {
      'patlas-hov-numero': 'HOV-2026-002', 'patlas-hov-status': 'Aguardando kick-off',
      'patlas-hov-data-ger': '2026-03-13', 'patlas-hov-data-env': '2026-03-14',
    }),
    p('patlas-hov-p-concluido', 'Concluído', pick(2), {
      'patlas-hov-numero': 'HOV-2026-003', 'patlas-hov-status': 'Concluído',
      'patlas-hov-data-ger': '2026-03-10', 'patlas-hov-data-env': '2026-03-11',
    }),
  ],
  activeExamplePresetId: 'patlas-hov-p-aguard',
}

// ============================================================================
// FORM 28 — KICK-OFF
// ============================================================================

const formKickoff = {
  id: F_KOF, name: 'Kick-off', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Kick-off agendado é o marco final operacional da Fase 1.',
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
    m('patlas-kof-meth-reagendar', 'Reagendar', 'event_repeat', 'menu'),
    m('patlas-kof-meth-realizado', 'Marcar como realizado', 'check_circle', 'destaque'),
    m('patlas-kof-meth-cancelar', 'Cancelar', 'cancel', 'menu'),
  ],
  exampleValuePresets: [
    p('patlas-kof-p-agendado', 'Agendado — SEMA', pick(0), {
      'patlas-kof-data': '2026-03-22',
      'patlas-kof-cli': 'Juliana Pereira (SEMA); Ricardo Almeida (SEMA)',
      'patlas-kof-link': 'https://meet.google.com/abc-defg-hij',
      'patlas-kof-pauta': '1) Apresentação dos times. 2) Cronograma. 3) Pontos de atenção. 4) Próximos passos.',
      'patlas-kof-status': 'Agendado',
    }),
    p('patlas-kof-p-aguard', 'Aguardando agendamento', pick(6), { 'patlas-kof-status': 'Aguardando agendamento' }),
    p('patlas-kof-p-realizado', 'Realizado', pick(2), {
      'patlas-kof-data': '2026-03-18', 'patlas-kof-status': 'Realizado',
    }),
  ],
  activeExamplePresetId: 'patlas-kof-p-agendado',
}

// ============================================================================
// FORM 29 — NOTIFICAÇÃO
// ============================================================================

const formNotificacao = {
  id: F_NTF, name: 'Notificação', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Mensagens enviadas durante o ciclo da Fase 1 (e-mail, sistema, portal futuro).',
  fields: [
    f('patlas-ntf-titulo', 'Título', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlas-ntf-tipo', 'Tipo', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_NOTIFICACAO }),
    f('patlas-ntf-dest', 'Destinatário', 'text', { size: 'large', required: true }),
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
    p('patlas-ntf-p-cred', 'Credenciais SEMA — Enviada', pick(0), {
      'patlas-ntf-titulo': 'Credenciais de acesso ao Atlas',
      'patlas-ntf-tipo': 'Cliente', 'patlas-ntf-dest': 'juliana.pereira@sema.mt.gov.br',
      'patlas-ntf-canal': 'E-mail',
      'patlas-ntf-msg': 'Olá, suas credenciais foram criadas. Acesse o Atlas com seu login Gov.br.',
      'patlas-ntf-processo': 'Contrato CT-2026-006', 'patlas-ntf-status': 'Enviada',
      'patlas-ntf-data': '2026-03-15',
    }),
    p('patlas-ntf-p-atr', 'Atraso assinatura DTIC — Pendente', pick(6), {
      'patlas-ntf-titulo': 'Pendência de assinatura — DTIC',
      'patlas-ntf-tipo': 'Assinatura', 'patlas-ntf-dest': 'dtic@mti.mt.gov.br',
      'patlas-ntf-canal': 'E-mail',
      'patlas-ntf-msg': 'A proposta PROP-2026-003 aguarda assinatura DTIC há 3 dias.',
      'patlas-ntf-status': 'Pendente', 'patlas-ntf-tent': 1,
    }),
    p('patlas-ntf-p-pos', 'Pós-vendas notificada', pick(2), {
      'patlas-ntf-titulo': 'Novo contrato disponível — pós-vendas',
      'patlas-ntf-tipo': 'Pós-vendas', 'patlas-ntf-dest': 'posvendas@mti.mt.gov.br',
      'patlas-ntf-canal': 'Sistema',
      'patlas-ntf-msg': 'Handover gerado para o contrato CT-2026-005 — favor agendar kick-off.',
      'patlas-ntf-status': 'Enviada', 'patlas-ntf-data': '2026-03-14',
    }),
  ],
  activeExamplePresetId: 'patlas-ntf-p-cred',
}

// ============================================================================
// FORM 30 — HISTÓRICO DO PROCESSO
// ============================================================================

const formHistorico = {
  id: F_HST, name: 'Histórico do Processo', sectionLayout: 'none', defaultCanvasMode: 'read',
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
    p('patlas-hst-p-criado', 'Proposta criada', pick(0), {
      'patlas-hst-data': '2026-02-05 10:24', 'patlas-hst-processo': 'PROP-2026-001',
      'patlas-hst-tipo': 'Criado', 'patlas-hst-st-novo': 'Em composição',
      'patlas-hst-desc': 'Proposta criada a partir da demanda COT-2026-001 (SEMA).',
    }),
    p('patlas-hst-p-aprovado', 'Proposta aprovada Presidência', pick(2), {
      'patlas-hst-data': '2026-02-24 16:08', 'patlas-hst-processo': 'PROP-2026-005',
      'patlas-hst-tipo': 'Aprovado', 'patlas-hst-st-ant': 'Em assinatura',
      'patlas-hst-st-novo': 'Aprovada',
      'patlas-hst-desc': 'Presidente assinou a proposta — liberada para envio ao cliente.',
    }),
    p('patlas-hst-p-int-erro', 'Integração com erro', pick(7), {
      'patlas-hst-data': '2026-03-10 09:11', 'patlas-hst-processo': 'CT-2026-004',
      'patlas-hst-tipo': 'Erro',
      'patlas-hst-desc': 'Erro de timeout na integração ServiceNow — reenvio agendado.',
    }),
  ],
  activeExamplePresetId: 'patlas-hst-p-criado',
}

// ============================================================================
// FORM 31 — VISÃO OPERACIONAL DA FASE 1  (NOVO em V2 — dashboard)
// ============================================================================

const vopSec = [
  sec('sec-patlas-vop-demanda', 'Filas de demanda', 'inbox'),
  sec('sec-patlas-vop-prop', 'Filas de proposta', 'request_quote'),
  sec('sec-patlas-vop-ass', 'Assinaturas pendentes', 'edit_note'),
  sec('sec-patlas-vop-ctr', 'Filas de contrato', 'gavel'),
  sec('sec-patlas-vop-pos', 'Pós-contrato', 'rocket_launch'),
  sec('sec-patlas-vop-filtros', 'Filtros aplicados', 'filter_alt'),
]

const formVisaoOperacional = {
  id: F_VOP, name: 'Visão Operacional da Fase 1', sectionLayout: 'tabs', sections: vopSec, defaultCanvasMode: 'read',
  metadata: 'Painel gerencial: cards e indicadores das filas e gargalos da Fase 1.',
  fields: [
    // Demandas
    f('patlas-vop-c-dem-recebidas', 'Demandas recebidas', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-demanda' }),
    f('patlas-vop-c-dem-analise', 'Demandas em análise', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-demanda' }),
    f('patlas-vop-c-dem-comp', 'Demandas aguardando complemento', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-demanda' }),
    // Propostas
    f('patlas-vop-c-prp-comp', 'Propostas em composição', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-prop' }),
    f('patlas-vop-c-prp-parc', 'Propostas aguardando parceiro', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-prop' }),
    f('patlas-vop-c-prp-doc', 'Propostas com documento gerado', 'number', { size: 'small', sectionId: 'sec-patlas-vop-prop' }),
    f('patlas-vop-c-prp-ass', 'Propostas em assinatura', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-prop' }),
    f('patlas-vop-c-prp-env', 'Propostas enviadas ao cliente', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-prop' }),
    // Assinaturas
    f('patlas-vop-c-ass-dirc', 'Assinaturas pendentes DIRC', 'number', { size: 'small', sectionId: 'sec-patlas-vop-ass' }),
    f('patlas-vop-c-ass-parc', 'Assinaturas pendentes parceiro', 'number', { size: 'small', sectionId: 'sec-patlas-vop-ass' }),
    f('patlas-vop-c-ass-dtic', 'Assinaturas pendentes DTIC', 'number', { size: 'small', sectionId: 'sec-patlas-vop-ass' }),
    f('patlas-vop-c-ass-pres', 'Assinaturas pendentes Presidência', 'number', { size: 'small', sectionId: 'sec-patlas-vop-ass' }),
    // Contratos
    f('patlas-vop-c-ctr-aguard', 'Contratos aguardando retorno', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-ctr' }),
    f('patlas-vop-c-ctr-recebidos', 'Contratos recebidos', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-ctr' }),
    f('patlas-vop-c-ctr-div', 'Contratos com divergência', 'number', { size: 'small', sectionId: 'sec-patlas-vop-ctr' }),
    // Pós-contrato
    f('patlas-vop-c-cli-pend', 'Clientes pendentes de cadastro formal', 'number', { size: 'small', sectionId: 'sec-patlas-vop-pos' }),
    f('patlas-vop-c-cred-pend', 'Credenciais pendentes', 'number', { size: 'small', sectionId: 'sec-patlas-vop-pos' }),
    f('patlas-vop-c-int-prot', 'Integrações Protheus pendentes/erro', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-pos' }),
    f('patlas-vop-c-int-snow', 'Integrações ServiceNow pendentes/erro', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-pos' }),
    f('patlas-vop-c-pub-pend', 'Publicações pendentes', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-pos' }),
    f('patlas-vop-c-hov-pend', 'Handover pendente', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-pos' }),
    f('patlas-vop-c-kof-pend', 'Kick-off pendente', 'number', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlas-vop-pos' }),
    // Filtros
    f('patlas-vop-f-cliente', 'Filtro: Cliente', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlas-vop-filtros' }),
    f('patlas-vop-f-parceiro', 'Filtro: Parceiro', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlas-vop-filtros' }),
    f('patlas-vop-f-solucao', 'Filtro: Solução', 'textOptions', { options: SOLUCOES, sectionId: 'sec-patlas-vop-filtros' }),
    f('patlas-vop-f-resp', 'Filtro: Responsável DIRC', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlas-vop-filtros' }),
    f('patlas-vop-f-status', 'Filtro: Status', 'textOptions', { options: STATUS_PROPOSTA, sectionId: 'sec-patlas-vop-filtros' }),
    f('patlas-vop-f-periodo-de', 'Filtro: Período (de)', 'date', { sectionId: 'sec-patlas-vop-filtros' }),
    f('patlas-vop-f-periodo-ate', 'Filtro: Período (até)', 'date', { sectionId: 'sec-patlas-vop-filtros' }),
    f('patlas-vop-f-tipo-contr', 'Filtro: Tipo de contratação', 'textOptions', { options: TIPO_CONTRATACAO, sectionId: 'sec-patlas-vop-filtros' }),
    // Identidade
    f('patlas-vop-titulo', 'Visão', 'text', { required: true, relevance: 'identity', sectionId: 'sec-patlas-vop-demanda' }),
  ],
  exampleValuePresets: [
    p('patlas-vop-p-geral', 'Painel — Visão geral (todos os filtros)', pick(0), {
      'patlas-vop-titulo': 'Painel Fase 1 — Visão geral',
      'patlas-vop-c-dem-recebidas': 3, 'patlas-vop-c-dem-analise': 1, 'patlas-vop-c-dem-comp': 1,
      'patlas-vop-c-prp-comp': 1, 'patlas-vop-c-prp-parc': 1, 'patlas-vop-c-prp-doc': 1,
      'patlas-vop-c-prp-ass': 1, 'patlas-vop-c-prp-env': 1,
      'patlas-vop-c-ass-dirc': 1, 'patlas-vop-c-ass-parc': 1, 'patlas-vop-c-ass-dtic': 1, 'patlas-vop-c-ass-pres': 0,
      'patlas-vop-c-ctr-aguard': 1, 'patlas-vop-c-ctr-recebidos': 6, 'patlas-vop-c-ctr-div': 1,
      'patlas-vop-c-cli-pend': 2, 'patlas-vop-c-cred-pend': 1,
      'patlas-vop-c-int-prot': 2, 'patlas-vop-c-int-snow': 1,
      'patlas-vop-c-pub-pend': 1, 'patlas-vop-c-hov-pend': 2, 'patlas-vop-c-kof-pend': 1,
    }),
    p('patlas-vop-p-sema', 'Painel — Filtrado por SEMA', pick(5), {
      'patlas-vop-titulo': 'Painel Fase 1 — Cliente SEMA',
      'patlas-vop-c-dem-recebidas': 1, 'patlas-vop-c-dem-analise': 1,
      'patlas-vop-c-prp-comp': 1, 'patlas-vop-c-prp-ass': 0,
      'patlas-vop-c-prp-env': 1, 'patlas-vop-c-ctr-aguard': 1,
      'patlas-vop-c-ctr-recebidos': 1, 'patlas-vop-c-pub-pend': 0,
    }),
    p('patlas-vop-p-seplag', 'Painel — Filtrado por SEPLAG', pick(2), {
      'patlas-vop-titulo': 'Painel Fase 1 — Cliente SEPLAG',
      'patlas-vop-c-dem-recebidas': 1, 'patlas-vop-c-prp-parc': 1,
      'patlas-vop-c-ctr-recebidos': 1, 'patlas-vop-c-ctr-div': 1,
    }),
    p('patlas-vop-p-gargalos', 'Painel — Gargalos (filas críticas)', pick(7), {
      'patlas-vop-titulo': 'Painel Fase 1 — Gargalos',
      'patlas-vop-c-dem-comp': 1, 'patlas-vop-c-ass-dtic': 1,
      'patlas-vop-c-int-prot': 2, 'patlas-vop-c-int-snow': 1,
      'patlas-vop-c-pub-pend': 1, 'patlas-vop-c-hov-pend': 2, 'patlas-vop-c-kof-pend': 1,
    }),
  ],
  activeExamplePresetId: 'patlas-vop-p-geral',
}

// ============================================================================
// AGREGADO DE FORMS (31)
// ============================================================================

const forms = [
  formOrganizacao, formPessoa, formUsuario, formEstrutura, formCargo,
  formProdutoVigente, formCatalogoLicenca, formCatalogoServico, formCatalogoUniversal, formCatalogoParceria,
  formDemanda, formProposta, formItemProposta,
  formModeloDocumento, formParametroDocumento, formDocumentoGerado,
  formWorkflowModelo, formWorkflowEtapa, formTramiteAssinatura,
  formEnvioProposta, formContratacaoExterna,
  formContrato, formContratoItem, formRecorrencia, formPublicacao, formIntegracaoEvento,
  formHandover, formKickoff,
  formNotificacao, formHistorico,
  formVisaoOperacional,
]

// ============================================================================
// WORKSPACES (6) — fielmente do requisito (seção 5)
// ============================================================================

const workspaces = [
  // 5.1 Administração Atlas
  {
    id: 'ws-patlas-administracao', name: 'Administração Atlas',
    explorerChromeColor: '#1e40af', explorerHeaderForeground: '#ffffff', explorerUserInitials: 'AD',
    packages: [
      { id: 'pkg-patlas-adm-id', name: 'Identidade', classes: [
        cls('cls-patlas-adm-org', 'Organizações', F_ORG),
        cls('cls-patlas-adm-pes', 'Pessoas', F_PES),
        cls('cls-patlas-adm-usr', 'Usuários', F_USR),
      ]},
      { id: 'pkg-patlas-adm-est', name: 'Estrutura MTI', classes: [
        cls('cls-patlas-adm-est', 'Estrutura MTI', F_EST),
      ]},
      { id: 'pkg-patlas-adm-perm', name: 'Cargos / Permissões', classes: [
        cls('cls-patlas-adm-cgf', 'Cargos / Funções', F_CGF),
        cls('cls-patlas-adm-perm', 'Permissões por perfil/cargo', F_CGF),
      ]},
      { id: 'pkg-patlas-adm-aud', name: 'Auditoria e comunicação', classes: [
        cls('cls-patlas-adm-hst', 'Histórico do processo', F_HST),
        cls('cls-patlas-adm-ntf', 'Notificações', F_NTF),
      ]},
    ],
  },
  // 5.2 Catálogo Comercial
  {
    id: 'ws-patlas-catalogo', name: 'Catálogo Comercial',
    explorerChromeColor: '#0d9488', explorerHeaderForeground: '#ffffff', explorerUserInitials: 'CT',
    packages: [
      { id: 'pkg-patlas-cat-pv', name: 'Produtos vigentes', classes: [
        cls('cls-patlas-cat-pv', 'Produtos vigentes', F_PV),
      ]},
      { id: 'pkg-patlas-cat-lic', name: 'Catálogo de Licenças', classes: [
        cls('cls-patlas-cat-lic', 'Catálogo de Licenças', F_LIC),
      ]},
      { id: 'pkg-patlas-cat-srv', name: 'Catálogo de Serviços', classes: [
        cls('cls-patlas-cat-srv', 'Catálogo de Serviços', F_SRV),
      ]},
      { id: 'pkg-patlas-cat-uni', name: 'Catálogo Universal', classes: [
        cls('cls-patlas-cat-uni', 'Catálogo Universal', F_UNI),
      ]},
      { id: 'pkg-patlas-cat-parc', name: 'Catálogos por Parceria', classes: [
        cls('cls-patlas-cat-parc', 'Catálogo por Parceria', F_CPP),
      ]},
      { id: 'pkg-patlas-cat-bloq', name: 'Itens bloqueados / paralisados', classes: [
        cls('cls-patlas-cat-pv-bloq', 'Produtos paralisados', F_PV, ['patlas-pv-p-paralisado']),
        cls('cls-patlas-cat-lic-bloq', 'Licenças paralisadas', F_LIC, ['patlas-lic-p-workspace-5gb']),
        cls('cls-patlas-cat-srv-bloq', 'Serviços paralisados', F_SRV, ['patlas-srv-p-paralisado']),
      ]},
    ],
  },
  // 5.3 DIRC / Propostas
  {
    id: 'ws-patlas-dirc-propostas', name: 'DIRC / Propostas',
    explorerChromeColor: '#7c3aed', explorerHeaderForeground: '#ffffff', explorerUserInitials: 'DI',
    packages: [
      { id: 'pkg-patlas-dirc-dem', name: 'Demandas', classes: [
        cls('cls-patlas-dirc-dem', 'Demandas', F_DEM),
      ]},
      { id: 'pkg-patlas-dirc-prp', name: 'Propostas', classes: [
        cls('cls-patlas-dirc-prp', 'Propostas', F_PRP),
        cls('cls-patlas-dirc-pri', 'Itens da proposta', F_PRI),
      ]},
      { id: 'pkg-patlas-dirc-doc', name: 'Documentos', classes: [
        cls('cls-patlas-dirc-dtp', 'Modelos de documento', F_DTP),
        cls('cls-patlas-dirc-dpm', 'Parâmetros de documento', F_DPM),
        cls('cls-patlas-dirc-dgd', 'Documentos gerados', F_DGD),
      ]},
      { id: 'pkg-patlas-dirc-parc-an', name: 'Análise do parceiro', classes: [
        cls('cls-patlas-dirc-parc-an', 'Propostas aguardando parceiro', F_PRP, ['patlas-prp-p-2026-002']),
      ]},
      { id: 'pkg-patlas-dirc-envio', name: 'Envio ao cliente', classes: [
        cls('cls-patlas-dirc-env', 'Envios da proposta', F_ENV),
      ]},
    ],
  },
  // 5.4 Parceiro
  {
    id: 'ws-patlas-parceiro', name: 'Parceiro',
    explorerChromeColor: '#b45309', explorerHeaderForeground: '#ffffff', explorerUserInitials: 'PA',
    packages: [
      { id: 'pkg-patlas-parc-dem', name: 'Demandas vinculadas', classes: [
        cls('cls-patlas-parc-dem', 'Demandas vinculadas', F_DEM, ['patlas-dem-p-002']),
      ]},
      { id: 'pkg-patlas-parc-prp', name: 'Propostas para análise', classes: [
        cls('cls-patlas-parc-prp', 'Propostas vinculadas', F_PRP, ['patlas-prp-p-2026-002']),
      ]},
      { id: 'pkg-patlas-parc-it', name: 'Itens de catálogo da parceria', classes: [
        cls('cls-patlas-parc-it', 'Itens da parceria', F_PRI),
        cls('cls-patlas-parc-cpp', 'Catálogos por parceria', F_CPP),
      ]},
      { id: 'pkg-patlas-parc-ass', name: 'Assinaturas pendentes', classes: [
        cls('cls-patlas-parc-ass', 'Assinaturas do parceiro', F_TRA, ['patlas-tra-p-parc-ass', 'patlas-tra-p-disp']),
      ]},
    ],
  },
  // 5.5 Assinaturas e Contratos
  {
    id: 'ws-patlas-assinaturas-contratos', name: 'Assinaturas e Contratos',
    explorerChromeColor: '#0c1ba8', explorerHeaderForeground: '#ffffff', explorerUserInitials: 'AC',
    packages: [
      { id: 'pkg-patlas-ac-wf', name: 'Workflows', classes: [
        cls('cls-patlas-ac-wfm', 'Modelos de workflow', F_WFM),
        cls('cls-patlas-ac-wfe', 'Etapas de workflow', F_WFE),
      ]},
      { id: 'pkg-patlas-ac-tra', name: 'Trâmites de assinatura', classes: [
        cls('cls-patlas-ac-tra', 'Trâmites de assinatura', F_TRA),
      ]},
      { id: 'pkg-patlas-ac-ctr', name: 'Contratos', classes: [
        cls('cls-patlas-ac-ext', 'Contratação externa', F_EXT),
        cls('cls-patlas-ac-ctr', 'Contratos recebidos', F_CTR),
        cls('cls-patlas-ac-cti', 'Itens contratados', F_CTI),
      ]},
      { id: 'pkg-patlas-ac-rec', name: 'Recorrência', classes: [
        cls('cls-patlas-ac-rec', 'Recorrências de cobrança', F_REC),
      ]},
      { id: 'pkg-patlas-ac-pub', name: 'Publicação', classes: [
        cls('cls-patlas-ac-pub', 'Publicações', F_PUB),
      ]},
      { id: 'pkg-patlas-ac-int', name: 'Integrações', classes: [
        cls('cls-patlas-ac-ige', 'Eventos de integração', F_IGE),
      ]},
      { id: 'pkg-patlas-ac-hand', name: 'Handover', classes: [
        cls('cls-patlas-ac-hov', 'Handovers', F_HOV),
      ]},
      { id: 'pkg-patlas-ac-kof', name: 'Kick-off', classes: [
        cls('cls-patlas-ac-kof', 'Kick-offs', F_KOF),
      ]},
    ],
  },
  // 5.6 Visão Operacional
  {
    id: 'ws-patlas-visao-operacional', name: 'Visão Operacional',
    explorerChromeColor: '#059669', explorerHeaderForeground: '#ffffff', explorerUserInitials: 'VO',
    packages: [
      { id: 'pkg-patlas-vo-painel', name: 'Painel da Fase 1', classes: [
        cls('cls-patlas-vo-painel', 'Visão Operacional da Fase 1', F_VOP),
      ]},
      { id: 'pkg-patlas-vo-dem', name: 'Filas de demanda', classes: [
        cls('cls-patlas-vo-dem', 'Demandas recebidas', F_DEM),
      ]},
      { id: 'pkg-patlas-vo-prp', name: 'Filas de proposta', classes: [
        cls('cls-patlas-vo-prp-comp', 'Propostas em composição', F_PRP, ['patlas-prp-p-2026-001']),
        cls('cls-patlas-vo-prp-parc', 'Aguardando parceiro', F_PRP, ['patlas-prp-p-2026-002']),
        cls('cls-patlas-vo-prp-ass', 'Em assinatura', F_PRP, ['patlas-prp-p-2026-003']),
        cls('cls-patlas-vo-prp-cli', 'Enviadas ao cliente', F_PRP, ['patlas-prp-p-2026-005']),
      ]},
      { id: 'pkg-patlas-vo-ctr', name: 'Filas de contrato', classes: [
        cls('cls-patlas-vo-ctr-aguard', 'Aguardando retorno', F_EXT, ['patlas-ext-p-aguardando']),
        cls('cls-patlas-vo-ctr-rec', 'Recebidos', F_CTR, ['patlas-ctr-p-001-sema', 'patlas-ctr-p-002-seplag']),
        cls('cls-patlas-vo-pub-pend', 'Publicações pendentes', F_PUB, ['patlas-pub-p-pendente']),
        cls('cls-patlas-vo-int-erro', 'Integrações com erro', F_IGE, ['patlas-ige-p-snow-erro']),
      ]},
      { id: 'pkg-patlas-vo-fim', name: 'Encerramento', classes: [
        cls('cls-patlas-vo-hov', 'Handover pendente', F_HOV, ['patlas-hov-p-gerado', 'patlas-hov-p-aguard']),
        cls('cls-patlas-vo-kof', 'Kick-off pendente', F_KOF, ['patlas-kof-p-aguard']),
      ]},
    ],
  },
]

// ============================================================================
// FLOW — 22 etapas (com tipo-contratacao + snapshot)
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
  <p style="font-size:1.05rem;line-height:1.55;color:#334155;">Jornada completa do Atlas: identificação da demanda → análise DIRC → tipo de contratação → catálogo → snapshot → proposta → parceiro → documento → workflow → assinaturas (DIRC, Parceiro, DTIC, Complementar, Presidência) → envio ao cliente → contratação externa → contrato recebido → revisão de itens → cadastro do cliente → integrações → recorrência → publicação → handover → kick-off.</p>
  <h2 style="font-size:1.1rem;margin:24px 0 8px 0;color:#1e40af;">Premissas obrigatórias</h2>
  <ul style="line-height:1.7;color:#334155;">
    <li><strong>Cliente NÃO monta proposta</strong> na Fase 1 — DIRC ou parceiro autorizado.</li>
    <li><strong>Cadastro formal do cliente</strong> ocorre <em>depois</em> do contrato recebido.</li>
    <li><strong>Snapshot do catálogo</strong> é obrigatório no item da proposta.</li>
    <li><strong>Publicação do contrato</strong> é mandatória.</li>
    <li><strong>Integrações</strong> precisam ter status rastreável (Não enviado/Pendente/Erro/Dispensado exigem justificativa).</li>
    <li><strong>Assinatura por cargo/função</strong>, nunca por pessoa fixa.</li>
    <li><strong>Kick-off agendado</strong> = marco final operacional.</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:24px 0 8px 0;color:#b45309;">Fora desta Fase 1</h2>
  <p style="color:#475569;">Portal completo do cliente, OS operacional, execução de serviço, medição de consumo, CMDB, faturamento completo, NF, DAR, pagamento, RAER, BI/Qlik/ClickSense.</p>
</div>`,
    },
    {
      id: 'step-patlas-f1-demanda', title: 'Registrar demanda', type: 'class', linkedFormId: F_DEM,
      classPresentationTitle: 'Registrar demanda',
      classPresentationDescription: 'A demanda chega por canal externo, parceiro ou portal futuro. DIRC ou parceiro autorizado registra.',
      classMethodNavigateStepIds: {
        'patlas-dem-meth-iniciar': 'step-patlas-f1-analise-dirc',
        'patlas-dem-meth-proposta': 'step-patlas-f1-tipo-contratacao',
      },
    },
    {
      id: 'step-patlas-f1-analise-dirc', title: 'Análise inicial da DIRC', type: 'class', linkedFormId: F_DEM,
      classPresentationTitle: 'Análise da DIRC',
      classPresentationDescription: 'Prosseguir, solicitar complemento, enviar ao parceiro, rejeitar ou cancelar.',
      classMethodNavigateStepIds: {
        'patlas-dem-meth-comp': 'step-patlas-f1-demanda',
        'patlas-dem-meth-parceiro': 'step-patlas-f1-parceiro',
        'patlas-dem-meth-proposta': 'step-patlas-f1-tipo-contratacao',
      },
    },
    {
      id: 'step-patlas-f1-tipo-contratacao', title: 'Definir tipo de contratação', type: 'class', linkedFormId: F_PRP,
      classPresentationTitle: 'Tipo de contratação',
      classPresentationDescription: 'Objeto específico (Tipo 1), Catálogo do produto (Tipo 2) ou Catálogo geral/ecossistema (Tipo 3). Define os códigos SIAG/Protheus usados.',
      classMethodNavigateStepIds: { 'patlas-prp-meth-montar': 'step-patlas-f1-catalogo' },
    },
    {
      id: 'step-patlas-f1-catalogo', title: 'Selecionar produto, licença ou serviço', type: 'workspace',
      linkedWorkspaceId: 'ws-patlas-catalogo', assigneeRole: 'Analista DIRC',
      workspacePresentationDescription: 'Catálogo Comercial: Produtos vigentes, Licenças, Serviços, Catálogo Universal e Catálogos por Parceria. Paralisados/suspensos só para consulta.',
      workspaceMethodNavigateStepIds: {
        'pkg-patlas-cat-pv::cls-patlas-cat-pv::patlas-pv-meth-selecionar': 'step-patlas-f1-snapshot',
        'pkg-patlas-cat-lic::cls-patlas-cat-lic::patlas-lic-meth-selecionar': 'step-patlas-f1-snapshot',
        'pkg-patlas-cat-srv::cls-patlas-cat-srv::patlas-srv-meth-selecionar': 'step-patlas-f1-snapshot',
        'pkg-patlas-cat-uni::cls-patlas-cat-uni::patlas-uni-meth-selecionar': 'step-patlas-f1-snapshot',
        'pkg-patlas-cat-parc::cls-patlas-cat-parc::patlas-cpp-meth-selecionar': 'step-patlas-f1-snapshot',
      },
    },
    {
      id: 'step-patlas-f1-snapshot', title: 'Guardar dados dos itens na proposta', type: 'class', linkedFormId: F_PRI,
      classPresentationTitle: 'Snapshot do catálogo',
      classPresentationDescription: 'O item da proposta congela todos os dados do catálogo (descrição, métrica, valor, códigos, parceria). Alteração futura no catálogo NÃO impacta proposta já criada.',
    },
    {
      id: 'step-patlas-f1-proposta', title: 'Montar proposta', type: 'class', linkedFormId: F_PRP,
      classPresentationTitle: 'Composição da proposta',
      classPresentationDescription: 'DIRC monta a proposta a partir dos snapshots. Item manual exige justificativa. Valor total = quantidade × valor unitário.',
      classMethodNavigateStepIds: {
        'patlas-prp-meth-montar': 'step-patlas-f1-catalogo',
        'patlas-prp-meth-manual': 'step-patlas-f1-snapshot',
        'patlas-prp-meth-gerar': 'step-patlas-f1-documento',
        'patlas-prp-meth-parceiro': 'step-patlas-f1-parceiro',
        'patlas-prp-meth-wf': 'step-patlas-f1-workflow',
      },
    },
    {
      id: 'step-patlas-f1-parceiro', title: 'Análise do parceiro', type: 'bpmnActivity',
      bpmnTaskType: 'userTask', bpmnActivityKey: 'Análise do parceiro',
      bpmnDescription: 'Quando há parceiro envolvido, a proposta vai para análise do parceiro antes das assinaturas internas.',
      assigneeRole: 'Parceiro vinculado',
      assigneeRoleDetail: 'Parceiro só vê processos vinculados à própria organização.',
      bpmnRuleList: [
        'Sem parceiro: etapa dispensada.',
        'Parceiro pode aceitar, ajustar (volta para proposta) ou rejeitar.',
        'Parceiro inativo/suspenso NÃO pode ser indicado.',
      ],
      bpmnPossiblePaths: [
        { key: 'Aceito pelo parceiro', value: 'step-patlas-f1-documento' },
        { key: 'Ajuste solicitado', value: 'step-patlas-f1-snapshot' },
        { key: 'Sem parceiro (dispensado)', value: 'step-patlas-f1-documento' },
      ],
      bpmnSla: '5 dias úteis',
      bpmnSlaIfExceeded: 'Notifica DIRC e abre alerta na Visão Operacional.',
    },
    {
      id: 'step-patlas-f1-documento', title: 'Gerar documento da proposta', type: 'class', linkedFormId: F_DGD,
      classPresentationTitle: 'Documento gerado',
      classPresentationDescription: 'A proposta vira documento a partir de um modelo publicado. Parâmetros são preenchidos pelos dados da proposta.',
      classMethodNavigateStepIds: { 'patlas-dgd-meth-assinar': 'step-patlas-f1-workflow' },
    },
    {
      id: 'step-patlas-f1-workflow', title: 'Submeter ao workflow', type: 'class', linkedFormId: F_WFM,
      classPresentationTitle: 'Workflow de aprovação',
      classPresentationDescription: 'Workflow padrão: DIRC/Parceiro → DTIC → Complementar (DAFI, se exigido) → Presidência → envio.',
      classMethodNavigateStepIds: { 'patlas-wfm-meth-ativar': 'step-patlas-f1-assinaturas' },
    },
    {
      id: 'step-patlas-f1-assinaturas', title: 'Assinaturas', type: 'class', linkedFormId: F_TRA,
      classPresentationTitle: 'Trâmites de assinatura',
      classPresentationDescription: 'Cada trâmite é por cargo/função. Ajuste/reprovação volta para revisão da proposta/documento.',
      classMethodNavigateStepIds: {
        'patlas-tra-meth-assinar': 'step-patlas-f1-envio-cliente',
        'patlas-tra-meth-ajuste': 'step-patlas-f1-proposta',
        'patlas-tra-meth-reprovar': 'step-patlas-f1-proposta',
        'patlas-tra-meth-dispensar': 'step-patlas-f1-envio-cliente',
      },
    },
    {
      id: 'step-patlas-f1-envio-cliente', title: 'Enviar proposta ao cliente', type: 'class', linkedFormId: F_ENV,
      classPresentationTitle: 'Envio ao cliente',
      classPresentationDescription: 'Após aprovação no workflow, a proposta é enviada formalmente ao cliente.',
      classMethodNavigateStepIds: { 'patlas-env-meth-enviar': 'step-patlas-f1-externo' },
    },
    {
      id: 'step-patlas-f1-externo', title: 'Apoio à contratação externa', type: 'class', linkedFormId: F_EXT,
      classPresentationTitle: 'Contratação externa',
      classPresentationDescription: 'Atlas acompanha o status externo (cliente em contratação, documentação solicitada, etc) e registra apoios prestados.',
      classMethodNavigateStepIds: { 'patlas-ext-meth-receber': 'step-patlas-f1-contrato' },
    },
    {
      id: 'step-patlas-f1-contrato', title: 'Registrar contrato recebido', type: 'class', linkedFormId: F_CTR,
      classPresentationTitle: 'Contrato recebido',
      classPresentationDescription: 'Anexo + data de retorno obrigatórios. Divergência exige tipo e justificativa.',
      classMethodNavigateStepIds: {
        'patlas-ctr-meth-registrar': 'step-patlas-f1-itens-contratados',
        'patlas-ctr-meth-revisar': 'step-patlas-f1-itens-contratados',
        'patlas-ctr-meth-cliente': 'step-patlas-f1-cliente',
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
      id: 'step-patlas-f1-itens-contratados', title: 'Revisar itens contratados', type: 'class', linkedFormId: F_CTI,
      classPresentationTitle: 'Itens contratados',
      classPresentationDescription: 'Comparativo proposta × contrato. Cada divergência precisa de motivo.',
    },
    {
      id: 'step-patlas-f1-cliente', title: 'Cadastrar cliente e credenciais', type: 'class', linkedFormId: F_USR,
      classPresentationTitle: 'Cadastro formal do cliente',
      classPresentationDescription: 'O cadastro formal e o envio de credenciais ocorrem SOMENTE após o contrato recebido.',
      classMethodNavigateStepIds: { 'patlas-usr-meth-cred': 'step-patlas-f1-integracoes' },
    },
    {
      id: 'step-patlas-f1-integracoes', title: 'Registrar integrações', type: 'class', linkedFormId: F_IGE,
      classPresentationTitle: 'Eventos de integração',
      classPresentationDescription: 'Protheus, ServiceNow e sistemas futuros — status rastreável. Justificativa obrigatória para Pendente/Erro/Não enviado/Dispensado.',
    },
    {
      id: 'step-patlas-f1-recorrencia', title: 'Configurar recorrências', type: 'class', linkedFormId: F_REC,
      classPresentationTitle: 'Recorrência de cobrança',
      classPresentationDescription: 'Mensal, anual, sob demanda, por execução, única, pro-rata — por item contratado.',
    },
    {
      id: 'step-patlas-f1-publicacao', title: 'Registrar publicação', type: 'class', linkedFormId: F_PUB,
      classPresentationTitle: 'Publicação do contrato',
      classPresentationDescription: 'Extrato e data são MANDATÓRIOS. Contrato não finaliza sem publicação.',
    },
    {
      id: 'step-patlas-f1-handover', title: 'Gerar handover', type: 'class', linkedFormId: F_HOV,
      classPresentationTitle: 'Handover',
      classPresentationDescription: 'Transferência operacional para pós-vendas com dados consolidados de proposta e contrato.',
      classMethodNavigateStepIds: {
        'patlas-hov-meth-enviar': 'step-patlas-f1-kickoff',
        'patlas-hov-meth-kof': 'step-patlas-f1-kickoff',
      },
    },
    {
      id: 'step-patlas-f1-kickoff', title: 'Agendar kick-off', type: 'class', linkedFormId: F_KOF,
      classPresentationTitle: 'Kick-off',
      classPresentationDescription: 'Reunião com MTI, cliente e parceiro. Kick-off agendado encerra operacionalmente a Fase 1.',
      classMethodNavigateStepIds: {
        'patlas-kof-meth-agendar': 'step-patlas-f1-fim',
        'patlas-kof-meth-realizado': 'step-patlas-f1-fim',
      },
    },
    {
      id: 'step-patlas-f1-fim', title: 'Fim operacional da Fase 1', type: 'html',
      htmlPresentationShowHeader: true, htmlPresentationHeaderTitle: 'Fase 1 encerrada',
      htmlContent: `<div style="padding:32px 48px;max-width:920px;margin:0 auto;font-family:'Inter',system-ui,sans-serif;color:#0f172a;">
  <h1 style="font-size:1.85rem;margin:0 0 12px 0;color:#059669;">Fase 1 concluída</h1>
  <p style="font-size:1.05rem;line-height:1.55;color:#334155;">A jornada da demanda ao kick-off foi demonstrada. A partir daqui o processo entra em <strong>operação contínua</strong> (cobrança recorrente, sustentação, medição de consumo, faturamento, BI), <em>fora do escopo</em> desta Fase 1.</p>
  <h2 style="font-size:1.1rem;margin:24px 0 8px 0;color:#1e40af;">O que ficou pronto</h2>
  <ul style="line-height:1.7;color:#334155;">
    <li>Identidade (organizações, pessoas, usuários, estrutura MTI, cargos/funções).</li>
    <li>Catálogo comercial completo (produtos vigentes, licenças, serviços, universal, por parceria).</li>
    <li>Demanda → análise DIRC → composição → workflow.</li>
    <li>Assinaturas DIRC, Parceiro, DTIC, Complementar (DAFI), Presidência — por cargo/função.</li>
    <li>Envio ao cliente, contratação externa, contrato recebido.</li>
    <li>Cadastro do cliente, credenciais, integrações, recorrência, publicação.</li>
    <li>Handover e kick-off — marco final operacional.</li>
  </ul>
  <h2 style="font-size:1.1rem;margin:24px 0 8px 0;color:#b45309;">Fora desta Fase 1</h2>
  <p style="color:#475569;">Portal completo do cliente, OS, RAER, NF, DAR, pagamento, faturamento completo, BI, CMDB, ClickSense, medição de consumo.</p>
</div>`,
    },
  ],
}

const flowManualDetalhado = buildFlowDetalhado({
  F_ORG, F_PES, F_USR, F_EST, F_CGF,
  F_PV, F_LIC, F_SRV, F_UNI, F_CPP,
  F_DEM, F_PRP, F_PRI,
  F_DTP, F_DPM, F_DGD,
  F_WFM, F_WFE, F_TRA,
  F_ENV, F_EXT,
  F_CTR, F_CTI, F_REC, F_PUB, F_IGE,
  F_HOV, F_KOF,
  F_NTF, F_HST,
  F_VOP,
})

const flows = [flow, flowManualDetalhado]

// ============================================================================
// CLASS-GROUPS
// ============================================================================

const G_IDENTIDADE = 'grp-patlas-v2-identidade'
const G_CATALOGO = 'grp-patlas-v2-catalogo'
const G_PROPOSTA = 'grp-patlas-v2-proposta'
const G_DOCWF = 'grp-patlas-v2-doc-wf'
const G_ENVIO = 'grp-patlas-v2-envio'
const G_CONTRATO = 'grp-patlas-v2-contrato'
const G_OPS = 'grp-patlas-v2-ops'
const G_PAINEL = 'grp-patlas-v2-painel'

const classGroups = {
  groups: [
    { id: G_IDENTIDADE, name: 'Identidade e administração' },
    { id: G_CATALOGO, name: 'Catálogo comercial' },
    { id: G_PROPOSTA, name: 'Demanda e proposta' },
    { id: G_DOCWF, name: 'Documento e workflow' },
    { id: G_ENVIO, name: 'Envio e contratação externa' },
    { id: G_CONTRATO, name: 'Contrato e operacionalização' },
    { id: G_OPS, name: 'Notificações e histórico' },
    { id: G_PAINEL, name: 'Painel da Fase 1' },
  ],
  assignments: {
    [F_ORG]: G_IDENTIDADE, [F_PES]: G_IDENTIDADE, [F_USR]: G_IDENTIDADE,
    [F_EST]: G_IDENTIDADE, [F_CGF]: G_IDENTIDADE,
    [F_PV]: G_CATALOGO, [F_LIC]: G_CATALOGO, [F_SRV]: G_CATALOGO,
    [F_UNI]: G_CATALOGO, [F_CPP]: G_CATALOGO,
    [F_DEM]: G_PROPOSTA, [F_PRP]: G_PROPOSTA, [F_PRI]: G_PROPOSTA,
    [F_DTP]: G_DOCWF, [F_DPM]: G_DOCWF, [F_DGD]: G_DOCWF,
    [F_WFM]: G_DOCWF, [F_WFE]: G_DOCWF, [F_TRA]: G_DOCWF,
    [F_ENV]: G_ENVIO, [F_EXT]: G_ENVIO,
    [F_CTR]: G_CONTRATO, [F_CTI]: G_CONTRATO, [F_REC]: G_CONTRATO,
    [F_PUB]: G_CONTRATO, [F_IGE]: G_CONTRATO, [F_HOV]: G_CONTRATO, [F_KOF]: G_CONTRATO,
    [F_NTF]: G_OPS, [F_HST]: G_OPS,
    [F_VOP]: G_PAINEL,
  },
  memberOrderByGroup: {
    [G_IDENTIDADE]: [F_ORG, F_PES, F_USR, F_EST, F_CGF],
    [G_CATALOGO]: [F_PV, F_LIC, F_SRV, F_UNI, F_CPP],
    [G_PROPOSTA]: [F_DEM, F_PRP, F_PRI],
    [G_DOCWF]: [F_DTP, F_DPM, F_DGD, F_WFM, F_WFE, F_TRA],
    [G_ENVIO]: [F_ENV, F_EXT],
    [G_CONTRATO]: [F_CTR, F_CTI, F_REC, F_PUB, F_IGE, F_HOV, F_KOF],
    [G_OPS]: [F_NTF, F_HST],
    [G_PAINEL]: [F_VOP],
  },
}

// ============================================================================
// ESCRITA
// ============================================================================

if (!fs.existsSync(epicDir)) fs.mkdirSync(epicDir, { recursive: true })

const formsPath = path.join(epicDir, 'forms.json')
const workspacesPath = path.join(epicDir, 'workspaces.json')
const flowsPath = path.join(epicDir, 'flows.json')
const classGroupsPath = path.join(epicDir, 'class-groups.json')

fs.writeFileSync(formsPath, JSON.stringify(forms, null, 2) + '\n', 'utf-8')
fs.writeFileSync(workspacesPath, JSON.stringify(workspaces, null, 2) + '\n', 'utf-8')
fs.writeFileSync(flowsPath, JSON.stringify(flows, null, 2) + '\n', 'utf-8')
fs.writeFileSync(classGroupsPath, JSON.stringify(classGroups, null, 2) + '\n', 'utf-8')

const totalPresets = forms.reduce((acc, fo) => acc + (fo.exampleValuePresets?.length ?? 0), 0)
const totalMethods = forms.reduce((acc, fo) => acc + (fo.methods?.length ?? 0), 0)
const totalFields = forms.reduce((acc, fo) => acc + fo.fields.length, 0)
const totalPackages = workspaces.reduce((acc, w) => acc + (w.packages?.length ?? 0), 0)
const totalClasses = workspaces.reduce((acc, w) => acc + (w.packages ?? []).reduce((a, pk) => a + (pk.classes?.length ?? 0), 0), 0)

const totalSteps = flows.reduce((acc, fl) => acc + (fl.steps?.length ?? 0), 0)

console.log(`Atlas V2 — Fase 1 gerado em ${epicDir}`)
console.log(`  • forms.json          → ${forms.length} classes / ${totalFields} campos / ${totalMethods} métodos / ${totalPresets} presets`)
console.log(`  • workspaces.json     → ${workspaces.length} workspaces / ${totalPackages} pacotes / ${totalClasses} classes vinculadas`)
console.log(`  • flows.json          → ${flows.length} flows / ${totalSteps} etapas`)
flows.forEach((fl) => console.log(`      - ${fl.name} (${fl.steps.length} etapas)`))
console.log(`  • class-groups.json   → ${classGroups.groups.length} grupos`)
