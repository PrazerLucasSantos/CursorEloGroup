import type { FieldVisibilityRule, FieldVisibilityRuleAction, FormDef, FormField } from '../types'
import { fieldSupportsMultiple, isFormFieldVisibleInForm } from '../types'
import { booleanFromDemo, normalizeReferenceSelection } from './fieldDemoValue'
import { resolveDemoSelectOptions } from './demoSelectOptions'
import { getScalarDemoForField } from './formExamplePresets'
import { canvasRuntimeFieldKey, type CanvasEmbAncestor } from './canvasRuntimeValueKey'

export function newFieldVisibilityRuleId(): string {
  return crypto.randomUUID?.() ?? `fvr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

/** Grafo orientado source → alvo: existe ciclo (incl. self-loop). */
export function fieldVisibilityRulesHaveCycle(rules: FieldVisibilityRule[]): boolean {
  const adj = new Map<string, string[]>()
  const allNodes = new Set<string>()
  for (const r of rules) {
    const s = r.sourceFieldId
    allNodes.add(s)
    for (const t of r.targetFieldIds) {
      allNodes.add(t)
      if (!adj.has(s)) adj.set(s, [])
      adj.get(s)!.push(t)
    }
  }
  const WHITE = 0
  const GRAY = 1
  const BLACK = 2
  const color = new Map<string, number>()
  function dfs(u: string): boolean {
    color.set(u, GRAY)
    for (const v of adj.get(u) ?? []) {
      const c = color.get(v) ?? WHITE
      if (c === GRAY) return true
      if (c === WHITE && dfs(v)) return true
    }
    color.set(u, BLACK)
    return false
  }
  for (const n of allNodes) {
    if ((color.get(n) ?? WHITE) === WHITE && dfs(n)) return true
  }
  return false
}

function readBooleanFromCanvas(
  form: FormDef,
  field: FormField,
  getValue: (k: string) => string | undefined,
  canvasFormDefId: string,
  canvasAncestors: CanvasEmbAncestor[],
): boolean {
  const k = canvasRuntimeFieldKey(canvasFormDefId, canvasAncestors, field.id)
  const ov = getValue(k)
  if (ov !== undefined) {
    const t = ov.trim().toLowerCase()
    if (t === 'sim' || t === 'true' || t === '1') return true
    if (t === 'não' || t === 'nao' || t === 'false' || t === '0') return false
  }
  return booleanFromDemo(getScalarDemoForField(form, field.id))
}

function readTextOptionsSummaryFromCanvas(
  form: FormDef,
  field: FormField,
  getValue: (k: string) => string | undefined,
  canvasFormDefId: string,
  canvasAncestors: CanvasEmbAncestor[],
): string {
  const k = canvasRuntimeFieldKey(canvasFormDefId, canvasAncestors, field.id)
  const ov = getValue(k)
  if (ov !== undefined) return ov.trim()
  const demo = getScalarDemoForField(form, field.id)
  const opts = resolveDemoSelectOptions({
    options: field.options,
    linkedFormId: field.linkedFormId,
    label: field.label,
  })
  const multi = !!field.multiple && fieldSupportsMultiple(field.type)
  const sel = normalizeReferenceSelection(demo, opts, multi)
  return sel.join(' / ')
}

export function visibilityRuleConditionMatches(
  rule: FieldVisibilityRule,
  form: FormDef,
  getValue: (k: string) => string | undefined,
  canvasFormDefId: string,
  canvasAncestors: CanvasEmbAncestor[],
  fieldsById: Map<string, FormField>,
): boolean {
  if (rule.operator !== 'eq') return false
  const src = fieldsById.get(rule.sourceFieldId)
  if (!src) return false
  if (rule.sourceKind === 'boolean') {
    if (src.type !== 'boolean') return false
    const cur = readBooleanFromCanvas(form, src, getValue, canvasFormDefId, canvasAncestors)
    return cur === rule.expectedBoolean
  }
  if (rule.sourceKind === 'textOptions') {
    if (src.type !== 'textOptions') return false
    const cur = readTextOptionsSummaryFromCanvas(form, src, getValue, canvasFormDefId, canvasAncestors)
    return cur === rule.expectedOptionText.trim()
  }
  return false
}

/** Visibilidade de um campo na linha `rowIndex` da tabela embutida (regras + `hidden` do modelo). */
export function isFieldVisibleInEmbeddedTableCell(
  tablePresetForm: FormDef,
  getValue: ((k: string) => string | undefined) | undefined,
  nestedCanvasFormDefId: string,
  canvasAncestorsBeforeEmbedded: CanvasEmbAncestor[],
  parentEmbeddedFieldId: string,
  rowIndex: number,
  field: FormField,
): boolean {
  if (!isFormFieldVisibleInForm(field)) return false
  const rules = tablePresetForm.fieldVisibilityRules
  if (!rules?.length || !getValue) return true
  const ancestors: CanvasEmbAncestor[] = [
    ...canvasAncestorsBeforeEmbedded,
    { embeddedFieldId: parentEmbeddedFieldId, instanceIndex: rowIndex },
  ]
  const hidden = computeEffectiveHiddenMapForCanvas(
    tablePresetForm,
    getValue,
    nestedCanvasFormDefId,
    ancestors,
  )
  return !hidden.get(field.id)
}

function isVisibilityRuleAction(action: FieldVisibilityRuleAction): boolean {
  return action === 'hide' || action === 'show'
}

function isReadOnlyRuleAction(action: FieldVisibilityRuleAction): boolean {
  return action === 'readonly' || action === 'editable'
}

export function computeEffectiveHiddenMapForCanvas(
  form: FormDef,
  getValue: (k: string) => string | undefined,
  canvasFormDefId: string,
  canvasAncestors: CanvasEmbAncestor[],
): Map<string, boolean> {
  const out = new Map<string, boolean>()
  for (const f of form.fields) {
    out.set(f.id, f.hidden === true)
  }
  const rules = form.fieldVisibilityRules
  if (!rules?.length) return out
  const fieldsById = new Map(form.fields.map((x) => [x.id, x]))
  for (const rule of rules) {
    if (!isVisibilityRuleAction(rule.action)) continue
    if (!visibilityRuleConditionMatches(rule, form, getValue, canvasFormDefId, canvasAncestors, fieldsById)) {
      continue
    }
    for (const tid of rule.targetFieldIds) {
      if (!fieldsById.has(tid)) continue
      out.set(tid, rule.action === 'hide')
    }
  }
  return out
}

/**
 * Overlay de só leitura imposto pelas regras (`readonly` / `editable`).
 * Se um campo não está no mapa, usar `field.readOnly` do modelo.
 * Valor `true` = forçar só leitura; `false` = forçar editável (prevalece sobre `readOnly` do modelo neste preview).
 */
export function computeEffectiveReadOnlyRuleOverlayForCanvas(
  form: FormDef,
  getValue: (k: string) => string | undefined,
  canvasFormDefId: string,
  canvasAncestors: CanvasEmbAncestor[],
): Map<string, boolean> {
  const out = new Map<string, boolean>()
  const rules = form.fieldVisibilityRules
  if (!rules?.length) return out
  const fieldsById = new Map(form.fields.map((x) => [x.id, x]))
  for (const rule of rules) {
    if (!isReadOnlyRuleAction(rule.action)) continue
    if (!visibilityRuleConditionMatches(rule, form, getValue, canvasFormDefId, canvasAncestors, fieldsById)) {
      continue
    }
    for (const tid of rule.targetFieldIds) {
      if (!fieldsById.has(tid)) continue
      out.set(tid, rule.action === 'readonly')
    }
  }
  return out
}

export function stripFieldIdFromVisibilityRules(form: FormDef, fieldId: string): FormDef {
  const rules = form.fieldVisibilityRules
  if (!rules?.length) return form
  const next: FieldVisibilityRule[] = []
  for (const r of rules) {
    if (r.sourceFieldId === fieldId) continue
    const targets = r.targetFieldIds.filter((id) => id !== fieldId)
    if (targets.length === 0) continue
    next.push({ ...r, targetFieldIds: targets })
  }
  return { ...form, fieldVisibilityRules: next.length ? next : undefined }
}
