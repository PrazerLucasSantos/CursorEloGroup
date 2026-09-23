/**
 * Catálogo Fase 1 — Projeto Atlas (consulta + item de proposta).
 * Sem CSV, integração, homologação avançada ou gestão de catálogo backoffice.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildContratoFase1Form,
  buildTramiteAssinaturaForm,
  EMB_TRAMITES_ASSINATURA,
  PROPOSTA_SEC_ASSINATURAS,
  propostaAssinaturaFields,
  TRAMITES_CADEIA_PADRAO,
  TRAMITES_SEM_PARCEIRO,
} from './projeto-atlas-assinaturas-forms.mjs'
import {
  PROPOSTA_METODOS_PARAM,
  PROPOSTA_SEC_PROCESSO,
  propostaParametrizacaoFields,
} from './projeto-atlas-parametrizacao-forms.mjs'
import { allCotacaoForms, flowPortalCotacao, portalCotacaoCliente } from './projeto-atlas-cotacao-forms.mjs'
import { licLinePresets, licRows } from './data/projeto-atlas-licencas-catalogo.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/projeto-atlas/epics/projeto-atlas-fase1')
const outPath = path.join(epicDir, 'forms.json')
const portalsPath = path.join(epicDir, 'portals.json')
const flowsPath = path.join(epicDir, 'flows.json')

const STATUS_PRODUTO = ['Ativo', 'Inativo', 'Suspenso', 'Em validação']
const METRICA = ['USN', 'HST', 'UST', 'LIC', 'GB', 'VM', 'UN']
const COBRANCA = ['Sob Demanda', 'Mensal', 'Anual', 'Pro-Rata']
const SIM_NAO = ['Sim', 'Não']
const ORIGEM_CATALOGO = ['Produto vigente', 'Licença', 'Serviço', 'Manual']

const SNAPSHOT_SPEC =
  'Cópia congelada na proposta. Se o catálogo mudar depois, a proposta mantém este valor.'

function field(id, label, type, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.currency ? { currency: true } : {}),
    ...(opts.alertVariant ? { alertVariant: opts.alertVariant } : {}),
    ...(opts.alertTitle ? { alertTitle: opts.alertTitle } : {}),
    ...(opts.alertMessage ? { alertMessage: opts.alertMessage } : {}),
    spec: opts.spec ?? '',
  }
}

const FORM_PRODUTO_VIGENTE_LINHA = 'form-patlas-produto-vigente-linha'
const FORM_PRODUTOS_VIGENTES = 'form-patlas-produtos-vigentes'
const FORM_LICENCA_LINHA = 'form-patlas-licenca-linha'
const FORM_CATALOGO_LICENCAS = 'form-patlas-catalogo-licencas'
const FORM_SERVICO_LINHA = 'form-patlas-servico-linha'
const FORM_CATALOGO_SERVICOS = 'form-patlas-catalogo-servicos'
const FORM_PROPOSTA_ITEM = 'form-patlas-proposta-item'
const FORM_PROPOSTA = 'form-patlas-proposta-fase1'

const EMB_VIGENTES = 'emb_patlas_produtos_vigentes'
const EMB_LICENCAS = 'emb_patlas_licencas_catalogo'
const EMB_SERVICOS = 'emb_patlas_servicos_catalogo'
const EMB_ITENS_PROPOSTA = 'emb_patlas_itens_proposta'

function produtoVigenteLinhaFields() {
  return [
    field('patlas-pv-siag', 'Código Siag', 'text', { size: 'small', required: true, relevance: 'highlight' }),
    field('patlas-pv-protheus', 'Código Protheus / InfoCenter', 'text', {
      size: 'small',
      required: true,
      relevance: 'highlight',
    }),
    field('patlas-pv-descricao', 'Descrição do produto', 'text', {
      size: 'large',
      textLong: true,
      required: true,
      relevance: 'identity',
    }),
    field('patlas-pv-solucao', 'Solução', 'text', { size: 'medium', required: true, relevance: 'highlight' }),
    field('patlas-pv-metrica', 'Métrica', 'textOptions', {
      size: 'small',
      required: true,
      options: METRICA,
    }),
    field('patlas-pv-cobranca', 'Cobrança', 'textOptions', {
      size: 'medium',
      required: true,
      options: COBRANCA,
    }),
    field('patlas-pv-valor-unitario', 'Valor unitário (R$)', 'decimal', {
      currency: true,
      required: true,
      relevance: 'highlight',
    }),
    field('patlas-pv-fator-conversao', 'Fator de conversão', 'text', { size: 'small' }),
    field('patlas-pv-focal-vendas', 'Focal de vendas', 'text', { size: 'medium' }),
    field('patlas-pv-focal-pos', 'Focal de pós-vendas', 'text', { size: 'medium' }),
    field('patlas-pv-unidade-dtic', 'Unidade DTIC', 'text', { size: 'medium', required: true }),
    field('patlas-pv-parceiro', 'Parceiro', 'text', { size: 'medium', required: true }),
    field('patlas-pv-link-parceria', 'Link do catálogo de parceria', 'text', { size: 'large' }),
    field('patlas-pv-status', 'Status do produto', 'textOptions', {
      size: 'medium',
      required: true,
      relevance: 'highlight',
      options: STATUS_PRODUTO,
      spec: 'Somente itens Ativos entram na seleção padrão da proposta.',
    }),
  ]
}

function licencaLinhaFields() {
  const secF1 = 'sec-patlas-lic-fase1'
  const secRef = 'sec-patlas-lic-referencia'
  return [
    field('patlas-lic-parceria', 'Parceria', 'text', {
      sectionId: secF1,
      required: true,
      relevance: 'highlight',
    }),
    field('patlas-lic-categoria', 'Categoria', 'text', { sectionId: secF1 }),
    field('patlas-lic-part-number', 'PART Number', 'text', { sectionId: secF1 }),
    field('patlas-lic-produto-catalogo', 'Produto do catálogo', 'text', {
      sectionId: secF1,
      size: 'large',
      textLong: true,
      required: true,
      relevance: 'identity',
    }),
    field('patlas-lic-descricao-solucao', 'Descrição da solução ofertada', 'text', {
      sectionId: secF1,
      size: 'large',
      textLong: true,
      required: true,
    }),
    field('patlas-lic-esp01', 'Especificação 01', 'text', { sectionId: secF1, size: 'large', textLong: true }),
    field('patlas-lic-esp02', 'Especificação 02', 'text', { sectionId: secF1, size: 'large', textLong: true }),
    field('patlas-lic-esp03', 'Especificação 03', 'text', { sectionId: secF1, size: 'large', textLong: true }),
    field('patlas-lic-esp04', 'Especificação 04', 'text', { sectionId: secF1, size: 'large', textLong: true }),
    field('patlas-lic-metrica', 'Métrica', 'textOptions', {
      sectionId: secF1,
      size: 'small',
      required: true,
      options: METRICA,
    }),
    field('patlas-lic-valor', 'Valor (R$)', 'decimal', {
      sectionId: secF1,
      currency: true,
      required: true,
      relevance: 'highlight',
    }),
    field('patlas-lic-tipo-cobranca', 'Tipo de cobrança', 'textOptions', {
      sectionId: secF1,
      options: COBRANCA,
    }),
    field('patlas-lic-recorrencia', 'Recorrência da cobrança', 'text', { sectionId: secF1 }),
    field('patlas-lic-status-parceria', 'Status da parceria', 'text', { sectionId: secF1 }),
    field('patlas-lic-vigencia', 'Vigência', 'text', { sectionId: secF1 }),
    field('patlas-lic-periodo-minimo', 'Período mínimo', 'text', { sectionId: secF1 }),
    field('patlas-lic-catalogo', 'Catálogo', 'text', { sectionId: secF1 }),
    field('patlas-lic-protheus', 'Código Protheus', 'text', { sectionId: secF1, size: 'small', required: true }),
    field('patlas-lic-siag', 'Código Siag', 'text', { sectionId: secF1, size: 'small', required: true }),
    field('patlas-lic-universal', 'Universal', 'textOptions', { sectionId: secF1, options: SIM_NAO }),
    field('patlas-lic-individualizado', 'Individualizado', 'textOptions', {
      sectionId: secF1,
      options: SIM_NAO,
    }),
    field('patlas-lic-grupo-atendimento', 'Grupo de atendimento', 'text', { sectionId: secF1 }),
    field('patlas-lic-status-atual', 'Status atual', 'textOptions', {
      sectionId: secF1,
      required: true,
      relevance: 'highlight',
      options: STATUS_PRODUTO,
    }),
    field('patlas-lic-data-atualizacao-preco', 'Data de atualização de preço', 'date', {
      sectionId: secRef,
      spec: 'Consulta na Fase 1. Gestão de reajuste fora do escopo.',
    }),
    field('patlas-lic-ultimo-indice-reajuste', 'Último índice de reajuste', 'text', {
      sectionId: secRef,
      spec: 'Consulta na Fase 1. Histórico completo fora do escopo.',
    }),
    field('patlas-lic-ultima-homologacao', 'Última homologação', 'text', {
      sectionId: secRef,
      spec: 'Consulta na Fase 1. Fluxo de homologação fora do escopo.',
    }),
  ]
}

function servicoLinhaFields() {
  const sec = 'sec-patlas-srv-fase1'
  return [
    field('patlas-srv-parceria', 'Parceria / nome comercial', 'text', {
      sectionId: sec,
      required: true,
      relevance: 'highlight',
    }),
    field('patlas-srv-produto-catalogo', 'Produto do catálogo comercial', 'text', {
      sectionId: sec,
      size: 'large',
      textLong: true,
      required: true,
      relevance: 'identity',
    }),
    field('patlas-srv-descricao', 'Descrição do serviço', 'text', {
      sectionId: sec,
      size: 'large',
      textLong: true,
      required: true,
    }),
    field('patlas-srv-categoria', 'Categoria do objeto comercial', 'text', { sectionId: sec, required: true }),
    field('patlas-srv-complexidade', 'Complexidade', 'textOptions', {
      sectionId: sec,
      required: true,
      options: ['Sem Complexidade', 'Baixo', 'Média', 'Alto'],
    }),
    field('patlas-srv-metrica', 'Métrica', 'textOptions', {
      sectionId: sec,
      size: 'small',
      required: true,
      options: METRICA,
    }),
    field('patlas-srv-qtde-hst-ust', 'Quantidade HST/UST por execução', 'number', {
      sectionId: sec,
      size: 'small',
      required: true,
    }),
    field('patlas-srv-valor-unitario', 'Valor unitário (R$)', 'decimal', {
      sectionId: sec,
      currency: true,
      required: true,
      relevance: 'highlight',
    }),
    field('patlas-srv-valor-comercializacao', 'Valor de comercialização (R$)', 'decimal', {
      sectionId: sec,
      currency: true,
      spec: 'Valor de referência comercial (quando diferente do unitário).',
    }),
    field('patlas-srv-versao-catalogo', 'Versão do catálogo', 'text', { sectionId: sec, size: 'small' }),
    field('patlas-srv-grupo', 'Grupo', 'text', { sectionId: sec }),
    field('patlas-srv-tipo-cobranca', 'Tipo de cobrança', 'textOptions', {
      sectionId: sec,
      required: true,
      options: COBRANCA,
    }),
    field('patlas-srv-recorrencia', 'Recorrência da cobrança', 'text', { sectionId: sec, required: true }),
    field('patlas-srv-siag', 'Código Siag', 'text', { sectionId: sec, size: 'small', required: true }),
    field('patlas-srv-protheus', 'Código Protheus', 'text', { sectionId: sec, size: 'small', required: true }),
    field('patlas-srv-universal', 'Universal', 'textOptions', { sectionId: sec, options: SIM_NAO }),
    field('patlas-srv-individualizado', 'Individualizado', 'textOptions', { sectionId: sec, options: SIM_NAO }),
    field('patlas-srv-status-parceria', 'Status da parceria', 'text', {
      sectionId: sec,
      required: true,
      relevance: 'highlight',
    }),
    field('patlas-srv-fator-conversao', 'Fator de conversão', 'text', { sectionId: sec, size: 'small' }),
    field('patlas-srv-parceiro', 'Parceiro', 'text', { sectionId: sec }),
    field('patlas-srv-unidade-dtic', 'Unidade DTIC', 'text', { sectionId: sec }),
  ]
}

function propostaItemFields() {
  const secSel = 'sec-patlas-pri-selecao'
  const secSnap = 'sec-patlas-pri-snapshot'
  const secCalc = 'sec-patlas-pri-calculo'
  const snap = (id, label, type, opts = {}) =>
    field(id, label, type, {
      ...opts,
      sectionId: secSnap,
      readOnly: true,
      spec: opts.spec ?? SNAPSHOT_SPEC,
    })
  return [
    field('patlas-pri-alerta-snapshot', 'Regra de cópia do catálogo', 'alert', {
      sectionId: secSel,
      size: 'large',
      readOnly: true,
      alertVariant: 'info',
      alertTitle: 'Cópia dos dados do catálogo',
      alertMessage:
        'O sistema guarda uma cópia dos dados do catálogo usados na proposta. Assim, se o catálogo mudar depois, a proposta antiga continua mostrando os dados usados quando foi criada.',
    }),
    field('patlas-pri-origem', 'Origem do catálogo', 'textOptions', {
      sectionId: secSel,
      required: true,
      relevance: 'highlight',
      options: ORIGEM_CATALOGO,
      spec: 'Define qual referência usar. Manual exige justificativa e preenchimento mínimo.',
    }),
    field('patlas-pri-ref-vigente', 'Produto vigente', 'reference', {
      sectionId: secSel,
      size: 'large',
      linkedFormId: FORM_PRODUTO_VIGENTE_LINHA,
      spec: 'Obrigatório quando origem = Produto vigente. Copia dados para o snapshot.',
    }),
    field('patlas-pri-ref-licenca', 'Licença', 'reference', {
      sectionId: secSel,
      size: 'large',
      linkedFormId: FORM_LICENCA_LINHA,
      spec: 'Obrigatório quando origem = Licença.',
    }),
    field('patlas-pri-ref-servico', 'Serviço', 'reference', {
      sectionId: secSel,
      size: 'large',
      linkedFormId: FORM_SERVICO_LINHA,
      spec: 'Obrigatório quando origem = Serviço.',
    }),
    field('patlas-pri-justificativa-manual', 'Justificativa item manual', 'text', {
      sectionId: secSel,
      size: 'large',
      textLong: true,
      spec: 'Obrigatória quando origem = Manual.',
    }),
    field('patlas-pri-quantidade', 'Quantidade', 'number', {
      sectionId: secCalc,
      size: 'small',
      required: true,
      relevance: 'highlight',
      spec: 'Informada na proposta. Usada para calcular valor total.',
    }),
    field('patlas-pri-valor-unitario-edit', 'Valor unitário na proposta (R$)', 'decimal', {
      sectionId: secCalc,
      currency: true,
      spec: 'Editável (manual) ou copiado do catálogo (somente leitura na prática após seleção).',
    }),
    field('patlas-pri-valor-total', 'Valor total (R$)', 'decimal', {
      sectionId: secCalc,
      currency: true,
      required: true,
      relevance: 'highlight',
      spec: 'Quantidade × valor unitário (protótipo: preenchimento ou cálculo simulado).',
    }),
    field('patlas-pri-valor-previsto', 'Valor previsto (R$)', 'decimal', {
      sectionId: secCalc,
      currency: true,
      relevance: 'highlight',
    }),
    snap('patlas-pri-descricao', 'Descrição do item', 'text', {
      size: 'large',
      textLong: true,
      relevance: 'identity',
    }),
    snap('patlas-pri-siag', 'Código Siag', 'text', { size: 'small' }),
    snap('patlas-pri-protheus', 'Código Protheus / InfoCenter', 'text', { size: 'small' }),
    snap('patlas-pri-solucao', 'Solução', 'text'),
    snap('patlas-pri-parceria', 'Parceria', 'text'),
    snap('patlas-pri-metrica', 'Métrica', 'text', { size: 'small' }),
    snap('patlas-pri-cobranca', 'Cobrança', 'text'),
    snap('patlas-pri-recorrencia', 'Recorrência da cobrança', 'text'),
    snap('patlas-pri-modelo-venda', 'Modelo de venda', 'text'),
    snap('patlas-pri-valor-unitario', 'Valor unitário (cópia)', 'decimal', { currency: true }),
    snap('patlas-pri-fator-conversao', 'Fator de conversão', 'text', { size: 'small' }),
    snap('patlas-pri-versao-catalogo', 'Versão do catálogo', 'text', { size: 'small' }),
    snap('patlas-pri-part-number', 'PART Number', 'text'),
    snap('patlas-pri-grupo', 'Grupo', 'text'),
    snap('patlas-pri-complexidade', 'Complexidade', 'text'),
    snap('patlas-pri-qtde-hst-ust', 'Quantidade HST/UST', 'number', { size: 'small' }),
    snap('patlas-pri-categoria', 'Categoria do objeto comercial', 'text'),
    snap('patlas-pri-tipo-cobranca', 'Tipo de cobrança', 'text'),
    snap('patlas-pri-universal', 'Universal', 'textOptions', { options: SIM_NAO }),
    snap('patlas-pri-individualizado', 'Individualizado', 'textOptions', { options: SIM_NAO }),
    snap('patlas-pri-status-parceria', 'Status da parceria', 'text'),
    snap('patlas-pri-unidade-dtic', 'Unidade DTIC', 'text'),
    snap('patlas-pri-focal-vendas', 'Focal de vendas', 'text'),
    snap('patlas-pri-focal-pos', 'Focal de pós-vendas', 'text'),
    snap('patlas-pri-link-catalogo', 'Link do catálogo', 'text', { size: 'large' }),
  ]
}

/** Catálogo oficial de produtos vigentes (planilha Fase 1). */
const PRODUTOS_VIGENTES_CATALOGO = [
  {
    presetId: 'patlas-pv-preset-1',
    presetName: 'MTI SaaS — Software',
    iconColor: '#0c1ba8',
    siag: '0016794',
    protheus: '32000440',
    descricao: 'MTI SaaS - Solução de Software Gerenciados',
    solucao: 'MTI SaaS',
    metrica: 'USN',
    valorUnitario: 1,
    fatorConversao: '1,00',
    focalVendas: 'Ícaro',
    unidadeDtic: 'UGSDG/UGSTI/UGITI',
    parceiro: 'MTI',
  },
  {
    presetId: 'patlas-pv-preset-2',
    presetName: 'MTI SaaS — Serviços técnicos',
    iconColor: '#0369a1',
    siag: '0016793',
    protheus: '32000441',
    descricao: 'MTI SaaS - Serviços Técnicos em Soluções de Software Gerenciados',
    solucao: 'MTI SaaS',
    metrica: 'HST',
    valorUnitario: 282.58,
    fatorConversao: '1,00',
    focalVendas: 'Ícaro',
    unidadeDtic: 'UGSDG/UGSTI/UGITI',
    parceiro: 'MTI',
  },
  {
    presetId: 'patlas-pv-preset-3',
    presetName: 'MTI Simplifica — Licenciamento',
    iconColor: '#7c3aed',
    siag: '0018015',
    protheus: '32000308',
    descricao:
      'MTI Simplifica - Licenciamento de Solução SaaS de Simplificação e Desburocratização de Processos',
    solucao: 'MTI Simplifica',
    metrica: 'USN',
    valorUnitario: 1,
    fatorConversao: '1,00',
    focalVendas: 'Ícaro',
    unidadeDtic: 'UGSTI',
    parceiro: 'Elogroup',
  },
  {
    presetId: 'patlas-pv-preset-4',
    presetName: 'MTI Simplifica — Serviços',
    iconColor: '#059669',
    siag: '0018016',
    protheus: '32000307',
    descricao:
      'MTI Simplifica - Serviços de Solução SaaS de Simplificação e Desburocratização de Processos',
    solucao: 'MTI Simplifica',
    metrica: 'UST',
    valorUnitario: 161.02,
    fatorConversao: '0,56',
    focalVendas: 'Ícaro',
    unidadeDtic: 'UGSTI',
    parceiro: 'Elogroup',
  },
  {
    presetId: 'patlas-pv-preset-5',
    presetName: 'MTI WORKSPACE',
    iconColor: '#1e40af',
    siag: '1102518',
    protheus: '32000601',
    descricao: 'MTI WORKSPACE - Soluções de Colaboração e Produtividade em Nuvem',
    solucao: 'MTI WORKSPACE',
    metrica: 'USN',
    valorUnitario: 1,
    fatorConversao: '1,00',
    focalVendas: 'Jessé Souza',
    unidadeDtic: 'UGSTI/GSUP',
    parceiro: 'Ingram',
  },
]

