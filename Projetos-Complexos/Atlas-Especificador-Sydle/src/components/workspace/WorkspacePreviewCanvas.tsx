import type { FormDef, WorkspaceDef } from '../../types'
import WorkspaceExplorer from './WorkspaceExplorer'

interface Props {
  label: string
  workspace: WorkspaceDef
  epicForms: FormDef[]
}

export default function WorkspacePreviewCanvas({ label, workspace, epicForms }: Props) {
  return (
    <section
      className="canvas canvas--viewport-form workspace-canvas"
      aria-label={`Workspace: ${label}`}
    >
      <div className="canvas__workspace-viewport">
        <WorkspaceExplorer workspace={workspace} epicForms={epicForms} />
      </div>
    </section>
  )
}
