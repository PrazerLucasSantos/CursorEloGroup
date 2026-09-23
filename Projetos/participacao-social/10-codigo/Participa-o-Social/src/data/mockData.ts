import { Mission, DecisionRecord, CitizenContribution, CitizenProfile, RegionData } from '../types';

export const REGIONS_LIST: string[] = [
  'Todas as Regiões',
  'Baixada Cuiabana',
  'Região Sul (Rondonópolis)',
  'Médio Norte (Sinop/Sorriso)',
  'Norte Araguaia',
  'Região Oeste (Cáceres)',
  'Noroeste (Juína)',
  'Alto Teles Pires',
  'Sudeste (Primavera do Leste)'
];

export const MUNICIPALITIES_LIST: string[] = [
  'Todos os Municípios',
  'Cuiabá',
  'Várzea Grande',
  'Rondonópolis',
  'Sinop',
  'Tangará da Serra',
  'Sorriso',
  'Lucas do Rio Verde',
  'Cáceres',
  'Barra do Garças',
  'Alta Floresta',
  'Primavera do Leste',
  'Pontes e Lacerda',
  'Juína',
  'Campo Novo do Parecis',
  'Nova Mutum'
];

export const AGENCIES_LIST = [
  { initials: 'TODOS', name: 'Todos os Órgãos' },
  { initials: 'SEPLAG', name: 'Secretaria de Estado de Planejamento e Gestão' },
  { initials: 'SEDUC', name: 'Secretaria de Estado de Educação' },
  { initials: 'SES', name: 'Secretaria de Estado de Saúde' },
  { initials: 'SINFRA', name: 'Secretaria de Estado de Infraestrutura e Logística' },
  { initials: 'SEMA', name: 'Secretaria de Estado de Meio Ambiente' },
  { initials: 'SESP', name: 'Secretaria de Estado de Segurança Pública' },
  { initials: 'MTI', name: 'Empresa Mato-grossense de Tecnologia da Informação' },
  { initials: 'SECITECI', name: 'Secretaria de Ciência, Tecnologia e Inovação' }
];

