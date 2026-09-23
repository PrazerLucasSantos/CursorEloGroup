#!/usr/bin/env node
/**
 * Dossiê da Entrega de Valor — tela única com cabeçalho fixo e 5 abas (DTIC, UGEPV, ASCOM, Monitoramento, Timeline).
 * Uso: node scripts/patch-atlas-prototipo-dossie-entrega-valor.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')
const WS_PATH = path.join(EPIC_DIR, 'workspaces.json')

const FORM_MAIN = 'form-patlasv4-proto-dossie-entrega-valor'
const FORM_KPI = 'form-patlasv4-proto-ev-kpi'
const FORM_MED = 'form-patlasv4-proto-ev-kpi-medicao'
const FORM_PA = 'form-patlasv4-proto-ev-plano-acao'
const FORM_TR = 'form-patlasv4-proto-ev-transicao-status'
const FORM_MR = 'form-patlasv4-proto-ev-timeline-marco'
const FORM_DEVOLVER = 'form-patlasv4-proto-ev-metodo-devolver'

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_CONTRATO = 'form-patlasv4-proto-contrato'
const FORM_OS = 'form-patlasv4-proto-emissao-ordem-servico'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'

const SEC_DTIC = 'sec-patlasv4proto-ev-dtic'
const SEC_UGEPV = 'sec-patlasv4proto-ev-ugepv'
const SEC_ASCOM = 'sec-patlasv4proto-ev-ascom'
const SEC_MON = 'sec-patlasv4proto-ev-monitoramento'
const SEC_TL = 'sec-patlasv4proto-ev-timeline'

const F_STATUS = 'patlasv4proto-ev-status-governanca'
const F_NOME = 'patlasv4proto-ev-nome-entrega'
const F_CLIENTE = 'patlasv4proto-ev-cliente'
const F_TTFV = 'patlasv4proto-ev-ttfv'

const STATUS = {
  EM_ENTREGA: 'Em Entrega',
  ENTREGUE: 'Entregue',
  PARA_DIVULGACAO: 'Para Divulgação',
  DIVULGADO: 'Divulgado',
  EM_MONITORAMENTO: 'Em Monitoramento',
}

const UO_OPTS = [
  'Secretaria de Estado de Planejamento e Gestão',
  'Empresa Mato-grossense de Tecnologia da Informação',
  'EloGroup',
]
const PESSOA_OPTS = ['Felipe Oliveira Costa', 'Carlos Eduardo Souza', 'Helena Ribeiro Lima']

function f(id, label, type, sectionId, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    sectionId,
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
    ...(opts.alertVariant ? { alertVariant: opts.alertVariant } : {}),
    ...(opts.alertTitle ? { alertTitle: opts.alertTitle } : {}),
    ...(opts.alertMessage ? { alertMessage: opts.alertMessage } : {}),
  }
}

function buildKpiForm() {
  return {
    id: FORM_KPI,
    name: 'Entrega de Valor — KPI',
    sectionLayout: 'none',
    metadata: 'Indicador/KPI de resultado cadastrado na aba DTIC (sem valores mensais nesta etapa).',
    fields: [
      f('patlasv4proto-ev-kpi-nome', 'Indicador', 'text', null, {
        required: true,
        relevance: 'identity',
        spec: 'Ex.: Usuários ativos, Pessoas atingidas, Processos digitalizados.',
      }),
      f('patlasv4proto-ev-kpi-unidade', 'Unidade / métrica', 'text', null, {
        required: true,
        spec: 'Ex.: usuários, pessoas, % de adoção.',
      }),
      f('patlasv4proto-ev-kpi-meta', 'Meta de referência', 'number', null, {
        spec: 'Valor alvo acordado com o cliente (opcional na DTIC).',
      }),
    ],
  }
}

function buildMedicaoForm() {
  return {
    id: FORM_MED,
    name: 'Entrega de Valor — Medição mensal',
    sectionLayout: 'none',
    metadata: 'Aferição mensal de uso vinculada a um KPI da entrega.',
    fields: [
      f('patlasv4proto-ev-med-kpi', 'KPI', 'text', null, {
        required: true,
        relevance: 'identity',
        spec: 'Indicador cadastrado na aba DTIC.',
      }),
      f('patlasv4proto-ev-med-competencia', 'Competência', 'text', null, {
        required: true,
        size: 'small',
        spec: 'Ex.: Mês 1, Fev/2026.',
      }),
      f('patlasv4proto-ev-med-valor', 'Valor aferido', 'number', null, {
        required: true,
        relevance: 'highlight',
        spec: 'Ex.: 20 usuários no Mês 1, 152 no Mês 2.',
      }),
    ],
  }
}

function buildPlanoAcaoForm() {
  return {
    id: FORM_PA,
    name: 'Entrega de Valor — Plano de ação',
    sectionLayout: 'none',
    metadata: 'Plano de ação quando a adoção está abaixo do esperado (Success Gap).',
    fields: [
      f('patlasv4proto-ev-pa-desc', 'Descrição da ação', 'text', null, {
        required: true,
        textLong: true,
        relevance: 'identity',
      }),
      f('patlasv4proto-ev-pa-prevista', 'Data prevista', 'date', null, { required: true }),
      f('patlasv4proto-ev-pa-realizada', 'Data realizada', 'date', null),
      f('patlasv4proto-ev-pa-responsavel', 'Responsável', 'reference', null, {
        required: true,
        linkedFormId: FORM_PESSOA,
        options: PESSOA_OPTS,
      }),
      f('patlasv4proto-ev-pa-origem', 'Origem', 'textOptions', null, {
        required: true,
        options: ['MTI', 'Parceiro', 'Cliente'],
      }),
      f('patlasv4proto-ev-pa-status', 'Status', 'textOptions', null, {
        required: true,
        options: ['Planejado', 'Em execução', 'Concluído'],
      }),
      f('patlasv4proto-ev-pa-comprovante', 'Comprovante de execução', 'file', null, {
        spec: 'Evidência da ação realizada (PDF, imagem, etc.).',
      }),
    ],
  }
}

function buildTransicaoForm() {
  return {
    id: FORM_TR,
    name: 'Entrega de Valor — Transição de status',
    sectionLayout: 'none',
    metadata: 'Trilha de auditoria: situação anterior/nova, data, usuário e justificativa.',
    fields: [
      f('patlasv4proto-ev-tr-anterior', 'Situação anterior', 'text', null, {
        required: true,
        size: 'small',
      }),
      f('patlasv4proto-ev-tr-nova', 'Situação nova', 'text', null, {
        required: true,
        size: 'small',
        relevance: 'highlight',
      }),
      f('patlasv4proto-ev-tr-datahora', 'Data e hora', 'text', null, {
        required: true,
        readOnly: true,
        size: 'small',
      }),
      f('patlasv4proto-ev-tr-usuario', 'Usuário', 'reference', null, {
        required: true,
        linkedFormId: FORM_PESSOA,
        options: PESSOA_OPTS,
      }),
      f('patlasv4proto-ev-tr-justificativa', 'Justificativa', 'text', null, {
        textLong: true,
        spec: 'Obrigatória em reprovações (ex.: UGEPV devolve para DTIC).',
      }),
    ],
  }
}

function buildMarcoForm() {
  return {
    id: FORM_MR,
    name: 'Entrega de Valor — Marco da timeline',
    sectionLayout: 'none',
    metadata: 'Marco plotado na linha do tempo gráfica do dossiê.',
    fields: [
      f('patlasv4proto-ev-mr-tipo', 'Tipo de marco', 'textOptions', null, {
        required: true,
        relevance: 'identity',
        options: [
          'Em homologação',
          'Homologado',
          'Em produção',
          'Divulgado',
          'Medição de monitoramento',
          'Plano de ação concluído',
        ],
      }),
      f('patlasv4proto-ev-mr-data', 'Data', 'date', null, { required: true }),
      f('patlasv4proto-ev-mr-desc', 'Descrição', 'text', null, { spec: 'Detalhe opcional do marco.' }),
    ],
  }
}

function buildDevolverForm() {
  return {
    id: FORM_DEVOLVER,
    name: 'Devolver entrega — justificativa',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'Parâmetro do método Devolver para Em Entrega (Success Gap / reprovação UGEPV).',
    fields: [
      f('patlasv4proto-ev-md-justificativa', 'Justificativa', 'text', null, {
        required: true,
        textLong: true,
        relevance: 'highlight',
        spec: 'Registrada na Trilha de Auditoria (Aba 5). Bloqueia edição das abas 2, 3 e 4.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-ev-devolver-gap',
        name: 'Success Gap — baixa adoção',
        iconColor: '#b45309',
        fieldValues: {
          'patlasv4proto-ev-md-justificativa':
            'Adoção abaixo de 30% após 60 dias. Necessário replanejamento de capacitação com o cliente.',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-ev-devolver-gap',
  }
}

const TAB2_FIELDS = [
  'patlasv4proto-ev-ugepv-alerta',
  'patlasv4proto-ev-ugepv-data-entrevista',
  'patlasv4proto-ev-ugepv-resp-cliente',
  'patlasv4proto-ev-ugepv-parecer-cs',
  'patlasv4proto-ev-ugepv-situacao-valor',
  'patlasv4proto-ev-ugepv-relatorio',
]

const TAB3_FIELDS = [
  'patlasv4proto-ev-ascom-alerta',
  'patlasv4proto-ev-ascom-data-divulgacao',
  'patlasv4proto-ev-ascom-canais',
  'patlasv4proto-ev-ascom-comprovantes',
]

const TAB4_FIELDS = [
  'patlasv4proto-ev-mon-alerta',
  'patlasv4proto-ev-mon-proximo-ciclo',
  'patlasv4proto-ev-mon-medicoes',
  'patlasv4proto-ev-mon-planos',
]

function buildVisibilityRules() {
  const rules = []

  rules.push({
    id: 'rule-ev-hide-ugepv-em-entrega',
    operator: 'eq',
    sourceFieldId: F_STATUS,
    sourceKind: 'textOptions',
    expectedOptionText: STATUS.EM_ENTREGA,
    action: 'hide',
    targetFieldIds: TAB2_FIELDS,
  })

  for (const st of [STATUS.PARA_DIVULGACAO, STATUS.DIVULGADO, STATUS.EM_MONITORAMENTO]) {
    rules.push({
      id: `rule-ev-ro-ugepv-${st.replace(/\s/g, '-').toLowerCase()}`,
      operator: 'eq',
      sourceFieldId: F_STATUS,
      sourceKind: 'textOptions',
      expectedOptionText: st,
      action: 'readonly',
      targetFieldIds: TAB2_FIELDS.filter((id) => !id.endsWith('-alerta')),
    })
  }

  rules.push({
    id: 'rule-ev-hide-ascom-em-entrega',
    operator: 'eq',
    sourceFieldId: F_STATUS,
    sourceKind: 'textOptions',
    expectedOptionText: STATUS.EM_ENTREGA,
    action: 'hide',
    targetFieldIds: TAB3_FIELDS,
  })
  rules.push({
    id: 'rule-ev-hide-ascom-entregue',
    operator: 'eq',
    sourceFieldId: F_STATUS,
    sourceKind: 'textOptions',
    expectedOptionText: STATUS.ENTREGUE,
    action: 'hide',
    targetFieldIds: TAB3_FIELDS,
  })

  for (const st of [STATUS.DIVULGADO, STATUS.EM_MONITORAMENTO]) {
    rules.push({
      id: `rule-ev-ro-ascom-${st.replace(/\s/g, '-').toLowerCase()}`,
      operator: 'eq',
      sourceFieldId: F_STATUS,
      sourceKind: 'textOptions',
      expectedOptionText: st,
      action: 'readonly',
      targetFieldIds: TAB3_FIELDS.filter((id) => !id.endsWith('-alerta')),
    })
  }

  for (const st of [STATUS.EM_ENTREGA, STATUS.ENTREGUE, STATUS.PARA_DIVULGACAO]) {
    rules.push({
      id: `rule-ev-hide-mon-${st.replace(/\s/g, '-').toLowerCase()}`,
      operator: 'eq',
      sourceFieldId: F_STATUS,
      sourceKind: 'textOptions',
      expectedOptionText: st,
      action: 'hide',
      targetFieldIds: TAB4_FIELDS,
    })
  }

  return rules
}

function buildMainForm() {
  return {
    id: FORM_MAIN,
    name: 'Dossiê da Entrega de Valor',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'read',
    metadata:
      'Tela única de governança da entrega de valor. Cabeçalho: Nome, Cliente, Status e TTFV. ' +
      'Abas DTIC → UGEPV → ASCOM → Monitoramento → Timeline. Travas de progressão por status.',
    sections: [
      { id: SEC_DTIC, title: 'Dados Técnicos (DTIC)', icon: 'engineering' },
      { id: SEC_UGEPV, title: 'Auditoria de Pós-Venda (UGEPV)', icon: 'fact_check' },
      { id: SEC_ASCOM, title: 'Divulgação Institucional (ASCOM)', icon: 'campaign' },
      { id: SEC_MON, title: 'Monitoramento e Planos de Ação', icon: 'monitoring' },
      { id: SEC_TL, title: 'Timeline e Trilha de Auditoria', icon: 'timeline' },
    ],
    fields: [
      f(F_NOME, 'Nome da Entrega', 'text', SEC_DTIC, {
        required: true,
        relevance: 'identity',
        size: 'large',
        spec: 'Título da entrega de valor exibido no cabeçalho fixo.',
      }),
      f(F_CLIENTE, 'Cliente', 'reference', SEC_DTIC, {
        required: true,
        relevance: 'highlight',
        linkedFormId: FORM_UO,
        options: UO_OPTS,
      }),
      f(F_STATUS, 'Status de Governança', 'textOptions', SEC_DTIC, {
        required: true,
        relevance: 'highlight',
        readOnly: true,
        options: Object.values(STATUS),
        spec: 'Máquina de estados: Em Entrega → Entregue → Para Divulgação → Divulgado → Em Monitoramento.',
      }),
      f(F_TTFV, 'TTFV (Time to First Value)', 'text', SEC_DTIC, {
        readOnly: true,
        relevance: 'highlight',
        size: 'small',
        spec: 'Cálculo automático: dias entre go-live e primeira medição de valor comprovada.',
      }),

      f('patlasv4proto-ev-dtic-alerta', 'Orientação DTIC', 'alert', SEC_DTIC, {
        alertVariant: 'info',
        alertTitle: 'Aba 1 — Início do processo',
        alertMessage:
          'Preenchida pela DTIC para iniciar a entrega. Cadastre os KPIs de resultado (sem valores mensais nesta etapa).',
      }),
      f('patlasv4proto-ev-snow', 'Nº projeto ServiceNow', 'text', SEC_DTIC, {
        required: true,
        size: 'small',
        spec: 'Ex.: PRJ0012345.',
      }),
      f('patlasv4proto-ev-contrato', 'Contrato', 'reference', SEC_DTIC, {
        linkedFormId: FORM_CONTRATO,
        options: ['076/2025/SEPLAG', '163/2025/PMC'],
      }),
      f('patlasv4proto-ev-os', 'Ordem de Serviço', 'reference', SEC_DTIC, {
        linkedFormId: FORM_OS,
        options: ['ORSR0002026'],
      }),
      f('patlasv4proto-ev-parceiro', 'Parceiro', 'reference', SEC_DTIC, {
        linkedFormId: FORM_UO,
        options: ['EloGroup'],
      }),
      f('patlasv4proto-ev-resp-delivery', 'Responsável pelo delivery', 'reference', SEC_DTIC, {
        required: true,
        linkedFormId: FORM_PESSOA,
        options: PESSOA_OPTS,
      }),
      f('patlasv4proto-ev-desc-valor', 'Descrição do Valor para o Cliente', 'text', SEC_DTIC, {
        required: true,
        textLong: true,
        size: 'large',
        spec: 'Qual a promessa de impacto? Ex.: Reduzir em 40% o tempo de tramitação de processos.',
      }),
      f('patlasv4proto-ev-kpis', 'Indicadores / KPIs de resultado', 'embeddedReference', SEC_DTIC, {
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_KPI,
        spec: 'Cadastro dos KPIs; valores mensais na aba Monitoramento.',
      }),

      f('patlasv4proto-ev-ugepv-alerta', 'Orientação UGEPV', 'alert', SEC_UGEPV, {
        alertVariant: 'info',
        alertTitle: 'Aba 2 — Ativa quando status = Entregue',
        alertMessage:
          'Trava 1: o fluxo para "Para Divulgação" só libera após salvar esta aba. Reprovação devolve para Em Entrega com justificativa na Timeline.',
      }),
      f('patlasv4proto-ev-ugepv-data-entrevista', 'Data da entrevista', 'date', SEC_UGEPV, { required: true }),
      f('patlasv4proto-ev-ugepv-resp-cliente', 'Responsável no cliente', 'text', SEC_UGEPV, {
        required: true,
        spec: 'Ponto focal que validou a entrega.',
      }),
      f('patlasv4proto-ev-ugepv-parecer-cs', 'Parecer do consultor de CS', 'textOptions', SEC_UGEPV, {
        required: true,
        options: ['Sucesso confirmado', 'Gap de sucesso', 'Entrega reprovada'],
        spec: 'Julgamento de gap de sucesso pós-entrega.',
      }),
      f('patlasv4proto-ev-ugepv-situacao-valor', 'Situação de valor constatada', 'text', SEC_UGEPV, {
        required: true,
        textLong: true,
        spec: 'Descrição da situação de valor observada na visita/entrevista.',
      }),
      f('patlasv4proto-ev-ugepv-relatorio', 'Relatório / comprovante de visita', 'file', SEC_UGEPV, {
        required: true,
        spec: 'Upload do relatório em PDF.',
      }),

      f('patlasv4proto-ev-ascom-alerta', 'Orientação ASCOM', 'alert', SEC_ASCOM, {
        alertVariant: 'info',
        alertTitle: 'Aba 3 — Visível a partir de Para Divulgação',
        alertMessage:
          'Trava 2: mudança para "Divulgado" só libera após preencher data, canais e comprovantes.',
      }),
      f('patlasv4proto-ev-ascom-data-divulgacao', 'Data da divulgação', 'date', SEC_ASCOM, { required: true }),
      f('patlasv4proto-ev-ascom-canais', 'Canais de comunicação', 'text', SEC_ASCOM, {
        required: true,
        textLong: true,
        spec: 'Redes sociais, portal institucional, imprensa, etc.',
      }),
      f('patlasv4proto-ev-ascom-comprovantes', 'Comprovantes da divulgação', 'file', SEC_ASCOM, {
        required: true,
        multiple: true,
        spec: 'PDFs com prints, clipping ou relatório de mídia.',
      }),

      f('patlasv4proto-ev-mon-alerta', 'Loop mensal', 'alert', SEC_MON, {
        alertVariant: 'info',
        alertTitle: 'Aba 4 — A partir de Divulgado',
        alertMessage:
          'Agendamento automático a cada 30 dias. Registre medições dos KPIs e planos de ação se a adoção estiver baixa.',
      }),
      f('patlasv4proto-ev-mon-proximo-ciclo', 'Próximo ciclo de avaliação', 'date', SEC_MON, {
        readOnly: true,
        spec: 'Inicia 30 dias após status Divulgado (automação).',
      }),
      f('patlasv4proto-ev-mon-medicoes', 'Aferições mensais de uso', 'embeddedReference', SEC_MON, {
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_MED,
        spec: 'Tabela dinâmica baseada nos KPIs da aba 1.',
      }),
      f('patlasv4proto-ev-mon-planos', 'Planos de ação', 'embeddedReference', SEC_MON, {
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_PA,
        spec: 'Ações corretivas quando há Success Gap na adoção.',
      }),

      f('patlasv4proto-ev-tl-alerta', 'Linha do tempo', 'alert', SEC_TL, {
        alertVariant: 'info',
        alertTitle: 'Aba 5 — Marcos e accountability',
        alertMessage:
          'Timeline gráfica dos marcos + histórico de transições de status com justificativa (reprovações UGEPV).',
      }),
      f('patlasv4proto-ev-tl-marcos', 'Marcos da entrega', 'embeddedReference', SEC_TL, {
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_MR,
      }),
      f('patlasv4proto-ev-tl-transicoes', 'Histórico de transições de status', 'embeddedReference', SEC_TL, {
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_TR,
        spec: 'Situação anterior/nova, data, hora, usuário e justificativa.',
      }),
    ],
    fieldVisibilityRules: buildVisibilityRules(),
    methods: [
      {
        id: 'patlasv4proto-ev-meth-registrar-entrega',
        name: 'Registrar entrega',
        icon: 'check_circle',
        kind: 'destaque',
        spec: 'DTIC: Em Entrega → Entregue. Libera aba UGEPV.',
      },
      {
        id: 'patlasv4proto-ev-meth-enviar-divulgacao',
        name: 'Enviar para divulgação',
        icon: 'send',
        kind: 'destaque',
        spec: 'Trava 1: exige aba UGEPV preenchida. Entregue → Para Divulgação.',
      },
      {
        id: 'patlasv4proto-ev-meth-registrar-divulgacao',
        name: 'Registrar divulgação',
        icon: 'campaign',
        kind: 'destaque',
        spec: 'Trava 2: exige aba ASCOM. Para Divulgação → Divulgado. Inicia agendamento 30 dias.',
      },
      {
        id: 'patlasv4proto-ev-meth-iniciar-monitoramento',
        name: 'Iniciar monitoramento',
        icon: 'monitoring',
        kind: 'menu',
        spec: 'Divulgado → Em Monitoramento (loop mensal ativo).',
      },
      {
        id: 'patlasv4proto-ev-meth-devolver',
        name: 'Devolver para Em Entrega',
        icon: 'undo',
        kind: 'destaque',
        inputFormId: FORM_DEVOLVER,
        spec: 'Success Gap: bloqueia abas 2–4 e registra justificativa na Timeline.',
      },
    ],
    exampleValuePresets: buildPresets(),
    activeExamplePresetId: 'patlasv4proto-p-ev-em-entrega',
  }
}

function buildPresets() {
  const kpis = [
    {
      'patlasv4proto-ev-kpi-nome': 'Usuários ativos na plataforma',
      'patlasv4proto-ev-kpi-unidade': 'usuários',
      'patlasv4proto-ev-kpi-meta': 200,
    },
    {
      'patlasv4proto-ev-kpi-nome': 'Processos digitalizados',
      'patlasv4proto-ev-kpi-unidade': 'processos/mês',
      'patlasv4proto-ev-kpi-meta': 500,
    },
  ]

  return [
    {
      id: 'patlasv4proto-p-ev-em-entrega',
      name: 'Em Entrega — Simplifica SEPLAG',
      iconColor: '#0c4a6e',
      fieldValues: {
        [F_NOME]: 'CSPS — Plataforma de Simplificação SEPLAG',
        [F_CLIENTE]: 'Secretaria de Estado de Planejamento e Gestão',
        [F_STATUS]: STATUS.EM_ENTREGA,
        [F_TTFV]: '—',
        'patlasv4proto-ev-snow': 'PRJ0045210',
        'patlasv4proto-ev-contrato': '076/2025/SEPLAG',
        'patlasv4proto-ev-os': 'ORSR0002026',
        'patlasv4proto-ev-parceiro': 'EloGroup',
        'patlasv4proto-ev-resp-delivery': 'Felipe Oliveira Costa',
        'patlasv4proto-ev-desc-valor':
          'Reduzir em 50% o tempo médio de tramitação de processos administrativos da SEPLAG.',
      },
      embeddedRowsByFieldId: { 'patlasv4proto-ev-kpis': kpis },
    },
    {
      id: 'patlasv4proto-p-ev-entregue',
      name: 'Entregue — aguardando UGEPV',
      iconColor: '#0369a1',
      fieldValues: {
        [F_NOME]: 'Portal de Serviços PMC',
        [F_CLIENTE]: 'Secretaria de Estado de Planejamento e Gestão',
        [F_STATUS]: STATUS.ENTREGUE,
        [F_TTFV]: '—',
        'patlasv4proto-ev-snow': 'PRJ0038912',
        'patlasv4proto-ev-contrato': '163/2025/PMC',
        'patlasv4proto-ev-resp-delivery': 'Carlos Eduardo Souza',
        'patlasv4proto-ev-desc-valor': 'Centralizar solicitações de cidadãos em canal digital único.',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-ev-kpis': [kpis[0]],
        'patlasv4proto-ev-tl-marcos': [
          {
            'patlasv4proto-ev-mr-tipo': 'Em produção',
            'patlasv4proto-ev-mr-data': '2026-04-15T10:00:00',
            'patlasv4proto-ev-mr-desc': 'Go-live em produção',
          },
        ],
        'patlasv4proto-ev-tl-transicoes': [
          {
            'patlasv4proto-ev-tr-anterior': STATUS.EM_ENTREGA,
            'patlasv4proto-ev-tr-nova': STATUS.ENTREGUE,
            'patlasv4proto-ev-tr-datahora': '15/04/2026 14:30',
            'patlasv4proto-ev-tr-usuario': 'Carlos Eduardo Souza',
          },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-ev-para-divulgacao',
      name: 'Para Divulgação',
      iconColor: '#7c3aed',
      fieldValues: {
        [F_NOME]: 'Atlas — Módulo de Assinaturas',
        [F_CLIENTE]: 'Empresa Mato-grossense de Tecnologia da Informação',
        [F_STATUS]: STATUS.PARA_DIVULGACAO,
        [F_TTFV]: '42 dias',
        'patlasv4proto-ev-snow': 'PRJ0051200',
        'patlasv4proto-ev-resp-delivery': 'Helena Ribeiro Lima',
        'patlasv4proto-ev-desc-valor': 'Assinatura eletrônica integrada aos fluxos documentais da MTI.',
        'patlasv4proto-ev-ugepv-data-entrevista': '2026-05-10T10:00:00',
        'patlasv4proto-ev-ugepv-resp-cliente': 'Diretor de Governança Digital',
        'patlasv4proto-ev-ugepv-parecer-cs': 'Sucesso confirmado',
        'patlasv4proto-ev-ugepv-situacao-valor':
          'Cliente validou uso em 3 unidades piloto com adoção inicial satisfatória.',
        'patlasv4proto-ev-ugepv-relatorio': 'relatorio-visita-ugepv.pdf',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-ev-kpis': kpis,
        'patlasv4proto-ev-tl-transicoes': [
          {
            'patlasv4proto-ev-tr-anterior': STATUS.ENTREGUE,
            'patlasv4proto-ev-tr-nova': STATUS.PARA_DIVULGACAO,
            'patlasv4proto-ev-tr-datahora': '12/05/2026 09:00',
            'patlasv4proto-ev-tr-usuario': 'Felipe Oliveira Costa',
          },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-ev-divulgado',
      name: 'Divulgado — ciclo mensal iniciado',
      iconColor: '#059669',
      fieldValues: {
        [F_NOME]: 'Simplifica MT — Fase 2',
        [F_CLIENTE]: 'Secretaria de Estado de Planejamento e Gestão',
        [F_STATUS]: STATUS.DIVULGADO,
        [F_TTFV]: '38 dias',
        'patlasv4proto-ev-ascom-data-divulgacao': '2026-05-20T10:00:00',
        'patlasv4proto-ev-ascom-canais': 'Portal SEPLAG, LinkedIn MTI, newsletter interna',
        'patlasv4proto-ev-ascom-comprovantes': 'clipping-divulgacao-maio2026.pdf',
        'patlasv4proto-ev-mon-proximo-ciclo': '2026-06-19T10:00:00',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-ev-kpis': [kpis[0]],
        'patlasv4proto-ev-mon-medicoes': [
          {
            'patlasv4proto-ev-med-kpi': 'Usuários ativos na plataforma',
            'patlasv4proto-ev-med-competencia': 'Mês 1',
            'patlasv4proto-ev-med-valor': 20,
          },
          {
            'patlasv4proto-ev-med-kpi': 'Usuários ativos na plataforma',
            'patlasv4proto-ev-med-competencia': 'Mês 2',
            'patlasv4proto-ev-med-valor': 152,
          },
        ],
        'patlasv4proto-ev-tl-marcos': [
          {
            'patlasv4proto-ev-mr-tipo': 'Divulgado',
            'patlasv4proto-ev-mr-data': '2026-05-20T10:00:00',
          },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-ev-monitoramento',
      name: 'Em Monitoramento — plano de ação',
      iconColor: '#b45309',
      fieldValues: {
        [F_NOME]: 'GED SEPLAG — Expansão',
        [F_CLIENTE]: 'Secretaria de Estado de Planejamento e Gestão',
        [F_STATUS]: STATUS.EM_MONITORAMENTO,
        [F_TTFV]: '55 dias',
        'patlasv4proto-ev-mon-proximo-ciclo': '2026-06-27T10:00:00',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-ev-mon-medicoes': [
          {
            'patlasv4proto-ev-med-kpi': 'Usuários ativos na plataforma',
            'patlasv4proto-ev-med-competencia': 'Mês 3',
            'patlasv4proto-ev-med-valor': 45,
          },
        ],
        'patlasv4proto-ev-mon-planos': [
          {
            'patlasv4proto-ev-pa-desc': 'Capacitação presencial para 3 unidades com baixa adoção',
            'patlasv4proto-ev-pa-prevista': '2026-07-15T10:00:00',
            'patlasv4proto-ev-pa-responsavel': 'Helena Ribeiro Lima',
            'patlasv4proto-ev-pa-origem': 'MTI',
            'patlasv4proto-ev-pa-status': 'Em execução',
          },
        ],
        'patlasv4proto-ev-tl-transicoes': [
          {
            'patlasv4proto-ev-tr-anterior': STATUS.PARA_DIVULGACAO,
            'patlasv4proto-ev-tr-nova': STATUS.EM_ENTREGA,
            'patlasv4proto-ev-tr-datahora': '01/05/2026 16:45',
            'patlasv4proto-ev-tr-usuario': 'Felipe Oliveira Costa',
            'patlasv4proto-ev-tr-justificativa':
              'UGEPV reprovou entrega: documentação de homologação incompleta. Devolvido para correção DTIC.',
          },
          {
            'patlasv4proto-ev-tr-anterior': STATUS.DIVULGADO,
            'patlasv4proto-ev-tr-nova': STATUS.EM_MONITORAMENTO,
            'patlasv4proto-ev-tr-datahora': '27/05/2026 08:00',
            'patlasv4proto-ev-tr-usuario': 'Carlos Eduardo Souza',
          },
        ],
      },
    },
  ]
}

function upsertForm(forms, formDef) {
  const i = forms.findIndex((x) => x.id === formDef.id)
  if (i >= 0) forms[i] = formDef
  else forms.push(formDef)
}

function patchGroups(groups) {
  const embedded = [
    FORM_KPI,
    FORM_MED,
    FORM_PA,
    FORM_TR,
    FORM_MR,
    FORM_DEVOLVER,
  ]
  for (const id of embedded) {
    groups.assignments[id] = 'grp-patlasv4-proto-embutido'
    if (!groups.memberOrderByGroup['grp-patlasv4-proto-embutido'].includes(id)) {
      groups.memberOrderByGroup['grp-patlasv4-proto-embutido'].push(id)
    }
  }
  groups.assignments[FORM_MAIN] = 'grp-patlasv4-proto-fluxo'
  if (!groups.memberOrderByGroup['grp-patlasv4-proto-fluxo'].includes(FORM_MAIN)) {
    groups.memberOrderByGroup['grp-patlasv4-proto-fluxo'].push(FORM_MAIN)
  }
  return groups
}

function patchWorkspace(ws) {
  const w = ws[0]
  const pkg = w.packages.find((p) => p.id === 'pkg-patlasv4-proto-fluxo')
  if (!pkg) throw new Error('Pacote fluxo operacional não encontrado')
  const exists = pkg.classes.some((c) => c.id === 'cls-patlasv4-proto-ev')
  if (!exists) {
    pkg.classes.push({
      id: 'cls-patlasv4-proto-ev',
      name: 'Dossiê da Entrega de Valor',
      linkedFormId: FORM_MAIN,
      linkedFormExamplePresetIds: [
        'patlasv4proto-p-ev-em-entrega',
        'patlasv4proto-p-ev-entregue',
        'patlasv4proto-p-ev-para-divulgacao',
        'patlasv4proto-p-ev-divulgado',
        'patlasv4proto-p-ev-monitoramento',
      ],
    })
  }
  return ws
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const newForms = [
    buildKpiForm(),
    buildMedicaoForm(),
    buildPlanoAcaoForm(),
    buildTransicaoForm(),
    buildMarcoForm(),
    buildDevolverForm(),
    buildMainForm(),
  ]
  for (const fd of newForms) upsertForm(forms, fd)

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  fs.writeFileSync(
    GROUPS_PATH,
    `${JSON.stringify(patchGroups(JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))), null, 2)}\n`,
    'utf8',
  )
  fs.writeFileSync(
    WS_PATH,
    `${JSON.stringify(patchWorkspace(JSON.parse(fs.readFileSync(WS_PATH, 'utf8'))), null, 2)}\n`,
    'utf8',
  )

  console.log('Dossiê da Entrega de Valor aplicado.')
  console.log(`  Formulário principal: ${FORM_MAIN}`)
  console.log(`  Linhas embutidas: ${FORM_KPI}, ${FORM_MED}, ${FORM_PA}, ${FORM_TR}, ${FORM_MR}`)
}

main()
