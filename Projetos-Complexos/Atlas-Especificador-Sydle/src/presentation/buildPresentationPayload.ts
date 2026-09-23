import type { FlowListItem, FlowStep } from '../types'
import type { EpicPresentationBundle } from '../types/epicPresentationBundle'
import { PRESENTATION_EXPORT_VERSION, type PresentationExportPayload } from './presentationExportTypes'

export function buildPresentationPayload(options: {
  bundle: EpicPresentationBundle
  flow: FlowListItem & { steps: FlowStep[] }
  epicName?: string
  initialStepId?: string
}): PresentationExportPayload {
  const { bundle, flow, epicName, initialStepId } = options
  const firstId = flow.steps[0]?.id
  const initial =
    initialStepId && flow.steps.some((s) => s.id === initialStepId) ? initialStepId : firstId

  return {
    version: PRESENTATION_EXPORT_VERSION,
    meta: {
      epicName,
      flowName: flow.name,
      exportedAt: new Date().toISOString(),
    },
    bundle,
    flow,
    initialStepId: initial,
  }
}
