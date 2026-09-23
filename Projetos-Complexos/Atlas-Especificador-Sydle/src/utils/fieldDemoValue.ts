import type { FieldDemoValue, FileDemoItem, FormField } from '../types'
import { fieldSupportsMultiple } from '../types'
import { resolveDemoSelectOptions } from './demoSelectOptions'

/** Opções válidas para referência / opções em texto (valor inicial de demonstração).
 * Valores já gravados (live/portal) são preservados mesmo fora do catálogo de opções. */
export function normalizeReferenceSelection(
  demo: FieldDemoValue | undefined,
  _options: string[],
  multiple: boolean,
): string[] {
  if (demo === undefined || demo === null) return []
  const asList = (): string[] => {
    if (Array.isArray(demo)) {
      return demo
        .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
        .map((s) => s.trim())
    }
    if (typeof demo === 'string' && demo.trim()) return [demo.trim()]
    return []
  }
  const selected = asList()
  if (selected.length === 0) return []

  // Se há catálogo e o valor está nele, ok; se não está, ainda assim exibe (dado vivo do portal).
  if (multiple) return selected
  return selected.slice(0, 1)
}

/** Dígitos brutos para DecimalField (últimos 2 = centavos). */
export function decimalDemoToRaw(demo: FieldDemoValue | undefined): string {
  if (demo === undefined || demo === null) return ''
  if (typeof demo === 'number' && Number.isFinite(demo)) {
    return String(Math.round(Math.abs(demo) * 100))
  }
  if (typeof demo === 'string') {
    const trimmed = demo.trim()
    if (!trimmed) return ''
    const digitsOnly = trimmed.replace(/\D/g, '')
    if (digitsOnly === trimmed.replace(/[^\d]/g, '') && /^\d+$/.test(digitsOnly)) {
      return digitsOnly
    }
    const normalized = trimmed.replace(/\./g, '').replace(',', '.')
    const n = parseFloat(normalized)
    if (Number.isFinite(n)) return String(Math.round(Math.abs(n) * 100))
    return digitsOnly
  }
  return ''
}

export function formatDecimalDisplay(rawDigits: string, currency: boolean): string {
  const digits = rawDigits.replace(/\D/g, '')
  if (!digits) return ''
  const cents = digits.padStart(3, '0')
  const intPart = cents.slice(0, -2).replace(/^0+(?=\d)/, '')
  const decPart = cents.slice(-2)
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const formatted = `${withSep},${decPart}`
  return currency ? `R$ ${formatted}` : formatted
}

export function stringFromDemo(demo: FieldDemoValue | undefined): string {
  if (demo === undefined || demo === null) return ''
  if (typeof demo === 'string') return demo
  if (typeof demo === 'number' && Number.isFinite(demo)) return String(demo)
  return ''
}

export function numberInputFromDemo(demo: FieldDemoValue | undefined): string {
  if (demo === undefined || demo === null) return ''
  if (typeof demo === 'number' && Number.isFinite(demo)) return String(demo)
  if (typeof demo === 'string') return demo.trim()
  return ''
}

export function booleanFromDemo(demo: FieldDemoValue | undefined): boolean {
  if (demo === true || demo === 1) return true
  if (demo === false || demo === 0) return false
  if (typeof demo === 'string') {
    const s = demo.trim().toLowerCase()
    return s === 'true' || s === '1' || s === 'sim'
  }
  return false
}

/** Valor para &lt;input type="date" /&gt; (YYYY-MM-DD). */
export function dateIsoFromDemo(demo: FieldDemoValue | undefined): string {
  const s = stringFromDemo(demo).trim()
  if (!s) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const d = m[1].padStart(2, '0')
    const mo = m[2].padStart(2, '0')
    const y = m[3]
    return `${y}-${mo}-${d}`
  }
  return ''
}

