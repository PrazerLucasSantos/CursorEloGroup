#!/usr/bin/env node
/**
 * Notificações (Fase 1) — regra configurável: evento (gatilho) numa entidade → destinatários (cascata) → canal.
 * - Classe "Notificação" + classe embutida "Destinatário" (cascata Organização/Pessoa/Cargo até o e-mail).
 * - Campo de antecedência configurável no Tipo Documento (gatilhos por data).
 * - Novo domínio "08 · Notificações"; renumera Backlog/Servidor.
 *
 * Uso: node scripts/apply-notificacoes.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')
const WS_PATH = path.join(EPIC_DIR, 'workspaces.json')

const FORM_MAIN = 'form-patlasv4-proto-notificacao'
const FORM_DEST = 'form-patlasv4-proto-notificacao-destinatario'
const FORM_TDOC = 'form-patlasv4-proto-tipo-documento'

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'
const FORM_CARGO = 'form-patlasv4-proto-cargo'

const GRP_MAIN = 'grp-08-notificacoes'
const GRP_EMB = 'grp-08-notificacoes-emb'

const PERFIL_OPTS = ['MTI', 'Parceiro', 'Cliente']
const UO_OPTS = [
  'Empresa Mato-grossense de Tecnologia da Informação',
  'EloGroup',
  'Secretaria de Estado de Planejamento e Gestão',
]
const PESSOA_OPTS = ['Bernardo Almeida', 'Lucas Santos', 'Felipe Oliveira Costa', 'Carlos Eduardo Souza']
const CARGO_OPTS = ['Diretor', 'Analista', 'Gerente de Projetos', 'Fiscal de Contrato']

const D_TIPO = 'patlasv4proto-notif-dest-tipo'
const D_PERFIL = 'patlasv4proto-notif-dest-perfil'
const D_ORG = 'patlasv4proto-notif-dest-organizacao'
const D_UNID = 'patlasv4proto-notif-dest-unidade'
const D_PESSOA = 'patlasv4proto-notif-dest-pessoa'
const D_CARGO = 'patlasv4proto-notif-dest-cargo'
const D_COND = 'patlasv4proto-notif-dest-condicao'
const D_REGIAO = 'patlasv4proto-notif-dest-regiao'
const D_EMAIL_RESP = 'patlasv4proto-notif-dest-email-responsavel'
const D_EMAIL = 'patlasv4proto-notif-dest-email'

function f(id, label, type, sectionId, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    hidden: opts.hidden ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    ...(sectionId ? { sectionId } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
  }
}

function showRule(id, expected, targets) {
  return {
    id,
    operator: 'eq',
    sourceFieldId: D_TIPO,
    sourceKind: 'textOptions',
    expectedOptionText: expected,
    action: 'show',
    targetFieldIds: targets,
  }
}

function buildDestinatarioForm() {
  return {
    id: FORM_DEST,
    name: 'Notificação · Destinatário',
    sectionLayout: 'none',
    metadata:
      'Linha de destinatário em cascata. Tipo define os campos: Organização (perfil/org/unidade/e-mail do responsável), ' +
      'Pessoa (perfil/pessoa) ou Cargo (org/unidade/cargo/perfil/condição/região). Sempre termina no e-mail do destinatário.',
    fields: [
      f(D_TIPO, 'Tipo de destinatário', 'textOptions', null, {
        required: true,
        relevance: 'identity',
        options: ['Organização', 'Pessoa', 'Cargo'],
        spec: 'Define quais campos aparecem na cascata até o e-mail.',
      }),
      f(D_PERFIL, 'Perfil', 'textOptions', null, { hidden: true, size: 'small', options: PERFIL_OPTS }),
      f(D_ORG, 'Organização', 'reference', null, { hidden: true, linkedFormId: FORM_UO, options: UO_OPTS }),
      f(D_UNID, 'Unidade organizacional', 'text', null, {
        hidden: true,
        spec: 'Caminho da UO, ex.: MTI/DIRC.',
      }),
      f(D_PESSOA, 'Pessoa', 'reference', null, {
        hidden: true,
        linkedFormId: FORM_PESSOA,
        options: PESSOA_OPTS,
        spec: 'Lista filtrada pelo perfil escolhido.',
      }),
      f(D_CARGO, 'Cargo', 'reference', null, { hidden: true, linkedFormId: FORM_CARGO, options: CARGO_OPTS }),
      f(D_COND, 'Condição', 'textOptions', null, {
        hidden: true,
        size: 'small',
        options: ['Titular', 'Substituto', 'Suplente'],
      }),
      f(D_REGIAO, 'Região de atuação', 'text', null, { hidden: true, size: 'small', spec: 'Ex.: MT, Todos.' }),
      f(D_EMAIL_RESP, 'E-mail do responsável', 'text', null, {
        hidden: true,
        readOnly: true,
        spec: 'Derivado do responsável informado na organização.',
      }),
      f(D_EMAIL, 'E-mail do destinatário', 'text', null, {
        required: true,
        relevance: 'highlight',
        spec: 'Resultado final da cascata — para onde a notificação é enviada.',
      }),
    ],
    fieldVisibilityRules: [
      showRule('rule-notif-dest-org', 'Organização', [D_PERFIL, D_ORG, D_UNID, D_EMAIL_RESP]),
      showRule('rule-notif-dest-pessoa', 'Pessoa', [D_PERFIL, D_PESSOA]),
      showRule('rule-notif-dest-cargo', 'Cargo', [D_ORG, D_UNID, D_CARGO, D_PERFIL, D_COND, D_REGIAO]),
    ],
    exampleValuePresets: [],
  }
}

const GATILHOS = [
  'Ao criar organização',
  'Ao inativar organização',
  'Ao vincular usuário a cargo (Atribuir cargo)',
  'Ao desligar pessoa',
  'Ao gerar convite',
  'Ao aprovar convite',
  'Convite prestes a expirar',
  'Solicitação de vínculo recebida',
  'Documento da organização vencendo',
  'Documento vencido',
  'Documento aguardando validação',
  'Ao enviar para assinatura',
  'Assinatura pendente (lembrete)',
  'Assinatura concluída (todos)',
  'Assinatura recusada (cancela envelope)',
  'Tarefa aguardando ação (etapa do processo)',
  'Proposta aprovada',
  'OS emitida',
  'Vigência do contrato vencendo',
  'Homologação pendente',
  'Homologação aprovada/recusada',
  'RAER a gerar/enviar',
  'Prazo de entrega do projeto se aproximando',
  'Ciclo de monitoramento mensal (Dossiê EV)',
  'Entrega devolvida (Success Gap)',
  'Plano de ação com prazo vencendo',
]

function buildMainForm() {
  return {
    id: FORM_MAIN,
    name: '(20) Notificação',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Regra de notificação configurável: quando um gatilho ocorre numa entidade, envia para os destinatários (cascata) ' +
      'pelos canais escolhidos (Interna / E-mail / Painel). Gatilhos por data usam a antecedência configurada.',
    fields: [
      f('patlasv4proto-notif-nome', 'Nome', 'text', null, {
        required: true,
        relevance: 'identity',
        size: 'large',
        spec: 'Identificação da regra. Ex.: "Documento vencendo — parceiro".',
      }),
      f('patlasv4proto-notif-ativo', 'Ativo', 'boolean', null, {
        required: true,
        spec: 'Regras inativas não disparam.',
      }),
      f('patlasv4proto-notif-entidade', 'Entidade', 'textOptions', null, {
        required: true,
        relevance: 'highlight',
        options: [
          'Organização',
          'Pessoa',
          'Cargo',
          'Convite',
          'Documento (cadastro)',
          'Proposta',
          'Contrato',
          'Ordem de Serviço',
          'Projeto (Homologação/RAER)',
          'Dossiê de Entrega de Valor',
          'Assinatura',
        ],
        spec: 'Classe principal sobre a qual o gatilho ocorre.',
      }),
      f('patlasv4proto-notif-gatilho', 'Gatilho', 'textOptions', null, {
        required: true,
        relevance: 'highlight',
        options: GATILHOS,
        spec: 'Evento/método que dispara a notificação (filtra pela entidade em produção).',
      }),
      f('patlasv4proto-notif-antecedencia', 'Antecedência (dias)', 'text', null, {
        size: 'small',
        spec: 'Só para gatilhos por data. Ex.: 30,15,5 e 0 (no dia). Verificação diária no backend.',
      }),
      f('patlasv4proto-notif-tipo-envio', 'Tipo de envio', 'textOptions', null, {
        required: true,
        multiple: true,
        options: ['Interna', 'E-mail', 'Painel'],
        spec: 'Canais simultâneos. Interna/Painel = central de notificações; E-mail = envio externo.',
      }),
      f('patlasv4proto-notif-titulo', 'Título', 'text', null, {
        required: true,
        size: 'large',
        spec: 'Assunto da notificação. Aceita variáveis, ex.: {{documento.tipo}}.',
      }),
      f('patlasv4proto-notif-corpo', 'Corpo', 'text', null, {
        required: true,
        textLong: true,
        size: 'large',
        spec: 'Mensagem. Aceita variáveis do registro de origem.',
      }),
      f('patlasv4proto-notif-anexo', 'Anexo', 'file', null, {
        spec: 'Arquivo opcional anexado ao e-mail.',
      }),
      f('patlasv4proto-notif-destinatarios', 'Destinatários', 'embeddedReference', null, {
        required: true,
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_DEST,
        spec: 'Um ou mais destinatários em cascata (Organização / Pessoa / Cargo) até o e-mail.',
      }),
    ],
    methods: [],
    exampleValuePresets: buildPresets(),
    activeExamplePresetId: 'patlasv4proto-p-notif-doc-vencendo',
  }
}

function buildPresets() {
  return [
    {
      id: 'patlasv4proto-p-notif-doc-vencendo',
      name: 'Documento vencendo — parceiro',
      iconColor: '#b45309',
      fieldValues: {
        'patlasv4proto-notif-nome': 'Documento vencendo — parceiro',
        'patlasv4proto-notif-ativo': true,
        'patlasv4proto-notif-entidade': 'Documento (cadastro)',
        'patlasv4proto-notif-gatilho': 'Documento da organização vencendo',
        'patlasv4proto-notif-antecedencia': '30,15,5,0',
        'patlasv4proto-notif-tipo-envio': 'Interna / E-mail / Painel',
        'patlasv4proto-notif-titulo': 'Documento {{documento.tipo}} vence em {{dias}} dias',
        'patlasv4proto-notif-corpo':
          'O documento {{documento.tipo}} da organização {{organizacao.nome}} vence em {{documento.vencimento}}. Providencie a atualização.',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-notif-destinatarios': [
          {
            [D_TIPO]: 'Organização',
            [D_PERFIL]: 'Parceiro',
            [D_ORG]: 'EloGroup',
            [D_UNID]: 'EloGroup',
            [D_EMAIL_RESP]: 'responsavel@elogroup.com.br',
            [D_EMAIL]: 'responsavel@elogroup.com.br',
          },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-notif-convite-aprovado',
      name: 'Convite aprovado — pessoa',
      iconColor: '#059669',
      fieldValues: {
        'patlasv4proto-notif-nome': 'Convite aprovado — boas-vindas',
        'patlasv4proto-notif-ativo': true,
        'patlasv4proto-notif-entidade': 'Convite',
        'patlasv4proto-notif-gatilho': 'Ao aprovar convite',
        'patlasv4proto-notif-tipo-envio': 'E-mail',
        'patlasv4proto-notif-titulo': 'Seu acesso ao Atlas foi liberado',
        'patlasv4proto-notif-corpo':
          'Olá {{pessoa.nome}}, seu vínculo com {{organizacao.nome}} foi aprovado. Acesse o Atlas para concluir o cadastro.',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-notif-destinatarios': [
          {
            [D_TIPO]: 'Pessoa',
            [D_PERFIL]: 'Parceiro',
            [D_PESSOA]: 'Lucas Santos',
            [D_EMAIL]: 'lucas.santos@elogroup.com.br',
          },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-notif-enviado-assinatura',
      name: 'Enviado para assinatura — cargo',
      iconColor: '#0c4a6e',
      fieldValues: {
        'patlasv4proto-notif-nome': 'Documento enviado para assinatura',
        'patlasv4proto-notif-ativo': true,
        'patlasv4proto-notif-entidade': 'Assinatura',
        'patlasv4proto-notif-gatilho': 'Ao enviar para assinatura',
        'patlasv4proto-notif-tipo-envio': 'Interna / E-mail / Painel',
        'patlasv4proto-notif-titulo': 'Você tem um documento para assinar',
        'patlasv4proto-notif-corpo':
          'O documento {{processo.numero}} aguarda sua assinatura no painel de assinaturas pendentes.',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-notif-destinatarios': [
          {
            [D_TIPO]: 'Cargo',
            [D_ORG]: 'Empresa Mato-grossense de Tecnologia da Informação',
            [D_UNID]: 'MTI/UGP',
            [D_CARGO]: 'Gerente de Projetos',
            [D_PERFIL]: 'MTI',
            [D_COND]: 'Titular',
            [D_REGIAO]: 'Todos',
            [D_EMAIL]: 'gerente.ugp@mti.mt.gov.br',
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

function addAntecedenciaToTipoDocumento(forms) {
  const tdoc = forms.find((x) => x.id === FORM_TDOC)
  if (!tdoc) return
  const fid = 'patlasv4proto-tdoc-dias-antecedencia-alerta'
  if (tdoc.fields.some((x) => x.id === fid)) return
  const idx = tdoc.fields.findIndex((x) => x.id === 'patlasv4proto-tdoc-modo-vencimento-padrao')
  const field = f(fid, 'Dias de antecedência do alerta', 'text', null, {
    size: 'small',
    spec: 'Quantos dias antes do vencimento notificar. Ex.: 30,15,5 e 0 (no dia). Verificação diária no backend.',
  })
  if (idx >= 0) tdoc.fields.splice(idx + 1, 0, field)
  else tdoc.fields.push(field)
}

function patchGroups(cg) {
  for (const g of cg.groups) {
    if (g.id === 'grp-07-backlog') g.name = '09 · Backlog'
    if (g.id === 'grp-08-servidor') g.name = '10 · Servidor (backend)'
  }
  const ensure = (def) => {
    if (!cg.groups.some((g) => g.id === def.id)) cg.groups.push(def)
  }
  ensure({ id: GRP_MAIN, name: '08 · Notificações' })
  ensure({ id: GRP_EMB, name: 'Embutidas', parentGroupId: GRP_MAIN })
  cg.assignments[FORM_MAIN] = GRP_MAIN
  cg.assignments[FORM_DEST] = GRP_EMB
  cg.memberOrderByGroup[GRP_MAIN] = [FORM_MAIN]
  cg.memberOrderByGroup[GRP_EMB] = [FORM_DEST]

  // reordena: 08 Notificações antes do 09 Backlog
  const ids = ['grp-08-notificacoes', 'grp-08-notificacoes-emb']
  const block = cg.groups.filter((g) => ids.includes(g.id))
  const rest = cg.groups.filter((g) => !ids.includes(g.id))
  const at = rest.findIndex((g) => g.id === 'grp-07-backlog')
  rest.splice(at, 0, ...block)
  cg.groups = rest
  return cg
}

function patchWorkspace(ws) {
  const w = ws[0]
  const pkgId = 'pkg-mapa-6-notificacoes'
  let pkg = w.packages.find((p) => p.id === pkgId)
  if (!pkg) {
    pkg = { id: pkgId, name: '6 · Notificações (20)', classes: [] }
    w.packages.push(pkg)
  }
  if (!pkg.classes.some((c) => c.id === 'cls-mapa-notificacao')) {
    pkg.classes.push({
      id: 'cls-mapa-notificacao',
      name: '(20) Notificação',
      linkedFormId: FORM_MAIN,
      linkedFormExamplePresetIds: [
        'patlasv4proto-p-notif-doc-vencendo',
        'patlasv4proto-p-notif-convite-aprovado',
        'patlasv4proto-p-notif-enviado-assinatura',
      ],
    })
  }
  return ws
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  upsertForm(forms, buildDestinatarioForm())
  upsertForm(forms, buildMainForm())
  addAntecedenciaToTipoDocumento(forms)
  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  const cg = patchGroups(JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8')))
  fs.writeFileSync(GROUPS_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

  const ws = patchWorkspace(JSON.parse(fs.readFileSync(WS_PATH, 'utf8')))
  fs.writeFileSync(WS_PATH, `${JSON.stringify(ws, null, 2)}\n`, 'utf8')

  console.log('OK: Notificacao + Destinatario (cascata) criados; antecedencia no Tipo Documento.')
}

main()
