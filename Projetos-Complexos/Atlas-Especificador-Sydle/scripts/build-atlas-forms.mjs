import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  catalogClassGroups,
  catalogForms,
  FORM_CADASTRO_PRODUTOS,
  FORM_CATALOGO_CONFIG,
  FORM_CATALOGO_VIGENTES,
  FORM_PRODUTO_CADASTRO,
} from './atlas-catalog-forms.mjs'
import { licencaClassGroups, licencaForms } from './atlas-licenca-forms.mjs'
import { servicoClassGroups, servicoForms } from './atlas-servico-forms.mjs'
import { contratoClassGroups, contratoForms } from './atlas-contrato-forms.mjs'
import { acessoClassGroups, acessoForms } from './atlas-acesso-forms.mjs'
import { clienteVisoesClassGroups, clienteVisoesForms } from './atlas-cliente-visoes-forms.mjs'
import { pvClassGroups, pvForms, FORM_PEDIDO, pedidoRow } from './atlas-pv-forms.mjs'
import { nfUsuariosClassGroups, nfUsuariosForms } from './atlas-nf-usuarios-forms.mjs'
import { propostaClassGroups, propostaForms } from './atlas-proposta-forms.mjs'
import { portalCotacaoClassGroups, portalCotacaoForms } from './atlas-portal-cotacao-forms.mjs'
import { fase1Forms, fase1ClassGroups } from './atlas-fase1-forms.mjs'
import { applyFase1DisplayPrefixes } from './atlas-fase1-scope.mjs'
import { atlasPortals } from './atlas-portals.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/atlas/epics/atlas-epico')
const outPath = path.join(epicDir, 'forms.json')

const FORM_ROOT = 'form-atlas-contrato'
const FORM_CONTRATO_RESUMO = 'form-atlas-contrato-resumo'
const FORM_CONTRATO_GRUPO = 'form-atlas-contrato-grupo'

const EMB_LISTA = 'emb_contratos_lista'
const EMB_GRUPOS = 'emb_contratos_grupos'
const EMB_PEDIDOS = 'emb_pedidos_venda'

/** Linha completa do contrato (grupo / pedidos); resumo = mesmos campos sem embutido. */
function contractBundle({ contrato, classe, descricao, observacoes = '' }, pedidos) {
  const scalars = {
    'atlas-ct-contrato': contrato,
    'atlas-ct-classe': classe,
    'atlas-ct-descricao': descricao,
    'atlas-ct-observacoes': observacoes,
  }
  return {
    resumo: { ...scalars },
    grupo: {
      ...scalars,
      [EMB_PEDIDOS]: pedidos,
    },
  }
}

function mirrorContracts(bundles) {
  return {
    [EMB_LISTA]: bundles.map((b) => b.resumo),
    [EMB_GRUPOS]: bundles.map((b) => b.grupo),
  }
}

