/**
 * Demanda — implementação do fluxo completo (docs/fluxo-demanda-completo.md).
 * Fontes: Discovery 09/09 + calls recentes.
 *
 * Uso: node scripts/patch-demanda-fluxo-completo.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const formsPath = path.join(EPIC, 'forms.json')
const flowsPath = path.join(EPIC, 'flows.json')
const FORM = 'form-patlasv4-proto-demanda'

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
  'Em homologação',
  'Dilatação de prazo',
  'Recusada',
  'Não autorizada',
  'Efetivado · entregue',
  'Aprovada · em atendimento',
]

const MAPA =
  'Abertura (SLA inicia) → [Hierarquia N2?] → Pré-análise MTI → Gateway (auto|Qualificar) → ' +
  'A) Parceiro: efetivar → declarar → validar MTI → homologação · ' +
  'B) Parecer: Via contrato (detalhar→assinaturas gestor/fiscal/solicitante→atendimento+OS) | Orçamento | Devolver | Recusar'

/** @type {Record<string, { etapa: string, proximo: string, caminhos: string, alertTitle: string, alertMessage: string, variant: string, estagio: number }>} */
const STATUS_MAP = {
  'Aguardando gestor': {
    etapa: '2. Hierarquia do cliente',
    proximo: 'Pré-análise MTI se aprovar',
    caminhos: 'Aprovar · Devolver · Recusar',
    alertTitle: 'Aguardando gestor/fiscal',
    alertMessage: 'SLA já conta desde a abertura.',
    variant: 'warning',
    estagio: 2,
  },
  'Aguardando pré-análise MTI': {
    etapa: '3. Pré-análise MTI',
    proximo: 'Gateway de enquadramento',
    caminhos: 'Aprovar · Devolver · Recusar (só MTI)',
    alertTitle: 'Pré-análise MTI',
    alertMessage: 'Parceiro ainda não age.',
    variant: 'info',
    estagio: 3,
  },
  'Aguardando análise': {
    etapa: '4. Pronta para análise',
    proximo: 'Iniciar análise ou parceiro efetivar',
    caminhos: 'Iniciar análise · Qualificar · Parceiro iniciar',
    alertTitle: 'Aguardando análise',
    alertMessage: 'Enquadramento ok.',
    variant: 'info',
    estagio: 4,
  },
  'Aguardando parceiro': {
    etapa: '4b. Parceiro notificado',
    proximo: 'Parceiro inicia/efetiva atendimento',
    caminhos: 'Iniciar/efetivar → Em atendimento · parceiro',
    alertTitle: 'Aguardando parceiro',
    alertMessage: 'Análise do parceiro = efetivação, não parecer.',
    variant: 'warning',
    estagio: 4,
  },
  'Em análise': {
    etapa: '5. Parecer MTI',
    proximo: 'Via contrato · Orçamento · Devolver · Recusar',
    caminhos: 'Métodos primários pós-qualificação',
    alertTitle: 'Em análise',
    alertMessage: 'Devolver/Recusar só MTI. Tipo Licenciamento|Serviço altera campos.',
    variant: 'info',
    estagio: 5,
  },
  'Aguardando assinatura do atendimento': {
    etapa: '5b. Via contrato — assinaturas',
    proximo: 'Gestor, fiscal e solicitante assinam ou devolvem',
    caminhos: 'Assinar → Atendimento+OS · Devolver → correção',
    alertTitle: 'Aguardando assinatura do atendimento',
    alertMessage:
      'Atendimento via contrato detalhado. Antes de contabilizar execução: assinaturas do gestor, fiscal e solicitante.',
    variant: 'warning',
    estagio: 5,
  },
  'Em atendimento · parceiro': {
    etapa: '6. Efetivação parceiro',
    proximo: 'Declarar atendida → validação MTI',
    caminhos: 'Declarar atendida',
    alertTitle: 'Parceiro em atendimento',
    alertMessage: 'Relógio de execução ativo.',
    variant: 'info',
    estagio: 6,
  },
  'Aguardando validação MTI': {
    etapa: '7. Validação MTI',
    proximo: 'Homologação',
    caminhos: 'Validar · Devolver · Recusar',
    alertTitle: 'Validação MTI',
    alertMessage: 'MTI gestora avalia efetivação do parceiro.',
    variant: 'warning',
    estagio: 7,
  },
  'Devolvida para correção': {
    etapa: 'Ciclo — devolvida',
    proximo: 'Cliente corrige e reenvia',
    caminhos: 'Reenvio → pré-análise / análise',
    alertTitle: 'Devolvida',
    alertMessage: 'Ex.: quantidade divergente (10 vs 5).',
    variant: 'warning',
    estagio: 2,
  },
  'Aguardando autorização': {
    etapa: '8a. Autorização portal (orçamento/legado)',
    proximo: 'Cliente autoriza → OS',
    caminhos: 'Autorizar · Não autorizar',
    alertTitle: 'Aguardando autorização',
    alertMessage: 'Fronteira do portal após orçamento aceito.',
    variant: 'warning',
    estagio: 8,
  },
  'Em orçamento': {
    etapa: 'Agenda — Orçamento',
    proximo: 'Proposta → assinaturas → OS → gerente operação',
    caminhos: 'Sem contrato: stub definir pagamento (indenização×contratar) — futuro CRM',
    alertTitle: 'Em orçamento',
    alertMessage: 'Cadeia sob demanda. Proposta portal sem contrato = fora deste momento.',
    variant: 'warning',
    estagio: 5,
  },
  'Em homologação': {
    etapa: '8. Termo de homologação',
    proximo: 'Assinar → Efetivado',
    caminhos: 'Comprovações no termo',
    alertTitle: 'Homologação',
    alertMessage: 'Entregável + assinatura.',
    variant: 'info',
    estagio: 8,
  },
  'Dilatação de prazo': {
    etapa: 'Evento — dilatação',
    proximo: 'CRI + parceiro + cliente',
    caminhos: 'Autorizado → retoma',
    alertTitle: 'Dilatação',
    alertMessage: 'Prazo OS estourou.',
    variant: 'error',
    estagio: 6,
  },
  Recusada: {
    etapa: 'Fim — Recusada',
    proximo: '—',
    caminhos: 'Só MTI/gestor',
    alertTitle: 'Recusada',
    alertMessage: 'Encerrado.',
    variant: 'error',
    estagio: 9,
  },
  'Não autorizada': {
    etapa: 'Fim — Não autorizada',
    proximo: '—',
    caminhos: 'Cliente',
    alertTitle: 'Não autorizada',
    alertMessage: 'Fim portal.',
    variant: 'error',
    estagio: 9,
  },
  'Efetivado · entregue': {
    etapa: '9. Efetivado',
    proximo: '—',
    caminhos: 'Homologado',
    alertTitle: 'Efetivado · entregue',
    alertMessage: 'Termo assinado.',
    variant: 'success',
    estagio: 9,
  },
  'Aprovada · em atendimento': {
    etapa: '6/8. Em atendimento',
    proximo: 'Execução · OS · homologação',
    caminhos: 'Parceiro/MTI conforme rito',
    alertTitle: 'Em atendimento',
    alertMessage: 'Pós-assinatura / autorização.',
    variant: 'success',
    estagio: 6,
  },
}

