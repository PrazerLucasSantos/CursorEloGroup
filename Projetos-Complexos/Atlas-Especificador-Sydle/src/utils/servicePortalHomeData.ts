import type {
  FlowStep,
  ServicePortalCatalog,
  ServicePortalCatalogService,
  ServicePortalDef,
  ServicePortalHomeCatalogSection,
  ServicePortalHomePageData,
  ServicePortalHomeSection,
  ServicePortalHomeHtmlSection,
} from '../types'

/** Remove campos inline da página inicial quando a etapa usa `linkedServicePortalId`. */
export function stripInlineServicePortalHomeWhenLinked(step: FlowStep): FlowStep {
  if (step.servicePortalSubtype === 'homePage' && step.linkedServicePortalId) {
    return {
      ...step,
      servicePortalHomeHeroTitle: undefined,
      servicePortalHomeHeroSubtitle: undefined,
      servicePortalHomeSearchPlaceholder: undefined,
      servicePortalHeaderMenuOptions: undefined,
      servicePortalHeaderNotificationCount: undefined,
      servicePortalHeaderUserInitials: undefined,
      servicePortalHomeColorPrimary: undefined,
      servicePortalHomeColorSecondary: undefined,
      servicePortalHomeColorText: undefined,
      servicePortalHomeColorBackground: undefined,
      servicePortalHomeLogoUrl: undefined,
      servicePortalHomeCoverImageUrl: undefined,
      servicePortalHomeSections: undefined,
      servicePortalCatalogs: undefined,
      servicePortalCatalogServices: undefined,
    }
  }
  return step
}

export function homePageDataFromStep(step: FlowStep): ServicePortalHomePageData {
  return {
    servicePortalHomeHeroTitle: step.servicePortalHomeHeroTitle,
    servicePortalHomeHeroSubtitle: step.servicePortalHomeHeroSubtitle,
    servicePortalHomeSearchPlaceholder: step.servicePortalHomeSearchPlaceholder,
    servicePortalHeaderMenuOptions: step.servicePortalHeaderMenuOptions,
    servicePortalHeaderNotificationCount: step.servicePortalHeaderNotificationCount,
    servicePortalHeaderUserInitials: step.servicePortalHeaderUserInitials,
    servicePortalHomeColorPrimary: step.servicePortalHomeColorPrimary,
    servicePortalHomeColorSecondary: step.servicePortalHomeColorSecondary,
    servicePortalHomeColorText: step.servicePortalHomeColorText,
    servicePortalHomeColorBackground: step.servicePortalHomeColorBackground,
    servicePortalHomeLogoUrl: step.servicePortalHomeLogoUrl,
    servicePortalHomeCoverImageUrl: step.servicePortalHomeCoverImageUrl,
    servicePortalHomeSections: step.servicePortalHomeSections,
    servicePortalCatalogs: step.servicePortalCatalogs,
    servicePortalCatalogServices: step.servicePortalCatalogServices,
  }
}

export function defToHomePageData(def: ServicePortalDef): ServicePortalHomePageData {
  return {
    servicePortalHomeHeroTitle: def.servicePortalHomeHeroTitle,
    servicePortalHomeHeroSubtitle: def.servicePortalHomeHeroSubtitle,
    servicePortalHomeSearchPlaceholder: def.servicePortalHomeSearchPlaceholder,
    servicePortalHeaderMenuOptions: def.servicePortalHeaderMenuOptions,
    servicePortalHeaderNotificationCount: def.servicePortalHeaderNotificationCount,
    servicePortalHeaderUserInitials: def.servicePortalHeaderUserInitials,
    servicePortalHomeColorPrimary: def.servicePortalHomeColorPrimary,
    servicePortalHomeColorSecondary: def.servicePortalHomeColorSecondary,
    servicePortalHomeColorText: def.servicePortalHomeColorText,
    servicePortalHomeColorBackground: def.servicePortalHomeColorBackground,
    servicePortalHomeLogoUrl: def.servicePortalHomeLogoUrl,
    servicePortalHomeCoverImageUrl: def.servicePortalHomeCoverImageUrl,
    servicePortalHomeSections: def.servicePortalHomeSections,
    servicePortalCatalogs: def.servicePortalCatalogs,
    servicePortalCatalogServices: def.servicePortalCatalogServices,
  }
}

