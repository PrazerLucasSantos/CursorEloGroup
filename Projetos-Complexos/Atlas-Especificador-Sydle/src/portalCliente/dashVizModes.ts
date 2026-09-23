/** Modos pertinentes ao portal Cliente · Solicitante (tipo organização = Cliente). */
export const MODOS_VISUALIZACAO = [
  'Métrica',
  'Gráfico de Pizza',
  'Gráfico de Rosca',
  'Gráfico de Barras',
  'Gráfico de Colunas',
  'Gráfico de Colunas e Linhas',
  'Gráfico de Linhas',
  'Gráfico de Área',
  'Mapa de Marcadores',
  'Listagem em Cards',
  'Tabela',
] as const

export type ModoVisualizacao = (typeof MODOS_VISUALIZACAO)[number]

export const PALETA_DASH = [
  '#004a8d',
  '#2f66d6',
  '#0d9488',
  '#d97706',
  '#be123c',
  '#7c3aed',
  '#64748b',
  '#0891b2',
]
