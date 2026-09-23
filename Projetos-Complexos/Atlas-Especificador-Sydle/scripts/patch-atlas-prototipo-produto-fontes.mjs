#!/usr/bin/env node
/**
 * Atualiza classe Produto: prefixos de preenchimento, regras no spec,
 * campos fora da classe no final como DELETE ocultos.
 *
 * Legenda no label:
 *   !  = Parceiro preenche
 *   #  = Somente MTI preenche
 *   !# = Parceiro e MTI preenchem
 *   ?  = Importado Protheus (somente leitura)
 *   MAIÚSCULAS = Parceiro não preenche e não visualiza
 *
 * Uso: node scripts/patch-atlas-prototipo-produto-fontes.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const FORMS_PATH = path.join(ROOT, 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const SEED_PATH = path.join(ROOT, 'docs/campos-atlas-dados.js')
const FORM_ID = 'form-patlasv4-proto-cat-produto'

const DELETE_FIELD_IDS = new Set([
  'form-patlasv4-proto-cat-produto-vertical',
  'form-patlasv4-proto-cat-produto-categoria-servicos',
  'form-patlasv4-proto-cat-produto-cod-n2-siag',
  'form-patlasv4-proto-cat-produto-cod-n2-protheus',
  'form-patlasv4-proto-cat-produto-cod-n3-siag',
  'form-patlasv4-proto-cat-produto-cod-n3-protheus',
  'form-patlasv4-proto-cat-produto-evento',
  'form-patlasv4-proto-cat-produto-ultima-notificacao',
  'form-patlasv4-proto-cat-produto-fc',
  'form-patlasv4-proto-cat-produto-grupo-protheus',
  'form-patlasv4-proto-cat-produto-cod-parceiro-protheus',
  'form-patlasv4-proto-cat-produto-local-padrao',
  'form-patlasv4-proto-cat-produto-tipo-protheus',
  'form-patlasv4-proto-cat-produto-unidade-protheus',
  'form-patlasv4-proto-cat-produto-tipo-protheus-class',
  'form-patlasv4-proto-cat-produto-origem',
  'form-patlasv4-proto-cat-produto-grupo-tributario',
  'form-patlasv4-proto-cat-produto-retem-ir',
  'form-patlasv4-proto-cat-produto-calcula-inss',
  'form-patlasv4-proto-cat-produto-retem-pis',
  'form-patlasv4-proto-cat-produto-retem-cofins',
  'form-patlasv4-proto-cat-produto-retem-csll',
  'form-patlasv4-proto-cat-produto-conta-contabil',
  'form-patlasv4-proto-cat-produto-cod-natureza',
])

/** prefix: ! | # | !# | ? | '' — caps: parceiro não preenche e não visualiza */
const FIELD_META = {
  'form-patlasv4-proto-cat-produto-catalogo': {
    prefix: '!#',
    caps: false,
    regras: [
      'RN-PROD-01: Primeiro campo do cadastro. Produto só existe vinculado a um Catálogo.',
      'Controla Parceria, Solução, Versão, Tipo de oferta e métricas permitidas.',
      'Ordem CSV: coluna Catálogo antes do Produto (Luís 17/08).',
    ],
  },
  'form-patlasv4-proto-cat-produto-parceria': {
    prefix: '',
    caps: false,
    regras: [
      'RN-PROD-01: Herdada do Catálogo selecionado. Somente leitura no Produto.',
      'Parceiro visualiza; preenchimento ocorre na classe Parceria.',
    ],
  },
  'form-patlasv4-proto-cat-produto-solucao': {
    prefix: '',
    caps: false,
    regras: [
      'RN-PROD-01: Herdada do Catálogo. Somente leitura.',
      'Equivalente planilha T2: Classe Solução (referência, não recadastro).',
    ],
  },
  'form-patlasv4-proto-cat-produto-versao-catalogo': {
    prefix: '',
    caps: false,
    regras: [
      'RN-PROD-01: Versão do Catálogo em que o Produto será gravado.',
      'Nasce 1.0 e evolui com apostilamento/publicação (Luís 25/08).',
    ],
  },
  'form-patlasv4-proto-cat-produto-cfg-usa-complexidade': {
    prefix: '',
    caps: true,
    regras: [
      'Flag técnica herdada do Catálogo. Oculta ao usuário.',
      'Governa exibição de Complexidade quando Tipo = Serviço.',
      'Complexidade é do Produto, não do Catálogo (Luís 17/08, 41:44).',
    ],
  },
  'form-patlasv4-proto-cat-produto-cfg-usa-peso': {
    prefix: '',
    caps: true,
    regras: ['Flag herdada do Catálogo. Oculta. Governa exibição de Peso no Serviço.'],
  },
  'form-patlasv4-proto-cat-produto-cfg-exige-qtde': {
    prefix: '',
    caps: true,
    regras: [
      'Flag herdada Catálogo/Métrica. Oculta.',
      'Governa Quantidade da métrica por execução (05/08: quantidade genérica da métrica).',
    ],
  },
  'form-patlasv4-proto-cat-produto-codigo-atlas': {
    prefix: '',
    caps: false,
    regras: [
      'RN-PROD-08: Alfanumérico único 4–6 caracteres; prefixo da parceria (ex.: SIMP001).',
      '≠ Código Proteus (ERP) ≠ Código Parceiro Protheus.',
      'Integração ServiceNow / portal (Luís 25/08).',
    ],
  },
  'form-patlasv4-proto-cat-produto-identificador': {
    prefix: '!',
    caps: false,
    regras: [
      'Obrigatório Atlas F2 (Luís 25/08: nome, métrica, parceiro, percentual).',
      'Planilha T1: Produto Catálogo Comercial / Objeto Comercial.',
      'Não copiar automaticamente para Part Number.',
    ],
  },
  'form-patlasv4-proto-cat-produto-nome-comercializacao': {
    prefix: '!#',
    caps: false,
    regras: [
      'Parceria + detalhamento do item (Luís 25/08: nome científico).',
      'Parceiro ou MTI informam. Equivalente comercial à descrição longa Protheus.',
    ],
  },
  'form-patlasv4-proto-cat-produto-part-number': {
    prefix: '!',
    caps: false,
    regras: ['SKU opcional (17/08). Planilha T1: PART NUMBER.'],
  },
  'form-patlasv4-proto-cat-produto-grupo': {
    prefix: '!#',
    caps: false,
    regras: [
      'Obrigatório. Filtrado pela parceria (Luís 17/08).',
      'Planilha: Grupo / Grupo Produto (T2).',
    ],
  },
  'form-patlasv4-proto-cat-produto-tipo': {
    prefix: '!',
    caps: false,
    regras: [
      'RN-PROD-02: Somente Licença ou Serviço.',
      '≠ Tipo Protheus (SW/SC/IT/SV) — este último é DELETE importado ERP.',
      'Serviço exibe complexidade/peso/quantidade; Licença oculta (05/08).',
    ],
  },
  'form-patlasv4-proto-cat-produto-tipo-oferta': {
    prefix: '#',
    caps: false,
    regras: [
      'RN-PROD-01: Herdado do Catálogo (Universal / Individualizado). Não recadastrar (Luís 17/08, 46:51).',
      'Substitui colunas planilha UNIVERSAL N3 e INDIVIDUALIZADO N1.',
      'Catálogo universal → só produtos universal; individualizado → só individualizados (17/08).',
    ],
  },
  'form-patlasv4-proto-cat-produto-descricao': {
    prefix: '!#',
    caps: false,
    regras: ['Escopo, entrega e resultado. Planilha: Descrição Prod. / Descrição Produto.'],
  },
  'form-patlasv4-proto-cat-produto-modelo-venda': {
    prefix: '!',
    caps: false,
    regras: [
      'RN-PROD-07 / RN-MV-03: Perpétuo → Tipo de cobrança = Única (17/08).',
      'Planilha T1: Modelo de Venda*. Cadastro mestre MTI; parceiro seleciona.',
    ],
  },
  'form-patlasv4-proto-cat-produto-cobranca': {
    prefix: '!',
    caps: false,
    regras: [
      'RN-COB-03: Sob demanda não é tipo de cobrança — é consumo OS (Fase 3).',
      'Planilha T1: Recorrência da Cobrança* / T2: Classe Tipo Cobrança*.',
    ],
  },
  'form-patlasv4-proto-cat-produto-metrica': {
    prefix: '!',
    caps: false,
    regras: [
      'RN-PROD-06: Métrica comum do produto; filtrar pelas métricas permitidas do Catálogo.',
      'Planilha T1: Métrica Comum. Obrigatório Atlas F2.',
    ],
  },
  'form-patlasv4-proto-cat-produto-valor-unitario': {
    prefix: '!#',
    caps: false,
    regras: [
      'Planilha T1: Valor Unitário / T2: Preço de Venda.',
      'Informado pelo parceiro OU calculado: Custo parceiro + Mercado MTI → VU automático (Luís 25/08, 32:44).',
    ],
  },
  'form-patlasv4-proto-cat-produto-moeda-universal': {
    prefix: '',
    caps: false,
    regras: [
      'Exibição herdada do Catálogo quando Tipo de oferta = Universal. Valor fixo 1.',
      '≠ Fator de Conversão (FC) — FC é consumo Fase 3 (Luís 05/08, 48:25).',
    ],
  },
  'form-patlasv4-proto-cat-produto-qtde-metrica': {
    prefix: '!',
    caps: false,
    regras: [
      'RN-PROD-03/04: Só Serviço + métrica exige quantidade.',
      'Campo genérico “quantidade da métrica”, não fixo UST/HST (Luís 05/08).',
    ],
  },
  'form-patlasv4-proto-cat-produto-consumo-os': {
    prefix: '!#',
    caps: false,
    regras: [
      'Consumo sob demanda via ordem de serviço (créditos). Condicional Universal.',
      'Comportamento efetivo na Fase 3; não confundir com Tipo de cobrança.',
    ],
  },
  'form-patlasv4-proto-cat-produto-custo': {
    prefix: '!',
    caps: false,
    regras: [
      'Planilha T1: Custo*. Parceiro informa no cadastro/CSV.',
      'Após contrato, parceiro não vê custo/markup no contrato (Luís 17/08, 57:14).',
    ],
  },
  'form-patlasv4-proto-cat-produto-markup': {
    prefix: '#',
    caps: true,
    regras: [
      'Planilha T1: MARKUP*. MTI informa mercado (1,23 / 1,25 / 1,30…).',
      'Parceiro não visualiza. Pode ser ajustado manualmente no contrato (Luís 17/08).',
    ],
  },
  'form-patlasv4-proto-cat-produto-pct-parceiro': {
    prefix: '',
    caps: false,
    regras: [
      'Calculado automaticamente a partir de Custo + Mercado MTI (Luís 25/08).',
      'Parceiro visualiza em consulta. Planilha T1: % Parceiro.',
    ],
  },
  'form-patlasv4-proto-cat-produto-pct-mti': {
    prefix: '',
    caps: true,
    regras: [
      'Calculado; % Parceiro + % MTI = 100. Uso interno MTI.',
      'Parceiro não preenche e não visualiza.',
    ],
  },
  'form-patlasv4-proto-cat-produto-periodo-minimo': {
    prefix: '!',
    caps: false,
    regras: [
      'Obrigatório: 12, 24, 36, 48 ou 60 meses (Luís 17/08, 1:05:14).',
      'Substitui “vigência”. Impacta reajuste/apostilamento (eventos).',
      'Planilha T1: Período Minímo*.',
    ],
  },
  'form-patlasv4-proto-cat-produto-complexidade': {
    prefix: '!',
    caps: false,
    regras: [
      'RN-PROD-03: Do Produto/Serviço, não do Catálogo (Luís 17/08).',
      'Só exibido quando Tipo = Serviço e catálogo usa complexidade.',
    ],
  },
  'form-patlasv4-proto-cat-produto-coeficiente-complexidade': {
    prefix: '',
    caps: false,
    regras: ['Somente leitura. Derivado da faixa de complexidade do catálogo/parceria.'],
  },
  'form-patlasv4-proto-cat-produto-peso': {
    prefix: '!',
    caps: false,
    regras: ['Só Serviço quando catálogo usa peso. Oculto para Licença.'],
  },
  'form-patlasv4-proto-cat-produto-cod-siag-item': {
    prefix: '#',
    caps: true,
    regras: [
      'Código N1 / CIAG. Opcional no cadastro F2; obrigatório no contrato quando N1 (Luís 17/08, 1:03:12).',
      'Parceiro não visualiza. Planilha T1: Código N1 Siag.',
    ],
  },
  'form-patlasv4-proto-cat-produto-cod-protheus-item': {
    prefix: '?',
    caps: true,
    regras: [
      'Código N1 Infocenter/Proteus. Importado ou informado na homologação/contrato.',
      'Opcional F2; obrigatório contrato N1. Parceiro não visualiza.',
    ],
  },
  'form-patlasv4-proto-cat-produto-status': {
    prefix: '#',
    caps: false,
    regras: [
      'Workflow catálogo/produto: Rascunho → Em análise → Aprovado → Publicado…',
      '≠ Status Parceria (planilha T1). Gerado pelo fluxo MTI.',
    ],
  },
  'form-patlasv4-proto-cat-produto-ativo': {
    prefix: '!#',
    caps: false,
    regras: ['Disponibilidade para novos vínculos. Não substitui Status de workflow.'],
  },
}

