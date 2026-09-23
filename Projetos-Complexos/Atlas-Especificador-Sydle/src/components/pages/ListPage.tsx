import { useState, useEffect, useRef } from 'react'

interface Item {
  id: string
  name: string
}

interface Props {
  title: string
  items: Item[]
  onSelect: (id: string) => void
  onAdd?: () => void
  onRemove?: (id: string) => void
  onRename?: (id: string) => void
  onRenameTitle?: (name: string) => void
  emptyLabel: string
  addLabel?: string
}

function PencilIcon() {
  return (
    <svg className="list-page__edit-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12.5 3.5l4 4-9 9H3.5v-4l9-9z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M11 5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export default function ListPage({
  title,
  items,
  onSelect,
  onAdd,
  onRemove,
  onRename,
  onRenameTitle,
  emptyLabel,
  addLabel,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [draft, setDraft] = useState(title)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const listWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editingTitle) setDraft(title)
  }, [title, editingTitle])

  useEffect(() => {
    if (openMenuId === null) return
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target
      if (!(t instanceof Node)) return
      const wrap = listWrapRef.current
      if (!wrap || !wrap.contains(t)) {
        setOpenMenuId(null)
        return
      }
      if (!(t instanceof HTMLElement)) return
      if (!t.closest('.list-page__item-menu-wrap')) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [openMenuId])

  function commitTitle() {
    const n = draft.trim()
    if (n && onRenameTitle) onRenameTitle(n)
    else setDraft(title)
    setEditingTitle(false)
  }

  const showItemMenu = Boolean(onRename || onRemove)

  return (
    <div className="list-page">
      <div className="list-page__head">
        {editingTitle && onRenameTitle ? (
          <input
            className="list-page__title-input"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') {
                setDraft(title)
                setEditingTitle(false)
              }
            }}
          />
        ) : (
          <>
            <h2 className="list-page__title">{title}</h2>
            {onRenameTitle && (
              <button
                type="button"
                className="list-page__edit-name"
                aria-label="Editar nome"
                onClick={() => {
                  setDraft(title)
                  setEditingTitle(true)
                }}
              >
                <PencilIcon />
              </button>
            )}
          </>
        )}
      </div>

      {items.length === 0 ? (
        <p className="list-page__empty">{emptyLabel}</p>
      ) : (
        <div className="list-page__list-wrap" ref={listWrapRef}>
          <ul className="list-page__list" role="list">
            {items.map((item) => (
              <li key={item.id} className="list-page__list-item">
                <button
                  type="button"
                  className="list-page__list-item-main"
                  onClick={() => {
                    setOpenMenuId(null)
                    onSelect(item.id)
                  }}
                >
                  <span className="list-page__list-item-name">{item.name}</span>
                </button>
                {showItemMenu ? (
                  <div className="list-page__item-menu-wrap">
                    <button
                      type="button"
                      className="list-page__item-menu-trigger"
                      aria-label={`Opções: ${item.name}`}
                      aria-expanded={openMenuId === item.id}
                      aria-haspopup="menu"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId((v) => (v === item.id ? null : item.id))
                      }}
                    >
                      <span aria-hidden className="list-page__item-menu-dots">
                        ···
                      </span>
                    </button>
                    {openMenuId === item.id ? (
                      <ul className="list-page__item-menu-dropdown" role="menu">
                        {onRename ? (
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              className="list-page__item-menu-option"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(null)
                                onRename(item.id)
                              }}
                            >
                              Renomear
                            </button>
                          </li>
                        ) : null}
                        {onRemove ? (
                          <li role="none">
                            <button
                              type="button"
                              role="menuitem"
                              className="list-page__item-menu-option list-page__item-menu-option--danger"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(null)
                                onRemove(item.id)
                              }}
                            >
                              Excluir
                            </button>
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onAdd && addLabel && (
        <button type="button" className="list-page__add" onClick={onAdd}>
          + {addLabel}
        </button>
      )}
    </div>
  )
}
