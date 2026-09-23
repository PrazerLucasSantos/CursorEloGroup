import { useState } from 'react'
import type {
  FieldType,
  FieldSize,
  FieldRelevance,
  FieldAlertVariant,
  FormDef,
  FormField,
  FormSection,
  FormSectionLayout,
  EmbeddedDisplayMode,
} from '../types'
import {
  FIELD_TYPE_LABELS,
  FIELD_SIZE_LABELS,
  FIELD_RELEVANCE_LABELS,
  fieldSupportsMultiple,
} from '../types'
import FieldTypeIcon from './FieldTypeIcon'
import { getSafeLinkedFormIdsForEmbedded } from '../utils/embeddedFormCycle'
import { trimEmbeddedRowsInActivePreset } from '../utils/formExamplePresets'
import { resolveDemoSelectOptions } from '../utils/demoSelectOptions'

export const FIELD_TYPES_ROOT: FieldType[] = [
  'text', 'number', 'decimal', 'boolean', 'date', 'reference', 'textOptions',
  'embeddedReference', 'file', 'geopoint', 'html', 'alert',
]

const FIELD_SIZES: FieldSize[] = ['small', 'medium', 'large']
const FIELD_RELEVANCES: FieldRelevance[] = ['identity', 'highlight', 'common', 'advanced']

export interface FieldListEditorProps {
  fields: FormField[]
  epicForms: FormDef[]
  currentFormId: string
  onOpenLinkedForm: (formId: string) => void
  onAddField: () => void
  onUpdateField: (id: string, patch: Partial<FormField>) => void
  onRemoveField: (id: string) => void
  onReorderFields: (fromIndex: number, toIndex: number) => void
  controlledOpen?: { openFieldId: string | null; onOpenChange: (id: string | null) => void }
  emptyHint?: string
  addButtonLabel: string
  addButtonClassName: string
  /** Apenas raiz: escolher seção (e sub-seção em abas) de cada campo */
  sectionEditor?: { sections: FormSection[]; sectionLayout: FormSectionLayout }
  /** Ajustes ao formulário completo (ex.: linhas de exemplo ao mudar «múltiplo» em ref. embutida). */
  onMutateForm?: (updater: (form: FormDef) => FormDef) => void
}