const DELETE_META = {
  'form-patlasv4-proto-cat-produto-vertical': {
    prefix: '',
    regras: ['Classe correta: Parceria (Vertical de Serviço de TI). Luís 17/08 e 25/08.'],
  },
  'form-patlasv4-proto-cat-produto-categoria-servicos': {
    prefix: '',
    regras: ['Renomeada para Vertical na Parceria. Não cadastrar no Produto.'],
  },
  'form-patlasv4-proto-cat-produto-cod-n2-siag': {
    prefix: '',
    regras: ['N2 = catálogo da parceria. Classe Catálogo (Luís 25/08, 19:05).'],
  },
  'form-patlasv4-proto-cat-produto-cod-n2-protheus': {
    prefix: '?',
    regras: ['N2 Proteus no Catálogo de parceria. Não no Produto.'],
  },
  'form-patlasv4-proto-cat-produto-cod-n3-siag': {
    prefix: '',
    regras: ['N3 = catálogo universal. Classe Catálogo.'],
  },
  'form-patlasv4-proto-cat-produto-cod-n3-protheus': {
    prefix: '?',
    regras: ['N3 Proteus no Catálogo universal.'],
  },
  'form-patlasv4-proto-cat-produto-evento': {
    prefix: '',
    regras: ['Evento de vigência/reajuste — visão/evento, não campo cadastro (Luís 25/08).'],
  },
  'form-patlasv4-proto-cat-produto-ultima-notificacao': {
    prefix: '',
    regras: ['Espelho workflow — não atributo de domínio do Produto.'],
  },
  'form-patlasv4-proto-cat-produto-fc': {
    prefix: '',
    regras: ['Fator de Conversão N3→N2 no consumo/OS. Fase 3; não no cadastro (17/08).'],
  },
  'form-patlasv4-proto-cat-produto-grupo-protheus': {
    prefix: '?',
    regras: ['Planilha laranja Protheus. Fora Atlas F2 (Luís 25/08, 48:53).'],
  },
  'form-patlasv4-proto-cat-produto-cod-parceiro-protheus': {
    prefix: '?',
    regras: ['Código parceiro no ERP. Classe Organização/Parceria.'],
  },
  'form-patlasv4-proto-cat-produto-local-padrao': {
    prefix: '?',
    regras: ['Importado Protheus. Planilha laranja.'],
  },
  'form-patlasv4-proto-cat-produto-tipo-protheus': {
    prefix: '?',
    regras: ['Tipo ERP (SW/SC/IT/SV). ≠ Tipo de produto Atlas (Licença/Serviço).'],
  },
  'form-patlasv4-proto-cat-produto-unidade-protheus': {
    prefix: '?',
    regras: ['Unidade ERP. Equivalente comercial Atlas = Métrica.'],
  },
  'form-patlasv4-proto-cat-produto-tipo-protheus-class': {
    prefix: '?',
    regras: ['Classificação técnica Protheus. Fora escopo cadastro Atlas F2.'],
  },
  'form-patlasv4-proto-cat-produto-origem': {
    prefix: '?',
    regras: ['Fiscal/contábil. Contabilidade preenche no Protheus (João 21/08). Fora Atlas F2.'],
  },
  'form-patlasv4-proto-cat-produto-grupo-tributario': { prefix: '?', regras: ['Fiscal. Fora Atlas F2.'] },
  'form-patlasv4-proto-cat-produto-retem-ir': { prefix: '?', regras: ['Retenção fiscal Protheus. Fora Atlas F2.'] },
  'form-patlasv4-proto-cat-produto-calcula-inss': { prefix: '?', regras: ['Fiscal Protheus. Fora Atlas F2.'] },
  'form-patlasv4-proto-cat-produto-retem-pis': { prefix: '?', regras: ['Fiscal Protheus. Fora Atlas F2.'] },
  'form-patlasv4-proto-cat-produto-retem-cofins': { prefix: '?', regras: ['Fiscal Protheus. Fora Atlas F2.'] },
  'form-patlasv4-proto-cat-produto-retem-csll': { prefix: '?', regras: ['Fiscal Protheus. Fora Atlas F2.'] },
  'form-patlasv4-proto-cat-produto-conta-contabil': { prefix: '?', regras: ['Contábil Protheus. Fora Atlas F2.'] },
  'form-patlasv4-proto-cat-produto-cod-natureza': { prefix: '?', regras: ['Natureza fiscal Protheus. Fora Atlas F2.'] },
}

