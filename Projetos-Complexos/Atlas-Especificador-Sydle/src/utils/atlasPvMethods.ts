import type { FormDef } from '../types'
import { downloadAtlasCobrancaReportPdf } from './atlasCobrancaReportPdf'

export const FORM_VISAO_PV = 'form-atlas-visao-pedidos-venda'

const PV_METHODS = new Set([
  'atlas-meth-pv-gerar-periodo',
  'atlas-meth-pv-emitir-protheus',
  'atlas-meth-pv-reconciliar-hcmx',
  'atlas-meth-pv-automatizar',
  'atlas-meth-gerar-relatorio',
])

function readNum(getValue: (k: string) => string | undefined, key: string, fallback: number): number {
  const v = getValue(key)
  if (v === undefined || v === '') return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function isAtlasPvVisaoForm(formId: string): boolean {
  return formId === FORM_VISAO_PV
}

export function isAtlasPvVisaoMethod(formId: string, methodId: string): boolean {
  return formId === FORM_VISAO_PV && PV_METHODS.has(methodId)
}

export function runAtlasPvVisaoMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
  epicForms: FormDef[] = [],
): boolean {
  if (form.id !== FORM_VISAO_PV || !PV_METHODS.has(methodId)) {
    return false
  }

  if (methodId === 'atlas-meth-gerar-relatorio') {
    const cliente = getValue('atlas-pvvis-cliente') ?? 'Cliente'
    const stub = epicForms.find((f) => f.id === 'form-atlas-contrato')
    if (stub) {
      downloadAtlasCobrancaReportPdf(stub, (k) => {
        if (k.includes('atlas-cliente')) return cliente
        return getValue(k)
      }, epicForms)
    } else {
      window.alert(`Gerar relatório PDF — ${cliente}\n\n(Protótipo: use também «Cobrança — cliente e contratos».)`)
    }
    return true
  }

  const cliente = getValue('atlas-pvvis-cliente') ?? '—'
  const contrato = getValue('atlas-pvvis-contrato') ?? '—'
  const competencia = getValue('atlas-pvvis-competencia') ?? '—'
  const agora = new Date().toLocaleString('pt-BR')

  if (methodId === 'atlas-meth-pv-gerar-periodo') {
    const defasagem = readNum(getValue, 'atlas-simp-meses-defasagem', 3)
    window.alert(
      `Gerar PV do período — ATLAS (HCMX)\n\n` +
        `Cliente: ${cliente}\n` +
        `Contrato: ${contrato || 'todos'}\n` +
        `Competência cobrança: ${competencia || 'próxima janela'}\n` +
        `Defasagem: ${defasagem} meses (consumo → cobrança)\n` +
        `Horário: ${agora}\n\n` +
        'Ação (produção):\n' +
        '1. Importar medições HCMX do período de consumo\n' +
        '2. Agrupar por contrato (um PV por contrato)\n' +
        '3. Aplicar classe Sob Demanda / Mensal / Anual / Pro-Rata\n' +
        '4. Criar rascunhos de PV com competência de cobrança calculada',
    )
    return true
  }

  if (methodId === 'atlas-meth-pv-emitir-protheus') {
    window.alert(
      `Emitir no Protheus — ${cliente}\n\n` +
        'Envia PV(s) agrupados por contrato ao ERP Protheus MTI.\n' +
        'Itens sem contrato permanecem em «Controle — sem contrato» para envio manual.',
    )
    return true
  }

  if (methodId === 'atlas-meth-pv-reconciliar-hcmx') {
    window.alert(
      `Reconciliar HCMX — ${cliente}\n\n` +
        'Atualiza colunas de produtos MTI e valores totais a partir das medições homologadas.',
    )
    return true
  }

  if (methodId === 'atlas-meth-pv-automatizar') {
    window.alert(
      `Executar automações — ${agora}\n\n` +
        'Processa regras ativas para classes Mensal, Anual e Pro-Rata e envia ao Protheus quando configurado.',
    )
    return true
  }

  return false
}
