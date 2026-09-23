/**
 * Cotação — portal cliente + recebimento MTI (Projeto Atlas Fase 1).
 */
export const FORM_COTACAO_ITEM_LINHA = 'form-patlas-cotacao-item-linha'
export const FORM_COTACAO_RECEBIDA = 'form-patlas-cotacao-recebida'
export const FORM_PORTAL_COTACAO_CLIENTE = 'form-patlas-portal-cotacao-cliente'

export const FORM_ORGANIZACAO = 'form-patlas-organizacao'
export const FORM_PESSOA = 'form-patlas-pessoa'
export const FORM_PROPOSTA = 'form-patlas-proposta-fase1'

export const EMB_COTACAO_ITENS = 'emb_patlas_cotacao_itens'
export const PORTAL_COTACAO_ID = 'portal-patlas-cotacao-cliente'

const TIPO_ITEM = ['Produto vigente', 'Licença', 'Serviço', 'Outro']
const STATUS_COTACAO = ['Recebida', 'Em análise', 'Convertida em proposta', 'Enviada ao parceiro', 'Cancelada']
const STATUS_ENVIO_PARCEIRO = ['Não enviado', 'Enviado', 'Respondido']

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
    ...(opts.currency ? { currency: true } : {}),
    spec: opts.spec ?? '',
  }
}

export function cotacaoItemRow(p) {
  return {
    'patlas-coti-tipo': p.tipo ?? 'Serviço',
    'patlas-coti-descricao': p.descricao ?? '',
    'patlas-coti-quantidade': p.quantidade ?? 1,
    'patlas-coti-observacao': p.obs ?? '',
  }
}

const ITENS_DEMO_TJMT = [
  cotacaoItemRow({
    tipo: 'Serviço',
    descricao: 'Treinamento técnico presencial — módulo introdutório cloud',
    quantidade: 8,
    obs: 'Turma presencial em Cuiabá',
  }),
  cotacaoItemRow({
    tipo: 'Licença',
    descricao: 'EXECUÇÃO DE ANÁLISE DAST',
    quantidade: 1,
  }),
]

export function buildCotacaoItemLinhaForm() {
  return {
    id: FORM_COTACAO_ITEM_LINHA,
    name: 'Cotação — item',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'Linha de item solicitado pelo cliente no portal.',
    fields: [
      field('patlas-coti-tipo', 'Tipo', 'textOptions', { options: TIPO_ITEM, required: true }),
      field('patlas-coti-descricao', 'Descrição', 'text', { size: 'large', required: true, relevance: 'identity' }),
      field('patlas-coti-quantidade', 'Quantidade', 'number', { size: 'small', required: true }),
      field('patlas-coti-observacao', 'Observação do cliente', 'text', { size: 'large', textLong: true }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-coti-p-servico',
        name: 'Item — serviço',
        iconColor: '#059669',
        fieldValues: ITENS_DEMO_TJMT[0],
      },
      {
        id: 'patlas-coti-p-licenca',
        name: 'Item — licença',
        iconColor: '#7c3aed',
        fieldValues: ITENS_DEMO_TJMT[1],
      },
    ],
    activeExamplePresetId: 'patlas-coti-p-servico',
  }
}

