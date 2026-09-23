import type { FlowListItem, FlowStep } from '../types'
import type { EpicPresentationBundle } from '../types/epicPresentationBundle'

export const PRESENTATION_EXPORT_VERSION = 1 as const

/** Payload gravado em `presentation.json` junto ao viewer estático (exportação Netlify). */
export type PresentationExportPayload = {
  version: typeof PRESENTATION_EXPORT_VERSION
  meta?: {
    epicName?: string
    flowName?: string
    exportedAt?: string
  }
  bundle: EpicPresentationBundle
  flow: FlowListItem & { steps: FlowStep[] }
  /** Etapa inicial; se omitido, usa a primeira do fluxo. */
  initialStepId?: string
}
