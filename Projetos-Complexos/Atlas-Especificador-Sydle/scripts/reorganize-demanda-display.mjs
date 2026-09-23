/**
 * Reorganiza exibição profissional da classe Demanda (ex-Completa)
 * no épico Atlas Protótipo + renomeia para "Demanda".
 */
import fs from 'fs'

const FORMS_PATH = 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json'
const GROUPS_PATH = 'data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const form = forms.find((f) => f.id === 'form-patlasv4-proto-demanda-completa')
if (!form) throw new Error('form not found')

form.name = 'Demanda'
form.defaultCanvasMode = 'read'
form.sectionLayout = 'tabs'
form.metadata =
  'Classe Demanda F3 (MTI · Projeto Atlas). Abas alinhadas ao portal: dados da demanda (códigos/sistema), dados da solicitação (abertura), SLA, contrato/solução, responsáveis, atendimento, assinaturas, entregável/RAER, OS/orçamento. Consumo: N2 gestor∥fiscal → MTI → parceiro propositivo → deliberação → via contrato|orçamento|sem cobertura → OS Global|Dedicada → SN → termo L02/L03. Suporte = backlog F3.'

/** Ordem e definição das abas (SLA/contrato/responsáveis fundidos em Dados da demanda). */
form.sections = [
  { id: 'sec-demc-andamento', title: 'Dados da demanda', icon: 'badge' },
  { id: 'sec-demc-solicitacao', title: 'Dados da solicitação', icon: 'edit_note' },
  { id: 'sec-demc-atendimento', title: 'Atendimento', icon: 'assignment' },
  { id: 'sec-demc-assinaturas', title: 'Assinaturas via contrato', icon: 'draw' },
  { id: 'sec-demc-entregavel', title: 'Entregável / homologação / RAER', icon: 'verified' },
  { id: 'sec-demc-os-orc', title: 'OS / Orçamento', icon: 'receipt_long' },
  { id: 'sec-demc-historico', title: 'Histórico e eventos', icon: 'history' },
  { id: 'sec-demc-vinculos', title: 'Vínculos (Orçamento · OS)', icon: 'account_tree' },
  { id: 'sec-demc-projeto', title: 'Projeto / serviço', icon: 'account_tree' },
]

const byId = Object.fromEntries(form.fields.map((f) => [f.id, f]))

function patch(id, props) {
  const f = byId[id]
  if (!f) {
    console.warn('missing field', id)
    return
  }
  Object.assign(f, props)
}

function ensure(def) {
  if (byId[def.id]) {
    Object.assign(byId[def.id], def)
    return
  }
  form.fields.push(def)
  byId[def.id] = def
}

// ——— Dados da demanda (códigos / sistema) ———
patch('patlasv4proto-demc-numero', {
  sectionId: 'sec-demc-andamento',
  label: 'Número',
  size: 'small',
  relevance: 'identity',
  readOnly: true,
  required: true,
})
patch('patlasv4proto-demc-tipo', {
  sectionId: 'sec-demc-andamento',
  label: 'Tipo',
  size: 'small',
  relevance: 'highlight',
  readOnly: true,
  required: true,
})
patch('patlasv4proto-demc-status', {
  sectionId: 'sec-demc-andamento',
  label: 'Status',
  size: 'small',
  relevance: 'highlight',
  readOnly: false,
  required: true,
})
patch('patlasv4proto-demc-origem', {
  sectionId: 'sec-demc-andamento',
  label: 'Origem',
  size: 'small',
  relevance: 'common',
  readOnly: true,
  required: true,
})
patch('patlasv4proto-demc-data-evento', {
  sectionId: 'sec-demc-andamento',
  label: 'Data da solicitação',
  size: 'small',
  relevance: 'common',
  readOnly: true,
  required: false,
})
ensure({
  id: 'patlasv4proto-demc-atualizado-em',
  label: 'Atualizado em',
  type: 'text',
  size: 'small',
  relevance: 'common',
  readOnly: true,
  required: false,
  multiple: false,
  sectionId: 'sec-demc-andamento',
  spec: 'Última atualização da demanda (sistema).',
})
ensure({
  id: 'patlasv4proto-demc-regra-fila',
  label: 'Regra de fila',
  type: 'text',
  size: 'medium',
  relevance: 'common',
  readOnly: true,
  required: false,
  multiple: false,
  sectionId: 'sec-demc-andamento',
  spec: 'Roteamento da fila (sistema).',
})
ensure({
  id: 'patlasv4proto-demc-service-now',
  label: 'ServiceNow',
  type: 'text',
  size: 'medium',
  relevance: 'common',
  readOnly: true,
  required: false,
  multiple: false,
  sectionId: 'sec-demc-andamento',
  spec: 'Situação no ServiceNow (sistema MTI).',
})

