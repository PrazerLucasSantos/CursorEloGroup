/**
 * Mescla os fluxos Fase 1 do Atlas em flows.json.
 * Uso: node scripts/sync-atlas-fase1-flows.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fase1Flows } from './atlas-fase1-flows.mjs'
import { homologarFlows } from './atlas-fase1-homologar-flow.mjs'
import { usuarioFlows } from './atlas-fase1-usuario-flow.mjs'
import { sistemaFlows } from './atlas-fase1-sistema-flow.mjs'

const allFase1Flows = [...fase1Flows, ...homologarFlows, ...usuarioFlows, ...sistemaFlows]

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas/epics/atlas-epico')
const flowsPath = path.join(epicDir, 'flows.json')

let flows = []
if (fs.existsSync(flowsPath)) {
  flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
}

for (const flow of allFase1Flows) {
  const idx = flows.findIndex((f) => f.id === flow.id)
  if (idx >= 0) flows[idx] = flow
  else flows.push(flow)
}

fs.writeFileSync(flowsPath, `${JSON.stringify(flows, null, 2)}\n`, 'utf8')
console.log('Wrote', flowsPath)
