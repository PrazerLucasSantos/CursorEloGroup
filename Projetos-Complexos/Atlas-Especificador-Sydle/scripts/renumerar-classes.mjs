#!/usr/bin/env node
/** Renumera os prefixos dos NOMES das classes conforme a ordem dos grupos.
 *  main → (N), (N.1)…  embutidas → (N.e1)…  métodos → (N.m1)…  suporte → (N.s1)…
 *  Servidor/Backlog: sem número. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
const byId = Object.fromEntries(forms.map((f) => [f.id, f]))
const strip = (n) => (n || '').replace(/^\s*\([^)]*\)\s*/, '').trim()

const tops = cg.groups.filter((g) => !g.parentGroupId)
let renamed = 0
const setName = (id, prefix) => {
  const f = byId[id]
  if (!f) return
  f.name = `${prefix} ${strip(f.name)}`.trim()
  renamed++
}

for (const g of tops) {
  const m = (g.name || '').match(/^\s*(\d+)/)
  const N = m ? m[1] : null
  const order = cg.memberOrderByGroup[g.id] || []
  if (N) {
    order.forEach((id, i) => setName(id, i === 0 ? `(${N})` : `(${N}.${i})`))
  } else {
    // Servidor / Backlog — sem número
    order.forEach((id) => { const f = byId[id]; if (f) { f.name = strip(f.name); renamed++ } })
  }
  const subs = [
    { suf: '-emb', tag: 'e' },
    { suf: '-met', tag: 'm' },
    { suf: '-sup', tag: 's' },
  ]
  for (const { suf, tag } of subs) {
    const sid = g.id + suf
    const list = cg.memberOrderByGroup[sid] || []
    list.forEach((id, i) => {
      if (N) setName(id, `(${N}.${tag}${i + 1})`)
      else { const f = byId[id]; if (f) { f.name = strip(f.name); renamed++ } }
    })
  }
}

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
console.log('Nomes renumerados:', renamed)
// amostra
for (const g of tops.slice(0, 13)) {
  const first = (cg.memberOrderByGroup[g.id] || [])[0]
  if (first && byId[first]) console.log('  ', g.name, '→', byId[first].name)
}
