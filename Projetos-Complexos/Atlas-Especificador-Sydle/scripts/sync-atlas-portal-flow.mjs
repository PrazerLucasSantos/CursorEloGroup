/**
 * Mescla fluxo do portal de cotação e portals.json no épico Atlas.
 * Uso: node scripts/sync-atlas-portal-flow.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { atlasPortals, atlasPortalCotacaoFlow } from './atlas-portals.mjs'
import { PORTAL_CONVOCACAO_SHELL_HTML } from './atlas-portal-convocacao-shell.html.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas/epics/atlas-epico')
const flowsPath = path.join(epicDir, 'flows.json')
const portalsPath = path.join(epicDir, 'portals.json')

const flow = {
  ...atlasPortalCotacaoFlow,
  steps: atlasPortalCotacaoFlow.steps.map((s) =>
    s.id === 'step-portal-cot-visual'
      ? { ...s, htmlContent: PORTAL_CONVOCACAO_SHELL_HTML }
      : s,
  ),
}

let flows = []
if (fs.existsSync(flowsPath)) {
  flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
}
const idx = flows.findIndex((f) => f.id === flow.id)
if (idx >= 0) flows[idx] = flow
else flows.push(flow)

fs.writeFileSync(flowsPath, `${JSON.stringify(flows, null, 2)}\n`, 'utf8')
fs.writeFileSync(portalsPath, `${JSON.stringify(atlasPortals, null, 2)}\n`, 'utf8')
console.log('Wrote', flowsPath)
console.log('Wrote', portalsPath)