const forms = [
  ...catalogForms,
  ...licencaForms,
  ...servicoForms,
  ...contratoForms,
  ...acessoForms,
  ...clienteVisoesForms,
  ...pvForms,
  ...nfUsuariosForms,
  ...propostaForms,
  ...portalCotacaoForms,
  ...fase1Forms,
  {
    id: FORM_CONTRATO_RESUMO,
    name: 'Contrato — resumo (lista)',
    sectionLayout: 'none',
    fields: [
      {
        id: 'atlas-ct-contrato',
        label: 'Contrato',
        type: 'text',
        size: 'medium',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'identity',
        spec: 'Número do contrato (ex.: 212/2024).',
      },
      {
        id: 'atlas-ct-classe',
        label: 'Classe de cobrança',
        type: 'text',
        size: 'medium',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'highlight',
        spec: 'Classe de cobrança do contrato.',
      },
      {
        id: 'atlas-ct-descricao',
        label: 'Descrição',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        spec: 'Objeto / parceria (ex.: PARCERIA).',
      },
      {
        id: 'atlas-ct-observacoes',
        label: 'Observações',
        type: 'text',
        size: 'medium',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'advanced',
        spec: 'Notas do contrato.',
      },
    ],
  },
  {
    id: FORM_CONTRATO_GRUPO,
    name: 'Contrato — com pedidos',
    sectionLayout: 'none',
    fields: [
      {
        id: 'atlas-ct-contrato',
        label: 'Contrato',
        type: 'text',
        size: 'medium',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'identity',
        spec: 'Título do grupo na aba Pedidos de venda (acordeão por contrato).',
      },
      {
        id: 'atlas-ct-classe',
        label: 'Classe de cobrança',
        type: 'text',
        size: 'medium',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        spec: 'Classe de cobrança.',
      },
      {
        id: 'atlas-ct-descricao',
        label: 'Descrição',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        spec: 'Descrição do contrato.',
      },
      {
        id: 'atlas-ct-observacoes',
        label: 'Observações',
        type: 'text',
        size: 'medium',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'advanced',
        spec: 'Observações.',
      },
      {
        id: EMB_PEDIDOS,
        label: 'Pedidos de venda deste contrato',
        type: 'embeddedReference',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: true,
        relevance: 'highlight',
        embeddedDisplay: 'table',
        linkedFormId: FORM_PEDIDO,
        spec: 'Parcelas (pedidos Protheus) do contrato. Produtos MTI em sub-tabela de cada pedido.',
      },
    ],
  },
  {
    id: FORM_ROOT,
    name: 'Cobrança — cliente e contratos',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: [
      {
        id: 'atlas-meth-gerar-relatorio',
        name: 'Gerar relatório',
        icon: 'picture_as_pdf',
        kind: 'destaque',
      },
    ],
    sections: [
      { id: 'sec-atlas-ident', title: 'Identificação', icon: 'business' },
      { id: 'sec-atlas-contrato', title: 'Contratos', icon: 'description' },
      { id: 'sec-atlas-pedidos', title: 'Pedidos de venda', icon: 'receipt_long' },
    ],
    fields: [
      {
        id: 'atlas-cliente',
        label: 'Cliente',
        type: 'text',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'identity',
        sectionId: 'sec-atlas-ident',
        spec: 'Cliente (ex.: TRIBUNAL DE JUSTIÇA - MT). Um cliente pode ter vários contratos.',
      },
      {
        id: 'atlas-poder',
        label: 'Poder',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-atlas-ident',
        options: ['Executivo', 'Legislativo', 'Judiciário', 'Ministério Público', 'Tribunal de Contas'],
        spec: 'Poder da República.',
      },
      {
        id: 'atlas-estado',
        label: 'Estado',
        type: 'text',
        size: 'small',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-atlas-ident',
        spec: 'UF.',
      },
      {
        id: EMB_LISTA,
        label: 'Contratos do cliente',
        type: 'embeddedReference',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: true,
        relevance: 'highlight',
        sectionId: 'sec-atlas-contrato',
        embeddedDisplay: 'table',
        linkedFormId: FORM_CONTRATO_RESUMO,
        spec:
          'Lista todos os contratos do cliente (várias linhas). Use «Adicionar linha» para incluir outro contrato. Colunas: número, classe, descrição e observações.',
      },
      {
        id: EMB_GRUPOS,
        label: 'Pedidos agrupados por contrato',
        type: 'embeddedReference',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: true,
        relevance: 'highlight',
        sectionId: 'sec-atlas-pedidos',
        embeddedDisplay: 'form',
        linkedFormId: FORM_CONTRATO_GRUPO,
        spec:
          'Mesmos contratos da aba Contratos, exibidos em acordeão: cada bloco é um contrato (rótulo = número do contrato) com a tabela de pedidos de venda e produtos MTI. Expanda o contrato para ver e editar as parcelas.',
      },
    ],
    exampleValuePresets: [
      {
        id: 'atlas-preset-tjmt',
        name: 'TJMT — 2 contratos, várias parcelas',
        iconColor: '#0ea5e9',
        fieldValues: {
          'atlas-cliente': 'TRIBUNAL DE JUSTIÇA - MT',
          'atlas-poder': 'Judiciário',
          'atlas-estado': 'MT',
        },
        embeddedRowsByFieldId: mirrorContracts([
          contractBundle(
            { contrato: '212/2024', classe: 'Contrato', descricao: 'PARCERIA' },
            [
              pedidoRow({
                cliente: 'TRIBUNAL DE JUSTIÇA - MT',
                poder: 'Judiciário',
                estado: 'MT',
                pedido: '17293',
                classe: 'Contrato',
                competenciaConsumo: '12/2024',
                competenciaCobranca: '03/2025',
                contrato: '212/2024',
                status: 'VIGENTE',
                valor: 21428.57,
                data: '2025-05-21',
                mti: [
                  { produto: 'MTI Workspace', valor: 12000 },
                  { produto: 'MTI Cloud', valor: 9428.57 },
                ],
              }),
              pedidoRow({
                cliente: 'TRIBUNAL DE JUSTIÇA - MT',
                poder: 'Judiciário',
                estado: 'MT',
                pedido: '17604',
                classe: 'Contrato',
                competenciaConsumo: '01/2025',
                competenciaCobranca: '04/2025',
                contrato: '212/2024',
                status: 'VIGENTE',
                valor: 99243.17,
                data: '2025-05-20',
                mti: [
                  { produto: 'MTI DataSecurity', valor: 45000 },
                  { produto: 'MTI QI', valor: 32243.17 },
                  { produto: 'MTI Now', valor: 22000 },
                ],
              }),
            ],
          ),
          contractBundle(
            {
              contrato: '118/2023',
              classe: 'Contrato',
              descricao: 'Extensão PARCERIA — módulos adicionais',
              observacoes: 'Vigência até 12/2025',
            },
            [
              pedidoRow({
                cliente: 'TRIBUNAL DE JUSTIÇA - MT',
                poder: 'Judiciário',
                estado: 'MT',
                pedido: '16801',
                classe: 'Contrato',
                competenciaConsumo: '01/2025',
                competenciaCobranca: '04/2025',
                contrato: '118/2023',
                status: 'VIGENTE',
                valor: 15500,
                data: '2025-04-30',
                mti: [{ produto: 'MTI Valida', valor: 15500 }],
              }),
            ],
          ),
        ]),
      },
      {
        id: 'atlas-preset-tjce',
        name: 'TJCE — 2 contratos SaaS',
        iconColor: '#059669',
        fieldValues: {
          'atlas-cliente': 'Tribunal de Justiça do Ceará',
          'atlas-poder': 'Judiciário',
          'atlas-estado': 'CE',
        },
        embeddedRowsByFieldId: mirrorContracts([
          contractBundle(
            { contrato: '45/2024', classe: 'Mensalidade SaaS', descricao: 'Licenciamento mensal MTI.' },
            [
              pedidoRow({
                cliente: 'Tribunal de Justiça do Ceará',
                poder: 'Judiciário',
                estado: 'CE',
                pedido: 'PV-2025-004821',
                classe: 'Mensal',
                competenciaConsumo: '01/2025',
                competenciaCobranca: '04/2025',
                contrato: '45/2024',
                status: 'Faturado',
                valor: 48750,
                data: '2025-04-15',
                automatico: true,
                mti: [
                  { produto: 'MTI Workspace', valor: 12000 },
                  { produto: 'MTI DataSecurity', valor: 18500 },
                  { produto: 'MTI Now', valor: 8200 },
                  { produto: 'MTI Cloud', valor: 10050 },
                ],
              }),
            ],
          ),
          contractBundle(
            { contrato: '12/2022', classe: 'Projeto', descricao: 'Implantação DevSec.Gov' },
            [
              pedidoRow({
                cliente: 'Tribunal de Justiça do Ceará',
                poder: 'Judiciário',
                estado: 'CE',
                pedido: 'PV-2024-11002',
                classe: 'Sob Demanda',
                competenciaConsumo: '12/2024',
                competenciaCobranca: '03/2025',
                contrato: '12/2022',
                status: 'Emitido',
                valor: 72000,
                data: '2025-03-10',
                mti: [{ produto: 'MTI DevSec.Gov', valor: 72000 }],
              }),
            ],
          ),
        ]),
      },
      {
        id: 'atlas-preset-go',
        name: 'GO — 1 contrato rascunho',
        iconColor: '#6366f1',
        fieldValues: {
          'atlas-cliente': 'Secretaria de Planejamento — GO',
          'atlas-poder': 'Executivo',
          'atlas-estado': 'GO',
        },
        embeddedRowsByFieldId: mirrorContracts([
          contractBundle(
            { contrato: '88/2025', classe: 'Avulso', descricao: 'Treinamento MTI Simplifica.' },
            [
              pedidoRow({
                cliente: 'Secretaria de Planejamento — GO',
                poder: 'Executivo',
                estado: 'GO',
                pedido: '',
                classe: 'Sob Demanda',
                competenciaConsumo: '02/2025',
                competenciaCobranca: '05/2025',
                contrato: '88/2025',
                status: 'Rascunho',
                valor: 8200,
                data: '',
                mti: [{ produto: 'MTI Simplifica', valor: 8200 }],
              }),
            ],
          ),
        ]),
      },
    ],
    activeExamplePresetId: 'atlas-preset-tjmt',
    metadata:
      'Cliente com N contratos (aba Contratos = tabela). Aba Pedidos = acordeão por contrato com parcelas e MTI. Relatório PDF lista todos os contratos.',
  },
]

