import { useRef } from 'react'
import type { FlowStep, FormDef } from '../types'
import FlowStepActivityPreviewDeck from './FlowStepActivityPreviewDeck'
import FormCanvas from './FormCanvas'

export interface FlowClassActivityCanvasProps {
  step: FlowStep
  linkedForm: FormDef | undefined
  epicForms: FormDef[]
  showSpecs?: boolean
  onToggleSpecs?: () => void
  /** Navegação por prototipação ao clicar num método (modo leitura). */
  onNavigateToStep?: (stepId: string) => void
}

export default function FlowClassActivityCanvas({
  step,
  linkedForm,
  epicForms,
  showSpecs,
  onToggleSpecs,
  onNavigateToStep,
}: FlowClassActivityCanvasProps) {
  const previewScrollRef = useRef<HTMLElement | null>(null)
  const headline =
    step.classPresentationTitle?.trim() ||
    step.title?.trim() ||
    linkedForm?.name?.trim() ||
    'Classe'
  const classDescription = step.classPresentationDescription?.trim() ?? ''
  const missingForm = Boolean(step.linkedFormId?.trim()) && !linkedForm
  const targetsByMethodId = step.classMethodNavigateStepIds ?? {}
  const handleMethodClick =
    onNavigateToStep != null
      ? (methodId: string) => {
          const nextId = targetsByMethodId[methodId]?.trim()
          if (nextId) onNavigateToStep(nextId)
        }
      : undefined

  return (
    <FlowStepActivityPreviewDeck
      key={step.id}
      ref={previewScrollRef}
      step={step}
      heroTypeLabel="Classe"
      heroHeadline={headline}
      sectionAriaLabel={`Classe: ${headline}`}
      showAssigneeSubhero={false}
      showActivityMetadata={false}
    >
      <>
        {classDescription ? (
          <article className="flow-bpmn-preview__panel flow-bpmn-preview__panel--actors" aria-label="Descrição da classe">
            <div className="flow-bpmn-preview__actor-block">
              <span className="flow-bpmn-preview__actor-label">Descrição da classe</span>
              <p className="flow-bpmn-preview__actor-value flow-bpmn-preview__actor-value--detail">
                {classDescription}
              </p>
            </div>
          </article>
        ) : null}
        {linkedForm ? (
          <div className="flow-bpmn-preview__form-frame" aria-label={`Preview da classe: ${linkedForm.name}`}>
            <p className="flow-bpmn-preview__form-band">Classe</p>
            <FormCanvas
              key={step.id}
              form={linkedForm}
              epicForms={epicForms}
              showSpecs={showSpecs}
              onToggleSpecs={onToggleSpecs}
              canvasReadOnly
              onReadModeMethodClick={handleMethodClick}
              emptyHint="generic"
            />
          </div>
        ) : missingForm ? (
          <div className="flow-bpmn-preview__form-frame flow-bpmn-preview__form-frame--placeholder" role="status">
            <div className="flow-bpmn-preview__form-missing">
              <p>
                O id <code>{step.linkedFormId}</code> não corresponde a nenhuma classe deste épico.
              </p>
            </div>
          </div>
        ) : (
          <div className="flow-bpmn-preview__form-frame flow-bpmn-preview__form-frame--placeholder" role="status">
            <div className="flow-bpmn-preview__form-missing">
              <p>Associe um formulário na configuração da etapa para visualizar a classe em modo leitura.</p>
            </div>
          </div>
        )}
      </>
    </FlowStepActivityPreviewDeck>
  )
}
