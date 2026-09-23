/**
 * Contratos Atlas — fluxo Proposta → Documentos → Contrato → OS → Termo → RAER,
 * tramites de assinatura, itens do catálogo (Siag/Protheus), consumo e PV por contrato.
 */

import { FORM_CATALOGO_VIGENTES } from './atlas-catalog-forms.mjs'
import { FORM_CATALOGO_LICENCAS } from './atlas-licenca-forms.mjs'
import { FORM_CATALOGO_SERVICOS } from './atlas-servico-forms.mjs'

export const FORM_TRAMITE_ASSINATURA = 'form-atlas-tramite-assinatura'
export const FORM_CONTRATO_ITEM = 'form-atlas-contrato-item-catalogo'
import { FORM_PROPOSTA } from './atlas-proposta-forms.mjs'

export { FORM_PROPOSTA }
export const FORM_DOCUMENTOS_FASE = 'form-atlas-documentos-fase'
export const FORM_CONTRATO_GESTAO = 'form-atlas-contrato-gestao'
export const FORM_ORDEM_SERVICO = 'form-atlas-ordem-servico'
export const FORM_TERMO_HOMOLOGACAO = 'form-atlas-termo-homologacao'
export const FORM_RAER = 'form-atlas-raer'
export const FORM_PROCESSO_CONTRATUAL = 'form-atlas-processo-contratual'
export const FORM_CONTROLE_ORFAOS = 'form-atlas-controle-sem-contrato'

export const EMB_TRAMITES = 'emb_tramites_assinatura'
export const EMB_ITENS_CONTRATO = 'emb_itens_contrato_catalogo'

const CLASSE_COBRANCA_ITEM = ['Sob Demanda', 'Mensal', 'Anual', 'Pro-Rata']
const TIPO_CATALOGO = ['Serviço', 'Licença', 'Produto']
const ETAPAS_RAER = ['Proposta', 'Documentos', 'Contrato', 'Ordem de serviço', 'Termo de homologação', 'RAER']
const STATUS_TRAMITE = [
  'Pendente',
  'Enviado para assinatura',
  'Em análise',
  'Ajuste solicitado',
  'Reprovado',
  'Aprovado',
  'Assinado',
]
const STATUS_CONSUMO = ['Dentro do limite', 'Alerta (80%)', 'Excedido', 'Sem consumo', 'Não aplicável']
const STATUS_RENOVACAO = ['Vigente', 'A renovar (90 dias)', 'Em renovação', 'Renovado', 'Encerrado', 'Suspenso']
const STATUS_FASE = ['Rascunho', 'Em tramitação', 'Aguardando assinaturas', 'Ajuste pendente', 'Aprovado', 'Reprovado', 'Concluído']
const STATUS_ORFAO = ['Pendente encaminhamento', 'Encaminhado manual Protheus', 'Vinculado a contrato', 'Cancelado']

/* Fase 1 — extensões. Mantemos os ids declarados com strings literais
 * para evitar dependência circular com o módulo Fase 1 (que importa daqui). */
const FORM_DOC_GERADO_FASE1 = 'form-atlas-documento-gerado'
const FORM_WF_INSTANCIA_FASE1 = 'form-atlas-workflow-instancia'
const FORM_ORGANIZACAO_FASE1 = 'form-atlas-organizacao'
const FORM_CHECKLIST_FASE1 = 'form-atlas-checklist-contratual'
const FORM_PROPOSTA_ITEM_FASE1 = 'form-atlas-proposta-item'
const FORM_RECORRENCIA_FASE1 = 'form-atlas-maestro-recorrencia'

const tramiteFase1Section = { id: 'sec-tra-fase1-controle', title: 'Controle Fase 1', icon: 'tune' }

