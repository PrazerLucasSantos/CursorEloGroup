/**
 * Atendimento MTI → classes satélite embutidas:
 * - Análise e deliberação (emb-analise)
 * - Detalhe via contrato (emb-via-contrato) — NEC/descrição como registro-texto
 * - Validação atendimento parceiro (emb-validacao-parceiro)
 * Métodos apontam para esses forms; aba Demanda só mostra os embeds + 9 listas.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORMS = path.join(
  root,
  'data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const REGISTRO = 'form-patlasv4-proto-demc-registro-texto'
const FORM_ANALISE = 'form-patlasv4-proto-demc-atd-analise'
const FORM_VIA = 'form-patlasv4-proto-demc-atd-via-contrato'
const FORM_VAL = 'form-patlasv4-proto-demc-atd-validacao-parceiro'

const P = 'patlasv4proto-demc'

function cloneField(src, newId, opts = {}) {
  const f = JSON.parse(JSON.stringify(src))
  f.id = newId
  delete f.sectionId
  if (opts.visibleWhen) f.visibleWhen = opts.visibleWhen
  if (opts.label) f.label = opts.label
  if (opts.spec) f.spec = opts.spec
  return f
}

function embRef({ id, label, linkedFormId, multiple = false, spec }) {
  return {
    id,
    label,
    type: 'embeddedReference',
    size: 'large',
    readOnly: false,
    required: false,
    multiple,
    relevance: 'highlight',
    sectionId: 'sec-demc-atendimento-mti',
    linkedFormId,
    embeddedDisplay: 'form',
    spec,
  }
}

function registroEmb(id, label, spec) {
  return {
    id,
    label,
    type: 'embeddedReference',
    size: 'large',
    readOnly: false,
    required: false,
    multiple: true,
    relevance: 'common',
    linkedFormId: REGISTRO,
    embeddedDisplay: 'form',
    spec:
      spec ||
      `Função: Lista de registros de «${label}» (padrão Observações Sydle).\nRegra: Clique em + para adicionar linha (Autor / data + Conteúdo). Ícone de exclusão remove o registro.`,
  }
}

function buildAnaliseForm(byId) {
  const tipo = byId[`${P}-tipo-analise`]
  const modalidad = byId[`${P}-modalidade-servico`]
  const parceria = byId[`${P}-parceria`]
  const solucao = byId[`${P}-solucao-vigente`]
  const fab = byId[`${P}-fabricante`]
  const cat = byId[`${P}-catalogos`]
  const itens = byId[`${P}-itens`]
  const entregavel = byId[`${P}-entregavel-forma`]
  const prazo = byId[`${P}-prazo-execucao`]
  const delib = byId[`${P}-deliberacao-mti`]
  const motivo = byId[`${P}-motivo`]
  const rejeicao = byId[`${P}-motivo-rejeicao`]

  const tipoId = `${P}-atda-tipo-analise`
  const fields = [
    cloneField(tipo, tipoId, {
      spec: tipo.spec,
    }),
    cloneField(modalidad, `${P}-atda-modalidade-servico`, {
      visibleWhen: { fieldId: tipoId, equals: 'Serviço' },
    }),
    cloneField(parceria, `${P}-atda-parceria`),
    cloneField(solucao, `${P}-atda-solucao`, { label: 'Solução' }),
    cloneField(fab, `${P}-atda-fabricante`, {
      label: 'Fabricante',
      visibleWhen: { fieldId: tipoId, equals: 'Licenciamento' },
    }),
    cloneField(cat, `${P}-atda-catalogos`, { label: 'Catálogo' }),
    cloneField(itens, `${P}-atda-itens`, { label: 'Produtos' }),
    cloneField(entregavel, `${P}-atda-entregavel-forma`, {
      visibleWhen: { fieldId: tipoId, equals: 'Licenciamento' },
    }),
    cloneField(prazo, `${P}-atda-prazo-execucao`, {
      visibleWhen: { fieldId: tipoId, equals: 'Serviço' },
    }),
    cloneField(delib, `${P}-atda-deliberacao`),
    cloneField(motivo, `${P}-atda-motivo-devolucao`, {
      visibleWhen: {
        fieldId: `${P}-atda-deliberacao`,
        equals: 'Solicitado ajuste (devolver)',
      },
    }),
    cloneField(rejeicao, `${P}-atda-motivo-rejeicao`, {
      visibleWhen: { fieldId: `${P}-atda-deliberacao`, equals: 'Reprovado' },
    }),
  ]

  return {
    id: FORM_ANALISE,
    name: 'Análise e deliberação MTI',
    icon: 'fact_check',
    iconColor: '#1d4ed8',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Classe satélite Demanda F3 · Atendimento MTI. Preenchida pelos métodos Qualificar / Iniciar análise / Deliberar. Embutida em Demanda (emb-analise).',
    fields,
    exampleValuePresets: [
      {
        id: 'p-atda-exemplo',
        name: 'Análise · via contrato',
        iconColor: '#3b82f6',
        fieldValues: {
          [tipoId]: 'Serviço',
          [`${P}-atda-modalidade-servico`]: 'Sem projeto',
          [`${P}-atda-parceria`]: 'EloGroup',
          [`${P}-atda-solucao`]: 'MTI CLOUD — Serviços em nuvem',
          [`${P}-atda-catalogos`]: 'Catálogo Cloud v4',
          [`${P}-atda-itens`]: 'VM-Gold · Backup',
          [`${P}-atda-deliberacao`]: 'Aprovado · via contrato',
        },
      },
    ],
    activeExamplePresetId: 'p-atda-exemplo',
    methods: [],
    fieldVisibilityRules: [],
  }
}

function buildViaForm(byId) {
  const valores = byId[`${P}-via-valores`]
  const saldo = byId[`${P}-saldo-contabilizar`]
  return {
    id: FORM_VIA,
    name: 'Detalhe via contrato',
    icon: 'assignment',
    iconColor: '#0f766e',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Classe satélite Demanda F3 · Atendimento via contrato (detalhar). Método Atendimento via contrato. Embutida em Demanda (emb-via-contrato). NEC e Descrição no padrão Observações.',
    fields: [
      registroEmb(
        `${P}-atdv-nec`,
        'NEC / necessidade detalhada',
        'Função: NEC no detalhe via contrato (padrão Observações).\nRegra: Preenchida no método Atendimento via contrato (detalhar).',
      ),
      registroEmb(
        `${P}-atdv-desc`,
        'Descrição do atendimento (MTI)',
        'Função: Descrição do atendimento elaborada pela MTI (padrão Observações).\nRegra: Distinta da descrição do parceiro.',
      ),
      cloneField(valores, `${P}-atdv-valores`),
      cloneField(saldo, `${P}-atdv-saldo`),
    ],
    exampleValuePresets: [
      {
        id: 'p-atdv-exemplo',
        name: 'Via contrato · parcial',
        iconColor: '#14b8a6',
        fieldValues: {
          [`${P}-atdv-valores`]:
            'Pedido: 10 × VM-Gold = R$ 100.000 · Homologação parcial nesta execução',
          [`${P}-atdv-saldo`]: 'R$ 40.000',
        },
        embeddedRowsByFieldId: {
          [`${P}-atdv-nec`]: [
            {
              'patlasv4proto-demc-reg-autor': 'Lucas Santos',
              'patlasv4proto-demc-reg-em': '23/09/2026 00:10',
              'patlasv4proto-demc-reg-conteudo':
                'Ampliar capacidade sob saldo contratual vigente.',
            },
          ],
          [`${P}-atdv-desc`]: [
            {
              'patlasv4proto-demc-reg-autor': 'Lucas Santos',
              'patlasv4proto-demc-reg-em': '23/09/2026 00:10',
              'patlasv4proto-demc-reg-conteudo':
                'Provisionar 4 VMs agora; restante em homologação posterior.',
            },
          ],
        },
      },
    ],
    activeExamplePresetId: 'p-atdv-exemplo',
    methods: [],
    fieldVisibilityRules: [],
  }
}

function buildValForm(byId) {
  const val = byId[`${P}-validacao-parceiro`]
  return {
    id: FORM_VAL,
    name: 'Validação do atendimento do parceiro',
    icon: 'verified_user',
    iconColor: '#7c3aed',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Classe satélite Demanda F3 · Após declaração do parceiro. Método Validar atendimento do parceiro (MTI). Embutida em Demanda (emb-validacao-parceiro).',
    fields: [
      cloneField(val, `${P}-atdp-decisao`, {
        label: 'Validação do atendimento do parceiro',
        spec: 'Função: Decisão da MTI ao validar o atendimento declarado pelo parceiro.\nRegra: Após Declarar atendida (parceiro). Segue homologação.',
      }),
      {
        id: `${P}-atdp-motivo`,
        label: 'Motivo (devolver/recusar)',
        type: 'text',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        textLong: true,
        spec: 'Obrigatório quando a validação devolve ou recusa.',
      },
    ],
    exampleValuePresets: [
      {
        id: 'p-atdp-exemplo',
        name: 'Validado → homologação',
        iconColor: '#8b5cf6',
        fieldValues: {
          [`${P}-atdp-decisao`]: 'Validar → homologação',
        },
      },
    ],
    activeExamplePresetId: 'p-atdp-exemplo',
    methods: [],
    fieldVisibilityRules: [],
  }
}

/** Campos flat da aba que migram para as classes (deixam de existir na Demanda). */
const REMOVE_FROM_DEMANDA = new Set([
  `${P}-tipo-analise`,
  `${P}-modalidade-servico`,
  `${P}-parceria`,
  `${P}-solucao-vigente`,
  `${P}-fabricante`,
  `${P}-catalogos`,
  `${P}-itens`,
  `${P}-entregavel-forma`,
  `${P}-prazo-execucao`,
  `${P}-nec`,
  `${P}-desc-atendimento`,
  `${P}-via-valores`,
  `${P}-saldo-contabilizar`,
  `${P}-deliberacao-mti`,
  `${P}-validacao-parceiro`,
  `${P}-motivo`,
  `${P}-motivo-rejeicao`,
])

