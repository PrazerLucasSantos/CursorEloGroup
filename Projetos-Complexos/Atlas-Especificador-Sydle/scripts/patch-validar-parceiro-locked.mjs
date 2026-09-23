#!/usr/bin/env node
/**
 * Validar parceiro (MTI): exibe declaração + anexos do parceiro bloqueados.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const formsPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../data/subprojects/atlas-prototipo/epics/projeto-atlas-prototipacao/forms.json',
)
const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))

const FORM_IDS = [
  'form-patlasv4-proto-metodo-demc-validar-parceiro',
  'form-patlasv4-proto-metodo-demcli-validar-parceiro',
  'form-patlasv4-proto-metodo-dempar-validar-parceiro',
]

const lockedFields = [
  {
    id: 'patlasv4proto-mdem-vp-alerta',
    label: 'Aviso',
    type: 'alert',
    size: 'large',
    readOnly: true,
    required: false,
    multiple: false,
    relevance: 'highlight',
    alertVariant: 'info',
    alertTitle: 'Declaração do parceiro',
    alertMessage:
      'Descrição e comprovações abaixo foram enviadas pelo parceiro. Campos bloqueados — use a decisão MTI.',
  },
  {
    id: 'patlasv4proto-mdem-vp-entregavel',
    label: 'Declaração / entregável (parceiro)',
    type: 'text',
    size: 'large',
    readOnly: true,
    required: false,
    multiple: false,
    relevance: 'highlight',
    textLong: true,
    spec: 'Função: Exibe a declaração enviada pelo parceiro ao declarar atendida.\nRegra: Somente leitura na validação MTI.',
  },
  {
    id: 'patlasv4proto-mdem-vp-anexos',
    label: 'Comprovações (parceiro)',
    type: 'file',
    size: 'medium',
    readOnly: true,
    required: false,
    multiple: true,
    relevance: 'common',
    spec: 'Função: Anexos/comprovações do parceiro.\nRegra: Somente leitura na validação MTI.',
  },
]

let n = 0
for (const id of FORM_IDS) {
  const form = forms.find((f) => f.id === id)
  if (!form) {
    console.warn('skip missing', id)
    continue
  }
  const fields = form.fields ?? []
  const withoutDup = fields.filter(
    (f) =>
      f.id !== 'patlasv4proto-mdem-vp-alerta' &&
      f.id !== 'patlasv4proto-mdem-vp-entregavel' &&
      f.id !== 'patlasv4proto-mdem-vp-anexos',
  )
  form.fields = [...JSON.parse(JSON.stringify(lockedFields)), ...withoutDup]
  n++
  console.log('OK', id, 'fields', form.fields.length)
}

fs.writeFileSync(formsPath, `${JSON.stringify(forms, null, 2)}\n`)
console.log('patched', n)
