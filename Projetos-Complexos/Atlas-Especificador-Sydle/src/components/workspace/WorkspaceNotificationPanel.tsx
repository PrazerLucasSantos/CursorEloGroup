import { useMemo } from 'react'
import type { WorkspaceNotificationItem, WorkspaceNotificationKind } from './workspaceNotificationSamples'

type Tab = 'notifications' | 'alerts'

type Props = {
  items: WorkspaceNotificationItem[]
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onMarkAllRead: () => void
  onClearAll: () => void
  onToggleRead: (id: string) => void
  onDismiss: (id: string) => void
}

function severityIcon(severity: WorkspaceNotificationItem['severity']) {
  if (severity === 'error') return 'error'
  if (severity === 'warning') return 'warning'
  return 'info'
}

function severityClass(severity: WorkspaceNotificationItem['severity']) {
  return `workspace-notif-panel__icon workspace-notif-panel__icon--${severity}`
}

export default function WorkspaceNotificationPanel({
  items,
  activeTab,
  onTabChange,
  onMarkAllRead,
  onClearAll,
  onToggleRead,
  onDismiss,
}: Props) {
  const alertCount = useMemo(() => items.filter((i) => i.kind === 'alert' && !i.read).length, [items])

  const visible = useMemo(() => {
    const kind: WorkspaceNotificationKind = activeTab === 'alerts' ? 'alert' : 'notification'
    return items.filter((i) => i.kind === kind)
  }, [items, activeTab])

  return (
    <div className="workspace-notif-panel" role="dialog" aria-label="Central de notificações">
      <div className="workspace-notif-panel__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'notifications'}
          className={`workspace-notif-panel__tab${activeTab === 'notifications' ? ' workspace-notif-panel__tab--active' : ''}`}
          onClick={() => onTabChange('notifications')}
        >
          Notificações
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'alerts'}
          className={`workspace-notif-panel__tab${activeTab === 'alerts' ? ' workspace-notif-panel__tab--active' : ''}`}
          onClick={() => onTabChange('alerts')}
        >
          Alertas{alertCount > 0 ? ` (${alertCount})` : ''}
        </button>
      </div>

      <div className="workspace-notif-panel__list" role="tabpanel">
        {visible.length === 0 ? (
          <p className="workspace-notif-panel__empty">Nenhuma {activeTab === 'alerts' ? 'alerta' : 'notificação'}.</p>
        ) : (
          visible.map((item) => (
            <article
              key={item.id}
              className={`workspace-notif-panel__item${item.read ? ' workspace-notif-panel__item--read' : ''}`}
            >
              <span className={severityClass(item.severity)} aria-hidden>
                <span className="material-symbols-outlined">{severityIcon(item.severity)}</span>
              </span>
              <div className="workspace-notif-panel__body">
                <div className="workspace-notif-panel__meta">
                  {!item.read ? <span className="workspace-notif-panel__unread" aria-label="Não lida" /> : null}
                  <time className="workspace-notif-panel__time">{item.timestamp}</time>
                  <button
                    type="button"
                    className="workspace-notif-panel__menu"
                    aria-label="Opções"
                    onClick={() => onDismiss(item.id)}
                    title="Remover"
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      more_vert
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  className="workspace-notif-panel__message"
                  onClick={() => onToggleRead(item.id)}
                  title={item.read ? 'Marcar como não lida' : 'Marcar como lida'}
                >
                  {item.message}
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <footer className="workspace-notif-panel__footer">
        <button type="button" className="workspace-notif-panel__footer-btn" onClick={onMarkAllRead}>
          Marcar todas como lidas
        </button>
        <button type="button" className="workspace-notif-panel__footer-btn" onClick={onClearAll}>
          Limpar todas
        </button>
      </footer>
    </div>
  )
}
