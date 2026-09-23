#!/usr/bin/env node
/**
 * Decisões Luiz 21/06:
 * 1) Módulos visíveis da UO = seleção LIVRE por unidade (sem herança mãe→filha). Apenas documenta no spec.
 * 2) Template: campo "Aplicação da alteração" (atualiza em andamento x novas versões) + método "Publicar"
 *    (sai de Rascunho ao publicar).
 *
 * Uso: node scripts/apply-decisoes-luiz-21jun.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const FORM_TEMPLATE = 'form-patlasv4-proto-template'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const F_STATUS = 'patlasv4proto-template-dados-status'
const F_APLICACAO = 'patlasv4proto-template-dados-aplicacao-alteracao'

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  // 1) UO — documenta seleção livre
  const uo = forms.find((x) => x.id === FORM_UO)
  if (uo) {
    const mod = uo.fields.find((f) => f.id === 'patlasv4proto-uo-modulos-visiveis')
    if (mod) {
      mod.spec =
        'Decisão Luiz/MTI: seleção LIVRE por unidade — a filha NÃO herda automaticamente os módulos da mãe ' +
        '(cada UO configura o seu cardápio). Permissão efetiva = interseção com módulos do Cargo (executor) ' +
        'ou acesso total se Cargo.Administrador = Sim.'
    }
  }

  // 2) Template — campo de aplicação + método Publicar
  const tpl = forms.find((x) => x.id === FORM_TEMPLATE)
  if (tpl) {
    // atualiza spec da versão/status
    const ver = tpl.fields.find((f) => f.id === 'patlasv4proto-template-dados-versao-do-template')
    if (ver) ver.spec = 'Número auto-incrementado a cada Publicação. Somente leitura.'
    const st = tpl.fields.find((f) => f.id === F_STATUS)
    if (st) st.spec = 'Rascunho até Publicar. Só versões Homologado/Publicado geram documento. Somente leitura.'

    // novo campo "Aplicação da alteração"
    if (!tpl.fields.some((f) => f.id === F_APLICACAO)) {
      const field = {
        id: F_APLICACAO,
        label: 'Aplicação da alteração',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-template-dados',
        options: ['Atualizar documentos em andamento', 'Somente em novas versões'],
        spec:
          'Define o efeito ao editar: "Atualizar documentos em andamento" altera os processos que usam este ' +
          'template; "Somente em novas versões" congela os documentos já gerados/em assinatura e vale só para os próximos.',
      }
      const idx = tpl.fields.findIndex((f) => f.id === F_STATUS)
      if (idx >= 0) tpl.fields.splice(idx + 1, 0, field)
      else tpl.fields.push(field)
    }

    // método Publicar
    tpl.methods = tpl.methods || []
    if (!tpl.methods.some((m) => m.id === 'patlasv4proto-template-meth-publicar')) {
      tpl.methods.push({
        id: 'patlasv4proto-template-meth-publicar',
        name: 'Publicar versão',
        icon: 'publish',
        kind: 'destaque',
        spec:
          'Tira a versão do Rascunho (Rascunho → Homologado) e a torna disponível para gerar documentos. ' +
          'Incrementa o número da versão.',
      })
    }
  }

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('OK: decisoes Luiz aplicadas (UO livre; Template aplicacao + Publicar).')
}

main()
