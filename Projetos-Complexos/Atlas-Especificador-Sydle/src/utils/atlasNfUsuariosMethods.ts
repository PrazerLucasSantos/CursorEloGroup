import type { FormDef } from '../types'

export const FORM_VISAO_NF = 'form-atlas-visao-notas-fiscais'
export const FORM_VISAO_USUARIOS = 'form-atlas-visao-usuarios-cadastrados'

const NF_METHODS = new Set([
  'atlas-meth-nf-sync-protheus',
  'atlas-meth-nf-notificar-email',
  'atlas-meth-nf-registrar-comprovante',
])

const USU_METHODS = new Set(['atlas-meth-usu-atestar-selo', 'atlas-meth-usu-rejeitar-atestacao'])

export function runAtlasNfUsuariosMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
): boolean {
  if (form.id === FORM_VISAO_NF && NF_METHODS.has(methodId)) {
    const cliente = getValue('atlas-nfvis-cliente') ?? '—'
    const cnpj = getValue('atlas-nfvis-cnpj') ?? '—'
    const agora = new Date().toLocaleString('pt-BR')

    if (methodId === 'atlas-meth-nf-sync-protheus') {
      window.alert(
        `Sincronizar NF — Protheus\n\n` +
          `Cliente: ${cliente}\n` +
          `CNPJ destinatário: ${cnpj}\n` +
          `Horário: ${agora}\n\n` +
          'Ação (produção):\n' +
          '• Detectar NF emitidas a partir de pedidos de venda\n' +
          '• Vincular automaticamente ao CNPJ e ao cliente no portal\n' +
          '• Criar registro do DAR associado (pagamento estadual)',
      )
      return true
    }

    if (methodId === 'atlas-meth-nf-notificar-email') {
      window.alert(
        `Notificar clientes — e-mail\n\n` +
          `Template: fatura disponível em atlas.mti.mt.gov.br\n` +
          `Destinatário: ${cliente} (${cnpj})\n` +
          `Horário: ${agora}`,
      )
      return true
    }

    const comprovante = window.prompt(
      'Registrar comprovante de pagamento do DAR (nome do arquivo ou referência):',
    )
    if (comprovante === null) return true
    if (!comprovante.trim()) {
      window.alert('Informe o comprovante ou cancele.')
      return true
    }
    window.alert(
      `Comprovante registrado: ${comprovante.trim()}\n\n` +
        'Status da NF atualizado para «Pagamento informado pelo cliente».',
    )
    return true
  }

  if (form.id === FORM_VISAO_USUARIOS && USU_METHODS.has(methodId)) {
    if (methodId === 'atlas-meth-usu-rejeitar-atestacao') {
      const motivo = window.prompt('Motivo da rejeição da atestação (obrigatório):')
      if (!motivo?.trim()) {
        window.alert('Motivo obrigatório.')
        return true
      }
      window.alert(`Atestação rejeitada.\n\nMotivo: ${motivo.trim()}`)
      return true
    }

    window.alert(
      'Atestar com selo — gestor MTI\n\n' +
        'Selo aplicado: tributos e encargos MT e fora de MT atestados para emissão de NF.\n' +
        '(Protótipo: selecione o parceiro na grade e confirme no cadastro tributário.)',
    )
    return true
  }

  return false
}
