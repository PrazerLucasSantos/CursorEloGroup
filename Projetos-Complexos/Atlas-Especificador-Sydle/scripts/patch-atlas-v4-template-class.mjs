#!/usr/bin/env node
/**
 * Cria classe Template + formulários embutidos (Blocos do Template, Bloco reutilizável).
 * Uso: node scripts/patch-atlas-v4-template-class.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-v4-prototipo')
const formsPath = path.join(epicDir, 'forms.json')
const classGroupsPath = path.join(epicDir, 'class-groups.json')
const workspacesPath = path.join(epicDir, 'workspaces.json')

const FORM_TEMPLATE = 'form-patlasv4-proto-template'
const FORM_BLOCO = 'form-patlasv4-proto-template-bloco'
const FORM_BLOCO_REUTIL = 'form-patlasv4-proto-bloco-reutilizavel'

const formBloco = {
  id: FORM_BLOCO,
  name: 'Template — Bloco',
  sectionLayout: 'none',
  defaultCanvasMode: 'edit',
  metadata: 'Linha embutida — Blocos do Template (ABA 2).',
  fields: [
    {
      id: 'patlasv4proto-tpl-bloco-ordem',
      label: 'Ordem',
      type: 'number',
      size: 'small',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      spec: 'Número inteiro; define sequência do bloco no documento.',
    },
    {
      id: 'patlasv4proto-tpl-bloco-tipo-de-bloco',
      label: 'Tipo de bloco',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      options: [
        'Texto livre',
        'Tabela de produtos',
        'Imagem',
        'Separador',
        'Campo de dados do sistema',
      ],
      spec: '',
    },
    {
      id: 'patlasv4proto-tpl-bloco-titulo-do-bloco',
      label: 'Título do bloco',
      type: 'text',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      spec: '',
    },
    {
      id: 'patlasv4proto-tpl-bloco-conteudo',
      label: 'Conteúdo',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      textLong: true,
      spec: 'Depende do tipo de bloco selecionado. Obrigatoriedade: condicional.',
    },
    {
      id: 'patlasv4proto-tpl-bloco-editavel-na-geracao',
      label: 'Editável na geração',
      type: 'boolean',
      size: 'small',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      spec: '',
    },
    {
      id: 'patlasv4proto-tpl-bloco-ativo',
      label: 'Ativo',
      type: 'boolean',
      size: 'small',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      spec: '',
    },
  ],
}

const formBlocoReutil = {
  id: FORM_BLOCO_REUTIL,
  name: 'Template — Bloco reutilizável',
  sectionLayout: 'none',
  defaultCanvasMode: 'edit',
  metadata: 'Linha embutida — Blocos reutilizáveis vinculáveis a qualquer template.',
  fields: [
    {
      id: 'patlasv4proto-tpl-breutil-nome-do-bloco',
      label: 'Nome do bloco',
      type: 'text',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'identity',
      spec: '',
    },
    {
      id: 'patlasv4proto-tpl-breutil-tipo',
      label: 'Tipo',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      options: ['Texto', 'Tabela', 'Imagem', 'Campo de dados'],
      spec: '',
    },
    {
      id: 'patlasv4proto-tpl-breutil-conteudo',
      label: 'Conteúdo',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      textLong: true,
      spec: 'Texto ou configuração conforme o tipo.',
    },
    {
      id: 'patlasv4proto-tpl-breutil-ativo',
      label: 'Ativo',
      type: 'boolean',
      size: 'small',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      spec: '',
    },
  ],
}

const formTemplate = {
  id: FORM_TEMPLATE,
  name: 'Template',
  sectionLayout: 'tabs',
  defaultCanvasMode: 'edit',
  metadata: 'Protótipo Atlas — Template documental. ABAs: Dados do Template, Blocos do Template, Blocos reutilizáveis.',
  sections: [
    { id: 'sec-template-dados', title: 'Dados do Template', icon: 'description' },
    { id: 'sec-template-blocos', title: 'Blocos do Template', icon: 'view_list' },
    { id: 'sec-template-blocos-reutil', title: 'Blocos reutilizáveis', icon: 'library_books' },
  ],
  fields: [
    {
      id: 'patlasv4proto-template-dados-nome',
      label: 'Nome',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'identity',
      sectionId: 'sec-template-dados',
      spec: 'Texto livre.',
    },
    {
      id: 'patlasv4proto-template-dados-tipo-de-processo',
      label: 'Tipo de Processo',
      type: 'reference',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-template-dados',
      linkedFormId: 'mqb5ag1k51kz2u',
      spec: 'Seleção — lista de tipos de processo cadastrados.',
    },
    {
      id: 'patlasv4proto-template-dados-parceria-vinculada',
      label: 'Parceria vinculada',
      type: 'reference',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-template-dados',
      linkedFormId: 'form-patlasv4-proto-organizacao',
      spec: 'Referência → Organização tipo Parceiro (opcional).',
    },
    {
      id: 'patlasv4proto-template-dados-relacao',
      label: 'Relação',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-template-dados',
      options: ['Um para N', 'Um para Um'],
      spec: '',
    },
    {
      id: 'patlasv4proto-template-dados-versao-do-template',
      label: 'Versão do template',
      type: 'number',
      size: 'small',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-template-dados',
      spec: 'Número auto-incrementado. Somente leitura.',
    },
    {
      id: 'patlasv4proto-template-dados-status',
      label: 'Status',
      type: 'textOptions',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-template-dados',
      options: ['Rascunho', 'Em homologação', 'Homologado', 'Inativo'],
      spec: 'Calculado. Somente leitura.',
    },
    {
      id: 'patlasv4proto-template-dados-workflow-de-homologacao',
      label: 'Workflow de homologação',
      type: 'reference',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-template-dados',
      linkedFormId: 'mqebasqyphbwea',
      spec: 'Referência → Workflow de Assinatura. Obrigatoriedade: condicional.',
    },
    {
      id: 'patlasv4proto-template-dados-plano-de-fundo',
      label: 'Plano de fundo',
      type: 'file',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-template-dados',
      spec: 'Upload de imagem (JPEG/PNG).',
    },
    {
      id: 'patlasv4proto-template-dados-ativo',
      label: 'Ativo',
      type: 'boolean',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-template-dados',
      spec: '',
    },
    {
      id: 'patlasv4proto-template-blocos-do-template',
      label: 'Blocos do Template',
      type: 'embeddedReference',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'common',
      sectionId: 'sec-template-blocos',
      linkedFormId: FORM_BLOCO,
      embeddedDisplay: 'table',
      spec: 'Montagem do documento por blocos ordenados.',
    },
    {
      id: 'patlasv4proto-template-blocos-reutilizaveis',
      label: 'Blocos reutilizáveis',
      type: 'embeddedReference',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'common',
      sectionId: 'sec-template-blocos-reutil',
      linkedFormId: FORM_BLOCO_REUTIL,
      embeddedDisplay: 'table',
      spec: 'Blocos reutilizáveis vinculáveis a qualquer template.',
    },
  ],
  exampleValuePresets: [
    {
      id: 'patlasv4proto-p-template-mti',
      name: 'Exemplo MTI',
      iconColor: '#0c4a6e',
      fieldValues: {
        'patlasv4proto-template-dados-nome': 'Template de Proposta MTI',
        'patlasv4proto-template-dados-tipo-de-processo': 'Proposta',
        'patlasv4proto-template-dados-relacao': 'Um para N',
        'patlasv4proto-template-dados-versao-do-template': 1,
        'patlasv4proto-template-dados-status': 'Rascunho',
        'patlasv4proto-template-dados-plano-de-fundo': 'fundo_proposta_mti.png',
        'patlasv4proto-template-dados-ativo': true,
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-template-blocos-do-template': [
          {
            'patlasv4proto-tpl-bloco-ordem': 1,
            'patlasv4proto-tpl-bloco-tipo-de-bloco': 'Texto livre',
            'patlasv4proto-tpl-bloco-titulo-do-bloco': 'Objeto da proposta',
            'patlasv4proto-tpl-bloco-conteudo': 'Texto parametrizado do objeto...',
            'patlasv4proto-tpl-bloco-editavel-na-geracao': false,
            'patlasv4proto-tpl-bloco-ativo': true,
          },
          {
            'patlasv4proto-tpl-bloco-ordem': 2,
            'patlasv4proto-tpl-bloco-tipo-de-bloco': 'Tabela de produtos',
            'patlasv4proto-tpl-bloco-titulo-do-bloco': 'Produtos e serviços',
            'patlasv4proto-tpl-bloco-editavel-na-geracao': true,
            'patlasv4proto-tpl-bloco-ativo': true,
          },
        ],
        'patlasv4proto-template-blocos-reutilizaveis': [
          {
            'patlasv4proto-tpl-breutil-nome-do-bloco': 'Cláusula padrão MTI',
            'patlasv4proto-tpl-breutil-tipo': 'Texto',
            'patlasv4proto-tpl-breutil-conteudo': 'Texto da cláusula reutilizável...',
            'patlasv4proto-tpl-breutil-ativo': true,
          },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-template-parceiro',
      name: 'Exemplo Parceiro',
      iconColor: '#7c3aed',
      fieldValues: {
        'patlasv4proto-template-dados-nome': 'Template de Contrato Parceiro',
        'patlasv4proto-template-dados-tipo-de-processo': 'Contrato',
        'patlasv4proto-template-dados-relacao': 'Um para Um',
        'patlasv4proto-template-dados-versao-do-template': 2,
        'patlasv4proto-template-dados-status': 'Em homologação',
        'patlasv4proto-template-dados-ativo': true,
      },
    },
    {
      id: 'patlasv4proto-p-template-cliente',
      name: 'Exemplo Cliente',
      iconColor: '#0d9488',
      fieldValues: {
        'patlasv4proto-template-dados-nome': 'Template de OS Cliente',
        'patlasv4proto-template-dados-tipo-de-processo': 'Ordem de Serviço',
        'patlasv4proto-template-dados-relacao': 'Um para N',
        'patlasv4proto-template-dados-versao-do-template': 1,
        'patlasv4proto-template-dados-status': 'Homologado',
        'patlasv4proto-template-dados-ativo': true,
      },
    },
  ],
  activeExamplePresetId: 'patlasv4proto-p-template-mti',
}

const newIds = new Set([FORM_TEMPLATE, FORM_BLOCO, FORM_BLOCO_REUTIL])
const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
const kept = forms.filter((f) => !newIds.has(f.id))
fs.writeFileSync(formsPath, JSON.stringify([...kept, formBloco, formBlocoReutil, formTemplate], null, 2) + '\n', 'utf8')

const cg = JSON.parse(fs.readFileSync(classGroupsPath, 'utf8'))
cg.assignments[FORM_TEMPLATE] = 'grp-patlasv4-proto-config'
cg.assignments[FORM_BLOCO] = 'grp-patlasv4-proto-embutido'
cg.assignments[FORM_BLOCO_REUTIL] = 'grp-patlasv4-proto-embutido'
const configOrder = cg.memberOrderByGroup['grp-patlasv4-proto-config'] ?? []
if (!configOrder.includes(FORM_TEMPLATE)) {
  const idx = configOrder.indexOf('form-patlasv4-proto-documentos-templates')
  if (idx >= 0) configOrder.splice(idx, 0, FORM_TEMPLATE)
  else configOrder.push(FORM_TEMPLATE)
  cg.memberOrderByGroup['grp-patlasv4-proto-config'] = configOrder
}
const embOrder = cg.memberOrderByGroup['grp-patlasv4-proto-embutido'] ?? []
for (const id of [FORM_BLOCO, FORM_BLOCO_REUTIL]) {
  if (!embOrder.includes(id)) embOrder.push(id)
}
cg.memberOrderByGroup['grp-patlasv4-proto-embutido'] = embOrder
fs.writeFileSync(classGroupsPath, JSON.stringify(cg, null, 2) + '\n', 'utf8')

const workspaces = JSON.parse(fs.readFileSync(workspacesPath, 'utf8'))
const ws = workspaces[0]
const pkg = ws.packages.find((p) => p.id === 'pkg-patlasv4-proto-config')
if (pkg && !pkg.classes.find((c) => c.linkedFormId === FORM_TEMPLATE)) {
  const docIdx = pkg.classes.findIndex((c) => c.linkedFormId === 'form-patlasv4-proto-documentos-templates')
  const cls = {
    id: 'cls-patlasv4-proto-template',
    name: 'Template',
    linkedFormId: FORM_TEMPLATE,
    linkedFormExamplePresetIds: [
      'patlasv4proto-p-template-mti',
      'patlasv4proto-p-template-parceiro',
      'patlasv4proto-p-template-cliente',
    ],
  }
  if (docIdx >= 0) pkg.classes.splice(docIdx, 0, cls)
  else pkg.classes.push(cls)
}
fs.writeFileSync(workspacesPath, JSON.stringify(workspaces, null, 2) + '\n', 'utf8')

console.log('Template criado:', FORM_TEMPLATE)
console.log('  • ABA Dados do Template: 9 campos')
console.log('  • ABA Blocos do Template: tabela embutida (6 colunas)')
console.log('  • ABA Blocos reutilizáveis: tabela embutida (4 colunas)')