export const THEMES_LIST = [
  { id: 'todos', name: 'Todos os Temas', icon: 'Layers' },
  { id: 'educacao', name: 'Educação', icon: 'GraduationCap' },
  { id: 'saude', name: 'Saúde', icon: 'HeartPulse' },
  { id: 'meio-ambiente', name: 'Meio Ambiente & Clima', icon: 'TreePine' },
  { id: 'infraestrutura', name: 'Infraestrutura & Estradas', icon: 'Truck' },
  { id: 'seguranca', name: 'Segurança Pública & Campo', icon: 'Shield' },
  { id: 'tecnologia', name: 'Inovação & Conectividade', icon: 'Wifi' },
  { id: 'agricultura', name: 'Agricultura Familiar & Agro', icon: 'Tractor' },
  { id: 'planejamento', name: 'PPA & Orçamento', icon: 'Landmark' }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'ppa-2024-2027',
    title: 'Ajude a construir o Plano Plurianual (PPA) de Mato Grosso',
    agency: 'Secretaria de Estado de Planejamento e Gestão',
    agencyInitials: 'SEPLAG',
    theme: 'Planejamento e Orçamento',
    themeColor: '#001e40',
    region: 'Todas as Regiões (141 Municípios)',
    status: 'open',
    statusLabel: 'Aberta para participação',
    participantsCount: 45280,
    deadline: 'Até 30/11/2025',
    daysRemaining: 12,
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    summary: 'O PPA é o principal instrumento de planejamento governamental de médio prazo. Sua opinião vai orientar a alocação de recursos em saúde, educação e estradas.',
    contextDescription: 'O Governo do Estado de Mato Grosso convida todos os cidadãos mato-grossenses a definir as metas prioritárias para os próximos 4 anos. Os eixos contemplam desenvolvimento econômico sustentável, infraestrutura logística, modernização do ensino e saúde descentralizada.',
    whyAsking: 'Queremos garantir que o orçamento público reflita as reais necessidades de cada comunidade, do Araguaia ao Pantanal e do Médio-Norte à Baixada Cuiabana.',
    howUsed: 'As propostas mais votadas e as diretrizes priorizadas serão submetidas diretamente à equipe técnica da SEPLAG e enviadas para votação na Assembleia Legislativa (ALMT).',
    currentStage: 'participation',
    featured: true,
    axes: [
      {
        id: 'educacao',
        title: 'Educação e Conhecimento',
        description: 'Modernização de escolas, conectividade rural, formação continuada e ampliação do ensino técnico e integral.',
        iconName: 'GraduationCap',
        highlightStat: '68% dos votantes priorizaram conectividade nas escolas'
      },
      {
        id: 'saude',
        title: 'Saúde Integral Descentralizada',
        description: 'Ampliação de hospitais regionais, redução de filas para cirurgias eletivas e expansão da telemedicina no interior.',
        iconName: 'HeartPulse',
        highlightStat: 'Expansão de 6 novos polos de atendimento especializado'
      },
      {
        id: 'sustentabilidade',
        title: 'Meio Ambiente e Sustentabilidade',
        description: 'Preservação do Pantanal e Cerrado, controle hídrico, créditos de carbono e agricultura de baixo impacto.',
        iconName: 'TreePine',
        highlightStat: 'Mais de 1.200 nascentes mapeadas para recuperação'
      },
      {
        id: 'infraestrutura',
        title: 'Infraestrutura e Logística',
        description: 'Pavimentação de rodovias estaduais, pontes de concreto, escoamento da safra e mobilidade urbana.',
        iconName: 'Truck',
        highlightStat: 'Mais de 2.500 km de rodovias previstas para pavimentação'
      }
    ]
  },
  {
    id: 'conservacao-hidrica-2025',
    title: 'Plano Estadual de Conservação Hídrica e Bacias do Pantanal 2025',
    agency: 'Secretaria de Estado de Meio Ambiente',
    agencyInitials: 'SEMA',
    theme: 'Meio Ambiente',
    themeColor: '#1b6d24',
    region: 'Baixada Cuiabana & Pantanal',
    status: 'open',
    statusLabel: 'Aberta para participação',
    participantsCount: 1240,
    deadline: 'Até 15/12/2025',
    daysRemaining: 27,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
    summary: 'Participe do mapeamento de nascentes prioritárias e ações de mitigação climática para proteção das bacias hidrográficas mato-grossenses.',
    contextDescription: 'Consulta pública para elaboração do programa de pagamento por serviços ambientais hídricos e preservação dos afluentes do Rio Cuiabá, Rio Paraguai e Rio São Lourenço.',
    whyAsking: 'Identificar as áreas mais críticas que necessitam de intervenção urgente de reflorestamento e proteção contra assoreamento.',
    howUsed: 'A SEMA destinará o Fundo Estadual de Meio Ambiente com base nas microbacias ranqueadas pelos moradores e especialistas.',
    currentStage: 'participation',
    featured: true,
    axes: [
      {
        id: 'nascentes',
        title: 'Recuperação de Nascentes',
        description: 'Cercamento e plantio de mudas nativas em cabeceiras de rios.',
        iconName: 'TreePine',
        highlightStat: 'Meta de 500 novas áreas recuperadas'
      },
      {
        id: 'saneamento',
        title: 'Tratamento de Efluentes Urbanos',
        description: 'Apoio aos municípios na contenção de poluição nas bacias.',
        iconName: 'Building2',
        highlightStat: 'Foco prioritário em 18 cidades ribeirinhas'
      }
    ]
  },
  {
    id: 'curriculo-escolas-2025',
    title: 'Novo Currículo Base das Escolas Estaduais de Tempo Integral',
    agency: 'Secretaria de Estado de Educação',
    agencyInitials: 'SEDUC',
    theme: 'Educação',
    themeColor: '#003366',
    region: 'Todas as Regiões',
    status: 'open',
    statusLabel: 'Aberta para participação',
    participantsCount: 18920,
    deadline: 'Até 20/11/2025',
    daysRemaining: 2,
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    summary: 'Comunidade escolar, pais, professores e estudantes opinam sobre as disciplinas eletivas e formação técnica integrada.',
    contextDescription: 'A expansão da rede estadual de ensino integral em Mato Grosso necessita da escuta ativa sobre cursos técnicos alinhados à vocação regional (Agro, TI, Saúde e Gestão).',
    whyAsking: 'Conectar a formação dos jovens com as oportunidades do mercado de trabalho de cada macrorregião.',
    howUsed: 'A matriz curricular de 2026 será adaptada com as disciplinas mais solicitadas pelos alunos e docentes.',
    currentStage: 'participation',
    axes: [
      {
        id: 'tecnologia',
        title: 'Robótica e Programação',
        description: 'Laboratórios Maker e oficinas de pensamento computacional em 100% das escolas.',
        iconName: 'Wifi',
        highlightStat: '82% de aceitação entre os grêmios estudantis'
      },
      {
        id: 'agro-sustentavel',
        title: 'Agropecuária Tecnológica',
        description: 'Capacitação prática em manejo sustentável, maquinário inteligente e bioeconomia.',
        iconName: 'Tractor',
        highlightStat: 'Prioridade máxima no Norte e Médio-Norte'
      }
    ]
  },
  {
    id: 'saude-especializada-interior',
    title: 'Ampliação do Atendimento Especializado nos Hospitais Regionais',
    agency: 'Secretaria de Estado de Saúde',
    agencyInitials: 'SES',
    theme: 'Saúde',
    themeColor: '#ba1a1a',
    region: 'Região Sul & Médio Norte',
    status: 'open',
    statusLabel: 'Encerra em breve',
    participantsCount: 29410,
    deadline: 'Até amanhã',
    daysRemaining: 1,
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
    summary: 'Definição de novas especialidades médicas prioritárias para os Hospitais Regionais de Rondonópolis, Sinop, Cáceres e Alta Floresta.',
    contextDescription: 'O programa MT Mais Saúde está investindo na descentralização de exames de alta complexidade e centros oncológicos e cardiológicos no interior.',
    whyAsking: 'Identificar gargalos de deslocamento de pacientes que precisam viajar até a capital Cuiabá.',
    howUsed: 'Contratação de novos leitos de UTI e contratação de especialistas de acordo com a demanda registrada na consulta pública.',
    currentStage: 'participation',
    axes: [
      {
        id: 'oncologia',
        title: 'Centros de Tratamento Oncológico',
        description: 'Impedir viagens longas com atendimento quimioterápico descentralizado.',
        iconName: 'HeartPulse',
        highlightStat: 'Ponto focal em Sinop e Rondonópolis'
      },
      {
        id: 'telemedicina',
        title: 'Consultas com Especialistas por Telemedicina',
        description: 'Agilidade em diagnósticos preliminares para 141 municípios.',
        iconName: 'Wifi',
        highlightStat: 'Redução média estimada de 40 dias na fila'
      }
    ]
  },
  {
    id: 'seguranca-patrulhamento-rural',
    title: 'Segurança no Campo & Expansão do Patrulhamento Rural Georreferenciado',
    agency: 'Secretaria de Estado de Segurança Pública',
    agencyInitials: 'SESP',
    theme: 'Segurança Pública',
    themeColor: '#2d1a00',
    region: 'Norte Araguaia & Região Oeste',
    status: 'analysis',
    statusLabel: 'Em análise pelo Governo',
    participantsCount: 14350,
    deadline: 'Encerrada em 10/10/2025',
    imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80',
    summary: 'Levantamento de rotas rurais críticas e integração com o sistema Vigia Mais MT com monitoramento em tempo real.',
    contextDescription: 'Consulta concluída que coletou mais de 14 mil coordenadas e sugestões de produtores rurais e moradores de distritos afastados.',
    whyAsking: 'Mapeamento de pontos cegos de cobertura e áreas de vulnerabilidade.',
    howUsed: 'A Polícia Militar e a Polícia Civil já estão redigindo o plano de alocação de 50 novas viaturas 4x4 e drones térmicos.',
    currentStage: 'analysis',
    axes: []
  },
  {
    id: 'conectividade-escolas-rurais',
    title: 'Conectividade e Inclusão Digital nas Escolas Indígenas e do Campo',
    agency: 'Secretaria de Ciência, Tecnologia e Inovação / MTI',
    agencyInitials: 'SECITECI',
    theme: 'Tecnologia',
    themeColor: '#003366',
    region: 'Noroeste & Norte Araguaia',
    status: 'feedback_published',
    statusLabel: 'Com devolutiva publicada',
    participantsCount: 8760,
    deadline: 'Concluída com Devolutiva',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
    summary: 'Veja como os pedidos de internet de alta velocidade via satélite foram incorporados ao programa Conecta MT.',
    contextDescription: 'Resultados oficiais disponíveis com o plano de entrega de internet via satélite para 230 unidades escolares em aldeias e assentamentos.',
    whyAsking: 'Garantir equidade no acesso ao material digital da SEDUC.',
    howUsed: '100% das 230 escolas demandadas foram contratadas e estão em fase de instalação técnica.',
    currentStage: 'feedback',
    axes: []
  }
];

