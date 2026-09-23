/**
 * Demanda F3 ao vivo no Workspace Atlas (listagem de objetos + canvas).
 * Mapeia o store compartilhado → presets com IDs reais dos campos demc/demanda.
 */
import type { FieldDemoValue, FormDef, FormExampleValuePreset, EmbeddedDemoRow, FormMethod } from '../types'
import {
  aplicarAcao,
  acoesDisponiveis,
  labelTimeline,
  CONTATO_NUMERO_LOGADO,
  USUARIO_LOGADO,
  SOLUCAO_A_QUALIFICAR,
  type AcaoDemanda,
  type Demanda,
  type DemandaRegistroTexto,
  type StatusDemanda,
} from '../portalCliente/portalClienteDemandaData'
import { loadDemandasShared, upsertDemandaShared } from '../shared/demandaSharedStore'
import { applyMethodValuesToDemandaStore } from './demandaMethodFieldSync'
import { canvasRuntimeFieldKey } from './canvasRuntimeValueKey'
import { getActiveExamplePreset, readPresetFieldValue } from './formExamplePresets'
import { demoValueAsSingleLineSummary } from './fieldDemoValue'

export const FORM_DEMANDA_COMPLETA_ID = 'form-patlasv4-proto-demanda-completa'
export const FORM_DEMANDA_PORTAL_CLIENTE_ID = 'form-patlasv4-proto-demanda-portal-cliente'
export const FORM_DEMANDA_PORTAL_PARCEIRO_ID = 'form-patlasv4-proto-demanda-portal-parceiro'

const LIVE_PREFIX = 'live-demanda-'

export function isLiveDemandaPresetId(presetId: string): boolean {
  return presetId.startsWith(LIVE_PREFIX)
}

export function demandaIdFromLivePresetId(presetId: string): string | null {
  if (!isLiveDemandaPresetId(presetId)) return null
  return presetId.slice(LIVE_PREFIX.length)
}

export function liveDemandaPresetId(demandaId: string): string {
  return `${LIVE_PREFIX}${demandaId}`
}

export function fieldPrefixForDemandaForm(
  formId: string,
): 'demc' | 'demcli' | 'dempar' | null {
  if (formId === FORM_DEMANDA_COMPLETA_ID) return 'demc'
  if (formId === FORM_DEMANDA_PORTAL_CLIENTE_ID) return 'demcli'
  if (formId === FORM_DEMANDA_PORTAL_PARCEIRO_ID) return 'dempar'
  return null
}

export function isDemandaLiveForm(formId: string): boolean {
  return fieldPrefixForDemandaForm(formId) != null
}

/** Perfil do canal: BO Atlas = MTI · portal cliente · portal parceiro. */
export function perfilForDemandaForm(formId: string): 'MTI' | 'Cliente' | 'Parceiro' {
  const p = fieldPrefixForDemandaForm(formId)
  if (p === 'demcli') return 'Cliente'
  if (p === 'dempar') return 'Parceiro'
  return 'MTI'
}

/** Ações tipicamente executadas no portal do cliente (não no BO MTI). */
const ACOES_PORTAL_CLIENTE = new Set<AcaoDemanda>([
  'aprovar_gestor',
  'devolver_gestor',
  'recusar_gestor',
  'assinar_atendimento',
  'aceitar_orcamento',
  'recusar_orcamento',
  'assinar_homologacao',
  'ajustar_enviar',
  'solicitar_proposta',
  'definir_pagamento',
  'restituir_n2',
])

/** Ações tipicamente do portal parceiro. */
const ACOES_PORTAL_PARCEIRO = new Set<AcaoDemanda>([
  'parceiro_iniciar',
  'parceiro_declarar',
])

/** Converte Demanda → patches de runtime do canvas (chaves completas). */
export function demandaToCanvasFieldPatches(
  d: Demanda,
  formId: string,
): Record<string, string> {
  const prefix = fieldPrefixForDemandaForm(formId)
  if (!prefix) return {}
  const fv = demandaToAtlasFieldValues(d, prefix)
  const out: Record<string, string> = {}
  for (const [fieldId, val] of Object.entries(fv)) {
    if (val === undefined || val === null) continue
    const key = canvasRuntimeFieldKey(formId, [], fieldId)
    if (Array.isArray(val)) out[key] = val.join('\n')
    else if (typeof val === 'boolean') out[key] = val ? 'true' : 'false'
    else out[key] = String(val)
  }
  return out
}

/** Resolve demanda live + executa método; devolve patches para o canvas. */
export function executeDemandaFormMethod(
  form: FormDef,
  methodId: string,
  methodValues: Record<string, string> = {},
  getValue?: (k: string) => string | undefined,
):
  | { ok: true; toast: string; fieldPatches: Record<string, string>; demanda: Demanda }
  | { ok: false; erro: string } {
  const demanda = resolveDemandaForFormMethods(form, getValue)
  if (!demanda || demanda.id === 'atlas-method-filter') {
    return {
      ok: false,
      erro: 'Selecione um preset ao vivo da Demanda (lista do store F3) antes de executar o método.',
    }
  }
  const r = runDemandaAtlasMethod(form, methodId, demanda, methodValues)
  if (!r.ok) return r
  return {
    ok: true,
    toast: r.toast,
    fieldPatches: demandaToCanvasFieldPatches(r.demanda, form.id),
    demanda: r.demanda,
  }
}

function f(prefix: 'demc' | 'demcli' | 'dempar', suffix: string): string {
  return `patlasv4proto-${prefix}-${suffix}`
}

