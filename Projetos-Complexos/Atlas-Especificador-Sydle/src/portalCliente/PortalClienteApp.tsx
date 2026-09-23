import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import CadastroOrganizacionalPage from './CadastroOrganizacionalPage'
import DashPage from './DashPage'
import DemandasPage from './DemandasPage'
import MeuPainelPage from './MeuPainelPage'
import MeusDadosPage from './MeusDadosPage'
import { USUARIO_PORTAL_INICIAIS } from './portalClientePessoaData'
import {
  orcamentosAceitosParaOs,
  demandaParaSolicitacaoPortal,
  demandaParaPainel,
  avaliarSaudeValores,
  CONTRATOS_CLIENTE as CONTRATOS_DEMANDA,
} from './portalClienteDemandaData'
import { useDemandasShared } from '../shared/demandaSharedStore'
import type { SolicitacaoPainel } from './portalClientePainelData'
import {
  CATALOGO_MTI,
  CONTRATOS_CLIENTE,
  ORDENS_SERVICO,
  SOLICITACOES_INICIAIS,
  SOLUCOES_COTACAO,
  formatBRL,
  labelStatusContrato,
  pctConsumido,
  type CatalogoItem,
  type CatalogoOrigem,
  type CotacaoItem,
  type OrdemServico,
  type Solicitacao,
} from './portalClienteData'

type PageId =
  | 'home'
  | 'painel'
  | 'dash'
  | 'cadastro-org'
  | 'demandas'
  | 'meus-dados'
  | 'cotacao'
  | 'contratos'
  | 'catalogo'
  | 'ordens-servico'
  | 'ativos'

/** Dropdown Serviços — padrão Sydle (ITSM). */
const SERVICOS_MENU: { id: PageId; label: string; icon: string }[] = [
  { id: 'dash', label: 'Dash', icon: 'dashboard' },
  { id: 'demandas', label: 'Demandas', icon: 'inbox' },
  { id: 'cotacao', label: 'Solicitar cotação', icon: 'request_quote' },
  { id: 'contratos', label: 'Meus contratos', icon: 'description' },
  { id: 'catalogo', label: 'Catálogo MTI', icon: 'category' },
  { id: 'ordens-servico', label: 'Ordens de serviço', icon: 'assignment' },
  { id: 'ativos', label: 'Ativos', icon: 'dns' },
  { id: 'cadastro-org', label: 'Cadastro da organização', icon: 'domain_add' },
  { id: 'meus-dados', label: 'Meus dados', icon: 'badge' },
]

/** Cards da home — layout Sydle (3 colunas). */
const HOME_SERVICOS: { id: PageId; title: string; desc: ReactNode; icon: string }[] = [
  {
    id: 'dash',
    title: 'Dash',
    desc: (
      <>
        Saldo, OS abertas, provisionado e <strong>consumo</strong> do contrato.
      </>
    ),
    icon: 'dashboard',
  },
  {
    id: 'meus-dados',
    title: 'Meus dados',
    desc: 'Dados do colaborador logado',
    icon: 'badge',
  },
  {
    id: 'catalogo',
    title: 'Catálogo MTI',
    desc: (
      <>
        Catálogo completo em <strong>Produção</strong> — itens no contrato e ausentes.
      </>
    ),
    icon: 'folder',
  },
  {
    id: 'cadastro-org',
    title: 'Cadastro da organização',
    desc: (
      <>
        Habilitação MIPP — documentos, progresso, ajustes <strong>MTI</strong> e envio para análise.
      </>
    ),
    icon: 'domain_add',
  },
  {
    id: 'demandas',
    title: 'Demandas',
    desc: (
      <>
        Abra e acompanhe demandas vinculadas ao <strong>contrato</strong> de gestão.
      </>
    ),
    icon: 'inbox',
  },
]

function newCotacaoItem(cat: CatalogoItem): CotacaoItem {
  return {
    id: crypto.randomUUID(),
    origem: cat.origem,
    codigoAtlas: cat.codigoAtlas,
    descricao: cat.descricao,
    solucao: cat.solucao,
    quantidade: 1,
    valorUnitario: cat.valorUnitario,
  }
}

