import { useEffect, useState } from 'react'
import type { FieldDemoValue, FormDef, FormField, FormExampleValuePreset } from '../types'
import { fieldSupportsMultiple } from '../types'
import {
  dateIsoFromDemo,
  geopointFromDemo,
} from '../utils/fieldDemoValue'
import {
  ensureFormHasExamplePreset,
  getActiveExamplePreset,
  newExamplePresetId,
  patchPresetInFormById,
} from '../utils/formExamplePresets'
import { DEFAULT_PRESET_ICON_COLOR, PRESET_ICON_COLOR_CHOICES, resolvePresetIconBackground } from '../utils/presetIconColor'
import EmbeddedDemoInstancesEditor from './EmbeddedDemoInstancesEditor'
import FileDemoListEditor from './fields/FileDemoListEditor'

interface Props {
  form: FormDef
  epicForms: FormDef[]
  onMutateForm: (updater: (f: FormDef) => FormDef) => void
}

function patchFieldValueForPreset(
  form: FormDef,
  presetId: string,
  fieldId: string,
  value: FieldDemoValue | undefined,
): FormDef {
  return patchPresetInFormById(form, presetId, (p) => {
    const fv = { ...(p.fieldValues ?? {}) }
    if (value === undefined) delete fv[fieldId]
    else fv[fieldId] = value
    return { ...p, fieldValues: Object.keys(fv).length ? fv : undefined }
  })
}

function ExampleScalarField({
  field,
  value,
  onChange,
}: {
  field: FormField
  value: FieldDemoValue | undefined
  onChange: (v: FieldDemoValue | undefined) => void
}) {
  switch (field.type) {
    case 'text':
      return field.textLong ? (
        <textarea
          className="acc__input acc__textarea"
          rows={3}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value ? e.target.value : undefined)}
          spellCheck={false}
        />
      ) : (
        <input
          type="text"
          className="acc__input"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value ? e.target.value : undefined)}
        />
      )
    case 'number':
      return (
        <input
          type="text"
          className="acc__input"
          inputMode="decimal"
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(e) => {
            const t = e.target.value.trim()
            if (!t) {
              onChange(undefined)
              return
            }
            const n = Number(t.replace(',', '.'))
            onChange(Number.isFinite(n) ? n : t)
          }}
        />
      )
    case 'decimal':
      return (
        <input
          type="text"
          className="acc__input"
          inputMode="decimal"
          value={typeof value === 'string' || typeof value === 'number' ? String(value ?? '') : ''}
          onChange={(e) => onChange(e.target.value.trim() ? e.target.value.trim() : undefined)}
        />
      )
    case 'boolean':
      return (
        <select
          className="acc__input acc__select"
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onChange={(e) => {
            const v = e.target.value
            onChange(v === 'true' ? true : v === 'false' ? false : undefined)
          }}
        >
          <option value="">(vazio)</option>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      )
    case 'date':
      return (
        <input
          type="date"
          className="acc__input"
          value={dateIsoFromDemo(value)}
          onChange={(e) => onChange(e.target.value ? e.target.value : undefined)}
        />
      )
    case 'reference':
    case 'textOptions':
      if (field.multiple && fieldSupportsMultiple(field.type)) {
        return (
          <textarea
            className="acc__input acc__textarea"
            rows={3}
            value={Array.isArray(value) ? value.join('\n') : ''}
            onChange={(e) => {
              const lines = e.target.value
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean)
              onChange(lines.length > 0 ? lines : undefined)
            }}
            spellCheck={false}
          />
        )
      }
      return (
        <select
          className="acc__input acc__select"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value ? e.target.value : undefined)}
        >
          <option value="">(nenhum)</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )
    case 'file':
      return <FileDemoListEditor value={value} onChange={onChange} />
    case 'geopoint': {
      const g = geopointFromDemo(value)
      return (
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
              onChange(has ? { lat, lng } : undefined)
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
              onChange(has ? { lat, lng } : undefined)
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
      )
    }
    case 'embeddedReference':
    case 'html':
    case 'alert':
      return null
    default:
      return null
  }
}

