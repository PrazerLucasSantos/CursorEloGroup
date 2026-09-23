/**
 * Testes leves das regras confirmadas em catalogo.m4a para sync do Produto.
 * Executar: npx --yes tsx scripts/_test_fase2_catalogo_sync.ts
 */
import {
  applyAtlasCatProdutoCanvasSync,
  FORM_CAT_PRODUTO,
  metricasPermitidasDoCatalogo,
} from '../src/utils/atlasCatProdutoCanvasSync'

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(msg)
}

const form = { id: FORM_CAT_PRODUTO, name: 'Produto', fields: [] as never[] }
const store: Record<string, string> = {}
const getValue = (k: string) => store[k]
const setValue = (k: string, v: string) => {
  store[k] = v
}
const key = (fid: string) => `${FORM_CAT_PRODUTO}::::${fid}`

applyAtlasCatProdutoCanvasSync({
  form,
  canvasFormDefId: FORM_CAT_PRODUTO,
  canvasAncestors: [],
  changedFieldId: `${FORM_CAT_PRODUTO}-catalogo`,
  changedValue: 'Catálogo MTI Simplifica',
  setValue,
  getValue,
})
store[key(`${FORM_CAT_PRODUTO}-catalogo`)] = 'Catálogo MTI Simplifica'

assert(store[key(`${FORM_CAT_PRODUTO}-parceria`)] === 'MTI SIMPLIFICA', 'parceria herdada')
assert(store[key(`${FORM_CAT_PRODUTO}-solucao`)] === 'MTI Simplifica', 'solucao herdada')
assert(store[key(`${FORM_CAT_PRODUTO}-versao-catalogo`)] === '9.4', 'versao herdada')
assert(store[key(`${FORM_CAT_PRODUTO}-cfg-usa-complexidade`)] === 'Sim', 'cfg complexidade')
assert(store[key(`${FORM_CAT_PRODUTO}-cfg-usa-peso`)] === 'Não', 'cfg peso')

applyAtlasCatProdutoCanvasSync({
  form,
  canvasFormDefId: FORM_CAT_PRODUTO,
  canvasAncestors: [],
  changedFieldId: `${FORM_CAT_PRODUTO}-complexidade`,
  changedValue: 'Média',
  setValue,
  getValue,
})
assert(store[key(`${FORM_CAT_PRODUTO}-coeficiente-complexidade`)] === '1', 'coeficiente herdado')

applyAtlasCatProdutoCanvasSync({
  form,
  canvasFormDefId: FORM_CAT_PRODUTO,
  canvasAncestors: [],
  changedFieldId: `${FORM_CAT_PRODUTO}-tipo-oferta`,
  changedValue: 'Universal',
  setValue,
  getValue,
})
assert(store[key(`${FORM_CAT_PRODUTO}-moeda-universal`)] === '1', 'moeda universal = 1')
assert(store[key(`${FORM_CAT_PRODUTO}-consumo-os`)] === 'Sim', 'consumo OS se universal')

const mets = metricasPermitidasDoCatalogo(getValue, FORM_CAT_PRODUTO, [])
assert(Array.isArray(mets) && mets.includes('UST'), 'metricas filtradas')

console.log('OK _test_fase2_catalogo_sync.ts')
