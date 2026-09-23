#!/usr/bin/env node
/**
 * Cria Contrato da Demanda (CD-017…033 + natureza/catálogo),
 * completa OS da Demanda (CD-072…082 + correlatos),
 * e na Demanda · Completa troca campos flat por referências embutidas.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS = path.join(EPIC, 'forms.json')
const GROUPS = path.join(EPIC, 'class-groups.json')
const WS = path.join(EPIC, 'workspaces.json')

const DEMANDA_ID = 'form-patlasv4-proto-demanda-completa'
const CONTRATO_ID = 'form-patlasv4-proto-demc-contrato'
const OS_ID = 'form-patlasv4-proto-demc-os'
const P = 'patlasv4proto-demc-'
const CTR = 'patlasv4proto-demc-ctr-'
const OS = 'patlasv4proto-demc-os-'

function fld(partial) {
  return {
    size: 'medium',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'common',
    ...partial,
  }
}

function upsertForm(forms, form) {
  const i = forms.findIndex((f) => f.id === form.id)
  if (i >= 0) forms[i] = form
  else forms.push(form)
}

function buildContratoForm() {
  const S = {
    ident: 'sec-demc-ctr-ident',
    partes: 'sec-demc-ctr-partes',
    vig: 'sec-demc-ctr-vigencia',
    fin: 'sec-demc-ctr-financeiro',
    pat: 'sec-demc-ctr-patrocinio',
    cat: 'sec-demc-ctr-catalogo',
    evt: 'sec-demc-ctr-eventos',
  }

  return {
    id: CONTRATO_ID,
    name: 'Contrato da Demanda',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Classe satélite da Demanda F3. Campos contratuais Consol. §8 CD-017…033 (+ natureza e versão do catálogo). Referenciada em Demanda · Completa via ref-contrato.',
    sections: [
      { id: S.ident, title: 'Identificação', icon: 'badge' },
      { id: S.partes, title: 'Partes', icon: 'groups' },
      { id: S.vig, title: 'Vigência e descrição', icon: 'event' },
      { id: S.fin, title: 'Indicadores financeiros', icon: 'account_balance' },
      { id: S.pat, title: 'Patrocínio', icon: 'handshake' },
      { id: S.cat, title: 'Catálogo e objeto', icon: 'category' },
      { id: S.evt, title: 'Eventos', icon: 'history' },
    ],
    fields: [
      fld({
        id: `${CTR}numero`,
        label: 'Número do contrato (CD-017)',
        type: 'text',
        sectionId: S.ident,
        required: true,
        relevance: 'identity',
        size: 'small',
        spec: 'CD-017 — identificar o contrato relacionado à solução.',
      }),
      fld({
        id: `${CTR}nome`,
        label: 'Nome do contrato (CD-018)',
        type: 'text',
        sectionId: S.ident,
        relevance: 'highlight',
        spec: 'CD-018 — identificação descritiva.',
      }),
      fld({
        id: `${CTR}natureza`,
        label: 'Natureza do contrato',
        type: 'textOptions',
        sectionId: S.ident,
        options: ['Próprio', 'Patrocinado', 'Sem contrato'],
        relevance: 'highlight',
        spec: 'Próprio ou patrocinado permitem demanda. Sem contrato → orçamento/proposta.',
      }),
      fld({
        id: `${CTR}demanda`,
        label: 'Demanda',
        type: 'reference',
        sectionId: S.ident,
        linkedFormId: DEMANDA_ID,
        options: ['DEM-2026-0505', 'DEM-2026-0055'],
        spec: 'Demanda que consome este contrato.',
      }),
      fld({
        id: `${CTR}status`,
        label: 'Status do contrato',
        type: 'textOptions',
        sectionId: S.ident,
        options: ['Vigente', 'Suspenso', 'Encerrado', 'Em renovação'],
      }),

      fld({
        id: `${CTR}contratante`,
        label: 'Contratante (CD-019)',
        type: 'reference',
        sectionId: S.partes,
        linkedFormId: 'form-patlasv4-proto-unidade-organizacional',
        spec: 'CD-019 — parte contratante.',
      }),
      fld({
        id: `${CTR}contratada`,
        label: 'Contratada (CD-020)',
        type: 'reference',
        sectionId: S.partes,
        linkedFormId: 'form-patlasv4-proto-unidade-organizacional',
        spec: 'CD-020 — parte contratada.',
      }),

      fld({
        id: `${CTR}vig-ini`,
        label: 'Vigência · início (CD-021)',
        type: 'date',
        sectionId: S.vig,
        spec: 'CD-021 — início da vida contratual.',
      }),
      fld({
        id: `${CTR}vig-fim`,
        label: 'Vigência · fim (CD-021)',
        type: 'date',
        sectionId: S.vig,
        spec: 'CD-021 — fim; limita vigência máxima da OS.',
      }),
      fld({
        id: `${CTR}descricao`,
        label: 'Descrição do contrato (CD-022)',
        type: 'text',
        sectionId: S.vig,
        size: 'large',
        spec: 'CD-022 — conteúdo descritivo contratado.',
      }),

      fld({
        id: `${CTR}valor-global`,
        label: 'Valor global (CD-023)',
        type: 'text',
        sectionId: S.fin,
        spec: 'CD-023 — monetário; rótulo a confirmar.',
      }),
      fld({
        id: `${CTR}saldo-global`,
        label: 'Saldo global (CD-024)',
        type: 'text',
        sectionId: S.fin,
        spec: 'CD-024 — unidade e fórmula em PD16.',
      }),
      fld({
        id: `${CTR}os-abertas`,
        label: 'OS abertas / S aberto (CD-025)',
        type: 'text',
        sectionId: S.fin,
        spec: 'CD-025 — indicador; rótulo em PD01.',
      }),
      fld({
        id: `${CTR}provisionado`,
        label: 'Total provisionado (CD-026)',
        type: 'text',
        sectionId: S.fin,
        spec: 'CD-026 — conceito/cálculo pendentes.',
      }),
      fld({
        id: `${CTR}consumo`,
        label: 'Consumo até o momento (CD-027)',
        type: 'text',
        sectionId: S.fin,
        spec: 'CD-027 — consumo relacionado ao contrato.',
      }),
      fld({
        id: `${CTR}pct-execucao`,
        label: '% execução contratual (CD-028)',
        type: 'text',
        sectionId: S.fin,
        spec: 'CD-028 — fórmula pendente.',
      }),
      fld({
        id: `${CTR}execucao-acumulada`,
        label: 'Execução acumulada / continuada (CD-029)',
        type: 'text',
        sectionId: S.fin,
        spec: 'CD-029 — indicador com divergência de reconhecimento.',
      }),

      fld({
        id: `${CTR}contrato-patrocinador`,
        label: 'Contrato patrocinador (CD-030)',
        type: 'reference',
        sectionId: S.pat,
        linkedFormId: CONTRATO_ID,
        spec: 'CD-030 — cobertura oferecida ao beneficiário.',
      }),
      fld({
        id: `${CTR}org-patrocinadora`,
        label: 'Organização patrocinadora (CD-031)',
        type: 'reference',
        sectionId: S.pat,
        linkedFormId: 'form-patlasv4-proto-unidade-organizacional',
        spec: 'CD-031 — quem financia o atendimento.',
      }),
      fld({
        id: `${CTR}autorizacao-patrocinador`,
        label: 'Autorização do patrocinador (CD-032)',
        type: 'text',
        sectionId: S.pat,
        size: 'large',
        spec: 'CD-032 — formalizar pagamento por outro órgão.',
      }),

      fld({
        id: `${CTR}parceria`,
        label: 'Parceria (CD-035)',
        type: 'text',
        sectionId: S.cat,
        spec: 'CD-035 — parceria relacionada ao objeto contratado.',
      }),
      fld({
        id: `${CTR}cat-versao`,
        label: 'Versão do catálogo (CD-037)',
        type: 'text',
        sectionId: S.cat,
        spec: 'CD-037 / R19 — contrato nasce na versão do catálogo daquele momento.',
      }),
      fld({
        id: `${CTR}objeto-n2`,
        label: 'Objeto N2 do contrato (CD-039)',
        type: 'text',
        sectionId: S.cat,
        spec: 'CD-039 — classificação; PD02.',
      }),
      fld({
        id: `${CTR}oses`,
        label: 'Ordens de serviço do contrato',
        type: 'embeddedReference',
        sectionId: S.cat,
        linkedFormId: OS_ID,
        embeddedDisplay: 'table',
        multiple: true,
        size: 'large',
        relevance: 'highlight',
        spec: 'OS vinculadas a este contrato (CD-072+).',
      }),

      fld({
        id: `${CTR}eventos`,
        label: 'Eventos do contrato (CD-033)',
        type: 'text',
        sectionId: S.evt,
        size: 'large',
        multiple: true,
        spec: 'CD-033 — aditivos, supressão e demais eventos.',
      }),
    ],
    methods: [],
    exampleValuePresets: [
      {
        id: 'preset-demc-ctr-exemplo',
        name: 'Contrato exemplo · vigente',
        iconColor: '#0c4a6e',
        fieldValues: {
          [`${CTR}numero`]: 'CTR-2024-0112',
          [`${CTR}nome`]: 'Contrato de consumo de soluções de TI',
          [`${CTR}natureza`]: 'Próprio',
          [`${CTR}status`]: 'Vigente',
          [`${CTR}valor-global`]: 'R$ 2.500.000,00',
          [`${CTR}saldo-global`]: 'R$ 840.000,00',
          [`${CTR}cat-versao`]: 'CAT-2024.3',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'preset-demc-ctr-exemplo',
    fieldVisibilityRules: [
      {
        id: 'rule-demc-ctr-patrocinio',
        operator: 'eq',
        sourceFieldId: `${CTR}natureza`,
        sourceKind: 'textOptions',
        expectedOptionText: 'Patrocinado',
        action: 'show',
        targetFieldIds: [
          `${CTR}contrato-patrocinador`,
          `${CTR}org-patrocinadora`,
          `${CTR}autorizacao-patrocinador`,
        ],
      },
    ],
  }
}

function buildOsForm(existing) {
  const S = {
    ident: 'sec-demc-os-ident',
    vig: 'sec-demc-os-vigencia',
    qtd: 'sec-demc-os-quantitativos',
    saldo: 'sec-demc-os-saldo',
    assinatura: 'sec-demc-os-assinatura',
    eventos: 'sec-demc-os-eventos',
  }

  const fields = [
    fld({
      id: `${OS}numero`,
      label: 'Número da OS (CD-073)',
      type: 'text',
      sectionId: S.ident,
      required: true,
      relevance: 'identity',
      size: 'small',
      spec: 'CD-073 — identificar a ordem de serviço.',
    }),
    fld({
      id: `${OS}status`,
      label: 'Status',
      type: 'textOptions',
      sectionId: S.ident,
      relevance: 'highlight',
      options: [
        'Em elaboração',
        'Aguardando assinatura',
        'Assinada',
        'Execução autorizada',
        'Em execução',
        'Dilatação',
        'Substituída',
        'Encerrada',
      ],
    }),
    fld({
      id: `${OS}tipo`,
      label: 'Tipo de vínculo (CD-072)',
      type: 'textOptions',
      sectionId: S.ident,
      options: ['Via contrato', 'Via orçamento', 'OS existente', 'OS digital'],
      spec: 'CD-072 — relacionar ordem emitida ou existente; PD12.',
    }),
    fld({
      id: `${OS}demanda`,
      label: 'Demanda',
      type: 'reference',
      sectionId: S.ident,
      linkedFormId: DEMANDA_ID,
      options: ['DEM-2026-0505', 'DEM-2026-0055'],
    }),
    fld({
      id: `${OS}orcamento`,
      label: 'Orçamento (CD-063)',
      type: 'reference',
      sectionId: S.ident,
      linkedFormId: 'form-patlasv4-proto-demc-orcamento',
    }),
    fld({
      id: `${OS}contrato`,
      label: 'Contrato',
      type: 'reference',
      sectionId: S.ident,
      linkedFormId: CONTRATO_ID,
      relevance: 'highlight',
      spec: 'Contrato da Demanda que limita a vigência da OS.',
    }),
    fld({
      id: `${OS}obs`,
      label: 'Observação da OS (CD-074)',
      type: 'text',
      sectionId: S.ident,
      size: 'large',
      spec: 'CD-074 — observações na emissão.',
    }),

    fld({
      id: `${OS}vig-ini`,
      label: 'Vigência · início (CD-075)',
      type: 'date',
      sectionId: S.vig,
      spec: 'CD-075 — dentro da vigência contratual.',
    }),
    fld({
      id: `${OS}vig-fim`,
      label: 'Vigência · fim (CD-075)',
      type: 'date',
      sectionId: S.vig,
      spec: 'CD-075 — vigência OS ≤ contrato.',
    }),
    fld({
      id: `${OS}prazo-execucao`,
      label: 'Prazo de execução (CD-078)',
      type: 'text',
      sectionId: S.vig,
      spec: 'CD-078 — prazo declarado para o atendimento.',
    }),

    fld({
      id: `${OS}qtd-solicitada`,
      label: 'Quantidade solicitada (espelho CD-065)',
      type: 'text',
      sectionId: S.qtd,
      spec: 'Espelho da quantidade pedida na demanda, para conferência.',
    }),
    fld({
      id: `${OS}qtd-autorizada`,
      label: 'Quantidade autorizada na OS (CD-066)',
      type: 'text',
      sectionId: S.qtd,
      spec: 'CD-066 — volume autorizado; conferir vs solicitado.',
    }),

    fld({
      id: `${OS}saldo`,
      label: 'Saldo da OS (CD-076)',
      type: 'number',
      sectionId: S.saldo,
      spec: 'CD-076 — disponibilidade; fórmula PD16.',
    }),
    fld({
      id: `${OS}consumo`,
      label: 'Consumo da OS (CD-077)',
      type: 'number',
      sectionId: S.saldo,
      spec: 'CD-077 — consumo relacionado ao contrato/OS.',
    }),
    fld({
      id: `${OS}provisionado`,
      label: 'Provisionado',
      type: 'number',
      sectionId: S.saldo,
    }),
    fld({
      id: `${OS}regra-pagamento`,
      label: 'Regra de pagamento (sem OS)',
      type: 'text',
      sectionId: S.saldo,
      size: 'large',
      spec: 'T4 — sem OS: alerta, não bloqueio universal. Obrigação de pagamento no consumo permanece.',
    }),

    fld({
      id: `${OS}assina-gerente-op`,
      label: 'Assinatura · gerente de operação',
      type: 'boolean',
      sectionId: S.assinatura,
      spec: 'R11 — após orçamento aceito (caminho orçamento).',
    }),
    fld({
      id: `${OS}execucao-autorizada`,
      label: 'Autorização de execução (CD-079)',
      type: 'boolean',
      sectionId: S.assinatura,
      relevance: 'highlight',
      spec: 'CD-079 / R17 — liberar execução no Atlas → ServiceNow «aprovada e em atendimento».',
    }),
    fld({
      id: `${OS}sn-status`,
      label: 'ServiceNow',
      type: 'textOptions',
      sectionId: S.assinatura,
      options: ['Não enviado', 'Enviado', 'Em atendimento', 'Erro'],
    }),

    fld({
      id: `${OS}eventos`,
      label: 'Eventos e aditivos da OS (CD-080)',
      type: 'text',
      sectionId: S.eventos,
      size: 'large',
      multiple: true,
      spec: 'CD-080 — mudanças e renovação aplicáveis.',
    }),
    fld({
      id: `${OS}os-anterior`,
      label: 'OS anterior / histórico de versões (CD-081)',
      type: 'reference',
      sectionId: S.eventos,
      linkedFormId: OS_ID,
      spec: 'CD-081 — preservar ordens anteriores após substituição.',
    }),
    fld({
      id: `${OS}ateste-substituicao`,
      label: 'Ateste da substituição da OS (CD-082)',
      type: 'boolean',
      sectionId: S.eventos,
      spec: 'CD-082 — ciência/concordância da equipe e parceiro.',
    }),
    fld({
      id: `${OS}dilatacoes`,
      label: 'Dilatações de prazo (CD-108/109)',
      type: 'embeddedReference',
      sectionId: S.eventos,
      linkedFormId: 'form-patlasv4-proto-demc-dilatacao',
      embeddedDisplay: 'table',
      multiple: true,
      size: 'large',
      spec: 'CD-108/109 — eventos de dilação e autorizações.',
    }),
    fld({
      id: `${OS}hist-versao`,
      label: 'Histórico / versão',
      type: 'text',
      sectionId: S.eventos,
      size: 'large',
      spec: 'Complementar/substituição atestada; eventos de ajuste.',
    }),
  ]

  return {
    id: OS_ID,
    name: 'OS da Demanda',
    sectionLayout: existing?.sectionLayout ?? 'tabs',
    defaultCanvasMode: existing?.defaultCanvasMode ?? 'edit',
    metadata:
      (existing?.metadata || '') +
      '\n\nCampos Consol. CD-072…082 (+ quantitativos, SN, dilatação). Referenciada em Demanda · Completa via ref-oses. Contrato via classe Contrato da Demanda.',
    sections: [
      { id: S.ident, title: 'Identificação', icon: 'badge' },
      { id: S.vig, title: 'Vigência e prazo', icon: 'event' },
      { id: S.qtd, title: 'Quantitativos', icon: 'pin' },
      { id: S.saldo, title: 'Saldo e consumo', icon: 'account_balance' },
      { id: S.assinatura, title: 'Assinatura / execução', icon: 'draw' },
      { id: S.eventos, title: 'Eventos e versões', icon: 'history' },
    ],
    fields,
    methods: existing?.methods ?? [],
    exampleValuePresets: existing?.exampleValuePresets ?? [],
    activeExamplePresetId: existing?.activeExamplePresetId,
    fieldVisibilityRules: existing?.fieldVisibilityRules ?? [],
  }
}

/** Campos flat da Demanda que passam a viver nas classes Contrato / OS. */
const REMOVE_FROM_DEMANDA = [
  'contrato',
  'contrato-nome',
  'contratante',
  'contratada',
  'vigencia-contrato',
  'descricao-contrato',
  'valor-global',
  'saldo-global',
  'os-abertas',
  'total-provisionado',
  'consumo-contrato',
  'pct-execucao-contratual',
  'execucao-acumulada',
  'contrato-patrocinador',
  'org-patrocinadora',
  'autorizacao-patrocinador',
  'eventos-contrato',
  'cat-versao',
  'parceria',
  'objeto-n2',
  // OS flats
  'os-numero',
  'os-assinatura-gerente-op',
  'os-consumo',
  'obs-os',
  'vigencia-os',
  'saldo-os',
  'prazo-os',
  'autorizacao-execucao',
  'eventos-os',
  'os-anterior',
  'ateste-substituicao-os',
  'qtd-autorizada-os',
  'dilatacao',
  'dilacao-evento',
  'autorizacoes-dilacao',
]

