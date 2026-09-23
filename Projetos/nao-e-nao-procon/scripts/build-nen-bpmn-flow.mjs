/**
 * Gera fluxo BPMN puro (Atlas) + arquivo BPMN 2.0 (.bpmn) do Selo Não é Não.
 * Códigos T01–T36 alinhados ao FigJam.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const EPIC_PATHS = [
  path.join(ROOT, 'data/subprojects/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1'),
  path.join(ROOT, 'data/subprojects/nao-e-nao-seplag/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1'),
  path.resolve(ROOT, '../Projetos-Complexos/Atlas-Especificador-Sydle/data/subprojects/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1'),
  path.resolve(ROOT, '../Projetos-Complexos/nao-e-nao-seplag/data/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1'),
]

const EXPORT_DIRS = [
  path.join(ROOT, 'exports'),
  path.resolve(ROOT, '../Projetos-Complexos/PROCON — Selo Não é Não/fontes'),
  path.resolve(ROOT, '../Projetos-Complexos/Atlas-Especificador-Sydle/exports'),
]

/** @typedef {{ id: string, code: string, name: string, type: 'start'|'end'|'user'|'service'|'gateway', role?: string, form?: string, desc?: string, rules?: string[], outs?: {key: string, to: string}[] }} Node */

/** @type {Node[]} */
const NODES = [
  { id: 'start', code: 'START', name: 'Início do processo', type: 'start', outs: [{ key: 'start', to: 't01' }] },

  // Acesso
  { id: 't01', code: 'T01', name: 'Acessar portal do estabelecimento', type: 'user', role: 'Solicitante', form: 'form-nen-acesso', desc: 'Solicitante abre o portal para solicitar o selo.', outs: [{ key: 'Acessou', to: 't02' }] },
  { id: 't02', code: 'T02', name: 'Autenticar via MT Login', type: 'user', role: 'Solicitante', form: 'form-nen-acesso', desc: 'Autenticação exclusiva MT Login.', rules: ['Sem sessão válida → bloqueia'], outs: [{ key: 'Autenticado', to: 't03' }] },
  { id: 't03', code: 'T03', name: 'Listar empresas JUCEMAT', type: 'service', role: 'Sistema / JUCEMAT', form: 'form-nen-acesso', desc: 'Consulta estabelecimentos vinculados ao usuário.', outs: [{ key: 'Lista ok', to: 't04' }] },
  { id: 't04', code: 'T04', name: 'Há estabelecimento vinculado?', type: 'gateway', role: 'Sistema', outs: [{ key: 'Não', to: 't04a' }, { key: 'Sim', to: 't05' }] },
  { id: 't04a', code: 'T04A', name: 'Bloquear solicitação (sem empresa)', type: 'end', role: 'Sistema', desc: 'Encerramento: sem empresa JUCEMAT vinculada.' },
  { id: 't05', code: 'T05', name: 'Selecionar estabelecimento', type: 'user', role: 'Solicitante', form: 'form-nen-acesso', desc: 'Escolhe a unidade (CNPJ) do requerimento.', outs: [{ key: 'Selecionado', to: 't06' }] },
  { id: 't06', code: 'T06', name: 'É responsável cadastral?', type: 'gateway', role: 'Sistema', outs: [{ key: 'Sim', to: 't08' }, { key: 'Não', to: 't07' }] },
  { id: 't07', code: 'T07', name: 'Anexar documento de representação', type: 'user', role: 'Solicitante', form: 'form-nen-acesso', desc: 'Upload de procuração/documento de poderes.', outs: [{ key: 'Anexado', to: 't08' }] },
  { id: 't08', code: 'T08', name: 'Carregar dados cadastrais', type: 'service', role: 'Sistema', form: 'form-nen-solicitacao', desc: 'Pré-preenche CNPJ, razão, fantasia, endereço, CNAE; responsável e contato.', outs: [{ key: 'Dados prontos', to: 't09' }] },
  { id: 't09', code: 'T09', name: 'Iniciar Formulário de Solicitação', type: 'user', role: 'Solicitante', form: 'form-nen-solicitacao', outs: [{ key: 'Iniciar', to: 't10' }] },

  // Solicitação
  { id: 't10', code: 'T10', name: 'Responder enquadramento (4 perguntas)', type: 'user', role: 'Solicitante', form: 'form-nen-solicitacao', desc: 'Casa noturna, show, bebida, evento esportivo.', outs: [{ key: 'Avançar', to: 't11' }] },
  { id: 't11', code: 'T11', name: 'Informar equipe e capacitação', type: 'user', role: 'Solicitante', form: 'form-nen-solicitacao', desc: 'Qtd equipe, capacitados, % automático.', rules: ['Mínimo 2 capacitados', '10% se >300 (confirmar decreto)'], outs: [{ key: 'Avançar', to: 't12' }] },
  { id: 't12', code: 'T12', name: 'Registrar capacitados', type: 'user', role: 'Solicitante', form: 'form-nen-capacitado', desc: 'Nome, função, vínculo, curso, certificado, comprovante.', outs: [{ key: 'Avançar', to: 't13' }] },
  { id: 't13', code: 'T13', name: 'Informar sinalização + fotos', type: 'user', role: 'Solicitante', form: 'form-nen-solicitacao', desc: 'Banheiro feminino e local de ampla visualização + 2 fotos.', outs: [{ key: 'Avançar', to: 't14' }] },
  { id: 't14', code: 'T14', name: 'Declarar procedimentos (11 itens)', type: 'user', role: 'Solicitante', form: 'form-nen-solicitacao', outs: [{ key: 'Avançar', to: 't15' }] },
  { id: 't15', code: 'T15', name: 'Informar câmeras', type: 'user', role: 'Solicitante', form: 'form-nen-solicitacao', desc: 'Se Sim: preservação ≥30 dias e acesso legal. Câmera não é requisito de concessão.', outs: [{ key: 'Avançar', to: 't16' }] },
  { id: 't16', code: 'T16', name: 'Declarações finais + fachada', type: 'user', role: 'Solicitante', form: 'form-nen-solicitacao', outs: [{ key: 'Avançar', to: 't17' }] },
  { id: 't17', code: 'T17', name: 'Revisar respostas e anexos', type: 'user', role: 'Solicitante', form: 'form-nen-solicitacao', outs: [{ key: 'Voltar a editar', to: 't10' }, { key: 'Protocolar', to: 't18' }] },
  { id: 't18', code: 'T18', name: 'Protocolar solicitação', type: 'user', role: 'Solicitante / Sistema', form: 'form-nen-solicitacao', desc: 'Gera nº, comprovante; status PROTOCOLADO; notifica PROCON.', rules: ['Bloquear se obrigatórios faltarem', 'Exige declaração de revisão'], outs: [{ key: 'PROTOCOLADO', to: 't19' }] },
  { id: 't19', code: 'T19', name: 'Pedido PROTOCOLADO', type: 'service', role: 'Sistema', desc: 'Entra na fila PROCON.', outs: [{ key: 'Fila', to: 't22' }] },

  // Análise (§3 + overlay)
  { id: 't22', code: 'T22', name: 'Formulário de Análise (checklist + cartaz)', type: 'user', role: 'Analista PROCON', form: 'form-nen-analise-decisao', desc: 'Checklist por bloco + cartaz (acionar, 190, 180, A3, Sinal Vermelho).', outs: [{ key: 'Primeira análise (overlay)', to: 't20' }, { key: 'Concluir', to: 't23gw' }] },
  { id: 't20', code: 'T20', name: 'Primeira análise', type: 'user', role: 'Analista PROCON', form: 'form-nen-analise-decisao', desc: 'Overlay FigJam: primeira passagem do analista.', outs: [{ key: 'Tudo certo', to: 't21' }, { key: 'Ajustar', to: 't20b' }, { key: 'Necessidade de ajuste', to: 't20c' }] },
  { id: 't20b', code: 'T20B', name: 'Ajustar (voltar análise)', type: 'user', role: 'Analista / Solicitante', form: 'form-nen-analise-decisao', outs: [{ key: 'Retorna', to: 't20' }] },
  { id: 't20c', code: 'T20C', name: 'Necessidade de ajuste → análise final', type: 'user', role: 'Analista PROCON', form: 'form-nen-analise-decisao', outs: [{ key: 'Seguir', to: 't21' }] },
  { id: 't21', code: 'T21', name: 'Análise final', type: 'user', role: 'Analista PROCON', form: 'form-nen-analise-decisao', outs: [{ key: 'Conclusão', to: 't23gw' }, { key: 'Abrir diligência', to: 't23a' }, { key: 'Reprovar / indeferir', to: 't25' }] },
  { id: 't23gw', code: 'T23', name: 'Conclusão da análise', type: 'gateway', role: 'Analista PROCON', outs: [{ key: 'Não conforme', to: 't23a' }, { key: 'Pronto', to: 't24' }] },
  { id: 't23a', code: 'T23A', name: 'Abrir diligência (Formulário de Ajustes)', type: 'user', role: 'Analista PROCON', form: 'form-nen-ajustes', desc: 'Diligência única — todas as pendências de uma vez.', outs: [{ key: 'Aberta', to: 't23b' }] },
  { id: 't23b', code: 'T23B', name: 'Notificar solicitante', type: 'service', role: 'Sistema', outs: [{ key: 'Notificado', to: 't23c' }] },
  { id: 't23c', code: 'T23C', name: 'Complementar em 5 dias', type: 'user', role: 'Solicitante', form: 'form-nen-ajustes', rules: ['Prazo 5 dias', 'Sem indeferimento automático por silêncio'], outs: [{ key: 'Respondida / expirada', to: 't22' }] },
  { id: 't24', code: 'T24', name: 'Encaminhar decisão da autoridade', type: 'user', role: 'Analista PROCON', form: 'form-nen-analise-decisao', outs: [{ key: 'Para decisão', to: 't25' }] },

  // Decisão
  { id: 't25', code: 'T25', name: 'Deferir?', type: 'gateway', role: 'Autoridade PROCON', outs: [{ key: 'Sim', to: 't28' }, { key: 'Não', to: 't25a' }] },
  { id: 't25a', code: 'T25A', name: 'Registrar INDEFERIDO', type: 'user', role: 'Autoridade PROCON', form: 'form-nen-analise-decisao', desc: 'Parecer + fundamentos + info de recurso.', outs: [{ key: 'Indeferido', to: 't26' }] },
  { id: 't26', code: 'T26', name: 'Solicitante entrou com recurso?', type: 'gateway', role: 'Solicitante / Sistema', outs: [{ key: 'Não', to: 't27a' }, { key: 'Sim', to: 't26a' }] },
  { id: 't26a', code: 'T26A', name: 'Apresentar Formulário de Recurso', type: 'user', role: 'Solicitante', form: 'form-nen-recurso', outs: [{ key: 'Apresentado', to: 't27' }] },
  { id: 't27', code: 'T27', name: 'Provido?', type: 'gateway', role: 'Autoridade PROCON', outs: [{ key: 'Sim', to: 't28' }, { key: 'Não', to: 't27a' }] },
  { id: 't27a', code: 'T27A', name: 'Finalizado (sem emissão)', type: 'end', role: 'Sistema', desc: 'Sem recurso ou recurso não provido.' },

  // Emissão
  { id: 't28', code: 'T28', name: 'Gerar Template Certificado + QR', type: 'service', role: 'Sistema / PROCON', form: 'form-nen-estabelecimento-selo', outs: [{ key: 'Emitido', to: 't29' }] },
  { id: 't29', code: 'T29', name: 'Publicar no Validador MT', type: 'service', role: 'Validador MT', form: 'form-nen-estabelecimento-selo', outs: [{ key: 'Ok', to: 't30' }] },
  { id: 't30', code: 'T30', name: 'Registrar Estabelecimentos com Selo', type: 'service', role: 'Sistema', form: 'form-nen-estabelecimento-selo', outs: [{ key: 'Ok', to: 't31' }] },
  { id: 't31', code: 'T31', name: 'Notificar servidor PROCON', type: 'service', role: 'Sistema', outs: [{ key: 'Ok', to: 't32' }] },
  { id: 't32', code: 'T32', name: 'Notificar resultado ao solicitante', type: 'service', role: 'Sistema', outs: [{ key: 'Ok', to: 't33' }] },
  { id: 't33', code: 'T33', name: 'Selo VIGENTE', type: 'service', role: 'Sistema', form: 'form-nen-estabelecimento-selo', desc: 'Validade = concessão + 24 meses (board FigJam: 12).', rules: ['24 meses no protótipo até decreto'], outs: [{ key: 'Pós', to: 't34' }] },

  // Pós
  { id: 't34', code: 'T34', name: 'Notificar próximo ao vencimento', type: 'service', role: 'Sistema', form: 'form-nen-estabelecimento-selo', outs: [{ key: 'Ação', to: 't35' }] },
  { id: 't35', code: 'T35', name: 'Ação pós-concessão', type: 'gateway', role: 'Solicitante / PROCON', outs: [{ key: 'Renovar', to: 't35a' }, { key: 'Cancelar', to: 't35b' }, { key: 'Revogar (backoffice)', to: 't35c' }] },
  { id: 't35a', code: 'T35A', name: 'Formulário de Renovação', type: 'user', role: 'Solicitante', form: 'form-nen-renovacao', desc: 'Protocola e reconecta a PROTOCOLADO.', outs: [{ key: 'Protocolado', to: 't19' }] },
  { id: 't35b', code: 'T35B', name: 'Cancelar a pedido', type: 'user', role: 'Solicitante', form: 'form-nen-cancelamento', outs: [{ key: 'CANCELADO', to: 't36' }] },
  { id: 't35c', code: 'T35C', name: 'Revogar (backoffice)', type: 'user', role: 'PROCON backoffice', form: 'form-nen-revogacao', desc: 'Upload da decisão; sem denúncia no sistema.', outs: [{ key: 'REVOGADO', to: 't36' }] },
  { id: 't36', code: 'T36', name: 'Sair da lista pública', type: 'end', role: 'Sistema', form: 'form-nen-estabelecimento-selo', desc: 'Remove de vigentes após cancelamento ou revogação.' },
]

function escXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildAtlasFlow() {
  const steps = [
    {
      id: 'bpmn-capa',
      title: 'BPMN — Selo Não é Não (T01–T36)',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'BPMN',
      htmlContent: `<div style="padding:28px 48px;max-width:960px;margin:0 auto;font-family:Segoe UI,system-ui,sans-serif;color:#0f172a;line-height:1.55">
<div style="font-size:0.72rem;color:#9d174d;font-weight:700;text-transform:uppercase">Processo BPMN</div>
<h1 style="color:#9d174d;font-size:1.5rem;margin:8px 0 12px">Selo “Não é Não – Mulheres Seguras”</h1>
<p style="color:#475569">Fluxo modelado em atividades BPMN (userTask / serviceTask / gateway), códigos <strong>T01–T36</strong> alinhados ao FigJam.</p>
<ul style="color:#334155">
<li><strong>T01–T09</strong> Acesso e identificação</li>
<li><strong>T10–T19</strong> Solicitação → PROTOCOLADO</li>
<li><strong>T20–T24</strong> Análise / diligência</li>
<li><strong>T25–T28</strong> Decisão / certificado</li>
<li><strong>T29–T33</strong> Emissão</li>
<li><strong>T34–T36</strong> Pós-concessão</li>
</ul>
<p style="color:#64748b;font-size:0.92rem">Arquivo BPMN 2.0: <code>selo-nao-e-nao-fluxo.bpmn</code> (exports) — abre no Camunda Modeler / bpmn.io.</p>
</div>`,
    },
  ]

  for (const n of NODES) {
    if (n.type === 'start') continue
    const isGw = n.type === 'gateway'
    const isEnd = n.type === 'end'
    const isSvc = n.type === 'service'
    steps.push({
      id: `bpmn-${n.id}`,
      title: `${n.code} · ${n.name}`,
      type: 'bpmnActivity',
      bpmnTaskType: isGw || isEnd ? 'userTask' : isSvc ? 'userTask' : 'entryForm',
      bpmnActivityKey: `${n.code} · ${n.name}`,
      bpmnDescription:
        (n.desc || n.name) +
        (isGw ? ' [Gateway exclusivo BPMN]' : '') +
        (isSvc ? ' [Service Task]' : '') +
        (isEnd ? ' [End Event]' : '') +
        (n.type === 'user' ? ' [User Task]' : ''),
      assigneeRole: n.role || '—',
      linkedFormId: n.form,
      bpmnRuleList: n.rules,
      bpmnPossiblePaths: (n.outs || []).map((o) => ({
        key: o.key,
        value: o.to === 't04a' || o.to === 't27a' || o.to === 't36' ? `bpmn-${o.to}` : `bpmn-${o.to}`,
      })),
      bpmnFormConfirmNavigateStepId: n.outs?.[0] ? `bpmn-${n.outs[0].to}` : undefined,
      bpmnInputs: n.type === 'user' || n.type === 'gateway' ? 'Dados do processo / formulário vinculado' : undefined,
      bpmnOutputs: isEnd ? 'Fim do caminho' : n.outs?.map((o) => o.key).join(' | '),
    })
  }

  // Fix navigation targets that point to start-only ids
  for (const s of steps) {
    if (!s.bpmnPossiblePaths) continue
    s.bpmnPossiblePaths = s.bpmnPossiblePaths.map((p) => ({
      ...p,
      value: p.value.startsWith('bpmn-') ? p.value : `bpmn-${p.value}`,
    }))
    if (s.bpmnFormConfirmNavigateStepId && !s.bpmnFormConfirmNavigateStepId.startsWith('bpmn-')) {
      s.bpmnFormConfirmNavigateStepId = `bpmn-${s.bpmnFormConfirmNavigateStepId}`
    }
  }

  return {
    id: 'flow-nen-bpmn',
    name: 'BPMN — Selo Não é Não (T01–T36)',
    metadata:
      'Processo em formato BPMN (userTask / serviceTask / exclusiveGateway / endEvent), códigos T01–T36. Espelha FigJam detalhado + PDF. Arquivo .bpmn exportado em exports/selo-nao-e-nao-fluxo.bpmn.',
    steps,
  }
}

