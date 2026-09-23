import type {
  EmbeddedDemoRow,
  FieldAlertVariant,
  FieldDemoValue,
  FieldSize,
  FormDef,
  FormField,
} from './types'
import { SIZE_SPAN, fieldSupportsMultiple, isFormFieldVisibleInForm } from './types'
import {
  getSectionFieldGroups,
  getTabPanelGroups,
  isSectionedForm,
  normalizeSectionedForm,
  orderRootFieldsForDisplay,
} from './utils/formSections'
import { normalizeSectionIconLigature } from './utils/sectionIcon'
import {
  booleanFromDemo,
  dateDisplayForExport,
  decimalDemoToRaw,
  demoSelectedJsonForExport,
  demoValueAsSingleLineSummary,
  filesFromDemo,
  formatFileAttachmentDisplayLine,
  formatDecimalDisplay,
  geopointFromDemo,
  numberInputFromDemo,
  stringFromDemo,
} from './utils/fieldDemoValue'
import { resolveDemoSelectOptions } from './utils/demoSelectOptions'
import {
  embeddedExportInstanceCount,
  resolveNestedFieldForDemo,
  rowsForParentEmbed,
} from './utils/embeddedDemo'
import { getActiveExamplePreset, getScalarDemoForField } from './utils/formExamplePresets'
import { resolvePresetIconBackground } from './utils/presetIconColor'
import {
  embeddedFormAccordionInstanceTitle,
  findFormById,
  formIdentityTitleLines,
  getEmbeddedNestedFieldsForTable,
} from './utils/linkedForm'
import { fieldAriaName } from './utils/fieldAriaLabel'
import { specMarkdownToExportHtml } from './utils/specMarkdown'

/** Formulários do épico (para resolver `linkedFormId` em ref. embutida). */
export type FormHtmlContext = {
  epicForms: FormDef[]
  /** Cadeia de formulários embutidos (evita HTML recursivo infinito). */
  embeddedAncestorFormIds?: string[]
  /** Mesmo critério do canvas: `defaultCanvasMode` do formulário raiz da exportação. */
  canvasReadOnlyExport: boolean
  /** Form cujo miolo está a ser gerado (presets escalares em `getScalarDemoForField`). */
  bodyForm: FormDef
  /** Quando dentro de um bloco embutido: host, campo embutido e índice da instância no preset. */
  embeddedRender?: {
    hostForm: FormDef
    embedField: FormField
    instanceIndex: number
    hostPresetRow?: EmbeddedDemoRow
  }
}

function fieldRuntimeDemo(field: FormField): FieldDemoValue | undefined {
  return (field as FormField & { demoValue?: FieldDemoValue }).demoValue
}

function mapCellFieldForExport(form: FormDef, ctx: FormHtmlContext, f: FormField): FormField {
  const resolved = ctx.embeddedRender
    ? resolveNestedFieldForDemo(
        ctx.embeddedRender.hostForm,
        ctx.embeddedRender.embedField,
        f,
        ctx.embeddedRender.instanceIndex,
        ctx.embeddedRender.hostPresetRow,
      )
    : { ...f }
  const scalar = getScalarDemoForField(form, f.id)
  const nextDemo = resolved.demoValue !== undefined ? resolved.demoValue : scalar
  if (nextDemo === undefined) return { ...f, ...resolved } as FormField
  return { ...f, ...resolved, demoValue: nextDemo } as FormField
}

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const ALERT_VARIANT_ICON: Record<FieldAlertVariant, string> = {
  warning: 'warning',
  error: 'error',
  info: 'info',
  success: 'check_circle',
}

const EMBEDDED_EXPORT_TABLE_COL_MIN_REM: Record<FieldSize, string> = {
  small: '7rem',
  medium: '10rem',
  large: '13rem',
}

const EMBEDDED_EXPORT_TABLE_ACTIONS_COL = '2.5rem'

function embeddedExportTableMinWidthCalc(nested: FormField[], showActions: boolean): string {
  const parts = nested.map((f) => EMBEDDED_EXPORT_TABLE_COL_MIN_REM[f.size])
  if (showActions) parts.push(EMBEDDED_EXPORT_TABLE_ACTIONS_COL)
  return parts.length ? `calc(${parts.join(' + ')})` : '0px'
}

function sectionIconSpanHtml(icon: string | undefined): string {
  const lig = normalizeSectionIconLigature(icon)
  if (!lig) return ''
  return `<span class="material-symbols-outlined canvas__section-icon" aria-hidden="true">${esc(lig)}</span>`
}

function formExportCanvasReadOnly(form: FormDef): boolean {
  return (form.defaultCanvasMode ?? 'edit') === 'read'
}

/** Barra de leitura (pílula Detalhes + métodos em destaque + ⋮), estática. */
function formReadMethodsBarHtml(form: FormDef): string {
  const methods = form.methods ?? []
  const destaque = methods.filter((m) => m.kind === 'destaque')
  const menu = methods.filter((m) => m.kind === 'menu')
  const chips = destaque
    .map((m) => {
      const lig = normalizeSectionIconLigature(m.icon)
      const icon = lig
        ? `<span class="material-symbols-outlined canvas__form-read-method__icon" aria-hidden="true">${esc(lig)}</span>`
        : `<span class="canvas__form-read-method__icon-placeholder" aria-hidden="true">◇</span>`
      return `            <li class="canvas__form-read-methods__item">\n              <span class="canvas__form-read-method canvas__form-read-method--destaque">${icon}<span class="canvas__form-read-method__label">${esc(m.name || 'Sem nome')}</span></span>\n            </li>`
    })
    .join('\n')
  const chipsWrap =
    destaque.length > 0
      ? `          <div class="canvas__form-read-methods-wrap" role="group" aria-label="Métodos em destaque">\n            <ul class="canvas__form-read-methods">\n${chips}\n            </ul>\n          </div>`
      : ''
  const menuBtn =
    menu.length > 0
      ? `          <div class="canvas__form-read-menu-dropdown-wrap">\n            <button type="button" class="canvas__form-read-menu-btn" aria-label="Mais métodos" aria-expanded="false" aria-haspopup="menu">\n              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6" r="1.75" fill="currentColor" /><circle cx="12" cy="12" r="1.75" fill="currentColor" /><circle cx="12" cy="18" r="1.75" fill="currentColor" /></svg>\n            </button>\n          </div>`
      : ''
  const showMethodsBlock = destaque.length > 0 || menu.length > 0
  const sep = showMethodsBlock ? '          <div class="canvas__form-read-menu-sep" aria-hidden="true"></div>\n' : ''
  return `      <div class="canvas__form-read-menu">\n        <div class="canvas__form-read-menu-start">\n          <div class="canvas__form-read-pillbar" aria-hidden="true">\n            <span class="canvas__form-read-pillbar__detalhes">\n              <span class="canvas__form-read-pillbar__hit"><span class="material-symbols-outlined canvas__form-read-pillbar__mi-article" aria-hidden="true">article</span></span>\n              <span class="canvas__form-read-pillbar__hit canvas__form-read-pillbar__hit--label">Detalhes</span>\n              <span class="canvas__form-read-pillbar__hit"><span class="material-symbols-outlined canvas__form-read-pillbar__mi-keep" aria-hidden="true">keep</span></span>\n            </span>\n            <span class="canvas__form-read-pillbar__icon canvas__form-read-pillbar__icon--slot" aria-hidden="true"><span class="material-symbols-outlined canvas__form-read-pillbar__mi-dados">hub</span></span>\n            <span class="canvas__form-read-pillbar__icon canvas__form-read-pillbar__icon--slot" aria-hidden="true"><span class="material-symbols-outlined canvas__form-read-pillbar__mi-social">3p</span></span>\n          </div>\n        </div>\n        <div class="canvas__form-read-menu-end">\n${sep}${chipsWrap}\n${menuBtn}        </div>\n      </div>`
}

function formReadIdentityHighlightHtml(form: FormDef): string {
  const preset = getActiveExamplePreset(form)
  const lines = formIdentityTitleLines(form, {
    nestedFormId: form.id,
    canvasAncestors: [],
    examplePreset: preset,
  })
  const avatarBg = resolvePresetIconBackground(preset)
  const highlightRows = orderRootFieldsForDisplay(form).filter(
    (f) => f.relevance === 'highlight' && isFormFieldVisibleInForm(f),
  )
  const lineSpans = lines
    .map(
      (line, i) =>
        `            <span class="canvas__form-read-identity-line${i === 0 ? ' canvas__form-read-identity-line--primary' : ' canvas__form-read-identity-line--subtitle'}">${esc(line)}</span>`,
    )
    .join('\n')
  const highlightBlock =
    highlightRows.length > 0
      ? `\n          <div class="canvas__form-read-highlight" role="region" aria-label="Campos em destaque">\n${highlightRows
          .map((field) => {
            const raw = demoValueAsSingleLineSummary(field, getScalarDemoForField(form, field.id)).trim()
            const value = raw.length > 0 ? raw : '—'
            const lab = esc(field.label.trim() || 'Campo')
            return `            <div class="canvas__form-read-highlight-row">\n              <span class="canvas__form-read-highlight-key">${lab}</span><span class="canvas__form-read-highlight-sep" aria-hidden="true">:</span><span class="canvas__form-read-highlight-val">${esc(value)}</span>\n            </div>`
          })
          .join('\n')}\n          </div>`
      : ''
  const identityRowClass =
    lines.length === 1
      ? 'canvas__form-read-identity canvas__form-read-identity--single-line'
      : 'canvas__form-read-identity'
  return `        <div class="canvas__form-read-identity-wrap">\n          <div class="${identityRowClass}">\n            <span class="canvas__form-read-identity-avatar canvas__form-read-identity-avatar--gloss" style="background:${esc(avatarBg)}" aria-hidden="true"></span>\n            <div class="canvas__form-read-identity-text" aria-label="${esc(lines.join(', '))}">\n${lineSpans}\n            </div>\n          </div>${highlightBlock}\n        </div>`
}

/** Miolo do formulário (grelha / seções), sem cartão nem preface — para raiz ou embutido. */
function embeddedFormMainShellHtml(inner: string, canvasReadOnly: boolean): string {
  const readCls = canvasReadOnly ? ' canvas__form--read' : ''
  return `<div class="canvas__form${readCls}">
  <div class="canvas__form-popup-bounds">
  <div class="canvas__form-main">
${inner}
  </div>
  </div>
</div>`
}

function requiredHtml(field: FormField): string {
  return field.required ? '<span class="field__required">*</span>' : ''
}

/** Rótulo completo, ou só o asterisco se o nome estiver oculto e o campo for obrigatório. */
function labelOrReqOnlyLine(field: FormField, lh: boolean): string {
  if (!lh) {
    return `  <label class="field__label">${esc(field.label)}${requiredHtml(field)}</label>\n`
  }
  if (field.required) {
    return `  <div class="field__label-req-only" aria-hidden="true"><span class="field__required">*</span></div>\n`
  }
  return ''
}

function booleanLabelSpanLine(field: FormField, lh: boolean): string {
  if (!lh) {
    return `    <span class="field__label">${esc(field.label)}${requiredHtml(field)}</span>\n`
  }
  if (field.required) {
    return `    <div class="field__label-req-only" aria-hidden="true"><span class="field__required">*</span></div>\n`
  }
  return ''
}

