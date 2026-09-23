import { useEffect, useState } from 'react'
import type { FieldDemoValue } from '../../types'
import { fieldAriaName } from '../../utils/fieldAriaLabel'
import { decimalDemoToRaw } from '../../utils/fieldDemoValue'
import { useRuntimeSummarySync } from '../../hooks/useRuntimeSummarySync'
import FieldReadonlyEmpty from './FieldReadonlyEmpty'

interface Props {
  label: string
  readOnly: boolean
  required: boolean
  hideLabel?: boolean
  currency?: boolean
  demoValue?: FieldDemoValue
  runtimeSummaryKey?: string
  onRuntimeSummaryChange?: (key: string, value: string) => void
}

function formatDecimal(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const cents = digits.padStart(3, '0')
  const intPart = cents.slice(0, -2).replace(/^0+(?=\d)/, '')
  const decPart = cents.slice(-2)
  const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${withSeparator},${decPart}`
}

function formatCurrency(raw: string): string {
  const formatted = formatDecimal(raw)
  if (!formatted) return ''
  return `R$ ${formatted}`
}

export default function DecimalField({
  label,
  readOnly,
  required,
  hideLabel,
  currency,
  demoValue,
  runtimeSummaryKey,
  onRuntimeSummaryChange,
}: Props) {
  const [raw, setRaw] = useState(() => decimalDemoToRaw(demoValue))
  useEffect(() => {
    setRaw(decimalDemoToRaw(demoValue))
  }, [demoValue])

  const display = currency ? formatCurrency(raw) : formatDecimal(raw)

  useRuntimeSummarySync(runtimeSummaryKey, raw, onRuntimeSummaryChange)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    setRaw(digits)
  }

  const aria = hideLabel ? fieldAriaName(label, required) : undefined
  const emptyReadonly = readOnly && display.trim() === ''

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
      {emptyReadonly ? (
        <div className="field__readonly-empty-wrap">
          <FieldReadonlyEmpty />
        </div>
      ) : (
        <input
          type="text"
          inputMode="numeric"
          className="field__input"
          readOnly={readOnly}
          value={display}
          onChange={handleChange}
          aria-label={aria}
          aria-required={required || undefined}
        />
      )}
    </div>
  )
}
