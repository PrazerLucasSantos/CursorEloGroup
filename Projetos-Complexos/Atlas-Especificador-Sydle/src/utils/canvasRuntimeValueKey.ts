/** Um nível na cadeia de ref. embutida (campo pai + índice da instância). */
export type CanvasEmbAncestor = { embeddedFieldId: string; instanceIndex: number }

/**
 * Chave estável para valor editado no canvas (formulário do bloco + cadeia de embutidos + campo).
 * Usada para sincronizar título do acordeão com o estado da UI, não com o JSON estático.
 */
export function canvasRuntimeFieldKey(
  formDefId: string,
  ancestors: CanvasEmbAncestor[],
  fieldId: string,
): string {
  const chain = ancestors.map((a) => `${a.embeddedFieldId}@${a.instanceIndex}`).join('/')
  return `${formDefId}::${chain}::${fieldId}`
}
