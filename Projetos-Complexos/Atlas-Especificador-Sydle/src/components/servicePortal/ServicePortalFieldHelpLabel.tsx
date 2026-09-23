import type { ReactNode } from 'react'

interface Props {
  id: string
  label: string
  help: string
  openId: string | null
  onToggle: (id: string) => void
  children: ReactNode
}

export default function ServicePortalFieldHelpLabel({ id, label, help, openId, onToggle, children }: Props) {
  const isOpen = openId === id
  return (
    <label className="acc__field">
      <span className="acc__label flow-step-config__label-help">
        <span className="flow-step-config__label-help-head">
          <span>{label}</span>
          <button
            type="button"
            className="flow-step-config__help"
            onClick={() => onToggle(id)}
            aria-label={`Ajuda sobre ${label}`}
            aria-expanded={isOpen}
            aria-controls={`help-${id}`}
          >
            ?
          </button>
        </span>
        {isOpen ? (
          <span id={`help-${id}`} className="flow-step-config__help-card" role="note">
            {help}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  )
}
