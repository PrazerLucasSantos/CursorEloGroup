import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const formsPath = path.join(
  root,
  'data/epics/projeto-nao-e-nao-seplag-v1/forms.json',
)
const outDir = path.join(root, 'conhecimento/modelagem')

const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))

function dump(id, fileName) {
  const f = forms.find((x) => x.id === id)
  if (!f) {
    console.error('missing', id)
    return
  }
  const allFields = f.fields || []
  const lines = [`# ${f.title || f.name}`, '', `ID: \`${id}\``, '']
  const sections = f.sections || []
  if (sections.length) {
    for (const s of sections) {
      lines.push(`## ${s.title || s.label || s.id}`, '')
      const sf = allFields.filter((fl) => fl.sectionId === s.id)
      for (const fl of sf) {
        const req = fl.required ? ' *' : ''
        lines.push(
          `- ${fl.label || fl.title || fl.id}${req} — \`${fl.type || ''}\` (\`${fl.id || ''}\`)`,
        )
      }
      if (!sf.length) lines.push('_Sem campos nesta seção._')
      lines.push('')
    }
  } else {
    for (const fl of allFields) {
      const req = fl.required ? ' *' : ''
      lines.push(
        `- ${fl.label || fl.title || fl.id}${req} — \`${fl.type || ''}\` (\`${fl.id || ''}\`)`,
      )
    }
    lines.push('')
  }
  const ms = f.methods || f.methodActions
  if (ms?.length) {
    lines.push('## Métodos', '')
    for (const m of ms) {
      lines.push(`- ${m.label || m.title || m.id || m.name} (\`${m.id || ''}\`)`)
    }
    lines.push('')
  }
  fs.mkdirSync(outDir, { recursive: true })
  const out = path.join(outDir, fileName)
  fs.writeFileSync(out, lines.join('\n'), 'utf8')
  console.log('wrote', out, 'fields', allFields.length)
}

dump('form-nen-solicitacao', 'formulario-solicitacao.md')
dump('form-nen-analise-decisao', 'formulario-analise-decisao.md')
dump('form-nen-capacitado', 'formulario-capacitado.md')

const inv = [
  '# Inventário de classes',
  '',
  '| ID | Nome | Seções | Campos |',
  '|----|------|--------|--------|',
]
for (const f of forms) {
  inv.push(
    `| \`${f.id}\` | ${f.title || f.name} | ${(f.sections || []).length} | ${(f.fields || []).length} |`,
  )
}
inv.push('')
fs.writeFileSync(path.join(outDir, 'inventario-classes.md'), inv.join('\n'), 'utf8')
console.log('inventory ok')
