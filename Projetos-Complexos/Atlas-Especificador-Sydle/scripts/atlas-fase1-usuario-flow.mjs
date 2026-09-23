/**
 * Apresentação de USUÁRIO de negócio — Fase 1 do Atlas.
 *
 * Linguagem simples, sem termos técnicos (sem ids, sem "classe/workspace/método/snapshot").
 * Não altera fluxo principal nem apresentação técnica de homologação.
 *
 * Todas as etapas são HTML para manter total controle visual e didático.
 */

/* ────────────────────────── helpers de estilo ────────────────────────── */

const BASE_FONT = 'Segoe UI, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif'

const COLORS = {
  primary: '#0c1ba8', // MTI azul institucional
  primarySoft: '#e0e7ff',
  accent: '#1e40af',
  success: '#047857',
  successSoft: '#ecfdf5',
  warn: '#92400e',
  warnSoft: '#fef3c7',
  danger: '#b91c1c',
  dangerSoft: '#fee2e2',
  neutral: '#475569',
  neutralSoft: '#f1f5f9',
  external: '#7c3aed',
  externalSoft: '#f3e8ff',
  finish: '#0f766e',
  finishSoft: '#ccfbf1',
  border: '#e2e8f0',
}

function shell(inner, { background = '#ffffff' } = {}) {
  return (
    `<div style="font-family:${BASE_FONT};color:#0f172a;background:${background};padding:32px;` +
    `max-width:960px;margin:0 auto;line-height:1.55;font-size:15px">${inner}</div>`
  )
}

function chip(text, color, bg) {
  return (
    `<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${bg};` +
    `color:${color};font-size:12px;font-weight:600;letter-spacing:.02em">${text}</span>`
  )
}

function card({ icon, title, body, color = COLORS.primary, bg = COLORS.primarySoft, footer = '' }) {
  return (
    `<div style="border-left:5px solid ${color};background:${bg};border-radius:10px;padding:18px 20px;margin:12px 0">` +
    `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">` +
    `<span style="font-size:1.4rem">${icon}</span>` +
    `<h3 style="margin:0;color:${color};font-size:1.05rem">${title}</h3>` +
    `</div>` +
    `<div style="color:#1f2937;font-size:14px">${body}</div>` +
    (footer ? `<div style="margin-top:10px;color:${color};font-size:12px;font-weight:600">${footer}</div>` : '') +
    `</div>`
  )
}

/* ────────────────────────── telas (HTML) ────────────────────────── */

const HTML_CAPA = shell(
  `<div style="text-align:center;padding:40px 24px;background:linear-gradient(135deg,${COLORS.primary} 0%,${COLORS.accent} 100%);color:#fff;border-radius:14px">` +
    `<p style="margin:0 0 8px;font-size:13px;opacity:.85;letter-spacing:.1em;text-transform:uppercase">Atlas · MTI</p>` +
    `<h1 style="margin:0 0 12px;font-size:2.4rem;letter-spacing:-.01em">Atlas — Fase 1</h1>` +
    `<p style="margin:0 0 24px;font-size:1.2rem;opacity:.95">Da proposta ao cadastro do contrato</p>` +
    `<p style="margin:0 auto;max-width:640px;font-size:1rem;line-height:1.6;opacity:.92">` +
    `Esta fase organiza o processo desde o registro da demanda até a finalização do cadastro contratual, ` +
    `passando por proposta, revisão, assinaturas, recebimento do contrato, conferências e notificações.` +
    `</p>` +
    `<div style="margin-top:28px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap">` +
    chip('Proposta', '#fff', 'rgba(255,255,255,.15)') +
    chip('Assinaturas', '#fff', 'rgba(255,255,255,.15)') +
    chip('Contrato', '#fff', 'rgba(255,255,255,.15)') +
    chip('Cadastro contratual', '#fff', 'rgba(255,255,255,.15)') +
    `</div>` +
    `</div>`,
  { background: '#f8fafc' },
)

