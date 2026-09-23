#!/usr/bin/env node
/**
 * Exporta apresentação(ões) do Atlas V2 para viewer estático + ZIP.
 *
 * Uso:
 *   node scripts/export-atlas-v2-presentation.mjs                    # só JSON (manual)
 *   node scripts/export-atlas-v2-presentation.mjs --zip              # JSON + ZIP (manual)
 *   node scripts/export-atlas-v2-presentation.mjs --flow operacional --zip
 *   node scripts/export-atlas-v2-presentation.mjs --flow all --zip   # as duas apresentações
 *
 * Saída JSON: exports/presentations/atlas-v2-<slug>-presentation.json
 * Saída ZIP:  exports/zips/atlas-v2-<slug>-presentation.zip
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const epicDir = path.join(root, 'data/subprojects/atlas-v2/epics/atlas-v2-fase1')
const exportDir = path.join(root, 'exports/presentations')

const FLOWS = {
  manual: {
    id: 'flow-patlas-fase1-manual-completo',
    slug: 'manual-completo',
    label: 'Manual completo passo a passo (detalhado)',
  },
  operacional: {
    id: 'flow-patlas-fase1-proposta-contrato',
    slug: 'operacional',
    label: 'Da demanda ao kick-off (operacional)',
  },
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function parseArgs() {
  const args = process.argv.slice(2)
  let flow = 'manual'
  let wantZip = false
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--zip') wantZip = true
    else if (args[i] === '--flow' && args[i + 1]) {
      flow = args[++i]
    }
  }
  return { flow, wantZip }
}

function buildPayload(flow, epicName) {
  const bundle = {
    forms: loadJson(path.join(epicDir, 'forms.json')),
    workspaces: loadJson(path.join(epicDir, 'workspaces.json')),
    portals: loadJson(path.join(epicDir, 'portals.json')),
  }
  return {
    version: 1,
    meta: {
      epicName,
      flowName: flow.name,
      exportedAt: new Date().toISOString(),
    },
    bundle,
    flow,
    initialStepId: flow.steps[0]?.id,
  }
}

function exportOne(flowDef, epicName, wantZip) {
  const flows = loadJson(path.join(epicDir, 'flows.json'))
  const flow = flows.find((f) => f.id === flowDef.id)
  if (!flow?.steps?.length) {
    console.error(`Flow não encontrado ou sem etapas: ${flowDef.id}`)
    process.exit(1)
  }

  const payload = buildPayload(flow, epicName)
  fs.mkdirSync(exportDir, { recursive: true })
  const baseName = `atlas-v2-${flowDef.slug}-presentation`
  const jsonPath = path.join(exportDir, `${baseName}.json`)
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log('JSON:', jsonPath)
  console.log('  Flow:', flow.name)
  console.log('  Etapas:', flow.steps.length)

  if (!wantZip) return jsonPath

  const distPres = path.join(root, 'dist/presentation.html')
  if (!fs.existsSync(distPres)) {
    console.log('Executando npm run build...')
    const r = spawnSync('npm', ['run', 'build'], { cwd: root, shell: true, stdio: 'inherit' })
    if (r.status !== 0) process.exit(r.status ?? 1)
  }

  const zipScript = path.join(__dirname, 'zip-presentation-export.mjs')
  const z = spawnSync(process.execPath, [zipScript, jsonPath], { cwd: root, stdio: 'inherit' })
  if (z.status !== 0) process.exit(z.status ?? 1)
  console.log(`ZIP: exports/zips/${baseName}.zip`)
  return jsonPath
}

const { flow: flowArg, wantZip } = parseArgs()
const epicName = loadJson(path.join(epicDir, 'epic.json')).name ?? 'Atlas V2 — Fase 1'

const targets =
  flowArg === 'all'
    ? [FLOWS.manual, FLOWS.operacional]
    : flowArg === 'operacional'
      ? [FLOWS.operacional]
      : [FLOWS.manual]

if (!targets.length) {
  console.error('Use --flow manual | operacional | all')
  process.exit(1)
}

for (const t of targets) {
  console.log(`\n--- ${t.label} ---`)
  exportOne(t, epicName, wantZip)
}

if (wantZip) {
  console.log('\nPublique: arraste o ZIP na Netlify ou extraia e abra index.html.')
}
