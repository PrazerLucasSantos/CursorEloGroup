import { useRef } from 'react'
import type { FlowStep, FormDef, WorkspaceDef } from '../../types'
import FlowStepActivityPreviewDeck from '../FlowStepActivityPreviewDeck'
import WorkspaceExplorer from './WorkspaceExplorer'

export interface FlowWorkspaceActivityCanvasProps {
  step: FlowStep
  workspace: WorkspaceDef
  epicForms: FormDef[]
  /** Seleção da etapa no fluxo ao clicar num método com destino configurado. */
  onNavigateToStep?: (stepId: string) => void
}

/**
 * Preview de etapa workspace: hero, faixa de papel (mesmos campos da sidebar) e Explorer —
 * sem painéis de objetivo/specs BPMN (`showActivityMetadata={false}`).
 */
export default function FlowWorkspaceActivityCanvas({
  step,
  workspace,
  epicForms,
  onNavigateToStep,
}: FlowWorkspaceActivityCanvasProps) {
  const previewScrollRef = useRef<HTMLElement | null>(null)
  const headline = (workspace.name?.trim() || step.title?.trim() || workspace.id).trim()
  const targetsByMethodKey = step.workspaceMethodNavigateStepIds ?? {}
  const presentationDescription = step.workspacePresentationDescription?.trim() ?? ''

  return (
    <FlowStepActivityPreviewDeck
      key={step.id}
      ref={previewScrollRef}
      step={step}
      heroTypeLabel="Workspace"
      heroHeadline={headline}
      sectionAriaLabel={`Workspace: ${headline}`}
      showActivityMetadata={false}
      assigneeSubheroPrefix="Acessado por: "
    >
      <>
        {presentationDescription ? (
          <article
            className="flow-bpmn-preview__panel flow-bpmn-preview__panel--actors"
            aria-label="Descrição do workspace"
          >
            <div className="flow-bpmn-preview__actor-block">
              <span className="flow-bpmn-preview__actor-label">Descrição do workspace</span>
              <p className="flow-bpmn-preview__actor-value flow-bpmn-preview__actor-value--detail">
                {presentationDescription}
              </p>
            </div>
          </article>
        ) : null}
        <div
          className="flow-bpmn-preview__form-frame"
          aria-label={`Preview do workspace: ${headline}`}
        >
          <section className="canvas canvas--viewport-form workspace-canvas">
            <div className="canvas__workspace-viewport">
              <WorkspaceExplorer
                workspace={workspace}
                epicForms={epicForms}
                workspaceMethodNavigate={
                  onNavigateToStep
                    ? { targetsByMethodKey, onNavigateToStep }
                    : undefined
                }
              />
            </div>
          </section>
        </div>
      </>
    </FlowStepActivityPreviewDeck>
  )
}