export function proximoPassoDemanda(status: StatusDemanda): string {
  switch (status) {
    case 'Aguardando cadastro gestor/fiscal':
      return 'Cadastrar gestor/fiscal do cliente → então N2 (não vai direto à MTI · EXC-CARG)'
    case 'Aguardando gestor':
      return 'Gestor/Fiscal (N2) aprovar, devolver ou recusar'
    case 'Aguardando pré-análise MTI':
    case 'Aguardando análise':
      return 'MTI: iniciar análise ou qualificar (se ambíguo)'
    case 'Proposta parceiro · aguardando MTI':
      return 'MTI delibera (via contrato / orçamento / devolver / recusar)'
    case 'Aguardando parceiro':
      return 'Parceiro: menu propositivo (via contrato / orçamento / devolver / recusar) → Proposta parceiro · aguardando MTI'
    case 'Aguardando autorização patrocinador':
      return 'MTI: registrar autorização do patrocinador → assinaturas do atendimento'
    case 'Em análise':
      return 'MTI: via contrato | orçamento | sem cobertura | devolver | recusar'
    case 'Aguardando assinatura do atendimento':
      return 'Cliente: assinar ou devolver (MTI redetalha)'
    case 'Em orçamento':
      return 'MTI/parceiro elabora → cliente aceita/recusa proposta'
    case 'Aguardando assinatura OS (gerente operação)':
      return 'Gerente assina OS (E45) → conferir quantitativos'
    case 'Em atendimento · parceiro':
      return 'Parceiro declara atendida (+ anexos)'
    case 'Aguardando validação MTI':
      return 'MTI: validar OK | devolver ao parceiro | recusar'
    case 'Aguardando autorização':
      return 'MTI: conferir quantitativos → autorizar → SN (E21 ou pós-E45)'
    case 'Aprovada · em atendimento':
      return 'Execução (PAR ou MTI) · dilação · encerrar termo+RAER'
    case 'Em homologação':
    case 'Aguardando assinatura do termo':
      return 'Cliente: 3 assinaturas L3 · ajuste = regenerar termo + reassinar (L03) · recusa → demanda concluída / termo recusado (L02)'
    case 'Devolvida para correção':
      return 'Cliente ajusta e reenvia'
    case 'Sem cobertura · definir pagamento':
      return 'Indenização | nova contratação | desistir (PD25 · sem execução auto)'
    case 'Dilatação de prazo':
      return 'Autorização das partes · retomar execução'
    case 'Efetivado · entregue':
      return 'Concluída · se termo recusado: MTI regenera; escopo extra = nova demanda; PV = contrato+saldo (#03)'
    case 'Recusada':
    case 'Não autorizada':
      return 'Quem recusou pode restituir · ou REAP (nova demanda com os dados)'
    default:
      return 'Seguir mapa do fluxo F3 (Consumo · Suporte em backlog)'
  }
}

export function caminhosPossiveisDemanda(status: StatusDemanda): string {
  switch (status) {
    case 'Aguardando cadastro gestor/fiscal':
      return 'Registrar cadastro gestor/fiscal → N2 (EXC-CARG · N2 nunca é pulado)'
    case 'Aguardando gestor':
      return 'Aprovar · Devolver · Recusar (N2 gestor∥fiscal · join restritivo)'
    case 'Aguardando pré-análise MTI':
    case 'Aguardando análise':
      return 'Iniciar análise · Qualificar (cobertura/parceiro) · com parceiro → Aguardando parceiro'
    case 'Aguardando parceiro':
      return 'Parceiro: menu propositivo → Proposta parceiro · aguardando MTI'
    case 'Em análise':
      return 'Sem parceiro: Via contrato · Orçamento · Sem cobertura · Devolver · Recusar'
    case 'Proposta parceiro · aguardando MTI':
      return 'MTI delibera: Via contrato · Orçamento · Sem cobertura · Devolver · Recusar'
    case 'Aguardando autorização patrocinador':
      return 'Registrar autorização do patrocinador (pós-qualificação) → assinaturas atendimento'
    case 'Aguardando validação MTI':
      return 'Validar OK · Devolver ao parceiro · Recusar atendimento'
    case 'Aguardando autorização':
      return 'Conferir quantitativos · Devolver DEMANDA · Autorizar → SN'
    case 'Aprovada · em atendimento':
    case 'Em homologação':
      return 'MTI executar | Dilação | Encerrar termo (+RAER stub) | Ajuste L03 | Recusa termo L02'
    case 'Aguardando assinatura OS (gerente operação)':
      return 'Assinar OS (gerente de operação) → conferir → autorizar SN'
    case 'Recusada':
    case 'Não autorizada':
    case 'Efetivado · entregue':
      return 'REAP · regenerar termo (se L02) · ou escopo adicional'
    default:
      return 'Conforme status · ver ações MTI/Cliente/Parceiro'
  }
}

