#!/usr/bin/env node
/**
 * 1) Selo/validação tributária (MTI/DAFI) na aba Tributos da Organização.
 * 2) Método Substituir unidade na Organização.
 * 3) Remove classes/campos sem uso: uo-tributo (substituído por tributo-linha)
 *    e metodo-gerar-convite-saida (obsoleto).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const SEC_TRIB = 'sec-patlasv4proto-uo-tributos'
const FORM_SUB = 'form-patlasv4-proto-metodo-substituir-unidade'
const REMOVER = new Set(['form-patlasv4-proto-uo-tributo', 'form-patlasv4-proto-metodo-gerar-convite-saida'])

let forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

// ---- 3) remover formulários sem uso ----
const antes = forms.length
forms = forms.filter((f) => !REMOVER.has(f.id))
const removidos = antes - forms.length

const uo = forms.find((f) => f.id === FORM_UO)

// ---- 1) Selo / validação tributária (DAFI) ----
const seloFields = [
  {
    id: 'patlasv4proto-uo-trib-validacao-status', label: 'Validação tributária (MTI/DAFI)', type: 'textOptions',
    size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'highlight', hidden: true,
    sectionId: SEC_TRIB, options: ['Pendente', 'Em validação (DAFI)', 'Aprovado (selo MTI)', 'Recusado'],
    spec: 'Selo de atesto dos tributos do parceiro pela MTI, validado com a DAFI (PEAP item p). Aprovado libera a emissão fiscal.',
  },
  {
    id: 'patlasv4proto-uo-trib-validado-por', label: 'Validado por (MTI)', type: 'reference',
    size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', hidden: true,
    sectionId: SEC_TRIB, linkedFormId: 'form-patlasv4-proto-pessoa', spec: 'Gestor da MTI que atestou os tributos.',
  },
  {
    id: 'patlasv4proto-uo-trib-validacao-data', label: 'Data da validação', type: 'date',
    size: 'small', readOnly: true, required: false, multiple: false, relevance: 'common', hidden: true,
    sectionId: SEC_TRIB, spec: 'Data do atesto/selo pela MTI.',
  },
]
const regimeIdx = uo.fields.findIndex((f) => f.id === 'patlasv4proto-uo-regime-tributacao')
const insertAt = regimeIdx >= 0 ? regimeIdx : uo.fields.length
const novosSelo = seloFields.filter((nf) => !uo.fields.some((f) => f.id === nf.id))
uo.fields.splice(insertAt, 0, ...novosSelo)

// adiciona às regras Empresa = Sim / Não (mesma visibilidade dos tributos)
const showEmp = uo.fieldVisibilityRules.find((r) => r.id === 'rule-uo-show-ajustes-empresa')
const hideEmp = uo.fieldVisibilityRules.find((r) => r.id === 'rule-uo-hide-ajustes-nao-empresa')
for (const nf of seloFields) {
  if (showEmp && !showEmp.targetFieldIds.includes(nf.id)) showEmp.targetFieldIds.push(nf.id)
  if (hideEmp && !hideEmp.targetFieldIds.includes(nf.id)) hideEmp.targetFieldIds.push(nf.id)
}

// ---- 2) Substituir unidade (método + form de parâmetro) ----
if (!forms.some((f) => f.id === FORM_SUB)) {
  forms.push({
    id: FORM_SUB, name: '(1.M8) Substituir unidade', sectionLayout: 'none', defaultCanvasMode: 'edit',
    metadata: 'Substitui a unidade atual por outra equivalente (reestruturação). A unidade atual é inativada e seus cargos migram para a substituta — sem intervenção em banco.',
    fields: [
      {
        id: 'patlasv4proto-sub-alerta', label: 'Substituição de unidade', type: 'alert', size: 'medium',
        readOnly: false, hidden: false, required: false, multiple: false, relevance: 'common',
        alertVariant: 'warning', alertTitle: 'A unidade atual será inativada',
        alertMessage: 'Selecione a unidade substituta. A unidade atual passa a Ativo = Não e seus cargos são migrados para a substituta.',
      },
      { id: 'patlasv4proto-sub-substituta', label: 'Unidade substituta', type: 'reference', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'identity', linkedFormId: FORM_UO, spec: 'Unidade equivalente que recebe os cargos.' },
      { id: 'patlasv4proto-sub-data', label: 'Data da substituição', type: 'date', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common' },
      { id: 'patlasv4proto-sub-motivo', label: 'Motivo', type: 'text', size: 'large', readOnly: false, required: false, multiple: false, relevance: 'common', textLong: true, spec: 'Justificativa da reestruturação.' },
    ],
    exampleValuePresets: [
      { id: 'patlasv4proto-p-sub-exemplo', name: 'Exemplo — reestruturação', fieldValues: { 'patlasv4proto-sub-substituta': 'Gerência de Contratos', 'patlasv4proto-sub-motivo': 'Reestruturação organizacional 2026 — unidade incorporada.' } },
    ],
    activeExamplePresetId: 'patlasv4proto-p-sub-exemplo',
  })
}
if (!uo.methods.some((m) => m.id === 'patlasv4proto-uo-meth-substituir-unidade')) {
  uo.methods.push({ id: 'patlasv4proto-uo-meth-substituir-unidade', name: 'Substituir unidade', icon: 'swap_horiz', kind: 'destaque', inputFormId: FORM_SUB })
}

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// ---- class-groups: remove órfãos, registra substituir unidade ----
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
for (const id of REMOVER) {
  delete cg.assignments[id]
  for (const g of Object.keys(cg.memberOrderByGroup)) {
    cg.memberOrderByGroup[g] = cg.memberOrderByGroup[g].filter((x) => x !== id)
  }
}
cg.assignments[FORM_SUB] = 'grp-01-organizacao-met'
const met = cg.memberOrderByGroup['grp-01-organizacao-met']
if (met && !met.includes(FORM_SUB)) met.push(FORM_SUB)
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Selo/validação tributária (DAFI) adicionado à aba Tributos.')
console.log('Método "Substituir unidade" adicionado à Organização.')
console.log('Formulários removidos (sem uso):', removidos, '→', [...REMOVER].join(', '))
