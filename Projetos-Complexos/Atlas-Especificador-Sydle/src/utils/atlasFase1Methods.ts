import type { FormDef } from '../types'

/**
 * Prototype actions for Atlas Fase 1 methods (Proposta → Documentos → Workflow
 * → Assinatura → Contrato). Each method simulates the effect via window.alert /
 * window.prompt without persisting state.
 */

const FORM_PROPOSTA = 'form-atlas-proposta'
const FORM_ORGANIZACAO = 'form-atlas-organizacao'
const FORM_WF_MODELO = 'form-atlas-workflow-modelo'
const FORM_WF_VERSAO = 'form-atlas-workflow-versao'
const FORM_WF_INSTANCIA = 'form-atlas-workflow-instancia'
const FORM_DOC_TEMPLATE = 'form-atlas-documento-template'
const FORM_DOC_GERADO = 'form-atlas-documento-gerado'
const FORM_CHECKLIST = 'form-atlas-checklist-contratual'
const FORM_CONTRATO_GESTAO = 'form-atlas-contrato-gestao'
const FORM_TRAMITE = 'form-atlas-tramite-assinatura'
const FORM_INTEGRACAO = 'form-atlas-integracao-evento'
const FORM_NOTIFICACAO = 'form-atlas-notificacao-processo'
const FORM_VISAO_FASE1 = 'form-atlas-visao-fase1-operacional'

type Getter = (k: string) => string | undefined

interface MethodHandler {
  forms: ReadonlySet<string>
  run: (form: FormDef, getValue: Getter) => boolean
}

function alert(message: string): true {
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(message)
  }
  return true
}

function prompt(message: string, fallback = ''): string {
  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    return window.prompt(message, fallback) ?? ''
  }
  return fallback
}

const INTEGRACAO_EXIGE_JUSTIFICATIVA = new Set([
  'Pendente',
  'Erro',
  'Não enviado',
  'Dispensado',
])

function integracaoExigeJustificativa(status: string): boolean {
  return INTEGRACAO_EXIGE_JUSTIFICATIVA.has(status.trim())
}