function slug(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function field(partial) {
  return {
    size: 'medium',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'common',
    ...partial,
  }
}

function upsert(forms, form) {
  const i = forms.findIndex((x) => x.id === form.id)
  if (i >= 0) forms[i] = form
  else forms.push(form)
}

function fillAndamento(fv) {
  const status = fv['patlasv4proto-demanda-status']
  const meta = STATUS_MAP[status]
  fv['patlasv4proto-demanda-andamento-status-leitura'] = status || ''
  if (!meta) {
    fv['patlasv4proto-demanda-andamento-etapa'] = ''
    fv['patlasv4proto-demanda-andamento-proximo'] = ''
    fv['patlasv4proto-demanda-andamento-caminhos'] = ''
    fv['patlasv4proto-demanda-andamento-timeline'] = ''
    return
  }
  fv['patlasv4proto-demanda-andamento-etapa'] = meta.etapa
  fv['patlasv4proto-demanda-andamento-proximo'] = meta.proximo
  fv['patlasv4proto-demanda-andamento-caminhos'] = meta.caminhos
  fv['patlasv4proto-demanda-andamento-timeline'] = `Estágio ${meta.estagio} de 9 · ${meta.etapa}`
}

function main() {
  const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
  const dem = forms.find((x) => x.id === FORM)
  if (!dem) throw new Error('Demanda não encontrada')

  dem.metadata =
    'Fluxo completo Demanda (docs/fluxo-demanda-completo.md). Discovery 09/09 + calls. ' +
    'SLA na abertura; via contrato: detalhar→assinaturas gestor/fiscal/solicitante→atendimento+OS; ' +
    'parceiro efetivar→validar MTI→homologação; orçamento adjacente; proposta portal sem contrato = fora.'

  // Status options
  const st = dem.fields.find((x) => x.id === 'patlasv4proto-demanda-status')
  if (st) st.options = STATUS

  // Ensure sections
  const wantSections = [
    { id: 'sec-demanda-andamento', title: 'Status e andamento', icon: 'timeline' },
    { id: 'sec-demanda-identificacao', title: 'Identificação', icon: 'badge' },
    { id: 'sec-demanda-necessidade', title: 'Necessidade', icon: 'description' },
    { id: 'sec-demanda-parceiro', title: 'Parceiro / roteamento', icon: 'handshake' },
    { id: 'sec-demanda-analise-tipo', title: 'Análise · tipo', icon: 'category' },
    { id: 'sec-demanda-atendimento', title: 'Atendimento', icon: 'assignment' },
    { id: 'sec-demanda-assinaturas', title: 'Assinaturas via contrato', icon: 'draw' },
    { id: 'sec-demanda-entregavel', title: 'Entregável / homologação', icon: 'verified' },
    { id: 'sec-demanda-os-orc', title: 'OS / Orçamento (futuro)', icon: 'receipt_long' },
    { id: 'sec-demanda-historico', title: 'Histórico', icon: 'history' },
  ]
  dem.sections = wantSections

  // Strip rebuildable prefixes then re-add
  const rebuild = [
    'patlasv4proto-demanda-andamento',
    'patlasv4proto-demanda-alert-status-',
    'patlasv4proto-demanda-contrato-natureza',
    'patlasv4proto-demanda-sla-exec',
    'patlasv4proto-demanda-assina-',
    'patlasv4proto-demanda-via-nec',
    'patlasv4proto-demanda-via-valores',
    'patlasv4proto-demanda-definir-pagamento',
  ]
  dem.fields = (dem.fields || []).filter((f) => !rebuild.some((p) => String(f.id).startsWith(p)))

  // Natureza do contrato (após contrato)
  const idxCtr = dem.fields.findIndex((x) => x.id === 'patlasv4proto-demanda-contrato')
  const natureza = field({
    id: 'patlasv4proto-demanda-contrato-natureza',
    label: 'Natureza do contrato',
    type: 'textOptions',
    sectionId: 'sec-demanda-necessidade',
    options: ['Próprio do cliente', 'Patrocinado (gestão)', 'Sem contrato'],
    relevance: 'highlight',
    spec: 'Próprio ou patrocinado permitem demanda. Sem contrato → orçamento/proposta (fora do núcleo agora).',
  })
  if (idxCtr >= 0) dem.fields.splice(idxCtr + 1, 0, natureza)
  else dem.fields.push(natureza)

  // Andamento block
  const andamento = [
    field({
      id: 'patlasv4proto-demanda-andamento-mapa',
      label: 'Mapa do fluxo',
      type: 'alert',
      size: 'large',
      readOnly: true,
      sectionId: 'sec-demanda-andamento',
      relevance: 'highlight',
      alertVariant: 'info',
      alertTitle: 'Fluxo Demanda completo',
      alertMessage: MAPA,
    }),
    field({
      id: 'patlasv4proto-demanda-andamento-timeline',
      label: 'Linha do tempo (estágio)',
      type: 'text',
      size: 'large',
      readOnly: true,
      sectionId: 'sec-demanda-andamento',
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demanda-andamento-status-leitura',
      label: 'Status no fluxo atual',
      type: 'text',
      readOnly: true,
      sectionId: 'sec-demanda-andamento',
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demanda-andamento-etapa',
      label: 'Etapa atual',
      type: 'text',
      size: 'large',
      readOnly: true,
      sectionId: 'sec-demanda-andamento',
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demanda-andamento-proximo',
      label: 'Próximo passo (para frente)',
      type: 'text',
      size: 'large',
      readOnly: true,
      sectionId: 'sec-demanda-andamento',
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demanda-andamento-caminhos',
      label: 'Caminhos possíveis',
      type: 'text',
      size: 'large',
      readOnly: true,
      textLong: true,
      sectionId: 'sec-demanda-andamento',
    }),
    field({
      id: 'patlasv4proto-demanda-sla-inicio',
      label: 'SLA demanda · iniciado em',
      type: 'date',
      size: 'small',
      readOnly: true,
      sectionId: 'sec-demanda-andamento',
      relevance: 'highlight',
      spec: 'Na abertura o tempo já conta (consumo e suporte).',
    }),
    field({
      id: 'patlasv4proto-demanda-sla-prazo',
      label: 'Prazo SLA declarado',
      type: 'text',
      size: 'small',
      readOnly: true,
      sectionId: 'sec-demanda-andamento',
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demanda-sla-status',
      label: 'Status do SLA (demanda)',
      type: 'textOptions',
      readOnly: true,
      sectionId: 'sec-demanda-andamento',
      options: ['No prazo', 'Em risco', 'Estourado', 'Dilatado'],
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demanda-sla-exec-inicio',
      label: 'SLA execução · iniciado em',
      type: 'date',
      size: 'small',
      readOnly: true,
      sectionId: 'sec-demanda-andamento',
      spec: 'Só após assinaturas do atendimento via contrato (ou start parceiro).',
    }),
    field({
      id: 'patlasv4proto-demanda-sla-exec-status',
      label: 'Status SLA execução',
      type: 'textOptions',
      readOnly: true,
      sectionId: 'sec-demanda-andamento',
      options: ['Não iniciado', 'Em execução', 'No prazo', 'Estourado', 'Dilatado'],
    }),
  ]

  const alertIds = []
  for (const [status, meta] of Object.entries(STATUS_MAP)) {
    const id = `patlasv4proto-demanda-alert-status-${slug(status)}`
    alertIds.push({ status, id })
    andamento.push(
      field({
        id,
        label: `Andamento · ${status}`,
        type: 'alert',
        size: 'large',
        readOnly: true,
        hidden: true,
        sectionId: 'sec-demanda-andamento',
        alertVariant: meta.variant,
        alertTitle: meta.alertTitle,
        alertMessage: `${meta.alertMessage}\n\nEstágio ${meta.estagio}/9\n${meta.etapa}\n→ ${meta.proximo}\n${meta.caminhos}`,
      }),
    )
  }

  // Via contrato accounting fields on Atendimento
  const viaExtra = [
    field({
      id: 'patlasv4proto-demanda-via-nec',
      label: 'NEC / necessidade (via contrato)',
      type: 'text',
      size: 'large',
      textLong: true,
      sectionId: 'sec-demanda-atendimento',
      spec: 'Conforme tipo da demanda — detalhado ao iniciar via contrato.',
    }),
    field({
      id: 'patlasv4proto-demanda-via-valores',
      label: 'Valores / contabilidade do contrato',
      type: 'text',
      size: 'large',
      textLong: true,
      sectionId: 'sec-demanda-atendimento',
      spec: 'Snapshot contabilizado conforme contrato no momento do parecer.',
    }),
  ]

  // Assinaturas section
  const assina = [
    field({
      id: 'patlasv4proto-demanda-assina-alerta',
      label: 'Rito de assinatura',
      type: 'alert',
      size: 'large',
      readOnly: true,
      sectionId: 'sec-demanda-assinaturas',
      alertVariant: 'warning',
      alertTitle: 'Antes de iniciar o atendimento',
      alertMessage:
        'Via contrato: detalhar → enviar a gestor, fiscal e solicitante. Só após assinatura começa a execução/SLA de execução. Podem devolver (ex. quantidade divergente).',
    }),
    field({
      id: 'patlasv4proto-demanda-assina-gestor',
      label: 'Assinatura · gestor (cliente)',
      type: 'boolean',
      sectionId: 'sec-demanda-assinaturas',
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demanda-assina-fiscal',
      label: 'Assinatura · fiscal (cliente)',
      type: 'boolean',
      sectionId: 'sec-demanda-assinaturas',
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demanda-assina-solicitante',
      label: 'Assinatura · solicitante',
      type: 'boolean',
      sectionId: 'sec-demanda-assinaturas',
      relevance: 'highlight',
    }),
    field({
      id: 'patlasv4proto-demanda-assina-em',
      label: 'Assinaturas concluídas em',
      type: 'date',
      size: 'small',
      readOnly: true,
      sectionId: 'sec-demanda-assinaturas',
    }),
  ]

  // Definir pagamento stub in OS/orc
  const definirPag = field({
    id: 'patlasv4proto-demanda-definir-pagamento',
    label: 'Definir pagamento (sem contrato)',
    type: 'textOptions',
    sectionId: 'sec-demanda-os-orc',
    options: [
      '— (há contrato)',
      'Indenização',
      'Nova contratação',
      'Desistiu',
    ],
    spec: 'Stub call recente. CRM/proposta portal = futuro. Só quando natureza = Sem contrato.',
  })

  dem.fields = [...andamento, ...dem.fields, ...viaExtra, ...assina, definirPag]

  // Visibility
  dem.fieldVisibilityRules = (dem.fieldVisibilityRules || []).filter(
    (r) =>
      !String(r.id).startsWith('rule-dem-andamento-') &&
      !String(r.id).startsWith('rule-dem-fluxo-'),
  )
  for (const { status, id } of alertIds) {
    dem.fieldVisibilityRules.push({
      id: `rule-dem-andamento-${slug(status)}`,
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-demanda-status',
      sourceKind: 'textOptions',
      expectedOptionText: status,
      action: 'show',
      targetFieldIds: [id],
    })
  }
  dem.fieldVisibilityRules.push({
    id: 'rule-dem-fluxo-definir-pagamento',
    operator: 'eq',
    sourceFieldId: 'patlasv4proto-demanda-contrato-natureza',
    sourceKind: 'textOptions',
    expectedOptionText: 'Sem contrato',
    action: 'show',
    targetFieldIds: ['patlasv4proto-demanda-definir-pagamento'],
  })

  // Methods — ordem do fluxo completo
  dem.methods = [
    {
      id: 'method-demanda-ver-andamento',
      name: 'Ver status e próximo passo',
      icon: 'timeline',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-ver-andamento',
      spec: 'Timeline + SLA demanda/execução.',
    },
    {
      id: 'method-demanda-pre-analise',
      name: 'Pré-análise MTI',
      icon: 'fact_check',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-pre-analise',
      spec: 'Exclusivo MTI.',
    },
    {
      id: 'method-demanda-qualificar',
      name: 'Qualificar solução/catálogo/parceiro(s)',
      icon: 'hub',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-qualificar',
      spec: 'Exclusivo MTI. IA sugere; MTI decide.',
    },
    {
      id: 'method-demanda-iniciar-analise',
      name: 'Iniciar análise',
      icon: 'play_arrow',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-iniciar-analise',
      spec: 'MTI. Tipo Licenciamento|Serviço.',
    },
    {
      id: 'method-demanda-via-contrato',
      name: 'Atendimento via contrato (detalhar)',
      icon: 'assignment',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-via-contrato',
      spec: 'Detalha catálogo/NEC/valores → envia a assinaturas. Ainda NÃO inicia execução.',
    },
    {
      id: 'method-demanda-assinar-atendimento',
      name: 'Assinar / devolver atendimento (cliente)',
      icon: 'draw',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-assinar-atendimento',
      spec: 'Gestor, fiscal e solicitante. Assinar → inicia atendimento+OS; devolver → correção.',
    },
    {
      id: 'method-demanda-orcamento',
      name: 'Enviar para orçamento',
      icon: 'request_quote',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-orcamento',
      spec: 'Sob demanda. Sem contrato: stub definir pagamento.',
    },
    {
      id: 'method-demanda-parceiro-iniciar',
      name: 'Iniciar / efetivar atendimento (parceiro)',
      icon: 'play_circle',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-parceiro-iniciar',
      spec: 'Parceiro. Sem devolver/recusar.',
    },
    {
      id: 'method-demanda-parceiro-declarar',
      name: 'Declarar atendida (parceiro)',
      icon: 'task_alt',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-parceiro-declarar',
      spec: 'Entregável + comprovações → validação MTI.',
    },
    {
      id: 'method-demanda-validar-parceiro',
      name: 'Validar atendimento do parceiro (MTI)',
      icon: 'verified_user',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-validar-parceiro',
      spec: '→ Homologação.',
    },
    {
      id: 'method-demanda-devolver',
      name: 'Devolver para correção',
      icon: 'undo',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-devolver',
      spec: 'Somente MTI.',
    },
    {
      id: 'method-demanda-recusar',
      name: 'Recusar demanda',
      icon: 'cancel',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-recusar',
      spec: 'Somente MTI.',
    },
  ]

  for (const p of dem.exampleValuePresets || []) {
    fillAndamento(p.fieldValues || (p.fieldValues = {}))
  }

  // Preset assinatura
  const presetAssina = {
    id: 'patlasv4proto-p-demanda-aguardando-assinatura',
    name: 'Via contrato · aguardando assinaturas',
    iconColor: '#B45309',
    fieldValues: {
      'patlasv4proto-demanda-numero': 'DEM-2026-0201',
      'patlasv4proto-demanda-status': 'Aguardando assinatura do atendimento',
      'patlasv4proto-demanda-origem': 'Cliente',
      'patlasv4proto-demanda-tipo': 'Consumo',
      'patlasv4proto-demanda-contrato-natureza': 'Próprio do cliente',
      'patlasv4proto-demanda-catalogos': 'Catálogo licenciamento',
      'patlasv4proto-demanda-itens': 'Licença órgão × 10',
      'patlasv4proto-demanda-via-nec': 'Disponibilizar 10 contas',
      'patlasv4proto-demanda-via-valores': 'Consumo provisionado conforme saldo do contrato',
      'patlasv4proto-demanda-assina-gestor': false,
      'patlasv4proto-demanda-assina-fiscal': false,
      'patlasv4proto-demanda-assina-solicitante': false,
      'patlasv4proto-demanda-sla-inicio': '2026-09-11',
      'patlasv4proto-demanda-sla-status': 'No prazo',
      'patlasv4proto-demanda-sla-exec-status': 'Não iniciado',
      'patlasv4proto-demanda-tipo-analise': 'Licenciamento',
    },
    embeddedRowsByFieldId: {},
  }
  fillAndamento(presetAssina.fieldValues)
  dem.exampleValuePresets = dem.exampleValuePresets || []
  const pi = dem.exampleValuePresets.findIndex((p) => p.id === presetAssina.id)
  if (pi >= 0) dem.exampleValuePresets[pi] = presetAssina
  else dem.exampleValuePresets.push(presetAssina)

  // --- Method forms ---
  upsert(forms, {
    id: 'form-patlasv4-proto-metodo-demanda-via-contrato',
    name: 'Demanda — Atendimento via contrato (detalhar)',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Detalha atendimento. NÃO inicia execução. Em seguida: assinaturas gestor/fiscal/solicitante.',
    fields: [
      field({
        id: 'patlasv4proto-mdem-ctr-alert',
        label: 'Aviso',
        type: 'alert',
        size: 'large',
        readOnly: true,
        relevance: 'highlight',
        alertVariant: 'warning',
        alertTitle: 'Via contrato — detalhar antes de assinar',
        alertMessage:
          'Campos conforme tipo (catálogo, descrição, NEC, valores) + contabilidade do contrato. Após confirmar, status → Aguardando assinatura do atendimento. SLA de execução só depois das assinaturas.',
      }),
      field({
        id: 'patlasv4proto-mdem-ctr-tipo',
        label: 'Tipo na análise',
        type: 'textOptions',
        options: ['Licenciamento', 'Serviço'],
        relevance: 'highlight',
        required: true,
      }),
      field({
        id: 'patlasv4proto-mdem-ctr-catalogos',
        label: 'Catálogos de produtos',
        type: 'text',
        size: 'large',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdem-ctr-itens',
        label: 'Itens do catálogo',
        type: 'text',
        size: 'large',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdem-ctr-nec',
        label: 'NEC / necessidade detalhada',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
      }),
      field({
        id: 'patlasv4proto-mdem-ctr-valores',
        label: 'Valores / contabilidade do contrato',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
        spec: 'Snapshot do saldo/consumo/provisionamento conforme contrato.',
      }),
      field({
        id: 'patlasv4proto-mdem-ctr-desc',
        label: 'Descrição do atendimento',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
      }),
      field({
        id: 'patlasv4proto-mdem-ctr-sla',
        label: 'Prazo / SLA de execução previsto',
        type: 'text',
        size: 'small',
        spec: 'Ex.: 24h ou 21 dias — começa a contar só após assinaturas.',
      }),
      field({
        id: 'patlasv4proto-mdem-ctr-os',
        label: 'OS a vincular (se houver)',
        type: 'text',
        size: 'small',
        spec: 'Vincular existente ou criar após assinatura. Vigência OS ≤ contrato.',
      }),
      field({
        id: 'patlasv4proto-mdem-ctr-anexos',
        label: 'Anexos',
        type: 'file',
        multiple: true,
      }),
      field({
        id: 'patlasv4proto-mdem-ctr-enviar',
        label: 'Enviar para assinaturas (gestor/fiscal/solicitante)',
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
    id: 'form-patlasv4-proto-metodo-demanda-assinar-atendimento',
    name: 'Demanda — Assinar / devolver atendimento (cliente)',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'Gestor, fiscal e solicitante. Assinar inicia atendimento+OS; devolver com motivo.',
    fields: [
      field({
        id: 'patlasv4proto-mdem-aa-alert',
        label: 'Aviso',
        type: 'alert',
        size: 'large',
        readOnly: true,
        relevance: 'highlight',
        alertVariant: 'info',
        alertTitle: 'Assinatura do atendimento via contrato',
        alertMessage:
          'Revise catálogo, NEC, valores e quantidade. Divergência (ex. 10 pedidos vs 5 na OS) → devolver.',
      }),
      field({
        id: 'patlasv4proto-mdem-aa-papel',
        label: 'Seu papel',
        type: 'textOptions',
        options: ['Gestor', 'Fiscal', 'Solicitante'],
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdem-aa-decisao',
        label: 'Decisão',
        type: 'textOptions',
        options: ['Assinar', 'Devolver para correção'],
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdem-aa-motivo',
        label: 'Motivo (devolver)',
        type: 'text',
        size: 'large',
        textLong: true,
      }),
      field({
        id: 'patlasv4proto-mdem-aa-os-acao',
        label: 'OS após assinatura',
        type: 'textOptions',
        options: ['Vincular OS existente', 'Criar nova OS', 'Autorizar consumo em OS existente'],
        spec: 'Controle de vida/saldo/consumo. Sem OS não remove obrigação de pagamento no consumo.',
      }),
      field({
        id: 'patlasv4proto-mdem-aa-confirmar',
        label: 'Confirmar assinatura digital',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
    ],
    methods: [],
    exampleValuePresets: [],
    fieldVisibilityRules: [
      {
        id: 'rule-mdem-aa-motivo',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-mdem-aa-decisao',
        sourceKind: 'textOptions',
        expectedOptionText: 'Devolver para correção',
        action: 'show',
        targetFieldIds: ['patlasv4proto-mdem-aa-motivo'],
      },
    ],
  })

  // Orçamento — stub definir pagamento
  const orc = forms.find((x) => x.id === 'form-patlasv4-proto-metodo-demanda-orcamento')
  if (orc) {
    orc.metadata =
      'Orçamento de consumo. Sem contrato: opção definir pagamento (indenização×contratar) — stub; CRM/proposta portal fora.'
    orc.fields = [
      field({
        id: 'patlasv4proto-mdem-orc-alert',
        label: 'Aviso',
        type: 'alert',
        size: 'large',
        readOnly: true,
        relevance: 'highlight',
        alertVariant: 'info',
        alertTitle: 'Enviar para orçamento',
        alertMessage:
          'Cadeia: proposta → cliente + gerente área → OS → gerente operação assina → execução. Sem contrato no portal para contratar = funcionalidade futura.',
      }),
      field({
        id: 'patlasv4proto-mdem-orc-tem-contrato',
        label: 'Há contrato informado?',
        type: 'boolean',
        relevance: 'highlight',
        required: true,
      }),
      field({
        id: 'patlasv4proto-mdem-orc-definir-pagamento',
        label: 'Definir pagamento (sem contrato)',
        type: 'textOptions',
        options: ['Indenização', 'Nova contratação', 'Ainda não definido'],
        hidden: true,
        spec: 'Stub. Não gera CRM/tarefa neste momento.',
      }),
      field({
        id: 'patlasv4proto-mdem-orc-obs',
        label: 'Observação',
        type: 'text',
        size: 'large',
        textLong: true,
      }),
    ]
    orc.fieldVisibilityRules = [
      {
        id: 'rule-mdem-orc-pagamento',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-mdem-orc-tem-contrato',
        sourceKind: 'boolean',
        expectedBoolean: false,
        action: 'show',
        targetFieldIds: ['patlasv4proto-mdem-orc-definir-pagamento'],
      },
    ]
  }

  // Ver andamento — refresh mapa
  const verAnd = forms.find((x) => x.id === 'form-patlasv4-proto-metodo-demanda-ver-andamento')
  if (verAnd) {
    const mapa = (verAnd.fields || []).find((x) => x.id === 'patlasv4proto-mdem-and-mapa')
    if (mapa) mapa.alertMessage = MAPA
    const stF = (verAnd.fields || []).find((x) => x.id === 'patlasv4proto-mdem-and-status')
    if (stF) stF.options = STATUS
  }

  fs.writeFileSync(formsPath, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('forms OK')

  // Flows
  const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
  const flow = flows.find((x) => x.id === 'flow-proto-demanda-mti')
  if (flow) {
    flow.name = 'Demanda — Fluxo completo (Projeto Atlas)'
    flow.description = 'Alinhado a docs/fluxo-demanda-completo.md'

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

    // Update via contrato step
    const via = flow.steps.find((s) => s.id === 'step-mti-via-contrato')
    if (via) {
      via.title = '7a. Via contrato — detalhar'
      via.bpmnDescription =
        'Detalha catálogo/NEC/valores/contabilidade. Envia para assinaturas. Não inicia execução ainda.'
      via.bpmnPossiblePaths = [
        { key: 'Assinaturas', value: 'step-mti-assinar-atendimento' },
      ]
      via.classMethodNavigateStepIds = {
        ...(via.classMethodNavigateStepIds || {}),
        'method-demanda-via-contrato': 'step-mti-via-contrato',
      }
    }

    ensure(
      {
        id: 'step-mti-assinar-atendimento',
        title: '7a2. Assinaturas do atendimento (gestor/fiscal/solicitante)',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-assinar-atendimento',
        bpmnActivityKey: 'demanda.cliente.assinarAtendimento',
        bpmnTaskType: 'userTask',
        assigneeRole: 'Cliente',
        bpmnDescription:
          'Portal: gestor, fiscal e solicitante assinam ou devolvem. Após assinar → atendimento + OS; SLA execução inicia.',
        bpmnRuleList: [
          'Status prévio: Aguardando assinatura do atendimento',
          'Devolver com motivo (ex. quantidade)',
          'OS: vincular, criar ou autorizar consumo',
        ],
        bpmnPossiblePaths: [
          { key: 'Atendimento', value: 'step-mti-fim-atendimento' },
          { key: 'Devolvida', value: 'step-mti-fim-devolvida' },
        ],
        classMethodNavigateStepIds: {
          'method-demanda-assinar-atendimento': 'step-mti-assinar-atendimento',
        },
      },
      'step-mti-via-contrato',
    )

    const reg = flow.steps.find((s) => s.id === 'step-mti-registro')
    if (reg) {
      reg.classMethodNavigateStepIds = {
        ...(reg.classMethodNavigateStepIds || {}),
        'method-demanda-assinar-atendimento': 'step-mti-assinar-atendimento',
        'method-demanda-via-contrato': 'step-mti-via-contrato',
      }
    }

    const visao = flow.steps.find((s) => s.id === 'step-mti-visao')
    if (visao) visao.bpmnDescription = MAPA

    const parecer = flow.steps.find((s) => s.id === 'step-mti-parecer')
    if (parecer) {
      parecer.bpmnDescription =
        'Métodos primários pós-qualificação: Via contrato · Orçamento · Devolver · Recusar (só MTI).'
    }
  }

  fs.writeFileSync(flowsPath, `${JSON.stringify(flows, null, 2)}\n`, 'utf8')
  console.log('flows OK')
}

main()
