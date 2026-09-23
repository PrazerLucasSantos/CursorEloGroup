import type { FormDef } from '../types'
import { runAtlasContratoWorkflowMethod } from './atlasContratoMethods'

const FORMS_PROPOSTA = new Set([
  'form-atlas-proposta',
  'form-atlas-visao-propostas',
  'form-atlas-visao-historico-versoes',
  'form-atlas-proposta-workflow-tipo',
])

const METODOS_PROPOSTA = new Set([
  'atlas-prp-meth-montar-catalogo',
  'atlas-prp-meth-gerar-documento',
  'atlas-prp-meth-enviar-cliente',
  'atlas-prp-meth-enviar-parceiro',
  'atlas-prp-meth-visualizar-versao',
  'atlas-prp-meth-comparar-versoes',
  'atlas-prp-meth-abrir-cadastro',
  'atlas-prp-meth-abrir-parceiro',
])

const STATUS_APROVADA_ENVIO = new Set([
  'Aprovada',
  'Enviada ao cliente',
  'Contrato recebido',
  'Contrato cadastrado',
])

export function isAtlasPropostaForm(formId: string): boolean {
  return FORMS_PROPOSTA.has(formId)
}

export function isAtlasPropostaMethod(formId: string, methodId: string): boolean {
  return FORMS_PROPOSTA.has(formId) && METODOS_PROPOSTA.has(methodId)
}

/**
 * Protótipo: montagem de proposta, envio, versionamento e documentos.
 */
export function runAtlasPropostaMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
): boolean {
  if (!FORMS_PROPOSTA.has(form.id) || !METODOS_PROPOSTA.has(methodId)) {
    return false
  }

  const numero =
    getValue('atlas-prp-numero')?.trim() ||
    getValue('atlas-hist-prp-numero')?.trim() ||
    'PROP-2025-0842'

  if (methodId === 'atlas-prp-meth-montar-catalogo') {
    window.alert(
      'Montar proposta a partir dos catálogos (protótipo)\n\n' +
        `Proposta: ${numero}\n\n` +
        '• Produto vigente · Licença · Serviço · Item manual\n\n' +
        'Os dados selecionados são copiados como snapshot para cada item (atlas-prpi-*), ' +
        'congelando códigos, métrica, recorrência, versão do catálogo e valores da época.',
    )
    return true
  }

  if (methodId === 'atlas-prp-meth-gerar-documento') {
    const templateStatus = getValue('atlas-dtmp-status') ?? ''
    if (templateStatus && templateStatus !== 'Publicado') {
      window.alert(
        'Geração bloqueada: o template deve estar com status "Publicado".\n\n' +
          'Template publicado não é editado diretamente — alterações geram nova versão.',
      )
      return true
    }
    const ver = getValue('atlas-prp-versao-atual') ?? '1'
    window.alert(
      `Documento gerado (protótipo)\n\n` +
        `${numero}-v${ver}.pdf\n\n` +
        'Vínculos: proposta, versão da proposta, template e versão do template (atlas-dger-*).\n' +
        'Exige template publicado.',
    )
    return true
  }

  if (methodId === 'atlas-prp-meth-enviar-cliente') {
    const status =
      getValue('atlas-prp-status-comercial') ??
      getValue('atlas-prp-status-fase1') ??
      getValue('atlas-prp-tag') ??
      ''
    if (status && !STATUS_APROVADA_ENVIO.has(status) && status !== 'Aprovado internamente') {
      window.alert(
        'Envio bloqueado: a proposta deve estar aprovada/assinada internamente antes do envio ao cliente.\n\n' +
          'Status atual: ' + status,
      )
      return true
    }
    window.alert(
      `Enviado ao cliente (protótipo)\n\n` +
        `Proposta ${numero}\n` +
        'Status comercial: Enviada ao cliente · Nova versão registrada na linha do tempo.',
    )
    return true
  }

  if (methodId === 'atlas-prp-meth-enviar-parceiro') {
    window.alert(
      `Enviado ao parceiro (protótipo)\n\n` +
        `Proposta ${numero}\n` +
        'Tag: Enviado ao parceiro · O parceiro pode complementar/validar e retornar com ajustes.',
    )
    return true
  }

  if (methodId === 'atlas-prp-meth-visualizar-versao' || methodId === 'atlas-prp-meth-abrir-parceiro') {
    const rotulo =
      methodId === 'atlas-prp-meth-abrir-parceiro'
        ? 'v2 — Parceiro retorno com ajustes'
        : 'Versão selecionada na grade'
    window.alert(
      `Visualizar versão (protótipo)\n\n` +
        `Proposta: ${numero}\n` +
        `${rotulo}\n\n` +
        'Exibe snapshot: itens, valores e PDF da revisão (v1 MTI enviada, v2 parceiro, v3 MTI reenvio).',
    )
    return true
  }

  if (methodId === 'atlas-prp-meth-comparar-versoes') {
    window.alert(
      `Comparar versões (protótipo)\n\n` +
        `Proposta: ${numero}\n\n` +
        'v1 MTI elaboração ↔ v2 Parceiro ajustes ↔ v3 MTI reenvio\n\n' +
        'Destaca diferenças em itens, valores e textos do documento.',
    )
    return true
  }

  if (methodId === 'atlas-prp-meth-abrir-cadastro') {
    window.alert(
      `Abrir cadastro (protótipo)\n\n` +
        'Navegue para a classe «Proposta — cadastro» no workspace Propostas comerciais.\n\n' +
        `Referência: ${numero}`,
    )
    return true
  }

  return false
}

/** Delega métodos de assinatura RAER no cadastro de proposta. */
export function runAtlasPropostaAssinaturaMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
): boolean {
  if (form.id !== 'form-atlas-proposta') return false
  return runAtlasContratoWorkflowMethod(form, methodId, getValue)
}
