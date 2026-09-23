import { useEffect, useState } from 'react'
import type { FieldDemoValue } from '../../types'
import { fieldAriaName } from '../../utils/fieldAriaLabel'
import { stringFromDemo } from '../../utils/fieldDemoValue'
import { useRuntimeSummarySync } from '../../hooks/useRuntimeSummarySync'
import FieldReadonlyEmpty from './FieldReadonlyEmpty'

interface Props {
  label: string
  readOnly: boolean
  required: boolean
  /** Oculta o rótulo visual (usa nome acessível no controlo). */
  hideLabel?: boolean
  long?: boolean
  demoValue?: FieldDemoValue
  runtimeSummaryKey?: string
  onRuntimeSummaryChange?: (key: string, value: string) => void
}

export default function TextField({
  label,
  readOnly,
  required,
  hideLabel,
  long,
  demoValue,
  runtimeSummaryKey,
  onRuntimeSummaryChange,
}: Props) {
  const [value, setValue] = useState(() => stringFromDemo(demoValue))
  useEffect(() => {
    setValue(stringFromDemo(demoValue))
  }, [demoValue])

  useRuntimeSummarySync(runtimeSummaryKey, value.trim(), onRuntimeSummaryChange)

  const aria = hideLabel ? fieldAriaName(label, required) : undefined
  const emptyReadonly = readOnly && !value.trim()

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
      ) : long ? (
        <textarea
          className="field__input field__textarea"
          readOnly={readOnly}
          rows={4}
          value={value}
          onChange={(e) => !readOnly && setValue(e.target.value)}
          aria-label={aria}
          aria-required={required || undefined}
        />
      ) : (
        <input
          type="text"
          className="field__input"
          readOnly={readOnly}
          value={value}
          onChange={(e) => !readOnly && setValue(e.target.value)}
          aria-label={aria}
          aria-required={required || undefined}
        />
      )}
    </div>
  )
}
