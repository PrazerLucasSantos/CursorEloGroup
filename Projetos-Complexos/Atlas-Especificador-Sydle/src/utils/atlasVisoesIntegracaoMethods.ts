import type { FormDef } from '../types'
import { runAtlasContratoWorkflowMethod } from './atlasContratoMethods'

export const FORM_VISAO_SN = 'form-atlas-visao-projetos-tarefas'
export const FORM_VISAO_WF = 'form-atlas-visao-workflow-assinaturas'
export const FORM_VISAO_HCMX = 'form-atlas-visao-ativos-consumo'

const SN_METHODS = new Set(['atlas-meth-sn-sincronizar', 'atlas-meth-sn-atualizar-abertas'])
const HCMX_METHODS = new Set(['atlas-meth-hcmx-importar', 'atlas-meth-hcmx-atualizar-consumo'])
const WF_VISAO_METHODS = new Set(['atlas-meth-wf-atualizar-status'])

function readBool(getValue: (k: string) => string | undefined, key: string): boolean {
  const v = getValue(key)
  return v === 'true' || v === '1' || v === 'sim'
}

export function isAtlasVisoesIntegracaoForm(formId: string): boolean {
  return formId === FORM_VISAO_SN || formId === FORM_VISAO_WF || formId === FORM_VISAO_HCMX
}

export function runAtlasVisoesIntegracaoMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
): boolean {
  if (form.id === FORM_VISAO_WF) {
    if (methodId === 'atlas-meth-wf-atualizar-status') {
      const processo = getValue('atlas-wf-visao-processo') ?? '—'
      const etapa = getValue('atlas-wf-visao-etapa-atual') ?? '—'
      window.alert(
        `Atualizar status do workflow (protótipo)\n\n` +
          `Processo: ${processo}\n` +
          `Etapa atual: ${etapa}\n\n` +
          'Ação (produção): recalcular KPIs e tramites a partir do motor de assinaturas (Fase 1 — recurso próprio).',
      )
      return true
    }
    if (runAtlasContratoWorkflowMethod(form, methodId, getValue)) {
      return true
    }
    return false
  }

  if (form.id === FORM_VISAO_SN && SN_METHODS.has(methodId)) {
    if (!readBool(getValue, 'atlas-sn-int-ativo')) {
      window.alert('Ative a integração ServiceNow na aba «Integração ServiceNow» antes de sincronizar.')
      return true
    }
    const cliente = getValue('atlas-sn-visao-cliente') ?? '—'
    const escopo = getValue('atlas-sn-visao-escopo') ?? '—'
    const contrato = getValue('atlas-sn-visao-contrato') ?? '—'
    const os = getValue('atlas-sn-visao-os') ?? '—'
    const agora = new Date().toLocaleString('pt-BR')

    if (methodId === 'atlas-meth-sn-sincronizar') {
      window.alert(
        `Sincronizar ServiceNow — ${cliente}\n\n` +
          `Escopo: ${escopo}\n` +
          `Contrato: ${contrato || '—'}\n` +
          `OS: ${os || '—'}\n` +
          `Horário: ${agora}\n\n` +
          'Ação (produção): GET projetos e tarefas abertas na API ServiceNow; preencher grades e atualizar «Última sincronização».',
      )
      return true
    }

    window.alert(
      `Atualizar tarefas abertas — ${cliente}\n\n` +
        `Reconcilia apenas INC/TASK em estado Aberto, Em andamento ou Aguardando cliente.\n` +
        `Horário: ${agora}`,
    )
    return true
  }

  if (form.id === FORM_VISAO_HCMX && HCMX_METHODS.has(methodId)) {
    if (!readBool(getValue, 'atlas-hcmx-int-ativo')) {
      window.alert('Ative a integração OpenText HCMX na aba correspondente antes de importar.')
      return true
    }
    const cliente = getValue('atlas-hcmx-visao-cliente') ?? '—'
    const competencia = getValue('atlas-hcmx-visao-competencia') ?? '—'
    const contrato = getValue('atlas-hcmx-visao-contrato') ?? '—'
    const agora = new Date().toLocaleString('pt-BR')

    if (methodId === 'atlas-meth-hcmx-importar') {
      window.alert(
        `Importar medições HCMX — ${cliente}\n\n` +
          `Competência: ${competencia}\n` +
          `Contrato: ${contrato}\n` +
          `Horário: ${agora}\n\n` +
          'Ação (produção): buscar medições HST/UST/VM/GB no OpenText HCMX; criar linhas de ativo consumido e status «Medição recebida».',
      )
      return true
    }

    window.alert(
      `Atualizar consumo do período — ${competencia}\n\n` +
        'Ação (produção): reconciliar totais com saldos em «Contrato — gestão» e preparar agrupamento PV por contrato.',
    )
    return true
  }

  return false
}
