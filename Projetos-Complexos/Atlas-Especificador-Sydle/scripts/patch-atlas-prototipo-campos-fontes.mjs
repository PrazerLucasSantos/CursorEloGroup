#!/usr/bin/env node
/**
 * Sincroniza Parceria, Solução, Catálogo e Produto no protótipo
 * com docs/campos-atlas-dados.js (fontes consolidadas).
 *
 * Uso: node scripts/patch-atlas-prototipo-campos-fontes.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const FORMS_PATH = path.join(ROOT, 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const SEED_PATH = path.join(ROOT, 'docs/campos-atlas-dados.js')
const CONTEXT_PATH = path.join(ROOT, 'data/subprojects/atlas-prototipo/epics/prototipo/context.md')

const FORMS = {
  Parceria: 'form-patlasv4-proto-cat-parceria',
  Solução: 'form-patlasv4-proto-cat-solucao',
  Catálogo: 'form-patlasv4-proto-cat-catalogo',
  Produto: 'form-patlasv4-proto-cat-produto',
}

/** SEED nome → field id existente (quando label difere) */
const FIELD_MAP = {
  Parceria: {
    Identificador: 'form-patlasv4-proto-cat-parceria-identificador',
    'Código da Parceira': 'form-patlasv4-proto-cat-parceria-codigo-parceira',
    Descrição: 'form-patlasv4-proto-cat-parceria-descricao',
    'Vertical de serviço de TI': 'form-patlasv4-proto-cat-parceria-vertical',
    Parceiros: 'form-patlasv4-proto-cat-parceria-parceiro',
    'Catálogo da parceria': 'form-patlasv4-proto-cat-parceria-catalogos',
    Soluções: 'form-patlasv4-proto-cat-parceria-solucoes',
    'Soluções (view)': 'form-patlasv4-proto-cat-parceria-solucoes-view',
    Status: 'form-patlasv4-proto-cat-parceria-status',
    'Ativo?': 'form-patlasv4-proto-cat-parceria-ativo',
    Observações: 'form-patlasv4-proto-cat-parceria-observacoes',
    Versão: 'form-patlasv4-proto-cat-parceria-versao',
    'Versão anterior': 'form-patlasv4-proto-cat-parceria-versao-anterior',
    'Início da vigência': 'form-patlasv4-proto-cat-parceria-vigencia-inicio',
    'Fim da vigência': 'form-patlasv4-proto-cat-parceria-vigencia-fim',
    'Data homologação DIREX': 'form-patlasv4-proto-cat-parceria-data-homologacao-direx',
    'Responsável homologação': 'form-patlasv4-proto-cat-parceria-responsavel-homologacao',
    'Status Parceria (planilha)': 'form-patlasv4-proto-cat-parceria-status-planilha',
  },
  Solução: {
    Nome: 'form-patlasv4-proto-cat-solucao-identificador',
    'Código da solução': 'form-patlasv4-proto-cat-solucao-codigo',
    Parceria: 'form-patlasv4-proto-cat-solucao-parceria',
    'Catálogo da solução': 'form-patlasv4-proto-cat-solucao-catalogo',
    Descrição: 'form-patlasv4-proto-cat-solucao-descricao',
    'Documentos de apoio': 'form-patlasv4-proto-cat-solucao-documentos-apoio',
    'Fabricante — nome': 'form-patlasv4-proto-cat-solucao-fabricante-nome',
    'Fabricante — contato': 'form-patlasv4-proto-cat-solucao-fabricante-contato',
    Observações: 'form-patlasv4-proto-cat-solucao-observacoes',
    'Ativo?': 'form-patlasv4-proto-cat-solucao-ativo',
    'Produtos da solução (view)': 'form-patlasv4-proto-cat-solucao-produtos',
  },
  Catálogo: {
    'Nome do catálogo': 'form-patlasv4-proto-cat-catalogo-identificador',
    Parceria: 'form-patlasv4-proto-cat-catalogo-parceria',
    Solução: 'form-patlasv4-proto-cat-catalogo-solucao',
    Descrição: 'form-patlasv4-proto-cat-catalogo-descricao',
    Versão: 'form-patlasv4-proto-cat-catalogo-versao',
    'Versão anterior': 'form-patlasv4-proto-cat-catalogo-versao-anterior',
    'Início de vigência': 'form-patlasv4-proto-cat-catalogo-vigencia-inicio',
    'Fim de vigência': 'form-patlasv4-proto-cat-catalogo-vigencia-fim',
    'Status do catálogo': 'form-patlasv4-proto-cat-catalogo-status',
    'É catálogo universal': 'form-patlasv4-proto-cat-catalogo-toggle-universal',
    'É catálogo de serviços': 'form-patlasv4-proto-cat-catalogo-toggle-servicos',
    'É catálogo de licenciamento': 'form-patlasv4-proto-cat-catalogo-toggle-licenca',
    'Métricas permitidas': 'form-patlasv4-proto-cat-catalogo-metricas',
    'Valor unitário da métrica': 'form-patlasv4-proto-cat-catalogo-valor-unitario',
    'FOCAL Vendas': 'form-patlasv4-proto-cat-catalogo-focal-vendas',
    'FOCAL Pós Vendas': 'form-patlasv4-proto-cat-catalogo-focal-posvendas',
    'Unidade DTIC': 'form-patlasv4-proto-cat-catalogo-unidade-dtic',
    'Código N2 — SIAG': 'form-patlasv4-proto-cat-catalogo-cod-siag-cat',
    'Código N2 — Protheus': 'form-patlasv4-proto-cat-catalogo-cod-protheus-cat',
    'Código N3 — SIAG': 'form-patlasv4-proto-cat-catalogo-cod-siag-univ',
    'Código N3 — Protheus': 'form-patlasv4-proto-cat-catalogo-cod-protheus-univ',
    Observações: 'form-patlasv4-proto-cat-catalogo-observacoes',
    'Ativo?': 'form-patlasv4-proto-cat-catalogo-ativo',
    'Produtos do catálogo (view)': 'form-patlasv4-proto-cat-catalogo-produtos',
    'Última notificação do fluxo': 'form-patlasv4-proto-cat-catalogo-ultima-notificacao',
  },
  Produto: {
    Catálogo: 'form-patlasv4-proto-cat-produto-catalogo',
    Parceria: 'form-patlasv4-proto-cat-produto-parceria',
    Solução: 'form-patlasv4-proto-cat-produto-solucao',
    'Versão do catálogo': 'form-patlasv4-proto-cat-produto-versao-catalogo',
    'Catálogo usa complexidade?': 'form-patlasv4-proto-cat-produto-cfg-usa-complexidade',
    'Catálogo usa peso?': 'form-patlasv4-proto-cat-produto-cfg-usa-peso',
    'Métrica exige quantidade por execução?': 'form-patlasv4-proto-cat-produto-cfg-exige-qtde',
    'Código Atlas': 'form-patlasv4-proto-cat-produto-codigo-atlas',
    'Nome do produto': 'form-patlasv4-proto-cat-produto-identificador',
    'Nome científico / comercialização': 'form-patlasv4-proto-cat-produto-nome-comercializacao',
    'Part Number (SKU)': 'form-patlasv4-proto-cat-produto-part-number',
    'Tipo de produto': 'form-patlasv4-proto-cat-produto-tipo',
    'Categoria de serviços': 'form-patlasv4-proto-cat-produto-categoria-servicos',
    'Descrição do produto': 'form-patlasv4-proto-cat-produto-descricao',
    'Tipo de oferta': 'form-patlasv4-proto-cat-produto-tipo-oferta',
    Grupo: 'form-patlasv4-proto-cat-produto-grupo',
    'Modelo de venda': 'form-patlasv4-proto-cat-produto-modelo-venda',
    'Tipo de cobrança': 'form-patlasv4-proto-cat-produto-cobranca',
    Métrica: 'form-patlasv4-proto-cat-produto-metrica',
    'Vertical de serviço': 'form-patlasv4-proto-cat-produto-vertical',
    'Valor unitário': 'form-patlasv4-proto-cat-produto-valor-unitario',
    'Valor da moeda universal': 'form-patlasv4-proto-cat-produto-moeda-universal',
    'Quantidade da métrica por execução': 'form-patlasv4-proto-cat-produto-qtde-metrica',
    'Consumo por ordem de serviço?': 'form-patlasv4-proto-cat-produto-consumo-os',
    Custo: 'form-patlasv4-proto-cat-produto-custo',
    Markup: 'form-patlasv4-proto-cat-produto-markup',
    '% Parceiro': 'form-patlasv4-proto-cat-produto-pct-parceiro',
    '% MTI': 'form-patlasv4-proto-cat-produto-pct-mti',
    'Período mínimo': 'form-patlasv4-proto-cat-produto-periodo-minimo',
    Complexidade: 'form-patlasv4-proto-cat-produto-complexidade',
    'Coeficiente de complexidade': 'form-patlasv4-proto-cat-produto-coeficiente-complexidade',
    Peso: 'form-patlasv4-proto-cat-produto-peso',
    'Código N1 — SIAG': 'form-patlasv4-proto-cat-produto-cod-n1-siag',
    'Código N1 — Protheus': 'form-patlasv4-proto-cat-produto-cod-n1-protheus',
    'Código N2 — SIAG': 'form-patlasv4-proto-cat-produto-cod-n2-siag',
    'Código N2 — Protheus': 'form-patlasv4-proto-cat-produto-cod-n2-protheus',
    'Código N3 — SIAG': 'form-patlasv4-proto-cat-produto-cod-n3-siag',
    'Código N3 — Protheus': 'form-patlasv4-proto-cat-produto-cod-n3-protheus',
    'Evento início/fim': 'form-patlasv4-proto-cat-produto-evento',
    'Última notificação do fluxo': 'form-patlasv4-proto-cat-produto-ultima-notificacao',
    'Fator de Conversão (FC)': 'form-patlasv4-proto-cat-produto-fc',
    'Código SIAG': 'form-patlasv4-proto-cat-produto-cod-siag-item',
    'Código Protheus': 'form-patlasv4-proto-cat-produto-cod-protheus-item',
    'Grupo Protheus': 'form-patlasv4-proto-cat-produto-grupo-protheus',
    'Código do parceiro — Protheus': 'form-patlasv4-proto-cat-produto-cod-parceiro-protheus',
    'Local padrão': 'form-patlasv4-proto-cat-produto-local-padrao',
    Tipo: 'form-patlasv4-proto-cat-produto-tipo-protheus',
    Unidade: 'form-patlasv4-proto-cat-produto-unidade-protheus',
    'Tipo Protheus': 'form-patlasv4-proto-cat-produto-tipo-protheus-class',
    Origem: 'form-patlasv4-proto-cat-produto-origem',
    'Grupo tributário': 'form-patlasv4-proto-cat-produto-grupo-tributario',
    'Retém IR (Imposto de Renda)': 'form-patlasv4-proto-cat-produto-retem-ir',
    'Calcula INSS': 'form-patlasv4-proto-cat-produto-calcula-inss',
    'Retém PIS': 'form-patlasv4-proto-cat-produto-retem-pis',
    'Retém COFINS': 'form-patlasv4-proto-cat-produto-retem-cofins',
    'Retém CSLL': 'form-patlasv4-proto-cat-produto-retem-csll',
    'Conta contábil': 'form-patlasv4-proto-cat-produto-conta-contabil',
    'Código natureza': 'form-patlasv4-proto-cat-produto-cod-natureza',
    'Status do produto': 'form-patlasv4-proto-cat-produto-status',
    'Ativo?': 'form-patlasv4-proto-cat-produto-ativo',
  },
}

