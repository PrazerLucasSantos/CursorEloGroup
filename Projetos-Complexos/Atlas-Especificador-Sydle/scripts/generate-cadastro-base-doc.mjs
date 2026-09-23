#!/usr/bin/env node
/**
 * Gera documentação do grupo Cadastro base em linguagem de cliente.
 * Uso: node scripts/generate-cadastro-base-doc.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const GROUPS_PATH = path.join(EPIC, 'class-groups.json')
const WORKSPACES_PATH = path.join(EPIC, 'workspaces.json')
const OUT_PATH = path.join(__dirname, '../docs/entregaveis/markdown/Atlas_Prototipo_Cadastro_Base.md')

const GROUP_ID = 'grp-patlasv4-proto-cadastro'

const TYPE_PT = {
  text: 'Texto',
  textOptions: 'Lista de opções',
  boolean: 'Sim/Não',
  date: 'Data',
  number: 'Número',
  file: 'Arquivo',
  reference: 'Seleção de outro cadastro',
  embeddedReference: 'Tabela com cadastros vinculados',
}

const CLASS_INTRO = {
  'Cadastro Organizacional':
    'Cadastra empresas, unidades e departamentos (MTI, parceiros, clientes). Define hierarquia, documentos fiscais, contatos e responsáveis. Quando o cadastro é **Empresa** (organização raiz), não aparecem os campos *Unidade pai* e *Nível*; para unidades filhas, esses campos são obrigatórios para posicionar na árvore.',
  Pessoas:
    'Cadastro central de pessoas físicas: identificação, contato, credenciais de acesso, dados complementares e currículo. Serve de base para servidores, responsáveis por unidades e participantes de processos.',
  Cargo:
    'Define os papéis formais na organização (Diretor, Gerente, Analista etc.), a qual organização pertencem, quem os ocupa e quais permissões de processo cada cargo possui.',
  'Versões de Processo':
    'Controla qual conjunto de tipos de processo e ações está valendo no sistema em cada período. Garante que processos antigos mantêm as regras da época em que foram abertos.',
}

function formById(forms, id) {
  return forms.find((f) => f.id === id)
}

function cleanClientText(text) {
  if (!text?.trim()) return ''
  return text
    .replace(/\s*\(RN-[A-Z0-9-]+\)/gi, '')
    .replace(/\s*RN-[A-Z0-9-]+[.,]?\s*/gi, ' ')
    .replace(/\s*Discovery\s+\d+\/\d+\)?\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sectionPath(form, sectionId) {
  if (!sectionId) return 'Geral'
  const sec = form.sections?.find((s) => s.id === sectionId)
  if (!sec) return 'Geral'
  if (sec.parentSectionId) {
    const parent = form.sections.find((s) => s.id === sec.parentSectionId)
    return parent ? `${parent.title} › ${sec.title}` : sec.title
  }
  return sec.title
}

function topTabs(form) {
  return (form.sections ?? []).filter((s) => !s.parentSectionId)
}

function subsections(form, parentId) {
  return (form.sections ?? []).filter((s) => s.parentSectionId === parentId)
}

function ruleToClientText(rule, form) {
  const src = form.fields?.find((f) => f.id === rule.sourceFieldId)
  const srcLabel = src?.label ?? rule.sourceFieldId
  const targets = rule.targetFieldIds
    .map((id) => form.fields?.find((f) => f.id === id)?.label ?? id)
    .join(', ')

  if (rule.sourceKind === 'boolean') {
    const when = rule.expectedBoolean ? 'Sim' : 'Não'
    const action = rule.action === 'hide' ? 'oculta' : 'exibe'
    return `Quando **${srcLabel}** for **${when}**, o sistema **${action}**: ${targets}.`
  }
  if (rule.sourceKind === 'textOptions') {
    const action = rule.action === 'hide' ? 'oculta' : 'exibe'
    return `Quando **${srcLabel}** for **${rule.expectedOptionText}**, o sistema **${action}**: ${targets}.`
  }
  return null
}

function methodLine(m) {
  const extra = m.inputFormId ? ' (abre formulário de confirmação/parâmetros)' : ''
  return `- **${m.name}**${extra}`
}

function fieldLine(f, forms) {
  const tipo = TYPE_PT[f.type] ?? f.type
  const flags = [
    f.required ? 'obrigatório' : null,
    f.multiple ? 'vários valores' : null,
    f.readOnly ? 'somente leitura' : null,
  ].filter(Boolean)
  const flagStr = flags.length ? ` (${flags.join(' · ')})` : ''

  const parts = []
  if (f.type === 'textOptions' && f.options?.length) {
    parts.push(`Opções: ${f.options.join(', ')}.`)
  }
  if ((f.type === 'reference' || f.type === 'embeddedReference') && f.linkedFormId) {
    const linked = formById(forms, f.linkedFormId)
    parts.push(`Referencia o cadastro *${linked?.name ?? 'vinculado'}*.`)
    if (f.type === 'embeddedReference' && f.embeddedDisplay === 'table') {
      parts.push('Aparece em tabela dentro do registro.')
    }
  }
  const spec = cleanClientText(f.spec)
  if (spec) parts.push(spec)

  return `- **${f.label}** — ${tipo}${flagStr}${parts.length ? ' ' + parts.join(' ') : ''}`
}