const KEEP_REGISTROS = [
  'caso-negocio',
  'risco-desempenho',
  'risco-nao-desempenho',
  'habilitadores',
  'barreiras',
  'em-escopo',
  'fora-escopo',
  'consideracoes',
  'anotacoes',
]

function patchDemandaForm(form, prefix, sectionId) {
  if (!form?.fields) return false
  const p = `patlasv4proto-${prefix}`
  // Map remove set for demcli/dempar — only demc has full set; portals may have subset
  const removeIds = new Set(
    [...REMOVE_FROM_DEMANDA].map((id) => id.replace(`${P}-`, `${p}-`)),
  )
  // Also remove portal-specific variants of moved fields
  for (const suf of [
    'tipo-analise',
    'modalidade-servico',
    'parceria',
    'solucao-vigente',
    'solucao-catalogo',
    'fabricante',
    'catalogos',
    'itens',
    'entregavel-forma',
    'prazo-execucao',
    'nec',
    'desc-atendimento',
    'via-valores',
    'saldo-contabilizar',
    'deliberacao-mti',
    'validacao-parceiro',
    'motivo',
    'motivo-rejeicao',
  ]) {
    removeIds.add(`${p}-${suf}`)
  }

  const remaining = form.fields.filter((f) => !removeIds.has(f.id))
  const registros = KEEP_REGISTROS.map((suf) => {
    const existing = remaining.find((f) => f.id === `${p}-${suf}`)
    if (existing) {
      existing.sectionId = sectionId
      return existing
    }
    return null
  }).filter(Boolean)

  const withoutRegistros = remaining.filter(
    (f) => !KEEP_REGISTROS.some((suf) => f.id === `${p}-${suf}`),
  )

  const embeds = [
    embRef({
      id: `${p}-emb-analise`,
      label: 'Análise e deliberação MTI',
      linkedFormId: FORM_ANALISE,
      multiple: false,
      spec: 'Função: Bloco de análise/deliberação (classe satélite).\nRegra: Criado/preenchido pelos métodos Qualificar / Iniciar análise. Vazio até o método ser acionado.',
    }),
    embRef({
      id: `${p}-emb-via-contrato`,
      label: 'Detalhe via contrato',
      linkedFormId: FORM_VIA,
      multiple: false,
      spec: 'Função: NEC, descrição, valores e saldo (classe satélite).\nRegra: Criado pelo método Atendimento via contrato (detalhar), após deliberação aprovada via contrato.',
    }),
    embRef({
      id: `${p}-emb-validacao-parceiro`,
      label: 'Validação do atendimento do parceiro',
      linkedFormId: FORM_VAL,
      multiple: false,
      spec: 'Função: Validação MTI do atendimento declarado pelo parceiro (classe satélite).\nRegra: Criado pelo método Validar atendimento do parceiro, após declaração do parceiro.',
    }),
  ]
  for (const e of embeds) e.sectionId = sectionId

  // Reinsert: keep other sections' fields order; replace atendimento fields
  const otherFields = withoutRegistros.filter((f) => f.sectionId !== sectionId)
  const otherInSection = withoutRegistros.filter((f) => f.sectionId === sectionId)

  form.fields = [...otherFields, ...embeds, ...registros, ...otherInSection]

  // Ensure section exists
  if (form.sections && !form.sections.some((s) => s.id === sectionId)) {
    form.sections.push({
      id: sectionId,
      title: 'Atendimento MTI',
      icon: 'assignment',
    })
  }

  // Strip removed keys from presets
  if (form.exampleValuePresets) {
    for (const preset of form.exampleValuePresets) {
      if (preset.fieldValues) {
        for (const k of Object.keys(preset.fieldValues)) {
          if (removeIds.has(k)) delete preset.fieldValues[k]
        }
      }
      if (preset.embeddedRowsByFieldId) {
        for (const k of Object.keys(preset.embeddedRowsByFieldId)) {
          if (removeIds.has(k)) delete preset.embeddedRowsByFieldId[k]
        }
      }
    }
  }

  return true
}

