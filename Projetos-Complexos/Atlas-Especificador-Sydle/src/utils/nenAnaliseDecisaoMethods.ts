import type { FormDef } from '../types'
import { canvasRuntimeFieldKey } from './canvasRuntimeValueKey'
import { readMethodVisibilitySourceValue } from './formMethodVisibility'

export const FORM_NEN_ANALISE_DECISAO = 'form-nen-analise-decisao'
export const FORM_NEN_ATENDER = 'form-nen-atender'

const F = {
  status: 'nen-ad-status',
  prazoDiligencia: 'nen-ad-prazo-diligencia',
  pendencias: 'nen-ad-pendencias-diligencia',
  parecer: 'nen-ad-parecer',
  req: 'nen-ad-req',
  legal: 'nen-ad-legal',
  dataDecisao: 'nen-ad-data-decisao',
  julgamento: 'nen-ad-julgamento',
  julgamentoFund: 'nen-ad-julgamento-fund',
  refSelo: 'nen-ad-ref-selo',
} as const

const CHK_IDS = [
  'nen-ad-chk-dados',
  'nen-ad-chk-enquadramento',
  'nen-ad-chk-equipe',
  'nen-ad-chk-sinalizacao',
  'nen-ad-chk-sinal-acionar',
  'nen-ad-chk-sinal-190',
  'nen-ad-chk-sinal-180',
  'nen-ad-chk-sinal-a3',
  'nen-ad-chk-codigo',
  'nen-ad-chk-procedimentos',
  'nen-ad-chk-cameras',
  'nen-ad-chk-declaracoes',
] as const

/** Campos do modal Atender (mesmos ids da classe — espelhados no runtime). */
const ATENDER_SEED_FIELD_IDS = [
  F.status,
  ...CHK_IDS,
  'nen-ad-comp-dados',
  'nen-ad-comp-enquadramento',
  'nen-ad-comp-equipe',
  'nen-ad-comp-sinalizacao',
  'nen-ad-comp-procedimentos',
  'nen-ad-comp-cameras',
  'nen-ad-comp-declaracoes',
  'nen-ad-comp-codigo',
  'nen-ad-obs-analise',
  'nen-ad-docs-analise',
  F.prazoDiligencia,
  F.pendencias,
  'nen-ad-ref-diligencia',
  F.parecer,
  F.req,
  F.legal,
  F.dataDecisao,
  'nen-ad-ref-recurso',
  F.julgamento,
  F.julgamentoFund,
] as const

const ATENDER_MODAL_TITLE: Record<string, string> = {
  'EM ANÁLISE': 'Atender — Análise',
  'EM DILIGÊNCIA': 'Atender — Diligência',
  'DILIGÊNCIA RESPONDIDA': 'Atender — Retomada após diligência',
  'DILIGÊNCIA NÃO RESPONDIDA': 'Atender — Diligência sem resposta',
  'PRONTO PARA DECISÃO': 'Atender — Decisão',
  'EM RECURSO': 'Atender — Recurso',
}

/** Aba preferida no modal Atender. */
function preferAtenderModalSection(status: string): string {
  const s = status.trim().toUpperCase()
  if (s === 'EM DILIGÊNCIA') return 'sec-nen-atd-diligencia'
  if (s === 'DILIGÊNCIA RESPONDIDA' || s === 'DILIGÊNCIA NÃO RESPONDIDA') return 'sec-nen-atd-checklist'
  if (s === 'PRONTO PARA DECISÃO') return 'sec-nen-atd-decisao'
  if (s === 'EM RECURSO') return 'sec-nen-atd-recurso'
  return 'sec-nen-atd-checklist'
}

const METHOD = {
  atender: 'nen-ad-atender',
  salvar: 'nen-ad-salvar',
  diligencia: 'nen-ad-diligencia',
  enviar: 'nen-ad-enviar-analise',
  dilResp: 'nen-ad-dil-respondida',
  dilNao: 'nen-ad-dil-nao-respondida',
  retomar: 'nen-ad-retomar',
  deferir: 'nen-ad-deferir',
  indeferir: 'nen-ad-indeferir',
  baixar: 'nen-ad-baixar-cert',
  recurso: 'nen-ad-abrir-recurso',
  julgar: 'nen-ad-julgar-rec',
} as const

/** Aba preferida conforme o status do processo (após Atender). */
function preferSectionForStatus(status: string): string {
  const s = status.trim().toUpperCase()
  if (s === 'AGUARDANDO ATENDIMENTO' || s === 'EM ANÁLISE') return 'sec-nen-ad-analise'
  if (s === 'EM DILIGÊNCIA') return 'sec-nen-ad-diligencia'
  if (s === 'DILIGÊNCIA RESPONDIDA' || s === 'DILIGÊNCIA NÃO RESPONDIDA') return 'sec-nen-ad-analise'
  if (s === 'PRONTO PARA DECISÃO') return 'sec-nen-ad-decisao'
  if (s === 'EM RECURSO') return 'sec-nen-ad-recurso'
  if (s === 'DEFERIDO' || s === 'INDEFERIDO' || s === 'FINALIZADO') return 'sec-nen-ad-resultado'
  return 'sec-nen-ad-analise'
}

