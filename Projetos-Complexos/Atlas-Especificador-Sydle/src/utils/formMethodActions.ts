import type { FormDef } from '../types'
import {
  downloadAtlasCobrancaReportPdf,
  isAtlasCobrancaReportForm,
  isAtlasCobrancaReportMethod,
} from './atlasCobrancaReportPdf'
import { runAtlasCatProdutoMethod } from './atlasCatProdutoMethods'
import { runAtlasCatalogIntegrationMethod } from './atlasCatalogMethods'
import { runAtlasContratoWorkflowMethod } from './atlasContratoMethods'
import { runAtlasVisoesIntegracaoMethod } from './atlasVisoesIntegracaoMethods'
import { runAtlasPvVisaoMethod } from './atlasPvMethods'
import { runAtlasNfUsuariosMethod } from './atlasNfUsuariosMethods'
import { runAtlasPortalCotacaoMethod } from './atlasPortalCotacaoMethods'
import { runAtlasPropostaAssinaturaMethod, runAtlasPropostaMethod } from './atlasPropostaMethods'
import { runAtlasFase1Method } from './atlasFase1Methods'
import { runAtlasProtoOrgMethod } from './atlasProtoOrgMethods'
import {
  isNenAnaliseDecisaoMethod,
  runNenAnaliseDecisaoMethod,
  type NenAnaliseMethodResult,
} from './nenAnaliseDecisaoMethods'

export type BuiltInFormMethodResult = {
  handled: boolean
  openInputForm?: boolean
  fieldPatches?: Record<string, string>
  preferSectionId?: string
  inputFormId?: string
  inputFormTitle?: string
  seedFieldValues?: Record<string, string>
  mirrorToFormId?: string
  preferModalSectionId?: string
  toast?: string
}

const HANDLED: BuiltInFormMethodResult = { handled: true }
const NOT_HANDLED: BuiltInFormMethodResult = { handled: false }

/**
 * Acções embutidas para métodos de formulário (além de navegação de workspace).
 */
export function tryRunBuiltInFormMethod(
  form: FormDef,
  methodId: string,
  getValue: ((k: string) => string | undefined) | undefined,
  epicForms: FormDef[] = [],
  setValue?: (key: string, value: string) => void,
): BuiltInFormMethodResult {
  if (!getValue) return NOT_HANDLED

  if (isNenAnaliseDecisaoMethod(form.id, methodId)) {
    const r: NenAnaliseMethodResult = runNenAnaliseDecisaoMethod(form, methodId, getValue, setValue)
    return {
      handled: r.handled,
      openInputForm: r.openInputForm,
      fieldPatches: r.fieldPatches,
      preferSectionId: r.preferSectionId,
      inputFormId: r.inputFormId,
      inputFormTitle: r.inputFormTitle,
      seedFieldValues: r.seedFieldValues,
      mirrorToFormId: r.mirrorToFormId,
      preferModalSectionId: r.preferModalSectionId,
    }
  }

  if (isAtlasCobrancaReportMethod(form.id, methodId) || (isAtlasCobrancaReportForm(form.id) && methodId === 'atlas-meth-gerar-relatorio')) {
    downloadAtlasCobrancaReportPdf(form, getValue, epicForms)
    return HANDLED
  }
  if (runAtlasCatalogIntegrationMethod(form, methodId, getValue)) {
    return HANDLED
  }
  if (runAtlasCatProdutoMethod(form, methodId, getValue, setValue)) {
    return HANDLED
  }
  if (runAtlasPortalCotacaoMethod(form, methodId, getValue)) {
    return HANDLED
  }
  if (runAtlasPropostaMethod(form, methodId, getValue)) {
    return HANDLED
  }
  if (runAtlasPropostaAssinaturaMethod(form, methodId, getValue)) {
    return HANDLED
  }
  if (runAtlasContratoWorkflowMethod(form, methodId, getValue)) {
    return HANDLED
  }
  if (runAtlasVisoesIntegracaoMethod(form, methodId, getValue)) {
    return HANDLED
  }
  if (runAtlasPvVisaoMethod(form, methodId, getValue, epicForms)) {
    return HANDLED
  }
  if (runAtlasNfUsuariosMethod(form, methodId, getValue)) {
    return HANDLED
  }
  if (runAtlasFase1Method(form, methodId, getValue)) {
    return HANDLED
  }
  if (runAtlasProtoOrgMethod(form, methodId, getValue, setValue)) {
    return HANDLED
  }
  return NOT_HANDLED
}
