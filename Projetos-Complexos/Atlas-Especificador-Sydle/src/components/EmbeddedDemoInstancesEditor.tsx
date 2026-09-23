import { useState, type ReactNode } from 'react'
import type { EmbeddedCellDemo, EmbeddedDemoRow, FieldDemoValue, FormDef, FormField } from '../types'
import { fieldSupportsMultiple } from '../types'
import { isEmbeddedChildBranch } from '../utils/embeddedDemo'
import {
  embeddedFormAccordionInstanceTitle,
  findFormById,
  getEmbeddedNestedFields,
} from '../utils/linkedForm'
import {
  dateIsoFromDemo,
  geopointFromDemo,
} from '../utils/fieldDemoValue'
import FileDemoListEditor from './fields/FileDemoListEditor'

function resizeRows(prev: EmbeddedDemoRow[] | undefined, n: number): EmbeddedDemoRow[] {
  const base = prev ?? []
  if (n <= 0) return [{}]
  if (n <= base.length) return base.slice(0, n)
  return [...base, ...Array.from({ length: n - base.length }, () => ({}))]
}

function patchRow(
  rows: EmbeddedDemoRow[],
  index: number,
  fieldId: string,
  value: EmbeddedCellDemo | undefined,
): EmbeddedDemoRow[] {
  return rows.map((row, i) => {
    if (i !== index) return row
    const next = { ...row }
    if (value === undefined) delete next[fieldId]
    else next[fieldId] = value
    return next
  })
}

function valueAt(row: EmbeddedDemoRow | undefined, fieldId: string): EmbeddedCellDemo | undefined {
  if (!row) return undefined
  return Object.prototype.hasOwnProperty.call(row, fieldId) ? row[fieldId] : undefined
}

function scalarFromCell(v: EmbeddedCellDemo | undefined): FieldDemoValue | undefined {
  if (v === undefined) return undefined
  if (isEmbeddedChildBranch(v)) return undefined
  return v
}

function DemoInstanceAccordion({
  instanceIndex,
  label,
  nested,
  children,
}: {
  instanceIndex: number
  label: string
  nested?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(instanceIndex === 0)
  return (
    <details
      className={`acc__embedded-demo-acc${nested ? ' acc__embedded-demo-acc--nested' : ''}`}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="acc__embedded-demo-acc-summary">
        <svg
          className="acc__embedded-demo-acc-chevron"
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
        <span className="acc__embedded-demo-acc-label">{label}</span>
      </summary>
      <div className="acc__embedded-demo-acc-body">{children}</div>
    </details>
  )
}

/** Instâncias de demo de um sub-bloco embutido (recursivo com NestedDemoCell). */
function EmbeddedBranchInstancesBody({
  nestedField,
  rows,
  onSetRows,
  epicForms,
  branchAncestorIds,
}: {
  nestedField: FormField
  rows: EmbeddedDemoRow[]
  onSetRows: (next: EmbeddedDemoRow[]) => void
  epicForms: FormDef[]
  /** Pilha de ids de formulário já visitados neste ramo (inclui o alvo de `nestedField`). */
  branchAncestorIds: string[]
}) {
  const nestedChildren = getEmbeddedNestedFields(nestedField, epicForms)
  const multi =
    nestedField.type === 'embeddedReference' &&
    nestedField.multiple &&
    fieldSupportsMultiple(nestedField.type)
  const rowCount = Math.max(1, rows.length)

  function setCount(n: number) {
    onSetRows(resizeRows(rows, Math.max(1, n)))
  }

  function patchInnerCell(instanceIndex: number, fieldId: string, value: EmbeddedCellDemo | undefined) {
    onSetRows(patchRow(rows, instanceIndex, fieldId, value))
  }

  return (
    <div className="acc__embedded-demo-instances acc__embedded-demo-instances--nested">
      {multi && (
        <label className="acc__field acc__field--compact-demo">
          <span className="acc__label">Instâncias do sub-bloco</span>
          <input
            type="number"
            className="acc__input"
            min={1}
            max={50}
            value={rowCount}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              if (Number.isFinite(n)) setCount(n)
            }}
          />
        </label>
      )}
      {nestedChildren.length === 0 && (
        <p className="acc__nested-hint acc__nested-hint--demo-skip">
          Adicione campos a este sub-bloco no editor do campo para preencher a demo aqui.
        </p>
      )}
      {rows.map((row, instanceIndex) => (
        <DemoInstanceAccordion
          key={instanceIndex}
          instanceIndex={instanceIndex}
          nested
          label={multi ? `Sub-instância ${instanceIndex + 1}` : 'Sub-bloco'}
        >
          <div className="acc__embedded-demo-cells">
            {nestedChildren.map((nf) => (
              <NestedDemoCell
                key={nf.id}
                nf={nf}
                row={row}
                epicForms={epicForms}
                ancestorFormIds={branchAncestorIds}
                onPatch={(fid, val) => patchInnerCell(instanceIndex, fid, val)}
              />
            ))}
          </div>
        </DemoInstanceAccordion>
      ))}
    </div>
  )
}

