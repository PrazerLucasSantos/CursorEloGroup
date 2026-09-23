/**
 * Atlas V2 — Fluxo Demanda MTI (back-office Projeto Atlas)
 * Fonte de verdade: Discovery 09/09/2026 (Ata + M4A + Teams/Granola).
 *
 * - Back-office = Projeto Atlas (Explorer / classe Demanda), NÃO portal HTML.
 * - Recusar / devolver: somente MTI.
 * - Pré-análise MTI explícita; qualificação com solução/catálogo/parceiro(s);
 *   IA sugere, MTI decide; parceiro 1+ individual ou coletivo.
 *
 * Uso: node scripts/build-atlas-v2-demanda-mti-flow.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const epicDir = path.join(root, 'data/subprojects/atlas-v4/epics/atlas-v2')
const protoFormsPath = path.join(
  root,
  'data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const DEMANDA_FORM_IDS = [
  'form-patlasv4-proto-demanda',
  'form-patlasv4-proto-metodo-demanda-autorizar',
  'form-patlasv4-proto-metodo-demanda-recusar',
  'form-patlasv4-proto-metodo-demanda-devolver',
  'form-patlasv4-proto-metodo-demanda-orcamento',
  'form-patlasv4-proto-metodo-demanda-via-contrato',
  'form-patlasv4-proto-metodo-demanda-qualificar',
  'form-patlasv4-proto-metodo-demanda-iniciar-analise',
]

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function writeJson(p, data) {
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function upsertForm(forms, form) {
  const i = forms.findIndex((f) => f.id === form.id)
  if (i >= 0) forms[i] = form
  else forms.push(form)
}

function patchDemandaClass(form) {
  form.metadata =
    'Classe Demanda no back-office Projeto Atlas (MTI). Discovery 09/09: pós-contrato; pré-análise MTI; qualificação (solução/catálogo/parceiro(s); IA sugere, MTI decide); parecer via contrato | orçamento | devolver | recusar. Recusar/devolver: somente MTI. Parceiro complementa análise após notificação — sem recusar/devolver.'

  for (const field of form.fields || []) {
    if (field.linkedFormId === 'form-patlasv4-proto-unidade-organizacional') {
      field.linkedFormId = 'form-atlas-f2-unidade-organizacional'
    }
    if (field.linkedFormId === 'form-patlasv4-proto-pessoa') {
      field.linkedFormId = 'form-atlas-f2-pessoa'
    }
  }

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

  // Tipo consumo | suporte
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
      spec: '09/09: escolhido no portal (consumo=verde, suporte=azul) e sobe para o header do registro.',
    })
  }

  const produto = form.fields?.find((f) => f.id === 'patlasv4proto-demanda-produto')
  if (produto) {
    produto.label = 'Solução'
    produto.spec =
      '09/09: seleção solução-first no portal; contrato/KPIs derivados (tooltip). Itens globais se gov MT sem contrato.'
  }

  const contrato = form.fields?.find((f) => f.id === 'patlasv4proto-demanda-contrato')
  if (contrato) {
    contrato.spec =
      'Derivado da solução (tooltip no portal). No BO, leitura. Pode haver itens globais sem contrato.'
  }

  const roteamento = form.fields?.find((f) => f.id === 'patlasv4proto-demanda-roteamento')
  if (roteamento) {
    roteamento.spec =
      'Auto: contrato/solução claros com parceria → notifica parceiro(s). Ambíguo/Outros/N3 → MTI qualifica (solução, catálogo, parceiro(s) individual ou coletivo). IA sugere; MTI decide.'
  }

  const parceiroNome = form.fields?.find((f) => f.id === 'patlasv4proto-demanda-parceiro-nome')
  if (parceiroNome) {
    parceiroNome.label = 'Parceiro(s)'
    parceiroNome.spec =
      'Um ou mais. Modalidade individual ou coletiva (09/09). Vazio = atendimento só MTI.'
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
      spec: 'IA sugere enquadramento; decisão final sempre da MTI.',
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
      spec: '09/09: individual ou coletivo quando há 1+ parceiros.',
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
      spec: 'Exclusivo MTI. Quando contrato/solução não enquadra sozinho. IA sugere; MTI decide. Notifica 1+ parceiros (individual/coletivo).',
    },
    {
      id: 'method-demanda-iniciar-analise',
      name: 'Iniciar análise',
      icon: 'play_arrow',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-iniciar-analise',
      spec: 'MTI (e parceiro notificado pode complementar). Status → Em análise.',
    },
    {
      id: 'method-demanda-via-contrato',
      name: 'Atendimento via contrato',
      icon: 'assignment',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-via-contrato',
      spec: 'MTI / Parceiro (complemento). Catálogos + itens → cliente autorizar no portal.',
    },
    {
      id: 'method-demanda-orcamento',
      name: 'Enviar para orçamento',
      icon: 'request_quote',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-orcamento',
      spec: 'MTI / Parceiro (complemento). Agenda própria de orçamento.',
    },
    {
      id: 'method-demanda-devolver',
      name: 'Devolver para correção',
      icon: 'undo',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-devolver',
      spec: 'Somente MTI (09/09). Motivo + assinatura. Cliente corrige e reenvia.',
    },
    {
      id: 'method-demanda-recusar',
      name: 'Recusar demanda',
      icon: 'cancel',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-recusar',
      spec: 'Somente MTI (09/09). Motivo + assinatura. Reabrir não foi reafirmado em 09/09.',
    },
  ]

  // Presets MTI (back-office)
  form.exampleValuePresets = [
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
        'patlasv4proto-demanda-ultima-acao': 'Demanda registrada no Projeto Atlas · aguarda pré-análise MTI',
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
        'patlasv4proto-demanda-descricao': 'Pedido ambíguo — requer qualificação MTI de solução/catálogo/parceiro.',
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
  form.activeExamplePresetId = 'preset-dem-mti-pre-analise'
  return form
}

function buildPreAnaliseForm() {
  return {
    id: 'form-patlasv4-proto-metodo-demanda-pre-analise',
    name: 'Demanda — Pré-análise MTI',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Discovery 09/09. Exclusivo MTI no Projeto Atlas. Aprovar segue para roteamento/qualificação; devolver/recusar encerram ou devolvem ao cliente.',
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
        spec: 'Aprovar → roteamento/qualificação. Devolver/Recusar = só MTI.',
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
      spec: 'Preenchida pelo sistema a partir da descrição/chat.',
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
      spec: 'Um ou mais. Vazio = só MTI. Ao salvar com parceiro(s), notifica.',
      textLong: true,
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
  form.metadata = '09/09 · somente MTI no Projeto Atlas. Motivo + assinatura. Cliente corrige no portal e reenvia.'
  const assinatura = form.fields?.find((f) => f.id === 'patlasv4proto-mdem-dev-assinatura')
  if (assinatura) {
    assinatura.spec = 'Obrigatória. Executor = MTI (parceiro não devolve).'
  }
  return form
}

function patchRecusar(form) {
  form.metadata =
    '09/09 · somente MTI no Projeto Atlas. Motivo + assinatura. Reabrir com justificativa NÃO foi reafirmado em 09/09 — não assumir.'
  return form
}

function patchIniciarAnalise(form) {
  form.metadata =
    'MTI inicia no Projeto Atlas. Parceiro notificado pode complementar análise; não pode recusar/devolver.'
  const alert = form.fields?.find((f) => f.id === 'patlasv4proto-mdem-ini-alerta')
  if (alert) {
    alert.alertMessage =
      'Status → «Em análise». Recusar/devolver permanecem exclusivos da MTI. Parceiro: complementar / via contrato / orçamento.'
  }
  return form
}

function buildFlow() {
  const pkg = 'pkg-atlas-v2-demanda'
  const cls = 'cls-atlas-v2-demanda'
  const ws = 'ws-atlas-v2'
  const nav = (methodId, stepId) => `${pkg}::${cls}::${methodId}`

  return {
    id: 'flow-atlas-v2-demanda-mti',
    name: 'Demanda — Fluxo MTI (back-office Projeto Atlas)',
    metadata:
      'Discovery 09/09/2026. Papel MTI no Projeto Atlas (Explorer/classe Demanda). Portal só abre/acompanha/autoriza. Orçamento/OS/ServiceNow = fronteira/agenda própria. Fora: TH, RAE, PV, NF, robô.',
    steps: [
      {
        id: 'step-mti-visao',
        title: '0. Visão — Demanda MTI',
        type: 'html',
        htmlPresentationShowHeader: true,
        htmlPresentationHeaderTitle: 'Atlas · Demanda · MTI',
        htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:920px;padding:8px 4px;color:#0f172a;line-height:1.55;font-size:14px">
  <h1 style="margin:0 0 10px;color:#0F3D4C;font-size:22px">Demanda no back-office — Projeto Atlas</h1>
  <p style="margin:0 0 12px;color:#475569">O <strong>back-office da MTI é o Projeto Atlas</strong> (workspace Explorer + classe Demanda). Não é portal.</p>
  <h2 style="margin:16px 0 8px;font-size:16px">Premissa 09/09</h2>
  <ul style="margin:0;padding-left:18px">
    <li>Demanda <strong>pós-contrato</strong> (consumo/suporte). Proposta/orçamento “do zero” = fluxo separado.</li>
    <li>Portal: um formulário em etapas (tipo → solução+KPIs → descrição+IA) → envia.</li>
    <li>MTI: recebe no Atlas → pré-análise → qualifica/roteia → analisa → parecer.</li>
  </ul>
  <h2 style="margin:16px 0 8px;font-size:16px">Regras fechadas</h2>
  <ul style="margin:0;padding-left:18px">
    <li><strong>Recusar / devolver:</strong> somente MTI.</li>
    <li><strong>IA sugere; MTI decide</strong> na qualificação.</li>
    <li>Parceiro(s): 1+ · individual ou coletivo · após notificação, complementa (sem recusar/devolver).</li>
    <li>Parecer: via contrato · orçamento · devolver · recusar.</li>
  </ul>
</div>`,
      },
      {
        id: 'step-mti-contexto-chegada',
        title: '1. Contexto — como a demanda chega',
        type: 'html',
        htmlPresentationShowHeader: true,
        htmlPresentationHeaderTitle: 'Atlas · Demanda · MTI',
        htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:920px;padding:8px;color:#0f172a;line-height:1.55;font-size:14px">
  <h2 style="margin:0 0 8px;color:#0F3D4C">Antes do BO MTI</h2>
  <ol style="margin:0;padding-left:18px">
    <li><strong>Portal</strong> (cliente/parceiro/MTI): tipo Consumo|Suporte → solução-first → tooltip contrato + KPIs → Avançar → descrição (+obs/anexo + chat IA) → Enviar.</li>
    <li><strong>Hierarquia do cliente</strong> (opcional): demandante N2 só abre; gestor/fiscal pode aprovar, devolver ou recusar antes da MTI.</li>
    <li>Registro criado no <strong>Projeto Atlas</strong> com status «Aguardando pré-análise MTI» (ou «Aguardando análise» se regra dispensar pré-filtro).</li>
  </ol>
  <p style="margin:12px 0 0;padding:10px;background:#eff6ff;border-left:4px solid #1D5FA8">Este fluxo modela a partir daqui: ações da MTI no Explorer.</p>
</div>`,
      },
      {
        id: 'step-mti-workspace-fila',
        title: '2. Fila no Explorer (Projeto Atlas)',
        type: 'workspace',
        linkedWorkspaceId: ws,
        assigneeRole: 'MTI',
        assigneeRoleDetail:
          'Analista MTI no back-office Projeto Atlas. Abre a classe Demanda no pacote Fase 3 — Demanda.',
        workspacePresentationDescription:
          'Lista/Explorer do Projeto Atlas. Abrir o registro DEM-* em Aguardando pré-análise / Aguardando análise.',
        workspaceMethodNavigateStepIds: {
          [nav('method-demanda-pre-analise')]: 'step-mti-pre-analise',
          [nav('method-demanda-qualificar')]: 'step-mti-qualificar',
          [nav('method-demanda-iniciar-analise')]: 'step-mti-iniciar-analise',
          [nav('method-demanda-via-contrato')]: 'step-mti-via-contrato',
          [nav('method-demanda-orcamento')]: 'step-mti-orcamento',
          [nav('method-demanda-devolver')]: 'step-mti-devolver',
          [nav('method-demanda-recusar')]: 'step-mti-recusar',
        },
        bpmnPossiblePaths: [
          { key: 'Abrir registro', value: 'step-mti-registro' },
        ],
      },
      {
        id: 'step-mti-registro',
        title: '3. Abrir registro Demanda',
        type: 'class',
        linkedFormId: 'form-patlasv4-proto-demanda',
        classPresentationTitle: 'Demanda — registro (MTI)',
        classPresentationDescription:
          'Uma tela Sydle: seções Identificação, Necessidade, Parceiro/roteamento, Atendimento, Histórico. Métodos no painel.',
        assigneeRole: 'MTI',
        bpmnDescription:
          'Leitura do pedido (tipo, solução, contrato/KPIs, descrição, anexos, sugestão IA). Próximo: Pré-análise.',
        classMethodNavigateStepIds: {
          'method-demanda-pre-analise': 'step-mti-pre-analise',
          'method-demanda-qualificar': 'step-mti-qualificar',
          'method-demanda-iniciar-analise': 'step-mti-iniciar-analise',
          'method-demanda-via-contrato': 'step-mti-via-contrato',
          'method-demanda-orcamento': 'step-mti-orcamento',
          'method-demanda-devolver': 'step-mti-devolver',
          'method-demanda-recusar': 'step-mti-recusar',
        },
        bpmnPossiblePaths: [
          { key: 'Pré-análise', value: 'step-mti-pre-analise' },
        ],
        bpmnOutputs: 'Registro aberto no Projeto Atlas',
      },
      {
        id: 'step-mti-pre-analise',
        title: '4. Pré-análise MTI',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-pre-analise',
        bpmnActivityKey: 'demanda.mti.preAnalise',
        bpmnTaskType: 'userTask',
        assigneeRole: 'MTI',
        assigneeRoleDetail: 'Exclusivo MTI. Parceiro não participa deste passo.',
        bpmnDescription:
          'Aprovar (segue), devolver para correção ou recusar. Assinatura digital MTI.',
        bpmnRuleList: [
          'Somente MTI executa pré-análise, devolução e recusa',
          'Aprovar → gateway de roteamento/qualificação',
          'Devolver → cliente corrige no portal e reenvia',
          'Recusar → fim (reabrir não reafirmado em 09/09)',
        ],
        bpmnPossiblePaths: [
          { key: 'Aprovar', value: 'step-mti-gateway-roteamento' },
          { key: 'Devolver', value: 'step-mti-fim-devolvida' },
          { key: 'Recusar', value: 'step-mti-fim-recusada' },
        ],
        bpmnOutputs: 'Pré-análise registrada',
        bpmnOnCompleteEvent: 'Atualiza status e histórico do registro Demanda',
      },
      {
        id: 'step-mti-gateway-roteamento',
        title: '5. Gateway — enquadramento automático?',
        type: 'bpmnActivity',
        bpmnTaskType: 'userTask',
        bpmnActivityKey: 'demanda.mti.gatewayRoteamento',
        assigneeRole: 'Sistema / MTI',
        bpmnDescription:
          'Contrato + solução claros com parceria → notifica parceiro(s) e segue à análise. Caso contrário (Outros, ambíguo, N3, sem parceria) → Qualificar.',
        bpmnRuleList: [
          'Solução-first já veio do portal; contrato/KPIs são derivados',
          'Auto: 1+ parceria clara → parceiroNotificado=true',
          'Senão: MTI informa solução, catálogo e parceiro(s)',
        ],
        bpmnPossiblePaths: [
          { key: 'Automático → análise', value: 'step-mti-iniciar-analise' },
          { key: 'Qualificar', value: 'step-mti-qualificar' },
        ],
        linkedFormId: 'form-patlasv4-proto-demanda',
      },
      {
        id: 'step-mti-qualificar',
        title: '5b. Qualificar (MTI)',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-qualificar',
        bpmnActivityKey: 'demanda.mti.qualificar',
        bpmnTaskType: 'userTask',
        assigneeRole: 'MTI',
        assigneeRoleDetail: 'Exclusivo MTI. Fiscal em produto quando aplicável.',
        bpmnDescription:
          'Define solução, catálogo e parceiro(s). Modalidade individual ou coletiva. IA sugere; MTI decide. Pode seguir só MTI (sem parceiro).',
        bpmnRuleList: [
          'IA é sugestão — decisão final MTI',
          'Parceiro(s) 1+ · Individual | Coletivo | Somente MTI',
          'Ao notificar parceiro, libera visão limitada no BO (complemento)',
          'Se não enquadra: devolver ou recusar (só MTI)',
        ],
        bpmnPossiblePaths: [
          { key: 'Qualificado → análise', value: 'step-mti-iniciar-analise' },
          { key: 'Não enquadra → devolver', value: 'step-mti-devolver' },
          { key: 'Não enquadra → recusar', value: 'step-mti-recusar' },
        ],
        bpmnOutputs: 'Solução/catálogo/parceiro(s) definidos · notificação se houver',
      },
      {
        id: 'step-mti-iniciar-analise',
        title: '6. Iniciar análise',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-iniciar-analise',
        bpmnActivityKey: 'demanda.mti.iniciarAnalise',
        bpmnTaskType: 'userTask',
        assigneeRole: 'MTI',
        bpmnDescription:
          'Status → Em análise. Parceiro notificado pode complementar; MTI mantém controle de recusa/devolução.',
        bpmnPossiblePaths: [
          { key: 'Ir para parecer', value: 'step-mti-parecer' },
        ],
        bpmnOutputs: 'Status Em análise',
      },
      {
        id: 'step-mti-parecer',
        title: '7. Parecer MTI — quatro caminhos',
        type: 'class',
        linkedFormId: 'form-patlasv4-proto-demanda',
        classPresentationTitle: 'Demanda — parecer (MTI)',
        classPresentationDescription:
          'No mesmo registro: escolher método de parecer. Recusar/devolver = só MTI. Parceiro pode via contrato / orçamento / complementar.',
        assigneeRole: 'MTI',
        bpmnDescription: 'Via contrato | Orçamento | Devolver | Recusar.',
        classMethodNavigateStepIds: {
          'method-demanda-via-contrato': 'step-mti-via-contrato',
          'method-demanda-orcamento': 'step-mti-orcamento',
          'method-demanda-devolver': 'step-mti-devolver',
          'method-demanda-recusar': 'step-mti-recusar',
        },
        bpmnPossiblePaths: [
          { key: 'Via contrato', value: 'step-mti-via-contrato' },
          { key: 'Orçamento', value: 'step-mti-orcamento' },
          { key: 'Devolver', value: 'step-mti-devolver' },
          { key: 'Recusar', value: 'step-mti-recusar' },
        ],
        bpmnRuleList: [
          'Devolver e recusar: somente MTI (09/09)',
          'Parceiro não executa devolver/recusar',
        ],
      },
      {
        id: 'step-mti-via-contrato',
        title: '7a. Atendimento via contrato',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-via-contrato',
        bpmnActivityKey: 'demanda.mti.viaContrato',
        bpmnTaskType: 'userTask',
        assigneeRole: 'MTI',
        bpmnDescription:
          'Monta catálogos/itens (plural) + descrição/anexos → encaminha cliente autorizar no portal. Não finaliza atendimento no BO.',
        bpmnPossiblePaths: [
          { key: 'Encaminhar autorização (portal)', value: 'step-mti-aguarda-autorizacao' },
        ],
        bpmnOutputs: 'Status Aguardando autorização',
      },
      {
        id: 'step-mti-orcamento',
        title: '7b. Enviar para orçamento',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-orcamento',
        bpmnActivityKey: 'demanda.mti.orcamento',
        bpmnTaskType: 'userTask',
        assigneeRole: 'MTI',
        bpmnDescription:
          'Status Em orçamento. Detalhe de campos/assinantes = agenda própria (fora deste BPM).',
        bpmnPossiblePaths: [
          { key: 'Fim deste BPM', value: 'step-mti-fim-orcamento' },
        ],
      },
      {
        id: 'step-mti-devolver',
        title: '7c. Devolver para correção',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-devolver',
        bpmnActivityKey: 'demanda.mti.devolver',
        bpmnTaskType: 'userTask',
        assigneeRole: 'MTI',
        assigneeRoleDetail: 'Somente MTI (09/09).',
        bpmnDescription: 'Motivo + assinatura MTI. Cliente corrige no portal e reenvia → volta à análise/pré-análise.',
        bpmnRuleList: ['Parceiro não devolve'],
        bpmnPossiblePaths: [
          { key: 'Cliente reenvia', value: 'step-mti-registro' },
        ],
        bpmnOutputs: 'Status Devolvida para correção',
      },
      {
        id: 'step-mti-recusar',
        title: '7d. Recusar demanda',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-recusar',
        bpmnActivityKey: 'demanda.mti.recusar',
        bpmnTaskType: 'userTask',
        assigneeRole: 'MTI',
        assigneeRoleDetail: 'Somente MTI (09/09).',
        bpmnDescription: 'Motivo + assinatura MTI. Não modelar reabertura automática (não reafirmada em 09/09).',
        bpmnRuleList: ['Parceiro não recusa', 'Não assumir reabrir'],
        bpmnPossiblePaths: [
          { key: 'Confirmar recusa', value: 'step-mti-fim-recusada' },
        ],
      },
      {
        id: 'step-mti-aguarda-autorizacao',
        title: '8. Fronteira — autorização no portal',
        type: 'html',
        htmlPresentationShowHeader: true,
        htmlPresentationHeaderTitle: 'Atlas · Demanda · MTI',
        htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:880px;padding:8px;color:#0f172a;line-height:1.55;font-size:14px">
  <h2 style="margin:0 0 8px;color:#0F3D4C">Cliente autoriza no portal</h2>
  <p>Após via contrato, o cliente autoriza (ou não) <strong>no portal</strong>. O BO MTI acompanha o status no Projeto Atlas.</p>
  <ul style="margin:0;padding-left:18px">
    <li>Autorizar → OS (capa + orçamento assinado, agenda própria) → cargos → ServiceNow.</li>
    <li>Não autorizar → status «Não autorizada».</li>
  </ul>
  <p style="margin:12px 0 0;color:#64748b">Esta etapa marca a fronteira: ação do cliente fora do Explorer MTI.</p>
</div>`,
        bpmnPossiblePaths: [
          { key: 'Autorizada → atendimento', value: 'step-mti-fim-atendimento' },
          { key: 'Não autorizada', value: 'step-mti-fim-nao-aut' },
        ],
      },
      {
        id: 'step-mti-fim-atendimento',
        title: 'Fim — Em atendimento',
        type: 'html',
        htmlPresentationShowHeader: true,
        htmlPresentationHeaderTitle: 'Atlas · Demanda · MTI',
        htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;padding:8px;color:#0f172a">
  <h2 style="color:#1F7A4D">Aprovada · em atendimento</h2>
  <p>Demanda autorizada. ServiceNow / esteira OS = modelagem adjacente. Fora deste escopo: TH, RAE, PV, NF, robô Yomachi.</p>
</div>`,
      },
      {
        id: 'step-mti-fim-orcamento',
        title: 'Fim — Em orçamento',
        type: 'html',
        htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;padding:8px;color:#0f172a">
  <h2 style="color:#B54708">Em orçamento</h2>
  <p>Continua na agenda própria de orçamento (campos, assinantes). OS = capa + orçamento assinado.</p>
</div>`,
      },
      {
        id: 'step-mti-fim-devolvida',
        title: 'Fim — Devolvida (ciclo)',
        type: 'html',
        htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;padding:8px;color:#0f172a">
  <h2 style="color:#B54708">Devolvida para correção</h2>
  <p>Cliente corrige no portal e reenvia. MTI retoma no Projeto Atlas (pré-análise/análise).</p>
</div>`,
      },
      {
        id: 'step-mti-fim-recusada',
        title: 'Fim — Recusada',
        type: 'html',
        htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;padding:8px;color:#0f172a">
  <h2 style="color:#B42318">Recusada</h2>
  <p>Recusa exclusiva MTI. Reabertura automática <strong>não</strong> foi reafirmada em 09/09 — não modelar como regra fechada.</p>
</div>`,
      },
      {
        id: 'step-mti-fim-nao-aut',
        title: 'Fim — Não autorizada',
        type: 'html',
        htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;padding:8px;color:#0f172a">
  <h2>Não autorizada</h2>
  <p>Cliente não autorizou no portal. MTI acompanha status no Projeto Atlas.</p>
</div>`,
      },
    ],
  }
}

function ensureWorkspace(workspaces) {
  let ws = workspaces.find((w) => w.id === 'ws-atlas-v2')
  if (!ws) {
    ws = {
      id: 'ws-atlas-v2',
      name: 'Atlas V2',
      explorerChromeColor: '#0F3D4C',
      explorerHeaderForeground: '#ffffff',
      explorerUserInitials: 'MT',
      packages: [],
    }
    workspaces.push(ws)
  }
  ws.packages = ws.packages || []
  const pkgId = 'pkg-atlas-v2-demanda'
  let pkg = ws.packages.find((p) => p.id === pkgId)
  if (!pkg) {
    pkg = { id: pkgId, name: 'Fase 3 — Demanda (MTI)', classes: [] }
    ws.packages.push(pkg)
  }
  pkg.classes = pkg.classes || []
  if (!pkg.classes.some((c) => c.id === 'cls-atlas-v2-demanda')) {
    pkg.classes.push({
      id: 'cls-atlas-v2-demanda',
      name: 'Demanda',
      linkedFormId: 'form-patlasv4-proto-demanda',
    })
  }
  return workspaces
}

function ensureClassGroups(bundle) {
  bundle.groups = bundle.groups || []
  if (!bundle.groups.some((g) => g.id === 'grp-atlas-v2-demanda')) {
    bundle.groups.push({ id: 'grp-atlas-v2-demanda', name: 'Fase 3 — Demanda' })
  }
  bundle.assignments = bundle.assignments || {}
  for (const id of [...DEMANDA_FORM_IDS, 'form-patlasv4-proto-metodo-demanda-pre-analise']) {
    bundle.assignments[id] = 'grp-atlas-v2-demanda'
  }
  return bundle
}

// --- main ---
console.log('Lendo forms do protótipo…')
const protoForms = readJson(protoFormsPath)
const byId = Object.fromEntries(protoForms.map((f) => [f.id, f]))

const formsPath = path.join(epicDir, 'forms.json')
const forms = readJson(formsPath)

for (const id of DEMANDA_FORM_IDS) {
  const src = byId[id]
  if (!src) throw new Error(`Form ausente no protótipo: ${id}`)
  let form = structuredClone(src)
  if (id === 'form-patlasv4-proto-demanda') form = patchDemandaClass(form)
  if (id === 'form-patlasv4-proto-metodo-demanda-qualificar') form = patchQualificar(form)
  if (id === 'form-patlasv4-proto-metodo-demanda-devolver') form = patchDevolver(form)
  if (id === 'form-patlasv4-proto-metodo-demanda-recusar') form = patchRecusar(form)
  if (id === 'form-patlasv4-proto-metodo-demanda-iniciar-analise') form = patchIniciarAnalise(form)
  upsertForm(forms, form)
}
upsertForm(forms, buildPreAnaliseForm())
writeJson(formsPath, forms)
console.log(`forms.json: ${forms.length} classes`)

const flowsPath = path.join(epicDir, 'flows.json')
let flows = readJson(flowsPath)
if (!Array.isArray(flows)) flows = []
const flow = buildFlow()
const fi = flows.findIndex((f) => f.id === flow.id)
if (fi >= 0) flows[fi] = flow
else flows.push(flow)
writeJson(flowsPath, flows)
console.log(`flows.json: ${flows.length} fluxos (inclui ${flow.name})`)

const wsPath = path.join(epicDir, 'workspaces.json')
writeJson(wsPath, ensureWorkspace(readJson(wsPath)))
console.log('workspaces.json atualizado')

const cgPath = path.join(epicDir, 'class-groups.json')
writeJson(cgPath, ensureClassGroups(readJson(cgPath)))
console.log('class-groups.json atualizado')

const ctxPath = path.join(epicDir, 'context.md')
const ctxExtra = `
## Demanda — Fluxo MTI (09/09)

Apresentação: \`flow-atlas-v2-demanda-mti\` — **Demanda — Fluxo MTI (back-office Projeto Atlas)**.

- Back-office = Projeto Atlas (Explorer), não portal.
- Pré-análise MTI → gateway auto/qualificar → análise → parecer (via contrato | orçamento | devolver | recusar).
- Recusar/devolver: **somente MTI**.
- IA sugere; MTI decide. Parceiro(s) individual/coletivo após notificação.
`
if (fs.existsSync(ctxPath)) {
  let ctx = fs.readFileSync(ctxPath, 'utf8')
  if (!ctx.includes('flow-atlas-v2-demanda-mti')) {
    fs.writeFileSync(ctxPath, `${ctx.trimEnd()}\n${ctxExtra}`, 'utf8')
  }
}

console.log('OK')
