import type { FormDef } from '../types'

/** Arestas: formulário → formulário vinculado por algum campo `embeddedReference`. */
function buildEmbeddedEdges(
  epicForms: FormDef[],
  override?: { ownerFormId: string; fieldId: string; newTargetId: string | undefined },
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const form of epicForms) {
    for (const field of form.fields) {
      if (field.type !== 'embeddedReference') continue
      let target = field.linkedFormId
      if (
        override &&
        form.id === override.ownerFormId &&
        field.id === override.fieldId
      ) {
        target = override.newTargetId
      }
      if (!target) continue
      if (!map.has(form.id)) map.set(form.id, new Set())
      map.get(form.id)!.add(target)
    }
  }
  return map
}

function canReach(
  start: string,
  goal: string,
  edges: Map<string, Set<string>>,
): boolean {
  const q: string[] = [start]
  const seen = new Set<string>([start])
  while (q.length) {
    const n = q.shift()!
    const outs = edges.get(n)
    if (!outs) continue
    for (const t of outs) {
      if (t === goal) return true
      if (!seen.has(t)) {
        seen.add(t)
        q.push(t)
      }
    }
  }
  return false
}

/**
 * Se o campo em `ownerFormId` passar a apontar para `newTargetId`, surge ciclo no grafo de embutidos?
 * `newTargetId` vazio remove a aresta desse campo (não cria ciclo por si).
 */
export function wouldLinkCreateEmbeddedCycle(
  epicForms: FormDef[],
  ownerFormId: string,
  fieldId: string,
  newTargetId: string | undefined,
): boolean {
  if (!newTargetId) return false
  if (newTargetId === ownerFormId) return true
  const edges = buildEmbeddedEdges(epicForms, {
    ownerFormId,
    fieldId,
    newTargetId,
  })
  return canReach(newTargetId, ownerFormId, edges)
}

/** Formulários que podem ser escolhidos como `linkedFormId` sem formar ciclo. */
export function getSafeLinkedFormIdsForEmbedded(
  epicForms: FormDef[],
  ownerFormId: string,
  fieldId: string,
): FormDef[] {
  return epicForms.filter(
    (c) =>
      c.id !== ownerFormId &&
      !wouldLinkCreateEmbeddedCycle(epicForms, ownerFormId, fieldId, c.id),
  )
}
