/**
 * Atlas — Painel do cliente: projetos/tarefas (ServiceNow), workflow assinaturas (Fase 1),
 * ativos consumidos (OpenText HCMX).
 */

import { FORM_CONTRATO_GESTAO, FORM_ORDEM_SERVICO, FORM_PROCESSO_CONTRATUAL, FORM_TRAMITE_ASSINATURA } from './atlas-contrato-forms.mjs'

export const FORM_SN_PROJETO = 'form-atlas-servicenow-projeto'
export const FORM_SN_TAREFA = 'form-atlas-servicenow-tarefa'
export const FORM_VISAO_PROJETOS_TAREFAS = 'form-atlas-visao-projetos-tarefas'
export const FORM_WF_FASE_RESUMO = 'form-atlas-workflow-fase-resumo'
export const FORM_VISAO_WORKFLOW_ASSINATURAS = 'form-atlas-visao-workflow-assinaturas'
export const FORM_HCMX_ATIVO = 'form-atlas-hcmx-ativo-linha'
export const FORM_VISAO_ATIVOS_CONSUMO = 'form-atlas-visao-ativos-consumo'

export const EMB_SN_PROJETOS = 'emb_sn_projetos'
export const EMB_SN_TAREFAS = 'emb_sn_tarefas'
export const EMB_WF_FASES = 'emb_wf_fases_resumo'
export const EMB_WF_TRAMITES = 'emb_wf_tramites_visao'
export const EMB_HCMX_ATIVOS = 'emb_hcmx_ativos'

const ESCOPO_VISAO = ['Geral (todos os registros do cliente)', 'Por contrato', 'Por ordem de serviço']
const ESTADO_SN = ['Aberto', 'Em andamento', 'Aguardando cliente', 'Resolvido', 'Fechado', 'Cancelado']
const PRIORIDADE_SN = ['Crítica', 'Alta', 'Média', 'Baixa']
const RECURSO_FASE = ['Fase 1 — Recurso próprio (PEAP)', 'Fase 2 — Autogestão tríplice', 'Fase 3 — Catálogo DIRC']

function snProjeto(p) {
  return {
    'atlas-sn-prj-numero': p.numero ?? '',
    'atlas-sn-prj-nome': p.nome ?? '',
    'atlas-sn-prj-estado': p.estado ?? 'Em andamento',
    'atlas-sn-prj-contrato': p.contrato ?? '',
    'atlas-sn-prj-os': p.os ?? '',
    'atlas-sn-prj-prioridade': p.prioridade ?? 'Média',
    'atlas-sn-prj-abertura': p.abertura ?? '2025-04-01',
  }
}

function snTarefa(p) {
  return {
    'atlas-sn-tsk-numero': p.numero ?? '',
    'atlas-sn-tsk-projeto': p.projeto ?? '',
    'atlas-sn-tsk-assunto': p.assunto ?? '',
    'atlas-sn-tsk-estado': p.estado ?? 'Aberto',
    'atlas-sn-tsk-responsavel': p.responsavel ?? '',
    'atlas-sn-tsk-sla': p.sla ?? '',
    'atlas-sn-tsk-contrato': p.contrato ?? '',
    'atlas-sn-tsk-os': p.os ?? '',
    'atlas-sn-tsk-abertura': p.abertura ?? '2025-05-10',
  }
}

function wfFaseResumo(p) {
  return {
    'atlas-wf-fase-nome': p.fase ?? '',
    'atlas-wf-fase-status': p.status ?? 'Aguardando assinaturas',
    'atlas-wf-fase-pendentes': p.pendentes ?? 0,
    'atlas-wf-fase-assinados': p.assinados ?? 0,
    'atlas-wf-fase-total': p.total ?? 0,
  }
}

function tramiteVisao(p) {
  return {
    'atlas-tram-fase': p.fase ?? 'Contrato',
    'atlas-tram-setor': p.setor ?? '',
    'atlas-tram-cargo': p.cargo ?? '',
    'atlas-tram-perfil': p.perfil ?? '',
    'atlas-tram-ordem': p.ordem ?? 1,
    'atlas-tram-status': p.status ?? 'Pendente',
    'atlas-tram-responsavel': p.responsavel ?? '',
    'atlas-tram-data-envio': p.dataEnvio ?? '',
    'atlas-tram-data-conclusao': p.dataConclusao ?? '',
    'atlas-tram-motivo': p.motivo ?? '',
  }
}

