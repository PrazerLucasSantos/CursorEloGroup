#!/usr/bin/env node
/** Adiciona informações do cargo no Pré-cadastrar acesso e na Solicitação de vínculo. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')

const FORM_PRE = 'form-patlasv4-proto-metodo-precadastro-acesso'
const FORM_SVINC = 'form-patlasv4-proto-solicitacao-vinculo'

const UFS = ['Todos', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
const CAMINHOS = ['MTI', 'MTI/GDP', 'MTI/DIRC', 'MTI/DTIC', 'MTI/DIRADM', 'MTI/UGP', 'EloGroup', 'SEPLAG/GECON']
const CARGOS = ['Diretor DIRC', 'Analista DTIC', 'Gerente de Projetos', 'Fiscal de Contrato']
const COND = ['Titular', 'Substituto', 'Suplente']

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const insertAfter = (form, afterId, fields) => {
  const idx = form.fields.findIndex((f) => f.id === afterId)
  const at = idx >= 0 ? idx + 1 : form.fields.length
  const novos = fields.filter((nf) => !form.fields.some((f) => f.id === nf.id))
  form.fields.splice(at, 0, ...novos)
}

// ---------- Pré-cadastrar acesso (editável pela MTI) ----------
const pre = forms.find((f) => f.id === FORM_PRE)
const preCargo = pre.fields.find((f) => f.id === 'patlasv4proto-pre-cargo')
if (preCargo) preCargo.label = 'Cargo'
insertAfter(pre, 'patlasv4proto-pre-cargo', [
  { id: 'patlasv4proto-pre-unidade', label: 'Unidade organizacional', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', options: CAMINHOS, linkedFormId: 'form-patlasv4-proto-unidade-organizacional', spec: 'Caminho da unidade do cargo. Ex.: MTI/DIRC.' },
  { id: 'patlasv4proto-pre-condicao', label: 'Condição', type: 'textOptions', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', options: COND, spec: 'Condição da ocupação no cargo.' },
  { id: 'patlasv4proto-pre-regiao', label: 'Região de atuação', type: 'textOptions', size: 'medium', readOnly: false, required: false, multiple: true, relevance: 'common', options: UFS, spec: 'Padrão Todos; restringe por UF.' },
])
// cargo do pré-cadastro: dar opções
if (preCargo && !preCargo.options) { preCargo.options = CARGOS; preCargo.linkedFormId = 'form-patlasv4-proto-cargo' }
pre.exampleValuePresets?.forEach((p) => {
  p.fieldValues = { ...p.fieldValues, 'patlasv4proto-pre-cargo': 'Gerente de Projetos', 'patlasv4proto-pre-unidade': 'EloGroup', 'patlasv4proto-pre-condicao': 'Titular', 'patlasv4proto-pre-regiao': ['Todos'] }
})

// ---------- Solicitação de vínculo (somente leitura, para aprovar) ----------
const sv = forms.find((f) => f.id === FORM_SVINC)
insertAfter(sv, 'patlasv4proto-svinc-uo', [
  { id: 'patlasv4proto-svinc-cargo', label: 'Cargo', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'highlight', options: CARGOS, linkedFormId: 'form-patlasv4-proto-cargo', spec: 'Cargo pré-cadastrado para a pessoa.' },
  { id: 'patlasv4proto-svinc-unidade', label: 'Unidade organizacional', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', options: CAMINHOS, linkedFormId: 'form-patlasv4-proto-unidade-organizacional', spec: 'Caminho da unidade do cargo.' },
  { id: 'patlasv4proto-svinc-condicao', label: 'Condição', type: 'textOptions', size: 'small', readOnly: true, required: false, multiple: false, relevance: 'common', options: COND },
  { id: 'patlasv4proto-svinc-regiao', label: 'Região de atuação', type: 'textOptions', size: 'medium', readOnly: true, required: false, multiple: true, relevance: 'common', options: UFS },
])
sv.exampleValuePresets?.forEach((p) => {
  p.fieldValues = { ...p.fieldValues, 'patlasv4proto-svinc-cargo': 'Gerente de Projetos', 'patlasv4proto-svinc-unidade': 'EloGroup', 'patlasv4proto-svinc-condicao': 'Titular', 'patlasv4proto-svinc-regiao': ['Todos'] }
})

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
console.log('Pré-cadastro:', pre.fields.map((f) => f.label).join(' · '))
console.log('Solicitação de vínculo:', sv.fields.map((f) => f.label).join(' · '))
