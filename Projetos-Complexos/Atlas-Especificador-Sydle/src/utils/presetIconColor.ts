import type { FormExampleValuePreset } from '../types'

/**
 * Cores fixas do ícone de cenário (listagem, header, export). Sem aleatoriedade: escolhidas na aba de exemplos.
 * Valores em hex 6 (sem alfa) para fácil edição no JSON.
 */
export const PRESET_ICON_COLOR_CHOICES = [
  '#2B9CBF',
  '#F59740',
  '#F66849',
  '#5163C4',
  '#212121',
  '#EA5EC2',
  '#51DACF',
  '#A581DD',
  '#DCA95D',
  '#CF5F81',
  '#B0D85C',
  '#5FCFB4',
] as const

export type PresetIconColor = (typeof PRESET_ICON_COLOR_CHOICES)[number]

const PALETTE = new Set<string>(PRESET_ICON_COLOR_CHOICES)

export const DEFAULT_PRESET_ICON_COLOR: PresetIconColor = PRESET_ICON_COLOR_CHOICES[0]

function normalizeHex6(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  const s = t.startsWith('#') ? t.slice(1) : t
  if (!/^[0-9A-Fa-f]{6}$/.test(s)) return null
  return `#${s.toUpperCase()}`
}

/** Garante que a cor seja uma das opções; caso contrário devolve a predefinida. */
export function resolvePresetIconBackground(preset: FormExampleValuePreset | undefined): string {
  const c = normalizeHex6(preset?.iconColor?.trim() ?? '')
  if (c && PALETTE.has(c as PresetIconColor)) return c
  return DEFAULT_PRESET_ICON_COLOR
}

export function isPresetIconColorValue(value: string | undefined): value is PresetIconColor {
  const c = normalizeHex6(value?.trim() ?? '')
  return c != null && PALETTE.has(c as PresetIconColor)
}