const FIELD_MAP = {
  Catálogo: 'form-patlasv4-proto-cat-produto-catalogo',
  Parceria: 'form-patlasv4-proto-cat-produto-parceria',
  Solução: 'form-patlasv4-proto-cat-produto-solucao',
  'Versão do catálogo': 'form-patlasv4-proto-cat-produto-versao-catalogo',
  'Catálogo usa complexidade?': 'form-patlasv4-proto-cat-produto-cfg-usa-complexidade',
  'Catálogo usa peso?': 'form-patlasv4-proto-cat-produto-cfg-usa-peso',
  'Métrica exige quantidade por execução?': 'form-patlasv4-proto-cat-produto-cfg-exige-qtde',
  'Código Atlas': 'form-patlasv4-proto-cat-produto-codigo-atlas',
  'Nome do produto': 'form-patlasv4-proto-cat-produto-identificador',
  'Nome científico / comercialização': 'form-patlasv4-proto-cat-produto-nome-comercializacao',
  'Part Number (SKU)': 'form-patlasv4-proto-cat-produto-part-number',
  'Tipo de produto': 'form-patlasv4-proto-cat-produto-tipo',
  'Categoria de serviços': 'form-patlasv4-proto-cat-produto-categoria-servicos',
  'Descrição do produto': 'form-patlasv4-proto-cat-produto-descricao',
  'Tipo de oferta': 'form-patlasv4-proto-cat-produto-tipo-oferta',
  Grupo: 'form-patlasv4-proto-cat-produto-grupo',
  'Modelo de venda': 'form-patlasv4-proto-cat-produto-modelo-venda',
  'Tipo de cobrança': 'form-patlasv4-proto-cat-produto-cobranca',
  Métrica: 'form-patlasv4-proto-cat-produto-metrica',
  'Vertical de serviço': 'form-patlasv4-proto-cat-produto-vertical',
  'Valor unitário': 'form-patlasv4-proto-cat-produto-valor-unitario',
  'Valor da moeda universal': 'form-patlasv4-proto-cat-produto-moeda-universal',
  'Quantidade da métrica por execução': 'form-patlasv4-proto-cat-produto-qtde-metrica',
  'Consumo por ordem de serviço?': 'form-patlasv4-proto-cat-produto-consumo-os',
  Custo: 'form-patlasv4-proto-cat-produto-custo',
  Markup: 'form-patlasv4-proto-cat-produto-markup',
  '% Parceiro': 'form-patlasv4-proto-cat-produto-pct-parceiro',
  '% MTI': 'form-patlasv4-proto-cat-produto-pct-mti',
  'Período mínimo': 'form-patlasv4-proto-cat-produto-periodo-minimo',
  Complexidade: 'form-patlasv4-proto-cat-produto-complexidade',
  'Coeficiente de complexidade': 'form-patlasv4-proto-cat-produto-coeficiente-complexidade',
  Peso: 'form-patlasv4-proto-cat-produto-peso',
  'Código N1 — SIAG': 'form-patlasv4-proto-cat-produto-cod-siag-item',
  'Código N1 — Protheus': 'form-patlasv4-proto-cat-produto-cod-protheus-item',
  'Código N2 — SIAG': 'form-patlasv4-proto-cat-produto-cod-n2-siag',
  'Código N2 — Protheus': 'form-patlasv4-proto-cat-produto-cod-n2-protheus',
  'Código N3 — SIAG': 'form-patlasv4-proto-cat-produto-cod-n3-siag',
  'Código N3 — Protheus': 'form-patlasv4-proto-cat-produto-cod-n3-protheus',
  'Evento início/fim': 'form-patlasv4-proto-cat-produto-evento',
  'Última notificação do fluxo': 'form-patlasv4-proto-cat-produto-ultima-notificacao',
  'Fator de Conversão (FC)': 'form-patlasv4-proto-cat-produto-fc',
  'Grupo Protheus': 'form-patlasv4-proto-cat-produto-grupo-protheus',
  'Código do parceiro — Protheus': 'form-patlasv4-proto-cat-produto-cod-parceiro-protheus',
  'Local padrão': 'form-patlasv4-proto-cat-produto-local-padrao',
  Tipo: 'form-patlasv4-proto-cat-produto-tipo-protheus',
  Unidade: 'form-patlasv4-proto-cat-produto-unidade-protheus',
  'Tipo Protheus': 'form-patlasv4-proto-cat-produto-tipo-protheus-class',
  Origem: 'form-patlasv4-proto-cat-produto-origem',
  'Grupo tributário': 'form-patlasv4-proto-cat-produto-grupo-tributario',
  'Retém IR (Imposto de Renda)': 'form-patlasv4-proto-cat-produto-retem-ir',
  'Calcula INSS': 'form-patlasv4-proto-cat-produto-calcula-inss',
  'Retém PIS': 'form-patlasv4-proto-cat-produto-retem-pis',
  'Retém COFINS': 'form-patlasv4-proto-cat-produto-retem-cofins',
  'Retém CSLL': 'form-patlasv4-proto-cat-produto-retem-csll',
  'Conta contábil': 'form-patlasv4-proto-cat-produto-conta-contabil',
  'Código natureza': 'form-patlasv4-proto-cat-produto-cod-natureza',
  'Status do produto': 'form-patlasv4-proto-cat-produto-status',
  'Ativo?': 'form-patlasv4-proto-cat-produto-ativo',
}

