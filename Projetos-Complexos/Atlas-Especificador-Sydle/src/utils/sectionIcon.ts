/**
 * Normaliza o identificador para ligadura Material Symbols (nome do ícone em snake_case).
 * Retorna null se vazio ou se contiver caracteres inválidos.
 */
export function normalizeSectionIconLigature(raw: string | undefined): string | null {
  if (raw == null) return null
  const t = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
  if (!t) return null
  if (!/^[\d_a-z_]+$/.test(t)) return null
  return t
}