function wireMethods(form) {
  if (!form?.methods) return
  const map = {
    'method-demc-iniciar-analise': FORM_ANALISE,
    'method-demc-qualificar': FORM_ANALISE,
    'method-demc-via-contrato': FORM_VIA,
    'method-demc-validar-parceiro': FORM_VAL,
  }
  for (const m of form.methods) {
    if (map[m.id]) {
      m.inputFormId = map[m.id]
      if (m.id === 'method-demc-via-contrato') {
        m.spec =
          'Abre a classe Detalhe via contrato (NEC, descrição, valores, saldo). Após deliberação Aprovado · via contrato.'
      }
      if (m.id === 'method-demc-iniciar-analise' || m.id === 'method-demc-qualificar') {
        m.spec =
          (m.spec || '') +
          ' · Formulário: classe Análise e deliberação MTI (embutida na aba Atendimento MTI).'
      }
      if (m.id === 'method-demc-validar-parceiro') {
        m.spec =
          'Abre a classe Validação do atendimento do parceiro (embutida na aba Atendimento MTI).'
      }
    }
  }
}

// ── run ──
const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
const demc = forms.find((f) => f.id === 'form-patlasv4-proto-demanda-completa')
if (!demc) throw new Error('demanda-completa not found')

const byId = Object.fromEntries(demc.fields.map((f) => [f.id, f]))
for (const id of REMOVE_FROM_DEMANDA) {
  if (!byId[id]) console.warn('missing source field', id)
}

