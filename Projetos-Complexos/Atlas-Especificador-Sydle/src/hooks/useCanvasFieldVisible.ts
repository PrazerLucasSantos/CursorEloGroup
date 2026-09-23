import { useMemo } from 'react'
import { useCanvasRuntimeValues } from '../contexts/CanvasRuntimeValuesContext'
import type { FormDef, FormField } from '../types'
import { isFormFieldVisibleInForm } from '../types'
import type { CanvasEmbAncestor } from '../utils/canvasRuntimeValueKey'
import {
  computeEffectiveHiddenMapForCanvas,
  computeEffectiveReadOnlyRuleOverlayForCanvas,
} from '../utils/fieldVisibilityRules'

/**
 * Colunas da tabela embutida: inclui um campo se for visível em **alguma** linha, com regras avaliadas
 * por `instanceIndex` (valores de runtime por linha).
 */
export function useEmbeddedTableVisibleNestedFields(
  tablePresetForm: FormDef,
  nestedCanvasFormDefId: string,
  canvasAncestorsBeforeEmbedded: CanvasEmbAncestor[],
  parentEmbeddedFieldId: string,
  nested: FormField[],
  rowCount: number,
): FormField[] {
  const runtime = useCanvasRuntimeValues()
  /** Inclui valores do canvas para o cabeçalho sumir junto com as células ao mudar a linha. */
  const runtimeValuesKey = runtime ? JSON.stringify(runtime.getAllValues()) : ''
  return useMemo(() => {
    const baseVisible = nested.filter(isFormFieldVisibleInForm)
    const rules = tablePresetForm.fieldVisibilityRules
    if (!rules?.length || !runtime) {
      return baseVisible
    }
    const rowLoop = Math.max(0, rowCount)
    if (rowLoop === 0) {
      return baseVisible
    }
    const visibleIds = new Set<string>()
    for (let ri = 0; ri < rowLoop; ri++) {
      const ancestors: CanvasEmbAncestor[] = [
        ...canvasAncestorsBeforeEmbedded,
        { embeddedFieldId: parentEmbeddedFieldId, instanceIndex: ri },
      ]
      const hidden = computeEffectiveHiddenMapForCanvas(
        tablePresetForm,
        runtime.getValue,
        nestedCanvasFormDefId,
        ancestors,
      )
      for (const nf of nested) {
        if (!isFormFieldVisibleInForm(nf)) continue
        const isHidden = hidden.get(nf.id) ?? nf.hidden === true
        if (!isHidden) visibleIds.add(nf.id)
      }
    }
    return nested.filter((nf) => isFormFieldVisibleInForm(nf) && visibleIds.has(nf.id))
  }, [
    tablePresetForm,
    tablePresetForm.fieldVisibilityRules,
    nested,
    nestedCanvasFormDefId,
    canvasAncestorsBeforeEmbedded,
    parentEmbeddedFieldId,
    rowCount,
    runtime,
    runtimeValuesKey,
  ])
}

export function useCanvasFieldVisible(
  form: FormDef,
  ctx: { canvasFormDefId: string; canvasAncestors: CanvasEmbAncestor[] },
): (field: FormField) => boolean {
  const runtime = useCanvasRuntimeValues()
  /** Inclui valores do canvas para abas/campos sumirem ao mudar toggles (ex.: Organização raiz). */
  const runtimeValuesKey = runtime ? JSON.stringify(runtime.getAllValues()) : ''
  return useMemo(() => {
    const rules = form.fieldVisibilityRules
    if (!rules?.length || !runtime) {
      return isFormFieldVisibleInForm
    }
    const hidden = computeEffectiveHiddenMapForCanvas(
      form,
      runtime.getValue,
      ctx.canvasFormDefId,
      ctx.canvasAncestors,
    )
    return (f: FormField) => {
      const isHidden = hidden.has(f.id) ? hidden.get(f.id)! : f.hidden === true
      return !isHidden
    }
  }, [
    form,
    form.fieldVisibilityRules,
    runtime,
    runtimeValuesKey,
    ctx.canvasFormDefId,
    ctx.canvasAncestors,
  ])
}

/** `readOnly` efectivo do modelo + regras `readonly`/`editable` (sem canvas herdado). */
export function useCanvasFieldRuleReadOnlyOverlay(
  form: FormDef,
  ctx: { canvasFormDefId: string; canvasAncestors: CanvasEmbAncestor[] },
): (field: FormField) => boolean {
  const runtime = useCanvasRuntimeValues()
  const runtimeValuesKey = runtime ? JSON.stringify(runtime.getAllValues()) : ''
  return useMemo(() => {
    const rules = form.fieldVisibilityRules
    if (!rules?.length || !runtime) {
      return (f: FormField) => f.readOnly
    }
    const overlay = computeEffectiveReadOnlyRuleOverlayForCanvas(
      form,
      runtime.getValue,
      ctx.canvasFormDefId,
      ctx.canvasAncestors,
    )
    return (f: FormField) => (overlay.has(f.id) ? overlay.get(f.id)! : f.readOnly)
  }, [
    form,
    form.fieldVisibilityRules,
    runtime,
    runtimeValuesKey,
    ctx.canvasFormDefId,
    ctx.canvasAncestors,
  ])
}
