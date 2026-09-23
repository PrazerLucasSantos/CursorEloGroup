#!/usr/bin/env node
/**
 * Catálogo & Produto entra na Fase 1: completa lacunas DIRC + PEAP e integra ao fluxo.
 * 1 Produto: Código SIAG + Código Protheus
 * 2 Categoria de Objeto Comercial vale para Licença e Serviço
 * 3 Catálogo Universal: conversores por complexidade
 * 4 Catálogo: método Importar/Exportar CSV
 * 5 Produto: aba Gestão (Riscos, Restrições, Exigências, Marcos de sucesso, Prazo de entrega)
 * 6 Catálogo: campo Ambiente + método Publicar (homologar)
 * 7 Repontar Proposta/placeholder → cat-produto
 * 8 Renomear grupo "Fase 3 · Catálogo & Produto" → "Catálogo & Produto"
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

const PRODUTO = 'form-patlasv4-proto-cat-produto'
const CATALOGO = 'form-patlasv4-proto-cat-catalogo'
const UNIVERSAL = 'form-patlasv4-proto-cat-universal'
const OLD_PLACEHOLDER = 'form-patlasv4-proto-catalogo-produto-servico'
const SP_ID = 'sec-cat-prod-identificacao'
const SP_GESTAO = 'sec-cat-prod-gestao'
const SC_ST = 'sec-cat-cat-status'
const SU_MTX = 'sec-cat-univ-matriz'

const f = (id, label, type, o = {}) => ({
  id, label, type, size: o.size || 'medium', readOnly: o.readOnly || false,
  required: o.required || false, multiple: o.multiple || false, relevance: o.relevance || 'common',
  ...(o.sectionId ? { sectionId: o.sectionId } : {}), ...(o.options ? { options: o.options } : {}),
  ...(o.textLong ? { textLong: true } : {}), ...(o.hidden ? { hidden: true } : {}),
  ...(o.spec ? { spec: o.spec } : {}),
})

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const byId = Object.fromEntries(forms.map((x) => [x.id, x]))

// ---- 1) Produto: Código SIAG + Código Protheus ----
const prod = byId[PRODUTO]
const addFieldOnce = (form, field) => { if (!form.fields.some((x) => x.id === field.id)) form.fields.push(field) }
addFieldOnce(prod, f(`${PRODUTO}-cod-siag`, 'Código SIAG', 'text', { size: 'small', sectionId: SP_ID, spec: 'Código SIAG do produto (integração). Ex.: 1109680.' }))
addFieldOnce(prod, f(`${PRODUTO}-cod-protheus`, 'Código Protheus', 'text', { size: 'small', sectionId: SP_ID, spec: 'Código Protheus/Infocenter do produto (integração). Ex.: 32000171.' }))

// ---- 2) Categoria vale para Licença e Serviço (sempre visível) ----
const cat = prod.fields.find((x) => x.id === `${PRODUTO}-categoria`)
if (cat) { delete cat.hidden; cat.spec = 'Categoria/Objeto Comercial. Aplica-se a Licença (OBJETO COMERCIAL) e Serviço (CATEGORIA DE OBJETO COMERCIAL).' }
for (const r of prod.fieldVisibilityRules || []) {
  r.targetFieldIds = (r.targetFieldIds || []).filter((t) => t !== `${PRODUTO}-categoria`)
}

// ---- 5) Produto: aba Gestão ----
if (!prod.sections.some((s) => s.id === SP_GESTAO)) {
  const stIdx = prod.sections.findIndex((s) => s.id === 'sec-cat-prod-status')
  prod.sections.splice(stIdx >= 0 ? stIdx : prod.sections.length, 0, { id: SP_GESTAO, title: 'Gestão (artefatos)', icon: 'fact_check' })
}
for (const [id, label, spec] of [
  [`${PRODUTO}-riscos`, 'Riscos', 'Riscos associados à entrega do produto/serviço (artefato de gestão de projeto — PEAP).'],
  [`${PRODUTO}-restricoes`, 'Restrições', 'Restrições da solução (PEAP).'],
  [`${PRODUTO}-exigencias`, 'Exigências', 'Exigências para contratação/execução (PEAP).'],
  [`${PRODUTO}-marcos`, 'Marcos de sucesso', 'Marcos de sucesso da entrega (PEAP).'],
  [`${PRODUTO}-prazo-entrega`, 'Prazo de entrega', 'Prazo de entrega previsto (PEAP).'],
]) addFieldOnce(prod, f(id, label, 'text', { textLong: id !== `${PRODUTO}-prazo-entrega`, size: 'large', sectionId: SP_GESTAO, spec }))

// ---- 3) Catálogo Universal: conversores por complexidade ----
const uni = byId[UNIVERSAL]
for (const [id, label] of [
  [`${UNIVERSAL}-conv-muito-baixa`, 'Conversor — Muito Baixa'],
  [`${UNIVERSAL}-conv-baixa`, 'Conversor — Baixa'],
  [`${UNIVERSAL}-conv-media`, 'Conversor — Média'],
  [`${UNIVERSAL}-conv-alta`, 'Conversor — Alta'],
  [`${UNIVERSAL}-conv-muito-alta`, 'Conversor — Muito Alta'],
]) addFieldOnce(uni, f(id, label, 'number', { size: 'small', sectionId: SU_MTX, spec: 'Fator de conversão para este nível de complexidade.' }))

// ---- 6) Catálogo: campo Ambiente + método Publicar (homologar) ----
const catg = byId[CATALOGO]
addFieldOnce(catg, f(`${CATALOGO}-ambiente`, 'Ambiente', 'textOptions', {
  size: 'small', relevance: 'highlight', sectionId: SC_ST, options: ['Homologação', 'Produção'],
  spec: 'Parceiro alimenta em Homologação; só após Publicar (homologação pela MTI) vai para Produção / visão do cliente (PEAP).',
}))
catg.methods = catg.methods || []
const ensureMethod = (form, m) => { if (!form.methods.some((x) => x.id === m.id)) form.methods.push(m) }
// ---- 4) Importar/Exportar CSV ----
ensureMethod(catg, { id: `${CATALOGO}-meth-importar-csv`, name: 'Importar CSV', icon: 'upload_file', kind: 'destaque', spec: 'Importa produtos do catálogo a partir de um arquivo CSV (PEAP item 2.a).' })
ensureMethod(catg, { id: `${CATALOGO}-meth-exportar-csv`, name: 'Exportar CSV', icon: 'download', kind: 'destaque', spec: 'Exporta o catálogo para CSV (download).' })
ensureMethod(catg, { id: `${CATALOGO}-meth-publicar`, name: 'Publicar (homologar)', icon: 'verified', kind: 'destaque', spec: 'Homologação pela MTI: move o catálogo de Homologação para Produção, tornando-o visível ao cliente (PEAP item iii.a).' })

// ---- 7) Repontar placeholder antigo → cat-produto ----
let repoint = 0
for (const form of forms) {
  for (const fld of form.fields || []) {
    if (fld.linkedFormId === OLD_PLACEHOLDER) { fld.linkedFormId = PRODUTO; repoint++ }
  }
}

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// ---- 8) Renomear grupo Fase 3 → Catálogo & Produto ----
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
const g = cg.groups.find((x) => x.id === 'grp-fase3-catalogo')
if (g) g.name = 'Catálogo & Produto'
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Catálogo & Produto — Fase 1 aplicado.')
console.log('  Produto: +Código SIAG/Protheus, +aba Gestão, Categoria p/ Licença e Serviço')
console.log('  Universal: +5 conversores por complexidade')
console.log('  Catálogo: +Ambiente, +Importar/Exportar CSV, +Publicar (homologar)')
console.log('  Repontados para cat-produto:', repoint, 'campo(s)')
console.log('  Grupo renomeado: Catálogo & Produto')
