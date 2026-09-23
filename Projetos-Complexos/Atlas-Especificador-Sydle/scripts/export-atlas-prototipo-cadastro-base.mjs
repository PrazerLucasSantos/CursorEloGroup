#!/usr/bin/env node
/**
 * Exporta apresentação somente do grupo Cadastro base (atlas-prototipo).
 *
 * Uso:
 *   node scripts/export-atlas-prototipo-cadastro-base.mjs
 *   node scripts/export-atlas-prototipo-cadastro-base.mjs --zip
 *
 * Saídas:
 *   exports/presentations/atlas-prototipo-cadastro-base-presentation.json
 *   exports/zips/atlas-prototipo-cadastro-base-presentation.zip   (com --zip)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const epicDir = path.join(root, 'data/subprojects/atlas-v4/epics/atlas-prototipo')
const exportPresDir = path.join(root, 'exports/presentations')

const CADASTRO_GROUP = 'grp-patlasv4-proto-cadastro'
const WORKSPACE_ID = 'ws-atlas-prototipo'
const FLOW_ID = 'flow-atlas-prototipo-cadastro-base'
const OUTPUT_NAME = 'atlas-prototipo-cadastro-base-presentation.json'

const wantZip = process.argv.includes('--zip')

function loadJson(p, fallback = null) {
  if (!fs.existsSync(p)) return fallback
  return JSON.parse(fs.readFileSync(p, 'utf8'))
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

function filterWorkspace(workspaces, mainFormIds) {
  const mainSet = new Set(mainFormIds)
  const ws = workspaces.find((w) => w.id === WORKSPACE_ID) ?? workspaces[0]
  if (!ws) return []

  const filteredClasses = []
  for (const pkg of ws.packages ?? []) {
    for (const cls of pkg.classes ?? []) {
      if (mainSet.has(cls.linkedFormId)) {
        filteredClasses.push({ ...cls, _packageName: pkg.name })
      }
    }
  }

  return [
    {
      ...ws,
      name: `${ws.name} — Cadastro base`,
      packages: [
        {
          id: 'pkg-patlasv4-proto-cadastro-export',
          name: 'Cadastro base',
          classes: filteredClasses.map(({ _packageName: _, ...cls }) => cls),
        },
      ],
    },
  ]
}

function buildFlowSteps(mainFormIds, forms, workspaces, groupName) {
  const formById = new Map(forms.map((f) => [f.id, f]))
  const steps = []

  steps.push({
    id: 'step-cadastro-base-capa',
    title: 'Cadastro base — Atlas',
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: 'Cadastro base',
    htmlContent: box(
      groupName,
      `<p style="margin:0 0 8px;">Apresentação das telas do grupo <strong>Cadastro base</strong>: organização, pessoas, cargos e configuração de processos/assinaturas.</p>
<p style="margin:0;font-size:0.9rem;color:#475569;"><strong>${mainFormIds.length}</strong> classes principais · <strong>${forms.length}</strong> formulários no pacote (inclui tabelas vinculadas).</p>`,
      { border: '#0c4a6e', bg: '#e0f2fe' },
    ),
  })

  const wsFiltered = filterWorkspace(workspaces, mainFormIds)
  if (wsFiltered[0]?.packages?.[0]?.classes?.length) {
    steps.push({
      id: 'step-cadastro-base-workspace',
      title: 'Explorer — Cadastro base',
      type: 'workspace',
      linkedWorkspaceId: wsFiltered[0].id,
      workspacePresentationDescription: 'Visão do pacote Cadastro base no explorer.',
    })
  }

  for (const fid of mainFormIds) {
    const form = formById.get(fid)
    if (!form) continue
    steps.push({
      id: `step-cadastro-base-class-${fid}`,
      title: form.name,
      type: 'class',
      linkedFormId: fid,
      classPresentationTitle: form.name,
      classPresentationDescription: form.metadata ?? '',
    })
  }

  return { steps, workspaces: wsFiltered }
}

function main() {
  if (!fs.existsSync(epicDir)) {
    console.error('Épico não encontrado:', epicDir)
    process.exit(1)
  }

  const epicName = loadJson(path.join(epicDir, 'epic.json'), { name: 'Atlas Protótipo Atual' }).name
  const allForms = loadJson(path.join(epicDir, 'forms.json'), [])
  const workspaces = loadJson(path.join(epicDir, 'workspaces.json'), [])
  const portals = loadJson(path.join(epicDir, 'portals.json'), [])
  const classGroups = loadJson(path.join(epicDir, 'class-groups.json'), {
    groups: [],
    memberOrderByGroup: {},
  })

  const group = classGroups.groups?.find((g) => g.id === CADASTRO_GROUP)
  const groupName = group?.name ?? 'Cadastro base'
  const mainFormIds = classGroups.memberOrderByGroup?.[CADASTRO_GROUP] ?? []

  if (!mainFormIds.length) {
    console.error('Nenhuma classe no grupo', CADASTRO_GROUP)
    process.exit(1)
  }

  const formIdSet = collectLinkedFormIds(mainFormIds, allForms)
  const forms = allForms.filter((f) => formIdSet.has(f.id))

  const { steps, workspaces: wsFiltered } = buildFlowSteps(mainFormIds, forms, workspaces, groupName)

  const flow = {
    id: FLOW_ID,
    name: `Apresentação — ${groupName}`,
    steps,
  }

  const presentation = {
    version: 1,
    meta: {
      epicName,
      flowName: flow.name,
      groupId: CADASTRO_GROUP,
      groupName,
      exportedAt: new Date().toISOString(),
    },
    bundle: {
      forms,
      workspaces: wsFiltered,
      portals,
    },
    flow,
    initialStepId: flow.steps[0]?.id,
  }

  fs.mkdirSync(exportPresDir, { recursive: true })
  const jsonPath = path.join(exportPresDir, OUTPUT_NAME)
  fs.writeFileSync(jsonPath, `${JSON.stringify(presentation, null, 2)}\n`, 'utf8')

  console.log('Apresentação JSON:', jsonPath)
  console.log(`  • ${mainFormIds.length} classes do grupo ${groupName}`)
  console.log(`  • ${forms.length} formulários (com vinculados)`)
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
    console.log('ZIP: exports/zips/atlas-prototipo-cadastro-base-presentation.zip')
  }
}

main()