const tramiteFase1Fields = [
  { id: 'atlas-tra-documento', label: 'Documento', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-tra-fase1-controle', linkedFormId: FORM_DOC_GERADO_FASE1, spec: 'Documento que precisa de assinatura.' },
  { id: 'atlas-tra-workflow-instancia', label: 'Instância workflow', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-tra-fase1-controle', linkedFormId: FORM_WF_INSTANCIA_FASE1, spec: 'Instância de workflow que gerou o trâmite.' },
  { id: 'atlas-tra-grupo-assinatura', label: 'Grupo assinatura', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-tra-fase1-controle', options: ['DIRC/MTI', 'Parceiro único', 'Parceiros múltiplos', 'Escopo parceiro', 'DTIC', 'Presidência'], spec: 'Identifica o grupo de assinatura composta (ex.: DIRC + parceiros do escopo).' },
  { id: 'atlas-tra-area', label: 'Área', type: 'textOptions', size: 'medium', required: true, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-tra-fase1-controle', options: ['DIRC', 'UGVEN', 'UGEPV', 'UGPEN', 'DTIC', 'DAFI', 'Presidência', 'Parceiro', 'Cliente'], spec: 'Área responsável pela assinatura.' },
  { id: 'atlas-tra-assinante', label: 'Assinante', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'identity', sectionId: 'sec-tra-fase1-controle', linkedFormId: 'form-atlas-usuario', spec: 'Usuário ou pessoa responsável por esta pendência de assinatura.' },
  { id: 'atlas-tra-papel', label: 'Papel assinatura', type: 'text', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-tra-fase1-controle', spec: 'Papel do assinante no fluxo.' },
  { id: 'atlas-tra-mecanismo', label: 'Mecanismo', type: 'textOptions', size: 'medium', required: true, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-tra-fase1-controle', options: ['Certificado digital', 'Gov.br', 'MT Login', 'Senha', 'Aceite simples'], spec: 'Mecanismo de assinatura ou aceite permitido.' },
  { id: 'atlas-tra-status-pendencia', label: 'Status pendência', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'highlight', sectionId: 'sec-tra-fase1-controle', options: ['Não enviada', 'Pendente', 'Em análise', 'Assinada', 'Reprovada', 'Expirada'], spec: 'Status individual deste assinante na assinatura composta.' },
  { id: 'atlas-tra-data-envio', label: 'Data envio', type: 'date', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-tra-fase1-controle', spec: 'Data em que a pendência foi enviada ao assinante.' },
  { id: 'atlas-tra-data-assinatura', label: 'Data assinatura', type: 'date', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-tra-fase1-controle', spec: 'Data em que a assinatura foi concluída.' },
  { id: 'atlas-tra-data-limite', label: 'Data limite', type: 'date', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-tra-fase1-controle', spec: 'Prazo (SLA) para assinatura antes de escalar a pendência.' },
  { id: 'atlas-tra-dias-pendente', label: 'Dias pendente', type: 'number', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'highlight', sectionId: 'sec-tra-fase1-controle', spec: 'Quantidade de dias desde o envio da pendência.' },
  { id: 'atlas-tra-bloqueia-fluxo', label: 'Bloqueia fluxo', type: 'boolean', size: 'small', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-tra-fase1-controle', spec: 'Define se o processo não pode avançar enquanto este trâmite estiver pendente.' },
  { id: 'atlas-tra-comentario', label: 'Comentário', type: 'text', size: 'large', textLong: true, required: false, multiple: false, readOnly: false, relevance: 'advanced', sectionId: 'sec-tra-fase1-controle', spec: 'Comentário do assinante, reprovação ou justificativa.' },
]

const contratoItemFase1Sections = [
  { id: 'sec-cti-fase1-origem', title: 'Origem Fase 1', icon: 'request_quote' },
  { id: 'sec-cti-fase1-snapshot', title: 'Snapshot contratual', icon: 'photo_camera' },
]

const SNAPSHOT_CONTRATO_SPEC =
  'Valor congelado no cadastro/revisão contratual — rastreabilidade com o item da proposta original.'

const contratoItemFase1Fields = [
  { id: 'atlas-cti-proposta-item', label: 'Item proposta origem', type: 'reference', size: 'large', required: false, multiple: false, readOnly: false, relevance: 'identity', sectionId: 'sec-cti-fase1-origem', linkedFormId: FORM_PROPOSTA_ITEM_FASE1, spec: 'Item de proposta que originou o item contratual — vínculo obrigatório para rastreabilidade.' },
  { id: 'atlas-cti-alterado-contrato', label: 'Alterado no contrato?', type: 'boolean', size: 'small', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-cti-fase1-origem', spec: 'Indica se o item do contrato recebido diverge do item proposto.' },
  { id: 'atlas-cti-motivo-alteracao', label: 'Motivo da alteração', type: 'text', size: 'large', textLong: true, required: false, multiple: false, readOnly: false, relevance: 'advanced', sectionId: 'sec-cti-fase1-origem', spec: 'Obrigatório quando atlas-cti-alterado-contrato = true.' },
  { id: 'atlas-cti-codigo-siag', label: 'Código Siag congelado', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-cti-fase1-snapshot', spec: SNAPSHOT_CONTRATO_SPEC },
  { id: 'atlas-cti-codigo-protheus', label: 'Código Protheus congelado', type: 'text', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-cti-fase1-snapshot', spec: SNAPSHOT_CONTRATO_SPEC },
  { id: 'atlas-cti-versao-catalogo', label: 'Versão do catálogo usada', type: 'text', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-cti-fase1-snapshot', spec: SNAPSHOT_CONTRATO_SPEC },
  { id: 'atlas-cti-valor-unitario', label: 'Valor unitário contratado', type: 'decimal', size: 'medium', currency: true, required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-cti-fase1-snapshot', spec: SNAPSHOT_CONTRATO_SPEC },
  { id: 'atlas-cti-quantidade', label: 'Quantidade contratada', type: 'number', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-cti-fase1-snapshot', spec: SNAPSHOT_CONTRATO_SPEC },
  { id: 'atlas-cti-valor-total', label: 'Valor total contratado', type: 'decimal', size: 'medium', currency: true, required: false, multiple: false, readOnly: true, relevance: 'highlight', sectionId: 'sec-cti-fase1-snapshot', spec: SNAPSHOT_CONTRATO_SPEC },
  { id: 'atlas-cti-recorrencia', label: 'Recorrência', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-cti-fase1-origem', linkedFormId: FORM_RECORRENCIA_FASE1, spec: 'Recorrência de cobrança do item contratado.' },
  { id: 'atlas-cti-status-consumo', label: 'Status consumo', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-cti-fase1-origem', options: ['Não iniciado', 'Disponível', 'Sob demanda', 'Recorrente', 'Suspenso'], spec: 'Situação inicial do item para fases futuras de consumo e faturamento.' },
]

const contratoGestaoFase1Section = { id: 'sec-ctg-fase1-cadastro', title: 'Cadastro Fase 1', icon: 'verified' }

const contratoGestaoFase1Methods = [
  { id: 'atlas-ctg-meth-abrir-rascunho', name: 'Abrir em rascunho', icon: 'note_add', kind: 'destaque' },
  { id: 'atlas-ctg-meth-finalizar-cadastro', name: 'Finalizar cadastro', icon: 'verified', kind: 'destaque' },
  { id: 'atlas-ctg-meth-notificar-cliente', name: 'Notificar cliente', icon: 'send', kind: 'menu' },
]

const contratoGestaoFase1Fields = [
  { id: 'atlas-ctg-cliente-org', label: 'Cliente', type: 'reference', size: 'large', required: true, multiple: false, readOnly: false, relevance: 'identity', sectionId: 'sec-ctg-fase1-cadastro', linkedFormId: FORM_ORGANIZACAO_FASE1, spec: 'Organização cliente vinculada ao contrato.' },
  { id: 'atlas-ctg-processo-contratual', label: 'Processo contratual', type: 'reference', size: 'large', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-ctg-fase1-cadastro', linkedFormId: FORM_PROCESSO_CONTRATUAL, spec: 'Processo contratual Fase 1 que originou este cadastro (recebimento e revisão de itens).' },
  { id: 'atlas-ctg-proposta-origem-ref', label: 'Proposta origem', type: 'reference', size: 'large', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-ctg-fase1-cadastro', linkedFormId: FORM_PROPOSTA, spec: 'Proposta que deu origem ao contrato.' },
  { id: 'atlas-ctg-extrato-publicacao', label: 'Extrato publicação', type: 'file', size: 'large', required: true, multiple: true, readOnly: false, relevance: 'highlight', sectionId: 'sec-ctg-fase1-cadastro', spec: 'Arquivo obrigatório com o extrato de publicação do contrato.' },
  { id: 'atlas-ctg-data-publicacao', label: 'Data publicação', type: 'date', size: 'medium', required: true, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-ctg-fase1-cadastro', spec: 'Data de publicação do contrato.' },
  { id: 'atlas-ctg-status-cadastro', label: 'Status cadastro', type: 'textOptions', size: 'medium', required: true, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-ctg-fase1-cadastro', options: ['Rascunho', 'Em validação', 'Pendente publicação', 'Pendente integração', 'Ativo', 'Suspenso', 'Cancelado'], spec: 'Situação do cadastro contratual.' },
  { id: 'atlas-ctg-recorrencia-padrao', label: 'Recorrência padrão', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-ctg-fase1-cadastro', linkedFormId: FORM_RECORRENCIA_FASE1, spec: 'Recorrência predominante dos itens do contrato.' },
  { id: 'atlas-ctg-checklist-validado', label: 'Checklist validado', type: 'boolean', size: 'small', required: true, multiple: false, readOnly: true, relevance: 'highlight', sectionId: 'sec-ctg-fase1-cadastro', spec: 'Deve ser true para permitir cadastro — preenchido após Validar checklist contratual.' },
  { id: 'atlas-ctg-kickoff-demandado', label: 'Kickoff demandado', type: 'boolean', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-ctg-fase1-cadastro', spec: 'Indica se o pós-vendas foi notificado para kickoff.' },
  { id: 'atlas-ctg-cliente-notificado', label: 'Cliente notificado', type: 'boolean', size: 'small', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-ctg-fase1-cadastro', spec: 'Indica se o cliente recebeu notificação de inclusão do contrato.' },
]

const processoContratualFase1Section = { id: 'sec-pctr-fase1-finalizacao', title: 'Recebimento do contrato (cliente)', icon: 'verified' }

const processoContratualRevisaoItensSection = { id: 'sec-pctr-fase1-revisao-itens', title: 'Revisão itens contratados', icon: 'compare' }

const processoContratualFase1Fields = [
  { id: 'atlas-pctr-proposta-origem', label: 'Proposta aprovada', type: 'reference', size: 'large', required: true, multiple: false, readOnly: false, relevance: 'identity', sectionId: 'sec-pctr-fase1-finalizacao', linkedFormId: FORM_PROPOSTA, spec: 'Proposta aprovada e enviada ao cliente que originou este processo contratual.' },
  { id: 'atlas-pctr-anexo-contrato-recebido', label: 'Anexo contrato recebido', type: 'file', size: 'large', required: true, multiple: true, readOnly: false, relevance: 'highlight', sectionId: 'sec-pctr-fase1-finalizacao', spec: 'Arquivo do contrato devolvido pelo cliente (assinado/publicado) — obrigatório no recebimento.' },
  { id: 'atlas-pctr-data-retorno-contrato', label: 'Data retorno à MTI', type: 'date', size: 'medium', required: true, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-pctr-fase1-finalizacao', spec: 'Data em que o contrato retornou à MTI após o apoio externo à contratação.' },
  { id: 'atlas-pctr-contrato-rascunho', label: 'Contrato rascunho', type: 'reference', size: 'large', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-pctr-fase1-finalizacao', linkedFormId: FORM_CONTRATO_GESTAO, spec: 'Contrato aberto em rascunho após revisão de itens — preenchido na etapa Abrir contrato em rascunho, antes do checklist.' },
  { id: 'atlas-pctr-workflow-instancia', label: 'Workflow', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: true, relevance: 'common', sectionId: 'sec-pctr-fase1-finalizacao', linkedFormId: FORM_WF_INSTANCIA_FASE1, spec: 'Instância de workflow vinculada ao processo contratual.' },
  { id: 'atlas-pctr-checklist', label: 'Checklist', type: 'reference', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-pctr-fase1-finalizacao', linkedFormId: FORM_CHECKLIST_FASE1, spec: 'Checklist de fechamento do cadastro contratual.' },
  { id: 'atlas-pctr-status-finalizacao', label: 'Status finalização', type: 'textOptions', size: 'medium', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-pctr-fase1-finalizacao', options: ['Aguardando contrato', 'Em cadastro', 'Revisão itens', 'Pendente checklist', 'Pendente publicação', 'Pendente integração', 'Finalizado', 'Cancelado'], spec: 'Situação da finalização do processo contratual na Fase 1.' },
  { id: 'atlas-pctr-itens-revisados', label: 'Itens revisados', type: 'boolean', size: 'small', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-pctr-fase1-revisao-itens', spec: 'Indica se os itens contratados foram conferidos contra a proposta.' },
  { id: 'atlas-pctr-ha-divergencia', label: 'Há divergência', type: 'boolean', size: 'small', required: false, multiple: false, readOnly: false, relevance: 'highlight', sectionId: 'sec-pctr-fase1-revisao-itens', spec: 'Contrato recebido difere da proposta enviada.' },
  { id: 'atlas-pctr-tipo-divergencia', label: 'Tipo divergência', type: 'textOptions', size: 'medium', required: false, multiple: true, readOnly: false, relevance: 'common', sectionId: 'sec-pctr-fase1-revisao-itens', options: ['Redução de escopo', 'Alteração de quantidade', 'Item removido', 'Item substituído', 'Erro do cliente', 'Adequação contratual', 'Outro'], spec: 'Classificação da divergência entre proposta e contrato.' },
  { id: 'atlas-pctr-justificativa-divergencia', label: 'Justificativa divergência', type: 'text', size: 'large', textLong: true, required: false, multiple: false, readOnly: false, relevance: 'common', sectionId: 'sec-pctr-fase1-revisao-itens', spec: 'Obrigatória quando houver divergência entre proposta e contrato recebido.' },
]

const METODOS_ASSINATURA = [
  {
    id: 'atlas-meth-enviar-assinatura',
    name: 'Enviar para assinatura',
    icon: 'send',
    kind: 'secundario',
  },
  {
    id: 'atlas-meth-solicitar-ajuste',
    name: 'Solicitar ajuste',
    icon: 'edit_note',
    kind: 'secundario',
  },
  {
    id: 'atlas-meth-reprovar',
    name: 'Reprovar',
    icon: 'cancel',
    kind: 'secundario',
  },
  {
    id: 'atlas-meth-aprovar-assinar',
    name: 'Aprovar e assinar',
    icon: 'verified',
    kind: 'destaque',
  },
]

function tramiteRow(p) {
  return {
    'atlas-tram-fase': p.fase ?? 'Contrato',
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

function itemCatalogoRow(p) {
  return {
    'atlas-item-tipo': p.tipo ?? 'Serviço',
    'atlas-item-descricao': p.descricao ?? '',
    'atlas-item-siag': p.siag ?? '',
    'atlas-item-protheus': p.protheus ?? '',
    'atlas-item-classe-cobranca': p.classe ?? 'Sob Demanda',
    'atlas-item-limite': p.limite ?? 0,
    'atlas-item-consumido': p.consumido ?? 0,
    'atlas-item-saldo': p.saldo ?? p.limite ?? 0,
    'atlas-item-status-consumo': p.statusConsumo ?? 'Dentro do limite',
    'atlas-item-unidade': p.unidade ?? 'HST',
  }
}

const TRAMITES_CONTRATO_PADRAO = [
  tramiteRow({ ordem: 1, setor: 'DIRC', cargo: 'Gerente', perfil: 'Gestor comercial', status: 'Assinado', dataConclusao: '2025-03-10' }),
  tramiteRow({ ordem: 2, setor: 'Jurídico', cargo: 'Analista', perfil: 'Revisor jurídico', status: 'Em análise', dataEnvio: '2025-03-11' }),
  tramiteRow({ ordem: 3, setor: 'DAFI', cargo: 'Coordenador', perfil: 'Aprovador financeiro', status: 'Pendente' }),
]

const ITENS_CONTRATO_212 = [
  itemCatalogoRow({
    tipo: 'Serviço',
    descricao: 'Treinamento técnico presencial — cloud',
    siag: 'SRV-001',
    protheus: 'P001',
    classe: 'Sob Demanda',
    limite: 500,
    consumido: 120,
    saldo: 380,
  }),
  itemCatalogoRow({
    tipo: 'Licença',
    descricao: 'MTI Workspace — assinatura mensal',
    siag: 'LIC-WS-01',
    protheus: 'L100',
    classe: 'Mensal',
    limite: 120000,
    consumido: 48000,
    saldo: 72000,
    statusConsumo: 'Dentro do limite',
  }),
  itemCatalogoRow({
    tipo: 'Produto',
    descricao: 'MTI DataSecurity — pacote anual',
    siag: 'PRD-DS',
    protheus: 'M200',
    classe: 'Anual',
    limite: 185000,
    consumido: 185000,
    saldo: 0,
    statusConsumo: 'Excedido',
  }),
]

const tramiteFields = [
  {
    id: 'atlas-tram-fase',
    label: 'Fase do processo',
    type: 'textOptions',
    size: 'medium',
    options: ETAPAS_RAER,
    relevance: 'common',
    spec: 'Fase em que o tramite ocorre.',
  },
  {
    id: 'atlas-tram-setor',
    label: 'Setor / gerência',
    type: 'text',
    size: 'medium',
    relevance: 'identity',
    spec: 'Setor responsável pela assinatura.',
  },
  {
    id: 'atlas-tram-cargo',
    label: 'Cargo',
    type: 'text',
    size: 'medium',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-tram-perfil',
    label: 'Perfil de assinatura',
    type: 'text',
    size: 'medium',
    relevance: 'common',
    spec: 'Perfil exigido no workflow (ex.: Gestor, Revisor jurídico).',
  },
  {
    id: 'atlas-tram-ordem',
    label: 'Ordem',
    type: 'number',
    size: 'small',
    relevance: 'advanced',
    spec: 'Sequência no fluxo de assinaturas.',
  },
  {
    id: 'atlas-tram-status',
    label: 'Status da assinatura',
    type: 'textOptions',
    size: 'medium',
    relevance: 'highlight',
    options: STATUS_TRAMITE,
    spec: 'Acompanhe envio, análise, ajuste, reprovação ou conclusão.',
  },
  {
    id: 'atlas-tram-responsavel',
    label: 'Responsável atual',
    type: 'text',
    size: 'medium',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-tram-data-envio',
    label: 'Data envio',
    type: 'date',
    size: 'small',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-tram-data-conclusao',
    label: 'Data conclusão',
    type: 'date',
    size: 'small',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-tram-motivo',
    label: 'Motivo (ajuste / reprovação)',
    type: 'text',
    size: 'large',
    textLong: true,
    relevance: 'advanced',
    spec: 'Obrigatório ao solicitar ajuste ou reprovar. Não exigido para aprovar e assinar.',
  },
]

const itemFields = [
  {
    id: 'atlas-item-tipo',
    label: 'Tipo no catálogo',
    type: 'textOptions',
    size: 'medium',
    options: TIPO_CATALOGO,
    relevance: 'identity',
    spec: 'Serviço (catálogo MTI), licença ou produto vigente.',
  },
  {
    id: 'atlas-item-descricao',
    label: 'Descrição',
    type: 'text',
    size: 'large',
    textLong: true,
    relevance: 'highlight',
    spec: 'Produto consultado no catálogo de serviços MTI, licenças ou produtos vigentes.',
  },
  {
    id: 'atlas-item-siag',
    label: 'Código Siag',
    type: 'text',
    size: 'medium',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-item-protheus',
    label: 'Código Protheus',
    type: 'text',
    size: 'medium',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-item-classe-cobranca',
    label: 'Classe de cobrança',
    type: 'textOptions',
    size: 'medium',
    options: CLASSE_COBRANCA_ITEM,
    relevance: 'highlight',
    spec:
      'Sob Demanda: pago no mês subsequente ao consumo. Mensal: cobrança todo mês. Anual: a cada 12 meses. Pro-Rata: meses restantes no ano; cobrança integral na parcela de janeiro.',
  },
  {
    id: 'atlas-item-unidade',
    label: 'Unidade / métrica',
    type: 'text',
    size: 'small',
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-item-limite',
    label: 'Limite contratado (R$)',
    type: 'decimal',
    size: 'medium',
    currency: true,
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-item-consumido',
    label: 'Consumido (R$)',
    type: 'decimal',
    size: 'medium',
    currency: true,
    relevance: 'common',
    spec: '',
  },
  {
    id: 'atlas-item-saldo',
    label: 'Saldo disponível (R$)',
    type: 'decimal',
    size: 'medium',
    currency: true,
    relevance: 'highlight',
    spec: '',
  },
  {
    id: 'atlas-item-status-consumo',
    label: 'Status de consumo (item)',
    type: 'textOptions',
    size: 'medium',
    options: STATUS_CONSUMO,
    relevance: 'highlight',
    spec: 'Situação do item em relação ao limite contratado.',
  },
]

function faseFormBase({ id, name, prefix, extraFields = [], preset }) {
  return {
    id,
    name,
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: METODOS_ASSINATURA,
    sections: [
      { id: `sec-${prefix}-dados`, title: 'Dados da fase', icon: 'description' },
      { id: `sec-${prefix}-ass`, title: 'Assinaturas', icon: 'draw' },
    ],
    fields: [
      ...extraFields.map((f) => ({ ...f, sectionId: `sec-${prefix}-dados` })),
      {
        id: EMB_TRAMITES,
        label: 'Tramites de assinatura',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_TRAMITE_ASSINATURA,
        relevance: 'highlight',
        sectionId: `sec-${prefix}-ass`,
        spec:
          'Acompanhe setor, cargo e perfil. Ações: enviar para assinatura, solicitar ajuste (motivo), reprovar (motivo), aprovar e assinar.',
      },
    ],
    exampleValuePresets: preset ? [preset] : [],
    activeExamplePresetId: preset?.id,
  }
}

export const contratoForms = [
  {
    id: FORM_TRAMITE_ASSINATURA,
    name: 'Tramite — assinatura',
    sectionLayout: 'none',
    sections: [tramiteFase1Section],
    fields: [...tramiteFields, ...tramiteFase1Fields],
    exampleValuePresets: [
      {
        id: 'atlas-tram-p01',
        name: 'Tramite — pendente',
        iconColor: '#94a3b8',
        fieldValues: tramiteRow({ setor: 'DAFI', cargo: 'Coordenador', perfil: 'Aprovador', status: 'Pendente' }),
      },
      {
        id: 'atlas-tram-p02',
        name: 'Tramite — reprovado com motivo',
        iconColor: '#dc2626',
        fieldValues: tramiteRow({
          setor: 'Jurídico',
          status: 'Reprovado',
          motivo: 'Cláusula de SLA incompatível com edital.',
          dataEnvio: '2025-04-01',
        }),
      },
    ],
    activeExamplePresetId: 'atlas-tram-p01',
  },
  {
    id: FORM_CONTRATO_ITEM,
    name: 'Contrato — item do catálogo',
    sectionLayout: 'none',
    sections: contratoItemFase1Sections,
    fields: [...itemFields, ...contratoItemFase1Fields],
    exampleValuePresets: [
      {
        id: 'atlas-item-p01',
        name: 'Item — serviço sob demanda',
        iconColor: '#0ea5e9',
        fieldValues: {
          ...itemCatalogoRow({
            tipo: 'Serviço',
            descricao: 'Hospedagem VM — execução',
            siag: 'SRV-VM-01',
            protheus: 'H001',
            classe: 'Sob Demanda',
            limite: 25000,
            consumido: 8200,
          }),
          'atlas-cti-proposta-item': 'Item Fase 1 — licença snapshot',
          'atlas-cti-alterado-contrato': 'false',
          'atlas-cti-codigo-siag': 'SRV-VM-01',
          'atlas-cti-codigo-protheus': 'H001',
          'atlas-cti-versao-catalogo': '2026.05',
          'atlas-cti-valor-unitario': 2083.33,
          'atlas-cti-quantidade': 12,
          'atlas-cti-valor-total': 25000,
        },
      },
    ],
    activeExamplePresetId: 'atlas-item-p01',
  },
  faseFormBase({
    id: FORM_DOCUMENTOS_FASE,
    name: 'Documentos do processo',
    prefix: 'doc',
    extraFields: [
      {
        id: 'atlas-doc-tipo',
        label: 'Tipo de documento',
        type: 'textOptions',
        size: 'medium',
        options: ['Minuta contratual', 'Anexo técnico', 'Planilha de preços', 'Parecer jurídico', 'Outros'],
        relevance: 'identity',
        spec: 'Segunda fase — após proposta aprovada.',
      },
      {
        id: 'atlas-doc-versao',
        label: 'Versão',
        type: 'text',
        size: 'small',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-doc-status-fase',
        label: 'Status da fase',
        type: 'textOptions',
        size: 'medium',
        options: STATUS_FASE,
        relevance: 'highlight',
        spec: '',
      },
    ],
    preset: {
      id: 'atlas-doc-preset-01',
      name: 'Documentos — revisão jurídica',
      iconColor: '#6366f1',
      fieldValues: {
        'atlas-doc-tipo': 'Minuta contratual',
        'atlas-doc-versao': 'v3',
        'atlas-doc-status-fase': 'Em tramitação',
      },
      embeddedRowsByFieldId: {
        [EMB_TRAMITES]: TRAMITES_CONTRATO_PADRAO.map((t) => ({ ...t, 'atlas-tram-fase': 'Documentos' })),
      },
    },
  }),
  {
    id: FORM_CONTRATO_GESTAO,
    name: 'Contrato — gestão e consumo',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: [
      ...METODOS_ASSINATURA,
      { id: 'atlas-meth-consultar-catalogo', name: 'Consultar catálogo MTI', icon: 'inventory_2', kind: 'secundario' },
      ...contratoGestaoFase1Methods,
    ],
    sections: [
      { id: 'sec-ctg-ident', title: 'Identificação', icon: 'badge' },
      { id: 'sec-ctg-vig', title: 'Vigência e renovação', icon: 'event' },
      { id: 'sec-ctg-saldos', title: 'Saldos e consumo', icon: 'account_balance_wallet' },
      { id: 'sec-ctg-itens', title: 'Itens do catálogo', icon: 'list_alt' },
      { id: 'sec-ctg-ass', title: 'Assinaturas', icon: 'draw' },
      { id: 'sec-ctg-os', title: 'Ordem de serviço', icon: 'assignment' },
      contratoGestaoFase1Section,
    ],
    fields: [
      {
        id: 'atlas-ctg-numero',
        label: 'Número do contrato',
        type: 'text',
        size: 'medium',
        relevance: 'identity',
        sectionId: 'sec-ctg-ident',
        spec: 'Identificador do contrato (ex.: 212/2024).',
      },
      {
        id: 'atlas-ctg-cliente',
        label: 'Cliente',
        type: 'text',
        size: 'large',
        relevance: 'common',
        sectionId: 'sec-ctg-ident',
        spec: '',
      },
      {
        id: 'atlas-ctg-proposta-origem',
        label: 'Proposta de origem',
        type: 'text',
        size: 'medium',
        relevance: 'common',
        sectionId: 'sec-ctg-ident',
        spec: 'Vínculo com a proposta que originou o contrato.',
      },
      {
        id: 'atlas-ctg-status-fase',
        label: 'Status da fase (contrato)',
        type: 'textOptions',
        size: 'medium',
        options: STATUS_FASE,
        relevance: 'highlight',
        sectionId: 'sec-ctg-ident',
        spec: '',
      },
      {
        id: 'atlas-ctg-vigencia-inicio',
        label: 'Início da vigência',
        type: 'date',
        size: 'small',
        sectionId: 'sec-ctg-vig',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-ctg-vigencia-fim',
        label: 'Fim da vigência',
        type: 'date',
        size: 'small',
        sectionId: 'sec-ctg-vig',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-ctg-vencimento',
        label: 'Próximo vencimento',
        type: 'date',
        size: 'small',
        sectionId: 'sec-ctg-vig',
        relevance: 'highlight',
        spec: 'Data de vencimento para renovação ou parcela.',
      },
      {
        id: 'atlas-ctg-status-renovacao',
        label: 'Status de renovação',
        type: 'textOptions',
        size: 'medium',
        options: STATUS_RENOVACAO,
        sectionId: 'sec-ctg-vig',
        relevance: 'highlight',
        spec: '',
      },
      {
        id: 'atlas-ctg-valor-global',
        label: 'Valor global contratado (R$)',
        type: 'decimal',
        size: 'medium',
        currency: true,
        sectionId: 'sec-ctg-saldos',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-ctg-consumido-global',
        label: 'Consumo global (R$)',
        type: 'decimal',
        size: 'medium',
        currency: true,
        sectionId: 'sec-ctg-saldos',
        relevance: 'common',
        spec: 'Soma do consumo de todos os itens do contrato.',
      },
      {
        id: 'atlas-ctg-saldo-global',
        label: 'Saldo global (R$)',
        type: 'decimal',
        size: 'medium',
        currency: true,
        sectionId: 'sec-ctg-saldos',
        relevance: 'highlight',
        spec: '',
      },
      {
        id: 'atlas-ctg-status-consumo-global',
        label: 'Status de consumo global',
        type: 'textOptions',
        size: 'medium',
        options: STATUS_CONSUMO,
        sectionId: 'sec-ctg-saldos',
        relevance: 'highlight',
        spec: 'Visão consolidada do contrato.',
      },
      {
        id: EMB_ITENS_CONTRATO,
        label: 'Itens vinculados ao catálogo',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_CONTRATO_ITEM,
        sectionId: 'sec-ctg-itens',
        relevance: 'highlight',
        spec:
          'Consulta produtos do catálogo de serviços MTI (Siag/Protheus), licenças e produtos vigentes. Cada item recebe classe de cobrança. Consumo por item alimenta pedido de venda único por contrato.',
      },
      {
        id: EMB_TRAMITES,
        label: 'Tramites de assinatura — contrato',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_TRAMITE_ASSINATURA,
        sectionId: 'sec-ctg-ass',
        relevance: 'highlight',
        spec: 'Ao aprovar e assinar o contrato, o número da ordem de serviço é gerado automaticamente na aba OS.',
      },
      {
        id: 'atlas-ctg-os-numero',
        label: 'Número da ordem de serviço',
        type: 'text',
        size: 'medium',
        readOnly: true,
        sectionId: 'sec-ctg-os',
        relevance: 'highlight',
        spec: 'Preenchido automaticamente quando o contrato é aprovado e assinado (ex.: OS-2026-8842).',
      },
      {
        id: 'atlas-ctg-os-status',
        label: 'Status da OS',
        type: 'textOptions',
        size: 'medium',
        options: ['Não gerada', 'Gerada — aguardando assinaturas', 'Assinada', 'Em execução', 'Encerrada'],
        sectionId: 'sec-ctg-os',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-ctg-catalogo-ref',
        label: 'Referência catálogos',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: true,
        sectionId: 'sec-ctg-itens',
        relevance: 'advanced',
        spec: `Consulta: ${FORM_CATALOGO_SERVICOS}, ${FORM_CATALOGO_LICENCAS}, ${FORM_CATALOGO_VIGENTES}.`,
      },
      ...contratoGestaoFase1Fields,
    ],
    exampleValuePresets: [
      {
        id: 'atlas-ctg-preset-212',
        name: 'Contrato 212/2024 — TJMT',
        iconColor: '#0c1ba8',
        fieldValues: {
          'atlas-ctg-numero': '212/2024',
          'atlas-ctg-cliente': 'TRIBUNAL DE JUSTIÇA - MT',
          'atlas-ctg-proposta-origem': 'PROP-2025-0842',
          'atlas-ctg-status-fase': 'Aguardando assinaturas',
          'atlas-ctg-vigencia-inicio': '2024-01-15',
          'atlas-ctg-vigencia-fim': '2026-01-14',
          'atlas-ctg-vencimento': '2026-01-14',
          'atlas-ctg-status-renovacao': 'Vigente',
          'atlas-ctg-valor-global': 353000,
          'atlas-ctg-consumido-global': 245200,
          'atlas-ctg-saldo-global': 107800,
          'atlas-ctg-status-consumo-global': 'Alerta (80%)',
          'atlas-ctg-os-numero': '',
          'atlas-ctg-os-status': 'Não gerada',
          'atlas-ctg-catalogo-ref': 'Catálogo serviços MTI + licenças + produtos vigentes',
        },
        embeddedRowsByFieldId: {
          [EMB_ITENS_CONTRATO]: ITENS_CONTRATO_212,
          [EMB_TRAMITES]: TRAMITES_CONTRATO_PADRAO,
        },
      },
      {
        id: 'atlas-ctg-preset-fase1-rascunho',
        name: 'Fase 1 — rascunho',
        iconColor: '#64748b',
        fieldValues: {
          'atlas-ctg-numero': 'SIMPLIFICA-2026/001',
          'atlas-ctg-cliente': 'Secretaria Cliente Demo',
          'atlas-ctg-proposta-origem': 'Proposta MTI Simplifica em assinatura',
          'atlas-ctg-status-fase': 'Em cadastro',
          'atlas-ctg-cliente-org': 'Secretaria Cliente Demo',
          'atlas-ctg-proposta-origem-ref': 'Proposta MTI Simplifica em assinatura',
          'atlas-ctg-processo-contratual': 'Processo contratual Simplifica 2026',
          'atlas-ctg-status-cadastro': 'Rascunho',
          'atlas-ctg-checklist-validado': 'false',
        },
        embeddedRowsByFieldId: {
          [EMB_ITENS_CONTRATO]: ITENS_CONTRATO_212.slice(0, 2),
          [EMB_TRAMITES]: [],
        },
      },
      {
        id: 'atlas-ctg-preset-fase1-cadastro',
        name: 'Fase 1 — finalizar cadastro',
        iconColor: '#059669',
        fieldValues: {
          'atlas-ctg-numero': 'SIMPLIFICA-2026/001',
          'atlas-ctg-cliente': 'Secretaria Cliente Demo',
          'atlas-ctg-proposta-origem': 'Proposta MTI Simplifica em assinatura',
          'atlas-ctg-status-fase': 'Em cadastro',
          'atlas-ctg-cliente-org': 'Secretaria Cliente Demo',
          'atlas-ctg-proposta-origem-ref': 'Proposta MTI Simplifica em assinatura',
          'atlas-ctg-processo-contratual': 'Processo contratual Simplifica 2026',
          'atlas-ctg-extrato-publicacao': [{ name: 'extrato-publicacao-contrato.pdf', kind: 'pdf' }],
          'atlas-ctg-data-publicacao': '2026-06-03',
          'atlas-ctg-status-cadastro': 'Em validação',
          'atlas-ctg-checklist-validado': 'true',
        },
        embeddedRowsByFieldId: {
          [EMB_ITENS_CONTRATO]: ITENS_CONTRATO_212.slice(0, 2),
          [EMB_TRAMITES]: [],
        },
      },
      {
        id: 'atlas-ctg-preset-aprovado',
        name: 'Contrato aprovado — OS gerada',
        iconColor: '#059669',
        fieldValues: {
          'atlas-ctg-numero': '118/2023',
          'atlas-ctg-cliente': 'TRIBUNAL DE JUSTIÇA - MT',
          'atlas-ctg-proposta-origem': 'PROP-2024-1200',
          'atlas-ctg-status-fase': 'Aprovado',
          'atlas-ctg-vigencia-inicio': '2023-06-01',
          'atlas-ctg-vigencia-fim': '2025-12-31',
          'atlas-ctg-vencimento': '2025-12-31',
          'atlas-ctg-status-renovacao': 'A renovar (90 dias)',
          'atlas-ctg-valor-global': 95000,
          'atlas-ctg-consumido-global': 15500,
          'atlas-ctg-saldo-global': 79500,
          'atlas-ctg-status-consumo-global': 'Dentro do limite',
          'atlas-ctg-os-numero': 'OS-2026-5012',
          'atlas-ctg-os-status': 'Gerada — aguardando assinaturas',
        },
        embeddedRowsByFieldId: {
          [EMB_ITENS_CONTRATO]: [itemCatalogoRow({ tipo: 'Produto', descricao: 'MTI Valida', siag: 'PRD-VAL', protheus: 'V100', classe: 'Mensal', limite: 95000, consumido: 15500 })],
          [EMB_TRAMITES]: TRAMITES_CONTRATO_PADRAO.map((t) => ({ ...t, 'atlas-tram-status': 'Assinado', 'atlas-tram-data-conclusao': '2025-01-10' })),
        },
      },
    ],
    activeExamplePresetId: 'atlas-ctg-preset-212',
    metadata:
      'Registro de contrato com saldos, vigência, renovação, consumo global e por item. Itens do catálogo com classe Sob Demanda / Mensal / Anual / Pro-Rata. PV agrupado por contrato na cobrança.',
  },
  faseFormBase({
    id: FORM_ORDEM_SERVICO,
    name: 'Ordem de serviço',
    prefix: 'os',
    extraFields: [
      {
        id: 'atlas-os-numero',
        label: 'Número da OS',
        type: 'text',
        size: 'medium',
        relevance: 'identity',
        spec: 'Carregado automaticamente do contrato aprovado; fase posterior ao contrato.',
      },
      {
        id: 'atlas-os-contrato',
        label: 'Contrato',
        type: 'text',
        size: 'medium',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-os-valor-previsto',
        label: 'Valor previsto (R$)',
        type: 'decimal',
        size: 'medium',
        currency: true,
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-os-status-fase',
        label: 'Status da fase',
        type: 'textOptions',
        size: 'medium',
        options: STATUS_FASE,
        relevance: 'highlight',
        spec: '',
      },
    ],
    preset: {
      id: 'atlas-os-preset-01',
      name: 'OS vinculada ao contrato 118/2023',
      iconColor: '#059669',
      fieldValues: {
        'atlas-os-numero': 'OS-2026-5012',
        'atlas-os-contrato': '118/2023',
        'atlas-os-valor-previsto': 95000,
        'atlas-os-status-fase': 'Aguardando assinaturas',
      },
      embeddedRowsByFieldId: {
        [EMB_TRAMITES]: [
          tramiteRow({ fase: 'Ordem de serviço', setor: 'DIRC', perfil: 'Gestor', status: 'Pendente' }),
          tramiteRow({ fase: 'Ordem de serviço', setor: 'Cliente', perfil: 'Fiscal do contrato', status: 'Pendente', ordem: 2 }),
        ],
      },
    },
  }),
  faseFormBase({
    id: FORM_TERMO_HOMOLOGACAO,
    name: 'Termo de homologação',
    prefix: 'th',
    extraFields: [
      {
        id: 'atlas-th-numero',
        label: 'Termo',
        type: 'text',
        size: 'medium',
        relevance: 'identity',
        spec: '',
      },
      {
        id: 'atlas-th-os',
        label: 'Ordem de serviço',
        type: 'text',
        size: 'medium',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-th-data-homologacao',
        label: 'Data prevista homologação',
        type: 'date',
        size: 'small',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-th-status-fase',
        label: 'Status da fase',
        type: 'textOptions',
        size: 'medium',
        options: STATUS_FASE,
        relevance: 'highlight',
        spec: '',
      },
    ],
    preset: {
      id: 'atlas-th-preset-01',
      name: 'Termo — rascunho',
      iconColor: '#d97706',
      fieldValues: {
        'atlas-th-numero': 'TH-2026-0091',
        'atlas-th-os': 'OS-2026-5012',
        'atlas-th-status-fase': 'Rascunho',
      },
      embeddedRowsByFieldId: { [EMB_TRAMITES]: [] },
    },
  }),
  faseFormBase({
    id: FORM_RAER,
    name: 'RAER — registro final',
    prefix: 'raer',
    extraFields: [
      {
        id: 'atlas-raer-numero',
        label: 'RAER',
        type: 'text',
        size: 'medium',
        relevance: 'identity',
        spec: 'Última fase do fluxo documental.',
      },
      {
        id: 'atlas-raer-contrato',
        label: 'Contrato',
        type: 'text',
        size: 'medium',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-raer-data-conclusao',
        label: 'Data conclusão prevista',
        type: 'date',
        size: 'small',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-raer-status-fase',
        label: 'Status da fase',
        type: 'textOptions',
        size: 'medium',
        options: STATUS_FASE,
        relevance: 'highlight',
        spec: '',
      },
    ],
    preset: {
      id: 'atlas-raer-preset-01',
      name: 'RAER — não iniciado',
      iconColor: '#6366f1',
      fieldValues: {
        'atlas-raer-numero': 'RAER-2026-0003',
        'atlas-raer-contrato': '118/2023',
        'atlas-raer-status-fase': 'Rascunho',
      },
      embeddedRowsByFieldId: { [EMB_TRAMITES]: [] },
    },
  }),
  {
    id: FORM_PROCESSO_CONTRATUAL,
    name: 'Processo contratual — painel RAER',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: METODOS_ASSINATURA,
    sections: [
      { id: 'sec-prc-visao', title: 'Visão geral', icon: 'dashboard' },
      { id: 'sec-prc-fases', title: 'Fases do processo', icon: 'timeline' },
      { id: 'sec-prc-ass-global', title: 'Assinaturas (todas as fases)', icon: 'draw' },
      processoContratualFase1Section,
      processoContratualRevisaoItensSection,
    ],
    fields: [
      {
        id: 'atlas-prc-codigo',
        label: 'Código do processo',
        type: 'text',
        size: 'medium',
        relevance: 'identity',
        sectionId: 'sec-prc-visao',
        spec: 'Identificador único do fluxo Proposta → RAER.',
      },
      {
        id: 'atlas-prc-etapa-atual',
        label: 'Etapa atual',
        type: 'textOptions',
        size: 'medium',
        options: ETAPAS_RAER,
        relevance: 'highlight',
        sectionId: 'sec-prc-visao',
        spec: '',
      },
      {
        id: 'atlas-prc-cliente',
        label: 'Cliente',
        type: 'text',
        size: 'large',
        sectionId: 'sec-prc-visao',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-prc-contrato-numero',
        label: 'Contrato',
        type: 'text',
        size: 'medium',
        sectionId: 'sec-prc-visao',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-prc-resumo-assinaturas',
        label: 'Resumo assinaturas',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: true,
        sectionId: 'sec-prc-visao',
        relevance: 'common',
        spec: 'Consolidado: pendentes, em análise, reprovados, concluídos.',
      },
      {
        id: 'atlas-prc-proposta-ref',
        label: 'Proposta',
        type: 'reference',
        size: 'medium',
        linkedFormId: FORM_PROPOSTA,
        sectionId: 'sec-prc-fases',
        relevance: 'common',
        spec: 'Fase 1.',
      },
      {
        id: 'atlas-prc-documentos-ref',
        label: 'Documentos',
        type: 'reference',
        size: 'medium',
        linkedFormId: FORM_DOCUMENTOS_FASE,
        sectionId: 'sec-prc-fases',
        relevance: 'common',
        spec: 'Fase 2.',
      },
      {
        id: 'atlas-prc-contrato-ref',
        label: 'Contrato',
        type: 'reference',
        size: 'medium',
        linkedFormId: FORM_CONTRATO_GESTAO,
        sectionId: 'sec-prc-fases',
        relevance: 'highlight',
        spec: 'Fase 3 — ao aprovar, gera número da OS.',
      },
      {
        id: 'atlas-prc-os-ref',
        label: 'Ordem de serviço',
        type: 'reference',
        size: 'medium',
        linkedFormId: FORM_ORDEM_SERVICO,
        sectionId: 'sec-prc-fases',
        relevance: 'common',
        spec: 'Fase 4.',
      },
      {
        id: 'atlas-prc-termo-ref',
        label: 'Termo de homologação',
        type: 'reference',
        size: 'medium',
        linkedFormId: FORM_TERMO_HOMOLOGACAO,
        sectionId: 'sec-prc-fases',
        relevance: 'common',
        spec: 'Fase 5.',
      },
      {
        id: 'atlas-prc-raer-ref',
        label: 'RAER',
        type: 'reference',
        size: 'medium',
        linkedFormId: FORM_RAER,
        sectionId: 'sec-prc-fases',
        relevance: 'common',
        spec: 'Fase 6.',
      },
      {
        id: EMB_TRAMITES,
        label: 'Tramites — todas as fases',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_TRAMITE_ASSINATURA,
        sectionId: 'sec-prc-ass-global',
        relevance: 'highlight',
        spec: 'Visão unificada do andamento de assinaturas por setor, cargo e perfil.',
      },
      ...processoContratualFase1Fields,
    ],
    exampleValuePresets: [
      {
        id: 'atlas-prc-preset-tjmt',
        name: 'Processo TJMT — etapa Contrato',
        iconColor: '#0c1ba8',
        fieldValues: {
          'atlas-prc-codigo': 'PRC-2025-TJMT-0842',
          'atlas-prc-etapa-atual': 'Contrato',
          'atlas-prc-cliente': 'TRIBUNAL DE JUSTIÇA - MT',
          'atlas-prc-contrato-numero': '212/2024',
          'atlas-prc-resumo-assinaturas': '2 assinados · 1 em análise · 1 pendente (fase Contrato)',
          'atlas-prc-proposta-ref': 'PROP-2025-0842',
          'atlas-prc-contrato-ref': '212/2024',
          'atlas-pctr-proposta-origem': 'Proposta MTI Simplifica em assinatura',
          'atlas-pctr-anexo-contrato-recebido': [{ name: 'contrato-recebido-cliente.pdf', kind: 'pdf' }],
          'atlas-pctr-data-retorno-contrato': '2026-06-01',
          'atlas-pctr-status-finalizacao': 'Revisão itens',
        },
        embeddedRowsByFieldId: {
          [EMB_TRAMITES]: [
            ...TRAMITES_CONTRATO_PADRAO,
            tramiteRow({ fase: 'Proposta', setor: 'DIRC', status: 'Assinado', dataConclusao: '2025-02-20' }),
          ],
        },
      },
    ],
    activeExamplePresetId: 'atlas-prc-preset-tjmt',
    metadata: 'Painel do fluxo RAER com referências a cada fase e tramites consolidados.',
  },
  {
    id: FORM_CONTROLE_ORFAOS,
    name: 'Controle — consumo sem contrato',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    fields: [
      {
        id: 'atlas-orf-descricao',
        label: 'Item / consumo',
        type: 'text',
        size: 'large',
        textLong: true,
        relevance: 'identity',
        spec: 'Itens consumidos sem vínculo a contrato — encaminhamento manual ao Protheus.',
      },
      {
        id: 'atlas-orf-siag',
        label: 'Código Siag',
        type: 'text',
        size: 'medium',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-orf-protheus',
        label: 'Código Protheus',
        type: 'text',
        size: 'medium',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-orf-competencia',
        label: 'Competência',
        type: 'text',
        size: 'small',
        relevance: 'common',
        spec: 'Ex.: 04/2025',
      },
      {
        id: 'atlas-orf-valor',
        label: 'Valor (R$)',
        type: 'decimal',
        size: 'medium',
        currency: true,
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-orf-status',
        label: 'Status',
        type: 'textOptions',
        size: 'medium',
        options: STATUS_ORFAO,
        relevance: 'highlight',
        spec: 'Quando vinculado a um contrato, o consumo passa a compor um único pedido de venda daquele contrato.',
      },
      {
        id: 'atlas-orf-motivo',
        label: 'Observação / motivo',
        type: 'text',
        size: 'large',
        textLong: true,
        relevance: 'advanced',
        spec: '',
      },
    ],
    exampleValuePresets: [
      {
        id: 'atlas-orf-p01',
        name: 'Consumo órfão — pendente',
        iconColor: '#f59e0b',
        fieldValues: {
          'atlas-orf-descricao': 'MTI Cloud — uso avulso sem contrato',
          'atlas-orf-siag': 'SRV-CLOUD-99',
          'atlas-orf-protheus': 'C999',
          'atlas-orf-competencia': '04/2025',
          'atlas-orf-valor': 4200,
          'atlas-orf-status': 'Pendente encaminhamento',
          'atlas-orf-motivo': 'Aguardando definição de contrato XX7',
        },
      },
    ],
    activeExamplePresetId: 'atlas-orf-p01',
    metadata:
      'Área de controle para itens sem relacionamento com contrato. Demais consumos do mesmo contrato geram um único pedido de venda Protheus.',
  },
]

export const contratoClassGroups = {
  extraGroups: [
    { id: 'grp-atlas-processo-raer', name: 'Processo contratual (RAER)' },
    { id: 'grp-atlas-contrato-gestao', name: 'Gestão de contratos' },
    { id: 'grp-atlas-controle-pv', name: 'Controle PV e órfãos' },
  ],
  assignments: {
    [FORM_TRAMITE_ASSINATURA]: 'grp-atlas-suporte-contrato',
    [FORM_CONTRATO_ITEM]: 'grp-atlas-suporte-contrato',
    [FORM_DOCUMENTOS_FASE]: 'grp-atlas-processo-raer',
    [FORM_ORDEM_SERVICO]: 'grp-atlas-processo-raer',
    [FORM_TERMO_HOMOLOGACAO]: 'grp-atlas-processo-raer',
    [FORM_RAER]: 'grp-atlas-processo-raer',
    [FORM_PROCESSO_CONTRATUAL]: 'grp-atlas-processo-raer',
    [FORM_CONTRATO_GESTAO]: 'grp-atlas-contrato-gestao',
    [FORM_CONTROLE_ORFAOS]: 'grp-atlas-controle-pv',
  },
  memberOrder: {
    'grp-atlas-processo-raer': [
      FORM_PROCESSO_CONTRATUAL,
      FORM_DOCUMENTOS_FASE,
      FORM_ORDEM_SERVICO,
      FORM_TERMO_HOMOLOGACAO,
      FORM_RAER,
    ],
    'grp-atlas-contrato-gestao': [FORM_CONTRATO_GESTAO],
    'grp-atlas-controle-pv': [FORM_CONTROLE_ORFAOS],
    'grp-atlas-suporte-contrato': [FORM_CONTRATO_ITEM, FORM_TRAMITE_ASSINATURA],
  },
  workspaceClasses: [
    {
      id: 'cls-atlas-processo-raer',
      name: 'Processo contratual — painel',
      linkedFormId: FORM_PROCESSO_CONTRATUAL,
    },
    {
      id: 'cls-atlas-contrato-gestao',
      name: 'Contrato — gestão e consumo',
      linkedFormId: FORM_CONTRATO_GESTAO,
    },
    {
      id: 'cls-atlas-controle-orfaos',
      name: 'Controle — sem contrato',
      linkedFormId: FORM_CONTROLE_ORFAOS,
    },
    {
      id: 'cls-atlas-cobranca-legado',
      name: 'Cobrança — cliente e PV',
      linkedFormId: 'form-atlas-contrato',
    },
  ],
  /** grupo embutido — mesclado em build como grp-atlas-suporte */
  suporteGroupId: 'grp-atlas-suporte-contrato',
}