function fieldInnerHtml(
  field: FormField,
  inheritedReadOnly = false,
  ctx: FormHtmlContext,
): string {
  const ro = inheritedReadOnly || field.readOnly
  const roAttr = ro ? ' readonly' : ''
  const roClass = ro ? ' field--readonly' : ''
  const lh = (ctx.bodyForm.hiddenLabelFieldIds ?? []).includes(field.id)
  const ariaL = lh ? esc(fieldAriaName(field.label, field.required)) : ''
  const ariaAttr = lh ? ` aria-label="${ariaL}"` : ''
  const reqAttr = lh && field.required ? ' aria-required="true"' : ''

  switch (field.type) {
    case 'text': {
      const tStr = stringFromDemo(fieldRuntimeDemo(field))
      if (field.textLong) {
        return `<div class="field${roClass}">
${labelOrReqOnlyLine(field, lh)}  <textarea class="field__input field__textarea"${roAttr} rows="4"${ariaAttr}${reqAttr}>${tStr ? esc(tStr) : ''}</textarea>
</div>`
      }
      const tVal = tStr ? ` value="${esc(tStr)}"` : ''
      return `<div class="field${roClass}">
${labelOrReqOnlyLine(field, lh)}  <input type="text" class="field__input"${roAttr}${tVal}${ariaAttr}${reqAttr} />
</div>`
    }

    case 'number': {
      const nStr = numberInputFromDemo(fieldRuntimeDemo(field))
      const nVal = nStr ? ` value="${esc(nStr)}"` : ''
      return `<div class="field${roClass}">
${labelOrReqOnlyLine(field, lh)}  <input type="number" class="field__input"${roAttr}${nVal}${ariaAttr}${reqAttr} />
</div>`
    }

    case 'decimal': {
      const rawD = decimalDemoToRaw(fieldRuntimeDemo(field))
      const dispD = formatDecimalDisplay(rawD, !!field.currency)
      const dVal = dispD ? ` value="${esc(dispD)}"` : ''
      return `<div class="field${roClass}">
${labelOrReqOnlyLine(field, lh)}  <input type="text" inputmode="numeric" class="field__input" data-decimal="${field.currency ? 'currency' : 'plain'}"${roAttr}${dVal}${ariaAttr}${reqAttr} />
</div>`
    }

    case 'boolean': {
      const on = booleanFromDemo(fieldRuntimeDemo(field))
      const trackClass = on ? 'field__toggle-track--on' : 'field__toggle-track--off'
      const checked = on ? ' checked' : ''
      return `<div class="field field--boolean${roClass}">
  <label class="field__boolean-label">
${booleanLabelSpanLine(field, lh)}    <span class="field__toggle-row">
      <input type="checkbox" class="field__checkbox"${ro ? ' disabled' : ''}${checked}${ariaAttr} />
      <span class="field__toggle-track ${trackClass}">
        <span class="field__toggle-thumb"></span>
      </span>
    </span>
  </label>
</div>`
    }

    case 'date': {
      const dd = dateDisplayForExport(fieldRuntimeDemo(field))
      const dateVal = dd ? ` value="${esc(dd)}"` : ''
      return `<div class="field${roClass}">
${labelOrReqOnlyLine(field, lh)}  <input type="text" inputmode="numeric" class="field__input" data-date${roAttr}${dateVal}${ariaAttr}${reqAttr} />
</div>`
    }

    case 'reference': {
      const opts = resolveDemoSelectOptions({
        options: field.options,
        linkedFormId: field.linkedFormId,
        label: field.label,
      })
      const optsAttr = esc(JSON.stringify(opts))
      const multiAttr = field.multiple && fieldSupportsMultiple(field.type) ? ' data-multiple' : ''
      const demoSel = demoSelectedJsonForExport(
        fieldRuntimeDemo(field),
        opts,
        !!(field.multiple && fieldSupportsMultiple(field.type)),
      )
      const demoAttr = demoSel ? ` data-demo-selected="${esc(demoSel)}"` : ''
      return `<div class="field${roClass}" data-ref='${optsAttr}'${multiAttr}${ro ? ' data-readonly' : ''}${demoAttr}>
${labelOrReqOnlyLine(field, lh)}  <div class="field__ref-wrap">
    <div class="field__ref-control"${lh ? ariaAttr : ''}>
      <span class="field__ref-placeholder">Selecione</span>
    </div>
  </div>
</div>`
    }

    case 'textOptions': {
      const opts = resolveDemoSelectOptions({
        options: field.options,
        label: field.label,
      })
      if (ro) {
        const summary = demoValueAsSingleLineSummary(field, fieldRuntimeDemo(field))
        const vAttr = summary ? ` value="${esc(summary)}"` : ''
        return `<div class="field${roClass}">
${labelOrReqOnlyLine(field, lh)}  <input type="text" class="field__input"${roAttr}${vAttr}${ariaAttr}${reqAttr} />
</div>`
      }
      const optsAttr = esc(JSON.stringify(opts))
      const multiAttr = field.multiple && fieldSupportsMultiple(field.type) ? ' data-multiple' : ''
      const roData = ''
      const btnMeasure = opts
        .map((o) => `<button type="button" class="field__textopt-cell" tabindex="-1">${esc(o)}</button>`)
        .join('')
      const btnInline = opts
        .map(
          (o) =>
            `<button type="button" class="field__textopt-cell"${ro ? ' disabled' : ''}>${esc(o)}</button>`,
        )
        .join('')
      const role = field.multiple ? 'group' : 'radiogroup'
      const demoSel = demoSelectedJsonForExport(
        fieldRuntimeDemo(field),
        opts,
        !!(field.multiple && fieldSupportsMultiple(field.type)),
      )
      const demoAttr = demoSel ? ` data-demo-selected="${esc(demoSel)}"` : ''
      const rowAria = lh ? ariaL : esc(field.label)
      return `<div class="field${roClass}" data-textopt='${optsAttr}'${multiAttr}${roData}${demoAttr}>
${labelOrReqOnlyLine(field, lh)}  <div class="field__textopt-wrap">
    <div class="field__textopt-measure-host"><div class="field__textopt-row field__textopt-row--measure">${btnMeasure}</div></div>
    <div class="field__textopt-inline"><div class="field__textopt-row" role="${role}" aria-label="${rowAria}">${btnInline}</div></div>
    <div class="field__textopt-compact" hidden>
      <div class="field__ref-wrap">
        <div class="field__ref-control">
          <span class="field__ref-placeholder">Selecione</span>
        </div>
      </div>
    </div>
  </div>
</div>`
    }

    case 'embeddedReference': {
      const ancestors = ctx.embeddedAncestorFormIds ?? []
      const lid = field.linkedFormId
      if (lid && ancestors.includes(lid)) {
        return `<div class="field field--embedded-accordion field--embedded-cycle${roClass}">
${labelOrReqOnlyLine(field, lh)}  <p class="field__embedded-acc-empty field__embedded-cycle-msg">Referência cíclica: bloco não expandido na exportação.</p>
</div>`
      }
      const nest = getEmbeddedNestedFieldsForTable(field, ctx.epicForms)
      const linkedFormForTitle = lid ? findFormById(ctx.epicForms, lid) : undefined
      const nextHostPresetRow =
        ctx.embeddedRender
          ? rowsForParentEmbed(
              ctx.embeddedRender.hostForm,
              ctx.embeddedRender.embedField,
              ctx.embeddedRender.hostPresetRow,
            )?.[ctx.embeddedRender.instanceIndex]
          : undefined
      const repeats = embeddedExportInstanceCount(
        ctx.bodyForm,
        field,
        ctx.embeddedRender?.hostPresetRow,
      )
      const childCtxForRow = (rowIndex: number): FormHtmlContext => ({
        ...ctx,
        embeddedAncestorFormIds: lid ? [...ancestors, lid] : ancestors,
        bodyForm: linkedFormForTitle ?? ctx.bodyForm,
        embeddedRender:
          linkedFormForTitle && lid
            ? {
                hostForm: ctx.bodyForm,
                embedField: field,
                instanceIndex: rowIndex,
                hostPresetRow: nextHostPresetRow,
              }
            : undefined,
      })
      const addBtnCore =
        repeats > 1 && !ro
          ? `    <div class="field__file-btn field__embedded-add-btn" role="img" aria-label="Adicionar outro formulário">
      <svg class="field__file-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </div>`
          : ''
      const addBtnForm = addBtnCore ? `\n${addBtnCore}` : ''
      const isEmbeddedTable =
        field.embeddedDisplay === 'table' &&
        field.multiple &&
        fieldSupportsMultiple(field.type)

      if (isEmbeddedTable) {
        const showActions = repeats > 1 && !ro
        const trashSpan = `<span class="field__embedded-acc-icon-btn" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></span>`
        const emptyMsg =
          '<p class="field__embedded-acc-empty">Vincule um formulário a este bloco ou defina campos no formulário linkado.</p>'
        let tableInner: string
        if (nest.length === 0) {
          const rows = Array.from({ length: repeats }, () => `        <tr><td class="field__embedded-table-empty">${emptyMsg}</td></tr>`).join(
            '\n',
          )
          tableInner = `<table class="field__embedded-table">\n<tbody>\n${rows}\n</tbody>\n</table>`
        } else {
          const hiddenTh = new Set((linkedFormForTitle?.hiddenLabelFieldIds ?? []).map((id) => id))
          const headerCells = nest
            .map((f) => {
              const showName = !hiddenTh.has(f.id)
              return `          <th class="field__embedded-table-th field__embedded-table-th--${f.size}" scope="col">${showName ? esc(f.label) : ''}${f.required ? '<span class="field__required">*</span>' : ''}</th>`
            })
            .join('\n')
          const actionsTh = showActions
            ? '\n          <th class="field__embedded-table-th field__embedded-table-th-actions" scope="col" aria-label="Ações"></th>'
            : ''
          const bodyRows = Array.from({ length: repeats }, (_, rowIndex) => {
            const rowCtx = childCtxForRow(rowIndex)
            const tds = nest
              .map(
                (nf) =>
                  `          <td class="field__embedded-table-td field__embedded-table-td--${nf.size}"><div class="field__embedded-table-cell">${embeddedTableCellInnerHtml(
                    mapCellFieldForExport(linkedFormForTitle!, rowCtx, nf),
                    ro,
                    rowCtx,
                  )}</div></td>`,
              )
              .join('\n')
            const actionTd = showActions
              ? `\n          <td class="field__embedded-table-td field__embedded-table-td-actions">${trashSpan}</td>`
              : ''
            return `        <tr>\n${tds}${actionTd}\n        </tr>`
          }).join('\n')
          const embedTableStyle = `--embed-data-cols:${nest.length};--embed-actions-w:${showActions ? EMBEDDED_EXPORT_TABLE_ACTIONS_COL : '0px'};--embed-min-sum:${embeddedExportTableMinWidthCalc(nest, showActions)}`
          tableInner = `<table class="field__embedded-table" style="${embedTableStyle}">\n<thead>\n        <tr>\n${headerCells}${actionsTh}\n        </tr>\n</thead>\n<tbody>\n${bodyRows}\n</tbody>\n</table>`
        }
        const addFooterHtml = addBtnCore
          ? `\n  <div class="field__embedded-table-add-footer">\n    <div class="field__embedded-table-add-cell"><div class="field__embedded-table-add-wrap">\n${addBtnCore}\n    </div></div>\n  </div>`
          : ''
        const layoutBlock = `<div class="field__embedded-table-layout">
  <div class="field__embedded-table-scroll">
${tableInner}
  </div>${addFooterHtml}
</div>`
        return `<div class="field field--embedded-accordion field--embedded-table-mode${roClass}">
${labelOrReqOnlyLine(field, lh)}${layoutBlock}
</div>`
      }

      const isEmbeddedRoot = field.embeddedRoot && !field.multiple

      if (isEmbeddedRoot) {
        const rootCtx = childCtxForRow(0)
        const innerGridRoot =
          linkedFormForTitle && linkedFormForTitle.fields.length > 0
            ? `\n  ${embeddedFormMainShellHtml(
                formBodyContentHtmlMapped(
                  linkedFormForTitle,
                  rootCtx,
                  (f) => mapCellFieldForExport(linkedFormForTitle, rootCtx, f),
                  ro,
                ).trim(),
                rootCtx.canvasReadOnlyExport,
              )}`
            : '\n  <p class="field__embedded-acc-empty">Vincule um formulário a este bloco ou defina campos no formulário linkado.</p>'
        return `<div class="field field--embedded-root${roClass}">
${labelOrReqOnlyLine(field, lh)}  <div class="field__embedded-root-body">${innerGridRoot}
  </div>
</div>`
      }

      const trashDisabled = repeats <= 1 ? ' field__embedded-acc-icon-btn--disabled' : ''
      const trashSpan = `<span class="field__embedded-acc-icon-btn${trashDisabled}" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></span>`
      const moreSpan = `<span class="field__embedded-acc-icon-btn" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></span>`
      const accActionsBlock = ro
        ? ''
        : `\n        <span class="field__embedded-acc-actions">${trashSpan}${moreSpan}</span>`
      const blocks = Array.from({ length: repeats }, (_, rowIndex) => {
        const rowCtx = childCtxForRow(rowIndex)
        const rowTitle = esc(
          embeddedFormAccordionInstanceTitle(
            linkedFormForTitle,
            lid
              ? {
                  nestedFormId: lid,
                  canvasAncestors: [{ embeddedFieldId: field.id, instanceIndex: rowIndex }],
                  resolveIdentityDemoField: (idf) => {
                    const er = rowCtx.embeddedRender
                    if (!er) return { ...idf }
                    return resolveNestedFieldForDemo(
                      er.hostForm,
                      er.embedField,
                      idf,
                      er.instanceIndex,
                      er.hostPresetRow,
                    )
                  },
                }
              : undefined,
          ),
        )
        const innerGrid =
          linkedFormForTitle && linkedFormForTitle.fields.length > 0
            ? `\n          ${embeddedFormMainShellHtml(
                formBodyContentHtmlMapped(
                  linkedFormForTitle,
                  rowCtx,
                  (f) => mapCellFieldForExport(linkedFormForTitle, rowCtx, f),
                  ro,
                )
                  .trim()
                  .split('\n')
                  .map((line) => `            ${line}`)
                  .join('\n'),
                rowCtx.canvasReadOnlyExport,
              )}`
            : '\n          <p class="field__embedded-acc-empty">Vincule um formulário a este bloco ou defina campos no formulário linkado.</p>'
        return `    <details class="field__embedded-details">
      <summary class="field__embedded-acc-header">
        <span class="field__embedded-acc-summary-main">
          <svg class="field__embedded-acc-chevron" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>
          <span class="field__embedded-acc-title">${rowTitle}</span>
        </span>${accActionsBlock}
      </summary>
      <div class="field__embedded-acc-panel">${innerGrid}
      </div>
    </details>`
      }).join('\n')
      return `<div class="field field--embedded-accordion${roClass}">
${labelOrReqOnlyLine(field, lh)}  <div class="field__embedded-stack">
${blocks}
  </div>${addBtnForm}
</div>`
    }

    case 'file': {
      const files = filesFromDemo(fieldRuntimeDemo(field)).filter(
        (x) => x.name.trim() || x.kind.trim(),
      )
      const rowsBlock =
        files.length > 0
          ? `\n  <div class="field__file-attached-list" role="list">${files
              .map((item) => {
                const line = esc(formatFileAttachmentDisplayLine(item))
                const gripTrash =
                  ro
                    ? ''
                    : `
      <span class="field__file-drag-handle" aria-hidden="true">
        <svg class="field__file-drag-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none"/>
          <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
          <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none"/>
        </svg>
      </span>`
                const removeBtn =
                  ro
                    ? ''
                    : `
      <button type="button" class="field__file-remove-btn" aria-label="Remover arquivo" tabindex="-1" title="Remover arquivo">
        <svg class="field__file-trash-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>`
                return `
    <div class="field__file-attached-row" role="listitem">${gripTrash}
      <span class="field__file-doc-wrap" aria-hidden="true">
        <svg class="field__file-doc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#ce0933" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="14 2 14 8 20 8" stroke="#ce0933" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="field__file-attached-line">${line}</span>${removeBtn}
    </div>`
              })
              .join('')}
  </div>`
          : ''
      return `<div class="field${roClass}"${lh ? ` role="group"${ariaAttr}` : ''}>
