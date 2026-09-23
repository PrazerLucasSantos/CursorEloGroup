import type { CSSProperties } from 'react'
import type { WorkspaceDef } from '../types'

export const DEFAULT_WS_CHROME = '#7a8510'

/** Opções do dropdown (mesmo padrão do texto do header do portal). */
export const WORKSPACE_EXPLORER_HEADER_FG_OPTIONS: { value: '#ffffff' | '#000000'; label: string }[] = [
  { value: '#ffffff', label: 'Branco' },
  { value: '#000000', label: 'Preto' },
]

export function resolveWorkspaceHex(value: string | undefined, fallback: string): string {
  const t = value?.trim()
  if (!t) return fallback
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(t) ? t : fallback
}

/** Valor do `<select>`: só branco ou preto; lê campo novo e legados. */
export function selectExplorerHeaderForeground(workspace: WorkspaceDef): '#ffffff' | '#000000' {
  const x = workspace.explorerHeaderForeground
  if (x === '#000000' || x === '#ffffff') return x
  if (workspace.explorerHeaderText === 'dark') return '#000000'
  const t = workspace.explorerIconColor?.trim().toLowerCase()
  if (t === '#000000' || t === '#000' || t === '#18181b') return '#000000'
  return '#ffffff'
}

/** Variáveis CSS para `.workspace-explorer` (chrome + mesma cor para texto e ícones). */
export function workspaceExplorerCssVars(workspace: WorkspaceDef): CSSProperties {
  const chrome = resolveWorkspaceHex(workspace.explorerChromeColor, DEFAULT_WS_CHROME)
  const fg = selectExplorerHeaderForeground(workspace)
  return {
    '--ws-chrome': chrome,
    '--ws-icon': fg,
    '--ws-header-fg': fg,
  } as CSSProperties
}

function initialsFromName(name: string): string {
  const t = name.trim()
  if (!t) return 'WS'
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return t.slice(0, 2).toUpperCase()
}

export function workspaceAvatarInitials(workspace: WorkspaceDef): string {
  const raw = workspace.explorerUserInitials?.trim()
  if (raw) return raw.slice(0, 4).toUpperCase()
  return initialsFromName(workspace.name || '')
}
