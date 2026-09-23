import { useEffect, useId, type ReactNode } from 'react'
import type { FlowListItem, FlowStep } from '../types'
import { flowStepTypeDisplayLabel } from '../utils/flowStep'

export interface FlowPresentationFullscreenProps {
  flow: FlowListItem & { steps: FlowStep[] }
  activeStepId: string
  onSelectStep: (stepId: string) => void
  onClose: () => void
  /** Preview já montado pelo pai (ex.: FlowPresentationStepCanvas). */
  stepPreview: ReactNode
}

export default function FlowPresentationFullscreen({
  flow,
  activeStepId,
  onSelectStep,
  onClose,
  stepPreview,
}: FlowPresentationFullscreenProps) {
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div
      className="flow-presentation-fs"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <aside className="flow-presentation-fs__sidebar" aria-label="Etapas da apresentação">
        <div className="flow-presentation-fs__sidebar-head">
          <button type="button" className="flow-presentation-fs__close" onClick={onClose} aria-label="Fechar apresentação">
            ×
          </button>
          <h2 id={titleId} className="flow-presentation-fs__title">
            {flow.name}
          </h2>
        </div>
        <nav className="flow-presentation-fs__nav" aria-label="Lista de etapas">
          <ol className="flow-presentation-fs__steps">
            {flow.steps.map((s, i) => {
              const active = s.id === activeStepId
              const typeLabel = flowStepTypeDisplayLabel(s)
              return (
                <li key={s.id} className="flow-presentation-fs__step-li">
                  <button
                    type="button"
                    className={`flow-presentation-fs__step${active ? ' flow-presentation-fs__step--active' : ''}`}
                    onClick={() => onSelectStep(s.id)}
                  >
                    <span className="flow-presentation-fs__step-num" aria-hidden>
                      {i + 1}
                    </span>
                    <span className="flow-presentation-fs__step-text">
                      <span className="flow-presentation-fs__step-title">{s.title}</span>
                      <span className="flow-presentation-fs__step-type">{typeLabel}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      </aside>
      <div className="flow-presentation-fs__main">{stepPreview}</div>
    </div>
  )
}
