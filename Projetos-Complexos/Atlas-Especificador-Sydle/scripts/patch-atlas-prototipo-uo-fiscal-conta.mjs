#!/usr/bin/env node
/**
 * Campos fiscais e contas bancárias na UO — aba Tributos e Encargos.
 * Uso: node scripts/patch-atlas-prototipo-uo-fiscal-conta.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const GROUPS_PATH = path.join(EPIC, 'class-groups.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_UO_CONTA = 'form-patlasv4-proto-uo-conta-bancaria'
const SEC_TRIB = 'sec-patlasv4proto-uo-tributos'

const REGIME_OPTS = [
  'Simples Nacional',
  'Lucro Presumido',
  'Lucro Real',
  'MEI',
  'Imune / Isento',
]

const TIPO_CONTA_OPTS = ['Corrente', 'Poupança', 'Pagamento']

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
    ...(sectionId ? { sectionId } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
  }
}

const formUoContaBancaria = {
  id: FORM_UO_CONTA,
  name: 'CO — Conta bancária',
  sectionLayout: 'none',
  metadata: 'Linha da grade Contas bancárias da Unidade Organizacional.',
  fields: [
    f('patlasv4proto-uoban-nome-banco', 'Nome do banco', 'text', undefined, {
      required: true,
      relevance: 'highlight',
      spec: 'Ex.: Banco do Brasil, Caixa Econômica Federal.',
    }),
    f('patlasv4proto-uoban-codigo-banco', 'Código do banco', 'text', undefined, {
      size: 'small',
      required: true,
      spec: 'Código COMPE/FEBRABAN (3 dígitos). Ex.: 001, 104.',
    }),
    f('patlasv4proto-uoban-numero-agencia', 'Número da agência', 'text', undefined, {
      size: 'small',
      required: true,
      spec: 'Agência sem dígito ou com dígito verificador, conforme padrão do banco.',
    }),
    f('patlasv4proto-uoban-tipo-conta', 'Tipo de conta', 'textOptions', undefined, {
      size: 'small',
      required: true,
      options: TIPO_CONTA_OPTS,
    }),
    f('patlasv4proto-uoban-numero-conta', 'Número da conta', 'text', undefined, {
      required: true,
      spec: 'Conta com dígito verificador quando aplicável.',
    }),
  ],
}

function buildFiscalFields() {
  return [
    f('patlasv4proto-uo-cnpj', 'CNPJ / CPF', 'text', SEC_TRIB, {
      spec: 'Documento fiscal da unidade. Máscara CNPJ ou CPF conforme tipo de organização.',
    }),
    f('patlasv4proto-uo-inscricao-municipal', 'Inscrição Municipal', 'text', SEC_TRIB, {
      size: 'small',
      spec: 'IM municipal — obrigatória para prestadores de serviço quando aplicável.',
    }),
    f('patlasv4proto-uo-inscricao-estadual', 'Inscrição Estadual', 'text', SEC_TRIB, {
      size: 'small',
      spec: 'IE estadual. Omitir ou marcar isenção quando não contribuinte de ICMS.',
    }),
    f('patlasv4proto-uo-cnae', 'CNAE (Atividade Principal)', 'text', SEC_TRIB, {
      spec: 'Código CNAE fiscal da atividade principal. Ex.: 6201-5/01.',
    }),
    f('patlasv4proto-uo-regime-tributacao', 'Regime de Tributação', 'textOptions', SEC_TRIB, {
      options: REGIME_OPTS,
      spec: 'Regime tributário vigente da organização.',
    }),
    f('patlasv4proto-uo-isento-icms', 'Isento de ICMS', 'boolean', SEC_TRIB, {
      size: 'small',
      spec: 'Sim quando a organização é isenta de ICMS.',
    }),
    f('patlasv4proto-uo-isento-inscricao-estadual', 'Isento de Inscrição Estadual', 'boolean', SEC_TRIB, {
      size: 'small',
      spec: 'Sim quando não possui IE por isenção ou não ser contribuinte de ICMS.',
    }),
    f('patlasv4proto-uo-contas-bancarias', 'Contas bancárias', 'embeddedReference', SEC_TRIB, {
      size: 'large',
      multiple: true,
      linkedFormId: FORM_UO_CONTA,
      embeddedDisplay: 'table',
      spec: 'Tabela múltipla: Nome do banco, Código, Agência, Tipo de conta, Número da conta.',
    }),
  ]
}

function patchUoForm(uo) {
  const removeIds = new Set([
    'patlasv4proto-uo-cnpj',
    'patlasv4proto-uo-inscricao-municipal',
    'patlasv4proto-uo-inscricao-estadual',
    'patlasv4proto-uo-cnae',
    'patlasv4proto-uo-regime-tributacao',
    'patlasv4proto-uo-isento-icms',
    'patlasv4proto-uo-isento-inscricao-estadual',
    'patlasv4proto-uo-contas-bancarias',
    'patlasv4proto-uo-tributos',
  ])
  const kept = uo.fields.filter((field) => !removeIds.has(field.id))

  const oldTributos = uo.fields.find((field) => field.id === 'patlasv4proto-uo-tributos')
  const fiscalFields = buildFiscalFields()
  const tributosTable = {
    ...(oldTributos ?? {}),
    id: 'patlasv4proto-uo-tributos',
    label: 'Tributos e Encargos',
    type: 'embeddedReference',
    sectionId: SEC_TRIB,
    size: 'large',
    multiple: true,
    linkedFormId: oldTributos?.linkedFormId ?? 'form-patlasv4-proto-uo-tributo',
    embeddedDisplay: 'table',
    spec: oldTributos?.spec ?? 'Tabela múltipla: Tributo, Alíquota %, Observação, Documento comprobatório.',
  }

  const tribAnchor = uo.fields.findIndex((field) => field.id === 'patlasv4proto-uo-tributos')
  const insertAt = uo.fields
    .slice(0, tribAnchor >= 0 ? tribAnchor : uo.fields.length)
    .filter((field) => !removeIds.has(field.id)).length
  kept.splice(insertAt, 0, ...fiscalFields, tributosTable)

  uo.fields = kept

  const rules = uo.fieldVisibilityRules ?? []
  const hideIeRule = {
    id: 'rule-uo-hide-ie-isento',
    operator: 'eq',
    sourceFieldId: 'patlasv4proto-uo-isento-inscricao-estadual',
    sourceKind: 'boolean',
    expectedBoolean: true,
    action: 'hide',
    targetFieldIds: ['patlasv4proto-uo-inscricao-estadual'],
  }
  if (!rules.some((r) => r.id === hideIeRule.id)) {
    uo.fieldVisibilityRules = [...rules, hideIeRule]
  }

  for (const preset of uo.exampleValuePresets ?? []) {
    if (preset.id === 'patlasv4proto-p-unidade-organizacional-mti') {
      preset.fieldValues = {
        ...preset.fieldValues,
        'patlasv4proto-uo-inscricao-municipal': '123456',
        'patlasv4proto-uo-inscricao-estadual': '13.123.456-7',
        'patlasv4proto-uo-cnae': '6201-5/01',
        'patlasv4proto-uo-regime-tributacao': 'Lucro Presumido',
        'patlasv4proto-uo-isento-icms': false,
        'patlasv4proto-uo-isento-inscricao-estadual': false,
      }
      preset.embeddedRowsByFieldId = {
        ...preset.embeddedRowsByFieldId,
        'patlasv4proto-uo-contas-bancarias': [
          {
            'patlasv4proto-uoban-nome-banco': 'Banco do Brasil',
            'patlasv4proto-uoban-codigo-banco': '001',
            'patlasv4proto-uoban-numero-agencia': '3456-7',
            'patlasv4proto-uoban-tipo-conta': 'Corrente',
            'patlasv4proto-uoban-numero-conta': '12345-6',
          },
        ],
      }
    }
  }

  return uo
}

function patchClassGroups(cg) {
  cg.assignments[FORM_UO_CONTA] = 'grp-patlasv4-proto-embutido'
  const emb = cg.memberOrderByGroup['grp-patlasv4-proto-embutido']
  if (!emb.includes(FORM_UO_CONTA)) {
    const tribIdx = emb.indexOf('form-patlasv4-proto-uo-tributo')
    if (tribIdx >= 0) emb.splice(tribIdx + 1, 0, FORM_UO_CONTA)
    else emb.push(FORM_UO_CONTA)
  }
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const uoIdx = forms.findIndex((f) => f.id === FORM_UO)
  if (uoIdx < 0) {
    console.error('Formulário UO não encontrado')
    process.exit(1)
  }

  const contaIdx = forms.findIndex((f) => f.id === FORM_UO_CONTA)
  if (contaIdx >= 0) forms[contaIdx] = formUoContaBancaria
  else forms.push(formUoContaBancaria)

  forms[uoIdx] = patchUoForm({ ...forms[uoIdx] })

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  const cg = JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))
  patchClassGroups(cg)
  fs.writeFileSync(GROUPS_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

  console.log('✓ UO — aba Tributos: CNPJ/CPF, IM, IE, CNAE, Regime, isenções')
  console.log('✓ UO — grade Contas bancárias (nome, código, agência, tipo, conta)')
  console.log('✓ Preset MTI raiz atualizado com exemplo fiscal e conta bancária')
}

main()
