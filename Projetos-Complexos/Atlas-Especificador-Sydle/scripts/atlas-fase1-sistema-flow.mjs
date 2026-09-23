/**
 * Apresentação didática — «Como funciona o sistema» Fase 1 Atlas.
 * Para cada etapa: slide HTML (contexto, classe, campos, antes/depois) + tela real do protótipo.
 */
import { flowFase1PropostaContrato } from './atlas-fase1-flows.mjs'

const SYS = 'step-sys-'
const NARR = 'step-sys-narr-'

const CSS =
  "font-family:'Segoe UI',system-ui,Arial,sans-serif;line-height:1.55;color:#0f172a;max-width:920px"

function box(title, body, { border = '#3b82f6', bg = '#eff6ff' } = {}) {
  return (
    `<div style="${CSS};padding:20px 24px;background:${bg};border:2px solid ${border};border-radius:10px;margin:0">` +
    `<h2 style="margin:0 0 10px;color:#1e40af;font-size:1.15rem">${title}</h2>${body}</div>`
  )
}

function flowArrow(from, to) {
  return (
    `<div style="display:flex;align-items:center;gap:8px;margin:14px 0;flex-wrap:wrap;font-size:13px">` +
    `<span style="background:#f1f5f9;padding:6px 12px;border-radius:6px;border:1px solid #e2e8f0">${from}</span>` +
    `<span style="color:#64748b;font-size:18px">→</span>` +
    `<span style="background:#dbeafe;padding:6px 12px;border-radius:6px;border:1px solid #93c5fd;font-weight:600">${to}</span>` +
    `</div>`
  )
}

function tbl(rows) {
  return (
    `<table style="width:100%;border-collapse:collapse;font-size:13px;margin:10px 0">` +
    `<thead><tr style="background:#f8fafc">` +
    `<th style="text-align:left;padding:8px;border:1px solid #e2e8f0">Item</th>` +
    `<th style="text-align:left;padding:8px;border:1px solid #e2e8f0">Detalhe</th></tr></thead><tbody>` +
    rows
      .map(
        ([a, b]) =>
          `<tr><td style="padding:8px;border:1px solid #e2e8f0;vertical-align:top"><strong>${a}</strong></td>` +
          `<td style="padding:8px;border:1px solid #e2e8f0"><code style="font-size:12px;background:#f1f5f9;padding:2px 5px;border-radius:4px">${b}</code></td></tr>`,
      )
      .join('') +
    `</tbody></table>`
  )
}

function narrSlide({ stepNum, title, onde, classe, workspace, papel, fazer, campos, metodos, depois, retorno, dica }) {
  const num = stepNum != null ? `<span style="background:#0c1ba8;color:#fff;padding:4px 10px;border-radius:6px;font-size:12px;margin-right:8px">Passo ${stepNum}</span>` : ''
  let body =
    `<p style="margin:0 0 12px;font-size:15px">${num}<strong>${title}</strong></p>` +
    (onde ? `<p style="margin:0 0 8px"><strong>Onde no sistema:</strong> ${onde}</p>` : '') +
    (papel ? `<p style="margin:0 0 12px;color:#475569;font-size:14px"><strong>Quem faz:</strong> ${papel}</p>` : '') +
  `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin:12px 0">` +
    `<p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.04em">Nesta etapa você…</p>` +
    `<p style="margin:0">${fazer}</p></div>`

  if (classe || workspace) {
    body += tbl([
      ...(classe ? [['Classe (formulário)', classe]] : []),
      ...(workspace ? [['Workspace', workspace]] : []),
    ])
  }
  if (campos?.length) {
    body += `<h3 style="margin:16px 0 8px;font-size:14px;color:#334155">Campos principais</h3><ul style="margin:0;padding-left:1.2rem;font-size:14px">` +
      campos.map((c) => `<li>${c}</li>`).join('') +
      `</ul>`
  }
  if (metodos?.length) {
    body += `<h3 style="margin:16px 0 8px;font-size:14px;color:#334155">Operações (métodos)</h3><ul style="margin:0;padding-left:1.2rem;font-size:14px">` +
      metodos.map((m) => `<li><code style="font-size:12px">${m}</code></li>`).join('') +
      `</ul>`
  }
  if (depois) body += flowArrow('Concluiu esta etapa', depois)
  if (retorno) {
    body +=
      `<p style="margin:12px 0 0;padding:10px 14px;background:#fef3c7;border-left:4px solid #f59e0b;font-size:13px;color:#92400e">` +
      `<strong>Retorno possível:</strong> ${retorno}</p>`
  }
  if (dica) {
    body +=
      `<p style="margin:14px 0 0;padding:12px;background:#f0fdf4;border-left:4px solid #22c55e;font-size:13px;color:#166534">` +
      `<strong>Próximo slide →</strong> ${dica}</p>`
  }
  return body
}