/** Valores do formulário Atlas a partir da Demanda do store. */
export function demandaToAtlasFieldValues(
  d: Demanda,
  prefix: 'demc' | 'demcli' | 'dempar',
): Partial<Record<string, FieldDemoValue>> {
  const historicoLinhas = d.historico.map(
    (h) => `${h.em ?? ''} · ${h.por ?? ''} · ${h.acao ?? ''}`.trim(),
  )
  const fv: Partial<Record<string, FieldDemoValue>> = {
    [f(prefix, 'numero')]: d.numero,
    [f(prefix, 'status')]: d.status,
    [f(prefix, 'origem')]: d.origem,
    [f(prefix, 'tipo')]: d.tipo,
    [f(prefix, 'cliente')]: d.clienteSolicitante,
    [f(prefix, 'contato')]: d.contatoCliente,
    [f(prefix, 'contato-cpf')]: d.contatoCpf ?? '',
    [f(prefix, 'contato-email')]: d.contatoEmail ?? '',
    [f(prefix, 'contato-sec')]: d.contatoSecundario ?? '',
    [f(prefix, 'contato-sec-cargo')]: d.contatoSecundarioCargo ?? '',
    [f(prefix, 'contato-sec-email')]: d.contatoSecundarioEmail ?? '',
    [f(prefix, 'contato-sec-numero')]: d.contatoSecundarioNumero ?? '',
    [f(prefix, 'contato-cargo')]: d.contatoCargo ?? '',
    [f(prefix, 'responsavel')]: d.responsavelOrg ?? '',
    [f(prefix, 'responsavel-cargo')]: d.responsavelOrgCargo ?? '',
    [f(prefix, 'responsavel-email')]: d.responsavelOrgEmail ?? '',
    [f(prefix, 'responsavel-numero')]: d.responsavelOrgNumero ?? '',
    [f(prefix, 'contato-numero')]:
      d.contatoNumero?.trim() ||
      (d.contatoCliente === USUARIO_LOGADO ? CONTATO_NUMERO_LOGADO : ''),
    [f(prefix, 'data-evento')]: d.dataEvento || d.criadoEm,
    [f(prefix, 'atualizado-em')]: d.atualizadoEm ?? '',
    [f(prefix, 'nome')]: d.nome ?? '',
    [f(prefix, 'categoria')]: d.categoria ?? '',
    [f(prefix, 'prioridade')]: d.prioridade ?? '',
    [f(prefix, 'departamento')]: d.departamento ?? '',
    [f(prefix, 'unidade-negocio')]: d.unidadeNegocio ?? '',
    [f(prefix, 'service-now')]: d.serviceNowStatus || 'Não enviado',
    [f(prefix, 'contrato-natureza')]: d.contratoNatureza ?? '',
    [f(prefix, 'contrato-numero')]: d.numeroContrato ?? '',
    [f(prefix, 'produto')]: d.produtoSolucao,
    [f(prefix, 'solucao-vigente')]:
      !d.produtoSolucao?.trim() || d.produtoSolucao === SOLUCAO_A_QUALIFICAR
        ? ''
        : d.produtoSolucao,
    [f(prefix, 'descricao')]: d.descricao,
    [f(prefix, 'observacoes')]: d.observacoes ?? '',
    [f(prefix, 'parceiro-notificado')]: d.parceiroNotificadoEm
      ? new Date(d.parceiroNotificadoEm).toLocaleString('pt-BR')
      : d.parceiroNotificado
        ? d.atualizadoEm || '—'
        : '',
    [f(prefix, 'parceria')]: d.parceiroNome ?? '',
    [f(prefix, 'qualificado')]: d.qualificadoEm
      ? new Date(d.qualificadoEm).toLocaleString('pt-BR')
      : d.qualificado
        ? d.atualizadoEm || '—'
        : '',
    [f(prefix, 'tipo-os')]: d.tipoOs ?? '',
    [f(prefix, 'patrocinio-autorizado')]: Boolean(d.patrocinioAutorizado),
    [f(prefix, 'historico-eventos')]: historicoLinhas,
    [f(prefix, 'tipo-analise')]: d.tipoAnalise ?? '',
    [f(prefix, 'modalidade-servico')]: d.modalidadeServico ?? '',
    [f(prefix, 'fabricante')]: d.fabricante ?? '',
    [f(prefix, 'saldo-contabilizar')]: d.saldoContabilizar ?? '',
    [f(prefix, 'deliberacao-mti')]:
      d.deliberacaoMti ??
      (d.caminhoComercial === 'via_contrato'
        ? 'Aprovado · via contrato'
        : d.caminhoComercial === 'orcamento'
          ? 'Aprovado · via orçamento'
          : d.caminhoComercial === 'sem_cobertura'
            ? 'Aprovado · sem cobertura'
            : ''),
    [f(prefix, 'homolog-status')]: d.homologacaoStatus ?? 'Não iniciado',
    [f(prefix, 'termo-homologacao')]:
      d.homologacaoStatus === 'Assinado' || d.homologacaoStatus === 'Aguardando assinatura'
        ? `Termo · ${d.numero}`
        : '',
    [f(prefix, 'orc-numero')]: d.orcamento?.numero ?? '',
    [f(prefix, 'orc-assinatura-cliente')]: Boolean(d.orcamentoAssinadoCliente),
    [f(prefix, 'via-valores')]: d.valoresContrato ?? '',
    [f(prefix, 'assina-gestor')]: Boolean(d.assinaturaGestor),
    [f(prefix, 'assina-fiscal')]: Boolean(d.assinaturaFiscal),
    [f(prefix, 'forma-pagamento')]: d.definirPagamento ?? '',
    [f(prefix, 'situacao-definir-pagar')]:
      d.definirPagamento && d.definirPagamento !== 'Ainda não definido' ? 'Definido' : 'Ainda não definido',
    [f(prefix, 'raer-status')]: d.raerStatus ?? 'Não iniciado',
    [f(prefix, 'raer-documento')]:
      d.raerStatus && d.raerStatus !== 'Não iniciado' ? `RAER · ${d.numero}` : '',
    [f(prefix, 'desc-atendimento-parceiro')]: d.descricaoAtendimento ?? '',
    [f(prefix, 'parceiro-iniciou')]: Boolean(d.parceiroIniciouAtendimento),
    [f(prefix, 'parceiro-declaracao')]: d.entregavel ?? '',
    [f(prefix, 'parceiro-comprovacoes')]: (d.anexosComprovacao ?? [])
      .map((a) => a.nome)
      .filter(Boolean)
      .join(', '),
    [f(prefix, 'parceiro-caminho')]:
      d.caminhoComercial === 'via_contrato'
        ? 'Via contrato'
        : d.caminhoComercial === 'orcamento'
          ? 'Orçamento'
          : d.caminhoComercial === 'sem_cobertura'
            ? 'Sem cobertura'
            : '',
    [f(prefix, 'catalogos')]: d.catalogos ?? '',
    [f(prefix, 'itens')]: d.itensCatalogo ?? '',
    [f(prefix, 'solucao-catalogo')]: d.produtoSolucao ?? '',
    [f(prefix, 'entregavel-desc')]: d.entregavel ?? '',
    [f(prefix, 'comp-anexos')]: (d.anexosComprovacao ?? d.anexos)
      .map((a) => a.nome)
      .filter(Boolean)
      .join(', '),
    [f(prefix, 'assina-solicitante')]: Boolean(d.assinaturaSolicitante),
    [f(prefix, 'motivo')]: d.motivoUltimaAcao ?? '',
    [f(prefix, 'motivo-rejeicao')]:
      d.status === 'Recusada' || d.status === 'Não autorizada' ? (d.motivoUltimaAcao ?? '') : '',
    [f(prefix, 'anexos')]: d.anexos.map((a) => a.nome).filter(Boolean).join(', '),
    [f(prefix, 'resp-gerente')]: d.gerenteParceria ?? '',
    [f(prefix, 'gerente-area')]: d.gerenteParceria ?? '',
    [f(prefix, 'resp-titular')]: d.responsavelTitular ?? '',
    [f(prefix, 'subst-1')]: d.substituto1 ?? '',
    [f(prefix, 'subst-2')]: d.substituto2 ?? '',
    [f(prefix, 'modalidade-parceiro')]: d.modalidadeParceria ?? '',
    [f(prefix, 'homolog-ajuste')]: Boolean(d.homologAjuste),
    [f(prefix, 'homolog-ajuste-por')]: d.homologAjustePor ?? '',
    [f(prefix, 'orc-assinatura-gerente-area')]: Boolean(d.orcamentoAssinadoGerenteArea),
  }

  return fv
}