const SEC = {
  ctx: 'sec-prod-ctx',
  flags: 'sec-prod-flags',
  ident: 'sec-prod-ident',
  classCom: 'sec-prod-class-com',
  prec: 'sec-prod-prec',
  condParc: 'sec-prod-cond-parc',
  condServ: 'sec-prod-cond',
  codN1: 'sec-prod-cod',
  status: 'sec-prod-status',
  card: 'sec-prod-card',
  delete: 'sec-prod-delete',
}

const ACTIVE_ORDER = [
  'form-patlasv4-proto-cat-produto-catalogo',
  'form-patlasv4-proto-cat-produto-parceria',
  'form-patlasv4-proto-cat-produto-solucao',
  'form-patlasv4-proto-cat-produto-versao-catalogo',
  'form-patlasv4-proto-cat-produto-tipo-oferta',
  'form-patlasv4-proto-cat-produto-cfg-usa-complexidade',
  'form-patlasv4-proto-cat-produto-cfg-usa-peso',
  'form-patlasv4-proto-cat-produto-cfg-exige-qtde',
  'form-patlasv4-proto-cat-produto-codigo-atlas',
  'form-patlasv4-proto-cat-produto-identificador',
  'form-patlasv4-proto-cat-produto-nome-comercializacao',
  'form-patlasv4-proto-cat-produto-part-number',
  'form-patlasv4-proto-cat-produto-tipo',
  'form-patlasv4-proto-cat-produto-grupo',
  'form-patlasv4-proto-cat-produto-descricao',
  'form-patlasv4-proto-cat-produto-modelo-venda',
  'form-patlasv4-proto-cat-produto-cobranca',
  'form-patlasv4-proto-cat-produto-metrica',
  'form-patlasv4-proto-cat-produto-valor-unitario',
  'form-patlasv4-proto-cat-produto-moeda-universal',
  'form-patlasv4-proto-cat-produto-custo',
  'form-patlasv4-proto-cat-produto-markup',
  'form-patlasv4-proto-cat-produto-pct-parceiro',
  'form-patlasv4-proto-cat-produto-pct-mti',
  'form-patlasv4-proto-cat-produto-periodo-minimo',
  'form-patlasv4-proto-cat-produto-complexidade',
  'form-patlasv4-proto-cat-produto-coeficiente-complexidade',
  'form-patlasv4-proto-cat-produto-peso',
  'form-patlasv4-proto-cat-produto-qtde-metrica',
  'form-patlasv4-proto-cat-produto-consumo-os',
  'form-patlasv4-proto-cat-produto-cod-siag-item',
  'form-patlasv4-proto-cat-produto-cod-protheus-item',
  'form-patlasv4-proto-cat-produto-status',
  'form-patlasv4-proto-cat-produto-ativo',
]

