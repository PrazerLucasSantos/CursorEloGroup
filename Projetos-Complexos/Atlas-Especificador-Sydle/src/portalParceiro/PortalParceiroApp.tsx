import { useMemo, useRef, useState, type ReactNode } from 'react'
import DemandasPage from '../portalCliente/DemandasPage'
import '../portalCliente/portal-cliente.css'
import { useDemandasShared } from '../shared/demandaSharedStore'
import PortalParceiroDashboards from './PortalParceiroDashboards'
import {
  csvTemplate,
  downloadText,
  parseProdutosCsv,
  produtosToCsv,
  produtosToPdfHtml,
} from './portalParceiroCsv'
import {
  CATALOGOS_INICIAIS,
  COBRANCAS,
  COMPLEXIDADES,
  GRUPOS_INICIAIS,
  MODELOS_VENDA,
  PARCEIRO_LOGADO,
  PARCERIAS,
  PERIODOS_MINIMOS,
  STATUS_PRODUTO,
  emptyProduto,
  formatBRL,
  podeEditar,
  podeEnviar,
  pushHistorico,
  type CatalogoParceiro,
  type Complexidade,
  type GrupoParceiro,
  type PeriodoMinimo,
  type ProdutoParceiro,
  type StatusFluxo,
  type StatusProduto,
} from './portalParceiroData'

type PageId = 'home' | 'dashboard' | 'demandas' | 'catalogos' | 'detalhe' | 'importar' | 'dados' | 'grupos' | 'papeis'
type ParecerMti = 'ajuste' | 'aprovar' | 'publicar' | 'reprovar' | 'paralisar'

function AccordionBlock({
  id,
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  icon: string
  open: boolean
  onToggle: (id: string) => void
  children: ReactNode
}) {
  return (
    <div className={`sy-accordion__item${open ? ' sy-accordion__item--open' : ''}`}>
      <button
        type="button"
        className="sy-accordion__trigger"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined" aria-hidden>
          {icon}
        </span>
        <span className="sy-accordion__title">{title}</span>
        <span className="material-symbols-outlined sy-accordion__chevron" aria-hidden>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {open ? <div className="sy-accordion__panel">{children}</div> : null}
    </div>
  )
}

function statusHint(s: StatusFluxo): string {
  switch (s) {
    case 'Rascunho (parceiro)':
      return 'Editável. Monte produtos (planilha ou CSV sem custo/markup/%) e envie à MTI.'
    case 'Aguardando análise MTI':
      return 'Bloqueado no portal. A MTI analisa no backoffice.'
    case 'Ajuste solicitado':
      return 'Corrija conforme a justificativa e reenvie.'
    case 'Homologado':
      return 'Aprovado pela MTI. Publicação e apostila ficam no backoffice.'
    case 'Ativo (publicado)':
      return 'Em Produção. Cliente só vê após apostilamento.'
    case 'Reprovado':
      return 'Reprovado. Abra novo rascunho para novo ciclo.'
    case 'Paralisado':
      return 'Paralisado pela MTI — sem novos consumos até reativação.'
    default:
      return ''
  }
}

