/**
 * Requisito 04 — Assinaturas com pessoa e usuário (Projeto Atlas).
 * Exporta formulários e helpers para o build da Fase 1.
 */
export const FORM_TRAMITE_ASSINATURA = 'form-patlas-tramite-assinatura'
export const FORM_CONTRATO_FASE1 = 'form-patlas-contrato-fase1'
export const EMB_TRAMITES_ASSINATURA = 'emb_patlas_tramites_assinatura'

export const FORM_ORGANIZACAO_PATLAS = 'form-patlas-organizacao'
export const FORM_PESSOA_PATLAS = 'form-patlas-pessoa'
export const FORM_USUARIO_PATLAS = 'form-patlas-usuario'
export const FORM_SETOR_PATLAS = 'form-patlas-setor'
export const FORM_PROPOSTA_FASE1 = 'form-patlas-proposta-fase1'

const AREAS_ASSINATURA = ['DIRC', 'Parceiro', 'DTIC', 'DAFI', 'Presidência', 'Cliente']
const STATUS_PENDENCIA = [
  'Não enviada',
  'Pendente',
  'Em análise',
  'Assinada',
  'Reprovada',
  'Expirada',
  'Dispensada',
]

function field(id, label, type, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    spec: opts.spec ?? '',
  }
}

const METODOS_TRAMITE = [
  { id: 'patlas-tra-meth-enviar', name: 'Enviar para assinatura', icon: 'send', kind: 'secundario' },
  { id: 'patlas-tra-meth-ajuste', name: 'Solicitar ajuste', icon: 'edit_note', kind: 'secundario' },
  { id: 'patlas-tra-meth-reprovar', name: 'Reprovar', icon: 'cancel', kind: 'secundario' },
  { id: 'patlas-tra-meth-assinar', name: 'Aprovar e assinar', icon: 'verified', kind: 'destaque' },
]

/** Linha de trâmite para presets embutidos na proposta. */
export function tramiteAssinaturaRow(p) {
  return {
    'patlas-tra-ordem': p.ordem ?? 1,
    'patlas-tra-grupo-area': p.area ?? 'DIRC',
    'patlas-tra-assinante-pessoa': p.pessoa ?? '',
    'patlas-tra-assinante-usuario': p.usuario ?? '',
    'patlas-tra-papel-assinatura': p.papel ?? '',
    'patlas-tra-status-pendencia': p.status ?? 'Pendente',
    'patlas-tra-data-envio': p.dataEnvio ?? '',
    'patlas-tra-data-assinatura': p.dataAssinatura ?? '',
    'patlas-tra-dias-pendentes': p.diasPendentes ?? '',
    'patlas-tra-bloqueia-fluxo': p.bloqueia ?? 'true',
    'patlas-tra-condicional-parceiro': p.condicionalParceiro ?? 'false',
  }
}

export const TRAMITES_CADEIA_PADRAO = [
  tramiteAssinaturaRow({
    ordem: 1,
    area: 'DIRC',
    pessoa: 'Lucas Santos',
    usuario: 'lucas.santos',
    papel: 'Validação comercial DIRC',
    status: 'Assinada',
    dataEnvio: '2026-05-20',
    dataAssinatura: '2026-05-21',
    diasPendentes: 1,
    bloqueia: 'true',
  }),
  tramiteAssinaturaRow({
    ordem: 2,
    area: 'Parceiro',
    pessoa: 'Ana Paula Mendes',
    usuario: 'ana.mendes',
    papel: 'Concordância parceiro',
    status: 'Pendente',
    dataEnvio: '2026-05-21',
    diasPendentes: 4,
    bloqueia: 'true',
    condicionalParceiro: 'true',
  }),
  tramiteAssinaturaRow({
    ordem: 3,
    area: 'DTIC',
    pessoa: 'Fernanda Oliveira',
    usuario: 'fernanda.oliveira',
    papel: 'Concordância técnica DTIC',
    status: 'Não enviada',
    bloqueia: 'true',
  }),
  tramiteAssinaturaRow({
    ordem: 4,
    area: 'Presidência',
    papel: 'Assinatura final MTI',
    status: 'Não enviada',
    bloqueia: 'true',
  }),
]

export const TRAMITES_SEM_PARCEIRO = [
  tramiteAssinaturaRow({
    ordem: 1,
    area: 'DIRC',
    pessoa: 'Lucas Santos',
    usuario: 'lucas.santos',
    status: 'Assinada',
    dataEnvio: '2026-05-18',
    dataAssinatura: '2026-05-19',
    diasPendentes: 1,
    bloqueia: 'true',
  }),
  tramiteAssinaturaRow({
    ordem: 2,
    area: 'Parceiro',
    status: 'Dispensada',
    condicionalParceiro: 'true',
    bloqueia: 'false',
    papel: 'Não exigida — proposta sem parceiro',
  }),
  tramiteAssinaturaRow({
    ordem: 3,
    area: 'DTIC',
    pessoa: 'Fernanda Oliveira',
    status: 'Pendente',
    dataEnvio: '2026-05-20',
    diasPendentes: 5,
    bloqueia: 'true',
  }),
  tramiteAssinaturaRow({
    ordem: 4,
    area: 'Presidência',
    status: 'Não enviada',
    bloqueia: 'true',
  }),
]

