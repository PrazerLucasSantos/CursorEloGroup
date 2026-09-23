#!/usr/bin/env node
/**
 * Finaliza Parceria, Solução, Catálogo e Produto — regras F2 sem pendências.
 * Uso: node scripts/patch-atlas-prototipo-finalizar-f2.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORMS = path.join(ROOT, 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json')

const LEGEND =
  '`!` Parceiro · `#` MTI · `!#` Ambos · `?` Protheus RO · MAIÚSCULAS = parceiro não vê'

const STATUS_CAT = [
  'Rascunho',
  'Em análise',
  'Ajuste solicitado',
  'Reprovado',
  'Homologado',
  'Publicado',
  'Substituído',
]

const STATUS_PROD = [
  'Rascunho',
  'Em análise',
  'Ajuste solicitado',
  'Reprovado',
  'Homologado',
  'Publicado',
  'Substituído',
]

function find(forms, id) {
  const i = forms.findIndex((f) => f.id === id)
  if (i < 0) throw new Error(`Form não encontrado: ${id}`)
  return { form: forms[i], idx: i }
}

function upsertField(form, field, afterId) {
  const i = form.fields.findIndex((f) => f.id === field.id)
  if (i >= 0) {
    form.fields[i] = { ...form.fields[i], ...field }
    return
  }
  if (afterId) {
    const a = form.fields.findIndex((f) => f.id === afterId)
    if (a >= 0) {
      form.fields.splice(a + 1, 0, field)
      return
    }
  }
  // before DELETE section
  const d = form.fields.findIndex((f) => String(f.label || '').startsWith('DELETE'))
  if (d >= 0) form.fields.splice(d, 0, field)
  else form.fields.push(field)
}

function moveToDelete(form, id, label, regras) {
  const f = form.fields.find((x) => x.id === id)
  if (!f) return
  f.label = label.startsWith('DELETE') ? label : `DELETE ${label}`
  f.hidden = true
  f.readOnly = true
  f.sectionId = form.sections.find((s) => s.id.includes('delete'))?.id || f.sectionId
  f.spec = [
    `**Classe:** ${form.name} (Atlas Fase 2) — **FORA DESTA CLASSE**`,
    `**Legenda:** ${LEGEND}`,
    '**Regras:**',
    ...regras.map((r) => `- ${r}`),
    '**Ação:** Mantido oculto para rastreabilidade; usar a classe correta.',
  ].join('\n')
}

function ensureSection(form, sec) {
  if (!form.sections.find((s) => s.id === sec.id)) form.sections.push(sec)
}

function patchParceria(form) {
  form.metadata =
    'FINAL F2 2026-08-31. RN-PAR-01..05. Salvar gera Catálogo Rascunho. Prefixo Código Atlas. Parceiro não publica/apostila. DELETE ocultos.'

  upsertField(
    form,
    {
      id: 'form-patlasv4-proto-cat-parceria-sigla',
      label: '#Sigla (prefixo Código Atlas)',
      type: 'text',
      size: 'small',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-cat-parc-visao',
      spec: [
        '**Classe:** Parceria (Atlas Fase 2)',
        `**Legenda:** ${LEGEND}`,
        '**Regras de negócio:**',
        '- RN-PAR-05 / RN-PROD-08: Prefixo do Código Atlas dos produtos (ex.: SIMP, HOST).',
        '- 2–6 caracteres alfanuméricos. Único entre parcerias.',
        '- Ao gerar Código Atlas no Produto: Sigla + sequencial (ex.: SIMP001).',
        '**Quem preenche:** MTI',
        '**Validação:** Confirmado',
      ].join('\n'),
    },
    'form-patlasv4-proto-cat-parceria-identificador',
  )

  // Status já ok; reforçar spec
  const st = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-parceria-status')
  if (st) {
    st.spec = [
      '**Classe:** Parceria (Atlas Fase 2)',
      `**Legenda:** ${LEGEND}`,
      '**Regras:**',
      '- Workflow: Rascunho → Aguardando Análise - MTI → Ajuste/Reprovado/Homologado → Ativo/Paralisado.',
      '- RN-PAR-04: Parceiro envia; NÃO publica e NÃO apostila.',
      '- Durante análise MTI o parceiro fica em somente leitura.',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  form.methods = [
    {
      id: 'patlasv4proto-parc-meth-salvar-gera-cat',
      name: 'Salvar (gera Catálogo Rascunho)',
      icon: 'save',
      kind: 'destaque',
      spec:
        'RN-PAR-03: Ao salvar nova Parceria, o sistema cria automaticamente o primeiro Catálogo em status Rascunho, vinculado a esta Parceria. Conteúdo montado pelo parceiro no portal; homologação/publicação pela MTI.',
    },
    {
      id: 'patlasv4proto-parc-meth-enviar',
      name: 'Enviar para análise MTI',
      icon: 'send',
      kind: 'destaque',
      spec: 'Parceiro/MTI envia. Status → Aguardando Análise - MTI. Edição do parceiro bloqueada até decisão.',
    },
  ]

  // presets: sigla
  for (const p of form.exampleValuePresets || []) {
    if (p.name?.includes('SIMPLIFICA')) p.fieldValues['form-patlasv4-proto-cat-parceria-sigla'] = 'SIMP'
    if (p.name?.includes('HOST')) p.fieldValues['form-patlasv4-proto-cat-parceria-sigla'] = 'HOST'
    if (p.fieldValues && !p.fieldValues['form-patlasv4-proto-cat-parceria-vertical']) {
      p.fieldValues['form-patlasv4-proto-cat-parceria-vertical'] =
        p.name?.includes('HOST') ? 'Nuvem' : 'Automação e Processos'
    }
  }
}

function patchSolucao(form) {
  form.metadata =
    'FINAL F2 2026-08-31. RN-SOL-01..05. Parceria obrigatória e editável no cadastro. Catálogo N2 resolvido pelo sistema.'

  const parc = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-solucao-parceria')
  if (parc) {
    parc.readOnly = false
    parc.required = true
    parc.spec = [
      '**Classe:** Solução (Atlas Fase 2)',
      `**Legenda:** ${LEGEND}`,
      '**Regras:**',
      '- RN-SOL-01/02: Toda Solução pertence a uma Parceria selecionada no cadastro.',
      '- RN-SOL-03: Catálogo da solução é resolvido pelo sistema (não selecionar manualmente incompatível).',
      '- RN-SOL-04: Com vínculos, preferir inativar (Ativo=Não) em vez de excluir.',
      '**Quem preenche:** MTI',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  const nome = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-solucao-identificador')
  if (nome) {
    nome.required = true
    nome.readOnly = false
  }

  const cat = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-solucao-catalogo')
  if (cat) {
    cat.readOnly = true
    cat.spec = [
      '**Classe:** Solução (Atlas Fase 2)',
      '**Regras:**',
      '- RN-SOL-03 / RN-PAR-03: Gerado/resolvido pelo sistema a partir de Parceria + Solução.',
      '- Somente leitura. Não escolher catálogo de outra parceria.',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  form.methods = [
    {
      id: 'patlasv4proto-sol-meth-salvar',
      name: 'Salvar',
      icon: 'save',
      kind: 'destaque',
      spec: 'Persiste Solução na Parceria. Sistema resolve/atualiza referência ao Catálogo N2.',
    },
    {
      id: 'patlasv4proto-sol-meth-inativar',
      name: 'Inativar',
      icon: 'block',
      kind: 'menu',
      spec: 'RN-SOL-04: Não excluir se houver produtos/catálogo vinculados — Ativo = Não.',
    },
  ]
}

function patchCatalogo(form) {
  form.metadata =
    'FINAL F2 2026-08-31. RN-CAT-01..11. Variação (complexidade/peso). Status com Homologado. Versão 1.0+. Assinatura na homologação. FOCAL/DTIC/N2/N3. Parceiro não publica/apostila.'

  ensureSection(form, {
    id: 'sec-cat-variacao',
    title: 'Variação (serviços)',
    icon: 'tune',
  })

  // Status com Homologado
  const status = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-catalogo-status')
  if (status) {
    status.options = [...STATUS_CAT]
    status.spec = [
      '**Classe:** Catálogo (Atlas Fase 2)',
      `**Legenda:** ${LEGEND}`,
      '**Regras:**',
      '- Fluxo: Rascunho → Em análise → Ajuste/Reprovado → Homologado → Publicado → Substituído.',
      '- Homologar ≠ Publicar ≠ Apostilar.',
      '- RN-MTI-01: Após Enviar para análise, parceiro em somente leitura até decisão.',
      '- RN-PAR-04: Publicar/Apostilar = somente MTI.',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  // Versão
  const ver = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-catalogo-versao')
  if (ver) {
    ver.spec = [
      '**Classe:** Catálogo (Atlas Fase 2)',
      '**Regras:**',
      '- RN-CAT-07: Nova família nasce em **1.0**.',
      '- Evento que exige aprovação (inclusão de produto, reajuste) incrementa (1.1, 1.2…).',
      '- Única na família Parceria+Solução.',
      '- Obrigatória para publicar.',
      '**Quem preenche:** Sistema (incremento) / MTI (ajuste excepcional)',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  upsertField(
    form,
    {
      id: 'form-patlasv4-proto-cat-catalogo-variacao',
      label: '#Variação',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-cat-variacao',
      options: ['Sem variação', 'Por Complexidade', 'Por Peso'],
      spec: [
        '**Classe:** Catálogo (Atlas Fase 2)',
        `**Legenda:** ${LEGEND}`,
        '**Regras:**',
        '- 17/08: Informar se a variação do catálogo é por complexidade ou por peso.',
        '- Obrigatório quando É catálogo de serviços = Sim; se serviços = Não → Sem variação.',
        '- Define flags herdadas no Produto: Catálogo usa complexidade? / usa peso?',
        '- Valores de Complexidade/Peso ficam no **Produto**; faixas+coeficientes desta versão ficam na tabela abaixo quando = Por Complexidade.',
        '**Quem preenche:** MTI',
        '**Validação:** Confirmado',
      ].join('\n'),
    },
    'form-patlasv4-proto-cat-catalogo-toggle-licenca',
  )

  upsertField(
    form,
    {
      id: 'form-patlasv4-proto-cat-catalogo-faixas-complexidade',
      label: '#Faixas de complexidade (versão)',
      type: 'embeddedReference',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'common',
      sectionId: 'sec-cat-variacao',
      linkedFormId: 'form-patlasv4-proto-cat-catalogo-complexidade',
      embeddedDisplay: 'table',
      hidden: true,
      spec: [
        '**Classe:** Catálogo (Atlas Fase 2)',
        '**Regras:**',
        '- Exibir somente se Variação = Por Complexidade.',
        '- Cada linha: Faixa + Coeficiente uniforme nesta versão.',
        '- Produto.Complexidade seleciona entre estas faixas; Coeficiente é RO derivado.',
        '**Validação:** Confirmado',
      ].join('\n'),
    },
    'form-patlasv4-proto-cat-catalogo-variacao',
  )

  upsertField(
    form,
    {
      id: 'form-patlasv4-proto-cat-catalogo-alerta-trava-parceiro',
      label: 'Trava pós-envio',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-cat-fluxo',
      alertVariant: 'warning',
      alertTitle: 'Parceiro em somente leitura após envio',
      alertMessage:
        'Status Em análise / Homologado / Publicado: parceiro não edita. Só MTI publica e apostila (RN-PAR-04, RN-MTI-01).',
      alertCollapsible: true,
      spec: 'Regra de governança — não é campo persistido.',
    },
    'form-patlasv4-proto-cat-catalogo-status',
  )

  // Parceria/Solução required
  for (const id of [
    'form-patlasv4-proto-cat-catalogo-parceria',
    'form-patlasv4-proto-cat-catalogo-solucao',
  ]) {
    const f = form.fields.find((x) => x.id === id)
    if (f) {
      f.required = true
      f.readOnly = false
    }
  }

  form.fieldVisibilityRules = [
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
      id: 'rule-cat-servicos-exige-variacao',
      operator: 'eq',
      sourceFieldId: 'form-patlasv4-proto-cat-catalogo-toggle-servicos',
      action: 'show',
      targetFieldIds: ['form-patlasv4-proto-cat-catalogo-variacao'],
      expectedBoolean: true,
      sourceKind: 'boolean',
    },
  ]

  // Methods — reforçar assinatura e CSV
  form.methods = (form.methods || []).map((m) => {
    if (m.id?.includes('homologar')) {
      return {
        ...m,
        spec:
          'RN-CAT-08: Homologação de versão exige assinatura de diretores e presidente (workflow de assinatura). Status → Homologado. Não publica e não apostila.',
      }
    }
    if (m.id?.includes('nova-versao')) {
      return {
        ...m,
        spec:
          'RN-CAT-07: Cria nova versão a partir da atual (incremento). Versão anterior preenchida. Conteúdo copiado em Rascunho.',
      }
    }
    if (m.id?.includes('import-csv')) {
      return {
        ...m,
        spec:
          'RF-CSV-05 / RN-CSV-01: CSV do parceiro NÃO contém markup, % rateio nem fiscal. Colunas comerciais do Produto + vínculo ao catálogo.',
      }
    }
    if (m.id?.includes('publicar') || m.id?.includes('apostilar')) {
      return {
        ...m,
        spec: `${m.spec || ''}\nRN-PAR-04: Somente MTI. Parceiro não executa este ato.`.trim(),
      }
    }
    return m
  })

  // Presets
  for (const p of form.exampleValuePresets || []) {
    const fv = p.fieldValues || {}
    if (fv['form-patlasv4-proto-cat-catalogo-toggle-servicos']) {
      fv['form-patlasv4-proto-cat-catalogo-variacao'] = p.name?.includes('HOST')
        ? 'Por Peso'
        : 'Por Complexidade'
    } else {
      fv['form-patlasv4-proto-cat-catalogo-variacao'] = 'Sem variação'
    }
    // produtos do catálogo universal → todos Universal
    if (fv['form-patlasv4-proto-cat-catalogo-toggle-universal'] && p.embeddedRowsByFieldId) {
      for (const rows of Object.values(p.embeddedRowsByFieldId)) {
        for (const row of rows) {
          if (row['form-patlasv4-proto-cat-produto-tipo-oferta']) {
            row['form-patlasv4-proto-cat-produto-tipo-oferta'] = 'Universal'
          }
        }
      }
    }
  }

  // Restore complexidade subclass as usable (not removed)
  // handled separately on complexity form
}

function patchProduto(form) {
  form.metadata =
    'FINAL F2 2026-08-31. RN-PROD-01..12 + RN-DP. Tipo oferta herdado. Perpétuo→Única. Vertical RO. Condições comerciais = classe Dados de Parceria por Produto. DELETE ocultos.'

  // --- Vertical RO visível (tirar do DELETE) ---
  const vertical = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-produto-vertical')
  if (vertical) {
    vertical.label = 'Vertical de Serviço de TI'
    vertical.hidden = false
    vertical.readOnly = true
    vertical.required = false
    vertical.sectionId = 'sec-prod-ctx'
    vertical.spec = [
      '**Classe:** Produto (Atlas Fase 2)',
      `**Legenda:** ${LEGEND}`,
      '**Regras:**',
      '- RN-PROD-05 (25/08): Não editável no Produto — somente leitura herdada da Parceria do Catálogo.',
      '- Cadastro da Vertical é na classe Parceria.',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  // --- Mover condições comerciais para fora do Produto (RN-DP-01) ---
  const dppMove = [
    ['form-patlasv4-proto-cat-produto-custo', 'Custo → Dados de Parceria por Produto'],
    ['form-patlasv4-proto-cat-produto-markup', 'Markup → Dados de Parceria por Produto'],
    ['form-patlasv4-proto-cat-produto-pct-parceiro', '% Parceiro → Dados de Parceria por Produto'],
    ['form-patlasv4-proto-cat-produto-pct-mti', '% MTI → Dados de Parceria por Produto'],
    ['form-patlasv4-proto-cat-produto-periodo-minimo', 'Período mínimo → Dados de Parceria por Produto'],
  ]
  for (const [id, lab] of dppMove) {
    moveToDelete(form, id, lab, [
      'RN-DP-01: Condições comerciais da parceria ficam na classe **Dados de Parceria por Produto**.',
      'RN-DP-03: Parceiro não visualiza markup / % MTI / preço de mercado no portal.',
      'RN-DP-02: Período mínimo (12/24/36/48/60) — sem Perpétuo neste campo.',
    ])
  }

  ensureSection(form, {
    id: 'sec-prod-dpp-link',
    title: 'Condições comerciais da parceria',
    icon: 'handshake',
  })

  upsertField(
    form,
    {
      id: 'form-patlasv4-proto-cat-produto-alerta-dpp',
      label: 'Dados de Parceria',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-prod-dpp-link',
      alertVariant: 'info',
      alertTitle: 'Custo, Markup, % e Período mínimo → classe Dados de Parceria por Produto',
      alertMessage:
        'RN-DP-01: Separados do cadastro estrutural do Produto. Cadastre/consulte em Dados de Parceria por Produto. CSV do parceiro não leva markup/% (RN-CSV-01).',
      spec: 'RN-DP-01 / RN-DP-03 / RN-CSV-01',
    },
  )

  upsertField(
    form,
    {
      id: 'form-patlasv4-proto-cat-produto-dados-parceria',
      label: 'Dados de Parceria por Produto',
      type: 'embeddedReference',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: true,
      relevance: 'common',
      sectionId: 'sec-prod-dpp-link',
      linkedFormId: 'form-patlasv4-proto-cat-dados-parceria',
      embeddedDisplay: 'table',
      spec: [
        '**Classe:** Produto → view da classe Dados de Parceria por Produto',
        '**Regras:** RN-DP-01..05. Sigilo: markup e % MTI ocultos ao parceiro (RN-DP-03).',
      ].join('\n'),
    },
    'form-patlasv4-proto-cat-produto-alerta-dpp',
  )

  // Tipo de oferta
  const oferta = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-produto-tipo-oferta')
  if (oferta) {
    oferta.readOnly = true
    oferta.required = true
    oferta.spec = [
      '**Classe:** Produto (Atlas Fase 2)',
      '**Regras:**',
      '- RN-PROD-01: **Herdado** do Catálogo — se É catálogo universal = Sim → Universal; senão → Individualizado.',
      '- Não recadastrar. Catálogo universal só admite produtos Universal; individualizado só Individualizado.',
      '- Substitui colunas planilha UNIVERSAL N3 / INDIVIDUALIZADO N1.',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  // Métrica
  const met = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-produto-metrica')
  if (met) {
    met.spec = [
      '**Classe:** Produto (Atlas Fase 2)',
      '**Regras:**',
      '- RN-PROD-06 / RN-MET-03: Opções = **somente** Métricas permitidas do Catálogo selecionado.',
      '- Lista estática abaixo é exemplo; em runtime filtrar pelo Catálogo.',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  // Modelo / cobrança / alerta perpétuo
  const alerta = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-produto-alerta-perpetuo')
  if (alerta) {
    alerta.alertTitle = 'RN-MV-03 / RN-PROD-07: Perpétuo → cobrança Única (travado)'
    alerta.alertMessage =
      'Se Modelo de venda = Perpétuo, Tipo de cobrança fica automaticamente Única e não pode ser alterado.'
    alerta.hidden = true
  }

  const cob = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-produto-cobranca')
  if (cob) {
    cob.spec = [
      '**Classe:** Produto (Atlas Fase 2)',
      '**Regras:**',
      '- RN-PROD-07 / RN-MV-03 / RN-COB-02: Se Modelo = Perpétuo → valor travado em **Única**.',
      '- RN-COB-03: Sob demanda não é tipo de cobrança (é consumo OS / Fase 3).',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  // Código Atlas
  const cod = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-produto-codigo-atlas')
  if (cod) {
    cod.spec = [
      '**Classe:** Produto (Atlas Fase 2)',
      '**Regras:**',
      '- RN-PROD-08: Gerado pelo sistema. Alfanumérico 4–6. Prefixo = Sigla da Parceria + sequencial.',
      '- ≠ Código Proteus (item) ≠ Código Parceiro Protheus.',
      '- Único no sistema.',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  // Status
  const pst = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-produto-status')
  if (pst) {
    pst.options = [...STATUS_PROD]
    pst.spec = [
      '**Classe:** Produto (Atlas Fase 2)',
      '**Regras:**',
      '- Alinhado ao Catálogo: Rascunho → Em análise → Ajuste/Reprovado → Homologado → Publicado → Substituído.',
      '- Após envio, parceiro em RO (RN-MTI-01).',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  // Complexidade — opções das faixas do catálogo
  const cx = form.fields.find((f) => f.id === 'form-patlasv4-proto-cat-produto-complexidade')
  if (cx) {
    cx.spec = [
      '**Classe:** Produto (Atlas Fase 2)',
      '**Regras:**',
      '- RN-PROD-03/04: Só Serviço + Catálogo.Variação = Por Complexidade.',
      '- Opções = faixas cadastradas na versão do Catálogo (não lista livre).',
      '- Coeficiente preenchido automaticamente pela faixa.',
      '**Validação:** Confirmado',
    ].join('\n')
  }

  // Caps fields — mark partnerHidden for sigilo (metadata)
  for (const id of [
    'form-patlasv4-proto-cat-produto-markup',
    'form-patlasv4-proto-cat-produto-pct-mti',
    'form-patlasv4-proto-cat-produto-cod-siag-item',
    'form-patlasv4-proto-cat-produto-cod-protheus-item',
  ]) {
    const f = form.fields.find((x) => x.id === id)
    if (f) f.partnerHidden = true
  }

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

  // Reordenar: vertical após versão; dpp section antes do card/delete
  // Fix presets — tipo oferta coerente + codigo atlas + vertical
  for (const p of form.exampleValuePresets || []) {
    const fv = p.fieldValues || {}
    if (fv['form-patlasv4-proto-cat-produto-catalogo']?.includes('Simplifica')) {
      fv['form-patlasv4-proto-cat-produto-tipo-oferta'] = 'Universal'
      fv['form-patlasv4-proto-cat-produto-codigo-atlas'] = 'SIMP001'
      fv['form-patlasv4-proto-cat-produto-vertical'] = 'Automação e Processos'
      fv['form-patlasv4-proto-cat-produto-cfg-usa-complexidade'] =
        fv['form-patlasv4-proto-cat-produto-tipo'] === 'Serviço'
    }
    if (fv['form-patlasv4-proto-cat-produto-catalogo']?.includes('HOST')) {
      fv['form-patlasv4-proto-cat-produto-tipo-oferta'] = 'Individualizado'
      fv['form-patlasv4-proto-cat-produto-codigo-atlas'] = 'HOST001'
      fv['form-patlasv4-proto-cat-produto-vertical'] = 'Nuvem'
    }
    // remover refs a campos movidos para DPP dos presets (opcional manter)
  }

  form.methods = [
    {
      id: 'patlasv4proto-prod-meth-salvar',
      name: 'Salvar',
      icon: 'save',
      kind: 'destaque',
      spec:
        'Persiste Produto no Catálogo. Aplica herança: Parceria, Solução, Versão, Tipo de oferta, flags de variação. Gera Código Atlas (sigla parceria + seq).',
    },
    {
      id: 'patlasv4proto-prod-meth-enviar',
      name: 'Enviar para análise',
      icon: 'send',
      kind: 'destaque',
      spec: 'Status → Em análise. Parceiro em RO até decisão MTI.',
    },
  ]
}

function patchDpp(form) {
  form.metadata =
    'FINAL F2 2026-08-31. RN-DP-01..05. Classe canônica de Custo, Markup, % e Período mínimo. Sigilo parceiro (RN-DP-03). Sem Perpétuo no período.'

  for (const f of form.fields) {
    if (f.id?.includes('periodo-minimo')) {
      f.options = ['12', '24', '36', '48', '60']
      f.required = true
      f.spec =
        'RN-DP-02: Obrigatório. 12/24/36/48/60 meses. Sem Perpétuo (Perpétuo = Modelo de Venda).'
    }
    if (f.id?.includes('markup') || f.label?.toLowerCase().includes('markup')) {
      f.partnerHidden = true
      f.label = f.label?.includes('#') || f.label === f.label?.toUpperCase() ? f.label : `#${(f.label || 'MARKUP').toUpperCase()}`
    }
    if (f.id?.includes('pct-mti') || f.label === '% MTI') {
      f.partnerHidden = true
      f.label = '% MTI'
      f.readOnly = true
    }
    if (f.id?.includes('pct-parceiro')) {
      f.readOnly = true
      f.spec = 'Calculado. Parceiro pode consultar. RN-DP-03: não vê markup/% MTI.'
    }
  }

  const alerta = form.fields.find((f) => f.type === 'alert')
  if (alerta) {
    alerta.alertTitle = 'RN-DP-01 — Classe canônica das condições comerciais'
    alerta.alertMessage =
      'Custo (parceiro), Markup (MTI, parceiro não vê), % calculados, Período mínimo. CSV do parceiro não inclui markup/%. Fórmula de split = a confirmar (RN-DP-04).'
  }
}

function patchCatalogoComplexidade(form) {
  form.name = 'Complexidade do catálogo'
  form.metadata =
    'FINAL F2. Faixa + coeficiente da versão do Catálogo quando Variação = Por Complexidade. Embutida no Catálogo.'
  for (const f of form.fields) {
    if (f.id?.includes('alerta-removido')) {
      f.hidden = true
      f.alertTitle = 'Uso correto'
      f.alertMessage =
        'Esta subclasse é embutida no Catálogo (Variação = Por Complexidade). Valores de complexidade do item ficam no Produto.'
      f.alertVariant = 'info'
      f.hidden = false
    }
    f.hidden = f.id?.includes('alerta') ? false : f.hidden === true ? false : f.hidden
  }
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))

  const { form: parc } = find(forms, 'form-patlasv4-proto-cat-parceria')
  patchParceria(parc)

  const { form: sol } = find(forms, 'form-patlasv4-proto-cat-solucao')
  patchSolucao(sol)

  const { form: cat } = find(forms, 'form-patlasv4-proto-cat-catalogo')
  patchCatalogo(cat)

  const { form: prod } = find(forms, 'form-patlasv4-proto-cat-produto')
  patchProduto(prod)

  const { form: dpp } = find(forms, 'form-patlasv4-proto-cat-dados-parceria')
  patchDpp(dpp)

  const { form: ccx } = find(forms, 'form-patlasv4-proto-cat-catalogo-complexidade')
  patchCatalogoComplexidade(ccx)

  // Fix parceria presets: Individualizado em catálogo universal
  for (const p of parc.exampleValuePresets || []) {
    for (const rows of Object.values(p.embeddedRowsByFieldId || {})) {
      for (const row of rows) {
        if (p.name?.includes('SIMPLIFICA')) {
          row['form-patlasv4-proto-cat-produto-tipo-oferta'] = 'Universal'
        }
      }
    }
  }

  fs.writeFileSync(FORMS, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  // Polimento: DELETE never required; status alinhados; ordem Produto
  const forms2 = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
  const STATUS = [
    'Rascunho',
    'Em análise',
    'Ajuste solicitado',
    'Reprovado',
    'Homologado',
    'Publicado',
    'Substituído',
  ]
  for (const f of forms2) {
    for (const fld of f.fields || []) {
      if (String(fld.label || '').startsWith('DELETE')) {
        fld.required = false
        fld.hidden = true
        fld.readOnly = true
      }
    }
  }
  const cat2 = forms2.find((x) => x.id === 'form-patlasv4-proto-cat-catalogo')
  const st2 = cat2.fields.find((x) => x.id === 'form-patlasv4-proto-cat-catalogo-status')
  if (st2) st2.options = [...STATUS]
  const prod2 = forms2.find((x) => x.id === 'form-patlasv4-proto-cat-produto')
  const pst2 = prod2.fields.find((x) => x.id === 'form-patlasv4-proto-cat-produto-status')
  if (pst2) pst2.options = [...STATUS]
  const orderHints = [
    'form-patlasv4-proto-cat-produto-catalogo',
    'form-patlasv4-proto-cat-produto-parceria',
    'form-patlasv4-proto-cat-produto-solucao',
    'form-patlasv4-proto-cat-produto-versao-catalogo',
    'form-patlasv4-proto-cat-produto-vertical',
    'form-patlasv4-proto-cat-produto-tipo-oferta',
  ]
  const byId = new Map(prod2.fields.map((f) => [f.id, f]))
  const used = new Set()
  const head = []
  for (const id of orderHints) {
    if (byId.has(id)) {
      head.push(byId.get(id))
      used.add(id)
    }
  }
  const rest = prod2.fields.filter((f) => !used.has(f.id))
  prod2.fields = [
    ...head,
    ...rest.filter((f) => !String(f.label || '').startsWith('DELETE')),
    ...rest.filter((f) => String(f.label || '').startsWith('DELETE')),
  ]
  fs.writeFileSync(FORMS, `${JSON.stringify(forms2, null, 2)}\n`, 'utf8')

  // Report
  for (const id of [
    'form-patlasv4-proto-cat-parceria',
    'form-patlasv4-proto-cat-solucao',
    'form-patlasv4-proto-cat-catalogo',
    'form-patlasv4-proto-cat-produto',
  ]) {
    const f = forms2.find((x) => x.id === id)
    const act = f.fields.filter(
      (x) => x.type !== 'alert' && !String(x.label).startsWith('DELETE') && !x.id?.includes('card'),
    )
    const del = f.fields.filter((x) => String(x.label).startsWith('DELETE'))
    const rules = (f.fieldVisibilityRules || []).length
    const meth = (f.methods || []).length
    console.log(
      `${f.name}: ativos=${act.length} DELETE=${del.length} rules=${rules} methods=${meth}`,
    )
  }
  console.log('\n✓ Protótipo F2 finalizado (Parceria, Solução, Catálogo, Produto + DPP + faixas)')
}

main()