function buildBpmnXml() {
  const processId = 'Process_SeloNaoENao'
  const collabId = 'Collaboration_SeloNaoENao'
  const participantId = 'Participant_Selo'

  // Layout: horizontal swim by index
  const positions = {}
  let x = 180
  let y = 180
  let col = 0
  for (const n of NODES) {
    positions[n.id] = { x, y }
    col++
    if (col % 6 === 0) {
      x = 180
      y += 160
    } else {
      x += 200
    }
  }

  const flows = []
  let fi = 1
  for (const n of NODES) {
    for (const o of n.outs || []) {
      flows.push({
        id: `Flow_${fi++}`,
        source: n.id,
        target: o.to,
        name: o.key === 'start' || o.key === 'Avançar' || o.key === 'Ok' ? '' : o.key,
      })
    }
  }

  const elements = []
  const shapes = []
  const edges = []

  for (const n of NODES) {
    const name = escXml(`${n.code} · ${n.name}`)
    const pos = positions[n.id]
    if (n.type === 'start') {
      elements.push(`    <bpmn:startEvent id="${n.id}" name="${name}">
      <bpmn:outgoing>${flows.filter((f) => f.source === n.id).map((f) => f.id).join('</bpmn:outgoing>\n      <bpmn:outgoing>')}</bpmn:outgoing>
    </bpmn:startEvent>`)
      shapes.push(`      <bpmndi:BPMNShape id="${n.id}_di" bpmnElement="${n.id}">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="${pos.x - 30}" y="${pos.y + 40}" width="96" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`)
    } else if (n.type === 'end') {
      const incoming = flows.filter((f) => f.target === n.id).map((f) => f.id)
      elements.push(`    <bpmn:endEvent id="${n.id}" name="${name}">
${incoming.map((id) => `      <bpmn:incoming>${id}</bpmn:incoming>`).join('\n')}
    </bpmn:endEvent>`)
      shapes.push(`      <bpmndi:BPMNShape id="${n.id}_di" bpmnElement="${n.id}">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="${pos.x - 40}" y="${pos.y + 40}" width="120" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`)
    } else if (n.type === 'gateway') {
      const incoming = flows.filter((f) => f.target === n.id).map((f) => f.id)
      const outgoing = flows.filter((f) => f.source === n.id).map((f) => f.id)
      elements.push(`    <bpmn:exclusiveGateway id="${n.id}" name="${name}" default="${outgoing[0] || ''}">
${incoming.map((id) => `      <bpmn:incoming>${id}</bpmn:incoming>`).join('\n')}
${outgoing.map((id) => `      <bpmn:outgoing>${id}</bpmn:outgoing>`).join('\n')}
    </bpmn:exclusiveGateway>`)
      shapes.push(`      <bpmndi:BPMNShape id="${n.id}_di" bpmnElement="${n.id}" isMarkerVisible="true">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="${pos.x - 40}" y="${pos.y + 55}" width="130" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`)
    } else if (n.type === 'service') {
      const incoming = flows.filter((f) => f.target === n.id).map((f) => f.id)
      const outgoing = flows.filter((f) => f.source === n.id).map((f) => f.id)
      elements.push(`    <bpmn:serviceTask id="${n.id}" name="${name}">
${incoming.map((id) => `      <bpmn:incoming>${id}</bpmn:incoming>`).join('\n')}
${outgoing.map((id) => `      <bpmn:outgoing>${id}</bpmn:outgoing>`).join('\n')}
    </bpmn:serviceTask>`)
      shapes.push(`      <bpmndi:BPMNShape id="${n.id}_di" bpmnElement="${n.id}">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="140" height="80" />
      </bpmndi:BPMNShape>`)
    } else {
      const incoming = flows.filter((f) => f.target === n.id).map((f) => f.id)
      const outgoing = flows.filter((f) => f.source === n.id).map((f) => f.id)
      elements.push(`    <bpmn:userTask id="${n.id}" name="${name}">
${incoming.map((id) => `      <bpmn:incoming>${id}</bpmn:incoming>`).join('\n')}
${outgoing.map((id) => `      <bpmn:outgoing>${id}</bpmn:outgoing>`).join('\n')}
    </bpmn:userTask>`)
      shapes.push(`      <bpmndi:BPMNShape id="${n.id}_di" bpmnElement="${n.id}">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="140" height="80" />
      </bpmndi:BPMNShape>`)
    }
  }

  for (const f of flows) {
    const nameAttr = f.name ? ` name="${escXml(f.name)}"` : ''
    elements.push(`    <bpmn:sequenceFlow id="${f.id}"${nameAttr} sourceRef="${f.source}" targetRef="${f.target}" />`)
    const sp = positions[f.source]
    const tp = positions[f.target]
    const sx = sp.x + 70
    const sy = sp.y + 40
    const tx = tp.x + 20
    const ty = tp.y + 40
    edges.push(`      <bpmndi:BPMNEdge id="${f.id}_di" bpmnElement="${f.id}">
        <di:waypoint x="${sx}" y="${sy}" />
        <di:waypoint x="${tx}" y="${ty}" />
      </bpmndi:BPMNEdge>`)
  }

  // Fix start outgoing - my template was wrong for multiple. Rebuild start/end/gateway more carefully.
  // Actually regenerate elements cleanly:

  const el2 = []
  for (const n of NODES) {
    const name = escXml(`${n.code} · ${n.name}`)
    const incoming = flows.filter((f) => f.target === n.id).map((f) => f.id)
    const outgoing = flows.filter((f) => f.source === n.id).map((f) => f.id)
    const inc = incoming.map((id) => `      <bpmn:incoming>${id}</bpmn:incoming>`).join('\n')
    const out = outgoing.map((id) => `      <bpmn:outgoing>${id}</bpmn:outgoing>`).join('\n')

    if (n.type === 'start') {
      el2.push(`    <bpmn:startEvent id="${n.id}" name="${name}">\n${out}\n    </bpmn:startEvent>`)
    } else if (n.type === 'end') {
      el2.push(`    <bpmn:endEvent id="${n.id}" name="${name}">\n${inc}\n    </bpmn:endEvent>`)
    } else if (n.type === 'gateway') {
      el2.push(`    <bpmn:exclusiveGateway id="${n.id}" name="${name}">\n${inc}\n${out}\n    </bpmn:exclusiveGateway>`)
    } else if (n.type === 'service') {
      el2.push(`    <bpmn:serviceTask id="${n.id}" name="${name}">\n${inc}\n${out}\n    </bpmn:serviceTask>`)
    } else {
      el2.push(`    <bpmn:userTask id="${n.id}" name="${name}">\n${inc}\n${out}\n    </bpmn:userTask>`)
    }
  }
  for (const f of flows) {
    const nameAttr = f.name ? ` name="${escXml(f.name)}"` : ''
    el2.push(`    <bpmn:sequenceFlow id="${f.id}"${nameAttr} sourceRef="${f.source}" targetRef="${f.target}" />`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_SeloNaoENao"
  targetNamespace="https://elogroup.com.br/selo-nao-e-nao"
  exporter="Atlas Espec · Selo Não é Não"
  exporterVersion="1.0">
  <bpmn:collaboration id="${collabId}">
    <bpmn:participant id="${participantId}" name="Selo Não é Não – Mulheres Seguras (PROCON-MT)" processRef="${processId}" />
  </bpmn:collaboration>
  <bpmn:process id="${processId}" name="Solicitação, análise, concessão e pós-selo" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_Solicitante" name="Solicitante (estabelecimento)">
        <bpmn:flowNodeRef>t01</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t02</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t05</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t07</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t09</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t10</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t11</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t12</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t13</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t14</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t15</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t16</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t17</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t18</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t23c</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t26a</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t35a</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t35b</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Sistema" name="Sistema / Integrações">
        <bpmn:flowNodeRef>start</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t03</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t04</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t04a</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t06</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t08</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t19</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t23b</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t28</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t29</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t30</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t31</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t32</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t33</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t34</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t36</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t27a</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Analista" name="Analista PROCON">
        <bpmn:flowNodeRef>t20</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t20b</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t20c</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t21</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t22</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t23gw</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t23a</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t24</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Autoridade" name="Autoridade PROCON">
        <bpmn:flowNodeRef>t25</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t25a</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t26</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t27</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t35</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>t35c</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
${el2.join('\n')}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${collabId}">
      <bpmndi:BPMNShape id="${participantId}_di" bpmnElement="${participantId}" isHorizontal="true">
        <dc:Bounds x="120" y="80" width="1280" height="920" />
      </bpmndi:BPMNShape>
${shapes.join('\n')}
${edges.join('\n')}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`
}

function main() {
  const flow = buildAtlasFlow()
  const xml = buildBpmnXml()

  for (const dir of EPIC_PATHS) {
    if (!fs.existsSync(dir)) continue
    const p = path.join(dir, 'flows.json')
    let flows = []
    try {
      flows = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (!Array.isArray(flows)) flows = []
    } catch {
      flows = []
    }
    const next = [...flows.filter((f) => f.id !== flow.id), flow]
    fs.writeFileSync(p, `${JSON.stringify(next, null, 2)}\n`)
    console.log('flows', p, 'count', next.length, 'bpmnSteps', flow.steps.length)
  }

  for (const dir of EXPORT_DIRS) {
    try {
      fs.mkdirSync(dir, { recursive: true })
      const out = path.join(dir, 'selo-nao-e-nao-fluxo.bpmn')
      fs.writeFileSync(out, xml, 'utf8')
      console.log('bpmn', out)
    } catch (e) {
      console.warn('skip export', dir, e.message)
    }
  }
}

main()
