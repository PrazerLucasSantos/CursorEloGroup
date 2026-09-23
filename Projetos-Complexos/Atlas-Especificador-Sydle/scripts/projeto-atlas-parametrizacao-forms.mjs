/**
 * História 02 — Parametrização: fluxo de aprovação e modelos de documento.
 */
export const FORM_FLUXO_MODELO = 'form-patlas-fluxo-modelo'
export const FORM_FLUXO_VERSAO = 'form-patlas-fluxo-versao'
export const FORM_FLUXO_ETAPA = 'form-patlas-fluxo-etapa'
export const FORM_FLUXO_INSTANCIA = 'form-patlas-fluxo-instancia'
export const FORM_DOC_PARAMETRO = 'form-patlas-doc-parametro'
export const FORM_DOC_MODELO = 'form-patlas-doc-modelo'
export const FORM_DOC_GERADO = 'form-patlas-doc-gerado'

export const FORM_PROPOSTA_FASE1 = 'form-patlas-proposta-fase1'
export const FORM_TRAMITE_ASSINATURA = 'form-patlas-tramite-assinatura'

export const EMB_FLUXO_VERSOES = 'emb_patlas_fluxo_versoes'
export const EMB_FLUXO_ETAPAS = 'emb_patlas_fluxo_etapas'
export const EMB_DOC_PARAMETROS = 'emb_patlas_doc_parametros'
export const EMB_DOC_TRAMITES = 'emb_patlas_doc_tramites_assinatura'

const DOMINIOS = ['Proposta', 'Contrato', 'Documento', 'Ordem de serviço', 'Outro']
const AREAS_DONA = ['DIRC', 'DTIC', 'DAFI', 'Presidência', 'Parceiro']
const AREAS_ETAPA = ['DIRC', 'Parceiro', 'DTIC', 'DAFI', 'Presidência', 'Cliente', 'Sistema']
const TIPO_ETAPA = [
  'Entrada',
  'Edição',
  'Revisão',
  'Assinatura',
  'Decisão',
  'Notificação',
  'Finalização',
  'Cadastro contratual',
]
const STATUS_MODELO = ['Rascunho', 'Ativo', 'Suspenso', 'Substituído', 'Arquivado']
const STATUS_VERSAO = ['Rascunho', 'Ativa', 'Encerrada', 'Substituída']
const STATUS_DOC_MODELO = ['Rascunho', 'Publicado', 'Substituído', 'Arquivado']
const TIPOS_DOC = ['Proposta', 'Contrato', 'Handover', 'Anexo', 'Outro']

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
    ...(opts.alertVariant ? { alertVariant: opts.alertVariant } : {}),
    ...(opts.alertTitle ? { alertTitle: opts.alertTitle } : {}),
    ...(opts.alertMessage ? { alertMessage: opts.alertMessage } : {}),
    ...(opts.htmlContent ? { htmlContent: opts.htmlContent } : {}),
    spec: opts.spec ?? '',
  }
}

export function etapaRow(p) {
  return {
    'patlas-fet-ordem': p.ordem ?? 1,
    'patlas-fet-nome': p.nome ?? '',
    'patlas-fet-tipo': p.tipo ?? 'Edição',
    'patlas-fet-area': p.area ?? 'DIRC',
    'patlas-fet-sla-dias': p.sla ?? '',
    'patlas-fet-exige-assinatura': p.exigeAssinatura ?? 'false',
    'patlas-fet-exige-documento': p.exigeDocumento ?? 'false',
    'patlas-fet-proxima-aprovada': p.proximaAprovada ?? '',
    'patlas-fet-proxima-reprovada': p.proximaReprovada ?? '',
    'patlas-fet-retorno-ajuste': p.retornoAjuste ?? '',
  }
}

export const ETAPAS_FLUXO_PROPOSTA_V1 = [
  etapaRow({ ordem: 1, nome: 'Registrar demanda', tipo: 'Entrada', area: 'DIRC', sla: 1 }),
  etapaRow({ ordem: 2, nome: 'Compor proposta', tipo: 'Edição', area: 'DIRC', sla: 3, exigeDocumento: 'false' }),
  etapaRow({
    ordem: 3,
    nome: 'Assinatura DIRC/parceiro',
    tipo: 'Assinatura',
    area: 'Parceiro',
    sla: 2,
    exigeAssinatura: 'true',
    proximaAprovada: 'Assinatura DTIC',
  }),
  etapaRow({
    ordem: 4,
    nome: 'Assinatura DTIC',
    tipo: 'Assinatura',
    area: 'DTIC',
    sla: 2,
    exigeAssinatura: 'true',
    proximaAprovada: 'Assinatura Presidência',
    retornoAjuste: 'Compor proposta',
  }),
  etapaRow({
    ordem: 5,
    nome: 'Assinatura Presidência',
    tipo: 'Assinatura',
    area: 'Presidência',
    sla: 2,
    exigeAssinatura: 'true',
    proximaAprovada: 'Cadastro contratual',
  }),
  etapaRow({
    ordem: 6,
    nome: 'Cadastro contratual',
    tipo: 'Cadastro contratual',
    area: 'DIRC',
    sla: 5,
    exigeDocumento: 'true',
  }),
]

