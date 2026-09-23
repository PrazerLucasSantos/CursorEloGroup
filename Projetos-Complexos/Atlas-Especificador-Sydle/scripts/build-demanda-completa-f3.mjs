/**
 * Demanda · Completa F3 — duplica a classe Demanda e cria classes satélite
 * para o rito ponta a ponta conforme docs/demanda-o-que-foi-dito-e-regras.md.
 *
 * Novas classes:
 *  - Demanda · Completa (F3 fontes)
 *  - Orçamento da Demanda (+ Item)
 *  - OS da Demanda (+ Evento dilatação)
 *  - Termo de Homologação
 *  - RAER da Demanda (capa; reusa embeds RAER existentes)
 *  - Definir pagamento (sem contrato)
 *
 * Uso: node scripts/build-demanda-completa-f3.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')

const SRC_DEM = 'form-patlasv4-proto-demanda'
const NEW_DEM = 'form-patlasv4-proto-demanda-completa'

function field(p) {
  return {
    size: 'medium',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'common',
    ...p,
  }
}

function deepClone(v) {
  return JSON.parse(JSON.stringify(v))
}

/** Remapeia strings de IDs da Demanda original → Completa. */
function remapStr(s) {
  if (typeof s !== 'string') return s
  return s
    .replaceAll('form-patlasv4-proto-metodo-demanda-', 'form-patlasv4-proto-metodo-demc-')
    .replaceAll('method-demanda-', 'method-demc-')
    .replaceAll('patlasv4proto-demanda-', 'patlasv4proto-demc-')
    .replaceAll('patlasv4proto-p-demanda-', 'patlasv4proto-p-demc-')
    .replaceAll('preset-dem-mti-', 'preset-demc-mti-')
    .replaceAll('sec-demanda-', 'sec-demc-')
    .replaceAll('rule-dem-', 'rule-demc-')
    .replaceAll(SRC_DEM, NEW_DEM)
}

function remapDeep(node) {
  if (Array.isArray(node)) return node.map(remapDeep)
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) out[k] = remapDeep(v)
    return out
  }
  if (typeof node === 'string') return remapStr(node)
  return node
}

function upsert(forms, form) {
  const i = forms.findIndex((f) => f.id === form.id)
  if (i >= 0) forms[i] = form
  else forms.push(form)
}

function buildOrcItem() {
  return {
    id: 'form-patlasv4-proto-demc-orc-item',
    name: 'Item do orçamento (Demanda)',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'Linha do orçamento de consumo (R11). Catálogo na versão do contrato (R19).',
    fields: [
      field({
        id: 'patlasv4proto-demc-orcitem-desc',
        label: 'Descrição / produto',
        type: 'text',
        size: 'large',
        required: true,
        relevance: 'identity',
      }),
      field({
        id: 'patlasv4proto-demc-orcitem-qtd',
        label: 'Quantidade',
        type: 'number',
        size: 'small',
        required: true,
        relevance: 'highlight',
        spec: 'Volume livre (ex. licença) sujeito a devolução se divergir.',
      }),
      field({
        id: 'patlasv4proto-demc-orcitem-vu',
        label: 'Valor unitário',
        type: 'number',
        size: 'small',
        required: true,
      }),
      field({
        id: 'patlasv4proto-demc-orcitem-cat-versao',
        label: 'Versão do catálogo',
        type: 'text',
        size: 'small',
        required: true,
        relevance: 'highlight',
        spec: 'R19 — versão com a qual o contrato nasceu.',
      }),
      field({
        id: 'patlasv4proto-demc-orcitem-unid',
        label: 'Unidade',
        type: 'text',
        size: 'small',
      }),
    ],
    methods: [],
    exampleValuePresets: [],
    fieldVisibilityRules: [],
  }
}

