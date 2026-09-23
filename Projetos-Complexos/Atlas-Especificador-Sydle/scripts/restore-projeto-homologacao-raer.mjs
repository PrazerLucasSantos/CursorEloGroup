#!/usr/bin/env node
/**
 * Cria a classe "Projeto" (Fase 1) unificando Termo de Homologação + RAER (decisão Luiz 15/06).
 * - Tela única com 3 abas: Vínculos · Homologação · RAER (indicadores, entregas, plano de ação).
 * - Remove a classe separada "(16) Termo de Homologação" e suas referências.
 *
 * Uso: node scripts/restore-projeto-homologacao-raer.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')
const WS_PATH = path.join(EPIC_DIR, 'workspaces.json')

const FORM_MAIN = 'form-patlasv4-proto-projeto'
const FORM_IND = 'form-patlasv4-proto-raer-indicador'
const FORM_ENT = 'form-patlasv4-proto-raer-entrega'
const FORM_PA = 'form-patlasv4-proto-raer-plano-acao'

const FORM_TERMO = 'form-patlasv4-proto-termo-homologacao'
const FORM_PROCESSOS = 'form-patlasv4-proto-processos'
const FORM_OS = 'form-patlasv4-proto-emissao-ordem-servico'
const FORM_CONTRATO = 'form-patlasv4-proto-contrato'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'

const SEC_VINC = 'sec-patlasv4proto-projeto-vinculos'
const SEC_HOM = 'sec-patlasv4proto-projeto-homologacao'
const SEC_RAER = 'sec-patlasv4proto-projeto-raer'

const F_STATUS = 'patlasv4proto-projeto-status-geral'

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
    ...(sectionId ? { sectionId } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.alertVariant ? { alertVariant: opts.alertVariant } : {}),
    ...(opts.alertTitle ? { alertTitle: opts.alertTitle } : {}),
    ...(opts.alertMessage ? { alertMessage: opts.alertMessage } : {}),
  }
}

function buildIndicadorForm() {
  return {
    id: FORM_IND,
    name: '(16.1) RAER · Indicador de entrega',
    sectionLayout: 'none',
    metadata: 'Indicador de resultado medido no RAER (meta x realizado).',
    fields: [
      f('patlasv4proto-raer-ind-indicador', 'Indicador', 'text', null, { required: true, relevance: 'identity' }),
      f('patlasv4proto-raer-ind-meta', 'Meta', 'text', null, { required: true, size: 'small' }),
      f('patlasv4proto-raer-ind-realizado', 'Realizado', 'text', null, { required: true, size: 'small' }),
      f('patlasv4proto-raer-ind-percent', '% atingido', 'number', null, {
        readOnly: true,
        size: 'small',
        relevance: 'highlight',
        spec: 'Cálculo automático realizado/meta.',
      }),
    ],
    exampleValuePresets: [],
  }
}

function buildEntregaForm() {
  return {
    id: FORM_ENT,
    name: '(16.2) RAER · Entrega realizada',
    sectionLayout: 'none',
    metadata: 'Entrega concreta comprovada no período do RAER.',
    fields: [
      f('patlasv4proto-raer-ent-descricao', 'Descrição', 'text', null, {
        required: true,
        relevance: 'identity',
        textLong: true,
      }),
      f('patlasv4proto-raer-ent-data', 'Data da entrega', 'date', null, { required: true }),
      f('patlasv4proto-raer-ent-evidencia', 'Evidência', 'file', null, { spec: 'Upload de comprovante.' }),
    ],
    exampleValuePresets: [],
  }
}

function buildPlanoAcaoForm() {
  return {
    id: FORM_PA,
    name: '(16.3) RAER · Plano de ação',
    sectionLayout: 'none',
    metadata: 'Ação corretiva quando indicadores ficam abaixo da meta.',
    fields: [
      f('patlasv4proto-raer-pa-acao', 'Ação', 'text', null, {
        required: true,
        relevance: 'identity',
        textLong: true,
      }),
      f('patlasv4proto-raer-pa-responsavel', 'Responsável', 'reference', null, {
        linkedFormId: FORM_PESSOA,
        options: PESSOA_OPTS,
      }),
      f('patlasv4proto-raer-pa-prazo', 'Prazo', 'date', null, { required: true }),
      f('patlasv4proto-raer-pa-status', 'Status', 'textOptions', null, {
        options: ['Pendente', 'Em andamento', 'Concluído'],
      }),
    ],
    exampleValuePresets: [],
  }
}

function buildMainForm() {
  return {
    id: FORM_MAIN,
    name: '(16) Projeto · Homologação + RAER',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Classe Projeto (unifica Termo de Homologação + RAER — Luiz 15/06). Etapa pós-OS: homologação do cliente ' +
      'e relatório de acompanhamento e entrega de resultados. Distinto do projeto técnico SNOW (output).',
    sections: [
      { id: SEC_VINC, title: 'Vínculos e Status', icon: 'account_tree' },
      { id: SEC_HOM, title: 'Homologação', icon: 'verified' },
      { id: SEC_RAER, title: 'RAER — Acompanhamento de Resultados', icon: 'assessment' },
    ],
    fields: [
      f('patlasv4proto-projeto-nome', 'Nome do projeto', 'text', SEC_VINC, {
        required: true,
        relevance: 'identity',
        size: 'large',
        spec: 'Identificação do projeto/entrega pós-OS.',
      }),
      f('patlasv4proto-projeto-processo', 'Processo vinculado', 'reference', SEC_VINC, {
        required: true,
        relevance: 'highlight',
        linkedFormId: FORM_PROCESSOS,
        spec: 'Processo operacional ao qual o projeto pertence.',
      }),
      f('patlasv4proto-projeto-os', 'Ordem de Serviço vinculada', 'reference', SEC_VINC, {
        linkedFormId: FORM_OS,
        spec: 'OS que originou a homologação/entrega (RF-PJ-01).',
      }),
      f('patlasv4proto-projeto-contrato', 'Contrato', 'reference', SEC_VINC, {
        linkedFormId: FORM_CONTRATO,
      }),
      f('patlasv4proto-projeto-responsavel', 'Responsável pelo delivery', 'reference', SEC_VINC, {
        linkedFormId: FORM_PESSOA,
        options: PESSOA_OPTS,
      }),
      f(F_STATUS, 'Status geral', 'textOptions', SEC_VINC, {
        required: true,
        relevance: 'highlight',
        options: ['Em homologação', 'Homologado', 'Em entrega', 'Concluído'],
        spec: 'Máquina de estados do projeto (RF-PJ-02).',
      }),
      f('patlasv4proto-projeto-data-prevista', 'Data prevista', 'date', SEC_VINC, {
        spec: 'Previsão de conclusão (RF-PJ-03).',
      }),
      f('patlasv4proto-projeto-data-real', 'Data real', 'date', SEC_VINC, {
        spec: 'Conclusão efetiva (RF-PJ-03).',
      }),

      f('patlasv4proto-projeto-hom-alerta', 'Homologação', 'alert', SEC_HOM, {
        alertVariant: 'info',
        alertTitle: 'Aba Homologação',
        alertMessage:
          'Aprovação formal do cliente. A recusa exige justificativa. Assinatura via método "Enviar para Assinatura" quando aplicável (RF-PJ-04).',
      }),
      f('patlasv4proto-projeto-hom-necessaria', 'Homologação necessária', 'boolean', SEC_HOM, {
        spec: 'Indica se o projeto exige homologação (origem: tipo de processo).',
      }),
      f('patlasv4proto-projeto-hom-status', 'Status da homologação', 'textOptions', SEC_HOM, {
        options: ['Pendente', 'Aprovada', 'Recusada'],
      }),
      f('patlasv4proto-projeto-hom-responsavel', 'Responsável pela homologação', 'reference', SEC_HOM, {
        linkedFormId: FORM_PESSOA,
        options: PESSOA_OPTS,
      }),
      f('patlasv4proto-projeto-hom-documento', 'Documento de homologação', 'file', SEC_HOM, {
        spec: 'Termo de homologação gerado/anexado.',
      }),
      f('patlasv4proto-projeto-hom-data', 'Data da homologação', 'date', SEC_HOM),
      f('patlasv4proto-projeto-hom-justificativa', 'Justificativa de recusa', 'text', SEC_HOM, {
        textLong: true,
        spec: 'Obrigatória se status = Recusada.',
      }),

      f('patlasv4proto-projeto-raer-alerta', 'RAER', 'alert', SEC_RAER, {
        alertVariant: 'info',
        alertTitle: 'RAER — Relatório de Acompanhamento e Entrega de Resultados',
        alertMessage:
          'Relatório final do período: indicadores (meta x realizado), entregas comprovadas e plano de ação corretivo.',
      }),
      f('patlasv4proto-projeto-raer-necessario', 'RAER necessário', 'boolean', SEC_RAER),
      f('patlasv4proto-projeto-raer-status', 'Status RAER', 'textOptions', SEC_RAER, {
        options: ['Pendente', 'Gerado', 'Enviado', 'Concluído'],
      }),
      f('patlasv4proto-projeto-raer-documento', 'Documento RAER', 'file', SEC_RAER),
      f('patlasv4proto-projeto-raer-indicadores', 'Indicadores de entrega', 'embeddedReference', SEC_RAER, {
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_IND,
      }),
      f('patlasv4proto-projeto-raer-entregas', 'Entregas realizadas', 'embeddedReference', SEC_RAER, {
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_ENT,
      }),
      f('patlasv4proto-projeto-raer-planos', 'Plano de ação corretivo', 'embeddedReference', SEC_RAER, {
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_PA,
      }),
    ],
    methods: [
      {
        id: 'patlasv4proto-shared-meth-enviar-assinatura',
        name: 'Enviar para Assinatura',
        icon: 'draw',
        kind: 'destaque',
        inputFormId: 'form-patlasv4-proto-metodo-enviar-assinatura',
        spec: 'Cria envelope GED do termo de homologação e dispara fluxo paralelo (RF-PJ-04).',
      },
      {
        id: 'patlasv4proto-projeto-meth-gerar-raer',
        name: 'Gerar RAER',
        icon: 'description',
        kind: 'destaque',
        spec: 'Gera o documento RAER a partir dos indicadores e entregas. Status RAER → Gerado.',
      },
    ],
    exampleValuePresets: buildPresets(),
    activeExamplePresetId: 'patlasv4proto-p-projeto-mti',
  }
}

function buildPresets() {
  const indicadores = [
    {
      'patlasv4proto-raer-ind-indicador': 'Processos digitalizados',
      'patlasv4proto-raer-ind-meta': '500/mês',
      'patlasv4proto-raer-ind-realizado': '512/mês',
      'patlasv4proto-raer-ind-percent': 102,
    },
    {
      'patlasv4proto-raer-ind-indicador': 'Tempo médio de tramitação',
      'patlasv4proto-raer-ind-meta': '-40%',
      'patlasv4proto-raer-ind-realizado': '-37%',
      'patlasv4proto-raer-ind-percent': 92,
    },
  ]
  const entregas = [
    {
      'patlasv4proto-raer-ent-descricao': 'Implantação do módulo de assinaturas em produção',
      'patlasv4proto-raer-ent-data': '2026-05-15T10:00:00',
      'patlasv4proto-raer-ent-evidencia': 'evidencia-golive.pdf',
    },
  ]

  return [
    {
      id: 'patlasv4proto-p-projeto-mti',
      name: 'Exemplo MTI — Em homologação',
      iconColor: '#0c4a6e',
      fieldValues: {
        'patlasv4proto-projeto-nome': 'Atlas — Implantação Fase 1',
        'patlasv4proto-projeto-responsavel': 'Felipe Oliveira Costa',
        [F_STATUS]: 'Em homologação',
        'patlasv4proto-projeto-data-prevista': '2026-07-30T10:00:00',
        'patlasv4proto-projeto-hom-necessaria': true,
        'patlasv4proto-projeto-hom-status': 'Pendente',
        'patlasv4proto-projeto-hom-responsavel': 'Carlos Eduardo Souza',
        'patlasv4proto-projeto-raer-necessario': true,
        'patlasv4proto-projeto-raer-status': 'Pendente',
      },
      embeddedRowsByFieldId: {},
    },
    {
      id: 'patlasv4proto-p-projeto-parceiro',
      name: 'Exemplo Parceiro — Homologado, RAER gerado',
      iconColor: '#7c3aed',
      fieldValues: {
        'patlasv4proto-projeto-nome': 'Portal de Serviços PMC',
        'patlasv4proto-projeto-responsavel': 'Helena Ribeiro Lima',
        [F_STATUS]: 'Em entrega',
        'patlasv4proto-projeto-data-prevista': '2026-06-30T10:00:00',
        'patlasv4proto-projeto-hom-necessaria': true,
        'patlasv4proto-projeto-hom-status': 'Aprovada',
        'patlasv4proto-projeto-hom-responsavel': 'Carlos Eduardo Souza',
        'patlasv4proto-projeto-hom-documento': 'termo-homologacao-pmc.pdf',
        'patlasv4proto-projeto-hom-data': '2026-05-20T10:00:00',
        'patlasv4proto-projeto-raer-necessario': true,
        'patlasv4proto-projeto-raer-status': 'Gerado',
        'patlasv4proto-projeto-raer-documento': 'raer-pmc-2026-05.pdf',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-projeto-raer-indicadores': indicadores,
        'patlasv4proto-projeto-raer-entregas': entregas,
      },
    },
    {
      id: 'patlasv4proto-p-projeto-cliente',
      name: 'Exemplo Cliente — Concluído',
      iconColor: '#0d9488',
      fieldValues: {
        'patlasv4proto-projeto-nome': 'GED SEPLAG — Expansão',
        'patlasv4proto-projeto-responsavel': 'Felipe Oliveira Costa',
        [F_STATUS]: 'Concluído',
        'patlasv4proto-projeto-data-prevista': '2026-05-30T10:00:00',
        'patlasv4proto-projeto-data-real': '2026-05-28T10:00:00',
        'patlasv4proto-projeto-hom-necessaria': true,
        'patlasv4proto-projeto-hom-status': 'Aprovada',
        'patlasv4proto-projeto-hom-data': '2026-05-10T10:00:00',
        'patlasv4proto-projeto-raer-necessario': true,
        'patlasv4proto-projeto-raer-status': 'Concluído',
        'patlasv4proto-projeto-raer-documento': 'raer-seplag-final.pdf',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-projeto-raer-indicadores': indicadores,
        'patlasv4proto-projeto-raer-entregas': entregas,
        'patlasv4proto-projeto-raer-planos': [
          {
            'patlasv4proto-raer-pa-acao': 'Reforço de capacitação na unidade com menor adesão',
            'patlasv4proto-raer-pa-responsavel': 'Helena Ribeiro Lima',
            'patlasv4proto-raer-pa-prazo': '2026-06-15T10:00:00',
            'patlasv4proto-raer-pa-status': 'Concluído',
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

function main() {
  // ---- forms.json ----
  let forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  // remove o Termo separado (unificado em Projeto)
  forms = forms.filter((x) => x.id !== FORM_TERMO)
  for (const fd of [buildIndicadorForm(), buildEntregaForm(), buildPlanoAcaoForm(), buildMainForm()]) {
    upsertForm(forms, fd)
  }
  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  // ---- class-groups.json ----
  const cg = JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))
  // remove termo das atribuições/ordem
  delete cg.assignments[FORM_TERMO]
  for (const k of Object.keys(cg.memberOrderByGroup)) {
    cg.memberOrderByGroup[k] = cg.memberOrderByGroup[k].filter((id) => id !== FORM_TERMO)
  }
  // Projeto principal entra no domínio 05 · Documentos (lugar do antigo termo, posição 16)
  cg.assignments[FORM_MAIN] = 'grp-05-documentos'
  const docOrder = cg.memberOrderByGroup['grp-05-documentos']
  if (!docOrder.includes(FORM_MAIN)) docOrder.push(FORM_MAIN)
  // embutidas RAER no subgrupo de embutidas de Documentos
  const embOrder = cg.memberOrderByGroup['grp-05-documentos-emb']
  for (const id of [FORM_IND, FORM_ENT, FORM_PA]) {
    cg.assignments[id] = 'grp-05-documentos-emb'
    if (!embOrder.includes(id)) embOrder.push(id)
  }
  fs.writeFileSync(GROUPS_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

  // ---- workspaces.json ----
  const ws = JSON.parse(fs.readFileSync(WS_PATH, 'utf8'))
  const w = ws[0]
  for (const pkg of w.packages) {
    pkg.classes = (pkg.classes || []).map((c) =>
      c.id === 'cls-mapa-termo'
        ? {
            id: 'cls-mapa-projeto',
            name: '(16) Projeto · Homologação + RAER',
            linkedFormId: FORM_MAIN,
            linkedFormExamplePresetIds: [
              'patlasv4proto-p-projeto-mti',
              'patlasv4proto-p-projeto-parceiro',
              'patlasv4proto-p-projeto-cliente',
            ],
          }
        : c,
    )
  }
  fs.writeFileSync(WS_PATH, `${JSON.stringify(ws, null, 2)}\n`, 'utf8')

  console.log('OK: classe Projeto (Homologacao + RAER) criada; Termo separado removido.')
}

main()
