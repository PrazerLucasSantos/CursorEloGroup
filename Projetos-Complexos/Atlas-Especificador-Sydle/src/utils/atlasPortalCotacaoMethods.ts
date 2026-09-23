import type { FormDef } from '../types'

const FORMS_PORTAL = new Set(['form-atlas-portal-login', 'form-atlas-portal-cotacao'])

const METODOS_PORTAL = new Set([
  'atlas-portal-meth-entrar',
  'atlas-portal-meth-adicionar-catalogo',
  'atlas-portal-meth-recalcular',
  'atlas-portal-meth-enviar-cotacao',
])

export function runAtlasPortalCotacaoMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
): boolean {
  if (!FORMS_PORTAL.has(form.id) || !METODOS_PORTAL.has(methodId)) {
    return false
  }

  if (methodId === 'atlas-portal-meth-entrar') {
    const email = getValue('atlas-portal-login-email')?.trim()
    if (!email) {
      window.alert('Informe o e-mail para entrar no portal.')
      return true
    }
    window.alert(
      `Login realizado (protótipo)\n\n` +
        `Usuário: ${email}\n` +
        `Perfil: ${getValue('atlas-portal-login-perfil') ?? 'Cliente'}\n\n` +
        'Na apresentação, o botão verde navega para a vitrine do portal.',
    )
    return true
  }

  if (methodId === 'atlas-portal-meth-adicionar-catalogo') {
    window.alert(
      'Adicionar itens dos catálogos (protótipo)\n\n' +
        '• Catálogo — produtos vigentes\n' +
        '• Catálogo de licenças comercial\n' +
        '• Catálogo de serviços comercial\n\n' +
        'Filtro pela solução selecionada. Linhas entram na grade «Itens da cotação».',
    )
    return true
  }

  if (methodId === 'atlas-portal-meth-recalcular') {
    window.alert(
      'Total recalculado (protótipo)\n\n' +
        'Soma das linhas: produtos + licenças + serviços.\n' +
        'Campo «Valor total da cotação» atualizado.',
    )
    return true
  }

  if (methodId === 'atlas-portal-meth-enviar-cotacao') {
    const orgao = getValue('atlas-portal-cli-orgao')?.trim()
    const sol = getValue('atlas-portal-cot-solucao')?.trim()
    if (!orgao || !sol) {
      window.alert('Preencha a solução/linha de cotação e o cliente/órgão antes de enviar.')
      return true
    }
    const numero = `COT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 8999))}`
    window.alert(
      `Cotação enviada (protótipo)\n\n` +
        `Número: ${numero}\n` +
        `Cliente: ${orgao}\n` +
        `Solução: ${sol}\n\n` +
        'Status: Enviada — encaminhada para análise MTI (vínculo opcional com proposta comercial).',
    )
    return true
  }

  return false
}
