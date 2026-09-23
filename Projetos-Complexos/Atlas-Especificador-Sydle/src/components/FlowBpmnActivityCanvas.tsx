import { useRef } from 'react'
import type { FlowStep, FormDef } from '../types'
import FormCanvas from './FormCanvas'
import FlowStepActivityPreviewDeck from './FlowStepActivityPreviewDeck'
import { flowStepActivityDisplayName } from '../utils/flowStep'

export interface FlowBpmnActivityCanvasProps {
  step: FlowStep
  /** Formulário resolvido por `step.linkedFormId`, se existir no épico. */
  linkedForm: FormDef | undefined
  epicForms: FormDef[]
  showSpecs?: boolean
  /** Alterna o detalhamento dos campos no formulário do preview (mesmo estado que a aba Formulários). */
  onToggleSpecs?: () => void
  /** Navega a seleção do fluxo para outra etapa (preview do botão verde no formulário). */
  onNavigateToStep?: (stepId: string) => void
  /**
   * `method`: etapa «Método» — mesmo preview que BPMN, sem IO/SLA/eventos no detalhamento e rótulo de tipo adequado.
   * Omisso: atividade BPMN clássica.
   */
  presentationVariant?: 'bpmn' | 'method'
}

export default function FlowBpmnActivityCanvas({
  step,
  linkedForm,
  epicForms,
  showSpecs,
  onToggleSpecs,
  onNavigateToStep,
  presentationVariant = 'bpmn',
}: FlowBpmnActivityCanvasProps) {
  const previewScrollRef = useRef<HTMLElement | null>(null)
  const displayName = flowStepActivityDisplayName(step)
  const isMethodStep = presentationVariant === 'method'
  const methodFormType = step.methodFormType === 'output' ? 'output' : 'input'
  const taskKindLabel = step.bpmnTaskType === 'entryForm' ? 'Formulário de entrada' : 'Atividade de usuário'
  const activityTypeLabel = isMethodStep
    ? `Método · ${methodFormType === 'output' ? 'Formulário de saída' : 'Formulário de entrada'}`
    : taskKindLabel
  const renderFormReadOnly = isMethodStep && methodFormType === 'output'
  const missingForm = Boolean(step.linkedFormId) && !linkedForm
  const confirmNavId = step.bpmnFormConfirmNavigateStepId?.trim() ?? ''
  const handleEditConfirm =
    !renderFormReadOnly && confirmNavId && onNavigateToStep ? () => onNavigateToStep(confirmNavId) : undefined

  return (
    <FlowStepActivityPreviewDeck
      key={step.id}
      ref={previewScrollRef}
      step={step}
      heroTypeLabel={activityTypeLabel}
      heroHeadline={displayName}
      sectionAriaLabel={`${presentationVariant === 'method' ? 'Método' : 'Atividade'}: ${displayName}`}
      omitIoSlaEventsFromSpecDetail={presentationVariant === 'method'}
    >
      {linkedForm ? (
        <div
          className="flow-bpmn-preview__form-frame"
          aria-label={`Preview do formulário: ${linkedForm.name}`}
        >
          <p className="flow-bpmn-preview__form-band">Formulário</p>
          <FormCanvas
            key={step.id}
            form={linkedForm}
            epicForms={epicForms}
            showSpecs={showSpecs}
            onToggleSpecs={onToggleSpecs}
            canvasReadOnly={renderFormReadOnly}
            readOnlyViewStyle={renderFormReadOnly ? 'editLike' : 'default'}
            onEditConfirmClick={handleEditConfirm}
            emptyHint="generic"
          />
        </div>
      ) : missingForm ? (
        <div className="flow-bpmn-preview__form-frame flow-bpmn-preview__form-frame--placeholder" role="status">
          <div className="flow-bpmn-preview__form-missing">
            <p>
              O id <code>{step.linkedFormId}</code> não corresponde a nenhum formulário deste épico.
            </p>
          </div>
        </div>
      ) : (
        <div className="flow-bpmn-preview__form-frame flow-bpmn-preview__form-frame--placeholder" role="status">
          <div className="flow-bpmn-preview__form-missing">
            <p>Associe um formulário na configuração da etapa para visualizar o preview aqui.</p>
          </div>
        </div>
      )}
    </FlowStepActivityPreviewDeck>
  )
}