/** Persiste edições do método na demanda sem avançar o fluxo. */
export function persistDemandaMethodEdits(
  demanda: Demanda,
  methodValues: Record<string, string>,
): Demanda {
  const next = applyMethodValuesToDemandaStore(demanda, methodValues)
  next.atualizadoEm = new Date().toISOString()
  upsertDemandaShared(next)
  return next
}

function slaEmbeddedRow(d: Demanda): EmbeddedDemoRow {
  return {
    'patlasv4proto-demc-sla-inicio': d.slaInicio ?? d.criadoEm,
    'patlasv4proto-demc-sla-exec-inicio': d.slaExecucaoInicio ?? '',
    'patlasv4proto-demc-sla-status': d.slaStatus ?? 'No prazo',
    'patlasv4proto-demc-estagio-timeline': labelTimeline(d.status),
    'patlasv4proto-demc-prazo-declarado': d.slaPrazoDeclarado ?? '',
    'patlasv4proto-demc-sla-fim': '',
    'patlasv4proto-demc-tempo-total-sla': '',
    'patlasv4proto-demc-sla-assinatura-orcamento': '',
  }
}

function contratoEmbeddedRow(d: Demanda): EmbeddedDemoRow | null {
  if (!d.numeroContrato && d.contratoNatureza === 'Sem contrato') return null
  if (!d.numeroContrato && !d.contratoNatureza) return null
  return {
    'patlasv4proto-demc-ctr-numero': d.numeroContrato ?? '',
    'patlasv4proto-demc-ctr-nome': d.numeroContrato ? `Contrato ${d.numeroContrato}` : '',
    'patlasv4proto-demc-ctr-natureza': d.contratoNatureza ?? 'Próprio',
    'patlasv4proto-demc-ctr-demanda': d.numero,
    'patlasv4proto-demc-ctr-status': 'Vigente',
    'patlasv4proto-demc-ctr-cat-versao': d.catalogos ?? d.orcamento?.itens[0]?.catalogoVersao ?? '',
  }
}

function osEmbeddedRow(d: Demanda): EmbeddedDemoRow | null {
  if (!d.osVinculada) return null
  return {
    'patlasv4proto-demc-os-numero': d.osVinculada,
    'patlasv4proto-demc-os-status': d.serviceNowStatus === 'Enviado' ? 'Execução autorizada' : 'Em elaboração',
    'patlasv4proto-demc-os-tipo': d.orcamento?.numero ? 'Via orçamento' : 'Via contrato',
    'patlasv4proto-demc-os-modelo': d.tipoOs ?? 'Dedicada',
    'patlasv4proto-demc-os-demanda': d.numero,
    'patlasv4proto-demc-os-contrato': d.numeroContrato ?? '',
    'patlasv4proto-demc-os-orcamento': d.orcamento?.numero ?? '',
    'patlasv4proto-demc-os-execucao-autorizada': Boolean(d.serviceNowStatus && d.serviceNowStatus !== 'Não enviado'),
  }
}

function registroTextoRows(list?: Demanda['casoNegocio']): EmbeddedDemoRow[] {
  return (list ?? []).map((r) => ({
    'patlasv4proto-demc-reg-autor': r.autor,
    'patlasv4proto-demc-reg-em': r.em,
    'patlasv4proto-demc-reg-conteudo': r.conteudo,
  }))
}

function legacyToRegistros(
  list?: DemandaRegistroTexto[],
  legacy?: string,
): DemandaRegistroTexto[] {
  if (list?.length) return list
  const t = legacy?.trim()
  if (!t) return []
  return [{ id: 'legacy', autor: '—', em: '—', conteudo: t }]
}

function deliberacaoLabel(d: Demanda): string {
  return (
    d.deliberacaoMti ??
    (d.caminhoComercial === 'via_contrato'
      ? 'Aprovado · via contrato'
      : d.caminhoComercial === 'orcamento'
        ? 'Aprovado · via orçamento'
        : d.caminhoComercial === 'sem_cobertura'
          ? 'Aprovado · sem cobertura'
          : '')
  )
}

function analiseEmbeddedRow(d: Demanda): EmbeddedDemoRow | null {
  const delib = deliberacaoLabel(d)
  const solucao =
    !d.produtoSolucao?.trim() || d.produtoSolucao === SOLUCAO_A_QUALIFICAR
      ? ''
      : d.produtoSolucao
  if (
    !d.tipoAnalise &&
    !d.catalogos &&
    !d.itensCatalogo &&
    !d.parceiroNome &&
    !solucao &&
    !delib &&
    !d.fabricante &&
    !d.modalidadeServico
  ) {
    return null
  }
  return {
    'patlasv4proto-demc-atda-tipo-analise': d.tipoAnalise ?? '',
    'patlasv4proto-demc-atda-modalidade-servico': d.modalidadeServico ?? '',
    'patlasv4proto-demc-atda-parceria': d.parceiroNome ?? '',
    'patlasv4proto-demc-atda-solucao': solucao,
    'patlasv4proto-demc-atda-fabricante': d.fabricante ?? '',
    'patlasv4proto-demc-atda-catalogos': d.catalogos ?? '',
    'patlasv4proto-demc-atda-itens': d.itensCatalogo ?? '',
    'patlasv4proto-demc-atda-deliberacao': delib,
    'patlasv4proto-demc-atda-motivo-devolucao': d.motivoUltimaAcao ?? '',
    'patlasv4proto-demc-atda-motivo-rejeicao': d.motivoUltimaAcao ?? '',
  }
}

