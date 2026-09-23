#!/usr/bin/env node
/**
 * Prototipação: métodos Demanda só no menu ⋮, ordem do fluxo F3,
 * e corrige navigate maps method-demanda-* → method-demc-*.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/projeto-atlas-prototipacao',
)

/** Ordem canônica alinhada a flow-proto-demanda-mti (fontes F3). */
const METHOD_ORDER = [
  'method-demc-ver-andamento',
  'method-demc-pre-analise',
  'method-demc-qualificar',
  'method-demc-iniciar-analise',
  'method-demc-parceiro-iniciar',
  'method-demc-parceiro-declarar',
  'method-demc-validar-parceiro',
  'method-demc-via-contrato',
  'method-demc-assinar-atendimento',
  'method-demc-orcamento',
  'method-demc-devolver',
  'method-demc-recusar',
  'method-demc-autorizar-sn',
  'method-demc-encerrar-termo',
  'method-demc-ajuste-termo',
]

const FORM_IDS = [
  'form-patlasv4-proto-demanda-completa',
  'form-patlasv4-proto-demanda-portal-cliente',
  'form-patlasv4-proto-demanda-portal-parceiro',
]

function reorderMethods(methods) {
  const byId = new Map(methods.map((m) => [m.id, { ...m, kind: 'menu' }]))
  const ordered = []
  for (const id of METHOD_ORDER) {
    const m = byId.get(id)
    if (m) {
      ordered.push(m)
      byId.delete(id)
    }
  }
  for (const m of byId.values()) {
    ordered.push({ ...m, kind: 'menu' })
  }
  return ordered
}

const formsPath = path.join(EPIC, 'forms.json')
const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
for (const id of FORM_IDS) {
  const form = forms.find((f) => f.id === id)
  if (!form?.methods) {
    console.warn('skip', id)
    continue
  }
  const before = form.methods.map((m) => `${m.id}:${m.kind}`).join(', ')
  form.methods = reorderMethods(form.methods)
  const after = form.methods.map((m) => `${m.id}:${m.kind}`).join(', ')
  console.log('OK', id)
  console.log('  before:', before)
  console.log('  after: ', after)
}
fs.writeFileSync(formsPath, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

const flowsPath = path.join(EPIC, 'flows.json')
let flowsRaw = fs.readFileSync(flowsPath, 'utf8')
const beforeCount = (flowsRaw.match(/method-demanda-/g) || []).length
// Prefer demc keys; keep demc if already present by replacing demanda→demc
flowsRaw = flowsRaw.replaceAll('method-demanda-', 'method-demc-')
// Workspace package/class ids (legado → completa)
flowsRaw = flowsRaw.replaceAll(
  'pkg-fase-3-demanda::cls-mapa-demanda::',
  'pkg-fase-3-demanda-completa::cls-mapa-demanda-completa::',
)
fs.writeFileSync(flowsPath, flowsRaw, 'utf8')
const afterCount = (flowsRaw.match(/method-demanda-/g) || []).length
const demcNav = (flowsRaw.match(/method-demc-/g) || []).length
console.log('flows: method-demanda- before', beforeCount, 'after', afterCount, '| method-demc- now', demcNav)