export function buildCotacaoRecebidaForm() {
  const secCab = 'sec-patlas-cot-cab'
  const secSol = 'sec-patlas-cot-solicitante'
  const secItens = 'sec-patlas-cot-itens'
  const secProp = 'sec-patlas-cot-parceiro'
  return {
    id: FORM_COTACAO_RECEBIDA,
    name: 'Cotação recebida',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Cotação enviada pelo cliente no portal. MTI analisa, gera proposta Atlas e envia ao parceiro.',
    methods: [
      { id: 'patlas-cot-meth-gerar-proposta', name: 'Gerar proposta Atlas', icon: 'description', kind: 'destaque' },
      { id: 'patlas-cot-meth-enviar-parceiro', name: 'Enviar ao parceiro', icon: 'send', kind: 'destaque' },
      { id: 'patlas-cot-meth-iniciar-analise', name: 'Iniciar análise', icon: 'play_arrow', kind: 'secundario' },
    ],
    sections: [
      { id: secCab, title: 'Cabeçalho', icon: 'tag' },
      { id: secSol, title: 'Solicitante', icon: 'person' },
      { id: secItens, title: 'Itens da cotação', icon: 'list_alt' },
      { id: secProp, title: 'Proposta e parceiro', icon: 'handshake' },
    ],
    fields: [
      field('patlas-cot-numero', 'Número da cotação', 'text', {
        sectionId: secCab,
        required: true,
        relevance: 'identity',
        spec: 'Ex.: COT-2026-0042 — gerado no envio do portal.',
      }),
      field('patlas-cot-origem', 'Origem', 'textOptions', {
        sectionId: secCab,
        options: ['Portal Atlas Fase 1', 'Portal Convocação Pública', 'E-mail', 'Outro'],
      }),
      field('patlas-cot-data-recebimento', 'Data de recebimento', 'date', { sectionId: secCab, readOnly: true }),
      field('patlas-cot-status', 'Status', 'textOptions', {
        sectionId: secCab,
        required: true,
        relevance: 'highlight',
        options: STATUS_COTACAO,
      }),
      field('patlas-cot-responsavel-mti', 'Responsável MTI', 'reference', {
        sectionId: secCab,
        linkedFormId: FORM_PESSOA,
        spec: 'Analista DIRC que trata a cotação.',
      }),
      field('patlas-cot-observacoes-internas', 'Observações internas', 'text', {
        sectionId: secCab,
        size: 'large',
        textLong: true,
      }),
      field('patlas-cot-organizacao', 'Organização solicitante', 'reference', {
        sectionId: secSol,
        size: 'large',
        linkedFormId: FORM_ORGANIZACAO,
        relevance: 'identity',
      }),
      field('patlas-cot-contato-nome', 'Nome do responsável', 'text', { sectionId: secSol, required: true }),
      field('patlas-cot-contato-email', 'E-mail', 'text', { sectionId: secSol, size: 'large' }),
      field('patlas-cot-contato-telefone', 'Telefone', 'text', { sectionId: secSol }),
      field('patlas-cot-representante-legal', 'Representante legal', 'text', { sectionId: secSol }),
      field(EMB_COTACAO_ITENS, 'Itens solicitados', 'embeddedReference', {
        sectionId: secItens,
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_COTACAO_ITEM_LINHA,
        spec: 'Base para montar itens da proposta Atlas.',
      }),
      field('patlas-cot-proposta-vinculada', 'Proposta Atlas vinculada', 'reference', {
        sectionId: secProp,
        size: 'large',
        linkedFormId: FORM_PROPOSTA,
        readOnly: true,
        spec: 'Preenchido ao usar «Gerar proposta Atlas».',
      }),
      field('patlas-cot-parceiro', 'Parceiro destino', 'reference', {
        sectionId: secProp,
        size: 'large',
        linkedFormId: FORM_ORGANIZACAO,
        spec: 'Organização parceira que receberá a proposta.',
      }),
      field('patlas-cot-status-envio-parceiro', 'Status envio ao parceiro', 'textOptions', {
        sectionId: secProp,
        options: STATUS_ENVIO_PARCEIRO,
      }),
      field('patlas-cot-msg-parceiro', 'Mensagem ao parceiro', 'text', {
        sectionId: secProp,
        size: 'large',
        textLong: true,
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-cot-p-tjmt-recebida',
        name: 'TJMT — recebida',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-cot-numero': 'COT-2026-0042',
          'patlas-cot-origem': 'Portal Atlas Fase 1',
          'patlas-cot-data-recebimento': '2026-05-22',
          'patlas-cot-status': 'Recebida',
          'patlas-cot-organizacao': 'Tribunal de Justiça de Mato Grosso',
          'patlas-cot-contato-nome': 'Roberto Alves Ferreira',
          'patlas-cot-contato-email': 'roberto.ferreira@tjmt.jus.br',
          'patlas-cot-contato-telefone': '(65) 3613-5000',
        },
        embeddedRowsByFieldId: { [EMB_COTACAO_ITENS]: ITENS_DEMO_TJMT },
      },
      {
        id: 'patlas-cot-p-em-analise',
        name: 'Em análise — DIRC',
        iconColor: '#6366f1',
        fieldValues: {
          'patlas-cot-numero': 'COT-2026-0043',
          'patlas-cot-status': 'Em análise',
          'patlas-cot-responsavel-mti': 'Lucas Santos',
          'patlas-cot-organizacao': 'Secretaria de Fazenda de Mato Grosso',
          'patlas-cot-contato-nome': 'Mariana Costa Silva',
        },
      },
      {
        id: 'patlas-cot-p-com-proposta',
        name: 'Com proposta gerada',
        iconColor: '#059669',
        fieldValues: {
          'patlas-cot-numero': 'COT-2026-0042',
          'patlas-cot-status': 'Convertida em proposta',
          'patlas-cot-responsavel-mti': 'Lucas Santos',
          'patlas-cot-organizacao': 'Tribunal de Justiça de Mato Grosso',
          'patlas-cot-proposta-vinculada': 'PROP-2025-0042',
          'patlas-cot-parceiro': 'Parceiro Simplifica Demo Ltda.',
          'patlas-cot-status-envio-parceiro': 'Não enviado',
        },
        embeddedRowsByFieldId: { [EMB_COTACAO_ITENS]: ITENS_DEMO_TJMT },
      },
      {
        id: 'patlas-cot-p-enviada-parceiro',
        name: 'Enviada ao parceiro',
        iconColor: '#047857',
        fieldValues: {
          'patlas-cot-numero': 'COT-2026-0040',
          'patlas-cot-status': 'Enviada ao parceiro',
          'patlas-cot-proposta-vinculada': 'PROP-2025-0040',
          'patlas-cot-parceiro': 'Parceiro Simplifica Demo Ltda.',
          'patlas-cot-status-envio-parceiro': 'Enviado',
          'patlas-cot-msg-parceiro': 'Favor revisar escopo e prazos para retorno em 5 dias úteis.',
        },
      },
      {
        id: 'patlas-cot-p-cancelada',
        name: 'Cancelada',
        iconColor: '#94a3b8',
        fieldValues: {
          'patlas-cot-numero': 'COT-2026-0030',
          'patlas-cot-status': 'Cancelada',
          'patlas-cot-observacoes-internas': 'Cliente desistiu antes da proposta.',
        },
      },
    ],
    activeExamplePresetId: 'patlas-cot-p-tjmt-recebida',
  }
}

