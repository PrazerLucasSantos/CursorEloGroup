import type { EmbeddedChildBranch, EmbeddedDemoRow, FieldDemoValue, FormDef, FormField } from '../types'
import { fieldSupportsMultiple } from '../types'
import { getEmbeddedRowsForField } from './formExamplePresets'

/** Vista de campo com demo resolvida a partir de presets (não persiste no modelo). */
export type FormFieldWithRuntimeDemo = FormField & {
  demoValue?: FieldDemoValue
  embeddedDemoInstances?: EmbeddedDemoRow[]
}

/** Célula da linha é um sub-bloco `{ embeddedDemoInstances }` (não geoponto `{ lat, lng }`). */
export function isEmbeddedChildBranch(v: unknown): v is EmbeddedChildBranch {
  if (typeof v !== 'object' || v === null) return false
  if (!Object.prototype.hasOwnProperty.call(v, 'embeddedDemoInstances')) return false
  return Array.isArray((v as EmbeddedChildBranch).embeddedDemoInstances)
}

/** Linhas de exemplo do preset para um campo embutido (raiz do preset ou célula `{ embeddedDemoInstances }` do pai). */
export function rowsForParentEmbed(
  exampleRootForm: FormDef,
  parent: FormField,
  demoParentRow?: EmbeddedDemoRow,
): EmbeddedDemoRow[] | undefined {
  // Preferir a linha do pai (hierarquia org → etapa → grupo); senão, presets do formulário do bloco.
  if (demoParentRow) {
    const cell = demoParentRow[parent.id]
    if (isEmbeddedChildBranch(cell)) return cell.embeddedDemoInstances
  }
  if (exampleRootForm.fields.some((f) => f.id === parent.id)) {
    return getEmbeddedRowsForField(exampleRootForm, parent.id)
  }
  return undefined
}

/** Há linhas de demo estruturada no preset (ou na célula do pai) para este campo embutido. */
export function usesStructuredEmbeddedDemo(
  exampleRootForm: FormDef,
  parent: FormField,
  demoParentRow?: EmbeddedDemoRow,
): boolean {
  const rows = rowsForParentEmbed(exampleRootForm, parent, demoParentRow)
  return Array.isArray(rows) && rows.length > 0
}

export function resolveNestedFieldForDemo(
  exampleRootForm: FormDef,
  parent: FormField,
  nested: FormField,
  instanceIndex: number,
  demoParentRow?: EmbeddedDemoRow,
): FormFieldWithRuntimeDemo {
  if (!usesStructuredEmbeddedDemo(exampleRootForm, parent, demoParentRow)) {
    return { ...nested }
  }
  const rows = rowsForParentEmbed(exampleRootForm, parent, demoParentRow) ?? []
  const row = rows[instanceIndex] ?? {}
  const hasKey = Object.prototype.hasOwnProperty.call(row, nested.id)

  if (!hasKey) {
    if (nested.type === 'embeddedReference') {
      return { ...nested, embeddedDemoInstances: undefined, demoValue: undefined }
    }
    return { ...nested, demoValue: undefined }
  }

  const cell = row[nested.id]

  if (nested.type === 'embeddedReference') {
    if (isEmbeddedChildBranch(cell)) {
      return {
        ...nested,
        embeddedDemoInstances: cell.embeddedDemoInstances,
        demoValue: undefined,
      }
    }
    return { ...nested, embeddedDemoInstances: undefined, demoValue: undefined }
  }

  if (isEmbeddedChildBranch(cell)) {
    return { ...nested, demoValue: undefined }
  }
  return { ...nested, demoValue: cell as FieldDemoValue | undefined }
}

export function embeddedCanvasInstanceCount(
  exampleRootForm: FormDef,
  field: FormField,
  demoParentRow?: EmbeddedDemoRow,
): number {
  const multi = field.type === 'embeddedReference' && field.multiple && fieldSupportsMultiple(field.type)
  if (!multi) return 1
  const rows = rowsForParentEmbed(exampleRootForm, field, demoParentRow)
  if (rows && rows.length > 0) return rows.length
  return 1
}

export function embeddedExportInstanceCount(
  exampleRootForm: FormDef,
  field: FormField,
  demoParentRow?: EmbeddedDemoRow,
): number {
  const multi = field.type === 'embeddedReference' && field.multiple && fieldSupportsMultiple(field.type)
  if (!multi) return 1
  const rows = rowsForParentEmbed(exampleRootForm, field, demoParentRow)
  if (rows && rows.length > 0) return rows.length
  return 2
}
