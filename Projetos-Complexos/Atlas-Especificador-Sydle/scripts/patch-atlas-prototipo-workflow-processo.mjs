#!/usr/bin/env node
/**
 * Cria Workflow de Processo conforme especificação Discovery (RN-WFP-01 a RN-WFP-05).
 * Uso: node scripts/patch-atlas-prototipo-workflow-processo.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const CLASS_GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')
const WORKSPACES_PATH = path.join(EPIC_DIR, 'workspaces.json')

const FORM_WFP = 'form-patlasv4-proto-workflow-processo'
const FORM_WFP_ETAPA = 'form-patlasv4-proto-workflow-processo-etapa'
const FORM_WF_ASSINATURA = 'mqebasqyphbwea'
const FORM_CARGO = 'form-patlasv4-proto-cargo'
const FORM_CONFIG = 'form-patlasv4-proto-config-processo'

const SEC_WFP_GERAL = 'sec-wfp-geral'
const SEC_WFP_ETAPAS = 'sec-wfp-etapas'

const TIPOS_PROCESSO = [
  'Proposta',
  'Contrato',
  'Ordem de Serviço (OS)',
  'Termo de Homologação',
  'RAER',
]

const TIPOS_ETAPA = ['Ação operacional', 'Assinatura', 'Aprovação interna']

const REGIAO_OPTS = [
  'Todos', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const VERSAO_OPTS = ['Versão 1 — MTI', 'Versão 1 — Parceiros', 'Versão 1 — Clientes']

const CARGO_OPTS = ['Diretor', 'Gerente de Projetos', 'Fiscal de Contrato']

const WF_ASSINATURA_OPTS = ['Assinatura de Proposta Padrão']

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
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.embeddedRoot !== undefined ? { embeddedRoot: opts.embeddedRoot } : {}),
  }
}

const formWorkflowProcessoEtapa = {
  id: FORM_WFP_ETAPA,
  name: 'Workflow de Processo — Etapa',
  sectionLayout: 'none',
  metadata:
    'Etapa do Workflow de Processo. RN-WFP-01: ordem hierárquica e bloqueante. RN-WFP-02: tipo Assinatura dispara Workflow de Assinatura vinculado. RN-WFP-04: fluxo só avança com todos os pareceres da etapa.',
  fields: [
    f('patlasv4proto-wfp-etapa-ordem', 'Ordem', 'number', undefined, {
      size: 'small',
      readOnly: true,
      required: true,
      relevance: 'identity',
      spec: 'Auto-incremento. Sequência hierárquica e bloqueante de ações (RN-WFP-01).',
    }),
    f('patlasv4proto-wfp-etapa-descricao', 'Descrição', 'text', undefined, {
      required: true,
      spec: 'Nome da ação. Ex.: Criar proposta, Gerar nota técnica, Enviar para assinaturas.',
    }),
    f('patlasv4proto-wfp-etapa-tipo', 'Tipo de etapa', 'textOptions', undefined, {
      size: 'small',
      required: true,
      options: TIPOS_ETAPA,
      spec: 'Ação operacional, Assinatura ou Aprovação interna. Assinatura exige Workflow de Assinatura (RN-WFP-02).',
    }),
    f('patlasv4proto-wfp-etapa-workflow-assinatura', 'Workflow de Assinatura', 'reference', undefined, {
      linkedFormId: FORM_WF_ASSINATURA,
      options: WF_ASSINATURA_OPTS,
      spec: 'Obrigatório quando Tipo de etapa = Assinatura. Dispara o fluxo de signatários vinculado (RN-WFP-02, RN-WFP-03).',
    }),
    f('patlasv4proto-wfp-etapa-responsavel-cargo', 'Responsável (Cargo)', 'reference', undefined, {
      linkedFormId: FORM_CARGO,
      options: CARGO_OPTS,
      spec: 'Cargo responsável pela etapa operacional ou aprovação interna. Opcional em etapas de assinatura.',
    }),
    f('patlasv4proto-wfp-etapa-regiao-atuacao', 'Região de atuação', 'textOptions', undefined, {
      size: 'small',
      multiple: true,
      options: REGIAO_OPTS,
      spec: 'Padrão Todos. Restringe a etapa por UF quando diferente de Todos (26 estados + DF).',
    }),
    f('patlasv4proto-wfp-etapa-ativo', 'Ativo', 'boolean', undefined, {
      size: 'small',
      required: true,
      spec: 'Etapa inativa não executa em novos processos.',
    }),
  ],
}

function buildWorkflowProcessoForm() {
  return {
    id: FORM_WFP,
    name: 'Workflow de Processo',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Protótipo Atlas — Workflow de Processo. RN-WFP-01 a RN-WFP-05. Controla sequência de ações operacionais; etapas de assinatura disparam Workflow de Assinatura vinculado.',
    sections: [
      { id: SEC_WFP_GERAL, title: 'Geral', icon: 'description' },
      { id: SEC_WFP_ETAPAS, title: 'Etapas do Workflow', icon: 'account_tree' },
    ],
    fields: [
      f('patlasv4proto-wfp-nome', 'Nome', 'text', SEC_WFP_GERAL, {
        size: 'large',
        required: true,
        relevance: 'identity',
        spec: 'Ex.: Fluxo de Proposta Padrão, Fluxo de Contrato Simplificado.',
      }),
      f('patlasv4proto-wfp-tipo-processo', 'Tipo de Processo', 'textOptions', SEC_WFP_GERAL, {
        required: true,
        options: TIPOS_PROCESSO,
        spec: 'Um tipo por workflow. Vinculado a uma Versão de Processo (RN-WFP-05).',
      }),
      f('patlasv4proto-wfp-versao', 'Versão', 'reference', SEC_WFP_GERAL, {
        size: 'small',
        required: true,
        linkedFormId: FORM_CONFIG,
        options: VERSAO_OPTS,
        spec: 'Referência à Versão de Processo. Um workflow por Versão + Tipo de Processo (RN-WFP-05).',
      }),
      f('patlasv4proto-wfp-ativo', 'Ativo', 'boolean', SEC_WFP_GERAL, {
        size: 'large',
        required: true,
        spec: 'Somente workflows ativos entram em novos processos.',
      }),
      f('patlasv4proto-wfp-etapas', 'Etapas do Workflow', 'embeddedReference', SEC_WFP_ETAPAS, {
        size: 'large',
        multiple: true,
        linkedFormId: FORM_WFP_ETAPA,
        embeddedDisplay: 'table',
        embeddedRoot: false,
        spec: 'Tabela de etapas sequenciais. Ordem bloqueante; assinaturas na mesma etapa em paralelo via Workflow de Assinatura (RN-WFP-01, RN-WFP-03).',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-wfp-proposta-mti',
        name: 'Fluxo de Proposta MTI',
        iconColor: '#0c4a6e',
        fieldValues: {
          'patlasv4proto-wfp-nome': 'Fluxo de Proposta Padrão',
          'patlasv4proto-wfp-tipo-processo': 'Proposta',
          'patlasv4proto-wfp-versao': 'Versão 1 — MTI',
          'patlasv4proto-wfp-ativo': true,
        },
        embeddedRowsByFieldId: {
          'patlasv4proto-wfp-etapas': [
            {
              'patlasv4proto-wfp-etapa-ordem': 1,
              'patlasv4proto-wfp-etapa-descricao': 'Criar proposta',
              'patlasv4proto-wfp-etapa-tipo': 'Ação operacional',
              'patlasv4proto-wfp-etapa-responsavel-cargo': 'Gerente de Projetos',
              'patlasv4proto-wfp-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wfp-etapa-ativo': true,
            },
            {
              'patlasv4proto-wfp-etapa-ordem': 2,
              'patlasv4proto-wfp-etapa-descricao': 'Gerar nota técnica',
              'patlasv4proto-wfp-etapa-tipo': 'Ação operacional',
              'patlasv4proto-wfp-etapa-responsavel-cargo': 'Gerente de Projetos',
              'patlasv4proto-wfp-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wfp-etapa-ativo': true,
            },
            {
              'patlasv4proto-wfp-etapa-ordem': 3,
              'patlasv4proto-wfp-etapa-descricao': 'Enviar para assinaturas',
              'patlasv4proto-wfp-etapa-tipo': 'Assinatura',
              'patlasv4proto-wfp-etapa-workflow-assinatura': 'Assinatura de Proposta Padrão',
              'patlasv4proto-wfp-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wfp-etapa-ativo': true,
            },
          ],
        },
      },
      {
        id: 'patlasv4proto-p-wfp-contrato-mti',
        name: 'Fluxo de Contrato MTI',
        iconColor: '#1e3a5f',
        fieldValues: {
          'patlasv4proto-wfp-nome': 'Fluxo de Contrato Padrão',
          'patlasv4proto-wfp-tipo-processo': 'Contrato',
          'patlasv4proto-wfp-versao': 'Versão 1 — MTI',
          'patlasv4proto-wfp-ativo': true,
        },
        embeddedRowsByFieldId: {
          'patlasv4proto-wfp-etapas': [
            {
              'patlasv4proto-wfp-etapa-ordem': 1,
              'patlasv4proto-wfp-etapa-descricao': 'Cadastrar contrato',
              'patlasv4proto-wfp-etapa-tipo': 'Ação operacional',
              'patlasv4proto-wfp-etapa-responsavel-cargo': 'Fiscal de Contrato',
              'patlasv4proto-wfp-etapa-regiao-atuacao': 'MT',
              'patlasv4proto-wfp-etapa-ativo': true,
            },
            {
              'patlasv4proto-wfp-etapa-ordem': 2,
              'patlasv4proto-wfp-etapa-descricao': 'Aprovação interna jurídica',
              'patlasv4proto-wfp-etapa-tipo': 'Aprovação interna',
              'patlasv4proto-wfp-etapa-responsavel-cargo': 'Diretor',
              'patlasv4proto-wfp-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wfp-etapa-ativo': true,
            },
          ],
        },
      },
      {
        id: 'patlasv4proto-p-wfp-os-mti',
        name: 'Fluxo de OS MTI',
        iconColor: '#134e4a',
        fieldValues: {
          'patlasv4proto-wfp-nome': 'Fluxo de Ordem de Serviço',
          'patlasv4proto-wfp-tipo-processo': 'Ordem de Serviço (OS)',
          'patlasv4proto-wfp-versao': 'Versão 1 — MTI',
          'patlasv4proto-wfp-ativo': true,
        },
        embeddedRowsByFieldId: {
          'patlasv4proto-wfp-etapas': [
            {
              'patlasv4proto-wfp-etapa-ordem': 1,
              'patlasv4proto-wfp-etapa-descricao': 'Emitir OS',
              'patlasv4proto-wfp-etapa-tipo': 'Ação operacional',
              'patlasv4proto-wfp-etapa-responsavel-cargo': 'Gerente de Projetos',
              'patlasv4proto-wfp-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wfp-etapa-ativo': true,
            },
          ],
        },
      },
      {
        id: 'patlasv4proto-p-wfp-homologacao-mti',
        name: 'Fluxo de Homologação MTI',
        iconColor: '#4c1d95',
        fieldValues: {
          'patlasv4proto-wfp-nome': 'Fluxo de Termo de Homologação',
          'patlasv4proto-wfp-tipo-processo': 'Termo de Homologação',
          'patlasv4proto-wfp-versao': 'Versão 1 — MTI',
          'patlasv4proto-wfp-ativo': true,
        },
        embeddedRowsByFieldId: {
          'patlasv4proto-wfp-etapas': [
            {
              'patlasv4proto-wfp-etapa-ordem': 1,
              'patlasv4proto-wfp-etapa-descricao': 'Elaborar termo',
              'patlasv4proto-wfp-etapa-tipo': 'Ação operacional',
              'patlasv4proto-wfp-etapa-responsavel-cargo': 'Gerente de Projetos',
              'patlasv4proto-wfp-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wfp-etapa-ativo': true,
            },
            {
              'patlasv4proto-wfp-etapa-ordem': 2,
              'patlasv4proto-wfp-etapa-descricao': 'Homologar termo',
              'patlasv4proto-wfp-etapa-tipo': 'Aprovação interna',
              'patlasv4proto-wfp-etapa-responsavel-cargo': 'Diretor',
              'patlasv4proto-wfp-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wfp-etapa-ativo': true,
            },
          ],
        },
      },
      {
        id: 'patlasv4proto-p-wfp-raer-mti',
        name: 'Fluxo de RAER MTI',
        iconColor: '#7c2d12',
        fieldValues: {
          'patlasv4proto-wfp-nome': 'Fluxo de RAER',
          'patlasv4proto-wfp-tipo-processo': 'RAER',
          'patlasv4proto-wfp-versao': 'Versão 1 — MTI',
          'patlasv4proto-wfp-ativo': true,
        },
        embeddedRowsByFieldId: {
          'patlasv4proto-wfp-etapas': [
            {
              'patlasv4proto-wfp-etapa-ordem': 1,
              'patlasv4proto-wfp-etapa-descricao': 'Registrar RAER',
              'patlasv4proto-wfp-etapa-tipo': 'Ação operacional',
              'patlasv4proto-wfp-etapa-responsavel-cargo': 'Fiscal de Contrato',
              'patlasv4proto-wfp-etapa-regiao-atuacao': 'Todos',
              'patlasv4proto-wfp-etapa-ativo': true,
            },
          ],
        },
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-wfp-proposta-mti',
  }
}

function upsertForm(forms, form) {
  const idx = forms.findIndex((x) => x.id === form.id)
  if (idx >= 0) forms[idx] = form
  else forms.push(form)
}

function patchClassGroups() {
  const cg = JSON.parse(fs.readFileSync(CLASS_GROUPS_PATH, 'utf8'))

  cg.assignments[FORM_WFP] = 'grp-patlasv4-proto-config'
  cg.assignments[FORM_WFP_ETAPA] = 'grp-patlasv4-proto-embutido'

  const configOrder = cg.memberOrderByGroup['grp-patlasv4-proto-config']
  if (!configOrder.includes(FORM_WFP)) {
    const wfIdx = configOrder.indexOf(FORM_WF_ASSINATURA)
    if (wfIdx >= 0) configOrder.splice(wfIdx, 0, FORM_WFP)
    else configOrder.push(FORM_WFP)
  }

  const embOrder = cg.memberOrderByGroup['grp-patlasv4-proto-embutido']
  if (!embOrder.includes(FORM_WFP_ETAPA)) {
    const wfEtapaIdx = embOrder.indexOf('form-patlasv4-proto-workflow-etapa')
    if (wfEtapaIdx >= 0) embOrder.splice(wfEtapaIdx + 1, 0, FORM_WFP_ETAPA)
    else embOrder.push(FORM_WFP_ETAPA)
  }

  fs.writeFileSync(CLASS_GROUPS_PATH, JSON.stringify(cg, null, 2) + '\n', 'utf8')
}

function patchWorkspaces() {
  const workspaces = JSON.parse(fs.readFileSync(WORKSPACES_PATH, 'utf8'))
  const ws = workspaces.find((w) => w.id === 'ws-atlas-prototipo')
  if (!ws) return

  const pkg = ws.packages?.find((p) => p.id === 'pkg-patlasv4-proto-config')
  if (!pkg) return

  const exists = pkg.classes?.some((c) => c.linkedFormId === FORM_WFP)
  if (!exists) {
    const cfgIdx = pkg.classes.findIndex((c) => c.id === 'cls-patlasv4-proto-cfg')
    const newClass = {
      id: 'cls-patlasv4-proto-wfp',
      name: 'Workflow de Processo',
      linkedFormId: FORM_WFP,
      linkedFormExamplePresetIds: [
        'patlasv4proto-p-wfp-proposta-mti',
        'patlasv4proto-p-wfp-contrato-mti',
        'patlasv4proto-p-wfp-os-mti',
        'patlasv4proto-p-wfp-homologacao-mti',
        'patlasv4proto-p-wfp-raer-mti',
      ],
    }
    if (cfgIdx >= 0) pkg.classes.splice(cfgIdx + 1, 0, newClass)
    else pkg.classes.push(newClass)
  }

  fs.writeFileSync(WORKSPACES_PATH, JSON.stringify(workspaces, null, 2) + '\n', 'utf8')
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  upsertForm(forms, formWorkflowProcessoEtapa)
  upsertForm(forms, buildWorkflowProcessoForm())

  fs.writeFileSync(FORMS_PATH, JSON.stringify(forms, null, 2) + '\n', 'utf8')
  patchClassGroups()
  patchWorkspaces()

  console.log('✓ Workflow de Processo — formulário principal com abas Geral + Etapas')
  console.log('✓ Workflow de Processo — Etapa com Tipo, Workflow de Assinatura, Cargo e Região')
  console.log('✓ 5 presets de exemplo (Proposta, Contrato, OS, Homologação, RAER)')
  console.log('✓ class-groups.json e workspaces.json atualizados')
}

main()
