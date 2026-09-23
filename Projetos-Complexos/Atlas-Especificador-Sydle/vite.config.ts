import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/** Fora do OneDrive — evita "UNKNOWN: unknown error, read" no dev server. */
const localDevRoot = path.join(os.homedir(), 'AppData', 'Local', 'EspecificadorSydle')
const viteCacheDir = path.join(localDevRoot, 'vite-cache')

function dataApiPlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'data')

  function readTree() {
    const projectMeta = JSON.parse(fs.readFileSync(path.join(dataDir, 'project.json'), 'utf-8'))
    const subsDir = path.join(dataDir, 'subprojects')
    if (!fs.existsSync(subsDir)) return { projectName: projectMeta.name, subprojects: [] }

    const subprojects = fs.readdirSync(subsDir, { withFileTypes: true })
      .filter(d => {
        if (d.isDirectory()) return true
        // Windows junction/symlink: Dirent.isDirectory() é false — incluir se o alvo for pasta
        if (d.isSymbolicLink()) {
          try {
            return fs.statSync(path.join(subsDir, d.name)).isDirectory()
          } catch {
            return false
          }
        }
        return false
      })
      .map(d => {
        const subPath = path.join(subsDir, d.name)
        const subMetaPath = path.join(subPath, 'subproject.json')
        if (!fs.existsSync(subMetaPath)) {
          console.warn(`[data-api] Ignorando subprojeto sem subproject.json: ${d.name}`)
          return null
        }
        const subMeta = JSON.parse(fs.readFileSync(subMetaPath, 'utf-8'))
        const epicsDir = path.join(subPath, 'epics')
        let epics: unknown[] = []
        if (fs.existsSync(epicsDir)) {
          epics = fs.readdirSync(epicsDir, { withFileTypes: true })
            .filter(e => e.isDirectory())
            .map(e => {
              const epicPath = path.join(epicsDir, e.name)
              const epicMetaPath = path.join(epicPath, 'epic.json')
              if (!fs.existsSync(epicMetaPath)) {
                console.warn(`[data-api] Ignorando épico sem epic.json: ${d.name}/${e.name}`)
                return null
              }
              const epicMeta = JSON.parse(fs.readFileSync(epicMetaPath, 'utf-8'))
              const formsPath = path.join(epicPath, 'forms.json')
              const classGroupsPath = path.join(epicPath, 'class-groups.json')
              const flowsPath = path.join(epicPath, 'flows.json')
              const portalsPath = path.join(epicPath, 'portals.json')
              const workspacesPath = path.join(epicPath, 'workspaces.json')
              const forms = fs.existsSync(formsPath) ? JSON.parse(fs.readFileSync(formsPath, 'utf-8')) : []
              let classGroups: unknown[] = []
              let classGroupAssignments: Record<string, string> = {}
              let classGroupMemberOrder: Record<string, string[]> = {}
              if (fs.existsSync(classGroupsPath)) {
                try {
                  const cgRaw = JSON.parse(fs.readFileSync(classGroupsPath, 'utf-8')) as Record<string, unknown>
                  const g = cgRaw.groups
                  classGroups = Array.isArray(g) ? g : []
                  const a = cgRaw.assignments
                  classGroupAssignments =
                    a && typeof a === 'object' && !Array.isArray(a)
                      ? (a as Record<string, string>)
                      : {}
                  const mo = cgRaw.memberOrderByGroup
                  if (mo && typeof mo === 'object' && !Array.isArray(mo)) {
                    for (const [k, v] of Object.entries(mo as Record<string, unknown>)) {
                      classGroupMemberOrder[k] = Array.isArray(v) ? v.map((x) => String(x)) : []
                    }
                  }
                } catch {
                  classGroups = []
                  classGroupAssignments = {}
                  classGroupMemberOrder = {}
                }
              }
              const portals = fs.existsSync(portalsPath) ? JSON.parse(fs.readFileSync(portalsPath, 'utf-8')) : []
              const workspaces = fs.existsSync(workspacesPath)
                ? JSON.parse(fs.readFileSync(workspacesPath, 'utf-8'))
                : []
              const flowsRaw = fs.existsSync(flowsPath) ? JSON.parse(fs.readFileSync(flowsPath, 'utf-8')) : []
              const flows = Array.isArray(flowsRaw)
                ? flowsRaw.map((fl: Record<string, unknown>) => {
                    const id = String(fl.id ?? '')
                    const name = String(fl.name ?? '')
                    const stepsRaw = fl.steps
                    const steps = Array.isArray(stepsRaw)
                      ? stepsRaw.map((s: Record<string, unknown>) => {
                          const id = String(s.id ?? '')
                          const title = String(s.title ?? '')
                          const rest = { ...s }
                          delete rest.id
                          delete rest.title
                          return { id, title, ...rest }
                        })
                      : []
                    return { id, name, steps }
                  })
                : []
              return {
                id: e.name,
                name: epicMeta.name,
                forms,
                flows,
                portals: Array.isArray(portals) ? portals : [],
                workspaces: Array.isArray(workspaces) ? workspaces : [],
                classGroups,
                classGroupAssignments,
                classGroupMemberOrder,
              }
            })
            .filter((ep): ep is NonNullable<typeof ep> => ep != null)
        }
        return { id: d.name, name: subMeta.name, epics }
      })
      .filter((s): s is NonNullable<typeof s> => s != null)

    return { projectName: projectMeta.name, subprojects }
  }

  const subsRoot = () => path.join(dataDir, 'subprojects')

  function slugFromDisplayName(raw: string): string {
    const n = raw.normalize('NFKD').replace(/\p{M}/gu, '').trim().toLowerCase()
    const slug = n.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    return slug || 'item'
  }

  function uniqueChildDir(parentDir: string, baseSlug: string): string {
    let slug = baseSlug
    let i = 2
    while (fs.existsSync(path.join(parentDir, slug))) {
      slug = `${baseSlug}-${i}`
      i += 1
    }
    return slug
  }

  const SAFE_SEGMENT = /^[a-z0-9][a-z0-9-]*$/

  function resolveSubprojectDir(subprojectId: string): string {
    if (!SAFE_SEGMENT.test(subprojectId)) throw new Error('ID de subprojeto inválido')
    const root = path.resolve(subsRoot())
    const full = path.resolve(root, subprojectId)
    if (full !== root && !full.startsWith(root + path.sep)) throw new Error('Caminho inválido')
    return full
  }

  function resolveEpicDir(subprojectId: string, epicId: string): string {
    if (!SAFE_SEGMENT.test(epicId)) throw new Error('ID de épico inválido')
    const sub = resolveSubprojectDir(subprojectId)
    const epicsDir = path.join(sub, 'epics')
    const full = path.resolve(epicsDir, epicId)
    if (full !== epicsDir && !full.startsWith(epicsDir + path.sep)) throw new Error('Caminho inválido')
    return full
  }

  return {
    name: 'data-api',

    /** Snapshot estático para hosting (Vercel): GET /api/data sem middleware Vite. */
    closeBundle() {
      try {
        const outDir = path.resolve(__dirname, 'dist', 'api')
        fs.mkdirSync(outDir, { recursive: true })
        fs.writeFileSync(path.join(outDir, 'data.json'), JSON.stringify(readTree()), 'utf-8')
      } catch (err) {
        console.warn('[data-api] Falha ao gerar dist/api/data.json:', err)
      }
    },

    configureServer(server) {
      server.watcher.add(dataDir)
      server.watcher.on('change', (filePath) => {
        if (filePath.startsWith(dataDir)) {
          server.ws.send({ type: 'custom', event: 'data-update' })
        }
      })
      server.watcher.on('add', (filePath) => {
        if (filePath.startsWith(dataDir)) {
          server.ws.send({ type: 'custom', event: 'data-update' })
        }
      })
      server.watcher.on('unlink', (filePath) => {
        if (filePath.startsWith(dataDir)) {
          server.ws.send({ type: 'custom', event: 'data-update' })
        }
      })

      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/data' && req.method === 'GET') {
          try {
            const tree = readTree()
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(tree))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(err) }))
          }
          return
        }

        if (req.url === '/api/export-html' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const { filename, html } = JSON.parse(body)
              const outDir = path.resolve(__dirname, 'formularios-html')
              if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
              const filePath = path.join(outDir, filename)
              fs.writeFileSync(filePath, html, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, path: filePath }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })
          return
        }

        if (req.url?.startsWith('/api/save-documentador') && req.method === 'POST') {
          const url = new URL(req.url, 'http://localhost')
          const kind = url.searchParams.get('kind') === 'pptx' ? 'pptx' : 'json'
          const rawName = url.searchParams.get('filename') || (kind === 'pptx' ? 'documento.pptx' : 'documento.json')
          const chunks: Buffer[] = []
          req.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
          })
          req.on('end', () => {
            try {
              const ext = kind === 'pptx' ? '.pptx' : '.json'
              let base = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, '_')
              if (!base.toLowerCase().endsWith(ext)) base += ext
              const stem = base.slice(0, -ext.length).slice(0, 72)
              base = `${stem || 'documento'}${ext}`
              const outDir = path.resolve(__dirname, 'exports', 'documentador')
              if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
              const filePath = path.join(outDir, base)
              fs.writeFileSync(filePath, Buffer.concat(chunks))
              const rel = path.join('exports', 'documentador', base)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, path: filePath, relativePath: rel }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ ok: false, error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/save-presentation-export' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body) as { filename?: string; json?: string }
              const rawName = typeof parsed.filename === 'string' ? parsed.filename : ''
              const json = typeof parsed.json === 'string' ? parsed.json : ''
              if (!rawName || json === '') {
                res.statusCode = 400
                res.end(JSON.stringify({ ok: false, error: 'filename e json são obrigatórios' }))
                return
              }
              const base = path.basename(rawName).replace(/[^a-zA-Z0-9._\-]/g, '_')
              const safeName = base.toLowerCase().endsWith('.json') ? base : `${base}.json`
              const outDir = path.resolve(__dirname, 'exports', 'presentations')
              if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
              const filePath = path.join(outDir, safeName)
              fs.writeFileSync(filePath, json, 'utf-8')
              const rel = path.join('exports', 'presentations', safeName)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, path: filePath, relativePath: rel }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ ok: false, error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/save-forms' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const { subprojectId, epicId, forms } = JSON.parse(body)
              const formsPath = path.join(dataDir, 'subprojects', subprojectId, 'epics', epicId, 'forms.json')
              fs.writeFileSync(formsPath, JSON.stringify(forms, null, 2) + '\n', 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/save-class-groups' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body) as {
                subprojectId?: string
                epicId?: string
                groups?: unknown
                assignments?: unknown
                memberOrderByGroup?: unknown
              }
              const subprojectId = parsed.subprojectId
              const epicId = parsed.epicId
              if (typeof subprojectId !== 'string' || typeof epicId !== 'string') {
                res.statusCode = 400
                res.end(JSON.stringify({ ok: false, error: 'subprojectId e epicId são obrigatórios' }))
                return
              }
              const groups = Array.isArray(parsed.groups) ? parsed.groups : []
              const assignments =
                parsed.assignments && typeof parsed.assignments === 'object' && !Array.isArray(parsed.assignments)
                  ? (parsed.assignments as Record<string, string>)
                  : {}
              const moRaw = parsed.memberOrderByGroup
              const memberOrderByGroup: Record<string, string[]> = {}
              if (moRaw && typeof moRaw === 'object' && !Array.isArray(moRaw)) {
                for (const [k, v] of Object.entries(moRaw as Record<string, unknown>)) {
                  memberOrderByGroup[k] = Array.isArray(v) ? v.map((x) => String(x)) : []
                }
              }
              const outPath = path.join(dataDir, 'subprojects', subprojectId, 'epics', epicId, 'class-groups.json')
              const payload = { groups, assignments, memberOrderByGroup }
              fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/save-flows' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const { subprojectId, epicId, flows } = JSON.parse(body)
              if (!Array.isArray(flows)) throw new Error('flows must be an array')
              const flowsPath = path.join(dataDir, 'subprojects', subprojectId, 'epics', epicId, 'flows.json')
              fs.writeFileSync(flowsPath, JSON.stringify(flows, null, 2) + '\n', 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/save-portals' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const { subprojectId, epicId, portals } = JSON.parse(body)
              if (!Array.isArray(portals)) throw new Error('portals must be an array')
              const portalsPath = path.join(dataDir, 'subprojects', subprojectId, 'epics', epicId, 'portals.json')
              fs.writeFileSync(portalsPath, JSON.stringify(portals, null, 2) + '\n', 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/save-workspaces' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const { subprojectId, epicId, workspaces } = JSON.parse(body)
              if (!Array.isArray(workspaces)) throw new Error('workspaces must be an array')
              const workspacesPath = path.join(dataDir, 'subprojects', subprojectId, 'epics', epicId, 'workspaces.json')
              fs.writeFileSync(workspacesPath, JSON.stringify(workspaces, null, 2) + '\n', 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/create-subproject' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const { name } = JSON.parse(body) as { name?: string }
              const displayName = typeof name === 'string' ? name.trim() : ''
              if (!displayName) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'Nome é obrigatório' }))
                return
              }
              const base = slugFromDisplayName(displayName)
              const sr = subsRoot()
              if (!fs.existsSync(sr)) fs.mkdirSync(sr, { recursive: true })
              const id = uniqueChildDir(sr, base)
              const dir = path.join(sr, id)
              fs.mkdirSync(dir, { recursive: true })
              fs.writeFileSync(path.join(dir, 'subproject.json'), JSON.stringify({ name: displayName }, null, 2) + '\n', 'utf-8')
              fs.writeFileSync(path.join(dir, 'context.md'), `# ${displayName}\n\n`, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, id }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/delete-subproject' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const { subprojectId } = JSON.parse(body) as { subprojectId?: string }
              if (typeof subprojectId !== 'string' || !subprojectId) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'subprojectId é obrigatório' }))
                return
              }
              const dir = resolveSubprojectDir(subprojectId)
              if (!fs.existsSync(dir)) {
                res.statusCode = 404
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'Subprojeto não encontrado' }))
                return
              }
              fs.rmSync(dir, { recursive: true, force: true })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/create-epic' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body) as { subprojectId?: string; name?: string }
              const displayName = typeof parsed.name === 'string' ? parsed.name.trim() : ''
              const subprojectId = typeof parsed.subprojectId === 'string' ? parsed.subprojectId.trim() : ''
              if (!displayName || !subprojectId) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'subprojectId e name são obrigatórios' }))
                return
              }
              const subDir = resolveSubprojectDir(subprojectId)
              if (!fs.existsSync(subDir)) {
                res.statusCode = 404
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'Subprojeto não encontrado' }))
                return
              }
              const epicsDir = path.join(subDir, 'epics')
              if (!fs.existsSync(epicsDir)) fs.mkdirSync(epicsDir, { recursive: true })
              const base = slugFromDisplayName(displayName)
              const id = uniqueChildDir(epicsDir, base)
              const epicPath = path.join(epicsDir, id)
              fs.mkdirSync(epicPath, { recursive: true })
              fs.writeFileSync(path.join(epicPath, 'epic.json'), JSON.stringify({ name: displayName }, null, 2) + '\n', 'utf-8')
              fs.writeFileSync(path.join(epicPath, 'forms.json'), '[]\n', 'utf-8')
              fs.writeFileSync(path.join(epicPath, 'flows.json'), '[]\n', 'utf-8')
              fs.writeFileSync(path.join(epicPath, 'portals.json'), '[]\n', 'utf-8')
              fs.writeFileSync(path.join(epicPath, 'workspaces.json'), '[]\n', 'utf-8')
              fs.writeFileSync(path.join(epicPath, 'context.md'), `# ${displayName}\n\n`, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, id }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/delete-epic' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body) as { subprojectId?: string; epicId?: string }
              const subprojectId = typeof parsed.subprojectId === 'string' ? parsed.subprojectId.trim() : ''
              const epicId = typeof parsed.epicId === 'string' ? parsed.epicId.trim() : ''
              if (!subprojectId || !epicId) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'subprojectId e epicId são obrigatórios' }))
                return
              }
              const dir = resolveEpicDir(subprojectId, epicId)
              if (!fs.existsSync(dir)) {
                res.statusCode = 404
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'Épico não encontrado' }))
                return
              }
              fs.rmSync(dir, { recursive: true, force: true })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/rename-subproject' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body) as { subprojectId?: string; name?: string }
              const subprojectId = typeof parsed.subprojectId === 'string' ? parsed.subprojectId.trim() : ''
              const displayName = typeof parsed.name === 'string' ? parsed.name.trim() : ''
              if (!subprojectId || !displayName) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'subprojectId e name são obrigatórios' }))
                return
              }
              const dir = resolveSubprojectDir(subprojectId)
              const metaPath = path.join(dir, 'subproject.json')
              if (!fs.existsSync(metaPath)) {
                res.statusCode = 404
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'Subprojeto não encontrado' }))
                return
              }
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as { name?: string }
              meta.name = displayName
              fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: String(err) }))
            }
          })
          return
        }

        if (req.url === '/api/rename-epic' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body) as { subprojectId?: string; epicId?: string; name?: string }
              const subprojectId = typeof parsed.subprojectId === 'string' ? parsed.subprojectId.trim() : ''
              const epicId = typeof parsed.epicId === 'string' ? parsed.epicId.trim() : ''
              const displayName = typeof parsed.name === 'string' ? parsed.name.trim() : ''
              if (!subprojectId || !epicId || !displayName) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'subprojectId, epicId e name são obrigatórios' }))
                return
              }
              const epicDir = resolveEpicDir(subprojectId, epicId)
              const metaPath = path.join(epicDir, 'epic.json')
              if (!fs.existsSync(metaPath)) {
                res.statusCode = 404
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ ok: false, error: 'Épico não encontrado' }))
                return
              }
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as { name?: string }
              meta.name = displayName
              fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: String(err) }))
            }
          })
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), dataApiPlugin()],
  cacheDir: viteCacheDir,
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      /** `noDiscovery` desliga a varredura automática: pptxgenjs/jszip são CJS e
       *  precisam do pré-bundle para expor o export default. */
      'pptxgenjs',
      'jszip',
    ],
  },
  server: {
    fs: {
      /** Projeto no OneDrive: permitir leitura do cache local fora da raiz do repo. */
      allow: [path.resolve(__dirname), localDevRoot],
    },
  },
  build: {
    /** Editor HTML já em chunk lazy; CodeMirror + @codemirror/lang-html ~570 kB minificado. */
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        'portal-cliente': path.resolve(__dirname, 'portal-cliente.html'),
        'portal-parceiro': path.resolve(__dirname, 'portal-parceiro.html'),
        'portal-mti': path.resolve(__dirname, 'portal-mti.html'),
        ...(fs.existsSync(path.resolve(__dirname, 'documentador.html'))
          ? { documentador: path.resolve(__dirname, 'documentador.html') }
          : {}),
        ...(fs.existsSync(path.resolve(__dirname, 'presentation.html'))
          ? { presentation: path.resolve(__dirname, 'presentation.html') }
          : {}),
      },
    },
  },
})