export default function PortalParceiroApp() {
  const [page, setPage] = useState<PageId>('home')
  const [catalogos, setCatalogos] = useState<CatalogoParceiro[]>(CATALOGOS_INICIAIS)
  const [grupos, setGrupos] = useState<GrupoParceiro[]>(GRUPOS_INICIAIS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [msgEnvio, setMsgEnvio] = useState('')
  const [search, setSearch] = useState('')
  const [visaoPlanilha, setVisaoPlanilha] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('(Todos)')
  const [filtroCx, setFiltroCx] = useState('(Todas)')
  const [filtroGrupo, setFiltroGrupo] = useState('')
  const [menuServicosAberto, setMenuServicosAberto] = useState(false)
  const [acordeoesAbertos, setAcordeoesAbertos] = useState<string[]>([
    'dados-catalogo',
    'produtos',
    'envio',
  ])
  const [importCatalogoId, setImportCatalogoId] = useState('')
  const [importFileName, setImportFileName] = useState<string | null>(null)
  const [importPending, setImportPending] = useState<ProdutoParceiro[] | null>(null)
  const [grupoParceriaFiltro, setGrupoParceriaFiltro] = useState<string>(PARCERIAS[0])
  const csvInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [demandasShared] = useDemandasShared()

  function toggleAcordeao(id: string) {
    setAcordeoesAbertos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function navigate(target: PageId) {
    setPage(target)
    setMenuServicosAberto(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selected = useMemo(
    () => catalogos.find((c) => c.id === selectedId) ?? null,
    [catalogos, selectedId],
  )

  const produtosFiltrados = useMemo(() => {
    if (!selected) return []
    return selected.produtos.filter((p) => {
      if (filtroTipo !== '(Todos)' && p.tipo !== filtroTipo) return false
      if (filtroCx !== '(Todas)' && (p.complexidade || '') !== filtroCx) return false
      if (filtroGrupo && !(p.grupo || '').toLowerCase().includes(filtroGrupo.toLowerCase()))
        return false
      return true
    })
  }, [selected, filtroTipo, filtroCx, filtroGrupo])

  const catalogosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return catalogos
    return catalogos.filter(
      (c) =>
        c.identificador.toLowerCase().includes(q) ||
        c.parceria.toLowerCase().includes(q) ||
        c.statusFluxo.toLowerCase().includes(q),
    )
  }, [catalogos, search])

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }

  function openDetalhe(id: string) {
    setSelectedId(id)
    const cat = catalogos.find((c) => c.id === id)
    setMsgEnvio(cat?.mensagemEnvio ?? '')
    setVisaoPlanilha(true)
    navigate('detalhe')
  }

  function updateSelected(patch: Partial<CatalogoParceiro>) {
    if (!selectedId) return
    setCatalogos((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, ...patch, atualizadoEm: new Date().toISOString().slice(0, 10) }
          : c,
      ),
    )
  }

  function updateProduto(produtoId: string, patch: Partial<ProdutoParceiro>) {
    if (!selectedId) return
    setCatalogos((prev) =>
      prev.map((c) => {
        if (c.id !== selectedId) return c
        return {
          ...c,
          atualizadoEm: new Date().toISOString().slice(0, 10),
          produtos: c.produtos.map((p) => (p.id === produtoId ? { ...p, ...patch } : p)),
        }
      }),
    )
  }

  function addProduto() {
    if (!selected || !podeEditar(selected.statusFluxo)) return
    updateSelected({ produtos: [...selected.produtos, emptyProduto()] })
  }

  function salvarRascunho() {
    if (!selected || !podeEditar(selected.statusFluxo)) return
    updateSelected({
      mensagemEnvio: msgEnvio,
      statusFluxo: 'Rascunho (parceiro)',
      historico: pushHistorico(
        { ...selected, statusFluxo: 'Rascunho (parceiro)' },
        'Rascunho (parceiro)',
        'Rascunho salvo',
      ),
    })
    showToast('Rascunho salvo. Ainda não enviado à MTI.')
  }

  function enviarMti() {
    if (!selected || !podeEnviar(selected.statusFluxo)) return
    if (selected.produtos.length === 0) {
      showToast('Inclua ao menos um produto antes de enviar.')
      return
    }
    updateSelected({
      mensagemEnvio: msgEnvio,
      statusFluxo: 'Aguardando análise MTI',
      justificativaMti: undefined,
      historico: pushHistorico(selected, 'Aguardando análise MTI', msgEnvio || 'Enviado à MTI'),
    })
    showToast('Enviado à MTI. Status: Aguardando análise.')
  }

  function simularParecerMti(decisao: ParecerMti) {
    if (!selected) return
    if (decisao === 'ajuste') {
      updateSelected({
        statusFluxo: 'Ajuste solicitado',
        justificativaMti:
          'Valor unitário diverge da referência. Corrigir e reenviar (sem custo/markup no CSV).',
        historico: pushHistorico(selected, 'Ajuste solicitado', 'MTI solicitou ajuste'),
      })
      showToast('Simulação: MTI solicitou ajuste.')
      return
    }
    if (decisao === 'aprovar') {
      updateSelected({
        statusFluxo: 'Homologado',
        justificativaMti: undefined,
        historico: pushHistorico(selected, 'Homologado', 'MTI aprovou'),
      })
      showToast('Simulação: MTI aprovou (Homologado).')
      return
    }
    if (decisao === 'publicar') {
      if (selected.statusFluxo !== 'Homologado' && selected.statusFluxo !== 'Ativo (publicado)') {
        showToast('Publicar só após Homologado.')
        return
      }
      updateSelected({
        statusFluxo: 'Ativo (publicado)',
        historico: pushHistorico(selected, 'Ativo (publicado)', 'MTI publicou em Produção'),
      })
      showToast('Simulação: MTI publicou em Produção.')
      return
    }
    if (decisao === 'reprovar') {
      updateSelected({
        statusFluxo: 'Reprovado',
        justificativaMti: 'Itens fora do escopo / valores inconsistentes. Abrir novo ciclo.',
        historico: pushHistorico(selected, 'Reprovado', 'MTI reprovou'),
      })
      showToast('Simulação: MTI reprovou.')
      return
    }
    updateSelected({
      statusFluxo: 'Paralisado',
      justificativaMti: 'Catálogo paralisado pela MTI — sem novos consumos.',
      historico: pushHistorico(selected, 'Paralisado', 'MTI paralisou'),
    })
    showToast('Simulação: MTI paralisou o catálogo.')
  }

  function novoCatalogo() {
    const id = crypto.randomUUID()
    const novo: CatalogoParceiro = {
      id,
      identificador: 'Novo catálogo',
      versao: '1.0',
      parceria: PARCERIAS[0],
      statusFluxo: 'Rascunho (parceiro)',
      statusParceria: 'Homologada (DIREX)',
      atualizadoEm: new Date().toISOString().slice(0, 10),
      produtos: [],
      historico: [
        { em: new Date().toISOString(), status: 'Rascunho (parceiro)', detalhe: 'Casulo ao salvar parceria' },
      ],
    }
    setCatalogos((prev) => [novo, ...prev])
    openDetalhe(id)
    showToast('Rascunho (casulo) criado — monte produtos e envie à MTI.')
  }

  function clonarComoRascunho() {
    if (!selected) return
    const id = crypto.randomUUID()
    const novo: CatalogoParceiro = {
      ...selected,
      id,
      versao: `${selected.versao}-novo`,
      statusFluxo: 'Rascunho (parceiro)',
      justificativaMti: undefined,
      atualizadoEm: new Date().toISOString().slice(0, 10),
      produtos: selected.produtos.map((p) => ({ ...p, id: crypto.randomUUID(), status: 'Rascunho' })),
      historico: [
        {
          em: new Date().toISOString(),
          status: 'Rascunho (parceiro)',
          detalhe: `Clonado de ${selected.identificador} v${selected.versao}`,
        },
      ],
    }
    setCatalogos((prev) => [novo, ...prev])
    openDetalhe(id)
    showToast('Novo rascunho criado a partir do ciclo anterior.')
  }

  function onImportCsvIntoSelected(file: File | null) {
    if (!file || !selected || !podeEditar(selected.statusFluxo)) return
    const reader = new FileReader()
    reader.onload = () => {
      const r = parseProdutosCsv(String(reader.result ?? ''))
      if (!r.ok) {
        showToast(r.erro)
        return
      }
      updateSelected({ produtos: [...selected.produtos, ...r.produtos] })
      showToast(`CSV importado: ${r.produtos.length} produto(s).`)
    }
    reader.readAsText(file, 'UTF-8')
  }

  function onPickImportFile(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const r = parseProdutosCsv(String(reader.result ?? ''))
      if (!r.ok) {
        setImportPending(null)
        setImportFileName(null)
        showToast(r.erro)
        return
      }
      setImportPending(r.produtos)
      setImportFileName(file.name)
      showToast(`${r.produtos.length} produto(s) prontos para salvar.`)
    }
    reader.readAsText(file, 'UTF-8')
  }

  function salvarImportacao() {
    if (!importCatalogoId) {
      showToast('Selecione o catálogo.')
      return
    }
    if (!importPending?.length) {
      showToast('Anexe um arquivo .csv válido.')
      return
    }
    const cat = catalogos.find((c) => c.id === importCatalogoId)
    if (!cat || !podeEditar(cat.statusFluxo)) {
      showToast('Catálogo não editável neste status.')
      return
    }
    setCatalogos((prev) =>
      prev.map((c) =>
        c.id === importCatalogoId
          ? {
              ...c,
              produtos: [...c.produtos, ...importPending],
              atualizadoEm: new Date().toISOString().slice(0, 10),
            }
          : c,
      ),
    )
    setImportPending(null)
    setImportFileName(null)
    showToast('Arquivo salvo no catálogo.')
    openDetalhe(importCatalogoId)
  }

  function exportCsv() {
    if (!selected) return
    downloadText(
      `${selected.identificador.replace(/\s+/g, '_')}_v${selected.versao}.csv`,
      produtosToCsv(produtosFiltrados.length ? produtosFiltrados : selected.produtos),
    )
    showToast('CSV exportado (sem custo/markup/%).')
  }

  function exportPdf() {
    if (!selected) return
    const html = produtosToPdfHtml(produtosFiltrados.length ? produtosFiltrados : selected.produtos, {
      catalogo: selected.identificador,
      versao: selected.versao,
      parceria: selected.parceria,
    })
    const w = window.open('', '_blank')
    if (!w) {
      showToast('Permita pop-ups para exportar PDF.')
      return
    }
    w.document.write(html)
    w.document.close()
    showToast('PDF aberto para impressão/salvar.')
  }

  function baixarTemplate() {
    downloadText('template-produtos-parceiro.csv', csvTemplate())
    showToast('Template CSV do parceiro baixado.')
  }

  const ajustes = catalogos.filter((c) => c.statusFluxo === 'Ajuste solicitado')
  const editaveis = catalogos.filter((c) => podeEditar(c.statusFluxo))

  const gruposDaParceria = useMemo(
    () =>
      grupos.filter(
        (g) => g.ativo && (!selected || g.parceria === selected.parceria),
      ),
    [grupos, selected],
  )

  const gruposFiltrados = useMemo(
    () => grupos.filter((g) => g.parceria === grupoParceriaFiltro),
    [grupos, grupoParceriaFiltro],
  )

  function addGrupo() {
    setGrupos((prev) => [
      {
        id: crypto.randomUUID(),
        nome: 'Novo grupo',
        descricao: '',
        parceria: grupoParceriaFiltro,
        ativo: true,
      },
      ...prev,
    ])
    showToast('Grupo criado no escopo da parceria.')
  }

  function updateGrupo(id: string, patch: Partial<GrupoParceiro>) {
    setGrupos((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }

  function tipoOfertaDoCatalogo(cat: CatalogoParceiro): 'Universal' | 'Individualizado' {
    return cat.ehUniversal ? 'Universal' : 'Individualizado'
  }

  return (
    <div className="pc-portal pp-portal">
      <a className="pc-skip" href="#conteudo">
        Ir para o conteúdo
      </a>

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
        <nav className="pc-nav" aria-label="Navegação principal">
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
            className={`pc-nav__item${page === 'dashboard' ? ' pc-nav__item--active' : ''}`}
            onClick={() => navigate('dashboard')}
          >
            <span className="material-symbols-outlined" aria-hidden>
              dashboard
            </span>
            Dashboard
          </button>
          <button
            type="button"
            className={`pc-nav__item${page === 'demandas' ? ' pc-nav__item--active' : ''}`}
            onClick={() => navigate('demandas')}
          >
            <span className="material-symbols-outlined" aria-hidden>
              inbox
            </span>
            Demandas
          </button>
          <div className="pc-nav-servicos">
            <button
              type="button"
              className={`pc-nav__item pc-nav__item--servicos${
                ['catalogos', 'detalhe', 'importar', 'grupos'].includes(page) || menuServicosAberto
                  ? ' pc-nav__item--active'
                  : ''
              }`}
              aria-haspopup="menu"
              aria-expanded={menuServicosAberto}
              onClick={() => setMenuServicosAberto((v) => !v)}
            >
              <span className="material-symbols-outlined" aria-hidden>
                grid_view
              </span>
              Serviços
              <span className="material-symbols-outlined pc-nav__chevron" aria-hidden>
                expand_more
              </span>
            </button>
            {menuServicosAberto && (
              <div className="pc-nav-servicos__menu" role="menu">
                <button type="button" role="menuitem" className="pc-nav-servicos__item" onClick={() => navigate('papeis')}>
                  <span className="material-symbols-outlined" aria-hidden>
                    diversity_3
                  </span>
                  Papéis
                </button>
                <button type="button" role="menuitem" className="pc-nav-servicos__item" onClick={() => navigate('catalogos')}>
                  <span className="material-symbols-outlined" aria-hidden>
                    folder
                  </span>
                  Meus catálogos
                </button>
                <button type="button" role="menuitem" className="pc-nav-servicos__item" onClick={() => navigate('grupos')}>
                  <span className="material-symbols-outlined" aria-hidden>
                    account_tree
                  </span>
                  Grupos
                </button>
                <button type="button" role="menuitem" className="pc-nav-servicos__item" onClick={() => navigate('importar')}>
                  <span className="material-symbols-outlined" aria-hidden>
                    upload_file
                  </span>
                  Importar CSV
                </button>
                <button type="button" role="menuitem" className="pc-nav-servicos__item" onClick={() => navigate('dados')}>
                  <span className="material-symbols-outlined" aria-hidden>
                    badge
                  </span>
                  Meus dados
                </button>
              </div>
            )}
          </div>
        </nav>
        <div className="pc-header__actions">
          <button type="button" className="pc-icon-btn" aria-label="Buscar" onClick={() => navigate('catalogos')}>
            <span className="material-symbols-outlined">search</span>
          </button>
          <button
            type="button"
            className="pc-icon-btn"
            aria-label="Notificações"
            onClick={() => {
              navigate('dashboard')
              showToast(
                ajustes.length
                  ? `${ajustes.length} ajuste(s) pendente(s)`
                  : 'Sem notificações novas',
              )
            }}
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            type="button"
            className="pc-avatar"
            aria-label="Perfil"
            onClick={() => navigate('dados')}
          >
            {PARCEIRO_LOGADO.iniciais}
          </button>
        </div>
      </header>

      <main id="conteudo" className="pc-main">
        {page === 'home' && (
          <>
            <section className="pc-hero">
              <h1>PORTAL DO PARCEIRO - ATLAS</h1>
              <p>
                Canal de <strong>Demanda</strong> (abrir, analisar em modo propositivo, bater ponto em
                Consumo, declarar entrega) e catálogo da parceria (rascunho → envio à MTI). Publicação e
                apostila ficam no Projeto Atlas (back-office). MTI não tem portal.
              </p>
              <label className="pc-hero__search">
                <span className="material-symbols-outlined" aria-hidden>
                  search
                </span>
                <input
                  type="search"
                  placeholder="Buscar"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    if (e.target.value.trim()) navigate('catalogos')
                  }}
                />
              </label>
            </section>

            <section className="pc-section pc-section--narrow">
              <h2>SERVIÇOS DO PORTAL</h2>
              <div className="pc-service-grid pc-service-grid--home">
                <button
                  type="button"
                  className="pc-service-card pc-service-card--sydle pc-service-card--active"
                  onClick={() => navigate('dashboard')}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    dashboard
                  </span>
                  <strong>Dashboard</strong>
                  <span>Parceria, catálogo/produtos e demandas em um só painel</span>
                </button>
                <button
                  type="button"
                  className="pc-service-card pc-service-card--sydle pc-service-card--active"
                  onClick={() => navigate('demandas')}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    inbox
                  </span>
                  <strong>Demandas</strong>
                  <span>Abrir, analisar (propositivo), efetivar e declarar</span>
                </button>
                <button
                  type="button"
                  className="pc-service-card pc-service-card--sydle pc-service-card--active"
                  onClick={() => navigate('papeis')}
                >
                  <div>
                    <h3>Papéis e responsabilidades</h3>
                    <p>O que o parceiro e a MTI cadastram, preenchem, veem e quais ações cada um tem</p>
                  </div>
                  <span className="material-symbols-outlined" aria-hidden>
                    diversity_3
                  </span>
                </button>
                <button
                  type="button"
                  className="pc-service-card pc-service-card--sydle"
                  onClick={() => navigate('dados')}
                >
                  <div>
                    <h3>Meus dados</h3>
                    <p>Dados do colaborador logado na organização parceira</p>
                  </div>
                  <span className="material-symbols-outlined" aria-hidden>
                    badge
                  </span>
                </button>
                <button
                  type="button"
                  className="pc-service-card pc-service-card--sydle"
                  onClick={() => navigate('catalogos')}
                >
                  <div>
                    <h3>Meus catálogos</h3>
                    <p>Rascunhos, envios à MTI, ajustes e status espelhados do backoffice</p>
                  </div>
                  <span className="material-symbols-outlined" aria-hidden>
                    folder
                  </span>
                </button>
                <button
                  type="button"
                  className="pc-service-card pc-service-card--sydle"
                  onClick={() => navigate('grupos')}
                >
                  <div>
                    <h3>Grupos</h3>
                    <p>Cadastro de grupos da parceria — obrigatório no produto</p>
                  </div>
                  <span className="material-symbols-outlined" aria-hidden>
                    account_tree
                  </span>
                </button>
                <button
                  type="button"
                  className="pc-service-card pc-service-card--sydle"
                  onClick={() => navigate('importar')}
                >
                  <div>
                    <h3>Importar CSV</h3>
                    <p>Carga de produtos no catálogo — sem custo, markup nem percentuais</p>
                  </div>
                  <span className="material-symbols-outlined" aria-hidden>
                    cloud_upload
                  </span>
                </button>
              </div>
            </section>
          </>
        )}

        {page === 'demandas' && (
          <DemandasPage
            modo="parceiro"
            onHome={() => navigate('home')}
            onToast={showToast}
          />
        )}

        {page === 'papeis' && (
          <section className="pc-page">
            <nav className="pc-breadcrumb" aria-label="Trilha">
              <button type="button" onClick={() => navigate('home')}>
                <span className="material-symbols-outlined" aria-hidden>
                  home
                </span>
              </button>
              <span>/</span>
              <span>Papéis e responsabilidades</span>
            </nav>
            <h1>Quem faz o quê</h1>
            <p className="pc-lead">
              Cadastra = cria a classe · Preenche = informa/seleciona · Vê = consulta · Métodos =
              ações do portal/backoffice.
            </p>

            <div className="pp-papeis-grid">
              <article className="pp-papel pp-papel--parceiro">
                <header>
                  <h2>Parceiro (este portal)</h2>
                </header>
                <h3>Cadastra</h3>
                <ul>
                  <li>Grupo (próprias parcerias)</li>
                  <li>Produto (tela ou CSV)</li>
                </ul>
                <h3>Preenche / seleciona</h3>
                <ul>
                  <li>Nome, SKU, tipo, grupo, descrição, valor unitário</li>
                  <li>Métrica, cobrança, modelo, vertical (listas MTI)</li>
                  <li>Período 12–60 · complexidade/peso/qtd (Serviço)</li>
                  <li>SIAG/Protheus opcional · mensagem ao analista</li>
                </ul>
                <h3>Vê</h3>
                <ul>
                  <li>Só seu escopo · status espelhado · justificativa MTI</li>
                  <li>Tipo de oferta (RO, herdado)</li>
                </ul>
                <h3>Não vê / não faz</h3>
                <ul>
                  <li>Custo, markup, % · publicar · apostilar · listas-mestre</li>
                </ul>
                <h3>Métodos</h3>
                <p className="pp-metodos">
                  Salvar rascunho · Importar/exportar CSV · PDF · Enviar à MTI · Corrigir ajuste ·
                  Novo rascunho · CRUD Grupo · <strong>Demanda</strong> (abrir/listar · menu
                  propositivo · bater ponto em Consumo · declarar entrega)
                </p>
              </article>

              <article className="pp-papel pp-papel--mti">
                <header>
                  <h2>MTI (Projeto Atlas — back-office)</h2>
                </header>
                <h3>Cadastra</h3>
                <ul>
                  <li>Listas-mestre · Parceria · Solução · Catálogo (toggles/focais)</li>
                  <li>Catálogo Universal · Grupo/Produto (alternativa)</li>
                </ul>
                <h3>Preenche</h3>
                <ul>
                  <li>Custo + markup (Dados de Parceria)</li>
                  <li>Justificativa de ajuste/reprovação</li>
                </ul>
                <h3>Vê</h3>
                <ul>
                  <li>Fila completa · financeiro · histórico</li>
                </ul>
                <h3>Métodos</h3>
                <p className="pp-metodos">
                  Casulo ao salvar Parceria · Analisar · Ajuste · Reprovar · Homologar · Publicar ·
                  Apostilar · Paralisar · Nova versão
                </p>
              </article>

              <article className="pp-papel pp-papel--sistema">
                <header>
                  <h2>Sistema</h2>
                </header>
                <h3>Gera / calcula</h3>
                <ul>
                  <li>Casulo de catálogo</li>
                  <li>valorTotal = custo × markup · dist. RO</li>
                  <li>Perpétuo → Única · herança de oferta/parceria</li>
                </ul>
                <h3>Métodos</h3>
                <p className="pp-metodos">
                  Travar após envio · Espelhar status · Rejeitar CSV com custo/markup/%
                </p>
              </article>

              <article className="pp-papel pp-papel--cliente">
                <header>
                  <h2>Cliente (Fase 3)</h2>
                </header>
                <h3>Não cadastra</h3>
                <ul>
                  <li>Catálogo / Produto / Grupo</li>
                </ul>
                <h3>Vê / consome</h3>
                <ul>
                  <li>Só versão apostilada · cotação · OS · saldo</li>
                </ul>
              </article>
            </div>
          </section>
        )}

        {page === 'dados' && (
          <section className="pc-page">
            <nav className="pc-breadcrumb" aria-label="Trilha">
              <button type="button" onClick={() => navigate('home')}>
                <span className="material-symbols-outlined" aria-hidden>
                  home
                </span>
              </button>
              <span>/</span>
              <span>Meus dados</span>
            </nav>
            <h1>Meus dados</h1>
            <p className="pc-lead">Colaborador logado na organização parceira.</p>
            <div className="pp-dados-card">
              <div className="pp-avatar pp-avatar--lg" aria-hidden>
                {PARCEIRO_LOGADO.iniciais}
              </div>
              <div>
                <strong>{PARCEIRO_LOGADO.usuario}</strong>
                <p className="pc-muted">{PARCEIRO_LOGADO.organizacao}</p>
                <p className="pc-muted">Perfil: Parceiro · montagem de catálogo / envio à MTI</p>
              </div>
            </div>
          </section>
        )}

        {page === 'grupos' && (
          <section className="pc-page">
            <nav className="pc-breadcrumb" aria-label="Trilha">
              <button type="button" onClick={() => navigate('home')}>
                <span className="material-symbols-outlined" aria-hidden>
                  home
                </span>
              </button>
              <span>/</span>
              <span>Grupos</span>
            </nav>
            <div className="pc-page__head-row">
              <div>
                <h1>Grupos da parceria</h1>
                <p className="pc-lead">
                  Cadastro pelo parceiro no escopo da parceria. Grupo é obrigatório no produto.
                </p>
              </div>
              <button type="button" className="pc-btn pc-btn--primary" onClick={addGrupo}>
                Novo grupo
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <label className="pp-msg" style={{ maxWidth: 320 }}>
              Filtrar por parceria
              <select
                className="sy-dem-input"
                value={grupoParceriaFiltro}
                onChange={(e) => setGrupoParceriaFiltro(e.target.value)}
              >
                {PARCERIAS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <div className="pc-table-wrap">
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Parceria</th>
                    <th>Ativo</th>
                  </tr>
                </thead>
                <tbody>
                  {gruposFiltrados.map((g) => (
                    <tr key={g.id}>
                      <td>
                        <input
                          className="pp-inline-input"
                          value={g.nome}
                          onChange={(e) => updateGrupo(g.id, { nome: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="pp-inline-input"
                          value={g.descricao ?? ''}
                          onChange={(e) => updateGrupo(g.id, { descricao: e.target.value })}
                        />
                      </td>
                      <td>{g.parceria}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={g.ativo}
                          onChange={(e) => updateGrupo(g.id, { ativo: e.target.checked })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {page === 'importar' && (
          <section className="pc-page pc-org-main">
            <nav className="pc-breadcrumb" aria-label="Trilha">
              <button type="button" onClick={() => navigate('home')}>
                <span className="material-symbols-outlined" aria-hidden>
                  home
                </span>
              </button>
              <span>/</span>
              <button type="button" onClick={() => navigate('catalogos')}>
                Catálogo de Serviços - Atlas
              </button>
              <span>/</span>
              <span>Catálogo MTI</span>
            </nav>
            <h1>Catálogo MTI</h1>
            <div className="pp-page-tools" aria-label="Ferramentas">
              <button type="button" title="Buscar" aria-label="Buscar">
                <span className="material-symbols-outlined">manage_search</span>
              </button>
              <button type="button" title="Imprimir" aria-label="Imprimir">
                <span className="material-symbols-outlined">print</span>
              </button>
            </div>

            <div className="pp-import-form">
              <div className="sy-dem-field">
                <span className="sy-dem-label">
                  Catálogo <span className="pp-req">*</span>
                </span>
                <select
                  className="sy-dem-input"
                  value={importCatalogoId}
                  onChange={(e) => setImportCatalogoId(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {editaveis.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.identificador} v{c.versao} — {c.statusFluxo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sy-dem-field">
                <span className="sy-dem-label">
                  Arquivo (.csv) <span className="pp-req">*</span>
                </span>
                <button
                  type="button"
                  className="pp-upload-zone"
                  onClick={() => importInputRef.current?.click()}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    cloud_upload
                  </span>
                  <span>{importFileName ?? 'Selecionar arquivo CSV'}</span>
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  onChange={(e) => {
                    onPickImportFile(e.target.files?.[0] ?? null)
                    e.target.value = ''
                  }}
                />
                <p className="pc-muted pp-import-hint">
                  Colunas: nome, part_number, tipo, grupo, vertical, modelo_venda, cobranca, metrica,
                  valor_unitario, periodo_minimo, complexidade, peso, quantidade_metrica, descricao,
                  codigo_siag, codigo_protheus. Sem custo, markup ou %.
                </p>
                <button type="button" className="pc-btn pc-btn--ghost" onClick={baixarTemplate}>
                  Baixar template CSV
                </button>
              </div>
            </div>

            <div className="pc-org-form-footer">
              <button
                type="button"
                className="pc-org-form-footer__cancel"
                onClick={() => {
                  setImportPending(null)
                  setImportFileName(null)
                  navigate('home')
                }}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  close
                </span>
                Cancelar
              </button>
              <button
                type="button"
                className="pc-org-form-footer__primary"
                onClick={salvarImportacao}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  check
                </span>
                Salvar
              </button>
            </div>
          </section>
        )}

        {page === 'catalogos' && (
          <section className="pc-page">
            <nav className="pc-breadcrumb" aria-label="Trilha">
              <button type="button" onClick={() => navigate('home')}>
                <span className="material-symbols-outlined" aria-hidden>
                  home
                </span>
              </button>
              <span>/</span>
              <span>Catálogo de Serviços - Atlas</span>
              <span>/</span>
              <span>Meus catálogos</span>
            </nav>
            <div className="pc-page__head-row">
              <div>
                <h1>Meus catálogos</h1>
                <p className="pc-lead">
                  Status espelhado com o backoffice MTI. Custo/markup/% são preenchidos pela MTI.
                </p>
              </div>
              <button type="button" className="pc-btn pc-btn--primary" onClick={novoCatalogo}>
                Novo catálogo
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <div className="pc-table-wrap">
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Catálogo</th>
                    <th>Versão</th>
                    <th>Parceria</th>
                    <th>Produtos</th>
                    <th>Status</th>
                    <th>Atualizado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {catalogosFiltrados.map((c) => (
                    <tr key={c.id}>
                      <td>{c.identificador}</td>
                      <td>{c.versao}</td>
                      <td>{c.parceria}</td>
                      <td>{c.produtos.length}</td>
                      <td>
                        <span className="pc-dem-plain">{c.statusFluxo}</span>
                      </td>
                      <td>{new Date(c.atualizadoEm).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <button
                          type="button"
                          className="pc-btn pc-btn--ghost"
                          onClick={() => openDetalhe(c.id)}
                        >
                          Abrir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {page === 'dashboard' && (
          <section className="pc-page pp-dash-page">
            <nav className="pc-breadcrumb" aria-label="Trilha">
              <button type="button" onClick={() => navigate('home')}>
                <span className="material-symbols-outlined" aria-hidden>
                  home
                </span>
              </button>
              <span>/</span>
              <span>Dashboard</span>
            </nav>
            <PortalParceiroDashboards
              catalogos={catalogos}
              grupos={grupos}
              demandas={demandasShared}
              onNavigate={(p) => navigate(p)}
              onOpenCatalogo={openDetalhe}
            />
          </section>
        )}

        {page === 'detalhe' && selected && (
          <section className="pc-page pc-org-main">
            <nav className="pc-breadcrumb" aria-label="Trilha">
              <button type="button" onClick={() => navigate('home')}>
                <span className="material-symbols-outlined" aria-hidden>
                  home
                </span>
              </button>
              <span>/</span>
              <button type="button" onClick={() => navigate('catalogos')}>
                Catálogo de Serviços - Atlas
              </button>
              <span>/</span>
              <span>Cadastro do catálogo</span>
            </nav>

            <h1>Cadastro do catálogo</h1>
            <div className="pp-page-tools" aria-label="Ferramentas da página">
              <button type="button" title="Imprimir" aria-label="Imprimir" onClick={exportPdf}>
                <span className="material-symbols-outlined">print</span>
              </button>
            </div>

            <div className="pc-org-header">
              <p className="pc-lead" style={{ margin: 0 }}>
                {selected.identificador} <span className="pc-muted">v{selected.versao}</span>
                {' · '}
                {statusHint(selected.statusFluxo)}
              </p>
              <span className="pc-dem-plain">{selected.statusFluxo}</span>
            </div>

            {selected.justificativaMti && (
              <div className="pc-org-alert pc-org-alert--ajuste" role="status">
                <span className="material-symbols-outlined" aria-hidden>
                  warning
                </span>
                <div>
                  <strong>Justificativa da MTI</strong>
                  <p>{selected.justificativaMti}</p>
                </div>
              </div>
            )}

            <div className="pp-catalog-shell sy-accordion">
              <AccordionBlock
                id="dados-catalogo"
                title="Dados do catálogo"
                icon="folder"
                open={acordeoesAbertos.includes('dados-catalogo')}
                onToggle={toggleAcordeao}
              >
                <div className="sy-dem-row sy-dem-row--2">
                  <div className="sy-dem-field">
                    <span className="sy-dem-label">Identificador</span>
                    <input
                      className="sy-dem-input"
                      value={selected.identificador}
                      disabled={!podeEditar(selected.statusFluxo)}
                      onChange={(e) => updateSelected({ identificador: e.target.value })}
                    />
                  </div>
                  <div className="sy-dem-field">
                    <span className="sy-dem-label">Versão (rascunho)</span>
                    <input
                      className="sy-dem-input"
                      value={selected.versao}
                      disabled={!podeEditar(selected.statusFluxo)}
                      onChange={(e) => updateSelected({ versao: e.target.value })}
                    />
                  </div>
                  <div className="sy-dem-field">
                    <span className="sy-dem-label">Parceria</span>
                    <select
                      className="sy-dem-input"
                      value={selected.parceria}
                      disabled={!podeEditar(selected.statusFluxo)}
                      onChange={(e) => updateSelected({ parceria: e.target.value })}
                    >
                      {PARCERIAS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sy-dem-field">
                    <span className="sy-dem-label">Status da parceria (DIREX)</span>
                    <input
                      className="sy-dem-input"
                      value={selected.statusParceria ?? '—'}
                      readOnly
                    />
                  </div>
                  <div className="sy-dem-field">
                    <span className="sy-dem-label">Status do fluxo</span>
                    <input className="sy-dem-input" value={selected.statusFluxo} readOnly />
                  </div>
                </div>
              </AccordionBlock>

              <AccordionBlock
                id="produtos"
                title={`Produtos (${selected.produtos.length})`}
                icon="inventory_2"
                open={acordeoesAbertos.includes('produtos')}
                onToggle={toggleAcordeao}
              >
                <div className="pc-page__head-row">
                  <h2 className="pp-sub" style={{ marginTop: 0 }}>
                    {visaoPlanilha ? 'Visão planilha' : 'Lista de produtos'}
                  </h2>
                  <div className="pp-actions" style={{ margin: 0 }}>
                    <button
                      type="button"
                      className={`pc-btn${visaoPlanilha ? ' pc-btn--primary' : ''}`}
                      onClick={() => setVisaoPlanilha((v) => !v)}
                    >
                      {visaoPlanilha ? 'Lista simples' : 'Visão planilha'}
                    </button>
                    {podeEditar(selected.statusFluxo) && (
                      <button type="button" className="pc-btn" onClick={addProduto}>
                        Adicionar produto
                      </button>
                    )}
                  </div>
                </div>

                {visaoPlanilha && (
                  <div className="pc-form-block pc-form-block--filters">
                    <label>
                      Tipo
                      <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                        <option>(Todos)</option>
                        <option>Licença</option>
                        <option>Serviço</option>
                      </select>
                    </label>
                    <label>
                      Complexidade
                      <select value={filtroCx} onChange={(e) => setFiltroCx(e.target.value)}>
                        <option>(Todas)</option>
                        {COMPLEXIDADES.filter(Boolean).map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Grupo
                      <input
                        value={filtroGrupo}
                        onChange={(e) => setFiltroGrupo(e.target.value)}
                        placeholder="Filtrar grupo…"
                        list="pp-grupos"
                      />
                      <datalist id="pp-grupos">
                        {gruposDaParceria.map((g) => (
                          <option key={g.id} value={g.nome} />
                        ))}
                      </datalist>
                    </label>
                  </div>
                )}

                <div className="pc-table-wrap">
                  <table className="pc-table">
                    <thead>
                      <tr>
                        <th>Identificador</th>
                        {visaoPlanilha && (
                          <>
                            <th className="pp-th-novo" title="Obrigatório no Protheus e no Atlas (reunião 21/08)">
                              NOME CIENTÍFICO (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório — Tipo Protheus (ex.: SW)">
                              TIPO PROTHEUS (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório — Grupo ERP sempre 32">
                              GRUPO ERP (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório — Local padrão fixo 01">
                              LOCAL PADRÃO (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório — Grupo tributário 001">
                              GRUPO TRIBUTÁRIO (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório na prática — sempre venda de serviços">
                              CÓDIGO NATUREZA (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório — Origem sempre 0">
                              ORIGEM (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório — informado pela Contabilidade">
                              IMPOSTO DE RENDA (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório — informado pela Contabilidade">
                              CALCULA INSS (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório — informado pela Contabilidade">
                              RETÉM PIS (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório — informado pela Contabilidade">
                              RETÉM COFINS (OBR)
                            </th>
                            <th className="pp-th-novo" title="Obrigatório — informado pela Contabilidade">
                              RETÉM CSLL (OBR)
                            </th>
                            <th className="pp-th-novo" title="Código da conta — não confirmado como obrigatório no Atlas">
                              CONTA CONTÁBIL
                            </th>
                            <th>Part number</th>
                            <th>Tipo</th>
                            <th>Oferta</th>
                            <th>Grupo</th>
                            <th>Vertical</th>
                            <th>Modelo</th>
                            <th>Cobrança</th>
                            <th>Métrica</th>
                            <th>Valor</th>
                            <th>Período mín.</th>
                            <th>Cx.</th>
                            <th>Peso</th>
                            <th>Qtd. métrica</th>
                            <th>SIAG</th>
                            <th>Protheus</th>
                          </>
                        )}
                        {!visaoPlanilha && <th>Tipo</th>}
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(visaoPlanilha ? produtosFiltrados : selected.produtos).map((p) => (
                        <tr key={p.id}>
                          <td>
                            <input
                              className="pp-inline-input"
                              value={p.identificador}
                              disabled={!podeEditar(selected.statusFluxo)}
                              onChange={(e) =>
                                updateProduto(p.id, { identificador: e.target.value })
                              }
                            />
                          </td>
                          {visaoPlanilha && (
                            <>
<td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.nomeCientifico ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { nomeCientifico: e.target.value })
                                  }
                                  title="NOME CIENTÍFICO (OBR) — nome completo sem limite de caracteres"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.tipoProtheus ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { tipoProtheus: e.target.value })
                                  }
                                  title="TIPO PROTHEUS (OBR) — ex.: SW"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.grupoErp ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { grupoErp: e.target.value })
                                  }
                                  title="GRUPO ERP (OBR) — no Protheus sempre 32"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.localPadrao ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { localPadrao: e.target.value })
                                  }
                                  title="LOCAL PADRÃO (OBR) — fixo 01"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.grupoTributario ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { grupoTributario: e.target.value })
                                  }
                                  title="GRUPO TRIBUTÁRIO (OBR) — 001 órgão público MT"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.codigoNatureza ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { codigoNatureza: e.target.value })
                                  }
                                  title="CÓDIGO NATUREZA (OBR) — venda de serviços"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.origem ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) => updateProduto(p.id, { origem: e.target.value })}
                                  title="ORIGEM (OBR) — sempre 0"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.impostoRenda ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { impostoRenda: e.target.value })
                                  }
                                  title="IMPOSTO DE RENDA (OBR) — Sim/Não (MTI)"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.calculaInss ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { calculaInss: e.target.value })
                                  }
                                  title="CALCULA INSS (OBR) — Sim/Não (MTI)"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.retemPis ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { retemPis: e.target.value })
                                  }
                                  title="RETÉM PIS (OBR) — Sim/Não (MTI)"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.retemCofins ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { retemCofins: e.target.value })
                                  }
                                  title="RETÉM COFINS (OBR) — Sim/Não (MTI)"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.retemCsll ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { retemCsll: e.target.value })
                                  }
                                  title="RETÉM CSLL (OBR) — Sim/Não (MTI)"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input pp-inline-input--novo"
                                  value={p.contaContabil ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { contaContabil: e.target.value })
                                  }
                                  title="CONTA CONTÁBIL — código texto; obrigatoriedade no Atlas a confirmar"
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input"
                                  value={p.partNumber ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { partNumber: e.target.value })
                                  }
                                />
                              </td>
                              <td>
                                <select
                                  className="pp-inline-input"
                                  value={p.tipo}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, {
                                      tipo: e.target.value as ProdutoParceiro['tipo'],
                                    })
                                  }
                                >
                                  <option>Licença</option>
                                  <option>Serviço</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input"
                                  value={tipoOfertaDoCatalogo(selected)}
                                  readOnly
                                  title="Herdado do catálogo (É Universal?)"
                                />
                              </td>
                              <td>
                                <select
                                  className="pp-inline-input"
                                  value={p.grupo ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) => updateProduto(p.id, { grupo: e.target.value })}
                                >
                                  <option value="">—</option>
                                  {gruposDaParceria.map((g) => (
                                    <option key={g.id} value={g.nome}>
                                      {g.nome}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input"
                                  value={p.categoria ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { categoria: e.target.value })
                                  }
                                  title="Vertical de Serviço de TI"
                                />
                              </td>
                              <td>
                                <select
                                  className="pp-inline-input"
                                  value={p.modeloVenda ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) => {
                                    const modeloVenda = e.target.value
                                    const patch: Partial<ProdutoParceiro> = { modeloVenda }
                                    if (modeloVenda === 'Perpétuo') patch.cobranca = 'Única'
                                    updateProduto(p.id, patch)
                                  }}
                                >
                                  <option value="">—</option>
                                  {MODELOS_VENDA.map((m) => (
                                    <option key={m}>{m}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <select
                                  className="pp-inline-input"
                                  value={p.cobranca ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { cobranca: e.target.value })
                                  }
                                >
                                  <option value="">—</option>
                                  {COBRANCAS.map((c) => (
                                    <option key={c}>{c}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input"
                                  value={p.metrica}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { metrica: e.target.value })
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input"
                                  type="number"
                                  value={p.valorUnitario}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, {
                                      valorUnitario: Number(e.target.value) || 0,
                                    })
                                  }
                                  title={formatBRL(p.valorUnitario)}
                                />
                              </td>
                              <td>
                                <select
                                  className="pp-inline-input"
                                  value={p.periodoMinimo ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, {
                                      periodoMinimo: e.target.value as PeriodoMinimo,
                                    })
                                  }
                                >
                                  <option value="">—</option>
                                  {PERIODOS_MINIMOS.map((c) => (
                                    <option key={c}>{c}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <select
                                  className="pp-inline-input"
                                  value={p.complexidade ?? ''}
                                  disabled={
                                    !podeEditar(selected.statusFluxo) || p.tipo !== 'Serviço'
                                  }
                                  onChange={(e) =>
                                    updateProduto(p.id, {
                                      complexidade: e.target.value as Complexidade,
                                    })
                                  }
                                >
                                  <option value="">—</option>
                                  {COMPLEXIDADES.filter(Boolean).map((c) => (
                                    <option key={c}>{c}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input"
                                  type="number"
                                  value={p.peso ?? ''}
                                  disabled={
                                    !podeEditar(selected.statusFluxo) || p.tipo !== 'Serviço'
                                  }
                                  onChange={(e) =>
                                    updateProduto(p.id, {
                                      peso:
                                        e.target.value === ''
                                          ? undefined
                                          : Number(e.target.value),
                                    })
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input"
                                  type="number"
                                  value={p.quantidadeMetrica ?? ''}
                                  disabled={
                                    !podeEditar(selected.statusFluxo) || p.tipo !== 'Serviço'
                                  }
                                  onChange={(e) =>
                                    updateProduto(p.id, {
                                      quantidadeMetrica:
                                        e.target.value === ''
                                          ? undefined
                                          : Number(e.target.value),
                                    })
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input"
                                  value={p.codigoSiag ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { codigoSiag: e.target.value })
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="pp-inline-input"
                                  value={p.codigoProtheus ?? ''}
                                  disabled={!podeEditar(selected.statusFluxo)}
                                  onChange={(e) =>
                                    updateProduto(p.id, { codigoProtheus: e.target.value })
                                  }
                                />
                              </td>
                              
                            </>
                          )}
                          {!visaoPlanilha && <td>{p.tipo}</td>}
                          <td>
                            {podeEditar(selected.statusFluxo) ? (
                              <select
                                className="pp-inline-input"
                                value={p.status}
                                onChange={(e) =>
                                  updateProduto(p.id, {
                                    status: e.target.value as StatusProduto,
                                  })
                                }
                              >
                                {STATUS_PRODUTO.map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="pc-dem-plain">{p.status}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!visaoPlanilha && (
                  <p className="pc-lead" style={{ marginTop: 8 }}>
                    Lista simples. Use visão planilha para modelo, cobrança, período, grupo da
                    parceria, SIAG/Protheus e campos novos da reunião (rótulos em MAIÚSCULAS) —
                    sem custo/markup/%.
                  </p>
                )}
                {visaoPlanilha && (
                  <p className="pc-lead pp-nota-campos-novos" style={{ marginTop: 8 }}>
                    Colunas em <strong>MAIÚSCULAS</strong> = campos Protheus novos.{' '}
                    <strong>(OBR)</strong> = obrigatório o Atlas ter (asterisco no Protheus /
                    lista confirmada na reunião). CONTA CONTÁBIL fica sem (OBR) — só código
                    texto, obrigatoriedade no Atlas ainda a confirmar.
                  </p>
                )}
              </AccordionBlock>

              <AccordionBlock
                id="envio"
                title="Envio à MTI e histórico"
                icon="send"
                open={acordeoesAbertos.includes('envio')}
                onToggle={toggleAcordeao}
              >
                <label className="pp-msg">
                  Mensagem ao analista MTI (opcional)
                  <textarea
                    className="sy-dem-input"
                    rows={3}
                    value={msgEnvio}
                    disabled={!podeEditar(selected.statusFluxo)}
                    onChange={(e) => setMsgEnvio(e.target.value)}
                  />
                </label>

                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  onChange={(e) => {
                    onImportCsvIntoSelected(e.target.files?.[0] ?? null)
                    e.target.value = ''
                  }}
                />

                <div className="pp-actions">
                  {podeEditar(selected.statusFluxo) && (
                    <>
                      <button type="button" className="pc-btn" onClick={baixarTemplate}>
                        Template CSV
                      </button>
                      <button
                        type="button"
                        className="pc-btn"
                        onClick={() => csvInputRef.current?.click()}
                      >
                        Importar CSV
                      </button>
                    </>
                  )}
                  <button type="button" className="pc-btn" onClick={exportCsv}>
                    Exportar CSV
                  </button>
                  <button type="button" className="pc-btn" onClick={exportPdf}>
                    Exportar PDF
                  </button>
                  {(selected.statusFluxo === 'Reprovado' ||
                    selected.statusFluxo === 'Paralisado') && (
                    <button
                      type="button"
                      className="pc-btn pc-btn--primary"
                      onClick={clonarComoRascunho}
                    >
                      Novo rascunho a partir deste
                    </button>
                  )}
                </div>

                <div className="pp-sim">
                  <h3 className="sy-accordion__section-title">Simular backoffice MTI (protótipo)</h3>
                  <p className="pc-muted">
                    Em produção a MTI age só no backoffice; aqui o botão espelha o status no portal.
                  </p>
                  <div className="pp-actions">
                    <button type="button" className="pc-btn" onClick={() => simularParecerMti('ajuste')}>
                      MTI: solicitar ajuste
                    </button>
                    <button type="button" className="pc-btn" onClick={() => simularParecerMti('aprovar')}>
                      MTI: aprovar
                    </button>
                    <button type="button" className="pc-btn" onClick={() => simularParecerMti('publicar')}>
                      MTI: publicar
                    </button>
                    <button type="button" className="pc-btn" onClick={() => simularParecerMti('reprovar')}>
                      MTI: reprovar
                    </button>
                    <button type="button" className="pc-btn" onClick={() => simularParecerMti('paralisar')}>
                      MTI: paralisar
                    </button>
                  </div>
                </div>

                {(selected.historico?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="sy-accordion__section-title">Histórico do status</h3>
                    <ul className="pp-list">
                      {selected.historico!.map((h, i) => (
                        <li key={`${h.em}-${i}`}>
                          <strong>{h.status}</strong>
                          <span className="pc-muted">
                            {new Date(h.em).toLocaleString('pt-BR')}
                            {h.detalhe ? ` — ${h.detalhe}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AccordionBlock>
            </div>

            <div className="pc-org-form-footer">
              <button
                type="button"
                className="pc-org-form-footer__cancel"
                onClick={() => navigate('catalogos')}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  close
                </span>
                Cancelar
              </button>
              {podeEditar(selected.statusFluxo) ? (
                <>
                  <button
                    type="button"
                    className="pc-org-form-footer__cancel"
                    onClick={salvarRascunho}
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      save
                    </span>
                    Salvar rascunho
                  </button>
                  <button
                    type="button"
                    className="pc-org-form-footer__primary"
                    onClick={enviarMti}
                    disabled={!podeEnviar(selected.statusFluxo) || selected.produtos.length < 1}
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      check
                    </span>
                    Enviar à MTI
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="pc-org-form-footer__primary"
                  onClick={() => navigate('catalogos')}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    check
                  </span>
                  Voltar aos catálogos
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="pc-footer">
        <div className="pc-footer__brand">
          <span className="pc-brand__mti">MTI</span>
          <span className="pc-brand__text pc-brand__text--sub">
            Empresa Mato-grossense de Tecnologia da Informação
          </span>
        </div>
        <p className="pc-footer__powered">Powered by SYDLE</p>
      </footer>

      <button
        type="button"
        className="pc-float"
        aria-label="Ajuda"
        onClick={() => showToast('Suporte: portal.atlas@mti.mt.gov.br')}
      >
        <span className="material-symbols-outlined">support_agent</span>
      </button>

      {toast && (
        <div className="pc-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