/** Data no export HTML (máscara dd/mm/aaaa). */
export function dateDisplayForExport(demo: FieldDemoValue | undefined): string {
  const iso = dateIsoFromDemo(demo)
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function geopointFromDemo(demo: FieldDemoValue | undefined): { lat: string; lng: string } {
  if (demo && typeof demo === 'object' && !Array.isArray(demo) && 'lat' in demo && 'lng' in demo) {
    const o = demo as { lat?: unknown; lng?: unknown }
    return { lat: String(o.lat ?? ''), lng: String(o.lng ?? '') }
  }
  return { lat: '', lng: '' }
}

/** Legado: uma string (ex. «relatorio.pdf») → item nome + extensão. */
function parseLegacyFileString(s: string): FileDemoItem {
  const t = s.trim()
  const lastDot = t.lastIndexOf('.')
  if (lastDot > 0 && lastDot < t.length - 1) {
    const ext = t.slice(lastDot + 1).trim()
    if (/^[a-zA-Z0-9]{1,16}$/.test(ext)) {
      return { name: t.slice(0, lastDot).trim(), kind: ext.toLowerCase() }
    }
  }
  return { name: t, kind: '' }
}

/**
 * Anexos simulados do campo `file`.
 * - `string`: formato legado (texto livre ou «nome.ext»).
 * - `FileDemoItem[]`: lista (não confundir com `string[]` de referência multi).
 */
export function filesFromDemo(demo: FieldDemoValue | undefined): FileDemoItem[] {
  if (demo === undefined || demo === null) return []
  if (typeof demo === 'string') {
    const t = demo.trim()
    if (!t) return []
    return [parseLegacyFileString(t)]
  }
  if (Array.isArray(demo)) {
    if (demo.length === 0) return []
    if (typeof demo[0] === 'string') return []
    return (demo as FileDemoItem[]).map((x) => ({
      name: typeof x?.name === 'string' ? x.name : '',
      kind: typeof x?.kind === 'string' ? x.kind : '',
    }))
  }
  return []
}

const FILE_SIZE_POOL = ['156 KB', '840 KB', '1.2 MB', '2.6 MB', '4.1 MB']

/** Tamanho fictício estável para linha de demo (varia com nome+tipo). */
export function fakeFileSizeLabel(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % FILE_SIZE_POOL.length
  return FILE_SIZE_POOL[h]
}

/** Uma linha como no protótipo: nome.ext (tamanho). */
export function formatFileAttachmentDisplayLine(item: FileDemoItem): string {
  const name = item.name.trim()
  const rawKind = item.kind.trim().replace(/^\./, '')
  const kind = rawKind.toLowerCase()
  const seed = `${name}|${kind}`
  const size = fakeFileSizeLabel(seed)
  let base = name
  if (kind && !name.toLowerCase().endsWith(`.${kind}`)) {
    base = `${name}.${kind}`
  }
  return `${base} (${size})`.trim()
}

export function fileDemoLabel(demo: FieldDemoValue | undefined): string {
  const files = filesFromDemo(demo)
  if (files.length === 0) return ''
  return files
    .map((f) => {
      const k = f.kind.trim().replace(/^\./, '')
      return k ? `${f.name.trim()}.${k}` : f.name.trim()
    })
    .filter(Boolean)
    .join(', ')
}

/** JSON seguro para atributo HTML (referência / textOptions no export). */
export function demoSelectedJsonForExport(
  demo: FieldDemoValue | undefined,
  options: string[],
  multiple: boolean,
): string | null {
  const sel = normalizeReferenceSelection(demo, options, multiple)
  return sel.length > 0 ? JSON.stringify(sel) : null
}

/** Data a partir de valor ISO do input (YYYY-MM-DD) → dd/mm/aaaa. */
export function dateDisplayFromIso(iso: string): string {
  const s = iso.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return ''
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

/** Uma linha de texto para título do acordeão (identidade) a partir do valor de demo já resolvido. */
export function demoValueAsSingleLineSummary(field: FormField, demo: FieldDemoValue | undefined): string {
  switch (field.type) {
    case 'text':
      return stringFromDemo(demo).trim()
    case 'number':
      return numberInputFromDemo(demo).trim()
    case 'decimal': {
      const raw = decimalDemoToRaw(demo)
      return formatDecimalDisplay(raw, !!field.currency).trim()
    }
    case 'boolean':
      return booleanFromDemo(demo) ? 'Sim' : 'Não'
    case 'date':
      return dateDisplayForExport(demo).trim()
    case 'reference': {
      const opts = resolveDemoSelectOptions({
        options: field.options,
        linkedFormId: field.linkedFormId,
        label: field.label,
      })
      const multi = !!field.multiple && fieldSupportsMultiple(field.type)
      return normalizeReferenceSelection(demo, opts, multi).join(' / ')
    }
    case 'textOptions': {
      const opts = resolveDemoSelectOptions({
        options: field.options,
        label: field.label,
      })
      const multi = !!field.multiple && fieldSupportsMultiple(field.type)
      return normalizeReferenceSelection(demo, opts, multi).join(' / ')
    }
    case 'file':
      return fileDemoLabel(demo).trim()
    case 'geopoint': {
      const { lat, lng } = geopointFromDemo(demo)
      return [lat, lng].filter(Boolean).join(', ').trim()
    }
    case 'html':
      return ''
    case 'alert':
      return (field.alertTitle ?? field.label).trim()
    case 'embeddedReference':
      return ''
    default:
      return ''
  }
}
