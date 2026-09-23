#!/usr/bin/env node
/**
 * Aplica especificação Discovery — Cargo e Workflow de Assinatura.
 * Uso: node scripts/patch-atlas-prototipo-cargo-workflow.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)

const FORM_CARGO = 'form-patlasv4-proto-cargo'
const FORM_CARGO_OCUP = 'form-patlasv4-proto-cargo-ocupante'
const FORM_CARGO_PERM = 'form-patlasv4-proto-cargo-permissao-processo'
const FORM_WF = 'mqebasqyphbwea'
const FORM_WF_ETAPA = 'form-patlasv4-proto-workflow-etapa'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_SRV = 'form-patlasv4-proto-servidor'
const FORM_CONFIG = 'form-patlasv4-proto-config-processo'

const SEC_CARGO_DADOS = 'sec-cargo-dados-do-cargo'
const SEC_CARGO_OCUP = 'sec-cargo-ocupantes'
const SEC_CARGO_PERM = 'sec-cargo-permissoes-de-visualizacao'
const SEC_WF_GERAL = 'sec-mqebd7w3-0kqe9xr'
const SEC_WF_ETAPAS = 'sec-mqebdc0b-su7wekt'

const TIPOS_PROCESSO = [
  'Proposta',
  'Contrato',
  'Ordem de Serviço (OS)',
  'Termo de Homologação',
  'RAER',
]

const METODOS_CARGO = [
  'Visualizar',
  'Criar proposta',
  'Editar proposta',
  'Gerar documento',
  'Enviar para assinatura',
  'Homologar',
  'Emitir OS',
  'Cadastrar contrato',
]

const REGIAO_OPTS = [
  'Todos', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const ORG_OPTS = [
  'Empresa Mato-grossense de Tecnologia da Informação',
  'EloGroup',
  'Secretaria de Estado de Planejamento e Gestão',
]

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
    ...(sectionId ? { sectionId } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.embeddedRoot !== undefined ? { embeddedRoot: opts.embeddedRoot } : {}),
  }
}

const formCargoOcupante = {
  id: FORM_CARGO_OCUP,
  name: 'Cargo — Ocupante',
  sectionLayout: 'none',
  metadata:
    'Fonte oficial do vínculo Servidor + Cargo + Unidade + Região + Condição (RN-CARGO-03). Usado em roteamento de tarefas e assinaturas.',
  fields: [
    f('patlasv4proto-cargo-ocupantes-servidor', 'Servidor', 'reference', undefined, {
      required: true,
      relevance: 'identity',
      linkedFormId: FORM_SRV,
      options: ['Lucas Santos', 'João Analista MTI', 'Maria Consultora Parceira', 'Carlos Gestor Cliente'],
      spec: 'Sempre referência a Servidor ativo e não desligado — nunca Pessoa diretamente (RN-CARGO-03, RN-SERV-03).',
    }),
    f('patlasv4proto-cargo-ocupantes-condicao', 'Condição', 'textOptions', undefined, {
      size: 'small',
      required: true,
      options: ['Titular', 'Substituto', 'Suplente'],
      spec: 'Titular indisponível → Substituto; ausente → Suplente. Registrada no histórico ao atuar.',
    }),
    f('patlasv4proto-cargo-ocupantes-unidade-de-atuacao', 'Unidade de atuação', 'reference', undefined, {
      required: true,
      linkedFormId: FORM_UO,
      options: [
        'Empresa Mato-grossense de Tecnologia da Informação',
        'Gabinete da Diretoria de Relacionamento com o Cliente',
        'Unidade de Gestão de Projetos',
        'Gerência de Contratos',
        'EloGroup',
        'Secretaria de Estado de Planejamento e Gestão',
      ],
      spec: 'Apenas unidades da Organização do Cargo (RN-CARGO-04). Sem subunidades → usar a raiz (RN-CARGO-05).',
    }),
    f('patlasv4proto-cargo-ocupantes-regiao-atuacao', 'Região de atuação', 'textOptions', undefined, {
      size: 'small',
      multiple: true,
      options: REGIAO_OPTS,
      spec: 'Padrão Todos. Restringe roteamento por UF quando diferente de Todos (RN-CARGO-06).',
    }),
    f('patlasv4proto-cargo-ocupantes-data-de-inicio', 'Data de início', 'date', undefined, {
      size: 'small',
      spec: 'Início da vigência da ocupação.',
    }),
    f('patlasv4proto-cargo-ocupantes-data-de-fim', 'Data de fim', 'date', undefined, {
      size: 'small',
      spec: 'Fim da vigência. Vazio = ocupação ativa.',
    }),
    f('patlasv4proto-cargo-ocupantes-observacao', 'Observação', 'text', undefined, {
      size: 'large',
      textLong: true,
      spec: 'Texto livre complementar.',
    }),
    f('patlasv4proto-cargo-ocupantes-ativo', 'Ativo', 'boolean', undefined, {
      size: 'small',
      required: true,
      spec: 'Ocupação inativa não entra em roteamento nem workflows.',
    }),
  ],
}

const formCargoPermissao = {
  id: FORM_CARGO_PERM,
  name: 'Cargo — Permissão de Processo',
  sectionLayout: 'none',
  defaultCanvasMode: 'edit',
  metadata:
    'Perfil de Permissões do Cargo. RN-CARGO-09: Aprovar/Recusar/Assinar são ações de Etapa do Workflow, não permissão de Cargo. RN-CARGO-10: Enviar para assinatura é permissão de processo.',
  fields: [
    f('patlasv4proto-cargo-perm-tipo-processo', 'Tipo de Processo', 'textOptions', undefined, {
      required: true,
      relevance: 'identity',
      options: TIPOS_PROCESSO,
      spec: 'Lista técnica do backend (RN-VERS-06). Proposta, Contrato, OS, Homologação, RAER.',
    }),
    f('patlasv4proto-cargo-perm-metodos-acoes', 'Métodos / Ações', 'textOptions', undefined, {
      size: 'large',
      required: true,
      multiple: true,
      options: METODOS_CARGO,
      spec: 'Filtrado pelo Tipo de Processo. Nunca incluir Aprovar, Recusar ou Assinar (RN-CARGO-09).',
    }),
  ],
}

const formWorkflowEtapa = {
  id: FORM_WF_ETAPA,
  name: 'Workflow — Etapa',
  sectionLayout: 'none',
  metadata:
    'Etapa do Workflow de Assinatura. Signatários da mesma etapa atuam em paralelo (RN-WF-NEW-01). Ordem controla sequência de ações, não de signatários (RN-WF-NEW-02).',
  fields: [
    f('patlasv4proto-wf-etapa-ordem', 'Ordem', 'number', undefined, {
      size: 'small',
      readOnly: true,
      required: true,
      relevance: 'identity',
      spec: 'Auto-incremento. Sequência de ações do processo (RN-WF-NEW-02).',
    }),
    f('patlasv4proto-wf-etapa-descricao', 'Descrição', 'text', undefined, {
      required: true,
      spec: 'Nome da ação/etapa. Ex.: Aprovação DIRC, Assinatura Parceiro (RN-WF-06).',
    }),
    f('patlasv4proto-wf-etapa-organizacao', 'Organização', 'reference', undefined, {
      required: true,
      linkedFormId: FORM_UO,
      options: ORG_OPTS,
      spec: 'UO com Representa Organização? = Sim. Filtra UO e Cargo (RN-WF-07).',
    }),
    f('patlasv4proto-wf-etapa-unidade-organizacional', 'Unidade Organizacional', 'reference', undefined, {
      linkedFormId: FORM_UO,
      options: ['Gabinete da Diretoria de Relacionamento com o Cliente', 'Unidade de Gestão de Projetos'],
      spec: 'Unidades da Organização selecionada. Opcional se etapa vale para organização inteira.',
    }),
    f('patlasv4proto-wf-etapa-cargo', 'Cargo', 'reference', undefined, {
      linkedFormId: FORM_CARGO,
      options: ['Diretor', 'Gerente de Projetos', 'Fiscal de Contrato'],
      spec: 'Apenas cargos ativos com Pode assinar = Sim (RN-WF-08). Lista ocupantes ativos.',
    }),
    f('patlasv4proto-wf-etapa-pessoa-especifica', 'Pessoa específica', 'reference', undefined, {
      linkedFormId: FORM_SRV,
      options: ['Lucas Santos', 'João Analista MTI'],
      spec: 'Servidor específico quando a etapa não pode depender só do cargo.',
    }),
    f('patlasv4proto-wf-etapa-papel-envelope', 'Papel no envelope', 'textOptions', undefined, {
      size: 'small',
      options: ['Aprovador', 'Assinante', 'Testemunha'],
      spec: 'Papel no envelope GED. Obrigatório se assinatura digital via GED.',
    }),
    f('patlasv4proto-wf-etapa-parecer', 'Parecer', 'textOptions', undefined, {
      required: true,
      options: ['Aprovar', 'Recusar/Rejeitar'],
      spec: 'Recusa exige justificativa e retorno ao início do fluxo (RN-WF-09).',
    }),
    f('patlasv4proto-wf-etapa-prazo-dias', 'Prazo (dias)', 'number', undefined, {
      size: 'small',
      spec: 'Prazo para execução. Vencido gera alerta e pode notificar por e-mail.',
    }),
    f('patlasv4proto-wf-etapa-notificacao-email', 'Notificação por e-mail', 'boolean', undefined, {
      size: 'small',
      spec: 'Se Sim, responsável recebe e-mail ao receber tarefa pendente.',
    }),
    f('patlasv4proto-wf-etapa-regiao-atuacao', 'Região de atuação', 'textOptions', undefined, {
      size: 'small',
      multiple: true,
      options: REGIAO_OPTS,
      spec: 'Padrão Todos. Restringe a etapa por UF quando diferente de Todos (26 estados + DF).',
    }),
    f('patlasv4proto-wf-etapa-ativo', 'Ativo', 'boolean', undefined, {
      required: true,
      spec: 'Etapa inativa não executa em novos envios para assinatura (RN-WF-10).',
    }),
  ],
}

function buildCargoForm(oldPresets) {
  const presets = (oldPresets ?? []).map((p) => {
    const fv = { ...p.fieldValues }
    const emb = { ...(p.embeddedRowsByFieldId ?? {}) }

    if (p.id === 'patlasv4proto-p-cargo-mti') {
      emb['patlasv4proto-cargo-ocupantes-lista'] = [
        {
          'patlasv4proto-cargo-ocupantes-servidor': 'Lucas Santos',
          'patlasv4proto-cargo-ocupantes-condicao': 'Titular',
          'patlasv4proto-cargo-ocupantes-unidade-de-atuacao': 'Empresa Mato-grossense de Tecnologia da Informação',
          'patlasv4proto-cargo-ocupantes-regiao-atuacao': 'Todos',
          'patlasv4proto-cargo-ocupantes-ativo': true,
        },
      ]
      emb['patlasv4proto-cargo-permissoes-de-visualizacao-lista'] = [
        {
          'patlasv4proto-cargo-perm-tipo-processo': 'Proposta',
          'patlasv4proto-cargo-perm-metodos-acoes': ['Visualizar', 'Criar proposta', 'Enviar para assinatura'],
        },
        {
          'patlasv4proto-cargo-perm-tipo-processo': 'Contrato',
          'patlasv4proto-cargo-perm-metodos-acoes': ['Visualizar', 'Gerar documento'],
        },
      ]
    }

    return {
      ...p,
      fieldValues: {
        ...fv,
        'patlasv4proto-cargo-dados-do-cargo-observacoes':
          fv['patlasv4proto-cargo-dados-do-cargo-observacoes'] ??
          'Cargo utilizado nos fluxos de proposta e contrato.',
      },
      embeddedRowsByFieldId: emb,
    }
  })

  return {
    id: FORM_CARGO,
    name: 'Cargo',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Protótipo Atlas — Cargo. RN-CARGO-01: pertence a UO raiz (Representa Organização? = Sim). RN-CARGO-07/08: Pode assinar habilita no Workflow; papel fica na Etapa.',
    sections: [
      { id: SEC_CARGO_DADOS, title: 'Dados do Cargo', icon: 'badge' },
      { id: SEC_CARGO_OCUP, title: 'Ocupantes', icon: 'group' },
      { id: SEC_CARGO_PERM, title: 'Perfil de Permissões', icon: 'security' },
    ],
    fields: [
      f('patlasv4proto-cargo-dados-do-cargo-nome-do-cargo', 'Nome do Cargo', 'text', SEC_CARGO_DADOS, {
        required: true,
        relevance: 'identity',
        spec: 'Ex.: Diretor, Gerente de Unidade, Analista, Gerente de Projetos.',
      }),
      f('patlasv4proto-cargo-dados-do-cargo-sigla-abreviatura', 'Sigla / Abreviatura', 'text', SEC_CARGO_DADOS, {
        required: true,
        spec: 'Ex.: DIR, GUE, GP.',
      }),
      f('patlasv4proto-cargo-dados-do-cargo-organizacao', 'Organização', 'reference', SEC_CARGO_DADOS, {
        required: true,
        linkedFormId: FORM_UO,
        options: ORG_OPTS,
        spec: 'UO com Representa Organização? = Sim — MTI, Parceiro ou Cliente. Nunca subunidade (RN-CARGO-01/02).',
      }),
      f('patlasv4proto-cargo-dados-do-cargo-pode-assinar', 'Pode assinar', 'boolean', SEC_CARGO_DADOS, {
        size: 'small',
        required: true,
        spec: 'Sim → cargo disponível nas etapas do Workflow. Não autoriza assinatura automática (RN-CARGO-07).',
      }),
      f('patlasv4proto-cargo-dados-do-cargo-ativo', 'Ativo', 'boolean', SEC_CARGO_DADOS, {
        required: true,
        spec: 'Inativo some dos seletores. Ocupações e histórico preservados.',
      }),
      f('patlasv4proto-cargo-dados-do-cargo-observacoes', 'Observações', 'text', SEC_CARGO_DADOS, {
        size: 'large',
        textLong: true,
        spec: 'Ex.: Cargo utilizado nos fluxos de proposta e contrato da MTI.',
      }),
      f('patlasv4proto-cargo-ocupantes-lista', 'Ocupantes', 'embeddedReference', SEC_CARGO_OCUP, {
        size: 'large',
        multiple: true,
        linkedFormId: FORM_CARGO_OCUP,
        embeddedDisplay: 'table',
        spec: 'Fonte oficial Servidor + Cargo + Unidade + Região + Condição (RN-CARGO-03).',
      }),
      f('patlasv4proto-cargo-permissoes-de-visualizacao-lista', 'Perfil de Permissões', 'embeddedReference', SEC_CARGO_PERM, {
        size: 'large',
        multiple: true,
        linkedFormId: FORM_CARGO_PERM,
        embeddedDisplay: 'table',
        embeddedRoot: false,
        spec: 'Tipo de Processo + Métodos/Ações do backend. Sem Aprovar/Recusar/Assinar (RN-CARGO-09).',
      }),
    ],
    exampleValuePresets: presets,
    activeExamplePresetId: presets[0]?.id ?? 'patlasv4proto-p-cargo-mti',
  }
}

function buildWorkflowForm() {
  return {
    id: FORM_WF,
    name: 'Workflow de Assinatura',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Protótipo Atlas — Workflow de Assinatura. RN-WF-01 a RN-WF-05. Execução técnica via Envelope GED (RN-WF-11). Processos em andamento preservam configuração original (RN-WF-09-B).',
    sections: [
      { id: SEC_WF_GERAL, title: 'Geral', icon: 'description' },
      { id: SEC_WF_ETAPAS, title: 'Etapas do Workflow', icon: 'account_tree' },
    ],
    fields: [
      f('patlasv4proto-wf-nome', 'Nome', 'text', SEC_WF_GERAL, {
        size: 'large',
        required: true,
        relevance: 'identity',
        spec: 'Ex.: Assinatura de Proposta Padrão, Assinatura de Contrato Simplificada (RN-WF-01).',
      }),
      f('patlasv4proto-wf-tipo-processo', 'Tipo de Processo', 'textOptions', SEC_WF_GERAL, {
        required: true,
        options: TIPOS_PROCESSO,
        spec: 'Um tipo por workflow. Sem Pedido de Venda na Fase 1 (RN-WF-03, RN-WF-05).',
      }),
      f('patlasv4proto-wf-versao', 'Versão', 'reference', SEC_WF_GERAL, {
        size: 'small',
        required: true,
        linkedFormId: FORM_CONFIG,
        options: ['Versão 1 — MTI', 'Versão 1 — Parceiros', 'Versão 1 — Clientes'],
        spec: 'Referência à Versão de Processo ativa — não campo numérico livre (RN-WF-02).',
      }),
      f('patlasv4proto-wf-ativo', 'Ativo', 'boolean', SEC_WF_GERAL, {
        size: 'large',
        required: true,
        spec: 'Somente workflows ativos aparecem em Enviar para assinatura (RN-WF-04).',
      }),
      f('patlasv4proto-wf-etapas', 'Etapas do Workflow', 'embeddedReference', SEC_WF_ETAPAS, {
        size: 'large',
        multiple: true,
        linkedFormId: FORM_WF_ETAPA,
        embeddedDisplay: 'table',
        embeddedRoot: false,
        spec: 'Tabela de etapas sequenciais. Signatários paralelos na mesma etapa (RN-WF-NEW-01).',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-wf-proposta-mti',
        name: 'Assinatura Proposta MTI',
        iconColor: '#0c4a6e',
        fieldValues: {
          'patlasv4proto-wf-nome': 'Assinatura de Proposta Padrão',
          'patlasv4proto-wf-tipo-processo': 'Proposta',
          'patlasv4proto-wf-versao': 'Versão 1 — MTI',
          'patlasv4proto-wf-ativo': true,
        },
        embeddedRowsByFieldId: {
          'patlasv4proto-wf-etapas': [
            {
              'patlasv4proto-wf-etapa-ordem': 1,
              'patlasv4proto-wf-etapa-descricao': 'Elaboração da proposta',
              'patlasv4proto-wf-etapa-organizacao': 'Empresa Mato-grossense de Tecnologia da Informação',
              'patlasv4proto-wf-etapa-unidade-organizacional': 'Unidade de Gestão de Projetos',
              'patlasv4proto-wf-etapa-cargo': 'Gerente de Projetos',
              'patlasv4proto-wf-etapa-parecer': 'Aprovar',
              'patlasv4proto-wf-etapa-notificacao-email': true,
              'patlasv4proto-wf-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wf-etapa-ativo': true,
            },
            {
              'patlasv4proto-wf-etapa-ordem': 2,
              'patlasv4proto-wf-etapa-descricao': 'Aprovação DIRC',
              'patlasv4proto-wf-etapa-organizacao': 'Empresa Mato-grossense de Tecnologia da Informação',
              'patlasv4proto-wf-etapa-cargo': 'Diretor',
              'patlasv4proto-wf-etapa-papel-envelope': 'Assinante',
              'patlasv4proto-wf-etapa-parecer': 'Aprovar',
              'patlasv4proto-wf-etapa-prazo-dias': 5,
              'patlasv4proto-wf-etapa-notificacao-email': true,
              'patlasv4proto-wf-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wf-etapa-ativo': true,
            },
            {
              'patlasv4proto-wf-etapa-ordem': 3,
              'patlasv4proto-wf-etapa-descricao': 'Assinatura Parceiro',
              'patlasv4proto-wf-etapa-organizacao': 'EloGroup',
              'patlasv4proto-wf-etapa-cargo': 'Gerente de Projetos',
              'patlasv4proto-wf-etapa-papel-envelope': 'Assinante',
              'patlasv4proto-wf-etapa-parecer': 'Aprovar',
              'patlasv4proto-wf-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wf-etapa-ativo': true,
            },
          ],
        },
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-wf-proposta-mti',
  }
}

const WF_FIELD_ID_MAP = {
  mqebbhmoqkwm52: 'patlasv4proto-wf-nome',
  mqedr9ct0hhc4j: 'patlasv4proto-wf-tipo-processo',
  mqebbnn93hgiee: 'patlasv4proto-wf-versao',
  mqebbtncrtsktq: 'patlasv4proto-wf-ativo',
  mqebf4c2vpv5q8: 'patlasv4proto-wf-etapas',
}

const WF_ETAPA_FIELD_ID_MAP = {
  'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-ordem': 'patlasv4proto-wf-etapa-ordem',
  mqecjdq28zqnu3: 'patlasv4proto-wf-etapa-descricao',
  'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-organizacao': 'patlasv4proto-wf-etapa-organizacao',
  'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-unidade-organizacional':
    'patlasv4proto-wf-etapa-unidade-organizacional',
  'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-cargo': 'patlasv4proto-wf-etapa-cargo',
  'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-pessoa-especifica':
    'patlasv4proto-wf-etapa-pessoa-especifica',
  'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-papel-envelope':
    'patlasv4proto-wf-etapa-papel-envelope',
  'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-acao': 'patlasv4proto-wf-etapa-parecer',
  mqeb447176ugp7: 'patlasv4proto-wf-etapa-prazo-dias',
  mqeb4fbm1u7qp7: 'patlasv4proto-wf-etapa-notificacao-email',
  'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-ativo': 'patlasv4proto-wf-etapa-ativo',
}

function remapRow(row, map) {
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    out[map[k] ?? k] = v
  }
  return out
}

function migrateEmbeddedRowsInForms(forms, parentFieldId, oldLinkedFormId, map) {
  for (const form of forms) {
    for (const preset of form.exampleValuePresets ?? []) {
      const rows = preset.embeddedRowsByFieldId?.[parentFieldId]
      if (!rows) continue
      preset.embeddedRowsByFieldId[parentFieldId] = rows.map((r) => remapRow(r, map))
    }
    for (const field of form.fields ?? []) {
      if (field.linkedFormId === oldLinkedFormId && field.type === 'embeddedReference') {
        // rows keyed by this field id handled above when parentFieldId matches
      }
    }
  }
}

function migrateAllWfReferences(forms) {
  const allMaps = { ...WF_FIELD_ID_MAP }
  for (const form of forms) {
    for (const preset of form.exampleValuePresets ?? []) {
      if (!preset.fieldValues) continue
      for (const [oldId, newId] of Object.entries(allMaps)) {
        if (preset.fieldValues[oldId] !== undefined) {
          preset.fieldValues[newId] = preset.fieldValues[oldId]
          delete preset.fieldValues[oldId]
        }
      }
      if (!preset.embeddedRowsByFieldId) continue
      for (const [key, rows] of Object.entries(preset.embeddedRowsByFieldId)) {
        const newKey = WF_FIELD_ID_MAP[key] ?? key
        preset.embeddedRowsByFieldId[newKey] = rows.map((r) => remapRow(r, WF_ETAPA_FIELD_ID_MAP))
        if (newKey !== key) delete preset.embeddedRowsByFieldId[key]
      }
    }
    for (const field of form.fields ?? []) {
      if (field.linkedFormId === FORM_WF) {
        // template workflow ref — keep
      }
      if (WF_FIELD_ID_MAP[field.id]) {
        field.id = WF_FIELD_ID_MAP[field.id]
      }
    }
  }

  // Template form workflow homologação field
  const tpl = forms.find((f) => f.id === 'form-patlasv4-proto-template')
  if (tpl) {
    const wfField = tpl.fields?.find((f) => f.linkedFormId === FORM_WF)
    if (wfField && WF_FIELD_ID_MAP[wfField.id]) {
      // id may already be updated
    }
  }
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  const oldCargo = forms.find((f) => f.id === FORM_CARGO)
  const cargoIdx = forms.findIndex((f) => f.id === FORM_CARGO)
  forms[cargoIdx] = buildCargoForm(oldCargo?.exampleValuePresets)

  const ocupIdx = forms.findIndex((f) => f.id === FORM_CARGO_OCUP)
  forms[ocupIdx] = formCargoOcupante

  const permIdx = forms.findIndex((f) => f.id === FORM_CARGO_PERM)
  forms[permIdx] = formCargoPermissao

  const etapaIdx = forms.findIndex((f) => f.id === FORM_WF_ETAPA)
  forms[etapaIdx] = formWorkflowEtapa

  migrateAllWfReferences(forms)

  const wfIdx = forms.findIndex((f) => f.id === FORM_WF)
  forms[wfIdx] = buildWorkflowForm()

  fs.writeFileSync(FORMS_PATH, JSON.stringify(forms, null, 2) + '\n', 'utf8')
  console.log('✓ Cargo — 3 abas conforme anexos (Dados, Ocupantes, Perfil de Permissões)')
  console.log('✓ Cargo — Métodos/Ações sem Aprovar, Recusar, Assinar (RN-CARGO-09)')
  console.log('✓ Workflow — abas Geral + Etapas do Workflow com presets de exemplo')
  console.log('✓ Workflow Etapa — IDs padronizados patlasv4proto-wf-etapa-*')
}

main()
