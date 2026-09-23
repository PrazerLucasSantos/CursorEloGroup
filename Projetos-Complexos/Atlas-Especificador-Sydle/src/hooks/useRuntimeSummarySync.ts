import { useEffect, useRef } from 'react'

/**
 * Espelha o valor do campo no runtime do canvas.
 * Não depende da identidade do callback: se dependesse, cada setValue
 * recriaria o contexto e dispararia de novo todos os campos (loop infinito).
 */
export function useRuntimeSummarySync(
  runtimeSummaryKey: string | undefined,
  summary: string,
  onRuntimeSummaryChange?: (key: string, value: string) => void,
): void {
  const cbRef = useRef(onRuntimeSummaryChange)
  cbRef.current = onRuntimeSummaryChange
  const lastRef = useRef<{ key?: string; summary?: string }>({})

  useEffect(() => {
    const cb = cbRef.current
    if (!runtimeSummaryKey || !cb) return
    if (lastRef.current.key === runtimeSummaryKey && lastRef.current.summary === summary) {
      return
    }
    lastRef.current = { key: runtimeSummaryKey, summary }
    cb(runtimeSummaryKey, summary)
  }, [runtimeSummaryKey, summary])
}
