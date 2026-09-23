import { lazy, Suspense, useState, type DragEvent } from 'react'
import type {
  ServicePortalCatalogService,
  ServicePortalHomeCatalogSection,
  ServicePortalHomePageData,
  ServicePortalHomeSection,
  ServicePortalHomeSectionType,
} from '../../types'
import { getServicePortalHomeSections, resolveCatalogMaxColumns, resolveCatalogMaxRows } from '../../utils/servicePortalHomeData'
import FlowStepConfigAutosizeTextarea from '../FlowStepConfigAutosizeTextarea'
import ServicePortalFieldHelpLabel from './ServicePortalFieldHelpLabel'

const FlowStepHtmlEditor = lazy(() => import('../FlowStepHtmlEditor'))

interface Props {
  data: ServicePortalHomePageData
  onChange: (patch: Partial<ServicePortalHomePageData>) => void
}

const CATALOG_MAX_COLUMNS_OPTIONS = [1, 2, 3, 4, 5, 6] as const
const CATALOG_DISPLAY_ROW_OPTIONS = [1, 2, 3, 4, 5] as const

const PORTAL_HOME_PAGE_BG: { value: string; label: string }[] = [
  { value: '#ffffff', label: 'Branco' },
  { value: '#F5F5F5', label: 'Cinza claro (#F5F5F5)' },
]

const PORTAL_HEADER_TEXT_COLOR: { value: string; label: string }[] = [
  { value: '#ffffff', label: 'Branco' },
  { value: '#000000', label: 'Preto' },
]

/** Só #ffffff e #F5F5F5; fora disso, assume branco. */
function selectPortalPageBg(value: string | undefined): string {
  if (!value?.trim()) return '#ffffff'
  const t = value.trim().toLowerCase()
  if (t === '#ffffff' || t === '#fff') return '#ffffff'
  if (t === '#f5f5f5') return '#F5F5F5'
  return '#ffffff'
}

/** Só preto e braco; #111827 antigo conta como preto. */
function selectHeaderTextColor(value: string | undefined): string {
  if (!value?.trim()) return '#000000'
  const t = value.trim().toLowerCase()
  if (t === '#ffffff' || t === '#fff') return '#ffffff'
  if (t === '#000000' || t === '#000' || t === '#111827') return '#000000'
  return '#000000'
}

