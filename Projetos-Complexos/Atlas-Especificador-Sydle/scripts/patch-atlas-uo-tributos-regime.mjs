#!/usr/bin/env node
/**
 * Adiciona na aba Tributos e Encargos (acima da tabela): Regime de Tributação,
 * Isento de ICMS + documento, Isento de Inscrição Estadual + documento.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const SEC = 'sec-patlasv4proto-uo-tributos'
const FIELD_TRIB = 'mqmdvi11ofo8m3'

const F_REGIME = 'patlasv4proto-uo-regime-tributacao'
const F_ISE_ICMS = 'patlasv4proto-uo-isento-icms'
const F_ISE_ICMS_DOC = 'patlasv4proto-uo-isento-icms-doc'
const F_ISE_IE = 'patlasv4proto-uo-isento-inscricao-estadual'
const F_ISE_IE_DOC = 'patlasv4proto-uo-isento-ie-doc'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const uo = forms.find((f) => f.id === FORM_UO)

const novos = [
  {
    id: F_REGIME, label: 'Regime de Tributação', type: 'textOptions', size: 'medium',
    readOnly: false, required: false, multiple: false, relevance: 'common', hidden: true,
    sectionId: SEC,
    options: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'MEI', 'Imune / Isento'],
    spec: 'Regime tributário da organização.',
  },
  {
    id: F_ISE_ICMS, label: 'Isento de ICMS', type: 'boolean', size: 'small',
    readOnly: false, required: false, multiple: false, relevance: 'common', hidden: true,
    sectionId: SEC, spec: 'Quando Sim, anexar o documento comprobatório de isenção.',
  },
  {
    id: F_ISE_ICMS_DOC, label: 'Documento comprobatório — Isenção ICMS', type: 'file', size: 'medium',
    readOnly: false, required: false, multiple: false, relevance: 'common', hidden: true,
    sectionId: SEC, spec: 'Obrigatório quando Isento de ICMS = Sim.',
  },
  {
    id: F_ISE_IE, label: 'Isento de Inscrição Estadual', type: 'boolean', size: 'small',
    readOnly: false, required: false, multiple: false, relevance: 'common', hidden: true,
    sectionId: SEC, spec: 'Quando Sim, oculta a Inscrição Estadual e exige o comprovante.',
  },
  {
    id: F_ISE_IE_DOC, label: 'Documento comprobatório — Isenção Inscrição Estadual', type: 'file', size: 'medium',
    readOnly: false, required: false, multiple: false, relevance: 'common', hidden: true,
    sectionId: SEC, spec: 'Obrigatório quando Isento de Inscrição Estadual = Sim.',
  },
]

// evita duplicar
const existing = new Set(uo.fields.map((f) => f.id))
const toAdd = novos.filter((f) => !existing.has(f.id))
const idx = uo.fields.findIndex((f) => f.id === FIELD_TRIB)
uo.fields.splice(idx, 0, ...toAdd)

// regras Empresa = Sim/Não
const showEmp = uo.fieldVisibilityRules.find((r) => r.id === 'rule-uo-show-ajustes-empresa')
const hideEmp = uo.fieldVisibilityRules.find((r) => r.id === 'rule-uo-hide-ajustes-nao-empresa')
for (const id of [F_REGIME, F_ISE_ICMS, F_ISE_IE]) {
  if (!showEmp.targetFieldIds.includes(id)) showEmp.targetFieldIds.push(id)
}
for (const id of [F_REGIME, F_ISE_ICMS, F_ISE_ICMS_DOC, F_ISE_IE, F_ISE_IE_DOC]) {
  if (!hideEmp.targetFieldIds.includes(id)) hideEmp.targetFieldIds.push(id)
}

// regras condicionais dos documentos de isenção
const condRules = [
  {
    id: 'rule-uo-show-doc-isento-icms', operator: 'eq', sourceFieldId: F_ISE_ICMS,
    sourceKind: 'boolean', expectedBoolean: true, action: 'show', targetFieldIds: [F_ISE_ICMS_DOC],
  },
  {
    id: 'rule-uo-show-doc-isento-ie', operator: 'eq', sourceFieldId: F_ISE_IE,
    sourceKind: 'boolean', expectedBoolean: true, action: 'show', targetFieldIds: [F_ISE_IE_DOC],
  },
]
for (const r of condRules) {
  if (!uo.fieldVisibilityRules.some((x) => x.id === r.id)) uo.fieldVisibilityRules.push(r)
}

// preset MTI: regime de exemplo
for (const p of uo.exampleValuePresets ?? []) {
  if (p.embeddedRowsByFieldId && p.embeddedRowsByFieldId[FIELD_TRIB]) {
    p.fieldValues = p.fieldValues ?? {}
    if (!(F_REGIME in p.fieldValues)) p.fieldValues[F_REGIME] = 'Lucro Presumido'
    if (!(F_ISE_ICMS in p.fieldValues)) p.fieldValues[F_ISE_ICMS] = false
    if (!(F_ISE_IE in p.fieldValues)) p.fieldValues[F_ISE_IE] = false
  }
}

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
console.log('Adicionados: Regime de Tributação, Isento ICMS (+doc), Isento Inscrição Estadual (+doc).')
console.log('Campos novos:', toAdd.map((f) => f.label).join(' · '))
