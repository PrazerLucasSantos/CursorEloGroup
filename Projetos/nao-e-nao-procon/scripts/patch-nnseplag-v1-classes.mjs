/**
 * Ajustes no épico Não é Não - Seplag v1:
 * 1) Análise + Decisão → uma classe com abas + status highlight (tags)
 * 2) Pessoa ← clone completo de Atlas Pessoa (abas do anexo; sem Atribuir cargo)
 * 3) Presets com iconColor variados para a coluna do meio
 *
 * node scripts/patch-nnseplag-v1-classes.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const epicDir = path.join(root, 'data/subprojects/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1')
const atlasFormsPath = path.join(
  root,
  'data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)

const FORM_ACESSO = 'form-nen-acesso'
const FORM_ANALISE_DECISAO = 'form-nen-analise-decisao'
const FORM_CAPACITADO = 'form-nen-capacitado'
const FORM_SOLICITACAO = 'form-nen-solicitacao'
const FORM_AJUSTES = 'form-nen-ajustes'
const FORM_CERTIFICADO = 'form-nen-estabelecimento-selo' // certificado absorvido (17/09)
const FORM_RECURSO = 'form-nen-recurso'
const FORM_RENOVACAO = 'form-nen-renovacao'
const FORM_CANCELAMENTO = 'form-nen-cancelamento'
const FORM_REVOGACAO = 'form-nen-revogacao'
const FORM_ESTABELECIMENTO = 'form-nen-estabelecimento-selo'

const NESTED_MAP = {
  'form-patlasv4-proto-pessoa-telefone': 'form-nen-pessoa-telefone',
  'form-patlasv4-proto-pessoa-email': 'form-nen-pessoa-email',
  'form-patlasv4-proto-pessoa-endereco': 'form-nen-pessoa-endereco',
  'form-patlasv4-proto-uo-documento': 'form-nen-pessoa-documento',
  'form-patlasv4-proto-pessoa-filiacao': 'form-nen-pessoa-filiacao',
  'form-patlasv4-proto-pessoa-rede-social': 'form-nen-pessoa-rede-social',
  'form-patlasv4-proto-uo-conta-bancaria': 'form-nen-pessoa-conta-bancaria',
  'form-patlasv4-proto-pessoa-habilidade': 'form-nen-pessoa-habilidade',
  'form-patlasv4-proto-pessoa-exp-academica': 'form-nen-pessoa-exp-academica',
  'form-patlasv4-proto-pessoa-exp-profissional': 'form-nen-pessoa-exp-profissional',
}

const NESTED_DISPLAY_NAMES = {
  'form-nen-pessoa-telefone': 'Pessoa — Telefone',
  'form-nen-pessoa-email': 'Pessoa — E-mail',
  'form-nen-pessoa-endereco': 'Pessoa — Endereço',
  'form-nen-pessoa-documento': 'Pessoa — Documento',
  'form-nen-pessoa-filiacao': 'Pessoa — Filiação',
  'form-nen-pessoa-rede-social': 'Pessoa — Rede social',
  'form-nen-pessoa-conta-bancaria': 'Pessoa — Conta bancária',
  'form-nen-pessoa-habilidade': 'Pessoa — Habilidade',
  'form-nen-pessoa-exp-academica': 'Pessoa — Experiência acadêmica',
  'form-nen-pessoa-exp-profissional': 'Pessoa — Experiência profissional',
}

/** Só remove vínculos de cargo/organização (não fazem parte da Pessoa do anexo). */
const DROP_FIELD_ID_RE = /atribuicao|cargo|uo-pessoa/i

const COLORS = ['#9d174d', '#0d9488', '#0369a1', '#b45309', '#7c3aed', '#15803d']

function deepClone(x) {
  return JSON.parse(JSON.stringify(x))
}

function remapFieldId(id) {
  return id
    .replace(/^patlasv4proto-pes-/, 'nen-acs-')
    .replace(/^patlasv4proto-/, 'nen-acs-')
}

