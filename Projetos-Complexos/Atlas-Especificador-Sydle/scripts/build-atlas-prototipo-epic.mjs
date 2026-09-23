#!/usr/bin/env node
/**
 * Cria épico atlas-prototipo (corrigido v2) a partir de atlas-v4-prototipo.
 * Mantém atlas-v4-prototipo intacto e grava cópia em atlas-v4-prototipo-backup.
 * Uso: node scripts/build-atlas-prototipo-epic.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPICS_ROOT = path.join(__dirname, '../data/subprojects/atlas-v4/epics')
const SOURCE_EPIC = path.join(EPICS_ROOT, 'atlas-v4-prototipo')
const BACKUP_EPIC = path.join(EPICS_ROOT, 'atlas-v4-prototipo-backup')
const TARGET_EPIC = path.join(EPICS_ROOT, 'atlas-prototipo')

const FORM_ORG_OLD = 'form-patlasv4-proto-organizacao'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_NIVEL = 'form-patlasv4-proto-nivel-organizacional'
const FORM_CONFIG = 'form-patlasv4-proto-config-processo'
const FORM_WF = 'mqebasqyphbwea'
const FORM_WF_ETAPA = 'form-patlasv4-proto-workflow-etapa'
const FORM_CARGO = 'form-patlasv4-proto-cargo'
const FORM_CARGO_OCUP = 'form-patlasv4-proto-cargo-ocupante'
const FORM_CARGO_PERM = 'form-patlasv4-proto-cargo-permissao-processo'
const FORM_VERSAO_PROC = 'form-patlasv4-proto-versao-processo'
const FORM_SRV_PERM = 'form-patlasv4-proto-servidor-permissao'

const REMOVE_FORM_IDS = new Set(['mqepsb34w8ickk', 'mqb42v0racoi6h', FORM_ORG_OLD])

const ORG_REF_MAP = {
  MTI: 'Empresa Mato-grossense de Tecnologia da Informação',
  EloGroup: 'EloGroup',
  SEPLAG: 'Secretaria de Estado de Planejamento e Gestão',
}

const REGIAO_OPTS = [
  'Todos', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const TIPOS_PROCESSO = [
  'Proposta', 'Contrato', 'Ordem de Serviço (OS)', 'Termo de Homologação', 'RAER',
]

const METODOS_ACOES = [
  'Criar proposta', 'Editar proposta', 'Gerar documento', 'Enviar para assinatura',
  'Aprovar', 'Recusar', 'Homologar', 'Emitir OS', 'Cadastrar contrato',
]

const ATRIBUICOES_SYDLE = [
  'Administrador', 'Operador', 'Consulta', 'Gestor de processo', 'Assinante',
]

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function copyEpicFiles(src, dest, { skipForms = false } = {}) {
  ensureDir(dest)
  for (const name of fs.readdirSync(src)) {
    if (name === 'forms.json' && skipForms) continue
    const from = path.join(src, name)
    const to = path.join(dest, name)
    const stat = fs.statSync(from)
    if (stat.isDirectory()) {
      copyEpicFiles(from, to, { skipForms })
    } else {
      ensureDir(path.dirname(to))
      fs.copyFileSync(from, to)
    }
  }
}

function main() {
  if (!fs.existsSync(SOURCE_EPIC)) {
    console.error('Épico fonte não encontrado:', SOURCE_EPIC)
    process.exit(1)
  }

  console.log('→ Backup: atlas-v4-prototipo → atlas-v4-prototipo-backup')
  if (fs.existsSync(BACKUP_EPIC)) {
    fs.rmSync(BACKUP_EPIC, { recursive: true, force: true })
  }
  copyEpicFiles(SOURCE_EPIC, BACKUP_EPIC)
  patchBackupEpicMeta(BACKUP_EPIC)

  console.log('→ Criando atlas-prototipo')
  if (fs.existsSync(TARGET_EPIC)) {
    fs.rmSync(TARGET_EPIC, { recursive: true, force: true })
  }
  copyEpicFiles(SOURCE_EPIC, TARGET_EPIC, { skipForms: true })

  const formsPath = path.join(TARGET_EPIC, 'forms.json')
  const wsPath = path.join(TARGET_EPIC, 'workspaces.json')
  const cgPath = path.join(TARGET_EPIC, 'class-groups.json')

  const forms = patchForms(readJson(path.join(SOURCE_EPIC, 'forms.json')))
  writeJson(formsPath, forms)

  const workspaces = patchWorkspaces(readJson(path.join(SOURCE_EPIC, 'workspaces.json')))
  writeJson(wsPath, workspaces)

  const cg = patchClassGroups(readJson(path.join(SOURCE_EPIC, 'class-groups.json')))
  writeJson(cgPath, cg)

  patchEpicMeta(TARGET_EPIC)

  const docSrc = path.join(
    process.env.USERPROFILE ?? '',
    'Downloads/Atlas_V4_Classes_Cadastro_Processo_Workflow_CORRIGIDO_v2.md',
  )
  const docDest = path.join(TARGET_EPIC, 'source/Atlas_Classes_CORRIGIDO_v2.md')
  if (fs.existsSync(docSrc)) {
    ensureDir(path.dirname(docDest))
    fs.copyFileSync(docSrc, docDest)
  }

  console.log('✓ Épico atlas-prototipo criado')
  console.log('✓ Backup em atlas-v4-prototipo-backup')
  console.log('✓ atlas-v4-prototipo original preservado')
  console.log(`  Forms: ${forms.length}`)
}

function formById(forms, id) {
  return forms.find((f) => f.id === id)
}

function setField(form, fieldId, patch) {
  const f = form.fields?.find((x) => x.id === fieldId)
  if (f) Object.assign(f, patch)
}

function removeFields(form, ids) {
  form.fields = (form.fields ?? []).filter((f) => !ids.includes(f.id))
}

function remapDeep(obj, fn) {
  if (typeof obj === 'string') return fn(obj) ?? obj
  if (Array.isArray(obj)) return obj.map((v) => remapDeep(v, fn))
  if (obj && typeof obj === 'object') {
    const next = {}
    for (const [k, v] of Object.entries(obj)) next[k] = remapDeep(v, fn)
    return next
  }
  return obj
}

function remapOrgRefsInData(data) {
  return remapDeep(data, (s) => ORG_REF_MAP[s] ?? s)
}

function migrateFieldIdsInPresets(form, map) {
  if (!form.exampleValuePresets) return
  for (const p of form.exampleValuePresets) {
    if (p.fieldValues) {
      const next = {}
      for (const [k, v] of Object.entries(p.fieldValues)) {
        const nk = map[k] ?? k
        let nv = v
        if (k === 'patlasv4proto-uo-nivel' && typeof v === 'string' && /^\d+$/.test(v)) {
          nv = Number(v)
        }
        if (k.includes('organizacao') || k.includes('cliente')) {
          nv = remapOrgRefsInData(nv)
        }
        next[nk] = nv
      }
      p.fieldValues = next
    }
    if (p.embeddedRowsByFieldId) {
      const emb = {}
      for (const [k, v] of Object.entries(p.embeddedRowsByFieldId)) {
        emb[map[k] ?? k] = remapOrgRefsInData(v)
      }
      p.embeddedRowsByFieldId = emb
    }
  }
}

function patchNivel(form) {
  const f = form.fields.find((x) => x.id === 'patlasv4proto-nivel-organizacional-dados-do-nivel-ativo-inativo')
  if (f) {
    f.id = 'patlasv4proto-nivel-organizacional-dados-do-nivel-ativo'
    f.label = 'Ativo'
    f.required = true
  }
  form.metadata =
    'Protótipo Atlas — Nível Organizacional. Classifica a posição hierárquica da Unidade Organizacional. Não define a hierarquia.'
  migrateFieldIdsInPresets(form, {
    'patlasv4proto-nivel-organizacional-dados-do-nivel-ativo-inativo':
      'patlasv4proto-nivel-organizacional-dados-do-nivel-ativo',
  })
}

function patchUO(form) {
  form.metadata =
    'Protótipo Atlas — Unidade Organizacional. Cadastro único da estrutura hierárquica. Unidades raiz com Representa Organização? = Sim representam MTI, Parceiro ou Cliente. Abas: Dados da Unidade, Documentos, Dados de contato, Localização.'

  setField(form, 'patlasv4proto-uo-sigla', { required: true })
  setField(form, 'patlasv4proto-uo-nivel-organizacional', {
    type: 'reference',
    linkedFormId: FORM_NIVEL,
    options: undefined,
    spec: 'Referência ao cadastro de Nível Organizacional.',
  })
  setField(form, 'patlasv4proto-uo-nivel', {
    type: 'number',
    readOnly: true,
    options: undefined,
    spec: 'Calculado automaticamente pela profundidade hierárquica (raiz = 0).',
  })
  setField(form, 'patlasv4proto-uo-representa-organizacao', { required: true })
  setField(form, 'patlasv4proto-uo-produto-parceria', {
    linkedFormId: undefined,
    spec: 'Campo reservado — sem referência ativa na Fase 1.',
  })

  const ativo = form.fields.find((f) => f.id === 'mqfdo9xlp27377')
  if (ativo) {
    ativo.id = 'patlasv4proto-uo-ativo'
    ativo.label = 'Ativo'
    ativo.required = true
    ativo.sectionId = 'sec-patlasv4proto-uo-dados'
  }

  const obs = form.fields.find((f) => f.id === 'patlasv4proto-uo-observacoes-organizacao')
  if (obs) {
    obs.hidden = false
    obs.sectionId = 'sec-patlasv4proto-uo-dados'
  }

  form.fieldVisibilityRules = (form.fieldVisibilityRules ?? []).filter(
    (r) => r.sourceFieldId !== 'patlasv4proto-uo-nivel',
  )

  migrateFieldIdsInPresets(form, { mqfdo9xlp27377: 'patlasv4proto-uo-ativo' })
  for (const p of form.exampleValuePresets ?? []) {
    if (p.fieldValues?.['patlasv4proto-uo-nivel'] != null) {
      const n = p.fieldValues['patlasv4proto-uo-nivel']
      p.fieldValues['patlasv4proto-uo-nivel'] = typeof n === 'string' ? Number(n) : n
    }
  }
}

function patchCargo(form) {
  form.metadata =
    'Protótipo Atlas — Cargo. Papel funcional vinculado a uma Organização raiz (UO qualificada). Define permissões de processo e é usado em Workflows de Assinatura.'

  removeFields(form, [
    'mqb2gfulxkiehk',
    'mqe60gq36fa67w',
    'patlasv4proto-cargo-dados-do-cargo-papel-na-assinatura',
    'patlasv4proto-cargo-dados-do-cargo-atribuicao-tecnica',
    'mqb2h35gjritbq',
    'patlasv4proto-cargo-dados-do-cargo-funcao',
    'mqb40qby8vuc7q',
  ])

  const org = form.fields.find((f) => f.id === 'patlasv4proto-cargo-dados-do-cargo-organizacao')
  if (org) {
    org.required = true
    org.hidden = false
    org.linkedFormId = FORM_UO
    org.sectionId = 'sec-cargo-dados-do-cargo'
    org.spec =
      'Unidade Organizacional com Representa Organização? = Sim (MTI, Parceiro ou Cliente).'
    org.options = [
      'Empresa Mato-grossense de Tecnologia da Informação',
      'EloGroup',
      'Secretaria de Estado de Planejamento e Gestão',
    ]
  }

  setField(form, 'patlasv4proto-cargo-dados-do-cargo-sigla-abreviatura', { required: true })

  const perm = form.fields.find((f) => f.id === 'patlasv4proto-cargo-permissoes-de-visualizacao-lista')
  if (perm) {
    perm.linkedFormId = FORM_CARGO_PERM
    perm.multiple = true
    perm.embeddedDisplay = 'table'
    perm.embeddedRoot = false
    perm.spec = 'Lista dinâmica de permissões por Tipo de Processo e Métodos/Ações.'
  }

  for (const p of form.exampleValuePresets ?? []) {
    if (p.fieldValues) {
      p.fieldValues = remapPresetFieldValues(p.fieldValues)
      delete p.fieldValues['patlasv4proto-cargo-dados-do-cargo-papel-na-assinatura']
      delete p.fieldValues['patlasv4proto-cargo-dados-do-cargo-atribuicao-tecnica']
      delete p.fieldValues['patlasv4proto-cargo-dados-do-cargo-funcao']
    }
  }
}

function patchCargoOcupante(form) {
  const srv = form.fields.find((f) => f.id === 'patlasv4proto-cargo-ocupantes-pessoa-servidor')
  if (srv) {
    srv.id = 'patlasv4proto-cargo-ocupantes-servidor'
    srv.linkedFormId = 'form-patlasv4-proto-servidor'
    srv.spec = 'Lista apenas Servidores ativos e não desligados (RN-CARGO-03).'
  }
  setField(form, 'patlasv4proto-cargo-ocupantes-unidade-de-atuacao', { required: true })

  const reg = form.fields.find((f) => f.id === 'mqb3fkiq1eaj2i')
  if (reg) {
    reg.id = 'patlasv4proto-cargo-ocupantes-regiao-atuacao'
    reg.type = 'textOptions'
    reg.multiple = true
    reg.options = REGIAO_OPTS
    reg.label = 'Região de atuação'
  }

  removeFields(form, ['mqb3dw2s9e8kmy'])
}

function patchConfigProcesso(form) {
  form.metadata =
    'Protótipo Atlas — Configurações do Processo. Controla a vigência das configurações de tipos de processo e métodos/ações disponíveis no Atlas.'

  removeFields(form, [
    'patlasv4proto-configuracoes-do-processo-tipos-de-processo-nome',
    'patlasv4proto-configuracoes-do-processo-tipos-de-processo-ativo',
  ])

  const desc = form.fields.find(
    (f) => f.id === 'patlasv4proto-configuracoes-do-processo-tipos-de-processo-descricao',
  )
  if (desc) {
    desc.id = 'patlasv4proto-configuracoes-do-processo-versoes-descricao'
    desc.sectionId = 'sec-configuracoes-do-processo-versoes'
  }

  form.fields.push({
    id: 'patlasv4proto-configuracoes-do-processo-tipos-de-processo-lista',
    label: 'Processos da Versão',
    type: 'embeddedReference',
    size: 'large',
    readOnly: false,
    required: false,
    multiple: true,
    relevance: 'common',
    sectionId: 'sec-configuracoes-do-processo-tipos-de-processo',
    linkedFormId: FORM_VERSAO_PROC,
    embeddedDisplay: 'table',
    spec: 'Lista dinâmica de tipos de processo e métodos/ações habilitados na versão (RN-VERS-06).',
  })

  for (const p of form.exampleValuePresets ?? []) {
    if (!p.fieldValues) continue
    const descVal = p.fieldValues['patlasv4proto-configuracoes-do-processo-tipos-de-processo-descricao']
    delete p.fieldValues['patlasv4proto-configuracoes-do-processo-tipos-de-processo-nome']
    delete p.fieldValues['patlasv4proto-configuracoes-do-processo-tipos-de-processo-ativo']
    delete p.fieldValues['patlasv4proto-configuracoes-do-processo-tipos-de-processo-descricao']
    if (descVal) p.fieldValues['patlasv4proto-configuracoes-do-processo-versoes-descricao'] = descVal
  }
}

function patchWorkflow(form) {
  form.metadata =
    'Protótipo Atlas — Workflow de Assinatura. Define a cadeia de etapas vinculada a uma Versão de Processo e a um Tipo de Processo. Execução técnica via Envelope GED.'

  setField(form, 'mqedr9ct0hhc4j', {
    required: true,
    options: TIPOS_PROCESSO,
    label: 'Tipo Processo',
  })

  setField(form, 'mqebbnn93hgiee', {
    type: 'reference',
    linkedFormId: FORM_CONFIG,
    readOnly: false,
    label: 'Versão',
    spec: 'Referência à versão vigente de configuração do processo.',
    options: ['Versão 1 — MTI', 'Versão 1 — Parceiros', 'Versão 1 — Clientes'],
  })
}

function patchWorkflowEtapa(form) {
  setField(form, 'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-organizacao', {
    linkedFormId: FORM_UO,
    spec: 'Unidade Organizacional com Representa Organização? = Sim.',
    options: [
      'Empresa Mato-grossense de Tecnologia da Informação',
      'EloGroup',
      'Secretaria de Estado de Planejamento e Gestão',
    ],
  })

  const papel = form.fields.find((f) => f.id === 'mqemyo2k0d2q25')
  if (papel) {
    papel.id = 'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-papel-envelope'
    papel.type = 'textOptions'
    papel.label = 'Papel no envelope'
    papel.linkedFormId = undefined
    papel.options = ['Aprovador', 'Assinante', 'Testemunha']
    papel.spec = 'Papel do signatário no envelope GED.'
  }

  setField(form, 'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-acao', {
    type: 'textOptions',
    label: 'Parecer',
    linkedFormId: undefined,
    options: ['Aprovar', 'Recusar/Rejeitar'],
    spec: 'Recusa exige justificativa e retorno ao início do fluxo (RN-WF-09).',
  })

  setField(form, 'patlasv4proto-configuracoes-do-processo-etapas-do-workflow-cargo', {
    spec: 'Listar apenas Cargos ativos com Pode assinar = Sim (RN-WF-ET-03).',
  })

  removeFields(form, ['mqekw7b2nxf1v1'])
}

function patchServidorPermissao(form) {
  setField(form, 'patlasv4proto-sperm-atribuicoes', {
    type: 'textOptions',
    linkedFormId: undefined,
    multiple: true,
    options: ATRIBUICOES_SYDLE,
    spec: 'Atribuições técnicas do SYDLE ONE — não referenciam Cargo funcional (RN-SERV-05/06).',
  })
}

function newCargoPermissaoProcessoForm() {
  return {
    id: FORM_CARGO_PERM,
    name: 'Cargo — Permissão de Processo',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Linha de permissão do Cargo. Tipo de Processo e Métodos/Ações são listas técnicas do backend (RN-CARGO-09).',
    fields: [
      {
        id: 'patlasv4proto-cargo-perm-tipo-processo',
        label: 'Tipo de Processo',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'identity',
        options: TIPOS_PROCESSO,
        spec: 'Lista técnica carregada do backend.',
      },
      {
        id: 'patlasv4proto-cargo-perm-metodos-acoes',
        label: 'Métodos/Ações',
        type: 'textOptions',
        size: 'large',
        readOnly: false,
        required: true,
        multiple: true,
        relevance: 'common',
        options: METODOS_ACOES,
        spec: 'Lista filtrada pelo Tipo de Processo selecionado.',
      },
    ],
  }
}

function newVersaoProcessoForm() {
  return {
    id: FORM_VERSAO_PROC,
    name: 'Versão — Processo',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Linha da aba Processos da Versão. Métodos/Ações carregados do backend conforme o Tipo (RN-VERS-06).',
    fields: [
      {
        id: 'patlasv4proto-versao-proc-tipo-processo',
        label: 'Tipo de Processo',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'identity',
        options: TIPOS_PROCESSO,
        spec: 'Lista técnica carregada do backend.',
      },
      {
        id: 'patlasv4proto-versao-proc-metodos-acoes',
        label: 'Métodos/Ações',
        type: 'textOptions',
        size: 'large',
        readOnly: false,
        required: true,
        multiple: true,
        relevance: 'common',
        options: METODOS_ACOES,
        spec: 'Lista filtrada pelo Tipo de Processo selecionado.',
      },
    ],
  }
}

function remapPresetFieldValues(fieldValues) {
  if (!fieldValues) return fieldValues
  const next = {}
  for (const [k, v] of Object.entries(fieldValues)) {
    next[k] =
      k.includes('organizacao') || k.includes('cliente-solicitante') || k.includes('cliente')
        ? remapOrgRefsInData(v)
        : v
  }
  return next
}

function remapOrganizacaoReferences(forms) {
  for (const form of forms) {
    for (const field of form.fields ?? []) {
      if (field.linkedFormId === FORM_ORG_OLD) {
        field.linkedFormId = FORM_UO
        if (field.spec && !field.spec.includes('Representa Organização')) {
          field.spec = `${field.spec} Filtro: Representa Organização? = Sim.`
        }
      }
    }
    if (form.exampleValuePresets) {
      form.exampleValuePresets = form.exampleValuePresets.map((p) => ({
        ...p,
        fieldValues: remapPresetFieldValues(p.fieldValues),
        embeddedRowsByFieldId: p.embeddedRowsByFieldId
          ? remapOrgRefsInData(p.embeddedRowsByFieldId)
          : p.embeddedRowsByFieldId,
      }))
    }
  }
}

function patchForms(forms) {
  forms = forms.filter((f) => !REMOVE_FORM_IDS.has(f.id))

  const insertForms = [newCargoPermissaoProcessoForm(), newVersaoProcessoForm()]
  const wfIdx = forms.findIndex((f) => f.id === FORM_WF_ETAPA)
  if (wfIdx >= 0) forms.splice(wfIdx, 0, ...insertForms)
  else forms.push(...insertForms)

  const nivel = formById(forms, FORM_NIVEL)
  const uo = formById(forms, FORM_UO)
  const cargo = formById(forms, FORM_CARGO)
  const ocup = formById(forms, FORM_CARGO_OCUP)
  const config = formById(forms, FORM_CONFIG)
  const wf = formById(forms, FORM_WF)
  const etapa = formById(forms, FORM_WF_ETAPA)
  const sperm = formById(forms, FORM_SRV_PERM)

  if (nivel) patchNivel(nivel)
  if (uo) patchUO(uo)
  if (cargo) patchCargo(cargo)
  if (ocup) patchCargoOcupante(ocup)
  if (config) patchConfigProcesso(config)
  if (wf) patchWorkflow(wf)
  if (etapa) patchWorkflowEtapa(etapa)
  if (sperm) patchServidorPermissao(sperm)

  remapOrganizacaoReferences(forms)
  return forms
}

function patchWorkspaces(workspaces) {
  for (const ws of workspaces) {
    ws.id = 'ws-atlas-prototipo'
    ws.name = 'Atlas Protótipo Atual'
    for (const pkg of ws.packages ?? []) {
      if (pkg.id === 'pkg-patlasv4-proto-cadastro') {
        pkg.classes = (pkg.classes ?? []).filter((c) => c.id !== 'cls-patlasv4-proto-org')
      }
    }
  }
  return workspaces
}

function patchClassGroups(cg) {
  delete cg.assignments[FORM_ORG_OLD]
  delete cg.assignments['mqepsb34w8ickk']
  delete cg.assignments['mqb42v0racoi6h']

  cg.assignments[FORM_CARGO_PERM] = 'grp-patlasv4-proto-embutido'
  cg.assignments[FORM_VERSAO_PROC] = 'grp-patlasv4-proto-embutido'

  for (const key of Object.keys(cg.assignments)) {
    if (cg.assignments[key] === FORM_ORG_OLD) delete cg.assignments[key]
  }

  const emb = cg.memberOrderByGroup['grp-patlasv4-proto-embutido'] ?? []
  cg.memberOrderByGroup['grp-patlasv4-proto-embutido'] = emb
    .filter((id) => !REMOVE_FORM_IDS.has(id))
    .concat([FORM_CARGO_PERM, FORM_VERSAO_PROC])

  const cad = cg.memberOrderByGroup['grp-patlasv4-proto-cadastro'] ?? []
  cg.memberOrderByGroup['grp-patlasv4-proto-cadastro'] = cad.filter(
    (id) => id !== FORM_ORG_OLD,
  )

  if (cg.memberOrderByGroup.__sem_grupo__) {
    cg.memberOrderByGroup.__sem_grupo__ = cg.memberOrderByGroup.__sem_grupo__.filter(
      (id) => !REMOVE_FORM_IDS.has(id),
    )
  }

  return cg
}

function patchEpicMeta(epicDir) {
  writeJson(path.join(epicDir, 'epic.json'), { name: 'Atlas Protótipo Atual' })
  const ctxPath = path.join(epicDir, 'context.md')
  if (fs.existsSync(ctxPath)) {
    let ctx = fs.readFileSync(ctxPath, 'utf8')
    ctx = ctx.replace(/atlas-v4-prototipo/g, 'atlas-prototipo')
    ctx = ctx.replace(/Atlas V4 — Protótipo/g, 'Atlas Protótipo Atual')
    fs.writeFileSync(ctxPath, ctx, 'utf8')
  }
}

function patchBackupEpicMeta(epicDir) {
  writeJson(path.join(epicDir, 'epic.json'), { name: 'Atlas V4 — Protótipo (backup)' })
  const wsPath = path.join(epicDir, 'workspaces.json')
  if (fs.existsSync(wsPath)) {
    const ws = readJson(wsPath)
    for (const w of ws) {
      if (w.name === 'Atlas V4 — Protótipo') w.name = 'Atlas V4 — Protótipo (backup)'
    }
    writeJson(wsPath, ws)
  }
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function writeJson(p, data) {
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

main()
