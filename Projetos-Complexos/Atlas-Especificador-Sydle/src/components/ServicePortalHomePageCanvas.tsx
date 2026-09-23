import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { ServicePortalHomePageData, ServicePortalHomeSection } from '../types'
import {
  getServicePortalHomeSections,
  resolveCatalogDisplayServiceLimit,
  resolveCatalogMaxColumns,
} from '../utils/servicePortalHomeData'

interface Props {
  /** Rótulo acessível (ex.: título da etapa ou do portal). */
  label: string
  data: ServicePortalHomePageData
  /** Classes extra na `<section>` raiz (ex.: alinhamento na etapa de apresentação). */
  className?: string
  /** Preview de etapa portal (página inicial): navegação ao clicar num card de serviço. */
  serviceNavigate?: {
    targetsByServiceId: Record<string, string>
    onNavigateToStep: (stepId: string) => void
  }
}

function resolveHex(value: string | undefined, fallback: string): string {
  const t = value?.trim()
  if (!t) return fallback
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(t) ? t : fallback
}

const DEFAULT_HOME_SECTIONS: ServicePortalHomeSection[] = [
  {
    type: 'catalog',
    id: 'catalog-fisc-contratual',
    name: 'Fiscalizacao Contratual',
    services: [
      {
        id: 'service-inc-exc-atores',
        name: 'Inclusao e exclusao de atores contratuais',
        description: 'Servicos de inclusao e exclusao de atores contratuais',
        icon: 'group_add',
      },
      {
        id: 'service-subst-atores',
        name: 'Substituicao de atores contratuais',
        description: 'Servicos de substituicao de atores contratuais',
        icon: 'groups',
      },
      {
        id: 'service-minhas-contratacoes',
        name: 'Minhas contratacoes',
        description: 'Consulta de contratacoes via minhas contratacoes',
        icon: 'description',
      },
    ],
  },
  {
    type: 'catalog',
    id: 'catalog-cap',
    name: 'Servicos da CAP',
    services: [
      { id: 'service-cap-1', name: 'Solicitar', description: 'Abertura de nova solicitacao', icon: 'send' },
      {
        id: 'service-cap-2',
        name: 'Solicitar',
        description: 'Atualizacao cadastral do processo',
        icon: 'published_with_changes',
      },
      {
        id: 'service-cap-3',
        name: 'Solicitar',
        description: 'Encaminhamento para analise tecnica',
        icon: 'change_circle',
      },
      {
        id: 'service-cap-4',
        name: 'Solicitar',
        description: 'Acompanhamento de tramitacao',
        icon: 'account_tree',
      },
    ],
  },
]

