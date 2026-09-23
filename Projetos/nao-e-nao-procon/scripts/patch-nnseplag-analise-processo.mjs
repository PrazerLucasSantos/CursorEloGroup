/**
 * AnÃ¡lise e DecisÃ£o = classe Ãºnica de processo:
 * - demais formulÃ¡rios (SolicitaÃ§Ã£o, Ajustes, Recurso, Certificado) como referÃªncia
 * - campos/documentos e mÃ©todos condicionados ao Status
 *
 * node scripts/patch-nnseplag-analise-processo.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(
  __dirname,
  '../data/subprojects/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1',
)

const FORM_AD = 'form-nen-analise-decisao'
const FORM_AJ = 'form-nen-ajustes'
const FORM_REC = 'form-nen-recurso'
const FORM_SOL = 'form-nen-solicitacao'
const FORM_CERT = 'form-nen-estabelecimento-selo' // certificado absorvido nesta classe (17/09)

const STATUS = [
  'EM ANÃLISE',
  'EM DILIGÃŠNCIA',
  'PRONTO PARA DECISÃƒO',
  'DEFERIDO',
  'INDEFERIDO',
  'EM RECURSO',
]

const COLORS = {
  analise: '#b45309',
  diligencia: '#0369a1',
  pronto: '#7c3aed',
  deferido: '#15803d',
  indeferido: '#b91c1c',
  recurso: '#9d174d',
}

function showRule(id, status, targetFieldIds) {
  return {
    id,
    operator: 'eq',
    sourceFieldId: 'nen-ad-status',
    sourceKind: 'textOptions',
    expectedOptionText: status,
    action: 'show',
    targetFieldIds,
  }
}

function method(id, name, icon, kind, statuses, inputFormId) {
  const m = {
    id,
    name,
    icon,
    kind,
    visibleWhen: {
      sourceFieldId: 'nen-ad-status',
      expectedOptionTexts: statuses,
    },
  }
  if (inputFormId) m.inputFormId = inputFormId
  return m
}

function buildProcessForm() {
  const fieldsAnalise = [
    'nen-ad-item',
    'nen-ad-conclusao',
    'nen-ad-espec',
    'nen-ad-alerta',
    'nen-ad-docs-analise',
  ]
  const fieldsDiligencia = ['nen-ad-ref-diligencia', 'nen-ad-alerta-diligencia']
  const fieldsDecisao = ['nen-ad-parecer', 'nen-ad-req', 'nen-ad-legal', 'nen-ad-decisao', 'nen-ad-alerta-decisao']
  const fieldsDeferido = ['nen-ad-ref-certificado', 'nen-ad-alerta-deferido']
  const fieldsIndeferido = ['nen-ad-alerta-indeferido']
  const fieldsRecurso = ['nen-ad-ref-recurso', 'nen-ad-alerta-recurso']

  return {
    id: FORM_AD,
    name: 'AnÃ¡lise e DecisÃ£o',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Classe Ãºnica de processo. Status conduz a exibiÃ§Ã£o de campos, documentos, referÃªncias (SolicitaÃ§Ã£o, DiligÃªncia, Recurso, Certificado) e mÃ©todos. Ajustes e Recurso permanecem como formulÃ¡rios referenciados (nÃ£o sÃ£o classes separadas no workspace).',
    sections: [
      { id: 'sec-nen-ad-cab', title: 'Processo', icon: 'account_tree' },
      { id: 'sec-nen-ad-pedido', title: 'Pedido', icon: 'description' },
      { id: 'sec-nen-ad-analise', title: 'AnÃ¡lise', icon: 'fact_check' },
      { id: 'sec-nen-ad-diligencia', title: 'DiligÃªncia', icon: 'assignment_late' },
      { id: 'sec-nen-ad-decisao', title: 'DecisÃ£o', icon: 'gavel' },
      { id: 'sec-nen-ad-resultado', title: 'Resultado', icon: 'verified' },
      { id: 'sec-nen-ad-recurso', title: 'Recurso', icon: 'balance' },
    ],
    fields: [
      {
        id: 'nen-ad-prot',
        label: 'NÂº protocolo',
        type: 'text',
        size: 'medium',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'identity',
        sectionId: 'sec-nen-ad-cab',
        spec: '',
      },
      {
        id: 'nen-ad-status',
        label: 'Status',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nen-ad-cab',
        options: STATUS,
        spec: 'Conduz o fluxo: campos, documentos, referÃªncias e mÃ©todos mudam conforme o valor.',
      },
      {
        id: 'nen-ad-empresa',
        label: 'CNPJ / estabelecimento / municÃ­pio',
        type: 'text',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nen-ad-cab',
        spec: '',
      },
      {
        id: 'nen-ad-prazo',
        label: 'Data / prazo restante',
        type: 'text',
        size: 'medium',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-cab',
        spec: 'Prazo de anÃ¡lise atÃ© 30 dias (minuta do decreto).',
      },
      {
        id: 'nen-ad-alerta-fluxo',
        label: 'Fluxo',
        type: 'alert',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-cab',
        alertVariant: 'info',
        alertTitle: 'Processo guiado por status',
        alertMessage:
          'Altere o Status (ou troque o cenÃ¡rio de exemplo) para ver abas, documentos e mÃ©todos disponÃ­veis em cada etapa.',
        spec: '',
      },
      {
        id: 'nen-ad-ref-solicitacao',
        label: 'SolicitaÃ§Ã£o',
        type: 'reference',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-pedido',
        linkedFormId: FORM_SOL,
        spec: 'Pedido protocolado (fonte do processo). Sempre visÃ­vel.',
      },
      // â€”â€” AnÃ¡lise
      {
        id: 'nen-ad-item',
        label: 'Item do requisito (resumo)',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-analise',
        hidden: true,
        spec: 'Resposta + anexo + base legal',
      },
      {
        id: 'nen-ad-conclusao',
        label: 'ConclusÃ£o do item',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nen-ad-analise',
        hidden: true,
        options: ['Conforme', 'NÃ£o conforme', 'Necessita complementaÃ§Ã£o'],
        spec: '',
      },
      {
        id: 'nen-ad-espec',
        label: 'EspecificaÃ§Ã£o da complementaÃ§Ã£o',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-analise',
        hidden: true,
        spec: 'ObrigatÃ³rio se â€œNecessita complementaÃ§Ã£oâ€.',
      },
      {
        id: 'nen-ad-docs-analise',
        label: 'Documentos da anÃ¡lise',
        type: 'file',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: true,
        relevance: 'common',
        sectionId: 'sec-nen-ad-analise',
        hidden: true,
        spec: 'Pareceres, checklists e evidÃªncias anexadas pelo analista.',
      },
      {
        id: 'nen-ad-alerta',
        label: 'Regra',
        type: 'alert',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-analise',
        hidden: true,
        alertVariant: 'warning',
        alertTitle: 'NÃ£o deferir',
        alertMessage: 'Impedir deferimento se houver requisito obrigatÃ³rio â€œnÃ£o conformeâ€.',
        spec: '',
      },
      // â€”â€” DiligÃªncia
      {
        id: 'nen-ad-alerta-diligencia',
        label: 'DiligÃªncia',
        type: 'alert',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-diligencia',
        hidden: true,
        alertVariant: 'warning',
        alertTitle: 'Aguardando complementaÃ§Ã£o',
        alertMessage:
          'O estabelecimento responde no formulÃ¡rio de Ajustes (referÃªncia). Use â€œEnviar complementaÃ§Ã£oâ€ quando aplicÃ¡vel.',
        spec: '',
      },
      {
        id: 'nen-ad-ref-diligencia',
        label: 'FormulÃ¡rio de Ajustes (diligÃªncia)',
        type: 'reference',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-diligencia',
        hidden: true,
        linkedFormId: FORM_AJ,
        spec: 'VisÃ­vel apenas com status EM DILIGÃŠNCIA.',
      },
      // â€”â€” DecisÃ£o
      {
        id: 'nen-ad-parecer',
        label: 'Parecer / fundamentaÃ§Ã£o',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-decisao',
        hidden: true,
        spec: '',
      },
      {
        id: 'nen-ad-req',
        label: 'Requisitos nÃ£o preenchidos',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-decisao',
        hidden: true,
        spec: 'Se indeferir',
      },
      {
        id: 'nen-ad-legal',
        label: 'Fundamentos legais',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-decisao',
        hidden: true,
        spec: '',
      },
      {
        id: 'nen-ad-decisao',
        label: 'DecisÃ£o',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nen-ad-decisao',
        hidden: true,
        options: ['Deferir', 'Indeferir'],
        spec: '',
      },
      {
        id: 'nen-ad-alerta-decisao',
        label: 'AtenÃ§Ã£o',
        type: 'alert',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-decisao',
        hidden: true,
        alertVariant: 'info',
        alertTitle: 'Pronto para decisÃ£o',
        alertMessage: 'Use Deferir ou Indeferir. Deferimento emite o certificado; indeferimento abre prazo de recurso.',
        spec: '',
      },
      // â€”â€” Resultado
      {
        id: 'nen-ad-alerta-deferido',
        label: 'Deferido',
        type: 'alert',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-resultado',
        hidden: true,
        alertVariant: 'success',
        alertTitle: 'Selo deferido',
        alertMessage: 'Certificado gerado e vÃ¡lido por 24 meses (conforme regras do serviÃ§o).',
        spec: '',
      },
      {
        id: 'nen-ad-ref-certificado',
        label: 'Certificado do Selo',
        type: 'reference',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-resultado',
        hidden: true,
        linkedFormId: FORM_CERT,
        spec: 'VisÃ­vel com status DEFERIDO.',
      },
      {
        id: 'nen-ad-alerta-indeferido',
        label: 'Indeferido',
        type: 'alert',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-resultado',
        hidden: true,
        alertVariant: 'error',
        alertTitle: 'Pedido indeferido',
        alertMessage: 'O interessado pode apresentar recurso no prazo. Use o mÃ©todo â€œAbrir recursoâ€.',
        spec: '',
      },
      // â€”â€” Recurso
      {
        id: 'nen-ad-alerta-recurso',
        label: 'Recurso',
        type: 'alert',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-recurso',
        hidden: true,
        alertVariant: 'info',
        alertTitle: 'Recurso em anÃ¡lise',
        alertMessage: 'Julgue o recurso no formulÃ¡rio referenciado (Provido / Negado).',
        spec: '',
      },
      {
        id: 'nen-ad-ref-recurso',
        label: 'FormulÃ¡rio de Recurso',
        type: 'reference',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-recurso',
        hidden: true,
        linkedFormId: FORM_REC,
        spec: 'VisÃ­vel com status EM RECURSO (ou ao abrir recurso a partir de INDEFERIDO).',
      },
    ],
    methods: [
      method('nen-ad-salvar', 'Salvar', 'save', 'menu', ['EM ANÃLISE', 'EM DILIGÃŠNCIA', 'PRONTO PARA DECISÃƒO', 'EM RECURSO']),
      method('nen-ad-diligencia', 'Abrir diligÃªncia', 'assignment_late', 'destaque', ['EM ANÃLISE'], FORM_AJ),
      method('nen-ad-enviar-analise', 'Enviar para decisÃ£o', 'send', 'destaque', ['EM ANÃLISE']),
      method('nen-ad-retomar', 'Retomar anÃ¡lise', 'replay', 'destaque', ['EM DILIGÃŠNCIA']),
      method(
        'nen-ad-enviar-comp',
        'Enviar complementaÃ§Ã£o',
        'upload_file',
        'destaque',
        ['EM DILIGÃŠNCIA'],
        FORM_AJ,
      ),
      method('nen-ad-deferir', 'Deferir', 'check_circle', 'destaque', ['PRONTO PARA DECISÃƒO']),
      method('nen-ad-indeferir', 'Indeferir', 'cancel', 'menu', ['PRONTO PARA DECISÃƒO']),
      method('nen-ad-baixar-cert', 'Baixar certificado', 'download', 'destaque', ['DEFERIDO'], FORM_CERT),
      method('nen-ad-abrir-recurso', 'Abrir recurso', 'balance', 'destaque', ['INDEFERIDO'], FORM_REC),
      method('nen-ad-apresentar-rec', 'Apresentar recurso', 'edit_note', 'destaque', ['EM RECURSO'], FORM_REC),
      method('nen-ad-julgar-rec', 'Julgar recurso', 'gavel', 'destaque', ['EM RECURSO'], FORM_REC),
    ],
    fieldVisibilityRules: [
      showRule('rule-nen-ad-analise', 'EM ANÃLISE', fieldsAnalise),
      showRule('rule-nen-ad-diligencia', 'EM DILIGÃŠNCIA', fieldsDiligencia),
      showRule('rule-nen-ad-pronto', 'PRONTO PARA DECISÃƒO', [...fieldsAnalise, ...fieldsDecisao]),
      showRule('rule-nen-ad-deferido', 'DEFERIDO', fieldsDeferido),
      showRule('rule-nen-ad-indeferido', 'INDEFERIDO', fieldsIndeferido),
      showRule('rule-nen-ad-recurso', 'EM RECURSO', fieldsRecurso),
    ],
    exampleValuePresets: [
      {
        id: 'nen-ad-p1',
        name: 'Em anÃ¡lise',
        iconColor: COLORS.analise,
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00042',
          'nen-ad-status': 'EM ANÃLISE',
          'nen-ad-empresa': '12.345.678/0001-90 â€” Aurora Night â€” CuiabÃ¡',
          'nen-ad-prazo': '18 dias restantes',
          'nen-ad-item': 'SinalizaÃ§Ã£o A3 â€” foto do banheiro feminino incompleta',
          'nen-ad-conclusao': 'Necessita complementaÃ§Ã£o',
          'nen-ad-espec': 'Enviar foto nÃ­tida do cartaz A3 no banheiro feminino',
          'nen-ad-ref-solicitacao': '2026/SELO-00042 â€” Aurora Night',
        },
      },
      {
        id: 'nen-ad-p2',
        name: 'Em diligÃªncia',
        iconColor: COLORS.diligencia,
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00042',
          'nen-ad-status': 'EM DILIGÃŠNCIA',
          'nen-ad-empresa': '12.345.678/0001-90 â€” Aurora Night â€” CuiabÃ¡',
          'nen-ad-prazo': '5 dias para complementar',
          'nen-ad-ref-solicitacao': '2026/SELO-00042 â€” Aurora Night',
          'nen-ad-ref-diligencia': 'PendÃªncia foto A3',
        },
      },
      {
        id: 'nen-ad-p3',
        name: 'Pronto para decisÃ£o',
        iconColor: COLORS.pronto,
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00042',
          'nen-ad-status': 'PRONTO PARA DECISÃƒO',
          'nen-ad-empresa': '12.345.678/0001-90 â€” Aurora Night â€” CuiabÃ¡',
          'nen-ad-prazo': 'ConcluÃ­do',
          'nen-ad-item': 'Todos os requisitos analisados',
          'nen-ad-conclusao': 'Conforme',
          'nen-ad-parecer': 'Requisitos atendidos conforme protocolo e evidÃªncias.',
          'nen-ad-ref-solicitacao': '2026/SELO-00042 â€” Aurora Night',
        },
      },
      {
        id: 'nen-ad-p4',
        name: 'Deferido',
        iconColor: COLORS.deferido,
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00042',
          'nen-ad-status': 'DEFERIDO',
          'nen-ad-empresa': '12.345.678/0001-90 â€” Aurora Night â€” CuiabÃ¡',
          'nen-ad-prazo': 'ConcluÃ­do',
          'nen-ad-decisao': 'Deferir',
          'nen-ad-parecer': 'Deferido.',
          'nen-ad-ref-solicitacao': '2026/SELO-00042 â€” Aurora Night',
          'nen-ad-ref-certificado': 'Certificado 2026/SELO-00042',
        },
      },
      {
        id: 'nen-ad-p5',
        name: 'Indeferido',
        iconColor: COLORS.indeferido,
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00055',
          'nen-ad-status': 'INDEFERIDO',
          'nen-ad-empresa': '98.765.432/0001-10 â€” Bar Pantanal â€” VÃ¡rzea Grande',
          'nen-ad-prazo': 'ConcluÃ­do',
          'nen-ad-decisao': 'Indeferir',
          'nen-ad-parecer': 'Percentual de capacitados abaixo do mÃ­nimo.',
          'nen-ad-req': 'Qtd. capacitados / percentual',
          'nen-ad-legal': 'Minuta do decreto / Protocolo NÃ£o Ã© NÃ£o',
          'nen-ad-ref-solicitacao': '2026/SELO-00055 â€” Bar Pantanal',
        },
      },
      {
        id: 'nen-ad-p6',
        name: 'Em recurso',
        iconColor: COLORS.recurso,
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00055',
          'nen-ad-status': 'EM RECURSO',
          'nen-ad-empresa': '98.765.432/0001-10 â€” Bar Pantanal â€” VÃ¡rzea Grande',
          'nen-ad-prazo': 'Em julgamento',
          'nen-ad-ref-solicitacao': '2026/SELO-00055 â€” Bar Pantanal',
          'nen-ad-ref-recurso': 'Recurso â€” capacitaÃ§Ã£o',
        },
      },
    ],
    activeExamplePresetId: 'nen-ad-p1',
  }
}

function rewriteWorkspace(ws) {
  return ws.map((w) => {
    const packages = (w.packages || []).map((pkg) => {
      if (pkg.id !== 'pkg-nen-analise' && !/an[aÃ¡]lise/i.test(pkg.name || '')) return pkg
      return {
        ...pkg,
        name: 'AnÃ¡lise e decisÃ£o',
        classes: [
          {
            id: 'cls-nen-analise-decisao',
            name: 'AnÃ¡lise e DecisÃ£o',
            linkedFormId: FORM_AD,
            linkedFormExamplePresetIds: [
              'nen-ad-p1',
              'nen-ad-p2',
              'nen-ad-p3',
              'nen-ad-p4',
              'nen-ad-p5',
              'nen-ad-p6',
            ],
          },
        ],
      }
    })
    return { ...w, packages }
  })
}

function rewriteClassGroups(forms) {
  const groups = [
    { id: 'grp-nen-entrada', name: 'Entrada e solicitaÃ§Ã£o' },
    { id: 'grp-nen-procon', name: 'AnÃ¡lise PROCON' },
    { id: 'grp-nen-pos', name: 'Selo e pÃ³s-concessÃ£o' },
  ]
  const map = {
    'form-nen-acesso': 'grp-nen-entrada',
    [FORM_SOL]: 'grp-nen-entrada',
    'form-nen-capacitado': 'grp-nen-entrada',
    [FORM_AD]: 'grp-nen-procon',
    [FORM_AJ]: 'grp-nen-procon',
    [FORM_REC]: 'grp-nen-procon',
    [FORM_CERT]: 'grp-nen-pos',
    'form-nen-estabelecimento-selo': 'grp-nen-pos',
    'form-nen-renovacao': 'grp-nen-pos',
    'form-nen-cancelamento': 'grp-nen-pos',
    'form-nen-revogacao': 'grp-nen-pos',
  }
  for (const f of forms) {
    if (f.id.startsWith('form-nen-pessoa-')) map[f.id] = 'grp-nen-entrada'
  }
  const assignments = {}
  const memberOrderByGroup = { 'grp-nen-entrada': [], 'grp-nen-procon': [], 'grp-nen-pos': [] }
  for (const f of forms) {
    const g = map[f.id]
    if (!g) continue
    assignments[f.id] = g
    memberOrderByGroup[g].push(f.id)
  }
  return { groups, assignments, memberOrderByGroup }
}

function rewriteFlows(flows) {
  return flows.map((flow) => ({
    ...flow,
    steps: (flow.steps || []).map((step) => {
      if (
        step.linkedFormId === FORM_AJ ||
        step.linkedFormId === FORM_REC ||
        step.linkedFormId === 'form-nen-analise' ||
        step.linkedFormId === 'form-nen-decisao' ||
        /ajustes|dilig|recurso|an[aÃ¡]lise|decis/i.test(step.id || '')
      ) {
        return {
          ...step,
          linkedFormId: FORM_AD,
          bpmnDescription:
            (step.bpmnDescription || '') +
            ' (classe Ãºnica AnÃ¡lise e DecisÃ£o â€” UI conforme Status).',
        }
      }
      return step
    }),
  }))
}

const formsPath = path.join(epicDir, 'forms.json')
const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
const processForm = buildProcessForm()
const nextForms = forms.map((f) => (f.id === FORM_AD ? processForm : f))
if (!nextForms.some((f) => f.id === FORM_AD)) nextForms.push(processForm)

// garantir que ajustes/recurso existem como refs (nÃ£o remover)
for (const id of [FORM_AJ, FORM_REC]) {
  if (!nextForms.some((f) => f.id === id)) {
    console.warn('missing referenced form', id)
  }
}

fs.writeFileSync(formsPath, JSON.stringify(nextForms, null, 2) + '\n')

const wsPath = path.join(epicDir, 'workspaces.json')
fs.writeFileSync(wsPath, JSON.stringify(rewriteWorkspace(JSON.parse(fs.readFileSync(wsPath, 'utf8'))), null, 2) + '\n')

fs.writeFileSync(
  path.join(epicDir, 'class-groups.json'),
  JSON.stringify(rewriteClassGroups(nextForms), null, 2) + '\n',
)

const flowsPath = path.join(epicDir, 'flows.json')
fs.writeFileSync(
  flowsPath,
  JSON.stringify(rewriteFlows(JSON.parse(fs.readFileSync(flowsPath, 'utf8'))), null, 2) + '\n',
)

console.log('OK processo', processForm.name)
console.log(
  'tabs',
  processForm.sections.map((s) => s.title).join(' / '),
)
console.log('methods', processForm.methods.map((m) => m.name + 'â†’' + m.visibleWhen.expectedOptionTexts.join('|')).join('; '))
console.log('rules', processForm.fieldVisibilityRules.length)
console.log('presets', processForm.exampleValuePresets.map((p) => p.name).join(', '))