function FieldListItem({
  field,
  index,
  isOpen,
  onToggle,
  onUpdateField,
  onRemoveField,
  dragHandleProps,
  isDragging,
  isDragOver,
  sectionEditor,
  epicForms,
  currentFormId,
  onOpenLinkedForm,
  onMutateForm,
}: {
  field: FormField
  index: number
  isOpen: boolean
  onToggle: () => void
  onUpdateField: (id: string, patch: Partial<FormField>) => void
  onRemoveField: (id: string) => void
  dragHandleProps?: {
    draggable: boolean
    onDragStart: (e: React.DragEvent) => void
    onDragEnd: () => void
  }
  isDragging: boolean
  isDragOver: boolean
  sectionEditor?: { sections: FormSection[]; sectionLayout: FormSectionLayout }
  epicForms: FormDef[]
  currentFormId: string
  onOpenLinkedForm: (formId: string) => void
  onMutateForm?: (updater: (form: FormDef) => FormDef) => void
}) {
  const linkableFormsForEmbedded =
    field.type === 'embeddedReference'
      ? getSafeLinkedFormIdsForEmbedded(epicForms, currentFormId, field.id)
      : epicForms.filter((f) => f.id !== currentFormId)
  const linkedFormInvalid =
    field.type === 'embeddedReference' &&
    !!field.linkedFormId &&
    !linkableFormsForEmbedded.some((f) => f.id === field.linkedFormId)

  return (
    <div
      className={`acc${isOpen ? ' acc--open' : ''}${isDragging ? ' acc--dragging' : ''}${isDragOver ? ' acc--drag-over' : ''}`}
      data-index={index}
    >
      <button
        className="acc__header"
        onClick={onToggle}
        type="button"
        aria-label={`${field.label || 'Sem nome'}, ${FIELD_TYPE_LABELS[field.type]}`}
      >
        {dragHandleProps && (
          <span
            className="acc__drag-handle"
            {...dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            title="Arrastar para reordenar"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <circle cx="5.5" cy="3.5" r="1.25" />
              <circle cx="10.5" cy="3.5" r="1.25" />
              <circle cx="5.5" cy="8" r="1.25" />
              <circle cx="10.5" cy="8" r="1.25" />
              <circle cx="5.5" cy="12.5" r="1.25" />
              <circle cx="10.5" cy="12.5" r="1.25" />
            </svg>
          </span>
        )}
        <span className="acc__header-main">
          <FieldTypeIcon type={field.type} className="acc__type-icon" />
          <span className="acc__name">{field.label || 'Sem nome'}</span>
        </span>
        <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="acc__body">
          <label className="acc__field">
            <span className="acc__label">Nome</span>
            <input
              type="text"
              className="acc__input"
              value={field.label}
              onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
            />
          </label>

          {sectionEditor && (() => {
            const tops = sectionEditor.sections.filter((s) => !s.parentSectionId)
            const sid = field.sectionId
            const tabId =
              sid && tops.some((t) => t.id === sid)
                ? sid
                : (() => {
                    const sub = sectionEditor.sections.find((s) => s.id === sid)
                    const p = sub?.parentSectionId
                    return p && tops.some((t) => t.id === p) ? p : (tops[0]?.id ?? '')
                  })()
            const subChoices = sectionEditor.sections.filter((s) => s.parentSectionId === tabId)
            const showSub =
              sectionEditor.sectionLayout === 'tabs' && tabId && subChoices.length > 0
            const subValue =
              sid && subChoices.some((s) => s.id === sid) ? sid : '__direct__'
            const sectionLabel =
              sectionEditor.sectionLayout === 'tabs' ? 'Aba' : 'Seção'
            return (
              <>
                <label className="acc__field">
                  <span className="acc__label">{sectionLabel}</span>
                  <select
                    className="acc__input acc__select"
                    value={tabId}
                    onChange={(e) => {
                      const newTab = e.target.value
                      onUpdateField(field.id, { sectionId: newTab || undefined })
                    }}
                  >
                    {tops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </label>
                {showSub && (
                  <label className="acc__field">
                    <span className="acc__label">Sub-seção</span>
                    <select
                      className="acc__input acc__select"
                      value={subValue}
                      onChange={(e) => {
                        const v = e.target.value
                        onUpdateField(field.id, {
                          sectionId: v === '__direct__' ? tabId : v,
                        })
                      }}
                    >
                      <option value="__direct__">Direto na aba</option>
                      {subChoices.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )
          })()}

          <label className="acc__field">
            <span className="acc__label">Tipo</span>
            <select
              className="acc__input acc__select"
              value={field.type}
              onChange={(e) => {
                const nextType = e.target.value as FieldType
                const patch: Partial<FormField> = { type: nextType }
                if (!fieldSupportsMultiple(nextType)) patch.multiple = false
                if (nextType === 'embeddedReference') {
                  patch.embeddedDisplay = field.embeddedDisplay ?? 'form'
                  patch.embeddedRoot = field.embeddedRoot ?? false
                  const safe = getSafeLinkedFormIdsForEmbedded(
                    epicForms,
                    currentFormId,
                    field.id,
                  )
                  patch.linkedFormId =
                    field.linkedFormId && safe.some((s) => s.id === field.linkedFormId)
                      ? field.linkedFormId
                      : safe[0]?.id
                } else {
                  patch.linkedFormId = undefined
                  patch.embeddedDisplay = undefined
                  patch.embeddedRoot = undefined
                }
                if (nextType === 'textOptions' && !(field.options?.length)) {
                  patch.options = resolveDemoSelectOptions({
                    options: [],
                    label: field.label || 'Lista',
                  })
                }
                if (nextType === 'alert') {
                  patch.alertVariant = 'warning'
                  patch.alertTitle = field.alertTitle ?? 'Título'
                  patch.alertMessage = field.alertMessage ?? 'Mensagem'
                  patch.alertCollapsible = field.alertCollapsible ?? false
                  patch.htmlContent = undefined
                }
                if (field.type === 'alert' && nextType !== 'alert') {
                  patch.alertVariant = undefined
                  patch.alertTitle = undefined
                  patch.alertMessage = undefined
                  patch.alertCollapsible = undefined
                }
                onUpdateField(field.id, patch)
              }}
            >
              {FIELD_TYPES_ROOT.map((t) => (
                <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </label>

          {field.type === 'text' && (
            <label className="acc__field acc__field--row">
              <span className="acc__label">Texto longo</span>
              <button
                type="button"
                className={`acc__toggle ${field.textLong ? 'acc__toggle--on' : ''}`}
                onClick={() => onUpdateField(field.id, { textLong: !field.textLong })}
                role="switch"
                aria-checked={!!field.textLong}
              >
                <span className="acc__toggle-thumb" />
              </button>
            </label>
          )}

          {field.type === 'decimal' && (
            <label className="acc__field acc__field--row">
              <span className="acc__label">Moeda</span>
              <button
                type="button"
                className={`acc__toggle ${field.currency ? 'acc__toggle--on' : ''}`}
                onClick={() => onUpdateField(field.id, { currency: !field.currency })}
                role="switch"
                aria-checked={!!field.currency}
              >
                <span className="acc__toggle-thumb" />
              </button>
            </label>
          )}

          <label className="acc__field">
            <span className="acc__label">Relevância</span>
            <select
              className="acc__input acc__select"
              value={field.relevance}
              onChange={(e) => onUpdateField(field.id, { relevance: e.target.value as FieldRelevance })}
            >
              {FIELD_RELEVANCES.map((r) => (
                <option key={r} value={r}>{FIELD_RELEVANCE_LABELS[r]}</option>
              ))}
            </select>
          </label>

          <div className="acc__field">
            <span className="acc__label">Tamanho</span>
            <div className="acc__sizes">
              {FIELD_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`acc__size-btn ${field.size === s ? 'acc__size-btn--active' : ''}`}
                  onClick={() => onUpdateField(field.id, { size: s })}
                >
                  {FIELD_SIZE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <label className="acc__field acc__field--row">
            <span className="acc__label">Somente leitura</span>
            <button
              type="button"
              className={`acc__toggle ${field.readOnly ? 'acc__toggle--on' : ''}`}
              onClick={() => onUpdateField(field.id, { readOnly: !field.readOnly })}
              role="switch"
              aria-checked={field.readOnly}
            >
              <span className="acc__toggle-thumb" />
            </button>
          </label>

          <label className="acc__field acc__field--row">
            <span className="acc__label">Oculto</span>
            <button
              type="button"
              className={`acc__toggle ${field.hidden ? 'acc__toggle--on' : ''}`}
              onClick={() => onUpdateField(field.id, { hidden: !field.hidden })}
              role="switch"
              aria-checked={!!field.hidden}
            >
              <span className="acc__toggle-thumb" />
            </button>
          </label>

          <label className="acc__field acc__field--row">
            <span className="acc__label">Obrigatório</span>
            <button
              type="button"
              className={`acc__toggle ${field.required ? 'acc__toggle--on' : ''}`}
              onClick={() => onUpdateField(field.id, { required: !field.required })}
              role="switch"
              aria-checked={field.required}
            >
              <span className="acc__toggle-thumb" />
            </button>
          </label>

          {fieldSupportsMultiple(field.type) && (
            <label className="acc__field acc__field--row">
              <span className="acc__label">Múltiplo</span>
              <button
                type="button"
                className={`acc__toggle ${field.multiple ? 'acc__toggle--on' : ''}`}
                onClick={() => {
                  const nextMultiple = !field.multiple
                  const patch: Partial<FormField> = { multiple: nextMultiple }
                  if (field.type === 'embeddedReference') {
                    if (!nextMultiple) {
                      patch.embeddedDisplay = 'form'
                      onMutateForm?.((f0) => trimEmbeddedRowsInActivePreset(f0, field.id, 1))
                    } else {
                      patch.embeddedRoot = false
                    }
                  }
                  onUpdateField(field.id, patch)
                }}
                role="switch"
                aria-checked={field.multiple}
              >
                <span className="acc__toggle-thumb" />
              </button>
            </label>
          )}

          {(field.type === 'reference' || field.type === 'textOptions') && (
            <div className="acc__field">
              <span className="acc__label">Opções</span>
              <div className="acc__options-list">
                {(field.options ?? []).map((opt, i) => (
                  <div key={i} className="acc__option-row">
                    <input
                      type="text"
                      className="acc__input acc__option-input"
                      value={opt}
                      onChange={(e) => {
                        const next = [...(field.options ?? [])]
                        next[i] = e.target.value
                        onUpdateField(field.id, { options: next })
                      }}
                    />
                    <button
                      type="button"
                      className="acc__option-remove"
                      onClick={() => {
                        const next = (field.options ?? []).filter((_, j) => j !== i)
                        onUpdateField(field.id, { options: next })
                      }}
                      aria-label="Remover opção"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="acc__option-add"
                  onClick={() => {
                    const next = [...(field.options ?? []), `Opção ${(field.options ?? []).length + 1}`]
                    onUpdateField(field.id, { options: next })
                  }}
                >
                  + Adicionar opção
                </button>
              </div>
            </div>
          )}

          {field.type === 'html' && (
            <label className="acc__field">
              <span className="acc__label">Conteúdo HTML</span>
              <textarea
                className="acc__input acc__textarea"
                rows={6}
                value={field.htmlContent ?? ''}
                onChange={(e) => onUpdateField(field.id, { htmlContent: e.target.value })}
                placeholder="<p>Seu HTML aqui...</p>"
                spellCheck={false}
              />
            </label>
          )}

          {field.type === 'alert' && (
            <>
              <label className="acc__field">
                <span className="acc__label">Variante</span>
                <select
                  className="acc__input acc__select"
                  value={field.alertVariant ?? 'warning'}
                  onChange={(e) =>
                    onUpdateField(field.id, {
                      alertVariant: e.target.value as FieldAlertVariant,
                    })
                  }
                >
                  <option value="warning">Aviso</option>
                  <option value="error">Erro</option>
                  <option value="info">Informação</option>
                  <option value="success">Sucesso</option>
                </select>
              </label>
              <label className="acc__field">
                <span className="acc__label">Título</span>
                <input
                  type="text"
                  className="acc__input"
                  value={field.alertTitle ?? ''}
                  onChange={(e) => onUpdateField(field.id, { alertTitle: e.target.value })}
                  spellCheck={false}
                />
              </label>
              <label className="acc__field">
                <span className="acc__label">Mensagem</span>
                <textarea
                  className="acc__input acc__textarea"
                  rows={3}
                  value={field.alertMessage ?? ''}
                  onChange={(e) => onUpdateField(field.id, { alertMessage: e.target.value })}
                  spellCheck={false}
                />
              </label>
              <label className="acc__field acc__field--row">
                <span className="acc__label">Colapsável</span>
                <button
                  type="button"
                  className={`acc__toggle ${field.alertCollapsible ? 'acc__toggle--on' : ''}`}
                  onClick={() =>
                    onUpdateField(field.id, { alertCollapsible: !field.alertCollapsible })
                  }
                  role="switch"
                  aria-checked={!!field.alertCollapsible}
                >
                  <span className="acc__toggle-thumb" />
                </button>
              </label>
            </>
          )}

          {field.type === 'embeddedReference' && field.multiple && (
            <label className="acc__field">
              <span className="acc__label">Visualização no canvas</span>
              <select
                className="acc__input acc__select"
                value={field.embeddedDisplay ?? 'form'}
                onChange={(e) =>
                  onUpdateField(field.id, { embeddedDisplay: e.target.value as EmbeddedDisplayMode })
                }
              >
                <option value="form">Formulário</option>
                <option value="table">Tabela</option>
              </select>
            </label>
          )}

          {field.type === 'embeddedReference' && !field.multiple && (
            <label className="acc__field acc__field--row">
              <span className="acc__label">Raiz</span>
              <button
                type="button"
                className={`acc__toggle ${field.embeddedRoot ? 'acc__toggle--on' : ''}`}
                onClick={() => onUpdateField(field.id, { embeddedRoot: !field.embeddedRoot })}
                role="switch"
                aria-checked={!!field.embeddedRoot}
              >
                <span className="acc__toggle-thumb" />
              </button>
            </label>
          )}

          {field.type === 'embeddedReference' && (
            <div className="acc__field acc__nested-section">
              <span className="acc__label">Formulário vinculado</span>
              <p className="acc__nested-hint">
                Os campos deste bloco vêm de outro formulário do mesmo épico. Crie um formulário
                adicional na lista à esquerda e selecione-o aqui.
              </p>
              {linkableFormsForEmbedded.length === 0 && !linkedFormInvalid ? (
                <p className="acc__nested-hint acc__nested-hint--demo-skip">
                  Crie outro formulário no épico para poder vincular, ou todos os vínculos possíveis
                  formariam referência cíclica.
                </p>
              ) : (
                <>
                  {linkedFormInvalid ? (
                    <p className="acc__nested-hint acc__nested-hint--demo-skip">
                      O vínculo atual forma um ciclo (ou é inválido). Escolha outro formulário abaixo.
                    </p>
                  ) : null}
                  <label className="acc__field acc__field--compact-demo">
                    <span className="acc__label">Formulário</span>
                    <select
                      className="acc__input acc__select"
                      value={field.linkedFormId ?? ''}
                      onChange={(e) =>
                        onUpdateField(field.id, {
                          linkedFormId: e.target.value ? e.target.value : undefined,
                        })
                      }
                    >
                      <option value="">(selecione)</option>
                      {linkedFormInvalid && field.linkedFormId ? (
                        <option value={field.linkedFormId} disabled>
                          (vínculo inválido — ciclo)
                        </option>
                      ) : null}
                      {linkableFormsForEmbedded.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {field.linkedFormId ? (
                    <button
                      type="button"
                      className="acc__nested-add"
                      onClick={() => onOpenLinkedForm(field.linkedFormId!)}
                    >
                      Abrir formulário vinculado
                    </button>
                  ) : null}
                </>
              )}
            </div>
          )}

          <label className="acc__field">
            <span className="acc__label">Detalhamento</span>
            <textarea
              className="acc__input acc__textarea acc__textarea--spec"
              rows={4}
              value={field.spec ?? ''}
              onChange={(e) => onUpdateField(field.id, { spec: e.target.value })}
              placeholder="Regras de negócio, validações, observações..."
              spellCheck={false}
            />
          </label>

          <button type="button" className="acc__remove" onClick={() => onRemoveField(field.id)}>
            Remover campo
          </button>
        </div>
      )}
    </div>
  )
}

export default function FieldListEditor({
  fields,
  epicForms,
  currentFormId,
  onOpenLinkedForm,
  onAddField,
  onUpdateField,
  onRemoveField,
  onReorderFields,
  controlledOpen,
  emptyHint,
  addButtonLabel,
  addButtonClassName,
  sectionEditor,
  onMutateForm,
}: FieldListEditorProps) {
  const [internalOpenId, setInternalOpenId] = useState<string | null>(null)
  const openFieldId = controlledOpen ? controlledOpen.openFieldId : internalOpenId

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const withDrag = true

  function toggleOpen(fieldId: string) {
    if (controlledOpen) {
      controlledOpen.onOpenChange(openFieldId === fieldId ? null : fieldId)
    } else {
      setInternalOpenId((prev) => (prev === fieldId ? null : fieldId))
    }
  }

  function handleDragStart(index: number, e: React.DragEvent) {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  function handleDragEnd() {
    setDragIndex(null)
    setOverIndex(null)
  }

  function handleDragOver(index: number, e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (overIndex !== index) setOverIndex(index)
  }

  function handleDrop(index: number, e: React.DragEvent) {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== index) {
      onReorderFields(dragIndex, index)
    }
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <>
      <div className="sidebar__list">
        {emptyHint && fields.length === 0 && (
          <p className="sidebar__empty">{emptyHint}</p>
        )}
        {fields.map((field, i) => (
          <div
            key={field.id}
            onDragOver={withDrag ? (e) => handleDragOver(i, e) : undefined}
            onDrop={withDrag ? (e) => handleDrop(i, e) : undefined}
          >
            <FieldListItem
              field={field}
              index={i}
              isOpen={openFieldId === field.id}
              onToggle={() => toggleOpen(field.id)}
              onUpdateField={onUpdateField}
              onRemoveField={onRemoveField}
              sectionEditor={sectionEditor}
              epicForms={epicForms}
              currentFormId={currentFormId}
              onOpenLinkedForm={onOpenLinkedForm}
              onMutateForm={onMutateForm}
              dragHandleProps={
                withDrag
                  ? {
                      draggable: true,
                      onDragStart: (e) => handleDragStart(i, e),
                      onDragEnd: handleDragEnd,
                    }
                  : undefined
              }
              isDragging={dragIndex === i}
              isDragOver={overIndex === i && dragIndex !== i && withDrag}
            />
          </div>
        ))}
        <button type="button" className={addButtonClassName} onClick={() => onAddField()}>
          <span className="sidebar__add-icon">+</span>
          {addButtonLabel}
        </button>
      </div>
    </>
  )
}
