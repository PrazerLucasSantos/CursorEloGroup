#!/usr/bin/env node
/**
 * Demanda · Completa:
 * 1) Remove campos que não mapeiam bem (protótipo / duplicados / stubs)
 * 2) Adiciona campos CD faltantes do Consol. §8
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const FORM_ID = 'form-patlasv4-proto-demanda-completa'
const P = 'patlasv4proto-demc-'

const REMOVE_SUFFIXES = [
  'andamento-timeline',
  'andamento-status-leitura',
  'andamento-etapa',
  'andamento-proximo',
  'andamento-caminhos',
  'os', // duplicata de os-numero
  'via-nec',
  'roteamento',
  'definir-pagamento',
  'sn-status',
  'sn-em',
  'sn-id',
  'criado-em',
  'atualizado-em',
  'ultimo-ator',
  'ultima-acao',
  'kpi-saldo',
  'kpi-os-abertas',
  'kpi-provisionado',
  'kpi-consumo',
  'kpi-pct',
  // sobreposição vínculo × status — status fica; refs satélite de termo/raer saem
  // e voltam como CD-110 / CD-123 abaixo
  'ref-termo',
  'ref-raer',
]

function base(partial) {
  return {
    size: 'medium',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'common',
    ...partial,
    id: partial.id.startsWith(P) ? partial.id : `${P}${partial.id}`,
  }
}

function text(id, label, sectionId, spec, extra = {}) {
  return base({ id, label, type: 'text', sectionId, spec, ...extra })
}

function textOpt(id, label, sectionId, options, spec, extra = {}) {
  return base({ id, label, type: 'textOptions', sectionId, options, spec, ...extra })
}

function bool(id, label, sectionId, spec, extra = {}) {
  return base({ id, label, type: 'boolean', sectionId, spec, ...extra })
}

function date(id, label, sectionId, spec, extra = {}) {
  return base({ id, label, type: 'date', sectionId, spec, ...extra })
}

function file(id, label, sectionId, spec, extra = {}) {
  return base({ id, label, type: 'file', sectionId, spec, size: 'large', ...extra })
}

function ref(id, label, sectionId, spec, extra = {}) {
  return base({
    id,
    label,
    type: 'reference',
    sectionId,
    spec,
    linkedFormId: extra.linkedFormId ?? 'form-patlasv4-proto-unidade-organizacional',
    ...extra,
  })
}

const S = {
  andamento: 'sec-demc-andamento',
  ident: 'sec-demc-identificacao',
  nec: 'sec-demc-necessidade',
  fila: 'sec-demc-fila',
  parceiro: 'sec-demc-parceiro',
  analise: 'sec-demc-analise-tipo',
  atend: 'sec-demc-atendimento',
  assina: 'sec-demc-assinaturas',
  entreg: 'sec-demc-entregavel',
  osorc: 'sec-demc-os-orc',
  hist: 'sec-demc-historico',
  vinc: 'sec-demc-vinculos',
  projeto: 'sec-demc-projeto',
  indef: 'sec-demc-indefinidos',
}

/** Campos CD a adicionar (só se ainda não existirem por id). */
function newCdFields() {
  return [
    // Identificação / processo
    text('solicitante', 'Solicitante (CD-004)', S.ident, 'CD-004 — referência a usuário; bloqueado na abertura.', {
      readOnly: true,
      linkedFormId: 'form-patlasv4-proto-pessoa',
      type: 'reference',
    }),
    text('estagio-timeline', 'Estágio na linha do tempo (CD-014)', S.andamento, 'CD-014 — ponto atual do processo.'),
    text(
      'historico-eventos',
      'Histórico da demanda (CD-015)',
      S.hist,
      'CD-015 — coleção de eventos/movimentos. Protótipo: texto estruturado; produção = coleção.',
      { size: 'large', multiple: true },
    ),
    text('ultimo-evento', 'Último evento (CD-016)', S.hist, 'CD-016 — movimento mais recente.'),

    // Contrato
    ref('contratada', 'Contratada (CD-020)', S.nec, 'CD-020 — parte contratada.'),
    text('vigencia-contrato', 'Vigência do contrato (CD-021)', S.nec, 'CD-021 — período; limita vigência máxima da OS.'),
    text('descricao-contrato', 'Descrição do contrato (CD-022)', S.nec, 'CD-022 — conteúdo descritivo contratado.', {
      size: 'large',
    }),
    text('valor-global', 'Valor global do contrato (CD-023)', S.nec, 'CD-023 — monetário; rótulo a confirmar.'),
    text('saldo-global', 'Saldo global do contrato (CD-024)', S.nec, 'CD-024 — unidade e fórmula em PD16.'),
    text('os-abertas', 'OS abertas / S aberto (CD-025)', S.nec, 'CD-025 — indicador; rótulo em PD01.'),
    text('total-provisionado', 'Total provisionado (CD-026)', S.nec, 'CD-026 — conceito/cálculo pendentes.'),
    text('consumo-contrato', 'Consumo até o momento (CD-027)', S.nec, 'CD-027 — consumo relacionado ao contrato.'),
    text('pct-execucao-contratual', '% execução contratual (CD-028)', S.nec, 'CD-028 — fórmula pendente.'),
    text('execucao-acumulada', 'Execução acumulada / continuada (CD-029)', S.nec, 'CD-029 — indicador com divergência de reconhecimento.'),
    ref('contrato-patrocinador', 'Contrato patrocinador (CD-030)', S.nec, 'CD-030 — cobertura ao beneficiário.', {
      linkedFormId: 'form-patlasv4-proto-contrato',
    }),
    ref('org-patrocinadora', 'Organização patrocinadora (CD-031)', S.nec, 'CD-031 — quem financia o atendimento.'),
    text(
      'autorizacao-patrocinador',
      'Autorização do patrocinador (CD-032)',
      S.nec,
      'CD-032 — formalizar pagamento por outro órgão.',
    ),
    text(
      'eventos-contrato',
      'Eventos do contrato (CD-033)',
      S.nec,
      'CD-033 — aditivos, supressão e demais eventos.',
      { size: 'large', multiple: true },
    ),

    // Catálogo / atendimento
    text('parceria', 'Parceria (CD-035)', S.nec, 'CD-035 — referência cadastral da parceria.'),
    text('objeto-n2', 'Objeto N2 do contrato (CD-039)', S.nec, 'CD-039 — classificação; PD02.'),
    textOpt(
      'modalidade-servico',
      'Modalidade do serviço (CD-041)',
      S.analise,
      ['Com projeto', 'Sem projeto'],
      'CD-041 — condicional a serviço.',
    ),
    text(
      'manifestacao-parceiro',
      'Manifestação do parceiro (CD-043)',
      S.parceiro,
      'CD-043 — concordância, início ou atendimento conforme etapa.',
      { size: 'large' },
    ),
    text(
      'deliberacao-mti',
      'Deliberação da MTI (CD-044)',
      S.atend,
      'CD-044 — decisão final pertinente na análise.',
      { size: 'large' },
    ),
    text(
      'motivo-rejeicao',
      'Motivo da rejeição (CD-046)',
      S.atend,
      'CD-046 — justificar rejeição; abrangência a validar.',
      { size: 'large' },
    ),
    text('saldo-contabilizar', 'Saldo a contabilizar (CD-048)', S.atend, 'CD-048 — fórmula pendente.'),

    // Papéis / org
    ref('org-usuario', 'Organização do usuário (CD-049)', S.fila, 'CD-049 — relacionar usuário e organização.'),
    textOpt(
      'tipo-organizacao',
      'Tipo da organização (CD-050)',
      S.fila,
      ['Cliente', 'Parceiro', 'MTI', 'Outro'],
      'CD-050 — reconhecer org cliente na aprovação.',
    ),
    text('cargo-usuario', 'Cargo do usuário (CD-051)', S.fila, 'CD-051 — gestor, fiscal, gerente e demais papéis.'),
    text('nivel-solicitante', 'Nível do solicitante (CD-052)', S.ident, 'CD-052 — cenário nível 2; PD02.'),
    ref('gestor-cliente', 'Gestor do cliente (CD-053)', S.assina, 'CD-053 — aprovações e assinaturas.', {
      linkedFormId: 'form-patlasv4-proto-pessoa',
    }),
    ref('fiscal-cliente', 'Fiscal do cliente (CD-054)', S.assina, 'CD-054 — aprovações e assinaturas.', {
      linkedFormId: 'form-patlasv4-proto-pessoa',
    }),
    text('gerente-area', 'Gerente da área / operação (CD-056)', S.fila, 'CD-056 — etapas operacionais; PD08.'),
    textOpt(
      'indisponibilidade',
      'Indisponibilidade / férias (CD-060)',
      S.fila,
      ['Disponível', 'Férias', 'Afastado', 'Outro'],
      'CD-060 — necessidade de substituição.',
    ),
    text('pos-venda', 'Responsável de pós-venda (CD-062)', S.fila, 'CD-062 — designação gerencial no pós-venda.'),

    // Orçamento / OS
    text(
      'detalhamento-orcamento',
      'Detalhamento do orçamento (CD-064)',
      S.osorc,
      'CD-064 — serviços, quantitativos e parâmetros.',
      { size: 'large' },
    ),
    text('qtd-solicitada', 'Quantidade solicitada (CD-065)', S.osorc, 'CD-065 — volume pedido.'),
    text('qtd-autorizada-os', 'Quantidade autorizada na OS (CD-066)', S.osorc, 'CD-066 — volume autorizado.'),
    textOpt(
      'decisao-cliente-orcamento',
      'Decisão do cliente no orçamento (CD-068)',
      S.osorc,
      ['Aceite', 'Desistência', 'Encaminhado', 'Pendente'],
      'CD-068 — aceite, desistência e encaminhamento.',
    ),
    textOpt(
      'forma-pagamento',
      'Forma de pagamento / viabilização (CD-069)',
      S.osorc,
      ['Contrato', 'Indenização', 'Nova contratação', 'A confirmar'],
      'CD-069 — cenário sem cobertura contratual plena.',
    ),
    textOpt(
      'situacao-definir-pagar',
      'Situação a definir como pagar (CD-070)',
      S.osorc,
      ['Ainda não definido', 'Em análise', 'Definido'],
      'CD-070 — ausência de definição de cobertura; nome pendente.',
    ),
    text(
      'proposta-nova-contratacao',
      'Proposta de nova contratação (CD-071)',
      S.osorc,
      'CD-071 — encaminhar ao fluxo comercial.',
    ),
    text('obs-os', 'Observação da OS (CD-074)', S.osorc, 'CD-074 — observações na emissão.', { size: 'large' }),
    text('vigencia-os', 'Vigência da OS (CD-075)', S.osorc, 'CD-075 — dentro da vigência contratual.'),
    text('saldo-os', 'Saldo da OS (CD-076)', S.osorc, 'CD-076 — disponibilidade; fórmula PD16.'),
    text('prazo-os', 'Prazo de execução da OS (CD-078)', S.osorc, 'CD-078 — prazo declarado do atendimento.'),
    bool(
      'autorizacao-execucao',
      'Autorização de execução (CD-079)',
      S.osorc,
      'CD-079 — liberar operacionalmente a execução no Atlas.',
    ),
    text(
      'eventos-os',
      'Eventos e aditivos da OS (CD-080)',
      S.osorc,
      'CD-080 — mudanças e renovação.',
      { size: 'large', multiple: true },
    ),
    text('os-anterior', 'OS anterior / histórico de versões (CD-081)', S.osorc, 'CD-081 — ordens anteriores após substituição.'),
    bool(
      'ateste-substituicao-os',
      'Ateste da substituição da OS (CD-082)',
      S.osorc,
      'CD-082 — ciência/concordância da equipe e parceiro.',
    ),

    // Licenciamento / projeto
    ref('fabricante', 'Fabricante envolvido (CD-083)', S.analise, 'CD-083 — quem pode ser acionado no licenciamento.'),
    text('credencial-acesso', 'Credencial de acesso (CD-084)', S.entreg, 'CD-084 — forma em PD19.'),
    text('appliance', 'Appliance disponibilizado (CD-085)', S.entreg, 'CD-085 — recurso/equipamento.'),
    file(
      'outro-comprovante',
      'Outro comprovante de disponibilização (CD-086)',
      S.entreg,
      'CD-086 — evidenciar ativação/entrega.',
      { multiple: true },
    ),
    text('projeto', 'Projeto relacionado (CD-087)', S.projeto, 'CD-087 — execução, contrato, OS e demanda.'),
    text('epicos', 'Épicos (CD-088)', S.projeto, 'CD-088 — estrutura do projeto.', { multiple: true, size: 'large' }),
    text('historias', 'Histórias (CD-089)', S.projeto, 'CD-089 — detalhar trabalho.', { multiple: true, size: 'large' }),
    text('qtd-historias', 'Quantidade de histórias (CD-090)', S.projeto, 'CD-090 — quantitativo previsto.'),
    text('sprints', 'Sprints (CD-091)', S.projeto, 'CD-091 — ciclos de execução.', { multiple: true }),
    text('atividades', 'Atividades (CD-092)', S.projeto, 'CD-092 — execução e comprovação.', {
      multiple: true,
      size: 'large',
    }),
    text('quantitativos-servicos', 'Quantitativos de serviços (CD-093)', S.projeto, 'CD-093 — dimensionar serviços.'),
    textOpt(
      'status-andamento-exec',
      'Status do andamento (execução) (CD-094)',
      S.projeto,
      ['Não iniciado', 'Em andamento', 'Parado', 'Concluído'],
      'CD-094 — estado da execução por integração.',
    ),
    text('pct-execucao-projeto', '% execução do projeto (CD-095)', S.projeto, 'CD-095 — progresso.'),
    text('prazos-previsao', 'Prazos e previsão de conclusão (CD-096)', S.projeto, 'CD-096 — expectativa de conclusão.'),

    // SLA / assinaturas
    text('prazo-declarado', 'Prazo declarado (CD-098)', S.andamento, 'CD-098 — tempo previsto de atendimento.'),
    date('sla-fim', 'Finalização da contagem SLA (CD-099)', S.andamento, 'CD-099 — término da medição; PD15.'),
    text('tempo-total-sla', 'Tempo total apurado (CD-101)', S.andamento, 'CD-101 — totalizador ao término.'),
    text(
      'sla-assinatura-orcamento',
      'SLA da assinatura do orçamento (CD-102)',
      S.andamento,
      'CD-102 — tempo da formalização do orçamento.',
    ),
    text(
      'assinantes',
      'Assinantes envolvidos (CD-103)',
      S.assina,
      'CD-103 — participantes previstos por artefato.',
      { multiple: true },
    ),
    textOpt(
      'status-assinatura-individual',
      'Status individual da assinatura (CD-105)',
      S.assina,
      ['Pendente', 'Assinado', 'Devolvido', 'Recusado'],
      'CD-105 — situação de cada participante (resumo).',
    ),
    text(
      'responsavel-assinatura-pendente',
      'Responsável pela assinatura pendente (CD-106)',
      S.assina,
      'CD-106 — com quem está o documento.',
    ),
    bool('conclusao-assinaturas', 'Conclusão das assinaturas (CD-107)', S.assina, 'CD-107 — conjunto previsto concluído.'),
    text(
      'dilacao-evento',
      'Dilação de prazo (evento) (CD-108)',
      S.osorc,
      'CD-108 — formalizar mudança de prazo (além do flag).',
      { size: 'large' },
    ),
    text(
      'autorizacoes-dilacao',
      'Autorizações da dilação (CD-109)',
      S.osorc,
      'CD-109 — concordância das partes.',
      { multiple: true },
    ),

    // Entrega / homologação
    text(
      'termo-homologacao',
      'Termo de homologação (CD-110)',
      S.entreg,
      'CD-110 — consolidar entrega, comprovação e formalização.',
    ),
    text(
      'itens-os-termo',
      'Itens da OS no termo (CD-112)',
      S.entreg,
      'CD-112 — relacionar entrega ao autorizado.',
      { multiple: true, size: 'large' },
    ),
    text(
      'atividades-executadas',
      'Atividades executadas (CD-114)',
      S.entreg,
      'CD-114 — o que foi realizado.',
      { size: 'large' },
    ),
    file('artefatos-entrega', 'Artefatos da entrega (CD-115)', S.entreg, 'CD-115 — modelagem, requisitos, protótipos…', {
      multiple: true,
    }),
    text('consumo-estimado', 'Consumo estimado (CD-117)', S.entreg, 'CD-117 — previsão de referência.'),
    text('consumo-realizado', 'Consumo realizado (CD-118)', S.entreg, 'CD-118 — efetivamente consumido.'),
    text('ateste-execucao', 'Ateste da execução (CD-119)', S.entreg, 'CD-119 — como a realização foi verificada.'),
    text('evolucao-projeto', 'Evolução do projeto (CD-120)', S.entreg, 'CD-120 — apoiar avaliação do serviço entregue.', {
      size: 'large',
    }),
    text(
      'historico-alteracoes',
      'Histórico de alterações (CD-122)',
      S.hist,
      'CD-122 — preservar mudanças nos registros relacionados.',
      { size: 'large', multiple: true },
    ),
    text('raer-documento', 'RAE / RAER (documento) (CD-123)', S.entreg, 'CD-123 — artefato; definição em PD23.'),

    // Indefinidos Consol.
    text('nec', 'NEC (CD-124)', S.indef, 'CD-124 — [PROVISÓRIO] termo sem definição completa na Consol.'),
    text('status-iccu', 'Status do ICCU / issue (CD-125)', S.indef, 'CD-125 — entidade/rótulo não esclarecidos.'),
    text(
      'satisfacao-usuario',
      'Indicador de satisfação do usuário (CD-126)',
      S.indef,
      'CD-126 — escala/coleta não definidas.',
    ),
    text(
      'qtd-propostas-contratacao',
      'Quantidade de propostas em contratação (CD-127)',
      S.indef,
      'CD-127 — painel; fórmula pendente.',
    ),
    text(
      'capacidade-ociosa',
      'Capacidade ociosa do profissional (CD-128)',
      S.indef,
      'CD-128 — evolução futura; sem aprovação do mecanismo.',
    ),
    text(
      'atividades-nova-contratacao',
      'Registro de atividades da nova contratação (CD-129)',
      S.indef,
      'CD-129 — acompanhamento comercial/CRM.',
      { size: 'large' },
    ),
  ]
}

