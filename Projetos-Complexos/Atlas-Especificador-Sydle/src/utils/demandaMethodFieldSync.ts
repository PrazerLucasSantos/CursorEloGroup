/**
 * Espelha campos dos formulários de método (mdem-*) nos campos da Demanda · Completa (demc-*).
 * Usado em tempo real (a cada alteração) e no confirm do método.
 */
import type { Demanda } from '../portalCliente/portalClienteDemandaData'
import { canvasRuntimeFieldKey, type CanvasEmbAncestor } from './canvasRuntimeValueKey'

const FORM_DEMANDA_COMPLETA_ID = 'form-patlasv4-proto-demanda-completa'
const FORM_DEMANDA_PORTAL_CLIENTE_ID = 'form-patlasv4-proto-demanda-portal-cliente'
const FORM_DEMANDA_PORTAL_PARCEIRO_ID = 'form-patlasv4-proto-demanda-portal-parceiro'

function fieldPrefixForDemandaForm(formId: string): 'demc' | 'demcli' | 'dempar' | null {
  if (formId === FORM_DEMANDA_COMPLETA_ID) return 'demc'
  if (formId === FORM_DEMANDA_PORTAL_CLIENTE_ID) return 'demcli'
  if (formId === FORM_DEMANDA_PORTAL_PARCEIRO_ID) return 'dempar'
  return null
}

const M = 'patlasv4proto-mdem-'

/** Mapeamento direto: id do campo do método → sufixo do campo na Demanda Completa. */
export const DEMANDA_METHOD_DIRECT_MAP: Record<string, string> = {
  [`${M}and-status`]: 'status',
  // and-timeline / and-etapa / and-sla → classe embutida SLA (ver applyOneMethodFieldToParentRuntime)

  [`${M}pre-decisao`]: 'deliberacao-mti',
  [`${M}pre-motivo`]: 'motivo',

  [`${M}qual-produto`]: 'solucao-vigente',
  [`${M}qual-catalogo`]: 'catalogos',
  [`${M}qual-parceiro`]: 'parceria',
  [`${M}qual-contrato`]: 'contrato',
  [`${M}qual-natureza`]: 'contrato-natureza',
  [`${M}qual-modalidade`]: 'modalidade-parceiro',
  [`${M}qual-obs`]: 'observacoes',

  [`${M}ini-obs`]: 'observacoes',
  [`${M}ia-tipo`]: 'tipo-analise',

  [`${M}ctr-tipo`]: 'tipo-analise',
  [`${M}ctr-catalogos`]: 'catalogos',
  [`${M}ctr-itens`]: 'itens',
  [`${M}ctr-nec`]: 'nec',
  [`${M}ctr-valores`]: 'via-valores',
  [`${M}ctr-desc`]: 'desc-atendimento',
  [`${M}ctr-sla`]: 'prazo-execucao',
  [`${M}ctr-anexos`]: 'anexos',

  [`${M}aa-motivo`]: 'motivo',

  [`${M}orc-definir-pagamento`]: 'forma-pagamento',
  [`${M}orc-obs`]: 'observacoes',

  [`${M}pi-tipo`]: 'parceiro-tipo-atendimento',
  [`${M}pi-obs`]: 'parceiro-proposta-obs',

  [`${M}pd-entregavel`]: 'parceiro-declaracao',
  [`${M}pd-anexos`]: 'parceiro-comprovacoes',

  [`${M}vp-entregavel`]: 'parceiro-declaracao',
  [`${M}vp-anexos`]: 'parceiro-comprovacoes',
  [`${M}vp-decisao`]: 'validacao-parceiro',
  [`${M}vp-motivo`]: 'motivo',

  [`${M}et-itens`]: 'itens-os-termo',
  [`${M}et-artefatos`]: 'artefatos-entrega',
  [`${M}et-executado`]: 'ateste-execucao',
  [`${M}et-consumo`]: 'consumo-realizado',

  [`${M}at-por`]: 'homolog-ajuste-por',
  [`${M}at-motivo`]: 'motivo',

  [`${M}dev-motivo`]: 'motivo',
  [`${M}dev-anexo`]: 'anexos',

  [`${M}rec-motivo`]: 'motivo-rejeicao',
  [`${M}rec-anexo`]: 'anexos',

  [`${M}aut-motivo`]: 'motivo',
}