function produtoVigenteFieldValues(entry) {
  return {
    'patlas-pv-siag': entry.siag,
    'patlas-pv-protheus': entry.protheus,
    'patlas-pv-descricao': entry.descricao,
    'patlas-pv-solucao': entry.solucao,
    'patlas-pv-metrica': entry.metrica,
    'patlas-pv-cobranca': entry.cobranca ?? 'Sob Demanda',
    'patlas-pv-valor-unitario': entry.valorUnitario,
    'patlas-pv-fator-conversao': entry.fatorConversao ?? '1,00',
    'patlas-pv-focal-vendas': entry.focalVendas ?? 'Ícaro',
    'patlas-pv-focal-pos': entry.focalPos ?? 'Todos',
    'patlas-pv-unidade-dtic': entry.unidadeDtic,
    'patlas-pv-parceiro': entry.parceiro,
    'patlas-pv-link-parceria': entry.linkParceria ?? '',
    'patlas-pv-status': entry.status ?? 'Ativo',
  }
}

const pvRows = PRODUTOS_VIGENTES_CATALOGO.map(produtoVigenteFieldValues)
const pvLinePresets = PRODUTOS_VIGENTES_CATALOGO.map((entry) => ({
  id: entry.presetId,
  name: entry.presetName,
  iconColor: entry.iconColor,
  fieldValues: produtoVigenteFieldValues(entry),
}))
const pvRow1 = pvRows[0]
const pvRow2 = pvRows[1]
const licRow1 = licRows[0]
const srvRow1 = {
  'patlas-srv-parceria': 'MTI CLOUD',
  'patlas-srv-produto-catalogo': 'Treinamento técnico presencial — módulo introdutório cloud',
  'patlas-srv-descricao': 'Treinamento técnico presencial — módulo introdutório cloud',
  'patlas-srv-categoria': 'MTI CLOUD - Serviço Técnico em Nuvem',
  'patlas-srv-complexidade': 'Sem Complexidade',
  'patlas-srv-metrica': 'HST',
  'patlas-srv-qtde-hst-ust': 8,
  'patlas-srv-valor-unitario': 1250,
  'patlas-srv-valor-comercializacao': 1250,
  'patlas-srv-versao-catalogo': '8.2',
  'patlas-srv-grupo': 'Treinamento SaaS',
  'patlas-srv-tipo-cobranca': 'Sob Demanda',
  'patlas-srv-recorrencia': 'Mensal',
  'patlas-srv-siag': '0012401',
  'patlas-srv-protheus': 'S2000401',
  'patlas-srv-universal': 'Não',
  'patlas-srv-individualizado': 'Não',
  'patlas-srv-status-parceria': 'Homologada',
  'patlas-srv-fator-conversao': '1,00',
  'patlas-srv-unidade-dtic': 'UGITI',
}