const HANDLERS: Record<string, MethodHandler> = {
  /* Organização ---------------------------------------------------- */
  'atlas-org-meth-validar-cnpj': {
    forms: new Set([FORM_ORGANIZACAO]),
    run: (_form, getValue) => {
      const tipo = getValue('atlas-org-tipo') ?? ''
      const required = ['Cliente', 'Parceiro', 'Órgão do Estado', 'Órgão externo']
      if (required.includes(tipo)) {
        const cnpj = prompt('Informe ou confirme o CNPJ da organização:', getValue('atlas-org-cnpj') ?? '')
        if (!cnpj.trim()) {
          return alert('CNPJ é obrigatório para o tipo "' + tipo + '".')
        }
      }
      return alert('CNPJ validado no protótipo. Status alterado para "Ativa".')
    },
  },
  'atlas-org-meth-inativar': {
    forms: new Set([FORM_ORGANIZACAO]),
    run: (_form, getValue) =>
      alert('Organização "' + (getValue('atlas-org-nome') ?? '—') + '" marcada como Inativa (protótipo).'),
  },

  /* Proposta — submissão / reabertura ----------------------------- */
  'atlas-prp-meth-submeter-workflow': {
    forms: new Set([FORM_PROPOSTA]),
    run: (_form, getValue) => {
      const modelo = getValue('atlas-prp-workflow-modelo') ?? ''
      const versao = getValue('atlas-prp-workflow-versao') ?? ''
      if (!modelo || !versao) {
        return alert('Modelo de workflow e versão são obrigatórios para submeter a proposta.')
      }
      const parceiros = (getValue('atlas-prp-parceiros-envolvidos') ?? '').trim()
      const msgParceiro = parceiros
        ? '\nTrâmites de parceiro serão gerados conforme escopo.'
        : '\nSem parceiro envolvido: revisão e assinatura do parceiro não serão exigidas.'
      return alert(
        'Proposta submetida ao workflow (protótipo).\n\n' +
          'Instância: WFI-2026-0001\n' +
          'Modelo: ' + modelo + ' · Versão: ' + versao + '\n' +
          'Status atualizado para "Em assinatura". Trâmites DIRC gerados.' +
          msgParceiro,
      )
    },
  },
  'atlas-prp-meth-reabrir-edicao': {
    forms: new Set([FORM_PROPOSTA]),
    run: () => {
      const motivo = prompt('Informe o motivo da reabertura da proposta:')
      if (!motivo.trim()) return alert('Motivo é obrigatório.')
      return alert(
        'Proposta reaberta para edição (protótipo).\n\n' +
          'Status: Em composição · Nova versão criada.\n\n' +
          'Motivo: ' + motivo,
      )
    },
  },

  /* Trâmite — assinatura ----------------------------------------- */
  'atlas-meth-aprovar-assinar': {
    forms: new Set([FORM_TRAMITE]),
    run: (_form, getValue) => {
      const bloqueia = getValue('atlas-tra-bloqueia-fluxo') === 'true'
      const status = getValue('atlas-tra-status-pendencia') ?? ''
      if (status === 'Assinada') return alert('Trâmite já assinado.')
      if (bloqueia) {
        return alert(
          'Assinatura registrada (protótipo).\n\n' +
            'Regra: a assinatura só avança quando todos os trâmites obrigatórios e bloqueantes estiverem concluídos. ' +
            'O workflow verifica pendências antes de avançar.',
        )
      }
      return alert('Assinatura registrada (protótipo).')
    },
  },

  /* Workflow — modelo / versão / instância ------------------------ */
  'atlas-wfm-meth-criar-versao': {
    forms: new Set([FORM_WF_MODELO]),
    run: (_form, getValue) => {
      const status = getValue('atlas-wfm-status') ?? ''
      if (status === 'Arquivado') return alert('Modelo arquivado não aceita novas versões.')
      const numero = prompt('Informe o número da nova versão (ex.: 1.1):', '1.1')
      if (!numero.trim()) return alert('Número de versão é obrigatório.')
      return alert('Versão ' + numero + ' criada como rascunho no modelo (protótipo).')
    },
  },
  'atlas-wfm-meth-ativar': {
    forms: new Set([FORM_WF_MODELO]),
    run: () =>
      alert('Modelo ativado (protótipo). Versão ativa definida e disponível para novas instâncias.'),
  },
  'atlas-wfv-meth-clonar': {
    forms: new Set([FORM_WF_VERSAO]),
    run: () => {
      const numero = prompt('Informe a nova versão (ex.: 1.1):', '1.1')
      if (!numero.trim()) return alert('Versão de destino é obrigatória.')
      return alert(
        'Etapas clonadas para a versão ' + numero + ' (protótipo). Nova versão marcada como Rascunho.',
      )
    },
  },
  'atlas-wfi-meth-avancar': {
    forms: new Set([FORM_WF_INSTANCIA]),
    run: () =>
      alert(
        'Etapa avançada (protótipo).\n\n' +
          'Regra: a assinatura só avança quando todos os trâmites obrigatórios e bloqueantes estiverem concluídos. ' +
          'O sistema verifica trâmites bloqueantes na etapa atual e segue para a próxima configurada.',
      ),
  },
  'atlas-wfi-meth-solicitar-ajuste': {
    forms: new Set([FORM_WF_INSTANCIA]),
    run: () => {
      const motivo = prompt('Descreva o ajuste solicitado:')
      if (!motivo.trim()) return alert('Comentário é obrigatório.')
      return alert(
        'Ajuste solicitado (protótipo).\n\n' +
          'Status: Aguardando ajuste · Retornado à etapa configurada.\n' +
          'Notificação enviada ao responsável.\n\n' +
          'Motivo: ' + motivo,
      )
    },
  },
  'atlas-wfi-meth-cancelar': {
    forms: new Set([FORM_WF_INSTANCIA]),
    run: () => {
      const motivo = prompt('Informe o motivo do cancelamento:')
      if (!motivo.trim()) return alert('Motivo é obrigatório.')
      return alert(
        'Instância cancelada (protótipo).\n\n' +
          'Status atualizado para "Cancelado" e evento de cancelamento registrado.\n\n' +
          'Motivo: ' + motivo,
      )
    },
  },

  /* Templates / documentos --------------------------------------- */
  'atlas-dtmp-meth-preview': {
    forms: new Set([FORM_DOC_TEMPLATE]),
    run: (_form, getValue) => {
      const html = getValue('atlas-dtmp-html') ?? ''
      if (!html.trim()) return alert('HTML conteúdo do template é obrigatório para o preview.')
      const semValor = html.match(/\{\{[^}]+\}\}/g) ?? []
      const alerta = semValor.length > 0
        ? '\n\nAtenção: placeholders sem valor no preset ativo: ' + semValor.slice(0, 5).join(', ') +
          (semValor.length > 5 ? ' …' : '')
        : ''
      return alert('Preview do template gerado (protótipo).' + alerta)
    },
  },
  'atlas-dtmp-meth-publicar': {
    forms: new Set([FORM_DOC_TEMPLATE]),
    run: (_form, getValue) => {
      const statusAtual = getValue('atlas-dtmp-status') ?? ''
      if (statusAtual === 'Publicado') {
        const novaVersao = prompt(
          'Template publicado não é editado diretamente. Informe o número da nova versão (ex.: 1.1):',
          '1.1',
        )
        if (!novaVersao.trim()) {
          return alert(
            'Alterações em template publicado exigem nova versão. Cancele ou informe o número da versão.',
          )
        }
        return alert(
          'Nova versão ' + novaVersao + ' criada em rascunho (protótipo).\n\n' +
            'Edite o rascunho e publique quando pronto. A versão publicada anterior permanece imutável.',
        )
      }
      for (const k of ['atlas-dtmp-nome', 'atlas-dtmp-tipo', 'atlas-dtmp-versao', 'atlas-dtmp-html']) {
        if (!(getValue(k) ?? '').trim()) {
          return alert('Campos obrigatórios para publicar: Nome, Tipo, Versão e HTML conteúdo.')
        }
      }
      return alert('Template publicado (protótipo) e disponível para uso nos fluxos.')
    },
  },
  'atlas-dger-meth-baixar': {
    forms: new Set([FORM_DOC_GERADO]),
    run: (_form, getValue) =>
      alert('Download iniciado (protótipo): ' + (getValue('atlas-dger-numero') ?? 'DOC-XXXX')),
  },
  'atlas-dger-meth-enviar-assinatura': {
    forms: new Set([FORM_DOC_GERADO]),
    run: (_form, getValue) => {
      const exige = getValue('atlas-dger-exige-assinatura') ?? ''
      if (exige !== 'true') return alert('Documento não exige assinatura.')
      const status = getValue('atlas-dger-status-assinatura') ?? ''
      if (status === 'Concluída') return alert('Assinatura já concluída para este documento.')
      return alert(
        'Documento enviado para assinatura (protótipo).\n\n' +
          'Status: Em assinatura · Trâmites criados e assinantes notificados.',
      )
    },
  },

  /* Checklist contratual ---------------------------------------- */
  'atlas-chk-meth-validar': {
    forms: new Set([FORM_CHECKLIST]),
    run: (_form, getValue) => {
      const cliente = getValue('atlas-chk-cliente-cadastrado') === 'true'
      const proposta = (getValue('atlas-chk-proposta') ?? '').trim()
      const processo = (getValue('atlas-chk-processo-contratual') ?? '').trim()
      const rascunho = (getValue('atlas-chk-contrato-rascunho') ?? '').trim()
      const processoVinc = getValue('atlas-chk-processo-vinculado-proposta') === 'true'
      const itens = getValue('atlas-chk-itens-revisados') === 'true'
      const extrato = (getValue('atlas-chk-extrato-publicacao') ?? '').trim()
      const data = (getValue('atlas-chk-data-publicacao') ?? '').trim()
      const protheus = (getValue('atlas-chk-protheus-status') ?? '').trim()
      const snow = (getValue('atlas-chk-servicenow-status') ?? '').trim()
      const justProtheus = (getValue('atlas-chk-protheus-justificativa') ?? '').trim()
      const justSnow = (getValue('atlas-chk-servicenow-justificativa') ?? '').trim()
      if (!cliente || !proposta || !processo || !rascunho || !processoVinc || !itens || !extrato || !data) {
        return alert(
          'Pendente: processo contratual, contrato rascunho, proposta vinculada, cliente cadastrado, itens revisados, extrato e data de publicação.',
        )
      }
      if (!protheus || !snow) {
        return alert(
          'Status de integração deve ser conhecido para Protheus e ServiceNow.',
        )
      }
      if (integracaoExigeJustificativa(protheus) && !justProtheus) {
        return alert('Informe a justificativa Protheus para o status "' + protheus + '".')
      }
      if (integracaoExigeJustificativa(snow) && !justSnow) {
        return alert('Informe a justificativa ServiceNow para o status "' + snow + '".')
      }
      return alert(
        'Checklist validado (protótipo).\n\n' +
          'atlas-chk-validado = true · integrações rastreáveis (conclusão não exigida). Cadastro final liberado.',
      )
    },
  },

  /* Contrato gestão --------------------------------------------- */
  'atlas-ctg-meth-abrir-rascunho': {
    forms: new Set([FORM_CONTRATO_GESTAO]),
    run: (_form, getValue) => {
      const cliente = (getValue('atlas-ctg-cliente-org') ?? '').trim()
      const proposta = (getValue('atlas-ctg-proposta-origem-ref') ?? '').trim()
      if (!cliente || !proposta) {
        return alert('Cliente e proposta origem são obrigatórios para abrir o contrato em rascunho.')
      }
      return alert(
        'Contrato aberto em rascunho (protótipo).\n\n' +
          'Status cadastro: Rascunho · vinculado ao processo contratual.\n' +
          'Próximo passo: Validar checklist contratual.',
      )
    },
  },
  'atlas-ctg-meth-finalizar-cadastro': {
    forms: new Set([FORM_CONTRATO_GESTAO]),
    run: (_form, getValue) => {
      const checklistOk = getValue('atlas-ctg-checklist-validado') === 'true'
      if (!checklistOk) {
        return alert(
          'Cadastro bloqueado: o checklist contratual deve estar validado antes de finalizar o cadastro.',
        )
      }
      const statusCadastro = getValue('atlas-ctg-status-cadastro') ?? ''
      if (statusCadastro === 'Rascunho' || !statusCadastro) {
        return alert(
          'Finalizar cadastro exige contrato previamente aberto em rascunho e checklist validado.',
        )
      }
      const cliente = (getValue('atlas-ctg-cliente-org') ?? '').trim()
      const extrato = (getValue('atlas-ctg-extrato-publicacao') ?? '').trim()
      const data = (getValue('atlas-ctg-data-publicacao') ?? '').trim()
      if (!cliente || !extrato || !data) {
        return alert(
          'Cliente, extrato de publicação e data de publicação são obrigatórios para finalizar o cadastro.',
        )
      }
      return alert(
        'Cadastro contratual finalizado (protótipo).\n\n' +
          'Checklist validado confirmado. Status: Ativo · eventos de integração rastreáveis.',
      )
    },
  },
  'atlas-ctg-meth-notificar-cliente': {
    forms: new Set([FORM_CONTRATO_GESTAO]),
    run: (_form, getValue) => {
      const emails = (getValue('atlas-org-contatos-notificacao') ?? '').trim()
      const email = (getValue('atlas-org-email') ?? '').trim()
      if (!emails && !email) {
        return alert('Cliente sem e-mail ou contatos de notificação cadastrados.')
      }
      return alert('Cliente notificado (protótipo). Marcador "Cliente notificado" atualizado.')
    },
  },

  /* Integração / Notificação / Visão ---------------------------- */
  'atlas-int-meth-reprocessar': {
    forms: new Set([FORM_INTEGRACAO]),
    run: (_form, getValue) => {
      const status = getValue('atlas-int-status') ?? ''
      if (status !== 'Erro' && status !== 'Pendente') {
        return alert('Reprocessamento disponível apenas para status "Erro" ou "Pendente".')
      }
      return alert('Reprocessamento simulado (protótipo). Status atualizado para "Simulado".')
    },
  },
  'atlas-not-meth-reenviar': {
    forms: new Set([FORM_NOTIFICACAO]),
    run: (_form, getValue) => {
      const dest = (getValue('atlas-not-destinatario') ?? '').trim()
      const email = (getValue('atlas-not-email') ?? '').trim()
      if (!dest && !email) return alert('Notificação sem destinatário ou e-mail.')
      return alert('Notificação reenviada (protótipo). Status atualizado para "Enviada".')
    },
  },
  'atlas-f1v-meth-atualizar': {
    forms: new Set([FORM_VISAO_FASE1]),
    run: () =>
      alert('Visão atualizada com dados demo (protótipo): propostas, assinaturas, contratos e integrações.'),
  },
}

/**
 * Manipula um método protótipo da Fase 1. Devolve true quando o clique é
 * tratado por algum handler registrado.
 */
export function runAtlasFase1Method(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
): boolean {
  const handler = HANDLERS[methodId]
  if (!handler) return false
  if (!handler.forms.has(form.id)) return false
  return handler.run(form, getValue)
}
