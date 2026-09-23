#!/usr/bin/env node
/**
 * Remove campos type:alert da Demanda · Completa e move o conteúdo
 * para `spec` (Detalhamento dos campos / «exibir»).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const FORM_ID = 'form-patlasv4-proto-demanda-completa'
const P = 'patlasv4proto-demc-'

/** alertId → fieldId that receives the observation */
const ALERT_TO_FIELD = {
  [`${P}andamento-mapa`]: `${P}andamento-timeline`,
  [`${P}alert-status-aguardando-gestor`]: `${P}status`,
  [`${P}alert-status-aguardando-pre-analise-mti`]: `${P}status`,
  [`${P}alert-status-aguardando-analise`]: `${P}status`,
  [`${P}alert-status-aguardando-parceiro`]: `${P}status`,
  [`${P}alert-status-em-analise`]: `${P}status`,
  [`${P}alert-status-aguardando-assinatura-do-atendimento`]: `${P}status`,
  [`${P}alert-status-em-atendimento-parceiro`]: `${P}status`,
  [`${P}alert-status-aguardando-validacao-mti`]: `${P}status`,
  [`${P}alert-status-devolvida-para-correcao`]: `${P}status`,
  [`${P}alert-status-aguardando-autorizacao`]: `${P}status`,
  [`${P}alert-status-em-orcamento`]: `${P}status`,
  [`${P}alert-status-em-homologacao`]: `${P}status`,
  [`${P}alert-status-dilatacao-de-prazo`]: `${P}status`,
  [`${P}alert-status-recusada`]: `${P}status`,
  [`${P}alert-status-nao-autorizada`]: `${P}status`,
  [`${P}alert-status-efetivado-entregue`]: `${P}status`,
  [`${P}alert-status-aprovada-em-atendimento`]: `${P}status`,
  [`${P}fila-alerta`]: `${P}fila-regra`,
  [`${P}tipo-analise-alerta`]: `${P}tipo-analise`,
  [`${P}os-alerta`]: `${P}os-numero`,
  [`${P}assina-alerta`]: `${P}assina-gestor`,
  [`${P}raer-alerta`]: `${P}raer-status`,
  [`${P}sn-alerta`]: `${P}sn-status`,
  [`${P}vinculos-alerta`]: `${P}ref-orcamentos`,
}

function formatObservation(alert) {
  const title = (alert.alertTitle || alert.label || '').trim()
  const msg = (alert.alertMessage || '').trim()
  const parts = ['### Observação']
  if (title) parts.push(`**${title}**`)
  if (msg) parts.push(msg)
  return parts.join('\n\n')
}

function appendSpec(field, block) {
  const prev = (field.spec || '').trim()
  field.spec = prev ? `${prev}\n\n${block}` : block
}

const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
const form = forms.find((x) => x.id === FORM_ID)
if (!form) {
  console.error('Form not found:', FORM_ID)
  process.exit(1)
}

const alerts = form.fields.filter((f) => f.type === 'alert')
const alertIds = new Set(alerts.map((a) => a.id))
const byId = Object.fromEntries(form.fields.map((f) => [f.id, f]))

const unmapped = []
for (const alert of alerts) {
  const targetId = ALERT_TO_FIELD[alert.id]
  if (!targetId || !byId[targetId]) {
    unmapped.push(alert.id)
    continue
  }
  appendSpec(byId[targetId], formatObservation(alert))
}

if (unmapped.length) {
  console.error('Unmapped alerts:', unmapped)
  process.exit(1)
}

form.fields = form.fields.filter((f) => f.type !== 'alert')

form.fieldVisibilityRules = (form.fieldVisibilityRules || []).filter((r) => {
  const targets = r.targetFieldIds || []
  return !targets.some((id) => alertIds.has(id))
})

// Limpa presets / valores de exemplo que apontavam para alerts
for (const preset of form.exampleValuePresets || []) {
  if (!preset.values) continue
  for (const id of alertIds) delete preset.values[id]
}

fs.writeFileSync(FORMS, `${JSON.stringify(forms, null, 2)}\n`)
console.log(
  `OK: removed ${alerts.length} alerts; visibility rules left: ${form.fieldVisibilityRules.length}; fields: ${form.fields.length}`,
)