function patchDemanda(form) {
  const removeIds = new Set(REMOVE_FROM_DEMANDA.map((s) => `${P}${s}`))
  form.fields = form.fields.filter((f) => !removeIds.has(f.id))

  // Natureza permanece na demanda (caminho sem contrato / regras de visibilidade)
  let natureza = form.fields.find((f) => f.id === `${P}contrato-natureza`)
  if (!natureza) {
    natureza = fld({
      id: `${P}contrato-natureza`,
      label: 'Natureza da cobertura',
      type: 'textOptions',
      sectionId: 'sec-demc-necessidade',
      options: ['Próprio', 'Patrocinado', 'Sem contrato'],
      relevance: 'highlight',
      spec: 'Na demanda: define se há contrato vinculado ou caminho orçamento. Detalhe contratual → classe Contrato.',
    })
    form.fields.push(natureza)
  } else {
    natureza.label = 'Natureza da cobertura'
    natureza.spec =
      'Na demanda: define se há contrato vinculado ou caminho orçamento. Detalhe contratual → classe Contrato da Demanda (ref-contrato).'
  }

  // ref-contrato
  let refCtr = form.fields.find((f) => f.id === `${P}ref-contrato`)
  if (!refCtr) {
    refCtr = fld({
      id: `${P}ref-contrato`,
      label: 'Contrato',
      type: 'embeddedReference',
      sectionId: 'sec-demc-necessidade',
      linkedFormId: CONTRATO_ID,
      embeddedDisplay: 'table',
      multiple: true,
      size: 'large',
      relevance: 'highlight',
      required: false,
      spec: 'CD-017…033 — classe Contrato da Demanda. Exiba o detalhamento dos campos da classe referenciada. Em regra: um contrato por demanda (próprio/patrocinado).',
    })
    form.fields.push(refCtr)
  } else {
    refCtr.type = 'embeddedReference'
    refCtr.linkedFormId = CONTRATO_ID
    refCtr.embeddedDisplay = 'table'
    refCtr.multiple = true
    refCtr.size = 'large'
    refCtr.sectionId = 'sec-demc-necessidade'
    refCtr.label = 'Contrato'
    refCtr.spec =
      'CD-017…033 — classe Contrato da Demanda. Campos do contrato ficam na classe referenciada.'
  }

  // ref-oses — garantir
  let refOs = form.fields.find((f) => f.id === `${P}ref-oses`)
  if (!refOs) {
    refOs = fld({
      id: `${P}ref-oses`,
      label: 'Ordens de serviço',
      type: 'embeddedReference',
      sectionId: 'sec-demc-vinculos',
      linkedFormId: OS_ID,
      embeddedDisplay: 'table',
      multiple: true,
      size: 'large',
      relevance: 'highlight',
      spec: 'CD-072…082 — classe OS da Demanda. Campos da OS ficam na classe referenciada.',
    })
    form.fields.push(refOs)
  } else {
    refOs.linkedFormId = OS_ID
    refOs.embeddedDisplay = 'table'
    refOs.multiple = true
    refOs.spec =
      'CD-072…082 — classe OS da Demanda. Campos da OS (número, vigência, saldo, consumo, autorização, eventos, ateste…) ficam na classe referenciada.'
    refOs.label = 'Ordens de serviço'
  }

  // Também espelhar OS na aba OS/Orçamento para descoberta
  let refOsOrc = form.fields.find((f) => f.id === `${P}ref-oses-operacional`)
  if (!refOsOrc) {
    form.fields.push(
      fld({
        id: `${P}ref-oses-operacional`,
        label: 'OS vinculada(s)',
        type: 'embeddedReference',
        sectionId: 'sec-demc-os-orc',
        linkedFormId: OS_ID,
        embeddedDisplay: 'table',
        multiple: true,
        size: 'large',
        relevance: 'highlight',
        spec: 'Mesma classe OS da Demanda (CD-072…082). Use esta aba no rito operacional; a aba Vínculos consolida satélites.',
      }),
    )
  }

  // Visibilidade: mostrar ref-contrato quando não é «Sem contrato»
  form.fieldVisibilityRules = (form.fieldVisibilityRules || []).filter(
    (r) => !['rule-demc-ref-contrato-proprio', 'rule-demc-ref-contrato-patrocinado'].includes(r.id),
  )
  form.fieldVisibilityRules.push(
    {
      id: 'rule-demc-ref-contrato-proprio',
      operator: 'eq',
      sourceFieldId: `${P}contrato-natureza`,
      sourceKind: 'textOptions',
      expectedOptionText: 'Próprio',
      action: 'show',
      targetFieldIds: [`${P}ref-contrato`],
    },
    {
      id: 'rule-demc-ref-contrato-patrocinado',
      operator: 'eq',
      sourceFieldId: `${P}contrato-natureza`,
      sourceKind: 'textOptions',
      expectedOptionText: 'Patrocinado',
      action: 'show',
      targetFieldIds: [`${P}ref-contrato`],
    },
  )

  // Limpar presets
  for (const preset of form.exampleValuePresets || []) {
    const bag = preset.fieldValues || preset.values
    if (!bag) continue
    for (const id of removeIds) delete bag[id]
  }

  // Seções
  for (const s of form.sections || []) {
    if (s.id === 'sec-demc-necessidade') s.title = 'Necessidade · Contrato'
    if (s.id === 'sec-demc-os-orc') s.title = 'OS / Orçamento'
    if (s.id === 'sec-demc-vinculos') s.title = 'Vínculos (Contrato · Orçamento · OS)'
  }

  return { removed: removeIds.size }
}

