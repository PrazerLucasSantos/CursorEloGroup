#!/usr/bin/env node
/**
 * Converte a aba "Tributos e Encargos" da Organização em TABELA:
 * cada linha = Tipo do tributo (seleção) + Alíquota (%) + Documento comprobatório.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const CG_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_LINHA = 'form-patlasv4-proto-uo-tributo-linha'
const FIELD_TRIB = 'mqmdvi11ofo8m3'

const TIPOS = ['ISS', 'IRRF', 'CSLL', 'PIS', 'COFINS', 'INSS', 'ICMS', 'IPI', 'IRPJ', 'CPP', 'CBS', 'IBS']

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

// 1) formulário de linha (tabela)
const linha = {
  id: FORM_LINHA,
  name: '(1.4) Tributo (linha)',
  sectionLayout: 'none',
  metadata: 'Linha da tabela Tributos e Encargos: tipo do tributo, alíquota e documento comprobatório.',
  fields: [
    {
      id: 'patlasv4proto-uotribl-tipo',
      label: 'Tipo do tributo',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'identity',
      options: TIPOS,
      spec: 'Selecione o tributo aplicável.',
    },
    {
      id: 'patlasv4proto-uotribl-aliquota',
      label: 'Alíquota (%)',
      type: 'number',
      size: 'small',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      spec: 'Percentual aplicado ao tributo.',
    },
    {
      id: 'patlasv4proto-uotribl-documento',
      label: 'Documento comprobatório',
      type: 'file',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      spec: 'Anexo que comprova o tributo/alíquota (ou isenção).',
    },
  ],
  exampleValuePresets: [],
}

if (!forms.some((f) => f.id === FORM_LINHA)) {
  // insere logo após o form de tributo antigo (ou no fim)
  const idx = forms.findIndex((f) => f.id === 'form-patlasv4-proto-uo-tributo')
  if (idx >= 0) forms.splice(idx + 1, 0, linha)
  else forms.push(linha)
}

// 2) converte o campo de tributos para tabela
const uo = forms.find((f) => f.id === FORM_UO)
const trib = uo.fields.find((f) => f.id === FIELD_TRIB)
trib.type = 'embeddedReference'
trib.multiple = true
trib.embeddedDisplay = 'table'
delete trib.embeddedRoot
trib.linkedFormId = FORM_LINHA
trib.label = 'Tributos e Encargos'
trib.spec = 'Tabela: para cada tributo, selecione o tipo, informe a alíquota (%) e anexe o documento comprobatório.'

// 3) ajusta o preset MTI para o novo formato de linhas
for (const p of uo.exampleValuePresets ?? []) {
  if (p.embeddedRowsByFieldId && p.embeddedRowsByFieldId[FIELD_TRIB]) {
    p.embeddedRowsByFieldId[FIELD_TRIB] = [
      { 'patlasv4proto-uotribl-tipo': 'ISS', 'patlasv4proto-uotribl-aliquota': 5 },
      { 'patlasv4proto-uotribl-tipo': 'PIS', 'patlasv4proto-uotribl-aliquota': 1.65 },
      { 'patlasv4proto-uotribl-tipo': 'COFINS', 'patlasv4proto-uotribl-aliquota': 7.6 },
      { 'patlasv4proto-uotribl-tipo': 'IRRF', 'patlasv4proto-uotribl-aliquota': 1.5 },
    ]
  }
}

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// 4) class-groups: registra o form de linha nas Embutidas
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
if (cg.assignments) cg.assignments[FORM_LINHA] = 'grp-01-organizacao-emb'
const emb = cg.memberOrderByGroup?.['grp-01-organizacao-emb']
if (emb && !emb.includes(FORM_LINHA)) emb.push(FORM_LINHA)
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Tributos e Encargos convertido em tabela (Tipo · Alíquota · Documento).')