const HTML_OBJETIVO = shell(
  `<h1 style="color:${COLORS.primary};margin:0 0 8px">Para que serve a Fase 1</h1>` +
    `<p style="color:${COLORS.neutral};margin:0 0 24px">É o ciclo de trabalho entre o pedido inicial do cliente e o contrato cadastrado no sistema.</p>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px">` +
    [
      ['📝', 'Registrar a demanda'],
      ['📦', 'Montar a proposta com produtos, licenças ou serviços'],
      ['👥', 'Revisar com a MTI e o parceiro, quando houver'],
      ['📄', 'Gerar o documento da proposta'],
      ['✍️', 'Coletar as assinaturas necessárias'],
      ['📤', 'Enviar a proposta ao cliente'],
      ['📥', 'Registrar o retorno do contrato'],
      ['🔍', 'Conferir se o contrato bate com a proposta'],
      ['🗂️', 'Criar o contrato em rascunho'],
      ['✅', 'Validar documentos e integrações'],
      ['🏁', 'Finalizar o cadastro contratual'],
      ['📣', 'Avisar cliente e pós-vendas'],
    ]
      .map(
        ([ic, txt]) =>
          `<div style="background:#fff;border:1px solid ${COLORS.border};border-radius:10px;padding:14px;display:flex;gap:10px;align-items:center">` +
          `<span style="font-size:1.4rem">${ic}</span><span style="font-size:14px">${txt}</span></div>`,
      )
      .join('') +
    `</div>`,
)

const HTML_DENTRO_FORA = shell(
  `<h1 style="color:${COLORS.primary};margin:0 0 8px">O que está dentro e fora da Fase 1</h1>` +
    `<p style="color:${COLORS.neutral};margin:0 0 24px">Outras etapas como execução, faturamento e BI completo serão tratadas nas fases seguintes.</p>` +
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">` +
    `<div style="background:${COLORS.successSoft};border:2px solid #a7f3d0;border-radius:12px;padding:18px">` +
    `<h2 style="margin:0 0 12px;color:${COLORS.success};font-size:1.05rem">✅ Dentro da Fase 1</h2>` +
    `<ul style="margin:0;padding-left:1.1rem;line-height:1.8;font-size:14px">` +
    [
      'Proposta',
      'Catálogo usado na proposta',
      'Documento da proposta',
      'Revisão MTI / parceiro',
      'Assinaturas',
      'Recebimento do contrato',
      'Revisão dos itens contratados',
      'Contrato em rascunho',
      'Checklist contratual',
      'Finalização do cadastro do contrato',
      'Notificação ao cliente e pós-vendas',
    ]
      .map((t) => `<li>${t}</li>`)
      .join('') +
    `</ul></div>` +
    `<div style="background:${COLORS.dangerSoft};border:2px solid #fecaca;border-radius:12px;padding:18px">` +
    `<h2 style="margin:0 0 12px;color:${COLORS.danger};font-size:1.05rem">⛔ Fora da Fase 1</h2>` +
    `<ul style="margin:0;padding-left:1.1rem;line-height:1.8;font-size:14px">` +
    [
      'Execução de ordem de serviço',
      'Homologação de entrega',
      'RAER operacional completo',
      'Nota fiscal',
      'DAR',
      'Pagamento',
      'BI completo',
      'Painel completo do cliente',
      'Gestão avançada de catálogo (Fase 3)',
    ]
      .map((t) => `<li>${t}</li>`)
      .join('') +
    `</ul></div>` +
    `</div>`,
)

function stepBox({ n, title, color = COLORS.primary, bg = COLORS.primarySoft }) {
  return (
    `<div style="background:${bg};border:1px solid ${color}22;border-left:4px solid ${color};border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:10px">` +
    `<span style="background:${color};color:#fff;font-weight:700;font-size:12px;width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${n}</span>` +
    `<span style="font-size:13px;color:#1f2937">${title}</span>` +
    `</div>`
  )
}

