/**
 * Demanda (Atlas Protótipo) — call recente (portal + BO + parceiro).
 *
 * - Linha do tempo de estágios + SLA na abertura
 * - Parceiro: iniciar/efetivar + declarar atendida; MTI valida
 * - Tipo análise Licenciamento | Serviço + entregável → termo homologação
 * - Stub Orçamento → OS → assinaturas (gerente área / operação)
 *
 * Uso: node scripts/patch-demanda-reuniao-call.mjs
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

const MAPA_FLUXO =
  'Abertura (SLA inicia) → [Hierarquia cliente?] → Pré-análise MTI → Gateway (auto | Qualificar) → ' +
  'Parceiro inicia/efetiva atendimento → MTI valida → Entregável/comprovações → Termo homologação · ' +
  'OU Parecer MTI (via contrato | orçamento | devolver | recusar) → [Autorização / OS] → Execução / Fins'

/** @type {Record<string, { etapa: string, proximo: string, caminhos: string, alertTitle: string, alertMessage: string, variant: string, estagio: number, total: number }>} */
const STATUS_MAP = {
  'Aguardando gestor': {
    etapa: '2. Hierarquia do cliente',
    proximo: 'Pré-análise MTI (se gestor/fiscal aprovar)',
    caminhos: 'Aprovar → pré-análise MTI · Devolver → solicitante · Recusar → Recusada',
    alertTitle: 'Aguardando gestor/fiscal (org cliente)',
    alertMessage: 'SLA já conta desde a abertura. Gate N2 na organização cliente.',
    variant: 'warning',
    estagio: 2,
    total: 9,
  },
  'Aguardando pré-análise MTI': {
    etapa: '3. Pré-análise MTI',
    proximo: 'Gateway de enquadramento (auto ou Qualificar)',
    caminhos: 'Aprovar → roteamento · Devolver · Recusar (só MTI)',
    alertTitle: 'Fila MTI — pré-análise',
    alertMessage: 'Exclusivo MTI no Projeto Atlas. Parceiro ainda não age.',
    variant: 'info',
    estagio: 3,
    total: 9,
  },
  'Aguardando análise': {
    etapa: '4. Pronta para análise',
    proximo: 'Iniciar análise MTI ou iniciar atendimento (parceiro se notificado)',
    caminhos: 'Iniciar análise · Qualificar · Parceiro: iniciar/efetivar',
    alertTitle: 'Aguardando análise / atendimento',
    alertMessage: 'Enquadramento ok. Parceiro notificado pode iniciar/efetivar; MTI delibera.',
    variant: 'info',
    estagio: 4,
    total: 9,
  },
  'Aguardando parceiro': {
    etapa: '4b. Parceiro notificado',
    proximo: 'Parceiro inicia/efetiva o atendimento («bater ponto»)',
    caminhos: 'Iniciar/efetivar → Em atendimento · parceiro',
    alertTitle: 'Aguardando parceiro',
    alertMessage: 'Demanda disponível ao parceiro. Análise = início/efetivação, não só parecer.',
    variant: 'warning',
    estagio: 4,
    total: 9,
  },
  'Em análise': {
    etapa: '5. Análise MTI / parecer',
    proximo: 'Parecer ou (com parceria) atendimento parceiro',
    caminhos:
      'Via contrato · Orçamento · Devolver · Recusar (só MTI) · Parceiro: efetivar',
    alertTitle: 'Em análise',
    alertMessage: 'Devolver/Recusar só MTI. Tipo Licenciamento|Serviço altera campos.',
    variant: 'info',
    estagio: 5,
    total: 9,
  },
  'Em atendimento · parceiro': {
    etapa: '6. Execução / efetivação pelo parceiro',
    proximo: 'Parceiro declara atendida → validação MTI',
    caminhos: 'Declarar atendida → Aguardando validação MTI',
    alertTitle: 'Parceiro em atendimento',
    alertMessage: 'Relógio de execução/SLA ativo. Credencial, appliance ou start de serviço.',
    variant: 'info',
    estagio: 6,
    total: 9,
  },
  'Aguardando validação MTI': {
    etapa: '7. MTI valida atendimento do parceiro',
    proximo: 'Homologação / entregável comprobatório',
    caminhos: 'Validar → Em homologação · Devolver · Recusar',
    alertTitle: 'Validação MTI (gestora)',
    alertMessage: 'MTI avalia a efetivação do parceiro antes do termo de homologação.',
    variant: 'warning',
    estagio: 7,
    total: 9,
  },
  'Devolvida para correção': {
    etapa: 'Ciclo — devolvida',
    proximo: 'Cliente corrige e reenvia',
    caminhos: 'Reenvio → pré-análise / análise',
    alertTitle: 'Devolvida',
    alertMessage: 'Fora da fila ativa até o reenvio.',
    variant: 'warning',
    estagio: 2,
    total: 9,
  },
  'Aguardando autorização': {
    etapa: '8a. Autorização no portal do cliente',
    proximo: 'Cliente autoriza → OS / atendimento',
    caminhos: 'Autorizar · Não autorizar',
    alertTitle: 'Aguardando autorização do cliente',
    alertMessage: 'Parecer via contrato ou orçamento aceito.',
    variant: 'warning',
    estagio: 8,
    total: 9,
  },
  'Em orçamento': {
    etapa: 'Agenda — Orçamento de consumo',
    proximo: 'Proposta → assinaturas → OS',
    caminhos:
      'Cliente + gerente área assinam orçamento → gera/autoriza OS → gerente operação assina OS → execução',
    alertTitle: 'Em orçamento (sob demanda)',
    alertMessage:
      'Cadeia: orçamento → aprovação cliente + gerente área → OS → assinatura gerente operação → start.',
    variant: 'warning',
    estagio: 5,
    total: 9,
  },
  'Em homologação': {
    etapa: '8. Termo de homologação',
    proximo: 'Anexar comprovações / assinatura → Efetivado',
    caminhos: 'Assinar termo → Efetivado · entregue',
    alertTitle: 'Homologação do atendimento',
    alertMessage: 'Entregável + comprovações no termo; precisa assinatura.',
    variant: 'info',
    estagio: 8,
    total: 9,
  },
  'Dilatação de prazo': {
    etapa: 'Evento — dilatação',
    proximo: 'Autorização CRI + parceiro + cliente',
    caminhos: 'Autorizado → retoma execução/homologação',
    alertTitle: 'Dilatação de prazo',
    alertMessage: 'Prazo da OS estourou. Evento tripartite antes de seguir.',
    variant: 'error',
    estagio: 6,
    total: 9,
  },
  Recusada: {
    etapa: 'Fim — Recusada',
    proximo: '—',
    caminhos: 'Sem avanço automático',
    alertTitle: 'Recusada',
    alertMessage: 'Encerrado neste rito (só MTI recusa no BO).',
    variant: 'error',
    estagio: 9,
    total: 9,
  },
  'Não autorizada': {
    etapa: 'Fim — Não autorizada',
    proximo: '—',
    caminhos: 'Cliente não autorizou',
    alertTitle: 'Não autorizada',
    alertMessage: 'Fim após fronteira do portal.',
    variant: 'error',
    estagio: 9,
    total: 9,
  },
  'Efetivado · entregue': {
    etapa: '9. Fim — efetivado',
    proximo: '—',
    caminhos: 'Comprovações no termo de homologação',
    alertTitle: 'Efetivado · entregue',
    alertMessage: 'Atendimento declarado e homologado.',
    variant: 'success',
    estagio: 9,
    total: 9,
  },
  'Aprovada · em atendimento': {
    etapa: '6/8. Em atendimento (esteira OS)',
    proximo: 'Execução · homologação · ServiceNow',
    caminhos: 'Parceiro efetivar · MTI validar · Homologação',
    alertTitle: 'Em atendimento',
    alertMessage: 'Autorizada. Acompanhar execução e SLA.',
    variant: 'success',
    estagio: 6,
    total: 9,
  },
}

