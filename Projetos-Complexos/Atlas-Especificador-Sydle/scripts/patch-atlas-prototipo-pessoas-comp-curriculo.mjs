#!/usr/bin/env node
/**
 * Pessoas — aba Complementares (layout + fornecedor) e aba Currículo.
 * Uso: node scripts/patch-atlas-prototipo-pessoas-comp-curriculo.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)

const FORM = 'form-patlasv4-proto-pessoa'
const FORM_BANCO = 'form-patlasv4-proto-pessoa-dados-bancarios'
const FORM_HAB = 'form-patlasv4-proto-pessoa-habilidade'
const FORM_EXP_ACAD = 'form-patlasv4-proto-pessoa-exp-academica'
const FORM_EXP_PROF = 'form-patlasv4-proto-pessoa-exp-profissional'

const SEC_CURR = 'sec-patlasv4proto-pes-curriculo'
const SEC_CURR_TRAB = 'sec-patlasv4proto-pes-curr-trabalho'
const SEC_CURR_HAB = 'sec-patlasv4proto-pes-curr-habilidades'
const SEC_CURR_EXP_ACAD = 'sec-patlasv4proto-pes-curr-exp-acad'
const SEC_CURR_EXP_PROF = 'sec-patlasv4proto-pes-curr-exp-prof'

const REMOVE_IDS = new Set(['mqi7cn8on06kzv', 'mqi7czlxh57594'])

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
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
  }
}

function buildDadosBancariosForm() {
  return {
    id: FORM_BANCO,
    name: 'Pessoa — Dados bancários',
    sectionLayout: 'none',
    metadata: 'Linha embutida — conta bancária e Pix.',
    fields: [
      f('patlasv4proto-pban-tipo-conta', 'Tipo de conta', 'textOptions', null, {
        required: true,
        options: ['Conta corrente', 'Conta poupança', 'Conta salário'],
      }),
      f('patlasv4proto-pban-tipo-pix', 'Tipo de chave Pix', 'textOptions', null, {
        required: true,
        options: ['CPF', 'CNPJ', 'E-mail', 'Telefone', 'Chave aleatória'],
      }),
      f('patlasv4proto-pban-banco', 'Banco', 'textOptions', null, {
        required: true,
        options: ['Banco do Brasil', 'Caixa', 'Bradesco', 'Itaú', 'Santander', 'Sicredi'],
      }),
      f('patlasv4proto-pban-agencia', 'Agência', 'text', null, { required: true, size: 'small' }),
      f('patlasv4proto-pban-conta', 'Conta (com dígito)', 'text', null, { required: true }),
      f('patlasv4proto-pban-cpf', 'CPF', 'text', null, { required: true, size: 'small' }),
      f('patlasv4proto-pban-chave-pix', 'Chave Pix', 'text', null, {}),
    ],
  }
}

function buildHabilidadeForm() {
  return {
    id: FORM_HAB,
    name: 'Pessoa — Habilidade',
    sectionLayout: 'none',
    fields: [
      f('patlasv4proto-phab-habilidade', 'Habilidade', 'textOptions', null, {
        required: true,
        options: ['Gestão de projetos', 'Desenvolvimento de software', 'Análise de negócios', 'Comunicação'],
      }),
      f('patlasv4proto-phab-tempo', 'Tempo de experiência', 'textOptions', null, {
        required: true,
        options: ['Menos de 1 ano', '1–3 anos', '3–5 anos', '5–10 anos', 'Mais de 10 anos'],
      }),
    ],
  }
}

function buildExpAcademicaForm() {
  return {
    id: FORM_EXP_ACAD,
    name: 'Pessoa — Experiência acadêmica',
    sectionLayout: 'none',
    fields: [
      f('patlasv4proto-peac-tipo', 'Tipo', 'textOptions', null, {
        required: true,
        options: ['Graduação', 'Pós-graduação', 'Mestrado', 'Doutorado', 'Técnico', 'Curso livre'],
      }),
      f('patlasv4proto-peac-instituicao', 'Instituição de ensino', 'textOptions', null, {
        required: true,
        options: ['UFMT', 'UFPR', 'USP', 'UNICAMP', 'Outra'],
      }),
      f('patlasv4proto-peac-nome-inst', 'Nome da Instituição de ensino', 'text', null, {}),
      f('patlasv4proto-peac-obs', 'Observação', 'text', null, {}),
      f('patlasv4proto-peac-arquivo', 'Arquivo', 'file', null, {}),
    ],
  }
}

function buildExpProfissionalForm() {
  return {
    id: FORM_EXP_PROF,
    name: 'Pessoa — Experiência profissional',
    sectionLayout: 'none',
    fields: [
      f('patlasv4proto-pepr-empresa', 'Empresa', 'textOptions', null, {
        required: true,
        options: ['MTI', 'EloGroup', 'SEPLAG', 'Outra'],
      }),
      f('patlasv4proto-pepr-nome-empresa', 'Nome da empresa', 'text', null, {}),
      f('patlasv4proto-pepr-cargo', 'Cargo', 'text', null, {}),
      f('patlasv4proto-pepr-inicio', 'Data de início', 'date', null, { required: true }),
      f('patlasv4proto-pepr-fim', 'Data de fim', 'date', null, {}),
      f('patlasv4proto-pepr-obs', 'Observação', 'text', null, {}),
    ],
  }
}

const COMP_ORDER = [
  'patlasv4proto-pes-sigadoc-pendente',
  'patlasv4proto-pes-matricula-sigadoc',
  'patlasv4proto-pes-mtid',
  'patlasv4proto-pes-aceite-email',
  'patlasv4proto-pes-aceite-sms',
  'patlasv4proto-pes-aceite-whatsapp',
  'patlasv4proto-pes-fornecedor',
  'patlasv4proto-pes-ativo-demandas',
  'patlasv4proto-pes-procon-digital',
  'patlasv4proto-pes-transito-julgado',
  'patlasv4proto-pes-tipo-companhia',
  'patlasv4proto-pes-anexos',
  'patlasv4proto-pes-clube-servidor',
  'patlasv4proto-pes-dados-banc',
  'patlasv4proto-pes-tags',
  'patlasv4proto-pes-codigo-ext',
]

const CURR_ORDER = [
  'patlasv4proto-pes-curr-interesses',
  'patlasv4proto-pes-curr-obs',
  'patlasv4proto-pes-curr-perfil-prof',
  'patlasv4proto-pes-curr-habilidades',
  'patlasv4proto-pes-curr-idiomas',
  'patlasv4proto-pes-curr-especialidades',
  'patlasv4proto-pes-curr-exp-acad',
  'patlasv4proto-pes-curr-exp-prof',
  'patlasv4proto-pes-curr-media-emprego',
  'patlasv4proto-pes-curr-qtd-candidaturas',
  'patlasv4proto-pes-curr-arquivo',
  'patlasv4proto-pes-curr-lattes',
]

function complementaresPatch() {
  const SEC_COMP = 'sec-patlasv4proto-pes-complementares'
  return [
    f(
      'patlasv4proto-pes-sigadoc-pendente',
      'Possui documento pendente de criação no Sigadoc?',
      'boolean',
      SEC_COMP,
      { size: 'small' },
    ),
    f('patlasv4proto-pes-matricula-sigadoc', 'Matrícula no Sigadoc', 'text', SEC_COMP, { size: 'small' }),
    f('patlasv4proto-pes-mtid', 'MT-ID', 'text', SEC_COMP, { size: 'small' }),
    f(
      'patlasv4proto-pes-aceite-email',
      'Aceite de recebimento de notificação via email',
      'boolean',
      SEC_COMP,
      { size: 'large' },
    ),
    f(
      'patlasv4proto-pes-aceite-sms',
      'Aceite de recebimento de notificação via sms',
      'boolean',
      SEC_COMP,
      { size: 'large' },
    ),
    f(
      'patlasv4proto-pes-aceite-whatsapp',
      'Aceite de recebimento de notificação via Whatsapp',
      'boolean',
      SEC_COMP,
      { size: 'large' },
    ),
    f('patlasv4proto-pes-fornecedor', 'É um fornecedor?', 'textOptions', SEC_COMP, {
      required: true,
      options: ['Sim', 'Não'],
    }),
    f('patlasv4proto-pes-ativo-demandas', 'Ativo para receber demandas?', 'textOptions', SEC_COMP, {
      required: true,
      hidden: true,
      options: ['Sim', 'Não'],
    }),
    f('patlasv4proto-pes-procon-digital', 'Aderiu ao Procon Digital?', 'textOptions', SEC_COMP, {
      required: true,
      hidden: true,
      options: ['Sim', 'Não'],
    }),
    f(
      'patlasv4proto-pes-transito-julgado',
      'Data do último trânsito em julgado',
      'date',
      SEC_COMP,
      { hidden: true },
    ),
    f('patlasv4proto-pes-tipo-companhia', 'Tipo de companhia', 'textOptions', SEC_COMP, {
      hidden: true,
      options: ['Matriz', 'Filial'],
    }),
    f('patlasv4proto-pes-anexos', 'Anexos', 'file', SEC_COMP, { size: 'medium', multiple: true }),
    f('patlasv4proto-pes-clube-servidor', 'Clube do servidor', 'text', SEC_COMP, {}),
    f('patlasv4proto-pes-dados-banc', 'Dados bancários', 'embeddedReference', SEC_COMP, {
      size: 'large',
      multiple: true,
      linkedFormId: FORM_BANCO,
      embeddedDisplay: 'table',
      spec: 'Tipo de conta, Pix, banco, agência, conta, CPF e chave Pix.',
    }),
    f('patlasv4proto-pes-tags', 'Tags', 'textOptions', SEC_COMP, {
      multiple: true,
      options: ['Colaborador', 'Terceirizado', 'Estagiário', 'Prestador', 'Fornecedor'],
    }),
    f('patlasv4proto-pes-codigo-ext', 'Código externo', 'text', SEC_COMP, {}),
  ]
}

function curriculoFields() {
  return [
    f('patlasv4proto-pes-curr-interesses', 'Interesses', 'textOptions', SEC_CURR_TRAB, {
      options: ['Tecnologia', 'Gestão pública', 'Consultoria', 'Educação'],
    }),
    f('patlasv4proto-pes-curr-obs', 'Observação', 'text', SEC_CURR_TRAB, { textLong: true }),
    f('patlasv4proto-pes-curr-perfil-prof', 'Perfil profissional', 'text', SEC_CURR_TRAB, {
      size: 'large',
      textLong: true,
    }),
    f('patlasv4proto-pes-curr-habilidades', 'Habilidades e Recomendações', 'embeddedReference', SEC_CURR_HAB, {
      size: 'large',
      multiple: true,
      linkedFormId: FORM_HAB,
      embeddedDisplay: 'table',
    }),
    f('patlasv4proto-pes-curr-idiomas', 'Idiomas (fluentes)', 'textOptions', SEC_CURR, {
      multiple: true,
      options: ['Português', 'Inglês', 'Espanhol', 'Francês'],
    }),
    f('patlasv4proto-pes-curr-especialidades', 'Especialidades', 'textOptions', SEC_CURR, {
      multiple: true,
      options: ['Desenvolvimento', 'Arquitetura', 'Gestão', 'Qualidade'],
    }),
    f('patlasv4proto-pes-curr-exp-acad', 'Experiências acadêmicas', 'embeddedReference', SEC_CURR_EXP_ACAD, {
      size: 'large',
      multiple: true,
      linkedFormId: FORM_EXP_ACAD,
      embeddedDisplay: 'table',
    }),
    f('patlasv4proto-pes-curr-exp-prof', 'Experiências profissionais', 'embeddedReference', SEC_CURR_EXP_PROF, {
      size: 'large',
      multiple: true,
      linkedFormId: FORM_EXP_PROF,
      embeddedDisplay: 'table',
    }),
    f('patlasv4proto-pes-curr-media-emprego', 'Média de tempo por emprego', 'text', SEC_CURR, {
      readOnly: true,
      spec: 'Calculado a partir das experiências profissionais.',
    }),
    f('patlasv4proto-pes-curr-qtd-candidaturas', 'Quantidade de candidaturas', 'text', SEC_CURR, {
      readOnly: true,
      spec: 'Contador de candidaturas no sistema.',
    }),
    f('patlasv4proto-pes-curr-arquivo', 'Arquivo de Currículo', 'file', SEC_CURR, {}),
    f('patlasv4proto-pes-curr-lattes', 'Link para Lattes', 'text', SEC_CURR, { size: 'large' }),
  ]
}

function buildVisibilityRules() {
  return [
    {
      id: 'rule-pes-show-fornecedor-campos',
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-pes-fornecedor',
      sourceKind: 'textOptions',
      expectedOptionText: 'Sim',
      action: 'show',
      targetFieldIds: [
        'patlasv4proto-pes-ativo-demandas',
        'patlasv4proto-pes-procon-digital',
        'patlasv4proto-pes-transito-julgado',
        'patlasv4proto-pes-tipo-companhia',
      ],
    },
  ]
}

function patchPessoaForm(old) {
  const byId = new Map(
    (old.fields ?? [])
      .filter((field) => !REMOVE_IDS.has(field.id))
      .map((field) => [field.id, field]),
  )

  delete byId.get('patlasv4proto-pes-matricula')

  for (const field of complementaresPatch()) byId.set(field.id, field)
  for (const field of curriculoFields()) byId.set(field.id, field)

  const sections = [
    ...(old.sections ?? []).filter((s) => s.id !== SEC_CURR),
    { id: SEC_CURR, title: 'Currículo', icon: 'school' },
    { id: SEC_CURR_TRAB, title: 'Trabalho e Educação', icon: 'work', parentSectionId: SEC_CURR },
    { id: SEC_CURR_HAB, title: 'Habilidades e Recomendações', icon: 'psychology', parentSectionId: SEC_CURR },
    { id: SEC_CURR_EXP_ACAD, title: 'Experiências acadêmicas', icon: 'menu_book', parentSectionId: SEC_CURR },
    { id: SEC_CURR_EXP_PROF, title: 'Experiências profissionais', icon: 'business_center', parentSectionId: SEC_CURR },
  ]

  const order = [
    ...Object.keys(Object.fromEntries([...(old.fields ?? []).map((x) => [x.id, 1])])),
  ]
  const kept = [...byId.keys()].filter((id) => !CURR_ORDER.includes(id) && !COMP_ORDER.includes(id))
  const orderedIds = [
    ...kept.filter((id) => !COMP_ORDER.includes(id) && !CURR_ORDER.includes(id)),
    ...COMP_ORDER.filter((id) => byId.has(id)),
    ...CURR_ORDER.filter((id) => byId.has(id)),
  ]
  const seen = new Set()
  const fields = []
  for (const id of orderedIds) {
    if (seen.has(id) || !byId.has(id)) continue
    seen.add(id)
    fields.push(byId.get(id))
  }
  for (const field of byId.values()) {
    if (!seen.has(field.id)) fields.push(field)
  }

  const presets = (old.exampleValuePresets ?? []).map((preset) => {
    const fv = { ...(preset.fieldValues ?? {}) }
    delete fv['patlasv4proto-pes-matricula']
    if (preset.id === 'patlasv4proto-p-pessoa-bernardo') {
      Object.assign(fv, {
        'patlasv4proto-pes-sigadoc-pendente': true,
        'patlasv4proto-pes-aceite-email': true,
        'patlasv4proto-pes-aceite-sms': true,
        'patlasv4proto-pes-aceite-whatsapp': true,
        'patlasv4proto-pes-fornecedor': 'Sim',
        'patlasv4proto-pes-ativo-demandas': 'Sim',
        'patlasv4proto-pes-procon-digital': 'Não',
        'patlasv4proto-pes-tipo-companhia': 'Matriz',
      })
    }
    return { ...preset, fieldValues: fv }
  })

  return {
    ...old,
    metadata:
      'Protótipo Atlas — Pessoas. Abas: Geral, Dados de contato, Complementares e Currículo.',
    sections,
    fields,
    fieldVisibilityRules: buildVisibilityRules(),
    exampleValuePresets: presets,
    activeExamplePresetId: old.activeExamplePresetId ?? 'patlasv4proto-p-pessoa-bernardo',
  }
}

function upsertForm(forms, formDef) {
  const idx = forms.findIndex((x) => x.id === formDef.id)
  if (idx >= 0) forms[idx] = formDef
  else forms.push(formDef)
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  upsertForm(forms, buildDadosBancariosForm())
  upsertForm(forms, buildHabilidadeForm())
  upsertForm(forms, buildExpAcademicaForm())
  upsertForm(forms, buildExpProfissionalForm())

  const idx = forms.findIndex((x) => x.id === FORM)
  if (idx < 0) throw new Error(`Formulário ${FORM} não encontrado`)
  forms[idx] = patchPessoaForm(forms[idx])

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('✓ Pessoas — Complementares (fornecedor, dados bancários, anexos)')
  console.log('✓ Pessoas — aba Currículo com experiências e habilidades')
}

main()