${labelOrReqOnlyLine(field, lh)}  <div class="field__file-stack">${rowsBlock}
    <div class="field__file-upload-wrap">
      <div class="field__file-btn">
        <svg class="field__file-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
    </div>
  </div>
</div>`
    }

    case 'geopoint': {
      const g = geopointFromDemo(fieldRuntimeDemo(field))
      const latVal = g.lat ? ` value="${esc(g.lat)}"` : ''
      const lngVal = g.lng ? ` value="${esc(g.lng)}"` : ''
      const mapBtn = `  <div class="field__file-btn" aria-hidden="true">
    <svg class="field__file-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  </div>`
      return `<div class="field${roClass}"${lh ? ` role="group"${ariaAttr}` : ''}>
${labelOrReqOnlyLine(field, lh)}  <div class="field__geopoint">
    <input type="number" step="any" class="field__input"${roAttr}${ro ? '' : ' placeholder="Latitude"'}${latVal} />
    <input type="number" step="any" class="field__input"${roAttr}${ro ? '' : ' placeholder="Longitude"'}${lngVal} />
${mapBtn}
  </div>
</div>`
    }

    case 'html':
      if (field.htmlContent) {
        return `<div class="field field--html">
${labelOrReqOnlyLine(field, lh)}  <div class="field__html-render">${field.htmlContent}</div>
</div>`
      }
      return `<div class="field field--html">
${labelOrReqOnlyLine(field, lh)}  <div class="field__html-empty">Nenhum conteúdo HTML definido</div>
</div>`

    case 'alert': {
      const rawVariant = field.alertVariant ?? 'warning'
      const variant: FieldAlertVariant =
        rawVariant === 'error' || rawVariant === 'info' || rawVariant === 'success' || rawVariant === 'warning'
          ? rawVariant
          : 'warning'
      const iconLig = ALERT_VARIANT_ICON[variant]
      const titleRaw = (field.alertTitle ?? '').trim() || field.label.trim() || 'Título'
      const title = esc(titleRaw)
      const msgRaw = field.alertMessage ?? ''
      const msg = msgRaw ? esc(msgRaw) : '&#160;'
      const collapsible = !!field.alertCollapsible
      const toggleHtml = collapsible
        ? `          <button type="button" class="field__alert-toggle" aria-expanded="true" aria-label="Recolher mensagem">
            <svg class="field__alert-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>
          </button>`
        : ''
      const dataColl = collapsible ? ' data-alert-collapsible="1"' : ''
      return `<div class="field field--alert field--alert--${variant}${roClass}"${dataColl}>
${labelOrReqOnlyLine(field, lh)}  <div class="field__alert">
    <span class="field__alert-accent" aria-hidden="true"></span>
    <div class="field__alert-main">
      <span class="material-symbols-outlined field__alert-type-icon" aria-hidden="true">${iconLig}</span>
      <div class="field__alert-content">
        <div class="field__alert-head">
          <strong class="field__alert-title">${title}</strong>
${toggleHtml}
        </div>
        <p class="field__alert-message">${msg}</p>
      </div>
    </div>
  </div>
</div>`
    }

    default:
      return `<div class="field${roClass}">
${labelOrReqOnlyLine(field, lh)}  <input type="text" class="field__input"${roAttr}${ariaAttr} />
</div>`
  }
}

/** Conteúdo de célula no modo tabela da ref. embutida (evita HTML recursivo do bloco inteiro). */
function embeddedTableCellInnerHtml(
  field: FormField,
  parentCellReadOnly: boolean,
  ctx: FormHtmlContext,
): string {
  if (field.type === 'embeddedReference') {
    const effective = ctx.canvasReadOnlyExport || parentCellReadOnly || field.readOnly
    const label = effective ? 'Visualizar' : 'Editar'
    return `<button type="button" class="field__embedded-table-nested-ref-btn">${esc(label)}</button>`
  }
  return fieldInnerHtml(field, parentCellReadOnly, ctx)
}

function fieldCellHtml(
  field: FormField,
  inheritedReadOnly = false,
  ctx: FormHtmlContext,
): string {
  const span = SIZE_SPAN[field.size]
  const modelRoAttr = field.readOnly ? ' data-export-model-ro="1"' : ''
  const specBlock = field.spec
    ? `\n          <div class="canvas__spec">\n            <div class="canvas__spec-header">\n              <div class="canvas__spec-header-main">\n                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.5"/><line x1="8" y1="7" x2="8" y2="11.5"/><circle cx="8" cy="4.75" r="0.5" fill="currentColor" stroke="none"/></svg>\n                <span>Detalhamento</span>\n              </div>\n            </div>\n            ${specMarkdownToExportHtml(field.spec, esc)}\n          </div>`
    : ''
  return `      <div class="canvas__cell" style="grid-column: span ${span}">
        <div class="canvas__card"${modelRoAttr}>
          ${fieldInnerHtml(field, inheritedReadOnly, ctx)}${specBlock}
        </div>
      </div>`
}

function formBodyContentHtmlMapped(
  form: FormDef,
  ctx: FormHtmlContext,
  mapCellField: (f: FormField) => FormField,
  inheritedReadOnly: boolean,
): string {
  const cell = (f: FormField) => fieldCellHtml(mapCellField(f), inheritedReadOnly, ctx)
  const vis = (fs: FormField[]) => fs.filter(isFormFieldVisibleInForm)
  const norm = normalizeSectionedForm(form)
  if (!isSectionedForm(norm) || !norm.sections?.length) {
    const cells = vis(form.fields)
      .map((field) => cell(field))
      .join('\n')
    return `    <div class="canvas__grid">
${cells}
    </div>`
  }
  const accordionGroups = getSectionFieldGroups(norm)
  const chevronSvg = `<svg class="canvas__section-chevron" viewBox="-1 -1 18 18" fill="none" aria-hidden="true"><path d="M6 4l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>`
  const tabNavPrev = `        <button type="button" class="canvas__tabs-nav canvas__tabs-nav--prev" disabled aria-label="Rolar abas para a esquerda">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="canvas__tabs-nav-icon">
            <path d="M12 5l-5 5 5 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>`
  const tabNavNext = `        <button type="button" class="canvas__tabs-nav canvas__tabs-nav--next" disabled aria-label="Rolar abas para a direita">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" class="canvas__tabs-nav-icon">
            <path d="M8 5l5 5-5 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>`
  if (norm.sectionLayout === 'tabs') {
    const tabGroups = getTabPanelGroups(norm)
    const tabBtns = tabGroups
      .map((g, i) => {
        const active = i === 0 ? ' canvas__tab--active' : ''
        const sel = i === 0 ? 'true' : 'false'
        return `            <button type="button" role="tab" aria-selected="${sel}" data-tab-index="${i}" class="canvas__tab${active}">${sectionIconSpanHtml(g.tab.icon)}<span>${esc(g.tab.title)}</span></button>`
      })
      .join('\n')
    const panels = tabGroups
      .map((g, i) => {
        const hidden = i === 0 ? '' : ' hidden'
        const directVis = vis(g.directFields)
        const directBlock =
          directVis.length > 0
            ? `        <div class="canvas__grid">
${directVis.map((f) => cell(f)).join('\n')}
        </div>`
            : ''
        const subAcc = g.subGroups
          .map((sg) => {
            const sf = vis(sg.fields)
            const innerSub =
              sf.length > 0
                ? `        <div class="canvas__grid">
${sf.map((f) => cell(f)).join('\n')}
        </div>`
                : '        <p class="canvas__section-empty">Nenhum campo nesta seção.</p>'
            return `    <details class="canvas__section canvas__section--accordion" open>
      <summary class="canvas__section-header">${chevronSvg}${sectionIconSpanHtml(sg.sub.icon)}<span class="canvas__section-title">${esc(sg.sub.title)}</span><span class="canvas__section-rule" aria-hidden="true"></span></summary>
      <div class="canvas__section-body">
${innerSub}
      </div>
    </details>`
          })
          .join('\n')
        const emptyTab =
          !directBlock && !subAcc
            ? '        <p class="canvas__section-empty">Nenhum campo nesta seção.</p>'
            : ''
        const inner = `${directBlock}\n${subAcc}\n${emptyTab}`.trimEnd()
        return `      <div class="canvas__tab-panel" role="tabpanel"${hidden}>
${inner}
      </div>`
      })
      .join('\n')
    return `    <div class="canvas__section canvas__section--tabs" data-form-tabs>
      <div class="canvas__tabs-wrap">
${tabNavPrev}
        <div class="canvas__tabs-scrollport">
          <div class="canvas__tabs" role="tablist">
${tabBtns}
          </div>
        </div>
${tabNavNext}
      </div>
${panels}
    </div>`
  }
  return accordionGroups
    .map((g) => {
      const gf = vis(g.fields)
      const inner =
        gf.length > 0
          ? `        <div class="canvas__grid">
${gf.map((f) => cell(f)).join('\n')}
        </div>`
          : '        <p class="canvas__section-empty">Nenhum campo nesta seção.</p>'
      return `    <details class="canvas__section canvas__section--accordion" open>
      <summary class="canvas__section-header">${chevronSvg}${sectionIconSpanHtml(g.section.icon)}<span class="canvas__section-title">${esc(g.section.title)}</span><span class="canvas__section-rule" aria-hidden="true"></span></summary>
      <div class="canvas__section-body">
${inner}
      </div>
    </details>`
    })
    .join('\n')
}

export function generateFormHtml(form: FormDef, epicForms: FormDef[]): string {
  const initialRead = formExportCanvasReadOnly(form)
  const ctx: FormHtmlContext = {
    epicForms,
    embeddedAncestorFormIds: [form.id],
    canvasReadOnlyExport: false,
    bodyForm: form,
  }
  const norm = normalizeSectionedForm(form)
  const tabCls =
    isSectionedForm(norm) && norm.sections?.length && norm.sectionLayout === 'tabs'
      ? ' canvas__form--tabs'
      : ''
  const readCls = initialRead ? ' canvas__form--read' : ''
  const hasVisibleRootField = form.fields.some(isFormFieldVisibleInForm)
  const emptyCls =
    form.fields.length === 0 || !hasVisibleRootField ? ' canvas__form--empty-state' : ''
  const formCardClass = `canvas__form${tabCls}${readCls}${emptyCls}`

  const contextBar = `      <div class="canvas__form-context-bar" role="region" aria-label="Formulário">
        <span class="canvas__form-context-bar__name">${esc(form.name)}</span>
      </div>`
  const prefaceEdit = `    <div id="exportPrefaceEdit" class="canvas__form-preface"${initialRead ? ' hidden' : ''}>
${contextBar}
    </div>`
  const prefaceRead = `    <div id="exportPrefaceRead" class="canvas__form-preface canvas__form-preface--read-sticky"${initialRead ? '' : ' hidden'}>
${contextBar}
    </div>`
  const readMenuBar = `      <div id="exportReadMenuBar"${initialRead ? '' : ' hidden'}>
${formReadMethodsBarHtml(form)}
      </div>`
  const preface = `${prefaceEdit}\n${prefaceRead}`

  const identitySlot = `        <div id="exportReadIdentitySlot"${initialRead ? '' : ' hidden'}>\n${formReadIdentityHighlightHtml(form)}\n        </div>`
  const bodyContent =
    form.fields.length === 0 || !hasVisibleRootField
      ? `        <div class="canvas__placeholder">
          <span class="canvas__placeholder-icon">📋</span>
          <p>Este formulário ainda não tem campos.</p>
        </div>`
      : formBodyContentHtmlMapped(form, ctx, (f) => mapCellFieldForExport(form, ctx, f), false)
  const mainInner = `${identitySlot}\n${bodyContent}`

  const footer = `    <div id="exportFormFooter" class="canvas__form-footer-actions" aria-hidden="true"${initialRead ? ' hidden' : ''}>
      <button type="button" class="canvas__form-fab canvas__form-fab--cancel" tabindex="-1">
        <svg class="canvas__form-fab-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        </svg>
      </button>
      <button type="button" class="canvas__form-fab canvas__form-fab--confirm" tabindex="-1">
        <svg class="canvas__form-fab-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>`

  const modeEditActive = !initialRead ? ' export-canvas-mode__btn--active' : ''
  const modeReadActive = initialRead ? ' export-canvas-mode__btn--active' : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(form.name)}</title>
  <style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap');