const DELETE_ORDER = [
  'form-patlasv4-proto-cat-produto-vertical',
  'form-patlasv4-proto-cat-produto-categoria-servicos',
  'form-patlasv4-proto-cat-produto-cod-n2-siag',
  'form-patlasv4-proto-cat-produto-cod-n2-protheus',
  'form-patlasv4-proto-cat-produto-cod-n3-siag',
  'form-patlasv4-proto-cat-produto-cod-n3-protheus',
  'form-patlasv4-proto-cat-produto-evento',
  'form-patlasv4-proto-cat-produto-ultima-notificacao',
  'form-patlasv4-proto-cat-produto-fc',
  'form-patlasv4-proto-cat-produto-grupo-protheus',
  'form-patlasv4-proto-cat-produto-cod-parceiro-protheus',
  'form-patlasv4-proto-cat-produto-local-padrao',
  'form-patlasv4-proto-cat-produto-tipo-protheus',
  'form-patlasv4-proto-cat-produto-unidade-protheus',
  'form-patlasv4-proto-cat-produto-tipo-protheus-class',
  'form-patlasv4-proto-cat-produto-origem',
  'form-patlasv4-proto-cat-produto-grupo-tributario',
  'form-patlasv4-proto-cat-produto-retem-ir',
  'form-patlasv4-proto-cat-produto-calcula-inss',
  'form-patlasv4-proto-cat-produto-retem-pis',
  'form-patlasv4-proto-cat-produto-retem-cofins',
  'form-patlasv4-proto-cat-produto-retem-csll',
  'form-patlasv4-proto-cat-produto-conta-contabil',
  'form-patlasv4-proto-cat-produto-cod-natureza',
]

const GRUPO_SEC = {
  'Produto — Contexto': SEC.ctx,
  'Produto — Contexto (flags)': SEC.flags,
  'Produto — Identificação': SEC.ident,
  'Produto — Classificação comercial': SEC.classCom,
  'Produto — Precificação': SEC.prec,
  'Produto — Condições comerciais da parceria': SEC.condParc,
  'Produto — Códigos N1 (item)': SEC.codN1,
  'Produto — Workflow': SEC.status,
  'Produto — Controle': SEC.status,
}

const COND_SERV_IDS = new Set([
  'form-patlasv4-proto-cat-produto-complexidade',
  'form-patlasv4-proto-cat-produto-coeficiente-complexidade',
  'form-patlasv4-proto-cat-produto-peso',
  'form-patlasv4-proto-cat-produto-qtde-metrica',
])

const REQUIRED_IDS = new Set([
  'form-patlasv4-proto-cat-produto-catalogo',
  'form-patlasv4-proto-cat-produto-parceria',
  'form-patlasv4-proto-cat-produto-solucao',
  'form-patlasv4-proto-cat-produto-versao-catalogo',
  'form-patlasv4-proto-cat-produto-tipo-oferta',
  'form-patlasv4-proto-cat-produto-codigo-atlas',
  'form-patlasv4-proto-cat-produto-identificador',
  'form-patlasv4-proto-cat-produto-tipo',
  'form-patlasv4-proto-cat-produto-grupo',
  'form-patlasv4-proto-cat-produto-modelo-venda',
  'form-patlasv4-proto-cat-produto-cobranca',
  'form-patlasv4-proto-cat-produto-metrica',
  'form-patlasv4-proto-cat-produto-valor-unitario',
  'form-patlasv4-proto-cat-produto-custo',
  'form-patlasv4-proto-cat-produto-periodo-minimo',
  'form-patlasv4-proto-cat-produto-status',
  'form-patlasv4-proto-cat-produto-ativo',
])

