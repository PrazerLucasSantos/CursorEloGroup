/**
 * Extrai classes do workspace Atlas V2 → JSON compacto + HTML protótipo navegável.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const epic = join(root, 'data/subprojects/atlas-prototipo/epics/atlas-v2')
const outDir = join(root, 'exports')

const forms = JSON.parse(readFileSync(join(epic, 'forms.json'), 'utf8'))
const workspaces = JSON.parse(readFileSync(join(epic, 'workspaces.json'), 'utf8'))
const formById = Object.fromEntries(forms.map((f) => [f.id, f]))

function slimField(f) {
  return {
    id: f.id,
    label: f.label,
    type: f.type,
    size: f.size || 'medium',
    readOnly: !!f.readOnly,
    required: !!f.required,
    multiple: !!f.multiple,
    hidden: !!f.hidden || !!f.partnerHidden,
    partnerHidden: !!f.partnerHidden,
    relevance: f.relevance || 'common',
    sectionId: f.sectionId || null,
    textLong: !!f.textLong,
    currency: !!f.currency,
    options: Array.isArray(f.options) ? f.options : undefined,
    linkedFormId: f.linkedFormId || undefined,
    embeddedDisplay: f.embeddedDisplay || undefined,
  }
}

function slimForm(form) {
  if (!form) return null
  return {
    id: form.id,
    name: form.name,
    sectionLayout: form.sectionLayout || 'tabs',
    metadata: form.metadata || '',
    sections: (form.sections || []).map((s) => ({
      id: s.id,
      title: s.title,
      icon: s.icon,
      parentSectionId: s.parentSectionId || null,
    })),
    fields: (form.fields || []).map(slimField),
    methods: (form.methods || []).map((m) => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      kind: m.kind,
      inputFormId: m.inputFormId || undefined,
    })),
    fieldVisibilityRules: form.fieldVisibilityRules || [],
    presets: (form.exampleValuePresets || []).map((p) => ({
      id: p.id,
      name: p.name,
      iconColor: p.iconColor,
      fieldValues: p.fieldValues || {},
      embeddedRowsByFieldId: p.embeddedRowsByFieldId || {},
    })),
  }
}

const packages = []
const formsOut = {}

for (const ws of workspaces) {
  for (const pkg of ws.packages || []) {
    const classes = []
    for (const cls of pkg.classes || []) {
      const formId = cls.linkedFormId
      if (!formId) continue
      if (!formsOut[formId] && formById[formId]) {
        formsOut[formId] = slimForm(formById[formId])
      }
      // also pull method input forms + linked embedded forms referenced by fields
      const form = formById[formId]
      if (form) {
        for (const m of form.methods || []) {
          if (m.inputFormId && formById[m.inputFormId] && !formsOut[m.inputFormId]) {
            formsOut[m.inputFormId] = slimForm(formById[m.inputFormId])
          }
        }
        for (const f of form.fields || []) {
          if (f.linkedFormId && formById[f.linkedFormId] && !formsOut[f.linkedFormId]) {
            // keep nested light — only if it's a catalog helper
            if (
              f.linkedFormId.includes('cat-') ||
              f.linkedFormId.includes('portal') ||
              f.linkedFormId.includes('analise') ||
              f.linkedFormId.includes('dados-parceria') ||
              f.linkedFormId.includes('historico') ||
              f.type === 'embeddedReference'
            ) {
              formsOut[f.linkedFormId] = slimForm(formById[f.linkedFormId])
            }
          }
        }
      }
      classes.push({
        id: cls.id,
        name: cls.name,
        formId,
        presetIds: cls.presetIds || [],
      })
    }
    packages.push({
      id: pkg.id,
      name: pkg.name,
      workspaceId: ws.id,
      workspaceName: ws.name,
      classes,
    })
  }
}

const data = {
  generatedAt: new Date().toISOString(),
  epic: 'Atlas V2',
  packages,
  forms: formsOut,
}

mkdirSync(outDir, { recursive: true })
const jsonPath = join(outDir, 'atlas-v2-proto-data.json')
writeFileSync(jsonPath, JSON.stringify(data))
console.log('JSON:', jsonPath)
console.log('Packages:', packages.length, 'Forms:', Object.keys(formsOut).length)
console.log(
  'Classes:',
  packages.reduce((n, p) => n + p.classes.length, 0),
)

// Em seguida gera o HTML navegável
await import('./build-atlas-v2-proto-html.mjs')