function viaContratoEmbeddedRow(d: Demanda): EmbeddedDemoRow | null {
  const nec = legacyToRegistros(d.necDetalhada, d.necAtendimento)
  const desc = legacyToRegistros(d.descricaoAtendimentoMti, d.descricaoAtendimento)
  if (!d.valoresContrato && !d.saldoContabilizar && !nec.length && !desc.length) return null
  const row: EmbeddedDemoRow = {
    'patlasv4proto-demc-atdv-valores': d.valoresContrato ?? '',
    'patlasv4proto-demc-atdv-saldo': d.saldoContabilizar ?? '',
  }
  if (nec.length) {
    row['patlasv4proto-demc-atdv-nec'] = {
      embeddedDemoInstances: registroTextoRows(nec),
    }
  }
  if (desc.length) {
    row['patlasv4proto-demc-atdv-desc'] = {
      embeddedDemoInstances: registroTextoRows(desc),
    }
  }
  return row
}

function validacaoParceiroEmbeddedRow(d: Demanda): EmbeddedDemoRow | null {
  const aguardaValidacao =
    d.status === 'Aguardando validação MTI' ||
    Boolean(d.entregavel?.trim()) ||
    Boolean(d.anexosComprovacao?.length)
  if (!aguardaValidacao && !(d.homologacaoStatus && d.homologacaoStatus !== 'Não iniciado')) {
    return null
  }
  return {
    'patlasv4proto-demc-atdp-decisao':
      d.homologacaoStatus && d.homologacaoStatus !== 'Não iniciado'
        ? 'Validar → homologação'
        : '',
    'patlasv4proto-demc-atdp-motivo': d.motivoUltimaAcao ?? '',
  }
}

function demandaEmbeddedRows(
  d: Demanda,
  prefix: 'demc' | 'demcli' | 'dempar',
): Partial<Record<string, EmbeddedDemoRow[]>> | undefined {
  const emb: Partial<Record<string, EmbeddedDemoRow[]>> = {}
  emb[f(prefix, 'ref-sla')] = [slaEmbeddedRow(d)]
  const ctr = contratoEmbeddedRow(d)
  if (ctr) emb[f(prefix, 'ref-contrato')] = [ctr]
  const os = osEmbeddedRow(d)
  if (os) {
    emb[f(prefix, 'ref-oses')] = [os]
  }

  const analise = analiseEmbeddedRow(d)
  if (analise) emb[f(prefix, 'emb-analise')] = [analise]
  const via = viaContratoEmbeddedRow(d)
  if (via) emb[f(prefix, 'emb-via-contrato')] = [via]
  const val = validacaoParceiroEmbeddedRow(d)
  if (val) emb[f(prefix, 'emb-validacao-parceiro')] = [val]

  const blocos: [string, Demanda['casoNegocio']][] = [
    ['caso-negocio', d.casoNegocio],
    ['risco-desempenho', d.riscoDesempenho],
    ['risco-nao-desempenho', d.riscoNaoDesempenho],
    ['habilitadores', d.habilitadores],
    ['barreiras', d.barreiras],
    ['em-escopo', d.emEscopo],
    ['fora-escopo', d.foraEscopo],
    ['consideracoes', d.consideracoes],
    ['anotacoes', d.anotacoes],
  ]
  for (const [suf, list] of blocos) {
    const rows = registroTextoRows(list)
    if (rows.length) emb[f(prefix, suf)] = rows
  }
  return Object.keys(emb).length ? emb : undefined
}

export function demandaToAtlasPreset(
  d: Demanda,
  formId: string,
): FormExampleValuePreset | null {
  const prefix = fieldPrefixForDemandaForm(formId)
  if (!prefix) return null
  const embeddedRowsByFieldId = demandaEmbeddedRows(d, prefix)
  return {
    id: liveDemandaPresetId(d.id),
    name: `${d.numero} · ${d.status}`,
    iconColor: d.origem === 'Cliente' ? '#0f766e' : d.origem === 'Parceiro' ? '#0369a1' : '#0c4a6e',
    fieldValues: demandaToAtlasFieldValues(d, prefix),
    ...(embeddedRowsByFieldId ? { embeddedRowsByFieldId } : {}),
  }
}

export function livePresetsFromDemandas(
  demandas: Demanda[],
  formId: string,
): FormExampleValuePreset[] {
  if (!isDemandaLiveForm(formId)) return []
  return [...demandas]
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    .map((d) => demandaToAtlasPreset(d, formId))
    .filter((p): p is FormExampleValuePreset => p != null)
}