function cloneNestedForm(src, newId) {
  const f = deepClone(src)
  f.id = newId
  f.name = NESTED_DISPLAY_NAMES[newId] || f.name
  f.fields = (f.fields || []).map((field) => ({
    ...field,
    id: field.id.replace(/^patlasv4proto-/, 'nen-'),
  }))
  if (Array.isArray(f.exampleValuePresets)) {
    f.exampleValuePresets = f.exampleValuePresets.map((p, i) => ({
      ...p,
      id: p.id.replace(/^patlasv4proto-/, 'nen-') || `nen-nested-p${i}`,
      iconColor: p.iconColor || COLORS[i % COLORS.length],
      fieldValues: Object.fromEntries(
        Object.entries(p.fieldValues || {}).map(([k, v]) => [k.replace(/^patlasv4proto-/, 'nen-'), v]),
      ),
    }))
  }
  if (f.activeExamplePresetId) {
    f.activeExamplePresetId = f.activeExamplePresetId.replace(/^patlasv4proto-/, 'nen-')
  }
  if (Array.isArray(f.methods)) {
    f.methods = f.methods.map((m) => ({
      id: m.id.replace(/^patlasv4proto-/, 'nen-'),
      name: m.name,
      icon: m.icon || 'play_arrow',
      kind: m.kind === 'menu' ? 'menu' : 'destaque',
    }))
  }
  return f
}

