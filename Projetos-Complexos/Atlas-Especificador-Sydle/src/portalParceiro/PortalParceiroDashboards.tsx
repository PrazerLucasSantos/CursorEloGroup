/**
 * Dashboard do portal do parceiro — página dedicada.
 * F1 cadastro/parceria · F2 catálogo/produtos · F3 demanda.
 * Sem markup/%/custo (só MTI).
 */
import { useMemo, type ReactNode } from 'react'
import {
  acoesDisponiveis,
  type Demanda,
  type StatusDemanda,
} from '../portalCliente/portalClienteDemandaData'
import type { CatalogoParceiro, GrupoParceiro, StatusFluxo } from './portalParceiroData'
import { PARCEIRO_LOGADO } from './portalParceiroData'

export type ParceiroDashNavigate =
  | 'demandas'
  | 'catalogos'
  | 'grupos'
  | 'dados'
  | 'dashboard'
  | 'importar'

type Props = {
  catalogos: CatalogoParceiro[]
  grupos: GrupoParceiro[]
  demandas: Demanda[]
  onNavigate: (page: ParceiroDashNavigate) => void
  onOpenCatalogo?: (id: string) => void
}

function isDemandaParceiro(d: Demanda): boolean {
  return d.parceiroNotificado || d.origem === 'Parceiro'
}

const STATUS_ACAO_PARCEIRO: StatusDemanda[] = [
  'Aguardando parceiro',
  'Aguardando análise',
  'Em análise',
  'Proposta parceiro · aguardando MTI',
  'Em orçamento',
  'Em atendimento · parceiro',
  'Aprovada · em atendimento',
  'Dilatação de prazo',
]

function Kpi({
  n,
  label,
  icon,
  onClick,
  tone,
}: {
  n: number | string
  label: string
  icon: string
  onClick?: () => void
  tone?: 'warn' | 'ok' | 'info' | 'muted'
}) {
  const cls = [
    'pp-dash-kpi',
    tone ? `pp-dash-kpi--${tone}` : '',
    onClick ? 'pp-dash-kpi--click' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const inner = (
    <>
      <span className="pp-dash-kpi__icon material-symbols-outlined" aria-hidden>
        {icon}
      </span>
      <span className="pp-dash-kpi__n">{n}</span>
      <span className="pp-dash-kpi__label">{label}</span>
    </>
  )
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick}>
        {inner}
      </button>
    )
  }
  return (
    <div className={cls} role="status">
      {inner}
    </div>
  )
}

function Panel({
  phase,
  title,
  lead,
  icon,
  actions,
  children,
}: {
  phase: string
  title: string
  lead: string
  icon: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="pp-dash-panel" aria-labelledby={`pp-dash-${phase}`}>
      <header className="pp-dash-panel__head">
        <div className="pp-dash-panel__title">
          <span className="pp-dash-panel__phase">{phase}</span>
          <span className="pp-dash-panel__ico material-symbols-outlined" aria-hidden>
            {icon}
          </span>
          <div>
            <h2 id={`pp-dash-${phase}`}>{title}</h2>
            <p>{lead}</p>
          </div>
        </div>
        {actions ? <div className="pp-dash-panel__actions">{actions}</div> : null}
      </header>
      <div className="pp-dash-panel__body">{children}</div>
    </section>
  )
}

