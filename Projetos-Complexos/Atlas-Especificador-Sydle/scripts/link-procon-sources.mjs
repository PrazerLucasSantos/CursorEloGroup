/**
 * Garante os atalhos do Não é Não dentro do Atlas.
 * No Git eles são symlinks relativos. Se o checkout não criar o symlink
 * (comum no Windows com core.symlinks=false), este script recria o atalho
 * ou, se o sistema não permitir, copia o arquivo.
 *
 * Roda no postinstall e antes de `npm run dev`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const atlasRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(atlasRoot, '..', '..')

/** [caminho no Atlas, caminho canônico no repositório, 'dir' | 'file'] */
const links = [
  ['src/utils/nenAnaliseDecisaoMethods.ts', 'Projetos/nao-e-nao-procon/src/utils/nenAnaliseDecisaoMethods.ts', 'file'],
  ['src/utils/formMethodVisibility.ts', 'Projetos/nao-e-nao-procon/src/utils/formMethodVisibility.ts', 'file'],
  ['src/utils/formHighlightTags.ts', 'Projetos/nao-e-nao-procon/src/utils/formHighlightTags.ts', 'file'],
  ['public/portal-selo-nao-e-nao.html', 'Projetos/nao-e-nao-procon/public/portal-selo-nao-e-nao.html', 'file'],
  ['data/subprojects/nao-e-nao-seplag', 'Projetos/nao-e-nao-procon/data', 'dir'],
]

function relTarget(dest, target) {
  let rel = path.relative(path.dirname(dest), target)
  if (path.sep === '\\') rel = rel.replaceAll('\\', '/')
  return rel
}

function isPlainGitSymlink(dest) {
  let st
  try {
    st = fs.lstatSync(dest)
  } catch {
    return false
  }
  if (st.isSymbolicLink() || st.isDirectory() || !st.isFile() || st.size > 512) return false
  const text = fs.readFileSync(dest, 'utf8').trim()
  return text.startsWith('../') || text.startsWith('..\\')
}

function pointsAt(dest, target) {
  try {
    const st = fs.lstatSync(dest)
    if (!st.isSymbolicLink()) return false
    const raw = fs.readlinkSync(dest)
    if (path.isAbsolute(raw)) return false
    const linked = fs.realpathSync(dest)
    return linked === fs.realpathSync(target)
  } catch {
    return false
  }
}

function removeDest(dest) {
  const st = fs.lstatSync(dest)
  if (st.isSymbolicLink()) {
    fs.unlinkSync(dest)
    return
  }
  fs.rmSync(dest, { recursive: st.isDirectory(), force: true })
}

let changed = 0
for (const [rel, targetRel, kind] of links) {
  const dest = path.join(atlasRoot, rel)
  const target = path.join(repoRoot, targetRel)
  if (!fs.existsSync(target)) {
    console.error(`Fonte ausente: ${targetRel}`)
    process.exitCode = 1
    continue
  }
  if (pointsAt(dest, target)) continue

  if (fs.existsSync(dest) || isPlainGitSymlink(dest)) removeDest(dest)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  const link = relTarget(dest, target)
  try {
    fs.symlinkSync(link, dest, kind === 'dir' && process.platform === 'win32' ? 'junction' : undefined)
    console.log(`symlink ${rel} -> ${link}`)
  } catch (err) {
    if (kind === 'dir') fs.cpSync(target, dest, { recursive: true })
    else fs.copyFileSync(target, dest)
    console.log(`cópia ${rel} (${err instanceof Error ? err.message : err})`)
  }
  changed += 1
}

if (changed === 0) console.log('Atalhos do Não é Não já estão no lugar.')