function hcmxAtivo(p) {
  return {
    'atlas-hcmx-produto': p.produto ?? '',
    'atlas-hcmx-metrica': p.metrica ?? 'HST',
    'atlas-hcmx-consumido': p.consumido ?? 0,
    'atlas-hcmx-limite': p.limite ?? 0,
    'atlas-hcmx-periodo': p.periodo ?? '04/2025',
    'atlas-hcmx-contrato': p.contrato ?? '',
    'atlas-hcmx-os': p.os ?? '',
    'atlas-hcmx-origem': p.origem ?? 'OpenText HCMX',
    'atlas-hcmx-status': p.status ?? 'Medição recebida',
  }
}

const METODOS_SN = [
  { id: 'atlas-meth-sn-sincronizar', name: 'Sincronizar ServiceNow', icon: 'cloud_sync', kind: 'destaque' },
  { id: 'atlas-meth-sn-atualizar-abertas', name: 'Atualizar tarefas abertas', icon: 'refresh', kind: 'secundario' },
]

const METODOS_WF_VISAO = [
  { id: 'atlas-meth-enviar-assinatura', name: 'Enviar para assinatura', icon: 'send', kind: 'secundario' },
  { id: 'atlas-meth-wf-atualizar-status', name: 'Atualizar status do workflow', icon: 'sync', kind: 'destaque' },
]

const METODOS_HCMX = [
  { id: 'atlas-meth-hcmx-importar', name: 'Importar medições HCMX', icon: 'cloud_download', kind: 'destaque' },
  { id: 'atlas-meth-hcmx-atualizar-consumo', name: 'Atualizar consumo do período', icon: 'sync', kind: 'secundario' },
]

