import type { FormDef } from '../types'
import { canvasRuntimeFieldKey, type CanvasEmbAncestor } from './canvasRuntimeValueKey'

export const FORM_CAT_PRODUTO = 'form-patlasv4-proto-cat-produto'

const F = {
  catalogo: `${FORM_CAT_PRODUTO}-catalogo`,
  parceria: `${FORM_CAT_PRODUTO}-parceria`,
  solucao: `${FORM_CAT_PRODUTO}-solucao`,
  versao: `${FORM_CAT_PRODUTO}-versao-catalogo`,
  metrica: `${FORM_CAT_PRODUTO}-metrica`,
  complexidade: `${FORM_CAT_PRODUTO}-complexidade`,
  coeficiente: `${FORM_CAT_PRODUTO}-coeficiente-complexidade`,
  tipoOferta: `${FORM_CAT_PRODUTO}-tipo-oferta`,
  moedaUniversal: `${FORM_CAT_PRODUTO}-moeda-universal`,
  consumoOs: `${FORM_CAT_PRODUTO}-consumo-os`,
  cfgCx: `${FORM_CAT_PRODUTO}-cfg-usa-complexidade`,
  cfgPeso: `${FORM_CAT_PRODUTO}-cfg-usa-peso`,
  cfgQtde: `${FORM_CAT_PRODUTO}-cfg-exige-qtde`,
  vertical: `${FORM_CAT_PRODUTO}-vertical`,
} as const

/** Dados demo herdáveis a partir do Catálogo selecionado (protótipo). */
const CATALOGO_HERANCA: Record<
  string,
  {
    parceria: string
    solucao: string
    versao: string
    usaComplexidade: boolean
    usaPeso: boolean
    exigeQtde: boolean
    metricas: string[]
    vertical: string
    tipoOfertaPadrao?: 'Universal' | 'Individualizado'
    coeficientes: Record<string, number>
  }
> = {
  'Catálogo MTI Simplifica': {
    parceria: 'MTI SIMPLIFICA',
    solucao: 'MTI Simplifica',
    versao: '9.4',
    vertical: 'Automação e Processos',
    usaComplexidade: true,
    usaPeso: false,
    exigeQtde: true,
    metricas: ['UST', 'USN'],
    tipoOfertaPadrao: 'Universal',
    coeficientes: {
      'Muito Baixa': 0.5,
      Baixa: 0.75,
      Média: 1,
      Alta: 1.5,
      'Muito Alta': 2,
    },
  },
  'MTI HOST': {
    parceria: 'MTI HOST',
    solucao: 'MTI Host',
    versao: '1.0',
    vertical: 'Nuvem',
    usaComplexidade: false,
    usaPeso: true,
    exigeQtde: false,
    metricas: ['HST'],
    tipoOfertaPadrao: 'Individualizado',
    coeficientes: {},
  },
}

function boolStr(v: boolean): string {
  return v ? 'Sim' : 'Não'
}

function key(
  formDefId: string,
  ancestors: CanvasEmbAncestor[],
  fieldId: string,
): string {
  return canvasRuntimeFieldKey(formDefId, ancestors, fieldId)
}

/** Métricas permitidas pelo Catálogo seleccionado (filtra o seletor no Produto). */
export function metricasPermitidasDoCatalogo(
  getValue: (k: string) => string | undefined,
  canvasFormDefId: string,
  canvasAncestors: CanvasEmbAncestor[],
): string[] | undefined {
  const cat = (getValue(key(canvasFormDefId, canvasAncestors, F.catalogo)) ?? '').trim()
  if (!cat) return undefined
  return CATALOGO_HERANCA[cat]?.metricas
}

/**
 * Automação do canvas Produto: ao mudar Catálogo ou Complexidade,
 * preenche campos herdados / coeficiente (somente leitura na UI).
 */
export function applyAtlasCatProdutoCanvasSync(opts: {
  form: FormDef
  canvasFormDefId: string
  canvasAncestors: CanvasEmbAncestor[]
  changedFieldId: string
  changedValue: string
  setValue: (k: string, v: string) => void
  getValue: (k: string) => string | undefined
}): void {
  const { form, canvasFormDefId, canvasAncestors, changedFieldId, changedValue, setValue, getValue } =
    opts
  if (form.id !== FORM_CAT_PRODUTO) return
  if (canvasFormDefId !== FORM_CAT_PRODUTO) return

  const k = (fieldId: string) => key(canvasFormDefId, canvasAncestors, fieldId)

  if (changedFieldId === F.catalogo) {
    const cat = changedValue.trim()
    const data = CATALOGO_HERANCA[cat]
    if (!data) {
      setValue(k(F.parceria), '')
      setValue(k(F.solucao), '')
      setValue(k(F.versao), '')
      setValue(k(F.cfgCx), boolStr(false))
      setValue(k(F.cfgPeso), boolStr(false))
      setValue(k(F.cfgQtde), boolStr(false))
      setValue(k(F.coeficiente), '')
      return
    }
    setValue(k(F.parceria), data.parceria)
    setValue(k(F.solucao), data.solucao)
    setValue(k(F.versao), data.versao)
    setValue(k(F.vertical), data.vertical)
    setValue(k(F.cfgCx), boolStr(data.usaComplexidade))
    setValue(k(F.cfgPeso), boolStr(data.usaPeso))
    setValue(k(F.cfgQtde), boolStr(data.exigeQtde))
    if (data.metricas.length === 1) {
      setValue(k(F.metrica), data.metricas[0])
    } else {
      const atual = (getValue(k(F.metrica)) ?? '').trim()
      if (atual && !data.metricas.includes(atual)) {
        setValue(k(F.metrica), '')
      }
    }
    if (data.tipoOfertaPadrao) {
      const oferta = (getValue(k(F.tipoOferta)) ?? '').trim()
      if (!oferta) setValue(k(F.tipoOferta), data.tipoOfertaPadrao)
    }
    if (!data.usaComplexidade) {
      setValue(k(F.complexidade), '')
      setValue(k(F.coeficiente), '')
    }
    return
  }

  if (changedFieldId === F.complexidade) {
    const faixa = changedValue.trim()
    const cat = (getValue(k(F.catalogo)) ?? '').trim()
    const data = CATALOGO_HERANCA[cat]
    const coef = data?.coeficientes[faixa]
    if (coef !== undefined) setValue(k(F.coeficiente), String(coef))
    else setValue(k(F.coeficiente), '')
    return
  }

  // catalogo.m4a [53:08]: moeda universal aparece preenchida se Universal; Luís: valor 1.
  // [49:40]: sob demanda / consumo OS somente quando Universal (não é Tipo de cobrança).
  if (changedFieldId === F.tipoOferta) {
    const oferta = changedValue.trim()
    if (oferta === 'Universal') {
      setValue(k(F.moedaUniversal), '1')
      setValue(k(F.consumoOs), boolStr(true))
    } else if (oferta === 'Individualizado') {
      setValue(k(F.moedaUniversal), '')
      setValue(k(F.consumoOs), boolStr(false))
    }
  }
}