const OS_NUMERO_METHOD_FIELDS = new Set([
  `${M}ctr-os`,
  `${M}sn-os`,
  `${M}aut-os`,
  `${M}aa-os-acao`,
])

function demcFieldId(prefix: string, suffix: string): string {
  return `patlasv4proto-${prefix}-${suffix}`
}

function parentKey(formId: string, suffix: string, prefix: string): string {
  return canvasRuntimeFieldKey(formId, [], demcFieldId(prefix, suffix))
}

function osAncestor(prefix: string, which: 'ref-oses' = 'ref-oses'): CanvasEmbAncestor[] {
  return [{ embeddedFieldId: demcFieldId(prefix, which), instanceIndex: 0 }]
}

function ctrAncestor(prefix: string): CanvasEmbAncestor[] {
  return [{ embeddedFieldId: demcFieldId(prefix, 'ref-contrato'), instanceIndex: 0 }]
}

function slaAncestor(prefix: string): CanvasEmbAncestor[] {
  return [{ embeddedFieldId: demcFieldId(prefix, 'ref-sla'), instanceIndex: 0 }]
}

function analiseAncestor(prefix: string): CanvasEmbAncestor[] {
  return [{ embeddedFieldId: demcFieldId(prefix, 'emb-analise'), instanceIndex: 0 }]
}

function viaContratoAncestor(prefix: string): CanvasEmbAncestor[] {
  return [{ embeddedFieldId: demcFieldId(prefix, 'emb-via-contrato'), instanceIndex: 0 }]
}

function validacaoParceiroAncestor(prefix: string): CanvasEmbAncestor[] {
  return [{ embeddedFieldId: demcFieldId(prefix, 'emb-validacao-parceiro'), instanceIndex: 0 }]
}

const ATDA = 'patlasv4proto-demc-atda-'
const ATDV = 'patlasv4proto-demc-atdv-'
const ATDP = 'patlasv4proto-demc-atdp-'

/** Campos da classe Análise → grava no emb-analise. */
const ATDA_FIELD_IDS = new Set([
  `${ATDA}tipo-analise`,
  `${ATDA}modalidade-servico`,
  `${ATDA}parceria`,
  `${ATDA}solucao`,
  `${ATDA}fabricante`,
  `${ATDA}catalogos`,
  `${ATDA}itens`,
  `${ATDA}entregavel-forma`,
  `${ATDA}prazo-execucao`,
  `${ATDA}deliberacao`,
  `${ATDA}motivo-devolucao`,
  `${ATDA}motivo-rejeicao`,
])

/** Campos da classe Via contrato → grava no emb-via-contrato. */
const ATDV_FLAT_IDS = new Set([`${ATDV}valores`, `${ATDV}saldo`])

/** Campos da classe Validação parceiro → grava no emb-validacao-parceiro. */
const ATDP_FIELD_IDS = new Set([`${ATDP}decisao`, `${ATDP}motivo`])

function isTruthyBool(raw: string): boolean {
  const l = raw.trim().toLowerCase()
  return l === 'sim' || l === 'true' || l === '1'
}

function boolLabel(v: boolean): string {
  return v ? 'Sim' : 'Não'
}

/**
 * Extrai id do campo a partir da chave de runtime do método
 * (`formId::::fieldId` ou com cadeia).
 */
export function methodRuntimeKeyToFieldId(runtimeKey: string): string | null {
  const last = runtimeKey.lastIndexOf('::')
  if (last < 0) return null
  return runtimeKey.slice(last + 2)
}

/** Converte mapa de runtime do overlay → { fieldId: value }. */
export function methodRuntimeMapToFieldValues(
  runtimeMap: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(runtimeMap)) {
    const id = methodRuntimeKeyToFieldId(k)
    if (id) out[id] = v
  }
  return out
}

