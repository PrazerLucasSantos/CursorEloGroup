import type { FormField } from '../types'

export function patchFieldById(
  fields: FormField[],
  id: string,
  patch: Partial<FormField>,
): FormField[] {
  return fields.map((f) => (f.id === id ? { ...f, ...patch } : f))
}

export function removeFieldById(fields: FormField[], id: string): FormField[] {
  return fields.filter((f) => f.id !== id)
}
