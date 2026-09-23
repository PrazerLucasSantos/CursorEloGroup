import { useId, useEffect, useState } from 'react'
import type { FieldDemoValue } from '../../types'
import { fieldAriaName } from '../../utils/fieldAriaLabel'
import { booleanFromDemo } from '../../utils/fieldDemoValue'
import { useRuntimeSummarySync } from '../../hooks/useRuntimeSummarySync'

interface Props {
  label: string
  readOnly: boolean
  required: boolean
  hideLabel?: boolean
  demoValue?: FieldDemoValue
  runtimeSummaryKey?: string
  onRuntimeSummaryChange?: (key: string, value: string) => void
}

export default function BooleanField({
  label,
  readOnly,
  required,
  hideLabel,
  demoValue,
  runtimeSummaryKey,
  onRuntimeSummaryChange,
}: Props) {
  const id = useId()
  const [checked, setChecked] = useState(() => booleanFromDemo(demoValue))
  useEffect(() => {
    setChecked(booleanFromDemo(demoValue))
  }, [demoValue])

  useRuntimeSummarySync(
    runtimeSummaryKey,
    checked ? 'Sim' : 'Não',
    onRuntimeSummaryChange,
  )

  const aria = hideLabel ? fieldAriaName(label, required) : undefined

  return (
    <div className={`field field--boolean${readOnly ? ' field--readonly' : ''}`}>
      <label className="field__boolean-label" htmlFor={id}>
        {!hideLabel ? (
          <span className="field__label">
            {label}
            {required && <span className="field__required">*</span>}
          </span>
        ) : hideLabel && required ? (
          <div className="field__label-req-only" aria-hidden>
            <span className="field__required">*</span>
          </div>
        ) : null}
        <span className="field__toggle-row">
          <input
            id={id}
            type="checkbox"
            className="field__checkbox"
            checked={checked}
            onChange={(e) => !readOnly && setChecked(e.target.checked)}
            disabled={readOnly}
            aria-label={aria}
          />
          <span className={`field__toggle-track ${checked ? 'field__toggle-track--on' : 'field__toggle-track--off'}`}>
            <span className="field__toggle-thumb" />
          </span>
        </span>
      </label>
    </div>
  )
}
