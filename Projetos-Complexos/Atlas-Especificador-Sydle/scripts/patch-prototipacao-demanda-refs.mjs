#!/usr/bin/env node
/**
 * Épico Projeto Atlas - Prototipação: campos da Demanda como referência
 * (lista só o campo identidade da classe alvo — não embute a classe completa).
 * Não altera o épico original `prototipo`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/projeto-atlas-prototipacao/forms.json',
)

const IDS = {
  pessoa: 'form-patlasv4-proto-pessoa',
  org: 'form-patlasv4-proto-unidade-organizacional',
  cargo: 'form-patlasv4-proto-cargo',
  solucao: 'form-patlasv4-proto-cat-solucao',
  catalogo: 'form-patlasv4-proto-cat-catalogo',
  parceria: 'form-patlasv4-proto-cat-parceria',
}

function spec(fn, regra) {
  return `Função: ${fn.trim()}\nRegra: ${regra.trim()}`
}

/** Config por sufixo do campo (após prefixo demc/demcli/dempar). */
const PATCH = {
  solicitante: {
    type: 'reference',
    linkedFormId: IDS.pessoa,
    multiple: false,
    clearOptions: true,
    spec: spec(
      'Pessoa solicitante da demanda (classe Pessoa).',
      'Lista o nome das pessoas cadastradas. A pessoa está vinculada a uma Organização (tipo MTI, parceiro ou cliente). No portal, a organização do login está ativa e vinculada — o solicitante vem desse cadastro de Pessoa.',
    ),
  },
  contato: {
    type: 'reference',
    linkedFormId: IDS.pessoa,
    multiple: false,
    clearOptions: true,
    spec: spec(
      'Contato principal da solicitação (classe Pessoa).',
      'Lista o nome das pessoas cadastradas. Mesma regra do Solicitante: pessoa vinculada à organização do contexto.',
    ),
  },
  'contato-sec': {
    type: 'reference',
    linkedFormId: IDS.pessoa,
    multiple: false,
    clearOptions: true,
    spec: spec(
      'Contato secundário (classe Pessoa).',
      'Lista pessoas da mesma organização vinculada ao contexto da demanda. Opcional.',
    ),
  },
  'gestor-cliente': {
    type: 'reference',
    linkedFormId: IDS.pessoa,
    multiple: false,
    clearOptions: true,
    spec: spec(
      'Gestor do cliente (classe Pessoa).',
      'Lista pessoas da organização cliente cujo Cargo (classe Cargo vinculada à organização) corresponde a gestor.',
    ),
  },
  'fiscal-cliente': {
    type: 'reference',
    linkedFormId: IDS.pessoa,
    multiple: false,
    clearOptions: true,
    spec: spec(
      'Fiscal do cliente (classe Pessoa).',
      'Lista pessoas da organização cliente cujo Cargo corresponde a fiscal.',
    ),
  },
  cliente: {
    type: 'reference',
    linkedFormId: IDS.org,
    multiple: false,
    clearOptions: true,
    spec: spec(
      'Cliente solicitante — organização raiz do tipo cliente (classe Organização).',
      'Exibe o Nome da organização raiz (tipo cliente). Não embute o formulário completo da organização.',
    ),
  },
  'org-usuario': {
    type: 'reference',
    linkedFormId: IDS.org,
    multiple: false,
    clearOptions: true,
    spec: spec(
      'Organização do usuário (classe Organização).',
      'Se existir organização filha (não raiz, tipo cliente, com organização pai) → Nome dessa org. Se só houver raiz → Nome da raiz. Cliente solicitante = raiz; Organização do usuário = filho quando houver.',
    ),
  },
  'cargo-usuario': {
    type: 'reference',
    linkedFormId: IDS.cargo,
    multiple: false,
    clearOptions: true,
    size: 'medium',
    spec: spec(
      'Cargo do usuário logado (classe Cargo).',
      'Lista o Nome do Cargo conforme o vínculo Pessoa ↔ Cargo na organização do usuário logada.',
    ),
  },
  produto: {
    type: 'reference',
    linkedFormId: IDS.solucao,
    multiple: false,
    clearOptions: true,
    size: 'large',
    spec: spec(
      'Solução da demanda (classe Solução).',
      'Lista o Nome das soluções cadastradas. Campo referência (dropdown), não formulário embutido da classe.',
    ),
  },
  catalogos: {
    type: 'reference',
    linkedFormId: IDS.catalogo,
    multiple: true,
    clearOptions: true,
    size: 'large',
    spec: spec(
      'Catálogo(s) relacionados (classe Catálogo).',
      'Lista o Nome do catálogo cadastrado. Permite múltipla seleção. Não embute a classe completa.',
    ),
  },
  'parceiro-nome': {
    type: 'reference',
    linkedFormId: IDS.parceria,
    multiple: true,
    clearOptions: true,
    size: 'medium',
    spec: spec(
      'Parceiro(s) / parceria(s) da demanda (classe Parceria).',
      'Lista o Nome das parcerias cadastradas. Permite múltipla seleção.',
    ),
  },
  // Fabricante: usuário ainda vai verificar — mantém ref Organização, só reforça spec
  fabricante: {
    type: 'reference',
    linkedFormId: IDS.org,
    multiple: false,
    clearOptions: true,
    spec: spec(
      'Fabricante envolvido (provisório — classe Organização).',
      'Ainda em verificação de negócio. Por ora lista Nome de organizações cadastradas. Pode mudar após definição.',
    ),
  },
}

const FORM_PREFIX = [
  { id: 'form-patlasv4-proto-demanda-completa', prefix: 'patlasv4proto-demc-' },
  { id: 'form-patlasv4-proto-demanda-portal-cliente', prefix: 'patlasv4proto-demcli-' },
  { id: 'form-patlasv4-proto-demanda-portal-parceiro', prefix: 'patlasv4proto-dempar-' },
]

const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
let touched = 0

for (const { id: formId, prefix } of FORM_PREFIX) {
  const form = forms.find((f) => f.id === formId)
  if (!form) {
    console.warn('form missing', formId)
    continue
  }
  for (const [suf, cfg] of Object.entries(PATCH)) {
    const field = form.fields.find((f) => f.id === prefix + suf)
    if (!field) {
      console.warn('field missing', prefix + suf)
      continue
    }
    field.type = cfg.type
    field.linkedFormId = cfg.linkedFormId
    field.multiple = cfg.multiple
    if (cfg.size) field.size = cfg.size
    if (cfg.clearOptions) delete field.options
    if (cfg.spec) field.spec = cfg.spec
    // garantir que não vire embutida
    delete field.embeddedDisplay
    delete field.embeddedRoot
    delete field.embeddedTableHiddenFieldIds
    touched++
  }
  console.log('OK', form.name || formId, 'patched')
}

fs.writeFileSync(FORMS, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
console.log('touched fields', touched)
console.log('epic only:', FORMS)
