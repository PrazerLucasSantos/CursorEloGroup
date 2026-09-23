#!/usr/bin/env node
/**
 * Cadastro Organizacional — Unidade pai e Nível ocultos quando Empresa = Sim;
 * visíveis quando Empresa = Não.
 * Uso: node scripts/patch-atlas-prototipo-uo-empresa-visibilidade.mjs
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
const F_EMPRESA = 'patlasv4proto-uo-empresa'
const F_PAI = 'patlasv4proto-uo-unidade-pai'
const F_NIVEL = 'patlasv4proto-uo-nivel'
const SEC_DADOS = 'sec-patlasv4proto-uo-dados'

function patchForm(form) {
  for (const field of form.fields) {
    if (field.id === F_PAI) {
      field.hidden = true
      field.sectionId = SEC_DADOS
      field.spec =
        'Hierarquia — visível quando Empresa = Não. Oculto para cadastro raiz (Empresa = Sim).'
    }
    if (field.id === F_NIVEL) {
      field.hidden = true
      field.sectionId = SEC_DADOS
      field.spec = 'Profundidade hierárquica (raiz = 0). Visível quando Empresa = Não.'
    }
  }

  const rules = (form.fieldVisibilityRules ?? []).filter(
    (r) =>
      r.id !== 'rule-uo-show-pai-unidade-negocio' &&
      r.id !== 'rule-uo-show-pai-departamento' &&
      r.id !== 'rule-uo-hide-pai-empresa' &&
      r.id !== 'rule-uo-show-pai-nao-empresa',
  )

  rules.push(
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
      id: 'rule-uo-show-pai-nao-empresa',
      operator: 'eq',
      sourceFieldId: F_EMPRESA,
      sourceKind: 'boolean',
      expectedBoolean: false,
      action: 'show',
      targetFieldIds: [F_PAI, F_NIVEL],
    },
  )

  form.fieldVisibilityRules = rules
  return form
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const idx = forms.findIndex((x) => x.id === FORM)
  if (idx < 0) throw new Error('Cadastro Organizacional não encontrado')

  forms[idx] = patchForm(forms[idx])
  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('✓ UO — Unidade pai e Nível ocultos quando Empresa = Sim')
  console.log('✓ UO — Unidade pai e Nível visíveis quando Empresa = Não')
}

main()
