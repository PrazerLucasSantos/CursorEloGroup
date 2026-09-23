/**
 * Catálogo de licenças — Projeto Atlas Fase 1 (planilha oficial).
 * Importado por scripts/build-projeto-atlas-fase1-catalogo.mjs
 */

export const DESC_SIMPLIFICA =
  'MTI Simplifica - Licenciamento de Solução SaaS de Simplificação e Desburocratização de Processos'

export const DESC_SAAS = 'MTI SaaS - Solução de Software Gerenciados'

const PRESET_ICON_COLORS = [
  '#7c3aed',
  '#6366f1',
  '#0d9488',
  '#0369a1',
  '#059669',
  '#1e40af',
  '#b45309',
  '#64748b',
  '#0c1ba8',
  '#6d28d9',
]

/** @param {Record<string, unknown>} o */
function sim(o) {
  return {
    parceria: 'MTI SIMPLIFICA',
    descricaoSolucao: DESC_SIMPLIFICA,
    metrica: 'USN',
    versaoCatalogo: '1.5',
    modeloVenda: 'Por Licenciamento',
    markup: '1,25',
    vigencia: '12 Meses',
    universal: 'Não',
    individualizado: 'Sim',
    statusParceria: 'Ativo',
    statusAtual: 'Ativo',
    tipoCobranca: 'Sob Demanda',
    ...o,
  }
}

/** @param {Record<string, unknown>} o */
function ws(o) {
  return {
    parceria: 'MTI Workspace',
    metrica: 'USN',
    versaoCatalogo: '5.0',
    modeloVenda: 'Por Licença',
    markup: '1,18',
    distParceiro: '0,84',
    distMti: '0,16',
    vigencia: '12 Meses',
    universal: 'Sim',
    individualizado: 'Não',
    statusParceria: 'Paralisado',
    statusAtual: 'Suspenso',
    tipoCobranca: 'Sob Demanda',
    ...o,
  }
}

/** @param {Record<string, unknown>} o */
function saas(o) {
  return {
    parceria: 'MTI SaaS',
    descricaoSolucao: DESC_SAAS,
    metrica: 'USN',
    versaoCatalogo: '8.1',
    categoria: 'SaaS',
    modeloVenda: 'Por Homologação',
    vigencia: '12 Meses',
    universal: 'Não',
    individualizado: 'Não',
    statusParceria: 'FULL',
    statusAtual: 'Ativo',
    tipoCobranca: 'Sob Demanda',
    siag: '0016793',
    ...o,
  }
}

/** @param {string} grupo @param {[string, number][]} itens */
function solucaoAdicional(grupo, itens) {
  return itens.map(([produto, valor]) =>
    sim({
      produto,
      valor,
      categoria: grupo,
      grupo,
    }),
  )
}

const WORKSPACE_ROWS = [
  ws({
    objetoComercial: 'MTI Workspace',
    produto: 'MTI Workspace Frontline Starter Ecrypt - 5 GB',
    valor: 241.05,
    grupo: 'Mínimo 300 Contas, 5 GB de Armazenamento',
    custoParceiro: 204.95,
    siag: '111053',
    protheus: '32000122',
  }),
  ws({
    objetoComercial: 'MTIWORKSPACE - Soluções de Colaboração e Produtividade em Nuvem',
    descricaoSolucao: 'MTIWORKSPACE - Soluções de Colaboração e Produtividade em Nuvem',
    produto: 'MTI Workspace Enterprise Starter Ecrypt - 1 TB',
    valor: 472.23,
    grupo: 'Mínimo 300 Contas, 1 TB de Armazenamento',
    custoParceiro: 400.2,
    siag: '111054',
    protheus: '32000118',
  }),
  ws({
    objetoComercial: 'MTIWORKSPACE - Soluções de Colaboração e Produtividade em Nuvem',
    descricaoSolucao: 'MTIWORKSPACE - Soluções de Colaboração e Produtividade em Nuvem',
    produto: 'MTI Workspace Enterprise Standard Ecrypt - 5 TB',
    valor: 1070.92,
    grupo: 'Mínimo 300 Contas, 5 TB de Armazenamento',
    custoParceiro: 907.56,
    siag: '111055',
    protheus: '32000089',
  }),
  ws({
    objetoComercial: 'MTIWORKSPACE - Soluções de Colaboração e Produtividade em Nuvem',
    descricaoSolucao: 'MTIWORKSPACE - Soluções de Colaboração e Produtividade em Nuvem',
    produto: 'MTI Workspace Enterprise Plus Ecrypt - 5 TB',
    valor: 1700.1,
    grupo: 'Mínimo 300 Contas, 5 TB de Armazenamento',
    custoParceiro: 1440.84,
    siag: '111056',
    protheus: '32000100',
  }),
]

