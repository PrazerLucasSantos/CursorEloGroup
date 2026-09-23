/** Exemplos reais para selects/referências quando o campo não tem options. */

const BY_LINKED_FORM: Record<string, string[]> = {
  'form-patlasv4-proto-cat-metrica': ['USN', 'UST', 'HST', 'UST-IA'],
  'form-patlasv4-proto-cat-tipo-cobranca': ['Mensal', 'Anual', 'Conforme homologação'],
  'form-patlasv4-proto-cat-categoria': ['Cloud / Infra', 'Desenvolvimento', 'Segurança', 'Suporte'],
  'form-patlasv4-proto-cat-grupo': ['MTI Host', 'MTI Simplifica', 'MTI CLOUD', 'MTI Autonomy'],
  'form-patlasv4-proto-cat-modelo-venda': ['Por Licença', 'Por Serviço', 'Por Pacote'],
  'form-patlasv4-proto-cat-parceria': ['MTI SIMPLIFICA', 'MTI HOST', 'MTI QI', 'MTI SaaS', 'EloGroup', 'FacilMova', 'RW3 - Google'],
  'form-patlasv4-proto-cat-solucao': ['MTI Simplifica', 'MTI Host'],
  'form-patlasv4-proto-cat-produto': [
    'Elaborar plano de projeto',
    'Licença plataforma Simplifica',
    'Serviço de hospedagem',
  ],
  'form-patlasv4-proto-cat-catalogo': [
    'Catálogo MTI Simplifica',
    'MTI HOST',
    'Catálogo Licenças Simplifica',
  ],
  'form-patlasv4-proto-cat-universal': ['Catálogo Universal MTI'],
  'form-patlasv4-proto-cat-grupo-atendimento': ['UG-DTIC', 'GO-Vendas', 'GO-Pós-vendas'],
  'form-patlasv4-proto-unidade-organizacional': [
    'SEPLAG - Secretaria de Estado de Planejamento e Gestao',
    'Secretaria de Estado de Planejamento e Gestão',
    'Empresa Mato-grossense de Tecnologia da Informação',
    'EloGroup Consultoria e Treinamento LTDA',
  ],
  'form-patlasv4-proto-pessoa': [
    'Lucas Costa',
    'Ana Paula Souza',
    'Ana Paula Ribeiro',
    'Carlos Eduardo Lima',
    'Ricardo Almeida Ferreira',
    'Mariana Costa',
    'Bernardo Almeida',
    'Helena Ribeiro Lima',
  ],
  'form-patlasv4-proto-cargo': [
    'Gestor',
    'Fiscal',
    'Solicitante',
    'Gerente da parceria',
    'Analista',
  ],
  'form-patlasv4-proto-grupo-documento': [
    'Habilitação Jurídica',
    'Qualificação Técnica',
    'Qualificação Econômica e Financeira',
    'Compliance (adendo)',
    'Pré-rito parceria',
    'Documentos de execução',
  ],
  'form-patlasv4-proto-modelo-contrato': ['Padrão MTI', 'Parceria EloGroup', 'Cliente SEPLAG'],
}

const BY_LABEL_HINT: Array<{ match: RegExp; options: string[] }> = [
  { match: /m[eé]trica/i, options: ['USN', 'UST', 'HST'] },
  { match: /cobran/i, options: ['Mensal', 'Anual', 'Conforme homologação'] },
  { match: /categoria/i, options: ['Cloud / Infra', 'Desenvolvimento', 'Segurança'] },
  { match: /grupo/i, options: ['MTI Host', 'MTI Simplifica', 'MTI CLOUD'] },
  { match: /modelo de venda/i, options: ['Por Licença', 'Por Serviço', 'Por Pacote'] },
  { match: /parceria/i, options: ['MTI SIMPLIFICA', 'MTI HOST', 'MTI CLOUD'] },
  { match: /solu[cç][aã]o/i, options: ['MTI Simplifica — Desburocratização', 'MTI CLOUD — Serviços em nuvem'] },
  { match: /cat[aá]logo/i, options: ['MTI HOST', 'MTI SIMPLIFICA', 'MTI CLOUD — Serviços'] },
  { match: /produto/i, options: ['Licença MTI Simplifica — pacote anual', 'Serviço de implantação Cloud'] },
  { match: /parceiro|organiza/i, options: ['EloGroup Consultoria e Treinamento LTDA', 'Empresa Mato-grossense de Tecnologia da Informação'] },
  { match: /focal|pessoa|respons[aá]vel/i, options: ['Ana Paula Souza', 'Carlos Eduardo Lima'] },
  { match: /unidade dtic|dtic/i, options: ['DTIC — Diretoria de Tecnologia', 'DIRC — Diretoria Comercial'] },
  { match: /tipo.*(item|produto)/i, options: ['Licença', 'Serviço'] },
  { match: /tipo de os/i, options: ['Serviço (com orçamento prévio)', 'Licença (orçamento dispensável)'] },
]

function isPlaceholderOption(o: string): boolean {
  return /^op[cç][aã]o\s*\d+$/i.test(o.trim())
}

/**
 * Resolve opções de select/referência sem cair em "Opção 1/2/3".
 */
export function resolveDemoSelectOptions(params: {
  options?: string[]
  linkedFormId?: string
  label?: string
}): string[] {
  const raw = (params.options ?? []).filter((o) => typeof o === 'string' && o.trim())
  if (raw.length > 0 && !raw.every(isPlaceholderOption)) {
    return raw.filter((o) => !isPlaceholderOption(o))
  }

  if (params.linkedFormId && BY_LINKED_FORM[params.linkedFormId]) {
    return BY_LINKED_FORM[params.linkedFormId]
  }

  const label = params.label ?? ''
  for (const rule of BY_LABEL_HINT) {
    if (rule.match.test(label)) return rule.options
  }

  return ['— (sem exemplos cadastrados)']
}
