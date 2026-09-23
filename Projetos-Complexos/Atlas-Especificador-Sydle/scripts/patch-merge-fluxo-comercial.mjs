#!/usr/bin/env node
/** Une os grupos 10–15 (Processos, Proposta, Documentos, Contrato, OS, Projeto)
 *  em um único grupo "10 · Fluxo comercial" (Embutidas + Métodos). */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CG_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json')
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))

const OLD = ['grp-10-processos', 'grp-11-proposta', 'grp-12-documentos', 'grp-13-contrato', 'grp-14-os', 'grp-15-projeto']
const NEW = 'grp-10-fluxo'
const NEW_EMB = 'grp-10-fluxo-emb'
const NEW_MET = 'grp-10-fluxo-met'

const get = (g) => cg.memberOrderByGroup[g] || []
const mains = [], embs = [], mets = []
for (const base of OLD) {
  mains.push(...get(base))
  embs.push(...get(`${base}-emb`))
  mets.push(...get(`${base}-met`))
}

// remove grupos antigos (e seus subgrupos) de groups[]
const oldAll = new Set()
for (const base of OLD) { oldAll.add(base); oldAll.add(`${base}-emb`); oldAll.add(`${base}-met`); oldAll.add(`${base}-sup`) }
cg.groups = cg.groups.filter((g) => !oldAll.has(g.id))
for (const id of oldAll) delete cg.memberOrderByGroup[id]

// cria grupo único + subgrupos (inserir antes de Assinatura)
const idxAssin = cg.groups.findIndex((g) => g.id === 'grp-16-assinatura')
const novos = [
  { id: NEW, name: '10 · Fluxo comercial' },
  { id: NEW_EMB, name: 'Embutidas', parentGroupId: NEW },
  { id: NEW_MET, name: 'Métodos', parentGroupId: NEW },
]
cg.groups.splice(idxAssin >= 0 ? idxAssin : cg.groups.length, 0, ...novos)

cg.memberOrderByGroup[NEW] = mains
cg.memberOrderByGroup[NEW_EMB] = embs
cg.memberOrderByGroup[NEW_MET] = mets
for (const id of mains) cg.assignments[id] = NEW
for (const id of embs) cg.assignments[id] = NEW_EMB
for (const id of mets) cg.assignments[id] = NEW_MET

// renumerar grupos seguintes (display apenas)
const rename = {
  'grp-16-assinatura': '11 · Assinatura',
  'grp-17-entrega-valor': '12 · Entrega de Valor',
  'grp-18-notificacoes': '13 · Notificações',
}
for (const g of cg.groups) if (rename[g.id]) g.name = rename[g.id]

fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')
console.log('Fluxo comercial unificado em "10 · Fluxo comercial".')
console.log('  Principais:', mains.length, '| Embutidas:', embs.length, '| Métodos:', mets.length)
