/**
 * Alinha o épico Não é Não às fontes:
 * - Reunião 03/09 (fluxo macro)
 * - Reunião 10/09 (1 serviço; sem denúncia; revogação operacional; sem Sigadoc)
 * - PDF fluxo 04/09 (campos/status in-scope; §§16–19 denúncia FORA)
 *
 * node scripts/align-nnseplag-fontes.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const epicDir = path.join(
  root,
  'data/subprojects/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1',
)

const FORM_AD = 'form-nen-analise-decisao'
const FORM_SOL = 'form-nen-solicitacao'
const FORM_ACESSO = 'form-nen-acesso'
const FORM_SELO = 'form-nen-estabelecimento-selo'
const FORM_REV = 'form-nen-revogacao'
const FORM_REN = 'form-nen-renovacao'
const FORM_CAN = 'form-nen-cancelamento'
const FORM_AJ = 'form-nen-ajustes'

const STATUS_AD = [
  'EM ANÁLISE',
  'EM DILIGÊNCIA',
  'DILIGÊNCIA RESPONDIDA',
  'DILIGÊNCIA NÃO RESPONDIDA',
  'PRONTO PARA DECISÃO',
  'DEFERIDO',
  'INDEFERIDO',
  'EM RECURSO',
  'FINALIZADO',
]

const CHK = [
  ['nen-ad-chk-enquadramento', 'nen-ad-comp-enquadramento', 'Enquadramento'],
  ['nen-ad-chk-equipe', 'nen-ad-comp-equipe', 'Equipe e capacitação'],
  ['nen-ad-chk-sinalizacao', 'nen-ad-comp-sinalizacao', 'Sinalização'],
  ['nen-ad-chk-codigo', 'nen-ad-comp-codigo', 'Sinal / código'],
  ['nen-ad-chk-procedimentos', 'nen-ad-comp-procedimentos', 'Procedimentos'],
  ['nen-ad-chk-cameras', 'nen-ad-comp-cameras', 'Câmeras'],
  ['nen-ad-chk-declaracoes', 'nen-ad-comp-declaracoes', 'Declarações'],
]

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}
function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function field(partial) {
  return {
    size: 'medium',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'normal',
    spec: '',
    ...partial,
  }
}

function showRule(id, status, targetFieldIds) {
  return {
    id,
    operator: 'eq',
    sourceFieldId: 'nen-ad-status',
    sourceKind: 'textOptions',
    expectedOptionText: status,
    action: 'show',
    targetFieldIds,
  }
}

function showWhenChk(id, sourceFieldId, targetFieldId) {
  return {
    id,
    operator: 'eq',
    sourceFieldId,
    sourceKind: 'textOptions',
    expectedOptionText: 'Necessita complementação',
    action: 'show',
    targetFieldIds: [targetFieldId],
  }
}

function method(id, name, icon, kind, statuses, extra = {}) {
  return {
    id,
    name,
    icon,
    kind,
    visibleWhen: { sourceFieldId: 'nen-ad-status', expectedOptionTexts: statuses },
    ...extra,
  }
}

function patchAnalise(form) {
  form.name = 'Análise e Decisão'
  form.metadata =
    'Classe única PROCON (PDF §11–13 + ata 03/09). Status só via métodos. ' +
    'Diligência única 5 dias (Lei 7.692/2002); sem indeferimento automático por ausência de resposta. ' +
    'Deferimento bloqueado se houver item obrigatório «Não conforme» (PDF §22). ' +
    'Denúncia/apuração/fiscalização FORA do sistema (ata 10/09) — revogação operacional na classe Selo.'
  form.sectionLayout = 'tabs'
  form.defaultCanvasMode = 'edit'

  const statusField = form.fields.find((f) => f.id === 'nen-ad-status')
  if (statusField) {
    statusField.options = STATUS_AD
    statusField.readOnly = true
    statusField.relevance = 'highlight'
    statusField.spec = 'Alterado apenas por métodos. Inclui DILIGÊNCIA RESPONDIDA / NÃO RESPONDIDA (PDF §12).'
  }

  // Remove old complement fields if re-running
  form.fields = form.fields.filter((f) => !f.id.startsWith('nen-ad-comp-'))

  const insertAfter = form.fields.findIndex((f) => f.id === 'nen-ad-chk-declaracoes')
  const compFields = CHK.map(([chkId, compId, label]) =>
    field({
      id: compId,
      label: `Complementação — ${label}`,
      type: 'text',
      textLong: true,
      hidden: true,
      sectionId: 'sec-nen-ad-analise',
      required: false,
      spec: 'Obrigatório quando o checklist do bloco estiver «Necessita complementação» (PDF §11).',
    }),
  )
  if (insertAfter >= 0) form.fields.splice(insertAfter + 1, 0, ...compFields)
  else form.fields.push(...compFields)

  // Diligência: pendências consolidadas
  let dil = form.fields.find((f) => f.id === 'nen-ad-alerta-diligencia')
  if (dil) {
    dil.spec =
      'Diligência única: todas as pendências de uma vez. Prazo 5 dias. Suspende contagem do prazo de análise. Sem indeferimento automático se não houver resposta.'
  }
  if (!form.fields.some((f) => f.id === 'nen-ad-pendencias-diligencia')) {
    form.fields.push(
      field({
        id: 'nen-ad-pendencias-diligencia',
        label: 'Pendências da diligência (todas de uma vez)',
        type: 'text',
        textLong: true,
        hidden: true,
        sectionId: 'sec-nen-ad-diligencia',
        spec: 'Lista consolidada enviada ao estabelecimento (diligência única — PDF §12).',
      }),
    )
  }

  const chkIds = CHK.map(([id]) => id)
  const compIds = CHK.map(([, id]) => id)
  const analiseIds = [
    ...chkIds,
    ...compIds,
    'nen-ad-obs-analise',
    'nen-ad-docs-analise',
    'nen-ad-alerta-analise',
  ]
  const diligenciaIds = [
    'nen-ad-prazo-diligencia',
    'nen-ad-alerta-diligencia',
    'nen-ad-ref-diligencia',
    'nen-ad-pendencias-diligencia',
  ]
  const prontoIds = [
    ...analiseIds,
    'nen-ad-parecer',
    'nen-ad-req',
    'nen-ad-legal',
    'nen-ad-alerta-decisao',
  ]

  form.fieldVisibilityRules = [
    showRule('rule-nen-ad-analise', 'EM ANÁLISE', analiseIds),
    showRule('rule-nen-ad-diligencia', 'EM DILIGÊNCIA', diligenciaIds),
    showRule('rule-nen-ad-dil-resp', 'DILIGÊNCIA RESPONDIDA', [...diligenciaIds, ...analiseIds]),
    showRule('rule-nen-ad-dil-nao', 'DILIGÊNCIA NÃO RESPONDIDA', [...diligenciaIds, ...analiseIds]),
    showRule('rule-nen-ad-pronto', 'PRONTO PARA DECISÃO', prontoIds),
    showRule('rule-nen-ad-deferido', 'DEFERIDO', [
      'nen-ad-ref-selo',
      'nen-ad-alerta-deferido',
      'nen-ad-data-decisao',
      'nen-ad-parecer',
    ]),
    showRule('rule-nen-ad-indeferido', 'INDEFERIDO', [
      'nen-ad-alerta-indeferido',
      'nen-ad-data-decisao',
      'nen-ad-parecer',
      'nen-ad-req',
      'nen-ad-legal',
    ]),
    showRule('rule-nen-ad-recurso', 'EM RECURSO', [
      'nen-ad-alerta-recurso',
      'nen-ad-ref-recurso',
      'nen-ad-julgamento',
      'nen-ad-julgamento-fund',
    ]),
    showRule('rule-nen-ad-finalizado', 'FINALIZADO', [
      'nen-ad-alerta-finalizado',
      'nen-ad-parecer',
      'nen-ad-julgamento',
      'nen-ad-julgamento-fund',
      'nen-ad-data-decisao',
    ]),
    ...CHK.map(([chkId, compId], i) => showWhenChk(`rule-nen-ad-comp-${i}`, chkId, compId)),
  ]

  form.methods = [
    method('nen-ad-salvar', 'Salvar', 'save', 'menu', [
      'EM ANÁLISE',
      'EM DILIGÊNCIA',
      'DILIGÊNCIA RESPONDIDA',
      'DILIGÊNCIA NÃO RESPONDIDA',
      'PRONTO PARA DECISÃO',
      'EM RECURSO',
    ]),
    method('nen-ad-diligencia', 'Abrir diligência', 'assignment_late', 'destaque', ['EM ANÁLISE'], {
      inputFormId: FORM_AJ,
      spec: 'Diligência única — todas as pendências. Status → EM DILIGÊNCIA. Notifica estabelecimento (5 dias).',
    }),
    method('nen-ad-enviar-analise', 'Enviar para decisão', 'send', 'destaque', [
      'EM ANÁLISE',
      'DILIGÊNCIA RESPONDIDA',
      'DILIGÊNCIA NÃO RESPONDIDA',
    ], {
      spec: 'Checklist sem «Necessita complementação» aberta. Status → PRONTO PARA DECISÃO. Bloqueia se houver pendência de complementação não convertida em diligência.',
    }),
    method(
      'nen-ad-dil-respondida',
      'Registrar diligência respondida',
      'mark_email_read',
      'destaque',
      ['EM DILIGÊNCIA'],
      { spec: 'Estabelecimento complementou no portal. Status → DILIGÊNCIA RESPONDIDA (PDF §12).' },
    ),
    method(
      'nen-ad-dil-nao-respondida',
      'Registrar diligência não respondida',
      'timer_off',
      'menu',
      ['EM DILIGÊNCIA'],
      {
        spec: 'Prazo expirado sem resposta. Status → DILIGÊNCIA NÃO RESPONDIDA. Segue para decisão com elementos dos autos — sem indeferimento automático.',
      },
    ),
    method('nen-ad-retomar', 'Retomar análise', 'replay', 'destaque', [
      'DILIGÊNCIA RESPONDIDA',
      'DILIGÊNCIA NÃO RESPONDIDA',
    ], { spec: 'Volta para EM ANÁLISE para reavaliar checklist/documentos.' }),
    method('nen-ad-deferir', 'Deferir', 'check_circle', 'destaque', ['PRONTO PARA DECISÃO'], {
      spec: 'Emite Selo VIGENTE + certificado (QR Validador MT). Bloqueado se houver requisito «Não conforme». Status → DEFERIDO.',
    }),
    method('nen-ad-indeferir', 'Indeferir', 'cancel', 'menu', ['PRONTO PARA DECISÃO'], {
      spec: 'Exige parecer, requisitos não atendidos e fundamentos legais + info de recurso. Status → INDEFERIDO.',
    }),
    method('nen-ad-baixar-cert', 'Baixar certificado', 'download', 'destaque', ['DEFERIDO'], {
      inputFormId: FORM_SELO,
      spec: 'Documento a partir do registro de Selo.',
    }),
    method('nen-ad-abrir-recurso', 'Registrar recurso', 'balance', 'destaque', ['INDEFERIDO'], {
      inputFormId: 'form-nen-recurso',
      spec: 'Quando o estabelecimento protocolar recurso no portal. Status → EM RECURSO.',
    }),
    method('nen-ad-julgar-rec', 'Julgar recurso', 'gavel', 'destaque', ['EM RECURSO'], {
      spec: 'Provido → DEFERIDO (+ Selo). Não provido → FINALIZADO.',
    }),
  ]

  // Refresh presets status options for old ones that only had 7 statuses
  for (const p of form.exampleValuePresets || []) {
    const st = p.fieldValues?.['nen-ad-status']
    if (st === 'EM DILIGÊNCIA' && !p.fieldValues['nen-ad-pendencias-diligencia']) {
      p.fieldValues['nen-ad-pendencias-diligencia'] =
        p.fieldValues['nen-ad-ref-diligencia'] || 'Pendências consolidadas da diligência única.'
    }
  }

  // Add presets for diligência respondida / não respondida if missing
  const hasResp = (form.exampleValuePresets || []).some((p) => p.id === 'nen-ad-p-dil-resp')
  if (!hasResp) {
    form.exampleValuePresets = form.exampleValuePresets || []
    form.exampleValuePresets.push(
      {
        id: 'nen-ad-p-dil-resp',
        name: 'DILIGÊNCIA RESPONDIDA — Aurora',
        iconColor: '#0e7490',
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00042',
          'nen-ad-status': 'DILIGÊNCIA RESPONDIDA',
          'nen-ad-empresa': '12.345.678/0001-90 — Aurora Night Club — Cuiabá',
          'nen-ad-analista': 'Ana Paula Souza',
          'nen-ad-data-abertura': '2026-09-10',
          'nen-ad-prazo': 'Retomada após diligência',
          'nen-ad-prazo-diligencia': 'Respondida em 14/09/2026',
          'nen-ad-pendencias-diligencia': 'Foto A3 banheiro feminino — complementada.',
          'nen-ad-ref-solicitacao': '2026/SELO-00042 — Aurora Night Club',
          'nen-ad-ref-diligencia': 'Ajustes — respondidos',
        },
      },
      {
        id: 'nen-ad-p-dil-nao',
        name: 'DILIGÊNCIA NÃO RESPONDIDA — Chapada',
        iconColor: '#a16207',
        fieldValues: {
          'nen-ad-prot': '2026/SELO-00077',
          'nen-ad-status': 'DILIGÊNCIA NÃO RESPONDIDA',
          'nen-ad-empresa': '77.888.999/0001-11 — Bar Chapada — Cáceres',
          'nen-ad-analista': 'Juliana Freitas',
          'nen-ad-data-abertura': '2026-08-15',
          'nen-ad-prazo': 'Prazo de diligência expirado',
          'nen-ad-prazo-diligencia': '5 dias — sem resposta',
          'nen-ad-pendencias-diligencia': 'Equipe, sinalização e procedimentos — sem complementação.',
          'nen-ad-ref-solicitacao': '2026/SELO-00077 — Bar Chapada',
          'nen-ad-parecer': 'Seguir para decisão com elementos dos autos (sem indeferimento automático).',
        },
      },
    )
  }

  return form
}

function patchSolicitacao(form) {
  form.metadata =
    'Formulário do estabelecimento (PDF §§1–10). Protocolar gera nº, data/hora, comprovante e status PROTOCOLADO. ' +
    'Estabelecimento via JUCEMAT (ata 03/09+10/09). Curso fora do sistema — apenas anexos. ' +
    'Câmeras não são requisito; perguntas condicionais se «Sim». % capacitados calculado automaticamente.'

  const specs = {
    'nen-sol-estab':
      'Lista estabelecimentos do CPF autenticado via integração JUCEMAT (MT Login). Um vínculo → auto; vários → seleção. Demais seções só após seleção.',
    'nen-sol-perc':
      'Calculado automaticamente (qtd capacitados / qtd equipe). Regra mínima: ≥2 capacitados; eventos >300 pessoas: % mínimo conforme decreto (confirmar no decreto — PDF cita 10%).',
    'nen-sol-tem-cam':
      'Existência de câmeras NÃO é requisito para concessão. Se Não → pula perguntas. Se Sim → preservação ≥30 dias e acesso legal.',
    'nen-sol-cam-30': 'Visível somente se dispõe de câmeras = Sim. Recusa → não conformidade na análise.',
    'nen-sol-cam-acesso': 'Visível somente se dispõe de câmeras = Sim.',
    'nen-sol-status':
      'RASCUNHO → PROTOCOLADO no envio. Demais status espelham o processo PROCON (análise/diligência/decisão/recurso).',
    'nen-sol-protocolo': 'Gerado na protocolização (número + data/hora).',
  }
  for (const f of form.fields) {
    if (specs[f.id]) f.spec = specs[f.id]
  }

  if (!form.fields.some((f) => f.id === 'nen-sol-doc-rep')) {
    const afterCpf = form.fields.findIndex((f) => f.id === 'nen-sol-cpf')
    const doc = field({
      id: 'nen-sol-doc-rep',
      label: 'Documento de representação (quando necessário)',
      type: 'file',
      sectionId: 'sec-nen-dados',
      spec: 'Comprova poderes de representação do requerente (PDF §1).',
    })
    if (afterCpf >= 0) form.fields.splice(afterCpf + 1, 0, doc)
    else form.fields.push(doc)
  }

  if (!form.fields.some((f) => f.id === 'nen-sol-comprovante')) {
    form.fields.push(
      field({
        id: 'nen-sol-comprovante',
        label: 'Comprovante de protocolização',
        type: 'file',
        sectionId: 'sec-nen-declaracoes',
        readOnly: true,
        hidden: true,
        spec: 'Disponibilizado após Protocolar (PDF §10).',
      }),
    )
  }

  if (!form.fields.some((f) => f.id === 'nen-sol-alerta-regras')) {
    form.fields.push(
      field({
        id: 'nen-sol-alerta-regras',
        label: 'Regras do pedido',
        type: 'alert',
        alertVariant: 'info',
        sectionId: 'sec-nen-dados',
        spec: '',
        demoValue:
          'Obrigatórios bloqueiam o envio. Revise o resumo antes de protocolar. Capacitação: curso fora do sistema (anexar certificados). Integração: MT Login + JUCEMAT.',
      }),
    )
  }

  form.methods = [
    {
      id: 'nen-sol-rascunho',
      name: 'Salvar rascunho',
      icon: 'save',
      kind: 'menu',
      spec: 'Mantém status RASCUNHO.',
    },
    {
      id: 'nen-sol-avancar',
      name: 'Avançar / Revisar',
      icon: 'preview',
      kind: 'destaque',
      spec: 'Exibe resumo de respostas e anexos antes da protocolização (PDF §10). Bloqueia se obrigatórios faltarem.',
    },
    {
      id: 'nen-sol-protocolar',
      name: 'Protocolar solicitação',
      icon: 'send',
      kind: 'destaque',
      spec: 'Gera protocolo, data/hora, comprovante; status → PROTOCOLADO; notifica área PROCON.',
    },
  ]

  // Visibility cameras
  const camRules = [
    {
      id: 'rule-nen-sol-cam',
      operator: 'eq',
      sourceFieldId: 'nen-sol-tem-cam',
      sourceKind: 'textOptions',
      expectedOptionText: 'Sim',
      action: 'show',
      targetFieldIds: ['nen-sol-cam-30', 'nen-sol-cam-acesso'],
    },
  ]
  const existing = form.fieldVisibilityRules || []
  const withoutCam = existing.filter((r) => r.id !== 'rule-nen-sol-cam')
  form.fieldVisibilityRules = [...withoutCam, ...camRules]

  for (const id of ['nen-sol-cam-30', 'nen-sol-cam-acesso']) {
    const f = form.fields.find((x) => x.id === id)
    if (f) f.hidden = true
  }

  return form
}

function patchAcesso(form) {
  form.name = 'Acesso (MT Login + JUCEMAT)'
  form.metadata =
    'Entrada do serviço (PDF §1 + atas). Autenticação MT Login (pessoa física). ' +
    'Empresas do CPF via JUCEMAT. Perfil elegível (sócio/representante/filial) = pendência de negócio. ' +
    'Sem módulo denúncia. Sem integração Sigadoc neste MVP (ata 10/09).'
  form.sectionLayout = 'tabs'
  form.sections = [
    { id: 'sec-nen-acs-ident', title: 'Identificação', icon: 'badge' },
    { id: 'sec-nen-acs-acesso', title: 'Acesso', icon: 'login' },
    { id: 'sec-nen-acs-estab', title: 'Estabelecimento (JUCEMAT)', icon: 'store' },
  ]

  const keepIds = new Set([
    'nen-acs-nome',
    'nen-acs-cpf',
    'nen-acs-email-principal',
    'nen-acs-telefones',
    'nen-acs-login',
    'nen-acs-mtid',
    'nen-acs-ativo-acesso',
    'nen-acs-alerta-acesso',
  ])

  // Ensure CPF field
  if (!form.fields.some((f) => f.id === 'nen-acs-cpf')) {
    form.fields.push(
      field({
        id: 'nen-acs-cpf',
        label: 'CPF',
        type: 'text',
        relevance: 'identity',
        sectionId: 'sec-nen-acs-ident',
        readOnly: true,
        spec: 'Origem MT Login.',
      }),
    )
  }

  // Trim Atlas baggage: hide non-essential by moving to complement section or remove from display
  // Keep structure but strip currículo/atlas-only fields from form for selo
  const essential = []
  for (const f of form.fields) {
    if (f.id === 'nen-acs-nome') {
      essential.push({
        ...f,
        relevance: 'identity',
        sectionId: 'sec-nen-acs-ident',
        spec: 'Nome do responsável autenticado (MT Login).',
      })
    } else if (f.id === 'nen-acs-cpf') {
      essential.push({
        ...f,
        relevance: 'identity',
        sectionId: 'sec-nen-acs-ident',
        readOnly: true,
        spec: 'CPF do MT Login — chave para listar empresas na JUCEMAT.',
      })
    } else if (f.id === 'nen-acs-email-principal') {
      essential.push({ ...f, sectionId: 'sec-nen-acs-ident', spec: 'Contato do responsável.' })
    } else if (f.id === 'nen-acs-login' || f.id === 'nen-acs-mtid') {
      essential.push({ ...f, sectionId: 'sec-nen-acs-acesso', readOnly: true })
    } else if (f.id === 'nen-acs-ativo-acesso') {
      essential.push({ ...f, sectionId: 'sec-nen-acs-acesso', relevance: 'highlight' })
    } else if (f.id === 'nen-acs-alerta-acesso') {
      essential.push({
        ...f,
        sectionId: 'sec-nen-acs-acesso',
        type: 'alert',
        demoValue:
          'Autentique com MT Login. Em seguida selecione o estabelecimento retornado pela JUCEMAT. Documento de representação pode ser exigido conforme regra de elegibilidade (a definir).',
      })
    }
  }

  essential.push(
    field({
      id: 'nen-acs-estab-lista',
      label: 'Estabelecimentos vinculados (JUCEMAT)',
      type: 'textOptions',
      multiple: true,
      sectionId: 'sec-nen-acs-estab',
      relevance: 'identity',
      options: [
        '12.345.678/0001-90 — Aurora Night Club — Cuiabá',
        '98.765.432/0001-10 — Bar Pantanal — Várzea Grande',
        '55.666.777/0001-88 — Hotel Pantanal — Cuiabá',
      ],
      spec: 'Integração JUCEMAT: lista CNPJs do CPF. Seleção vincula o requerimento à unidade.',
    }),
    field({
      id: 'nen-acs-doc-rep',
      label: 'Documento de representação',
      type: 'file',
      sectionId: 'sec-nen-acs-estab',
      spec: 'Quando o requerente não for o legitimado direto (PDF §1).',
    }),
    field({
      id: 'nen-acs-alerta-juce',
      label: 'Integração',
      type: 'alert',
      alertVariant: 'info',
      sectionId: 'sec-nen-acs-estab',
      demoValue:
        'JUCEMAT obrigatória neste serviço. Receita Federal CPF×CNPJ: não implementar agora (mock). Elegibilidade sócio/representante/filial: pendência de negócio.',
    }),
  )

  form.fields = essential
  form.methods = [
    { id: 'nen-acs-entrar', name: 'Entrar (MT Login)', icon: 'login', kind: 'destaque', spec: 'Autenticação oficial do Estado.' },
    {
      id: 'nen-acs-continuar',
      name: 'Continuar para solicitação',
      icon: 'arrow_forward',
      kind: 'destaque',
      spec: 'Exige estabelecimento JUCEMAT selecionado.',
    },
  ]
  form.fieldVisibilityRules = undefined
  form.exampleValuePresets = [
    {
      id: 'nen-acs-p1',
      name: 'Responsável — Aurora',
      iconColor: '#9d174d',
      fieldValues: {
        'nen-acs-nome': 'Maria Silva',
        'nen-acs-cpf': '123.456.789-00',
        'nen-acs-email-principal': 'maria@aurora.mt.gov.br',
        'nen-acs-login': 'maria.silva',
        'nen-acs-mtid': 'MT-1001',
        'nen-acs-ativo-acesso': true,
        'nen-acs-estab-lista': '12.345.678/0001-90 — Aurora Night Club — Cuiabá',
      },
    },
    {
      id: 'nen-acs-p2',
      name: 'Responsável — multi empresas',
      iconColor: '#0369a1',
      fieldValues: {
        'nen-acs-nome': 'João Pereira',
        'nen-acs-cpf': '987.654.321-00',
        'nen-acs-email-principal': 'joao@empresas.mt',
        'nen-acs-login': 'joao.pereira',
        'nen-acs-mtid': 'MT-1002',
        'nen-acs-ativo-acesso': true,
        'nen-acs-estab-lista': [
          '98.765.432/0001-10 — Bar Pantanal — Várzea Grande',
          '55.666.777/0001-88 — Hotel Pantanal — Cuiabá',
        ],
      },
    },
  ]
  form.activeExamplePresetId = 'nen-acs-p1'
  return form
}

function patchSelo(form) {
  form.metadata =
    'Registro do selo concedido (PDF §13–15, §20). Certificado = saída (Baixar). ' +
    'Validade 24 meses. QR → Validador MT. Lista pública MVP: exportação/relatório (API depois — ata 03/09). ' +
    'Revogação: upload decisão + REVOGADO, sem notificar de novo (ata 10/09). Sem denúncia neste sistema.'
  if (!form.fields.some((f) => f.id === 'nen-est-alerta-escopo')) {
    form.fields.push(
      field({
        id: 'nen-est-alerta-escopo',
        label: 'Escopo pós-concessão',
        type: 'alert',
        alertVariant: 'warning',
        demoValue:
          'Denúncia/fiscalização/apuração NÃO são feitas neste sistema (Sigadoc/canais atuais). Aqui: marcar REVOGADO e anexar decisão. Lista pública: exportar para publicação manual no MVP.',
      }),
    )
  }
  const rev = form.methods?.find((m) => m.id === 'nen-est-revogar')
  if (rev) {
    rev.spec =
      'Só VIGENTE. Upload da decisão/processo (Sigadoc) + status REVOGADO. Sem notificação ao estabelecimento (já cientificado no procedimento externo — ata 10/09).'
  }
  const ren = form.methods?.find((m) => m.id === 'nen-est-renovar')
  if (ren) {
    ren.spec =
      'VIGENTE ou EXPIRADO. Renovação reaproveita cadastro; mesmo fluxo análise→diligência→decisão (PDF §14). Aviso prévio de vencimento: notificação (a parametrizar).'
  }
  return form
}

function patchRevogacao(form) {
  form.metadata =
    'Ato operacional pós-apuração externa (ata 10/09). Não tramita denúncia aqui. Anexa decisão e marca selo REVOGADO.'
  const alerta = form.fields.find((f) => f.id === 'nen-rev-alerta')
  if (alerta) {
    alerta.demoValue =
      'Não notificar novamente o estabelecimento: o procedimento (Sigadoc/canais) já o cientificou. Esta tela só operacionaliza a revogação no cadastro do selo e a exclusão da lista pública.'
    alerta.alertVariant = 'warning'
  }
  form.methods = [
    {
      id: 'nen-rev-exec',
      name: 'Revogar selo',
      icon: 'gavel',
      kind: 'destaque',
      spec: 'Exige documento da decisão. Status do selo → REVOGADO. Remove da lista «Local Seguro para Mulheres».',
    },
  ]
  return form
}

function patchRenovacao(form) {
  form.metadata =
    'Renovação (PDF §14): validade 24 meses; reaproveita dados; status RENOVAÇÃO EM ANÁLISE após envio; mesmo fluxo da concessão no que couber.'
  const alerta = form.fields.find((f) => f.id === 'nen-ren-alerta')
  if (alerta) {
    alerta.demoValue =
      'Próximo do vencimento (24 meses): notificar estabelecimento. Formulário pré-preenchido; atualizar o que mudou. Efeito se renovação tempestiva e selo vencer antes da decisão: pendente de decreto.'
  }
  if (!form.fields.some((f) => f.id === 'nen-ren-status')) {
    form.fields.push(
      field({
        id: 'nen-ren-status',
        label: 'Status da renovação',
        type: 'textOptions',
        options: ['RASCUNHO', 'RENOVAÇÃO EM ANÁLISE', 'DEFERIDO', 'INDEFERIDO'],
        relevance: 'highlight',
        readOnly: true,
        demoValue: 'RASCUNHO',
      }),
    )
  }
  return form
}

function patchAjustes(form) {
  form.metadata =
    'Resposta do estabelecimento à diligência única (PDF §12). Prazo 5 dias. Não confundir com regularização de apuração (fora do escopo).'
  return form
}

function writeContext() {
  const md = `# Projeto Não é Não - Seplag v1

Fontes oficiais deste épico:
- **Reunião 03/09/2026** — fluxo macro (formulário, análise, selo, renovação, Validador MT, JUCEMAT)
- **Reunião 10/09/2026** — **1 serviço**; **sem** denúncia/fiscalização no sistema; revogação = upload + REVOGADO sem notificar; sem Sigadoc/Procon Digital agora
- **PDF 04/09/2026** — detalhe de campos/status (§§1–15, 20–24). **§§16–19 (denúncia/apuração) fora do escopo** por decisão da 10/09

## Escopo fechado

| Inclui | Não inclui |
|--------|------------|
| Solicitação / concessão / renovação / cancelamento a pedido | Módulo de denúncia ou fiscalização |
| Análise, diligência (5 dias), decisão, recurso do pedido | Apuração, defesa, advertência, regularização 90 dias na plataforma |
| Selo VIGENTE + certificado (QR Validador MT) | Integração Sigadoc / Procon Digital (MVP) |
| Revogação operacional (anexar decisão + REVOGADO) | Notificação nova na revogação (já cientificado no procedimento externo) |
| Exportação/relatório para lista pública (MVP) | API de lista pública (fase futura) |

Integrações MVP: **MT Login**, **JUCEMAT**, **Validador MT**.

## Acesso e estabelecimento

- Autenticação: MT Login (pessoa física).
- Lista de empresas: **JUCEMAT** pelo CPF (obrigatória). Mock no portal até integração.
- Elegibilidade (sócio / representante / filial / procuração): **pendência de negócio**.
- Documento de representação quando necessário (PDF §1).

## Solicitação (PDF §§1–10)

Seções: Dados → Enquadramento → Equipe/capacitados → Sinalização → Código → Procedimentos → Câmeras (condicional) → Declarações → Revisão → Protocolar.

Regras-chave:
- % capacitados automático; mínimo ≥2 capacitados; eventos >300: % do decreto (confirmar redação final).
- Câmeras **não** são requisito; se Sim → 30 dias + acesso legal.
- Protocolar: nº + data/hora + comprovante + **PROTOCOLADO**.

## Análise e Decisão (PDF §§11–13)

Status (métodos):
\`EM ANÁLISE\` → \`EM DILIGÊNCIA\` → \`DILIGÊNCIA RESPONDIDA\` | \`DILIGÊNCIA NÃO RESPONDIDA\` → (\`EM ANÁLISE\` ou) \`PRONTO PARA DECISÃO\` → \`DEFERIDO\` | \`INDEFERIDO\` → \`EM RECURSO\` → \`DEFERIDO\` | \`FINALIZADO\`

- Checklist por bloco + **texto de complementação** se «Necessita complementação».
- Diligência **única**, 5 dias; sem indeferimento automático sem resposta.
- **Não deferir** com item obrigatório «Não conforme».
- Prazo análise até 30 dias (decreto).

## Selo (PDF §§13–15, 20)

Status: VIGENTE → EXPIRADO | CANCELADO A PEDIDO | REVOGADO. Validade **24 meses**.

## Fora / futuro

- Lista pública automatizada (API) e painel Analytics completo (§24) — indicadores via exportação no MVP.
- Efeito renovação tempestiva vs vencimento — pendente decreto (PDF §21).
`

  fs.writeFileSync(path.join(epicDir, 'context.md'), md, 'utf8')
}

function patchFlow(flows) {
  const flow = flows[0]
  if (!flow) return flows
  flow.metadata =
    'Fluxo ponta a ponta alinhado às atas 03/09+10/09 e PDF 04/09 (sem denúncia/apuração na plataforma).'

  for (const step of flow.steps || []) {
    if (step.id === 'step-nen-escopo') {
      step.htmlContent = `<div style="padding:28px 48px;max-width:980px;margin:0 auto;font-family:Segoe UI,system-ui,sans-serif;color:#0f172a;line-height:1.55;">
  <div style="font-size:0.75rem;color:#9d174d;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:8px;">Fontes: 03/09 · 10/09 · PDF 04/09</div>
  <h1 style="font-size:1.6rem;margin:0 0 12px;color:#9d174d;">Escopo fechado — 1 serviço</h1>
  <div style="border-left:4px solid #9d174d;background:#fdf2f8;padding:14px 18px;border-radius:8px;margin:0 0 12px;">
    <strong>Inclui:</strong> solicitação, análise/diligência/decisão/recurso, selo (24 meses), renovação, cancelamento a pedido, <strong>revogação operacional</strong> (upload da decisão + REVOGADO, sem notificar de novo).
  </div>
  <div style="border-left:4px solid #64748b;background:#f8fafc;padding:14px 18px;border-radius:8px;margin:0 0 12px;">
    <strong>Não inclui:</strong> denúncia, fiscalização, apuração, defesa, advertência ou regularização 90 dias na plataforma (Sigadoc / canais atuais — ata 10/09). PDF §§16–19 fora do escopo de desenvolvimento.
  </div>
  <div style="border-left:4px solid #0369a1;background:#f0f9ff;padding:14px 18px;border-radius:8px;">
    <strong>Integrações MVP:</strong> MT Login · JUCEMAT · Validador MT. Sem Sigadoc / Procon Digital agora. Lista pública: relatório/exportação no MVP; API depois.
  </div>
</div>`
    }
    if (step.id === 'step-nen-acesso') {
      step.bpmnDescription =
        'Solicitante autentica via MT Login. Sistema lista empresas vinculadas na JUCEMAT; usuário seleciona a unidade do requerimento. Documento de representação quando necessário.'
      step.bpmnInputs = 'Credencial MT Login; empresas JUCEMAT; documento de representação se necessário.'
      step.bpmnRuleList = [
        'Somente empresas retornadas pela JUCEMAT',
        'Requerimento vinculado à unidade',
        'Quem pode solicitar (sócio/representante/filial): pendência de negócio',
      ]
    }
    if (step.id === 'step-nen-ajustes') {
      step.bpmnDescription =
        'Status EM DILIGÊNCIA. Prazo 5 dias (Lei 7.692/2002). Suspende contagem do prazo de análise. Resposta → DILIGÊNCIA RESPONDIDA; silêncio → DILIGÊNCIA NÃO RESPONDIDA. Sem indeferimento automático. Segue para decisão com os autos.'
    }
    if (step.id === 'step-nen-decisao') {
      step.bpmnDescription =
        'Autoridade defere ou indefere. Deferimento bloqueado se houver requisito «Não conforme». Deferido → Selo VIGENTE + certificado QR Validador MT. Indeferido → recurso.'
      step.bpmnRuleList = [
        'Não deferir com item obrigatório «não conforme»',
        'Indeferimento com requisitos, fatos e fundamentos legais',
      ]
    }
    if (step.id === 'step-nen-revogacao') {
      step.bpmnDescription =
        'Apuração ocorre fora do sistema (Sigadoc/canais). Neste sistema: anexar decisão e marcar REVOGADO, sem nova notificação (ata 10/09).'
    }
    if (step.id === 'step-nen-pos') {
      step.htmlContent = `<div style="padding:28px 48px;max-width:900px;margin:0 auto;font-family:Segoe UI,system-ui,sans-serif;line-height:1.55;color:#0f172a;">
  <h1 style="color:#9d174d;font-size:1.5rem;">Pós-concessão (mesmo serviço)</h1>
  <ul>
    <li><strong>Renovação</strong> — aviso próximo aos 24 meses; formulário pré-preenchido; fluxo semelhante à concessão.</li>
    <li><strong>Cancelamento a pedido</strong> — estabelecimento solicita; selo CANCELADO A PEDIDO; sai da lista pública.</li>
    <li><strong>Revogação</strong> — só operacional: upload da decisão + REVOGADO (sem módulo de denúncia aqui).</li>
    <li><strong>Lista pública</strong> — MVP via exportação/relatório; API em fase futura.</li>
  </ul>
</div>`
    }
  }

  // Ensure gestão step exists or update lista step
  const lista = (flow.steps || []).find((s) => s.id === 'step-nen-lista')
  if (lista) {
    lista.title = '13. Lista / exportação de selos (MVP lista pública)'
    lista.bpmnDescription =
      'Consulta e exportação de selos vigentes/expirados/cancelados/revogados para publicação manual da lista «Local Seguro para Mulheres» no MVP. API de consumo: fase futura (ata 03/09).'
  }

  return flows
}

function patchWorkspaces(ws) {
  for (const w of ws) {
    for (const pkg of w.packages || []) {
      for (const cls of pkg.classes || []) {
        if (cls.linkedFormId === FORM_AD) {
          const formPath = path.join(epicDir, 'forms.json')
          const forms = readJson(formPath)
          const ad = forms.find((f) => f.id === FORM_AD)
          cls.linkedFormExamplePresetIds = (ad?.exampleValuePresets || []).map((p) => p.id)
        }
        if (cls.linkedFormId === FORM_ACESSO || cls.id === 'cls-nen-acesso') {
          cls.name = 'Acesso (MT Login + JUCEMAT)'
          cls.linkedFormExamplePresetIds = ['nen-acs-p1', 'nen-acs-p2']
        }
      }
    }
  }
  return ws
}

function syncMirrors() {
  const mirrors = [
    path.join(root, '../espec-sydle-run/data/subprojects/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1'),
    path.join(
      root,
      '../nao-e-nao-seplag/data/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1',
    ),
  ]
  // fix paths - root is Atlas-Especificador-Sydle
  const abs = [
    path.join(
      'C:\\Users\\LucasSantos\\OneDrive - EloGroup\\Área de Trabalho\\Cursor\\espec-sydle-run\\data\\subprojects\\nao-e-nao-seplag\\epics\\projeto-nao-e-nao-seplag-v1',
    ),
    path.join(
      'C:\\Users\\LucasSantos\\OneDrive - EloGroup\\Área de Trabalho\\Cursor\\Projetos-Complexos\\nao-e-nao-seplag\\data\\nao-e-nao-seplag\\epics\\projeto-nao-e-nao-seplag-v1',
    ),
  ]
  for (const dst of abs) {
    fs.mkdirSync(dst, { recursive: true })
    for (const name of ['forms.json', 'workspaces.json', 'flows.json', 'context.md', 'class-groups.json']) {
      const src = path.join(epicDir, name)
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dst, name))
    }
    console.log('synced', dst)
  }
}

function main() {
  const formsPath = path.join(epicDir, 'forms.json')
  const forms = readJson(formsPath)

  const patchers = {
    [FORM_AD]: patchAnalise,
    [FORM_SOL]: patchSolicitacao,
    [FORM_ACESSO]: patchAcesso,
    [FORM_SELO]: patchSelo,
    [FORM_REV]: patchRevogacao,
    [FORM_REN]: patchRenovacao,
    [FORM_AJ]: patchAjustes,
  }

  for (const f of forms) {
    const fn = patchers[f.id]
    if (fn) Object.assign(f, fn(f))
  }

  writeJson(formsPath, forms)

  const flowsPath = path.join(epicDir, 'flows.json')
  writeJson(flowsPath, patchFlow(readJson(flowsPath)))

  const wsPath = path.join(epicDir, 'workspaces.json')
  writeJson(wsPath, patchWorkspaces(readJson(wsPath)))

  writeContext()
  syncMirrors()

  const ad = forms.find((f) => f.id === FORM_AD)
  console.log('AD status', ad.fields.find((x) => x.id === 'nen-ad-status').options)
  console.log('AD methods', ad.methods.map((m) => m.name).join(' | '))
  console.log('AD fields', ad.fields.length, 'presets', ad.exampleValuePresets?.length)
  console.log('ACESSO fields', forms.find((f) => f.id === FORM_ACESSO).fields.length)
  console.log('DONE')
}

main()
