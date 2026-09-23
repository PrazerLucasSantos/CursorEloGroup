#!/usr/bin/env node
/**
 * Pessoas — aba Geral (Principal, Documentos, Filiação, Demográficas, Credenciais)
 * e aba Complementares conforme telas de referência.
 * Uso: node scripts/patch-atlas-prototipo-pessoas-geral-complementares.mjs
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
const FORM_DOC = 'form-patlasv4-proto-pessoa-documento'
const FORM_FIL = 'form-patlasv4-proto-pessoa-filiacao'
const FORM_BANCO = 'form-patlasv4-proto-pessoa-dados-bancarios'

const SEC_GERAL = 'sec-patlasv4proto-pes-geral'
const SEC_PRINCIPAL = 'sec-patlasv4proto-pes-principal'
const SEC_DOCS_SUB = 'sec-patlasv4proto-pes-documentos-sub'
const SEC_FIL_SUB = 'sec-patlasv4proto-pes-filiacao-sub'
const SEC_DEMO = 'sec-patlasv4proto-pes-demograficas'
const SEC_CRED_SUB = 'sec-patlasv4proto-pes-credenciais'
const SEC_CONTATO = 'sec-patlasv4proto-pes-contato'
const SEC_COMP = 'sec-patlasv4proto-pes-complementares'

const REMOVE_FIELD_IDS = new Set([
  'patlasv4proto-pes-perfil',
  'patlasv4proto-pes-unidade-negocios',
  'patlasv4proto-pes-departamento',
  'patlasv4proto-pes-organizacao',
  'patlasv4proto-pes-cargo',
  'patlasv4proto-pes-gerente',
  'patlasv4proto-pes-login',
  'patlasv4proto-pes-senha',
])

const REMOVE_SECTION_IDS = new Set([
  'sec-patlasv4proto-pes-organizacao',
  'sec-patlasv4proto-pes-credencial-acesso',
])

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
    ...(opts.spec !== undefined ? { spec: opts.spec } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
  }
}

function buildDocumentoForm() {
  return {
    id: FORM_DOC,
    name: 'Pessoa — Documento',
    sectionLayout: 'none',
    metadata: 'Linha embutida — documento de identificação (Tipo, Número, Arquivo).',
    fields: [
      f('patlasv4proto-pdoc-tipo', 'Tipo', 'textOptions', null, {
        required: true,
        relevance: 'highlight',
        options: ['CPF', 'RG', 'CNH', 'Passaporte', 'CTPS', 'Outro'],
      }),
      f('patlasv4proto-pdoc-numero', 'Número', 'text', null, {
        required: true,
        relevance: 'identity',
      }),
      f('patlasv4proto-pdoc-campos-adicionais', 'Campos adicionais', 'text', null, {
        spec: 'Informações complementares do documento (ex.: órgão emissor do RG).',
      }),
      f('patlasv4proto-pdoc-arquivo', 'Arquivo', 'file', null, {}),
    ],
  }
}

function complementaresFields() {
  return [
    f(
      'patlasv4proto-pes-sigadoc-pendente',
      'Possui documento pendente de criação no Sigadoc?',
      'boolean',
      SEC_COMP,
      { size: 'small' },
    ),
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
    f('patlasv4proto-pes-tipo-companhia', 'Tipo de companhia', 'textOptions', SEC_COMP, {
      options: ['Matriz', 'Filial'],
    }),
    f('patlasv4proto-pes-anexos', 'Anexos', 'file', SEC_COMP, { size: 'medium' }),
    f('patlasv4proto-pes-clube-servidor', 'Clube do servidor', 'text', SEC_COMP, {}),
    f('patlasv4proto-pes-dados-banc', 'Dados bancários', 'embeddedReference', SEC_COMP, {
      size: 'large',
      linkedFormId: FORM_BANCO,
      embeddedDisplay: 'table',
    }),
    f('patlasv4proto-pes-tags', 'Tags', 'textOptions', SEC_COMP, {
      options: ['Colaborador', 'Terceirizado', 'Estagiário', 'Prestador'],
      spec: 'Classificação livre da pessoa.',
    }),
    f('patlasv4proto-pes-matricula-sigadoc', 'Matrícula no Sigadoc', 'text', SEC_COMP, {
      size: 'small',
    }),
    f('patlasv4proto-pes-mtid', 'MT ID', 'text', SEC_COMP, { size: 'small' }),
    f(
      'patlasv4proto-pes-transito-julgado',
      'Data do último trânsito em julgado',
      'date',
      SEC_COMP,
      {},
    ),
    f('patlasv4proto-pes-codigo-ext', 'Código externo', 'text', SEC_COMP, {}),
    f('patlasv4proto-pes-matricula', 'Matrícula', 'text', SEC_COMP, {
      size: 'small',
      spec: 'Matrícula funcional ou identificador interno.',
    }),
  ]
}

const FIELD_ORDER = [
  // Geral > Principal
  'patlasv4proto-pes-nome',
  'patlasv4proto-pes-outros-nomes',
  'patlasv4proto-pes-foto',
  'patlasv4proto-pes-carteira',
  'patlasv4proto-pes-nasc',
  'patlasv4proto-pes-falecido',
  // Geral > Documentos / Filiação
  'patlasv4proto-pes-documentos',
  'patlasv4proto-pes-filiacao',
  // Geral > Demográficas
  'patlasv4proto-pes-sexo',
  'patlasv4proto-pes-genero',
  'patlasv4proto-pes-deficiencias',
  'patlasv4proto-pes-pais-nasc',
  'patlasv4proto-pes-nacionalidade',
  'patlasv4proto-pes-naturalidade',
  'patlasv4proto-pes-estado-civil',
  'patlasv4proto-pes-cor-raca',
  // Geral > Credenciais
  'patlasv4proto-pes-ativo-acesso',
  // Contato
  'patlasv4proto-pes-telefones',
  'patlasv4proto-pes-emails',
  'patlasv4proto-pes-email-principal',
  'patlasv4proto-pes-enderecos',
  'patlasv4proto-pes-redes',
  // Complementares
  'patlasv4proto-pes-sigadoc-pendente',
  'patlasv4proto-pes-aceite-email',
  'patlasv4proto-pes-aceite-sms',
  'patlasv4proto-pes-aceite-whatsapp',
  'patlasv4proto-pes-fornecedor',
  'patlasv4proto-pes-tipo-companhia',
  'patlasv4proto-pes-anexos',
  'patlasv4proto-pes-clube-servidor',
  'patlasv4proto-pes-dados-banc',
  'patlasv4proto-pes-tags',
  'patlasv4proto-pes-matricula-sigadoc',
  'patlasv4proto-pes-mtid',
  'patlasv4proto-pes-transito-julgado',
  'patlasv4proto-pes-codigo-ext',
  'patlasv4proto-pes-matricula',
]

function patchPessoasForm(old) {
  const byId = new Map(
    (old.fields ?? [])
      .filter((field) => !REMOVE_FIELD_IDS.has(field.id))
      .map((field) => [field.id, field]),
  )

  const sections = [
    { id: SEC_GERAL, title: 'Geral', icon: 'person' },
    { id: SEC_PRINCIPAL, title: 'Principal', icon: 'badge', parentSectionId: SEC_GERAL },
    { id: SEC_DOCS_SUB, title: 'Documentos', icon: 'folder', parentSectionId: SEC_GERAL },
    { id: SEC_FIL_SUB, title: 'Filiação', icon: 'family_restroom', parentSectionId: SEC_GERAL },
    { id: SEC_DEMO, title: 'Informações demográficas', icon: 'diversity_3', parentSectionId: SEC_GERAL },
    { id: SEC_CRED_SUB, title: 'Credenciais', icon: 'verified_user', parentSectionId: SEC_GERAL },
    { id: SEC_CONTATO, title: 'Dados de contato', icon: 'mail' },
    { id: SEC_COMP, title: 'Complementares', icon: 'info' },
  ]

  byId.set(
    'patlasv4proto-pes-carteira',
    f('patlasv4proto-pes-carteira', 'Carteira', 'textOptions', SEC_PRINCIPAL, {
      options: ['Padrão', 'Servidor', 'Terceirizado', 'Parceiro'],
      spec: 'Carteira ou classificação cadastral da pessoa.',
    }),
  )

  const principalIds = [
    'patlasv4proto-pes-nome',
    'patlasv4proto-pes-outros-nomes',
    'patlasv4proto-pes-foto',
    'patlasv4proto-pes-carteira',
    'patlasv4proto-pes-nasc',
    'patlasv4proto-pes-falecido',
  ]
  for (const id of principalIds) {
    const field = byId.get(id)
    if (field) field.sectionId = SEC_PRINCIPAL
  }

  const doc = byId.get('patlasv4proto-pes-documentos')
  if (doc) {
    doc.sectionId = SEC_DOCS_SUB
    doc.spec = 'Tabela: Tipo, Número, Campos adicionais e Arquivo.'
  }

  const fil = byId.get('patlasv4proto-pes-filiacao')
  if (fil) {
    fil.sectionId = SEC_FIL_SUB
    fil.spec = 'Tabela: Nome, Tipo de vínculo e Documento (arquivo).'
  }

  const demoUpdates = {
    'patlasv4proto-pes-deficiencias': {
      type: 'textOptions',
      options: ['Nenhuma', 'Visual', 'Auditiva', 'Física', 'Intelectual', 'Múltipla'],
    },
    'patlasv4proto-pes-pais-nasc': {
      type: 'textOptions',
      options: ['Brasil', 'Argentina', 'Paraguai', 'Bolívia', 'Outro'],
    },
    'patlasv4proto-pes-nacionalidade': {
      type: 'textOptions',
      options: ['Brasil', 'Argentina', 'Paraguai', 'Bolívia', 'Outro'],
    },
    'patlasv4proto-pes-naturalidade': {
      type: 'textOptions',
      options: ['Cuiabá/MT', 'Várzea Grande/MT', 'Brasília/DF', 'São Paulo/SP', 'Outro'],
    },
    'patlasv4proto-pes-estado-civil': {
      type: 'textOptions',
      options: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'],
    },
  }
  for (const [id, patch] of Object.entries(demoUpdates)) {
    const field = byId.get(id)
    if (!field) continue
    field.sectionId = SEC_DEMO
    Object.assign(field, patch)
  }
  for (const id of ['patlasv4proto-pes-sexo', 'patlasv4proto-pes-genero', 'patlasv4proto-pes-cor-raca']) {
    const field = byId.get(id)
    if (field) field.sectionId = SEC_DEMO
  }

  const ativo = byId.get('patlasv4proto-pes-ativo-acesso')
  if (ativo) {
    ativo.label = 'Ativo para acesso'
    ativo.sectionId = SEC_CRED_SUB
    ativo.spec = 'Indica se a pessoa possui credencial ativa para acesso ao sistema.'
  }

  for (const field of complementaresFields()) {
    byId.set(field.id, field)
  }

  const fields = FIELD_ORDER.filter((id) => byId.has(id)).map((id) => byId.get(id))
  for (const field of byId.values()) {
    if (!fields.some((x) => x.id === field.id)) fields.push(field)
  }

  const presets = (old.exampleValuePresets ?? []).map((preset) => {
    const fv = { ...(preset.fieldValues ?? {}) }
    for (const id of REMOVE_FIELD_IDS) delete fv[id]
    if (fv['patlasv4proto-pes-fornecedor'] === undefined) {
      fv['patlasv4proto-pes-fornecedor'] = 'Não'
    }
    return { ...preset, fieldValues: fv }
  })

  if (!presets.some((p) => p.id === 'patlasv4proto-p-pessoa-bernardo')) {
    presets.unshift({
      id: 'patlasv4proto-p-pessoa-bernardo',
      name: 'Bernardo Alves Bicalho Vorges',
      iconColor: '#334155',
      fieldValues: {
        'patlasv4proto-pes-nome': 'Bernardo Alves Bicalho Vorges',
        'patlasv4proto-pes-nasc': '30/07/2005',
        'patlasv4proto-pes-falecido': false,
        'patlasv4proto-pes-sexo': 'Masculino',
        'patlasv4proto-pes-pais-nasc': 'Brasil',
        'patlasv4proto-pes-nacionalidade': 'Brasil',
        'patlasv4proto-pes-ativo-acesso': false,
        'patlasv4proto-pes-fornecedor': 'Não',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-pes-documentos': [
          {
            'patlasv4proto-pdoc-tipo': 'CPF',
            'patlasv4proto-pdoc-numero': '159.740.746-10',
          },
          {
            'patlasv4proto-pdoc-tipo': 'RG',
            'patlasv4proto-pdoc-numero': '20062855',
          },
        ],
      },
    })
  }

  return {
    ...old,
    metadata:
      'Protótipo Atlas — Pessoas. Abas: Geral (Principal, Documentos, Filiação, Demográficas, Credenciais), Dados de contato e Complementares.',
    sections,
    fields,
    exampleValuePresets: presets,
    activeExamplePresetId: presets[0]?.id ?? old.activeExamplePresetId,
    fieldVisibilityRules: (old.fieldVisibilityRules ?? []).filter(
      (rule) =>
        !REMOVE_FIELD_IDS.has(rule.sourceFieldId) &&
        !(rule.targetFieldIds ?? []).some((id) => REMOVE_FIELD_IDS.has(id)),
    ),
    methods: old.methods,
  }
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  const docIdx = forms.findIndex((x) => x.id === FORM_DOC)
  if (docIdx >= 0) forms[docIdx] = buildDocumentoForm()
  else forms.push(buildDocumentoForm())

  const pesIdx = forms.findIndex((x) => x.id === FORM)
  if (pesIdx < 0) {
    console.error('Formulário Pessoas não encontrado')
    process.exit(1)
  }
  forms[pesIdx] = patchPessoasForm(forms[pesIdx])

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('✓ Pessoas — abas Organização e Credencial para acesso removidas')
  console.log('✓ Pessoa — Documento: Tipo (CPF/RG), Número, Campos adicionais, Arquivo')
}

main()
