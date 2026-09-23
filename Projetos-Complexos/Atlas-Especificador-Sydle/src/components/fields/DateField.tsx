import { useEffect, useState } from 'react'
import type { FieldDemoValue } from '../../types'
import { fieldAriaName } from '../../utils/fieldAriaLabel'
import { dateDisplayFromIso, dateIsoFromDemo } from '../../utils/fieldDemoValue'
import { useRuntimeSummarySync } from '../../hooks/useRuntimeSummarySync'
import FieldReadonlyEmpty from './FieldReadonlyEmpty'

interface Props {
  label: string
  readOnly: boolean
  required: boolean
  hideLabel?: boolean
  demoValue?: FieldDemoValue
  runtimeSummaryKey?: string
  onRuntimeSummaryChange?: (key: string, value: string) => void
}

export default function DateField({
  label,
  readOnly,
  required,
  hideLabel,
  demoValue,
  runtimeSummaryKey,
  onRuntimeSummaryChange,
}: Props) {
  const [value, setValue] = useState(() => dateIsoFromDemo(demoValue))
  useEffect(() => {
    setValue(dateIsoFromDemo(demoValue))
  }, [demoValue])

  useRuntimeSummarySync(
    runtimeSummaryKey,
    dateDisplayFromIso(value),
    onRuntimeSummaryChange,
  )

  const aria = hideLabel ? fieldAriaName(label, required) : undefined
  const emptyReadonly = readOnly && value === ''

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
          type="date"
          className={`field__input${value === '' ? ' field__input--date-empty' : ''}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={readOnly}
          aria-label={aria}
          aria-required={required || undefined}
        />
      )}
    </div>
  )
}
