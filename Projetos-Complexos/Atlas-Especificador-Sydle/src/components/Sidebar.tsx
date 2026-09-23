import { useCallback, useEffect, useLayoutEffect, useRef, useState, type DragEvent } from 'react'
import type { FormDef, FormMethod, FormMethodKind, FormSectionLayout } from '../types'
import FieldListEditor from './FieldListEditor'
import FormExampleValuesTab from './FormExampleValuesTab'
import FormMetadataTab from './FormMetadataTab'
import { isSectionedForm, parseSectionSegments } from '../utils/formSections'
import { normalizeSectionIconLigature } from '../utils/sectionIcon'

const SECTION_LAYOUT_OPTIONS: { value: FormSectionLayout; label: string }[] = [
  { value: 'none', label: 'Sem seções' },
  { value: 'accordion', label: 'Acordeões' },
  { value: 'tabs', label: 'Abas' },
]

const METHOD_KIND_OPTIONS: { value: FormMethodKind; label: string }[] = [
  { value: 'destaque', label: 'Destaque' },
  { value: 'menu', label: 'Menu' },
]

type SidebarTab = 'fields' | 'sections' | 'methods' | 'metadata' | 'examples'

interface Props {
  formName: string
  form: FormDef
  epicForms: FormDef[]
  onAddField: () => void
  onUpdateField: (id: string, patch: Partial<import('../types').FormField>) => void
  onRemoveField: (id: string) => void
  onReorderFields: (fromIndex: number, toIndex: number) => void
  onOpenLinkedForm: (formId: string) => void
  onSetSectionLayout: (layout: FormSectionLayout) => void
  onAddFormSection: () => void
  onRemoveFormSection: (sectionId: string) => void
  onRenameFormSection: (sectionId: string, title: string) => void
  onSetSectionIcon: (sectionId: string, icon: string) => void
  onReorderFormSections: (fromIndex: number, toIndex: number) => void
  /** Só com layout em abas: cria sub-seção sob a aba indicada. */
  onAddFormSubSection: (parentTabSectionId: string) => void
  onAddFormMethod: () => void
  onUpdateFormMethod: (methodId: string, patch: Partial<FormMethod>) => void
  onRemoveFormMethod: (methodId: string) => void
  onMutateForm: (updater: (form: FormDef) => FormDef) => void
}