const LINKED = {
  parceria: 'form-patlasv4-proto-cat-parceria',
  solucao: 'form-patlasv4-proto-cat-solucao',
  catalogo: 'form-patlasv4-proto-cat-catalogo',
  produto: 'form-patlasv4-proto-cat-produto',
  org: 'form-patlasv4-proto-unidade-organizacional',
  vertical: 'form-patlasv4-proto-cat-categoria',
  grupo: 'form-patlasv4-proto-cat-grupo',
  metrica: 'form-patlasv4-proto-cat-metrica',
  modeloVenda: 'form-patlasv4-proto-cat-modelo-venda',
  tipoCobranca: 'form-patlasv4-proto-cat-tipo-cobranca',
}

function loadSeed() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8')
  const json = raw.replace(/^const SEED_DATA\s*=\s*/, '').replace(/;\s*$/, '')
  return JSON.parse(json)
}

function slug(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

function buildSpec(row) {
  const parts = [
    row.regra && `**Regra:** ${row.regra}`,
    row.preenche && `**Quem preenche:** ${row.preenche}`,
    row.visualiza && `**Quem visualiza:** ${row.visualiza}`,
    row.protheus && row.protheus !== 'Não' && `**Protheus:** ${row.protheus}`,
    row.status && `**Validação:** ${row.status}`,
  ].filter(Boolean)
  return parts.join('\n\n')
}

function parseOptions(opcoes) {
  if (!opcoes || opcoes === '—' || opcoes === '-') return undefined
  return opcoes.split('·').map((s) => s.trim()).filter(Boolean)
}

function mapTipo(row) {
  const t = row.tipo.toLowerCase()
  if (t.includes('view') || t.includes('embutida')) return 'embeddedReference'
  if (t.includes('boolean')) return 'boolean'
  if (t.includes('data')) return 'date'
  if (t.includes('html')) return 'html'
  if (t.includes('arquivo')) return 'file'
  if (t.includes('moeda')) return 'number'
  if (t.includes('percentual')) return 'number'
  if (t.includes('enum') || t.includes('textoptions')) return 'textOptions'
  if (t.includes('referência') || t.includes('referencia')) return 'reference'
  if (t.includes('número') || t.includes('numero')) return 'number'
  return 'text'
}

function inferLinked(row, fieldId) {
  const n = row.nome.toLowerCase()
  const t = row.tipo.toLowerCase()
  if (!t.includes('referência') && !t.includes('referencia')) return undefined
  if (n.includes('parceiro') || n.includes('organização')) return LINKED.org
  if (n.includes('vertical')) return LINKED.vertical
  if (n.includes('parceria')) return LINKED.parceria
  if (n.includes('solução') || n.includes('solucao')) return LINKED.solucao
  if (n.includes('catálogo') || n.includes('catalogo')) return LINKED.catalogo
  if (n.includes('grupo') && !n.includes('protheus') && !n.includes('tribut')) return LINKED.grupo
  if (n.includes('métrica') || n.includes('metrica')) return LINKED.metrica
  if (n.includes('modelo de venda')) return LINKED.modeloVenda
  if (n.includes('cobrança') || n.includes('cobranca')) return LINKED.tipoCobranca
  if (n.includes('produto')) return LINKED.produto
  return undefined
}

function shouldHide(row) {
  if (row.status === 'Conflito') return true
  if (row.protheus?.includes('Não entra Fase 2')) return true
  if (row.nome === 'Vertical de serviço') return true // validação 25/08: na Parceria
  if (row.grupo?.includes('fiscal fora Fase 2')) return true
  if (row.status === 'Pendente' && /implementação|pendente de validação/i.test(row.regra || '')) {
    return row.nome.includes('Código da') || row.nome.includes('Versão') && row.classe === 'Parceria'
  }
  return false
}

function isReadOnly(row) {
  const p = (row.preenche || '').toLowerCase()
  if (p.includes('sistema') || p.includes('importado')) return true
  if (p.includes('automático')) return true
  if (row.visualiza?.includes('consulta') && !row.visualiza?.includes('edição')) return true
  return false
}

function fieldIdFor(classe, row, prefix) {
  if (FIELD_MAP[classe]?.[row.nome]) return FIELD_MAP[classe][row.nome]
  return `${prefix}-${slug(row.nome)}`
}

function sectionIdFromGrupo(grupo, prefix) {
  const g = grupo.replace(/^[^:]+:\s*/, '').replace(/^—\s*/, '')
  return `${prefix}-${slug(g)}`
}

function sectionTitleFromGrupo(grupo) {
  const parts = grupo.split('—')
  return (parts[parts.length - 1] || grupo).trim()
}

function sectionIcon(title) {
  const t = title.toLowerCase()
  if (t.includes('workflow') || t.includes('fluxo') || t.includes('status')) return 'flag'
  if (t.includes('protheus') || t.includes('integração') || t.includes('código')) return 'qr_code'
  if (t.includes('precif') || t.includes('comercial') || t.includes('condiç')) return 'payments'
  if (t.includes('identif')) return 'badge'
  if (t.includes('relacion') || t.includes('contexto')) return 'account_tree'
  if (t.includes('vigên') || t.includes('version')) return 'history'
  if (t.includes('visualiz') || t.includes('view')) return 'view_list'
  return 'tune'
}

function buildFieldFromSeed(classe, row, prefix, sectionIds) {
  const id = fieldIdFor(classe, row, prefix)
  const type = mapTipo(row)
  const secId = sectionIds.get(row.grupo) || sectionIds.values().next().value
  const opts = parseOptions(row.opcoes)
  const spec = buildSpec(row)
  const hidden = shouldHide(row)
  const readOnly = isReadOnly(row)

  const base = {
    id,
    label: row.nome === 'Identificador' && classe === 'Parceria' ? 'Nome' : row.nome.replace(/\?$/, ''),
    type,
    size: type === 'text' && (row.tipo.includes('longo') || row.regra?.includes('longo')) ? 'large' : 'medium',
    readOnly,
    required: /obrigatório/i.test(row.regra || ''),
    multiple: row.tipo.includes('(N)') || row.tipo.includes('múltipl'),
    relevance: row.nome.includes('Identificador') || row.nome === 'Nome' || row.nome === 'Nome do catálogo' || row.nome === 'Nome do produto' || row.nome === 'Código Atlas' ? 'identity' : 'common',
    sectionId: secId,
    spec,
    hidden: hidden || undefined,
  }

  if (type === 'text' && (row.tipo.includes('longo') || row.nome === 'Descrição' || row.nome.includes('Observações'))) {
    base.textLong = true
  }
  if (type === 'number' && row.tipo.includes('Moeda')) base.currency = true
  if (opts?.length) base.options = opts
  const linked = inferLinked(row, id)
  if (linked) base.linkedFormId = linked

  if (type === 'embeddedReference' || row.nome.includes('(view)')) {
    base.type = 'embeddedReference'
    base.readOnly = true
    base.multiple = true
    base.linkedFormId = row.nome.includes('Produto') ? LINKED.produto : row.nome.includes('Solução') ? LINKED.solucao : LINKED.catalogo
    base.embeddedDisplay = 'table'
    base.hidden = false
  }

  if (row.nome === 'Parceiros') {
    base.label = 'Parceiro'
    base.multiple = false
  }
  if (row.nome === 'Ativo?' || row.nome === 'Ativo') {
    base.label = 'Ativo'
    base.type = 'boolean'
    base.size = 'small'
    base.hidden = false
  }
  if (row.nome === 'Status' && classe === 'Parceria') {
    base.type = 'textOptions'
    base.options = parseOptions(row.opcoes) || [
      'Rascunho', 'Aguardando Análise - MTI', 'Ajuste Solicitado', 'Reprovado', 'Homologado', 'Ativo', 'Paralisado',
    ]
    base.hidden = false
  }
  if (row.nome === 'Descrição' && classe === 'Parceria') {
    base.type = 'html'
    base.hidden = false
  }

  return base
}

function mergeForm(form, classe, rows, prefix) {
  const preserved = form.fields.filter((f) => f.type === 'alert' || f.id.includes('alerta') || f.id.includes('card'))
  const preservedIds = new Set(preserved.map((f) => f.id))

  const sectionOrder = []
  const sectionIds = new Map()
  for (const row of rows) {
    if (!sectionIds.has(row.grupo)) {
      const sid = sectionIdFromGrupo(row.grupo, prefix.replace('form-patlasv4-proto-cat-', 'sec-'))
      sectionIds.set(row.grupo, sid)
      sectionOrder.push({ id: sid, title: sectionTitleFromGrupo(row.grupo), icon: sectionIcon(sectionTitleFromGrupo(row.grupo)) })
    }
  }

  // Manter seções de alertas/views existentes
  for (const sec of form.sections || []) {
    if (!sectionOrder.find((s) => s.id === sec.id)) {
      if (preserved.some((f) => f.sectionId === sec.id)) sectionOrder.unshift(sec)
    }
  }

  const existingById = new Map(form.fields.map((f) => [f.id, f]))
  const built = []
  const usedIds = new Set()

  for (const row of rows) {
    const field = buildFieldFromSeed(classe, row, prefix, sectionIds)
    const prev = existingById.get(field.id)
    if (prev) {
      const merged = { ...prev, ...field }
      if (prev.options?.length && !field.options?.length) merged.options = prev.options
      if (prev.linkedFormId && !field.linkedFormId) merged.linkedFormId = prev.linkedFormId
      if (prev.embeddedTableHiddenFieldIds) merged.embeddedTableHiddenFieldIds = prev.embeddedTableHiddenFieldIds
      if (prev.embeddedDisplay) merged.embeddedDisplay = prev.embeddedDisplay
      built.push(merged)
    } else {
      built.push(field)
    }
    usedIds.add(field.id)
  }

  for (const f of preserved) {
    if (!usedIds.has(f.id)) built.push(f)
  }

  // Parceria: manter tabela agregada de produtos se não veio do seed
  if (classe === 'Parceria' && !usedIds.has('form-patlasv4-proto-cat-parceria-produtos')) {
    const old = existingById.get('form-patlasv4-proto-cat-parceria-produtos')
    if (old) built.push(old)
  }

  form.sections = sectionOrder
  form.fields = built
  form.metadata = `Atualizado ${new Date().toISOString().slice(0, 10)} conforme docs/campos-atlas-dados.js (${rows.length} campos). ${form.metadata || ''}`.trim()
  return form
}

function main() {
  const seed = loadSeed()
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const counts = {}

  for (const [classe, formId] of Object.entries(FORMS)) {
    const rows = seed.filter((r) => r.classe === classe)
    const idx = forms.findIndex((f) => f.id === formId)
    if (idx < 0) {
      console.error('Form não encontrado:', formId)
      process.exit(1)
    }
    const prefix = formId
    forms[idx] = mergeForm(forms[idx], classe, rows, prefix)
    counts[classe] = { seed: rows.length, fields: forms[idx].fields.length, sections: forms[idx].sections.length }
    console.log(`${classe}: ${counts[classe].seed} campos fonte → ${counts[classe].fields} fields, ${counts[classe].sections} seções`)
  }

  fs.writeFileSync(FORMS_PATH, JSON.stringify(forms, null, 2) + '\n', 'utf8')

  const stamp = new Date().toISOString().slice(0, 10)
  let ctx = fs.existsSync(CONTEXT_PATH) ? fs.readFileSync(CONTEXT_PATH, 'utf8') : ''
  const marker = `## Patch campos fontes (${stamp})`
  if (!ctx.includes(marker)) {
    ctx += `\n\n${marker}\n\nParceria, Solução, Catálogo e Produto sincronizados com \`docs/campos-atlas-dados.js\`.\n`
    fs.writeFileSync(CONTEXT_PATH, ctx, 'utf8')
  }

  console.log('\n✓ forms.json atualizado')
}

main()
