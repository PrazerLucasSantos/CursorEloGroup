#!/usr/bin/env node
/** Rodada 2 de limpeza (23/06):
 *  1. Remove bloco "Fornecedor" da Pessoa (Procon, trânsito em julgado, etc.) — sem fonte.
 *  2. Padroniza método de assinatura nas 3 telas (RN única: Senha + MFA).
 *  3. Remove direcionamento "Por Pessoa" (regra: roteamento por cargo/unidade).
 *  4. Nº projeto ServiceNow no Dossiê → opcional.
 *  5. Padroniza vocabulário "fornecedor" → "parceiro" (vestígios textuais).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const byField = (id) => forms.find((f) => f.fields?.some((x) => x.id === id))
const field = (form, id) => form?.fields?.find((f) => f.id === id)
const log = []

function stripFromPresets(form, fieldIds) {
  for (const p of form.exampleValuePresets || []) {
    if (p.fieldValues) for (const id of fieldIds) delete p.fieldValues[id]
    if (p.embeddedRowsByFieldId) for (const id of fieldIds) delete p.embeddedRowsByFieldId[id]
  }
}

// ---------- 1) Bloco "Fornecedor" na Pessoa ----------
const pes = byField('patlasv4proto-pes-fornecedor')
if (pes) {
  const remove = ['patlasv4proto-pes-fornecedor', 'patlasv4proto-pes-ativo-demandas', 'patlasv4proto-pes-procon-digital', 'patlasv4proto-pes-transito-julgado', 'patlasv4proto-pes-tipo-companhia']
  const b = pes.fields.length
  pes.fields = pes.fields.filter((f) => !remove.includes(f.id))
  pes.fieldVisibilityRules = (pes.fieldVisibilityRules || []).filter((r) => r.id !== 'rule-pes-show-fornecedor-campos')
  stripFromPresets(pes, remove)
  // remove a tag "Fornecedor" também
  const tags = field(pes, 'patlasv4proto-pes-tags')
  if (tags?.options) tags.options = tags.options.filter((o) => o !== 'Fornecedor')
  log.push(`Pessoa: removido bloco Fornecedor (${b - pes.fields.length} campos + regra + tag)`) 
}

// ---------- 2) Método de assinatura padronizado (RN única) ----------
const CANON = ['Certificado digital (A3)', 'Gov.br', 'Senha + MFA', 'MT Login / Sigadoc']
const SPEC = 'RN única — métodos válidos: Certificado digital (A3), Gov.br, Senha + MFA e MT Login/Sigadoc. Senha sempre acompanhada de MFA.'
for (const fid of ['patlasv4proto-assin-sig-metodo', 'patlasv4proto-msel-metodo', 'patlasv4proto-mea-metodo']) {
  const fm = field(byField(fid), fid)
  if (fm) { fm.options = [...CANON]; fm.spec = SPEC }
}
log.push('Assinatura: método padronizado nas 3 telas (e3/m1/m3) — RN única Senha + MFA')

// ---------- 3) Direcionamento "Por Pessoa" ----------
const dir = field(byField('patlasv4proto-processos-workflow-assinaturas-tipo-de-direcionamento'), 'patlasv4proto-processos-workflow-assinaturas-tipo-de-direcionamento')
const procForm = byField('patlasv4proto-processos-workflow-assinaturas-tipo-de-direcionamento')
if (dir) {
  dir.options = dir.options.filter((o) => o !== 'Por Pessoa')
  dir.spec = 'Roteamento por Cargo ou Unidade — nunca por pessoa nominal (regra arquitetural). Origem: Etapa do Workflow.'
  procForm.fields = procForm.fields.filter((f) => f.id !== 'patlasv4proto-processos-workflow-assinaturas-pessoa-especifica')
  stripFromPresets(procForm, ['patlasv4proto-processos-workflow-assinaturas-pessoa-especifica'])
  log.push('Processos: removido "Por Pessoa" + campo "Pessoa específica" (roteamento por cargo/unidade)')
}

// ---------- 4) Nº projeto ServiceNow no Dossiê → opcional ----------
const snow = field(byField('patlasv4proto-ev-snow'), 'patlasv4proto-ev-snow')
if (snow) { snow.required = false; snow.spec = 'Opcional. Ex.: PRJ0012345 (confirmar obrigatoriedade com a área).'; log.push('Dossiê: Nº projeto ServiceNow agora é opcional') }

// ---------- 5) Vocabulário fornecedor → parceiro ----------
const cf = field(byField('patlasv4proto-contrato-conta-fornecedor'), 'patlasv4proto-contrato-conta-fornecedor')
if (cf) { cf.label = 'Conta do parceiro'; cf.spec = 'Conta bancária do parceiro para pagamentos.'; log.push('Contrato: "Conta do fornecedor" → "Conta do parceiro"') }
const cod = field(byField('patlasv4proto-mpt-cod-fornecedor'), 'patlasv4proto-mpt-cod-fornecedor')
if (cod) { cod.label = 'Código do parceiro (Protheus)'; cod.spec = 'Código do parceiro/cliente no Protheus.'; log.push('Modelo Protheus: "Código do fornecedor Protheus" → "Código do parceiro (Protheus)"') }

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
console.log(log.join('\n'))