const READONLY_IDS = new Set([
  'form-patlasv4-proto-cat-produto-parceria',
  'form-patlasv4-proto-cat-produto-solucao',
  'form-patlasv4-proto-cat-produto-versao-catalogo',
  'form-patlasv4-proto-cat-produto-cfg-usa-complexidade',
  'form-patlasv4-proto-cat-produto-cfg-usa-peso',
  'form-patlasv4-proto-cat-produto-cfg-exige-qtde',
  'form-patlasv4-proto-cat-produto-codigo-atlas',
  'form-patlasv4-proto-cat-produto-tipo-oferta',
  'form-patlasv4-proto-cat-produto-pct-parceiro',
  'form-patlasv4-proto-cat-produto-pct-mti',
  'form-patlasv4-proto-cat-produto-coeficiente-complexidade',
  'form-patlasv4-proto-cat-produto-moeda-universal',
  'form-patlasv4-proto-cat-produto-status',
  'form-patlasv4-proto-cat-produto-cod-protheus-item',
])

function loadSeed() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8')
  return JSON.parse(raw.replace(/^const SEED_DATA\s*=\s*/, '').replace(/;\s*$/, ''))
}

function parseOptions(opcoes) {
  if (!opcoes || opcoes === '—' || opcoes === '-') return undefined
  return opcoes
    .split('·')
    .map((s) => s.trim().replace(/\s*\(\+ cadastros MTI\)$/, ''))
    .filter(Boolean)
}

function mapTipo(row) {
  const t = row.tipo.toLowerCase()
  if (t.includes('boolean')) return 'boolean'
  if (t.includes('data')) return 'date'
  if (t.includes('moeda')) return 'number'
  if (t.includes('percentual')) return 'number'
  if (t.includes('enum') || t.includes('textoptions')) return 'textOptions'
  if (t.includes('referência') || t.includes('referencia')) return 'reference'
  if (t.includes('número') || t.includes('numero')) return 'number'
  return 'text'
}

function baseLabel(row, id) {
  if (id === 'form-patlasv4-proto-cat-produto-cod-siag-item') return 'Código SIAG - Item'
  if (id === 'form-patlasv4-proto-cat-produto-cod-protheus-item') return 'Código Proteus - Item'
  if (row.nome === 'Ativo?') return 'Ativo'
  if (row.nome === 'Markup') return 'Custo de mercado MTI (Markup)'
  if (row.nome === 'Vertical de serviço') return 'Vertical de Serviço de TI'
  if (row.nome === 'Tipo' && id.includes('tipo-protheus')) return 'Tipo Protheus (ERP)'
  if (row.nome === 'Unidade') return 'Unidade Protheus'
  return row.nome
}

function formatLabel(id, name, isDelete) {
  const meta = isDelete ? DELETE_META[id] : FIELD_META[id]
  const prefix = meta?.prefix ?? ''
  let text = name
  if (!isDelete && meta?.caps) text = text.toUpperCase()
  if (isDelete) return `DELETE ${prefix}${text}`
  return `${prefix}${text}`
}

function buildSpec(row, id, isDelete) {
  const meta = isDelete ? DELETE_META[id] : FIELD_META[id]
  const parts = [
    '**Classe:** Produto (Atlas Fase 2)' + (isDelete ? ' — **FORA DE ESCOPO (DELETE)**' : ''),
    '',
    '**Legenda do label:** `!` Parceiro preenche · `#` MTI preenche · `!#` Ambos · `?` Importado Protheus (RO) · MAIÚSCULAS = parceiro não preenche e não visualiza',
    '',
  ]
  if (meta?.regras?.length) {
    parts.push('**Regras de negócio:**')
    for (const r of meta.regras) parts.push(`- ${r}`)
    parts.push('')
  }
  if (row.regra) parts.push(`**Regra (inventário):** ${row.regra}`)
  if (row.preenche) parts.push(`**Quem preenche (inventário):** ${row.preenche}`)
  if (row.visualiza) parts.push(`**Quem visualiza (inventário):** ${row.visualiza}`)
  if (row.protheus && row.protheus !== 'Não') parts.push(`**Protheus:** ${row.protheus}`)
  if (row.status) parts.push(`**Validação:** ${row.status}`)
  if (isDelete) {
    parts.push('')
    parts.push('**Ação protótipo:** Campo mantido no JSON para rastreabilidade; oculto; não exibir ao parceiro nem MTI na Fase 2.')
  }
  return parts.filter(Boolean).join('\n')
}

function inferLinked(row, id) {
  const n = row.nome.toLowerCase()
  const t = row.tipo.toLowerCase()
  if (!t.includes('referência') && !t.includes('referencia')) return undefined
  if (n.includes('vertical') || n.includes('categoria')) return 'form-patlasv4-proto-cat-categoria'
  if (n.includes('parceria')) return 'form-patlasv4-proto-cat-parceria'
  if (n.includes('solução') || n.includes('solucao')) return 'form-patlasv4-proto-cat-solucao'
  if (n.includes('catálogo') || n.includes('catalogo')) return 'form-patlasv4-proto-cat-catalogo'
  if (n.includes('grupo') && !n.includes('protheus') && !n.includes('tribut')) return 'form-patlasv4-proto-cat-grupo'
  if (n.includes('métrica') || n.includes('metrica')) return 'form-patlasv4-proto-cat-metrica'
  if (n.includes('modelo de venda')) return 'form-patlasv4-proto-cat-modelo-venda'
  if (n.includes('cobrança') || n.includes('cobranca')) return 'form-patlasv4-proto-cat-tipo-cobranca'
  return undefined
}

