#!/usr/bin/env node
/**
 * Reestrutura formulário Pessoas conforme especificação.
 * Uso: node scripts/patch-atlas-prototipo-pessoas-reestrutura.mjs
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

const SEC_GERAL = 'sec-patlasv4proto-pes-geral'
const SEC_PRINCIPAL = 'sec-patlasv4proto-pes-principal'
const SEC_DEMO = 'sec-patlasv4proto-pes-demograficas'
const SEC_CRED_ACesso = 'sec-patlasv4proto-pes-credencial-acesso'
const SEC_CONTATO = 'sec-patlasv4proto-pes-contato'
const SEC_COMP = 'sec-patlasv4proto-pes-complementares'
const SEC_CURR = 'sec-patlasv4proto-pes-curriculo'

const REMOVE_FIELD_IDS = new Set([
  'patlasv4proto-pes-sigadoc-pendente',
  'patlasv4proto-pes-matricula-sigadoc',
  'patlasv4proto-pes-mtid',
  'patlasv4proto-pes-fornecedor',
  'patlasv4proto-pes-transito-julgado',
  'patlasv4proto-pes-tipo-companhia',
  'patlasv4proto-pes-anexos',
  'patlasv4proto-pes-clube-servidor',
])

const UO_OPTS = [
  'Empresa Mato-grossense de Tecnologia da Informação',
  'Unidade de Gestão de Projetos',
  'EloGroup',
  'Secretaria de Estado de Planejamento e Gestão',
]

const CARGO_OPTS = ['Diretor', 'Gerente de Projetos', 'Fiscal de Contrato']

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
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.linkedFormId && type === 'embeddedReference'
      ? { linkedFormId: opts.linkedFormId }
      : {}),
  }
}

function buildPessoasForm(old) {
  const kept = (old.fields ?? []).filter((field) => !REMOVE_FIELD_IDS.has(field.id))

  const byId = new Map(kept.map((field) => [field.id, field]))

  const perfil = f('patlasv4proto-pes-perfil', 'Perfil', 'textOptions', SEC_PRINCIPAL, {
    required: true,
    relevance: 'highlight',
    size: 'small',
    options: ['Cliente', 'Parceiro', 'MTI'],
    spec: 'Classifica a pessoa no ecossistema Atlas (Cliente, Parceiro ou MTI).',
  })

  const unidade = f(
    'patlasv4proto-pes-unidade-organizacional',
    'Unidade organizacional',
    'reference',
    SEC_PRINCIPAL,
    {
      linkedFormId: FORM_UO,
      options: UO_OPTS,
      spec: 'Unidade de lotação ou vínculo principal da pessoa.',
    },
  )

  const cargo = f('patlasv4proto-pes-cargo', 'Cargo', 'reference', SEC_PRINCIPAL, {
    linkedFormId: FORM_CARGO,
    options: CARGO_OPTS,
    spec: 'Cargo funcional associado à pessoa, quando aplicável.',
  })

  const matricula = f('patlasv4proto-pes-matricula', 'Matrícula', 'text', SEC_COMP, {
    size: 'small',
    spec: 'Matrícula funcional ou identificador interno.',
  })

  if (byId.has('patlasv4proto-pes-ativo-acesso')) {
    const ativo = byId.get('patlasv4proto-pes-ativo-acesso')
    ativo.label = 'Acesso'
    ativo.sectionId = SEC_CRED_ACesso
    ativo.spec = 'Indica se a pessoa possui acesso ativo ao sistema.'
  }
  if (byId.has('patlasv4proto-pes-login')) {
    byId.get('patlasv4proto-pes-login').sectionId = SEC_CRED_ACesso
  }
  if (byId.has('patlasv4proto-pes-senha')) {
    byId.get('patlasv4proto-pes-senha').sectionId = SEC_CRED_ACesso
  }

  if (!byId.has('patlasv4proto-pes-matricula')) {
    byId.set('patlasv4proto-pes-matricula', matricula)
  }
  byId.set('patlasv4proto-pes-perfil', perfil)
  byId.set('patlasv4proto-pes-unidade-organizacional', unidade)
  byId.set('patlasv4proto-pes-cargo', cargo)

  const order = [
    'patlasv4proto-pes-perfil',
    'patlasv4proto-pes-unidade-organizacional',
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
    for (const rid of REMOVE_FIELD_IDS) delete fv[rid]

    if (preset.id === 'patlasv4proto-p-pessoa-lucas') {
      fv['patlasv4proto-pes-perfil'] = 'MTI'
      fv['patlasv4proto-pes-unidade-organizacional'] =
        'Empresa Mato-grossense de Tecnologia da Informação'
      fv['patlasv4proto-pes-cargo'] = 'Gerente de Projetos'
      fv['patlasv4proto-pes-matricula'] = 'MTI-001'
      fv['patlasv4proto-pes-codigo-ext'] = 'EXT-LUCAS'
    }
    if (preset.id === 'patlasv4proto-p-pessoa-mti') {
      fv['patlasv4proto-pes-perfil'] = 'MTI'
      fv['patlasv4proto-pes-unidade-organizacional'] =
        'Empresa Mato-grossense de Tecnologia da Informação'
      fv['patlasv4proto-pes-matricula'] = 'MTI-002'
    }
    if (preset.id === 'patlasv4proto-p-pessoa-parceiro') {
      fv['patlasv4proto-pes-perfil'] = 'Parceiro'
      fv['patlasv4proto-pes-unidade-organizacional'] = 'EloGroup'
      fv['patlasv4proto-pes-cargo'] = 'Gerente de Projetos'
    }

    return { ...preset, fieldValues: fv }
  })

  return {
    ...old,
    name: 'Pessoas',
    metadata:
      'Protótipo Atlas — Pessoas. Perfil (Cliente/Parceiro/MTI), vínculo UO/Cargo, credencial de acesso em aba dedicada.',
    sections: [
      { id: SEC_GERAL, title: 'Geral', icon: 'person' },
      { id: SEC_PRINCIPAL, title: 'Principal', icon: 'badge', parentSectionId: SEC_GERAL },
      {
        id: SEC_DEMO,
        title: 'Informações demográficas',
        icon: 'diversity_3',
        parentSectionId: SEC_GERAL,
      },
      {
        id: SEC_CRED_ACesso,
        title: 'Credencial para acesso',
        icon: 'vpn_key',
      },
      { id: SEC_CONTATO, title: 'Dados de contato', icon: 'mail' },
      { id: SEC_COMP, title: 'Complementares', icon: 'info' },
      { id: SEC_CURR, title: 'Currículo', icon: 'school' },
    ],
    fields,
    exampleValuePresets: presets,
    activeExamplePresetId: old.activeExamplePresetId ?? 'patlasv4proto-p-pessoa-lucas',
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

  console.log('✓ Pessoas — Perfil, UO e Cargo acima de Nome')
  console.log('✓ Pessoas — aba Credencial para acesso (Acesso, Login, Senha)')
  console.log('✓ Pessoas — subaba Credenciais removida')
  console.log('✓ Pessoas — Complementares: Matrícula e Código externo; campos Sigadoc/fornecedor removidos')
}

main()
