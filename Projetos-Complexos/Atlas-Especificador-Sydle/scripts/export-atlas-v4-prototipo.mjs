#!/usr/bin/env node
/**
 * Exporta o épico atlas-prototipo (Fase 1) a partir dos JSON em disco.
 *
 * Uso:
 *   node scripts/export-atlas-v4-prototipo.mjs
 *   node scripts/export-atlas-v4-prototipo.mjs --zip
 *
 * Saídas:
 *   exports/backups/atlas-prototipo-<timestamp>/
 *   exports/epics/atlas-prototipo-snapshot.json
 *   exports/presentations/atlas-prototipo-presentation.json
 *   exports/zips/atlas-prototipo-presentation.zip   (com --zip)
 *   exports/zips/atlas-prototipo-fase1-bundle.zip   (com --zip; inclui docs)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import archiver from 'archiver'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const epicDir = path.join(root, 'data/subprojects/atlas-prototipo/epics/prototipo')
const exportPresDir = path.join(root, 'exports/presentations')
const exportEpicDir = path.join(root, 'exports/epics')
const backupRoot = path.join(root, 'exports/backups')
const zipsDir = path.join(root, 'exports/zips')

const WORKSPACE_ID = 'ws-atlas-prototipo-organizado'
const FLOW_ID = 'flow-atlas-prototipo-fase1'

const wantZip = process.argv.includes('--zip')

function loadJson(p, fallback = null) {
  if (!fs.existsSync(p)) return fallback
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const name of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, name.name)
    const d = path.join(dest, name.name)
    if (name.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

function box(title, html, colors = { border: '#6366f1', bg: '#eef2ff' }) {
  return `<div style="border-left:4px solid ${colors.border};background:${colors.bg};padding:16px 20px;border-radius:8px;margin:0;">
  <div style="font-weight:700;color:#1e293b;margin-bottom:8px;">${title}</div>
  ${html}
</div>`
}

function collectLinkedFormIds(seedIds, forms) {
  const formById = new Map(forms.map((f) => [f.id, f]))
  const out = new Set(seedIds.filter((id) => formById.has(id)))
  const queue = [...out]

  while (queue.length) {
    const id = queue.shift()
    const form = formById.get(id)
    if (!form) continue
    for (const field of form.fields ?? []) {
      if (field.linkedFormId && formById.has(field.linkedFormId) && !out.has(field.linkedFormId)) {
        out.add(field.linkedFormId)
        queue.push(field.linkedFormId)
      }
    }
    for (const method of form.methods ?? []) {
      if (method.inputFormId && formById.has(method.inputFormId) && !out.has(method.inputFormId)) {
        out.add(method.inputFormId)
        queue.push(method.inputFormId)
      }
    }
  }
  return out
}

function workspaceMainFormIds(workspaces) {
  const ws = workspaces.find((w) => w.id === WORKSPACE_ID) ?? workspaces[0]
  if (!ws) return []
  const ids = []
  for (const pkg of ws.packages ?? []) {
    for (const cls of pkg.classes ?? []) {
      if (cls.linkedFormId) ids.push(cls.linkedFormId)
    }
  }
  return ids
}

function buildFlowSteps(forms, workspaces) {
  const formById = new Map(forms.map((f) => [f.id, f]))
  const ws = workspaces.find((w) => w.id === WORKSPACE_ID) ?? workspaces[0]
  const mainIds = workspaceMainFormIds(workspaces)
  const steps = []

  steps.push({
    id: 'step-patlasv4-proto-capa',
    title: 'Atlas Protótipo — Fase 1',
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: 'Atlas Protótipo — Fase 1',
    htmlContent: box(
      'Mapa do fluxo e telas',
      `<p style="margin:0 0 8px;">Protótipo Fase 1 exportado do especificador (estado atual em disco).</p>
<p style="margin:0 0 8px;"><strong>${mainIds.length}</strong> classes no mapa do fluxo · <strong>${forms.length}</strong> formulários no pacote (inclui embutidas e métodos vinculados).</p>
<p style="margin:0;font-size:0.9rem;color:#475569;">Navegue pelo workspace <em>Mapa do Fluxo — Atlas F1</em> ou pelas telas na ordem de preenchimento.</p>`,
      { border: '#0c4a6e', bg: '#e0f2fe' },
    ),
  })

  if (ws) {
    steps.push({
      id: 'step-patlasv4-proto-workspace',
      title: `Workspace — ${ws.name}`,
      type: 'workspace',
      linkedWorkspaceId: ws.id,
      workspacePresentationDescription: 'Pacotes e classes na ordem do fluxo Fase 1.',
    })
  }

  for (const pkg of ws?.packages ?? []) {
    steps.push({
      id: `step-pkg-${pkg.id}`,
      title: pkg.name,
      type: 'html',
      htmlContent: box(pkg.name, `<p style="margin:0;">${pkg.classes?.length ?? 0} classes neste pacote.</p>`, {
        border: '#64748b',
        bg: '#f8fafc',
      }),
    })

    for (const cls of pkg.classes ?? []) {
      const form = formById.get(cls.linkedFormId)
      if (!form) continue
      steps.push({
        id: `step-patlasv4-proto-class-${cls.linkedFormId}`,
        title: cls.name ?? form.name,
        type: 'class',
        linkedFormId: cls.linkedFormId,
        classPresentationTitle: cls.name ?? form.name,
        classPresentationDescription: form.metadata ?? '',
        linkedFormExamplePresetIds: cls.linkedFormExamplePresetIds,
      })
    }
  }

  return steps
}

function loadEpicBundle() {
  const portalsPath = path.join(epicDir, 'portals.json')
  const allForms = loadJson(path.join(epicDir, 'forms.json'), [])
  const workspaces = loadJson(path.join(epicDir, 'workspaces.json'), [])
  const mainIds = workspaceMainFormIds(workspaces)
  const includedIds = collectLinkedFormIds(mainIds, allForms)
  const forms = allForms.filter((f) => includedIds.has(f.id))

  return {
    forms,
    workspaces,
    portals: loadJson(portalsPath, []),
    classGroups: loadJson(path.join(epicDir, 'class-groups.json'), {
      groups: [],
      assignments: {},
      memberOrderByGroup: {},
    }),
    flows: loadJson(path.join(epicDir, 'flows.json'), []),
  }
}

function createBundleZip(paths) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(zipsDir, { recursive: true })
    const outZip = path.join(zipsDir, 'atlas-prototipo-fase1-bundle.zip')
    const output = createWriteStream(outZip)
    const archive = archiver('zip', { zlib: { level: 9 } })

    archive.on('error', reject)
    output.on('close', () => resolve(outZip))

    archive.pipe(output)
    for (const { file, name } of paths) {
      if (fs.existsSync(file)) archive.file(file, { name })
    }
    void archive.finalize()
  })
}

async function main() {
if (!fs.existsSync(epicDir)) {
  console.error('Épico não encontrado:', epicDir)
  process.exit(1)
}

const epicName = loadJson(path.join(epicDir, 'epic.json'), { name: 'Atlas Protótipo' }).name
const bundle = loadEpicBundle()
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

const backupDir = path.join(backupRoot, `atlas-prototipo-${timestamp}`)
copyDir(epicDir, backupDir)

const docFase1 = path.join(root, 'docs/entregaveis/markdown/Atlas_Fase1_Requisitos_Completo.md')
if (fs.existsSync(docFase1)) {
  fs.copyFileSync(docFase1, path.join(backupDir, 'Atlas_Fase1_Requisitos_Completo.md'))
}

console.log('Backup:', backupDir)

fs.mkdirSync(exportEpicDir, { recursive: true })
const snapshotPath = path.join(exportEpicDir, 'atlas-prototipo-snapshot.json')
const snapshot = {
  version: 1,
  meta: { epicId: 'prototipo', subprojectId: 'atlas-prototipo', epicName, exportedAt: new Date().toISOString(), source: 'disk' },
  ...bundle,
}
fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
console.log('Snapshot épico:', snapshotPath)
console.log(`  • ${bundle.forms.length} formulários no pacote`)

const flowSteps = buildFlowSteps(bundle.forms, bundle.workspaces)
const flow = {
  id: FLOW_ID,
  name: 'Apresentação — Atlas Protótipo Fase 1',
  steps: flowSteps,
}

const presentation = {
  version: 1,
  meta: { epicName, flowName: flow.name, exportedAt: new Date().toISOString() },
  bundle: {
    forms: bundle.forms,
    workspaces: bundle.workspaces,
    portals: bundle.portals,
  },
  flow,
  initialStepId: flow.steps[0]?.id,
}

fs.mkdirSync(exportPresDir, { recursive: true })
const jsonPath = path.join(exportPresDir, 'atlas-prototipo-presentation.json')
fs.writeFileSync(jsonPath, `${JSON.stringify(presentation, null, 2)}\n`, 'utf8')
console.log('Apresentação JSON:', jsonPath)
console.log(`  • ${flow.steps.length} etapas`)

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
  console.log('ZIP apresentação: exports/zips/atlas-prototipo-presentation.zip')

  const bundlePaths = [
    { file: jsonPath, name: 'apresentacao/atlas-prototipo-presentation.json' },
    { file: path.join(zipsDir, 'atlas-prototipo-presentation.zip'), name: 'apresentacao/atlas-prototipo-presentation.zip' },
    { file: snapshotPath, name: 'dados/atlas-prototipo-snapshot.json' },
    { file: docFase1, name: 'docs/Atlas_Fase1_Requisitos_Completo.md' },
  ]
  for (const name of ['forms.json', 'class-groups.json', 'workspaces.json', 'portals.json', 'flows.json', 'epic.json']) {
    bundlePaths.push({ file: path.join(epicDir, name), name: `dados/epic/${name}` })
  }

  const bundleZip = await createBundleZip(bundlePaths)
  console.log('ZIP bundle completo:', bundleZip)
}

console.log('Exportação concluída.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