function buildAcessoFromPessoa(atlasForms) {
  const pessoa = atlasForms.find((f) => f.id === 'form-patlasv4-proto-pessoa')
  if (!pessoa) throw new Error('Pessoa Atlas não encontrada')

  const nested = []
  for (const [oldId, newId] of Object.entries(NESTED_MAP)) {
    const src = atlasForms.find((f) => f.id === oldId)
    if (!src) {
      console.warn('nested missing', oldId)
      continue
    }
    nested.push(cloneNestedForm(src, newId))
  }

  const acesso = deepClone(pessoa)
  acesso.id = FORM_ACESSO
  acesso.name = 'Pessoa'
  acesso.sectionLayout = 'tabs'
  acesso.defaultCanvasMode = 'edit'
  acesso.metadata =
    'Clone da Pessoa (Atlas): Geral, Dados de contato, Complementares e Currículo. Sem método Atribuir cargo / vínculo organizacional.'

  const secMap = (id) => (id ? id.replace('sec-patlasv4proto-pes-', 'sec-nen-acs-') : id)

  acesso.sections = (pessoa.sections || []).map((s) => ({
    id: secMap(s.id),
    title: s.title,
    icon: s.icon,
    ...(s.parentSectionId ? { parentSectionId: secMap(s.parentSectionId) } : {}),
  }))

  acesso.fields = (pessoa.fields || [])
    .filter((field) => {
      if (DROP_FIELD_ID_RE.test(field.id)) return false
      if (field.linkedFormId && /atribuicao|cargo|uo-pessoa/i.test(field.linkedFormId)) return false
      return true
    })
    .map((field) => {
      const next = {
        ...field,
        id: remapFieldId(field.id),
        sectionId: secMap(field.sectionId),
      }
      if (field.linkedFormId && NESTED_MAP[field.linkedFormId]) {
        next.linkedFormId = NESTED_MAP[field.linkedFormId]
      }
      if (next.id === 'nen-acs-ativo-acesso') {
        next.label = 'Ativo para acesso'
        next.relevance = 'highlight'
        next.spec = 'Tag colorida na listagem do workspace (coluna do meio).'
      }
      if (next.id === 'nen-acs-login') {
        next.label = 'Login'
        next.relevance = 'highlight'
      }
      if (next.id === 'nen-acs-email-principal') {
        next.relevance = 'highlight'
      }
      if (next.id === 'nen-acs-nome') {
        next.relevance = 'identity'
      }
      return next
    })

  // Campos da tela real (anexo) que ainda não estão no protótipo Atlas Pessoa
  const credenciaisId = 'sec-nen-acs-credenciais'
  if (!acesso.fields.some((f) => f.id === 'nen-acs-grupos-acesso')) {
    acesso.fields.push({
      id: 'nen-acs-grupos-acesso',
      label: 'Grupos de usuário de acesso',
      type: 'textOptions',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'common',
      sectionId: credenciaisId,
      options: [
        'Servidor Público',
        'Grupo Padrão',
        'Criador de Tickets (SD)',
        'Visualizador de feriados',
        'Reativação de ticket',
        'SGCP Sistema de Gestão de Convocação Pública',
      ],
      spec: '',
    })
  }
  if (!acesso.fields.some((f) => f.id === 'nen-acs-localizacao')) {
    acesso.fields.push({
      id: 'nen-acs-localizacao',
      label: 'Localização',
      type: 'text',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: credenciaisId,
      spec: '',
    })
  }

  acesso.methods = (pessoa.methods || [])
    .filter((m) => !/cargo|atribu/i.test(`${m.id} ${m.name}`))
    .map((m) => ({
      id: remapFieldId(m.id),
      name: m.name,
      icon: m.icon || 'play_arrow',
      kind: m.kind === 'menu' ? 'menu' : 'destaque',
    }))
  if (acesso.methods.length === 0) {
    acesso.methods = [
      { id: 'nen-acs-criar', name: 'Criar', icon: 'add', kind: 'destaque' },
      { id: 'nen-acs-editar', name: 'Editar', icon: 'edit', kind: 'destaque' },
      { id: 'nen-acs-opcoes', name: 'Opções', icon: 'more_horiz', kind: 'menu' },
    ]
  }

  acesso.fieldVisibilityRules = (pessoa.fieldVisibilityRules || []).map((rule) => ({
    ...rule,
    id: rule.id.replace(/^rule-pes-/, 'rule-nen-acs-'),
    sourceFieldId: remapFieldId(rule.sourceFieldId),
    targetFieldIds: (rule.targetFieldIds || []).map(remapFieldId),
  }))

  acesso.exampleValuePresets = (pessoa.exampleValuePresets || []).slice(0, 3).map((p, i) => {
    const fieldValues = {}
    for (const [k, v] of Object.entries(p.fieldValues || {})) {
      if (DROP_FIELD_ID_RE.test(k)) continue
      fieldValues[remapFieldId(k)] = v
    }
    if (fieldValues['nen-acs-ativo-acesso'] == null) fieldValues['nen-acs-ativo-acesso'] = true
    if (fieldValues['nen-acs-login'] == null) fieldValues['nen-acs-login'] = 'mt.login.exemplo'
    return {
      id: `nen-acs-p${i + 1}`,
      name: p.name || `Pessoa ${i + 1}`,
      iconColor: COLORS[i % COLORS.length],
      fieldValues,
    }
  })
  acesso.activeExamplePresetId = acesso.exampleValuePresets[0]?.id

  return { acesso, nested }
}

