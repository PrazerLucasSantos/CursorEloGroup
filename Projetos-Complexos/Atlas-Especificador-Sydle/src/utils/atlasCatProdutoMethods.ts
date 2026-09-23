import type { FormDef } from '../types'

const FORM_PRODUTO = 'form-patlasv4-proto-cat-produto'
const FORM_GRADE = 'form-patlasv4-proto-metodo-cat-visao-planilha'

const METH_GRADE_APLICAR = 'patlasv4proto-mcat-grade-meth-aplicar'
const METH_GRADE_EXPORT = 'patlasv4proto-mcat-grade-meth-export'
const METH_GRADE_SELECT = 'patlasv4proto-mcat-grade-meth-selecionar'

/**
 * Métodos embutidos do protótipo Catálogo/Produto.
 * Fator de conversão no cadastro do Produto N3 foi retirado (catalogo.m4a [48:06]).
 * Métodos de grade (visão planilha) permanecem.
 */
export function runAtlasCatProdutoMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
  setValue?: (key: string, value: string) => void,
): boolean {
  if (form.id === FORM_PRODUTO) {
    // Recalcular fator removido da Fase 2 (fonte: sem fator no cadastro N3).
    if (methodId === 'patlasv4proto-prod-meth-recalc-fator') {
      window.alert(
        'Fator de conversão\n\nConforme validação (catalogo.m4a), o fator não se aplica no cadastro do produto universal (N3).\nA conversão ocorre no consumo (N3→N2) — pendente Fase 3.',
      )
      return true
    }
    return false
  }

  if (form.id === FORM_GRADE) {
    const tipo = getValue('patlasv4proto-mcat-grade-filtro-tipo') ?? '(Todos)'
    const cx = getValue('patlasv4proto-mcat-grade-filtro-complexidade') ?? '(Todas)'
    const grupo = getValue('patlasv4proto-mcat-grade-filtro-grupo') ?? ''
    const cat = getValue('patlasv4proto-mcat-grade-filtro-categoria') ?? ''

    if (methodId === METH_GRADE_APLICAR) {
      const msg =
        `Filtros aplicados (protótipo)\n\n` +
        `Tipo: ${tipo}\nComplexidade: ${cx}\nGrupo: ${grupo || '—'}\nCategoria: ${cat || '—'}\n\n` +
        `A grade «Produtos» reflete o preset / seleção filtrada.`
      setValue?.(
        'patlasv4proto-mcat-grade-selecionados',
        cx !== '(Todas)'
          ? `Filtrado por Complexidade=${cx}` + (tipo !== '(Todos)' ? ` · Tipo=${tipo}` : '')
          : 'Sem filtro de complexidade — grade completa da versão',
      )
      window.alert(msg)
      return true
    }

    if (methodId === METH_GRADE_SELECT) {
      setValue?.('patlasv4proto-mcat-grade-selecionados', 'Todos os filtrados selecionados (protótipo)')
      window.alert('Selecionar todos filtrados\n\nLinhas visíveis marcadas para ação em massa.')
      return true
    }

    if (methodId === METH_GRADE_EXPORT) {
      window.alert('Exportar grade CSV\n\nGera CSV das linhas filtradas/selecionadas (protótipo).')
      return true
    }
  }

  return false
}