// ——— Dados da solicitação ———
patch('patlasv4proto-demc-cliente', {
  sectionId: 'sec-demc-solicitacao',
  label: 'Cliente solicitante',
  size: 'large',
  relevance: 'common',
  readOnly: true,
  required: true,
})
patch('patlasv4proto-demc-contato', {
  sectionId: 'sec-demc-solicitacao',
  label: 'Responsável pela abertura da demanda',
  size: 'medium',
  relevance: 'common',
  readOnly: true,
  required: true,
})
ensure({
  id: 'patlasv4proto-demc-contato-cpf',
  label: 'CPF',
  type: 'text',
  size: 'small',
  relevance: 'common',
  readOnly: true,
  required: false,
  multiple: false,
  sectionId: 'sec-demc-solicitacao',
  spec: 'CPF do responsável pela abertura.',
})
ensure({
  id: 'patlasv4proto-demc-contato-email',
  label: 'E-mail',
  type: 'text',
  size: 'small',
  relevance: 'common',
  readOnly: true,
  required: false,
  multiple: false,
  sectionId: 'sec-demc-solicitacao',
  spec: 'E-mail do responsável pela abertura.',
})
patch('patlasv4proto-demc-contato-numero', {
  sectionId: 'sec-demc-solicitacao',
  label: 'Contato',
  size: 'small',
  relevance: 'common',
  readOnly: true,
})
patch('patlasv4proto-demc-contato-sec', {
  sectionId: 'sec-demc-solicitacao',
  label: 'Contato secundário',
  size: 'medium',
  relevance: 'common',
  required: false,
})
patch('patlasv4proto-demc-produto', {
  sectionId: 'sec-demc-solicitacao',
  label: 'Solução / produto (informado)',
  size: 'medium',
  relevance: 'common',
  required: false,
})
ensure({
  id: 'patlasv4proto-demc-contrato-numero',
  label: 'Contrato (informado)',
  type: 'text',
  size: 'small',
  relevance: 'common',
  readOnly: true,
  required: false,
  multiple: false,
  sectionId: 'sec-demc-solicitacao',
  spec: 'Número do contrato informado na abertura (opcional).',
})
patch('patlasv4proto-demc-descricao', {
  sectionId: 'sec-demc-solicitacao',
  label: 'Descrição da demanda',
  size: 'large',
  relevance: 'common',
  required: true,
  textLong: true,
})
patch('patlasv4proto-demc-observacoes', {
  sectionId: 'sec-demc-solicitacao',
  label: 'Observações',
  size: 'large',
  relevance: 'common',
  textLong: true,
})
patch('patlasv4proto-demc-anexos', {
  sectionId: 'sec-demc-solicitacao',
  label: 'Anexos',
  size: 'large',
  relevance: 'common',
})

// ——— SLA / Contrato / Responsáveis → Dados da demanda ———
patch('patlasv4proto-demc-ref-sla', {
  sectionId: 'sec-demc-andamento',
  label: 'SLA',
  size: 'large',
  relevance: 'common',
})

ensure({
  id: 'patlasv4proto-demc-solucao-vigente',
  label: 'Solução / produto',
  type: 'text',
  size: 'medium',
  relevance: 'common',
  readOnly: true,
  required: false,
  multiple: false,
  sectionId: 'sec-demc-andamento',
  spec: 'Solução vigente após qualificação MTI.',
})
patch('patlasv4proto-demc-contrato-natureza', {
  sectionId: 'sec-demc-andamento',
  label: 'Natureza da cobertura',
  size: 'small',
  relevance: 'common',
})
patch('patlasv4proto-demc-ref-contrato', {
  sectionId: 'sec-demc-andamento',
  label: 'Contrato',
  size: 'large',
  relevance: 'common',
})
patch('patlasv4proto-demc-patrocinio-autorizado', {
  sectionId: 'sec-demc-andamento',
  label: 'Patrocínio autorizado',
  size: 'small',
  relevance: 'common',
  readOnly: true,
})

for (const [id, label, size] of [
  ['patlasv4proto-demc-resp-gerente', 'Gerente da parceria', 'medium'],
  ['patlasv4proto-demc-resp-titular', 'Responsável titular', 'medium'],
  ['patlasv4proto-demc-subst-1', 'Substituto 1', 'medium'],
  ['patlasv4proto-demc-subst-2', 'Substituto 2 (gerente)', 'medium'],
]) {
  patch(id, { sectionId: 'sec-demc-andamento', label, size, relevance: 'common' })
}
patch('patlasv4proto-demc-parceria', {
  sectionId: 'sec-demc-andamento',
  label: 'Parceria',
  size: 'medium',
  relevance: 'common',
})
patch('patlasv4proto-demc-modalidade-parceiro', {
  sectionId: 'sec-demc-andamento',
  label: 'Modalidade da parceria',
  size: 'small',
  relevance: 'common',
})
patch('patlasv4proto-demc-parceiro-notificado', {
  sectionId: 'sec-demc-andamento',
  label: 'Parceiro notificado',
  size: 'small',
  relevance: 'common',
  readOnly: true,
})
patch('patlasv4proto-demc-qualificado', {
  sectionId: 'sec-demc-andamento',
  label: 'Qualificado pela MTI',
  size: 'small',
  relevance: 'common',
  readOnly: true,
})