function buildAnaliseDecisao() {
  const STATUS = [
    'EM ANÁLISE',
    'EM DILIGÊNCIA',
    'PRONTO PARA DECISÃO',
    'DEFERIDO',
    'INDEFERIDO',
    'EM RECURSO',
  ]
  const CONCLUSAO = ['Conforme', 'Não conforme', 'Necessita complementação']
  const DECISAO = ['Deferir', 'Indeferir']

  return {
    id: FORM_ANALISE_DECISAO,
    name: 'Análise e Decisão',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    sections: [
      { id: 'sec-nen-ad-cab', title: 'Cabeçalho do pedido', icon: 'info' },
      { id: 'sec-nen-ad-analise', title: 'Análise', icon: 'fact_check' },
      { id: 'sec-nen-ad-decisao', title: 'Decisão', icon: 'gavel' },
    ],
    fields: [
      {
        id: 'nen-ad-prot',
        label: 'Nº protocolo',
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
        spec: 'Tag colorida na coluna do meio do workspace.',
      },
      {
        id: 'nen-ad-empresa',
        label: 'CNPJ / estabelecimento / município',
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
        spec: 'Prazo de análise até 30 dias (minuta do decreto).',
      },
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
        spec: 'Resposta + anexo + base legal',
      },
      {
        id: 'nen-ad-conclusao',
        label: 'Conclusão do item',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nen-ad-analise',
        options: CONCLUSAO,
        spec: '',
      },
      {
        id: 'nen-ad-espec',
        label: 'Especificação da complementação',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-analise',
        spec: 'Obrigatório se “Necessita complementação”.',
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
        alertVariant: 'warning',
        alertTitle: 'Não deferir',
        alertMessage: 'Impedir deferimento se houver requisito obrigatório “não conforme”.',
        spec: '',
      },
      {
        id: 'nen-ad-parecer',
        label: 'Parecer / fundamentação',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-decisao',
        spec: '',
      },
      {
        id: 'nen-ad-req',
        label: 'Requisitos não preenchidos',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nen-ad-decisao',
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
        spec: '',
      },
      {
        id: 'nen-ad-decisao',
        label: 'Decisão',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nen-ad-decisao',
        options: DECISAO,
        spec: '',
      },
    ],
    methods: [
      { id: 'nen-ad-diligencia', name: 'Abrir diligência', icon: 'assignment_late', kind: 'destaque' },
      { id: 'nen-ad-deferir', name: 'Deferir', icon: 'check_circle', kind: 'destaque' },
      { id: 'nen-ad-indeferir', name: 'Indeferir', icon: 'cancel', kind: 'menu' },
      { id: 'nen-ad-salvar', name: 'Salvar', icon: 'save', kind: 'menu' },
    ],
    exampleValuePresets: [
      {
        id: 'nen-ad-p1',
        name: 'Em análise — foto A3',
        iconColor: '#b45309',
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00042',
          'nen-ad-status': 'EM ANÁLISE',
          'nen-ad-empresa': '12.345.678/0001-90 — Aurora Night — Cuiabá',
          'nen-ad-prazo': '18 dias restantes',
          'nen-ad-item': 'Sinalização A3 — foto do banheiro feminino incompleta',
          'nen-ad-conclusao': 'Necessita complementação',
          'nen-ad-espec': 'Enviar foto nítida do cartaz A3 no banheiro feminino',
          'nen-ad-parecer': '',
          'nen-ad-decisao': '',
        },
      },
      {
        id: 'nen-ad-p2',
        name: 'Deferimento',
        iconColor: '#15803d',
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00042',
          'nen-ad-status': 'DEFERIDO',
          'nen-ad-empresa': '12.345.678/0001-90 — Aurora Night — Cuiabá',
          'nen-ad-prazo': 'Concluído',
          'nen-ad-item': 'Todos os requisitos analisados',
          'nen-ad-conclusao': 'Conforme',
          'nen-ad-parecer': 'Requisitos atendidos conforme protocolo e evidências.',
          'nen-ad-decisao': 'Deferir',
        },
      },
      {
        id: 'nen-ad-p3',
        name: 'Indeferimento',
        iconColor: '#b91c1c',
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00055',
          'nen-ad-status': 'INDEFERIDO',
          'nen-ad-empresa': '98.765.432/0001-10 — Bar Pantanal — Várzea Grande',
          'nen-ad-prazo': 'Concluído',
          'nen-ad-item': 'Capacitação insuficiente',
          'nen-ad-conclusao': 'Não conforme',
          'nen-ad-parecer': 'Percentual de capacitados abaixo do mínimo.',
          'nen-ad-req': 'Qtd. capacitados / percentual',
          'nen-ad-legal': 'Minuta do decreto / Protocolo Não é Não',
          'nen-ad-decisao': 'Indeferir',
        },
      },
    ],
    activeExamplePresetId: 'nen-ad-p1',
  }
}

