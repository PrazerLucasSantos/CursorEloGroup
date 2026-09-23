#!/usr/bin/env node
/**
 * UO: grade Documentos (tipo ref. Tipo Documento), aba Tributos (NFS-e/NF-e).
 * Nova classe: Tipo Documento.
 * Uso: node scripts/patch-atlas-prototipo-uo-docs-tributos.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const WORKSPACES_PATH = path.join(EPIC, 'workspaces.json')
const GROUPS_PATH = path.join(EPIC, 'class-groups.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_TIPO_DOC = 'form-patlasv4-proto-tipo-documento'
const FORM_UO_DOC = 'form-patlasv4-proto-uo-documento'

const SEC_DOC = 'sec-patlasv4proto-uo-documentos'
const SEC_TRIB = 'sec-patlasv4proto-uo-tributos'
const SEC_TRIB_ID = 'sec-patlasv4proto-uo-trib-identificacao'
const SEC_TRIB_REG = 'sec-patlasv4proto-uo-trib-regime'
const SEC_TRIB_NFSE = 'sec-patlasv4proto-uo-trib-nfse'
const SEC_TRIB_NFE = 'sec-patlasv4proto-uo-trib-nfe'
const SEC_TRIB_FED = 'sec-patlasv4proto-uo-trib-federais'
const SEC_TRIB_RET = 'sec-patlasv4proto-uo-trib-retencoes'
const SEC_TRIB_PREV = 'sec-patlasv4proto-uo-trib-previdencia'
const SEC_TRIB_REF = 'sec-patlasv4proto-uo-trib-reforma'
const SEC_TRIB_CERT = 'sec-patlasv4proto-uo-trib-certificado'

const TIPOS_DOCUMENTO = [
  { nome: 'CNPJ', categoria: 'Cadastral', mascara: 'CNPJ', exigeValidade: false },
  { nome: 'Inscrição Estadual (IE)', categoria: 'Cadastral', mascara: 'Numérico', exigeValidade: false },
  { nome: 'Inscrição Municipal (IM)', categoria: 'Cadastral', mascara: 'Numérico', exigeValidade: false },
  { nome: 'CCM — Cadastro Mobiliário', categoria: 'Cadastral', mascara: 'Numérico', exigeValidade: false },
  { nome: 'CNAE Fiscal', categoria: 'Cadastral', mascara: 'Alfanumérico', exigeValidade: false },
  { nome: 'Alvará de Funcionamento', categoria: 'Licença', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Licença Sanitária', categoria: 'Licença', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Licença Ambiental', categoria: 'Licença', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Certidão Negativa de Débitos Federais (CND)', categoria: 'Certidão', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Certidão Negativa de Débitos Estaduais', categoria: 'Certidão', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Certidão Negativa de Débitos Municipais', categoria: 'Certidão', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Certidão de Regularidade do FGTS (CRF)', categoria: 'Certidão', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Certidão de Regularidade do INSS', categoria: 'Certidão', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Certidão de Falência e Concordata', categoria: 'Certidão', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Declaração de Habilitação', categoria: 'Habilitação', mascara: 'Livre', exigeValidade: true },
  { nome: 'Declaração de Idoneidade', categoria: 'Habilitação', mascara: 'Livre', exigeValidade: true },
  { nome: 'Balanço Patrimonial', categoria: 'Habilitação', mascara: 'Livre', exigeValidade: true },
  { nome: 'Contrato Social / Estatuto Social', categoria: 'Societário', mascara: 'Livre', exigeValidade: false },
  { nome: 'Ata de Constituição', categoria: 'Societário', mascara: 'Livre', exigeValidade: false },
  { nome: 'Procuração', categoria: 'Societário', mascara: 'Livre', exigeValidade: true },
  { nome: 'Cartão CNPJ (comprovante)', categoria: 'Cadastral', mascara: 'CNPJ', exigeValidade: false },
  { nome: 'Certificado Digital e-CNPJ', categoria: 'Fiscal', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Registro Comercial (JUCEMAT/Junta)', categoria: 'Societário', mascara: 'Alfanumérico', exigeValidade: false },
  { nome: 'Comprovante de Inscrição em Conselho Profissional', categoria: 'Habilitação', mascara: 'Alfanumérico', exigeValidade: true },
  { nome: 'Outro documento', categoria: 'Outro', mascara: 'Livre', exigeValidade: false },
]

function field(id, label, type, sectionId, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    sectionId,
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.hidden ? { hidden: opts.hidden } : {}),
  }
}

const formTipoDocumento = {
  id: FORM_TIPO_DOC,
  name: 'Tipo Documento',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata:
    'Protótipo Atlas — Tipos de documento de empresa/organização (CNPJ, certidões, habilitação, societário). Referenciado pela grade Documentos da Unidade Organizacional.',
  fields: [
    field('patlasv4proto-tdoc-nome', 'Nome', 'text', undefined, {
      size: 'large',
      required: true,
      relevance: 'identity',
      spec: 'Ex.: CNPJ, Declaração de Habilitação, CND Federal.',
    }),
    field('patlasv4proto-tdoc-categoria', 'Categoria', 'textOptions', undefined, {
      required: true,
      options: ['Cadastral', 'Fiscal', 'Habilitação', 'Societário', 'Certidão', 'Licença', 'Outro'],
      spec: 'Agrupa o tipo para filtros e relatórios.',
    }),
    field('patlasv4proto-tdoc-mascara', 'Máscara / formato', 'textOptions', undefined, {
      options: ['CNPJ', 'CPF', 'Numérico', 'Alfanumérico', 'Livre', 'Data'],
      spec: 'Formato esperado do número do documento.',
    }),
    field('patlasv4proto-tdoc-exige-validade', 'Exige validade?', 'boolean', undefined, {
      required: true,
      spec: 'Quando Sim, a grade de documentos da UO exige data de validade.',
    }),
    field('patlasv4proto-tdoc-ativo', 'Ativo', 'boolean', undefined, {
      required: true,
      spec: 'Tipos inativos não aparecem em novos cadastros.',
    }),
    field('patlasv4proto-tdoc-descricao', 'Descrição', 'text', undefined, {
      size: 'large',
      textLong: true,
      spec: 'Orientação de uso ou base legal.',
    }),
  ],
  exampleValuePresets: TIPOS_DOCUMENTO.map((t, i) => ({
    id: `patlasv4proto-p-tdoc-${i + 1}`,
    name: t.nome,
    iconColor: ['#0c4a6e', '#7c3aed', '#0d9488', '#b45309', '#c026d3'][i % 5],
    fieldValues: {
      'patlasv4proto-tdoc-nome': t.nome,
      'patlasv4proto-tdoc-categoria': t.categoria,
      'patlasv4proto-tdoc-mascara': t.mascara,
      'patlasv4proto-tdoc-exige-validade': t.exigeValidade,
      'patlasv4proto-tdoc-ativo': true,
    },
  })),
  activeExamplePresetId: 'patlasv4proto-p-tdoc-1',
}

const formUoDocumento = {
  id: FORM_UO_DOC,
  name: 'UO — Documento',
  sectionLayout: 'none',
  fields: [
    field('patlasv4proto-uodoc-tipo', 'Tipo', 'reference', undefined, {
      required: true,
      relevance: 'highlight',
      linkedFormId: FORM_TIPO_DOC,
      spec: 'Referência ao cadastro Tipo Documento.',
    }),
    field('patlasv4proto-uodoc-numero', 'Número', 'text', undefined, {
      required: true,
      relevance: 'identity',
      spec: 'Número ou identificador do documento (ex.: 53.202.820/0001-47 para CNPJ).',
    }),
    field('patlasv4proto-uodoc-data-cadastro', 'Data de cadastro', 'date', undefined, {
      required: true,
      spec: 'Data em que o documento foi registrado na organização.',
    }),
    field('patlasv4proto-uodoc-validade', 'Validade', 'date', undefined, {
      required: false,
      spec: 'Data de vencimento. Obrigatório quando o tipo exige validade.',
    }),
    field('patlasv4proto-uodoc-arquivo', 'Arquivo', 'file', undefined, {
      spec: 'Upload do arquivo digitalizado ou certidão emitida.',
    }),
  ],
}

const tributosSections = [
  { id: SEC_TRIB, title: 'Tributos', icon: 'account_balance' },
  { id: SEC_TRIB_ID, title: 'Identificação fiscal', icon: 'badge', parentSectionId: SEC_TRIB },
  { id: SEC_TRIB_REG, title: 'Regime tributário', icon: 'gavel', parentSectionId: SEC_TRIB },
  { id: SEC_TRIB_NFSE, title: 'NFS-e (serviços)', icon: 'receipt_long', parentSectionId: SEC_TRIB },
  { id: SEC_TRIB_NFE, title: 'NF-e (mercadorias)', icon: 'inventory_2', parentSectionId: SEC_TRIB },
  { id: SEC_TRIB_FED, title: 'Tributos federais sobre receita', icon: 'public', parentSectionId: SEC_TRIB },
  { id: SEC_TRIB_RET, title: 'Retenções na fonte', icon: 'percent', parentSectionId: SEC_TRIB },
  { id: SEC_TRIB_PREV, title: 'Previdenciário (INSS/FPAS)', icon: 'health_and_safety', parentSectionId: SEC_TRIB },
  { id: SEC_TRIB_REF, title: 'Reforma tributária (CBS/IBS)', icon: 'update', parentSectionId: SEC_TRIB },
  { id: SEC_TRIB_CERT, title: 'Certificado digital', icon: 'verified_user', parentSectionId: SEC_TRIB },
]

const tributosFields = [
  // Identificação fiscal
  field('patlasv4proto-uo-trib-inscricao-estadual', 'Inscrição Estadual (IE)', 'text', SEC_TRIB_ID, {
    spec: 'Obrigatória para contribuintes de ICMS. Isento quando aplicável.',
  }),
  field('patlasv4proto-uo-trib-inscricao-municipal', 'Inscrição Municipal (IM)', 'text', SEC_TRIB_ID, {
    spec: 'Cadastro na Prefeitura para ISS e emissão de NFS-e.',
  }),
  field('patlasv4proto-uo-trib-ccm', 'CCM — Cadastro de Contribuintes Mobiliário', 'text', SEC_TRIB_ID, {
    spec: 'Número do cadastro mobiliário municipal.',
  }),
  field('patlasv4proto-uo-trib-cnae-principal', 'CNAE fiscal principal', 'text', SEC_TRIB_ID, {
    spec: 'Código CNAE da atividade principal (ex.: 6201-5/01).',
  }),
  field('patlasv4proto-uo-trib-cnae-secundarios', 'CNAEs fiscais secundários', 'text', SEC_TRIB_ID, {
    size: 'large',
    textLong: true,
    spec: 'Lista de CNAEs secundários, separados por vírgula.',
  }),
  field('patlasv4proto-uo-trib-codigo-servico-lc116', 'Código do serviço (LC 116/2003)', 'text', SEC_TRIB_ID, {
    spec: 'Item da lista de serviços para ISS e NFS-e (ex.: 1.01).',
  }),
  field('patlasv4proto-uo-trib-codigo-nbs', 'Código NBS', 'text', SEC_TRIB_ID, {
    spec: 'Nomenclatura Brasileira de Serviços — obrigatório em NFS-e nacional.',
  }),
  field('patlasv4proto-uo-trib-cod-trib-municipio', 'Código de tributação municipal', 'text', SEC_TRIB_ID, {
    spec: 'Código interno do município para o serviço prestado.',
  }),
  field('patlasv4proto-uo-trib-municipio-incidencia-iss', 'Município de incidência do ISS', 'text', SEC_TRIB_ID, {
    spec: 'Município onde o ISS é devido (prestação ou estabelecimento).',
  }),
  // Regime
  field('patlasv4proto-uo-trib-regime', 'Regime tributário', 'textOptions', SEC_TRIB_REG, {
    required: false,
    options: [
      'Simples Nacional',
      'Lucro Presumido',
      'Lucro Real',
      'MEI',
      'Imune',
      'Isento',
    ],
    spec: 'Regime federal principal da pessoa jurídica.',
  }),
  field('patlasv4proto-uo-trib-anexo-simples', 'Anexo do Simples Nacional', 'textOptions', SEC_TRIB_REG, {
    options: ['Anexo I', 'Anexo II', 'Anexo III', 'Anexo IV', 'Anexo V', 'Não aplicável'],
    spec: 'Anexo de enquadramento quando optante pelo Simples.',
  }),
  field('patlasv4proto-uo-trib-data-opcao-simples', 'Data de opção pelo Simples', 'date', SEC_TRIB_REG, {}),
  field('patlasv4proto-uo-trib-optante-iss-fixo', 'Optante por ISS fixo?', 'boolean', SEC_TRIB_REG, {
    spec: 'Autônomos/profissionais com ISS valor fixo municipal.',
  }),
  // NFS-e
  field('patlasv4proto-uo-trib-emite-nfse', 'Emite NFS-e?', 'boolean', SEC_TRIB_NFSE, {
    spec: 'Prestação de serviços com nota fiscal de serviço eletrônica.',
  }),
  field('patlasv4proto-uo-trib-provedor-nfse', 'Provedor / sistema NFS-e', 'text', SEC_TRIB_NFSE, {
    spec: 'Ex.: GINFES, Betha, Nota Carioca, NFS-e Nacional.',
  }),
  field('patlasv4proto-uo-trib-serie-rps', 'Série do RPS', 'text', SEC_TRIB_NFSE, { size: 'small' }),
  field('patlasv4proto-uo-trib-numero-rps', 'Número atual do RPS', 'number', SEC_TRIB_NFSE, { size: 'small' }),
  field('patlasv4proto-uo-trib-aliquota-iss', 'Alíquota ISS (%)', 'text', SEC_TRIB_NFSE, {
    size: 'small',
    spec: 'Entre 2% e 5% conforme município e serviço (LC 116).',
  }),
  field('patlasv4proto-uo-trib-iss-retido-tomador', 'ISS retido pelo tomador?', 'boolean', SEC_TRIB_NFSE, {
    spec: 'Retenção municipal na NFS-e quando o tomador é responsável.',
  }),
  field('patlasv4proto-uo-trib-resp-retencao-iss', 'Responsável retenção ISS', 'textOptions', SEC_TRIB_NFSE, {
    options: ['Prestador', 'Tomador', 'Intermediário'],
  }),
  field('patlasv4proto-uo-trib-incentivo-fiscal-iss', 'Possui incentivo fiscal ISS?', 'boolean', SEC_TRIB_NFSE, {}),
  field('patlasv4proto-uo-trib-deducoes-iss', 'Deduções permitidas no ISS', 'text', SEC_TRIB_NFSE, {
    textLong: true,
    spec: 'Materiais, subempreitadas etc., conforme legislação municipal.',
  }),
  // NF-e
  field('patlasv4proto-uo-trib-emite-nfe', 'Emite NF-e?', 'boolean', SEC_TRIB_NFE, {
    spec: 'Circulação de mercadorias ou produtos.',
  }),
  field('patlasv4proto-uo-trib-serie-nfe', 'Série da NF-e', 'text', SEC_TRIB_NFE, { size: 'small' }),
  field('patlasv4proto-uo-trib-numero-nfe', 'Número atual da NF-e', 'number', SEC_TRIB_NFE, { size: 'small' }),
  field('patlasv4proto-uo-trib-contribuinte-icms', 'Contribuinte ICMS?', 'boolean', SEC_TRIB_NFE, {}),
  field('patlasv4proto-uo-trib-indicador-ie', 'Indicador da IE', 'textOptions', SEC_TRIB_NFE, {
    options: ['Contribuinte ICMS', 'Contribuinte isento', 'Não contribuinte'],
  }),
  field('patlasv4proto-uo-trib-csosn', 'CSOSN (Simples)', 'text', SEC_TRIB_NFE, {
    size: 'small',
    spec: 'Código de Situação da Operação — Simples Nacional.',
  }),
  field('patlasv4proto-uo-trib-cst-icms', 'CST ICMS', 'text', SEC_TRIB_NFE, { size: 'small' }),
  field('patlasv4proto-uo-trib-aliquota-icms-interna', 'Alíquota ICMS interna (%)', 'text', SEC_TRIB_NFE, {
    size: 'small',
    spec: 'Operações dentro do estado (UF).',
  }),
  field('patlasv4proto-uo-trib-aliquota-icms-interest', 'Alíquota ICMS interestadual (%)', 'text', SEC_TRIB_NFE, {
    size: 'small',
    spec: 'Operações entre estados — conforme convênio/UF destino.',
  }),
  field('patlasv4proto-uo-trib-substituto-icms', 'Substituto tributário ICMS (ST)?', 'boolean', SEC_TRIB_NFE, {}),
  field('patlasv4proto-uo-trib-inscricao-suframa', 'Inscrição SUFRAMA', 'text', SEC_TRIB_NFE, {
    spec: 'Zona Franca de Manaus — benefícios fiscais.',
  }),
  field('patlasv4proto-uo-trib-contribuinte-ipi', 'Contribuinte IPI?', 'boolean', SEC_TRIB_NFE, {}),
  field('patlasv4proto-uo-trib-cst-ipi', 'CST IPI', 'text', SEC_TRIB_NFE, { size: 'small' }),
  field('patlasv4proto-uo-trib-enquadramento-ipi', 'Enquadramento IPI', 'text', SEC_TRIB_NFE, { size: 'small' }),
  field('patlasv4proto-uo-trib-cfop-padrao', 'CFOP padrão de venda', 'text', SEC_TRIB_NFE, {
    size: 'small',
    spec: 'Código Fiscal de Operações e Prestações.',
  }),
  // Federais
  field('patlasv4proto-uo-trib-pis-cst', 'CST PIS', 'text', SEC_TRIB_FED, { size: 'small' }),
  field('patlasv4proto-uo-trib-pis-aliquota', 'Alíquota PIS (%)', 'text', SEC_TRIB_FED, {
    size: 'small',
    spec: 'Cumulativo 0,65% ou não cumulativo 1,65%.',
  }),
  field('patlasv4proto-uo-trib-cofins-cst', 'CST COFINS', 'text', SEC_TRIB_FED, { size: 'small' }),
  field('patlasv4proto-uo-trib-cofins-aliquota', 'Alíquota COFINS (%)', 'text', SEC_TRIB_FED, {
    size: 'small',
    spec: 'Cumulativo 3% ou não cumulativo 7,6%.',
  }),
  field('patlasv4proto-uo-trib-csll-aliquota', 'Alíquota CSLL (%)', 'text', SEC_TRIB_FED, {
    size: 'small',
    spec: 'Sobre lucro — varia por regime (ex.: 9% Lucro Real).',
  }),
  field('patlasv4proto-uo-trib-irpj-forma', 'Forma de tributação IRPJ', 'textOptions', SEC_TRIB_FED, {
    options: ['Lucro Real', 'Lucro Presumido', 'Arbitrado', 'Isento', 'Imune'],
  }),
  field('patlasv4proto-uo-trib-ipi-aliquota', 'Alíquota IPI (%)', 'text', SEC_TRIB_FED, { size: 'small' }),
  // Retenções
  field('patlasv4proto-uo-trib-ret-irrf', 'Sujeito a retenção IRRF?', 'boolean', SEC_TRIB_RET, {
    spec: 'Serviços profissionais — alíquota típica 1,5%.',
  }),
  field('patlasv4proto-uo-trib-ret-irrf-aliquota', 'Alíquota IRRF retido (%)', 'text', SEC_TRIB_RET, { size: 'small' }),
  field('patlasv4proto-uo-trib-ret-pis', 'Sujeito a retenção PIS?', 'boolean', SEC_TRIB_RET, {
    spec: 'Retenção federal em NFS — típico 0,65%.',
  }),
  field('patlasv4proto-uo-trib-ret-pis-aliquota', 'Alíquota PIS retido (%)', 'text', SEC_TRIB_RET, { size: 'small' }),
  field('patlasv4proto-uo-trib-ret-cofins', 'Sujeito a retenção COFINS?', 'boolean', SEC_TRIB_RET, {
    spec: 'Retenção federal em NFS — típico 3%.',
  }),
  field('patlasv4proto-uo-trib-ret-cofins-aliquota', 'Alíquota COFINS retida (%)', 'text', SEC_TRIB_RET, { size: 'small' }),
  field('patlasv4proto-uo-trib-ret-csll', 'Sujeito a retenção CSLL?', 'boolean', SEC_TRIB_RET, {
    spec: 'Retenção federal em NFS — típico 1%.',
  }),
  field('patlasv4proto-uo-trib-ret-csll-aliquota', 'Alíquota CSLL retida (%)', 'text', SEC_TRIB_RET, { size: 'small' }),
  field('patlasv4proto-uo-trib-ret-inss', 'Sujeito a retenção INSS (11%)?', 'boolean', SEC_TRIB_RET, {
    spec: 'Cessão de mão de obra / empreitada — INSS sobre nota.',
  }),
  field('patlasv4proto-uo-trib-ret-inss-aliquota', 'Alíquota INSS retido (%)', 'text', SEC_TRIB_RET, { size: 'small' }),
  field('patlasv4proto-uo-trib-ret-iss', 'Sujeito a retenção ISS?', 'boolean', SEC_TRIB_RET, {}),
  field('patlasv4proto-uo-trib-valor-minimo-retencao', 'Valor mínimo retenção federal (R$)', 'text', SEC_TRIB_RET, {
    size: 'small',
    spec: 'Limite mínimo para recolhimento conjunto (ex.: R$ 215,05).',
  }),
  // Previdenciário
  field('patlasv4proto-uo-trib-fpas', 'FPAS', 'text', SEC_TRIB_PREV, {
    size: 'small',
    spec: 'Código FPAS na GFIP/eSocial.',
  }),
  field('patlasv4proto-uo-trib-codigo-terceiros', 'Código de terceiros', 'text', SEC_TRIB_PREV, { size: 'small' }),
  field('patlasv4proto-uo-trib-rat', 'RAT — Risco Acidente do Trabalho (%)', 'text', SEC_TRIB_PREV, { size: 'small' }),
  field('patlasv4proto-uo-trib-fap', 'FAP — Fator Acidentário de Prevenção', 'text', SEC_TRIB_PREV, { size: 'small' }),
  field('patlasv4proto-uo-trib-cnae-previdenciario', 'CNAE previdenciário', 'text', SEC_TRIB_PREV, {
    spec: 'CNAE para cálculo de contribuição patronal.',
  }),
  field('patlasv4proto-uo-trib-cprb', 'Contribuinte CPRB?', 'boolean', SEC_TRIB_PREV, {
    spec: 'Contribuição Previdenciária sobre Receita Bruta (setores específicos).',
  }),
  // Reforma CBS/IBS
  field('patlasv4proto-uo-trib-contribuinte-cbs', 'Contribuinte CBS?', 'boolean', SEC_TRIB_REF, {
    spec: 'Contribuição sobre Bens e Serviços — reforma tributária.',
  }),
  field('patlasv4proto-uo-trib-aliquota-cbs', 'Alíquota CBS (%)', 'text', SEC_TRIB_REF, { size: 'small' }),
  field('patlasv4proto-uo-trib-contribuinte-ibs', 'Contribuinte IBS?', 'boolean', SEC_TRIB_REF, {
    spec: 'Imposto sobre Bens e Serviços (estadual/municipal).',
  }),
  field('patlasv4proto-uo-trib-aliquota-ibs-uf', 'Alíquota IBS UF (%)', 'text', SEC_TRIB_REF, { size: 'small' }),
  field('patlasv4proto-uo-trib-aliquota-ibs-mun', 'Alíquota IBS Município (%)', 'text', SEC_TRIB_REF, { size: 'small' }),
  // Certificado
  field('patlasv4proto-uo-trib-cert-tipo', 'Tipo certificado digital', 'textOptions', SEC_TRIB_CERT, {
    options: ['A1', 'A3', 'Não possui'],
  }),
  field('patlasv4proto-uo-trib-cert-emissor', 'Autoridade certificadora', 'text', SEC_TRIB_CERT, {
    spec: 'Ex.: Serasa, Certisign, Soluti.',
  }),
  field('patlasv4proto-uo-trib-cert-validade', 'Validade do certificado', 'date', SEC_TRIB_CERT, {}),
]

function patchUoForm(uo) {
  const hasTribTab = uo.sections.some((s) => s.id === SEC_TRIB)
  if (!hasTribTab) {
    uo.sections.push(...tributosSections)
  }

  const docGridId = 'patlasv4proto-uo-documentos'
  const hasDocGrid = uo.fields.some((f) => f.id === docGridId)
  if (!hasDocGrid) {
    const logoIdx = uo.fields.findIndex((f) => f.id === 'patlasv4proto-uo-logo')
    const docField = {
      id: docGridId,
      label: 'Documentos',
      type: 'embeddedReference',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'common',
      sectionId: SEC_DOC,
      linkedFormId: FORM_UO_DOC,
      embeddedDisplay: 'table',
      spec: 'Grade de documentos da organização. Colunas: Tipo, Número, Data de cadastro, Validade e Arquivo.',
    }
    if (logoIdx >= 0) uo.fields.splice(logoIdx, 0, docField)
    else uo.fields.push(docField)
  }

  const existingTribIds = new Set(uo.fields.map((f) => f.id))
  for (const f of tributosFields) {
    if (!existingTribIds.has(f.id)) uo.fields.push(f)
  }

  uo.metadata =
    'Protótipo Atlas — Unidade Organizacional. Abas: Dados da Unidade, Documentos (grade + logo), Dados de contato, Localização, Tributos (NFS-e/NF-e).'

  // Exemplo MTI: documento CNPJ + tributos básicos
  const mtiPreset = uo.exampleValuePresets?.find(
    (p) => p.id === 'patlasv4proto-p-unidade-organizacional-mti',
  )
  if (mtiPreset) {
    mtiPreset.embeddedRowsByFieldId = mtiPreset.embeddedRowsByFieldId ?? {}
    mtiPreset.embeddedRowsByFieldId[docGridId] = [
      {
        'patlasv4proto-uodoc-tipo': 'CNPJ',
        'patlasv4proto-uodoc-numero': '03.549.382/0001-06',
        'patlasv4proto-uodoc-data-cadastro': '01/01/2020',
        'patlasv4proto-uodoc-validade': '',
        'patlasv4proto-uodoc-arquivo': 'cnpj_mti.pdf',
      },
      {
        'patlasv4proto-uodoc-tipo': 'Declaração de Habilitação',
        'patlasv4proto-uodoc-numero': 'DH-2026-001',
        'patlasv4proto-uodoc-data-cadastro': '15/01/2026',
        'patlasv4proto-uodoc-validade': '31/12/2026',
        'patlasv4proto-uodoc-arquivo': 'declaracao_habilitacao.pdf',
      },
    ]
    Object.assign(mtiPreset.fieldValues, {
      'patlasv4proto-uo-trib-inscricao-estadual': 'Isento',
      'patlasv4proto-uo-trib-inscricao-municipal': '123456',
      'patlasv4proto-uo-trib-cnae-principal': '6201-5/01',
      'patlasv4proto-uo-trib-codigo-servico-lc116': '1.01',
      'patlasv4proto-uo-trib-regime': 'Lucro Real',
      'patlasv4proto-uo-trib-emite-nfse': true,
      'patlasv4proto-uo-trib-aliquota-iss': '5',
      'patlasv4proto-uo-trib-emite-nfe': false,
      'patlasv4proto-uo-trib-contribuinte-icms': false,
      'patlasv4proto-uo-trib-indicador-ie': 'Contribuinte isento',
      'patlasv4proto-uo-trib-pis-aliquota': '1,65',
      'patlasv4proto-uo-trib-cofins-aliquota': '7,6',
      'patlasv4proto-uo-trib-cert-tipo': 'A1',
    })
  }

  return uo
}

function patchWorkspaces(ws) {
  const pkg = ws[0].packages.find((p) => p.id === 'pkg-patlasv4-proto-cadastro')
  if (!pkg) return ws
  const exists = pkg.classes.some((c) => c.linkedFormId === FORM_TIPO_DOC)
  if (!exists) {
    const afterNivel = pkg.classes.findIndex((c) => c.id === 'cls-patlasv4-proto-niv')
    const insertAt = afterNivel >= 0 ? afterNivel + 1 : 0
    pkg.classes.splice(insertAt, 0, {
      id: 'cls-patlasv4-proto-tdoc',
      name: 'Tipo Documento',
      linkedFormId: FORM_TIPO_DOC,
      linkedFormExamplePresetIds: TIPOS_DOCUMENTO.map((_, i) => `patlasv4proto-p-tdoc-${i + 1}`),
    })
  }
  return ws
}

function patchGroups(groups) {
  groups.assignments[FORM_TIPO_DOC] = 'grp-patlasv4-proto-cadastro'
  groups.assignments[FORM_UO_DOC] = 'grp-patlasv4-proto-embutido'

  const cadastro = groups.memberOrderByGroup['grp-patlasv4-proto-cadastro']
  if (!cadastro.includes(FORM_TIPO_DOC)) {
    const uoIdx = cadastro.indexOf(FORM_UO)
    const at = uoIdx >= 0 ? uoIdx : cadastro.length
    cadastro.splice(at, 0, FORM_TIPO_DOC)
  }

  const emb = groups.memberOrderByGroup['grp-patlasv4-proto-embutido']
  if (!emb.includes(FORM_UO_DOC)) {
    emb.unshift(FORM_UO_DOC)
  }

  return groups
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  if (!forms.some((f) => f.id === FORM_TIPO_DOC)) {
    const nivelIdx = forms.findIndex((f) => f.id === 'form-patlasv4-proto-nivel-organizacional')
    forms.splice(nivelIdx + 1, 0, formTipoDocumento, formUoDocumento)
  } else if (!forms.some((f) => f.id === FORM_UO_DOC)) {
    const tipoIdx = forms.findIndex((f) => f.id === FORM_TIPO_DOC)
    forms.splice(tipoIdx + 1, 0, formUoDocumento)
  } else {
    const ti = forms.findIndex((f) => f.id === FORM_TIPO_DOC)
    const ui = forms.findIndex((f) => f.id === FORM_UO_DOC)
    forms[ti] = formTipoDocumento
    forms[ui] = formUoDocumento
  }

  const uoIdx = forms.findIndex((f) => f.id === FORM_UO)
  if (uoIdx < 0) {
    console.error('Formulário UO não encontrado.')
    process.exit(1)
  }
  forms[uoIdx] = patchUoForm(forms[uoIdx])

  const workspaces = patchWorkspaces(JSON.parse(fs.readFileSync(WORKSPACES_PATH, 'utf8')))
  const groups = patchGroups(JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8')))

  fs.writeFileSync(FORMS_PATH, JSON.stringify(forms, null, 2) + '\n', 'utf8')
  fs.writeFileSync(WORKSPACES_PATH, JSON.stringify(workspaces, null, 2) + '\n', 'utf8')
  fs.writeFileSync(GROUPS_PATH, JSON.stringify(groups, null, 2) + '\n', 'utf8')

  console.log('✓ Tipo Documento:', TIPOS_DOCUMENTO.length, 'presets')
  console.log('✓ UO — Documento (embutido): 5 campos (sem Campos adicionais)')
  console.log('✓ UO — aba Tributos:', tributosFields.length, 'campos em', tributosSections.length, 'subseções')
  console.log('✓ workspaces.json e class-groups.json atualizados')
}

main()
