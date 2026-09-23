import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import {
  EmbeddedNestedPopupProvider,
  type EmbeddedNestedPopupPayload,
} from '../contexts/EmbeddedNestedPopupContext'
import type { FormDef, FormMethod } from '../types'
import { fieldSupportsMultiple, isFormFieldVisibleInForm } from '../types'
import { useCanvasRuntimeValues } from '../contexts/CanvasRuntimeValuesContext'
import { canvasRuntimeFieldKey, type CanvasEmbAncestor } from '../utils/canvasRuntimeValueKey'
import { demoValueAsSingleLineSummary } from '../utils/fieldDemoValue'
import { getActiveExamplePreset, getScalarDemoForField } from '../utils/formExamplePresets'
import { resolvePresetIconBackground } from '../utils/presetIconColor'
import { orderRootFieldsForDisplay } from '../utils/formSections'
import { useCanvasFieldVisible } from '../hooks/useCanvasFieldVisible'
import { rowsForParentEmbed } from '../utils/embeddedDemo'
import { formIdentityTitleLines, findFormById } from '../utils/linkedForm'
import { normalizeSectionIconLigature } from '../utils/sectionIcon'
import { tryRunBuiltInFormMethod } from '../utils/formMethodActions'
import { filterVisibleFormMethods } from '../utils/formMethodVisibility'
import { executeDemandaFormMethod, isDemandaLiveForm } from '../utils/demandaAtlasLive'
import { useDemandasShared } from '../shared/demandaSharedStore'
import {
  formatFormHighlightTagText,
  splitHighlightRowsIntoTags,
} from '../utils/formHighlightTags'
import { runValidarCnpjProtoOrg } from '../utils/atlasProtoOrgMethods'
import { CanvasRuntimeValuesProvider } from '../contexts/CanvasRuntimeValuesContext'
import FormFieldsGrid, { EmbeddedReferenceBlock } from './FormFieldsGrid'
import { FormSectionedLayout } from './FormSectionedLayout'
import AlertField from './fields/AlertField'
import HtmlField from './fields/HtmlField'

interface Props {
  form: FormDef
  /** Formulários do épico (ref. embutida por `linkedFormId`). */
  epicForms: FormDef[]
  showSpecs?: boolean
  /**
   * Se definido, mostra o alternador «Detalhamento dos campos» na faixa cinza do formulário.
   * Omitido: sem controlo (ex.: preview de workspace).
   */
  onToggleSpecs?: () => void
  /**
   * Somente leitura no canvas (não altera `readOnly` dos campos no modelo).
   * Ex.: `defaultCanvasMode` do formulário na aba Formulários.
   */
  canvasReadOnly?: boolean
  /**
   * Quando `canvasReadOnly` está ativo: define se usa o cromado normal de leitura
   * ou um visual igual ao modo edição (sem barra de leitura), mantendo os campos bloqueados.
   */
  readOnlyViewStyle?: 'default' | 'editLike'
  /**
   * Modo edição: ao clicar no botão verde de confirmação (rodapé decorativo).
   * Só aplicado quando `canvasReadOnly` é falso.
   */
  onEditConfirmClick?: () => void
  /**
   * Grava valores do canvas no cenário de exemplo activo e persiste `forms.json`.
   * Com esta callback, o botão verde fica activo mesmo em modo leitura.
   */
  onSaveCanvas?: (runtimeMap: Record<string, string>) => void
  /**
   * Mensagem do estado vazio: no editor pede o painel lateral; noutros contextos (ex. preview de fluxo) texto neutro.
   */
  emptyHint?: 'editor' | 'generic'
  /**
   * Modo leitura: ao clicar num método (chip ou item do menu ⋮), recebe o id do `FormMethod`.
   * Ex.: preview de workspace com navegação entre etapas.
   */
  onReadModeMethodClick?: (methodId: string) => void
  /**
   * Após método embutido (ex.: Análise e Decisão): patches de campo e aba preferencial.
   * Usado pelo workspace para atualizar o card do atendimento.
   */
  onBuiltInMethodApplied?: (info: {
    methodId: string
    fieldPatches: Record<string, string>
    preferSectionId?: string
    toast?: string
  }) => void
  /**
   * Com `canvasReadOnly`: mantém barra de métodos, mas permite editar campos
   * que não são `readOnly` no modelo (atuação no atendimento).
   */
  allowFieldEditsWhileReadMethods?: boolean
  /** Atualiza o `spec` de um campo em qualquer formulário do épico. */
  onUpdateFieldSpec?: (formId: string, fieldId: string, spec: string) => void
  /**
   * Ação de botão HTML no canvas da Organização (ex.: adicionar-etapas).
   * Recebe o mapa de valores do runtime para ler seleções.
   */
  onOrgHtmlAction?: (action: string, runtimeMap: Record<string, string>) => void
}

const FORM_SPEC_TOGGLE_LABEL = 'Detalhamento dos campos'