const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
const form = forms.find((x) => x.id === FORM_ID)
if (!form) {
  console.error('Form not found')
  process.exit(1)
}

const removeIds = new Set(REMOVE_SUFFIXES.map((s) => `${P}${s}`))

// Preservar observação do mapa (estava no timeline) → status
const timeline = form.fields.find((f) => f.id === `${P}andamento-timeline`)
const statusField = form.fields.find((f) => f.id === `${P}status`)
if (timeline?.spec && statusField) {
  const block = timeline.spec.trim()
  if (block && !(statusField.spec || '').includes('Fluxo Demanda F3')) {
    statusField.spec = `${(statusField.spec || '').trim()}\n\n${block}`.trim()
  }
}

// Renomear labels que ficam e alinhar a CD
const renames = {
  [`${P}homolog-status`]: {
    label: 'Status do termo (CD-111)',
    specExtra: 'CD-111 — não iniciado, aguardando, recusado, formalizado.',
  },
  [`${P}motivo`]: {
    label: 'Motivo da devolução (CD-045)',
    specExtra: 'CD-045 — obrigatório ao devolver. Rejeição: ver CD-046.',
  },
  [`${P}assina-em`]: {
    label: 'Assinaturas concluídas em (CD-107·marco)',
  },
  [`${P}dilatacao`]: {
    label: 'Dilatação de prazo · flag (CD-108)',
  },
  [`${P}raer-status`]: {
    label: 'Status do RAER',
    specExtra: 'Complementa CD-123 (documento).',
  },
  [`${P}entregavel-desc`]: {
    label: 'Declaração do entregue (CD-113)',
  },
  [`${P}comp-anexos`]: {
    label: 'Anexos de comprovação (CD-116)',
  },
  [`${P}homolog-ajuste`]: {
    label: 'Solicitação de ajuste do termo (CD-121)',
  },
  [`${P}os-numero`]: {
    label: 'Número da OS (CD-073)',
  },
  [`${P}orc-numero`]: {
    label: 'Orçamento relacionado (CD-063)',
  },
}
for (const [id, meta] of Object.entries(renames)) {
  const field = form.fields.find((f) => f.id === id)
  if (!field) continue
  field.label = meta.label
  if (meta.specExtra) {
    const prev = (field.spec || '').trim()
    if (!prev.includes(meta.specExtra.slice(0, 12))) {
      field.spec = prev ? `${meta.specExtra}\n\n${prev}` : meta.specExtra
    }
  }
}

