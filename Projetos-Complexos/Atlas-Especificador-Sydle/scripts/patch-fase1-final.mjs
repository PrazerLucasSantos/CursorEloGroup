#!/usr/bin/env node
/** Itens finais F1: motivo de recusa do vínculo; contrato multi-parceiro
 *  (escopo + visibilidade); "obrigatório na geração" no bloco do template. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

const FORM_SVINC = 'form-patlasv4-proto-solicitacao-vinculo'
const FORM_CONTRATO = 'form-patlasv4-proto-contrato'
const FORM_CPE = 'form-patlasv4-proto-contrato-parceiro-escopo'
const FORM_BLOCO = 'form-patlasv4-proto-template-bloco'
const SEC_PARC = 'sec-patlasv4proto-contrato-parceiros'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

// ---------- 1) Motivo de recusa na Solicitação de vínculo ----------
const sv = forms.find((f) => f.id === FORM_SVINC)
if (!sv.fields.some((f) => f.id === 'patlasv4proto-svinc-motivo-recusa')) {
  sv.fields.push({ id: 'patlasv4proto-svinc-motivo-recusa', label: 'Motivo da recusa', type: 'text', size: 'large', readOnly: false, required: false, multiple: false, relevance: 'common', textLong: true, hidden: true, spec: 'Obrigatório ao recusar o vínculo.' })
}
sv.fieldVisibilityRules = sv.fieldVisibilityRules || []
if (!sv.fieldVisibilityRules.some((r) => r.id === 'rule-svinc-motivo-recusado')) {
  sv.fieldVisibilityRules.push({ id: 'rule-svinc-motivo-recusado', operator: 'eq', sourceFieldId: 'patlasv4proto-svinc-status', sourceKind: 'textOptions', expectedOptionText: 'Recusado', action: 'show', targetFieldIds: ['patlasv4proto-svinc-motivo-recusa'] })
}

// ---------- 2) Contrato multi-parceiro (escopo + visibilidade) ----------
if (!forms.some((f) => f.id === FORM_CPE)) {
  forms.push({
    id: FORM_CPE, name: 'Linha · parceiro e escopo do contrato', sectionLayout: 'none', defaultCanvasMode: 'edit',
    metadata: 'Linha embutida — parceiro participante do contrato e seu escopo. Base da visibilidade segmentada.',
    fields: [
      { id: 'patlasv4proto-cpe-parceiro', label: 'Parceiro', type: 'reference', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'identity', options: ['EloGroup', 'FacilMova', 'RW3 - Google'], linkedFormId: 'form-patlasv4-proto-cat-parceria' },
      { id: 'patlasv4proto-cpe-escopo', label: 'Escopo / itens do parceiro', type: 'text', size: 'large', readOnly: false, required: false, multiple: false, relevance: 'common', textLong: true, spec: 'Itens/objetos do contrato sob responsabilidade deste parceiro.' },
      { id: 'patlasv4proto-cpe-valor', label: 'Valor do escopo (R$)', type: 'number', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common' },
      { id: 'patlasv4proto-cpe-status', label: 'Aprovação do escopo', type: 'textOptions', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', options: ['Pendente', 'Aprovado', 'Recusado'], spec: 'Cada parceiro aprova apenas o seu escopo.' },
      { id: 'patlasv4proto-cpe-ve-sensiveis', label: 'Vê dados sensíveis de outros?', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', spec: 'Padrão Não — parceiro não vê margem/valores de outros parceiros.' },
    ],
    exampleValuePresets: [],
  })
}
const contrato = forms.find((f) => f.id === FORM_CONTRATO)
if (!contrato.sections.some((s) => s.id === SEC_PARC)) {
  const i = contrato.sections.findIndex((s) => s.id === 'sec-patlasv4proto-contrato-assinatura')
  contrato.sections.splice(i >= 0 ? i : contrato.sections.length, 0, { id: SEC_PARC, title: 'Parceiros e escopos', icon: 'groups' })
}
if (!contrato.fields.some((f) => f.id === 'patlasv4proto-contrato-parceiros-alerta')) {
  contrato.fields.push({ id: 'patlasv4proto-contrato-parceiros-alerta', label: 'Visibilidade segmentada', type: 'alert', size: 'medium', readOnly: false, hidden: false, required: false, multiple: false, relevance: 'common', sectionId: SEC_PARC, alertVariant: 'info', alertTitle: 'Contrato multi-parceiro', alertMessage: 'Vários parceiros podem participar do mesmo contrato. Cada um aprova e enxerga apenas o seu escopo; não vê margem/valores nem dados sensíveis dos demais. A MTI tem visão integral.' })
}
if (!contrato.fields.some((f) => f.id === 'patlasv4proto-contrato-parceiros')) {
  contrato.fields.push({ id: 'patlasv4proto-contrato-parceiros', label: 'Parceiros do contrato', type: 'embeddedReference', size: 'large', readOnly: false, required: false, multiple: true, relevance: 'common', sectionId: SEC_PARC, linkedFormId: FORM_CPE, embeddedDisplay: 'table', spec: 'Parceiros participantes e seus escopos (base da visibilidade segmentada).' })
}

// ---------- 3) Bloco do template: "Obrigatório na geração?" ----------
const bloco = forms.find((f) => f.id === FORM_BLOCO)
if (bloco && !bloco.fields.some((f) => f.id === 'patlasv4proto-tpl-bloco-obrigatorio-geracao')) {
  const i = bloco.fields.findIndex((f) => f.id === 'patlasv4proto-tpl-bloco-editavel-na-geracao')
  bloco.fields.splice(i >= 0 ? i + 1 : bloco.fields.length, 0, { id: 'patlasv4proto-tpl-bloco-obrigatorio-geracao', label: 'Obrigatório na geração', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', spec: 'Se Sim, o operador precisa preencher este bloco ao gerar o documento.' })
}

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// class-groups: registra a linha de parceiro/escopo nas Embutidas do Fluxo comercial
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
const fluxoEmb = cg.groups.find((g) => g.name === 'Embutidas' && g.parentGroupId === (cg.groups.find((x) => x.name && x.name.includes('Fluxo comercial'))?.id))?.id || 'grp-10-fluxo-emb'
cg.assignments[FORM_CPE] = fluxoEmb
cg.memberOrderByGroup[fluxoEmb] = cg.memberOrderByGroup[fluxoEmb] || []
if (!cg.memberOrderByGroup[fluxoEmb].includes(FORM_CPE)) cg.memberOrderByGroup[fluxoEmb].push(FORM_CPE)
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('F1 final aplicado: motivo de recusa, contrato multi-parceiro (escopo+visibilidade), obrigatório na geração.')
