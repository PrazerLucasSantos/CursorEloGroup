/** Meu painel — solicitações no estilo Sydle (lista, detalhe, Atender ajuste). */
import { useEffect, useMemo, useState } from 'react'
import CadastroOrganizacionalPage from './CadastroOrganizacionalPage'
import {
  SOLICITACOES_PAINEL_INICIAIS,
  type SituacaoPainel,
  type SolicitacaoPainel,
  type StatusPainel,
} from './portalClientePainelData'
import { demandaParaPainel } from './portalClienteDemandaData'
import { useDemandasShared } from '../shared/demandaSharedStore'
import {
  CADASTRO_ORG_INICIAL,
  cloneCadastro,
  solicitarAjusteBackoffice,
  type CadastroOrganizacional,
} from './portalClienteOrgData'

type Props = {
  onHome: () => void
  onToast: (msg: string) => void
  /** Demandas recém-criadas no portal (sincroniza com a lista). */
  extras?: SolicitacaoPainel[]
}

type View =
  | { kind: 'lista' }
  | { kind: 'detalhe'; id: string }
  | { kind: 'atender'; id: string }

function formatDate(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatHistorico(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function cadastroParaAtender(sol: SolicitacaoPainel): CadastroOrganizacional {
  const base = cloneCadastro(CADASTRO_ORG_INICIAL)
  return solicitarAjusteBackoffice(
    {
      ...base,
      statusAprovacao: 'Aguardando MTI',
      statusHabilitacao: 'Completa – aguardando MTI',
      dataUltimoEnvio: sol.solicitadoEm.slice(0, 10),
    },
    sol.motivoAjuste ??
      'A MTI solicitou ajustes nos dados enviados. Revise os campos indicados e salve novamente.',
  )
}

export default function MeuPainelPage({ onHome, onToast, extras }: Props) {
  const [demandas] = useDemandasShared()
  const [itens, setItens] = useState<SolicitacaoPainel[]>(() => [
    ...structuredClone(SOLICITACOES_PAINEL_INICIAIS),
  ])

  useEffect(() => {
    const fromDemandas = demandas.map(demandaParaPainel)
    const demIds = new Set(fromDemandas.map((d) => d.id))
    setItens((prev) => {
      const localEdits = prev.filter(
        (i) =>
          !demIds.has(i.id) &&
          !SOLICITACOES_PAINEL_INICIAIS.some((b) => b.id === i.id) &&
          !(extras ?? []).some((e) => e.id === i.id),
      )
      const base = structuredClone(SOLICITACOES_PAINEL_INICIAIS).filter((b) => !demIds.has(b.id))
      const extrasOnly = (extras ?? []).filter((e) => !demIds.has(e.id))
      // Preserva edições locais (ex.: atender ajuste) sobrepondo o mapa da demanda
      const byId = new Map<string, SolicitacaoPainel>()
      for (const row of [...base, ...fromDemandas, ...extrasOnly, ...localEdits]) {
        byId.set(row.id, row)
      }
      for (const row of prev) {
        if (demIds.has(row.id) && row.requerAtendimento === false && row.historico?.length) {
          const cur = byId.get(row.id)
          if (cur) byId.set(row.id, { ...cur, ...row, titulo: cur.titulo, protocolo: cur.protocolo })
        }
      }
      return [...byId.values()].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    })
  }, [demandas, extras])

  const [view, setView] = useState<View>({ kind: 'lista' })
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusPainel | ''>('')
  const [filtroSituacao, setFiltroSituacao] = useState<SituacaoPainel | ''>('')
  const [ordenar, setOrdenar] = useState<'atualizacao' | 'solicitado'>('atualizacao')
  const [porPagina, setPorPagina] = useState(10)

  const filtrados = useMemo(() => {
    let list = [...itens]
    if (filtroNome.trim()) {
      const q = filtroNome.toLowerCase()
      list = list.filter(
        (s) => s.protocolo.toLowerCase().includes(q) || s.titulo.toLowerCase().includes(q),
      )
    }
    if (filtroStatus) list = list.filter((s) => s.status === filtroStatus)
    if (filtroSituacao) list = list.filter((s) => s.situacao === filtroSituacao)
    list.sort((a, b) => {
      const ka = ordenar === 'atualizacao' ? a.atualizadoEm : a.solicitadoEm
      const kb = ordenar === 'atualizacao' ? b.atualizadoEm : b.solicitadoEm
      return kb.localeCompare(ka)
    })
    return list
  }, [itens, filtroNome, filtroStatus, filtroSituacao, ordenar])

  const pagina = filtrados.slice(0, porPagina)

  const detalhe =
    view.kind === 'detalhe' || view.kind === 'atender'
      ? (itens.find((s) => s.id === view.id) ?? null)
      : null

  function abrirDetalhe(id: string) {
    setView({ kind: 'detalhe', id })
  }

  function atender(id: string) {
    setView({ kind: 'atender', id })
  }

  function aposSalvarAjuste(id: string) {
    setItens((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'Em andamento',
              situacao: 'Em análise',
              requerAtendimento: false,
              atualizadoEm: new Date().toISOString(),
              etapaProcesso: 'Em andamento',
              historico: [
                {
                  autor: 'Sistema',
                  data: new Date().toISOString(),
                  mensagem: 'Você respondeu à solicitação de ajuste. Aguardando nova análise da MTI.',
                },
                ...(s.historico ?? []).map((h) => ({ ...h, acaoAtender: false })),
              ],
            }
          : s,
      ),
    )
    setView({ kind: 'detalhe', id })
  }

  if (view.kind === 'atender' && detalhe) {
    return (
      <CadastroOrganizacionalPage
        onHome={onHome}
        onToast={onToast}
        onBack={() => setView({ kind: 'detalhe', id: detalhe.id })}
        breadcrumbTrail={[
          'Meu painel',
          `Cadastro da organização - Atlas - ${detalhe.protocolo}`,
          'Atender ajuste',
        ]}
        title={`Cadastro da organização - Atlas - ${detalhe.protocolo}`}
        initialCadastro={cadastroParaAtender(detalhe)}
        onSaved={() => aposSalvarAjuste(detalhe.id)}
      />
    )
  }

  if (view.kind === 'detalhe' && detalhe) {
    const etapa = detalhe.etapaProcesso ?? 'Em andamento'
    return (
      <section className="pc-page pc-painel pc-painel--detalhe">
        <nav className="pc-breadcrumb" aria-label="Trilha">
          <button type="button" onClick={onHome} aria-label="Página inicial">
            <span className="material-symbols-outlined" aria-hidden>
              home
            </span>
          </button>
          <span>
            <span>/</span>
            <button type="button" className="pc-linkish" onClick={() => setView({ kind: 'lista' })}>
              Meu painel
            </button>
          </span>
          <span>
            <span>/</span>
            <span>
              {detalhe.titulo} - {detalhe.protocolo}
            </span>
          </span>
        </nav>

        <h1 className="pc-painel-detalhe__title">
          {detalhe.titulo} - {detalhe.protocolo}
        </h1>

        <div className="pc-painel-detalhe__actions">
          <button type="button" className="pc-painel-pill-btn" onClick={() => onToast('Resumo da solicitação')}>
            Resumo da solicitação
          </button>
          <button type="button" className="pc-icon-btn pc-painel-gear" aria-label="Opções">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        <ol className="pc-painel-stepper" aria-label="Etapas da solicitação">
          {(
            [
              { id: 'Novo', label: 'Novo' },
              { id: 'Em andamento', label: 'Em andamento' },
              { id: 'Encerrado', label: 'Encerrado' },
            ] as const
          ).map((step, idx, arr) => {
            const ordem = { Novo: 0, 'Em andamento': 1, Encerrado: 2 } as const
            const atual = ordem[etapa]
            const stepOrd = ordem[step.id]
            const done = stepOrd < atual
            const current = stepOrd === atual
            return (
              <li
                key={step.id}
                className={`pc-painel-stepper__item${done ? ' pc-painel-stepper__item--done' : ''}${
                  current ? ' pc-painel-stepper__item--current' : ''
                }`}
              >
                <span className="pc-painel-stepper__dot" aria-hidden>
                  {done ? (
                    <span className="material-symbols-outlined">check</span>
                  ) : current ? (
                    <span className="pc-painel-stepper__dots" aria-hidden>
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : null}
                </span>
                <span className="pc-painel-stepper__label">{step.label}</span>
                {idx < arr.length - 1 ? (
                  <span
                    className={`pc-painel-stepper__line${done ? ' pc-painel-stepper__line--solid' : ' pc-painel-stepper__line--dashed'}`}
                    aria-hidden
                  />
                ) : null}
              </li>
            )
          })}
        </ol>

        <div className="pc-painel-resumo">
          <div>
            <span className="pc-painel-resumo__label">Data da criação</span>
            <strong>{formatDateTime(detalhe.criadoEm ?? detalhe.solicitadoEm)}</strong>
          </div>
          <div>
            <span className="pc-painel-resumo__label">Data da última atualização</span>
            <strong>{formatDateTime(detalhe.atualizadoEm)}</strong>
          </div>
          <div>
            <span className="pc-painel-resumo__label">Status</span>
            <strong>{detalhe.status}</strong>
          </div>
          <div>
            <span className="pc-painel-resumo__label">Protocolo</span>
            <strong>{detalhe.protocolo}</strong>
          </div>
        </div>

        <section className="pc-painel-historico">
          <h2>Histórico</h2>
          <ul>
            {(detalhe.historico ?? []).map((h, i) => (
              <li key={`${h.data}-${i}`}>
                <span className="pc-painel-historico__rail" aria-hidden />
                <span className="pc-painel-historico__avatar" aria-hidden>
                  S
                </span>
                <div className="pc-painel-historico__body">
                  <div className="pc-painel-historico__meta">
                    <strong>{h.autor}</strong>
                    <span>{formatHistorico(h.data)}</span>
                  </div>
                  <p>{h.mensagem}</p>
                  {h.acaoAtender && detalhe.requerAtendimento ? (
                    <button
                      type="button"
                      className="pc-btn pc-btn--primary pc-btn--sm pc-painel-historico__atender"
                      onClick={() => atender(detalhe.id)}
                    >
                      Atender
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </section>
    )
  }

  return (
    <section className="pc-page pc-painel">
      <nav className="pc-breadcrumb" aria-label="Trilha">
        <button type="button" onClick={onHome} aria-label="Página inicial">
          <span className="material-symbols-outlined" aria-hidden>
            home
          </span>
        </button>
        <span>
          <span>/</span>
          <span>Meu painel</span>
        </span>
      </nav>

      <h1>Meu painel</h1>

      <div className="pc-painel-tabs" role="tablist">
        <button type="button" className="pc-painel-tabs__tab pc-painel-tabs__tab--active" role="tab" aria-selected>
          Todas as solicitações
        </button>
      </div>

      <div className="pc-painel-toolbar">
        <label className="pc-painel-toolbar__field">
          <span>Nome</span>
          <input
            type="search"
            value={filtroNome}
            placeholder="Filtrar…"
            onChange={(e) => setFiltroNome(e.target.value)}
          />
        </label>
        <label className="pc-painel-toolbar__field">
          <span>Status</span>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as StatusPainel | '')}>
            <option value="">Todos</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Aguardando">Aguardando</option>
            <option value="Concluído">Concluído</option>
          </select>
        </label>
        <label className="pc-painel-toolbar__field">
          <span>Situação</span>
          <select
            value={filtroSituacao}
            onChange={(e) => setFiltroSituacao(e.target.value as SituacaoPainel | '')}
          >
            <option value="">Todas</option>
            <option value="Em análise">Em análise</option>
            <option value="Aguardando análise">Aguardando análise</option>
            <option value="Aguardando resposta do solicitante">Aguardando resposta do solicitante</option>
            <option value="Solicitação concluída">Solicitação concluída</option>
          </select>
        </label>
        <label className="pc-painel-toolbar__field pc-painel-toolbar__field--sort">
          <span>Classificar por</span>
          <select
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value as 'atualizacao' | 'solicitado')}
          >
            <option value="atualizacao">Atualização mais recente</option>
            <option value="solicitado">Solicitado mais recente</option>
          </select>
        </label>
        <button
          type="button"
          className="pc-icon-btn pc-painel-toolbar__refresh"
          aria-label="Atualizar"
          onClick={() => onToast('Lista atualizada')}
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      {pagina.length === 0 ? (
        <p className="pc-empty pc-empty--panel">Nenhuma solicitação encontrada.</p>
      ) : (
        <div className="pc-table-wrap pc-painel-table-wrap">
          <table className="pc-table pc-painel-table">
            <thead>
              <tr>
                <th>Solicitações</th>
                <th>Status</th>
                <th>Solicitado em</th>
                <th>Situação</th>
                <th>Última atualização</th>
              </tr>
            </thead>
            <tbody>
              {pagina.map((s) => (
                <tr key={s.id} className="pc-painel-table__row" onClick={() => abrirDetalhe(s.id)}>
                  <td>
                    <span className="pc-painel-table__link">
                      <strong>{s.protocolo}</strong>
                      <span>{s.titulo}</span>
                    </span>
                  </td>
                  <td>
                    <span className="pc-dem-plain">{s.status}</span>
                  </td>
                  <td>{formatDate(s.solicitadoEm)}</td>
                  <td>{s.situacao}</td>
                  <td>{formatDate(s.atualizadoEm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pc-painel-pager">
        <label className="pc-painel-pager__per">
          Itens por página
          <select value={porPagina} onChange={(e) => setPorPagina(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
        <span>
          1-{Math.min(porPagina, filtrados.length)} de {filtrados.length}
        </span>
        <div className="pc-painel-pager__nav">
          <button type="button" className="pc-icon-btn" disabled aria-label="Anterior">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button type="button" className="pc-icon-btn" disabled aria-label="Próxima">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  )
}