export function buildTramiteAssinaturaForm() {
  const sec = 'sec-patlas-tra-controle'
  return {
    id: FORM_TRAMITE_ASSINATURA,
    name: 'Trâmite — assinatura',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Pendência de assinatura: área, assinante (pessoa ou usuário), status, datas e bloqueio do fluxo. Requisito 04.',
    methods: METODOS_TRAMITE,
    sections: [{ id: sec, title: 'Controle da assinatura', icon: 'draw' }],
    fields: [
      field('patlas-tra-ordem', 'Ordem na cadeia', 'number', {
        sectionId: sec,
        size: 'small',
        relevance: 'highlight',
        spec: 'Sequência no fluxo (ex.: 1 DIRC, 2 Parceiro, 3 DTIC, 4 Presidência).',
      }),
      field('patlas-tra-grupo-area', 'Grupo / área', 'textOptions', {
        sectionId: sec,
        required: true,
        relevance: 'highlight',
        options: AREAS_ASSINATURA,
        spec: 'Área responsável pela assinatura.',
      }),
      field('patlas-tra-setor', 'Setor (referência)', 'reference', {
        sectionId: sec,
        linkedFormId: FORM_SETOR_PATLAS,
        spec: 'Setor cadastrado, quando aplicável além do grupo/área.',
      }),
      field('patlas-tra-assinante-pessoa', 'Assinante — pessoa', 'reference', {
        sectionId: sec,
        linkedFormId: FORM_PESSOA_PATLAS,
        relevance: 'identity',
        spec: 'Pessoa responsável por assinar. Informe pessoa ou usuário.',
      }),
      field('patlas-tra-assinante-usuario', 'Assinante — usuário', 'reference', {
        sectionId: sec,
        linkedFormId: FORM_USUARIO_PATLAS,
        relevance: 'identity',
        spec: 'Conta Sydle ONE do assinante. Informe pessoa ou usuário.',
      }),
      field('patlas-tra-papel-assinatura', 'Papel de assinatura', 'text', {
        sectionId: sec,
        spec: 'Papel no fluxo (pode espelhar o cadastro da pessoa).',
      }),
      field('patlas-tra-status-pendencia', 'Status da pendência', 'textOptions', {
        sectionId: sec,
        required: true,
        relevance: 'highlight',
        readOnly: true,
        options: STATUS_PENDENCIA,
        spec: 'Situação da assinatura.',
      }),
      field('patlas-tra-data-envio', 'Data de envio', 'date', {
        sectionId: sec,
        readOnly: true,
        spec: 'Quando a assinatura foi enviada ao assinante.',
      }),
      field('patlas-tra-data-assinatura', 'Data da assinatura', 'date', {
        sectionId: sec,
        readOnly: true,
        spec: 'Quando a assinatura foi concluída.',
      }),
      field('patlas-tra-dias-pendentes', 'Dias pendentes', 'number', {
        sectionId: sec,
        size: 'small',
        readOnly: true,
        relevance: 'highlight',
        spec: 'Tempo em aberto desde o envio.',
      }),
      field('patlas-tra-bloqueia-fluxo', 'Bloqueia o fluxo', 'boolean', {
        sectionId: sec,
        relevance: 'highlight',
        spec: 'Se true, o processo não avança enquanto esta pendência não estiver concluída ou dispensada.',
      }),
      field('patlas-tra-condicional-parceiro', 'Condicional — parceiro na proposta', 'boolean', {
        sectionId: sec,
        spec: 'Se true, esta assinatura só é exigida quando a proposta tiver parceiro. Caso contrário fica dispensada.',
      }),
      field('patlas-tra-proposta', 'Proposta', 'reference', {
        sectionId: sec,
        linkedFormId: FORM_PROPOSTA_FASE1,
        relevance: 'advanced',
        spec: 'Proposta à qual o trâmite pertence (quando não embutido).',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-tra-p-dirc-pendente',
        name: 'DIRC — pendente',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-tra-ordem': 1,
          'patlas-tra-grupo-area': 'DIRC',
          'patlas-tra-assinante-pessoa': 'Lucas Santos',
          'patlas-tra-assinante-usuario': 'lucas.santos',
          'patlas-tra-papel-assinatura': 'Validação comercial',
          'patlas-tra-status-pendencia': 'Pendente',
          'patlas-tra-data-envio': '2026-05-25',
          'patlas-tra-dias-pendentes': 3,
          'patlas-tra-bloqueia-fluxo': 'true',
        },
      },
      {
        id: 'patlas-tra-p-parceiro',
        name: 'Parceiro — condicional',
        iconColor: '#059669',
        fieldValues: {
          'patlas-tra-ordem': 2,
          'patlas-tra-grupo-area': 'Parceiro',
          'patlas-tra-assinante-pessoa': 'Ana Paula Mendes',
          'patlas-tra-assinante-usuario': 'ana.mendes',
          'patlas-tra-status-pendencia': 'Pendente',
          'patlas-tra-bloqueia-fluxo': 'true',
          'patlas-tra-condicional-parceiro': 'true',
        },
      },
      {
        id: 'patlas-tra-p-dtic-assinada',
        name: 'DTIC — assinada',
        iconColor: '#5b21b6',
        fieldValues: {
          'patlas-tra-ordem': 3,
          'patlas-tra-grupo-area': 'DTIC',
          'patlas-tra-assinante-pessoa': 'Fernanda Oliveira',
          'patlas-tra-status-pendencia': 'Assinada',
          'patlas-tra-data-envio': '2026-05-22',
          'patlas-tra-data-assinatura': '2026-05-23',
          'patlas-tra-dias-pendentes': 1,
          'patlas-tra-bloqueia-fluxo': 'true',
        },
      },
      {
        id: 'patlas-tra-p-presidencia',
        name: 'Presidência — não enviada',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlas-tra-ordem': 4,
          'patlas-tra-grupo-area': 'Presidência',
          'patlas-tra-papel-assinatura': 'Assinatura final MTI',
          'patlas-tra-status-pendencia': 'Não enviada',
          'patlas-tra-bloqueia-fluxo': 'true',
        },
      },
      {
        id: 'patlas-tra-p-dispensada',
        name: 'Parceiro — dispensada',
        iconColor: '#64748b',
        fieldValues: {
          'patlas-tra-ordem': 2,
          'patlas-tra-grupo-area': 'Parceiro',
          'patlas-tra-status-pendencia': 'Dispensada',
          'patlas-tra-bloqueia-fluxo': 'false',
          'patlas-tra-condicional-parceiro': 'true',
          'patlas-tra-papel-assinatura': 'Não exigida — sem parceiro na proposta',
        },
      },
      {
        id: 'patlas-tra-p-reprovada',
        name: 'Reprovada — ajuste',
        iconColor: '#b91c1c',
        fieldValues: {
          'patlas-tra-grupo-area': 'DIRC',
          'patlas-tra-status-pendencia': 'Reprovada',
          'patlas-tra-bloqueia-fluxo': 'true',
          'patlas-tra-data-envio': '2026-05-10',
          'patlas-tra-dias-pendentes': 8,
        },
      },
    ],
    activeExamplePresetId: 'patlas-tra-p-dirc-pendente',
  }
}

