import type { FormDef } from '../types'

const ASSINATURA_METHOD_IDS = new Set([
  'atlas-meth-enviar-assinatura',
  'atlas-meth-solicitar-ajuste',
  'atlas-meth-reprovar',
  'atlas-meth-aprovar-assinar',
  'atlas-meth-consultar-catalogo',
])

const FORMS_COM_ASSINATURA = new Set([
  'form-atlas-proposta',
  'form-atlas-documentos-fase',
  'form-atlas-contrato-gestao',
  'form-atlas-ordem-servico',
  'form-atlas-termo-homologacao',
  'form-atlas-raer',
  'form-atlas-processo-contratual',
])

export function isAtlasContratoWorkflowForm(formId: string): boolean {
  return FORMS_COM_ASSINATURA.has(formId)
}

export function isAtlasContratoWorkflowMethod(formId: string, methodId: string): boolean {
  return FORMS_COM_ASSINATURA.has(formId) && ASSINATURA_METHOD_IDS.has(methodId)
}

function needsMotivo(methodId: string): boolean {
  return methodId === 'atlas-meth-solicitar-ajuste' || methodId === 'atlas-meth-reprovar'
}

/**
 * Protótipo: alertas para fluxo de assinatura e geração de OS ao aprovar contrato.
 */
export function runAtlasContratoWorkflowMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
): boolean {
  if (!isAtlasContratoWorkflowForm(form.id) || !ASSINATURA_METHOD_IDS.has(methodId)) {
    return false
  }

  if (methodId === 'atlas-meth-consultar-catalogo') {
    window.alert(
      'Consulta catálogo MTI (protótipo)\n\n' +
        '• Catálogo de serviços — Siag / Protheus\n' +
        '• Catálogo de licenças\n' +
        '• Produtos vigentes\n\n' +
        'Ao incluir no contrato, defina a classe: Sob Demanda, Mensal, Anual ou Pro-Rata.',
    )
    return true
  }

  if (needsMotivo(methodId)) {
    const motivo = window.prompt(
      methodId === 'atlas-meth-reprovar'
        ? 'Informe o motivo da reprovação (obrigatório):'
        : 'Informe o motivo do ajuste solicitado (obrigatório):',
    )
    if (!motivo?.trim()) {
      window.alert('Motivo obrigatório para esta ação.')
      return true
    }
    const acao = methodId === 'atlas-meth-reprovar' ? 'Reprovado' : 'Ajuste solicitado'
    window.alert(`Registrado: ${acao}\n\nMotivo: ${motivo.trim()}`)
    return true
  }

  if (methodId === 'atlas-meth-enviar-assinatura') {
    window.alert('Enviado para assinatura.\n\nPróximos signatários verão status «Enviado para assinatura» no tramite.')
    return true
  }

  if (methodId === 'atlas-meth-aprovar-assinar') {
    if (form.id === 'form-atlas-contrato-gestao') {
      const atual = getValue('atlas-ctg-os-numero')?.trim()
      if (!atual) {
        const os = `OS-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 8999))}`
        window.alert(
          `Contrato aprovado e assinado.\n\n` +
            `Número da ordem de serviço gerado automaticamente: ${os}\n\n` +
            `(Em produção: preencher campo «Número da ordem de serviço» e status da OS.)`,
        )
      } else {
        window.alert('Contrato já possui OS vinculada: ' + atual)
      }
    } else {
      window.alert('Aprovado e assinado nesta fase.')
    }
    return true
  }

  return false
}