export function buildPortalCotacaoClienteForm() {
  const secCab = 'sec-patlas-pcot-cab'
  const secEmp = 'sec-patlas-pcot-empresa'
  const secItens = 'sec-patlas-pcot-itens'
  return {
    id: FORM_PORTAL_COTACAO_CLIENTE,
    name: 'Portal — enviar cotação',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata: 'Formulário do cliente no portal (layout tipo Convocação Pública).',
    methods: [
      { id: 'patlas-pcot-meth-enviar', name: 'Enviar cotação', icon: 'send', kind: 'destaque' },
      { id: 'patlas-pcot-meth-adicionar-item', name: 'Adicionar item', icon: 'add', kind: 'secundario' },
    ],
    sections: [
      { id: secCab, title: 'Identificação', icon: 'description' },
      { id: secEmp, title: 'Empresa e contatos', icon: 'business' },
      { id: secItens, title: 'Itens desejados', icon: 'list_alt' },
    ],
    fields: [
      field('patlas-pcot-solucao', 'Solução / convocação', 'textOptions', {
        sectionId: secCab,
        size: 'large',
        required: true,
        options: [
          'MTI CLOUD — Prospecção de serviços em nuvem',
          'MTI Simplifica — Desburocratização',
          'MTI IA — Acelerador IA',
        ],
      }),
      field('patlas-pcot-razao-social', 'Razão social', 'text', {
        sectionId: secEmp,
        size: 'large',
        required: true,
        relevance: 'identity',
      }),
      field('patlas-pcot-cnpj', 'CNPJ', 'text', { sectionId: secEmp, required: true }),
      field('patlas-pcot-responsavel-nome', 'Responsável pelo cadastro', 'text', { sectionId: secEmp, required: true }),
      field('patlas-pcot-responsavel-email', 'E-mail', 'text', { sectionId: secEmp, size: 'large', required: true }),
      field('patlas-pcot-responsavel-telefone', 'Telefone', 'text', { sectionId: secEmp }),
      field('patlas-pcot-representante', 'Representante legal', 'text', { sectionId: secEmp }),
      field(EMB_COTACAO_ITENS, 'Itens da cotação', 'embeddedReference', {
        sectionId: secItens,
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_COTACAO_ITEM_LINHA,
        required: true,
        relevance: 'highlight',
      }),
      field('patlas-pcot-observacoes', 'Observações', 'text', {
        sectionId: secItens,
        size: 'large',
        textLong: true,
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-pcot-p-tjmt',
        name: 'Cliente — TJMT',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-pcot-solucao': 'MTI CLOUD — Prospecção de serviços em nuvem',
          'patlas-pcot-razao-social': 'Tribunal de Justiça de Mato Grosso',
          'patlas-pcot-cnpj': '03.496.991/0001-79',
          'patlas-pcot-responsavel-nome': 'Roberto Alves Ferreira',
          'patlas-pcot-responsavel-email': 'roberto.ferreira@tjmt.jus.br',
          'patlas-pcot-responsavel-telefone': '(65) 3613-5000',
        },
        embeddedRowsByFieldId: { [EMB_COTACAO_ITENS]: ITENS_DEMO_TJMT },
      },
      {
        id: 'patlas-pcot-p-sefaz',
        name: 'Cliente — SEFAZ',
        iconColor: '#0369a1',
        fieldValues: {
          'patlas-pcot-razao-social': 'Secretaria de Fazenda de Mato Grosso',
          'patlas-pcot-cnpj': '03.507.368/0001-54',
          'patlas-pcot-responsavel-nome': 'Mariana Costa Silva',
          'patlas-pcot-responsavel-email': 'gestao.contratos@sefaz.mt.gov.br',
        },
      },
      {
        id: 'patlas-pcot-p-rascunho',
        name: 'Rascunho parcial',
        iconColor: '#64748b',
        fieldValues: {
          'patlas-pcot-razao-social': 'Empresa demo',
          'patlas-pcot-responsavel-nome': 'Contato demo',
        },
      },
      {
        id: 'patlas-pcot-p-item-unico',
        name: 'Um item',
        iconColor: '#059669',
        fieldValues: {
          'patlas-pcot-razao-social': 'Órgão estadual demo',
          'patlas-pcot-cnpj': '00.000.000/0001-00',
          'patlas-pcot-responsavel-nome': 'Gestor contrato',
          'patlas-pcot-responsavel-email': 'gestor@demo.mt.gov.br',
        },
        embeddedRowsByFieldId: { [EMB_COTACAO_ITENS]: [ITENS_DEMO_TJMT[0]] },
      },
      {
        id: 'patlas-pcot-p-completo',
        name: 'Envio completo',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlas-pcot-solucao': 'MTI Simplifica — Desburocratização',
          'patlas-pcot-razao-social': 'Parceiro interessado Ltda.',
          'patlas-pcot-cnpj': '11.111.111/0001-11',
          'patlas-pcot-responsavel-nome': 'Ana Paula Mendes',
          'patlas-pcot-responsavel-email': 'ana.mendes@simplifica.demo',
          'patlas-pcot-representante': 'Ana Paula Mendes',
        },
        embeddedRowsByFieldId: { [EMB_COTACAO_ITENS]: ITENS_DEMO_TJMT },
      },
    ],
    activeExamplePresetId: 'patlas-pcot-p-tjmt',
  }
}

