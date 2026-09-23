/**
 * Copia/atualiza Demanda MTI (Discovery 09/09) para Atlas Protótipo
 * (épico com Produto, Parceria, Modelo de Venda, Catálogo…).
 *
 * Uso: node scripts/sync-demanda-mti-to-prototipo.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const v2FlowPath = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-v2/flows.json',
)

const WS = 'ws-atlas-prototipo-organizado'
const PKG = 'pkg-fase-3-demanda'
const CLS = 'cls-mapa-demanda'

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}
function writeJson(p, data) {
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}
function upsert(forms, form) {
  const i = forms.findIndex((f) => f.id === form.id)
  if (i >= 0) forms[i] = form
  else forms.push(form)
}

function buildPreAnaliseForm() {
  return {
    id: 'form-patlasv4-proto-metodo-demanda-pre-analise',
    name: 'Demanda — Pré-análise MTI',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Discovery 09/09. Exclusivo MTI no Projeto Atlas. Aprovar segue; devolver/recusar só MTI.',
    fields: [
      {
        id: 'patlasv4proto-mdem-pre-alerta',
        label: 'Aviso',
        type: 'alert',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'highlight',
        alertVariant: 'info',
        alertTitle: 'Pré-análise MTI',
        alertMessage:
          'Somente analista MTI no back-office Projeto Atlas. Parceiro ainda não age neste passo.',
      },
      {
        id: 'patlasv4proto-mdem-pre-decisao',
        label: 'Decisão',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        options: ['Aprovar', 'Devolver para correção', 'Recusar'],
      },
      {
        id: 'patlasv4proto-mdem-pre-motivo',
        label: 'Motivo (devolver/recusar)',
        type: 'text',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        textLong: true,
      },
      {
        id: 'patlasv4proto-mdem-pre-assinatura',
        label: 'Confirmar assinatura digital MTI',
        type: 'boolean',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
      },
    ],
    methods: [],
    exampleValuePresets: [],
    fieldVisibilityRules: [
      {
        id: 'rule-mdem-pre-motivo',
        operator: 'neq',
        sourceFieldId: 'patlasv4proto-mdem-pre-decisao',
        sourceKind: 'textOptions',
        expectedOptionText: 'Aprovar',
        action: 'show',
        targetFieldIds: ['patlasv4proto-mdem-pre-motivo'],
      },
    ],
  }
}

function patchDemandaClass(form) {
  form.metadata =
    'Classe Demanda no back-office Projeto Atlas (MTI). Discovery 09/09: pós-contrato; pré-análise MTI; qualificação (solução/catálogo/parceiro(s); IA sugere, MTI decide); parecer via contrato | orçamento | devolver | recusar. Recusar/devolver: somente MTI. Parceiro complementa após notificação — sem recusar/devolver. Épico: Atlas Protótipo.'

  const status = form.fields?.find((f) => f.id === 'patlasv4proto-demanda-status')
  if (status) {
    status.options = [
      'Aguardando gestor',
      'Aguardando pré-análise MTI',
      'Aguardando análise',
      'Em análise',
      'Devolvida para correção',
      'Aguardando autorização',
      'Em orçamento',
      'Recusada',
      'Não autorizada',
      'Aprovada · em atendimento',
    ]
    status.spec =
      'Rito 09/09: hierarquia cliente (opcional) → pré-análise MTI → qualificação/roteamento → análise → parecer → autorização/orçamento.'
  }

  if (!form.fields.some((f) => f.id === 'patlasv4proto-demanda-tipo')) {
    const idx = form.fields.findIndex((f) => f.id === 'patlasv4proto-demanda-origem')
    form.fields.splice(idx >= 0 ? idx + 1 : 2, 0, {
      id: 'patlasv4proto-demanda-tipo',
      label: 'Tipo',
      type: 'textOptions',
      size: 'small',
      readOnly: true,
      required: true,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-demanda-identificacao',
      options: ['Consumo', 'Suporte'],
      spec: '09/09: consumo=verde, suporte=azul no portal → header do registro.',
    })
  }

  const produto = form.fields?.find((f) => f.id === 'patlasv4proto-demanda-produto')
  if (produto) {
    produto.label = 'Solução'
    produto.spec =
      '09/09: seleção solução-first no portal; contrato/KPIs derivados. Preferir referência à classe Solução do Protótipo.'
    if (!produto.linkedFormId) {
      const sol = null // keep text unless Solução form exists as reference target
      void sol
    }
  }

  // Prefer linking to Solução / Parceria when useful — leave as text if already text
  const solFormExists = true
  if (produto && solFormExists && produto.type === 'text') {
    // keep text for compatibility with presets; label already Solução
  }

  const roteamento = form.fields?.find((f) => f.id === 'patlasv4proto-demanda-roteamento')
  if (roteamento) {
    roteamento.spec =
      'Auto: contrato/solução claros com parceria → notifica parceiro(s). Ambíguo → MTI qualifica (solução, catálogo, parceiro(s) individual/coletivo). IA sugere; MTI decide.'
  }

  const parceiroNome = form.fields?.find((f) => f.id === 'patlasv4proto-demanda-parceiro-nome')
  if (parceiroNome) {
    parceiroNome.label = 'Parceiro(s)'
    parceiroNome.spec = 'Um ou mais. Individual ou coletivo (09/09). Vazio = só MTI.'
  }

  if (!form.fields.some((f) => f.id === 'patlasv4proto-demanda-sugestao-ia')) {
    form.fields.push({
      id: 'patlasv4proto-demanda-sugestao-ia',
      label: 'Sugestão da IA',
      type: 'text',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-demanda-parceiro',
      textLong: true,
      spec: 'IA sugere; decisão final sempre da MTI.',
    })
  }

  if (!form.fields.some((f) => f.id === 'patlasv4proto-demanda-modalidade-parceiro')) {
    form.fields.push({
      id: 'patlasv4proto-demanda-modalidade-parceiro',
      label: 'Modalidade de parceiros',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-demanda-parceiro',
      options: ['Individual', 'Coletivo', 'Somente MTI'],
    })
  }

  form.methods = [
    {
      id: 'method-demanda-pre-analise',
      name: 'Pré-análise MTI',
      icon: 'fact_check',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-pre-analise',
      spec: 'Exclusivo MTI. Aprovar (segue), devolver ou recusar.',
    },
    {
      id: 'method-demanda-qualificar',
      name: 'Qualificar solução/catálogo/parceiro(s)',
      icon: 'hub',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-qualificar',
      spec: 'Exclusivo MTI. IA sugere; MTI decide. Notifica 1+ parceiros (individual/coletivo).',
    },
    {
      id: 'method-demanda-iniciar-analise',
      name: 'Iniciar análise',
      icon: 'play_arrow',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-iniciar-analise',
      spec: 'MTI (parceiro notificado pode complementar). Status → Em análise.',
    },
    {
      id: 'method-demanda-via-contrato',
      name: 'Atendimento via contrato',
      icon: 'assignment',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-via-contrato',
      spec: 'MTI / Parceiro (complemento). → cliente autorizar no portal.',
    },
    {
      id: 'method-demanda-orcamento',
      name: 'Enviar para orçamento',
      icon: 'request_quote',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-orcamento',
      spec: 'MTI / Parceiro (complemento). Agenda própria.',
    },
    {
      id: 'method-demanda-devolver',
      name: 'Devolver para correção',
      icon: 'undo',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-devolver',
      spec: 'Somente MTI (09/09).',
    },
    {
      id: 'method-demanda-recusar',
      name: 'Recusar demanda',
      icon: 'cancel',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-recusar',
      spec: 'Somente MTI (09/09). Reabrir não reafirmado em 09/09.',
    },
  ]

  const mtiPresets = [
    {
      id: 'preset-dem-mti-pre-analise',
      name: 'MTI · aguardando pré-análise',
      iconColor: '#0F3D4C',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-1031',
        'patlasv4proto-demanda-status': 'Aguardando pré-análise MTI',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-tipo': 'Consumo',
        'patlasv4proto-demanda-cliente': 'Secretaria de Estado de Planejamento e Gestão',
        'patlasv4proto-demanda-contato': 'Lucas Costa',
        'patlasv4proto-demanda-contato-sec': 'Ana Paula Ribeiro',
        'patlasv4proto-demanda-data-evento': '2026-09-10',
        'patlasv4proto-demanda-contrato': '022/2026',
        'patlasv4proto-demanda-produto': 'MTI Simplifica — Desburocratização',
        'patlasv4proto-demanda-descricao':
          'Necessidade de consumo sob contrato vigente para implantação Simplifica na SEPLAG.',
        'patlasv4proto-demanda-parceiro-notificado': false,
        'patlasv4proto-demanda-qualificado': false,
        'patlasv4proto-demanda-roteamento': 'Fila MTI — pré-análise antes da qualificação/roteamento.',
        'patlasv4proto-demanda-criado-em': '2026-09-10',
        'patlasv4proto-demanda-atualizado-em': '2026-09-10',
        'patlasv4proto-demanda-ultimo-ator': 'Sistema',
        'patlasv4proto-demanda-ultima-acao':
          'Demanda registrada no Projeto Atlas · aguarda pré-análise MTI',
      },
      embeddedRowsByFieldId: {},
    },
    {
      id: 'preset-dem-mti-qualificar',
      name: 'MTI · qualificar (ambíguo)',
      iconColor: '#1D5FA8',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-1032',
        'patlasv4proto-demanda-status': 'Aguardando análise',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-tipo': 'Suporte',
        'patlasv4proto-demanda-cliente': 'Secretaria de Estado de Planejamento e Gestão',
        'patlasv4proto-demanda-contato': 'Lucas Costa',
        'patlasv4proto-demanda-contrato': '022/2026',
        'patlasv4proto-demanda-produto': 'Outros / não claro',
        'patlasv4proto-demanda-descricao': 'Pedido ambíguo — requer qualificação MTI.',
        'patlasv4proto-demanda-sugestao-ia':
          'IA sugere: MTI Simplifica + catálogo Pacote Implantação + parceiro EloGroup (individual).',
        'patlasv4proto-demanda-parceiro-notificado': false,
        'patlasv4proto-demanda-qualificado': false,
        'patlasv4proto-demanda-roteamento': 'Pré-análise aprovada · enquadramento não automático → Qualificar.',
        'patlasv4proto-demanda-criado-em': '2026-09-09',
        'patlasv4proto-demanda-atualizado-em': '2026-09-11',
        'patlasv4proto-demanda-ultimo-ator': 'MTI',
        'patlasv4proto-demanda-ultima-acao': 'Pré-análise: aprovou · encaminhou para qualificação',
      },
      embeddedRowsByFieldId: {},
    },
    {
      id: 'preset-dem-mti-em-analise',
      name: 'MTI · em análise',
      iconColor: '#1F7A4D',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-1033',
        'patlasv4proto-demanda-status': 'Em análise',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-tipo': 'Consumo',
        'patlasv4proto-demanda-cliente': 'Secretaria de Estado de Planejamento e Gestão',
        'patlasv4proto-demanda-contato': 'Lucas Costa',
        'patlasv4proto-demanda-contrato': '022/2026',
        'patlasv4proto-demanda-produto': 'MTI Simplifica — Desburocratização',
        'patlasv4proto-demanda-descricao': 'Contrato claro; parceiro EloGroup notificado.',
        'patlasv4proto-demanda-parceiro-notificado': true,
        'patlasv4proto-demanda-parceiro-nome': 'EloGroup',
        'patlasv4proto-demanda-modalidade-parceiro': 'Individual',
        'patlasv4proto-demanda-qualificado': false,
        'patlasv4proto-demanda-roteamento': '1 solução + parceria → parceiro notificado automaticamente.',
        'patlasv4proto-demanda-criado-em': '2026-09-08',
        'patlasv4proto-demanda-atualizado-em': '2026-09-11',
        'patlasv4proto-demanda-ultimo-ator': 'MTI',
        'patlasv4proto-demanda-ultima-acao': 'Iniciou análise no Projeto Atlas',
      },
      embeddedRowsByFieldId: {},
    },
  ]

  // Keep legacy presets + add MTI
  const legacy = (form.exampleValuePresets || []).filter(
    (p) => !String(p.id).startsWith('preset-dem-mti-'),
  )
  form.exampleValuePresets = [...mtiPresets, ...legacy]
  form.activeExamplePresetId = 'preset-dem-mti-pre-analise'
  return form
}

function patchQualificar(form) {
  form.name = 'Demanda — Qualificar solução/catálogo/parceiro(s)'
  form.metadata =
    '09/09 · exclusivo MTI. Solução + catálogo + parceiro(s). IA sugere; MTI decide. Individual ou coletivo.'
  form.fields = [
    {
      id: 'patlasv4proto-mdem-qual-alerta',
      label: 'Aviso',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      alertVariant: 'info',
      alertTitle: 'Qualificação MTI',
      alertMessage:
        'Usar quando o contrato/solução não enquadra sozinho. Sugestão da IA é apoio — a decisão é da MTI.',
    },
    {
      id: 'patlasv4proto-mdem-qual-sugestao-ia',
      label: 'Sugestão da IA (leitura)',
      type: 'text',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      textLong: true,
    },
    {
      id: 'patlasv4proto-mdem-qual-produto',
      label: 'Solução',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'highlight',
      spec: 'Preferir alinhar à classe Solução do Protótipo.',
    },
    {
      id: 'patlasv4proto-mdem-qual-catalogo',
      label: 'Catálogo',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'highlight',
      spec: 'Alinhar à classe Catálogo do Protótipo.',
    },
    {
      id: 'patlasv4proto-mdem-qual-parceiro',
      label: 'Parceiro(s)',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'highlight',
      textLong: true,
      spec: 'Alinhar à classe Parceria/Organização parceiro. Vazio = só MTI.',
    },
    {
      id: 'patlasv4proto-mdem-qual-modalidade',
      label: 'Modalidade',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'highlight',
      options: ['Individual', 'Coletivo', 'Somente MTI'],
    },
    {
      id: 'patlasv4proto-mdem-qual-obs',
      label: 'Observação / parecer',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      textLong: true,
    },
  ]
  return form
}

function patchDevolver(form) {
  form.metadata = '09/09 · somente MTI no Projeto Atlas.'
  const a = form.fields?.find((f) => f.id === 'patlasv4proto-mdem-dev-assinatura')
  if (a) a.spec = 'Obrigatória. Executor = MTI (parceiro não devolve).'
  return form
}

function patchRecusar(form) {
  form.metadata =
    '09/09 · somente MTI. Reabrir NÃO reafirmado em 09/09 — não assumir.'
  return form
}

function patchIniciar(form) {
  form.metadata =
    'MTI inicia no Projeto Atlas. Parceiro notificado pode complementar; não pode recusar/devolver.'
  const alert = form.fields?.find((f) => f.id === 'patlasv4proto-mdem-ini-alerta')
  if (alert) {
    alert.alertMessage =
      'Status → «Em análise». Recusar/devolver exclusivos da MTI. Parceiro: complementar / via contrato / orçamento.'
  }
  return form
}

function adaptFlowFromV2(v2Flow) {
  const flow = structuredClone(v2Flow)
  flow.id = 'flow-proto-demanda-mti'
  flow.name = 'Demanda — Fluxo MTI (back-office Projeto Atlas)'
  flow.metadata =
    'Discovery 09/09/2026 · épico Atlas Protótipo. Papel MTI no Projeto Atlas (Explorer/classe Demanda). Portal só abre/acompanha/autoriza. Classes de Produto/Parceria/Catálogo/Solução/Modelo de Venda reutilizadas deste épico.'

  const navPrefix = `${PKG}::${CLS}::`
  for (const step of flow.steps) {
    if (step.type === 'workspace') {
      step.linkedWorkspaceId = WS
      step.assigneeRoleDetail =
        'Analista MTI no back-office Projeto Atlas. Pacote Fase 3 · Demanda (MTI) → classe Demanda.'
      step.workspaceMethodNavigateStepIds = {
        [`${navPrefix}method-demanda-pre-analise`]: 'step-mti-pre-analise',
        [`${navPrefix}method-demanda-qualificar`]: 'step-mti-qualificar',
        [`${navPrefix}method-demanda-iniciar-analise`]: 'step-mti-iniciar-analise',
        [`${navPrefix}method-demanda-via-contrato`]: 'step-mti-via-contrato',
        [`${navPrefix}method-demanda-orcamento`]: 'step-mti-orcamento',
        [`${navPrefix}method-demanda-devolver`]: 'step-mti-devolver',
        [`${navPrefix}method-demanda-recusar`]: 'step-mti-recusar',
      }
    }
  }
  return flow
}

function ensureWorkspace(workspaces) {
  const ws = workspaces.find((w) => w.id === WS)
  if (!ws) throw new Error('Workspace Mapa do Fluxo não encontrado')

  // Remove Demanda from Fase 2 comercial if present (will live in Fase 3)
  for (const pkg of ws.packages || []) {
    if (pkg.id === PKG) continue
    pkg.classes = (pkg.classes || []).filter((c) => c.linkedFormId !== 'form-patlasv4-proto-demanda')
  }

  let pkg = ws.packages.find((p) => p.id === PKG)
  if (!pkg) {
    pkg = { id: PKG, name: 'Fase 3 · Demanda (MTI)', classes: [] }
    // Insert after Fase 2 fluxo comercial if possible
    const idx = ws.packages.findIndex((p) => p.id === 'pkg-fase-2-fluxo')
    if (idx >= 0) ws.packages.splice(idx + 1, 0, pkg)
    else ws.packages.push(pkg)
  } else {
    pkg.name = 'Fase 3 · Demanda (MTI)'
  }

  pkg.classes = [
    {
      id: CLS,
      name: 'Demanda',
      linkedFormId: 'form-patlasv4-proto-demanda',
      linkedFormExamplePresetIds: [
        'preset-dem-mti-pre-analise',
        'preset-dem-mti-qualificar',
        'preset-dem-mti-em-analise',
      ],
    },
  ]
  return workspaces
}

function ensureClassGroups(bundle) {
  if (!bundle.groups.some((g) => g.id === 'grp-atlas-demanda')) {
    bundle.groups.push({ id: 'grp-atlas-demanda', name: '[Atlas] Demanda' })
    bundle.groups.push({
      id: 'grp-atlas-demanda-met',
      name: 'Métodos',
      parentGroupId: 'grp-atlas-demanda',
    })
  }
  bundle.assignments = bundle.assignments || {}
  bundle.assignments['form-patlasv4-proto-demanda'] = 'grp-atlas-demanda'
  const methodIds = [
    'form-patlasv4-proto-metodo-demanda-pre-analise',
    'form-patlasv4-proto-metodo-demanda-qualificar',
    'form-patlasv4-proto-metodo-demanda-iniciar-analise',
    'form-patlasv4-proto-metodo-demanda-via-contrato',
    'form-patlasv4-proto-metodo-demanda-orcamento',
    'form-patlasv4-proto-metodo-demanda-devolver',
    'form-patlasv4-proto-metodo-demanda-recusar',
    'form-patlasv4-proto-metodo-demanda-autorizar',
  ]
  for (const id of methodIds) bundle.assignments[id] = 'grp-atlas-demanda-met'
  return bundle
}

// --- main ---
console.log('Sync Demanda MTI → Atlas Protótipo…')
const formsPath = path.join(epicDir, 'forms.json')
const forms = readJson(formsPath)

let dem = forms.find((f) => f.id === 'form-patlasv4-proto-demanda')
if (!dem) throw new Error('Demanda ausente no Protótipo')
upsert(forms, patchDemandaClass(structuredClone(dem)))

const patchMap = {
  'form-patlasv4-proto-metodo-demanda-qualificar': patchQualificar,
  'form-patlasv4-proto-metodo-demanda-devolver': patchDevolver,
  'form-patlasv4-proto-metodo-demanda-recusar': patchRecusar,
  'form-patlasv4-proto-metodo-demanda-iniciar-analise': patchIniciar,
}
for (const [id, fn] of Object.entries(patchMap)) {
  const f = forms.find((x) => x.id === id)
  if (!f) throw new Error(`Form ausente: ${id}`)
  upsert(forms, fn(structuredClone(f)))
}
upsert(forms, buildPreAnaliseForm())
writeJson(formsPath, forms)
console.log('forms ok')

const v2Flows = readJson(v2FlowPath)
const v2Flow = v2Flows.find((f) => f.id === 'flow-atlas-v2-demanda-mti')
if (!v2Flow) throw new Error('Fluxo MTI não encontrado no Atlas V2')
const flow = adaptFlowFromV2(v2Flow)

const flowsPath = path.join(epicDir, 'flows.json')
const flows = readJson(flowsPath)
const fi = flows.findIndex((f) => f.id === flow.id)
if (fi >= 0) flows[fi] = flow
else flows.push(flow)

// Mark old demanda flows as legacy jul
for (const f of flows) {
  if (f.id === 'flow-proto-demanda-completa' || f.id === 'flow-proto-demanda-parceiro') {
    if (!String(f.metadata || '').includes('LEGADO')) {
      f.metadata = `LEGADO 20/07 — preferir flow-proto-demanda-mti (09/09). ${f.metadata || ''}`
      if (!f.name.includes('LEGADO')) f.name = `${f.name} (LEGADO jul/26)`
    }
  }
}
writeJson(flowsPath, flows)
console.log('flows ok:', flow.id)

writeJson(path.join(epicDir, 'workspaces.json'), ensureWorkspace(readJson(path.join(epicDir, 'workspaces.json'))))
writeJson(path.join(epicDir, 'class-groups.json'), ensureClassGroups(readJson(path.join(epicDir, 'class-groups.json'))))
console.log('workspace + class-groups ok')
console.log('DONE')
