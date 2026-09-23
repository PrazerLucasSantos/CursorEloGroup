#!/usr/bin/env node
/**
 * Pessoas — abas Organização e Documentos; Filiação com nome, tipo e arquivo.
 * Uso: node scripts/patch-atlas-prototipo-pessoas-abas-org.mjs
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
const FORM_FILIACAO = 'form-patlasv4-proto-pessoa-filiacao'

const SEC_ORG = 'sec-patlasv4proto-pes-organizacao'
const SEC_DOCS = 'sec-patlasv4proto-pes-documentos'

const ORG_FIELD_IDS = [
  'patlasv4proto-pes-perfil',
  'patlasv4proto-pes-unidade-negocios',
  'patlasv4proto-pes-departamento',
  'patlasv4proto-pes-organizacao',
  'patlasv4proto-pes-cargo',
  'patlasv4proto-pes-gerente',
]

const formFiliacao = {
  id: FORM_FILIACAO,
  name: 'Pessoa — Filiação',
  sectionLayout: 'none',
  metadata: 'Linha embutida — Filiação da Pessoa.',
  fields: [
    {
      id: 'patlasv4proto-pfil-nome',
      label: 'Nome',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'identity',
      spec: 'Nome completo do familiar ou responsável.',
    },
    {
      id: 'patlasv4proto-pfil-tipo-vinculo',
      label: 'Tipo de vínculo',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'highlight',
      options: ['Pai', 'Mãe', 'Tutor', 'Curador', 'Outro'],
      spec: 'Natureza do vínculo de filiação.',
    },
    {
      id: 'patlasv4proto-pfil-documento',
      label: 'Documento',
      type: 'file',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      spec: 'Arquivo comprobatório do vínculo (certidão, termo de tutela etc.).',
    },
  ],
}

function patchPessoasForm(form) {
  const sections = (form.sections ?? []).filter(
    (s) => s.id !== SEC_ORG && s.id !== SEC_DOCS,
  )

  const geralIdx = sections.findIndex((s) => s.id === 'sec-patlasv4proto-pes-geral')
  const insertAt = geralIdx >= 0 ? geralIdx + 1 : 0
  sections.splice(
    insertAt,
    0,
    { id: SEC_ORG, title: 'Organização', icon: 'corporate_fare' },
    { id: SEC_DOCS, title: 'Documentos', icon: 'folder' },
  )

  const orgSet = new Set(ORG_FIELD_IDS)
  const fields = (form.fields ?? []).filter((field) => field.id !== 'patlasv4proto-pes-carteira')

  if (!fields.some((f) => f.id === 'patlasv4proto-pes-gerente')) {
    fields.push({
      id: 'patlasv4proto-pes-gerente',
      label: 'Gerente',
      type: 'reference',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: SEC_ORG,
      options: ['Lucas Santos', 'João Analista MTI', 'Maria Consultora Parceira', 'Carlos Gestor Cliente'],
      linkedFormId: 'form-patlasv4-proto-pessoa',
      spec: 'Referência a outra Pessoa cadastrada — gestor imediato ou responsável hierárquico.',
    })
  }

  for (const field of fields) {
    if (orgSet.has(field.id)) {
      field.sectionId = SEC_ORG
    }
    if (field.id === 'patlasv4proto-pes-documentos') {
      field.sectionId = SEC_DOCS
    }
    if (field.id === 'patlasv4proto-pes-filiacao') {
      field.sectionId = SEC_DOCS
      field.spec = 'Tabela: Nome, Tipo de vínculo e Documento (arquivo).'
    }
  }

  const orgOrder = [...ORG_FIELD_IDS]
  const otherIds = fields.filter((f) => !orgOrder.includes(f.id)).map((f) => f.id)
  const byId = new Map(fields.map((f) => [f.id, f]))
  const reordered = [
    ...orgOrder.filter((id) => byId.has(id)).map((id) => byId.get(id)),
    ...otherIds.map((id) => byId.get(id)),
  ]

  return {
    ...form,
    metadata:
      'Protótipo Atlas — Pessoas. Aba Organização (perfil, vínculos, cargo); aba Documentos (documentos e filiação).',
    sections,
    fields: reordered,
    fieldVisibilityRules: form.fieldVisibilityRules,
    exampleValuePresets: (form.exampleValuePresets ?? []).map((preset) => {
      const emb = { ...(preset.embeddedRowsByFieldId ?? {}) }
      if (emb['patlasv4proto-pes-filiacao']?.length) {
        emb['patlasv4proto-pes-filiacao'] = emb['patlasv4proto-pes-filiacao'].map((row) => ({
          ...row,
          'patlasv4proto-pfil-tipo-vinculo': row['patlasv4proto-pfil-tipo-vinculo'] ?? 'Pai',
        }))
      }
      return { ...preset, embeddedRowsByFieldId: emb }
    }),
  }
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  const pesIdx = forms.findIndex((f) => f.id === FORM_PESSOAS)
  if (pesIdx < 0) {
    console.error('Formulário Pessoas não encontrado')
    process.exit(1)
  }
  forms[pesIdx] = patchPessoasForm(forms[pesIdx])

  const filIdx = forms.findIndex((f) => f.id === FORM_FILIACAO)
  if (filIdx >= 0) forms[filIdx] = formFiliacao
  else forms.push(formFiliacao)

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  console.log('✓ Pessoas — aba Organização: Perfil, UO, Depto, Organização, Cargo')
  console.log('✓ Pessoas — aba Documentos: Documentos + Filiação')
  console.log('✓ Pessoa — Filiação: Nome, Tipo de vínculo, Documento (arquivo)')
}

main()