*, *::before, *::after { box-sizing: border-box; }
html {
  overflow-x: hidden;
}
body {
  margin: 0;
  font-family: 'Outfit', system-ui, -apple-system, sans-serif;
  background: #F9F9F9;
  color: #272727;
  padding: 1.5rem;
  overflow-x: hidden;
  box-sizing: border-box;
}
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined', sans-serif;
  font-weight: normal;
  font-style: normal;
  font-size: 1.25rem;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}
.canvas.canvas--viewport-form {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  height: min(44rem, calc(100dvh - 11rem));
  min-height: min(32rem, calc(100dvh - 11rem));
  max-height: min(44rem, calc(100dvh - 11rem));
  overflow: hidden;
  overflow-x: hidden;
  min-width: 0;
  box-sizing: border-box;
}
.form-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.export-canvas-mode {
  display: inline-flex;
  border-radius: 0.5rem;
  border: 1px solid #d4d4d8;
  overflow: hidden;
  background: #fff;
}
.export-canvas-mode__btn {
  margin: 0;
  border: none;
  border-right: 1px solid #e4e4e7;
  background: #fff;
  padding: 0.42rem 0.9rem;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 600;
  color: #52525b;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}
.export-canvas-mode__btn:last-child {
  border-right: none;
}
.export-canvas-mode__btn--active {
  background: #eef2ff;
  color: #062950;
}
.export-canvas-mode__btn:not(.export-canvas-mode__btn--active):hover {
  background: #f4f4f5;
  color: #18181b;
}
.canvas__form {
  --form-body-pad-y: 1.1rem;
  --form-body-pad-x: 0.85rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  background: #fff;
  border: 1px solid #d4d4d8;
  border-radius: 0.625rem;
  padding: var(--form-body-pad-y) var(--form-body-pad-x);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}
.canvas__form.canvas__form--read {
  --form-body-pad-x: 0.55rem;
}
.canvas__form-main {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.canvas__form-popup-bounds {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}
.canvas.canvas--viewport-form > .canvas__form > .canvas__form-popup-bounds {
  margin-left: calc(-1 * var(--form-body-pad-x));
  margin-right: calc(-1 * var(--form-body-pad-x));
  margin-bottom: calc(-1 * var(--form-body-pad-y));
  width: calc(100% + 2 * var(--form-body-pad-x));
  max-width: none;
  box-sizing: border-box;
}
.canvas.canvas--viewport-form > .canvas__form > .canvas__form-popup-bounds > .canvas__form-main {
  margin-left: 0;
  margin-right: 0;
  width: 100%;
  max-width: none;
  box-sizing: border-box;
  padding-top: 1.05rem;
  padding-bottom: 1.05rem;
}
.canvas.canvas--viewport-form > .canvas__form.canvas__form--read > .canvas__form-popup-bounds > .canvas__form-main:has(> .canvas__form-read-identity-wrap) {
  padding-top: 0.4rem;
}
.canvas.canvas--viewport-form > .canvas__form .canvas__tabs-wrap {
  margin-left: 0;
  margin-right: 0;
}
.canvas.canvas--viewport-form > .canvas__form > .canvas__form-popup-bounds > .canvas__form-main > .canvas__grid {
  padding-left: var(--form-body-pad-x);
  padding-right: var(--form-body-pad-x);
  box-sizing: border-box;
}
.canvas.canvas--viewport-form > .canvas__form > .canvas__form-popup-bounds > .canvas__form-main > .canvas__section--accordion {
  padding-left: var(--form-body-pad-x);
  padding-right: var(--form-body-pad-x);
  box-sizing: border-box;
}
.canvas.canvas--viewport-form > .canvas__form > .canvas__form-popup-bounds > .canvas__form-main .canvas__tab-panel {
  padding-left: var(--form-body-pad-x);
  padding-right: var(--form-body-pad-x);
  box-sizing: border-box;
}
.canvas__form-preface {
  flex-shrink: 0;
  margin: calc(-1 * var(--form-body-pad-y)) calc(-1 * var(--form-body-pad-x)) 0 calc(-1 * var(--form-body-pad-x));
}
.canvas__form-preface .canvas__form-context-bar {
  margin: 0;
}
.canvas__form--tabs .canvas__form-preface {
  margin: 0 calc(-1 * var(--form-body-pad-x)) 0 calc(-1 * var(--form-body-pad-x));
}
.canvas__form--tabs .canvas__form-preface .canvas__form-context-bar {
  border-radius: 0;
}
.canvas__form-context-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.48rem var(--form-body-pad-x) 0.45rem;
  background: #f7f7f8;
  border-bottom: 1px solid #e2e8f0;
  border-radius: calc(0.625rem - 1px) calc(0.625rem - 1px) 0 0;
  box-sizing: border-box;
}
.canvas__form-context-bar__name {
  display: block;
  margin: 0;
  min-width: 0;
  flex: 1 1 auto;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.01em;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.canvas__form-context-bar__spec {
  flex: 0 0 auto;
}
.canvas__form-context-bar__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  cursor: pointer;
  user-select: none;
}
.canvas__form-context-bar__toggle-label {
  display: block;
  max-width: 11rem;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.25;
  color: #272727;
  text-align: right;
}
.canvas__form--tabs .canvas__form-context-bar {
  padding-top: 0.42rem;
  padding-bottom: 0.44rem;
}
.canvas__form-read-menu {
  --read-menu-hit-size: calc(0.3rem + 1rem + 0.3rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.3rem var(--form-body-pad-x) 0.34rem;
  background: #fff;
  border-bottom: 1px solid #e8e8ec;
}
.canvas__form-read-menu-start {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  min-width: 0;
  flex: 1;
}
.canvas__form-read-menu-end {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.12rem;
  flex-shrink: 0;
}
.canvas__form-read-menu-sep {
  width: 1px;
  flex-shrink: 0;
  align-self: center;
  height: 1.05rem;
  background: #e4e4e7;
}
.canvas__form-read-methods-wrap {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  border-radius: 9999px;
  padding: 0.1rem 0.32rem;
  box-sizing: border-box;
}
.canvas__form-read-methods {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.12rem;
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
}
.canvas__form-read-methods__item {
  margin: 0;
  padding: 0;
}
.canvas__form-read-method {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  box-sizing: border-box;
  min-height: var(--read-menu-hit-size);
  padding: 0.32rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.2;
  color: #474747;
  cursor: pointer;
  user-select: none;
  transition: background 0.12s ease, color 0.12s ease;
}
.canvas__form-read-method:hover {
  color: #18181b;
}
.canvas__form-read-method--destaque,
.canvas__form-read-method--menu {
  background: transparent;
  border: none;
  box-shadow: none;
}
.canvas__form-read-method--destaque:hover,
.canvas__form-read-method--menu:hover {
  background: #f4f4f5;
}
.canvas__form-read-method__icon {
  flex-shrink: 0;
  font-size: 1.02rem;
  line-height: 1;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.canvas__form-read-method__icon-placeholder {
  flex-shrink: 0;
  font-size: 0.75rem;
  line-height: 1;
  color: #a1a1aa;
}
.canvas__form-read-method__label {
  white-space: nowrap;
  max-width: 11rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
.canvas__form-read-pillbar {
  display: inline-flex;
  align-items: center;
  gap: 0.12rem;
  padding: 0.12rem 0.2rem;
  border-radius: 9999px;
  background: #f7f7f8;
  border: none;
  color: #474747;
  flex-shrink: 0;
}
.canvas__form-read-pillbar__detalhes {
  display: inline-flex;
  align-items: center;
  gap: 0.12rem;
  padding: 0.3rem 0.42rem 0.3rem 0.36rem;
  border-radius: 9999px;
  background: #fff;
  color: #474747;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.14), 0 3px 8px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}
.canvas__form-read-pillbar__detalhes:hover {
  background: #e8eaed;
  color: #09090b;
}
.canvas__form-read-pillbar__hit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.18rem 0.14rem;
  margin: -0.18rem -0.04rem;
  border-radius: 9999px;
  cursor: pointer;
  user-select: none;
}
.canvas__form-read-pillbar__hit--label {
  padding-left: 0.08rem;
  padding-right: 0.08rem;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1;
}
.canvas__form-read-pillbar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.24rem 0.38rem;
  margin: -0.06rem 0;
  border-radius: 9999px;
  color: #474747;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}
.canvas__form-read-pillbar__icon--slot {
  box-sizing: border-box;
  width: 1.72rem;
  height: 1.72rem;
  min-width: 1.72rem;
  min-height: 1.72rem;
  padding: 0;
  border-radius: 50%;
}
.canvas__form-read-pillbar__icon:hover {
  background: #e8eaed;
  color: #09090b;
}
.canvas__form-read-pillbar__detalhes .canvas__form-read-pillbar__mi-article,
.canvas__form-read-pillbar__detalhes .canvas__form-read-pillbar__mi-keep {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.08rem;
  height: 1.08rem;
  font-size: 1.08rem;
  line-height: 1;
}
.canvas__form-read-pillbar__detalhes .canvas__form-read-pillbar__mi-article {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.canvas__form-read-pillbar__detalhes .canvas__form-read-pillbar__mi-keep {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.canvas__form-read-pillbar__icon--slot .canvas__form-read-pillbar__mi-dados,
.canvas__form-read-pillbar__icon--slot .canvas__form-read-pillbar__mi-social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  font-size: 1.2rem;
  line-height: 1;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.canvas__form-read-menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: var(--read-menu-hit-size);
  height: var(--read-menu-hit-size);
  min-width: var(--read-menu-hit-size);
  min-height: var(--read-menu-hit-size);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #474747;
  line-height: 0;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}
.canvas__form-read-menu-btn svg {
  display: block;
  width: 0.92rem;
  height: 0.92rem;
}
.canvas__form-read-menu-btn:hover {
  background: #f4f4f5;
  color: #18181b;
}
.canvas__form-read-menu-dropdown-wrap {
  position: relative;
  flex-shrink: 0;
}
.canvas__form-read-identity-wrap {
  --read-id-pad-x: 0.95rem;
  --read-id-avatar: 2.125rem;
  --read-id-gap: 0.65rem;
  --read-id-subtitle-size: 0.72rem;
  --read-id-subtitle-weight: 400;
  --read-id-subtitle-tracking: -0.006em;
  --read-id-subtitle-lh: 1.32;
  --read-id-subtitle-color: #71717a;
  background: #fff;
  border-bottom: 1px solid #e8e8ec;
}
.canvas__form--read .canvas__form-main > .canvas__form-read-identity-wrap {
  margin-left: calc(-1 * var(--form-body-pad-x));
  margin-right: calc(-1 * var(--form-body-pad-x));
}
.canvas.canvas--viewport-form > .canvas__form--read .canvas__form-main > .canvas__form-read-identity-wrap {
  margin-left: 0;
  margin-right: 0;
  margin-bottom: 0.75rem;
}
.canvas__form-read-identity {
  display: flex;
  align-items: flex-start;
  gap: var(--read-id-gap);
  padding: 0.5rem var(--read-id-pad-x) 0.62rem;
  background: #fff;
}
.canvas__form-read-identity--single-line {
  align-items: center;
}
.canvas__form-read-identity--single-line .canvas__form-read-identity-avatar {
  margin-top: 0;
}
.canvas__form-read-highlight {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding: 0.24rem var(--read-id-pad-x) 0.52rem;
  background: #fff;
}
.canvas__form-read-highlight-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: baseline;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  font-size: var(--read-id-subtitle-size);
  font-weight: var(--read-id-subtitle-weight);
  letter-spacing: var(--read-id-subtitle-tracking);
  line-height: var(--read-id-subtitle-lh);
}
.canvas__form-read-highlight-key,
.canvas__form-read-highlight-sep {
  flex-shrink: 0;
  color: var(--read-id-subtitle-color);
}
.canvas__form-read-highlight-val {
  flex: 1 1 0;
  color: #000;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-inline-start: 0.28em;
}
.canvas__form-read-identity-avatar {
  width: var(--read-id-avatar);
  height: var(--read-id-avatar);
  margin-top: 0.1rem;
  border-radius: 50%;
  flex-shrink: 0;
}
.canvas__form-read-identity-avatar--gloss {
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04);
}
.canvas__form-read-identity-avatar--gloss::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.4) 0 54%, transparent 57%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 52%);
  pointer-events: none;
}
.canvas__form-read-identity-text {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
  flex: 1;
}
.canvas__form-read-identity-line {
  display: block;
  min-width: 0;
}
.canvas__form-read-identity-line--primary {
  font-size: 1rem;
  font-weight: 600;
  color: #000;
  letter-spacing: -0.018em;
  line-height: 1.28;
}
.canvas__form-read-identity-line--subtitle {
  font-size: var(--read-id-subtitle-size);
  font-weight: var(--read-id-subtitle-weight);
  color: var(--read-id-subtitle-color);
  letter-spacing: var(--read-id-subtitle-tracking);
  line-height: var(--read-id-subtitle-lh);
}
.canvas.canvas--viewport-form > .canvas__form.canvas__form--tabs .canvas__tabs-wrap {
  position: sticky;
  top: 0;
  z-index: 3;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.07);
}
.canvas__form--tabs {
  padding-top: 0;
  overflow: hidden;
}
.canvas.canvas--viewport-form > .canvas__form.canvas__form--tabs {
  overflow-x: hidden;
  overflow-y: visible;
}
.canvas__form--tabs .canvas__tab-panel {
  padding-top: 0.65rem;
}
.canvas__form--empty-state {
  display: flex;
  flex-direction: column;
}
.canvas__form--empty-state .canvas__form-main {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.canvas__form--empty-state .canvas__placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem var(--form-body-pad-y);
}
.canvas__placeholder {
  text-align: center;
  color: #999;
  max-width: 22rem;
  margin: 0 auto;
}
.canvas__placeholder-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}
.canvas__placeholder p {
  margin: 0;
  font-size: 0.925rem;
}
.canvas.canvas--viewport-form > .canvas__form:has(.canvas__form-footer-actions) > .canvas__form-popup-bounds > .canvas__form-main {
  padding-bottom: calc(1.05rem + 0.85rem + 2.65rem + var(--form-body-pad-y) + 0.65rem + 0.25rem);
}
.canvas__form-footer-actions {
  position: absolute;
  left: calc(-1 * var(--form-body-pad-x));
  right: calc(-1 * var(--form-body-pad-x));
  bottom: calc(-1 * var(--form-body-pad-y));
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  padding-top: 0.85rem;
  padding-left: var(--form-body-pad-x);
  padding-right: calc(var(--form-body-pad-x) + 0.95rem);
  padding-bottom: calc(var(--form-body-pad-y) + 0.95rem);
  border: none;
  background: transparent;
  pointer-events: none;
}
.canvas__form-footer-actions .canvas__form-fab {
  pointer-events: auto;
}
.canvas__form-fab {
  width: 2.65rem;
  height: 2.65rem;
  border-radius: 50%;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  color: #fff;
  line-height: 0;
  cursor: default;
}
.canvas__form-fab--cancel {
  background: #ce0933;
}
.canvas__form-fab--confirm {
  background: #177f55;
}
.canvas__form-fab-icon {
  display: block;
  width: 1.62rem;
  height: 1.62rem;
  flex-shrink: 0;
}
.canvas__section {
  margin-bottom: 0.65rem;
}
.canvas__section:last-child {
  margin-bottom: 0;
}
.canvas__section--tabs {
  margin-bottom: 0;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}
