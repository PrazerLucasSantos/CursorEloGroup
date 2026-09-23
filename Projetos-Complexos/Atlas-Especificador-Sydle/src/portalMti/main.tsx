import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PortalMtiApp from './PortalMtiApp'
import '../portalCliente/portal-cliente.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalMtiApp />
  </StrictMode>,
)