function FormContextBar({
  formName,
  specToggle,
}: {
  formName: string
  specToggle?: { on: boolean; onToggle: () => void }
}) {
  return (
    <div className="canvas__form-context-bar" role="region" aria-label="Formulário">
      <span className="canvas__form-context-bar__name" title={formName}>
        {formName}
      </span>
      {specToggle ? (
        <div className="canvas__form-context-bar__spec">
          <label className="canvas__form-context-bar__toggle">
            <span className="canvas__form-context-bar__toggle-label">{FORM_SPEC_TOGGLE_LABEL}</span>
            <button
              type="button"
              className={`acc__toggle ${specToggle.on ? 'acc__toggle--on' : ''}`}
              onClick={specToggle.onToggle}
              role="switch"
              aria-checked={specToggle.on}
              aria-label={FORM_SPEC_TOGGLE_LABEL}
            >
              <span className="acc__toggle-thumb" />
            </button>
          </label>
        </div>
      ) : null}
    </div>
  )
}

/** Barra em pílula (só visual): Detalhes + ícones — hover com cursor e escurecimento. */
function FormReadModePillBar() {
  const stop = (e: ReactMouseEvent<HTMLSpanElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }
  return (
    <div className="canvas__form-read-pillbar" aria-hidden>
      <span className="canvas__form-read-pillbar__detalhes">
        <span className="canvas__form-read-pillbar__hit" onMouseDown={stop}>
          <span className="material-symbols-outlined canvas__form-read-pillbar__mi-article" aria-hidden>
            article
          </span>
        </span>
        <span className="canvas__form-read-pillbar__hit canvas__form-read-pillbar__hit--label" onMouseDown={stop}>
          Detalhes
        </span>
        <span className="canvas__form-read-pillbar__hit" onMouseDown={stop}>
          <span className="material-symbols-outlined canvas__form-read-pillbar__mi-keep" aria-hidden>
            keep
          </span>
        </span>
      </span>
      <span
        className="canvas__form-read-pillbar__icon canvas__form-read-pillbar__icon--slot"
        onMouseDown={stop}
      >
        <span className="material-symbols-outlined canvas__form-read-pillbar__mi-dados" aria-hidden>
          hub
        </span>
      </span>
      <span
        className="canvas__form-read-pillbar__icon canvas__form-read-pillbar__icon--slot"
        onMouseDown={stop}
      >
        <span className="material-symbols-outlined canvas__form-read-pillbar__mi-social" aria-hidden>
          3p
        </span>
      </span>
    </div>
  )
}

