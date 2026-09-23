/**
 * Migra ref. embutida: nestedFields inline -> novos FormDef + linkedFormId.
 * Uso: node scripts/migrate-embedded-to-linked.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'data', 'subprojects')

function uid() {
  return 'emb-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

function migrateFieldList(fields, siblingNewForms, parentFormName) {
  return fields.map((field) => {
    if (field.type === 'embeddedReference' && field.nestedFields != null) {
      const innerMigrated = migrateFieldList(field.nestedFields, siblingNewForms, parentFormName)
      const newFormId = uid()
      siblingNewForms.push({
        id: newFormId,
        name: `${parentFormName} — ${field.label || 'Embutido'}`,
        sectionLayout: 'none',
        fields: innerMigrated,
      })
      const { nestedFields, ...rest } = field
      return { ...rest, linkedFormId: newFormId }
    }
    const { nestedFields, ...rest } = field
    return rest
  })
}

function migrateFormsArray(forms) {
  const out = []
  for (const form of forms) {
    const newForms = []
    const fields = migrateFieldList(form.fields, newForms, form.name)
    out.push({ ...form, fields })
    out.push(...newForms)
  }
  return out
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full)
    else if (e.name === 'forms.json') {
      const raw = fs.readFileSync(full, 'utf8')
      const data = JSON.parse(raw)
      if (!Array.isArray(data)) continue
      const next = migrateFormsArray(data)
      fs.writeFileSync(full, JSON.stringify(next, null, 2) + '\n', 'utf8')
      console.log('Migrated', full)
    }
  }
}

walk(root)
