import fs from 'fs'

const path = 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json'
const forms = JSON.parse(fs.readFileSync(path, 'utf8'))

function ensureSection(form, section, afterId) {
  if (!form.sections) form.sections = []
  if (form.sections.some((s) => s.id === section.id)) return
  const idx = afterId ? form.sections.findIndex((s) => s.id === afterId) : -1
  if (idx >= 0) form.sections.splice(idx + 1, 0, section)
  else form.sections.push(section)
}

// ——— DEMC (classe Demanda completa) ———
{
  const f = forms.find((x) => x.id === 'form-patlasv4-proto-demanda-completa')
  if (!f) throw new Error('demc missing')

  ensureSection(f, { id: 'sec-demc-sla', title: 'SLA', icon: 'timer' }, 'sec-demc-solicitacao')
  ensureSection(
    f,
    { id: 'sec-demc-fila', title: 'Responsáveis e parceiros', icon: 'groups' },
    'sec-demc-sla',
  )

  const moves = [
    ['patlasv4proto-demc-ref-sla', 'sec-demc-sla'],
    ['patlasv4proto-demc-service-now', 'sec-demc-os-orc'],
    ['patlasv4proto-demc-catalogos', 'sec-demc-atendimento-mti'],
    ['patlasv4proto-demc-patrocinio-autorizado', 'sec-demc-assinaturas'],
    ['patlasv4proto-demc-resp-gerente', 'sec-demc-fila'],
    ['patlasv4proto-demc-resp-titular', 'sec-demc-fila'],
    ['patlasv4proto-demc-subst-1', 'sec-demc-fila'],
    ['patlasv4proto-demc-subst-2', 'sec-demc-fila'],
    ['patlasv4proto-demc-modalidade-parceiro', 'sec-demc-fila'],
  ]

  for (const [id, sec] of moves) {
    const field = (f.fields || []).find((x) => x.id === id)
    if (!field) {
      console.log('MISSING demc', id)
      continue
    }
    field.sectionId = sec
    console.log('demc MOVE', field.label, '→', sec)
  }

  const sla = (f.fields || []).find((x) => x.id === 'patlasv4proto-demc-ref-sla')
  if (sla) {
    sla.spec =
      'Função: Acompanhamento do SLA da demanda (classe SLA · dois relógios: demanda × execução).\nRegra: Aba própria «SLA». A Data da solicitação (Dados da demanda) é o marco de início; o relógio detalhado fica aqui — não no cabeçalho.'
  }
  const sn = (f.fields || []).find((x) => x.id === 'patlasv4proto-demc-service-now')
  if (sn) {
    sn.spec =
      'Situação no ServiceNow (sistema MTI). Preenchimento real com OS/projeto — SN consome o Atlas. Não pertence ao cabeçalho de recepção.'
  }
  const cat = (f.fields || []).find((x) => x.id === 'patlasv4proto-demc-catalogos')
  if (cat) {
    cat.spec =
      'Catálogo(s) do atendimento via contrato — referência à classe Catálogo (Nome). Restringir aos do contrato quando houver vínculo. Definido no atendimento MTI / qualificação avançada — não na abertura.'
  }
  const pat = (f.fields || []).find((x) => x.id === 'patlasv4proto-demc-patrocinio-autorizado')
  if (pat) {
    pat.spec =
      'Função: Flag de autorização do patrocinador (contrato de gestão).\nRegra (Luis 17/09): ocorre DEPOIS da qualificação MTI e ANTES das assinaturas do atendimento. Seção Assinaturas.'
  }
}

