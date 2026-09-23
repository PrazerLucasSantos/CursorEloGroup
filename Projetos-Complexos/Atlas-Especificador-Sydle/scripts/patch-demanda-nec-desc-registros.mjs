/**
 * Converte NEC e Descrição do atendimento (MTI) para embeddedReference
 * múltiplo (padrão Observações / Caso de negócio).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORMS = path.join(
  root,
  'data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const REGISTRO_FORM = 'form-patlasv4-proto-demc-registro-texto'

const TARGETS = [
  {
    idEnds: '-nec',
    label: 'NEC / necessidade detalhada',
    spec:
      'Função: Lista de registros de «NEC / necessidade detalhada» (padrão Observações Sydle).\nRegra: Clique em + para adicionar linha (Autor / data + Conteúdo). Ícone de exclusão remove o registro. Vários registros por campo. Distinta da descrição da abertura — detalha a necessidade no atendimento via contrato.',
  },
  {
    idEnds: '-desc-atendimento',
    label: 'Descrição do atendimento (MTI)',
    // não converter desc-atendimento-parceiro
    exactSuffix: 'desc-atendimento',
    spec:
      'Função: Lista de registros de «Descrição do atendimento (MTI)» (padrão Observações Sydle).\nRegra: Clique em + para adicionar linha (Autor / data + Conteúdo). Ícone de exclusão remove o registro. Elaborada pela MTI; distinta da descrição do parceiro.',
  },
]

function shouldPatch(field, target) {
  if (!field?.id?.endsWith(target.idEnds) && field?.id !== `patlasv4proto-demc${target.idEnds}`) {
    // idEnds like '-nec' matches demc-nec, demcli-nec, dempar-nec
  }
  if (!field.id.endsWith(target.idEnds)) return false
  if (target.exactSuffix) {
    // evita *-desc-atendimento-parceiro
    const tail = field.id.split('-').slice(-2).join('-')
    if (target.exactSuffix === 'desc-atendimento' && field.id.endsWith('desc-atendimento-parceiro')) {
      return false
    }
    if (!field.id.endsWith(target.exactSuffix)) return false
  }
  return true
}

const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
let n = 0
for (const form of forms) {
  if (!form.fields) continue
  for (const field of form.fields) {
    for (const target of TARGETS) {
      if (!shouldPatch(field, target)) continue
      if (field.type === 'embeddedReference') continue
      Object.assign(field, {
        type: 'embeddedReference',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: true,
        relevance: field.relevance || 'common',
        textLong: undefined,
        linkedFormId: REGISTRO_FORM,
        embeddedDisplay: 'form',
        label: target.label,
        spec: target.spec,
      })
      delete field.textLong
      n += 1
    }
  }
  // Limpa presets que setavam string nesses campos
  if (form.exampleValuePresets) {
    for (const p of form.exampleValuePresets) {
      if (!p.values) continue
      for (const key of Object.keys(p.values)) {
        if (
          (key.endsWith('-nec') || key.endsWith('-desc-atendimento')) &&
          !key.endsWith('-desc-atendimento-parceiro') &&
          typeof p.values[key] === 'string'
        ) {
          delete p.values[key]
        }
      }
    }
  }
}

fs.writeFileSync(FORMS, `${JSON.stringify(forms, null, 2)}\n`)
console.log('OK converted fields:', n)
