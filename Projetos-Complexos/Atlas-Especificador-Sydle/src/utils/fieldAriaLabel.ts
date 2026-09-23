/** Nome acessível quando o rótulo visível está oculto. */
export function fieldAriaName(label: string, required: boolean): string {
  const t = label.trim()
  if (!t) return required ? 'Campo obrigatório' : 'Campo'
  return required ? `${t} (obrigatório)` : t
}