// ——— Atendimento (inclui ex-Análise · tipo) ———
patch('patlasv4proto-demc-tipo-analise', {
  sectionId: 'sec-demc-atendimento',
  label: 'Tipo na análise',
  size: 'small',
  relevance: 'highlight',
})
patch('patlasv4proto-demc-entregavel-forma', {
  sectionId: 'sec-demc-atendimento',
  label: 'Forma do entregável (licenciamento)',
  size: 'medium',
  relevance: 'common',
})
patch('patlasv4proto-demc-prazo-execucao', {
  sectionId: 'sec-demc-atendimento',
  label: 'Prazo de execução',
  size: 'small',
  relevance: 'common',
})
patch('patlasv4proto-demc-modalidade-servico', {
  sectionId: 'sec-demc-atendimento',
  size: 'small',
  relevance: 'common',
})
patch('patlasv4proto-demc-fabricante', {
  sectionId: 'sec-demc-atendimento',
  size: 'medium',
  relevance: 'common',
})
patch('patlasv4proto-demc-catalogos', {
  sectionId: 'sec-demc-atendimento',
  size: 'large',
  relevance: 'common',
})
patch('patlasv4proto-demc-solucao-catalogo', {
  sectionId: 'sec-demc-atendimento',
  size: 'medium',
  relevance: 'common',
})
patch('patlasv4proto-demc-itens', {
  sectionId: 'sec-demc-atendimento',
  size: 'large',
  relevance: 'common',
})
patch('patlasv4proto-demc-desc-atendimento', {
  sectionId: 'sec-demc-atendimento',
  size: 'large',
  relevance: 'common',
  textLong: true,
})
patch('patlasv4proto-demc-via-valores', {
  sectionId: 'sec-demc-atendimento',
  size: 'large',
  relevance: 'common',
  textLong: true,
})
patch('patlasv4proto-demc-deliberacao-mti', {
  sectionId: 'sec-demc-atendimento',
  size: 'medium',
  relevance: 'highlight',
})
patch('patlasv4proto-demc-motivo', {
  sectionId: 'sec-demc-atendimento',
  size: 'large',
  relevance: 'common',
  textLong: true,
})
patch('patlasv4proto-demc-motivo-rejeicao', {
  sectionId: 'sec-demc-atendimento',
  size: 'large',
  relevance: 'common',
  textLong: true,
})
patch('patlasv4proto-demc-saldo-contabilizar', {
  sectionId: 'sec-demc-atendimento',
  size: 'small',
  relevance: 'common',
})

// Assinaturas — tamanhos compactos
patch('patlasv4proto-demc-gestor-cliente', {
  sectionId: 'sec-demc-assinaturas',
  size: 'medium',
  relevance: 'common',
})
patch('patlasv4proto-demc-fiscal-cliente', {
  sectionId: 'sec-demc-assinaturas',
  size: 'medium',
  relevance: 'common',
})
for (const id of [
  'patlasv4proto-demc-assina-gestor',
  'patlasv4proto-demc-assina-fiscal',
  'patlasv4proto-demc-assina-solicitante',
  'patlasv4proto-demc-conclusao-assinaturas',
]) {
  patch(id, { sectionId: 'sec-demc-assinaturas', size: 'small', relevance: 'common' })
}
patch('patlasv4proto-demc-assina-em', {
  sectionId: 'sec-demc-assinaturas',
  label: 'Assinaturas concluídas em',
  size: 'small',
  relevance: 'common',
  readOnly: true,
})

// OS modelo highlight
patch('patlasv4proto-demc-tipo-os', {
  sectionId: 'sec-demc-os-orc',
  label: 'Modelo OS (Global × Dedicada)',
  size: 'small',
  relevance: 'highlight',
})

// Vínculos
patch('patlasv4proto-demc-ref-orcamentos', {
  sectionId: 'sec-demc-vinculos',
  size: 'large',
  relevance: 'highlight',
})
patch('patlasv4proto-demc-ref-oses', {
  sectionId: 'sec-demc-vinculos',
  size: 'large',
  relevance: 'highlight',
})

