import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type CanvasRuntimeValuesApi = {
  getValue: (key: string) => string | undefined
  setValue: (key: string, value: string) => void
  /** Cópia de todos os valores editados no canvas (para gravar no preset). */
  getAllValues: () => Record<string, string>
}

const CanvasRuntimeValuesContext = createContext<CanvasRuntimeValuesApi | null>(null)

export function CanvasRuntimeValuesProvider({
  children,
  initialValues,
  onSetValue,
}: {
  children: ReactNode
  /** Valores iniciais (ex.: prefill do método a partir da Demanda). */
  initialValues?: Record<string, string>
  /** Chamado após cada setValue com o mapa completo (espelhamento método → classe). */
  onSetValue?: (key: string, value: string, all: Record<string, string>) => void
}) {
  const [map, setMap] = useState<Record<string, string>>(() => ({ ...(initialValues ?? {}) }))
  // Ref espelha o mapa para leituras síncronas dentro do mesmo tick (cascata set→get).
  const mapRef = useRef(map)
  mapRef.current = map

  const getValue = useCallback((key: string) => mapRef.current[key], [])

  const setValue = useCallback(
    (key: string, value: string) => {
      const prev = mapRef.current
      if (prev[key] === value) return
      const next = { ...prev, [key]: value }
      mapRef.current = next
      setMap(next)
      if (onSetValue) {
        queueMicrotask(() => onSetValue(key, value, next))
      }
    },
    [onSetValue],
  )

  const getAllValues = useCallback(() => ({ ...mapRef.current }), [])

  const api = useMemo(
    () => ({ getValue, setValue, getAllValues }),
    [getValue, setValue, getAllValues],
  )

  return (
    <CanvasRuntimeValuesContext.Provider value={api}>{children}</CanvasRuntimeValuesContext.Provider>
  )
}

export function useCanvasRuntimeValues(): CanvasRuntimeValuesApi | null {
  return useContext(CanvasRuntimeValuesContext)
}
