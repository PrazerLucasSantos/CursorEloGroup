import type { FormDef, FormMethod } from '../types'
import { demoValueAsSingleLineSummary } from './fieldDemoValue'
import { getActiveExamplePreset, getScalarDemoForField } from './formExamplePresets'
import { canvasRuntimeFieldKey } from './canvasRuntimeValueKey'
import {
  filterDemandaFormMethodsByStatus,
  isDemandaLiveForm,
} from './demandaAtlasLive'

/** Lê o valor textual actual do campo origem (canvas override → cenário activo). */
export function readMethodVisibilitySourceValue(
  form: FormDef,
  sourceFieldId: string,
  getValue?: (k: string) => string | undefined,
): string {
  if (getValue) {
    const k = canvasRuntimeFieldKey(form.id, [], sourceFieldId)
    const ov = getValue(k)
    if (ov !== undefined && ov.trim() !== '') return ov.trim()
  }
  const field = form.fields.find((f) => f.id === sourceFieldId)
  if (!field) return ''
  const preset = getActiveExamplePreset(form)
  const demo =
    preset?.fieldValues?.[sourceFieldId] !== undefined
      ? preset.fieldValues[sourceFieldId]
      : getScalarDemoForField(form, sourceFieldId)
  return demoValueAsSingleLineSummary(field, demo).trim()
}

export function isFormMethodVisible(
  form: FormDef,
  method: FormMethod,
  getValue?: (k: string) => string | undefined,
): boolean {
  const vw = method.visibleWhen
  if (!vw?.sourceFieldId || !vw.expectedOptionTexts?.length) return true
  const cur = readMethodVisibilitySourceValue(form, vw.sourceFieldId, getValue)
  return vw.expectedOptionTexts.some((t) => t.trim() === cur)
}

export function filterVisibleFormMethods(
  form: FormDef,
  methods: FormMethod[] | undefined,
  getValue?: (k: string) => string | undefined,
): FormMethod[] {
  const byVisibleWhen = (methods ?? []).filter((m) => isFormMethodVisible(form, m, getValue))
  if (isDemandaLiveForm(form.id)) {
    return filterDemandaFormMethodsByStatus(form, byVisibleWhen, getValue)
  }
  return byVisibleWhen
}
