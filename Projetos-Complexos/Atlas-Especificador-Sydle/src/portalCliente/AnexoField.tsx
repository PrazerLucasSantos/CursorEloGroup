import { useRef, type ChangeEvent } from 'react'

export function formatAnexoKb(kb: number): string {
  return `${kb.toFixed(2)}KB`
}

/** Botão circular de upload / arquivo carregado (estilo Sydle). */
export function AnexoUpload({
  nome,
  tamanhoKb,
  accept,
  multiple,
  onFile,
  onFiles,
  onClear,
}: {
  nome?: string
  tamanhoKb?: number
  accept?: string
  multiple?: boolean
  onFile?: (file: { nome: string; tamanhoKb: number }) => void
  onFiles?: (files: { nome: string; tamanhoKb: number }[]) => void
  onClear?: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const list = e.target.files
    if (!list?.length) return
    const parsed = [...list].map((file) => ({
      nome: file.name,
      tamanhoKb: Math.max(0.01, file.size / 1024),
    }))
    if (multiple && onFiles) onFiles(parsed)
    else if (onFile && parsed[0]) onFile(parsed[0])
    e.target.value = ''
  }

  if (nome && !multiple) {
    return (
      <div className="pc-anexo-loaded">
        <span className="material-symbols-outlined pc-anexo-loaded__icon" aria-hidden>
          description
        </span>
        <span className="pc-anexo-loaded__text">
          {nome} ({formatAnexoKb(tamanhoKb ?? 12.5)})
        </span>
        {onClear ? (
          <button
            type="button"
            className="pc-anexo-loaded__clear"
            aria-label="Remover arquivo"
            onClick={onClear}
          >
            <span className="material-symbols-outlined" aria-hidden>
              close
            </span>
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="pc-anexo-upload">
      <input
        ref={inputRef}
        className="pc-anexo-upload__input"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onPick}
      />
      <button
        type="button"
        className="pc-anexo-upload__btn"
        aria-label="Carregar arquivo"
        onClick={() => inputRef.current?.click()}
      >
        <span className="material-symbols-outlined" aria-hidden>
          upload
        </span>
      </button>
    </div>
  )
}

export function AnexoLoadedItem({
  nome,
  tamanhoKb,
  onClear,
}: {
  nome: string
  tamanhoKb?: number
  onClear?: () => void
}) {
  return (
    <div className="pc-anexo-loaded">
      <span className="material-symbols-outlined pc-anexo-loaded__icon" aria-hidden>
        description
      </span>
      <span className="pc-anexo-loaded__text">
        {nome} ({formatAnexoKb(tamanhoKb ?? 12.5)})
      </span>
      {onClear ? (
        <button
          type="button"
          className="pc-anexo-loaded__clear"
          aria-label={`Remover ${nome}`}
          onClick={onClear}
        >
          <span className="material-symbols-outlined" aria-hidden>
            close
          </span>
        </button>
      ) : null}
    </div>
  )
}
