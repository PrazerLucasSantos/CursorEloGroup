#!/usr/bin/env node
/**
 * Melhora o Template documental para o usuário CRIAR o modelo de documento:
 * - Conteúdo do bloco em HTML (rich) com merge fields (Mustache)
 * - Tipos de bloco incluem Cabeçalho e Rodapé
 * - Lista de Variáveis disponíveis (merge fields) na tela
 * - Blocos reutilizáveis (cláusulas) — tabela
 * - Método Pré-visualizar documento
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

const FORM_TPL = 'form-patlasv4-proto-template'
const FORM_BLOCO = 'form-patlasv4-proto-template-bloco'
const FORM_REUTIL = 'form-patlasv4-proto-template-bloco-reutilizavel'
const SEC_DADOS = 'sec-template-dados'
const SEC_BLOCOS = 'sec-template-blocos'
const SEC_REUTIL = 'sec-template-reutilizaveis'

const VARS = '{{cliente.nome}} · {{cliente.cnpj}} · {{parceiro.nome}} · {{proposta.numero}} · {{proposta.objeto}} · {{contrato.numero}} · {{produtos}} (tabela) · {{vigencia.inicio}} · {{vigencia.fim}} · {{valor.total}} · {{data}} · {{responsavel.nome}}'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

// ---------- 1) Bloco do template: conteúdo HTML + cabeçalho/rodapé ----------
const bloco = forms.find((f) => f.id === FORM_BLOCO)
const tipoBloco = bloco.fields.find((f) => f.id === 'patlasv4proto-tpl-bloco-tipo-de-bloco')
if (tipoBloco) {
  tipoBloco.options = ['Cabeçalho', 'Texto livre', 'Cláusula', 'Tabela de produtos', 'Imagem', 'Separador', 'Campo de dados do sistema', 'Rodapé']
  tipoBloco.spec = 'Define o que o bloco representa no documento.'
}
const conteudo = bloco.fields.find((f) => f.id === 'patlasv4proto-tpl-bloco-conteudo')
if (conteudo) {
  conteudo.type = 'html'
  delete conteudo.textLong
  conteudo.spec = 'Conteúdo do bloco em HTML (rich). Aceita variáveis (merge fields), ex.: {{cliente.nome}}, {{proposta.numero}}, {{produtos}}.'
}
// referência a bloco reutilizável (cláusula) no bloco
if (!bloco.fields.some((f) => f.id === 'patlasv4proto-tpl-bloco-reutilizavel-ref')) {
  bloco.fields.splice(3, 0, {
    id: 'patlasv4proto-tpl-bloco-reutilizavel-ref', label: 'Bloco reutilizável (cláusula)', type: 'reference',
    size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common',
    linkedFormId: FORM_REUTIL, spec: 'Opcional — usa um bloco/cláusula reutilizável já cadastrado em vez de digitar o conteúdo.',
  })
}

// ---------- 2) Form de bloco reutilizável (cláusula) ----------
if (!forms.some((f) => f.id === FORM_REUTIL)) {
  forms.push({
    id: FORM_REUTIL, name: '(7.2) Bloco reutilizável (cláusula)', sectionLayout: 'none', defaultCanvasMode: 'edit',
    metadata: 'Cláusula/bloco de texto reutilizável entre templates. Conteúdo HTML com merge fields.',
    fields: [
      { id: 'patlasv4proto-tpl-breutil-nome-do-bloco', label: 'Nome do bloco', type: 'text', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'identity', spec: 'Ex.: Cláusula padrão MTI, Objeto, Foro.' },
      { id: 'patlasv4proto-tpl-breutil-tipo', label: 'Tipo', type: 'textOptions', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', options: ['Texto', 'Cláusula', 'Cabeçalho', 'Rodapé'] },
      { id: 'patlasv4proto-tpl-breutil-conteudo', label: 'Conteúdo (HTML)', type: 'html', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'common', spec: 'Conteúdo em HTML com merge fields. Ex.: {{contrato.numero}}.' },
      { id: 'patlasv4proto-tpl-breutil-ativo', label: 'Ativo', type: 'boolean', size: 'small', readOnly: false, required: true, multiple: false, relevance: 'common' },
    ],
    exampleValuePresets: [],
  })
}

// ---------- 3) Template: variáveis disponíveis + seção blocos reutilizáveis ----------
const tpl = forms.find((f) => f.id === FORM_TPL)
tpl.metadata = 'Template documental — o usuário monta o modelo do documento por blocos ordenados (Cabeçalho, Texto/Cláusula, Tabela de produtos, Imagem, Separador, Campo do sistema, Rodapé), com conteúdo HTML e variáveis (merge fields). Plano de fundo/logo, versão e status (Rascunho→Publicar). Blocos reutilizáveis (cláusulas) podem ser compartilhados.'
// seção blocos reutilizáveis
if (!tpl.sections.some((s) => s.id === SEC_REUTIL)) {
  tpl.sections.push({ id: SEC_REUTIL, title: 'Blocos reutilizáveis (cláusulas)', icon: 'library_add' })
}
// campo de variáveis disponíveis (aviso) na aba Dados
if (!tpl.fields.some((f) => f.id === 'patlasv4proto-template-variaveis')) {
  const nomeIdx = tpl.fields.findIndex((f) => f.id === 'patlasv4proto-template-dados-nome')
  tpl.fields.splice(nomeIdx >= 0 ? nomeIdx : 0, 0, {
    id: 'patlasv4proto-template-variaveis', label: 'Variáveis disponíveis (merge fields)', type: 'alert',
    size: 'large', readOnly: false, hidden: false, required: false, multiple: false, relevance: 'common',
    sectionId: SEC_DADOS, alertVariant: 'info', alertTitle: 'Variáveis disponíveis (merge fields)',
    alertMessage: `Use nos blocos: ${VARS}. As variáveis são substituídas pelos dados reais na geração do documento.`,
  })
}
// campo embutido blocos reutilizáveis (já referenciado em preset)
if (!tpl.fields.some((f) => f.id === 'patlasv4proto-template-blocos-reutilizaveis')) {
  tpl.fields.push({
    id: 'patlasv4proto-template-blocos-reutilizaveis', label: 'Blocos reutilizáveis (cláusulas)', type: 'embeddedReference',
    size: 'large', readOnly: false, required: false, multiple: true, relevance: 'common',
    sectionId: SEC_REUTIL, linkedFormId: FORM_REUTIL, embeddedDisplay: 'table',
    spec: 'Cláusulas/blocos de texto reutilizáveis que podem ser inseridos nos blocos do template.',
  })
}
// método Pré-visualizar documento
tpl.methods = tpl.methods || []
if (!tpl.methods.some((m) => m.id === 'patlasv4proto-template-meth-previsualizar')) {
  tpl.methods.push({ id: 'patlasv4proto-template-meth-previsualizar', name: 'Pré-visualizar documento', icon: 'preview', kind: 'destaque', spec: 'Monta o documento com os blocos e o plano de fundo, substituindo as variáveis por dados de exemplo, para conferência antes de publicar.' })
}

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// ---------- class-groups: registra o bloco reutilizável nas Embutidas do Template ----------
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
cg.assignments[FORM_REUTIL] = 'grp-07-template-emb'
const emb = cg.memberOrderByGroup['grp-07-template-emb'] || []
if (!emb.includes(FORM_REUTIL)) emb.push(FORM_REUTIL)
cg.memberOrderByGroup['grp-07-template-emb'] = emb
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Template documental melhorado:')
console.log('  • Conteúdo do bloco em HTML + variáveis (merge fields)')
console.log('  • Tipos de bloco: Cabeçalho … Rodapé; referência a bloco reutilizável')
console.log('  • Aba/lista de Blocos reutilizáveis (cláusulas) + classe (7.2)')
console.log('  • Aviso com Variáveis disponíveis; método Pré-visualizar documento')
