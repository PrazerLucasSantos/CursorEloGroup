#!/usr/bin/env node
/**
 * Pessoa — login/senha (ativo para acesso), método Criar servidor.
 * Remove essas configurações do formulário Servidor (pertencem à classe Pessoa).
 * Uso: node scripts/patch-atlas-prototipo-pessoa-criar-servidor.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)
const WS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/workspaces.json',
)

const FORM_PESSOA = 'form-patlasv4-proto-pessoa'
const FORM_SERVIDOR = 'form-patlasv4-proto-servidor'
const FORM_METODO = 'form-patlasv4-proto-metodo-criar-servidor'
const SEC_CRED = 'sec-patlasv4proto-pes-credenciais'
const SEC_AVANC = 'sec-patlasv4proto-srv-avancado'

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
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
  }
}

function patchPessoa(pessoa) {
  const fields = [...(pessoa.fields ?? [])]
  const byId = new Map(fields.map((x) => [x.id, x]))

  byId.set(
    'patlasv4proto-pes-login',
    f('patlasv4proto-pes-login', 'Login', 'text', SEC_CRED, {
      size: 'large',
      hidden: true,
      spec: 'Exibido quando Ativo para acesso = Sim.',
    }),
  )
  byId.set(
    'patlasv4proto-pes-senha',
    f('patlasv4proto-pes-senha', 'Senha', 'text', SEC_CRED, {
      readOnly: true,
      hidden: true,
      spec: 'Armazenamento criptografado. Exibida quando Ativo para acesso = Sim.',
    }),
  )

  const ativoIdx = fields.findIndex((x) => x.id === 'patlasv4proto-pes-ativo-acesso')
  const ordered = fields.filter(
    (x) => x.id !== 'patlasv4proto-pes-login' && x.id !== 'patlasv4proto-pes-senha',
  )
  const login = byId.get('patlasv4proto-pes-login')
  const senha = byId.get('patlasv4proto-pes-senha')
  if (ativoIdx >= 0) {
    ordered.splice(ativoIdx + 1, 0, login, senha)
  } else {
    ordered.push(login, senha)
  }

  const rules = (pessoa.fieldVisibilityRules ?? []).filter(
    (r) => r.id !== 'rule-pes-show-login-senha',
  )
  rules.push({
    id: 'rule-pes-show-login-senha',
    operator: 'eq',
    sourceFieldId: 'patlasv4proto-pes-ativo-acesso',
    sourceKind: 'boolean',
    expectedBoolean: true,
    action: 'show',
    targetFieldIds: ['patlasv4proto-pes-login', 'patlasv4proto-pes-senha'],
  })

  const methods = (pessoa.methods ?? []).filter(
    (m) => m.id !== 'patlasv4proto-pes-meth-criar-servidor' && m.id !== 'mqb1njq08yddoq',
  )
  methods.push({
    id: 'patlasv4proto-pes-meth-criar-servidor',
    name: 'Criar servidor',
    icon: 'person_add',
    kind: 'destaque',
    inputFormId: FORM_METODO,
  })

  const presets = (pessoa.exampleValuePresets ?? []).map((preset) => {
    const fv = { ...(preset.fieldValues ?? {}) }
    if (preset.id === 'patlasv4proto-p-pessoa-lucas' && fv['patlasv4proto-pes-ativo-acesso']) {
      fv['patlasv4proto-pes-login'] = fv['patlasv4proto-pes-login'] ?? 'lucas.santos'
      fv['patlasv4proto-pes-senha'] = fv['patlasv4proto-pes-senha'] ?? 'criptografado'
    }
    return { ...preset, fieldValues: fv }
  })

  return {
    ...pessoa,
    defaultCanvasMode: 'read',
    metadata:
      'Protótipo Atlas — Pessoas. Abas Geral, Dados de contato, Complementares e Currículo. Método Criar servidor.',
    fields: ordered,
    fieldVisibilityRules: rules,
    methods,
    exampleValuePresets: presets,
    activeExamplePresetId: pessoa.activeExamplePresetId ?? 'patlasv4proto-p-pessoa-bernardo',
  }
}

function patchServidor(servidor) {
  const fields = (servidor.fields ?? []).map((field) => {
    if (field.id === 'patlasv4proto-srv-login') {
      const { hidden, spec, ...rest } = field
      return { ...rest, required: true }
    }
    if (field.id === 'patlasv4proto-srv-senha') {
      const { hidden, ...rest } = field
      return {
        ...rest,
        sectionId: SEC_AVANC,
        readOnly: true,
        spec: 'Armazenamento criptografado.',
      }
    }
    return field
  })

  const { fieldVisibilityRules, methods, ...rest } = servidor
  return {
    ...rest,
    defaultCanvasMode: 'edit',
    fields,
  }
}

function patchWorkspace(workspaces) {
  for (const ws of workspaces) {
    for (const pkg of ws.packages ?? []) {
      for (const cls of pkg.classes ?? []) {
        if (cls.id === 'cls-patlasv4-proto-pes') {
          const ids = new Set(cls.linkedFormExamplePresetIds ?? [])
          ids.add('patlasv4proto-p-pessoa-bernardo')
          ids.add('patlasv4proto-p-pessoa-lucas')
          cls.linkedFormExamplePresetIds = [
            'patlasv4proto-p-pessoa-bernardo',
            'patlasv4proto-p-pessoa-lucas',
            ...[...ids].filter(
              (id) => id !== 'patlasv4proto-p-pessoa-bernardo' && id !== 'patlasv4proto-p-pessoa-lucas',
            ),
          ]
        }
      }
    }
  }
  return workspaces
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const pIdx = forms.findIndex((x) => x.id === FORM_PESSOA)
  const sIdx = forms.findIndex((x) => x.id === FORM_SERVIDOR)
  if (pIdx < 0) throw new Error('Pessoa não encontrada')
  if (sIdx < 0) throw new Error('Servidor não encontrado')

  forms[pIdx] = patchPessoa(forms[pIdx])
  forms[sIdx] = patchServidor(forms[sIdx])

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  fs.writeFileSync(
    WS_PATH,
    `${JSON.stringify(patchWorkspace(JSON.parse(fs.readFileSync(WS_PATH, 'utf8'))), null, 2)}\n`,
    'utf8',
  )

  console.log('✓ Pessoa — login/senha na aba Credenciais (ativo para acesso = Sim)')
  console.log('✓ Pessoa — método Criar servidor com formulário de parâmetros')
  console.log('✓ Servidor — removidos método e regra de login/senha (escopo da Pessoa)')
}

main()