const HTML_FLUXO_18 = shell(
  `<h1 style="color:${COLORS.primary};margin:0 0 8px">Os 18 passos do processo</h1>` +
    `<p style="color:${COLORS.neutral};margin:0 0 18px">O processo principal tem 18 passos. Os retornos por ajuste ou reprovação <strong>não são passos novos</strong> — apenas fazem o processo voltar para uma etapa anterior.</p>` +
    // Legenda
    `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;font-size:12px">` +
    chip('Etapa normal', COLORS.primary, COLORS.primarySoft) +
    chip('Decisão / revisão', COLORS.warn, COLORS.warnSoft) +
    chip('Etapa externa (cliente)', COLORS.external, COLORS.externalSoft) +
    chip('Finalização', COLORS.finish, COLORS.finishSoft) +
    `</div>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px">` +
    [
      [1, 'Início', COLORS.primary, COLORS.primarySoft],
      [2, 'Registrar demanda', COLORS.primary, COLORS.primarySoft],
      [3, 'Selecionar itens de catálogo', COLORS.primary, COLORS.primarySoft],
      [4, 'Montar documento da proposta', COLORS.primary, COLORS.primarySoft],
      [5, 'Conferir prévia da proposta', COLORS.primary, COLORS.primarySoft],
      [6, 'Revisar proposta com MTI e parceiro', COLORS.warn, COLORS.warnSoft],
      [7, 'Assinar pela DIRC / parceiro', COLORS.warn, COLORS.warnSoft],
      [8, 'Assinar pela DTIC', COLORS.warn, COLORS.warnSoft],
      [9, 'Assinar pela Presidência', COLORS.warn, COLORS.warnSoft],
      [10, 'Enviar proposta ao cliente', COLORS.primary, COLORS.primarySoft],
      [11, 'Aguardar retorno do contrato', COLORS.external, COLORS.externalSoft],
      [12, 'Registrar contrato recebido', COLORS.primary, COLORS.primarySoft],
      [13, 'Revisar itens contratados', COLORS.warn, COLORS.warnSoft],
      [14, 'Criar contrato em rascunho', COLORS.primary, COLORS.primarySoft],
      [15, 'Conferir checklist contratual', COLORS.warn, COLORS.warnSoft],
      [16, 'Finalizar cadastro contratual', COLORS.primary, COLORS.primarySoft],
      [17, 'Avisar cliente e pós-vendas', COLORS.primary, COLORS.primarySoft],
      [18, 'Fim da Fase 1', COLORS.finish, COLORS.finishSoft],
    ]
      .map(([n, t, c, b]) => stepBox({ n, title: t, color: c, bg: b }))
      .join('') +
    `</div>`,
)

const HTML_RETORNOS = shell(
  `<h1 style="color:${COLORS.primary};margin:0 0 8px">Quando o processo volta atrás</h1>` +
    `<p style="color:${COLORS.neutral};margin:0 0 18px">Os retornos não são passos novos — o sistema simplesmente leva a proposta de volta para uma etapa anterior, para corrigir.</p>` +
    card({
      icon: '🔁',
      title: 'Ajuste de itens',
      body:
        '<p style="margin:0 0 6px">Quando produto, serviço, quantidade, valor ou catálogo precisam ser corrigidos.</p>' +
        '<p style="margin:0;color:' + COLORS.warn + ';font-weight:600">Volta para: «Selecionar itens de catálogo».</p>',
      color: COLORS.warn,
      bg: COLORS.warnSoft,
    }) +
    card({
      icon: '🔁',
      title: 'Ajuste do documento',
      body:
        '<p style="margin:0 0 6px">Quando texto, escopo ou documento da proposta precisam ser corrigidos.</p>' +
        '<p style="margin:0;color:' + COLORS.warn + ';font-weight:600">Volta para: «Montar documento da proposta».</p>',
      color: COLORS.warn,
      bg: COLORS.warnSoft,
    }) +
    card({
      icon: '✍️',
      title: 'Durante as assinaturas',
      body:
        '<ul style="margin:0;padding-left:1.2rem;line-height:1.7">' +
        '<li>Se cada assinante <strong>assinar</strong>, o processo segue.</li>' +
        '<li>Se alguém <strong>reprovar</strong> ou pedir <strong>ajuste</strong>, volta para «Revisar proposta com MTI e parceiro».</li>' +
        '</ul>',
      color: COLORS.primary,
      bg: COLORS.primarySoft,
    }),
)

