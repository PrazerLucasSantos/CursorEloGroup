#!/usr/bin/env node
/**
 * Implementa o módulo Catálogo & Produto (Fase 3) a partir de
 * catalogo_produto_spec.md: 11 classes com abas, campos, regras condicionais,
 * referências e presets. Aplica as correções da seção 13 do documento.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

// ids das classes
const F = {
  PRODUTO: 'form-patlasv4-proto-cat-produto',
  CATALOGO: 'form-patlasv4-proto-cat-catalogo',
  UNIVERSAL: 'form-patlasv4-proto-cat-universal',
  DADOS_PARC: 'form-patlasv4-proto-cat-dados-parceria',
  PARCERIA: 'form-patlasv4-proto-cat-parceria',
  SOLUCAO: 'form-patlasv4-proto-cat-solucao',
  TIPO_COBR: 'form-patlasv4-proto-cat-tipo-cobranca',
  METRICA: 'form-patlasv4-proto-cat-metrica',
  CATEGORIA: 'form-patlasv4-proto-cat-categoria',
  GRUPO: 'form-patlasv4-proto-cat-grupo',
  MODELO_VENDA: 'form-patlasv4-proto-cat-modelo-venda',
}
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'

let SEQ = 0
function fld(id, label, type, o = {}) {
  SEQ++
  return {
    id,
    label,
    type,
    size: o.size || (type === 'text' && o.textLong ? 'large' : 'medium'),
    readOnly: o.readOnly || false,
    required: o.required || false,
    multiple: o.multiple || false,
    relevance: o.relevance || 'common',
    ...(o.sectionId ? { sectionId: o.sectionId } : {}),
    ...(o.options ? { options: o.options } : {}),
    ...(o.linkedFormId ? { linkedFormId: o.linkedFormId } : {}),
    ...(o.textLong ? { textLong: true } : {}),
    ...(o.hidden ? { hidden: true } : {}),
    ...(o.spec ? { spec: o.spec } : {}),
  }
}

const forms = []

// ---------- Entidades de suporte (1 aba) ----------
function simples(id, name, meta, idLabel, extra = []) {
  return {
    id, name, sectionLayout: 'none', defaultCanvasMode: 'read', metadata: meta,
    fields: [
      fld(`${id}-identificador`, idLabel, 'text', { required: true, relevance: 'identity' }),
      fld(`${id}-descricao`, 'Descrição', 'text', { textLong: true }),
      ...extra,
    ],
    exampleValuePresets: [],
  }
}

const metrica = simples(F.METRICA, '(F3) Métrica', 'Moeda métrica: HST, USN, UST, UST-IA.', 'Identificador (sigla)')
metrica.fields[0].spec = 'Sigla da métrica. Ex.: HST, USN, UST, UST-IA.'
metrica.exampleValuePresets = [
  { id: `${F.METRICA}-p-hst`, name: 'HST', fieldValues: { [`${F.METRICA}-identificador`]: 'HST', [`${F.METRICA}-descricao`]: 'Hora de Serviço MTI — moeda de serviço da MTI (ex.: R$ 282,58/HST).' } },
  { id: `${F.METRICA}-p-usn`, name: 'USN', fieldValues: { [`${F.METRICA}-identificador`]: 'USN', [`${F.METRICA}-descricao`]: 'Unidade de Serviço Universal — moeda de licenciamento universal (ex.: R$ 1,00/USN).' } },
  { id: `${F.METRICA}-p-ust`, name: 'UST', fieldValues: { [`${F.METRICA}-identificador`]: 'UST', [`${F.METRICA}-descricao`]: 'Unidade de Serviço Técnico — moeda de serviço de parceiros. Conversão 2,58 USN/UST.' } },
  { id: `${F.METRICA}-p-ustia`, name: 'UST-IA', fieldValues: { [`${F.METRICA}-identificador`]: 'UST-IA', [`${F.METRICA}-descricao`]: 'Unidade de Serviço Técnico para soluções de IA.' } },
  { id: `${F.METRICA}-p-data`, name: 'Data Analysed', fieldValues: { [`${F.METRICA}-identificador`]: 'Data Analysed', [`${F.METRICA}-descricao`]: 'Métrica por volume de dados analisados.' } },
]

const tipoCobranca = {
  id: F.TIPO_COBR, name: '(F3) Tipo de Cobrança', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Tipo e recorrência de cobrança aplicáveis a produtos e catálogos.',
  fields: [
    fld(`${F.TIPO_COBR}-modelo`, 'Modelo', 'text', { required: true, relevance: 'identity', spec: 'Ex.: Sob Demanda, Mensal, Anual.' }),
    fld(`${F.TIPO_COBR}-recorrencia`, 'Recorrência', 'text', { spec: 'Ex.: Mensal, Anual, Por Execução, Por Homologação.' }),
  ],
  exampleValuePresets: [
    { id: `${F.TIPO_COBR}-p-sob`, name: 'Sob Demanda', fieldValues: { [`${F.TIPO_COBR}-modelo`]: 'Sob Demanda', [`${F.TIPO_COBR}-recorrencia`]: 'Por Execução' } },
    { id: `${F.TIPO_COBR}-p-mensal`, name: 'Mensal', fieldValues: { [`${F.TIPO_COBR}-modelo`]: 'Mensal', [`${F.TIPO_COBR}-recorrencia`]: 'Mensal' } },
    { id: `${F.TIPO_COBR}-p-anual`, name: 'Anual', fieldValues: { [`${F.TIPO_COBR}-modelo`]: 'Anual', [`${F.TIPO_COBR}-recorrencia`]: 'Anual' } },
  ],
}

const categoria = simples(F.CATEGORIA, '(F3) Categoria de Serviços', 'Categoria de objeto comercial (Licença/Serviço).', 'Identificador')
categoria.fields[0].spec = 'Ex.: MTI CLOUD - Disponibilização de Infraestrutura.'
categoria.exampleValuePresets = [
  { id: `${F.CATEGORIA}-p1`, name: 'MTI CLOUD - Infraestrutura', fieldValues: { [`${F.CATEGORIA}-identificador`]: 'MTI CLOUD - Disponibilização de Infraestrutura' } },
  { id: `${F.CATEGORIA}-p2`, name: 'MTI Simplifica - SaaS', fieldValues: { [`${F.CATEGORIA}-identificador`]: 'MTI Simplifica - Serviços de Solução SaaS' } },
]

const grupo = simples(F.GRUPO, '(F3) Grupo', 'Agrupamento comercial / especificação de tier.', 'Identificador')
grupo.exampleValuePresets = [
  { id: `${F.GRUPO}-p1`, name: 'MTI Host', fieldValues: { [`${F.GRUPO}-identificador`]: 'MTI Host' } },
  { id: `${F.GRUPO}-p2`, name: 'MTI SIMPLIFICA - Ambientação', fieldValues: { [`${F.GRUPO}-identificador`]: 'MTI SIMPLIFICA - Serviços para Ambientação e Capacitação' } },
]

const modeloVenda = simples(F.MODELO_VENDA, '(F3) Modelo de Venda', 'Modelo de comercialização do produto.', 'Identificador')
modeloVenda.exampleValuePresets = [
  { id: `${F.MODELO_VENDA}-p1`, name: 'Por Licença', fieldValues: { [`${F.MODELO_VENDA}-identificador`]: 'Por Licença' } },
  { id: `${F.MODELO_VENDA}-p2`, name: 'OpEx', fieldValues: { [`${F.MODELO_VENDA}-identificador`]: 'OpEx' } },
  { id: `${F.MODELO_VENDA}-p3`, name: 'SaaS', fieldValues: { [`${F.MODELO_VENDA}-identificador`]: 'SaaS' } },
  { id: `${F.MODELO_VENDA}-p4`, name: 'Serviço', fieldValues: { [`${F.MODELO_VENDA}-identificador`]: 'Serviço' } },
]

// ---------- Solução ----------
const solucao = {
  id: F.SOLUCAO, name: '(F3) Solução', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Solução ofertada (própria MTI ou via parceria). Uma parceria pode ter várias soluções.',
  fields: [
    fld(`${F.SOLUCAO}-identificador`, 'Identificador', 'text', { required: true, relevance: 'identity', spec: 'Ex.: MTI Host, MTI Saas.' }),
    fld(`${F.SOLUCAO}-parceria`, 'Parceria', 'reference', { linkedFormId: F.PARCERIA, spec: 'Opcional — vazio para soluções próprias da MTI.' }),
    fld(`${F.SOLUCAO}-descricao`, 'Descrição', 'text', { textLong: true }),
  ],
  exampleValuePresets: [
    { id: `${F.SOLUCAO}-p1`, name: 'MTI Host', fieldValues: { [`${F.SOLUCAO}-identificador`]: 'MTI Host' } },
    { id: `${F.SOLUCAO}-p2`, name: 'MTI Saas', fieldValues: { [`${F.SOLUCAO}-identificador`]: 'MTI Saas' } },
  ],
}

// ---------- Parceria ----------
const parceria = {
  id: F.PARCERIA, name: '(F3) Parceria', sectionLayout: 'none', defaultCanvasMode: 'read',
  metadata: 'Parceria homologada pela alta administração da MTI. Enquanto não homologada, o catálogo não fica visível ao cliente (PEAP item p.i).',
  fields: [
    fld(`${F.PARCERIA}-identificador`, 'Identificador', 'text', { required: true, relevance: 'identity', spec: 'Ex.: MTI SIMPLIFICA, MTI HOST.' }),
    fld(`${F.PARCERIA}-descricao`, 'Descrição', 'text', { textLong: true }),
    fld(`${F.PARCERIA}-parceiro`, 'Parceiro', 'reference', { required: true, linkedFormId: FORM_UO, spec: 'Organização parceira.' }),
    fld(`${F.PARCERIA}-status`, 'Status', 'textOptions', { required: true, relevance: 'highlight', options: ['Ativa', 'Concluída', 'Homologada', 'Paralisada'], spec: 'Homologada = autorizada pela DIREX/Presidência.' }),
    fld(`${F.PARCERIA}-solucoes`, 'Soluções', 'reference', { required: true, multiple: true, linkedFormId: F.SOLUCAO }),
  ],
  exampleValuePresets: [
    { id: `${F.PARCERIA}-p1`, name: 'MTI SIMPLIFICA', fieldValues: { [`${F.PARCERIA}-identificador`]: 'MTI SIMPLIFICA', [`${F.PARCERIA}-parceiro`]: 'EloGroup', [`${F.PARCERIA}-status`]: 'Homologada' } },
    { id: `${F.PARCERIA}-p2`, name: 'MTI HOST', fieldValues: { [`${F.PARCERIA}-identificador`]: 'MTI HOST', [`${F.PARCERIA}-status`]: 'Ativa' } },
  ],
}

// ---------- Produto ----------
const SP = {
  ID: 'sec-cat-prod-identificacao', COB: 'sec-cat-prod-cobranca', RESP: 'sec-cat-prod-responsaveis',
  CAT: 'sec-cat-prod-catalogo', ST: 'sec-cat-prod-status',
}
const produto = {
  id: F.PRODUTO, name: '(F3) Produto', sectionLayout: 'tabs', defaultCanvasMode: 'read',
  metadata: 'Item individual do catálogo (camada 3). Pertence a exatamente um Catálogo. Complexidade e HST/UST por execução só para Serviço (RN-P-02). Universal e Individualizado são flags independentes (RN-P-03). Markup vive em Dados de Parceria por Produto (RN-P-05).',
  sections: [
    { id: SP.ID, title: 'Identificação', icon: 'inventory_2' },
    { id: SP.COB, title: 'Cobrança e Valores', icon: 'payments' },
    { id: SP.RESP, title: 'Responsáveis', icon: 'group' },
    { id: SP.CAT, title: 'Catálogo e Parceria', icon: 'category' },
    { id: SP.ST, title: 'Status e Observações', icon: 'flag' },
  ],
  fields: [
    // Identificação
    fld(`${F.PRODUTO}-identificador`, 'Identificador do produto', 'text', { required: true, relevance: 'identity', sectionId: SP.ID, spec: 'Nome comercial. Ex.: MTI HOST - Infraestrutura de TI Gerenciada.' }),
    fld(`${F.PRODUTO}-part-number`, 'Part Number (SKU)', 'text', { sectionId: SP.ID, spec: 'Código PART NUMBER (DIRC). Ex.: Q501011.' }),
    fld(`${F.PRODUTO}-tipo`, 'Tipo de produto', 'textOptions', { required: true, relevance: 'highlight', sectionId: SP.ID, options: ['Licença', 'Serviço'], spec: 'Controla campos condicionais (RN-P-02).' }),
    fld(`${F.PRODUTO}-grupo`, 'Grupo', 'reference', { sectionId: SP.ID, linkedFormId: F.GRUPO }),
    fld(`${F.PRODUTO}-descricao-solucao`, 'Descrição da Solução Ofertada', 'text', { textLong: true, sectionId: SP.ID }),
    fld(`${F.PRODUTO}-espec-01`, 'Especificação 01', 'text', { sectionId: SP.ID, spec: 'Ex.: 1 vCPU, MSS (Firewall).' }),
    fld(`${F.PRODUTO}-espec-02`, 'Especificação 02', 'text', { sectionId: SP.ID, spec: 'Ex.: Memória RAM 2 GB.' }),
    fld(`${F.PRODUTO}-espec-03`, 'Especificação 03', 'text', { sectionId: SP.ID }),
    fld(`${F.PRODUTO}-espec-04`, 'Especificação 04', 'text', { sectionId: SP.ID }),
    fld(`${F.PRODUTO}-info-complementar`, 'INFO Complementar', 'text', { textLong: true, sectionId: SP.ID }),
    // Cobrança e Valores
    fld(`${F.PRODUTO}-modelo-venda`, 'Modelo de venda', 'reference', { sectionId: SP.COB, linkedFormId: F.MODELO_VENDA }),
    fld(`${F.PRODUTO}-metrica`, 'Métrica', 'reference', { sectionId: SP.COB, linkedFormId: F.METRICA, spec: 'Obrigatória para Licença (RN-P-02).' }),
    fld(`${F.PRODUTO}-cobranca`, 'Cobrança', 'reference', { required: true, sectionId: SP.COB, linkedFormId: F.TIPO_COBR }),
    fld(`${F.PRODUTO}-valor-unitario`, 'Valor unitário (R$)', 'number', { required: true, sectionId: SP.COB, spec: 'Valor de comercialização unitário.' }),
    fld(`${F.PRODUTO}-fator-conversao`, 'Fator de conversão', 'number', { sectionId: SP.COB, spec: 'Default 1. Converte entre métricas (qtd × fator).' }),
    fld(`${F.PRODUTO}-complexidade`, 'Complexidade', 'textOptions', { sectionId: SP.COB, hidden: true, options: ['Baixa', 'Média', 'Alta'], spec: 'Somente Tipo = Serviço.' }),
    fld(`${F.PRODUTO}-qtde-hst-ust`, 'QTDE HSTs/USTs por execução', 'number', { sectionId: SP.COB, hidden: true, spec: 'Somente Tipo = Serviço.' }),
    fld(`${F.PRODUTO}-categoria`, 'Categoria de Objeto Comercial', 'reference', { sectionId: SP.COB, hidden: true, linkedFormId: F.CATEGORIA, spec: 'Somente Tipo = Serviço (a validar P-C4).' }),
    // Responsáveis
    fld(`${F.PRODUTO}-focal-vendas`, 'Focal de vendas', 'reference', { sectionId: SP.RESP, linkedFormId: FORM_PESSOA }),
    fld(`${F.PRODUTO}-focal-posvendas`, 'Focal de pós-vendas', 'reference', { sectionId: SP.RESP, linkedFormId: FORM_PESSOA }),
    fld(`${F.PRODUTO}-unidade-dtic`, 'Unidade DTIC', 'reference', { required: true, multiple: true, sectionId: SP.RESP, linkedFormId: FORM_UO, spec: 'Unidade(s) da MTI responsável(is).' }),
    // Catálogo e Parceria
    fld(`${F.PRODUTO}-parceria`, 'Parceria', 'reference', { sectionId: SP.CAT, linkedFormId: F.PARCERIA }),
    fld(`${F.PRODUTO}-catalogo`, 'Catálogo', 'reference', { sectionId: SP.CAT, linkedFormId: F.CATALOGO, spec: 'Um produto pertence a exatamente 1 catálogo (RN-P-01).' }),
    fld(`${F.PRODUTO}-link-catalogo`, 'Link do catálogo de parceria', 'text', { sectionId: SP.CAT, spec: 'URL externa.' }),
    // Status e Observações
    fld(`${F.PRODUTO}-status-parceria`, 'Status Parceria', 'textOptions', { required: true, relevance: 'highlight', sectionId: SP.ST, options: ['Ativo', 'Concluído', 'Homologado', 'Paralisado'], spec: 'Aprovação de homologação da parceria (RN-P-04).' }),
    fld(`${F.PRODUTO}-status-atual`, 'Status Atual', 'textOptions', { sectionId: SP.ST, options: ['Ativo', 'Homologada', 'Em homologação', 'Paralisado'], spec: 'Estado operacional corrente (RN-P-04).' }),
    fld(`${F.PRODUTO}-universal`, 'Universal', 'boolean', { required: true, sectionId: SP.ST, spec: 'Flag independente (RN-P-03). Vendido por catálogo/universal.' }),
    fld(`${F.PRODUTO}-individualizado`, 'Individualizado', 'boolean', { required: true, sectionId: SP.ST, spec: 'Flag independente (RN-P-03). Contratado exatamente como especificado.' }),
    fld(`${F.PRODUTO}-periodo-minimo`, 'Período Mínimo', 'text', { sectionId: SP.ST, spec: 'Ex.: 12 Meses, N/A.' }),
    fld(`${F.PRODUTO}-data-atualizacao-preco`, 'Data Atualização Preço', 'date', { sectionId: SP.ST, spec: 'Homologação de preços pela DIREX.' }),
    fld(`${F.PRODUTO}-indice-reajuste`, 'Índice de Reajuste', 'text', { sectionId: SP.ST, spec: 'Ex.: 1.0673 (ICTI/IPCA 12 meses).' }),
    fld(`${F.PRODUTO}-ultima-homologacao`, 'Última Homologação', 'date', { sectionId: SP.ST }),
    fld(`${F.PRODUTO}-observacoes`, 'Observações', 'text', { textLong: true, sectionId: SP.ST }),
  ],
  fieldVisibilityRules: [
    { id: 'rule-cat-prod-serv', operator: 'eq', sourceFieldId: `${F.PRODUTO}-tipo`, sourceKind: 'textOptions', expectedOptionText: 'Serviço', action: 'show', targetFieldIds: [`${F.PRODUTO}-complexidade`, `${F.PRODUTO}-qtde-hst-ust`, `${F.PRODUTO}-categoria`] },
    { id: 'rule-cat-prod-lic', operator: 'eq', sourceFieldId: `${F.PRODUTO}-tipo`, sourceKind: 'textOptions', expectedOptionText: 'Licença', action: 'hide', targetFieldIds: [`${F.PRODUTO}-complexidade`, `${F.PRODUTO}-qtde-hst-ust`, `${F.PRODUTO}-categoria`] },
  ],
  exampleValuePresets: [
    {
      id: `${F.PRODUTO}-p-host`, name: 'MTI HOST (Licença)', iconColor: '#0c4a6e',
      fieldValues: {
        [`${F.PRODUTO}-identificador`]: 'MTI HOST - Infraestrutura de TI Gerenciada', [`${F.PRODUTO}-part-number`]: 'Q501011',
        [`${F.PRODUTO}-tipo`]: 'Licença', [`${F.PRODUTO}-metrica`]: 'USN', [`${F.PRODUTO}-cobranca`]: 'Sob Demanda',
        [`${F.PRODUTO}-valor-unitario`]: 1, [`${F.PRODUTO}-fator-conversao`]: 1, [`${F.PRODUTO}-status-parceria`]: 'Homologado',
        [`${F.PRODUTO}-universal`]: true, [`${F.PRODUTO}-individualizado`]: false, [`${F.PRODUTO}-periodo-minimo`]: '12 Meses',
      },
    },
    {
      id: `${F.PRODUTO}-p-serv`, name: 'Serviço de Implantação (Serviço)', iconColor: '#7c3aed',
      fieldValues: {
        [`${F.PRODUTO}-identificador`]: 'Implantação MTI Simplifica', [`${F.PRODUTO}-tipo`]: 'Serviço',
        [`${F.PRODUTO}-cobranca`]: 'Por Execução', [`${F.PRODUTO}-valor-unitario`]: 282.58, [`${F.PRODUTO}-complexidade`]: 'Média',
        [`${F.PRODUTO}-qtde-hst-ust`]: 40, [`${F.PRODUTO}-status-parceria`]: 'Ativo', [`${F.PRODUTO}-universal`]: false, [`${F.PRODUTO}-individualizado`]: true,
      },
    },
  ],
  activeExamplePresetId: `${F.PRODUTO}-p-host`,
}

// ---------- Catálogo ----------
const SC = {
  ID: 'sec-cat-cat-identificacao', COD: 'sec-cat-cat-codigos', COB: 'sec-cat-cat-cobranca',
  RESP: 'sec-cat-cat-responsaveis', PARC: 'sec-cat-cat-parceria', ST: 'sec-cat-cat-status',
}
const catalogo = {
  id: F.CATALOGO, name: '(F3) Catálogo', sectionLayout: 'tabs', defaultCanvasMode: 'read',
  metadata: 'Catálogo de Licença/Serviço/Produto (camada 2). Contém vários produtos; cada produto pertence a 1 catálogo. Códigos em 3 níveis (RN-C-01).',
  sections: [
    { id: SC.ID, title: 'Identificação', icon: 'menu_book' },
    { id: SC.COD, title: 'Códigos', icon: 'tag' },
    { id: SC.COB, title: 'Cobrança e Valores', icon: 'payments' },
    { id: SC.RESP, title: 'Responsáveis', icon: 'group' },
    { id: SC.PARC, title: 'Catálogo e Parceria', icon: 'handshake' },
    { id: SC.ST, title: 'Status e Observações', icon: 'flag' },
  ],
  fields: [
    fld(`${F.CATALOGO}-identificador`, 'Identificador do catálogo', 'text', { required: true, relevance: 'identity', sectionId: SC.ID, spec: 'Ex.: MTI HOST, MTI SIMPLIFICA.' }),
    fld(`${F.CATALOGO}-produtos`, 'Produtos', 'reference', { multiple: true, sectionId: SC.ID, linkedFormId: F.PRODUTO, spec: 'Produtos vinculados (cada produto só em 1 catálogo).' }),
    fld(`${F.CATALOGO}-versao`, 'Versão Catálogo', 'text', { required: true, sectionId: SC.ID, spec: 'Ex.: 8.0, 8.2, 1.5v.' }),
    // Códigos
    fld(`${F.CATALOGO}-preencher-manual`, 'Preencher manualmente?', 'boolean', { required: true, sectionId: SC.COD, spec: 'Default Não. Habilita códigos manuais quando a integração não recupera.' }),
    fld(`${F.CATALOGO}-cod-siag-cat`, 'Código SIAG - Catálogo', 'text', { hidden: true, sectionId: SC.COD }),
    fld(`${F.CATALOGO}-cod-protheus-cat`, 'Código Protheus - Catálogo', 'text', { hidden: true, sectionId: SC.COD }),
    fld(`${F.CATALOGO}-cod-siag-univ`, 'Código SIAG - Catálogo Universal', 'text', { hidden: true, sectionId: SC.COD }),
    fld(`${F.CATALOGO}-cod-protheus-univ`, 'Código Protheus - Catálogo Universal', 'text', { hidden: true, sectionId: SC.COD }),
    // Cobrança
    fld(`${F.CATALOGO}-cobranca`, 'Cobrança', 'reference', { required: true, sectionId: SC.COB, linkedFormId: F.TIPO_COBR }),
    fld(`${F.CATALOGO}-valor-unitario`, 'Valor unitário (R$)', 'number', { required: true, sectionId: SC.COB, spec: 'Valor do catálogo como pacote (Tipo 2).' }),
    // Responsáveis
    fld(`${F.CATALOGO}-focal-vendas`, 'Focal de vendas', 'reference', { sectionId: SC.RESP, linkedFormId: FORM_PESSOA }),
    fld(`${F.CATALOGO}-focal-posvendas`, 'Focal de pós-vendas', 'reference', { sectionId: SC.RESP, linkedFormId: FORM_PESSOA }),
    fld(`${F.CATALOGO}-unidade-dtic`, 'Unidade DTIC', 'reference', { required: true, sectionId: SC.RESP, linkedFormId: FORM_UO }),
    // Parceria
    fld(`${F.CATALOGO}-link-parceria`, 'Link do catálogo de parceria', 'text', { sectionId: SC.PARC }),
    fld(`${F.CATALOGO}-parceria`, 'Parceria', 'reference', { sectionId: SC.PARC, linkedFormId: F.PARCERIA }),
    // Status
    fld(`${F.CATALOGO}-status`, 'Status do catálogo', 'textOptions', { required: true, relevance: 'highlight', sectionId: SC.ST, options: ['Ativo', 'Concluído', 'Homologado', 'Paralisado'] }),
    fld(`${F.CATALOGO}-status-atual`, 'Status Atual', 'textOptions', { sectionId: SC.ST, options: ['Homologada', 'Em homologação', 'Paralisado'] }),
    fld(`${F.CATALOGO}-observacoes`, 'Observações', 'text', { textLong: true, sectionId: SC.ST }),
  ],
  fieldVisibilityRules: [
    { id: 'rule-cat-cat-cod-manual', operator: 'eq', sourceFieldId: `${F.CATALOGO}-preencher-manual`, sourceKind: 'boolean', expectedBoolean: true, action: 'show', targetFieldIds: [`${F.CATALOGO}-cod-siag-cat`, `${F.CATALOGO}-cod-protheus-cat`, `${F.CATALOGO}-cod-siag-univ`, `${F.CATALOGO}-cod-protheus-univ`] },
  ],
  exampleValuePresets: [
    { id: `${F.CATALOGO}-p-host`, name: 'MTI HOST v8.0', iconColor: '#0c4a6e', fieldValues: { [`${F.CATALOGO}-identificador`]: 'MTI HOST', [`${F.CATALOGO}-versao`]: '8.0', [`${F.CATALOGO}-preencher-manual`]: false, [`${F.CATALOGO}-cobranca`]: 'Sob Demanda', [`${F.CATALOGO}-valor-unitario`]: 0, [`${F.CATALOGO}-status`]: 'Homologado' } },
    { id: `${F.CATALOGO}-p-simplifica`, name: 'MTI SIMPLIFICA v8.4', iconColor: '#7c3aed', fieldValues: { [`${F.CATALOGO}-identificador`]: 'MTI SIMPLIFICA', [`${F.CATALOGO}-versao`]: '8.4', [`${F.CATALOGO}-preencher-manual`]: true, [`${F.CATALOGO}-cobranca`]: 'Sob Demanda', [`${F.CATALOGO}-valor-unitario`]: 0, [`${F.CATALOGO}-status`]: 'Ativo' } },
  ],
  activeExamplePresetId: `${F.CATALOGO}-p-host`,
}

// ---------- Catálogo Universal ----------
const SU = { ID: 'sec-cat-univ-identificacao', CATS: 'sec-cat-univ-catalogos', MTX: 'sec-cat-univ-matriz' }
const universal = {
  id: F.UNIVERSAL, name: '(F3) Catálogo Universal', sectionLayout: 'tabs', defaultCanvasMode: 'read',
  metadata: 'Consolidador das moedas métricas (HST/USN) — camada 1. Cliente contrata por moeda universal e consome qualquer produto dos catálogos vinculados (RN-CU-01). A matriz de complexidade define os valores de conversão.',
  sections: [
    { id: SU.ID, title: 'Identificação', icon: 'public' },
    { id: SU.CATS, title: 'Catálogos', icon: 'library_books' },
    { id: SU.MTX, title: 'Matriz de Complexidade', icon: 'grid_on' },
  ],
  fields: [
    fld(`${F.UNIVERSAL}-identificador`, 'Identificador', 'text', { required: true, relevance: 'identity', sectionId: SU.ID, spec: 'Ex.: Catálogo Universal MTI.' }),
    fld(`${F.UNIVERSAL}-cod-siag`, 'Código SIAG - Catálogo Universal', 'text', { sectionId: SU.ID }),
    fld(`${F.UNIVERSAL}-cod-protheus`, 'Código Protheus - Catálogo Universal', 'text', { sectionId: SU.ID }),
    fld(`${F.UNIVERSAL}-status`, 'Status do catálogo', 'textOptions', { required: true, relevance: 'highlight', sectionId: SU.ID, options: ['Ativo', 'Concluído', 'Homologado', 'Paralisado'] }),
    fld(`${F.UNIVERSAL}-catalogos`, 'Catálogos', 'reference', { required: true, multiple: true, sectionId: SU.CATS, linkedFormId: F.CATALOGO, spec: 'Catálogos (camada 2) vinculados.' }),
    // Matriz
    fld(`${F.UNIVERSAL}-produto-catalogo`, 'Produto de Catálogo', 'text', { sectionId: SU.MTX, spec: 'Nome do produto universal.' }),
    fld(`${F.UNIVERSAL}-descricao`, 'Descrição', 'text', { textLong: true, sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-metrica-base`, 'Métrica Base', 'reference', { sectionId: SU.MTX, linkedFormId: F.METRICA, spec: 'Métrica base de conversão (USN, HST).' }),
    fld(`${F.UNIVERSAL}-valor-unitario`, 'Valor Unitário (R$)', 'number', { sectionId: SU.MTX, spec: 'Valor na métrica base.' }),
    fld(`${F.UNIVERSAL}-peso`, 'Peso', 'number', { sectionId: SU.MTX, spec: 'Multiplicador para cálculo de conversão.' }),
    fld(`${F.UNIVERSAL}-cx-muito-baixa`, 'Complexidade Muito Baixa', 'boolean', { sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-cx-muito-baixa-valor`, 'Valor — Muito Baixa', 'number', { sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-cx-baixa`, 'Complexidade Baixa', 'boolean', { sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-cx-baixa-valor`, 'Valor — Baixa', 'number', { sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-cx-media`, 'Complexidade Média', 'boolean', { sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-cx-media-valor`, 'Valor — Média', 'number', { sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-cx-alta`, 'Complexidade Alta', 'boolean', { sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-cx-alta-valor`, 'Valor — Alta', 'number', { sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-cx-muito-alta`, 'Complexidade Muito Alta', 'boolean', { sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-cx-muito-alta-valor`, 'Valor — Muito Alta', 'number', { sectionId: SU.MTX }),
    fld(`${F.UNIVERSAL}-recorrencia`, 'Recorrência', 'text', { sectionId: SU.MTX, spec: 'Ex.: Mensal.' }),
    fld(`${F.UNIVERSAL}-conversor`, 'Conversor (por Complexidade)', 'number', { sectionId: SU.MTX, spec: 'Fator de conversão por nível de complexidade.' }),
  ],
  exampleValuePresets: [
    { id: `${F.UNIVERSAL}-p1`, name: 'Catálogo Universal MTI', iconColor: '#0c4a6e', fieldValues: { [`${F.UNIVERSAL}-identificador`]: 'Catálogo Universal MTI', [`${F.UNIVERSAL}-status`]: 'Ativo', [`${F.UNIVERSAL}-metrica-base`]: 'USN', [`${F.UNIVERSAL}-valor-unitario`]: 1, [`${F.UNIVERSAL}-recorrencia`]: 'Mensal' } },
  ],
  activeExamplePresetId: `${F.UNIVERSAL}-p1`,
}

// ---------- Dados de Parceria por Produto ----------
const SD = { INFO: 'sec-cat-dp-info', DIST: 'sec-cat-dp-distribuicao' }
const dadosParc = {
  id: F.DADOS_PARC, name: '(F3) Dados de Parceria por Produto', sectionLayout: 'tabs', defaultCanvasMode: 'read',
  metadata: 'Dados financeiros específicos da combinação Parceria × Produto/Catálogo. Markup vive aqui (RN-P-05/RN-DP-02). Distribuição Parceiro + MTI = 100% (RN-DP-01).',
  sections: [
    { id: SD.INFO, title: 'Informações', icon: 'info' },
    { id: SD.DIST, title: 'Distribuição', icon: 'pie_chart' },
  ],
  fields: [
    fld(`${F.DADOS_PARC}-parceria`, 'Parceria', 'reference', { sectionId: SD.INFO, linkedFormId: F.PARCERIA }),
    fld(`${F.DADOS_PARC}-solucao`, 'Solução', 'reference', { required: true, sectionId: SD.INFO, linkedFormId: F.SOLUCAO }),
    fld(`${F.DADOS_PARC}-vigencia`, 'Vigência', 'text', { required: true, sectionId: SD.INFO, spec: 'Ex.: 12 Meses, Perpétua, 24 Meses.' }),
    fld(`${F.DADOS_PARC}-recorrencia-cobranca`, 'Recorrência da Cobrança', 'text', { required: true, sectionId: SD.INFO, spec: 'Ex.: Anual, Mensal, Por Homologação.' }),
    fld(`${F.DADOS_PARC}-periodo-minimo`, 'Período Mínimo', 'text', { sectionId: SD.INFO, spec: 'Ex.: 12 Meses, N/A.' }),
    fld(`${F.DADOS_PARC}-status-parceria`, 'Status Parceria', 'textOptions', { required: true, relevance: 'highlight', sectionId: SD.INFO, options: ['Ativo', 'Homologado', 'Paralisado'], spec: 'Homologação pela alta administração MTI (PEAP item p).' }),
    fld(`${F.DADOS_PARC}-data-atualizacao-preco`, 'Data Atualização Preço', 'date', { sectionId: SD.INFO }),
    fld(`${F.DADOS_PARC}-indice-reajuste`, 'Índice de Reajuste', 'number', { sectionId: SD.INFO, spec: 'Ex.: 1.0673.' }),
    fld(`${F.DADOS_PARC}-ultima-homologacao`, 'Última Homologação', 'date', { sectionId: SD.INFO }),
    // Distribuição
    fld(`${F.DADOS_PARC}-custo-parceiro`, 'Custo do parceiro (R$)', 'number', { required: true, sectionId: SD.DIST, spec: 'Custo unitário cobrado pelo parceiro à MTI.' }),
    fld(`${F.DADOS_PARC}-markup`, 'Markup', 'number', { required: true, sectionId: SD.DIST, spec: 'Custo × Markup = Valor unitário. Ex.: 1.18, 1.25.' }),
    fld(`${F.DADOS_PARC}-dist-parceiro`, 'Distribuição do parceiro (%)', 'number', { required: true, sectionId: SD.DIST, spec: 'Ex.: 0.84 = 84%.' }),
    fld(`${F.DADOS_PARC}-dist-mti`, 'Distribuição da MTI (%)', 'number', { required: true, sectionId: SD.DIST, spec: 'Ex.: 0.16 = 16%. Parceiro + MTI = 100%.' }),
  ],
  exampleValuePresets: [
    { id: `${F.DADOS_PARC}-p1`, name: 'EloGroup × MTI Host', iconColor: '#7c3aed', fieldValues: { [`${F.DADOS_PARC}-solucao`]: 'MTI Host', [`${F.DADOS_PARC}-vigencia`]: '12 Meses', [`${F.DADOS_PARC}-recorrencia-cobranca`]: 'Anual', [`${F.DADOS_PARC}-status-parceria`]: 'Homologado', [`${F.DADOS_PARC}-custo-parceiro`]: 1000, [`${F.DADOS_PARC}-markup`]: 1.18, [`${F.DADOS_PARC}-dist-parceiro`]: 0.84, [`${F.DADOS_PARC}-dist-mti`]: 0.16 } },
  ],
  activeExamplePresetId: `${F.DADOS_PARC}-p1`,
}

forms.push(
  metrica, tipoCobranca, categoria, grupo, modeloVenda, solucao, parceria,
  produto, catalogo, universal, dadosParc,
)

// ---------- grava ----------
const allForms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const existing = new Set(allForms.map((f) => f.id))
let added = 0
for (const fm of forms) {
  if (!existing.has(fm.id)) { allForms.push(fm); added++ }
}
fs.writeFileSync(FORMS_PATH, `${JSON.stringify(allForms, null, 2)}\n`, 'utf8')

// ---------- class-groups ----------
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
const GRP_MAIN = 'grp-fase3-catalogo'
const GRP_SUP = 'grp-fase3-catalogo-suporte'
if (!cg.groups.some((g) => g.id === GRP_MAIN)) {
  cg.groups.push({ id: GRP_MAIN, name: 'Fase 3 · Catálogo & Produto' })
}
if (!cg.groups.some((g) => g.id === GRP_SUP)) {
  cg.groups.push({ id: GRP_SUP, name: 'Entidades de suporte', parentGroupId: GRP_MAIN })
}
cg.assignments = cg.assignments || {}
cg.memberOrderByGroup = cg.memberOrderByGroup || {}
const mainMembers = [F.PRODUTO, F.CATALOGO, F.UNIVERSAL, F.DADOS_PARC]
const supMembers = [F.PARCERIA, F.SOLUCAO, F.TIPO_COBR, F.METRICA, F.CATEGORIA, F.GRUPO, F.MODELO_VENDA]
for (const id of mainMembers) cg.assignments[id] = GRP_MAIN
for (const id of supMembers) cg.assignments[id] = GRP_SUP
cg.memberOrderByGroup[GRP_MAIN] = mainMembers
cg.memberOrderByGroup[GRP_SUP] = supMembers
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log(`Módulo Catálogo & Produto: ${added} classes criadas.`)
console.log('Principais:', mainMembers.length, '| Suporte:', supMembers.length)
