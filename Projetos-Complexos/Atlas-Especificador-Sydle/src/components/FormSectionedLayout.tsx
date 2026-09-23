import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { FormDef, FormField, FormSection } from '../types'
import { useCanvasFieldVisible } from '../hooks/useCanvasFieldVisible'
import type { CanvasEmbAncestor } from '../utils/canvasRuntimeValueKey'
import {
  getSectionFieldGroups,
  getTabPanelGroups,
  isSectionedForm,
  normalizeSectionedForm,
  type TabPanelGroup,
} from '../utils/formSections'
import { normalizeSectionIconLigature } from '../utils/sectionIcon'

function SectionMaterialIcon({ icon }: { icon?: string }) {
  const lig = normalizeSectionIconLigature(icon)
  if (!lig) return null
  return (
    <span className="material-symbols-outlined canvas__section-icon" aria-hidden>
      {lig}
    </span>
  )
}

function SectionAccordionBlock({
  section,
  fields,
  renderFields,
}: {
  section: FormSection
  fields: FormField[]
  renderFields: (fields: FormField[]) => ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="canvas__section canvas__section--accordion">
      <button
        type="button"
        className={`canvas__section-header${open ? ' canvas__section-header--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <svg className="canvas__section-chevron" viewBox="-1 -1 18 18" fill="none" aria-hidden>
          <path
            d="M6 4l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <SectionMaterialIcon icon={section.icon} />
        <span className="canvas__section-title">{section.title}</span>
        <span className="canvas__section-rule" aria-hidden />
      </button>
      {open && (
        <div className="canvas__section-body">
          {fields.length === 0 ? (
            <p className="canvas__section-empty">Nenhum campo nesta seção.</p>
          ) : (
            renderFields(fields)
          )}
        </div>
      )}
    </div>
  )
}

function SectionTabsBlock({
  groups,
  renderFields,
  layoutResetKey,
  fieldVisible,
  preferredTabSectionId,
}: {
  groups: TabPanelGroup[]
  renderFields: (fields: FormField[]) => ReactNode
  /** Ex.: id do formulário — repõe a aba ativa quando o contexto muda. */
  layoutResetKey: string
  fieldVisible: (f: FormField) => boolean
  /** Após método: saltar para a aba desta seção (se visível). */
  preferredTabSectionId?: string
}) {
  const [active, setActive] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tabsRowRef = useRef<HTMLDivElement>(null)
  const [scrollNav, setScrollNav] = useState({
    overflow: false,
    canLeft: false,
    canRight: false,
  })

  const updateScrollNav = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflow = scrollWidth > clientWidth + 1
    const maxScroll = scrollWidth - clientWidth
    setScrollNav({
      overflow,
      canLeft: overflow && scrollLeft > 2,
      canRight: overflow && scrollLeft < maxScroll - 2,
    })
  }, [])

  const visibleGroups = useMemo(
    () =>
      groups.filter((g) => {
        const anyDirect = g.directFields.some(fieldVisible)
        const anySub = g.subGroups.some((sg) => sg.fields.some(fieldVisible))
        return anyDirect || anySub
      }),
    [groups, fieldVisible],
  )

  useLayoutEffect(() => {
    updateScrollNav()
  }, [visibleGroups.length, layoutResetKey, updateScrollNav])

  useEffect(() => {
    const scrollEl = scrollRef.current
    const rowEl = tabsRowRef.current
    if (!scrollEl) return
    const ro = new ResizeObserver(() => updateScrollNav())
    ro.observe(scrollEl)
    if (rowEl) ro.observe(rowEl)
    return () => ro.disconnect()
  }, [updateScrollNav])

  useEffect(() => {
    setActive(0)
  }, [layoutResetKey])
  useEffect(() => {
    setActive((a) => (a >= visibleGroups.length ? Math.max(0, visibleGroups.length - 1) : a))
  }, [visibleGroups.length])

  useEffect(() => {
    if (!preferredTabSectionId) return
    const idx = visibleGroups.findIndex((g) => g.tab.id === preferredTabSectionId)
    if (idx >= 0) setActive(idx)
  }, [preferredTabSectionId, visibleGroups])

  const safeIndex = Math.min(active, Math.max(0, visibleGroups.length - 1))

  const scrollTabs = (dir: 'prev' | 'next') => {
    const el = scrollRef.current
    if (!el) return
    const amount = Math.max(120, Math.floor(el.clientWidth * 0.75))
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <div className="canvas__section canvas__section--tabs">
      <div
        className={`canvas__tabs-wrap${scrollNav.overflow ? ' canvas__tabs-wrap--scrollable' : ''}`}
      >
        <button
          type="button"
          className="canvas__tabs-nav canvas__tabs-nav--prev"
          disabled={!scrollNav.overflow || !scrollNav.canLeft}
          onClick={() => scrollTabs('prev')}
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
        <div className="canvas__tabs-scrollport" ref={scrollRef} onScroll={updateScrollNav}>
          <div ref={tabsRowRef} className="canvas__tabs" role="tablist">
            {visibleGroups.map((g, i) => (
              <button
                key={g.tab.id}
                type="button"
                role="tab"
                aria-selected={i === safeIndex}
                className={`canvas__tab${i === safeIndex ? ' canvas__tab--active' : ''}`}
                onClick={() => setActive(i)}
              >
                <SectionMaterialIcon icon={g.tab.icon} />
                <span>{g.tab.title}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="canvas__tabs-nav canvas__tabs-nav--next"
          disabled={!scrollNav.overflow || !scrollNav.canRight}
          onClick={() => scrollTabs('next')}
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
      {visibleGroups.map((g, i) => {
        const directVisible = g.directFields.filter(fieldVisible)
        const subBlocks = g.subGroups
          .map(({ sub, fields }) => ({
            sub,
            fields: fields.filter(fieldVisible),
          }))
          .filter(({ fields }) => fields.length > 0)
          .map(({ sub, fields }) => (
            <SectionAccordionBlock
              key={sub.id}
              section={sub}
              fields={fields}
              renderFields={renderFields}
            />
          ))
        const hasTabStructure = g.directFields.length > 0 || g.subGroups.length > 0
        const anyVisibleDirect = directVisible.length > 0
        const anyVisibleSub = subBlocks.length > 0
        return (
          <div
            key={g.tab.id}
            className="canvas__tab-panel"
            role="tabpanel"
            hidden={i !== safeIndex}
          >
            {anyVisibleDirect ? renderFields(directVisible) : null}
            {subBlocks}
            {!hasTabStructure ? (
              <p className="canvas__section-empty">Nenhum campo nesta seção.</p>
            ) : !anyVisibleDirect && !anyVisibleSub ? (
              <p className="canvas__section-empty">Nenhum campo nesta seção.</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Grelha do formulário com ou sem seções (acordeão / abas), igual ao canvas principal.
 * Usa `renderFields` para evitar dependência circular com `FormFieldsGrid`.
 */
export function FormSectionedLayout({
  form,
  renderFields,
  formContextBar,
  formReadMenuBar,
  formReadScrollTop,
  formFooter,
  nestedEmbeddedOverlay,
  popupBoundsClassName,
  readCanvas = false,
  fieldVisibilityCtx,
  preferredTabSectionId,
}: {
  form: FormDef
  renderFields: (fields: FormField[]) => ReactNode
  /** Faixa superior dentro do cartão (ex.: faixa cinza com nome + detalhamento). */
  formContextBar?: ReactNode
  /** Modo leitura: barra de métodos / pílulas, abaixo da faixa cinza e fora do scroll do miolo. */
  formReadMenuBar?: ReactNode
  /** Modo leitura: bloco que rola com o miolo (identidade + destaque), abaixo da faixa fixa. */
  formReadScrollTop?: ReactNode
  /** Rodapé dentro do cartão (ex.: ações decorativas). */
  formFooter?: ReactNode
  /** Overlay modal (ref. embutida em célula de tabela), ancorado ao miolo abaixo da faixa cinza. */
  nestedEmbeddedOverlay?: ReactNode
  /** Classes extra em `.canvas__form-popup-bounds` (ex.: modal aberto — puxar sob o intervalo do preface). */
  popupBoundsClassName?: string
  /** Canvas em só leitura: menos padding horizontal à volta da grelha de campos. */
  readCanvas?: boolean
  /** Avaliação de `fieldVisibilityRules` no canvas (formulário actual + cadeia de embutidos). */
  fieldVisibilityCtx: { canvasFormDefId: string; canvasAncestors: CanvasEmbAncestor[] }
  /** Após método: aba preferencial. */
  preferredTabSectionId?: string
}) {
  const fields = form.fields
  const fieldVisible = useCanvasFieldVisible(form, fieldVisibilityCtx)
  const hasVisibleField = fields.some(fieldVisible)
  if (fields.length === 0 || !hasVisibleField) {
    return <p className="canvas__section-empty">Nenhum campo neste formulário.</p>
  }
  const norm = normalizeSectionedForm(form)
  const readCls = readCanvas ? ' canvas__form--read' : ''
  const boundsCls = `canvas__form-popup-bounds${popupBoundsClassName ? ` ${popupBoundsClassName}` : ''}`

  if (!isSectionedForm(norm) || !norm.sections?.length) {
    const visibleRoot = fields.filter(fieldVisible)
    return (
      <div className={`canvas__form${readCls}`}>
        {formContextBar}
        <div className={boundsCls}>
          {formReadMenuBar}
          <div className="canvas__form-main">
            {formReadScrollTop}
            {renderFields(visibleRoot)}
          </div>
          {formFooter}
          {nestedEmbeddedOverlay}
        </div>
      </div>
    )
  }
  const accordionGroups = getSectionFieldGroups(norm)
  const tabGroups = norm.sectionLayout === 'tabs' ? getTabPanelGroups(norm) : []
  return (
    <div
      className={`canvas__form${norm.sectionLayout === 'tabs' ? ' canvas__form--tabs' : ''}${readCls}`}
    >
      {formContextBar}
      <div className={boundsCls}>
        {formReadMenuBar}
        <div className="canvas__form-main">
          {formReadScrollTop}
          {norm.sectionLayout === 'tabs' ? (
            <SectionTabsBlock
              groups={tabGroups}
              renderFields={renderFields}
              layoutResetKey={form.id}
              fieldVisible={fieldVisible}
              preferredTabSectionId={preferredTabSectionId}
            />
          ) : (
            accordionGroups
              .map(({ section, fields: sf }) => ({
                section,
                fields: sf.filter(fieldVisible),
              }))
              .filter(({ fields: sf }) => sf.length > 0)
              .map(({ section, fields: sf }) => (
                <SectionAccordionBlock
                  key={section.id}
                  section={section}
                  fields={sf}
                  renderFields={renderFields}
                />
              ))
          )}
        </div>
        {formFooter}
        {nestedEmbeddedOverlay}
      </div>
    </div>
  )
}
