#!/usr/bin/env node
/**
 * Cria classes do fluxo: Proposta → Documentos → Contrato → Emissão OS → Termo Homologação → RAER
 * Campos extraídos da tela Processos (documento Atlas). Preserva demais formulários.
 *
 * Uso: node scripts/patch-atlas-v4-fluxo-classes.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-v4-prototipo')
const formsPath = path.join(epicDir, 'forms.json')
const classGroupsPath = path.join(epicDir, 'class-groups.json')
const workspacesPath = path.join(epicDir, 'workspaces.json')

const FORM_PROC = 'form-patlasv4-proto-processos'
const GROUP_FLUXO = 'grp-patlasv4-proto-fluxo'

const CLASSES = [
  {
    id: 'form-patlasv4-proto-proposta',
    name: 'Proposta',
    sectionId: 'sec-processos-proposta',
    idPrefix: 'patlasv4proto-proposta',
    homologFields: null,
  },
  {
    id: 'form-patlasv4-proto-documentos',
    name: 'Documentos',
    sectionId: 'sec-processos-documentos',
    idPrefix: 'patlasv4proto-documentos',
    homologFields: null,
  },
  {
    id: 'form-patlasv4-proto-contrato',
    name: 'Contrato',
    sectionId: 'sec-processos-contrato',
    idPrefix: 'patlasv4proto-contrato',
    homologFields: null,
    refPatches: {
      'proposta-vinculada': 'form-patlasv4-proto-proposta',
    },
  },
  {
    id: 'form-patlasv4-proto-emissao-ordem-servico',
    name: 'Emissão de Ordem de Serviço',
    sectionId: 'sec-processos-ordem-de-servico',
    idPrefix: 'patlasv4proto-emissao-ordem-servico',
    homologFields: null,
    refPatches: {
      'contrato-vinculado': 'form-patlasv4-proto-contrato',
      cliente: 'form-patlasv4-proto-organizacao',
    },
  },
  {
    id: 'form-patlasv4-proto-termo-homologacao',
    name: 'Termo de Homologação',
    sectionId: 'sec-processos-homologacao-raer',
    idPrefix: 'patlasv4proto-termo-homologacao',
    fieldFilter: (f) =>
      !f.id.includes('raer-necessario') &&
      !f.id.includes('documento-raer') &&
      !f.id.includes('status-raer'),
    extraFields: [
      {
        label: 'Emissão de Ordem de Serviço vinculada',
        slug: 'emissao-ordem-servico-vinculada',
        type: 'reference',
        linkedFormId: 'form-patlasv4-proto-emissao-ordem-servico',
        required: false,
        spec: 'OS que originou a necessidade de homologação.',
      },
    ],
  },
  {
    id: 'form-patlasv4-proto-raer',
    name: 'RAER',
    sectionId: 'sec-processos-homologacao-raer',
    idPrefix: 'patlasv4proto-raer',
    fieldFilter: (f) =>
      f.id.includes('raer-necessario') ||
      f.id.includes('documento-raer') ||
      f.id.includes('status-raer'),
    refPatches: {
      'ordem-servico-vinculada': 'form-patlasv4-proto-emissao-ordem-servico',
    },
    extraFields: [
      {
        label: 'Termo de Homologação vinculado',
        slug: 'termo-homologacao-vinculado',
        type: 'reference',
        linkedFormId: 'form-patlasv4-proto-termo-homologacao',
        required: false,
        spec: 'Relacionar termo de homologação que originou o RAER.',
      },
    ],
  },
]

function slug(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function fieldSlugFromOldId(oldId, sectionKey) {
  const prefix = `patlasv4proto-processos-${sectionKey}-`
  if (oldId.startsWith(prefix)) return oldId.slice(prefix.length)
  const parts = oldId.split('-')
  return parts.slice(parts.indexOf(sectionKey.split('-')[0]) + 1).join('-') || slug(oldId)
}

function remapField(field, cls, sectionKey) {
  const suffix = fieldSlugFromOldId(field.id, sectionKey.replace('sec-processos-', ''))
  const newId = `${cls.idPrefix}-${suffix}`
  const next = { ...field, id: newId }
  delete next.sectionId

  if (cls.refPatches) {
    for (const [key, formId] of Object.entries(cls.refPatches)) {
      if (suffix === key || suffix.endsWith(`-${key}`) || newId.endsWith(`-${key}`)) {
        next.type = 'reference'
        next.linkedFormId = formId
      }
    }
  }

  return next
}

function sectionKeyFromSectionId(sectionId) {
  return sectionId.replace('sec-processos-', '')
}

function buildProcessoVinculado(prefix) {
  return {
    id: `${prefix}-processo-vinculado`,
    label: 'Processo vinculado',
    type: 'reference',
    size: 'medium',
    readOnly: false,
    required: true,
    multiple: false,
    relevance: 'highlight',
    linkedFormId: FORM_PROC,
    spec: 'Processo operacional ao qual esta etapa do fluxo pertence.',
  }
}

function buildExtraField(prefix, def) {
  const field = {
    id: `${prefix}-${def.slug}`,
    label: def.label,
    type: def.type,
    size: 'medium',
    readOnly: false,
    required: def.required ?? false,
    multiple: false,
    relevance: 'common',
    spec: def.spec ?? '',
  }
  if (def.linkedFormId) field.linkedFormId = def.linkedFormId
  if (def.type === 'textOptions') field.options = def.options ?? ['—']
  return field
}

function sampleValue(field) {
  switch (field.type) {
    case 'boolean':
      return true
    case 'number':
      return field.currency ? 2500 : 1
    case 'date':
      return '2026-05-27T10:00:00'
    case 'file':
      return `${slug(field.label)}.pdf`
    case 'textOptions':
      return field.options?.[0] ?? '—'
    case 'reference':
      return 'Referência'
    default:
      if (field.textLong) return `Exemplo: ${field.label}`
      if (field.relevance === 'identity') return `Exemplo ${field.label}`
      return `Valor ${field.label}`
  }
}

function buildPresets(form, slugName) {
  const variants = [
    { id: 'mti', name: 'Exemplo MTI', color: '#0c4a6e' },
    { id: 'parceiro', name: 'Exemplo Parceiro', color: '#7c3aed' },
    { id: 'cliente', name: 'Exemplo Cliente', color: '#0d9488' },
  ]
  return variants.map((v) => {
    const values = {}
    for (const f of form.fields) values[f.id] = sampleValue(f)
    return {
      id: `patlasv4proto-p-${slugName}-${v.id}`,
      name: v.name,
      iconColor: v.color,
      fieldValues: values,
    }
  })
}

function buildForm(cls, sourceFields) {
  const sectionKey = sectionKeyFromSectionId(cls.sectionId)
  let fields = sourceFields
    .filter((f) => f.sectionId === cls.sectionId)
    .filter((f) => (cls.fieldFilter ? cls.fieldFilter(f) : true))
    .map((f) => remapField(f, cls, sectionKey))

  fields = [buildProcessoVinculado(cls.idPrefix), ...fields]

  if (cls.extraFields) {
    fields.push(...cls.extraFields.map((d) => buildExtraField(cls.idPrefix, d)))
  }

  const form = {
    id: cls.id,
    name: cls.name,
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: `Protótipo Atlas — ${cls.name}. Fluxo: Proposta → Documentos → Contrato → OS → Homologação → RAER.`,
    fields,
    exampleValuePresets: buildPresets({ fields }, slug(cls.name)),
    activeExamplePresetId: `patlasv4proto-p-${slug(cls.name)}-mti`,
  }
  return form
}

// --- main ---
const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
const procForm = forms.find((f) => f.id === FORM_PROC)
if (!procForm) {
  console.error('Formulário Processos não encontrado.')
  process.exit(1)
}

const newFormIds = new Set(CLASSES.map((c) => c.id))
const kept = forms.filter((f) => !newFormIds.has(f.id))
const newForms = CLASSES.map((cls) => buildForm(cls, procForm.fields))
const merged = [...kept, ...newForms]

fs.writeFileSync(formsPath, JSON.stringify(merged, null, 2) + '\n', 'utf8')

let classGroups = JSON.parse(fs.readFileSync(classGroupsPath, 'utf8'))
if (!classGroups.groups.find((g) => g.id === GROUP_FLUXO)) {
  classGroups.groups.push({ id: GROUP_FLUXO, name: 'Fluxo operacional' })
}
for (const cls of CLASSES) {
  classGroups.assignments[cls.id] = GROUP_FLUXO
}
classGroups.memberOrderByGroup[GROUP_FLUXO] = CLASSES.map((c) => c.id)
fs.writeFileSync(classGroupsPath, JSON.stringify(classGroups, null, 2) + '\n', 'utf8')

const workspaces = JSON.parse(fs.readFileSync(workspacesPath, 'utf8'))
const ws = workspaces[0]
if (!ws.packages.find((p) => p.id === 'pkg-patlasv4-proto-fluxo')) {
  ws.packages.push({
    id: 'pkg-patlasv4-proto-fluxo',
    name: 'Fluxo operacional',
    classes: CLASSES.map((cls) => ({
      id: `cls-patlasv4-proto-${slug(cls.name)}`,
      name: cls.name,
      linkedFormId: cls.id,
      linkedFormExamplePresetIds: [
        `patlasv4proto-p-${slug(cls.name)}-mti`,
        `patlasv4proto-p-${slug(cls.name)}-parceiro`,
        `patlasv4proto-p-${slug(cls.name)}-cliente`,
      ],
    })),
  })
} else {
  const pkg = ws.packages.find((p) => p.id === 'pkg-patlasv4-proto-fluxo')
  pkg.classes = CLASSES.map((cls) => ({
    id: `cls-patlasv4-proto-${slug(cls.name)}`,
    name: cls.name,
    linkedFormId: cls.id,
    linkedFormExamplePresetIds: [
      `patlasv4proto-p-${slug(cls.name)}-mti`,
      `patlasv4proto-p-${slug(cls.name)}-parceiro`,
      `patlasv4proto-p-${slug(cls.name)}-cliente`,
    ],
  }))
}
fs.writeFileSync(workspacesPath, JSON.stringify(workspaces, null, 2) + '\n', 'utf8')

for (const f of newForms) {
  console.log(`${f.name}: ${f.fields.length} campos`)
}
console.log(`forms.json: ${merged.length} formulários`)
