/**
 * Store compartilhado de Demandas F3 entre:
 * - Portal cliente (`/portal-cliente.html`)
 * - Portal parceiro (`/portal-parceiro.html`)
 * - Projeto Atlas BO (`/` · fila MTI)
 *
 * Persistência: localStorage + BroadcastChannel + storage event (abas/páginas).
 */
import { useCallback, useEffect, useState } from 'react'
import {
  DEMANDAS_INICIAIS,
  type Demanda,
} from '../portalCliente/portalClienteDemandaData'

/** v3 — seed com 1 demanda completa por status (cliente + parceiro). */
export const DEMANDA_STORE_KEY = 'atlas-demanda-f3-shared-v4'
const CHANNEL_NAME = 'atlas-demanda-f3-shared-v4'
const EVENT_NAME = 'atlas-demanda-store-changed'

type StorePayload = { v: 1; updatedAt: string; demandas: Demanda[] }

let channel: BroadcastChannel | null = null
function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME)
    } catch {
      channel = null
    }
  }
  return channel
}

function cloneSeed(): Demanda[] {
  return structuredClone(DEMANDAS_INICIAIS)
}

function readRaw(): StorePayload | null {
  try {
    const raw = localStorage.getItem(DEMANDA_STORE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StorePayload
    if (!parsed || !Array.isArray(parsed.demandas)) return null
    return parsed
  } catch {
    return null
  }
}

/** Carrega demandas; na 1ª visita seeda com DEMANDAS_INICIAIS. */
export function loadDemandasShared(): Demanda[] {
  const existing = readRaw()
  if (!existing) {
    const seed = cloneSeed()
    writeDemandasShared(seed, { broadcast: false })
    return structuredClone(seed)
  }
  // Garante 1 seed por status novo (ex.: patrocinador) sem apagar dados do usuário
  const rows = structuredClone(existing.demandas)
  const have = new Set(rows.map((d) => d.status))
  let added = false
  for (const seed of DEMANDAS_INICIAIS) {
    if (!have.has(seed.status)) {
      rows.push(structuredClone(seed))
      have.add(seed.status)
      added = true
    }
  }
  if (added) writeDemandasShared(rows, { broadcast: false })
  return rows
}

function writeDemandasShared(
  demandas: Demanda[],
  opts: { broadcast?: boolean } = {},
): void {
  const payload: StorePayload = {
    v: 1,
    updatedAt: new Date().toISOString(),
    demandas: structuredClone(demandas),
  }
  try {
    localStorage.setItem(DEMANDA_STORE_KEY, JSON.stringify(payload))
  } catch (err) {
    console.warn('[demandaSharedStore] falha ao gravar localStorage', err)
  }
  if (opts.broadcast === false) return
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload.demandas }))
  try {
    getChannel()?.postMessage({ type: 'sync', demandas: payload.demandas })
  } catch {
    /* ignore */
  }
}

/** Substitui a lista completa e notifica outras abas/páginas. */
export function saveDemandasShared(demandas: Demanda[]): void {
  writeDemandasShared(demandas, { broadcast: true })
}

/** Upsert por id (cria no topo se novo). */
export function upsertDemandaShared(demanda: Demanda): Demanda[] {
  const rows = loadDemandasShared()
  const i = rows.findIndex((d) => d.id === demanda.id)
  const next =
    i >= 0
      ? rows.map((d, idx) => (idx === i ? demanda : d))
      : [demanda, ...rows]
  saveDemandasShared(next)
  return next
}

export function replaceAllDemandasShared(demandas: Demanda[]): void {
  saveDemandasShared(demandas)
}

/**
 * Assina mudanças (mesma aba via CustomEvent; outras abas via storage/BroadcastChannel).
 * Também recarrega ao focar a janela / voltar à aba (garante sync portal ↔ Atlas).
 * Não dispara o callback na inscrição inicial — o consumidor carrega com loadDemandasShared.
 */
export function subscribeDemandasShared(onChange: (rows: Demanda[]) => void): () => void {
  const emitFromStorage = () => {
    const rows = loadDemandasShared()
    onChange(rows)
  }
  const handleCustom = (e: Event) => {
    const detail = (e as CustomEvent<Demanda[]>).detail
    if (Array.isArray(detail)) onChange(structuredClone(detail))
  }
  const handleStorage = (e: StorageEvent) => {
    if (e.key !== DEMANDA_STORE_KEY || !e.newValue) return
    try {
      const parsed = JSON.parse(e.newValue) as StorePayload
      if (Array.isArray(parsed.demandas)) onChange(structuredClone(parsed.demandas))
    } catch {
      /* ignore */
    }
  }
  const bc = getChannel()
  const handleBc = (e: MessageEvent) => {
    if (e.data?.type === 'sync' && Array.isArray(e.data.demandas)) {
      onChange(structuredClone(e.data.demandas))
    }
  }
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') emitFromStorage()
  }

  window.addEventListener(EVENT_NAME, handleCustom)
  window.addEventListener('storage', handleStorage)
  window.addEventListener('focus', emitFromStorage)
  document.addEventListener('visibilitychange', handleVisibility)
  bc?.addEventListener('message', handleBc)

  // Poll leve: cobre casos em que storage/BC falham entre entrypoints Vite
  const pollId = window.setInterval(emitFromStorage, 1500)

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustom)
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener('focus', emitFromStorage)
    document.removeEventListener('visibilitychange', handleVisibility)
    bc?.removeEventListener('message', handleBc)
    window.clearInterval(pollId)
  }
}

/** Hook React: lista + setter que persiste e sincroniza. */
export function useDemandasShared(): [
  Demanda[],
  (updater: Demanda[] | ((prev: Demanda[]) => Demanda[])) => void,
] {
  const [demandas, setDemandasState] = useState<Demanda[]>(() => loadDemandasShared())

  useEffect(() => {
    return subscribeDemandasShared((rows) => {
      setDemandasState((prev) => {
        // Evita re-render se o JSON for idêntico
        try {
          if (JSON.stringify(prev) === JSON.stringify(rows)) return prev
        } catch {
          /* fall through */
        }
        return rows
      })
    })
  }, [])

  const setDemandas = useCallback(
    (updater: Demanda[] | ((prev: Demanda[]) => Demanda[])) => {
      setDemandasState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        writeDemandasShared(next, { broadcast: true })
        return next
      })
    },
    [],
  )

  return [demandas, setDemandas]
}
