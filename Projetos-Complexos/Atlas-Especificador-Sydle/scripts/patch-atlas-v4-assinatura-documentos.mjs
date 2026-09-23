#!/usr/bin/env node
/**
 * Cria classe Assinatura de Documentos conforme telas Sydle.
 * Uso: node scripts/patch-atlas-v4-assinatura-documentos.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-v4-prototipo')
const formsPath = path.join(epicDir, 'forms.json')
const classGroupsPath = path.join(epicDir, 'class-groups.json')
const workspacesPath = path.join(epicDir, 'workspaces.json')

const FORM_MAIN = 'form-patlasv4-proto-assinatura-documentos'
const FORM_SIGNATARIO = 'form-patlasv4-proto-assinatura-signatario'
const FORM_ACESSO = 'form-patlasv4-proto-assinatura-controle-acesso'

const formSignatario = {
  id: FORM_SIGNATARIO,
  name: 'Assinatura — Signatário',
  sectionLayout: 'none',
  defaultCanvasMode: 'edit',
  metadata: 'Linha embutida — signatário do envelope de documentos.',
  fields: [
    {
      id: 'patlasv4proto-assin-sig-papel',
      label: 'Papel',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      options: ['Assinante', 'Testemunha', 'Aprovador', 'Cliente', 'Parceiro'],
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-sig-usuario',
      label: 'Usuário',
      type: 'reference',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      linkedFormId: 'form-patlasv4-proto-servidor',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-sig-nome',
      label: 'Nome',
      type: 'text',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'identity',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-sig-email',
      label: 'Email',
      type: 'text',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-sig-celular',
      label: 'Celular',
      type: 'text',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-sig-configuracoes',
      label: 'Configurações',
      type: 'text',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      spec: 'Configurações específicas do signatário (editar).',
    },
  ],
}

const formAcesso = {
  id: FORM_ACESSO,
  name: 'Assinatura — Controle de acesso',
  sectionLayout: 'none',
  defaultCanvasMode: 'edit',
  metadata: 'Linha embutida — usuário com permissão de leitura ou edição.',
  fields: [
    {
      id: 'patlasv4proto-assin-acesso-usuario',
      label: 'Usuário',
      type: 'reference',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      linkedFormId: 'form-patlasv4-proto-servidor',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-acesso-papel',
      label: 'Papel',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      options: ['Leitor', 'Editor', 'Administrador'],
      spec: '',
    },
  ],
}

const formMain = {
  id: FORM_MAIN,
  name: 'Assinatura de Documentos',
  sectionLayout: 'tabs',
  defaultCanvasMode: 'edit',
  metadata: 'Protótipo Atlas — envelope e configuração de assinatura eletrônica (Sydle).',
  sections: [
    { id: 'sec-assin-dados-envelope', title: 'Dados do envelope', icon: 'mail' },
    { id: 'sec-assin-signatarios', title: 'Signatários', icon: 'group' },
    { id: 'sec-assin-politica', title: 'Política e prazos', icon: 'schedule' },
    { id: 'sec-assin-config', title: 'Configuração da assinatura', icon: 'draw' },
    { id: 'sec-assin-avancado', title: 'Avançado', icon: 'tune' },
  ],
  fields: [
    {
      id: 'patlasv4proto-assin-dados-nome-envelope',
      label: 'Nome do envelope de documentos',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'identity',
      sectionId: 'sec-assin-dados-envelope',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-dados-status',
      label: 'Status',
      type: 'textOptions',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-assin-dados-envelope',
      options: ['Rascunho', 'Em configuração', 'Aguardando assinatura', 'Concluído', 'Cancelado'],
      spec: 'Status do envelope. Somente leitura.',
    },
    {
      id: 'patlasv4proto-assin-dados-documentos-ambiente',
      label: 'Documentos do ambiente',
      type: 'reference',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'common',
      sectionId: 'sec-assin-dados-envelope',
      linkedFormId: 'form-patlasv4-proto-documentos',
      spec: 'Documentos gerados no ambiente Atlas.',
    },
    {
      id: 'patlasv4proto-assin-dados-documentos-dispositivo',
      label: 'Documentos do dispositivo',
      type: 'file',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'common',
      sectionId: 'sec-assin-dados-envelope',
      spec: 'Upload de arquivos do dispositivo local.',
    },
    {
      id: 'patlasv4proto-assin-signatarios',
      label: 'Signatários',
      type: 'embeddedReference',
      size: 'large',
      readOnly: false,
      required: true,
      multiple: true,
      relevance: 'common',
      sectionId: 'sec-assin-signatarios',
      linkedFormId: FORM_SIGNATARIO,
      embeddedDisplay: 'table',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-politica-envio',
      label: 'Política de envio para assinatura',
      type: 'textOptions',
      size: 'large',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-politica',
      options: [
        'Respeitar ordem do campo signatários',
        'Enviar para todos simultaneamente',
        'Enviar simultaneamente por papel',
      ],
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-politica-prazo-dias',
      label: 'Prazo para assinatura (em dias)',
      type: 'number',
      size: 'small',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-politica',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-politica-permitir-recusa',
      label: 'Permitir que o signatário recuse a assinatura?',
      type: 'boolean',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-politica',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-config-tipo-eletronica',
      label: 'Tipo de assinatura eletrônica',
      type: 'textOptions',
      size: 'large',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-assin-config',
      options: ['Assinatura eletrônica simples', 'Assinatura eletrônica avançada'],
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-config-exigir-token',
      label: 'Exigir inserção manual do token de acesso?',
      type: 'boolean',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-config',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-config-controle-leitura',
      label: 'Controle de acesso de leitura',
      type: 'embeddedReference',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'common',
      sectionId: 'sec-assin-config',
      linkedFormId: FORM_ACESSO,
      embeddedDisplay: 'table',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-config-controle-edicao',
      label: 'Controle de acesso de edição',
      type: 'embeddedReference',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'common',
      sectionId: 'sec-assin-config',
      linkedFormId: FORM_ACESSO,
      embeddedDisplay: 'table',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-avancado-idioma',
      label: 'Idioma do documento',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-avancado',
      options: ['Português', 'Inglês', 'Espanhol'],
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-avancado-instrucoes',
      label: 'Instruções para assinatura',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-avancado',
      textLong: true,
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-avancado-tipo-carimbo',
      label: 'Tipo do carimbo padrão',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-avancado',
      options: ['Fontes padrões', 'Assinatura livre'],
      spec: 'Configuração do carimbo padrão.',
    },
    {
      id: 'patlasv4proto-assin-avancado-fonte-carimbo',
      label: 'Fonte do carimbo',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-avancado',
      options: ['Arial', 'Times New Roman', 'Pacifico', 'Kalam'],
      spec: 'Aplicável quando tipo = Fontes padrões.',
    },
    {
      id: 'patlasv4proto-assin-avancado-aviso-sydle',
      label: 'Exibir aviso de assinatura segura SYDLE?',
      type: 'boolean',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-avancado',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-avancado-exibir-data',
      label: 'Exibir data de assinatura?',
      type: 'boolean',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-avancado',
      spec: '',
    },
    {
      id: 'patlasv4proto-assin-avancado-carimbos-personalizados',
      label: 'Permitir que os signatários utilizem carimbos personalizados?',
      type: 'boolean',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-assin-avancado',
      spec: '',
    },
  ],
  exampleValuePresets: [
    {
      id: 'patlasv4proto-p-assinatura-documentos-mti',
      name: 'Exemplo MTI',
      iconColor: '#0c4a6e',
      fieldValues: {
        'patlasv4proto-assin-dados-nome-envelope': 'Proposta Comercial — Cliente SEPLAG',
        'patlasv4proto-assin-dados-status': 'Em configuração',
        'patlasv4proto-assin-politica-envio': 'Respeitar ordem do campo signatários',
        'patlasv4proto-assin-politica-prazo-dias': 15,
        'patlasv4proto-assin-politica-permitir-recusa': true,
        'patlasv4proto-assin-config-tipo-eletronica': 'Assinatura eletrônica avançada',
        'patlasv4proto-assin-config-exigir-token': true,
        'patlasv4proto-assin-avancado-idioma': 'Português',
        'patlasv4proto-assin-avancado-instrucoes': 'Leia o documento antes de assinar.',
        'patlasv4proto-assin-avancado-tipo-carimbo': 'Fontes padrões',
        'patlasv4proto-assin-avancado-fonte-carimbo': 'Arial',
        'patlasv4proto-assin-avancado-aviso-sydle': true,
        'patlasv4proto-assin-avancado-exibir-data': true,
        'patlasv4proto-assin-avancado-carimbos-personalizados': false,
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-assin-signatarios': [
          {
            'patlasv4proto-assin-sig-papel': 'Assinante',
            'patlasv4proto-assin-sig-usuario': 'Lucas Santos',
            'patlasv4proto-assin-sig-nome': 'Lucas Santos',
            'patlasv4proto-assin-sig-email': 'lucas.santos@mti.mt.gov.br',
            'patlasv4proto-assin-sig-celular': '(65) 99999-0001',
            'patlasv4proto-assin-sig-configuracoes': 'Padrão',
          },
          {
            'patlasv4proto-assin-sig-papel': 'Cliente',
            'patlasv4proto-assin-sig-nome': 'João Fiscal',
            'patlasv4proto-assin-sig-email': 'joao.fiscal@seplag.mt.gov.br',
            'patlasv4proto-assin-sig-celular': '(65) 99999-0002',
            'patlasv4proto-assin-sig-configuracoes': 'Padrão',
          },
        ],
        'patlasv4proto-assin-config-controle-leitura': [
          {
            'patlasv4proto-assin-acesso-usuario': 'Lucas Santos',
            'patlasv4proto-assin-acesso-papel': 'Leitor',
          },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-assinatura-documentos-parceiro',
      name: 'Exemplo Parceiro',
      iconColor: '#7c3aed',
      fieldValues: {
        'patlasv4proto-assin-dados-nome-envelope': 'Contrato Parceiro EloGroup',
        'patlasv4proto-assin-dados-status': 'Rascunho',
        'patlasv4proto-assin-politica-envio': 'Enviar simultaneamente por papel',
        'patlasv4proto-assin-politica-prazo-dias': 7,
        'patlasv4proto-assin-politica-permitir-recusa': false,
        'patlasv4proto-assin-config-tipo-eletronica': 'Assinatura eletrônica simples',
        'patlasv4proto-assin-config-exigir-token': false,
        'patlasv4proto-assin-avancado-idioma': 'Português',
        'patlasv4proto-assin-avancado-tipo-carimbo': 'Assinatura livre',
        'patlasv4proto-assin-avancado-fonte-carimbo': 'Pacifico',
        'patlasv4proto-assin-avancado-aviso-sydle': true,
        'patlasv4proto-assin-avancado-exibir-data': true,
        'patlasv4proto-assin-avancado-carimbos-personalizados': true,
      },
    },
    {
      id: 'patlasv4proto-p-assinatura-documentos-cliente',
      name: 'Exemplo Cliente',
      iconColor: '#0d9488',
      fieldValues: {
        'patlasv4proto-assin-dados-nome-envelope': 'Termo de Homologação SEPLAG',
        'patlasv4proto-assin-dados-status': 'Aguardando assinatura',
        'patlasv4proto-assin-politica-envio': 'Enviar para todos simultaneamente',
        'patlasv4proto-assin-politica-prazo-dias': 10,
        'patlasv4proto-assin-politica-permitir-recusa': true,
        'patlasv4proto-assin-config-tipo-eletronica': 'Assinatura eletrônica avançada',
        'patlasv4proto-assin-config-exigir-token': true,
        'patlasv4proto-assin-avancado-idioma': 'Português',
        'patlasv4proto-assin-avancado-tipo-carimbo': 'Fontes padrões',
        'patlasv4proto-assin-avancado-fonte-carimbo': 'Times New Roman',
        'patlasv4proto-assin-avancado-aviso-sydle': true,
        'patlasv4proto-assin-avancado-exibir-data': true,
        'patlasv4proto-assin-avancado-carimbos-personalizados': false,
      },
    },
  ],
  activeExamplePresetId: 'patlasv4proto-p-assinatura-documentos-mti',
}

const newIds = new Set([FORM_MAIN, FORM_SIGNATARIO, FORM_ACESSO])
const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
const kept = forms.filter((f) => !newIds.has(f.id))
fs.writeFileSync(formsPath, JSON.stringify([...kept, formSignatario, formAcesso, formMain], null, 2) + '\n', 'utf8')

const cg = JSON.parse(fs.readFileSync(classGroupsPath, 'utf8'))
cg.assignments[FORM_MAIN] = 'grp-patlasv4-proto-config'
cg.assignments[FORM_SIGNATARIO] = 'grp-patlasv4-proto-embutido'
cg.assignments[FORM_ACESSO] = 'grp-patlasv4-proto-embutido'
const configOrder = cg.memberOrderByGroup['grp-patlasv4-proto-config'] ?? []
if (!configOrder.includes(FORM_MAIN)) {
  const tplIdx = configOrder.indexOf('form-patlasv4-proto-template')
  if (tplIdx >= 0) configOrder.splice(tplIdx + 1, 0, FORM_MAIN)
  else configOrder.push(FORM_MAIN)
  cg.memberOrderByGroup['grp-patlasv4-proto-config'] = configOrder
}
const embOrder = cg.memberOrderByGroup['grp-patlasv4-proto-embutido'] ?? []
for (const id of [FORM_SIGNATARIO, FORM_ACESSO]) {
  if (!embOrder.includes(id)) embOrder.push(id)
}
cg.memberOrderByGroup['grp-patlasv4-proto-embutido'] = embOrder
fs.writeFileSync(classGroupsPath, JSON.stringify(cg, null, 2) + '\n', 'utf8')

const workspaces = JSON.parse(fs.readFileSync(workspacesPath, 'utf8'))
const pkg = workspaces[0].packages.find((p) => p.id === 'pkg-patlasv4-proto-config')
if (pkg && !pkg.classes.find((c) => c.linkedFormId === FORM_MAIN)) {
  const tplIdx = pkg.classes.findIndex((c) => c.linkedFormId === 'form-patlasv4-proto-template')
  const cls = {
    id: 'cls-patlasv4-proto-assinatura-documentos',
    name: 'Assinatura de Documentos',
    linkedFormId: FORM_MAIN,
    linkedFormExamplePresetIds: [
      'patlasv4proto-p-assinatura-documentos-mti',
      'patlasv4proto-p-assinatura-documentos-parceiro',
      'patlasv4proto-p-assinatura-documentos-cliente',
    ],
  }
  if (tplIdx >= 0) pkg.classes.splice(tplIdx + 1, 0, cls)
  else pkg.classes.push(cls)
}
fs.writeFileSync(workspacesPath, JSON.stringify(workspaces, null, 2) + '\n', 'utf8')

console.log('Assinatura de Documentos criada:', FORM_MAIN)
console.log('  • 5 abas, 19 campos raiz')
console.log('  • Signatários: tabela embutida (6 colunas)')
console.log('  • Controle de acesso: tabela embutida (2 colunas)')