.canvas__section--accordion {
  background: #fff;
}
details.canvas__section--accordion > summary.canvas__section-header {
  list-style: none;
}
details.canvas__section--accordion > summary.canvas__section-header::-webkit-details-marker {
  display: none;
}
.canvas__section-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  margin: 0;
  padding: 0.55rem 0;
  border: none;
  border-radius: 0;
  background: #fff;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.35;
  color: #000;
  text-align: left;
  cursor: pointer;
}
.canvas__section-chevron {
  flex-shrink: 0;
  display: block;
  width: 0.875rem;
  height: 0.875rem;
  overflow: visible;
  color: #000;
  transform: translateY(-0.1em);
  transition: transform 0.15s ease;
}
details.canvas__section--accordion[open] > summary .canvas__section-chevron {
  transform: translateY(-0.1em) rotate(90deg);
}
.canvas__section-title {
  flex: 0 1 auto;
  max-width: 100%;
  min-width: 0;
  line-height: 1.35;
}
.canvas__section-rule {
  flex: 1 1 auto;
  min-width: 0.75rem;
  height: 1px;
  margin-left: 0.35rem;
  align-self: center;
  background: #000;
}
.canvas__section-body {
  padding: 0.75rem 0 0;
}
.canvas__section-empty {
  margin: 0;
  font-size: 0.8rem;
  color: #71717a;
  padding: 0.35rem 0;
}
.canvas__tabs-wrap {
  display: flex;
  align-items: flex-end;
  flex-wrap: nowrap;
  margin: 0 calc(-1 * var(--form-body-pad-x));
  padding: 0;
  border-bottom: 1px solid #e8e8e8;
  background: #fff;
}
.canvas__tabs-scrollport {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.canvas__tabs-scrollport::-webkit-scrollbar {
  display: none;
}
.canvas__tabs {
  flex-shrink: 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 0;
  width: max-content;
  min-width: 100%;
}
.canvas__tabs-nav {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0.72rem 0 0.62rem;
  min-width: 1.35rem;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  color: #474747;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s, opacity 0.15s;
}
.canvas__tabs-nav:hover:not(:disabled) {
  color: #3f3f46;
  background: #f4f4f5;
}
.canvas__tabs-nav:disabled {
  opacity: 0.38;
  cursor: default;
}
.canvas__tabs-nav-icon {
  display: block;
  width: 1rem;
  height: 1rem;
}
.canvas__tabs-wrap:not(.canvas__tabs-wrap--scrollable) .canvas__tabs-nav {
  width: 0;
  min-width: 0;
  padding-left: 0;
  padding-right: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  border: none;
}
.canvas__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex: 0 0 auto;
  width: auto;
  max-width: 100%;
  margin: 0;
  padding: 0.72rem 1.35rem 0.62rem;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  color: #474747;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.canvas__section-icon {
  flex-shrink: 0;
  font-size: 1.125rem !important;
  width: 1.25rem;
  height: 1.25rem;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.canvas__tab .canvas__section-icon {
  font-size: 1.02rem !important;
  width: 1.12rem;
  height: 1.12rem;
}
.canvas__tab:hover:not(.canvas__tab--active) {
  color: #3f3f46;
  background: #f4f4f5;
}
.canvas__tab--active {
  color: #18181b;
  border-bottom-color: #18181b;
  background: #fff;
}
.canvas__tab-panel[hidden] {
  display: none !important;
}
.canvas__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 3px;
  align-items: start;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}
