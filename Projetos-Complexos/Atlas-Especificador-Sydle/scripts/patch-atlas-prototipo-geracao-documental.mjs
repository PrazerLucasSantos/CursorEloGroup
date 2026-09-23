#!/usr/bin/env node
/**
 * Geração documental — Biblioteca ECM, revisão pré-emissão, Mustache, PDF imutável.
 * User Story: propostas/contratos por blocos + revisão manual controlada.
 * Uso: node scripts/patch-atlas-prototipo-geracao-documental.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')
const WS_PATH = path.join(EPIC_DIR, 'workspaces.json')

const FORM_ECM = 'form-patlasv4-proto-clausula-ecm'
const FORM_REVISAO = 'form-patlasv4-proto-revisao-documento'
const FORM_REV_BLOCO = 'form-patlasv4-proto-revisao-bloco'
const FORM_PDF_SAIDA = 'form-patlasv4-proto-geracao-pdf-saida'
const FORM_LOG_EDICAO = 'form-patlasv4-proto-hist-edicao-bloco'

const FORM_TEMPLATE = 'form-patlasv4-proto-template'
const FORM_BLOCO_REUTIL = 'form-patlasv4-proto-bloco-reutilizavel'
const FORM_PROPOSTA = 'form-patlasv4-proto-proposta'
const FORM_CONTRATO = 'form-patlasv4-proto-contrato'
const FORM_DOCUMENTOS = 'form-patlasv4-proto-documentos'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'

const METH_PREP_PROP = 'patlasv4proto-prop-meth-preparar'
const METH_PREP_CONT = 'patlasv4proto-contrato-meth-preparar'
const METH_GERAR_PDF = 'patlasv4proto-rev-meth-confirmar-pdf'

function f(id, label, type, sectionId, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    sectionId: sectionId ?? null,
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
    ...(opts.alertVariant ? { alertVariant: opts.alertVariant } : {}),
    ...(opts.alertTitle ? { alertTitle: opts.alertTitle } : {}),
    ...(opts.alertMessage ? { alertMessage: opts.alertMessage } : {}),
  }
}

function upsertForm(forms, formDef) {
  const i = forms.findIndex((x) => x.id === formDef.id)
  if (i >= 0) forms[i] = formDef
  else forms.push(formDef)
}

function patchField(form, fieldId, patch) {
  const fld = form.fields.find((x) => x.id === fieldId)
  if (fld) Object.assign(fld, patch)
}

function addFieldIfMissing(form, field) {
  if (!form.fields.some((x) => x.id === field.id)) form.fields.push(field)
}

function addMethodIfMissing(form, method) {
  if (!form.methods) form.methods = []
  if (!form.methods.some((m) => m.id === method.id)) form.methods.push(method)
}

// —— RF01: Biblioteca ECM ——
function buildClausulaEcmForm() {
  return {
    id: FORM_ECM,
    name: 'Cláusula — Biblioteca ECM',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'RF01 — Repositório centralizado de Blocos de Texto (Cláusulas). Identificador único, título e conteúdo rico com variáveis Mustache {{variavel}}. RF04: vinculação condicional ao catálogo.',
    fields: [
      f('patlasv4proto-ecm-codigo', 'Identificador único', 'text', null, {
        required: true,
        relevance: 'identity',
        size: 'small',
        spec: 'Código estável do bloco. Ex.: BLK-OBJ-001, BLK-SLA-CLOUD.',
      }),
      f('patlasv4proto-ecm-titulo', 'Título da cláusula', 'text', null, {
        required: true,
        relevance: 'highlight',
        size: 'large',
      }),
      f('patlasv4proto-ecm-conteudo', 'Conteúdo rico', 'text', null, {
        required: true,
        textLong: true,
        size: 'large',
        spec:
          'Texto formatado com placeholders Mustache: {{cliente_nome}}, {{cliente_cnpj}}, {{tabela_precos}}, {{quantidade}}. Sem IA livre — apenas blocos pré-aprovados.',
      }),
      f('patlasv4proto-ecm-tipo-mestre', 'Tipo de bloco mestre', 'textOptions', null, {
        options: ['—', 'Objeto', 'Foro', 'Sumário institucional', 'Plano de fundo'],
        spec: 'RN01/RN02: Objeto e Foro são obrigatórios na emissão. Sumário e fundo não são editáveis na revisão.',
      }),
      f('patlasv4proto-ecm-item-catalogo', 'Item de catálogo vinculado', 'textOptions', null, {
        options: [
          '— (geral)',
          'Cloud',
          'Desenvolvimento de software',
          'Suporte técnico',
          'CSPS - Plataforma de Simplificação',
        ],
        spec: 'RF04: se o item estiver na proposta/contrato, o bloco é injetado automaticamente.',
      }),
      f('patlasv4proto-ecm-obrigatorio', 'Obrigatório na emissão', 'boolean', null, {
        required: true,
        spec: 'RN02: blocos mestres Objeto/Foro não podem ser removidos na revisão.',
      }),
      f('patlasv4proto-ecm-editavel-revisao', 'Editável na revisão', 'boolean', null, {
        required: true,
        spec: 'RF05: permite ajuste pontual antes do PDF. RN01: fundo e sumário = Não.',
      }),
      f('patlasv4proto-ecm-ativo', 'Ativo', 'boolean', null, { required: true }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-ecm-objeto',
        name: 'Cláusula Objeto (mestre)',
        iconColor: '#0c4a6e',
        fieldValues: {
          'patlasv4proto-ecm-codigo': 'BLK-OBJ-001',
          'patlasv4proto-ecm-titulo': 'Do Objeto',
          'patlasv4proto-ecm-conteudo':
            'O presente instrumento tem por objeto a prestação de serviços de {{produto_servico}} em favor de {{cliente_nome}}, inscrita no CNPJ {{cliente_cnpj}}, conforme tabela de preços homologada na versão {{versao_catalogo}}.',
          'patlasv4proto-ecm-tipo-mestre': 'Objeto',
          'patlasv4proto-ecm-item-catalogo': '— (geral)',
          'patlasv4proto-ecm-obrigatorio': true,
          'patlasv4proto-ecm-editavel-revisao': true,
          'patlasv4proto-ecm-ativo': true,
        },
        embeddedRowsByFieldId: {},
      },
      {
        id: 'patlasv4proto-p-ecm-foro',
        name: 'Cláusula Foro (mestre)',
        iconColor: '#1e40af',
        fieldValues: {
          'patlasv4proto-ecm-codigo': 'BLK-FORO-001',
          'patlasv4proto-ecm-titulo': 'Do Foro',
          'patlasv4proto-ecm-conteudo':
            'Fica eleito o foro da Comarca de Cuiabá/MT para dirimir quaisquer controvérsias oriundas deste contrato.',
          'patlasv4proto-ecm-tipo-mestre': 'Foro',
          'patlasv4proto-ecm-item-catalogo': '— (geral)',
          'patlasv4proto-ecm-obrigatorio': true,
          'patlasv4proto-ecm-editavel-revisao': false,
          'patlasv4proto-ecm-ativo': true,
        },
        embeddedRowsByFieldId: {},
      },
      {
        id: 'patlasv4proto-p-ecm-sla-cloud',
        name: 'SLA Cloud (condicional)',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlasv4proto-ecm-codigo': 'BLK-SLA-CLOUD',
          'patlasv4proto-ecm-titulo': 'SLA de Disponibilidade — Cloud',
          'patlasv4proto-ecm-conteudo':
            'A CONTRATADA garante disponibilidade mínima de 99,5% ao mês para os serviços de Cloud contratados, medida conforme {{metrica_sla}}.',
          'patlasv4proto-ecm-tipo-mestre': '—',
          'patlasv4proto-ecm-item-catalogo': 'Cloud',
          'patlasv4proto-ecm-obrigatorio': false,
          'patlasv4proto-ecm-editavel-revisao': true,
          'patlasv4proto-ecm-ativo': true,
        },
        embeddedRowsByFieldId: {},
      },
      {
        id: 'patlasv4proto-p-ecm-sumario',
        name: 'Sumário institucional',
        iconColor: '#64748b',
        fieldValues: {
          'patlasv4proto-ecm-codigo': 'BLK-SUM-001',
          'patlasv4proto-ecm-titulo': 'Sumário',
          'patlasv4proto-ecm-conteudo': '1. Objeto\n2. Vigência\n3. Obrigações\n4. Preço\n5. Foro',
          'patlasv4proto-ecm-tipo-mestre': 'Sumário institucional',
          'patlasv4proto-ecm-item-catalogo': '— (geral)',
          'patlasv4proto-ecm-obrigatorio': true,
          'patlasv4proto-ecm-editavel-revisao': false,
          'patlasv4proto-ecm-ativo': true,
        },
        embeddedRowsByFieldId: {},
      },
      {
        id: 'patlasv4proto-p-ecm-detalhamento',
        name: 'Detalhamento do Projeto',
        iconColor: '#0d9488',
        fieldValues: {
          'patlasv4proto-ecm-codigo': 'BLK-DET-001',
          'patlasv4proto-ecm-titulo': 'Detalhamento do Projeto',
          'patlasv4proto-ecm-conteudo':
            'O projeto compreende {{quantidade}} unidades de {{produto_servico}}, entregues conforme cronograma acordado com {{cliente_nome}}.',
          'patlasv4proto-ecm-tipo-mestre': '—',
          'patlasv4proto-ecm-item-catalogo': 'Desenvolvimento de software',
          'patlasv4proto-ecm-obrigatorio': false,
          'patlasv4proto-ecm-editavel-revisao': true,
          'patlasv4proto-ecm-ativo': true,
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-ecm-objeto',
  }
}

// —— RF05: bloco na revisão ——
function buildRevisaoBlocoForm() {
  return {
    id: FORM_REV_BLOCO,
    name: 'Revisão — Bloco de texto',
    sectionLayout: 'none',
    metadata: 'Seção editável na modal de revisão pré-emissão (RF05).',
    fields: [
      f('patlasv4proto-revbl-codigo-ecm', 'Código ECM', 'text', null, {
        size: 'small',
        readOnly: true,
        relevance: 'identity',
      }),
      f('patlasv4proto-revbl-titulo', 'Seção', 'text', null, {
        required: true,
        relevance: 'highlight',
      }),
      f('patlasv4proto-revbl-conteudo', 'Texto da seção', 'text', null, {
        required: true,
        textLong: true,
        size: 'large',
        spec: 'Texto rico pré-preenchido. RF03: variáveis Mustache já resolvidas a partir do catálogo.',
      }),
      f('patlasv4proto-revbl-conteudo-original', 'Texto original (auditoria)', 'text', null, {
        readOnly: true,
        textLong: true,
        hidden: true,
        spec: 'RN04: preservado para log se o usuário alterar o bloco.',
      }),
      f('patlasv4proto-revbl-bloqueado', 'Bloqueado (institucional)', 'boolean', null, {
        readOnly: true,
        spec: 'RN01: sumário e plano de fundo — não editável na revisão.',
      }),
      f('patlasv4proto-revbl-obrigatorio-mestre', 'Bloco mestre obrigatório', 'boolean', null, {
        readOnly: true,
        spec: 'RN02: Objeto e Foro — emissão bloqueada se removidos.',
      }),
      f('patlasv4proto-revbl-alterado', 'Alterado pelo usuário', 'boolean', null, {
        readOnly: true,
        spec: 'RN04: quando true, gera entrada no histórico de edição.',
      }),
    ],
    fieldVisibilityRules: [
      {
        id: 'rule-revbl-ro-bloqueado',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-revbl-bloqueado',
        sourceKind: 'boolean',
        expectedBoolean: true,
        action: 'readonly',
        targetFieldIds: ['patlasv4proto-revbl-conteudo'],
      },
    ],
  }
}

// —— Modal de revisão (inputFormId dos métodos) ——
function buildRevisaoDocumentoForm() {
  const blocosDemo = [
    {
      'patlasv4proto-revbl-codigo-ecm': 'BLK-SUM-001',
      'patlasv4proto-revbl-titulo': 'Sumário',
      'patlasv4proto-revbl-conteudo': '1. Objeto\n2. Vigência\n3. Obrigações\n4. Preço\n5. Foro',
      'patlasv4proto-revbl-conteudo-original': '1. Objeto\n2. Vigência\n3. Obrigações\n4. Preço\n5. Foro',
      'patlasv4proto-revbl-bloqueado': true,
      'patlasv4proto-revbl-obrigatorio-mestre': true,
      'patlasv4proto-revbl-alterado': false,
    },
    {
      'patlasv4proto-revbl-codigo-ecm': 'BLK-OBJ-001',
      'patlasv4proto-revbl-titulo': 'Do Objeto',
      'patlasv4proto-revbl-conteudo':
        'O presente instrumento tem por objeto a prestação de serviços de CSPS — Plataforma de Simplificação em favor de Secretaria de Estado de Planejamento e Gestão, inscrita no CNPJ 03.549.382/0001-06, conforme tabela homologada v2026.1.',
      'patlasv4proto-revbl-conteudo-original':
        'O presente instrumento tem por objeto a prestação de serviços de {{produto_servico}} em favor de {{cliente_nome}}, inscrita no CNPJ {{cliente_cnpj}}, conforme tabela de preços homologada na versão {{versao_catalogo}}.',
      'patlasv4proto-revbl-bloqueado': false,
      'patlasv4proto-revbl-obrigatorio-mestre': true,
      'patlasv4proto-revbl-alterado': true,
    },
    {
      'patlasv4proto-revbl-codigo-ecm': 'BLK-SLA-CLOUD',
      'patlasv4proto-revbl-titulo': 'SLA de Disponibilidade — Cloud',
      'patlasv4proto-revbl-conteudo':
        'A CONTRATADA garante disponibilidade mínima de 99,5% ao mês (injetado automaticamente por item Cloud no catálogo — RF04).',
      'patlasv4proto-revbl-conteudo-original':
        'A CONTRATADA garante disponibilidade mínima de 99,5% ao mês para os serviços de Cloud contratados.',
      'patlasv4proto-revbl-bloqueado': false,
      'patlasv4proto-revbl-obrigatorio-mestre': false,
      'patlasv4proto-revbl-alterado': false,
    },
    {
      'patlasv4proto-revbl-codigo-ecm': 'BLK-DET-001',
      'patlasv4proto-revbl-titulo': 'Detalhamento do Projeto',
      'patlasv4proto-revbl-conteudo':
        'O projeto compreende 120 licenças da plataforma, com implantação em 90 dias e capacitação de 40 servidores.',
      'patlasv4proto-revbl-conteudo-original':
        'O projeto compreende {{quantidade}} unidades de {{produto_servico}}, entregues conforme cronograma acordado.',
      'patlasv4proto-revbl-bloqueado': false,
      'patlasv4proto-revbl-obrigatorio-mestre': false,
      'patlasv4proto-revbl-alterado': true,
    },
    {
      'patlasv4proto-revbl-codigo-ecm': 'BLK-FORO-001',
      'patlasv4proto-revbl-titulo': 'Do Foro',
      'patlasv4proto-revbl-conteudo':
        'Fica eleito o foro da Comarca de Cuiabá/MT para dirimir quaisquer controvérsias oriundas deste contrato.',
      'patlasv4proto-revbl-conteudo-original':
        'Fica eleito o foro da Comarca de Cuiabá/MT para dirimir quaisquer controvérsias oriundas deste contrato.',
      'patlasv4proto-revbl-bloqueado': false,
      'patlasv4proto-revbl-obrigatorio-mestre': true,
      'patlasv4proto-revbl-alterado': false,
    },
  ]

  return {
    id: FORM_REVISAO,
    name: 'Revisão pré-emissão de documento',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'RF05 — Modal de revisão antes do PDF. RF03 Mustache. RN01 fundo/sumário bloqueados. RN02 blocos mestres. RN03 versão catálogo. RN04 log de alterações.',
    fields: [
      f('patlasv4proto-rev-alerta', 'Fluxo de revisão', 'alert', null, {
        alertVariant: 'info',
        alertTitle: 'Revisão manual controlada — sem IA livre',
        alertMessage:
          'Blocos carregados do template + biblioteca ECM. Ajuste apenas seções editáveis. Ao confirmar, o sistema gera PDF imutável (RF06) para assinatura.',
      }),
      f('patlasv4proto-rev-tipo', 'Tipo de documento', 'textOptions', null, {
        required: true,
        options: ['Proposta', 'Contrato'],
        relevance: 'highlight',
      }),
      f('patlasv4proto-rev-template', 'Template utilizado', 'reference', null, {
        required: true,
        linkedFormId: FORM_TEMPLATE,
        options: ['Template de Proposta MTI', 'Template de Contrato Parceiro'],
      }),
      f('patlasv4proto-rev-cliente', 'Cliente', 'text', null, {
        readOnly: true,
        spec: 'RF03: {{cliente_nome}} resolvido do contexto.',
      }),
      f('patlasv4proto-rev-cnpj', 'CNPJ', 'text', null, {
        readOnly: true,
        size: 'small',
        spec: 'RF03: {{cliente_cnpj}}.',
      }),
      f('patlasv4proto-rev-versao-catalogo', 'Versão do catálogo homologada', 'text', null, {
        readOnly: true,
        required: true,
        spec: 'RN03: preços injetados devem corresponder à versão vigente na data de abertura da proposta.',
      }),
      f('patlasv4proto-rev-data-abertura', 'Data de abertura da proposta', 'date', null, {
        readOnly: true,
        spec: 'Referência para validação RN03.',
      }),
      f('patlasv4proto-rev-sumario', 'Sumário do documento', 'text', null, {
        readOnly: true,
        textLong: true,
        spec: 'RN01: não editável na revisão.',
      }),
      f('patlasv4proto-rev-plano-fundo', 'Plano de fundo institucional', 'file', null, {
        readOnly: true,
        spec: 'RF02: papel timbrado JPEG/PNG. RN01: não removível na revisão.',
      }),
      f('patlasv4proto-rev-css', 'CSS padronizado', 'text', null, {
        readOnly: true,
        textLong: true,
        hidden: true,
        spec: 'RF02: estilos do template aplicados na conversão PDF.',
      }),
      f('patlasv4proto-rev-blocos', 'Blocos para revisão', 'embeddedReference', null, {
        multiple: true,
        embeddedDisplay: 'form',
        linkedFormId: FORM_REV_BLOCO,
        spec: 'RF05: cada seção como texto rico editável (exceto bloqueados RN01).',
      }),
      f('patlasv4proto-rev-alerta-mestre', 'Validação mestre', 'alert', null, {
        alertVariant: 'warning',
        alertTitle: 'RN02 — Blocos obrigatórios',
        alertMessage: 'Objeto e Foro devem permanecer no documento. A emissão será bloqueada se forem removidos.',
      }),
    ],
    methods: [
      {
        id: METH_GERAR_PDF,
        name: 'Confirmar e Gerar PDF',
        icon: 'picture_as_pdf',
        kind: 'destaque',
      },
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-revisao-contrato-seplag',
        name: 'Revisão — Contrato SEPLAG',
        iconColor: '#0c4a6e',
        fieldValues: {
          'patlasv4proto-rev-tipo': 'Contrato',
          'patlasv4proto-rev-template': 'Template de Contrato Parceiro',
          'patlasv4proto-rev-cliente': 'Secretaria de Estado de Planejamento e Gestão',
          'patlasv4proto-rev-cnpj': '14.016.906/0001-73',
          'patlasv4proto-rev-versao-catalogo': 'v2026.1 (homologada em 01/03/2026)',
          'patlasv4proto-rev-data-abertura': '2026-03-15T10:00:00',
          'patlasv4proto-rev-sumario': '1. Objeto\n2. Vigência\n3. Obrigações\n4. Preço\n5. Foro',
          'patlasv4proto-rev-plano-fundo': 'papel_timbrado_mti.png',
        },
        embeddedRowsByFieldId: { 'patlasv4proto-rev-blocos': blocosDemo },
      },
      {
        id: 'patlasv4proto-p-revisao-proposta-cloud',
        name: 'Revisão — Proposta Cloud',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlasv4proto-rev-tipo': 'Proposta',
          'patlasv4proto-rev-template': 'Template de Proposta MTI',
          'patlasv4proto-rev-cliente': 'Secretaria de Estado de Planejamento e Gestão',
          'patlasv4proto-rev-cnpj': '14.016.906/0001-73',
          'patlasv4proto-rev-versao-catalogo': 'v2026.1 (homologada em 01/03/2026)',
          'patlasv4proto-rev-data-abertura': '2026-04-01T10:00:00',
          'patlasv4proto-rev-plano-fundo': 'fundo_proposta_mti.png',
        },
        embeddedRowsByFieldId: {
          'patlasv4proto-rev-blocos': blocosDemo.filter((b) => b['patlasv4proto-revbl-codigo-ecm'] !== 'BLK-FORO-001'),
        },
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-revisao-contrato-seplag',
  }
}

// —— RF06: saída PDF ——
function buildPdfSaidaForm() {
  return {
    id: FORM_PDF_SAIDA,
    name: 'Saída — PDF gerado',
    sectionLayout: 'none',
    defaultCanvasMode: 'read',
    metadata: 'RF06 — Resultado após Confirmar e Gerar PDF. Arquivo imutável para assinatura.',
    fields: [
      f('patlasv4proto-pdfs-doc', 'Documento PDF', 'file', null, {
        required: true,
        relevance: 'highlight',
        readOnly: true,
        spec: 'PDF protegido — sem edição pós-assinatura.',
      }),
      f('patlasv4proto-pdfs-hash', 'Hash de integridade', 'text', null, {
        readOnly: true,
        size: 'large',
        spec: 'SHA-256 do arquivo final.',
      }),
      f('patlasv4proto-pdfs-data', 'Data/hora da geração', 'text', null, {
        readOnly: true,
        size: 'small',
      }),
      f('patlasv4proto-pdfs-mensagem', 'Mensagem', 'text', null, {
        readOnly: true,
        size: 'large',
        spec: 'Documento disponível na aba Documentos para assinatura digital.',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-pdf-saida-contrato',
        name: 'PDF contrato gerado',
        iconColor: '#059669',
        fieldValues: {
          'patlasv4proto-pdfs-doc': 'contrato_076_2025_SEPLAG_final.pdf',
          'patlasv4proto-pdfs-hash': 'a3f8c2e1b9d04f6a7e2c8b5d1f0e9a4c6b3d2e1f8a7c5b4d3e2f1a0b9c8d7e6',
          'patlasv4proto-pdfs-data': '27/05/2026 15:42',
          'patlasv4proto-pdfs-mensagem':
            'PDF imutável gerado com sucesso. Encaminhado para assinatura digital.',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-pdf-saida-contrato',
  }
}

// —— RN04: log edição ——
function buildLogEdicaoForm() {
  return {
    id: FORM_LOG_EDICAO,
    name: 'Histórico — Edição de bloco',
    sectionLayout: 'none',
    metadata: 'RN04 — Trilha quando o usuário altera bloco pré-definido na revisão.',
    fields: [
      f('patlasv4proto-logbl-codigo', 'Código do bloco', 'text', null, {
        required: true,
        size: 'small',
        relevance: 'identity',
      }),
      f('patlasv4proto-logbl-titulo', 'Seção', 'text', null, { required: true }),
      f('patlasv4proto-logbl-original', 'Texto original', 'text', null, {
        required: true,
        textLong: true,
        readOnly: true,
      }),
      f('patlasv4proto-logbl-alterado', 'Texto alterado', 'text', null, {
        required: true,
        textLong: true,
        readOnly: true,
      }),
      f('patlasv4proto-logbl-usuario', 'Usuário', 'reference', null, {
        required: true,
        linkedFormId: FORM_PESSOA,
        options: ['Felipe Oliveira Costa', 'Carlos Eduardo Souza'],
      }),
      f('patlasv4proto-logbl-datahora', 'Data e hora', 'text', null, {
        required: true,
        readOnly: true,
        size: 'small',
      }),
    ],
  }
}

function patchTemplate(form) {
  addFieldIfMissing(
    form,
    f('patlasv4proto-template-dados-css-padronizado', 'CSS padronizado', 'text', 'sec-template-dados', {
      textLong: true,
      spec: 'RF02: folha de estilos aplicada na geração (fontes MTI, margens, cabeçalho).',
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-template-dados-sumario', 'Sumário institucional', 'text', 'sec-template-dados', {
      textLong: true,
      spec: 'RN01: exibido no documento; não editável na revisão.',
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-template-clausulas-ecm', 'Cláusulas ECM vinculadas', 'embeddedReference', 'sec-template-blocos-reutil', {
      multiple: true,
      embeddedDisplay: 'table',
      linkedFormId: FORM_ECM,
      spec: 'RF01/RF04: blocos da biblioteca ECM associados a este template.',
    }),
  )
  if (form.metadata && !form.metadata.includes('RF02')) {
    form.metadata += ' RF02 fundo institucional + CSS. RF03 Mustache {{variavel}}.'
  }
  return form
}

function patchBlocoReutil(form) {
  addFieldIfMissing(
    form,
    f('patlasv4proto-tpl-breutil-codigo-ecm', 'Código ECM', 'text', null, {
      size: 'small',
      spec: 'Referência ao identificador único na biblioteca ECM (RF01).',
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-tpl-breutil-item-catalogo', 'Gatilho catálogo', 'textOptions', null, {
      options: ['—', 'Cloud', 'Desenvolvimento de software', 'Suporte técnico'],
      spec: 'RF04: injeção condicional por item do catálogo.',
    }),
  )
  form.metadata =
    'Linha embutida — Blocos reutilizáveis (legado). Preferir biblioteca ECM (form-patlasv4-proto-clausula-ecm).'
  return form
}

function patchProposta(form) {
  form.defaultCanvasMode = 'read'
  addFieldIfMissing(
    form,
    f('patlasv4proto-proposta-template-documental', 'Template documental', 'reference', null, {
      linkedFormId: FORM_TEMPLATE,
      options: ['Template de Proposta MTI'],
      spec: 'RF02: template com fundo institucional e blocos ECM.',
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-proposta-versao-catalogo', 'Versão do catálogo homologada', 'text', null, {
      readOnly: true,
      required: true,
      spec: 'RN03: travada na data de abertura da proposta.',
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-proposta-data-abertura', 'Data de abertura', 'date', null, {
      readOnly: true,
      spec: 'RN03: referência para preços do catálogo.',
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-proposta-itens-catalogo', 'Itens do catálogo de serviços', 'textOptions', null, {
      required: true,
      multiple: true,
      options: [
        'Cloud',
        'Desenvolvimento de software',
        'Suporte técnico',
        'CSPS - Plataforma de Simplificação',
      ],
      spec: 'RF04: dispara injeção condicional de cláusulas ECM.',
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-proposta-log-edicao-blocos', 'Histórico de edição de blocos', 'embeddedReference', null, {
      multiple: true,
      embeddedDisplay: 'table',
      linkedFormId: FORM_LOG_EDICAO,
      readOnly: true,
      spec: 'RN04: alterações na revisão pré-emissão.',
    }),
  )
  patchField(form, 'patlasv4proto-proposta-itens-da-proposta', {
    hidden: true,
  })
  patchField(form, 'patlasv4proto-proposta-produto-servico', {
    options: [
      'CSPS - Plataforma de Simplificação',
      'Cloud MTI',
      'Desenvolvimento de software',
      'Suporte técnico',
    ],
  })
  if (!form.methods) form.methods = []
  addMethodIfMissing(form, {
    id: METH_PREP_PROP,
    name: 'Preparar Proposta',
    icon: 'description',
    kind: 'destaque',
    inputFormId: FORM_REVISAO,
  })
  addMethodIfMissing(form, {
    id: 'patlasv4proto-prop-meth-gerar-pdf',
    name: 'Confirmar e Gerar PDF',
    icon: 'picture_as_pdf',
    kind: 'menu',
    inputFormId: FORM_REVISAO,
  })
  form.metadata =
    'Protótipo Atlas — Proposta com geração documental por blocos ECM. RF03–RF06. Revisão manual antes do PDF.'
  const preset = form.exampleValuePresets?.find((p) => p.id === 'patlasv4proto-p-proposta-mti')
  if (preset) {
    preset.fieldValues['patlasv4proto-proposta-template-documental'] = 'Template de Proposta MTI'
    preset.fieldValues['patlasv4proto-proposta-versao-catalogo'] = 'v2026.1'
    preset.fieldValues['patlasv4proto-proposta-data-abertura'] = '2026-03-15T10:00:00'
    preset.fieldValues['patlasv4proto-proposta-itens-catalogo'] = ['CSPS - Plataforma de Simplificação']
    preset.fieldValues['patlasv4proto-proposta-produto-servico'] = 'CSPS - Plataforma de Simplificação'
  }
  return form
}

function patchContrato(form) {
  addFieldIfMissing(
    form,
    f('patlasv4proto-contrato-template-documental', 'Template documental', 'reference', null, {
      sectionId: 'sec-patlasv4proto-contrato-sec-contrato',
      linkedFormId: FORM_TEMPLATE,
      options: ['Template de Contrato Parceiro', 'Template de Proposta MTI'],
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-contrato-documento-pdf', 'Documento PDF gerado', 'file', null, {
      sectionId: 'sec-patlasv4proto-contrato-sec-contrato',
      readOnly: true,
      spec: 'RF06: PDF imutável após revisão e confirmação.',
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-contrato-log-edicao-blocos', 'Histórico de edição de blocos', 'embeddedReference', null, {
      sectionId: 'sec-patlasv4proto-contrato-hist-aprovacao',
      multiple: true,
      embeddedDisplay: 'table',
      linkedFormId: FORM_LOG_EDICAO,
      readOnly: true,
      spec: 'RN04: trilha de alterações na revisão.',
    }),
  )
  addMethodIfMissing(form, {
    id: METH_PREP_CONT,
    name: 'Preparar Contrato',
    icon: 'gavel',
    kind: 'destaque',
    inputFormId: FORM_REVISAO,
  })
  addMethodIfMissing(form, {
    id: 'patlasv4proto-contrato-meth-gerar-pdf',
    name: 'Confirmar e Gerar PDF',
    icon: 'picture_as_pdf',
    kind: 'menu',
    inputFormId: FORM_REVISAO,
  })
  const preset = form.exampleValuePresets?.find((p) => p.id === 'patlasv4proto-p-contrato-mti')
  if (preset) {
    preset.fieldValues['patlasv4proto-contrato-template-documental'] = 'Template de Contrato Parceiro'
    preset.embeddedRowsByFieldId = preset.embeddedRowsByFieldId ?? {}
    preset.embeddedRowsByFieldId['patlasv4proto-contrato-log-edicao-blocos'] = [
      {
        'patlasv4proto-logbl-codigo': 'BLK-DET-001',
        'patlasv4proto-logbl-titulo': 'Detalhamento do Projeto',
        'patlasv4proto-logbl-original':
          'O projeto compreende {{quantidade}} unidades de {{produto_servico}}, entregues conforme cronograma acordado.',
        'patlasv4proto-logbl-alterado':
          'O projeto compreende 120 licenças da plataforma, com implantação em 90 dias e capacitação de 40 servidores.',
        'patlasv4proto-logbl-usuario': 'Felipe Oliveira Costa',
        'patlasv4proto-logbl-datahora': '27/05/2026 15:38',
      },
    ]
  }
  if (form.metadata && !form.metadata.includes('RF05')) {
    form.metadata += ' Geração documental: Preparar Contrato → revisão → PDF imutável (RF05–RF06).'
  }
  return form
}

function patchDocumentos(form) {
  addFieldIfMissing(
    form,
    f('patlasv4proto-documentos-pdf-imutavel', 'PDF imutável', 'file', null, {
      readOnly: true,
      spec: 'RF06: versão final protegida para assinatura.',
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-documentos-hash-integridade', 'Hash de integridade', 'text', null, {
      readOnly: true,
      size: 'large',
      hidden: true,
    }),
  )
  addFieldIfMissing(
    form,
    f('patlasv4proto-documentos-log-edicao', 'Log de edição de blocos', 'embeddedReference', null, {
      multiple: true,
      embeddedDisplay: 'table',
      linkedFormId: FORM_LOG_EDICAO,
      readOnly: true,
    }),
  )
  return form
}

function patchGroups(groups) {
  const embedded = [FORM_REV_BLOCO, FORM_LOG_EDICAO, FORM_PDF_SAIDA]
  for (const id of embedded) {
    groups.assignments[id] = 'grp-patlasv4-proto-embutido'
    if (!groups.memberOrderByGroup['grp-patlasv4-proto-embutido'].includes(id)) {
      groups.memberOrderByGroup['grp-patlasv4-proto-embutido'].push(id)
    }
  }
  groups.assignments[FORM_ECM] = 'grp-patlasv4-proto-embutido'
  if (!groups.memberOrderByGroup['grp-patlasv4-proto-embutido'].includes(FORM_ECM)) {
    groups.memberOrderByGroup['grp-patlasv4-proto-embutido'].unshift(FORM_ECM)
  }
  groups.assignments[FORM_REVISAO] = 'grp-patlasv4-proto-fluxo'
  if (!groups.memberOrderByGroup['grp-patlasv4-proto-fluxo'].includes(FORM_REVISAO)) {
    groups.memberOrderByGroup['grp-patlasv4-proto-fluxo'].push(FORM_REVISAO)
  }
  return groups
}

function patchWorkspace(ws) {
  const w = ws[0]
  const pkg = w.packages.find((p) => p.id === 'pkg-patlasv4-proto-config')
  if (!pkg) throw new Error('Pacote configuração não encontrado')
  if (!pkg.classes.some((c) => c.id === 'cls-patlasv4-proto-ecm')) {
    pkg.classes.push({
      id: 'cls-patlasv4-proto-ecm',
      name: 'Biblioteca de Cláusulas (ECM)',
      linkedFormId: FORM_ECM,
      linkedFormExamplePresetIds: [
        'patlasv4proto-p-ecm-objeto',
        'patlasv4proto-p-ecm-foro',
        'patlasv4proto-p-ecm-sla-cloud',
        'patlasv4proto-p-ecm-sumario',
        'patlasv4proto-p-ecm-detalhamento',
      ],
    })
  }
  return ws
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  const newForms = [
    buildClausulaEcmForm(),
    buildRevisaoBlocoForm(),
    buildRevisaoDocumentoForm(),
    buildPdfSaidaForm(),
    buildLogEdicaoForm(),
  ]
  for (const fd of newForms) upsertForm(forms, fd)

  const idx = {
    template: forms.findIndex((x) => x.id === FORM_TEMPLATE),
    breutil: forms.findIndex((x) => x.id === FORM_BLOCO_REUTIL),
    proposta: forms.findIndex((x) => x.id === FORM_PROPOSTA),
    contrato: forms.findIndex((x) => x.id === FORM_CONTRATO),
    documentos: forms.findIndex((x) => x.id === FORM_DOCUMENTOS),
  }
  if (idx.template < 0) throw new Error('Template não encontrado')
  if (idx.proposta < 0) throw new Error('Proposta não encontrada')
  if (idx.contrato < 0) throw new Error('Contrato não encontrado')

  forms[idx.template] = patchTemplate(forms[idx.template])
  if (idx.breutil >= 0) forms[idx.breutil] = patchBlocoReutil(forms[idx.breutil])
  forms[idx.proposta] = patchProposta(forms[idx.proposta])
  forms[idx.contrato] = patchContrato(forms[idx.contrato])
  if (idx.documentos >= 0) forms[idx.documentos] = patchDocumentos(forms[idx.documentos])

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  fs.writeFileSync(
    GROUPS_PATH,
    `${JSON.stringify(patchGroups(JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))), null, 2)}\n`,
    'utf8',
  )
  fs.writeFileSync(
    WS_PATH,
    `${JSON.stringify(patchWorkspace(JSON.parse(fs.readFileSync(WS_PATH, 'utf8'))), null, 2)}\n`,
    'utf8',
  )

  console.log('Geração documental (ECM + revisão + PDF) aplicada.')
  console.log(`  Biblioteca ECM: ${FORM_ECM}`)
  console.log(`  Modal revisão: ${FORM_REVISAO}`)
  console.log(`  Métodos: Preparar Proposta / Preparar Contrato → ${FORM_REVISAO}`)
}

main()