function ScenarioPresetBody({
  form,
  preset,
  epicForms,
  onMutateForm,
  canRemove,
  onRemove,
}: {
  form: FormDef
  preset: FormExampleValuePreset
  epicForms: FormDef[]
  onMutateForm: (updater: (f: FormDef) => FormDef) => void
  canRemove: boolean
  onRemove: () => void
}) {
  const pid = preset.id

  const iconBg = resolvePresetIconBackground(preset)

  return (
    <div className="form-examples__scenario-body">
      <label className="acc__field form-examples__field">
        <span className="acc__label">Nome do cenário</span>
        <input
          type="text"
          className="acc__input"
          value={preset.name}
          onChange={(e) =>
            onMutateForm((f) => ({
              ...f,
              exampleValuePresets: (f.exampleValuePresets ?? []).map((p) =>
                p.id === pid ? { ...p, name: e.target.value } : p,
              ),
            }))
          }
        />
      </label>

      <div className="form-examples__icon-color" role="group" aria-label="Cor do ícone do cenário">
        <span className="acc__label">Cor do ícone</span>
        <div className="form-examples__icon-swatch-wrap">
          {PRESET_ICON_COLOR_CHOICES.map((hex) => {
            const selected = iconBg === hex
            return (
              <button
                key={hex}
                type="button"
                className={`form-examples__icon-swatch${selected ? ' form-examples__icon-swatch--selected' : ''}`}
                style={{ background: hex }}
                title={hex}
                aria-label={`Usar cor ${hex}`}
                aria-pressed={selected}
                onClick={() =>
                  onMutateForm((f) => ({
                    ...f,
                    exampleValuePresets: (f.exampleValuePresets ?? []).map((p) =>
                      p.id === pid ? { ...p, iconColor: hex } : p,
                    ),
                  }))
                }
              />
            )
          })}
        </div>
      </div>

      {canRemove ? (
        <div className="form-examples__scenario-actions">
          <button type="button" className="form-examples__btn-remove" onClick={onRemove}>
            Remover este cenário
          </button>
        </div>
      ) : null}

      <div className="form-examples__scenario-fields">
        {form.fields.map((field) => {
          if (field.type === 'html' || field.type === 'alert') return null
          const fv = preset.fieldValues?.[field.id]
          if (field.type === 'embeddedReference') {
            const rows = preset.embeddedRowsByFieldId?.[field.id]
            return (
              <div key={field.id} className="acc__field form-examples__embed-block">
                <span className="acc__label">{field.label}</span>
                <EmbeddedDemoInstancesEditor
                  field={field}
                  rows={rows}
                  onSetRows={(next) =>
                    onMutateForm((f0) =>
                      patchPresetInFormById(f0, pid, (p) => {
                        const emb = { ...(p.embeddedRowsByFieldId ?? {}) }
                        if (next === undefined) delete emb[field.id]
                        else emb[field.id] = next
                        return {
                          ...p,
                          embeddedRowsByFieldId: Object.keys(emb).length ? emb : undefined,
                        }
                      }),
                    )
                  }
                  epicForms={epicForms}
                  ancestorFormIds={[form.id]}
                />
              </div>
            )
          }
          return (
            <label key={field.id} className="acc__field form-examples__field">
              <span className="acc__label">{field.label}</span>
              <ExampleScalarField
                field={field}
                value={fv}
                onChange={(v) => onMutateForm((f0) => patchFieldValueForPreset(f0, pid, field.id, v))}
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default function FormExampleValuesTab({ form, epicForms, onMutateForm }: Props) {
  const presets = form.exampleValuePresets ?? []
  const active = getActiveExamplePreset(form)
  const activeCanvasId = form.activeExamplePresetId ?? presets[0]?.id ?? ''

  const [openScenarioId, setOpenScenarioId] = useState<string | null>(() => activeCanvasId || null)

  useEffect(() => {
    if (openScenarioId && !presets.some((p) => p.id === openScenarioId)) {
      setOpenScenarioId(presets[0]?.id ?? null)
    }
  }, [presets, openScenarioId])

  function setActiveCanvasPreset(id: string) {
    onMutateForm((f) => ({ ...f, activeExamplePresetId: id }))
  }

  function addPreset() {
    const id = newExamplePresetId()
    onMutateForm((f) => ({
      ...f,
      exampleValuePresets: [
        ...(f.exampleValuePresets ?? []),
        { id, name: `Cenário ${(f.exampleValuePresets?.length ?? 0) + 1}`, iconColor: DEFAULT_PRESET_ICON_COLOR },
      ],
    }))
    setOpenScenarioId(id)
  }

  function removePreset(id: string) {
    onMutateForm((f) => {
      const next = (f.exampleValuePresets ?? []).filter((p) => p.id !== id)
      let activeId = f.activeExamplePresetId
      if (activeId === id) activeId = next[0]?.id
      return { ...f, exampleValuePresets: next.length ? next : undefined, activeExamplePresetId: activeId }
    })
    setOpenScenarioId((prev) => {
      if (prev !== id) return prev
      const remaining = presets.filter((p) => p.id !== id)
      return remaining[0]?.id ?? null
    })
  }

  function toggleScenario(id: string) {
    setOpenScenarioId((prev) => (prev === id ? null : id))
  }

  if (!active || presets.length === 0) {
    return (
      <div className="form-examples form-examples--empty">
        <p className="form-examples__empty-lead">Nenhum cenário de exemplo</p>
        <p className="form-examples__empty-hint">
          Crie um cenário para preencher o canvas e a exportação com dados fictícios.
        </p>
        <button type="button" className="sidebar__add-btn" onClick={() => onMutateForm(ensureFormHasExamplePreset)}>
          Criar cenário de exemplo
        </button>
      </div>
    )
  }

  return (
    <div className="form-examples">
      <div className="form-examples__header">
        <label className="acc__field form-examples__field">
          <span className="acc__label">Cenário ativo (canvas e exportação)</span>
          <select
            className="acc__input acc__select"
            value={activeCanvasId}
            onChange={(e) => setActiveCanvasPreset(e.target.value)}
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <div className="form-examples__actions">
          <button type="button" className="sidebar__add-btn" onClick={addPreset}>
            Novo cenário
          </button>
        </div>
      </div>

      <p className="form-examples__hint">
        O cenário <strong>ativo</strong> é o usado no canvas e no HTML exportado. Expanda cada cenário para editar os
        valores desse conjunto.
      </p>

      <div className="form-examples__scroll form-examples__scroll--accordions">
        {presets.map((preset) => {
          const isOpen = openScenarioId === preset.id
          const isActiveCanvas = preset.id === activeCanvasId
          return (
            <div
              key={preset.id}
              className={`acc form-examples__scenario-acc${isOpen ? ' acc--open' : ''}`}
            >
              <button
                type="button"
                className="acc__header form-examples__scenario-header"
                onClick={() => toggleScenario(preset.id)}
                aria-expanded={isOpen}
              >
                <span className="acc__header-main">
                  <span className="acc__name">{preset.name.trim() || 'Sem nome'}</span>
                  {isActiveCanvas ? (
                    <span className="form-examples__badge-active" title="Usado no canvas e na exportação">
                      Ativo
                    </span>
                  ) : null}
                </span>
                <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isOpen ? (
                <ScenarioPresetBody
                  form={form}
                  preset={preset}
                  epicForms={epicForms}
                  onMutateForm={onMutateForm}
                  canRemove={presets.length > 1}
                  onRemove={() => removePreset(preset.id)}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
