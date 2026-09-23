import fs from 'fs'

const path = 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json'
let t = fs.readFileSync(path, 'utf8')
const last = t.lastIndexOf(']')
if (last < 0) throw new Error('no closing bracket')
const after = t.slice(last + 1)
if (after.replace(/\s/g, '') !== '') {
  console.log('trimming after last ]:', JSON.stringify(after))
  t = t.slice(0, last + 1) + '\n'
  fs.writeFileSync(path, t)
}
JSON.parse(fs.readFileSync(path, 'utf8'))
console.log('json ok')

const forms = JSON.parse(fs.readFileSync(path, 'utf8'))
const f = forms.find((x) => x.id === 'form-patlasv4-proto-demanda-completa')
console.log(
  f.fields
    .filter((x) => /cargo/i.test(x.id) && x.sectionId === 'sec-demc-solicitacao')
    .map((x) => x.label),
)
