/**
 * MTI não tem portal.
 * Back-office = Projeto Atlas (Fila Demanda F3 + épicos/classes).
 */
import '../portalCliente/portal-cliente.css'

export default function PortalMtiApp() {
  return (
    <div className="pc-portal" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <main className="pc-page" style={{ maxWidth: 560, padding: '2rem' }}>
        <p className="pc-brand__mti" style={{ marginBottom: '0.75rem' }}>
          MTI
        </p>
        <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.35rem', color: '#0f3d4c' }}>
          MTI não tem portal
        </h1>
        <p style={{ margin: '0 0 1rem', color: '#475569', lineHeight: 1.55 }}>
          O ambiente da MTI é o <strong>Projeto Atlas</strong>. Demandas abertas no portal do cliente
          aparecem na <strong>Fila Demanda · MTI</strong> (mesmo store sincronizado).
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          <a className="pc-btn pc-btn--primary" href="/?fila=demanda#fila-demanda">
            Abrir Fila Demanda · MTI
          </a>
          <a className="pc-btn" href="/">
            Projeto Atlas (épicos / classes)
          </a>
          <a className="pc-btn" href="/portal-cliente.html">
            Portal do cliente
          </a>
          <a className="pc-btn" href="/portal-parceiro.html">
            Portal do parceiro
          </a>
        </div>
      </main>
    </div>
  )
}
