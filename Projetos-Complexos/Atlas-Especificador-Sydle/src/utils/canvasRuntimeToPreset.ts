import type { EmbeddedCellDemo, EmbeddedDemoRow, FieldDemoValue, FormDef, FormField } from '../types'
import { isFormFieldVisibleInForm } from '../types'
import type { CanvasEmbAncestor } from './canvasRuntimeValueKey'
import { canvasRuntimeFieldKey } from './canvasRuntimeValueKey'
import { getActiveExamplePreset } from './formExamplePresets'
import { findFormById } from './linkedForm'

/** Espelha resumo ↔ grupo no cadastro Atlas (mesmos contratos nas duas abas). */
const ATLAS_EMB_LISTA = 'emb_contratos_lista'
const ATLAS_EMB_GRUPOS = 'emb_contratos_grupos'
const ATLAS_RESUMO_FIELD_IDS = [
  'atlas-ct-contrato',
  'atlas-ct-classe',
  'atlas-ct-descricao',
  'atlas-ct-observacoes',
]

export function parseCanvasRuntimeKey(key: string): {
  formDefId: string
  ancestors: CanvasEmbAncestor[]
  fieldId: string
} | null {
  const lastSep = key.lastIndexOf('::')
  if (lastSep < 0) return null
  const fieldId = key.slice(lastSep + 2)
  const head = key.slice(0, lastSep)
  const firstSep = head.indexOf('::')
  if (firstSep < 0) return null
  const formDefId = head.slice(0, firstSep)
  const chain = head.slice(firstSep + 2)
  const ancestors: CanvasEmbAncestor[] = []
  if (chain) {
    for (const seg of chain.split('/')) {
      if (!seg) continue
      const at = seg.lastIndexOf('@')
      if (at < 0) continue
      ancestors.push({
        embeddedFieldId: seg.slice(0, at),
        instanceIndex: parseInt(seg.slice(at + 1), 10) || 0,
      })
    }
  }
  return { formDefId, ancestors, fieldId }
}

function ancestorsPrefixMatch(full: CanvasEmbAncestor[], prefix: CanvasEmbAncestor[]): boolean {
  if (full.length < prefix.length) return false
  for (let i = 0; i < prefix.length; i++) {
    if (
      full[i].embeddedFieldId !== prefix[i].embeddedFieldId ||
      full[i].instanceIndex !== prefix[i].instanceIndex
    ) {
      return false
    }
  }
  return true
}

function parseRuntimeScalar(field: FormField, raw: string): FieldDemoValue | undefined {
  const t = raw.trim()
  if (!t) return undefined
  switch (field.type) {
    case 'boolean': {
      const l = t.toLowerCase()
      if (l === 'sim' || l === 'true' || l === '1') return true
      if (l === 'não' || l === 'nao' || l === 'false' || l === '0') return false
      return undefined
    }
    case 'decimal': {
      const digits = t.replace(/\D/g, '')
      if (!digits) return undefined
      return parseInt(digits, 10) / 100
    }
    case 'number': {
      const n = Number(t.replace(/\./g, '').replace(',', '.'))
      return Number.isFinite(n) ? n : undefined
    }
    default:
      return t
  }
}

function isEmbeddedBranch(cell: EmbeddedCellDemo | undefined): cell is { embeddedDemoInstances: EmbeddedDemoRow[] } {
  return (
    typeof cell === 'object' &&
    cell !== null &&
    'embeddedDemoInstances' in cell &&
    Array.isArray((cell as { embeddedDemoInstances: unknown }).embeddedDemoInstances)
  )
}

function embedRowCountKey(
  hostFormId: string,
  prefixAncestors: CanvasEmbAncestor[],
  embedFieldId: string,
): string {
  return canvasRuntimeFieldKey(hostFormId, prefixAncestors, `__rows__${embedFieldId}`)
}

function collectEmbedIndices(
  hostFormId: string,
  linkedFormId: string,
  embedFieldId: string,
  prefixAncestors: CanvasEmbAncestor[],
  runtimeMap: Record<string, string>,
  existingRows?: EmbeddedDemoRow[],
): number[] {
  const indices = new Set<number>()
  for (let i = 0; i < (existingRows?.length ?? 0); i++) indices.add(i)

  const countRaw = runtimeMap[embedRowCountKey(hostFormId, prefixAncestors, embedFieldId)]
  const countMeta = parseInt(countRaw ?? '', 10)
  if (Number.isFinite(countMeta) && countMeta > 0) {
    for (let i = 0; i < countMeta; i++) indices.add(i)
  }

  for (const key of Object.keys(runtimeMap)) {
    const parsed = parseCanvasRuntimeKey(key)
    if (!parsed || parsed.formDefId !== linkedFormId) continue
    if (parsed.ancestors.length !== prefixAncestors.length + 1) continue
    const leaf = parsed.ancestors[parsed.ancestors.length - 1]
    if (leaf.embeddedFieldId !== embedFieldId) continue
    if (!ancestorsPrefixMatch(parsed.ancestors.slice(0, -1), prefixAncestors)) continue
    indices.add(leaf.instanceIndex)
  }
  return [...indices].sort((a, b) => a - b)
}