/**
 * Dados efetivos para preview/config: portal vinculado tem prioridade; senão, campos legados na etapa.
 */
export function resolveServicePortalHomePageData(
  step: FlowStep,
  portals: ServicePortalDef[],
): ServicePortalHomePageData {
  const id = step.linkedServicePortalId?.trim()
  if (id) {
    const p = portals.find((x) => x.id === id)
    if (p) return defToHomePageData(p)
  }
  return homePageDataFromStep(step)
}

export function hasInlineServicePortalHomeContent(step: FlowStep): boolean {
  if (step.servicePortalHomeHeroTitle?.trim()) return true
  if (step.servicePortalHomeHeroSubtitle?.trim()) return true
  if (step.servicePortalHomeSearchPlaceholder?.trim()) return true
  if (step.servicePortalHeaderUserInitials?.trim()) return true
  if ((step.servicePortalHeaderMenuOptions ?? []).some((s) => s.trim())) return true
  if (step.servicePortalHeaderNotificationCount != null && String(step.servicePortalHeaderNotificationCount).trim() !== '')
    return true
  if ((step.servicePortalHomeSections ?? []).length > 0) return true
  if ((step.servicePortalCatalogs ?? []).length > 0) return true
  if ((step.servicePortalCatalogServices ?? []).length > 0) return true
  return false
}

export function newEmptyHomePageData(): ServicePortalHomePageData {
  return {
    servicePortalHomeHeroTitle: undefined,
    servicePortalHomeHeroSubtitle: undefined,
    servicePortalHomeSearchPlaceholder: undefined,
    servicePortalHeaderMenuOptions: undefined,
    servicePortalHeaderNotificationCount: undefined,
    servicePortalHeaderUserInitials: undefined,
    servicePortalHomeColorPrimary: undefined,
    servicePortalHomeColorSecondary: undefined,
    servicePortalHomeColorText: undefined,
    servicePortalHomeColorBackground: undefined,
    servicePortalHomeLogoUrl: undefined,
    servicePortalHomeCoverImageUrl: undefined,
    servicePortalHomeSections: undefined,
    servicePortalCatalogs: undefined,
    servicePortalCatalogServices: undefined,
  }
}

export function clearInlineServicePortalHomeFields(): Partial<FlowStep> {
  return {
    servicePortalHomeHeroTitle: undefined,
    servicePortalHomeHeroSubtitle: undefined,
    servicePortalHomeSearchPlaceholder: undefined,
    servicePortalHeaderMenuOptions: undefined,
    servicePortalHeaderNotificationCount: undefined,
    servicePortalHeaderUserInitials: undefined,
    servicePortalHomeColorPrimary: undefined,
    servicePortalHomeColorSecondary: undefined,
    servicePortalHomeColorText: undefined,
    servicePortalHomeColorBackground: undefined,
    servicePortalHomeLogoUrl: undefined,
    servicePortalHomeCoverImageUrl: undefined,
    servicePortalHomeSections: undefined,
    servicePortalCatalogs: undefined,
    servicePortalCatalogServices: undefined,
  }
}

function normalizeService(raw: ServicePortalCatalogService): ServicePortalCatalogService {
  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? '',
    icon: raw.icon ?? 'description',
  }
}

function normalizeCatalogSection(c: ServicePortalHomeCatalogSection | ServicePortalCatalog): ServicePortalHomeCatalogSection {
  return {
    type: 'catalog',
    id: c.id,
    name: c.name ?? '',
    gridColumns: c.gridColumns,
    gridRows: c.gridRows,
    services: (c.services ?? []).map(normalizeService),
  }
}

function normalizeHtmlSection(s: ServicePortalHomeHtmlSection): ServicePortalHomeHtmlSection {
  return {
    type: 'html',
    id: s.id,
    htmlContent: s.htmlContent,
  }
}