form.fields = form.fields.filter((f) => !removeIds.has(f.id))

// Seções novas
const sectionIds = new Set(form.sections.map((s) => s.id))
if (!sectionIds.has(S.projeto)) {
  form.sections.push({
    id: S.projeto,
    title: 'Projeto / serviço (CD-087…096)',
  })
}
if (!sectionIds.has(S.indef)) {
  form.sections.push({
    id: S.indef,
    title: 'Informações sem definição completa (CD-124…129)',
  })
}

// Renomear seções
for (const s of form.sections) {
  if (s.id === S.parceiro) s.title = 'Parceiro'
  if (s.id === S.osorc) s.title = 'OS / Orçamento'
  if (s.id === S.hist) s.title = 'Histórico e eventos'
  if (s.id === S.vinc) s.title = 'Vínculos (Orçamento · OS)'
  if (s.id === S.andamento) s.title = 'SLA e andamento'
}

const existing = new Set(form.fields.map((f) => f.id))
let added = 0
for (const field of newCdFields()) {
  if (existing.has(field.id)) continue
  form.fields.push(field)
  existing.add(field.id)
  added++
}

// Visibilidade: remover regra do stub; apontar CD-069/070
form.fieldVisibilityRules = (form.fieldVisibilityRules || []).filter(
  (r) => r.id !== 'rule-demc-fluxo-definir-pagamento',
)
form.fieldVisibilityRules.push(
  {
    id: 'rule-demc-fluxo-forma-pagamento',
    operator: 'eq',
    sourceFieldId: `${P}contrato-natureza`,
    sourceKind: 'textOptions',
    expectedOptionText: 'Sem contrato',
    action: 'show',
    targetFieldIds: [`${P}forma-pagamento`, `${P}situacao-definir-pagar`, `${P}proposta-nova-contratacao`],
  },
  {
    id: 'rule-demc-tipo-servico-modalidade',
    operator: 'eq',
    sourceFieldId: `${P}tipo-analise`,
    sourceKind: 'textOptions',
    expectedOptionText: 'Serviço',
    action: 'show',
    targetFieldIds: [`${P}modalidade-servico`, `${P}prazo-execucao`],
  },
  {
    id: 'rule-demc-tipo-licenciamento-campos',
    operator: 'eq',
    sourceFieldId: `${P}tipo-analise`,
    sourceKind: 'textOptions',
    expectedOptionText: 'Licenciamento',
    action: 'show',
    targetFieldIds: [
      `${P}entregavel-forma`,
      `${P}fabricante`,
      `${P}credencial-acesso`,
      `${P}appliance`,
      `${P}outro-comprovante`,
    ],
  },
)

// Limpar presets de IDs removidos
for (const preset of form.exampleValuePresets || []) {
  if (!preset.fieldValues && !preset.values) continue
  const bag = preset.fieldValues || preset.values
  for (const id of removeIds) delete bag[id]
}

// Atualizar regra tipo-servico antiga (só prazo) — já coberta pela nova; remover duplicata
form.fieldVisibilityRules = form.fieldVisibilityRules.filter((r) => r.id !== 'rule-demc-tipo-servico')
// Manter rule-demc-tipo-licenciamento antiga? Agora há regra ampliada — remover a antiga curta
form.fieldVisibilityRules = form.fieldVisibilityRules.filter((r) => r.id !== 'rule-demc-tipo-licenciamento')

fs.writeFileSync(FORMS, `${JSON.stringify(forms, null, 2)}\n`)
console.log(
  `OK: removed ${removeIds.size} ids; added ${added}; fields now ${form.fields.length}; sections ${form.sections.length}; vis ${form.fieldVisibilityRules.length}`,
)
