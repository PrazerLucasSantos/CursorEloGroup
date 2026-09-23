import { useEffect, useState } from 'react'
import type { FieldDemoValue } from '../../types'
import { fieldAriaName } from '../../utils/fieldAriaLabel'
import { geopointFromDemo } from '../../utils/fieldDemoValue'
import { useRuntimeSummarySync } from '../../hooks/useRuntimeSummarySync'

/** Ícone de mapa (mesmo peso visual do ícone do campo arquivo). */
function GeopointMapIcon() {
  return (
    <svg
      className="field__file-icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

interface Props {
  label: string
  readOnly: boolean
  required: boolean
  hideLabel?: boolean
  demoValue?: FieldDemoValue
  runtimeSummaryKey?: string
  onRuntimeSummaryChange?: (key: string, value: string) => void
}

export default function GeopointField({
  label,
  readOnly,
  required,
  hideLabel,
  demoValue,
  runtimeSummaryKey,
  onRuntimeSummaryChange,
}: Props) {
  const [lat, setLat] = useState(() => geopointFromDemo(demoValue).lat)
  const [lng, setLng] = useState(() => geopointFromDemo(demoValue).lng)
  useEffect(() => {
    const g = geopointFromDemo(demoValue)
    setLat(g.lat)
    setLng(g.lng)
  }, [demoValue])

  const geoSummary = [lat, lng].filter(Boolean).join(', ').trim()
  useRuntimeSummarySync(runtimeSummaryKey, geoSummary, onRuntimeSummaryChange)

  const aria = hideLabel ? fieldAriaName(label, required) : undefined

  return (
    <div
      className={`field${readOnly ? ' field--readonly' : ''}`}
      role={hideLabel ? 'group' : undefined}
      aria-label={hideLabel ? aria : undefined}
    >
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
      <div className="field__geopoint">
        {!readOnly ? (
          <>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              className="field__input"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              aria-label={hideLabel ? `${label}, latitude` : 'Latitude'}
            />
            <input
              type="number"
              inputMode="decimal"
              step="any"
              className="field__input"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              aria-label={hideLabel ? `${label}, longitude` : 'Longitude'}
            />
          </>
        ) : null}
        <button type="button" className="field__file-btn" aria-label="Mapa">
          <GeopointMapIcon />
        </button>
      </div>
    </div>
  )
}