const HTML_PAPEIS = shell(
  `<h1 style="color:${COLORS.primary};margin:0 0 8px">Quem participa</h1>` +
    `<p style="color:${COLORS.neutral};margin:0 0 18px">Cada papel atua em momentos específicos do processo.</p>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">` +
    [
      {
        icon: '🏢',
        title: 'MTI / DIRC',
        items: ['registra a demanda', 'monta a proposta', 'revisa', 'acompanha as assinaturas', 'recebe o contrato', 'finaliza o cadastro'],
      },
      {
        icon: '🤝',
        title: 'Parceiro',
        items: ['participa quando a proposta envolve produto ou serviço de parceria', 'revisa sua parte', 'assina quando necessário'],
      },
      {
        icon: '💻',
        title: 'DTIC',
        items: ['faz a concordância técnica', 'assina quando a proposta exige validação técnica'],
      },
      {
        icon: '🏛️',
        title: 'Presidência',
        items: ['faz aprovação superior quando prevista no fluxo'],
      },
      {
        icon: '👤',
        title: 'Cliente',
        items: ['recebe a proposta', 'conduz a contratação fora do sistema', 'devolve o contrato para a MTI'],
      },
      {
        icon: '📞',
        title: 'Pós-vendas',
        items: ['é acionado após o contrato ser cadastrado', 'prepara o próximo passo de acompanhamento / kickoff'],
      },
    ]
      .map(
        (p) =>
          `<div style="background:#fff;border:1px solid ${COLORS.border};border-radius:12px;padding:16px">` +
          `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">` +
          `<span style="font-size:1.4rem">${p.icon}</span>` +
          `<h3 style="margin:0;color:${COLORS.primary};font-size:1rem">${p.title}</h3>` +
          `</div>` +
          `<ul style="margin:0;padding-left:1.1rem;font-size:13.5px;line-height:1.7">` +
          p.items.map((it) => `<li>${it}</li>`).join('') +
          `</ul></div>`,
      )
      .join('') +
    `</div>`,
)

function blockSection({ n, title, color, bg, steps, explain }) {
  return shell(
    `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">` +
      chip(`Bloco ${n}`, color, bg) +
      `</div>` +
      `<h1 style="color:${color};margin:0 0 8px">${title}</h1>` +
      `<p style="color:${COLORS.neutral};margin:0 0 18px;font-size:15.5px">${explain}</p>` +
      `<div style="background:${bg};border-radius:12px;padding:18px;border:1px solid ${color}22">` +
      `<p style="margin:0 0 10px;font-size:12px;font-weight:700;color:${color};letter-spacing:.06em;text-transform:uppercase">Etapas deste bloco</p>` +
      `<ol style="margin:0;padding-left:1.25rem;line-height:1.9;font-size:15px">` +
      steps.map((s) => `<li>${s}</li>`).join('') +
      `</ol></div>`,
  )
}

const HTML_BLOCO_1 = blockSection({
  n: 1,
  title: 'Começo da proposta',
  color: COLORS.primary,
  bg: COLORS.primarySoft,
  steps: ['Registrar demanda', 'Selecionar itens de catálogo', 'Montar documento da proposta', 'Conferir prévia'],
  explain:
    'Nesta parte, a MTI registra o que o cliente precisa, escolhe os produtos, licenças ou serviços, monta o documento da proposta e confere a prévia antes da revisão.',
})

const HTML_BLOCO_2 = blockSection({
  n: 2,
  title: 'Revisão e ajustes',
  color: COLORS.warn,
  bg: COLORS.warnSoft,
  steps: ['Revisão MTI e parceiro', 'Retorno para ajuste de itens (se necessário)', 'Retorno para ajuste de documento (se necessário)'],
  explain:
    'A proposta é conferida. Se algo estiver errado, volta para correção. Se estiver tudo certo, segue para assinatura.',
})

const HTML_BLOCO_3 = blockSection({
  n: 3,
  title: 'Assinaturas',
  color: COLORS.warn,
  bg: COLORS.warnSoft,
  steps: ['Assinatura DIRC / parceiro', 'Assinatura DTIC', 'Assinatura Presidência'],
  explain:
    'A proposta passa pelas assinaturas necessárias. Cada área assina ou solicita ajuste. O processo só avança quando as assinaturas obrigatórias forem concluídas.',
})