export function buildFluxoEtapaForm() {
  const secI = 'sec-patlas-fet-ident'
  const secR = 'sec-patlas-fet-regras'
  const secT = 'sec-patlas-fet-transicoes'
  return {
    id: FORM_FLUXO_ETAPA,
    name: 'Fluxo — etapa',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata: 'Etapa do fluxo: ordem, tipo, área, SLA, assinatura, documento e transições.',
    sections: [
      { id: secI, title: 'Etapa', icon: 'linear_scale' },
      { id: secR, title: 'Regras', icon: 'tune' },
      { id: secT, title: 'Transições', icon: 'account_tree' },
    ],
    fields: [
      field('patlas-fet-ordem', 'Ordem', 'number', {
        sectionId: secI,
        size: 'small',
        required: true,
        relevance: 'highlight',
        spec: 'Sequência da etapa dentro do fluxo.',
      }),
      field('patlas-fet-tipo', 'Tipo da etapa', 'textOptions', {
        sectionId: secI,
        required: true,
        options: TIPO_ETAPA,
        spec: 'Tipo de atividade: entrada, edição, assinatura, etc.',
      }),
      field('patlas-fet-nome', 'Nome da etapa', 'text', {
        sectionId: secI,
        size: 'large',
        required: true,
        relevance: 'identity',
      }),
      field('patlas-fet-area', 'Área responsável', 'textOptions', {
        sectionId: secI,
        required: true,
        options: AREAS_ETAPA,
        relevance: 'highlight',
        spec: 'Área que executa ou responde pela etapa.',
      }),
      field('patlas-fet-sla-dias', 'Prazo / SLA (dias)', 'number', {
        sectionId: secR,
        size: 'small',
        spec: 'Prazo previsto para conclusão da etapa, em dias úteis.',
      }),
      field('patlas-fet-exige-assinatura', 'Exige assinatura', 'boolean', {
        sectionId: secR,
        relevance: 'highlight',
        spec: 'Indica se a etapa precisa de assinatura.',
      }),
      field('patlas-fet-exige-documento', 'Exige documento', 'boolean', {
        sectionId: secR,
        spec: 'Indica se a etapa depende de documento gerado.',
      }),
      field('patlas-fet-doc-modelo', 'Modelo de documento', 'reference', {
        sectionId: secR,
        linkedFormId: FORM_DOC_MODELO,
        spec: 'Modelo usado quando a etapa exige documento.',
      }),
      field('patlas-fet-proxima-aprovada', 'Próxima etapa aprovada', 'reference', {
        sectionId: secT,
        linkedFormId: FORM_FLUXO_ETAPA,
        spec: 'Para onde o processo segue quando aprovado.',
      }),
      field('patlas-fet-proxima-reprovada', 'Próxima etapa reprovada', 'reference', {
        sectionId: secT,
        linkedFormId: FORM_FLUXO_ETAPA,
        spec: 'Para onde o processo vai em caso de reprovação.',
      }),
      field('patlas-fet-retorno-ajuste', 'Retorno para ajuste', 'reference', {
        sectionId: secT,
        linkedFormId: FORM_FLUXO_ETAPA,
        spec: 'Para qual etapa o processo volta se houver ajuste.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-fet-p-compor',
        name: 'Compor proposta',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-fet-ordem': 2,
          'patlas-fet-tipo': 'Edição',
          'patlas-fet-nome': 'Compor proposta',
          'patlas-fet-area': 'DIRC',
          'patlas-fet-sla-dias': 3,
        },
      },
      {
        id: 'patlas-fet-p-assin-dirc',
        name: 'Assinatura DIRC/parceiro',
        iconColor: '#059669',
        fieldValues: {
          'patlas-fet-ordem': 3,
          'patlas-fet-tipo': 'Assinatura',
          'patlas-fet-nome': 'Assinatura DIRC/parceiro',
          'patlas-fet-area': 'Parceiro',
          'patlas-fet-exige-assinatura': 'true',
          'patlas-fet-sla-dias': 2,
        },
      },
      {
        id: 'patlas-fet-p-assin-dtic',
        name: 'Assinatura DTIC',
        iconColor: '#5b21b6',
        fieldValues: {
          'patlas-fet-ordem': 4,
          'patlas-fet-tipo': 'Assinatura',
          'patlas-fet-nome': 'Assinatura DTIC',
          'patlas-fet-area': 'DTIC',
          'patlas-fet-exige-assinatura': 'true',
          'patlas-fet-retorno-ajuste': 'Compor proposta',
        },
      },
      {
        id: 'patlas-fet-p-presidencia',
        name: 'Assinatura Presidência',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlas-fet-ordem': 5,
          'patlas-fet-tipo': 'Assinatura',
          'patlas-fet-nome': 'Assinatura Presidência',
          'patlas-fet-area': 'Presidência',
          'patlas-fet-exige-assinatura': 'true',
        },
      },
      {
        id: 'patlas-fet-p-cadastro',
        name: 'Cadastro contratual',
        iconColor: '#0369a1',
        fieldValues: {
          'patlas-fet-ordem': 6,
          'patlas-fet-tipo': 'Cadastro contratual',
          'patlas-fet-nome': 'Cadastro contratual',
          'patlas-fet-area': 'DIRC',
          'patlas-fet-exige-documento': 'true',
          'patlas-fet-sla-dias': 5,
        },
      },
      {
        id: 'patlas-fet-p-revisao',
        name: 'Revisão comercial',
        iconColor: '#64748b',
        fieldValues: {
          'patlas-fet-ordem': 2,
          'patlas-fet-tipo': 'Revisão',
          'patlas-fet-nome': 'Revisão comercial',
          'patlas-fet-area': 'DIRC',
          'patlas-fet-retorno-ajuste': 'Compor proposta',
        },
      },
    ],
    activeExamplePresetId: 'patlas-fet-p-assin-dtic',
  }
}

