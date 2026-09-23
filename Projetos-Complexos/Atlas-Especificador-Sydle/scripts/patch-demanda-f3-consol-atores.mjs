/**
 * Alinha metadados das classes/métodos Demanda F3 no epic atlas-prototipo
 * ao Consol. 1.0 / Documentador — sem tratar MTI como portal.
 *
 * Uso: node scripts/patch-demanda-f3-consol-atores.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const formsPath = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const BANNER =
  'Consol. 1.0 · Documentador F3. Atores: SISTEMA | CLIENTE | PARCEIRO | MTI (Projeto Atlas — NÃO é portal).'

const patches = [
  {
    idIncludes: 'demanda-completa',
    nameIncludes: 'Demanda',
    appendSpec: [
      BANNER,
      'L5 Contato secundário OPCIONAL.',
      'L6 N2: gestor E fiscal (aprovar/devolver/recusar).',
      'L1 Parceiro: mesmo menu da MTI em modo PROPOSITIVO; MTI delibera em definitivo.',
      'RN-SUP-01 Bater ponto só Consumo/serviço — não suporte.',
      'T2 OS: orçamento = gerente assina; via contrato = só autoriza.',
      'T3 Dois SLAs: demanda no registro; execução na autorização.',
      'T4 Sem OS: alerta, não bloqueio universal.',
      'L2/L4 MTI encerra → modal termo + RAER no mesmo evento.',
      'L3 Termo: gestor+fiscal+solicitante; MTI/parceiro NÃO assinam.',
      'T1 Solicitar proposta no portal IN; CRM diferido.',
      'Sem ação "reabrir". Autorização de execução = MTI (não cliente).',
    ].join(' '),
  },
]

function ensureSpec(form, text) {
  const meta = form.metadata || ''
  if (meta.includes('Consol. 1.0 · Documentador F3')) return false
  form.metadata = meta ? `${meta}\n\n${text}` : text
  return true
}

const raw = fs.readFileSync(formsPath, 'utf8')
const forms = JSON.parse(raw)
let changed = 0

for (const form of forms) {
  const id = String(form.id || '')
  const name = String(form.name || '')
  const isDemanda =
    id.includes('demanda') ||
    name.toLowerCase().includes('demanda') ||
    String(form.metadata || '').toLowerCase().includes('demanda f3')
  if (!isDemanda) continue
  if (ensureSpec(form, patches[0].appendSpec)) changed += 1
}

fs.writeFileSync(formsPath, JSON.stringify(forms, null, 2) + '\n', 'utf8')
console.log(`patch-demanda-f3-consol-atores: ${changed} forms atualizados em ${formsPath}`)