/** Narrativas por id do passo original (18 nós + extras) */
const NARRATIVES = {
  'step-atlas-fase1-inicio': narrSlide({
    stepNum: 1,
    title: 'Início — visão geral do workspace',
    onde: 'Workspace <strong>Atlas Fase 1 — Workflow e documentos</strong> (configuração e monitoramento).',
    workspace: 'ws-atlas-fase1-workflow',
    papel: 'Administrador / DIRC — orientação; negócio começa no passo 2.',
    fazer:
      'Entender o escopo da Fase 1 e onde ficam modelos de workflow, templates e governança. ' +
      'Esta tela <em>não é atividade de negócio</em> — é o ponto de partida visual.',
    depois: 'Registrar demanda (criar proposta)',
    dica: 'A seguir: tela de contexto do workspace e depois o formulário da proposta no passo 2.',
  }),
  'step-atlas-fase1-registrar-demanda': narrSlide({
    stepNum: 2,
    title: 'Registrar demanda / cotação',
    classe: 'form-atlas-proposta',
    workspace: 'ws-atlas-propostas → pacote Propostas',
    papel: 'Analista DIRC/UGVEN — confirma entrada (portal, e-mail ou manual).',
    fazer:
      'Abrir a classe <strong>Proposta comercial</strong>, seção <strong>Origem</strong>: informar de onde veio a demanda, ' +
      'qual cliente (organização), parceiros se houver parceria e o escopo resumido. O sistema cria a proposta em <strong>Em composição</strong>.',
    campos: [
      'Origem da demanda — atlas-prp-origem-demanda (obrig.)',
      'Cliente — atlas-prp-cliente-org → form-atlas-organizacao',
      'Parceiros — atlas-prp-parceiros-envolvidos (se parceria)',
      'Escopo — atlas-prp-escopo-resumido (obrig.)',
      'Status — atlas-prp-status-fase1 = Em composição',
    ],
    depois: 'Selecionar itens de catálogo na mesma proposta',
    dica: 'Tela interativa da proposta — preencha Origem e confirme (botão verde BPMN) para avançar.',
  }),
  'step-atlas-fase1-selecionar-itens': narrSlide({
    stepNum: 3,
    title: 'Selecionar itens de catálogo',
    classe: 'form-atlas-proposta + itens embutidos form-atlas-proposta-item',
    workspace: 'ws-atlas-catalogo-vigentes (consulta) + ws-atlas-propostas',
    papel: 'Analista DIRC/UGVEN ou parceiro (só seu escopo).',
    fazer:
      'Na proposta, adicionar linhas de itens: escolher origem (produto vigente, licença, serviço ou manual). ' +
      'Ao selecionar no catálogo, o sistema <strong>congela snapshot</strong> nos campos atlas-prpi-* (descrição, códigos, valores). ' +
      'Use <strong>Montar a partir dos catálogos</strong> para popular itens em lote.',
    campos: [
      'Origem catálogo — atlas-prpi-origem-catalogo',
      'Referência — atlas-prpi-produto-vigente / licenca / servico',
      'Justificativa — atlas-prpi-justificativa-manual (se manual)',
      'Snapshot (auto) — atlas-prpi-descricao, codigos, valor-previsto…',
    ],
    metodos: ['atlas-prp-meth-montar-catalogo — copia catálogo para itens'],
    depois: 'Compor documento a partir do template publicado',
    retorno: 'Se a revisão (passo 6) pedir ajuste só de itens, o fluxo volta aqui.',
    dica: 'Tela da proposta com grade de itens — role até a seção Catálogo Fase 1.',
  }),
  'step-atlas-fase1-compor-documento': narrSlide({
    stepNum: 4,
    title: 'Compor documento da proposta',
    classe: 'form-atlas-documento-template → gera form-atlas-documento-gerado',
    workspace: 'ws-atlas-fase1-workflow → Templates e documentos',
    papel: 'Analista DIRC/UGVEN.',
    fazer:
      'Escolher um <strong>template Publicado</strong>. Na proposta, acionar <strong>Gerar documento da proposta</strong>: ' +
      'o motor substitui placeholders ({{atlas-prp-cliente-org}}, itens, etc.) e cria registro em Documento gerado, versionado.',
    campos: [
      'Template — atlas-dtmp-status deve ser Publicado',
      'HTML — atlas-dtmp-html com placeholders',
      'Saída — documento gerado vinculado à proposta',
    ],
    metodos: ['atlas-prp-meth-gerar-documento'],
    depois: 'Conferir prévia HTML da proposta',
    retorno: 'Ajuste de texto/documento na revisão volta aqui.',
    dica: 'Tela do template ou proposta com método de geração — veja o documento gerado no workspace Propostas.',
  }),
  'step-atlas-fase1-preview-proposta': narrSlide({
    stepNum: 5,
    title: 'Prévia da proposta',
    classe: 'form-atlas-proposta (dados na prévia HTML)',
    papel: 'Analista — conferência visual antes da revisão formal.',
    fazer:
      'Visualizar como o cliente verá a proposta: cliente, origem, escopo, status e workflow. ' +
      'Não há novos campos obrigatórios — é leitura e validação.',
    depois: 'Revisão MTI e parceiro',
    dica: 'Slide de prévia simulada — em seguida a proposta para decisão de revisão.',
  }),
  'step-atlas-fase1-revisao-mti-parceiro': narrSlide({
    stepNum: 6,
    title: 'Revisão MTI e parceiro',
    classe: 'form-atlas-proposta',
    papel: 'DIRC + parceiro gestor (cada um no seu escopo).',
    fazer:
      'Validar escopo, itens, valores e documento. Decisão: <strong>Aprovado</strong> (segue para assinaturas), ' +
      '<strong>Ajuste</strong> (volta itens ou documento) ou <strong>Reprovação</strong> (comentário obrigatório). ' +
      'Antes das assinaturas: vincular modelo e versão de workflow e <strong>Submeter ao workflow</strong>.',
    campos: [
      'Modelo workflow — atlas-prp-workflow-modelo',
      'Versão — atlas-prp-workflow-versao',
      'Instância (auto) — atlas-prp-workflow-instancia após submeter',
    ],
    metodos: ['atlas-prp-meth-submeter-workflow'],
    depois: 'Assinatura DIRC/parceiro (primeira rodada)',
    retorno: 'Ajuste → passo 3 (itens) ou passo 4 (documento). Nova versão da proposta.',
    dica: 'Formulário proposta — seção revisão/workflow; botões de caminho BPMN simulam decisões.',
  }),
  'step-atlas-fase1-assinatura-dirc-parceiro': narrSlide({
    stepNum: 7,
    title: 'Assinatura DIRC e parceiro(s)',
    classe: 'form-atlas-tramite-assinatura',
    papel: 'Assinantes DIRC/MTI e parceiros por escopo.',
    fazer:
      'Cada assinante recebe um <strong>trâmite</strong>: grupo, área, status, SLA, se bloqueia o fluxo. ' +
      'Operações: Enviar · Aprovar e assinar · Solicitar ajuste · Reprovar. ' +
      'Só avança quando <strong>todos os trâmites bloqueantes</strong> estiverem assinados.',
    campos: [
      'Assinante — atlas-tra-assinante',
      'Status — atlas-tra-status-pendencia',
      'Bloqueia fluxo — atlas-tra-bloqueia-fluxo',
      'Datas/SLA — atlas-tra-data-envio, dias-pendente',
    ],
    metodos: ['atlas-meth-aprovar-assinar', 'atlas-meth-solicitar-ajuste', 'atlas-meth-reprovar'],
    depois: 'Assinatura DTIC',
    retorno: 'Ajuste/reprovação → Revisão MTI (passo 6).',
    dica: 'Tela do trâmite — simule aprovar para ir à DTIC.',
  }),
  'step-atlas-fase1-assinatura-dtic': narrSlide({
    stepNum: 8,
    title: 'Assinatura DTIC',
    classe: 'form-atlas-tramite-assinatura',
    papel: 'Aprovador DTIC — concordância técnica.',
    fazer: 'Mesma classe Trâmite: DTIC valida impacto técnico após DIRC/parceiro. Comentário obrigatório em ajuste.',
    depois: 'Assinatura Presidência',
    retorno: 'Ajuste → passo 6.',
    dica: 'Segunda tela de trâmite — perfil DTIC.',
  }),
  'step-atlas-fase1-assinatura-presidencia': narrSlide({
    stepNum: 9,
    title: 'Assinatura Presidência',
    classe: 'form-atlas-tramite-assinatura',
    papel: 'Presidência ou autoridade superior (conforme workflow).',
    fazer: 'Assinatura final interna. Ao concluir, proposta tende a status <strong>Aprovada</strong>.',
    depois: 'Enviar proposta ao cliente',
    retorno: 'Ajuste → passo 6.',
    dica: 'Terceira tela de trâmite — última assinatura interna.',
  }),
  'step-atlas-fase1-enviar-cliente': narrSlide({
    stepNum: 10,
    title: 'Enviar proposta ao cliente',
    classe: 'form-atlas-proposta',
    papel: 'Analista DIRC/UGVEN.',
    fazer:
      'Disponibilizar versão aprovada e assinada. Método <strong>Enviar ao cliente</strong> registra data e status <strong>Enviada ao cliente</strong>.',
    metodos: ['atlas-prp-meth-enviar-cliente'],
    depois: 'Aguardar contratação externa (passo 11)',
    dica: 'Proposta — método de envio; confirme no BPMN.',
  }),
  'step-atlas-fase1-apoio-contratacao': narrSlide({
    stepNum: 11,
    title: 'Aguardar retorno do contrato (externo)',
    classe: 'form-atlas-proposta (somente leitura/monitoramento)',
    papel: 'Cliente — contrata fora do Atlas; MTI aguarda.',
    fazer:
      'O sistema <strong>não controla</strong> a contratação do cliente. Quando o contrato assinado/publicado voltar à MTI, ' +
      'o analista avança para registrar o recebimento.',
    depois: 'Finalizar processo contratual (recebimento)',
    dica: 'Tela HTML de espera — sem campos obrigatórios.',
  }),
  'step-atlas-fase1-finalizar-contrato': narrSlide({
    stepNum: 12,
    title: 'Receber contrato do cliente',
    classe: 'form-atlas-processo-contratual',
    workspace: 'ws-atlas-contratos-raer',
    papel: 'Analista DIRC/UGVEN.',
    fazer:
      'Criar/abrir processo contratual: vincular proposta de origem, anexar PDF do contrato recebido e informar data de retorno à MTI.',
    campos: [
      'Proposta origem — atlas-pctr-proposta-origem',
      'Anexo — atlas-pctr-anexo-contrato-recebido (obrig.)',
      'Data retorno — atlas-pctr-data-retorno-contrato',
    ],
    depois: 'Revisar itens contratados vs proposta',
    dica: 'Formulário processo contratual — seção Recebimento.',
  }),
  'step-atlas-fase1-revisar-itens': narrSlide({
    stepNum: 13,
    title: 'Revisar itens contratados',
    classe: 'form-atlas-processo-contratual + form-atlas-contrato-item-catalogo',
    papel: 'Analista — compara proposta x contrato.',
    fazer:
      'Marcar itens revisados; se houver divergência, tipo e justificativa obrigatória. Itens de contrato espelham proposta com flags de alteração.',
    campos: [
      'Itens revisados — atlas-pctr-itens-revisados',
      'Divergência — atlas-pctr-ha-divergencia, tipo, justificativa',
      'Item contrato — atlas-cti-alterado-contrato, motivo',
    ],
    depois: 'Abrir contrato em rascunho',
    dica: 'Mesmo processo contratual — seção Revisão itens.',
  }),
  'step-atlas-fase1-abrir-rascunho': narrSlide({
    stepNum: 14,
    title: 'Abrir contrato em rascunho',
    classe: 'form-atlas-contrato-gestao',
    workspace: 'ws-atlas-contratos-raer',
    papel: 'Analista contratual.',
    fazer:
      'Método <strong>Abrir em rascunho</strong>: status cadastro = Rascunho, vincula processo e proposta. ' +
      'O checklist (passo 15) exige este rascunho — não finaliza cadastro antes.',
    campos: [
      'Cliente — atlas-ctg-cliente-org',
      'Processo — atlas-ctg-processo-contratual',
      'Status — atlas-ctg-status-cadastro = Rascunho',
    ],
    metodos: ['atlas-ctg-meth-abrir-rascunho'],
    depois: 'Validar checklist contratual',
    dica: 'Tela Contrato — gestão.',
  }),
  'step-atlas-fase1-validar-checklist': narrSlide({
    stepNum: 15,
    title: 'Checklist contratual',
    classe: 'form-atlas-checklist-contratual',
    papel: 'Analista — valida pré-requisitos e integrações.',
    fazer:
      'Preencher checklist: processo vinculado, cliente, itens revisados, extrato, data publicação. ' +
      'Protheus/ServiceNow: status conhecido; pendente/erro exige justificativa (conclusão não obrigatória na Fase 1). ' +
      'Método <strong>Validar checklist</strong> libera finalização.',
    campos: [
      'Vínculos — atlas-chk-processo-contratual, proposta, rascunho',
      'Extrato — atlas-chk-extrato-publicacao, data',
      'Integração — atlas-chk-protheus-status, servicenow-status + justificativas',
    ],
    metodos: ['atlas-chk-meth-validar'],
    depois: 'Finalizar cadastro do contrato',
    dica: 'Formulário checklist — marque itens e valide.',
  }),
  'step-atlas-fase1-cadastrar-contrato': narrSlide({
    stepNum: 16,
    title: 'Finalizar cadastro do contrato',
    classe: 'form-atlas-contrato-gestao',
    papel: 'Analista — só após checklist validado.',
    fazer:
      'Complementar extrato e data de publicação; método <strong>Finalizar cadastro</strong> ativa contrato (Ativo/Em validação) ' +
      'e dispara eventos simulados de integração.',
    metodos: ['atlas-ctg-meth-finalizar-cadastro'],
    depois: 'Notificar cliente e pós-vendas',
    dica: 'Contrato gestão — bloqueado sem checklist validado (atlas-ctg-checklist-validado).',
  }),
  'step-atlas-fase1-notificar-pos-vendas': narrSlide({
    stepNum: 17,
    title: 'Notificar cliente e pós-vendas',
    classe: 'form-atlas-notificacao-processo',
    papel: 'Sistema / analista — registro de comunicação.',
    fazer:
      'Registrar notificação ao cliente e demanda de kickoff à UGEPV. Campos de e-mail, canal e status. ' +
      'Contrato marca cliente notificado e kickoff demandado.',
    depois: 'Fim da Fase 1',
    dica: 'Tela de notificação (tipo método/saída).',
  }),
  'step-atlas-fase1-fim': narrSlide({
    stepNum: 18,
    title: 'Fim da Fase 1',
    fazer:
      'Proposta, assinaturas e cadastro contratual concluídos. Integrações rastreadas; próximas fases: OS, faturamento, painel cliente, RAER operacional.',
    dica: 'Tela de encerramento — Fase 1 completa para este contrato.',
  }),
}

