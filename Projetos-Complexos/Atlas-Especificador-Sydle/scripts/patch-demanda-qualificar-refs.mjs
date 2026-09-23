/**
 * Qualificar demanda: Solução, Catálogo, Parceria e Contrato como referência.
 * Espelha os mesmos campos na classe Demanda (Dados da demanda).
 */
import fs from 'fs'

const PATHS = [
  'data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
  'data/subprojects/atlas-prototipo/epics/projeto-atlas-prototipacao/forms.json',
]

const FORM_SOLUCAO = 'form-patlasv4-proto-cat-solucao'
const FORM_CATALOGO = 'form-patlasv4-proto-cat-catalogo'
const FORM_PARCERIA = 'form-patlasv4-proto-cat-parceria'
const FORM_CONTRATO = 'form-patlasv4-proto-contrato'

function patchMethod(forms) {
  const m = forms.find((f) => f.id === 'form-patlasv4-proto-metodo-demc-qualificar')
  if (!m) throw new Error('method qualificar not found')

  const byId = Object.fromEntries(m.fields.map((f) => [f.id, f]))

  Object.assign(byId['patlasv4proto-mdem-qual-produto'], {
    label: 'Solução',
    type: 'reference',
    size: 'large',
    relevance: 'highlight',
    required: true,
    multiple: false,
    readOnly: false,
    linkedFormId: FORM_SOLUCAO,
    textLong: false,
    spec:
      'Referência à classe Solução (exibe o Nome). Selecionar a solução vigente da qualificação MTI.',
  })

  Object.assign(byId['patlasv4proto-mdem-qual-catalogo'], {
    label: 'Catálogo',
    type: 'reference',
    size: 'large',
    relevance: 'highlight',
    required: true,
    multiple: true,
    readOnly: false,
    linkedFormId: FORM_CATALOGO,
    textLong: false,
    spec:
      'Referência à classe Catálogo (Nome do catálogo). Pode haver mais de um catálogo do contrato.',
  })

  Object.assign(byId['patlasv4proto-mdem-qual-parceiro'], {
    label: 'Parceria / parceiro(s)',
    type: 'reference',
    size: 'large',
    relevance: 'highlight',
    required: false,
    multiple: true,
    readOnly: false,
    linkedFormId: FORM_PARCERIA,
    textLong: false,
    spec:
      'Referência à classe Parceria (Nome). Vazio = atendimento somente MTI. Múltiplos quando modalidade coletiva.',
  })

  if (!byId['patlasv4proto-mdem-qual-contrato']) {
    m.fields.push({
      id: 'patlasv4proto-mdem-qual-contrato',
      label: 'Contrato',
      type: 'reference',
      size: 'large',
      relevance: 'highlight',
      required: false,
      multiple: false,
      readOnly: false,
      linkedFormId: FORM_CONTRATO,
      spec:
        'Referência à classe Contrato (Número do contrato). Definido na qualificação conforme a natureza da cobertura.',
    })
  } else {
    Object.assign(byId['patlasv4proto-mdem-qual-contrato'], {
      label: 'Contrato',
      type: 'reference',
      size: 'large',
      relevance: 'highlight',
      required: false,
      multiple: false,
      linkedFormId: FORM_CONTRATO,
    })
  }

  // Ordem: alerta → solução → catálogo → parceria → contrato → modalidade → natureza → obs
  const order = [
    'patlasv4proto-mdem-qual-alerta',
    'patlasv4proto-mdem-qual-produto',
    'patlasv4proto-mdem-qual-catalogo',
    'patlasv4proto-mdem-qual-parceiro',
    'patlasv4proto-mdem-qual-contrato',
    'patlasv4proto-mdem-qual-modalidade',
    'patlasv4proto-mdem-qual-natureza',
    'patlasv4proto-mdem-qual-obs',
  ]
  m.fields.sort((a, b) => {
    const ia = order.indexOf(a.id)
    const ib = order.indexOf(b.id)
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
  })

  byId['patlasv4proto-mdem-qual-alerta'].alertMessage =
    'Qualificação MTI: seleccionar Solução, Catálogo, Parceria e Contrato (classes do Protótipo · referência pelo nome/número). Com parceiro → notifica e aguarda parecer antes da deliberação. Sem IA nesta fase.'

  return m
}

