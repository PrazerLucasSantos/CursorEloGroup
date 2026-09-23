#!/usr/bin/env node
/**
 * Atualiza Parceria, Solução e Catálogo conforme fontes 05–25/08/2026.
 * Mesma convenção do Produto: prefixos no label, specs com regras, DELETE oculto ao final.
 *
 * Uso: node scripts/patch-atlas-prototipo-cps-fontes.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const FORMS_PATH = path.join(ROOT, 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const SEED_PATH = path.join(ROOT, 'docs/campos-atlas-dados.js')

const LEGEND =
  '**Legenda do label:** `!` Parceiro preenche · `#` MTI preenche · `!#` Ambos · `?` Importado Protheus (RO) · MAIÚSCULAS = parceiro não preenche e não visualiza'

const FORMS = {
  Parceria: 'form-patlasv4-proto-cat-parceria',
  Solução: 'form-patlasv4-proto-cat-solucao',
  Catálogo: 'form-patlasv4-proto-cat-catalogo',
}

const FIELD_MAP = {
  Parceria: {
    Identificador: 'form-patlasv4-proto-cat-parceria-identificador',
    'Código da Parceira': 'form-patlasv4-proto-cat-parceria-codigo-parceira',
    Descrição: 'form-patlasv4-proto-cat-parceria-descricao',
    'Vertical de serviço de TI': 'form-patlasv4-proto-cat-parceria-vertical',
    Parceiros: 'form-patlasv4-proto-cat-parceria-parceiro',
    'Catálogo da parceria': 'form-patlasv4-proto-cat-parceria-catalogos',
    Soluções: 'form-patlasv4-proto-cat-parceria-solucoes',
    'Soluções (view)': 'form-patlasv4-proto-cat-parceria-solucoes-view',
    Status: 'form-patlasv4-proto-cat-parceria-status',
    'Ativo?': 'form-patlasv4-proto-cat-parceria-ativo',
    Observações: 'form-patlasv4-proto-cat-parceria-observacoes',
    Versão: 'form-patlasv4-proto-cat-parceria-versao',
    'Versão anterior': 'form-patlasv4-proto-cat-parceria-versao-anterior',
    'Início da vigência': 'form-patlasv4-proto-cat-parceria-vigencia-inicio',
    'Fim da vigência': 'form-patlasv4-proto-cat-parceria-vigencia-fim',
    'Data homologação DIREX': 'form-patlasv4-proto-cat-parceria-data-homologacao-direx',
    'Responsável homologação': 'form-patlasv4-proto-cat-parceria-responsavel-homologacao',
    'Status Parceria (planilha)': 'form-patlasv4-proto-cat-parceria-status-planilha',
  },
  Solução: {
    Nome: 'form-patlasv4-proto-cat-solucao-identificador',
    'Código da solução': 'form-patlasv4-proto-cat-solucao-codigo',
    Parceria: 'form-patlasv4-proto-cat-solucao-parceria',
    'Catálogo da solução': 'form-patlasv4-proto-cat-solucao-catalogo',
    Descrição: 'form-patlasv4-proto-cat-solucao-descricao',
    'Documentos de apoio': 'form-patlasv4-proto-cat-solucao-documentos-apoio',
    'Fabricante — nome': 'form-patlasv4-proto-cat-solucao-fabricante-nome',
    'Fabricante — contato': 'form-patlasv4-proto-cat-solucao-fabricante-contato',
    Observações: 'form-patlasv4-proto-cat-solucao-observacoes',
    'Ativo?': 'form-patlasv4-proto-cat-solucao-ativo',
    'Produtos da solução (view)': 'form-patlasv4-proto-cat-solucao-produtos',
  },
  Catálogo: {
    'Nome do catálogo': 'form-patlasv4-proto-cat-catalogo-identificador',
    Parceria: 'form-patlasv4-proto-cat-catalogo-parceria',
    Solução: 'form-patlasv4-proto-cat-catalogo-solucao',
    Descrição: 'form-patlasv4-proto-cat-catalogo-descricao',
    Versão: 'form-patlasv4-proto-cat-catalogo-versao',
    'Versão anterior': 'form-patlasv4-proto-cat-catalogo-versao-anterior',
    'Início de vigência': 'form-patlasv4-proto-cat-catalogo-vigencia-inicio',
    'Fim de vigência': 'form-patlasv4-proto-cat-catalogo-vigencia-fim',
    'Status do catálogo': 'form-patlasv4-proto-cat-catalogo-status',
    'É catálogo universal': 'form-patlasv4-proto-cat-catalogo-toggle-universal',
    'É catálogo de serviços': 'form-patlasv4-proto-cat-catalogo-toggle-servicos',
    'É catálogo de licenciamento': 'form-patlasv4-proto-cat-catalogo-toggle-licenca',
    'Métricas permitidas': 'form-patlasv4-proto-cat-catalogo-metricas',
    'Valor unitário da métrica': 'form-patlasv4-proto-cat-catalogo-valor-unitario',
    'FOCAL Vendas': 'form-patlasv4-proto-cat-catalogo-focal-vendas',
    'FOCAL Pós Vendas': 'form-patlasv4-proto-cat-catalogo-focal-posvendas',
    'Unidade DTIC': 'form-patlasv4-proto-cat-catalogo-unidade-dtic',
    'Código N2 — SIAG': 'form-patlasv4-proto-cat-catalogo-cod-siag-cat',
    'Código N2 — Protheus': 'form-patlasv4-proto-cat-catalogo-cod-protheus-cat',
    'Código N3 — SIAG': 'form-patlasv4-proto-cat-catalogo-cod-siag-univ',
    'Código N3 — Protheus': 'form-patlasv4-proto-cat-catalogo-cod-protheus-univ',
    Observações: 'form-patlasv4-proto-cat-catalogo-observacoes',
    'Ativo?': 'form-patlasv4-proto-cat-catalogo-ativo',
    'Produtos do catálogo (view)': 'form-patlasv4-proto-cat-catalogo-produtos',
    'Última notificação do fluxo': 'form-patlasv4-proto-cat-catalogo-ultima-notificacao',
  },
}

const DELETE_IDS = {
  Parceria: new Set([
    'form-patlasv4-proto-cat-parceria-codigo-parceira',
    'form-patlasv4-proto-cat-parceria-versao',
    'form-patlasv4-proto-cat-parceria-versao-anterior',
    'form-patlasv4-proto-cat-parceria-vigencia-inicio',
    'form-patlasv4-proto-cat-parceria-vigencia-fim',
    'form-patlasv4-proto-cat-parceria-data-homologacao-direx',
    'form-patlasv4-proto-cat-parceria-responsavel-homologacao',
    'form-patlasv4-proto-cat-parceria-status-planilha',
  ]),
  Solução: new Set([
    'form-patlasv4-proto-cat-solucao-codigo',
    'form-patlasv4-proto-cat-solucao-fabricante-nome',
    'form-patlasv4-proto-cat-solucao-fabricante-contato',
  ]),
  Catálogo: new Set([
    'form-patlasv4-proto-cat-catalogo-vigencia-inicio',
    'form-patlasv4-proto-cat-catalogo-vigencia-fim',
    'form-patlasv4-proto-cat-catalogo-ultima-notificacao',
    'form-patlasv4-proto-cat-catalogo-objeto-universal',
  ]),
}

const FIELD_META = {
  'form-patlasv4-proto-cat-parceria-identificador': {
    prefix: '#',
    caps: false,
    regras: [
      'RN-PARC-01: Nome comercial do acordo. MTI cria a parceria (25/08).',
      'Parceiro consulta após habilitação; monta catálogo/produtos no portal.',
    ],
  },
  'form-patlasv4-proto-cat-parceria-descricao': {
    prefix: '#',
    caps: false,
    regras: ['Descrição do acordo comercial. Opcional.'],
  },
  'form-patlasv4-proto-cat-parceria-vertical': {
    prefix: '#',
    caps: false,
    regras: [
      'RN-PARC-02: Obrigatório. Vertical de Serviço de TI na Parceria — não na Organização nem no Produto (Luís 17/08, 25/08).',
      'Planilha T1: Vertical Atuação → classe Parceria.',
    ],
  },
  'form-patlasv4-proto-cat-parceria-parceiro': {
    prefix: '#',
    caps: false,
    regras: ['Organização(ões) vinculada(s). Ao menos uma obrigatória.'],
  },
  'form-patlasv4-proto-cat-parceria-catalogos': {
    prefix: '',
    caps: false,
    regras: [
      'RN-PARC-03: Catálogo rascunho criado automaticamente ao salvar a parceria (Gabriel 17/08).',
      'Somente leitura. Parceiro edita produtos no catálogo gerado.',
    ],
  },
  'form-patlasv4-proto-cat-parceria-solucoes': {
    prefix: '',
    caps: false,
    regras: ['Relacionamento com soluções cadastradas após a parceria. Somente leitura.'],
  },
  'form-patlasv4-proto-cat-parceria-solucoes-view': {
    prefix: '',
    caps: false,
    regras: [
      'Accordion na tela da Parceria: solução + tabela de produtos (17/08).',
      'Parceiro edita produtos no portal durante rascunho.',
    ],
  },
  'form-patlasv4-proto-cat-parceria-status': {
    prefix: '!#',
    caps: false,
    regras: [
      'Workflow: Rascunho → Aguardando Análise MTI → Ajuste/Reprovação/Homologação → Ativo.',
      '≠ Status Parceria da planilha T1 (campo DELETE). Durante análise MTI o parceiro não edita.',
    ],
  },
  'form-patlasv4-proto-cat-parceria-ativo': {
    prefix: '#',
    caps: false,
    regras: ['Disponibilidade para novos vínculos. Não substitui Status de workflow.'],
  },
  'form-patlasv4-proto-cat-parceria-observacoes': {
    prefix: '#',
    caps: true,
    regras: ['Informações complementares internas MTI. Parceiro não visualiza.'],
  },
  'form-patlasv4-proto-cat-parceria-produtos': {
    prefix: '',
    caps: false,
    regras: [
      'Consulta agregada de produtos de todas as soluções/catálogos desta parceria.',
      'Somente leitura no backoffice MTI.',
    ],
  },

  'form-patlasv4-proto-cat-solucao-identificador': {
    prefix: '#',
    caps: false,
    regras: [
      'RN-SOL-01: Nome comercial. Único na parceria (catalogo.m4a 17/08, 71:35).',
      'Estrutura comercial: Parceria → Solução → Catálogo N2 → Produtos.',
    ],
  },
  'form-patlasv4-proto-cat-solucao-parceria': {
    prefix: '',
    caps: false,
    regras: ['Referência à parceria pai. Preenchimento automático. Somente leitura.'],
  },
  'form-patlasv4-proto-cat-solucao-catalogo': {
    prefix: '',
    caps: false,
    regras: ['Catálogo N2 gerado automaticamente ao salvar a solução (17/08).'],
  },
  'form-patlasv4-proto-cat-solucao-descricao': {
    prefix: '#',
    caps: false,
    regras: ['Descrição da solução. Opcional.'],
  },
  'form-patlasv4-proto-cat-solucao-documentos-apoio': {
    prefix: '#',
    caps: false,
    regras: ['Documentos de suporte à solução (17/08: nome + parceria + documentos). Opcional.'],
  },
  'form-patlasv4-proto-cat-solucao-observacoes': {
    prefix: '#',
    caps: true,
    regras: ['Complemento interno MTI. Parceiro não visualiza.'],
  },
  'form-patlasv4-proto-cat-solucao-ativo': {
    prefix: '#',
    caps: false,
    regras: ['Indica se a solução está ativa para novos vínculos.'],
  },
  'form-patlasv4-proto-cat-solucao-produtos': {
    prefix: '',
    caps: false,
    regras: [
      'Produtos do catálogo desta solução. Exibido na Parceria (view consolidada).',
      'Parceiro cadastra/edita produtos no portal (25/08).',
    ],
  },

  'form-patlasv4-proto-cat-catalogo-identificador': {
    prefix: '!#',
    caps: false,
    regras: [
      'RN-CAT-01: Nome comercial da família do catálogo. Obrigatório.',
      'Cadastro antes do produto; produto vincula ao catálogo (05/08, 17/08).',
    ],
  },
  'form-patlasv4-proto-cat-catalogo-parceria': {
    prefix: '',
    caps: false,
    regras: ['Somente parceria habilitada. Herdado ou selecionado antes dos demais vínculos.'],
  },
  'form-patlasv4-proto-cat-catalogo-solucao': {
    prefix: '',
    caps: false,
    regras: ['Filtrada pela Parceria. Produtos herdam Parceria + Solução + Versão.'],
  },
  'form-patlasv4-proto-cat-catalogo-descricao': {
    prefix: '!#',
    caps: false,
    regras: ['Escopo do catálogo. Opcional. Parceiro monta rascunho no portal (25/08).'],
  },
  'form-patlasv4-proto-cat-catalogo-versao': {
    prefix: '#',
    caps: false,
    regras: [
      'RN-CAT-02: Versionamento no Catálogo — não na Parceria (17/08).',
      'Ex.: 9.4 — único na família. Obrigatório para publicar.',
    ],
  },
  'form-patlasv4-proto-cat-catalogo-versao-anterior': {
    prefix: '',
    caps: false,
    regras: ['Preenchida ao criar nova versão; vazia na primeira. Somente leitura.'],
  },
  'form-patlasv4-proto-cat-catalogo-status': {
    prefix: '#',
    caps: false,
    regras: [
      'Workflow catálogo: Rascunho → Em análise → Aprovado → Publicado → Substituído.',
      '≠ Status do Produto. Parceiro envia; MTI homologa/publica (25/08).',
    ],
  },
  'form-patlasv4-proto-cat-catalogo-toggle-universal': {
    prefix: '#',
    caps: false,
    regras: [
      'RN-CAT-03: Tipos Universal / Serviços / Licenciamento (17/08).',
      'Controla elegibilidade N3 e Tipo de oferta herdado pelo Produto.',
    ],
  },
  'form-patlasv4-proto-cat-catalogo-toggle-servicos': {
    prefix: '#',
    caps: false,
    regras: ['Pode ser Sim junto com universal (ex.: UST/HST).'],
  },
  'form-patlasv4-proto-cat-catalogo-toggle-licenca': {
    prefix: '#',
    caps: false,
    regras: ['Típico para métrica USN / catálogo de licenciamento.'],
  },
  'form-patlasv4-proto-cat-catalogo-metricas': {
    prefix: '!#',
    caps: false,
    regras: [
      'RN-CAT-04: Métricas permitidas + valor unitário no Catálogo (17/08).',
      'Produto seleciona métrica dentro desta lista.',
    ],
  },
  'form-patlasv4-proto-cat-catalogo-valor-unitario': {
    prefix: '!#',
    caps: false,
    regras: ['Valor da métrica no catálogo (> 0 para publicar). Não é preço do Produto.'],
  },
  'form-patlasv4-proto-cat-catalogo-focal-vendas': {
    prefix: '#',
    caps: false,
    regras: ['FOCAL Vendas no Catálogo — movido do Produto (17/08). Não repetir em Produto.'],
  },
  'form-patlasv4-proto-cat-catalogo-focal-posvendas': {
    prefix: '#',
    caps: false,
    regras: ['FOCAL Pós-vendas no Catálogo — movido do Produto (17/08).'],
  },
  'form-patlasv4-proto-cat-catalogo-unidade-dtic': {
    prefix: '#',
    caps: false,
    regras: ['Unidade DTIC no Catálogo — movido do Produto (17/08). Obrigatória para publicar.'],
  },
  'form-patlasv4-proto-cat-catalogo-cod-siag-cat': {
    prefix: '#',
    caps: true,
    regras: ['RN-CAT-05: Código N2 SIAG do catálogo (25/08). Manual/planilha F2. Parceiro não vê.'],
  },
  'form-patlasv4-proto-cat-catalogo-cod-protheus-cat': {
    prefix: '?',
    caps: true,
    regras: ['Código N2 Protheus/Infocenter do catálogo. Manual F2; parceiro não vê.'],
  },
  'form-patlasv4-proto-cat-catalogo-cod-siag-univ': {
    prefix: '#',
    caps: true,
    regras: ['Código N3 SIAG — somente se É catálogo universal = Sim (25/08).'],
  },
  'form-patlasv4-proto-cat-catalogo-cod-protheus-univ': {
    prefix: '?',
    caps: true,
    regras: ['Código N3 Protheus — somente catálogo universal.'],
  },
  'form-patlasv4-proto-cat-catalogo-observacoes': {
    prefix: '#',
    caps: true,
    regras: ['Nota complementar MTI. Parceiro não visualiza.'],
  },
  'form-patlasv4-proto-cat-catalogo-ativo': {
    prefix: '#',
    caps: false,
    regras: ['Indica se o catálogo está ativo para novos vínculos.'],
  },
  'form-patlasv4-proto-cat-catalogo-produtos': {
    prefix: '',
    caps: false,
    regras: [
      'Lista de produtos vinculados. Cadastro manual, portal parceiro ou CSV (25/08).',
      'Produto sempre vinculado a um Catálogo (05/08).',
    ],
  },
}

const DELETE_META = {
  'form-patlasv4-proto-cat-parceria-codigo-parceira': {
    regras: ['Campo da implementação — não validado nas fontes 05–25/08.'],
  },
  'form-patlasv4-proto-cat-parceria-versao': {
    regras: ['Versionamento pertence ao Catálogo, não à Parceria (17/08).'],
  },
  'form-patlasv4-proto-cat-parceria-versao-anterior': {
    regras: ['Versionamento pertence ao Catálogo (17/08).'],
  },
  'form-patlasv4-proto-cat-parceria-vigencia-inicio': {
    regras: ['Vigência de parceria não validada na Fase 2. Escopo pendente.'],
  },
  'form-patlasv4-proto-cat-parceria-vigencia-fim': {
    regras: ['Vigência de parceria não validada na Fase 2.'],
  },
  'form-patlasv4-proto-cat-parceria-data-homologacao-direx': {
    regras: ['Campo legado DIREX — fora do protótipo mínimo Atlas F2.'],
  },
  'form-patlasv4-proto-cat-parceria-responsavel-homologacao': {
    regras: ['Campo legado DIREX — fora do protótipo mínimo.'],
  },
  'form-patlasv4-proto-cat-parceria-status-planilha': {
    regras: ['Status planilha T1 — conflita com Status de workflow do portal (DELETE).'],
  },
  'form-patlasv4-proto-cat-solucao-codigo': {
    regras: ['Código interno — não mencionado nas validações 05–25/08.'],
  },
  'form-patlasv4-proto-cat-solucao-fabricante-nome': {
    regras: ['Fabricante — sign-off pendente; não citado nas fontes.'],
  },
  'form-patlasv4-proto-cat-solucao-fabricante-contato': {
    regras: ['Fabricante — sign-off pendente; não citado nas fontes.'],
  },
  'form-patlasv4-proto-cat-catalogo-vigencia-inicio': {
    regras: [
      'Vigência existe no domínio mas não é exibida na tela do catálogo F2 (17/08).',
      'Substituída por eventos/apostilamento (Luís 25/08).',
    ],
  },
  'form-patlasv4-proto-cat-catalogo-vigencia-fim': {
    regras: ['Fim de vigência — não exibido na UI F2; preenchido ao substituir versão.'],
  },
  'form-patlasv4-proto-cat-catalogo-ultima-notificacao': {
    regras: ['Espelho do workflow — não atributo de domínio do Catálogo.'],
  },
  'form-patlasv4-proto-cat-catalogo-objeto-universal': {
    regras: [
      'Campo legado do protótipo. Tipo de oferta = flags do catálogo + herança no Produto (17/08).',
    ],
  },
}

const ACTIVE_ORDER = {
  Parceria: [
    'form-patlasv4-proto-cat-parceria-identificador',
    'form-patlasv4-proto-cat-parceria-descricao',
    'form-patlasv4-proto-cat-parceria-vertical',
    'form-patlasv4-proto-cat-parceria-parceiro',
    'form-patlasv4-proto-cat-parceria-catalogos',
    'form-patlasv4-proto-cat-parceria-status',
    'form-patlasv4-proto-cat-parceria-ativo',
    'form-patlasv4-proto-cat-parceria-observacoes',
    'form-patlasv4-proto-cat-parceria-solucoes',
    'form-patlasv4-proto-cat-parceria-solucoes-view',
    'form-patlasv4-proto-cat-parceria-produtos',
  ],
  Solução: [
    'form-patlasv4-proto-cat-solucao-identificador',
    'form-patlasv4-proto-cat-solucao-parceria',
    'form-patlasv4-proto-cat-solucao-catalogo',
    'form-patlasv4-proto-cat-solucao-descricao',
    'form-patlasv4-proto-cat-solucao-documentos-apoio',
    'form-patlasv4-proto-cat-solucao-ativo',
    'form-patlasv4-proto-cat-solucao-observacoes',
    'form-patlasv4-proto-cat-solucao-produtos',
  ],
  Catálogo: [
    'form-patlasv4-proto-cat-catalogo-parceria',
    'form-patlasv4-proto-cat-catalogo-solucao',
    'form-patlasv4-proto-cat-catalogo-identificador',
    'form-patlasv4-proto-cat-catalogo-descricao',
    'form-patlasv4-proto-cat-catalogo-versao',
    'form-patlasv4-proto-cat-catalogo-versao-anterior',
    'form-patlasv4-proto-cat-catalogo-status',
    'form-patlasv4-proto-cat-catalogo-toggle-universal',
    'form-patlasv4-proto-cat-catalogo-toggle-servicos',
    'form-patlasv4-proto-cat-catalogo-toggle-licenca',
    'form-patlasv4-proto-cat-catalogo-metricas',
    'form-patlasv4-proto-cat-catalogo-valor-unitario',
    'form-patlasv4-proto-cat-catalogo-focal-vendas',
    'form-patlasv4-proto-cat-catalogo-focal-posvendas',
    'form-patlasv4-proto-cat-catalogo-unidade-dtic',
    'form-patlasv4-proto-cat-catalogo-cod-siag-cat',
    'form-patlasv4-proto-cat-catalogo-cod-protheus-cat',
    'form-patlasv4-proto-cat-catalogo-cod-siag-univ',
    'form-patlasv4-proto-cat-catalogo-cod-protheus-univ',
    'form-patlasv4-proto-cat-catalogo-observacoes',
    'form-patlasv4-proto-cat-catalogo-ativo',
    'form-patlasv4-proto-cat-catalogo-produtos',
  ],
}

const SEC = {
  Parceria: {
    main: 'sec-cat-parc-visao',
    sol: 'sec-mth7ac3w-vkt0bi1',
    prod: 'sec-mth7bkik-h2izhhi',
    delete: 'sec-cat-parc-delete',
  },
  Solução: {
    main: 'sec-cat-sol-produtos',
    view: 'sec-solucao-solucao-visualizacao-consolidada',
    delete: 'sec-cat-sol-delete',
  },
  Catálogo: {
    main: 'sec-cat-fluxo',
    prod: 'sec-mth7hj70-6wrhmd5',
    delete: 'sec-cat-catalogo-delete',
  },
}

const READONLY = new Set([
  'form-patlasv4-proto-cat-parceria-catalogos',
  'form-patlasv4-proto-cat-parceria-solucoes',
  'form-patlasv4-proto-cat-parceria-solucoes-view',
  'form-patlasv4-proto-cat-parceria-produtos',
  'form-patlasv4-proto-cat-parceria-status',
  'form-patlasv4-proto-cat-solucao-parceria',
  'form-patlasv4-proto-cat-solucao-catalogo',
  'form-patlasv4-proto-cat-solucao-produtos',
  'form-patlasv4-proto-cat-catalogo-parceria',
  'form-patlasv4-proto-cat-catalogo-solucao',
  'form-patlasv4-proto-cat-catalogo-versao-anterior',
  'form-patlasv4-proto-cat-catalogo-status',
  'form-patlasv4-proto-cat-catalogo-metricas',
  'form-patlasv4-proto-cat-catalogo-produtos',
  'form-patlasv4-proto-cat-catalogo-cod-protheus-cat',
  'form-patlasv4-proto-cat-catalogo-cod-siag-univ',
  'form-patlasv4-proto-cat-catalogo-cod-protheus-univ',
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
  if (t.includes('view') || t.includes('embutida')) return 'embeddedReference'
  if (t.includes('boolean')) return 'boolean'
  if (t.includes('data')) return 'date'
  if (t.includes('html')) return 'html'
  if (t.includes('arquivo')) return 'file'
  if (t.includes('moeda')) return 'number'
  if (t.includes('enum') || t.includes('textoptions')) return 'textOptions'
  if (t.includes('referência') || t.includes('referencia')) return 'reference'
  if (t.includes('número') || t.includes('numero')) return 'number'
  return 'text'
}

function baseLabel(row, id, classe) {
  if (row.nome === 'Identificador' && classe === 'Parceria') return 'Nome'
  if (row.nome === 'Ativo?') return 'Ativo'
  if (row.nome === 'Parceiros') return 'Parceiro'
  if (row.nome === 'FOCAL Pós Vendas') return 'FOCAL Pós-vendas'
  if (row.nome === 'Produtos do catálogo (view)') return 'Produtos do catálogo'
  if (row.nome === 'Produtos da solução (view)') return 'Produtos da solução'
  if (row.nome === 'Soluções (view)') return 'Soluções (view)'
  return row.nome
}

function formatLabel(id, name, isDelete) {
  const meta = isDelete ? DELETE_META[id] : FIELD_META[id]
  const prefix = isDelete ? '' : meta?.prefix ?? ''
  let text = name
  if (!isDelete && meta?.caps) text = text.toUpperCase()
  if (isDelete) return `DELETE ${text}`
  return `${prefix}${text}`
}

function buildSpec(classe, row, id, isDelete) {
  const meta = isDelete ? DELETE_META[id] : FIELD_META[id]
  const parts = [
    `**Classe:** ${classe} (Atlas Fase 2)` + (isDelete ? ' — **FORA DE ESCOPO (DELETE)**' : ''),
    '',
    LEGEND,
    '',
  ]
  if (meta?.regras?.length) {
    parts.push('**Regras de negócio:**')
    for (const r of meta.regras) parts.push(`- ${r}`)
    parts.push('')
  }
  if (row?.regra) parts.push(`**Regra (inventário):** ${row.regra}`)
  if (row?.preenche) parts.push(`**Quem preenche (inventário):** ${row.preenche}`)
  if (row?.visualiza) parts.push(`**Quem visualiza (inventário):** ${row.visualiza}`)
  if (row?.protheus && row.protheus !== 'Não') parts.push(`**Protheus:** ${row.protheus}`)
  if (row?.status) parts.push(`**Validação:** ${row.status}`)
  if (isDelete) {
    parts.push('')
    parts.push(
      '**Ação protótipo:** Campo mantido no JSON para rastreabilidade; oculto; não exibir na Fase 2.',
    )
  }
  parts.push('')
  parts.push('**Fontes:** validações Atlas 05/08 · 17/08 · 21/08 (Protheus) · 25/08.')
  return parts.filter(Boolean).join('\n')
}

function sectionFor(id, classe) {
  const s = SEC[classe]
  if (DELETE_IDS[classe].has(id)) return s.delete
  if (classe === 'Parceria') {
    if (id.includes('-solucoes') || id.includes('-solucoes-view')) return s.sol
    if (id.includes('-produtos')) return s.prod
    return s.main
  }
  if (classe === 'Solução') {
    if (id.includes('-produtos')) return s.view
    return s.main
  }
  if (classe === 'Catálogo') {
    if (id.includes('-produtos')) return s.prod
    return s.main
  }
  return s.main
}

function inferLinked(row, id, type) {
  if (type !== 'reference' && type !== 'embeddedReference') return undefined
  const n = (row?.nome || '').toLowerCase()
  if (id.includes('vertical')) return 'form-patlasv4-proto-cat-categoria'
  if (id.endsWith('-parceiro')) return 'form-patlasv4-proto-unidade-organizacional'
  if (id.endsWith('-focal-vendas') || id.endsWith('-focal-posvendas')) return 'form-patlasv4-proto-pessoa'
  if (id.endsWith('-unidade-dtic')) return 'form-patlasv4-proto-unidade-organizacional'
  if (id.endsWith('-catalogos') || id === 'form-patlasv4-proto-cat-solucao-catalogo') {
    return 'form-patlasv4-proto-cat-catalogo'
  }
  if (id.endsWith('-parceria') || id.endsWith('-solucao-parceria')) return 'form-patlasv4-proto-cat-parceria'
  if (id.includes('-solucao') && !id.includes('-produtos')) return 'form-patlasv4-proto-cat-solucao'
  if (n.includes('produto')) return 'form-patlasv4-proto-cat-produto'
  if (n.includes('catálogo') || n.includes('catalogo')) return 'form-patlasv4-proto-cat-catalogo'
  return undefined
}

function buildFieldFromRow(classe, row) {
  const id = FIELD_MAP[classe][row.nome]
  if (!id) return null
  const isDelete = DELETE_IDS[classe].has(id)
  const type = mapTipo(row)
  const name = baseLabel(row, id, classe)
  const opts = parseOptions(row.opcoes)

  const field = {
    id,
    label: formatLabel(id, name, isDelete),
    type,
    size:
      type === 'text' && (row.nome.includes('Descrição') || row.nome.includes('Observações'))
        ? 'large'
        : row.nome === 'Ativo?' || type === 'boolean'
          ? 'small'
          : 'medium',
    readOnly: isDelete || READONLY.has(id),
    required: !isDelete && /obrigatório/i.test(row.regra || ''),
    multiple: row.tipo.includes('(N)'),
    relevance:
      row.nome === 'Identificador' ||
      row.nome === 'Nome' ||
      row.nome === 'Nome do catálogo'
        ? 'identity'
        : 'common',
    sectionId: sectionFor(id, classe),
    spec: buildSpec(classe, row, id, isDelete),
    hidden: isDelete ? true : undefined,
  }

  if (row.nome === 'Descrição' && classe === 'Parceria') field.type = 'html'
  if (row.nome === 'Descrição' || row.nome.includes('Observações')) field.textLong = true
  if (type === 'number' && row.tipo.includes('Moeda')) field.currency = true
  if (opts?.length && type !== 'boolean') field.options = opts

  if (type === 'embeddedReference' || row.nome.includes('(view)')) {
    field.type = 'embeddedReference'
    field.readOnly = true
    field.multiple = true
    field.embeddedDisplay = 'table'
    field.hidden = isDelete ? true : false
    if (row.nome.includes('Produto')) field.linkedFormId = 'form-patlasv4-proto-cat-produto'
    if (row.nome.includes('Solução') && row.nome.includes('view')) {
      field.linkedFormId = 'form-patlasv4-proto-cat-solucao'
    }
  }

  if (id === 'form-patlasv4-proto-cat-parceria-parceiro') {
    field.multiple = false
    field.required = true
  }
  if (id === 'form-patlasv4-proto-cat-parceria-vertical') field.required = true
  if (id === 'form-patlasv4-proto-cat-parceria-identificador') field.required = true
  if (id === 'form-patlasv4-proto-cat-solucao-identificador') {
    field.required = true
    field.readOnly = false
  }
  // N2 SIAG: opcional no cadastro F2; MTI edita; obrigatório só no contrato
  if (id === 'form-patlasv4-proto-cat-catalogo-cod-siag-cat') {
    field.required = false
    field.readOnly = false
  }
  if (id === 'form-patlasv4-proto-cat-parceria-catalogos') {
    field.linkedFormId = 'form-patlasv4-proto-cat-catalogo'
  }
  if (id === 'form-patlasv4-proto-cat-solucao-catalogo') {
    field.linkedFormId = 'form-patlasv4-proto-cat-catalogo'
  }
  if (id === 'form-patlasv4-proto-cat-parceria-solucoes-view') {
    field.linkedFormId = 'form-patlasv4-proto-cat-solucao'
  }
  if (id === 'form-patlasv4-proto-cat-parceria-solucoes') {
    field.linkedFormId = 'form-patlasv4-proto-cat-solucao'
  }

  const linked = inferLinked(row, id, field.type)
  if (linked && !field.linkedFormId) field.linkedFormId = linked

  return field
}

function buildStubDelete(classe, id, label, row) {
  return {
    id,
    label: formatLabel(id, label, true),
    type: 'text',
    size: 'medium',
    readOnly: true,
    required: false,
    multiple: false,
    relevance: 'common',
    sectionId: SEC[classe].delete,
    spec: buildSpec(classe, row || { regra: '', status: 'Removido' }, id, true),
    hidden: true,
  }
}

function orderFields(classe, byId, extraActiveIds = []) {
  const active = []
  const used = new Set()
  for (const id of [...ACTIVE_ORDER[classe], ...extraActiveIds]) {
    if (used.has(id)) continue
    if (byId.has(id) && !DELETE_IDS[classe].has(id)) {
      active.push(byId.get(id))
      used.add(id)
    }
  }
  const deletes = []
  for (const id of DELETE_IDS[classe]) {
    if (byId.has(id)) deletes.push(byId.get(id))
  }
  return { active, deletes }
}

function buildParceria(seedRows, old) {
  const byId = new Map()
  for (const row of seedRows) {
    const f = buildFieldFromRow('Parceria', row)
    if (f) byId.set(f.id, f)
  }

  const prev = old.fields.find((x) => x.id === 'form-patlasv4-proto-cat-parceria-produtos')
  if (prev) {
    byId.set(prev.id, {
      ...prev,
      label: formatLabel(prev.id, 'Produtos da parceria (todas as soluções)', false),
      sectionId: SEC.Parceria.prod,
      spec: buildSpec('Parceria', null, prev.id, false),
      readOnly: true,
    })
    FIELD_META[prev.id] = FIELD_META['form-patlasv4-proto-cat-parceria-produtos']
  }

  const { active, deletes } = orderFields('Parceria', byId, ['form-patlasv4-proto-cat-parceria-produtos'])
  const alerts = old.fields.filter((f) => f.type === 'alert')

  return {
    ...old,
    sectionLayout: 'tabs',
    metadata:
      'Fontes 05–25/08/2026. Labels: ! parceiro · # MTI · !# ambos · ? Protheus · MAIÚSCULAS = parceiro não vê. ' +
      'Campos DELETE ao final, ocultos. Fiscal/contábil Protheus fora Atlas F2.',
    sections: [
      { id: SEC.Parceria.main, title: 'Dados principais', icon: 'handshake' },
      { id: SEC.Parceria.sol, title: 'Soluções da parceria', icon: 'layers' },
      { id: SEC.Parceria.prod, title: 'Produtos da parceria', icon: 'inventory_2' },
      { id: SEC.Parceria.delete, title: 'DELETE — fora da classe Parceria', icon: 'delete_outline' },
    ],
    fields: [...active, ...alerts, ...deletes],
  }
}

function buildSolucao(seedRows, old) {
  const byId = new Map()
  for (const row of seedRows) {
    const f = buildFieldFromRow('Solução', row)
    if (f) byId.set(f.id, f)
  }

  for (const f of byId.values()) {
    if (!DELETE_IDS.Solução.has(f.id) && f.id !== 'form-patlasv4-proto-cat-solucao-produtos') {
      f.readOnly = f.readOnly || ['documentos-apoio', 'observacoes'].some((s) => f.id.includes(s))
        ? f.readOnly
        : ['identificador', 'descricao', 'ativo', 'documentos'].some((s) => f.id.includes(s))
          ? false
          : f.readOnly
    }
  }

  const prevProd = old.fields.find((x) => x.id === 'form-patlasv4-proto-cat-solucao-produtos')
  if (prevProd) {
    byId.set(prevProd.id, {
      ...prevProd,
      label: formatLabel(prevProd.id, 'Produtos da solução', false),
      sectionId: SEC.Solução.view,
      spec: buildSpec('Solução', seedRows.find((r) => r.nome.includes('Produtos')), prevProd.id, false),
    })
  }

  const alert = old.fields.find((x) => x.id === 'form-patlasv4-proto-cat-solucao-alerta-produtos')
  const { active, deletes } = orderFields('Solução', byId)
  const extras = alert ? [alert] : []

  return {
    ...old,
    metadata:
      'Fontes 05–25/08/2026 (17/08: nome + parceria + documentos). Convenção de labels igual Produto. DELETE oculto.',
    sections: [
      { id: SEC.Solução.main, title: 'Dados', icon: 'inventory_2' },
      { id: SEC.Solução.view, title: 'Produtos da solução', icon: 'view_list' },
      { id: SEC.Solução.delete, title: 'DELETE — fora da classe Solução', icon: 'delete_outline' },
    ],
    fields: [...active, ...extras, ...deletes],
  }
}

function buildCatalogo(seedRows, old) {
  const byId = new Map()
  for (const row of seedRows) {
    const f = buildFieldFromRow('Catálogo', row)
    if (f) byId.set(f.id, f)
  }

  for (const [id, label] of [
    ['form-patlasv4-proto-cat-catalogo-objeto-universal', 'Objeto universal (legado)'],
    ['form-patlasv4-proto-cat-catalogo-ultima-notificacao', 'Última notificação do fluxo'],
  ]) {
    if (!byId.has(id)) {
      byId.set(id, buildStubDelete('Catálogo', id, label, { regra: 'Legado protótipo', status: 'Removido' }))
    }
  }

  const prevProd = old.fields.find((x) => x.id === 'form-patlasv4-proto-cat-catalogo-produtos')
  if (prevProd) {
    byId.set(prevProd.id, {
      ...prevProd,
      label: formatLabel(prevProd.id, 'Produtos do catálogo', false),
      sectionId: SEC.Catálogo.prod,
      spec: buildSpec('Catálogo', seedRows.find((r) => r.nome.includes('Produtos')), prevProd.id, false),
    })
  }

  const alert = old.fields.find((x) => x.id === 'form-patlasv4-proto-cat-catalogo-alerta-atos')
  const { active, deletes } = orderFields('Catálogo', byId)

  const fieldVisibilityRules = (old.fieldVisibilityRules || []).map((rule) => {
    if (rule.id === 'rule-cat-univ-codes') {
      return {
        ...rule,
        targetFieldIds: rule.targetFieldIds.filter(
          (tid) => tid !== 'form-patlasv4-proto-cat-catalogo-objeto-universal',
        ),
      }
    }
    return rule
  })

  return {
    ...old,
    metadata:
      'Fontes 05–25/08/2026. Complexidade no Produto (17/08). FOCAL/DTIC/N2/N3 no Catálogo. Vigência não exibida F2. DELETE oculto.',
    sections: [
      { id: SEC.Catálogo.main, title: 'Identificação e propriedades', icon: 'menu_book' },
      { id: SEC.Catálogo.prod, title: 'Produtos do catálogo', icon: 'view_list' },
      { id: SEC.Catálogo.delete, title: 'DELETE — fora da classe Catálogo', icon: 'delete_outline' },
    ],
    fields: [...active, ...(alert ? [alert] : []), ...deletes],
    fieldVisibilityRules,
  }
}

function main() {
  const seed = loadSeed()
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  for (const [classe, formId] of Object.entries(FORMS)) {
    const idx = forms.findIndex((f) => f.id === formId)
    if (idx < 0) throw new Error(`Form não encontrado: ${formId}`)
    const rows = seed.filter((r) => r.classe === classe)
    const old = forms[idx]
    if (classe === 'Parceria') forms[idx] = buildParceria(rows, old)
    else if (classe === 'Solução') forms[idx] = buildSolucao(rows, old)
    else forms[idx] = buildCatalogo(rows, old)

    const form = forms[idx]
    const del = form.fields.filter((f) => f.label.startsWith('DELETE '))
    const active = form.fields.filter((f) => !f.label.startsWith('DELETE '))
    console.log(
      `${classe}: ${active.length} ativos + ${del.length} DELETE (${del.filter((f) => f.hidden).length} ocultos)`,
    )
  }

  fs.writeFileSync(FORMS_PATH, JSON.stringify(forms, null, 2) + '\n', 'utf8')
  console.log('\n✓ forms.json — Parceria, Solução e Catálogo atualizados')
}

main()
