import type { FieldDemoValue, FormDef, FormExampleValuePreset, FormField } from '../types'
import { isFormFieldVisibleInForm } from '../types'
import { isSectionedForm, normalizeSectionedForm, orderRootFieldsForEditor } from './formSections'
import type { CanvasEmbAncestor } from './canvasRuntimeValueKey'
import { canvasRuntimeFieldKey } from './canvasRuntimeValueKey'
import { demoValueAsSingleLineSummary } from './fieldDemoValue'
import { getScalarDemoForField } from './formExamplePresets'

export function findFormById(forms: FormDef[], id: string): FormDef | undefined {
  return forms.find((f) => f.id === id)
}

export type EmbeddedAccordionTitleOptions = {
  /** Formulário cujos campos identidade geram o título (o linkado). */
  nestedFormId: string
  /** Cadeia ref. embutida + índice da instância até este bloco (inclusive). */
  canvasAncestors: CanvasEmbAncestor[]
  /** Campo identidade/destaque com demo resolvida por instância (JSON / canvas). */
  resolveIdentityDemoField?: (identityField: FormField) => FormField
  /** Valores editados no canvas; ausente = só demo / modelo. */
  getOverride?: (key: string) => string | undefined
  /** Cenário de exemplo: identidade usa `fieldValues` deste preset (sem o preset ativo do canvas). */
  examplePreset?: FormExampleValuePreset
}

function formRelevanceSummaryLines(
  linkedForm: FormDef | undefined,
  relevance: 'identity' | 'highlight',
  options?: EmbeddedAccordionTitleOptions,
  fallbackToFormName = false,
): string[] {
  if (!linkedForm) return fallbackToFormName ? ['Subformulário'] : []
  const name = linkedForm.name?.trim()
  const fields = linkedForm.fields.filter((f) => f.relevance === relevance)
  if (fields.length === 0) return fallbackToFormName ? [name || 'Subformulário'] : []

  const resolve = options?.resolveIdentityDemoField ?? ((f: FormField) => f)
  const parts = fields.map((f) => {
    if (options?.getOverride) {
      const k = canvasRuntimeFieldKey(options.nestedFormId, options.canvasAncestors, f.id)
      const ov = options.getOverride(k)
      if (ov !== undefined) return ov
    }
    if (options?.examplePreset) {
      const pv = options.examplePreset.fieldValues?.[f.id]
      if (pv !== undefined) return demoValueAsSingleLineSummary(f, pv)
      const demoField = resolve(f)
      const inline = (demoField as FormField & { demoValue?: FieldDemoValue }).demoValue
      if (inline !== undefined) return demoValueAsSingleLineSummary(f, inline)
      return demoValueAsSingleLineSummary(f, undefined)
    }
    const demoField = resolve(f)
    const inline = (demoField as FormField & { demoValue?: FieldDemoValue }).demoValue
    const d =
      inline !== undefined ? inline : getScalarDemoForField(linkedForm, f.id)
    return demoValueAsSingleLineSummary(f, d)
  })
  const lines = parts.map((s) => s.trim()).filter((s) => s.length > 0)
  if (lines.length === 0) return fallbackToFormName ? [name || 'Subformulário'] : []
  return lines
}

/**
 * Valores de identidade (`relevance: identity`), na ordem dos campos, um por linha na UI.
 * Com `getOverride`, usa o estado da UI (canvas); senão, resumo da demo do campo.
 * Se não houver identidade ou todos vazios, devolve uma linha com o nome do formulário.
 */
export function formIdentityTitleLines(
  linkedForm: FormDef | undefined,
  options?: EmbeddedAccordionTitleOptions,
): string[] {
  return formRelevanceSummaryLines(linkedForm, 'identity', options, true)
}

/** Valores de destaque (`relevance: highlight`) para o lado direito do cabeçalho do acordeão. */
export function formHighlightTitleLines(
  linkedForm: FormDef | undefined,
  options?: EmbeddedAccordionTitleOptions,
): string[] {
  return formRelevanceSummaryLines(linkedForm, 'highlight', options, false)
}

/**
 * Uma única linha (ex.: aria-label, export compacto): identidades separadas por " / ".
 */
export function embeddedFormAccordionInstanceTitle(
  linkedForm: FormDef | undefined,
  options?: EmbeddedAccordionTitleOptions,
): string {
  return formIdentityTitleLines(linkedForm, options).join(' / ')
}

/** Destaques numa linha (ex.: progresso no cabeçalho do acordeão). */
export function embeddedFormAccordionInstanceHighlight(
  linkedForm: FormDef | undefined,
  options?: EmbeddedAccordionTitleOptions,
): string {
  return formHighlightTitleLines(linkedForm, options).join(' / ')
}

/** Campos do subformulário resolvidos pelo `linkedFormId` (ref. embutida). */
export function getEmbeddedNestedFields(field: FormField, epicForms: FormDef[]): FormField[] {
  if (field.type !== 'embeddedReference' || !field.linkedFormId) return []
  const linked = findFormById(epicForms, field.linkedFormId)
  return linked?.fields ?? []
}

/**
 * Colunas do modo tabela da ref. embutida: lista plana (sem UI de seções).
 * Com formulário seccionado, usa a ordem das seções + campos.
 */
export function getEmbeddedNestedFieldsForTable(field: FormField, epicForms: FormDef[]): FormField[] {
  if (field.type !== 'embeddedReference' || !field.linkedFormId) return []
  const linked = findFormById(epicForms, field.linkedFormId)
  if (!linked?.fields?.length) return []
  const norm = normalizeSectionedForm(linked)
  const flat =
    !isSectionedForm(norm) || !norm.sections?.length
      ? norm.fields
      : orderRootFieldsForEditor(norm.fields, norm.sections, norm.sectionLayout)
  const exclude = new Set(field.embeddedTableHiddenFieldIds ?? [])
  return flat.filter((f) => isFormFieldVisibleInForm(f) && !exclude.has(f.id))
}
