/**
 * Garante no Atlas os arquivos do Não é Não que o app importa.
 * Eles já vão no Git como arquivos normais, então um clone abre sem symlink.
 * Se algum sumir, ou se o Windows gravar o texto de um symlink antigo,
 * este script copia a fonte em Projetos/nao-e-nao-procon.
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

function isUsable(dest, target, kind) {
  let st
  try {
    st = fs.lstatSync(dest)
  } catch {
    return false
  }
  if (st.isSymbolicLink()) {
    try {
      return fs.realpathSync(dest) === fs.realpathSync(target)
    } catch {
      return false
    }
  }
  if (kind === 'dir') {
    return st.isDirectory() && fs.existsSync(path.join(dest, 'subproject.json'))
  }
  return st.isFile() && st.size > 0 && !isPlainGitSymlink(dest)
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
  if (isUsable(dest, target, kind)) continue

  if (fs.existsSync(dest) || isPlainGitSymlink(dest)) removeDest(dest)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  if (kind === 'dir') fs.cpSync(target, dest, { recursive: true })
  else fs.copyFileSync(target, dest)
  console.log(`cópia ${rel}`)
  changed += 1
}

if (changed === 0) console.log('Arquivos do Não é Não já estão no Atlas.')
