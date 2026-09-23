import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import './presentationViewer.css'
import PresentationViewerApp from './presentation/PresentationViewerApp'
import {
  PRESENTATION_EXPORT_VERSION,
  type PresentationExportPayload,
} from './presentation/presentationExportTypes'

function loadPresentationJson(): Promise<PresentationExportPayload> {
  const url = new URL('presentation.json', window.location.href)
  return fetch(url.href).then(async (r) => {
    if (!r.ok) {
      throw new Error(
        `Não foi possível carregar presentation.json (${r.status}). Confirme que o ficheiro está na mesma pasta que esta página.`,
      )
    }
    const raw: unknown = await r.json()
    const data = raw as PresentationExportPayload
    if (data.version !== PRESENTATION_EXPORT_VERSION) {
      throw new Error(
        `presentation.json: versão ${String(data.version)} não é suportada (esperado ${PRESENTATION_EXPORT_VERSION}).`,
      )
    }
    if (!data.bundle || !data.flow) {
      throw new Error('presentation.json: estrutura inválida (bundle ou flow em falta).')
    }
    return data
  })
}

function Boot() {
  const [payload, setPayload] = useState<PresentationExportPayload | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    loadPresentationJson()
      .then(setPayload)
      .catch((e: Error) => setErr(e.message ?? String(e)))
  }, [])

  if (err) {
    return (
      <div className="presentation-viewer-error" role="alert">
        <strong>Não foi possível abrir a apresentação.</strong>
        <p>{err}</p>
      </div>
    )
  }

  if (!payload) {
    return <div className="presentation-viewer-loading">A carregar apresentação…</div>
  }

  return (
    <div className="presentation-viewer">
      <PresentationViewerApp payload={payload} />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boot />
  </StrictMode>,
)
