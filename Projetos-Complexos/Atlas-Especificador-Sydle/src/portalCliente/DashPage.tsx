import { useMemo, useState } from 'react'
import { useDemandasShared } from '../shared/demandaSharedStore'
import {
  CLIENTE_PORTAL,
  USUARIO_LOGADO,
  demandaSlaEncerrada,
  estagioTimeline,
  labelTimeline,
  type Demanda,
  type StatusDemanda,
} from './portalClienteDemandaData'
import {
  VizArea,
  VizCards,
  VizColunas,
  VizColunasLinhas,
  VizLinhas,
  VizMapaMarcadores,
  VizMetrica,
  VizPainel,
  VizPizza,
  VizTabela,
} from './DashCharts'
import { MODOS_VISUALIZACAO, type ModoVisualizacao } from './dashVizModes'

type Props = {
  onHome: () => void
  /** `mti` = back-office; inclui KPIs de fila de demandas. */
  modo?: 'cliente' | 'mti'
  /** Ao clicar KPI de status (só MTI) — abre Demandas filtrado. */
  onAbrirDemandas?: (filtro?: StatusDemanda | '') => void
}

type FaseFluxo = 'Abertura' | 'Análise' | 'Comercial' | 'Execução' | 'Encerrada'

/** Status em que o solicitante (Demandante) tipicamente age. */
const AGUARDA_SOLICITANTE: StatusDemanda[] = [
  'Devolvida para correção',
  'Aguardando assinatura do atendimento',
  'Em orçamento',
  'Em homologação',
  'Aguardando assinatura do termo',
  'Dilatação de prazo',
  'Sem cobertura · definir pagamento',
  'Aguardando cadastro gestor/fiscal',
]

function faseFluxo(d: Demanda): FaseFluxo {
  const st = d.status
  if (
    st === 'Efetivado · entregue' ||
    st === 'Recusada' ||
    st === 'Não autorizada' ||
    demandaSlaEncerrada(st)
  ) {
    return 'Encerrada'
  }
  if (
    st.includes('homolog') ||
    st.includes('atendimento') ||
    st === 'Aprovada · em atendimento' ||
    st === 'Em atendimento · parceiro' ||
    st === 'Dilatação de prazo'
  ) {
    return 'Execução'
  }
  if (
    st.includes('orçamento') ||
    st.includes('OS') ||
    st.includes('assinatura do atendimento') ||
    st === 'Sem cobertura · definir pagamento'
  ) {
    return 'Comercial'
  }
  if (
    st.includes('análise') ||
    st.includes('parceiro') ||
    st.includes('validação') ||
    st.includes('Proposta')
  ) {
    return 'Análise'
  }
  return 'Abertura'
}

function mesLabel(iso: string): string {
  const m = iso.slice(5, 7)
  const map: Record<string, string> = {
    '01': 'Jan',
    '02': 'Fev',
    '03': 'Mar',
    '04': 'Abr',
    '05': 'Mai',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Ago',
    '09': 'Set',
    '10': 'Out',
    '11': 'Nov',
    '12': 'Dez',
  }
  return map[m] ?? m
}