export default function ServicePortalHomePageCanvas({ label, data, className, serviceNavigate }: Props) {
  const homeTitle = data.servicePortalHomeHeroTitle?.trim() || 'Portal de Servicos'
  const homeSummary = data.servicePortalHomeHeroSubtitle?.trim() || 'Ministerio Publico do Estado de Minas Gerais'
  const searchPlaceholder = data.servicePortalHomeSearchPlaceholder?.trim() || 'Buscar'
  const menuOptions = data.servicePortalHeaderMenuOptions?.filter((item) => item.trim()) ?? ['Meu Painel', 'Portal MPMG']
  const bellCount = data.servicePortalHeaderNotificationCount ?? 13
  const userInitials = data.servicePortalHeaderUserInitials?.trim() || 'MF'
  const homeSections = getServicePortalHomeSections(data)
  const resolvedSections = homeSections.length > 0 ? homeSections : DEFAULT_HOME_SECTIONS

  const coverUrl = data.servicePortalHomeCoverImageUrl?.trim()
  const logoUrl = data.servicePortalHomeLogoUrl?.trim()

  /** Primária = fundo do header; secundária = hover do menu e ícones; texto = só header; bg = corpo da página. */
  const homeShellStyle: CSSProperties = {
    ['--sp-header-bg' as string]: resolveHex(data.servicePortalHomeColorPrimary, '#ffffff'),
    ['--sp-secondary' as string]: resolveHex(data.servicePortalHomeColorSecondary, '#7c3aed'),
    ['--sp-header-text' as string]: resolveHex(data.servicePortalHomeColorText, '#000000'),
    ['--sp-bg' as string]: resolveHex(data.servicePortalHomeColorBackground, '#ffffff'),
  }

  const heroStyle: CSSProperties = {}
  if (coverUrl) {
    heroStyle.backgroundImage = `linear-gradient(105deg, rgba(15, 23, 42, 0.58), rgba(15, 23, 42, 0.42)), url(${coverUrl})`
    heroStyle.backgroundSize = 'cover'
    heroStyle.backgroundPosition = 'center'
  }

  const rootClass = ['canvas', 'canvas--viewport-form', 'service-portal-home-canvas', className]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={rootClass} aria-label={`Portal de servicos: ${label}`}>
      <div className="canvas__portal-viewport">
        <div className="service-portal-home" style={homeShellStyle}>
          <header className="service-portal-home__topbar">
            <div className="service-portal-home__brand">
              {logoUrl ? (
                <img
                  className="service-portal-home__brand-logo-img"
                  src={logoUrl}
                  alt=""
                  role="presentation"
                />
              ) : (
                <div className="service-portal-home__brand-logo" aria-hidden>
                  MP
                </div>
              )}
            </div>
            <nav className="service-portal-home__menu" aria-label="Navegacao principal">
              {menuOptions.map((item, idx) => (
                <span key={`${item}-${idx}`}>{item}</span>
              ))}
            </nav>
            <div className="service-portal-home__user">
              <span
                className="service-portal-home__bell"
                aria-label={`Notificacoes${bellCount > 0 ? `, ${bellCount} nao lidas` : ''}`}
                title={bellCount > 0 ? `${bellCount} notificacoes` : 'Notificacoes'}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  notifications
                </span>
              </span>
              <span className="service-portal-home__avatar" aria-label="Usuario atual">
                {userInitials}
              </span>
            </div>
          </header>

          <section
            className="service-portal-home__hero"
            aria-label="Capa"
            style={Object.keys(heroStyle).length > 0 ? heroStyle : undefined}
          >
            <h1>{homeTitle}</h1>
            <p>{homeSummary}</p>
            <label className="service-portal-home__search" aria-label="Busca de servicos">
              <span className="material-symbols-outlined" aria-hidden>
                search
              </span>
              <input type="text" value="" readOnly placeholder={searchPlaceholder} />
            </label>
          </section>

          <main className="service-portal-home__content">
            {resolvedSections.map((section) => {
              if (section.type === 'html') {
                const html = section.htmlContent?.trim() ?? ''
                if (!html) return null
                return (
                  <section key={section.id} className="service-portal-home__section service-portal-home__section--html">
                    <div
                      className="service-portal-home__html-block flow-canvas-html__inner"
                      dangerouslySetInnerHTML={{ __html: section.htmlContent ?? '' }}
                    />
                  </section>
                )
              }
              const catalog = section
              if (!catalog.name.trim()) return null
              const displayLimit = resolveCatalogDisplayServiceLimit(catalog)
              const catalogServices = (catalog.services ?? [])
                .filter((service) => service.name.trim())
                .slice(0, displayLimit)
              if (catalogServices.length === 0) return null
              const maxCols = resolveCatalogMaxColumns(catalog)
              return (
                <section key={catalog.id} className="service-portal-home__section">
                  <h2 className="service-portal-home__section-title">{catalog.name}</h2>
                  <div
                    className="service-portal-home__cards service-portal-home__cards--max-cols"
                    style={{ ['--sp-max-cols' as string]: String(maxCols) } as CSSProperties}
                  >
                    {catalogServices.map((service) => {
                      const navTarget = serviceNavigate?.targetsByServiceId[service.id]?.trim() ?? ''
                      const clickable = Boolean(serviceNavigate && navTarget)
                      const handleClick = clickable
                        ? () => serviceNavigate!.onNavigateToStep(navTarget)
                        : undefined
                      const handleKeyDown = clickable
                        ? (e: ReactKeyboardEvent<HTMLElement>) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              serviceNavigate!.onNavigateToStep(navTarget)
                            }
                          }
                        : undefined
                      const cardClass = `service-portal-home__card${clickable ? ' service-portal-home__card--clickable' : ''}`
                      return (
                        <article
                          key={service.id}
                          className={cardClass}
                          {...(clickable
                            ? {
                                role: 'button',
                                tabIndex: 0,
                                onClick: handleClick,
                                onKeyDown: handleKeyDown,
                                'aria-label': `Abrir serviço: ${service.name}`,
                              }
                            : {})}
                        >
                          <div className="service-portal-home__card-text">
                            <h3>{service.name}</h3>
                            <p>{service.description}</p>
                          </div>
                          <div className="service-portal-home__card-icon" aria-hidden>
                            <span className="material-symbols-outlined">{service.icon || 'description'}</span>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </main>
        </div>
      </div>
    </section>
  )
}