function patchDemanda(forms) {
  const d = forms.find((f) => f.id === 'form-patlasv4-proto-demanda-completa')
  if (!d) throw new Error('demanda not found')
  const byId = Object.fromEntries(d.fields.map((f) => [f.id, f]))

  // Solução qualificada
  Object.assign(byId['patlasv4proto-demc-solucao-vigente'], {
    label: 'Solução',
    type: 'reference',
    size: 'medium',
    relevance: 'highlight',
    readOnly: false,
    required: false,
    multiple: false,
    linkedFormId: FORM_SOLUCAO,
    sectionId: 'sec-demc-andamento',
    spec:
      'Solução vigente após qualificação MTI — referência à classe Solução (Nome). Distinto da solução apenas informada na abertura.',
  })

  // Catálogo(s) — traz para Dados da demanda (qualificação)
  Object.assign(byId['patlasv4proto-demc-catalogos'], {
    label: 'Catálogo',
    type: 'reference',
    size: 'medium',
    relevance: 'highlight',
    readOnly: false,
    required: false,
    multiple: true,
    linkedFormId: FORM_CATALOGO,
    sectionId: 'sec-demc-andamento',
    textLong: false,
    options: undefined,
    spec:
      'Catálogo(s) da qualificação — referência à classe Catálogo (Nome). Restringir aos do contrato quando houver vínculo.',
  })
  delete byId['patlasv4proto-demc-catalogos'].options

  // Parceria
  Object.assign(byId['patlasv4proto-demc-parceria'], {
    label: 'Parceria',
    type: 'reference',
    size: 'medium',
    relevance: 'highlight',
    multiple: true,
    linkedFormId: FORM_PARCERIA,
    sectionId: 'sec-demc-andamento',
    options: undefined,
    spec:
      'Parceria(s) vinculada(s) — referência à classe Parceria (Nome). Identificada na qualificação (RN06).',
  })
  delete byId['patlasv4proto-demc-parceria'].options

  // Contrato — referência à classe Contrato (seleção)
  if (!byId['patlasv4proto-demc-contrato']) {
    d.fields.push({
      id: 'patlasv4proto-demc-contrato',
      label: 'Contrato',
      type: 'reference',
      size: 'medium',
      relevance: 'highlight',
      readOnly: false,
      required: false,
      multiple: false,
      linkedFormId: FORM_CONTRATO,
      sectionId: 'sec-demc-andamento',
      spec:
        'Contrato vinculado — referência à classe Contrato (Número do contrato). Definido/ajustado na qualificação MTI.',
    })
  } else {
    Object.assign(byId['patlasv4proto-demc-contrato'], {
      label: 'Contrato',
      type: 'reference',
      size: 'medium',
      relevance: 'highlight',
      linkedFormId: FORM_CONTRATO,
      sectionId: 'sec-demc-andamento',
      multiple: false,
    })
  }

  // Embedded KPIs — não compete com a seleção por referência
  if (byId['patlasv4proto-demc-ref-contrato']) {
    Object.assign(byId['patlasv4proto-demc-ref-contrato'], {
      label: 'Detalhe do contrato (KPIs)',
      relevance: 'advanced',
      sectionId: 'sec-demc-andamento',
    })
  }

  // Natureza permanece textOptions (não é referência a classe)
  Object.assign(byId['patlasv4proto-demc-contrato-natureza'], {
    sectionId: 'sec-demc-andamento',
    relevance: 'common',
  })

  // Reordenar Dados da demanda
  const orderAndamento = [
    'patlasv4proto-demc-numero',
    'patlasv4proto-demc-tipo',
    'patlasv4proto-demc-status',
    'patlasv4proto-demc-origem',
    'patlasv4proto-demc-data-evento',
    'patlasv4proto-demc-atualizado-em',
    'patlasv4proto-demc-regra-fila',
    'patlasv4proto-demc-service-now',
    // Qualificação (refs)
    'patlasv4proto-demc-solucao-vigente',
    'patlasv4proto-demc-catalogos',
    'patlasv4proto-demc-parceria',
    'patlasv4proto-demc-contrato',
    'patlasv4proto-demc-contrato-natureza',
    'patlasv4proto-demc-patrocinio-autorizado',
    'patlasv4proto-demc-ref-contrato',
    'patlasv4proto-demc-ref-sla',
    'patlasv4proto-demc-resp-gerente',
    'patlasv4proto-demc-resp-titular',
    'patlasv4proto-demc-subst-1',
    'patlasv4proto-demc-subst-2',
    'patlasv4proto-demc-modalidade-parceiro',
    'patlasv4proto-demc-parceiro-notificado',
    'patlasv4proto-demc-qualificado',
  ]

  const sectionOrder = d.sections.map((s) => s.id)
  d.fields.sort((a, b) => {
    const ia = sectionOrder.indexOf(a.sectionId)
    const ib = sectionOrder.indexOf(b.sectionId)
    if (ia !== ib) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
    if (a.sectionId === 'sec-demc-andamento') {
      const pa = orderAndamento.indexOf(a.id)
      const pb = orderAndamento.indexOf(b.id)
      return (pa < 0 ? 999 : pa) - (pb < 0 ? 999 : pb)
    }
    return 0
  })

  return d
}

for (const path of PATHS) {
  const forms = JSON.parse(fs.readFileSync(path, 'utf8'))
  const m = patchMethod(forms)
  const d = patchDemanda(forms)
  fs.writeFileSync(path, `${JSON.stringify(forms, null, 2)}\n`)
  console.log('OK', path)
  console.log(
    '  method refs:',
    m.fields
      .filter((f) => f.type === 'reference')
      .map((f) => `${f.label}→${f.linkedFormId}`)
      .join(' · '),
  )
  console.log(
    '  demanda qualificação:',
    ['solucao-vigente', 'catalogos', 'parceria', 'contrato']
      .map((s) => {
        const f = d.fields.find((x) => x.id === `patlasv4proto-demc-${s}`)
        return `${f?.label}:${f?.type}`
      })
      .join(' · '),
  )
}
