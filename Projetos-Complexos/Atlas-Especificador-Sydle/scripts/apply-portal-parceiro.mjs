#!/usr/bin/env node
/**
 * Portal do Parceiro (Fase 1) — auto-cadastro simples por convite.
 * Aba 1 (Convite): mostra o link, recebe o código e valida.
 * Aba 2 (Seus dados): campos da classe Pessoa para o parceiro preencher.
 * Remove o placeholder antigo "Portal vínculo organização" do backlog.
 *
 * Uso: node scripts/apply-portal-parceiro.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')
const WS_PATH = path.join(EPIC_DIR, 'workspaces.json')

const FORM_MAIN = 'form-patlasv4-proto-portal-parceiro'
const FORM_OLD = 'form-patlasv4-proto-portal-vinculo-organizacao'

const SEC_CONV = 'sec-patlasv4proto-portal-convite'
const SEC_DADOS = 'sec-patlasv4proto-portal-dados'

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
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
  }
}

function buildMainForm() {
  return {
    id: FORM_MAIN,
    name: '(4.1) Portal do Parceiro · auto-cadastro',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Tela pública de auto-cadastro do parceiro. O parceiro recebe o link de convite, informa o código e, ' +
      'validado o convite, preenche seus dados (classe Pessoa). Ao concluir, cria a Pessoa vinculada à organização do convite.',
    sections: [
      { id: SEC_CONV, title: 'Convite', icon: 'vpn_key' },
      { id: SEC_DADOS, title: 'Seus dados', icon: 'person' },
    ],
    fields: [
      f('patlasv4proto-portal-link', 'Link de convite', 'text', SEC_CONV, {
        readOnly: true,
        size: 'large',
        relevance: 'highlight',
        spec: 'Link enviado ao parceiro. Ex.: https://atlas.mt.gov.br/convite/EG7K-92AB',
      }),
      f('patlasv4proto-portal-codigo', 'Código de convite', 'text', SEC_CONV, {
        required: true,
        size: 'small',
        relevance: 'identity',
        spec: 'Código que o parceiro informa para validar o acesso.',
      }),
      f('patlasv4proto-portal-status', 'Status do convite', 'textOptions', SEC_CONV, {
        readOnly: true,
        size: 'small',
        options: ['Válido', 'Expirado', 'Já utilizado'],
        spec: 'Resultado da validação do código (método Validar convite).',
      }),
      f('patlasv4proto-portal-organizacao', 'Organização do convite', 'text', SEC_CONV, {
        readOnly: true,
        spec: 'Derivada do convite — organização à qual o parceiro será vinculado.',
      }),

      f('patlasv4proto-portal-dados-alerta', 'Preencha seus dados', 'alert', SEC_DADOS, {
        spec: '',
      }),
      f('patlasv4proto-portal-nome', 'Nome completo', 'text', SEC_DADOS, {
        required: true,
        relevance: 'identity',
        size: 'large',
      }),
      f('patlasv4proto-portal-cpf', 'CPF', 'text', SEC_DADOS, { required: true, size: 'small' }),
      f('patlasv4proto-portal-nascimento', 'Data de nascimento', 'date', SEC_DADOS, { size: 'small' }),
      f('patlasv4proto-portal-email', 'E-mail', 'text', SEC_DADOS, { required: true }),
      f('patlasv4proto-portal-celular', 'Telefone celular', 'text', SEC_DADOS, { required: true, size: 'small' }),
      f('patlasv4proto-portal-foto', 'Foto', 'file', SEC_DADOS, {}),
      f('patlasv4proto-portal-senha', 'Senha de acesso', 'text', SEC_DADOS, {
        required: true,
        size: 'small',
        spec: 'Credencial de acesso ao Atlas.',
      }),
      f('patlasv4proto-portal-senha-confirma', 'Confirmar senha', 'text', SEC_DADOS, {
        required: true,
        size: 'small',
      }),
    ],
    methods: [
      {
        id: 'patlasv4proto-portal-meth-validar',
        name: 'Validar convite',
        icon: 'check',
        kind: 'destaque',
        spec: 'Verifica o código (válido/expirado/já utilizado) e libera a aba Seus dados.',
      },
      {
        id: 'patlasv4proto-portal-meth-concluir',
        name: 'Concluir cadastro',
        icon: 'how_to_reg',
        kind: 'destaque',
        spec: 'Cria a Pessoa com os dados informados, vinculada à organização do convite, e consome o convite.',
      },
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-portal-elogroup',
        name: 'Convite EloGroup',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlasv4proto-portal-link': 'https://atlas.mt.gov.br/convite/EG7K-92AB',
          'patlasv4proto-portal-codigo': 'EG7K-92AB',
          'patlasv4proto-portal-status': 'Válido',
          'patlasv4proto-portal-organizacao': 'EloGroup',
          'patlasv4proto-portal-nome': 'Mariana Alves Pereira',
          'patlasv4proto-portal-cpf': '123.456.789-00',
          'patlasv4proto-portal-nascimento': '1990-03-12T00:00:00',
          'patlasv4proto-portal-email': 'mariana.pereira@elogroup.com.br',
          'patlasv4proto-portal-celular': '(65) 99999-1234',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-portal-elogroup',
  }
}

function upsertForm(forms, formDef) {
  const i = forms.findIndex((x) => x.id === formDef.id)
  if (i >= 0) forms[i] = formDef
  else forms.push(formDef)
}

function main() {
  // forms.json — cria o portal e remove o placeholder antigo
  let forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  forms = forms.filter((x) => x.id !== FORM_OLD)
  upsertForm(forms, buildMainForm())
  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  // class-groups — entra no domínio 04 · Convite; remove o antigo do backlog
  const cg = JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))
  delete cg.assignments[FORM_OLD]
  for (const k of Object.keys(cg.memberOrderByGroup)) {
    cg.memberOrderByGroup[k] = cg.memberOrderByGroup[k].filter((id) => id !== FORM_OLD)
  }
  cg.assignments[FORM_MAIN] = 'grp-04-convite'
  const order = cg.memberOrderByGroup['grp-04-convite'] || (cg.memberOrderByGroup['grp-04-convite'] = [])
  if (!order.includes(FORM_MAIN)) order.push(FORM_MAIN)
  fs.writeFileSync(GROUPS_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

  // workspaces — adiciona ao pacote 1 (Cadastro base), após o Convite
  const ws = JSON.parse(fs.readFileSync(WS_PATH, 'utf8'))
  const pkg = ws[0].packages.find((p) => p.id === 'pkg-mapa-1-cadastro')
  if (pkg && !pkg.classes.some((c) => c.id === 'cls-mapa-portal-parceiro')) {
    pkg.classes.push({
      id: 'cls-mapa-portal-parceiro',
      name: '(4.1) Portal do Parceiro',
      linkedFormId: FORM_MAIN,
      linkedFormExamplePresetIds: ['patlasv4proto-p-portal-elogroup'],
    })
  }
  fs.writeFileSync(WS_PATH, `${JSON.stringify(ws, null, 2)}\n`, 'utf8')

  console.log('OK: Portal do Parceiro criado; placeholder antigo removido do backlog.')
}

main()