export function buildFluxoVersaoForm() {
  const secI = 'sec-patlas-fver-ident'
  const secE = 'sec-patlas-fver-etapas'
  return {
    id: FORM_FLUXO_VERSAO,
    name: 'Fluxo — versão',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata: 'Versão do fluxo. Processos iniciados permanecem na versão até conclusão.',
    methods: [{ id: 'patlas-fver-meth-clonar', name: 'Clonar versão', icon: 'content_copy', kind: 'destaque' }],
    sections: [
      { id: secI, title: 'Identificação', icon: 'history' },
      { id: secE, title: 'Etapas', icon: 'linear_scale' },
    ],
    fields: [
      field('patlas-fver-modelo', 'Modelo de fluxo', 'reference', {
        sectionId: secI,
        required: true,
        linkedFormId: FORM_FLUXO_MODELO,
        relevance: 'identity',
        spec: 'Modelo ao qual a versão pertence.',
      }),
      field('patlas-fver-numero', 'Número da versão', 'text', {
        sectionId: secI,
        size: 'small',
        required: true,
        relevance: 'highlight',
        spec: 'Identificação da versão, como 1.0 ou 1.1.',
      }),
      field('patlas-fver-status', 'Status da versão', 'textOptions', {
        sectionId: secI,
        required: true,
        options: STATUS_VERSAO,
        spec: 'Situação da versão.',
      }),
      field('patlas-fver-observacao', 'Observação', 'text', {
        sectionId: secI,
        size: 'large',
        textLong: true,
        spec: 'Notas sobre alterações desta versão.',
      }),
      field(EMB_FLUXO_ETAPAS, 'Etapas vinculadas', 'embeddedReference', {
        sectionId: secE,
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_FLUXO_ETAPA,
        required: true,
        spec: 'Lista das etapas que compõem a versão.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-fver-p-v10',
        name: 'Versão 1.0 — proposta',
        iconColor: '#6366f1',
        fieldValues: {
          'patlas-fver-modelo': 'Fluxo padrão de proposta',
          'patlas-fver-numero': '1.0',
          'patlas-fver-status': 'Ativa',
          'patlas-fver-observacao': 'Fluxo inicial: demanda, proposta, assinaturas e cadastro contratual.',
        },
        embeddedRowsByFieldId: { [EMB_FLUXO_ETAPAS]: ETAPAS_FLUXO_PROPOSTA_V1 },
      },
      {
        id: 'patlas-fver-p-v11',
        name: 'Versão 1.1 — revisão extra',
        iconColor: '#4f46e5',
        fieldValues: {
          'patlas-fver-modelo': 'Fluxo padrão de proposta',
          'patlas-fver-numero': '1.1',
          'patlas-fver-status': 'Rascunho',
        },
      },
      {
        id: 'patlas-fver-p-contrato',
        name: 'Versão 1.0 — contrato',
        iconColor: '#0369a1',
        fieldValues: {
          'patlas-fver-modelo': 'Fluxo cadastro contratual',
          'patlas-fver-numero': '1.0',
          'patlas-fver-status': 'Ativa',
        },
      },
      {
        id: 'patlas-fver-p-encerrada',
        name: 'Versão encerrada',
        iconColor: '#94a3b8',
        fieldValues: {
          'patlas-fver-modelo': 'Fluxo padrão de proposta',
          'patlas-fver-numero': '0.9',
          'patlas-fver-status': 'Encerrada',
        },
      },
      {
        id: 'patlas-fver-p-substituida',
        name: 'Substituída por 1.1',
        iconColor: '#64748b',
        fieldValues: {
          'patlas-fver-modelo': 'Fluxo padrão de proposta',
          'patlas-fver-numero': '1.0',
          'patlas-fver-status': 'Substituída',
        },
      },
    ],
    activeExamplePresetId: 'patlas-fver-p-v10',
  }
}

export function buildFluxoModeloForm() {
  const secI = 'sec-patlas-fmod-ident'
  const secC = 'sec-patlas-fmod-controle'
  const secV = 'sec-patlas-fmod-versoes'
  return {
    id: FORM_FLUXO_MODELO,
    name: 'Fluxo — modelo',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata: 'Modelo de fluxo para propostas, documentos, assinaturas e contratos.',
    methods: [
      { id: 'patlas-fmod-meth-criar-versao', name: 'Criar versão', icon: 'add', kind: 'destaque' },
      { id: 'patlas-fmod-meth-ativar', name: 'Ativar modelo', icon: 'verified', kind: 'menu' },
    ],
    sections: [
      { id: secI, title: 'Identificação', icon: 'account_tree' },
      { id: secC, title: 'Controle', icon: 'tune' },
      { id: secV, title: 'Versões', icon: 'history' },
    ],
    fields: [
      field('patlas-fmod-nome', 'Nome do modelo', 'text', {
        sectionId: secI,
        size: 'large',
        required: true,
        relevance: 'identity',
        spec: 'Nome do fluxo configurado.',
      }),
      field('patlas-fmod-dominio', 'Domínio', 'textOptions', {
        sectionId: secI,
        required: true,
        relevance: 'highlight',
        options: DOMINIOS,
        spec: 'Tipo de processo atendido (Proposta, Contrato, etc.).',
      }),
      field('patlas-fmod-area-dona', 'Área dona', 'textOptions', {
        sectionId: secI,
        required: true,
        options: AREAS_DONA,
        spec: 'Área responsável pelo fluxo, como DIRC.',
      }),
      field('patlas-fmod-status', 'Status', 'textOptions', {
        sectionId: secC,
        required: true,
        options: STATUS_MODELO,
        spec: 'Situação do modelo.',
      }),
      field('patlas-fmod-versao-ativa', 'Versão ativa', 'reference', {
        sectionId: secC,
        readOnly: true,
        linkedFormId: FORM_FLUXO_VERSAO,
        relevance: 'highlight',
        spec: 'Versão usada para novos processos.',
      }),
      field('patlas-fmod-descricao', 'Descrição', 'text', {
        sectionId: secC,
        size: 'large',
        textLong: true,
      }),
      field(EMB_FLUXO_VERSOES, 'Versões do fluxo', 'embeddedReference', {
        sectionId: secV,
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_FLUXO_VERSAO,
        spec: 'Versões configuradas. Novos processos usam a versão ativa.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-fmod-p-proposta',
        name: 'Fluxo padrão de proposta',
        iconColor: '#6366f1',
        fieldValues: {
          'patlas-fmod-nome': 'Fluxo padrão de proposta',
          'patlas-fmod-dominio': 'Proposta',
          'patlas-fmod-area-dona': 'DIRC',
          'patlas-fmod-status': 'Ativo',
          'patlas-fmod-versao-ativa': '1.0',
          'patlas-fmod-descricao':
            'Registrar demanda → compor proposta → assinaturas DIRC/parceiro, DTIC, Presidência → cadastro contratual.',
        },
        embeddedRowsByFieldId: {
          [EMB_FLUXO_VERSOES]: [
            { 'patlas-fver-numero': '1.0', 'patlas-fver-status': 'Ativa' },
            { 'patlas-fver-numero': '1.1', 'patlas-fver-status': 'Rascunho' },
          ],
        },
      },
      {
        id: 'patlas-fmod-p-contrato',
        name: 'Fluxo cadastro contratual',
        iconColor: '#0369a1',
        fieldValues: {
          'patlas-fmod-nome': 'Fluxo cadastro contratual',
          'patlas-fmod-dominio': 'Contrato',
          'patlas-fmod-area-dona': 'DIRC',
          'patlas-fmod-status': 'Ativo',
          'patlas-fmod-versao-ativa': '1.0',
        },
      },
      {
        id: 'patlas-fmod-p-documento',
        name: 'Fluxo documento',
        iconColor: '#059669',
        fieldValues: {
          'patlas-fmod-nome': 'Fluxo geração de documento',
          'patlas-fmod-dominio': 'Documento',
          'patlas-fmod-area-dona': 'DIRC',
          'patlas-fmod-status': 'Rascunho',
        },
      },
      {
        id: 'patlas-fmod-p-suspenso',
        name: 'Modelo suspenso',
        iconColor: '#94a3b8',
        fieldValues: {
          'patlas-fmod-nome': 'Fluxo legado 2024',
          'patlas-fmod-dominio': 'Proposta',
          'patlas-fmod-area-dona': 'DIRC',
          'patlas-fmod-status': 'Suspenso',
        },
      },
      {
        id: 'patlas-fmod-p-arquivado',
        name: 'Arquivado',
        iconColor: '#64748b',
        fieldValues: {
          'patlas-fmod-nome': 'Fluxo piloto 2023',
          'patlas-fmod-dominio': 'Proposta',
          'patlas-fmod-area-dona': 'DIRC',
          'patlas-fmod-status': 'Arquivado',
        },
      },
    ],
    activeExamplePresetId: 'patlas-fmod-p-proposta',
  }
}

export function buildFluxoInstanciaForm() {
  const secI = 'sec-patlas-fins-ident'
  const secA = 'sec-patlas-fins-andamento'
  return {
    id: FORM_FLUXO_INSTANCIA,
    name: 'Processo em andamento',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'read',
    metadata: 'Instância gerada ao submeter proposta (modelo + versão congelados).',
    methods: [
      { id: 'patlas-fins-meth-avancar', name: 'Avançar etapa', icon: 'send', kind: 'destaque' },
      { id: 'patlas-fins-meth-ajuste', name: 'Solicitar ajuste', icon: 'edit_note', kind: 'menu' },
    ],
    sections: [
      { id: secI, title: 'Identificação', icon: 'account_tree' },
      { id: secA, title: 'Andamento', icon: 'linear_scale' },
    ],
    fields: [
      field('patlas-fins-numero', 'Número do processo', 'text', {
        sectionId: secI,
        readOnly: true,
        required: true,
        relevance: 'identity',
      }),
      field('patlas-fins-modelo', 'Modelo de fluxo', 'reference', {
        sectionId: secI,
        readOnly: true,
        required: true,
        linkedFormId: FORM_FLUXO_MODELO,
      }),
      field('patlas-fins-versao', 'Versão do fluxo', 'reference', {
        sectionId: secI,
        readOnly: true,
        required: true,
        linkedFormId: FORM_FLUXO_VERSAO,
        spec: 'Versão congelada — não muda se o modelo ganhar nova versão.',
      }),
      field('patlas-fins-proposta', 'Proposta vinculada', 'reference', {
        sectionId: secI,
        linkedFormId: FORM_PROPOSTA_FASE1,
        size: 'large',
      }),
      field('patlas-fins-status', 'Status', 'textOptions', {
        sectionId: secA,
        readOnly: true,
        options: ['Em andamento', 'Aguardando assinatura', 'Aguardando ajuste', 'Concluído', 'Cancelado'],
      }),
      field('patlas-fins-etapa-atual', 'Etapa atual', 'reference', {
        sectionId: secA,
        readOnly: true,
        linkedFormId: FORM_FLUXO_ETAPA,
        relevance: 'highlight',
      }),
      field('patlas-fins-area-atual', 'Área atual', 'textOptions', {
        sectionId: secA,
        readOnly: true,
        options: AREAS_ETAPA,
      }),
      field('patlas-fins-data-inicio', 'Data início', 'date', { sectionId: secA, readOnly: true }),
      field('patlas-fins-dias-parado', 'Dias parado', 'number', { sectionId: secA, size: 'small', readOnly: true }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-fins-p-tjmt',
        name: 'PROP-2025-0042 — DTIC',
        iconColor: '#b45309',
        fieldValues: {
          'patlas-fins-numero': 'PROC-2026-0042',
          'patlas-fins-modelo': 'Fluxo padrão de proposta',
          'patlas-fins-versao': '1.0',
          'patlas-fins-proposta': 'PROP-2025-0042',
          'patlas-fins-status': 'Aguardando assinatura',
          'patlas-fins-etapa-atual': 'Assinatura DTIC',
          'patlas-fins-area-atual': 'DTIC',
          'patlas-fins-data-inicio': '2026-05-20',
          'patlas-fins-dias-parado': 2,
        },
      },
      {
        id: 'patlas-fins-p-elaboracao',
        name: 'Em elaboração',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-fins-numero': 'PROC-2026-0099',
          'patlas-fins-modelo': 'Fluxo padrão de proposta',
          'patlas-fins-versao': '1.0',
          'patlas-fins-proposta': 'PROP-2025-0099',
          'patlas-fins-status': 'Em andamento',
          'patlas-fins-etapa-atual': 'Compor proposta',
          'patlas-fins-area-atual': 'DIRC',
        },
      },
      {
        id: 'patlas-fins-p-concluido',
        name: 'Concluído',
        iconColor: '#059669',
        fieldValues: {
          'patlas-fins-numero': 'PROC-2025-1200',
          'patlas-fins-status': 'Concluído',
          'patlas-fins-etapa-atual': 'Cadastro contratual',
        },
      },
      {
        id: 'patlas-fins-p-ajuste',
        name: 'Aguardando ajuste',
        iconColor: '#b91c1c',
        fieldValues: {
          'patlas-fins-status': 'Aguardando ajuste',
          'patlas-fins-etapa-atual': 'Compor proposta',
          'patlas-fins-area-atual': 'DIRC',
        },
      },
      {
        id: 'patlas-fins-p-cancelado',
        name: 'Cancelado',
        iconColor: '#94a3b8',
        fieldValues: {
          'patlas-fins-status': 'Cancelado',
        },
      },
    ],
    activeExamplePresetId: 'patlas-fins-p-tjmt',
  }
}

export function buildDocParametroForm() {
  return {
    id: FORM_DOC_PARAMETRO,
    name: 'Documento — parâmetro',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'Campo variável usado no HTML do modelo de documento.',
    fields: [
      field('patlas-dpar-id', 'ID do campo', 'text', {
        required: true,
        relevance: 'identity',
        spec: 'Placeholder no HTML, ex.: {{patlas-prp-cliente}}.',
      }),
      field('patlas-dpar-label', 'Nome do parâmetro', 'text', { required: true }),
      field('patlas-dpar-origem', 'Origem', 'textOptions', {
        options: ['Proposta', 'Item proposta', 'Organização', 'Contrato', 'Manual'],
        spec: 'De onde o sistema obtém o valor.',
      }),
      field('patlas-dpar-obrigatorio', 'Obrigatório', 'boolean', {}),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-dpar-p-cliente',
        name: 'Cliente',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-dpar-id': 'patlas-prp-cliente',
          'patlas-dpar-label': 'Cliente',
          'patlas-dpar-origem': 'Proposta',
          'patlas-dpar-obrigatorio': 'true',
        },
      },
      {
        id: 'patlas-dpar-p-numero',
        name: 'Número proposta',
        iconColor: '#6366f1',
        fieldValues: {
          'patlas-dpar-id': 'patlas-prp-numero',
          'patlas-dpar-label': 'Número da proposta',
          'patlas-dpar-origem': 'Proposta',
          'patlas-dpar-obrigatorio': 'true',
        },
      },
      {
        id: 'patlas-dpar-p-itens',
        name: 'Tabela itens',
        iconColor: '#059669',
        fieldValues: {
          'patlas-dpar-id': 'patlas-prp-itens-tabela',
          'patlas-dpar-label': 'Itens da proposta',
          'patlas-dpar-origem': 'Item proposta',
        },
      },
      {
        id: 'patlas-dpar-p-org',
        name: 'Organização cliente',
        iconColor: '#0369a1',
        fieldValues: {
          'patlas-dpar-id': 'patlas-prp-organizacao-cliente',
          'patlas-dpar-label': 'Organização cliente',
          'patlas-dpar-origem': 'Organização',
        },
      },
      {
        id: 'patlas-dpar-p-manual',
        name: 'Observação manual',
        iconColor: '#64748b',
        fieldValues: {
          'patlas-dpar-id': 'observacao-comercial',
          'patlas-dpar-label': 'Observação',
          'patlas-dpar-origem': 'Manual',
        },
      },
    ],
    activeExamplePresetId: 'patlas-dpar-p-cliente',
  }
}

