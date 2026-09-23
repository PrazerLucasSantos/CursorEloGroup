import { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { FieldDemoValue, FormDef } from '../../types'
import { fieldAriaName } from '../../utils/fieldAriaLabel'
import { normalizeReferenceSelection } from '../../utils/fieldDemoValue'
import { resolveDemoSelectOptions } from '../../utils/demoSelectOptions'
import { referenceOptionsFromLinkedForm } from '../../utils/referenceLinkedForm'
import { useRuntimeSummarySync } from '../../hooks/useRuntimeSummarySync'
import FieldReadonlyEmpty from './FieldReadonlyEmpty'

interface Props {
  label: string
  readOnly: boolean
  required: boolean
  hideLabel?: boolean
  multiple?: boolean
  options?: string[]
  linkedFormId?: string
  epicForms?: FormDef[]
  /** Menu fixo à viewport (evita corte por overflow em tabelas / scroll) */
  floatingMenu?: boolean
  demoValue?: FieldDemoValue
  /** Chave estável (canvas) para refletir seleção no título do acordeão embutido. */
  runtimeSummaryKey?: string
  onRuntimeSummaryChange?: (key: string, value: string) => void
  /** Filtro cascata: valores do campo fonte (ex. catálogos seleccionados). */
  filterByReference?: {
    sourceValues: string[]
    matchFieldIds: string[]
  }
}

export default function ReferenceField({
  label,
  readOnly,
  required,
  hideLabel,
  multiple,
  options = [],
  linkedFormId,
  epicForms = [],
  floatingMenu = false,
  demoValue,
  runtimeSummaryKey,
  onRuntimeSummaryChange,
  filterByReference,
}: Props) {
  const filterKey = filterByReference
    ? `${filterByReference.matchFieldIds.join('|')}::${filterByReference.sourceValues.join('\0')}`
    : ''
  const linkedOptions = useMemo(
    () =>
      referenceOptionsFromLinkedForm(epicForms, linkedFormId, undefined, filterByReference),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filterKey estabiliza sourceValues
    [epicForms, linkedFormId, filterKey],
  )
  const displayOptions = useMemo(() => {
    const base =
      linkedOptions.length > 0
        ? linkedOptions
        : filterByReference && filterByReference.sourceValues.length > 0
          ? [] // com filtro activo e sem match: lista vazia (não cair no demo genérico)
          : resolveDemoSelectOptions({ options, linkedFormId, label })
    const fromDemo = normalizeReferenceSelection(demoValue, base, !!multiple)
    // Inclui valores vivos (portal/Atlas) na lista mesmo fora do catálogo demo
    return [...new Set([...fromDemo, ...base])]
    // filterKey (não o objecto) — evita recalcular a cada render do pai
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedOptions, options, linkedFormId, label, demoValue, multiple, filterKey])
  const [selected, setSelected] = useState<string[]>(() =>
    normalizeReferenceSelection(demoValue, displayOptions, !!multiple),
  )
  const optKey = displayOptions.join('\0')
  // Só reage a demoValue / opções estáveis — não a nova referência de array a cada render
  // (senão a cascata do runtime limpava a selecção local antes do sync gravar).
  useEffect(() => {
    const next = normalizeReferenceSelection(demoValue, displayOptions, !!multiple)
    setSelected((prev) =>
      prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optKey cobre displayOptions
  }, [demoValue, multiple, optKey])

  useRuntimeSummarySync(
    runtimeSummaryKey,
    selected.length ? selected.join(' / ') : '',
    onRuntimeSummaryChange,
  )

  const [open, setOpen] = useState(false)
  const [wrapped, setWrapped] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const controlRef = useRef<HTMLDivElement>(null)
  const [menuFixedStyle, setMenuFixedStyle] = useState<CSSProperties | null>(null)

  useLayoutEffect(() => {
    if (!open || !floatingMenu || !wrapRef.current) {
      setMenuFixedStyle(null)
      return
    }
    const wrap = wrapRef.current
    const updatePosition = () => {
      const r = wrap.getBoundingClientRect()
      setMenuFixedStyle({
        position: 'fixed',
        top: Math.round(r.bottom + 4),
        left: Math.round(r.left),
        width: Math.round(r.width),
      })
    }
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, floatingMenu])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  useEffect(() => {
    const el = controlRef.current
    if (!el || !multiple) { setWrapped(false); return }
    const chips = el.querySelectorAll('.field__ref-chip')
    if (chips.length < 2) { setWrapped(false); return }
    const firstTop = (chips[0] as HTMLElement).offsetTop
    const lastTop = (chips[chips.length - 1] as HTMLElement).offsetTop
    setWrapped(lastTop > firstTop)
  }, [selected, multiple])

  function handleSelect(opt: string) {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt],
      )
    } else {
      setSelected([opt])
      setOpen(false)
    }
  }

  function handleRemove(opt: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSelected((prev) => prev.filter((v) => v !== opt))
  }

  const hasSelection = selected.length > 0

  let controlClass = 'field__ref-control'
  if (multiple) controlClass += ' field__ref-control--multi-base'
  if (wrapped) controlClass += ' field__ref-control--wrapped'

  const aria = hideLabel ? fieldAriaName(label, required) : undefined

  return (
    <div className={`field${readOnly ? ' field--readonly' : ''}`}>
      {hideLabel && required ? (
        <div className="field__label-req-only" aria-hidden>
          <span className="field__required">*</span>
        </div>
      ) : null}
      {!hideLabel ? (
        <label className="field__label">
          {label}
          {required && <span className="field__required">*</span>}
        </label>
      ) : null}

      <div className="field__ref-wrap" ref={wrapRef}>
        <div
          ref={controlRef}
          className={controlClass}
          onClick={() => { if (!readOnly) setOpen(!open) }}
          role="combobox"
          aria-expanded={open}
          aria-label={aria}
          tabIndex={readOnly ? -1 : 0}
          onKeyDown={(e) => {
            if (readOnly) return
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open) }
            if (e.key === 'Escape') setOpen(false)
          }}
        >
          {hasSelection ? (
            <>
              {selected.map((val) => (
                <span key={val} className="field__ref-chip">
                  <span className="field__ref-chip-label">{val}</span>
                  {!readOnly && (
                    <button type="button" className="field__ref-chip-x" onClick={(e) => handleRemove(val, e)} aria-label="Remover" tabIndex={-1}>
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
                      </svg>
                    </button>
                  )}
                </span>
              ))}
            </>
          ) : readOnly ? (
            <span className="field__ref-readonly-empty">
              <FieldReadonlyEmpty />
            </span>
          ) : (
            <span className="field__ref-placeholder">Selecione</span>
          )}
        </div>

        {open && (() => {
          const available = displayOptions.filter((opt) => !selected.includes(opt))
          if (available.length === 0) return null
          if (floatingMenu && !menuFixedStyle) return null
          return (
            <ul
              className={`field__ref-menu${floatingMenu ? ' field__ref-menu--floating' : ''}`}
              style={floatingMenu ? menuFixedStyle ?? undefined : undefined}
            >
              {available.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    className={`field__ref-option${selected.includes(opt) ? ' field__ref-option--active' : ''}`}
                    onClick={() => handleSelect(opt)}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          )
        })()}
      </div>
    </div>
  )
}