const analise = buildAnaliseForm(byId)
const via = buildViaForm(byId)
const val = buildValForm(byId)

function upsertForm(form) {
  const i = forms.findIndex((f) => f.id === form.id)
  if (i >= 0) forms[i] = form
  else {
    const at = forms.findIndex((f) => f.id === REGISTRO)
    if (at >= 0) forms.splice(at, 0, form)
    else forms.push(form)
  }
}

upsertForm(analise)
upsertForm(via)
upsertForm(val)

patchDemandaForm(demc, 'demc', 'sec-demc-atendimento-mti')
wireMethods(demc)

const demcli = forms.find((f) => f.id === 'form-patlasv4-proto-demanda-portal-cliente')
if (demcli) patchDemandaForm(demcli, 'demcli', 'sec-demcli-atendimento')

const dempar = forms.find((f) => f.id === 'form-patlasv4-proto-demanda-portal-parceiro')
if (dempar) patchDemandaForm(dempar, 'dempar', 'sec-dempar-atendimento')

fs.writeFileSync(FORMS, `${JSON.stringify(forms, null, 2)}\n`)

console.log('OK satellite forms + demanda embeds')
console.log(
  ' demc atendimento:',
  demc.fields
    .filter((f) => f.sectionId === 'sec-demc-atendimento-mti')
    .map((f) => f.label)
    .join(' · '),
)