function patchGroups(groups) {
  const gid = 'grp-atlas-demanda-completa'
  groups.assignments = groups.assignments || {}
  groups.assignments[CONTRATO_ID] = gid
  groups.assignments[OS_ID] = gid
  groups.memberOrderByGroup = groups.memberOrderByGroup || {}
  const order = groups.memberOrderByGroup[gid] || []
  const insertAfter = (id, afterId) => {
    if (order.includes(id)) return
    const i = order.indexOf(afterId)
    if (i >= 0) order.splice(i + 1, 0, id)
    else order.push(id)
  }
  insertAfter(CONTRATO_ID, DEMANDA_ID)
  if (!order.includes(OS_ID)) insertAfter(OS_ID, 'form-patlasv4-proto-demc-orcamento')
  groups.memberOrderByGroup[gid] = order
}

function patchWorkspace(workspaces) {
  const ws = workspaces[0]
  if (!ws?.packages) return
  const pkg = ws.packages.find((p) => p.id === 'pkg-fase-3-demanda-completa')
  if (!pkg) return
  pkg.classes = pkg.classes || []
  const upsertCls = (id, name, linkedFormId, afterId) => {
    let cls = pkg.classes.find((c) => c.id === id)
    if (!cls) {
      cls = { id, name, linkedFormId }
      const i = pkg.classes.findIndex((c) => c.linkedFormId === afterId || c.id === afterId)
      if (i >= 0) pkg.classes.splice(i + 1, 0, cls)
      else pkg.classes.push(cls)
    } else {
      cls.name = name
      cls.linkedFormId = linkedFormId
    }
  }
  upsertCls('cls-mapa-demc-contrato', 'Contrato', CONTRATO_ID, DEMANDA_ID)
  upsertCls('cls-mapa-demc-os', 'OS', OS_ID, 'form-patlasv4-proto-demc-orcamento')
}

// ── main ──
const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
const groups = JSON.parse(fs.readFileSync(GROUPS, 'utf8'))
const workspaces = JSON.parse(fs.readFileSync(WS, 'utf8'))

const demanda = forms.find((f) => f.id === DEMANDA_ID)
if (!demanda) {
  console.error('Demanda completa não encontrada')
  process.exit(1)
}

const contrato = buildContratoForm()
const osExisting = forms.find((f) => f.id === OS_ID)
const os = buildOsForm(osExisting)

upsertForm(forms, contrato)
upsertForm(forms, os)

const { removed } = patchDemanda(demanda)
patchGroups(groups)
patchWorkspace(workspaces)

fs.writeFileSync(FORMS, `${JSON.stringify(forms, null, 2)}\n`)
fs.writeFileSync(GROUPS, `${JSON.stringify(groups, null, 2)}\n`)
fs.writeFileSync(WS, `${JSON.stringify(workspaces, null, 2)}\n`)

console.log(
  `OK contrato ${contrato.fields.length} campos · OS ${os.fields.length} campos · demanda fields ${demanda.fields.length} (removed flat ~${removed})`,
)
