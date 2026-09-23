import type { FlowListItem, FlowStep } from '../types'
import type { EpicPresentationBundle } from '../types/epicPresentationBundle'
import { resolvedActivityType } from '../utils/flowStep'
import {
  hasInlineServicePortalHomeContent,
  resolveServicePortalHomePageData,
} from '../utils/servicePortalHomeData'
import eloGroupLogo from '../assets/elo-group-logo.svg'
import FlowBpmnActivityCanvas from './FlowBpmnActivityCanvas'
import FlowClassActivityCanvas from './FlowClassActivityCanvas'
import FlowWorkspaceActivityCanvas from './workspace/FlowWorkspaceActivityCanvas'
import FlowServicePortalHomeActivityCanvas from './servicePortal/FlowServicePortalHomeActivityCanvas'
import { resolveFlowHtmlDocumentTemplate } from '../utils/flowHtmlDocumentTemplate'

export interface FlowPresentationStepCanvasProps {
  bundle: EpicPresentationBundle
  flow: (FlowListItem & { steps: FlowStep[] }) | null
  step: FlowStep | null
  showSpecs: boolean
  onToggleSpecs: () => void
  onNavigateToStep: (flowId: string, stepId: string) => void
}

/**
 * Preview de uma etapa de apresentação (mesmo conteúdo que o canvas principal na aba Apresentações).
 */
