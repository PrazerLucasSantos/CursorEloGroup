#!/usr/bin/env node
/**
 * Notificação:
 * 1) Cascata do destinatário: Perfil, Produto/Parceria, Organização e Unidade
 *    sempre visíveis; Pessoa (tipo Pessoa); Cargo+Condição+Região (tipo Cargo);
 *    E-mail do responsável (tipo Organização).
 * 2) Canal "Painel" → "Portal".
 * 3) Campo Template do corpo + nova classe Template de Notificação (nome + HTML).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

const FORM_NOTIF = 'form-patlasv4-proto-notificacao'
const FORM_DEST = 'form-patlasv4-proto-notificacao-destinatario'
const FORM_TPL = 'form-patlasv4-proto-notificacao-template'
const FORM_PARCERIA = 'form-patlasv4-proto-cat-parceria'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

// ---------- 3a) classe Template de Notificação ----------
if (!forms.some((f) => f.id === FORM_TPL)) {
  forms.push({
    id: FORM_TPL, name: '(18.1) Template de Notificação', sectionLayout: 'none', defaultCanvasMode: 'edit',
    metadata: 'Modelo de corpo de notificação. Nome + Template (HTML) com variáveis, reutilizável nas regras de Notificação.',
    fields: [
      { id: 'patlasv4proto-notiftpl-nome', label: 'Nome', type: 'text', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'identity', spec: 'Identificação do template. Ex.: Documento vencendo, Convite aprovado.' },
      { id: 'patlasv4proto-notiftpl-html', label: 'Template (HTML)', type: 'html', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'common', spec: 'Corpo da notificação em HTML. Aceita variáveis, ex.: {{documento.tipo}}, {{organizacao.nome}}, {{dias}}.' },
    ],
    exampleValuePresets: [
      { id: 'patlasv4proto-p-notiftpl-doc', name: 'Documento vencendo', fieldValues: { 'patlasv4proto-notiftpl-nome': 'Documento vencendo', 'patlasv4proto-notiftpl-html': '<p>Olá,</p><p>O documento <b>{{documento.tipo}}</b> da organização <b>{{organizacao.nome}}</b> vence em <b>{{documento.vencimento}}</b> ({{dias}} dias). Providencie a atualização.</p>' } },
      { id: 'patlasv4proto-p-notiftpl-assin', name: 'Enviado para assinatura', fieldValues: { 'patlasv4proto-notiftpl-nome': 'Enviado para assinatura', 'patlasv4proto-notiftpl-html': '<p>Você tem um documento aguardando assinatura: <b>{{processo.numero}}</b>.</p>' } },
    ],
    activeExamplePresetId: 'patlasv4proto-p-notiftpl-doc',
  })
}

// ---------- 2 + 3b) Notificação: Painel→Portal e campo Template ----------
const notif = forms.find((f) => f.id === FORM_NOTIF)
const envio = notif.fields.find((f) => f.id === 'patlasv4proto-notif-tipo-envio')
if (envio) {
  envio.options = (envio.options || []).map((o) => (o === 'Painel' ? 'Portal' : o))
  envio.spec = 'Canais simultâneos. Interna = central interna; Portal = visão do destinatário no portal; E-mail = envio externo.'
}
// campo Template do corpo (após Corpo)
if (!notif.fields.some((f) => f.id === 'patlasv4proto-notif-template')) {
  const idx = notif.fields.findIndex((f) => f.id === 'patlasv4proto-notif-corpo')
  const fld = { id: 'patlasv4proto-notif-template', label: 'Template do corpo', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', linkedFormId: FORM_TPL, spec: 'Seleciona o Template de Notificação (corpo HTML) a ser usado.' }
  notif.fields.splice(idx >= 0 ? idx + 1 : notif.fields.length, 0, fld)
}
// presets: Painel → Portal nos valores
for (const p of notif.exampleValuePresets || []) {
  const v = p.fieldValues?.['patlasv4proto-notif-tipo-envio']
  if (typeof v === 'string') p.fieldValues['patlasv4proto-notif-tipo-envio'] = v.replace(/Painel/g, 'Portal')
  if (Array.isArray(v)) p.fieldValues['patlasv4proto-notif-tipo-envio'] = v.map((x) => (x === 'Painel' ? 'Portal' : x))
}

// ---------- 1) Cascata do destinatário ----------
const dest = forms.find((f) => f.id === FORM_DEST)
const setHidden = (id, hidden) => { const f = dest.fields.find((x) => x.id === id); if (f) { if (hidden) f.hidden = true; else delete f.hidden } }
// sempre visíveis
setHidden('patlasv4proto-notif-dest-perfil', false)
setHidden('patlasv4proto-notif-dest-organizacao', false)
setHidden('patlasv4proto-notif-dest-unidade', false)
// condicionais
setHidden('patlasv4proto-notif-dest-pessoa', true)
setHidden('patlasv4proto-notif-dest-cargo', true)
setHidden('patlasv4proto-notif-dest-condicao', true)
setHidden('patlasv4proto-notif-dest-regiao', true)
setHidden('patlasv4proto-notif-dest-email-responsavel', true)

// novo campo Produto / Parceria (sempre visível)
if (!dest.fields.some((f) => f.id === 'patlasv4proto-notif-dest-produto-parceria')) {
  const idx = dest.fields.findIndex((f) => f.id === 'patlasv4proto-notif-dest-perfil')
  const fld = { id: 'patlasv4proto-notif-dest-produto-parceria', label: 'Produto / Parceria', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', linkedFormId: FORM_PARCERIA, spec: 'Produto/parceria do destinatário. Visível para todos os tipos.' }
  dest.fields.splice(idx >= 0 ? idx + 1 : dest.fields.length, 0, fld)
}

// regras: apenas os campos específicos por tipo
dest.fieldVisibilityRules = [
  { id: 'rule-notif-dest-org', operator: 'eq', sourceFieldId: 'patlasv4proto-notif-dest-tipo', sourceKind: 'textOptions', expectedOptionText: 'Organização', action: 'show', targetFieldIds: ['patlasv4proto-notif-dest-email-responsavel'] },
  { id: 'rule-notif-dest-pessoa', operator: 'eq', sourceFieldId: 'patlasv4proto-notif-dest-tipo', sourceKind: 'textOptions', expectedOptionText: 'Pessoa', action: 'show', targetFieldIds: ['patlasv4proto-notif-dest-pessoa'] },
  { id: 'rule-notif-dest-cargo', operator: 'eq', sourceFieldId: 'patlasv4proto-notif-dest-tipo', sourceKind: 'textOptions', expectedOptionText: 'Cargo', action: 'show', targetFieldIds: ['patlasv4proto-notif-dest-cargo', 'patlasv4proto-notif-dest-condicao', 'patlasv4proto-notif-dest-regiao'] },
]

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// ---------- class-groups: registra a classe Template ----------
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
cg.assignments[FORM_TPL] = 'grp-18-notificacoes'
const main = cg.memberOrderByGroup['grp-18-notificacoes'] || []
if (!main.includes(FORM_TPL)) main.push(FORM_TPL)
cg.memberOrderByGroup['grp-18-notificacoes'] = main
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Notificação atualizada:')
console.log('  • Cascata: Perfil, Produto/Parceria, Organização e Unidade sempre visíveis')
console.log('  • Pessoa→Pessoa; Cargo→Cargo+Condição+Região; Organização→E-mail do responsável')
console.log('  • Canal Painel → Portal')
console.log('  • Campo Template do corpo + classe Template de Notificação (nome + HTML)')