export const DECISIONS_DATA: DecisionRecord[] = [
  {
    id: 'dec-1',
    topic: 'Conectividade de Alta Velocidade em Escolas Rurais',
    citizenProposal: 'Instalação prioritária de sinal de internet via satélite e computadores portáteis para 230 escolas do campo e comunidades indígenas.',
    votesCount: 8760,
    region: 'Norte Araguaia e Noroeste',
    status: 'incorporated',
    statusLabel: 'Incorporado ao PPA',
    officialJustification: 'Aprovado na íntegra. A SEDUC e a MTI alocaram R$ 42 milhões no orçamento de 2025 para cobrir 100% das escolas rurais com banda larga via satélite e tablets educacionais.',
    impactAgency: 'SEDUC / MTI',
    plannedDate: 'Início no 1º Trimestre de 2025'
  },
  {
    id: 'dec-2',
    topic: 'Novo Polo Regional de Hemodiálise em Alta Floresta',
    citizenProposal: 'Criação de ala especializada em nefrologia e hemodiálise no Hospital Regional para evitar viagens de 800km até Cuiabá.',
    votesCount: 14210,
    region: 'Alto Teles Pires',
    status: 'incorporated',
    statusLabel: 'Incorporado ao PPA',
    officialJustification: 'Aprovado. Foi formalizada a expansão do bloco cirúrgico e aquisição de 15 máquinas de hemodiálise, com contratação de equipe médica especializada.',
    impactAgency: 'SES - Secretaria de Saúde',
    plannedDate: 'Conclusão prevista para Julho de 2025'
  },
  {
    id: 'dec-3',
    topic: 'Pavimentação Ecológica do Trecho MT-130 / MT-020',
    citizenProposal: 'Asfaltamento com passagens de fauna e sinalização eletrônica para escoamento da produção e segurança dos motoristas.',
    votesCount: 9450,
    region: 'Médio Norte e Sudeste',
    status: 'incorporated',
    statusLabel: 'Incorporado ao PPA',
    officialJustification: 'A SINFRA incluiu o trecho no programa MT Integrado 2025 com exigência de túneis de passagem de fauna nativa do Cerrado.',
    impactAgency: 'SINFRA',
    plannedDate: 'Obras a partir de Março de 2025'
  },
  {
    id: 'dec-4',
    topic: 'Construção de Aeroporto Regional de Cargas em Sinop',
    citizenProposal: 'Investimento em terminal alfandegado internacional exclusivo para cargas agrícolas pesadas.',
    votesCount: 3100,
    region: 'Médio Norte',
    status: 'in_analysis',
    statusLabel: 'Em Análise de Viabilidade',
    officialJustification: 'A SEPLAG e a SEDEC estão conduzindo estudo de viabilidade econômica e parceria público-privada (PPP) com o governo federal e concessionária privada.',
    impactAgency: 'SEDEC / SINFRA',
    plannedDate: 'Parecer técnico em Dezembro de 2025'
  },
  {
    id: 'dec-5',
    topic: 'Subsídio Total de Fertilizantes Químicos Importados',
    citizenProposal: 'Subsídio com 100% de isenção estadual para adubos e fertilizantes agrícolas internacionais.',
    votesCount: 1200,
    region: 'Todas as Regiões',
    status: 'not_incorporated',
    statusLabel: 'Não Incorporado',
    officialJustification: 'Incompatível com a Lei de Responsabilidade Fiscal Estadual e diretrizes de sustentabilidade. O governo optou por incentivar bioinsumos locais e assistência técnica da EMPAER.',
    impactAgency: 'SEAF / SEFAZ',
    plannedDate: 'Arquivado com parecer orientativo'
  }
];