const workspaces = [
  {
    id: 'ws-atlas-catalogo-vigentes',
    name: 'Catálogo — produtos vigentes',
    explorerChromeColor: '#0c1ba8',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'CAT',
    packages: [
      {
        id: 'pkg-atlas-maestros',
        name: 'Parâmetros de domínio',
        classes: catalogClassGroups.workspaceClasses.filter((c) => c.id === 'cls-atlas-maestros'),
      },
      {
        id: 'pkg-atlas-cadastro',
        name: 'Cadastro',
        classes: catalogClassGroups.workspaceClasses.filter((c) =>
          ['cls-atlas-cadastro', 'cls-atlas-produto-linha', 'cls-atlas-config'].includes(c.id),
        ),
      },
      {
        id: 'pkg-atlas-cat-vigentes',
        name: 'Consulta vigentes',
        classes: catalogClassGroups.workspaceClasses.filter((c) => c.id === 'cls-atlas-cat-tela'),
      },
      {
        id: 'pkg-atlas-licencas',
        name: 'Catálogo de licenças',
        classes: licencaClassGroups.workspaceClasses,
      },
      {
        id: 'pkg-atlas-servicos',
        name: 'Catálogo de serviços',
        classes: servicoClassGroups.workspaceClasses,
      },
      {
        id: 'pkg-atlas-cobranca',
        name: 'Cobrança',
        classes: [
          {
            id: 'cls-atlas-cobranca',
            name: 'Cobrança — cliente e contratos',
            linkedFormId: FORM_ROOT,
          },
          ...pvClassGroups.workspaceClasses,
        ],
      },
    ],
  },
  {
    id: 'ws-atlas-portal-cotacao',
    name: 'Portal de cotação',
    explorerChromeColor: '#1565c0',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'PC',
    packages: [
      {
        id: 'pkg-atlas-portal-cotacao',
        name: 'Cotação comercial',
        classes: portalCotacaoClassGroups.workspaceClasses,
      },
    ],
  },
  {
    id: 'ws-atlas-propostas',
    name: 'Propostas comerciais',
    explorerChromeColor: '#b45309',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'PR',
    packages: [
      {
        id: 'pkg-atlas-proposta-visoes',
        name: 'Visualização',
        classes: propostaClassGroups.workspaceClasses.filter((c) =>
          ['cls-atlas-visao-propostas', 'cls-atlas-historico-propostas'].includes(c.id),
        ),
      },
      {
        id: 'pkg-atlas-proposta-cadastro',
        name: 'Cadastro e colaboração',
        classes: propostaClassGroups.workspaceClasses.filter((c) => c.id === 'cls-atlas-proposta-cadastro'),
      },
      {
        id: 'pkg-atlas-proposta-workflow',
        name: 'Workflow configurável',
        classes: propostaClassGroups.workspaceClasses.filter((c) => c.id === 'cls-atlas-proposta-workflow'),
      },
      {
        id: 'pkg-atlas-propostas-fase1',
        name: 'Fase 1 — Propostas e assinaturas',
        classes: [
          { id: 'cls-atlas-propostas-fase1-visao', name: 'Visão Fase 1', linkedFormId: 'form-atlas-visao-fase1-operacional', linkedFormExamplePresetIds: ['atlas-f1v-preset-operacao'] },
          { id: 'cls-atlas-propostas-fase1-proposta', name: 'Propostas', linkedFormId: 'form-atlas-proposta', linkedFormExamplePresetIds: ['atlas-prp-preset-fase1-simplifica'] },
          { id: 'cls-atlas-propostas-fase1-documentos', name: 'Documentos gerados', linkedFormId: 'form-atlas-documento-gerado', linkedFormExamplePresetIds: ['atlas-dger-preset-proposta-gerada'] },
          { id: 'cls-atlas-propostas-fase1-workflows', name: 'Workflows em andamento', linkedFormId: 'form-atlas-workflow-instancia', linkedFormExamplePresetIds: ['atlas-wfi-preset-proposta-pendente-dtic'] },
        ],
      },
    ],
  },
  {
    id: 'ws-atlas-fase1-workflow',
    name: 'Atlas Fase 1 — Workflow e documentos',
    explorerChromeColor: '#0c1ba8',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'AT',
    packages: [
      {
        id: 'pkg-atlas-fase1-workflow',
        name: 'Configuração de workflows',
        classes: fase1ClassGroups.workspaceClasses.fase1Workflow,
      },
      {
        id: 'pkg-atlas-fase1-documentos',
        name: 'Templates e documentos',
        classes: fase1ClassGroups.workspaceClasses.fase1Documentos,
      },
      {
        id: 'pkg-atlas-fase1-monitoramento',
        name: 'Monitoramento',
        classes: fase1ClassGroups.workspaceClasses.fase1Monitoramento,
      },
    ],
  },
  {
    id: 'ws-atlas-contratos-raer',
    name: 'Contratos — Cadastro contratual',
    explorerChromeColor: '#1e3a5f',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'CT',
    packages: [
      {
        id: 'pkg-atlas-processo',
        name: 'Processo contratual',
        classes: contratoClassGroups.workspaceClasses.filter((c) => c.id === 'cls-atlas-processo-raer'),
      },
      {
        id: 'pkg-atlas-gestao-contrato',
        name: 'Gestão e consumo',
        classes: contratoClassGroups.workspaceClasses.filter((c) => c.id === 'cls-atlas-contrato-gestao'),
      },
      {
        id: 'pkg-atlas-pv-orfaos',
        name: 'PV e controle',
        classes: contratoClassGroups.workspaceClasses.filter((c) =>
          ['cls-atlas-controle-orfaos', 'cls-atlas-cobranca-legado'].includes(c.id),
        ),
      },
      {
        id: 'pkg-atlas-contratos-fase1',
        name: 'Fase 1 — Cadastro contratual',
        classes: [
          { id: 'cls-atlas-contratos-fase1-processo', name: 'Processos contratuais', linkedFormId: 'form-atlas-processo-contratual' },
          { id: 'cls-atlas-contratos-fase1-contrato', name: 'Contratos', linkedFormId: 'form-atlas-contrato-gestao', linkedFormExamplePresetIds: ['atlas-ctg-preset-fase1-cadastro'] },
          ...fase1ClassGroups.workspaceClasses.fase1ContratosRaer,
        ],
      },
    ],
  },
  {
    id: 'ws-atlas-acesso-identidade',
    name: 'Identidade e acesso',
    explorerChromeColor: '#5b21b6',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'ID',
    packages: [
      {
        id: 'pkg-atlas-identidade-param',
        name: 'Parametrização',
        classes: acessoClassGroups.workspaceClasses.filter((c) => c.id === 'cls-atlas-cadastro-identidade'),
      },
      {
        id: 'pkg-atlas-identidade-cadastros',
        name: 'Cadastros',
        classes: acessoClassGroups.workspaceClasses.filter((c) =>
          ['cls-atlas-pessoa', 'cls-atlas-usuario', 'cls-atlas-servidor', 'cls-atlas-permissao'].includes(c.id),
        ),
      },
      {
        id: 'pkg-atlas-identidade-fase1',
        name: 'Fase 1 — Organizações e assinantes',
        classes: [
          ...fase1ClassGroups.workspaceClasses.organizacoes,
          { id: 'cls-atlas-identidade-fase1-pessoa', name: 'Pessoas', linkedFormId: 'form-atlas-pessoa' },
          { id: 'cls-atlas-identidade-fase1-usuario', name: 'Usuários', linkedFormId: 'form-atlas-usuario' },
        ],
      },
    ],
  },
  {
    id: 'ws-atlas-painel-cliente',
    name: 'Painel do cliente',
    explorerChromeColor: '#047857',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'CLI',
    packages: [
      {
        id: 'pkg-atlas-visoes-cliente',
        name: 'Visões gerais',
        classes: clienteVisoesClassGroups.workspaceClasses,
      },
      {
        id: 'pkg-atlas-nf-usuarios',
        name: 'NF e usuários',
        classes: nfUsuariosClassGroups.workspaceClasses,
      },
    ],
  },
]