const HTML_BLOCO_4 = blockSection({
  n: 4,
  title: 'Envio e espera do contrato',
  color: COLORS.external,
  bg: COLORS.externalSoft,
  steps: ['Enviar proposta ao cliente', 'Aguardar retorno do contrato (processo externo)'],
  explain:
    'Depois de aprovada e assinada, a proposta é enviada ao cliente. A contratação do cliente ocorre fora do Atlas — o sistema apenas aguarda o retorno do contrato.',
})

const HTML_BLOCO_5 = blockSection({
  n: 5,
  title: 'Recebimento e revisão do contrato',
  color: COLORS.primary,
  bg: COLORS.primarySoft,
  steps: ['Registrar contrato recebido', 'Revisar itens contratados'],
  explain:
    'Quando o contrato retorna, a MTI registra o documento e verifica se os itens contratados estão iguais à proposta. Se houver diferença, é necessário justificar.',
})

const HTML_BLOCO_6 = blockSection({
  n: 6,
  title: 'Cadastro contratual',
  color: COLORS.primary,
  bg: COLORS.primarySoft,
  steps: ['Criar contrato em rascunho', 'Conferir checklist contratual', 'Finalizar cadastro contratual'],
  explain:
    'O contrato é criado inicialmente como rascunho. Antes de finalizar, o sistema confere documentos, itens, publicação e status das integrações.',
})

const HTML_BLOCO_7 = blockSection({
  n: 7,
  title: 'Encerramento',
  color: COLORS.finish,
  bg: COLORS.finishSoft,
  steps: ['Avisar cliente e pós-vendas', 'Fim da Fase 1'],
  explain:
    'Com o cadastro finalizado, o cliente é notificado e o pós-vendas é acionado para os próximos acompanhamentos.',
})

const HTML_REGRAS = shell(
  `<h1 style="color:${COLORS.primary};margin:0 0 8px">Regras importantes</h1>` +
    `<p style="color:${COLORS.neutral};margin:0 0 18px">As regras abaixo orientam o que o processo permite, exige ou impede em cada momento.</p>` +
    `<ol style="margin:0;padding-left:0;list-style:none;display:grid;gap:8px">` +
    [
      'A proposta só segue para assinatura depois de revisada.',
      'Se houver parceiro envolvido, ele participa da revisão e assinatura.',
      'Se não houver parceiro, essa etapa é dispensada.',
      'Se uma assinatura obrigatória estiver pendente, o processo não avança.',
      'Se alguém pedir ajuste, a proposta volta para revisão.',
      'O contrato recebido pode ser diferente da proposta, mas a diferença precisa ser justificada.',
      'O contrato começa como rascunho antes de ser finalizado.',
      'O cadastro só é finalizado depois do checklist validado.',
      'As integrações com Protheus e ServiceNow precisam ter status conhecido.',
      'As integrações não precisam estar concluídas na Fase 1, mas precisam ser rastreáveis.',
      'Os dados do catálogo usados na proposta ficam guardados na proposta.',
      'Os dados contratados ficam guardados no contrato.',
    ]
      .map(
        (txt, i) =>
          `<li style="background:#fff;border:1px solid ${COLORS.border};border-left:4px solid ${COLORS.primary};border-radius:8px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start">` +
          `<span style="background:${COLORS.primary};color:#fff;font-weight:700;width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px">${i + 1}</span>` +
          `<span style="font-size:14px">${txt}</span></li>`,
      )
      .join('') +
    `</ol>`,
)