export function isDemandaClassForm(formId: string): boolean {
  return fieldPrefixForDemandaForm(formId) != null
}
export function applyOneMethodFieldToParentRuntime(
  methodFieldId: string,
  value: string,
  allMethodValues: Record<string, string>,
  parentFormId: string,
  setParentValue: (key: string, value: string) => void,
): void {
  const prefix = fieldPrefixForDemandaForm(parentFormId)
  if (!prefix) return

  const direct = DEMANDA_METHOD_DIRECT_MAP[methodFieldId]
  if (direct) {
    setParentValue(parentKey(parentFormId, direct, prefix), value)
  }

  // Classes satélite Atendimento MTI (método = formulário da classe)
  if (ATDA_FIELD_IDS.has(methodFieldId)) {
    setParentValue(
      canvasRuntimeFieldKey(parentFormId, analiseAncestor(prefix), methodFieldId),
      value,
    )
  }
  if (ATDV_FLAT_IDS.has(methodFieldId)) {
    setParentValue(
      canvasRuntimeFieldKey(parentFormId, viaContratoAncestor(prefix), methodFieldId),
      value,
    )
  }
  if (ATDP_FIELD_IDS.has(methodFieldId)) {
    setParentValue(
      canvasRuntimeFieldKey(parentFormId, validacaoParceiroAncestor(prefix), methodFieldId),
      value,
    )
  }

  // Andamento · SLA embutido
  if (methodFieldId === `${M}and-timeline` || methodFieldId === `${M}and-etapa`) {
    setParentValue(
      canvasRuntimeFieldKey(
        parentFormId,
        slaAncestor(prefix),
        'patlasv4proto-demc-estagio-timeline',
      ),
      value,
    )
  }
  if (methodFieldId === `${M}and-sla`) {
    setParentValue(
      canvasRuntimeFieldKey(parentFormId, slaAncestor(prefix), 'patlasv4proto-demc-sla-status'),
      value,
    )
  }

  // Motivo: se decisão indica rejeição, espelha também em motivo-rejeicao
  if (
    methodFieldId === `${M}pre-motivo` ||
    methodFieldId === `${M}vp-motivo` ||
    methodFieldId === `${M}rec-motivo`
  ) {
    const decisao =
      allMethodValues[`${M}pre-decisao`] ||
      allMethodValues[`${M}vp-decisao`] ||
      allMethodValues[`${M}aut-decisao`] ||
      ''
    if (/recus/i.test(decisao) || methodFieldId === `${M}rec-motivo`) {
      setParentValue(parentKey(parentFormId, 'motivo-rejeicao', prefix), value)
    }
  }

  // Há contrato? → natureza
  if (methodFieldId === `${M}orc-tem-contrato`) {
    setParentValue(
      parentKey(parentFormId, 'contrato-natureza', prefix),
      isTruthyBool(value) ? 'Próprio do cliente' : 'Sem contrato',
    )
  }

  // Assinatura por papel
  if (methodFieldId === `${M}aa-papel` || methodFieldId === `${M}aa-decisao`) {
    const papel = allMethodValues[`${M}aa-papel`] ?? ''
    const decisao = allMethodValues[`${M}aa-decisao`] ?? ''
    const assinar = /assinar/i.test(decisao)
    const flag =
      papel === 'Fiscal'
        ? 'assina-fiscal'
        : papel === 'Solicitante'
          ? 'assina-solicitante'
          : 'assina-gestor'
    if (assinar) {
      setParentValue(parentKey(parentFormId, flag, prefix), boolLabel(true))
    }
  }

  // RAER / termo
  if (methodFieldId === `${M}et-raer`) {
    setParentValue(
      parentKey(parentFormId, 'raer-status', prefix),
      isTruthyBool(value) ? 'Em elaboração' : 'Não iniciado',
    )
  }
  if (methodFieldId === `${M}et-enviar`) {
    if (isTruthyBool(value)) {
      setParentValue(parentKey(parentFormId, 'homolog-status', prefix), 'Aguardando assinatura')
      setParentValue(parentKey(parentFormId, 'termo-homologacao', prefix), 'Termo enviado')
    }
  }
  if (methodFieldId === `${M}at-por` || methodFieldId === `${M}at-motivo`) {
    setParentValue(parentKey(parentFormId, 'homolog-ajuste', prefix), boolLabel(true))
  }

  // Observação do início/efetivação pelo parceiro
  if (methodFieldId === `${M}pi-obs`) {
    setParentValue(parentKey(parentFormId, 'parceiro-proposta-obs', prefix), value)
  }
  if (methodFieldId === `${M}pi-tipo`) {
    setParentValue(parentKey(parentFormId, 'parceiro-tipo-atendimento', prefix), value)
  }
  // Confirmar início (parceiro)
  if (
    (methodFieldId === `${M}pi-confirmar` || methodFieldId === `${M}pi-iniciar`) &&
    isTruthyBool(value)
  ) {
    setParentValue(parentKey(parentFormId, 'parceiro-iniciou', prefix), boolLabel(true))
    setParentValue(
      parentKey(parentFormId, 'parceiro-iniciou-em', prefix),
      new Date().toISOString(),
    )
  }
  // Declarar atendida
  if (
    (methodFieldId === `${M}pd-declarar` || methodFieldId === `${M}pd-confirmar`) &&
    isTruthyBool(value)
  ) {
    setParentValue(parentKey(parentFormId, 'parceiro-declarada', prefix), boolLabel(true))
    setParentValue(
      parentKey(parentFormId, 'parceiro-declarada-em', prefix),
      new Date().toISOString(),
    )
  }

  // OS número → classe embutida OS
  if (OS_NUMERO_METHOD_FIELDS.has(methodFieldId) && value.trim()) {
    const osNum =
      methodFieldId === `${M}aa-os-acao` && !/^OS-/i.test(value) ? '' : value.trim()
    if (osNum && !/vincular|criar|autorizar/i.test(osNum)) {
      setParentValue(
        canvasRuntimeFieldKey(parentFormId, osAncestor(prefix, 'ref-oses'), 'patlasv4proto-demc-os-numero'),
        osNum,
      )
    }
  }

  // Autorizar SN → flag na OS
  if (methodFieldId === `${M}sn-confirmar` && isTruthyBool(value)) {
    setParentValue(
      canvasRuntimeFieldKey(
        parentFormId,
        osAncestor(prefix, 'ref-oses'),
        'patlasv4proto-demc-os-execucao-autorizada',
      ),
      boolLabel(true),
    )
    setParentValue(
      canvasRuntimeFieldKey(parentFormId, osAncestor(prefix, 'ref-oses'), 'patlasv4proto-demc-os-sn-status'),
      'Enviado',
    )
  }

  // Catálogo / natureza no contrato embutido (quando método mexe em solução/natureza)
  if (methodFieldId === `${M}qual-catalogo` || methodFieldId === `${M}ctr-catalogos`) {
    setParentValue(
      canvasRuntimeFieldKey(parentFormId, ctrAncestor(prefix), 'patlasv4proto-demc-ctr-cat-versao'),
      value,
    )
  }
  if (methodFieldId === `${M}orc-tem-contrato`) {
    setParentValue(
      canvasRuntimeFieldKey(parentFormId, ctrAncestor(prefix), 'patlasv4proto-demc-ctr-natureza'),
      isTruthyBool(value) ? 'Próprio' : 'Sem contrato',
    )
  }
}