export default function PortalClienteApp() {
  const [page, setPage] = useState<PageId>('home')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(SOLICITACOES_INICIAIS)
  const [ordens, setOrdens] = useState<OrdemServico[]>(ORDENS_SERVICO)
  const [contratos, setContratos] = useState(CONTRATOS_CLIENTE)
  const [filtroVersaoApostilada, setFiltroVersaoApostilada] = useState(true)

  const [cotSolucao, setCotSolucao] = useState(SOLUCOES_COTACAO[0])
  const [cotItens, setCotItens] = useState<CotacaoItem[]>([])
  const [cotFiltroOrigem, setCotFiltroOrigem] = useState<CatalogoOrigem | ''>('')

  const [catFiltroContrato, setCatFiltroContrato] = useState<'todos' | 'contratado' | 'ausente'>('todos')
  const [catFiltroSolucao, setCatFiltroSolucao] = useState('')

  const [osFormOpen, setOsFormOpen] = useState(false)
  const [osContrato, setOsContrato] = useState(CONTRATOS_CLIENTE[0].numero)
  const [osCatalogo, setOsCatalogo] = useState('')
  const [osDescricao, setOsDescricao] = useState('')
  const [osItensSel, setOsItensSel] = useState<string[]>([])
  const [osSecretaria, setOsSecretaria] = useState('')
  const [osNatureza, setOsNatureza] = useState<'Serviço' | 'Licença'>('Serviço')
  const [osOrcamentoPrevio, setOsOrcamentoPrevio] = useState(false)
  const [osOrigem, setOsOrigem] = useState<'Independente' | 'Orçamento'>('Independente')
  const [osOrcamentoRef, setOsOrcamentoRef] = useState('')
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false)
  const [menuServicosAberto, setMenuServicosAberto] = useState(false)
  const [abrirDemandaNova, setAbrirDemandaNova] = useState(false)
  const [painelDemandaExtras, setPainelDemandaExtras] = useState<SolicitacaoPainel[]>([])
  const [demandasShared] = useDemandasShared()
  const menuPerfilRef = useRef<HTMLDivElement>(null)
  const menuServicosRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const demSol = demandasShared.map(demandaParaSolicitacaoPortal)
    const demIds = new Set(demSol.map((s) => s.id))
    setSolicitacoes((prev) => {
      const semDemandasAntigas = prev.filter((s) => s.tipo !== 'Demanda' || !demIds.has(s.id))
      const outras = semDemandasAntigas.filter((s) => s.tipo !== 'Demanda')
      return [...demSol, ...outras]
    })
  }, [demandasShared])

  useEffect(() => {
    if (!menuPerfilAberto && !menuServicosAberto) return
    function onDocClick(e: MouseEvent) {
      if (menuPerfilRef.current && !menuPerfilRef.current.contains(e.target as Node)) {
        setMenuPerfilAberto(false)
      }
      if (menuServicosRef.current && !menuServicosRef.current.contains(e.target as Node)) {
        setMenuServicosAberto(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuPerfilAberto(false)
        setMenuServicosAberto(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuPerfilAberto, menuServicosAberto])

  const versoesApostiladas = useMemo(
    () => new Set(contratos.map((c) => c.versaoCatalogoApostilada)),
    [contratos],
  )

  const catalogoProducao = useMemo(() => {
    const base = CATALOGO_MTI.filter((c) => c.ambiente === 'Produção')
    if (!filtroVersaoApostilada) return base
    return base.filter((c) => versoesApostiladas.has(c.versaoCatalogo))
  }, [filtroVersaoApostilada, versoesApostiladas])

  const filteredCatalogo = useMemo(() => {
    let list = catalogoProducao
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.descricao.toLowerCase().includes(q) ||
          c.codigoAtlas.toLowerCase().includes(q) ||
          c.solucao.toLowerCase().includes(q),
      )
    }
    if (catFiltroContrato === 'contratado') {
      list = list.filter((c) => c.statusNoContrato === 'contratado' || c.statusNoContrato === 'parcial')
    } else if (catFiltroContrato === 'ausente') {
      list = list.filter((c) => c.statusNoContrato === 'ausente')
    }
    if (catFiltroSolucao) list = list.filter((c) => c.solucao === catFiltroSolucao)
    return list
  }, [catalogoProducao, search, catFiltroContrato, catFiltroSolucao])

  const cotacaoCatalogo = useMemo(() => {
    let list = catalogoProducao
    if (cotFiltroOrigem) list = list.filter((c) => c.origem === cotFiltroOrigem)
    const sol = cotSolucao.split('—')[0].trim()
    return list.filter((c) => c.solucao.toUpperCase().includes(sol.replace('MTI ', '').split(' ')[0].toUpperCase()) || sol.includes(c.solucao))
  }, [catalogoProducao, cotFiltroOrigem, cotSolucao])

  const cotacaoTotal = useMemo(
    () => cotItens.reduce((acc, i) => acc + i.quantidade * i.valorUnitario, 0),
    [cotItens],
  )

  const solucoesUnicas = useMemo(() => [...new Set(catalogoProducao.map((c) => c.solucao))], [catalogoProducao])

  const catalogosPorVersao = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of catalogoProducao) {
      const key = `${c.solucao} — ${c.versaoCatalogo}`
      if (!map.has(key)) map.set(key, c.versaoCatalogo)
    }
    return [...map.keys()]
  }, [catalogoProducao])

  const itensContratoParaOs = useMemo(
    () =>
      catalogoProducao.filter(
        (c) => c.statusNoContrato === 'contratado' || c.statusNoContrato === 'parcial',
      ),
    [catalogoProducao],
  )

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3500)
  }

  function navigate(target: PageId, opts?: { novaDemanda?: boolean }) {
    setPage(target)
    setMenuPerfilAberto(false)
    setMenuServicosAberto(false)
    setAbrirDemandaNova(Boolean(opts?.novaDemanda && target === 'demandas'))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function addToCotacao(cat: CatalogoItem) {
    setCotItens((rows) => [...rows, newCotacaoItem(cat)])
    showToast(`"${cat.descricao.slice(0, 40)}…" adicionado à cotação`)
  }

  function enviarCotacao(e: FormEvent) {
    e.preventDefault()
    if (cotItens.length === 0) {
      showToast('Adicione ao menos um item dos catálogos')
      return
    }
    const numero = `COT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 8999))}`
    const demNumero = `DEM-${new Date().getFullYear()}-${String(Math.floor(50 + Math.random() * 40)).padStart(4, '0')}`
    setSolicitacoes((s) => [
      {
        id: crypto.randomUUID(),
        tipo: 'Cotação',
        nome: `${numero} — ${cotSolucao.split('/')[0].trim()}`,
        status: 'Pendente',
        situacao: 'Ativa',
        atualizadoEm: new Date().toISOString().slice(0, 10),
      },
      {
        id: crypto.randomUUID(),
        tipo: 'Demanda',
        nome: `${demNumero} — gerada pela cotação ${numero}`,
        status: 'Pendente',
        situacao: 'Ativa',
        atualizadoEm: new Date().toISOString().slice(0, 10),
      },
      ...s,
    ])
    setCotItens([])
    showToast(`Cotação ${numero} enviada · demanda ${demNumero} aberta na MTI`)
    navigate('demandas')
  }

  function apostilarContrato(contratoId: string) {
    setContratos((rows) =>
      rows.map((c) => {
        if (c.id !== contratoId || !c.versaoCatalogoPendente) return c
        return {
          ...c,
          versaoCatalogoApostilada: c.versaoCatalogoPendente,
          versaoCatalogoPendente: undefined,
        }
      }),
    )
    showToast('Nova versão do catálogo liberada no portal.')
  }

  const orcamentosAceitos = useMemo(() => orcamentosAceitosParaOs(demandasShared), [demandasShared])

  function abrirOs(e: FormEvent) {
    e.preventDefault()
    if (osOrigem === 'Orçamento' && !osOrcamentoRef) {
      showToast('Selecione o orçamento aceito que originará a OS.')
      return
    }
    if (!osCatalogo || !osDescricao || osItensSel.length === 0) {
      showToast('Informe catálogo/versão, descrição e itens do contrato')
      return
    }
    if (osNatureza === 'Serviço' && osOrigem === 'Independente' && !osOrcamentoPrevio) {
      showToast('Serviço exige orçamento prévio de estimativa antes do consumo.')
      return
    }
    const orc = orcamentosAceitos.find((o) => o.orcamentoNumero === osOrcamentoRef)
    const [catNome, versao] = osCatalogo.includes('—')
      ? [osCatalogo.split('—')[0].trim(), osCatalogo.split('—').pop()!.trim()]
      : [osCatalogo, orc?.catalogoVersao ?? 'v1.0']
    const valor =
      osOrigem === 'Orçamento' && orc
        ? orc.valorTotal
        : osItensSel.reduce((acc, id) => {
            const item = catalogoProducao.find((c) => c.id === id)
            return acc + (item?.valorUnitario ?? 0)
          }, 0)
    const numero = `OS-${new Date().getFullYear()}-${String(Math.floor(10 + Math.random() * 89)).padStart(4, '0')}`
    const secNome =
      contratos
        .find((c) => c.numero === osContrato)
        ?.secretarias?.find((s) => s.id === osSecretaria)?.nome ?? undefined
    const nova: OrdemServico = {
      id: crypto.randomUUID(),
      numero,
      contrato: osContrato,
      catalogoVersao: versao,
      catalogoNome: catNome,
      descricao: secNome ? `${osDescricao} · ${secNome}` : osDescricao,
      status: 'Rascunho',
      abertura: new Date().toISOString().slice(0, 10),
      valor,
      origem: osOrigem,
      orcamentoRef: osOrigem === 'Orçamento' ? osOrcamentoRef : undefined,
      secretaria: secNome,
    }
    setOrdens((o) => [nova, ...o])
    setSolicitacoes((s) => [
      {
        id: crypto.randomUUID(),
        tipo: 'OS',
        nome: `${numero} — ${osDescricao.slice(0, 50)}`,
        status: 'Pendente',
        situacao: 'Ativa',
        atualizadoEm: new Date().toISOString().slice(0, 10),
      },
      ...s,
    ])
    setOsFormOpen(false)
    setOsDescricao('')
    setOsItensSel([])
    setOsSecretaria('')
    setOsOrcamentoPrevio(false)
    setOsOrigem('Independente')
    setOsOrcamentoRef('')
    showToast(
      `${numero} criada — ${osOrigem === 'Orçamento' ? `via ${osOrcamentoRef}` : 'independente'} · snapshot cat. ${versao}`,
    )
    navigate('ordens-servico')
  }

  return (
    <div className="pc-portal">
      <header className="pc-a11y" aria-label="Acessibilidade">
        <div className="pc-a11y__links">
          <button type="button">Ir para o conteúdo [1]</button>
          <button type="button">Ir para o menu [2]</button>
          <button type="button">Ir para a busca [3]</button>
          <button type="button">Ir para o rodapé [4]</button>
          <button type="button">Alto contraste [5]</button>
          <button type="button">+ A [6]</button>
          <button type="button">- A [7]</button>
        </div>
        <span>Acessibilidade</span>
      </header>

      <header className="pc-header">
        <button type="button" className="pc-brand" onClick={() => navigate('home')}>
          <span className="pc-brand__mti">MTI</span>
          <span className="pc-brand__text pc-brand__text--sub">
            Empresa Mato-grossense de Tecnologia da Informação
          </span>
        </button>
        <nav className="pc-nav" aria-label="Principal">
          <button
            type="button"
            className={`pc-nav__item${page === 'home' ? ' pc-nav__item--active' : ''}`}
            onClick={() => navigate('home')}
          >
            <span className="material-symbols-outlined" aria-hidden>
              home
            </span>
            Página inicial
          </button>
          <button
            type="button"
            className={`pc-nav__item${page === 'painel' ? ' pc-nav__item--active' : ''}`}
            onClick={() => navigate('painel')}
          >
            <span className="material-symbols-outlined" aria-hidden>
              person
            </span>
            Meu painel
          </button>
          <button
            type="button"
            className={`pc-nav__item${page === 'dash' ? ' pc-nav__item--active' : ''}`}
            onClick={() => navigate('dash')}
          >
            <span className="material-symbols-outlined" aria-hidden>
              dashboard
            </span>
            Dash
          </button>
          <div className="pc-nav-servicos" ref={menuServicosRef}>
            <button
              type="button"
              className={`pc-nav__item pc-nav__item--servicos${menuServicosAberto ? ' pc-nav__item--active' : ''}`}
              aria-haspopup="menu"
              aria-expanded={menuServicosAberto}
              onClick={() => setMenuServicosAberto((v) => !v)}
            >
              <span className="material-symbols-outlined" aria-hidden>
                work
              </span>
              Serviços
              <span className="material-symbols-outlined pc-nav__chevron" aria-hidden>
                expand_more
              </span>
            </button>
            {menuServicosAberto && (
              <div className="pc-nav-servicos__menu" role="menu">
                {SERVICOS_MENU.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    className={`pc-nav-servicos__item${page === item.id ? ' pc-nav-servicos__item--active' : ''}`}
                    onClick={() => navigate(item.id)}
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="pc-header__actions">
          <button type="button" className="pc-icon-btn" aria-label="Notificações">
            <span className="material-symbols-outlined">notifications</span>
            <span className="pc-icon-btn__dot" aria-hidden />
          </button>
          <div className="pc-perfil" ref={menuPerfilRef}>
            <button
              type="button"
              className={`pc-avatar${page === 'meus-dados' ? ' pc-avatar--active' : ''}`}
              aria-label="Perfil do usuário"
              aria-haspopup="menu"
              aria-expanded={menuPerfilAberto}
              onClick={() => setMenuPerfilAberto((v) => !v)}
            >
              {USUARIO_PORTAL_INICIAIS}
            </button>
            {menuPerfilAberto && (
              <div className="pc-perfil__menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="pc-perfil__item"
                  onClick={() => navigate('meus-dados')}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    manage_accounts
                  </span>
                  Meus dados
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="pc-perfil__item"
                  onClick={() => navigate('painel')}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    person
                  </span>
                  Meu painel
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="pc-main" className="pc-main">
        {page === 'home' && (
          <>
            <section className="pc-hero">
              <h1>PORTAL DO CLIENTE - ATLAS</h1>
              <p>
                Monte cotações a partir dos catálogos homologados, acompanhe contratos e saldos, consulte o
                catálogo MTI na íntegra e abra ordens de serviço vinculadas ao seu contrato de gestão.
              </p>
              <div className="pc-hero__search">
                <span className="material-symbols-outlined" aria-hidden>
                  search
                </span>
                <input
                  type="search"
                  placeholder="Buscar"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Buscar"
                />
              </div>
            </section>

            <section className="pc-home-body">
              <div className="pc-home-body__inner">
                <h2 className="pc-section-title">SAÚDE DOS CONTRATOS</h2>
                <div className="pc-saude-grid" aria-label="Saúde dos contratos">
                  {CONTRATOS_DEMANDA.map((ct) => {
                    const saude = avaliarSaudeValores(ct.saldoTotal, ct.saldoConsumido, ct.provisionado)
                    const tone =
                      saude.status === 'Saudável' ? 'ok' : saude.status === 'Atenção' ? 'warn' : 'crit'
                    const saldo = ct.saldoTotal - ct.saldoConsumido
                    const pct =
                      ct.saldoTotal > 0
                        ? Math.min(100, Math.round((ct.saldoConsumido / ct.saldoTotal) * 100))
                        : 0
                    return (
                      <article key={ct.numero} className={`pc-saude-card pc-saude-card--${tone}`}>
                        <header>
                          <strong>{ct.numero}</strong>
                          <span className={`pc-saude-pill pc-saude-pill--${tone}`}>{saude.status}</span>
                        </header>
                        <p>{ct.nome}</p>
                        <p className="pc-saude-card__msg">{saude.mensagem}</p>
                        <dl>
                          <div>
                            <dt>Saldo global</dt>
                            <dd>{formatBRL(saldo)}</dd>
                          </div>
                          <div>
                            <dt>OSs abertas</dt>
                            <dd>{ct.osAbertas}</dd>
                          </div>
                          <div>
                            <dt>Total provisionado</dt>
                            <dd>{formatBRL(ct.provisionado)}</dd>
                          </div>
                          <div>
                            <dt>Consumo / execução</dt>
                            <dd>
                              {formatBRL(ct.saldoConsumido)} · {pct}%
                            </dd>
                          </div>
                        </dl>
                      </article>
                    )
                  })}
                </div>

                <h2 className="pc-section-title">SERVIÇOS DO PORTAL</h2>
                <div className="pc-service-grid pc-service-grid--home">
                  {HOME_SERVICOS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="pc-service-card pc-service-card--sydle"
                      onClick={() => navigate(s.id)}
                    >
                      <div>
                        <h3>{s.title}</h3>
                        <p>{s.desc}</p>
                      </div>
                      <span className="material-symbols-outlined" aria-hidden>
                        {s.icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'ativos' && (
          <section className="pc-page">
            <Breadcrumb onHome={() => navigate('home')} trail={['Ativos']} />
            <h1>Ativos</h1>
            <p className="pc-lead">
              Visão puxada da ferramenta de ativos (fonte 20/07): VMs, jobs de backup e infraestrutura.
              Integração mock — submenu por tipo.
            </p>
            <div className="pc-service-grid">
              {[
                { t: 'Máquinas virtuais', d: 'Inventário de VMs vinculadas ao contrato', i: 'cloud' },
                { t: 'Jobs de backup', d: 'Rotinas e status de proteção', i: 'backup' },
                { t: 'Infraestrutura', d: 'Componentes de rede e storage', i: 'lan' },
              ].map((a) => (
                <button
                  key={a.t}
                  type="button"
                  className="pc-service-card"
                  onClick={() => showToast(`${a.t}: integração de ativos em evolução`)}
                >
                  <div>
                    <h3>{a.t}</h3>
                    <p>{a.d}</p>
                  </div>
                  <span className="material-symbols-outlined" aria-hidden>
                    {a.i}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {page === 'cadastro-org' && (
          <CadastroOrganizacionalPage onHome={() => navigate('home')} onToast={showToast} />
        )}

        {page === 'demandas' && (
          <DemandasPage
            onHome={() => navigate('home')}
            onToast={showToast}
            abrirNovaAoMontar={abrirDemandaNova}
            modo="cliente"
            onDemandaCriada={(d) => {
              setAbrirDemandaNova(false)
              setSolicitacoes((s) => [demandaParaSolicitacaoPortal(d), ...s])
              setPainelDemandaExtras((rows) => [demandaParaPainel(d), ...rows])
            }}
          />
        )}

        {page === 'dash' && (
          <DashPage
            onHome={() => navigate('home')}
            modo="cliente"
            onAbrirDemandas={() => navigate('demandas')}
          />
        )}

        {page === 'meus-dados' && (
          <MeusDadosPage onHome={() => navigate('home')} onToast={showToast} />
        )}

        {page === 'painel' && (
          <MeuPainelPage
            onHome={() => navigate('home')}
            onToast={showToast}
            extras={painelDemandaExtras}
          />
        )}

        {page === 'cotacao' && (
          <section className="pc-page">
            <Breadcrumb onHome={() => navigate('home')} trail={['Nova cotação']} />
            <h1>Montar cotação</h1>
            <p className="pc-lead">
              Selecione a solução e adicione itens dos catálogos (versão do contrato). A cotação gera
              demanda para análise da MTI. Serviço: orçamento prévio antes do consumo; licença: orçamento
              pode ser dispensável.
            </p>
            <form onSubmit={enviarCotacao}>
              <div className="pc-form-block">
                <label>
                  Solução / linha de cotação <span className="pc-req">*</span>
                  <select value={cotSolucao} onChange={(e) => setCotSolucao(e.target.value)}>
                    {SOLUCOES_COTACAO.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Filtrar catálogo de origem
                  <select
                    value={cotFiltroOrigem}
                    onChange={(e) => setCotFiltroOrigem(e.target.value as CatalogoOrigem | '')}
                  >
                    <option value="">Todos</option>
                    <option value="Produtos vigentes">Produtos vigentes</option>
                    <option value="Licenças comerciais">Licenças comerciais</option>
                    <option value="Serviços comerciais">Serviços comerciais</option>
                  </select>
                </label>
              </div>

              <h2 className="pc-h2">Catálogo disponível (Produção)</h2>
              <CatalogTable
                items={cotacaoCatalogo}
                showContrato={false}
                actionLabel="Adicionar"
                onAction={addToCotacao}
              />

              <h2 className="pc-h2">Itens da cotação</h2>
              {cotItens.length === 0 ? (
                <p className="pc-empty">Nenhum item adicionado.</p>
              ) : (
                <div className="pc-table-wrap">
                  <table className="pc-table">
                    <thead>
                      <tr>
                        <th>Origem</th>
                        <th>Código</th>
                        <th>Descrição</th>
                        <th>Qtd</th>
                        <th>Valor unit.</th>
                        <th>Total</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {cotItens.map((row) => (
                        <tr key={row.id}>
                          <td>{row.origem}</td>
                          <td>{row.codigoAtlas}</td>
                          <td>{row.descricao}</td>
                          <td>
                            <input
                              type="number"
                              min={1}
                              className="pc-input-inline"
                              value={row.quantidade}
                              onChange={(e) => {
                                const q = Math.max(1, Number(e.target.value))
                                setCotItens((rows) =>
                                  rows.map((r) => (r.id === row.id ? { ...r, quantidade: q } : r)),
                                )
                              }}
                            />
                          </td>
                          <td>{formatBRL(row.valorUnitario)}</td>
                          <td>{formatBRL(row.quantidade * row.valorUnitario)}</td>
                          <td>
                            <button
                              type="button"
                              className="pc-link-btn"
                              onClick={() => setCotItens((rows) => rows.filter((r) => r.id !== row.id))}
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={5} className="pc-total-label">
                          Valor total da cotação
                        </td>
                        <td colSpan={2}>
                          <strong>{formatBRL(cotacaoTotal)}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              <div className="pc-form-actions">
                <button type="button" className="pc-btn" onClick={() => setCotItens([])}>
                  Limpar
                </button>
                <button type="submit" className="pc-btn pc-btn--primary">
                  Enviar cotação
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {page === 'contratos' && (
          <section className="pc-page">
            <Breadcrumb onHome={() => navigate('home')} trail={['Meus contratos']} />
            <h1>Meus contratos</h1>
            <p className="pc-lead">
              Contratos do cliente — saldo global e por secretaria/unidade, vigência e consumo.
            </p>
            <div className="pc-contract-grid">
              {contratos.map((ct) => (
                <article key={ct.id} className="pc-contract-card">
                  <header>
                    <h3>{ct.numero}</h3>
                    <span className="pc-dem-plain">{ct.status}</span>
                  </header>
                  <p className="pc-contract-card__parceria">{ct.parceria}</p>
                  <dl className="pc-dl">
                    <div>
                      <dt>Vigência</dt>
                      <dd>
                        {new Date(ct.vigenciaInicio).toLocaleDateString('pt-BR')} —{' '}
                        {new Date(ct.vigenciaFim).toLocaleDateString('pt-BR')}
                      </dd>
                    </div>
                    <div>
                      <dt>Versão apostilada</dt>
                      <dd>
                        <strong>{ct.versaoCatalogoApostilada}</strong>
                        {ct.versaoCatalogoPendente && (
                          <span className="pc-muted">
                            {' '}
                            · pendente {ct.versaoCatalogoPendente} (não visível até apostila)
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Itens contratados</dt>
                      <dd>{ct.itensContratados}</dd>
                    </div>
                    <div>
                      <dt>Saldo consumido</dt>
                      <dd>
                        {formatBRL(ct.saldoConsumido)} / {formatBRL(ct.saldoTotal)}
                      </dd>
                    </div>
                  </dl>
                  {ct.secretarias && ct.secretarias.length > 0 && (
                    <div className="pc-secretarias" style={{ marginTop: 8 }}>
                      <p className="pc-muted" style={{ margin: '0 0 4px', fontSize: 12 }}>
                        Rateio / segregação por secretaria
                      </p>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                        {ct.secretarias.map((s) => (
                          <li key={s.id}>
                            {s.nome}: {formatBRL(s.saldoConsumido)} / {formatBRL(s.saldoAlocado)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="pc-progress">
                    <div
                      className="pc-progress__bar"
                      style={{ width: `${pctConsumido(ct.saldoConsumido, ct.saldoTotal)}%` }}
                    />
                  </div>
                  <p className="pc-progress__label">
                    {pctConsumido(ct.saldoConsumido, ct.saldoTotal)}% do saldo utilizado
                  </p>
                  <div className="pp-actions" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="pc-btn pc-btn--sm"
                      onClick={() => {
                        setCatFiltroContrato('contratado')
                        navigate('catalogo')
                      }}
                    >
                      Ver itens do contrato
                    </button>
                    {ct.versaoCatalogoPendente && (
                      <button
                        type="button"
                        className="pc-btn pc-btn--sm pc-btn--primary"
                        onClick={() => apostilarContrato(ct.id)}
                        title="Simula apostilamento MTI/jurídico liberando a nova versão no portal"
                      >
                        Simular apostila → {ct.versaoCatalogoPendente}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <h2 className="pc-h2">Consumo por item (catálogo)</h2>
            <CatalogTable
              items={catalogoProducao.filter((c) => c.statusNoContrato !== 'ausente')}
              showContrato
              showConsumo
            />
          </section>
        )}

        {page === 'catalogo' && (
          <section className="pc-page pc-org-main">
            <Breadcrumb onHome={() => navigate('home')} trail={['Catálogo de Serviços — Ativo', 'Catálogo MTI']} />
            <h1>Catálogo MTI</h1>
            <div className="pc-consumo-aviso" role="note">
              <strong>Cliente não cadastra catálogo nem produto.</strong> Cadastro e envio são do{' '}
              <em>Portal do Parceiro</em>; análise, publicação e versão são do <em>backoffice MTI</em>.
              Aqui você consulta a versão vinculada ao seu contrato — cotação, demanda, orçamento e OS.
            </div>
            <div className="sy-accordion pp-catalog-shell" style={{ border: '1px solid #e2e8f0', borderRadius: 4, paddingBottom: '0.5rem' }}>
              <div className="sy-accordion__item sy-accordion__item--open">
                <div className="sy-accordion__trigger" style={{ cursor: 'default' }}>
                  <span className="material-symbols-outlined" aria-hidden>
                    filter_list
                  </span>
                  <span className="sy-accordion__title">Filtros de consulta</span>
                </div>
                <div className="sy-accordion__panel">
            <div className="pc-form-block pc-form-block--filters">
              <label>
                Buscar
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Código, descrição, solução…"
                />
              </label>
              <label>
                No contrato
                <select
                  value={catFiltroContrato}
                  onChange={(e) => setCatFiltroContrato(e.target.value as typeof catFiltroContrato)}
                >
                  <option value="todos">Todos</option>
                  <option value="contratado">No contrato / parcial</option>
                  <option value="ausente">Ausente do contrato</option>
                </select>
              </label>
              <label>
                Solução
                <select value={catFiltroSolucao} onChange={(e) => setCatFiltroSolucao(e.target.value)}>
                  <option value="">Todas</option>
                  {solucoesUnicas.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Versão
                <select
                  value={filtroVersaoApostilada ? 'apostilada' : 'todas'}
                  onChange={(e) => setFiltroVersaoApostilada(e.target.value === 'apostilada')}
                >
                  <option value="apostilada">Só apostiladas no contrato</option>
                  <option value="todas">Todas em Produção (demo)</option>
                </select>
              </label>
            </div>
                </div>
              </div>
              <div className="sy-accordion__item sy-accordion__item--open">
                <div className="sy-accordion__trigger" style={{ cursor: 'default' }}>
                  <span className="material-symbols-outlined" aria-hidden>
                    inventory_2
                  </span>
                  <span className="sy-accordion__title">Itens disponíveis ({filteredCatalogo.length})</span>
                </div>
                <div className="sy-accordion__panel">
            <div className="pc-legend">
              <span className="pc-legend__item">
                <span className="pc-dot pc-dot--ok" /> No contrato
              </span>
              <span className="pc-legend__item">
                <span className="pc-dot pc-dot--warn" /> Parcial
              </span>
              <span className="pc-legend__item">
                <span className="pc-dot pc-dot--off" /> Ausente
              </span>
            </div>
            <CatalogTable items={filteredCatalogo} showContrato showVersao />
                </div>
              </div>
            </div>
            <div className="pc-org-form-footer">
              <button type="button" className="pc-org-form-footer__cancel" onClick={() => navigate('home')}>
                <span className="material-symbols-outlined" aria-hidden>
                  close
                </span>
                Cancelar
              </button>
              <button type="button" className="pc-org-form-footer__primary" onClick={() => navigate('cotacao')}>
                <span className="material-symbols-outlined" aria-hidden>
                  check
                </span>
                Nova cotação
              </button>
            </div>
          </section>
        )}

        {page === 'ordens-servico' && (
          <section className="pc-page">
            <Breadcrumb onHome={() => navigate('home')} trail={['Ordens de serviço']} />
            <div className="pc-page__head-row">
              <div>
                <h1>Ordens de serviço</h1>
                <p className="pc-lead">
                  Consulte OS emitidas ou abra uma nova ordem informando catálogo e versão.
                </p>
              </div>
              <button type="button" className="pc-btn pc-btn--primary" onClick={() => setOsFormOpen(true)}>
                Nova OS
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="pc-table-wrap">
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Origem</th>
                    <th>Contrato</th>
                    <th>Catálogo / versão</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Valor</th>
                    <th>Abertura</th>
                  </tr>
                </thead>
                <tbody>
                  {ordens.map((os) => (
                    <tr key={os.id}>
                      <td>{os.numero}</td>
                      <td>
                        {os.origem === 'Orçamento'
                          ? `Orçamento ${os.orcamentoRef ?? ''}`
                          : os.origem ?? 'Independente'}
                      </td>
                      <td>{os.contrato}</td>
                      <td>
                        {os.catalogoNome} <span className="pc-muted">({os.catalogoVersao})</span>
                      </td>
                      <td>{os.descricao}</td>
                      <td>
                        <span className="pc-dem-plain">{os.status}</span>
                      </td>
                      <td>{formatBRL(os.valor)}</td>
                      <td>{new Date(os.abertura).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <footer className="pc-footer">
        <div className="pc-footer__inner">
          <div className="pc-footer__brand">
            <span className="pc-brand__mti">MTI</span>
            <span className="pc-brand__text pc-brand__text--sub">
              Empresa Mato-grossense de Tecnologia da Informação
            </span>
          </div>
        </div>
        <div className="pc-footer__powered-bar">
          <p className="pc-footer__powered">Powered by SYDLE</p>
        </div>
      </footer>

      <div className="pc-floats" aria-label="Atalhos flutuantes">
        <button type="button" className="pc-float-btn pc-float-btn--a11y" aria-label="Acessibilidade">
          <span className="material-symbols-outlined">accessibility_new</span>
        </button>
        <button
          type="button"
          className="pc-float-btn pc-float-btn--vlibras"
          aria-label="VLibras"
          title="Conteúdo acessível em Libras"
        >
          <span className="material-symbols-outlined">sign_language</span>
        </button>
      </div>

      {osFormOpen && (
        <div className="pc-modal-backdrop" role="presentation" onClick={() => setOsFormOpen(false)}>
          <form
            className="pc-modal pc-modal--wide"
            role="dialog"
            aria-labelledby="os-modal-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={abrirOs}
          >
            <h2 id="os-modal-title">Nova ordem de serviço</h2>
            <p className="pc-modal__hint">
              A OS pode ser independente ou a partir de orçamento aceito. Serviço exige orçamento
              prévio; licença pode dispensar. A versão do catálogo fica registrada na abertura.
            </p>
            <label>
              Origem da OS
              <select
                value={osOrigem}
                onChange={(e) => {
                  const v = e.target.value as 'Independente' | 'Orçamento'
                  setOsOrigem(v)
                  if (v === 'Orçamento') {
                    setOsOrcamentoPrevio(true)
                    const first = orcamentosAceitos[0]
                    if (first) {
                      setOsOrcamentoRef(first.orcamentoNumero)
                      setOsDescricao(first.descricao)
                      if (first.contrato) setOsContrato(first.contrato)
                    }
                  }
                }}
              >
                <option value="Independente">Independente</option>
                <option value="Orçamento">A partir de orçamento aceito</option>
              </select>
            </label>
            {osOrigem === 'Orçamento' && (
              <label>
                Orçamento aceito <span className="pc-req">*</span>
                <select
                  value={osOrcamentoRef}
                  onChange={(e) => {
                    setOsOrcamentoRef(e.target.value)
                    const o = orcamentosAceitos.find((x) => x.orcamentoNumero === e.target.value)
                    if (o) {
                      setOsDescricao(o.descricao)
                      if (o.contrato) setOsContrato(o.contrato)
                    }
                  }}
                  required
                >
                  <option value="">Selecione…</option>
                  {orcamentosAceitos.map((o) => (
                    <option key={o.orcamentoNumero} value={o.orcamentoNumero}>
                      {o.orcamentoNumero} · {o.demandaNumero} · {formatBRL(o.valorTotal)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Contrato <span className="pc-req">*</span>
              <select value={osContrato} onChange={(e) => setOsContrato(e.target.value)}>
                {contratos.map((c) => (
                  <option key={c.id} value={c.numero}>
                    {c.numero} — {c.parceria} · cat. {c.versaoCatalogoApostilada}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Secretaria / unidade (saldo segregado)
              <select
                value={osSecretaria}
                onChange={(e) => setOsSecretaria(e.target.value)}
              >
                <option value="">Contrato (sem segregação)</option>
                {(contratos.find((c) => c.numero === osContrato)?.secretarias ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} · saldo {formatBRL(s.saldoAlocado - s.saldoConsumido)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Natureza do consumo
              <select value={osNatureza} onChange={(e) => setOsNatureza(e.target.value as 'Serviço' | 'Licença')}>
                <option value="Serviço">Serviço (exige orçamento prévio)</option>
                <option value="Licença">Licença (orçamento pode ser dispensável)</option>
              </select>
            </label>
            {osNatureza === 'Serviço' && osOrigem === 'Independente' && (
              <label className="pc-check-row">
                <input
                  type="checkbox"
                  checked={osOrcamentoPrevio}
                  onChange={(e) => setOsOrcamentoPrevio(e.target.checked)}
                />
                <span>Confirmo orçamento prévio de estimativa aceito</span>
              </label>
            )}
            <label>
              Catálogo e versão <span className="pc-req">*</span>
              <select value={osCatalogo} onChange={(e) => setOsCatalogo(e.target.value)} required>
                <option value="">Selecione…</option>
                {catalogosPorVersao.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Descrição da OS <span className="pc-req">*</span>
              <input
                value={osDescricao}
                onChange={(e) => setOsDescricao(e.target.value)}
                placeholder="Ex.: Treinamento técnico — 4 unidades"
                required
              />
            </label>
            <fieldset className="pc-fieldset-inline">
              <legend>Itens do contrato a consumir</legend>
              {itensContratoParaOs.map((item) => (
                <label key={item.id} className="pc-check-row">
                  <input
                    type="checkbox"
                    checked={osItensSel.includes(item.id)}
                    onChange={(e) => {
                      setOsItensSel((ids) =>
                        e.target.checked ? [...ids, item.id] : ids.filter((x) => x !== item.id),
                      )
                    }}
                  />
                  <span>
                    <strong>{item.codigoAtlas}</strong> — {item.descricao.slice(0, 60)}…
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="pc-modal__actions">
              <button type="button" className="pc-btn" onClick={() => setOsFormOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="pc-btn pc-btn--primary">
                Criar OS
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="pc-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

function Breadcrumb({ onHome, trail }: { onHome: () => void; trail: string[] }) {
  return (
    <nav className="pc-breadcrumb" aria-label="Trilha">
      <button type="button" onClick={onHome}>
        <span className="material-symbols-outlined" aria-hidden>
          home
        </span>
      </button>
      {trail.map((t) => (
        <span key={t}>
          <span>/</span>
          <span>{t}</span>
        </span>
      ))}
    </nav>
  )
}

function CatalogTable({
  items,
  showContrato = true,
  showVersao = false,
  showConsumo = false,
  actionLabel,
  onAction,
}: {
  items: CatalogoItem[]
  showContrato?: boolean
  showVersao?: boolean
  showConsumo?: boolean
  actionLabel?: string
  onAction?: (item: CatalogoItem) => void
}) {
  if (items.length === 0) {
    return <p className="pc-empty">Nenhum item no catálogo de Produção.</p>
  }
  return (
    <div className="pc-table-wrap">
      <table className="pc-table pc-table--catalog">
        <thead>
          <tr>
            <th>Origem</th>
            <th>Código Atlas</th>
            <th>PART</th>
            <th>Descrição</th>
            <th>Solução</th>
            {showVersao && <th>Versão</th>}
            <th>Período mín.</th>
            <th>UG/GO</th>
            <th>Univ./Indiv.</th>
            <th>Valor unit.</th>
            {showContrato && <th>No contrato</th>}
            {showConsumo && <th>Consumo</th>}
            {onAction && <th />}
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className={`pc-row--${c.statusNoContrato}`}>
              <td>{c.origem}</td>
              <td>{c.codigoAtlas}</td>
              <td>{c.partNumber ?? '—'}</td>
              <td>{c.descricao}</td>
              <td>{c.solucao}</td>
              {showVersao && <td>{c.versaoCatalogo}</td>}
              <td>{c.periodoMinimo ?? '—'}</td>
              <td>{c.grupoAtendimento ?? '—'}</td>
              <td>
                {c.universal ? 'U' : '—'}
                {c.individualizado ? '/I' : ''}
              </td>
              <td>{formatBRL(c.valorUnitario)}</td>
              {showContrato && (
                <td>
                  <span className={`pc-tag pc-tag--${c.statusNoContrato}`}>
                    {labelStatusContrato(c.statusNoContrato)}
                  </span>
                </td>
              )}
              {showConsumo && (
                <td>
                  {c.quantidadeContratada != null ? (
                    <>
                      {c.quantidadeConsumida ?? 0} / {c.quantidadeContratada}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              )}
              {onAction && (
                <td>
                  <button type="button" className="pc-btn pc-btn--sm" onClick={() => onAction(c)}>
                    {actionLabel}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