export default function ServicePortalHomePageConfigNested({ data, onChange }: Props) {
  const [openHelpId, setOpenHelpId] = useState<string | null>(null)
  const [openGroups, setOpenGroups] = useState({ general: false, header: false })
  const [openSectionAcc, setOpenSectionAcc] = useState<Record<string, boolean>>({})
  const [openServiceAcc, setOpenServiceAcc] = useState<Record<string, boolean>>({})
  const [sectionDragIndex, setSectionDragIndex] = useState<number | null>(null)
  const [sectionOverIndex, setSectionOverIndex] = useState<number | null>(null)

  const sections = getServicePortalHomeSections(data)
  const menuOptions = data.servicePortalHeaderMenuOptions ?? []

  function newId(prefix: string) {
    return crypto.randomUUID?.() ?? `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  }

  function saveSections(nextSections: ServicePortalHomeSection[]) {
    onChange({
      servicePortalHomeSections: nextSections.length > 0 ? nextSections : undefined,
      servicePortalCatalogs: undefined,
      servicePortalCatalogServices: undefined,
    })
  }

  function updateCatalogSection(sectionId: string, patch: Partial<ServicePortalHomeCatalogSection>) {
    saveSections(
      sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'catalog') return section
        return { ...section, ...patch, services: section.services ?? [] }
      }),
    )
  }

  function updateHtmlSection(sectionId: string, patch: { htmlContent?: string }) {
    saveSections(
      sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'html') return section
        return { ...section, ...patch }
      }),
    )
  }

  function reorderSections(fromIndex: number, toIndex: number) {
    if (sections.length < 2 || fromIndex === toIndex) return
    if (fromIndex < 0 || fromIndex >= sections.length) return
    if (toIndex < 0 || toIndex >= sections.length) return
    const next = [...sections]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    saveSections(next)
  }

  function handleSectionDragStart(index: number, e: DragEvent) {
    setSectionDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  function handleSectionDragEnd() {
    setSectionDragIndex(null)
    setSectionOverIndex(null)
  }

  function handleSectionDragOver(index: number, e: DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (sectionOverIndex !== index) setSectionOverIndex(index)
  }

  function handleSectionDrop(index: number, e: DragEvent) {
    e.preventDefault()
    if (sectionDragIndex !== null && sectionDragIndex !== index) {
      reorderSections(sectionDragIndex, index)
    }
    setSectionDragIndex(null)
    setSectionOverIndex(null)
  }

  function addSection(kind: ServicePortalHomeSectionType) {
    const id = newId('section')
    if (kind === 'html') {
      saveSections([...sections, { id, type: 'html', htmlContent: '' }])
    } else {
      saveSections([
        ...sections,
        {
          id,
          type: 'catalog',
          name: `Novo catálogo ${sections.filter((s) => s.type === 'catalog').length + 1}`,
          gridColumns: 3,
          gridRows: 2,
          services: [],
        },
      ])
    }
    setOpenSectionAcc((prev) => ({ ...prev, [id]: true }))
  }

  function removeSection(sectionId: string) {
    saveSections(sections.filter((s) => s.id !== sectionId))
  }

  function updateService(sectionId: string, serviceId: string, patch: Partial<ServicePortalCatalogService>) {
    saveSections(
      sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'catalog') return section
        return {
          ...section,
          services: (section.services ?? []).map((service) =>
            service.id === serviceId ? { ...service, ...patch } : service,
          ),
        }
      }),
    )
  }

  function addServiceToCatalog(sectionId: string) {
    const nextId = newId('service')
    saveSections(
      sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'catalog') return section
        return {
          ...section,
          services: [
            ...(section.services ?? []),
            { id: nextId, name: '', description: '', icon: 'description' },
          ],
        }
      }),
    )
    setOpenServiceAcc((prev) => ({ ...prev, [nextId]: false }))
  }

  function removeService(sectionId: string, serviceId: string) {
    saveSections(
      sections.map((section) => {
        if (section.id !== sectionId || section.type !== 'catalog') return section
        return { ...section, services: (section.services ?? []).filter((service) => service.id !== serviceId) }
      }),
    )
  }

  function updateMenuOption(index: number, value: string) {
    const next = menuOptions.map((item, idx) => (idx === index ? value : item))
    onChange({ servicePortalHeaderMenuOptions: next.filter((item) => item.trim()) })
  }

  function addMenuOption() {
    onChange({ servicePortalHeaderMenuOptions: [...menuOptions, ''] })
  }

  function removeMenuOption(index: number) {
    const next = menuOptions.filter((_, idx) => idx !== index)
    onChange({ servicePortalHeaderMenuOptions: next.length > 0 ? next : undefined })
  }

  return (
    <div className="flow-step-config__bpmn">
      <div className={`acc${openGroups.general ? ' acc--open' : ''}`}>
        <button
          type="button"
          className="acc__header"
          onClick={() => setOpenGroups((prev) => ({ ...prev, general: !prev.general }))}
          aria-expanded={openGroups.general}
          aria-label="Configurações gerais, expandir ou recolher seção de configuração"
        >
          <span className="acc__header-main">
            <span className="acc__name">Configurações gerais</span>
          </span>
          <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {openGroups.general ? (
          <div className="acc__body">
            <ServicePortalFieldHelpLabel
              id="sp-home-color-primary"
              label="Cor primária"
              help="Fundo do header (barra superior). Hex, ex.: #0c1ba8."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <input
                type="text"
                className="acc__input"
                value={data.servicePortalHomeColorPrimary ?? ''}
                onChange={(e) =>
                  onChange({ servicePortalHomeColorPrimary: e.target.value.trim() === '' ? undefined : e.target.value })
                }
                placeholder="#ffffff"
                autoComplete="off"
              />
            </ServicePortalFieldHelpLabel>
            <ServicePortalFieldHelpLabel
              id="sp-home-color-secondary"
              label="Cor secundária"
              help="Realce no hover dos itens do menu do header, ícones dos cards (e ícone de busca no hero) e sino de notificações."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <input
                type="text"
                className="acc__input"
                value={data.servicePortalHomeColorSecondary ?? ''}
                onChange={(e) =>
                  onChange({ servicePortalHomeColorSecondary: e.target.value.trim() === '' ? undefined : e.target.value })
                }
                placeholder="#7c3aed"
                autoComplete="off"
              />
            </ServicePortalFieldHelpLabel>
            <ServicePortalFieldHelpLabel
              id="sp-home-color-text"
              label="Cor do texto do header"
              help="Texto da marca, menu e avatar no header: branco ou preto (não afeta títulos do conteúdo abaixo)."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <select
                className="acc__input acc__select"
                value={selectHeaderTextColor(data.servicePortalHomeColorText)}
                onChange={(e) =>
                  onChange({
                    servicePortalHomeColorText: e.target.value as '#ffffff' | '#000000',
                  })
                }
                aria-label="Cor do texto do header: branco ou preto"
              >
                {PORTAL_HEADER_TEXT_COLOR.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </ServicePortalFieldHelpLabel>
            <ServicePortalFieldHelpLabel
              id="sp-home-color-bg"
              label="Cor do fundo"
              help="Fundo geral da página do portal: branco ou cinza claro (#F5F5F5)."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <select
                className="acc__input acc__select"
                value={selectPortalPageBg(data.servicePortalHomeColorBackground)}
                onChange={(e) =>
                  onChange({
                    servicePortalHomeColorBackground: e.target.value as '#ffffff' | '#F5F5F5',
                  })
                }
                aria-label="Cor de fundo da página: branco ou cinza claro"
              >
                {PORTAL_HOME_PAGE_BG.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </ServicePortalFieldHelpLabel>
            <ServicePortalFieldHelpLabel
              id="sp-home-logo"
              label="Logotipo (URL)"
              help="Endereço de uma imagem (PNG, SVG, WebP) exibida no header no lugar do placeholder."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <input
                type="url"
                className="acc__input"
                value={data.servicePortalHomeLogoUrl ?? ''}
                onChange={(e) =>
                  onChange({ servicePortalHomeLogoUrl: e.target.value.trim() === '' ? undefined : e.target.value })
                }
                placeholder="https://…"
                autoComplete="off"
              />
            </ServicePortalFieldHelpLabel>
            <ServicePortalFieldHelpLabel
              id="sp-home-cover"
              label="Imagem de capa (URL)"
              help="Imagem de fundo da faixa colorida (hero). Se vazia, usa o degradê padrão."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <input
                type="url"
                className="acc__input"
                value={data.servicePortalHomeCoverImageUrl ?? ''}
                onChange={(e) =>
                  onChange({ servicePortalHomeCoverImageUrl: e.target.value.trim() === '' ? undefined : e.target.value })
                }
                placeholder="https://…"
                autoComplete="off"
              />
            </ServicePortalFieldHelpLabel>
          </div>
        ) : null}
      </div>

      <div className={`acc${openGroups.header ? ' acc--open' : ''}`}>
        <button
          type="button"
          className="acc__header"
          onClick={() => setOpenGroups((prev) => ({ ...prev, header: !prev.header }))}
          aria-expanded={openGroups.header}
          aria-label="Header, expandir ou recolher seção de configuração"
        >
          <span className="acc__header-main">
            <span className="acc__name">Header</span>
          </span>
          <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {openGroups.header ? (
          <div className="acc__body">
            <ServicePortalFieldHelpLabel
              id="sp-home-hero-title"
              label="Título principal"
              help="Título exibido na área hero da página inicial."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <input
                type="text"
                className="acc__input"
                value={data.servicePortalHomeHeroTitle ?? ''}
                onChange={(e) =>
                  onChange({ servicePortalHomeHeroTitle: e.target.value === '' ? undefined : e.target.value })
                }
                placeholder="Ex.: Portal de Serviços"
              />
            </ServicePortalFieldHelpLabel>

            <ServicePortalFieldHelpLabel
              id="sp-home-hero-subtitle"
              label="Subtítulo"
              help="Texto de apoio logo abaixo do título principal."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <FlowStepConfigAutosizeTextarea
                className="acc__input acc__textarea flow-step-config__textarea-doc"
                value={data.servicePortalHomeHeroSubtitle ?? ''}
                onChange={(e) =>
                  onChange({ servicePortalHomeHeroSubtitle: e.target.value === '' ? undefined : e.target.value })
                }
                placeholder="Ex.: Ministerio Publico do Estado de Minas Gerais"
              />
            </ServicePortalFieldHelpLabel>

            <ServicePortalFieldHelpLabel
              id="sp-home-menu-options"
              label="Opções de menu"
              help="Itens do menu superior. Adicione/remova opções livremente."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <div className="flow-step-config__paths">
                {menuOptions.length > 0 ? (
                  <div className="flow-step-config__paths-list">
                    {menuOptions.map((option, index) => (
                      <div key={`menu-option-${index}`} className="flow-step-config__paths-card">
                        <div className="flow-step-config__paths-card-head">
                          <span className="flow-step-config__paths-card-title">{`Opção ${index + 1}`}</span>
                          <button
                            type="button"
                            className="flow-step-config__paths-remove"
                            onClick={() => removeMenuOption(index)}
                            aria-label={`Remover opção ${index + 1}`}
                          >
                            <span className="material-symbols-outlined" aria-hidden>
                              delete
                            </span>
                          </button>
                        </div>
                        <input
                          type="text"
                          className="acc__input"
                          value={option}
                          onChange={(e) => updateMenuOption(index, e.target.value)}
                          placeholder="Ex.: Meu Painel"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="flow-step-config__placeholder-msg">Nenhuma opção de menu cadastrada.</p>
                )}
                <button type="button" className="acc__nested-add flow-step-config__paths-add" onClick={addMenuOption}>
                  + Adicionar opção
                </button>
              </div>
            </ServicePortalFieldHelpLabel>

            <ServicePortalFieldHelpLabel
              id="sp-home-notification-count"
              label="Contador de notificações"
              help="Número exibido no indicador de notificações no topo."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <input
                type="number"
                min={0}
                className="acc__input"
                value={data.servicePortalHeaderNotificationCount ?? 0}
                onChange={(e) =>
                  onChange({
                    servicePortalHeaderNotificationCount: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                placeholder="13"
              />
            </ServicePortalFieldHelpLabel>

            <ServicePortalFieldHelpLabel
              id="sp-home-user-initials"
              label="Iniciais do usuário"
              help="Texto exibido no avatar circular no topo."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <input
                type="text"
                className="acc__input"
                value={data.servicePortalHeaderUserInitials ?? ''}
                onChange={(e) =>
                  onChange({
                    servicePortalHeaderUserInitials: e.target.value === '' ? undefined : e.target.value,
                  })
                }
                placeholder="MF"
              />
            </ServicePortalFieldHelpLabel>

            <ServicePortalFieldHelpLabel
              id="sp-home-search-placeholder"
              label="Placeholder da busca"
              help="Texto de placeholder do campo de busca principal."
              openId={openHelpId}
              onToggle={setOpenHelpId}
            >
              <input
                type="text"
                className="acc__input"
                value={data.servicePortalHomeSearchPlaceholder ?? ''}
                onChange={(e) =>
                  onChange({
                    servicePortalHomeSearchPlaceholder: e.target.value === '' ? undefined : e.target.value,
                  })
                }
                placeholder="Buscar"
              />
            </ServicePortalFieldHelpLabel>
          </div>
        ) : null}
      </div>

      <section className="flow-step-config__section" aria-labelledby="sp-home-sections-heading">
        <h3 id="sp-home-sections-heading" className="flow-step-config__heading">
          Seções
        </h3>
        {sections.length > 0 ? (
          <div className="flow-step-config__paths-list">
            {sections.map((section, index) => {
                  const isSectionOpen = openSectionAcc[section.id] ?? false
                  const isDragging = sectionDragIndex === index
                  const isDragOver =
                    sectionOverIndex === index && sectionDragIndex !== index && sectionDragIndex !== null
                  const headerTitle =
                    section.type === 'catalog'
                      ? section.name.trim() || `Catálogo ${index + 1}`
                      : `HTML · seção ${index + 1}`
                  const cardTitle =
                    section.type === 'catalog' ? `Catálogo · seção ${index + 1}` : `HTML · seção ${index + 1}`
                  return (
                    <div
                      key={section.id}
                      onDragOver={(e) => handleSectionDragOver(index, e)}
                      onDrop={(e) => handleSectionDrop(index, e)}
                    >
                      <div
                        className={`acc${isSectionOpen ? ' acc--open' : ''}${isDragging ? ' acc--dragging' : ''}${isDragOver ? ' acc--drag-over' : ''}`}
                      >
                        <button
                          type="button"
                          className="acc__header"
                          onClick={() => setOpenSectionAcc((prev) => ({ ...prev, [section.id]: !isSectionOpen }))}
                          aria-expanded={isSectionOpen}
                          aria-label={`Seção ${index + 1}, expandir ou recolher`}
                        >
                          <span
                            className="acc__drag-handle"
                            draggable
                            onDragStart={(e) => handleSectionDragStart(index, e)}
                            onDragEnd={handleSectionDragEnd}
                            onClick={(e) => e.stopPropagation()}
                            title="Arrastar para reordenar"
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                              <circle cx="5.5" cy="3.5" r="1.25" />
                              <circle cx="10.5" cy="3.5" r="1.25" />
                              <circle cx="5.5" cy="8" r="1.25" />
                              <circle cx="10.5" cy="8" r="1.25" />
                              <circle cx="5.5" cy="12.5" r="1.25" />
                              <circle cx="10.5" cy="12.5" r="1.25" />
                            </svg>
                          </span>
                          <span className="acc__header-main">
                            <span className="acc__name">{headerTitle}</span>
                          </span>
                          <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      {isSectionOpen ? (
                        <div className="acc__body">
                          <div className="flow-step-config__paths-card-head">
                            <span className="flow-step-config__paths-card-title">{cardTitle}</span>
                            <button
                              type="button"
                              className="flow-step-config__paths-remove"
                              onClick={() => removeSection(section.id)}
                              aria-label={`Remover seção ${index + 1}`}
                            >
                              <span className="material-symbols-outlined" aria-hidden>
                                delete
                              </span>
                            </button>
                          </div>
                          {section.type === 'catalog' ? (
                            <>
                              <label className="acc__field">
                                <span className="acc__label">Nome do catálogo</span>
                                <input
                                  type="text"
                                  className="acc__input"
                                  value={section.name}
                                  onChange={(e) => updateCatalogSection(section.id, { name: e.target.value })}
                                  placeholder="Ex.: Fiscalização Contratual"
                                />
                              </label>
                              <div className="flow-step-config__paths-card-fields">
                                <label className="flow-step-config__paths-field">
                                  <span className="acc__label">Colunas (largura igual; linha incompleta ao centro)</span>
                                  <select
                                    className="acc__input acc__select"
                                    value={String(resolveCatalogMaxColumns(section))}
                                    onChange={(e) =>
                                      updateCatalogSection(section.id, { gridColumns: Number(e.target.value) })
                                    }
                                    aria-label="Número de colunas, de 1 a 6"
                                  >
                                    {CATALOG_MAX_COLUMNS_OPTIONS.map((n) => (
                                      <option key={n} value={n}>
                                        {n}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label className="flow-step-config__paths-field">
                                  <span className="acc__label">Linhas no preview</span>
                                  <select
                                    className="acc__input acc__select"
                                    value={String(resolveCatalogMaxRows(section))}
                                    onChange={(e) =>
                                      updateCatalogSection(section.id, { gridRows: Number(e.target.value) })
                                    }
                                    aria-label="Linhas de exibição, de 1 a 5"
                                  >
                                    {CATALOG_DISPLAY_ROW_OPTIONS.map((n) => (
                                      <option key={n} value={n}>
                                        {n}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              </div>
                              <p className="flow-step-config__placeholder-msg flow-step-config__catalog-display-hint">
                                Mostra no máximo{' '}
                                {resolveCatalogMaxColumns(section) * resolveCatalogMaxRows(section)} serviços com nome
                                (colunas × linhas).
                              </p>
                              <div className="flow-step-config__rules-list">
                                {(section.services ?? []).length > 0 ? (
                                  (section.services ?? []).map((service, serviceIndex) => {
                                    const isServiceOpen = openServiceAcc[service.id] ?? false
                                    return (
                                      <div key={service.id} className={`acc${isServiceOpen ? ' acc--open' : ''}`}>
                                        <button
                                          type="button"
                                          className="acc__header"
                                          onClick={() =>
                                            setOpenServiceAcc((prev) => ({ ...prev, [service.id]: !isServiceOpen }))
                                          }
                                          aria-expanded={isServiceOpen}
                                          aria-label={`Serviço ${serviceIndex + 1}, expandir ou recolher`}
                                        >
                                          <span className="acc__header-main">
                                            <span className="acc__name">
                                              {service.name.trim() || `Serviço ${serviceIndex + 1}`}
                                            </span>
                                          </span>
                                          <svg
                                            className="acc__chevron"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden
                                          >
                                            <path
                                              d="M4 6l4 4 4-4"
                                              stroke="currentColor"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </button>
                                        {isServiceOpen ? (
                                          <div className="acc__body">
                                            <div className="flow-step-config__rules-card-head">
                                              <span className="flow-step-config__rules-card-title">{`Serviço ${serviceIndex + 1}`}</span>
                                              <button
                                                type="button"
                                                className="flow-step-config__rules-remove"
                                                onClick={() => removeService(section.id, service.id)}
                                                aria-label={`Remover serviço ${serviceIndex + 1}`}
                                              >
                                                <span className="material-symbols-outlined" aria-hidden>
                                                  delete
                                                </span>
                                              </button>
                                            </div>
                                            <div className="flow-step-config__paths-card-fields">
                                              <label className="flow-step-config__paths-field">
                                                <span className="acc__label">Nome</span>
                                                <input
                                                  type="text"
                                                  className="acc__input"
                                                  value={service.name}
                                                  onChange={(e) =>
                                                    updateService(section.id, service.id, { name: e.target.value })
                                                  }
                                                  placeholder="Ex.: Inclusão e exclusão de atores contratuais"
                                                />
                                              </label>
                                              <label className="flow-step-config__paths-field">
                                                <span className="acc__label">Descrição</span>
                                                <FlowStepConfigAutosizeTextarea
                                                  className="acc__input acc__textarea flow-step-config__textarea-doc"
                                                  value={service.description}
                                                  onChange={(e) =>
                                                    updateService(section.id, service.id, {
                                                      description: e.target.value,
                                                    })
                                                  }
                                                  placeholder="Descrição curta do serviço."
                                                />
                                              </label>
                                              <label className="flow-step-config__paths-field">
                                                <span className="acc__label">Ícone (Material Symbols)</span>
                                                <input
                                                  type="text"
                                                  className="acc__input"
                                                  value={service.icon}
                                                  onChange={(e) =>
                                                    updateService(section.id, service.id, { icon: e.target.value })
                                                  }
                                                  placeholder="Ex.: group_add"
                                                />
                                              </label>
                                            </div>
                                          </div>
                                        ) : null}
                                      </div>
                                    )
                                  })
                                ) : (
                                  <p className="flow-step-config__placeholder-msg">
                                    Nenhum serviço cadastrado neste catálogo.
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                className="acc__nested-add flow-step-config__rules-add"
                                onClick={() => addServiceToCatalog(section.id)}
                              >
                                + Adicionar serviço
                              </button>
                            </>
                          ) : (
                            <div className="flow-step-config__label flow-step-config__label--editor service-portal-home-config__html-editor-wrap">
                              <span className="flow-step-config__label-text">Conteúdo HTML</span>
                              <Suspense fallback={<p className="flow-step-config__editor-loading">Carregando editor…</p>}>
                                <FlowStepHtmlEditor
                                  value={section.htmlContent ?? ''}
                                  onChange={(htmlContent) => updateHtmlSection(section.id, { htmlContent })}
                                />
                              </Suspense>
                            </div>
                          )}
                        </div>
                      ) : null}
                      </div>
                    </div>
                  )
            })}
          </div>
        ) : (
          <p className="flow-step-config__placeholder-msg">Nenhuma seção cadastrada.</p>
        )}
        <div className="flow-step-config__paths-add-row flow-step-config__paths-add-row--stacked">
          <button type="button" className="sidebar__add-btn" onClick={() => addSection('catalog')}>
            <span className="sidebar__add-icon">+</span>
            Adicionar catálogo
          </button>
          <button type="button" className="sidebar__add-btn" onClick={() => addSection('html')}>
            <span className="sidebar__add-icon">+</span>
            Adicionar HTML
          </button>
        </div>
      </section>
    </div>
  )
}