function ensureStatusHighlightOnEstabelecimento(form) {
  if (!form || form.id !== FORM_ESTABELECIMENTO) return form
  const f = deepClone(form)
  const status = f.fields.find((x) => x.id === 'nen-est-status')
  if (status) status.relevance = 'highlight'
  const fantasia = f.fields.find((x) => x.id === 'nen-est-fantasia')
  if (fantasia) fantasia.relevance = 'identity'
  f.exampleValuePresets = (f.exampleValuePresets || []).map((p, i) => ({
    ...p,
    iconColor: p.iconColor || COLORS[i % COLORS.length],
  }))
  return f
}

function rewriteWorkspace(ws) {
  const w = deepClone(ws)
  for (const pkg of w.packages || []) {
    pkg.classes = (pkg.classes || [])
      .filter((c) => c.linkedFormId !== 'form-nen-analise' && c.linkedFormId !== 'form-nen-decisao')
      .map((c) => {
        if (c.linkedFormId === FORM_ACESSO || c.id === 'cls-nen-acesso' || /acesso|pessoa/i.test(c.name || '')) {
          return {
            ...c,
            id: 'cls-nen-acesso',
            name: 'Pessoa',
            linkedFormId: FORM_ACESSO,
            linkedFormExamplePresetIds: ['nen-acs-p1', 'nen-acs-p2', 'nen-acs-p3'].filter(Boolean),
          }
        }
        return c
      })
  }
  const analisePkg = w.packages.find((p) => p.id === 'pkg-nen-analise')
  if (analisePkg) {
    const keep = (analisePkg.classes || []).filter(
      (c) => ![FORM_ANALISE_DECISAO, 'form-nen-analise', 'form-nen-decisao'].includes(c.linkedFormId),
    )
    analisePkg.classes = [
      {
        id: 'cls-nen-analise-decisao',
        name: 'Análise e Decisão',
        linkedFormId: FORM_ANALISE_DECISAO,
        linkedFormExamplePresetIds: ['nen-ad-p1', 'nen-ad-p2', 'nen-ad-p3'],
      },
      ...keep,
    ]
  }
  return w
}

function rewriteClassGroups(cg, formIds) {
  const groups = [
    { id: 'grp-nen-entrada', name: 'Entrada e solicitação' },
    { id: 'grp-nen-procon', name: 'Análise PROCON' },
    { id: 'grp-nen-pos', name: 'Selo e pós-concessão' },
  ]
  const map = {
    [FORM_CAPACITADO]: 'grp-nen-entrada',
    [FORM_ACESSO]: 'grp-nen-entrada',
    'form-nen-pessoa-telefone': 'grp-nen-entrada',
    'form-nen-pessoa-email': 'grp-nen-entrada',
    'form-nen-pessoa-endereco': 'grp-nen-entrada',
    'form-nen-pessoa-documento': 'grp-nen-entrada',
    'form-nen-pessoa-filiacao': 'grp-nen-entrada',
    'form-nen-pessoa-rede-social': 'grp-nen-entrada',
    'form-nen-pessoa-conta-bancaria': 'grp-nen-entrada',
    'form-nen-pessoa-habilidade': 'grp-nen-entrada',
    'form-nen-pessoa-exp-academica': 'grp-nen-entrada',
    'form-nen-pessoa-exp-profissional': 'grp-nen-entrada',
    [FORM_SOLICITACAO]: 'grp-nen-entrada',
    [FORM_ANALISE_DECISAO]: 'grp-nen-procon',
    [FORM_AJUSTES]: 'grp-nen-procon',
    [FORM_RECURSO]: 'grp-nen-procon',
    [FORM_CERTIFICADO]: 'grp-nen-pos',
    [FORM_ESTABELECIMENTO]: 'grp-nen-pos',
    [FORM_RENOVACAO]: 'grp-nen-pos',
    [FORM_CANCELAMENTO]: 'grp-nen-pos',
    [FORM_REVOGACAO]: 'grp-nen-pos',
  }
  const assignments = {}
  const memberOrderByGroup = { 'grp-nen-entrada': [], 'grp-nen-procon': [], 'grp-nen-pos': [] }
  for (const id of formIds) {
    const g = map[id]
    if (!g) continue
    assignments[id] = g
    memberOrderByGroup[g].push(id)
  }
  return { groups, assignments, memberOrderByGroup }
}