/** Aplica todos os valores do método no runtime da classe. */
export function applyAllMethodValuesToParentRuntime(
  methodValues: Record<string, string>,
  parentFormId: string,
  setParentValue: (key: string, value: string) => void,
): void {
  for (const [fieldId, value] of Object.entries(methodValues)) {
    applyOneMethodFieldToParentRuntime(fieldId, value, methodValues, parentFormId, setParentValue)
  }
}

/**
 * Atualiza o objeto Demanda do store com os valores do método (persistência ao vivo).
 */
export function applyMethodValuesToDemandaStore(
  d: Demanda,
  methodValues: Record<string, string>,
): Demanda {
  const g = (id: string) => methodValues[id]
  const next: Demanda = { ...d }

  const status = g(`${M}and-status`)
  if (status) next.status = status as Demanda['status']

  const contratoRef = g(`${M}qual-contrato`)
  if (contratoRef) next.numeroContrato = contratoRef

  const natureza = g(`${M}qual-natureza`)
  if (
    natureza === 'Próprio do cliente' ||
    natureza === 'Patrocinado (gestão)' ||
    natureza === 'Sem contrato'
  ) {
    next.contratoNatureza = natureza
  }

  const tipo =
    g(`${M}ia-tipo`) ||
    g(`${M}ctr-tipo`) ||
    g(`${M}pi-tipo`) ||
    g(`${ATDA}tipo-analise`)
  if (tipo === 'Licenciamento' || tipo === 'Serviço') next.tipoAnalise = tipo

  const modalidade = g(`${ATDA}modalidade-servico`)
  if (modalidade === 'Com projeto' || modalidade === 'Sem projeto') {
    next.modalidadeServico = modalidade
  }

  const fabricante = g(`${ATDA}fabricante`)
  if (fabricante) next.fabricante = fabricante

  const solucaoAtda = g(`${ATDA}solucao`) || g(`${M}qual-produto`)
  if (solucaoAtda) next.produtoSolucao = solucaoAtda

  const catalogoAtda = g(`${ATDA}catalogos`) || g(`${M}qual-catalogo`) || g(`${M}ctr-catalogos`)
  if (catalogoAtda) next.catalogos = catalogoAtda

  const itensAtda = g(`${ATDA}itens`) || g(`${M}ctr-itens`)
  if (itensAtda) next.itensCatalogo = itensAtda

  const parceriaAtda = g(`${ATDA}parceria`) || g(`${M}qual-parceiro`)
  if (parceriaAtda) {
    next.parceiroNome = parceriaAtda
    next.parceiroNotificado = true
  }

  const delib = g(`${ATDA}deliberacao`)
  if (delib) {
    next.deliberacaoMti = delib as Demanda['deliberacaoMti']
    if (/via contrato/i.test(delib)) next.caminhoComercial = 'via_contrato'
    else if (/orçamento/i.test(delib)) next.caminhoComercial = 'orcamento'
    else if (/sem cobertura/i.test(delib)) next.caminhoComercial = 'sem_cobertura'
  }

  const desc = g(`${M}ctr-desc`) || g(`${ATDV}desc`)
  if (desc) next.descricaoAtendimento = desc

  const nec = g(`${M}ctr-nec`) || g(`${ATDV}nec`)
  if (nec) next.necAtendimento = nec

  const valores = g(`${M}ctr-valores`) || g(`${ATDV}valores`)
  if (valores) next.valoresContrato = valores

  const saldo = g(`${ATDV}saldo`)
  if (saldo) next.saldoContabilizar = saldo

  const entregavel = g(`${M}pd-entregavel`)
  if (entregavel) next.entregavel = entregavel

  const anexosComp = g(`${M}pd-anexos`)
  if (anexosComp?.trim()) {
    const nomes = anexosComp
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (nomes.length) {
      next.anexosComprovacao = nomes.map((nome, i) => ({
        id: `comp-mdem-${i}-${nome.slice(0, 24)}`,
        nome,
        tamanhoKb: 0,
      }))
    }
  }

  const forma = g(`${M}orc-definir-pagamento`)
  if (forma) next.definirPagamento = forma as Demanda['definirPagamento']

  const temCtr = g(`${M}orc-tem-contrato`)
  if (temCtr != null && temCtr !== '') {
    next.contratoNatureza = isTruthyBool(temCtr) ? 'Próprio do cliente' : 'Sem contrato'
  }

  const motivo =
    g(`${M}pre-motivo`) ||
    g(`${M}aa-motivo`) ||
    g(`${M}vp-motivo`) ||
    g(`${M}dev-motivo`) ||
    g(`${M}rec-motivo`) ||
    g(`${M}at-motivo`) ||
    g(`${M}aut-motivo`)
  if (motivo) next.motivoUltimaAcao = motivo

  const osNum = [g(`${M}ctr-os`), g(`${M}sn-os`), g(`${M}aut-os`)].find(
    (x) => x && x.trim() && !/vincular|criar|autorizar/i.test(x),
  )
  if (osNum) next.osVinculada = osNum.trim()

  const papel = g(`${M}aa-papel`)
  const decisaoAa = g(`${M}aa-decisao`)
  if (papel && /assinar/i.test(decisaoAa || '')) {
    if (papel === 'Fiscal') next.assinaturaFiscal = true
    else if (papel === 'Solicitante') next.assinaturaSolicitante = true
    else next.assinaturaGestor = true
  }

  if (g(`${M}et-raer`) && isTruthyBool(g(`${M}et-raer`)!)) {
    next.raerStatus = 'Em elaboração'
  }
  if (g(`${M}et-enviar`) && isTruthyBool(g(`${M}et-enviar`)!)) {
    next.homologacaoStatus = 'Aguardando assinatura'
  }
  if (g(`${M}at-por`) || g(`${M}at-motivo`)) {
    next.homologAjuste = true
    const por = g(`${M}at-por`)
    if (por === 'Cliente' || por === 'MTI') next.homologAjustePor = por
  }
  if (g(`${M}sn-confirmar`) && isTruthyBool(g(`${M}sn-confirmar`)!)) {
    next.serviceNowStatus = 'Enviado'
    next.serviceNowEm = new Date().toISOString()
  }

  const obs =
    g(`${M}qual-obs`) || g(`${M}ini-obs`) || g(`${M}orc-obs`) || g(`${M}pi-obs`)
  if (obs) next.observacoes = obs

  const itens = g(`${M}ctr-itens`) || g(`${M}et-itens`)
  if (itens) next.itensCatalogo = itens

  const anexos =
    g(`${M}ctr-anexos`) || g(`${M}pd-anexos`) || g(`${M}dev-anexo`) || g(`${M}rec-anexo`)
  if (anexos?.trim()) {
    const nomes = anexos
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (nomes.length) {
      next.anexos = nomes.map((nome, i) => ({
        id: `anexo-mdem-${i}-${nome.slice(0, 24)}`,
        nome,
        tamanhoKb: 0,
      }))
    }
  }

  const modalidadeParceriaVal = g(`${M}qual-modalidade`)
  if (modalidadeParceriaVal) {
    if (
      modalidadeParceriaVal === 'Individual' ||
      modalidadeParceriaVal === 'Coletivo' ||
      modalidadeParceriaVal === 'Somente MTI'
    ) {
      next.modalidadeParceria = modalidadeParceriaVal
    }
    if (modalidadeParceriaVal !== 'Somente MTI') {
      next.parceiroNotificado = true
    }
  }

  return next
}