// Histórico
patch('patlasv4proto-demc-historico-eventos', {
  sectionId: 'sec-demc-historico',
  size: 'large',
  relevance: 'common',
  textLong: true,
})
patch('patlasv4proto-demc-historico-alteracoes', {
  sectionId: 'sec-demc-historico',
  size: 'large',
  relevance: 'common',
  textLong: true,
})

// Projeto — advanced (menos ruído na leitura operacional)
for (const f of form.fields) {
  if (f.sectionId === 'sec-demc-projeto') f.relevance = 'advanced'
}

// Ordem estável por aba + ordem canônica dentro da aba
const orderInSection = {
  'sec-demc-andamento': [
    'patlasv4proto-demc-numero',
    'patlasv4proto-demc-tipo',
    'patlasv4proto-demc-status',
    'patlasv4proto-demc-origem',
    'patlasv4proto-demc-data-evento',
    'patlasv4proto-demc-atualizado-em',
    'patlasv4proto-demc-regra-fila',
    'patlasv4proto-demc-service-now',
    'patlasv4proto-demc-solucao-vigente',
    'patlasv4proto-demc-contrato-natureza',
    'patlasv4proto-demc-ref-contrato',
    'patlasv4proto-demc-patrocinio-autorizado',
    'patlasv4proto-demc-ref-sla',
    'patlasv4proto-demc-resp-gerente',
    'patlasv4proto-demc-resp-titular',
    'patlasv4proto-demc-subst-1',
    'patlasv4proto-demc-subst-2',
    'patlasv4proto-demc-parceria',
    'patlasv4proto-demc-modalidade-parceiro',
    'patlasv4proto-demc-parceiro-notificado',
    'patlasv4proto-demc-qualificado',
  ],
  'sec-demc-solicitacao': [
    'patlasv4proto-demc-cliente',
    'patlasv4proto-demc-contato',
    'patlasv4proto-demc-contato-cpf',
    'patlasv4proto-demc-contato-email',
    'patlasv4proto-demc-contato-numero',
    'patlasv4proto-demc-contato-sec',
    'patlasv4proto-demc-produto',
    'patlasv4proto-demc-contrato-numero',
    'patlasv4proto-demc-descricao',
    'patlasv4proto-demc-observacoes',
    'patlasv4proto-demc-anexos',
  ],
  'sec-demc-atendimento': [
    'patlasv4proto-demc-tipo-analise',
    'patlasv4proto-demc-entregavel-forma',
    'patlasv4proto-demc-prazo-execucao',
    'patlasv4proto-demc-modalidade-servico',
    'patlasv4proto-demc-fabricante',
    'patlasv4proto-demc-catalogos',
    'patlasv4proto-demc-solucao-catalogo',
    'patlasv4proto-demc-itens',
    'patlasv4proto-demc-desc-atendimento',
    'patlasv4proto-demc-via-valores',
    'patlasv4proto-demc-deliberacao-mti',
    'patlasv4proto-demc-saldo-contabilizar',
    'patlasv4proto-demc-motivo',
    'patlasv4proto-demc-motivo-rejeicao',
  ],
}

const sectionOrder = form.sections.map((s) => s.id)
form.fields.sort((a, b) => {
  const ia = sectionOrder.indexOf(a.sectionId)
  const ib = sectionOrder.indexOf(b.sectionId)
  if (ia !== ib) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
  const oa = orderInSection[a.sectionId] || []
  const ob = orderInSection[b.sectionId] || []
  const pa = oa.indexOf(a.id)
  const pb = ob.indexOf(b.id)
  return (pa < 0 ? 999 : pa) - (pb < 0 ? 999 : pb)
})

// Status options completeness
const status = byId['patlasv4proto-demc-status']
if (status?.options) {
  for (const s of [
    'Aguardando cadastro gestor/fiscal',
    'Proposta parceiro · aguardando MTI',
    'Aguardando autorização patrocinador',
    'Sem cobertura · definir pagamento',
  ]) {
    if (!status.options.includes(s)) status.options.push(s)
  }
}

fs.writeFileSync(FORMS_PATH, JSON.stringify(forms, null, 2) + '\n')

// class-groups rename
const groups = JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))
const g = (groups.groups || []).find((x) => x.id === 'grp-atlas-demanda-completa')
if (g) g.name = '[Atlas] Demanda'
fs.writeFileSync(GROUPS_PATH, JSON.stringify(groups, null, 2) + '\n')

// report
console.log('Renamed to:', form.name)
for (const s of form.sections) {
  const n = form.fields.filter((f) => f.sectionId === s.id).length
  const labels = form.fields
    .filter((f) => f.sectionId === s.id)
    .map((f) => f.label)
    .slice(0, 8)
  console.log(`\n${s.title} (${n}): ${labels.join(' · ')}${n > 8 ? '…' : ''}`)
}
