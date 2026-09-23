import { useState } from 'react'
import type { FieldVisibilityRule, FieldVisibilityRuleAction, FormDef } from '../types'
import {
  fieldVisibilityRulesHaveCycle,
  newFieldVisibilityRuleId,
} from '../utils/fieldVisibilityRules'
import { resolveDemoSelectOptions } from '../utils/demoSelectOptions'

interface Props {
  form: FormDef
  onMutateForm: (updater: (form: FormDef) => FormDef) => void
}

function createDefaultRule(form: FormDef): FieldVisibilityRule | null {
  const firstBool = form.fields.find((f) => f.type === 'boolean')
  if (firstBool) {
    return {
      id: newFieldVisibilityRuleId(),
      operator: 'eq',
      sourceFieldId: firstBool.id,
      action: 'hide',
      targetFieldIds: [],
      sourceKind: 'boolean',
      expectedBoolean: false,
    }
  }
  const firstOpt = form.fields.find((f) => f.type === 'textOptions')
  if (firstOpt) {
    const opt =
      resolveDemoSelectOptions({ options: firstOpt.options, label: firstOpt.label })[0] ?? ''
    return {
      id: newFieldVisibilityRuleId(),
      operator: 'eq',
      sourceFieldId: firstOpt.id,
      action: 'hide',
      targetFieldIds: [],
      sourceKind: 'textOptions',
      expectedOptionText: opt,
    }
  }
  return null
}

function ruleForNewSource(form: FormDef, prev: FieldVisibilityRule, sourceFieldId: string): FieldVisibilityRule {
  const field = form.fields.find((f) => f.id === sourceFieldId)
  const shared = {
    id: prev.id,
    operator: 'eq' as const,
    sourceFieldId,
    action: prev.action,
    targetFieldIds: prev.targetFieldIds.filter((id) => id !== sourceFieldId),
  }
  if (field?.type === 'boolean') {
    return { ...shared, sourceKind: 'boolean' as const, expectedBoolean: false }
  }
  if (field?.type === 'textOptions') {
    const opt =
      resolveDemoSelectOptions({ options: field.options, label: field.label })[0] ?? ''
    return { ...shared, sourceKind: 'textOptions' as const, expectedOptionText: opt }
  }
  return prev
}