const PREP_NARR = {
  organizacao: narrSlide({
    title: 'Cadastro — Organização (cliente/parceiro)',
    classe: 'form-atlas-organizacao',
    workspace: 'ws-atlas-acesso-identidade',
    fazer: 'Cadastrar antes da proposta: nome, tipo, CNPJ, status, e-mails para notificação.',
    campos: ['atlas-org-nome', 'atlas-org-tipo', 'atlas-org-cnpj', 'atlas-org-email'],
    depois: 'Referenciado em proposta (atlas-prp-cliente-org) e contrato',
    dica: 'Tela interativa da classe Organização.',
  }),
  pessoa: narrSlide({
    title: 'Cadastro — Pessoa (assinante)',
    classe: 'form-atlas-pessoa',
    workspace: 'ws-atlas-acesso-identidade',
    fazer: 'Vincular à organização; marcar se pode assinar e papel de assinatura.',
    depois: 'Usado em trâmites atlas-tra-assinante',
    dica: 'Tela Pessoa.',
  }),
  usuario: narrSlide({
    title: 'Cadastro — Usuário',
    classe: 'form-atlas-usuario',
    fazer: 'Perfil Fase 1, recebe e-mail, assinatura habilitada — focal de vendas e assinantes.',
    dica: 'Tela Usuário.',
  }),
  wf: narrSlide({
    title: 'Configuração — Workflow (modelo → versão → etapa)',
    classe: 'form-atlas-workflow-modelo / versao / etapa',
    workspace: 'ws-atlas-fase1-workflow',
    fazer: 'Configurar uma vez: domínio Proposta, etapas com SLA e assinatura. Versão congelada na submissão da proposta.',
    metodos: ['atlas-wfm-meth-criar-versao'],
    depois: 'Proposta usa modelo + versão ao submeter',
    dica: 'Telas do motor de workflow.',
  }),
  template: narrSlide({
    title: 'Configuração — Template de documento',
    classe: 'form-atlas-documento-template',
    workspace: 'ws-atlas-fase1-workflow → Templates',
    fazer: 'HTML com placeholders; publicar template. Só Publicado gera documento da proposta.',
    dica: 'Tela Template.',
  }),
}

