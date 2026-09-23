import type { FormDef, ServicePortalDef, WorkspaceDef } from '../types'

/** Dados do épico necessários para renderizar o preview de uma etapa (build isolado pode serializar isto). */
export interface EpicPresentationBundle {
  forms: FormDef[]
  portals: ServicePortalDef[]
  workspaces: WorkspaceDef[]
}