function buildField(row) {
  const id = FIELD_MAP[row.nome]
  if (!id) throw new Error(`Campo sem id: ${row.nome}`)
  const isDelete = DELETE_FIELD_IDS.has(id)
  const type = mapTipo(row)
  const opts = parseOptions(row.opcoes)
  const name = baseLabel(row, id)

  let sectionId = SEC.delete
  if (!isDelete) {
    sectionId = COND_SERV_IDS.has(id)
      ? SEC.condServ
      : GRUPO_SEC[row.grupo] || SEC.ident
    if (id === 'form-patlasv4-proto-cat-produto-tipo-oferta') sectionId = SEC.ctx
    if (
      id === 'form-patlasv4-proto-cat-produto-custo' ||
      id === 'form-patlasv4-proto-cat-produto-markup' ||
      id === 'form-patlasv4-proto-cat-produto-pct-parceiro' ||
      id === 'form-patlasv4-proto-cat-produto-pct-mti' ||
      id === 'form-patlasv4-proto-cat-produto-periodo-minimo'
    ) {
      sectionId = SEC.condParc
    }
  }

  const field = {
    id,
    label: formatLabel(id, name, isDelete),
    type,
    size:
      type === 'text' && (row.nome.includes('Descrição') || row.nome.includes('comercialização'))
        ? 'large'
        : row.nome === 'Ativo?' ? 'small' : 'medium',
    readOnly: isDelete || READONLY_IDS.has(id),
    required: !isDelete && (REQUIRED_IDS.has(id) || /obrigatório/i.test(row.regra || '')),
    multiple: false,
    relevance:
      row.nome === 'Nome do produto' || row.nome === 'Catálogo'
        ? 'identity'
        : row.nome === 'Código Atlas'
          ? 'highlight'
          : 'common',
    sectionId,
    spec: buildSpec(row, id, isDelete),
    hidden: isDelete || undefined,
  }

  if (isDelete) field.hidden = true

  if (
    !isDelete &&
    (row.nome.includes('Catálogo usa') ||
      row.nome.includes('Métrica exige') ||
      row.nome === 'Consumo por ordem de serviço?' ||
      row.nome === 'Valor da moeda universal' ||
      COND_SERV_IDS.has(id))
  ) {
    field.hidden = true
  }

  if (opts?.length && type !== 'boolean') field.options = opts
  const linked = inferLinked(row, id)
  if (linked) field.linkedFormId = linked
  if (type === 'number' && row.tipo.includes('Moeda')) field.currency = true
  if (row.nome === 'Descrição do produto' || row.nome === 'Nome científico / comercialização') {
    field.textLong = true
  }

  return field
}

function orderFields(fields) {
  const byId = new Map(fields.map((f) => [f.id, f]))
  const active = []
  for (const id of ACTIVE_ORDER) {
    if (byId.has(id)) active.push(byId.get(id))
  }
  const deletes = []
  for (const id of DELETE_ORDER) {
    if (byId.has(id)) deletes.push(byId.get(id))
  }
  return { active, deletes }
}

function defaultCardHtml() {
  return `<div class="atlas-prod-card"><strong>{{nome}}</strong><span>{{tipo}}</span><em>{{status}}</em></div>`
}

function buildForm(seedRows, preserved) {
  const built = seedRows.map(buildField)
  const { active, deletes } = orderFields(built)

  active.splice(
    active.findIndex((f) => f.id === 'form-patlasv4-proto-cat-produto-modelo-venda') + 1,
    0,
    {
      id: 'form-patlasv4-proto-cat-produto-alerta-perpetuo',
      label: 'Regra Perpétuo',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: SEC.classCom,
      alertVariant: 'info',
      alertTitle: 'Modelo Perpétuo → cobrança Única',
      alertMessage: 'Ao selecionar Modelo de venda = Perpétuo, selecione Tipo de cobrança = Única (17/08).',
      alertCollapsible: true,
      spec:
        '**Regra de negócio (RN-MV-03 / RN-COB-02):** Não é campo persistido.\n\nPerpétuo na planilha → cobrança única.',
    },
  )

  active.push({
    id: 'form-patlasv4-proto-cat-produto-card',
    label: 'Prévia do card',
    type: 'html',
    size: 'large',
    readOnly: true,
    required: false,
    multiple: false,
    relevance: 'common',
    sectionId: SEC.card,
    htmlContent: preserved.cardHtml || defaultCardHtml(),
    spec: 'Componente UI — não é atributo de domínio.',
  })

  const fields = [...active, ...deletes]

  return {
    id: FORM_ID,
    name: 'Produto',
    sectionLayout: 'accordion',
    defaultCanvasMode: 'edit',
    metadata:
      'Fontes 05–25/08/2026. Labels: ! parceiro · # MTI · !# ambos · ? Protheus · MAIÚSCULAS = parceiro não vê. ' +
      'Campos DELETE ao final, ocultos. Atualizado 2026-08-31.',
    sections: [
      { id: SEC.ctx, title: 'Contexto do Catálogo', icon: 'account_tree' },
      { id: SEC.flags, title: 'Flags do catálogo (controle UI)', icon: 'tune' },
      { id: SEC.ident, title: 'Identificação', icon: 'badge' },
      { id: SEC.classCom, title: 'Classificação comercial', icon: 'sell' },
      { id: SEC.prec, title: 'Precificação', icon: 'payments' },
      { id: SEC.condParc, title: 'Condições comerciais da parceria', icon: 'handshake' },
      { id: SEC.condServ, title: 'Características condicionais (Serviço)', icon: 'rule' },
      { id: SEC.codN1, title: 'Códigos do item (N1)', icon: 'qr_code' },
      { id: SEC.status, title: 'Situação', icon: 'flag' },
      { id: SEC.card, title: 'Card da listagem', icon: 'style' },
      { id: SEC.delete, title: 'DELETE — fora da classe Produto', icon: 'delete_outline' },
    ],
    fields,
    fieldVisibilityRules: [
      {
        id: 'rule-prod-servico-cond',
        operator: 'eq',
        sourceFieldId: 'form-patlasv4-proto-cat-produto-tipo',
        action: 'show',
        targetFieldIds: [
          'form-patlasv4-proto-cat-produto-qtde-metrica',
          'form-patlasv4-proto-cat-produto-complexidade',
          'form-patlasv4-proto-cat-produto-coeficiente-complexidade',
          'form-patlasv4-proto-cat-produto-peso',
        ],
        sourceKind: 'textOptions',
        expectedOptionText: 'Serviço',
      },
      {
        id: 'rule-prod-hide-qtde-se-nao-exige',
        operator: 'eq',
        sourceFieldId: 'form-patlasv4-proto-cat-produto-cfg-exige-qtde',
        action: 'hide',
        targetFieldIds: ['form-patlasv4-proto-cat-produto-qtde-metrica'],
        sourceKind: 'boolean',
        expectedBoolean: false,
      },
      {
        id: 'rule-prod-universal-campos',
        operator: 'eq',
        sourceFieldId: 'form-patlasv4-proto-cat-produto-tipo-oferta',
        action: 'show',
        targetFieldIds: [
          'form-patlasv4-proto-cat-produto-consumo-os',
          'form-patlasv4-proto-cat-produto-moeda-universal',
        ],
        sourceKind: 'textOptions',
        expectedOptionText: 'Universal',
      },
    ],
    exampleValuePresets: preserved.exampleValuePresets,
    activeExamplePresetId: preserved.activeExamplePresetId,
    methods: preserved.methods,
  }
}