const SIMPLIFICA_SOLUCOES = [
  ...solucaoAdicional('MTI SIMPLIFICA - Solução Adicional (Gestão Educacional)', [
    ['VLCS | VALOR DO LICENCIAMENTO COMO SERVIÇO (Mensal)', 27094.75],
    ['VLS | VALOR DO LICENCIAMENTO DA SOLUÇÃO (Única Vez)', 812842.53],
    ['VRA | VALOR ANUAL PARA SUPORTE E ATUALIZAÇÃO', 553214.83],
  ]),
  ...solucaoAdicional('MTI SIMPLIFICA - Solução Adicional (Folha de Pagamento)', [
    ['VLCS | VALOR DO LICENCIAMENTO COMO SERVIÇO (Mensal)', 30105.28],
    ['VLS | VALOR DO LICENCIAMENTO DA SOLUÇÃO (Única Vez)', 903158.38],
    ['VRA | VALOR ANUAL PARA SUPORTE E ATUALIZAÇÃO', 722528.79],
  ]),
  ...solucaoAdicional('MTI SIMPLIFICA - Solução Adicional (Justiça Digital)', [
    ['VLCS | VALOR DO LICENCIAMENTO COMO SERVIÇO (Mensal)', 32112.2],
    ['VLS | VALOR DO LICENCIAMENTO DA SOLUÇÃO (Única Vez)', 963365.93],
    ['VRA | VALOR ANUAL PARA SUPORTE E ATUALIZAÇÃO', 770695.14],
  ]),
  ...solucaoAdicional('MTI SIMPLIFICA - Solução Adicional (Saúde Digital)', [
    ['VLCS | VALOR DO LICENCIAMENTO COMO SERVIÇO (Mensal)', 32112.2],
    ['VLS | VALOR DO LICENCIAMENTO DA SOLUÇÃO (Única Vez)', 963365.93],
    ['VRA | VALOR ANUAL PARA SUPORTE E ATUALIZAÇÃO', 770695.14],
  ]),
  ...solucaoAdicional('MTI SIMPLIFICA - Solução Adicional (ERP Orçamentário e Financeiro)', [
    ['VLCS | VALOR DO LICENCIAMENTO COMO SERVIÇO (Mensal)', 34119.31],
    ['VLS | VALOR DO LICENCIAMENTO DA SOLUÇÃO (Única Vez)', 1023579.45],
    ['VRA | VALOR ANUAL PARA SUPORTE E ATUALIZAÇÃO', 510063.59],
  ]),
  ...solucaoAdicional('MTI SIMPLIFICA - Solução Adicional (TSM)', [
    ['VLCS | VALOR DO LICENCIAMENTO COMO SERVIÇO (Mensal)', 30105.28],
    ['VRA | VALOR ANUAL PARA SUPORTE E ATUALIZAÇÃO', 722526.7],
  ]),
]

/** @param {string} cat @param {[string, number, string?][]} rows — produto, valor, recorrencia */
function simplificaServicos(cat, rows) {
  return rows.map(([produto, valor, recorrencia]) =>
    sim({
      produto,
      valor,
      categoria: cat,
      grupo: cat,
      recorrencia: recorrencia ?? '',
    }),
  )
}

const SIMPLIFICA_INFRA_MSG_IA_1 = [
  ...simplificaServicos('MTI SIMPLIFICA - Infraestrutura em Nuvem', [
    ['VIN - VALOR MENSAL DE INFRAESTRUTURA EM NUVEM - Até 130 usuários', 5786.21, 'Por Serviço ofertado'],
    ['VIN - Valor mensal de infraestrutura em nuvem - De 131 até 250 usuários', 13381.15, 'Por Serviço ofertado'],
    ['VIN - Valor mensal de infraestrutura em nuvem - De 251 até 500 usuários', 23614.42, 'Por Serviço ofertado'],
    ['VIN - Valor mensal de infraestrutura em nuvem - De 501 até 1.000 usuários', 33255.75, 'Por Serviço ofertado'],
    ['VIN - Valor mensal de infraestrutura em nuvem - De 1.001 até 2.500 usuários', 44729.32, 'Por Serviço ofertado'],
    ['VIN - Valor mensal de infraestrutura em nuvem - De 2.501 até 5.000 usuários', 57588.31, 'Por Serviço ofertado'],
    ['VIN - Valor mensal de infraestrutura em nuvem - De 5.001 até 8.000 usuários', 74832.34, 'Por Serviço ofertado'],
    ['VIN - Valor mensal de infraestrutura em nuvem - De 8.001 até 12.000 usuários', 94250.59, 'Por Serviço ofertado'],
    ['VIN - Valor mensal de infraestrutura em nuvem - Acima de 12.001 usuários', 115323.67, 'Por Serviço ofertado'],
    ['Espaço adicional - 100 GB', 373.75, 'Por Serviço ofertado'],
  ]),
  ...simplificaServicos('MTI SIMPLIFICA - Mensageria WhatsApp', [
    ['Ativação de conta Meta (Business Manager ID)', 920.28, 'Por conta ativada'],
    ['WhatsApp Business Account (alocação de número de telefone)', 560.62, 'Por número Ativo durante 12 meses'],
    ['[META] business_initiated Rate (ativa) - mensagem de marketing', 0.63, 'Custo por mensagem'],
    ['[META] business_initiated Rate (ativa) - mensagem de utilidade', 0.13, 'Custo por mensagem'],
    ['[META] business_initiated Rate (ativa) - mensagem de autenticação', 0.37, 'Custo por mensagem'],
    ['[META] user_initiated Rate (passiva) - mensagem de serviço', 0, 'Custo por mensagem'],
  ]),
  ...simplificaServicos('MTI SIMPLIFICA - Inteligência Artificial', [
    ['[OPEN AI] o1 - context - input', 0.14, 'Por 1.000 tokens'],
    ['[OPEN AI] o1 - context - output', 0.54, 'Por 1.000 tokens'],
    ['[OPEN AI] o3-mini - context - input', 0.01, 'Por 1.000 tokens'],
    ['[OPEN AI] o3-mini - context - output', 0.04, 'Por 1.000 tokens'],
  ]),
]

