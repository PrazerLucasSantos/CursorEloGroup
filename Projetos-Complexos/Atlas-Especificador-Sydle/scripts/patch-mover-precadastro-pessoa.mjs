#!/usr/bin/env node
/** Move o método Pré-cadastrar acesso (CPF) da Organização para a Pessoa. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'
const FORM_PRE = 'form-patlasv4-proto-metodo-precadastro-acesso'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

// 1) remove o método da Organização
const uo = forms.find((f) => f.id === FORM_UO)
uo.methods = uo.methods.filter((m) => m.id !== 'patlasv4proto-uo-meth-precadastro')

// 2) adiciona o método na Pessoa
const pes = forms.find((f) => f.id === FORM_PESSOA)
pes.methods = pes.methods || []
if (!pes.methods.some((m) => m.id === 'patlasv4proto-pes-meth-precadastro')) {
  pes.methods.push({ id: 'patlasv4proto-pes-meth-precadastro', name: 'Pré-cadastrar acesso (CPF)', icon: 'badge', kind: 'destaque', inputFormId: FORM_PRE })
}

// 3) renomeia o form de parâmetro para a numeração de Pessoa
const pre = forms.find((f) => f.id === FORM_PRE)
if (pre) pre.name = '(3.M4) Pré-cadastrar acesso (CPF)'

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// 4) class-groups: move o form de parâmetro para os Métodos da Pessoa
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
cg.assignments[FORM_PRE] = 'grp-03-pessoa-met'
for (const g of Object.keys(cg.memberOrderByGroup)) {
  cg.memberOrderByGroup[g] = cg.memberOrderByGroup[g].filter((x) => x !== FORM_PRE)
}
cg.memberOrderByGroup['grp-03-pessoa-met'] = cg.memberOrderByGroup['grp-03-pessoa-met'] || []
cg.memberOrderByGroup['grp-03-pessoa-met'].push(FORM_PRE)
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Método "Pré-cadastrar acesso (CPF)" movido para Pessoa.')
console.log('Métodos da Pessoa:', pes.methods.map((m) => m.name).join(' · '))