/** method-demc-* / method-demanda-* / demcli / dempar → ação do motor de demanda. */
export function methodIdToAcaoDemanda(methodId: string): AcaoDemanda | 'ver_andamento' | null {
  const id = methodId
    .replace(/^method-demc-/, '')
    .replace(/^method-demanda-/, '')
    .replace(/^method-demcli-/, '')
    .replace(/^method-dempar-/, '')
  const map: Record<string, AcaoDemanda | 'ver_andamento'> = {
    'ver-andamento': 'ver_andamento',
    'pre-analise': 'iniciar_analise',
    qualificar: 'qualificar',
    'iniciar-analise': 'iniciar_analise',
    'via-contrato': 'via_contrato',
    'assinar-atendimento': 'assinar_atendimento',
    orcamento: 'enviar_orcamento',
    'enviar-proposta-orcamento': 'enviar_proposta_orcamento',
    'assinar-orcamento': 'assinar_orcamento',
    'devolver-orcamento': 'devolver_orcamento_ajuste',
    'aceitar-orcamento': 'aceitar_orcamento',
    'recusar-orcamento': 'recusar_orcamento',
    'parceiro-iniciar': 'parceiro_iniciar',
    'parceiro-declarar': 'parceiro_declarar',
    'validar-parceiro': 'validar_parceiro',
    'autorizar-sn': 'autorizar_servicenow',
    'encerrar-termo': 'encerrar_termo_raer',
    'ajuste-termo': 'solicitar_ajuste_termo',
    devolver: 'devolver_correcao',
    recusar: 'recusar',
    autorizar: 'autorizar_servicenow',
    'sem-cobertura': 'sem_cobertura',
    'conferir-quantitativos': 'conferir_quantitativos',
    'devolver-quantitativos': 'devolver_quantitativos',
    'assinar-os': 'assinar_os_orcamento',
    dilacao: 'solicitar_dilacao',
    'aceitar-dilacao': 'aceitar_dilacao',
    'recusar-dilacao': 'recusar_dilacao',
    'mti-executar': 'mti_executar_declarar',
    'recusar-termo': 'recusar_termo',
    'regenerar-termo': 'regenerar_termo',
    'restituir-n2': 'restituir_n2',
    'cadastrar-cargos': 'cadastrar_cargos',
    reaproveitar: 'reaproveitar_como_nova',
    'reaproveitar-nova': 'reaproveitar_como_nova',
    'autorizacao-patrocinio': 'registrar_autorizacao_patrocinio',
    'definir-pagamento': 'definir_pagamento',
    'solicitar-proposta': 'solicitar_proposta',
    'aprovar-n2': 'aprovar_gestor',
    'devolver-n2': 'devolver_gestor',
    'recusar-n2': 'recusar_gestor',
    'assinar-homologacao': 'assinar_homologacao',
    'ajustar-enviar': 'ajustar_enviar',
  }
  return map[id] ?? null
}

/**
 * Resolve a demanda ao vivo (store) ou um esboço mínimo a partir do campo Status do canvas.
 * Usado para filtrar métodos da barra no especificador MTI.
 */
export function resolveDemandaForFormMethods(
  form: FormDef,
  getValue?: (k: string) => string | undefined,
): Demanda | null {
  const presetId = form.activeExamplePresetId
  if (presetId) {
    const liveId = demandaIdFromLivePresetId(presetId)
    if (liveId) {
      const found = loadDemandasShared().find((d) => d.id === liveId)
      if (found) return found
    }
  }

  const prefix = fieldPrefixForDemandaForm(form.id)
  if (!prefix) return null

  const preset = getActiveExamplePreset(form)
  const readField = (fieldId: string): string => {
    if (getValue) {
      const ov = getValue(canvasRuntimeFieldKey(form.id, [], fieldId))
      if (ov?.trim()) return ov.trim()
      // Alias histórico demanda-* ↔ demc-*
      if (fieldId.includes('-demc-')) {
        const alt = getValue(canvasRuntimeFieldKey(form.id, [], fieldId.replace('-demc-', '-demanda-')))
        if (alt?.trim()) return alt.trim()
      }
    }
    const fromPreset = readPresetFieldValue(preset, fieldId)
    if (fromPreset !== undefined) {
      const field = form.fields.find((x) => x.id === fieldId)
      if (field) return demoValueAsSingleLineSummary(field, fromPreset).trim()
      if (typeof fromPreset === 'string') return fromPreset.trim()
      if (typeof fromPreset === 'boolean') return fromPreset ? 'true' : 'false'
    }
    return ''
  }

  let statusRaw = ''
  for (const fieldId of [f(prefix, 'status'), 'patlasv4proto-demanda-status']) {
    statusRaw = readField(fieldId)
    if (statusRaw) break
  }
  if (!statusRaw) return null

  const qualRaw = readField(f(prefix, 'qualificado')).toLowerCase()
  const pnRaw = readField(f(prefix, 'parceiro-notificado')).toLowerCase()
  const homologRaw = readField(f(prefix, 'homolog-status'))
  // Presets antigos às vezes só têm boolean em demanda-qualificado
  const qualificado =
    qualRaw === 'true' ||
    qualRaw === 'sim' ||
    qualRaw === '1' ||
    readField('patlasv4proto-demanda-qualificado').toLowerCase() === 'true' ||
    readField('patlasv4proto-demanda-qualificado').toLowerCase() === 'sim'
  const parceiroNotificado =
    pnRaw === 'true' ||
    pnRaw === 'sim' ||
    pnRaw === '1' ||
    readField('patlasv4proto-demanda-parceiro-notificado').toLowerCase() === 'true' ||
    readField('patlasv4proto-demanda-parceiro-notificado').toLowerCase() === 'sim'

  const stub: Demanda = {
    id: 'atlas-method-filter',
    numero: '—',
    status: statusRaw as StatusDemanda,
    origem: 'Cliente',
    tipo: 'Consumo',
    produtoSolucao: '—',
    descricao: '',
    contatoCliente: '',
    clienteSolicitante: '',
    dataEvento: '',
    criadoEm: '',
    atualizadoEm: '',
    historico: [],
    anexos: [],
    parceiroNotificado,
    qualificado,
    termoRecusado: /recus/i.test(homologRaw),
    quantitativosConferidos: /true|sim|1|ok/i.test(readField(f(prefix, 'quantitativos-ok'))),
    patrocinioAutorizado: /true|sim|1/i.test(readField(f(prefix, 'patrocinio-autorizado'))),
    caminhoComercial: (() => {
      const c = readField(f(prefix, 'caminho-comercial'))
      if (c === 'via_contrato' || c === 'orcamento' || c === 'sem_cobertura') return c
      return undefined
    })(),
    serviceNowStatus: (() => {
      const sn = readField(f(prefix, 'sn-status')) || readField(f(prefix, 'servicenow-status'))
      if (!sn) return undefined
      return sn as Demanda['serviceNowStatus']
    })(),
    executorTipo: /mti/i.test(readField(f(prefix, 'executor'))) ? 'MTI' : undefined,
    contratoNatureza: (() => {
      const n = readField(f(prefix, 'contrato-natureza'))
      if (n === 'Próprio do cliente' || n === 'Patrocinado (gestão)' || n === 'Sem contrato') return n
      return undefined
    })(),
    tipoOs: (() => {
      const t = readField(f(prefix, 'tipo-os'))
      if (t === 'Global' || t === 'Dedicada') return t
      return undefined
    })(),
    orcamento: (() => {
      const st = readField(f(prefix, 'orc-status'))
      if (!st) return undefined
      return {
        numero: readField(f(prefix, 'orc-numero')) || 'ORC-STUB',
        status: st as NonNullable<Demanda['orcamento']>['status'],
        itens: [],
      }
    })(),
    orcamentoAssinadoVendas: /true|sim|1/i.test(readField(f(prefix, 'orc-assinatura-vendas'))),
    orcamentoAssinadoParceiro: /true|sim|1/i.test(readField(f(prefix, 'orc-assinatura-parceiro'))),
    dilacaoAckMti: /true|sim|1/i.test(readField(f(prefix, 'dilacao-ack-mti'))),
    dilacaoAckCliente: /true|sim|1/i.test(readField(f(prefix, 'dilacao-ack-cliente'))),
    dilacaoAckParceiro: /true|sim|1/i.test(readField(f(prefix, 'dilacao-ack-parceiro'))),
  }
  return stub
}