const HTML_CATALOGO = shell(
  `<h1 style="color:${COLORS.primary};margin:0 0 8px">Por que o sistema guarda os dados do catálogo?</h1>` +
    `<div style="background:${COLORS.primarySoft};border-left:5px solid ${COLORS.primary};padding:20px;border-radius:10px;margin-bottom:18px">` +
    `<p style="margin:0 0 12px;font-size:15.5px">Quando um item do catálogo é usado em uma proposta, o sistema <strong>guarda uma cópia dos dados daquele momento</strong>:</p>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">` +
    ['Descrição', 'Código', 'Métrica', 'Valor', 'Recorrência', 'Versão do catálogo']
      .map((t) => `<span style="background:#fff;padding:8px 12px;border-radius:6px;text-align:center;font-size:13px;font-weight:600;color:${COLORS.primary}">${t}</span>`)
      .join('') +
    `</div></div>` +
    `<div style="background:${COLORS.warnSoft};border-left:5px solid ${COLORS.warn};padding:16px 20px;border-radius:10px">` +
    `<p style="margin:0;font-size:15px">📌 <strong>Por quê?</strong> O catálogo pode mudar no futuro, mas a proposta antiga precisa continuar mostrando os dados que foram usados quando ela foi criada.</p>` +
    `</div>`,
)

const HTML_CHECKLIST = shell(
  `<h1 style="color:${COLORS.primary};margin:0 0 8px">O que o checklist confere antes de finalizar o contrato?</h1>` +
    `<p style="color:${COLORS.neutral};margin:0 0 18px">Sem o checklist validado, o contrato <strong>não pode</strong> ser finalizado.</p>` +
    `<div style="display:grid;gap:8px">` +
    [
      'Existe proposta vinculada?',
      'O contrato retornou do cliente?',
      'O contrato está em rascunho?',
      'O cliente está cadastrado?',
      'Os itens contratados foram revisados?',
      'Existe extrato de publicação?',
      'A data de publicação foi informada?',
      'O status do Protheus foi registrado?',
      'O status do ServiceNow foi registrado?',
      'Há justificativa quando alguma integração estiver pendente, com erro, não enviada ou dispensada?',
    ]
      .map(
        (q) =>
          `<div style="background:#fff;border:1px solid ${COLORS.border};border-radius:8px;padding:12px 14px;display:flex;gap:12px;align-items:center">` +
          `<span style="font-size:1.3rem">☑️</span><span style="font-size:14px">${q}</span></div>`,
      )
      .join('') +
    `</div>`,
)

function statusBadge(label, color, bg) {
  return (
    `<div style="background:${bg};color:${color};border-radius:8px;padding:10px 14px;text-align:center;font-weight:600;font-size:13.5px">${label}</div>`
  )
}

const HTML_INTEGRACAO = shell(
  `<h1 style="color:${COLORS.primary};margin:0 0 8px">O que significa status de integração?</h1>` +
    `<p style="color:${COLORS.neutral};margin:0 0 18px">Na Fase 1, o sistema não precisa concluir todas as integrações automaticamente. O mais importante é <strong>registrar a situação</strong> de cada integração.</p>` +
    `<h3 style="color:${COLORS.primary};margin:18px 0 10px;font-size:1rem">Status possíveis</h3>` +
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">` +
    [
      statusBadge('Não enviado', COLORS.neutral, COLORS.neutralSoft),
      statusBadge('Pendente', COLORS.warn, COLORS.warnSoft),
      statusBadge('Enviado', COLORS.primary, COLORS.primarySoft),
      statusBadge('Confirmado', COLORS.success, COLORS.successSoft),
      statusBadge('Erro', COLORS.danger, COLORS.dangerSoft),
      statusBadge('Reprocessado', COLORS.accent, COLORS.primarySoft),
      statusBadge('Dispensado', COLORS.neutral, COLORS.neutralSoft),
    ].join('') +
    `</div>` +
    `<div style="margin-top:22px;background:${COLORS.warnSoft};border-left:5px solid ${COLORS.warn};padding:16px 20px;border-radius:10px">` +
    `<p style="margin:0;font-size:15px">⚠️ Se o status indicar <strong>problema</strong> ou <strong>pendência</strong> (Pendente, Erro, Não enviado, Dispensado), o usuário precisa informar uma <strong>justificativa</strong>.</p>` +
    `</div>`,
)

