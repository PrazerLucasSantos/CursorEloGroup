/**
 * Atualiza a etapa HTML livre do fluxo Atlas épico com o modelo de documento
 * baseado em form-atlas-produto-cadastro.
 *
 * Uso: node scripts/sync-atlas-flow-produto-doc.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FORM_PRODUTO_CADASTRO_DOC,
  PRODUTO_CADASTRO_DOCUMENT_HTML,
} from './atlas-produto-documento-template.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const flowsPath = path.join(__dirname, '../data/subprojects/atlas/epics/atlas-epico/flows.json')
const STEP_ID = 'mphdu7zfzjct6w'

const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
const flow = flows[0]
if (!flow?.steps) {
  console.error('flows.json: estrutura inesperada')
  process.exit(1)
}

const step = flow.steps.find((s) => s.id === STEP_ID)
if (!step) {
  console.error(`Etapa ${STEP_ID} não encontrada`)
  process.exit(1)
}

step.title = 'Modelo de documento — Produto cadastro'
step.type = 'html'
step.linkedFormId = FORM_PRODUTO_CADASTRO_DOC
step.htmlContent = PRODUTO_CADASTRO_DOCUMENT_HTML
step.htmlPresentationShowHeader = true
step.htmlPresentationHeaderTitle = 'Ficha de produto — catálogo MTI'

fs.writeFileSync(flowsPath, `${JSON.stringify(flows, null, 2)}\n`, 'utf8')
console.log('Atualizado', flowsPath, '— etapa', STEP_ID)