export default function FlowPresentationStepCanvas({
  bundle,
  flow,
  step,
  showSpecs,
  onToggleSpecs,
  onNavigateToStep,
}: FlowPresentationStepCanvasProps) {
  const { forms: epicForms, portals: epicPortals, workspaces: epicWorkspaces } = bundle

  if (!step || !flow) {
    return (
      <section className="canvas canvas--empty flow-canvas" aria-label="Preview da apresentação">
        <div className="canvas__placeholder">
          <span className="canvas__placeholder-icon">🔀</span>
          <p className="canvas__placeholder-title">Apresentações</p>
          <p className="canvas__placeholder-hint">Selecione uma etapa na lista para ver o preview.</p>
        </div>
      </section>
    )
  }

  const canvasFlow = flow
  const canvasStep = step
  const resolvedFlow = resolvedActivityType(canvasStep)

  if (resolvedFlow === 'bpmnActivity' || resolvedFlow === 'method') {
    const linkedForm = epicForms.find((f) => f.id === canvasStep.linkedFormId)
    return (
      <FlowBpmnActivityCanvas
        step={canvasStep}
        linkedForm={linkedForm}
        epicForms={epicForms}
        showSpecs={showSpecs}
        onToggleSpecs={onToggleSpecs}
        onNavigateToStep={(nextStepId) => onNavigateToStep(canvasFlow.id, nextStepId)}
        presentationVariant={resolvedFlow === 'method' ? 'method' : 'bpmn'}
      />
    )
  }

  if (resolvedFlow === 'servicePortal' && canvasStep.servicePortalSubtype === 'homePage') {
    const linkedPid = canvasStep.linkedServicePortalId?.trim() ?? ''
    const linkedPortal = linkedPid ? epicPortals.find((p) => p.id === linkedPid) : undefined
    const hasInline = hasInlineServicePortalHomeContent(canvasStep)
    if (!linkedPortal && !hasInline) {
      return (
        <section className="canvas canvas--empty flow-canvas" aria-label="Preview do portal">
          <div className="canvas__placeholder">
            <span className="canvas__placeholder-icon">🛎️</span>
            <p className="canvas__placeholder-title">Portal de serviços</p>
            <p className="canvas__placeholder-hint">
              {linkedPid
                ? 'O portal vinculado não existe neste épico. Escolha outro na configuração da etapa.'
                : 'Na coluna de configuração, vincule um portal do épico para ver a página inicial aqui.'}
            </p>
          </div>
        </section>
      )
    }
    const homeData = resolveServicePortalHomePageData(canvasStep, epicPortals)
    const heroHeadline =
      linkedPortal?.name?.trim() ||
      canvasStep.title?.trim() ||
      linkedPortal?.id ||
      linkedPid ||
      canvasStep.id ||
      'Portal'
    return (
      <FlowServicePortalHomeActivityCanvas
        step={canvasStep}
        data={homeData}
        heroHeadline={heroHeadline}
        onNavigateToStep={(nextStepId) => onNavigateToStep(canvasFlow.id, nextStepId)}
      />
    )
  }

  if (resolvedFlow === 'workspace') {
    const wid = canvasStep.linkedWorkspaceId?.trim() ?? ''
    const ws = wid ? epicWorkspaces.find((w) => w.id === wid) : undefined
    if (ws) {
      return (
        <FlowWorkspaceActivityCanvas
          step={canvasStep}
          workspace={ws}
          epicForms={epicForms}
          onNavigateToStep={(nextStepId) => onNavigateToStep(canvasFlow.id, nextStepId)}
        />
      )
    }
    return (
      <section className="canvas canvas--empty flow-canvas" aria-label="Preview do workspace">
        <div className="canvas__placeholder">
          <span className="canvas__placeholder-icon">🗂️</span>
          <p className="canvas__placeholder-title">Workspace</p>
          <p className="canvas__placeholder-hint">
            {wid
              ? 'O workspace vinculado não existe neste épico. Escolha outro na configuração da etapa.'
              : 'Na coluna de configuração, vincule um workspace do épico para ver o Explorer aqui.'}
          </p>
        </div>
      </section>
    )
  }

  if (resolvedFlow === 'class') {
    const linkedForm = epicForms.find((f) => f.id === canvasStep.linkedFormId)
    return (
      <FlowClassActivityCanvas
        step={canvasStep}
        linkedForm={linkedForm}
        epicForms={epicForms}
        showSpecs={showSpecs}
        onToggleSpecs={onToggleSpecs}
        onNavigateToStep={(nextStepId) => onNavigateToStep(canvasFlow.id, nextStepId)}
      />
    )
  }

  if (resolvedFlow !== 'html') {
    return (
      <section className="canvas canvas--empty flow-canvas" aria-label="Preview da apresentação">
        <div className="canvas__placeholder">
          <span className="canvas__placeholder-icon">🔀</span>
          <p className="canvas__placeholder-title">Preview</p>
          <p className="canvas__placeholder-hint">Preview para este tipo de etapa ainda não está disponível.</p>
        </div>
      </section>
    )
  }

  const linkedDocForm = canvasStep.linkedFormId
    ? epicForms.find((f) => f.id === canvasStep.linkedFormId)
    : undefined
  const html = resolveFlowHtmlDocumentTemplate(canvasStep.htmlContent ?? '', linkedDocForm)
  const showPresentationHeader = canvasStep.htmlPresentationShowHeader === true
  const headerTitle =
    canvasStep.htmlPresentationHeaderTitle?.trim() ||
    canvasStep.title?.trim() ||
    canvasFlow.name?.trim() ||
    'Conteúdo'

  const htmlEmpty = !html.trim()
  if (htmlEmpty && !showPresentationHeader) {
    return (
      <section className="canvas canvas--empty flow-canvas" aria-label="Preview HTML">
        <div className="canvas__placeholder">
          <span className="canvas__placeholder-icon">📄</span>
          <p className="canvas__placeholder-title">HTML vazio</p>
          <p className="canvas__placeholder-hint">
            Defina o conteúdo HTML na coluna de configuração para visualizar aqui.
          </p>
        </div>
      </section>
    )
  }

  const hero = showPresentationHeader ? (
    <header className="flow-bpmn-preview__hero" role="banner">
      <div className="flow-bpmn-preview__hero-inner">
        <div className="flow-bpmn-preview__hero-titles flow-bpmn-preview__hero-titles--single">
          <h1 className="flow-bpmn-preview__headline">{headerTitle}</h1>
        </div>
        <img src={eloGroupLogo} alt="Logo EloGroup" className="flow-bpmn-preview__hero-logo" />
      </div>
    </header>
  ) : null

  if (showPresentationHeader) {
    return (
      <section
        className="canvas flow-bpmn-preview flow-canvas-html flow-canvas-html--deck"
        aria-label={`Preview HTML: ${canvasFlow.name} — ${canvasStep.title}`}
      >
        <div className="flow-bpmn-preview__deck">
          {hero}
          <div className="flow-canvas-html flow-canvas-html--below-hero">
            {htmlEmpty ? (
              <div className="canvas__placeholder canvas__placeholder--in-html-deck">
                <span className="canvas__placeholder-icon">📄</span>
                <p className="canvas__placeholder-title">HTML vazio</p>
                <p className="canvas__placeholder-hint">
                  O header está activo; adicione HTML no editor para preencher esta área.
                </p>
              </div>
            ) : (
              <div className="flow-canvas-html__inner" dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="canvas flow-canvas-html"
      aria-label={`Preview HTML: ${canvasFlow.name} — ${canvasStep.title}`}
    >
      <div className="flow-canvas-html__inner" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  )
}