/**
 * No especificador: métodos conforme status + perfil do formulário (MTI/Cliente/Parceiro).
 * `ver-andamento` permanece sempre visível. Portais HTML usam DemandasPage; classes
 * demcli/dempar no Atlas também filtram pelo perfil correto se tiverem métodos.
 */
export function filterDemandaFormMethodsByStatus(
  form: FormDef,
  methods: FormMethod[] | undefined,
  getValue?: (k: string) => string | undefined,
): FormMethod[] {
  if (!isDemandaLiveForm(form.id)) return methods ?? []
  const list = methods ?? []
  const demanda = resolveDemandaForFormMethods(form, getValue)
  if (!demanda) {
    return list.filter((m) => methodIdToAcaoDemanda(m.id) === 'ver_andamento')
  }

  const perfilForm = perfilForDemandaForm(form.id)
  const permitidas = new Set(
    acoesDisponiveis(demanda, perfilForm, 'Gestor').map((a) => a.id),
  )
  // N2 fiscal: união das ações do fiscal para não esconder aprovar/devolver no BO demo
  if (perfilForm === 'Cliente') {
    for (const a of acoesDisponiveis(demanda, 'Cliente', 'Fiscal')) permitidas.add(a.id)
    for (const a of acoesDisponiveis(demanda, 'Cliente', 'Demandante')) permitidas.add(a.id)
  }

  return list.filter((m) => {
    const acao = methodIdToAcaoDemanda(m.id)
    if (acao === 'ver_andamento') return true
    if (!acao) return false
    // No BO MTI: não exibir ações exclusivas de portal (cliente/parceiro)
    if (perfilForm === 'MTI') {
      if (ACOES_PORTAL_CLIENTE.has(acao) || ACOES_PORTAL_PARCEIRO.has(acao)) return false
    }
    return permitidas.has(acao)
  })
}

/**
 * Executa método no store compartilhado (Atlas BO ↔ portal cliente ↔ portal parceiro).
 * Perfil segue o formulário; ações de portal forçam Cliente/Parceiro quando aplicável.
 */
