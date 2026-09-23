#!/usr/bin/env node
/**
 * Pessoas — Perfil de cadastro, vínculo organizacional condicional, remove aba Currículo.
 * Uso: node scripts/patch-atlas-prototipo-pessoas-perfil-vinculo.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)

const FORM_PESSOAS = 'form-patlasv4-proto-pessoa'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_CARGO = 'form-patlasv4-proto-cargo'

const PERFIS = ['Cliente', 'Parceiro', 'MTI', 'Fornecedor', 'Fabricante']
const PERFIS_EXT = ['Cliente', 'Parceiro', 'Fornecedor', 'Fabricante']

const ORG_OPTS = [
  'Empresa Mato-grossense de Tecnologia da Informação',
  'EloGroup',
  'Secretaria de Estado de Planejamento e Gestão',
]

const UN_NEG_OPTS = [
  'Gabinete da Diretoria de Relacionamento com o Cliente',
  'Gabinete da Diretoria Administrativa',
  'Gabinete da Diretoria de Tecnologia da Informação e Comunicação',
  'Unidade de Gestão de Projetos',
]

const DEPT_OPTS = [
  'Unidade de Gestão de Projetos',
  'Gerência de Contratos',
  'Unidade de Gestão de Vendas',
  'Gabinete da Diretoria de Relacionamento com o Cliente',
]

function f(id, label, type, sectionId, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    sectionId,
    ...(opts.hidden ? { hidden: true } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
  }
}

function buildVisibilityRules() {
  const rules = []

  for (const perfil of PERFIS_EXT) {
    rules.push({
      id: `rule-pes-show-organizacao-${perfil.toLowerCase()}`,
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-pes-perfil',
      sourceKind: 'textOptions',
      expectedOptionText: perfil,
      action: 'show',
      targetFieldIds: ['patlasv4proto-pes-organizacao'],
    })
    rules.push({
      id: `rule-pes-hide-vinculo-mti-${perfil.toLowerCase()}`,
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-pes-perfil',
      sourceKind: 'textOptions',
      expectedOptionText: perfil,
      action: 'hide',
      targetFieldIds: [
        'patlasv4proto-pes-unidade-negocios',
        'patlasv4proto-pes-departamento',
      ],
    })
  }

  rules.push({
    id: 'rule-pes-show-vinculo-mti',
    operator: 'eq',
    sourceFieldId: 'patlasv4proto-pes-perfil',
    sourceKind: 'textOptions',
    expectedOptionText: 'MTI',
    action: 'show',
    targetFieldIds: [
      'patlasv4proto-pes-unidade-negocios',
      'patlasv4proto-pes-departamento',
    ],
  })

  rules.push({
    id: 'rule-pes-hide-organizacao-mti',
    operator: 'eq',
    sourceFieldId: 'patlasv4proto-pes-perfil',
    sourceKind: 'textOptions',
    expectedOptionText: 'MTI',
    action: 'hide',
    targetFieldIds: ['patlasv4proto-pes-organizacao'],
  })

  return rules
}

function buildPessoasForm(old) {
  const removeIds = new Set(['patlasv4proto-pes-unidade-organizacional'])
  const kept = (old.fields ?? []).filter((field) => !removeIds.has(field.id))
  const byId = new Map(kept.map((field) => [field.id, field]))

  if (byId.has('patlasv4proto-pes-perfil')) {
    const perfil = byId.get('patlasv4proto-pes-perfil')
    perfil.label = 'Perfil de cadastro'
    perfil.options = PERFIS
    perfil.spec =
      'Cliente, Parceiro, MTI, Fornecedor ou Fabricante. MTI exibe Unidade de negócios e Departamento; demais perfis exibem Organização.'
  }

  const vinculoFields = [
    f('patlasv4proto-pes-organizacao', 'Organização', 'reference', 'sec-patlasv4proto-pes-principal', {
      hidden: true,
      linkedFormId: FORM_UO,
      options: ORG_OPTS,
      spec: 'Organização vinculada (Cliente, Parceiro, Fornecedor ou Fabricante). Mesmo vínculo UO, rótulo conforme perfil.',
    }),
    f(
      'patlasv4proto-pes-unidade-negocios',
      'Unidade de negócios',
      'reference',
      'sec-patlasv4proto-pes-principal',
      {
        hidden: true,
        linkedFormId: FORM_UO,
        options: UN_NEG_OPTS,
        spec: 'Unidade de negócios MTI (diretoria/gabinete). Exibido somente quando Perfil de cadastro = MTI.',
      },
    ),
    f('patlasv4proto-pes-departamento', 'Departamento', 'reference', 'sec-patlasv4proto-pes-principal', {
      hidden: true,
      linkedFormId: FORM_UO,
      options: DEPT_OPTS,
      spec: 'Departamento/unidade subordinada MTI. Exibido somente quando Perfil de cadastro = MTI.',
    }),
  ]

  for (const vf of vinculoFields) {
    byId.set(vf.id, vf)
  }

  const order = [
    'patlasv4proto-pes-perfil',
    'patlasv4proto-pes-organizacao',
    'patlasv4proto-pes-unidade-negocios',
    'patlasv4proto-pes-departamento',
    'patlasv4proto-pes-cargo',
    'patlasv4proto-pes-nome',
    'patlasv4proto-pes-outros-nomes',
    'patlasv4proto-pes-foto',
    'patlasv4proto-pes-carteira',
    'patlasv4proto-pes-nasc',
    'patlasv4proto-pes-falecido',
    'patlasv4proto-pes-documentos',
    'patlasv4proto-pes-filiacao',
    'patlasv4proto-pes-sexo',
    'patlasv4proto-pes-genero',
    'patlasv4proto-pes-deficiencias',
    'patlasv4proto-pes-pais-nasc',
    'patlasv4proto-pes-nacionalidade',
    'patlasv4proto-pes-naturalidade',
    'patlasv4proto-pes-estado-civil',
    'patlasv4proto-pes-cor-raca',
    'patlasv4proto-pes-ativo-acesso',
    'patlasv4proto-pes-login',
    'patlasv4proto-pes-senha',
    'patlasv4proto-pes-telefones',
    'patlasv4proto-pes-emails',
    'patlasv4proto-pes-email-principal',
    'patlasv4proto-pes-enderecos',
    'patlasv4proto-pes-redes',
    'patlasv4proto-pes-matricula',
    'patlasv4proto-pes-codigo-ext',
    'patlasv4proto-pes-aceite-email',
    'patlasv4proto-pes-aceite-sms',
    'patlasv4proto-pes-aceite-whatsapp',
    'patlasv4proto-pes-dados-banc',
    'patlasv4proto-pes-tags',
  ]

  const fields = []
  const used = new Set()
  for (const id of order) {
    if (byId.has(id)) {
      fields.push(byId.get(id))
      used.add(id)
    }
  }
  for (const field of byId.values()) {
    if (!used.has(field.id)) fields.push(field)
  }

  const presets = (old.exampleValuePresets ?? []).map((preset) => {
    const fv = { ...preset.fieldValues }
    delete fv['patlasv4proto-pes-unidade-organizacional']

    if (preset.id === 'patlasv4proto-p-pessoa-lucas') {
      fv['patlasv4proto-pes-perfil'] = 'MTI'
      fv['patlasv4proto-pes-unidade-negocios'] =
        'Gabinete da Diretoria de Relacionamento com o Cliente'
      fv['patlasv4proto-pes-departamento'] = 'Unidade de Gestão de Projetos'
      delete fv['patlasv4proto-pes-organizacao']
    }
    if (preset.id === 'patlasv4proto-p-pessoa-mti') {
      fv['patlasv4proto-pes-perfil'] = 'MTI'
      fv['patlasv4proto-pes-unidade-negocios'] = 'Unidade de Gestão de Projetos'
      delete fv['patlasv4proto-pes-organizacao']
    }
    if (preset.id === 'patlasv4proto-p-pessoa-parceiro') {
      fv['patlasv4proto-pes-perfil'] = 'Parceiro'
      fv['patlasv4proto-pes-organizacao'] = 'EloGroup'
      delete fv['patlasv4proto-pes-unidade-negocios']
      delete fv['patlasv4proto-pes-departamento']
    }

    return { ...preset, fieldValues: fv }
  })

  const sections = (old.sections ?? []).filter((s) => s.id !== 'sec-patlasv4proto-pes-curriculo')

  return {
    ...old,
    metadata:
      'Protótipo Atlas — Pessoas. Perfil de cadastro define vínculo: MTI → Unidade de negócios + Departamento; demais → Organização.',
    sections,
    fields,
    fieldVisibilityRules: buildVisibilityRules(),
    exampleValuePresets: presets,
    activeExamplePresetId: old.activeExamplePresetId,
    methods: old.methods,
  }
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const idx = forms.findIndex((f) => f.id === FORM_PESSOAS)
  if (idx < 0) {
    console.error('Formulário Pessoas não encontrado')
    process.exit(1)
  }

  forms[idx] = buildPessoasForm(forms[idx])
  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  console.log('✓ Pessoas — Perfil de cadastro (Cliente, Parceiro, MTI, Fornecedor, Fabricante)')
  console.log('✓ Pessoas — MTI: Unidade de negócios + Departamento; demais: Organização')
  console.log('✓ Pessoas — aba Currículo removida')
}

main()
