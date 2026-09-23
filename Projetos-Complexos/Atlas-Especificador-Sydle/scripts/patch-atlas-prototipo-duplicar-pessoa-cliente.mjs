#!/usr/bin/env node
/**
 * Duplica Pessoa → Pessoas + Cliente (mesma estrutura, IDs distintos no Cliente).
 * Uso: node scripts/patch-atlas-prototipo-duplicar-pessoa-cliente.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const GROUPS_PATH = path.join(EPIC, 'class-groups.json')
const WORKSPACES_PATH = path.join(EPIC, 'workspaces.json')

const FORM_PESSOAS = 'form-patlasv4-proto-pessoa'
const FORM_CLIENTE = 'form-patlasv4-proto-cliente'

function deepClone(v) {
  return JSON.parse(JSON.stringify(v))
}

function remapPesToCli(id) {
  if (typeof id !== 'string') return id
  return id
    .replace(/^sec-patlasv4proto-pes-/, 'sec-patlasv4proto-cli-')
    .replace(/^patlasv4proto-pes-/, 'patlasv4proto-cli-')
    .replace(/^patlasv4proto-p-pessoa-/, 'patlasv4proto-p-cli-')
}

function remapKeysDeep(value) {
  if (Array.isArray(value)) return value.map(remapKeysDeep)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      out[remapPesToCli(k)] = remapKeysDeep(v)
    }
    return out
  }
  return value
}

function buildClienteForm(pessoasForm) {
  const f = deepClone(pessoasForm)
  f.id = FORM_CLIENTE
  f.name = 'Cliente'
  f.metadata =
    'Protótipo Atlas — Cliente (pessoa jurídica ou física do perfil Cliente). Mesma estrutura de Pessoas; cadastro dedicado a contatos e gestores de órgãos clientes.'

  for (const section of f.sections ?? []) {
    section.id = remapPesToCli(section.id)
    if (section.parentSectionId) section.parentSectionId = remapPesToCli(section.parentSectionId)
  }

  for (const field of f.fields ?? []) {
    field.id = remapPesToCli(field.id)
    if (field.sectionId) field.sectionId = remapPesToCli(field.sectionId)
  }

  for (const rule of f.fieldVisibilityRules ?? []) {
    if (rule.sourceFieldId) rule.sourceFieldId = remapPesToCli(rule.sourceFieldId)
    if (rule.targetFieldIds) rule.targetFieldIds = rule.targetFieldIds.map(remapPesToCli)
  }

  f.exampleValuePresets = (pessoasForm.exampleValuePresets ?? []).map((preset) => {
    const next = deepClone(preset)
    next.id = remapPesToCli(next.id)
    if (next.id === 'patlasv4proto-p-cli-cliente') next.name = 'Carlos Gestor Cliente'
    next.fieldValues = remapKeysDeep(next.fieldValues ?? {})
    next.embeddedRowsByFieldId = remapKeysDeep(next.embeddedRowsByFieldId ?? {})
    return next
  })

  f.activeExamplePresetId = 'patlasv4proto-p-cli-cliente'
  if (f.methods?.length) {
    f.methods = f.methods.map((m) => ({
      ...m,
      id: m.id.startsWith('mq') ? `${m.id}-cli` : m.id,
      name: m.name === 'Cadastrar Servidor' ? 'Vincular Servidor' : m.name,
    }))
  }

  return f
}

function patchPessoasForm(form) {
  form.name = 'Pessoas'
  form.metadata =
    'Protótipo Atlas — Pessoas. Cadastro base de indivíduos (MTI, parceiros, contatos). Layout conforme tela Sydle (Geral, Dados de contato, Complementares, Currículo).'
  form.exampleValuePresets = (form.exampleValuePresets ?? []).filter(
    (p) => p.id !== 'patlasv4proto-p-pessoa-cliente',
  )
  if (form.activeExamplePresetId === 'patlasv4proto-p-pessoa-cliente') {
    form.activeExamplePresetId = 'patlasv4proto-p-pessoa-lucas'
  }
  return form
}

function patchClassGroups(cg) {
  cg.assignments[FORM_CLIENTE] = 'grp-patlasv4-proto-cadastro'
  const order = cg.memberOrderByGroup['grp-patlasv4-proto-cadastro']
  const pesIdx = order.indexOf(FORM_PESSOAS)
  if (!order.includes(FORM_CLIENTE)) {
    if (pesIdx >= 0) order.splice(pesIdx + 1, 0, FORM_CLIENTE)
    else order.push(FORM_CLIENTE)
  }
}

function patchWorkspaces(workspaces) {
  const ws = workspaces.find((w) => w.id === 'ws-atlas-prototipo')
  if (!ws) return
  const pkg = ws.packages?.find((p) => p.id === 'pkg-patlasv4-proto-cadastro')
  if (!pkg?.classes) return

  const pes = pkg.classes.find((c) => c.id === 'cls-patlasv4-proto-pes')
  if (pes) {
    pes.name = 'Pessoas'
    pes.linkedFormExamplePresetIds = [
      'patlasv4proto-p-pessoa-lucas',
      'patlasv4proto-p-pessoa-mti',
      'patlasv4proto-p-pessoa-parceiro',
    ]
  }

  const exists = pkg.classes.some((c) => c.linkedFormId === FORM_CLIENTE)
  if (!exists) {
    const pesIdx = pkg.classes.findIndex((c) => c.id === 'cls-patlasv4-proto-pes')
    pkg.classes.splice(pesIdx + 1, 0, {
      id: 'cls-patlasv4-proto-cli',
      name: 'Cliente',
      linkedFormId: FORM_CLIENTE,
      linkedFormExamplePresetIds: [
        'patlasv4proto-p-cli-cliente',
        'patlasv4proto-p-cli-lucas',
        'patlasv4proto-p-cli-mti',
        'patlasv4proto-p-cli-parceiro',
      ],
    })
  }
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const pesIdx = forms.findIndex((f) => f.id === FORM_PESSOAS)
  if (pesIdx < 0) {
    console.error('Formulário Pessoa não encontrado')
    process.exit(1)
  }

  const pessoasForm = patchPessoasForm(deepClone(forms[pesIdx]))
  forms[pesIdx] = pessoasForm

  const clienteForm = buildClienteForm(forms[pesIdx])
  const cliIdx = forms.findIndex((f) => f.id === FORM_CLIENTE)
  if (cliIdx >= 0) forms[cliIdx] = clienteForm
  else forms.push(clienteForm)

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  const cg = JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))
  patchClassGroups(cg)
  fs.writeFileSync(GROUPS_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

  const workspaces = JSON.parse(fs.readFileSync(WORKSPACES_PATH, 'utf8'))
  patchWorkspaces(workspaces)
  fs.writeFileSync(WORKSPACES_PATH, `${JSON.stringify(workspaces, null, 2)}\n`, 'utf8')

  console.log('✓ Pessoa renomeada para Pessoas (3 presets: Lucas, MTI, Parceiro)')
  console.log('✓ Cliente criado como duplicata (4 presets, IDs patlasv4proto-cli-*)')
  console.log('✓ class-groups.json e workspaces.json atualizados')
}

main()