function buildOrcamento() {
  return {
    id: 'form-patlasv4-proto-demc-orcamento',
    name: 'Orçamento da Demanda',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'R11–R12. Orçamento de consumo: itens → assinaturas cliente + gerente área → OS. Sem contrato: definir pagamento (stub). Proposta automática no portal = fora (R20).',
    sections: [
      { id: 'sec-demc-orc-ident', title: 'Identificação', icon: 'badge' },
      { id: 'sec-demc-orc-itens', title: 'Itens', icon: 'list' },
      { id: 'sec-demc-orc-assinaturas', title: 'Assinaturas', icon: 'draw' },
      { id: 'sec-demc-orc-pagamento', title: 'Sem contrato', icon: 'payments' },
    ],
    fields: [
      field({
        id: 'patlasv4proto-demc-orc-numero',
        label: 'Número',
        type: 'text',
        size: 'small',
        required: true,
        readOnly: true,
        relevance: 'identity',
        sectionId: 'sec-demc-orc-ident',
      }),
      field({
        id: 'patlasv4proto-demc-orc-status',
        label: 'Status',
        type: 'textOptions',
        size: 'medium',
        required: true,
        relevance: 'highlight',
        sectionId: 'sec-demc-orc-ident',
        options: ['Em elaboração', 'Proposta enviada', 'Aceito', 'Recusado'],
      }),
      field({
        id: 'patlasv4proto-demc-orc-demanda',
        label: 'Demanda',
        type: 'reference',
        size: 'medium',
        required: true,
        relevance: 'highlight',
        sectionId: 'sec-demc-orc-ident',
        linkedFormId: NEW_DEM,
        options: ['DEM-2026-0505', 'DEM-2026-0055'],
      }),
      field({
        id: 'patlasv4proto-demc-orc-contrato',
        label: 'Contrato',
        type: 'text',
        size: 'medium',
        sectionId: 'sec-demc-orc-ident',
      }),
      field({
        id: 'patlasv4proto-demc-orc-natureza',
        label: 'Natureza do contrato',
        type: 'textOptions',
        size: 'medium',
        sectionId: 'sec-demc-orc-ident',
        options: ['Próprio do cliente', 'Patrocinado (gestão)', 'Sem contrato'],
      }),
      field({
        id: 'patlasv4proto-demc-orc-validade',
        label: 'Validade',
        type: 'date',
        size: 'small',
        sectionId: 'sec-demc-orc-ident',
      }),
      field({
        id: 'patlasv4proto-demc-orc-valor-total',
        label: 'Valor total',
        type: 'number',
        size: 'small',
        readOnly: true,
        relevance: 'highlight',
        sectionId: 'sec-demc-orc-ident',
      }),
      field({
        id: 'patlasv4proto-demc-orc-obs',
        label: 'Observações',
        type: 'text',
        size: 'large',
        textLong: true,
        sectionId: 'sec-demc-orc-ident',
      }),
      field({
        id: 'patlasv4proto-demc-orc-itens',
        label: 'Itens do orçamento',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        sectionId: 'sec-demc-orc-itens',
        linkedFormId: 'form-patlasv4-proto-demc-orc-item',
        embeddedDisplay: 'table',
        spec: 'Parametrização pelo orçamento reduz erro de quantidade (R11).',
      }),
      field({
        id: 'patlasv4proto-demc-orc-assina-cliente',
        label: 'Assinatura · cliente',
        type: 'boolean',
        sectionId: 'sec-demc-orc-assinaturas',
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-demc-orc-assina-gerente-area',
        label: 'Assinatura · gerente de área',
        type: 'boolean',
        sectionId: 'sec-demc-orc-assinaturas',
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-demc-orc-assina-em',
        label: 'Assinaturas em',
        type: 'date',
        size: 'small',
        sectionId: 'sec-demc-orc-assinaturas',
      }),
      field({
        id: 'patlasv4proto-demc-orc-definir-pag',
        label: 'Definir pagamento',
        type: 'textOptions',
        size: 'medium',
        sectionId: 'sec-demc-orc-pagamento',
        options: ['Indenização', 'Nova contratação', 'Desistiu', 'Ainda não definido'],
        spec: 'R12 — só quando sem contrato. CRM/tarefas = futuro.',
      }),
      field({
        id: 'patlasv4proto-demc-orc-alerta-fora',
        label: 'Fora de escopo',
        type: 'alert',
        size: 'large',
        readOnly: true,
        sectionId: 'sec-demc-orc-pagamento',
        alertVariant: 'warning',
        alertTitle: 'Proposta no portal',
        alertMessage: 'Pedir proposta comercial automática no portal = fora desta fase (R20).',
      }),
    ],
    methods: [],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-demc-orc-aceito',
        name: 'Orçamento aceito · pronto para OS',
        iconColor: '#15803D',
        fieldValues: {
          'patlasv4proto-demc-orc-numero': 'ORC-2026-0505',
          'patlasv4proto-demc-orc-status': 'Aceito',
          'patlasv4proto-demc-orc-demanda': 'DEM-2026-0505',
          'patlasv4proto-demc-orc-contrato': '001/2026/FIPLAN',
          'patlasv4proto-demc-orc-natureza': 'Próprio do cliente',
          'patlasv4proto-demc-orc-valor-total': 42000,
          'patlasv4proto-demc-orc-assina-cliente': true,
          'patlasv4proto-demc-orc-assina-gerente-area': true,
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-demc-orc-aceito',
    fieldVisibilityRules: [],
  }
}

function buildDilatacao() {
  return {
    id: 'form-patlasv4-proto-demc-dilatacao',
    name: 'Evento · Dilatação de prazo',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'R15 — dilatação = evento autorizado por CRI + parceiro + cliente.',
    fields: [
      field({
        id: 'patlasv4proto-demc-dil-motivo',
        label: 'Motivo',
        type: 'text',
        size: 'large',
        required: true,
        relevance: 'identity',
        textLong: true,
      }),
      field({
        id: 'patlasv4proto-demc-dil-nova-data',
        label: 'Novo prazo',
        type: 'date',
        size: 'small',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-demc-dil-cri',
        label: 'Autorizado CRI',
        type: 'boolean',
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-demc-dil-parceiro',
        label: 'Autorizado parceiro',
        type: 'boolean',
      }),
      field({
        id: 'patlasv4proto-demc-dil-cliente',
        label: 'Autorizado cliente',
        type: 'boolean',
      }),
      field({
        id: 'patlasv4proto-demc-dil-em',
        label: 'Registrado em',
        type: 'date',
        size: 'small',
      }),
    ],
    methods: [],
    exampleValuePresets: [],
    fieldVisibilityRules: [],
  }
}

function buildOs() {
  return {
    id: 'form-patlasv4-proto-demc-os',
    name: 'OS da Demanda',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'R15. Vida, saldo e consumo da OS. Vigência OS ≤ contrato. Sem OS não remove obrigação de pagamento no consumo. Complementar/substituição possíveis.',
    sections: [
      { id: 'sec-demc-os-ident', title: 'Identificação', icon: 'badge' },
      { id: 'sec-demc-os-saldo', title: 'Saldo e consumo', icon: 'account_balance' },
      { id: 'sec-demc-os-assinatura', title: 'Assinatura / execução', icon: 'draw' },
      { id: 'sec-demc-os-eventos', title: 'Eventos', icon: 'event' },
    ],
    fields: [
      field({
        id: 'patlasv4proto-demc-os-numero',
        label: 'Número da OS',
        type: 'text',
        size: 'small',
        required: true,
        readOnly: true,
        relevance: 'identity',
        sectionId: 'sec-demc-os-ident',
      }),
      field({
        id: 'patlasv4proto-demc-os-status',
        label: 'Status',
        type: 'textOptions',
        size: 'medium',
        required: true,
        relevance: 'highlight',
        sectionId: 'sec-demc-os-ident',
        options: [
          'Em elaboração',
          'Aguardando assinatura gerente operação',
          'Autorizada · em execução',
          'Complementar',
          'Substituição',
          'Encerrada',
          'Cancelada',
        ],
      }),
      field({
        id: 'patlasv4proto-demc-os-tipo',
        label: 'Tipo de vínculo',
        type: 'textOptions',
        size: 'medium',
        sectionId: 'sec-demc-os-ident',
        options: [
          'Criar nova OS',
          'Vincular OS existente',
          'Autorizar consumo em OS existente',
          'OS complementar',
          'OS de substituição',
        ],
      }),
      field({
        id: 'patlasv4proto-demc-os-demanda',
        label: 'Demanda',
        type: 'reference',
        size: 'medium',
        required: true,
        sectionId: 'sec-demc-os-ident',
        linkedFormId: NEW_DEM,
        options: ['DEM-2026-0505', 'DEM-2026-0303'],
      }),
      field({
        id: 'patlasv4proto-demc-os-orcamento',
        label: 'Orçamento',
        type: 'reference',
        size: 'medium',
        sectionId: 'sec-demc-os-ident',
        linkedFormId: 'form-patlasv4-proto-demc-orcamento',
        options: ['ORC-2026-0505'],
      }),
      field({
        id: 'patlasv4proto-demc-os-contrato',
        label: 'Contrato',
        type: 'text',
        size: 'medium',
        sectionId: 'sec-demc-os-ident',
      }),
      field({
        id: 'patlasv4proto-demc-os-cat-versao',
        label: 'Versão do catálogo (contrato)',
        type: 'text',
        size: 'small',
        relevance: 'highlight',
        sectionId: 'sec-demc-os-ident',
        spec: 'R19',
      }),
      field({
        id: 'patlasv4proto-demc-os-vig-ini',
        label: 'Vigência · início',
        type: 'date',
        size: 'small',
        sectionId: 'sec-demc-os-ident',
      }),
      field({
        id: 'patlasv4proto-demc-os-vig-fim',
        label: 'Vigência · fim',
        type: 'date',
        size: 'small',
        sectionId: 'sec-demc-os-ident',
        spec: 'Vigência OS ≤ vigência do contrato.',
      }),
      field({
        id: 'patlasv4proto-demc-os-saldo',
        label: 'Saldo da OS',
        type: 'number',
        size: 'small',
        relevance: 'highlight',
        sectionId: 'sec-demc-os-saldo',
      }),
      field({
        id: 'patlasv4proto-demc-os-consumo',
        label: 'Consumo',
        type: 'number',
        size: 'small',
        relevance: 'highlight',
        sectionId: 'sec-demc-os-saldo',
      }),
      field({
        id: 'patlasv4proto-demc-os-provisionado',
        label: 'Provisionado',
        type: 'number',
        size: 'small',
        sectionId: 'sec-demc-os-saldo',
      }),
      field({
        id: 'patlasv4proto-demc-os-alerta-pag',
        label: 'Regra de pagamento',
        type: 'alert',
        size: 'large',
        readOnly: true,
        sectionId: 'sec-demc-os-saldo',
        alertVariant: 'info',
        alertTitle: 'Sem OS ≠ sem obrigação',
        alertMessage:
          'Ausência de OS não remove obrigação de pagamento em caso de consumo (R15).',
      }),
      field({
        id: 'patlasv4proto-demc-os-assina-gerente-op',
        label: 'Assinatura · gerente de operação',
        type: 'boolean',
        relevance: 'highlight',
        sectionId: 'sec-demc-os-assinatura',
        spec: 'R11 — após orçamento aceito.',
      }),
      field({
        id: 'patlasv4proto-demc-os-execucao-autorizada',
        label: 'Execução autorizada no Atlas',
        type: 'boolean',
        sectionId: 'sec-demc-os-assinatura',
        spec: 'R17 — depois autorizar → ServiceNow «aprovada e em atendimento».',
      }),
      field({
        id: 'patlasv4proto-demc-os-sn-status',
        label: 'ServiceNow',
        type: 'textOptions',
        size: 'medium',
        sectionId: 'sec-demc-os-assinatura',
        options: [
          'Não enviado',
          'Aguardando autorização de execução',
          'Enviado · aprovada e em atendimento',
          'Erro de integração',
        ],
      }),
      field({
        id: 'patlasv4proto-demc-os-dilatacoes',
        label: 'Dilatações de prazo',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        sectionId: 'sec-demc-os-eventos',
        linkedFormId: 'form-patlasv4-proto-demc-dilatacao',
        embeddedDisplay: 'table',
      }),
      field({
        id: 'patlasv4proto-demc-os-hist-versao',
        label: 'Histórico / versão',
        type: 'text',
        size: 'large',
        textLong: true,
        sectionId: 'sec-demc-os-eventos',
        spec: 'Complementar/substituição atestada; eventos de ajuste de valor.',
      }),
    ],
    methods: [],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-demc-os-exec',
        name: 'OS autorizada · em execução',
        iconColor: '#0F766E',
        fieldValues: {
          'patlasv4proto-demc-os-numero': 'OS-DIG-DEM-2026-0503',
          'patlasv4proto-demc-os-status': 'Autorizada · em execução',
          'patlasv4proto-demc-os-tipo': 'Criar nova OS',
          'patlasv4proto-demc-os-demanda': 'DEM-2026-0503',
          'patlasv4proto-demc-os-assina-gerente-op': true,
          'patlasv4proto-demc-os-execucao-autorizada': true,
          'patlasv4proto-demc-os-sn-status': 'Enviado · aprovada e em atendimento',
          'patlasv4proto-demc-os-saldo': 2447,
          'patlasv4proto-demc-os-consumo': 2200,
          'patlasv4proto-demc-os-cat-versao': 'v4.0',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-demc-os-exec',
    fieldVisibilityRules: [],
  }
}

function buildTermo() {
  return {
    id: 'form-patlasv4-proto-demc-termo',
    name: 'Termo de Homologação',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'R18. Encerrar → avisar cliente → Termo + RAER. Assinam gestor/fiscal/solicitante. Ajuste: cliente ou MTI. Detalhe Hire = próxima agenda (campos de processo já aqui).',
    sections: [
      { id: 'sec-demc-termo-ident', title: 'Identificação', icon: 'badge' },
      { id: 'sec-demc-termo-conteudo', title: 'Conteúdo', icon: 'description' },
      { id: 'sec-demc-termo-assinaturas', title: 'Assinaturas', icon: 'draw' },
      { id: 'sec-demc-termo-ajuste', title: 'Ajuste', icon: 'edit_note' },
    ],
    fields: [
      field({
        id: 'patlasv4proto-demc-termo-numero',
        label: 'Número do termo',
        type: 'text',
        size: 'small',
        required: true,
        readOnly: true,
        relevance: 'identity',
        sectionId: 'sec-demc-termo-ident',
      }),
      field({
        id: 'patlasv4proto-demc-termo-status',
        label: 'Status',
        type: 'textOptions',
        size: 'medium',
        required: true,
        relevance: 'highlight',
        sectionId: 'sec-demc-termo-ident',
        options: [
          'Em elaboração',
          'Aguardando assinatura',
          'Ajuste solicitado',
          'Assinado',
          'Recusado',
        ],
      }),
      field({
        id: 'patlasv4proto-demc-termo-demanda',
        label: 'Demanda',
        type: 'reference',
        size: 'medium',
        required: true,
        sectionId: 'sec-demc-termo-ident',
        linkedFormId: NEW_DEM,
        options: ['DEM-2026-0504'],
      }),
      field({
        id: 'patlasv4proto-demc-termo-os',
        label: 'OS',
        type: 'reference',
        size: 'medium',
        sectionId: 'sec-demc-termo-ident',
        linkedFormId: 'form-patlasv4-proto-demc-os',
        options: ['OS-2026-088'],
      }),
      field({
        id: 'patlasv4proto-demc-termo-raer',
        label: 'RAER vinculado',
        type: 'reference',
        size: 'medium',
        sectionId: 'sec-demc-termo-ident',
        linkedFormId: 'form-patlasv4-proto-demc-raer',
        options: ['RAER-2026-0504'],
      }),
      field({
        id: 'patlasv4proto-demc-termo-itens-os',
        label: 'Itens / parâmetros da OS',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
        sectionId: 'sec-demc-termo-conteudo',
      }),
      field({
        id: 'patlasv4proto-demc-termo-artefatos',
        label: 'Artefatos (modelagem, requisitos, protótipos…)',
        type: 'text',
        size: 'large',
        textLong: true,
        sectionId: 'sec-demc-termo-conteudo',
      }),
      field({
        id: 'patlasv4proto-demc-termo-atestado',
        label: 'O que foi executado / atestado',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
        sectionId: 'sec-demc-termo-conteudo',
      }),
      field({
        id: 'patlasv4proto-demc-termo-evolucao',
        label: 'Evolução do projeto (quando couber)',
        type: 'text',
        size: 'large',
        textLong: true,
        sectionId: 'sec-demc-termo-conteudo',
      }),
      field({
        id: 'patlasv4proto-demc-termo-consumo',
        label: 'Consumo real vs estimado',
        type: 'text',
        size: 'medium',
        sectionId: 'sec-demc-termo-conteudo',
        spec: 'Ex.: 2200 de 2447. Estimativa pode mudar antes de finalizar (histórico).',
      }),
      field({
        id: 'patlasv4proto-demc-termo-anexos',
        label: 'Comprovações / anexos',
        type: 'file',
        size: 'large',
        multiple: true,
        sectionId: 'sec-demc-termo-conteudo',
      }),
      field({
        id: 'patlasv4proto-demc-termo-assina-gestor',
        label: 'Assinatura · gestor',
        type: 'boolean',
        relevance: 'highlight',
        sectionId: 'sec-demc-termo-assinaturas',
      }),
      field({
        id: 'patlasv4proto-demc-termo-assina-fiscal',
        label: 'Assinatura · fiscal',
        type: 'boolean',
        relevance: 'highlight',
        sectionId: 'sec-demc-termo-assinaturas',
      }),
      field({
        id: 'patlasv4proto-demc-termo-assina-solicitante',
        label: 'Assinatura · solicitante',
        type: 'boolean',
        relevance: 'highlight',
        sectionId: 'sec-demc-termo-assinaturas',
      }),
      field({
        id: 'patlasv4proto-demc-termo-assina-em',
        label: 'Assinado em',
        type: 'date',
        size: 'small',
        sectionId: 'sec-demc-termo-assinaturas',
      }),
      field({
        id: 'patlasv4proto-demc-termo-ajuste',
        label: 'Ajuste solicitado',
        type: 'boolean',
        sectionId: 'sec-demc-termo-ajuste',
      }),
      field({
        id: 'patlasv4proto-demc-termo-ajuste-por',
        label: 'Ajuste solicitado por',
        type: 'textOptions',
        size: 'medium',
        sectionId: 'sec-demc-termo-ajuste',
        options: ['Cliente', 'MTI'],
      }),
      field({
        id: 'patlasv4proto-demc-termo-ajuste-motivo',
        label: 'Motivo do ajuste',
        type: 'text',
        size: 'large',
        textLong: true,
        sectionId: 'sec-demc-termo-ajuste',
      }),
      field({
        id: 'patlasv4proto-demc-termo-hire-nota',
        label: 'Hire / detalhe fino',
        type: 'alert',
        size: 'large',
        readOnly: true,
        sectionId: 'sec-demc-termo-ajuste',
        alertVariant: 'warning',
        alertTitle: 'Próxima agenda',
        alertMessage: 'Detalhamento Hire/homologação campo a campo = próxima sessão (R20).',
      }),
    ],
    methods: [],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-demc-termo-aguardando',
        name: 'Termo aguardando assinatura',
        iconColor: '#B45309',
        fieldValues: {
          'patlasv4proto-demc-termo-numero': 'TH-2026-0504',
          'patlasv4proto-demc-termo-status': 'Aguardando assinatura',
          'patlasv4proto-demc-termo-demanda': 'DEM-2026-0504',
          'patlasv4proto-demc-termo-os': 'OS-2026-088',
          'patlasv4proto-demc-termo-consumo': '2200 de 2447',
          'patlasv4proto-demc-termo-itens-os': 'Itens OS atestados',
          'patlasv4proto-demc-termo-atestado': 'Consumo executado conforme OS',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-demc-termo-aguardando',
    fieldVisibilityRules: [
      {
        id: 'rule-demc-termo-ajuste',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-demc-termo-ajuste',
        sourceKind: 'boolean',
        expectedBoolean: true,
        action: 'show',
        targetFieldIds: [
          'patlasv4proto-demc-termo-ajuste-por',
          'patlasv4proto-demc-termo-ajuste-motivo',
        ],
      },
    ],
  }
}

function buildRaer() {
  return {
    id: 'form-patlasv4-proto-demc-raer',
    name: 'RAER da Demanda',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'R18 — Relatório de Acompanhamento e Entrega de Resultados, vinculado ao Termo. Indicadores/entregas/planos reutilizam classes RAER do épico. Detalhe Hire = próxima agenda.',
    sections: [
      { id: 'sec-demc-raer-ident', title: 'Identificação', icon: 'badge' },
      { id: 'sec-demc-raer-resultados', title: 'Resultados', icon: 'assessment' },
    ],
    fields: [
      field({
        id: 'patlasv4proto-demc-raer-numero',
        label: 'Número RAER',
        type: 'text',
        size: 'small',
        required: true,
        readOnly: true,
        relevance: 'identity',
        sectionId: 'sec-demc-raer-ident',
      }),
      field({
        id: 'patlasv4proto-demc-raer-status',
        label: 'Status',
        type: 'textOptions',
        size: 'medium',
        required: true,
        relevance: 'highlight',
        sectionId: 'sec-demc-raer-ident',
        options: ['Não iniciado', 'Em elaboração', 'Vinculado ao termo', 'Concluído'],
      }),
      field({
        id: 'patlasv4proto-demc-raer-demanda',
        label: 'Demanda',
        type: 'reference',
        size: 'medium',
        required: true,
        sectionId: 'sec-demc-raer-ident',
        linkedFormId: NEW_DEM,
        options: ['DEM-2026-0504'],
      }),
      field({
        id: 'patlasv4proto-demc-raer-termo',
        label: 'Termo de homologação',
        type: 'reference',
        size: 'medium',
        sectionId: 'sec-demc-raer-ident',
        linkedFormId: 'form-patlasv4-proto-demc-termo',
        options: ['TH-2026-0504'],
      }),
      field({
        id: 'patlasv4proto-demc-raer-periodo',
        label: 'Período de referência',
        type: 'text',
        size: 'medium',
        sectionId: 'sec-demc-raer-ident',
      }),
      field({
        id: 'patlasv4proto-demc-raer-obs',
        label: 'Observações',
        type: 'text',
        size: 'large',
        textLong: true,
        sectionId: 'sec-demc-raer-ident',
      }),
      field({
        id: 'patlasv4proto-demc-raer-indicadores',
        label: 'Indicadores',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        sectionId: 'sec-demc-raer-resultados',
        linkedFormId: 'form-patlasv4-proto-raer-indicador',
        embeddedDisplay: 'table',
      }),
      field({
        id: 'patlasv4proto-demc-raer-entregas',
        label: 'Entregas realizadas',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        sectionId: 'sec-demc-raer-resultados',
        linkedFormId: 'form-patlasv4-proto-raer-entrega',
        embeddedDisplay: 'table',
      }),
      field({
        id: 'patlasv4proto-demc-raer-planos',
        label: 'Planos de ação',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        sectionId: 'sec-demc-raer-resultados',
        linkedFormId: 'form-patlasv4-proto-raer-plano-acao',
        embeddedDisplay: 'table',
      }),
    ],
    methods: [],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-demc-raer-vinc',
        name: 'RAER vinculado ao termo',
        iconColor: '#1D5FA8',
        fieldValues: {
          'patlasv4proto-demc-raer-numero': 'RAER-2026-0504',
          'patlasv4proto-demc-raer-status': 'Vinculado ao termo',
          'patlasv4proto-demc-raer-demanda': 'DEM-2026-0504',
          'patlasv4proto-demc-raer-termo': 'TH-2026-0504',
          'patlasv4proto-demc-raer-periodo': '2026-08 / 2026-09',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-demc-raer-vinc',
    fieldVisibilityRules: [],
  }
}

function enhanceDemandaCompleta(dem) {
  dem.name = 'Demanda · Completa (F3 fontes)'
  dem.metadata =
    'Cópia completa da Demanda F3 + vínculos às classes Orçamento, OS, Termo e RAER. Fontes: Discovery 09/09 + 11/09 · R1–R20. Sem IA. MTI = Projeto Atlas (sem portal).'

  // Nova seção de vínculos
  if (!dem.sections.some((s) => s.id === 'sec-demc-vinculos')) {
    dem.sections.push({
      id: 'sec-demc-vinculos',
      title: 'Vínculos (Orçamento · OS · Termo · RAER)',
      icon: 'account_tree',
    })
  }

  const extra = [
    field({
      id: 'patlasv4proto-demc-cat-versao',
      label: 'Versão do catálogo (contrato)',
      type: 'text',
      size: 'small',
      relevance: 'highlight',
      sectionId: 'sec-demc-necessidade',
      spec: 'R19 — contrato nasce na versão do catálogo daquele momento.',
    }),
    field({
      id: 'patlasv4proto-demc-vinculos-alerta',
      label: 'Modelo completo',
      type: 'alert',
      size: 'large',
      readOnly: true,
      sectionId: 'sec-demc-vinculos',
      alertVariant: 'info',
      alertTitle: 'Rito ponta a ponta',
      alertMessage:
        'Abertura → MTI → (Parceiro | Via contrato | Orçamento) → OS → Autorizar SN → Encerrar → Termo + RAER. Classes satélite abaixo.',
    }),
    field({
      id: 'patlasv4proto-demc-ref-orcamentos',
      label: 'Orçamentos',
      type: 'embeddedReference',
      size: 'large',
      multiple: true,
      sectionId: 'sec-demc-vinculos',
      linkedFormId: 'form-patlasv4-proto-demc-orcamento',
      embeddedDisplay: 'table',
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demc-ref-oses',
      label: 'Ordens de serviço',
      type: 'embeddedReference',
      size: 'large',
      multiple: true,
      sectionId: 'sec-demc-vinculos',
      linkedFormId: 'form-patlasv4-proto-demc-os',
      embeddedDisplay: 'table',
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demc-ref-termo',
      label: 'Termo de homologação',
      type: 'reference',
      size: 'medium',
      sectionId: 'sec-demc-vinculos',
      linkedFormId: 'form-patlasv4-proto-demc-termo',
      options: ['TH-2026-0504'],
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demc-ref-raer',
      label: 'RAER',
      type: 'reference',
      size: 'medium',
      sectionId: 'sec-demc-vinculos',
      linkedFormId: 'form-patlasv4-proto-demc-raer',
      options: ['RAER-2026-0504'],
      relevance: 'highlight',
    }),
  ]

  // Evitar duplicar se script rodar de novo
  for (const f of extra) {
    if (!dem.fields.some((x) => x.id === f.id)) dem.fields.push(f)
  }

  // Atualizar alerta stub OS/orçamento
  const stub = dem.fields.find((f) => f.id === 'patlasv4proto-demc-os-alerta')
  if (stub) {
    stub.alertTitle = 'OS / Orçamento — classes vinculadas'
    stub.alertMessage =
      'Use a aba Vínculos e as classes Orçamento da Demanda / OS da Demanda. Cadeia: orçamento (cliente + gerente área) → OS → gerente operação → autorizar execução → ServiceNow.'
    stub.alertVariant = 'info'
  }

  // Remover qualquer IA residual
  dem.fields = dem.fields.filter((f) => !/sugestao-ia|sugestão da ia/i.test(`${f.id} ${f.label}`))
  for (const f of dem.fields) {
    if (typeof f.spec === 'string') f.spec = f.spec.replace(/\s*IA sugere;?\s*MTI decide\.?/gi, '').trim()
    if (typeof f.alertMessage === 'string')
      f.alertMessage = f.alertMessage.replace(/\s*IA sugere;?\s*MTI decide\.?/gi, '').trim()
  }

  // Destacar poucos campos essenciais (+ vínculos)
  const keepHl = new Set([
    'patlasv4proto-demc-status',
    'patlasv4proto-demc-tipo',
    'patlasv4proto-demc-produto',
    'patlasv4proto-demc-sla-status',
    'patlasv4proto-demc-fila-regra',
    'patlasv4proto-demc-cat-versao',
    'patlasv4proto-demc-ref-orcamentos',
    'patlasv4proto-demc-ref-oses',
    'patlasv4proto-demc-ref-termo',
    'patlasv4proto-demc-ref-raer',
  ])
  for (const f of dem.fields) {
    if (f.relevance === 'identity') continue
    f.relevance = keepHl.has(f.id) ? 'highlight' : 'common'
  }

  // Métodos: mesmos 5 em destaque
  const keepDest = new Set([
    'method-demc-pre-analise',
    'method-demc-qualificar',
    'method-demc-iniciar-analise',
    'method-demc-via-contrato',
    'method-demc-validar-parceiro',
  ])
  for (const m of dem.methods || []) {
    m.kind = keepDest.has(m.id) ? 'destaque' : 'menu'
  }

  return dem
}

function main() {
  const formsPath = path.join(EPIC, 'forms.json')
  const cgPath = path.join(EPIC, 'class-groups.json')
  const wsPath = path.join(EPIC, 'workspaces.json')

  const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
  const src = forms.find((f) => f.id === SRC_DEM)
  if (!src) throw new Error('Demanda fonte não encontrada')

  // 1) Clonar Demanda + métodos referenciados
  const methodFormIds = new Set(
    (src.methods || []).map((m) => m.inputFormId).filter(Boolean),
  )
  // também autorizar legado se existir
  methodFormIds.add('form-patlasv4-proto-metodo-demanda-autorizar')

  const clonedDem = enhanceDemandaCompleta(remapDeep(deepClone(src)))
  clonedDem.id = NEW_DEM
  upsert(forms, clonedDem)

  for (const mid of methodFormIds) {
    const mf = forms.find((f) => f.id === mid)
    if (!mf) continue
    const cloned = remapDeep(deepClone(mf))
    // garantir id remapeado
    if (cloned.id === mid) {
      cloned.id = remapStr(mid)
    }
    cloned.name = String(cloned.name || '').replace(/^Demanda —/, 'Demanda Completa —')
    if (typeof cloned.metadata === 'string') {
      cloned.metadata = cloned.metadata
        .replace(/\s*IA sugere;?\s*MTI decide\.?/gi, '')
        .replace(/Sem IA nesta fase\.?/gi, '')
        .trim()
      if (!cloned.metadata.includes('Completa')) {
        cloned.metadata = `Método da Demanda · Completa. ${cloned.metadata}`
      }
    }
    // strip IA fields
    cloned.fields = (cloned.fields || []).filter(
      (f) => !/sugestao-ia|sugestão da ia/i.test(`${f.id} ${f.label}`),
    )
    upsert(forms, cloned)
  }

  // 2) Classes satélite
  for (const form of [
    buildOrcItem(),
    buildOrcamento(),
    buildDilatacao(),
    buildOs(),
    buildTermo(),
    buildRaer(),
  ]) {
    upsert(forms, form)
  }

  fs.writeFileSync(formsPath, JSON.stringify(forms, null, 2) + '\n')

  // 3) Class groups
  const cg = JSON.parse(fs.readFileSync(cgPath, 'utf8'))
  const groupsToAdd = [
    { id: 'grp-atlas-demanda-completa', name: '[Atlas] Demanda · Completa F3' },
    {
      id: 'grp-atlas-demanda-completa-emb',
      name: 'Embutidas',
      parentGroupId: 'grp-atlas-demanda-completa',
    },
    {
      id: 'grp-atlas-demanda-completa-met',
      name: 'Métodos',
      parentGroupId: 'grp-atlas-demanda-completa',
    },
  ]
  for (const g of groupsToAdd) {
    if (!cg.groups.some((x) => x.id === g.id)) cg.groups.push(g)
  }

  const mainForms = [
    NEW_DEM,
    'form-patlasv4-proto-demc-orcamento',
    'form-patlasv4-proto-demc-os',
    'form-patlasv4-proto-demc-termo',
    'form-patlasv4-proto-demc-raer',
  ]
  const embForms = [
    'form-patlasv4-proto-demc-orc-item',
    'form-patlasv4-proto-demc-dilatacao',
    'form-patlasv4-proto-raer-indicador',
    'form-patlasv4-proto-raer-entrega',
    'form-patlasv4-proto-raer-plano-acao',
  ]
  const metForms = (clonedDem.methods || [])
    .map((m) => m.inputFormId)
    .filter(Boolean)

  for (const id of mainForms) cg.assignments[id] = 'grp-atlas-demanda-completa'
  for (const id of embForms) cg.assignments[id] = 'grp-atlas-demanda-completa-emb'
  for (const id of metForms) cg.assignments[id] = 'grp-atlas-demanda-completa-met'

  cg.memberOrderByGroup['grp-atlas-demanda-completa'] = mainForms
  cg.memberOrderByGroup['grp-atlas-demanda-completa-emb'] = embForms
  cg.memberOrderByGroup['grp-atlas-demanda-completa-met'] = metForms

  // também manter no ungrouped order list if present
  const ungrouped = cg.memberOrderByGroup['__ungrouped__'] || cg.memberOrderByGroup['ungrouped']
  if (Array.isArray(cg.groups.find(() => true) && false)) {
    /* noop */
  }
  // append to any global order arrays that list demanda
  for (const [key, arr] of Object.entries(cg.memberOrderByGroup)) {
    if (!Array.isArray(arr)) continue
    if (arr.includes(SRC_DEM) && !arr.includes(NEW_DEM)) {
      const ix = arr.indexOf(SRC_DEM)
      arr.splice(ix + 1, 0, NEW_DEM)
      cg.memberOrderByGroup[key] = arr
    }
  }

  fs.writeFileSync(cgPath, JSON.stringify(cg, null, 2) + '\n')

  // 4) Workspace package
  const ws = JSON.parse(fs.readFileSync(wsPath, 'utf8'))
  for (const w of ws) {
    const pkgs = w.packages || w.classPackages || null
    // structure: packages array on workspace
    if (!Array.isArray(w.packages)) continue
    const existing = w.packages.find((p) => p.id === 'pkg-fase-3-demanda-completa')
    const pkg = {
      id: 'pkg-fase-3-demanda-completa',
      name: 'Fase 3 · Demanda Completa F3',
      classes: [
        {
          id: 'cls-mapa-demanda-completa',
          name: 'Demanda · Completa',
          linkedFormId: NEW_DEM,
          linkedFormExamplePresetIds: (clonedDem.exampleValuePresets || [])
            .slice(0, 8)
            .map((p) => p.id),
        },
        {
          id: 'cls-mapa-demc-orcamento',
          name: 'Orçamento',
          linkedFormId: 'form-patlasv4-proto-demc-orcamento',
          linkedFormExamplePresetIds: ['patlasv4proto-p-demc-orc-aceito'],
        },
        {
          id: 'cls-mapa-demc-os',
          name: 'OS',
          linkedFormId: 'form-patlasv4-proto-demc-os',
          linkedFormExamplePresetIds: ['patlasv4proto-p-demc-os-exec'],
        },
        {
          id: 'cls-mapa-demc-termo',
          name: 'Termo de Homologação',
          linkedFormId: 'form-patlasv4-proto-demc-termo',
          linkedFormExamplePresetIds: ['patlasv4proto-p-demc-termo-aguardando'],
        },
        {
          id: 'cls-mapa-demc-raer',
          name: 'RAER',
          linkedFormId: 'form-patlasv4-proto-demc-raer',
          linkedFormExamplePresetIds: ['patlasv4proto-p-demc-raer-vinc'],
        },
      ],
    }
    if (existing) {
      Object.assign(existing, pkg)
    } else {
      const after = w.packages.findIndex((p) => p.id === 'pkg-fase-3-demanda')
      if (after >= 0) w.packages.splice(after + 1, 0, pkg)
      else w.packages.push(pkg)
    }
  }
  fs.writeFileSync(wsPath, JSON.stringify(ws, null, 2) + '\n')

  console.log('OK')
  console.log('  Demanda Completa:', NEW_DEM)
  console.log('  Campos:', clonedDem.fields.length)
  console.log('  Métodos:', (clonedDem.methods || []).length)
  console.log('  Satélites: Orçamento, Item, OS, Dilatação, Termo, RAER')
  console.log('  Pacote workspace: pkg-fase-3-demanda-completa')
}

main()
