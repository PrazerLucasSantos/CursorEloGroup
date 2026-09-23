#!/usr/bin/env node
/**
 * Decisões 21/06 (rodada 2):
 * 1) Portal do Parceiro = fluxo por CONVITE + CPF: informa código + CPF -> dados coletados automaticamente
 *    (read-only). Usuário só define a senha e Confirma cadastro / Cancela.
 * 2) Presidente assina por último: vai para todos em paralelo; sistema NÃO controla (comportamento manual).
 * 3) Token de certificado digital na Pessoa (aba Credenciais).
 * 4) Método "Puxar proposta de volta" na Proposta.
 * (Data de fim do ocupante já existe — não mexer.)
 *
 * Uso: node scripts/apply-decisoes-21jun-rodada2.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const FORM_PORTAL = 'form-patlasv4-proto-portal-parceiro'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'
const FORM_PROPOSTA = 'form-patlasv4-proto-proposta'
const FORM_WF_ASSIN = 'mqebasqyphbwea'

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  // 1) Portal do Parceiro -> convite + CPF, dados auto-coletados
  const portal = forms.find((x) => x.id === FORM_PORTAL)
  if (portal) {
    portal.metadata =
      'Auto-cadastro por CONVITE. O parceiro recebe o link, informa o código e o CPF; os dados pessoais são ' +
      'coletados automaticamente pelo CPF (somente leitura). O usuário apenas define a senha e Confirma o cadastro ou Cancela.'
    const byId = Object.fromEntries(portal.fields.map((f) => [f.id, f]))

    const cpf = byId['patlasv4proto-portal-cpf']
    if (cpf) {
      cpf.required = true
      cpf.relevance = 'identity'
      cpf.spec =
        'Ao informar o CPF, os dados do cadastro são coletados automaticamente. O usuário só precisa definir a senha.'
    }
    // dados coletados automaticamente -> somente leitura
    for (const id of [
      'patlasv4proto-portal-nome',
      'patlasv4proto-portal-nascimento',
      'patlasv4proto-portal-email',
      'patlasv4proto-portal-celular',
      'patlasv4proto-portal-foto',
    ]) {
      const f = byId[id]
      if (f) {
        f.readOnly = true
        f.required = false
        f.spec = 'Coletado automaticamente pelo CPF (somente leitura).'
      }
    }
    const alerta = byId['patlasv4proto-portal-dados-alerta']
    if (alerta) {
      alerta.alertVariant = 'info'
      alerta.alertTitle = 'Confira seus dados e defina a senha'
      alerta.alertMessage =
        'Os dados abaixo foram coletados automaticamente pelo seu CPF. Defina uma senha e clique em Confirmar cadastro.'
    }
    // senha continua editável
    const senha = byId['patlasv4proto-portal-senha']
    if (senha) senha.spec = 'Defina sua senha de acesso ao Atlas.'

    // métodos: Confirmar cadastro / Cancelar
    portal.methods = portal.methods || []
    const concluir = portal.methods.find((m) => m.id === 'patlasv4proto-portal-meth-concluir')
    if (concluir) {
      concluir.name = 'Confirmar cadastro'
      concluir.icon = 'how_to_reg'
      concluir.spec =
        'Cria a Pessoa com os dados coletados pelo CPF + senha, vinculada à organização do convite, e consome o convite.'
    }
    if (!portal.methods.some((m) => m.id === 'patlasv4proto-portal-meth-cancelar')) {
      portal.methods.push({
        id: 'patlasv4proto-portal-meth-cancelar',
        name: 'Cancelar',
        icon: 'close',
        kind: 'menu',
        spec: 'Cancela o auto-cadastro sem consumir o convite.',
      })
    }
    // método validar convite -> reforça que o CPF puxa os dados
    const validar = portal.methods.find((m) => m.id === 'patlasv4proto-portal-meth-validar')
    if (validar) {
      validar.spec =
        'Valida o código do convite e libera a etapa de CPF. Ao informar o CPF, os dados são coletados automaticamente.'
    }
  }

  // 2) Workflow de Assinatura — presidente por último é manual; sistema não controla
  const wf = forms.find((x) => x.id === FORM_WF_ASSIN)
  if (wf) {
    wf.metadata =
      (wf.metadata ? wf.metadata + ' ' : '') +
      'Assinatura em paralelo: o envelope vai para todos os signatários ao mesmo tempo. ' +
      'Casos como "presidente assina por último" são operacionais — o presidente aguarda os demais assinarem; ' +
      'o sistema NÃO controla/ordena isso automaticamente. A recusa de qualquer signatário cancela o envelope.'
    const ordem = (wf.fields || []).find((f) => f.id === 'patlasv4proto-wf-etapas')
    // (campo de etapas é embutido; nota fica no metadata)
    void ordem
  }

  // 3) Token de certificado digital na Pessoa (aba Credenciais)
  const pessoa = forms.find((x) => x.id === FORM_PESSOA)
  if (pessoa) {
    const tokenId = 'patlasv4proto-pes-token-certificado'
    if (!pessoa.fields.some((f) => f.id === tokenId)) {
      const token = {
        id: tokenId,
        label: 'Token do certificado digital',
        type: 'text',
        size: 'medium',
        readOnly: false,
        hidden: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-patlasv4proto-pes-credenciais',
        spec:
          'Token do certificado digital (A3) usado para assinar quando não for por MT Login/Gov.br. Armazenado no ambiente seguro.',
      }
      const idx = pessoa.fields.findIndex((f) => f.id === 'patlasv4proto-pes-senha')
      if (idx >= 0) pessoa.fields.splice(idx + 1, 0, token)
      else pessoa.fields.push(token)
    }
  }

  // 4) Método "Puxar proposta de volta" na Proposta
  const proposta = forms.find((x) => x.id === FORM_PROPOSTA)
  if (proposta) {
    proposta.methods = proposta.methods || []
    if (!proposta.methods.some((m) => m.id === 'patlasv4proto-proposta-meth-puxar')) {
      proposta.methods.push({
        id: 'patlasv4proto-proposta-meth-puxar',
        name: 'Puxar proposta de volta',
        icon: 'undo',
        kind: 'destaque',
        spec:
          'Diretor/Gerente de vendas da MTI reabre a proposta para ajuste (cancela o envelope de assinatura em curso). ' +
          'O parceiro ajusta os blocos e o fluxo é reenviado para assinatura.',
      })
    }
  }

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('OK: Portal por CPF, nota presidente, token certificado e puxar proposta aplicados.')
}

main()
