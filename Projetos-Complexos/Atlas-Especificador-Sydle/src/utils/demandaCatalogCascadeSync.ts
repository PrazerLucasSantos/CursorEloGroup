import type { FormDef } from '../types'
import { canvasRuntimeFieldKey, type CanvasEmbAncestor } from './canvasRuntimeValueKey'
import {
  parseReferenceSourceValues,
  referenceOptionsFromLinkedForm,
} from './referenceLinkedForm'

const DEMANDA_FORM_IDS = new Set([
  'form-patlasv4-proto-demanda-completa',
  'form-patlasv4-proto-demanda-portal-cliente',
  'form-patlasv4-proto-demanda-portal-parceiro',
])

function prefixFor(formId: string): 'demc' | 'demcli' | 'dempar' | null {
  if (formId.includes('portal-cliente')) return 'demcli'
  if (formId.includes('portal-parceiro')) return 'dempar'
  if (formId.includes('demanda-completa')) return 'demc'
  return null
}

function fid(prefix: string, short: string) {
  return `patlasv4proto-${prefix}-${short}`
}

/**
 * Cascata Demanda · Atendimento: ao mudar Catálogo, limpa Solução/Produtos
 * inválidos e pré-selecciona solução única quando houver só um match.
 * Ao mudar Solução, só ajusta Produtos (nunca reescreve a própria Solução).
 */
export function applyDemandaCatalogCascadeSync(opts: {
  form: FormDef
  canvasFormDefId: string
  canvasAncestors: CanvasEmbAncestor[]
  changedFieldId: string
  changedValue: string
  setValue: (k: string, v: string) => void
  getValue: (k: string) => string | undefined
  epicForms: FormDef[]
}): void {
  const { form, canvasFormDefId, canvasAncestors, changedFieldId, setValue, getValue, epicForms } =
    opts
  if (!DEMANDA_FORM_IDS.has(form.id)) return
  if (canvasFormDefId !== form.id) return

  const prefix = prefixFor(form.id)
  if (!prefix) return

  const catalogosId = fid(prefix, 'catalogos')
  const solucaoId = fid(prefix, 'solucao-catalogo')
  const itensId = fid(prefix, 'itens')

  if (changedFieldId !== catalogosId && changedFieldId !== solucaoId) return

  const k = (fieldId: string) => canvasRuntimeFieldKey(canvasFormDefId, canvasAncestors, fieldId)

  // Sempre preferir o valor que acabou de mudar — getValue pode estar stale
  // ou ser "" gravado no mount ("" ?? changedValue === "", o que limpava a solução).
  const catalogs = parseReferenceSourceValues(
    changedFieldId === catalogosId ? opts.changedValue : (getValue(k(catalogosId)) ?? ''),
  )

  const solOpts = referenceOptionsFromLinkedForm(
    epicForms,
    'form-patlasv4-proto-cat-solucao',
    undefined,
    {
      sourceValues: catalogs,
      matchFieldIds: ['form-patlasv4-proto-cat-solucao-catalogo'],
    },
  )

  if (changedFieldId === catalogosId) {
    if (!catalogs.length) {
      setValue(k(solucaoId), '')
      setValue(k(itensId), '')
      return
    }

    const atualSol = (getValue(k(solucaoId)) ?? '').trim()
    if (solOpts.length === 1) {
      if (atualSol !== solOpts[0]) setValue(k(solucaoId), solOpts[0])
    } else if (atualSol && !solOpts.some((s) => s === atualSol)) {
      setValue(k(solucaoId), '')
    }
  }

  // Mudança na solução: nunca limpar/reescrever a solução — só filtrar produtos.
  const solForProducts =
    changedFieldId === solucaoId
      ? parseReferenceSourceValues(opts.changedValue)
      : parseReferenceSourceValues(getValue(k(solucaoId)) ?? '')

  if (!catalogs.length) {
    // Sem catálogo não há base para filtrar produtos; não tocar na solução.
    return
  }

  const prodOpts = referenceOptionsFromLinkedForm(
    epicForms,
    'form-patlasv4-proto-cat-produto',
    undefined,
    {
      sourceValues: catalogs,
      matchFieldIds: ['form-patlasv4-proto-cat-produto-catalogo'],
    },
  ).filter((p) => {
    if (!solForProducts.length) return true
    const prodForm = epicForms.find((f) => f.id === 'form-patlasv4-proto-cat-produto')
    if (!prodForm) return true
    return (prodForm.exampleValuePresets ?? []).some((pr) => {
      const fv = pr.fieldValues ?? {}
      const nome = fv['form-patlasv4-proto-cat-produto-identificador']
      const sol = fv['form-patlasv4-proto-cat-produto-solucao']
      if (typeof nome !== 'string' || nome !== p) return false
      if (typeof sol !== 'string') return true
      const solNorm = sol.trim().toLowerCase()
      return solForProducts.some((s) => {
        const sn = s.trim().toLowerCase()
        return sn === solNorm
      })
    })
  })

  const atualItens = parseReferenceSourceValues(getValue(k(itensId)) ?? '')
  const kept = atualItens.filter((i) => prodOpts.includes(i))
  if (kept.length !== atualItens.length) {
    setValue(k(itensId), kept.join(' / '))
  }
}