/** Aceita JSON com ou sem `type` (legado de catálogo). */
export function normalizeHomeSection(raw: ServicePortalHomeSection | ServicePortalCatalog): ServicePortalHomeSection {
  if (raw && typeof raw === 'object' && 'type' in raw && raw.type === 'html') {
    return normalizeHtmlSection(raw as ServicePortalHomeHtmlSection)
  }
  return normalizeCatalogSection(raw as ServicePortalHomeCatalogSection)
}

const CATALOG_GRID_COL_DEFAULT = 3
const CATALOG_GRID_COL_MIN = 1
const CATALOG_GRID_COL_MAX = 6
const CATALOG_GRID_ROW_DEFAULT = 2
const CATALOG_GRID_ROW_MIN = 1
const CATALOG_GRID_ROW_MAX = 5

function clampGridInt(
  n: number | undefined,
  min: number,
  max: number,
  fallback: number,
): number {
  if (n == null || Number.isNaN(n)) return fallback
  return Math.min(max, Math.max(min, Math.floor(Number(n))))
}

/** 1–6 colunas da grelha (largura igual por card em todas as linhas). */
export function resolveCatalogMaxColumns(catalog: Pick<ServicePortalHomeCatalogSection, 'gridColumns' | 'gridRows'>): number {
  return clampGridInt(
    catalog.gridColumns,
    CATALOG_GRID_COL_MIN,
    CATALOG_GRID_COL_MAX,
    CATALOG_GRID_COL_DEFAULT,
  )
}

/** 1–5 linhas de exibição no preview (× colunas = teto de serviços). */
export function resolveCatalogMaxRows(catalog: Pick<ServicePortalHomeCatalogSection, 'gridColumns' | 'gridRows'>): number {
  return clampGridInt(
    catalog.gridRows,
    CATALOG_GRID_ROW_MIN,
    CATALOG_GRID_ROW_MAX,
    CATALOG_GRID_ROW_DEFAULT,
  )
}

/** Quantidade máxima de serviços exibidos no catálogo (colunas × linhas). */
export function resolveCatalogDisplayServiceLimit(catalog: Pick<ServicePortalHomeCatalogSection, 'gridColumns' | 'gridRows'>): number {
  return resolveCatalogMaxColumns(catalog) * resolveCatalogMaxRows(catalog)
}

/** Só catálogos legados (`servicePortalCatalogs` / `servicePortalCatalogServices`). */
function getLegacyCatalogRows(src: ServicePortalHomePageData): ServicePortalHomeCatalogSection[] {
  const rawCatalogs = src.servicePortalCatalogs ?? []
  const hasNested = rawCatalogs.some((catalog) => Array.isArray(catalog.services))
  if (hasNested) {
    return rawCatalogs.map((catalog) =>
      normalizeCatalogSection({
        id: catalog.id,
        name: catalog.name,
        gridColumns: catalog.gridColumns,
        gridRows: catalog.gridRows,
        services: (catalog.services ?? []).map(normalizeService),
        type: 'catalog',
      }),
    )
  }
  const legacyServices = src.servicePortalCatalogServices ?? []
  return rawCatalogs.map((catalog) =>
    normalizeCatalogSection({
      id: catalog.id,
      name: catalog.name,
      gridColumns: catalog.gridColumns,
      gridRows: catalog.gridRows,
      type: 'catalog',
      services: legacyServices
        .filter((service) => service.catalogId === catalog.id)
        .map((service) => normalizeService(service)),
    }),
  )
}

/**
 * Seções da página inicial na ordem (catálogo ou HTML).
 * Sem `servicePortalHomeSections`: migra a partir de `servicePortalCatalogs` legado.
 */
export function getServicePortalHomeSections(src: ServicePortalHomePageData): ServicePortalHomeSection[] {
  const raw = src.servicePortalHomeSections
  if (raw && raw.length > 0) {
    return raw.map((s) => normalizeHomeSection(s))
  }
  return getLegacyCatalogRows(src)
}

/** Apenas seções tipo catálogo (útil para migrações ou filtros). */
export function getServicePortalNestedCatalogs(src: ServicePortalHomePageData): ServicePortalHomeCatalogSection[] {
  return getServicePortalHomeSections(src).filter((s): s is ServicePortalHomeCatalogSection => s.type === 'catalog')
}