function wrapNarrative(id, htmlBody) {
  return {
    id: `${NARR}${id.replace('step-atlas-fase1-', '')}`,
    title: `📖 Explicação`,
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: 'Como funciona',
    htmlContent: box('Antes da tela do sistema', htmlBody, { border: '#6366f1', bg: '#eef2ff' }),
  }
}

function cloneProcessWithNarratives(steps) {
  const idMap = Object.fromEntries(steps.map((s) => [s.id, `${SYS}${s.id}`]))
  const out = []
  let passo = 0
  for (const step of steps) {
    const narr = NARRATIVES[step.id]
    if (narr) {
      passo += 1
      out.push({
        ...wrapNarrative(step.id, narr),
        title: `📖 Passo ${passo} — ${step.title}`,
      })
    }
    const copy = structuredClone(step)
    copy.id = idMap[step.id]
    const screenTitle = step.title.startsWith('Passo ') ? step.title : `🖥️ Tela — ${step.title}`
    copy.title = narr ? `${screenTitle} (protótipo)` : screenTitle
    if (copy.bpmnFormConfirmNavigateStepId && idMap[copy.bpmnFormConfirmNavigateStepId]) {
      copy.bpmnFormConfirmNavigateStepId = idMap[copy.bpmnFormConfirmNavigateStepId]
    }
    if (copy.bpmnPossiblePaths) {
      copy.bpmnPossiblePaths = copy.bpmnPossiblePaths.map((p) => ({
        ...p,
        value: idMap[p.value] ?? p.value,
      }))
    }
    if (copy.classMethodNavigateStepIds) {
      const next = {}
      for (const [k, v] of Object.entries(copy.classMethodNavigateStepIds)) {
        next[k] = idMap[v] ?? v
      }
      copy.classMethodNavigateStepIds = next
    }
    out.push(copy)
  }
  return out
}

