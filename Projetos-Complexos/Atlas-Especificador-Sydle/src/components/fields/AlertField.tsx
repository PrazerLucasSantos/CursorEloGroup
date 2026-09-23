import { useState } from 'react'
import type { FieldAlertVariant } from '../../types'

const VARIANT_ICONS: Record<FieldAlertVariant, string> = {
  warning: 'warning',
  error: 'error',
  info: 'info',
  success: 'check_circle',
}

interface Props {
  /** Nome do campo na lista (igual aos outros tipos). */
  label: string
  title: string
  message: string
  variant: FieldAlertVariant
  collapsible: boolean
  required?: boolean
  /** Oculta o rótulo acima do banner. */
  hideLabel?: boolean
}

export default function AlertField({
  label,
  title,
  message,
  variant,
  collapsible,
  required,
  hideLabel,
}: Props) {
  const [expanded, setExpanded] = useState(true)
  const icon = VARIANT_ICONS[variant] ?? 'warning'

  return (
    <div
      className={`field field--alert field--alert--${variant}${collapsible && !expanded ? ' field--alert--collapsed' : ''}`}
    >
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
      <div className="field__alert">
        <span className="field__alert-accent" aria-hidden />
        <div className="field__alert-main">
          <span className="material-symbols-outlined field__alert-type-icon" aria-hidden>
            {icon}
          </span>
          <div className="field__alert-content">
            <div className="field__alert-head">
              <strong className="field__alert-title">{title || 'Título'}</strong>
              {collapsible ? (
                <button
                  type="button"
                  className="field__alert-toggle"
                  onClick={() => setExpanded((e) => !e)}
                  aria-expanded={expanded}
                  aria-label={expanded ? 'Recolher mensagem' : 'Expandir mensagem'}
                >
                  <svg
                    className="field__alert-chevron"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M6 15l6-6 6 6" />
                  </svg>
                </button>
              ) : null}
            </div>
            {(!collapsible || expanded) && (
              <p className="field__alert-message">{message || '\u00a0'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
