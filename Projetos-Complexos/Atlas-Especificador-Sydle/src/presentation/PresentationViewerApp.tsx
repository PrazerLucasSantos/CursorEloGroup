import { useMemo, useState } from 'react'
import type { FlowStep } from '../types'
import FlowPresentationFullscreen from '../components/FlowPresentationFullscreen'
import FlowPresentationStepCanvas from '../components/FlowPresentationStepCanvas'
import type { PresentationExportPayload } from './presentationExportTypes'

export default function PresentationViewerApp({ payload }: { payload: PresentationExportPayload }) {
  const [activeStepId, setActiveStepId] = useState(() => {
    const init = payload.initialStepId
    if (init && payload.flow.steps.some((s) => s.id === init)) return init
    return payload.flow.steps[0]?.id ?? ''
  })
  const [showSpecs, setShowSpecs] = useState(false)

  const step: FlowStep | null = useMemo(
    () => payload.flow.steps.find((s) => s.id === activeStepId) ?? null,
    [payload.flow.steps, activeStepId],
  )

  return (
    <FlowPresentationFullscreen
      flow={payload.flow}
      activeStepId={activeStepId}
      onSelectStep={setActiveStepId}
      onClose={() => {}}
      stepPreview={
        <FlowPresentationStepCanvas
          bundle={payload.bundle}
          flow={payload.flow}
          step={step}
          showSpecs={showSpecs}
          onToggleSpecs={() => setShowSpecs((v) => !v)}
          onNavigateToStep={(flowId, stepId) => {
            if (flowId === payload.flow.id) setActiveStepId(stepId)
          }}
        />
      }
    />
  )
}
