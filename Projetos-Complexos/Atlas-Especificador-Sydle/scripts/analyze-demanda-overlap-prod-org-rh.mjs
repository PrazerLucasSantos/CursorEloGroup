#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const cg = JSON.parse(fs.readFileSync(path.join(EPIC, 'class-groups.json'), 'utf8'))
const forms = JSON.parse(fs.readFileSync(path.join(EPIC, 'forms.json'), 'utf8'))
const byId = Object.fromEntries(forms.map((f) => [f.id, f]))

const ROOTS = {
  'grp-atlas-produtos': 'Produtos',
  'grp-atlas-organizacao': 'Organização',
  'grp-atlas-rh': 'Recursos Humanos',
}

function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(cd-[^)]*\)/gi, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function collectForms(rootId) {
  const gids = new Set([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const g of cg.groups) {
      if (g.parentGroupId && gids.has(g.parentGroupId) && !gids.has(g.id)) {
        gids.add(g.id)
        changed = true
      }
    }
  }
  const ids = []
  for (const gid of gids) {
    if (/-met$/.test(gid)) continue // ignora formulários de método
    ids.push(...(cg.memberOrderByGroup?.[gid] || []))
  }
  return [...new Set(ids)].map((id) => byId[id]).filter(Boolean)
}

const catalog = []
for (const [rootId, groupName] of Object.entries(ROOTS)) {
  for (const form of collectForms(rootId)) {
    for (const field of form.fields || []) {
      if (!field.label) continue
      catalog.push({
        group: groupName,
        formId: form.id,
        formName: form.name || form.title || form.id,
        fieldId: field.id,
        label: field.label,
        norm: norm(field.label),
        type: field.type,
        linkedFormId: field.linkedFormId || null,
      })
    }
  }
}

// também indexar classes alvo por nome (para refs que apontam à classe)
const classByGroup = {}
for (const [rootId, groupName] of Object.entries(ROOTS)) {
  classByGroup[groupName] = collectForms(rootId).map((f) => ({
    id: f.id,
    name: f.name || f.title || f.id,
  }))
}

function analyze(demFormId) {
  const dem = byId[demFormId]
  const rows = []
  for (const df of dem.fields || []) {
    const n = norm(df.label)
    if (!n) continue
    const hits = catalog.filter((c) => c.norm === n)
    // match também por linkedFormId apontando a classe do grupo
    const linkHits = []
    if (df.linkedFormId) {
      for (const [groupName, classes] of Object.entries(classByGroup)) {
        const hit = classes.find((c) => c.id === df.linkedFormId)
        if (hit) linkHits.push({ group: groupName, formName: hit.name, formId: hit.id, via: 'linkedFormId' })
      }
    }
    if (!hits.length && !linkHits.length) continue

    const byGroup = {}
    for (const h of hits) {
      ;(byGroup[h.group] || (byGroup[h.group] = new Set())).add(`${h.formName}`)
    }
    for (const h of linkHits) {
      ;(byGroup[h.group] || (byGroup[h.group] = new Set())).add(`${h.formName} (via ref→classe)`)
    }

    rows.push({
      label: (df.label || '').trim(),
      demType: df.type,
      demId: df.id,
      linkedFormId: df.linkedFormId || '',
      linkedName: df.linkedFormId ? byId[df.linkedFormId]?.name || df.linkedFormId : '',
      groups: Object.entries(byGroup)
        .map(([g, set]) => `${g}: ${[...set].join('; ')}`)
        .join(' · '),
      groupKeys: Object.keys(byGroup).sort().join(', '),
    })
  }
  return rows
}

const mti = analyze('form-patlasv4-proto-demanda-completa')
const cliente = analyze('form-patlasv4-proto-demanda-portal-cliente')
const parceiro = analyze('form-patlasv4-proto-demanda-portal-parceiro')

const refsMti = mti.filter((r) => r.demType === 'reference')
const refsCli = cliente.filter((r) => r.demType === 'reference')
const refsPar = parceiro.filter((r) => r.demType === 'reference')

console.log('CATALOG fields', catalog.length)
console.log('OVERLAP MTI', mti.length, 'refs', refsMti.length)
console.log('---ALL_OVERLAP_MTI---')
for (const r of mti) {
  console.log(
    [r.label, r.demType, r.groupKeys, r.groups, r.linkedName || '-'].join('\t'),
  )
}
console.log('---REFS---')
console.log('MTI', refsMti.map((r) => r.label).join(' | ') || '(nenhum)')
console.log('Cliente', refsCli.map((r) => r.label).join(' | ') || '(nenhum)')
console.log('Parceiro', refsPar.map((r) => r.label).join(' | ') || '(nenhum)')

console.log(JSON.stringify({ mti, refsMti, refsCli, refsPar }, null, 2))
