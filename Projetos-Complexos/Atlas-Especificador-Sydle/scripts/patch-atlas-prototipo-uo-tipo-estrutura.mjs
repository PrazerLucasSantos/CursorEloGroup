#!/usr/bin/env node
/**
 * Cadastro Organizacional — tipo de estrutura: Empresa, Unidade de negócio, Departamento.
 * Unidade pai visível apenas para unidade de negócio ou departamento.
 * Uso: node scripts/patch-atlas-prototipo-uo-tipo-estrutura.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)

const FORM = 'form-patlasv4-proto-unidade-organizacional'
const OLD_FIELD = 'patlasv4proto-uo-representa-organizacao'
const SEC = 'sec-patlasv4proto-uo-dados'

const F_EMPRESA = 'patlasv4proto-uo-empresa'
const F_UN = 'patlasv4proto-uo-unidade-negocio'
const F_DEP = 'patlasv4proto-uo-departamento'
const F_PAI = 'patlasv4proto-uo-unidade-pai'
const F_NIVEL = 'patlasv4proto-uo-nivel'

function boolField(id, label, spec) {
  return {
    id,
    label,
    type: 'boolean',
    size: 'small',
    readOnly: false,
    required: true,
    multiple: false,
    relevance: id === F_EMPRESA ? 'highlight' : 'common',
    sectionId: SEC,
    spec,
  }
}

function migratePreset(fieldValues) {
  const old = fieldValues[OLD_FIELD]
  delete fieldValues[OLD_FIELD]

  const nome = fieldValues['patlasv4proto-uo-nome'] || ''
  const nivel = fieldValues['patlasv4proto-uo-nivel']
  const hasPai = Boolean(fieldValues[F_PAI])

  if (old === false || nivel === 0 || !hasPai) {
    fieldValues[F_EMPRESA] = true
    fieldValues[F_UN] = false
    fieldValues[F_DEP] = false
    return
  }

  const isUnidadeNegocio =
    /^Unidade de Gestão\b/i.test(nome) ||
    /^Gabinete\b/i.test(nome) ||
    /^Conselho\b/i.test(nome) ||
    /^Diretoria\b/i.test(nome)

  fieldValues[F_EMPRESA] = false
  fieldValues[F_UN] = isUnidadeNegocio
  fieldValues[F_DEP] = !isUnidadeNegocio
}

function patchForm(form) {
  const idx = form.fields.findIndex((x) => x.id === OLD_FIELD)
  if (idx < 0) {
    console.error('Campo representa-organizacao não encontrado')
    process.exit(1)
  }

  form.fields.splice(
    idx,
    1,
    boolField(
      F_EMPRESA,
      'Empresa',
      'Cadastro de organização raiz (empresa). Oculta Unidade pai.',
    ),
    boolField(
      F_UN,
      'Unidade de negócio',
      'Unidade de negócio na hierarquia. Exibe Unidade pai.',
    ),
    boolField(
      F_DEP,
      'Departamento',
      'Departamento ou unidade filha. Exibe Unidade pai.',
    ),
  )

  const pai = form.fields.find((x) => x.id === F_PAI)
  if (pai) {
    pai.spec =
      'Hierarquia — obrigatória quando Unidade de negócio ou Departamento = Sim. Oculta quando Empresa = Sim.'
  }

  const rules = form.fieldVisibilityRules ?? []
  form.fieldVisibilityRules = rules.filter(
    (r) =>
      r.id !== 'rule-uo-show-unidade-pai-departamento' &&
      r.id !== 'rule-uo-hide-unidade-pai-organizacao',
  )

  form.fieldVisibilityRules.push(
    {
      id: 'rule-uo-hide-pai-empresa',
      operator: 'eq',
      sourceFieldId: F_EMPRESA,
      sourceKind: 'boolean',
      expectedBoolean: true,
      action: 'hide',
      targetFieldIds: [F_PAI, F_NIVEL],
    },
    {
      id: 'rule-uo-show-pai-unidade-negocio',
      operator: 'eq',
      sourceFieldId: F_UN,
      sourceKind: 'boolean',
      expectedBoolean: true,
      action: 'show',
      targetFieldIds: [F_PAI, F_NIVEL],
    },
    {
      id: 'rule-uo-show-pai-departamento',
      operator: 'eq',
      sourceFieldId: F_DEP,
      sourceKind: 'boolean',
      expectedBoolean: true,
      action: 'show',
      targetFieldIds: [F_PAI, F_NIVEL],
    },
  )

  for (const preset of form.exampleValuePresets ?? []) {
    migratePreset(preset.fieldValues ?? {})
  }

  return form
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const idx = forms.findIndex((x) => x.id === FORM)
  if (idx < 0) {
    console.error('Formulário Cadastro Organizacional não encontrado')
    process.exit(1)
  }
  forms[idx] = patchForm(forms[idx])
  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('✓ UO — Empresa, Unidade de negócio e Departamento (booleanos)')
  console.log('✓ UO — Unidade pai oculta para Empresa; visível para UN/Departamento')
  console.log(`✓ UO — ${forms[idx].exampleValuePresets?.length ?? 0} presets migrados`)
}

main()
