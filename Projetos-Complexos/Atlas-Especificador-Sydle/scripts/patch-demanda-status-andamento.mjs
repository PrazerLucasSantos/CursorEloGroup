/**
 * Demanda (Atlas Protótipo) — visão de status e próximo passo no BO MTI.
 *
 * Seção «Status e andamento» (primeira aba):
 * - mapa do fluxo
 * - status atual / etapa / próximo passo / caminhos
 * - alertas condicionais por status
 *
 * Uso: node scripts/patch-demanda-status-andamento.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const formsPath = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)
const flowsPath = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/prototipo/flows.json',
)

/** @type {Record<string, { etapa: string, proximo: string, caminhos: string, alertTitle: string, alertMessage: string, variant: string }>} */
const STATUS_MAP = {
  'Aguardando gestor': {
    etapa: '2. Hierarquia do cliente (portal/órgão)',
    proximo: 'Pré-análise MTI (se o gestor aprovar)',
    caminhos:
      'Aprovar → Aguardando pré-análise MTI · Devolver → cliente corrige · Recusar → Recusada',
    alertTitle: 'Status atual: Aguardando gestor',
    alertMessage:
      'A demanda ainda não entrou na fila MTI. Para frente: aprovação do gestor/fiscal → pré-análise MTI no Projeto Atlas.',
    variant: 'warning',
  },
  'Aguardando pré-análise MTI': {
    etapa: '4. Pré-análise MTI (back-office Projeto Atlas)',
    proximo: 'Gateway de enquadramento (auto ou Qualificar)',
    caminhos:
      'Aprovar → roteamento/qualificação · Devolver → Devolvida para correção · Recusar → Recusada',
    alertTitle: 'Status atual: Aguardando pré-análise MTI',
    alertMessage:
      'Você está nesta etapa no BO. Para frente: Aprovar segue ao gateway; Devolver/Recusar são exclusivos MTI.',
    variant: 'info',
  },
  'Aguardando análise': {
    etapa: '5/5b. Roteada · pronta para iniciar análise',
    proximo: 'Iniciar análise (MTI; parceiro pode complementar se notificado)',
    caminhos:
      'Iniciar análise → Em análise · (se ainda ambígua) Qualificar solução/catálogo/parceiro(s)',
    alertTitle: 'Status atual: Aguardando análise',
    alertMessage:
      'Pré-análise ok e enquadramento feito (auto ou qualificação). Para frente: Iniciar análise no Projeto Atlas.',
    variant: 'info',
  },
  'Em análise': {
    etapa: '6–7. Análise e parecer MTI',
    proximo: 'Parecer: via contrato · orçamento · devolver · recusar',
    caminhos:
      'Via contrato → Aguardando autorização · Orçamento → Em orçamento · Devolver → Devolvida · Recusar → Recusada',
    alertTitle: 'Status atual: Em análise',
    alertMessage:
      'Etapa de parecer no BO. Devolver/Recusar: só MTI. Parceiro notificado pode complementar via contrato/orçamento.',
    variant: 'info',
  },
  'Devolvida para correção': {
    etapa: 'Ciclo — devolvida ao cliente',
    proximo: 'Cliente corrige no portal e reenvia → volta à pré-análise/análise',
    caminhos: 'Reenvio do cliente → Aguardando pré-análise MTI ou Em análise',
    alertTitle: 'Status atual: Devolvida para correção',
    alertMessage:
      'Fora da fila ativa MTI até o reenvio. Para frente: cliente ajusta no portal; MTI retoma no Projeto Atlas.',
    variant: 'warning',
  },
  'Aguardando autorização': {
    etapa: '8. Fronteira — autorização no portal do cliente',
    proximo: 'Cliente autoriza (ou não) no portal',
    caminhos:
      'Autorizar → Aprovada · em atendimento · Não autorizar → Não autorizada',
    alertTitle: 'Status atual: Aguardando autorização',
    alertMessage:
      'Parecer via contrato concluído. Para frente: ação do cliente no portal. BO acompanha o status aqui.',
    variant: 'warning',
  },
  'Em orçamento': {
    etapa: 'Agenda própria — Orçamento',
    proximo: 'Fluxo de orçamento (campos/assinantes) · depois OS',
    caminhos: 'Continua na modelagem de orçamento → OS (capa + orçamento assinado)',
    alertTitle: 'Status atual: Em orçamento',
    alertMessage:
      'Saiu do núcleo Demanda. Para frente: agenda de orçamento; OS é adjacente. Acompanhe neste registro.',
    variant: 'warning',
  },
  Recusada: {
    etapa: 'Fim — Recusada (MTI)',
    proximo: '— (encerrado neste rito)',
    caminhos: 'Sem avanço automático. Reabrir não foi reafirmado em 09/09.',
    alertTitle: 'Status atual: Recusada',
    alertMessage: 'Fim do fluxo Demanda neste registro. Sem próximo passo operacional padrão.',
    variant: 'error',
  },
  'Não autorizada': {
    etapa: 'Fim — Não autorizada pelo cliente',
    proximo: '— (encerrado neste rito)',
    caminhos: 'Cliente recusou autorização no portal.',
    alertTitle: 'Status atual: Não autorizada',
    alertMessage: 'Fim do fluxo após fronteira do portal. Sem próximo passo padrão.',
    variant: 'error',
  },
  'Aprovada · em atendimento': {
    etapa: 'Fim — Em atendimento / ServiceNow',
    proximo: 'Esteira OS / ServiceNow (agenda própria)',
    caminhos: 'OS · cargos · ServiceNow. Fora: TH, RAE, PV, NF.',
    alertTitle: 'Status atual: Aprovada · em atendimento',
    alertMessage:
      'Demanda autorizada. Para frente: esteira OS/ServiceNow (não é o núcleo deste BPM de Demanda).',
    variant: 'success',
  },
}

