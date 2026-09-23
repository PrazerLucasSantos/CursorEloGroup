/**
 * Back-office Demanda F3 embutido no Projeto Atlas (`/`).
 * Mesmo store do portal cliente/parceiro — fila operacional MTI.
 */
import { useEffect, useState } from 'react'
import DemandasPage from '../portalCliente/DemandasPage'
import '../portalCliente/portal-cliente.css'
import './atlasDemandaBo.css'

type Props = {
  open: boolean
  onClose: () => void
}

export default function AtlasDemandaBoPanel({ open, onClose }: Props) {
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="atlas-demanda-bo" role="dialog" aria-modal="true" aria-label="Fila Demanda MTI">
      <div className="atlas-demanda-bo__bar">
        <div className="atlas-demanda-bo__bar-text">
          <strong>Projeto Atlas · Fila Demanda F3</strong>
          <span>
            Mesmos dados do portal cliente/parceiro · ações MTI aqui (não é portal)
          </span>
        </div>
        <div className="atlas-demanda-bo__bar-actions">
          <a className="atlas-demanda-bo__link" href="/portal-cliente.html" target="_blank" rel="noreferrer">
            Portal cliente
          </a>
          <a className="atlas-demanda-bo__link" href="/portal-parceiro.html" target="_blank" rel="noreferrer">
            Portal parceiro
          </a>
          <button type="button" className="atlas-demanda-bo__close" onClick={onClose}>
            Fechar · voltar aos épicos
          </button>
        </div>
      </div>
      <div className="atlas-demanda-bo__body pc-portal">
        <DemandasPage
          modo="mti"
          onHome={onClose}
          onToast={(msg) => setToast(msg)}
        />
      </div>
      {toast && (
        <div className="atlas-demanda-bo__toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
