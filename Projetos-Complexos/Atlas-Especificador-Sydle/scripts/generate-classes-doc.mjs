#!/usr/bin/env node
/**
 * Gera documentação MD das classes Cadastro base, Versões de Processo e Workflow de Assinatura.
 * Uso: node scripts/generate-classes-doc.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-v4-prototipo/forms.json',
)
const WORKSPACES_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-v4-prototipo/workspaces.json',
)
const OUT_PATH = path.join(
  __dirname,
  '../docs/entregaveis/markdown/Atlas_V4_Classes_Cadastro_Processo_Workflow.md',
)

const EXTRA_FORM_IDS = [
  'form-patlasv4-proto-config-processo',
  'mqebasqyphbwea',
  'form-patlasv4-proto-workflow-etapa',
]

function formById(forms, id) {
  return forms.find((f) => f.id === id)
}

function formName(forms, id) {
  return formById(forms, id)?.name ?? id
}

function sectionTitle(form, sectionId) {
  if (!sectionId) return '— (sem aba / layout único)'
  const sec = form.sections?.find((s) => s.id === sectionId)
  if (!sec) return sectionId
  if (sec.parentSectionId) {
    const parent = form.sections.find((s) => s.id === sec.parentSectionId)
    return parent ? `${parent.title} › ${sec.title}` : sec.title
  }
  return sec.title
}

function typeLabel(field) {
  if (field.type === 'reference') return 'referência'
  if (field.type === 'embeddedReference') return 'referência embutida'
  return field.type
}

function fieldRow(field, form, forms) {
  const aba = sectionTitle(form, field.sectionId)
  const obrig = field.required ? 'Sim' : 'Não'
  const mult = field.multiple ? 'Sim' : 'Não'
  let destino = ''
  if (field.type === 'reference' || field.type === 'embeddedReference') {
    destino = field.linkedFormId
      ? ` → **${formName(forms, field.linkedFormId)}** (\`${field.linkedFormId}\`)`
      : ''
    if (field.type === 'embeddedReference' && field.embeddedDisplay) {
      destino += ` · exibição: \`${field.embeddedDisplay}\``
    }
  }
  const hidden = field.hidden ? ' · oculto' : ''
  const idCol = `\`${field.id}\``
  return `| ${field.label ?? '—'} | ${idCol} | ${typeLabel(field)} | ${aba} | ${obrig} | ${mult}${destino}${hidden} |`
}

function renderFormSection(form, forms, opts = {}) {
  const lines = []
  const layout =
    form.sectionLayout === 'tabs'
      ? 'Abas'
      : form.sectionLayout === 'accordion'
        ? 'Acordeão'
        : 'Sem seções (layout único)'

  lines.push(`### ${form.name}`)
  lines.push('')
  lines.push(`| Propriedade | Valor |`)
  lines.push(`| --- | --- |`)
  lines.push(`| **ID do formulário** | \`${form.id}\` |`)
  lines.push(`| **Layout** | ${layout} |`)
  if (form.defaultCanvasMode) lines.push(`| **Modo padrão** | ${form.defaultCanvasMode} |`)
  if (form.metadata) lines.push(`| **Metadados** | ${form.metadata} |`)
  lines.push('')

  if (form.sections?.length) {
    lines.push('#### Abas / seções')
    lines.push('')
    for (const s of form.sections) {
      const parent = s.parentSectionId
        ? form.sections.find((x) => x.id === s.parentSectionId)?.title
        : null
      lines.push(
        parent
          ? `- **${s.title}** (\`${s.id}\`) — subseção de *${parent}*`
          : `- **${s.title}** (\`${s.id}\`${s.icon ? ` · ícone: ${s.icon}` : ''})`,
      )
    }
    lines.push('')
  }

  const visibleFields = (form.fields ?? []).filter((f) => !opts.skipHidden || !f.hidden)
  lines.push('#### Campos')
  lines.push('')
  lines.push('| Label | ID | Tipo | Aba / seção | Obrig. | Múlt. |')
  lines.push('| --- | --- | --- | --- | --- | --- |')
  for (const f of visibleFields) {
    lines.push(fieldRow(f, form, forms))
  }
  lines.push('')

  const refs = (form.fields ?? []).filter((f) => f.type === 'reference')
  const embeds = (form.fields ?? []).filter((f) => f.type === 'embeddedReference')

  if (refs.length) {
    lines.push('#### Campos de referência')
    lines.push('')
    for (const f of refs) {
      lines.push(
        `- **${f.label}** (\`${f.id}\`) → ${formName(forms, f.linkedFormId)} (\`${f.linkedFormId ?? '—'}\`)${f.multiple ? ' · múltiplo' : ''}`,
      )
    }
    lines.push('')
  }

  if (embeds.length) {
    lines.push('#### Campos de referência embutida')
    lines.push('')
    for (const f of embeds) {
      lines.push(
        `- **${f.label}** (\`${f.id}\`) → ${formName(forms, f.linkedFormId)} (\`${f.linkedFormId ?? '—'}\`) · ${f.embeddedDisplay ?? 'form'}${f.multiple ? ' · múltiplo' : ''}${f.embeddedRoot ? ' · raiz embutida' : ''}`,
      )
    }
    lines.push('')
  }

  return lines
}

function collectEmbeddedForms(form, forms, collected = new Set()) {
  for (const f of form.fields ?? []) {
    if (f.type === 'embeddedReference' && f.linkedFormId && !collected.has(f.linkedFormId)) {
      collected.add(f.linkedFormId)
      const child = formById(forms, f.linkedFormId)
      if (child) collectEmbeddedForms(child, forms, collected)
    }
  }
  return collected
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const workspaces = JSON.parse(fs.readFileSync(WORKSPACES_PATH, 'utf8'))
  const ws = workspaces[0]
  const cadastroPkg = ws.packages.find((p) => p.id === 'pkg-patlasv4-proto-cadastro')
  const cadastroClasses = cadastroPkg?.classes ?? []

  const lines = []
  lines.push('# Atlas V4 Protótipo — Classes, campos e abas')
  lines.push('')
  lines.push(
    `Documento gerado automaticamente em ${new Date().toISOString().slice(0, 10)} a partir de \`forms.json\` e \`workspaces.json\` do épico **${ws.name}**.`,
  )
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Índice')
  lines.push('')
  lines.push('1. [Grupo Cadastro base](#1-grupo-cadastro-base)')
  lines.push('2. [Versões de Processo](#2-versões-de-processo)')
  lines.push('3. [Workflow de Assinatura](#3-workflow-de-assinatura)')
  lines.push('4. [Formulários embutidos (linhas)](#4-formulários-embutidos-linhas)')
  lines.push('5. [Resumo — referências e embutidos](#5-resumo--referências-e-embutidos)')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 1. Grupo Cadastro base')
  lines.push('')
  lines.push(`Pacote: **${cadastroPkg?.name}** (\`${cadastroPkg?.id}\`)`)
  lines.push('')

  const allEmbedded = new Set()

  for (const cls of cadastroClasses) {
    const form = formById(forms, cls.linkedFormId)
    if (!form) {
      lines.push(`> ⚠ Classe **${cls.name}**: formulário \`${cls.linkedFormId}\` não encontrado.`)
      lines.push('')
      continue
    }
    lines.push(`## 1.${cadastroClasses.indexOf(cls) + 1} ${cls.name}`)
    lines.push('')
    lines.push(`Classe: \`${cls.id}\` · Formulário: \`${cls.linkedFormId}\``)
    lines.push('')
    lines.push(...renderFormSection(form, forms))
    collectEmbeddedForms(form, forms, allEmbedded).forEach((id) => allEmbedded.add(id))
    lines.push('---')
    lines.push('')
  }

  lines.push('## 2. Versões de Processo')
  lines.push('')
  const configForm = formById(forms, 'form-patlasv4-proto-config-processo')
  if (configForm) {
    lines.push(
      `Classe no workspace: **Configurações do Processo** (\`cls-patlasv4-proto-cfg\`) · Nome do formulário: **${configForm.name}**`,
    )
    lines.push('')
    lines.push(...renderFormSection(configForm, forms))
    const tipoEmbed = configForm.fields?.find((f) => f.type === 'embeddedReference')
    if (tipoEmbed?.linkedFormId) allEmbedded.add(tipoEmbed.linkedFormId)
  }
  lines.push('---')
  lines.push('')

  lines.push('## 3. Workflow de Assinatura')
  lines.push('')
  const wfForm = formById(forms, 'mqebasqyphbwea')
  if (wfForm) {
    lines.push(
      `Formulário: **${wfForm.name}** (\`mqebasqyphbwea\`) — referenciado por Template (campo *Workflow de homologação*) e configuração de fluxos de assinatura.`,
    )
    lines.push('')
    lines.push(...renderFormSection(wfForm, forms))
    collectEmbeddedForms(wfForm, forms, allEmbedded)
  }
  lines.push('---')
  lines.push('')

  lines.push('## 4. Formulários embutidos (linhas)')
  lines.push('')
  lines.push(
    'Formulários usados como linhas em tabelas ou acordeões (`embeddedReference`) pelas classes acima.',
  )
  lines.push('')

  const embeddedSorted = [...allEmbedded].sort((a, b) =>
    formName(forms, a).localeCompare(formName(forms, b), 'pt'),
  )

  for (const fid of embeddedSorted) {
    const ef = formById(forms, fid)
    if (!ef) continue
    lines.push(...renderFormSection(ef, forms, { skipHidden: false }))
    lines.push('---')
    lines.push('')
  }

  lines.push('## 5. Resumo — referências e embutidos')
  lines.push('')
  lines.push('### Cadastro base')
  lines.push('')
  lines.push('| Classe | Referências | Referências embutidas |')
  lines.push('| --- | --- | --- |')

  for (const cls of cadastroClasses) {
    const form = formById(forms, cls.linkedFormId)
    if (!form) continue
    const refs = (form.fields ?? [])
      .filter((f) => f.type === 'reference')
      .map((f) => f.label)
      .join(', ') || '—'
    const emb = (form.fields ?? [])
      .filter((f) => f.type === 'embeddedReference')
      .map((f) => `${f.label} → ${formName(forms, f.linkedFormId)}`)
      .join('; ') || '—'
    lines.push(`| ${cls.name} | ${refs} | ${emb} |`)
  }
  lines.push('')

  lines.push('### Versões de Processo e Workflow de Assinatura')
  lines.push('')
  for (const fid of ['form-patlasv4-proto-config-processo', 'mqebasqyphbwea']) {
    const form = formById(forms, fid)
    if (!form) continue
    const refs = (form.fields ?? [])
      .filter((f) => f.type === 'reference')
      .map((f) => f.label)
      .join(', ') || '—'
    const emb = (form.fields ?? [])
      .filter((f) => f.type === 'embeddedReference')
      .map((f) => `${f.label} → ${formName(forms, f.linkedFormId)}`)
      .join('; ') || '—'
    lines.push(`**${form.name}** (\`${fid}\`)`)
    lines.push(`- Referências: ${refs}`)
    lines.push(`- Embutidos: ${emb}`)
    lines.push('')
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  fs.writeFileSync(OUT_PATH, lines.join('\n'), 'utf8')
  console.log(`✓ Documentação gerada: ${OUT_PATH}`)
}

main()