const SIMPLIFICA_IA_OPENAI_AZURE = simplificaServicos('MTI SIMPLIFICA - Inteligência Artificial', [
  ['[OPEN AI] GPT-4.5 - context - input', 0.65, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-4.5 - context - output', 1.35, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-4o - context - input', 0.32, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-4o - context - output', 0.39, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-4o mini - context - input', 0.37, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-4o mini - context - output', 0.39, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-4 - 8K context - input', 0.27, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-4 - 8K context - output', 0.54, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-4 - 32K context - input', 0.54, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-4 - 32K context - output', 1.08, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-3.5 Turbo - 4K context - input', 0.31, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-3.5 Turbo - 4K context - output', 0.32, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-3.5 Turbo - 16K context - input', 0.33, 'Por 1.000 tokens'],
  ['[OPEN AI] GPT-3.5 Turbo - 16K context - output', 0.34, 'Por 1.000 tokens'],
  ['[AZURE] CHATGPT - 4K Context - input', 0.32, 'Por 1.000 tokens'],
  ['[AZURE] CHATGPT - 4K Context - output', 0.31, 'Por 1.000 tokens'],
  ['[AZURE] CHATGPT - 16K Context - input', 0.33, 'Por 1.000 tokens'],
  ['[AZURE] CHATGPT - 16K Context - output', 0.34, 'Por 1.000 tokens'],
  ['[AZURE] Ada', 0.3, 'Por 1.000 tokens'],
  ['[AZURE] AI Speech - Context - Speech to Text - REAL TIME', 0.32, 'Por hora de Transcrição'],
  ['[AZURE] AI Speech - Context - Speech to Text - FAST', 3.25, 'Por hora de Transcrição'],
])

const SIMPLIFICA_IA_AWS_SMS = [
  ...simplificaServicos('MTI SIMPLIFICA - Inteligência Artificial', [
    ['[AZURE] AI Speech - Context - Speech to Text - BATCH', 1.62, 'Por Hora de Transcrição'],
    ['[AWS] Amazon Nova Micro - Context - Input', 0, 'Por 1.000 tokens'],
    ['[AWS] Amazon Nova Micro - Context - Output', 0, 'Por 1.000 tokens'],
    ['[AWS] Amazon Nova Lite - Context - Input', 0, 'Por 1.000 tokens'],
    ['[AWS] Amazon Nova Lite - Context - Output', 0, 'Por 1.000 tokens'],
    ['[AWS] Amazon Nova Pro - Context - Input', 0.01, 'Por 1.000 tokens'],
    ['[AWS] Amazon Nova Pro - Context - Output', 0.03, 'Por 1.000 tokens'],
    ['[Anthropic] Claude 3.7 Sonnet - Context - Input', 0.03, 'Por 1.000 tokens'],
    ['[Anthropic] Claude 3.7 Sonnet - Context - Output', 0.14, 'Por 1.000 tokens'],
    ['[Anthropic] Claude 3.5 Sonnet - Context - Input', 0.03, 'Por 1.000 tokens'],
    ['[Anthropic] Claude 3.5 Sonnet - Context - Output', 0.14, 'Por 1.000 tokens'],
    ['[Anthropic] Claude 3.5 Haiku - Context - Input', 0.01, 'Por 1.000 tokens'],
    ['[Anthropic] Claude 3.5 Haiku - Context - Output', 0.04, 'Por 1.000 tokens'],
    ['[AWS] Transcribe - Streaming', 0.22, 'Por minuto de Transcrição'],
    ['[AWS] Transcribe - Batch', 0.22, 'Por minuto de Transcrição'],
    ['[AWS] Extract Text Signatures - Verificação de assinatura', 31.57, 'Por 1.000 páginas'],
  ]),
  ...simplificaServicos('MTI SIMPLIFICA - Mensageria SMS', [
    [
      'Brasil Outbound SMS (Claro, CTBC, NEXTEL, Oi, Sercomtel, Surf Telecom, TIM, Vivo e outros)',
      0.21,
      'Por SMS',
    ],
  ]),
]