function rewriteFlows(flows) {
  const out = deepClone(flows)
  for (const flow of out) {
    for (const step of flow.steps || []) {
      if (step.linkedFormId === 'form-nen-analise' || step.id === 'step-nen-analise') {
        step.linkedFormId = FORM_ANALISE_DECISAO
        step.title = step.title?.includes('Análise') ? '4. Análise e Decisão (PROCON)' : step.title
        step.bpmnActivityKey = 'Analisar e decidir'
        step.bpmnFormConfirmNavigateStepId =
          step.bpmnFormConfirmNavigateStepId === 'step-nen-ajustes'
            ? 'step-nen-ajustes'
            : step.bpmnFormConfirmNavigateStepId === 'step-nen-certificado'
              ? 'step-nen-certificado'
              : 'step-nen-ajustes'
      }
      if (step.id === 'step-nen-decisao' || step.linkedFormId === 'form-nen-decisao') {
        // remove dedicated decisao step by pointing to merged class content via analise step already
        step.linkedFormId = FORM_ANALISE_DECISAO
        step.title = '6. Decisão (aba na Análise e Decisão)'
        step.bpmnDescription =
          'Usar a aba Decisão da classe Análise e Decisão. Deferimento emite certificado; indeferimento segue para recurso.'
      }
      if (step.linkedFormId === 'form-nen-acesso') {
        step.linkedFormId = FORM_ACESSO
      }
    }
  }
  return out
}

const atlasForms = JSON.parse(fs.readFileSync(atlasFormsPath, 'utf8'))
const currentForms = JSON.parse(fs.readFileSync(path.join(epicDir, 'forms.json'), 'utf8'))
const { acesso, nested } = buildAcessoFromPessoa(atlasForms)
const analiseDecisao = buildAnaliseDecisao()

const keep = currentForms.filter(
  (f) =>
    ![
      'form-nen-acesso',
      'form-nen-analise',
      'form-nen-decisao',
      FORM_ANALISE_DECISAO,
      ...Object.values(NESTED_MAP),
    ].includes(f.id),
)

const forms = [
  ...nested,
  acesso,
  ...keep.map(ensureStatusHighlightOnEstabelecimento),
  analiseDecisao,
]

fs.writeFileSync(path.join(epicDir, 'forms.json'), JSON.stringify(forms, null, 2) + '\n')

const wsPath = path.join(epicDir, 'workspaces.json')
const ws = JSON.parse(fs.readFileSync(wsPath, 'utf8'))
fs.writeFileSync(wsPath, JSON.stringify(ws.map(rewriteWorkspace), null, 2) + '\n')

fs.writeFileSync(
  path.join(epicDir, 'class-groups.json'),
  JSON.stringify(
    rewriteClassGroups(
      {},
      forms.map((f) => f.id),
    ),
    null,
    2,
  ) + '\n',
)

const flowsPath = path.join(epicDir, 'flows.json')
const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
fs.writeFileSync(flowsPath, JSON.stringify(rewriteFlows(flows), null, 2) + '\n')

console.log('OK forms', forms.length)
console.log(
  'pessoa',
  acesso.name,
  'fields',
  acesso.fields.length,
  'tabs',
  acesso.sections.filter((s) => !s.parentSectionId).map((s) => s.title).join(' / '),
  'nested',
  nested.map((n) => n.id).join(', '),
)
console.log('analise-decisao fields', analiseDecisao.fields.length)
