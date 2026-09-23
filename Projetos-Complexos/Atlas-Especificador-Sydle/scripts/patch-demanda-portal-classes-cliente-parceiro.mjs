#!/usr/bin/env node
/**
 * Espelha a classe Demanda · Completa (F3) em duas classes de portal:
 * - Demanda · Portal Cliente
 * - Demanda · Portal Parceiro
 *
 * Mesmos tipos de campo, tamanhos, seções (tabs), regras de visibilidade e
 * estrutura — só muda prefixo de IDs, nome e metadado de ator.
 *
 * Uso: node scripts/patch-demanda-portal-classes-cliente-parceiro.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS = path.join(EPIC, 'forms.json')
const GROUPS = path.join(EPIC, 'class-groups.json')
const WS = path.join(EPIC, 'workspaces.json')

const SOURCE_ID = 'form-patlasv4-proto-demanda-completa'
const SOURCE_PREFIX = 'patlasv4proto-demc-'
const SOURCE_SEC = 'sec-demc-'

const TARGETS = [
  {
    id: 'form-patlasv4-proto-demanda-portal-cliente',
    name: 'Demanda · Portal Cliente',
    prefix: 'patlasv4proto-demcli-',
    sec: 'sec-demcli-',
    actor: 'CLIENTE',
    groupId: 'grp-atlas-demanda-portal-cliente',
    groupName: '[Atlas] Demanda · Portal Cliente',
    wsPkgId: 'pkg-fase-3-demanda-portal-cliente',
    wsPkgName: 'Fase 3 · Demanda Portal Cliente',
    wsClsId: 'cls-mapa-demanda-portal-cliente',
    color: '#0f766e',
  },
  {
    id: 'form-patlasv4-proto-demanda-portal-parceiro',
    name: 'Demanda · Portal Parceiro',
    prefix: 'patlasv4proto-dempar-',
    sec: 'sec-dempar-',
    actor: 'PARCEIRO',
    groupId: 'grp-atlas-demanda-portal-parceiro',
    groupName: '[Atlas] Demanda · Portal Parceiro',
    wsPkgId: 'pkg-fase-3-demanda-portal-parceiro',
    wsPkgName: 'Fase 3 · Demanda Portal Parceiro',
    wsClsId: 'cls-mapa-demanda-portal-parceiro',
    color: '#0369a1',
  },
]

function deepClone(x) {
  return structuredClone(x)
}

function remapString(s, t) {
  if (typeof s !== 'string') return s
  return s
    .split(SOURCE_ID)
    .join(t.id)
    .split(SOURCE_PREFIX)
    .join(t.prefix)
    .split(SOURCE_SEC)
    .join(t.sec)
    .split('preset-demc-')
    .join(`preset-${t.actor.toLowerCase()}-`)
    .split('patlasv4proto-p-demc-')
    .join(`patlasv4proto-p-${t.prefix.replace('patlasv4proto-', '').replace(/-$/, '')}-`)
}

function remapDeep(value, t) {
  if (Array.isArray(value)) return value.map((v) => remapDeep(v, t))
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      const nk = remapString(k, t)
      out[nk] = remapDeep(v, t)
    }
    return out
  }
  if (typeof value === 'string') return remapString(value, t)
  return value
}

function cloneForm(source, t) {
  const form = remapDeep(deepClone(source), t)
  form.id = t.id
  form.name = t.name
  form.defaultCanvasMode = source.defaultCanvasMode ?? 'read'
  form.sectionLayout = source.sectionLayout ?? 'tabs'
  form.metadata = [
    `Espelho estrutural da Demanda · Completa (F3 fontes) para o ator ${t.actor}.`,
    'Mesmos tipos de campo, formatos, seções/tabs e regras de visibilidade da classe MTI.',
    'Portal (não back-office). Fluxo operacional compartilhado via store Demanda F3.',
    'Consol. 1.0 · Documentador F3.',
  ].join(' ')
  // Presets: limpa cenários MTI e deixa um seed vazio nomeado
  form.exampleValuePresets = [
    {
      id: `preset-${t.prefix.replace(/[^a-z0-9]/gi, '')}-vazio`,
      name: `${t.actor} · formulário vazio`,
      iconColor: t.color,
      fieldValues: {},
      embeddedRowsByFieldId: {},
    },
  ]
  form.activeExamplePresetId = form.exampleValuePresets[0].id
  // Métodos da classe MTI não se aplicam 1:1 no portal — remove; portais usam DemandasPage
  form.methods = []
  return form
}

function upsertForm(forms, form) {
  const i = forms.findIndex((f) => f.id === form.id)
  if (i >= 0) forms[i] = form
  else forms.push(form)
}

function patchGroups(bundle, t, formId) {
  if (!bundle.groups.some((g) => g.id === t.groupId)) {
    bundle.groups.push({ id: t.groupId, name: t.groupName })
  }
  bundle.assignments = bundle.assignments || {}
  bundle.assignments[formId] = t.groupId
  bundle.memberOrderByGroup = bundle.memberOrderByGroup || {}
  const order = bundle.memberOrderByGroup[t.groupId] || []
  if (!order.includes(formId)) order.push(formId)
  bundle.memberOrderByGroup[t.groupId] = order
}

function patchWorkspace(workspaces, t, formId) {
  const ws = workspaces[0]
  if (!ws?.packages) return
  let pkg = ws.packages.find((p) => p.id === t.wsPkgId)
  if (!pkg) {
    pkg = { id: t.wsPkgId, name: t.wsPkgName, classes: [] }
    // Inserir após Demanda Completa se existir
    const idx = ws.packages.findIndex((p) => p.id === 'pkg-fase-3-demanda-completa')
    if (idx >= 0) ws.packages.splice(idx + 1, 0, pkg)
    else ws.packages.push(pkg)
  } else {
    pkg.name = t.wsPkgName
  }
  let cls = pkg.classes.find((c) => c.id === t.wsClsId)
  if (!cls) {
    cls = {
      id: t.wsClsId,
      name: t.name.replace('Demanda · ', ''),
      linkedFormId: formId,
    }
    pkg.classes.push(cls)
  } else {
    cls.name = t.name.replace('Demanda · ', '')
    cls.linkedFormId = formId
  }
}

const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
const source = forms.find((f) => f.id === SOURCE_ID)
if (!source) {
  console.error(`Fonte ${SOURCE_ID} não encontrada`)
  process.exit(1)
}

const groups = JSON.parse(fs.readFileSync(GROUPS, 'utf8'))
const workspaces = JSON.parse(fs.readFileSync(WS, 'utf8'))

for (const t of TARGETS) {
  const form = cloneForm(source, t)
  upsertForm(forms, form)
  patchGroups(groups, t, form.id)
  patchWorkspace(workspaces, t, form.id)
  console.log(`OK ${form.id} · ${form.fields.length} campos · ${form.sections.length} seções · ${(form.fieldVisibilityRules || []).length} regras`)
}

fs.writeFileSync(FORMS, JSON.stringify(forms, null, 2) + '\n', 'utf8')
fs.writeFileSync(GROUPS, JSON.stringify(groups, null, 2) + '\n', 'utf8')
fs.writeFileSync(WS, JSON.stringify(workspaces, null, 2) + '\n', 'utf8')
console.log('patch-demanda-portal-classes-cliente-parceiro: forms + class-groups + workspaces atualizados')
