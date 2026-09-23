import { useEffect, useRef } from 'react'
import FieldReadonlyEmpty from './FieldReadonlyEmpty'

interface Props {
  label: string
  htmlContent: string
  readOnly?: boolean
  hideLabel?: boolean
  required?: boolean
  onHtmlAction?: (action: string) => void
}

export default function HtmlField({ label, htmlContent, readOnly, hideLabel, required, onHtmlAction }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const roClass = readOnly ? ' field--readonly' : ''

  useEffect(() => {
    if (!onHtmlAction || readOnly) return
    const root = containerRef.current
    if (!root) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const btn = target?.closest('[data-action]') as HTMLElement | null
      if (!btn || !root.contains(btn)) return
      const action = btn.getAttribute('data-action')
      if (!action) return
      e.preventDefault()
      onHtmlAction(action)
    }
    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [onHtmlAction, readOnly])

  if (!htmlContent) {
    return (
      <div className={`field field--html${roClass}`}>
        {hideLabel && required ? (
          <div className="field__label-req-only" aria-hidden>
            <span className="field__required">*</span>
          </div>
        ) : null}
        {!hideLabel ? (
          <label className="field__label">
            {label}
            {required ? <span className="field__required">*</span> : null}
          </label>
        ) : null}
        <div className="field__readonly-empty-wrap">
          <FieldReadonlyEmpty />
        </div>
      </div>
    )
  }

  return (
    <div className={`field field--html${roClass}`}>
      {hideLabel && required ? (
        <div className="field__label-req-only" aria-hidden>
          <span className="field__required">*</span>
        </div>
      ) : null}
      {!hideLabel ? (
        <label className="field__label">
          {label}
          {required ? <span className="field__required">*</span> : null}
        </label>
      ) : null}
      <div
        ref={containerRef}
        className="field__html-render"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  )
}
