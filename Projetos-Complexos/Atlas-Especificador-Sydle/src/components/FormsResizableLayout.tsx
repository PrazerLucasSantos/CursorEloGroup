import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

const HANDLE_PX = 1

const MIN_FORM_LIST = 168
const MIN_SIDEBAR = 224
const MIN_CANVAS = 280
const DEFAULT_PANEL_RATIO = 0.2

const DEF_FORM_LIST = 200
const DEF_SIDEBAR = 260

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

interface Props {
  renderFormList: (headerAction: ReactNode) => ReactNode
  showSidebar: boolean
  sidebar: ReactNode
  canvas: ReactNode
}

export default function FormsResizableLayout({
  renderFormList,
  showSidebar,
  sidebar,
  canvas,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [formListW, setFormListW] = useState(DEF_FORM_LIST)
  const [sidebarW, setSidebarW] = useState(DEF_SIDEBAR)
  const defaultsInitializedRef = useRef(false)
  const [dragging, setDragging] = useState<'form' | 'sidebar' | null>(null)
  const dragStartRef = useRef({
    clientX: 0,
    formListW: DEF_FORM_LIST,
    sidebarW: DEF_SIDEBAR,
    showSidebar: true,
  })

  const [formListCollapsed, setFormListCollapsed] = useState(false)

  useEffect(() => {
    if (defaultsInitializedRef.current) return
    const body = bodyRef.current
    if (!body) return

    const bodyW = body.getBoundingClientRect().width
    const desiredForm = Math.round(bodyW * DEFAULT_PANEL_RATIO)
    const desiredSidebar = Math.round(bodyW * DEFAULT_PANEL_RATIO)
    const handlesPx = (showSidebar ? 2 : 1) * HANDLE_PX

    if (showSidebar) {
      const maxFormByDesiredSidebar = Math.max(
        MIN_FORM_LIST,
        bodyW - desiredSidebar - handlesPx - MIN_CANVAS,
      )
      let nextForm = clamp(desiredForm, MIN_FORM_LIST, maxFormByDesiredSidebar)

      const maxSidebar = Math.max(MIN_SIDEBAR, bodyW - nextForm - handlesPx - MIN_CANVAS)
      const nextSidebar = clamp(desiredSidebar, MIN_SIDEBAR, maxSidebar)

      const maxForm = Math.max(MIN_FORM_LIST, bodyW - nextSidebar - handlesPx - MIN_CANVAS)
      nextForm = clamp(nextForm, MIN_FORM_LIST, maxForm)

      setFormListW(Math.round(nextForm))
      setSidebarW(Math.round(nextSidebar))
      defaultsInitializedRef.current = true
    } else {
      const maxForm = Math.max(MIN_FORM_LIST, bodyW - handlesPx - MIN_CANVAS)
      setFormListW(Math.round(clamp(desiredForm, MIN_FORM_LIST, maxForm)))
    }
  }, [showSidebar])

  const onHandleDown = useCallback(
    (kind: 'form' | 'sidebar') => (e: React.PointerEvent) => {
      if (kind === 'sidebar' && !showSidebar) return
      if (kind === 'form' && formListCollapsed) return
      e.preventDefault()
      dragStartRef.current = {
        clientX: e.clientX,
        formListW,
        sidebarW,
        showSidebar,
      }
      setDragging(kind)
    },
    [formListW, sidebarW, showSidebar, formListCollapsed],
  )

  useEffect(() => {
    if (!dragging) return

    const onMove = (e: PointerEvent) => {
      const body = bodyRef.current
      if (!body) return
      const bodyW = body.getBoundingClientRect().width
      const dx = e.clientX - dragStartRef.current.clientX
      const { formListW: f0, sidebarW: s0, showSidebar: sb } = dragStartRef.current
      const handlesPx = (sb ? 2 : 1) * HANDLE_PX

      if (dragging === 'form') {
        if (sb) {
          const maxF = Math.max(MIN_FORM_LIST, bodyW - s0 - handlesPx - MIN_CANVAS)
          setFormListW(Math.round(clamp(f0 + dx, MIN_FORM_LIST, maxF)))
        } else {
          const maxF = Math.max(MIN_FORM_LIST, bodyW - handlesPx - MIN_CANVAS)
          setFormListW(Math.round(clamp(f0 + dx, MIN_FORM_LIST, maxF)))
        }
      } else if (dragging === 'sidebar' && sb) {
        const maxS = Math.max(MIN_SIDEBAR, bodyW - f0 - handlesPx - MIN_CANVAS)
        setSidebarW(Math.round(clamp(s0 + dx, MIN_SIDEBAR, maxS)))
      }
    }

    const onUp = () => {
      setDragging(null)
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
    }
  }, [dragging])

  const chevronLeft = (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="10 3 5 8 10 13" />
    </svg>
  )
  const chevronRight = (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 3 11 8 6 13" />
    </svg>
  )

  const formListAction = (
    <button
      className="col-toggle"
      aria-label="Minimizar lista lateral (formulários, fluxos, portais e workspaces)"
      onClick={() => setFormListCollapsed(true)}
    >
      {chevronLeft}
    </button>
  )

  const formListContent = renderFormList(formListAction)

  return (
    <div ref={bodyRef} className="app-body app-body--forms">
      {formListCollapsed ? (
        <div className="col-collapsed col-collapsed--left">
          <button
            className="col-toggle"
            aria-label="Expandir lista lateral (formulários, fluxos, portais e workspaces)"
            onClick={() => setFormListCollapsed(false)}
          >
            {chevronRight}
          </button>
        </div>
      ) : (
        <>
          <div
            className="form-list-shell"
            style={{ width: formListW, flexShrink: 0 }}
          >
            {formListContent}
          </div>

          <div
            className="resize-handle"
            role="separator"
            aria-orientation="vertical"
            aria-label="Ajustar largura da lista lateral"
            tabIndex={0}
            onPointerDown={onHandleDown('form')}
          />
        </>
      )}

      <div className="forms-workspace forms-workspace--resizable">
        {showSidebar && (
          <>
            <div
              className="sidebar-shell"
              style={{ width: sidebarW, flexShrink: 0 }}
            >
              {sidebar}
            </div>
            <div
              className="resize-handle"
              role="separator"
              aria-orientation="vertical"
              aria-label="Ajustar largura da coluna de campos"
              tabIndex={0}
              onPointerDown={onHandleDown('sidebar')}
            />
          </>
        )}
        <div className="forms-workspace__canvas">{canvas}</div>
      </div>
    </div>
  )
}
