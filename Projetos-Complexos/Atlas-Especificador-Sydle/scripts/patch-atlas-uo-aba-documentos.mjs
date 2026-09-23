#!/usr/bin/env node
/**
 * Cria a aba "Documentos" na Organização e move para ela as subseções
 * "Habilitação documental (MIPP)" e "Documentos de execução da parceria"
 * (com seus campos). Remove-as da aba "Dados do cadastro".
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const ABA_DOCS = 'sec-patlasv4proto-uo-documentos-aba'
const SUB_HAB = 'sec-patlasv4proto-uo-sub-habilitacao'
const SUB_EXEC = 'sec-patlasv4proto-uo-sub-execucao'
const SUB_BANCARIO = 'sec-patlasv4proto-uo-sub-bancario'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const uo = forms.find((f) => f.id === FORM_UO)
if (!uo) throw new Error('Form Organização não encontrado')

const secs = uo.sections
const newTab = { id: ABA_DOCS, title: 'Documentos', icon: 'folder_copy' }

// 1) re-parenta as duas subseções para a nova aba
for (const s of secs) {
  if (s.id === SUB_HAB || s.id === SUB_EXEC) {
    s.parentSectionId = ABA_DOCS
  }
}

// 2) remove as duas subseções da posição atual
const hab = secs.find((s) => s.id === SUB_HAB)
const exec = secs.find((s) => s.id === SUB_EXEC)
const filtered = secs.filter((s) => s.id !== SUB_HAB && s.id !== SUB_EXEC && s.id !== ABA_DOCS)

// 3) insere [nova aba, habilitação, execução] logo após a subseção Contas bancárias
//    (fim do bloco "Dados do cadastro"); fallback: antes de Tributos
let insertIdx = filtered.findIndex((s) => s.id === SUB_BANCARIO)
if (insertIdx === -1) {
  insertIdx = filtered.findIndex((s) => s.id === 'sec-patlasv4proto-uo-tributos') - 1
}
filtered.splice(insertIdx + 1, 0, newTab, hab, exec)
uo.sections = filtered

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

const order = uo.sections.map((s) => (s.parentSectionId ? `   └ ${s.title}` : `• ${s.title}`))
console.log('Abas/subseções da Organização:')
console.log(order.join('\n'))
