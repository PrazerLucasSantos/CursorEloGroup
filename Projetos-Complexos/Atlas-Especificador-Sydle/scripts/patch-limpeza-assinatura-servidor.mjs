#!/usr/bin/env node
/** Limpeza solicitada (23/06):
 *  1. Remove duplicidade Template de signatários (mantém só a aba do Workflow).
 *  2. Remove opções Fornecedor/Fabricante (perfil = MTI/Parceiro/Cliente).
 *  3. Senha = forma de assinatura → consistente nas 3 telas (e3, m1, m3).
 *  4. Remove contradição de ordem de assinatura (paralelo é a regra F1).
 *  5. Exclui classe Servidor (e Servidor-Permissão) → referências viram Pessoa.
 *  6. Exclui classes embutidas órfãs (não referenciadas).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

let forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
const byId = (id) => forms.find((f) => f.id === id)
const field = (form, id) => form?.fields?.find((f) => f.id === id)
const log = []

// ---------- 2) Fornecedor / Fabricante ----------
const uo = byId('form-patlasv4-proto-organizacao') || forms.find((f) => f.fields?.some((x) => x.id === 'patlasv4proto-uo-tipo-organizacao'))
const ftipo = field(uo, 'patlasv4proto-uo-tipo-organizacao')
if (ftipo) { ftipo.spec = 'Perfil do cadastro: MTI, Parceiro ou Cliente.'; log.push('UO Tipo do cadastro: spec sem Fornecedor/Fabricante') }
// remove "Cadastro de fornecedor" de qualquer array de opções e de strings de preset
let modCount = 0
const stripFornecedor = (node) => {
  if (Array.isArray(node)) {
    for (let i = node.length - 1; i >= 0; i--) {
      if (node[i] === 'Cadastro de fornecedor') { node.splice(i, 1); modCount++ }
      else stripFornecedor(node[i])
    }
  } else if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      if (typeof node[k] === 'string' && node[k].includes('Cadastro de fornecedor')) {
        node[k] = node[k].split(' / ').filter((s) => s.trim() !== 'Cadastro de fornecedor').join(' / ')
        modCount++
      } else stripFornecedor(node[k])
    }
  }
}
stripFornecedor(forms)
log.push(`Removido "Cadastro de fornecedor" em ${modCount} ponto(s)`) 

// ---------- 3) Senha como método de assinatura (consistência) ----------
const sig = byId('form-patlasv4-proto-assinatura-signatario')
const fSigMet = field(sig, 'patlasv4proto-assin-sig-metodo')
if (fSigMet && !fSigMet.options.includes('Senha')) {
  fSigMet.options = ['Certificado digital (token)', 'Gov.br', 'Senha', 'MT Login']
  fSigMet.spec = 'Métodos disponíveis: certificado digital, Gov.br, Senha e MT Login.'
  log.push('(11.e3) Signatário: método inclui Senha')
}
const msel = byId('form-patlasv4-proto-metodo-selecionar-metodo-assinatura')
const fMsel = field(msel, 'patlasv4proto-msel-metodo')
if (fMsel && !fMsel.options.includes('Senha')) {
  fMsel.options = ['Certificado digital (token)', 'Gov.br', 'Senha', 'MT Login']
  fMsel.spec = 'Métodos disponíveis: certificado digital, Gov.br, Senha e MT Login.'
  log.push('(11.m3) Selecionar método: método inclui Senha')
}
const mea = byId('form-patlasv4-proto-metodo-enviar-assinatura')
const fMea = field(mea, 'patlasv4proto-mea-metodo')
if (fMea) { fMea.spec = 'Roteamento GED (Gov.br, certificado) ou fluxo interno (Senha, MT Login/Sigadoc).'; log.push('(11.m1) Enviar para assinatura: spec do método alinhado (Senha mantida)') }

// ---------- 4) Contradição de ordem de assinatura (paralelo) ----------
if (sig) {
  const before = sig.fields.length
  sig.fields = sig.fields.filter((f) => !['patlasv4proto-assin-sig-ordem', 'patlasv4proto-assin-sig-assina-por-ultimo'].includes(f.id))
  if (sig.fields.length !== before) log.push('(11.e3) Signatário: removidos "Ordem de assinatura" e "Assina por último" (assinatura é paralela)')
}
const env = byId('form-patlasv4-proto-assinatura-documentos')
const fPol = field(env, 'patlasv4proto-assin-politica-envio')
if (fPol) {
  fPol.options = ['Enviar para todos simultaneamente']
  fPol.spec = 'Atlas F1: todos os signatários recebem ao mesmo tempo (assinatura em paralelo, decisão 19/06/2026). Casos como "presidente por último" são operacionais — o sistema não ordena.'
  log.push('(11.e2) Envelope: política de envio = somente "Enviar para todos simultaneamente"')
}

// ---------- 1) + 5) Excluir Template de signatários e Servidor ----------
const TO_DELETE = new Set([
  'form-patlasv4-proto-template-signatarios',
  'form-patlasv4-proto-template-signatario-linha',
  'form-patlasv4-proto-servidor',
  'form-patlasv4-proto-servidor-permissao',
])
// remove o campo "Template de signatários" do Workflow (11)
const wf = byId('mqebasqyphbwea') || forms.find((f) => f.fields?.some((x) => x.id === 'patlasv4proto-wf-template-signatarios'))
if (wf) {
  const b = wf.fields.length
  wf.fields = wf.fields.filter((f) => f.id !== 'patlasv4proto-wf-template-signatarios')
  if (wf.fields.length !== b) log.push('(11) Workflow: removido campo "Template de signatários" (duplicava a aba Signatários)')
}
// repointar referências Servidor -> Pessoa
let repoint = 0
for (const f of forms) for (const fl of f.fields || []) {
  if (fl.linkedFormId === 'form-patlasv4-proto-servidor') { fl.linkedFormId = 'form-patlasv4-proto-pessoa'; repoint++ }
}
log.push(`Referências Servidor → Pessoa repontadas: ${repoint}`)

// ---------- 6) Excluir embutidas órfãs ----------
const embGroups = new Set(cg.groups.filter((g) => g.id.endsWith('-emb')).map((g) => g.id))
function referencedSet(list) {
  const ref = new Set()
  for (const f of list) {
    for (const fl of f.fields || []) if (fl.linkedFormId) ref.add(fl.linkedFormId)
    for (const m of f.methods || []) if (m.inputFormId) ref.add(m.inputFormId)
  }
  return ref
}
// remove primeiro os explícitos
forms = forms.filter((f) => !TO_DELETE.has(f.id))
// agora detecta órfãs embutidas
const ref = referencedSet(forms)
const orphans = forms.filter((f) => embGroups.has(cg.assignments[f.id]) && !ref.has(f.id)).map((f) => f.id)
for (const id of orphans) TO_DELETE.add(id)
forms = forms.filter((f) => !TO_DELETE.has(f.id))
if (orphans.length) log.push(`Embutidas órfãs excluídas: ${orphans.join(', ')}`)
log.push(`Classes excluídas no total: ${[...TO_DELETE].join(', ')}`)

// ---------- class-groups: limpar ----------
for (const id of TO_DELETE) delete cg.assignments[id]
for (const gid of Object.keys(cg.memberOrderByGroup)) {
  cg.memberOrderByGroup[gid] = cg.memberOrderByGroup[gid].filter((id) => !TO_DELETE.has(id))
}
// remover grupos que ficaram vazios (ex.: Servidor backend)
const emptyGroups = cg.groups.filter((g) => (cg.memberOrderByGroup[g.id] || []).length === 0 && !cg.groups.some((c) => c.parentGroupId === g.id))
for (const g of emptyGroups) {
  // só remove grupos de domínio servidor / vazios sem filhos e sem membros
  if (g.id === 'grp-servidor') {
    cg.groups = cg.groups.filter((x) => x.id !== g.id)
    delete cg.memberOrderByGroup[g.id]
    log.push(`Grupo vazio removido: ${g.name}`)
  }
}

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')
console.log(log.join('\n'))
console.log('\nTotal de classes restantes:', forms.length)