const classGroups = {
  groups: [
    { id: 'grp-atlas-maestros', name: 'Parâmetros de domínio' },
    { id: 'grp-atlas-cadastro', name: 'Cadastro de produtos' },
    { id: 'grp-atlas-catalogo', name: 'Catálogo vigente' },
    { id: 'grp-atlas-licencas', name: 'Catálogo de licenças' },
    { id: 'grp-atlas-servicos', name: 'Catálogo de serviços' },
    { id: 'grp-atlas-cobranca', name: 'Cobrança e contratos' },
    { id: 'grp-atlas-suporte', name: 'Linhas embutidas' },
    ...contratoClassGroups.extraGroups,
    { id: contratoClassGroups.suporteGroupId, name: 'Linhas embutidas (contrato)' },
    ...acessoClassGroups.extraGroups,
    ...clienteVisoesClassGroups.extraGroups,
    ...pvClassGroups.extraGroups,
    ...nfUsuariosClassGroups.extraGroups,
    ...propostaClassGroups.extraGroups,
    { id: propostaClassGroups.suporteGroupId, name: 'Linhas embutidas (proposta)' },
    ...portalCotacaoClassGroups.extraGroups,
    ...fase1ClassGroups.extraGroups,
  ],
  assignments: {
    ...catalogClassGroups.assignments,
    ...licencaClassGroups.assignments,
    ...servicoClassGroups.assignments,
    ...contratoClassGroups.assignments,
    ...acessoClassGroups.assignments,
    ...clienteVisoesClassGroups.assignments,
    ...pvClassGroups.assignments,
    ...nfUsuariosClassGroups.assignments,
    ...propostaClassGroups.assignments,
    ...portalCotacaoClassGroups.assignments,
    ...fase1ClassGroups.assignments,
    [FORM_ROOT]: 'grp-atlas-cobranca',
    [FORM_CONTRATO_RESUMO]: 'grp-atlas-cobranca',
    [FORM_CONTRATO_GRUPO]: 'grp-atlas-cobranca',
    [FORM_PEDIDO]: 'grp-atlas-cobranca',
  },
  memberOrderByGroup: {
    ...catalogClassGroups.memberOrder,
    ...licencaClassGroups.memberOrder,
    ...servicoClassGroups.memberOrder,
    ...contratoClassGroups.memberOrder,
    ...acessoClassGroups.memberOrder,
    ...clienteVisoesClassGroups.memberOrder,
    ...pvClassGroups.memberOrder,
    ...nfUsuariosClassGroups.memberOrder,
    ...propostaClassGroups.memberOrder,
    ...portalCotacaoClassGroups.memberOrder,
    ...fase1ClassGroups.memberOrder,
    'grp-atlas-cobranca': [FORM_ROOT, FORM_CONTRATO_RESUMO, FORM_CONTRATO_GRUPO, FORM_PEDIDO],
  },
}

