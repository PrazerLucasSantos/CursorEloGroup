import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FieldDemoValue, FileDemoItem } from '../../types'
import { fieldAriaName } from '../../utils/fieldAriaLabel'
import {
  fileDemoLabel,
  filesFromDemo,
  formatFileAttachmentDisplayLine,
} from '../../utils/fieldDemoValue'
import { useRuntimeSummarySync } from '../../hooks/useRuntimeSummarySync'
import FieldReadonlyEmpty from './FieldReadonlyEmpty'

/** Anexo simulado ao clicar em «upload» (demonstração). */
const DEFAULT_SIMULATED_FILE: FileDemoItem = {
  name: 'Novo arquivo',
  kind: 'pdf',
}

function FileDocIcon() {
  return (
    <svg
      className="field__file-doc-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="#ce0933"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="14 2 14 8 20 8"
        stroke="#ce0933"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DragHandleIcon() {
  return (
    <svg
      className="field__file-drag-icon"
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
      <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      className="field__file-trash-icon"
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function visibleAttachmentRows(items: FileDemoItem[]): FileDemoItem[] {
  return items.filter((x) => x.name.trim() || x.kind.trim())
}

function reorderItems<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return list
  const next = [...list]
  const [removed] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, removed)
  return next
}

const DND_INDEX_TYPE = 'application/x-file-field-row-index'

interface Props {
  label: string
  readOnly: boolean
  required: boolean
  hideLabel?: boolean
  demoValue?: FieldDemoValue
  runtimeSummaryKey?: string
  onRuntimeSummaryChange?: (key: string, value: string) => void
}

export default function FileField({
  label,
  readOnly,
  required,
  hideLabel,
  demoValue,
  runtimeSummaryKey,
  onRuntimeSummaryChange,
}: Props) {
  const presetFiles = useMemo(() => filesFromDemo(demoValue), [demoValue])
  const [items, setItems] = useState<FileDemoItem[]>(() => presetFiles)

  useEffect(() => {
    setItems(presetFiles)
  }, [presetFiles])

  const rows = useMemo(() => visibleAttachmentRows(items), [items])
  const fileSummary = useMemo(() => {
    const synthetic: FieldDemoValue | undefined =
      rows.length > 0 ? (rows as FileDemoItem[]) : undefined
    return fileDemoLabel(synthetic).trim()
  }, [rows])
  useRuntimeSummarySync(runtimeSummaryKey, fileSummary, onRuntimeSummaryChange)

  const aria = hideLabel ? fieldAriaName(label, required) : undefined

  const handleUploadClick = useCallback(() => {
    if (readOnly) return
    setItems((prev) => [...prev, { ...DEFAULT_SIMULATED_FILE }])
  }, [readOnly])

  const handleRemove = useCallback(
    (index: number) => {
      if (readOnly) return
      setItems((prev) => prev.filter((_, i) => i !== index))
    },
    [readOnly],
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      if (readOnly) return
      e.stopPropagation()
      const s = String(index)
      e.dataTransfer.setData(DND_INDEX_TYPE, s)
      e.dataTransfer.setData('text/plain', s)
      e.dataTransfer.effectAllowed = 'move'
      const row = (e.currentTarget as HTMLElement).closest('.field__file-attached-row')
      row?.classList.add('field__file-attached-row--dragging')
    },
    [readOnly],
  )

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const row = (e.currentTarget as HTMLElement).closest('.field__file-attached-row')
    row?.classList.remove('field__file-attached-row--dragging')
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      if (readOnly) return
      e.preventDefault()
      const raw =
        e.dataTransfer.getData(DND_INDEX_TYPE) || e.dataTransfer.getData('text/plain')
      const fromIndex = parseInt(raw, 10)
      if (Number.isNaN(fromIndex)) return
      setItems((prev) => reorderItems(prev, fromIndex, dropIndex))
    },
    [readOnly],
  )

  return (
    <div
      className={`field${readOnly ? ' field--readonly' : ''}`}
      role={hideLabel ? 'group' : undefined}
      aria-label={aria}
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

      <div className="field__file-stack">
        {readOnly && rows.length === 0 ? (
          <div className="field__readonly-empty-wrap field__file-readonly-empty">
            <FieldReadonlyEmpty />
          </div>
        ) : null}
        {rows.length > 0 ? (
          <div className="field__file-attached-list" role="list">
            {items.map((item, index) => {
              if (!item.name.trim() && !item.kind.trim()) return null
              return (
                <div
                  key={`${item.name}-${item.kind}-${index}`}
                  className="field__file-attached-row"
                  role="listitem"
                  onDragOver={readOnly ? undefined : handleDragOver}
                  onDrop={readOnly ? undefined : (e) => handleDrop(e, index)}
                >
                  {!readOnly ? (
                    <span
                      className="field__file-drag-handle"
                      draggable
                      title="Arrastar para ordenar"
                      aria-label="Arrastar para ordenar"
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <DragHandleIcon />
                    </span>
                  ) : (
                    <span className="field__file-row-slot field__file-row-slot--drag" aria-hidden />
                  )}
                  <span className="field__file-doc-wrap" aria-hidden>
                    <FileDocIcon />
                  </span>
                  <span className="field__file-attached-line" title={formatFileAttachmentDisplayLine(item)}>
                    {formatFileAttachmentDisplayLine(item)}
                  </span>
                  {!readOnly ? (
                    <button
                      type="button"
                      className="field__file-remove-btn"
                      aria-label="Remover arquivo"
                      title="Remover arquivo"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(index)
                      }}
                    >
                      <TrashIcon />
                    </button>
                  ) : (
                    <span className="field__file-row-slot field__file-row-slot--remove" aria-hidden />
                  )}
                </div>
              )
            })}
          </div>
        ) : null}

        {!readOnly ? (
          <div className="field__file-upload-wrap">
            <button
              type="button"
              className="field__file-btn"
              aria-label="Carregar arquivo"
              onClick={handleUploadClick}
            >
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
