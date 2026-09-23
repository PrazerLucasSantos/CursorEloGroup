/**
 * Propostas comerciais Atlas — cadastro, colaboração MTI/parceiro/cliente,
 * versionamento, documentos, workflow configurável e assinaturas internas.
 */

import { FORM_CATALOGO_VIGENTES } from './atlas-catalog-forms.mjs'
import { FORM_CATALOGO_LICENCAS } from './atlas-licenca-forms.mjs'
import { FORM_CATALOGO_SERVICOS } from './atlas-servico-forms.mjs'
/** Mesmo id do módulo contrato (tramite compartilhado RAER/proposta). */
const FORM_TRAMITE_ASSINATURA = 'form-atlas-tramite-assinatura'
const EMB_TRAMITES = 'emb_tramites_assinatura'

export const FORM_PROPOSTA = 'form-atlas-proposta'
export const FORM_PROPOSTA_ITEM = 'form-atlas-proposta-item'
export const FORM_PROPOSTA_VERSAO = 'form-atlas-proposta-versao'
export const FORM_PROPOSTA_DOCUMENTO = 'form-atlas-proposta-documento'
export const FORM_PROPOSTA_WORKFLOW_TIPO = 'form-atlas-proposta-workflow-tipo'
export const FORM_PROPOSTA_WORKFLOW_ETAPA = 'form-atlas-proposta-workflow-etapa'
export const FORM_VISAO_PROPOSTAS = 'form-atlas-visao-propostas'
export const FORM_VISAO_HISTORICO_VERSOES = 'form-atlas-visao-historico-versoes'

export const EMB_PROPOSTAS_LISTA = 'emb_propostas_lista'
export const EMB_PROPOSTA_ITENS = 'emb_proposta_itens'
export const EMB_PROPOSTA_VERSOES = 'emb_proposta_versoes'
export const EMB_PROPOSTA_DOCUMENTOS = 'emb_proposta_documentos'
export const EMB_WORKFLOW_ETAPAS = 'emb_workflow_etapas'

const TAGS_PROPOSTA = [
  'Rascunho',
  'Enviado',
  'Em andamento',
  'Retornado com ajustes',
  'Enviado ao cliente',
  'Enviado ao parceiro',
  'Aguardando assinatura',
  'Assinado',
  'Aprovado internamente',
  'Reprovado',
  'Cancelado',
]

const DESTINATARIO_ENVIO = ['Cliente', 'Parceiro']
const ORIGEM_COLABORACAO = ['MTI', 'Parceiro', 'Cliente']
const ORIGEM_VERSAO = [
  'MTI — elaboração inicial',
  'MTI — reenvio após ajustes',
  'Parceiro — complemento',
  'Parceiro — retorno com ajustes',
  'Cliente — manifestação',
  'Sistema — consolidação',
]

const TIPO_ITEM_CATALOGO = ['Produto vigente', 'Licença', 'Serviço']
const TIPOS_DOCUMENTO = [
  'Proposta comercial',
  'Ofício',
  'Contrato',
  'Anuência',
  'Anexo técnico',
  'Planilha de preços',
  'Parecer interno',
]

const TIPOS_PROCESSO_WORKFLOW = [
  'Proposta comercial padrão',
  'Proposta com parceiro',
  'Proposta + contrato',
  'Renovação contratual',
  'Aditivo',
]

const AREAS_INTERNAS = ['DIRC', 'DTIC', 'Presidência', 'DAFI', 'Jurídico', 'Comercial', 'Controladoria']
const TIPO_ACAO_ETAPA = ['Assinar', 'Concordar', 'Validar', 'Aprovar', 'Ciência']
const STATUS_TRAMITE = [
  'Pendente',
  'Enviado para assinatura',
  'Em análise',
  'Ajuste solicitado',
  'Reprovado',
  'Aprovado',
  'Assinado',
]

export const METODOS_PROPOSTA = [
  { id: 'atlas-prp-meth-montar-catalogo', name: 'Montar a partir dos catálogos', icon: 'inventory_2', kind: 'destaque' },
  { id: 'atlas-prp-meth-gerar-documento', name: 'Gerar documento da proposta', icon: 'description', kind: 'secundario' },
  { id: 'atlas-prp-meth-enviar-cliente', name: 'Enviar ao cliente', icon: 'send', kind: 'secundario' },
  { id: 'atlas-prp-meth-enviar-parceiro', name: 'Enviar ao parceiro', icon: 'groups', kind: 'secundario' },
  { id: 'atlas-prp-meth-visualizar-versao', name: 'Visualizar versão selecionada', icon: 'history', kind: 'secundario' },
  { id: 'atlas-prp-meth-comparar-versoes', name: 'Comparar versões', icon: 'compare', kind: 'secundario' },
  { id: 'atlas-meth-enviar-assinatura', name: 'Enviar para assinatura', icon: 'draw', kind: 'secundario' },
  { id: 'atlas-meth-solicitar-ajuste', name: 'Solicitar ajuste', icon: 'edit_note', kind: 'secundario' },
  { id: 'atlas-meth-reprovar', name: 'Reprovar', icon: 'cancel', kind: 'secundario' },
  { id: 'atlas-meth-aprovar-assinar', name: 'Aprovar e assinar', icon: 'verified', kind: 'destaque' },
  /* Fase 1 — submissão de workflow e reabertura. */
  { id: 'atlas-prp-meth-submeter-workflow', name: 'Submeter', icon: 'send', kind: 'destaque' },
  { id: 'atlas-prp-meth-reabrir-edicao', name: 'Reabrir edição', icon: 'edit_note', kind: 'menu' },
]

/* ===================================================================
 * Fase 1 — extensões (proposta, item, versão, documento)
 * =================================================================== */

const FORM_ORGANIZACAO = 'form-atlas-organizacao'
const FORM_MAESTRO_PARCEIRO = 'form-atlas-maestro-parceiro'
const FORM_USUARIO_FASE1 = 'form-atlas-usuario'
const FORM_WF_MODELO = 'form-atlas-workflow-modelo'
const FORM_WF_VERSAO = 'form-atlas-workflow-versao'
const FORM_WF_INSTANCIA = 'form-atlas-workflow-instancia'
const FORM_CONTRATO_GESTAO_FASE1 = 'form-atlas-contrato-gestao'
const FORM_DOC_TEMPLATE_FASE1 = 'form-atlas-documento-template'
const FORM_DOC_GERADO_FASE1 = 'form-atlas-documento-gerado'
const FORM_LICENCA_LINHA = 'form-atlas-licenca-linha'
const FORM_SERVICO_LINHA = 'form-atlas-servico-linha'
const FORM_MAESTRO_METRICA_FASE1 = 'form-atlas-maestro-metrica'
const FORM_MAESTRO_RECORRENCIA_FASE1 = 'form-atlas-maestro-recorrencia'

const EMB_PROPOSTA_TRAMITES_FASE1 = 'emb_proposta_tramites'

const STATUS_COMERCIAL_FASE1 = [
  'Rascunho',
  'Em composição',
  'Em revisão',
  'Em assinatura',
  'Aprovada',
  'Enviada ao cliente',
  'Em contratação',
  'Contrato recebido',
  'Contrato cadastrado',
  'Cancelada',
]

const propostaFase1Sections = [
  { id: 'sec-prp-fase1-origem', title: 'Origem', icon: 'request_quote' },
  { id: 'sec-prp-fase1-comercial', title: 'Dados comerciais (DIRC)', icon: 'payments' },
  { id: 'sec-prp-fase1-workflow', title: 'Workflow', icon: 'account_tree' },
  { id: 'sec-prp-fase1-assinaturas', title: 'Assinaturas', icon: 'draw' },
  { id: 'sec-prp-fase1-contrato', title: 'Contrato', icon: 'article' },
]

