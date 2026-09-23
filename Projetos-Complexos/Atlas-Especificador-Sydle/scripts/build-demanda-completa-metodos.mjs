/**
 * Métodos das classes satélite da Demanda Completa F3
 * (Orçamento, OS, Termo, RAER) — conforme R11, R15, R17, R18.
 *
 * Uso: node scripts/build-demanda-completa-metodos.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')

function field(p) {
  return {
    size: 'medium',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'common',
    ...p,
  }
}

function methodForm({ id, name, metadata, fields }) {
  return {
    id,
    name,
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata,
    fields,
    methods: [],
    exampleValuePresets: [],
    fieldVisibilityRules: [],
  }
}

function method({ id, name, icon, kind, inputFormId, spec }) {
  return { id, name, icon, kind, inputFormId, spec }
}

function upsert(forms, form) {
  const i = forms.findIndex((f) => f.id === form.id)
  if (i >= 0) forms[i] = form
  else forms.push(form)
}

const METHOD_FORMS = [
  // —— Orçamento ——
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-orc-enviar',
    name: 'Orçamento — Enviar proposta ao cliente',
    metadata: 'R11. Envia proposta parametrizada (itens/versão catálogo).',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-orc-env-alerta',
        label: 'Aviso',
        type: 'alert',
        size: 'large',
        readOnly: true,
        relevance: 'highlight',
        alertVariant: 'info',
        alertTitle: 'Enviar proposta',
        alertMessage: 'Cliente recebe no portal. Status → Proposta enviada.',
      }),
      field({
        id: 'patlasv4proto-mdemc-orc-env-validade',
        label: 'Validade',
        type: 'date',
        size: 'small',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-orc-env-obs',
        label: 'Observação ao cliente',
        type: 'text',
        size: 'large',
        textLong: true,
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-orc-aceitar',
    name: 'Orçamento — Aceitar (cliente)',
    metadata: 'R11. Cliente (+ gerente área) aprova → segue para OS.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-orc-ace-cliente',
        label: 'Assinatura do cliente',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-orc-ace-gerente',
        label: 'Assinatura do gerente de área',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-orc-recusar',
    name: 'Orçamento — Recusar',
    metadata: 'R11. Cliente recusa proposta (motivo).',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-orc-rec-motivo',
        label: 'Motivo',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
        relevance: 'highlight',
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-orc-gerar-os',
    name: 'Orçamento — Gerar / autorizar OS',
    metadata: 'R11. Após aceito: OS nova ou consumo em OS existente.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-orc-os-acao',
        label: 'Ação',
        type: 'textOptions',
        size: 'large',
        required: true,
        relevance: 'highlight',
        options: [
          'Criar nova OS',
          'Vincular OS existente',
          'Autorizar consumo em OS existente',
        ],
      }),
      field({
        id: 'patlasv4proto-mdemc-orc-os-numero',
        label: 'Nº OS (se vincular/consumir)',
        type: 'text',
        size: 'small',
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-orc-definir-pag',
    name: 'Orçamento — Definir pagamento (sem contrato)',
    metadata: 'R12. Stub: indenização | nova contratação | desistir. CRM = futuro.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-orc-pag-opcao',
        label: 'Definir pagamento',
        type: 'textOptions',
        size: 'medium',
        required: true,
        relevance: 'highlight',
        options: ['Indenização', 'Nova contratação', 'Desistiu', 'Ainda não definido'],
      }),
      field({
        id: 'patlasv4proto-mdemc-orc-pag-obs',
        label: 'Observação',
        type: 'text',
        size: 'large',
        textLong: true,
      }),
    ],
  }),

  // —— OS ——
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-os-assinar',
    name: 'OS — Assinar (gerente de operação)',
    metadata: 'R11. Gerente de operação assina a OS antes da execução.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-os-ass-confirma',
        label: 'Confirmar assinatura do gerente de operação',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-os-ass-em',
        label: 'Data',
        type: 'date',
        size: 'small',
        required: true,
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-os-autorizar-sn',
    name: 'OS — Autorizar execução → ServiceNow',
    metadata: 'R17. No Atlas; envia SN «aprovada e em atendimento». Sem re-assinatura.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-os-sn-alerta',
        label: 'Aviso',
        type: 'alert',
        size: 'large',
        readOnly: true,
        relevance: 'highlight',
        alertVariant: 'info',
        alertTitle: 'Atlas → ServiceNow',
        alertMessage:
          'Autorização ocorre no Atlas. SN recebe já «aprovada e em atendimento».',
      }),
      field({
        id: 'patlasv4proto-mdemc-os-sn-confirma',
        label: 'Autorizar e enviar',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-os-consumo',
    name: 'OS — Registrar consumo / saldo',
    metadata: 'R15. Controlar vida, saldo e consumo. Sem OS não remove obrigação de pagamento.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-os-con-saldo',
        label: 'Saldo',
        type: 'number',
        size: 'small',
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-os-con-consumo',
        label: 'Consumo',
        type: 'number',
        size: 'small',
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-os-con-obs',
        label: 'Observação',
        type: 'text',
        size: 'large',
        textLong: true,
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-os-dilatar',
    name: 'OS — Registrar dilatação de prazo',
    metadata: 'R15. Evento tripartite: CRI + parceiro + cliente.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-os-dil-motivo',
        label: 'Motivo',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-os-dil-nova',
        label: 'Novo prazo',
        type: 'date',
        size: 'small',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-os-dil-cri',
        label: 'Autorizado CRI',
        type: 'boolean',
        required: true,
      }),
      field({
        id: 'patlasv4proto-mdemc-os-dil-parceiro',
        label: 'Autorizado parceiro',
        type: 'boolean',
        required: true,
      }),
      field({
        id: 'patlasv4proto-mdemc-os-dil-cliente',
        label: 'Autorizado cliente',
        type: 'boolean',
        required: true,
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-os-complementar',
    name: 'OS — Complementar / substituir',
    metadata: 'R15. OS complementar ou substituição atestada; histórico de versões.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-os-comp-tipo',
        label: 'Tipo',
        type: 'textOptions',
        size: 'medium',
        required: true,
        relevance: 'highlight',
        options: ['OS complementar', 'OS de substituição'],
      }),
      field({
        id: 'patlasv4proto-mdemc-os-comp-motivo',
        label: 'Motivo / atestação',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
      }),
    ],
  }),

  // —— Termo ——
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-termo-enviar',
    name: 'Termo — Enviar para assinatura',
    metadata: 'R18. Avisa cliente; envia a gestor/fiscal/solicitante.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-termo-env-confirma',
        label: 'Enviar para assinatura',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-termo-env-obs',
        label: 'Mensagem ao cliente',
        type: 'text',
        size: 'large',
        textLong: true,
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-termo-assinar',
    name: 'Termo — Assinar (gestor/fiscal/solicitante)',
    metadata: 'R18. Assinaturas do cliente no termo.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-termo-ass-papel',
        label: 'Papel',
        type: 'textOptions',
        size: 'medium',
        required: true,
        relevance: 'highlight',
        options: ['Gestor', 'Fiscal', 'Solicitante'],
      }),
      field({
        id: 'patlasv4proto-mdemc-termo-ass-confirma',
        label: 'Assinar',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-termo-ajuste',
    name: 'Termo — Solicitar ajuste',
    metadata: 'R18. Cliente ou MTI.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-termo-aj-por',
        label: 'Solicitado por',
        type: 'textOptions',
        size: 'medium',
        required: true,
        relevance: 'highlight',
        options: ['Cliente', 'MTI'],
      }),
      field({
        id: 'patlasv4proto-mdemc-termo-aj-motivo',
        label: 'Motivo',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
        relevance: 'highlight',
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-termo-vincular-raer',
    name: 'Termo — Gerar / vincular RAER',
    metadata: 'R18. Termo + RAER no encerramento.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-termo-raer-acao',
        label: 'Ação',
        type: 'textOptions',
        size: 'medium',
        required: true,
        relevance: 'highlight',
        options: ['Gerar novo RAER', 'Vincular RAER existente'],
      }),
      field({
        id: 'patlasv4proto-mdemc-termo-raer-numero',
        label: 'Nº RAER (se vincular)',
        type: 'text',
        size: 'small',
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-termo-concluir',
    name: 'Termo — Concluir homologação',
    metadata: 'R18. Após assinaturas → efetivado/entregue.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-termo-conc-confirma',
        label: 'Concluir homologação',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
    ],
  }),

  // —— RAER ——
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-raer-iniciar',
    name: 'RAER — Iniciar / vincular ao termo',
    metadata: 'R18. Abre RAER vinculado ao termo de homologação.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-raer-ini-periodo',
        label: 'Período de referência',
        type: 'text',
        size: 'medium',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-raer-ini-termo',
        label: 'Termo vinculado',
        type: 'text',
        size: 'small',
        required: true,
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-raer-indicador',
    name: 'RAER — Registrar indicador',
    metadata: 'Indicador meta × realizado no RAER.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-raer-ind-nome',
        label: 'Indicador',
        type: 'text',
        size: 'medium',
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-raer-ind-meta',
        label: 'Meta',
        type: 'text',
        size: 'small',
        required: true,
      }),
      field({
        id: 'patlasv4proto-mdemc-raer-ind-real',
        label: 'Realizado',
        type: 'text',
        size: 'small',
        required: true,
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-raer-entrega',
    name: 'RAER — Registrar entrega',
    metadata: 'Entrega comprovada no período do RAER.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-raer-ent-desc',
        label: 'Descrição',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-raer-ent-data',
        label: 'Data',
        type: 'date',
        size: 'small',
        required: true,
      }),
      field({
        id: 'patlasv4proto-mdemc-raer-ent-file',
        label: 'Evidência',
        type: 'file',
        size: 'medium',
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-raer-plano',
    name: 'RAER — Plano de ação',
    metadata: 'Ação corretiva quando indicador fica abaixo da meta.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-raer-pa-acao',
        label: 'Ação',
        type: 'text',
        size: 'large',
        textLong: true,
        required: true,
        relevance: 'highlight',
      }),
      field({
        id: 'patlasv4proto-mdemc-raer-pa-resp',
        label: 'Responsável',
        type: 'text',
        size: 'medium',
        required: true,
      }),
    ],
  }),
  methodForm({
    id: 'form-patlasv4-proto-metodo-demc-raer-concluir',
    name: 'RAER — Concluir',
    metadata: 'R18. Fecha RAER após termo assinado / resultados registrados.',
    fields: [
      field({
        id: 'patlasv4proto-mdemc-raer-conc-confirma',
        label: 'Concluir RAER',
        type: 'boolean',
        required: true,
        relevance: 'highlight',
      }),
    ],
  }),
]

const CLASS_METHODS = {
  'form-patlasv4-proto-demc-orcamento': [
    method({
      id: 'method-demc-orc-enviar',
      name: 'Enviar proposta ao cliente',
      icon: 'send',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-orc-enviar',
      spec: 'R11',
    }),
    method({
      id: 'method-demc-orc-aceitar',
      name: 'Aceitar orçamento',
      icon: 'check_circle',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-orc-aceitar',
      spec: 'R11 · cliente + gerente área',
    }),
    method({
      id: 'method-demc-orc-gerar-os',
      name: 'Gerar / autorizar OS',
      icon: 'assignment',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-orc-gerar-os',
      spec: 'R11',
    }),
    method({
      id: 'method-demc-orc-recusar',
      name: 'Recusar orçamento',
      icon: 'cancel',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demc-orc-recusar',
      spec: 'R11',
    }),
    method({
      id: 'method-demc-orc-definir-pag',
      name: 'Definir pagamento (sem contrato)',
      icon: 'payments',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demc-orc-definir-pag',
      spec: 'R12',
    }),
  ],
  'form-patlasv4-proto-demc-os': [
    method({
      id: 'method-demc-os-assinar',
      name: 'Assinar (gerente de operação)',
      icon: 'draw',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-os-assinar',
      spec: 'R11',
    }),
    method({
      id: 'method-demc-os-autorizar-sn',
      name: 'Autorizar execução → ServiceNow',
      icon: 'cloud_upload',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-os-autorizar-sn',
      spec: 'R17',
    }),
    method({
      id: 'method-demc-os-consumo',
      name: 'Registrar consumo / saldo',
      icon: 'monitoring',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-os-consumo',
      spec: 'R15',
    }),
    method({
      id: 'method-demc-os-dilatar',
      name: 'Registrar dilatação de prazo',
      icon: 'event',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demc-os-dilatar',
      spec: 'R15',
    }),
    method({
      id: 'method-demc-os-complementar',
      name: 'Complementar / substituir OS',
      icon: 'content_copy',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demc-os-complementar',
      spec: 'R15',
    }),
  ],
  'form-patlasv4-proto-demc-termo': [
    method({
      id: 'method-demc-termo-enviar',
      name: 'Enviar para assinatura',
      icon: 'send',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-termo-enviar',
      spec: 'R18',
    }),
    method({
      id: 'method-demc-termo-assinar',
      name: 'Assinar termo',
      icon: 'draw',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-termo-assinar',
      spec: 'R18 · gestor/fiscal/solicitante',
    }),
    method({
      id: 'method-demc-termo-vincular-raer',
      name: 'Gerar / vincular RAER',
      icon: 'assessment',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-termo-vincular-raer',
      spec: 'R18',
    }),
    method({
      id: 'method-demc-termo-ajuste',
      name: 'Solicitar ajuste',
      icon: 'edit_note',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demc-termo-ajuste',
      spec: 'R18 · cliente ou MTI',
    }),
    method({
      id: 'method-demc-termo-concluir',
      name: 'Concluir homologação',
      icon: 'verified',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demc-termo-concluir',
      spec: 'R18',
    }),
  ],
  'form-patlasv4-proto-demc-raer': [
    method({
      id: 'method-demc-raer-iniciar',
      name: 'Iniciar / vincular ao termo',
      icon: 'play_arrow',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-raer-iniciar',
      spec: 'R18',
    }),
    method({
      id: 'method-demc-raer-indicador',
      name: 'Registrar indicador',
      icon: 'speed',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-raer-indicador',
      spec: 'Meta × realizado',
    }),
    method({
      id: 'method-demc-raer-entrega',
      name: 'Registrar entrega',
      icon: 'task_alt',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demc-raer-entrega',
      spec: 'Evidência no período',
    }),
    method({
      id: 'method-demc-raer-plano',
      name: 'Plano de ação',
      icon: 'playlist_add_check',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demc-raer-plano',
      spec: 'Corretiva',
    }),
    method({
      id: 'method-demc-raer-concluir',
      name: 'Concluir RAER',
      icon: 'done_all',
      kind: 'menu',
      inputFormId: 'form-patlasv4-proto-metodo-demc-raer-concluir',
      spec: 'R18',
    }),
  ],
}

function main() {
  const formsPath = path.join(EPIC, 'forms.json')
  const cgPath = path.join(EPIC, 'class-groups.json')
  const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
  const cg = JSON.parse(fs.readFileSync(cgPath, 'utf8'))

  for (const mf of METHOD_FORMS) upsert(forms, mf)

  const allMetIds = []
  for (const [classId, methods] of Object.entries(CLASS_METHODS)) {
    const form = forms.find((f) => f.id === classId)
    if (!form) throw new Error(`Classe ausente: ${classId}`)
    form.methods = methods
    for (const m of methods) {
      allMetIds.push(m.inputFormId)
      cg.assignments[m.inputFormId] = 'grp-atlas-demanda-completa-met'
    }
  }

  const prev = cg.memberOrderByGroup['grp-atlas-demanda-completa-met'] || []
  cg.memberOrderByGroup['grp-atlas-demanda-completa-met'] = [
    ...prev.filter((id) => !allMetIds.includes(id)),
    ...allMetIds,
  ]

  fs.writeFileSync(formsPath, JSON.stringify(forms, null, 2) + '\n')
  fs.writeFileSync(cgPath, JSON.stringify(cg, null, 2) + '\n')

  for (const [classId, methods] of Object.entries(CLASS_METHODS)) {
    const form = forms.find((f) => f.id === classId)
    console.log(
      form.name,
      '→',
      methods.filter((m) => m.kind === 'destaque').length,
      'destaque ·',
      methods.filter((m) => m.kind === 'menu').length,
      'menu',
    )
  }
  console.log('OK: métodos satélite Demanda Completa')
}

main()
