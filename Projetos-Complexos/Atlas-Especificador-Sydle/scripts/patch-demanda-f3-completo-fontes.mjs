/**
 * Demanda — alinhamento completo às fontes F3
 * (docs/demanda-o-que-foi-dito-e-regras.md · Discovery 11/09).
 *
 * Inclui: fila consumo×suporte, responsáveis/substitutos,
 * autorizar execução → ServiceNow, RAER/homologação, mapa atualizado.
 *
 * Uso: node scripts/patch-demanda-f3-completo-fontes.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const formsPath = path.join(EPIC, 'forms.json')
const flowsPath = path.join(EPIC, 'flows.json')
const FORM = 'form-patlasv4-proto-demanda'

const MAPA =
  'Abertura (SLA demanda) → [Hierarquia N2?] → Pré-análise MTI → Gateway → ' +
  'Fila: Consumo=gerente+titular parceria | Suporte=grupo/classe (24×7) → ' +
  'A) Parceiro efetivar→declarar→validar MTI → B) Via contrato detalhar→assinaturas→execução+OS → ' +
  'C) Orçamento→OS→gerente operação → Autorizar execução→ServiceNow «aprovada e em atendimento» → ' +
  'Encerrar→Termo homologação+RAER→assinaturas → Fins'

const STATUS = [
  'Aguardando gestor',
  'Aguardando pré-análise MTI',
  'Aguardando análise',
  'Aguardando parceiro',
  'Em análise',
  'Aguardando assinatura do atendimento',
  'Em atendimento · parceiro',
  'Aguardando validação MTI',
  'Devolvida para correção',
  'Aguardando autorização',
  'Em orçamento',
  'Aguardando assinatura OS (gerente operação)',
  'Aprovada · em atendimento',
  'Em homologação',
  'Aguardando assinatura do termo',
  'Dilatação de prazo',
  'Recusada',
  'Não autorizada',
  'Efetivado · entregue',
]

function slug(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

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

function upsert(forms, form) {
  const i = forms.findIndex((x) => x.id === form.id)
  if (i >= 0) forms[i] = form
  else forms.push(form)
}

function main() {
  const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
  const dem = forms.find((x) => x.id === FORM)
  if (!dem) throw new Error('Demanda não encontrada')

  dem.metadata =
    'Demanda F3 completa (demanda-o-que-foi-dito-e-regras.md). ' +
    'R1–R20: abertura, 2 SLAs, hierarquia, qualificar, parceiro efetivar, via contrato+assinaturas, ' +
    'fila consumo×suporte, responsáveis/substitutos, OS, Atlas→ServiceNow, termo+RAER. ' +
    'Fora: proposta portal, CRM, Hire detalhado, distribuição automática.'

  dem.sections = [
    { id: 'sec-demanda-andamento', title: 'Status e andamento', icon: 'timeline' },
    { id: 'sec-demanda-identificacao', title: 'Identificação', icon: 'badge' },
    { id: 'sec-demanda-necessidade', title: 'Necessidade', icon: 'description' },
    { id: 'sec-demanda-fila', title: 'Fila e responsáveis', icon: 'groups' },
    { id: 'sec-demanda-parceiro', title: 'Parceiro / roteamento', icon: 'handshake' },
    { id: 'sec-demanda-analise-tipo', title: 'Análise · tipo', icon: 'category' },
    { id: 'sec-demanda-atendimento', title: 'Atendimento', icon: 'assignment' },
    { id: 'sec-demanda-assinaturas', title: 'Assinaturas via contrato', icon: 'draw' },
    { id: 'sec-demanda-entregavel', title: 'Entregável / homologação / RAER', icon: 'verified' },
    { id: 'sec-demanda-os-orc', title: 'OS / Orçamento / ServiceNow', icon: 'receipt_long' },
    { id: 'sec-demanda-historico', title: 'Histórico', icon: 'history' },
  ]

  const st = dem.fields.find((x) => x.id === 'patlasv4proto-demanda-status')
  if (st) {
    st.options = STATUS
    st.spec = 'Rito F3 completo — ver aba Status e andamento.'
  }

  // Update mapa alert if exists
  const mapa = dem.fields.find((x) => x.id === 'patlasv4proto-demanda-andamento-mapa')
  if (mapa) {
    mapa.alertMessage = MAPA
    mapa.alertTitle = 'Fluxo Demanda F3 (fontes 11/09)'
  }

  // Strip F3-specific prefixes to rebuild
  const strip = [
    'patlasv4proto-demanda-fila-',
    'patlasv4proto-demanda-resp-',
    'patlasv4proto-demanda-subst-',
    'patlasv4proto-demanda-sn-',
    'patlasv4proto-demanda-raer-',
    'patlasv4proto-demanda-homolog-raer',
    'patlasv4proto-demanda-suporte-',
  ]
  dem.fields = (dem.fields || []).filter((f) => !strip.some((p) => String(f.id).startsWith(p)))

  // Rename entregavel section id refs stay; update homolog alert titles later

  const filaFields = [
    field({
      id: 'patlasv4proto-demanda-fila-alerta',
      label: 'Roteamento',
      type: 'alert',
      size: 'large',
      readOnly: true,
      sectionId: 'sec-demanda-fila',
      relevance: 'highlight',
      alertVariant: 'info',
      alertTitle: 'R16 — Quem vê a demanda',
      alertMessage:
        'Consumo: gerente + titular responsável pela parceria (gerente vê a equipe). ' +
        'Suporte: grupo/equipe da classe de serviço (pode 24×7 / sobreaviso). ' +
        'Substituto 1 = membro da equipe; substituto 2 = sempre o gerente.',
    }),
    field({
      id: 'patlasv4proto-demanda-fila-regra',
      label: 'Regra de fila (automática)',
      type: 'textOptions',
      sectionId: 'sec-demanda-fila',
      readOnly: true,
      relevance: 'highlight',
      options: [
        'Consumo · gerente + titular da parceria',
        'Suporte · grupo/classe de serviço',
        'Parceiro notificado · fila parceria',
        'Aguardando definição',
      ],
      spec: 'Derivada do Tipo + parceria. R16.',
    }),
    field({
      id: 'patlasv4proto-demanda-resp-gerente',
      label: 'Gerente da parceria',
      type: 'text',
      sectionId: 'sec-demanda-fila',
      relevance: 'highlight',
      spec: 'Definido no cadastro do contrato / painel do gerente.',
    }),
    field({
      id: 'patlasv4proto-demanda-resp-titular',
      label: 'Responsável titular (atendimento/OS)',
      type: 'text',
      sectionId: 'sec-demanda-fila',
      relevance: 'highlight',
      spec: 'Indicado pelo gerente para o produto/parceria.',
    }),
    field({
      id: 'patlasv4proto-demanda-subst-1',
      label: 'Substituto 1',
      type: 'text',
      sectionId: 'sec-demanda-fila',
      spec: 'Qualquer membro da equipe.',
    }),
    field({
      id: 'patlasv4proto-demanda-subst-2',
      label: 'Substituto 2 (sempre gerente)',
      type: 'text',
      sectionId: 'sec-demanda-fila',
      readOnly: true,
      relevance: 'highlight',
      spec: 'R16: substituto 2 = sempre o gerente.',
    }),
    field({
      id: 'patlasv4proto-demanda-suporte-grupo',
      label: 'Grupo / squad de suporte',
      type: 'text',
      sectionId: 'sec-demanda-fila',
      hidden: true,
      spec: 'Visível quando Tipo = Suporte.',
    }),
    field({
      id: 'patlasv4proto-demanda-suporte-24x7',
      label: 'Suporte 24×7 / sobreaviso',
      type: 'boolean',
      sectionId: 'sec-demanda-fila',
      hidden: true,
      spec: 'Suporte pode ser fora do horário comercial.',
    }),
  ]

  // Update entregavel section fields — add RAER
  const raerFields = [
    field({
      id: 'patlasv4proto-demanda-raer-alerta',
      label: 'RAER',
      type: 'alert',
      size: 'large',
      readOnly: true,
      sectionId: 'sec-demanda-entregavel',
      alertVariant: 'warning',
      alertTitle: 'Termo de Homologação + RAER (R18)',
      alertMessage:
        'Ao encerrar o atendimento: avisar cliente → gerar termo + RAER. ' +
        'Conteúdo: itens/OS, artefatos, execução atestada, evolução do projeto. ' +
        'Assinam gestor, fiscal e solicitante. Ajuste: cliente ou MTI. Detalhe Hire = próxima agenda.',
    }),
    field({
      id: 'patlasv4proto-demanda-raer-status',
      label: 'RAER',
      type: 'textOptions',
      sectionId: 'sec-demanda-entregavel',
      options: ['Não iniciado', 'Em elaboração', 'Vinculado ao termo', 'Concluído'],
      relevance: 'highlight',
      spec: 'Stub F3 — detalhar na sessão Hire/homologação.',
    }),
    field({
      id: 'patlasv4proto-demanda-raer-obs',
      label: 'RAER · observação / vínculo',
      type: 'text',
      size: 'large',
      textLong: true,
      sectionId: 'sec-demanda-entregavel',
    }),
    field({
      id: 'patlasv4proto-demanda-homolog-ajuste',
      label: 'Solicitação de ajuste no termo',
      type: 'boolean',
      sectionId: 'sec-demanda-entregavel',
      spec: 'Cliente ou MTI podem solicitar ajuste.',
    }),
    field({
      id: 'patlasv4proto-demanda-homolog-ajuste-por',
      label: 'Ajuste solicitado por',
      type: 'textOptions',
      sectionId: 'sec-demanda-entregavel',
      options: ['—', 'Cliente', 'MTI'],
      hidden: true,
    }),
  ]

  const snFields = [
    field({
      id: 'patlasv4proto-demanda-sn-alerta',
      label: 'ServiceNow',
      type: 'alert',
      size: 'large',
      readOnly: true,
      sectionId: 'sec-demanda-os-orc',
      alertVariant: 'info',
      alertTitle: 'R17 — Atlas → ServiceNow',
      alertMessage:
        'Aprovação ocorre no Atlas. Após autorizar execução (pós-OS), envia ao ServiceNow como «aprovada e em atendimento». ' +
        'Não recriar rito de aprovação no SN.',
    }),
    field({
      id: 'patlasv4proto-demanda-sn-status',
      label: 'Integração ServiceNow',
      type: 'textOptions',
      sectionId: 'sec-demanda-os-orc',
      readOnly: true,
      relevance: 'highlight',
      options: [
        'Não enviado',
        'Aguardando autorização de execução',
        'Enviado · aprovada e em atendimento',
        'Erro de integração',
      ],
    }),
    field({
      id: 'patlasv4proto-demanda-sn-em',
      label: 'Enviado ao ServiceNow em',
      type: 'date',
      size: 'small',
      readOnly: true,
      sectionId: 'sec-demanda-os-orc',
    }),
    field({
      id: 'patlasv4proto-demanda-sn-id',
      label: 'ID / protocolo ServiceNow',
      type: 'text',
      size: 'small',
      readOnly: true,
      sectionId: 'sec-demanda-os-orc',
    }),
  ]

  // Find insert points
  const idxParceiro = dem.fields.findIndex((x) => x.sectionId === 'sec-demanda-parceiro')
  if (idxParceiro >= 0) dem.fields.splice(idxParceiro, 0, ...filaFields)
  else dem.fields.push(...filaFields)

  dem.fields.push(...raerFields, ...snFields)

  // Visibility rules for suporte + ajuste
  dem.fieldVisibilityRules = (dem.fieldVisibilityRules || []).filter(
    (r) => !String(r.id).startsWith('rule-dem-f3-'),
  )
  dem.fieldVisibilityRules.push(
    {
      id: 'rule-dem-f3-suporte-grupo',
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-demanda-tipo',
      sourceKind: 'textOptions',
      expectedOptionText: 'Suporte',
      action: 'show',
      targetFieldIds: [
        'patlasv4proto-demanda-suporte-grupo',
        'patlasv4proto-demanda-suporte-24x7',
      ],
    },
    {
      id: 'rule-dem-f3-ajuste-por',
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-demanda-homolog-ajuste',
      sourceKind: 'boolean',
      expectedBoolean: true,
      action: 'show',
      targetFieldIds: ['patlasv4proto-demanda-homolog-ajuste-por'],
    },
  )

  // Methods — full F3 set
  dem.methods = [
    {
      id: 'method-demanda-ver-andamento',
      name: 'Ver status e próximo passo',
      icon: 'timeline',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-ver-andamento',
      spec: 'Timeline + 2 SLAs + fila.',
    },
    {
      id: 'method-demanda-pre-analise',
      name: 'Pré-análise MTI',
      icon: 'fact_check',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-pre-analise',
      spec: 'R6 · só MTI.',
    },
    {
      id: 'method-demanda-qualificar',
      name: 'Qualificar solução/catálogo/parceiro(s)',
      icon: 'hub',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-qualificar',
      spec: 'R7 · só MTI.',
    },
    {
      id: 'method-demanda-iniciar-analise',
      name: 'Iniciar análise',
      icon: 'play_arrow',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-iniciar-analise',
      spec: 'Tipo Licenciamento|Serviço.',
    },
    {
      id: 'method-demanda-via-contrato',
      name: 'Atendimento via contrato (detalhar)',
      icon: 'assignment',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-via-contrato',
      spec: 'R10 · não inicia execução.',
    },
    {
      id: 'method-demanda-assinar-atendimento',
      name: 'Assinar / devolver atendimento (cliente)',
      icon: 'draw',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-assinar-atendimento',
      spec: 'R10 · gestor/fiscal/solicitante.',
    },
    {
      id: 'method-demanda-orcamento',
      name: 'Enviar para orçamento',
      icon: 'request_quote',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-orcamento',
      spec: 'R11–R12.',
    },
    {
      id: 'method-demanda-parceiro-iniciar',
      name: 'Iniciar / efetivar atendimento (parceiro)',
      icon: 'play_circle',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-parceiro-iniciar',
      spec: 'R9 · sem devolver/recusar.',
    },
    {
      id: 'method-demanda-parceiro-declarar',
      name: 'Declarar atendida (parceiro)',
      icon: 'task_alt',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-parceiro-declarar',
      spec: 'R9.',
    },
    {
      id: 'method-demanda-validar-parceiro',
      name: 'Validar atendimento do parceiro (MTI)',
      icon: 'verified_user',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-validar-parceiro',
      spec: 'R9 → homologação.',
    },
    {
      id: 'method-demanda-autorizar-sn',
      name: 'Autorizar execução → ServiceNow',
      icon: 'cloud_upload',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-autorizar-sn',
      spec: 'R17 · pós-OS; não re-assinar; envia «aprovada e em atendimento».',
    },
    {
      id: 'method-demanda-encerrar-termo',
      name: 'Encerrar atendimento · gerar termo + RAER',
      icon: 'description',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-encerrar-termo',
      spec: 'R18 · avisa cliente; abre preenchimento do termo.',
    },
    {
      id: 'method-demanda-ajuste-termo',
      name: 'Solicitar ajuste no termo',
      icon: 'edit_note',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-ajuste-termo',
      spec: 'R18 · cliente ou MTI.',
    },
    {
      id: 'method-demanda-devolver',
      name: 'Devolver para correção',
      icon: 'undo',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-devolver',
      spec: 'Só MTI.',
    },
    {
      id: 'method-demanda-recusar',
      name: 'Recusar demanda',
      icon: 'cancel',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-recusar',
      spec: 'Só MTI.',
    },
  ]

  // Method forms new
  upsert(forms, {
    id: 'form-patlasv4-proto-metodo-demanda-autorizar-sn',
    name: 'Demanda — Autorizar execução → ServiceNow',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'R17. Após OS assinada: autoriza execução, liga SLA execução, envia SN.',
    fields: [
      field({
        id: 'patlasv4proto-mdem-sn-alert',
        label: 'Aviso',
        type: 'alert',
        size: 'large',
        readOnly: true,
        relevance: 'highlight',
        alertVariant: 'info',
        alertTitle: 'Sem re-assinatura',
        alertMessage:
          'Cliente já assinou o atendimento/OS. Aqui só autoriza o início da execução e comunica o ServiceNow.',
      }),
      field({
        id: 'patlasv4proto-mdem-sn-os',
        label: 'OS confirmada',
        type: 'text',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdem-sn-confirmar',
        label: 'Autorizar execução e enviar ao ServiceNow',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
    ],
    methods: [],
    exampleValuePresets: [],
    fieldVisibilityRules: [],
  })

  upsert(forms, {
    id: 'form-patlasv4-proto-metodo-demanda-encerrar-termo',
    name: 'Demanda — Encerrar · termo + RAER',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'R18. Modal de termo: itens OS, artefatos, atestação. Depois assinaturas cliente.',
    fields: [
      field({
        id: 'patlasv4proto-mdem-et-alert',
        label: 'Aviso',
        type: 'alert',
        size: 'large',
        readOnly: true,
        relevance: 'highlight',
        alertVariant: 'warning',
        alertTitle: 'Encerramento',
        alertMessage:
          'Avisar cliente da execução → preencher termo (itens OS, modelagem, requisitos, protótipos, o que foi executado) + RAER → enviar a gestor/fiscal/solicitante.',
      }),
      field({
        id: 'patlasv4proto-mdem-et-itens',
        label: 'Itens da OS / atividades do termo',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdem-et-artefatos',
        label: 'Artefatos (modelagem, requisitos, protótipos…)',
        type: 'text',
        size: 'large',
        textLong: true,
      }),
      field({
        id: 'patlasv4proto-mdem-et-executado',
        label: 'O que foi executado / atestado',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
      }),
      field({
        id: 'patlasv4proto-mdem-et-consumo',
        label: 'Consumo real vs estimado',
        type: 'text',
        size: 'large',
        spec: 'Ex.: estimado 2447 · real 2200 — pode gerar evento de ajuste.',
      }),
      field({
        id: 'patlasv4proto-mdem-et-raer',
        label: 'Gerar / vincular RAER',
        type: 'boolean',
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdem-et-enviar',
        label: 'Enviar termo para assinatura (gestor/fiscal/solicitante)',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
    ],
    methods: [],
    exampleValuePresets: [],
    fieldVisibilityRules: [],
  })

  upsert(forms, {
    id: 'form-patlasv4-proto-metodo-demanda-ajuste-termo',
    name: 'Demanda — Solicitar ajuste no termo',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'R18. Cliente ou MTI.',
    fields: [
      field({
        id: 'patlasv4proto-mdem-at-por',
        label: 'Solicitado por',
        type: 'textOptions',
        options: ['Cliente', 'MTI'],
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdem-at-motivo',
        label: 'Motivo do ajuste',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
      }),
    ],
    methods: [],
    exampleValuePresets: [],
    fieldVisibilityRules: [],
  })

  // Presets F3
  const presets = [
    {
      id: 'patlasv4proto-p-demanda-f3-consumo-fila',
      name: 'F3 · Consumo · fila parceria',
      iconColor: '#0F766E',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-0301',
        'patlasv4proto-demanda-status': 'Aguardando análise',
        'patlasv4proto-demanda-tipo': 'Consumo',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-fila-regra': 'Consumo · gerente + titular da parceria',
        'patlasv4proto-demanda-resp-gerente': 'Carlos Gerente Parceria',
        'patlasv4proto-demanda-resp-titular': 'Ana Titular Atendimento',
        'patlasv4proto-demanda-subst-1': 'Pedro Equipe',
        'patlasv4proto-demanda-subst-2': 'Carlos Gerente Parceria',
        'patlasv4proto-demanda-sla-inicio': '2026-09-11',
        'patlasv4proto-demanda-sla-status': 'No prazo',
        'patlasv4proto-demanda-sn-status': 'Não enviado',
        'patlasv4proto-demanda-contrato-natureza': 'Próprio do cliente',
      },
      embeddedRowsByFieldId: {},
    },
    {
      id: 'patlasv4proto-p-demanda-f3-suporte',
      name: 'F3 · Suporte · grupo 24×7',
      iconColor: '#1D5FA8',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-0302',
        'patlasv4proto-demanda-status': 'Aguardando análise',
        'patlasv4proto-demanda-tipo': 'Suporte',
        'patlasv4proto-demanda-fila-regra': 'Suporte · grupo/classe de serviço',
        'patlasv4proto-demanda-suporte-grupo': 'Squad MTI Simplifica · sobreaviso',
        'patlasv4proto-demanda-suporte-24x7': true,
        'patlasv4proto-demanda-sla-inicio': '2026-09-11',
        'patlasv4proto-demanda-sla-prazo': '24 horas',
        'patlasv4proto-demanda-sla-status': 'No prazo',
        'patlasv4proto-demanda-sn-status': 'Não enviado',
      },
      embeddedRowsByFieldId: {},
    },
    {
      id: 'patlasv4proto-p-demanda-f3-sn',
      name: 'F3 · Enviada ServiceNow',
      iconColor: '#15803D',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-0303',
        'patlasv4proto-demanda-status': 'Aprovada · em atendimento',
        'patlasv4proto-demanda-tipo': 'Consumo',
        'patlasv4proto-demanda-os': 'OS-DIG-DEM-2026-0303',
        'patlasv4proto-demanda-sn-status': 'Enviado · aprovada e em atendimento',
        'patlasv4proto-demanda-sn-em': '2026-09-11',
        'patlasv4proto-demanda-sn-id': 'SN-INC-88421',
        'patlasv4proto-demanda-sla-exec-inicio': '2026-09-11',
        'patlasv4proto-demanda-sla-exec-status': 'Em execução',
      },
      embeddedRowsByFieldId: {},
    },
    {
      id: 'patlasv4proto-p-demanda-f3-homolog-raer',
      name: 'F3 · Homologação + RAER',
      iconColor: '#B45309',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-0304',
        'patlasv4proto-demanda-status': 'Aguardando assinatura do termo',
        'patlasv4proto-demanda-homolog-status': 'Aguardando assinatura',
        'patlasv4proto-demanda-raer-status': 'Vinculado ao termo',
        'patlasv4proto-demanda-entregavel-desc': 'Itens OS atestados · consumo 2200 de 2447',
        'patlasv4proto-demanda-sn-status': 'Enviado · aprovada e em atendimento',
      },
      embeddedRowsByFieldId: {},
    },
  ]
  dem.exampleValuePresets = dem.exampleValuePresets || []
  for (const p of presets) {
    const i = dem.exampleValuePresets.findIndex((x) => x.id === p.id)
    if (i >= 0) dem.exampleValuePresets[i] = p
    else dem.exampleValuePresets.push(p)
  }

  // Refresh ver-andamento mapa
  const verAnd = forms.find((x) => x.id === 'form-patlasv4-proto-metodo-demanda-ver-andamento')
  if (verAnd) {
    const m = (verAnd.fields || []).find((x) => x.id === 'patlasv4proto-mdem-and-mapa')
    if (m) m.alertMessage = MAPA
    const s = (verAnd.fields || []).find((x) => x.id === 'patlasv4proto-mdem-and-status')
    if (s) s.options = STATUS
  }

  // Homolog status options expand
  const homolog = dem.fields.find((x) => x.id === 'patlasv4proto-demanda-homolog-status')
  if (homolog) {
    homolog.options = [
      'Não iniciado',
      'Em elaboração',
      'Aguardando assinatura',
      'Ajuste solicitado',
      'Assinado',
      'Recusado',
    ]
  }

  fs.writeFileSync(formsPath, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('forms F3 OK')

  // Flows
  const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
  const flow = flows.find((x) => x.id === 'flow-proto-demanda-mti')
  if (flow) {
    flow.name = 'Demanda — Fluxo F3 completo (fontes)'
    flow.description = 'Alinhado a demanda-o-que-foi-dito-e-regras.md (R1–R20).'

    const ensure = (step, afterId) => {
      const i = flow.steps.findIndex((s) => s.id === step.id)
      if (i >= 0) {
        flow.steps[i] = { ...flow.steps[i], ...step }
        return
      }
      const a = flow.steps.findIndex((s) => s.id === afterId)
      if (a >= 0) flow.steps.splice(a + 1, 0, step)
      else flow.steps.push(step)
    }

    ensure(
      {
        id: 'step-mti-fila-roteamento',
        title: '5c. Fila — consumo×suporte / responsáveis',
        type: 'activity',
        assigneeRole: 'MTI',
        bpmnDescription:
          'Consumo: gerente+titular parceria. Suporte: grupo/classe. Substituto 2=gerente.',
        bpmnRuleList: [
          'R16 roteamento por tipo',
          'Responsáveis definidos no contrato/parceria',
        ],
      },
      'step-mti-qualificar',
    )

    ensure(
      {
        id: 'step-mti-autorizar-sn',
        title: '8c. Autorizar execução → ServiceNow',
        type: 'method',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-autorizar-sn',
        assigneeRole: 'MTI',
        bpmnDescription: 'R17. Sem re-assinatura. Status SN: aprovada e em atendimento.',
        classMethodNavigateStepIds: {
          'method-demanda-autorizar-sn': 'step-mti-autorizar-sn',
        },
      },
      'step-mti-fim-atendimento',
    )

    ensure(
      {
        id: 'step-mti-encerrar-termo',
        title: '8d. Encerrar · termo + RAER',
        type: 'method',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-encerrar-termo',
        assigneeRole: 'MTI',
        bpmnDescription: 'R18. Gera termo+RAER; envia assinaturas cliente.',
        classMethodNavigateStepIds: {
          'method-demanda-encerrar-termo': 'step-mti-encerrar-termo',
        },
        bpmnPossiblePaths: [
          { key: 'Assinatura termo', value: 'step-mti-homologacao' },
        ],
      },
      'step-mti-autorizar-sn',
    )

    const visao = flow.steps.find((s) => s.id === 'step-mti-visao')
    if (visao) visao.bpmnDescription = MAPA

    const reg = flow.steps.find((s) => s.id === 'step-mti-registro')
    if (reg) {
      reg.classMethodNavigateStepIds = {
        ...(reg.classMethodNavigateStepIds || {}),
        'method-demanda-autorizar-sn': 'step-mti-autorizar-sn',
        'method-demanda-encerrar-termo': 'step-mti-encerrar-termo',
        'method-demanda-ajuste-termo': 'step-mti-encerrar-termo',
      }
    }
  }

  fs.writeFileSync(flowsPath, `${JSON.stringify(flows, null, 2)}\n`, 'utf8')
  console.log('flows F3 OK')
}

main()