const HTML_FIM = shell(
  `<div style="text-align:center;padding:32px;background:linear-gradient(135deg,${COLORS.finish} 0%,${COLORS.success} 100%);color:#fff;border-radius:14px">` +
    `<p style="margin:0 0 8px;font-size:13px;letter-spacing:.1em;text-transform:uppercase;opacity:.9">Fim da Fase 1</p>` +
    `<h1 style="margin:0 0 16px;font-size:2.2rem">Fase 1 concluída</h1>` +
    `<p style="margin:0 auto 24px;max-width:680px;line-height:1.6;opacity:.95">` +
    `Ao final da Fase 1, o Atlas terá registrado a <strong>proposta</strong>, os <strong>documentos</strong>, as <strong>assinaturas</strong>, ` +
    `o <strong>contrato recebido</strong>, a <strong>revisão dos itens</strong>, o <strong>checklist</strong> e o <strong>cadastro contratual finalizado</strong>.` +
    `</p>` +
    `<div style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);padding:18px;border-radius:10px;max-width:680px;margin:0 auto">` +
    `<p style="margin:0;font-size:14.5px;line-height:1.7">A partir desse ponto, outras fases poderão tratar:</p>` +
    `<div style="margin-top:12px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap">` +
    ['Execução de OS', 'Homologação', 'Faturamento', 'Pagamentos', 'BI', 'Painel completo do cliente']
      .map((t) => chip(t, '#fff', 'rgba(255,255,255,.18)'))
      .join('') +
    `</div></div></div>`,
  { background: '#f8fafc' },
)

/* ────────────────────────── definição do fluxo ────────────────────────── */

function htmlStep(id, title, headerTitle, htmlContent) {
  return {
    id,
    title,
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: headerTitle,
    htmlContent,
  }
}

export const flowFase1Usuario = {
  id: 'flow-atlas-fase1-usuario',
  name: 'Atlas — Fase 1: Da proposta ao cadastro do contrato',
  steps: [
    htmlStep('step-f1u-capa', '1. Capa', 'Atlas — Fase 1', HTML_CAPA),
    htmlStep('step-f1u-objetivo', '2. Objetivo da Fase 1', 'Para que serve', HTML_OBJETIVO),
    htmlStep('step-f1u-dentro-fora', '3. Dentro e fora da Fase 1', 'Escopo', HTML_DENTRO_FORA),
    htmlStep('step-f1u-fluxo-18', '4. Visão geral do fluxo (18 passos)', 'Fluxo geral', HTML_FLUXO_18),
    htmlStep('step-f1u-retornos', '5. Quando o processo volta atrás', 'Retornos', HTML_RETORNOS),
    htmlStep('step-f1u-papeis', '6. Quem participa', 'Papéis', HTML_PAPEIS),
    htmlStep('step-f1u-bloco-1', '7.1 Bloco 1 — Começo da proposta', 'Bloco 1', HTML_BLOCO_1),
    htmlStep('step-f1u-bloco-2', '7.2 Bloco 2 — Revisão e ajustes', 'Bloco 2', HTML_BLOCO_2),
    htmlStep('step-f1u-bloco-3', '7.3 Bloco 3 — Assinaturas', 'Bloco 3', HTML_BLOCO_3),
    htmlStep('step-f1u-bloco-4', '7.4 Bloco 4 — Envio e espera do contrato', 'Bloco 4', HTML_BLOCO_4),
    htmlStep('step-f1u-bloco-5', '7.5 Bloco 5 — Recebimento e revisão do contrato', 'Bloco 5', HTML_BLOCO_5),
    htmlStep('step-f1u-bloco-6', '7.6 Bloco 6 — Cadastro contratual', 'Bloco 6', HTML_BLOCO_6),
    htmlStep('step-f1u-bloco-7', '7.7 Bloco 7 — Encerramento', 'Bloco 7', HTML_BLOCO_7),
    htmlStep('step-f1u-regras', '8. Regras importantes', 'Regras', HTML_REGRAS),
    htmlStep('step-f1u-catalogo', '9. Por que guardar os dados do catálogo', 'Catálogo na proposta', HTML_CATALOGO),
    htmlStep('step-f1u-checklist', '10. O que o checklist confere', 'Checklist contratual', HTML_CHECKLIST),
    htmlStep('step-f1u-integracao', '11. Status de integração', 'Integração', HTML_INTEGRACAO),
    htmlStep('step-f1u-fim', '12. Fim da apresentação', 'Conclusão', HTML_FIM),
  ],
}

export const usuarioFlows = [flowFase1Usuario]
