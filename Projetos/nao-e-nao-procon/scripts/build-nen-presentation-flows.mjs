/**
 * Gera flows.json de apresentação sênior — Selo Não é Não (Seplag v1).
 * Fonte de verdade: forms/workspaces/class-groups/portals + requisitos exportados.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const EPIC_PATHS = [
  path.join(ROOT, 'data/subprojects/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1'),
  path.join(ROOT, 'data/subprojects/nao-e-nao-seplag/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1'),
  path.resolve(
    ROOT,
    '../Projetos-Complexos/Atlas-Especificador-Sydle/data/subprojects/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1',
  ),
  path.resolve(
    ROOT,
    '../Projetos-Complexos/nao-e-nao-seplag/data/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1',
  ),
]

const C = {
  brand: '#9d174d',
  brandSoft: '#fdf2f8',
  ink: '#0f172a',
  muted: '#475569',
  border: '#e2e8f0',
  ok: '#166534',
  okBg: '#f0fdf4',
  warn: '#b45309',
  warnBg: '#fffbeb',
  info: '#1e4b9e',
  infoBg: '#e8eef8',
  slateBg: '#f8fafc',
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wrap(inner) {
  return `<div style="padding:24px 40px 48px;max-width:1040px;margin:0 auto;font-family:Segoe UI,Inter,system-ui,sans-serif;color:${C.ink};line-height:1.55;font-size:14px;">${inner}</div>`
}

function eyebrow(t) {
  return `<div style="font-size:0.72rem;color:${C.brand};font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px;">${esc(t)}</div>`
}

function h1(t) {
  return `<h1 style="font-size:1.55rem;margin:0 0 10px;color:${C.brand};line-height:1.25;">${esc(t)}</h1>`
}

function lead(t) {
  return `<p style="margin:0 0 16px;color:${C.muted};font-size:0.98rem;">${t}</p>`
}

function callout(title, body, tone = 'brand') {
  const map = {
    brand: { border: C.brand, bg: C.brandSoft },
    warn: { border: C.warn, bg: C.warnBg },
    ok: { border: C.ok, bg: C.okBg },
    info: { border: C.info, bg: C.infoBg },
    slate: { border: '#64748b', bg: C.slateBg },
  }
  const t = map[tone] || map.brand
  return `<div style="border-left:4px solid ${t.border};background:${t.bg};padding:12px 16px;border-radius:8px;margin:0 0 12px;"><strong style="display:block;margin-bottom:4px;">${esc(title)}</strong><div style="color:#334155;font-size:0.92rem;">${body}</div></div>`
}

function table(headers, rows) {
  const th = headers
    .map(
      (h) =>
        `<th style="padding:8px 10px;text-align:left;background:${C.brand};color:#fff;font-size:11px;font-weight:600;vertical-align:top;">${esc(h)}</th>`,
    )
    .join('')
  const tr = rows
    .map((r, i) => {
      const bg = i % 2 ? C.slateBg : '#fff'
      const tds = r
        .map(
          (c) =>
            `<td style="padding:7px 10px;border-bottom:1px solid ${C.border};font-size:12.5px;vertical-align:top;color:#334155;">${c}</td>`,
        )
        .join('')
      return `<tr style="background:${bg}">${tds}</tr>`
    })
    .join('')
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0 14px;"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`
}

function ul(items) {
  return `<ul style="margin:6px 0 14px;padding-left:18px;color:#334155;">${items
    .map((i) => `<li style="margin:0 0 4px;">${i}</li>`)
    .join('')}</ul>`
}

function ol(items) {
  return `<ol style="margin:6px 0 14px;padding-left:18px;color:#334155;">${items
    .map((i) => `<li style="margin:0 0 4px;">${i}</li>`)
    .join('')}</ol>`
}

function fieldFlags(f) {
  const bits = []
  if (f.required) bits.push('obrig.')
  if (f.readOnly) bits.push('somente leitura')
  if (f.hidden) bits.push('oculto/condicional')
  if (f.relevance === 'identity') bits.push('identidade')
  if (f.relevance === 'highlight') bits.push('destaque')
  return bits.length ? bits.join(' · ') : '—'
}

function htmlStep(id, title, headerTitle, bodyHtml) {
  return {
    id,
    title,
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: headerTitle,
    htmlContent: wrap(bodyHtml),
  }
}

function buildFlow(forms, portals, workspaces, classGroups) {
  const byId = Object.fromEntries(forms.map((f) => [f.id, f]))

  function formFieldRows(formId, sectionId) {
    const f = byId[formId]
    if (!f) return []
    return (f.fields || [])
      .filter((x) => (sectionId ? x.sectionId === sectionId : true))
      .map((x) => [
        esc(x.label || x.id),
        esc(x.type),
        fieldFlags(x),
        esc((x.spec || '').slice(0, 140) || '—'),
      ])
  }

  function sectionCatalog(formId) {
    const f = byId[formId]
    if (!f?.sections?.length) return callout('Estrutura', 'Campos sem abas (layout único).', 'slate')
    const rows = f.sections.map((s) => {
      const n = (f.fields || []).filter((x) => x.sectionId === s.id).length
      const parent = s.parentSectionId
        ? f.sections.find((p) => p.id === s.parentSectionId)?.title || s.parentSectionId
        : '—'
      return [esc(s.title || s.id), esc(parent), String(n), esc(s.icon || '—')]
    })
    return table(['Aba / seção', 'Pai', 'Campos', 'Ícone'], rows)
  }

  function methodsTable(formId) {
    const f = byId[formId]
    const ms = f?.methods || []
    if (!ms.length) return callout('Métodos', 'Nenhum método nesta classe (modal / peça satélite).', 'slate')
    return table(
      ['Método', 'Peça de entrada', 'Função'],
      ms.map((m) => [
        `<strong>${esc(m.name || m.id)}</strong>`,
        esc(m.inputFormId || '—'),
        esc((m.metadata || m.description || '').slice(0, 120) || 'Ação de negócio no protótipo'),
      ]),
    )
  }

  const steps = []

  // ——— 0. Capa ———
  steps.push(
    htmlStep(
      'step-nen-capa',
      'Capa',
      'Não é Não — Seplag v1',
      eyebrow('Apresentação de requisitos · Arquitetura de solução') +
        h1('Selo “Não é Não – Mulheres Seguras”') +
        lead(
          'Protótipo Atlas Espec completo: <strong>1 serviço</strong>, 12 classes, portal do estabelecimento, workspace PROCON, modal Atender por status e ciclo pós-concessão.',
        ) +
        callout(
          'Objetivo desta apresentação',
          'Permitir validação com negócio e TI: o que entra no MVP, como as telas se organizam (abas/campos/métodos), a máquina de status e as integrações (MT Login, JUCEMAT, Validador MT).',
          'brand',
        ) +
        ol([
          'Visão, escopo e arquitetura',
          'Mapa de classes, status e canais',
          'Detalhamento ponta a ponta (campos por aba)',
          'Atender (modal por status) + emissão + pós-concessão',
          'Pendências de negócio e próximos passos',
        ]) +
        callout(
          'FigJam de referência',
          '<a href="https://www.figma.com/board/txWrswjvhQUdxYb1Ojmdtl/PROCON-Nao-e-Nao---Fluxo-Completo-LR" target="_blank" rel="noreferrer">PROCON Não é Não — Fluxo Completo LR</a> · decisões 03/09, 10/09 e 18/09.',
          'info',
        ),
    ),
  )

  // ——— 1. Fontes ———
  steps.push(
    htmlStep(
      'step-nen-fontes',
      'Fontes e decisões',
      'Governança',
      eyebrow('Rastreabilidade') +
        h1('De onde veio o protótipo') +
        table(
          ['Fonte', 'O que fechou'],
          [
            ['FigJam Fluxo Completo LR', '6 seções macro (acesso → pós)'],
            ['Reunião 03/09', 'Validador MT, JUCEMAT, validade 24 meses na minuta'],
            ['Reunião 10/09', '1 serviço; sem denúncia no sistema; revogação operacional'],
            ['PDF fluxo 04/09', 'Textos literais dos campos da solicitação'],
            ['Reunião 18/09', 'Estrutura da solicitação; cartaz no analista; fachada'],
            ['Auditoria Atlas', 'Remoção Pessoa-*; Atender por status; analytics MVP'],
          ],
        ) +
        callout(
          'Divergência tratada — validade',
          'FigJam marca <strong>12 meses</strong>; minuta/PDF/ata = <strong>24 meses</strong>. Protótipo e requisitos usam <strong>24 meses</strong> até o decreto fechar (parâmetro configurável).',
          'warn',
        ),
    ),
  )

  // ——— 2. Escopo ———
  steps.push(
    htmlStep(
      'step-nen-escopo',
      'Escopo (in / out)',
      'Escopo',
      eyebrow('Ata 10/09 + FigJam') +
        h1('Um serviço — fronteiras claras') +
        callout(
          'No MVP / FigJam',
          'Acesso (MT Login + JUCEMAT), solicitação, pré-análise, diligência (5 dias), decisão, recurso, emissão (selo + QR), renovação, cancelamento a pedido, revogação backoffice, lista/exportação MVP.',
          'ok',
        ) +
        callout(
          'Fora desta entrega',
          'Módulo de denúncia/fiscalização/apuração; integração Sigadoc; Procon Digital; API pública da lista em outros sites; arte final SECOM / Gabinete da Mulher.',
          'slate',
        ) +
        callout(
          'Curso ≠ Selo',
          'Certificado do capacitado = Escola de Governo (fora). Selo = estabelecimento, nasce só no <strong>deferimento</strong> / recurso provido.',
          'info',
        ),
    ),
  )

  // ——— 3. Arquitetura ———
  steps.push(
    htmlStep(
      'step-nen-arquitetura',
      'Arquitetura da solução',
      'Arquitetura',
      eyebrow('Visão de solução') +
        h1('Canais, papéis e núcleo de classes') +
        table(
          ['Canal', 'Ator', 'Classes / artefatos'],
          [
            [
              'Portal estabelecimento',
              'Solicitante autenticado',
              'Acesso → Solicitação (+ Capacitado) → Ajustes → Recurso → Renovação / Cancelamento',
            ],
            [
              'Workspace PROCON',
              'Analista / Autoridade',
              'Análise e Decisão (+ modal <strong>Atender</strong>) → Selo → Revogação → Analytics',
            ],
            ['Validador MT', 'Cidadão', 'Consulta autenticidade via QR do certificado'],
            ['JUCEMAT / MT Login', 'Sistema', 'Identidade e lista de estabelecimentos elegíveis'],
          ],
        ) +
        callout(
          'Padrão Sydle no protótipo',
          'Classe de trabalho <code>form-nen-analise-decisao</code> concentra o processo; método <strong>Atender</strong> abre <code>form-nen-atender</code> com abas filtradas por status (fieldVisibilityRules). Peças satélite: Ajustes e Recurso.',
          'brand',
        ) +
        lead('Grupos de classes no especificador:') +
        table(
          ['Grupo', 'Classes'],
          (classGroups?.groups || []).map((g) => {
            const members = (classGroups.memberOrderByGroup?.[g.id] || [])
              .map((id) => byId[id]?.name || id)
              .join(', ')
            return [esc(g.name), esc(members)]
          }),
        ),
    ),
  )

  // ——— 4. Mapa de classes ———
  steps.push(
    htmlStep(
      'step-nen-mapa-classes',
      'Mapa completo de classes',
      'Protótipo',
      eyebrow('Inventário do épico') +
        h1('12 classes modeladas') +
        table(
          ['ID', 'Classe', 'Abas', 'Campos', 'Métodos'],
          forms.map((f) => [
            `<code style="font-size:11px">${esc(f.id)}</code>`,
            esc(f.name),
            String(f.sections?.length || 0),
            String(f.fields?.length || 0),
            String(f.methods?.length || 0),
          ]),
        ) +
        callout(
          'Identidade visual no processo',
          'Na Análise e Decisão: <strong>Nome do estabelecimento</strong> = tag de identidade; Status + Prazo restante = destaques coloridos.',
          'info',
        ),
    ),
  )

  // ——— 5. Status ———
  steps.push(
    htmlStep(
      'step-nen-status',
      'Máquina de status',
      'RQ.002 / RQ.003',
      eyebrow('Processo + selo') +
        h1('Status do pedido e do selo') +
        lead('<strong>Pedido (Solicitação / Análise):</strong>') +
        ol([
          '<strong>RASCUNHO</strong> — preenchimento no portal',
          '<strong>PROTOCOLADO</strong> — após Protocolar (gera nº + comprovante)',
          '<strong>AGUARDANDO ATENDIMENTO</strong> — fila PROCON',
          '<strong>EM ANÁLISE</strong> — checklist / cartaz / apoio',
          '<strong>EM DILIGÊNCIA</strong> — peça de ajustes (5 dias)',
          '<strong>DILIGÊNCIA RESPONDIDA</strong> | <strong>DILIGÊNCIA NÃO RESPONDIDA</strong>',
          '<strong>PRONTO PARA DECISÃO</strong> — autoridade',
          '<strong>DEFERIDO</strong> | <strong>INDEFERIDO</strong>',
          '<strong>EM RECURSO</strong> → julgamento → emissão ou <strong>FINALIZADO</strong>',
        ]) +
        lead('<strong>Selo (Estabelecimentos com Selo):</strong>') +
        ul([
          '<strong>VIGENTE</strong> → <strong>EXPIRADO</strong> | <strong>CANCELADO A PEDIDO</strong> | <strong>REVOGADO</strong>',
          'Validade = concessão + <strong>24 meses</strong>',
          'Cancelamento/revogação → sai da lista pública / relatório de vigentes',
        ]) +
        callout(
          'Regras-chave',
          ul([
            'Diligência <strong>única</strong> (todas as pendências de uma vez)',
            'Sem resposta ≠ indeferimento automático',
            'Não deferir com item obrigatório “não conforme”',
            'Prazo de análise até 30 dias (minuta), suspenso na diligência',
          ]),
          'warn',
        ),
    ),
  )

  // ——— 6. Portal ———
  const portal = portals?.[0]
  steps.push({
    id: 'step-nen-portal',
    title: 'Portal do estabelecimento',
    type: 'servicePortal',
    linkedPortalId: portal?.id || 'portal-nen-estabelecimentos',
    servicePortalPresentationDescription:
      'Canal do solicitante: Solicitar selo (MT Login → JUCEMAT → formulário) e Acompanhar (histórico, diligência, recurso). Hero e catálogo modelados em portals.json.',
    servicePortalServiceNavigateStepIds: {
      'svc-nen-solicitar': 'step-nen-acesso',
      'svc-nen-acompanhar': 'step-nen-ws',
    },
  })

  steps.push(
    htmlStep(
      'step-nen-portal-detalhe',
      'Portal — serviços e jornada',
      'Portal',
      eyebrow(portal?.name || 'Portal') +
        h1('Catálogo e jornada do solicitante') +
        table(
          ['Serviço', 'Descrição', 'Próximo artefato'],
          [
            [
              'Solicitar selo',
              'Atualizar cadastro → preencher → protocolar',
              'form-nen-acesso → form-nen-solicitacao',
            ],
            [
              'Acompanhar solicitações',
              'Lista, histórico, responder diligência, recurso',
              'Workspace / portal HTML + peças Ajustes/Recurso',
            ],
          ],
        ) +
        callout(
          'Integração de acesso',
          'Somente empresas retornadas pela <strong>JUCEMAT</strong> vinculadas ao usuário MT Login. Documento de representação quando solicitante ≠ responsável cadastral.',
          'info',
        ),
    ),
  )

  // ——— 7. Acesso ———
  steps.push({
    id: 'step-nen-acesso',
    title: '1. Acesso e empresa',
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    bpmnActivityKey: 'MT Login → JUCEMAT → seleciona estabelecimento',
    bpmnDescription:
      'FigJam §1. Autentica via MT Login, lista estabelecimentos JUCEMAT do usuário, seleciona a unidade do requerimento e exige documento de representação quando necessário. Classe: form-nen-acesso.',
    assigneeRole: 'Solicitante (estabelecimento)',
    assigneeRoleDetail:
      'Pessoa física autenticada no MT Login com vínculo a CNPJ(s) na JUCEMAT. Regra fina sócio/representante/matriz-filial: pendência de negócio.',
    bpmnInputs: 'Credencial MT Login; lista JUCEMAT; opcional procuração/documento de representação.',
    bpmnOutputs: 'Estabelecimento vinculado; perfil de acesso ativo; prontidão para abrir Solicitação.',
    bpmnRuleList: [
      'Somente empresas JUCEMAT do usuário',
      'Requerimento por unidade (CNPJ/estabelecimento)',
      'Documento de representação se ≠ responsável cadastral',
      'Sem MT Login válido → bloqueia solicitação',
    ],
    bpmnSla: 'Imediato (autenticação + seleção)',
    bpmnPossiblePaths: [{ key: 'Estabelecimento selecionado', value: 'step-nen-solicitacao' }],
    linkedFormId: 'form-nen-acesso',
    bpmnFormConfirmNavigateStepId: 'step-nen-solicitacao',
  })

  steps.push(
    htmlStep(
      'step-nen-acesso-campos',
      'Acesso — campos e métodos',
      'form-nen-acesso',
      eyebrow('Classe · Entrada') +
        h1('Acesso (MT Login + JUCEMAT) — especificação de campos') +
        lead('Layout único (sem abas). Métodos: Entrar (MT Login); Continuar para solicitação.') +
        table(['Campo', 'Tipo', 'Regras', 'Spec / origem'], formFieldRows('form-nen-acesso')) +
        methodsTable('form-nen-acesso'),
    ),
  )

  // ——— 8. Solicitação ———
  steps.push({
    id: 'step-nen-solicitacao',
    title: '2. Formulário de Solicitação',
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    bpmnActivityKey: 'Formulário de Solicitação (7 abas)',
    bpmnDescription:
      'FigJam §2 + PDF 04/09 + reunião 18/09. Coleta dados/fachada, enquadramento, equipe+capacitados, sinalização (2 fotos), procedimentos (11), câmeras condicionais e declarações. Métodos: Salvar rascunho, Avançar/Revisar, Protocolar.',
    assigneeRole: 'Solicitante (estabelecimento)',
    bpmnInputs: 'Estabelecimento selecionado; dados pré-preenchidos JUCEMAT; uploads (fachada, fotos, certificados).',
    bpmnOutputs: 'Pedido em RASCUNHO ou pronto para revisão/protocolo.',
    bpmnRuleList: [
      'Percentual capacitados calculado; mínimo 2 (ou 10% se equipe > 300 — confirmar decreto)',
      'Sinalização na solicitação = 2 locais + 2 fotos (conteúdo legal do cartaz é do analista)',
      'Câmeras não são requisito de concessão; se Sim, abrem preservação/acesso',
      'Protocolar exige checkbox de revisão e ausência de pendências obrigatórias',
    ],
    bpmnSla: 'Preenchimento pelo solicitante (sem SLA institucional)',
    bpmnPossiblePaths: [{ key: 'Revisar', value: 'step-nen-revisao' }],
    linkedFormId: 'form-nen-solicitacao',
    bpmnFormConfirmNavigateStepId: 'step-nen-revisao',
  })

  const sol = byId['form-nen-solicitacao']
  steps.push(
    htmlStep(
      'step-nen-sol-estrutura',
      'Solicitação — abas',
      'form-nen-solicitacao',
      eyebrow('Classe · 7 seções') +
        h1('Estrutura de abas do Formulário de Solicitação') +
        sectionCatalog('form-nen-solicitacao') +
        methodsTable('form-nen-solicitacao') +
        callout(
          'O que NÃO vai na solicitação',
          'Conteúdo legal do cartaz (acionar, 190, 180, A3) e conferência detalhada do Sinal Vermelho ficam no <strong>checklist do analista</strong> (Atender / Análise).',
          'warn',
        ),
    ),
  )

  for (const sec of sol?.sections || []) {
    steps.push(
      htmlStep(
        `step-nen-sol-aba-${sec.id}`,
        `Solicitação · ${sec.title}`,
        sec.title,
        eyebrow(`Aba · ${sec.title}`) +
          h1(sec.title) +
          lead(`Classe <code>form-nen-solicitacao</code> · seção <code>${esc(sec.id)}</code>`) +
          table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-solicitacao', sec.id)),
      ),
    )
  }

  // Capacitado
  steps.push({
    id: 'step-nen-capacitado',
    title: 'Capacitado (embedded)',
    type: 'class',
    linkedFormId: 'form-nen-capacitado',
    classPresentationTitle: 'Capacitado — registro repetível',
    classPresentationDescription:
      'Embutido na aba Equipe da Solicitação. Um registro por pessoa: dados do curso (Escola de Governo), certificado individual e comprovante de vínculo. Não existe upload geral único de certificados.',
  })

  steps.push(
    htmlStep(
      'step-nen-capacitado-campos',
      'Capacitado — campos',
      'form-nen-capacitado',
      eyebrow('Classe embutida') +
        h1('Campos do Capacitado') +
        table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-capacitado')),
    ),
  )

  // Revisão
  steps.push({
    id: 'step-nen-revisao',
    title: '2b. Revisar e Protocolar',
    type: 'bpmnActivity',
    bpmnTaskType: 'userTask',
    bpmnActivityKey: 'Revisa respostas e anexos → Protocolar → PROTOCOLADO',
    bpmnDescription:
      'FigJam §2. Resumo consolidado; lista pendências; Protocolar gera nº, data/hora, comprovante, status PROTOCOLADO e notifica área PROCON. Após protocolado, edição livre bloqueada (alterações via diligência).',
    assigneeRole: 'Solicitante (estabelecimento)',
    bpmnOutputs: 'Pedido PROTOCOLADO (+ comprovante)',
    bpmnRuleList: [
      'Bloquear protocolização se obrigatórios faltarem',
      'Exige declaração de revisão marcada',
      'Notificar servidor PROCON',
    ],
    bpmnPossiblePaths: [{ key: 'PROTOCOLADO → fila PROCON', value: 'step-nen-ad-overview' }],
    linkedFormId: 'form-nen-solicitacao',
    bpmnFormConfirmNavigateStepId: 'step-nen-ad-overview',
  })

  // AD overview
  steps.push(
    htmlStep(
      'step-nen-ad-overview',
      '3–4. Análise e Decisão — visão',
      'form-nen-analise-decisao',
      eyebrow('Classe de trabalho PROCON') +
        h1('Análise e Decisão — abas e métodos') +
        lead(
          'Concentra FigJam §3–4. Cabeçalho do processo sempre visível; abas de trabalho reveladas por status. Método destaque: <strong>Atender</strong> → modal <code>form-nen-atender</code>.',
        ) +
        sectionCatalog('form-nen-analise-decisao') +
        methodsTable('form-nen-analise-decisao') +
        callout(
          'Hierarquia Análise',
          'Aba <strong>Análise</strong> contém sub-abas: Pedido (embed da solicitação), Checklist, Cartaz e Sinal Vermelho, Apoio.',
          'brand',
        ),
    ),
  )

  const ad = byId['form-nen-analise-decisao']
  for (const sec of (ad?.sections || []).filter((s) => !s.parentSectionId)) {
    const kids = (ad.fields || []).filter((x) => x.sectionId === sec.id)
    const childSecs = (ad.sections || []).filter((s) => s.parentSectionId === sec.id)
    let body =
      eyebrow(`Aba · ${sec.title}`) +
      h1(sec.title) +
      lead(`seção <code>${esc(sec.id)}</code>`)
    if (childSecs.length) {
      body +=
        lead('Sub-abas (detalhadas abaixo):') +
        ul(childSecs.map((c) => `<strong>${esc(c.title)}</strong> (<code>${esc(c.id)}</code>)`))
      for (const c of childSecs) {
        body += `<h3 style="margin:14px 0 6px;color:${C.brand};font-size:1.05rem;">${esc(c.title)}</h3>`
        body += table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-analise-decisao', c.id))
      }
    }
    if (kids.length) {
      body += table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-analise-decisao', sec.id))
    }
    steps.push(htmlStep(`step-nen-ad-aba-${sec.id}`, `AD · ${sec.title}`, sec.title, body))
  }

  // Atender
  steps.push(
    htmlStep(
      'step-nen-atender-ux',
      'Atender — modal por status',
      'form-nen-atender',
      eyebrow('UX Sydle') +
        h1('Modal Atender: abas respeitam o status') +
        lead(
          'Cada aba começa com a Solicitação embutida (<code>embeddedReference</code>, hidden por padrão e liberada só nas regras do status). Assim a aba só “existe” quando há conteúdo relevante.',
        ) +
        sectionCatalog('form-nen-atender') +
        table(
          ['Status do pedido', 'Abas visíveis no Atender'],
          [
            ['EM ANÁLISE / AGUARDANDO / pós-diligência em análise', 'Contexto + Checklist + Cartaz + Apoio'],
            ['EM DILIGÊNCIA', 'Contexto + Diligência'],
            ['DILIGÊNCIA RESPONDIDA / NÃO RESPONDIDA', 'Contexto + Diligência + Checklist + Cartaz + Apoio'],
            ['PRONTO PARA DECISÃO', 'Contexto + Checklist + Cartaz + Apoio + Decisão'],
            ['EM RECURSO', 'Contexto + Recurso (peça + julgamento)'],
            ['DEFERIDO / INDEFERIDO / FINALIZADO', 'Leitura no processo; modal não reabre trabalho'],
          ],
        ) +
        callout(
          'Regra de implementação',
          'Embeds <code>nen-atd-sol-*</code> com <code>hidden:true</code> entram nas listas <code>show</code> das fieldVisibilityRules do status correspondente — evita “todas as abas abertas”.',
          'ok',
        ),
    ),
  )

  const atd = byId['form-nen-atender']
  for (const sec of atd?.sections || []) {
    steps.push(
      htmlStep(
        `step-nen-atd-aba-${sec.id}`,
        `Atender · ${sec.title}`,
        sec.title,
        eyebrow(`Modal Atender · ${sec.title}`) +
          h1(sec.title) +
          lead(`seção <code>${esc(sec.id)}</code>`) +
          table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-atender', sec.id)),
      ),
    )
  }

  // BPMN análise / ajustes / decisão / recurso
  steps.push({
    id: 'step-nen-analise',
    title: '3. Pré-análise PROCON',
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    bpmnActivityKey: 'Checklist + Cartaz → Conclusão',
    bpmnDescription:
      'FigJam §3. Analista avalia blocos (conforme / não conforme / necessita complementação), confere cartaz (acionar, 190, 180, A3, Sinal Vermelho) e decide: abrir diligência ou encaminhar para decisão.',
    assigneeRole: 'Analista PROCON',
    bpmnInputs: 'Pedido PROTOCOLADO; embed da Solicitação; evidências.',
    bpmnOutputs: 'Checklist preenchido; EM DILIGÊNCIA ou PRONTO PARA DECISÃO.',
    bpmnRuleList: [
      'Checklist por bloco + complementação condicional',
      'Diligência única — todas as pendências de uma vez',
      'Não deferir com item obrigatório «não conforme»',
    ],
    bpmnSla: 'Até 30 dias (minuta), suspenso em diligência',
    bpmnSlaIfExceeded: 'Escalonar / priorizar na fila (política PROCON — a confirmar)',
    bpmnPossiblePaths: [
      { key: 'Não conforme → Ajustes', value: 'step-nen-ajustes' },
      { key: 'Pronto → Decisão', value: 'step-nen-decisao' },
    ],
    linkedFormId: 'form-nen-analise-decisao',
    bpmnFormConfirmNavigateStepId: 'step-nen-ajustes',
  })

  steps.push({
    id: 'step-nen-ajustes',
    title: '3b. Diligência / Ajustes (5 dias)',
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    bpmnActivityKey: 'Formulário de Ajustes → notifica → 5 dias',
    bpmnDescription:
      'Peça satélite form-nen-ajustes. Status EM DILIGÊNCIA; notifica solicitante; prazo 5 dias (Lei 7.692/2002). Resposta → DILIGÊNCIA RESPONDIDA; silêncio → NÃO RESPONDIDA (sem indeferimento automático).',
    assigneeRole: 'Solicitante / Analista',
    bpmnRuleList: [
      'Notificar na abertura',
      'Prazo 5 dias',
      'Volta para análise após resposta ou expiração',
      'Sem indeferimento automático por silêncio',
    ],
    bpmnPossiblePaths: [
      { key: 'Complementado → Análise', value: 'step-nen-analise' },
      { key: 'Pronto para decisão', value: 'step-nen-decisao' },
    ],
    linkedFormId: 'form-nen-ajustes',
    bpmnFormConfirmNavigateStepId: 'step-nen-analise',
  })

  steps.push(
    htmlStep(
      'step-nen-ajustes-campos',
      'Ajustes — campos',
      'form-nen-ajustes',
      eyebrow('Peça satélite') +
        h1('Formulário de Ajustes (diligência)') +
        table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-ajustes')) +
        methodsTable('form-nen-ajustes'),
    ),
  )

  steps.push({
    id: 'step-nen-decisao',
    title: '4. Decisão da autoridade',
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    bpmnActivityKey: 'Deferir? / Indeferir',
    bpmnDescription:
      'FigJam §4. Autoridade registra parecer. Deferir → emissão (selo VIGENTE + QR). Indeferir → fundamentação + info de recurso.',
    assigneeRole: 'Autoridade PROCON (aprovador)',
    bpmnRuleList: [
      'Bloquear deferimento se checklist tiver «Não conforme» obrigatório',
      'Indeferimento com parecer, requisitos e fundamentos + info de recurso',
      'Deferimento gera certificado, QR Validador MT, inclusão na classe Selo, notificações',
    ],
    bpmnPossiblePaths: [
      { key: 'Sim → Emissão', value: 'step-nen-certificado' },
      { key: 'Não → INDEFERIDO / Recurso?', value: 'step-nen-recurso' },
    ],
    linkedFormId: 'form-nen-analise-decisao',
    bpmnFormConfirmNavigateStepId: 'step-nen-certificado',
  })

  steps.push({
    id: 'step-nen-recurso',
    title: '4b. Recurso',
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    bpmnActivityKey: 'Peça de recurso → Provido?',
    bpmnDescription:
      'Solicitante apresenta razões/anexos (form-nen-recurso). Julgamento só na Análise e Decisão / Atender (aba Recurso): Provido → emissão; Não provido → FINALIZADO.',
    assigneeRole: 'Solicitante / Autoridade PROCON',
    bpmnRuleList: [
      'Peça = razões + anexos; julgamento não duplicado na peça',
      'Prazo/cabimento: confirmar no decreto (ou Lei 7.692/2002)',
      'Provido = mesmos efeitos do deferimento',
    ],
    bpmnPossiblePaths: [
      { key: 'Sem recurso → Finalizado', value: 'step-nen-pos' },
      { key: 'Provido → Emissão', value: 'step-nen-certificado' },
      { key: 'Não provido → Finalizado', value: 'step-nen-pos' },
    ],
    linkedFormId: 'form-nen-recurso',
    bpmnFormConfirmNavigateStepId: 'step-nen-certificado',
  })

  steps.push(
    htmlStep(
      'step-nen-recurso-campos',
      'Recurso — campos',
      'form-nen-recurso',
      eyebrow('Peça satélite') +
        h1('Formulário de Recurso (solicitante)') +
        table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-recurso')) +
        methodsTable('form-nen-recurso') +
        callout(
          'Julgamento',
          'Campos Decisão do recurso + Fundamentação ficam na classe Análise e Decisão / modal Atender — não nesta peça.',
          'info',
        ),
    ),
  )

  // Emissão
  steps.push({
    id: 'step-nen-certificado',
    title: '5. Emissão — Selo + QR',
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    bpmnActivityKey: 'Certificado + QR Validador MT + classe Selo',
    bpmnDescription:
      'FigJam §5. Cria/atualiza Estabelecimentos com Selo: número, datas (concessão + 24 meses), QR, status VIGENTE; notifica servidor e solicitante; base da lista/exportação MVP.',
    assigneeRole: 'Sistema / PROCON',
    bpmnOutputs: 'Selo VIGENTE + certificado eletrônico + notificações',
    bpmnRuleList: [
      'Registrar na classe Estabelecimentos com Selo',
      'QR aponta ao Validador MT',
      'Notificar servidor PROCON e solicitante',
      'Arte visual final fora do escopo (SECOM)',
    ],
    bpmnPossiblePaths: [{ key: 'VIGENTE → Pós-concessão', value: 'step-nen-pos' }],
    linkedFormId: 'form-nen-estabelecimento-selo',
    bpmnFormConfirmNavigateStepId: 'step-nen-pos',
  })

  steps.push({
    id: 'step-nen-lista',
    title: 'Estabelecimentos com Selo',
    type: 'class',
    linkedFormId: 'form-nen-estabelecimento-selo',
    classPresentationTitle: 'Estabelecimentos com Selo',
    classPresentationDescription:
      'Cadastro dos certificados. Métodos: Filtrar, Exportar, Baixar certificado, Cancelar a pedido, Revogar, Iniciar renovação, Enviar aviso de vencimento.',
    classMethodNavigateStepIds: {
      'nen-est-cancelar': 'step-nen-cancelamento',
      'nen-est-revogar': 'step-nen-revogacao',
      'nen-est-renovar': 'step-nen-renovacao',
    },
  })

  steps.push(
    htmlStep(
      'step-nen-selo-campos',
      'Selo — campos e métodos',
      'form-nen-estabelecimento-selo',
      eyebrow('Classe · Pós-emissão') +
        h1('Estabelecimentos com Selo — campos') +
        table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-estabelecimento-selo')) +
        methodsTable('form-nen-estabelecimento-selo'),
    ),
  )

  // Pós
  steps.push(
    htmlStep(
      'step-nen-pos',
      '6. Pós-concessão',
      'Pós-concessão',
      eyebrow('FigJam §6') +
        h1('Após o selo vigente') +
        ol([
          '<strong>Aviso de vencimento</strong> — método na classe Selo',
          '<strong>Renovar</strong> — formulário pré-preenchido → novo PROTOCOLADO → mesmo ciclo',
          '<strong>Cancelar a pedido</strong> — CANCELADO A PEDIDO → sai da lista',
          '<strong>Revogar (backoffice)</strong> — upload da decisão + REVOGADO → sai da lista (apuração fora do sistema)',
        ]),
    ),
  )

  steps.push({
    id: 'step-nen-renovacao',
    title: '6a. Renovação',
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    bpmnActivityKey: 'Formulário de Renovação',
    bpmnDescription: 'FigJam §6. Inicia renovação a partir do selo vigente; protocola e reconecta ao ciclo de análise.',
    assigneeRole: 'Solicitante (estabelecimento)',
    bpmnPossiblePaths: [{ key: 'Protocolado → Análise', value: 'step-nen-analise' }],
    linkedFormId: 'form-nen-renovacao',
    bpmnFormConfirmNavigateStepId: 'step-nen-analise',
  })

  steps.push(
    htmlStep(
      'step-nen-renovacao-campos',
      'Renovação — campos',
      'form-nen-renovacao',
      eyebrow('Classe') +
        h1('Formulário de Renovação') +
        table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-renovacao')) +
        methodsTable('form-nen-renovacao'),
    ),
  )

  steps.push({
    id: 'step-nen-cancelamento',
    title: '6b. Cancelamento a pedido',
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    bpmnActivityKey: 'Cancelar selo',
    bpmnDescription: 'Solicitante confirma cancelamento voluntário → CANCELADO A PEDIDO → remove da lista pública.',
    assigneeRole: 'Solicitante (estabelecimento)',
    bpmnPossiblePaths: [{ key: 'Sai da lista pública', value: 'step-nen-lista' }],
    linkedFormId: 'form-nen-cancelamento',
    bpmnFormConfirmNavigateStepId: 'step-nen-lista',
  })

  steps.push(
    htmlStep(
      'step-nen-cancelamento-campos',
      'Cancelamento — campos',
      'form-nen-cancelamento',
      eyebrow('Classe') +
        h1('Cancelamento de Selo') +
        table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-cancelamento')) +
        methodsTable('form-nen-cancelamento'),
    ),
  )

  steps.push({
    id: 'step-nen-revogacao',
    title: '6c. Revogação (backoffice)',
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    bpmnActivityKey: 'Revogar selo',
    bpmnDescription:
      'Somente PROCON. Anexa documento da decisão/processo (Sigadoc fora), justifica, data → REVOGADO → sai da lista. Sem módulo de denúncia nesta entrega.',
    assigneeRole: 'PROCON (backoffice)',
    bpmnPossiblePaths: [{ key: 'Sai da lista pública', value: 'step-nen-lista' }],
    linkedFormId: 'form-nen-revogacao',
    bpmnFormConfirmNavigateStepId: 'step-nen-lista',
  })

  steps.push(
    htmlStep(
      'step-nen-revogacao-campos',
      'Revogação — campos',
      'form-nen-revogacao',
      eyebrow('Classe · Backoffice') +
        h1('Revogação de Selo') +
        table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-revogacao')) +
        methodsTable('form-nen-revogacao'),
    ),
  )

  // Analytics
  steps.push({
    id: 'step-nen-analytics',
    title: 'Analytics / relatórios (MVP)',
    type: 'class',
    linkedFormId: 'form-nen-analytics',
    classPresentationTitle: 'Analytics / relatórios',
    classPresentationDescription:
      'MVP de indicadores e exportação (protocolados, diligências, deferidos, vigentes, vencimentos, distribuição). API pública fica para fase futura.',
  })

  steps.push(
    htmlStep(
      'step-nen-analytics-campos',
      'Analytics — campos',
      'form-nen-analytics',
      eyebrow('Classe · MVP') +
        h1('Indicadores e exportação') +
        table(['Campo', 'Tipo', 'Regras', 'Spec'], formFieldRows('form-nen-analytics')) +
        methodsTable('form-nen-analytics'),
    ),
  )

  // Integrações
  steps.push(
    htmlStep(
      'step-nen-integracoes',
      'Integrações',
      'Integrações',
      eyebrow('Contratos externos') +
        h1('MT Login · JUCEMAT · Validador MT') +
        table(
          ['Sistema', 'Uso no fluxo', 'Dependência'],
          [
            ['MT Login', 'Autenticação do solicitante', 'Bloqueia portal sem sessão válida'],
            ['JUCEMAT', 'Lista e dados cadastrais do estabelecimento', 'Comportamento real a homologar (MVP ~30 dias OS)'],
            ['Validador MT', 'QR do certificado / autenticidade', 'Deve refletir VIGENTE vs EXPIRADO/CANCELADO/REVOGADO'],
            ['Escola de Governo', 'Emite certificado do capacitado (fora)', 'Sistema só recebe upload'],
            ['Sigadoc / denúncia', 'Fora do sistema', 'Revogação só sobe a decisão final'],
          ],
        ),
    ),
  )

  // Pendências
  steps.push(
    htmlStep(
      'step-nen-pendencias',
      'Pendências e riscos',
      'Abrir com negócio',
      eyebrow('Arquitetura de requisitos') +
        h1('Itens a confirmar antes do build final') +
        ul([
          'Quem pode solicitar (sócio-administrador, representante, matriz vs filial) e MT Login para CNPJ',
          'Redação final do percentual mínimo de capacitados (2; 10% se > 300 / público estimado)',
          'Prazo e cabimento do recurso no decreto',
          'Validade 12 vs 24 meses no decreto publicado',
          'Política de SLA/escalonamento da fila PROCON',
          'Arte do certificado (SECOM) — sistema emite dados + QR independente da arte',
        ]) +
        callout(
          'Entrega sugerida',
          'Homologar protótipo Atlas (portal + workspace + Atender por status) com PROCON e fechar pendências de negócio em paralelo às integrações.',
          'ok',
        ),
    ),
  )

  // Workspace
  const ws = workspaces?.[0]
  steps.push({
    id: 'step-nen-ws',
    title: 'Workspace PROCON',
    type: 'workspace',
    linkedWorkspaceId: ws?.id || 'ws-nen-procon',
    workspacePresentationDescription:
      'Explorer PROCON: pacotes Solicitação, Análise e decisão, Selo e pós-concessão. Presets por status na classe Análise e Decisão para demonstrar o modal Atender.',
    workspaceMethodNavigateStepIds: {
      [`pkg-nen-analise::cls-nen-analise-decisao::nen-ad-atender`]: 'step-nen-atender-ux',
      [`pkg-nen-selo::cls-nen-estab::nen-est-renovar`]: 'step-nen-renovacao',
      [`pkg-nen-selo::cls-nen-estab::nen-est-cancelar`]: 'step-nen-cancelamento',
      [`pkg-nen-selo::cls-nen-estab::nen-est-revogar`]: 'step-nen-revogacao',
    },
  })

  return [
    {
      id: 'flow-nen-prototipo-completo',
      name: 'Protótipo completo — Selo Não é Não (requisitos + arquitetura)',
      metadata:
        'Apresentação sênior alinhada ao FigJam Fluxo Completo LR, atas 03/09–18/09, PDF 04/09 e protótipo Atlas (classes/abas/campos/métodos). Validade documentada: 24 meses até decreto. Sem denúncia no sistema.',
      steps,
    },
  ]
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function main() {
  const primary = EPIC_PATHS[0]
  const forms = loadJson(path.join(primary, 'forms.json'))
  const portals = loadJson(path.join(primary, 'portals.json'))
  const workspaces = loadJson(path.join(primary, 'workspaces.json'))
  const classGroups = loadJson(path.join(primary, 'class-groups.json'))

  const flows = buildFlow(forms, portals, workspaces, classGroups)
  const text = `${JSON.stringify(flows, null, 2)}\n`

  for (const dir of EPIC_PATHS) {
    if (!fs.existsSync(dir)) {
      console.warn('skip missing', dir)
      continue
    }
    const out = path.join(dir, 'flows.json')
    fs.writeFileSync(out, text, 'utf8')
    console.log('wrote', out, 'steps=', flows[0].steps.length)
  }

  // context.md refresh (primary + existing twins that have it)
  const ctx = `# Projeto Não é Não - Seplag v1

## Fontes
1. **FigJam Fluxo Completo LR** — https://www.figma.com/board/txWrswjvhQUdxYb1Ojmdtl/PROCON-Nao-e-Nao---Fluxo-Completo-LR
2. Reunião 03/09/2026 (fluxo macro, Validador MT, JUCEMAT, 24 meses na minuta)
3. Reunião 10/09/2026 (1 serviço; sem denúncia; revogação operacional)
4. Reunião 18/09/2026 (estrutura da solicitação; cartaz no analista)
5. PDF fluxo 04/09/2026 (detalhe de campos; §§16–19 fora por 10/09)

## Apresentação (\`flows.json\`)
Fluxo \`flow-nen-prototipo-completo\` regenerado como apresentação sênior de requisitos + arquitetura:
- Capa, fontes, escopo, arquitetura, mapa de 12 classes, máquina de status
- Portal + detalhe de cada classe com **abas e campos**
- Modal **Atender** (abas por status) espelhando \`form-nen-atender\`
- BPMN ponta a ponta + emissão + pós-concessão + analytics + integrações + pendências
- Workspace PROCON com navegação de métodos

Regenerar:
\`\`\`bash
node scripts/build-nen-presentation-flows.mjs
\`\`\`

## FigJam — mapa das 6 seções

| # | Seção FigJam | Protótipo |
|---|--------------|-----------|
| 1 | Acesso e empresa | \`form-nen-acesso\` |
| 2 | Solicitação/protocolo | \`form-nen-solicitacao\` (+ \`form-nen-capacitado\`) |
| 3 | Pré-análise/ajustes | \`form-nen-analise-decisao\` + \`form-nen-atender\` + \`form-nen-ajustes\` |
| 4 | Decisão/recurso | mesma classe + \`form-nen-recurso\` |
| 5 | Emissão/Validador/lista | \`form-nen-estabelecimento-selo\` |
| 6 | Pós (renovar/cancelar/revogar) | renovação / cancelamento / revogação |

## Divergência tratada
- **Validade:** FigJam = 12 meses; minuta/PDF/ata = **24 meses**. Protótipo permanece em **24 meses**.
- **CANCELADO** (FigJam) = **CANCELADO A PEDIDO** no modelo.

## Escopo 10/09 (mantido)
Sem denúncia/fiscalização/apuração no sistema. Revogar só backoffice + documento + REVOGADO + sai lista pública.
`

  for (const dir of EPIC_PATHS) {
    if (!fs.existsSync(dir)) continue
    fs.writeFileSync(path.join(dir, 'context.md'), ctx, 'utf8')
  }
}

main()