/** Portal estilo Convocação Pública (sem header de busca/perfil). */
export const portalCotacaoCliente = {
  id: PORTAL_COTACAO_ID,
  name: 'Portal — Cotação Atlas',
  servicePortalHomeColorPrimary: '#0048b6',
  servicePortalHomeColorSecondary: '#0048b6',
  servicePortalHomeColorText: '#212121',
  servicePortalHomeColorBackground: '#ffffff',
  servicePortalHomeSections: [
    {
      id: 'sec-patlas-portal-menu',
      type: 'catalog',
      name: 'Menu',
      title: 'Cotação comercial',
      catalogs: [
        {
          id: 'cat-patlas-portal-acoes',
          name: 'Ações',
          services: [
            {
              id: 'svc-patlas-nova-cotacao',
              name: 'Enviar cotação',
              code: 'PORTAL-NOVA-COT',
              description: 'Informe empresa, contatos e itens desejados.',
              icon: 'description',
            },
            {
              id: 'svc-patlas-acompanhar',
              name: 'Acompanhar solicitações',
              code: 'PORTAL-ACOMP',
              description: 'Consulte protocolos enviados.',
              icon: 'history',
            },
          ],
        },
      ],
    },
    {
      id: 'sec-patlas-portal-info',
      type: 'html',
      htmlContent:
        '<p style="margin:12px 16px;color:#616161;font-size:0.9rem;">Layout de portal público: barra azul com título, sem menu de busca ou perfil. Após enviar, a MTI recebe em <strong>Cotações recebidas</strong>.</p>',
    },
  ],
}