const HTML_CAPA =
  `<div style="${CSS};padding:36px;background:linear-gradient(135deg,#0c1ba8,#1e3a8a);color:#fff;border-radius:14px">` +
  `<p style="margin:0 0 8px;font-size:12px;opacity:.9;letter-spacing:.1em;text-transform:uppercase">Atlas · DIRC</p>` +
  `<h1 style="margin:0 0 12px;font-size:2rem">Como funciona o sistema — Fase 1</h1>` +
  `<p style="margin:0 0 20px;max-width:680px;line-height:1.6">Apresentação passo a passo: <strong>qual tela usar</strong>, ` +
  `<strong>quais classes e campos preencher</strong>, o que acontece depois e para onde o processo segue. ` +
  `Cada etapa tem um slide explicativo e, em seguida, a <strong>tela interativa</strong> do protótipo (formulário real).</p>` +
  `<ul style="margin:0;padding-left:1.2rem;font-size:14px;line-height:1.8">` +
  `<li>📖 = explicação · 🖥️ = tela do sistema</li>` +
  `<li>18 passos do processo + cadastros de apoio</li>` +
  `<li>IDs técnicos para homologação e treinamento</li></ul></div>`

const HTML_COMO =
  box(
    'Como ler esta apresentação',
    `<ol style="margin:0;padding-left:1.2rem;font-size:14px">` +
      `<li><strong>Slide 📖</strong> — texto: onde clicar, classe, campos, próximo passo.</li>` +
      `<li><strong>Slide 🖥️</strong> — formulário/workspace real (é a “imagem” interativa do sistema).</li>` +
      `<li><strong>Botão verde</strong> (BPMN) — simula “salvar e avançar”.</li>` +
      `<li><strong>Mostrar specs</strong> — regras de negócio por campo.</li>` +
      `<li>Exporte ZIP e publique na Netlify para compartilhar link com stakeholders.</li></ol>`,
  )

