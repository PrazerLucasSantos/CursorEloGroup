import type { EpicClassGroup, FormDef } from '../types'

/** Chave em `memberOrderByGroup` para ordenação das classes «Sem grupo» (igual ao id sintético do accordeon). */
export const EPIC_CLASS_UNGROUPED_ORDER_KEY = '__sem_grupo__'

function mergeSavedOrderWithMembers(
  saved: string[] | undefined,
  memberIds: string[],
  formIdsOrder: string[],
): string[] {
  const memberSet = new Set(memberIds)
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const id of saved ?? []) {
    if (memberSet.has(id) && !seen.has(id)) {
      ordered.push(id)
      seen.add(id)
    }
  }
  const formIndex = new Map(formIdsOrder.map((id, i) => [id, i]))
  const remaining = memberIds.filter((id) => !seen.has(id))
  remaining.sort((a, b) => (formIndex.get(a) ?? 999) - (formIndex.get(b) ?? 999))
  return [...ordered, ...remaining]
}

/** Constrói `memberOrderByGroup` consistente com `assignments` e ordem de `forms`. */
export function reconcileMemberOrderByGroup(
  formList: FormDef[],
  groups: EpicClassGroup[],
  assignments: Record<string, string>,
  partialOrder: Record<string, string[]> | undefined,
): Record<string, string[]> {
  const groupIds = new Set(groups.map((g) => g.id))
  const formIdsOrder = formList.map((f) => f.id)
  const partial = partialOrder ?? {}
  const out: Record<string, string[]> = {}

  for (const g of groups) {
    const memberIds = formList.filter((f) => assignments[f.id] === g.id).map((f) => f.id)
    out[g.id] = mergeSavedOrderWithMembers(partial[g.id], memberIds, formIdsOrder)
  }

  const unassigned = formList
    .filter((f) => {
      const gid = assignments[f.id]
      return gid == null || !groupIds.has(gid)
    })
    .map((f) => f.id)
  out[EPIC_CLASS_UNGROUPED_ORDER_KEY] = mergeSavedOrderWithMembers(
    partial[EPIC_CLASS_UNGROUPED_ORDER_KEY],
    unassigned,
    formIdsOrder,
  )

  return out
}

export function stripFormIdFromAllOrders(
  order: Record<string, string[]> | undefined,
  formId: string,
): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [k, arr] of Object.entries(order ?? {})) {
    out[k] = arr.filter((id) => id !== formId)
  }
  return out
}

/** Lista `FormDef` num bucket (grupo real ou «sem grupo») na ordem persistida. */
export function orderFormsInClassBucket(
  bucketKey: string,
  forms: FormDef[],
  assignments: Record<string, string>,
  groups: EpicClassGroup[],
  memberOrderByGroup: Record<string, string[]>,
): FormDef[] {
  const groupIds = new Set(groups.map((g) => g.id))
  let members: FormDef[]
  if (bucketKey === EPIC_CLASS_UNGROUPED_ORDER_KEY) {
    members = forms.filter((f) => {
      const gid = assignments[f.id]
      return gid == null || !groupIds.has(gid)
    })
  } else {
    members = forms.filter((f) => assignments[f.id] === bucketKey)
  }
  const order = memberOrderByGroup[bucketKey] ?? []
  const byId = new Map(members.map((f) => [f.id, f]))
  const seen = new Set<string>()
  const ordered: FormDef[] = []
  for (const id of order) {
    const fd = byId.get(id)
    if (fd) {
      ordered.push(fd)
      seen.add(id)
    }
  }
  for (const f of members) {
    if (!seen.has(f.id)) ordered.push(f)
  }
  return ordered
}
