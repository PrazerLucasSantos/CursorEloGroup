/**
 * Remove IA da Demanda F3 (nesta fase não haverá IA).
 * Uso: node scripts/remove-ia-demanda-f3.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')

function scrub(s) {
  if (typeof s !== 'string') return s
  return s
    .replace(/\s*·?\s*IA sugere;?\s*MTI decide\.?/gi, '')
    .replace(/,\s*sugestão IA/gi, '')
    .replace(/\s*\(\+obs\/anexo \+ chat IA\)/gi, ' (+obs/anexo)')
    .replace(/\s*\+ chat IA/gi, '')
    .replace(/chat IA/gi, '')
    .replace(/<li><strong>IA sugere; MTI decide<\/strong> na qualificação\.<\/li>\s*/gi, '')
    .replace(/IA sugere;?\s*MTI decide\.?\s*/gi, '')
    .replace(/Sugestão da IA é apoio — a decisão é da MTI\.?/gi, 'A decisão é da MTI.')
    .replace(/IA sugere;?\s*decisão final sempre da MTI\.?/gi, '')
    .trim()
}

function stripForm(form) {
  if (!form) return
  form.fields = (form.fields || []).filter(
    (f) => !/sugestao-ia|sugestão da ia/i.test(`${f.id} ${f.label}`),
  )
  form.metadata = scrub(form.metadata)
  for (const f of form.fields) {
    if (f.spec) f.spec = scrub(f.spec)
    if (f.alertMessage) f.alertMessage = scrub(f.alertMessage)
  }
  for (const p of form.exampleValuePresets || []) {
    if (!p.fieldValues) continue
    delete p.fieldValues['patlasv4proto-demanda-sugestao-ia']
    delete p.fieldValues['patlasv4proto-mdem-qual-sugestao-ia']
  }
}

const formsPath = path.join(EPIC, 'forms.json')
let formsRaw = fs.readFileSync(formsPath, 'utf8')
if (formsRaw.endsWith(']\\n')) formsRaw = formsRaw.slice(0, -2) + '\n'
const forms = JSON.parse(formsRaw)
stripForm(forms.find((f) => f.id === 'form-patlasv4-proto-demanda'))
stripForm(forms.find((f) => f.id === 'form-patlasv4-proto-metodo-demanda-qualificar'))
const qual = forms.find((f) => f.id === 'form-patlasv4-proto-metodo-demanda-qualificar')
if (qual) {
  qual.metadata =
    'Exclusivo MTI. Solução + catálogo + parceiro(s). Individual ou coletivo. Sem IA nesta fase.'
  const alerta = qual.fields.find((f) => f.id === 'patlasv4proto-mdem-qual-alerta')
  if (alerta) {
    alerta.alertMessage =
      'Usar quando o contrato/solução não enquadra sozinho. A decisão é da MTI (sem sugestão de IA nesta fase).'
  }
}
fs.writeFileSync(formsPath, JSON.stringify(forms, null, 2) + '\n')

const flowsPath = path.join(EPIC, 'flows.json')
const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
for (const flow of flows) {
  if (!flow.id || !String(flow.id).includes('demanda')) continue
  flow.metadata = scrub(flow.metadata)
  flow.description = scrub(flow.description)
  for (const step of flow.steps || []) {
    for (const [k, v] of Object.entries(step)) {
      if (typeof v === 'string') step[k] = scrub(v)
      if (Array.isArray(v)) step[k] = v.map((x) => (typeof x === 'string' ? scrub(x) : x))
    }
  }
}
fs.writeFileSync(flowsPath, JSON.stringify(flows, null, 2) + '\n')

const blob = JSON.stringify({
  dem: forms.find((f) => f.id === 'form-patlasv4-proto-demanda'),
  qual,
  flows: flows.filter((f) => String(f.id).includes('demanda-mti') || String(f.id).includes('demanda-parceiro')),
})
console.log('IA residual?', /sugestao-ia|Sugestão da IA|IA sugere|chat IA/i.test(blob))
console.log('OK: IA removida da Demanda F3')
