/**
 * Atlas V3 — Fase 1
 *
 * Gera 4 arquivos do épico:
 *   data/subprojects/atlas-v3/epics/atlas-v3-fase1/
 *     - forms.json           (29 classes)
 *     - workspaces.json      (7 workspaces)
 *     - flows.json           (1 flow, 24 etapas)
 *     - class-groups.json    (9 grupos)
 *
 * Regenerar:   node scripts/build-atlas-v3-fase1.mjs
 *
 * Convenções:
 *   - IDs form-patlasv3-* / campos patlasv3-*
 *   - Permissões exclusivamente no Cargo/Função (PERMISSOES_CARGO)
 *   - Setor/Lotação substitui Estrutura MTI; sem tipo Unidade MTI em Organização
 *   - Status: textOptions + relevance:'highlight'
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PERMISSOES_CARGO } from './data/atlas-v3-permissoes.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas-v3/epics/atlas-v3-fase1')

// ============================================================================
// CONSTANTES DE DOMÍNIO
// ============================================================================

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const ESFERAS_PODER = ['Federal', 'Estadual', 'Municipal', 'Autarquia', 'Empresa pública', 'Outro']
const TIPOS_ORGANIZACAO = ['MTI', 'Cliente/Órgão', 'Parceiro']
const STATUS_ORG = ['Ativa', 'Inativa']

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
const PAPEL_ASSINATURA_CARGO = ['DIRC', 'DTIC', 'Presidência', 'Parceiro', 'Complementar', 'Outro']
const STATUS_CARGO = ['Ativo', 'Inativo', 'Em revisão']

const STATUS_PESSOA = ['Ativo', 'Inativo', 'Bloqueado', 'Substituído', 'Aguardando validação']
const VINCULO_PESSOA = ['MTI', 'Parceiro', 'Cliente', 'Outro']

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

const TIPO_CONTRATACAO = [
  'Tipo 1 — Objeto específico',
  'Tipo 2 — Catálogo do produto',
  'Tipo 3 — Catálogo geral/ecossistema',
]
const INDICE_REAJUSTE = ['IPCA', 'ICTI', 'Outro']
const MODELO_VENDA = ['Por Licença', 'Por Usuário', 'Por Pacote', 'Por Consumo', 'Por Catálogo', 'Outro']
const COMPLEXIDADE_SERVICO = ['Sem complexidade', 'Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta', 'Especial']
const CATEGORIA_SERVICO = [
  'Serviço técnico', 'Implantação', 'Sustentação', 'Consultoria',
  'Treinamento', 'Cloud', 'SaaS', 'Outro',
]

const STATUS_DEMANDA = [
  'Recebida', 'Em análise DIRC', 'Aguardando complemento', 'Aprovada para proposta',
  'Em composição de proposta', 'Enviada ao parceiro', 'Aguardando parceiro',
  'Convertida em proposta', 'Rejeitada', 'Cancelada',
]
const ORIGEM_DEMANDA = ['E-mail', 'WhatsApp', 'Marketplace/site comercial', 'Reunião', 'Parceiro', 'Portal futuro', 'Outro']
const TIPO_DEMANDA = [
  'Nova contratação', 'Renovação', 'Ampliação', 'Substituição',
  'Proposta complementar', 'Estudo de viabilidade', 'Outro',
]
const RESULTADO_DIRC = ['Prosseguir', 'Solicitar complemento', 'Enviar ao parceiro', 'Rejeitar', 'Cancelar']
const PRIORIDADE = ['Normal', 'Alta', 'Urgente']

const STATUS_PROPOSTA = [
  'Rascunho', 'Em composição', 'Em análise DIRC', 'Aguardando parceiro', 'Em revisão',
  'Documento gerado', 'Em assinatura', 'Aprovada', 'Enviada ao cliente',
  'Aguardando retorno do cliente', 'Contrato recebido', 'Contrato cadastrado',
  'Em Contratação', 'Suspensa', 'Cancelada',
]
const STATUS_ITEM_PROPOSTA = ['Em composição', 'Aceito', 'Ajustado', 'Substituído', 'Removido', 'Cancelado']
const ORIGEM_ITEM_PROPOSTA = ['Produto vigente', 'Licença', 'Serviço', 'Manual']
const RECORRENCIA_ITEM = ['Mensal', 'Anual', 'Sob demanda', 'Por execução', 'Única', 'Pro-rata']

const TIPO_DOCUMENTO_TEMPLATE = ['Proposta', 'Handover']
const CARDINALIDADE_TEMPLATE = ['1:1', '1:N']
const STATUS_DOC_TEMPLATE = ['Rascunho', 'Publicado', 'Arquivado', 'Substituído']
const STATUS_DOC_GERADO = [
  'Gerado', 'Em revisão', 'Enviado para assinatura', 'Assinado', 'Enviado ao cliente', 'Cancelado',
]

const DOMINIO_WORKFLOW = ['Proposta', 'Contrato', 'Documento', 'Assinatura', 'Handover', 'Outro']
const STATUS_WORKFLOW = ['Rascunho', 'Ativo', 'Suspenso', 'Substituído', 'Arquivado']
const TIPO_BLOCO = ['Assinatura', 'Revisão', 'Notificação', 'Ajuste', 'Envio']

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
const SISTEMA_INTEGRACAO = ['Protheus', 'ServiceNow', 'SIAG', 'CMDB futuro', 'Outro']
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

// IDs canônicos
const F_ORG = 'form-patlasv3-organizacao'
const F_SET = 'form-patlasv3-setor-lotacao'
const F_CGF = 'form-patlasv3-cargo-funcao'
const F_PES = 'form-patlasv3-pessoa'
const F_USR = 'form-patlasv3-usuario'
const F_PV = 'form-patlasv3-produto-vigente'
const F_LIC = 'form-patlasv3-catalogo-licenca'
const F_SRV = 'form-patlasv3-catalogo-servico'
const F_CPP = 'form-patlasv3-catalogo-parceria'
const F_DEM = 'form-patlasv3-demanda'
const F_PRP = 'form-patlasv3-proposta'
const F_PRI = 'form-patlasv3-proposta-item'
const F_TPL = 'form-patlasv3-template-documento'
const F_DGD = 'form-patlasv3-documento-gerado'
const F_FLW = 'form-patlasv3-fluxo-workflow'
const F_BLK = 'form-patlasv3-bloco-workflow'
const F_ASS = 'form-patlasv3-assinatura-documento'
const F_ENV = 'form-patlasv3-envio-proposta'
const F_EXT = 'form-patlasv3-contratacao-externa'
const F_CTR = 'form-patlasv3-contrato'
const F_CTI = 'form-patlasv3-contrato-item'
const F_REC = 'form-patlasv3-recorrencia-cobranca'
const F_PUB = 'form-patlasv3-publicacao-contrato'
const F_IGE = 'form-patlasv3-integracao-evento'
const F_HOV = 'form-patlasv3-handover'
const F_KOF = 'form-patlasv3-kickoff'
const F_HST = 'form-patlasv3-historico'
const F_NTF = 'form-patlasv3-notificacao'
const F_VOP = 'form-patlasv3-visao-operacional'

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
// FORM 1 — ORGANIZAÇÃO
// ============================================================================

const orgSec = [
  sec('sec-patlasv3-org-dados', 'Dados principais', 'business'),
  sec('sec-patlasv3-org-contatos', 'Contatos', 'contacts'),
  sec('sec-patlasv3-org-endereco', 'Endereço', 'location_on'),
  sec('sec-patlasv3-org-vinculos', 'Vínculos comerciais', 'hub'),
  sec('sec-patlasv3-org-status', 'Status', 'flag'),
]

const formOrganizacao = {
  id: F_ORG, name: 'Organização', sectionLayout: 'tabs', sections: orgSec, defaultCanvasMode: 'read',
  metadata: 'Cadastra MTI, clientes/órgãos e parceiros. Sem tipo Unidade MTI — lotação fica em Setor/Lotação.',
  fields: [
    f('patlasv3-org-codigo', 'Código', 'text', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlasv3-org-dados' }),
    f('patlasv3-org-nome', 'Nome / razão social', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv3-org-dados' }),
    f('patlasv3-org-fantasia', 'Nome fantasia', 'text', { sectionId: 'sec-patlasv3-org-dados' }),
    f('patlasv3-org-sigla', 'Sigla', 'text', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlasv3-org-dados' }),
    f('patlasv3-org-tipo', 'Tipo da organização', 'textOptions', { required: true, relevance: 'highlight', options: TIPOS_ORGANIZACAO, sectionId: 'sec-patlasv3-org-dados' }),
    f('patlasv3-org-cnpj', 'CNPJ', 'text', { relevance: 'highlight', sectionId: 'sec-patlasv3-org-dados' }),
    f('patlasv3-org-esfera', 'Esfera de poder', 'textOptions', { options: ESFERAS_PODER, sectionId: 'sec-patlasv3-org-dados' }),
    f('patlasv3-org-uf', 'UF', 'textOptions', { size: 'small', options: UFS, sectionId: 'sec-patlasv3-org-endereco' }),
    f('patlasv3-org-municipio', 'Município', 'text', { sectionId: 'sec-patlasv3-org-endereco' }),
    f('patlasv3-org-endereco', 'Endereço', 'text', { size: 'large', sectionId: 'sec-patlasv3-org-endereco' }),
    f('patlasv3-org-email', 'E-mail institucional', 'text', { sectionId: 'sec-patlasv3-org-contatos' }),
    f('patlasv3-org-emails-adic', 'E-mails adicionais', 'text', { multiple: true, size: 'large', sectionId: 'sec-patlasv3-org-contatos' }),
    f('patlasv3-org-telefone', 'Telefone', 'text', { sectionId: 'sec-patlasv3-org-contatos' }),
    f('patlasv3-org-contato-comercial', 'Contato comercial', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-org-vinculos' }),
    f('patlasv3-org-solucao-comercializada', 'Solução comercializada', 'textOptions', { options: SOLUCOES, sectionId: 'sec-patlasv3-org-vinculos', spec: 'Aplicável a parceiros.' }),
    f('patlasv3-org-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_ORG, sectionId: 'sec-patlasv3-org-status' }),
    f('patlasv3-org-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlasv3-org-status' }),
  ],
  methods: [
    m('patlasv3-org-meth-validar', 'Validar organização', 'verified', 'destaque'),
    m('patlasv3-org-meth-inativar', 'Inativar organização', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-org-p-mti', 'MTI', pick(0), {
      'patlasv3-org-codigo': 'ORG-MTI', 'patlasv3-org-nome': 'MTI — Companhia Mato-grossense de Tecnologia da Informação',
      'patlasv3-org-tipo': 'MTI', 'patlasv3-org-cnpj': '03.507.415/0001-44', 'patlasv3-org-sigla': 'MTI',
      'patlasv3-org-esfera': 'Estadual', 'patlasv3-org-uf': 'MT', 'patlasv3-org-municipio': 'Cuiabá', 'patlasv3-org-status': 'Ativa',
    }),
    p('patlasv3-org-p-atos', 'Parceiro — Atos Brasil', pick(3), {
      'patlasv3-org-codigo': 'ORG-ATOS', 'patlasv3-org-nome': 'Atos Brasil Tecnologia LTDA.',
      'patlasv3-org-tipo': 'Parceiro', 'patlasv3-org-fantasia': 'Atos Brasil', 'patlasv3-org-sigla': 'ATOS',
      'patlasv3-org-solucao-comercializada': 'MTI CLOUD', 'patlasv3-org-status': 'Ativa',
    }),
    p('patlasv3-org-p-zadara', 'Parceiro — Zadara', pick(4), {
      'patlasv3-org-codigo': 'ORG-ZADARA', 'patlasv3-org-nome': 'Zadara Storage Inc.',
      'patlasv3-org-tipo': 'Parceiro', 'patlasv3-org-sigla': 'ZADARA', 'patlasv3-org-solucao-comercializada': 'MTI CLOUD', 'patlasv3-org-status': 'Ativa',
    }),
    p('patlasv3-org-p-sema', 'Cliente — SEMA', pick(5), {
      'patlasv3-org-codigo': 'ORG-SEMA', 'patlasv3-org-nome': 'Secretaria de Estado de Meio Ambiente',
      'patlasv3-org-tipo': 'Cliente/Órgão', 'patlasv3-org-sigla': 'SEMA', 'patlasv3-org-uf': 'MT', 'patlasv3-org-status': 'Ativa',
    }),
    p('patlasv3-org-p-seplag', 'Cliente — SEPLAG', pick(6), {
      'patlasv3-org-codigo': 'ORG-SEPLAG', 'patlasv3-org-nome': 'Secretaria de Estado de Planejamento e Gestão',
      'patlasv3-org-tipo': 'Cliente/Órgão', 'patlasv3-org-sigla': 'SEPLAG', 'patlasv3-org-status': 'Ativa',
    }),
    p('patlasv3-org-p-setasc', 'Cliente — SETASC', pick(7), {
      'patlasv3-org-codigo': 'ORG-SETASC', 'patlasv3-org-nome': 'Secretaria de Estado de Assistência Social e Cidadania',
      'patlasv3-org-tipo': 'Cliente/Órgão', 'patlasv3-org-sigla': 'SETASC', 'patlasv3-org-status': 'Ativa',
    }),
  ],
  activeExamplePresetId: 'patlasv3-org-p-sema',
}

// ============================================================================
// FORM 2 — SETOR / LOTAÇÃO
// ============================================================================

const setSec = [
  sec('sec-patlasv3-set-ident', 'Identificação', 'account_tree'),
  sec('sec-patlasv3-set-hier', 'Hierarquia', 'device_hub'),
  sec('sec-patlasv3-set-resp', 'Responsável', 'badge'),
  sec('sec-patlasv3-set-status', 'Status', 'flag'),
]

const ORGANOGRAMA_SETORES = [
  { id: 'patlasv3-set-p-pres', codigo: 'SET-PRES', nome: 'Presidência', sigla: 'PRES', tipo: 'Presidência', nivel: '1' },
  { id: 'patlasv3-set-p-dirc', codigo: 'SET-DIRC', nome: 'Diretoria de Relacionamento com Cliente', sigla: 'DIRC', tipo: 'Diretoria', nivel: '2', parent: 'patlasv3-set-p-pres' },
  { id: 'patlasv3-set-p-dtic', codigo: 'SET-DTIC', nome: 'Diretoria de Tecnologia da Informação e Comunicação', sigla: 'DTIC', tipo: 'Diretoria', nivel: '2', parent: 'patlasv3-set-p-pres' },
  { id: 'patlasv3-set-p-daf', codigo: 'SET-DAF', nome: 'Diretoria de Gestão Administrativa', sigla: 'DAF', tipo: 'Diretoria', nivel: '2', parent: 'patlasv3-set-p-pres' },
  { id: 'patlasv3-set-p-cloud', codigo: 'SET-CLOUD', nome: 'Unidade Cloud', sigla: 'UCLOUD', tipo: 'Unidade', nivel: '3', parent: 'patlasv3-set-p-dtic' },
]

const setorPresets = ORGANOGRAMA_SETORES.map((row, idx) => p(row.id, `${row.sigla} — ${row.tipo}`, pick(idx), {
  'patlasv3-set-codigo': row.codigo,
  'patlasv3-set-nome': row.nome,
  'patlasv3-set-sigla': row.sigla,
  'patlasv3-set-tipo': row.tipo,
  'patlasv3-set-nivel': row.nivel,
  'patlasv3-set-status': 'Ativo',
}))

const formSetorLotacao = {
  id: F_SET, name: 'Setor / Lotação', sectionLayout: 'tabs', sections: setSec, defaultCanvasMode: 'read',
  metadata: 'Substitui Estrutura MTI. Organograma MTI com setor pai e responsável por pessoa.',
  fields: [
    f('patlasv3-set-codigo', 'Código', 'text', { size: 'small', required: true, relevance: 'highlight', sectionId: 'sec-patlasv3-set-ident' }),
    f('patlasv3-set-nome', 'Nome do setor', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv3-set-ident' }),
    f('patlasv3-set-sigla', 'Sigla', 'text', { size: 'small', relevance: 'highlight', sectionId: 'sec-patlasv3-set-ident' }),
    f('patlasv3-set-org-mti', 'Organização MTI', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv3-set-ident' }),
    f('patlasv3-set-tipo', 'Tipo de setor', 'textOptions', { required: true, relevance: 'highlight', options: TIPOS_SETOR, sectionId: 'sec-patlasv3-set-ident' }),
    f('patlasv3-set-nivel', 'Nível hierárquico', 'textOptions', { required: true, options: NIVEIS_SETOR, sectionId: 'sec-patlasv3-set-hier' }),
    f('patlasv3-set-pai', 'Setor pai', 'reference', { linkedFormId: F_SET, sectionId: 'sec-patlasv3-set-hier' }),
    f('patlasv3-set-responsavel', 'Responsável', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-set-resp' }),
    f('patlasv3-set-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_SETOR, sectionId: 'sec-patlasv3-set-status' }),
    f('patlasv3-set-obs', 'Observações', 'text', { size: 'large', textLong: true, relevance: 'advanced', sectionId: 'sec-patlasv3-set-status' }),
  ],
  methods: [
    m('patlasv3-set-meth-revisar', 'Revisar setor', 'edit_note', 'menu'),
    m('patlasv3-set-meth-inativar', 'Inativar setor', 'block', 'menu'),
  ],
  exampleValuePresets: setorPresets,
  activeExamplePresetId: 'patlasv3-set-p-dirc',
}

// ============================================================================
// FORM 3 — CARGO / FUNÇÃO (permissões aqui)
// ============================================================================

const formCargo = {
  id: F_CGF, name: 'Cargo / Função', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv3-cgf-dados', 'Dados', 'badge'),
    sec('sec-patlasv3-cgf-perm', 'Permissões e assinatura', 'admin_panel_settings'),
    sec('sec-patlasv3-cgf-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Permissões e assinatura ficam no cargo — não na pessoa nem no usuário.',
  fields: [
    f('patlasv3-cgf-codigo', 'Código', 'text', { size: 'small', required: true, sectionId: 'sec-patlasv3-cgf-dados' }),
    f('patlasv3-cgf-nome', 'Nome do cargo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv3-cgf-dados' }),
    f('patlasv3-cgf-sigla', 'Sigla', 'text', { size: 'small', sectionId: 'sec-patlasv3-cgf-dados' }),
    f('patlasv3-cgf-tipo', 'Tipo de cargo', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_CARGO, sectionId: 'sec-patlasv3-cgf-dados' }),
    f('patlasv3-cgf-org', 'Organização', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlasv3-cgf-dados' }),
    f('patlasv3-cgf-setor', 'Setor MTI', 'reference', { linkedFormId: F_SET, sectionId: 'sec-patlasv3-cgf-dados' }),
    f('patlasv3-cgf-permissoes', 'Permissões', 'textOptions', { multiple: true, required: true, relevance: 'highlight', options: PERMISSOES_CARGO, sectionId: 'sec-patlasv3-cgf-perm' }),
    f('patlasv3-cgf-pode-assinar', 'Pode assinar', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlasv3-cgf-perm' }),
    f('patlasv3-cgf-papel-assinatura', 'Papel de assinatura', 'textOptions', { options: PAPEL_ASSINATURA_CARGO, sectionId: 'sec-patlasv3-cgf-perm' }),
    f('patlasv3-cgf-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_CARGO, sectionId: 'sec-patlasv3-cgf-status' }),
  ],
  methods: [m('patlasv3-cgf-meth-config-perm', 'Configurar permissões', 'tune', 'destaque')],
  exampleValuePresets: [
    p('patlasv3-cgf-p-dirc-dir', 'Diretor DIRC', pick(1), {
      'patlasv3-cgf-codigo': 'CGF-DIRC-DIR', 'patlasv3-cgf-nome': 'Diretor DIRC', 'patlasv3-cgf-tipo': 'Diretor',
      'patlasv3-cgf-permissoes': ['Assinar como DIRC', 'Aprovar proposta como parceiro', 'Consultar painel operacional'],
      'patlasv3-cgf-pode-assinar': true, 'patlasv3-cgf-papel-assinatura': 'DIRC', 'patlasv3-cgf-status': 'Ativo',
    }),
    p('patlasv3-cgf-p-dirc-anal', 'Analista DIRC', pick(0), {
      'patlasv3-cgf-codigo': 'CGF-DIRC-AN', 'patlasv3-cgf-nome': 'Analista DIRC', 'patlasv3-cgf-tipo': 'Analista',
      'patlasv3-cgf-permissoes': ['Registrar demanda', 'Criar proposta', 'Adicionar item à proposta', 'Consultar catálogo'],
      'patlasv3-cgf-status': 'Ativo',
    }),
    p('patlasv3-cgf-p-pres', 'Presidente', pick(2), {
      'patlasv3-cgf-codigo': 'CGF-PRES', 'patlasv3-cgf-nome': 'Presidente da MTI', 'patlasv3-cgf-tipo': 'Presidente',
      'patlasv3-cgf-permissoes': ['Assinar como Presidência'], 'patlasv3-cgf-pode-assinar': true,
      'patlasv3-cgf-papel-assinatura': 'Presidência', 'patlasv3-cgf-status': 'Ativo',
    }),
    p('patlasv3-cgf-p-dtic', 'Diretor DTIC', pick(3), {
      'patlasv3-cgf-codigo': 'CGF-DTIC', 'patlasv3-cgf-nome': 'Diretor DTIC', 'patlasv3-cgf-tipo': 'Diretor',
      'patlasv3-cgf-permissoes': ['Assinar como DTIC'], 'patlasv3-cgf-pode-assinar': true,
      'patlasv3-cgf-papel-assinatura': 'DTIC', 'patlasv3-cgf-status': 'Ativo',
    }),
    p('patlasv3-cgf-p-parc', 'Representante Parceiro', pick(5), {
      'patlasv3-cgf-codigo': 'CGF-PARC', 'patlasv3-cgf-nome': 'Representante Parceiro', 'patlasv3-cgf-tipo': 'Representante parceiro',
      'patlasv3-cgf-permissoes': ['Assinar como parceiro', 'Consultar proposta vinculada à parceria'],
      'patlasv3-cgf-pode-assinar': true, 'patlasv3-cgf-papel-assinatura': 'Parceiro', 'patlasv3-cgf-status': 'Ativo',
    }),
  ],
  activeExamplePresetId: 'patlasv3-cgf-p-dirc-anal',
}

// ============================================================================
// FORM 4 — PESSOA (sem permissões / sem pode assinar)
// ============================================================================

const pesSec = [
  sec('sec-patlasv3-pes-dados', 'Dados pessoais', 'person'),
  sec('sec-patlasv3-pes-contato', 'Contato', 'mail'),
  sec('sec-patlasv3-pes-vinc', 'Vínculo', 'business'),
  sec('sec-patlasv3-pes-status', 'Status', 'flag'),
]

const formPessoa = {
  id: F_PES, name: 'Pessoa', sectionLayout: 'tabs', sections: pesSec, defaultCanvasMode: 'read',
  metadata: 'Sem permissões diretas. Setor obrigatório para vínculo MTI. Assinatura via cargo.',
  fields: [
    f('patlasv3-pes-nome', 'Nome completo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv3-pes-dados' }),
    f('patlasv3-pes-cpf', 'CPF', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv3-pes-dados' }),
    f('patlasv3-pes-matricula', 'Matrícula', 'text', { sectionId: 'sec-patlasv3-pes-dados', spec: 'Obrigatória para MTI.' }),
    f('patlasv3-pes-email', 'E-mail', 'text', { required: true, sectionId: 'sec-patlasv3-pes-contato' }),
    f('patlasv3-pes-telefone', 'Telefone', 'text', { sectionId: 'sec-patlasv3-pes-contato' }),
    f('patlasv3-pes-vinculo', 'Tipo de vínculo', 'textOptions', { required: true, options: VINCULO_PESSOA, sectionId: 'sec-patlasv3-pes-vinc' }),
    f('patlasv3-pes-org', 'Organização', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv3-pes-vinc' }),
    f('patlasv3-pes-setor', 'Setor / lotação', 'reference', { linkedFormId: F_SET, sectionId: 'sec-patlasv3-pes-vinc', spec: 'Obrigatório para vínculo MTI.' }),
    f('patlasv3-pes-cargo', 'Cargo / função', 'reference', { linkedFormId: F_CGF, sectionId: 'sec-patlasv3-pes-vinc' }),
    f('patlasv3-pes-notif', 'Recebe notificações', 'boolean', { sectionId: 'sec-patlasv3-pes-vinc' }),
    f('patlasv3-pes-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PESSOA, sectionId: 'sec-patlasv3-pes-status' }),
    f('patlasv3-pes-obs', 'Observações', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-pes-status' }),
  ],
  methods: [
    m('patlasv3-pes-meth-validar', 'Validar pessoa', 'verified', 'destaque'),
    m('patlasv3-pes-meth-usuario', 'Vincular usuário', 'badge', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlasv3-pes-p-luis', 'Luis Santos — DIRC', pick(0), {
      'patlasv3-pes-nome': 'Luis Santos', 'patlasv3-pes-cpf': '012.345.678-90', 'patlasv3-pes-matricula': 'MTI-00214',
      'patlasv3-pes-email': 'luis.santos@mti.mt.gov.br', 'patlasv3-pes-vinculo': 'MTI', 'patlasv3-pes-status': 'Ativo',
    }),
    p('patlasv3-pes-p-pres', 'Presidente MTI', pick(2), {
      'patlasv3-pes-nome': 'Carlos Eduardo Santos', 'patlasv3-pes-vinculo': 'MTI', 'patlasv3-pes-status': 'Ativo',
    }),
    p('patlasv3-pes-p-parceiro', 'Felipe Garcia — Atos', pick(4), {
      'patlasv3-pes-nome': 'Felipe Garcia', 'patlasv3-pes-vinculo': 'Parceiro', 'patlasv3-pes-email': 'felipe.garcia@atosbrasil.com.br', 'patlasv3-pes-status': 'Ativo',
    }),
    p('patlasv3-pes-p-sema', 'Juliana — SEMA', pick(5), {
      'patlasv3-pes-nome': 'Juliana Pereira', 'patlasv3-pes-vinculo': 'Cliente',
      'patlasv3-pes-email': 'juliana.pereira@sema.mt.gov.br', 'patlasv3-pes-status': 'Aguardando validação',
    }),
  ],
  activeExamplePresetId: 'patlasv3-pes-p-luis',
}

// ============================================================================
// FORM 5 — USUÁRIO (permissão efetiva readOnly — sem perfil/grupos)
// ============================================================================

const formUsuario = {
  id: F_USR, name: 'Usuário', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv3-usr-acesso', 'Acesso', 'login'),
    sec('sec-patlasv3-usr-efetivo', 'Perfil efetivo', 'manage_accounts'),
    sec('sec-patlasv3-usr-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Organização, cargo e permissão efetiva derivados da pessoa/cargo — somente leitura.',
  fields: [
    f('patlasv3-usr-pessoa', 'Pessoa', 'reference', { required: true, linkedFormId: F_PES, sectionId: 'sec-patlasv3-usr-acesso' }),
    f('patlasv3-usr-login', 'Login', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv3-usr-acesso' }),
    f('patlasv3-usr-email', 'E-mail', 'text', { required: true, sectionId: 'sec-patlasv3-usr-acesso' }),
    f('patlasv3-usr-tipo', 'Tipo de usuário', 'textOptions', { required: true, options: TIPO_USUARIO, sectionId: 'sec-patlasv3-usr-acesso' }),
    f('patlasv3-usr-auth', 'Tipos de autenticação', 'textOptions', { multiple: true, required: true, options: TIPO_AUTENTICACAO, sectionId: 'sec-patlasv3-usr-acesso' }),
    f('patlasv3-usr-org-efetiva', 'Organização efetiva', 'reference', { readOnly: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv3-usr-efetivo' }),
    f('patlasv3-usr-cargo-efetivo', 'Cargo efetivo', 'reference', { readOnly: true, linkedFormId: F_CGF, sectionId: 'sec-patlasv3-usr-efetivo' }),
    f('patlasv3-usr-perm-efetiva', 'Permissão efetiva', 'text', { readOnly: true, size: 'large', textLong: true, sectionId: 'sec-patlasv3-usr-efetivo', spec: 'Consolidada do cargo — não editável no usuário.' }),
    f('patlasv3-usr-ativo', 'Ativo', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv3-usr-status' }),
    f('patlasv3-usr-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_USUARIO, sectionId: 'sec-patlasv3-usr-status' }),
    f('patlasv3-usr-ultimo-acesso', 'Último acesso', 'date', { readOnly: true, sectionId: 'sec-patlasv3-usr-status' }),
  ],
  methods: [
    m('patlasv3-usr-meth-cred', 'Enviar credenciais', 'mail', 'destaque'),
    m('patlasv3-usr-meth-bloquear', 'Bloquear usuário', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-usr-p-admin', 'Administrador — Luis', pick(0), {
      'patlasv3-usr-login': 'luis.santos', 'patlasv3-usr-email': 'luis.santos@mti.mt.gov.br',
      'patlasv3-usr-tipo': 'MTI', 'patlasv3-usr-auth': ['MT Login'], 'patlasv3-usr-ativo': true, 'patlasv3-usr-status': 'Ativo',
    }),
    p('patlasv3-usr-p-cliente-sema', 'Cliente SEMA — aguardando', pick(5), {
      'patlasv3-usr-login': 'juliana.sema', 'patlasv3-usr-tipo': 'Cliente', 'patlasv3-usr-auth': ['Gov.br'],
      'patlasv3-usr-ativo': false, 'patlasv3-usr-status': 'Aguardando primeiro acesso',
    }),
  ],
  activeExamplePresetId: 'patlasv3-usr-p-admin',
}

// ============================================================================
// FORM 6 — PRODUTO VIGENTE
// ============================================================================

const pvSec = [
  sec('sec-patlasv3-pv-ident', 'Identificação', 'inventory_2'),
  sec('sec-patlasv3-pv-cobr', 'Cobrança', 'paid'),
  sec('sec-patlasv3-pv-resp', 'Responsáveis', 'support_agent'),
  sec('sec-patlasv3-pv-cat', 'Catálogo', 'handshake'),
  sec('sec-patlasv3-pv-status', 'Status', 'flag'),
]

const formProdutoVigente = {
  id: F_PV, name: 'Produto Vigente', sectionLayout: 'tabs', sections: pvSec, defaultCanvasMode: 'read',
  metadata: 'Produto comercial vigente com códigos SIAG e Protheus.',
  fields: [
    f('patlasv3-pv-codigo', 'Código', 'text', { size: 'small', required: true, sectionId: 'sec-patlasv3-pv-ident' }),
    f('patlasv3-pv-siag', 'Código SIAG', 'text', { relevance: 'highlight', sectionId: 'sec-patlasv3-pv-ident' }),
    f('patlasv3-pv-protheus', 'Código Protheus', 'text', { relevance: 'highlight', sectionId: 'sec-patlasv3-pv-ident' }),
    f('patlasv3-pv-descricao', 'Descrição', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true, sectionId: 'sec-patlasv3-pv-ident' }),
    f('patlasv3-pv-solucao', 'Solução', 'textOptions', { required: true, options: SOLUCOES, sectionId: 'sec-patlasv3-pv-ident' }),
    f('patlasv3-pv-metrica', 'Métrica', 'textOptions', { required: true, options: METRICAS_PRODUTO, sectionId: 'sec-patlasv3-pv-cobr' }),
    f('patlasv3-pv-cobranca', 'Cobrança', 'textOptions', { required: true, options: COBRANCA, sectionId: 'sec-patlasv3-pv-cobr' }),
    f('patlasv3-pv-valor', 'Valor unitário', 'decimal', { required: true, currency: true, relevance: 'highlight', sectionId: 'sec-patlasv3-pv-cobr' }),
    f('patlasv3-pv-fator', 'Fator de conversão', 'decimal', { size: 'small', sectionId: 'sec-patlasv3-pv-cobr' }),
    f('patlasv3-pv-focal-vendas', 'Focal de vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-pv-resp' }),
    f('patlasv3-pv-focal-pos', 'Focal de pós-vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-pv-resp' }),
    f('patlasv3-pv-unidade-dtic', 'Unidade DTIC', 'reference', { required: true, linkedFormId: F_SET, sectionId: 'sec-patlasv3-pv-resp' }),
    f('patlasv3-pv-parceiro', 'Parceiro', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlasv3-pv-cat' }),
    f('patlasv3-pv-link-parceria', 'Link catálogo de parceria', 'text', { size: 'large', sectionId: 'sec-patlasv3-pv-cat' }),
    f('patlasv3-pv-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PRODUTO, sectionId: 'sec-patlasv3-pv-status' }),
    f('patlasv3-pv-obs', 'Observações', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-pv-status' }),
  ],
  methods: [
    m('patlasv3-pv-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
    m('patlasv3-pv-meth-bloquear', 'Bloquear comercialização', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-pv-p-cloud', 'MTI CLOUD — Zadara', pick(0), {
      'patlasv3-pv-codigo': 'PV-CLOUD-01', 'patlasv3-pv-descricao': 'MTI CLOUD - Infraestrutura em nuvem híbrida',
      'patlasv3-pv-solucao': 'MTI CLOUD', 'patlasv3-pv-metrica': 'USN', 'patlasv3-pv-cobranca': 'Sob Demanda',
      'patlasv3-pv-valor': 1, 'patlasv3-pv-siag': '0005315', 'patlasv3-pv-protheus': '32000192', 'patlasv3-pv-status': 'Ativo',
    }),
    p('patlasv3-pv-p-creditos', 'Créditos de Serviço em TIC', pick(1), {
      'patlasv3-pv-codigo': 'PV-MOEDA-01', 'patlasv3-pv-solucao': 'Moeda de Serviços', 'patlasv3-pv-metrica': 'HST',
      'patlasv3-pv-valor': 282.58, 'patlasv3-pv-siag': '0018787', 'patlasv3-pv-protheus': '32000598', 'patlasv3-pv-status': 'Ativo',
    }),
  ],
  activeExamplePresetId: 'patlasv3-pv-p-cloud',
}

// ============================================================================
// FORM 7 — CATÁLOGO DE LICENÇA (§6.3 — 6 códigos tipo 1/2/3)
// ============================================================================

const licSec = [
  sec('sec-patlasv3-lic-dados', 'Dados principais', 'license'),
  sec('sec-patlasv3-lic-cobr', 'Cobrança', 'paid'),
  sec('sec-patlasv3-lic-val', 'Valores', 'payments'),
  sec('sec-patlasv3-lic-cod', 'Códigos por tipo de contratação', 'qr_code_2'),
  sec('sec-patlasv3-lic-ref', 'Referência', 'history'),
]

const formCatalogoLicenca = {
  id: F_LIC, name: 'Catálogo de Licença', sectionLayout: 'tabs', sections: licSec, defaultCanvasMode: 'read',
  metadata: 'Catálogo consolidado §6.3: universal, individualizado, status parceria e códigos SIAG/Protheus por tipo 1/2/3.',
  fields: [
    f('patlasv3-lic-parceria', 'Parceria', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv3-lic-dados' }),
    f('patlasv3-lic-categoria', 'Categoria', 'text', { sectionId: 'sec-patlasv3-lic-dados' }),
    f('patlasv3-lic-part-number', 'PART Number', 'text', { sectionId: 'sec-patlasv3-lic-dados' }),
    f('patlasv3-lic-produto-catalogo', 'Produto do catálogo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv3-lic-dados' }),
    f('patlasv3-lic-descricao-solucao', 'Descrição da solução ofertada', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv3-lic-dados' }),
    f('patlasv3-lic-esp01', 'Especificação 01', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-lic-dados' }),
    f('patlasv3-lic-esp02', 'Especificação 02', 'text', { sectionId: 'sec-patlasv3-lic-dados' }),
    f('patlasv3-lic-esp03', 'Especificação 03', 'text', { sectionId: 'sec-patlasv3-lic-dados' }),
    f('patlasv3-lic-esp04', 'Especificação 04', 'text', { sectionId: 'sec-patlasv3-lic-dados' }),
    f('patlasv3-lic-metrica', 'Métrica', 'textOptions', { required: true, options: METRICAS_LICENCA, sectionId: 'sec-patlasv3-lic-cobr' }),
    f('patlasv3-lic-versao-catalogo', 'Versão do catálogo', 'text', { sectionId: 'sec-patlasv3-lic-cobr' }),
    f('patlasv3-lic-recorrencia', 'Recorrência', 'textOptions', { options: COBRANCA, sectionId: 'sec-patlasv3-lic-cobr' }),
    f('patlasv3-lic-modelo-venda', 'Modelo de venda', 'textOptions', { options: MODELO_VENDA, sectionId: 'sec-patlasv3-lic-cobr' }),
    f('patlasv3-lic-vigencia', 'Vigência', 'text', { sectionId: 'sec-patlasv3-lic-cobr' }),
    f('patlasv3-lic-universal', 'Universal', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv3-lic-cobr' }),
    f('patlasv3-lic-individualizado', 'Individualizado', 'boolean', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv3-lic-cobr' }),
    f('patlasv3-lic-valor-unitario', 'Valor unitário', 'decimal', { required: true, currency: true, relevance: 'highlight', sectionId: 'sec-patlasv3-lic-val' }),
    f('patlasv3-lic-custo-parceiro', 'Custo parceiro', 'decimal', { currency: true, sectionId: 'sec-patlasv3-lic-val' }),
    f('patlasv3-lic-markup', 'Markup', 'decimal', { size: 'small', sectionId: 'sec-patlasv3-lic-val' }),
    f('patlasv3-lic-dist-parceiro', 'Distribuição parceiro', 'decimal', { size: 'small', sectionId: 'sec-patlasv3-lic-val' }),
    f('patlasv3-lic-dist-mti', 'Distribuição MTI', 'decimal', { size: 'small', sectionId: 'sec-patlasv3-lic-val' }),
    f('patlasv3-lic-siag-tipo1', 'SIAG — Tipo 1 (objeto específico)', 'text', { sectionId: 'sec-patlasv3-lic-cod' }),
    f('patlasv3-lic-protheus-tipo1', 'Protheus — Tipo 1', 'text', { sectionId: 'sec-patlasv3-lic-cod' }),
    f('patlasv3-lic-siag-tipo2', 'SIAG — Tipo 2 (catálogo produto)', 'text', { sectionId: 'sec-patlasv3-lic-cod' }),
    f('patlasv3-lic-protheus-tipo2', 'Protheus — Tipo 2', 'text', { sectionId: 'sec-patlasv3-lic-cod' }),
    f('patlasv3-lic-siag-tipo3', 'SIAG — Tipo 3 (ecossistema)', 'text', { sectionId: 'sec-patlasv3-lic-cod' }),
    f('patlasv3-lic-protheus-tipo3', 'Protheus — Tipo 3', 'text', { sectionId: 'sec-patlasv3-lic-cod' }),
    f('patlasv3-lic-status-parceria', 'Status da parceria', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PARCERIA, sectionId: 'sec-patlasv3-lic-ref' }),
    f('patlasv3-lic-data-preco', 'Data atualização de preço', 'date', { sectionId: 'sec-patlasv3-lic-ref' }),
    f('patlasv3-lic-indice-reajuste', 'Último índice de reajuste', 'textOptions', { options: INDICE_REAJUSTE, sectionId: 'sec-patlasv3-lic-ref' }),
    f('patlasv3-lic-ultima-homologacao', 'Última homologação', 'text', { sectionId: 'sec-patlasv3-lic-ref' }),
    f('patlasv3-lic-obs', 'Observações', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-lic-ref' }),
  ],
  methods: [
    m('patlasv3-lic-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
    m('patlasv3-lic-meth-bloquear', 'Bloquear licença', 'block', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-lic-p-ws-5tb', 'Workspace Enterprise 5TB', pick(0), {
      'patlasv3-lic-produto-catalogo': 'MTI Workspace Enterprise Standard Ecrypto - 5 TB',
      'patlasv3-lic-metrica': 'USN', 'patlasv3-lic-valor-unitario': 1070.92,
      'patlasv3-lic-siag-tipo2': '111055', 'patlasv3-lic-protheus-tipo2': '32000089',
      'patlasv3-lic-universal': true, 'patlasv3-lic-individualizado': false, 'patlasv3-lic-status-parceria': 'Ativa',
    }),
    p('patlasv3-lic-p-simplifica', 'MTI Simplifica — VLCS', pick(2), {
      'patlasv3-lic-produto-catalogo': 'VLCS | Licenciamento como Serviço (Mensal)',
      'patlasv3-lic-valor-unitario': 32112.2, 'patlasv3-lic-universal': false, 'patlasv3-lic-individualizado': true,
      'patlasv3-lic-status-parceria': 'Ativa',
    }),
  ],
  activeExamplePresetId: 'patlasv3-lic-p-ws-5tb',
}

// ============================================================================
// FORM 8 — CATÁLOGO DE SERVIÇO (§6.4)
// ============================================================================

const srvSec = [
  sec('sec-patlasv3-srv-ident', 'Identificação', 'support_agent'),
  sec('sec-patlasv3-srv-cobr', 'Cobrança', 'paid'),
  sec('sec-patlasv3-srv-val', 'Valores', 'payments'),
  sec('sec-patlasv3-srv-cod', 'Códigos', 'qr_code_2'),
  sec('sec-patlasv3-srv-ref', 'Referência', 'history'),
]

const formCatalogoServico = {
  id: F_SRV, name: 'Catálogo de Serviço', sectionLayout: 'tabs', sections: srvSec, defaultCanvasMode: 'read',
  metadata: 'Catálogo consolidado §6.4 com complexidade, HST/UST e códigos por tipo de contratação.',
  fields: [
    f('patlasv3-srv-parceria', 'Parceria / nome comercial', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv3-srv-ident' }),
    f('patlasv3-srv-produto-catalogo', 'Produto do catálogo', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv3-srv-ident' }),
    f('patlasv3-srv-descricao', 'Descrição do serviço', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv3-srv-ident' }),
    f('patlasv3-srv-categoria', 'Categoria do objeto comercial', 'text', { required: true, sectionId: 'sec-patlasv3-srv-ident' }),
    f('patlasv3-srv-complexidade', 'Complexidade', 'textOptions', { required: true, options: COMPLEXIDADE_SERVICO, sectionId: 'sec-patlasv3-srv-ident' }),
    f('patlasv3-srv-metrica', 'Métrica', 'textOptions', { required: true, options: METRICAS_SERVICO, sectionId: 'sec-patlasv3-srv-cobr' }),
    f('patlasv3-srv-qtde-hst-ust', 'Quantidade HST/UST por execução', 'decimal', { sectionId: 'sec-patlasv3-srv-cobr' }),
    f('patlasv3-srv-versao-catalogo', 'Versão do catálogo', 'text', { sectionId: 'sec-patlasv3-srv-cobr' }),
    f('patlasv3-srv-tipo-cobranca', 'Tipo de cobrança', 'textOptions', { options: COBRANCA, sectionId: 'sec-patlasv3-srv-cobr' }),
    f('patlasv3-srv-recorrencia', 'Recorrência', 'textOptions', { options: RECORRENCIA_SERV, sectionId: 'sec-patlasv3-srv-cobr' }),
    f('patlasv3-srv-universal', 'Universal', 'boolean', { required: true, sectionId: 'sec-patlasv3-srv-cobr' }),
    f('patlasv3-srv-individualizado', 'Individualizado', 'boolean', { required: true, sectionId: 'sec-patlasv3-srv-cobr' }),
    f('patlasv3-srv-valor-unitario', 'Valor unitário', 'decimal', { required: true, currency: true, relevance: 'highlight', sectionId: 'sec-patlasv3-srv-val' }),
    f('patlasv3-srv-custo-parceiro', 'Custo parceiro', 'decimal', { currency: true, sectionId: 'sec-patlasv3-srv-val' }),
    f('patlasv3-srv-markup', 'Markup', 'decimal', { size: 'small', sectionId: 'sec-patlasv3-srv-val' }),
    f('patlasv3-srv-siag-tipo1', 'SIAG — Tipo 1', 'text', { sectionId: 'sec-patlasv3-srv-cod' }),
    f('patlasv3-srv-protheus-tipo1', 'Protheus — Tipo 1', 'text', { sectionId: 'sec-patlasv3-srv-cod' }),
    f('patlasv3-srv-siag-tipo2', 'SIAG — Tipo 2', 'text', { sectionId: 'sec-patlasv3-srv-cod' }),
    f('patlasv3-srv-protheus-tipo2', 'Protheus — Tipo 2', 'text', { sectionId: 'sec-patlasv3-srv-cod' }),
    f('patlasv3-srv-siag-tipo3', 'SIAG — Tipo 3', 'text', { sectionId: 'sec-patlasv3-srv-cod' }),
    f('patlasv3-srv-protheus-tipo3', 'Protheus — Tipo 3', 'text', { sectionId: 'sec-patlasv3-srv-cod' }),
    f('patlasv3-srv-status-parceria', 'Status da parceria', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PARCERIA, sectionId: 'sec-patlasv3-srv-ref' }),
    f('patlasv3-srv-data-preco', 'Data atualização de preço', 'date', { sectionId: 'sec-patlasv3-srv-ref' }),
    f('patlasv3-srv-obs', 'Observações / controle interno', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-srv-ref' }),
  ],
  methods: [
    m('patlasv3-srv-meth-selecionar', 'Selecionar para proposta', 'add_shopping_cart', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlasv3-srv-p-plano', 'Elaborar Plano de Projeto', pick(0), {
      'patlasv3-srv-produto-catalogo': 'Elaborar Plano de Projeto (Presencial)',
      'patlasv3-srv-complexidade': 'Média', 'patlasv3-srv-qtde-hst-ust': 10, 'patlasv3-srv-valor-unitario': 1610.20,
      'patlasv3-srv-metrica': 'UST', 'patlasv3-srv-status-parceria': 'Ativa',
    }),
    p('patlasv3-srv-p-cloud-impl', 'Implantação MTI Cloud', pick(1), {
      'patlasv3-srv-produto-catalogo': 'Implantação assistida — MTI Cloud',
      'patlasv3-srv-valor-unitario': 12500, 'patlasv3-srv-metrica': 'UST', 'patlasv3-srv-status-parceria': 'Ativa',
    }),
  ],
  activeExamplePresetId: 'patlasv3-srv-p-plano',
}

// ============================================================================
// FORM 9 — CATÁLOGO POR PARCERIA (ingestão CSV)
// ============================================================================

const formCatalogoParceria = {
  id: F_CPP, name: 'Catálogo por Parceria', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv3-cpp-ident', 'Parceria', 'handshake'),
    sec('sec-patlasv3-cpp-meta', 'Metadados da tabela', 'table_chart'),
    sec('sec-patlasv3-cpp-status', 'Status', 'flag'),
  ], defaultCanvasMode: 'read',
  metadata: 'Catálogo específico por parceria com colunas dinâmicas e ingestão CSV pela MTI.',
  fields: [
    f('patlasv3-cpp-parceria', 'Parceria', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv3-cpp-ident' }),
    f('patlasv3-cpp-nome-tabela', 'Nome da tabela', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv3-cpp-meta' }),
    f('patlasv3-cpp-colunas-metadata', 'Colunas dinâmicas (metadados)', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv3-cpp-meta', spec: 'JSON ou lista de colunas esperadas no CSV.' }),
    f('patlasv3-cpp-versao', 'Versão do catálogo', 'text', { sectionId: 'sec-patlasv3-cpp-meta' }),
    f('patlasv3-cpp-ultima-ingestao', 'Última ingestão CSV', 'date', { sectionId: 'sec-patlasv3-cpp-meta' }),
    f('patlasv3-cpp-responsavel-ingestao', 'Responsável ingestão', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-cpp-meta' }),
    f('patlasv3-cpp-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PARCERIA, sectionId: 'sec-patlasv3-cpp-status' }),
    f('patlasv3-cpp-obs', 'Observações', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-cpp-status' }),
  ],
  methods: [
    m('patlasv3-cpp-meth-ingestao', 'Executar ingestão CSV MTI', 'upload_file', 'destaque'),
    m('patlasv3-cpp-meth-selecionar', 'Selecionar item para proposta', 'add_shopping_cart', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-cpp-p-workspace', 'MTI WORKSPACE — catálogo parceria', pick(0), {
      'patlasv3-cpp-nome-tabela': 'catalogo_mti_workspace_v8',
      'patlasv3-cpp-colunas-metadata': 'part_number,produto,metrica,valor,universal,individualizado,status',
      'patlasv3-cpp-status': 'Ativa',
    }),
    p('patlasv3-cpp-p-cloud', 'MTI CLOUD — catálogo Zadara', pick(1), {
      'patlasv3-cpp-nome-tabela': 'catalogo_mti_cloud_zadara',
      'patlasv3-cpp-colunas-metadata': 'vcpu,ram,capacidade,valor_usn,siag,protheus',
      'patlasv3-cpp-status': 'Ativa',
    }),
  ],
  activeExamplePresetId: 'patlasv3-cpp-p-workspace',
}

// ============================================================================
// FORM 10 — DEMANDA
// ============================================================================

const formDemanda = {
  id: F_DEM, name: 'Demanda', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv3-dem-resumo', 'Resumo', 'summarize'),
    sec('sec-patlasv3-dem-cliente', 'Cliente', 'badge'),
    sec('sec-patlasv3-dem-necess', 'Necessidade', 'lightbulb'),
    sec('sec-patlasv3-dem-dirc', 'Análise DIRC', 'fact_check'),
  ], defaultCanvasMode: 'read',
  metadata: 'Demanda com flag procedente e status incluindo Aprovada para proposta.',
  fields: [
    f('patlasv3-dem-protocolo', 'Protocolo', 'text', { required: true, relevance: 'identity', sectionId: 'sec-patlasv3-dem-resumo' }),
    f('patlasv3-dem-origem', 'Origem', 'textOptions', { required: true, options: ORIGEM_DEMANDA, sectionId: 'sec-patlasv3-dem-resumo' }),
    f('patlasv3-dem-tipo', 'Tipo', 'textOptions', { required: true, options: TIPO_DEMANDA, sectionId: 'sec-patlasv3-dem-resumo' }),
    f('patlasv3-dem-data-receb', 'Data de recebimento', 'date', { required: true, sectionId: 'sec-patlasv3-dem-resumo' }),
    f('patlasv3-dem-procedente', 'Procedente', 'boolean', { relevance: 'highlight', sectionId: 'sec-patlasv3-dem-dirc' }),
    f('patlasv3-dem-cliente', 'Cliente/órgão', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv3-dem-cliente' }),
    f('patlasv3-dem-solicitante', 'Solicitante', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-dem-cliente' }),
    f('patlasv3-dem-parceiro', 'Parceiro de origem', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlasv3-dem-cliente' }),
    f('patlasv3-dem-solucao-solicitada', 'Solução solicitada', 'textOptions', { options: SOLUCOES, sectionId: 'sec-patlasv3-dem-necess' }),
    f('patlasv3-dem-descricao', 'Descrição da necessidade', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv3-dem-necess' }),
    f('patlasv3-dem-prioridade', 'Prioridade', 'textOptions', { options: PRIORIDADE, sectionId: 'sec-patlasv3-dem-necess' }),
    f('patlasv3-dem-resp-dirc', 'Responsável DIRC', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-dem-dirc' }),
    f('patlasv3-dem-resultado', 'Resultado da análise', 'textOptions', { options: RESULTADO_DIRC, sectionId: 'sec-patlasv3-dem-dirc' }),
    f('patlasv3-dem-justificativa', 'Justificativa', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-dem-dirc' }),
    f('patlasv3-dem-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DEMANDA, sectionId: 'sec-patlasv3-dem-resumo' }),
    f('patlasv3-dem-anexos', 'Anexos', 'file', { multiple: true, size: 'large', sectionId: 'sec-patlasv3-dem-necess' }),
  ],
  methods: [
    m('patlasv3-dem-meth-analisar', 'Analisar demanda', 'fact_check', 'destaque'),
    m('patlasv3-dem-meth-proposta', 'Criar proposta', 'request_quote', 'destaque'),
    m('patlasv3-dem-meth-rejeitar', 'Rejeitar demanda', 'thumb_down', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-dem-p-sema', 'COT-2026-001 — SEMA Cloud', pick(0), {
      'patlasv3-dem-protocolo': 'COT-2026-001', 'patlasv3-dem-origem': 'E-mail', 'patlasv3-dem-tipo': 'Nova contratação',
      'patlasv3-dem-data-receb': '2026-02-04', 'patlasv3-dem-solucao-solicitada': 'MTI CLOUD', 'patlasv3-dem-procedente': true,
      'patlasv3-dem-status': 'Aprovada para proposta',
    }),
    p('patlasv3-dem-p-setasc', 'COT-2026-003 — SETASC (complemento)', pick(6), {
      'patlasv3-dem-protocolo': 'COT-2026-003', 'patlasv3-dem-status': 'Aguardando complemento', 'patlasv3-dem-procedente': false,
    }),
  ],
  activeExamplePresetId: 'patlasv3-dem-p-sema',
}

// ============================================================================
// FORM 11 — PROPOSTA
// ============================================================================

const formProposta = {
  id: F_PRP, name: 'Proposta', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv3-prp-com', 'Comercial', 'request_quote'),
    sec('sec-patlasv3-prp-escopo', 'Escopo', 'description'),
    sec('sec-patlasv3-prp-itens', 'Itens', 'list_alt'),
    sec('sec-patlasv3-prp-doc', 'Documento', 'article'),
  ], defaultCanvasMode: 'read',
  metadata: 'Versão obrigatória, template vinculado, tipo 1/2/3 e status desde Rascunho.',
  fields: [
    f('patlasv3-prp-numero', 'Número', 'text', { required: true, relevance: 'identity', sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-versao', 'Versão', 'text', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-ano', 'Ano', 'number', { size: 'small', required: true, sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-data', 'Data', 'date', { required: true, sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-demanda', 'Demanda de origem', 'reference', { linkedFormId: F_DEM, sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-template', 'Template do documento', 'reference', { linkedFormId: F_TPL, sectionId: 'sec-patlasv3-prp-doc' }),
    f('patlasv3-prp-cliente', 'Cliente/órgão', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-uf', 'UF', 'textOptions', { size: 'small', options: UFS, sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-solucao', 'Solução principal', 'textOptions', { options: SOLUCOES, sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-tem-parceiro', 'Parceiro envolvido', 'boolean', { sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-parceiros', 'Parceiros', 'reference', { multiple: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-focal', 'Focal de vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-objetivo', 'Objetivo', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv3-prp-escopo' }),
    f('patlasv3-prp-escopo', 'Escopo resumido', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv3-prp-escopo' }),
    f('patlasv3-prp-tipo-contratacao', 'Tipo de contratação', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_CONTRATACAO, sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-vigencia-meses', 'Vigência (meses)', 'number', { sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-valor-total', 'Valor total previsto', 'decimal', { currency: true, relevance: 'highlight', sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-itens', 'Itens', 'embeddedReference', { multiple: true, linkedFormId: F_PRI, embeddedDisplay: 'table', size: 'large', sectionId: 'sec-patlasv3-prp-itens' }),
    f('patlasv3-prp-documento', 'Documento gerado', 'reference', { linkedFormId: F_DGD, sectionId: 'sec-patlasv3-prp-doc' }),
    f('patlasv3-prp-fluxo', 'Fluxo de workflow', 'reference', { linkedFormId: F_FLW, sectionId: 'sec-patlasv3-prp-doc' }),
    f('patlasv3-prp-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PROPOSTA, sectionId: 'sec-patlasv3-prp-com' }),
    f('patlasv3-prp-obs', 'Observações', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-prp-com' }),
  ],
  methods: [
    m('patlasv3-prp-meth-montar', 'Montar itens do catálogo', 'add_shopping_cart', 'destaque'),
    m('patlasv3-prp-meth-gerar-doc', 'Gerar documento', 'description', 'destaque'),
    m('patlasv3-prp-meth-wf', 'Submeter ao workflow', 'rocket_launch', 'destaque'),
    m('patlasv3-prp-meth-enviar', 'Enviar ao cliente', 'send', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-prp-p-sema-rascunho', 'PROP-2026-001 — SEMA (Rascunho)', pick(0), {
      'patlasv3-prp-numero': 'PROP-2026-001', 'patlasv3-prp-versao': '1.0', 'patlasv3-prp-ano': 2026,
      'patlasv3-prp-data': '2026-02-05', 'patlasv3-prp-solucao': 'MTI CLOUD', 'patlasv3-prp-tipo-contratacao': 'Tipo 2 — Catálogo do produto',
      'patlasv3-prp-valor-total': 240000, 'patlasv3-prp-status': 'Rascunho',
    }),
    p('patlasv3-prp-p-sema-enviada', 'Proposta SEMA — Enviada ao cliente', pick(5), {
      'patlasv3-prp-numero': 'PROP-2026-005', 'patlasv3-prp-versao': '2.0', 'patlasv3-prp-ano': 2026,
      'patlasv3-prp-tipo-contratacao': 'Tipo 2 — Catálogo do produto', 'patlasv3-prp-status': 'Enviada ao cliente',
    }),
    p('patlasv3-prp-p-98-suspensa', 'Proposta 98/2025 — Suspensa', pick(7), {
      'patlasv3-prp-numero': '98', 'patlasv3-prp-versao': '3.2', 'patlasv3-prp-ano': 2025, 'patlasv3-prp-status': 'Suspensa',
    }),
  ],
  activeExamplePresetId: 'patlasv3-prp-p-sema-rascunho',
}

// ============================================================================
// FORM 12 — ITEM DA PROPOSTA (snapshot)
// ============================================================================

const formItemProposta = {
  id: F_PRI, name: 'Item da Proposta', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv3-pri-origem', 'Origem', 'category'),
    sec('sec-patlasv3-pri-snap', 'Snapshot', 'content_copy'),
    sec('sec-patlasv3-pri-val', 'Valores', 'calculate'),
  ], defaultCanvasMode: 'read',
  metadata: 'Snapshot congelado — valor unitário protegido em leitura.',
  fields: [
    f('patlasv3-pri-proposta', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP, sectionId: 'sec-patlasv3-pri-origem' }),
    f('patlasv3-pri-origem', 'Origem', 'textOptions', { required: true, options: ORIGEM_ITEM_PROPOSTA, sectionId: 'sec-patlasv3-pri-origem' }),
    f('patlasv3-pri-produto', 'Produto vigente', 'reference', { linkedFormId: F_PV, sectionId: 'sec-patlasv3-pri-origem' }),
    f('patlasv3-pri-licenca', 'Licença', 'reference', { linkedFormId: F_LIC, sectionId: 'sec-patlasv3-pri-origem' }),
    f('patlasv3-pri-servico', 'Serviço', 'reference', { linkedFormId: F_SRV, sectionId: 'sec-patlasv3-pri-origem' }),
    f('patlasv3-pri-descricao', 'Descrição', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true, sectionId: 'sec-patlasv3-pri-snap' }),
    f('patlasv3-pri-metrica', 'Métrica', 'textOptions', { options: METRICAS_PRODUTO, sectionId: 'sec-patlasv3-pri-snap' }),
    f('patlasv3-pri-tipo-contratacao', 'Tipo de contratação', 'textOptions', { options: TIPO_CONTRATACAO, sectionId: 'sec-patlasv3-pri-snap' }),
    f('patlasv3-pri-parceiro', 'Parceiro', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlasv3-pri-snap' }),
    f('patlasv3-pri-versao-catalogo', 'Versão do catálogo', 'text', { sectionId: 'sec-patlasv3-pri-snap' }),
    f('patlasv3-pri-universal', 'Universal', 'boolean', { sectionId: 'sec-patlasv3-pri-snap' }),
    f('patlasv3-pri-individualizado', 'Individualizado', 'boolean', { sectionId: 'sec-patlasv3-pri-snap' }),
    f('patlasv3-pri-data-snapshot', 'Data do snapshot', 'date', { required: true, sectionId: 'sec-patlasv3-pri-snap' }),
    f('patlasv3-pri-siag', 'Código SIAG', 'text', { sectionId: 'sec-patlasv3-pri-snap' }),
    f('patlasv3-pri-protheus', 'Código Protheus', 'text', { sectionId: 'sec-patlasv3-pri-snap' }),
    f('patlasv3-pri-quantidade', 'Quantidade', 'decimal', { required: true, relevance: 'highlight', sectionId: 'sec-patlasv3-pri-val' }),
    f('patlasv3-pri-valor-unitario', 'Valor unitário', 'decimal', { readOnly: true, protected: true, currency: true, required: true, sectionId: 'sec-patlasv3-pri-val' }),
    f('patlasv3-pri-valor-total', 'Valor total', 'decimal', { currency: true, required: true, relevance: 'highlight', sectionId: 'sec-patlasv3-pri-val' }),
    f('patlasv3-pri-status', 'Status do item', 'textOptions', { options: STATUS_ITEM_PROPOSTA, relevance: 'highlight', sectionId: 'sec-patlasv3-pri-val' }),
  ],
  methods: [
    m('patlasv3-pri-meth-remover', 'Remover item', 'delete', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-pri-p-cloud', 'Snapshot — MTI Cloud USN', pick(1), {
      'patlasv3-pri-origem': 'Produto vigente', 'patlasv3-pri-descricao': 'MTI CLOUD - Infraestrutura híbrida',
      'patlasv3-pri-metrica': 'USN', 'patlasv3-pri-siag': '0005315', 'patlasv3-pri-protheus': '32000192',
      'patlasv3-pri-quantidade': 1000, 'patlasv3-pri-valor-unitario': 1, 'patlasv3-pri-valor-total': 1000,
      'patlasv3-pri-data-snapshot': '2026-02-06', 'patlasv3-pri-status': 'Em composição',
    }),
  ],
  activeExamplePresetId: 'patlasv3-pri-p-cloud',
}

// ============================================================================
// FORM 13 — TEMPLATE DE DOCUMENTO
// ============================================================================

const formTemplateDocumento = {
  id: F_TPL, name: 'Template de Documento', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv3-tpl-dados', 'Modelo', 'article'),
    sec('sec-patlasv3-tpl-param', 'Parâmetros', 'tune'),
  ], defaultCanvasMode: 'read',
  metadata: 'Proposta ou Handover; cardinalidade; seções obrigatórias; parâmetros embutidos.',
  fields: [
    f('patlasv3-tpl-nome', 'Nome do template', 'text', { size: 'large', required: true, relevance: 'identity', sectionId: 'sec-patlasv3-tpl-dados' }),
    f('patlasv3-tpl-tipo', 'Tipo', 'textOptions', { required: true, options: TIPO_DOCUMENTO_TEMPLATE, sectionId: 'sec-patlasv3-tpl-dados' }),
    f('patlasv3-tpl-cardinalidade', 'Cardinalidade', 'textOptions', { required: true, options: CARDINALIDADE_TEMPLATE, sectionId: 'sec-patlasv3-tpl-dados' }),
    f('patlasv3-tpl-secoes-obrigatorias', 'Seções obrigatórias', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-tpl-dados' }),
    f('patlasv3-tpl-versao', 'Versão', 'text', { required: true, sectionId: 'sec-patlasv3-tpl-dados' }),
    f('patlasv3-tpl-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DOC_TEMPLATE, sectionId: 'sec-patlasv3-tpl-dados' }),
    f('patlasv3-tpl-conteudo', 'Conteúdo HTML', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv3-tpl-dados' }),
    f('patlasv3-tpl-parametros', 'Parâmetros embutidos', 'text', { size: 'large', textLong: true, required: true, sectionId: 'sec-patlasv3-tpl-param', spec: 'JSON: placeholders, origem, obrigatoriedade.' }),
    f('patlasv3-tpl-obs', 'Observações', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-tpl-param' }),
  ],
  methods: [
    m('patlasv3-tpl-meth-publicar', 'Publicar template', 'publish', 'destaque'),
    m('patlasv3-tpl-meth-prev', 'Pré-visualizar', 'preview', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-tpl-p-proposta', 'Template proposta padrão', pick(0), {
      'patlasv3-tpl-nome': 'Proposta comercial — padrão MTI', 'patlasv3-tpl-tipo': 'Proposta',
      'patlasv3-tpl-cardinalidade': '1:1', 'patlasv3-tpl-versao': '4.0', 'patlasv3-tpl-status': 'Publicado',
      'patlasv3-tpl-secoes-obrigatorias': 'Capa, Objeto, Escopo, Valores, Vigência, Assinaturas',
      'patlasv3-tpl-parametros': '[{"nome":"cliente","placeholder":"{{cliente}}","obrigatorio":true}]',
    }),
    p('patlasv3-tpl-p-handover', 'Template handover', pick(2), {
      'patlasv3-tpl-nome': 'Handover técnico', 'patlasv3-tpl-tipo': 'Handover', 'patlasv3-tpl-cardinalidade': '1:N',
      'patlasv3-tpl-versao': '1.3', 'patlasv3-tpl-status': 'Publicado',
    }),
  ],
  activeExamplePresetId: 'patlasv3-tpl-p-proposta',
}

// ============================================================================
// FORM 14 — DOCUMENTO GERADO
// ============================================================================

const formDocumentoGerado = {
  id: F_DGD, name: 'Documento Gerado', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-dgd-titulo', 'Título', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlasv3-dgd-tipo', 'Tipo', 'textOptions', { required: true, options: [...TIPO_DOCUMENTO_TEMPLATE, 'Contrato'] }),
    f('patlasv3-dgd-proposta', 'Proposta', 'reference', { linkedFormId: F_PRP }),
    f('patlasv3-dgd-contrato', 'Contrato', 'reference', { linkedFormId: F_CTR }),
    f('patlasv3-dgd-template', 'Template', 'reference', { required: true, linkedFormId: F_TPL }),
    f('patlasv3-dgd-versao-template', 'Versão do template', 'text', { required: true }),
    f('patlasv3-dgd-versao-proposta', 'Versão da proposta', 'text'),
    f('patlasv3-dgd-arquivo', 'Arquivo', 'file'),
    f('patlasv3-dgd-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_DOC_GERADO }),
    f('patlasv3-dgd-data-geracao', 'Data de geração', 'date'),
    f('patlasv3-dgd-gerado-por', 'Gerado por', 'reference', { linkedFormId: F_PES }),
    f('patlasv3-dgd-obs', 'Observações', 'text', { size: 'large', textLong: true }),
  ],
  methods: [
    m('patlasv3-dgd-meth-assinar', 'Enviar para assinatura', 'edit_note', 'destaque'),
    m('patlasv3-dgd-meth-baixar', 'Baixar documento', 'download', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-dgd-p-sema', 'Proposta SEMA — Gerado', pick(0), {
      'patlasv3-dgd-titulo': 'Proposta PROP-2026-001 — SEMA', 'patlasv3-dgd-tipo': 'Proposta',
      'patlasv3-dgd-versao-template': '4.0', 'patlasv3-dgd-status': 'Gerado', 'patlasv3-dgd-data-geracao': '2026-02-07',
    }),
  ],
  activeExamplePresetId: 'patlasv3-dgd-p-sema',
}

// ============================================================================
// FORM 15 — FLUXO WORKFLOW (motor por blocos)
// ============================================================================

const formFluxoWorkflow = {
  id: F_FLW, name: 'Fluxo de Workflow', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Motor por blocos — domínio e status do fluxo.',
  fields: [
    f('patlasv3-flw-nome', 'Nome do fluxo', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlasv3-flw-dominio', 'Domínio', 'textOptions', { required: true, relevance: 'highlight', options: DOMINIO_WORKFLOW }),
    f('patlasv3-flw-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_WORKFLOW }),
    f('patlasv3-flw-versao', 'Versão', 'text', { size: 'small' }),
    f('patlasv3-flw-descricao', 'Descrição', 'text', { size: 'large', textLong: true }),
    f('patlasv3-flw-blocos', 'Blocos', 'embeddedReference', { multiple: true, linkedFormId: F_BLK, embeddedDisplay: 'table', size: 'large' }),
  ],
  methods: [
    m('patlasv3-flw-meth-ativar', 'Ativar fluxo', 'play_arrow', 'destaque'),
    m('patlasv3-flw-meth-suspender', 'Suspender fluxo', 'pause', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-flw-p-proposta', 'Aprovação de Proposta', pick(0), {
      'patlasv3-flw-nome': 'Aprovação de Proposta Comercial', 'patlasv3-flw-dominio': 'Proposta',
      'patlasv3-flw-status': 'Ativo', 'patlasv3-flw-versao': '3.0',
      'patlasv3-flw-descricao': 'DIRC → Parceiro → DTIC → Presidência → envio.',
    }),
  ],
  activeExamplePresetId: 'patlasv3-flw-p-proposta',
}

// ============================================================================
// FORM 16 — BLOCO WORKFLOW
// ============================================================================

const formBlocoWorkflow = {
  id: F_BLK, name: 'Bloco de Workflow', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-blk-nome', 'Nome do bloco', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlasv3-blk-tipo', 'Tipo de bloco', 'textOptions', { required: true, relevance: 'highlight', options: TIPO_BLOCO }),
    f('patlasv3-blk-ordem', 'Ordem', 'number', { size: 'small', required: true, relevance: 'highlight' }),
    f('patlasv3-blk-cargo-assinatura', 'Cargo de assinatura', 'reference', { linkedFormId: F_CGF }),
    f('patlasv3-blk-setor', 'Setor responsável', 'reference', { linkedFormId: F_SET }),
    f('patlasv3-blk-sla-dias', 'SLA (dias)', 'number', { size: 'small' }),
    f('patlasv3-blk-obs', 'Observações', 'text', { size: 'large', textLong: true }),
  ],
  exampleValuePresets: [
    p('patlasv3-blk-p-dirc', 'Assinatura DIRC', pick(0), {
      'patlasv3-blk-nome': 'Assinatura DIRC', 'patlasv3-blk-tipo': 'Assinatura', 'patlasv3-blk-ordem': 1,
    }),
    p('patlasv3-blk-p-dtic', 'Assinatura DTIC', pick(2), {
      'patlasv3-blk-nome': 'Assinatura DTIC', 'patlasv3-blk-tipo': 'Assinatura', 'patlasv3-blk-ordem': 3,
    }),
    p('patlasv3-blk-p-envio', 'Envio ao cliente', pick(5), {
      'patlasv3-blk-nome': 'Envio formal', 'patlasv3-blk-tipo': 'Envio', 'patlasv3-blk-ordem': 5,
    }),
  ],
  activeExamplePresetId: 'patlasv3-blk-p-dirc',
}

// ============================================================================
// FORM 17 — ASSINATURA DE DOCUMENTO (§10.2)
// ============================================================================

const formAssinaturaDocumento = {
  id: F_ASS, name: 'Assinatura de Documento', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv3-ass-doc', 'Documento', 'description'),
    sec('sec-patlasv3-ass-fluxo', 'Fluxo', 'account_tree'),
    sec('sec-patlasv3-ass-result', 'Resultado', 'fact_check'),
  ], defaultCanvasMode: 'read',
  metadata: '§10.2: documento, fluxo, etapa, cargo exigido, assinante, setor, resultado.',
  fields: [
    f('patlasv3-ass-documento', 'Documento', 'reference', { required: true, linkedFormId: F_DGD, sectionId: 'sec-patlasv3-ass-doc' }),
    f('patlasv3-ass-proposta', 'Proposta', 'reference', { linkedFormId: F_PRP, sectionId: 'sec-patlasv3-ass-doc' }),
    f('patlasv3-ass-fluxo', 'Fluxo de workflow', 'reference', { required: true, linkedFormId: F_FLW, sectionId: 'sec-patlasv3-ass-fluxo' }),
    f('patlasv3-ass-etapa-atual', 'Etapa atual', 'text', { relevance: 'highlight', sectionId: 'sec-patlasv3-ass-fluxo' }),
    f('patlasv3-ass-bloco', 'Bloco atual', 'reference', { linkedFormId: F_BLK, sectionId: 'sec-patlasv3-ass-fluxo' }),
    f('patlasv3-ass-cargo-exigido', 'Cargo exigido', 'reference', { required: true, linkedFormId: F_CGF, sectionId: 'sec-patlasv3-ass-fluxo' }),
    f('patlasv3-ass-pessoa-assinante', 'Pessoa assinante', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-ass-fluxo' }),
    f('patlasv3-ass-setor', 'Setor', 'reference', { linkedFormId: F_SET, sectionId: 'sec-patlasv3-ass-fluxo' }),
    f('patlasv3-ass-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_ASSINATURA, sectionId: 'sec-patlasv3-ass-fluxo' }),
    f('patlasv3-ass-data-envio', 'Data de envio', 'date', { sectionId: 'sec-patlasv3-ass-result' }),
    f('patlasv3-ass-data-assinatura', 'Data da assinatura', 'date', { sectionId: 'sec-patlasv3-ass-result' }),
    f('patlasv3-ass-resultado', 'Resultado', 'textOptions', { options: RESULTADO_ASSINATURA, relevance: 'highlight', sectionId: 'sec-patlasv3-ass-result' }),
    f('patlasv3-ass-motivo', 'Motivo ajuste/reprovação', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-ass-result' }),
    f('patlasv3-ass-obs', 'Observações', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-ass-result' }),
  ],
  methods: [
    m('patlasv3-ass-meth-assinar', 'Assinar', 'verified', 'destaque'),
    m('patlasv3-ass-meth-ajuste', 'Solicitar ajuste', 'edit_note', 'menu'),
    m('patlasv3-ass-meth-reprovar', 'Reprovar', 'cancel', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-ass-p-dirc-pend', 'DIRC — Pendente', pick(0), {
      'patlasv3-ass-etapa-atual': 'Assinatura DIRC', 'patlasv3-ass-status': 'Pendente',
    }),
    p('patlasv3-ass-p-parc-ass', 'Parceiro — Assinado', pick(2), {
      'patlasv3-ass-etapa-atual': 'Assinatura Parceiro', 'patlasv3-ass-status': 'Assinado', 'patlasv3-ass-resultado': 'Assinado',
    }),
  ],
  activeExamplePresetId: 'patlasv3-ass-p-dirc-pend',
}

// ============================================================================
// FORMS 18–29 — ENVIO, EXTERNO, CONTRATO, ITENS, RECORRÊNCIA, PUBLICAÇÃO,
//                 INTEGRAÇÃO, HANDOVER, KICKOFF, HISTÓRICO, NOTIFICAÇÃO, VISÃO
// ============================================================================

const formEnvioProposta = {
  id: F_ENV, name: 'Envio da Proposta', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-env-proposta', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP }),
    f('patlasv3-env-documento', 'Documento', 'reference', { required: true, linkedFormId: F_DGD }),
    f('patlasv3-env-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG }),
    f('patlasv3-env-canal', 'Canal', 'textOptions', { required: true, options: CANAL_ENVIO }),
    f('patlasv3-env-destinatarios', 'Destinatários', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlasv3-env-data', 'Data de envio', 'date', { required: true, relevance: 'highlight' }),
    f('patlasv3-env-enviado-por', 'Enviado por', 'reference', { linkedFormId: F_PES }),
    f('patlasv3-env-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_ENVIO }),
    f('patlasv3-env-obs', 'Observações', 'text', { size: 'large', textLong: true }),
  ],
  methods: [
    m('patlasv3-env-meth-enviar', 'Enviar proposta', 'send', 'destaque'),
    m('patlasv3-env-meth-reenviar', 'Reenviar', 'forward_to_inbox', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-env-p-sema', 'SEMA — E-mail enviado', pick(0), {
      'patlasv3-env-canal': 'E-mail', 'patlasv3-env-destinatarios': 'juliana.pereira@sema.mt.gov.br',
      'patlasv3-env-data': '2026-02-27', 'patlasv3-env-status': 'Enviado',
    }),
  ],
  activeExamplePresetId: 'patlasv3-env-p-sema',
}

const formContratacaoExterna = {
  id: F_EXT, name: 'Contratação Externa', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-ext-proposta', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP }),
    f('patlasv3-ext-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG }),
    f('patlasv3-ext-status', 'Status externo', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_EXTERNO }),
    f('patlasv3-ext-apoio', 'Apoio prestado', 'text', { size: 'large', textLong: true }),
    f('patlasv3-ext-ultimo-contato', 'Último contato', 'date'),
    f('patlasv3-ext-proxima-acao', 'Próxima ação', 'text', { size: 'large', textLong: true }),
    f('patlasv3-ext-responsavel', 'Responsável MTI', 'reference', { linkedFormId: F_PES }),
    f('patlasv3-ext-obs', 'Observações', 'text', { size: 'large', textLong: true }),
  ],
  methods: [
    m('patlasv3-ext-meth-receber', 'Marcar contrato recebido', 'inventory_2', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlasv3-ext-p-aguard', 'SEMA — Aguardando cliente', pick(6), {
      'patlasv3-ext-status': 'Aguardando cliente', 'patlasv3-ext-ultimo-contato': '2026-03-01',
    }),
  ],
  activeExamplePresetId: 'patlasv3-ext-p-aguard',
}

const formContrato = {
  id: F_CTR, name: 'Contrato', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv3-ctr-dados', 'Dados', 'gavel'),
    sec('sec-patlasv3-ctr-focais', 'Focais', 'groups'),
    sec('sec-patlasv3-ctr-itens', 'Itens', 'list_alt'),
    sec('sec-patlasv3-ctr-ops', 'Operacionalização', 'sync'),
  ], defaultCanvasMode: 'read',
  metadata: 'Integração SigaDoc, focais e datas do contrato recebido.',
  fields: [
    f('patlasv3-ctr-numero', 'Número do contrato', 'text', { required: true, relevance: 'identity', sectionId: 'sec-patlasv3-ctr-dados' }),
    f('patlasv3-ctr-proposta', 'Proposta', 'reference', { required: true, linkedFormId: F_PRP, sectionId: 'sec-patlasv3-ctr-dados' }),
    f('patlasv3-ctr-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG, sectionId: 'sec-patlasv3-ctr-dados' }),
    f('patlasv3-ctr-sigadoc', 'Referência SigaDoc', 'text', { relevance: 'highlight', sectionId: 'sec-patlasv3-ctr-dados' }),
    f('patlasv3-ctr-anexo', 'Anexo do contrato', 'file', { required: true, size: 'large', sectionId: 'sec-patlasv3-ctr-dados' }),
    f('patlasv3-ctr-data-retorno', 'Data retorno à MTI', 'date', { required: true, sectionId: 'sec-patlasv3-ctr-dados' }),
    f('patlasv3-ctr-data-inicio', 'Data início vigência', 'date', { sectionId: 'sec-patlasv3-ctr-dados' }),
    f('patlasv3-ctr-data-fim', 'Data fim vigência', 'date', { sectionId: 'sec-patlasv3-ctr-dados' }),
    f('patlasv3-ctr-focal-vendas', 'Focal de vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-ctr-focais' }),
    f('patlasv3-ctr-focal-pos', 'Focal de pós-vendas', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-ctr-focais' }),
    f('patlasv3-ctr-focal-tecnico', 'Focal técnico', 'reference', { linkedFormId: F_PES, sectionId: 'sec-patlasv3-ctr-focais' }),
    f('patlasv3-ctr-itens', 'Itens contratados', 'embeddedReference', { multiple: true, linkedFormId: F_CTI, embeddedDisplay: 'table', size: 'large', sectionId: 'sec-patlasv3-ctr-itens' }),
    f('patlasv3-ctr-divergencia', 'Há divergência', 'boolean', { sectionId: 'sec-patlasv3-ctr-itens' }),
    f('patlasv3-ctr-tipo-divergencia', 'Tipo de divergência', 'textOptions', { options: TIPO_DIVERGENCIA, sectionId: 'sec-patlasv3-ctr-itens' }),
    f('patlasv3-ctr-justif-divergencia', 'Justificativa', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-ctr-itens' }),
    f('patlasv3-ctr-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_CONTRATO, sectionId: 'sec-patlasv3-ctr-dados' }),
    f('patlasv3-ctr-cliente-cadastrado', 'Cliente cadastrado', 'boolean', { sectionId: 'sec-patlasv3-ctr-ops' }),
    f('patlasv3-ctr-credenciais-enviadas', 'Credenciais enviadas', 'boolean', { sectionId: 'sec-patlasv3-ctr-ops' }),
    f('patlasv3-ctr-obs', 'Observações', 'text', { size: 'large', textLong: true, sectionId: 'sec-patlasv3-ctr-ops' }),
  ],
  methods: [
    m('patlasv3-ctr-meth-registrar', 'Registrar contrato', 'add_box', 'destaque'),
    m('patlasv3-ctr-meth-revisar-itens', 'Revisar itens', 'fact_check', 'destaque'),
    m('patlasv3-ctr-meth-credenciais', 'Enviar credenciais', 'mail', 'menu'),
    m('patlasv3-ctr-meth-handover', 'Gerar handover', 'description', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-ctr-p-001-sema', 'CT-2026-001 — SEMA', pick(0), {
      'patlasv3-ctr-numero': 'CT-2026-001', 'patlasv3-ctr-sigadoc': 'SIGADOC-2026-88421',
      'patlasv3-ctr-data-retorno': '2026-03-01', 'patlasv3-ctr-data-inicio': '2026-04-01',
      'patlasv3-ctr-data-fim': '2027-03-31', 'patlasv3-ctr-status': 'Recebido', 'patlasv3-ctr-divergencia': false,
    }),
    p('patlasv3-ctr-p-002-seplag', 'CT-2026-002 — SEPLAG (divergência)', pick(6), {
      'patlasv3-ctr-numero': 'CT-2026-002', 'patlasv3-ctr-data-retorno': '2026-03-04',
      'patlasv3-ctr-status': 'Itens revisados', 'patlasv3-ctr-divergencia': true,
      'patlasv3-ctr-tipo-divergencia': 'Redução de escopo',
    }),
  ],
  activeExamplePresetId: 'patlasv3-ctr-p-001-sema',
}

const formContratoItem = {
  id: F_CTI, name: 'Item Contratado', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Quantidade proposta vs contratada e flag de divergência.',
  fields: [
    f('patlasv3-cti-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv3-cti-item-proposta', 'Item da proposta', 'reference', { required: true, linkedFormId: F_PRI }),
    f('patlasv3-cti-descricao', 'Descrição contratada', 'text', { size: 'large', required: true, relevance: 'identity', textLong: true }),
    f('patlasv3-cti-qtd-proposta', 'Quantidade na proposta', 'decimal', { required: true }),
    f('patlasv3-cti-qtd-contratada', 'Quantidade contratada', 'decimal', { required: true, relevance: 'highlight' }),
    f('patlasv3-cti-divergencia', 'Divergência', 'boolean', { relevance: 'highlight' }),
    f('patlasv3-cti-motivo-divergencia', 'Motivo da divergência', 'text', { size: 'large', textLong: true }),
    f('patlasv3-cti-valor-unitario', 'Valor unitário contratado', 'decimal', { currency: true, required: true }),
    f('patlasv3-cti-valor-total', 'Valor total contratado', 'decimal', { currency: true, required: true }),
    f('patlasv3-cti-metrica', 'Métrica', 'text', { size: 'small' }),
    f('patlasv3-cti-siag', 'Código SIAG', 'text'),
    f('patlasv3-cti-protheus', 'Código Protheus', 'text'),
    f('patlasv3-cti-obs', 'Observações', 'text', { size: 'large', textLong: true }),
  ],
  exampleValuePresets: [
    p('patlasv3-cti-p-conforme', 'Conforme proposta', pick(0), {
      'patlasv3-cti-descricao': 'MTI CLOUD - Infraestrutura híbrida',
      'patlasv3-cti-qtd-proposta': 1000, 'patlasv3-cti-qtd-contratada': 1000, 'patlasv3-cti-divergencia': false,
      'patlasv3-cti-valor-unitario': 1, 'patlasv3-cti-valor-total': 1000,
    }),
    p('patlasv3-cti-p-down', 'Redução de quantidade', pick(6), {
      'patlasv3-cti-qtd-proposta': 300, 'patlasv3-cti-qtd-contratada': 250, 'patlasv3-cti-divergencia': true,
      'patlasv3-cti-motivo-divergencia': 'Restrição orçamentária do cliente.',
    }),
  ],
  activeExamplePresetId: 'patlasv3-cti-p-conforme',
}

const formRecorrencia = {
  id: F_REC, name: 'Recorrência de Cobrança', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-rec-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv3-rec-item', 'Item contratado', 'reference', { required: true, linkedFormId: F_CTI }),
    f('patlasv3-rec-tipo', 'Tipo de recorrência', 'textOptions', { required: true, options: RECORRENCIA_ITEM }),
    f('patlasv3-rec-dia-competencia', 'Dia da competência', 'number', { size: 'small', relevance: 'highlight' }),
    f('patlasv3-rec-mes-competencia-anual', 'Mês da competência (anual)', 'number', { size: 'small' }),
    f('patlasv3-rec-gerar-pv-automatico', 'Gerar PV automaticamente', 'boolean', { relevance: 'highlight' }),
    f('patlasv3-rec-valor', 'Valor recorrente', 'decimal', { currency: true }),
    f('patlasv3-rec-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_RECORRENCIA }),
    f('patlasv3-rec-obs', 'Observações', 'text', { size: 'large', textLong: true }),
  ],
  methods: [m('patlasv3-rec-meth-config', 'Configurar recorrência', 'event_repeat', 'destaque')],
  exampleValuePresets: [
    p('patlasv3-rec-p-mensal', 'Mensal — dia 5', pick(0), {
      'patlasv3-rec-tipo': 'Mensal', 'patlasv3-rec-dia-competencia': 5, 'patlasv3-rec-gerar-pv-automatico': true,
      'patlasv3-rec-status': 'Configurada',
    }),
  ],
  activeExamplePresetId: 'patlasv3-rec-p-mensal',
}

const formPublicacao = {
  id: F_PUB, name: 'Publicação do Contrato', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-pub-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv3-pub-numero', 'Número da publicação', 'text', { required: true, relevance: 'highlight' }),
    f('patlasv3-pub-data', 'Data da publicação', 'date', { required: true }),
    f('patlasv3-pub-extrato', 'Extrato', 'file', { size: 'large' }),
    f('patlasv3-pub-veiculo', 'Veículo', 'text', { size: 'large' }),
    f('patlasv3-pub-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_PUBLICACAO }),
    f('patlasv3-pub-obs', 'Observações', 'text', { size: 'large', textLong: true }),
  ],
  methods: [
    m('patlasv3-pub-meth-registrar', 'Registrar publicação', 'campaign', 'destaque'),
    m('patlasv3-pub-meth-validar', 'Validar publicação', 'verified', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-pub-p-reg', 'DOE-MT — Registrada', pick(0), {
      'patlasv3-pub-numero': 'DOE-MT 2026-03-12 — Ed. 28.945', 'patlasv3-pub-data': '2026-03-12',
      'patlasv3-pub-status': 'Registrada',
    }),
    p('patlasv3-pub-p-invalida', 'Extrato inválido', pick(7), {
      'patlasv3-pub-numero': 'PEND-REV-001', 'patlasv3-pub-status': 'Inválida',
    }),
  ],
  activeExamplePresetId: 'patlasv3-pub-p-reg',
}

const formIntegracaoEvento = {
  id: F_IGE, name: 'Evento de Integração', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-ige-sistema', 'Sistema', 'textOptions', { required: true, relevance: 'identity', options: SISTEMA_INTEGRACAO }),
    f('patlasv3-ige-proposta', 'Proposta', 'reference', { linkedFormId: F_PRP }),
    f('patlasv3-ige-contrato', 'Contrato', 'reference', { linkedFormId: F_CTR }),
    f('patlasv3-ige-tipo', 'Tipo de evento', 'textOptions', { required: true, options: TIPO_INTEGRACAO_EVENTO }),
    f('patlasv3-ige-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_INTEGRACAO }),
    f('patlasv3-ige-data', 'Data do evento', 'date'),
    f('patlasv3-ige-payload', 'Payload', 'text', { size: 'large', textLong: true }),
    f('patlasv3-ige-retorno', 'Retorno', 'text', { size: 'large', textLong: true }),
    f('patlasv3-ige-justificativa', 'Justificativa', 'text', { size: 'large', textLong: true }),
    f('patlasv3-ige-tentativas', 'Tentativas', 'number', { size: 'small' }),
  ],
  methods: [
    m('patlasv3-ige-meth-registrar', 'Registrar evento', 'add_box', 'destaque'),
    m('patlasv3-ige-meth-reprocessar', 'Reprocessar', 'replay', 'menu'),
  ],
  exampleValuePresets: [
    p('patlasv3-ige-p-prot', 'Protheus — Confirmado', pick(0), {
      'patlasv3-ige-sistema': 'Protheus', 'patlasv3-ige-tipo': 'Cadastro', 'patlasv3-ige-status': 'Confirmado',
    }),
    p('patlasv3-ige-p-siag', 'SIAG — Enviado', pick(2), {
      'patlasv3-ige-sistema': 'SIAG', 'patlasv3-ige-tipo': 'Envio', 'patlasv3-ige-status': 'Enviado',
    }),
    p('patlasv3-ige-p-snow-erro', 'ServiceNow — Erro', pick(7), {
      'patlasv3-ige-sistema': 'ServiceNow', 'patlasv3-ige-status': 'Erro',
      'patlasv3-ige-justificativa': 'Timeout na API de contratos.',
    }),
  ],
  activeExamplePresetId: 'patlasv3-ige-p-prot',
}

const formHandover = {
  id: F_HOV, name: 'Handover', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-hov-numero', 'Número', 'text', { required: true, relevance: 'identity' }),
    f('patlasv3-hov-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv3-hov-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG }),
    f('patlasv3-hov-proposta', 'Proposta', 'reference', { linkedFormId: F_PRP }),
    f('patlasv3-hov-documento', 'Documento handover', 'reference', { linkedFormId: F_DGD }),
    f('patlasv3-hov-resp-pos', 'Responsável pós-vendas', 'reference', { required: true, linkedFormId: F_PES }),
    f('patlasv3-hov-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_HANDOVER }),
    f('patlasv3-hov-data-geracao', 'Data geração', 'date'),
    f('patlasv3-hov-data-envio', 'Data envio', 'date'),
    f('patlasv3-hov-obs', 'Observações', 'text', { size: 'large', textLong: true }),
  ],
  methods: [
    m('patlasv3-hov-meth-gerar', 'Gerar handover', 'description', 'destaque'),
    m('patlasv3-hov-meth-enviar', 'Enviar ao pós-vendas', 'send', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlasv3-hov-p-gerado', 'HOV-2026-001 — Gerado', pick(0), {
      'patlasv3-hov-numero': 'HOV-2026-001', 'patlasv3-hov-status': 'Gerado', 'patlasv3-hov-data-geracao': '2026-03-13',
    }),
  ],
  activeExamplePresetId: 'patlasv3-hov-p-gerado',
}

const formKickoff = {
  id: F_KOF, name: 'Kick-off', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-kof-contrato', 'Contrato', 'reference', { required: true, linkedFormId: F_CTR }),
    f('patlasv3-kof-handover', 'Handover', 'reference', { linkedFormId: F_HOV }),
    f('patlasv3-kof-cliente', 'Cliente', 'reference', { required: true, linkedFormId: F_ORG }),
    f('patlasv3-kof-data', 'Data prevista', 'date', { required: true, relevance: 'highlight' }),
    f('patlasv3-kof-notif-pos-disparada', 'Notificação pós-vendas disparada', 'boolean', { relevance: 'highlight' }),
    f('patlasv3-kof-notif-cliente-disparada', 'Notificação cliente disparada', 'boolean', { relevance: 'highlight' }),
    f('patlasv3-kof-participantes-mti', 'Participantes MTI', 'reference', { multiple: true, linkedFormId: F_PES }),
    f('patlasv3-kof-participantes-cliente', 'Participantes cliente', 'text', { size: 'large' }),
    f('patlasv3-kof-link', 'Link da reunião', 'text', { size: 'large' }),
    f('patlasv3-kof-pauta', 'Pauta', 'text', { size: 'large', textLong: true }),
    f('patlasv3-kof-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_KICKOFF }),
    f('patlasv3-kof-obs', 'Observações', 'text', { size: 'large', textLong: true }),
  ],
  methods: [
    m('patlasv3-kof-meth-agendar', 'Agendar kick-off', 'event', 'destaque'),
    m('patlasv3-kof-meth-realizado', 'Marcar realizado', 'check_circle', 'destaque'),
  ],
  exampleValuePresets: [
    p('patlasv3-kof-p-agendado', 'Kick-off SEMA agendado', pick(0), {
      'patlasv3-kof-data': '2026-03-22', 'patlasv3-kof-notif-pos-disparada': true,
      'patlasv3-kof-notif-cliente-disparada': true, 'patlasv3-kof-status': 'Agendado',
    }),
  ],
  activeExamplePresetId: 'patlasv3-kof-p-agendado',
}

const formHistorico = {
  id: F_HST, name: 'Histórico', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-hst-data', 'Data/hora', 'text', { required: true, relevance: 'highlight' }),
    f('patlasv3-hst-processo', 'Processo', 'text', { size: 'large', required: true }),
    f('patlasv3-hst-tipo', 'Tipo de evento', 'textOptions', { required: true, options: TIPO_HISTORICO }),
    f('patlasv3-hst-usuario', 'Responsável', 'reference', { linkedFormId: F_PES }),
    f('patlasv3-hst-status-anterior', 'Status anterior', 'text'),
    f('patlasv3-hst-status-novo', 'Status novo', 'text'),
    f('patlasv3-hst-descricao', 'Descrição', 'text', { size: 'large', textLong: true, required: true, relevance: 'identity' }),
  ],
  exampleValuePresets: [
    p('patlasv3-hst-p-criado', 'Proposta criada', pick(0), {
      'patlasv3-hst-data': '2026-02-05 10:24', 'patlasv3-hst-processo': 'PROP-2026-001',
      'patlasv3-hst-tipo': 'Criado', 'patlasv3-hst-descricao': 'Proposta criada a partir da demanda COT-2026-001.',
    }),
  ],
  activeExamplePresetId: 'patlasv3-hst-p-criado',
}

const formNotificacao = {
  id: F_NTF, name: 'Notificação', sectionLayout: 'none', defaultCanvasMode: 'read',
  fields: [
    f('patlasv3-ntf-titulo', 'Título', 'text', { size: 'large', required: true, relevance: 'identity' }),
    f('patlasv3-ntf-tipo', 'Tipo', 'textOptions', { required: true, options: TIPO_NOTIFICACAO }),
    f('patlasv3-ntf-destinatario', 'Destinatário', 'text', { size: 'large', required: true }),
    f('patlasv3-ntf-canal', 'Canal', 'textOptions', { required: true, options: CANAL_NOTIFICACAO }),
    f('patlasv3-ntf-mensagem', 'Mensagem', 'text', { size: 'large', textLong: true, required: true }),
    f('patlasv3-ntf-processo', 'Processo', 'text', { size: 'large' }),
    f('patlasv3-ntf-status', 'Status', 'textOptions', { required: true, relevance: 'highlight', options: STATUS_NOTIFICACAO }),
    f('patlasv3-ntf-data', 'Data envio', 'date'),
  ],
  methods: [m('patlasv3-ntf-meth-reenviar', 'Reenviar', 'forward_to_inbox', 'destaque')],
  exampleValuePresets: [
    p('patlasv3-ntf-p-cred', 'Credenciais SEMA', pick(0), {
      'patlasv3-ntf-titulo': 'Credenciais de acesso', 'patlasv3-ntf-tipo': 'Cliente',
      'patlasv3-ntf-destinatario': 'juliana.pereira@sema.mt.gov.br', 'patlasv3-ntf-status': 'Enviada',
    }),
  ],
  activeExamplePresetId: 'patlasv3-ntf-p-cred',
}

const formVisaoOperacional = {
  id: F_VOP, name: 'Visão Operacional', sectionLayout: 'tabs', sections: [
    sec('sec-patlasv3-vop-dem', 'Demandas', 'inbox'),
    sec('sec-patlasv3-vop-prp', 'Propostas', 'request_quote'),
    sec('sec-patlasv3-vop-ctr', 'Contratos', 'gavel'),
    sec('sec-patlasv3-vop-fim', 'Encerramento', 'rocket_launch'),
  ], defaultCanvasMode: 'read',
  metadata: 'Painel operacional da Fase 1 com indicadores por fila.',
  fields: [
    f('patlasv3-vop-titulo', 'Título do painel', 'text', { required: true, relevance: 'identity', sectionId: 'sec-patlasv3-vop-dem' }),
    f('patlasv3-vop-dem-recebidas', 'Demandas recebidas', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-dem' }),
    f('patlasv3-vop-dem-analise', 'Demandas em análise', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-dem' }),
    f('patlasv3-vop-prp-rascunho', 'Propostas em rascunho', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-prp' }),
    f('patlasv3-vop-prp-assinatura', 'Propostas em assinatura', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-prp' }),
    f('patlasv3-vop-prp-enviadas', 'Propostas enviadas', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-prp' }),
    f('patlasv3-vop-ctr-recebidos', 'Contratos recebidos', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-ctr' }),
    f('patlasv3-vop-ctr-div', 'Contratos com divergência', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-ctr' }),
    f('patlasv3-vop-pub-pend', 'Publicações pendentes', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-ctr' }),
    f('patlasv3-vop-int-erro', 'Integrações com erro', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-ctr' }),
    f('patlasv3-vop-hov-pend', 'Handovers pendentes', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-fim' }),
    f('patlasv3-vop-kof-pend', 'Kick-offs pendentes', 'number', { size: 'small', sectionId: 'sec-patlasv3-vop-fim' }),
    f('patlasv3-vop-filtro-cliente', 'Filtro cliente', 'reference', { linkedFormId: F_ORG, sectionId: 'sec-patlasv3-vop-dem' }),
  ],
  exampleValuePresets: [
    p('patlasv3-vop-p-geral', 'Painel geral', pick(0), {
      'patlasv3-vop-titulo': 'Painel Fase 1 — Visão geral',
      'patlasv3-vop-dem-recebidas': 3, 'patlasv3-vop-dem-analise': 1,
      'patlasv3-vop-prp-rascunho': 1, 'patlasv3-vop-prp-assinatura': 1, 'patlasv3-vop-prp-enviadas': 1,
      'patlasv3-vop-ctr-recebidos': 2, 'patlasv3-vop-pub-pend': 1, 'patlasv3-vop-hov-pend': 1, 'patlasv3-vop-kof-pend': 1,
    }),
    p('patlasv3-vop-p-sema', 'Painel SEMA', pick(5), {
      'patlasv3-vop-titulo': 'Painel Fase 1 — SEMA',
      'patlasv3-vop-dem-recebidas': 1, 'patlasv3-vop-prp-enviadas': 1, 'patlasv3-vop-ctr-recebidos': 1,
    }),
  ],
  activeExamplePresetId: 'patlasv3-vop-p-geral',
}

// ============================================================================
// AGREGADO DE FORMS (29)
// ============================================================================

const forms = [
  formOrganizacao, formSetorLotacao, formCargo, formPessoa, formUsuario,
  formProdutoVigente, formCatalogoLicenca, formCatalogoServico, formCatalogoParceria,
  formDemanda, formProposta, formItemProposta,
  formTemplateDocumento, formDocumentoGerado,
  formFluxoWorkflow, formBlocoWorkflow, formAssinaturaDocumento,
  formEnvioProposta, formContratacaoExterna,
  formContrato, formContratoItem, formRecorrencia, formPublicacao, formIntegracaoEvento,
  formHandover, formKickoff,
  formHistorico, formNotificacao,
  formVisaoOperacional,
]

// ============================================================================
// WORKSPACES (7)
// ============================================================================

const workspaces = [
  {
    id: 'ws-patlasv3-admin-identidade',
    name: 'Administração e Identidade',
    explorerChromeColor: '#1e40af',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'ID',
    packages: [
      { id: 'pkg-patlasv3-adm-org', name: 'Organizações', classes: [cls('cls-patlasv3-adm-org', 'Organizações', F_ORG)] },
      { id: 'pkg-patlasv3-adm-set', name: 'Setores / Lotação', classes: [cls('cls-patlasv3-adm-set', 'Setores', F_SET, ['patlasv3-set-p-dirc'])] },
      { id: 'pkg-patlasv3-adm-cargo', name: 'Cargos', classes: [cls('cls-patlasv3-adm-cgf', 'Cargos / Funções', F_CGF)] },
      { id: 'pkg-patlasv3-adm-pes', name: 'Pessoas', classes: [cls('cls-patlasv3-adm-pes', 'Pessoas', F_PES)] },
      { id: 'pkg-patlasv3-adm-usr', name: 'Usuários', classes: [cls('cls-patlasv3-adm-usr', 'Usuários', F_USR)] },
    ],
  },
  {
    id: 'ws-patlasv3-catalogo',
    name: 'Catálogo Comercial',
    explorerChromeColor: '#0d9488',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'CT',
    packages: [
      { id: 'pkg-patlasv3-cat-pv', name: 'Produtos vigentes', classes: [cls('cls-patlasv3-cat-pv', 'Produtos vigentes', F_PV)] },
      { id: 'pkg-patlasv3-cat-lic', name: 'Licenças', classes: [cls('cls-patlasv3-cat-lic', 'Catálogo de Licenças', F_LIC)] },
      { id: 'pkg-patlasv3-cat-srv', name: 'Serviços', classes: [cls('cls-patlasv3-cat-srv', 'Catálogo de Serviços', F_SRV)] },
      { id: 'pkg-patlasv3-cat-cpp', name: 'Por parceria', classes: [cls('cls-patlasv3-cat-cpp', 'Catálogo por Parceria', F_CPP)] },
    ],
  },
  {
    id: 'ws-patlasv3-dirc-propostas',
    name: 'DIRC / Propostas',
    explorerChromeColor: '#7c3aed',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'DI',
    packages: [
      { id: 'pkg-patlasv3-dirc-dem', name: 'Demandas', classes: [cls('cls-patlasv3-dirc-dem', 'Demandas', F_DEM, ['patlasv3-dem-p-sema'])] },
      { id: 'pkg-patlasv3-dirc-prp', name: 'Propostas', classes: [
        cls('cls-patlasv3-dirc-prp', 'Propostas', F_PRP, ['patlasv3-prp-p-sema-rascunho']),
        cls('cls-patlasv3-dirc-pri', 'Itens da proposta', F_PRI),
      ]},
    ],
  },
  {
    id: 'ws-patlasv3-parceiro',
    name: 'Parceiro',
    explorerChromeColor: '#b45309',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'PA',
    packages: [
      { id: 'pkg-patlasv3-parc-prp', name: 'Propostas', classes: [cls('cls-patlasv3-parc-prp', 'Propostas vinculadas', F_PRP)] },
      { id: 'pkg-patlasv3-parc-ass', name: 'Assinaturas', classes: [cls('cls-patlasv3-parc-ass', 'Assinaturas do parceiro', F_ASS, ['patlasv3-ass-p-parc-ass'])] },
    ],
  },
  {
    id: 'ws-patlasv3-assinaturas-contratos',
    name: 'Assinaturas e Contratos',
    explorerChromeColor: '#0c1ba8',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'AC',
    packages: [
      { id: 'pkg-patlasv3-ac-doc', name: 'Documentos', classes: [
        cls('cls-patlasv3-ac-tpl', 'Templates', F_TPL),
        cls('cls-patlasv3-ac-dgd', 'Documentos gerados', F_DGD),
      ]},
      { id: 'pkg-patlasv3-ac-wf', name: 'Workflow', classes: [
        cls('cls-patlasv3-ac-flw', 'Fluxos', F_FLW),
        cls('cls-patlasv3-ac-blk', 'Blocos', F_BLK),
        cls('cls-patlasv3-ac-ass', 'Assinaturas', F_ASS),
      ]},
      { id: 'pkg-patlasv3-ac-env', name: 'Envio e externo', classes: [
        cls('cls-patlasv3-ac-env', 'Envios', F_ENV),
        cls('cls-patlasv3-ac-ext', 'Contratação externa', F_EXT),
      ]},
      { id: 'pkg-patlasv3-ac-ctr', name: 'Contratos', classes: [
        cls('cls-patlasv3-ac-ctr', 'Contratos', F_CTR, ['patlasv3-ctr-p-001-sema']),
        cls('cls-patlasv3-ac-cti', 'Itens contratados', F_CTI),
      ]},
    ],
  },
  {
    id: 'ws-patlasv3-integracoes',
    name: 'Integrações e Publicação',
    explorerChromeColor: '#0369a1',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'IN',
    packages: [
      { id: 'pkg-patlasv3-int-ige', name: 'Integrações', classes: [cls('cls-patlasv3-int-ige', 'Eventos de integração', F_IGE)] },
      { id: 'pkg-patlasv3-int-rec', name: 'Recorrência', classes: [cls('cls-patlasv3-int-rec', 'Recorrências', F_REC)] },
      { id: 'pkg-patlasv3-int-pub', name: 'Publicação', classes: [cls('cls-patlasv3-int-pub', 'Publicações', F_PUB)] },
    ],
  },
  {
    id: 'ws-patlasv3-visao-operacional',
    name: 'Visão Operacional',
    explorerChromeColor: '#059669',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'VO',
    packages: [
      { id: 'pkg-patlasv3-vo-painel', name: 'Painel', classes: [cls('cls-patlasv3-vo-vop', 'Visão operacional', F_VOP)] },
      { id: 'pkg-patlasv3-vo-fim', name: 'Encerramento', classes: [
        cls('cls-patlasv3-vo-hov', 'Handovers', F_HOV),
        cls('cls-patlasv3-vo-kof', 'Kick-offs', F_KOF),
        cls('cls-patlasv3-vo-hst', 'Histórico', F_HST),
        cls('cls-patlasv3-vo-ntf', 'Notificações', F_NTF),
      ]},
    ],
  },
]

// ============================================================================
// FLOW — 24 etapas (step-patlasv3-f1-*)
// ============================================================================

const flow = {
  id: 'flow-patlasv3-fase1-operacional',
  name: 'Fase 1 — Identidade ao kick-off',
  steps: [
    {
      id: 'step-patlasv3-f1-organizacao',
      title: 'Cadastrar organização',
      type: 'class',
      linkedFormId: F_ORG,
      classPresentationTitle: 'Organização',
      classPresentationDescription: 'MTI, clientes/órgãos e parceiros — sem Unidade MTI.',
    },
    {
      id: 'step-patlasv3-f1-setor',
      title: 'Cadastrar setor / lotação',
      type: 'class',
      linkedFormId: F_SET,
      classPresentationTitle: 'Setor / Lotação',
      classPresentationDescription: 'Organograma MTI com hierarquia e responsável.',
    },
    {
      id: 'step-patlasv3-f1-cargo',
      title: 'Configurar cargo / função',
      type: 'class',
      linkedFormId: F_CGF,
      classPresentationTitle: 'Cargo com permissões',
      classPresentationDescription: 'Permissões e assinatura exclusivamente no cargo.',
    },
    {
      id: 'step-patlasv3-f1-pessoa',
      title: 'Cadastrar pessoa',
      type: 'class',
      linkedFormId: F_PES,
      classPresentationTitle: 'Pessoa',
      classPresentationDescription: 'Vínculo MTI/Parceiro/Cliente; setor obrigatório para MTI.',
    },
    {
      id: 'step-patlasv3-f1-usuario',
      title: 'Cadastrar usuário',
      type: 'class',
      linkedFormId: F_USR,
      classPresentationTitle: 'Usuário',
      classPresentationDescription: 'Permissão efetiva derivada do cargo — somente leitura.',
    },
    {
      id: 'step-patlasv3-f1-catalogo',
      title: 'Consultar catálogo comercial',
      type: 'workspace',
      linkedWorkspaceId: 'ws-patlasv3-catalogo',
      assigneeRole: 'Analista DIRC',
      workspacePresentationDescription: 'Produtos vigentes, licenças, serviços e catálogos por parceria.',
      workspaceMethodNavigateStepIds: {
        'pkg-patlasv3-cat-pv::cls-patlasv3-cat-pv::patlasv3-pv-meth-selecionar': 'step-patlasv3-f1-demanda',
        'pkg-patlasv3-cat-lic::cls-patlasv3-cat-lic::patlasv3-lic-meth-selecionar': 'step-patlasv3-f1-demanda',
        'pkg-patlasv3-cat-srv::cls-patlasv3-cat-srv::patlasv3-srv-meth-selecionar': 'step-patlasv3-f1-demanda',
        'pkg-patlasv3-cat-cpp::cls-patlasv3-cat-cpp::patlasv3-cpp-meth-selecionar': 'step-patlasv3-f1-demanda',
      },
    },
    {
      id: 'step-patlasv3-f1-demanda',
      title: 'Registrar demanda',
      type: 'class',
      linkedFormId: F_DEM,
      classPresentationTitle: 'Demanda',
      classMethodNavigateStepIds: { 'patlasv3-dem-meth-proposta': 'step-patlasv3-f1-proposta' },
    },
    {
      id: 'step-patlasv3-f1-proposta',
      title: 'Montar proposta',
      type: 'class',
      linkedFormId: F_PRP,
      classPresentationTitle: 'Proposta',
      classMethodNavigateStepIds: {
        'patlasv3-prp-meth-montar': 'step-patlasv3-f1-item',
        'patlasv3-prp-meth-gerar-doc': 'step-patlasv3-f1-documento',
        'patlasv3-prp-meth-wf': 'step-patlasv3-f1-fluxo',
      },
    },
    {
      id: 'step-patlasv3-f1-item',
      title: 'Snapshot dos itens',
      type: 'class',
      linkedFormId: F_PRI,
      classPresentationTitle: 'Item da proposta',
      classPresentationDescription: 'Dados congelados do catálogo — valor unitário protegido.',
    },
    {
      id: 'step-patlasv3-f1-template',
      title: 'Selecionar template',
      type: 'class',
      linkedFormId: F_TPL,
      classPresentationTitle: 'Template de documento',
    },
    {
      id: 'step-patlasv3-f1-documento',
      title: 'Gerar documento',
      type: 'class',
      linkedFormId: F_DGD,
      classPresentationTitle: 'Documento gerado',
      classMethodNavigateStepIds: { 'patlasv3-dgd-meth-assinar': 'step-patlasv3-f1-fluxo' },
    },
    {
      id: 'step-patlasv3-f1-fluxo',
      title: 'Submeter ao fluxo de workflow',
      type: 'class',
      linkedFormId: F_FLW,
      classPresentationTitle: 'Fluxo por blocos',
      classMethodNavigateStepIds: { 'patlasv3-flw-meth-ativar': 'step-patlasv3-f1-assinaturas' },
    },
    {
      id: 'step-patlasv3-f1-assinaturas',
      title: 'Assinaturas',
      type: 'class',
      linkedFormId: F_ASS,
      classPresentationTitle: 'Assinatura por cargo',
      classMethodNavigateStepIds: { 'patlasv3-ass-meth-assinar': 'step-patlasv3-f1-envio' },
    },
    {
      id: 'step-patlasv3-f1-envio',
      title: 'Enviar proposta ao cliente',
      type: 'class',
      linkedFormId: F_ENV,
      classMethodNavigateStepIds: { 'patlasv3-env-meth-enviar': 'step-patlasv3-f1-externo' },
    },
    {
      id: 'step-patlasv3-f1-externo',
      title: 'Contratação externa',
      type: 'class',
      linkedFormId: F_EXT,
      classMethodNavigateStepIds: { 'patlasv3-ext-meth-receber': 'step-patlasv3-f1-contrato' },
    },
    {
      id: 'step-patlasv3-f1-contrato',
      title: 'Registrar contrato',
      type: 'class',
      linkedFormId: F_CTR,
      classPresentationTitle: 'Contrato recebido (SigaDoc)',
      classMethodNavigateStepIds: {
        'patlasv3-ctr-meth-revisar-itens': 'step-patlasv3-f1-itens',
        'patlasv3-ctr-meth-credenciais': 'step-patlasv3-f1-cliente',
        'patlasv3-ctr-meth-handover': 'step-patlasv3-f1-handover',
      },
    },
    {
      id: 'step-patlasv3-f1-itens',
      title: 'Revisar itens contratados',
      type: 'class',
      linkedFormId: F_CTI,
      classPresentationTitle: 'Itens — proposta × contrato',
    },
    {
      id: 'step-patlasv3-f1-cliente',
      title: 'Cliente e credenciais',
      type: 'class',
      linkedFormId: F_USR,
      classPresentationTitle: 'Cadastro formal do cliente',
      classMethodNavigateStepIds: { 'patlasv3-usr-meth-cred': 'step-patlasv3-f1-integracoes' },
    },
    {
      id: 'step-patlasv3-f1-integracoes',
      title: 'Integrações',
      type: 'class',
      linkedFormId: F_IGE,
      classPresentationTitle: 'Protheus, ServiceNow, SIAG',
    },
    {
      id: 'step-patlasv3-f1-recorrencia',
      title: 'Recorrência de cobrança',
      type: 'class',
      linkedFormId: F_REC,
      classPresentationTitle: 'Recorrência e PV automático',
    },
    {
      id: 'step-patlasv3-f1-publicacao',
      title: 'Publicação do contrato',
      type: 'class',
      linkedFormId: F_PUB,
      classPresentationTitle: 'Publicação obrigatória',
    },
    {
      id: 'step-patlasv3-f1-handover',
      title: 'Handover',
      type: 'class',
      linkedFormId: F_HOV,
      classMethodNavigateStepIds: { 'patlasv3-hov-meth-enviar': 'step-patlasv3-f1-kickoff' },
    },
    {
      id: 'step-patlasv3-f1-kickoff',
      title: 'Kick-off',
      type: 'class',
      linkedFormId: F_KOF,
      classMethodNavigateStepIds: { 'patlasv3-kof-meth-realizado': 'step-patlasv3-f1-fim' },
    },
    {
      id: 'step-patlasv3-f1-fim',
      title: 'Fim operacional da Fase 1',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Fase 1 encerrada',
      htmlContent: `<div style="padding:32px 48px;max-width:920px;margin:0 auto;font-family:Inter,system-ui,sans-serif;color:#0f172a;">
  <h1 style="font-size:1.85rem;margin:0 0 12px;color:#059669;">Fase 1 Atlas V3 concluída</h1>
  <p style="line-height:1.55;color:#334155;">Jornada demonstrada: identidade (organização → setor → cargo → pessoa → usuário) → catálogo → demanda → proposta com snapshot → documento e workflow por blocos → assinaturas por cargo → envio → contrato CT-2026-001 → integrações → recorrência → publicação → handover → kick-off.</p>
  <ul style="line-height:1.7;color:#334155;">
    <li>Permissões centralizadas no cargo; usuário com perfil efetivo somente leitura.</li>
    <li>Snapshot obrigatório; valor unitário protegido no item da proposta.</li>
    <li>Publicação mandatória; integrações Protheus, ServiceNow e SIAG rastreáveis.</li>
  </ul>
</div>`,
    },
  ],
}

const flows = [flow]

// ============================================================================
// CLASS-GROUPS (9)
// ============================================================================

const G_IDENTIDADE = 'grp-patlasv3-identidade'
const G_CATALOGO = 'grp-patlasv3-catalogo'
const G_DEMANDA_PROPOSTA = 'grp-patlasv3-demanda-proposta'
const G_DOC_WORKFLOW = 'grp-patlasv3-documento-workflow'
const G_ENVIO = 'grp-patlasv3-envio'
const G_CONTRATO = 'grp-patlasv3-contrato'
const G_INTEGRACAO = 'grp-patlasv3-integracao'
const G_TRANSVERSAL = 'grp-patlasv3-transversal'
const G_PAINEL = 'grp-patlasv3-painel'

const classGroups = {
  groups: [
    { id: G_IDENTIDADE, name: 'Identidade' },
    { id: G_CATALOGO, name: 'Catálogo' },
    { id: G_DEMANDA_PROPOSTA, name: 'Demanda e proposta' },
    { id: G_DOC_WORKFLOW, name: 'Documento e workflow' },
    { id: G_ENVIO, name: 'Envio' },
    { id: G_CONTRATO, name: 'Contrato' },
    { id: G_INTEGRACAO, name: 'Integração' },
    { id: G_TRANSVERSAL, name: 'Transversal' },
    { id: G_PAINEL, name: 'Painel' },
  ],
  assignments: {
    [F_ORG]: G_IDENTIDADE, [F_SET]: G_IDENTIDADE, [F_CGF]: G_IDENTIDADE,
    [F_PES]: G_IDENTIDADE, [F_USR]: G_IDENTIDADE,
    [F_PV]: G_CATALOGO, [F_LIC]: G_CATALOGO, [F_SRV]: G_CATALOGO, [F_CPP]: G_CATALOGO,
    [F_DEM]: G_DEMANDA_PROPOSTA, [F_PRP]: G_DEMANDA_PROPOSTA, [F_PRI]: G_DEMANDA_PROPOSTA,
    [F_TPL]: G_DOC_WORKFLOW, [F_DGD]: G_DOC_WORKFLOW, [F_FLW]: G_DOC_WORKFLOW,
    [F_BLK]: G_DOC_WORKFLOW, [F_ASS]: G_DOC_WORKFLOW,
    [F_ENV]: G_ENVIO, [F_EXT]: G_ENVIO,
    [F_CTR]: G_CONTRATO, [F_CTI]: G_CONTRATO, [F_HOV]: G_CONTRATO, [F_KOF]: G_CONTRATO,
    [F_REC]: G_INTEGRACAO, [F_PUB]: G_INTEGRACAO, [F_IGE]: G_INTEGRACAO,
    [F_HST]: G_TRANSVERSAL, [F_NTF]: G_TRANSVERSAL,
    [F_VOP]: G_PAINEL,
  },
  memberOrderByGroup: {
    [G_IDENTIDADE]: [F_ORG, F_SET, F_CGF, F_PES, F_USR],
    [G_CATALOGO]: [F_PV, F_LIC, F_SRV, F_CPP],
    [G_DEMANDA_PROPOSTA]: [F_DEM, F_PRP, F_PRI],
    [G_DOC_WORKFLOW]: [F_TPL, F_DGD, F_FLW, F_BLK, F_ASS],
    [G_ENVIO]: [F_ENV, F_EXT],
    [G_CONTRATO]: [F_CTR, F_CTI, F_HOV, F_KOF],
    [G_INTEGRACAO]: [F_REC, F_PUB, F_IGE],
    [G_TRANSVERSAL]: [F_HST, F_NTF],
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

console.log(`Atlas V3 — Fase 1 gerado em ${epicDir}`)
console.log(`  • forms.json          → ${forms.length} classes / ${totalFields} campos / ${totalMethods} métodos / ${totalPresets} presets`)
console.log(`  • workspaces.json     → ${workspaces.length} workspaces / ${totalPackages} pacotes / ${totalClasses} classes vinculadas`)
console.log(`  • flows.json          → ${flows.length} flows / ${totalSteps} etapas`)
flows.forEach((fl) => console.log(`      - ${fl.name} (${fl.steps.length} etapas)`))
console.log(`  • class-groups.json   → ${classGroups.groups.length} grupos`)

