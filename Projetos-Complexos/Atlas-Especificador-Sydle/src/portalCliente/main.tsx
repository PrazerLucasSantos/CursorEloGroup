import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PortalClienteApp from './PortalClienteApp'
import './portal-cliente.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalClienteApp />
  </StrictMode>,
)