export function buildDocModeloForm() {
  const secI = 'sec-patlas-dmod-ident'
  const secC = 'sec-patlas-dmod-conteudo'
  const secP = 'sec-patlas-dmod-parametros'
  return {
    id: FORM_DOC_MODELO,
    name: 'Modelo de documento',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata: 'Template HTML com parâmetros para gerar proposta ou outros documentos.',
    methods: [
      { id: 'patlas-dmod-meth-preview', name: 'Pré-visualizar', icon: 'visibility', kind: 'destaque' },
      { id: 'patlas-dmod-meth-publicar', name: 'Publicar', icon: 'verified', kind: 'menu' },
    ],
    sections: [
      { id: secI, title: 'Identificação', icon: 'description' },
      { id: secC, title: 'Conteúdo HTML', icon: 'article' },
      { id: secP, title: 'Parâmetros', icon: 'tune' },
    ],
    fields: [
      field('patlas-dmod-nome', 'Nome', 'text', {
        sectionId: secI,
        size: 'large',
        required: true,
        relevance: 'identity',
      }),
      field('patlas-dmod-tipo', 'Tipo', 'textOptions', {
        sectionId: secI,
        required: true,
        options: TIPOS_DOC,
        spec: 'Tipo do documento, como Proposta ou Contrato.',
      }),
      field('patlas-dmod-versao', 'Versão', 'text', {
        sectionId: secI,
        size: 'small',
        required: true,
        relevance: 'highlight',
      }),
      field('patlas-dmod-status', 'Status', 'textOptions', {
        sectionId: secI,
        required: true,
        options: STATUS_DOC_MODELO,
        spec: 'Somente modelos Publicados geram documento.',
      }),
      field('patlas-dmod-alerta-publicado', 'Regra de publicação', 'alert', {
        sectionId: secI,
        readOnly: true,
        alertVariant: 'warning',
        alertTitle: 'Publicado é imutável',
        alertMessage: 'Alterações exigem nova versão em Rascunho e nova publicação.',
      }),
      field('patlas-dmod-html', 'HTML com campos variáveis', 'html', {
        sectionId: secC,
        size: 'large',
        required: true,
        htmlContent:
          '<h1>Proposta {{patlas-prp-numero}}</h1><p>Cliente: {{patlas-prp-organizacao-cliente}}</p><p>Itens: {{patlas-prp-itens-tabela}}</p>',
        spec: 'Conteúdo com placeholders {{id_do_campo}}.',
      }),
      field(EMB_DOC_PARAMETROS, 'Parâmetros', 'embeddedReference', {
        sectionId: secP,
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_DOC_PARAMETRO,
        spec: 'Campos variáveis usados no documento.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-dmod-p-proposta',
        name: 'Proposta padrão — publicado',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-dmod-nome': 'Proposta comercial padrão',
          'patlas-dmod-tipo': 'Proposta',
          'patlas-dmod-versao': '1.0',
          'patlas-dmod-status': 'Publicado',
        },
        embeddedRowsByFieldId: {
          [EMB_DOC_PARAMETROS]: [
            { 'patlas-dpar-id': 'patlas-prp-numero', 'patlas-dpar-label': 'Número', 'patlas-dpar-origem': 'Proposta' },
            { 'patlas-dpar-id': 'patlas-prp-organizacao-cliente', 'patlas-dpar-label': 'Cliente', 'patlas-dpar-origem': 'Organização' },
          ],
        },
      },
      {
        id: 'patlas-dmod-p-rascunho',
        name: 'Rascunho — em edição',
        iconColor: '#64748b',
        fieldValues: {
          'patlas-dmod-nome': 'Proposta v2 (rascunho)',
          'patlas-dmod-tipo': 'Proposta',
          'patlas-dmod-versao': '2.0',
          'patlas-dmod-status': 'Rascunho',
        },
      },
      {
        id: 'patlas-dmod-p-contrato',
        name: 'Contrato',
        iconColor: '#0369a1',
        fieldValues: {
          'patlas-dmod-nome': 'Minuta contratual',
          'patlas-dmod-tipo': 'Contrato',
          'patlas-dmod-versao': '1.0',
          'patlas-dmod-status': 'Publicado',
        },
      },
      {
        id: 'patlas-dmod-p-handover',
        name: 'Handover',
        iconColor: '#059669',
        fieldValues: {
          'patlas-dmod-nome': 'Termo de handover',
          'patlas-dmod-tipo': 'Handover',
          'patlas-dmod-versao': '1.0',
          'patlas-dmod-status': 'Rascunho',
        },
      },
      {
        id: 'patlas-dmod-p-substituido',
        name: 'Substituído',
        iconColor: '#94a3b8',
        fieldValues: {
          'patlas-dmod-nome': 'Proposta legado',
          'patlas-dmod-tipo': 'Proposta',
          'patlas-dmod-versao': '0.9',
          'patlas-dmod-status': 'Substituído',
        },
      },
    ],
    activeExamplePresetId: 'patlas-dmod-p-proposta',
  }
}

