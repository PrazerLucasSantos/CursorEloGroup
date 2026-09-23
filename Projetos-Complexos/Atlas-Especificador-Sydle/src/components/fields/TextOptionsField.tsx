import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { FieldDemoValue } from '../../types'
import { fieldAriaName } from '../../utils/fieldAriaLabel'
import { normalizeReferenceSelection } from '../../utils/fieldDemoValue'
import { resolveDemoSelectOptions } from '../../utils/demoSelectOptions'
import { useRuntimeSummarySync } from '../../hooks/useRuntimeSummarySync'
import FieldReadonlyEmpty from './FieldReadonlyEmpty'

interface Props {
  label: string
  readOnly: boolean
  required: boolean
  hideLabel?: boolean
  multiple?: boolean
  options?: string[]
  /** Menu fixo à viewport em células de tabela */
  floatingMenu?: boolean
  demoValue?: FieldDemoValue
  runtimeSummaryKey?: string
  onRuntimeSummaryChange?: (key: string, value: string) => void
}

export default function TextOptionsField({
  label,
  readOnly,
  required,
  hideLabel,
  multiple,
  options = [],
  floatingMenu = false,
  demoValue,
  runtimeSummaryKey,
  onRuntimeSummaryChange,
}: Props) {
  const displayOptions = useMemo(
    () => resolveDemoSelectOptions({ options, label }),
    [options, label],
  )
  const [selected, setSelected] = useState<string[]>(() =>
    normalizeReferenceSelection(demoValue, displayOptions, !!multiple),
  )
  const optKey = displayOptions.join('\0')
  useEffect(() => {
    const next = normalizeReferenceSelection(demoValue, displayOptions, !!multiple)
    setSelected((prev) =>
      prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next,
    )
  }, [demoValue, multiple, optKey, displayOptions])

  useRuntimeSummarySync(
    runtimeSummaryKey,
    selected.length ? selected.join(' / ') : '',
    onRuntimeSummaryChange,
  )

  const [compact, setCompact] = useState(false)
  const outerWrapRef = useRef<HTMLDivElement>(null)
  const measureRowRef = useRef<HTMLDivElement>(null)
  const refWrapRef = useRef<HTMLDivElement>(null)
  const controlRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [wrapped, setWrapped] = useState(false)
  const [menuFixedStyle, setMenuFixedStyle] = useState<CSSProperties | null>(null)

  const checkFit = useCallback(() => {
    const wrap = outerWrapRef.current
    const measureRow = measureRowRef.current
    if (!wrap || !measureRow) return
    const available = wrap.clientWidth
    const needed = measureRow.scrollWidth
    const next = needed > available + 1
    setCompact((prev) => (prev === next ? prev : next))
  }, [optKey])

  useLayoutEffect(() => {
    checkFit()
  }, [checkFit])

  useEffect(() => {
    const w = outerWrapRef.current
    if (!w) return
    const ro = new ResizeObserver(() => checkFit())
    ro.observe(w)
    return () => ro.disconnect()
  }, [checkFit])

  useEffect(() => {
    if (!compact) setOpen(false)
  }, [compact])

  useLayoutEffect(() => {
    if (!open || !floatingMenu || !refWrapRef.current) {
      setMenuFixedStyle(null)
      return
    }
    const wrap = refWrapRef.current
    const update = () => {
      const r = wrap.getBoundingClientRect()
      setMenuFixedStyle({
        position: 'fixed',
        top: Math.round(r.bottom + 4),
        left: Math.round(r.left),
        width: Math.round(r.width),
      })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, floatingMenu, compact])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!refWrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  useEffect(() => {
    const el = controlRef.current
    if (!el || !multiple || !compact) {
      setWrapped(false)
      return
    }
    const chips = el.querySelectorAll('.field__ref-chip')
    if (chips.length < 2) {
      setWrapped(false)
      return
    }
    const firstTop = (chips[0] as HTMLElement).offsetTop
    const lastTop = (chips[chips.length - 1] as HTMLElement).offsetTop
    setWrapped(lastTop > firstTop)
  }, [selected, multiple, compact])

  function toggleOption(opt: string) {
    if (readOnly) return
    if (multiple) {
      setSelected((prev) =>
        prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt],
      )
    } else {
      setSelected((prev) => (prev[0] === opt ? [] : [opt]))
    }
  }

  function handleSelect(opt: string) {
    if (readOnly) return
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

  const readOnlyDisplayText =
    selected.length === 0 ? '' : multiple ? selected.join(' / ') : (selected[0] ?? '')

  if (readOnly) {
    return (
      <div className="field field--readonly">
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
        {hasSelection ? (
          <input
            type="text"
            className="field__input"
            readOnly
            value={readOnlyDisplayText}
            aria-label={hideLabel ? fieldAriaName(label, required) : undefined}
          />
        ) : (
          <div className="field__readonly-empty-wrap">
            <FieldReadonlyEmpty />
          </div>
        )}
      </div>
    )
  }

  let controlClass = 'field__ref-control'
  if (multiple && compact) controlClass += ' field__ref-control--multi-base'
  if (wrapped && compact) controlClass += ' field__ref-control--wrapped'

  const inlineRow = (opts: string[], measure: boolean) => (
    <div
      ref={measure ? measureRowRef : undefined}
      className={`field__textopt-row${measure ? ' field__textopt-row--measure' : ''}`}
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={
        measure ? undefined : hideLabel ? fieldAriaName(label, required) : label
      }
    >
      {opts.map((opt) => {
        const isOn = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            className={`field__textopt-cell${isOn ? ' field__textopt-cell--selected' : ''}`}
            onClick={() => !measure && toggleOption(opt)}
            disabled={readOnly && !measure}
            tabIndex={measure ? -1 : undefined}
            aria-hidden={measure ? true : undefined}
            aria-pressed={multiple && !measure ? isOn : undefined}
            aria-checked={!multiple && !measure ? isOn : undefined}
            role={multiple ? 'checkbox' : 'radio'}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )

  const compactDropdown = compact && (
    <div className="field__ref-wrap" ref={refWrapRef}>
      <div
        ref={controlRef}
        className={controlClass}
        onClick={() => {
          if (!readOnly) setOpen(!open)
        }}
        role="combobox"
        aria-expanded={open}
        aria-label={hideLabel ? fieldAriaName(label, required) : undefined}
        tabIndex={readOnly ? -1 : 0}
        onKeyDown={(e) => {
          if (readOnly) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(!open)
          }
          if (e.key === 'Escape') setOpen(false)
        }}
      >
        {hasSelection ? (
          <>
            {selected.map((val) => (
              <span key={val} className="field__ref-chip">
                <span className="field__ref-chip-label">{val}</span>
                {!readOnly && (
                  <button
                    type="button"
                    className="field__ref-chip-x"
                    onClick={(e) => handleRemove(val, e)}
                    aria-label="Remover"
                    tabIndex={-1}
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="4" y1="4" x2="12" y2="12" />
                      <line x1="12" y1="4" x2="4" y2="12" />
                    </svg>
                  </button>
                )}
              </span>
            ))}
          </>
        ) : (
          <span className="field__ref-placeholder">Selecione</span>
        )}
      </div>

      {open &&
        !readOnly &&
        (() => {
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
  )

  return (
    <div className="field">
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

      <div className="field__textopt-wrap" ref={outerWrapRef}>
        <div className="field__textopt-measure-host" aria-hidden>
          {inlineRow(displayOptions, true)}
        </div>

        {!compact && (
          <div className="field__textopt-inline-visible">{inlineRow(displayOptions, false)}</div>
        )}

        {compactDropdown}
      </div>
    </div>
  )
}
