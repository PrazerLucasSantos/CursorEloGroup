import { useRef } from 'react'
import type { FlowStep, ServicePortalHomePageData } from '../../types'
import FlowStepActivityPreviewDeck from '../FlowStepActivityPreviewDeck'
import ServicePortalHomePageCanvas from '../ServicePortalHomePageCanvas'

export interface FlowServicePortalHomeActivityCanvasProps {
  step: FlowStep
  data: ServicePortalHomePageData
  /** Nome do portal vinculado ou título da etapa — linha principal do hero. */
  heroHeadline: string
  /** Seleção da etapa no fluxo ao clicar num serviço com destino configurado. */
  onNavigateToStep?: (stepId: string) => void
}

/**
 * Preview da etapa «página inicial» do portal: mesmo deck que workspace (Portal, papel, descrição, canvas).
 */
export default function FlowServicePortalHomeActivityCanvas({
  step,
  data,
  heroHeadline,
  onNavigateToStep,
}: FlowServicePortalHomeActivityCanvasProps) {
  const previewScrollRef = useRef<HTMLElement | null>(null)
  const headline = heroHeadline.trim() || 'Portal'
  const presentationDescription = step.servicePortalPresentationDescription?.trim() ?? ''
  const targetsByServiceId = step.servicePortalServiceNavigateStepIds ?? {}

  return (
    <FlowStepActivityPreviewDeck
      key={step.id}
      ref={previewScrollRef}
      step={step}
      heroTypeLabel="Portal"
      heroHeadline={headline}
      sectionAriaLabel={`Portal: ${headline}`}
      showActivityMetadata={false}
      assigneeSubheroPrefix="Acessado por: "
    >
      <>
        {presentationDescription ? (
          <article
            className="flow-bpmn-preview__panel flow-bpmn-preview__panel--actors"
            aria-label="Descrição do portal"
          >
            <div className="flow-bpmn-preview__actor-block">
              <span className="flow-bpmn-preview__actor-label">Descrição do portal</span>
              <p className="flow-bpmn-preview__actor-value flow-bpmn-preview__actor-value--detail">
                {presentationDescription}
              </p>
            </div>
          </article>
        ) : null}
        <div
          className="flow-bpmn-preview__form-frame"
          aria-label={`Preview do portal: ${headline}`}
        >
          <ServicePortalHomePageCanvas
            label={headline}
            data={data}
            className="service-portal-home-canvas--presentation-step"
            serviceNavigate={
              onNavigateToStep ? { targetsByServiceId, onNavigateToStep } : undefined
            }
          />
        </div>
      </>
    </FlowStepActivityPreviewDeck>
  )
}
