import type { FormDef } from '../types'
import { getEmbeddedRowsForField } from './formExamplePresets'

/** Formulário raiz com tabelas de domínios (solução, métrica, etc.). */
export const ATLAS_CADASTRO_MAESTROS_FORM_ID = 'form-atlas-cadastro-maestros'

export function identityFieldIdForForm(form: FormDef): string | undefined {
  return form.fields.find((f) => f.relevance === 'identity')?.id
}

export function identityFieldForForm(form: FormDef) {
  const identityId = identityFieldIdForForm(form)
  // Preferir rótulo Nome* (ex.: «Nome do produto») — em Produto o campo Catálogo
  // também está marcado como identity (contexto embutido), mas não é o nome da linha.
  return (
    form.fields.find((f) => f.relevance === 'identity' && /^nome\b/i.test(f.label || '')) ||
    form.fields.find((f) => /identificador$/i.test(f.id) && /^nome\b/i.test(f.label || '')) ||
    form.fields.find((f) => /identificador$/i.test(f.id)) ||
    form.fields.find((f) => f.id === identityId && !/catalogo$/i.test(f.id)) ||
    form.fields.find((f) => f.relevance === 'identity' && !/catalogo|parceria|solucao$/i.test(f.id)) ||
    form.fields.find((f) => f.relevance === 'identity')
  )
}

export function hostEmbedFieldForLinkedForm(hostForm: FormDef, linkedFormId: string): string | undefined {
  const field = hostForm.fields.find(
    (f) => f.type === 'embeddedReference' && f.linkedFormId === linkedFormId,
  )
  return field?.id
}

function valuesOverlap(a: string, b: string): boolean {
  const x = a.trim().toLowerCase()
  const y = b.trim().toLowerCase()
  if (!x || !y) return false
  return x === y || x.includes(y) || y.includes(x)
}

function sourceMatchesRow(
  row: Partial<Record<string, unknown>>,
  sourceValues: string[],
  matchFieldIds: string[],
): boolean {
  if (!sourceValues.length) return true
  return matchFieldIds.some((mid) => {
    const raw = row[mid]
    if (typeof raw !== 'string' || !raw.trim()) return false
    return sourceValues.some((src) => valuesOverlap(raw, src))
  })
}

/** Parte valores de referência (simples ou multi com " / "). */
export function parseReferenceSourceValues(raw: string | undefined | null): string[] {
  if (!raw || !String(raw).trim()) return []
  return String(raw)
    .split(/\s*\/\s*|\n|;/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Opções do campo referência = valores do campo identidade.
 * Ordem: cadastro mestre (se existir) → presets do formulário vinculado.
 * Com `filter`, mantém só linhas cujo vínculo bate com os valores fonte (ex.: Catálogo → Produto).
 */
export function referenceOptionsFromLinkedForm(
  epicForms: FormDef[],
  linkedFormId: string | undefined,
  hostFormId: string = ATLAS_CADASTRO_MAESTROS_FORM_ID,
  filter?: { sourceValues: string[]; matchFieldIds: string[] },
): string[] {
  if (!linkedFormId) return []

  const lineForm = epicForms.find((f) => f.id === linkedFormId)
  if (!lineForm) return []

  const identityField = identityFieldForForm(lineForm)
  if (!identityField) return []

  const sourceValues = (filter?.sourceValues ?? []).map((s) => s.trim()).filter(Boolean)
  const matchFieldIds = filter?.matchFieldIds ?? []
  const useFilter = sourceValues.length > 0 && matchFieldIds.length > 0

  const out: string[] = []

  const hostForm = epicForms.find((f) => f.id === hostFormId)
  if (hostForm) {
    const embedId = hostEmbedFieldForLinkedForm(hostForm, linkedFormId)
    if (embedId) {
      const rows = getEmbeddedRowsForField(hostForm, embedId) ?? []
      for (const r of rows) {
        if (useFilter && !sourceMatchesRow(r, sourceValues, matchFieldIds)) continue
        const v = r[identityField.id]
        if (typeof v === 'string' && v.trim()) out.push(v.trim())
      }
    }
  }

  for (const preset of lineForm.exampleValuePresets ?? []) {
    const fv = preset.fieldValues ?? {}
    if (useFilter && !sourceMatchesRow(fv, sourceValues, matchFieldIds)) continue
    const v = fv[identityField.id]
    if (typeof v === 'string' && v.trim()) out.push(v.trim())
  }

  // Direção inversa: Catálogo → Solução (catálogo.solucao = identidade da solução)
  if (useFilter && linkedFormId === 'form-patlasv4-proto-cat-solucao') {
    const catForm = epicForms.find((f) => f.id === 'form-patlasv4-proto-cat-catalogo')
    const catIdField = catForm ? identityFieldForForm(catForm) : undefined
    const catSolField = catForm?.fields.find((f) => /solucao$/i.test(f.id) || /^solução$/i.test(f.label || ''))
    if (catForm && catIdField && catSolField) {
      for (const preset of catForm.exampleValuePresets ?? []) {
        const fv = preset.fieldValues ?? {}
        const catName = fv[catIdField.id]
        if (typeof catName !== 'string' || !sourceValues.some((s) => valuesOverlap(catName, s))) continue
        const solName = fv[catSolField.id]
        if (typeof solName === 'string' && solName.trim()) out.push(solName.trim())
      }
    }
  }

  return [...new Set(out)]
}
