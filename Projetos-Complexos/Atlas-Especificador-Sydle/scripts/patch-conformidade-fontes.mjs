#!/usr/bin/env node
/** Ajustes de conformidade com as fontes:
 *  1. Tipo de cobrança: adiciona "Pro-Rata" (PEAP).
 *  2. Reintroduz "Pessoa específica" como campo OPCIONAL no workflow (refino dentro do cargo).
 *  3. Alinha rótulos dos módulos (Administração/Catálogo e Proposta/Workflow/Integrações/Publicações).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const byField = (id) => forms.find((f) => f.fields?.some((x) => x.id === id))
const log = []

// ---------- 1) Pro-Rata ----------
const cob = forms.find((f) => f.id === 'form-patlasv4-proto-cat-tipo-cobranca')
if (cob && !cob.exampleValuePresets.some((p) => p.name === 'Pro-Rata')) {
  cob.exampleValuePresets.push({
    id: 'form-patlasv4-proto-cat-tipo-cobranca-p-prorata',
    name: 'Pro-Rata',
    fieldValues: {
      'form-patlasv4-proto-cat-tipo-cobranca-modelo': 'Pro-Rata',
      'form-patlasv4-proto-cat-tipo-cobranca-recorrencia': 'Anual proporcional (cobrança integral em janeiro)',
    },
  })
  log.push('Catálogo: tipo de cobrança "Pro-Rata" adicionado (PEAP)')
}

// ---------- 2) Pessoa específica (opcional) ----------
const proc = byField('patlasv4proto-processos-workflow-assinaturas-cargo')
if (proc && !proc.fields.some((f) => f.id === 'patlasv4proto-processos-workflow-assinaturas-pessoa-especifica')) {
  const i = proc.fields.findIndex((f) => f.id === 'patlasv4proto-processos-workflow-assinaturas-cargo')
  proc.fields.splice(i + 1, 0, {
    id: 'patlasv4proto-processos-workflow-assinaturas-pessoa-especifica',
    label: 'Pessoa específica (opcional)',
    type: 'reference',
    size: 'medium',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'common',
    sectionId: 'sec-processos-workflow-assinaturas',
    linkedFormId: 'form-patlasv4-proto-pessoa',
    spec: 'Opcional — refina o direcionamento para uma pessoa específica dentro do cargo selecionado. Em branco = qualquer ocupante do cargo (regra padrão por cargo).',
  })
  log.push('Processos: "Pessoa específica (opcional)" reintroduzida como refino do cargo')
}

// ---------- 3) Alinhar rótulos de módulos ----------
const EXECUTOR = ['Catálogo e Proposta', 'Integrações', 'Publicações']
const UO_MODULOS = ['Administração', 'Catálogo e Proposta', 'Workflow de assinatura', 'Integrações', 'Publicações', 'Relatórios']
const MAP = {
  'Catálogo/ Proposta': 'Catálogo e Proposta', 'Catálogos': 'Catálogo e Proposta',
  Propostas: 'Catálogo e Proposta', Parcerias: 'Catálogo e Proposta',
  Workflow: 'Workflow de assinatura', 'Pedidos de venda': 'Integrações',
  'Contábil': 'Integrações', Saldo: 'Relatórios',
}
const remap = (v) => MAP[v] || v
const dedupe = (arr) => [...new Set(arr)]

for (const f of forms) {
  for (const fl of f.fields || []) {
    if (fl.id === 'mql22xheoalehd' || fl.id === 'patlasv4proto-mcc-modulos-executor') {
      fl.options = [...EXECUTOR]
      fl.spec = 'Somente quando Administrador = Não. Módulos do executor (interseção com Módulos visíveis da UO). Workflow/Administração são exclusivos do Administrador.'
    }
    if (fl.id === 'patlasv4proto-uo-modulos-visiveis') {
      fl.options = [...UO_MODULOS]
    }
  }
  for (const p of f.exampleValuePresets || []) {
    if (!p.fieldValues) continue
    for (const key of ['mql22xheoalehd', 'patlasv4proto-mcc-modulos-executor', 'patlasv4proto-uo-modulos-visiveis']) {
      const v = p.fieldValues[key]
      if (Array.isArray(v)) p.fieldValues[key] = dedupe(v.map(remap))
      else if (typeof v === 'string') p.fieldValues[key] = dedupe(v.split(' / ').map((s) => remap(s.trim()))).join(' / ')
    }
  }
}
log.push(`Módulos alinhados: Cargo/criar-cargo (executor) = [${EXECUTOR.join(', ')}]; UO = [${UO_MODULOS.join(', ')}]`)

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
console.log(log.join('\n'))