const HTML_FLUXO =
  box(
    'Fluxo completo em uma página',
    `<pre style="background:#fff;border:1px solid #e2e8f0;padding:16px;border-radius:8px;font-size:11px;line-height:1.5;overflow:auto;margin:0">` +
      `CADASTROS: Organização → Pessoa/Usuário → Workflow → Template → Catálogo\n\n` +
      `PROCESSO:\n` +
      `1 Início → 2 Proposta (demanda) → 3 Itens catálogo → 4 Documento → 5 Prévia\n` +
      `→ 6 Revisão → 7-9 Assinaturas → 10 Envio cliente → 11 Espera externa\n` +
      `→ 12 Receber contrato → 13 Revisar itens → 14 Rascunho → 15 Checklist\n` +
      `→ 16 Finalizar → 17 Notificar → 18 Fim</pre>` +
      `<p style="margin:12px 0 0;font-size:13px;color:#64748b">Fluxo técnico: flow-atlas-fase1-proposta-contrato</p>`,
  )

const introSteps = [
  {
    id: 'step-sys-capa',
    title: '0. Capa — Como funciona o sistema',
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: 'Atlas Fase 1',
    htmlContent: HTML_CAPA,
  },
  { id: 'step-sys-como', title: '0.1 Como usar', type: 'html', htmlContent: HTML_COMO },
  { id: 'step-sys-fluxo', title: '0.2 Fluxo completo', type: 'html', htmlContent: HTML_FLUXO },
  {
    id: 'step-sys-ws-workflow',
    title: '🖥️ Workspace — Workflow e documentos',
    type: 'workspace',
    linkedWorkspaceId: 'ws-atlas-fase1-workflow',
    workspacePresentationDescription: 'Onde configurar governança, modelos, templates e ver integrações.',
  },
  {
    id: 'step-sys-sec-prep',
    title: '§ Cadastros antes do processo',
    type: 'html',
    htmlContent: box('Preparação do ambiente', '<p style="margin:0">Cadastre uma vez; depois percorra os 18 passos.</p>', {
      border: '#f59e0b',
      bg: '#fffbeb',
    }),
  },
  {
    id: 'step-sys-narr-organizacao',
    title: '📖 Organização — explicação',
    type: 'html',
    htmlContent: box('Cadastro de apoio', PREP_NARR.organizacao, { border: '#6366f1', bg: '#eef2ff' }),
  },
  {
    id: 'step-sys-class-organizacao',
    title: '🖥️ Tela — Organização',
    type: 'class',
    linkedFormId: 'form-atlas-organizacao',
    classPresentationTitle: 'Organização',
    classPresentationDescription: 'Cliente e parceiros da proposta.',
  },
  {
    id: 'step-sys-narr-pessoa',
    title: '📖 Pessoa — explicação',
    type: 'html',
    htmlContent: box('Cadastro de apoio', PREP_NARR.pessoa, { border: '#6366f1', bg: '#eef2ff' }),
  },
  {
    id: 'step-sys-class-pessoa',
    title: '🖥️ Tela — Pessoa',
    type: 'class',
    linkedFormId: 'form-atlas-pessoa',
    classPresentationTitle: 'Pessoa',
  },
  {
    id: 'step-sys-narr-usuario',
    title: '📖 Usuário — explicação',
    type: 'html',
    htmlContent: box('Cadastro de apoio', PREP_NARR.usuario, { border: '#6366f1', bg: '#eef2ff' }),
  },
  {
    id: 'step-sys-class-usuario',
    title: '🖥️ Tela — Usuário',
    type: 'class',
    linkedFormId: 'form-atlas-usuario',
    classPresentationTitle: 'Usuário',
  },
  {
    id: 'step-sys-narr-wf',
    title: '📖 Workflow — explicação',
    type: 'html',
    htmlContent: box('Configuração', PREP_NARR.wf, { border: '#6366f1', bg: '#eef2ff' }),
  },
  {
    id: 'step-sys-class-wf-modelo',
    title: '🖥️ Tela — Modelo workflow',
    type: 'class',
    linkedFormId: 'form-atlas-workflow-modelo',
    classPresentationTitle: 'Modelo de workflow',
    classMethodNavigateStepIds: { 'atlas-wfm-meth-criar-versao': 'step-sys-class-wf-versao' },
  },
  {
    id: 'step-sys-class-wf-versao',
    title: '🖥️ Tela — Versão workflow',
    type: 'class',
    linkedFormId: 'form-atlas-workflow-versao',
    classPresentationTitle: 'Versão do workflow',
  },
  {
    id: 'step-sys-class-wf-etapa',
    title: '🖥️ Tela — Etapa workflow',
    type: 'class',
    linkedFormId: 'form-atlas-workflow-etapa',
    classPresentationTitle: 'Etapa',
  },
  {
    id: 'step-sys-narr-template',
    title: '📖 Template documento — explicação',
    type: 'html',
    htmlContent: box('Configuração', PREP_NARR.template, { border: '#6366f1', bg: '#eef2ff' }),
  },
  {
    id: 'step-sys-class-doc-template',
    title: '🖥️ Tela — Template documento',
    type: 'class',
    linkedFormId: 'form-atlas-documento-template',
    classPresentationTitle: 'Template de documento',
  },
  {
    id: 'step-sys-class-doc-gerado',
    title: '🖥️ Tela — Documento gerado',
    type: 'class',
    linkedFormId: 'form-atlas-documento-gerado',
    classPresentationTitle: 'Documento gerado (resultado da geração)',
  },
  {
    id: 'step-sys-ws-propostas',
    title: '🖥️ Workspace — Propostas',
    type: 'workspace',
    linkedWorkspaceId: 'ws-atlas-propostas',
    workspacePresentationDescription: 'Onde operar propostas no dia a dia.',
  },
  {
    id: 'step-sys-sec-processo',
    title: '§ Processo principal (18 passos)',
    type: 'html',
    htmlContent: box('Processo', '<p style="margin:0">A partir daqui: par 📖 explicação + 🖥️ tela para cada passo.</p>', {
      border: '#3b82f6',
      bg: '#eff6ff',
    }),
  },
]

