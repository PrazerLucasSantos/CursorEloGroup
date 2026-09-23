/**
 * Divide a aba Atendimento em Atendimento MTI e Atendimento parceiro.
 */
import fs from 'fs'

const PATHS = [
  'data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
  'data/subprojects/atlas-prototipo/epics/projeto-atlas-prototipacao/forms.json',
]

const SEC_MTI = 'sec-demc-atendimento-mti'
const SEC_PAR = 'sec-demc-atendimento-parceiro'

/** Campos existentes que ficam na aba MTI. */
const MTI_FIELD_IDS = [
  'patlasv4proto-demc-tipo-analise',
  'patlasv4proto-demc-entregavel-forma',
  'patlasv4proto-demc-prazo-execucao',
  'patlasv4proto-demc-modalidade-servico',
  'patlasv4proto-demc-fabricante',
  'patlasv4proto-demc-solucao-catalogo',
  'patlasv4proto-demc-itens',
  'patlasv4proto-demc-desc-atendimento',
  'patlasv4proto-demc-via-valores',
  'patlasv4proto-demc-saldo-contabilizar',
  'patlasv4proto-demc-deliberacao-mti',
  'patlasv4proto-demc-motivo',
  'patlasv4proto-demc-motivo-rejeicao',
]

function ensure(fields, byId, def) {
  if (byId[def.id]) {
    Object.assign(byId[def.id], def)
    return byId[def.id]
  }
  fields.push(def)
  byId[def.id] = def
  return def
}

