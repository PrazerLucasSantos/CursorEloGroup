#!/usr/bin/env node
/**
 * - Remove a classe Cláusula ECM (uso somente no backend) e limpa o campo do Template que a referencia.
 * - Move o Catálogo para o grupo "Fase 3 · Futuro" (não é F1) e tira sua numeração.
 * - Renumera a sequência (1..N) para fechar os buracos deixados por Catálogo(6) e ECM(8).
 *
 * EXECUTAR UMA ÚNICA VEZ (a renumeração não é idempotente).
 * Uso: node scripts/apply-catalogo-f3-remove-ecm.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')
const WS_PATH = path.join(EPIC_DIR, 'workspaces.json')

const FORM_ECM = 'form-patlasv4-proto-clausula-ecm'
const FORM_TEMPLATE = 'form-patlasv4-proto-template'
const FORM_TEMPLATE_ECM_FIELD = 'patlasv4proto-template-clausulas-ecm'
const FORM_CATALOGO = 'form-patlasv4-proto-catalogo-produto-servico'
const GRP_FASE3 = 'grp-fase3-futuro'

// Mapeia o inteiro antigo -> novo (1..5 inalterados; 6 e 8 saem da sequência).
const REMAP = { 7: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: 12, 15: 13, 16: 14, 17: 15, 18: 16, 19: 17, 20: 18 }

/** Renomeia "(N) ...", "(N.x) ...", "(N.Mx) ..." aplicando o REMAP ao inteiro N. */
function renumberName(name) {
  const m = /^\((\d+)((?:\.[A-Za-z0-9]+)?)\)\s*(.*)$/.exec(name)
  if (!m) return name
  const n = parseInt(m[1], 10)
  const sub = m[2]
  const rest = m[3]
  const nn = REMAP[n]
  if (nn == null) return name
  return `(${nn}${sub}) ${rest}`
}

function main() {
  // ---------- forms.json ----------
  let forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  // 1) remove ECM
  forms = forms.filter((x) => x.id !== FORM_ECM)

  // 2) limpa o campo de ECM no Template (campo + linhas de preset)
  const tpl = forms.find((x) => x.id === FORM_TEMPLATE)
  if (tpl) {
    tpl.fields = tpl.fields.filter((fl) => fl.id !== FORM_TEMPLATE_ECM_FIELD)
    for (const p of tpl.exampleValuePresets || []) {
      if (p.embeddedRowsByFieldId) delete p.embeddedRowsByFieldId[FORM_TEMPLATE_ECM_FIELD]
    }
    if (tpl.fieldVisibilityRules) {
      tpl.fieldVisibilityRules = tpl.fieldVisibilityRules
        .filter((r) => r.sourceFieldId !== FORM_TEMPLATE_ECM_FIELD)
        .map((r) => ({ ...r, targetFieldIds: r.targetFieldIds.filter((t) => t !== FORM_TEMPLATE_ECM_FIELD) }))
        .filter((r) => r.targetFieldIds.length > 0)
    }
  }

  // 3) renumera todos os nomes ANTES de tratar o Catálogo
  for (const fr of forms) {
    if (fr.id === FORM_CATALOGO) continue
    if (typeof fr.name === 'string') fr.name = renumberName(fr.name)
  }

  // 4) Catálogo -> Fase 3 (remove numeração)
  const cat = forms.find((x) => x.id === FORM_CATALOGO)
  if (cat) cat.name = 'Catálogo Produtos/Serviços (Fase 3)'

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  // ---------- class-groups.json ----------
  const cg = JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))
  // remove ECM
  delete cg.assignments[FORM_ECM]
  for (const k of Object.keys(cg.memberOrderByGroup)) {
    cg.memberOrderByGroup[k] = cg.memberOrderByGroup[k].filter((id) => id !== FORM_ECM)
  }
  // cria grupo Fase 3 (antes do Backlog)
  if (!cg.groups.some((g) => g.id === GRP_FASE3)) {
    const block = [{ id: GRP_FASE3, name: 'Fase 3 · Futuro' }]
    const at = cg.groups.findIndex((g) => g.id === 'grp-07-backlog')
    if (at >= 0) cg.groups.splice(at, 0, ...block)
    else cg.groups.push(...block)
  }
  // move Catálogo para Fase 3
  for (const k of Object.keys(cg.memberOrderByGroup)) {
    cg.memberOrderByGroup[k] = cg.memberOrderByGroup[k].filter((id) => id !== FORM_CATALOGO)
  }
  cg.assignments[FORM_CATALOGO] = GRP_FASE3
  cg.memberOrderByGroup[GRP_FASE3] = [...(cg.memberOrderByGroup[GRP_FASE3] || []), FORM_CATALOGO]
  fs.writeFileSync(GROUPS_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

  // ---------- workspaces.json ----------
  const ws = JSON.parse(fs.readFileSync(WS_PATH, 'utf8'))
  const w = ws[0]
  for (const pkg of w.packages) {
    // remove Catálogo e ECM do mapa F1
    pkg.classes = (pkg.classes || []).filter(
      (c) => c.id !== 'cls-mapa-catalogo' && c.id !== 'cls-mapa-clausula-ecm',
    )
    // renumera labels das classes do mapa
    for (const c of pkg.classes) {
      if (typeof c.name === 'string') c.name = renumberName(c.name)
    }
  }
  // ajusta faixas nos nomes dos pacotes
  const pkgRename = {
    'pkg-mapa-2-config': '2 · Configuração documental (5–8)',
    'pkg-mapa-3-fluxo': '3 · Fluxo comercial (9–14)',
    'pkg-mapa-4-assinatura': '4 · Assinatura (15–16)',
    'pkg-mapa-5-entrega-valor': '5 · Entrega de Valor (17)',
    'pkg-mapa-6-notificacoes': '6 · Notificações (18)',
  }
  for (const pkg of w.packages) {
    if (pkgRename[pkg.id]) pkg.name = pkgRename[pkg.id]
  }
  fs.writeFileSync(WS_PATH, `${JSON.stringify(ws, null, 2)}\n`, 'utf8')

  console.log('OK: ECM removido, Catalogo -> Fase 3, sequencia renumerada (1..18).')
}

main()
