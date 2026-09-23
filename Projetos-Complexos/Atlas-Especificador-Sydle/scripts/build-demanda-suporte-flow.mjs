/**
 * Atlas Protótipo — Fluxo Demanda · Suporte (ramo distinto do consumo).
 *
 * Fontes:
 * - Documentador F3 · Classe 13 (SUP / Consol. P07)
 * - Consol. 1.0 · E20 E41 E46 E52 · PD22 PD27
 * - Complemento Luís Fellipe (multi-grupo + distribuição por carga/disponibilidade)
 *
 * Uso: node scripts/build-demanda-suporte-flow.mjs
 * Épico alvo: atlas-prototipo/epics/prototipo (Atlas Protótipo)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const epicDir = path.join(root, 'data/subprojects/atlas-prototipo/epics/prototipo')
const flowsPath = path.join(epicDir, 'flows.json')
const formsPath = path.join(epicDir, 'forms.json')

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function writeJson(p, data) {
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function upsertById(list, item) {
  const i = list.findIndex((x) => x.id === item.id)
  if (i >= 0) list[i] = item
  else list.push(item)
}

function upsertField(form, field, afterId) {
  const i = form.fields.findIndex((f) => f.id === field.id)
  if (i >= 0) {
    form.fields[i] = { ...form.fields[i], ...field }
    return
  }
  const after = afterId ? form.fields.findIndex((f) => f.id === afterId) : -1
  if (after >= 0) form.fields.splice(after + 1, 0, field)
  else form.fields.push(field)
}

function ensureRule(form, rule) {
  if (!form.fieldVisibilityRules) form.fieldVisibilityRules = []
  const i = form.fieldVisibilityRules.findIndex((r) => r.id === rule.id)
  if (i >= 0) form.fieldVisibilityRules[i] = rule
  else form.fieldVisibilityRules.push(rule)
}

const FLOW_ID = 'flow-proto-demanda-suporte'

const flow = {
  id: FLOW_ID,
  name: 'Demanda — Fluxo Suporte F3 (grupos + distribuição)',
  metadata:
    'Ramo Suporte (≠ consumo). Fontes: Documentador classe 13 · E20/E41/E46 · complemento Luís Fellipe (1+N grupos; sorteio por disponibilidade e carga de tarefas). PD22/PD27 abertos.',
  description:
    'Abertura tipo Suporte → qualificação do tipo → 1+N grupos de apoio → distribuição proporcional do profissional → atendimento na fila (sem bater ponto) → SN sem projeto/história.',
  steps: [
    {
      id: 'step-sup-visao',
      title: '0. Visão — o que é suporte neste fluxo',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Atlas · Demanda · Suporte',
      htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:920px;padding:8px 4px;color:#0f172a;line-height:1.55;font-size:14px">
  <h1 style="margin:0 0 10px;color:#0F3D4C;font-size:22px">Demanda de suporte — ramo distinto do consumo</h1>
  <p style="margin:0 0 12px;color:#475569">No Atlas, <strong>Tipo = Suporte</strong> não segue o rito comercial completo de consumo (via contrato / orçamento / bater ponto do parceiro). O pedido cai para o(s) <strong>grupo(s) de apoio</strong> daquele tipo de demanda qualificado.</p>
  <h2 style="margin:16px 0 8px;font-size:16px">Premissas fechadas</h2>
  <ul style="margin:0;padding-left:18px">
    <li>SLA da demanda inicia no <strong>registro</strong> (E46), inclusive suporte.</li>
    <li>Roteamento para <strong>grupo/classe de serviço</strong> (não para uma pessoa fixa na abertura).</li>
    <li>Parceiro <strong>não</strong> “bate ponto” neste ramo (RN-SUP-01).</li>
    <li>Não impor orçamento/OS/termo a todo suporte (RN-SUP-02).</li>
  </ul>
  <h2 style="margin:16px 0 8px;font-size:16px">Complemento Luís Fellipe (dinâmica ágil)</h2>
  <ul style="margin:0;padding-left:18px">
    <li>Pode cair para <strong>muitos grupos</strong> (ex.: backup → Infra + Rede).</li>
    <li>Dentro do grupo: <strong>sorteio / distribuição</strong> do profissional por disponibilidade e pelo número de tarefas já assumidas (menor carga recebe a próxima).</li>
  </ul>
  <p style="margin:12px 0 0;padding:10px;background:#fff7ed;border-left:4px solid:#c2410c">Ainda abertos: marco de início do atendimento (PD27) e resolução/aceite/reabertura (PD22) — não inventar fechamento.</p>
</div>`,
      bpmnDescription:
        'Abertura Suporte (SLA) → [N2?] → Qualifica tipo → Encaminha 1+N grupos → Distribui profissional (carga/disponibilidade) → Atende fila → [SN] → Fim / PD22',
    },
    {
      id: 'step-sup-abertura',
      title: '1. Abertura — tipo Suporte',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Atlas · Demanda · Suporte',
      htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:920px;padding:8px;color:#0f172a;line-height:1.55;font-size:14px">
  <h2 style="margin:0 0 8px;color:#0F3D4C">Quem abre e o que muda</h2>
  <ol style="margin:0;padding-left:18px">
    <li><strong>Cliente / Parceiro</strong> no portal ou <strong>MTI</strong> no Projeto Atlas escolhem <strong>Tipo = Suporte</strong>.</li>
    <li>Identificação bloqueada do logado; descrição obrigatória; anexos conforme PD03.</li>
    <li>Ao registrar: status na fila de suporte + <strong>SLA da demanda começa a contar</strong>.</li>
    <li>N2 do cliente (gestor/fiscal), se aplicável, ocorre antes da operação MTI — mesmo mecanismo do consumo.</li>
  </ol>
  <p style="margin:12px 0 0;padding:10px;background:#eff6ff;border-left:4px solid:#1D5FA8">Diferença-chave vs consumo: a fila automática aponta para <em>grupo/classe</em>, não para gerente + titular da parceria.</p>
</div>`,
      bpmnPossiblePaths: [{ key: 'Seguir → qualificação', value: 'step-sup-qualificar-tipo' }],
    },
    {
      id: 'step-sup-qualificar-tipo',
      title: '2. Qualificar o tipo de demanda de suporte',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      bpmnActivityKey: 'demanda.suporte.qualificarTipo',
      assigneeRole: 'MTI / Sistema',
      assigneeRoleDetail:
        'Sistema sugere pelo produto/classe; MTI confirma ou ajusta quando ambíguo.',
      bpmnDescription:
        'A partir do que foi aberto (produto, classe de serviço, descrição), define-se o enquadramento do suporte — isso determina para qual(is) grupo(s) de apoio o pedido cai.',
      bpmnRuleList: [
        'Grupo(s) derivados do tipo/classe do produto ou serviço',
        'Pode envolver equipe MTI, terceirizado ou sobreaviso',
        'Regime 24×7 é do serviço — não universalizar para todo suporte',
        'Sem vínculo obrigatório com projeto/história/sprint',
      ],
      bpmnPossiblePaths: [
        { key: 'Tipo qualificado → grupos', value: 'step-sup-grupos' },
      ],
      linkedFormId: 'form-patlasv4-proto-demanda-completa',
      bpmnOutputs: 'Tipo de suporte / classe enquadrados',
    },
    {
      id: 'step-sup-grupos',
      title: '3. Encaminhar a um ou mais grupos',
      type: 'bpmnActivity',
      bpmnTaskType: 'serviceTask',
      bpmnActivityKey: 'demanda.suporte.encaminharGrupos',
      assigneeRole: 'Sistema',
      assigneeRoleDetail: 'Pode ser ajustado pela MTI na qualificação quando houver ambiguidade.',
      bpmnDescription:
        'Luís: o pedido cai para o grupo de apoio daquele tipo; pode cair para muitos grupos. Ex.: configuração de backup → Infra + Rede precisam atender a mesma demanda.',
      bpmnRuleList: [
        'Mínimo 1 grupo; N grupos quando o tipo exigir competências distintas',
        'Cada grupo recebe a demanda na sua fila (crédito/capacidade do grupo)',
        'Não confundir com parceiro “bater ponto” do consumo',
        'Histórico registra quais grupos foram acionados',
      ],
      bpmnPossiblePaths: [
        { key: 'Grupos notificados → distribuição', value: 'step-sup-distribuir' },
      ],
      linkedFormId: 'form-patlasv4-proto-demanda-completa',
      bpmnOutputs: 'Lista de grupos responsáveis na demanda',
      bpmnOnCompleteEvent: 'Filas dos grupos recebem a demanda',
    },
    {
      id: 'step-sup-distribuir',
      title: '4. Distribuir profissional (carga + disponibilidade)',
      type: 'bpmnActivity',
      bpmnTaskType: 'serviceTask',
      bpmnActivityKey: 'demanda.suporte.distribuirProfissional',
      assigneeRole: 'Sistema',
      assigneeRoleDetail:
        'Sorteio / balanceamento automático por grupo. MTI pode redistribuir manualmente se necessário (exceção operacional).',
      bpmnDescription:
        'Luís (prática ágil): com 5 pessoas no grupo, se 4 têm 6 atividades e 1 tem 3, a próxima demanda cai para quem tem menor carga — considerando também disponibilidade.',
      bpmnRuleList: [
        'Critérios: disponibilidade + quantidade de tarefas já assumidas',
        'Proporcional / menor carga recebe a próxima',
        'Um profissional por grupo acionado (cada grupo faz seu próprio sorteio)',
        'Reatribuir exige registro no histórico',
      ],
      bpmnPossiblePaths: [
        { key: 'Profissional(is) definidos → atendimento', value: 'step-sup-atender' },
      ],
      linkedFormId: 'form-patlasv4-proto-demanda-completa',
      bpmnOutputs: 'Responsável(is) atribuído(s) por grupo',
    },
    {
      id: 'step-sup-atender',
      title: '5. Atender na fila do grupo',
      type: 'class',
      linkedFormId: 'form-patlasv4-proto-demanda-completa',
      classPresentationTitle: 'Demanda · Suporte — registro no Projeto Atlas',
      classPresentationDescription:
        'Campos de fila: grupos, regime 24×7, profissionais atribuídos, SLA da demanda, histórico. Sem menu de bater ponto do parceiro.',
      assigneeRole: 'MTI / grupo de apoio',
      bpmnDescription:
        'Equipe do(s) grupo(s) executa o atendimento. Timeline e histórico visíveis a cliente/parceiro/MTI conforme regra de visibilidade.',
      bpmnRuleList: [
        'Sem “bater ponto” de parceiro neste ramo',
        'Marco formal de início do atendimento = PD27 (não inventar)',
        'Preservar eventos, contexto e satisfação disponíveis no Atlas',
      ],
      bpmnPossiblePaths: [
        { key: 'Comunicar SN (se aplicável)', value: 'step-sup-sn' },
        { key: 'Encerrar / aguardar PD22', value: 'step-sup-fim' },
      ],
    },
    {
      id: 'step-sup-sn',
      title: '6. ServiceNow — sem projeto/história',
      type: 'bpmnActivity',
      bpmnTaskType: 'serviceTask',
      bpmnActivityKey: 'demanda.suporte.comunicarSn',
      assigneeRole: 'Sistema',
      bpmnDescription:
        'Quando houver integração, comunicar SN sem exigir estrutura de projeto (épicos/histórias/sprints).',
      bpmnRuleList: [
        'RF-SUP-03: comunicar SN sem projeto/história',
        'Integração real permanece mock no protótipo',
      ],
      bpmnPossiblePaths: [{ key: 'Seguir', value: 'step-sup-fim' }],
      linkedFormId: 'form-patlasv4-proto-demanda-completa',
    },
    {
      id: 'step-sup-fim',
      title: '7. Encerramento e pontos abertos',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Atlas · Demanda · Suporte',
      htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:920px;padding:8px;color:#0f172a;line-height:1.55;font-size:14px">
  <h2 style="margin:0 0 8px;color:#0F3D4C">O que este fluxo já fecha</h2>
  <ul style="margin:0;padding-left:18px">
    <li>Abertura tipo Suporte com SLA no registro.</li>
    <li>Qualificação do tipo → 1+N grupos de apoio.</li>
    <li>Distribuição do profissional por disponibilidade e carga (Luís).</li>
    <li>Atendimento em fila de grupo, sem rito de bater ponto / comercial completo.</li>
  </ul>
  <h2 style="margin:16px 0 8px;font-size:16px">Ainda não inventar (PD)</h2>
  <ul style="margin:0;padding-left:18px">
    <li><strong>PD27</strong> — qual registro marca o início do atendimento.</li>
    <li><strong>PD22</strong> — resolução, aceite, reabertura e se orçamento/OS/termo se aplicam a algum suporte.</li>
    <li><strong>PD15</strong> — calendário/pausas finos do SLA de suporte.</li>
  </ul>
</div>`,
    },
  ],
}

function patchDemandaCompleta(form) {
  if (form.id !== 'form-patlasv4-proto-demanda-completa') return false

  // Grupo único → permitir múltiplos (Luís: 1+N grupos)
  upsertField(
    form,
    {
      id: 'patlasv4proto-demc-suporte-grupo',
      label: 'Grupos de apoio (suporte)',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: true,
      relevance: 'highlight',
      sectionId: 'sec-demc-fila',
      hidden: true,
      textLong: false,
      spec:
        'Função: Grupo(s) de apoio que atendem o suporte (produto/classe).\nRegra: Luís — pode ser 1 ou N grupos (ex.: Infra + Rede). Visível quando Tipo = Suporte. Cada grupo recebe a demanda na própria fila.',
    },
    'patlasv4proto-demc-suporte-24x7',
  )

  upsertField(
    form,
    {
      id: 'patlasv4proto-demc-suporte-profissionais',
      label: 'Profissionais atribuídos (por grupo)',
      type: 'text',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-demc-fila',
      hidden: true,
      textLong: true,
      spec:
        'Função: Resultado da distribuição automática por grupo.\nRegra: Sistema escolhe profissional por disponibilidade e menor número de tarefas assumidas (proporcional). Somente leitura; redistribuição manual registra histórico.',
    },
    'patlasv4proto-demc-suporte-grupo',
  )

  upsertField(
    form,
    {
      id: 'patlasv4proto-demc-suporte-criterio-distribuicao',
      label: 'Critério de distribuição',
      type: 'textOptions',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-demc-fila',
      hidden: true,
      options: [
        'Menor carga + disponibilidade',
        'Redistribuição manual MTI',
        'Aguardando distribuição',
      ],
      spec:
        'Função: Indica como o profissional foi escolhido no grupo.\nRegra: Padrão = menor carga + disponibilidade (Luís). Manual só com motivo no histórico.',
    },
    'patlasv4proto-demc-suporte-profissionais',
  )

  const fila = form.fields.find((f) => f.id === 'patlasv4proto-demc-fila-regra')
  if (fila) {
    fila.spec =
      'Função: Regra automática de roteamento da fila (consumo × suporte).\nRegra: Consumo → gerente + titular parceria. Suporte → 1+N grupos de apoio da classe/produto; depois distribuição do profissional por carga/disponibilidade.'
    if (!fila.options.includes('Suporte · 1+N grupos · distribuição por carga')) {
      fila.options = [
        ...fila.options.filter((o) => o !== 'Suporte · grupo/classe de serviço'),
        'Suporte · 1+N grupos · distribuição por carga',
        'Suporte · grupo/classe de serviço',
      ]
    }
  }

  ensureRule(form, {
    id: 'rule-demc-f3-suporte-grupo',
    operator: 'eq',
    sourceFieldId: 'patlasv4proto-demc-tipo',
    sourceKind: 'textOptions',
    expectedOptionText: 'Suporte',
    action: 'show',
    targetFieldIds: [
      'patlasv4proto-demc-suporte-grupo',
      'patlasv4proto-demc-suporte-24x7',
      'patlasv4proto-demc-suporte-profissionais',
      'patlasv4proto-demc-suporte-criterio-distribuicao',
    ],
  })

  form.metadata = `${form.metadata || ''}\nSuporte F3: fluxo flow-proto-demanda-suporte — multi-grupo + distribuição por carga (Luís).`.trim()
  return true
}

const flows = readJson(flowsPath)
upsertById(flows, flow)
writeJson(flowsPath, flows)

const forms = readJson(formsPath)
let patched = 0
for (const form of forms) {
  if (patchDemandaCompleta(form)) patched += 1
}
writeJson(formsPath, forms)

console.log(
  JSON.stringify(
    {
      ok: true,
      flowId: FLOW_ID,
      flowName: flow.name,
      steps: flow.steps.length,
      formsPatched: patched,
      epic: 'atlas-prototipo/epics/prototipo',
    },
    null,
    2,
  ),
)
