/**
 * Gera o ambiente PEAP (0001–0003/2025) no Espec:
 * subproject peap → épico peap-desenvolvimento-agil
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../data/subprojects/peap')
const EPIC = path.join(ROOT, 'epics/peap-desenvolvimento-agil')

const PRESET_COLORS = ['#0ea5e9', '#059669', '#d97706', '#6366f1', '#dc2626']

function presets(baseId, baseName, buildValues) {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `${baseId}-p${String(i + 1).padStart(2, '0')}`,
    name: `${baseName} — exemplo ${i + 1}`,
    iconColor: PRESET_COLORS[i],
    fieldValues: buildValues(i),
  }))
}

function textField(id, label, opts = {}) {
  return {
    id,
    label,
    type: 'text',
    size: opts.size ?? 'medium',
    readOnly: false,
    required: opts.required ?? false,
    multiple: false,
    relevance: opts.relevance ?? 'common',
    sectionId: opts.sectionId,
    textLong: opts.textLong,
    spec: opts.spec ?? '',
  }
}

function textOpt(id, label, options, opts = {}) {
  return {
    id,
    label,
    type: 'textOptions',
    size: opts.size ?? 'medium',
    readOnly: false,
    required: opts.required ?? false,
    multiple: false,
    relevance: opts.relevance ?? 'common',
    sectionId: opts.sectionId,
    options,
    spec: opts.spec ?? '',
  }
}

function decimalField(id, label, opts = {}) {
  return {
    id,
    label,
    type: 'decimal',
    size: opts.size ?? 'medium',
    currency: true,
    readOnly: false,
    required: false,
    multiple: false,
    relevance: opts.relevance ?? 'common',
    sectionId: opts.sectionId,
    spec: opts.spec ?? '',
  }
}

function alertField(id, label, title, message, variant = 'info') {
  return {
    id,
    type: 'alert',
    label,
    size: 'large',
    readOnly: true,
    required: false,
    multiple: false,
    relevance: 'common',
    alertVariant: variant,
    alertTitle: title,
    alertMessage: message,
  }
}

// ——— Formulários ———

const FORM = {
  CONTRATO: 'form-peap-contrato',
  PEDIDO: 'form-peap-pedido-venda',
  NF_DAR: 'form-peap-nota-fiscal',
  CATALOGO: 'form-peap-catalogo-produto',
  WORKFLOW: 'form-peap-workflow-assinatura',
  PROPOSTA: 'form-peap-proposta',
  OS: 'form-peap-ordem-servico',
  PARCEIRO: 'form-peap-parceiro',
  USUARIO: 'form-peap-usuario-portal',
}

const CLASSE_COBRANCA = ['Sob Demanda', 'Mensal', 'Anual', 'Pro-Rata']
const TIPO_CATALOGO = ['MTI Workspace', 'MTI Simplifica', 'MTI Cloud', 'MTI DataSecurity', 'MTI QI']

const forms = [
  {
    id: FORM.CONTRATO,
    name: 'Contrato — gestão e saldos',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    sections: [
      { id: 'sec-ct-ident', title: 'Contrato', icon: 'description' },
      { id: 'sec-ct-consumo', title: 'Consumo', icon: 'monitoring' },
    ],
    fields: [
      textField('peap-ct-numero', 'Contrato', { relevance: 'identity', sectionId: 'sec-ct-ident', spec: 'Nº/ano (ex.: 212/2024, 118/2023).' }),
      textField('peap-ct-cliente', 'Cliente / CNPJ', { size: 'large', sectionId: 'sec-ct-ident' }),
      textField('peap-ct-vigencia', 'Vigência', { size: 'small', sectionId: 'sec-ct-ident' }),
      textField('peap-ct-vencimento', 'Vencimento', { size: 'small', sectionId: 'sec-ct-ident' }),
      textOpt('peap-ct-renovacao', 'Status renovação', ['Vigente', 'A renovar', 'Renovado', 'Encerrado'], { sectionId: 'sec-ct-ident' }),
      decimalField('peap-ct-saldo', 'Saldo contratual', { relevance: 'highlight', sectionId: 'sec-ct-consumo' }),
      textOpt('peap-ct-consumo-global', 'Consumo global', ['Dentro do limite', 'Alerta 80%', 'Excedido'], { sectionId: 'sec-ct-consumo' }),
      textField('peap-ct-consumo-itens', 'Consumo por item (resumo)', { textLong: true, sectionId: 'sec-ct-consumo', spec: 'Status por objeto do contrato; parceiro vê apenas itens vinculados.' }),
    ],
    exampleValuePresets: presets('peap-ct', 'Contrato', (i) => ({
      'peap-ct-numero': `${118 + i}/2023`,
      'peap-ct-cliente': i % 2 ? 'TJMT — CNPJ 03.123.456/0001-00' : 'MPMG — CNPJ 01.987.654/0001-11',
      'peap-ct-vigencia': '01/2024 a 12/2025',
      'peap-ct-vencimento': '31/12/2025',
      'peap-ct-renovacao': 'Vigente',
      'peap-ct-saldo': 500000 + i * 120000,
      'peap-ct-consumo-global': 'Dentro do limite',
      'peap-ct-consumo-itens': '14 objetos; parceiro responsável por 2 itens.',
    })),
    activeExamplePresetId: 'peap-ct-p01',
  },
  {
    id: FORM.PEDIDO,
    name: 'Pedido de venda — ATLAS',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    methods: [{ id: 'peap-meth-pv-relatorio', name: 'Gerar relatório', icon: 'picture_as_pdf', kind: 'destaque' }],
    sections: [
      { id: 'sec-pv-dados', title: 'Pedido', icon: 'receipt_long' },
      { id: 'sec-pv-regras', title: 'Regras MTI', icon: 'rule' },
    ],
    fields: [
      textField('peap-pv-numero', 'Pedido Protheus', { relevance: 'identity', sectionId: 'sec-pv-dados' }),
      textField('peap-pv-contrato', 'Contrato vinculado', { sectionId: 'sec-pv-dados' }),
      textField('peap-pv-competencia', 'Competência consumo', { size: 'small', sectionId: 'sec-pv-dados', spec: 'Ex.: consumo jan → cobrança abr (subsequente).' }),
      textField('peap-pv-competencia-cobranca', 'Competência cobrança', { size: 'small', sectionId: 'sec-pv-dados' }),
      textOpt('peap-pv-status', 'Status', ['Rascunho', 'Emitido', 'Enviado Protheus', 'Faturado'], { sectionId: 'sec-pv-dados' }),
      decimalField('peap-pv-valor', 'Valor', { relevance: 'highlight', sectionId: 'sec-pv-dados' }),
      textOpt('peap-pv-classe-cobranca', 'Classe de cobrança do produto', CLASSE_COBRANCA, { sectionId: 'sec-pv-regras', spec: 'Sob Demanda / Mensal / Anual / Pro-Rata (cobrança integral em jan).' }),
      { id: 'peap-pv-automatico', label: 'Emissão automática', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-pv-regras', spec: 'Recorrente mensal/anual/pro-rata.' },
      textField('peap-pv-origem', 'Origem', { sectionId: 'sec-pv-regras', spec: 'HCMX + Protheus; agrupado por contrato.' }),
      alertField('peap-pv-alert', 'Regra agrupamento', 'Um pedido por contrato', 'Itens do mesmo contrato XX7 em um único PV; sem contrato → área de controle manual.', 'info'),
    ],
    exampleValuePresets: presets('peap-pv', 'Pedido ATLAS', (i) => ({
      'peap-pv-numero': `PV-2025-${8000 + i}`,
      'peap-pv-contrato': '212/2024',
      'peap-pv-competencia': '01/2025',
      'peap-pv-competencia-cobranca': '04/2025',
      'peap-pv-status': 'Emitido',
      'peap-pv-valor': 21428.57 + i * 5000,
      'peap-pv-classe-cobranca': CLASSE_COBRANCA[i % 4],
      'peap-pv-automatico': i % 2 === 0,
      'peap-pv-origem': 'Medição HCMX — catálogo Protheus/Siag',
    })),
    activeExamplePresetId: 'peap-pv-p01',
  },
  {
    id: FORM.NF_DAR,
    name: 'Nota fiscal e DAR',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    fields: [
      textField('peap-nf-numero', 'Nota fiscal', { relevance: 'identity' }),
      textField('peap-nf-pedido', 'Pedido de venda origem', {}),
      textField('peap-nf-cnpj', 'CNPJ destinatário', {}),
      decimalField('peap-nf-valor', 'Valor', {}),
      textOpt('peap-nf-status', 'Status pagamento', ['Disponível', 'Pago informado', 'Em análise de baixa', 'Baixado'], { relevance: 'highlight' }),
      { id: 'peap-nf-dar', label: 'DAR emitido', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', spec: 'Documento de arrecadação junto à NF.' },
      { id: 'peap-nf-comprovante', label: 'Comprovante anexado', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common' },
    ],
    exampleValuePresets: presets('peap-nf', 'NF/DAR', (i) => ({
      'peap-nf-numero': `NF-e ${100000 + i}`,
      'peap-nf-pedido': `PV-2025-${8000 + i}`,
      'peap-nf-cnpj': '03.123.456/0001-00',
      'peap-nf-valor': 21428.57,
      'peap-nf-status': ['Disponível', 'Pago informado', 'Em análise de baixa'][i % 3],
      'peap-nf-dar': true,
      'peap-nf-comprovante': i > 1,
    })),
    activeExamplePresetId: 'peap-nf-p01',
  },
  {
    id: FORM.CATALOGO,
    name: 'Produto de catálogo',
    sectionLayout: 'accordion',
    defaultCanvasMode: 'edit',
    sections: [
      { id: 'sec-cat-ident', title: 'Identificação' },
      { id: 'sec-cat-preco', title: 'Preço e cobrança' },
      { id: 'sec-cat-gestao', title: 'Gestão de projeto' },
      { id: 'sec-cat-homolog', title: 'Homologação' },
    ],
    fields: [
      textField('peap-cat-parceria', 'Parceria', { relevance: 'identity', sectionId: 'sec-cat-ident', required: true }),
      textField('peap-cat-categoria', 'Categoria', { sectionId: 'sec-cat-ident', required: true }),
      textField('peap-cat-part', 'PART Number', { sectionId: 'sec-cat-ident' }),
      textField('peap-cat-produto', 'Produto catálogo', { size: 'large', sectionId: 'sec-cat-ident' }),
      textField('peap-cat-descricao', 'Descrição da solução', { textLong: true, sectionId: 'sec-cat-ident' }),
      textField('peap-cat-protheus', 'Código Protheus', { sectionId: 'sec-cat-ident', spec: 'Integração.' }),
      textField('peap-cat-siag', 'Código Siag', { sectionId: 'sec-cat-ident', spec: 'Integração.' }),
      textOpt('peap-cat-tipo-cobranca', 'Tipo de cobrança', CLASSE_COBRANCA, { sectionId: 'sec-cat-preco' }),
      textField('peap-cat-recorrencia', 'Recorrência da cobrança', { sectionId: 'sec-cat-preco' }),
      decimalField('peap-cat-valor', 'Valor', { relevance: 'highlight', sectionId: 'sec-cat-preco' }),
      { id: 'peap-cat-universal', label: 'Universal', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-cat-preco', spec: 'Pode consolidar itens (ex.: MTI Simplifica).' },
      { id: 'peap-cat-individualizado', label: 'Individualizado', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-cat-preco' },
      textOpt('peap-cat-status-parceria', 'Status parceria (homologação alta administração)', ['Em homologação', 'Homologado DIREX', 'Suspenso'], { sectionId: 'sec-cat-homolog' }),
      textOpt('peap-cat-status-atual', 'Status atual', ['Ativo', 'Suspenso', 'Reajuste de preço'], { sectionId: 'sec-cat-homolog' }),
      textField('peap-cat-catalogo-destino', 'Catálogo destino', { sectionId: 'sec-cat-ident', spec: 'MTI Cloud, MTI Simplifica, etc.' }),
      textField('peap-cat-riscos', 'Riscos', { textLong: true, sectionId: 'sec-cat-gestao' }),
      textField('peap-cat-marcos', 'Marcos de sucesso', { textLong: true, sectionId: 'sec-cat-gestao' }),
    ],
    exampleValuePresets: presets('peap-cat', 'Catálogo', (i) => ({
      'peap-cat-parceria': 'Parceria Simplifica',
      'peap-cat-categoria': 'Licenciamento',
      'peap-cat-part': `PART-${1000 + i}`,
      'peap-cat-produto': TIPO_CATALOGO[i % TIPO_CATALOGO.length],
      'peap-cat-descricao': 'Serviços em simplificação e desburocratização.',
      'peap-cat-protheus': `PR-${2000 + i}`,
      'peap-cat-siag': `SG-${3000 + i}`,
      'peap-cat-tipo-cobranca': 'Mensal',
      'peap-cat-recorrencia': '12 meses',
      'peap-cat-valor': 15000 + i * 2000,
      'peap-cat-universal': i === 0,
      'peap-cat-individualizado': i !== 0,
      'peap-cat-status-parceria': 'Homologado DIREX',
      'peap-cat-status-atual': 'Ativo',
      'peap-cat-catalogo-destino': 'MTI Simplifica',
      'peap-cat-riscos': 'Dependência de integração legada.',
      'peap-cat-marcos': 'Entrega MVP em 90 dias.',
    })),
    activeExamplePresetId: 'peap-cat-p01',
  },
  {
    id: FORM.WORKFLOW,
    name: 'Workflow de assinatura',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    fields: [
      textField('peap-wf-nome', 'Nome do fluxo', { relevance: 'identity' }),
      textField('peap-wf-versao', 'Versão', { size: 'small', spec: 'Versionamento sem perda processual.' }),
      textOpt('peap-wf-tipo', 'Tipo', ['No-code', 'Low-code'], {}),
      textField('peap-wf-gerencias', 'Gerências envolvidas', { textLong: true }),
      textOpt('peap-wf-assinatura', 'Meio de assinatura', ['Certificado digital', 'Gov.Br', 'MT Login', 'Senha'], {}),
    ],
    exampleValuePresets: presets('peap-wf', 'Workflow', (i) => ({
      'peap-wf-nome': `Fluxo assinatura interdepartamental ${i + 1}`,
      'peap-wf-versao': `v${i + 1}.0`,
      'peap-wf-tipo': i % 2 ? 'Low-code' : 'No-code',
      'peap-wf-gerencias': 'DIRC, DAFI, Jurídico',
      'peap-wf-assinatura': ['Gov.Br', 'Certificado digital', 'MT Login'][i % 3],
    })),
    activeExamplePresetId: 'peap-wf-p01',
  },
  {
    id: FORM.PROPOSTA,
    name: 'Proposta — cadastro RAER',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    fields: [
      textField('peap-prop-numero', 'Proposta', { relevance: 'identity' }),
      textOpt('peap-prop-etapa', 'Etapa RAER', ['Proposta', 'Documentos', 'Contrato', 'Ordem de serviço', 'Termo homologação', 'RAER'], { relevance: 'highlight' }),
      textField('peap-prop-responsavel', 'Responsável', {}),
    ],
    exampleValuePresets: presets('peap-prop', 'Proposta', (i) => ({
      'peap-prop-numero': `PROP-2025-${100 + i}`,
      'peap-prop-etapa': ['Proposta', 'Contrato', 'Ordem de serviço'][i % 3],
      'peap-prop-responsavel': 'Gerência DIRC',
    })),
    activeExamplePresetId: 'peap-prop-p01',
  },
  {
    id: FORM.OS,
    name: 'Ordem de serviço',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    fields: [
      textField('peap-os-numero', 'Ordem de serviço', { relevance: 'identity' }),
      textField('peap-os-contrato', 'Contrato', {}),
      textField('peap-os-catalogo', 'Catálogo e versão', { spec: 'Ex.: MTI Simplifica v8.4' }),
      decimalField('peap-os-valor', 'Valor previsto', {}),
      textOpt('peap-os-status', 'Status', ['Aberta', 'Em execução', 'Homologação', 'Encerrada'], {}),
    ],
    exampleValuePresets: presets('peap-os', 'OS', (i) => ({
      'peap-os-numero': `OS-2026-${500 + i}`,
      'peap-os-contrato': '212/2024',
      'peap-os-catalogo': 'MTI Simplifica v8.4',
      'peap-os-valor': 149990,
      'peap-os-status': ['Aberta', 'Em execução'][i % 2],
    })),
    activeExamplePresetId: 'peap-os-p01',
  },
  {
    id: FORM.PARCEIRO,
    name: 'Parceiro — perfil e selo',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    fields: [
      textField('peap-par-nome', 'Parceiro', { relevance: 'identity' }),
      textField('peap-par-cnpj', 'CNPJ', {}),
      textOpt('peap-par-selo', 'Selo tributário MTI', ['Pendente', 'Aprovado DAFI', 'Reprovado'], { relevance: 'highlight' }),
      textField('peap-par-classe-trib', 'Classe tributária sugerida', {}),
    ],
    exampleValuePresets: presets('peap-par', 'Parceiro', (i) => ({
      'peap-par-nome': `Parceiro ${i + 1} Ltda`,
      'peap-par-cnpj': `12.345.678/000${i}-90`,
      'peap-par-selo': i > 2 ? 'Aprovado DAFI' : 'Pendente',
      'peap-par-classe-trib': 'Simples Nacional',
    })),
    activeExamplePresetId: 'peap-par-p01',
  },
  {
    id: FORM.USUARIO,
    name: 'Usuário do portal',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    fields: [
      textField('peap-usr-nome', 'Nome', { relevance: 'identity' }),
      textOpt('peap-usr-papel', 'Papel no portal', ['MTI Gestor', 'MTI Operador', 'Parceiro', 'Cliente'], { relevance: 'highlight' }),
      textField('peap-usr-email', 'E-mail', {}),
      textOpt('peap-usr-status', 'Status', ['Ativo', 'Inativo'], {}),
    ],
    exampleValuePresets: presets('peap-usr', 'Usuário', (i) => ({
      'peap-usr-nome': `Usuário ${i + 1}`,
      'peap-usr-papel': ['MTI Gestor', 'Parceiro', 'Cliente'][i % 3],
      'peap-usr-email': `user${i + 1}@mti.mt.gov.br`,
      'peap-usr-status': 'Ativo',
    })),
    activeExamplePresetId: 'peap-usr-p01',
  },
]

// ——— Workspaces ———

function cls(id, name, formId) {
  return { id, name, linkedFormId: formId }
}

const workspaces = [
  {
    id: 'ws-mti-triplice',
    name: 'Painel MTI — Autogestão',
    explorerChromeColor: '#0c1ba8',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'MTI',
    packages: [
      {
        id: 'pkg-mti-contratos',
        name: 'Contratos e consumo',
        classes: [
          cls('cls-mti-contrato', 'Contratos e saldos', FORM.CONTRATO),
          cls('cls-mti-os', 'Ordens de serviço', FORM.OS),
        ],
      },
      {
        id: 'pkg-mti-faturamento',
        name: 'Faturamento ATLAS',
        classes: [
          cls('cls-mti-pv', 'Pedidos de venda', FORM.PEDIDO),
          cls('cls-mti-nf', 'Notas fiscais e DAR', FORM.NF_DAR),
        ],
      },
      {
        id: 'pkg-mti-processos',
        name: 'Processos',
        classes: [
          cls('cls-mti-wf', 'Workflow de assinaturas', FORM.WORKFLOW),
          cls('cls-mti-usr', 'Usuários cadastrados', FORM.USUARIO),
        ],
      },
      {
        id: 'pkg-mti-integracoes',
        name: 'Integrações',
        classes: [
          cls('cls-mti-sn', 'Projetos (ServiceNow)', FORM.OS),
          cls('cls-mti-hcmx', 'Ativos HCMX', FORM.CONTRATO),
        ],
      },
      {
        id: 'pkg-mti-catalogo',
        name: 'Catálogo',
        classes: [cls('cls-mti-cat', 'Catálogo — homologação', FORM.CATALOGO)],
      },
    ],
  },
  {
    id: 'ws-parceiro-triplice',
    name: 'Painel Parceiro',
    explorerChromeColor: '#059669',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'PAR',
    packages: [
      {
        id: 'pkg-par-projetos',
        name: 'Projetos e contratos',
        classes: [
          cls('cls-par-sn', 'Projetos e tarefas', FORM.OS),
          cls('cls-par-ct', 'Objetos do contrato (escopo)', FORM.CONTRATO),
        ],
      },
      {
        id: 'pkg-par-financeiro',
        name: 'Financeiro',
        classes: [
          cls('cls-par-pv', 'Pedidos de venda (escopo)', FORM.PEDIDO),
          cls('cls-par-nf', 'NF e DAR — status', FORM.NF_DAR),
          cls('cls-par-pag', 'Pagamentos a parceiros', FORM.PARCEIRO),
        ],
      },
      {
        id: 'pkg-par-catalogo',
        name: 'Catálogo',
        classes: [cls('cls-par-cat', 'Meu catálogo (homologação)', FORM.CATALOGO)],
      },
    ],
  },
  {
    id: 'ws-cliente-triplice',
    name: 'Painel Cliente',
    explorerChromeColor: '#d97706',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'CLI',
    packages: [
      {
        id: 'pkg-cli-contrato',
        name: 'Meus contratos',
        classes: [cls('cls-cli-ct', 'Contratos e saldos', FORM.CONTRATO)],
      },
      {
        id: 'pkg-cli-servicos',
        name: 'Serviços e ativos',
        classes: [
          cls('cls-cli-sn', 'Projetos e chamados', FORM.OS),
          cls('cls-cli-ativos', 'Ativos e licenças HCMX', FORM.CONTRATO),
        ],
      },
      {
        id: 'pkg-cli-faturamento',
        name: 'Faturamento',
        classes: [
          cls('cls-cli-pv', 'Pedidos e previsão', FORM.PEDIDO),
          cls('cls-cli-nf', 'Central de pagamentos', FORM.NF_DAR),
        ],
      },
      {
        id: 'pkg-cli-assinatura',
        name: 'Assinaturas',
        classes: [cls('cls-cli-ass', 'Pendências de assinatura', FORM.WORKFLOW)],
      },
      {
        id: 'pkg-cli-admin',
        name: 'Administração',
        classes: [
          cls('cls-cli-usr', 'Usuários da unidade', FORM.USUARIO),
          cls('cls-cli-cat', 'Catálogo MTI (visão integral)', FORM.CATALOGO),
        ],
      },
    ],
  },
  {
    id: 'ws-fase1-processos',
    name: 'Fase 1 — Assinaturas e cadastros',
    explorerChromeColor: '#6366f1',
    explorerHeaderForeground: '#ffffff',
    explorerUserInitials: 'F1',
    packages: [
      {
        id: 'pkg-f1-ass',
        name: 'Assinatura e workflows',
        classes: [cls('cls-f1-wf', 'Workflows versionados', FORM.WORKFLOW)],
      },
      {
        id: 'pkg-f1-raer',
        name: 'Cadastro RAER',
        classes: [
          cls('cls-f1-prop', 'Proposta', FORM.PROPOSTA),
          cls('cls-f1-ct', 'Contrato', FORM.CONTRATO),
          cls('cls-f1-os', 'Ordem de serviço', FORM.OS),
        ],
      },
    ],
  },
]

// ——— Portal ATLAS ———

const portals = [
  {
    id: 'portal-atlas-mti',
    name: 'ATLAS — portal.mti.mt.gov.br',
    servicePortalHomeHeroTitle: 'ATLAS — Autogestão MTI',
    servicePortalHomeHeroSubtitle: 'Ambiente tríplice: MTI, Parceiro e Cliente',
    servicePortalHomeSearchPlaceholder: 'Buscar contratos, pedidos, catálogo…',
    servicePortalHeaderMenuOptions: ['Início', 'Contratos', 'Faturamento', 'Catálogo', 'Ajuda'],
    servicePortalHeaderNotificationCount: 3,
    servicePortalHeaderUserInitials: 'AT',
    servicePortalHomeColorPrimary: '#0c1ba8',
    servicePortalHomeColorSecondary: '#1e40af',
    servicePortalHomeColorText: '#0f172a',
    servicePortalHomeColorBackground: '#f1f5f9',
    servicePortalHomeSections: [
      {
        id: 'sec-portal-servicos',
        type: 'catalog',
        title: 'Serviços',
        catalogs: [
          {
            id: 'cat-portal-principal',
            name: 'Painéis e módulos',
            services: [
              { id: 'svc-mti', name: 'Painel MTI', code: 'PEAP-MTI', summary: 'Visão integral contratos, PV, NF, workflows.' },
              { id: 'svc-parceiro', name: 'Painel Parceiro', code: 'PEAP-PAR', summary: 'Escopo restrito por vínculo ao parceiro.' },
              { id: 'svc-cliente', name: 'Painel Cliente', code: 'PEAP-CLI', summary: 'Contratos e faturas do CNPJ da unidade.' },
              { id: 'svc-atlas-pv', name: 'ATLAS — Pedidos de venda', code: 'ATLAS-PV', summary: 'Emissão e automação de PV (Simplifica).' },
              { id: 'svc-catalogo', name: 'Catálogo de serviços', code: 'CAT-3', summary: 'Fase 3 — produtos e homologação DIREX.' },
            ],
          },
        ],
      },
    ],
  },
]

// ——— Fluxos ———

const flows = [
  {
    id: 'flow-peap-visao-geral',
    name: 'PEAP — Visão geral das fases',
    steps: [
      {
        id: 'step-peap-intro',
        title: 'Etapas de Desenvolvimento Ágil',
        type: 'html',
        htmlPresentationShowHeader: true,
        htmlPresentationHeaderTitle: 'PEAP 2025',
        htmlContent:
          '<p><strong>0001/2025</strong> — Fase 1: Assinatura digital, fluxos no-code/low-code, cadastro RAER, versionamento de workflows.</p><p><strong>0002/2025</strong> — Fase 2: Painel de Autogestão Tríplice (MTI / Parceiro / Cliente) e ATLAS no MTI Simplifica.</p><p><strong>0003/2025</strong> — Fase 3: Catálogo e atributos (Gestão Centralizada DIRC).</p>',
      },
      {
        id: 'step-peap-f1',
        title: 'Fase 1 — detalhamento',
        type: 'html',
        htmlContent:
          '<h3>0001/2025/PEAP — Fase 1</h3><ul><li>Assinatura única interdepartamental (Gov.Br, certificado, MT Login).</li><li>Fluxo Proposta → Documentos → Contrato → OS → Homologação → RAER.</li><li>Versionamento de workflows.</li></ul>',
      },
      {
        id: 'step-peap-f2',
        title: 'Fase 2 — Painel tríplice',
        type: 'html',
        htmlContent:
          '<h3>0002/2025/PEAP — Fase 2</h3><p>ATLAS: pedidos por medição HCMX, classes de cobrança, agrupamento por contrato, NF+DAR, notificação e comprovante.</p>',
      },
      {
        id: 'step-peap-f3',
        title: 'Fase 3 — Catálogo',
        type: 'html',
        htmlContent:
          '<h3>0003/2025/PEAP — Fase 3</h3><p>Catálogo com atributos de gestão de projeto; parceiro alimenta homologação; MTI homologa; cliente consulta catálogo integral.</p>',
      },
    ],
  },
  {
    id: 'flow-peap-fase1',
    name: '0001/2025/PEAP — Fase 1',
    steps: [
      {
        id: 'step-f1-obj',
        title: 'Objetivo Fase 1',
        type: 'html',
        htmlPresentationShowHeader: true,
        htmlPresentationHeaderTitle: 'Fase 1 — Assinaturas e processos',
        htmlContent: '<p>Processo de assinatura única e cadastro RAER com versionamento.</p>',
      },
      {
        id: 'step-f1-assinatura',
        title: 'Assinatura digital de processos',
        type: 'bpmn',
        bpmnTaskType: 'userTask',
        linkedFormId: FORM.WORKFLOW,
        assigneeRole: 'Gestor de processo',
        bpmnDescription: 'Assinatura digital com Gov.Br, certificado, MT Login ou senha.',
        bpmnRuleList: [
          'Fluxos hierárquicos flexíveis no-code/low-code por gerência.',
          'Versionamento obrigatório entre publicações.',
        ],
      },
      {
        id: 'step-f1-raer',
        title: 'Cadastro RAER',
        type: 'bpmn',
        bpmnTaskType: 'userTask',
        linkedFormId: FORM.PROPOSTA,
        assigneeRole: 'Analista de contratos',
        bpmnDescription: 'Proposta → Documentos → Contrato → OS → Termo → RAER.',
      },
      {
        id: 'step-f1-ws',
        title: 'Explorer — processos Fase 1',
        type: 'workspace',
        linkedWorkspaceId: 'ws-fase1-processos',
        workspacePresentationDescription: 'Classes operacionais da Fase 1 no workspace dedicado.',
      },
    ],
  },
  {
    id: 'flow-peap-fase2',
    name: '0002/2025/PEAP — Fase 2 — Autogestão',
    steps: [
      {
        id: 'step-f2-obj',
        title: 'Painel tríplice',
        type: 'html',
        htmlPresentationShowHeader: true,
        htmlPresentationHeaderTitle: 'Autogestão MTI / Parceiro / Cliente',
        htmlContent:
          '<p>Ambiente tríplice com visões distintas. ATLAS no MTI Simplifica: PV por medição, integração Protheus/HCMX, NF+DAR em atlas.mti.mt.gov.br.</p>',
      },
      {
        id: 'step-f2-portal',
        title: 'Portal ATLAS',
        type: 'servicePortal',
        linkedServicePortalId: 'portal-atlas-mti',
        servicePortalPresentationDescription: 'Ponto de entrada único para os três perfis.',
      },
      {
        id: 'step-f2-ws-mti',
        title: 'Workspace MTI',
        type: 'workspace',
        linkedWorkspaceId: 'ws-mti-triplice',
        workspacePresentationDescription: 'Visão integral: contratos, OS, PV, NF, ativos, usuários, catálogo.',
      },
      {
        id: 'step-f2-ws-par',
        title: 'Workspace Parceiro',
        type: 'workspace',
        linkedWorkspaceId: 'ws-parceiro-triplice',
        workspacePresentationDescription: 'Visão restrita por vínculo (ex.: 2 de 14 objetos do contrato 118/2023).',
      },
      {
        id: 'step-f2-ws-cli',
        title: 'Workspace Cliente',
        type: 'workspace',
        linkedWorkspaceId: 'ws-cliente-triplice',
        workspacePresentationDescription: 'CNPJ da unidade: contratos, previsão de faturamento, central de pagamentos.',
      },
      {
        id: 'step-f2-atlas-pv',
        title: 'Classe — Pedido de venda ATLAS',
        type: 'class',
        linkedFormId: FORM.PEDIDO,
        classPresentationTitle: 'ATLAS — Pedido de venda',
        classPresentationDescription:
          'Medição mensal → PV subsequente; classes Sob Demanda, Mensal, Anual, Pro-Rata; automação e agrupamento por contrato.',
      },
    ],
  },
  {
    id: 'flow-peap-fase3',
    name: '0003/2025/PEAP — Fase 3 — Catálogo',
    steps: [
      {
        id: 'step-f3-obj',
        title: 'Catálogo e atributos',
        type: 'html',
        htmlPresentationShowHeader: true,
        htmlPresentationHeaderTitle: 'Gestão Centralizada — DIRC',
        htmlContent:
          '<p>Produto com atributos de marcos, prazos, riscos, restrições, exigências. Carga CSV ou procedural. Homologação DIREX antes de produção.</p>',
      },
      {
        id: 'step-f3-ws-mti',
        title: 'Homologação MTI',
        type: 'workspace',
        linkedWorkspaceId: 'ws-mti-triplice',
        workspacePresentationDescription: 'Pacote Catálogo — homologação e ateste (privilégios administrador).',
      },
      {
        id: 'step-f3-cat',
        title: 'Produto de catálogo',
        type: 'class',
        linkedFormId: FORM.CATALOGO,
        classPresentationTitle: 'Linha de catálogo',
        classPresentationDescription: 'Estrutura Gestão Centralizada DIRC; universal vs individualizado.',
      },
      {
        id: 'step-f3-cli',
        title: 'Visão cliente — catálogo integral',
        type: 'class',
        linkedFormId: FORM.CATALOGO,
        classPresentationDescription: 'Cliente vê catálogo completo e relação com seu contrato; OS referencia catálogo e versão.',
      },
    ],
  },
]

const classGroups = {
  groups: [
    { id: 'grp-fase1', name: 'Fase 1 — Assinaturas' },
    { id: 'grp-fase2', name: 'Fase 2 — Autogestão / ATLAS' },
    { id: 'grp-fase3', name: 'Fase 3 — Catálogo' },
    { id: 'grp-transversal', name: 'Transversal' },
  ],
  assignments: {
    [FORM.WORKFLOW]: 'grp-fase1',
    [FORM.PROPOSTA]: 'grp-fase1',
    [FORM.CONTRATO]: 'grp-fase2',
    [FORM.PEDIDO]: 'grp-fase2',
    [FORM.NF_DAR]: 'grp-fase2',
    [FORM.OS]: 'grp-fase2',
    [FORM.PARCEIRO]: 'grp-fase2',
    [FORM.USUARIO]: 'grp-transversal',
    [FORM.CATALOGO]: 'grp-fase3',
  },
  memberOrderByGroup: {
    'grp-fase1': [FORM.WORKFLOW, FORM.PROPOSTA],
    'grp-fase2': [FORM.CONTRATO, FORM.PEDIDO, FORM.NF_DAR, FORM.OS, FORM.PARCEIRO],
    'grp-fase3': [FORM.CATALOGO],
    'grp-transversal': [FORM.USUARIO],
  },
}

const contextEpic = `# PEAP — Etapas de Desenvolvimento Ágil

Épico de especificação das fases **0001**, **0002** e **0003/2025/PEAP**.

## Fase 2 — ATLAS (regras de negócio resumidas)

- Pedido de venda = venda após medição do consumo (mensal).
- Ao registrar contrato: produtos do catálogo MTI com código Protheus/Siag e **classe de cobrança** (Sob Demanda, Mensal, Anual, Pro-Rata).
- PV **subsequente** (consumo jan → cobrança abr).
- Automação para recorrentes; **um PV por contrato** quando possível.
- NF + DAR via Protheus; cliente notificado; upload de comprovante → status «Pago informado» / «Em análise de baixa».

## Tríplice

- **MTI**: visão integral.
- **Parceiro**: escopo vinculado (contrato, PV, NF, pagamentos).
- **Cliente**: CNPJ da unidade, previsão de faturamento, central de pagamentos.

## Fase 3

- Parceiro cadastra em homologação; MTI atesta; sobe após confirmação.
- Cliente vê catálogo integral e versão na abertura de OS.
`

const contextSub = `# Subprojeto PEAP

Plano de desenvolvimento ágil MTI — especificação no Espec para apresentação e validação com negócio.
`

function writeJson(relPath, data) {
  const p = path.join(EPIC, relPath)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  console.log('Wrote', p)
}

fs.mkdirSync(ROOT, { recursive: true })
fs.writeFileSync(path.join(ROOT, 'subproject.json'), JSON.stringify({ name: 'PEAP — Etapas Desenvolvimento Ágil' }, null, 2) + '\n')
fs.writeFileSync(path.join(ROOT, 'context.md'), contextSub)
fs.mkdirSync(EPIC, { recursive: true })
fs.writeFileSync(path.join(EPIC, 'epic.json'), JSON.stringify({ name: 'PEAP — Desenvolvimento Ágil' }, null, 2) + '\n')
fs.writeFileSync(path.join(EPIC, 'context.md'), contextEpic)

writeJson('forms.json', forms)
writeJson('workspaces.json', workspaces)
writeJson('flows.json', flows)
writeJson('portals.json', portals)
writeJson('class-groups.json', classGroups)

console.log('PEAP environment ready. Open subproject «PEAP» in Espec.')
