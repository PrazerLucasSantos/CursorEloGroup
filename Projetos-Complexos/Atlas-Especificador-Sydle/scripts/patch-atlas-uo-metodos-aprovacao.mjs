#!/usr/bin/env node
/**
 * Adiciona métodos na Organização: Criar, Editar, Salvar, Aprovar cadastro e
 * Solicitar ajuste (abre formulário para informar o motivo).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const CG_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_AJUSTE = 'form-patlasv4-proto-metodo-solicitar-ajuste-org'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const uo = forms.find((f) => f.id === FORM_UO)

// 1) formulário de parâmetro do "Solicitar ajuste"
const ajusteForm = {
  id: FORM_AJUSTE,
  name: '(1.M5) Solicitar ajuste no cadastro',
  sectionLayout: 'none',
  defaultCanvasMode: 'edit',
  metadata: 'Parâmetro do método Solicitar ajuste: informe o motivo do ajuste a ser feito no cadastro da organização. Volta o status para revisão e notifica o responsável.',
  fields: [
    {
      id: 'patlasv4proto-ajuste-org-motivo',
      label: 'Motivo do ajuste',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'identity',
      textLong: true,
      spec: 'Descreva o que precisa ser corrigido no cadastro (obrigatório).',
    },
  ],
  exampleValuePresets: [
    {
      id: 'patlasv4proto-p-ajuste-org-exemplo',
      name: 'Exemplo — documento ilegível',
      fieldValues: {
        'patlasv4proto-ajuste-org-motivo': 'O CNPJ anexado está ilegível. Reenvie o documento atualizado e legível.',
      },
    },
  ],
  activeExamplePresetId: 'patlasv4proto-p-ajuste-org-exemplo',
}
if (!forms.some((f) => f.id === FORM_AJUSTE)) {
  const idx = forms.findIndex((f) => f.id === FORM_UO)
  forms.splice(idx + 1, 0, ajusteForm)
}

// 2) métodos novos (mantém os existentes)
uo.methods = uo.methods ?? []
const existentes = uo.methods.filter(
  (m) => !['patlasv4proto-uo-meth-criar', 'patlasv4proto-uo-meth-editar', 'patlasv4proto-uo-meth-salvar',
           'patlasv4proto-uo-meth-aprovar-cadastro', 'patlasv4proto-uo-meth-solicitar-ajuste'].includes(m.id),
)
const novos = [
  { id: 'patlasv4proto-uo-meth-criar', name: 'Criar', icon: 'add', kind: 'destaque' },
  { id: 'patlasv4proto-uo-meth-editar', name: 'Editar', icon: 'edit', kind: 'destaque' },
  { id: 'patlasv4proto-uo-meth-salvar', name: 'Salvar', icon: 'save', kind: 'destaque' },
  { id: 'patlasv4proto-uo-meth-aprovar-cadastro', name: 'Aprovar cadastro', icon: 'check_circle', kind: 'destaque' },
  { id: 'patlasv4proto-uo-meth-solicitar-ajuste', name: 'Solicitar ajuste', icon: 'edit_note', kind: 'destaque', inputFormId: FORM_AJUSTE },
]
uo.methods = [...novos, ...existentes]

// garante o método "Adicionar à grade MIPP" (form de parâmetro já existe)
if (!uo.methods.some((m) => m.id === 'patlasv4proto-uo-meth-adicionar-grupos-mipp')) {
  uo.methods.push({
    id: 'patlasv4proto-uo-meth-adicionar-grupos-mipp',
    name: 'Adicionar à grade MIPP',
    icon: 'playlist_add',
    kind: 'destaque',
    inputFormId: 'form-patlasv4-proto-metodo-adicionar-grupos-mipp',
  })
}

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// 3) class-groups: registra o form de parâmetro nas Métodos
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
if (cg.assignments) cg.assignments[FORM_AJUSTE] = 'grp-01-organizacao-met'
const met = cg.memberOrderByGroup?.['grp-01-organizacao-met']
if (met && !met.includes(FORM_AJUSTE)) met.push(FORM_AJUSTE)
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Métodos da Organização:', uo.methods.map((m) => m.name).join(' · '))
