/** Dados do Meu painel — solicitações no padrão Sydle / MTI. */

export type StatusPainel = 'Em andamento' | 'Concluído' | 'Aguardando'

export type SituacaoPainel =
  | 'Em análise'
  | 'Solicitação concluída'
  | 'Aguardando resposta do solicitante'
  | 'Aguardando análise'

export type EtapaProcessoPainel = 'Novo' | 'Em andamento' | 'Encerrado'

export interface HistoricoPainelItem {
  autor: string
  data: string
  mensagem: string
  /** Exibe botão Atender nesta mensagem (ajuste MTI). */
  acaoAtender?: boolean
}

export interface SolicitacaoPainel {
  id: string
  protocolo: string
  titulo: string
  status: StatusPainel
  situacao: SituacaoPainel
  solicitadoEm: string
  atualizadoEm: string
  criadoEm?: string
  etapaProcesso?: EtapaProcessoPainel
  requerAtendimento?: boolean
  motivoAjuste?: string
  historico?: HistoricoPainelItem[]
}

function histPadrao(criado: string, atualizado: string): HistoricoPainelItem[] {
  return [
    {
      autor: 'Sistema',
      data: atualizado,
      mensagem: 'Sua solicitação está em análise por um analista da MTI',
    },
    {
      autor: 'Sistema',
      data: criado,
      mensagem: 'Sua solicitação está aguardando análise por um analista da MTI',
    },
  ]
}

