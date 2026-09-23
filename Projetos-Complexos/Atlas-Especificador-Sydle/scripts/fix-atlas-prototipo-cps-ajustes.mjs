#!/usr/bin/env node
/**
 * Ajustes pontuais pós-patch:
 * - Produto: forçar DELETE label+hidden nos 4 Protheus que escaparam
 * - Parceria: remover duplicata de produtos
 * - Catálogo: N2 SIAG opcional F2 + editável MTI
 * - Solução: Nome obrigatório
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORMS_PATH = path.join(ROOT, 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json')

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

const deleteLabels = {
  'form-patlasv4-proto-cat-produto-grupo-protheus': 'DELETE ?Grupo Protheus',
  'form-patlasv4-proto-cat-produto-cod-parceiro-protheus': 'DELETE ?Código do parceiro — Protheus',
  'form-patlasv4-proto-cat-produto-local-padrao': 'DELETE ?Local padrão',
  'form-patlasv4-proto-cat-produto-tipo-protheus': 'DELETE ?Tipo Protheus (ERP)',
}

const prod = forms.find((f) => f.id === 'form-patlasv4-proto-cat-produto')
for (const f of prod.fields) {
  if (deleteLabels[f.id]) {
    f.label = deleteLabels[f.id]
    f.hidden = true
    f.readOnly = true
    f.sectionId = 'sec-prod-delete'
  }
  if (f.id === 'form-patlasv4-proto-cat-produto-pct-mti') {
    f.label = '% MTI'
  }
}

const parc = forms.find((f) => f.id === 'form-patlasv4-proto-cat-parceria')
const seen = new Set()
parc.fields = parc.fields.filter((f) => {
  if (f.id !== 'form-patlasv4-proto-cat-parceria-produtos') return true
  if (seen.has(f.id)) return false
  seen.add(f.id)
  f.hidden = false
  return true
})

const cat = forms.find((f) => f.id === 'form-patlasv4-proto-cat-catalogo')
for (const f of cat.fields) {
  if (f.id === 'form-patlasv4-proto-cat-catalogo-cod-siag-cat') {
    f.readOnly = false
    f.required = false
  }
}

const sol = forms.find((f) => f.id === 'form-patlasv4-proto-cat-solucao')
for (const f of sol.fields) {
  if (f.id === 'form-patlasv4-proto-cat-solucao-identificador') {
    f.required = true
    f.readOnly = false
  }
}

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

function summary(form) {
  const all = form.fields.filter((x) => x.type !== 'alert' && x.id !== 'form-patlasv4-proto-cat-produto-card')
  const act = all.filter((x) => !String(x.label).startsWith('DELETE'))
  const del = all.filter((x) => String(x.label).startsWith('DELETE'))
  const bad = del.filter((x) => x.hidden !== true)
  const dups = all.map((x) => x.id).filter((id, i, a) => a.indexOf(id) !== i)
  console.log(
    `${form.name}: ativos=${act.length} DELETE=${del.length} (ocultos ${del.length - bad.length}) dups=${dups.length}`,
  )
  for (const b of bad) console.log(`  ! ainda visível: ${b.label}`)
}

summary(prod)
summary(parc)
summary(cat)
summary(sol)
console.log('pct-mti:', prod.fields.find((x) => x.id.includes('pct-mti')).label)
const n2 = cat.fields.find((x) => x.id.includes('cod-siag-cat'))
console.log(`N2 SIAG: req=${n2.required} ro=${n2.readOnly}`)
console.log(
  'Sol Nome req=',
  sol.fields.find((x) => x.id.includes('identificador')).required,
)
for (const id of Object.keys(deleteLabels)) {
  const f = prod.fields.find((x) => x.id === id)
  console.log(`${f.label} hidden=${f.hidden}`)
}
