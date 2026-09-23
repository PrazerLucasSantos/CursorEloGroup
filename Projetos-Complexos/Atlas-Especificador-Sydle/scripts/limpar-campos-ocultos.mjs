#!/usr/bin/env node
/**
 * Remove campos OCULTOS que nunca são exibidos (nenhuma regra os mostra) e os
 * marcados "(nao usado)". Mantém: campos visíveis, campos que viram visíveis por
 * regra, e campos que são FONTE de regra de visibilidade.
 * Uso: node scripts/limpar-campos-ocultos.mjs           (apenas analisa)
 *      node scripts/limpar-campos-ocultos.mjs --apply   (remove)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const APPLY = process.argv.includes('--apply')

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

let totalRem = 0
const report = []

for (const form of forms) {
  const rules = form.fieldVisibilityRules || []
  const canShow = new Set()       // alvo de regra show/editable
  const ruleSources = new Set()   // fonte de regra (controla outros)
  const ruleTargetsAll = new Set()
  for (const r of rules) {
    ruleSources.add(r.sourceFieldId)
    for (const t of r.targetFieldIds || []) {
      ruleTargetsAll.add(t)
      if (r.action === 'show' || r.action === 'editable') canShow.add(t)
    }
  }

  const remover = []
  for (const f of form.fields || []) {
    const naoUsadoLabel = /\(?\bn[ãa]o\s*usad/i.test(f.label || '')
    const ocultoSemShow = f.hidden === true && !canShow.has(f.id)
    const ehFonte = ruleSources.has(f.id)
    if ((ocultoSemShow || naoUsadoLabel) && !ehFonte) {
      remover.push(f)
    }
  }
  if (!remover.length) continue

  const ids = new Set(remover.map((f) => f.id))
  report.push({ form: form.id, name: form.name, campos: remover.map((f) => `${f.label} [${f.id}]`) })
  totalRem += remover.length

  if (APPLY) {
    form.fields = form.fields.filter((f) => !ids.has(f.id))
    // limpa regras (targets) que citam removidos
    if (form.fieldVisibilityRules) {
      form.fieldVisibilityRules = form.fieldVisibilityRules
        .map((r) => ({ ...r, targetFieldIds: (r.targetFieldIds || []).filter((t) => !ids.has(t)) }))
        .filter((r) => !ids.has(r.sourceFieldId) && (r.targetFieldIds.length > 0))
    }
    // limpa hiddenLabelFieldIds
    if (form.hiddenLabelFieldIds) form.hiddenLabelFieldIds = form.hiddenLabelFieldIds.filter((id) => !ids.has(id))
    // limpa presets
    for (const p of form.exampleValuePresets || []) {
      if (p.fieldValues) for (const id of ids) delete p.fieldValues[id]
      if (p.embeddedRowsByFieldId) for (const id of ids) delete p.embeddedRowsByFieldId[id]
    }
  }
}

if (APPLY) {
  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
}

console.log(APPLY ? '=== REMOVIDOS ===' : '=== CANDIDATOS (análise, nada removido) ===')
for (const r of report) {
  console.log(`\n• ${r.name} (${r.form}) — ${r.campos.length}`)
  for (const c of r.campos) console.log('    -', c)
}
console.log(`\nTotal de campos: ${totalRem} em ${report.length} classes.`)