export const flowPortalCotacao = {
  id: 'flow-patlas-portal-cotacao',
  name: 'Portal — cotação cliente',
  steps: [
    {
      id: 'step-patlas-portal-home',
      title: 'Cotação comercial Atlas',
      type: 'servicePortal',
      servicePortalSubtype: 'homePage',
      linkedServicePortalId: PORTAL_COTACAO_ID,
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Cotação comercial Atlas',
      servicePortalPresentationDescription: 'Menu estilo Convocação Pública: enviar cotação ou acompanhar.',
      servicePortalServiceNavigateStepIds: {
        'svc-patlas-nova-cotacao': 'step-patlas-portal-form',
        'svc-patlas-acompanhar': 'step-patlas-portal-lista',
      },
    },
    {
      id: 'step-patlas-portal-form',
      title: 'Enviar cotação',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      linkedFormId: FORM_PORTAL_COTACAO_CLIENTE,
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Cadastro da cotação',
      assigneeRole: 'Cliente / solicitante',
      bpmnActivityKey: 'Montar e enviar cotação',
      bpmnDescription: 'Dados da empresa e itens. Envio gera registro em Cotações recebidas (MTI).',
      bpmnFormConfirmNavigateStepId: 'step-patlas-portal-confirmacao',
    },
    {
      id: 'step-patlas-portal-confirmacao',
      title: 'Cotação enviada',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Cotação comercial Atlas',
      htmlContent:
        '<div style="padding:24px;max-width:640px;"><p><strong>Cotação enviada com sucesso.</strong></p><p>Protocolo de exemplo: <code>COT-2026-0042</code>. A MTI analisará e poderá gerar uma proposta para o parceiro.</p></div>',
    },
    {
      id: 'step-patlas-portal-lista',
      title: 'Acompanhar solicitações',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      linkedFormId: FORM_COTACAO_RECEBIDA,
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Solicitações',
      assigneeRole: 'Cliente',
      bpmnActivityKey: 'Consultar protocolos',
      bpmnDescription: 'Visão somente leitura dos protocolos (protótipo usa preset de cotação).',
      readOnly: true,
    },
  ],
}

export function allCotacaoForms() {
  return [buildCotacaoItemLinhaForm(), buildCotacaoRecebidaForm(), buildPortalCotacaoClienteForm()]
}
