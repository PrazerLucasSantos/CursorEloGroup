import type {
  EmbeddedDemoRow,
  FieldDemoValue,
  FormDef,
  FormExampleValuePreset,
  FormField,
} from '../types'
import { isFormFieldVisibleInForm } from '../types'
import { demoValueAsSingleLineSummary } from './fieldDemoValue'
import { orderRootFieldsForDisplay } from './formSections'
import { DEFAULT_PRESET_ICON_COLOR } from './presetIconColor'

type LegacyField = FormField & {
  demoValue?: FieldDemoValue
  embeddedDemoInstances?: EmbeddedDemoRow[]
}

export function newExamplePresetId(): string {
  return crypto.randomUUID?.() ?? `evp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function getActiveExamplePreset(form: FormDef): FormExampleValuePreset | undefined {
  const presets = form.exampleValuePresets
  if (!presets?.length) return undefined
  const id = form.activeExamplePresetId
  if (id) {
    const p = presets.find((x) => x.id === id)
    if (p) return p
  }
  return presets[0]
}

/**
 * Presets históricos da Demanda usam `patlasv4proto-demanda-*`
 * enquanto os campos atuais são `patlasv4proto-demc|demcli|dempar-*`.
 */
export function aliasDemandaPresetFieldIds(fieldId: string): string[] {
  const out = [fieldId]
  const add = (id: string) => {
    if (!out.includes(id)) out.push(id)
  }
  if (fieldId.includes('-demc-')) add(fieldId.replace('-demc-', '-demanda-'))
  if (fieldId.includes('-demcli-')) add(fieldId.replace('-demcli-', '-demanda-'))
  if (fieldId.includes('-dempar-')) add(fieldId.replace('-dempar-', '-demanda-'))
  if (fieldId.includes('-demanda-')) {
    add(fieldId.replace('-demanda-', '-demc-'))
    add(fieldId.replace('-demanda-', '-demcli-'))
    add(fieldId.replace('-demanda-', '-dempar-'))
  }
  return out
}

export function readPresetFieldValue(
  preset: FormExampleValuePreset | undefined,
  fieldId: string,
): FieldDemoValue | undefined {
  if (!preset?.fieldValues) return undefined
  for (const id of aliasDemandaPresetFieldIds(fieldId)) {
    if (preset.fieldValues[id] !== undefined) return preset.fieldValues[id]
  }
  return undefined
}

export function getScalarDemoForField(form: FormDef, fieldId: string): FieldDemoValue | undefined {
  return readPresetFieldValue(getActiveExamplePreset(form), fieldId)
}

/** Corrige presets gerados com `{ embeddedDemoInstances: [...] }` no nível errado. */
function normalizeEmbeddedRowsEntry(raw: unknown): EmbeddedDemoRow[] | undefined {
  if (Array.isArray(raw)) return raw as EmbeddedDemoRow[]
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'embeddedDemoInstances' in raw &&
    Array.isArray((raw as { embeddedDemoInstances: unknown }).embeddedDemoInstances)
  ) {
    return (raw as { embeddedDemoInstances: EmbeddedDemoRow[] }).embeddedDemoInstances
  }
  return undefined
}

function normalizePresetEmbeddedRows(preset: FormExampleValuePreset): FormExampleValuePreset {
  const emb = preset.embeddedRowsByFieldId
  if (!emb) return preset
  let changed = false
  const next: Record<string, EmbeddedDemoRow[]> = {}
  for (const [fieldId, raw] of Object.entries(emb)) {
    const rows = normalizeEmbeddedRowsEntry(raw)
    if (rows) {
      next[fieldId] = rows
      if (rows !== raw) changed = true
    } else {
      next[fieldId] = raw as EmbeddedDemoRow[]
    }
  }
  return changed ? { ...preset, embeddedRowsByFieldId: next } : preset
}

export function getEmbeddedRowsForField(
  form: FormDef,
  embeddedFieldId: string,
): EmbeddedDemoRow[] | undefined {
  const raw = getActiveExamplePreset(form)?.embeddedRowsByFieldId?.[embeddedFieldId]
  return normalizeEmbeddedRowsEntry(raw)
}

function stripLegacyFromField(f: FormField): FormField {
  const { demoValue: _d, embeddedDemoInstances: _e, ...rest } = f as LegacyField
  return rest as FormField
}

export function patchActivePresetInForm(
  form: FormDef,
  fn: (p: FormExampleValuePreset) => FormExampleValuePreset,
): FormDef {
  const presets = form.exampleValuePresets ?? []
  const active = getActiveExamplePreset(form)
  if (!active) return form
  const next = presets.map((p) => (p.id === active.id ? fn(p) : p))
  return { ...form, exampleValuePresets: next }
}

/** Atualiza um cenário pelo id (edição na aba de exemplos, vários accordions). */
export function patchPresetInFormById(
  form: FormDef,
  presetId: string,
  fn: (p: FormExampleValuePreset) => FormExampleValuePreset,
): FormDef {
  const presets = form.exampleValuePresets ?? []
  if (!presets.some((p) => p.id === presetId)) return form
  return {
    ...form,
    exampleValuePresets: presets.map((p) => (p.id === presetId ? fn(p) : p)),
  }
}

/** Remove entradas de exemplo deste campo em todos os presets (ex.: ao apagar o campo). */
export function stripFieldIdFromAllPresets(form: FormDef, fieldId: string): FormDef {
  const presets = form.exampleValuePresets
  if (!presets?.length) return form
  const nextPresets = presets.map((p) => {
    const fv = p.fieldValues ? { ...p.fieldValues } : undefined
    if (fv && fieldId in fv) delete fv[fieldId]
    const emb = p.embeddedRowsByFieldId ? { ...p.embeddedRowsByFieldId } : undefined
    if (emb && fieldId in emb) delete emb[fieldId]
    return {
      ...p,
      fieldValues: fv && Object.keys(fv).length > 0 ? fv : undefined,
      embeddedRowsByFieldId: emb && Object.keys(emb).length > 0 ? emb : undefined,
    }
  })
  return { ...form, exampleValuePresets: nextPresets }
}

export function trimEmbeddedRowsInActivePreset(
  form: FormDef,
  embeddedFieldId: string,
  maxRows: number,
): FormDef {
  return patchActivePresetInForm(form, (p) => {
    const rows = p.embeddedRowsByFieldId?.[embeddedFieldId]
    if (!rows || rows.length <= maxRows) return p
    const sliced = rows.slice(0, maxRows)
    return {
      ...p,
      embeddedRowsByFieldId: {
        ...p.embeddedRowsByFieldId,
        [embeddedFieldId]: sliced,
      },
    }
  })
}

/**
 * Migra `demoValue` / `embeddedDemoInstances` legados nos campos para presets no formulário
 * e remove-os dos campos.
 */
function hasLegacyDemoOnFields(form: FormDef): boolean {
  return form.fields.some((f) => {
    const lf = f as LegacyField
    return lf.demoValue !== undefined || (lf.embeddedDemoInstances?.length ?? 0) > 0
  })
}

export function migrateFormLegacyDemoToPresets(form: FormDef): FormDef {
  let next = form
  if (form.exampleValuePresets?.length) {
    const normalized = form.exampleValuePresets.map(normalizePresetEmbeddedRows)
    if (normalized.some((p, i) => p !== form.exampleValuePresets![i])) {
      next = { ...form, exampleValuePresets: normalized }
    }
  }
  if (next.exampleValuePresets?.length && !hasLegacyDemoOnFields(next)) {
    return next
  }
  form = next

  const collectedFv: Partial<Record<string, FieldDemoValue>> = {}
  const collectedEmb: Partial<Record<string, EmbeddedDemoRow[]>> = {}

  for (const f of form.fields) {
    const lf = f as LegacyField
    if (lf.demoValue !== undefined) collectedFv[f.id] = lf.demoValue
    if (lf.embeddedDemoInstances?.length) {
      collectedEmb[f.id] = lf.embeddedDemoInstances.map((r) => ({ ...r }))
    }
  }

  const hasCollected =
    Object.keys(collectedFv).length > 0 || Object.keys(collectedEmb).length > 0
  if (!hasCollected && !hasLegacyDemoOnFields(form)) {
    return form
  }

  const cleanedFields = form.fields.map(stripLegacyFromField)

  let nextPresets = form.exampleValuePresets
  let nextActiveId = form.activeExamplePresetId

  if (hasCollected) {
    if (nextPresets?.length) {
      const target = getActiveExamplePreset(form) ?? nextPresets[0]
      nextPresets = nextPresets.map((p) =>
        p.id === target.id
          ? {
              ...p,
              fieldValues: { ...collectedFv, ...p.fieldValues },
              embeddedRowsByFieldId: { ...collectedEmb, ...p.embeddedRowsByFieldId },
            }
          : p,
      )
      nextActiveId = nextActiveId ?? target.id
    } else {
      const preset: FormExampleValuePreset = {
        id: newExamplePresetId(),
        name: 'Padrão',
        iconColor: DEFAULT_PRESET_ICON_COLOR,
        fieldValues: Object.keys(collectedFv).length > 0 ? collectedFv : undefined,
        embeddedRowsByFieldId:
          Object.keys(collectedEmb).length > 0 ? collectedEmb : undefined,
      }
      nextPresets = [preset]
      nextActiveId = preset.id
    }
  }

  return {
    ...form,
    fields: cleanedFields,
    exampleValuePresets: nextPresets,
    activeExamplePresetId: nextActiveId,
  }
}

export function migrateEpicForms(forms: FormDef[]): FormDef[] {
  return forms.map((f) => migrateFormLegacyDemoToPresets(f))
}

/** Garante pelo menos um preset para a UI de exemplos (sem alterar se já existir). */
export function ensureFormHasExamplePreset(form: FormDef): FormDef {
  if (form.exampleValuePresets?.length) return form
  const p: FormExampleValuePreset = {
    id: newExamplePresetId(),
    name: 'Padrão',
    iconColor: DEFAULT_PRESET_ICON_COLOR,
  }
  return { ...form, exampleValuePresets: [p], activeExamplePresetId: p.id }
}

/** Linhas de destaque (`relevance: highlight`) com valores do cenário `preset` (mesma ideia do header em modo leitura). */
export function formHighlightRowsFromExamplePreset(
  form: FormDef,
  preset: FormExampleValuePreset,
): { id: string; label: string; value: string }[] {
  return orderRootFieldsForDisplay(form)
    .filter((f) => f.relevance === 'highlight' && isFormFieldVisibleInForm(f))
    .map((field) => {
      const pv = readPresetFieldValue(preset, field.id)
      if (pv !== undefined) {
        const raw = demoValueAsSingleLineSummary(field, pv).trim()
        return { id: field.id, label: field.label.trim() || 'Campo', value: raw.length > 0 ? raw : '—' }
      }
      const inline = (field as LegacyField).demoValue
      if (inline !== undefined) {
        const raw = demoValueAsSingleLineSummary(field, inline).trim()
        return { id: field.id, label: field.label.trim() || 'Campo', value: raw.length > 0 ? raw : '—' }
      }
      const raw = demoValueAsSingleLineSummary(field, undefined).trim()
      return { id: field.id, label: field.label.trim() || 'Campo', value: raw.length > 0 ? raw : '—' }
    })
}