export const clienteVisoesForms = [
  {
    id: FORM_SN_PROJETO,
    name: 'ServiceNow — projeto',
    sectionLayout: 'none',
    fields: [
      { id: 'atlas-sn-prj-numero', label: 'Número', type: 'text', size: 'medium', relevance: 'identity', spec: 'ID do projeto no ServiceNow.' },
      { id: 'atlas-sn-prj-nome', label: 'Nome do projeto', type: 'text', size: 'large', relevance: 'highlight', spec: '' },
      { id: 'atlas-sn-prj-estado', label: 'Estado', type: 'textOptions', size: 'medium', options: ESTADO_SN, relevance: 'common', spec: '' },
      { id: 'atlas-sn-prj-contrato', label: 'Contrato', type: 'text', size: 'medium', relevance: 'common', spec: 'Vínculo MTI quando escopo = por contrato.' },
      { id: 'atlas-sn-prj-os', label: 'Ordem de serviço', type: 'text', size: 'medium', relevance: 'common', spec: '' },
      { id: 'atlas-sn-prj-prioridade', label: 'Prioridade', type: 'textOptions', size: 'small', options: PRIORIDADE_SN, relevance: 'common', spec: '' },
      { id: 'atlas-sn-prj-abertura', label: 'Data abertura', type: 'date', size: 'small', relevance: 'common', spec: '' },
    ],
  },
  {
    id: FORM_SN_TAREFA,
    name: 'ServiceNow — tarefa / incidente',
    sectionLayout: 'none',
    fields: [
      { id: 'atlas-sn-tsk-numero', label: 'Número', type: 'text', size: 'medium', relevance: 'identity', spec: 'INC / TASK ServiceNow.' },
      { id: 'atlas-sn-tsk-projeto', label: 'Projeto', type: 'text', size: 'medium', relevance: 'common', spec: '' },
      { id: 'atlas-sn-tsk-assunto', label: 'Assunto', type: 'text', size: 'large', textLong: true, relevance: 'highlight', spec: '' },
      { id: 'atlas-sn-tsk-estado', label: 'Estado', type: 'textOptions', size: 'medium', options: ESTADO_SN, relevance: 'highlight', spec: 'Somente abertas na visão filtrada.' },
      { id: 'atlas-sn-tsk-responsavel', label: 'Responsável', type: 'text', size: 'medium', relevance: 'common', spec: '' },
      { id: 'atlas-sn-tsk-sla', label: 'SLA', type: 'text', size: 'small', relevance: 'common', spec: '' },
      { id: 'atlas-sn-tsk-contrato', label: 'Contrato', type: 'text', size: 'medium', relevance: 'common', spec: '' },
      { id: 'atlas-sn-tsk-os', label: 'Ordem de serviço', type: 'text', size: 'medium', relevance: 'common', spec: '' },
      { id: 'atlas-sn-tsk-abertura', label: 'Aberto em', type: 'date', size: 'small', relevance: 'common', spec: '' },
    ],
  },
  {
    id: FORM_VISAO_PROJETOS_TAREFAS,
    name: 'Visão geral — projetos e tarefas (ServiceNow)',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: METODOS_SN,
    sections: [
      { id: 'sec-sn-filtro', title: 'Filtro e contexto', icon: 'filter_list' },
      { id: 'sec-sn-projetos', title: 'Projetos', icon: 'folder_open' },
      { id: 'sec-sn-tarefas', title: 'Tarefas abertas', icon: 'task_alt' },
      { id: 'sec-sn-integracao', title: 'Integração ServiceNow', icon: 'cloud_sync' },
    ],
    fields: [
      {
        id: 'atlas-sn-visao-cliente',
        label: 'Cliente',
        type: 'text',
        size: 'large',
        relevance: 'identity',
        sectionId: 'sec-sn-filtro',
        spec: 'Cliente autenticado no portal (CNPJ/unidade).',
      },
      {
        id: 'atlas-sn-visao-escopo',
        label: 'Escopo da visão',
        type: 'textOptions',
        size: 'large',
        options: ESCOPO_VISAO,
        relevance: 'highlight',
        sectionId: 'sec-sn-filtro',
        spec: 'Geral: todos os projetos/tarefas do cliente. Por contrato ou OS: filtra vínculos MTI.',
      },
      {
        id: 'atlas-sn-visao-contrato',
        label: 'Contrato (filtro)',
        type: 'text',
        size: 'medium',
        sectionId: 'sec-sn-filtro',
        relevance: 'common',
        spec: 'Ex.: 212/2024 — quando escopo = Por contrato.',
      },
      {
        id: 'atlas-sn-visao-os',
        label: 'Ordem de serviço (filtro)',
        type: 'text',
        size: 'medium',
        sectionId: 'sec-sn-filtro',
        relevance: 'common',
        spec: 'Ex.: OS-2026-5012',
      },
      {
        id: 'atlas-sn-visao-resumo',
        label: 'Resumo',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: true,
        sectionId: 'sec-sn-filtro',
        relevance: 'common',
        spec: 'Contadores: projetos ativos, tarefas abertas, SLA em risco.',
      },
      {
        id: EMB_SN_PROJETOS,
        label: 'Projetos (ServiceNow)',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_SN_PROJETO,
        sectionId: 'sec-sn-projetos',
        relevance: 'highlight',
        spec: 'Dados via integração ServiceNow — projetos vinculados ao cliente/contrato/OS.',
      },
      {
        id: EMB_SN_TAREFAS,
        label: 'Tarefas abertas (ServiceNow)',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_SN_TAREFA,
        sectionId: 'sec-sn-tarefas',
        relevance: 'highlight',
        spec: 'Incidentes e tarefas em estado aberto ou em andamento.',
      },
      {
        id: 'atlas-sn-int-ativo',
        label: 'Integração ServiceNow ativa',
        type: 'boolean',
        size: 'small',
        sectionId: 'sec-sn-integracao',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-sn-int-ultima-sync',
        label: 'Última sincronização',
        type: 'text',
        size: 'medium',
        readOnly: true,
        sectionId: 'sec-sn-integracao',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-sn-int-endpoint',
        label: 'Endpoint / instância',
        type: 'text',
        size: 'medium',
        sectionId: 'sec-sn-integracao',
        relevance: 'advanced',
        spec: 'URL da instância ServiceNow MTI.',
      },
      {
        id: 'atlas-sn-alert-integracao',
        label: 'Integração',
        type: 'alert',
        size: 'large',
        readOnly: true,
        sectionId: 'sec-sn-integracao',
        alertVariant: 'info',
        spec: '«Sincronizar» busca projetos e tarefas; «Atualizar abertas» reconcilia apenas registros não fechados.',
      },
    ],
    exampleValuePresets: [
      {
        id: 'atlas-sn-visao-tjmt',
        name: 'TJMT — por contrato 212/2024',
        iconColor: '#0ea5e9',
        fieldValues: {
          'atlas-sn-visao-cliente': 'TRIBUNAL DE JUSTIÇA - MT',
          'atlas-sn-visao-escopo': 'Por contrato',
          'atlas-sn-visao-contrato': '212/2024',
          'atlas-sn-visao-os': '',
          'atlas-sn-visao-resumo': '2 projetos ativos · 5 tarefas abertas · 1 SLA em risco',
          'atlas-sn-int-ativo': 'true',
          'atlas-sn-int-ultima-sync': '20/05/2026 09:42',
          'atlas-sn-int-endpoint': 'https://mti.service-now.com',
        },
        embeddedRowsByFieldId: {
          [EMB_SN_PROJETOS]: [
            snProjeto({ numero: 'PRJ0010123', nome: 'Evolução MTI Workspace — TJMT', contrato: '212/2024', estado: 'Em andamento' }),
            snProjeto({ numero: 'PRJ0010098', nome: 'Suporte cloud contratual', contrato: '212/2024', os: 'OS-2026-8842', estado: 'Aberto' }),
          ],
          [EMB_SN_TAREFAS]: [
            snTarefa({ numero: 'INC0045123', projeto: 'PRJ0010123', assunto: 'Ajuste de perfil de acesso', contrato: '212/2024', estado: 'Em andamento', responsavel: 'Fila DIRC' }),
            snTarefa({ numero: 'TASK009871', projeto: 'PRJ0010123', assunto: 'Homologação ambiente UAT', contrato: '212/2024', estado: 'Aberto', sla: '48h' }),
            snTarefa({ numero: 'INC0045201', projeto: 'PRJ0010098', assunto: 'Medição HCMX divergente', contrato: '212/2024', os: 'OS-2026-8842', estado: 'Aguardando cliente' }),
          ],
        },
      },
      {
        id: 'atlas-sn-visao-geral',
        name: 'Cliente — visão geral',
        iconColor: '#6366f1',
        fieldValues: {
          'atlas-sn-visao-cliente': 'TRIBUNAL DE JUSTIÇA - MT',
          'atlas-sn-visao-escopo': 'Geral (todos os registros do cliente)',
          'atlas-sn-visao-resumo': '4 projetos · 11 tarefas abertas',
          'atlas-sn-int-ativo': 'true',
          'atlas-sn-int-ultima-sync': '20/05/2026 08:00',
        },
        embeddedRowsByFieldId: {
          [EMB_SN_PROJETOS]: [
            snProjeto({ numero: 'PRJ0010123', nome: 'Evolução MTI Workspace', contrato: '212/2024' }),
            snProjeto({ numero: 'PRJ0000881', nome: 'MTI Valida — expansão', contrato: '118/2023' }),
          ],
          [EMB_SN_TAREFAS]: [
            snTarefa({ numero: 'INC0045001', assunto: 'Consulta catálogo vigente', estado: 'Aberto' }),
            snTarefa({ numero: 'TASK009800', assunto: 'Renovação contratual 118/2023', contrato: '118/2023', estado: 'Em andamento' }),
          ],
        },
      },
    ],
    activeExamplePresetId: 'atlas-sn-visao-tjmt',
    metadata: 'Item 3 — Visão de projetos e tarefas abertas pelo cliente (ServiceNow), filtro geral/contrato/OS.',
  },
  {
    id: FORM_WF_FASE_RESUMO,
    name: 'Workflow — resumo por fase',
    sectionLayout: 'none',
    fields: [
      { id: 'atlas-wf-fase-nome', label: 'Fase', type: 'text', size: 'medium', relevance: 'identity', spec: '' },
      { id: 'atlas-wf-fase-status', label: 'Status da fase', type: 'text', size: 'medium', relevance: 'highlight', spec: '' },
      { id: 'atlas-wf-fase-pendentes', label: 'Assinaturas pendentes', type: 'number', size: 'small', relevance: 'common', spec: '' },
      { id: 'atlas-wf-fase-assinados', label: 'Assinaturas concluídas', type: 'number', size: 'small', relevance: 'common', spec: '' },
      { id: 'atlas-wf-fase-total', label: 'Total de tramites', type: 'number', size: 'small', relevance: 'common', spec: '' },
    ],
  },
  {
    id: FORM_VISAO_WORKFLOW_ASSINATURAS,
    name: 'Visão geral — workflow de assinaturas',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: METODOS_WF_VISAO,
    sections: [
      { id: 'sec-wf-contexto', title: 'Contexto', icon: 'account_tree' },
      { id: 'sec-wf-fases', title: 'Fases RAER', icon: 'timeline' },
      { id: 'sec-wf-tramites', title: 'Tramites em andamento', icon: 'draw' },
      { id: 'sec-wf-recurso', title: 'Recurso próprio', icon: 'verified_user' },
    ],
    fields: [
      {
        id: 'atlas-wf-visao-cliente',
        label: 'Cliente',
        type: 'text',
        size: 'large',
        relevance: 'identity',
        sectionId: 'sec-wf-contexto',
        spec: '',
      },
      {
        id: 'atlas-wf-visao-contrato',
        label: 'Contrato',
        type: 'text',
        size: 'medium',
        sectionId: 'sec-wf-contexto',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-wf-visao-processo',
        label: 'Processo contratual',
        type: 'reference',
        linkedFormId: FORM_PROCESSO_CONTRATUAL,
        size: 'medium',
        sectionId: 'sec-wf-contexto',
        relevance: 'highlight',
        spec: '',
      },
      {
        id: 'atlas-wf-visao-etapa-atual',
        label: 'Etapa atual',
        type: 'textOptions',
        size: 'medium',
        options: ['Proposta', 'Documentos', 'Contrato', 'Ordem de serviço', 'Termo de homologação', 'RAER'],
        sectionId: 'sec-wf-contexto',
        relevance: 'highlight',
        spec: '',
      },
      {
        id: 'atlas-wf-visao-resumo-kpi',
        label: 'Resumo KPI',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: true,
        sectionId: 'sec-wf-contexto',
        relevance: 'common',
        spec: 'Pendentes / em análise / assinados / reprovados.',
      },
      {
        id: EMB_WF_FASES,
        label: 'Status por fase',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_WF_FASE_RESUMO,
        sectionId: 'sec-wf-fases',
        relevance: 'highlight',
        spec: 'Visão consolidada do fluxo Proposta → RAER.',
      },
      {
        id: EMB_WF_TRAMITES,
        label: 'Tramites em andamento',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_TRAMITE_ASSINATURA,
        sectionId: 'sec-wf-tramites',
        relevance: 'highlight',
        spec: 'Acompanhar setor, cargo, perfil e status de cada assinatura.',
      },
      {
        id: 'atlas-wf-recurso-fase',
        label: 'Recurso',
        type: 'textOptions',
        size: 'large',
        options: RECURSO_FASE,
        sectionId: 'sec-wf-recurso',
        relevance: 'highlight',
        spec: 'Item 4a — Fase 1 PEAP: assinatura digital com recurso próprio (Gov.Br, certificado, MT Login).',
      },
      {
        id: 'atlas-wf-recurso-tipo',
        label: 'Tipo de implementação',
        type: 'textOptions',
        size: 'medium',
        options: ['No-code', 'Low-code'],
        sectionId: 'sec-wf-recurso',
        relevance: 'common',
        spec: 'Fluxos hierárquicos configuráveis por gerência.',
      },
      {
        id: 'atlas-wf-recurso-versao',
        label: 'Versão do workflow',
        type: 'text',
        size: 'small',
        sectionId: 'sec-wf-recurso',
        relevance: 'common',
        spec: 'Versionamento obrigatório entre publicações.',
      },
      {
        id: 'atlas-wf-recurso-meios',
        label: 'Meios de assinatura',
        type: 'text',
        size: 'large',
        sectionId: 'sec-wf-recurso',
        relevance: 'common',
        spec: 'Certificado digital, Gov.Br, MT Login, Senha.',
      },
      {
        id: 'atlas-wf-recurso-gerencias',
        label: 'Gerências envolvidas',
        type: 'text',
        size: 'large',
        textLong: true,
        sectionId: 'sec-wf-recurso',
        relevance: 'common',
        spec: 'DIRC, DAFI, Jurídico, Cliente fiscal.',
      },
      {
        id: 'atlas-wf-alert-fase1',
        label: 'Fase 1',
        type: 'alert',
        size: 'large',
        readOnly: true,
        sectionId: 'sec-wf-recurso',
        alertVariant: 'info',
        spec: 'Recurso próprio PEAP 0001/2025 — processo único interdepartamental com versionamento de workflows.',
      },
    ],
    exampleValuePresets: [
      {
        id: 'atlas-wf-visao-tjmt',
        name: 'Workflow TJMT — etapa Contrato',
        iconColor: '#1e3a5f',
        fieldValues: {
          'atlas-wf-visao-cliente': 'TRIBUNAL DE JUSTIÇA - MT',
          'atlas-wf-visao-contrato': '212/2024',
          'atlas-wf-visao-processo': 'PRC-2025-TJMT-0842',
          'atlas-wf-visao-etapa-atual': 'Contrato',
          'atlas-wf-visao-resumo-kpi': '3 pendentes · 1 em análise · 2 assinados · 0 reprovados',
          'atlas-wf-recurso-fase': 'Fase 1 — Recurso próprio (PEAP)',
          'atlas-wf-recurso-tipo': 'No-code',
          'atlas-wf-recurso-versao': 'v1.2',
          'atlas-wf-recurso-meios': 'Gov.Br, Certificado digital, MT Login',
          'atlas-wf-recurso-gerencias': 'DIRC, Jurídico, DAFI',
        },
        embeddedRowsByFieldId: {
          [EMB_WF_FASES]: [
            wfFaseResumo({ fase: 'Proposta', status: 'Concluído', pendentes: 0, assinados: 2, total: 2 }),
            wfFaseResumo({ fase: 'Documentos', status: 'Concluído', pendentes: 0, assinados: 3, total: 3 }),
            wfFaseResumo({ fase: 'Contrato', status: 'Aguardando assinaturas', pendentes: 2, assinados: 1, total: 3 }),
            wfFaseResumo({ fase: 'Ordem de serviço', status: 'Não iniciado', pendentes: 0, assinados: 0, total: 0 }),
            wfFaseResumo({ fase: 'Termo de homologação', status: 'Não iniciado', pendentes: 0, assinados: 0, total: 0 }),
            wfFaseResumo({ fase: 'RAER', status: 'Não iniciado', pendentes: 0, assinados: 0, total: 0 }),
          ],
          [EMB_WF_TRAMITES]: [
            tramiteVisao({ setor: 'Jurídico', perfil: 'Revisor jurídico', status: 'Em análise', ordem: 2, dataEnvio: '2025-05-12' }),
            tramiteVisao({ setor: 'DAFI', perfil: 'Aprovador financeiro', status: 'Pendente', ordem: 3 }),
          ],
        },
      },
    ],
    activeExamplePresetId: 'atlas-wf-visao-tjmt',
    metadata: 'Item 4 — Visão geral do workflow de assinaturas. Item 4a — Recurso próprio Fase 1 PEAP.',
  },
  {
    id: FORM_HCMX_ATIVO,
    name: 'HCMX — ativo / medição consumida',
    sectionLayout: 'none',
    fields: [
      { id: 'atlas-hcmx-produto', label: 'Produto / solução', type: 'text', size: 'large', relevance: 'identity', spec: 'Item medido no OpenText HCMX.' },
      { id: 'atlas-hcmx-metrica', label: 'Métrica', type: 'text', size: 'small', relevance: 'common', spec: 'HST, UST, GB, VM, etc.' },
      { id: 'atlas-hcmx-consumido', label: 'Consumido (período)', type: 'decimal', size: 'medium', relevance: 'highlight', spec: '' },
      { id: 'atlas-hcmx-limite', label: 'Limite contratado', type: 'decimal', size: 'medium', relevance: 'common', spec: '' },
      { id: 'atlas-hcmx-periodo', label: 'Competência', type: 'text', size: 'small', relevance: 'common', spec: 'Ex.: 04/2025' },
      { id: 'atlas-hcmx-contrato', label: 'Contrato', type: 'text', size: 'medium', relevance: 'common', spec: '' },
      { id: 'atlas-hcmx-os', label: 'Ordem de serviço', type: 'text', size: 'medium', relevance: 'common', spec: '' },
      { id: 'atlas-hcmx-origem', label: 'Origem', type: 'text', size: 'medium', readOnly: true, relevance: 'common', spec: 'OpenText HCMX' },
      {
        id: 'atlas-hcmx-status',
        label: 'Status medição',
        type: 'textOptions',
        size: 'medium',
        options: ['Medição recebida', 'Em validação', 'Homologada', 'Enviada ao PV', 'Divergência'],
        relevance: 'highlight',
        spec: '',
      },
    ],
  },
  {
    id: FORM_VISAO_ATIVOS_CONSUMO,
    name: 'Visão geral — ativos consumidos (HCMX)',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: METODOS_HCMX,
    sections: [
      { id: 'sec-hcmx-filtro', title: 'Filtro', icon: 'filter_list' },
      { id: 'sec-hcmx-ativos', title: 'Ativos e medições', icon: 'inventory' },
      { id: 'sec-hcmx-integracao', title: 'Integração OpenText HCMX', icon: 'cloud_sync' },
    ],
    fields: [
      {
        id: 'atlas-hcmx-visao-cliente',
        label: 'Cliente',
        type: 'text',
        size: 'large',
        relevance: 'identity',
        sectionId: 'sec-hcmx-filtro',
        spec: '',
      },
      {
        id: 'atlas-hcmx-visao-escopo',
        label: 'Escopo',
        type: 'textOptions',
        size: 'medium',
        options: ESCOPO_VISAO,
        sectionId: 'sec-hcmx-filtro',
        relevance: 'highlight',
        spec: '',
      },
      {
        id: 'atlas-hcmx-visao-contrato',
        label: 'Contrato',
        type: 'reference',
        linkedFormId: FORM_CONTRATO_GESTAO,
        size: 'medium',
        sectionId: 'sec-hcmx-filtro',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-hcmx-visao-os',
        label: 'Ordem de serviço',
        type: 'reference',
        linkedFormId: FORM_ORDEM_SERVICO,
        size: 'medium',
        sectionId: 'sec-hcmx-filtro',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-hcmx-visao-competencia',
        label: 'Competência',
        type: 'text',
        size: 'small',
        sectionId: 'sec-hcmx-filtro',
        relevance: 'common',
        spec: 'Período de medição HCMX.',
      },
      {
        id: 'atlas-hcmx-visao-resumo',
        label: 'Resumo consumo',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: true,
        sectionId: 'sec-hcmx-filtro',
        relevance: 'highlight',
        spec: 'Total consumido vs limite; itens em divergência.',
      },
      {
        id: EMB_HCMX_ATIVOS,
        label: 'Ativos consumidos',
        type: 'embeddedReference',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_HCMX_ATIVO,
        sectionId: 'sec-hcmx-ativos',
        relevance: 'highlight',
        spec: 'Item 5 — Medições OpenText HCMX por produto; alimenta consumo do contrato e PV Protheus.',
      },
      {
        id: 'atlas-hcmx-int-ativo',
        label: 'Integração HCMX ativa',
        type: 'boolean',
        size: 'small',
        sectionId: 'sec-hcmx-integracao',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-hcmx-int-ultima-sync',
        label: 'Última importação',
        type: 'text',
        size: 'medium',
        readOnly: true,
        sectionId: 'sec-hcmx-integracao',
        relevance: 'common',
        spec: '',
      },
      {
        id: 'atlas-hcmx-int-ambiente',
        label: 'Ambiente HCMX',
        type: 'text',
        size: 'medium',
        sectionId: 'sec-hcmx-integracao',
        relevance: 'advanced',
        spec: '',
      },
      {
        id: 'atlas-hcmx-alert-integracao',
        label: 'Integração',
        type: 'alert',
        size: 'large',
        readOnly: true,
        sectionId: 'sec-hcmx-integracao',
        alertVariant: 'info',
        spec: 'Importar medições do período; atualizar consumo reconcilia com saldos do contrato.',
      },
    ],
    exampleValuePresets: [
      {
        id: 'atlas-hcmx-visao-tjmt',
        name: 'TJMT 212/2024 — 04/2025',
        iconColor: '#059669',
        fieldValues: {
          'atlas-hcmx-visao-cliente': 'TRIBUNAL DE JUSTIÇA - MT',
          'atlas-hcmx-visao-escopo': 'Por contrato',
          'atlas-hcmx-visao-contrato': '212/2024',
          'atlas-hcmx-visao-os': 'OS-2026-8842',
          'atlas-hcmx-visao-competencia': '04/2025',
          'atlas-hcmx-visao-resumo': 'Consumo 78% do limite · 2 produtos · 1 divergência em validação',
          'atlas-hcmx-int-ativo': 'true',
          'atlas-hcmx-int-ultima-sync': '19/05/2026 22:15',
          'atlas-hcmx-int-ambiente': 'HCMX-PROD-MTI',
        },
        embeddedRowsByFieldId: {
          [EMB_HCMX_ATIVOS]: [
            hcmxAtivo({ produto: 'MTI Workspace', metrica: 'USN', consumido: 1200, limite: 1500, contrato: '212/2024', status: 'Homologada' }),
            hcmxAtivo({ produto: 'MTI Cloud — VM', metrica: 'VM', consumido: 48, limite: 60, contrato: '212/2024', os: 'OS-2026-8842', status: 'Medição recebida' }),
            hcmxAtivo({ produto: 'MTI DataSecurity', metrica: 'GB', consumido: 820, limite: 900, contrato: '212/2024', status: 'Em validação' }),
            hcmxAtivo({ produto: 'HST — serviço profissional', metrica: 'HST', consumido: 320, limite: 500, contrato: '212/2024', status: 'Divergência' }),
          ],
        },
      },
    ],
    activeExamplePresetId: 'atlas-hcmx-visao-tjmt',
    metadata: 'Item 5 — Visão de ativos consumidos pelos clientes via OpenText HCMX.',
  },
]