export function buildContratoFase1Form() {
  return {
    id: FORM_CONTRATO_FASE1,
    name: 'Contrato — vínculo Fase 1',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata: 'Cadastro mínimo de contrato com organização cliente e trâmites de assinatura (História 01).',
    sections: [
      { id: 'sec-patlas-ctr-ident', title: 'Identificação', icon: 'description' },
      { id: 'sec-patlas-ctr-ass', title: 'Assinaturas', icon: 'draw' },
    ],
    fields: [
      field('patlas-ctr-numero', 'Número do contrato', 'text', {
        sectionId: 'sec-patlas-ctr-ident',
        required: true,
        relevance: 'identity',
      }),
      field('patlas-ctr-organizacao-cliente', 'Organização cliente', 'reference', {
        sectionId: 'sec-patlas-ctr-ident',
        size: 'large',
        required: true,
        linkedFormId: FORM_ORGANIZACAO_PATLAS,
        relevance: 'highlight',
        spec: 'Cliente vinculado ao contrato (referência ao cadastro de organização).',
      }),
      field('patlas-ctr-proposta-origem', 'Proposta origem', 'reference', {
        sectionId: 'sec-patlas-ctr-ident',
        size: 'large',
        linkedFormId: FORM_PROPOSTA_FASE1,
        spec: 'Proposta que originou o contrato.',
      }),
      field('patlas-ctr-status', 'Status', 'textOptions', {
        sectionId: 'sec-patlas-ctr-ident',
        options: ['Rascunho', 'Aguardando assinaturas', 'Ativo', 'Suspenso', 'Cancelado'],
      }),
      field(EMB_TRAMITES_ASSINATURA, 'Trâmites de assinatura', 'embeddedReference', {
        sectionId: 'sec-patlas-ctr-ass',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_TRAMITE_ASSINATURA,
        relevance: 'highlight',
        spec: 'Cadeia de assinaturas do contrato. Trâmites bloqueantes devem estar concluídos para avançar.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-ctr-p-tjmt',
        name: 'Contrato — TJMT',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-ctr-numero': 'CT-2025-0042',
          'patlas-ctr-organizacao-cliente': 'Tribunal de Justiça de Mato Grosso',
          'patlas-ctr-proposta-origem': 'PROP-2025-0042',
          'patlas-ctr-status': 'Aguardando assinaturas',
        },
        embeddedRowsByFieldId: {
          [EMB_TRAMITES_ASSINATURA]: TRAMITES_CADEIA_PADRAO.slice(0, 2),
        },
      },
      {
        id: 'patlas-ctr-p-rascunho',
        name: 'Rascunho',
        iconColor: '#64748b',
        fieldValues: {
          'patlas-ctr-numero': 'CT-DRAFT-001',
          'patlas-ctr-organizacao-cliente': 'Secretaria de Fazenda de Mato Grosso',
          'patlas-ctr-status': 'Rascunho',
        },
      },
      {
        id: 'patlas-ctr-p-ativo',
        name: 'Ativo — SEFAZ',
        iconColor: '#059669',
        fieldValues: {
          'patlas-ctr-numero': 'CT-2024-1200',
          'patlas-ctr-organizacao-cliente': 'Secretaria de Fazenda de Mato Grosso',
          'patlas-ctr-status': 'Ativo',
        },
      },
      {
        id: 'patlas-ctr-p-parceiro',
        name: 'Com parceiro na origem',
        iconColor: '#059669',
        fieldValues: {
          'patlas-ctr-numero': 'CT-2025-0105',
          'patlas-ctr-organizacao-cliente': 'Tribunal de Justiça de Mato Grosso',
          'patlas-ctr-status': 'Aguardando assinaturas',
        },
        embeddedRowsByFieldId: { [EMB_TRAMITES_ASSINATURA]: TRAMITES_CADEIA_PADRAO },
      },
      {
        id: 'patlas-ctr-p-cancelado',
        name: 'Cancelado',
        iconColor: '#94a3b8',
        fieldValues: {
          'patlas-ctr-numero': 'CT-2024-0099',
          'patlas-ctr-status': 'Cancelado',
        },
      },
    ],
    activeExamplePresetId: 'patlas-ctr-p-tjmt',
  }
}

