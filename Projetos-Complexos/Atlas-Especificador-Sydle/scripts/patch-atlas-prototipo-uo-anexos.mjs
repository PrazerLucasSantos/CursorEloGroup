#!/usr/bin/env node
/**
 * Reestrutura Unidade Organizacional conforme anexos Discovery (6 abas).
 * Uso: node scripts/patch-atlas-prototipo-uo-anexos.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const GROUPS_PATH = path.join(EPIC, 'class-groups.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_UO_DOC = 'form-patlasv4-proto-uo-documento'
const FORM_UO_TRIB = 'form-patlasv4-proto-uo-tributo'
const FORM_TIPO_DOC = 'form-patlasv4-proto-tipo-documento'

const SEC_DADOS = 'sec-patlasv4proto-uo-dados'
const SEC_AJUSTES = 'sec-patlasv4proto-uo-ajustes'
const SEC_DOC = 'sec-patlasv4proto-uo-documentos'
const SEC_TRIB = 'sec-patlasv4proto-uo-tributos'
const SEC_CONTATO = 'sec-patlasv4proto-uo-dados-contato'
const SEC_LOC = 'sec-patlasv4proto-uo-localizacao'

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const TRIBUTOS_OPTS = [
  'ISS', 'IRRF', 'CSLL', 'PIS', 'COFINS', 'INSS', 'ICMS', 'IPI', 'IRPJ', 'CPP', 'CBS', 'IBS', 'Outro',
]

const UO_PAI_OPTS = [
  'Empresa Mato-grossense de Tecnologia da Informação',
  'Gabinete do Diretor-Presidente',
  'Gabinete da Diretoria Administrativa',
  'Gabinete da Diretoria de Tecnologia da Informação e Comunicação',
  'Gabinete da Diretoria de Relacionamento com o Cliente',
  'Unidade de Gestão de Projetos',
  'Unidade de Gestão de Vendas',
  'Gerência de Contratos',
  'EloGroup',
  'Secretaria de Estado de Planejamento e Gestão',
]

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
    ...(sectionId ? { sectionId } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
  }
}

const formUoDocumento = {
  id: FORM_UO_DOC,
  name: 'UO — Documento',
  sectionLayout: 'none',
  metadata: 'Linha da grade Documentos da UO. RN: data de anexo automática no upload; vencimento editável (ideal OCR).',
  fields: [
    f('patlasv4proto-uodoc-tipo', 'Tipo de documento', 'reference', undefined, {
      required: true,
      relevance: 'highlight',
      linkedFormId: FORM_TIPO_DOC,
      spec: 'Referência ao cadastro Tipo Documento (ex.: Certidão negativa, Alvará).',
    }),
    f('patlasv4proto-uodoc-arquivo', 'Arquivo', 'file', undefined, {
      required: true,
      spec: 'Upload obrigatório do documento.',
    }),
    f('patlasv4proto-uodoc-data-anexo', 'Data de anexo', 'date', undefined, {
      readOnly: true,
      spec: 'Preenchida automaticamente na data do upload.',
    }),
    f('patlasv4proto-uodoc-data-vencimento', 'Data de vencimento', 'date', undefined, {
      spec: 'Idealmente extraída por OCR/IA; editável manualmente se não reconhecida. Dispara notificação de vencimento.',
    }),
    f('patlasv4proto-uodoc-observacao', 'Observação / Descrição', 'text', undefined, {
      size: 'large',
      textLong: true,
      spec: 'Texto livre complementar.',
    }),
  ],
}

const formUoTributo = {
  id: FORM_UO_TRIB,
  name: 'UO — Tributo / Encargo',
  sectionLayout: 'none',
  metadata: 'Linha da grade Tributos e Encargos — campos padrão de nota fiscal.',
  fields: [
    f('patlasv4proto-uotrib-tributo', 'Tributo / Encargo', 'textOptions', undefined, {
      required: true,
      relevance: 'highlight',
      options: TRIBUTOS_OPTS,
      spec: 'ISS, IRRF, CSLL, PIS, COFINS, INSS etc.',
    }),
    f('patlasv4proto-uotrib-aliquota', 'Alíquota (%)', 'number', undefined, {
      size: 'small',
      spec: 'Percentual aplicável.',
    }),
    f('patlasv4proto-uotrib-observacao', 'Observação', 'text', undefined, {
      size: 'large',
      textLong: true,
      spec: 'Isenções, benefícios fiscais ou referência a documento comprobatório.',
    }),
    f('patlasv4proto-uotrib-documento', 'Documento comprobatório', 'file', undefined, {
      spec: 'Anexo de isenção ou benefício fiscal, quando aplicável.',
    }),
  ],
}

function buildUoForm(presets, methods) {
  return {
    id: FORM_UO,
    name: 'Unidade Organizacional',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Protótipo Atlas — UO conforme Discovery 15/06. Abas: 1 Dados da Unidade, 2 Ajustes, 3 Documentos, 4 Tributos e Encargos, 5 Dados de contato, 6 Localização.',
    sections: [
      { id: SEC_DADOS, title: 'Dados da Unidade', icon: 'description' },
      { id: SEC_AJUSTES, title: 'Ajustes', icon: 'tune' },
      { id: SEC_DOC, title: 'Documentos', icon: 'folder' },
      { id: SEC_TRIB, title: 'Tributos e Encargos', icon: 'account_balance' },
      { id: SEC_CONTATO, title: 'Dados de contato', icon: 'contact_mail' },
      { id: SEC_LOC, title: 'Localização', icon: 'map' },
    ],
    fields: [
      // —— Aba 1: Dados da Unidade (somente cadastro identificador) ——
      f('patlasv4proto-uo-nome', 'Nome', 'text', SEC_DADOS, {
        size: 'large',
        required: true,
        relevance: 'identity',
        spec: 'Nome da unidade ou organização.',
      }),
      f('patlasv4proto-uo-sigla', 'Sigla', 'text', SEC_DADOS, {
        required: true,
        spec: 'Ex.: MTI, DIRC.',
      }),
      f('patlasv4proto-uo-cnpj', 'CNPJ', 'text', SEC_DADOS, {
        spec: 'Dado fiscal da unidade. Máscara CNPJ.',
      }),
      f('patlasv4proto-uo-codigo-cliente-parceiro', 'Código do cliente/parceiro', 'text', SEC_DADOS, {
        spec: 'Integração Protheus via API — código de parceiro/cliente (Discovery 15/06).',
      }),
      f('patlasv4proto-uo-produto-parceria', 'Produto / Parceria', 'reference', SEC_DADOS, {
        hidden: true,
        spec: 'Oculto — reservado Fase 2.',
      }),
      f('patlasv4proto-uo-data-ultima-atualizacao', 'Data da última atualização', 'date', SEC_DADOS, {
        readOnly: true,
        spec: 'Automática — visibilidade solicitada na aba Dados da Unidade.',
      }),
      f('patlasv4proto-uo-ativo', 'Ativo', 'boolean', SEC_DADOS, {
        required: true,
        spec: 'Inativa some dos seletores.',
      }),

      // —— Aba 2: Ajustes ——
      f('patlasv4proto-uo-unidade-pai', 'Unidade pai', 'reference', SEC_AJUSTES, {
        size: 'large',
        linkedFormId: FORM_UO,
        options: UO_PAI_OPTS,
        spec: 'Hierarquia. Vazio = raiz. Se preenchido, Representa Organização? = Não (RN-UO-04).',
      }),
      f('patlasv4proto-uo-nivel', 'Nível', 'number', SEC_AJUSTES, {
        size: 'small',
        readOnly: true,
        spec: 'Profundidade hierárquica calculada (raiz = 0).',
      }),
      f('patlasv4proto-uo-nivel-organizacional', 'Nível Organizacional', 'reference', SEC_AJUSTES, {
        size: 'small',
        required: true,
        hidden: true,
        linkedFormId: 'form-patlasv4-proto-nivel-organizacional',
        options: [
          'Empresa', 'Conselho', 'Diretoria Executiva', 'Gabinete', 'Unidade ou Assessoria',
          'Unidade', 'Ouvidoria', 'Assessoria', 'Gerência', 'Assessoria ou Unidade',
        ],
        spec: 'Referência interna à árvore MTI (oculto na UI).',
      }),
      f('patlasv4proto-uo-representa-organizacao', 'Representa Organização?', 'boolean', SEC_AJUSTES, {
        required: true,
        relevance: 'highlight',
        spec: 'Editável somente quando Unidade pai estiver vazia.',
      }),
      f('patlasv4proto-uo-tipo-organizacao', 'Tipo de Organização', 'textOptions', SEC_AJUSTES, {
        options: ['MTI', 'Parceiro', 'Cliente'],
        spec: 'Obrigatório se Representa Organização? = Sim.',
      }),
      f('patlasv4proto-uo-poder', 'Poder', 'textOptions', SEC_AJUSTES, {
        options: ['Executivo', 'Legislativo', 'Judiciário', 'Independente'],
        spec: 'Obrigatório se Tipo de Organização = Cliente (Discovery 15/06).',
      }),
      f('patlasv4proto-uo-substituida', 'Unidade substituída por', 'reference', SEC_AJUSTES, {
        size: 'large',
        linkedFormId: FORM_UO,
        spec: 'Reestruturações organizacionais.',
      }),
      f('patlasv4proto-uo-responsavel', 'Responsável', 'reference', SEC_AJUSTES, {
        linkedFormId: 'form-patlasv4-proto-servidor',
        options: ['Lucas Santos', 'João Analista MTI', 'Maria Consultora Parceira', 'Carlos Gestor Cliente', 'NOME TESTE'],
        spec: 'Lista de Servidores cadastrados.',
      }),
      f('patlasv4proto-uo-observacoes-organizacao', 'Observações da Organização', 'text', SEC_AJUSTES, {
        size: 'large',
        textLong: true,
        spec: 'Texto livre.',
      }),
      f('patlasv4proto-uo-estrutura-formal', 'Estrutura formal', 'boolean', SEC_AJUSTES, {
        hidden: true,
        spec: 'Oculto — reservado.',
      }),
      f('patlasv4proto-uo-codigo-externo', 'Código externo', 'text', SEC_AJUSTES, {
        hidden: true,
        spec: 'Oculto — identificador externo.',
      }),

      // —— Aba 3: Documentos ——
      f('patlasv4proto-uo-documentos', 'Documentos', 'embeddedReference', SEC_DOC, {
        size: 'large',
        multiple: true,
        linkedFormId: FORM_UO_DOC,
        embeddedDisplay: 'table',
        spec: 'Tabela múltipla: Tipo, Arquivo, Data anexo, Vencimento, Observação. Notificação de vencimento.',
      }),
      f('patlasv4proto-uo-logo', 'Logo', 'file', SEC_DOC, {
        spec: 'Logo institucional para templates.',
      }),
      f('patlasv4proto-uo-url-logo', 'URL da Logo', 'text', SEC_DOC, {
        size: 'large',
        spec: 'Endereço público da logo.',
      }),

      // —— Aba 4: Tributos e Encargos ——
      f('patlasv4proto-uo-tributos', 'Tributos e Encargos', 'embeddedReference', SEC_TRIB, {
        size: 'large',
        multiple: true,
        linkedFormId: FORM_UO_TRIB,
        embeddedDisplay: 'table',
        spec: 'Tabela múltipla: Tributo, Alíquota %, Observação, Documento comprobatório.',
      }),

      // —— Aba 5: Dados de contato ——
      f('patlasv4proto-uo-contato-emails', 'E-mails', 'embeddedReference', SEC_CONTATO, {
        size: 'large',
        multiple: true,
        linkedFormId: 'form-patlasv4-proto-pessoa-email',
        embeddedDisplay: 'table',
        spec: 'Tipo + Email.',
      }),
      f('patlasv4proto-uo-contato-email-principal', 'E-mail principal', 'text', SEC_CONTATO, {
        readOnly: true,
        relevance: 'highlight',
        spec: 'Destaque do e-mail principal da lista.',
      }),
      f('patlasv4proto-uo-contato-telefones', 'Telefones', 'embeddedReference', SEC_CONTATO, {
        size: 'large',
        multiple: true,
        linkedFormId: 'form-patlasv4-proto-pessoa-telefone',
        embeddedDisplay: 'table',
        spec: 'Tipo + País + DDI + Número.',
      }),
      f('patlasv4proto-uo-contato-enderecos', 'Endereços', 'embeddedReference', SEC_CONTATO, {
        size: 'large',
        multiple: true,
        linkedFormId: 'form-patlasv4-proto-pessoa-endereco',
        embeddedDisplay: 'table',
        spec: 'CEP + Logradouro + Número + Complemento + Bairro + Cidade + Estado + País.',
      }),
      f('patlasv4proto-uo-contato-redes-sociais', 'Redes sociais', 'embeddedReference', SEC_CONTATO, {
        size: 'large',
        multiple: true,
        linkedFormId: 'form-patlasv4-proto-pessoa-rede-social',
        embeddedDisplay: 'table',
        spec: 'Rede + URL + usuário.',
      }),

      // —— Aba 6: Localização (sem alterações) ——
      f('patlasv4proto-uo-loc-cep', 'CEP', 'text', SEC_LOC, { size: 'small', spec: 'Máscara CEP.' }),
      f('patlasv4proto-uo-loc-logradouro', 'Logradouro', 'text', SEC_LOC, { spec: 'Texto livre.' }),
      f('patlasv4proto-uo-loc-numero', 'Número', 'text', SEC_LOC, { size: 'small' }),
      f('patlasv4proto-uo-loc-complemento', 'Complemento', 'text', SEC_LOC),
      f('patlasv4proto-uo-loc-bairro', 'Bairro', 'text', SEC_LOC, { size: 'small' }),
      f('patlasv4proto-uo-loc-cidade-estado-pais', 'Cidade / Estado / País', 'reference', SEC_LOC, {
        size: 'large',
        linkedFormId: 'form-patlasv4-proto-pessoa-endereco',
        spec: 'Referência a localidade (CEP + cidade + UF + país).',
      }),
      f('patlasv4proto-uo-loc-cidade', 'Cidade', 'text', SEC_LOC, {
        hidden: true,
        options: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'São Paulo', 'Brasília', 'Outra'],
      }),
      f('patlasv4proto-uo-loc-estado', 'Estado', 'textOptions', SEC_LOC, {
        hidden: true,
        size: 'small',
        options: UFS,
      }),
      f('patlasv4proto-uo-loc-pais', 'País', 'textOptions', SEC_LOC, {
        hidden: true,
        size: 'small',
        options: ['Brasil', 'Argentina', 'Paraguai', 'Bolívia', 'Outro'],
      }),
    ],
    fieldVisibilityRules: [
      {
        id: 'rule-uo-hide-qualif-nao',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-uo-representa-organizacao',
        sourceKind: 'boolean',
        expectedBoolean: false,
        action: 'hide',
        targetFieldIds: [
          'patlasv4proto-uo-tipo-organizacao',
          'patlasv4proto-uo-poder',
          'patlasv4proto-uo-observacoes-organizacao',
        ],
      },
      {
        id: 'rule-uo-show-poder-cliente',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-uo-tipo-organizacao',
        sourceKind: 'textOptions',
        expectedOptionText: 'Cliente',
        action: 'show',
        targetFieldIds: ['patlasv4proto-uo-poder'],
      },
      {
        id: 'rule-uo-hide-poder-mti',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-uo-tipo-organizacao',
        sourceKind: 'textOptions',
        expectedOptionText: 'MTI',
        action: 'hide',
        targetFieldIds: ['patlasv4proto-uo-poder'],
      },
      {
        id: 'rule-uo-hide-poder-parceiro',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-uo-tipo-organizacao',
        sourceKind: 'textOptions',
        expectedOptionText: 'Parceiro',
        action: 'hide',
        targetFieldIds: ['patlasv4proto-uo-poder'],
      },
      {
        id: 'rule-uo-show-produto-parceiro',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-uo-tipo-organizacao',
        sourceKind: 'textOptions',
        expectedOptionText: 'Parceiro',
        action: 'show',
        targetFieldIds: ['patlasv4proto-uo-produto-parceria'],
      },
      {
        id: 'rule-uo-hide-produto-mti',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-uo-tipo-organizacao',
        sourceKind: 'textOptions',
        expectedOptionText: 'MTI',
        action: 'hide',
        targetFieldIds: ['patlasv4proto-uo-produto-parceria'],
      },
      {
        id: 'rule-uo-hide-produto-cliente',
        operator: 'eq',
        sourceFieldId: 'patlasv4proto-uo-tipo-organizacao',
        sourceKind: 'textOptions',
        expectedOptionText: 'Cliente',
        action: 'hide',
        targetFieldIds: ['patlasv4proto-uo-produto-parceria'],
      },
    ],
    exampleValuePresets: presets,
    activeExamplePresetId: presets[0]?.id,
    methods: methods ?? [],
  }
}

function migratePresets(oldPresets) {
  return oldPresets.map((p) => {
    const fv = { ...p.fieldValues }

    for (const k of Object.keys(fv)) {
      if (k.startsWith('patlasv4proto-uo-trib-') || k.startsWith('patlasv4proto-uo-hor-')) {
        delete fv[k]
      }
    }

    if (fv['patlasv4proto-uo-tipo-organizacao']?.includes?.('Mato-grossense')) {
      fv['patlasv4proto-uo-tipo-organizacao'] = 'MTI'
    }
    if (fv['mqfyrw6ecwegss']) {
      fv['patlasv4proto-uo-poder'] = String(fv['mqfyrw6ecwegss']).trim()
      delete fv['mqfyrw6ecwegss']
    }

    const embedded = { ...(p.embeddedRowsByFieldId ?? {}) }

    if (embedded['patlasv4proto-uo-documentos']) {
      embedded['patlasv4proto-uo-documentos'] = embedded['patlasv4proto-uo-documentos'].map((row) => ({
        'patlasv4proto-uodoc-tipo': row['patlasv4proto-uodoc-tipo'],
        'patlasv4proto-uodoc-arquivo': row['patlasv4proto-uodoc-arquivo'] ?? 'documento.pdf',
        'patlasv4proto-uodoc-data-anexo':
          row['patlasv4proto-uodoc-data-anexo'] ?? row['patlasv4proto-uodoc-data-cadastro'] ?? '01/06/2026',
        'patlasv4proto-uodoc-data-vencimento':
          row['patlasv4proto-uodoc-data-vencimento'] ?? row['patlasv4proto-uodoc-validade'] ?? '',
        'patlasv4proto-uodoc-observacao':
          row['patlasv4proto-uodoc-observacao'] ??
          (row['patlasv4proto-uodoc-numero'] ? `Ref.: ${row['patlasv4proto-uodoc-numero']}` : ''),
      }))
    }

    if (p.id === 'patlasv4proto-p-unidade-organizacional-mti') {
      embedded['patlasv4proto-uo-tributos'] = [
        {
          'patlasv4proto-uotrib-tributo': 'ISS',
          'patlasv4proto-uotrib-aliquota': 5,
          'patlasv4proto-uotrib-observacao': 'Alíquota municipal — Cuiabá/MT',
        },
        {
          'patlasv4proto-uotrib-tributo': 'PIS',
          'patlasv4proto-uotrib-aliquota': 1.65,
        },
        {
          'patlasv4proto-uotrib-tributo': 'COFINS',
          'patlasv4proto-uotrib-aliquota': 7.6,
        },
        {
          'patlasv4proto-uotrib-tributo': 'IRRF',
          'patlasv4proto-uotrib-aliquota': 1.5,
          'patlasv4proto-uotrib-observacao': 'Retenção em serviços — quando aplicável',
        },
      ]
      fv['patlasv4proto-uo-data-ultima-atualizacao'] = '15/06/2026'
    }

    return { ...p, fieldValues: fv, embeddedRowsByFieldId: embedded }
  })
}

function addTipoDocPresets(tipoForm) {
  const extra = [
    { nome: 'Certidão negativa', cat: 'Certidão', val: true },
    { nome: 'Atestado trabalhista', cat: 'Habilitação', val: true },
    { nome: 'Alvará', cat: 'Licença', val: true },
  ]
  const presets = [...(tipoForm.exampleValuePresets ?? [])]
  const names = new Set(presets.map((p) => p.fieldValues['patlasv4proto-tdoc-nome']))
  let n = presets.length
  for (const e of extra) {
    if (names.has(e.nome)) continue
    n += 1
    presets.push({
      id: `patlasv4proto-p-tdoc-${n}`,
      name: e.nome,
      iconColor: '#64748b',
      fieldValues: {
        'patlasv4proto-tdoc-nome': e.nome,
        'patlasv4proto-tdoc-categoria': e.cat,
        'patlasv4proto-tdoc-mascara': 'Livre',
        'patlasv4proto-tdoc-exige-validade': e.val,
        'patlasv4proto-tdoc-ativo': true,
      },
    })
  }
  return { ...tipoForm, exampleValuePresets: presets }
}

function patchGroups(groups) {
  groups.assignments[FORM_UO_TRIB] = 'grp-patlasv4-proto-embutido'
  const emb = groups.memberOrderByGroup['grp-patlasv4-proto-embutido']
  if (!emb.includes(FORM_UO_TRIB)) {
    const docIdx = emb.indexOf(FORM_UO_DOC)
    emb.splice(docIdx >= 0 ? docIdx + 1 : 0, 0, FORM_UO_TRIB)
  }
  return groups
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const oldUo = forms.find((x) => x.id === FORM_UO)
  if (!oldUo) {
    console.error('UO não encontrada')
    process.exit(1)
  }

  const presets = migratePresets(oldUo.exampleValuePresets ?? [])
  const methods = oldUo.methods ?? []

  const uoIdx = forms.findIndex((x) => x.id === FORM_UO)
  forms[uoIdx] = buildUoForm(presets, methods)

  const docIdx = forms.findIndex((x) => x.id === FORM_UO_DOC)
  if (docIdx >= 0) forms[docIdx] = formUoDocumento
  else forms.splice(uoIdx, 0, formUoDocumento)

  const tribIdx = forms.findIndex((x) => x.id === FORM_UO_TRIB)
  if (tribIdx >= 0) forms[tribIdx] = formUoTributo
  else {
    const di = forms.findIndex((x) => x.id === FORM_UO_DOC)
    forms.splice(di + 1, 0, formUoTributo)
  }

  const tipoIdx = forms.findIndex((x) => x.id === FORM_TIPO_DOC)
  if (tipoIdx >= 0) forms[tipoIdx] = addTipoDocPresets(forms[tipoIdx])

  const groups = patchGroups(JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8')))

  fs.writeFileSync(FORMS_PATH, JSON.stringify(forms, null, 2) + '\n', 'utf8')
  fs.writeFileSync(GROUPS_PATH, JSON.stringify(groups, null, 2) + '\n', 'utf8')

  console.log('✓ UO reestruturada: 6 abas conforme anexos')
  console.log('  · Dados da Unidade:', 7, 'campos visíveis')
  console.log('  · Ajustes:', 11, 'campos')
  console.log('  · Documentos: grade + logo')
  console.log('  · Tributos: tabela embutida (substituiu 70 campos flat)')
  console.log('  · Presets migrados:', presets.length)
}

main()
