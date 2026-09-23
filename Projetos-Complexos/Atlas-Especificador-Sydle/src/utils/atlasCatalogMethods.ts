import type { FormDef } from '../types'

export const ATLAS_CATALOG_VIGENTES_FORM_ID = 'form-atlas-catalogo-vigentes'
export const ATLAS_METH_IMPORTAR_INTEGRACAO = 'atlas-meth-importar-integracao'
export const ATLAS_METH_ATUALIZAR_INTEGRACAO = 'atlas-meth-atualizar-integracao'

export function isAtlasCatalogVigentesForm(formId: string): boolean {
  return formId === ATLAS_CATALOG_VIGENTES_FORM_ID
}

export function isAtlasCatalogIntegrationMethod(formId: string, methodId: string): boolean {
  if (!isAtlasCatalogVigentesForm(formId)) return false
  return (
    methodId === ATLAS_METH_IMPORTAR_INTEGRACAO || methodId === ATLAS_METH_ATUALIZAR_INTEGRACAO
  )
}

function readBool(getValue: (k: string) => string | undefined, key: string, defaultWhenMissing = true): boolean {
  const v = getValue(key)
  if (v === undefined || v === '') return defaultWhenMissing
  return v === 'true' || v === '1' || v === 'sim'
}

/**
 * Simula importação/atualização Siag + Protheus no protótipo Espec.
 */
export function runAtlasCatalogIntegrationMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
): boolean {
  if (!isAtlasCatalogIntegrationMethod(form.id, methodId)) return false

  const siag = readBool(getValue, 'atlas-int-siag-ativo')
  const protheus = readBool(getValue, 'atlas-int-protheus-ativo')
  const origem = getValue('atlas-cat-origem-dados') ?? '—'
  const nomeCat = getValue('atlas-cat-nome') ?? 'Catálogo'

  const fontes = [
    siag ? 'Siag' : null,
    protheus ? 'Protheus / Info center' : null,
  ].filter(Boolean)

  if (fontes.length === 0) {
    window.alert(
      'Integração não configurada.\n\nAtive «Integração Siag» e/ou «Integração Protheus» na parametrização do cadastro (aba Integração) e salve antes de importar.',
    )
    return true
  }

  const agora = new Date().toLocaleString('pt-BR')
  const fontesTxt = fontes.join(' + ')

  if (methodId === ATLAS_METH_IMPORTAR_INTEGRACAO) {
    window.alert(
      `Importar via integração — ${nomeCat}\n\n` +
        `Fontes: ${fontesTxt}\n` +
        `Origem configurada: ${origem}\n` +
        `Horário: ${agora}\n\n` +
        'Ação (produção): buscar novos códigos Siag/Protheus, criar linhas no cadastro mestre com status «Rascunho» e exibir=false até homologação.\n\n' +
        'No Espec, os presets de exemplo já trazem a grade vigente espelhando o cadastro.',
    )
    return true
  }

  window.alert(
    `Atualizar produtos da integração — ${nomeCat}\n\n` +
      `Fontes: ${fontesTxt}\n` +
      `Horário: ${agora}\n\n` +
      'Ação (produção): reconciliar descrição, valor unitário, FC e códigos dos produtos já cadastrados; atualizar «Última sincronização» e status da sync.\n\n' +
      'Produtos com status ≠ Vigente ou «Exibir na tela vigentes» = não permanecem fora da grade de consulta.',
  )
  return true
}