function countBy(items: string[]): { label: string; value: number }[] {
  const m = new Map<string, number>()
  for (const it of items) m.set(it, (m.get(it) ?? 0) + 1)
  return [...m.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

function shortStatus(s: string): string {
  if (s.length <= 22) return s
  return `${s.slice(0, 20)}…`
}

/**
 * Dash — cliente/solicitante: só indicadores da org tipo Cliente.
 * MTI: filas F3 (pré-análise, validação, SN, homologação, suporte).
 */
export default function DashPage({ onHome, modo = 'cliente', onAbrirDemandas }: Props) {
  const modoMti = modo === 'mti'
  const [demandas] = useDemandasShared()
  const [filtroModo, setFiltroModo] = useState<ModoVisualizacao | 'Todos'>('Todos')

  const kpisFila = useMemo(() => {
    if (!modoMti) return null
    const count = (...statuses: StatusDemanda[]) =>
      demandas.filter((d) => statuses.includes(d.status)).length
    return {
      preAnalise: count('Aguardando pré-análise MTI'),
      aguardando: count('Aguardando análise', 'Aguardando parceiro'),
      emAnalise: count('Em análise'),
      assinaturaAtend: count('Aguardando assinatura do atendimento'),
      validacao: count('Aguardando validação MTI'),
      orcamento: count('Em orçamento'),
      sn: count('Aprovada · em atendimento'),
      homolog: count('Em homologação', 'Aguardando assinatura do termo'),
      suporte: demandas.filter((d) => d.tipo === 'Suporte').length,
      todas: demandas.length,
    }
  }, [modoMti, demandas])

  /**
   * Escopo solicitante · organização Cliente:
   * origem Cliente + org do portal + contato do solicitante logado.
   */
  const doSolicitante = useMemo(
    () =>
      demandas.filter(
        (d) =>
          d.origem === 'Cliente' &&
          d.clienteSolicitante === CLIENTE_PORTAL &&
          d.contatoCliente === USUARIO_LOGADO,
      ),
    [demandas],
  )

  const dash = useMemo(() => {
    const list = doSolicitante
    const total = list.length
    const noPrazo = list.filter((d) => (d.slaStatus ?? 'No prazo') === 'No prazo').length
    const emRisco = list.filter((d) => d.slaStatus === 'Em risco').length
    const estourado = list.filter((d) => d.slaStatus === 'Estourado').length
    const dilatado = list.filter((d) => d.slaStatus === 'Dilatado').length
    const abertas = list.filter((d) => faseFluxo(d) !== 'Encerrada').length
    const encerradas = total - abertas
    const aguardaAcao = list.filter((d) => AGUARDA_SOLICITANTE.includes(d.status)).length

    const porFase = countBy(list.map((d) => faseFluxo(d)))
    const porSla = [
      { label: 'No prazo', value: noPrazo },
      { label: 'Em risco', value: emRisco },
      { label: 'Estourado', value: estourado },
      { label: 'Dilatado', value: dilatado },
    ].filter((x) => x.value > 0)
    const porSolucao = countBy(list.map((d) => d.produtoSolucao || '—')).slice(0, 6)
    const porStatusFull = countBy(list.map((d) => d.status)).slice(0, 8)

    const mesesOrd = [...new Set(list.map((d) => d.criadoEm.slice(0, 7)))].sort()
    const meses = mesesOrd.length ? mesesOrd : ['2026-09']
    const mesLabels = meses.map((m) => mesLabel(`${m}-01`))

    const seriesFase: FaseFluxo[] = ['Abertura', 'Análise', 'Comercial', 'Execução', 'Encerrada']

    const rowsVolume = meses.map((m) => {
      const abertasMes = list.filter((d) => d.criadoEm.startsWith(m)).length
      const encMes = list.filter(
        (d) => d.criadoEm.startsWith(m) && faseFluxo(d) === 'Encerrada',
      ).length
      const pctPrazo =
        abertasMes === 0
          ? 0
          : Math.round(
              (list.filter(
                (d) => d.criadoEm.startsWith(m) && (d.slaStatus ?? 'No prazo') === 'No prazo',
              ).length /
                abertasMes) *
                100,
            )
      return { label: mesLabel(`${m}-01`), values: [abertasMes, encMes, pctPrazo] }
    })

    const acumuladoSimples = meses.map((_, i) => {
      const ate = meses.slice(0, i + 1)
      const qtd = list.filter((d) => ate.some((x) => d.criadoEm.startsWith(x))).length
      return { label: mesLabels[i], values: [qtd] }
    })

    const pipeline = seriesFase.map((f) => ({
      label: f,
      value: list.filter((d) => faseFluxo(d) === f).length,
    }))

    const pendentesAcao = list
      .filter((d) => AGUARDA_SOLICITANTE.includes(d.status))
      .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
      .slice(0, 6)

    const tabelaStatus = porStatusFull.map((s) => [
      shortStatus(s.label),
      s.value,
      labelTimeline(s.label as StatusDemanda),
      estagioTimeline(s.label as StatusDemanda),
    ])

    return {
      total,
      abertas,
      aguardaAcao,
      pctPrazo: total ? Math.round((noPrazo / total) * 100) : 0,
      porFase,
      porSla: porSla.length ? porSla : [{ label: 'No prazo', value: 0 }],
      porSolucao,
      rowsVolume,
      acumuladoSimples,
      pipeline,
      pendentesAcao,
      tabelaStatus,
    }
  }, [doSolicitante])

  const show = (m: ModoVisualizacao) => filtroModo === 'Todos' || filtroModo === m

  return (
    <section className="pc-page pc-page--dash">
      {!modoMti && (
        <nav className="pc-breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="pc-linkish" onClick={onHome}>
            Página inicial
          </button>
          <span aria-hidden> / </span>
          <span>Dash</span>
        </nav>
      )}

      <header className="pc-page-head">
        <div>
          <h1>{modoMti ? 'Dash — Back-office Demanda' : 'Dash — Minhas demandas'}</h1>
          <p>
            {modoMti
              ? 'Pré-análise, análise, contrato/orçamento, ServiceNow, homologação e RAER.'
              : `Solicitante · organização Cliente · ${CLIENTE_PORTAL}`}
          </p>
        </div>
        {onAbrirDemandas && (
          <button type="button" className="pc-btn pc-btn--primary" onClick={() => onAbrirDemandas('')}>
            Ir para Demandas
          </button>
        )}
      </header>

      {kpisFila ? (
        <>
          <h2 className="pc-dash-section-title">Fila operacional</h2>
          <div className="pc-dem-kpi-grid">
            <button
              type="button"
              className="pc-dem-kpi"
              onClick={() => onAbrirDemandas?.('Aguardando pré-análise MTI')}
            >
              <span>Pré-análise MTI</span>
              <strong>{kpisFila.preAnalise}</strong>
            </button>
            <button
              type="button"
              className="pc-dem-kpi"
              onClick={() => onAbrirDemandas?.('Aguardando análise')}
            >
              <span>Aguardando análise</span>
              <strong>{kpisFila.aguardando}</strong>
            </button>
            <button type="button" className="pc-dem-kpi" onClick={() => onAbrirDemandas?.('Em análise')}>
              <span>Em análise</span>
              <strong>{kpisFila.emAnalise}</strong>
            </button>
            <button
              type="button"
              className="pc-dem-kpi"
              onClick={() => onAbrirDemandas?.('Aguardando assinatura do atendimento')}
            >
              <span>Assinatura atendimento</span>
              <strong>{kpisFila.assinaturaAtend}</strong>
            </button>
            <button
              type="button"
              className="pc-dem-kpi"
              onClick={() => onAbrirDemandas?.('Aguardando validação MTI')}
            >
              <span>Validar parceiro</span>
              <strong>{kpisFila.validacao}</strong>
            </button>
            <button type="button" className="pc-dem-kpi" onClick={() => onAbrirDemandas?.('Em orçamento')}>
              <span>Orçamento</span>
              <strong>{kpisFila.orcamento}</strong>
            </button>
            <button
              type="button"
              className="pc-dem-kpi"
              onClick={() => onAbrirDemandas?.('Aprovada · em atendimento')}
            >
              <span>Em atendimento / SN</span>
              <strong>{kpisFila.sn}</strong>
            </button>
            <button
              type="button"
              className="pc-dem-kpi"
              onClick={() => onAbrirDemandas?.('Aguardando assinatura do termo')}
            >
              <span>Homologação / termo</span>
              <strong>{kpisFila.homolog}</strong>
            </button>
            <button
              type="button"
              className="pc-dem-kpi pc-dem-kpi--all"
              onClick={() => onAbrirDemandas?.('')}
            >
              <span>Todas · suporte no total: {kpisFila.suporte}</span>
              <strong>{kpisFila.todas}</strong>
            </button>
          </div>
          <p className="pc-muted" style={{ marginTop: '1rem' }}>
            Consumo: gerente e titular da parceria. Suporte: grupo ou classe (24×7). Autorizar execução
            envia ao ServiceNow. Encerrar gera termo e RAER.
          </p>
        </>
      ) : (
        <>
          <div className="pc-dash-toolbar">
            <label className="pc-dash-toolbar__label" htmlFor="pc-dash-modo">
              Modo de visualização
            </label>
            <select
              id="pc-dash-modo"
              className="sy-dem-input pc-dash-toolbar__select"
              value={filtroModo}
              onChange={(e) => setFiltroModo(e.target.value as ModoVisualizacao | 'Todos')}
            >
              <option value="Todos">Todos os modos</option>
              {MODOS_VISUALIZACAO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span className="pc-muted pc-dash-toolbar__hint">
              {doSolicitante.length} demanda(s) · {USUARIO_LOGADO}
            </span>
          </div>

          <div className="pc-viz-grid">
            {show('Métrica') && (
              <VizPainel titulo="Resumo do solicitante" modo="Métrica">
                <div className="pc-viz-metric-row">
                  <VizMetrica label="Minhas demandas" value={dash.total} hint="org Cliente" />
                  <VizMetrica label="Em andamento" value={dash.abertas} />
                  <VizMetrica label="Aguardando minha ação" value={dash.aguardaAcao} />
                  <VizMetrica label="% no prazo" value={`${dash.pctPrazo}%`} hint="SLA" />
                </div>
              </VizPainel>
            )}

            {show('Gráfico de Pizza') && (
              <VizPainel titulo="Onde estão minhas demandas" modo="Gráfico de Pizza">
                <VizPizza slices={dash.porFase} />
              </VizPainel>
            )}

            {show('Gráfico de Rosca') && (
              <VizPainel titulo="Situação de SLA" modo="Gráfico de Rosca">
                <VizPizza slices={dash.porSla} donut />
              </VizPainel>
            )}

            {show('Gráfico de Barras') && (
              <VizPainel titulo="Demandas por solução" modo="Gráfico de Barras">
                <VizColunas items={dash.porSolucao} horizontal />
              </VizPainel>
            )}

            {show('Gráfico de Colunas') && (
              <VizPainel titulo="Aberturas por mês" modo="Gráfico de Colunas">
                <VizColunas
                  items={dash.rowsVolume.map((r) => ({ label: r.label, value: r.values[0] }))}
                />
              </VizPainel>
            )}

            {show('Gráfico de Colunas e Linhas') && (
              <VizPainel titulo="Aberturas e % no prazo" modo="Gráfico de Colunas e Linhas">
                <VizColunasLinhas
                  rows={dash.rowsVolume.map((r) => ({
                    label: r.label,
                    values: [r.values[0], r.values[2]],
                  }))}
                  seriesNames={['Aberturas', '% no prazo']}
                />
              </VizPainel>
            )}

            {show('Gráfico de Linhas') && (
              <VizPainel titulo="Evolução das minhas aberturas" modo="Gráfico de Linhas">
                <VizLinhas
                  rows={dash.rowsVolume.map((r) => ({ label: r.label, values: [r.values[0]] }))}
                  seriesNames={['Aberturas']}
                />
              </VizPainel>
            )}

            {show('Gráfico de Área') && (
              <VizPainel titulo="Acumulado das minhas demandas" modo="Gráfico de Área">
                <VizArea rows={dash.acumuladoSimples} seriesNames={['Total']} mode="simples" />
              </VizPainel>
            )}

            {show('Mapa de Marcadores') && (
              <VizPainel titulo="Pipeline do meu fluxo" modo="Mapa de Marcadores">
                <VizMapaMarcadores items={dash.pipeline} />
              </VizPainel>
            )}

            {show('Listagem em Cards') && (
              <VizPainel titulo="Aguardando minha ação" modo="Listagem em Cards">
                {dash.pendentesAcao.length === 0 ? (
                  <p className="pc-muted">Nenhuma demanda aguardando ação do solicitante.</p>
                ) : (
                  <VizCards
                    cards={dash.pendentesAcao.map((d) => ({
                      title: d.numero,
                      subtitle: d.descricao,
                      badge: d.status,
                      meta: `${d.produtoSolucao} · ${d.slaStatus ?? 'No prazo'}`,
                    }))}
                  />
                )}
              </VizPainel>
            )}

            {show('Tabela') && (
              <VizPainel titulo="Resumo por status" modo="Tabela">
                <VizTabela
                  headers={['Status', 'Qtd', 'Etapa', 'Estágio']}
                  rows={dash.tabelaStatus}
                />
              </VizPainel>
            )}
          </div>
        </>
      )}
    </section>
  )
}
