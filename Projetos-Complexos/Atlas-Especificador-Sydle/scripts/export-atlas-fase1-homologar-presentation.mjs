#!/usr/bin/env node
/**
 * Gera presentation.json da apresentação «fase 1 homologar» e opcionalmente o ZIP estático.
 *
 * Uso:
 *   node scripts/sync-atlas-fase1-flows.mjs
 *   node scripts/export-atlas-fase1-homologar-presentation.mjs
 *   node scripts/export-atlas-fase1-homologar-presentation.mjs --zip
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { flowFase1Homologar } from './atlas-fase1-homologar-flow.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const epicDir = path.join(root, 'data/subprojects/atlas/epics/atlas-epico')
const exportDir = path.join(root, 'exports/presentations')
const flowId = flowFase1Homologar.id
const baseName = 'fase-1-homologar'
const wantZip = process.argv.includes('--zip')

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

const flowsPath = path.join(epicDir, 'flows.json')
let flow = flowFase1Homologar
if (fs.existsSync(flowsPath)) {
  const flows = loadJson(flowsPath)
  flow = flows.find((f) => f.id === flowId) ?? flow
}

const bundle = {
  forms: loadJson(path.join(epicDir, 'forms.json')),
  workspaces: loadJson(path.join(epicDir, 'workspaces.json')),
  portals: loadJson(path.join(epicDir, 'portals.json')),
}

const payload = {
  version: 1,
  meta: {
    epicName: 'Atlas epico',
    flowName: flow.name,
    exportedAt: new Date().toISOString(),
  },
  bundle,
  flow,
  initialStepId: flow.steps[0]?.id,
}

fs.mkdirSync(exportDir, { recursive: true })
const jsonPath = path.join(exportDir, `${baseName}-presentation.json`)
fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log('Wrote', jsonPath)
console.log('Etapas:', flow.steps?.length ?? 0)

if (wantZip) {
  const distPres = path.join(root, 'dist/presentation.html')
  if (!fs.existsSync(distPres)) {
    console.log('Executando npm run build...')
    const r = spawnSync('npm', ['run', 'build'], { cwd: root, shell: true, stdio: 'inherit' })
    if (r.status !== 0) process.exit(r.status ?? 1)
  }
  const zipScript = path.join(__dirname, 'zip-presentation-export.mjs')
  const z = spawnSync(process.execPath, [zipScript, jsonPath], { cwd: root, stdio: 'inherit' })
  if (z.status !== 0) process.exit(z.status ?? 1)
  console.log(`ZIP: exports/zips/${baseName}-presentation.zip`)
  console.log('Publique o ZIP na Netlify (arrastar) para obter link público com todas as telas.')
}