function main() {
  const seed = loadSeed()
  const prodRows = seed.filter(
    (r) => r.classe === 'Produto' && r.nome !== 'Código SIAG' && r.nome !== 'Código Protheus',
  )

  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const idx = forms.findIndex((x) => x.id === FORM_ID)
  if (idx < 0) throw new Error('Form Produto não encontrado')

  const old = forms[idx]
  const cardField = old.fields.find((x) => x.id === 'form-patlasv4-proto-cat-produto-card')
  const preserved = {
    cardHtml: cardField?.htmlContent,
    exampleValuePresets: old.exampleValuePresets || [],
    activeExamplePresetId: old.activeExamplePresetId,
    methods: old.methods || [],
  }

  forms[idx] = buildForm(prodRows, preserved)

  // Garantir convenção DELETE: label + hidden em todos os fora de escopo
  const deleteLabelsFixed = {
    'form-patlasv4-proto-cat-produto-vertical': 'DELETE Vertical de Serviço de TI',
    'form-patlasv4-proto-cat-produto-categoria-servicos': 'DELETE Categoria de serviços',
    'form-patlasv4-proto-cat-produto-cod-n2-siag': 'DELETE Código N2 — SIAG',
    'form-patlasv4-proto-cat-produto-cod-n2-protheus': 'DELETE ?Código N2 — Protheus',
    'form-patlasv4-proto-cat-produto-cod-n3-siag': 'DELETE Código N3 — SIAG',
    'form-patlasv4-proto-cat-produto-cod-n3-protheus': 'DELETE ?Código N3 — Protheus',
    'form-patlasv4-proto-cat-produto-evento': 'DELETE Evento início/fim',
    'form-patlasv4-proto-cat-produto-ultima-notificacao': 'DELETE Última notificação do fluxo',
    'form-patlasv4-proto-cat-produto-fc': 'DELETE Fator de Conversão (FC)',
    'form-patlasv4-proto-cat-produto-grupo-protheus': 'DELETE ?Grupo Protheus',
    'form-patlasv4-proto-cat-produto-cod-parceiro-protheus': 'DELETE ?Código do parceiro — Protheus',
    'form-patlasv4-proto-cat-produto-local-padrao': 'DELETE ?Local padrão',
    'form-patlasv4-proto-cat-produto-tipo-protheus': 'DELETE ?Tipo Protheus (ERP)',
    'form-patlasv4-proto-cat-produto-unidade-protheus': 'DELETE ?Unidade Protheus',
    'form-patlasv4-proto-cat-produto-tipo-protheus-class': 'DELETE ?Tipo Protheus',
    'form-patlasv4-proto-cat-produto-origem': 'DELETE ?Origem',
    'form-patlasv4-proto-cat-produto-grupo-tributario': 'DELETE ?Grupo tributário',
    'form-patlasv4-proto-cat-produto-retem-ir': 'DELETE ?Retém IR (Imposto de Renda)',
    'form-patlasv4-proto-cat-produto-calcula-inss': 'DELETE ?Calcula INSS',
    'form-patlasv4-proto-cat-produto-retem-pis': 'DELETE ?Retém PIS',
    'form-patlasv4-proto-cat-produto-retem-cofins': 'DELETE ?Retém COFINS',
    'form-patlasv4-proto-cat-produto-retem-csll': 'DELETE ?Retém CSLL',
    'form-patlasv4-proto-cat-produto-conta-contabil': 'DELETE ?Conta contábil',
    'form-patlasv4-proto-cat-produto-cod-natureza': 'DELETE ?Código natureza',
  }
  for (const f of forms[idx].fields) {
    if (!DELETE_FIELD_IDS.has(f.id)) continue
    if (deleteLabelsFixed[f.id]) f.label = deleteLabelsFixed[f.id]
    else if (!f.label.startsWith('DELETE ')) f.label = `DELETE ${f.label}`
    f.hidden = true
    f.readOnly = true
    f.sectionId = SEC.delete
  }

  fs.writeFileSync(FORMS_PATH, JSON.stringify(forms, null, 2) + '\n', 'utf8')

  const form = forms[idx]
  const del = form.fields.filter((f) => f.label.startsWith('DELETE '))
  const hiddenDel = del.filter((f) => f.hidden === true)
  console.log(`✓ Produto: ${form.fields.length} campos`)
  console.log(`  DELETE ocultos: ${hiddenDel.length}/${del.length}`)
  console.log(`  Último campo: ${form.fields.at(-1)?.label}`)
}

main()