export function buildDocGeradoForm() {
  const secI = 'sec-patlas-dger-ident'
  const secA = 'sec-patlas-dger-arquivo'
  const secS = 'sec-patlas-dger-ass'
  return {
    id: FORM_DOC_GERADO,
    name: 'Documento gerado',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'read',
    metadata: 'Documento gerado a partir de modelo publicado e dados da proposta.',
    methods: [
      { id: 'patlas-dger-meth-preview', name: 'Pré-visualizar', icon: 'visibility', kind: 'destaque' },
      { id: 'patlas-dger-meth-baixar', name: 'Baixar', icon: 'download', kind: 'menu' },
    ],
    sections: [
      { id: secI, title: 'Identificação', icon: 'description' },
      { id: secA, title: 'Arquivo', icon: 'folder' },
      { id: secS, title: 'Assinaturas', icon: 'draw' },
    ],
    fields: [
      field('patlas-dger-nome', 'Nome do documento', 'text', {
        sectionId: secI,
        size: 'large',
        readOnly: true,
        required: true,
        relevance: 'identity',
      }),
      field('patlas-dger-modelo', 'Modelo usado', 'reference', {
        sectionId: secI,
        readOnly: true,
        required: true,
        linkedFormId: FORM_DOC_MODELO,
        spec: 'Modelo de documento que originou o arquivo (deve estar Publicado na geração).',
      }),
      field('patlas-dger-modelo-versao', 'Versão do modelo', 'text', {
        sectionId: secI,
        size: 'small',
        readOnly: true,
        spec: 'Versão do modelo no momento da geração.',
      }),
      field('patlas-dger-proposta', 'Proposta vinculada', 'reference', {
        sectionId: secI,
        linkedFormId: FORM_PROPOSTA_FASE1,
        size: 'large',
        spec: 'Proposta que gerou o documento.',
      }),
      field('patlas-dger-proposta-versao', 'Versão da proposta', 'text', {
        sectionId: secI,
        readOnly: true,
        spec: 'Versão da proposta usada no documento (ex.: v1, v2).',
      }),
      field('patlas-dger-status', 'Status', 'textOptions', {
        sectionId: secI,
        readOnly: true,
        options: ['Gerado', 'Em assinatura', 'Assinado', 'Substituído', 'Cancelado'],
      }),
      field('patlas-dger-arquivo', 'Documento gerado', 'file', {
        sectionId: secA,
        size: 'large',
        multiple: true,
        spec: 'Arquivo ou visualização gerada.',
      }),
      field(EMB_DOC_TRAMITES, 'Pendências de assinatura', 'embeddedReference', {
        sectionId: secS,
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_TRAMITE_ASSINATURA,
        readOnly: true,
        spec: 'Assinaturas relacionadas ao documento, quando aplicável.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-dger-p-tjmt',
        name: 'Proposta TJMT gerada',
        iconColor: '#059669',
        fieldValues: {
          'patlas-dger-nome': 'Proposta PROP-2025-0042 — TJMT',
          'patlas-dger-modelo': 'Proposta comercial padrão',
          'patlas-dger-modelo-versao': '1.0',
          'patlas-dger-proposta': 'PROP-2025-0042',
          'patlas-dger-proposta-versao': 'v1',
          'patlas-dger-status': 'Em assinatura',
        },
      },
      {
        id: 'patlas-dger-p-gerado',
        name: 'Gerado — aguardando envio',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-dger-nome': 'Proposta rascunho documento',
          'patlas-dger-modelo': 'Proposta comercial padrão',
          'patlas-dger-status': 'Gerado',
        },
      },
      {
        id: 'patlas-dger-p-assinado',
        name: 'Assinado',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlas-dger-status': 'Assinado',
          'patlas-dger-proposta-versao': 'v2',
        },
      },
      {
        id: 'patlas-dger-p-sefaz',
        name: 'SEFAZ manual',
        iconColor: '#0369a1',
        fieldValues: {
          'patlas-dger-nome': 'Proposta PROP-2025-0099',
          'patlas-dger-proposta': 'PROP-2025-0099',
          'patlas-dger-status': 'Gerado',
        },
      },
      {
        id: 'patlas-dger-p-cancelado',
        name: 'Cancelado',
        iconColor: '#94a3b8',
        fieldValues: {
          'patlas-dger-status': 'Cancelado',
        },
      },
    ],
    activeExamplePresetId: 'patlas-dger-p-tjmt',
  }
}