const forms = [
  {
    id: FORM_PRODUTO_VIGENTE_LINHA,
    name: 'Produto vigente — linha',
    sectionLayout: 'none',
    defaultCanvasMode: 'read',
    metadata: 'Linha de produto vigente para consulta e seleção na proposta (Fase 1).',
    fields: produtoVigenteLinhaFields(),
    exampleValuePresets: pvLinePresets,
    activeExamplePresetId: 'patlas-pv-preset-1',
  },
  {
    id: FORM_PRODUTOS_VIGENTES,
    name: 'Produtos Vigentes',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'read',
    metadata:
      'Fase 1: consulta de produtos ativos para montar proposta. Sem CSV, integração ou gestão avançada.',
    sections: [
      { id: 'sec-patlas-pv-grade', title: 'Consulta', icon: 'table_chart' },
      { id: 'sec-patlas-pv-info', title: 'Sobre', icon: 'info' },
    ],
    fields: [
      field('patlas-pv-alerta-fase1', 'Escopo Fase 1', 'alert', {
        sectionId: 'sec-patlas-pv-info',
        size: 'large',
        readOnly: true,
        alertVariant: 'info',
        alertTitle: 'Consulta para proposta',
        alertMessage:
          'Esta tela é referência para montar a proposta. Não inclui homologação avançada, reajuste, upload CSV nem gestão completa do catálogo (épico Catálogo — backoffice).',
      }),
      field(EMB_VIGENTES, 'Produtos vigentes', 'embeddedReference', {
        sectionId: 'sec-patlas-pv-grade',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_PRODUTO_VIGENTE_LINHA,
        relevance: 'highlight',
        spec: 'Somente produtos com status Ativo (filtro de negócio na seleção para proposta).',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-pv-tela-preset-1',
        name: 'Grade — catálogo completo',
        iconColor: '#0c1ba8',
        fieldValues: {},
        embeddedRowsByFieldId: { [EMB_VIGENTES]: pvRows },
      },
      {
        id: 'patlas-pv-tela-preset-2',
        name: 'Grade — MTI SaaS',
        iconColor: '#0369a1',
        fieldValues: {},
        embeddedRowsByFieldId: { [EMB_VIGENTES]: [pvRows[0], pvRows[1]] },
      },
      {
        id: 'patlas-pv-tela-preset-3',
        name: 'Grade — MTI Simplifica',
        iconColor: '#7c3aed',
        fieldValues: {},
        embeddedRowsByFieldId: { [EMB_VIGENTES]: [pvRows[2], pvRows[3]] },
      },
      { id: 'patlas-pv-tela-preset-4', name: 'Um item', iconColor: '#64748b', fieldValues: {}, embeddedRowsByFieldId: { [EMB_VIGENTES]: [pvRow1] } },
      {
        id: 'patlas-pv-tela-preset-5',
        name: 'MTI WORKSPACE',
        iconColor: '#1e40af',
        fieldValues: {},
        embeddedRowsByFieldId: { [EMB_VIGENTES]: [pvRows[4]] },
      },
    ],
    activeExamplePresetId: 'patlas-pv-tela-preset-1',
  },
  {
    id: FORM_LICENCA_LINHA,
    name: 'Licença — linha',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'read',
    metadata: 'Linha de licença para consulta e seleção na proposta (Fase 1).',
    sections: [
      { id: 'sec-patlas-lic-fase1', title: 'Dados Fase 1', icon: 'verified' },
      { id: 'sec-patlas-lic-referencia', title: 'Referência histórica', icon: 'history' },
    ],
    fields: licencaLinhaFields(),
    exampleValuePresets: licLinePresets,
    activeExamplePresetId: 'patlas-lic-linha-001',
  },
  {
    id: FORM_CATALOGO_LICENCAS,
    name: 'Catálogo de Licenças',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'read',
    metadata: 'Fase 1: consulta e seleção de licenças para proposta.',
    sections: [
      { id: 'sec-patlas-lic-tela', title: 'Consulta', icon: 'table_chart' },
      { id: 'sec-patlas-lic-info', title: 'Sobre', icon: 'info' },
    ],
    fields: [
      field('patlas-lic-alerta-fase1', 'Escopo Fase 1', 'alert', {
        sectionId: 'sec-patlas-lic-info',
        size: 'large',
        readOnly: true,
        alertVariant: 'info',
        alertMessage:
          'Licenças são consultadas e selecionadas para a proposta. Markup, custo parceiro, upload CSV e homologação avançada ficam fora da Fase 1.',
      }),
      field(EMB_LICENCAS, 'Licenças', 'embeddedReference', {
        sectionId: 'sec-patlas-lic-tela',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_LICENCA_LINHA,
        relevance: 'highlight',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-lic-tela-p1',
        name: 'Grade — catálogo completo',
        iconColor: '#7c3aed',
        fieldValues: {},
        embeddedRowsByFieldId: { [EMB_LICENCAS]: licRows },
      },
      {
        id: 'patlas-lic-tela-p2',
        name: 'Grade — MTI Workspace',
        iconColor: '#6d28d9',
        fieldValues: {},
        embeddedRowsByFieldId: { [EMB_LICENCAS]: licRows.slice(0, 4) },
      },
      {
        id: 'patlas-lic-tela-p3',
        name: 'Grade — MTI Simplifica (soluções)',
        iconColor: '#059669',
        fieldValues: {},
        embeddedRowsByFieldId: { [EMB_LICENCAS]: licRows.slice(4, 21) },
      },
      {
        id: 'patlas-lic-tela-p4',
        name: 'Grade — IA e mensageria',
        iconColor: '#0369a1',
        fieldValues: {},
        embeddedRowsByFieldId: { [EMB_LICENCAS]: licRows.slice(21, 79) },
      },
      {
        id: 'patlas-lic-tela-p5',
        name: 'Grade — MTI SaaS',
        iconColor: '#1e40af',
        fieldValues: {},
        embeddedRowsByFieldId: { [EMB_LICENCAS]: licRows.slice(79) },
      },
    ],
    activeExamplePresetId: 'patlas-lic-tela-p1',
  },
  {
    id: FORM_SERVICO_LINHA,
    name: 'Serviço — linha',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'read',
    metadata: 'Linha de serviço para consulta e seleção na proposta (Fase 1).',
    sections: [{ id: 'sec-patlas-srv-fase1', title: 'Dados do serviço', icon: 'engineering' }],
    fields: servicoLinhaFields(),
    exampleValuePresets: [
      { id: 'patlas-srv-linha-p1', name: 'Treinamento CLOUD', iconColor: '#0d9488', fieldValues: srvRow1 },
      {
        id: 'patlas-srv-linha-p2',
        name: 'VPC dedicada',
        iconColor: '#0369a1',
        fieldValues: {
          ...srvRow1,
          'patlas-srv-produto-catalogo': 'Criação de VPC — ambiente dedicado',
          'patlas-srv-descricao': 'Criação de VPC — ambiente dedicado',
          'patlas-srv-complexidade': 'Baixo',
          'patlas-srv-qtde-hst-ust': 4,
          'patlas-srv-valor-unitario': 3200,
        },
      },
      {
        id: 'patlas-srv-linha-p3',
        name: 'Tenant M365',
        iconColor: '#1e40af',
        fieldValues: {
          ...srvRow1,
          'patlas-srv-produto-catalogo': 'Configuração Tenant Microsoft 365',
          'patlas-srv-complexidade': 'Média',
          'patlas-srv-qtde-hst-ust': 12,
          'patlas-srv-valor-unitario': 4800,
        },
      },
      {
        id: 'patlas-srv-linha-p4',
        name: 'UST Simplifica',
        iconColor: '#b45309',
        fieldValues: {
          ...srvRow1,
          'patlas-srv-parceria': 'MTI',
          'patlas-srv-metrica': 'UST',
          'patlas-srv-recorrencia': 'Por Homologação',
        },
      },
      {
        id: 'patlas-srv-linha-p5',
        name: 'Suspenso',
        iconColor: '#64748b',
        fieldValues: { ...srvRow1, 'patlas-srv-status-parceria': 'Suspenso' },
      },
    ],
    activeExamplePresetId: 'patlas-srv-linha-p1',
  },
  {
    id: FORM_CATALOGO_SERVICOS,
    name: 'Catálogo de Serviços',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'read',
    metadata: 'Fase 1: consulta e seleção de serviços para proposta.',
    sections: [
      { id: 'sec-patlas-srv-tela', title: 'Consulta', icon: 'table_chart' },
      { id: 'sec-patlas-srv-info', title: 'Sobre', icon: 'info' },
    ],
    fields: [
      field('patlas-srv-alerta-fase1', 'Escopo Fase 1', 'alert', {
        sectionId: 'sec-patlas-srv-info',
        size: 'large',
        readOnly: true,
        alertVariant: 'info',
        alertMessage:
          'Serviços com complexidade, HST/UST e recorrência para compor e justificar valor previsto na proposta.',
      }),
      field(EMB_SERVICOS, 'Serviços', 'embeddedReference', {
        sectionId: 'sec-patlas-srv-tela',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_SERVICO_LINHA,
        relevance: 'highlight',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-srv-tela-p1',
        name: 'Grade serviços',
        iconColor: '#0d9488',
        fieldValues: {},
        embeddedRowsByFieldId: { [EMB_SERVICOS]: [srvRow1] },
      },
      { id: 'patlas-srv-tela-p2', name: 'CLOUD amostra', iconColor: '#0369a1', fieldValues: {}, embeddedRowsByFieldId: { [EMB_SERVICOS]: [srvRow1, { ...srvRow1, 'patlas-srv-produto-catalogo': 'VPC dedicada' }] } },
      { id: 'patlas-srv-tela-p3', name: 'Vazio', iconColor: '#94a3b8', fieldValues: {} },
      { id: 'patlas-srv-tela-p4', name: 'M365', iconColor: '#1e40af', fieldValues: {}, embeddedRowsByFieldId: { [EMB_SERVICOS]: [{ ...srvRow1, 'patlas-srv-produto-catalogo': 'Tenant M365' }] } },
      { id: 'patlas-srv-tela-p5', name: 'Homologação', iconColor: '#059669', fieldValues: {}, embeddedRowsByFieldId: { [EMB_SERVICOS]: [{ ...srvRow1, 'patlas-srv-recorrencia': 'Por Homologação' }] } },
    ],
    activeExamplePresetId: 'patlas-srv-tela-p1',
  },
  {
    id: FORM_PROPOSTA_ITEM,
    name: 'Item da proposta',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Itens que compõem a proposta. Copia snapshot do catálogo no momento da seleção.',
    sections: [
      { id: 'sec-patlas-pri-selecao', title: 'Seleção', icon: 'add_shopping_cart' },
      { id: 'sec-patlas-pri-calculo', title: 'Quantidade e valores', icon: 'calculate' },
      { id: 'sec-patlas-pri-snapshot', title: 'Dados copiados do catálogo', icon: 'photo_camera' },
    ],
    fields: propostaItemFields(),
    exampleValuePresets: [
      {
        id: 'patlas-pri-preset-vigente',
        name: 'Item — produto vigente',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-pri-origem': 'Produto vigente',
          'patlas-pri-ref-vigente': 'MTI CLOUD — Serviço Técnico em Nuvem Híbrida',
          'patlas-pri-quantidade': 1,
          'patlas-pri-valor-unitario-edit': 282.58,
          'patlas-pri-valor-total': 282.58,
          'patlas-pri-valor-previsto': 282.58,
          'patlas-pri-descricao': 'MTI CLOUD — Serviço Técnico em Nuvem Híbrida',
          'patlas-pri-siag': '0005315',
          'patlas-pri-protheus': '32001204',
          'patlas-pri-solucao': 'MTI CLOUD',
          'patlas-pri-metrica': 'HST',
          'patlas-pri-cobranca': 'Sob Demanda',
          'patlas-pri-valor-unitario': 282.58,
          'patlas-pri-parceria': 'Zadara',
          'patlas-pri-unidade-dtic': 'UGITI',
          'patlas-pri-focal-vendas': 'Icaro',
        },
      },
      {
        id: 'patlas-pri-preset-licenca',
        name: 'Item — licença',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlas-pri-origem': 'Licença',
          'patlas-pri-ref-licenca': 'EXECUÇÃO DE ANÁLISE DAST (Um par de Ciclos, Teste e Reteste)',
          'patlas-pri-quantidade': 1,
          'patlas-pri-valor-unitario-edit': 60937.2,
          'patlas-pri-valor-total': 60937.2,
          'patlas-pri-valor-previsto': 60937.2,
          'patlas-pri-descricao': 'EXECUÇÃO DE ANÁLISE DAST',
          'patlas-pri-parceria': 'MTI DevSecGOV',
          'patlas-pri-metrica': 'USN',
          'patlas-pri-tipo-cobranca': 'Sob Demanda',
          'patlas-pri-recorrencia': 'Sob Demanda',
          'patlas-pri-versao-catalogo': '1.1',
          'patlas-pri-siag': '001666G',
          'patlas-pri-protheus': 'S2000162',
        },
      },
      {
        id: 'patlas-pri-preset-servico',
        name: 'Item — serviço',
        iconColor: '#0d9488',
        fieldValues: {
          'patlas-pri-origem': 'Serviço',
          'patlas-pri-ref-servico': 'Treinamento técnico presencial — módulo introdutório cloud',
          'patlas-pri-quantidade': 8,
          'patlas-pri-valor-unitario-edit': 1250,
          'patlas-pri-valor-total': 10000,
          'patlas-pri-valor-previsto': 10000,
          'patlas-pri-descricao': 'Treinamento técnico presencial — módulo introdutório cloud',
          'patlas-pri-metrica': 'HST',
          'patlas-pri-complexidade': 'Sem Complexidade',
          'patlas-pri-qtde-hst-ust': 8,
          'patlas-pri-categoria': 'MTI CLOUD - Serviço Técnico em Nuvem',
          'patlas-pri-siag': '0012401',
          'patlas-pri-protheus': 'S2000401',
        },
      },
      {
        id: 'patlas-pri-preset-manual',
        name: 'Item — manual',
        iconColor: '#b45309',
        fieldValues: {
          'patlas-pri-origem': 'Manual',
          'patlas-pri-justificativa-manual':
            'Item não catalogado: demanda emergencial de integração legada sem código Siag vigente.',
          'patlas-pri-descricao': 'Integração pontual sistema legado — escopo fechado',
          'patlas-pri-metrica': 'HST',
          'patlas-pri-quantidade': 40,
          'patlas-pri-valor-unitario-edit': 180,
          'patlas-pri-valor-total': 7200,
          'patlas-pri-valor-previsto': 7200,
        },
      },
      {
        id: 'patlas-pri-preset-firewall',
        name: 'Item — produto vigente (firewall)',
        iconColor: '#92400e',
        fieldValues: {
          'patlas-pri-origem': 'Produto vigente',
          'patlas-pri-quantidade': 12,
          'patlas-pri-valor-unitario-edit': 4200,
          'patlas-pri-valor-total': 50400,
          'patlas-pri-descricao': 'Firewall gerenciado — instância dedicada',
          'patlas-pri-solucao': 'MTI DataSecurity',
          'patlas-pri-cobranca': 'Mensal',
        },
      },
    ],
    activeExamplePresetId: 'patlas-pri-preset-servico',
  },
  {
    id: FORM_PROPOSTA,
    name: 'Proposta — Fase 1',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata: 'Proposta comercial Fase 1. Itens do catálogo com snapshot congelado.',
    methods: PROPOSTA_METODOS_PARAM,
    sections: [
      { id: 'sec-patlas-prp-cab', title: 'Cabeçalho', icon: 'description' },
      { id: 'sec-patlas-prp-itens', title: 'Itens da proposta', icon: 'list_alt' },
      PROPOSTA_SEC_PROCESSO,
      PROPOSTA_SEC_ASSINATURAS,
    ],
    fields: [
      field('patlas-prp-numero', 'Número da proposta', 'text', {
        sectionId: 'sec-patlas-prp-cab',
        required: true,
        relevance: 'identity',
      }),
      field('patlas-prp-cliente', 'Cliente (texto)', 'text', {
        sectionId: 'sec-patlas-prp-cab',
        size: 'large',
        spec: 'Rótulo legível; preferir «Organização cliente» como referência.',
      }),
      ...propostaAssinaturaFields(field),
      ...propostaParametrizacaoFields(field),
      field('patlas-prp-status', 'Status', 'textOptions', {
        sectionId: 'sec-patlas-prp-cab',
        options: ['Rascunho', 'Em elaboração', 'Em assinatura', 'Aprovada', 'Cancelada'],
      }),
      field('patlas-prp-alerta-catalogo', 'Catálogo na proposta', 'alert', {
        sectionId: 'sec-patlas-prp-itens',
        size: 'large',
        readOnly: true,
        alertVariant: 'info',
        alertTitle: 'Seleção de itens',
        alertMessage:
          'Escolha a origem (produto vigente, licença, serviço ou manual), selecione o item, revise os dados copiados, informe quantidade e salve. Os dados do catálogo ficam congelados no item.',
      }),
      field(EMB_ITENS_PROPOSTA, 'Itens', 'embeddedReference', {
        sectionId: 'sec-patlas-prp-itens',
        size: 'large',
        multiple: true,
        embeddedDisplay: 'table',
        linkedFormId: FORM_PROPOSTA_ITEM,
        relevance: 'highlight',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlas-prp-preset-demo',
        name: 'Proposta demo — TJMT',
        iconColor: '#0c1ba8',
        fieldValues: {
          'patlas-prp-numero': 'PROP-2025-0042',
          'patlas-prp-cliente': 'Tribunal de Justiça de Mato Grosso',
          'patlas-prp-organizacao-cliente': 'Tribunal de Justiça de Mato Grosso',
          'patlas-prp-organizacao-parceiro': 'Parceiro Simplifica Demo Ltda.',
          'patlas-prp-tem-parceiro': 'true',
          'patlas-prp-status': 'Em assinatura',
          'patlas-prp-fluxo-modelo': 'Fluxo padrão de proposta',
          'patlas-prp-fluxo-versao': '1.0',
          'patlas-prp-doc-modelo': 'Proposta comercial padrão',
          'patlas-prp-versao-documento': 'v1',
          'patlas-prp-processo-andamento': 'PROC-2026-0042',
          'patlas-prp-documento-gerado': 'Proposta PROP-2025-0042 — TJMT',
        },
        embeddedRowsByFieldId: {
          [EMB_TRAMITES_ASSINATURA]: TRAMITES_CADEIA_PADRAO,
          [EMB_ITENS_PROPOSTA]: [
            {
              'patlas-pri-origem': 'Serviço',
              'patlas-pri-descricao': 'Treinamento técnico presencial — módulo introdutório cloud',
              'patlas-pri-quantidade': 8,
              'patlas-pri-valor-total': 10000,
            },
            {
              'patlas-pri-origem': 'Licença',
              'patlas-pri-descricao': 'EXECUÇÃO DE ANÁLISE DAST',
              'patlas-pri-quantidade': 1,
              'patlas-pri-valor-total': 60937.2,
            },
          ],
        },
      },
      {
        id: 'patlas-prp-preset-rascunho',
        name: 'Rascunho vazio',
        iconColor: '#64748b',
        fieldValues: {
          'patlas-prp-numero': 'PROP-2025-DRAFT',
          'patlas-prp-cliente': 'Cliente demo',
          'patlas-prp-status': 'Rascunho',
        },
      },
      {
        id: 'patlas-prp-preset-manual',
        name: 'Com item manual',
        iconColor: '#b45309',
        fieldValues: {
          'patlas-prp-numero': 'PROP-2025-0099',
          'patlas-prp-cliente': 'SEFAZ-MT',
          'patlas-prp-organizacao-cliente': 'Secretaria de Fazenda de Mato Grosso',
          'patlas-prp-tem-parceiro': 'false',
          'patlas-prp-status': 'Em elaboração',
          'patlas-prp-fluxo-modelo': 'Fluxo padrão de proposta',
          'patlas-prp-fluxo-versao': '1.0',
        },
        embeddedRowsByFieldId: {
          [EMB_TRAMITES_ASSINATURA]: TRAMITES_SEM_PARCEIRO,
          [EMB_ITENS_PROPOSTA]: [
            {
              'patlas-pri-origem': 'Manual',
              'patlas-pri-justificativa-manual': 'Escopo emergencial sem item de catálogo.',
              'patlas-pri-descricao': 'Integração legada',
              'patlas-pri-quantidade': 40,
              'patlas-pri-valor-total': 7200,
            },
          ],
        },
      },
      {
        id: 'patlas-prp-preset-cloud',
        name: 'Só CLOUD',
        iconColor: '#0369a1',
        fieldValues: {
          'patlas-prp-numero': 'PROP-2025-0100',
          'patlas-prp-cliente': 'Órgão demo',
          'patlas-prp-status': 'Rascunho',
        },
        embeddedRowsByFieldId: {
          [EMB_ITENS_PROPOSTA]: [
            {
              'patlas-pri-origem': 'Produto vigente',
              'patlas-pri-descricao': 'MTI CLOUD — Serviço Técnico em Nuvem Híbrida',
              'patlas-pri-valor-total': 282.58,
            },
          ],
        },
      },
      {
        id: 'patlas-prp-preset-aprovada',
        name: 'Aprovada — histórico',
        iconColor: '#059669',
        fieldValues: {
          'patlas-prp-numero': 'PROP-2024-1200',
          'patlas-prp-cliente': 'Cliente histórico',
          'patlas-prp-status': 'Aprovada',
        },
      },
    ],
    activeExamplePresetId: 'patlas-prp-preset-demo',
  },
  buildTramiteAssinaturaForm(),
  buildContratoFase1Form(),
  ...allCotacaoForms(),
]

fs.mkdirSync(epicDir, { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(forms, null, 2) + '\n', 'utf-8')
fs.writeFileSync(portalsPath, JSON.stringify([portalCotacaoCliente], null, 2) + '\n', 'utf-8')
fs.writeFileSync(flowsPath, JSON.stringify([flowPortalCotacao], null, 2) + '\n', 'utf-8')
console.log('Wrote', outPath, '—', forms.length, 'forms')
console.log('Wrote', portalsPath, 'and', flowsPath)