export const clienteVisoesClassGroups = {
  extraGroups: [
    { id: 'grp-atlas-painel-cliente', name: 'Painel do cliente' },
    { id: 'grp-atlas-integracoes-linha', name: 'Linhas embutidas (integrações)' },
  ],
  assignments: {
    [FORM_VISAO_PROJETOS_TAREFAS]: 'grp-atlas-painel-cliente',
    [FORM_VISAO_WORKFLOW_ASSINATURAS]: 'grp-atlas-painel-cliente',
    [FORM_VISAO_ATIVOS_CONSUMO]: 'grp-atlas-painel-cliente',
    [FORM_SN_PROJETO]: 'grp-atlas-integracoes-linha',
    [FORM_SN_TAREFA]: 'grp-atlas-integracoes-linha',
    [FORM_WF_FASE_RESUMO]: 'grp-atlas-integracoes-linha',
    [FORM_HCMX_ATIVO]: 'grp-atlas-integracoes-linha',
  },
  memberOrder: {
    'grp-atlas-painel-cliente': [
      FORM_VISAO_PROJETOS_TAREFAS,
      FORM_VISAO_WORKFLOW_ASSINATURAS,
      FORM_VISAO_ATIVOS_CONSUMO,
    ],
    'grp-atlas-integracoes-linha': [FORM_SN_PROJETO, FORM_SN_TAREFA, FORM_WF_FASE_RESUMO, FORM_HCMX_ATIVO],
  },
  workspaceClasses: [
    {
      id: 'cls-atlas-visao-sn',
      name: 'Projetos e tarefas (ServiceNow)',
      linkedFormId: FORM_VISAO_PROJETOS_TAREFAS,
    },
    {
      id: 'cls-atlas-visao-wf',
      name: 'Workflow de assinaturas',
      linkedFormId: FORM_VISAO_WORKFLOW_ASSINATURAS,
    },
    {
      id: 'cls-atlas-visao-hcmx',
      name: 'Ativos consumidos (HCMX)',
      linkedFormId: FORM_VISAO_ATIVOS_CONSUMO,
    },
  ],
}