applyFase1DisplayPrefixes(forms, classGroups, workspaces)

fs.mkdirSync(epicDir, { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
fs.writeFileSync(
  path.join(epicDir, 'workspaces.json'),
  `${JSON.stringify(workspaces, null, 2)}\n`,
  'utf8',
)
fs.writeFileSync(
  path.join(epicDir, 'class-groups.json'),
  `${JSON.stringify(classGroups, null, 2)}\n`,
  'utf8',
)
fs.writeFileSync(
  path.join(epicDir, 'portals.json'),
  `${JSON.stringify(atlasPortals, null, 2)}\n`,
  'utf8',
)
fs.writeFileSync(
  path.join(epicDir, 'context.md'),
  `# Atlas épico

## Parâmetros de domínio

\`form-atlas-cadastro-maestros\` — cadastro de Solução, Métrica, Cobrança, FOCAL, FC, Unidade DTIC e Parceiro.
\`form-atlas-produto-cadastro\` referencia essas classes (campo Referência + \`linkedFormId\`).

## Cadastro de produtos

- **Cadastro de produtos** (\`form-atlas-cadastro-produtos\`): grade de todos os produtos + bloco de parametrização (\`form-atlas-catalogo-config\`).
- **Produto — cadastro** (\`form-atlas-produto-cadastro\`): dados da planilha + status / exibir na tela vigentes / ordem.

## Catálogo — produtos vigentes

- **Catálogo — produtos vigentes** (\`form-atlas-catalogo-vigentes\`): grade filtrada (Vigente + exibir) + config espelhada (somente leitura).
- Métodos: **Importar via integração**, **Atualizar produtos da integração** (Siag/Protheus).

## Catálogo de licenças comercial

- **Licença — cadastro** (\`form-atlas-licenca-linha\`): uma licença (planilha DIRC).
- **Catálogo de licenças — visualização** (\`form-atlas-catalogo-licencas\`): grade com todas as licenças.

## Catálogo de serviços comercial

- **Serviço — cadastro** (\`form-atlas-servico-linha\`): um serviço (planilha MTI CLOUD / HOST / etc.).
- **Catálogo de serviços — visualização** (\`form-atlas-catalogo-servicos\`): grade com todos os serviços.

## Cobrança

\`form-atlas-contrato\` — cliente, contratos e pedidos de venda (um PV por contrato quando agrupado).

## Propostas comerciais

Workspace **Propostas comerciais** (\`ws-atlas-propostas\`).

- \`form-atlas-visao-propostas\` — visualização geral com tags (enviado, em andamento, retornado com ajustes…).
- \`form-atlas-visao-historico-versoes\` — linha do tempo: v1 enviada, v2 parceiro, v3 reenvio MTI.
- \`form-atlas-proposta\` — cadastro: itens dos catálogos (vigentes, licenças, serviços), colaboração MTI/parceiro, envio cliente/parceiro, documentos, versionamento, assinaturas (DIRC, DTIC, DAFI, Presidência…).
- \`form-atlas-proposta-workflow-tipo\` — fluxos configuráveis por tipo de processo (etapas, responsáveis, assinar/concordar/validar).

Métodos (protótipo): montar catálogos, gerar documento, enviar cliente/parceiro, visualizar/comparar versões, tramites de assinatura.

## Portal de cotação

Workspace **Portal de cotação** (\`ws-atlas-portal-cotacao\`). Portal \`portal-atlas-cotacao\`.

- \`form-atlas-portal-login\` — autenticação (e-mail, senha, perfil).
- \`form-atlas-portal-cotacao\` — montar cotação: solução/produto, solicitante, representante, empresa/cliente, itens dos três catálogos, envio.
- Fluxo \`flow-atlas-portal-cotacao\` — login → vitrine portal → formulário → referência visual tipo Convocação Pública.

Métodos (protótipo): entrar, adicionar do catálogo, recalcular total, enviar cotação.

## Processo contratual (RAER)

Fluxo: **Proposta** → **Documentos** → **Contrato** → **Ordem de serviço** → **Termo de homologação** → **RAER**.

- \`form-atlas-processo-contratual\` — painel com etapa atual e referências às fases.
- \`form-atlas-proposta\` (cadastro completo no workspace Propostas), \`form-atlas-documentos-fase\`, \`form-atlas-contrato-gestao\`, \`form-atlas-ordem-servico\`, \`form-atlas-termo-homologacao\`, \`form-atlas-raer\` — cada fase com tramites de assinatura (setor, cargo, perfil).
- \`form-atlas-tramite-assinatura\` — linha de tramite; ajuste/reprovação exigem motivo.
- \`form-atlas-contrato-gestao\` — saldos, vigência, vencimento, renovação, consumo global e por item (Siag/Protheus, classe Sob Demanda / Mensal / Anual / Pro-Rata). OS gerada ao aprovar contrato.
- \`form-atlas-controle-sem-contrato\` — consumo sem contrato (encaminhamento manual Protheus).

Métodos (protótipo): enviar para assinatura, solicitar ajuste, reprovar, aprovar e assinar, consultar catálogo.

## Identidade e acesso (Sydle ONE)

- \`form-atlas-cadastro-identidade\` — UO, atribuições e grupos de acesso.
- \`form-atlas-pessoa\` — abas Geral, Dados de contato, Complementares (Sigadoc, notificações, fornecedor).
- \`form-atlas-usuario\` — login, ativo, grupos, superior.
- \`form-atlas-servidor\` — vínculo pessoa, permissões UO×atribuição, Sigadoc, grupos.
- \`form-atlas-permissao-usuario\` — permissão nomeada (MTI + atribuição).

## Painel do cliente

- \`form-atlas-visao-projetos-tarefas\` — projetos e tarefas abertas (integração ServiceNow), filtro geral/contrato/OS.
- \`form-atlas-visao-workflow-assinaturas\` — workflow RAER + recurso próprio Fase 1 PEAP.
- \`form-atlas-visao-ativos-consumo\` — ativos consumidos (integração OpenText HCMX).

## ATLAS — Pedidos de venda (recurso próprio)

- \`form-atlas-visao-pedidos-venda\` — visão geral PV emitidos (planilha: cliente, poder, UF, PV Protheus, classe, competências, contrato, colunas MTI).
- \`form-atlas-mti-simplifica-config\` — ATLAS no MTI Simplifica: HCMX + Protheus + Siag, defasagem 3 meses, um PV por contrato.
- \`form-atlas-pedido-venda\` — linha de PV enriquecida; \`form-atlas-pv-automacao-regra\` — automação mensal/anual/pro-rata.

## Notas fiscais e usuários

- \`form-atlas-visao-notas-fiscais\` — NF + DAR, Protheus, portal atlas.mti.mt.gov.br, comprovante.
- \`form-atlas-visao-usuarios-cadastrados\` — selo gestor MTI, tributos MT/fora MT, isenções.

## Atlas — Fase 1 (Proposta → Documentos → Workflow → Assinatura → Contrato)

Workspace **Atlas Fase 1 — Workflow e documentos** (\`ws-atlas-fase1-workflow\`). Demais workspaces (\`ws-atlas-propostas\`, \`ws-atlas-contratos-raer\`, \`ws-atlas-acesso-identidade\`) recebem pacotes Fase 1.

### Novas classes

- \`form-atlas-organizacao\` — clientes, parceiros, unidades MTI e órgãos vinculados.
- \`form-atlas-workflow-modelo\` / \`-versao\` / \`-etapa\` / \`-instancia\` / \`-evento\` — motor de workflow versionado com etapas, transições, SLA e histórico.
- \`form-atlas-documento-template\` / \`-parametro\` / \`-gerado\` — templates parametrizados (placeholders \`{{id_do_campo}}\`) e instâncias geradas.
- \`form-atlas-checklist-contratual\` — checklist obrigatório para fechamento de contrato Fase 1.
- \`form-atlas-integracao-evento\` — eventos simulados/preparados para Protheus, ServiceNow, HCMX, Qlik, InfoCenter.
- \`form-atlas-notificacao-processo\` — notificações internas e e-mails de pendência, assinatura, atraso, contrato.
- \`form-atlas-visao-fase1-operacional\` — painel consolidado da Fase 1 (workflows, notificações, integrações).

### Extensões

- \`form-atlas-proposta\` — origem da demanda, escopo, workflow vinculado, status Fase 1, prazos/status de assinatura, contrato vinculado, observação de finalização. Métodos: gerar documento, submeter, reabrir edição.
- \`form-atlas-proposta-item\` — origem do catálogo (vigente/licença/serviço/universal/manual), métrica, recorrência, fator de conversão, valor previsto e códigos Siag/Protheus herdados.
- \`form-atlas-proposta-versao\` / \`-documento\` — versão base, motivo, status, template, exigência de assinatura, ordem e tipo documental.
- \`form-atlas-tramite-assinatura\` — área, papel, mecanismo (cert. digital, Gov.br, MT Login, senha, aceite), datas e bloqueio de fluxo.
- \`form-atlas-processo-contratual\` — proposta de origem, workflow, checklist e status de finalização.
- \`form-atlas-contrato-gestao\` — cliente (organização), extrato e data de publicação obrigatórios, status de cadastro, recorrência padrão. Métodos: finalizar cadastro, notificar cliente.
- \`form-atlas-contrato-item-catalogo\` — item da proposta de origem, marcação de alteração e justificativa, recorrência e status de consumo.
- \`form-atlas-pessoa\` / \`form-atlas-usuario\` — organização vinculada, papel/habilitação de assinatura e perfis Fase 1.

Fluxos: \`flow-atlas-fase1-proposta-contrato\` (18 nós principais + retornos condicionais; rascunho antes do checklist; finalização só após checklist validado) e \`flow-atlas-fase1-configurador-workflow\`. Governança: \`form-atlas-fase1-governanca\`.
`,
  'utf8',
)
console.log('Wrote', outPath)
console.log('Wrote', path.join(epicDir, 'workspaces.json'))
console.log('Wrote', path.join(epicDir, 'class-groups.json'))
console.log('Wrote', path.join(epicDir, 'portals.json'))