export const CITIZEN_MOCK_PROFILE: CitizenProfile = {
  name: 'João Silva',
  cpfMasked: '***.482.911-**',
  municipality: 'Cuiabá',
  region: 'Baixada Cuiabana',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  missionsCount: 8,
  contributionsCount: 12,
  feedbackReceivedCount: 3,
  badges: [
    {
      id: 'b-1',
      title: 'Cidadão Ativo MT',
      description: 'Participou de mais de 5 consultas públicas estaduais',
      icon: 'Award',
      earnedDate: 'Outubro de 2024'
    },
    {
      id: 'b-2',
      title: 'Voz Territorial',
      description: 'Contribuiu com propostas para sua região geográfica',
      icon: 'MapPin',
      earnedDate: 'Setembro de 2024'
    },
    {
      id: 'b-3',
      title: 'Pioneiro do PPA',
      description: 'Participação registrada nas primeiras 48h da consulta do PPA',
      icon: 'Sparkles',
      earnedDate: 'Novembro de 2024'
    }
  ]
};

export const CITIZEN_CONTRIBUTIONS: CitizenContribution[] = [
  {
    id: 'c-101',
    missionId: 'ppa-2024-2027',
    missionTitle: 'Plano Plurianual (PPA) 2024-2027',
    date: '14 de Novembro de 2024',
    status: 'analyzing',
    statusLabel: 'Em Análise Técnica',
    region: 'Baixada Cuiabana',
    prioritiesRanking: ['Conectividade Escolar', 'Expansão de UPAs', 'Saneamento do Rio Cuiabá', 'Melhoria no Transporte Intermunicipal'],
    feedbackSummary: 'Sua proposta foi agrupada com outras 1.450 demandas similares para a Baixada Cuiabana.'
  },
  {
    id: 'c-102',
    missionId: 'conectividade-escolas-rurais',
    missionTitle: 'Conectividade e Inclusão Digital nas Escolas Rurais',
    date: '12 de Setembro de 2024',
    status: 'feedback_ready',
    statusLabel: 'Devolutiva Publicada',
    region: 'Todas as Regiões',
    prioritiesRanking: ['Internet via Satélite', 'Laboratórios de Informática'],
    feedbackSummary: 'Proposta 100% incorporada ao Programa Conecta MT!'
  },
  {
    id: 'c-103',
    missionId: 'conservacao-hidrica-2025',
    missionTitle: 'Plano Estadual de Conservação Hídrica',
    date: '02 de Outubro de 2024',
    status: 'analyzing',
    statusLabel: 'Em Triagem',
    region: 'Baixada Cuiabana & Pantanal',
    prioritiesRanking: ['Recuperação de Mata Ciliar', 'Fiscalização de Efluentes']
  }
];

