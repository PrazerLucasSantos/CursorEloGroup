#!/usr/bin/env node
/**
 * Gera exemplos da árvore organizacional MTI (Decreto) em Nível e Unidade Organizacional.
 * Cria formulário Organização ausente e atualiza referências no épico.
 * Uso: node scripts/build-mti-org-tree.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-v4-prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const WORKSPACES_PATH = path.join(EPIC_DIR, 'workspaces.json')
const TREE_PATH = path.join(__dirname, '../source/MTI_Arvore_Decreto.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_NIVEL = 'form-patlasv4-proto-nivel-organizacional'
const FORM_ORG = 'form-patlasv4-proto-organizacao'

const NIVEL_COLORS = {
  Empresa: '#0c4a6e',
  Conselho: '#1e3a5f',
  'Diretoria Executiva': '#1d4ed8',
  Gabinete: '#2563eb',
  Unidade: '#0d9488',
  'Unidade ou Assessoria': '#0891b2',
  Gerência: '#7c3aed',
  Ouvidoria: '#b45309',
  Assessoria: '#c026d3',
  'Assessoria ou Unidade': '#a21caf',
  Coordenação: '#64748b',
  Outros: '#94a3b8',
}

function slugCodigo(codigo) {
  return codigo
    .toLowerCase()
    .replace(/\./g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function resolvePai(paiRef, nomeBySigla, raizNome) {
  if (!paiRef || paiRef === 'vazio') return undefined
  if (paiRef === 'MTI') return raizNome
  return nomeBySigla[paiRef] ?? paiRef
}

function buildNivelPresets(unidades) {
  const seen = new Set()
  const presets = []
  for (const u of unidades) {
    const nome = u.nivelOrganizacional
    if (seen.has(nome)) continue
    seen.add(nome)
    const slug = nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    presets.push({
      id: `patlasv4proto-p-nivel-mti-${slug}`,
      name: `MTI — ${nome}`,
      iconColor: NIVEL_COLORS[nome] ?? '#475569',
      fieldValues: {
        'patlasv4proto-nivel-organizacional-dados-do-nivel-nome': nome,
        'patlasv4proto-nivel-organizacional-dados-do-nivel-ativo-inativo': true,
      },
    })
  }
  return presets
}

function buildUoPreset(u, paiNome, raizExtras) {
  const id =
    u.codigo === 'Raiz'
      ? 'patlasv4proto-p-unidade-organizacional-mti'
      : `patlasv4proto-p-uo-mti-${slugCodigo(u.codigo)}`

  const fieldValues = {
    'patlasv4proto-uo-nome': u.nome,
    'patlasv4proto-uo-nivel-organizacional': u.nivelOrganizacional,
    'patlasv4proto-uo-nivel': String(u.nivelNumerico),
    'patlasv4proto-uo-codigo-externo': u.codigo,
    'patlasv4proto-uo-estrutura-formal': true,
    'mqfdo9xlp27377': true,
  }

  if (u.sigla) fieldValues['patlasv4proto-uo-sigla'] = u.sigla
  if (paiNome) fieldValues['patlasv4proto-uo-unidade-pai'] = paiNome

  if (u.codigo === 'Raiz') {
    Object.assign(fieldValues, {
      'patlasv4proto-uo-sigla': 'MTI',
      'patlasv4proto-uo-hor-ini': '08:00',
      'patlasv4proto-uo-hor-fim': '18:00',
      'patlasv4proto-uo-hor-func': '8h às 18h, segunda a sexta',
      'patlasv4proto-uo-cnpj': '03.549.382/0001-06',
      'patlasv4proto-uo-responsavel': 'Lucas Santos',
      'patlasv4proto-uo-logo': 'logo_mti.png',
      'patlasv4proto-uo-url-logo': 'https://www.mti.mt.gov.br/logo.png',
      'patlasv4proto-uo-contato-email-principal': 'contato@mti.mt.gov.br',
      'patlasv4proto-uo-loc-cep': '78049-903',
      'patlasv4proto-uo-loc-logradouro': 'Rua Um',
      'patlasv4proto-uo-loc-numero': 's/n',
      'patlasv4proto-uo-loc-bairro': 'Centro Político Administrativo',
      'patlasv4proto-uo-loc-cidade': 'Cuiabá',
      'patlasv4proto-uo-loc-estado': 'MT',
      'patlasv4proto-uo-loc-pais': 'Brasil',
      'patlasv4proto-uo-representa-organizacao': true,
      'patlasv4proto-uo-tipo-organizacao': 'MTI',
      'patlasv4proto-uo-observacoes-organizacao': 'Unidade raiz MTI — empresa pública estadual (Decreto).',
    })
  }

  const preset = {
    id,
    name: u.codigo === 'Raiz' ? 'Exemplo MTI (raiz)' : `MTI — ${u.codigo} ${u.nome}`,
    iconColor: u.codigo === 'Raiz' ? '#0c4a6e' : '#0369a1',
    fieldValues,
  }

  if (u.codigo === 'Raiz' && raizExtras?.embeddedRowsByFieldId) {
    preset.embeddedRowsByFieldId = raizExtras.embeddedRowsByFieldId
  }

  return preset
}

function buildOrganizacaoForm(raizNome) {
  return {
    id: FORM_ORG,
    name: 'Organização',
    sectionLayout: 'none',
    defaultCanvasMode: 'read',
    metadata:
      'Protótipo Atlas — Organização qualificada (MTI, Parceiro, Cliente). Derivada de Unidade Organizacional com Representa Organização? = Sim.',
    fields: [
      {
        id: 'patlasv4proto-organizacao-nome',
        label: 'Nome',
        type: 'text',
        size: 'large',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'identity',
        spec: 'Nome ou sigla usada em referências de processos (ex.: MTI, SEPLAG).',
      },
      {
        id: 'patlasv4proto-organizacao-tipo',
        label: 'Tipo',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        options: ['MTI', 'Parceiro', 'Cliente'],
        spec: 'Classificação da organização no Atlas.',
      },
      {
        id: 'patlasv4proto-organizacao-unidade-vinculada',
        label: 'Unidade organizacional vinculada',
        type: 'reference',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        linkedFormId: FORM_UO,
        spec: 'Unidade Organizacional que representa esta organização.',
      },
      {
        id: 'patlasv4proto-organizacao-ativo',
        label: 'Ativo',
        type: 'boolean',
        size: 'medium',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
      },
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-organizacao-mti',
        name: 'Exemplo MTI',
        iconColor: '#0c4a6e',
        fieldValues: {
          'patlasv4proto-organizacao-nome': 'MTI',
          'patlasv4proto-organizacao-tipo': 'MTI',
          'patlasv4proto-organizacao-unidade-vinculada': raizNome,
          'patlasv4proto-organizacao-ativo': true,
        },
      },
      {
        id: 'patlasv4proto-p-organizacao-parceiro',
        name: 'Exemplo Parceiro',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlasv4proto-organizacao-nome': 'EloGroup',
          'patlasv4proto-organizacao-tipo': 'Parceiro',
          'patlasv4proto-organizacao-unidade-vinculada': 'EloGroup',
          'patlasv4proto-organizacao-ativo': true,
        },
      },
      {
        id: 'patlasv4proto-p-organizacao-cliente',
        name: 'Exemplo Cliente',
        iconColor: '#0d9488',
        fieldValues: {
          'patlasv4proto-organizacao-nome': 'SEPLAG',
          'patlasv4proto-organizacao-tipo': 'Cliente',
          'patlasv4proto-organizacao-unidade-vinculada':
            'Secretaria de Estado de Planejamento e Gestão',
          'patlasv4proto-organizacao-ativo': true,
        },
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-organizacao-mti',
    methods: [
      {
        id: 'mqb5plis108pjh-org',
        name: 'Unidade Organizacional',
        icon: 'hub',
        kind: 'destaque',
      },
    ],
  }
}

function parceiroClientePresets() {
  return [
    {
      id: 'patlasv4proto-p-unidade-organizacional-parceiro',
      name: 'Exemplo Parceiro',
      iconColor: '#7c3aed',
      fieldValues: {
        'patlasv4proto-uo-nome': 'EloGroup',
        'patlasv4proto-uo-sigla': 'ELO',
        'patlasv4proto-uo-nivel-organizacional': 'Empresa',
        'patlasv4proto-uo-nivel': '0',
        'patlasv4proto-uo-hor-ini': '09:00',
        'patlasv4proto-uo-hor-fim': '17:00',
        'patlasv4proto-uo-hor-func': '9h às 17h',
        'patlasv4proto-uo-contato-email-principal': 'contato@elogroup.com.br',
        'patlasv4proto-uo-estrutura-formal': true,
        'patlasv4proto-uo-representa-organizacao': true,
        'patlasv4proto-uo-tipo-organizacao': 'Parceiro',
        'patlasv4proto-uo-produto-parceria': 'Parceria EloGroup — MTI Simplifica',
        'patlasv4proto-uo-observacoes-organizacao': 'Parceiro homologado para produtos MTI.',
        'mqfdo9xlp27377': true,
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-uo-contato-emails': [
          {
            'patlasv4proto-peml-tipo': 'Comercial',
            'patlasv4proto-peml-email': 'contato@elogroup.com.br',
          },
        ],
        'patlasv4proto-uo-contato-telefones': [
          {
            'patlasv4proto-ptel-tipo': 'Celular',
            'patlasv4proto-ptel-pais': 'Brasil',
            'patlasv4proto-ptel-ddi': '+55',
            'patlasv4proto-ptel-numero': '(11) 3000-0000',
          },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-unidade-organizacional-cliente',
      name: 'Exemplo Cliente',
      iconColor: '#0d9488',
      fieldValues: {
        'patlasv4proto-uo-nome': 'Secretaria de Estado de Planejamento e Gestão',
        'patlasv4proto-uo-sigla': 'SEPLAG',
        'patlasv4proto-uo-nivel-organizacional': 'Empresa',
        'patlasv4proto-uo-nivel': '0',
        'patlasv4proto-uo-hor-ini': '08:00',
        'patlasv4proto-uo-hor-fim': '14:00',
        'patlasv4proto-uo-hor-func': '8h às 14h',
        'patlasv4proto-uo-contato-email-principal': 'contato@seplag.mt.gov.br',
        'patlasv4proto-uo-estrutura-formal': true,
        'patlasv4proto-uo-representa-organizacao': true,
        'patlasv4proto-uo-tipo-organizacao': 'Cliente',
        'patlasv4proto-uo-observacoes-organizacao': 'Órgão cliente estadual.',
        'mqfdo9xlp27377': true,
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-uo-contato-emails': [
          {
            'patlasv4proto-peml-tipo': 'Institucional',
            'patlasv4proto-peml-email': 'contato@seplag.mt.gov.br',
          },
        ],
        'patlasv4proto-uo-contato-telefones': [
          {
            'patlasv4proto-ptel-tipo': 'Comercial',
            'patlasv4proto-ptel-pais': 'Brasil',
            'patlasv4proto-ptel-ddi': '+55',
            'patlasv4proto-ptel-numero': '(65) 3613-7000',
          },
        ],
      },
    },
  ]
}

function remapReferenceValues(obj, legadoMap, uoNomes) {
  if (typeof obj === 'string') {
    if (legadoMap[obj]) return legadoMap[obj]
    return obj
  }
  if (Array.isArray(obj)) return obj.map((v) => remapReferenceValues(v, legadoMap, uoNomes))
  if (obj && typeof obj === 'object') {
    const next = {}
    for (const [k, v] of Object.entries(obj)) next[k] = remapReferenceValues(v, legadoMap, uoNomes)
    return next
  }
  return obj
}

function updateFieldOptions(forms, fieldId, options) {
  for (const form of forms) {
    const field = form.fields?.find((f) => f.id === fieldId)
    if (field) {
      field.options = options
      return true
    }
  }
  return false
}

function main() {
  const tree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'))
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const workspaces = JSON.parse(fs.readFileSync(WORKSPACES_PATH, 'utf8'))

  const { raizNome, unidades, referenciasLegadas } = tree

  const nomeBySigla = { MTI: raizNome }
  for (const u of unidades) {
    if (u.sigla) nomeBySigla[u.sigla] = u.nome
  }
  for (const u of unidades) {
    nomeBySigla[u.nome] = u.nome
  }

  const uoFormIdx = forms.findIndex((f) => f.id === FORM_UO)
  const nivelFormIdx = forms.findIndex((f) => f.id === FORM_NIVEL)
  if (uoFormIdx < 0 || nivelFormIdx < 0) {
    console.error('Formulários UO ou Nível não encontrados.')
    process.exit(1)
  }

  const uoForm = forms[uoFormIdx]
  const nivelForm = forms[nivelFormIdx]

  const raizPresetOld = uoForm.exampleValuePresets?.find(
    (p) => p.id === 'patlasv4proto-p-unidade-organizacional-mti',
  )
  const raizExtras = raizPresetOld
    ? { embeddedRowsByFieldId: raizPresetOld.embeddedRowsByFieldId }
    : {
        embeddedRowsByFieldId: {
          'patlasv4proto-uo-contato-emails': [
            {
              'patlasv4proto-peml-tipo': 'Institucional',
              'patlasv4proto-peml-email': 'contato@mti.mt.gov.br',
            },
          ],
          'patlasv4proto-uo-contato-telefones': [
            {
              'patlasv4proto-ptel-tipo': 'Comercial',
              'patlasv4proto-ptel-pais': 'Brasil',
              'patlasv4proto-ptel-ddi': '+55',
              'patlasv4proto-ptel-numero': '(65) 3613-5000',
            },
          ],
          'patlasv4proto-uo-contato-enderecos': [
            {
              'patlasv4proto-pend-cep': '78049-903',
              'patlasv4proto-pend-logradouro': 'Rua Um',
              'patlasv4proto-pend-numero': 's/n',
              'patlasv4proto-pend-bairro': 'Centro Político Administrativo',
              'patlasv4proto-pend-cidade': 'Cuiabá / Mato Grosso / Brasil',
              'patlasv4proto-pend-estado': 'Mato Grosso / Brasil',
              'patlasv4proto-pend-pais': 'Brasil',
            },
          ],
        },
      }

  const mtiUoPresets = unidades.map((u) => {
    const paiNome = resolvePai(u.pai, nomeBySigla, raizNome)
    return buildUoPreset(u, paiNome, u.codigo === 'Raiz' ? raizExtras : undefined)
  })

  const uoPresets = [...mtiUoPresets, ...parceiroClientePresets()]
  uoForm.exampleValuePresets = uoPresets
  uoForm.activeExamplePresetId = 'patlasv4proto-p-unidade-organizacional-mti'

  const nivelOpts = [...new Set(unidades.map((u) => u.nivelOrganizacional))]
  nivelOpts.push('Coordenação', 'Outros')
  const nivelField = uoForm.fields.find((f) => f.id === 'patlasv4proto-uo-nivel-organizacional')
  if (nivelField) nivelField.options = nivelOpts

  const nivelPresets = buildNivelPresets(unidades)
  nivelForm.exampleValuePresets = nivelPresets
  nivelForm.activeExamplePresetId = nivelPresets[0]?.id

  const orgForm = buildOrganizacaoForm(raizNome)
  const orgIdx = forms.findIndex((f) => f.id === FORM_ORG)
  if (orgIdx >= 0) {
    orgForm.methods = forms[orgIdx].methods ?? orgForm.methods
    forms[orgIdx] = orgForm
  } else {
    const insertAt = nivelFormIdx + 1
    forms.splice(insertAt, 0, orgForm)
  }

  const uoNomes = uoPresets.map((p) => p.fieldValues['patlasv4proto-uo-nome'])
  const keyUoOptions = [
    'Gabinete da Diretoria de Relacionamento com o Cliente',
    'Gabinete da Diretoria de Tecnologia da Informação e Comunicação',
    'Unidade de Gestão de Vendas',
    'Unidade de Gestão de Pós Venda',
    'Unidade de Gestão de Parcerias e Novos Negócios',
    'Gerência de Parceria e Inovação',
    'Unidade de Gestão de Projetos',
    'Gerência de Contratos',
  ]

  updateFieldOptions(forms, 'patlasv4proto-cargo-ocupantes-unidade-de-atuacao', keyUoOptions)
  updateFieldOptions(
    forms,
    'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-unidade-organizacional',
    [keyUoOptions[0]],
  )

  for (const form of forms) {
    if (
      form.id === FORM_UO ||
      form.id === FORM_NIVEL ||
      form.id === FORM_ORG ||
      !form.exampleValuePresets
    ) {
      continue
    }
    form.exampleValuePresets = form.exampleValuePresets.map((p) => ({
      ...p,
      fieldValues: p.fieldValues
        ? remapReferenceValues(p.fieldValues, referenciasLegadas, uoNomes)
        : p.fieldValues,
      embeddedRowsByFieldId: p.embeddedRowsByFieldId
        ? remapReferenceValues(p.embeddedRowsByFieldId, referenciasLegadas, uoNomes)
        : p.embeddedRowsByFieldId,
    }))
  }

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  const uoPresetIds = uoPresets.map((p) => p.id)
  const nivelPresetIds = nivelPresets.map((p) => p.id)
  const orgPresetIds = orgForm.exampleValuePresets.map((p) => p.id)

  for (const ws of workspaces) {
    for (const pkg of ws.packages ?? []) {
      for (const cls of pkg.classes ?? []) {
        if (cls.linkedFormId === FORM_UO) cls.linkedFormExamplePresetIds = uoPresetIds
        if (cls.linkedFormId === FORM_NIVEL) cls.linkedFormExamplePresetIds = nivelPresetIds
        if (cls.linkedFormId === FORM_ORG) cls.linkedFormExamplePresetIds = orgPresetIds
      }
    }
  }

  fs.writeFileSync(WORKSPACES_PATH, `${JSON.stringify(workspaces, null, 2)}\n`, 'utf8')

  console.log(`✓ ${mtiUoPresets.length} unidades MTI + 2 externas (parceiro/cliente)`)
  console.log(`✓ ${nivelPresets.length} níveis organizacionais`)
  console.log(`✓ Formulário Organização ${orgIdx >= 0 ? 'atualizado' : 'criado'}`)
  console.log(`✓ Referências legadas remapeadas para nomes completos`)
}

main()
