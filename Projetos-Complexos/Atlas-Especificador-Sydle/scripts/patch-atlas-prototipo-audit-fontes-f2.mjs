#!/usr/bin/env node
/**
 * Alinha o protótipo Atlas F2 às fontes do chat (validações 05–25/08 + requisitos 26/08).
 * - DELETE sempre hidden
 * - Campos condicionais com hidden:true (regras show/hide)
 * - Tipo Cobrança: Subscrição + Unitário
 * - DP: Custo de mercado MTI (#, partnerHidden)
 * - Produto: DELETE planilha (Data preço, Índice, Última homologação)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORMS = path.join(ROOT, 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json')

const LEGEND =
  '`!` Parceiro · `#` MTI · `!#` Ambos · `?` Protheus RO · MAIÚSCULAS = parceiro não vê'

function find(forms, id) {
  const form = forms.find((f) => f.id === id)
  if (!form) throw new Error(`Form não encontrado: ${id}`)
  return form
}

function ensureDeleteSection(form, secId, title = 'Fora de escopo Fase 2 (DELETE)') {
  if (!form.sections.find((s) => s.id === secId)) {
    form.sections.push({ id: secId, title, collapsible: true, defaultCollapsed: true })
  }
  return secId
}

function forceDeleteHidden(form, secId) {
  for (const f of form.fields) {
    if (!String(f.label || '').startsWith('DELETE')) continue
    f.hidden = true
    f.readOnly = true
    if (secId) f.sectionId = secId
  }
}

function upsertField(form, field, afterId) {
  const i = form.fields.findIndex((f) => f.id === field.id)
  if (i >= 0) {
    form.fields[i] = { ...form.fields[i], ...field, id: field.id }
    return
  }
  if (afterId) {
    const a = form.fields.findIndex((f) => f.id === afterId)
    if (a >= 0) {
      form.fields.splice(a + 1, 0, field)
      return
    }
  }
  const d = form.fields.findIndex((f) => String(f.label || '').startsWith('DELETE'))
  if (d >= 0) form.fields.splice(d, 0, field)
  else form.fields.push(field)
}

function upsertDelete(form, field, secId) {
  upsertField(form, {
    ...field,
    label: field.label.startsWith('DELETE') ? field.label : `DELETE ${field.label}`,
    hidden: true,
    readOnly: true,
    sectionId: secId,
  })
}

function patchProduto(form) {
  form.metadata =
    'FINAL F2 2026-08-31 (audit fontes chat). RN-PROD-01..12 + RN-DP. Condicionais Serviço/Universal/Perpétuo. Fiscal/FC/N2N3/planilha-evento = DELETE ocultos.'

  // Condicionais: default hidden; fieldVisibilityRules fazem o show
  const hideDefaults = [
    'form-patlasv4-proto-cat-produto-complexidade',
    'form-patlasv4-proto-cat-produto-coeficiente-complexidade',
    'form-patlasv4-proto-cat-produto-peso',
    'form-patlasv4-proto-cat-produto-qtde-metrica',
    'form-patlasv4-proto-cat-produto-consumo-os',
    'form-patlasv4-proto-cat-produto-moeda-universal',
    'form-patlasv4-proto-cat-produto-alerta-perpetuo',
    'form-patlasv4-proto-cat-produto-cfg-usa-complexidade',
    'form-patlasv4-proto-cat-produto-cfg-usa-peso',
    'form-patlasv4-proto-cat-produto-cfg-exige-qtde',
  ]
  for (const id of hideDefaults) {
    const f = form.fields.find((x) => x.id === id)
    if (f) f.hidden = true
  }

  const secDel = ensureDeleteSection(form, 'sec-prod-delete')

  const deletes = [
    {
      id: 'form-patlasv4-proto-cat-produto-delete-data-preco',
      label: 'DELETE Data Atualização Preço (planilha)',
      type: 'date',
      size: 'medium',
      relevance: 'common',
      spec: `**FORA F2.** Planilha T2. Sem campo canônico no Atlas F2. ${LEGEND}`,
    },
    {
      id: 'form-patlasv4-proto-cat-produto-delete-indice-reajuste',
      label: 'DELETE Índice de Reajuste (planilha)',
      type: 'text',
      size: 'medium',
      relevance: 'common',
      spec: '**FORA F2.** Planilha T2. Não cadastrar no Produto nesta fase.',
    },
    {
      id: 'form-patlasv4-proto-cat-produto-delete-ultima-homologacao',
      label: 'DELETE Última Homologação (planilha)',
      type: 'date',
      size: 'medium',
      relevance: 'common',
      spec: '**FORA F2 como campo de tela.** Homologação = status/método no Catálogo (MTI), não coluna editável no Produto.',
    },
    {
      id: 'form-patlasv4-proto-cat-produto-delete-descricao-prod-erp',
      label: 'DELETE Descrição Prod. (Proteus)',
      type: 'text',
      size: 'large',
      relevance: 'common',
      textLong: true,
      spec: '**FORA F2.** Descrição curta ERP. Usar Nome / Nome científico no Atlas.',
    },
  ]
  for (const d of deletes) upsertDelete(form, d, secDel)
  forceDeleteHidden(form, secDel)

  // Garantir métrica required conforme RF
  const met = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-produto-metrica')
  if (met) met.required = true

  // Vertical RO
  const vert = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-produto-vertical')
  if (vert) {
    vert.readOnly = true
    vert.required = false
  }

  // Reafirmar regras de visibilidade
  form.fieldVisibilityRules = [
    {
      id: 'rule-prod-servico-cond',
      operator: 'eq',
      sourceFieldId: 'form-patlasv4-proto-cat-produto-tipo',
      action: 'show',
      targetFieldIds: [
        'form-patlasv4-proto-cat-produto-qtde-metrica',
        'form-patlasv4-proto-cat-produto-complexidade',
        'form-patlasv4-proto-cat-produto-coeficiente-complexidade',
        'form-patlasv4-proto-cat-produto-peso',
      ],
      sourceKind: 'textOptions',
      expectedOptionText: 'Serviço',
    },
    {
      id: 'rule-prod-hide-se-nao-usa-complexidade',
      operator: 'eq',
      sourceFieldId: 'form-patlasv4-proto-cat-produto-cfg-usa-complexidade',
      action: 'hide',
      targetFieldIds: [
        'form-patlasv4-proto-cat-produto-complexidade',
        'form-patlasv4-proto-cat-produto-coeficiente-complexidade',
      ],
      sourceKind: 'boolean',
      expectedBoolean: false,
    },
    {
      id: 'rule-prod-hide-se-nao-usa-peso',
      operator: 'eq',
      sourceFieldId: 'form-patlasv4-proto-cat-produto-cfg-usa-peso',
      action: 'hide',
      targetFieldIds: ['form-patlasv4-proto-cat-produto-peso'],
      sourceKind: 'boolean',
      expectedBoolean: false,
    },
    {
      id: 'rule-prod-hide-qtde-se-nao-exige',
      operator: 'eq',
      sourceFieldId: 'form-patlasv4-proto-cat-produto-cfg-exige-qtde',
      action: 'hide',
      targetFieldIds: ['form-patlasv4-proto-cat-produto-qtde-metrica'],
      sourceKind: 'boolean',
      expectedBoolean: false,
    },
    {
      id: 'rule-prod-universal-campos',
      operator: 'eq',
      sourceFieldId: 'form-patlasv4-proto-cat-produto-tipo-oferta',
      action: 'show',
      targetFieldIds: [
        'form-patlasv4-proto-cat-produto-consumo-os',
        'form-patlasv4-proto-cat-produto-moeda-universal',
      ],
      sourceKind: 'textOptions',
      expectedOptionText: 'Universal',
    },
    {
      id: 'rule-prod-perpetuo-alerta',
      operator: 'eq',
      sourceFieldId: 'form-patlasv4-proto-cat-produto-modelo-venda',
      action: 'show',
      targetFieldIds: ['form-patlasv4-proto-cat-produto-alerta-perpetuo'],
      sourceKind: 'textOptions',
      expectedOptionText: 'Perpétuo',
    },
  ]

  if (!form.methods?.some((m) => m.id === 'patlasv4proto-prod-meth-enviar')) {
    form.methods = form.methods || []
    form.methods.push({
      id: 'patlasv4proto-prod-meth-enviar',
      name: 'Enviar para análise',
      icon: 'send',
      kind: 'destaque',
      spec: 'Status → Em análise. Parceiro em RO até decisão MTI (RN-MTI-01).',
    })
  }
}

function patchCatalogo(form) {
  form.metadata =
    'FINAL F2 2026-08-31 (audit fontes chat). RN-CAT. Variação só se Serviços. N3 se Universal. FOCAL/DTIC. Homologar/Publicar/Apostilar = MTI.'

  const hideDefaults = [
    'form-patlasv4-proto-cat-catalogo-variacao',
    'form-patlasv4-proto-cat-catalogo-faixas-complexidade',
    'form-patlasv4-proto-cat-catalogo-cod-siag-univ',
    'form-patlasv4-proto-cat-catalogo-cod-protheus-univ',
  ]
  for (const id of hideDefaults) {
    const f = form.fields.find((x) => x.id === id)
    if (f) f.hidden = true
  }

  // Valor unitário solto no catálogo = duplicata das métricas embutidas → DELETE
  const vu = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-catalogo-valor-unitario')
  if (vu) {
    vu.label = 'DELETE Valor unitário da métrica (usar linha em Métricas permitidas)'
    vu.hidden = true
    vu.readOnly = true
    vu.spec =
      '**FORA desta posição.** Valor unitário fica na linha embutida de Métricas permitidas (RF-CAT-03).'
  }

  const secDel = ensureDeleteSection(form, 'sec-cat-delete')
  forceDeleteHidden(form, secDel)

  form.fieldVisibilityRules = [
    {
      id: 'rule-cat-servicos-exige-variacao',
      operator: 'eq',
      sourceFieldId: 'form-patlasv4-proto-cat-catalogo-toggle-servicos',
      action: 'show',
      targetFieldIds: ['form-patlasv4-proto-cat-catalogo-variacao'],
      expectedBoolean: true,
      sourceKind: 'boolean',
    },
    {
      id: 'rule-cat-variacao-complexidade',
      operator: 'eq',
      sourceFieldId: 'form-patlasv4-proto-cat-catalogo-variacao',
      action: 'show',
      targetFieldIds: ['form-patlasv4-proto-cat-catalogo-faixas-complexidade'],
      sourceKind: 'textOptions',
      expectedOptionText: 'Por Complexidade',
    },
    {
      id: 'rule-cat-univ-codes',
      operator: 'eq',
      sourceFieldId: 'form-patlasv4-proto-cat-catalogo-toggle-universal',
      action: 'show',
      targetFieldIds: [
        'form-patlasv4-proto-cat-catalogo-cod-siag-univ',
        'form-patlasv4-proto-cat-catalogo-cod-protheus-univ',
      ],
      expectedBoolean: true,
      sourceKind: 'boolean',
    },
  ]
}

function patchParceria(form) {
  form.metadata =
    'FINAL F2 2026-08-31 (audit fontes chat). RN-PAR-01..05. Vertical obrigatória. Sigla prefixo Código Atlas. Salvar→Catálogo Rascunho. DELETE ocultos.'

  const secDel = ensureDeleteSection(form, 'sec-cat-parc-delete')
  forceDeleteHidden(form, secDel)

  const vert = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-parceria-vertical')
  if (vert) vert.required = true

  const sigla = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-parceria-sigla')
  if (sigla) sigla.required = true
}

function patchSolucao(form) {
  form.metadata =
    'FINAL F2 2026-08-31 (audit fontes chat). RN-SOL-01..05. Parceria obrigatória/editável. Fabricante = DELETE até sign-off MTI.'

  const secDel = ensureDeleteSection(form, 'sec-cat-sol-delete')
  // Garantir fabricante como DELETE
  for (const id of [
    'form-patlasv4-proto-cat-solucao-fabricante-nome',
    'form-patlasv4-proto-cat-solucao-fabricante-contato',
    'form-patlasv4-proto-cat-solucao-codigo',
  ]) {
    const f = form.fields.find((x) => x.id === id)
    if (!f) continue
    if (!String(f.label).startsWith('DELETE')) f.label = `DELETE ${f.label}`
    f.hidden = true
    f.readOnly = true
    f.sectionId = secDel
  }
  forceDeleteHidden(form, secDel)

  const parc = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-solucao-parceria')
  if (parc) {
    parc.required = true
    parc.readOnly = false
  }
}

function patchDpp(form) {
  form.metadata =
    'FINAL F2 2026-08-31 (audit fontes chat). RN-DP-01..05. Custo parceiro + #Custo mercado MTI + #MARKUP + % + Período. Sigilo portal (RN-DP-03).'

  // Vigência → DELETE (não validada como campo canônico F2)
  const vig = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-dados-parceria-vigencia')
  if (vig) {
    vig.label = 'DELETE Vigência (não canônico F2)'
    vig.hidden = true
    vig.readOnly = true
  }

  upsertField(
    form,
    {
      id: 'form-patlasv4-proto-cat-dados-parceria-custo-mercado',
      label: '#CUSTO DE MERCADO MTI',
      type: 'number',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'highlight',
      currency: true,
      partnerHidden: true,
      sectionId: form.fields.find((f) => f.id?.includes('custo-parceiro'))?.sectionId,
      spec: [
        '**Classe:** Dados de Parceria por Produto',
        `**Legenda:** ${LEGEND}`,
        '**Regras:**',
        '- RF-DP-03 / RF-MTI-03: MTI informa custo de mercado.',
        '- RN-DP-03: Parceiro NÃO visualiza (partnerHidden / MAIÚSCULAS).',
        '- Fórmula de split ainda a confirmar (RN-DP-04) — campo existe para captura.',
        '**Validação:** Confirmado nas fontes 17–25/08',
      ].join('\n'),
    },
    'form-patlasv4-proto-cat-dados-parceria-custo-parceiro',
  )

  for (const f of form.fields) {
    if (f.id?.includes('markup') || /MARKUP/i.test(f.label || '')) {
      f.partnerHidden = true
      if (!/#|MARKUP/i.test(f.label || '')) f.label = '#MARKUP'
    }
    if (f.id?.includes('custo-mercado') || /CUSTO DE MERCADO/i.test(f.label || '')) {
      f.partnerHidden = true
    }
    if (f.id?.includes('dist-mti') || f.id?.includes('pct-mti') || /Distribuição da MTI|% MTI/i.test(f.label || '')) {
      f.partnerHidden = true
      f.readOnly = true
      f.label = f.label?.includes('%') ? '% MTI' : 'Distribuição da MTI'
    }
    if (
      f.id?.includes('dist-parceiro') ||
      f.id?.includes('pct-parceiro') ||
      /Distribuição do parceiro/i.test(f.label || '')
    ) {
      // RN-DP-03: parceiro não vê % de rateio
      f.partnerHidden = true
      f.readOnly = true
    }
    if (f.id?.includes('periodo-minimo')) {
      f.options = ['12', '24', '36', '48', '60']
      f.required = true
    }
  }

  const alerta = form.fields.find((f) => f.type === 'alert')
  if (alerta) {
    alerta.alertTitle = 'RN-DP-01 — Condições comerciais (classe canônica)'
    alerta.alertMessage =
      'Parceiro informa Custo. MTI informa #Custo de mercado e #MARKUP (parceiro não vê). % calculados (ocultos no portal). Período mínimo 12–60. Sem Perpétuo neste campo. CSV do parceiro sem markup/%.'
  }

  forceDeleteHidden(form)
}

function patchTipoCobranca(form) {
  form.metadata =
    'FINAL F2 2026-08-31 (audit fontes chat). RN-COB-01..04. Mensal · Anual · Subscrição · Conforme Homologação · Única · Unitário. Sob Demanda = Fase 3 (não cadastrar).'

  const nome = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-tipo-cobranca-nome')
  if (nome) {
    nome.spec =
      'Nome controlado (RN-COB-01): Mensal · Anual · Subscrição · Conforme Homologação · Única · Unitário. RN-COB-02: Perpétuo → Única. RN-COB-03: Sob Demanda não entra (consumo OS / Fase 3).'
  }

  const presets = form.exampleValuePresets || []
  const byName = new Map(presets.map((p) => [p.fieldValues?.['form-patlasv4-proto-cat-tipo-cobranca-nome'], p]))

  function ensurePreset(id, name, desc) {
    if (byName.has(name)) return
    presets.push({
      id,
      name,
      fieldValues: {
        'form-patlasv4-proto-cat-tipo-cobranca-nome': name,
        'form-patlasv4-proto-cat-tipo-cobranca-descricao': desc,
        'form-patlasv4-proto-cat-tipo-cobranca-ativo': true,
      },
    })
  }

  ensurePreset('p-tc-subscricao', 'Subscrição', 'Cobrança por assinatura/subscrição (prevalente na planilha MTI).')
  ensurePreset('p-tc-unitario', 'Unitário', 'Cobrança unitária por item/execução.')
  form.exampleValuePresets = presets
}

function patchApoio(form, meta) {
  form.metadata = meta
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))

  patchProduto(find(forms, 'form-patlasv4-proto-cat-produto'))
  patchCatalogo(find(forms, 'form-patlasv4-proto-cat-catalogo'))
  patchParceria(find(forms, 'form-patlasv4-proto-cat-parceria'))
  patchSolucao(find(forms, 'form-patlasv4-proto-cat-solucao'))
  patchDpp(find(forms, 'form-patlasv4-proto-cat-dados-parceria'))
  patchTipoCobranca(find(forms, 'form-patlasv4-proto-cat-tipo-cobranca'))

  patchApoio(
    find(forms, 'form-patlasv4-proto-cat-metrica'),
    'FINAL F2 2026-08-31. Nome + Descrição + Ativo. Seleção no Produto entre métricas do Catálogo. Consulta reversa.',
  )
  patchApoio(
    find(forms, 'form-patlasv4-proto-cat-modelo-venda'),
    'FINAL F2 2026-08-31. RN-MV. Por Licença · Por Serviço · Por Pacote · Perpétuo (+ oficiais planilha). Perpétuo → Cobrança Única.',
  )
  patchApoio(
    find(forms, 'form-patlasv4-proto-cat-grupo'),
    'FINAL F2 2026-08-31. RN-GRP. Grupo atrelado à Parceria. Obrigatório no Produto. Parceiro/MTI cadastram.',
  )
  patchApoio(
    find(forms, 'form-patlasv4-proto-cat-categoria'),
    'FINAL F2 2026-08-31. Vertical de Serviço de TI (ex-Categoria). RN-VERT. Vincula à Parceria, não ao Produto. Cadastro só MTI.',
  )

  // Safety: qualquer DELETE em forms F2 core
  const coreIds = [
    'form-patlasv4-proto-cat-produto',
    'form-patlasv4-proto-cat-catalogo',
    'form-patlasv4-proto-cat-parceria',
    'form-patlasv4-proto-cat-solucao',
    'form-patlasv4-proto-cat-dados-parceria',
  ]
  for (const id of coreIds) forceDeleteHidden(find(forms, id))

  // Validate JSON roundtrip
  const out = `${JSON.stringify(forms, null, 2)}\n`
  JSON.parse(out)
  fs.writeFileSync(FORMS, out, 'utf8')

  // Report
  const prod = find(forms, 'form-patlasv4-proto-cat-produto')
  const badDel = []
  for (const id of coreIds) {
    const f = find(forms, id)
    for (const field of f.fields) {
      if (String(field.label || '').startsWith('DELETE') && !field.hidden) {
        badDel.push(`${f.name}: ${field.label}`)
      }
    }
  }
  console.log('OK forms.json atualizado')
  console.log(
    'Produto condicionais hidden:',
    ['peso', 'qtde-metrica', 'complexidade', 'consumo-os']
      .map((k) => {
        const fld = prod.fields.find((x) => x.id.includes(k))
        return `${k}=${fld?.hidden}`
      })
      .join(', '),
  )
  console.log(
    'DP custo mercado:',
    find(forms, 'form-patlasv4-proto-cat-dados-parceria').fields.find((f) =>
      f.id.includes('custo-mercado'),
    )?.label,
  )
  console.log(
    'Cobrança presets:',
    find(forms, 'form-patlasv4-proto-cat-tipo-cobranca').exampleValuePresets.map(
      (p) => p.fieldValues['form-patlasv4-proto-cat-tipo-cobranca-nome'],
    ),
  )
  console.log('DELETE sem hidden:', badDel.length ? badDel.join(' | ') : 'nenhum')
}

main()
