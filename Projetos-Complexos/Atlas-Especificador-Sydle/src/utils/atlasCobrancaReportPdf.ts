import { jsPDF } from 'jspdf'
import type { EmbeddedDemoRow, FormDef } from '../types'
import { isFormFieldVisibleInForm } from '../types'
import { demoValueAsSingleLineSummary, formatDecimalDisplay } from './fieldDemoValue'
import { canvasRuntimeFieldKey } from './canvasRuntimeValueKey'
import { isEmbeddedChildBranch } from './embeddedDemo'
import { getEmbeddedRowsForField, getScalarDemoForField } from './formExamplePresets'
import { findFormById } from './linkedForm'
import { orderRootFieldsForDisplay } from './formSections'

export const ATLAS_CONTRATO_FORM_ID = 'form-atlas-contrato'
const ATLAS_GRUPO_FORM_ID = 'form-atlas-contrato-grupo'
const ATLAS_PEDIDO_FORM_ID = 'form-atlas-pedido-venda'
const ATLAS_MTI_FORM_ID = 'form-atlas-mti-linha'
const REPORT_METHOD_ID = 'atlas-meth-gerar-relatorio'

const EMB_GRUPOS = 'emb_contratos_grupos'
const EMB_PEDIDOS = 'emb_pedidos_venda'
const EMB_MTI = 'emb_mti_produtos'

function contractScalar(
  form: FormDef,
  fieldId: string,
  getValue: (k: string) => string | undefined,
): string {
  const field = form.fields.find((f) => f.id === fieldId)
  if (!field) return ''
  const key = canvasRuntimeFieldKey(form.id, [], fieldId)
  const ov = getValue(key)
  if (ov !== undefined && ov.trim() !== '') {
    if (field.type === 'decimal') {
      const raw = ov.replace(/\D/g, '')
      return formatDecimalDisplay(raw, !!field.currency) || ov
    }
    return ov.trim()
  }
  return demoValueAsSingleLineSummary(field, getScalarDemoForField(form, field.id))
}

function scalarFromRow(row: EmbeddedDemoRow, grupoForm: FormDef, fieldId: string): string {
  const field = grupoForm.fields.find((f) => f.id === fieldId)
  if (!field) return '—'
  const cell = row[fieldId]
  if (cell !== undefined && !isEmbeddedChildBranch(cell)) {
    return demoValueAsSingleLineSummary(field, cell as Parameters<typeof demoValueAsSingleLineSummary>[1])
  }
  return '—'
}

function pedidoRowsFromContract(row: EmbeddedDemoRow): EmbeddedDemoRow[] {
  const cell = row[EMB_PEDIDOS]
  if (isEmbeddedChildBranch(cell)) return cell.embeddedDemoInstances ?? []
  return []
}

function mtiRowsFromPedido(row: EmbeddedDemoRow): EmbeddedDemoRow[] {
  const cell = row[EMB_MTI]
  if (isEmbeddedChildBranch(cell)) return cell.embeddedDemoInstances ?? []
  return []
}

function slugFilenamePart(text: string): string {
  const s = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return s || 'relatorio'
}

function ensureSpace(doc: jsPDF, y: number, need: number, margin: number): number {
  const pageH = doc.internal.pageSize.getHeight()
  if (y + need > pageH - margin) {
    doc.addPage()
    return margin
  }
  return y
}

function writeSectionTitle(doc: jsPDF, title: string, y: number, margin: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 41, 59)
  doc.text(title, margin, y)
  doc.setDrawColor(203, 213, 225)
  doc.line(margin, y + 2, doc.internal.pageSize.getWidth() - margin, y + 2)
  return y + 8
}

function writeLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  margin: number,
  contentWidth: number,
): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(label, margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  const lines = doc.splitTextToSize(value || '—', contentWidth)
  doc.text(lines, margin, y + 4)
  return y + 4 + lines.length * 5 + 3
}

export function isAtlasCobrancaReportMethod(formId: string, methodId: string): boolean {
  return formId === ATLAS_CONTRATO_FORM_ID && methodId === REPORT_METHOD_ID
}

export function isAtlasCobrancaReportForm(formId: string): boolean {
  return formId === ATLAS_CONTRATO_FORM_ID || formId === 'form-atlas-cobranca-linha'
}

