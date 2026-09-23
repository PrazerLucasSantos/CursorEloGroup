/**
 * Parametrização do processo — História 02 (fluxo + documentos).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { allParametrizacaoForms } from './projeto-atlas-parametrizacao-forms.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/projeto-atlas/epics/projeto-atlas-parametrizacao')
const outPath = path.join(epicDir, 'forms.json')

const forms = allParametrizacaoForms()

fs.mkdirSync(epicDir, { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(forms, null, 2) + '\n', 'utf-8')
console.log('Wrote', outPath, '—', forms.length, 'forms')