const MAPA_FLUXO =
  'Portal (abertura) → [Hierarquia cliente?] → Pré-análise MTI → Gateway (auto | Qualificar) → Iniciar análise → Parecer (via contrato | orçamento | devolver | recusar) → [Autorização portal] → Em atendimento / Orçamento / Fins'

function slugStatus(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function fillAndamento(fieldValues) {
  const status = fieldValues['patlasv4proto-demanda-status']
  const meta = STATUS_MAP[status]
  fieldValues['patlasv4proto-demanda-andamento-status-leitura'] = status || ''
  if (!meta) {
    fieldValues['patlasv4proto-demanda-andamento-etapa'] = ''
    fieldValues['patlasv4proto-demanda-andamento-proximo'] = ''
    fieldValues['patlasv4proto-demanda-andamento-caminhos'] = ''
    return
  }
  fieldValues['patlasv4proto-demanda-andamento-etapa'] = meta.etapa
  fieldValues['patlasv4proto-demanda-andamento-proximo'] = meta.proximo
  fieldValues['patlasv4proto-demanda-andamento-caminhos'] = meta.caminhos
}

function main() {
  const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
  const dem = forms.find((f) => f.id === 'form-patlasv4-proto-demanda')
  if (!dem) throw new Error('Demanda não encontrada')

  // Seção como PRIMEIRA aba (BO MTI vê andamento ao abrir)
  dem.sections = (dem.sections || []).filter((s) => s.id !== 'sec-demanda-andamento')
  dem.sections.unshift({
    id: 'sec-demanda-andamento',
    title: 'Status e andamento',
    icon: 'timeline',
  })

  dem.fields = dem.fields.filter(
    (f) =>
      !String(f.id).startsWith('patlasv4proto-demanda-andamento') &&
      !String(f.id).startsWith('patlasv4proto-demanda-alert-status-'),
  )

  const andamentoFields = [
    {
      id: 'patlasv4proto-demanda-andamento-mapa',
      label: 'Mapa do fluxo',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-demanda-andamento',
      alertVariant: 'info',
      alertTitle: 'Fluxo Demanda (visão MTI · Projeto Atlas)',
      alertMessage: MAPA_FLUXO,
      spec: 'Referência fixa do rito 09/09 para o analista MTI no back-office.',
    },
    {
      id: 'patlasv4proto-demanda-andamento-status-leitura',
      label: 'Status no fluxo atual',
      type: 'text',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-demanda-andamento',
      spec: 'Espelho do Status (aba Identificação). Atualizar junto com o campo Status.',
    },
    {
      id: 'patlasv4proto-demanda-andamento-etapa',
      label: 'Etapa atual',
      type: 'text',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-demanda-andamento',
      spec: 'Onde a demanda está no fluxo (BO MTI / portal / agenda própria).',
    },
    {
      id: 'patlasv4proto-demanda-andamento-proximo',
      label: 'Próximo passo (para frente)',
      type: 'text',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: 'sec-demanda-andamento',
      spec: 'Para onde o fluxo avança a partir do status atual.',
    },
    {
      id: 'patlasv4proto-demanda-andamento-caminhos',
      label: 'Caminhos possíveis a partir daqui',
      type: 'text',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-demanda-andamento',
      textLong: true,
      spec: 'Ramificações válidas (métodos MTI / fronteiras).',
    },
  ]

  const alertIds = []
  for (const [status, meta] of Object.entries(STATUS_MAP)) {
    const id = `patlasv4proto-demanda-alert-status-${slugStatus(status)}`
    alertIds.push({ status, id })
    andamentoFields.push({
      id,
      label: `Andamento · ${status}`,
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-demanda-andamento',
      hidden: true,
      alertVariant: meta.variant,
      alertTitle: meta.alertTitle,
      alertMessage: `${meta.alertMessage}\n\nEtapa: ${meta.etapa}\nPara frente: ${meta.proximo}\nCaminhos: ${meta.caminhos}`,
      spec: `Visível somente quando Status = «${status}».`,
    })
  }

  // Campos de andamento no início da lista (aba primeira)
  dem.fields = [...andamentoFields, ...dem.fields]

  // Regras: show alert quando status = opção
  const andamentoRuleIds = new Set(
    (dem.fieldVisibilityRules || [])
      .filter((r) => String(r.id).startsWith('rule-dem-andamento-'))
      .map((r) => r.id),
  )
  dem.fieldVisibilityRules = (dem.fieldVisibilityRules || []).filter(
    (r) => !andamentoRuleIds.has(r.id) && !String(r.id).startsWith('rule-dem-andamento-'),
  )
  for (const { status, id } of alertIds) {
    dem.fieldVisibilityRules.push({
      id: `rule-dem-andamento-${slugStatus(status)}`,
      operator: 'eq',
      sourceFieldId: 'patlasv4proto-demanda-status',
      sourceKind: 'textOptions',
      expectedOptionText: status,
      action: 'show',
      targetFieldIds: [id],
    })
  }

  // Presets: preencher andamento a partir do status
  for (const p of dem.exampleValuePresets || []) {
    p.fieldValues = p.fieldValues || {}
    fillAndamento(p.fieldValues)
  }

  // Método destaque para reforçar no painel BO
  dem.methods = dem.methods || []
  if (!dem.methods.some((m) => m.id === 'method-demanda-ver-andamento')) {
    dem.methods.unshift({
      id: 'method-demanda-ver-andamento',
      name: 'Ver status e próximo passo',
      icon: 'timeline',
      kind: 'destaque',
      inputFormId: 'form-patlasv4-proto-metodo-demanda-ver-andamento',
      spec: 'Abre o resumo do status atual e para onde o fluxo vai (visão BO MTI).',
    })
  }

  // Form método (espelho do andamento)
  const methodForm = {
    id: 'form-patlasv4-proto-metodo-demanda-ver-andamento',
    name: 'Demanda — Ver status e próximo passo',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata:
      'Back-office MTI: consulta rápida do status no fluxo atual e do próximo passo (Discovery 09/09).',
    fields: [
      {
        id: 'patlasv4proto-mdem-and-mapa',
        label: 'Mapa',
        type: 'alert',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'highlight',
        alertVariant: 'info',
        alertTitle: 'Fluxo Demanda (MTI)',
        alertMessage: MAPA_FLUXO,
      },
      {
        id: 'patlasv4proto-mdem-and-status',
        label: 'Status no fluxo atual',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        options: Object.keys(STATUS_MAP),
        spec: 'Selecione o status do registro para ver etapa e próximo passo.',
      },
      {
        id: 'patlasv4proto-mdem-and-etapa',
        label: 'Etapa atual',
        type: 'text',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'highlight',
      },
      {
        id: 'patlasv4proto-mdem-and-proximo',
        label: 'Próximo passo (para frente)',
        type: 'text',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'highlight',
      },
      {
        id: 'patlasv4proto-mdem-and-caminhos',
        label: 'Caminhos possíveis',
        type: 'text',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        textLong: true,
      },
    ],
    methods: [],
    exampleValuePresets: Object.entries(STATUS_MAP).map(([status, meta], i) => ({
      id: `preset-mdem-and-${slugStatus(status)}`,
      name: status,
      iconColor: i % 2 ? '#0F3D4C' : '#1D5FA8',
      fieldValues: {
        'patlasv4proto-mdem-and-status': status,
        'patlasv4proto-mdem-and-etapa': meta.etapa,
        'patlasv4proto-mdem-and-proximo': meta.proximo,
        'patlasv4proto-mdem-and-caminhos': meta.caminhos,
      },
      embeddedRowsByFieldId: {},
    })),
    activeExamplePresetId: 'preset-mdem-and-aguardando-pre-analise-mti',
    fieldVisibilityRules: [],
  }

  const mi = forms.findIndex((f) => f.id === methodForm.id)
  if (mi >= 0) forms[mi] = methodForm
  else forms.push(methodForm)

  fs.writeFileSync(formsPath, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('forms: seção Status e andamento + método')

  // Fluxo MTI: etapa explicando a visão no BO
  if (fs.existsSync(flowsPath)) {
    const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
    const flow = flows.find((f) => f.id === 'flow-proto-demanda-mti')
    if (flow) {
      const exists = flow.steps.some((s) => s.id === 'step-mti-ver-andamento')
      if (!exists) {
        const afterReg = flow.steps.findIndex((s) => s.id === 'step-mti-registro')
        const step = {
          id: 'step-mti-ver-andamento',
          title: '3b. Ver status e próximo passo (BO)',
          type: 'method',
          methodFormType: 'input',
          linkedFormId: 'form-patlasv4-proto-metodo-demanda-ver-andamento',
          bpmnActivityKey: 'demanda.mti.verAndamento',
          bpmnTaskType: 'userTask',
          assigneeRole: 'MTI',
          bpmnDescription:
            'No Projeto Atlas, aba Status e andamento do registro Demanda: status atual, etapa, para onde vai e caminhos possíveis.',
          bpmnRuleList: [
            'Visível no back-office MTI (classe Demanda)',
            'Status drive etapa atual e próximo passo',
            'Devolver/recusar continuam só MTI',
          ],
          bpmnPossiblePaths: [{ key: 'Seguir pré-análise', value: 'step-mti-pre-analise' }],
          classMethodNavigateStepIds: {
            'method-demanda-ver-andamento': 'step-mti-ver-andamento',
          },
        }
        // Also wire class navigation from registro
        const reg = flow.steps.find((s) => s.id === 'step-mti-registro')
        if (reg) {
          reg.classMethodNavigateStepIds = {
            ...(reg.classMethodNavigateStepIds || {}),
            'method-demanda-ver-andamento': 'step-mti-ver-andamento',
          }
        }
        const parecer = flow.steps.find((s) => s.id === 'step-mti-parecer')
        if (parecer) {
          parecer.classMethodNavigateStepIds = {
            ...(parecer.classMethodNavigateStepIds || {}),
            'method-demanda-ver-andamento': 'step-mti-ver-andamento',
          }
        }
        if (afterReg >= 0) flow.steps.splice(afterReg + 1, 0, step)
        else flow.steps.push(step)
      }
      fs.writeFileSync(flowsPath, `${JSON.stringify(flows, null, 2)}\n`, 'utf8')
      console.log('flow: etapa 3b Ver status')
    }
  }

  // class-groups assignment for method form
  const cgPath = path.join(
    __dirname,
    '../data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json',
  )
  const cg = JSON.parse(fs.readFileSync(cgPath, 'utf8'))
  cg.assignments = cg.assignments || {}
  cg.assignments['form-patlasv4-proto-metodo-demanda-ver-andamento'] = 'grp-atlas-demanda-met'
  fs.writeFileSync(cgPath, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')
  console.log('DONE')
}

main()
