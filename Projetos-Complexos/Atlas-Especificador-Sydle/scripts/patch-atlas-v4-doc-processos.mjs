#!/usr/bin/env node
/**
 * Aplica telas Documentos e Templates + Processos do DOCX ao épico atlas-v4-prototipo.
 * Preserva todos os demais formulários (incl. classes criadas no localhost).
 *
 * Fonte: data/.../source/Atlas_Telas_Documentos_Templates_Processos.txt
 * Uso:   node scripts/patch-atlas-v4-doc-processos.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-v4-prototipo')
const sourceTxt = path.join(epicDir, 'source/Atlas_Telas_Documentos_Templates_Processos.txt')
const formsPath = path.join(epicDir, 'forms.json')
const classGroupsPath = path.join(epicDir, 'class-groups.json')
const workspacesPath = path.join(epicDir, 'workspaces.json')

const FORM_DOC = 'form-patlasv4-proto-documentos-templates'
const FORM_PROC = 'form-patlasv4-proto-processos'
const OLD_OPERACAO = 'form-patlasv4-proto-operacao'

const REF_FORMS = {
  'tipo de processo': 'mqb5ag1k51kz2u',
  'tela tipo de processo': 'mqb5ag1k51kz2u',
  'organização': 'form-patlasv4-proto-organizacao',
  'organização cliente': 'form-patlasv4-proto-organizacao',
  'organização parceiro': 'form-patlasv4-proto-organizacao',
  'tela organização': 'form-patlasv4-proto-organizacao',
  'unidade organizacional': 'form-patlasv4-proto-unidade-organizacional',
  'pessoa': 'form-patlasv4-proto-pessoa',
  'servidor': 'form-patlasv4-proto-servidor',
  'cargo': 'form-patlasv4-proto-cargo',
  'processo': FORM_PROC,
  'tela processos': FORM_PROC,
  'configurações do processo': 'form-patlasv4-proto-config-processo',
  'documentos e templates': FORM_DOC,
  'documentos/templates': FORM_DOC,
}

function slug(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseDocument(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim())
  const telas = []
  let tela = null
  let aba = null
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('Tela:')) {
      tela = { name: line.slice(5).trim(), detail: '', abas: [] }
      telas.push(tela)
      aba = null
      i++
      continue
    }
    if (line.startsWith('Detalhamento:') && tela && !aba) {
      tela.detail = line.slice('Detalhamento:'.length).trim()
      i++
      continue
    }
    if (line.startsWith('Aba:')) {
      aba = { name: line.slice(4).trim(), detail: '', fields: [] }
      tela.abas.push(aba)
      i++
      continue
    }
    if (line.startsWith('Detalhamento:') && aba) {
      aba.detail = line.slice('Detalhamento:'.length).trim()
      i++
      continue
    }
    if (line === 'Campo' && aba) {
      i++
      while (i < lines.length) {
        const peek = lines[i]
        if (!peek || peek.startsWith('Aba:') || peek.startsWith('Tela:')) break
        if (peek === 'Campo') {
          i++
          continue
        }
        const name = peek
        const tipo = lines[i + 1] ?? ''
        const obr = lines[i + 2] ?? ''
        const origem = lines[i + 3] ?? ''
        const serve = lines[i + 4] ?? ''
        if (
          ['Tipo', 'Obrigatório', 'De onde vem', 'Para que serve'].includes(name) ||
          !tipo ||
          ['Tipo', 'Obrigatório'].includes(tipo)
        ) {
          i++
          continue
        }
        aba.fields.push({ name, tipo, obr, origem, serve })
        i += 5
      }
      continue
    }
    i++
  }
  return telas
}

function mapFieldType(tipo) {
  const t = tipo.toLowerCase()
  if (t.includes('booleano')) return 'boolean'
  if (t.includes('número') || t.includes('numero')) return 'number'
  if (t.includes('moeda')) return 'number'
  if (t.includes('data/hora') || t === 'data') return 'date'
  if (t.includes('arquivo') || t.includes('jpeg') || t.includes('png')) return 'file'
  if (t.includes('lista') && !t.includes('referência') && !t.includes('referencia')) return 'textOptions'
  if (t.includes('referência') || t.includes('referencia')) return 'reference'
  if (t.includes('texto longo') || t.includes('editor') || t.includes('json')) return 'textLong'
  return 'text'
}

function resolveLinkedForm(label, origem) {
  const hay = `${label} ${origem}`.toLowerCase()
  for (const [key, formId] of Object.entries(REF_FORMS)) {
    if (hay.includes(key)) return formId
  }
  return undefined
}

function mapRequired(obr) {
  const o = obr.toLowerCase()
  if (o === 'sim') return true
  return false
}

function buildSpec(field) {
  const parts = []
  if (field.serve) parts.push(field.serve)
  if (field.origem) parts.push(`Origem: ${field.origem}.`)
  const o = field.obr.toLowerCase()
  if (o === 'condicional') parts.push('Obrigatoriedade: condicional.')
  if (o === 'pendente') parts.push('Obrigatoriedade: pendente de validação.')
  return parts.join(' ')
}

function inferOptions(label, tipo) {
  const l = label.toLowerCase()
  if (l.includes('status')) {
    if (l.includes('assinatura')) return ['Pendente', 'Assinado', 'Recusado', 'Cancelado']
    if (l.includes('processo')) return ['Em elaboração', 'Em assinatura', 'Recusado', 'Aprovado', 'Concluído']
    if (l.includes('proposta')) return ['Em edição', 'Em aprovação', 'Recusada', 'Aprovada']
    if (l.includes('contrato')) return ['Em finalização', 'Cadastrado', 'Ativo']
    if (l.includes('demanda')) return ['Aberta', 'Em análise', 'Convertida', 'Cancelada']
    if (l.includes('integração')) return ['Pendente', 'Enviado', 'Sucesso', 'Erro']
    if (l.includes('homologação')) return ['Pendente', 'Aprovada', 'Recusada']
    if (l.includes('raer')) return ['Pendente', 'Gerado', 'Enviado', 'Concluído']
    if (l.includes('handover')) return ['Pendente', 'Entregue', 'Aprovado']
    if (l.includes('os')) return ['Aberta', 'Enviada', 'Em execução', 'Concluída']
    if (l.includes('item')) return ['Selecionado', 'Aprovado', 'Contratado', 'Em execução']
    if (l.includes('documento')) return ['Gerado', 'Em assinatura', 'Assinado', 'Recusado', 'Cancelado']
    return ['Pendente', 'Em andamento', 'Concluído']
  }
  if (l.includes('condição no cargo')) return ['Titular', 'Substituto', 'Suplente']
  if (l.includes('tipo de bloco')) return ['Texto', 'Produto', 'Cláusula', 'Assinatura', 'Tabela', 'Anexo']
  if (l.includes('tipo de direcionamento')) return ['Por Cargo', 'Por Unidade', 'Por Pessoa']
  if (l.includes('ação') && (l.includes('disponível') || l.includes('esperada'))) {
    return ['Aprovar', 'Recusar', 'Assinar']
  }
  if (l.includes('origem da demanda')) return ['Cliente', 'DIRC', 'MTI']
  if (l.includes('sistema de destino')) return ['Protheus', 'ServiceNow/SNOW', 'Outro']
  if (l.includes('tipo de registro')) return ['Contrato', 'OS', 'Demanda', 'Publicação', 'Entrega']
  if (l.includes('meio de assinatura')) return ['MT Login', 'Gov.br', 'Certificado', 'Upload externo']
  if (l.includes('região')) {
    return ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
  }
  if (tipo.toLowerCase().includes('lista')) return ['Opção 1', 'Opção 2']
  return undefined
}

function buildFormFromTela(tela, formId, prefix) {
  const sections = tela.abas.map((aba) => ({
    id: `sec-${prefix}-${slug(aba.name)}`,
    title: aba.name,
    icon: 'folder',
  }))

  const fields = []
  for (const aba of tela.abas) {
    const sectionId = `sec-${prefix}-${slug(aba.name)}`
    for (const f of aba.fields) {
      const mapped = mapFieldType(f.tipo)
      const fieldId = `patlasv4proto-${prefix}-${slug(aba.name)}-${slug(f.name)}`
      const isAuto =
        f.tipo.toLowerCase().includes('automático') ||
        f.tipo.toLowerCase().includes('automatico') ||
        f.tipo.toLowerCase().includes('derivado') ||
        f.tipo.toLowerCase().includes('snapshot') ||
        f.tipo.toLowerCase().includes('calculada')
      const isIdentity =
        f.name.toLowerCase().includes('nome') ||
        f.name.toLowerCase().includes('identificador') ||
        f.name.toLowerCase().includes('número do') ||
        f.name.toLowerCase().includes('numero do')

      const field = {
        id: fieldId,
        label: f.name,
        type: mapped === 'textLong' ? 'text' : mapped,
        size: mapped === 'boolean' || mapped === 'number' ? 'small' : 'medium',
        readOnly: isAuto,
        required: mapRequired(f.obr),
        multiple: f.tipo.toLowerCase().includes('lista') && f.tipo.toLowerCase().includes('arquivo'),
        relevance: isIdentity ? 'identity' : 'common',
        sectionId,
        spec: buildSpec(f),
      }

      if (mapped === 'textLong') field.textLong = true
      if (mapped === 'number' && f.tipo.toLowerCase().includes('moeda')) field.currency = true
      if (mapped === 'textOptions') {
        field.options = inferOptions(f.name, f.tipo) ?? ['—']
      }
      if (mapped === 'reference') {
        field.linkedFormId = resolveLinkedForm(f.name, f.origem)
        if (!field.linkedFormId) {
          field.type = 'text'
          delete field.linkedFormId
        }
      }

      fields.push(field)
    }
  }

  return {
    id: formId,
    name: tela.name,
    sectionLayout: 'tabs',
    defaultCanvasMode: formId === FORM_PROC ? 'read' : 'edit',
    metadata: `Protótipo Atlas — ${tela.name}. Fonte: Atlas_Telas_Documentos_Templates_Processos.docx`,
    sections,
    fields,
  }
}

function sampleValue(field) {
  switch (field.type) {
    case 'boolean':
      return true
    case 'number':
      return field.currency ? 1500.5 : field.label.toLowerCase().includes('ordem') ? 1 : 10
    case 'date':
      return '2026-05-27T10:00:00'
    case 'file':
      return `${slug(field.label)}.pdf`
    case 'textOptions':
      return field.options?.[0] ?? '—'
    case 'reference':
      return field.label.includes('Organização') || field.label.includes('Cliente')
        ? 'MTI'
        : field.label.includes('Processo')
          ? 'PROC-2026-001'
          : 'Referência'
    default:
      if (field.textLong) return `Exemplo: ${field.label}`
      if (field.relevance === 'identity') return `Exemplo ${field.label}`
      return `Valor ${field.label}`
  }
}

function buildPresets(form, variant) {
  const values = {}
  for (const f of form.fields) {
    values[f.id] = sampleValue(f)
  }
  const colors = { mti: '#0c4a6e', parceiro: '#7c3aed', cliente: '#0d9488' }
  const names = { mti: 'Exemplo MTI', parceiro: 'Exemplo Parceiro', cliente: 'Exemplo Cliente' }
  const slugName = slug(form.name)
  return {
    id: `patlasv4proto-p-${slugName}-${variant}`,
    name: names[variant],
    iconColor: colors[variant],
    fieldValues: values,
  }
}

function replaceJsonRefs(obj, from, to) {
  const s = JSON.stringify(obj)
  return JSON.parse(s.split(from).join(to))
}

// --- main ---
const text = fs.readFileSync(sourceTxt, 'utf8')
const telas = parseDocument(text)
const docTela = telas.find((t) => t.name === 'Documentos e Templates')
const procTela = telas.find((t) => t.name === 'Processos')
if (!docTela || !procTela) {
  console.error('Não foi possível parsear as telas do documento.')
  process.exit(1)
}

const docForm = buildFormFromTela(docTela, FORM_DOC, 'documentos-e-templates')
const procForm = buildFormFromTela(procTela, FORM_PROC, 'processos')

docForm.exampleValuePresets = ['mti', 'parceiro', 'cliente'].map((v) => buildPresets(docForm, v))
docForm.activeExamplePresetId = docForm.exampleValuePresets[0].id

procForm.exampleValuePresets = ['mti', 'parceiro', 'cliente'].map((v) => buildPresets(procForm, v))
procForm.activeExamplePresetId = procForm.exampleValuePresets[0].id

const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
const kept = forms.filter(
  (f) => f.id !== FORM_DOC && f.id !== OLD_OPERACAO && f.id !== FORM_PROC,
)
const newForms = [...kept, docForm, procForm]
fs.writeFileSync(formsPath, JSON.stringify(newForms, null, 2) + '\n', 'utf8')

let classGroups = JSON.parse(fs.readFileSync(classGroupsPath, 'utf8'))
classGroups.assignments = replaceJsonRefs(classGroups.assignments, OLD_OPERACAO, FORM_PROC)
if (!classGroups.assignments[FORM_PROC]) {
  classGroups.assignments[FORM_PROC] = 'grp-patlasv4-proto-operacao'
}
delete classGroups.assignments[OLD_OPERACAO]
classGroups.memberOrderByGroup['grp-patlasv4-proto-operacao'] = (
  classGroups.memberOrderByGroup['grp-patlasv4-proto-operacao'] ?? []
)
  .map((id) => (id === OLD_OPERACAO ? FORM_PROC : id))
  .filter((id, i, arr) => arr.indexOf(id) === i)
fs.writeFileSync(classGroupsPath, JSON.stringify(classGroups, null, 2) + '\n', 'utf8')

let workspaces = JSON.parse(fs.readFileSync(workspacesPath, 'utf8'))
workspaces = replaceJsonRefs(workspaces, OLD_OPERACAO, FORM_PROC)
workspaces = replaceJsonRefs(workspaces, 'patlasv4proto-p-operacao-', 'patlasv4proto-p-processos-')
for (const ws of workspaces) {
  for (const pkg of ws.packages ?? []) {
    for (const cls of pkg.classes ?? []) {
      if (cls.linkedFormId === FORM_PROC) cls.name = 'Processos'
    }
  }
}
fs.writeFileSync(workspacesPath, JSON.stringify(workspaces, null, 2) + '\n', 'utf8')

console.log(`Documentos e Templates: ${docForm.sections.length} abas, ${docForm.fields.length} campos`)
console.log(`Processos: ${procForm.sections.length} abas, ${procForm.fields.length} campos`)
console.log(`forms.json: ${newForms.length} formulários (preservados ${kept.length} existentes)`)