export default function FormMetadataTab({ form, onMutateForm }: Props) {
  const [openHiddenLabels, setOpenHiddenLabels] = useState(true)
  const [openRulesSection, setOpenRulesSection] = useState(true)
  const [openRuleAccordion, setOpenRuleAccordion] = useState<Record<string, boolean>>({})

  const validIds = new Set(form.fields.map((f) => f.id))
  const selectedIds = (form.hiddenLabelFieldIds ?? []).filter((id) => validIds.has(id))

  const fieldsById = new Map(form.fields.map((f) => [f.id, f]))
  const availableFields = form.fields.filter((f) => !selectedIds.includes(f.id))

  const sourceCandidates = form.fields.filter((f) => f.type === 'boolean' || f.type === 'textOptions')
  const rules = (form.fieldVisibilityRules ?? []).filter((r) => validIds.has(r.sourceFieldId))
  const cycleError = fieldVisibilityRulesHaveCycle(rules)

  function addField(fieldId: string) {
    if (!fieldId || !validIds.has(fieldId)) return
    onMutateForm((f) => {
      const cur = (f.hiddenLabelFieldIds ?? []).filter((id) => validIds.has(id))
      if (cur.includes(fieldId)) return f
      return { ...f, hiddenLabelFieldIds: [...cur, fieldId] }
    })
  }

  function removeField(fieldId: string) {
    onMutateForm((f) => {
      const cur = (f.hiddenLabelFieldIds ?? []).filter((id) => validIds.has(id)).filter((id) => id !== fieldId)
      return { ...f, hiddenLabelFieldIds: cur.length ? cur : undefined }
    })
  }

  function addVisibilityRule() {
    const created = createDefaultRule(form)
    if (!created) return
    onMutateForm((f) => ({
      ...f,
      fieldVisibilityRules: [...(f.fieldVisibilityRules ?? []), created],
    }))
    setOpenRuleAccordion((prev) => ({ ...prev, [created.id]: true }))
  }

  function patchRule(ruleId: string, patch: Partial<FieldVisibilityRule>) {
    onMutateForm((f) => {
      const list = f.fieldVisibilityRules ?? []
      const next = list.map((r) => (r.id === ruleId ? ({ ...r, ...patch } as FieldVisibilityRule) : r))
      return { ...f, fieldVisibilityRules: next.length ? next : undefined }
    })
  }

  function setExpectedBoolean(ruleId: string, value: boolean) {
    onMutateForm((f) => {
      const list = f.fieldVisibilityRules ?? []
      const next = list.map((r) =>
        r.id === ruleId && r.sourceKind === 'boolean' ? { ...r, expectedBoolean: value } : r,
      )
      return { ...f, fieldVisibilityRules: next.length ? next : undefined }
    })
  }

  function setExpectedOptionText(ruleId: string, text: string) {
    onMutateForm((f) => {
      const list = f.fieldVisibilityRules ?? []
      const next = list.map((r) =>
        r.id === ruleId && r.sourceKind === 'textOptions' ? { ...r, expectedOptionText: text } : r,
      )
      return { ...f, fieldVisibilityRules: next.length ? next : undefined }
    })
  }

  function removeVisibilityRule(ruleId: string) {
    onMutateForm((f) => {
      const next = (f.fieldVisibilityRules ?? []).filter((r) => r.id !== ruleId)
      return { ...f, fieldVisibilityRules: next.length ? next : undefined }
    })
    setOpenRuleAccordion((prev) => {
      const copy = { ...prev }
      delete copy[ruleId]
      return copy
    })
  }

  function setRuleSource(ruleId: string, sourceFieldId: string) {
    onMutateForm((f) => {
      const list = f.fieldVisibilityRules ?? []
      const rule = list.find((x) => x.id === ruleId)
      if (!rule) return f
      const updated = ruleForNewSource(f, rule, sourceFieldId)
      const next = list.map((r) => (r.id === ruleId ? updated : r))
      return { ...f, fieldVisibilityRules: next }
    })
  }

  return (
    <div className="form-metadata">
      <div className={`acc${openHiddenLabels ? ' acc--open' : ''}`}>
        <button
          type="button"
          className="acc__header"
          onClick={() => setOpenHiddenLabels((v) => !v)}
          aria-expanded={openHiddenLabels}
        >
          <span className="acc__header-main">
            <span className="acc__name">Campos com nomes ocultados</span>
          </span>
          <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {openHiddenLabels && (
          <div className="acc__body">
            <p className="sidebar__sections-hint form-metadata__hint">
              Os campos escolhidos deixam de mostrar o label
            </p>
            {form.fields.length === 0 ? (
              <p className="sidebar__sections-hint sidebar__sections-hint--muted">
                Ainda não há campos nesta classe. Adicione-os na aba Campos.
              </p>
            ) : (
              <>
                <label className="acc__field">
                  <span className="acc__label">Adicionar campo</span>
                  <select
                    className="acc__input acc__select"
                    value=""
                    disabled={availableFields.length === 0}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v) addField(v)
                    }}
                  >
                    <option value="">
                      {availableFields.length === 0 ? 'Todos os campos já estão na lista' : 'Selecione um campo…'}
                    </option>
                    {availableFields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label.trim() || f.id}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="form-metadata__list-section">
                  <span className="acc__label form-metadata__list-label">Labels ocultos ({selectedIds.length})</span>
                  {selectedIds.length === 0 ? (
                    <p className="form-metadata__empty-list">Nenhum campo nesta lista.</p>
                  ) : (
                    <ul className="form-metadata__chip-list" aria-label="Campos com label oculto">
                      {selectedIds.map((id) => {
                        const f = fieldsById.get(id)
                        const title = f?.label.trim() || id
                        return (
                          <li key={id} className="form-metadata__chip">
                            <span className="form-metadata__chip-text">{title}</span>
                            <button
                              type="button"
                              className="form-metadata__chip-remove"
                              onClick={() => removeField(id)}
                              aria-label={`Remover «${title}» da lista`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path
                                  d="M6 6l12 12M18 6L6 18"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className={`acc${openRulesSection ? ' acc--open' : ''}`}>
        <button
          type="button"
          className="acc__header"
          onClick={() => setOpenRulesSection((v) => !v)}
          aria-expanded={openRulesSection}
        >
          <span className="acc__header-main">
            <span className="acc__name">Regras condicionais - Visibilidade e Edição</span>
          </span>
          <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {openRulesSection && (
          <div className="acc__body">
            <p className="sidebar__sections-hint form-metadata__hint">
              Regras aplicadas em sequência; para o mesmo campo alvo e mesma dimensão (visibilidade ou
              edição), a última regra que o afeta prevalece.
            </p>
            {sourceCandidates.length === 0 ? (
              <p className="sidebar__sections-hint sidebar__sections-hint--muted">
                Adicione pelo menos um campo «Sim/Não» ou «Opções em texto» para poder criar regras (origem da
                condição).
              </p>
            ) : null}
            {cycleError ? (
              <p className="form-metadata__rules-cycle form-metadata__rules-cycle--err" role="alert">
                Esta configuração cria um ciclo entre origem e alvos (indirectamente). Ajuste os alvos ou a ordem
                das regras.
              </p>
            ) : null}

            <div className="sidebar__subsection-acc-list">
              {rules.map((rule, idx) => {
                const ro = openRuleAccordion[rule.id] ?? false
                const srcField = fieldsById.get(rule.sourceFieldId)
                const targetIds = rule.targetFieldIds.filter((id) => validIds.has(id) && id !== rule.sourceFieldId)
                const targetPicklist = form.fields.filter(
                  (f) => f.id !== rule.sourceFieldId && !targetIds.includes(f.id),
                )

                return (
                  <div key={rule.id} className={`acc acc--nested${ro ? ' acc--open' : ''}`}>
                    <button
                      type="button"
                      className="acc__header acc__header--nested"
                      onClick={() => setOpenRuleAccordion((p) => ({ ...p, [rule.id]: !ro }))}
                      aria-expanded={ro}
                    >
                      <span className="acc__header-main">
                        <span className="acc__name">Regra {idx + 1}</span>
                      </span>
                      <svg className="acc__chevron" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M4 6l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {ro && (
                      <div className="acc__body acc__body--nested">
                        <label className="acc__field">
                          <span className="acc__label">Campo origem</span>
                          <select
                            className="acc__input acc__select"
                            value={rule.sourceFieldId}
                            onChange={(e) => setRuleSource(rule.id, e.target.value)}
                          >
                            {sourceCandidates.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.label.trim() || f.id}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="acc__field">
                          <span className="acc__label">Condição</span>
                          <span className="form-metadata__rule-eq">Igual a</span>
                        </label>

                        {rule.sourceKind === 'boolean' && srcField?.type === 'boolean' ? (
                          <label className="acc__field">
                            <span className="acc__label">Valor</span>
                            <select
                              className="acc__input acc__select"
                              value={rule.expectedBoolean ? '1' : '0'}
                              onChange={(e) => setExpectedBoolean(rule.id, e.target.value === '1')}
                            >
                              <option value="1">Sim</option>
                              <option value="0">Não</option>
                            </select>
                          </label>
                        ) : null}

                        {rule.sourceKind === 'textOptions' && srcField?.type === 'textOptions' ? (
                          <label className="acc__field">
                            <span className="acc__label">Valor (texto da opção)</span>
                            <select
                              className="acc__input acc__select"
                              value={
                                (srcField.options ?? []).includes(rule.expectedOptionText)
                                  ? rule.expectedOptionText
                                  : (srcField.options?.[0] ?? rule.expectedOptionText)
                              }
                              onChange={(e) => setExpectedOptionText(rule.id, e.target.value)}
                            >
                              {(
                                resolveDemoSelectOptions({
                                  options: srcField.options,
                                  label: srcField.label,
                                })
                              ).map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                            </select>
                          </label>
                        ) : null}

                        <label className="acc__field">
                          <span className="acc__label">Ação</span>
                          <select
                            className="acc__input acc__select"
                            value={rule.action}
                            onChange={(e) =>
                              patchRule(rule.id, { action: e.target.value as FieldVisibilityRuleAction })
                            }
                          >
                            <option value="hide">Ocultar campos</option>
                            <option value="show">Mostrar campos</option>
                            <option value="readonly">Tornar só leitura</option>
                            <option value="editable">Tornar editável</option>
                          </select>
                        </label>

                        <div className="form-metadata__list-section">
                          <label className="acc__field">
                            <span className="acc__label">Campos alvo</span>
                            <select
                              key={`${rule.id}-targets-${targetIds.join('|')}`}
                              className="acc__input acc__select"
                              value=""
                              disabled={targetPicklist.length === 0}
                              onChange={(e) => {
                                const v = e.target.value
                                if (!v) return
                                patchRule(rule.id, {
                                  targetFieldIds: [...targetIds, v],
                                })
                              }}
                            >
                              <option value="">
                                {targetPicklist.length === 0
                                  ? 'Todos os campos raiz já são alvo ou origem'
                                  : 'Adicionar campo alvo…'}
                              </option>
                              {targetPicklist.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.label.trim() || f.id}
                                </option>
                              ))}
                            </select>
                          </label>
                          {targetIds.length === 0 ? (
                            <p className="form-metadata__empty-list">Nenhum campo alvo.</p>
                          ) : (
                            <ul className="form-metadata__chip-list" aria-label="Campos alvo">
                              {targetIds.map((id) => {
                                const f = fieldsById.get(id)
                                const title = f?.label.trim() || id
                                return (
                                  <li key={id} className="form-metadata__chip">
                                    <span className="form-metadata__chip-text">{title}</span>
                                    <button
                                      type="button"
                                      className="form-metadata__chip-remove"
                                      onClick={() =>
                                        patchRule(rule.id, { targetFieldIds: targetIds.filter((x) => x !== id) })
                                      }
                                      aria-label={`Remover «${title}» dos alvos`}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                        <path
                                          d="M6 6l12 12M18 6L6 18"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    </button>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>

                        <button
                          type="button"
                          className="acc__remove acc__remove--nested"
                          onClick={() => removeVisibilityRule(rule.id)}
                        >
                          Remover esta regra
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              className="acc__nested-add"
              disabled={sourceCandidates.length === 0}
              onClick={addVisibilityRule}
            >
              Adicionar regra
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