export const SOLICITACOES_PAINEL_INICIAIS: SolicitacaoPainel[] = [
  {
    id: 'sp1',
    protocolo: '121708/2026',
    titulo: 'Cadastro da organização - Atlas',
    status: 'Em andamento',
    situacao: 'Em análise',
    solicitadoEm: '2026-07-30',
    atualizadoEm: '2026-07-30T09:40:00',
    criadoEm: '2026-07-12T09:30:00',
    etapaProcesso: 'Em andamento',
    historico: [
      {
        autor: 'Sistema',
        data: '2026-07-30T11:32:00',
        mensagem: 'Sua solicitação está em análise por um analista da MTI',
      },
      {
        autor: 'Sistema',
        data: '2026-07-30T11:31:00',
        mensagem: 'Sua solicitação está aguardando análise por um analista da MTI',
      },
      {
        autor: 'Sistema',
        data: '2026-07-30T09:40:00',
        mensagem: 'Sua solicitação está em análise por um analista da MTI',
      },
      {
        autor: 'Sistema',
        data: '2026-07-30T09:40:00',
        mensagem: 'Sua solicitação está aguardando análise por um analista da MTI',
      },
    ],
  },
  {
    id: 'sp2',
    protocolo: '121699/2026',
    titulo: 'Cadastro da organização - Atlas',
    status: 'Aguardando',
    situacao: 'Aguardando resposta do solicitante',
    solicitadoEm: '2026-07-28',
    atualizadoEm: '2026-07-29T14:20:00',
    criadoEm: '2026-07-28T10:15:00',
    etapaProcesso: 'Em andamento',
    requerAtendimento: true,
    motivoAjuste:
      'Documentos de habilitação jurídica incompletos e razão social divergente do CNPJ. Atualize os anexos e os dados da organização.',
    historico: [
      {
        autor: 'Sistema',
        data: '2026-07-29T14:20:00',
        mensagem:
          'A MTI solicitou ajustes nos dados enviados. Documentos de habilitação jurídica incompletos e razão social divergente do CNPJ. Atualize os anexos e os dados da organização.',
        acaoAtender: true,
      },
      {
        autor: 'Sistema',
        data: '2026-07-28T16:05:00',
        mensagem: 'Sua solicitação está em análise por um analista da MTI',
      },
      {
        autor: 'Sistema',
        data: '2026-07-28T10:15:00',
        mensagem: 'Sua solicitação está aguardando análise por um analista da MTI',
      },
    ],
  },
  {
    id: 'sp3',
    protocolo: '121650/2026',
    titulo: 'Cadastro da organização - Atlas',
    status: 'Concluído',
    situacao: 'Solicitação concluída',
    solicitadoEm: '2026-07-10',
    atualizadoEm: '2026-07-15',
    criadoEm: '2026-07-10T08:00:00',
    etapaProcesso: 'Encerrado',
    historico: [
      {
        autor: 'Sistema',
        data: '2026-07-15T11:00:00',
        mensagem: 'Solicitação concluída — cadastro aprovado pela MTI.',
      },
    ],
  },
  {
    id: 'sp4',
    protocolo: '121620/2026',
    titulo: 'Cadastro da organização - Atlas',
    status: 'Em andamento',
    situacao: 'Aguardando análise',
    solicitadoEm: '2026-07-25',
    atualizadoEm: '2026-07-26',
    criadoEm: '2026-07-25T13:10:00',
    etapaProcesso: 'Em andamento',
    historico: histPadrao('2026-07-25T13:10:00', '2026-07-26T09:00:00'),
  },
  {
    id: 'sp5',
    protocolo: '121580/2026',
    titulo: 'Cadastro da organização - Atlas',
    status: 'Em andamento',
    situacao: 'Em análise',
    solicitadoEm: '2026-07-22',
    atualizadoEm: '2026-07-23',
    criadoEm: '2026-07-22T11:00:00',
    etapaProcesso: 'Em andamento',
    historico: histPadrao('2026-07-22T11:00:00', '2026-07-23T10:00:00'),
  },
  {
    id: 'sp6',
    protocolo: '121540/2026',
    titulo: 'Cadastro da organização - Atlas',
    status: 'Concluído',
    situacao: 'Solicitação concluída',
    solicitadoEm: '2026-07-05',
    atualizadoEm: '2026-07-08',
    criadoEm: '2026-07-05T09:00:00',
    etapaProcesso: 'Encerrado',
    historico: [
      {
        autor: 'Sistema',
        data: '2026-07-08T16:00:00',
        mensagem: 'Solicitação concluída — cadastro aprovado pela MTI.',
      },
    ],
  },
  {
    id: 'sp7',
    protocolo: '121500/2026',
    titulo: 'Cadastro da organização - Atlas',
    status: 'Em andamento',
    situacao: 'Em análise',
    solicitadoEm: '2026-07-18',
    atualizadoEm: '2026-07-20',
    criadoEm: '2026-07-18T14:00:00',
    etapaProcesso: 'Em andamento',
    historico: histPadrao('2026-07-18T14:00:00', '2026-07-20T08:30:00'),
  },
  {
    id: 'sp8',
    protocolo: '121460/2026',
    titulo: 'Cadastro da organização - Atlas',
    status: 'Aguardando',
    situacao: 'Aguardando resposta do solicitante',
    solicitadoEm: '2026-07-14',
    atualizadoEm: '2026-07-16',
    criadoEm: '2026-07-14T10:00:00',
    etapaProcesso: 'Em andamento',
    requerAtendimento: true,
    motivoAjuste: 'Inclua o comprovante de inscrição estadual e revise o CNAE principal.',
    historico: [
      {
        autor: 'Sistema',
        data: '2026-07-16T11:00:00',
        mensagem:
          'A MTI solicitou ajustes. Inclua o comprovante de inscrição estadual e revise o CNAE principal.',
        acaoAtender: true,
      },
      {
        autor: 'Sistema',
        data: '2026-07-14T10:00:00',
        mensagem: 'Sua solicitação está aguardando análise por um analista da MTI',
      },
    ],
  },
  {
    id: 'sp9',
    protocolo: '121420/2026',
    titulo: 'Cadastro da organização - Atlas',
    status: 'Concluído',
    situacao: 'Solicitação concluída',
    solicitadoEm: '2026-06-28',
    atualizadoEm: '2026-07-02',
    criadoEm: '2026-06-28T09:00:00',
    etapaProcesso: 'Encerrado',
    historico: [
      {
        autor: 'Sistema',
        data: '2026-07-02T15:00:00',
        mensagem: 'Solicitação concluída — cadastro aprovado pela MTI.',
      },
    ],
  },
]

export function badgeClassStatusPainel(status: StatusPainel): string {
  switch (status) {
    case 'Aguardando':
      return 'pc-badge--aguardando'
    case 'Concluído':
      return 'pc-badge--concluido'
    case 'Em andamento':
    default:
      return 'pc-badge--em-andamento'
  }
}