export const PROPOSTA_SEC_PROCESSO = {
  id: 'sec-patlas-prp-processo',
  title: 'Fluxo e documento',
  icon: 'account_tree',
}

/** Campos de fluxo/documento na proposta Fase 1. */
export function propostaParametrizacaoFields(fieldFn) {
  return [
    fieldFn('patlas-prp-fluxo-modelo', 'Modelo de fluxo', 'reference', {
      sectionId: PROPOSTA_SEC_PROCESSO.id,
      size: 'large',
      required: true,
      linkedFormId: FORM_FLUXO_MODELO,
      relevance: 'highlight',
      spec: 'Obrigatório antes de submeter a proposta.',
    }),
    fieldFn('patlas-prp-fluxo-versao', 'Versão do fluxo', 'reference', {
      sectionId: PROPOSTA_SEC_PROCESSO.id,
      required: true,
      linkedFormId: FORM_FLUXO_VERSAO,
      relevance: 'highlight',
      spec: 'Versão congelada ao submeter; novos processos usam versão ativa do modelo.',
    }),
    fieldFn('patlas-prp-doc-modelo', 'Modelo de documento', 'reference', {
      sectionId: PROPOSTA_SEC_PROCESSO.id,
      linkedFormId: FORM_DOC_MODELO,
      spec: 'Modelo publicado para gerar o documento da proposta.',
    }),
    fieldFn('patlas-prp-versao-documento', 'Versão da proposta (documento)', 'text', {
      sectionId: PROPOSTA_SEC_PROCESSO.id,
      size: 'small',
      spec: 'Versão usada na geração do documento (ex.: v1).',
    }),
    fieldFn('patlas-prp-processo-andamento', 'Processo em andamento', 'reference', {
      sectionId: PROPOSTA_SEC_PROCESSO.id,
      readOnly: true,
      linkedFormId: FORM_FLUXO_INSTANCIA,
      spec: 'Preenchido ao submeter a proposta — instância do fluxo.',
    }),
    fieldFn('patlas-prp-documento-gerado', 'Documento gerado', 'reference', {
      sectionId: PROPOSTA_SEC_PROCESSO.id,
      readOnly: true,
      linkedFormId: FORM_DOC_GERADO,
      spec: 'Último documento gerado a partir do modelo publicado.',
    }),
    fieldFn('patlas-prp-alerta-fluxo', 'Submissão', 'alert', {
      sectionId: PROPOSTA_SEC_PROCESSO.id,
      readOnly: true,
      alertVariant: 'info',
      alertTitle: 'Antes de submeter',
      alertMessage:
        'Informe modelo e versão de fluxo. Ao submeter, o sistema cria o processo em andamento com base na versão configurada.',
    }),
  ]
}

export const PROPOSTA_METODOS_PARAM = [
  { id: 'patlas-prp-meth-gerar-doc', name: 'Gerar documento', icon: 'description', kind: 'secundario' },
  { id: 'patlas-prp-meth-submeter', name: 'Submeter proposta', icon: 'send', kind: 'destaque' },
]

export function allParametrizacaoForms() {
  return [
    buildFluxoEtapaForm(),
    buildFluxoVersaoForm(),
    buildFluxoModeloForm(),
    buildFluxoInstanciaForm(),
    buildDocParametroForm(),
    buildDocModeloForm(),
    buildDocGeradoForm(),
  ]
}