/** Prefill do formulário de método a partir dos valores atuais da Demanda (runtime pai). */
export function seedMethodRuntimeFromParent(
  methodFieldIds: string[],
  parentFormId: string,
  getParentValue: (key: string) => string | undefined,
  methodFormId: string,
): Record<string, string> {
  const prefix = fieldPrefixForDemandaForm(parentFormId)
  if (!prefix) return {}

  const reverse = new Map<string, string[]>()
  for (const [mid, suf] of Object.entries(DEMANDA_METHOD_DIRECT_MAP)) {
    const list = reverse.get(suf) ?? []
    list.push(mid)
    reverse.set(suf, list)
  }

  const out: Record<string, string> = {}
  for (const methodFieldId of methodFieldIds) {
    const suf = DEMANDA_METHOD_DIRECT_MAP[methodFieldId]
    if (!suf) continue
    const raw = getParentValue(parentKey(parentFormId, suf, prefix))
    if (raw == null || raw === '') continue
    out[canvasRuntimeFieldKey(methodFormId, [], methodFieldId)] = raw
  }

  // OS
  for (const mid of OS_NUMERO_METHOD_FIELDS) {
    if (!methodFieldIds.includes(mid)) continue
    const os = getParentValue(
      canvasRuntimeFieldKey(
        parentFormId,
        osAncestor(prefix, 'ref-oses'),
        'patlasv4proto-demc-os-numero',
      ),
    )
    if (os) out[canvasRuntimeFieldKey(methodFormId, [], mid)] = os
  }

  return out
}

export function demandaParentFormIds(): string[] {
  return [FORM_DEMANDA_COMPLETA_ID, FORM_DEMANDA_PORTAL_CLIENTE_ID, FORM_DEMANDA_PORTAL_PARCEIRO_ID]
}
