#!/usr/bin/env node
/**
 * Pessoa — métodos Criar, Editar, Desligar, Inativar acesso; remove Cadastrar Pessoa.
 * Uso: node scripts/patch-atlas-prototipo-pessoa-metodos.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const CLASS_GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')

const FORM_PESSOA = 'form-patlasv4-proto-pessoa'
const FORM_METODO_CRIAR = 'form-patlasv4-proto-metodo-criar-pessoa'
const FORM_METODO_DESLIGAR = 'form-patlasv4-proto-metodo-desligar-pessoa'
const FORM_METODO_INATIVAR = 'form-patlasv4-proto-metodo-inativar-acesso-pessoa'

const METH_CRIAR = 'patlasv4proto-pes-meth-criar'
const METH_EDITAR = 'patlasv4proto-pes-meth-editar'
const METH_DESLIGAR = 'patlasv4proto-pes-meth-desligar'
const METH_INATIVAR = 'patlasv4proto-pes-meth-inativar-acesso'
const METH_CRIAR_SERVIDOR = 'patlasv4proto-pes-meth-criar-servidor'
const LEGACY_CADASTRAR = 'mqb1njq08yddoq'

function f(id, label, type, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    sectionId: null,
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
  }
}

function buildMetodoCriarForm() {
  return {
    id: FORM_METODO_CRIAR,
    name: 'Parâmetro de método: Criar pessoa',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'Formulário de entrada do método Criar na classe Pessoas.',
    fields: [
      f('patlasv4proto-pcm-nome', 'Nome', 'text', {
        size: 'large',
        required: true,
        relevance: 'identity',
        spec: 'Nome completo da pessoa.',
      }),
      f('patlasv4proto-pcm-cpf', 'CPF', 'text', {
        size: 'large',
        required: true,
        spec: 'Documento principal — validação de unicidade no cadastro.',
      }),
      f('patlasv4proto-pcm-carteira', 'Carteira', 'textOptions', {
        options: ['Padrão', 'Servidor', 'Terceirizado', 'Parceiro'],
      }),
      f('patlasv4proto-pcm-ativo-acesso', 'Ativo para acesso', 'boolean', {
        required: true,
        spec: 'Define se a pessoa terá credenciais de acesso ao sistema.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-metodo-criar-pessoa',
        name: 'Nova pessoa',
        iconColor: '#0c4a6e',
        fieldValues: {
          'patlasv4proto-pcm-carteira': 'Padrão',
          'patlasv4proto-pcm-ativo-acesso': false,
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-metodo-criar-pessoa',
  }
}

function buildMetodoDesligarForm() {
  return {
    id: FORM_METODO_DESLIGAR,
    name: 'Parâmetro de método: Desligar pessoa',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'Formulário de entrada do método Desligar na classe Pessoas.',
    fields: [
      f('patlasv4proto-pdm-data', 'Data do desligamento', 'date', {
        required: true,
        relevance: 'highlight',
      }),
      f('patlasv4proto-pdm-motivo', 'Motivo', 'textOptions', {
        required: true,
        options: [
          'Demissão',
          'Aposentadoria',
          'Falecimento',
          'Término de contrato',
          'Transferência',
          'Outro',
        ],
      }),
      f('patlasv4proto-pdm-obs', 'Observação', 'text', {
        size: 'large',
        spec: 'Complemento registrado no histórico da pessoa.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-metodo-desligar-pessoa',
        name: 'Desligamento',
        iconColor: '#7f1d1d',
        fieldValues: {
          'patlasv4proto-pdm-motivo': 'Término de contrato',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-metodo-desligar-pessoa',
  }
}

function buildMetodoInativarAcessoForm() {
  return {
    id: FORM_METODO_INATIVAR,
    name: 'Parâmetro de método: Inativar acesso',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'Formulário de entrada do método Inativar acesso na classe Pessoas.',
    fields: [
      f('patlasv4proto-piam-data', 'Data efetiva', 'date', {
        required: true,
        relevance: 'highlight',
      }),
      f('patlasv4proto-piam-motivo', 'Motivo', 'text', {
        size: 'large',
        required: true,
        spec: 'Justificativa da inativação das credenciais de acesso.',
      }),
      f('patlasv4proto-piam-confirmar', 'Confirmar inativação', 'boolean', {
        required: true,
        spec: 'Confirma a revogação do acesso (Ativo para acesso = Não).',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-metodo-inativar-acesso',
        name: 'Inativar acesso',
        iconColor: '#92400e',
        fieldValues: {
          'patlasv4proto-piam-confirmar': true,
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-metodo-inativar-acesso',
  }
}

function buildPessoaMethods(existing = []) {
  const criarServidor = existing.find((m) => m.id === METH_CRIAR_SERVIDOR)
  const methods = [
    {
      id: METH_CRIAR,
      name: 'Criar',
      icon: 'person_add',
      kind: 'destaque',
      inputFormId: FORM_METODO_CRIAR,
    },
    {
      id: METH_EDITAR,
      name: 'Editar',
      icon: 'edit',
      kind: 'destaque',
    },
    {
      id: METH_DESLIGAR,
      name: 'Desligar',
      icon: 'person_off',
      kind: 'destaque',
      inputFormId: FORM_METODO_DESLIGAR,
    },
    {
      id: METH_INATIVAR,
      name: 'Inativar acesso',
      icon: 'no_accounts',
      kind: 'destaque',
      inputFormId: FORM_METODO_INATIVAR,
    },
  ]
  if (criarServidor) methods.push(criarServidor)
  return methods
}

function upsertForm(forms, formDef) {
  const idx = forms.findIndex((x) => x.id === formDef.id)
  if (idx >= 0) forms[idx] = { ...forms[idx], ...formDef }
  else forms.push(formDef)
}

function patchClassGroups(classGroups, formIds) {
  const semGrupo = classGroups.memberOrderByGroup?.__sem_grupo__ ?? []
  for (const formId of formIds) {
    if (!semGrupo.includes(formId)) semGrupo.push(formId)
  }
  classGroups.memberOrderByGroup = {
    ...classGroups.memberOrderByGroup,
    __sem_grupo__: semGrupo,
  }
  return classGroups
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const pIdx = forms.findIndex((x) => x.id === FORM_PESSOA)
  if (pIdx < 0) throw new Error('Formulário Pessoa não encontrado')

  const pessoa = forms[pIdx]
  forms[pIdx] = {
    ...pessoa,
    metadata:
      'Protótipo Atlas — Pessoas. Abas Geral, Dados de contato, Complementares e Currículo. Métodos: Criar, Editar, Desligar, Inativar acesso, Criar servidor.',
    methods: buildPessoaMethods(pessoa.methods ?? []).filter((m) => m.id !== LEGACY_CADASTRAR),
  }

  const metodoForms = [
    buildMetodoCriarForm(),
    buildMetodoDesligarForm(),
    buildMetodoInativarAcessoForm(),
  ]
  for (const formDef of metodoForms) upsertForm(forms, formDef)

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  const classGroups = patchClassGroups(
    JSON.parse(fs.readFileSync(CLASS_GROUPS_PATH, 'utf8')),
    metodoForms.map((x) => x.id),
  )
  fs.writeFileSync(CLASS_GROUPS_PATH, `${JSON.stringify(classGroups, null, 2)}\n`, 'utf8')

  console.log('✓ Pessoa — removido método Cadastrar Pessoa')
  console.log('✓ Pessoa — métodos: Criar, Editar, Desligar, Inativar acesso (+ Criar servidor)')
  console.log('✓ Formulários de parâmetro: criar, desligar, inativar acesso')
}

main()
