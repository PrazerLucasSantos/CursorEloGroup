#!/usr/bin/env node
/**
 * Cadastro Organizacional — aba Responsáveis:
 * Responsável, cargos atribuídos e pessoas nos cargos (sem coluna Servidor).
 * Uso: node scripts/patch-atlas-prototipo-uo-usuarios-responsaveis.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_CARGO = 'form-patlasv4-proto-cargo'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'
const FORM_CARGO_ATR = 'form-patlasv4-proto-uo-cargo-atribuido'
const FORM_PESSOA_CARGO = 'form-patlasv4-proto-uo-pessoa-cargo'

const SEC_UR = 'sec-patlasv4proto-uo-usuarios-responsaveis'
const OLD_SEC = 'sec-mqgzeex4-dyc70uy'

const PESSOA_OPTIONS = [
  'Lucas Santos',
  'Lucas dos Santos / lucas.santos@pclogroup.com.br',
  'Bernardo Alves Bicalho Vorges',
  'João Analista MTI',
  'Maria Consultora Parceira',
  'Carlos Gestor Cliente',
]

const CARGO_OPTIONS = [
  'Diretor',
  'Gerente de Projetos',
  'Analista de Sistemas',
  'Presidente de Comissão',
  'Membro de Comissão',
  'Gerente de Unidade',
]

const UO_OPTIONS = [
  'Empresa Mato-grossense de Tecnologia da Informação',
  'Gabinete da Diretoria de Relacionamento com o Cliente',
  'Unidade de Gestão de Projetos',
  'Unidade de Gestão de Aquisições e Contratos',
  'Gerência de Contratos',
]

const REGIAO_OPTIONS = [
  'Todos',
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
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
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
  }
}

function buildPessoaCargoForm() {
  return {
    id: FORM_PESSOA_CARGO,
    name: 'UO — Pessoa no cargo',
    sectionLayout: 'none',
    metadata: 'Linha embutida — pessoa ocupante de um cargo na unidade.',
    fields: [
      f('patlasv4proto-uopc-cargo', 'Cargo', 'reference', null, {
        required: true,
        relevance: 'identity',
        linkedFormId: FORM_CARGO,
        options: CARGO_OPTIONS,
      }),
      f('patlasv4proto-uopc-pessoa', 'Pessoa', 'reference', null, {
        required: true,
        relevance: 'highlight',
        linkedFormId: FORM_PESSOA,
        options: PESSOA_OPTIONS,
      }),
      f('patlasv4proto-uopc-condicao', 'Condição', 'textOptions', null, {
        required: true,
        size: 'small',
        options: ['Titular', 'Substituto', 'Suplente'],
      }),
      f('patlasv4proto-uopc-unidade', 'Unidade organizacional', 'reference', null, {
        linkedFormId: FORM_UO,
        options: UO_OPTIONS,
      }),
      f('patlasv4proto-uopc-regiao', 'Região de atuação', 'textOptions', null, {
        size: 'small',
        multiple: true,
        options: REGIAO_OPTIONS,
        spec: 'Padrão Todos. Restringe atuação por UF quando diferente de Todos.',
      }),
      f('patlasv4proto-uopc-data-inicio', 'Data de início', 'date', null, {
        size: 'small',
        spec: 'Início da vigência da ocupação.',
      }),
      f('patlasv4proto-uopc-data-fim', 'Data de fim', 'date', null, {
        size: 'small',
        spec: 'Fim da vigência. Vazio = ocupação ativa.',
      }),
      f('patlasv4proto-uopc-observacao', 'Observação', 'text', null, {
        size: 'large',
        textLong: true,
      }),
      f('patlasv4proto-uopc-ativo', 'Ativo', 'boolean', null, {
        size: 'small',
        required: true,
        spec: 'Ocupação ativa no cargo.',
      }),
    ],
  }
}

function buildCargoAtribuidoForm() {
  return {
    id: FORM_CARGO_ATR,
    name: 'UO — Cargo atribuído',
    sectionLayout: 'none',
    metadata: 'Linha embutida — cargo na unidade com pessoa titular.',
    fields: [
      f('patlasv4proto-uoca-cargo', 'Cargo', 'reference', null, {
        required: true,
        relevance: 'identity',
        linkedFormId: FORM_CARGO,
        options: CARGO_OPTIONS,
      }),
      f('patlasv4proto-uoca-organizacao', 'Organização', 'reference', null, {
        required: true,
        linkedFormId: FORM_UO,
        options: [
          'Empresa Mato-grossense de Tecnologia da Informação',
          'EloGroup',
          'Secretaria de Estado de Planejamento e Gestão',
        ],
      }),
      f('patlasv4proto-uoca-unidade', 'Unidade organizacional', 'reference', null, {
        required: true,
        linkedFormId: FORM_UO,
        options: UO_OPTIONS,
      }),
      f('patlasv4proto-uoca-pessoa-titular', 'Pessoa (titular)', 'reference', null, {
        readOnly: true,
        linkedFormId: FORM_PESSOA,
        options: PESSOA_OPTIONS,
      }),
      f('patlasv4proto-uoca-condicao', 'Condição', 'textOptions', null, {
        required: true,
        size: 'small',
        options: ['Titular', 'Substituto', 'Suplente'],
      }),
      f('patlasv4proto-uoca-regiao', 'Região de atuação', 'textOptions', null, {
        size: 'small',
        multiple: true,
        readOnly: true,
        options: REGIAO_OPTIONS,
      }),
      f('patlasv4proto-uoca-data-inicio', 'Data de início', 'date', null, {
        size: 'small',
        readOnly: true,
      }),
      f('patlasv4proto-uoca-data-fim', 'Data de fim', 'date', null, {
        size: 'small',
        readOnly: true,
      }),
      f('patlasv4proto-uoca-ativo', 'Ativo', 'boolean', null, {
        size: 'small',
        readOnly: true,
      }),
    ],
  }
}

const SAMPLE_CARGOS_LUCAS = [
  {
    'patlasv4proto-uoca-cargo': 'Diretor',
    'patlasv4proto-uoca-organizacao': 'Empresa Mato-grossense de Tecnologia da Informação',
    'patlasv4proto-uoca-unidade': 'Empresa Mato-grossense de Tecnologia da Informação',
    'patlasv4proto-uoca-pessoa-titular': 'Lucas Santos',
    'patlasv4proto-uoca-condicao': 'Titular',
    'patlasv4proto-uoca-regiao': 'MT',
    'patlasv4proto-uoca-data-inicio': '01/01/2020',
    'patlasv4proto-uoca-ativo': true,
  },
  {
    'patlasv4proto-uoca-cargo': 'Gerente de Projetos',
    'patlasv4proto-uoca-organizacao': 'Empresa Mato-grossense de Tecnologia da Informação',
    'patlasv4proto-uoca-unidade': 'Unidade de Gestão de Projetos',
    'patlasv4proto-uoca-pessoa-titular': 'Lucas Santos',
    'patlasv4proto-uoca-condicao': 'Titular',
    'patlasv4proto-uoca-regiao': 'Todos',
    'patlasv4proto-uoca-data-inicio': '15/03/2022',
    'patlasv4proto-uoca-ativo': true,
  },
]

const SAMPLE_PESSOAS_CARGOS_MTI = [
  {
    'patlasv4proto-uopc-cargo': 'Diretor',
    'patlasv4proto-uopc-pessoa': 'Lucas Santos',
    'patlasv4proto-uopc-condicao': 'Titular',
    'patlasv4proto-uopc-unidade': 'Empresa Mato-grossense de Tecnologia da Informação',
    'patlasv4proto-uopc-regiao': 'MT',
    'patlasv4proto-uopc-data-inicio': '01/01/2020',
    'patlasv4proto-uopc-ativo': true,
  },
  {
    'patlasv4proto-uopc-cargo': 'Diretor',
    'patlasv4proto-uopc-pessoa': 'João Analista MTI',
    'patlasv4proto-uopc-condicao': 'Substituto',
    'patlasv4proto-uopc-unidade': 'Empresa Mato-grossense de Tecnologia da Informação',
    'patlasv4proto-uopc-regiao': 'MT',
    'patlasv4proto-uopc-data-inicio': '01/06/2024',
    'patlasv4proto-uopc-ativo': true,
    'patlasv4proto-uopc-observacao': 'Substituto em período de férias do titular.',
  },
  {
    'patlasv4proto-uopc-cargo': 'Gerente de Projetos',
    'patlasv4proto-uopc-pessoa': 'Lucas Santos',
    'patlasv4proto-uopc-condicao': 'Titular',
    'patlasv4proto-uopc-unidade': 'Unidade de Gestão de Projetos',
    'patlasv4proto-uopc-regiao': 'Todos',
    'patlasv4proto-uopc-data-inicio': '15/03/2022',
    'patlasv4proto-uopc-ativo': true,
  },
  {
    'patlasv4proto-uopc-cargo': 'Gerente de Projetos',
    'patlasv4proto-uopc-pessoa': 'Maria Consultora Parceira',
    'patlasv4proto-uopc-condicao': 'Suplente',
    'patlasv4proto-uopc-unidade': 'Unidade de Gestão de Projetos',
    'patlasv4proto-uopc-regiao': 'MT',
    'patlasv4proto-uopc-data-inicio': '10/01/2025',
    'patlasv4proto-uopc-data-fim': '30/06/2025',
    'patlasv4proto-uopc-ativo': false,
    'patlasv4proto-uopc-observacao': 'Suplência encerrada.',
  },
]

function patchUoForm(uo) {
  const fields = (uo.fields ?? []).filter(
    (field) =>
      field.id !== 'patlasv4proto-uo-usuario' &&
      field.id !== 'patlasv4proto-uo-cargos-atribuidos' &&
      field.id !== 'patlasv4proto-uo-pessoas-nos-cargos',
  )

  const respIdx = fields.findIndex((x) => x.id === 'patlasv4proto-uo-responsavel')
  if (respIdx >= 0) {
    fields[respIdx] = {
      ...fields[respIdx],
      label: 'Responsável',
      sectionId: SEC_UR,
      linkedFormId: FORM_PESSOA,
      options: PESSOA_OPTIONS,
      spec: 'Pessoa responsável pela unidade organizacional.',
    }
  }

  const cargos = f('patlasv4proto-uo-cargos-atribuidos', 'Cargos atribuídos', 'embeddedReference', SEC_UR, {
    size: 'large',
    multiple: true,
    readOnly: true,
    linkedFormId: FORM_CARGO_ATR,
    embeddedDisplay: 'table',
    spec: 'Cargos do responsável selecionado com pessoa titular e vigência.',
  })

  const pessoasCargos = f(
    'patlasv4proto-uo-pessoas-nos-cargos',
    'Pessoas nos cargos',
    'embeddedReference',
    SEC_UR,
    {
      size: 'large',
      multiple: true,
      readOnly: true,
      linkedFormId: FORM_PESSOA_CARGO,
      embeddedDisplay: 'table',
      spec: 'Pessoas que ocupam os cargos vinculados a esta unidade.',
    },
  )

  if (respIdx >= 0) {
    fields.splice(respIdx + 1, 0, cargos, pessoasCargos)
  } else {
    fields.push(cargos, pessoasCargos)
  }

  const sections = (uo.sections ?? []).map((sec) => {
    if (sec.id === OLD_SEC || sec.id === SEC_UR) {
      return { ...sec, id: SEC_UR, title: 'Responsáveis', icon: 'group' }
    }
    return sec
  })
  if (!sections.some((s) => s.id === SEC_UR)) {
    sections.push({ id: SEC_UR, title: 'Responsáveis', icon: 'group' })
  }

  const presets = (uo.exampleValuePresets ?? []).map((preset) => {
    const fv = { ...(preset.fieldValues ?? {}) }
    delete fv['patlasv4proto-uo-usuario']
    const emb = { ...(preset.embeddedRowsByFieldId ?? {}) }

    if (preset.id === 'patlasv4proto-p-unidade-organizacional-mti') {
      fv['patlasv4proto-uo-responsavel'] = fv['patlasv4proto-uo-responsavel'] ?? 'Lucas Santos'
      emb['patlasv4proto-uo-cargos-atribuidos'] = SAMPLE_CARGOS_LUCAS
      emb['patlasv4proto-uo-pessoas-nos-cargos'] = SAMPLE_PESSOAS_CARGOS_MTI
    }

    return { ...preset, fieldValues: fv, embeddedRowsByFieldId: emb }
  })

  return {
    ...uo,
    metadata: 'Protótipo Atlas — UO. Aba Responsáveis: cargos e pessoas ocupantes.',
    sections,
    fields,
    exampleValuePresets: presets,
  }
}

function upsertForm(forms, formDef) {
  const idx = forms.findIndex((x) => x.id === formDef.id)
  if (idx >= 0) forms[idx] = formDef
  else forms.push(formDef)
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  upsertForm(forms, buildPessoaCargoForm())
  upsertForm(forms, buildCargoAtribuidoForm())

  const idx = forms.findIndex((x) => x.id === FORM_UO)
  if (idx < 0) throw new Error('Cadastro Organizacional não encontrado')
  forms[idx] = patchUoForm(forms[idx])

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('✓ UO — apenas Responsável (sem Usuário)')
  console.log('✓ UO — Pessoas nos cargos: sem Servidor; com região, datas, observação e ativo')
}

main()
