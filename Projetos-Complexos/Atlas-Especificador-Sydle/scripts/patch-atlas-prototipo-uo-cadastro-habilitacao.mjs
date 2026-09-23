#!/usr/bin/env node
/**
 * Organização — Dados do cadastro em subseções, logo em docs execução,
 * referência de grupos MIPP + método Adicionar, status/recorrência habilitação.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const CG_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_UO_DOC = 'form-patlasv4-proto-uo-documento'
const FORM_UO_EXEC = 'form-patlasv4-proto-uo-doc-execucao'
const FORM_METH_AGM = 'form-patlasv4-proto-metodo-adicionar-grupos-mipp'

const GRUPO_OPTS = [
  'Habilitação Jurídica',
  'Qualificação Técnica',
  'Qualificação Econômica e Financeira',
  'Compliance (adendo)',
]

const REMOVE_UO_FIELD_IDS = new Set([
  'patlasv4proto-uo-observacoes-organizacao',
  'patlasv4proto-uo-logo',
  'patlasv4proto-uo-url-logo',
])

const SUBSECTIONS = [
  { id: 'sec-patlasv4proto-uo-sub-identificacao', title: 'Identificação', icon: 'badge' },
  { id: 'sec-patlasv4proto-uo-sub-inscricoes', title: 'Inscrições e CNAE', icon: 'description' },
  { id: 'sec-patlasv4proto-uo-sub-bancario', title: 'Contas bancárias', icon: 'account_balance' },
  { id: 'sec-patlasv4proto-uo-sub-habilitacao', title: 'Habilitação documental (MIPP)', icon: 'verified' },
  { id: 'sec-patlasv4proto-uo-sub-execucao', title: 'Documentos de execução da parceria', icon: 'folder_open' },
]

const FIELD_TO_SUB = {
  mqgzalmsd6b805: 'sec-patlasv4proto-uo-sub-identificacao',
  mqh1rbjlh7gf7u: 'sec-patlasv4proto-uo-sub-identificacao',
  mqh1xpb25qx8tu: 'sec-patlasv4proto-uo-sub-identificacao',
  'patlasv4proto-uo-inscricao-municipal': 'sec-patlasv4proto-uo-sub-inscricoes',
  'patlasv4proto-uo-inscricao-estadual': 'sec-patlasv4proto-uo-sub-inscricoes',
  'patlasv4proto-uo-cnae': 'sec-patlasv4proto-uo-sub-inscricoes',
  mqh1uw9rst5eo8: 'sec-patlasv4proto-uo-sub-inscricoes',
  'patlasv4proto-uo-contas-bancarias': 'sec-patlasv4proto-uo-sub-bancario',
  'patlasv4proto-uo-habilitacao-status': 'sec-patlasv4proto-uo-sub-habilitacao',
  'patlasv4proto-uo-prog-juridica': 'sec-patlasv4proto-uo-sub-habilitacao',
  'patlasv4proto-uo-prog-tecnica': 'sec-patlasv4proto-uo-sub-habilitacao',
  'patlasv4proto-uo-prog-financeira': 'sec-patlasv4proto-uo-sub-habilitacao',
  'patlasv4proto-uo-prog-compliance': 'sec-patlasv4proto-uo-sub-habilitacao',
  'patlasv4proto-uo-acesso-comercial-bloqueado': 'sec-patlasv4proto-uo-sub-habilitacao',
  'patlasv4proto-uo-grupos-mipp-referencia': 'sec-patlasv4proto-uo-sub-habilitacao',
  'patlasv4proto-uo-alert-habilitacao': 'sec-patlasv4proto-uo-sub-habilitacao',
  'patlasv4proto-uo-documentos': 'sec-patlasv4proto-uo-sub-habilitacao',
  'patlasv4proto-uo-docs-execucao': 'sec-patlasv4proto-uo-sub-execucao',
}

const AJUSTES_EMPRESA_FIELDS = [
  'mqgzalmsd6b805',
  'mqh1rbjlh7gf7u',
  'patlasv4proto-uo-inscricao-municipal',
  'patlasv4proto-uo-inscricao-estadual',
  'patlasv4proto-uo-cnae',
  'mqh1xpb25qx8tu',
  'mqh1uw9rst5eo8',
  'patlasv4proto-uo-contas-bancarias',
  'patlasv4proto-uo-grupos-mipp-referencia',
  'patlasv4proto-uo-documentos',
  'patlasv4proto-uo-docs-execucao',
]

const HABILITACAO_PARCEIRO_FIELDS = [
  'patlasv4proto-uo-alert-habilitacao',
  'patlasv4proto-uo-habilitacao-status',
  'patlasv4proto-uo-prog-juridica',
  'patlasv4proto-uo-prog-tecnica',
  'patlasv4proto-uo-prog-financeira',
  'patlasv4proto-uo-prog-compliance',
  'patlasv4proto-uo-acesso-comercial-bloqueado',
]

function stripFieldValues(obj, ids) {
  if (!obj || typeof obj !== 'object') return
  if (obj.fieldValues) {
    for (const id of ids) delete obj.fieldValues[id]
  }
  if (obj.embeddedRowsByFieldId) {
    for (const id of ids) delete obj.embeddedRowsByFieldId[id]
  }
}

function patchUoForm(form) {
  const tabAjustes = form.sections.find((s) => s.id === 'sec-patlasv4proto-uo-ajustes')
  if (!tabAjustes) throw new Error('Aba Dados do cadastro não encontrada')

  const topSections = form.sections.filter((s) => !s.parentSectionId)
  const otherTabs = topSections.filter((s) => s.id !== 'sec-patlasv4proto-uo-ajustes')
  const ajustesIdx = form.sections.findIndex((s) => s.id === 'sec-patlasv4proto-uo-ajustes')
  const afterAjustes = form.sections.slice(ajustesIdx + 1).filter((s) => s.parentSectionId !== 'sec-patlasv4proto-uo-ajustes')

  form.sections = [
    ...form.sections.slice(0, ajustesIdx),
    tabAjustes,
    ...SUBSECTIONS.map((s) => ({ ...s, parentSectionId: 'sec-patlasv4proto-uo-ajustes' })),
    ...afterAjustes,
  ]

  form.fields = form.fields.filter((f) => !REMOVE_UO_FIELD_IDS.has(f.id))

  for (const f of form.fields) {
    const sub = FIELD_TO_SUB[f.id]
    if (sub) f.sectionId = sub
  }

  const newFields = [
    {
      id: 'patlasv4proto-uo-alert-habilitacao',
      type: 'alert',
      label: 'Acompanhamento da habilitação',
      alertVariant: 'info',
      alertTitle: 'Como a MTI acompanha o parceiro',
      alertMessage:
        'Use o Status da habilitação documental e os progressos por grupo (ex.: 12/19). Parceiro com habilitação incompleta mantém Acesso comercial bloqueado até aprovação da MTI.',
      sectionId: 'sec-patlasv4proto-uo-sub-habilitacao',
      hidden: true,
    },
    {
      id: 'patlasv4proto-uo-grupos-mipp-referencia',
      label: 'Grupos de documento (referência)',
      type: 'textOptions',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'highlight',
      sectionId: 'sec-patlasv4proto-uo-sub-habilitacao',
      options: GRUPO_OPTS,
      hidden: true,
      spec:
        'Selecione um ou mais grupos MIPP. Use o método Adicionar à grade MIPP para carregar na tabela abaixo todos os tipos de documento desses grupos (tipos ainda não listados).',
    },
  ]

  for (const nf of newFields) {
    if (!form.fields.some((f) => f.id === nf.id)) form.fields.push(nf)
  }

  const statusField = form.fields.find((f) => f.id === 'patlasv4proto-uo-habilitacao-status')
  if (statusField) {
    statusField.options = [
      'Incompleta',
      'Em apresentação',
      'Completa – aguardando MTI',
      'Aprovada pela MTI',
    ]
    statusField.spec =
      'Etapa geral da habilitação do parceiro. MTI usa este campo para saber se o parceiro está preenchendo, aguardando validação ou já aprovado.'
    statusField.required = false
  }

  const showAjustes = form.fieldVisibilityRules?.find((r) => r.id === 'rule-uo-show-ajustes-empresa')
  if (showAjustes) showAjustes.targetFieldIds = [...AJUSTES_EMPRESA_FIELDS]

  const hideAjustes = form.fieldVisibilityRules?.find((r) => r.id === 'rule-uo-hide-ajustes-nao-empresa')
  if (hideAjustes) hideAjustes.targetFieldIds = [...AJUSTES_EMPRESA_FIELDS]

  const showHabParceiro = form.fieldVisibilityRules?.find((r) => r.id === 'rule-uo-show-habilitacao-parceiro')
  if (showHabParceiro) showHabParceiro.targetFieldIds = [...HABILITACAO_PARCEIRO_FIELDS]

  const hideHabParceiro = form.fieldVisibilityRules?.find((r) => r.id === 'rule-uo-hide-habilitacao-nao-parceiro')
  if (hideHabParceiro) hideHabParceiro.targetFieldIds = [...HABILITACAO_PARCEIRO_FIELDS]

  if (!form.methods.some((m) => m.id === 'patlasv4proto-uo-meth-adicionar-grupos-mipp')) {
    form.methods.push({
      id: 'patlasv4proto-uo-meth-adicionar-grupos-mipp',
      name: 'Adicionar à grade MIPP',
      icon: 'playlist_add',
      kind: 'destaque',
      inputFormId: FORM_METH_AGM,
    })
  }

  for (const preset of form.exampleValuePresets ?? []) {
    stripFieldValues(preset, REMOVE_UO_FIELD_IDS)
    if (preset.fieldValues?.['patlasv4proto-uo-habilitacao-status'] === 'Em apresentação (DPM)') {
      preset.fieldValues['patlasv4proto-uo-habilitacao-status'] = 'Em apresentação'
    }
  }

  const mti = form.exampleValuePresets?.find((p) => p.id === 'patlasv4proto-p-unidade-organizacional-mti')
  if (mti) {
    const exec = mti.embeddedRowsByFieldId?.['patlasv4proto-uo-docs-execucao'] ?? []
    if (!exec.some((r) => r['patlasv4proto-uodexec-tipo'] === 'Logo institucional')) {
      exec.push({
        'patlasv4proto-uodexec-tipo': 'Logo institucional',
        'patlasv4proto-uodexec-arquivo': 'logo_mti.png',
        'patlasv4proto-uodexec-url': 'https://www.mti.mt.gov.br/logo.png',
        'patlasv4proto-uodexec-ativo': true,
      })
      mti.embeddedRowsByFieldId = { ...mti.embeddedRowsByFieldId, 'patlasv4proto-uo-docs-execucao': exec }
    }
  }

  const parceiro = form.exampleValuePresets?.find((p) => p.id === 'patlasv4proto-p-unidade-organizacional-parceiro')
  if (parceiro) {
    parceiro.fieldValues = parceiro.fieldValues ?? {}
    parceiro.fieldValues['patlasv4proto-uo-grupos-mipp-referencia'] = ['Habilitação Jurídica', 'Qualificação Técnica']
  }
}

function patchUoDocumentoForm(form) {
  const grupo = form.fields.find((f) => f.id === 'mqlh6yafch5jzb')
  if (grupo) grupo.label = 'Grupo do documento'

  const rec = form.fields.find((f) => f.id === 'patlasv4proto-uodoc-recorrencia')
  if (rec) {
    rec.options = ['Anual', 'Semestral', 'Trimestral', 'Conforme alteração cadastral', 'Não se aplica']
    rec.spec = 'Visível quando Modo de vencimento = Manual / Recorrente. Define periodicidade para alertas de vencimento.'
  }
}

function patchUoExecForm(form) {
  const tipo = form.fields.find((f) => f.id === 'patlasv4proto-uodexec-tipo')
  if (tipo && !tipo.options.includes('Logo institucional')) {
    tipo.options = [...tipo.options, 'Logo institucional']
    tipo.spec = 'Documentos operacionais — não entram na habilitação MIPP. Logo institucional usa coluna URL.'
  }

  if (!form.fields.some((f) => f.id === 'patlasv4proto-uodexec-url')) {
    form.fields.push({
      id: 'patlasv4proto-uodexec-url',
      label: 'URL',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      spec: 'Endereço público do arquivo (obrigatório para Logo institucional; opcional para outros tipos).',
    })
  }
}

function buildMethodForm() {
  return {
    id: FORM_METH_AGM,
    name: '(1.M4) Adicionar grupos à grade MIPP',
    sectionLayout: 'none',
    metadata:
      'Confirma inclusão na grade MIPP dos tipos de documento dos grupos selecionados no campo Grupos de documento (referência) da organização.',
    fields: [
      {
        id: 'patlasv4proto-meth-agm-grupos',
        label: 'Grupos selecionados',
        type: 'textOptions',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: true,
        relevance: 'highlight',
        options: GRUPO_OPTS,
        spec: 'Espelho do campo Grupos de documento (referência) na organização.',
      },
      {
        id: 'patlasv4proto-meth-agm-resumo',
        label: 'Resumo da operação',
        type: 'text',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        textLong: true,
        spec:
          'Backend: para cada tipo do catálogo MIPP nos grupos escolhidos, adiciona linha em Documentos de habilitação (MIPP) se ainda não existir (status inicial Pendente).',
      },
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-meth-agm-exemplo',
        name: 'Exemplo — Jurídica + Técnica',
        fieldValues: {
          'patlasv4proto-meth-agm-grupos': ['Habilitação Jurídica', 'Qualificação Técnica'],
          'patlasv4proto-meth-agm-resumo':
            'Incluirá na grade MIPP todos os tipos obrigatórios dos grupos Habilitação Jurídica e Qualificação Técnica que ainda não constam na organização.',
        },
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-meth-agm-exemplo',
  }
}

function patchClassGroups(cg, forms) {
  if (!cg.assignments) cg.assignments = {}
  cg.assignments[FORM_METH_AGM] = 'grp-01-organizacao-met'
  const order = cg.memberOrderByGroup?.['grp-01-organizacao-met'] ?? []
  if (!order.includes(FORM_METH_AGM)) {
    cg.memberOrderByGroup['grp-01-organizacao-met'] = [...order, FORM_METH_AGM]
  }
}

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))

const uo = forms.find((f) => f.id === FORM_UO)
if (!uo) throw new Error('Form organização não encontrado')

patchUoForm(uo)

const uoDoc = forms.find((f) => f.id === FORM_UO_DOC)
if (uoDoc) patchUoDocumentoForm(uoDoc)

const uoExec = forms.find((f) => f.id === FORM_UO_EXEC)
if (uoExec) patchUoExecForm(uoExec)

if (!forms.some((f) => f.id === FORM_METH_AGM)) {
  forms.push(buildMethodForm())
}

patchClassGroups(cg, forms)

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Patch aplicado:')
console.log('  • Subseções em Dados do cadastro')
console.log('  • Logo → Documentos de execução (tipo + URL)')
console.log('  • Removido Observações da Organização')
console.log('  • Grupos referência + método Adicionar à grade MIPP')
console.log('  • Status habilitação + Recorrência (Trimestral)')