function slugStatus(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function f(id, label, type, sectionId, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    sectionId,
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
    ...(opts.alertVariant ? { alertVariant: opts.alertVariant } : {}),
    ...(opts.alertTitle ? { alertTitle: opts.alertTitle } : {}),
    ...(opts.alertMessage ? { alertMessage: opts.alertMessage } : {}),
  }
}

function fillAndamento(fv) {
  const status = fv['patlasv4proto-demanda-status']
  const meta = STATUS_MAP[status]
  fv['patlasv4proto-demanda-andamento-status-leitura'] = status || ''
  fv['patlasv4proto-demanda-andamento-mapa'] = MAPA_FLUXO
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
  fv['patlasv4proto-demanda-andamento-timeline'] =
    `Estágio ${meta.estagio} de ${meta.total} · ${meta.etapa}`
}

function upsertForm(forms, form) {
  const i = forms.findIndex((x) => x.id === form.id)
  if (i >= 0) forms[i] = form
  else forms.push(form)
}

function buildMethodForm(id, name, metadata, fields) {
  return {
    id,
    name,
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata,
    fields,
    methods: [],
    exampleValuePresets: [],
    fieldVisibilityRules: [],
  }
}

function main() {
  const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
  const dem = forms.find((x) => x.id === FORM)
  if (!dem) throw new Error('Demanda não encontrada no Protótipo')

  dem.metadata =
    'Demanda · Atlas Protótipo (call recente + Discovery 09/09). ' +
    'SLA na abertura; timeline compartilhada; parceiro inicia/efetiva e MTI valida; ' +
    'tipo Licenciamento|Serviço → entregável no termo de homologação; ' +
    'orçamento→OS→assinaturas adjacente. Devolver/recusar só MTI.'

  // Sections order
  const keepHist = (dem.sections || []).find((s) => s.id === 'sec-demanda-historico')
  dem.sections = [
    { id: 'sec-demanda-andamento', title: 'Status e andamento', icon: 'timeline' },
    { id: 'sec-demanda-identificacao', title: 'Identificação', icon: 'badge' },
    { id: 'sec-demanda-necessidade', title: 'Necessidade', icon: 'description' },
    { id: 'sec-demanda-parceiro', title: 'Parceiro / roteamento', icon: 'handshake' },
    { id: 'sec-demanda-analise-tipo', title: 'Análise · tipo', icon: 'category' },
    { id: 'sec-demanda-atendimento', title: 'Atendimento', icon: 'assignment' },
    { id: 'sec-demanda-entregavel', title: 'Entregável / homologação', icon: 'verified' },
    { id: 'sec-demanda-os-orc', title: 'OS / Orçamento (futuro)', icon: 'receipt_long' },
    keepHist || { id: 'sec-demanda-historico', title: 'Histórico', icon: 'history' },
  ]

  // Strip fields we rebuild by id prefix
  const stripPrefixes = [
    'patlasv4proto-demanda-andamento',
    'patlasv4proto-demanda-alert-status-',
    'patlasv4proto-demanda-sla-',
    'patlasv4proto-demanda-kpi-',
    'patlasv4proto-demanda-contato-numero',
    'patlasv4proto-demanda-tipo-analise',
    'patlasv4proto-demanda-entregavel',
    'patlasv4proto-demanda-homolog',
    'patlasv4proto-demanda-comp-',
    'patlasv4proto-demanda-orc-',
    'patlasv4proto-demanda-os-',
    'patlasv4proto-demanda-dilat',
    'patlasv4proto-demanda-contrato-nome',
    'patlasv4proto-demanda-contratante',
  ]
  dem.fields = (dem.fields || []).filter(
    (fld) => !stripPrefixes.some((p) => String(fld.id).startsWith(p)),
  )

  // Status options
  const st = dem.fields.find((x) => x.id === 'patlasv4proto-demanda-status')
  if (st) {
    st.options = STATUS
    st.spec =
      'Status do rito completo (hierarquia → MTI → parceiro → homologação / OS). Timeline na aba Status e andamento.'
  }

  // Identificação tweaks
  const contato = dem.fields.find((x) => x.id === 'patlasv4proto-demanda-contato')
  if (contato) {
    contato.label = 'Contato principal'
    contato.readOnly = true
    contato.spec = 'Do usuário logado — bloqueado na abertura (portal/BO).'
  }
  const contatoSec = dem.fields.find((x) => x.id === 'patlasv4proto-demanda-contato-sec')
  if (contatoSec) {
    contatoSec.spec = 'Único editável na abertura; demais campos do logado.'
  }
  const cliente = dem.fields.find((x) => x.id === 'patlasv4proto-demanda-cliente')
  if (cliente) {
    cliente.readOnly = true
    cliente.spec = 'Organização do usuário logado — bloqueado.'
  }
  const dataEv = dem.fields.find((x) => x.id === 'patlasv4proto-demanda-data-evento')
  if (dataEv) {
    dataEv.spec = 'Informada na abertura; padrão = hoje.'
  }

  // Insert contato número after contato principal
  const idxContato = dem.fields.findIndex((x) => x.id === 'patlasv4proto-demanda-contato')
  const campoNumero = f(
    'patlasv4proto-demanda-contato-numero',
    'Número do contato',
    'text',
    'sec-demanda-identificacao',
    {
      readOnly: true,
      size: 'small',
      relevance: 'highlight',
      spec: 'Telefone do usuário logado — bloqueado.',
    },
  )
  if (idxContato >= 0) dem.fields.splice(idxContato + 1, 0, campoNumero)
  else dem.fields.push(campoNumero)

  // KPI + contrato display in Necessidade (after solução)
  const kpiFields = [
    f('patlasv4proto-demanda-contrato-nome', 'Nome do contrato', 'text', 'sec-demanda-necessidade', {
      readOnly: true,
      relevance: 'highlight',
      spec: 'Preenchido ao selecionar a solução (portal).',
    }),
    f('patlasv4proto-demanda-contratante', 'Contratante', 'text', 'sec-demanda-necessidade', {
      readOnly: true,
      spec: 'Do contrato da solução.',
    }),
    f('patlasv4proto-demanda-kpi-saldo', 'Saldo global', 'text', 'sec-demanda-necessidade', {
      readOnly: true,
      size: 'small',
      relevance: 'highlight',
    }),
    f('patlasv4proto-demanda-kpi-os-abertas', 'OSs abertas', 'text', 'sec-demanda-necessidade', {
      readOnly: true,
      size: 'small',
    }),
    f('patlasv4proto-demanda-kpi-provisionado', 'Provisionado', 'text', 'sec-demanda-necessidade', {
      readOnly: true,
      size: 'small',
    }),
    f('patlasv4proto-demanda-kpi-consumo', 'Consumo até o momento', 'text', 'sec-demanda-necessidade', {
      readOnly: true,
      size: 'small',
    }),
    f('patlasv4proto-demanda-kpi-pct', '% execução', 'text', 'sec-demanda-necessidade', {
      readOnly: true,
      size: 'small',
      relevance: 'highlight',
    }),
  ]
  const idxProd = dem.fields.findIndex((x) => x.id === 'patlasv4proto-demanda-produto')
  if (idxProd >= 0) dem.fields.splice(idxProd + 1, 0, ...kpiFields)
  else dem.fields.push(...kpiFields)

  const ctr = dem.fields.find((x) => x.id === 'patlasv4proto-demanda-contrato')
  if (ctr) {
    ctr.readOnly = true
    ctr.spec =
      'Derivado da solução. Bloqueado com opção de edição só na qualificação MTI se ambíguo.'
  }

  // Andamento + SLA
  const andamentoFields = [
    f('patlasv4proto-demanda-andamento-mapa', 'Mapa do fluxo', 'alert', 'sec-demanda-andamento', {
      readOnly: true,
      size: 'large',
      relevance: 'highlight',
      alertVariant: 'info',
      alertTitle: 'Fluxo Demanda (cliente · parceiro · MTI)',
      alertMessage: MAPA_FLUXO,
      spec: 'Visão compartilhada — call recente.',
    }),
    f(
      'patlasv4proto-demanda-andamento-timeline',
      'Linha do tempo (estágio)',
      'text',
      'sec-demanda-andamento',
      {
        readOnly: true,
        size: 'large',
        relevance: 'highlight',
        spec: 'Estágio N de 9 — evidente para cliente, parceiro e MTI.',
      },
    ),
    f(
      'patlasv4proto-demanda-andamento-status-leitura',
      'Status no fluxo atual',
      'text',
      'sec-demanda-andamento',
      { readOnly: true, relevance: 'highlight' },
    ),
    f('patlasv4proto-demanda-andamento-etapa', 'Etapa atual', 'text', 'sec-demanda-andamento', {
      readOnly: true,
      size: 'large',
      relevance: 'highlight',
    }),
    f(
      'patlasv4proto-demanda-andamento-proximo',
      'Próximo passo (para frente)',
      'text',
      'sec-demanda-andamento',
      { readOnly: true, size: 'large', relevance: 'highlight' },
    ),
    f(
      'patlasv4proto-demanda-andamento-caminhos',
      'Caminhos possíveis a partir daqui',
      'text',
      'sec-demanda-andamento',
      { readOnly: true, size: 'large', textLong: true },
    ),
    f('patlasv4proto-demanda-sla-inicio', 'SLA iniciado em', 'date', 'sec-demanda-andamento', {
      readOnly: true,
      size: 'small',
      relevance: 'highlight',
      spec: 'Na abertura da demanda o tempo declarado já conta (consumo e suporte).',
    }),
    f('patlasv4proto-demanda-sla-prazo', 'Prazo SLA declarado', 'text', 'sec-demanda-andamento', {
      readOnly: true,
      size: 'small',
      relevance: 'highlight',
      spec: 'Vem do contrato/catálogo/OS (ex.: 24h infra, 21 dias serviço).',
    }),
    f('patlasv4proto-demanda-sla-status', 'Status do SLA', 'textOptions', 'sec-demanda-andamento', {
      readOnly: true,
      options: ['No prazo', 'Em risco', 'Estourado', 'Dilatado'],
      relevance: 'highlight',
    }),
  ]

  const alertIds = []
  for (const [status, meta] of Object.entries(STATUS_MAP)) {
    const id = `patlasv4proto-demanda-alert-status-${slugStatus(status)}`
    alertIds.push({ status, id })
    andamentoFields.push(
      f(id, `Andamento · ${status}`, 'alert', 'sec-demanda-andamento', {
        readOnly: true,
        size: 'large',
        hidden: true,
        alertVariant: meta.variant,
        alertTitle: meta.alertTitle,
        alertMessage: `${meta.alertMessage}\n\nEstágio: ${meta.estagio}/${meta.total}\nEtapa: ${meta.etapa}\nPara frente: ${meta.proximo}\nCaminhos: ${meta.caminhos}`,
        spec: `Visível quando Status = «${status}».`,
      }),
    )
  }

  // Análise tipo
  const analiseFields = [
    f(
      'patlasv4proto-demanda-tipo-analise',
      'Tipo na análise (automação)',
      'textOptions',
      'sec-demanda-analise-tipo',
      {
        options: ['Licenciamento', 'Serviço'],
        relevance: 'highlight',
        required: false,
        spec:
          'Relacionado automaticamente na análise; muda campos. Detalhe campo a campo = próxima agenda.',
      },
    ),
    f(
      'patlasv4proto-demanda-tipo-analise-alerta',
      'Aviso tipo',
      'alert',
      'sec-demanda-analise-tipo',
      {
        readOnly: true,
        size: 'large',
        alertVariant: 'info',
        alertTitle: 'Licenciamento × Serviço',
        alertMessage:
          'Licenciamento aponta ao entregável (credencial, appliance, etc.) com comprovação no termo de homologação. Serviço inclui execução + mesmo padrão de comprovação e prazo.',
      },
    ),
    f(
      'patlasv4proto-demanda-entregavel-forma',
      'Forma do entregável (licenciamento)',
      'textOptions',
      'sec-demanda-analise-tipo',
      {
        options: [
          'Disponibilizar credencial',
          'Appliance / serviço sem acesso do cliente',
          'Outro comprovante',
        ],
        hidden: true,
        spec: 'Exemplo — não hardcodar só credencial.',
      },
    ),
    f(
      'patlasv4proto-demanda-prazo-execucao',
      'Prazo de execução (serviço / OS)',
      'text',
      'sec-demanda-analise-tipo',
      {
        hidden: true,
        size: 'small',
        spec: 'Ex.: 21 dias. Estouro → dilatação (CRI + parceiro + cliente).',
      },
    ),
  ]

  // Entregável / homologação
  const entregavelFields = [
    f(
      'patlasv4proto-demanda-entregavel-desc',
      'Declaração / entregável',
      'text',
      'sec-demanda-entregavel',
      {
        textLong: true,
        relevance: 'highlight',
        spec: 'Declaração de que o serviço/item foi ativado/entregue (pode ser texto + artefatos).',
      },
    ),
    f(
      'patlasv4proto-demanda-comp-anexos',
      'Comprovações (anexos)',
      'file',
      'sec-demanda-entregavel',
      {
        multiple: true,
        spec: 'Credenciais, docs, evidências da OS — vão ao termo de homologação.',
      },
    ),
    f(
      'patlasv4proto-demanda-homolog-status',
      'Termo de homologação',
      'textOptions',
      'sec-demanda-entregavel',
      {
        options: ['Não iniciado', 'Aguardando assinatura', 'Assinado', 'Recusado'],
        relevance: 'highlight',
        spec: 'Destino das comprovações; precisa assinatura.',
      },
    ),
    f(
      'patlasv4proto-demanda-homolog-assinado',
      'Homologação assinada',
      'boolean',
      'sec-demanda-entregavel',
      { relevance: 'highlight' },
    ),
  ]

  // OS / Orçamento stub
  const osFields = [
    f(
      'patlasv4proto-demanda-os-alerta',
      'Escopo futuro',
      'alert',
      'sec-demanda-os-orc',
      {
        readOnly: true,
        size: 'large',
        alertVariant: 'warning',
        alertTitle: 'OS / Orçamento — stub',
        alertMessage:
          'Detalhar quando modelar OS. Cadeia sob demanda: orçamento (cliente + gerente área) → OS nova ou consumo em OS existente → gerente operação assina → execução. Erro residual tipicamente em licença/volume sem orçamento prévio.',
      },
    ),
    f('patlasv4proto-demanda-orc-numero', 'Orçamento vinculado', 'text', 'sec-demanda-os-orc', {
      readOnly: true,
      size: 'small',
    }),
    f(
      'patlasv4proto-demanda-orc-assinatura-cliente',
      'Orçamento · assinatura cliente',
      'boolean',
      'sec-demanda-os-orc',
      { readOnly: true },
    ),
    f(
      'patlasv4proto-demanda-orc-assinatura-gerente-area',
      'Orçamento · assinatura gerente área',
      'boolean',
      'sec-demanda-os-orc',
      { readOnly: true },
    ),
    f('patlasv4proto-demanda-os-numero', 'Nº da OS', 'text', 'sec-demanda-os-orc', {
      readOnly: true,
      size: 'small',
      spec: 'Espelho futuro; campo atendimento.osVinculada também existe.',
    }),
    f(
      'patlasv4proto-demanda-os-assinatura-gerente-op',
      'OS · assinatura gerente operação',
      'boolean',
      'sec-demanda-os-orc',
      {
        readOnly: true,
        spec: 'Gate: assinou → começa execução (reduz erro de OS manual).',
      },
    ),
    f('patlasv4proto-demanda-os-consumo', 'Consumo da OS', 'text', 'sec-demanda-os-orc', {
      readOnly: true,
      size: 'small',
    }),
    f(
      'patlasv4proto-demanda-dilatacao',
      'Dilatação de prazo',
      'boolean',
      'sec-demanda-os-orc',
      {
        readOnly: true,
        spec: 'Evento autorizado por CRI + parceiro + cliente.',
      },
    ),
  ]

  dem.fields = [...andamentoFields, ...dem.fields, ...analiseFields, ...entregavelFields, ...osFields]

  // Visibility rules
  dem.fieldVisibilityRules = (dem.fieldVisibilityRules || []).filter(
    (r) =>
      !String(r.id).startsWith('rule-dem-andamento-') &&
      !String(r.id).startsWith('rule-dem-tipo-') &&
      !String(r.id).startsWith('rule-dem-reuniao-'),
  )
  for (const { status, id } of alertIds) {
    dem.fieldVisibilityRules.push({
      id: `rule-dem-andamento-${slugStatus(status)}`,
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-demanda-status',
      sourceKind: 'textOptions',
      expectedOptionText: status,
      action: 'show',
      targetFieldIds: [id],
    })
  }
  dem.fieldVisibilityRules.push(
    {
      id: 'rule-dem-tipo-licenciamento',
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-demanda-tipo-analise',
      sourceKind: 'textOptions',
      expectedOptionText: 'Licenciamento',
      action: 'show',
      targetFieldIds: ['patlasv4proto-demanda-entregavel-forma'],
    },
    {
      id: 'rule-dem-tipo-servico',
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-demanda-tipo-analise',
      sourceKind: 'textOptions',
      expectedOptionText: 'Serviço',
      action: 'show',
      targetFieldIds: ['patlasv4proto-demanda-prazo-execucao'],
    },
  )

  // Methods
  const methodDefs = [
    {
      id: 'method-demanda-ver-andamento',
      name: 'Ver status e próximo passo',
      icon: 'timeline',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-ver-andamento',
      spec: 'Timeline + SLA + próximo passo (visão compartilhada).',
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
      spec: 'Exclusivo MTI. Se parceria → Aguardando parceiro.',
    },
    {
      id: 'method-demanda-iniciar-analise',
      name: 'Iniciar análise',
      icon: 'play_arrow',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-iniciar-analise',
      spec: 'MTI. Tipo Licenciamento|Serviço pode ser setado aqui.',
    },
    {
      id: 'method-demanda-parceiro-iniciar',
      name: 'Iniciar / efetivar atendimento (parceiro)',
      icon: 'play_circle',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-parceiro-iniciar',
      spec: 'Parceiro: «bater ponto» / credencial / start. → Em atendimento · parceiro.',
    },
    {
      id: 'method-demanda-parceiro-declarar',
      name: 'Declarar atendida (parceiro)',
      icon: 'task_alt',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-parceiro-declarar',
      spec: 'Parceiro declara atendimento feito + comprovações. → Aguardando validação MTI.',
    },
    {
      id: 'method-demanda-validar-parceiro',
      name: 'Validar atendimento do parceiro (MTI)',
      icon: 'verified_user',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-validar-parceiro',
      spec: 'MTI como gestora. → Em homologação.',
    },
    {
      id: 'method-demanda-via-contrato',
      name: 'Atendimento via contrato',
      icon: 'assignment',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-via-contrato',
      spec: 'Parecer MTI → autorização cliente.',
    },
    {
      id: 'method-demanda-orcamento',
      name: 'Enviar para orçamento',
      icon: 'request_quote',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-orcamento',
      spec: 'Sob demanda: orçamento → OS (agenda própria).',
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
  dem.methods = methodDefs

  for (const p of dem.exampleValuePresets || []) {
    p.fieldValues = p.fieldValues || {}
    fillAndamento(p.fieldValues)
    if (!p.fieldValues['patlasv4proto-demanda-sla-inicio']) {
      p.fieldValues['patlasv4proto-demanda-sla-inicio'] =
        p.fieldValues['patlasv4proto-demanda-criado-em'] || '2026-09-11'
    }
    if (!p.fieldValues['patlasv4proto-demanda-sla-status']) {
      p.fieldValues['patlasv4proto-demanda-sla-status'] = 'No prazo'
    }
  }

  // New presets for partner path
  const extraPresets = [
    {
      id: 'patlasv4proto-p-demanda-aguardando-parceiro',
      name: 'Parceiro · aguardando iniciar',
      iconColor: '#0F766E',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-0101',
        'patlasv4proto-demanda-status': 'Aguardando parceiro',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-tipo': 'Consumo',
        'patlasv4proto-demanda-parceiro-notificado': true,
        'patlasv4proto-demanda-parceiro-nome': 'EloGroup',
        'patlasv4proto-demanda-sla-inicio': '2026-09-11',
        'patlasv4proto-demanda-sla-prazo': '24 horas',
        'patlasv4proto-demanda-sla-status': 'No prazo',
        'patlasv4proto-demanda-tipo-analise': 'Licenciamento',
      },
      embeddedRowsByFieldId: {},
    },
    {
      id: 'patlasv4proto-p-demanda-parceiro-em-atendimento',
      name: 'Parceiro · em atendimento',
      iconColor: '#1D5FA8',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-0102',
        'patlasv4proto-demanda-status': 'Em atendimento · parceiro',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-parceiro-notificado': true,
        'patlasv4proto-demanda-parceiro-nome': 'EloGroup',
        'patlasv4proto-demanda-tipo-analise': 'Serviço',
        'patlasv4proto-demanda-prazo-execucao': '21 dias',
        'patlasv4proto-demanda-sla-inicio': '2026-09-01',
        'patlasv4proto-demanda-sla-prazo': '21 dias',
        'patlasv4proto-demanda-sla-status': 'No prazo',
      },
      embeddedRowsByFieldId: {},
    },
    {
      id: 'patlasv4proto-p-demanda-validacao-mti',
      name: 'MTI · validar parceiro',
      iconColor: '#0F3D4C',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-0103',
        'patlasv4proto-demanda-status': 'Aguardando validação MTI',
        'patlasv4proto-demanda-parceiro-notificado': true,
        'patlasv4proto-demanda-entregavel-desc': 'Credenciais de 10 contas liberadas',
        'patlasv4proto-demanda-homolog-status': 'Não iniciado',
        'patlasv4proto-demanda-tipo-analise': 'Licenciamento',
        'patlasv4proto-demanda-sla-inicio': '2026-09-10',
        'patlasv4proto-demanda-sla-status': 'No prazo',
      },
      embeddedRowsByFieldId: {},
    },
    {
      id: 'patlasv4proto-p-demanda-homologacao',
      name: 'Em homologação',
      iconColor: '#15803D',
      fieldValues: {
        'patlasv4proto-demanda-numero': 'DEM-2026-0104',
        'patlasv4proto-demanda-status': 'Em homologação',
        'patlasv4proto-demanda-homolog-status': 'Aguardando assinatura',
        'patlasv4proto-demanda-entregavel-desc': 'Serviço ativado — declaração + evidências',
        'patlasv4proto-demanda-sla-inicio': '2026-09-01',
        'patlasv4proto-demanda-sla-status': 'No prazo',
      },
      embeddedRowsByFieldId: {},
    },
  ]
  for (const ep of extraPresets) {
    fillAndamento(ep.fieldValues)
    const i = (dem.exampleValuePresets || []).findIndex((p) => p.id === ep.id)
    if (!dem.exampleValuePresets) dem.exampleValuePresets = []
    if (i >= 0) dem.exampleValuePresets[i] = ep
    else dem.exampleValuePresets.push(ep)
  }

  // Method forms
  upsertForm(
    forms,
    buildMethodForm(
      'form-patlasv4-proto-metodo-demanda-ver-andamento',
      'Demanda — Ver status e próximo passo',
      'Timeline + SLA (call recente).',
      [
        f('patlasv4proto-mdem-and-mapa', 'Mapa', 'alert', undefined, {
          readOnly: true,
          size: 'large',
          alertVariant: 'info',
          alertTitle: 'Fluxo Demanda',
          alertMessage: MAPA_FLUXO,
        }),
        f('patlasv4proto-mdem-and-status', 'Status', 'textOptions', undefined, {
          required: true,
          options: STATUS,
          relevance: 'highlight',
        }),
        f('patlasv4proto-mdem-and-timeline', 'Linha do tempo', 'text', undefined, {
          readOnly: true,
          size: 'large',
        }),
        f('patlasv4proto-mdem-and-etapa', 'Etapa', 'text', undefined, { readOnly: true, size: 'large' }),
        f('patlasv4proto-mdem-and-proximo', 'Próximo passo', 'text', undefined, {
          readOnly: true,
          size: 'large',
        }),
        f('patlasv4proto-mdem-and-sla', 'SLA', 'text', undefined, {
          readOnly: true,
          size: 'large',
          spec: 'Inicia na abertura.',
        }),
      ].map((x) => {
        const { sectionId: _s, ...rest } = x
        return rest
      }),
    ),
  )

  upsertForm(
    forms,
    buildMethodForm(
      'form-patlasv4-proto-metodo-demanda-parceiro-iniciar',
      'Demanda — Iniciar / efetivar atendimento (parceiro)',
      'Parceiro efetua o start do atendimento. Não substitui deliberação MTI.',
      [
        {
          id: 'patlasv4proto-mdem-pi-alerta',
          label: 'Aviso',
          type: 'alert',
          size: 'large',
          readOnly: true,
          required: false,
          multiple: false,
          relevance: 'highlight',
          alertVariant: 'info',
          alertTitle: 'Efetivação pelo parceiro',
          alertMessage:
            'Equivalente a «bater ponto»: credencial, appliance ou início de serviço. Depois a MTI valida.',
        },
        {
          id: 'patlasv4proto-mdem-pi-tipo',
          label: 'Tipo de atendimento',
          type: 'textOptions',
          size: 'medium',
          readOnly: false,
          required: true,
          multiple: false,
          relevance: 'highlight',
          options: ['Licenciamento', 'Serviço'],
        },
        {
          id: 'patlasv4proto-mdem-pi-obs',
          label: 'Observação do início',
          type: 'text',
          size: 'large',
          readOnly: false,
          required: false,
          multiple: false,
          relevance: 'common',
          textLong: true,
        },
        {
          id: 'patlasv4proto-mdem-pi-confirmar',
          label: 'Confirmar início do atendimento',
          type: 'boolean',
          size: 'medium',
          readOnly: false,
          required: true,
          multiple: false,
          relevance: 'highlight',
        },
      ],
    ),
  )

  upsertForm(
    forms,
    buildMethodForm(
      'form-patlasv4-proto-metodo-demanda-parceiro-declarar',
      'Demanda — Declarar atendida (parceiro)',
      'Parceiro declara efetivado + comprovações. Segue validação MTI.',
      [
        {
          id: 'patlasv4proto-mdem-pd-alerta',
          label: 'Aviso',
          type: 'alert',
          size: 'large',
          readOnly: true,
          required: false,
          multiple: false,
          relevance: 'highlight',
          alertVariant: 'warning',
          alertTitle: 'Comprovações',
          alertMessage:
            'Anexe evidências (credencial, docs, artefatos da OS). Irão ao termo de homologação após validação MTI.',
        },
        {
          id: 'patlasv4proto-mdem-pd-entregavel',
          label: 'Declaração / entregável',
          type: 'text',
          size: 'large',
          readOnly: false,
          required: true,
          multiple: false,
          relevance: 'highlight',
          textLong: true,
        },
        {
          id: 'patlasv4proto-mdem-pd-anexos',
          label: 'Comprovações',
          type: 'file',
          size: 'medium',
          readOnly: false,
          required: false,
          multiple: true,
          relevance: 'common',
        },
        {
          id: 'patlasv4proto-mdem-pd-confirmar',
          label: 'Declarar demanda atendida',
          type: 'boolean',
          size: 'medium',
          readOnly: false,
          required: true,
          multiple: false,
          relevance: 'highlight',
        },
      ],
    ),
  )

  upsertForm(
    forms,
    buildMethodForm(
      'form-patlasv4-proto-metodo-demanda-validar-parceiro',
      'Demanda — Validar atendimento do parceiro (MTI)',
      'MTI gestora valida a efetivação do parceiro → homologação.',
      [
        {
          id: 'patlasv4proto-mdem-vp-decisao',
          label: 'Decisão',
          type: 'textOptions',
          size: 'medium',
          readOnly: false,
          required: true,
          multiple: false,
          relevance: 'highlight',
          options: ['Validar → homologação', 'Devolver ao parceiro', 'Recusar'],
        },
        {
          id: 'patlasv4proto-mdem-vp-motivo',
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
          id: 'patlasv4proto-mdem-vp-assinatura',
          label: 'Confirmar assinatura MTI',
          type: 'boolean',
          size: 'medium',
          readOnly: false,
          required: true,
          multiple: false,
          relevance: 'highlight',
        },
      ],
    ),
  )

  // Enrich iniciar análise with tipo
  const iniciar = forms.find((x) => x.id === 'form-patlasv4-proto-metodo-demanda-iniciar-analise')
  if (iniciar && !(iniciar.fields || []).some((x) => x.id === 'patlasv4proto-mdem-ia-tipo')) {
    iniciar.fields = iniciar.fields || []
    iniciar.fields.push({
      id: 'patlasv4proto-mdem-ia-tipo',
      label: 'Tipo na análise',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'highlight',
      options: ['Licenciamento', 'Serviço'],
      spec: 'Automação: muda campos (detalhe na próxima agenda).',
    })
  }

  fs.writeFileSync(formsPath, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('forms: Demanda call recente OK')

  // Flow updates
  const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
  const flow = flows.find((x) => x.id === 'flow-proto-demanda-mti')
  if (flow) {
    flow.name = 'Demanda — Fluxo MTI (Projeto Atlas · call recente)'
    flow.description =
      'Inclui timeline/SLA, parceiro iniciar/efetivar + validação MTI, homologação e stub OS/orçamento.'

    const ensureStep = (step, afterId) => {
      if (flow.steps.some((s) => s.id === step.id)) {
        const i = flow.steps.findIndex((s) => s.id === step.id)
        flow.steps[i] = { ...flow.steps[i], ...step }
        return
      }
      const idx = flow.steps.findIndex((s) => s.id === afterId)
      if (idx >= 0) flow.steps.splice(idx + 1, 0, step)
      else flow.steps.push(step)
    }

    ensureStep(
      {
        id: 'step-mti-parceiro-iniciar',
        title: '6b. Parceiro — iniciar/efetivar atendimento',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-parceiro-iniciar',
        bpmnActivityKey: 'demanda.parceiro.iniciar',
        bpmnTaskType: 'userTask',
        assigneeRole: 'Parceiro',
        bpmnDescription:
          'Parceiro notificado inicia/efetiva o atendimento (credencial, appliance ou start de serviço).',
        bpmnRuleList: [
          'Só com parceiroNotificado',
          'Não recusa/devolve (só MTI)',
          'Status → Em atendimento · parceiro',
        ],
        bpmnPossiblePaths: [
          { key: 'Declarar atendida', value: 'step-mti-parceiro-declarar' },
        ],
        classMethodNavigateStepIds: {
          'method-demanda-parceiro-iniciar': 'step-mti-parceiro-iniciar',
        },
      },
      'step-mti-iniciar-analise',
    )

    ensureStep(
      {
        id: 'step-mti-parceiro-declarar',
        title: '6c. Parceiro — declarar atendida',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-parceiro-declarar',
        bpmnActivityKey: 'demanda.parceiro.declarar',
        bpmnTaskType: 'userTask',
        assigneeRole: 'Parceiro',
        bpmnDescription: 'Parceiro anexa entregável/comprovações e declara atendida.',
        bpmnRuleList: ['→ Aguardando validação MTI'],
        bpmnPossiblePaths: [{ key: 'Validação MTI', value: 'step-mti-validar-parceiro' }],
        classMethodNavigateStepIds: {
          'method-demanda-parceiro-declarar': 'step-mti-parceiro-declarar',
        },
      },
      'step-mti-parceiro-iniciar',
    )

    ensureStep(
      {
        id: 'step-mti-validar-parceiro',
        title: '6d. MTI — validar atendimento do parceiro',
        type: 'method',
        methodFormType: 'input',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-validar-parceiro',
        bpmnActivityKey: 'demanda.mti.validarParceiro',
        bpmnTaskType: 'userTask',
        assigneeRole: 'MTI',
        bpmnDescription: 'MTI gestora valida efetivação do parceiro → termo de homologação.',
        bpmnRuleList: ['Validar → Em homologação', 'Devolver/Recusar só MTI'],
        bpmnPossiblePaths: [
          { key: 'Homologação', value: 'step-mti-homologacao' },
          { key: 'Recusar', value: 'step-mti-fim-recusada' },
        ],
        classMethodNavigateStepIds: {
          'method-demanda-validar-parceiro': 'step-mti-validar-parceiro',
        },
      },
      'step-mti-parceiro-declarar',
    )

    ensureStep(
      {
        id: 'step-mti-homologacao',
        title: '8b. Termo de homologação',
        type: 'activity',
        bpmnActivityKey: 'demanda.homologacao',
        bpmnTaskType: 'userTask',
        assigneeRole: 'MTI',
        bpmnDescription:
          'Comprovações no termo de homologação do atendimento; assinatura obrigatória → Efetivado · entregue.',
        bpmnRuleList: [
          'Entregável ≠ só texto — artefatos/credenciais/docs',
          'Assinatura fecha o rito',
        ],
        bpmnPossiblePaths: [{ key: 'Efetivado', value: 'step-mti-fim-efetivado' }],
      },
      'step-mti-validar-parceiro',
    )

    ensureStep(
      {
        id: 'step-mti-fim-efetivado',
        title: 'Fim — Efetivado · entregue',
        type: 'end',
        bpmnActivityKey: 'demanda.fim.efetivado',
        bpmnDescription: 'Atendimento homologado.',
      },
      'step-mti-homologacao',
    )

    // Wire class method nav from registro
    const reg = flow.steps.find((s) => s.id === 'step-mti-registro')
    if (reg) {
      reg.classMethodNavigateStepIds = {
        ...(reg.classMethodNavigateStepIds || {}),
        'method-demanda-parceiro-iniciar': 'step-mti-parceiro-iniciar',
        'method-demanda-parceiro-declarar': 'step-mti-parceiro-declarar',
        'method-demanda-validar-parceiro': 'step-mti-validar-parceiro',
      }
    }

    // Update mapa step text if exists
    const visao = flow.steps.find((s) => s.id === 'step-mti-visao')
    if (visao) {
      visao.bpmnDescription = MAPA_FLUXO
    }
  }

  // Partner flow: rewrite from LEGADO
  let flowP = flows.find((x) => x.id === 'flow-proto-demanda-parceiro')
  if (!flowP) {
    flowP = { id: 'flow-proto-demanda-parceiro', steps: [] }
    flows.push(flowP)
  }
  flowP.name = 'Demanda — Fluxo do Parceiro (iniciar/efetivar)'
  flowP.description =
    'Call recente: parceiro inicia/efetiva e declara atendida; MTI valida. Sem devolver/recusar.'
  flowP.steps = [
    {
      id: 'step-parc-visao',
      title: '0. Visão — Parceiro',
      type: 'activity',
      bpmnDescription:
        'Só age se notificado. Análise = efetivar atendimento; deliberação final é MTI.',
    },
    {
      id: 'step-parc-fila',
      title: '1. Fila de demandas notificadas',
      type: 'activity',
      assigneeRole: 'Parceiro',
      bpmnDescription: 'Portal/BO parceiro lista demandas com parceria.',
    },
    {
      id: 'step-parc-iniciar',
      title: '2. Iniciar / efetivar atendimento',
      type: 'method',
      linkedFormId: 'form-patlasv4-proto-metodo-demanda-parceiro-iniciar',
      assigneeRole: 'Parceiro',
      classMethodNavigateStepIds: {
        'method-demanda-parceiro-iniciar': 'step-parc-iniciar',
      },
    },
    {
      id: 'step-parc-declarar',
      title: '3. Declarar atendida + comprovações',
      type: 'method',
      linkedFormId: 'form-patlasv4-proto-metodo-demanda-parceiro-declarar',
      assigneeRole: 'Parceiro',
      classMethodNavigateStepIds: {
        'method-demanda-parceiro-declarar': 'step-parc-declarar',
      },
    },
    {
      id: 'step-parc-aguarda-mti',
      title: '4. Aguarda validação MTI',
      type: 'activity',
      bpmnDescription: 'MTI valida como gestora → homologação.',
    },
    {
      id: 'step-parc-fim',
      title: 'Fim — entregue ao rito MTI',
      type: 'end',
    },
  ]

  fs.writeFileSync(flowsPath, `${JSON.stringify(flows, null, 2)}\n`, 'utf8')
  console.log('flows: MTI + Parceiro atualizados')
}

main()