function FormReadModeMethodChips({
  methods,
  onMethodClick,
}: {
  /** Apenas métodos em destaque (chips na barra). */
  methods: FormMethod[]
  onMethodClick?: (methodId: string) => void
}) {
  const stop = (e: ReactMouseEvent<HTMLSpanElement | HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }
  if (!methods.length) return null
  return (
    <div className="canvas__form-read-methods-wrap" role="group" aria-label="Métodos em destaque">
      <ul className="canvas__form-read-methods">
        {methods.map((m) => {
          const lig = normalizeSectionIconLigature(m.icon)
          const inner = (
            <>
              {lig ? (
                <span className="material-symbols-outlined canvas__form-read-method__icon" aria-hidden>
                  {lig}
                </span>
              ) : (
                <span className="canvas__form-read-method__icon-placeholder" aria-hidden>
                  ◇
                </span>
              )}
              <span className="canvas__form-read-method__label">{m.name || 'Sem nome'}</span>
            </>
          )
          return (
            <li key={m.id} className="canvas__form-read-methods__item">
              {onMethodClick ? (
                <button
                  type="button"
                  className="canvas__form-read-method canvas__form-read-method--destaque"
                  onMouseDown={stop}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onMethodClick(m.id)
                  }}
                >
                  {inner}
                </button>
              ) : (
                <span className="canvas__form-read-method canvas__form-read-method--destaque" onMouseDown={stop}>
                  {inner}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** ⋮ + lista suspensa com métodos configurados como «Menu». */
function FormReadModeMenuMethodsDropdown({
  menuMethods,
  onMethodClick,
}: {
  menuMethods: FormMethod[]
  onMethodClick?: (methodId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: globalThis.MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!menuMethods.length) return null

  const stop = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="canvas__form-read-menu-dropdown-wrap" ref={wrapRef}>
      <button
        type="button"
        className="canvas__form-read-menu-btn"
        aria-label="Mais métodos"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="6" r="1.75" fill="currentColor" />
          <circle cx="12" cy="12" r="1.75" fill="currentColor" />
          <circle cx="12" cy="18" r="1.75" fill="currentColor" />
        </svg>
      </button>
      {open ? (
        <ul className="form-list__dropdown canvas__form-read-methods-dropdown" role="menu">
          {menuMethods.map((m) => {
            const lig = normalizeSectionIconLigature(m.icon)
            return (
              <li key={m.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="form-list__dropdown-item canvas__form-read-methods-dropdown__item"
                  onMouseDown={stop}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onMethodClick?.(m.id)
                    setOpen(false)
                  }}
                >
                  {lig ? (
                    <span className="material-symbols-outlined canvas__form-read-methods-dropdown__icon" aria-hidden>
                      {lig}
                    </span>
                  ) : (
                    <span className="canvas__form-read-method__icon-placeholder" aria-hidden>
                      ◇
                    </span>
                  )}
                  <span className="canvas__form-read-methods-dropdown__label">{m.name || 'Sem nome'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

/** Faixa branca com métodos (fixa no topo em leitura no canvas principal). */
function FormReadModeMenuBar({
  methods,
  onReadModeMethodClick,
}: {
  methods: FormMethod[]
  onReadModeMethodClick?: (methodId: string) => void
}) {
  const destaqueMethods = methods.filter((m) => m.kind === 'destaque')
  const menuMethods = methods.filter((m) => m.kind === 'menu')
  const showMethodsBlock = destaqueMethods.length > 0 || menuMethods.length > 0
  return (
    <div className="canvas__form-read-menu">
      <div className="canvas__form-read-menu-start">
        <FormReadModePillBar />
      </div>
      <div className="canvas__form-read-menu-end">
        {showMethodsBlock ? <div className="canvas__form-read-menu-sep" aria-hidden /> : null}
        <FormReadModeMethodChips methods={destaqueMethods} onMethodClick={onReadModeMethodClick} />
        <FormReadModeMenuMethodsDropdown menuMethods={menuMethods} onMethodClick={onReadModeMethodClick} />
      </div>
    </div>
  )
}

/** Barra branca com métodos (fixa no topo em leitura no canvas principal). */
function FormReadModeMenuBarConnected({
  form,
  epicForms,
  onReadModeMethodClick,
  onOpenMethodInputForm,
  onBuiltInMethodApplied,
  onPreferSection,
}: {
  form: FormDef
  epicForms: FormDef[]
  onReadModeMethodClick?: (methodId: string) => void
  onOpenMethodInputForm?: (
    method: FormMethod,
    inputForm: FormDef,
    opts?: {
      titleOverride?: string
      seedFieldValues?: Record<string, string>
      mirrorToFormId?: string
      preferModalSectionId?: string
      demandaMethodExecuteOnConfirm?: boolean
    },
  ) => void
  onBuiltInMethodApplied?: (info: {
    methodId: string
    fieldPatches: Record<string, string>
    preferSectionId?: string
    toast?: string
  }) => void
  onPreferSection?: (sectionId: string) => void
}) {
  const runtime = useCanvasRuntimeValues()
  const [demandasLive] = useDemandasShared()
  const runtimeValuesKey = runtime ? JSON.stringify(runtime.getAllValues()) : ''
  const demandasStatusKey = isDemandaLiveForm(form.id)
    ? demandasLive.map((d) => `${d.id}:${d.status}:${d.termoRecusado ? 1 : 0}:${d.qualificado ? 1 : 0}`).join('|')
    : ''
  const visibleMethods = useMemo(
    () => filterVisibleFormMethods(form, form.methods, runtime?.getValue),
    [form, runtime?.getValue, runtimeValuesKey, demandasStatusKey],
  )
  const handleMethodClick = (methodId: string) => {
    const result = tryRunBuiltInFormMethod(
      form,
      methodId,
      runtime?.getValue,
      epicForms,
      runtime?.setValue,
    )
    if (result.handled) {
      if (result.errorToast && !result.openInputForm) {
        onBuiltInMethodApplied?.({
          methodId,
          fieldPatches: {},
          toast: result.errorToast,
        })
        return
      }
      if (
        (result.fieldPatches && Object.keys(result.fieldPatches).length > 0) ||
        result.toast
      ) {
        onBuiltInMethodApplied?.({
          methodId,
          fieldPatches: result.fieldPatches ?? {},
          preferSectionId: result.preferSectionId,
          toast: result.toast,
        })
      }
      if (result.preferSectionId) onPreferSection?.(result.preferSectionId)
      const method = form.methods?.find((m) => m.id === methodId)
      const inputFormId = result.inputFormId || method?.inputFormId
      if (result.openInputForm && inputFormId && onOpenMethodInputForm) {
        const inputForm = findFormById(epicForms, inputFormId)
        if (inputForm) {
          onOpenMethodInputForm(method ?? { id: methodId, name: inputForm.name, icon: 'play_arrow', kind: 'destaque' }, inputForm, {
            titleOverride: result.inputFormTitle,
            seedFieldValues: result.seedFieldValues,
            mirrorToFormId: result.mirrorToFormId,
            preferModalSectionId: result.preferModalSectionId,
            demandaMethodExecuteOnConfirm: result.demandaMethodExecuteOnConfirm,
          })
        }
      }
      return
    }
    const method = form.methods?.find((m) => m.id === methodId)
    if (method?.inputFormId && onOpenMethodInputForm) {
      const inputForm = findFormById(epicForms, method.inputFormId)
      if (inputForm) {
        onOpenMethodInputForm(method, inputForm)
        return
      }
    }
    onReadModeMethodClick?.(methodId)
  }
  return (
    <FormReadModeMenuBar methods={visibleMethods} onReadModeMethodClick={handleMethodClick} />
  )
}

function MethodInputFormOverlay({
  method,
  inputForm,
  epicForms,
  showSpecs,
  onClose,
  titleId,
  titleOverride,
  seedFieldValues,
  mirrorToFormId,
  parentSetValue,
  preferredTabSectionId,
  parentForm,
  parentGetValue,
  demandaMethodExecuteOnConfirm,
  onDemandaMethodExecuted,
}: {
  method: FormMethod
  inputForm: FormDef
  epicForms: FormDef[]
  showSpecs?: boolean
  onClose: () => void
  titleId: string
  titleOverride?: string
  /** Valores por fieldId (não chave completa). */
  seedFieldValues?: Record<string, string>
  /** Se definido, edições no modal espelham na classe com este formId. */
  mirrorToFormId?: string
  parentSetValue?: (key: string, value: string) => void
  preferredTabSectionId?: string
  parentForm?: FormDef
  parentGetValue?: (k: string) => string | undefined
  demandaMethodExecuteOnConfirm?: boolean
  onDemandaMethodExecuted?: (info: {
    methodId: string
    fieldPatches: Record<string, string>
    toast?: string
  }) => void
}) {
  const title =
    titleOverride?.trim() || inputForm.name?.trim() || method.name?.trim() || 'Parâmetro de método'

  /** Alinha preset do modal ao status semeado (ex.: Atender — carrega Solicitação embutida por aba). */
  const formForOverlay = useMemo(() => {
    const status = seedFieldValues?.['nen-ad-status']?.trim()
    if (!status || !inputForm.exampleValuePresets?.length) return inputForm
    const match = inputForm.exampleValuePresets.find(
      (p) => String(p.fieldValues?.['nen-ad-status'] ?? '').trim() === status,
    )
    if (!match || inputForm.activeExamplePresetId === match.id) return inputForm
    return { ...inputForm, activeExamplePresetId: match.id }
  }, [inputForm, seedFieldValues])

  const initialValues = useMemo(() => {
    const out: Record<string, string> = {}
    if (!seedFieldValues) return out
    for (const [fieldId, value] of Object.entries(seedFieldValues)) {
      out[canvasRuntimeFieldKey(formForOverlay.id, [], fieldId)] = value
    }
    return out
  }, [seedFieldValues, formForOverlay.id])

  const onSetValue = useMemo(() => {
    if (!mirrorToFormId || !parentSetValue) return undefined
    return (key: string, value: string) => {
      const parts = key.split('::')
      const fieldId = parts[parts.length - 1]
      if (!fieldId) return
      parentSetValue(canvasRuntimeFieldKey(mirrorToFormId, [], fieldId), value)
    }
  }, [mirrorToFormId, parentSetValue])

  return (
    <CanvasRuntimeValuesProvider initialValues={initialValues} onSetValue={onSetValue}>
      <MethodInputFormOverlayBody
        method={method}
        formForOverlay={formForOverlay}
        epicForms={epicForms}
        showSpecs={showSpecs}
        onClose={onClose}
        titleId={titleId}
        title={title}
        preferredTabSectionId={preferredTabSectionId}
        parentForm={parentForm}
        parentGetValue={parentGetValue}
        demandaMethodExecuteOnConfirm={demandaMethodExecuteOnConfirm}
        onDemandaMethodExecuted={onDemandaMethodExecuted}
      />
    </CanvasRuntimeValuesProvider>
  )
}

function MethodInputFormOverlayBody({
  method,
  formForOverlay,
  epicForms,
  showSpecs,
  onClose,
  titleId,
  title,
  preferredTabSectionId,
  parentForm,
  parentGetValue,
  demandaMethodExecuteOnConfirm,
  onDemandaMethodExecuted,
}: {
  method: FormMethod
  formForOverlay: FormDef
  epicForms: FormDef[]
  showSpecs?: boolean
  onClose: () => void
  titleId: string
  title: string
  preferredTabSectionId?: string
  parentForm?: FormDef
  parentGetValue?: (k: string) => string | undefined
  demandaMethodExecuteOnConfirm?: boolean
  onDemandaMethodExecuted?: (info: {
    methodId: string
    fieldPatches: Record<string, string>
    toast?: string
  }) => void
}) {
  const runtime = useCanvasRuntimeValues()

  const handleConfirmDemanda = () => {
    if (!parentForm || !demandaMethodExecuteOnConfirm) {
      onClose()
      return
    }
    const methodValues = runtime?.getAllValues() ?? {}
    const r = executeDemandaFormMethod(
      parentForm,
      method.id,
      methodValues,
      parentGetValue,
    )
    if (!r.ok) {
      onDemandaMethodExecuted?.({ methodId: method.id, fieldPatches: {}, toast: r.erro })
      return
    }
    onDemandaMethodExecuted?.({
      methodId: method.id,
      fieldPatches: r.fieldPatches,
      toast: r.toast,
    })
    onClose()
  }

  return (
    <div
      className="canvas__form-nested-embedded-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="canvas__form-nested-embedded-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="canvas__form-nested-embedded-overlay__head">
          <h2 id={titleId} className="canvas__form-nested-embedded-overlay__title">
            {title}
          </h2>
          <button
            type="button"
            className="canvas__form-nested-embedded-overlay__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="canvas__form-nested-embedded-overlay__body canvas__form-nested-embedded-overlay__body--popup-field-pad">
          <FormSectionedLayout
            form={formForOverlay}
            readCanvas={false}
            preferredTabSectionId={preferredTabSectionId}
            fieldVisibilityCtx={{ canvasFormDefId: formForOverlay.id, canvasAncestors: [] }}
            renderFields={(sectionFields) => (
              <FormFieldsGrid
                fields={sectionFields}
                showSpecs={showSpecs}
                canvasReadOnly={false}
                presetForm={formForOverlay}
                epicForms={epicForms}
                embeddedAncestorFormIds={[formForOverlay.id]}
                canvasFormDefId={formForOverlay.id}
                canvasAncestors={[]}
              />
            )}
          />
        </div>
        {demandaMethodExecuteOnConfirm ? (
          <div className="canvas__form-nested-embedded-overlay__foot" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border, #e5e7eb)' }}>
            <button type="button" className="canvas__btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="canvas__btn canvas__btn--primary" onClick={handleConfirmDemanda}>
              Executar método
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Identidade + destaque (rolam com o miolo no canvas principal). */
function FormReadModeIdentityHighlight({ form }: { form: FormDef }) {
  const preset = getActiveExamplePreset(form)
  const avatarBg = resolvePresetIconBackground(preset)
  const runtime = useCanvasRuntimeValues()
  const fieldVisible = useCanvasFieldVisible(form, { canvasFormDefId: form.id, canvasAncestors: [] })
  const identityLines = useMemo(
    () =>
      formIdentityTitleLines(form, {
        nestedFormId: form.id,
        canvasAncestors: [],
        getOverride: runtime?.getValue,
        examplePreset: preset,
      }),
    [form, preset, runtime],
  )
  const highlightRows = useMemo(() => {
    return orderRootFieldsForDisplay(form)
      .filter((f) => f.relevance === 'highlight' && fieldVisible(f))
      .map((field) => {
        const k = canvasRuntimeFieldKey(form.id, [], field.id)
        const ov = runtime?.getValue(k)
        const raw =
          ov !== undefined ? ov : demoValueAsSingleLineSummary(field, getScalarDemoForField(form, field.id))
        const value = raw.trim().length > 0 ? raw.trim() : '—'
        return { id: field.id, label: field.label.trim() || 'Campo', value }
      })
  }, [form, runtime, fieldVisible])

  const { tags: tagRows, textRows: textHighlightRows } = useMemo(
    () => splitHighlightRowsIntoTags(form, highlightRows),
    [form, highlightRows],
  )

  const identitySingleLine = identityLines.length === 1

  return (
    <div className="canvas__form-read-identity-wrap">
      <div
        className={`canvas__form-read-identity${identitySingleLine ? ' canvas__form-read-identity--single-line' : ''}`}
      >
        <span
          className="canvas__form-read-identity-avatar canvas__form-read-identity-avatar--gloss"
          style={{ background: avatarBg }}
          aria-hidden
        />
        <div className="canvas__form-read-identity-text" aria-label={identityLines.join(', ')}>
          {identityLines.map((line, i) => (
            <span
              key={`${i}:${line}`}
              className={`canvas__form-read-identity-line${i === 0 ? ' canvas__form-read-identity-line--primary' : ' canvas__form-read-identity-line--subtitle'}`}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
      {tagRows.length > 0 ? (
        <div className="canvas__form-read-flags" role="list" aria-label="Status e flags">
          {tagRows.map((tag) => (
            <span
              key={tag.id}
              className={`canvas__form-read-flag canvas__form-read-flag--${tag.tone}`}
              role="listitem"
              title={`${tag.label}: ${tag.value}`}
            >
              <span className="material-symbols-outlined canvas__form-read-flag-icon" aria-hidden>
                {tag.tone === 'success'
                  ? 'check_circle'
                  : tag.tone === 'danger'
                    ? 'cancel'
                    : tag.tone === 'consumo' || tag.tone === 'suporte'
                      ? 'category'
                      : 'info'}
              </span>
              <span className="canvas__form-read-flag-text">
                {formatFormHighlightTagText(tag.label, tag.value)}
              </span>
            </span>
          ))}
        </div>
      ) : null}
      {textHighlightRows.length > 0 ? (
        <div className="canvas__form-read-highlight" role="region" aria-label="Campos em destaque">
          {textHighlightRows.map((row) => (
            <div key={row.id} className="canvas__form-read-highlight-row">
              <span className="canvas__form-read-highlight-key">{row.label}</span>
              <span className="canvas__form-read-highlight-sep" aria-hidden>
                :
              </span>
              <span className="canvas__form-read-highlight-val">{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Rodapé: botão verde grava ou confirma (BPMN). */
function FormEditDecorActions({
  onConfirm,
  confirmAriaLabel = 'Confirmar e ir para a etapa configurada',
}: {
  onConfirm?: () => void
  confirmAriaLabel?: string
}) {
  const interactive = Boolean(onConfirm)
  return (
    <div
      className="canvas__form-footer-actions"
      role={interactive ? 'toolbar' : undefined}
      aria-label={interactive ? 'Ações do formulário' : undefined}
      aria-hidden={interactive ? undefined : true}
    >
      <button
        type="button"
        className="canvas__form-fab canvas__form-fab--cancel"
        tabIndex={-1}
        onClick={(e) => e.preventDefault()}
      >
        <svg className="canvas__form-fab-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className="canvas__form-fab canvas__form-fab--confirm"
        tabIndex={interactive ? 0 : -1}
        aria-label={interactive ? confirmAriaLabel : undefined}
        onClick={(e) => {
          e.preventDefault()
          onConfirm?.()
        }}
      >
        <svg className="canvas__form-fab-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

/** Miolo do modal: ref. embutida (form linkado ou múltiplo), HTML ou alerta — em célula de tabela. */
function NestedEmbeddedLinkedFormView({ payload }: { payload: EmbeddedNestedPopupPayload }) {
  const field = payload.field

  if (field.type === 'html') {
    const ro =
      payload.linkedFormReadOnly ??
      (payload.canvasReadOnly || payload.parentInheritedReadOnly || field.readOnly)
    return (
      <HtmlField
        label={field.label}
        htmlContent={field.htmlContent ?? ''}
        readOnly={ro}
        hideLabel
        required={field.required}
      />
    )
  }

  if (field.type === 'alert') {
    return (
      <AlertField
        label={field.label}
        title={field.alertTitle ?? ''}
        message={field.alertMessage ?? ''}
        variant={field.alertVariant ?? 'warning'}
        collapsible={!!field.alertCollapsible}
        required={field.required}
        hideLabel
      />
    )
  }

  const linkedId = field.linkedFormId
  const linkedForm = linkedId ? findFormById(payload.epicForms, linkedId) : undefined
  const nestedFormDefId = linkedId ?? ''

  if (field.type !== 'embeddedReference') {
    return <p className="canvas__section-empty">Tipo de campo não suportado.</p>
  }

  if (linkedId && payload.embeddedAncestorFormIds.includes(linkedId)) {
    return (
      <p className="canvas__section-empty field__embedded-cycle-msg">
        Referência cíclica: o vínculo aponta para um formulário já presente nesta cadeia de embutidos.
        Ajuste o campo no editor ou escolha outro formulário.
      </p>
    )
  }

  if (!linkedForm || linkedForm.fields.length === 0) {
    return (
      <p className="canvas__section-empty">
        Vincule um formulário a este bloco ou defina campos no formulário linkado.
      </p>
    )
  }

  /* Ref. embutida múltipla: mesmo bloco que no formulário (instâncias, +, tabela/accordion). */
  if (field.multiple && fieldSupportsMultiple(field.type)) {
    return (
      <EmbeddedReferenceBlock
        field={field}
        showSpecs={payload.showSpecs}
        parentInheritedReadOnly={payload.parentInheritedReadOnly}
        canvasReadOnly={payload.canvasReadOnly}
        presetForm={payload.presetForm}
        parentEmbeddedDemoCtx={payload.parentEmbeddedDemoCtx}
        epicForms={payload.epicForms}
        embeddedAncestorFormIds={payload.embeddedAncestorFormIds}
        canvasAncestors={payload.canvasAncestors}
        onUpdateFieldSpec={payload.onUpdateFieldSpec}
        suppressOuterLabel
      />
    )
  }

  const nextHostPresetRow = payload.parentEmbeddedDemoCtx
    ? rowsForParentEmbed(
        payload.parentEmbeddedDemoCtx.hostForm,
        payload.parentEmbeddedDemoCtx.embedField,
        payload.parentEmbeddedDemoCtx.hostPresetRow,
      )?.[payload.parentEmbeddedDemoCtx.instanceIndex]
    : undefined

  const ro =
    payload.linkedFormReadOnly ??
    (payload.canvasReadOnly || payload.parentInheritedReadOnly || field.readOnly)
  const childAncestors = linkedId ? [...payload.embeddedAncestorFormIds, linkedId] : payload.embeddedAncestorFormIds
  const gridAncestors: CanvasEmbAncestor[] = [
    ...payload.canvasAncestors,
    { embeddedFieldId: field.id, instanceIndex: 0 },
  ]

  return (
    <FormSectionedLayout
      form={linkedForm}
      readCanvas={payload.canvasReadOnly}
      fieldVisibilityCtx={{
        canvasFormDefId: nestedFormDefId,
        canvasAncestors: gridAncestors,
      }}
      renderFields={(sectionFields) => (
        <FormFieldsGrid
          fields={sectionFields}
          showSpecs={payload.showSpecs}
          inheritedReadOnly={ro}
          canvasReadOnly={payload.canvasReadOnly}
          presetForm={linkedForm}
          embeddedDemoCtx={{
            hostForm: payload.presetForm,
            embedField: field,
            instanceIndex: 0,
            hostPresetRow: nextHostPresetRow,
          }}
          epicForms={payload.epicForms}
          embeddedAncestorFormIds={childAncestors}
          canvasFormDefId={nestedFormDefId}
          canvasAncestors={gridAncestors}
          onUpdateFieldSpec={payload.onUpdateFieldSpec}
        />
      )}
    />
  )
}

function FormCanvasInner({
  form,
  epicForms,
  showSpecs,
  onToggleSpecs,
  canvasReadOnly = false,
  readOnlyViewStyle = 'default',
  onEditConfirmClick,
  onSaveCanvas,
  emptyHint = 'editor',
  onReadModeMethodClick,
  onBuiltInMethodApplied,
  allowFieldEditsWhileReadMethods = false,
  onUpdateFieldSpec,
  onOrgHtmlAction,
}: Props) {
  const runtime = useCanvasRuntimeValues()
  const fields = form.fields
  const nestedEmbeddedDialogTitleId = useId()
  const methodInputDialogTitleId = useId()
  const [nestedPopup, setNestedPopup] = useState<EmbeddedNestedPopupPayload | null>(null)
  const [methodInputPopup, setMethodInputPopup] = useState<{
    method: FormMethod
    inputForm: FormDef
    titleOverride?: string
    seedFieldValues?: Record<string, string>
    mirrorToFormId?: string
    preferModalSectionId?: string
    demandaMethodExecuteOnConfirm?: boolean
  } | null>(null)
  const [preferSectionId, setPreferSectionId] = useState<string | undefined>()
  const nestedPopupApi = useMemo(
    () => ({
      openNestedEmbeddedPopup: (p: EmbeddedNestedPopupPayload) => setNestedPopup(p),
      closeNestedEmbeddedPopup: () => setNestedPopup(null),
    }),
    [],
  )

  const fieldsCanvasReadOnly = canvasReadOnly && !allowFieldEditsWhileReadMethods

  const handleSaveCanvas = useCallback(() => {
    if (!onSaveCanvas || !runtime) return
    onSaveCanvas(runtime.getAllValues())
  }, [onSaveCanvas, runtime])

  const handleHtmlAction = useCallback(
    (action: string) => {
      if (!runtime) return
      if (action === 'validar-cnpj') {
        runValidarCnpjProtoOrg(runtime.getValue, runtime.setValue)
        return
      }
      onOrgHtmlAction?.(action, runtime.getAllValues())
    },
    [runtime, onOrgHtmlAction],
  )

  useEffect(() => {
    if (!nestedPopup && !methodInputPopup) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (methodInputPopup) setMethodInputPopup(null)
        else nestedPopupApi.closeNestedEmbeddedPopup()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [nestedPopup, methodInputPopup, nestedPopupApi])

  const openMethodInputForm = useCallback(
    (
      method: FormMethod,
      inputForm: FormDef,
      opts?: {
        titleOverride?: string
        seedFieldValues?: Record<string, string>
        mirrorToFormId?: string
        preferModalSectionId?: string
        demandaMethodExecuteOnConfirm?: boolean
      },
    ) => {
      setMethodInputPopup({
        method,
        inputForm,
        titleOverride: opts?.titleOverride,
        seedFieldValues: opts?.seedFieldValues,
        mirrorToFormId: opts?.mirrorToFormId,
        preferModalSectionId: opts?.preferModalSectionId,
        demandaMethodExecuteOnConfirm: opts?.demandaMethodExecuteOnConfirm,
      })
    },
    [],
  )

  const handlePreferSection = useCallback((sectionId: string) => {
    setPreferSectionId(sectionId)
  }, [])

  const handleBuiltInApplied = useCallback(
    (info: {
      methodId: string
      fieldPatches: Record<string, string>
      preferSectionId?: string
      toast?: string
    }) => {
      if (info.preferSectionId) setPreferSectionId(info.preferSectionId)
      onBuiltInMethodApplied?.(info)
    },
    [onBuiltInMethodApplied],
  )

  const specToggle =
    onToggleSpecs != null
      ? { on: Boolean(showSpecs), onToggle: onToggleSpecs }
      : undefined

  const useReadModeChrome = canvasReadOnly && readOnlyViewStyle !== 'editLike'
  const formContextBar = (
    <div className={`canvas__form-preface${useReadModeChrome ? ' canvas__form-preface--read-sticky' : ''}`}>
      <FormContextBar formName={form.name} specToggle={specToggle} />
    </div>
  )
  const formReadScrollTop = useReadModeChrome ? <FormReadModeIdentityHighlight form={form} /> : undefined
  const footerConfirm = onSaveCanvas ? handleSaveCanvas : onEditConfirmClick
  const showFooter =
    Boolean(footerConfirm) || (!canvasReadOnly && !allowFieldEditsWhileReadMethods)
  const formFooter = showFooter ? (
    <FormEditDecorActions
      onConfirm={footerConfirm}
      confirmAriaLabel={
        onSaveCanvas ? 'Salvar valores no cenário de exemplo' : 'Confirmar e ir para a etapa configurada'
      }
    />
  ) : null

  const popupBoundsOverlayClass =
    nestedPopup != null || methodInputPopup != null
      ? 'canvas__form-popup-bounds--nested-popup-open'
      : undefined

  const nestedEmbeddedOverlay =
    nestedPopup == null ? null : (
      <div
        className="canvas__form-nested-embedded-overlay"
        role="presentation"
        onClick={() => nestedPopupApi.closeNestedEmbeddedPopup()}
      >
        <div
          className="canvas__form-nested-embedded-overlay__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={nestedEmbeddedDialogTitleId}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="canvas__form-nested-embedded-overlay__head">
            <h2 id={nestedEmbeddedDialogTitleId} className="canvas__form-nested-embedded-overlay__title">
              {nestedPopup.field.label.trim() ||
                (nestedPopup.field.type === 'html'
                  ? 'HTML'
                  : nestedPopup.field.type === 'alert'
                    ? 'Alerta'
                    : 'Referência embutida')}
            </h2>
            <button
              type="button"
              className="canvas__form-nested-embedded-overlay__close"
              onClick={() => nestedPopupApi.closeNestedEmbeddedPopup()}
              aria-label="Fechar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div
            className={`canvas__form-nested-embedded-overlay__body${
              nestedPopup.field.type === 'html' ||
              nestedPopup.field.type === 'alert' ||
              (nestedPopup.field.type === 'embeddedReference' &&
                nestedPopup.field.multiple &&
                fieldSupportsMultiple(nestedPopup.field.type))
                ? ' canvas__form-nested-embedded-overlay__body--popup-field-pad'
                : ''
            }`}
          >
            <NestedEmbeddedLinkedFormView
              key={`${nestedPopup.field.id}-${nestedPopup.canvasAncestors.map((a) => `${a.embeddedFieldId}:${a.instanceIndex}`).join('|')}`}
              payload={nestedPopup}
            />
          </div>
        </div>
      </div>
    )

  const methodInputOverlay =
    methodInputPopup == null ? null : (
      <MethodInputFormOverlay
        method={methodInputPopup.method}
        inputForm={methodInputPopup.inputForm}
        epicForms={epicForms}
        showSpecs={showSpecs}
        onClose={() => setMethodInputPopup(null)}
        titleId={methodInputDialogTitleId}
        titleOverride={methodInputPopup.titleOverride}
        seedFieldValues={methodInputPopup.seedFieldValues}
        mirrorToFormId={methodInputPopup.mirrorToFormId}
        parentSetValue={runtime?.setValue}
        preferredTabSectionId={methodInputPopup.preferModalSectionId}
        parentForm={form}
        parentGetValue={runtime?.getValue}
        demandaMethodExecuteOnConfirm={methodInputPopup.demandaMethodExecuteOnConfirm}
        onDemandaMethodExecuted={handleBuiltInApplied}
      />
    )

  if (fields.length === 0 || !fields.some(isFormFieldVisibleInForm)) {
    const emptyBody = (
      <div className="canvas__placeholder">
        <span className="canvas__placeholder-icon">📋</span>
        <p>
          {emptyHint === 'generic'
            ? 'Este formulário ainda não tem campos.'
            : 'Adicione campos pelo painel lateral'}
        </p>
      </div>
    )
    const emptyCard = (
      <div
        className={`canvas__form canvas__form--empty-state${canvasReadOnly ? ' canvas__form--read' : ''}`}
      >
        {formContextBar}
        <div className={`canvas__form-popup-bounds${popupBoundsOverlayClass ? ` ${popupBoundsOverlayClass}` : ''}`}>
          {useReadModeChrome ? (
            <FormReadModeMenuBarConnected
              form={form}
              epicForms={epicForms}
              onReadModeMethodClick={onReadModeMethodClick}
              onOpenMethodInputForm={openMethodInputForm}
              onBuiltInMethodApplied={handleBuiltInApplied}
              onPreferSection={handlePreferSection}
            />
          ) : null}
          <div className="canvas__form-main">
            {formReadScrollTop}
            {emptyBody}
          </div>
          {formFooter}
          {nestedEmbeddedOverlay}
          {methodInputOverlay}
        </div>
      </div>
    )
    return (
      <EmbeddedNestedPopupProvider value={nestedPopupApi}>
        <section className="canvas canvas--empty canvas--viewport-form">{emptyCard}</section>
      </EmbeddedNestedPopupProvider>
    )
  }

  const inner = (
    <FormSectionedLayout
      form={form}
      formContextBar={formContextBar}
      formReadMenuBar={
        useReadModeChrome ? (
          <FormReadModeMenuBarConnected
            form={form}
            epicForms={epicForms}
            onReadModeMethodClick={onReadModeMethodClick}
            onOpenMethodInputForm={openMethodInputForm}
            onBuiltInMethodApplied={handleBuiltInApplied}
            onPreferSection={handlePreferSection}
          />
        ) : undefined
      }
      formReadScrollTop={formReadScrollTop}
      formFooter={formFooter}
      nestedEmbeddedOverlay={
        <>
          {nestedEmbeddedOverlay}
          {methodInputOverlay}
        </>
      }
      popupBoundsClassName={popupBoundsOverlayClass}
      readCanvas={fieldsCanvasReadOnly}
      preferredTabSectionId={preferSectionId}
      fieldVisibilityCtx={{ canvasFormDefId: form.id, canvasAncestors: [] }}
      renderFields={(sectionFields) => (
        <FormFieldsGrid
          fields={sectionFields}
          showSpecs={showSpecs}
          canvasReadOnly={fieldsCanvasReadOnly}
          presetForm={form}
          epicForms={epicForms}
          embeddedAncestorFormIds={[form.id]}
          canvasFormDefId={form.id}
          canvasAncestors={[]}
          onUpdateFieldSpec={onUpdateFieldSpec}
          onHtmlAction={
            form.id === 'form-patlasv4-proto-unidade-organizacional' ||
            form.id === 'form-patlasv4-proto-cat-etapa-documentacional'
              ? handleHtmlAction
              : undefined
          }
        />
      )}
    />
  )

  return (
    <EmbeddedNestedPopupProvider value={nestedPopupApi}>
      <section className="canvas canvas--viewport-form">{inner}</section>
    </EmbeddedNestedPopupProvider>
  )
}

export default function FormCanvas(props: Props) {
  const runtimeKey = `${props.form.id}:${props.form.activeExamplePresetId ?? ''}`
  return (
    <CanvasRuntimeValuesProvider key={runtimeKey}>
      <FormCanvasInner {...props} />
    </CanvasRuntimeValuesProvider>
  )
}