// ——— DEMCLI / DEMPAR ———
for (const [formId, pfx, secs] of [
  [
    'form-patlasv4-proto-demanda-portal-cliente',
    'demcli',
    {
      andamento: 'sec-demcli-andamento',
      solicitacao: 'sec-demcli-solicitacao',
      sla: 'sec-demcli-sla',
      fila: 'sec-demcli-fila',
      atendimento: 'sec-demcli-atendimento',
      assinaturas: 'sec-demcli-assinaturas',
      os: 'sec-demcli-os-orc',
    },
  ],
  [
    'form-patlasv4-proto-demanda-portal-parceiro',
    'dempar',
    {
      andamento: 'sec-dempar-andamento',
      solicitacao: 'sec-dempar-solicitacao',
      sla: 'sec-dempar-sla',
      fila: 'sec-dempar-fila',
      atendimento: 'sec-dempar-atendimento',
      assinaturas: 'sec-dempar-assinaturas',
      os: 'sec-dempar-os-orc',
    },
  ],
]) {
  const f = forms.find((x) => x.id === formId)
  if (!f) throw new Error(formId + ' missing')

  ensureSection(
    f,
    { id: secs.solicitacao, title: 'Dados da solicitação', icon: 'edit_note' },
    secs.andamento,
  )
  ensureSection(f, { id: secs.sla, title: 'SLA', icon: 'timer' }, secs.solicitacao)

  const id = (suf) => `patlasv4proto-${pfx}-${suf}`

  for (const suf of [
    'cliente',
    'contato',
    'contato-cpf',
    'contato-email',
    'contato-numero',
    'contato-sec',
    'produto',
    'contrato-numero',
    'descricao',
    'observacoes',
    'anexos',
  ]) {
    const field = (f.fields || []).find((x) => x.id === id(suf))
    if (field) {
      field.sectionId = secs.solicitacao
      console.log(pfx, 'SOL', field.label)
    }
  }

  const contato = (f.fields || []).find((x) => x.id === id('contato'))
  if (contato) contato.label = 'Responsável pela abertura da demanda'
  const dataEv = (f.fields || []).find((x) => x.id === id('data-evento'))
  if (dataEv) dataEv.label = 'Data da solicitação'
  const cliente = (f.fields || []).find((x) => x.id === id('cliente'))
  if (cliente) cliente.label = 'Cliente solicitante'

  const sla = (f.fields || []).find((x) => x.id === id('ref-sla'))
  if (sla) {
    sla.sectionId = secs.sla
    sla.spec =
      'Acompanhamento do SLA (dois relógios). Aba própria. Data da solicitação permanece em Dados da demanda.'
    console.log(pfx, 'SLA →', secs.sla)
  }

  for (const suf of ['parceria', 'parceiro-notificado', 'qualificado', 'contrato-natureza']) {
    const field = (f.fields || []).find((x) => x.id === id(suf))
    if (field) {
      field.sectionId = secs.andamento
      console.log(pfx, 'AND vigente', field.label)
    }
  }

  // ref-contrato stays on andamento as vigente
  const refCtr = (f.fields || []).find((x) => x.id === id('ref-contrato'))
  if (refCtr) {
    refCtr.sectionId = secs.andamento
    refCtr.spec =
      'Contrato vigente (KPI). Definido/ajustado na qualificação MTI. Distinto do nº informado na solicitação.'
  }

  const sn = (f.fields || []).find((x) => x.id === id('service-now'))
  if (sn) {
    sn.sectionId = secs.os
    console.log(pfx, 'SN → os')
  }

  const pat = (f.fields || []).find((x) => x.id === id('patrocinio-autorizado'))
  if (pat) {
    pat.sectionId = secs.assinaturas
    console.log(pfx, 'pat → assinaturas')
  }
}

{
  const f = forms.find((x) => x.id === 'form-patlasv4-proto-demanda-completa')
  console.log('\n=== DEMC andamento ===')
  for (const field of (f.fields || []).filter((x) => x.sectionId === 'sec-demc-andamento')) {
    console.log('-', field.label)
  }
  console.log('\n=== DEMC sla ===')
  for (const field of (f.fields || []).filter((x) => x.sectionId === 'sec-demc-sla')) {
    console.log('-', field.label)
  }
  console.log('\n=== DEMC fila ===')
  for (const field of (f.fields || []).filter((x) => x.sectionId === 'sec-demc-fila')) {
    console.log('-', field.label)
  }
  console.log('\n=== DEMC sections ===')
  for (const s of f.sections) console.log('-', s.id, '|', s.title)
}

fs.writeFileSync(path, JSON.stringify(forms, null, 2) + '\n')
console.log('\nWrote', path)
