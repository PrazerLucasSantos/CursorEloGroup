import { useState, useEffect, useCallback, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { EmbeddedDemoRow, FieldSize, FormDef, FormField } from '../types'
import { SIZE_SPAN, fieldSupportsMultiple } from '../types'
import {
  useCanvasFieldRuleReadOnlyOverlay,
  useCanvasFieldVisible,
  useEmbeddedTableVisibleNestedFields,
} from '../hooks/useCanvasFieldVisible'
import {
  embeddedCanvasInstanceCount,
  resolveNestedFieldForDemo,
  rowsForParentEmbed,
} from '../utils/embeddedDemo'
import { getScalarDemoForField } from '../utils/formExamplePresets'
import { useCanvasRuntimeValues } from '../contexts/CanvasRuntimeValuesContext'
import type { CanvasEmbAncestor } from '../utils/canvasRuntimeValueKey'
import { canvasRuntimeFieldKey } from '../utils/canvasRuntimeValueKey'
import { FormSectionedLayout } from './FormSectionedLayout'
import { useEmbeddedNestedPopup } from '../contexts/EmbeddedNestedPopupContext'
import {
  embeddedFormAccordionInstanceHighlight,
  embeddedFormAccordionInstanceTitle,
  findFormById,
  getEmbeddedNestedFieldsForTable,
} from '../utils/linkedForm'
import { isFieldVisibleInEmbeddedTableCell } from '../utils/fieldVisibilityRules'
import TextField from './fields/TextField'
import NumberField from './fields/NumberField'
import DecimalField from './fields/DecimalField'
import ReferenceField from './fields/ReferenceField'
import TextOptionsField from './fields/TextOptionsField'
import BooleanField from './fields/BooleanField'
import DateField from './fields/DateField'
import FileField from './fields/FileField'
import GeopointField from './fields/GeopointField'
import HtmlField from './fields/HtmlField'
import AlertField from './fields/AlertField'
import { runValidarCnpjProtoOrg } from '../utils/atlasProtoOrgMethods'
import {
  applyAtlasCatProdutoCanvasSync,
  FORM_CAT_PRODUTO,
  metricasPermitidasDoCatalogo,
} from '../utils/atlasCatProdutoCanvasSync'
import { applyDemandaCatalogCascadeSync } from '../utils/demandaCatalogCascadeSync'
import { parseReferenceSourceValues } from '../utils/referenceLinkedForm'
import FieldSpecMarkdown from './FieldSpecMarkdown'
import FlowStepConfigAutosizeTextarea from './FlowStepConfigAutosizeTextarea'

function newEmbeddedInstanceId() {
  return crypto.randomUUID?.() ?? `emb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

const EMBEDDED_TABLE_COL_MIN_REM: Record<FieldSize, string> = {
  small: '7rem',
  medium: '10rem',
  large: '13rem',
}

const EMBEDDED_TABLE_ACTIONS_COL = '2.5rem'

function embeddedTableMinWidthCalc(nested: FormField[], showActions: boolean): string {
  const parts = nested.map((f) => EMBEDDED_TABLE_COL_MIN_REM[f.size])
  if (showActions) parts.push(EMBEDDED_TABLE_ACTIONS_COL)
  return parts.length ? `calc(${parts.join(' + ')})` : '0px'
}

function FieldSpec({ field }: { field: FormField }) {
  if (!field.spec) return null
  return (
    <div className="canvas__spec">
      <div className="canvas__spec-header">
        <div className="canvas__spec-header-main">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="6.5" />
            <line x1="8" y1="7" x2="8" y2="11.5" />
            <circle cx="8" cy="4.75" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          <span>Detalhamento</span>
        </div>
      </div>
      <FieldSpecMarkdown text={field.spec} />
    </div>
  )
}

function EditableFieldSpec({
  field,
  onCommit,
}: {
  field: FormField
  onCommit: (nextSpec: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(field.spec ?? '')

  const hasSpec = (field.spec ?? '').trim().length > 0
  if (!hasSpec && !isEditing) return null

  return (
    <div className="canvas__spec">
      <div className="canvas__spec-header">
        <div className="canvas__spec-header-main">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="6.5" />
            <line x1="8" y1="7" x2="8" y2="11.5" />
            <circle cx="8" cy="4.75" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          <span>Detalhamento</span>
        </div>
        <div className="canvas__spec-header-actions">
          {isEditing ? (
            <button
              type="button"
              className="canvas__spec-action-btn"
              aria-label="Confirmar alteração do detalhamento"
              onClick={() => {
                onCommit(draft)
                setIsEditing(false)
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className="canvas__spec-action-btn"
              aria-label="Editar detalhamento"
              onClick={() => {
                setDraft(field.spec ?? '')
                setIsEditing(true)
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {isEditing ? (
        <FlowStepConfigAutosizeTextarea
          className="canvas__spec-edit"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          spellCheck={false}
          aria-label="Editar detalhamento do campo"
        />
      ) : (
        <FieldSpecMarkdown text={field.spec ?? ''} />
      )}
    </div>
  )
}

/** Mesma grelha do formulário principal, recursiva para ref. embutida. */
function FormFieldsGrid({
  fields,
  showSpecs,
  inheritedReadOnly = false,
  canvasReadOnly = false,
  presetForm,
  embeddedDemoCtx,
  epicForms = [],
  embeddedAncestorFormIds = [],
  canvasFormDefId,
  canvasAncestors = [],
  onUpdateFieldSpec,
  onHtmlAction,
}: {
  fields: FormField[]
  showSpecs?: boolean
  /** Somente leitura herdada de um ancestral ref. embutida (não altera o modelo). */
  inheritedReadOnly?: boolean
  /** Somente leitura do canvas (formulário / etapa BPMN); não altera o modelo. */
  canvasReadOnly?: boolean
  /** Formulário cujos presets resolvem valores escalares nesta grelha. */
  presetForm: FormDef
  /** Preset do bloco embutido: host, campo e índice da instância. */
  embeddedDemoCtx?: {
    hostForm: FormDef
    embedField: FormField
    instanceIndex: number
    hostPresetRow?: EmbeddedDemoRow
  }
  /** Formulários do épico (resolver `linkedFormId`). */
  epicForms?: FormDef[]
  /** Ids dos formulários na cadeia de embutidos (evita referência cíclica na renderização). */
  embeddedAncestorFormIds?: string[]
  /** Formulário cujos campos estão nesta grelha (títulos / chaves de runtime). */
  canvasFormDefId: string
  /** Instâncias de ref. embutida até este nível (exclui o bloco atual). */
  canvasAncestors?: CanvasEmbAncestor[]
  /** Atualiza o texto de especificação (`spec`) de um campo no formulário indicado. */
  onUpdateFieldSpec?: (formId: string, fieldId: string, spec: string) => void
  /** Ação de botão em campo HTML (`data-action`). */
  onHtmlAction?: (action: string) => void
}) {
  const ancestors = canvasAncestors ?? []
  const fieldVisible = useCanvasFieldVisible(presetForm, { canvasFormDefId, canvasAncestors: ancestors })
  const visibleFields = fields.filter(fieldVisible)
  return (
    <div className="canvas__grid">
      {visibleFields.map((field) => (
        <div
          key={`${canvasFormDefId}:${field.id}`}
          className="canvas__cell"
          style={{ gridColumn: `span ${SIZE_SPAN[field.size]}` }}
        >
          <div className="canvas__card">
            <FieldRenderer
              field={field}
              showSpecs={showSpecs}
              inheritedReadOnly={inheritedReadOnly}
              canvasReadOnly={canvasReadOnly}
              presetForm={presetForm}
              embeddedDemoCtx={embeddedDemoCtx}
              epicForms={epicForms}
              embeddedAncestorFormIds={embeddedAncestorFormIds}
              canvasFormDefId={canvasFormDefId}
              canvasAncestors={canvasAncestors}
              onUpdateFieldSpec={onUpdateFieldSpec}
              onHtmlAction={onHtmlAction}
            />
            {showSpecs &&
              (onUpdateFieldSpec ? (
                <EditableFieldSpec
                  field={field}
                  onCommit={(nextSpec) => onUpdateFieldSpec(canvasFormDefId, field.id, nextSpec)}
                />
              ) : (
                <FieldSpec field={field} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmbeddedAccordionInstance({
  linkedForm,
  showSpecs,
  open,
  onToggle,
  readOnly,
  canvasReadOnly,
  canRemove,
  onRemoveInstance,
  embedHostPresetForm,
  embeddedParentField,
  instanceIndex,
  epicForms,
  embeddedAncestorFormIds,
  accordionSummaryTitle,
  accordionHighlightTitle,
  nestedCanvasFormDefId,
  nestedCanvasAncestors,
  parentEmbeddedDemoCtx,
  onUpdateFieldSpec,
}: {
  linkedForm: FormDef | undefined
  showSpecs?: boolean
  open: boolean
  onToggle: () => void
  readOnly?: boolean
  canvasReadOnly?: boolean
  /** Se false, a lixeira aparece desabilitada (ordem: lixeira, depois ⋮) */
  canRemove: boolean
  onRemoveInstance?: () => void
  /** Formulário que contém o campo embutido (presets das linhas). */
  embedHostPresetForm: FormDef
  embeddedParentField: FormField
  instanceIndex: number
  epicForms: FormDef[]
  embeddedAncestorFormIds: string[]
  /** Rótulo do acordeão (campos identidade do subformulário ou nome do formulário). */
  accordionSummaryTitle: string
  /** Destaque à direita (ex.: progresso — campos `highlight`). */
  accordionHighlightTitle?: string
  nestedCanvasFormDefId: string
  nestedCanvasAncestors: CanvasEmbAncestor[]
  parentEmbeddedDemoCtx?: {
    hostForm: FormDef
    embedField: FormField
    instanceIndex: number
    hostPresetRow?: EmbeddedDemoRow
  }
  onUpdateFieldSpec?: (formId: string, fieldId: string, spec: string) => void
}) {
  const nextHostPresetRow =
    parentEmbeddedDemoCtx
      ? rowsForParentEmbed(
          parentEmbeddedDemoCtx.hostForm,
          parentEmbeddedDemoCtx.embedField,
          parentEmbeddedDemoCtx.hostPresetRow,
        )?.[parentEmbeddedDemoCtx.instanceIndex]
      : undefined
  const childEmbeddedDemoCtx = {
    hostForm: embedHostPresetForm,
    embedField: embeddedParentField,
    instanceIndex,
    hostPresetRow: nextHostPresetRow,
  }
  return (
    <div className="field__embedded">
      <div
        className={`field__embedded-acc-header${open ? ' field__embedded-acc-header--open' : ''}`}
      >
        <button
          type="button"
          className={`field__embedded-acc-trigger${open ? ' field__embedded-acc-trigger--open' : ''}`}
          onClick={onToggle}
          aria-expanded={open}
        >
          <svg className="field__embedded-acc-chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="field__embedded-acc-title">{accordionSummaryTitle}</span>
          {accordionHighlightTitle ? (
            <span className="field__embedded-acc-highlight">{accordionHighlightTitle}</span>
          ) : null}
        </button>
        {!readOnly && (
          <div className="field__embedded-acc-actions">
            <button
              type="button"
              className="field__embedded-acc-icon-btn"
              disabled={!canRemove}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (canRemove) onRemoveInstance?.()
              }}
              aria-label={canRemove ? 'Remover esta ocorrência' : 'Remover indisponível neste modo'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
            <button
              type="button"
              className="field__embedded-acc-icon-btn"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              aria-label="Mais opções"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div
        className={`field__embedded-acc-panel${open ? '' : ' field__embedded-acc-panel--collapsed'}`}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        {!linkedForm || linkedForm.fields.length === 0 ? (
          <p className="field__embedded-acc-empty">
            Vincule um formulário a este bloco ou defina campos no formulário linkado.
          </p>
        ) : (
          <FormSectionedLayout
            form={linkedForm}
            readCanvas={canvasReadOnly}
            fieldVisibilityCtx={{
              canvasFormDefId: nestedCanvasFormDefId,
              canvasAncestors: nestedCanvasAncestors,
            }}
            renderFields={(sectionFields) => (
              <FormFieldsGrid
                fields={sectionFields}
                showSpecs={showSpecs}
                inheritedReadOnly={readOnly}
                canvasReadOnly={canvasReadOnly}
                presetForm={linkedForm}
                embeddedDemoCtx={childEmbeddedDemoCtx}
                epicForms={epicForms}
                embeddedAncestorFormIds={embeddedAncestorFormIds}
                canvasFormDefId={nestedCanvasFormDefId}
                canvasAncestors={nestedCanvasAncestors}
                onUpdateFieldSpec={onUpdateFieldSpec}
              />
            )}
          />
        )}
      </div>
    </div>
  )
}

function EmbeddedReferenceTable({
  nested,
  instanceIds,
  readOnly,
  canvasReadOnly,
  isMulti,
  onRemoveRow,
  addFooter,
  tablePresetForm,
  embedHostPresetForm,
  parentEmbeddedDemoCtx,
  parentEmbeddedField,
  epicForms,
  embeddedAncestorFormIds,
  nestedCanvasFormDefId,
  canvasAncestorsBeforeEmbedded,
  onUpdateFieldSpec,
}: {
  nested: FormField[]
  instanceIds: string[]
  readOnly: boolean
  canvasReadOnly?: boolean
  isMulti: boolean
  onRemoveRow: (id: string) => void
  /** Última linha da tabela (ex.: botão +), centralizado */
  addFooter?: ReactNode
  /** Presets dos campos nas células (formulário linkado). */
  tablePresetForm: FormDef
  /** Formulário que contém o bloco embutido (presets das linhas). */
  embedHostPresetForm: FormDef
  parentEmbeddedDemoCtx?: {
    hostForm: FormDef
    embedField: FormField
    instanceIndex: number
    hostPresetRow?: EmbeddedDemoRow
  }
  parentEmbeddedField: FormField
  epicForms: FormDef[]
  embeddedAncestorFormIds: string[]
  nestedCanvasFormDefId: string
  canvasAncestorsBeforeEmbedded: CanvasEmbAncestor[]
  onUpdateFieldSpec?: (formId: string, fieldId: string, spec: string) => void
}) {
  const showActions = isMulti && !readOnly
  const runtime = useCanvasRuntimeValues()

  const visibleNested = useEmbeddedTableVisibleNestedFields(
    tablePresetForm,
    nestedCanvasFormDefId,
    canvasAncestorsBeforeEmbedded,
    parentEmbeddedField.id,
    nested,
    instanceIds.length,
  )

  const tableCssVars = {
    '--embed-data-cols': String(visibleNested.length),
    '--embed-actions-w': showActions ? EMBEDDED_TABLE_ACTIONS_COL : '0px',
    '--embed-min-sum': embeddedTableMinWidthCalc(visibleNested, showActions),
  } as CSSProperties

  const hiddenTableColLabels = new Set(tablePresetForm.hiddenLabelFieldIds ?? [])

  if (nested.length === 0) {
    return (
      <div className="field__embedded-table-layout">
        <div className="field__embedded-table-scroll">
          <table className="field__embedded-table">
            <tbody>
              {instanceIds.length === 0 ? (
                <tr>
                  <td className="field__embedded-table-empty">
                    <p className="field__embedded-acc-empty">
                      Vincule um formulário a este bloco ou defina campos no formulário linkado.
                    </p>
                  </td>
                </tr>
              ) : (
                instanceIds.map((id) => (
                  <tr key={id}>
                    <td className="field__embedded-table-empty">
                      <p className="field__embedded-acc-empty">
                        Vincule um formulário a este bloco ou defina campos no formulário linkado.
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {addFooter ? (
          <div className="field__embedded-table-add-footer">
            <div className="field__embedded-table-add-cell">
              <div className="field__embedded-table-add-wrap">{addFooter}</div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  if (nested.length > 0 && visibleNested.length === 0) {
    const emptyColSpan = nested.length + (showActions ? 1 : 0)
    return (
      <div className="field__embedded-table-layout">
        <div className="field__embedded-table-scroll">
          <table className="field__embedded-table">
            <tbody>
              <tr>
                <td className="field__embedded-table-empty" colSpan={Math.max(1, emptyColSpan)}>
                  <p className="field__embedded-acc-empty">
                    Nenhum campo visível nas linhas da tabela (regras de visibilidade ou campos ocultos no modelo).
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {addFooter ? (
          <div className="field__embedded-table-add-footer">
            <div className="field__embedded-table-add-cell">
              <div className="field__embedded-table-add-wrap">{addFooter}</div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  /* Sem linhas: mesmo «shell» que campo arquivo vazio — só ícone no botão */
  if (visibleNested.length > 0 && instanceIds.length === 0) {
    if (!addFooter) return null
    return (
      <div className="field__file-stack field__file-stack--embedded-table-add">
        <div className="field__file-upload-wrap">
          {addFooter}
        </div>
      </div>
    )
  }

  return (
    <div className="field__embedded-table-layout">
      <div className="field__embedded-table-scroll">
        <table className="field__embedded-table" style={tableCssVars}>
          <thead>
            <tr>
              {visibleNested.map((nf) => (
                <th key={nf.id} scope="col" className={`field__embedded-table-th field__embedded-table-th--${nf.size}`}>
                  {!hiddenTableColLabels.has(nf.id) ? nf.label : null}
                  {nf.required && <span className="field__required">*</span>}
                </th>
              ))}
              {showActions && (
                <th className="field__embedded-table-th field__embedded-table-th-actions" scope="col" aria-label="Ações" />
              )}
            </tr>
          </thead>
          <tbody>
            {instanceIds.map((id, rowIndex) => (
              <tr key={id}>
                {visibleNested.map((nf) => (
                  <td key={nf.id} className={`field__embedded-table-td field__embedded-table-td--${nf.size}`}>
                    <div className={`field__embedded-table-cell field__embedded-table-cell--${nf.size}`}>
                      {isFieldVisibleInEmbeddedTableCell(
                        tablePresetForm,
                        runtime?.getValue,
                        nestedCanvasFormDefId,
                        canvasAncestorsBeforeEmbedded,
                        parentEmbeddedField.id,
                        rowIndex,
                        nf,
                      ) ? (
                        <FieldRenderer
                          field={nf}
                          showSpecs={false}
                          inTableCell
                          inheritedReadOnly={readOnly}
                          canvasReadOnly={canvasReadOnly}
                          presetForm={tablePresetForm}
                          embeddedDemoCtx={{
                            hostForm: embedHostPresetForm,
                            embedField: parentEmbeddedField,
                            instanceIndex: rowIndex,
                            hostPresetRow: parentEmbeddedDemoCtx
                              ? rowsForParentEmbed(
                                  parentEmbeddedDemoCtx.hostForm,
                                  parentEmbeddedDemoCtx.embedField,
                                  parentEmbeddedDemoCtx.hostPresetRow,
                                )?.[parentEmbeddedDemoCtx.instanceIndex]
                              : undefined,
                          }}
                          epicForms={epicForms}
                          embeddedAncestorFormIds={embeddedAncestorFormIds}
                          canvasFormDefId={nestedCanvasFormDefId}
                          canvasAncestors={[
                            ...canvasAncestorsBeforeEmbedded,
                            { embeddedFieldId: parentEmbeddedField.id, instanceIndex: rowIndex },
                          ]}
                          onUpdateFieldSpec={onUpdateFieldSpec}
                        />
                      ) : null}
                    </div>
                  </td>
                ))}
                {showActions && (
                  <td className="field__embedded-table-td field__embedded-table-td-actions">
                    <button
                      type="button"
                      className="field__embedded-acc-icon-btn"
                      onClick={() => onRemoveRow(id)}
                      aria-label="Remover esta linha"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {addFooter ? (
        <div className="field__embedded-table-add-footer">
          <div className="field__embedded-table-add-cell">
            <div className="field__embedded-table-add-wrap">{addFooter}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function EmbeddedReferenceBlock({
  field,
  showSpecs,
  parentInheritedReadOnly = false,
  canvasReadOnly = false,
  presetForm,
  parentEmbeddedDemoCtx,
  epicForms,
  embeddedAncestorFormIds = [],
  canvasAncestors = [],
  onUpdateFieldSpec,
  suppressOuterLabel = false,
}: {
  field: FormField
  showSpecs?: boolean
  parentInheritedReadOnly?: boolean
  canvasReadOnly?: boolean
  /** Oculta o rótulo do bloco (ex.: modal já repete o título). */
  suppressOuterLabel?: boolean
  /** Formulário que contém este campo embutido (presets das linhas). */
  presetForm: FormDef
  parentEmbeddedDemoCtx?: {
    hostForm: FormDef
    embedField: FormField
    instanceIndex: number
    hostPresetRow?: EmbeddedDemoRow
  }
  epicForms: FormDef[]
  embeddedAncestorFormIds?: string[]
  canvasAncestors?: CanvasEmbAncestor[]
  onUpdateFieldSpec?: (formId: string, fieldId: string, spec: string) => void
}) {
  const runtime = useCanvasRuntimeValues()
  const linkedId = field.linkedFormId
  const linkedForm = linkedId ? findFormById(epicForms, linkedId) : undefined
  const nestedFormDefId = linkedId ?? ''
  const modelReadOnlyFromRules = useCanvasFieldRuleReadOnlyOverlay(presetForm, {
    canvasFormDefId: presetForm.id,
    canvasAncestors,
  })
  const ro = canvasReadOnly || parentInheritedReadOnly || modelReadOnlyFromRules(field)
  const nestedTableColumns = getEmbeddedNestedFieldsForTable(field, epicForms)
  const isMulti = field.multiple && fieldSupportsMultiple(field.type)
  const isTable = field.embeddedDisplay === 'table' && isMulti
  const isRoot = !!field.embeddedRoot && !isMulti
  const hideOuterLabel =
    (presetForm.hiddenLabelFieldIds ?? []).includes(field.id) || suppressOuterLabel

  const nextHostPresetRow =
    parentEmbeddedDemoCtx
      ? rowsForParentEmbed(
          parentEmbeddedDemoCtx.hostForm,
          parentEmbeddedDemoCtx.embedField,
          parentEmbeddedDemoCtx.hostPresetRow,
        )?.[parentEmbeddedDemoCtx.instanceIndex]
      : undefined

  const [instanceIds, setInstanceIds] = useState<string[]>(() =>
    Array.from(
      { length: embeddedCanvasInstanceCount(presetForm, field, parentEmbeddedDemoCtx?.hostPresetRow) },
      () => newEmbeddedInstanceId(),
    ),
  )
  const [openById, setOpenById] = useState<Record<string, boolean>>({})

  const isOpen = (id: string) => openById[id] === true

  const presetEmbedRows = rowsForParentEmbed(presetForm, field, parentEmbeddedDemoCtx?.hostPresetRow)
  const demoInstancesKey = JSON.stringify(presetEmbedRows ?? null)

  useEffect(() => {
    if (!isMulti) {
      setInstanceIds((ids) => (ids[0] ? [ids[0]] : [newEmbeddedInstanceId()]))
      return
    }
    const target = embeddedCanvasInstanceCount(presetForm, field, parentEmbeddedDemoCtx?.hostPresetRow)
    setInstanceIds((prev) => {
      if (prev.length === target) return prev
      if (prev.length < target) {
        return [
          ...prev,
          ...Array.from({ length: target - prev.length }, () => newEmbeddedInstanceId()),
        ]
      }
      return prev.slice(0, target)
    })
  }, [isMulti, field.multiple, field.type, demoInstancesKey, presetForm.id, field.id])

  useEffect(() => {
    if (!runtime || !isMulti) return
    const k = canvasRuntimeFieldKey(presetForm.id, canvasAncestors, `__rows__${field.id}`)
    runtime.setValue(k, String(instanceIds.length))
  }, [runtime, isMulti, instanceIds.length, presetForm.id, canvasAncestors, field.id])

  function toggleInstance(id: string) {
    setOpenById((prev) => ({ ...prev, [id]: !isOpen(id) }))
  }

  function addInstance() {
    if (!isMulti || ro) return
    setInstanceIds((prev) => [...prev, newEmbeddedInstanceId()])
  }

  function removeInstance(id: string) {
    if (!isMulti || ro) return
    setInstanceIds((prev) => prev.filter((x) => x !== id))
    setOpenById((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const count = instanceIds.length

  const addButton =
    isMulti && !ro ? (
      <button
        type="button"
        className="field__file-btn field__embedded-add-btn"
        onClick={addInstance}
        aria-label={count === 0 ? 'Adicionar formulário' : 'Adicionar outro formulário'}
      >
        <svg
          className="field__file-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    ) : null

  const labelEl = (
    <>
      {hideOuterLabel && field.required ? (
        <div className="field__label-req-only" aria-hidden>
          <span className="field__required">*</span>
        </div>
      ) : null}
      {!hideOuterLabel ? (
        <label className="field__label">
          {field.label}
          {field.required && <span className="field__required">*</span>}
        </label>
      ) : null}
    </>
  )

  const cycleBlocked = !!(linkedId && embeddedAncestorFormIds.includes(linkedId))
  if (cycleBlocked) {
    return (
      <div className={`field field--embedded-accordion field--embedded-cycle${ro ? ' field--readonly' : ''}`}>
        {labelEl}
        <p className="field__embedded-acc-empty field__embedded-cycle-msg">
          Referência cíclica: o vínculo aponta para um formulário já presente nesta cadeia de
          embutidos. Ajuste o campo no editor ou escolha outro formulário.
        </p>
      </div>
    )
  }

  const childAncestors = linkedId ? [...embeddedAncestorFormIds, linkedId] : embeddedAncestorFormIds

  if (isTable) {
    if (!linkedForm) {
      return (
        <div className={`field field--embedded-accordion field--embedded-table-mode${ro ? ' field--readonly' : ''}`}>
          {labelEl}
          <p className="field__embedded-acc-empty">Vincule um formulário a este bloco.</p>
        </div>
      )
    }
    return (
      <div className={`field field--embedded-accordion field--embedded-table-mode${ro ? ' field--readonly' : ''}`}>
        {labelEl}
        <EmbeddedReferenceTable
          nested={nestedTableColumns}
          instanceIds={instanceIds}
          readOnly={ro}
          canvasReadOnly={canvasReadOnly}
          isMulti={isMulti}
          onRemoveRow={removeInstance}
          addFooter={addButton}
          tablePresetForm={linkedForm}
          embedHostPresetForm={presetForm}
          parentEmbeddedDemoCtx={parentEmbeddedDemoCtx}
          parentEmbeddedField={field}
          epicForms={epicForms}
          embeddedAncestorFormIds={childAncestors}
          nestedCanvasFormDefId={nestedFormDefId}
          canvasAncestorsBeforeEmbedded={canvasAncestors}
          onUpdateFieldSpec={onUpdateFieldSpec}
        />
      </div>
    )
  }

  if (isRoot) {
    return (
      <div className={`field field--embedded-root${ro ? ' field--readonly' : ''}`}>
        {labelEl}
        <div className="field__embedded-root-body">
          {!linkedForm || linkedForm.fields.length === 0 ? (
            <p className="field__embedded-acc-empty">
              Vincule um formulário a este bloco ou defina campos no formulário linkado.
            </p>
          ) : (
            <FormSectionedLayout
              form={linkedForm}
              readCanvas={canvasReadOnly}
              fieldVisibilityCtx={{
                canvasFormDefId: nestedFormDefId,
                canvasAncestors: [...canvasAncestors, { embeddedFieldId: field.id, instanceIndex: 0 }],
              }}
              renderFields={(sectionFields) => (
                <FormFieldsGrid
                  fields={sectionFields}
                  showSpecs={showSpecs}
                  inheritedReadOnly={ro}
                  canvasReadOnly={canvasReadOnly}
                  presetForm={linkedForm}
                  embeddedDemoCtx={{
                    hostForm: presetForm,
                    embedField: field,
                    instanceIndex: 0,
                    hostPresetRow: nextHostPresetRow,
                  }}
                  epicForms={epicForms}
                  embeddedAncestorFormIds={childAncestors}
                  canvasFormDefId={nestedFormDefId}
                  canvasAncestors={[
                    ...canvasAncestors,
                    { embeddedFieldId: field.id, instanceIndex: 0 },
                  ]}
                  onUpdateFieldSpec={onUpdateFieldSpec}
                />
              )}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`field field--embedded-accordion${ro ? ' field--readonly' : ''}`}>
      {labelEl}
      <div className="field__embedded-stack">
        {instanceIds.map((id, index) => {
          const accAncestors: CanvasEmbAncestor[] = [
            ...canvasAncestors,
            { embeddedFieldId: field.id, instanceIndex: index },
          ]
          const accordionTitleOpts =
            linkedForm && nestedFormDefId
              ? {
                  nestedFormId: nestedFormDefId,
                  canvasAncestors: accAncestors,
                  resolveIdentityDemoField: (idf: FormField) =>
                    resolveNestedFieldForDemo(
                      presetForm,
                      field,
                      idf,
                      index,
                      nextHostPresetRow,
                    ),
                  getOverride: runtime?.getValue,
                }
              : undefined
          const accordionSummaryTitle = embeddedFormAccordionInstanceTitle(
            linkedForm,
            accordionTitleOpts,
          )
          const accordionHighlightTitle = embeddedFormAccordionInstanceHighlight(
            linkedForm,
            accordionTitleOpts,
          )
          return (
            <EmbeddedAccordionInstance
              key={id}
              linkedForm={linkedForm}
              showSpecs={showSpecs}
              open={isOpen(id)}
              onToggle={() => toggleInstance(id)}
              readOnly={ro}
              canvasReadOnly={canvasReadOnly}
              canRemove={isMulti}
              onRemoveInstance={() => removeInstance(id)}
              embedHostPresetForm={presetForm}
              embeddedParentField={field}
              instanceIndex={index}
              epicForms={epicForms}
              embeddedAncestorFormIds={childAncestors}
              accordionSummaryTitle={accordionSummaryTitle}
              accordionHighlightTitle={accordionHighlightTitle || undefined}
              nestedCanvasFormDefId={nestedFormDefId}
              nestedCanvasAncestors={accAncestors}
              parentEmbeddedDemoCtx={parentEmbeddedDemoCtx}
              onUpdateFieldSpec={onUpdateFieldSpec}
            />
          )
        })}
      </div>
      {addButton}
    </div>
  )
}

function FieldRenderer({
  field,
  showSpecs,
  inTableCell,
  inheritedReadOnly = false,
  canvasReadOnly = false,
  presetForm,
  embeddedDemoCtx,
  epicForms = [],
  embeddedAncestorFormIds = [],
  canvasFormDefId,
  canvasAncestors,
  onUpdateFieldSpec,
  onHtmlAction,
}: {
  field: FormField
  showSpecs?: boolean
  /** Célula de tabela: ref. embutida aninhada vira texto; rótulos ficam só no &lt;th&gt; */
  inTableCell?: boolean
  /** Somente leitura herdada de ref. embutida ancestral (não altera o modelo). */
  inheritedReadOnly?: boolean
  /** Somente leitura do canvas (formulário / etapa BPMN). */
  canvasReadOnly?: boolean
  presetForm: FormDef
  embeddedDemoCtx?: {
    hostForm: FormDef
    embedField: FormField
    instanceIndex: number
    hostPresetRow?: EmbeddedDemoRow
  }
  epicForms?: FormDef[]
  embeddedAncestorFormIds?: string[]
  canvasFormDefId: string
  canvasAncestors: CanvasEmbAncestor[]
  onUpdateFieldSpec?: (formId: string, fieldId: string, spec: string) => void
  onHtmlAction?: (action: string) => void
}) {
  const runtime = useCanvasRuntimeValues()
  const runtimeRef = useRef(runtime)
  runtimeRef.current = runtime
  const modelReadOnlyFromRules = useCanvasFieldRuleReadOnlyOverlay(presetForm, {
    canvasFormDefId,
    canvasAncestors,
  })
  const labelHidden = (presetForm.hiddenLabelFieldIds ?? []).includes(field.id)
  const effectiveReadOnly = canvasReadOnly || inheritedReadOnly || modelReadOnlyFromRules(field)
  const resolved =
    embeddedDemoCtx
      ? resolveNestedFieldForDemo(
          embeddedDemoCtx.hostForm,
          embeddedDemoCtx.embedField,
          field,
          embeddedDemoCtx.instanceIndex,
          embeddedDemoCtx.hostPresetRow,
        )
      : { ...field }
  const scalar = getScalarDemoForField(presetForm, field.id)
  const baseDemo = resolved.demoValue !== undefined ? resolved.demoValue : scalar
  const runtimeKeyForField = canvasRuntimeFieldKey(canvasFormDefId, canvasAncestors, field.id)
  const runtimeOverride = runtime?.getValue(runtimeKeyForField)
  const demoValue = runtimeOverride !== undefined ? runtimeOverride : baseDemo
  const common = {
    label: field.label,
    readOnly: effectiveReadOnly,
    required: field.required,
    demoValue,
  }
  const ruleRefsSource = presetForm.fieldVisibilityRules?.some((r) => r.sourceFieldId === field.id) ?? false
  const needsRuleRuntime =
    ruleRefsSource && (field.type === 'boolean' || field.type === 'textOptions')
  const trackAllScalarsInRuntime =
    Boolean(runtime) &&
    field.type !== 'embeddedReference' &&
    field.type !== 'html' &&
    field.type !== 'alert'
  const runtimeSummaryKey = trackAllScalarsInRuntime
    ? runtimeKeyForField
    : field.relevance === 'identity' ||
        (canvasReadOnly && field.relevance === 'highlight') ||
        needsRuleRuntime
      ? runtimeKeyForField
      : undefined
  const onRuntimeSummaryChange = useCallback(
    (key: string, value: string) => {
      const rt = runtimeRef.current
      if (!rt) return
      rt.setValue(key, value)
      if (key === runtimeKeyForField) {
        applyAtlasCatProdutoCanvasSync({
          form: presetForm,
          canvasFormDefId,
          canvasAncestors,
          changedFieldId: field.id,
          changedValue: value,
          setValue: rt.setValue,
          getValue: rt.getValue,
        })
        applyDemandaCatalogCascadeSync({
          form: presetForm,
          canvasFormDefId,
          canvasAncestors,
          changedFieldId: field.id,
          changedValue: value,
          setValue: rt.setValue,
          getValue: rt.getValue,
          epicForms,
        })
      }
    },
    [runtimeKeyForField, presetForm, canvasFormDefId, canvasAncestors, field.id, epicForms],
  )
  const nestedPopup = useEmbeddedNestedPopup()
  const metricaOptions =
    presetForm.id === FORM_CAT_PRODUTO &&
    field.id === `${FORM_CAT_PRODUTO}-metrica` &&
    runtime
      ? metricasPermitidasDoCatalogo(runtime.getValue, canvasFormDefId, canvasAncestors)
      : undefined

  if (
    inTableCell &&
    (field.type === 'embeddedReference' || field.type === 'html' || field.type === 'alert')
  ) {
    const label =
      effectiveReadOnly
        ? field.type === 'embeddedReference'
          ? 'Visualizar'
          : 'Conteúdo'
        : 'Editar'
    return (
      <button
        type="button"
        className="field__embedded-table-nested-ref-btn"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          nestedPopup.openNestedEmbeddedPopup({
            field,
            showSpecs,
            parentInheritedReadOnly: inheritedReadOnly,
            canvasReadOnly,
            linkedFormReadOnly: effectiveReadOnly,
            presetForm,
            parentEmbeddedDemoCtx: embeddedDemoCtx,
            epicForms,
            embeddedAncestorFormIds,
            canvasAncestors,
            onUpdateFieldSpec,
          })
        }}
      >
        {label}
      </button>
    )
  }

  switch (field.type) {
    case 'text':
      return (
        <TextField
          {...common}
          hideLabel={labelHidden}
          long={field.textLong}
          runtimeSummaryKey={runtimeSummaryKey}
          onRuntimeSummaryChange={onRuntimeSummaryChange}
        />
      )
    case 'number':
      return (
        <NumberField
          {...common}
          hideLabel={labelHidden}
          runtimeSummaryKey={runtimeSummaryKey}
          onRuntimeSummaryChange={onRuntimeSummaryChange}
        />
      )
    case 'decimal':
      return (
        <DecimalField
          {...common}
          hideLabel={labelHidden}
          currency={field.currency}
          runtimeSummaryKey={runtimeSummaryKey}
          onRuntimeSummaryChange={onRuntimeSummaryChange}
        />
      )
    case 'boolean':
      return (
        <BooleanField
          {...common}
          hideLabel={labelHidden}
          runtimeSummaryKey={runtimeSummaryKey}
          onRuntimeSummaryChange={onRuntimeSummaryChange}
        />
      )
    case 'date':
      return (
        <DateField
          {...common}
          hideLabel={labelHidden}
          runtimeSummaryKey={runtimeSummaryKey}
          onRuntimeSummaryChange={onRuntimeSummaryChange}
        />
      )
    case 'reference': {
      const filterCfg = field.filterByReference
      let filterByReference:
        | { sourceValues: string[]; matchFieldIds: string[] }
        | undefined
      if (filterCfg) {
        let sourceValues: string[] = []
        if (filterCfg.sourceFieldId && runtime) {
          const srcKey = canvasRuntimeFieldKey(
            canvasFormDefId,
            canvasAncestors,
            filterCfg.sourceFieldId,
          )
          const raw =
            runtime.getValue(srcKey) ??
            String(getScalarDemoForField(presetForm, filterCfg.sourceFieldId) ?? '')
          sourceValues = parseReferenceSourceValues(raw)
        }
        if (!sourceValues.length && filterCfg.matchEquals) {
          sourceValues = [filterCfg.matchEquals]
        }
        if (sourceValues.length > 0) {
          filterByReference = {
            sourceValues,
            matchFieldIds: filterCfg.matchFieldIds,
          }
        }
      }
      return (
        <ReferenceField
          {...common}
          hideLabel={labelHidden}
          floatingMenu={!!inTableCell}
          multiple={fieldSupportsMultiple(field.type) ? field.multiple : false}
          options={metricaOptions ?? field.options}
          linkedFormId={metricaOptions ? undefined : field.linkedFormId}
          epicForms={epicForms}
          filterByReference={filterByReference}
          runtimeSummaryKey={runtimeSummaryKey}
          onRuntimeSummaryChange={onRuntimeSummaryChange}
        />
      )
    }
    case 'textOptions':
      return (
        <TextOptionsField
          {...common}
          hideLabel={labelHidden}
          floatingMenu={!!inTableCell}
          multiple={fieldSupportsMultiple(field.type) ? field.multiple : false}
          options={field.options}
          runtimeSummaryKey={runtimeSummaryKey}
          onRuntimeSummaryChange={onRuntimeSummaryChange}
        />
      )
    case 'embeddedReference':
      return (
        <EmbeddedReferenceBlock
          field={field}
          showSpecs={showSpecs}
          parentInheritedReadOnly={inheritedReadOnly}
          canvasReadOnly={canvasReadOnly}
          presetForm={presetForm}
          parentEmbeddedDemoCtx={embeddedDemoCtx}
          epicForms={epicForms}
          embeddedAncestorFormIds={embeddedAncestorFormIds}
          canvasAncestors={canvasAncestors}
          onUpdateFieldSpec={onUpdateFieldSpec}
        />
      )
    case 'file':
      return (
        <FileField
          {...common}
          hideLabel={labelHidden}
          runtimeSummaryKey={runtimeSummaryKey}
          onRuntimeSummaryChange={onRuntimeSummaryChange}
        />
      )
    case 'geopoint':
      return (
        <GeopointField
          {...common}
          hideLabel={labelHidden}
          runtimeSummaryKey={runtimeSummaryKey}
          onRuntimeSummaryChange={onRuntimeSummaryChange}
        />
      )
    case 'html':
      return (
        <HtmlField
          label={field.label}
          htmlContent={field.htmlContent ?? ''}
          readOnly={effectiveReadOnly}
          hideLabel={labelHidden}
          required={field.required}
          onHtmlAction={
            onHtmlAction
              ? onHtmlAction
              : runtime && canvasFormDefId === 'form-patlasv4-proto-unidade-organizacional'
                ? (action) => {
                    if (action === 'validar-cnpj') {
                      runValidarCnpjProtoOrg(runtime.getValue, runtime.setValue)
                    }
                  }
                : undefined
          }
        />
      )
    case 'alert':
      return (
        <AlertField
          label={field.label}
          title={field.alertTitle ?? ''}
          message={field.alertMessage ?? ''}
          variant={field.alertVariant ?? 'warning'}
          collapsible={!!field.alertCollapsible}
          required={field.required}
          hideLabel={labelHidden}
        />
      )
  }
}

export default FormFieldsGrid