const processSteps = cloneProcessWithNarratives(flowFase1PropostaContrato.steps)

const posSteps = [
  {
    id: 'step-sys-sec-pos',
    title: '§ Depois do processo',
    type: 'html',
    htmlContent: box('Acompanhamento', '<p style="margin:0">Visões e referências para operação contínua.</p>', {
      border: '#22c55e',
      bg: '#f0fdf4',
    }),
  },
  {
    id: 'step-sys-class-visao',
    title: '🖥️ Visão operacional Fase 1',
    type: 'class',
    linkedFormId: 'form-atlas-visao-fase1-operacional',
    classPresentationTitle: 'Painel de pendências e contratos em cadastro',
  },
  {
    id: 'step-sys-ws-contratos',
    title: '🖥️ Workspace — Contratos',
    type: 'workspace',
    linkedWorkspaceId: 'ws-atlas-contratos-raer',
    workspacePresentationDescription: 'Processos contratuais, rascunhos e checklist.',
  },
  {
    id: 'step-sys-export',
    title: 'Compartilhar apresentação',
    type: 'html',
    htmlContent: box(
      'Exportar e publicar',
      `<p style="margin:0 0 12px">No terminal do projeto:</p>` +
        `<pre style="background:#1e293b;color:#e2e8f0;padding:12px;border-radius:6px;font-size:13px">npm run atlas:sistema-export</pre>` +
        `<p style="margin:12px 0 0;font-size:14px">ZIP em <code>exports/zips/fase-1-sistema-presentation.zip</code> → arraste em ` +
        `<a href="https://app.netlify.com/drop">Netlify Drop</a> para link público com todas as telas interativas.</p>`,
      { border: '#a855f7', bg: '#faf5ff' },
    ),
  },
]

export const flowFase1Sistema = {
  id: 'flow-atlas-fase1-sistema',
  name: 'Atlas Fase 1 — Como funciona o sistema',
  steps: [...introSteps, ...processSteps, ...posSteps],
}

export const sistemaFlows = [flowFase1Sistema]
