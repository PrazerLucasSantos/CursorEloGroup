/**
 * Atlas V4 — Fase 1
 *
 * Gera 4 arquivos do épico:
 *   data/subprojects/atlas-v4/epics/atlas-v4-fase1/
 *     - forms.json           (38 classes)
 *     - workspaces.json      (8 workspaces)
 *     - flows.json           (1 flow, ~30 etapas)
 *     - class-groups.json    (10 grupos)
 *
 * Regenerar:   node scripts/build-atlas-v4-fase1.mjs
 *
 * Convenções:
 *   - IDs form-patlasv4-* / campos patlasv4-*
 *   - Permissões em entidade Permissão do Cargo (separada do Cargo/Função)
 *   - Domínios configuráveis; workflow não fixa DIRC/DTIC/Presidência
 *   - TIPO_ORGANIZACAO: MTI, Cliente, Parceiro
 *   - Status: textOptions + relevance:'highlight'
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PERMISSOES_CARGO_LABELS, MODULOS_PERMISSAO, PERMISSOES_CARGO_V4 } from './data/atlas-v4-permissoes.mjs'
import { buildFlowApresentacao } from './data/atlas-v4-flow-apresentacao.mjs'
import {
  DIRC_PV,
  DIRC_LIC,
  DIRC_SRV,
  DIRC_UNI,
  DIRC_PRP,
  DIRC_ORG_CLIENTES,
  DIRC_CPP,
  DIRC_ICP,
  cppPresetValues,
  toPresets,
} from './data/atlas-v4-dirc-presets.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const subprojectDir = path.join(__dirname, '../data/subprojects/atlas-v4')
const epicDir = path.join(subprojectDir, 'epics/atlas-v4-fase1')

// ============================================================================
// VALIDAÇÕES GLOBAIS (25) — documentadas em spec dos formulários
// ============================================================================

const VALIDACOES = {
  V01: 'V01 — CNPJ obrigatório e válido para organizações Cliente e Parceiro.',
  V02: 'V02 — CPF obrigatório e válido para toda pessoa cadastrada.',
  V03: 'V03 — Matrícula MTI obrigatória quando vínculo funcional é MTI.',
  V04: 'V04 — Setor/lotação obrigatório para pessoa com vínculo MTI.',
  V05: 'V05 — Permissão efetiva do usuário derivada do cargo — somente leitura.',
  V06: 'V06 — Snapshot de item imutável após geração; não permite alteração de valores.',
  V07: 'V07 — Valor unitário protegido no item da proposta (read-only, vem do snapshot).',
  V08: 'V08 — Publicação do contrato obrigatória antes do encerramento operacional.',
  V09: 'V09 — Anexo do contrato (arquivo) obrigatório no registro.',
  V10: 'V10 — Número da publicação obrigatório ao registrar publicação.',
  V11: 'V11 — Template de documento obrigatório para gerar documento da proposta.',
  V12: 'V12 — Versão da proposta obrigatória em toda proposta comercial.',
  V13: 'V13 — Tipo de contratação (1/2/3) define quais códigos comerciais aplicam.',
  V14: 'V14 — Sem parceiro envolvido: blocos de assinatura parceiro são dispensados.',
  V15: 'V15 — Pendências bloqueantes impedem avanço da instância de workflow.',
  V16: 'V16 — Setor/lotação vinculado exclusivamente à organização MTI.',
  V17: 'V17 — Permissões configuradas na entidade Permissão do Cargo, não no cargo.',
  V18: 'V18 — Apenas domínios e itens de domínio ativos disponíveis para seleção.',
  V19: 'V19 — Item de domínio respeita aplicabilidade (MTI/Cliente/Parceiro).',
  V20: 'V20 — Matrícula MTI validada contra Protheus (método dedicado).',
  V21: 'V21 — Credenciais de acesso enviadas após cadastro formal do cliente.',
  V22: 'V22 — Integrações Protheus, ServiceNow e SIAG rastreáveis por contrato.',
  V23: 'V23 — Handover gerado antes de solicitar kick-off.',
  V24: 'V24 — Workflow configurável por tipo de processo — sequência não fixa no código.',
  V25: 'V25 — Código comercial vinculado à origem do item (PV, licença, serviço, catálogo parceria).',
}

// ============================================================================
// CONSTANTES DE DOMÍNIO
// ============================================================================

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const ESFERAS_PODER = ['Federal', 'Estadual', 'Municipal', 'Autarquia', 'Empresa pública', 'Outro']
const TIPOS_ORGANIZACAO = ['MTI', 'Cliente', 'Parceiro']
const STATUS_ORG = ['Ativa', 'Inativa']
const APLICAVEL_DOMINIO = ['MTI', 'Cliente', 'Parceiro', 'Todos']

const TIPOS_SETOR = [
  'Presidência', 'Diretoria', 'Gerência de Unidade', 'Gerência Operacional',
  'Unidade', 'Área Operacional', 'Outro',
]
const STATUS_SETOR = ['Ativo', 'Inativo']
const NIVEIS_SETOR = ['1', '2', '3', '4', '5']

const TIPO_CARGO = [
  'Presidente', 'Diretor', 'Gerente', 'Analista', 'Assinante',
  'Representante parceiro', 'Pós-vendas', 'Cliente', 'Outro',
]
const PAPEL_ASSINATURA_CARGO = ['Assinante principal', 'Assinante complementar', 'Parceiro', 'Cliente', 'Outro']
const STATUS_CARGO = ['Ativo', 'Inativo', 'Em revisão']

const STATUS_PESSOA = ['Ativo', 'Inativo', 'Bloqueado', 'Substituído', 'Aguardando validação']
const VINCULO_PESSOA = ['MTI', 'Parceiro', 'Cliente', 'Outro']
const STATUS_VINCULO_FUNCIONAL = ['Ativo', 'Inativo', 'Suspenso', 'Aguardando validação Protheus']

const TIPO_USUARIO = ['MTI', 'Parceiro', 'Cliente']
const TIPO_AUTENTICACAO = ['MT Login', 'Gov.br', 'AD/LDAP', 'Usuário e senha', 'Integração futura']
const STATUS_USUARIO = ['Ativo', 'Inativo', 'Bloqueado', 'Aguardando primeiro acesso', 'Aguardando validação']

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
const ORIGEM_ITEM_CODIGO = ['Produto vigente', 'Licença', 'Serviço', 'Catálogo universal', 'Item catálogo parceria']
const STATUS_IMPORT_CSV = ['Pendente', 'Em processamento', 'Concluída', 'Erro', 'Cancelada']
const TIPO_CATALOGO_PARCERIA = ['Licenças', 'Serviços', 'Misto', 'Customizado']
const ORIGEM_DADOS_CATALOGO = ['CSV MTI', 'Manual', 'Integração', 'Legado']

const TIPO_CONTRATACAO = [
  'Tipo 1 — Objeto específico',
  'Tipo 2 — Catálogo do produto',
  'Tipo 3 — Catálogo universal/ecossistema',
  'Misto',
]
const INDICE_REAJUSTE = ['IPCA', 'ICTI', 'Outro']
const MODELO_VENDA = ['Por Licença', 'Por Usuário', 'Por Pacote', 'Por Consumo', 'Por Catálogo', 'Outro']
const COMPLEXIDADE_SERVICO = ['Sem complexidade', 'Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta', 'Especial']
const CATEGORIA_SERVICO = [
  'Serviço técnico', 'Implantação', 'Sustentação', 'Consultoria',
  'Treinamento', 'Cloud', 'SaaS', 'Outro',
]

const STATUS_DEMANDA = [
  'Recebida', 'Em análise', 'Aguardando complemento', 'Aprovada para proposta',
  'Em composição de proposta', 'Enviada ao parceiro', 'Aguardando parceiro',
  'Convertida em proposta', 'Rejeitada', 'Cancelada',
]
const ORIGEM_DEMANDA = ['E-mail', 'WhatsApp', 'Marketplace/site comercial', 'Reunião', 'Parceiro', 'Portal futuro', 'Outro']
const TIPO_DEMANDA = [
  'Nova contratação', 'Renovação', 'Ampliação', 'Substituição',
  'Proposta complementar', 'Estudo de viabilidade', 'Outro',
]
const RESULTADO_ANALISE = ['Prosseguir', 'Solicitar complemento', 'Enviar ao parceiro', 'Rejeitar', 'Cancelar']
const PRIORIDADE = ['Normal', 'Alta', 'Urgente']

const STATUS_PROPOSTA = [
  'Rascunho', 'Em composição', 'Em análise', 'Aguardando parceiro', 'Em revisão',
  'Documento gerado', 'Em assinatura', 'Aprovada', 'Enviada ao cliente',
  'Aguardando retorno do cliente', 'Contrato recebido', 'Contrato cadastrado',
  'Em Contratação', 'Suspensa', 'Cancelada',
]
const STATUS_ITEM_PROPOSTA = ['Em composição', 'Aceito', 'Ajustado', 'Substituído', 'Removido', 'Cancelado']
const ORIGEM_ITEM_PROPOSTA = ['Produto vigente', 'Licença', 'Serviço', 'Catálogo universal', 'Catálogo parceria', 'Manual']
const RECORRENCIA_ITEM = ['Mensal', 'Anual', 'Sob demanda', 'Por execução', 'Única', 'Pro-rata']

const TIPO_DOCUMENTO_TEMPLATE = ['Proposta', 'Handover']
const CARDINALIDADE_TEMPLATE = ['1:1', '1:N']
const STATUS_DOC_TEMPLATE = ['Rascunho', 'Publicado', 'Arquivado', 'Substituído']
const STATUS_DOC_GERADO = [
  'Gerado', 'Em revisão', 'Enviado para assinatura', 'Assinado', 'Enviado ao cliente', 'Cancelado',
]

const TIPO_PROCESSO_WORKFLOW = ['Proposta', 'Contrato', 'Documento', 'Assinatura', 'Handover', 'Outro']
const STATUS_WORKFLOW = ['Rascunho', 'Ativo', 'Suspenso', 'Substituído', 'Arquivado']
const TIPO_BLOCO = [
  'Gerar documento', 'Assinatura', 'Revisão', 'Ajuste', 'Notificação',
  'Envio', 'Integração', 'Aguardar evento',
]
const STATUS_INSTANCIA = [
  'Iniciada', 'Em andamento', 'Aguardando assinatura', 'Aguardando evento',
  'Concluída', 'Cancelada', 'Suspensa',
]
const STATUS_PENDENCIA = [
  'Pendente', 'Em andamento', 'Concluída', 'Ajuste solicitado', 'Reprovada', 'Dispensada', 'Cancelada',
]
const RESULTADO_PENDENCIA = ['Assinado', 'Ajuste', 'Reprovado', 'Dispensado', 'Concluído']

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
const SISTEMA_INTEGRACAO = ['Protheus', 'ServiceNow', 'SIAG']
const STATUS_RECORRENCIA = ['Configurada', 'Pendente', 'Suspensa', 'Cancelada']
const STATUS_PUBLICACAO = ['Registrada', 'Validada', 'Inválida']

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

const COLORS = ['#0c1ba8', '#7c3aed', '#0d9488', '#0369a1', '#059669', '#1e40af', '#b45309', '#dc2626', '#6d28d9', '#0891b2']
const pick = (i) => COLORS[i % COLORS.length]

// IDs canônicos (37 forms)
const F_DOM = 'form-patlasv4-dominio-sistema'
const F_IDM = 'form-patlasv4-item-dominio'
const F_ORG = 'form-patlasv4-organizacao'
const F_SET = 'form-patlasv4-setor-lotacao'
const F_CGF = 'form-patlasv4-cargo-funcao'
const F_PRM = 'form-patlasv4-permissao-cargo'
const F_PES = 'form-patlasv4-pessoa'
const F_USR = 'form-patlasv4-usuario'
const F_PV = 'form-patlasv4-produto-vigente'
const F_LIC = 'form-patlasv4-catalogo-licenca'
const F_UNI = 'form-patlasv4-catalogo-universal'
const F_COD = 'form-patlasv4-codigo-comercial'
const F_SRV = 'form-patlasv4-catalogo-servico'
const F_CPP = 'form-patlasv4-catalogo-parceria'
const F_ICP = 'form-patlasv4-item-catalogo-parceria'
const F_IMP = 'form-patlasv4-importacao-catalogo-csv'
const F_DEM = 'form-patlasv4-demanda'
const F_TPL = 'form-patlasv4-template-documento'
const F_PRP = 'form-patlasv4-proposta'
const F_PRI = 'form-patlasv4-item-proposta'
const F_SNP = 'form-patlasv4-snapshot-item-proposta'
const F_DGD = 'form-patlasv4-documento-gerado'
const F_WFL = 'form-patlasv4-workflow'
const F_BLK = 'form-patlasv4-bloco-workflow'
const F_IWF = 'form-patlasv4-instancia-workflow'
const F_PAS = 'form-patlasv4-pendencia-assinatura'
const F_ENV = 'form-patlasv4-envio-proposta'
const F_EXT = 'form-patlasv4-contratacao-externa'
const F_CTR = 'form-patlasv4-contrato'
const F_CTI = 'form-patlasv4-item-contrato'
const F_INT = 'form-patlasv4-integracao-contrato'
const F_REC = 'form-patlasv4-recorrencia-cobranca'
const F_PUB = 'form-patlasv4-publicacao-contrato'
const F_HOV = 'form-patlasv4-handover'
const F_KOF = 'form-patlasv4-kickoff'
const F_HST = 'form-patlasv4-historico-acao'
const F_NTF = 'form-patlasv4-notificacao'
const F_VOP = 'form-patlasv4-painel-operacional'

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
    ...(opts.protected ? { protected: true } : {}),
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
// FORM 1 — DOMÍNIO DO SISTEMA
// ============================================================================

const formDominioSistema = {
  id: F_DOM, name: 'Domínio do Sistema', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-dom-dados', 'Dados', 'tune'),
    sec('sec-patlasv4-dom-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Domínios configuráveis do sistema (TIPO_ORGANIZACAO, TIPO_SETOR, etc.). Sistema configurável — não fixar diretorias.',
  fields: [
    f('patlasv4-dom-codigo', 'Código', 'text', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-dom-dados', spec: VALIDACOES.V18 }),
    f('patlasv4-dom-nome', 'Nome', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-dom-dados' }),
    f('patlasv4-dom-descricao', 'Descrição', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv4-dom-dados' }),
    f('patlasv4-dom-ativo', 'Ativo', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-dom-status', spec: VALIDACOES.V18 }),
    f('patlasv4-dom-editavel', 'Editável', 'boolean', { required: true, sectionId: 'sec-patlasv4-dom-status' }),
    f('patlasv4-dom-ordem', 'Ordem', 'number', { size: 'small', sectionId: 'sec-patlasv4-dom-dados' }),
  ],
  methods: [
    m('patlasv4-dom-meth-criar', 'Criar domínio', 'add', 'destaque'),
    m('patlasv4-dom-meth-ativar', 'Ativar domínio', 'check_circle', 'menu'),
    m('patlasv4-dom-meth-inativar', 'Inativar domínio', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-dom-p-tipo-org', 'TIPO_ORGANIZACAO', pick(0), {
      'patlasv4-dom-codigo': 'TIPO_ORGANIZACAO', 'patlasv4-dom-nome': 'Tipo de Organização',
      'patlasv4-dom-descricao': 'MTI, Cliente, Parceiro', 'patlasv4-dom-ativo': true, 'patlasv4-dom-editavel': true, 'patlasv4-dom-ordem': 1,
    }),
    p('patlasv4-dom-p-tipo-setor', 'TIPO_SETOR', pick(1), {
      'patlasv4-dom-codigo': 'TIPO_SETOR', 'patlasv4-dom-nome': 'Tipo de Setor',
      'patlasv4-dom-ativo': true, 'patlasv4-dom-editavel': true, 'patlasv4-dom-ordem': 2,
    }),
    p('patlasv4-dom-p-papel-ass', 'PAPEL_ASSINATURA', pick(2), {
      'patlasv4-dom-codigo': 'PAPEL_ASSINATURA', 'patlasv4-dom-nome': 'Papel de Assinatura',
      'patlasv4-dom-ativo': true, 'patlasv4-dom-editavel': true, 'patlasv4-dom-ordem': 3,
    }),
    p('patlasv4-dom-p-tipo-contr', 'TIPO_CONTRATACAO', pick(3), {
      'patlasv4-dom-codigo': 'TIPO_CONTRATACAO', 'patlasv4-dom-nome': 'Tipo de Contratação',
      'patlasv4-dom-ativo': true, 'patlasv4-dom-editavel': false, 'patlasv4-dom-ordem': 4,
    }),
  ],
  activeExamplePresetId: 'patlasv4-dom-p-tipo-org',
}

// ============================================================================
// FORM 2 — ITEM DE DOMÍNIO
// ============================================================================

const formItemDominio = {
  id: F_IDM, name: 'Item de Domínio', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-idm-dados', 'Dados', 'list'),
    sec('sec-patlasv4-idm-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Itens de seleção vinculados a domínios configuráveis.',
  fields: [
    f('patlasv4-idm-dominio', 'Domínio', 'reference', { required: true, linkedFormId: F_DOM, sectionId: 'sec-patlasv4-idm-dados' }),
    f('patlasv4-idm-codigo', 'Código', 'text', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-idm-dados' }),
    f('patlasv4-idm-nome', 'Nome', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-idm-dados' }),
    f('patlasv4-idm-descricao', 'Descrição', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv4-idm-dados' }),
    f('patlasv4-idm-aplicavel', 'Aplicável para', 'textOptions', { multiple: true, options: APLICAVEL_DOMINIO, sectionId: 'sec-patlasv4-idm-dados', spec: VALIDACOES.V19 }),
    f('patlasv4-idm-ordem', 'Ordem', 'number', { size: 'small', sectionId: 'sec-patlasv4-idm-dados' }),
    f('patlasv4-idm-ativo', 'Ativo', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-idm-status', spec: VALIDACOES.V18 }),
  ],
  methods: [
    m('patlasv4-idm-meth-criar', 'Criar item', 'add', 'destaque'),
    m('patlasv4-idm-meth-inativar', 'Inativar item', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-idm-p-mti', 'MTI', pick(0), {
      'patlasv4-idm-codigo': 'MTI', 'patlasv4-idm-nome': 'MTI',
      'patlasv4-idm-aplicavel': ['MTI', 'Todos'], 'patlasv4-idm-ativo': true, 'patlasv4-idm-ordem': 1,
    }),
    p('patlasv4-idm-p-cliente', 'Cliente', pick(1), {
      'patlasv4-idm-codigo': 'CLIENTE', 'patlasv4-idm-nome': 'Cliente',
      'patlasv4-idm-aplicavel': ['Cliente', 'Todos'], 'patlasv4-idm-ativo': true, 'patlasv4-idm-ordem': 2,
    }),
    p('patlasv4-idm-p-parceiro', 'Parceiro', pick(2), {
      'patlasv4-idm-codigo': 'PARCEIRO', 'patlasv4-idm-nome': 'Parceiro',
      'patlasv4-idm-aplicavel': ['Parceiro', 'Todos'], 'patlasv4-idm-ativo': true, 'patlasv4-idm-ordem': 3,
    }),
    p('patlasv4-idm-p-diretoria', 'Diretoria', pick(3), {
      'patlasv4-idm-codigo': 'DIRETORIA', 'patlasv4-idm-nome': 'Diretoria',
      'patlasv4-idm-aplicavel': ['MTI'], 'patlasv4-idm-ativo': true, 'patlasv4-idm-ordem': 2,
    }),
  ],
  activeExamplePresetId: 'patlasv4-idm-p-mti',
}

// ============================================================================
// FORM 3 — ORGANIZAÇÃO
// ============================================================================

const orgSec = [
  sec('sec-patlasv4-org-dados', 'Dados principais', 'business'),
  sec('sec-patlasv4-org-contatos', 'Contatos', 'contacts'),
  sec('sec-patlasv4-org-endereco', 'Endereço', 'location_on'),
  sec('sec-patlasv4-org-vinculos', 'Vínculos comerciais', 'hub'),
  sec('sec-patlasv4-org-status', 'Status', 'flag'),
]

const formOrganizacao = {
  id: F_ORG, name: 'Organização', sectionLayout: 'tabs', sections: orgSec, defaultCanvasMode: 'read',
  metadata: 'Cadastra MTI, clientes e parceiros. Tipo: MTI, Cliente, Parceiro (sem Cliente/Órgão). Sem RG.',
  fields: [
    f('patlasv4-org-codigo', 'Código', 'text', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-org-dados' }),
    f('patlasv4-org-nome', 'Nome / razão social', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-org-dados' }),
    f('patlasv4-org-fantasia', 'Nome fantasia', 'text', { sectionId: 'sec-patlasv4-org-dados' }),
    f('patlasv4-org-sigla', 'Sigla', 'text', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlasv4-org-dados' }),
    f('patlasv4-org-tipo', 'Tipo da organização', 'textOptions', { required: true, relevance: 'highlight', options: TIPOS_ORGANIZACAO, sectionId: 'sec-patlasv4-org-dados', spec: VALIDACOES.V19 }),
    f('patlasv4-org-cnpj', 'CNPJ', 'text', { relevance: 'highlight', sectionId: 'sec-patlasv4-org-dados', spec: VALIDACOES.V01 }),
    f('patlasv4-org-esfera', 'Esfera de poder', 'textOptions', { options: ESFERAS_PODER, sectionId: 'sec-patlasv4-org-dados' }),
    f('patlasv4-org-uf', 'UF', 'textOptions', { size: 'small', options: UFS, sectionId: 'sec-patlasv4-org-endereco' }),
    f('patlasv4-org-municipio', 'Município', 'text', { sectionId: 'sec-patlasv4-org-endereco' }),
    f('patlasv4-org-endereco', 'Endereço', 'text', { size: 'large', sectionId: 'sec-patlasv4-org-endereco' }),
    f('patlasv4-org-email', 'E-mail institucional', 'text', { sectionId: 'sec-patlasv4-org-contatos' }),
    f('patlasv4-org-emails-adic', 'E-mails adicionais', 'text', { multiple: true, size: 'large', sectionId: 'sec-patlasv4-org-contatos' }),
    f('patlasv4-org-telefone', 'Telefone', 'text', { sectionId: 'sec-patlasv4-org-contatos' }),
    f('patlasv4-org-contato-comercial', 'Contato comercial', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv4-org-vinculos' }),
    f('patlasv4-org-solucao-comercializada', 'Solução comercializada', 'textOptions', { options: SOLUCOES, sectionId: 'sec-patlasv4-org-vinculos', spec: 'Aplicável a parceiros.' }),
    f('patlasv4-org-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_ORG, sectionId: 'sec-patlasv4-org-status' }),
    f('patlasv4-org-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlasv4-org-status' }),
  ],
  methods: [
    m('patlasv4-org-meth-validar-cnpj', 'Validar CNPJ', 'verified', 'destaque'),
    m('patlasv4-org-meth-inativar', 'Inativar organização', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-org-p-mti', 'MTI', pick(0), {
      'patlasv4-org-codigo': 'ORG-MTI', 'patlasv4-org-nome': 'MTI — Companhia Mato-grossense de Tecnologia da Informação',
      'patlasv4-org-tipo': 'MTI', 'patlasv4-org-cnpj': '03.507.415/0001-44', 'patlasv4-org-sigla': 'MTI',
      'patlasv4-org-esfera': 'Estadual', 'patlasv4-org-uf': 'MT', 'patlasv4-org-municipio': 'Cuiabá', 'patlasv4-org-status': 'Ativa',
    }),
    ...toPresets(DIRC_ORG_CLIENTES, p, pick),
  ],
  activeExamplePresetId: 'patlasv4-org-p-sema',
}

// ============================================================================
// FORM 4 — SETOR / LOTAÇÃO
// ============================================================================

const ORGANOGRAMA_SETORES = [
  { id: 'patlasv4-set-p-pres', codigo: 'SET-PRES', nome: 'Presidência', sigla: 'PRES', tipo: 'Presidência', nivel: '1' },
  { id: 'patlasv4-set-p-dirc', codigo: 'SET-DIRC', nome: 'Diretoria de Relacionamento com Cliente', sigla: 'DIRC', tipo: 'Diretoria', nivel: '2', parent: 'patlasv4-set-p-pres' },
  { id: 'patlasv4-set-p-dtic', codigo: 'SET-DTIC', nome: 'Diretoria de Tecnologia da Informação e Comunicação', sigla: 'DTIC', tipo: 'Diretoria', nivel: '2', parent: 'patlasv4-set-p-pres' },
  { id: 'patlasv4-set-p-daf', codigo: 'SET-DAF', nome: 'Diretoria de Gestão Administrativa', sigla: 'DAF', tipo: 'Diretoria', nivel: '2', parent: 'patlasv4-set-p-pres' },
  { id: 'patlasv4-set-p-cloud', codigo: 'SET-CLOUD', nome: 'Unidade Cloud', sigla: 'UCLOUD', tipo: 'Unidade', nivel: '3', parent: 'patlasv4-set-p-dtic' },
]

const setorPresets = ORGANOGRAMA_SETORES.map((row, idx) => p(row.id, `${row.sigla} — ${row.tipo}`, pick(idx), {
  'patlasv4-set-codigo': row.codigo,
  'patlasv4-set-nome': row.nome,
  'patlasv4-set-sigla': row.sigla,
  'patlasv4-set-tipo': row.tipo,
  'patlasv4-set-nivel': row.nivel,
  'patlasv4-set-status': 'Ativo',
}))

const formSetorLotacao = {
  id: F_SET, name: 'Setor / Lotação', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-set-ident', 'Identificação', 'account_tree'),
    sec('sec-patlasv4-set-hier', 'Hierarquia', 'device_hub'),
    sec('sec-patlasv4-set-contato', 'Contato', 'mail'),
    sec('sec-patlasv4-set-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Organograma MTI exclusivo. Setor pai self-ref, nível hierárquico e e-mail da estrutura.',
  fields: [
    f('patlasv4-set-codigo', 'Código', 'text', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-set-ident' }),
    f('patlasv4-set-nome', 'Nome do setor', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-set-ident' }),
    f('patlasv4-set-sigla', 'Sigla', 'text', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlasv4-set-ident' }),
    f('patlasv4-set-org-mti', 'Organização MTI', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv4-set-ident', spec: VALIDACOES.V16 }),
    f('patlasv4-set-tipo', 'Tipo de setor', 'textOptions', { required: true, relevance: 'highlight', options: TIPOS_SETOR, sectionId: 'sec-patlasv4-set-ident' }),
    f('patlasv4-set-nivel', 'Nível hierárquico', 'textOptions', { required: true, options: NIVEIS_SETOR, sectionId: 'sec-patlasv4-set-hier' }),
    f('patlasv4-set-pai', 'Setor pai', 'reference', { linkedFormId: F_SET, sectionId: 'sec-patlasv4-set-hier' }),
    f('patlasv4-set-email-estrutura', 'E-mail da estrutura', 'text', { sectionId: 'sec-patlasv4-set-contato' }),
    f('patlasv4-set-responsavel', 'Responsável', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv4-set-contato' }),
    f('patlasv4-set-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_SETOR, sectionId: 'sec-patlasv4-set-status' }),
    f('patlasv4-set-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlasv4-set-status' }),
  ],
  methods: [
    m('patlasv4-set-meth-revisar', 'Revisar setor', 'edit_note', 'menu'),
    m('patlasv4-set-meth-inativar', 'Inativar setor', 'block', 'menu'),
  ],
  exampleValuePresets: setorPresets,
  activeExamplePresetId: 'patlasv4-set-p-dirc',
}

// ============================================================================
// FORM 5 — CARGO / FUNÇÃO (sem lista de permissões embedded)
// ============================================================================

const formCargo = {
  id: F_CGF, name: 'Cargo / Função', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-cgf-dados', 'Dados', 'badge'),
    sec('sec-patlasv4-cgf-assin', 'Assinatura', 'draw'),
    sec('sec-patlasv4-cgf-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Cargo sem lista embedded de permissões — configurar via entidade Permissão do Cargo. Assinatura por cargo.',
  fields: [
    f('patlasv4-cgf-codigo', 'Código', 'text', { size: 'small', required: true, sectionId: 'sec-patlasv4-cgf-dados' }),
    f('patlasv4-cgf-nome', 'Nome do cargo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-cgf-dados' }),
    f('patlasv4-cgf-sigla', 'Sigla', 'text', { size: 'small', sectionId: 'sec-patlasv4-cgf-dados' }),
    f('patlasv4-cgf-tipo', 'Tipo de cargo', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_CARGO, sectionId: 'sec-patlasv4-cgf-dados' }),
    f('patlasv4-cgf-org', 'Organização', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlasv4-cgf-dados' }),
    f('patlasv4-cgf-setor', 'Setor MTI', 'reference', { linkedFormId: F_SET, sectionId: 'sec-patlasv4-cgf-dados', spec: 'Condicional: obrigatório para cargos MTI.' }),
    f('patlasv4-cgf-pode-assinar', 'Pode assinar', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlasv4-cgf-assin' }),
    f('patlasv4-cgf-papel-assinatura', 'Papel de assinatura', 'textOptions', { options: PAPEL_ASSINATURA_CARGO, sectionId: 'sec-patlasv4-cgf-assin' }),
    f('patlasv4-cgf-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_CARGO, sectionId: 'sec-patlasv4-cgf-status' }),
  ],
  methods: [
    m('patlasv4-cgf-meth-config-perm', 'Configurar permissões', 'tune', 'destaque'),
    m('patlasv4-cgf-meth-revisar', 'Revisar cargo', 'edit_note', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-cgf-p-dirc-dir', 'Diretor DIRC', pick(1), {
      'patlasv4-cgf-codigo': 'CGF-DIRC-DIR', 'patlasv4-cgf-nome': 'Diretor DIRC', 'patlasv4-cgf-tipo': 'Diretor',
      'patlasv4-cgf-pode-assinar': true, 'patlasv4-cgf-papel-assinatura': 'Assinante principal', 'patlasv4-cgf-status': 'Ativo',
    }),
    p('patlasv4-cgf-p-dirc-anal', 'Analista DIRC', pick(0), {
      'patlasv4-cgf-codigo': 'CGF-DIRC-AN', 'patlasv4-cgf-nome': 'Analista DIRC', 'patlasv4-cgf-tipo': 'Analista',
      'patlasv4-cgf-status': 'Ativo',
    }),
    p('patlasv4-cgf-p-pres', 'Presidente', pick(2), {
      'patlasv4-cgf-codigo': 'CGF-PRES', 'patlasv4-cgf-nome': 'Presidente da MTI', 'patlasv4-cgf-tipo': 'Presidente',
      'patlasv4-cgf-pode-assinar': true, 'patlasv4-cgf-papel-assinatura': 'Assinante principal', 'patlasv4-cgf-status': 'Ativo',
    }),
    p('patlasv4-cgf-p-parc', 'Representante Parceiro', pick(5), {
      'patlasv4-cgf-codigo': 'CGF-PARC', 'patlasv4-cgf-nome': 'Representante Parceiro', 'patlasv4-cgf-tipo': 'Representante parceiro',
      'patlasv4-cgf-pode-assinar': true, 'patlasv4-cgf-papel-assinatura': 'Parceiro', 'patlasv4-cgf-status': 'Ativo',
    }),
  ],
  activeExamplePresetId: 'patlasv4-cgf-p-dirc-anal',
}

// ============================================================================
// FORM 6 — PERMISSÃO DO CARGO
// ============================================================================

const formPermissaoCargo = {
  id: F_PRM, name: 'Permissão do Cargo', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-prm-dados', 'Permissão', 'admin_panel_settings'),
    sec('sec-patlasv4-prm-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Entidade dedicada para permissões do cargo. Referência PERMISSOES_CARGO_V4.',
  fields: [
    f('patlasv4-prm-cargo', 'Cargo / função', 'reference', { required: true, linkedFormId: F_CGF, sectionId: 'sec-patlasv4-prm-dados', spec: VALIDACOES.V17 }),
    f('patlasv4-prm-modulo', 'Módulo', 'textOptions', { required: true, relevance: 'highlight', options: MODULOS_PERMISSAO, sectionId: 'sec-patlasv4-prm-dados' }),
    f('patlasv4-prm-chave', 'Chave da permissão', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-prm-dados' }),
    f('patlasv4-prm-nome', 'Nome da permissão', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-prm-dados' }),
    f('patlasv4-prm-habilitada', 'Habilitada', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-prm-status' }),
  ],
  methods: [
    m('patlasv4-prm-meth-habilitar', 'Habilitar permissão', 'check_circle', 'destaque'),
    m('patlasv4-prm-meth-desabilitar', 'Desabilitar permissão', 'block', 'menu'),
    m('patlasv4-prm-meth-salvar', 'Salvar permissões', 'save', 'destaque'),
  ],
  exampleValuePresets: PERMISSOES_CARGO_V4.slice(0, 6).map((perm, idx) => p(
    `patlasv4-prm-p-${perm.chave}`,
    perm.nome,
    pick(idx),
    {
      'patlasv4-prm-modulo': perm.modulo,
      'patlasv4-prm-chave': perm.chave,
      'patlasv4-prm-nome': perm.nome,
      'patlasv4-prm-habilitada': true,
    },
  )),
  activeExamplePresetId: 'patlasv4-prm-p-cadastrar_organizacao',
}

// ============================================================================
// FORM 7 — PESSOA (sem RG, sem nascimento)
// ============================================================================

const formPessoa = {
  id: F_PES, name: 'Pessoa', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-pes-dados', 'Dados pessoais', 'person'),
    sec('sec-patlasv4-pes-contato', 'Contato', 'mail'),
    sec('sec-patlasv4-pes-vinc', 'Vínculo', 'business'),
    sec('sec-patlasv4-pes-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Sem RG e sem data de nascimento no MVP. statusVinculoFuncional e validação Protheus para MTI.',
  fields: [
    f('patlasv4-pes-nome', 'Nome completo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-pes-dados' }),
    f('patlasv4-pes-cpf', 'CPF', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-pes-dados', spec: VALIDACOES.V02 }),
    f('patlasv4-pes-matricula', 'Matrícula', 'text', { sectionId: 'sec-patlasv4-pes-dados', spec: VALIDACOES.V03 }),
    f('patlasv4-pes-email', 'E-mail', 'text', { required: true, sectionId: 'sec-patlasv4-pes-contato' }),
    f('patlasv4-pes-telefone', 'Telefone', 'text', { sectionId: 'sec-patlasv4-pes-contato' }),
    f('patlasv4-pes-vinculo', 'Tipo de vínculo', 'textOptions', { required: true, options: VINCULO_PESSOA, sectionId: 'sec-patlasv4-pes-vinc' }),
    f('patlasv4-pes-status-vinculo', 'Status vínculo funcional', 'textOptions', { options: STATUS_VINCULO_FUNCIONAL, relevance: 'highlight', sectionId: 'sec-patlasv4-pes-vinc' }),
    f('patlasv4-pes-data-validacao-protheus', 'Data última validação Protheus', 'date', { readOnly: true, sectionId: 'sec-patlasv4-pes-vinc', spec: VALIDACOES.V20 }),
    f('patlasv4-pes-org', 'Organização', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv4-pes-vinc' }),
    f('patlasv4-pes-setor', 'Setor / lotação', 'reference', { linkedFormId: F_SET, sectionId: 'sec-patlasv4-pes-vinc', spec: VALIDACOES.V04 }),
    f('patlasv4-pes-cargo', 'Cargo / função', 'reference', { linkedFormId: F_CGF, sectionId: 'sec-patlasv4-pes-vinc' }),
    f('patlasv4-pes-notif', 'Recebe notificações', 'boolean', { sectionId: 'sec-patlasv4-pes-vinc' }),
    f('patlasv4-pes-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PESSOA, sectionId: 'sec-patlasv4-pes-status' }),
    f('patlasv4-pes-obs', 'Observações', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv4-pes-status' }),
  ],
  methods: [
    m('patlasv4-pes-meth-validar-cpf', 'Validar CPF', 'verified', 'destaque'),
    m('patlasv4-pes-meth-validar-protheus', 'Validar matrícula Protheus', 'sync', 'destaque'),
    m('patlasv4-pes-meth-usuario', 'Vincular usuário', 'badge', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-pes-p-luis', 'Luis Santos — DIRC', pick(0), {
      'patlasv4-pes-nome': 'Luis Santos', 'patlasv4-pes-cpf': '012.345.678-90', 'patlasv4-pes-matricula': 'MTI-00214',
      'patlasv4-pes-email': 'luis.santos@mti.mt.gov.br', 'patlasv4-pes-vinculo': 'MTI',
      'patlasv4-pes-status-vinculo': 'Ativo', 'patlasv4-pes-status': 'Ativo',
    }),
    p('patlasv4-pes-p-sema', 'Juliana — SEMA', pick(5), {
      'patlasv4-pes-nome': 'Juliana Pereira', 'patlasv4-pes-vinculo': 'Cliente',
      'patlasv4-pes-email': 'juliana.pereira@sema.mt.gov.br', 'patlasv4-pes-status': 'Aguardando validação',
    }),
  ],
  activeExamplePresetId: 'patlasv4-pes-p-luis',
}

// ============================================================================
// FORM 8 — USUÁRIO
// ============================================================================

const formUsuario = {
  id: F_USR, name: 'Usuário', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-usr-acesso', 'Acesso', 'login'),
    sec('sec-patlasv4-usr-efetivo', 'Perfil efetivo', 'manage_accounts'),
    sec('sec-patlasv4-usr-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Permissões efetivas readOnly. Conceito criar acesso derivado da pessoa/cargo.',
  fields: [
    f('patlasv4-usr-pessoa', 'Pessoa', 'reference', { required: true, linkedFormId: F_PES, sectionId: 'sec-patlasv4-usr-acesso' }),
    f('patlasv4-usr-login', 'Login', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-usr-acesso' }),
    f('patlasv4-usr-email', 'E-mail', 'text', { required: true, sectionId: 'sec-patlasv4-usr-acesso' }),
    f('patlasv4-usr-tipo', 'Tipo de usuário', 'textOptions', { required: true, options: TIPO_USUARIO, sectionId: 'sec-patlasv4-usr-acesso' }),
    f('patlasv4-usr-auth', 'Tipos de autenticação', 'textOptions', { multiple: true, required: true, options: TIPO_AUTENTICACAO, sectionId: 'sec-patlasv4-usr-acesso' }),
    f('patlasv4-usr-criar-acesso', 'Criar acesso', 'boolean', { sectionId: 'sec-patlasv4-usr-acesso', spec: 'Flag para provisionamento inicial de credenciais.' }),
    f('patlasv4-usr-org-efetiva', 'Organização efetiva', 'reference', { readOnly: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv4-usr-efetivo' }),
    f('patlasv4-usr-cargo-efetivo', 'Cargo efetivo', 'reference', { readOnly: true, linkedFormId: F_CGF, sectionId: 'sec-patlasv4-usr-efetivo' }),
    f('patlasv4-usr-perm-efetiva', 'Permissões efetivas', 'text', { readOnly: true, size: 'large', textLong: true, sectionId: 'sec-patlasv4-usr-efetivo', spec: VALIDACOES.V05 }),
    f('patlasv4-usr-ativo', 'Ativo', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-usr-status' }),
    f('patlasv4-usr-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_USUARIO, sectionId: 'sec-patlasv4-usr-status' }),
    f('patlasv4-usr-ultimo-acesso', 'Último acesso', 'date', { readOnly: true, sectionId: 'sec-patlasv4-usr-status' }),
  ],
  methods: [
    m('patlasv4-usr-meth-cred', 'Enviar credenciais', 'mail', 'destaque'),
    m('patlasv4-usr-meth-calc-perm', 'Calcular permissões', 'calculate', 'destaque'),
    m('patlasv4-usr-meth-bloquear', 'Bloquear usuário', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-usr-p-admin', 'Administrador — Luis', pick(0), {
      'patlasv4-usr-login': 'luis.santos', 'patlasv4-usr-email': 'luis.santos@mti.mt.gov.br',
      'patlasv4-usr-tipo': 'MTI', 'patlasv4-usr-auth': ['MT Login'], 'patlasv4-usr-ativo': true, 'patlasv4-usr-status': 'Ativo',
      'patlasv4-usr-perm-efetiva': PERMISSOES_CARGO_LABELS.slice(0, 5).join(', '),
    }),
    p('patlasv4-usr-p-cliente-sema', 'Cliente SEMA — aguardando', pick(5), {
      'patlasv4-usr-login': 'juliana.sema', 'patlasv4-usr-tipo': 'Cliente', 'patlasv4-usr-auth': ['Gov.br'],
      'patlasv4-usr-ativo': false, 'patlasv4-usr-status': 'Aguardando primeiro acesso', 'patlasv4-usr-criar-acesso': true,
    }),
  ],
  activeExamplePresetId: 'patlasv4-usr-p-admin',
}

// ============================================================================
// FORMS 9–15 — CATÁLOGO
// ============================================================================

const formProdutoVigente = {
  id: F_PV, name: 'Produto Vigente', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-pv-ident', 'Identificação', 'inventory_2'),
    sec('sec-patlasv4-pv-cobr', 'Cobrança', 'paid'),
    sec('sec-patlasv4-pv-resp', 'Responsáveis', 'support_agent'),
    sec('sec-patlasv4-pv-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Produto comercial vigente com códigos SIAG e Protheus.',
  fields: [
    f('patlasv4-pv-codigo', 'Código', 'text', { size: 'small', required: true, sectionId: 'sec-patlasv4-pv-ident' }),
    f('patlasv4-pv-siag', 'Código SIAG', 'text', { relevance: 'highlight', sectionId: 'sec-patlasv4-pv-ident' }),
    f('patlasv4-pv-protheus', 'Código Protheus', 'text', { relevance: 'highlight', sectionId: 'sec-patlasv4-pv-ident' }),
    f('patlasv4-pv-descricao', 'Descrição', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true, sectionId: 'sec-patlasv4-pv-ident' }),
    f('patlasv4-pv-solucao', 'Solução', 'textOptions', { required: true, options: SOLUCOES, sectionId: 'sec-patlasv4-pv-ident' }),
    f('patlasv4-pv-metrica', 'Métrica', 'textOptions', { required: true, options: METRICAS_PRODUTO, sectionId: 'sec-patlasv4-pv-cobr' }),
    f('patlasv4-pv-cobranca', 'Cobrança', 'textOptions', { required: true, options: COBRANCA, sectionId: 'sec-patlasv4-pv-cobr' }),
    f('patlasv4-pv-valor', 'Valor unitário', 'decimal', { required: true, currency: true, relevance: 'highlight', sectionId: 'sec-patlasv4-pv-cobr' }),
    f('patlasv4-pv-focal-vendas', 'Focal de vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv4-pv-resp' }),
    f('patlasv4-pv-focal-pos', 'Focal de pós-vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv4-pv-resp' }),
    f('patlasv4-pv-unidade-dtic', 'Unidade DTIC', 'reference', { linkedFormId: F_SET, sectionId: 'sec-patlasv4-pv-resp' }),
    f('patlasv4-pv-parceiro', 'Parceiro', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlasv4-pv-resp' }),
    f('patlasv4-pv-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PRODUTO, sectionId: 'sec-patlasv4-pv-status' }),
  ],
  methods: [
    m('patlasv4-pv-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
    m('patlasv4-pv-meth-bloquear', 'Bloquear comercialização', 'block', 'menu'),
  ],
  exampleValuePresets: toPresets(DIRC_PV, p, pick),
  activeExamplePresetId: 'patlasv4-pv-p-cloud',
}

const formCatalogoLicenca = {
  id: F_LIC, name: 'Catálogo de Licença', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-lic-dados', 'Dados principais', 'license'),
    sec('sec-patlasv4-lic-val', 'Valores', 'payments'),
    sec('sec-patlasv4-lic-ref', 'Referência', 'history'),
  ], defaultCanvasMode: 'read',
  metadata: 'Catálogo de licenças por parceria.',
  fields: [
    f('patlasv4-lic-parceria', 'Parceria', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv4-lic-dados' }),
    f('patlasv4-lic-produto-catalogo', 'Produto do catálogo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-lic-dados' }),
    f('patlasv4-lic-descricao', 'Descrição', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-lic-dados' }),
    f('patlasv4-lic-metrica', 'Métrica', 'textOptions', { required: true, options: METRICAS_LICENCA, sectionId: 'sec-patlasv4-lic-dados' }),
    f('patlasv4-lic-valor-unitario', 'Valor unitário', 'decimal', { required: true, currency: true, relevance: 'highlight', sectionId: 'sec-patlasv4-lic-val' }),
    f('patlasv4-lic-universal', 'Universal', 'boolean', { required: true, sectionId: 'sec-patlasv4-lic-dados' }),
    f('patlasv4-lic-individualizado', 'Individualizado', 'boolean', { required: true, sectionId: 'sec-patlasv4-lic-dados' }),
    f('patlasv4-lic-status-parceria', 'Status da parceria', 'textOptions', { required: true, options: STATUS_PARCERIA, sectionId: 'sec-patlasv4-lic-ref' }),
  ],
  methods: [
    m('patlasv4-lic-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
    m('patlasv4-lic-meth-bloquear', 'Bloquear licença', 'block', 'menu'),
  ],
  exampleValuePresets: toPresets(DIRC_LIC, p, pick),
  activeExamplePresetId: 'patlasv4-lic-p-ws-5tb',
}

const formCodigoComercial = {
  id: F_COD, name: 'Código Comercial', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-cod-origem', 'Origem', 'link'),
    sec('sec-patlasv4-cod-tipo1', 'Tipo 1', 'looks_one'),
    sec('sec-patlasv4-cod-tipo2', 'Tipo 2', 'looks_two'),
    sec('sec-patlasv4-cod-tipo3', 'Tipo 3', 'looks_3'),
  ], defaultCanvasMode: 'read',
  metadata: 'Códigos SIAG/Protheus por tipo de contratação 1/2/3 vinculados à origem do item.',
  fields: [
    f('patlasv4-cod-origem', 'Origem do item', 'textOptions', { required: true, options: ORIGEM_ITEM_CODIGO, sectionId: 'sec-patlasv4-cod-origem', spec: VALIDACOES.V25 }),
    f('patlasv4-cod-item-id', 'ID do item de origem', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-cod-origem' }),
    f('patlasv4-cod-siag-t1', 'SIAG — Tipo 1', 'text', { sectionId: 'sec-patlasv4-cod-tipo1', spec: VALIDACOES.V13 }),
    f('patlasv4-cod-protheus-t1', 'Protheus — Tipo 1', 'text', { sectionId: 'sec-patlasv4-cod-tipo1' }),
    f('patlasv4-cod-siag-t2', 'SIAG — Tipo 2', 'text', { sectionId: 'sec-patlasv4-cod-tipo2' }),
    f('patlasv4-cod-protheus-t2', 'Protheus — Tipo 2', 'text', { sectionId: 'sec-patlasv4-cod-tipo2' }),
    f('patlasv4-cod-siag-t3', 'SIAG — Tipo 3', 'text', { sectionId: 'sec-patlasv4-cod-tipo3' }),
    f('patlasv4-cod-protheus-t3', 'Protheus — Tipo 3', 'text', { sectionId: 'sec-patlasv4-cod-tipo3' }),
  ],
  methods: [
    m('patlasv4-cod-meth-gerar', 'Gerar códigos', 'qr_code_2', 'destaque'),
    m('patlasv4-cod-meth-validar', 'Validar códigos', 'verified', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-cod-p-cloud', 'DIRC — PV 0005315', pick(0), {
      'patlasv4-cod-origem': 'Produto vigente', 'patlasv4-cod-item-id': 'PV-0005315',
      'patlasv4-cod-siag-t1': '0005315', 'patlasv4-cod-protheus-t1': '32000192',
      'patlasv4-cod-siag-t2': '0005315', 'patlasv4-cod-protheus-t2': '32000192',
    }),
  ],
  activeExamplePresetId: 'patlasv4-cod-p-cloud',
}

const formCatalogoUniversal = {
  id: F_UNI, name: 'Catálogo Universal', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-uni-dados', 'Produto universal', 'hub'),
    sec('sec-patlasv4-uni-metrica', 'Métrica e valores', 'calculate'),
    sec('sec-patlasv4-uni-complex', 'Faixas de complexidade', 'tune'),
    sec('sec-patlasv4-uni-cod', 'Códigos', 'qr_code_2'),
  ], defaultCanvasMode: 'read',
  metadata: 'Contratação Tipo 3 — métrica universal/ecossistema/moeda de serviço (MODELAGEM §14).',
  fields: [
    f('patlasv4-uni-produto', 'Produto de catálogo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-uni-dados' }),
    f('patlasv4-uni-descricao', 'Descrição', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv4-uni-dados' }),
    f('patlasv4-uni-metrica-base', 'Métrica base', 'textOptions', { required: true, options: METRICAS_PRODUTO, sectionId: 'sec-patlasv4-uni-metrica' }),
    f('patlasv4-uni-valor-unitario', 'Valor unitário', 'decimal', { required: true, currency: true, relevance: 'highlight', sectionId: 'sec-patlasv4-uni-metrica' }),
    f('patlasv4-uni-peso', 'Peso', 'decimal', { sectionId: 'sec-patlasv4-uni-metrica' }),
    f('patlasv4-uni-recorrencia', 'Recorrência', 'textOptions', { options: RECORRENCIA_SERV, sectionId: 'sec-patlasv4-uni-metrica' }),
    f('patlasv4-uni-conv-unit', 'Conversor valor unitário', 'decimal', { sectionId: 'sec-patlasv4-uni-metrica' }),
    f('patlasv4-uni-cx-muito-baixa', 'Complexidade muito baixa', 'text', { sectionId: 'sec-patlasv4-uni-complex' }),
    f('patlasv4-uni-val-cx-muito-baixa', 'Valor muito baixa', 'decimal', { currency: true, sectionId: 'sec-patlasv4-uni-complex' }),
    f('patlasv4-uni-cx-baixa', 'Complexidade baixa', 'text', { sectionId: 'sec-patlasv4-uni-complex' }),
    f('patlasv4-uni-val-cx-baixa', 'Valor baixa', 'decimal', { currency: true, sectionId: 'sec-patlasv4-uni-complex' }),
    f('patlasv4-uni-cx-media', 'Complexidade média', 'text', { sectionId: 'sec-patlasv4-uni-complex' }),
    f('patlasv4-uni-val-cx-media', 'Valor média', 'decimal', { currency: true, sectionId: 'sec-patlasv4-uni-complex' }),
    f('patlasv4-uni-cx-alta', 'Complexidade alta', 'text', { sectionId: 'sec-patlasv4-uni-complex' }),
    f('patlasv4-uni-val-cx-alta', 'Valor alta', 'decimal', { currency: true, sectionId: 'sec-patlasv4-uni-complex' }),
    f('patlasv4-uni-cx-muito-alta', 'Complexidade muito alta', 'text', { sectionId: 'sec-patlasv4-uni-complex' }),
    f('patlasv4-uni-val-cx-muito-alta', 'Valor muito alta', 'decimal', { currency: true, sectionId: 'sec-patlasv4-uni-complex' }),
    f('patlasv4-uni-cod-siag', 'Código SIAG', 'text', { sectionId: 'sec-patlasv4-uni-cod', spec: VALIDACOES.V13 }),
    f('patlasv4-uni-cod-protheus', 'Código Protheus', 'text', { sectionId: 'sec-patlasv4-uni-cod' }),
    f('patlasv4-uni-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PRODUTO, sectionId: 'sec-patlasv4-uni-dados', spec: VALIDACOES.V14 }),
  ],
  methods: [
    m('patlasv4-uni-meth-selecionar', 'Selecionar para proposta (Tipo 3)', 'add_shopping_cart', 'destaque'),
    m('patlasv4-uni-meth-inativar', 'Inativar item universal', 'block', 'menu'),
  ],
  exampleValuePresets: toPresets(DIRC_UNI, p, pick),
  activeExamplePresetId: 'patlasv4-uni-p-cloud-usn',
}

const formCatalogoServico = {
  id: F_SRV, name: 'Catálogo de Serviço', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-srv-ident', 'Identificação', 'support_agent'),
    sec('sec-patlasv4-srv-val', 'Valores', 'payments'),
  ], defaultCanvasMode: 'read',
  metadata: 'Catálogo de serviços por parceria.',
  fields: [
    f('patlasv4-srv-parceria', 'Parceria', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv4-srv-ident' }),
    f('patlasv4-srv-produto-catalogo', 'Produto do catálogo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-srv-ident' }),
    f('patlasv4-srv-descricao', 'Descrição', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-srv-ident' }),
    f('patlasv4-srv-complexidade', 'Complexidade', 'textOptions', { required: true, options: COMPLEXIDADE_SERVICO, sectionId: 'sec-patlasv4-srv-ident' }),
    f('patlasv4-srv-metrica', 'Métrica', 'textOptions', { required: true, options: METRICAS_SERVICO, sectionId: 'sec-patlasv4-srv-ident' }),
    f('patlasv4-srv-valor-unitario', 'Valor unitário', 'decimal', { required: true, currency: true, relevance: 'highlight', sectionId: 'sec-patlasv4-srv-val' }),
    f('patlasv4-srv-status-parceria', 'Status da parceria', 'textOptions', { required: true, options: STATUS_PARCERIA, sectionId: 'sec-patlasv4-srv-ident' }),
  ],
  methods: [
    m('patlasv4-srv-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
    m('patlasv4-srv-meth-bloquear', 'Bloquear serviço', 'block', 'menu'),
  ],
  exampleValuePresets: toPresets(DIRC_SRV, p, pick),
  activeExamplePresetId: 'patlasv4-srv-p-plano-pres',
}

const formCatalogoParceria = {
  id: F_CPP, name: 'Catálogo por Parceria', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-cpp-ident', 'Parceria', 'handshake'),
    sec('sec-patlasv4-cpp-meta', 'Metadados', 'table_chart'),
    sec('sec-patlasv4-cpp-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Catálogo específico por parceria com estruturaColunas JSON, tipoCatalogo e origemDados.',
  fields: [
    f('patlasv4-cpp-parceria', 'Parceria', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv4-cpp-ident' }),
    f('patlasv4-cpp-nome-tabela', 'Nome da tabela', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-cpp-meta' }),
    f('patlasv4-cpp-estrutura-colunas', 'Estrutura de colunas (JSON)', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-cpp-meta' }),
    f('patlasv4-cpp-tipo-catalogo', 'Tipo de catálogo', 'textOptions', { required: true, options: TIPO_CATALOGO_PARCERIA, sectionId: 'sec-patlasv4-cpp-meta' }),
    f('patlasv4-cpp-origem-dados', 'Origem dos dados', 'textOptions', { required: true, options: ORIGEM_DADOS_CATALOGO, sectionId: 'sec-patlasv4-cpp-meta' }),
    f('patlasv4-cpp-versao', 'Versão', 'text', { sectionId: 'sec-patlasv4-cpp-meta' }),
    f('patlasv4-cpp-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PARCERIA, sectionId: 'sec-patlasv4-cpp-status' }),
  ],
  methods: [
    m('patlasv4-cpp-meth-consultar', 'Consultar catálogo', 'search', 'destaque'),
    m('patlasv4-cpp-meth-selecionar', 'Selecionar item para proposta', 'add_shopping_cart', 'menu'),
  ],
  exampleValuePresets: DIRC_CPP.map((row, i) => p(row.id, row.label, pick(i), cppPresetValues(row, i))),
  activeExamplePresetId: 'patlasv4-cpp-p-workspace',
}

const formItemCatalogoParceria = {
  id: F_ICP, name: 'Item Catálogo Parceria', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Linha do catálogo por parceria com dadosVariaveis JSON.',
  fields: [
    f('patlasv4-icp-catalogo', 'Catálogo parceria', 'reference', { required: true, linkedFormId: F_CPP }),
    f('patlasv4-icp-codigo', 'Código interno', 'text', { size: 'small', required: true, relevance: 'highlight' }),
    f('patlasv4-icp-descricao', 'Descrição', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlasv4-icp-dados-variaveis', 'Dados variáveis (JSON)', 'text', { size: 'large', textLong: true, required: true }),
    f('patlasv4-icp-ativo', 'Ativo', 'boolean', { required: true, relevance: 'highlight' }),
  ],
  methods: [m('patlasv4-icp-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque')],
  exampleValuePresets: toPresets(DIRC_ICP, p, pick),
  activeExamplePresetId: 'patlasv4-icp-p-ws-5tb',
}

const formImportacaoCatalogoCsv = {
  id: F_IMP, name: 'Importação Catálogo CSV', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Ingestão CSV MTI para catálogo de parceria.',
  fields: [
    f('patlasv4-imp-parceria', 'Parceria', 'reference', { required: true, linkedFormId: F_ORG }),
    f('patlasv4-imp-catalogo', 'Catálogo parceria', 'reference', { required: true, linkedFormId: F_CPP }),
    f('patlasv4-imp-arquivo', 'Arquivo CSV', 'file', { required: true, size: 'large' }),
    f('patlasv4-imp-status', 'Status da importação', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_IMPORT_CSV }),
    f('patlasv4-imp-data', 'Data da importação', 'date', { required: true, relevance: 'highlight' }),
    f('patlasv4-imp-responsavel', 'Responsável', 'reference', { linkedFormId: F_PES }),
    f('patlasv4-imp-log', 'Log de processamento', 'text', { size: 'large', textLong: true, readOnly: true }),
  ],
  methods: [m('patlasv4-imp-meth-executar', 'Executar ingestão CSV MTI', 'upload_file', 'destaque')],
  exampleValuePresets: [
    p('patlasv4-imp-p-ws', 'Importação Workspace v8', pick(0), {
      'patlasv4-imp-status': 'Concluída', 'patlasv4-imp-data': '2026-01-15',
    }),
  ],
  activeExamplePresetId: 'patlasv4-imp-p-ws',
}

// ============================================================================
// FORMS 16–21 — PROCESSO / DOCUMENTO
// ============================================================================

const formDemanda = {
  id: F_DEM, name: 'Demanda', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-dem-resumo', 'Resumo', 'summarize'),
    sec('sec-patlasv4-dem-cliente', 'Cliente', 'badge'),
    sec('sec-patlasv4-dem-analise', 'Análise', 'fact_check'),
  ], defaultCanvasMode: 'read',
  metadata: 'Demanda comercial — origem, tipo e análise.',
  fields: [
    f('patlasv4-dem-protocolo', 'Protocolo', 'text', { required: true, relevance: 'identity', sectionId: 'sec-patlasv4-dem-resumo' }),
    f('patlasv4-dem-origem', 'Origem', 'textOptions', { required: true, options: ORIGEM_DEMANDA, sectionId: 'sec-patlasv4-dem-resumo' }),
    f('patlasv4-dem-tipo', 'Tipo', 'textOptions', { required: true, options: TIPO_DEMANDA, sectionId: 'sec-patlasv4-dem-resumo' }),
    f('patlasv4-dem-data-receb', 'Data de recebimento', 'date', { required: true, sectionId: 'sec-patlasv4-dem-resumo' }),
    f('patlasv4-dem-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv4-dem-cliente' }),
    f('patlasv4-dem-solicitante', 'Solicitante', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv4-dem-cliente' }),
    f('patlasv4-dem-solucao', 'Solução solicitada', 'textOptions', { options: SOLUCOES, sectionId: 'sec-patlasv4-dem-resumo' }),
    f('patlasv4-dem-descricao', 'Descrição da necessidade', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-dem-resumo' }),
    f('patlasv4-dem-prioridade', 'Prioridade', 'textOptions', { options: PRIORIDADE, sectionId: 'sec-patlasv4-dem-resumo' }),
    f('patlasv4-dem-procedente', 'Procedente?', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlasv4-dem-analise', spec: 'Procedente quando aprovada para proposta.' }),
    f('patlasv4-dem-resultado', 'Resultado da análise', 'textOptions', { options: RESULTADO_ANALISE, sectionId: 'sec-patlasv4-dem-analise' }),
    f('patlasv4-dem-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DEMANDA, sectionId: 'sec-patlasv4-dem-resumo' }),
  ],
  methods: [
    m('patlasv4-dem-meth-analisar', 'Analisar demanda', 'fact_check', 'destaque'),
    m('patlasv4-dem-meth-proposta', 'Criar proposta', 'request_quote', 'destaque'),
    m('patlasv4-dem-meth-rejeitar', 'Rejeitar demanda', 'thumb_down', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-dem-p-sema', 'DIRC — COT SEMA / Proposta 98', pick(0), {
      'patlasv4-dem-protocolo': 'COT-2025-098', 'patlasv4-dem-origem': 'E-mail', 'patlasv4-dem-tipo': 'Nova contratação',
      'patlasv4-dem-data-receb': '2025-06-01', 'patlasv4-dem-solucao': 'MTI CLOUD',
      'patlasv4-dem-descricao': 'Demanda originada da planilha DIRC — Proposta 98 / SEMA / valor R$ 169.127,04',
      'patlasv4-dem-procedente': true, 'patlasv4-dem-resultado': 'Prosseguir',
      'patlasv4-dem-status': 'Aprovada para proposta',
    }),
  ],
  activeExamplePresetId: 'patlasv4-dem-p-sema',
}

const formTemplateDocumento = {
  id: F_TPL, name: 'Template de Documento', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-tpl-dados', 'Modelo', 'article'),
    sec('sec-patlasv4-tpl-param', 'Parâmetros', 'tune'),
  ], defaultCanvasMode: 'read',
  metadata: 'Template para geração de documentos comerciais.',
  fields: [
    f('patlasv4-tpl-nome', 'Nome do template', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-tpl-dados' }),
    f('patlasv4-tpl-tipo', 'Tipo', 'textOptions', { required: true, options: TIPO_DOCUMENTO_TEMPLATE, sectionId: 'sec-patlasv4-tpl-dados' }),
    f('patlasv4-tpl-cardinalidade', 'Cardinalidade', 'textOptions', { required: true, options: CARDINALIDADE_TEMPLATE, sectionId: 'sec-patlasv4-tpl-dados' }),
    f('patlasv4-tpl-versao', 'Versão', 'text', { required: true, sectionId: 'sec-patlasv4-tpl-dados' }),
    f('patlasv4-tpl-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DOC_TEMPLATE, sectionId: 'sec-patlasv4-tpl-dados' }),
    f('patlasv4-tpl-conteudo', 'Conteúdo HTML', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-tpl-dados' }),
    f('patlasv4-tpl-parametros', 'Parâmetros embutidos', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv4-tpl-param' }),
  ],
  methods: [
    m('patlasv4-tpl-meth-publicar', 'Publicar template', 'publish', 'destaque'),
    m('patlasv4-tpl-meth-prev', 'Pré-visualizar', 'preview', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-tpl-p-proposta', 'Template proposta padrão', pick(0), {
      'patlasv4-tpl-nome': 'Proposta comercial — padrão MTI', 'patlasv4-tpl-tipo': 'Proposta',
      'patlasv4-tpl-cardinalidade': '1:1', 'patlasv4-tpl-versao': '5.0', 'patlasv4-tpl-status': 'Publicado',
    }),
  ],
  activeExamplePresetId: 'patlasv4-tpl-p-proposta',
}

const formProposta = {
  id: F_PRP, name: 'Proposta', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-prp-com', 'Comercial', 'request_quote'),
    sec('sec-patlasv4-prp-escopo', 'Escopo e objeto', 'description'),
    sec('sec-patlasv4-prp-itens', 'Itens', 'list_alt'),
    sec('sec-patlasv4-prp-doc', 'Documento', 'article'),
  ], defaultCanvasMode: 'read',
  metadata: 'Versão obrigatória, template vinculado, tipo 1/2/3/misto — MODELAGEM §18.',
  fields: [
    f('patlasv4-prp-numero', 'Número', 'text', { required: true, relevance: 'identity', sectionId: 'sec-patlasv4-prp-com' }),
    f('patlasv4-prp-versao', 'Versão', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-prp-com', spec: VALIDACOES.V12 }),
    f('patlasv4-prp-ano', 'Ano', 'number', { size: 'small', required: true, sectionId: 'sec-patlasv4-prp-com' }),
    f('patlasv4-prp-data', 'Data', 'date', { required: true, sectionId: 'sec-patlasv4-prp-com' }),
    f('patlasv4-prp-demanda', 'Demanda de origem', 'reference', { linkedFormId: F_DEM, sectionId: 'sec-patlasv4-prp-com' }),
    f('patlasv4-prp-template', 'Template do documento', 'reference', { linkedFormId: F_TPL, sectionId: 'sec-patlasv4-prp-doc', spec: VALIDACOES.V11 }),
    f('patlasv4-prp-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv4-prp-com' }),
    f('patlasv4-prp-focal', 'Focal MTI', 'reference', { required: true, linkedFormId: F_PES, sectionId: 'sec-patlasv4-prp-com' }),
    f('patlasv4-prp-produto-vigente', 'Produto vigente', 'reference', { required: true, linkedFormId: F_PV, sectionId: 'sec-patlasv4-prp-com', spec: VALIDACOES.V14 }),
    f('patlasv4-prp-solucao', 'Solução (legado)', 'textOptions', { options: SOLUCOES, sectionId: 'sec-patlasv4-prp-com', spec: 'Preferir referência a Produto vigente.' }),
    f('patlasv4-prp-vigencia', 'Vigência', 'text', { required: true, sectionId: 'sec-patlasv4-prp-com' }),
    f('patlasv4-prp-tem-parceiro', 'Parceiro envolvido', 'boolean', { sectionId: 'sec-patlasv4-prp-com', spec: VALIDACOES.V14 }),
    f('patlasv4-prp-parceiros', 'Parceiros envolvidos', 'reference', { multiple: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv4-prp-com' }),
    f('patlasv4-prp-objeto', 'Objeto', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-prp-escopo' }),
    f('patlasv4-prp-caracteristicas', 'Características', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-prp-escopo' }),
    f('patlasv4-prp-detalhamento', 'Detalhamento do projeto', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-prp-escopo' }),
    f('patlasv4-prp-objetivo', 'Objetivo', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-prp-escopo' }),
    f('patlasv4-prp-escopo', 'Escopo resumido', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-prp-escopo' }),
    f('patlasv4-prp-condicoes', 'Condições / Suporte', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv4-prp-escopo' }),
    f('patlasv4-prp-tipo-contratacao', 'Tipo de contratação', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_CONTRATACAO, sectionId: 'sec-patlasv4-prp-com', spec: VALIDACOES.V13 }),
    f('patlasv4-prp-valor-total', 'Valor total previsto', 'decimal', { currency: true, relevance: 'highlight', sectionId: 'sec-patlasv4-prp-com' }),
    f('patlasv4-prp-itens', 'Itens', 'embeddedReference', { multiple: true, linkedFormId: F_PRI, embeddedDisplay: 'table', size: 'large', sectionId: 'sec-patlasv4-prp-itens' }),
    f('patlasv4-prp-documento', 'Documento gerado', 'reference', { linkedFormId: F_DGD, sectionId: 'sec-patlasv4-prp-doc' }),
    f('patlasv4-prp-workflow', 'Workflow', 'reference', { linkedFormId: F_WFL, sectionId: 'sec-patlasv4-prp-doc' }),
    f('patlasv4-prp-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PROPOSTA, sectionId: 'sec-patlasv4-prp-com' }),
  ],
  methods: [
    m('patlasv4-prp-meth-montar', 'Montar itens do catálogo', 'add_shopping_cart', 'destaque'),
    m('patlasv4-prp-meth-gerar-doc', 'Gerar documento', 'description', 'destaque'),
    m('patlasv4-prp-meth-wf', 'Submeter ao workflow', 'rocket_launch', 'destaque'),
    m('patlasv4-prp-meth-enviar', 'Enviar ao cliente', 'send', 'menu'),
  ],
  exampleValuePresets: toPresets(DIRC_PRP, p, pick),
  activeExamplePresetId: 'patlasv4-prp-p-sema-98',
}

const formItemProposta = {
  id: F_PRI, name: 'Item da Proposta', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-pri-origem', 'Origem', 'category'),
    sec('sec-patlasv4-pri-val', 'Valores', 'calculate'),
  ], defaultCanvasMode: 'read',
  metadata: 'Item da proposta vinculado ao snapshot. Valor unitário readOnly.',
  fields: [
    f('patlasv4-pri-proposta', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP, sectionId: 'sec-patlasv4-pri-origem' }),
    f('patlasv4-pri-origem', 'Origem', 'textOptions', { required: true, options: ORIGEM_ITEM_PROPOSTA, sectionId: 'sec-patlasv4-pri-origem' }),
    f('patlasv4-pri-snapshot', 'Snapshot', 'reference', { required: true, linkedFormId: F_SNP, sectionId: 'sec-patlasv4-pri-origem' }),
    f('patlasv4-pri-descricao', 'Descrição', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true, sectionId: 'sec-patlasv4-pri-origem' }),
    f('patlasv4-pri-quantidade', 'Quantidade', 'decimal', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-pri-val' }),
    f('patlasv4-pri-valor-unitario', 'Valor unitário', 'decimal', { readOnly: true, protected: true, currency: true, required: true, sectionId: 'sec-patlasv4-pri-val', spec: VALIDACOES.V07 }),
    f('patlasv4-pri-valor-total', 'Valor total', 'decimal', { currency: true, required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-pri-val' }),
    f('patlasv4-pri-status', 'Status do item', 'textOptions', { options: STATUS_ITEM_PROPOSTA, relevance: 'highlight', sectionId: 'sec-patlasv4-pri-val' }),
  ],
  methods: [
    m('patlasv4-pri-meth-adicionar', 'Adicionar item', 'add', 'destaque'),
    m('patlasv4-pri-meth-remover', 'Remover item', 'delete', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-pri-p-cloud', 'DIRC — Item proposta CLOUD USN', pick(1), {
      'patlasv4-pri-origem': 'Produto vigente',
      'patlasv4-pri-descricao': 'MTI CLOUD - DISPONIBILIZAÇÃO DE INFRAESTRUTURA EM NUVEM HÍBRIDA',
      'patlasv4-pri-quantidade': 169127, 'patlasv4-pri-valor-unitario': 1, 'patlasv4-pri-valor-total': 169127.04,
      'patlasv4-pri-status': 'Em composição',
    }),
  ],
  activeExamplePresetId: 'patlasv4-pri-p-cloud',
}

const formSnapshotItemProposta = {
  id: F_SNP, name: 'Snapshot Item Proposta', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-snp-dados', 'Snapshot', 'content_copy'),
    sec('sec-patlasv4-snp-cod', 'Códigos', 'qr_code_2'),
  ], defaultCanvasMode: 'read',
  metadata: 'Snapshot imutável do item no momento da composição da proposta.',
  fields: [
    f('patlasv4-snp-item', 'Item da proposta', 'reference', { linkedFormId: F_PRI, sectionId: 'sec-patlasv4-snp-dados' }),
    f('patlasv4-snp-descricao', 'Descrição snapshot', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true, sectionId: 'sec-patlasv4-snp-dados' }),
    f('patlasv4-snp-metrica', 'Métrica', 'textOptions', { options: METRICAS_PRODUTO, sectionId: 'sec-patlasv4-snp-dados' }),
    f('patlasv4-snp-dados-origem', 'Dados de origem (JSON)', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv4-snp-dados' }),
    f('patlasv4-snp-data', 'Data do snapshot', 'date', { readOnly: true, required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-snp-dados' }),
    f('patlasv4-snp-imutavel', 'Imutável', 'boolean', { readOnly: true, required: true, sectionId: 'sec-patlasv4-snp-dados', spec: VALIDACOES.V06 }),
    f('patlasv4-snp-siag', 'Código SIAG', 'text', { sectionId: 'sec-patlasv4-snp-cod' }),
    f('patlasv4-snp-protheus', 'Código Protheus', 'text', { sectionId: 'sec-patlasv4-snp-cod' }),
    f('patlasv4-snp-valor-unitario', 'Valor unitário snapshot', 'decimal', { readOnly: true, protected: true, currency: true, required: true, sectionId: 'sec-patlasv4-snp-dados' }),
  ],
  methods: [m('patlasv4-snp-meth-gerar', 'Gerar snapshot', 'content_copy', 'destaque')],
  exampleValuePresets: [
    p('patlasv4-snp-p-cloud', 'DIRC — Snapshot MTI CLOUD', pick(0), {
      'patlasv4-snp-descricao': 'MTI CLOUD - DISPONIBILIZAÇÃO DE INFRAESTRUTURA EM NUVEM HÍBRIDA',
      'patlasv4-snp-metrica': 'USN',
      'patlasv4-snp-dados-origem': '{"origem":"Produto vigente","siag":"0005315","protheus":"32000192","parceiro":"Zadara"}',
      'patlasv4-snp-data': '2025-06-11', 'patlasv4-snp-imutavel': true,
      'patlasv4-snp-siag': '0005315', 'patlasv4-snp-protheus': '32000192', 'patlasv4-snp-valor-unitario': 1,
    }),
  ],
  activeExamplePresetId: 'patlasv4-snp-p-cloud',
}

const formDocumentoGerado = {
  id: F_DGD, name: 'Documento Gerado', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv4-dgd-titulo', 'Título', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlasv4-dgd-tipo', 'Tipo', 'textOptions', { required: true, options: [...TIPO_DOCUMENTO_TEMPLATE, 'Contrato'] }),
    f('patlasv4-dgd-proposta', 'Proposta', 'reference', { linkedFormId: F_PRP }),
    f('patlasv4-dgd-template', 'Template', 'reference', { required: true, linkedFormId: F_TPL }),
    f('patlasv4-dgd-versao-template', 'Versão do template', 'text', { required: true }),
    f('patlasv4-dgd-arquivo', 'Arquivo', 'file'),
    f('patlasv4-dgd-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DOC_GERADO }),
    f('patlasv4-dgd-data-geracao', 'Data de geração', 'date'),
    f('patlasv4-dgd-gerado-por', 'Gerado por', 'reference', { linkedFormId: F_PES }),
  ],
  methods: [
    m('patlasv4-dgd-meth-assinar', 'Enviar para assinatura', 'edit_note', 'destaque'),
    m('patlasv4-dgd-meth-baixar', 'Baixar documento', 'download', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-dgd-p-sema', 'Proposta SEMA — Gerado', pick(0), {
      'patlasv4-dgd-titulo': 'Proposta PROP-2026-001 — SEMA', 'patlasv4-dgd-tipo': 'Proposta',
      'patlasv4-dgd-versao-template': '5.0', 'patlasv4-dgd-status': 'Gerado', 'patlasv4-dgd-data-geracao': '2026-02-07',
    }),
  ],
  activeExamplePresetId: 'patlasv4-dgd-p-sema',
}

// ============================================================================
// FORMS 22–25 — WORKFLOW
// ============================================================================

const formWorkflow = {
  id: F_WFL, name: 'Workflow', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-wfl-dados', 'Configuração', 'account_tree'),
    sec('sec-patlasv4-wfl-blocos', 'Blocos', 'view_list'),
  ], defaultCanvasMode: 'read',
  metadata: 'Workflow configurável por tipoProcesso e SLA — sistema configurável, não fixar diretorias.',
  fields: [
    f('patlasv4-wfl-nome', 'Nome do workflow', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-wfl-dados' }),
    f('patlasv4-wfl-tipo-processo', 'Tipo de processo', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_PROCESSO_WORKFLOW, sectionId: 'sec-patlasv4-wfl-dados', spec: VALIDACOES.V24 }),
    f('patlasv4-wfl-sla-dias', 'SLA (dias)', 'number', { size: 'small', sectionId: 'sec-patlasv4-wfl-dados' }),
    f('patlasv4-wfl-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_WORKFLOW, sectionId: 'sec-patlasv4-wfl-dados' }),
    f('patlasv4-wfl-versao', 'Versão', 'text', { size: 'small', sectionId: 'sec-patlasv4-wfl-dados' }),
    f('patlasv4-wfl-descricao', 'Descrição', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv4-wfl-dados' }),
    f('patlasv4-wfl-blocos', 'Blocos', 'embeddedReference', { multiple: true, linkedFormId: F_BLK, embeddedDisplay: 'table', size: 'large', sectionId: 'sec-patlasv4-wfl-blocos' }),
  ],
  methods: [
    m('patlasv4-wfl-meth-ativar', 'Ativar workflow', 'play_arrow', 'destaque'),
    m('patlasv4-wfl-meth-suspender', 'Suspender workflow', 'pause', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-wfl-p-proposta', 'Aprovação de Proposta', pick(0), {
      'patlasv4-wfl-nome': 'Aprovação de Proposta Comercial', 'patlasv4-wfl-tipo-processo': 'Proposta',
      'patlasv4-wfl-status': 'Ativo', 'patlasv4-wfl-versao': '4.0', 'patlasv4-wfl-sla-dias': 15,
      'patlasv4-wfl-descricao': 'Workflow configurável — blocos definidos por cargo/setor/org.',
    }),
  ],
  activeExamplePresetId: 'patlasv4-wfl-p-proposta',
}

const formBlocoWorkflow = {
  id: F_BLK, name: 'Bloco de Workflow', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-blk-dados', 'Bloco', 'widgets'),
    sec('sec-patlasv4-blk-exig', 'Exigências', 'rule'),
  ], defaultCanvasMode: 'read',
  metadata: 'Bloco configurável com cargoExigido, setorExigido, orgExigida e blocoRetorno.',
  fields: [
    f('patlasv4-blk-nome', 'Nome do bloco', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv4-blk-dados' }),
    f('patlasv4-blk-tipo', 'Tipo de bloco', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_BLOCO, sectionId: 'sec-patlasv4-blk-dados' }),
    f('patlasv4-blk-ordem', 'Ordem', 'number', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlasv4-blk-dados' }),
    f('patlasv4-blk-cargo-exigido', 'Cargo exigido', 'reference', { linkedFormId: F_CGF, sectionId: 'sec-patlasv4-blk-exig' }),
    f('patlasv4-blk-setor-exigido', 'Setor exigido', 'reference', { linkedFormId: F_SET, sectionId: 'sec-patlasv4-blk-exig' }),
    f('patlasv4-blk-org-exigida', 'Organização exigida', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlasv4-blk-exig' }),
    f('patlasv4-blk-bloco-retorno', 'Bloco de retorno', 'reference', { linkedFormId: F_BLK, sectionId: 'sec-patlasv4-blk-exig', spec: 'Referência para retorno em caso de ajuste.' }),
    f('patlasv4-blk-sla-dias', 'SLA (dias)', 'number', { size: 'small', sectionId: 'sec-patlasv4-blk-dados' }),
    f('patlasv4-blk-obs', 'Observações', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv4-blk-dados' }),
  ],
  methods: [m('patlasv4-blk-meth-config', 'Configurar bloco', 'tune', 'destaque')],
  exampleValuePresets: [
    p('patlasv4-blk-p-assin', 'Assinatura configurável', pick(0), {
      'patlasv4-blk-nome': 'Assinatura — cargo configurado', 'patlasv4-blk-tipo': 'Assinatura', 'patlasv4-blk-ordem': 1,
    }),
    p('patlasv4-blk-p-envio', 'Envio ao cliente', pick(5), {
      'patlasv4-blk-nome': 'Envio formal', 'patlasv4-blk-tipo': 'Envio', 'patlasv4-blk-ordem': 4,
    }),
  ],
  activeExamplePresetId: 'patlasv4-blk-p-assin',
}

const formInstanciaWorkflow = {
  id: F_IWF, name: 'Instância de Workflow', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-iwf-dados', 'Instância', 'play_circle'),
    sec('sec-patlasv4-iwf-refs', 'Referências', 'link'),
    sec('sec-patlasv4-iwf-datas', 'Datas', 'event'),
  ], defaultCanvasMode: 'read',
  metadata: 'Instância em execução vinculada a documento, proposta ou contrato.',
  fields: [
    f('patlasv4-iwf-workflow', 'Workflow', 'reference', { required: true, linkedFormId: F_WFL, sectionId: 'sec-patlasv4-iwf-dados' }),
    f('patlasv4-iwf-bloco-atual', 'Bloco atual', 'reference', { linkedFormId: F_BLK, sectionId: 'sec-patlasv4-iwf-dados' }),
    f('patlasv4-iwf-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_INSTANCIA, sectionId: 'sec-patlasv4-iwf-dados', spec: VALIDACOES.V15 }),
    f('patlasv4-iwf-proposta', 'Proposta', 'reference', { linkedFormId: F_PRP, sectionId: 'sec-patlasv4-iwf-refs' }),
    f('patlasv4-iwf-documento', 'Documento', 'reference', { linkedFormId: F_DGD, sectionId: 'sec-patlasv4-iwf-refs' }),
    f('patlasv4-iwf-contrato', 'Contrato', 'reference', { linkedFormId: F_CTR, sectionId: 'sec-patlasv4-iwf-refs' }),
    f('patlasv4-iwf-data-inicio', 'Data início', 'date', { sectionId: 'sec-patlasv4-iwf-datas' }),
    f('patlasv4-iwf-data-conclusao', 'Data conclusão', 'date', { sectionId: 'sec-patlasv4-iwf-datas' }),
    f('patlasv4-iwf-pendencias', 'Pendências', 'embeddedReference', { multiple: true, linkedFormId: F_PAS, embeddedDisplay: 'table', size: 'large', sectionId: 'sec-patlasv4-iwf-dados' }),
  ],
  methods: [
    m('patlasv4-iwf-meth-iniciar', 'Iniciar instância', 'play_arrow', 'destaque'),
    m('patlasv4-iwf-meth-avancar', 'Avançar bloco', 'skip_next', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlasv4-iwf-p-prop', 'Instância PROP-2026-001', pick(0), {
      'patlasv4-iwf-status': 'Em andamento', 'patlasv4-iwf-data-inicio': '2026-02-08',
    }),
  ],
  activeExamplePresetId: 'patlasv4-iwf-p-prop',
}

const formPendenciaAssinatura = {
  id: F_PAS, name: 'Pendência de Assinatura', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-pas-fluxo', 'Fluxo', 'account_tree'),
    sec('sec-patlasv4-pas-result', 'Resultado', 'fact_check'),
  ], defaultCanvasMode: 'read',
  metadata: 'Pendência de assinatura por cargo com pessoa/usuário designados readOnly.',
  fields: [
    f('patlasv4-pas-instancia', 'Instância workflow', 'reference', { required: true, linkedFormId: F_IWF, sectionId: 'sec-patlasv4-pas-fluxo' }),
    f('patlasv4-pas-bloco', 'Bloco', 'reference', { required: true, linkedFormId: F_BLK, sectionId: 'sec-patlasv4-pas-fluxo' }),
    f('patlasv4-pas-cargo-exigido', 'Cargo exigido', 'reference', { required: true, linkedFormId: F_CGF, sectionId: 'sec-patlasv4-pas-fluxo' }),
    f('patlasv4-pas-pessoa-designada', 'Pessoa designada', 'reference', { readOnly: true, linkedFormId: F_PES, sectionId: 'sec-patlasv4-pas-fluxo' }),
    f('patlasv4-pas-usuario-designado', 'Usuário designado', 'reference', { readOnly: true, linkedFormId: F_USR, sectionId: 'sec-patlasv4-pas-fluxo' }),
    f('patlasv4-pas-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PENDENCIA, sectionId: 'sec-patlasv4-pas-fluxo', spec: VALIDACOES.V15 }),
    f('patlasv4-pas-resultado', 'Resultado', 'textOptions', { options: RESULTADO_PENDENCIA, relevance: 'highlight', sectionId: 'sec-patlasv4-pas-result' }),
    f('patlasv4-pas-motivo', 'Motivo ajuste/reprovação', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv4-pas-result' }),
    f('patlasv4-pas-data-conclusao', 'Data conclusão', 'date', { sectionId: 'sec-patlasv4-pas-result' }),
  ],
  methods: [
    m('patlasv4-pas-meth-assinar', 'Assinar', 'verified', 'destaque'),
    m('patlasv4-pas-meth-ajuste', 'Solicitar ajuste', 'edit_note', 'menu'),
    m('patlasv4-pas-meth-reprovar', 'Reprovar', 'cancel', 'menu'),
    m('patlasv4-pas-meth-resolver', 'Resolver assinante', 'person_search', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlasv4-pas-p-pend', 'Pendência — Assinatura', pick(0), {
      'patlasv4-pas-status': 'Pendente',
    }),
    p('patlasv4-pas-p-assinado', 'Assinado', pick(2), {
      'patlasv4-pas-status': 'Concluída', 'patlasv4-pas-resultado': 'Assinado',
    }),
  ],
  activeExamplePresetId: 'patlasv4-pas-p-pend',
}

// ============================================================================
// FORMS 26–37 — ENVIO, CONTRATO, INTEGRAÇÃO, TRANSVERSAL, PAINEL
// ============================================================================

const formEnvioProposta = {
  id: F_ENV, name: 'Envio da Proposta', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv4-env-proposta', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP }),
    f('patlasv4-env-documento', 'Documento', 'reference', { required: true, linkedFormId: F_DGD }),
    f('patlasv4-env-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG }),
    f('patlasv4-env-canal', 'Canal', 'textOptions', { required: true, options: CANAL_ENVIO }),
    f('patlasv4-env-destinatarios', 'Destinatários', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlasv4-env-data', 'Data de envio', 'date', { required: true, relevance: 'highlight' }),
    f('patlasv4-env-enviado-por', 'Enviado por', 'reference', { linkedFormId: F_PES }),
    f('patlasv4-env-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_ENVIO }),
  ],
  methods: [
    m('patlasv4-env-meth-enviar', 'Enviar proposta', 'send', 'destaque'),
    m('patlasv4-env-meth-reenviar', 'Reenviar', 'forward_to_inbox', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-env-p-sema', 'SEMA — E-mail enviado', pick(0), {
      'patlasv4-env-canal': 'E-mail', 'patlasv4-env-destinatarios': 'juliana.pereira@sema.mt.gov.br',
      'patlasv4-env-data': '2026-02-27', 'patlasv4-env-status': 'Enviado',
    }),
  ],
  activeExamplePresetId: 'patlasv4-env-p-sema',
}

const formContratacaoExterna = {
  id: F_EXT, name: 'Contratação Externa', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv4-ext-proposta', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP }),
    f('patlasv4-ext-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG }),
    f('patlasv4-ext-status', 'Status externo', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_EXTERNO }),
    f('patlasv4-ext-apoio', 'Apoio prestado', 'text', { size: 'large', textLong: true }),
    f('patlasv4-ext-ultimo-contato', 'Último contato', 'date'),
    f('patlasv4-ext-responsavel', 'Responsável MTI', 'reference', { linkedFormId: F_PES }),
  ],
  methods: [
    m('patlasv4-ext-meth-receber', 'Marcar contrato recebido', 'inventory_2', 'destaque'),
    m('patlasv4-ext-meth-registrar', 'Registrar contato', 'contact_phone', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-ext-p-aguard', 'SEMA — Aguardando cliente', pick(6), {
      'patlasv4-ext-status': 'Aguardando cliente', 'patlasv4-ext-ultimo-contato': '2026-03-01',
    }),
  ],
  activeExamplePresetId: 'patlasv4-ext-p-aguard',
}

const formContrato = {
  id: F_CTR, name: 'Contrato', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-ctr-dados', 'Dados', 'gavel'),
    sec('sec-patlasv4-ctr-itens', 'Itens', 'list_alt'),
    sec('sec-patlasv4-ctr-ops', 'Operacionalização', 'sync'),
  ], defaultCanvasMode: 'read',
  metadata: 'Contrato recebido com processoSigadoc e arquivo obrigatório.',
  fields: [
    f('patlasv4-ctr-numero', 'Número do contrato', 'text', { required: true, relevance: 'identity', sectionId: 'sec-patlasv4-ctr-dados' }),
    f('patlasv4-ctr-proposta', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP, sectionId: 'sec-patlasv4-ctr-dados' }),
    f('patlasv4-ctr-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv4-ctr-dados' }),
    f('patlasv4-ctr-processo-sigadoc', 'Processo SigaDoc', 'text', { relevance: 'highlight', sectionId: 'sec-patlasv4-ctr-dados' }),
    f('patlasv4-ctr-anexo', 'Anexo do contrato', 'file', { required: true, size: 'large', sectionId: 'sec-patlasv4-ctr-dados', spec: VALIDACOES.V09 }),
    f('patlasv4-ctr-data-retorno', 'Data retorno à MTI', 'date', { required: true, sectionId: 'sec-patlasv4-ctr-dados' }),
    f('patlasv4-ctr-data-inicio', 'Data início vigência', 'date', { sectionId: 'sec-patlasv4-ctr-dados' }),
    f('patlasv4-ctr-data-fim', 'Data fim vigência', 'date', { sectionId: 'sec-patlasv4-ctr-dados' }),
    f('patlasv4-ctr-itens', 'Itens contratados', 'embeddedReference', { multiple: true, linkedFormId: F_CTI, embeddedDisplay: 'table', size: 'large', sectionId: 'sec-patlasv4-ctr-itens' }),
    f('patlasv4-ctr-divergencia', 'Há divergência', 'boolean', { sectionId: 'sec-patlasv4-ctr-itens' }),
    f('patlasv4-ctr-tipo-divergencia', 'Tipo de divergência', 'textOptions', { options: TIPO_DIVERGENCIA, sectionId: 'sec-patlasv4-ctr-itens' }),
    f('patlasv4-ctr-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_CONTRATO, sectionId: 'sec-patlasv4-ctr-dados' }),
    f('patlasv4-ctr-cliente-cadastrado', 'Cliente cadastrado', 'boolean', { sectionId: 'sec-patlasv4-ctr-ops', spec: VALIDACOES.V21 }),
    f('patlasv4-ctr-credenciais-enviadas', 'Credenciais enviadas', 'boolean', { sectionId: 'sec-patlasv4-ctr-ops', spec: VALIDACOES.V21 }),
  ],
  methods: [
    m('patlasv4-ctr-meth-registrar', 'Registrar contrato', 'add_box', 'destaque'),
    m('patlasv4-ctr-meth-revisar-itens', 'Revisar itens', 'fact_check', 'destaque'),
    m('patlasv4-ctr-meth-credenciais', 'Enviar credenciais', 'mail', 'menu'),
    m('patlasv4-ctr-meth-handover', 'Gerar handover', 'description', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-ctr-p-001-sema', 'CT-2026-001 — SEMA', pick(0), {
      'patlasv4-ctr-numero': 'CT-2026-001', 'patlasv4-ctr-processo-sigadoc': 'SIGADOC-2026-88421',
      'patlasv4-ctr-data-retorno': '2026-03-01', 'patlasv4-ctr-data-inicio': '2026-04-01',
      'patlasv4-ctr-data-fim': '2027-03-31', 'patlasv4-ctr-status': 'Recebido', 'patlasv4-ctr-divergencia': false,
    }),
  ],
  activeExamplePresetId: 'patlasv4-ctr-p-001-sema',
}

const formItemContrato = {
  id: F_CTI, name: 'Item Contratado', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Quantidade proposta vs contratada e flag de divergência.',
  fields: [
    f('patlasv4-cti-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv4-cti-item-proposta', 'Item da proposta', 'reference', { required: true, linkedFormId: F_PRI }),
    f('patlasv4-cti-descricao', 'Descrição contratada', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true }),
    f('patlasv4-cti-qtd-proposta', 'Quantidade na proposta', 'decimal', { required: true }),
    f('patlasv4-cti-qtd-contratada', 'Quantidade contratada', 'decimal', { required: true, relevance: 'highlight' }),
    f('patlasv4-cti-divergencia', 'Divergência', 'boolean', { relevance: 'highlight' }),
    f('patlasv4-cti-valor-unitario', 'Valor unitário contratado', 'decimal', { currency: true, required: true }),
    f('patlasv4-cti-valor-total', 'Valor total contratado', 'decimal', { currency: true, required: true }),
  ],
  methods: [m('patlasv4-cti-meth-registrar-div', 'Registrar divergência', 'report', 'menu')],
  exampleValuePresets: [
    p('patlasv4-cti-p-conforme', 'Conforme proposta', pick(0), {
      'patlasv4-cti-descricao': 'MTI CLOUD - Infraestrutura híbrida',
      'patlasv4-cti-qtd-proposta': 1000, 'patlasv4-cti-qtd-contratada': 1000, 'patlasv4-cti-divergencia': false,
      'patlasv4-cti-valor-unitario': 1, 'patlasv4-cti-valor-total': 1000,
    }),
  ],
  activeExamplePresetId: 'patlasv4-cti-p-conforme',
}

const formIntegracaoContrato = {
  id: F_INT, name: 'Integração de Contrato', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Integrações Protheus, ServiceNow e SIAG rastreáveis por contrato.',
  fields: [
    f('patlasv4-int-sistema', 'Sistema', 'textOptions', { required: true, relevance: 'identity', options: SISTEMA_INTEGRACAO, spec: VALIDACOES.V22 }),
    f('patlasv4-int-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv4-int-proposta', 'Proposta', 'reference', { linkedFormId: F_PRP }),
    f('patlasv4-int-tipo', 'Tipo de evento', 'textOptions', { required: true, options: TIPO_INTEGRACAO_EVENTO }),
    f('patlasv4-int-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_INTEGRACAO }),
    f('patlasv4-int-data', 'Data do evento', 'date'),
    f('patlasv4-int-payload', 'Payload', 'text', { size: 'large', textLong: true }),
    f('patlasv4-int-retorno', 'Retorno', 'text', { size: 'large', textLong: true }),
    f('patlasv4-int-tentativas', 'Tentativas', 'number', { size: 'small' }),
  ],
  methods: [
    m('patlasv4-int-meth-registrar', 'Registrar integração', 'add_box', 'destaque'),
    m('patlasv4-int-meth-reprocessar', 'Reprocessar', 'replay', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-int-p-prot', 'Protheus — Confirmado', pick(0), {
      'patlasv4-int-sistema': 'Protheus', 'patlasv4-int-tipo': 'Cadastro', 'patlasv4-int-status': 'Confirmado',
    }),
    p('patlasv4-int-p-siag', 'SIAG — Enviado', pick(2), {
      'patlasv4-int-sistema': 'SIAG', 'patlasv4-int-tipo': 'Envio', 'patlasv4-int-status': 'Enviado',
    }),
  ],
  activeExamplePresetId: 'patlasv4-int-p-prot',
}

const formRecorrencia = {
  id: F_REC, name: 'Recorrência de Cobrança', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv4-rec-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv4-rec-item', 'Item contratado', 'reference', { required: true, linkedFormId: F_CTI }),
    f('patlasv4-rec-tipo', 'Tipo de recorrência', 'textOptions', { required: true, options: RECORRENCIA_ITEM }),
    f('patlasv4-rec-dia-competencia', 'Dia da competência', 'number', { size: 'small', relevance: 'highlight' }),
    f('patlasv4-rec-gerar-pv-automatico', 'Gerar PV automaticamente', 'boolean', { relevance: 'highlight' }),
    f('patlasv4-rec-valor', 'Valor recorrente', 'decimal', { currency: true }),
    f('patlasv4-rec-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_RECORRENCIA }),
  ],
  methods: [m('patlasv4-rec-meth-config', 'Configurar recorrência', 'event_repeat', 'destaque')],
  exampleValuePresets: [
    p('patlasv4-rec-p-mensal', 'Mensal — dia 5', pick(0), {
      'patlasv4-rec-tipo': 'Mensal', 'patlasv4-rec-dia-competencia': 5, 'patlasv4-rec-gerar-pv-automatico': true,
      'patlasv4-rec-status': 'Configurada',
    }),
  ],
  activeExamplePresetId: 'patlasv4-rec-p-mensal',
}

const formPublicacao = {
  id: F_PUB, name: 'Publicação do Contrato', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Publicação obrigatória com número, veículo e extrato.',
  fields: [
    f('patlasv4-pub-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv4-pub-numero', 'Número da publicação', 'text', { required: true, relevance: 'highlight', spec: VALIDACOES.V10 }),
    f('patlasv4-pub-data', 'Data da publicação', 'date', { required: true }),
    f('patlasv4-pub-extrato', 'Extrato', 'file', { size: 'large' }),
    f('patlasv4-pub-veiculo', 'Veículo', 'text', { size: 'large', required: true }),
    f('patlasv4-pub-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PUBLICACAO, spec: VALIDACOES.V08 }),
  ],
  methods: [
    m('patlasv4-pub-meth-registrar', 'Registrar publicação', 'campaign', 'destaque'),
    m('patlasv4-pub-meth-validar', 'Validar publicação', 'verified', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv4-pub-p-reg', 'DOE-MT — Registrada', pick(0), {
      'patlasv4-pub-numero': 'DOE-MT 2026-03-12 — Ed. 28.945', 'patlasv4-pub-data': '2026-03-12',
      'patlasv4-pub-veiculo': 'Diário Oficial do Estado de Mato Grosso', 'patlasv4-pub-status': 'Registrada',
    }),
  ],
  activeExamplePresetId: 'patlasv4-pub-p-reg',
}

const formHandover = {
  id: F_HOV, name: 'Handover', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Handover gerado antes do kick-off.',
  fields: [
    f('patlasv4-hov-numero', 'Número', 'text', { required: true, relevance: 'identity' }),
    f('patlasv4-hov-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv4-hov-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG }),
    f('patlasv4-hov-proposta', 'Proposta', 'reference', { linkedFormId: F_PRP }),
    f('patlasv4-hov-documento', 'Documento handover', 'reference', { linkedFormId: F_DGD }),
    f('patlasv4-hov-resp-pos', 'Responsável pós-vendas', 'reference', { required: true, linkedFormId: F_PES }),
    f('patlasv4-hov-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_HANDOVER, spec: VALIDACOES.V23 }),
    f('patlasv4-hov-data-geracao', 'Data geração', 'date'),
  ],
  methods: [
    m('patlasv4-hov-meth-gerar', 'Gerar handover', 'description', 'destaque'),
    m('patlasv4-hov-meth-enviar', 'Enviar ao pós-vendas', 'send', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlasv4-hov-p-gerado', 'HOV-2026-001 — Gerado', pick(0), {
      'patlasv4-hov-numero': 'HOV-2026-001', 'patlasv4-hov-status': 'Gerado', 'patlasv4-hov-data-geracao': '2026-03-13',
    }),
  ],
  activeExamplePresetId: 'patlasv4-hov-p-gerado',
}

const formKickoff = {
  id: F_KOF, name: 'Kick-off', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Kick-off vinculado ao handover com flags de notificação.',
  fields: [
    f('patlasv4-kof-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv4-kof-handover', 'Handover', 'reference', { linkedFormId: F_HOV }),
    f('patlasv4-kof-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG }),
    f('patlasv4-kof-data', 'Data prevista', 'date', { required: true, relevance: 'highlight' }),
    f('patlasv4-kof-notif-pos-disparada', 'Notificação pós-vendas disparada', 'boolean', { relevance: 'highlight' }),
    f('patlasv4-kof-notif-cliente-disparada', 'Notificação cliente disparada', 'boolean', { relevance: 'highlight' }),
    f('patlasv4-kof-participantes-mti', 'Participantes MTI', 'reference', { multiple: true, linkedFormId: F_PES }),
    f('patlasv4-kof-pauta', 'Pauta', 'text', { size: 'large', textLong: true }),
    f('patlasv4-kof-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_KICKOFF }),
  ],
  methods: [
    m('patlasv4-kof-meth-agendar', 'Agendar kick-off', 'event', 'destaque'),
    m('patlasv4-kof-meth-realizado', 'Marcar realizado', 'check_circle', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlasv4-kof-p-agendado', 'Kick-off SEMA agendado', pick(0), {
      'patlasv4-kof-data': '2026-03-22', 'patlasv4-kof-notif-pos-disparada': true,
      'patlasv4-kof-notif-cliente-disparada': true, 'patlasv4-kof-status': 'Agendado',
    }),
  ],
  activeExamplePresetId: 'patlasv4-kof-p-agendado',
}

const formHistorico = {
  id: F_HST, name: 'Histórico de Ação', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv4-hst-data', 'Data/hora', 'text', { required: true, relevance: 'highlight' }),
    f('patlasv4-hst-processo', 'Processo', 'text', { size: 'large', required: true }),
    f('patlasv4-hst-tipo', 'Tipo de evento', 'textOptions', { required: true, options: TIPO_HISTORICO }),
    f('patlasv4-hst-usuario', 'Responsável', 'reference', { linkedFormId: F_PES }),
    f('patlasv4-hst-descricao', 'Descrição', 'text', { size: 'large', textLong: true, required: true, relevance: 'identity' }),
  ],
  exampleValuePresets: [
    p('patlasv4-hst-p-criado', 'Proposta criada', pick(0), {
      'patlasv4-hst-data': '2026-02-05 10:24', 'patlasv4-hst-processo': 'PROP-2026-001',
      'patlasv4-hst-tipo': 'Criado', 'patlasv4-hst-descricao': 'Proposta criada a partir da demanda COT-2026-001.',
    }),
  ],
  activeExamplePresetId: 'patlasv4-hst-p-criado',
}

const formNotificacao = {
  id: F_NTF, name: 'Notificação', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv4-ntf-titulo', 'Título', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlasv4-ntf-tipo', 'Tipo', 'textOptions', { required: true, options: TIPO_NOTIFICACAO }),
    f('patlasv4-ntf-destinatario', 'Destinatário', 'text', { size: 'large', required: true }),
    f('patlasv4-ntf-canal', 'Canal', 'textOptions', { required: true, options: CANAL_NOTIFICACAO }),
    f('patlasv4-ntf-mensagem', 'Mensagem', 'text', { size: 'large', textLong: true, required: true }),
    f('patlasv4-ntf-processo', 'Processo', 'text', { size: 'large' }),
    f('patlasv4-ntf-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_NOTIFICACAO }),
    f('patlasv4-ntf-data', 'Data envio', 'date'),
  ],
  methods: [m('patlasv4-ntf-meth-reenviar', 'Reenviar', 'forward_to_inbox', 'destaque')],
  exampleValuePresets: [
    p('patlasv4-ntf-p-cred', 'Credenciais SEMA', pick(0), {
      'patlasv4-ntf-titulo': 'Credenciais de acesso', 'patlasv4-ntf-tipo': 'Cliente',
      'patlasv4-ntf-destinatario': 'juliana.pereira@sema.mt.gov.br', 'patlasv4-ntf-status': 'Enviada',
    }),
  ],
  activeExamplePresetId: 'patlasv4-ntf-p-cred',
}

const formPainelOperacional = {
  id: F_VOP, name: 'Painel Operacional', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv4-vop-dem', 'Demandas', 'inbox'),
    sec('sec-patlasv4-vop-prp', 'Propostas', 'request_quote'),
    sec('sec-patlasv4-vop-ctr', 'Contratos', 'gavel'),
    sec('sec-patlasv4-vop-fim', 'Encerramento', 'rocket_launch'),
  ], defaultCanvasMode: 'read',
  metadata: 'Painel operacional da Fase 1 com indicadores por fila.',
  fields: [
    f('patlasv4-vop-titulo', 'Título do painel', 'text', { required: true, relevance: 'identity', sectionId: 'sec-patlasv4-vop-dem' }),
    f('patlasv4-vop-dem-recebidas', 'Demandas recebidas', 'number', { size: 'small', sectionId: 'sec-patlasv4-vop-dem' }),
    f('patlasv4-vop-dem-analise', 'Demandas em análise', 'number', { size: 'small', sectionId: 'sec-patlasv4-vop-dem' }),
    f('patlasv4-vop-prp-rascunho', 'Propostas em rascunho', 'number', { size: 'small', sectionId: 'sec-patlasv4-vop-prp' }),
    f('patlasv4-vop-prp-assinatura', 'Propostas em assinatura', 'number', { size: 'small', sectionId: 'sec-patlasv4-vop-prp' }),
    f('patlasv4-vop-ctr-recebidos', 'Contratos recebidos', 'number', { size: 'small', sectionId: 'sec-patlasv4-vop-ctr' }),
    f('patlasv4-vop-pub-pend', 'Publicações pendentes', 'number', { size: 'small', sectionId: 'sec-patlasv4-vop-ctr' }),
    f('patlasv4-vop-int-erro', 'Integrações com erro', 'number', { size: 'small', sectionId: 'sec-patlasv4-vop-ctr' }),
    f('patlasv4-vop-hov-pend', 'Handovers pendentes', 'number', { size: 'small', sectionId: 'sec-patlasv4-vop-fim' }),
    f('patlasv4-vop-kof-pend', 'Kick-offs pendentes', 'number', { size: 'small', sectionId: 'sec-patlasv4-vop-fim' }),
    f('patlasv4-vop-filtro-cliente', 'Filtro cliente', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlasv4-vop-dem' }),
  ],
  methods: [m('patlasv4-vop-meth-atualizar', 'Atualizar painel', 'refresh', 'destaque')],
  exampleValuePresets: [
    p('patlasv4-vop-p-geral', 'Painel geral', pick(0), {
      'patlasv4-vop-titulo': 'Painel Fase 1 — Visão geral',
      'patlasv4-vop-dem-recebidas': 3, 'patlasv4-vop-dem-analise': 1,
      'patlasv4-vop-prp-rascunho': 1, 'patlasv4-vop-prp-assinatura': 1,
      'patlasv4-vop-ctr-recebidos': 2, 'patlasv4-vop-pub-pend': 1, 'patlasv4-vop-hov-pend': 1, 'patlasv4-vop-kof-pend': 1,
    }),
    p('patlasv4-vop-p-sema', 'Painel SEMA', pick(5), {
      'patlasv4-vop-titulo': 'Painel Fase 1 — SEMA',
      'patlasv4-vop-dem-recebidas': 1, 'patlasv4-vop-ctr-recebidos': 1,
    }),
  ],
  activeExamplePresetId: 'patlasv4-vop-p-geral',
}

// ============================================================================
// AGREGADO DE FORMS (38)
// ============================================================================

const forms = [
  formDominioSistema, formItemDominio,
  formOrganizacao, formSetorLotacao, formCargo, formPermissaoCargo, formPessoa, formUsuario,
  formProdutoVigente, formCatalogoLicenca, formCatalogoUniversal, formCodigoComercial, formCatalogoServico,
  formCatalogoParceria, formItemCatalogoParceria, formImportacaoCatalogoCsv,
  formDemanda, formTemplateDocumento, formProposta, formItemProposta, formSnapshotItemProposta,
  formDocumentoGerado,
  formWorkflow, formBlocoWorkflow, formInstanciaWorkflow, formPendenciaAssinatura,
  formEnvioProposta, formContratacaoExterna,
  formContrato, formItemContrato, formIntegracaoContrato, formRecorrencia, formPublicacao,
  formHandover, formKickoff,
  formHistorico, formNotificacao,
  formPainelOperacional,
]

// ============================================================================
// WORKSPACES (8)
// ============================================================================

const workspaces = [
  {
    id: 'ws-patlasv4-admin-config',
    name: 'Administração — Configuração',
    explorerChromeColor: '#6366f1',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'CF',
    packages: [
      { id: 'pkg-patlasv4-cfg-dom', name: 'Domínios', classes: [cls('cls-patlasv4-cfg-dom', 'Domínios do sistema', F_DOM)] },
      { id: 'pkg-patlasv4-cfg-idm', name: 'Itens de domínio', classes: [cls('cls-patlasv4-cfg-idm', 'Itens de domínio', F_IDM, ['patlasv4-idm-p-mti'])] },
    ],
  },
  {
    id: 'ws-patlasv4-org-estrutura',
    name: 'Organização e Estrutura',
    explorerChromeColor: '#1e40af',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'OR',
    packages: [
      { id: 'pkg-patlasv4-org-org', name: 'Organizações', classes: [cls('cls-patlasv4-org-org', 'Organizações', F_ORG, ['patlasv4-org-p-sema'])] },
      { id: 'pkg-patlasv4-org-set', name: 'Setores / Lotação', classes: [cls('cls-patlasv4-org-set', 'Setores', F_SET, ['patlasv4-set-p-dirc'])] },
    ],
  },
  {
    id: 'ws-patlasv4-pessoas-acesso',
    name: 'Pessoas e Acesso',
    explorerChromeColor: '#7c3aed',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'PA',
    packages: [
      { id: 'pkg-patlasv4-pa-cargo', name: 'Cargos', classes: [cls('cls-patlasv4-pa-cgf', 'Cargos / Funções', F_CGF)] },
      { id: 'pkg-patlasv4-pa-perm', name: 'Permissões', classes: [cls('cls-patlasv4-pa-prm', 'Permissões do cargo', F_PRM)] },
      {
        id: 'pkg-patlasv4-pa-pes-usr',
        name: 'Pessoa / Usuário',
        classes: [
          cls('cls-patlasv4-pa-pes', 'Pessoas', F_PES),
          cls('cls-patlasv4-pa-usr', 'Usuários', F_USR),
        ],
      },
    ],
  },
  {
    id: 'ws-patlasv4-catalogo',
    name: 'Catálogo Comercial',
    explorerChromeColor: '#0d9488',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'CT',
    packages: [
      { id: 'pkg-patlasv4-cat-pv', name: 'Produtos vigentes', classes: [cls('cls-patlasv4-cat-pv', 'Produtos vigentes', F_PV)] },
      { id: 'pkg-patlasv4-cat-lic', name: 'Licenças', classes: [cls('cls-patlasv4-cat-lic', 'Catálogo de Licenças', F_LIC)] },
      { id: 'pkg-patlasv4-cat-uni', name: 'Catálogo universal', classes: [cls('cls-patlasv4-cat-uni', 'Catálogo Universal (Tipo 3)', F_UNI, ['patlasv4-uni-p-cloud-usn', 'patlasv4-uni-p-moeda-hst'])] },
      { id: 'pkg-patlasv4-cat-cod', name: 'Códigos comerciais', classes: [cls('cls-patlasv4-cat-cod', 'Códigos comerciais', F_COD)] },
      { id: 'pkg-patlasv4-cat-srv', name: 'Serviços', classes: [cls('cls-patlasv4-cat-srv', 'Catálogo de Serviços', F_SRV)] },
      { id: 'pkg-patlasv4-cat-cpp', name: 'Por parceria', classes: [
        cls('cls-patlasv4-cat-cpp', 'Catálogo por Parceria', F_CPP),
        cls('cls-patlasv4-cat-icp', 'Itens catálogo parceria', F_ICP),
      ]},
      { id: 'pkg-patlasv4-cat-imp', name: 'Importação CSV', classes: [cls('cls-patlasv4-cat-imp', 'Importação CSV MTI', F_IMP)] },
    ],
  },
  {
    id: 'ws-patlasv4-processo',
    name: 'Processo Comercial',
    explorerChromeColor: '#b45309',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'PR',
    packages: [
      { id: 'pkg-patlasv4-prc-dem', name: 'Demandas', classes: [cls('cls-patlasv4-prc-dem', 'Demandas', F_DEM, ['patlasv4-dem-p-sema'])] },
      { id: 'pkg-patlasv4-prc-doc', name: 'Documentos', classes: [
        cls('cls-patlasv4-prc-tpl', 'Templates', F_TPL),
        cls('cls-patlasv4-prc-dgd', 'Documentos gerados', F_DGD),
      ]},
      { id: 'pkg-patlasv4-prc-prp', name: 'Propostas', classes: [
        cls('cls-patlasv4-prc-prp', 'Propostas', F_PRP, ['patlasv4-prp-p-sema-98', 'patlasv4-prp-p-seplag-simplifica']),
        cls('cls-patlasv4-prc-pri', 'Itens da proposta', F_PRI),
        cls('cls-patlasv4-prc-snp', 'Snapshots', F_SNP),
      ]},
      { id: 'pkg-patlasv4-prc-env', name: 'Envio e externo', classes: [
        cls('cls-patlasv4-prc-env', 'Envios', F_ENV),
        cls('cls-patlasv4-prc-ext', 'Contratação externa', F_EXT),
      ]},
    ],
  },
  {
    id: 'ws-patlasv4-workflow',
    name: 'Workflow',
    explorerChromeColor: '#0c1ba8',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'WF',
    packages: [
      { id: 'pkg-patlasv4-wfl-wfl', name: 'Workflows', classes: [cls('cls-patlasv4-wfl-wfl', 'Workflows', F_WFL)] },
      { id: 'pkg-patlasv4-wfl-blk', name: 'Blocos', classes: [cls('cls-patlasv4-wfl-blk', 'Blocos de workflow', F_BLK)] },
      { id: 'pkg-patlasv4-wfl-iwf', name: 'Instâncias', classes: [cls('cls-patlasv4-wfl-iwf', 'Instâncias de workflow', F_IWF)] },
      { id: 'pkg-patlasv4-wfl-pas', name: 'Pendências', classes: [cls('cls-patlasv4-wfl-pas', 'Pendências de assinatura', F_PAS, ['patlasv4-pas-p-pend'])] },
    ],
  },
  {
    id: 'ws-patlasv4-contrato',
    name: 'Contrato e Encerramento',
    explorerChromeColor: '#0369a1',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'CT',
    packages: [
      { id: 'pkg-patlasv4-ctr-ctr', name: 'Contratos', classes: [
        cls('cls-patlasv4-ctr-ctr', 'Contratos', F_CTR, ['patlasv4-ctr-p-001-sema']),
        cls('cls-patlasv4-ctr-cti', 'Itens contratados', F_CTI),
      ]},
      { id: 'pkg-patlasv4-ctr-int', name: 'Integrações', classes: [cls('cls-patlasv4-ctr-int', 'Integrações de contrato', F_INT)] },
      { id: 'pkg-patlasv4-ctr-rec', name: 'Recorrência', classes: [cls('cls-patlasv4-ctr-rec', 'Recorrências', F_REC)] },
      { id: 'pkg-patlasv4-ctr-pub', name: 'Publicação', classes: [cls('cls-patlasv4-ctr-pub', 'Publicações', F_PUB)] },
      { id: 'pkg-patlasv4-ctr-fim', name: 'Encerramento', classes: [
        cls('cls-patlasv4-ctr-hov', 'Handovers', F_HOV),
        cls('cls-patlasv4-ctr-kof', 'Kick-offs', F_KOF),
      ]},
    ],
  },
  {
    id: 'ws-patlasv4-operacional',
    name: 'Visão Operacional',
    explorerChromeColor: '#059669',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'VO',
    packages: [
      { id: 'pkg-patlasv4-op-vop', name: 'Painel', classes: [cls('cls-patlasv4-op-vop', 'Painel operacional', F_VOP)] },
      { id: 'pkg-patlasv4-op-trn', name: 'Transversal', classes: [
        cls('cls-patlasv4-op-hst', 'Histórico de ações', F_HST),
        cls('cls-patlasv4-op-ntf', 'Notificações', F_NTF),
      ]},
    ],
  },
]

// ============================================================================
// FLOW — ~30 etapas (step-patlasv4-f1-*)
// ============================================================================

const flow = {
  id: 'flow-patlasv4-fase1-jornada',
  name: 'Fase 1 — Jornada operacional configurável',
  metadata: 'Sistema configurável — domínios e workflow por blocos; não fixar diretorias DIRC/DTIC/Presidência no fluxo.',
  steps: [
    { id: 'step-patlasv4-f1-dominio', title: 'Configurar domínio', type: 'class', linkedFormId: F_DOM, classPresentationTitle: 'Domínio do sistema' },
    { id: 'step-patlasv4-f1-item-dominio', title: 'Itens de domínio', type: 'class', linkedFormId: F_IDM, classPresentationTitle: 'Itens configuráveis' },
    { id: 'step-patlasv4-f1-organizacao', title: 'Cadastrar organização', type: 'class', linkedFormId: F_ORG, classPresentationTitle: 'Organização', classPresentationDescription: 'MTI, Cliente ou Parceiro.' },
    { id: 'step-patlasv4-f1-setor', title: 'Cadastrar setor / lotação', type: 'class', linkedFormId: F_SET, classPresentationTitle: 'Setor / Lotação MTI' },
    { id: 'step-patlasv4-f1-cargo', title: 'Configurar cargo / função', type: 'class', linkedFormId: F_CGF, classPresentationTitle: 'Cargo / Função' },
    { id: 'step-patlasv4-f1-permissao', title: 'Permissões do cargo', type: 'class', linkedFormId: F_PRM, classPresentationTitle: 'Permissão do Cargo', classPresentationDescription: 'Entidade dedicada — não embedded no cargo.' },
    { id: 'step-patlasv4-f1-pessoa', title: 'Cadastrar pessoa', type: 'class', linkedFormId: F_PES, classPresentationTitle: 'Pessoa', classPresentationDescription: 'Sem RG/nascimento; validação Protheus para MTI.' },
    { id: 'step-patlasv4-f1-usuario', title: 'Cadastrar usuário', type: 'class', linkedFormId: F_USR, classPresentationTitle: 'Usuário', classPresentationDescription: 'Permissões efetivas somente leitura.' },
    {
      id: 'step-patlasv4-f1-catalogo-card',
      title: 'Consultar catálogo comercial',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Catálogo Comercial',
      htmlContent: `<div style="padding:32px 48px;max-width:920px;margin:0 auto;font-family:Inter,system-ui,sans-serif;color:#0f172a;">
  <h1 style="font-size:1.65rem;margin:0 0 12px;color:#0d9488;">Catálogo Comercial Atlas V4</h1>
  <p style="line-height:1.55;color:#334155;">Produtos vigentes, licenças, serviços, códigos comerciais e catálogos por parceria com ingestão CSV MTI.</p>
  <ul style="line-height:1.7;color:#334155;">
    <li>Seleção de itens alimenta composição da proposta com snapshot imutável.</li>
    <li>Catálogo Universal para contratação Tipo 3 (métrica/ecossistema).</li>
    <li>Códigos SIAG/Protheus por tipo de contratação 1/2/3.</li>
  </ul>
</div>`,
    },
    { id: 'step-patlasv4-f1-pv', title: 'Produto vigente', type: 'class', linkedFormId: F_PV, classPresentationTitle: 'Produto Vigente', classMethodNavigateStepIds: { 'patlasv4-pv-meth-selecionar': 'step-patlasv4-f1-demanda' } },
    { id: 'step-patlasv4-f1-universal', title: 'Catálogo universal (Tipo 3)', type: 'class', linkedFormId: F_UNI, classPresentationTitle: 'Catálogo Universal', classPresentationDescription: 'Métrica universal/ecossistema — origem de itens Tipo 3.' },
    { id: 'step-patlasv4-f1-lic-srv', title: 'Licenças e serviços', type: 'workspace', linkedWorkspaceId: 'ws-patlasv4-catalogo', workspacePresentationDescription: 'Licenças, serviços e catálogo por parceria.' },
    { id: 'step-patlasv4-f1-demanda', title: 'Registrar demanda', type: 'class', linkedFormId: F_DEM, classMethodNavigateStepIds: { 'patlasv4-dem-meth-proposta': 'step-patlasv4-f1-proposta' } },
    { id: 'step-patlasv4-f1-proposta', title: 'Montar proposta', type: 'class', linkedFormId: F_PRP, classMethodNavigateStepIds: { 'patlasv4-prp-meth-montar': 'step-patlasv4-f1-item', 'patlasv4-prp-meth-gerar-doc': 'step-patlasv4-f1-documento', 'patlasv4-prp-meth-wf': 'step-patlasv4-f1-workflow' } },
    { id: 'step-patlasv4-f1-item', title: 'Itens da proposta', type: 'class', linkedFormId: F_PRI, classPresentationTitle: 'Item da proposta', classMethodNavigateStepIds: { 'patlasv4-pri-meth-adicionar': 'step-patlasv4-f1-snapshot' } },
    { id: 'step-patlasv4-f1-snapshot', title: 'Snapshot imutável', type: 'class', linkedFormId: F_SNP, classPresentationTitle: 'Snapshot do item', classPresentationDescription: 'Dados congelados — imutável após geração.' },
    { id: 'step-patlasv4-f1-template', title: 'Selecionar template', type: 'class', linkedFormId: F_TPL, classPresentationTitle: 'Template de documento' },
    { id: 'step-patlasv4-f1-documento', title: 'Gerar documento', type: 'class', linkedFormId: F_DGD, classMethodNavigateStepIds: { 'patlasv4-dgd-meth-assinar': 'step-patlasv4-f1-workflow' } },
    { id: 'step-patlasv4-f1-workflow', title: 'Configurar workflow', type: 'class', linkedFormId: F_WFL, classPresentationTitle: 'Workflow configurável', classMethodNavigateStepIds: { 'patlasv4-wfl-meth-ativar': 'step-patlasv4-f1-bloco' } },
    { id: 'step-patlasv4-f1-bloco', title: 'Blocos de workflow', type: 'class', linkedFormId: F_BLK, classPresentationTitle: 'Bloco configurável' },
    { id: 'step-patlasv4-f1-instancia', title: 'Instância de workflow', type: 'class', linkedFormId: F_IWF, classMethodNavigateStepIds: { 'patlasv4-iwf-meth-iniciar': 'step-patlasv4-f1-pendencia' } },
    { id: 'step-patlasv4-f1-pendencia', title: 'Pendência de assinatura', type: 'class', linkedFormId: F_PAS, classMethodNavigateStepIds: { 'patlasv4-pas-meth-assinar': 'step-patlasv4-f1-envio' } },
    { id: 'step-patlasv4-f1-envio', title: 'Enviar proposta', type: 'class', linkedFormId: F_ENV, classMethodNavigateStepIds: { 'patlasv4-env-meth-enviar': 'step-patlasv4-f1-externo' } },
    { id: 'step-patlasv4-f1-externo', title: 'Contratação externa', type: 'class', linkedFormId: F_EXT, classMethodNavigateStepIds: { 'patlasv4-ext-meth-receber': 'step-patlasv4-f1-contrato' } },
    { id: 'step-patlasv4-f1-contrato', title: 'Registrar contrato', type: 'class', linkedFormId: F_CTR, classPresentationTitle: 'Contrato CT-2026-001', classMethodNavigateStepIds: { 'patlasv4-ctr-meth-revisar-itens': 'step-patlasv4-f1-itens', 'patlasv4-ctr-meth-credenciais': 'step-patlasv4-f1-credenciais', 'patlasv4-ctr-meth-handover': 'step-patlasv4-f1-handover' } },
    { id: 'step-patlasv4-f1-itens', title: 'Revisar itens contratados', type: 'class', linkedFormId: F_CTI, classPresentationTitle: 'Itens — proposta × contrato' },
    { id: 'step-patlasv4-f1-credenciais', title: 'Credenciais do cliente', type: 'class', linkedFormId: F_USR, classPresentationTitle: 'Enviar credenciais', classMethodNavigateStepIds: { 'patlasv4-usr-meth-cred': 'step-patlasv4-f1-integracoes' } },
    { id: 'step-patlasv4-f1-integracoes', title: 'Integrações', type: 'class', linkedFormId: F_INT, classPresentationTitle: 'Protheus, ServiceNow, SIAG' },
    { id: 'step-patlasv4-f1-recorrencia', title: 'Recorrência de cobrança', type: 'class', linkedFormId: F_REC, classPresentationTitle: 'Recorrência e PV automático' },
    { id: 'step-patlasv4-f1-publicacao', title: 'Publicação do contrato', type: 'class', linkedFormId: F_PUB, classPresentationTitle: 'Publicação obrigatória' },
    { id: 'step-patlasv4-f1-handover', title: 'Handover', type: 'class', linkedFormId: F_HOV, classMethodNavigateStepIds: { 'patlasv4-hov-meth-enviar': 'step-patlasv4-f1-kickoff' } },
    { id: 'step-patlasv4-f1-kickoff', title: 'Kick-off', type: 'class', linkedFormId: F_KOF, classMethodNavigateStepIds: { 'patlasv4-kof-meth-realizado': 'step-patlasv4-f1-fim' } },
    {
      id: 'step-patlasv4-f1-fim',
      title: 'Fim operacional da Fase 1',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Fase 1 encerrada',
      htmlContent: `<div style="padding:32px 48px;max-width:920px;margin:0 auto;font-family:Inter,system-ui,sans-serif;color:#0f172a;">
  <h1 style="font-size:1.85rem;margin:0 0 12px;color:#059669;">Fase 1 Atlas V4 concluída</h1>
  <p style="line-height:1.55;color:#334155;">Jornada demonstrada: domínios configuráveis → identidade → catálogo → demanda → proposta com snapshot imutável → workflow configurável → pendências por cargo → contrato CT-2026-001 → integrações → publicação → handover → kick-off.</p>
  <ul style="line-height:1.7;color:#334155;">
    <li>Sistema configurável — domínios e workflow não fixam DIRC/DTIC/Presidência.</li>
    <li>Permissões na entidade Permissão do Cargo; snapshot imutável; publicação mandatória.</li>
    <li>Integrações Protheus, ServiceNow e SIAG rastreáveis.</li>
  </ul>
</div>`,
    },
  ],
}

const flowApresentacao = buildFlowApresentacao()

const flows = [flow, flowApresentacao]

// ============================================================================
// CLASS-GROUPS (10)
// ============================================================================

const G_CONFIG = 'grp-patlasv4-config'
const G_IDENTIDADE = 'grp-patlasv4-identidade'
const G_CATALOGO = 'grp-patlasv4-catalogo'
const G_PROCESSO = 'grp-patlasv4-processo'
const G_DOCUMENTO = 'grp-patlasv4-documento'
const G_WORKFLOW = 'grp-patlasv4-workflow'
const G_CONTRATO = 'grp-patlasv4-contrato'
const G_INTEGRACAO = 'grp-patlasv4-integracao'
const G_TRANSVERSAL = 'grp-patlasv4-transversal'
const G_PAINEL = 'grp-patlasv4-painel'

const classGroups = {
  groups: [
    { id: G_CONFIG, name: 'Configuração' },
    { id: G_IDENTIDADE, name: 'Identidade' },
    { id: G_CATALOGO, name: 'Catálogo' },
    { id: G_PROCESSO, name: 'Processo' },
    { id: G_DOCUMENTO, name: 'Documento' },
    { id: G_WORKFLOW, name: 'Workflow' },
    { id: G_CONTRATO, name: 'Contrato' },
    { id: G_INTEGRACAO, name: 'Integração' },
    { id: G_TRANSVERSAL, name: 'Transversal' },
    { id: G_PAINEL, name: 'Painel' },
  ],
  assignments: {
    [F_DOM]: G_CONFIG, [F_IDM]: G_CONFIG,
    [F_ORG]: G_IDENTIDADE, [F_SET]: G_IDENTIDADE, [F_CGF]: G_IDENTIDADE,
    [F_PRM]: G_IDENTIDADE, [F_PES]: G_IDENTIDADE, [F_USR]: G_IDENTIDADE,
    [F_PV]: G_CATALOGO, [F_LIC]: G_CATALOGO, [F_UNI]: G_CATALOGO, [F_COD]: G_CATALOGO, [F_SRV]: G_CATALOGO,
    [F_CPP]: G_CATALOGO, [F_ICP]: G_CATALOGO, [F_IMP]: G_CATALOGO,
    [F_DEM]: G_PROCESSO, [F_PRP]: G_PROCESSO, [F_PRI]: G_PROCESSO, [F_SNP]: G_PROCESSO,
    [F_ENV]: G_PROCESSO, [F_EXT]: G_PROCESSO,
    [F_TPL]: G_DOCUMENTO, [F_DGD]: G_DOCUMENTO,
    [F_WFL]: G_WORKFLOW, [F_BLK]: G_WORKFLOW, [F_IWF]: G_WORKFLOW, [F_PAS]: G_WORKFLOW,
    [F_CTR]: G_CONTRATO, [F_CTI]: G_CONTRATO, [F_HOV]: G_CONTRATO, [F_KOF]: G_CONTRATO,
    [F_INT]: G_INTEGRACAO, [F_REC]: G_INTEGRACAO, [F_PUB]: G_INTEGRACAO,
    [F_HST]: G_TRANSVERSAL, [F_NTF]: G_TRANSVERSAL,
    [F_VOP]: G_PAINEL,
  },
  memberOrderByGroup: {
    [G_CONFIG]: [F_DOM, F_IDM],
    [G_IDENTIDADE]: [F_ORG, F_SET, F_CGF, F_PRM, F_PES, F_USR],
    [G_CATALOGO]: [F_PV, F_LIC, F_UNI, F_COD, F_SRV, F_CPP, F_ICP, F_IMP],
    [G_PROCESSO]: [F_DEM, F_PRP, F_PRI, F_SNP, F_ENV, F_EXT],
    [G_DOCUMENTO]: [F_TPL, F_DGD],
    [G_WORKFLOW]: [F_WFL, F_BLK, F_IWF, F_PAS],
    [G_CONTRATO]: [F_CTR, F_CTI, F_HOV, F_KOF],
    [G_INTEGRACAO]: [F_INT, F_REC, F_PUB],
    [G_TRANSVERSAL]: [F_HST, F_NTF],
    [G_PAINEL]: [F_VOP],
  },
}

// ============================================================================
// ESCRITA
// ============================================================================

if (!fs.existsSync(epicDir)) fs.mkdirSync(epicDir, { recursive: true })

fs.writeFileSync(path.join(subprojectDir, 'subproject.json'), JSON.stringify({ name: 'Atlas V4' }, null, 2) + '\n', 'utf-8')
fs.writeFileSync(path.join(epicDir, 'epic.json'), JSON.stringify({ name: 'Atlas V4 — Fase 1' }, null, 2) + '\n', 'utf-8')

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

console.log(`Atlas V4 — Fase 1 gerado em ${epicDir}`)
console.log(`  • forms.json          → ${forms.length} classes / ${totalFields} campos / ${totalMethods} métodos / ${totalPresets} presets`)
console.log(`  • workspaces.json     → ${workspaces.length} workspaces / ${totalPackages} pacotes / ${totalClasses} classes vinculadas`)
console.log(`  • flows.json          → ${flows.length} flows / ${totalSteps} etapas`)
flows.forEach((fl) => console.log(`      - ${fl.name} (${fl.steps.length} etapas)`))
console.log(`  • class-groups.json   → ${classGroups.groups.length} grupos`)

