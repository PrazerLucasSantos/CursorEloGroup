import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PortalParceiroApp from './PortalParceiroApp'
import '../portalCliente/portal-cliente.css'
import './portal-parceiro.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalParceiroApp />
  </StrictMode>,
)