export default function Sidebar({
  formName,
  form,
  epicForms,
  onAddField,
  onUpdateField,
  onRemoveField,
  onReorderFields,
  onOpenLinkedForm,
  onSetSectionLayout,
  onAddFormSection,
  onRemoveFormSection,
  onRenameFormSection,
  onSetSectionIcon,
  onReorderFormSections,
  onAddFormSubSection,
  onAddFormMethod,
  onUpdateFormMethod,
  onRemoveFormMethod,
  onMutateForm,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)
  /** Sub-seção (aba) com painel expandido na sidebar. */
  const [openSubSectionId, setOpenSubSectionId] = useState<string | null>(null)
  const [openMethodId, setOpenMethodId] = useState<string | null>(null)
  const [sectionDragIndex, setSectionDragIndex] = useState<number | null>(null)
  const [sectionOverIndex, setSectionOverIndex] = useState<number | null>(null)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('fields')

  const sidebarTabsScrollRef = useRef<HTMLDivElement>(null)
  const sidebarTabsRowRef = useRef<HTMLDivElement>(null)
  const [sidebarScrollNav, setSidebarScrollNav] = useState({
    overflow: false,
    canLeft: false,
    canRight: false,
  })

  const updateSidebarScrollNav = useCallback(() => {
    const el = sidebarTabsScrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflow = scrollWidth > clientWidth + 1
    const maxScroll = scrollWidth - clientWidth
    setSidebarScrollNav({
      overflow,
      canLeft: overflow && scrollLeft > 2,
      canRight: overflow && scrollLeft < maxScroll - 2,
    })
  }, [])

  useLayoutEffect(() => {
    updateSidebarScrollNav()
  }, [sidebarTab, updateSidebarScrollNav])

  useEffect(() => {
    const scrollEl = sidebarTabsScrollRef.current
    const rowEl = sidebarTabsRowRef.current
    if (!scrollEl) return
    const ro = new ResizeObserver(() => updateSidebarScrollNav())
    ro.observe(scrollEl)
    if (rowEl) ro.observe(rowEl)
    return () => ro.disconnect()
  }, [updateSidebarScrollNav])

  function scrollSidebarTabs(dir: 'prev' | 'next') {
    const el = sidebarTabsScrollRef.current
    if (!el) return
    const amount = Math.max(120, Math.floor(el.clientWidth * 0.75))
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' })
  }

  const sectioned = isSectionedForm(form)
  const layout: FormSectionLayout = form.sectionLayout ?? 'none'
  const sectionSegments =
    sectioned && form.sections?.length ? parseSectionSegments(form.sections) : []
  /** Ordem livre no array `fields`; a seção de cada campo é só metadado (canvas / export). */
  const fieldsForList = form.fields

  function toggleSectionOpen(sectionId: string) {
    setOpenSectionId((prev) => (prev === sectionId ? null : sectionId))
  }

  function toggleSubSectionOpen(subSectionId: string) {
    setOpenSubSectionId((prev) => (prev === subSectionId ? null : subSectionId))
  }

  function toggleMethodOpen(methodId: string) {
    setOpenMethodId((prev) => (prev === methodId ? null : methodId))
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
      onReorderFormSections(sectionDragIndex, index)
    }
    setSectionDragIndex(null)
    setSectionOverIndex(null)
  }

  return (
    <aside className="sidebar">
      <header className="panel-header">
        <h2 className="panel-header__title panel-header__title--form">{formName}</h2>
      </header>

      <div
        className={`sidebar__tabs-wrap canvas__tabs-wrap${sidebarScrollNav.overflow ? ' canvas__tabs-wrap--scrollable' : ''}`}
      >
        <button
          type="button"
          className="canvas__tabs-nav canvas__tabs-nav--prev"
          disabled={!sidebarScrollNav.overflow || !sidebarScrollNav.canLeft}
          onClick={() => scrollSidebarTabs('prev')}
          aria-label="Rolar abas para a esquerda"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden className="canvas__tabs-nav-icon">
            <path
              d="M12 5l-5 5 5 5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div
          className="canvas__tabs-scrollport sidebar__tabs-scrollport"
          ref={sidebarTabsScrollRef}
          onScroll={updateSidebarScrollNav}
        >
          <div ref={sidebarTabsRowRef} className="canvas__tabs sidebar__form-tabs" role="tablist" aria-label="Configuração do formulário">
            <button
              type="button"
              role="tab"
              id="sidebar-tab-fields"
              aria-selected={sidebarTab === 'fields'}
              aria-controls="sidebar-panel-fields"
              tabIndex={sidebarTab === 'fields' ? 0 : -1}
              className={`sidebar__form-tab canvas__tab${sidebarTab === 'fields' ? ' canvas__tab--active' : ''}`}
              onClick={() => setSidebarTab('fields')}
            >
              Campos
            </button>
            <button
              type="button"
              role="tab"
              id="sidebar-tab-sections"
              aria-selected={sidebarTab === 'sections'}
              aria-controls="sidebar-panel-sections"
              tabIndex={sidebarTab === 'sections' ? 0 : -1}
              className={`sidebar__form-tab canvas__tab${sidebarTab === 'sections' ? ' canvas__tab--active' : ''}`}
              onClick={() => setSidebarTab('sections')}
            >
              Seções
            </button>
            <button
              type="button"
              role="tab"
              id="sidebar-tab-methods"
              aria-selected={sidebarTab === 'methods'}
              aria-controls="sidebar-panel-methods"
              tabIndex={sidebarTab === 'methods' ? 0 : -1}
              className={`sidebar__form-tab canvas__tab${sidebarTab === 'methods' ? ' canvas__tab--active' : ''}`}
              onClick={() => setSidebarTab('methods')}
            >
              Métodos
            </button>
            <button
              type="button"
              role="tab"
              id="sidebar-tab-metadata"
              aria-selected={sidebarTab === 'metadata'}
              aria-controls="sidebar-panel-metadata"
              tabIndex={sidebarTab === 'metadata' ? 0 : -1}
              className={`sidebar__form-tab canvas__tab${sidebarTab === 'metadata' ? ' canvas__tab--active' : ''}`}
              onClick={() => setSidebarTab('metadata')}
            >
              Metadata
            </button>
            <button
              type="button"
              role="tab"
              id="sidebar-tab-examples"
              aria-selected={sidebarTab === 'examples'}
              aria-controls="sidebar-panel-examples"
              tabIndex={sidebarTab === 'examples' ? 0 : -1}
              className={`sidebar__form-tab canvas__tab${sidebarTab === 'examples' ? ' canvas__tab--active' : ''}`}
              onClick={() => setSidebarTab('examples')}
            >
              Valores de exemplo
            </button>
          </div>
        </div>
        <button
          type="button"
          className="canvas__tabs-nav canvas__tabs-nav--next"
          disabled={!sidebarScrollNav.overflow || !sidebarScrollNav.canRight}
          onClick={() => scrollSidebarTabs('next')}
          aria-label="Rolar abas para a direita"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden className="canvas__tabs-nav-icon">
            <path
              d="M8 5l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        id="sidebar-panel-fields"
        role="tabpanel"
        aria-labelledby="sidebar-tab-fields"
        hidden={sidebarTab !== 'fields'}
        className="sidebar__panel sidebar__panel--fields"
      >
        <FieldListEditor
          fields={fieldsForList}
          epicForms={epicForms}
          currentFormId={form.id}
          onOpenLinkedForm={onOpenLinkedForm}
          onAddField={onAddField}
          onUpdateField={onUpdateField}
          onRemoveField={onRemoveField}
          onReorderFields={onReorderFields}
          controlledOpen={{ openFieldId: openId, onOpenChange: setOpenId }}
          emptyHint="Nenhum campo adicionado"
          addButtonLabel="Adicionar campo"
          addButtonClassName="sidebar__add-btn"
          sectionEditor={
            sectioned && form.sections?.length
              ? {
                  sections: form.sections,
                  sectionLayout: form.sectionLayout ?? 'accordion',
                }
              : undefined
          }
          onMutateForm={onMutateForm}
        />
      </div>

      <div
        id="sidebar-panel-examples"
        role="tabpanel"
        aria-labelledby="sidebar-tab-examples"
        hidden={sidebarTab !== 'examples'}
        className="sidebar__panel sidebar__panel--examples"
      >
        <FormExampleValuesTab form={form} epicForms={epicForms} onMutateForm={onMutateForm} />
      </div>

      <div
        id="sidebar-panel-sections"
        role="tabpanel"
        aria-labelledby="sidebar-tab-sections"
        hidden={sidebarTab !== 'sections'}
        className="sidebar__panel sidebar__panel--sections"
      >
        <div className="sidebar__sections-head">
          <label className="acc__field">
            <span className="acc__label">Layout das seções</span>
            <select
              className="acc__input acc__select"
              value={layout}
              onChange={(e) => onSetSectionLayout(e.target.value as FormSectionLayout)}
            >
              {SECTION_LAYOUT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {!sectioned && (
            <p className="sidebar__sections-hint sidebar__sections-hint--muted">
              Escolha acordeões ou abas para dividir o formulário em seções e nomeá-las abaixo.
            </p>
          )}
          {sectioned && (
            <p className="sidebar__sections-hint">
              Cada campo raiz pertence a uma seção. Novos campos entram na primeira seção (aba ou
              painel). Na aba Campos, use o seletor de seção em cada campo para mover entre abas ou
              sub-seções.
              {layout === 'tabs'
                ? ' Com layout em abas, pode criar sub-seções em acordeão dentro de cada aba.'
                : null}
            </p>
          )}
        </div>
        {sectioned && form.sections && (
          <div className="sidebar__list">
            {sectionSegments.map((seg, i) => {
              const s = seg.tab
              const lig = normalizeSectionIconLigature(s.icon)
              const isOpen = openSectionId === s.id
              const isDragging = sectionDragIndex === i
              const isDragOver =
                sectionOverIndex === i && sectionDragIndex !== i && sectionDragIndex !== null
              const topCount = sectionSegments.length
              return (
                <div
                  key={s.id}
                  onDragOver={(e) => handleSectionDragOver(i, e)}
                  onDrop={(e) => handleSectionDrop(i, e)}
                >
                  <div
                    className={`acc${isOpen ? ' acc--open' : ''}${isDragging ? ' acc--dragging' : ''}${isDragOver ? ' acc--drag-over' : ''}`}
                    data-index={i}
                  >
                    <button
                      type="button"
                      className="acc__header"
                      onClick={() => toggleSectionOpen(s.id)}
                      aria-label={`${s.title || 'Sem nome'}, ${layout === 'tabs' ? 'aba' : 'seção'}`}
                    >
                      <span
                        className="acc__drag-handle"
                        draggable
                        onDragStart={(e) => handleSectionDragStart(i, e)}
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
                        {lig ? (
                          <span className="material-symbols-outlined acc__section-icon" aria-hidden>
                            {lig}
                          </span>
                        ) : (
                          <span className="acc__section-icon-placeholder" aria-hidden>
                            ◇
                          </span>
                        )}
                        <span className="acc__name">{s.title || 'Sem nome'}</span>
                      </span>
                      <svg
                        className="acc__chevron"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
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

                    {isOpen && (
                      <div className="acc__body">
                        <label className="acc__field">
                          <span className="acc__label">Título</span>
                          <input
                            type="text"
                            className="acc__input"
                            value={s.title}
                            onChange={(e) => onRenameFormSection(s.id, e.target.value)}
                          />
                        </label>
                        <label className="acc__field">
                          <span className="acc__label">Ícone Material</span>
                          <input
                            type="text"
                            className="acc__input"
                            value={s.icon ?? ''}
                            onChange={(e) => onSetSectionIcon(s.id, e.target.value)}
                            placeholder="ex: description"
                            spellCheck={false}
                            autoCapitalize="off"
                          />
                        </label>
                        {layout === 'tabs' && (
                          <div className="sidebar__subsection-block">
                            <span className="acc__label">Sub-seções</span>
                            {seg.children.length === 0 ? (
                              <p className="sidebar__sections-hint sidebar__sections-hint--muted">
                                Nenhuma sub-seção. Os campos podem ficar diretos no painel da aba.
                              </p>
                            ) : (
                              <div className="sidebar__subsection-acc-list">
                                {seg.children.map((child) => {
                                  const childLig = normalizeSectionIconLigature(child.icon)
                                  const subOpen = openSubSectionId === child.id
                                  return (
                                    <div
                                      key={child.id}
                                      className={`acc acc--nested${subOpen ? ' acc--open' : ''}`}
                                    >
                                      <button
                                        type="button"
                                        className="acc__header acc__header--nested"
                                        onClick={() => toggleSubSectionOpen(child.id)}
                                        aria-label={`${child.title || 'Sem nome'}, sub-seção`}
                                      >
                                        <span className="acc__header-main">
                                          {childLig ? (
                                            <span
                                              className="material-symbols-outlined acc__section-icon"
                                              aria-hidden
                                            >
                                              {childLig}
                                            </span>
                                          ) : (
                                            <span className="acc__section-icon-placeholder" aria-hidden>
                                              ◇
                                            </span>
                                          )}
                                          <span className="acc__name">{child.title || 'Sem nome'}</span>
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
                                      {subOpen && (
                                        <div className="acc__body acc__body--nested">
                                          <label className="acc__field">
                                            <span className="acc__label">Título</span>
                                            <input
                                              type="text"
                                              className="acc__input"
                                              value={child.title}
                                              onChange={(e) => onRenameFormSection(child.id, e.target.value)}
                                            />
                                          </label>
                                          <label className="acc__field">
                                            <span className="acc__label">Ícone Material</span>
                                            <input
                                              type="text"
                                              className="acc__input"
                                              value={child.icon ?? ''}
                                              onChange={(e) => onSetSectionIcon(child.id, e.target.value)}
                                              placeholder="ex: folder_open"
                                              spellCheck={false}
                                              autoCapitalize="off"
                                            />
                                          </label>
                                          <button
                                            type="button"
                                            className="acc__remove acc__remove--nested"
                                            onClick={() => {
                                              if (openSubSectionId === child.id) setOpenSubSectionId(null)
                                              onRemoveFormSection(child.id)
                                            }}
                                          >
                                            Remover sub-seção
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            <button
                              type="button"
                              className="sidebar__add-btn sidebar__add-btn--nested"
                              onClick={() => onAddFormSubSection(s.id)}
                            >
                              <span className="sidebar__add-icon">+</span>
                              Nova sub-seção
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          className="acc__remove"
                          onClick={() => {
                            if (openSectionId === s.id) setOpenSectionId(null)
                            if (seg.children.some((c) => c.id === openSubSectionId)) {
                              setOpenSubSectionId(null)
                            }
                            onRemoveFormSection(s.id)
                          }}
                          disabled={topCount <= 1}
                          title={
                            topCount <= 1
                              ? 'Mantenha ao menos uma seção de topo'
                              : layout === 'tabs'
                                ? 'Remover aba e as suas sub-seções'
                                : 'Remover seção (campos vão para a primeira seção)'
                          }
                        >
                          {layout === 'tabs' ? 'Remover aba' : 'Remover seção'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <button type="button" className="sidebar__add-btn" onClick={onAddFormSection}>
              <span className="sidebar__add-icon">+</span>
              {layout === 'tabs' ? 'Nova aba' : 'Nova seção'}
            </button>
          </div>
        )}
      </div>

      <div
        id="sidebar-panel-methods"
        role="tabpanel"
        aria-labelledby="sidebar-tab-methods"
        hidden={sidebarTab !== 'methods'}
        className="sidebar__panel sidebar__panel--methods"
      >
        <div className="sidebar__methods-head">
          <p className="sidebar__sections-hint">
            Cada formulário tem a sua própria lista de métodos. Defina nome, ícone Material e se o
            método é <strong>Destaque</strong> ou <strong>Menu</strong>.
          </p>
        </div>
        <div className="sidebar__list">
          {(form.methods ?? []).length === 0 ? (
            <p className="sidebar__empty">Nenhum método configurado.</p>
          ) : (
            (form.methods ?? []).map((m) => {
              const lig = normalizeSectionIconLigature(m.icon)
              const isOpen = openMethodId === m.id
              return (
                <div key={m.id} className={`acc${isOpen ? ' acc--open' : ''}`}>
                  <button
                    type="button"
                    className="acc__header"
                    onClick={() => toggleMethodOpen(m.id)}
                    aria-label={`${m.name || 'Sem nome'}, método`}
                  >
                    <span className="acc__header-main">
                      {lig ? (
                        <span className="material-symbols-outlined acc__section-icon" aria-hidden>
                          {lig}
                        </span>
                      ) : (
                        <span className="acc__section-icon-placeholder" aria-hidden>
                          ◇
                        </span>
                      )}
                      <span className="acc__name">{m.name || 'Sem nome'}</span>
                      <span className="sidebar__method-kind-badge">
                        {m.kind === 'destaque' ? 'Destaque' : 'Menu'}
                      </span>
                    </span>
                    <svg
                      className="acc__chevron"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
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
                  {isOpen && (
                    <div className="acc__body">
                      <label className="acc__field">
                        <span className="acc__label">Nome</span>
                        <input
                          type="text"
                          className="acc__input"
                          value={m.name}
                          onChange={(e) => onUpdateFormMethod(m.id, { name: e.target.value })}
                        />
                      </label>
                      <label className="acc__field">
                        <span className="acc__label">Ícone Material</span>
                        <input
                          type="text"
                          className="acc__input"
                          value={m.icon}
                          onChange={(e) => onUpdateFormMethod(m.id, { icon: e.target.value })}
                          placeholder="ex: hub"
                          spellCheck={false}
                          autoCapitalize="off"
                        />
                      </label>
                      <label className="acc__field">
                        <span className="acc__label">Tipo</span>
                        <select
                          className="acc__input acc__select"
                          value={m.kind}
                          onChange={(e) =>
                            onUpdateFormMethod(m.id, { kind: e.target.value as FormMethodKind })
                          }
                        >
                          {METHOD_KIND_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="acc__remove"
                        onClick={() => {
                          if (openMethodId === m.id) setOpenMethodId(null)
                          onRemoveFormMethod(m.id)
                        }}
                      >
                        Remover método
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
          <button type="button" className="sidebar__add-btn" onClick={onAddFormMethod}>
            <span className="sidebar__add-icon">+</span>
            Novo método
          </button>
        </div>
      </div>

      <div
        id="sidebar-panel-metadata"
        role="tabpanel"
        aria-labelledby="sidebar-tab-metadata"
        hidden={sidebarTab !== 'metadata'}
        className="sidebar__panel sidebar__panel--metadata"
      >
        <FormMetadataTab form={form} onMutateForm={onMutateForm} />
      </div>
    </aside>
  )
}