export function downloadAtlasCobrancaReportPdf(
  form: FormDef,
  getValue: (k: string) => string | undefined,
  epicForms: FormDef[],
): void {
  const grupoForm = findFormById(epicForms, ATLAS_GRUPO_FORM_ID)
  const pedidoForm = findFormById(epicForms, ATLAS_PEDIDO_FORM_ID)
  const mtiForm = findFormById(epicForms, ATLAS_MTI_FORM_ID)
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 14
  const pageW = doc.internal.pageSize.getWidth()
  const contentW = pageW - margin * 2
  let y = margin

  const cliente = contractScalar(form, 'atlas-cliente', getValue)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(15, 23, 42)
  doc.text('Relatório de cobrança — cliente', margin, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, margin, y)
  y += 10

  y = writeSectionTitle(doc, 'Identificação', y, margin)
  for (const f of orderRootFieldsForDisplay(form)) {
    if (!isFormFieldVisibleInForm(f) || f.type === 'embeddedReference') continue
    y = ensureSpace(doc, y, 14, margin)
    y = writeLabelValue(doc, f.label, contractScalar(form, f.id, getValue), y, margin, contentW)
  }
  y += 4

  const contractRows = getEmbeddedRowsForField(form, EMB_GRUPOS) ?? []
  if (!contractRows.length) {
    y = writeSectionTitle(doc, 'Contratos e pedidos', y, margin)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.text('Nenhum contrato cadastrado.', margin, y + 4)
    doc.save(`cobranca-${slugFilenamePart(cliente)}.pdf`)
    return
  }

  contractRows.forEach((ctRow) => {
    const contratoNum = grupoForm ? scalarFromRow(ctRow, grupoForm, 'atlas-ct-contrato') : String(ctRow['atlas-ct-contrato'] ?? '—')
    y = ensureSpace(doc, y, 20, margin)
    y = writeSectionTitle(doc, `Contrato ${contratoNum}`, y, margin)

    if (grupoForm) {
      for (const cf of grupoForm.fields) {
        if (cf.type === 'embeddedReference') continue
        y = ensureSpace(doc, y, 12, margin)
        y = writeLabelValue(doc, cf.label, scalarFromRow(ctRow, grupoForm, cf.id), y, margin, contentW)
      }
    }

    const pedidos = pedidoRowsFromContract(ctRow)
    if (!pedidos.length) {
      y = ensureSpace(doc, y, 8, margin)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.text('Sem pedidos de venda neste contrato.', margin, y)
      y += 8
      return
    }

    pedidos.forEach((pvRow, pvIdx) => {
      y = ensureSpace(doc, y, 16, margin)
      const pedidoNum = pedidoForm
        ? scalarFromRow(pvRow, pedidoForm as FormDef, 'atlas-pv-pedido')
        : String(pvRow['atlas-pv-pedido'] ?? `Parcela ${pvIdx + 1}`)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`Pedido ${pedidoNum || '—'} (contrato ${contratoNum})`, margin, y)
      y += 6

      if (pedidoForm) {
        for (const pf of pedidoForm.fields) {
          if (pf.type === 'embeddedReference') continue
          y = ensureSpace(doc, y, 10, margin)
          y = writeLabelValue(doc, pf.label, scalarFromRow(pvRow, pedidoForm, pf.id), y, margin, contentW)
        }
      }

      const mtis = mtiRowsFromPedido(pvRow)
      if (mtis.length) {
        y = ensureSpace(doc, y, 6, margin)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text('Produtos MTI', margin, y)
        y += 5
        for (const mrow of mtis) {
          const prod = mtiForm
            ? scalarFromRow(mrow, mtiForm, 'atlas-mti-produto')
            : String(mrow['atlas-mti-produto'] ?? '—')
          const val = mtiForm
            ? scalarFromRow(mrow, mtiForm, 'atlas-mti-valor')
            : '—'
          y = ensureSpace(doc, y, 5, margin)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          doc.text(`• ${prod}: ${val}`, margin + 2, y)
          y += 5
        }
      }
      y += 2
    })
    y += 4
  })

  doc.save(`cobranca-${slugFilenamePart(cliente)}.pdf`)
}
