#!/usr/bin/env node
/**
 * Ajusta a classe Produto conforme validação Fase 2 (Luís MTI 25/08)
 * e inventário requisitos-atlas-fase2-validacao-20260825.md
 *
 * Uso: node scripts/patch-atlas-prototipo-produto-fase2.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const FORM_ID = 'form-patlasv4-proto-cat-produto'

const SEC = {
  ctx: 'sec-prod-ctx',
  ident: 'sec-prod-ident',
  com: 'sec-prod-com',
  cond: 'sec-prod-cond',
  cod: 'sec-prod-cod',
  status: 'sec-prod-status',
  card: 'sec-prod-card',
}

const REMOVED_FIELD_IDS = new Set([
  'form-patlasv4-proto-cat-produto-categoria-servicos',
  'form-patlasv4-proto-cat-produto-custo',
  'form-patlasv4-proto-cat-produto-markup',
  'form-patlasv4-proto-cat-produto-pct-parceiro',
  'form-patlasv4-proto-cat-produto-pct-mti',
  'form-patlasv4-proto-cat-produto-periodo-minimo',
  'form-patlasv4-proto-cat-produto-cod-n1-siag',
  'form-patlasv4-proto-cat-produto-cod-n1-protheus',
  'form-patlasv4-proto-cat-produto-cod-n2-siag',
  'form-patlasv4-proto-cat-produto-cod-n2-protheus',
  'form-patlasv4-proto-cat-produto-cod-n3-siag',
  'form-patlasv4-proto-cat-produto-cod-n3-protheus',
  'form-patlasv4-proto-cat-produto-evento',
  'form-patlasv4-proto-cat-produto-ultima-notificacao',
  'form-patlasv4-proto-cat-produto-fc',
  'form-patlasv4-proto-cat-produto-grupo-protheus',
  'form-patlasv4-proto-cat-produto-cod-parceiro-protheus',
  'form-patlasv4-proto-cat-produto-local-padrao',
  'form-patlasv4-proto-cat-produto-tipo-protheus',
  'form-patlasv4-proto-cat-produto-unidade-protheus',
  'form-patlasv4-proto-cat-produto-tipo-protheus-class',
  'form-patlasv4-proto-cat-produto-origem',
  'form-patlasv4-proto-cat-produto-grupo-tributario',
  'form-patlasv4-proto-cat-produto-retem-ir',
  'form-patlasv4-proto-cat-produto-calcula-inss',
  'form-patlasv4-proto-cat-produto-retem-pis',
  'form-patlasv4-proto-cat-produto-retem-cofins',
  'form-patlasv4-proto-cat-produto-retem-csll',
  'form-patlasv4-proto-cat-produto-conta-contabil',
  'form-patlasv4-proto-cat-produto-cod-natureza',
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
    ...(opts.hidden ? { hidden: true } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.currency ? { currency: true } : {}),
    ...(opts.htmlContent ? { htmlContent: opts.htmlContent } : {}),
    ...(opts.alertVariant ? { alertVariant: opts.alertVariant } : {}),
    ...(opts.alertTitle ? { alertTitle: opts.alertTitle } : {}),
    ...(opts.alertMessage ? { alertMessage: opts.alertMessage } : {}),
    ...(opts.alertCollapsible ? { alertCollapsible: true } : {}),
  }
}

function buildProdutoForm(preserved) {
  return {
    id: FORM_ID,
    name: 'Produto',
    sectionLayout: 'accordion',
    defaultCanvasMode: 'edit',
    metadata:
      'Fase 2 validada 25/08/2026: Catálogo 1º; heranças RO; Grupo obrigatório; ' +
      'Vertical herdada da Parceria (RO); complexidade/peso só Serviço; ' +
      'Custo/Markup/%/Período mínimo → classe Dados de Parceria por Produto; ' +
      'N2/N3 no Catálogo; fiscal/FC fora do Atlas F2. Atualizado 2026-08-31.',
    sections: [
      { id: SEC.ctx, title: 'Contexto do Catálogo', icon: 'account_tree' },
      { id: SEC.ident, title: 'Identificação', icon: 'badge' },
      { id: SEC.com, title: 'Comercialização', icon: 'payments' },
      { id: SEC.cond, title: 'Características condicionais', icon: 'rule' },
      { id: SEC.cod, title: 'Códigos do item (N1)', icon: 'qr_code' },
      { id: SEC.status, title: 'Situação', icon: 'flag' },
      { id: SEC.card, title: 'Card da listagem', icon: 'style' },
    ],
    fields: [
      // —— Contexto ——
      f('form-patlasv4-proto-cat-produto-catalogo', 'Catálogo', 'reference', SEC.ctx, {
        required: true,
        relevance: 'identity',
        linkedFormId: 'form-patlasv4-proto-cat-catalogo',
        options: ['Catálogo MTI Simplifica', 'MTI HOST'],
        spec:
          '**RN-PROD-01:** Primeiro campo do cadastro. Controla Parceria, Solução, métricas e condicionais.\n\n' +
          'Parceiro ou MTI selecionam o catálogo; demais vínculos são herdados.',
      }),
      f('form-patlasv4-proto-cat-produto-parceria', 'Parceria', 'reference', SEC.ctx, {
        readOnly: true,
        required: true,
        linkedFormId: 'form-patlasv4-proto-cat-parceria',
        options: ['MTI SIMPLIFICA', 'MTI HOST'],
        spec: '**RN-PROD-01:** Herdada do Catálogo. Somente leitura.',
      }),
      f('form-patlasv4-proto-cat-produto-vertical', 'Vertical de Serviço de TI', 'reference', SEC.ctx, {
        readOnly: true,
        linkedFormId: 'form-patlasv4-proto-cat-categoria',
        options: [
          'Dados e Inteligência Artificial',
          'Automação e Processos',
          'Cibersegurança',
          'Nuvem',
          'Conectividade',
          'Identidade e governo',
        ],
        spec:
          '**RN-PROD-05:** Não é campo editável do Produto. Exibição somente leitura herdada da **Parceria** do Catálogo (decisão Luís 25/08).',
      }),
      f('form-patlasv4-proto-cat-produto-solucao', 'Solução', 'reference', SEC.ctx, {
        readOnly: true,
        required: true,
        linkedFormId: 'form-patlasv4-proto-cat-solucao',
        options: ['MTI Simplifica', 'MTI Host'],
        spec: '**RN-PROD-01:** Herdada do Catálogo. Somente leitura.',
      }),
      f('form-patlasv4-proto-cat-produto-versao-catalogo', 'Versão do catálogo', 'text', SEC.ctx, {
        readOnly: true,
        required: true,
        spec: '**RN-PROD-01:** Versão do Catálogo em que o Produto será gravado. Herdada.',
      }),
      f('form-patlasv4-proto-cat-produto-tipo-oferta', 'Tipo de oferta', 'textOptions', SEC.ctx, {
        readOnly: true,
        required: true,
        options: ['Universal', 'Individualizado'],
        spec:
          '**RN-PROD-01:** Herdado do Catálogo (Universal vs. Individualizado). Não recadastrar no Produto.',
      }),
      f('form-patlasv4-proto-cat-produto-cfg-usa-complexidade', 'Catálogo usa complexidade?', 'boolean', SEC.ctx, {
        readOnly: true,
        hidden: true,
        spec:
          'Configuração do **Catálogo** (não é dado comercial do Produto). Flag oculta RO que governa exibição de Complexidade no Serviço.',
      }),
      f('form-patlasv4-proto-cat-produto-cfg-usa-peso', 'Catálogo usa peso?', 'boolean', SEC.ctx, {
        readOnly: true,
        hidden: true,
        spec: 'Configuração do **Catálogo**. Flag oculta RO que governa exibição de Peso no Serviço.',
      }),
      f('form-patlasv4-proto-cat-produto-cfg-exige-qtde', 'Métrica exige quantidade por execução?', 'boolean', SEC.ctx, {
        readOnly: true,
        hidden: true,
        spec: 'Configuração **Catálogo/Métrica**. Flag oculta RO que governa Quantidade da métrica por execução.',
      }),

      // —— Identificação ——
      f('form-patlasv4-proto-cat-produto-codigo-atlas', 'Código Atlas', 'text', SEC.ident, {
        readOnly: true,
        required: true,
        relevance: 'highlight',
        spec:
          '**RN-PROD-08:** Alfanumérico único 4–6 caracteres (prefixo parceria + sequencial, ex.: SIMP001). ' +
          '≠ Código Proteus (item ERP) ≠ Código Parceiro.',
      }),
      f('form-patlasv4-proto-cat-produto-identificador', 'Nome do produto', 'text', SEC.ident, {
        required: true,
        relevance: 'identity',
        spec: 'Nome comercial específico. Não copiar automaticamente para Part Number.',
      }),
      f('form-patlasv4-proto-cat-produto-nome-comercializacao', 'Nome científico / comercialização', 'text', SEC.ident, {
        size: 'large',
        textLong: true,
        spec:
          'Parceria + descrição do produto; parceiro ou MTI. Equivalente comercial ao nome longo da planilha — ' +
          'não confundir com campos fiscais do Proteus.',
      }),
      f('form-patlasv4-proto-cat-produto-part-number', 'Part Number (SKU)', 'text', SEC.ident, {
        spec: 'SKU/Part Number opcional — nem todo fabricante trabalha com SKU (17/08).',
      }),
      f('form-patlasv4-proto-cat-produto-tipo', 'Tipo de produto', 'textOptions', SEC.ident, {
        required: true,
        options: ['Licença', 'Serviço'],
        spec: '**RN-PROD-02:** Somente Licença ou Serviço.',
      }),
      f('form-patlasv4-proto-cat-produto-grupo', 'Grupo', 'reference', SEC.ident, {
        required: true,
        linkedFormId: 'form-patlasv4-proto-cat-grupo',
        options: ['Análise e Modelagem de Processos', 'MTI Simplifica'],
        spec: 'Obrigatório. Filtrar grupos pela parceria do catálogo.',
      }),
      f('form-patlasv4-proto-cat-produto-descricao', 'Descrição do produto', 'text', SEC.ident, {
        size: 'large',
        textLong: true,
        spec: 'Escopo, entrega e resultado do produto.',
      }),

      // —— Comercialização ——
      f('form-patlasv4-proto-cat-produto-alerta-dados-parceria', 'Aviso', 'alert', SEC.com, {
        size: 'large',
        readOnly: true,
        alertVariant: 'info',
        alertTitle: 'Preço e condições comerciais da parceria',
        alertMessage:
          'Custo (parceiro), Markup/custo de mercado (MTI), % Parceiro, % MTI e Período mínimo ficam na classe ' +
          '**Dados de Parceria por Produto** — não neste formulário. O Valor unitário pode ser informado diretamente ' +
          'ou calculado automaticamente a partir desses dados (Luís 25/08).',
        alertCollapsible: true,
        spec: 'RN-DP / separação de classes Fase 2.',
      }),
      f('form-patlasv4-proto-cat-produto-modelo-venda', 'Modelo de venda', 'reference', SEC.com, {
        required: true,
        linkedFormId: 'form-patlasv4-proto-cat-modelo-venda',
        options: ['Por licença', 'Por serviço', 'Por pacote', 'Perpétuo', 'Por UST'],
        spec: '**RN-PROD-07:** Se Perpétuo → Tipo de cobrança = Única.',
      }),
      f('form-patlasv4-proto-cat-produto-cobranca', 'Tipo de cobrança', 'reference', SEC.com, {
        required: true,
        linkedFormId: 'form-patlasv4-proto-cat-tipo-cobranca',
        options: ['Mensal', 'Anual', 'Subscrição', 'Conforme homologação', 'Única', 'Unitário'],
        spec:
          '**RN-COB-03:** “Sob demanda” não é tipo de cobrança — é consumo via OS (Fase 3). Perpétuo → Única.',
      }),
      f('form-patlasv4-proto-cat-produto-metrica', 'Métrica', 'reference', SEC.com, {
        linkedFormId: 'form-patlasv4-proto-cat-metrica',
        options: ['USN', 'UST', 'HST', 'Unitário', 'Peça', 'Licenciamento'],
        spec: '**RN-PROD-06:** Selecionar apenas entre métricas permitidas do Catálogo.',
      }),
      f('form-patlasv4-proto-cat-produto-valor-unitario', 'Valor unitário', 'number', SEC.com, {
        required: true,
        currency: true,
        spec:
          'Preço comercial do produto. Pode ser **informado diretamente** ou **calculado** (custo parceiro + mercado MTI → VU automático) ' +
          'quando existir registro em Dados de Parceria por Produto. Luís 25/08.',
      }),
      f('form-patlasv4-proto-cat-produto-moeda-universal', 'Valor da moeda universal', 'number', SEC.com, {
        readOnly: true,
        hidden: true,
        currency: true,
        spec:
          'Exibição herdada do **Catálogo** quando Tipo de oferta = Universal. Valor fixo **1**; somente leitura. ' +
          '**RN-PROD-12:** Sem Fator de Conversão (FC) no cadastro — FC é consumo Fase 3 (17/08).',
      }),
      f('form-patlasv4-proto-cat-produto-consumo-os', 'Consumo por ordem de serviço?', 'boolean', SEC.com, {
        hidden: true,
        spec:
          'Flag de cadastro no Produto (condicional: Tipo de oferta = Universal). Indica consumo sob demanda/OS — ' +
          '**comportamento efetivo na Fase 3**. Não confundir com Tipo de cobrança (RN-COB-03).',
      }),
      f('form-patlasv4-proto-cat-produto-alerta-perpetuo', 'Regra Perpétuo', 'alert', SEC.com, {
        size: 'large',
        relevance: 'highlight',
        alertVariant: 'info',
        alertTitle: 'Modelo Perpétuo → cobrança Única',
        alertMessage:
          'Ao selecionar Modelo de venda = Perpétuo, selecione Tipo de cobrança = Única. Regra de negócio (RN-MV-03 / RN-COB-02), não campo.',
        alertCollapsible: true,
        spec: 'Regra de negócio — não é atributo persistido.',
      }),

      // —— Condicionais Serviço ——
      f('form-patlasv4-proto-cat-produto-qtde-metrica', 'Quantidade da métrica por execução', 'number', SEC.cond, {
        hidden: true,
        spec: '**RN-PROD-03/04:** Só Serviço + Métrica exige quantidade. Oculto para Licença.',
      }),
      f('form-patlasv4-proto-cat-produto-complexidade', 'Complexidade', 'textOptions', SEC.cond, {
        hidden: true,
        options: ['Muito Baixa', 'Baixa', 'Média', 'Alta', 'Muito Alta'],
        spec: '**RN-PROD-03/04:** Do Produto/Serviço (não do Catálogo). Oculto para Licença.',
      }),
      f('form-patlasv4-proto-cat-produto-coeficiente-complexidade', 'Coeficiente de complexidade', 'number', SEC.cond, {
        readOnly: true,
        hidden: true,
        spec: 'Somente leitura. Derivado da faixa de complexidade selecionada.',
      }),
      f('form-patlasv4-proto-cat-produto-peso', 'Peso', 'number', SEC.cond, {
        hidden: true,
        spec: 'Opcional no Serviço quando Catálogo usa peso. Oculto para Licença.',
      }),

      // —— Códigos N1 ——
      f('form-patlasv4-proto-cat-produto-cod-siag-item', 'Código SIAG - Item', 'text', SEC.cod, {
        spec:
          'Código N1 / CIAG do item individualizado. Opcional na Fase 2; obrigatório no contrato (Fase 3) quando N1. ' +
          'Códigos N2/N3 ficam no **Catálogo**.',
      }),
      f('form-patlasv4-proto-cat-produto-cod-protheus-item', 'Código Proteus - Item', 'text', SEC.cod, {
        spec:
          'Código N1 / Infocenter do item (ERP, ex. 32…). Opcional na Fase 2; obrigatório no contrato quando N1. ' +
          '≠ Código Atlas.',
      }),

      // —— Situação ——
      f('form-patlasv4-proto-cat-produto-status', 'Status do produto', 'textOptions', SEC.status, {
        readOnly: true,
        required: true,
        options: [
          'Rascunho',
          'Em análise',
          'Ajuste solicitado',
          'Reprovado',
          'Aprovado',
          'Publicado',
          'Substituído',
        ],
        spec: 'Gerado pelo workflow do catálogo/produto.',
      }),
      f('form-patlasv4-proto-cat-produto-ativo', 'Ativo', 'boolean', SEC.status, {
        required: true,
        size: 'small',
        spec: 'Disponibilidade para novos vínculos. Não substitui Status de workflow.',
      }),

      // —— Card UI ——
      f('form-patlasv4-proto-cat-produto-card', 'Prévia do card', 'html', SEC.card, {
        size: 'large',
        readOnly: true,
        htmlContent: preserved.cardHtml,
        spec:
          'Componente de UI do portal — não é atributo de domínio. Card = nome + tipo + status.',
      }),
    ],
    fieldVisibilityRules: [
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
    ],
    exampleValuePresets: preserved.exampleValuePresets,
    activeExamplePresetId: preserved.activeExamplePresetId,
    methods: preserved.methods,
  }
}

function cleanPresets(presets) {
  return presets.map((p) => ({
    ...p,
    fieldValues: Object.fromEntries(
      Object.entries(p.fieldValues || {}).filter(([k]) => !REMOVED_FIELD_IDS.has(k)),
    ),
  }))
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const idx = forms.findIndex((x) => x.id === FORM_ID)
  if (idx < 0) throw new Error('Form Produto não encontrado')

  const old = forms[idx]
  const cardField = old.fields.find((x) => x.id === 'form-patlasv4-proto-cat-produto-card')
  const preserved = {
    cardHtml: cardField?.htmlContent ?? '',
    exampleValuePresets: cleanPresets(old.exampleValuePresets || []),
    activeExamplePresetId: old.activeExamplePresetId,
    methods: old.methods || [],
  }

  forms[idx] = buildProdutoForm(preserved)
  fs.writeFileSync(FORMS_PATH, JSON.stringify(forms, null, 2) + '\n', 'utf8')

  const n = forms[idx].fields.length
  const vis = forms[idx].fields.filter((x) => x.hidden !== true && x.type !== 'alert').length
  console.log(`✓ Produto: ${n} campos (${vis} visíveis + alertas)`)
  console.log(`  Removidos: ${REMOVED_FIELD_IDS.size} ids fora de escopo F2`)
  console.log(`  Seções: ${forms[idx].sections.map((s) => s.title).join(' · ')}`)
}

main()