const ALL_METHOD_IDS = new Set(Object.values(METHOD))

export type NenAnaliseMethodResult = {
  handled: boolean
  openInputForm: boolean
  fieldPatches: Record<string, string>
  preferSectionId?: string
  /** Sobrescreve `method.inputFormId` ao abrir o modal. */
  inputFormId?: string
  /** Título do modal (ex.: Atender — Análise). */
  inputFormTitle?: string
  /** Valores por fieldId para pré-preencher o formulário do método. */
  seedFieldValues?: Record<string, string>
  /** Classe cujo runtime recebe espelhamento das edições do modal. */
  mirrorToFormId?: string
  /** Aba inicial no formulário do modal. */
  preferModalSectionId?: string
}

function collectAtenderSeed(
  form: FormDef,
  status: string,
  getValue: (k: string) => string | undefined,
  patches: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const fieldId of ATENDER_SEED_FIELD_IDS) {
    const fromPatch = patches[fieldId]
    const v = fromPatch !== undefined ? fromPatch : readField(form, fieldId, getValue)
    if (v != null && String(v).length > 0) out[fieldId] = String(v)
  }
  out[F.status] = status
  return out
}

function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function key(formId: string, fieldId: string): string {
  return canvasRuntimeFieldKey(formId, [], fieldId)
}

function readField(
  form: FormDef,
  fieldId: string,
  getValue: (k: string) => string | undefined,
): string {
  return readMethodVisibilitySourceValue(form, fieldId, getValue)
}

function setField(
  formId: string,
  fieldId: string,
  value: string,
  setValue: (k: string, v: string) => void,
  patches: Record<string, string>,
): void {
  setValue(key(formId, fieldId), value)
  patches[fieldId] = value
}

function setStatus(
  formId: string,
  status: string,
  setValue: (k: string, value: string) => void,
  patches: Record<string, string>,
): void {
  setField(formId, F.status, status, setValue, patches)
}

function listNaoConforme(
  form: FormDef,
  getValue: (k: string) => string | undefined,
): string[] {
  const out: string[] = []
  for (const id of CHK_IDS) {
    if (readField(form, id, getValue) === 'Não conforme') {
      const label = form.fields.find((f) => f.id === id)?.label || id
      out.push(label)
    }
  }
  return out
}

function listNecessitaComp(
  form: FormDef,
  getValue: (k: string) => string | undefined,
): string[] {
  const out: string[] = []
  for (const id of CHK_IDS) {
    if (readField(form, id, getValue) === 'Necessita complementação') {
      const label = form.fields.find((f) => f.id === id)?.label || id
      out.push(label)
    }
  }
  return out
}

/**
 * Métodos Análise e Decisão — alinhados ao PDF §§11–13 e atas 03/09+10/09.
 */
export function runNenAnaliseDecisaoMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
  setValue?: (key: string, value: string) => void,
): NenAnaliseMethodResult {
  const empty: NenAnaliseMethodResult = { handled: false, openInputForm: false, fieldPatches: {} }
  if (form.id !== FORM_NEN_ANALISE_DECISAO || !ALL_METHOD_IDS.has(methodId)) return empty
  if (!setValue) {
    window.alert('Abra o atendimento no workspace para executar o método.')
    return { handled: true, openInputForm: false, fieldPatches: {} }
  }

  const patches: Record<string, string> = {}
  const statusAtual = readField(form, F.status, getValue)

  if (methodId === METHOD.atender) {
    let status = statusAtual.trim()
    const veioDaFila = !status || status === 'AGUARDANDO ATENDIMENTO'
    if (veioDaFila) {
      setStatus(form.id, 'EM ANÁLISE', setValue, patches)
      status = 'EM ANÁLISE'
      if (!readField(form, 'nen-ad-data-abertura', getValue).trim()) {
        setField(form.id, 'nen-ad-data-abertura', todayIso(), setValue, patches)
      }
      if (!readField(form, 'nen-ad-prazo', getValue).trim() || /não iniciado/i.test(readField(form, 'nen-ad-prazo', getValue))) {
        setField(form.id, 'nen-ad-prazo', '30 dias restantes', setValue, patches)
      }
    }
    // Modal Atender: só os campos do status (form-nen-atender + fieldVisibilityRules).
    // Solicitação permanece embutida na classe — não entra neste modal.
    return {
      handled: true,
      openInputForm: true,
      inputFormId: FORM_NEN_ATENDER,
      inputFormTitle: ATENDER_MODAL_TITLE[status] ?? 'Atender',
      seedFieldValues: collectAtenderSeed(form, status, getValue, patches),
      mirrorToFormId: form.id,
      preferModalSectionId: preferAtenderModalSection(status),
      fieldPatches: patches,
      preferSectionId: preferSectionForStatus(status),
    }
  }

  if (methodId === METHOD.salvar) {
    window.alert('Análise salva (protótipo).\n\nStatus atual: ' + (statusAtual || '—'))
    return { handled: true, openInputForm: false, fieldPatches: patches }
  }

  if (methodId === METHOD.diligencia) {
    const pend =
      window.prompt(
        'Pendências da diligência (todas de uma vez):',
        readField(form, F.pendencias, getValue) || listNecessitaComp(form, getValue).join('; ') || '',
      ) ?? ''
    if (!pend.trim()) {
      window.alert('Informe as pendências consolidadas (diligência única).')
      return { handled: true, openInputForm: false, fieldPatches: patches }
    }
    const prazo =
      window.prompt(
        'Prazo da diligência (5 dias — Lei 7.692/2002):',
        readField(form, F.prazoDiligencia, getValue) || '5 dias corridos',
      ) ?? ''
    if (!prazo.trim()) {
      window.alert('Informe o prazo.')
      return { handled: true, openInputForm: false, fieldPatches: patches }
    }
    setField(form.id, F.pendencias, pend.trim(), setValue, patches)
    setField(form.id, F.prazoDiligencia, prazo.trim(), setValue, patches)
    setStatus(form.id, 'EM DILIGÊNCIA', setValue, patches)
    window.alert(
      'Diligência aberta (FigJam §3).\n\nSolicitante será notificado para complementar em até 5 dias.\nStatus → EM DILIGÊNCIA.',
    )
    return {
      handled: true,
      openInputForm: true,
      fieldPatches: patches,
      preferSectionId: 'sec-nen-ad-diligencia',
    }
  }

  if (methodId === METHOD.dilResp) {
    setStatus(form.id, 'DILIGÊNCIA RESPONDIDA', setValue, patches)
    return {
      handled: true,
      openInputForm: false,
      fieldPatches: patches,
      preferSectionId: 'sec-nen-ad-diligencia',
    }
  }

  if (methodId === METHOD.dilNao) {
    setStatus(form.id, 'DILIGÊNCIA NÃO RESPONDIDA', setValue, patches)
    if (!readField(form, F.parecer, getValue).trim()) {
      setField(
        form.id,
        F.parecer,
        'Diligência sem resposta no prazo. Seguir para decisão com elementos dos autos (sem indeferimento automático).',
        setValue,
        patches,
      )
    }
    return {
      handled: true,
      openInputForm: false,
      fieldPatches: patches,
      preferSectionId: 'sec-nen-ad-diligencia',
    }
  }

  if (methodId === METHOD.enviar) {
    const abertas = listNecessitaComp(form, getValue)
    if (abertas.length && statusAtual === 'EM ANÁLISE') {
      window.alert(
        'Não é possível enviar para decisão com itens «Necessita complementação» abertos.\n\n' +
          abertas.join('\n') +
          '\n\nAbra diligência ou conclua o checklist.',
      )
      return { handled: true, openInputForm: false, fieldPatches: patches }
    }
    setStatus(form.id, 'PRONTO PARA DECISÃO', setValue, patches)
    if (!readField(form, F.parecer, getValue).trim()) {
      setField(
        form.id,
        F.parecer,
        'Análise concluída. Encaminhado para decisão da autoridade PROCON.',
        setValue,
        patches,
      )
    }
    return {
      handled: true,
      openInputForm: false,
      fieldPatches: patches,
      preferSectionId: 'sec-nen-ad-decisao',
    }
  }

  if (methodId === METHOD.retomar) {
    setStatus(form.id, 'EM ANÁLISE', setValue, patches)
    return {
      handled: true,
      openInputForm: false,
      fieldPatches: patches,
      preferSectionId: 'sec-nen-ad-analise',
    }
  }

  if (methodId === METHOD.deferir) {
    const bloqueios = listNaoConforme(form, getValue)
    if (bloqueios.length) {
      window.alert(
        'Deferimento bloqueado (PDF §22).\n\nHá requisito(s) «Não conforme»:\n' +
          bloqueios.join('\n'),
      )
      return { handled: true, openInputForm: false, fieldPatches: patches }
    }
    setStatus(form.id, 'DEFERIDO', setValue, patches)
    setField(form.id, F.dataDecisao, todayIso(), setValue, patches)
    if (!readField(form, F.parecer, getValue).trim()) {
      setField(
        form.id,
        F.parecer,
        'Deferido. Selo VIGENTE emitido (validade 24 meses) com QR Validador MT.',
        setValue,
        patches,
      )
    }
    if (!readField(form, F.refSelo, getValue).trim()) {
      setField(form.id, F.refSelo, 'Selo / certificado gerado — VIGENTE', setValue, patches)
    }
    return {
      handled: true,
      openInputForm: false,
      fieldPatches: patches,
      preferSectionId: 'sec-nen-ad-resultado',
    }
  }

  if (methodId === METHOD.indeferir) {
    const parecer =
      window.prompt(
        'Parecer / fundamentação do indeferimento:',
        readField(form, F.parecer, getValue) || '',
      ) ?? ''
    if (!parecer.trim()) {
      window.alert('Parecer obrigatório para indeferir.')
      return { handled: true, openInputForm: false, fieldPatches: patches }
    }
    const req =
      window.prompt(
        'Requisitos não atendidos:',
        readField(form, F.req, getValue) || listNaoConforme(form, getValue).join('; '),
      ) ?? ''
    setField(form.id, F.parecer, parecer.trim(), setValue, patches)
    if (req.trim()) setField(form.id, F.req, req.trim(), setValue, patches)
    if (!readField(form, F.legal, getValue).trim()) {
      setField(
        form.id,
        F.legal,
        'Fundamentos legais do indeferimento + informação sobre recurso administrativo (Lei 7.692/2002).',
        setValue,
        patches,
      )
    }
    setField(form.id, F.dataDecisao, todayIso(), setValue, patches)
    setStatus(form.id, 'INDEFERIDO', setValue, patches)
    return {
      handled: true,
      openInputForm: false,
      fieldPatches: patches,
      preferSectionId: 'sec-nen-ad-resultado',
    }
  }

  if (methodId === METHOD.baixar) {
    window.alert(
      'Baixar certificado (protótipo)\n\nDocumento do Selo com QR Code para o Validador MT (portal de serviços do Estado).',
    )
    return {
      handled: true,
      openInputForm: true,
      fieldPatches: patches,
      preferSectionId: 'sec-nen-ad-resultado',
    }
  }

  if (methodId === METHOD.recurso) {
    setStatus(form.id, 'EM RECURSO', setValue, patches)
    return {
      handled: true,
      openInputForm: true,
      fieldPatches: patches,
      preferSectionId: 'sec-nen-ad-recurso',
    }
  }

  if (methodId === METHOD.julgar) {
    const escolha = window.prompt(
      'Julgamento do recurso:\n1 = Provido (→ DEFERIDO + Selo)\n2 = Não provido (→ FINALIZADO)\n\nDigite 1 ou 2:',
      '1',
    )
    if (escolha == null) return { handled: true, openInputForm: false, fieldPatches: patches }
    const t = escolha.trim()
    const provido = t === '1' || /^prov/i.test(t)
    const naoProvido = t === '2' || /n[aã]o\s*prov/i.test(t)
    if (!provido && !naoProvido) {
      window.alert('Informe 1 (Provido) ou 2 (Não provido).')
      return { handled: true, openInputForm: false, fieldPatches: patches }
    }
    const fund =
      window.prompt(
        'Fundamentação do julgamento:',
        readField(form, F.julgamentoFund, getValue) || '',
      ) ?? ''
    if (provido) {
      setField(form.id, F.julgamento, 'Provido', setValue, patches)
      setField(
        form.id,
        F.julgamentoFund,
        fund.trim() || 'Recurso provido. Selo concedido.',
        setValue,
        patches,
      )
      setField(form.id, F.dataDecisao, todayIso(), setValue, patches)
      setStatus(form.id, 'DEFERIDO', setValue, patches)
      if (!readField(form, F.refSelo, getValue).trim()) {
        setField(form.id, F.refSelo, 'Selo / certificado gerado (recurso provido)', setValue, patches)
      }
      return {
        handled: true,
        openInputForm: false,
        fieldPatches: patches,
        preferSectionId: 'sec-nen-ad-resultado',
      }
    }
    setField(form.id, F.julgamento, 'Não provido', setValue, patches)
    setField(
      form.id,
      F.julgamentoFund,
      fund.trim() || 'Recurso não provido. Processo finalizado.',
      setValue,
      patches,
    )
    setField(form.id, F.dataDecisao, todayIso(), setValue, patches)
    setStatus(form.id, 'FINALIZADO', setValue, patches)
    return {
      handled: true,
      openInputForm: false,
      fieldPatches: patches,
      preferSectionId: 'sec-nen-ad-resultado',
    }
  }

  return empty
}

export function isNenAnaliseDecisaoMethod(formId: string, methodId: string): boolean {
  return formId === FORM_NEN_ANALISE_DECISAO && ALL_METHOD_IDS.has(methodId)
}
