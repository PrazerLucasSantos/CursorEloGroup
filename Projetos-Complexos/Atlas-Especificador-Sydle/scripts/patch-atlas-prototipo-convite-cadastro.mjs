#!/usr/bin/env node
/**
 * Módulo Convite de Cadastro — UO, ConviteCadastro, método, portal e Solicitação de vínculo.
 * Base: Atlas_Convite_Cadastro.md (Fase 2 — protótipo)
 * Uso: node scripts/patch-atlas-prototipo-convite-cadastro.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')
const WS_PATH = path.join(EPIC_DIR, 'workspaces.json')
const PORTALS_PATH = path.join(EPIC_DIR, 'portals.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_CONVITE = 'form-patlasv4-proto-convite-cadastro'
const FORM_SOLIC = 'form-patlasv4-proto-solicitacao-vinculo'
const FORM_METODO = 'form-patlasv4-proto-metodo-gerar-convite'
const FORM_METODO_OUT = 'form-patlasv4-proto-metodo-gerar-convite-saida'
const FORM_PORTAL = 'form-patlasv4-proto-portal-vinculo-organizacao'
const FORM_SERVIDOR = 'form-patlasv4-proto-servidor'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'

const SEC_USUARIOS = 'sec-patlasv4proto-uo-usuarios-responsaveis'
const F_EMPRESA = 'patlasv4proto-uo-empresa'
const F_LIMITE = 'patlasv4proto-uo-limite-usuarios'
const F_USR_COUNT = 'patlasv4proto-uo-usuarios-cadastrados'
const F_CONVITES = 'patlasv4proto-uo-convites'
const METH_GERAR = 'patlasv4proto-uo-meth-gerar-convite'

const UO_OPTIONS = [
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
    sectionId,
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
  }
}

function buildConviteForm() {
  return {
    id: FORM_CONVITE,
    name: 'Convite de cadastro',
    sectionLayout: 'none',
    defaultCanvasMode: 'read',
    metadata:
      'Classe de apoio — convite para autocadastro (Parceiro/Cliente). RN-CONV-01 a RN-CONV-05. Objetos não buscáveis.',
    fields: [
      f('patlasv4proto-convite-uo', 'Unidade Organizacional', 'reference', null, {
        required: true,
        linkedFormId: FORM_UO,
        options: UO_OPTIONS,
        relevance: 'identity',
        spec: 'Unidade que gerou o convite. Preenchida automaticamente pelo método.',
      }),
      f('patlasv4proto-convite-codigo', 'Código', 'text', null, {
        required: true,
        readOnly: true,
        relevance: 'highlight',
        spec: 'Alfanumérico, 8 caracteres. Ex.: A3F7K2MX. RN-CONV-05.',
      }),
      f('patlasv4proto-convite-link', 'Link de cadastro', 'text', null, {
        required: true,
        readOnly: true,
        size: 'large',
        spec: 'URL completa: [BASE_URL]/cadastro?convite=[CODIGO]',
      }),
      f('patlasv4proto-convite-qtd-usos', 'Quantidade de usos permitidos', 'number', null, {
        required: true,
        spec: 'Definida pelo Gestor. Mínimo: 1.',
      }),
      f('patlasv4proto-convite-usos-realizados', 'Quantidade de usos realizados', 'number', null, {
        readOnly: true,
        spec: 'Incrementado a cada cadastro confirmado. Inicia em 0. RN-CONV-02.',
      }),
      f('patlasv4proto-convite-expiracao', 'Data/hora de expiração', 'date', null, {
        required: true,
        spec: 'Deve ser futura em relação à geração. RN-CONV-01.',
      }),
      f('patlasv4proto-convite-gerado-por', 'Gerado por', 'reference', null, {
        readOnly: true,
        linkedFormId: FORM_SERVIDOR,
        spec: 'Servidor logado na execução do método.',
      }),
      f('patlasv4proto-convite-gerado-em', 'Data/hora de geração', 'date', null, {
        readOnly: true,
        spec: 'Timestamp da execução do método.',
      }),
      f('patlasv4proto-convite-ativo', 'Ativo', 'boolean', null, {
        required: true,
        relevance: 'highlight',
        spec: 'Sim = aceita cadastros. Novo convite inativa o anterior (RN-CONV-03).',
      }),
      f('patlasv4proto-convite-observacao', 'Observação', 'text', null, {
        size: 'large',
        spec: 'Contexto registrado pelo Gestor.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-convite-elogroup',
        name: 'Convite EloGroup ativo',
        iconColor: '#0d9488',
        fieldValues: {
          'patlasv4proto-convite-uo': 'EloGroup',
          'patlasv4proto-convite-codigo': 'A3F7K2MX',
          'patlasv4proto-convite-link': 'https://portal.atlas.exemplo.gov.br/cadastro?convite=A3F7K2MX',
          'patlasv4proto-convite-qtd-usos': 10,
          'patlasv4proto-convite-usos-realizados': 3,
          'patlasv4proto-convite-expiracao': '30/06/2026',
          'patlasv4proto-convite-gerado-por': 'Felipe Oliveira Costa',
          'patlasv4proto-convite-gerado-em': '17/06/2026',
          'patlasv4proto-convite-ativo': true,
          'patlasv4proto-convite-observacao': 'Convite para novos consultores parceiros.',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-convite-elogroup',
  }
}

function buildMetodoGerarForm() {
  return {
    id: FORM_METODO,
    name: 'Parâmetro de método: Gerar Código de Convite',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'Entrada do método Gerar Código de Convite na aba Usuários da UO.',
    fields: [
      f('patlasv4proto-mgc-convite-atual', 'Convite ativo existente', 'text', null, {
        readOnly: true,
        size: 'large',
        spec: 'Se houver convite ativo: "Convite atual: [CÓDIGO] — [X] de [Y] usos — Expira em [DATA]".',
      }),
      f('patlasv4proto-mgc-gerar-novo', 'Gerar novo link?', 'boolean', null, {
        required: true,
        relevance: 'highlight',
        spec: 'Padrão: Não. Se Não, exibe convite atual e encerra (Copiar Link).',
      }),
      f('patlasv4proto-mgc-qtd-usos', 'Quantidade de usos', 'number', null, {
        required: true,
        hidden: true,
        spec: 'Mínimo 1. Valida contra limite de usuários da UO.',
      }),
      f('patlasv4proto-mgc-expiracao', 'Data/hora de expiração', 'date', null, {
        required: true,
        hidden: true,
        spec: 'Deve ser futura. Sugestão: +24h.',
      }),
      f('patlasv4proto-mgc-observacao', 'Observação', 'text', null, {
        size: 'large',
        hidden: true,
      }),
    ],
    fieldVisibilityRules: [
      {
        id: 'rule-mgc-show-novo-campos',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-mgc-gerar-novo',
        sourceKind: 'boolean',
        expectedBoolean: true,
        action: 'show',
        targetFieldIds: [
          'patlasv4proto-mgc-qtd-usos',
          'patlasv4proto-mgc-expiracao',
          'patlasv4proto-mgc-observacao',
        ],
      },
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-metodo-gerar-convite',
        name: 'Gerar novo convite',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlasv4proto-mgc-convite-atual':
            'Convite atual: A3F7K2MX — 3 de 10 usos — Expira em 30/06/2026',
          'patlasv4proto-mgc-gerar-novo': true,
          'patlasv4proto-mgc-qtd-usos': 5,
          'patlasv4proto-mgc-expiracao': '18/06/2026',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-metodo-gerar-convite',
  }
}

function buildMetodoSaidaForm() {
  return {
    id: FORM_METODO_OUT,
    name: 'Saída de método: Gerar Código de Convite',
    sectionLayout: 'none',
    defaultCanvasMode: 'read',
    metadata: 'Resultado após geração do convite (_output do método).',
    fields: [
      f('patlasv4proto-mgo-codigo', 'Código gerado', 'text', null, {
        readOnly: true,
        relevance: 'highlight',
      }),
      f('patlasv4proto-mgo-link', 'Link de cadastro', 'text', null, {
        readOnly: true,
        size: 'large',
        spec: 'URL com botão Copiar Link na tela de referência.',
      }),
      f('patlasv4proto-mgo-vagas', 'Vagas disponíveis', 'text', null, {
        readOnly: true,
        spec: '"[N] usos disponíveis — expira em [DATA HORA]".',
      }),
      f('patlasv4proto-mgo-mensagem', 'Mensagem de sucesso', 'text', null, {
        readOnly: true,
        size: 'large',
        spec: 'Código gerado com sucesso. Compartilhe o link com os colaboradores.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-metodo-gerar-convite-saida',
        name: 'Convite gerado',
        iconColor: '#059669',
        fieldValues: {
          'patlasv4proto-mgo-codigo': 'B8K2P9WQ',
          'patlasv4proto-mgo-link': 'https://portal.atlas.exemplo.gov.br/cadastro?convite=B8K2P9WQ',
          'patlasv4proto-mgo-vagas': '5 usos disponíveis — expira em 18/06/2026 18:00',
          'patlasv4proto-mgo-mensagem':
            'Código gerado com sucesso. Compartilhe o link com os colaboradores.',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-metodo-gerar-convite-saida',
  }
}

function buildSolicitacaoForm() {
  return {
    id: FORM_SOLIC,
    name: 'Solicitação de vínculo',
    sectionLayout: 'none',
    defaultCanvasMode: 'read',
    metadata: 'Solicitação de autocadastro pendente de confirmação do Gestor (Inbox). RN-CONV-06 a RN-CONV-10.',
    fields: [
      f('patlasv4proto-svinc-nome', 'Nome do colaborador', 'text', null, {
        readOnly: true,
        required: true,
        relevance: 'identity',
      }),
      f('patlasv4proto-svinc-cpf', 'CPF', 'text', null, {
        readOnly: true,
        required: true,
        relevance: 'highlight',
      }),
      f('patlasv4proto-svinc-foto', 'Foto', 'file', null, {
        readOnly: true,
        spec: 'Extraída do MT Login / Gov.br quando disponível.',
      }),
      f('patlasv4proto-svinc-uo', 'Organização solicitada', 'reference', null, {
        required: true,
        linkedFormId: FORM_UO,
        options: UO_OPTIONS,
      }),
      f('patlasv4proto-svinc-data', 'Data da solicitação', 'date', null, {
        readOnly: true,
        required: true,
      }),
      f('patlasv4proto-svinc-codigo-convite', 'Código de convite utilizado', 'text', null, {
        readOnly: true,
        relevance: 'common',
        spec: 'Rastreabilidade do convite usado no portal.',
      }),
      f('patlasv4proto-svinc-motivo-recusa', 'Motivo da recusa', 'text', null, {
        size: 'large',
        hidden: true,
        spec: 'Obrigatório ao recusar o vínculo.',
      }),
      f('patlasv4proto-svinc-status', 'Status', 'textOptions', null, {
        required: true,
        options: ['Pendente', 'Confirmado', 'Recusado'],
      }),
    ],
    methods: [
      {
        id: 'patlasv4proto-svinc-meth-confirmar',
        name: 'Confirmar Vínculo',
        icon: 'check_circle',
        kind: 'destaque',
      },
      {
        id: 'patlasv4proto-svinc-meth-recusar',
        name: 'Recusar',
        icon: 'cancel',
        kind: 'destaque',
      },
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-svinc-pendente',
        name: 'Solicitação pendente',
        iconColor: '#f59e0b',
        fieldValues: {
          'patlasv4proto-svinc-nome': 'Ana Paula Mendes',
          'patlasv4proto-svinc-cpf': '123.456.789-00',
          'patlasv4proto-svinc-uo': 'EloGroup',
          'patlasv4proto-svinc-data': '17/06/2026',
          'patlasv4proto-svinc-codigo-convite': 'A3F7K2MX',
          'patlasv4proto-svinc-status': 'Pendente',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-svinc-pendente',
  }
}

function buildPortalForm() {
  return {
    id: FORM_PORTAL,
    name: 'Portal — Vincular-se a uma Organização',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Fluxo de autocadastro no portal (MT Login / Gov.br). Etapa 2: inserção do código de convite.',
    fields: [
      f('patlasv4proto-pvo-nome', 'Nome', 'text', null, {
        readOnly: true,
        required: true,
        relevance: 'identity',
        spec: 'Extraído do MT Login / Gov.br.',
      }),
      f('patlasv4proto-pvo-cpf', 'CPF', 'text', null, {
        readOnly: true,
        required: true,
        spec: 'Extraído do MT Login / Gov.br.',
      }),
      f('patlasv4proto-pvo-codigo', 'Código de convite', 'text', null, {
        required: true,
        size: 'large',
        relevance: 'highlight',
        spec: '8 caracteres. Valida RN-CONV-06 a RN-CONV-09.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-portal-vinculo',
        name: 'Inserir convite',
        iconColor: '#0048b6',
        fieldValues: {
          'patlasv4proto-pvo-nome': 'Ana Paula Mendes',
          'patlasv4proto-pvo-cpf': '123.456.789-00',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-portal-vinculo',
  }
}

function patchUo(uo) {
  const sections = (uo.sections ?? []).map((s) =>
    s.id === SEC_USUARIOS ? { ...s, title: 'Usuários', icon: 'group' } : s,
  )

  const fields = (uo.fields ?? []).filter(
    (x) =>
      x.id !== F_LIMITE &&
      x.id !== F_USR_COUNT &&
      x.id !== F_CONVITES,
  )

  const insertAfter = fields.findIndex((x) => x.id === 'patlasv4proto-uo-pessoas-nos-cargos')
  const newFields = [
    f(F_LIMITE, 'Limite de usuários', 'number', SEC_USUARIOS, {
      hidden: true,
      spec: 'Máximo de usuários cadastrados. Vazio = sem limite. Visível quando Empresa = Sim.',
    }),
    f(F_USR_COUNT, 'Usuários cadastrados', 'number', SEC_USUARIOS, {
      readOnly: true,
      hidden: true,
      spec: 'Contador "X de Y usuários cadastrados" (calculado).',
    }),
    f(F_CONVITES, 'Convites de cadastro', 'embeddedReference', SEC_USUARIOS, {
      multiple: true,
      hidden: true,
      linkedFormId: FORM_CONVITE,
      embeddedDisplay: 'table',
      spec: 'Histórico e convite ativo. Card compacto na tela de referência.',
    }),
  ]

  if (insertAfter >= 0) {
    fields.splice(insertAfter + 1, 0, ...newFields)
  } else {
    fields.push(...newFields)
  }

  const rules = (uo.fieldVisibilityRules ?? []).filter(
    (r) =>
      r.id !== 'rule-uo-show-limite-empresa' &&
      r.id !== 'rule-uo-show-convite-parceiro' &&
      r.id !== 'rule-uo-show-convite-cliente',
  )

  rules.push(
    {
      id: 'rule-uo-show-limite-empresa',
      operator: 'eq',
      sourceFieldId: F_EMPRESA,
      sourceKind: 'boolean',
      expectedBoolean: true,
      action: 'show',
      targetFieldIds: [F_LIMITE, F_USR_COUNT, F_CONVITES],
    },
    {
      id: 'rule-uo-show-convite-parceiro',
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-uo-tipo-organizacao',
      sourceKind: 'textOptions',
      expectedOptionText: 'Parceiro',
      action: 'show',
      targetFieldIds: [F_CONVITES],
    },
    {
      id: 'rule-uo-show-convite-cliente',
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-uo-tipo-organizacao',
      sourceKind: 'textOptions',
      expectedOptionText: 'Cliente',
      action: 'show',
      targetFieldIds: [F_CONVITES],
    },
  )

  const methods = (uo.methods ?? []).filter((m) => m.id !== METH_GERAR)
  methods.push({
    id: METH_GERAR,
    name: 'Gerar Código de Convite',
    icon: 'card_giftcard',
    kind: 'destaque',
    inputFormId: FORM_METODO,
  })

  const presets = (uo.exampleValuePresets ?? []).map((preset) => {
    if (preset.id !== 'patlasv4proto-p-unidade-organizacional-parceiro') return preset
    const fv = { ...(preset.fieldValues ?? {}) }
    fv[F_LIMITE] = 25
    fv[F_USR_COUNT] = 8
    const emb = { ...(preset.embeddedRowsByFieldId ?? {}) }
    emb[F_CONVITES] = [
      {
        'patlasv4proto-convite-codigo': 'A3F7K2MX',
        'patlasv4proto-convite-qtd-usos': 10,
        'patlasv4proto-convite-usos-realizados': 3,
        'patlasv4proto-convite-expiracao': '30/06/2026',
        'patlasv4proto-convite-ativo': true,
      },
    ]
    return { ...preset, fieldValues: fv, embeddedRowsByFieldId: emb }
  })

  const mtiPreset = presets.find((p) => p.id === 'patlasv4proto-p-unidade-organizacional-mti')
  if (mtiPreset) {
    mtiPreset.fieldValues = {
      ...(mtiPreset.fieldValues ?? {}),
      [F_LIMITE]: 500,
      [F_USR_COUNT]: 142,
    }
  }

  return {
    ...uo,
    defaultCanvasMode: 'read',
    metadata:
      'Protótipo Atlas — UO. Abas Responsáveis/Usuários com limite, convites e método Gerar Código de Convite (Fase 2).',
    sections,
    fields,
    fieldVisibilityRules: rules,
    methods,
    exampleValuePresets: presets,
  }
}

function upsertForm(forms, formDef) {
  const idx = forms.findIndex((x) => x.id === formDef.id)
  if (idx >= 0) forms[idx] = { ...forms[idx], ...formDef }
  else forms.push(formDef)
}

function patchClassGroups(cg) {
  const emb = cg.memberOrderByGroup?.['grp-patlasv4-proto-embutido'] ?? []
  const sem = cg.memberOrderByGroup?.__sem_grupo__ ?? []
  const cad = cg.memberOrderByGroup?.['grp-patlasv4-proto-cadastro'] ?? []
  const op = cg.memberOrderByGroup?.['grp-patlasv4-proto-operacao'] ?? []

  for (const id of [
    FORM_CONVITE,
    FORM_METODO,
    FORM_METODO_OUT,
    FORM_PORTAL,
  ]) {
    if (!emb.includes(id)) emb.push(id)
  }
  if (!sem.includes(FORM_PORTAL)) sem.push(FORM_PORTAL)
  if (!op.includes(FORM_SOLIC)) op.push(FORM_SOLIC)

  cg.memberOrderByGroup = {
    ...cg.memberOrderByGroup,
    'grp-patlasv4-proto-embutido': emb,
    'grp-patlasv4-proto-operacao': op,
    __sem_grupo__: sem,
  }
  return cg
}

function patchWorkspace(ws) {
  for (const wsItem of ws) {
    for (const pkg of wsItem.packages ?? []) {
      if (pkg.id === 'pkg-patlasv4-proto-operacao') {
        const exists = pkg.classes?.some((c) => c.linkedFormId === FORM_SOLIC)
        if (!exists) {
          pkg.classes = [
            ...(pkg.classes ?? []),
            {
              id: 'cls-patlasv4-proto-svinc',
              name: 'Solicitação de vínculo',
              linkedFormId: FORM_SOLIC,
              linkedFormExamplePresetIds: ['patlasv4proto-p-svinc-pendente'],
            },
          ]
        }
      }
    }
  }
  return ws
}

function buildPortals() {
  return [
    {
      id: 'portal-patlasv4-proto-cadastro',
      name: 'Portal — Autocadastro Atlas',
      servicePortalHomeHeroTitle: 'Portal Atlas',
      servicePortalHomeHeroSubtitle: 'Autocadastro para colaboradores de Parceiros e Clientes',
      servicePortalHomeSearchPlaceholder: 'Buscar serviços',
      servicePortalHeaderMenuOptions: ['Meu Painel', 'Portal Atlas'],
      servicePortalHeaderUserInitials: 'AT',
      servicePortalHomeColorPrimary: '#0048b6',
      servicePortalHomeColorSecondary: '#0048b6',
      servicePortalHomeColorText: '#ffffff',
      servicePortalHomeColorBackground: '#ffffff',
      servicePortalHomeSections: [
        {
          id: 'sec-patlasv4-portal-auth',
          type: 'html',
          htmlContent:
            '<div style="padding:16px 20px;margin:0 0 8px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;"><p style="margin:0 0 8px;font-weight:600;color:#0c4a6e;">Etapa 1 — Autenticação</p><p style="margin:0;font-size:0.9rem;color:#475569;">Entre com <strong>MT Login</strong> ou <strong>Gov.br</strong>. Nome e CPF são preenchidos automaticamente na próxima etapa.</p></div>',
        },
        {
          id: 'sec-patlasv4-portal-cadastro',
          type: 'catalog',
          name: 'Vincular-se à organização',
          gridColumns: 3,
          gridRows: 1,
          services: [
            {
              id: 'svc-patlasv4-vinculo-org',
              name: 'Vincular-se a uma Organização',
              description:
                'Informe o código de convite recebido do gestor da sua organização.',
              icon: 'group_add',
            },
            {
              id: 'svc-patlasv4-acompanhar-vinculo',
              name: 'Acompanhar solicitação',
              description: 'Consulte o status da sua solicitação de vínculo.',
              icon: 'history',
            },
          ],
        },
        {
          id: 'sec-patlasv4-portal-info',
          type: 'html',
          htmlContent:
            '<p style="margin:12px 16px;color:#616161;font-size:0.9rem;">Após enviar, o gestor da organização confirma o vínculo no Inbox. Mensagens de erro: código inválido, expirado ou esgotado (RN-CONV-06 a RN-CONV-09).</p>',
        },
      ],
    },
  ]
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const uIdx = forms.findIndex((x) => x.id === FORM_UO)
  if (uIdx < 0) throw new Error('UO não encontrada')

  const newForms = [
    buildConviteForm(),
    buildMetodoGerarForm(),
    buildMetodoSaidaForm(),
    buildSolicitacaoForm(),
    buildPortalForm(),
  ]
  for (const fd of newForms) upsertForm(forms, fd)
  forms[uIdx] = patchUo(forms[uIdx])

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  fs.writeFileSync(
    GROUPS_PATH,
    `${JSON.stringify(patchClassGroups(JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))), null, 2)}\n`,
    'utf8',
  )
  fs.writeFileSync(
    WS_PATH,
    `${JSON.stringify(patchWorkspace(JSON.parse(fs.readFileSync(WS_PATH, 'utf8'))), null, 2)}\n`,
    'utf8',
  )
  fs.writeFileSync(PORTALS_PATH, `${JSON.stringify(buildPortals(), null, 2)}\n`, 'utf8')

  const specDest = path.join(EPIC_DIR, 'source', 'Atlas_Convite_Cadastro.md')
  const specSrc = path.join(process.env.USERPROFILE ?? '', 'Downloads', 'Atlas_Convite_Cadastro.md')
  if (fs.existsSync(specSrc)) {
    fs.copyFileSync(specSrc, specDest)
  }

  console.log('✓ UO — aba Usuários: limite, contador, convites, método Gerar Código de Convite')
  console.log('✓ Convite de cadastro + formulários de método (entrada/saída)')
  console.log('✓ Solicitação de vínculo (Inbox) + portal autocadastro')
  console.log('✓ portals.json criado no épico atlas-prototipo')
}

main()
