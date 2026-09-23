/**
 * Fluxograma extremamente detalhado (FigJam LR + PDF + protótipo).
 * Novo fluxo: flow-nen-fluxograma-detalhado
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

const FIGJAM =
  'https://www.figma.com/board/txWrswjvhQUdxYb1Ojmdtl/PROCON-Nao-e-Nao---Fluxo-Completo-LR'
const C = { brand: '#9d174d', soft: '#fdf2f8', ink: '#0f172a', muted: '#475569', border: '#e2e8f0', slate: '#f8fafc', warn: '#b45309', warnBg: '#fffbeb', ok: '#166534', okBg: '#f0fdf4', info: '#1e4b9e', infoBg: '#e8eef8' }

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function wrap(inner) {
  return `<div style="padding:24px 40px 52px;max-width:1040px;margin:0 auto;font-family:Segoe UI,Inter,system-ui,sans-serif;color:${C.ink};line-height:1.55;font-size:14px;">${inner}</div>`
}
function eyebrow(t) {
  return `<div style="font-size:0.72rem;color:${C.brand};font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px;">${esc(t)}</div>`
}
function h1(t) {
  return `<h1 style="font-size:1.45rem;margin:0 0 10px;color:${C.brand};line-height:1.25;">${esc(t)}</h1>`
}
function p(t) {
  return `<p style="margin:0 0 12px;color:${C.muted};">${t}</p>`
}
function callout(title, body, tone = 'brand') {
  const map = { brand: [C.brand, C.soft], warn: [C.warn, C.warnBg], ok: [C.ok, C.okBg], info: [C.info, C.infoBg], slate: ['#64748b', C.slate] }
  const [b, bg] = map[tone] || map.brand
  return `<div style="border-left:4px solid ${b};background:${bg};padding:12px 16px;border-radius:8px;margin:0 0 12px;"><strong style="display:block;margin-bottom:4px;">${esc(title)}</strong><div style="color:#334155;font-size:0.92rem;">${body}</div></div>`
}
function ul(items) {
  return `<ul style="margin:6px 0 12px;padding-left:18px;color:#334155;">${items.map((i) => `<li style="margin:0 0 4px;">${i}</li>`).join('')}</ul>`
}
function ol(items) {
  return `<ol style="margin:6px 0 12px;padding-left:18px;color:#334155;">${items.map((i) => `<li style="margin:0 0 4px;">${i}</li>`).join('')}</ol>`
}
function table(headers, rows) {
  const th = headers.map((h) => `<th style="padding:8px 9px;text-align:left;background:${C.brand};color:#fff;font-size:11px;vertical-align:top;">${esc(h)}</th>`).join('')
  const tr = rows
    .map((r, i) => `<tr style="background:${i % 2 ? C.slate : '#fff'}">${r.map((c) => `<td style="padding:7px 9px;border-bottom:1px solid ${C.border};font-size:12px;vertical-align:top;color:#334155;">${c}</td>`).join('')}</tr>`)
    .join('')
  return `<div style="overflow-x:auto;margin:8px 0 14px;"><table style="width:100%;border-collapse:collapse;min-width:680px;"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`
}
function html(id, title, header, body) {
  return { id, title, type: 'html', htmlPresentationShowHeader: true, htmlPresentationHeaderTitle: header, htmlContent: wrap(body) }
}
function bpmn(cfg) {
  return {
    type: 'bpmnActivity',
    bpmnTaskType: cfg.taskType || 'userTask',
    ...cfg,
  }
}

function build() {
  const steps = []

  steps.push(
    html(
      'fx-capa',
      'Capa — Fluxograma detalhado',
      'Fluxograma detalhado',
      eyebrow('Alinhado ao board FigJam · Fluxo Completo LR') +
        h1('Fluxo ponta a ponta — do login ao pós-selo') +
        p('Espelhamento <strong>extremamente detalhado</strong> do fluxograma FigJam (6 seções + overlay de análise), enriquecido com as perguntas/evidências da solicitação e com as regras já fechadas nas reuniões.') +
        callout('Board de referência', `<a href="${FIGJAM}" target="_blank" rel="noreferrer">Abrir FigJam — Fluxo Completo LR</a>`, 'info') +
        ol([
          '§1 Acesso e empresa (login → JUCEMAT → seleção → documento)',
          '§2 Solicitação (perguntas por bloco → revisão → PROTOCOLADO)',
          '§3 Pré-análise + overlay (primeira análise → ajustes / análise final → aprovador)',
          '§4 Decisão (deferir? recurso? provido?)',
          '§5 Emissão (Validador MT, classe selo, notificações, VIGENTE)',
          '§6 Pós-concessão (renovar / cancelar / revogar → sai da lista)',
        ]) +
        callout('Validade', 'No board: «VIGENTE 12 meses». Minuta/PDF/atas: <strong>24 meses</strong> — protótipo e requisitos usam 24 até o decreto fechar.', 'warn'),
    ),
  )

  steps.push(
    html(
      'fx-mapa',
      'Mapa do board (6 seções)',
      'Visão macro',
      eyebrow('FigJam — seções existentes') +
        h1('O que o board já desenha') +
        table(
          ['Seção', 'Nós no FigJam', 'Saídas'],
          [
            ['1. Acesso e empresa', 'Início → MT Login → JUCEMAT lista empresas → Seleciona estabelecimento', 'Entra na Solicitação'],
            ['2. Solicitação', 'Formulário → Revisa respostas e anexos → Protocolar → PROTOCOLADO', 'Entra na Pré-análise'],
            ['3. Pré Análise PROCON', 'Formulário de Análise → Conclusão → (Não conforme) Ajustes → Notifica → Complementa 5 dias → volta Análise; ou (Pronto) Decisão da autoridade', 'Decisão'],
            ['4. Decisão', 'Deferir? → Sim: Template Certificado+QR; Não: INDEFERIDO → Recurso? → Formulário → Provido? → Certificado ou Finalizado', 'Emissão ou Finalizado'],
            ['5. Emissão', 'Validador MT · Classe Estabelecimentos com Selo · Notifica servidor · Notifica solicitante · VIGENTE 12 meses', 'Pós'],
            ['6. Pós-concessão', 'Notificação vencimento → Ação: Renovar / Cancelar / Revogar(backoffice) → CANCELADO|REVOGADO → Sai da lista pública; Renovar volta a PROTOCOLADO', 'Ciclo ou saída'],
          ],
        ) +
        callout(
          'Overlay acima da Decisão (refino de papéis)',
          'Primeira análise → ajustar | tudo certo | acho que necessidade de ajuste → análise final → aprovador (emitir certificado) | reprovar → solicitante entrou com recurso? (sim → volta análise final; não → reprovado/encerrado).',
          'brand',
        ),
    ),
  )

  // ——— §1 Acesso detalhado ———
  const acessoNodes = [
    { id: 'fx-1-inicio', title: '1.0 Início', key: 'Início', desc: 'Solicitante acessa o portal do estabelecimento para solicitar o selo.', role: 'Solicitante', next: 'fx-1-login', paths: [{ key: 'Acessar portal', value: 'fx-1-login' }] },
    { id: 'fx-1-login', title: '1.1 MT Login', key: 'MT Login', desc: 'Autenticação exclusiva via MT Login. Sem sessão válida, bloqueia o restante do fluxo.', role: 'Solicitante / MT Login', form: 'form-nen-acesso', next: 'fx-1-jucemat', paths: [{ key: 'Autenticado', value: 'fx-1-jucemat' }] },
    { id: 'fx-1-jucemat', title: '1.2 JUCEMAT lista empresas', key: 'JUCEMAT lista empresas', desc: 'Integração consulta e lista apenas estabelecimentos vinculados ao usuário autenticado.', role: 'Sistema / JUCEMAT', form: 'form-nen-acesso', next: 'fx-1-seleciona', paths: [{ key: 'Lista disponível', value: 'fx-1-seleciona' }, { key: 'Sem empresas', value: 'fx-1-bloqueio' }] },
    { id: 'fx-1-bloqueio', title: '1.2b Sem estabelecimento', key: 'Bloqueio', desc: 'Se não houver empresa JUCEMAT vinculada, a solicitação não inicia.', role: 'Sistema', paths: [] },
    { id: 'fx-1-seleciona', title: '1.3 Seleciona estabelecimento', key: 'Seleciona estabelecimento', desc: 'Usuário escolhe a unidade (CNPJ) objeto do requerimento. Um pedido por unidade.', role: 'Solicitante', form: 'form-nen-acesso', next: 'fx-1-doc', paths: [{ key: 'Unidade selecionada', value: 'fx-1-doc' }] },
    { id: 'fx-1-doc', title: '1.4 Documento de representação?', key: 'Documento de representação', desc: 'Se o solicitante não for o responsável cadastral, exige upload de procuração/documento de poderes.', role: 'Solicitante', form: 'form-nen-acesso', next: 'fx-1-dados', paths: [{ key: 'É responsável / doc ok', value: 'fx-1-dados' }] },
    { id: 'fx-1-dados', title: '1.5 Identificação cadastral', key: 'Dados do estabelecimento', desc: 'Sistema pré-preenche CNPJ, razão social, nome fantasia, endereço, município, CNAE. Solicitante informa responsável e contato.', role: 'Sistema + Solicitante', form: 'form-nen-solicitacao', next: 'fx-2-enq', paths: [{ key: 'Seguir para perguntas', value: 'fx-2-enq' }] },
  ]

  steps.push(
    html(
      'fx-1-visao',
      '§1 Acesso e empresa — detalhe',
      'FigJam §1',
      eyebrow('Início → MT Login → JUCEMAT → Seleciona') +
        h1('Acesso e identificação do estabelecimento') +
        ol(acessoNodes.map((n) => `<strong>${esc(n.key)}</strong> — ${esc(n.desc)}`)) +
        callout('Regras', ul(['Somente empresas JUCEMAT do usuário', 'Requerimento vinculado à unidade', 'Documento de representação quando necessário', 'Elegibilidade sócio/representante/filial: a confirmar']), 'warn'),
    ),
  )

  for (const n of acessoNodes) {
    steps.push(
      bpmn({
        id: n.id,
        title: n.title,
        bpmnActivityKey: n.key,
        bpmnDescription: n.desc,
        assigneeRole: n.role,
        linkedFormId: n.form,
        bpmnPossiblePaths: n.paths,
        bpmnFormConfirmNavigateStepId: n.next,
        bpmnRuleList: n.id === 'fx-1-login' ? ['MT Login obrigatório'] : n.id === 'fx-1-jucemat' ? ['Somente empresas vinculadas'] : undefined,
      }),
    )
  }

  // ——— §2 Perguntas ———
  const perguntas = [
    {
      id: 'fx-2-enq',
      title: '2.1 Enquadramento',
      key: 'Verificação de enquadramento',
      desc: 'Perguntas para identificar se o estabelecimento se enquadra no Protocolo Não é Não.',
      items: [
        'O estabelecimento é casa noturna ou boate? (Sim/Não)',
        'Realiza espetáculo musical em local fechado, shows ou eventos musicais? (Sim/Não)',
        'Há venda de bebida alcoólica? (Sim/Não)',
        'Trata-se de competição ou evento esportivo? (Sim/Não)',
      ],
      next: 'fx-2-equipe',
    },
    {
      id: 'fx-2-equipe',
      title: '2.2 Equipe e capacitação',
      key: 'Informações sobre a equipe',
      desc: 'Quantidade de equipe, capacitados, percentual automático e mínimo legal.',
      items: [
        'Quantos funcionários/pessoas da equipe atuam no estabelecimento? (número)',
        'Quantos possuem capacitação no Protocolo Não é Não? (número)',
        'Percentual calculado automaticamente',
        'Mínimo: ao menos 2 capacitados; eventos com público > 300 → mínimo 10% (confirmar decreto)',
      ],
      next: 'fx-2-cap',
    },
    {
      id: 'fx-2-cap',
      title: '2.3 Identificação dos capacitados',
      key: 'Capacitados (registro por pessoa)',
      desc: 'Para cada capacitado: nome, função, vínculo, curso, data, certificado e comprovante de vínculo (não só CTPS).',
      items: [
        'Nome, função, tipo de vínculo, curso, data de conclusão',
        'Certificado individual (Escola de Governo)',
        'Comprovante de vínculo (empregatício, prestação, terceirizado, sócio, outro)',
      ],
      form: 'form-nen-capacitado',
      next: 'fx-2-sinal',
    },
    {
      id: 'fx-2-sinal',
      title: '2.4 Sinalização (solicitação)',
      key: 'Sinalização — banheiro e local visível',
      desc: 'Na solicitação: duas perguntas + duas fotos. Conteúdo legal do cartaz (190/180/A3/acionar) é conferido na análise.',
      items: [
        'Mantém informação no banheiro feminino? + fotografia',
        'Mantém informação em local de ampla visualização? + fotografia',
        '(Analista depois confere: forma de acionar, 190, 180, A3/texto oficial, Sinal Vermelho)',
      ],
      next: 'fx-2-proc',
    },
    {
      id: 'fx-2-proc',
      title: '2.5 Procedimentos (11 declarações)',
      key: 'Procedimentos de atendimento',
      desc: 'Declarações objetivas Sim/Não sobre o Protocolo (acolhimento, proteção, testemunhas, PM, vestígios, acompanhamento, autodeterminação da mulher, assistência, Sinal Vermelho, gesto, compromisso).',
      items: [
        'Verificar de forma reservada se a mulher necessita assistência',
        'Proteger e afastar do agressor (inclusive visualmente)',
        'Colaborar na identificação de testemunhas',
        'Solicitar comparecimento da PM / agente competente',
        'Preservar local com vestígios até autoridade',
        'Auxiliar com acompanhamento até transporte/polícia',
        'Cabe à mulher definir se sofreu constrangimento/violência',
        'Suporte/assistência imediatos (Lei 12.478/2024)',
        'Protocolo Código Sinal Vermelho → ligar 190 (Lei 11.889/2022)',
        'Reconhecer sinal gestual de pedido de socorro',
        'Compromisso de assegurar os direitos da mulher no Protocolo',
      ],
      next: 'fx-2-cam',
    },
    {
      id: 'fx-2-cam',
      title: '2.6 Câmeras',
      key: 'Câmeras de segurança',
      desc: 'Existência de câmeras NÃO é requisito de concessão. Se Sim, abre preservação ≥ 30 dias e acesso legal às imagens.',
      items: [
        'Dispõe de sistema de câmeras? (Sim/Não)',
        'Se Sim: preservará imagens ≥ 30 dias? (Sim/Não)',
        'Se Sim: garantirá acesso legal (PC, perícia, envolvidos)? (Sim/Não)',
      ],
      next: 'fx-2-dec',
    },
    {
      id: 'fx-2-dec',
      title: '2.7 Declarações finais + fachada',
      key: 'Declarações e protocolização',
      desc: 'Declarações de implementação e veracidade, sanção nos 12 meses, foto da fachada e checkbox de revisão.',
      items: [
        'Foto da fachada do estabelecimento',
        'Declaro implementação do Protocolo e manutenção na vigência',
        'Declaro veracidade das informações sob as penas da Lei',
        'Houve sanção administrativa definitiva nos 12 meses? (Sim/Não)',
        'Declaro que revisei tudo (habilita Protocolar)',
      ],
      next: 'fx-2-revisa',
    },
  ]

  steps.push(
    html(
      'fx-2-visao',
      '§2 Solicitação — detalhe das perguntas',
      'FigJam §2',
      eyebrow('Formulário → Revisa → Protocolar → PROTOCOLADO') +
        h1('Solicitação expandida (perguntas e evidências)') +
        p('No FigJam o nó é único («Formulário de Solicitação»). Abaixo, o desdobramento completo usado no protótipo/PDF.') +
        ol(perguntas.map((q) => `<strong>${esc(q.title)}</strong> — ${esc(q.desc)}`)),
    ),
  )

  for (const q of perguntas) {
    steps.push(
      html(
        `${q.id}-det`,
        q.title,
        'Perguntas',
        eyebrow('Solicitação') + h1(q.key) + p(q.desc) + ul(q.items.map(esc)),
      ),
    )
    steps.push(
      bpmn({
        id: q.id,
        title: q.title,
        bpmnActivityKey: q.key,
        bpmnDescription: q.desc + ' Itens: ' + q.items.slice(0, 3).join('; ') + (q.items.length > 3 ? '…' : ''),
        assigneeRole: 'Solicitante (estabelecimento)',
        linkedFormId: q.form || 'form-nen-solicitacao',
        bpmnPossiblePaths: [{ key: 'Avançar', value: q.next }],
        bpmnFormConfirmNavigateStepId: q.next,
        bpmnRuleList: q.id === 'fx-2-equipe' ? ['Mínimo 2 capacitados', '% automático', '10% se >300 (confirmar)'] : q.id === 'fx-2-cam' ? ['Câmera não é requisito de concessão'] : undefined,
      }),
    )
  }

  steps.push(
    bpmn({
      id: 'fx-2-revisa',
      title: '2.8 Revisa respostas e anexos',
      bpmnActivityKey: 'Revisa respostas e anexos',
      bpmnDescription: 'FigJam §2: solicitante confere todas as respostas e anexos antes de protocolar. Pode voltar a editar.',
      assigneeRole: 'Solicitante (estabelecimento)',
      linkedFormId: 'form-nen-solicitacao',
      bpmnPossiblePaths: [
        { key: 'Voltar a editar', value: 'fx-2-enq' },
        { key: 'Protocolar', value: 'fx-2-protocolar' },
      ],
      bpmnFormConfirmNavigateStepId: 'fx-2-protocolar',
    }),
  )
  steps.push(
    bpmn({
      id: 'fx-2-protocolar',
      title: '2.9 Protocolar → PROTOCOLADO',
      bpmnActivityKey: 'Protocolar',
      bpmnDescription: 'Gera número de protocolo, data/hora, comprovante; status PROTOCOLADO; notifica área PROCON. Após protocolado, edição livre bloqueada.',
      assigneeRole: 'Solicitante / Sistema',
      linkedFormId: 'form-nen-solicitacao',
      bpmnOutputs: 'PROTOCOLADO + comprovante + notificação PROCON',
      bpmnRuleList: ['Bloquear se obrigatórios faltarem', 'Exige declaração de revisão'],
      bpmnPossiblePaths: [{ key: 'PROTOCOLADO → Pré-análise', value: 'fx-3-analise' }],
      bpmnFormConfirmNavigateStepId: 'fx-3-analise',
    }),
  )

  // ——— §3 Análise ———
  steps.push(
    html(
      'fx-3-visao',
      '§3 Pré-análise — detalhe',
      'FigJam §3 + overlay',
      eyebrow('Formulário de Análise → Conclusão') +
        h1('Pré-análise PROCON e papéis') +
        p('<strong>Trilha do board:</strong> Formulário de Análise → diamante Conclusão → «Não conforme» (Ajustes → Notifica → Complementa 5 dias → volta Análise) ou «Pronto» (Decisão da autoridade).') +
        p('<strong>Overlay de refino:</strong> Primeira análise → ajustar | tudo certo | necessidade de ajuste → análise final → aprovador (emitir) | reprovar → recurso?') +
        callout('Checklist do analista', 'Dados/fachada · Enquadramento · Equipe · Sinalização (fotos) · Procedimentos · Câmeras · Declarações · Cartaz (acionar, 190, 180, A3) · Sinal Vermelho — cada um: Conforme / Não conforme / Necessita complementação.', 'brand'),
    ),
  )

  const analise = [
    { id: 'fx-3-analise', title: '3.1 Formulário de Análise', key: 'Formulario de Analise', desc: 'Analista abre o pedido PROTOCOLADO, vê a solicitação embutida e preenche checklist + cartaz.', role: 'Analista PROCON', form: 'form-nen-analise-decisao', next: 'fx-3-conclusao', paths: [{ key: 'Concluir análise', value: 'fx-3-conclusao' }] },
    { id: 'fx-3-conclusao', title: '3.2 Conclusão', key: 'Conclusao', desc: 'Diamante FigJam: Não conforme → Ajustes; Pronto → Decisão da autoridade.', role: 'Analista PROCON', form: 'form-nen-analise-decisao', taskType: 'userTask', paths: [{ key: 'Não conforme', value: 'fx-3-ajustes' }, { key: 'Pronto', value: 'fx-3-autoridade' }] },
    { id: 'fx-3-ajustes', title: '3.3 Formulário de Ajustes', key: 'Formulario de Ajustes', desc: 'Diligência única: lista todas as pendências de uma vez.', role: 'Analista PROCON', form: 'form-nen-ajustes', next: 'fx-3-notifica', paths: [{ key: 'Abrir diligência', value: 'fx-3-notifica' }] },
    { id: 'fx-3-notifica', title: '3.4 Notifica solicitante', key: 'Notifica solicitante', desc: 'Notificação ao estabelecimento com prazo e pendências.', role: 'Sistema', next: 'fx-3-complementa', paths: [{ key: 'Notificado', value: 'fx-3-complementa' }] },
    { id: 'fx-3-complementa', title: '3.5 Complementa em 5 dias', key: 'Complementa em 5 dias', desc: 'Solicitante responde/anexa. Sem resposta ≠ indeferimento automático. Volta ao Formulário de Análise.', role: 'Solicitante', form: 'form-nen-ajustes', next: 'fx-3-analise', paths: [{ key: 'Respondida → Análise', value: 'fx-3-analise' }, { key: 'Não respondida → Análise/Decisão', value: 'fx-3-analise' }], rules: ['Prazo 5 dias (Lei 7.692/2002)', 'Sem indeferimento automático'] },
    { id: 'fx-3-autoridade', title: '3.6 Decisão da autoridade', key: 'Decisao da autoridade', desc: 'Encaminhamento FigJam «Pronto» → entra no diamante Deferir? (§4).', role: 'Autoridade PROCON', form: 'form-nen-analise-decisao', next: 'fx-4-deferir', paths: [{ key: 'Deferir?', value: 'fx-4-deferir' }] },
  ]

  for (const n of analise) {
    steps.push(
      bpmn({
        id: n.id,
        title: n.title,
        bpmnActivityKey: n.key,
        bpmnDescription: n.desc,
        assigneeRole: n.role,
        linkedFormId: n.form,
        bpmnPossiblePaths: n.paths,
        bpmnFormConfirmNavigateStepId: n.next,
        bpmnRuleList: n.rules,
        bpmnTaskType: n.taskType || 'entryForm',
      }),
    )
  }

  // Overlay
  const overlay = [
    { id: 'fx-3o-primeira', title: '3o.1 Primeira análise', key: 'Primeira analise', desc: 'Overlay: analista faz a primeira passagem.', role: 'Analista PROCON', paths: [{ key: 'ajustar', value: 'fx-3o-ajustar' }, { key: 'tudo certo', value: 'fx-3o-final' }, { key: 'necessidade de ajuste', value: 'fx-3o-necessidade' }] },
    { id: 'fx-3o-ajustar', title: '3o.2 ajustar', key: 'ajustar', desc: 'Volta para complementar/corrigir e retorna à primeira análise.', role: 'Analista / Solicitante', paths: [{ key: 'Retorna', value: 'fx-3o-primeira' }] },
    { id: 'fx-3o-necessidade', title: '3o.3 necessidade de ajuste', key: 'acho que necessidade de ajuste', desc: 'Encaminha para análise final com ressalvas.', role: 'Analista PROCON', paths: [{ key: 'Análise final', value: 'fx-3o-final' }] },
    { id: 'fx-3o-final', title: '3o.4 análise final', key: 'analise final', desc: 'Segunda passagem / consolidação antes do aprovador.', role: 'Analista PROCON', paths: [{ key: 'aprovador', value: 'fx-3o-aprovador' }, { key: 'reprovar', value: 'fx-3o-reprovar' }] },
    { id: 'fx-3o-aprovador', title: '3o.5 aprovador', key: 'aprovador', desc: 'Autoridade aprova → emitir certificado.', role: 'Autoridade PROCON', paths: [{ key: 'emitir certificado', value: 'fx-5-template' }] },
    { id: 'fx-3o-reprovar', title: '3o.6 reprovar', key: 'reprovar', desc: 'Autoridade reprova → pergunta se solicitante entrou com recurso.', role: 'Autoridade PROCON', paths: [{ key: 'Recurso?', value: 'fx-3o-recurso' }] },
    { id: 'fx-3o-recurso', title: '3o.7 solicitante entrou com recurso?', key: 'solicitante entrou com recurso?', desc: 'Sim → volta à análise final; Não → reprovado/encerrado.', role: 'Sistema / Solicitante', paths: [{ key: 'Sim → análise final', value: 'fx-3o-final' }, { key: 'Não → encerrado', value: 'fx-3o-encerrado' }] },
    { id: 'fx-3o-encerrado', title: '3o.8 reprovado/encerrado', key: 'reprovado/encerrado', desc: 'Pedido finalizado sem emissão.', role: 'Sistema', paths: [] },
  ]

  steps.push(
    html(
      'fx-3o-visao',
      'Overlay — papéis de análise',
      'FigJam overlay',
      eyebrow('Acima da seção Decisão no board') +
        h1('Primeira análise → análise final → aprovador/recurso') +
        ol(overlay.map((o) => `<strong>${esc(o.key)}</strong> — ${esc(o.desc)}`)),
    ),
  )
  for (const n of overlay) {
    steps.push(
      bpmn({
        id: n.id,
        title: n.title,
        bpmnActivityKey: n.key,
        bpmnDescription: n.desc,
        assigneeRole: n.role,
        linkedFormId: 'form-nen-analise-decisao',
        bpmnPossiblePaths: n.paths,
        bpmnTaskType: 'userTask',
      }),
    )
  }

  // ——— §4 Decisão ———
  steps.push(
    html(
      'fx-4-visao',
      '§4 Decisão — detalhe',
      'FigJam §4',
      eyebrow('Deferir? → Recurso? → Provido?') +
        h1('Decisão e recurso') +
        ol([
          '<strong>Deferir?</strong> Sim → Template Certificado + QR (§5). Não → INDEFERIDO.',
          '<strong>Recurso?</strong> Não → Finalizado. Sim → Formulário de Recurso.',
          '<strong>Provido?</strong> Sim → Template Certificado + QR. Não → Finalizado.',
        ]),
    ),
  )

  const decisao = [
    { id: 'fx-4-deferir', title: '4.1 Deferir?', key: 'Deferir?', desc: 'Diamante central da seção Decisão.', role: 'Autoridade PROCON', form: 'form-nen-analise-decisao', paths: [{ key: 'Sim', value: 'fx-5-template' }, { key: 'Não', value: 'fx-4-indeferido' }], rules: ['Não deferir com item obrigatório não conforme'] },
    { id: 'fx-4-indeferido', title: '4.2 INDEFERIDO', key: 'INDEFERIDO', desc: 'Status indeferido com parecer/fundamentação e informação de recurso.', role: 'Autoridade PROCON', form: 'form-nen-analise-decisao', next: 'fx-4-recurso', paths: [{ key: 'Recurso?', value: 'fx-4-recurso' }] },
    { id: 'fx-4-recurso', title: '4.3 Recurso?', key: 'Recurso?', desc: 'Solicitante vai recorrer?', role: 'Solicitante / Sistema', paths: [{ key: 'Sim', value: 'fx-4-form-rec' }, { key: 'Não', value: 'fx-4-finalizado' }] },
    { id: 'fx-4-form-rec', title: '4.4 Formulário de Recurso', key: 'Formulario de Recurso', desc: 'Razões e anexos do estabelecimento.', role: 'Solicitante', form: 'form-nen-recurso', next: 'fx-4-provido', paths: [{ key: 'Apresentado', value: 'fx-4-provido' }] },
    { id: 'fx-4-provido', title: '4.5 Provido?', key: 'Provido?', desc: 'Julgamento do recurso pela autoridade.', role: 'Autoridade PROCON', form: 'form-nen-analise-decisao', paths: [{ key: 'Sim → Certificado', value: 'fx-5-template' }, { key: 'Não → Finalizado', value: 'fx-4-finalizado' }] },
    { id: 'fx-4-finalizado', title: '4.6 Finalizado', key: 'Finalizado', desc: 'Encerramento sem emissão (sem recurso ou recurso não provido).', role: 'Sistema', paths: [] },
  ]
  for (const n of decisao) {
    steps.push(
      bpmn({
        id: n.id,
        title: n.title,
        bpmnActivityKey: n.key,
        bpmnDescription: n.desc,
        assigneeRole: n.role,
        linkedFormId: n.form,
        bpmnPossiblePaths: n.paths,
        bpmnFormConfirmNavigateStepId: n.next,
        bpmnRuleList: n.rules,
        bpmnTaskType: n.key.includes('?') ? 'userTask' : 'entryForm',
      }),
    )
  }

  // ——— §5 Emissão ———
  steps.push(
    html(
      'fx-5-visao',
      '§5 Emissão — detalhe',
      'FigJam §5',
      eyebrow('Template Certificado + QR') +
        h1('Emissão do selo') +
        p('Do Template Certificado + QR saem, em paralelo no board: Validador MT, Classe Estabelecimentos com Selo, Notifica servidor, Notifica resultado ao solicitante, VIGENTE 12 meses (usar 24 no protótipo).'),
    ),
  )
  const emissao = [
    { id: 'fx-5-template', title: '5.1 Template Certificado + QR', key: 'Template Certificado + QR', desc: 'Gera certificado eletrônico do estabelecimento com QR.', role: 'Sistema / PROCON', form: 'form-nen-estabelecimento-selo', next: 'fx-5-validador', paths: [{ key: 'Emitido', value: 'fx-5-validador' }] },
    { id: 'fx-5-validador', title: '5.2 Validador MT', key: 'Validador MT', desc: 'QR aponta para consulta de autenticidade pelo cidadão.', role: 'Validador MT', form: 'form-nen-estabelecimento-selo', next: 'fx-5-classe', paths: [{ key: 'Publicado', value: 'fx-5-classe' }] },
    { id: 'fx-5-classe', title: '5.3 Classe Estabelecimentos com Selo', key: 'Classe Estabelecimentos com Selo', desc: 'Registra nome fantasia, CNPJ, endereço, município, número, datas, QR, status.', role: 'Sistema', form: 'form-nen-estabelecimento-selo', next: 'fx-5-notif-serv', paths: [{ key: 'Registrado', value: 'fx-5-notif-serv' }] },
    { id: 'fx-5-notif-serv', title: '5.4 Notifica servidor', key: 'Notifica servidor', desc: 'Notifica área/servidor PROCON do resultado.', role: 'Sistema', next: 'fx-5-notif-sol', paths: [{ key: 'Ok', value: 'fx-5-notif-sol' }] },
    { id: 'fx-5-notif-sol', title: '5.5 Notifica resultado ao solicitante', key: 'Notifica resultado ao solicitante', desc: 'Comunica deferimento e disponibiliza certificado.', role: 'Sistema', next: 'fx-5-vigente', paths: [{ key: 'Ok', value: 'fx-5-vigente' }] },
    { id: 'fx-5-vigente', title: '5.6 VIGENTE', key: 'VIGENTE (24 meses no protótipo)', desc: 'Status do selo = VIGENTE. Board marca 12 meses; minuta/PDF = 24 meses.', role: 'Sistema', form: 'form-nen-estabelecimento-selo', next: 'fx-6-aviso', paths: [{ key: 'Pós-concessão', value: 'fx-6-aviso' }], rules: ['Validade = concessão + 24 meses até decreto'] },
  ]
  for (const n of emissao) {
    steps.push(
      bpmn({
        id: n.id,
        title: n.title,
        bpmnActivityKey: n.key,
        bpmnDescription: n.desc,
        assigneeRole: n.role,
        linkedFormId: n.form,
        bpmnPossiblePaths: n.paths,
        bpmnFormConfirmNavigateStepId: n.next,
        bpmnRuleList: n.rules,
      }),
    )
  }

  // ——— §6 Pós ———
  steps.push(
    html(
      'fx-6-visao',
      '§6 Pós-concessão — detalhe',
      'FigJam §6',
      eyebrow('Notificação → Ação') +
        h1('Renovação, cancelamento e revogação') +
        ol([
          '<strong>Notificação próximo ao vencimento</strong>',
          '<strong>Ação:</strong> Renovar → Formulário de Renovação → volta a PROTOCOLADO',
          '<strong>Cancelar</strong> → CANCELADO → Sai da lista pública',
          '<strong>Revogar / somente backoffice</strong> → REVOGADO → Sai da lista pública',
        ]),
    ),
  )
  const pos = [
    { id: 'fx-6-aviso', title: '6.1 Notificação próximo ao vencimento', key: 'Notificacao proximo ao vencimento', desc: 'Avisa o estabelecimento sobre o vencimento do selo.', role: 'Sistema', form: 'form-nen-estabelecimento-selo', next: 'fx-6-acao', paths: [{ key: 'Ação', value: 'fx-6-acao' }] },
    { id: 'fx-6-acao', title: '6.2 Ação', key: 'Acao', desc: 'Diamante: Renovar / Cancelar / Revogar(backoffice).', role: 'Solicitante / PROCON', paths: [{ key: 'Renovar', value: 'fx-6-renovar' }, { key: 'Cancelar', value: 'fx-6-cancelar' }, { key: 'Revogar/somente backoffice', value: 'fx-6-revogar' }] },
    { id: 'fx-6-renovar', title: '6.3 Formulário de Renovação', key: 'Formulario de Renovacao', desc: 'Renovação pré-preenchida; protocola e reconecta a PROTOCOLADO (mesmo ciclo).', role: 'Solicitante', form: 'form-nen-renovacao', next: 'fx-2-protocolar', paths: [{ key: 'Protocolado → Análise', value: 'fx-3-analise' }] },
    { id: 'fx-6-cancelar', title: '6.4 Método Cancelamento', key: 'Metodo Cancelamento', desc: 'Cancelamento voluntário → CANCELADO (a pedido).', role: 'Solicitante', form: 'form-nen-cancelamento', next: 'fx-6-cancelado', paths: [{ key: 'Confirmado', value: 'fx-6-cancelado' }] },
    { id: 'fx-6-cancelado', title: '6.5 CANCELADO', key: 'CANCELADO', desc: 'Status CANCELADO A PEDIDO no modelo.', role: 'Sistema', next: 'fx-6-sai', paths: [{ key: 'Sai da lista', value: 'fx-6-sai' }] },
    { id: 'fx-6-revogar', title: '6.6 Método Revogação', key: 'Metodo Revogacao', desc: 'Somente backoffice PROCON: anexa decisão → REVOGADO. Sem módulo de denúncia no sistema.', role: 'PROCON backoffice', form: 'form-nen-revogacao', next: 'fx-6-revogado', paths: [{ key: 'Revogado', value: 'fx-6-revogado' }] },
    { id: 'fx-6-revogado', title: '6.7 REVOGADO', key: 'REVOGADO', desc: 'Status REVOGADO; QR deixa de indicar vigência.', role: 'Sistema', next: 'fx-6-sai', paths: [{ key: 'Sai da lista', value: 'fx-6-sai' }] },
    { id: 'fx-6-sai', title: '6.8 Sai da lista pública', key: 'Sai da lista publica', desc: 'Remove de vigentes/exportação/lista MVP após cancelamento ou revogação.', role: 'Sistema', form: 'form-nen-estabelecimento-selo', paths: [] },
  ]
  for (const n of pos) {
    steps.push(
      bpmn({
        id: n.id,
        title: n.title,
        bpmnActivityKey: n.key,
        bpmnDescription: n.desc,
        assigneeRole: n.role,
        linkedFormId: n.form,
        bpmnPossiblePaths: n.paths,
        bpmnFormConfirmNavigateStepId: n.next,
        bpmnTaskType: n.key === 'Acao' ? 'userTask' : 'entryForm',
      }),
    )
  }

  steps.push({
    id: 'fx-proto-portal',
    title: 'Protótipo — Portal',
    type: 'servicePortal',
    linkedPortalId: 'portal-nen-estabelecimentos',
    servicePortalPresentationDescription: 'Entrada do solicitante (login → solicitar / acompanhar).',
  })
  steps.push({
    id: 'fx-proto-ws',
    title: 'Protótipo — Workspace PROCON',
    type: 'workspace',
    linkedWorkspaceId: 'ws-nen-procon',
    workspacePresentationDescription: 'Área de trabalho: análise, Atender por status, selos e pós.',
  })

  steps.push(
    html(
      'fx-fechamento',
      'Conferência FigJam × protótipo',
      'Conferência',
      eyebrow('Verificação') +
        h1('O que o board tem × o que o protótipo detalha') +
        table(
          ['Nó FigJam', 'Protótipo / requisitos'],
          [
            ['MT Login → JUCEMAT → Seleciona', 'Tela Acesso + pré-preenchimento cadastral + doc. representação'],
            ['Formulário de Solicitação (1 nó)', '7 abas + capacitados + 11 procedimentos + câmeras condicionais'],
            ['Conclusão Não conforme / Pronto', 'Checklist por bloco + Atender por status + diligência 5 dias'],
            ['Overlay primeira análise…recurso', 'Métodos: Abrir diligência, Enviar para decisão, Deferir/Indeferir, Julgar recurso'],
            ['VIGENTE 12 meses', '24 meses no protótipo (divergência documentada)'],
            ['CANCELADO', 'CANCELADO A PEDIDO'],
            ['Revogar somente backoffice', 'Revogação com upload; sem denúncia no sistema'],
          ],
        ) +
        callout('Faixa no FigJam', 'Foi adicionada a faixa <strong>DETALHE A — Acesso e identificação</strong> (e demais faixas detalhe) abaixo do fluxo macro, sem apagar as 6 seções originais.', 'ok'),
    ),
  )

  return {
    id: 'flow-nen-fluxograma-detalhado',
    name: 'Fluxograma detalhado — FigJam ponta a ponta',
    metadata: `Espelhamento extremamente detalhado do FigJam ${FIGJAM} (seções 1–6 + overlay), com desdobramento de perguntas da solicitação e regras de análise/emissão/pós.`,
    steps,
  }
}

function main() {
  const flow = build()
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
    fs.writeFileSync(p, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
    console.log('wrote', p, 'flows=', next.length, 'steps=', flow.steps.length)
  }
}

main()
