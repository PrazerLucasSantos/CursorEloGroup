/**
 * Gera o rascunho JSON do Documentador a partir do .md de Demanda F3
 * e grava em exports/ para injeção no browser.
 *
 * Uso: npx tsx scripts/seed-documentador-demanda.mts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { aplicarAcoes } from '../src/documentador/acoes.ts'
import { documentoVazio, normalizarDocumento } from '../src/documentador/documento.ts'
import { interpretarPrompt } from '../src/documentador/promptParser.ts'
import { CONFIG_IA_PADRAO } from '../src/documentador/armazenamento.ts'
import { FAMILIAS_PADRAO } from '../src/documentador/estilo.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mdPath = join(root, 'exports/requisitos-atlas-demanda-f3-documentador.md')
const outPath = join(root, 'exports/documentador-demanda-f3-estado.json')

const md = readFileSync(mdPath, 'utf8')
const vazio = documentoVazio()
const { acoes, naoReconhecido } = interpretarPrompt(md)
const r = aplicarAcoes(vazio, vazio.classes[0].id, acoes)
const doc = normalizarDocumento(r.doc)

const estado = {
  doc,
  classeAtivaId: r.classeAtivaId,
  configIA: CONFIG_IA_PADRAO,
  familias: FAMILIAS_PADRAO,
}

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(estado, null, 2), 'utf8')

console.log(
  JSON.stringify(
    {
      classes: doc.classes.length,
      nomes: doc.classes.map((c) => c.nome),
      naoReconhecido: naoReconhecido.slice(0, 30),
      outPath,
    },
    null,
    2,
  ),
)
