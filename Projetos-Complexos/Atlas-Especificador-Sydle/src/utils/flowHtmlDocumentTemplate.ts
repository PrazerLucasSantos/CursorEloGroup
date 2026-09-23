import type { FormDef } from '../types'
import { demoValueAsSingleLineSummary } from './fieldDemoValue'
import { getActiveExamplePreset } from './formExamplePresets'

const PLACEHOLDER_RE = /\{\{([a-zA-Z0-9_-]+)\}\}/g

function formatDemoForDocument(form: FormDef, fieldId: string, raw: unknown): string {
  const field = form.fields.find((f) => f.id === fieldId)
  if (!field) return raw == null || raw === '' ? '—' : String(raw)
  const summary = demoValueAsSingleLineSummary(field, raw)
  if (summary.trim()) return summary
  if (raw == null || raw === '') return '—'
  if (typeof raw === 'boolean') return raw ? 'Sim' : 'Não'
  return String(raw)
}

/**
 * Substitui `{{id_campo}}` pelos valores do preset activo do formulário vinculado.
 */
export function resolveFlowHtmlDocumentTemplate(html: string, linkedForm: FormDef | undefined): string {
  if (!linkedForm || !html.includes('{{')) return html

  const preset = getActiveExamplePreset(linkedForm)
  const values = preset?.fieldValues ?? {}

  return html.replace(PLACEHOLDER_RE, (_match, fieldId: string) => {
    if (!(fieldId in values)) {
      const field = linkedForm.fields.find((f) => f.id === fieldId)
      return field ? `[${field.label}]` : `{{${fieldId}}}`
    }
    return formatDemoForDocument(linkedForm, fieldId, values[fieldId])
  })
}
