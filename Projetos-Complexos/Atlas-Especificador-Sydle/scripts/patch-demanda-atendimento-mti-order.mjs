/**
 * Reorganiza Atendimento MTI:
 * Tipo da análise | Modalidade do serviço
 * Parceria | Solução | Fabricante | Catálogo
 * Produtos
 * (demais campos da seção na ordem relativa anterior)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORMS = path.join(
  root,
  'data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

/** Prefixo → { sectionId, headIds (ordem desejada no topo) } */
const CONFIGS = [
  {
    prefix: 'patlasv4proto-demc',
    sectionId: 'sec-demc-atendimento-mti',
    moveIntoSection: ['parceria', 'solucao-vigente'],
    head: [
      'tipo-analise',
      'modalidade-servico',
      'parceria',
      'solucao-vigente',
      'fabricante',
      'catalogos',
      'itens',
    ],
  },
  {
    prefix: 'patlasv4proto-demcli',
    sectionId: 'sec-demcli-atendimento',
    moveIntoSection: ['parceria'],
    head: [
      'tipo-analise',
      'modalidade-servico',
      'parceria',
      'solucao-catalogo',
      'fabricante',
      'catalogos',
      'itens',
    ],
  },
  {
    prefix: 'patlasv4proto-dempar',
    sectionId: 'sec-dempar-atendimento',
    moveIntoSection: ['parceria'],
    head: [
      'tipo-analise',
      'modalidade-servico',
      'parceria',
      'solucao-catalogo',
      'fabricante',
      'catalogos',
      'itens',
    ],
  },
]

function idOf(prefix, suf) {
  return `${prefix}-${suf}`
}

function patchForm(form, cfg) {
  if (!form?.fields) return false
  const { prefix, sectionId, moveIntoSection, head } = cfg
  const headIds = head.map((s) => idOf(prefix, s))
  const headSet = new Set(headIds)

  for (const suf of moveIntoSection) {
    const f = form.fields.find((x) => x.id === idOf(prefix, suf))
    if (f) f.sectionId = sectionId
  }

  const inSection = form.fields.filter((f) => f.sectionId === sectionId)
  if (!inSection.length) return false

  const byId = new Map(inSection.map((f) => [f.id, f]))
  const headFields = headIds.map((id) => byId.get(id)).filter(Boolean)
  const rest = inSection.filter((f) => !headSet.has(f.id))
  const ordered = [...headFields, ...rest]

  const indices = []
  form.fields.forEach((f, i) => {
    if (f.sectionId === sectionId) indices.push(i)
  })
  if (indices.length !== ordered.length) {
    console.warn('count mismatch', form.id, indices.length, ordered.length)
  }
  ordered.forEach((f, j) => {
    form.fields[indices[j]] = f
  })

  // Garante labels curtos no topo
  const solucao =
    byId.get(idOf(prefix, 'solucao-vigente')) || byId.get(idOf(prefix, 'solucao-catalogo'))
  if (solucao && headSet.has(solucao.id)) solucao.label = 'Solução'
  const produtos = byId.get(idOf(prefix, 'itens'))
  if (produtos) produtos.label = 'Produtos'
  const fab = byId.get(idOf(prefix, 'fabricante'))
  if (fab) fab.label = 'Fabricante'
  const cat = byId.get(idOf(prefix, 'catalogos'))
  if (cat) cat.label = 'Catálogo'

  return true
}

const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
let n = 0
for (const form of forms) {
  for (const cfg of CONFIGS) {
    if (patchForm(form, cfg)) n += 1
  }
}
fs.writeFileSync(FORMS, `${JSON.stringify(forms, null, 2)}\n`)
console.log('OK patched forms with atendimento order:', n)
