/**
 * Tags/flags para campos identity/destaque em leitura (Workspace + FormCanvas).
 * Demanda F3: Status, Tipo, SLA viram badges coloridos.
 */
import type { FormDef, FormField } from '../types'
import { isFormFieldVisibleInForm } from '../types'
import { orderRootFieldsForDisplay } from './formSections'
import { badgeClassSla, badgeClassStatusDemanda, type StatusDemanda } from '../portalCliente/portalClienteDemandaData'

export type FormHighlightTagTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'consumo' | 'suporte'

export type FormHighlightTag = {
  id: string
  label: string
  value: string
  tone: FormHighlightTagTone
}

function isDemandaStatusField(field: FormField): boolean {
  const id = field.id.toLowerCase()
  const label = field.label.toLowerCase()
  return (
    (/(^|-)status$/.test(id) || /^status\b/.test(label)) &&
    !/sla/.test(id) &&
    !/sla/.test(label) &&
    !/assinatura|homolog|raer|sn|servicenow/.test(id + label)
  )
}

function isDemandaTipoField(field: FormField): boolean {
  const id = field.id.toLowerCase()
  const label = field.label.toLowerCase()
  return /(^|-)tipo$/.test(id) || /^tipo$/.test(label.trim())
}

function isSlaField(field: FormField): boolean {
  const id = field.id.toLowerCase()
  const label = field.label.toLowerCase()
  return /sla/.test(id) || /sla/.test(label)
}

export function resolveFormHighlightTagTone(field: FormField, value: string): FormHighlightTagTone | null {
  const v = value.trim()
  if (!v || v === '—' || v === '-') return null
  const vLow = v.toLowerCase()

  if (field.type === 'boolean') {
    if (vLow === 'sim' || vLow === 'true') return 'success'
    if (vLow === 'não' || vLow === 'nao' || vLow === 'false') return 'neutral'
    return null
  }

  if (isDemandaTipoField(field)) {
    if (/consumo/i.test(v)) return 'consumo'
    if (/suporte/i.test(v)) return 'suporte'
    return 'info'
  }

  if (isSlaField(field)) {
    const cls = badgeClassSla(v)
    if (cls.includes('aprovado')) return 'success'
    if (cls.includes('recusado')) return 'danger'
    if (cls.includes('ajuste')) return 'warning'
    if (cls.includes('em-analise')) return 'info'
    return 'neutral'
  }

  if (isDemandaStatusField(field) || field.type === 'textOptions' || field.type === 'text') {
    const label = field.label.toLowerCase()
    const looksLikeStatus =
      isDemandaStatusField(field) ||
      /status|situa|ativo|decis|conclus|fila/i.test(label) ||
      /status|situa|ativo|decis|conclus|fila/i.test(field.id)

    // Selo Não é Não — tags coloridas por status do processo
    if (field.id === 'nen-ad-status' || (looksLikeStatus && /nen-ad-status|nen-sol-status|nen-est-status|nen-ren-status/.test(field.id))) {
      if (/deferido|provido|vigente/i.test(vLow)) return 'success'
      if (/indefer|revog|cancel|finalizado|n[aã]o respondida/i.test(vLow)) return 'danger'
      if (/dilig[eê]ncia(?!\s*respondida)|necessita|n[aã]o conforme/i.test(vLow)) return 'warning'
      if (/respondida/i.test(vLow)) return 'info'
      if (/aguardando|fila/i.test(vLow)) return 'info'
      if (/an[aá]lise|pronto|recurso/i.test(vLow)) return 'warning'
      if (/rascunho|protocolado/i.test(vLow)) return 'neutral'
      return 'info'
    }

    // Prazo restante — tag colorida
    if (field.id === 'nen-ad-prazo' || /prazo/i.test(label)) {
      if (/esgot|venc|0\s*dia/i.test(vLow) || /—|-/.test(v)) return 'danger'
      if (/suspend|dilig/i.test(vLow)) return 'warning'
      if (/\d+/.test(v)) return 'info'
      return 'neutral'
    }

    if (looksLikeStatus || isDemandaStatusField(field)) {
      // Mapear StatusDemanda conhecido
      const demCls = badgeClassStatusDemanda(v as StatusDemanda)
      if (demCls.includes('aprovado')) return 'success'
      if (demCls.includes('recusado')) return 'danger'
      if (demCls.includes('ajuste')) return 'warning'
      if (demCls.includes('em-analise')) return 'info'
      if (demCls.includes('pendente')) return 'warning'
      if (demCls.includes('neutral')) return 'neutral'

      if (/^(ativo|deferido|conforme|provido|vigente|ok|aprovado|efetivado)/i.test(vLow) ||
          vLow.includes('deferido') ||
          vLow.includes('conforme') ||
          vLow.includes('vigente') ||
          vLow.includes('entregue'))
        return 'success'
      if (/indefer|revog|cancel|não conforme|nao conforme|reprov|recus/i.test(vLow)) return 'danger'
      if (/dilig|an[aá]lise|recurso|pend|necessita|aguard|dilata/i.test(vLow)) return 'warning'
      if (looksLikeStatus) return 'info'
    }
  }

  return null
}

export function formatFormHighlightTagText(label: string, value: string): string {
  const v = value.trim()
  if (/^ativo$/i.test(label) && /^(sim|true)$/i.test(v)) return 'Ativo'
  if (/^ativo$/i.test(label) && /^(n[aã]o|false)$/i.test(v)) return 'Inativo'
  if (/^(sim|true)$/i.test(v) && /ativo/i.test(label)) return 'Ativo'
  if (/^(n[aã]o|false)$/i.test(v) && /ativo/i.test(label)) return 'Inativo'
  if (/sla/i.test(label) && !/^sla\s*·/i.test(v)) return `SLA · ${v}`
  return v
}

/** Parte highlight rows em tags (status/tipo/SLA) vs texto restante. */
export function splitHighlightRowsIntoTags(
  form: FormDef,
  highlightRows: { id: string; label: string; value: string }[],
): { tags: FormHighlightTag[]; textRows: { id: string; label: string; value: string }[] } {
  const tags: FormHighlightTag[] = []
  for (const field of orderRootFieldsForDisplay(form)) {
    if (field.relevance !== 'highlight' || !isFormFieldVisibleInForm(field)) continue
    const row = highlightRows.find((r) => r.id === field.id)
    if (!row) continue
    const tone = resolveFormHighlightTagTone(field, row.value)
    if (!tone) continue
    tags.push({
      id: field.id,
      label: field.label.trim() || 'Status',
      value: row.value,
      tone,
    })
  }
  const textRows = highlightRows.filter((r) => !tags.some((t) => t.id === r.id))
  return { tags, textRows }
}