/** Campos e seção adicionais no formulário de proposta Fase 1. */
export function propostaAssinaturaFields(fieldFn) {
  return [
    fieldFn('patlas-prp-organizacao-cliente', 'Organização cliente', 'reference', {
      sectionId: 'sec-patlas-prp-cab',
      size: 'large',
      linkedFormId: FORM_ORGANIZACAO_PATLAS,
      relevance: 'highlight',
      spec: 'Referência ao cadastro de organização (cliente).',
    }),
    fieldFn('patlas-prp-organizacao-parceiro', 'Organização parceiro', 'reference', {
      sectionId: 'sec-patlas-prp-cab',
      size: 'large',
      linkedFormId: FORM_ORGANIZACAO_PATLAS,
      spec: 'Parceiro envolvido na proposta, quando houver.',
    }),
    fieldFn('patlas-prp-tem-parceiro', 'Possui parceiro na proposta', 'boolean', {
      sectionId: 'sec-patlas-prp-cab',
      relevance: 'highlight',
      spec: 'Quando false, trâmites de assinatura do parceiro com «condicional parceiro» são dispensados.',
    }),
    fieldFn('patlas-prp-alerta-assinaturas', 'Regra de avanço', 'alert', {
      sectionId: 'sec-patlas-prp-ass',
      size: 'large',
      readOnly: true,
      alertVariant: 'warning',
      alertTitle: 'Assinaturas bloqueantes',
      alertMessage:
        'O processo só avança quando todos os trâmites com «Bloqueia o fluxo» estiverem Assinados ou Dispensados. Assinaturas de parceiro condicionais não são exigidas se não houver parceiro.',
    }),
    fieldFn(EMB_TRAMITES_ASSINATURA, 'Trâmites de assinatura', 'embeddedReference', {
      sectionId: 'sec-patlas-prp-ass',
      size: 'large',
      multiple: true,
      embeddedDisplay: 'table',
      linkedFormId: FORM_TRAMITE_ASSINATURA,
      relevance: 'highlight',
      spec: 'Cadeia DIRC/parceiro, DTIC, Presidência — cada linha com assinante, área, status e datas.',
    }),
  ]
}

export const PROPOSTA_SEC_ASSINATURAS = {
  id: 'sec-patlas-prp-ass',
  title: 'Assinaturas',
  icon: 'draw',
}
