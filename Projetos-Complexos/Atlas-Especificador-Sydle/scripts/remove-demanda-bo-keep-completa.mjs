#!/usr/bin/env node
/**
 * Remove a classe Demanda BO (form-patlasv4-proto-demanda) e seus métodos,
 * mantendo apenas Demanda · Completa. Atualiza flows/workspace/groups.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')

const REMOVE_FORM_IDS = new Set([
  'form-patlasv4-proto-demanda',
  'form-patlasv4-proto-metodo-demanda-autorizar',
  'form-patlasv4-proto-metodo-demanda-recusar',
  'form-patlasv4-proto-metodo-demanda-devolver',
  'form-patlasv4-proto-metodo-demanda-orcamento',
  'form-patlasv4-proto-metodo-demanda-via-contrato',
  'form-patlasv4-proto-metodo-demanda-qualificar',
  'form-patlasv4-proto-metodo-demanda-iniciar-analise',
  'form-patlasv4-proto-metodo-demanda-pre-analise',
  'form-patlasv4-proto-metodo-demanda-ver-andamento',
  'form-patlasv4-proto-metodo-demanda-parceiro-iniciar',
  'form-patlasv4-proto-metodo-demanda-parceiro-declarar',
  'form-patlasv4-proto-metodo-demanda-validar-parceiro',
  'form-patlasv4-proto-metodo-demanda-assinar-atendimento',
  'form-patlasv4-proto-metodo-demanda-autorizar-sn',
  'form-patlasv4-proto-metodo-demanda-encerrar-termo',
  'form-patlasv4-proto-metodo-demanda-ajuste-termo',
])

const KEEP = 'form-patlasv4-proto-demanda-completa'

function remapDemandaRefs(value) {
  if (Array.isArray(value)) return value.map(remapDemandaRefs)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = remapDemandaRefs(v)
    return out
  }
  if (typeof value === 'string') {
    if (value === 'form-patlasv4-proto-demanda') return KEEP
    // métodos BO → equivalentes completa quando o id bate
    if (value.startsWith('form-patlasv4-proto-metodo-demanda-')) {
      const suffix = value.slice('form-patlasv4-proto-metodo-demanda-'.length)
      return `form-patlasv4-proto-metodo-demc-${suffix}`
    }
    if (value === 'method-demanda-') return value // no-op guard
    if (value.startsWith('method-demanda-')) {
      return value.replace(/^method-demanda-/, 'method-demc-')
    }
  }
  return value
}

// forms
const formsPath = path.join(EPIC, 'forms.json')
const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
const before = forms.length
const nextForms = forms.filter((f) => !REMOVE_FORM_IDS.has(f.id))
fs.writeFileSync(formsPath, `${JSON.stringify(nextForms, null, 2)}\n`)
console.log(`forms: ${before} → ${nextForms.length} (removed ${before - nextForms.length})`)

// class-groups
const groupsPath = path.join(EPIC, 'class-groups.json')
const groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'))
for (const id of REMOVE_FORM_IDS) {
  delete groups.assignments?.[id]
  delete groups.formToGroup?.[id]
}
for (const key of Object.keys(groups.memberOrderByGroup || {})) {
  groups.memberOrderByGroup[key] = (groups.memberOrderByGroup[key] || []).filter(
    (id) => !REMOVE_FORM_IDS.has(id),
  )
}
// remove empty BO groups if unused
groups.groups = (groups.groups || []).filter(
  (g) => g.id !== 'grp-atlas-demanda' && g.id !== 'grp-atlas-demanda-met',
)
delete groups.memberOrderByGroup?.['grp-atlas-demanda']
delete groups.memberOrderByGroup?.['grp-atlas-demanda-met']
delete groups.formsByGroup?.['grp-atlas-demanda']
delete groups.formsByGroup?.['grp-atlas-demanda-met']
fs.writeFileSync(groupsPath, `${JSON.stringify(groups, null, 2)}\n`)
console.log('class-groups: cleaned BO demanda groups')

// workspaces
const wsPath = path.join(EPIC, 'workspaces.json')
const workspaces = JSON.parse(fs.readFileSync(wsPath, 'utf8'))
for (const ws of workspaces) {
  ws.packages = (ws.packages || []).filter((p) => p.id !== 'pkg-fase-3-demanda')
  for (const pkg of ws.packages || []) {
    pkg.classes = (pkg.classes || []).filter(
      (c) => c.linkedFormId !== 'form-patlasv4-proto-demanda',
    )
  }
}
fs.writeFileSync(wsPath, `${JSON.stringify(workspaces, null, 2)}\n`)
console.log('workspaces: removed pkg-fase-3-demanda')

// flows — retarget to completa / metodo-demc
const flowsPath = path.join(EPIC, 'flows.json')
const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
const remapped = remapDemandaRefs(flows)
fs.writeFileSync(flowsPath, `${JSON.stringify(remapped, null, 2)}\n`)
console.log('flows: remapped demanda → demanda-completa / metodo-demc')

// write curated mapping doc for reference
const mapPath = path.join(__dirname, '../docs/mapa-metodo-demanda-campos.md')
console.log('done (mapping listed to user; optional doc skipped unless written)')