function NestedDemoCell({
  nf,
  row,
  onPatch,
  epicForms,
  ancestorFormIds,
}: {
  nf: FormField
  row: EmbeddedDemoRow
  onPatch: (fieldId: string, v: EmbeddedCellDemo | undefined) => void
  epicForms: FormDef[]
  ancestorFormIds: string[]
}) {
  const v = valueAt(row, nf.id)

  switch (nf.type) {
    case 'text': {
      const s = scalarFromCell(v)
      return (
        <label className="acc__field acc__field--compact-demo">
          <span className="acc__label">{nf.label}</span>
          {nf.textLong ? (
            <textarea
              className="acc__input acc__textarea"
              rows={2}
              value={typeof s === 'string' ? s : ''}
              onChange={(e) => onPatch(nf.id, e.target.value ? e.target.value : undefined)}
              spellCheck={false}
            />
          ) : (
            <input
              type="text"
              className="acc__input"
              value={typeof s === 'string' ? s : ''}
              onChange={(e) => onPatch(nf.id, e.target.value ? e.target.value : undefined)}
            />
          )}
        </label>
      )
    }
    case 'number': {
      const s = scalarFromCell(v)
      return (
        <label className="acc__field acc__field--compact-demo">
          <span className="acc__label">{nf.label}</span>
          <input
            type="text"
            className="acc__input"
            inputMode="decimal"
            value={s === undefined || s === null ? '' : String(s)}
            onChange={(e) => {
              const t = e.target.value.trim()
              if (!t) {
                onPatch(nf.id, undefined)
                return
              }
              const n = Number(t.replace(',', '.'))
              onPatch(nf.id, Number.isFinite(n) ? n : t)
            }}
          />
        </label>
      )
    }
    case 'decimal': {
      const s = scalarFromCell(v)
      return (
        <label className="acc__field acc__field--compact-demo">
          <span className="acc__label">{nf.label}</span>
          <input
            type="text"
            className="acc__input"
            inputMode="decimal"
            value={typeof s === 'string' || typeof s === 'number' ? String(s ?? '') : ''}
            onChange={(e) => {
              const t = e.target.value.trim()
              onPatch(nf.id, t ? t : undefined)
            }}
          />
        </label>
      )
    }
    case 'boolean': {
      const s = scalarFromCell(v)
      return (
        <label className="acc__field acc__field--compact-demo">
          <span className="acc__label">{nf.label}</span>
          <select
            className="acc__input acc__select"
            value={s === true ? 'true' : s === false ? 'false' : ''}
            onChange={(e) => {
              const sel = e.target.value
              onPatch(
                nf.id,
                sel === 'true' ? true : sel === 'false' ? false : undefined,
              )
            }}
          >
            <option value="">(vazio)</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </label>
      )
    }
    case 'date': {
      const s = scalarFromCell(v)
      return (
        <label className="acc__field acc__field--compact-demo">
          <span className="acc__label">{nf.label}</span>
          <input
            type="date"
            className="acc__input"
            value={dateIsoFromDemo(s)}
            onChange={(e) => onPatch(nf.id, e.target.value ? e.target.value : undefined)}
          />
        </label>
      )
    }
    case 'reference':
    case 'textOptions':
      if (nf.multiple && fieldSupportsMultiple(nf.type)) {
        const s = scalarFromCell(v)
        return (
          <label className="acc__field acc__field--compact-demo">
            <span className="acc__label">{nf.label} (1 por linha)</span>
            <textarea
              className="acc__input acc__textarea"
              rows={2}
              value={Array.isArray(s) ? s.join('\n') : ''}
              onChange={(e) => {
                const lines = e.target.value
                  .split('\n')
                  .map((l) => l.trim())
                  .filter(Boolean)
                onPatch(nf.id, lines.length > 0 ? lines : undefined)
              }}
              spellCheck={false}
            />
          </label>
        )
      }
      {
        const s = scalarFromCell(v)
        return (
          <label className="acc__field acc__field--compact-demo">
            <span className="acc__label">{nf.label}</span>
            <select
              className="acc__input acc__select"
              value={typeof s === 'string' ? s : ''}
              onChange={(e) => onPatch(nf.id, e.target.value ? e.target.value : undefined)}
            >
              <option value="">(nenhum)</option>
              {(nf.options ?? []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        )
      }
    case 'file': {
      const s = scalarFromCell(v)
      return (
        <div className="acc__field acc__field--compact-demo">
          <span className="acc__label">{nf.label}</span>
          <FileDemoListEditor value={s} onChange={(next) => onPatch(nf.id, next)} />
        </div>
      )
    }
    case 'geopoint': {
      const s = scalarFromCell(v)
      const g = geopointFromDemo(s)
      return (
        <div className="acc__field acc__field--compact-demo">
          <span className="acc__label">{nf.label}</span>
          <div className="field__geopoint">
            <input
              type="number"
              inputMode="decimal"
              step="any"
              className="field__input"
              placeholder="Latitude"
              value={g.lat}
              onChange={(e) => {
                const lat = e.target.value
                const lng = g.lng
                const has = lat.trim() || lng.trim()
                onPatch(nf.id, has ? { lat, lng } : undefined)
              }}
            />
            <input
              type="number"
              inputMode="decimal"
              step="any"
              className="field__input"
              placeholder="Longitude"
              value={g.lng}
              onChange={(e) => {
                const lng = e.target.value
                const lat = g.lat
                const has = lat.trim() || lng.trim()
                onPatch(nf.id, has ? { lat, lng } : undefined)
              }}
            />
            <button type="button" className="field__file-btn" disabled tabIndex={-1} aria-hidden>
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
              >
                <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </div>
      )
    }
    case 'embeddedReference': {
      const lid = nf.linkedFormId
      if (!lid) {
        return (
          <p className="acc__nested-hint acc__nested-hint--demo-skip">
            {nf.label}: vincule um formulário ao bloco embutido para editar a demonstração.
          </p>
        )
      }
      if (ancestorFormIds.includes(lid)) {
        return (
          <p className="acc__nested-hint acc__nested-hint--demo-skip">
            {nf.label}: referência cíclica — a demonstração deste sub-bloco não pode ser editada aqui.
          </p>
        )
      }
      const branch = isEmbeddedChildBranch(v) ? v : undefined
      const hasCell = Object.prototype.hasOwnProperty.call(row, nf.id)
      const innerRows = branch?.embeddedDemoInstances ?? [{}]
      return (
        <div className="acc__field acc__field--compact-demo acc__embedded-branch-wrap">
          <span className="acc__label">{nf.label} (ref. embutida)</span>
          <EmbeddedBranchInstancesBody
            nestedField={nf}
            rows={innerRows}
            epicForms={epicForms}
            branchAncestorIds={[...ancestorFormIds, lid]}
            onSetRows={(next) => {
              const normalized = next.length > 0 ? next : [{}]
              onPatch(nf.id, { embeddedDemoInstances: normalized })
            }}
          />
          {hasCell && (
            <button
              type="button"
              className="acc__remove acc__remove--nested"
              onClick={() => onPatch(nf.id, undefined)}
            >
              Remover demo deste sub-bloco (herdar do campo)
            </button>
          )}
        </div>
      )
    }
    case 'html':
    case 'alert':
      return (
        <p className="acc__nested-hint acc__nested-hint--demo-skip">
          {nf.label}: demonstração deste tipo é configurada no próprio bloco.
        </p>
      )
    default:
      return null
  }
}

export default function EmbeddedDemoInstancesEditor({
  field,
  rows: rowsProp,
  onSetRows,
  epicForms,
  ancestorFormIds = [],
}: {
  field: FormField
  /** Linhas do preset ativo (`embeddedRowsByFieldId[field.id]`). */
  rows: EmbeddedDemoRow[] | undefined
  onSetRows: (next: EmbeddedDemoRow[] | undefined) => void
  epicForms: FormDef[]
  /** Formulário que contém o campo (e ancestrais, se houver contexto aninhado). */
  ancestorFormIds?: string[]
}) {
  const linkedId = field.linkedFormId
  if (linkedId && ancestorFormIds.includes(linkedId)) {
    return (
      <div className="acc__field acc__embedded-demo-section">
        <p className="acc__nested-hint acc__nested-hint--demo-skip">
          Referência cíclica neste vínculo — não é possível editar a demonstração estruturada até
          corrigir o formulário vinculado.
        </p>
      </div>
    )
  }

  const nested = getEmbeddedNestedFields(field, epicForms)
  const linkedFormForAccordion =
    linkedId && !ancestorFormIds.includes(linkedId) ? findFormById(epicForms, linkedId) : undefined
  const singleInstanceAccordionLabel = embeddedFormAccordionInstanceTitle(linkedFormForAccordion)
  const cellAncestorIds =
    linkedId && !ancestorFormIds.includes(linkedId)
      ? [...ancestorFormIds, linkedId]
      : ancestorFormIds
  const multi = field.multiple && fieldSupportsMultiple(field.type)
  const rows = rowsProp
  const enabled = rows != null
  const rowCount = Math.max(1, rows?.length ?? 1)

  function setRows(next: EmbeddedDemoRow[] | undefined) {
    onSetRows(next === undefined ? undefined : next.length > 0 ? next : undefined)
  }

  function toggleEnabled(on: boolean) {
    if (!on) {
      setRows(undefined)
      return
    }
    const initial = rows && rows.length > 0 ? rows : [{}]
    setRows(resizeRows(initial, multi ? Math.max(1, initial.length) : 1))
  }

  function setCount(n: number) {
    const nextN = Math.max(1, n)
    setRows(resizeRows(rows ?? [{}], nextN))
  }

  function patchCell(instanceIndex: number, fieldId: string, value: EmbeddedCellDemo | undefined) {
    const base = rows ?? [{}]
    setRows(patchRow(base, instanceIndex, fieldId, value))
  }

  return (
    <div className="acc__field acc__embedded-demo-section">
      <span className="acc__label">Linhas de exemplo (canvas e export)</span>
      <p className="acc__nested-hint">
        Por instância ou linha da tabela: quantidade e valores iniciais neste cenário. Ref.
        embutidas aninhadas podem ter instâncias próprias por linha do pai.
      </p>
      <label className="acc__field acc__field--row">
        <span className="acc__label">Por instância</span>
        <button
          type="button"
          className={`acc__toggle ${enabled ? 'acc__toggle--on' : ''}`}
          onClick={() => toggleEnabled(!enabled)}
          role="switch"
          aria-checked={enabled}
        >
          <span className="acc__toggle-thumb" />
        </button>
      </label>

      {enabled && multi && (
        <label className="acc__field">
          <span className="acc__label">Quantidade de linhas / instâncias</span>
          <input
            type="number"
            className="acc__input"
            min={1}
            max={50}
            value={rowCount}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              if (Number.isFinite(n)) setCount(n)
            }}
          />
        </label>
      )}

      {enabled && nested.length > 0 && (
        <div className="acc__embedded-demo-instances">
          {(rows ?? [{}]).map((row, instanceIndex) => (
            <DemoInstanceAccordion
              key={instanceIndex}
              instanceIndex={instanceIndex}
              label={
                multi ? `Instância ${instanceIndex + 1}` : singleInstanceAccordionLabel
              }
            >
              <div className="acc__embedded-demo-cells">
                {nested.map((nf) => (
                  <NestedDemoCell
                    key={nf.id}
                    nf={nf}
                    row={row}
                    epicForms={epicForms}
                    ancestorFormIds={cellAncestorIds}
                    onPatch={(fid, val) => patchCell(instanceIndex, fid, val)}
                  />
                ))}
              </div>
            </DemoInstanceAccordion>
          ))}
        </div>
      )}

      {enabled && nested.length === 0 && (
        <p className="acc__nested-hint">Adicione campos ao subformulário para editar valores.</p>
      )}
    </div>
  )
}

