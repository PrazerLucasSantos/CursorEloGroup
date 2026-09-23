/**
 * Nova apresentação em formato de requisitos (negócio).
 * Sem FigJam, sem IDs técnicos (form-*, class-*, etc.).
 * Acrescenta fluxo `flow-nen-requisitos` em flows.json (preserva o fluxo técnico).
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

const C = {
  brand: '#9d174d',
  soft: '#fdf2f8',
  ink: '#0f172a',
  muted: '#475569',
  border: '#e2e8f0',
  ok: '#166534',
  okBg: '#f0fdf4',
  warn: '#b45309',
  warnBg: '#fffbeb',
  info: '#1e4b9e',
  infoBg: '#e8eef8',
  slate: '#f8fafc',
}

const TYPE_PT = {
  text: 'Texto',
  textOptions: 'Lista de opções',
  number: 'Número',
  date: 'Data',
  boolean: 'Caixa de seleção (Sim/Não)',
  file: 'Arquivo / anexo',
  embeddedReference: 'Tabela de registros',
  reference: 'Vínculo / referência',
  alert: 'Orientação',
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wrap(inner) {
  return `<div style="padding:24px 40px 52px;max-width:1040px;margin:0 auto;font-family:Segoe UI,Inter,system-ui,sans-serif;color:${C.ink};line-height:1.55;font-size:14px;">${inner}</div>`
}

function eyebrow(t) {
  return `<div style="font-size:0.72rem;color:${C.brand};font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px;">${esc(t)}</div>`
}

function h1(t) {
  return `<h1 style="font-size:1.5rem;margin:0 0 10px;color:${C.brand};line-height:1.25;">${esc(t)}</h1>`
}

function h2(t) {
  return `<h2 style="font-size:1.05rem;margin:18px 0 8px;color:${C.brand};">${esc(t)}</h2>`
}

function p(t) {
  return `<p style="margin:0 0 12px;color:${C.muted};">${t}</p>`
}

function callout(title, body, tone = 'brand') {
  const map = {
    brand: [C.brand, C.soft],
    warn: [C.warn, C.warnBg],
    ok: [C.ok, C.okBg],
    info: [C.info, C.infoBg],
    slate: ['#64748b', C.slate],
  }
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
  const th = headers
    .map((h) => `<th style="padding:8px 9px;text-align:left;background:${C.brand};color:#fff;font-size:11px;font-weight:600;vertical-align:top;">${esc(h)}</th>`)
    .join('')
  const tr = rows
    .map((r, i) => {
      const bg = i % 2 ? C.slate : '#fff'
      return `<tr style="background:${bg}">${r
        .map((c) => `<td style="padding:7px 9px;border-bottom:1px solid ${C.border};font-size:12px;vertical-align:top;color:#334155;">${c}</td>`)
        .join('')}</tr>`
    })
    .join('')
  return `<div style="overflow-x:auto;margin:8px 0 14px;"><table style="width:100%;border-collapse:collapse;min-width:720px;"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`
}

function htmlStep(id, title, header, body) {
  return {
    id,
    title,
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: header,
    htmlContent: wrap(body),
  }
}

function protoStep(id, title, linkedFormId, description) {
  return {
    id,
    title,
    type: 'class',
    linkedFormId,
    classPresentationTitle: title,
    classPresentationDescription: description,
  }
}

function fieldOpts(field) {
  const o = field.options || []
  if (!o.length) return '—'
  return o.map((v) => (typeof v === 'string' ? v : v.label || v.value || String(v))).join(' · ')
}

function cleanSpec(spec) {
  return String(spec || '')
    .replace(/\bform-nen-[\w-]+/gi, 'tela correspondente')
    .replace(/\bnen-[\w-]+/gi, '')
    .replace(/\bRQ\.\d+/gi, '')
    .replace(/\bPDF\s*§\d+/gi, '')
    .replace(/\bFigJam[^.]*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function fieldRule(field) {
  const bits = []
  if (field.required) bits.push('Obrigatório')
  else bits.push('Opcional')
  if (field.readOnly) bits.push('somente leitura')
  if (field.hidden) bits.push('aparece conforme regra / status')
  const spec = cleanSpec(field.spec)
  if (spec) bits.push(spec.slice(0, 160))
  return bits.join(' — ')
}

function modoUso(field, defaultActor) {
  if (field.readOnly && /sistema|gerado|calculado|pré-preench|MT Login|JUCEMAT|Validador/i.test(field.spec || '')) {
    return 'Sistema / integração'
  }
  if (field.readOnly) return 'Sistema (leitura)'
  if (field.type === 'file' && defaultActor === 'Solicitante') return 'Solicitante (upload)'
  if (field.type === 'file' && defaultActor === 'PROCON') return 'PROCON (upload)'
  return defaultActor
}

function typePt(t) {
  return TYPE_PT[t] || t || '—'
}

function fieldsTable(fields, defaultActor) {
  const visible = fields.filter((f) => f.label && f.type !== 'alert')
  if (!visible.length) return callout('Campos', 'Nenhum campo nesta seção.', 'slate')
  return table(
    ['Nome do campo', 'Tipo', 'Regra', 'Opções disponíveis', 'Modo de uso'],
    visible.map((f) => [
      esc(f.label),
      esc(typePt(f.type)),
      esc(fieldRule(f)),
      esc(fieldOpts(f)),
      esc(modoUso(f, defaultActor)),
    ]),
  )
}

function reqBlock(title, necessidade, contexto, requisitos, regras, camposHtml, acoes) {
  return (
    eyebrow('Documento de requisitos') +
    h1(title) +
    h2('História / necessidade') +
    p(necessidade) +
    h2('Contexto e modo de uso') +
    (Array.isArray(contexto) ? ul(contexto) : p(contexto)) +
    h2('Requisitos') +
    ul(requisitos) +
    h2('Regras de negócio') +
    ul(regras) +
    (acoes?.length ? h2('Ações disponíveis') + ul(acoes) : '') +
    h2('Campos') +
    camposHtml
  )
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function formById(forms, id) {
  return forms.find((f) => f.id === id)
}

function sectionFields(form, sectionId) {
  return (form.fields || []).filter((f) => f.sectionId === sectionId)
}

function orphanFields(form) {
  return (form.fields || []).filter((f) => !f.sectionId)
}

function buildRequisitosFlow(forms) {
  const F = {
    acesso: formById(forms, 'form-nen-acesso'),
    cap: formById(forms, 'form-nen-capacitado'),
    sol: formById(forms, 'form-nen-solicitacao'),
    aj: formById(forms, 'form-nen-ajustes'),
    rec: formById(forms, 'form-nen-recurso'),
    ad: formById(forms, 'form-nen-analise-decisao'),
    atd: formById(forms, 'form-nen-atender'),
    selo: formById(forms, 'form-nen-estabelecimento-selo'),
    ren: formById(forms, 'form-nen-renovacao'),
    can: formById(forms, 'form-nen-cancelamento'),
    rev: formById(forms, 'form-nen-revogacao'),
    an: formById(forms, 'form-nen-analytics'),
  }

  const steps = []

  // ——— Capa ———
  steps.push(
    htmlStep(
      'req-capa',
      'Capa',
      'Requisitos · Selo Não é Não',
      eyebrow('PROCON-MT · Mulheres Seguras') +
        h1('Selo “Não é Não – Mulheres Seguras”') +
        p('Documento de requisitos do serviço digital: solicitação, análise, concessão, renovação, cancelamento a pedido e revogação administrativa.') +
        callout(
          'Como ler esta apresentação',
          'Cada tela do serviço é descrita com: <strong>história</strong>, <strong>contexto e modo de uso</strong>, <strong>requisitos</strong>, <strong>regras de negócio</strong> e tabela de <strong>campos</strong> (nome, tipo, regra, opções, modo de uso). Em seguida vem o <strong>protótipo</strong> navegável.',
          'brand',
        ) +
        ol([
          'História e contexto do serviço',
          'Atores, escopo e ciclo de vida (status)',
          'Requisitos por tela / etapa',
          'Protótipos para validação',
          'Pendências de negócio',
        ]),
    ),
  )

  // ——— História ———
  steps.push(
    htmlStep(
      'req-historia',
      'História do serviço',
      'História',
      eyebrow('Por que este serviço existe') +
        h1('História') +
        p(
          'O Estado de Mato Grosso institui o selo <strong>“Não é Não – Mulheres Seguras”</strong> para reconhecer estabelecimentos que implementam o Protocolo Não é Não — capacitação da equipe, sinalização, procedimentos de acolhimento e articulação com a rede de proteção.',
        ) +
        p(
          'Hoje o processo depende de tramitação fragmentada. O serviço digital concentra o pedido do estabelecimento, a análise do PROCON, a decisão da autoridade, a emissão do certificado com consulta de autenticidade e o ciclo pós-concessão (renovar, cancelar a pedido ou revogar).',
        ) +
        callout(
          'Resultado esperado',
          'Estabelecimentos elegíveis solicitam com evidências; o PROCON analisa e decide com rastreabilidade; o cidadão confere a autenticidade do selo; a gestão acompanha indicadores no MVP.',
          'ok',
        ) +
        callout(
          'Curso ≠ Selo',
          'O certificado do curso é da <strong>pessoa capacitada</strong> (Escola de Governo). O selo é do <strong>estabelecimento</strong> e só nasce no deferimento (ou no recurso provido).',
          'info',
        ),
    ),
  )

  // ——— Contexto geral ———
  steps.push(
    htmlStep(
      'req-contexto',
      'Contexto e atores',
      'Contexto',
      eyebrow('Quem usa e como') +
        h1('Contexto e modo de uso geral') +
        table(
          ['Ator', 'Canal', 'O que faz'],
          [
            ['Solicitante (estabelecimento)', 'Portal do estabelecimento', 'Autentica, seleciona unidade, preenche pedido, responde diligência, recorre, renova e cancela a pedido'],
            ['Analista PROCON', 'Área de trabalho PROCON', 'Analisa requisitos, abre diligência única, encaminha para decisão'],
            ['Autoridade PROCON', 'Área de trabalho PROCON', 'Defere ou indefere; julga recurso; registra revogação'],
            ['Cidadão', 'Validador MT (QR)', 'Consulta autenticidade do certificado'],
            ['Gestão PROCON', 'Relatórios', 'Acompanha volume, prazos e selos vigentes (MVP)'],
          ],
        ) +
        h2('Integrações desta entrega') +
        ul([
          '<strong>MT Login</strong> — autenticação do solicitante',
          '<strong>JUCEMAT</strong> — lista e dados dos estabelecimentos vinculados',
          '<strong>Validador MT</strong> — autenticidade do certificado via QR',
        ]) +
        callout(
          'Fora do escopo desta entrega',
          'Módulo de denúncia, fiscalização ou apuração; integração Sigadoc; Procon Digital; publicação automática da lista em outros sites; arte visual final do selo (SECOM / Gabinete da Mulher).',
          'slate',
        ),
    ),
  )

  // ——— Escopo + status ———
  steps.push(
    htmlStep(
      'req-escopo-status',
      'Escopo e ciclo de vida',
      'Escopo',
      eyebrow('Um serviço') +
        h1('Escopo e status') +
        h2('No escopo') +
        ul([
          'Acesso e seleção do estabelecimento',
          'Solicitação com evidências e protocolização',
          'Análise, diligência (5 dias), decisão e recurso',
          'Emissão do selo / certificado com QR',
          'Renovação, cancelamento a pedido e revogação administrativa',
          'Relatórios e exportação no MVP',
        ]) +
        h2('Status do pedido') +
        p('RASCUNHO → PROTOCOLADO → AGUARDANDO ATENDIMENTO → EM ANÁLISE → EM DILIGÊNCIA → DILIGÊNCIA RESPONDIDA | DILIGÊNCIA NÃO RESPONDIDA → PRONTO PARA DECISÃO → DEFERIDO | INDEFERIDO → EM RECURSO → FINALIZADO (quando aplicável).') +
        h2('Status do selo') +
        p('VIGENTE → EXPIRADO | CANCELADO A PEDIDO | REVOGADO. Validade = data de concessão + <strong>24 meses</strong> (até o decreto definir em contrário).') +
        h2('Regras gerais') +
        ul([
          'Prazo de análise/decisão: até 30 dias (minuta), suspenso durante diligência',
          'Diligência única: todas as pendências de uma vez; prazo 5 dias',
          'Ausência de resposta à diligência não gera indeferimento automático',
          'Não deferir com requisito obrigatório marcado como “não conforme”',
        ]),
    ),
  )

  // ——— Acesso ———
  steps.push(
    htmlStep(
      'req-acesso',
      'Acesso ao serviço',
      'Requisitos',
      reqBlock(
        'Acesso ao serviço (autenticação e estabelecimento)',
        'Permitir que o responsável do estabelecimento entre com a identidade digital do Estado, veja apenas as unidades às quais está vinculado e escolha a unidade do pedido — exigindo documento de representação quando não for o responsável cadastral.',
        [
          'O solicitante autentica-se e recebe a lista de estabelecimentos vinculados.',
          'Seleciona a unidade que será objeto do selo.',
          'Se não for o legitimado direto, anexa procuração ou documento equivalente.',
          'Só então inicia o preenchimento da solicitação.',
        ],
        [
          'Autenticar o solicitante exclusivamente via MT Login.',
          'Listar estabelecimentos vinculados por meio da JUCEMAT.',
          'Vincular o requerimento à unidade selecionada.',
          'Exigir documento de representação quando o solicitante não for o responsável cadastral.',
        ],
        [
          'Somente empresas retornadas pela JUCEMAT e vinculadas ao usuário podem ser selecionadas.',
          'Sem autenticação válida, o acesso à solicitação é bloqueado.',
          'Regra fina de quem pode solicitar (sócio, representante, matriz/filial): a confirmar com o negócio.',
        ],
        fieldsTable(orphanFields(F.acesso).length ? orphanFields(F.acesso) : F.acesso.fields, 'Solicitante / Sistema'),
        ['Entrar (MT Login)', 'Continuar para solicitação'],
      ),
    ),
  )
  steps.push(
    protoStep(
      'req-proto-acesso',
      'Protótipo — Acesso',
      'form-nen-acesso',
      'Protótipo da tela de acesso: autenticação, seleção do estabelecimento e documento de representação quando necessário.',
    ),
  )

  // ——— Capacitado ———
  steps.push(
    htmlStep(
      'req-capacitado',
      'Capacitados',
      'Requisitos',
      reqBlock(
        'Registro de capacitados',
        'Registrar cada pessoa da equipe capacitada no Protocolo Não é Não, com certificado individual e comprovante de vínculo com o estabelecimento.',
        [
          'Informado dentro da solicitação, como lista repetível (um registro por pessoa).',
          'O curso é oferecido pela Escola de Governo; o sistema apenas recebe o certificado.',
          'Serve para cálculo do percentual e para a análise de conformidade da equipe.',
        ],
        [
          'Permitir N capacitados por solicitação, cada um com nome, função, vínculo, curso, data, certificado e comprovante.',
          'Exibir e armazenar os capacitados vinculados ao pedido para análise do PROCON.',
        ],
        [
          'Cada capacitado deve ter certificado e comprovante de vínculo no próprio registro.',
          'Tipos de vínculo: empregatício, prestação de serviço, terceirizado, sócio ou outro documento idôneo.',
          'Mínimo de capacitados na solicitação: ao menos 2; se equipe > 300, mínimo 10% (confirmar redação do decreto).',
        ],
        fieldsTable(F.cap.fields, 'Solicitante'),
      ),
    ),
  )
  steps.push(
    protoStep(
      'req-proto-capacitado',
      'Protótipo — Capacitado',
      'form-nen-capacitado',
      'Protótipo do registro de cada pessoa capacitada (certificado + vínculo).',
    ),
  )

  // ——— Solicitação (visão + por aba) ———
  steps.push(
    htmlStep(
      'req-solicitacao',
      'Solicitação do selo',
      'Requisitos',
      reqBlock(
        'Solicitação do selo',
        'Coletar dados e evidências necessários à concessão: cadastro da unidade (com foto da fachada), enquadramento, equipe/capacitados, sinalização (dois locais com foto), procedimentos do protocolo, câmeras (se houver) e declarações finais — com rascunho, revisão e protocolização.',
        [
          'O solicitante preenche por abas no portal.',
          'Dados cadastrais preferencialmente pré-preenchidos após a seleção do estabelecimento.',
          'Na revisão, confere tudo e protocola; o sistema gera número, comprovante e notifica o PROCON.',
          'Conteúdo legal do cartaz (190, 180, A3, forma de acionar) é conferido pelo analista, não como pergunta Sim/Não nesta tela.',
        ],
        [
          'Disponibilizar as abas: Dados, Enquadramento, Equipe, Sinalização, Procedimentos, Câmeras e Declarações.',
          'Calcular o percentual de capacitados e bloquear avanço abaixo do mínimo.',
          'Permitir salvar rascunho; revisar; protocolar com declaração de conferência.',
          'Gerar protocolo, data/hora, comprovante e status PROTOCOLADO; notificar o PROCON.',
        ],
        [
          'Percentual = capacitados ÷ equipe (exibido automaticamente).',
          'Ausência de câmera não reprova; se houver câmera e negar preservação ≥ 30 dias ou acesso legal → não conformidade.',
          'Sinalização na solicitação = 2 perguntas + 2 fotos (banheiro feminino e local de ampla visualização).',
          'Bloquear protocolização se faltarem obrigatórios, se capacitados < mínimo ou se a declaração de revisão não estiver marcada.',
          'Após PROTOCOLADO, o solicitante não edita livremente — alterações passam por diligência.',
        ],
        callout('Campos por aba', 'As próximas páginas detalham os campos de cada aba da solicitação.', 'info') +
          p('Abas: ' + (F.sol.sections || []).map((s) => s.title).join(' · ')),
        ['Salvar rascunho', 'Avançar / Revisar', 'Protocolar solicitação'],
      ),
    ),
  )

  for (const sec of F.sol.sections || []) {
    steps.push(
      htmlStep(
        `req-sol-${sec.id}`,
        `Solicitação · ${sec.title}`,
        'Campos',
        eyebrow('Solicitação do selo') +
          h1(`Aba: ${sec.title}`) +
          p('Campos desta aba — nome, tipo, regra, opções e quem preenche.') +
          fieldsTable(sectionFields(F.sol, sec.id), 'Solicitante'),
      ),
    )
  }

  steps.push(
    protoStep(
      'req-proto-solicitacao',
      'Protótipo — Solicitação',
      'form-nen-solicitacao',
      'Protótipo completo da solicitação (todas as abas, rascunho, revisão e protocolização).',
    ),
  )

  // ——— Análise e Decisão ———
  steps.push(
    htmlStep(
      'req-analise',
      'Análise e decisão',
      'Requisitos',
      reqBlock(
        'Análise e decisão (PROCON)',
        'Concentrar no PROCON a análise dos requisitos (conforme / não conforme / necessita complementação), a diligência única, o encaminhamento à autoridade e o deferimento ou indeferimento — com emissão do selo no deferimento e caminho de recurso no indeferimento.',
        [
          'Após o protocolo, o pedido entra na fila do PROCON.',
          'O analista abre o atendimento, vê o pedido embutido e preenche o checklist por bloco e o cartaz.',
          'Se houver pendências: abre diligência (todas de uma vez), prazo de 5 dias, notifica o estabelecimento.',
          'Se estiver pronto: autoridade defere (emite selo) ou indefere (fundamenta e informa recurso).',
          'As abas do atendimento mudam conforme o status (análise, diligência, decisão, recurso).',
        ],
        [
          'Exibir cabeçalho do processo (protocolo, status, estabelecimento, analista, prazo).',
          'Permitir conclusão por bloco: Conforme / Não conforme / Necessita complementação, com texto de complementação quando aplicável.',
          'Conferir no cartaz: forma de acionar, 190, 180, formato A3/texto oficial e Sinal Vermelho.',
          'Abrir diligência única com lista consolidada, prazo de 5 dias e notificação.',
          'Registrar diligência respondida ou não respondida e retomar análise.',
          'Deferir (emitir certificado + QR + incluir na lista de selos + notificar) ou indeferir com fundamentação.',
          'Julgar recurso: provido emite selo; não provido finaliza.',
        ],
        [
          'Não deferir com item obrigatório “não conforme”.',
          'Diligência é única — todas as pendências de uma vez.',
          'Ausência de resposta não indeferir automaticamente.',
          'Deferimento gera número do selo, certificado, QR, validade (concessão + 24 meses), status VIGENTE e notificações.',
          'Julgamento do recurso ocorre nesta tela de trabalho; a peça do solicitante traz só razões e anexos.',
        ],
        sectionCatalogHtml(F.ad) +
          callout('Detalhamento', 'As próximas páginas listam os campos por aba da análise/decisão e do atendimento.', 'info'),
        [
          'Atender',
          'Salvar',
          'Abrir diligência',
          'Enviar para decisão',
          'Registrar diligência respondida / não respondida',
          'Retomar análise',
          'Deferir / Indeferir',
          'Baixar certificado',
          'Registrar recurso / Julgar recurso',
        ],
      ),
    ),
  )

  function sectionCatalogHtml(form) {
    const rows = (form.sections || [])
      .filter((s) => !s.parentSectionId)
      .map((s) => {
        const n = sectionFields(form, s.id).length
        const children = (form.sections || []).filter((c) => c.parentSectionId === s.id)
        const extra = children.length ? ` (subabas: ${children.map((c) => c.title).join(', ')})` : ''
        return [esc(s.title + extra), String(n + children.reduce((a, c) => a + sectionFields(form, c.id).length, 0))]
      })
    return table(['Aba', 'Qtd. de campos'], rows)
  }

  for (const sec of (F.ad.sections || []).filter((s) => !s.parentSectionId)) {
    const children = (F.ad.sections || []).filter((c) => c.parentSectionId === sec.id)
    let body = eyebrow('Análise e decisão') + h1(`Aba: ${sec.title}`) + p('Campos desta aba.')
    if (children.length) {
      for (const c of children) {
        body += h2(c.title) + fieldsTable(sectionFields(F.ad, c.id), 'Analista / Autoridade PROCON')
      }
    }
    const own = sectionFields(F.ad, sec.id)
    if (own.length) body += fieldsTable(own, 'Analista / Autoridade PROCON')
    steps.push(htmlStep(`req-ad-${sec.id}`, `Análise · ${sec.title}`, 'Campos', body))
  }

  steps.push(
    htmlStep(
      'req-atender-status',
      'Atendimento por status',
      'Modo de uso',
      eyebrow('Como o analista trabalha') +
        h1('Atendimento: abas conforme o status') +
        p('Ao clicar em <strong>Atender</strong>, abre-se a tela de trabalho com o pedido embutido no topo de cada aba. Só aparecem as abas pertinentes ao status atual.') +
        table(
          ['Status do pedido', 'Abas disponíveis'],
          [
            ['EM ANÁLISE (e fila)', 'Contexto · Checklist · Cartaz · Apoio'],
            ['EM DILIGÊNCIA', 'Contexto · Diligência'],
            ['Diligência respondida ou não respondida', 'Contexto · Diligência · Checklist · Cartaz · Apoio'],
            ['PRONTO PARA DECISÃO', 'Contexto · Checklist · Cartaz · Apoio · Decisão'],
            ['EM RECURSO', 'Contexto · Recurso'],
          ],
        ) +
        h2('Campos do atendimento (por aba)') +
        p('Mesma lógica de análise; organizados para o trabalho diário.'),
    ),
  )

  for (const sec of F.atd.sections || []) {
    steps.push(
      htmlStep(
        `req-atd-${sec.id}`,
        `Atender · ${sec.title}`,
        'Campos',
        eyebrow('Tela Atender') +
          h1(`Aba: ${sec.title}`) +
          fieldsTable(
            sectionFields(F.atd, sec.id).filter((f) => f.type !== 'embeddedReference'),
            'Analista / Autoridade PROCON',
          ),
      ),
    )
  }

  steps.push(
    protoStep(
      'req-proto-analise',
      'Protótipo — Análise e decisão',
      'form-nen-analise-decisao',
      'Protótipo da área de trabalho do PROCON (processo, análise, diligência, decisão, resultado e recurso). Use os exemplos por status e o método Atender.',
    ),
  )
  steps.push(
    protoStep(
      'req-proto-atender',
      'Protótipo — Atender',
      'form-nen-atender',
      'Protótipo da tela de atendimento com abas filtradas pelo status do pedido.',
    ),
  )

  // ——— Ajustes ———
  steps.push(
    htmlStep(
      'req-ajustes',
      'Complementação (diligência)',
      'Requisitos',
      reqBlock(
        'Complementação do estabelecimento (diligência)',
        'Permitir que o estabelecimento complemente, em uma única rodada, todas as pendências indicadas pelo PROCON, no prazo de 5 dias.',
        [
          'O estabelecimento é notificado quando a diligência é aberta.',
          'Vê a lista completa de pendências, responde e anexa o que for pedido.',
          'Ao enviar, o pedido volta como diligência respondida; se o prazo vencer sem resposta, segue para decisão com os elementos dos autos.',
        ],
        [
          'Exibir a lista completa de pendências abertas pelo analista.',
          'Permitir resposta textual e anexos no prazo de 5 dias.',
          'Ao enviar, marcar diligência respondida e notificar o PROCON.',
        ],
        [
          'Diligência única — todas as pendências na mesma peça.',
          'Prazo de 5 dias; suspende a contagem do prazo de análise.',
          'Ausência de resposta não gera indeferimento automático.',
        ],
        fieldsTable(F.aj.fields, 'Solicitante'),
        ['Enviar complementação'],
      ),
    ),
  )
  steps.push(
    protoStep(
      'req-proto-ajustes',
      'Protótipo — Complementação',
      'form-nen-ajustes',
      'Protótipo da peça de diligência preenchida pelo estabelecimento.',
    ),
  )

  // ——— Recurso ———
  steps.push(
    htmlStep(
      'req-recurso',
      'Recurso do indeferimento',
      'Requisitos',
      reqBlock(
        'Recurso',
        'Permitir ao estabelecimento recorrer do indeferimento com razões e anexos, e à autoridade julgar como provido (emite selo) ou não provido (finaliza).',
        [
          'Após indeferimento, o solicitante apresenta o recurso no portal.',
          'A autoridade julga na área de trabalho (não nesta peça).',
          'Prazo e cabimento: confirmar no decreto (ou, subsidiariamente, legislação estadual aplicável).',
        ],
        [
          'Permitir razões do recurso e anexos opcionais, mudando o status para EM RECURSO.',
          'Permitir decisão Provido / Não provido com fundamentação.',
          'Provido → mesmos efeitos do deferimento; não provido → FINALIZADO.',
        ],
        [
          'Provido emite selo; não provido finaliza.',
          'A peça do solicitante não contém o julgamento — só razões e anexos.',
        ],
        fieldsTable(F.rec.fields, 'Solicitante'),
        ['Apresentar recurso'],
      ),
    ),
  )
  steps.push(
    protoStep(
      'req-proto-recurso',
      'Protótipo — Recurso',
      'form-nen-recurso',
      'Protótipo da peça de recurso do estabelecimento (razões e anexos).',
    ),
  )

  // ——— Selo ———
  steps.push(
    htmlStep(
      'req-selo',
      'Estabelecimentos com selo',
      'Requisitos',
      reqBlock(
        'Cadastro de estabelecimentos com selo',
        'Manter o cadastro dos estabelecimentos certificados, com número, validade, QR de autenticidade e status — base para consulta, filtro, exportação e download do certificado no MVP.',
        [
          'Registro criado no deferimento ou no recurso provido.',
          'Cidadão confere autenticidade pelo QR no Validador MT.',
          'Gestão filtra/exporta; estabelecimento baixa o certificado.',
          'Atalhos para renovar, cancelar a pedido ou revogar (conforme perfil).',
        ],
        [
          'Ao deferir (ou recurso provido), criar/atualizar registro com número, datas, QR e status VIGENTE.',
          'Atualizar em expiração, cancelamento a pedido e revogação, removendo da lista de vigentes.',
          'Permitir filtrar, exportar e baixar o certificado.',
          'Integrar o QR ao Validador MT.',
        ],
        [
          'Status inicial: VIGENTE.',
          'Validade = concessão + 24 meses até o decreto definir em contrário.',
          'QR não deve indicar vigência após EXPIRADO, CANCELADO A PEDIDO ou REVOGADO.',
          'Arte visual final do selo é pendência externa (SECOM / Gabinete da Mulher).',
        ],
        fieldsTable(F.selo.fields, 'Sistema'),
        ['Filtrar', 'Exportar', 'Baixar certificado', 'Cancelar a pedido', 'Revogar', 'Iniciar renovação', 'Enviar aviso de vencimento'],
      ),
    ),
  )
  steps.push(
    protoStep(
      'req-proto-selo',
      'Protótipo — Estabelecimentos com selo',
      'form-nen-estabelecimento-selo',
      'Protótipo do cadastro de selos emitidos (vigente, expirado, cancelado, revogado).',
    ),
  )

  // ——— Renovação / Cancelamento / Revogação ———
  steps.push(
    htmlStep(
      'req-renovacao',
      'Renovação',
      'Requisitos',
      reqBlock(
        'Renovação do selo',
        'Permitir renovar o selo vigente com dados pré-preenchidos, notificação próxima ao vencimento e o mesmo fluxo de análise/decisão no que couber.',
        [
          'O estabelecimento recebe aviso próximo ao vencimento.',
          'Inicia renovação, declara alterações e protocola.',
          'O pedido segue o mesmo ciclo de análise → diligência → decisão.',
        ],
        [
          'Notificar próximo ao vencimento.',
          'Abrir renovação pré-preenchida e revalidar condições/evidências.',
          'Protocolar e tramitar pelo fluxo de análise/decisão.',
          'No deferimento, emitir novo período (nova concessão + 24 meses).',
        ],
        [
          'Mesmo fluxo de análise da solicitação inicial, no que couber.',
          'Efeito jurídico se a renovação for tempestiva e o selo vencer antes da decisão: a confirmar.',
        ],
        fieldsTable(F.ren.fields, 'Solicitante / Sistema'),
        ['Iniciar renovação', 'Protocolar renovação'],
      ),
    ),
  )
  steps.push(protoStep('req-proto-renovacao', 'Protótipo — Renovação', 'form-nen-renovacao', 'Protótipo da renovação do selo.'))

  steps.push(
    htmlStep(
      'req-cancelamento',
      'Cancelamento a pedido',
      'Requisitos',
      reqBlock(
        'Cancelamento voluntário',
        'Permitir que o estabelecimento peça o cancelamento do selo vigente, com confirmação e motivo opcional.',
        [
          'Distinto da revogação (ato do PROCON).',
          'Após cancelar: status CANCELADO A PEDIDO; sai da lista de vigentes; QR não indica vigência.',
        ],
        [
          'Permitir confirmação do cancelamento do selo vigente.',
          'Ao confirmar: CANCELADO A PEDIDO, remoção da lista e invalidação da vigência na consulta.',
        ],
        ['Cancelamento é voluntário e não se confunde com revogação.', 'Motivo é opcional.'],
        fieldsTable(F.can.fields, 'Solicitante'),
        ['Cancelar selo'],
      ),
    ),
  )
  steps.push(protoStep('req-proto-cancelamento', 'Protótipo — Cancelamento', 'form-nen-cancelamento', 'Protótipo do cancelamento a pedido.'))

  steps.push(
    htmlStep(
      'req-revogacao',
      'Revogação administrativa',
      'Requisitos',
      reqBlock(
        'Revogação administrativa',
        'Permitir que o PROCON, a qualquer momento, marque um selo como REVOGADO anexando a decisão do procedimento interno — sem tramitar denúncia/apuração neste serviço.',
        [
          'A apuração ocorre fora deste sistema; aqui só se registra o resultado.',
          'Sem notificação automática neste serviço (ciência ocorre no procedimento externo).',
          'Perfil autorizado a revogar: a confirmar.',
        ],
        [
          'Selecionar selo vigente, anexar documento da decisão e registrar justificativa/data.',
          'Ao revogar: REVOGADO; sai da lista; QR não vigente; sem notificação automática neste serviço.',
          'Não implementar módulo de denúncia/fiscalização nesta entrega.',
        ],
        [
          'Revogação operacional (anexo + status), sem apuração neste sistema.',
          'Gatilho automático por condenação consumerista: não decidido.',
        ],
        fieldsTable(F.rev.fields, 'PROCON'),
        ['Revogar selo'],
      ),
    ),
  )
  steps.push(protoStep('req-proto-revogacao', 'Protótipo — Revogação', 'form-nen-revogacao', 'Protótipo da revogação administrativa (backoffice PROCON).'))

  // ——— Analytics ———
  steps.push(
    htmlStep(
      'req-analytics',
      'Relatórios e indicadores',
      'Requisitos',
      reqBlock(
        'Relatórios e indicadores (MVP)',
        'Disponibilizar indicadores do processo e dos selos, com filtro por período e exportação — substituindo no MVP a publicação automática da lista em outros sites.',
        [
          'Usado pela gestão PROCON para acompanhar fila, decisões e selos vigentes.',
          'Não inclui indicadores de denúncia/apuração nesta entrega.',
        ],
        [
          'Exibir protocolados, em análise, em diligência, deferidos, indeferidos e tempo médio.',
          'Exibir vigentes, próximos do vencimento, expirados, cancelados a pedido, revogados e distribuição.',
          'Permitir filtrar por período e exportar planilha.',
        ],
        ['Sem indicadores de denúncia/apuração nesta entrega.', 'Exportação atende o uso de lista no MVP.'],
        fieldsTable(F.an.fields, 'Sistema / Gestão PROCON'),
        ['Filtrar por período', 'Exportar planilha'],
      ),
    ),
  )
  steps.push(protoStep('req-proto-analytics', 'Protótipo — Relatórios', 'form-nen-analytics', 'Protótipo dos indicadores e exportação do MVP.'))

  // ——— Portal + Workspace as prototypes ———
  steps.push({
    id: 'req-proto-portal',
    title: 'Protótipo — Portal do estabelecimento',
    type: 'servicePortal',
    linkedPortalId: 'portal-nen-estabelecimentos',
    servicePortalPresentationDescription:
      'Protótipo do portal: solicitar o selo e acompanhar pedidos (histórico, diligência e recurso).',
  })

  steps.push({
    id: 'req-proto-workspace',
    title: 'Protótipo — Área de trabalho PROCON',
    type: 'workspace',
    linkedWorkspaceId: 'ws-nen-procon',
    workspacePresentationDescription:
      'Protótipo da área de trabalho: solicitações, análise/decisão (com exemplos por status), selos e relatórios.',
  })

  // ——— Pendências ———
  steps.push(
    htmlStep(
      'req-pendencias',
      'Pendências de negócio',
      'Abrir',
      eyebrow('Antes do build final') +
        h1('Pontos a confirmar') +
        ul([
          'Quem pode solicitar (sócio-administrador, representante, matriz vs filial) e MT Login para CNPJ',
          'Redação final do percentual mínimo de capacitados (2; 10% se equipe/público > 300)',
          'Prazo e cabimento do recurso no decreto',
          'Validade do selo no decreto publicado (protótipo e requisitos usam 24 meses)',
          'Efeito da renovação tempestiva se o selo vencer antes da decisão',
          'Perfil autorizado a revogar',
          'Arte do certificado (SECOM) — o sistema emite dados + QR independentemente da arte',
        ]) +
        callout(
          'Próximo passo sugerido',
          'Validar esta apresentação com PROCON e negócio; navegar os protótipos; fechar as pendências acima em paralelo às integrações.',
          'ok',
        ),
    ),
  )

  return {
    id: 'flow-nen-requisitos',
    name: 'Requisitos — Selo Não é Não (história, regras e campos)',
    metadata:
      'Apresentação em formato de requisitos: história, contexto/modo de uso, requisitos, regras de negócio e campos (nome, tipo, regra, opções, modo de uso), com protótipos. Linguagem de negócio — sem referências a board visual nem identificadores técnicos de modelagem.',
    steps,
  }
}

function main() {
  const primary = EPIC_PATHS[0]
  const forms = loadJson(path.join(primary, 'forms.json'))
  const reqFlow = buildRequisitosFlow(forms)

  for (const dir of EPIC_PATHS) {
    if (!fs.existsSync(dir)) {
      console.warn('skip', dir)
      continue
    }
    const flowsPath = path.join(dir, 'flows.json')
    let flows = []
    try {
      flows = loadJson(flowsPath)
      if (!Array.isArray(flows)) flows = []
    } catch {
      flows = []
    }
    const others = flows.filter((f) => f.id !== 'flow-nen-requisitos')
    const next = [...others, reqFlow]
    fs.writeFileSync(flowsPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
    console.log('wrote', flowsPath, 'flows=', next.length, 'reqSteps=', reqFlow.steps.length)
  }
}

main()