const SAAS_ROWS = [
  saas({ produto: 'Agente para segurança de computadores', valor: 4.62, protheus: '32000442' }),
  saas({
    produto: 'Licença de Ambiente X-VIA de Interoperabilidade',
    valor: 18713.25,
    protheus: '32000443',
  }),
  saas({ produto: 'Licença do Posto de Serviço Digital', valor: 15563.85, protheus: '32000444' }),
  saas({
    produto: 'Licença de Software de BI para desenvolvimento em ambiente gerenciado',
    valor: 1200,
    protheus: '32000445',
  }),
]

export const LICENCAS_CATALOGO_ENTRIES = [
  ...WORKSPACE_ROWS,
  ...SIMPLIFICA_SOLUCOES,
  ...SIMPLIFICA_INFRA_MSG_IA_1,
  ...SIMPLIFICA_IA_OPENAI_AZURE,
  ...SIMPLIFICA_IA_AWS_SMS,
  ...SAAS_ROWS,
]

function shortPresetName(produto, max = 48) {
  const t = String(produto || 'Licença').trim()
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`
}

export function licencaCatalogoFieldValues(entry, seq) {
  const siag = entry.siag || `SIM-${String(seq).padStart(5, '0')}`
  const protheus = entry.protheus || `3201${String(9000 + seq).padStart(4, '0')}`
  const custoStr =
    entry.custoParceiro != null
      ? `Custo parceiro: R$ ${Number(entry.custoParceiro).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : ''
  const distStr =
    entry.distParceiro != null
      ? `Dist. parceiro: ${entry.distParceiro} | Dist. MTI: ${entry.distMti ?? ''}`
      : ''
  return {
    'patlas-lic-parceria': entry.parceria,
    'patlas-lic-categoria': entry.categoria || entry.grupo || '',
    'patlas-lic-part-number': entry.partNumber || '',
    'patlas-lic-produto-catalogo': entry.produto,
    'patlas-lic-descricao-solucao': entry.descricaoSolucao || entry.objetoComercial || DESC_SIMPLIFICA,
    'patlas-lic-esp01': entry.grupo || '',
    'patlas-lic-esp02': entry.modeloVenda || '',
    'patlas-lic-esp03': custoStr || (entry.markup ? `MARKUP: ${entry.markup}` : ''),
    'patlas-lic-esp04': distStr || (entry.versaoCatalogo ? `Versão catálogo: ${entry.versaoCatalogo}` : ''),
    'patlas-lic-metrica': entry.metrica || 'USN',
    'patlas-lic-valor': entry.valor,
    'patlas-lic-tipo-cobranca': entry.tipoCobranca || 'Sob Demanda',
    'patlas-lic-recorrencia': entry.recorrencia || entry.modeloVenda || '',
    'patlas-lic-status-parceria': entry.statusParceria || 'Ativo',
    'patlas-lic-vigencia': entry.vigencia || '12 Meses',
    'patlas-lic-periodo-minimo': entry.periodoMinimo || '',
    'patlas-lic-catalogo': entry.versaoCatalogo
      ? `Versão ${entry.versaoCatalogo} — Catálogo MTI`
      : 'Catálogo MTI — Licenças comerciais',
    'patlas-lic-protheus': protheus,
    'patlas-lic-siag': siag,
    'patlas-lic-universal': entry.universal || 'Não',
    'patlas-lic-individualizado': entry.individualizado || 'Não',
    'patlas-lic-grupo-atendimento': entry.grupo || entry.categoria || '',
    'patlas-lic-status-atual': entry.statusAtual || 'Ativo',
  }
}

export const licRows = LICENCAS_CATALOGO_ENTRIES.map((entry, i) =>
  licencaCatalogoFieldValues(entry, i + 1),
)

export const licLinePresets = LICENCAS_CATALOGO_ENTRIES.map((entry, i) => ({
  id: `patlas-lic-linha-${String(i + 1).padStart(3, '0')}`,
  name: shortPresetName(entry.produto),
  iconColor: PRESET_ICON_COLORS[i % PRESET_ICON_COLORS.length],
  fieldValues: licencaCatalogoFieldValues(entry, i + 1),
}))

export const licPresetIds = licLinePresets.map((p) => p.id)