const propostaFase1Fields = [
  { id: 'atlas-prp-origem-demanda', label: 'Origem demanda', type: 'textOptions', size: 'medium', required: true, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prp-fase1-origem', options: ['Cliente', 'MTI', 'Parceiro', 'E-mail', 'Portal', 'Reunião', 'Importação'], spec: 'Informa como a demanda que originou a proposta entrou no processo.' },
  { id: 'atlas-prp-cliente-org', label: 'Cliente', type: 'reference', size: 'large', required: true, multiple: false, readOnly: false, relevance: 'identity', sectionId: 'sec-prp-fase1-origem', linkedFormId: FORM_ORGANIZACAO, spec: 'Organização cliente vinculada à proposta.' },
  { id: 'atlas-prp-parceiros-envolvidos', label: 'Parceiros', type: 'reference', size: 'large', required: false, multiple: true, readOnly: false, relevance: 'highlight', sectionId: 'sec-prp-fase1-origem', linkedFormId: FORM_MAESTRO_PARCEIRO, spec: 'Parceiros que devem participar da composição ou aprovação da proposta.' },
  { id: 'atlas-prp-solicitante', label: 'Solicitante', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prp-fase1-origem', linkedFormId: FORM_USUARIO_FASE1, spec: 'Usuário que registrou ou solicitou a proposta.' },
  { id: 'atlas-prp-escopo-resumido', label: 'Escopo resumido', type: 'text', size: 'large', textLong: true, required: true, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prp-fase1-origem', spec: 'Resumo da necessidade do cliente e do cenário a ser proposto.' },
  { id: 'atlas-prp-ano', label: 'Ano', type: 'number', size: 'small', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prp-fase1-comercial', spec: 'Ano de referência da proposta (Gestão Centralizada DIRC).' },
  { id: 'atlas-prp-data', label: 'Data da proposta', type: 'date', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prp-fase1-comercial', spec: 'Data de elaboração ou registro da proposta.' },
  { id: 'atlas-prp-uf-cliente', label: 'UF do cliente', type: 'text', size: 'small', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prp-fase1-comercial', spec: 'Unidade federativa do cliente (ex.: MT).' },
  { id: 'atlas-prp-solucao-principal', label: 'Produto/Solução principal', type: 'text', size: 'large', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prp-fase1-comercial', spec: 'Solução ou produto principal ofertado na proposta.' },
  { id: 'atlas-prp-focal-vendas', label: 'Focal de vendas', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prp-fase1-comercial', linkedFormId: FORM_USUARIO_FASE1, spec: 'Responsável comercial DIRC/UGVEN pela proposta.' },
  { id: 'atlas-prp-ajudante', label: 'Ajudante/Apoio', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prp-fase1-comercial', linkedFormId: FORM_USUARIO_FASE1, spec: 'Apoio comercial ou técnico na elaboração.' },
  { id: 'atlas-prp-valor-total-previsto', label: 'Valor total previsto (R$)', type: 'decimal', size: 'medium', currency: true, required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prp-fase1-comercial', spec: 'Valor total previsto da proposta — pode ser calculado a partir dos itens (campo atlas-prp-valor-total).' },
  { id: 'atlas-prp-vigencia-meses', label: 'Vigência (meses)', type: 'number', size: 'small', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prp-fase1-comercial', spec: 'Prazo de vigência contratual previsto em meses.' },
  { id: 'atlas-prp-projeto', label: 'Projeto', type: 'text', size: 'large', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prp-fase1-comercial', spec: 'Nome ou código do projeto vinculado à oportunidade.' },
  { id: 'atlas-prp-objetivo', label: 'Objetivo', type: 'text', size: 'large', textLong: true, required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prp-fase1-comercial', spec: 'Objetivo de negócio da proposta (texto longo).' },
  { id: 'atlas-prp-status-comercial', label: 'Status comercial', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prp-fase1-comercial', options: STATUS_COMERCIAL_FASE1, spec: 'Status comercial alinhado à Gestão Centralizada DIRC. Operacional Fase 1 também em atlas-prp-status-fase1.' },
  { id: 'atlas-prp-workflow-modelo', label: 'Modelo workflow', type: 'reference', size: 'medium', required: true, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prp-fase1-workflow', linkedFormId: FORM_WF_MODELO, spec: 'Modelo de workflow usado para tramitação da proposta.' },
  { id: 'atlas-prp-workflow-versao', label: 'Versão workflow', type: 'reference', size: 'medium', required: true, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prp-fase1-workflow', linkedFormId: FORM_WF_VERSAO, spec: 'Versão congelada do workflow usada por esta proposta.' },
  { id: 'atlas-prp-workflow-instancia', label: 'Instância workflow', type: 'reference', size: 'large', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prp-fase1-workflow', linkedFormId: FORM_WF_INSTANCIA, spec: 'Instância de execução criada quando a proposta é submetida.' },
  { id: 'atlas-prp-status-fase1', label: 'Status Fase 1', type: 'textOptions', size: 'medium', required: true, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prp-fase1-workflow', options: STATUS_COMERCIAL_FASE1, spec: 'Status operacional da proposta na Fase 1 (mesmas opções do status comercial DIRC).' },
  { id: 'atlas-prp-prazo-assinatura', label: 'Prazo assinatura', type: 'date', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prp-fase1-assinaturas', spec: 'Data limite esperada para conclusão das assinaturas.' },
  { id: 'atlas-prp-status-assinaturas', label: 'Status assinaturas', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'highlight', sectionId: 'sec-prp-fase1-assinaturas', options: ['Não iniciada', 'Pendente DIRC', 'Pendente parceiro', 'Pendente DTIC', 'Pendente Presidência', 'Assinada', 'Rejeitada', 'Expirada'], spec: 'Consolidação das pendências de assinatura da proposta.' },
  { id: EMB_PROPOSTA_TRAMITES_FASE1, label: 'Trâmites', type: 'embeddedReference', size: 'large', required: false, multiple: true, readOnly: true, relevance: 'common', sectionId: 'sec-prp-fase1-assinaturas', linkedFormId: FORM_TRAMITE_ASSINATURA, embeddedDisplay: 'table', spec: 'Lista de trâmites de assinatura vinculados à proposta.' },
  { id: 'atlas-prp-contrato-vinculado', label: 'Contrato', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prp-fase1-contrato', linkedFormId: FORM_CONTRATO_GESTAO_FASE1, spec: 'Contrato gerado ou cadastrado a partir da proposta.' },
  { id: 'atlas-prp-permite-edicao-contrato', label: 'Editar no contrato', type: 'boolean', size: 'small', required: false, multiple: false, readOnly: false, relevance: 'advanced', sectionId: 'sec-prp-fase1-contrato', spec: 'Indica se os itens da proposta podem ser revisados no momento de cadastro contratual.' },
  { id: 'atlas-prp-observacao-finalizacao', label: 'Observação finalização', type: 'text', size: 'large', textLong: true, required: false, multiple: false, readOnly: false, relevance: 'advanced', sectionId: 'sec-prp-fase1-contrato', spec: 'Justificativa para diferenças entre proposta e contrato recebido.' },
]

const propostaItemFase1Sections = [
  { id: 'sec-prpi-fase1-catalogo', title: 'Catálogo Fase 1', icon: 'inventory_2' },
  { id: 'sec-prpi-fase1-snapshot', title: 'Snapshot comercial', icon: 'photo_camera' },
]

const SNAPSHOT_ITEM_SPEC =
  'Congelado na seleção do catálogo — se o catálogo mudar depois, a proposta mantém este valor (rastreabilidade histórica).'

const propostaItemFase1Fields = [
  {
    id: 'atlas-prpi-alerta-snapshot',
    label: 'Regra snapshot',
    type: 'alert',
    size: 'large',
    readOnly: true,
    required: false,
    multiple: false,
    relevance: 'common',
    sectionId: 'sec-prpi-fase1-catalogo',
    alertVariant: 'info',
    alertTitle: 'Dados congelados na proposta',
    alertMessage:
      'O item da proposta congela os dados do catálogo no momento da seleção, garantindo rastreabilidade histórica da proposta.',
    spec: 'Regra de negócio Fase 1 — Gestão Centralizada DIRC.',
  },
  {
    id: 'atlas-prpi-origem-catalogo',
    label: 'Origem do item',
    type: 'textOptions',
    size: 'medium',
    required: true,
    multiple: false,
    readOnly: false,
    relevance: 'highlight',
    sectionId: 'sec-prpi-fase1-catalogo',
    options: ['Produto vigente', 'Licença', 'Serviço', 'Manual'],
    spec: 'Controla qual referência de catálogo é usada. Manual exige preenchimento mínimo e justificativa.',
  },
  {
    id: 'atlas-prpi-produto-vigente',
    label: 'Produto vigente',
    type: 'reference',
    size: 'large',
    required: false,
    multiple: false,
    readOnly: false,
    relevance: 'common',
    sectionId: 'sec-prpi-fase1-catalogo',
    linkedFormId: FORM_CATALOGO_VIGENTES,
    spec: 'Obrigatório quando origem = Produto vigente. Dados copiados para snapshot ao selecionar.',
  },
  {
    id: 'atlas-prpi-licenca',
    label: 'Licença',
    type: 'reference',
    size: 'large',
    required: false,
    multiple: false,
    readOnly: false,
    relevance: 'common',
    sectionId: 'sec-prpi-fase1-catalogo',
    linkedFormId: FORM_LICENCA_LINHA,
    spec: 'Obrigatório quando origem = Licença.',
  },
  {
    id: 'atlas-prpi-servico',
    label: 'Serviço',
    type: 'reference',
    size: 'large',
    required: false,
    multiple: false,
    readOnly: false,
    relevance: 'common',
    sectionId: 'sec-prpi-fase1-catalogo',
    linkedFormId: FORM_SERVICO_LINHA,
    spec: 'Obrigatório quando origem = Serviço.',
  },
  {
    id: 'atlas-prpi-justificativa-manual',
    label: 'Justificativa item manual',
    type: 'text',
    size: 'large',
    textLong: true,
    required: false,
    multiple: false,
    readOnly: false,
    relevance: 'advanced',
    sectionId: 'sec-prpi-fase1-catalogo',
    spec: 'Obrigatória quando origem = Manual.',
  },
  { id: 'atlas-prpi-descricao', label: 'Descrição do item', type: 'text', size: 'large', textLong: true, required: false, multiple: false, readOnly: true, relevance: 'highlight', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC + ' Equivalente legado: atlas-prp-item-descricao.' },
  { id: 'atlas-prpi-codigo-siag', label: 'Código Siag', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-codigo-protheus', label: 'Código Protheus / InfoCenter', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-solucao', label: 'Solução', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-parceria', label: 'Parceria / parceiro', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-metrica', label: 'Métrica', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', linkedFormId: FORM_MAESTRO_METRICA_FASE1, spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-cobranca', label: 'Cobrança', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', options: ['Sob demanda', 'Recorrente', 'Única', 'Por consumo', 'Pacote'], spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-recorrencia-cobranca', label: 'Recorrência da cobrança', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC + ' Texto congelado; referência maestro em atlas-prpi-recorrencia.' },
  { id: 'atlas-prpi-recorrencia', label: 'Recorrência (referência)', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'advanced', sectionId: 'sec-prpi-fase1-snapshot', linkedFormId: FORM_MAESTRO_RECORRENCIA_FASE1, spec: 'Referência ao cadastro de recorrência no momento da seleção.' },
  { id: 'atlas-prpi-modelo-venda', label: 'Modelo de venda', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', options: ['Objeto específico', 'Catálogo de serviços', 'Métrica universal', 'Licenciamento', 'Assinatura'], spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-tipo-comercializacao', label: 'Tipo comercialização', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'highlight', sectionId: 'sec-prpi-fase1-snapshot', options: ['Objeto específico', 'Catálogo de serviços', 'Métrica universal'], spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-valor-unitario', label: 'Valor unitário', type: 'decimal', size: 'medium', currency: true, required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC + ' Equivalente legado: atlas-prp-item-valor-unitario.' },
  { id: 'atlas-prpi-quantidade', label: 'Quantidade', type: 'number', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC + ' Equivalente legado: atlas-prp-item-quantidade.' },
  { id: 'atlas-prpi-valor-total', label: 'Valor total', type: 'decimal', size: 'medium', currency: true, required: false, multiple: false, readOnly: true, relevance: 'highlight', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC + ' Equivalente legado: atlas-prp-item-valor-total.' },
  { id: 'atlas-prpi-valor-previsto', label: 'Valor previsto', type: 'decimal', size: 'medium', currency: true, required: false, multiple: false, readOnly: true, relevance: 'highlight', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-fator-conversao', label: 'Fator de conversão', type: 'decimal', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'advanced', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-versao-catalogo', label: 'Versão do catálogo', type: 'text', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-part-number', label: 'PART Number', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-grupo', label: 'Grupo', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-complexidade', label: 'Complexidade', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', options: ['Baixa', 'Média', 'Alta'], spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-quantidade-hst-ust', label: 'Quantidade HST/UST por execução', type: 'number', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'advanced', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-categoria-objeto', label: 'Categoria objeto comercial', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-tipo-cobranca', label: 'Tipo de cobrança', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', options: ['Fixo', 'Variável', 'Misto', 'Recorrente', 'Sob demanda'], spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-universal', label: 'Universal?', type: 'boolean', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-individualizado', label: 'Individualizado?', type: 'boolean', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-status-parceria', label: 'Status da parceria', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', options: ['Ativa', 'Pendente homologação', 'Suspensa', 'Não se aplica'], spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-unidade-dtic', label: 'Unidade DTIC', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-focal-vendas', label: 'Focal vendas', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-focal-pos-vendas', label: 'Focal pós-vendas', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
  { id: 'atlas-prpi-link-catalogo', label: 'Link catálogo de parceria', type: 'text', size: 'large', required: false, multiple: false, readOnly: true, relevance: 'advanced', sectionId: 'sec-prpi-fase1-snapshot', spec: SNAPSHOT_ITEM_SPEC },
]

const propostaVersaoFase1Section = { id: 'sec-prpv-ident', title: 'Identificação', icon: 'history' }

const propostaVersaoFase1Fields = [
  { id: 'atlas-prpv-versao-base', label: 'Versão base', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpv-ident', linkedFormId: FORM_PROPOSTA_VERSAO, spec: 'Versão anterior usada como origem desta versão.' },
  { id: 'atlas-prpv-motivo', label: 'Motivo versão', type: 'textOptions', size: 'medium', required: true, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prpv-ident', options: ['Primeira emissão', 'Ajuste DIRC', 'Ajuste parceiro', 'Ajuste DTIC', 'Ajuste Presidência', 'Alteração contratual', 'Correção documental'], spec: 'Motivo de criação da versão.' },
  { id: 'atlas-prpv-status', label: 'Status versão', type: 'textOptions', size: 'medium', required: true, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prpv-ident', options: ['Rascunho', 'Em aprovação', 'Aprovada', 'Substituída', 'Cancelada'], spec: 'Situação da versão da proposta.' },
  { id: 'atlas-prpv-documento-gerado', label: 'Documento gerado', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpv-ident', linkedFormId: FORM_DOC_GERADO_FASE1, spec: 'Documento final gerado para esta versão.' },
  { id: 'atlas-prpv-observacao', label: 'Observação', type: 'text', size: 'large', textLong: true, required: false, multiple: false, readOnly: false, relevance: 'advanced', sectionId: 'sec-prpv-ident', spec: 'Registro do que mudou nesta versão.' },
]

const propostaDocFase1Section = { id: 'sec-prpd-ident', title: 'Identificação', icon: 'description' }

const propostaDocFase1Fields = [
  { id: 'atlas-prpd-template', label: 'Template', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prpd-ident', linkedFormId: FORM_DOC_TEMPLATE_FASE1, spec: 'Template usado para geração do documento.' },
  { id: 'atlas-prpd-documento-gerado', label: 'Documento gerado', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-prpd-ident', linkedFormId: FORM_DOC_GERADO_FASE1, spec: 'Documento final gerado no processo.' },
  { id: 'atlas-prpd-exige-assinatura', label: 'Exige assinatura', type: 'boolean', size: 'small', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prpd-ident', spec: 'Indica se o documento deve entrar no fluxo de assinatura.' },
  { id: 'atlas-prpd-ordem-fluxo', label: 'Ordem fluxo', type: 'number', size: 'small', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-prpd-ident', spec: 'Ordem em que o documento aparece no pacote documental.' },
  { id: 'atlas-prpd-tipo-documental', label: 'Tipo documental', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-prpd-ident', options: ['Proposta', 'Contrato', 'Anexo técnico', 'Anexo financeiro', 'Certidão', 'Extrato publicação', 'Outro'], spec: 'Classifica o documento para regras de assinatura e checklist.' },
]

const propostaFase1Preset = {
  id: 'atlas-prp-preset-fase1-simplifica',
  name: 'Proposta MTI Simplifica em assinatura',
  iconColor: '#0c1ba8',
  fieldValues: {
    'atlas-prp-origem-demanda': 'Portal',
    'atlas-prp-cliente-org': 'Secretaria Cliente Demo',
    'atlas-prp-parceiros-envolvidos': ['Parceiro Simplifica Demo'],
    'atlas-prp-solicitante': 'Lucas Analista',
    'atlas-prp-escopo-resumido': 'Contratação de serviços de simplificação e desburocratização com itens de licenciamento e serviços sob demanda.',
    'atlas-prp-workflow-modelo': 'Workflow padrão de proposta',
    'atlas-prp-workflow-versao': '1.0',
    'atlas-prp-ano': 2026,
    'atlas-prp-data': '2026-05-20',
    'atlas-prp-uf-cliente': 'MT',
    'atlas-prp-solucao-principal': 'MTI Simplifica',
    'atlas-prp-focal-vendas': 'Lucas Analista',
    'atlas-prp-valor-total-previsto': 185000,
    'atlas-prp-vigencia-meses': 12,
    'atlas-prp-projeto': 'Simplifica — Secretaria Demo',
    'atlas-prp-objetivo': 'Desburocratizar serviços digitais com itens de licenciamento e serviços sob demanda.',
    'atlas-prp-status-comercial': 'Em assinatura',
    'atlas-prp-status-fase1': 'Em assinatura',
    'atlas-prp-prazo-assinatura': '2026-05-29',
    'atlas-prp-status-assinaturas': 'Pendente DTIC',
    'atlas-prp-permite-edicao-contrato': 'true',
  },
  embeddedRowsByFieldId: {
    [EMB_PROPOSTA_TRAMITES_FASE1]: [
      { 'atlas-tra-area': 'DIRC', 'atlas-tra-papel': 'Validação comercial', 'atlas-tra-mecanismo': 'MT Login', 'atlas-tra-data-envio': '2026-05-23', 'atlas-tra-data-limite': '2026-05-25', 'atlas-tra-dias-pendente': 0, 'atlas-tra-bloqueia-fluxo': 'true' },
      { 'atlas-tra-area': 'Parceiro', 'atlas-tra-papel': 'Concordância da parceria', 'atlas-tra-mecanismo': 'MT Login', 'atlas-tra-data-envio': '2026-05-23', 'atlas-tra-data-limite': '2026-05-25', 'atlas-tra-dias-pendente': 0, 'atlas-tra-bloqueia-fluxo': 'true' },
      { 'atlas-tra-area': 'DTIC', 'atlas-tra-papel': 'Concordância técnica', 'atlas-tra-mecanismo': 'MT Login', 'atlas-tra-data-envio': '2026-05-23', 'atlas-tra-data-limite': '2026-05-27', 'atlas-tra-dias-pendente': 2, 'atlas-tra-bloqueia-fluxo': 'true' },
    ],
  },
}

function tramiteRow(p) {
  return {
    'atlas-tram-fase': p.fase ?? 'Proposta',
    'atlas-tram-setor': p.setor ?? '',
    'atlas-tram-cargo': p.cargo ?? '',
    'atlas-tram-perfil': p.perfil ?? '',
    'atlas-tram-ordem': p.ordem ?? 1,
    'atlas-tram-status': p.status ?? 'Pendente',
    'atlas-tram-data-envio': p.dataEnvio ?? '',
    'atlas-tram-data-conclusao': p.dataConclusao ?? '',
    'atlas-tram-motivo': p.motivo ?? '',
    'atlas-tram-responsavel': p.responsavel ?? '',
  }
}

function itemRow(p) {
  return {
    'atlas-prp-item-tipo': p.tipo ?? 'Serviço',
    'atlas-prp-item-codigo-atlas': p.codigoAtlas ?? '',
    'atlas-prp-item-descricao': p.descricao ?? '',
    'atlas-prp-item-siag': p.siag ?? '',
    'atlas-prp-item-protheus': p.protheus ?? '',
    'atlas-prp-item-quantidade': p.quantidade ?? 1,
    'atlas-prp-item-valor-unitario': p.valorUnitario ?? 0,
    'atlas-prp-item-valor-total': p.valorTotal ?? 0,
    'atlas-prp-item-origem-catalogo': p.origemCatalogo ?? FORM_CATALOGO_SERVICOS,
  }
}

function versaoRow(p) {
  return {
    'atlas-prp-ver-numero': p.numero ?? 1,
    'atlas-prp-ver-rotulo': p.rotulo ?? '',
    'atlas-prp-ver-origem': p.origem ?? 'MTI — elaboração inicial',
    'atlas-prp-ver-tag': p.tag ?? 'Rascunho',
    'atlas-prp-ver-autor': p.autor ?? 'MTI',
    'atlas-prp-ver-data': p.data ?? '',
    'atlas-prp-ver-destinatario-envio': p.destinatario ?? '',
    'atlas-prp-ver-resumo-alteracoes': p.resumo ?? '',
    'atlas-prp-ver-documento-ref': p.documentoRef ?? '',
    'atlas-prp-ver-ativa': p.ativa ?? 'false',
  }
}

function documentoRow(p) {
  return {
    'atlas-prp-doc-tipo': p.tipo ?? 'Proposta comercial',
    'atlas-prp-doc-versao': p.versao ?? 'v1',
    'atlas-prp-doc-nome-arquivo': p.nome ?? '',
    'atlas-prp-doc-status': p.status ?? 'Rascunho',
    'atlas-prp-doc-data-geracao': p.data ?? '',
    'atlas-prp-doc-gerado-por': p.geradoPor ?? 'MTI',
    'atlas-prp-doc-tramite': p.tramite ?? 'Pendente',
    'atlas-prp-doc-observacoes': p.obs ?? '',
  }
}

function etapaWorkflowRow(p) {
  return {
    'atlas-prp-wf-etapa-nome': p.nome ?? '',
    'atlas-prp-wf-etapa-area': p.area ?? 'DIRC',
    'atlas-prp-wf-etapa-perfil': p.perfil ?? '',
    'atlas-prp-wf-etapa-ordem': p.ordem ?? 1,
    'atlas-prp-wf-etapa-acao': p.acao ?? 'Assinar',
    'atlas-prp-wf-etapa-obrigatoria': p.obrigatoria ?? 'true',
    'atlas-prp-wf-etapa-paralela': p.paralela ?? 'false',
  }
}

const ITENS_PROP_0842 = [
  itemRow({
    tipo: 'Serviço',
    codigoAtlas: 'ATLAS-SRV-0012401',
    descricao: 'Treinamento técnico presencial — módulo introdutório cloud',
    siag: '0012401',
    protheus: 'S2000401',
    quantidade: 8,
    valorUnitario: 1250,
    valorTotal: 10000,
    origemCatalogo: FORM_CATALOGO_SERVICOS,
  }),
  itemRow({
    tipo: 'Licença',
    codigoAtlas: 'ATLAS-LIC-001666G',
    descricao: 'EXECUÇÃO DE ANÁLISE DAST (Um par de Ciclos, Teste e Reteste)',
    siag: '001666G',
    protheus: 'S2000162',
    quantidade: 2,
    valorUnitario: 60937.2,
    valorTotal: 121874.4,
    origemCatalogo: FORM_CATALOGO_LICENCAS,
  }),
  itemRow({
    tipo: 'Produto vigente',
    codigoAtlas: 'ATLAS-PRD-0010796',
    descricao: 'MTI DataSecurity — pacote anual',
    siag: '0010796',
    protheus: 'S2000101',
    quantidade: 1,
    valorUnitario: 185000,
    valorTotal: 185000,
    origemCatalogo: FORM_CATALOGO_VIGENTES,
  }),
]

const VERSOES_PROP_0842 = [
  versaoRow({
    numero: 1,
    rotulo: 'v1 — MTI elaboração e envio ao parceiro',
    origem: 'MTI — elaboração inicial',
    tag: 'Enviado ao parceiro',
    autor: 'MTI — Comercial',
    data: '2025-02-10',
    destinatario: 'Parceiro',
    resumo: 'Primeira proposta montada a partir dos catálogos vigentes, licenças e serviços.',
    documentoRef: 'PROP-2025-0842-v1.pdf',
    ativa: 'false',
  }),
  versaoRow({
    numero: 2,
    rotulo: 'v2 — Parceiro retorno com ajustes',
    origem: 'Parceiro — retorno com ajustes',
    tag: 'Retornado com ajustes',
    autor: 'Parceiro — MTI CLOUD',
    data: '2025-02-18',
    destinatario: 'MTI',
    resumo: 'Ajuste de MARKUP em licença DAST e inclusão de nota técnica no anexo.',
    documentoRef: 'PROP-2025-0842-v2-parceiro.pdf',
    ativa: 'false',
  }),
  versaoRow({
    numero: 3,
    rotulo: 'v3 — MTI reenvio após ajustes internos',
    origem: 'MTI — reenvio após ajustes',
    tag: 'Enviado ao cliente',
    autor: 'MTI — DIRC',
    data: '2025-02-25',
    destinatario: 'Cliente',
    resumo: 'Consolidação dos ajustes do parceiro + revisão DIRC/DAFI; envio ao TJMT.',
    documentoRef: 'PROP-2025-0842-v3.pdf',
    ativa: 'true',
  }),
]

const DOCS_PROP_0842 = [
  documentoRow({
    tipo: 'Proposta comercial',
    versao: 'v3',
    nome: 'PROP-2025-0842-v3.pdf',
    status: 'Enviado',
    data: '2025-02-25',
    geradoPor: 'MTI',
    tramite: 'Aguardando assinatura',
  }),
  documentoRow({
    tipo: 'Ofício',
    versao: 'v1',
    nome: 'Oficio-apresentacao-TJMT.pdf',
    status: 'Gerado',
    data: '2025-02-25',
    tramite: 'Pendente',
  }),
  documentoRow({
    tipo: 'Anuência',
    versao: 'v1',
    nome: 'Anuencia-parceiro-v2.pdf',
    status: 'Anexado',
    data: '2025-02-18',
    geradoPor: 'Parceiro',
    obs: 'Retorno da versão v2.',
  }),
]

const TRAMITES_PROP_0842 = [
  tramiteRow({ ordem: 1, setor: 'DIRC', cargo: 'Gerente', perfil: 'Elaborador', status: 'Assinado', dataConclusao: '2025-02-24' }),
  tramiteRow({ ordem: 2, setor: 'DTIC', cargo: 'Arquiteto', perfil: 'Validador técnico', status: 'Assinado', dataConclusao: '2025-02-24' }),
  tramiteRow({ ordem: 3, setor: 'DAFI', cargo: 'Coordenador', perfil: 'Aprovador financeiro', status: 'Enviado para assinatura', dataEnvio: '2025-02-25' }),
  tramiteRow({ ordem: 4, setor: 'Presidência', cargo: 'Diretor', perfil: 'Assinatura final MTI', status: 'Pendente' }),
]

function propostaResumoRow(p) {
  return {
    'atlas-prp-numero': p.numero,
    'atlas-prp-titulo': p.titulo ?? '',
    'atlas-prp-cliente': p.cliente ?? '',
    'atlas-prp-parceiro': p.parceiro ?? '',
    'atlas-prp-tag': p.tag ?? 'Rascunho',
    'atlas-prp-ultimo-destinatario': p.ultimoDestinatario ?? '',
    'atlas-prp-versao-atual': p.versaoAtual ?? '1',
    'atlas-prp-valor-total': p.valorTotal ?? 0,
    'atlas-prp-responsavel-mti': p.responsavelMti ?? '',
    'atlas-prp-workflow-tipo': p.workflowTipo ?? 'Proposta comercial padrão',
  }
}

const PROPOSTA_0842_FULL = {
  'atlas-prp-numero': 'PROP-2025-0842',
  'atlas-prp-titulo': 'Solução integrada cloud + governança — TJMT',
  'atlas-prp-cliente': 'TRIBUNAL DE JUSTIÇA - MT',
  'atlas-prp-parceiro': 'MTI CLOUD',
  'atlas-prp-tag': 'Enviado ao cliente',
  'atlas-prp-ultimo-destinatario': 'Cliente',
  'atlas-prp-versao-atual': '3',
  'atlas-prp-valor-total': 316874.4,
  'atlas-prp-valor-estimado': 450000,
  'atlas-prp-responsavel-mti': 'Ana Comercial — DIRC',
  'atlas-prp-responsavel-parceiro': 'Equipe MTI CLOUD',
  'atlas-prp-origem-colaboracao': 'MTI',
  'atlas-prp-permite-parceiro-editar': 'true',
  'atlas-prp-permite-cliente-visualizar': 'true',
  'atlas-prp-workflow-tipo': 'Proposta com parceiro',
  'atlas-prp-workflow-instancia': 'WF-PROP-0842',
  'atlas-prp-observacoes': 'Demonstração de versionamento: v1 MTI → v2 parceiro → v3 MTI reenvio.',
  'atlas-prp-data-ultima-acao': '2025-02-25',
}

const itemFields = [
  {
    id: 'atlas-prp-item-tipo',
    label: 'Tipo (catálogo)',
    type: 'textOptions',
    size: 'medium',
    options: TIPO_ITEM_CATALOGO,
    relevance: 'common',
    spec: 'Origem: produtos vigentes, licenças ou serviços.',
  },
  {
    id: 'atlas-prp-item-codigo-atlas',
    label: 'Código Atlas',
    type: 'text',
    size: 'medium',
    relevance: 'identity',
    spec: 'Código Sydle do item no catálogo.',
  },
  {
    id: 'atlas-prp-item-descricao',
    label: 'Descrição',
    type: 'text',
    size: 'large',
    textLong: true,
    relevance: 'highlight',
    spec: '',
  },
  {
    id: 'atlas-prp-item-siag',
    label: 'Código Siag',
    type: 'text',
    size: 'small',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-item-protheus',
    label: 'Código Protheus',
    type: 'text',
    size: 'small',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-item-quantidade',
    label: 'Quantidade',
    type: 'number',
    size: 'small',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-item-valor-unitario',
    label: 'Valor unitário (R$)',
    type: 'decimal',
    size: 'medium',
    currency: true,
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-item-valor-total',
    label: 'Valor total (R$)',
    type: 'decimal',
    size: 'medium',
    currency: true,
    relevance: 'highlight',
    spec: '',
  },
  {
    id: 'atlas-prp-item-origem-catalogo',
    label: 'Formulário catálogo origem',
    type: 'text',
    size: 'medium',
    relevance: 'advanced',
    spec: `Referência: ${FORM_CATALOGO_VIGENTES}, ${FORM_CATALOGO_LICENCAS} ou ${FORM_CATALOGO_SERVICOS}.`,
  },
]

const versaoFields = [
  {
    id: 'atlas-prp-ver-numero',
    label: 'Nº versão',
    type: 'number',
    size: 'small',
    relevance: 'identity',
    spec: 'Sequência 1, 2, 3… para linha do tempo.',
  },
  {
    id: 'atlas-prp-ver-rotulo',
    label: 'Rótulo da versão',
    type: 'text',
    size: 'large',
    relevance: 'highlight',
    spec: 'Ex.: v2 — Parceiro retorno com ajustes.',
  },
  {
    id: 'atlas-prp-ver-origem',
    label: 'Origem da versão',
    type: 'textOptions',
    size: 'large',
    options: ORIGEM_VERSAO,
    relevance: 'common',
    spec: 'Quem produziu esta revisão.',
  },
  {
    id: 'atlas-prp-ver-tag',
    label: 'Tag / status',
    type: 'textOptions',
    size: 'medium',
    options: TAGS_PROPOSTA,
    relevance: 'highlight',
    spec: 'Enviado, em andamento, retornado com ajustes, etc.',
  },
  {
    id: 'atlas-prp-ver-autor',
    label: 'Autor',
    type: 'text',
    size: 'medium',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-ver-data',
    label: 'Data',
    type: 'date',
    size: 'medium',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-ver-destinatario-envio',
    label: 'Enviado para',
    type: 'textOptions',
    size: 'medium',
    options: [...DESTINATARIO_ENVIO, 'MTI (interno)'],
    relevance: 'common',
    spec: 'Destinatário do envio desta versão.',
  },
  {
    id: 'atlas-prp-ver-resumo-alteracoes',
    label: 'Resumo das alterações',
    type: 'text',
    size: 'large',
    textLong: true,
    relevance: 'common',
    spec: 'O que mudou em relação à versão anterior.',
  },
  {
    id: 'atlas-prp-ver-documento-ref',
    label: 'Documento (referência)',
    type: 'text',
    size: 'medium',
    relevance: 'common',
    spec: 'PDF ou pacote gerado desta versão.',
  },
  {
    id: 'atlas-prp-ver-ativa',
    label: 'Versão ativa',
    type: 'boolean',
    size: 'small',
    relevance: 'advanced',
    spec: 'Somente uma versão ativa por proposta.',
  },
]

const documentoFields = [
  {
    id: 'atlas-prp-doc-tipo',
    label: 'Tipo de documento',
    type: 'textOptions',
    size: 'medium',
    options: TIPOS_DOCUMENTO,
    relevance: 'identity',
    spec: 'Proposta, ofício, contrato, anuência…',
  },
  {
    id: 'atlas-prp-doc-versao',
    label: 'Versão do documento',
    type: 'text',
    size: 'small',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-doc-nome-arquivo',
    label: 'Nome do arquivo',
    type: 'text',
    size: 'large',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-doc-status',
    label: 'Status',
    type: 'textOptions',
    size: 'medium',
    options: ['Rascunho', 'Gerado', 'Anexado', 'Enviado', 'Tramitando', 'Assinado', 'Arquivado'],
    relevance: 'highlight',
    spec: '',
  },
  {
    id: 'atlas-prp-doc-data-geracao',
    label: 'Data geração/anexo',
    type: 'date',
    size: 'medium',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-doc-gerado-por',
    label: 'Gerado por',
    type: 'textOptions',
    size: 'medium',
    options: ORIGEM_COLABORACAO,
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-doc-tramite',
    label: 'Tramite documento',
    type: 'textOptions',
    size: 'medium',
    options: STATUS_TRAMITE,
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-prp-doc-observacoes',
    label: 'Observações',
    type: 'text',
    size: 'medium',
    textLong: true,
    relevance: 'advanced',
    spec: '',
  },
]

const etapaFields = [
  {
    id: 'atlas-prp-wf-etapa-nome',
    label: 'Nome da etapa',
    type: 'text',
    size: 'medium',
    relevance: 'identity',
    spec: '',
  },
  {
    id: 'atlas-prp-wf-etapa-area',
    label: 'Área / setor',
    type: 'textOptions',
    size: 'medium',
    options: AREAS_INTERNAS,
    relevance: 'common',
    spec: 'DIRC, DTIC, Presidência, DAFI…',
  },
  {
    id: 'atlas-prp-wf-etapa-perfil',
    label: 'Perfil exigido',
    type: 'text',
    size: 'medium',
    relevance: 'common',
    spec: 'Quem precisa assinar, concordar ou validar.',
  },
  {
    id: 'atlas-prp-wf-etapa-ordem',
    label: 'Ordem',
    type: 'number',
    size: 'small',
    relevance: 'advanced',
    spec: '',
  },
  {
    id: 'atlas-prp-wf-etapa-acao',
    label: 'Tipo de ação',
    type: 'textOptions',
    size: 'medium',
    options: TIPO_ACAO_ETAPA,
    relevance: 'highlight',
    spec: 'Assinatura única por etapa: assinar, concordar ou validar.',
  },
  {
    id: 'atlas-prp-wf-etapa-obrigatoria',
    label: 'Etapa obrigatória',
    type: 'boolean',
    size: 'small',
    relevance: 'advanced',
    spec: '',
  },
  {
    id: 'atlas-prp-wf-etapa-paralela',
    label: 'Permite paralelo',
    type: 'boolean',
    size: 'small',
    relevance: 'advanced',
    spec: 'Várias áreas na mesma ordem.',
  },
]

export const propostaForms = [
  {
    id: FORM_PROPOSTA_ITEM,
    name: 'Proposta — item do catálogo',
    sectionLayout: 'none',
    sections: propostaItemFase1Sections,
    fields: [...itemFields, ...propostaItemFase1Fields],
    exampleValuePresets: [
      {
        id: 'atlas-prp-item-p01',
        name: 'Item — serviço',
        iconColor: '#0ea5e9',
        fieldValues: ITENS_PROP_0842[0],
      },
      {
        id: 'atlas-prp-item-preset-fase1-simplifica',
        name: 'Item Fase 1 — licença snapshot',
        iconColor: '#0c1ba8',
        fieldValues: {
          ...ITENS_PROP_0842[0],
          'atlas-prpi-origem-catalogo': 'Licença',
          'atlas-prpi-descricao': 'MTI Workspace — assinatura mensal',
          'atlas-prpi-codigo-siag': 'LIC-WS-01',
          'atlas-prpi-codigo-protheus': 'L100',
          'atlas-prpi-solucao': 'MTI Simplifica',
          'atlas-prpi-metrica': 'Assinatura mensal',
          'atlas-prpi-cobranca': 'Recorrente',
          'atlas-prpi-recorrencia-cobranca': 'Mensal',
          'atlas-prpi-modelo-venda': 'Licenciamento',
          'atlas-prpi-valor-unitario': 12000,
          'atlas-prpi-quantidade': 12,
          'atlas-prpi-valor-total': 144000,
          'atlas-prpi-valor-previsto': 144000,
          'atlas-prpi-versao-catalogo': '2026.05',
          'atlas-prpi-part-number': 'PN-WS-01',
          'atlas-prpi-grupo': 'Licenças',
          'atlas-prpi-complexidade': 'Média',
          'atlas-prpi-tipo-cobranca': 'Recorrente',
          'atlas-prpi-universal': 'false',
          'atlas-prpi-individualizado': 'true',
          'atlas-prpi-status-parceria': 'Ativa',
        },
      },
    ],
    activeExamplePresetId: 'atlas-prp-item-preset-fase1-simplifica',
  },
  {
    id: FORM_PROPOSTA_VERSAO,
    name: 'Proposta — versão',
    sectionLayout: 'none',
    sections: [propostaVersaoFase1Section],
    fields: [...versaoFields, ...propostaVersaoFase1Fields],
    exampleValuePresets: VERSOES_PROP_0842.map((v, i) => ({
      id: `atlas-prp-ver-p0${i + 1}`,
      name: v['atlas-prp-ver-rotulo'],
      iconColor: i === 2 ? '#059669' : '#6366f1',
      fieldValues: v,
    })),
    activeExamplePresetId: 'atlas-prp-ver-p03',
    metadata: 'Cada versão preserva snapshot para visualização (MTI, parceiro, reenvios).',
  },
  {
    id: FORM_PROPOSTA_DOCUMENTO,
    name: 'Proposta — documento',
    sectionLayout: 'none',
    sections: [propostaDocFase1Section],
    fields: [...documentoFields, ...propostaDocFase1Fields],
    exampleValuePresets: [
      {
        id: 'atlas-prp-doc-p01',
        name: 'Documento — proposta v3',
        iconColor: '#0c1ba8',
        fieldValues: DOCS_PROP_0842[0],
      },
    ],
    activeExamplePresetId: 'atlas-prp-doc-p01',
  },
  {
    id: FORM_PROPOSTA_WORKFLOW_ETAPA,
    name: 'Workflow — etapa',
    sectionLayout: 'none',
    fields: etapaFields,
    exampleValuePresets: [
      {
        id: 'atlas-prp-wf-etapa-p01',
        name: 'Etapa — DAFI aprovar',
        iconColor: '#7c3aed',
        fieldValues: etapaWorkflowRow({
          nome: 'Aprovação financeira',
          area: 'DAFI',
          perfil: 'Coordenador financeiro',
          ordem: 3,
          acao: 'Aprovar',
        }),
      },
    ],
    activeExamplePresetId: 'atlas-prp-wf-etapa-p01',
  },
  {
    id: FORM_PROPOSTA_WORKFLOW_TIPO,
    name: 'Workflow — tipo de processo',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    sections: [
      { id: 'sec-wf-tipo', title: 'Tipo de processo', icon: 'account_tree' },
      { id: 'sec-wf-etapas', title: 'Etapas e responsáveis', icon: 'linear_scale' },
    ],
    fields: [
      {
        id: 'atlas-prp-wf-tipo-nome',
        label: 'Nome do fluxo',
        type: 'textOptions',
        size: 'large',
        options: TIPOS_PROCESSO_WORKFLOW,
        relevance: 'identity',
        sectionId: 'sec-wf-tipo',
        spec: 'Fluxos configuráveis por tipo de processo.',
      },
      {
        id: 'atlas-prp-wf-tipo-descricao',
        label: 'Descrição',
        type: 'text',
        size: 'large',
        textLong: true,
        relevance: 'common',
        sectionId: 'sec-wf-tipo',
        spec: '',
      },
      {
        id: 'atlas-prp-wf-tipo-ativo',
        label: 'Ativo',
        type: 'boolean',
        size: 'small',
        relevance: 'common',
        sectionId: 'sec-wf-tipo',
        spec: '',
      },
      {
        id: EMB_WORKFLOW_ETAPAS,
        label: 'Etapas do workflow',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_PROPOSTA_WORKFLOW_ETAPA,
        relevance: 'highlight',
        sectionId: 'sec-wf-etapas',
        spec: 'Responsáveis, ordem e tipo de assinatura/concordância/validação por etapa.',
      },
    ],
    exampleValuePresets: [
      {
        id: 'atlas-prp-wf-tipo-p01',
        name: 'Fluxo — proposta com parceiro',
        iconColor: '#1e3a5f',
        fieldValues: {
          'atlas-prp-wf-tipo-nome': 'Proposta com parceiro',
          'atlas-prp-wf-tipo-descricao':
            'MTI elabora → envia parceiro → retorno com ajustes → aprovação DIRC/DTIC/DAFI/Presidência → envio cliente.',
          'atlas-prp-wf-tipo-ativo': 'true',
        },
        embeddedRowsByFieldId: {
          [EMB_WORKFLOW_ETAPAS]: [
            etapaWorkflowRow({ nome: 'Elaboração MTI', area: 'DIRC', perfil: 'Comercial', ordem: 1, acao: 'Validar' }),
            etapaWorkflowRow({ nome: 'Complemento parceiro', area: 'Comercial', perfil: 'Parceiro', ordem: 2, acao: 'Concordar' }),
            etapaWorkflowRow({ nome: 'Validação técnica', area: 'DTIC', perfil: 'Arquiteto', ordem: 3, acao: 'Validar' }),
            etapaWorkflowRow({ nome: 'Aprovação financeira', area: 'DAFI', perfil: 'Coordenador', ordem: 4, acao: 'Aprovar' }),
            etapaWorkflowRow({ nome: 'Assinatura MTI', area: 'Presidência', perfil: 'Diretor', ordem: 5, acao: 'Assinar' }),
          ],
        },
      },
    ],
    activeExamplePresetId: 'atlas-prp-wf-tipo-p01',
    metadata: 'Cadastro de workflows configuráveis (protótipo).',
  },
  {
    id: FORM_PROPOSTA,
    name: 'Proposta comercial — cadastro',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: METODOS_PROPOSTA,
    sections: [
      { id: 'sec-prp-ident', title: 'Identificação e envio', icon: 'badge' },
      { id: 'sec-prp-colab', title: 'Colaboração', icon: 'groups' },
      { id: 'sec-prp-itens', title: 'Itens (catálogos)', icon: 'inventory_2' },
      { id: 'sec-prp-versoes', title: 'Versionamento', icon: 'history' },
      { id: 'sec-prp-docs', title: 'Documentos', icon: 'folder' },
      { id: 'sec-prp-ass', title: 'Assinaturas internas', icon: 'draw' },
      ...propostaFase1Sections,
    ],
    fields: [
      {
        id: 'atlas-prp-numero',
        label: 'Número da proposta',
        type: 'text',
        size: 'medium',
        relevance: 'identity',
        sectionId: 'sec-prp-ident',
        spec: 'Identificador único (ex.: PROP-2025-0842). Gestão Centralizada DIRC e vínculo ao processo contratual.',
      },
      {
        id: 'atlas-prp-titulo',
        label: 'Título',
        type: 'text',
        size: 'large',
        relevance: 'common',
        sectionId: 'sec-prp-ident',
        spec: '',
      },
      {
        id: 'atlas-prp-cliente',
        label: 'Cliente',
        type: 'text',
        size: 'large',
        relevance: 'common',
        sectionId: 'sec-prp-ident',
        spec: '',
      },
      {
        id: 'atlas-prp-parceiro',
        label: 'Parceiro',
        type: 'text',
        size: 'medium',
        relevance: 'common',
        sectionId: 'sec-prp-ident',
        spec: '',
      },
      {
        id: 'atlas-prp-tag',
        label: 'Tag / status da proposta',
        type: 'textOptions',
        size: 'medium',
        options: TAGS_PROPOSTA,
        relevance: 'highlight',
        sectionId: 'sec-prp-ident',
        spec: 'Enviado, em andamento, retornado com ajustes, assinado, etc.',
      },
      {
        id: 'atlas-prp-ultimo-destinatario',
        label: 'Último envio para',
        type: 'textOptions',
        size: 'medium',
        options: DESTINATARIO_ENVIO,
        relevance: 'common',
        sectionId: 'sec-prp-ident',
        spec: 'Cliente ou parceiro — último destinatário do envio.',
      },
      {
        id: 'atlas-prp-versao-atual',
        label: 'Versão atual',
        type: 'number',
        size: 'small',
        relevance: 'common',
        sectionId: 'sec-prp-ident',
        spec: 'Número da versão ativa na linha do tempo.',
      },
      {
        id: 'atlas-prp-valor-total',
        label: 'Valor total itens (R$)',
        type: 'decimal',
        size: 'medium',
        currency: true,
        relevance: 'highlight',
        sectionId: 'sec-prp-ident',
        spec: 'Soma dos itens do catálogo. Espelhar em atlas-prp-valor-total-previsto quando aplicável.',
      },
      {
        id: 'atlas-prp-valor-estimado',
        label: 'Valor estimado negócio (R$)',
        type: 'decimal',
        size: 'medium',
        currency: true,
        relevance: 'common',
        sectionId: 'sec-prp-ident',
        spec: '',
      },
      {
        id: 'atlas-prp-workflow-tipo',
        label: 'Tipo de workflow',
        type: 'textOptions',
        size: 'medium',
        options: TIPOS_PROCESSO_WORKFLOW,
        relevance: 'common',
        sectionId: 'sec-prp-ident',
        spec: 'Referência ao cadastro de fluxo configurável.',
      },
      {
        id: 'atlas-prp-workflow-instancia',
        label: 'Instância workflow',
        type: 'text',
        size: 'medium',
        relevance: 'advanced',
        sectionId: 'sec-prp-ident',
        spec: '',
      },
      {
        id: 'atlas-prp-data-ultima-acao',
        label: 'Data última ação',
        type: 'date',
        size: 'medium',
        relevance: 'common',
        sectionId: 'sec-prp-ident',
        spec: '',
      },
      {
        id: 'atlas-prp-responsavel-mti',
        label: 'Responsável MTI',
        type: 'text',
        size: 'medium',
        relevance: 'common',
        sectionId: 'sec-prp-colab',
        spec: '',
      },
      {
        id: 'atlas-prp-responsavel-parceiro',
        label: 'Responsável parceiro',
        type: 'text',
        size: 'medium',
        relevance: 'common',
        sectionId: 'sec-prp-colab',
        spec: '',
      },
      {
        id: 'atlas-prp-origem-colaboracao',
        label: 'Quem iniciou',
        type: 'textOptions',
        size: 'medium',
        options: ORIGEM_COLABORACAO,
        relevance: 'common',
        sectionId: 'sec-prp-colab',
        spec: 'MTI ou parceiro pode iniciar; o outro complementa/valida.',
      },
      {
        id: 'atlas-prp-permite-parceiro-editar',
        label: 'Parceiro pode editar',
        type: 'boolean',
        size: 'small',
        relevance: 'common',
        sectionId: 'sec-prp-colab',
        spec: '',
      },
      {
        id: 'atlas-prp-permite-cliente-visualizar',
        label: 'Cliente pode visualizar',
        type: 'boolean',
        size: 'small',
        relevance: 'common',
        sectionId: 'sec-prp-colab',
        spec: '',
      },
      {
        id: 'atlas-prp-observacoes',
        label: 'Observações',
        type: 'text',
        size: 'large',
        textLong: true,
        relevance: 'advanced',
        sectionId: 'sec-prp-colab',
        spec: '',
      },
      {
        id: EMB_PROPOSTA_ITENS,
        label: 'Itens da proposta',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_PROPOSTA_ITEM,
        relevance: 'highlight',
        sectionId: 'sec-prp-itens',
        spec:
          'Montar a partir de produtos vigentes, catálogo de licenças e catálogo de serviços. Use o método «Montar a partir dos catálogos».',
      },
      {
        id: EMB_PROPOSTA_VERSOES,
        label: 'Histórico de versões',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_PROPOSTA_VERSAO,
        relevance: 'highlight',
        sectionId: 'sec-prp-versoes',
        spec:
          'Visualize a primeira proposta, a do parceiro com ajustes e reenvios MTI. Métodos: visualizar versão, comparar versões.',
      },
      {
        id: EMB_PROPOSTA_DOCUMENTOS,
        label: 'Documentos',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_PROPOSTA_DOCUMENTO,
        relevance: 'highlight',
        sectionId: 'sec-prp-docs',
        spec: 'Gerar, anexar, tramitar e versionar proposta, ofício, contrato e anuência.',
      },
      {
        id: EMB_TRAMITES,
        label: 'Tramites de assinatura (aprovação interna)',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_TRAMITE_ASSINATURA,
        relevance: 'highlight',
        sectionId: 'sec-prp-ass',
        spec: 'DIRC, DTIC, Presidência, DAFI e demais conforme o fluxo. Assinatura única por etapa.',
      },
      ...propostaFase1Fields,
    ],
    exampleValuePresets: [
      {
        id: 'atlas-prp-preset-0842',
        name: 'PROP-0842 — versionamento MTI/parceiro',
        iconColor: '#0ea5e9',
        fieldValues: PROPOSTA_0842_FULL,
        embeddedRowsByFieldId: {
          [EMB_PROPOSTA_ITENS]: ITENS_PROP_0842,
          [EMB_PROPOSTA_VERSOES]: VERSOES_PROP_0842,
          [EMB_PROPOSTA_DOCUMENTOS]: DOCS_PROP_0842,
          [EMB_TRAMITES]: TRAMITES_PROP_0842,
        },
      },
      {
        id: 'atlas-prp-preset-rascunho',
        name: 'Rascunho — MTI elaborando',
        iconColor: '#94a3b8',
        fieldValues: {
          'atlas-prp-numero': 'PROP-2025-0901',
          'atlas-prp-titulo': 'Nova proposta — rascunho',
          'atlas-prp-cliente': 'SEFAZ-MT',
          'atlas-prp-tag': 'Rascunho',
          'atlas-prp-versao-atual': 1,
          'atlas-prp-origem-colaboracao': 'MTI',
          'atlas-prp-workflow-tipo': 'Proposta comercial padrão',
        },
        embeddedRowsByFieldId: {
          [EMB_PROPOSTA_VERSOES]: [
            versaoRow({
              numero: 1,
              rotulo: 'v1 — rascunho MTI',
              tag: 'Rascunho',
              autor: 'MTI',
              ativa: 'true',
            }),
          ],
        },
      },
      propostaFase1Preset,
    ],
    activeExamplePresetId: 'atlas-prp-preset-0842',
    metadata:
      'Cadastro de proposta com colaboração, versionamento, documentos e assinaturas. Integra catálogos vigentes, licenças e serviços.',
  },
  {
    id: FORM_VISAO_PROPOSTAS,
    name: 'Propostas — visualização geral',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: [
      { id: 'atlas-prp-meth-abrir-cadastro', name: 'Abrir cadastro da proposta', icon: 'open_in_new', kind: 'destaque' },
      { id: 'atlas-prp-meth-visualizar-versao', name: 'Visualizar versão', icon: 'history', kind: 'secundario' },
    ],
    sections: [
      { id: 'sec-vis-prp-lista', title: 'Todas as propostas', icon: 'table_chart' },
      { id: 'sec-vis-prp-filtro', title: 'Filtros', icon: 'filter_list' },
    ],
    fields: [
      {
        id: EMB_PROPOSTAS_LISTA,
        label: 'Propostas',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_PROPOSTA,
        relevance: 'highlight',
        sectionId: 'sec-vis-prp-lista',
        spec: 'Grade resumida; abra o cadastro para itens, versões e documentos.',
      },
      {
        id: 'atlas-vis-prp-filtro-tag',
        label: 'Filtrar por tag',
        type: 'textOptions',
        size: 'medium',
        multiple: true,
        options: TAGS_PROPOSTA,
        relevance: 'common',
        sectionId: 'sec-vis-prp-filtro',
        spec: '',
      },
      {
        id: 'atlas-vis-prp-filtro-destinatario',
        label: 'Filtrar destinatário envio',
        type: 'textOptions',
        size: 'medium',
        options: DESTINATARIO_ENVIO,
        relevance: 'common',
        sectionId: 'sec-vis-prp-filtro',
        spec: '',
      },
    ],
    exampleValuePresets: [
      {
        id: 'atlas-vis-prp-p01',
        name: 'Visão — propostas ativas',
        iconColor: '#0c1ba8',
        fieldValues: {
          'atlas-vis-prp-filtro-tag': ['Enviado', 'Em andamento', 'Retornado com ajustes', 'Enviado ao cliente'],
        },
        embeddedRowsByFieldId: {
          [EMB_PROPOSTAS_LISTA]: [
            propostaResumoRow({
              numero: 'PROP-2025-0842',
              titulo: 'Solução integrada cloud — TJMT',
              cliente: 'TRIBUNAL DE JUSTIÇA - MT',
              parceiro: 'MTI CLOUD',
              tag: 'Enviado ao cliente',
              ultimoDestinatario: 'Cliente',
              versaoAtual: '3',
              valorTotal: 316874.4,
              responsavelMti: 'Ana Comercial — DIRC',
            }),
            propostaResumoRow({
              numero: 'PROP-2025-0901',
              titulo: 'Nova proposta — rascunho',
              cliente: 'SEFAZ-MT',
              tag: 'Rascunho',
              versaoAtual: '1',
              responsavelMti: 'Carlos — DIRC',
            }),
          ],
        },
      },
    ],
    activeExamplePresetId: 'atlas-vis-prp-p01',
  },
  {
    id: FORM_VISAO_HISTORICO_VERSOES,
    name: 'Propostas — histórico de versões',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: [
      { id: 'atlas-prp-meth-visualizar-versao', name: 'Visualizar versão enviada', icon: 'visibility', kind: 'destaque' },
      { id: 'atlas-prp-meth-comparar-versoes', name: 'Comparar duas versões', icon: 'compare', kind: 'secundario' },
      { id: 'atlas-prp-meth-abrir-parceiro', name: 'Abrir versão do parceiro', icon: 'groups', kind: 'secundario' },
    ],
    sections: [
      { id: 'sec-hist-ident', title: 'Proposta selecionada', icon: 'search' },
      { id: 'sec-hist-linha', title: 'Linha do tempo', icon: 'timeline' },
    ],
    fields: [
      {
        id: 'atlas-hist-prp-numero',
        label: 'Número da proposta',
        type: 'text',
        size: 'medium',
        relevance: 'identity',
        sectionId: 'sec-hist-ident',
        spec: '',
      },
      {
        id: 'atlas-hist-prp-cliente',
        label: 'Cliente',
        type: 'text',
        size: 'large',
        relevance: 'common',
        sectionId: 'sec-hist-ident',
        spec: '',
      },
      {
        id: EMB_PROPOSTA_VERSOES,
        label: 'Versões (linha do tempo)',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_PROPOSTA_VERSAO,
        relevance: 'highlight',
        sectionId: 'sec-hist-linha',
        spec: 'v1 enviada, v2 parceiro com ajustes, v3 MTI reenvio — visualize cada snapshot.',
      },
    ],
    exampleValuePresets: [
      {
        id: 'atlas-hist-prp-p01',
        name: 'Histórico PROP-0842',
        iconColor: '#6366f1',
        fieldValues: {
          'atlas-hist-prp-numero': 'PROP-2025-0842',
          'atlas-hist-prp-cliente': 'TRIBUNAL DE JUSTIÇA - MT',
        },
        embeddedRowsByFieldId: {
          [EMB_PROPOSTA_VERSOES]: VERSOES_PROP_0842,
        },
      },
    ],
    activeExamplePresetId: 'atlas-hist-prp-p01',
    metadata: 'Visualização dedicada ao versionamento e comparação entre revisões.',
  },
]

export const propostaClassGroups = {
  extraGroups: [
    { id: 'grp-atlas-proposta', name: 'Propostas comerciais' },
    { id: 'grp-atlas-proposta-workflow', name: 'Workflow de propostas' },
    { id: 'grp-atlas-proposta-suporte', name: 'Linhas embutidas (proposta)' },
  ],
  assignments: {
    [FORM_PROPOSTA]: 'grp-atlas-proposta',
    [FORM_VISAO_PROPOSTAS]: 'grp-atlas-proposta',
    [FORM_VISAO_HISTORICO_VERSOES]: 'grp-atlas-proposta',
    [FORM_PROPOSTA_WORKFLOW_TIPO]: 'grp-atlas-proposta-workflow',
    [FORM_PROPOSTA_ITEM]: 'grp-atlas-proposta-suporte',
    [FORM_PROPOSTA_VERSAO]: 'grp-atlas-proposta-suporte',
    [FORM_PROPOSTA_DOCUMENTO]: 'grp-atlas-proposta-suporte',
    [FORM_PROPOSTA_WORKFLOW_ETAPA]: 'grp-atlas-proposta-suporte',
  },
  memberOrder: {
    'grp-atlas-proposta': [FORM_VISAO_PROPOSTAS, FORM_VISAO_HISTORICO_VERSOES, FORM_PROPOSTA],
    'grp-atlas-proposta-workflow': [FORM_PROPOSTA_WORKFLOW_TIPO],
    'grp-atlas-proposta-suporte': [
      FORM_PROPOSTA_ITEM,
      FORM_PROPOSTA_VERSAO,
      FORM_PROPOSTA_DOCUMENTO,
      FORM_PROPOSTA_WORKFLOW_ETAPA,
    ],
  },
  workspaceClasses: [
    {
      id: 'cls-atlas-visao-propostas',
      name: 'Propostas — visualização',
      linkedFormId: FORM_VISAO_PROPOSTAS,
    },
    {
      id: 'cls-atlas-historico-propostas',
      name: 'Propostas — histórico de versões',
      linkedFormId: FORM_VISAO_HISTORICO_VERSOES,
    },
    {
      id: 'cls-atlas-proposta-cadastro',
      name: 'Proposta — cadastro',
      linkedFormId: FORM_PROPOSTA,
    },
    {
      id: 'cls-atlas-proposta-workflow',
      name: 'Workflow — tipos de processo',
      linkedFormId: FORM_PROPOSTA_WORKFLOW_TIPO,
    },
  ],
  suporteGroupId: 'grp-atlas-proposta-suporte',
}