export function runDemandaAtlasMethod(
  form: FormDef,
  methodId: string,
  demanda: Demanda,
  methodValues: Record<string, string> = {},
): { ok: true; toast: string; demanda: Demanda } | { ok: false; erro: string } {
  const acao = methodIdToAcaoDemanda(methodId)
  if (!acao) return { ok: false, erro: 'Método não mapeado para o fluxo Demanda F3.' }

  const base = applyMethodValuesToDemandaStore(demanda, methodValues)

  if (acao === 'ver_andamento') {
    upsertDemandaShared(base)
    return {
      ok: true,
      toast: `${base.numero}: ${labelTimeline(base.status)} · Próximo: ${proximoPassoDemanda(base.status)}`,
      demanda: base,
    }
  }

  let perfil: 'MTI' | 'Parceiro' | 'Cliente' = perfilForDemandaForm(form.id)
  if (ACOES_PORTAL_PARCEIRO.has(acao)) perfil = 'Parceiro'
  else if (ACOES_PORTAL_CLIENTE.has(acao)) perfil = 'Cliente'
  else if (perfilForDemandaForm(form.id) === 'Parceiro') perfil = 'Parceiro'
  else perfil = 'MTI'

  const cargoPadrao: 'Gestor' | 'Fiscal' | 'Demandante' = 'Gestor'
  const disponiveis = acoesDisponiveis(base, perfil, cargoPadrao).map((a) => a.id)
  if (!disponiveis.includes(acao)) {
    const hint = acoesDisponiveis(base, perfil, cargoPadrao)
      .map((a) => a.label)
      .join(' · ')
    return {
      ok: false,
      erro: `Ação indisponível em «${base.status}» (${perfil}).${hint ? ` Disponíveis: ${hint}` : ''}`,
    }
  }

  const g = (id: string) => methodValues[id]?.trim()
  let motivo =
    g('patlasv4proto-mdem-pre-motivo') ||
    g('patlasv4proto-mdem-aa-motivo') ||
    g('patlasv4proto-mdem-vp-motivo') ||
    g('patlasv4proto-mdem-dev-motivo') ||
    g('patlasv4proto-mdem-rec-motivo') ||
    g('patlasv4proto-mdem-at-motivo') ||
    g('patlasv4proto-mdem-aut-motivo') ||
    g('patlasv4proto-mdem-dil-motivo') ||
    base.motivoUltimaAcao

  if (
    !motivo &&
    (acao === 'devolver_correcao' ||
      acao === 'recusar' ||
      acao === 'solicitar_ajuste_termo' ||
      acao === 'recusar_termo' ||
      acao === 'devolver_quantitativos' ||
      acao === 'recusar_dilacao' ||
      acao === 'devolver_gestor' ||
      acao === 'recusar_gestor')
  ) {
    const m = window.prompt('Informe o motivo:')
    if (!m?.trim()) return { ok: false, erro: 'Motivo obrigatório.' }
    motivo = m.trim()
  }

  const tipoAnaliseRaw =
    g('patlasv4proto-mdem-ia-tipo') || g('patlasv4proto-mdem-ctr-tipo') || g('patlasv4proto-mdem-pi-tipo')
  const tipoAnalise =
    tipoAnaliseRaw === 'Licenciamento' || tipoAnaliseRaw === 'Serviço'
      ? tipoAnaliseRaw
      : (base.tipoAnalise ?? 'Licenciamento')

  const r = aplicarAcao(
    base,
    perfil,
    acao,
    {
      motivo,
      tipoAnalise,
      catalogos:
        g('patlasv4proto-mdem-qual-catalogo') ||
        g('patlasv4proto-mdem-ctr-catalogos') ||
        base.catalogos ||
        'Catálogo contrato',
      itensCatalogo: g('patlasv4proto-mdem-ctr-itens') || base.itensCatalogo || 'Itens do contrato',
      descricaoAtendimento:
        g('patlasv4proto-mdem-ctr-desc') || base.descricaoAtendimento || base.descricao,
      necAtendimento: g('patlasv4proto-mdem-ctr-nec') || base.necAtendimento || base.descricao,
      valoresContrato: g('patlasv4proto-mdem-ctr-valores') || base.valoresContrato || 'Conforme contrato',
      entregavel: g('patlasv4proto-mdem-pd-entregavel') || base.entregavel || 'Entregável do atendimento',
      anexosComprovacao: (() => {
        const raw = g('patlasv4proto-mdem-pd-anexos')
        if (!raw) return base.anexosComprovacao
        const nomes = raw
          .split(/[,;\n]+/)
          .map((s) => s.trim())
          .filter(Boolean)
        if (!nomes.length) return base.anexosComprovacao
        return nomes.map((nome, i) => ({
          id: `comp-atlas-${i}-${nome.slice(0, 24)}`,
          nome,
          tamanhoKb: 0,
        }))
      })(),
      parceiroNome: g('patlasv4proto-mdem-qual-parceiro') || base.parceiroNome || undefined,
      produtoSolucao:
        g('patlasv4proto-mdem-qual-produto') ||
        (base.produtoSolucao === 'Outros' ? 'MTI CLOUD — Serviços em nuvem' : base.produtoSolucao),
      numeroContrato: g('patlasv4proto-mdem-qual-contrato') || base.numeroContrato,
      contratoNatureza: (() => {
        const n = g('patlasv4proto-mdem-qual-natureza') || base.contratoNatureza
        if (n === 'Próprio do cliente' || n === 'Patrocinado (gestão)' || n === 'Sem contrato') return n
        return base.contratoNatureza
      })(),
      tipoOs: (() => {
        const t = g('patlasv4proto-mdem-ctr-tipo-os') || base.tipoOs
        if (t === 'Global' || t === 'Dedicada') return t
        return base.tipoOs ?? 'Dedicada'
      })(),
      osVinculada:
        g('patlasv4proto-mdem-ctr-os') ||
        g('patlasv4proto-mdem-sn-os') ||
        g('patlasv4proto-mdem-aut-os') ||
        base.osVinculada ||
        `OS-${base.numero}`,
      osAcao:
        (g('patlasv4proto-mdem-aa-os-acao') as
          | 'Vincular OS existente'
          | 'Criar nova OS'
          | 'Autorizar consumo em OS existente') || 'Criar nova OS',
      decisaoAssinatura: /devolver/i.test(g('patlasv4proto-mdem-aa-decisao') || '')
        ? 'Devolver para correção'
        : 'Assinar',
      assinarPapel: (g('patlasv4proto-mdem-aa-papel') as 'Gestor' | 'Fiscal' | 'Solicitante') || 'Gestor',
      assinarTermoPapel:
        (g('patlasv4proto-mdem-th-papel') as 'Gestor' | 'Fiscal' | 'Solicitante') || 'Gestor',
      decisaoTermo: /recus/i.test(g('patlasv4proto-mdem-th-decisao') || '') ? 'Recusar' : 'Assinar',
      dilacaoPrazo: g('patlasv4proto-mdem-dil-prazo') || base.dilacaoNovoPrazo,
      saudeAckOs: true,
      definirPagamento: (() => {
        const p = g('patlasv4proto-mdem-orc-definir-pagamento')
        if (p === 'Indenização' || p === 'Nova contratação' || p === 'Desistiu') return p
        return undefined
      })(),
      orcamentoItens: base.orcamento?.itens?.length
        ? base.orcamento.itens
        : [
            {
              id: 'oi-atlas-1',
              descricao: 'Item orçamento (Atlas BO)',
              quantidade: 1,
              valorUnitario: 1000,
              catalogoVersao: 'v1.0',
            },
          ],
      orcamentoValidade: base.orcamento?.validade,
      orcamentoObs: base.orcamento?.observacoes,
      metricaContrato:
        base.metricaContrato ?? (tipoAnalise === 'Licenciamento' ? 'Licenciamento' : 'Serviço'),
      catalogoVersaoVigente: base.catalogoVersaoVigente,
    },
    cargoPadrao,
    loadDemandasShared(),
  )

  if (!r.ok) return r

  upsertDemandaShared(r.demanda)
  if (r.novaDemanda) upsertDemandaShared(r.novaDemanda)
  return { ok: true, toast: r.toast, demanda: r.demanda }
}