function FeedCard({
  title,
  badge,
  empty,
  items,
}: {
  title: string
  badge?: number
  empty: string
  items: {
    id: string
    primary: string
    status?: string
    secondary?: string
    onClick?: () => void
  }[]
}) {
  return (
    <div className="pp-dash-feed">
      <header className="pp-dash-feed__head">
        <h3>{title}</h3>
        {typeof badge === 'number' ? (
          <span className={`pp-dash-feed__badge${badge ? ' pp-dash-feed__badge--warn' : ''}`}>
            {badge}
          </span>
        ) : null}
      </header>
      {items.length === 0 ? (
        <p className="pp-dash-feed__empty">{empty}</p>
      ) : (
        <ul className="pp-dash-feed__list">
          {items.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                className="pp-dash-feed__item"
                onClick={it.onClick}
                disabled={!it.onClick}
              >
                <span className="pp-dash-feed__primary">{it.primary}</span>
                {it.status ? <span className="pp-dash-feed__status">{it.status}</span> : null}
                {it.secondary ? <span className="pp-dash-feed__sec">{it.secondary}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function BarRow({
  label,
  value,
  max,
  tone,
}: {
  label: string
  value: number
  max: number
  tone?: 'warn' | 'ok' | 'info'
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="pp-dash-bar">
      <div className="pp-dash-bar__meta">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="pp-dash-bar__track" aria-hidden>
        <div
          className={`pp-dash-bar__fill${tone ? ` pp-dash-bar__fill--${tone}` : ''}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  )
}

export default function PortalParceiroDashboards({
  catalogos,
  grupos,
  demandas,
  onNavigate,
  onOpenCatalogo,
}: Props) {
  const demandasParceiro = useMemo(
    () => demandas.filter(isDemandaParceiro),
    [demandas],
  )

  const f1 = useMemo(() => {
    const parcerias = [...new Set(catalogos.map((c) => c.parceria))]
    const direxOk = catalogos.filter((c) =>
      (c.statusParceria || '').toLowerCase().includes('homolog'),
    ).length
    return {
      parcerias: parcerias.length,
      gruposAtivos: grupos.filter((g) => g.ativo).length,
      gruposTotal: grupos.length,
      direxOk,
      org: PARCEIRO_LOGADO.organizacao,
      user: PARCEIRO_LOGADO.usuario,
    }
  }, [catalogos, grupos])

  const f2 = useMemo(() => {
    const byStatus = (s: StatusFluxo) => catalogos.filter((c) => c.statusFluxo === s)
    const produtos = catalogos.flatMap((c) => c.produtos)
    const licenca = produtos.filter((p) => p.tipo === 'Licença').length
    const servico = produtos.filter((p) => p.tipo === 'Serviço').length
    const rascunho = byStatus('Rascunho (parceiro)')
    const fila = byStatus('Aguardando análise MTI')
    const ajuste = byStatus('Ajuste solicitado')
    const homologado = byStatus('Homologado')
    const ativo = byStatus('Ativo (publicado)')
    return {
      catalogos: catalogos.length,
      produtos: produtos.length,
      licenca,
      servico,
      rascunho,
      fila,
      ajuste,
      homologado,
      ativo,
    }
  }, [catalogos])

  const f3 = useMemo(() => {
    const abertas = demandasParceiro.filter(
      (d) =>
        d.status !== 'Efetivado · entregue' &&
        d.status !== 'Recusada' &&
        d.status !== 'Não autorizada',
    )
    const comAcao = demandasParceiro.filter((d) => {
      if (!STATUS_ACAO_PARCEIRO.includes(d.status)) return false
      return acoesDisponiveis(d, 'Parceiro').length > 0
    })
    const emAtendimento = demandasParceiro.filter(
      (d) =>
        d.status === 'Em atendimento · parceiro' ||
        d.status === 'Aprovada · em atendimento' ||
        d.status === 'Dilatação de prazo',
    )
    const aguardandoAssinaturaOrc = demandasParceiro.filter(
      (d) =>
        d.status === 'Em orçamento' && d.orcamento?.status === 'Aguardando assinaturas',
    )
    const concluidas = demandasParceiro.filter((d) => d.status === 'Efetivado · entregue')
    const comOs = demandasParceiro.filter((d) => Boolean(d.osVinculada?.trim()))
    const slaRisco = demandasParceiro.filter(
      (d) =>
        d.slaStatus === 'Em risco' ||
        d.slaStatus === 'Estourado' ||
        d.slaStatus === 'Dilatado',
    )
    return {
      total: demandasParceiro.length,
      abertas: abertas.length,
      comAcao,
      emAtendimento,
      aguardandoAssinaturaOrc,
      concluidas: concluidas.length,
      comOs: comOs.length,
      slaRisco: slaRisco.length,
      recentes: [...demandasParceiro]
        .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
        .slice(0, 8),
    }
  }, [demandasParceiro])

  const pendencias =
    f2.ajuste.length + f2.fila.length + f3.comAcao.length + f3.aguardandoAssinaturaOrc.length
  const maxCat = Math.max(f2.catalogos, 1)
  const maxDem = Math.max(f3.total, 1)

  return (
    <div className="pp-dash">
      <div className="pp-dash-hero">
        <div className="pp-dash-hero__main">
          <p className="pp-dash-hero__eyebrow">Portal do parceiro · Atlas</p>
          <h1>Dashboard</h1>
          <p className="pp-dash-hero__lead">
            Visão consolidada da parceria ({f1.org}) — cadastro, catálogo/produtos e demandas.
          </p>
        </div>
        <div className="pp-dash-hero__side">
          <div className="pp-dash-hero__user">
            <span className="pp-dash-hero__avatar" aria-hidden>
              {PARCEIRO_LOGADO.iniciais}
            </span>
            <div>
              <strong>{f1.user}</strong>
              <span>{f1.org}</span>
            </div>
          </div>
          <button
            type="button"
            className="pp-dash-hero__btn"
            onClick={() => onNavigate('dados')}
          >
            Meus dados
          </button>
        </div>
      </div>

      <div className="pp-dash-alerts" role="status">
        <div className={`pp-dash-alert${pendencias ? ' pp-dash-alert--warn' : ' pp-dash-alert--ok'}`}>
          <span className="material-symbols-outlined" aria-hidden>
            {pendencias ? 'notification_important' : 'check_circle'}
          </span>
          <div>
            <strong>
              {pendencias
                ? `${pendencias} pendência(s) que precisam da sua atenção`
                : 'Nenhuma pendência crítica no momento'}
            </strong>
            <span>
              {f2.ajuste.length} ajuste(s) de catálogo · {f2.fila.length} aguardando MTI ·{' '}
              {f3.comAcao.length} demanda(s) com ação · {f3.aguardandoAssinaturaOrc.length}{' '}
              orçamento(s) p/ assinar
            </span>
          </div>
        </div>
        <div className="pp-dash-alert-kpis">
          <button type="button" onClick={() => onNavigate('demandas')}>
            <strong>{f3.comAcao.length}</strong>
            <span>Ações demanda</span>
          </button>
          <button type="button" onClick={() => onNavigate('catalogos')}>
            <strong>{f2.ajuste.length}</strong>
            <span>Ajustes catálogo</span>
          </button>
          <button type="button" onClick={() => onNavigate('demandas')}>
            <strong>{f3.slaRisco}</strong>
            <span>SLA em risco</span>
          </button>
        </div>
      </div>

      <div className="pp-dash-grid">
        <Panel
          phase="F1"
          title="Cadastro e parceria"
          lead="Organização, grupos e status institucional (DIREX)."
          icon="handshake"
          actions={
            <>
              <button type="button" className="pp-dash-link" onClick={() => onNavigate('grupos')}>
                Grupos
              </button>
              <button type="button" className="pp-dash-link" onClick={() => onNavigate('dados')}>
                Dados
              </button>
            </>
          }
        >
          <div className="pp-dash-kpi-grid pp-dash-kpi-grid--4">
            <Kpi
              n={f1.parcerias}
              label="Parcerias no escopo"
              icon="domain"
              onClick={() => onNavigate('catalogos')}
            />
            <Kpi
              n={f1.gruposAtivos}
              label="Grupos ativos"
              icon="account_tree"
              onClick={() => onNavigate('grupos')}
            />
            <Kpi n={f1.direxOk} label="Catálogos DIREX ok" icon="verified" tone="ok" />
            <Kpi
              n={`${f1.gruposAtivos}/${f1.gruposTotal}`}
              label="Grupos ativos / total"
              icon="group"
              tone="muted"
            />
          </div>
        </Panel>

        <Panel
          phase="F2"
          title="Catálogo e produtos"
          lead="Só a sua parceria. Envio à MTI bloqueia edição até parecer."
          icon="inventory_2"
          actions={
            <>
              <button type="button" className="pp-dash-link" onClick={() => onNavigate('catalogos')}>
                Catálogos
              </button>
              <button type="button" className="pp-dash-link" onClick={() => onNavigate('importar')}>
                Importar CSV
              </button>
            </>
          }
        >
          <div className="pp-dash-kpi-grid pp-dash-kpi-grid--4">
            <Kpi
              n={f2.catalogos}
              label="Catálogos"
              icon="folder"
              onClick={() => onNavigate('catalogos')}
            />
            <Kpi
              n={f2.produtos}
              label="Produtos"
              icon="widgets"
              onClick={() => onNavigate('catalogos')}
            />
            <Kpi n={f2.licenca} label="Licença" icon="key" tone="info" />
            <Kpi n={f2.servico} label="Serviço" icon="handyman" tone="info" />
            <Kpi
              n={f2.fila.length}
              label="Aguardando MTI"
              icon="hourglass_top"
              onClick={() => onNavigate('catalogos')}
            />
            <Kpi
              n={f2.ajuste.length}
              label="Ajuste solicitado"
              icon="edit_note"
              tone="warn"
              onClick={() => onNavigate('catalogos')}
            />
            <Kpi
              n={f2.homologado.length + f2.ativo.length}
              label="Homologado / ativo"
              icon="check_circle"
              tone="ok"
            />
            <Kpi
              n={f2.rascunho.length}
              label="Rascunhos"
              icon="draft"
              onClick={() => onNavigate('catalogos')}
            />
          </div>

          <div className="pp-dash-split">
            <div className="pp-dash-bars">
              <h3 className="pp-dash-mini-title">Fluxo dos catálogos</h3>
              <BarRow label="Rascunho" value={f2.rascunho.length} max={maxCat} />
              <BarRow label="Aguardando MTI" value={f2.fila.length} max={maxCat} tone="info" />
              <BarRow label="Ajuste solicitado" value={f2.ajuste.length} max={maxCat} tone="warn" />
              <BarRow
                label="Homologado / ativo"
                value={f2.homologado.length + f2.ativo.length}
                max={maxCat}
                tone="ok"
              />
            </div>
            <div className="pp-dash-feed-stack">
              <FeedCard
                title="Fila MTI"
                badge={f2.fila.length}
                empty="Nenhum envio pendente."
                items={f2.fila.slice(0, 4).map((c) => ({
                  id: c.id,
                  primary: `${c.identificador} v${c.versao}`,
                  secondary: c.mensagemEnvio || c.parceria,
                  onClick: () => onOpenCatalogo?.(c.id),
                }))}
              />
              <FeedCard
                title="Ajustes"
                badge={f2.ajuste.length}
                empty="Nenhum ajuste pendente."
                items={f2.ajuste.slice(0, 4).map((c) => ({
                  id: c.id,
                  primary: `${c.identificador} v${c.versao}`,
                  secondary: c.justificativaMti || c.parceria,
                  onClick: () => onOpenCatalogo?.(c.id),
                }))}
              />
            </div>
          </div>
        </Panel>

        <Panel
          phase="F3"
          title="Demandas"
          lead="Demandas da parceria (notificadas ou abertas por você)."
          icon="inbox"
          actions={
            <button type="button" className="pp-dash-link" onClick={() => onNavigate('demandas')}>
              Abrir demandas
            </button>
          }
        >
          <div className="pp-dash-kpi-grid pp-dash-kpi-grid--4">
            <Kpi
              n={f3.abertas}
              label="Demandas abertas"
              icon="pending_actions"
              onClick={() => onNavigate('demandas')}
            />
            <Kpi
              n={f3.comAcao.length}
              label="Com ação do parceiro"
              icon="touch_app"
              tone={f3.comAcao.length ? 'warn' : undefined}
              onClick={() => onNavigate('demandas')}
            />
            <Kpi
              n={f3.emAtendimento.length}
              label="Em atendimento / dilação"
              icon="engineering"
              onClick={() => onNavigate('demandas')}
            />
            <Kpi
              n={f3.aguardandoAssinaturaOrc.length}
              label="Orçamento p/ assinar"
              icon="draw"
              tone={f3.aguardandoAssinaturaOrc.length ? 'warn' : undefined}
              onClick={() => onNavigate('demandas')}
            />
            <Kpi n={f3.comOs} label="Com OS vinculada" icon="assignment" />
            <Kpi
              n={f3.slaRisco}
              label="SLA risco / estourado"
              icon="schedule"
              tone={f3.slaRisco ? 'warn' : undefined}
              onClick={() => onNavigate('demandas')}
            />
            <Kpi n={f3.concluidas} label="Efetivadas" icon="task_alt" tone="ok" />
            <Kpi
              n={f3.total}
              label="Total no escopo"
              icon="dataset"
              onClick={() => onNavigate('demandas')}
            />
          </div>

          <div className="pp-dash-split">
            <div className="pp-dash-bars">
              <h3 className="pp-dash-mini-title">Situação das demandas</h3>
              <BarRow label="Abertas" value={f3.abertas} max={maxDem} tone="info" />
              <BarRow
                label="Com ação do parceiro"
                value={f3.comAcao.length}
                max={maxDem}
                tone="warn"
              />
              <BarRow label="Em atendimento" value={f3.emAtendimento.length} max={maxDem} />
              <BarRow label="Efetivadas" value={f3.concluidas} max={maxDem} tone="ok" />
            </div>
            <div className="pp-dash-feed-cols">
              <FeedCard
                title="Precisam da sua ação"
                badge={f3.comAcao.length}
                empty="Nenhuma demanda aguardando o parceiro agora."
                items={f3.comAcao.slice(0, 6).map((d) => ({
                  id: d.id,
                  primary: d.numero,
                  status: d.status,
                  secondary: d.produtoSolucao || d.descricao.slice(0, 72),
                  onClick: () => onNavigate('demandas'),
                }))}
              />
              <FeedCard
                title="Atualizadas recentemente"
                empty="Sem demandas no escopo da parceria."
                items={f3.recentes.map((d) => ({
                  id: d.id,
                  primary: d.numero,
                  status: d.status,
                  secondary: [
                    d.osVinculada ? `OS ${d.osVinculada}` : null,
                    d.slaStatus ? `SLA ${d.slaStatus}` : null,
                    d.atualizadoEm,
                  ]
                    .filter(Boolean)
                    .join(' · '),
                  onClick: () => onNavigate('demandas'),
                }))}
              />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