function collectEmbeddedRows(
  hostForm: FormDef,
  epicForms: FormDef[],
  embedField: FormField,
  prefixAncestors: CanvasEmbAncestor[],
  runtimeMap: Record<string, string>,
  existingRows?: EmbeddedDemoRow[],
): EmbeddedDemoRow[] {
  const linked = embedField.linkedFormId
    ? findFormById(epicForms, embedField.linkedFormId)
    : undefined
  if (!linked) return existingRows ?? []

  const indices = collectEmbedIndices(
    hostForm.id,
    linked.id,
    embedField.id,
    prefixAncestors,
    runtimeMap,
    existingRows,
  )
  if (indices.length === 0) return []

  return indices.map((rowIndex) => {
    const rowAncestors: CanvasEmbAncestor[] = [
      ...prefixAncestors,
      { embeddedFieldId: embedField.id, instanceIndex: rowIndex },
    ]
    const prev = existingRows?.[rowIndex]
    const row: EmbeddedDemoRow = {}

    for (const nf of linked.fields) {
      if (!isFormFieldVisibleInForm(nf)) continue
      if (nf.type === 'embeddedReference') {
        const prevBranch = prev?.[nf.id]
        const prevRows = isEmbeddedBranch(prevBranch) ? prevBranch.embeddedDemoInstances : undefined
        const sub = collectEmbeddedRows(hostForm, epicForms, nf, rowAncestors, runtimeMap, prevRows)
        if (sub.length > 0) {
          row[nf.id] = { embeddedDemoInstances: sub }
        }
        continue
      }
      const rk = canvasRuntimeFieldKey(linked.id, rowAncestors, nf.id)
      if (Object.prototype.hasOwnProperty.call(runtimeMap, rk)) {
        const v = parseRuntimeScalar(nf, runtimeMap[rk] ?? '')
        if (v !== undefined) row[nf.id] = v
      } else if (prev?.[nf.id] !== undefined && !isEmbeddedBranch(prev[nf.id])) {
        row[nf.id] = prev[nf.id] as FieldDemoValue
      }
    }
    return row
  })
}

function syncAtlasContractEmbeds(
  embedded: Record<string, EmbeddedDemoRow[]> | undefined,
): Record<string, EmbeddedDemoRow[]> | undefined {
  if (!embedded?.[ATLAS_EMB_GRUPOS]) return embedded
  const grupos = embedded[ATLAS_EMB_GRUPOS]
  const lista: EmbeddedDemoRow[] = grupos.map((row) => {
    const r: EmbeddedDemoRow = {}
    for (const id of ATLAS_RESUMO_FIELD_IDS) {
      if (row[id] !== undefined) r[id] = row[id] as EmbeddedCellDemo
    }
    return r
  })
  return { ...embedded, [ATLAS_EMB_LISTA]: lista }
}

/**
 * Aplica o mapa de valores do canvas ao preset activo do formulário (fieldValues + embutidos).
 */
export function flushCanvasRuntimeToActivePreset(
  form: FormDef,
  epicForms: FormDef[],
  runtimeMap: Record<string, string>,
): FormDef {
  const active = getActiveExamplePreset(form)
  if (!active) return form

  const fieldValues: Partial<Record<string, FieldDemoValue>> = { ...(active.fieldValues ?? {}) }
  const embeddedRowsByFieldId: Partial<Record<string, EmbeddedDemoRow[]>> = {
    ...(active.embeddedRowsByFieldId ?? {}),
  }

  for (const field of form.fields) {
    if (!isFormFieldVisibleInForm(field)) continue
    if (field.type === 'embeddedReference') {
      const prev = embeddedRowsByFieldId[field.id]
      const rows = collectEmbeddedRows(form, epicForms, field, [], runtimeMap, prev)
      if (rows.length > 0) embeddedRowsByFieldId[field.id] = rows
      else delete embeddedRowsByFieldId[field.id]
      continue
    }
    const rk = canvasRuntimeFieldKey(form.id, [], field.id)
    if (Object.prototype.hasOwnProperty.call(runtimeMap, rk)) {
      const v = parseRuntimeScalar(field, runtimeMap[rk] ?? '')
      if (v !== undefined) fieldValues[field.id] = v
      else delete fieldValues[field.id]
    }
  }

  const syncedEmb = syncAtlasContractEmbeds(
    Object.keys(embeddedRowsByFieldId).length > 0 ? embeddedRowsByFieldId : undefined,
  )

  const nextPresets = (form.exampleValuePresets ?? []).map((p) =>
    p.id === active.id
      ? {
          ...p,
          fieldValues:
            Object.keys(fieldValues).length > 0
              ? (fieldValues as Record<string, FieldDemoValue>)
              : undefined,
          embeddedRowsByFieldId: syncedEmb,
        }
      : p,
  )

  return { ...form, exampleValuePresets: nextPresets }
}
