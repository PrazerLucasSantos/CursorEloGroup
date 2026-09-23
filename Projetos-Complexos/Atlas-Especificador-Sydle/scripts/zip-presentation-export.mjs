#!/usr/bin/env node
/**
 * Junta o viewer já compilado (`npm run build`) com um presentation.json.
 *
 * Uso:
 *   npm run zip:presentation -- ./MeuFluxo-presentation.json
 *
 * Saída: `exports/zips/<mesmo-nome-do-json>.zip` (ex.: `foo.json` → `exports/zips/foo.zip`).
 * `index.html` na raiz do ZIP (Netlify).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createWriteStream } from 'node:fs'
import archiver from 'archiver'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dist = path.join(root, 'dist')
const jsonArg = process.argv[2]

if (!jsonArg || !fs.existsSync(jsonArg)) {
  console.error('Uso: npm run zip:presentation -- <caminho/presentation.json>')
  console.error('Ex.: npm run zip:presentation -- ./minha-apresentacao-presentation.json')
  process.exit(1)
}

const presHtml = path.join(dist, 'presentation.html')
if (!fs.existsSync(presHtml)) {
  console.error('Falta dist/presentation.html. Execute primeiro: npm run build')
  process.exit(1)
}

const zipsDir = path.join(root, 'exports', 'zips')
if (!fs.existsSync(zipsDir)) fs.mkdirSync(zipsDir, { recursive: true })
const jsonResolved = path.resolve(jsonArg)
const jsonBaseName = path.basename(jsonResolved)
let jsonStem = jsonBaseName.replace(/\.json$/i, '')
if (!jsonStem) jsonStem = 'apresentacao'
const zipStem = jsonStem.replace(/[^a-zA-Z0-9._\-]/g, '_') || 'apresentacao'
const outZip = path.join(zipsDir, `${zipStem}.zip`)
const output = createWriteStream(outZip)
const archive = archiver('zip', { zlib: { level: 9 } })

archive.on('error', (err) => {
  console.error(err)
  process.exit(1)
})

output.on('close', () => {
  console.log(`Criado: ${outZip} (${archive.pointer()} bytes)`)
})

archive.pipe(output)
/** Mesmo HTML que o build gera como presentation.html; no ZIP chama-se index.html para a Netlify usar como página inicial. */
archive.file(presHtml, { name: 'index.html' })

const assetsDir = path.join(dist, 'assets')
if (fs.existsSync(assetsDir)) {
  for (const name of fs.readdirSync(assetsDir)) {
    archive.file(path.join(assetsDir, name), { name: `assets/${name}` })
  }
}

const fav = path.join(dist, 'favicon.svg')
if (fs.existsSync(fav)) {
  archive.file(fav, { name: 'favicon.svg' })
}

archive.file(jsonResolved, { name: 'presentation.json' })
void archive.finalize()