export const REGIONS_DATA: RegionData[] = [
  { id: 'baixada', name: 'Baixada Cuiabana', population: '1.020.000', contributions: 42350, activeMissions: 8, topTheme: 'Mobilidade & Saúde', coveragePercent: 96 },
  { id: 'medio-norte', name: 'Médio Norte (Sinop/Sorriso)', population: '680.000', contributions: 31200, activeMissions: 6, topTheme: 'Logística & Agro', coveragePercent: 91 },
  { id: 'sul', name: 'Região Sul (Rondonópolis)', population: '540.000', contributions: 27800, activeMissions: 7, topTheme: 'Saúde Especializada', coveragePercent: 88 },
  { id: 'araguaia', name: 'Norte Araguaia', population: '220.000', contributions: 16400, activeMissions: 5, topTheme: 'Conectividade Escolar', coveragePercent: 84 },
  { id: 'oeste', name: 'Região Oeste (Cáceres)', population: '310.000', contributions: 18900, activeMissions: 6, topTheme: 'Preservação do Pantanal', coveragePercent: 89 },
  { id: 'noroeste', name: 'Noroeste (Juína)', population: '190.000', contributions: 12500, activeMissions: 4, topTheme: 'Infraestrutura Rodoviária', coveragePercent: 79 },
  { id: 'teles-pires', name: 'Alto Teles Pires', population: '280.000', contributions: 15300, activeMissions: 5, topTheme: 'Ensino Técnico e Inovação', coveragePercent: 85 }
];