.field__embedded-acc-panel .canvas__form,
.field__embedded-root-body .canvas__form {
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
  background: transparent;
  max-width: none;
  flex: none;
  min-height: 0;
}
.field__embedded-acc-panel .canvas__form-main,
.field__embedded-root-body .canvas__form-main {
  overflow: visible;
  margin: 0;
  width: 100%;
  max-width: none;
  flex: none;
  min-height: 0;
}
.canvas__cell { min-width: 0; }
.canvas__card {
  background: #fff;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  padding: 0.45rem 0.5rem;
  transition: border-color 0.15s;
}
.canvas__card:hover,
.canvas__card:focus-within {
  border-color: #d4d4d8;
}
.field { display: flex; flex-direction: column; gap: 0.5rem; }
.field__label { font-size: 0.8rem; font-weight: 500; color: #000; }
.field__label-req-only { font-size: 0.8rem; font-weight: 500; color: #000; min-height: 1.1em; line-height: 1.2; }
.field__label-req-only .field__required { margin-left: 0; }
.field__input {
  width: 100%;
  padding: 0 0 0.5rem;
  margin: 0;
  border: 0;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  line-height: 1.35;
  font-family: inherit;
  color: #18181b;
  background: transparent;
  outline: none;
  box-sizing: border-box;
  min-height: calc(0.85rem * 1.35 + 0.5rem);
}
.field:not(.field--readonly) .field__input {
  border-bottom: 1px solid rgba(24, 24, 27, 0.28);
  border-radius: 0;
}
.field__textarea { resize: none; line-height: 1.5; padding-bottom: 0.35rem; font-weight: 300; }
.field__textarea[readonly] { background: transparent; }
.field__input[readonly] { cursor: default; border-bottom: none; border-radius: 0.375rem; }
.field__input[readonly]:not(.field__input--empty) { color: #474747; }
.field__input[readonly].field__input--empty { color: #b8b8c2; }
.field__input[type='number'] { -moz-appearance: textfield; }
.field__input[type='number']::-webkit-inner-spin-button,
.field__input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.field__required { color: #dc2626; margin-left: 0.2rem; font-weight: 700; }
.field__badge {
  display: inline-block; margin-left: 0.4rem; padding: 0.1rem 0.4rem;
  font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
  color: #6366f1; background: #eef2ff; border-radius: 0.25rem; vertical-align: middle;
}
/* Reference field */
.field__ref-wrap { position: relative; width: 100%; }
.field__ref-control {
  display: flex; align-items: center; width: 100%; min-width: 0;
  box-sizing: border-box; height: calc(0.85rem * 1.35 + 0.5rem + 1px);
  padding: 0 1rem 0.5rem 0; margin: 0; border: 0; cursor: pointer;
  font-size: 0.85rem; line-height: 1.35;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%23666' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='2.5 4.5 6 8 9.5 4.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 0 center;
}
.field:not(.field--readonly) .field__ref-control {
  border-bottom: 1px solid rgba(24, 24, 27, 0.28); border-radius: 0;
}
.field--readonly .field__ref-control { cursor: default; background-image: none; padding-right: 0; }
.field--readonly .field__ref-control:hover { cursor: pointer; }
.field__ref-control--multi-base { flex-wrap: wrap; gap: 0.2rem; overflow: hidden; }
.field__ref-control--wrapped { height: auto; min-height: calc(0.85rem * 1.35 + 0.5rem + 1px); overflow: visible; }
.field__ref-placeholder { font-size: 0.85rem; color: #b8b8c2; }
.field__ref-chip {
  display: inline-flex; align-items: center; gap: 1px;
  padding: calc(0.10rem + 1px) calc(0.45rem + 1px); background: #f5f5f5; border: none;
  border-radius: 0.4rem; font-size: 0.8rem; font-weight: 500;
  color: #000; line-height: 1.35; max-width: 100%; min-width: 0; overflow: hidden;
}
.field__ref-chip-label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; min-width: 0; }
.field--readonly .field__ref-chip-label { text-decoration: underline; text-underline-offset: 0.12em; }
.field__ref-chip-x {
  display: flex; align-items: center; justify-content: center;
  width: 14px; height: 14px; border: none; background: transparent;
  color: #94a3b8; cursor: pointer; padding: 0; border-radius: 50%;
  flex-shrink: 0; line-height: 0; transition: color 0.15s, background 0.15s;
}
.field__ref-chip-x:hover { color: #000; background: #ddd; }
.field__ref-menu {
  position: absolute; top: 100%; left: 0; right: 0;
  margin: 0.25rem 0 0; padding: 0.25rem 0; list-style: none;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 0.375rem;
  box-shadow: 0 4px 14px rgba(0,0,0,0.1); z-index: 30;
  max-height: 10rem; overflow-y: auto;
}
.field__ref-option {
  display: block; width: 100%; padding: 0.4rem 0.65rem; border: none;
  background: transparent; font-size: 0.75rem; font-family: inherit;
  text-align: left; color: #474747; cursor: pointer; transition: background 0.1s;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}
.field__ref-option:hover { background: #f1f5f9; }
.field__textopt-wrap { position: relative; width: 100%; min-width: 0; }
.field__textopt-measure-host {
  position: absolute; left: 0; right: 0; top: 0; width: 100%; height: 0;
  overflow: visible; visibility: hidden; pointer-events: none; z-index: -1;
}
.field__textopt-row {
  display: inline-flex; flex-wrap: nowrap; align-items: stretch; gap: 0; width: max-content; max-width: 100%;
  box-sizing: border-box; min-height: calc(0.85rem * 1.35 + 0.44rem + 0.1rem);
  border: none; background: transparent; overflow: visible;
}
.field__textopt-row--measure { width: max-content; max-width: none; }
.field__textopt-inline { width: 100%; min-width: 0; }
.field__textopt-inline .field__textopt-row { flex-wrap: nowrap; }
.field__textopt-cell {
  position: relative; z-index: 0; flex: 0 0 auto; align-self: stretch; display: inline-flex; align-items: center;
  margin: 0 0 0 -1px; padding: 0 0.72rem; border: 1px solid rgba(24,24,27,0.22); border-radius: 0; background: #fff;
  font-size: 0.78rem; font-family: inherit; font-weight: 500; color: #474747;
  line-height: 1.35; cursor: pointer; white-space: nowrap;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.field__textopt-cell:first-child { margin-left: 0; border-top-left-radius: 9999px; border-bottom-left-radius: 9999px; }
.field__textopt-cell:last-child { border-top-right-radius: 9999px; border-bottom-right-radius: 9999px; }
.field__textopt-cell:only-child { border-radius: 9999px; }
.field__textopt-cell:hover:not(:disabled):not(.field__textopt-cell--selected) { background: #f5f5f5; z-index: 2; }
.field__textopt-cell--selected { background: #474747; color: #fff; border-color: #474747; z-index: 1; }
.field__textopt-cell--selected:hover:not(:disabled) { background: #525252; border-color: #525252; }
.field__textopt-compact { width: 100%; min-width: 0; }
/* Embedded reference (subformulário) */
.field--embedded-accordion .field__embedded { padding: 0; overflow: hidden; border: none; border-radius: 0.5rem; background: transparent; }
.field__embedded-details { margin: 0; background: transparent; border: none; border-radius: 0.5rem; overflow: hidden; }
.field__embedded-details summary.field__embedded-acc-header {
  display: flex; align-items: center; width: 100%; padding: 0; margin: 0; cursor: pointer; list-style: none;
  background: #f5f5f5; color: #3f3f46; box-sizing: border-box; font-size: 0.8rem; font-family: inherit;
}
.field__embedded-details summary.field__embedded-acc-header::-webkit-details-marker { display: none; }
.field__embedded-acc-header:hover,
.field__embedded-details[open] > summary.field__embedded-acc-header { background: #ebebeb; }
.field__embedded-acc-summary-main {
  display: flex; align-items: center; gap: 0.45rem; flex: 1; min-width: 0; padding: 0.5rem 0.65rem; font-weight: 600;
}
.field__embedded-acc-title { flex: 1; text-align: left; }
.field__embedded-acc-chevron { flex-shrink: 0; color: currentColor; transition: transform 0.2s; transform: rotate(-90deg); }
.field__embedded-details[open] .field__embedded-acc-chevron { transform: rotate(0deg); }
.field__embedded-acc-actions {
  display: none; flex-shrink: 0; align-items: center; gap: 0; padding: 0 0.35rem 0 0;
}
.field__embedded-details[open] summary.field__embedded-acc-header .field__embedded-acc-actions { display: flex; }
.field__embedded-details:not([open]) summary.field__embedded-acc-header:hover .field__embedded-acc-actions { display: flex; }
.field__embedded-acc-icon-btn {
  display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem;
  margin: 0 -0.04rem; border-radius: 0.35rem; color: inherit; line-height: 0; vertical-align: middle;
  transition: background 0.12s, color 0.12s, border-radius 0.12s;
}
.field__embedded-acc-icon-btn--disabled { opacity: 0.35; }
.field__embedded-acc-icon-btn:hover { border-radius: 50%; background: rgba(63,63,70,0.07); color: #27272a; }
.field__embedded-acc-icon-btn--disabled:hover { border-radius: 0.35rem !important; background: transparent !important; opacity: 0.35; }
.field__embedded-acc-panel { padding: 0.5rem 0.65rem 0.65rem; border: 1px solid #d4d4d8; border-top: none; border-radius: 0 0 0.5rem 0.5rem; background: #fff; box-sizing: border-box; }
.field__embedded-acc-panel .canvas__grid { min-height: 0; }
.field__embedded-root-body { margin-top: 0.15rem; }
.field__embedded-root-body .canvas__grid { min-height: 0; margin: 0; }
.field__embedded-acc-empty { margin: 0; padding: 0.35rem 0; font-size: 0.75rem; color: #a1a1aa; font-style: italic; }
.field__embedded-stack { display: flex; flex-direction: column; gap: 0.25rem; }
.field__embedded-add-btn { margin-top: 0.2rem; align-self: flex-start; }
.field__embedded { background: transparent; border: none; border-radius: 0; }
.field__embedded-table-layout { display: flex; flex-direction: column; width: 100%; max-width: 100%; min-width: 0; }
.field--embedded-table-mode .field__embedded-table-scroll { overflow-x: auto; width: 100%; max-width: 100%; min-width: 0; flex: 1 1 auto; background: #fff; }
.field__embedded-table-add-footer { flex-shrink: 0; width: 100%; max-width: 100%; background: #fff; }
.field__embedded-table { width: 100%; min-width: max(100%, var(--embed-min-sum, 100%)); table-layout: fixed; border-collapse: separate; border-spacing: 0; font-size: 0.8rem; }
.field__embedded-table-th:not(.field__embedded-table-th-actions), .field__embedded-table-td:not(.field__embedded-table-td-actions) { width: calc((100% - var(--embed-actions-w, 0px)) * 1 / var(--embed-data-cols, 1)); }
.field__embedded-table thead tr:hover > th, .field__embedded-table tbody tr:hover > td { background-color: #ebebeb; }
.field__embedded-table-add-footer .field__embedded-table-add-cell { background-color: #fff; }
.field__embedded-table-th, .field__embedded-table-td { border-bottom: 1px solid #e4e4e7; padding: 0.55rem 0.5rem 0.32rem; text-align: left; vertical-align: top; }
.field__embedded-table-th { background: #fff; color: #000; font-weight: 600; }
.field__embedded-table-th-actions, .field__embedded-table-td-actions { width: var(--embed-actions-w, 2.5rem); min-width: var(--embed-actions-w, 2.5rem); max-width: var(--embed-actions-w, 2.5rem); position: sticky; right: 0; z-index: 2; }
.field__embedded-table thead .field__embedded-table-th-actions { z-index: 3; }
.field__embedded-table-th.field__embedded-table-th-actions { background: transparent; }
.field__embedded-table thead tr:hover > .field__embedded-table-th-actions { background-color: transparent; }
.field__embedded-table-td-actions:focus-within { background-color: #ebebeb; transition: background-color 0.12s ease; }
.field__embedded-table-th-actions { padding-left: 0.3rem; padding-right: 0.3rem; }
.field__embedded-table-td-actions { background: transparent; padding: 0.4rem 0.28rem 0.2rem; text-align: center; vertical-align: middle; color: #3f3f46; }
.field__embedded-table-td-actions .field__embedded-acc-icon-btn { width: 1.65rem; height: 1.65rem; margin: 0 auto; border: 1px solid #d4d4d8; border-radius: 50%; background: transparent; box-sizing: border-box; opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.12s ease, visibility 0.12s ease, background 0.12s, color 0.12s, border-color 0.12s; }
.field__embedded-table tbody tr:hover .field__embedded-table-td-actions .field__embedded-acc-icon-btn, .field__embedded-table tbody tr:focus-within .field__embedded-table-td-actions .field__embedded-acc-icon-btn { opacity: 1; visibility: visible; pointer-events: auto; }
.field__embedded-table-td-actions .field__embedded-acc-icon-btn:hover { border-radius: 50%; border-color: #c4c4c8; background: rgba(63,63,70,0.07); }
.field__embedded-table-td-actions .field__embedded-acc-icon-btn svg { width: 14px; height: 14px; }
.field__embedded-table-cell { min-width: 0; width: 100%; max-width: 100%; box-sizing: border-box; }
.field__embedded-table-th--small, .field__embedded-table-td--small { min-width: 7rem; }
.field__embedded-table-th--medium, .field__embedded-table-td--medium { min-width: 10rem; }
.field__embedded-table-th--large, .field__embedded-table-td--large { min-width: 13rem; }
.field__embedded-table-cell .field { margin: 0; }
.field__embedded-table-cell .field__label, .field__embedded-table-cell .field__boolean-label > .field__label {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
.field__embedded-table-cell .field__boolean-label { display: flex; flex-direction: row; align-items: center; justify-content: flex-start; gap: 0.5rem; }
.field__embedded-table-cell .field__file-btn { align-self: flex-start; }
.field__embedded-table-td:has(.field__embedded-table-nested-ref-btn) { vertical-align: middle; }
.field__embedded-table-nested-ref-btn { display: inline-flex; align-items: center; justify-content: center; margin: 0; padding: 0.35rem 0.85rem; border: 1px solid #e4e4e7; border-radius: 9999px; background: #fff; font-family: inherit; font-size: 0.75rem; font-weight: 500; line-height: 1.25; color: #474747; cursor: pointer; box-sizing: border-box; }
.field__embedded-table-nested-ref-btn:hover { background: #e8e8ec; border-color: #d0d0d8; color: #474747; }
.field__embedded-table-empty { padding: 0.55rem 0.65rem 0.32rem; }
.field__embedded-table-empty .field__embedded-acc-empty { padding: 0.25rem 0; }
.field__embedded-table-add-cell { border-bottom: 1px solid #e4e4e7; padding: 0; vertical-align: middle; width: 100%; box-sizing: border-box; }
.field__embedded-table-add-wrap { display: flex; justify-content: flex-start; align-items: center; padding: 0.55rem 0.5rem; box-sizing: border-box; }
.field__embedded-table-add-wrap .field__embedded-add-btn { margin: 0; padding: 0; }
/* File field */
.field__file-btn {
  width: 27px; height: 27px; border-radius: 50%; border: 1px solid #d4d4d8;
  background: #fff; display: flex; align-items: center; justify-content: center;
  color: #3f3f46; cursor: pointer; flex-shrink: 0; line-height: 0;
}
.field__file-btn .field__file-icon { display: block; flex-shrink: 0; overflow: visible; }
.field--readonly .field__file-btn { cursor: default; opacity: 0.5; }
.field__demo-file-hint { margin: 0.35rem 0 0; font-size: 0.75rem; color: #71717a; line-height: 1.35; }
.field__file-stack {
  display: flex; flex-direction: column; align-items: flex-start; gap: 0.35rem; width: 100%;
  box-sizing: border-box; padding-left: 0.04rem; padding-right: 0.04rem;
}
.field__file-attached-list {
  display: flex; flex-direction: column; gap: 0; width: 100%; align-self: stretch;
  box-sizing: border-box;
}
.field__file-attached-row {
  display: flex; align-items: center; gap: 0; min-width: 0;
  padding: 0.35rem 0.4rem; border-radius: 0.375rem; box-sizing: border-box;
  transition: background 0.15s ease, opacity 0.15s ease;
  cursor: default;
}
.field__file-attached-row:hover { background: #ebebeb; cursor: pointer; }
.field__file-attached-row--dragging { opacity: 0.65; }
.field--readonly .field__file-attached-row,
.field--readonly .field__file-attached-row:hover { cursor: default; }
.field__file-drag-handle {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
  width: 0; min-width: 0; height: 1.35rem; max-height: 1.35rem; margin: 0; padding: 0; overflow: hidden;
  min-height: 1.35rem; color: #3f3f46;
  cursor: grab; opacity: 0; pointer-events: none;
  transition: width 0.12s ease, min-width 0.12s ease, margin 0.12s ease, padding 0.12s ease, opacity 0.12s ease, color 0.12s ease;
  transition-delay: 0s;
  line-height: 0;
}
.field__file-drag-handle:active { cursor: grabbing; }
.field__file-attached-row:hover .field__file-drag-handle {
  width: 1.35rem; min-width: 1.35rem; margin-left: -0.34rem; margin-right: 0.35rem;
  overflow: visible; opacity: 1; pointer-events: auto;
  transition-delay: 0.7s;
}
.field__file-attached-row--dragging .field__file-drag-handle {
  width: 1.35rem; min-width: 1.35rem; margin-left: -0.34rem; margin-right: 0.35rem;
  overflow: visible; opacity: 1; pointer-events: auto;
  transition-delay: 0s;
}
.field__file-drag-handle:hover { color: #27272a; }
.field__file-remove-btn {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
  width: 0; min-width: 0; margin: 0; padding: 0.25rem 0; overflow: hidden; border: none; border-radius: 9999px;
  background: transparent; color: #3f3f46; cursor: pointer; opacity: 0; pointer-events: none;
  transition: width 0.12s ease, min-width 0.12s ease, margin 0.12s ease, padding 0.12s ease, opacity 0.12s ease, color 0.12s ease, background 0.12s ease;
  line-height: 0;
}
.field__file-remove-btn:hover { color: #27272a; background: rgba(63, 63, 70, 0.1); }
.field__file-attached-row:hover .field__file-remove-btn {
  width: auto; min-width: calc(0.5rem + 14px); margin-left: 0.35rem; padding: 0.25rem; overflow: visible; opacity: 1; pointer-events: auto;
}
.field__file-drag-icon, .field__file-trash-icon { display: block; }
.field__file-doc-wrap { flex-shrink: 0; display: flex; align-items: center; line-height: 0; margin-right: 0.35rem; }
.field__file-attached-line { flex: 1; min-width: 0; font-size: 0.85rem; line-height: 1.35; color: #18181b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.field__file-upload-wrap { display: flex; justify-content: flex-start; flex-shrink: 0; }
/* Geopoint */
.field__geopoint { display: flex; align-items: center; gap: 0.5rem; width: 100%; }
.field__geopoint .field__input { flex: 1; min-width: 0; }
/* Boolean toggle */
.field--boolean { gap: 0; }
.field__boolean-label { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; width: 100%; cursor: pointer; }
.field--readonly .field__boolean-label { cursor: default; }
.field__toggle-row { display: flex; align-items: center; box-sizing: border-box; min-height: calc(0.85rem * 1.35 + 0.5rem); }
.field__checkbox { display: none; }
.field__toggle-track { width: 2.25rem; height: 1.25rem; border-radius: 999px; position: relative; transition: background 0.2s; flex-shrink: 0; }
.field__toggle-track--off { background: #ce0933; }
.field__toggle-track--on { background: #177f55; }
.field__toggle-thumb {
  position: absolute; top: 2px; left: 2px; width: 0.95rem; height: 0.95rem;
  background: #fff; border-radius: 50%; transition: transform 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.field__toggle-track--on .field__toggle-thumb { transform: translateX(1rem); }
.field__checkbox:disabled + .field__toggle-track { cursor: not-allowed; opacity: 0.85; }
.field--readonly.field--boolean .field__checkbox:disabled + .field__toggle-track.field__toggle-track--off { opacity: 1; background: rgba(206, 9, 51, 0.37); cursor: default; }
.field--readonly.field--boolean .field__checkbox:disabled + .field__toggle-track.field__toggle-track--on { opacity: 1; background: rgba(23, 127, 85, 0.37); cursor: default; }
/* HTML field */
.field--html { gap: 0.35rem; }
.field__html-render { font-size: 0.85rem; line-height: 1.5; color: #18181b; word-break: break-word; overflow: hidden; }
.field__html-render > *:first-child { margin-top: 0; }
.field__html-render > *:last-child { margin-bottom: 0; }
.field__html-empty { font-size: 0.8rem; color: #aaa; font-style: italic; }
/* Alert field */
.field--alert { gap: 0.35rem; }
.field--alert .field__alert { position: relative; display: flex; width: 100%; min-width: 0; border: 1px solid var(--alert-border, #ff9900); border-radius: 0.5rem; background: #fff; overflow: hidden; box-sizing: border-box; }
.field__alert-accent { flex-shrink: 0; width: 6px; background: var(--alert-accent, #ff9900); }
.field__alert-main { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.45rem 0.55rem 0.5rem; flex: 1; min-width: 0; }
.field__alert-type-icon { flex-shrink: 0; font-size: 1.15rem !important; line-height: 1; margin-top: 0; color: var(--alert-icon, #ff9900); font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.field__alert-content { flex: 1; min-width: 0; }
.field__alert-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
.field__alert-title { font-size: 0.85rem; font-weight: 600; color: #18181b; line-height: 1.35; margin: 0; }
.field__alert-toggle { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; margin: -0.15rem -0.2rem 0 0; padding: 0.2rem; border: none; border-radius: 0.25rem; background: transparent; color: #71717a; cursor: pointer; }
.field__alert-toggle:hover { background: #f4f4f5; color: #3f3f46; }
.field__alert-chevron { display: block; transition: transform 0.2s ease; }
.field--alert--collapsed .field__alert-chevron { transform: rotate(180deg); }
.field__alert-message { margin: 0.12rem 0 0; padding: 0; font-size: 0.82rem; line-height: 1.45; color: #71717a; white-space: pre-wrap; word-break: break-word; }
.field--alert--warning .field__alert { --alert-border: #ff9900; --alert-accent: #ff9900; --alert-icon: #ff9900; }
.field--alert--error .field__alert { --alert-border: #e00939; --alert-accent: #e00939; --alert-icon: #e00939; }
.field--alert--info .field__alert { --alert-border: #1976d2; --alert-accent: #1976d2; --alert-icon: #1976d2; }
.field--alert--success .field__alert { --alert-border: #177f55; --alert-accent: #177f55; --alert-icon: #177f55; }
.form-header {
  margin: 0 auto 1rem;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.form-header__left { display: flex; flex-direction: column; gap: 0.25rem; }
.form-header__title { font-size: 1.25rem; font-weight: 500; color: #272727; margin: 0; }
.form-header__meta { font-size: 0.75rem; color: #A5A7B0; display: flex; gap: 0.75rem; align-items: center; }
.form-header__meta-dot { width: 3px; height: 3px; border-radius: 50%; background: #A5A7B0; }
.form-header__badge {
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.25rem 0.7rem; background: #fff; border: 1px solid #A5A7B0;
  border-radius: 6px; font-size: 0.7rem; font-weight: 600; color: #272727;
}
.canvas__spec {
  margin-top: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: #F9F9F9;
  border-left: 3px solid #062950;
  border-radius: 0 6px 6px 0;
  font-size: 0.78rem;
  color: #272727;
  line-height: 1.5;
}
.canvas__spec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #062950;
  margin-bottom: 0.3rem;
}
.canvas__spec-header-main {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.canvas__spec-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.canvas__spec-markdown-root { word-break: break-word; }
.canvas__spec-md-p {
  margin: 0 0 0.45rem 0;
  white-space: normal;
}
.canvas__spec-md-p:last-child { margin-bottom: 0; }
.canvas__spec-md-p strong { font-weight: 700; color: inherit; }
.canvas__spec-md-p code {
  font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;
  font-size: 0.92em;
  padding: 0.05em 0.28em;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 2px;
}
.canvas__spec--hidden { display: none; }
.spec-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
}
.spec-toggle__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #272727;
}
.spec-toggle__track {
  position: relative;
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: #A5A7B0;
  transition: background 0.15s;
  flex-shrink: 0;
}
.spec-toggle__track--on { background: #062950; }
.spec-toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
  transition: left 0.15s;
}
.spec-toggle__track--on .spec-toggle__thumb { left: 16px; }
@media print {
  body { background: #fff; padding: 0; }
  .canvas.canvas--viewport-form {
    min-height: 0;
    height: auto;
    max-height: none;
  }
  .canvas__form { box-shadow: none; border: none; border-radius: 0; }
}
  </style>
</head>
<body data-export-initial-read="${initialRead ? 'true' : 'false'}">
  <div class="form-header">
    <div class="form-header__left">
      <h1 class="form-header__title">${esc(form.name)}</h1>
      <div class="form-header__meta">
        <span>${form.fields.length} campos</span>
        <span class="form-header__meta-dot"></span>
        <span>Exportado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
      </div>
    </div>
    <div class="form-header__actions">
      <div class="export-canvas-mode" role="group" aria-label="Modo do canvas">
        <button type="button" class="export-canvas-mode__btn${modeEditActive}" id="exportModeEdit" aria-pressed="${initialRead ? 'false' : 'true'}">Edição</button>
        <button type="button" class="export-canvas-mode__btn${modeReadActive}" id="exportModeRead" aria-pressed="${initialRead ? 'true' : 'false'}">Visualização</button>
      </div>
      <label class="spec-toggle" id="specToggle">
        <span class="spec-toggle__label">Detalhamento dos campos</span>
        <span class="spec-toggle__track" id="specTrack">
          <span class="spec-toggle__thumb"></span>
        </span>
      </label>
      <div class="form-header__badge">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2" width="11" height="12" rx="1.25"/><path d="M5 5.5h6M5 8h6M5 10.5h5M5 13h4"/></svg>
        Formulário
      </div>
    </div>
  </div>
  <section id="exportFormViewport" class="canvas canvas--viewport-form">
    <div id="exportFormCard" class="${formCardClass}">
${preface}
      <div class="canvas__form-popup-bounds">
${readMenuBar}
        <div class="canvas__form-main">
${mainInner}
        </div>
${footer}
      </div>
    </div>
  </section>
  <script>
(function(){
  /* ── Modo edição / visualização (igual ao canvas da app) ── */
  function applyExportFieldReadMode(root, read){
    if(read){
      root.querySelectorAll('.canvas__card').forEach(function(card){
        if(card.hasAttribute('data-export-model-ro')) return;
        card.querySelectorAll('input.field__input, textarea.field__textarea').forEach(function(inp){
          if(!inp.readOnly && !inp.hasAttribute('data-export-canvas-lock')){
            inp.readOnly = true;
            inp.setAttribute('data-export-canvas-lock','');
          }
        });
        card.querySelectorAll('input.field__checkbox').forEach(function(cb){
          if(!cb.disabled && !cb.hasAttribute('data-export-canvas-lock')){
            cb.disabled = true;
            cb.setAttribute('data-export-canvas-lock','');
          }
        });
        var fld = card.querySelector('.field');
        if(!fld) return;
        if(fld.hasAttribute('data-ref') || fld.hasAttribute('data-textopt')){
          if(!fld.hasAttribute('data-readonly')){
            fld.setAttribute('data-readonly','');
            fld.setAttribute('data-export-canvas-lock','');
            fld.classList.add('field--readonly');
          }
          if(fld.hasAttribute('data-textopt')){
            fld.querySelectorAll('.field__textopt-cell').forEach(function(btn){
              if(!btn.disabled && !btn.hasAttribute('data-export-canvas-lock')){
                btn.disabled = true;
                btn.setAttribute('data-export-canvas-lock','');
              }
            });
          }
        }
      });
    } else {
      Array.prototype.slice.call(root.querySelectorAll('[data-export-canvas-lock]')).reverse().forEach(function(el){
        if(el.classList && el.classList.contains('field')){
          el.removeAttribute('data-readonly');
          el.classList.remove('field--readonly');
        } else if(el.matches && el.matches('input.field__checkbox')){
          el.disabled = false;
        } else if(el.matches && el.matches('button.field__textopt-cell')){
          el.disabled = false;
        } else if(el.readOnly !== undefined) {
          el.readOnly = false;
        }
        el.removeAttribute('data-export-canvas-lock');
      });
    }
  }
  function setExportCanvasReadMode(read){
    var vp = document.getElementById('exportFormViewport');
    var card = document.getElementById('exportFormCard');
    if(!vp || !card) return;
    vp.querySelectorAll('.canvas__form').forEach(function(f){
      if(read) f.classList.add('canvas__form--read');
      else f.classList.remove('canvas__form--read');
    });
    var pe = document.getElementById('exportPrefaceEdit');
    var pr = document.getElementById('exportPrefaceRead');
    if(pe) pe.hidden = !!read;
    if(pr) pr.hidden = !read;
    var rmb = document.getElementById('exportReadMenuBar');
    if(rmb) rmb.hidden = !read;
    var idSlot = document.getElementById('exportReadIdentitySlot');
    if(idSlot) idSlot.hidden = !read;
    var fo = document.getElementById('exportFormFooter');
    if(fo) fo.hidden = !!read;
    var bEdit = document.getElementById('exportModeEdit');
    var bRead = document.getElementById('exportModeRead');
    if(bEdit){
      bEdit.classList.toggle('export-canvas-mode__btn--active', !read);
      bEdit.setAttribute('aria-pressed', read ? 'false' : 'true');
    }
    if(bRead){
      bRead.classList.toggle('export-canvas-mode__btn--active', !!read);
      bRead.setAttribute('aria-pressed', read ? 'true' : 'false');
    }
    applyExportFieldReadMode(vp, read);
    document.querySelectorAll('[data-ref]').forEach(function(el){
      if(typeof el._exportRefRender === 'function') el._exportRefRender();
    });
    document.querySelectorAll('[data-textopt]').forEach(function(el){
      if(typeof el._exportTextoptRefresh === 'function') el._exportTextoptRefresh();
    });
  }
  var bEdit = document.getElementById('exportModeEdit');
  var bRead = document.getElementById('exportModeRead');
  if(bEdit) bEdit.addEventListener('click', function(){ setExportCanvasReadMode(false); });
  if(bRead) bRead.addEventListener('click', function(){ setExportCanvasReadMode(true); });

  /* ── Boolean toggles ── */
  function syncBooleanTrack(cb){
    var track = cb.nextElementSibling;
    if(!track || !track.classList || !track.classList.contains('field__toggle-track')) return;
    if(cb.checked){
      track.classList.remove('field__toggle-track--off');
      track.classList.add('field__toggle-track--on');
    } else {
      track.classList.remove('field__toggle-track--on');
      track.classList.add('field__toggle-track--off');
    }
  }
  document.querySelectorAll('.field__checkbox').forEach(function(cb){ syncBooleanTrack(cb); });
  document.querySelectorAll('.field__checkbox:not([disabled])').forEach(function(cb){
    cb.addEventListener('change', function(){ syncBooleanTrack(cb); });
  });

  /* ── Date mask ── */
  document.querySelectorAll('[data-date]').forEach(function(inp){
    inp.addEventListener('input', function(){
      var digits = inp.value.replace(/\\D/g,'').slice(0,8);
      var f = '';
      if(digits.length > 0) f = digits.slice(0,2);
      if(digits.length > 2) f += '/' + digits.slice(2,4);
      if(digits.length > 4) f += '/' + digits.slice(4,8);
      inp.value = f;
    });
  });

  /* ── Decimal mask ── */
  document.querySelectorAll('[data-decimal]').forEach(function(inp){
    var isCurrency = inp.getAttribute('data-decimal') === 'currency';
    inp.addEventListener('input', function(){
      var digits = inp.value.replace(/\\D/g,'');
      if(!digits){ inp.value = ''; return; }
      var cents = digits.length < 3 ? ('000'+digits).slice(-3) : digits;
      var intPart = cents.slice(0,-2).replace(/^0+(?=\\d)/,'');
      var decPart = cents.slice(-2);
      var withSep = intPart.replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.');
      inp.value = isCurrency ? 'R$ '+withSep+','+decPart : withSep+','+decPart;
    });
  });

  /* ── Reference fields ── */
  var X_SVG = '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>';

  document.querySelectorAll('[data-ref]').forEach(function(fieldEl){
    var allOptions = JSON.parse(fieldEl.getAttribute('data-ref'));
    var isMultiple = fieldEl.hasAttribute('data-multiple');
    function refReadOnly(){
      return fieldEl.hasAttribute('data-readonly');
    }
    var selected = [];
    var ds = fieldEl.getAttribute('data-demo-selected');
    if(ds){
      try {
        var parsed = JSON.parse(ds);
        if(Array.isArray(parsed)){
          selected = parsed.filter(function(x){
            return typeof x === 'string' && allOptions.indexOf(x) >= 0;
          });
        }
      } catch(e){}
    }
    var control = fieldEl.querySelector('.field__ref-control');
    var wrap = fieldEl.querySelector('.field__ref-wrap');
    var menuOpen = false;

    if(isMultiple) control.classList.add('field__ref-control--multi-base');

    function render(){
      control.innerHTML = '';
      if(selected.length === 0){
        var ph = document.createElement('span');
        ph.className = 'field__ref-placeholder';
        ph.textContent = 'Selecione';
        control.appendChild(ph);
      } else {
        selected.forEach(function(val){
          var chip = document.createElement('span');
          chip.className = 'field__ref-chip';
          var lbl = document.createElement('span');
          lbl.className = 'field__ref-chip-label';
          lbl.textContent = val;
          chip.appendChild(lbl);
          if(!refReadOnly()){
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'field__ref-chip-x';
            btn.innerHTML = X_SVG;
            btn.addEventListener('click', function(e){
              e.stopPropagation();
              selected = selected.filter(function(v){ return v !== val; });
              render();
            });
            chip.appendChild(btn);
          }
          control.appendChild(chip);
        });
      }
      if(isMultiple && selected.length > 1){
        var chips = control.querySelectorAll('.field__ref-chip');
        var first = chips[0].offsetTop;
        var last = chips[chips.length-1].offsetTop;
        if(last > first){
          control.classList.add('field__ref-control--wrapped');
        } else {
          control.classList.remove('field__ref-control--wrapped');
        }
      } else {
        control.classList.remove('field__ref-control--wrapped');
      }
    }

    function openMenu(){
      if(refReadOnly()) return;
      closeAllMenus();
      var avail = allOptions.filter(function(o){ return selected.indexOf(o) === -1; });
      if(avail.length === 0) return;
      var ul = document.createElement('ul');
      ul.className = 'field__ref-menu';
      avail.forEach(function(opt){
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'field__ref-option';
        btn.textContent = opt;
        btn.addEventListener('click', function(e){
          e.stopPropagation();
          if(isMultiple){
            selected.push(opt);
            render();
            li.remove();
            if(ul.children.length === 0) ul.remove();
          } else {
            selected = [opt];
            render();
            closeMenu();
          }
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      menuOpen = true;
    }

    function closeMenu(){
      var m = wrap.querySelector('.field__ref-menu');
      if(m) m.remove();
      menuOpen = false;
    }

    render();

    control.addEventListener('click', function(){
      if(refReadOnly()) return;
      if(menuOpen) closeMenu(); else openMenu();
    });

    document.addEventListener('mousedown', function(e){
      if(menuOpen && !wrap.contains(e.target)) closeMenu();
    });
    fieldEl._exportRefRender = render;
  });

  /* ── Opções em texto ── */
  document.querySelectorAll('[data-textopt]').forEach(function(fieldEl){
    var allOptions = JSON.parse(fieldEl.getAttribute('data-textopt'));
    var isMultiple = fieldEl.hasAttribute('data-multiple');
    function textoptReadOnly(){
      return fieldEl.hasAttribute('data-readonly');
    }
    var wrap = fieldEl.querySelector('.field__textopt-wrap');
    var measureRow = wrap.querySelector('.field__textopt-row--measure');
    var inlineBlock = wrap.querySelector('.field__textopt-inline');
    var compactBlock = wrap.querySelector('.field__textopt-compact');
    var refWrap = compactBlock ? compactBlock.querySelector('.field__ref-wrap') : null;
    var control = refWrap ? refWrap.querySelector('.field__ref-control') : null;

    var singleVal = '';
    var multiSel = [];
    var menuOpen = false;

    var dsd = fieldEl.getAttribute('data-demo-selected');
    if(dsd){
      try {
        var par = JSON.parse(dsd);
        if(Array.isArray(par)){
          var ok = par.filter(function(x){
            return typeof x === 'string' && allOptions.indexOf(x) >= 0;
          });
          if(isMultiple) multiSel = ok;
          else if(ok.length) singleVal = ok[0];
        }
      } catch(e){}
    }

    function selectedArray(){
      return isMultiple ? multiSel.slice() : (singleVal ? [singleVal] : []);
    }

    function syncInlineClasses(){
      if(isMultiple){
        inlineBlock.querySelectorAll('.field__textopt-cell').forEach(function(b){
          var t = b.textContent.trim();
          b.classList.toggle('field__textopt-cell--selected', multiSel.indexOf(t) >= 0);
        });
      } else {
        inlineBlock.querySelectorAll('.field__textopt-cell').forEach(function(b){
          b.classList.toggle('field__textopt-cell--selected', singleVal !== '' && b.textContent.trim() === singleVal);
        });
      }
    }

    function renderCompact(){
      if(!control) return;
      var selected = selectedArray();
      control.innerHTML = '';
      if(isMultiple){
        control.classList.add('field__ref-control--multi-base');
      } else {
        control.classList.remove('field__ref-control--multi-base');
      }
      if(selected.length === 0){
        var ph = document.createElement('span');
        ph.className = 'field__ref-placeholder';
        ph.textContent = 'Selecione';
        control.appendChild(ph);
      } else {
        selected.forEach(function(val){
          var chip = document.createElement('span');
          chip.className = 'field__ref-chip';
          var lbl = document.createElement('span');
          lbl.className = 'field__ref-chip-label';
          lbl.textContent = val;
          chip.appendChild(lbl);
          if(!textoptReadOnly()){
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'field__ref-chip-x';
            btn.innerHTML = X_SVG;
            btn.addEventListener('click', function(e){
              e.stopPropagation();
              if(isMultiple){
                multiSel = multiSel.filter(function(v){ return v !== val; });
              } else {
                singleVal = '';
              }
              renderCompact();
              syncInlineClasses();
            });
            chip.appendChild(btn);
          }
          control.appendChild(chip);
        });
      }
      if(isMultiple && selected.length > 1){
        var chips = control.querySelectorAll('.field__ref-chip');
        var first = chips[0].offsetTop;
        var last = chips[chips.length-1].offsetTop;
        if(last > first){
          control.classList.add('field__ref-control--wrapped');
        } else {
          control.classList.remove('field__ref-control--wrapped');
        }
      } else {
        control.classList.remove('field__ref-control--wrapped');
      }
    }

    function closeCompactMenu(){
      if(!refWrap) return;
      var m = refWrap.querySelector('.field__ref-menu');
      if(m) m.remove();
      menuOpen = false;
    }

    function openCompactMenu(){
      if(textoptReadOnly() || !refWrap) return;
      closeAllMenus();
      var selected = selectedArray();
      var avail = allOptions.filter(function(o){ return selected.indexOf(o) === -1; });
      if(avail.length === 0) return;
      var ul = document.createElement('ul');
      ul.className = 'field__ref-menu';
      avail.forEach(function(opt){
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'field__ref-option';
        btn.textContent = opt;
        btn.addEventListener('click', function(e){
          e.stopPropagation();
          if(isMultiple){
            multiSel.push(opt);
          } else {
            singleVal = opt;
          }
          renderCompact();
          syncInlineClasses();
          li.remove();
          if(ul.children.length === 0){
            ul.remove();
            menuOpen = false;
          }
          if(!isMultiple) closeCompactMenu();
        });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      refWrap.appendChild(ul);
      menuOpen = true;
    }

    function layout(){
      if(!measureRow || !wrap) return;
      var compact = measureRow.scrollWidth > wrap.clientWidth + 1;
      if(compact){
        inlineBlock.setAttribute('hidden','');
        if(compactBlock) compactBlock.removeAttribute('hidden');
        renderCompact();
      } else {
        inlineBlock.removeAttribute('hidden');
        if(compactBlock) compactBlock.setAttribute('hidden','');
        closeCompactMenu();
      }
      syncInlineClasses();
    }

    if(typeof ResizeObserver !== 'undefined'){
      new ResizeObserver(layout).observe(wrap);
    }
    layout();

    inlineBlock.querySelectorAll('.field__textopt-cell').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(textoptReadOnly()) return;
        var v = btn.textContent.trim();
        if(isMultiple){
          var i = multiSel.indexOf(v);
          if(i >= 0) multiSel.splice(i,1);
          else multiSel.push(v);
        } else {
          if(singleVal === v) singleVal = '';
          else singleVal = v;
        }
        syncInlineClasses();
        if(compactBlock && !compactBlock.hasAttribute('hidden')) renderCompact();
      });
    });

    if(control){
      control.addEventListener('click', function(){
        if(textoptReadOnly()) return;
        if(compactBlock && compactBlock.hasAttribute('hidden')) return;
        if(menuOpen) closeCompactMenu(); else openCompactMenu();
      });
      document.addEventListener('mousedown', function(e){
        if(menuOpen && refWrap && !refWrap.contains(e.target)) closeCompactMenu();
      });
    }
    fieldEl._exportTextoptRefresh = function(){
      layout();
    };
  });

  function closeAllMenus(){
    document.querySelectorAll('.field__ref-menu').forEach(function(m){ m.remove(); });
  }

  /* ── Spec toggle ── */
  var specsVisible = false;
  var specToggle = document.getElementById('specToggle');
  var specTrack = document.getElementById('specTrack');
  var allSpecs = document.querySelectorAll('.canvas__spec');

  allSpecs.forEach(function(el){ el.classList.add('canvas__spec--hidden'); });

  if(specToggle){
    specToggle.addEventListener('click', function(){
      specsVisible = !specsVisible;
      if(specsVisible){
        specTrack.classList.add('spec-toggle__track--on');
        allSpecs.forEach(function(el){ el.classList.remove('canvas__spec--hidden'); });
      } else {
        specTrack.classList.remove('spec-toggle__track--on');
        allSpecs.forEach(function(el){ el.classList.add('canvas__spec--hidden'); });
      }
    });
  }

  /* ── Abas: clique + setas de scroll (como no canvas da app) ── */
  document.querySelectorAll('[data-form-tabs]').forEach(function(root){
    var wrap = root.querySelector('.canvas__tabs-wrap');
    var scrollport = root.querySelector('.canvas__tabs-scrollport');
    var prev = root.querySelector('.canvas__tabs-nav--prev');
    var next = root.querySelector('.canvas__tabs-nav--next');
    var tabs = root.querySelectorAll('.canvas__tab');
    var panels = root.querySelectorAll('.canvas__tab-panel');
    if(!wrap || !scrollport || !prev || !next) return;
    function updateTabScrollNav(){
      var overflow = scrollport.scrollWidth > scrollport.clientWidth + 1;
      var maxScroll = Math.max(0, scrollport.scrollWidth - scrollport.clientWidth);
      var sl = scrollport.scrollLeft;
      wrap.classList.toggle('canvas__tabs-wrap--scrollable', overflow);
      prev.disabled = !overflow || sl <= 2;
      next.disabled = !overflow || sl >= maxScroll - 2;
    }
    scrollport.addEventListener('scroll', updateTabScrollNav);
    if(typeof ResizeObserver !== 'undefined'){
      new ResizeObserver(updateTabScrollNav).observe(scrollport);
      new ResizeObserver(updateTabScrollNav).observe(wrap);
    }
    window.addEventListener('resize', updateTabScrollNav);
    prev.addEventListener('click', function(){
      if(prev.disabled) return;
      var amount = Math.max(120, Math.floor(scrollport.clientWidth * 0.75));
      scrollport.scrollBy({ left: -amount, behavior: 'smooth' });
    });
    next.addEventListener('click', function(){
      if(next.disabled) return;
      var amount = Math.max(120, Math.floor(scrollport.clientWidth * 0.75));
      scrollport.scrollBy({ left: amount, behavior: 'smooth' });
    });
    tabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        var idx = parseInt(tab.getAttribute('data-tab-index') || '0', 10);
        tabs.forEach(function(t, j){
          var on = j === idx;
          t.classList.toggle('canvas__tab--active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(function(p, j){
          var on = j === idx;
          if(on) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
        });
        requestAnimationFrame(function(){ updateTabScrollNav(); });
      });
    });
    updateTabScrollNav();
  });

  document.querySelectorAll('[data-alert-collapsible="1"]').forEach(function(root){
    var btn = root.querySelector('.field__alert-toggle');
    var msg = root.querySelector('.field__alert-message');
    if(!btn || !msg) return;
    btn.addEventListener('click', function(){
      var collapsed = root.classList.toggle('field--alert--collapsed');
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      msg.style.display = collapsed ? 'none' : '';
    });
  });

  if(document.body.getAttribute('data-export-initial-read') === 'true'){
    var vpInit = document.getElementById('exportFormViewport');
    if(vpInit) applyExportFieldReadMode(vpInit, true);
    document.querySelectorAll('[data-ref]').forEach(function(el){
      if(typeof el._exportRefRender === 'function') el._exportRefRender();
    });
    document.querySelectorAll('[data-textopt]').forEach(function(el){
      if(typeof el._exportTextoptRefresh === 'function') el._exportTextoptRefresh();
    });
  }
})();
  </script>
</body>
</html>`
}