function patch(forms) {
  const d = forms.find((f) => f.id === 'form-patlasv4-proto-demanda-completa')
  if (!d) throw new Error('Demanda form missing')

  // Substituir aba única por duas
  const sections = []
  for (const s of d.sections) {
    if (s.id === 'sec-demc-atendimento') {
      sections.push(
        { id: SEC_MTI, title: 'Atendimento MTI', icon: 'assignment' },
        { id: SEC_PAR, title: 'Atendimento parceiro', icon: 'handshake' },
      )
      continue
    }
    if (s.id === SEC_MTI || s.id === SEC_PAR) continue
    sections.push(s)
  }
  // Se já não existia a antiga, garantir as duas
  if (!sections.some((s) => s.id === SEC_MTI)) {
    const idx = sections.findIndex((s) => s.id === 'sec-demc-solicitacao')
    sections.splice(idx + 1, 0,
      { id: SEC_MTI, title: 'Atendimento MTI', icon: 'assignment' },
      { id: SEC_PAR, title: 'Atendimento parceiro', icon: 'handshake' },
    )
  }
  d.sections = sections

  d.metadata =
    'Classe Demanda F3 (MTI · Projeto Atlas). Abas: dados da demanda, dados da solicitação, atendimento MTI, atendimento parceiro, assinaturas, entregável/RAER, OS/orçamento, histórico, vínculos, projeto. Consumo: N2 gestor∥fiscal → MTI → parceiro propositivo → deliberação → via contrato|orçamento|sem cobertura → OS → SN → termo.'

  const byId = Object.fromEntries(d.fields.map((f) => [f.id, f]))

  // Mover campos existentes para MTI
  for (const id of MTI_FIELD_IDS) {
    if (byId[id]) {
      byId[id].sectionId = SEC_MTI
    }
  }

  // Ajustes de rótulo/contexto MTI
  if (byId['patlasv4proto-demc-desc-atendimento']) {
    Object.assign(byId['patlasv4proto-demc-desc-atendimento'], {
      label: 'Descrição do atendimento (MTI)',
      sectionId: SEC_MTI,
      textLong: true,
      size: 'large',
      spec:
        'Descrição do atendimento elaborada pela MTI (via contrato / análise). Distinta da descrição do parceiro.',
    })
  }
  if (byId['patlasv4proto-demc-deliberacao-mti']) {
    Object.assign(byId['patlasv4proto-demc-deliberacao-mti'], {
      relevance: 'highlight',
      sectionId: SEC_MTI,
    })
  }

  // NEC na aba MTI (usado no via contrato)
  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-nec',
    label: 'NEC / necessidade detalhada',
    type: 'text',
    size: 'large',
    relevance: 'common',
    readOnly: false,
    required: false,
    multiple: false,
    textLong: true,
    sectionId: SEC_MTI,
    spec: 'Necessidade detalhada no atendimento via contrato (MTI).',
  })

  // Validação MTI do atendimento do parceiro
  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-validacao-parceiro',
    label: 'Validação do atendimento do parceiro',
    type: 'textOptions',
    size: 'medium',
    relevance: 'highlight',
    readOnly: false,
    required: false,
    multiple: false,
    sectionId: SEC_MTI,
    options: ['Pendente', 'Aprovado', 'Devolver ao parceiro', 'Recusar'],
    spec: 'Decisão da MTI ao validar o atendimento declarado pelo parceiro.',
  })

  // ——— Campos da aba Parceiro ———
  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-parceiro-caminho',
    label: 'Parecer / caminho proposto',
    type: 'textOptions',
    size: 'medium',
    relevance: 'highlight',
    readOnly: false,
    required: false,
    multiple: false,
    sectionId: SEC_PAR,
    options: [
      'Via contrato',
      'Orçamento',
      'Sem cobertura',
      'Devolver',
      'Recusar',
    ],
    spec:
      'Manifestação propositiva do parceiro (não é deliberação final — a MTI decide em seguida).',
  })

  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-parceiro-proposta-obs',
    label: 'Observação / proposta do parceiro',
    type: 'text',
    size: 'large',
    relevance: 'common',
    readOnly: false,
    required: false,
    multiple: false,
    textLong: true,
    sectionId: SEC_PAR,
    spec: 'Texto da proposta ou parecer do parceiro antes da deliberação da MTI.',
  })

  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-parceiro-tipo-atendimento',
    label: 'Tipo de atendimento',
    type: 'textOptions',
    size: 'small',
    relevance: 'common',
    readOnly: false,
    required: false,
    multiple: false,
    sectionId: SEC_PAR,
    options: ['Licenciamento', 'Serviço'],
    spec: 'Tipo informado pelo parceiro ao iniciar / efetivar o atendimento.',
  })

  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-parceiro-iniciou',
    label: 'Atendimento iniciado',
    type: 'boolean',
    size: 'small',
    relevance: 'highlight',
    readOnly: false,
    required: false,
    multiple: false,
    sectionId: SEC_PAR,
    spec: 'Parceiro confirmou início / efetivação do atendimento.',
  })

  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-parceiro-iniciou-em',
    label: 'Iniciado em',
    type: 'text',
    size: 'small',
    relevance: 'common',
    readOnly: true,
    required: false,
    multiple: false,
    sectionId: SEC_PAR,
    spec: 'Data/hora em que o parceiro iniciou o atendimento.',
  })

  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-desc-atendimento-parceiro',
    label: 'Descrição do atendimento (parceiro)',
    type: 'text',
    size: 'large',
    relevance: 'common',
    readOnly: false,
    required: false,
    multiple: false,
    textLong: true,
    sectionId: SEC_PAR,
    spec:
      'O que o parceiro está executando / executou. Distinta da descrição elaborada pela MTI.',
  })

  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-parceiro-declaracao',
    label: 'Declaração / entregável',
    type: 'text',
    size: 'large',
    relevance: 'common',
    readOnly: false,
    required: false,
    multiple: false,
    textLong: true,
    sectionId: SEC_PAR,
    spec: 'Declaração do parceiro ao marcar a demanda como atendida.',
  })

  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-parceiro-comprovacoes',
    label: 'Comprovações',
    type: 'file',
    size: 'large',
    relevance: 'common',
    readOnly: false,
    required: false,
    multiple: true,
    sectionId: SEC_PAR,
    spec: 'Anexos de comprovação enviados pelo parceiro ao declarar atendida.',
  })

  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-parceiro-declarada',
    label: 'Declarada atendida',
    type: 'boolean',
    size: 'small',
    relevance: 'highlight',
    readOnly: false,
    required: false,
    multiple: false,
    sectionId: SEC_PAR,
    spec: 'Parceiro declarou a demanda atendida (aguarda validação MTI).',
  })

  ensure(d.fields, byId, {
    id: 'patlasv4proto-demc-parceiro-declarada-em',
    label: 'Declarada em',
    type: 'text',
    size: 'small',
    relevance: 'common',
    readOnly: true,
    required: false,
    multiple: false,
    sectionId: SEC_PAR,
    spec: 'Data/hora da declaração de atendimento pelo parceiro.',
  })

  // Ordem estável
  const order = {
    [SEC_MTI]: [
      'patlasv4proto-demc-tipo-analise',
      'patlasv4proto-demc-entregavel-forma',
      'patlasv4proto-demc-prazo-execucao',
      'patlasv4proto-demc-modalidade-servico',
      'patlasv4proto-demc-fabricante',
      'patlasv4proto-demc-solucao-catalogo',
      'patlasv4proto-demc-itens',
      'patlasv4proto-demc-nec',
      'patlasv4proto-demc-desc-atendimento',
      'patlasv4proto-demc-via-valores',
      'patlasv4proto-demc-saldo-contabilizar',
      'patlasv4proto-demc-deliberacao-mti',
      'patlasv4proto-demc-validacao-parceiro',
      'patlasv4proto-demc-motivo',
      'patlasv4proto-demc-motivo-rejeicao',
    ],
    [SEC_PAR]: [
      'patlasv4proto-demc-parceiro-caminho',
      'patlasv4proto-demc-parceiro-proposta-obs',
      'patlasv4proto-demc-parceiro-tipo-atendimento',
      'patlasv4proto-demc-parceiro-iniciou',
      'patlasv4proto-demc-parceiro-iniciou-em',
      'patlasv4proto-demc-desc-atendimento-parceiro',
      'patlasv4proto-demc-parceiro-declaracao',
      'patlasv4proto-demc-parceiro-comprovacoes',
      'patlasv4proto-demc-parceiro-declarada',
      'patlasv4proto-demc-parceiro-declarada-em',
    ],
  }

  const sectionOrder = d.sections.map((s) => s.id)
  d.fields.sort((a, b) => {
    const ia = sectionOrder.indexOf(a.sectionId)
    const ib = sectionOrder.indexOf(b.sectionId)
    if (ia !== ib) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
    const oa = order[a.sectionId] || []
    const ob = order[b.sectionId] || []
    const pa = oa.indexOf(a.id)
    const pb = ob.indexOf(b.id)
    return (pa < 0 ? 999 : pa) - (pb < 0 ? 999 : pb)
  })

  return d
}

for (const path of PATHS) {
  const forms = JSON.parse(fs.readFileSync(path, 'utf8'))
  const d = patch(forms)
  fs.writeFileSync(path, `${JSON.stringify(forms, null, 2)}\n`)
  console.log('OK', path)
  console.log('  tabs:', d.sections.map((s) => s.title).join(' · '))
  console.log(
    '  MTI:',
    d.fields.filter((f) => f.sectionId === SEC_MTI).map((f) => f.label).join(' · '),
  )
  console.log(
    '  Parceiro:',
    d.fields.filter((f) => f.sectionId === SEC_PAR).map((f) => f.label).join(' · '),
  )
}