function renderClassDoc(cls, form, forms) {
  const lines = []
  lines.push(`## ${cls.name}`)
  lines.push('')
  const intro = CLASS_INTRO[cls.name]
  if (intro) {
    lines.push(intro)
    lines.push('')
  }

  lines.push('### Abas da tela')
  lines.push('')
  const tabs = topTabs(form)
  if (!tabs.length) {
    lines.push('Tela em bloco único.')
  } else {
    for (const tab of tabs) {
      const subs = subsections(form, tab.id)
      if (subs.length) {
        lines.push(`**${tab.title}**`)
        for (const sub of subs) lines.push(`- ${sub.title}`)
      } else {
        lines.push(`- **${tab.title}**`)
      }
    }
  }
  lines.push('')

  if (form.methods?.length) {
    lines.push('### Ações na barra superior')
    lines.push('')
    for (const m of form.methods) lines.push(methodLine(m))
    lines.push('')
  }

  lines.push('### Campos por aba')
  lines.push('')

  const bySec = new Map()
  for (const f of form.fields ?? []) {
    if (f.hidden) continue
    const sec = sectionPath(form, f.sectionId)
    if (!bySec.has(sec)) bySec.set(sec, [])
    bySec.get(sec).push(f)
  }

  for (const sec of bySec.keys()) {
    lines.push(`#### ${sec}`)
    lines.push('')
    for (const f of bySec.get(sec)) lines.push(fieldLine(f, forms))
    lines.push('')
  }

  const rules = (form.fieldVisibilityRules ?? []).filter(
    (r) => r.action === 'hide' || r.action === 'show',
  )
  if (rules.length) {
    lines.push('### Regras automáticas de exibição')
    lines.push('')
    for (const r of rules) {
      const t = ruleToClientText(r, form)
      if (t) lines.push(`- ${t}`)
    }
    lines.push('')
  }

  const embeds = (form.fields ?? []).filter((f) => f.type === 'embeddedReference' && !f.hidden)
  if (embeds.length) {
    lines.push('### Listas e tabelas dentro do cadastro')
    lines.push('')
    for (const f of embeds) {
      const linked = formById(forms, f.linkedFormId)
      lines.push(`- **${f.label}** — linhas do tipo *${linked?.name ?? 'vinculado'}*.`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  return lines
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const groups = JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))
  const workspaces = JSON.parse(fs.readFileSync(WORKSPACES_PATH, 'utf8'))

  const formIds = groups.memberOrderByGroup?.[GROUP_ID] ?? []
  const pkg = workspaces
    .flatMap((ws) => ws.packages ?? [])
    .find((p) => p.id === 'pkg-patlasv4-proto-cadastro')

  const lines = []
  lines.push('# Cadastro base — Atlas (protótipo)')
  lines.push('')
  lines.push(
    'Referência das telas do grupo **Cadastro base**: o que cada uma guarda, como está organizada e quais regras o sistema aplica automaticamente.',
  )
  lines.push('')
  lines.push(`*Gerado em ${new Date().toISOString().slice(0, 10)} a partir do protótipo Atlas V4.*`)
  lines.push('')
  lines.push('## O que é o Cadastro base')
  lines.push('')
  lines.push(
    'É o alicerce do Atlas. Antes de abrir uma proposta, contrato ou workflow, o sistema precisa saber **quem** são as pessoas, **onde** atuam na estrutura organizacional, **quais cargos** existem e **como** os processos e assinaturas estão configurados.',
  )
  lines.push('')
  lines.push('**Telas incluídas:**')
  lines.push('')
  formIds.forEach((formId, i) => {
    const form = formById(forms, formId)
    const cls = pkg?.classes?.find((c) => c.linkedFormId === formId)
    lines.push(`${i + 1}. ${cls?.name ?? form?.name ?? formId}`)
  })
  lines.push('')
  lines.push('---')
  lines.push('')

  for (const formId of formIds) {
    const form = formById(forms, formId)
    if (!form) continue
    const cls = pkg?.classes?.find((c) => c.linkedFormId === formId) ?? { name: form.name }
    lines.push(...renderClassDoc(cls, form, forms))
  }

  fs.writeFileSync(OUT_PATH, `${lines.join('\n')}\n`, 'utf8')
  console.log(`✓ Documento gerado: ${OUT_PATH}`)
}

main()
