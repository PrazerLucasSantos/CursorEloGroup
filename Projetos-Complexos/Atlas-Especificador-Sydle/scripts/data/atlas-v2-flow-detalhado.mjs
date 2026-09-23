/**
 * Atlas V2 — Flow "Manual completo passo a passo (detalhado)"
 *
 * Apresentação didática de ~45 etapas com fluxograma BPMN, modelagem (ER +
 * arquitetura em camadas), state machines, matriz RACI, funil e passo-a-passo
 * de cada uma das 31 classes.
 *
 * Exporta `buildFlowDetalhado(formIds)` que recebe os IDs dos forms do épico
 * e devolve o objeto do flow pronto para ser anexado ao flows.json.
 *
 * Convenções de cores (mantém coerência com os workspaces):
 *   DIRC      #7c3aed   Catálogo   #0d9488
 *   DTIC      #0369a1   DAFI       #6d28d9
 *   Pres.     #b45309   Parceiro   #0c1ba8
 *   Cliente   #0891b2   Sistema    #059669
 */

const TOTAL = 21  // total de slides narrativos (HTML). As 25 demais etapas são classes, workspaces e BPMNs interativos.

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

function slide({ modulo, n, accent = '#7c3aed', title, lead, body }) {
  const safeBody = body || ''
  const leadHtml = lead
    ? `<p style="font-size:1.08rem;color:#475569;margin:0 0 24px 0;max-width:880px;">${lead}</p>`
    : '<div style="height:16px;"></div>'
  return `<div style="padding:28px 48px 56px 48px;max-width:1140px;margin:0 auto;font-family:'Inter',system-ui,sans-serif;color:#0f172a;line-height:1.6;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;font-size:0.78rem;">
    <span style="font-weight:700;color:${accent};letter-spacing:0.08em;text-transform:uppercase;">${modulo}</span>
    <span style="color:#cbd5e1;">|</span>
    <span style="color:#64748b;">Slide ${n} de ${TOTAL}</span>
  </div>
  <h1 style="font-size:1.95rem;margin:0 0 8px 0;letter-spacing:-0.01em;color:#0f172a;">${title}</h1>
  ${leadHtml}
  ${safeBody}
</div>`
}

const card = (title, body, accent = '#7c3aed') => `
<div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;background:#fff;box-shadow:0 1px 2px rgba(15,23,42,0.04);">
  <div style="font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${accent};margin-bottom:6px;">${title}</div>
  <div style="font-size:0.96rem;color:#0f172a;">${body}</div>
</div>`

const grid = (cards, cols = 2) => `
<div style="display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:14px;margin:18px 0;">${cards.join('')}</div>`

const callout = (title, body, accent = '#0d9488') => `
<div style="border-left:4px solid ${accent};background:#f8fafc;padding:14px 18px;margin:18px 0;border-radius:0 8px 8px 0;">
  <div style="font-weight:700;color:${accent};margin-bottom:4px;">${title}</div>
  <div>${body}</div>
</div>`

const tag = (text, color = '#7c3aed') => `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${color}1a;color:${color};font-size:0.78rem;font-weight:600;margin:0 4px 4px 0;">${text}</span>`

// ----------------------------------------------------------------------------
// SVG — diagramas reutilizáveis
// ----------------------------------------------------------------------------

const SVG_MIND_MAP = `
<svg viewBox="0 0 920 560" style="width:100%;max-width:920px;display:block;margin:8px auto;">
  <defs>
    <filter id="mm-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.12"/>
    </filter>
  </defs>
  <!-- conexões -->
  <g stroke="#a78bfa" stroke-width="2" opacity="0.55" fill="none">
    <line x1="460" y1="225" x2="460" y2="95"/>
    <line x1="525" y1="248" x2="715" y2="140"/>
    <line x1="555" y1="280" x2="820" y2="280"/>
    <line x1="525" y1="312" x2="715" y2="420"/>
    <line x1="460" y1="335" x2="460" y2="490"/>
    <line x1="395" y1="312" x2="205" y2="420"/>
    <line x1="365" y1="280" x2="100" y2="280"/>
    <line x1="395" y1="248" x2="205" y2="140"/>
  </g>
  <!-- núcleo -->
  <ellipse cx="460" cy="280" rx="115" ry="55" fill="#7c3aed" filter="url(#mm-shadow)"/>
  <text x="460" y="272" font-family="Inter,system-ui" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">Fase 1</text>
  <text x="460" y="296" font-family="Inter,system-ui" font-size="13" fill="#ede9fe" text-anchor="middle">Atlas V2 — Da demanda ao kick-off</text>
  <!-- satélites -->
  ${[
    [460, 45, '1. Identidade', 'Org, Pessoa, Usuário, MTI, Cargo', '#1e40af'],
    [715, 90, '2. Catálogo comercial', '5 catálogos com snapshot', '#0d9488'],
    [820, 280, '3. Demanda', 'Captação por canal externo', '#7c3aed'],
    [715, 470, '4. Proposta', 'Composição + itens com snapshot', '#0369a1'],
    [460, 525, '5. Documento + Workflow', 'Modelo, parâmetros, assinaturas', '#6d28d9'],
    [205, 470, '6. Envio + Externo', 'Cliente recebe e contrata fora', '#0891b2'],
    [100, 280, '7. Contrato + Ops', 'Recepção, integrações, publicação', '#b45309'],
    [205, 90, '8. Handover + Kick-off', 'Pós-vendas e marco final', '#059669'],
  ].map(([cx, cy, t1, t2, c]) => `
    <rect x="${cx - 110}" y="${cy - 28}" width="220" height="56" rx="14" fill="#fff" stroke="${c}" stroke-width="2.5" filter="url(#mm-shadow)"/>
    <text x="${cx}" y="${cy - 4}" font-family="Inter,system-ui" font-size="14" font-weight="700" fill="${c}" text-anchor="middle">${t1}</text>
    <text x="${cx}" y="${cy + 16}" font-family="Inter,system-ui" font-size="11.5" fill="#64748b" text-anchor="middle">${t2}</text>
  `).join('')}
</svg>`

const SVG_ARCHITECTURE = `
<svg viewBox="0 0 980 540" style="width:100%;max-width:980px;display:block;margin:8px auto;">
  <defs>
    <linearGradient id="lay1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#a78bfa"/></linearGradient>
    <linearGradient id="lay2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0d9488"/><stop offset="100%" stop-color="#5eead4"/></linearGradient>
    <linearGradient id="lay3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0369a1"/><stop offset="100%" stop-color="#7dd3fc"/></linearGradient>
    <linearGradient id="lay4" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#fcd34d"/></linearGradient>
    <linearGradient id="lay5" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#475569"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>
  </defs>
  <!-- usuário à esquerda -->
  <circle cx="80" cy="100" r="24" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="80" y="106" font-family="Inter,system-ui" font-size="14" font-weight="700" fill="#7c3aed" text-anchor="middle">UX</text>
  <text x="80" y="148" font-family="Inter,system-ui" font-size="11" fill="#475569" text-anchor="middle">Analista DIRC,</text>
  <text x="80" y="162" font-family="Inter,system-ui" font-size="11" fill="#475569" text-anchor="middle">Diretor, Parceiro</text>
  <line x1="110" y1="100" x2="170" y2="100" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>
  <!-- camadas -->
  ${[
    ['L1 — Apresentação', 'Flow → Steps (HTML, BPMN, Classe, Workspace, Método). Telas navegáveis e didáticas.', 60, 'url(#lay1)'],
    ['L2 — Explorer', 'Workspaces → Pacotes → Classes. Visão por usuário (DIRC, DTIC, Parceiro, etc).', 150, 'url(#lay2)'],
    ['L3 — Forms', 'FormDef: seções (abas), campos (texto, opção, referência, embedded), métodos, relevância, presets.', 240, 'url(#lay3)'],
    ['L4 — Dados', 'Presets (FormExampleValuePreset), snapshot ao item da proposta, refs entre formulários.', 330, 'url(#lay4)'],
    ['L5 — Persistência', 'JSON em data/subprojects/atlas-v2/epics/atlas-v2-fase1/ — forms, workspaces, flows, class-groups, portals.', 420, 'url(#lay5)'],
  ].map(([t, d, y, fill]) => `
    <rect x="180" y="${y}" width="700" height="68" rx="14" fill="${fill}" opacity="0.95"/>
    <text x="200" y="${y + 28}" font-family="Inter,system-ui" font-size="15" font-weight="700" fill="#fff">${t}</text>
    <text x="200" y="${y + 52}" font-family="Inter,system-ui" font-size="12" fill="#f8fafc">${d}</text>
  `).join('')}
  <!-- arquivos à direita -->
  <g transform="translate(900 60)">
    <rect x="0" y="0" width="60" height="80" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="30" y="22" font-family="Inter,system-ui" font-size="9" font-weight="700" fill="#475569" text-anchor="middle">forms</text>
    <text x="30" y="34" font-family="Inter,system-ui" font-size="9" fill="#94a3b8" text-anchor="middle">.json</text>
    <text x="30" y="54" font-family="Inter,system-ui" font-size="9" font-weight="700" fill="#475569" text-anchor="middle">workspaces</text>
    <text x="30" y="66" font-family="Inter,system-ui" font-size="9" fill="#94a3b8" text-anchor="middle">.json</text>
  </g>
  <g transform="translate(900 160)">
    <rect x="0" y="0" width="60" height="80" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="30" y="22" font-family="Inter,system-ui" font-size="9" font-weight="700" fill="#475569" text-anchor="middle">flows</text>
    <text x="30" y="34" font-family="Inter,system-ui" font-size="9" fill="#94a3b8" text-anchor="middle">.json</text>
    <text x="30" y="54" font-family="Inter,system-ui" font-size="9" font-weight="700" fill="#475569" text-anchor="middle">class</text>
    <text x="30" y="66" font-family="Inter,system-ui" font-size="9" fill="#94a3b8" text-anchor="middle">-groups</text>
  </g>
  <line x1="880" y1="220" x2="900" y2="200" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>
  <line x1="880" y1="360" x2="900" y2="380" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>
  <!-- rodapé -->
  <text x="490" y="510" font-family="Inter,system-ui" font-size="12" fill="#94a3b8" text-anchor="middle">Vite watcher recarrega o navegador a cada alteração em data/. Script de build é fonte de verdade.</text>
</svg>`

const SVG_ER = `
<svg viewBox="0 0 1180 720" style="width:100%;max-width:1180px;display:block;margin:8px auto;">
  <defs>
    <marker id="er-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#475569"/></marker>
  </defs>
  <!-- Identidade -->
  <text x="20" y="32" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="#1e40af" letter-spacing="0.08em">IDENTIDADE</text>
  ${[
    ['Organização', 40, 'F_ORG'],
    ['Pessoa', 220, 'F_PES'],
    ['Usuário', 400, 'F_USR'],
    ['Estrutura MTI', 580, 'F_EST'],
    ['Cargo/Função', 760, 'F_CGF'],
  ].map(([t, x]) => `
    <rect x="${x}" y="44" width="150" height="48" rx="8" fill="#dbeafe" stroke="#1e40af" stroke-width="1.8"/>
    <text x="${x + 75}" y="73" font-family="Inter,system-ui" font-size="13" font-weight="600" fill="#1e40af" text-anchor="middle">${t}</text>
  `).join('')}
  <!-- relações horizontais identidade -->
  <line x1="190" y1="68" x2="220" y2="68" stroke="#475569" stroke-width="1.5" marker-end="url(#er-arrow)"/>
  <line x1="370" y1="68" x2="400" y2="68" stroke="#475569" stroke-width="1.5" marker-end="url(#er-arrow)"/>
  <line x1="550" y1="68" x2="580" y2="68" stroke="#475569" stroke-width="1.5" marker-end="url(#er-arrow)"/>
  <line x1="730" y1="68" x2="760" y2="68" stroke="#475569" stroke-width="1.5" marker-end="url(#er-arrow)"/>

  <!-- Catálogo -->
  <text x="20" y="146" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="#0d9488" letter-spacing="0.08em">CATÁLOGO COMERCIAL</text>
  ${[
    ['Produto Vigente', 40],
    ['Cat. Licença', 220],
    ['Cat. Serviço', 400],
    ['Cat. Universal', 580],
    ['Cat. Parceria', 760],
  ].map(([t, x]) => `
    <rect x="${x}" y="158" width="150" height="48" rx="8" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.8"/>
    <text x="${x + 75}" y="187" font-family="Inter,system-ui" font-size="13" font-weight="600" fill="#0d9488" text-anchor="middle">${t}</text>
  `).join('')}

  <!-- Demanda → Proposta spine -->
  <text x="20" y="272" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="#7c3aed" letter-spacing="0.08em">DEMANDA → PROPOSTA</text>
  <rect x="40" y="284" width="150" height="56" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.8"/>
  <text x="115" y="316" font-family="Inter,system-ui" font-size="13" font-weight="700" fill="#7c3aed" text-anchor="middle">Demanda</text>
  <rect x="240" y="284" width="170" height="56" rx="8" fill="#7c3aed"/>
  <text x="325" y="308" font-family="Inter,system-ui" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">Proposta</text>
  <text x="325" y="328" font-family="Inter,system-ui" font-size="11" fill="#ede9fe" text-anchor="middle">Núcleo do processo</text>
  <rect x="460" y="284" width="170" height="56" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.8"/>
  <text x="545" y="308" font-family="Inter,system-ui" font-size="13" font-weight="700" fill="#7c3aed" text-anchor="middle">Item da Proposta</text>
  <text x="545" y="326" font-family="Inter,system-ui" font-size="10.5" fill="#7c3aed" text-anchor="middle">snapshot do catálogo</text>
  <line x1="190" y1="312" x2="240" y2="312" stroke="#475569" stroke-width="1.6" marker-end="url(#er-arrow)"/>
  <line x1="410" y1="312" x2="460" y2="312" stroke="#475569" stroke-width="1.6" marker-end="url(#er-arrow)"/>
  <!-- snapshot do catálogo para Item -->
  ${[40, 220, 400, 580, 760].map((x) => `<path d="M ${x + 75} 206 C ${x + 75} 260, 545 260, 545 284" stroke="#0d9488" stroke-width="1.4" stroke-dasharray="3 3" fill="none" opacity="0.6"/>`).join('')}
  <text x="700" y="252" font-family="Inter,system-ui" font-size="11" fill="#0d9488" font-style="italic">snapshot()</text>

  <!-- Documento + Workflow -->
  <text x="20" y="396" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="#6d28d9" letter-spacing="0.08em">DOCUMENTO + WORKFLOW</text>
  ${[
    ['Modelo Doc', 40],
    ['Parâmetro', 220],
    ['Doc Gerado', 400],
    ['Modelo WF', 580],
    ['Etapa WF', 760],
    ['Trâmite', 940],
  ].map(([t, x]) => `
    <rect x="${x}" y="408" width="150" height="48" rx="8" fill="#ede9fe" stroke="#6d28d9" stroke-width="1.8"/>
    <text x="${x + 75}" y="437" font-family="Inter,system-ui" font-size="13" font-weight="600" fill="#6d28d9" text-anchor="middle">${t}</text>
  `).join('')}
  <line x1="190" y1="432" x2="220" y2="432" stroke="#475569" stroke-width="1.5" marker-end="url(#er-arrow)"/>
  <line x1="370" y1="432" x2="400" y2="432" stroke="#475569" stroke-width="1.5" marker-end="url(#er-arrow)"/>
  <line x1="730" y1="432" x2="760" y2="432" stroke="#475569" stroke-width="1.5" marker-end="url(#er-arrow)"/>
  <line x1="910" y1="432" x2="940" y2="432" stroke="#475569" stroke-width="1.5" marker-end="url(#er-arrow)"/>
  <line x1="325" y1="340" x2="475" y2="408" stroke="#475569" stroke-width="1.4" marker-end="url(#er-arrow)"/>
  <line x1="325" y1="340" x2="655" y2="408" stroke="#475569" stroke-width="1.4" marker-end="url(#er-arrow)"/>

  <!-- Envio / Externa / Contrato spine -->
  <text x="20" y="520" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="#0891b2" letter-spacing="0.08em">ENVIO E CONTRATO</text>
  ${[
    ['Envio Proposta', 40, '#0891b2'],
    ['Contratação Externa', 220, '#0891b2'],
    ['Contrato', 410, '#b45309'],
    ['Item Contratado', 600, '#b45309'],
    ['Recorrência', 790, '#b45309'],
    ['Publicação', 970, '#b45309'],
  ].map(([t, x, c]) => `
    <rect x="${x}" y="532" width="160" height="48" rx="8" fill="#fff" stroke="${c}" stroke-width="1.8"/>
    <text x="${x + 80}" y="561" font-family="Inter,system-ui" font-size="13" font-weight="600" fill="${c}" text-anchor="middle">${t}</text>
  `).join('')}
  ${[200, 380, 570, 750, 950].map((x) => `<line x1="${x}" y1="556" x2="${x + 20}" y2="556" stroke="#475569" stroke-width="1.5" marker-end="url(#er-arrow)"/>`).join('')}
  <line x1="325" y1="340" x2="120" y2="532" stroke="#475569" stroke-width="1.4" marker-end="url(#er-arrow)"/>

  <!-- Operação final -->
  <text x="20" y="624" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="#059669" letter-spacing="0.08em">OPERACIONALIZAÇÃO</text>
  ${[
    ['Integração', 40],
    ['Handover', 220],
    ['Kick-off', 410],
    ['Notificação', 600],
    ['Histórico', 790],
    ['Visão Operacional', 970],
  ].map(([t, x]) => `
    <rect x="${x}" y="636" width="160" height="48" rx="8" fill="#d1fae5" stroke="#059669" stroke-width="1.8"/>
    <text x="${x + 80}" y="665" font-family="Inter,system-ui" font-size="13" font-weight="600" fill="#059669" text-anchor="middle">${t}</text>
  `).join('')}
  <line x1="490" y1="580" x2="300" y2="636" stroke="#475569" stroke-width="1.4" marker-end="url(#er-arrow)"/>
  <line x1="490" y1="580" x2="490" y2="636" stroke="#475569" stroke-width="1.4" marker-end="url(#er-arrow)"/>
</svg>`

const SVG_BPMN = `
<svg viewBox="0 0 1240 720" style="width:100%;max-width:1240px;display:block;margin:8px auto;">
  <defs>
    <marker id="bpmn-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b"/></marker>
  </defs>
  <!-- swim lanes -->
  ${[
    ['DIRC', 40, '#7c3aed'],
    ['Parceiro', 130, '#0c1ba8'],
    ['DTIC', 220, '#0369a1'],
    ['DAFI', 310, '#6d28d9'],
    ['Presidência', 400, '#b45309'],
    ['Cliente', 490, '#0891b2'],
    ['Sistema / Pós-vendas', 580, '#059669'],
  ].map(([t, y, c]) => `
    <rect x="0" y="${y}" width="1240" height="84" fill="${c}" opacity="0.06"/>
    <rect x="0" y="${y}" width="120" height="84" fill="${c}" opacity="0.95"/>
    <text x="60" y="${y + 48}" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">${t}</text>
  `).join('')}
  <!-- linhas separadoras -->
  ${[124, 214, 304, 394, 484, 574, 664].map((y) => `<line x1="0" y1="${y}" x2="1240" y2="${y}" stroke="#cbd5e1" stroke-width="1"/>`).join('')}

  <!-- início -->
  <circle cx="155" cy="82" r="14" fill="#fff" stroke="#059669" stroke-width="3"/>
  <text x="155" y="48" font-family="Inter,system-ui" font-size="10" font-weight="600" fill="#059669" text-anchor="middle">Início</text>

  <!-- DIRC: registra → analisa → tipo → catálogo → snapshot → proposta -->
  ${[
    [185, 'Registra demanda'],
    [320, 'Analisa demanda'],
    [455, 'Define tipo contratação'],
    [590, 'Seleciona catálogo'],
    [725, 'Snapshot do item'],
    [860, 'Compõe proposta'],
    [995, 'Gera documento'],
  ].map(([x, t], i) => `
    <rect x="${x - 60}" y="60" width="120" height="44" rx="10" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
    <text x="${x}" y="86" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#7c3aed" text-anchor="middle">${t}</text>
  `).join('')}
  <!-- setas DIRC -->
  ${[185, 320, 455, 590, 725, 860].map((x) => `<line x1="${x + 60}" y1="82" x2="${x + 75}" y2="82" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>`).join('')}

  <!-- gateway parceiro -->
  <polygon points="1095,82 1115,62 1135,82 1115,102" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
  <text x="1115" y="86" font-family="Inter,system-ui" font-size="9.5" font-weight="700" fill="#7c3aed" text-anchor="middle">Parc?</text>
  <line x1="1055" y1="82" x2="1095" y2="82" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>

  <!-- Parceiro analisa -->
  <rect x="1055" y="148" width="140" height="44" rx="10" fill="#fff" stroke="#0c1ba8" stroke-width="2"/>
  <text x="1125" y="174" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#0c1ba8" text-anchor="middle">Análise parceiro</text>
  <line x1="1115" y1="102" x2="1115" y2="148" stroke="#0c1ba8" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>
  <text x="1142" y="125" font-family="Inter,system-ui" font-size="9.5" font-weight="600" fill="#0c1ba8">Sim</text>

  <!-- DTIC assina -->
  <rect x="1055" y="232" width="140" height="44" rx="10" fill="#fff" stroke="#0369a1" stroke-width="2"/>
  <text x="1125" y="258" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#0369a1" text-anchor="middle">DTIC assina</text>
  <line x1="1125" y1="192" x2="1125" y2="232" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>
  <line x1="1115" y1="102" x2="1115" y2="232" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.5"/>
  <text x="1090" y="220" font-family="Inter,system-ui" font-size="9.5" font-weight="600" fill="#94a3b8">(sem parceiro)</text>

  <!-- gateway DAFI -->
  <polygon points="1095,300 1115,278 1135,300 1115,322" fill="#fff" stroke="#6d28d9" stroke-width="2"/>
  <text x="1115" y="304" font-family="Inter,system-ui" font-size="9.5" font-weight="700" fill="#6d28d9" text-anchor="middle">DAFI?</text>
  <line x1="1125" y1="276" x2="1125" y2="278" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>

  <!-- DAFI assinatura complementar (opcional) -->
  <rect x="1055" y="322" width="140" height="44" rx="10" fill="#fff" stroke="#6d28d9" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="1125" y="348" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#6d28d9" text-anchor="middle">DAFI (opcional)</text>
  <line x1="1115" y1="322" x2="1115" y2="322" stroke="#6d28d9" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>

  <!-- Presidência -->
  <rect x="1055" y="412" width="140" height="44" rx="10" fill="#fff" stroke="#b45309" stroke-width="2"/>
  <text x="1125" y="438" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#b45309" text-anchor="middle">Presidência assina</text>
  <line x1="1125" y1="366" x2="1125" y2="412" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>

  <!-- Sistema envia ao cliente -->
  <rect x="1055" y="592" width="140" height="44" rx="10" fill="#fff" stroke="#059669" stroke-width="2"/>
  <text x="1125" y="618" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#059669" text-anchor="middle">Envia ao cliente</text>
  <line x1="1125" y1="456" x2="1125" y2="592" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>

  <!-- Cliente -->
  <rect x="900" y="502" width="180" height="44" rx="10" fill="#fff" stroke="#0891b2" stroke-width="2"/>
  <text x="990" y="528" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#0891b2" text-anchor="middle">Recebe / Contrata externo</text>
  <line x1="1055" y1="614" x2="990" y2="546" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>

  <rect x="750" y="502" width="140" height="44" rx="10" fill="#fff" stroke="#0891b2" stroke-width="2"/>
  <text x="820" y="528" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#0891b2" text-anchor="middle">Retorna contrato</text>
  <line x1="900" y1="524" x2="890" y2="524" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>

  <!-- DIRC recebe contrato -->
  <rect x="600" y="60" width="140" height="44" rx="10" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
  <!-- Já tem o "Compõe proposta" na linha DIRC. Vou adicionar contrato em outra altura -->
  <!-- Na verdade reorganizei: o eixo de "operacional pós contrato" fica na linha sistema -->

  <!-- Sistema: pós-contrato em sequência -->
  ${[
    [155, 'Registra contrato'],
    [300, 'Cadastra cliente'],
    [445, 'Integrações'],
    [590, 'Recorrência'],
    [735, 'Publicação'],
  ].map(([x, t]) => `
    <rect x="${x - 60}" y="600" width="120" height="44" rx="10" fill="#fff" stroke="#059669" stroke-width="2"/>
    <text x="${x}" y="626" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#059669" text-anchor="middle">${t}</text>
  `).join('')}
  ${[155, 300, 445, 590, 735].map((x) => `<line x1="${x + 60}" y1="622" x2="${x + 75}" y2="622" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>`).join('')}
  <line x1="820" y1="546" x2="215" y2="600" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.5"/>

  <!-- Handover e Kick-off na lane sistema, mais à direita -->
  <rect x="820" y="600" width="100" height="44" rx="10" fill="#fff" stroke="#059669" stroke-width="2"/>
  <text x="870" y="626" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#059669" text-anchor="middle">Handover</text>
  <line x1="795" y1="622" x2="820" y2="622" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>

  <rect x="940" y="600" width="100" height="44" rx="10" fill="#fff" stroke="#059669" stroke-width="2"/>
  <text x="990" y="626" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#059669" text-anchor="middle">Kick-off</text>
  <line x1="920" y1="622" x2="940" y2="622" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>

  <!-- fim -->
  <circle cx="1070" cy="622" r="14" fill="#fff" stroke="#dc2626" stroke-width="3"/>
  <line x1="1040" y1="622" x2="1056" y2="622" stroke="#1e293b" stroke-width="1.5" marker-end="url(#bpmn-arrow)"/>
  <text x="1070" y="660" font-family="Inter,system-ui" font-size="10" font-weight="600" fill="#dc2626" text-anchor="middle">Fim Fase 1</text>

  <!-- legenda -->
  <text x="20" y="700" font-family="Inter,system-ui" font-size="10.5" fill="#94a3b8">Linha pontilhada = caminho alternativo (sem parceiro / sem DAFI / cliente externo).</text>
</svg>`

const SVG_HIERARQUIA_MTI = `
<svg viewBox="0 0 1240 720" style="width:100%;max-width:1240px;display:block;margin:8px auto;">
  <!-- Presidência topo -->
  <rect x="540" y="20" width="160" height="48" rx="10" fill="#b45309"/>
  <text x="620" y="50" font-family="Inter,system-ui" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">Presidência</text>

  <!-- 4 Gabinetes/Diretorias -->
  ${[
    ['Gab. Presidente', 80, '#b45309'],
    ['DTIC', 380, '#0369a1'],
    ['DIRC', 680, '#7c3aed'],
    ['DAFI', 980, '#6d28d9'],
  ].map(([t, x, c]) => `
    <line x1="620" y1="68" x2="${x + 80}" y2="108" stroke="#94a3b8" stroke-width="1.5"/>
    <rect x="${x}" y="108" width="160" height="44" rx="10" fill="${c}"/>
    <text x="${x + 80}" y="136" font-family="Inter,system-ui" font-size="13" font-weight="700" fill="#fff" text-anchor="middle">${t}</text>
  `).join('')}

  <!-- Unidades Gab. Presidente -->
  ${['UAJ', 'UAS', 'UGP', 'UGCRS', 'USCI', 'UGSG', 'GEPP', 'GGE'].map((u, i) => {
    const x = 30 + (i % 4) * 70, y = 180 + Math.floor(i / 4) * 50
    return `
      <line x1="160" y1="152" x2="${x + 30}" y2="${y}" stroke="#fbbf24" stroke-width="1" opacity="0.5"/>
      <rect x="${x}" y="${y}" width="60" height="26" rx="6" fill="#fff" stroke="#b45309" stroke-width="1.5"/>
      <text x="${x + 30}" y="${y + 18}" font-family="Inter,system-ui" font-size="11" font-weight="600" fill="#b45309" text-anchor="middle">${u}</text>
    `
  }).join('')}

  <!-- Unidades DTIC -->
  ${['UGSDG', 'UGGD', 'UGAT', 'UGSTIC', 'UGGDC', 'UGITI'].map((u, i) => {
    const x = 330 + (i % 3) * 70, y = 180 + Math.floor(i / 3) * 50
    return `
      <line x1="460" y1="152" x2="${x + 30}" y2="${y}" stroke="#0369a1" stroke-width="1" opacity="0.5"/>
      <rect x="${x}" y="${y}" width="60" height="26" rx="6" fill="#fff" stroke="#0369a1" stroke-width="1.5"/>
      <text x="${x + 30}" y="${y + 18}" font-family="Inter,system-ui" font-size="11" font-weight="600" fill="#0369a1" text-anchor="middle">${u}</text>
    `
  }).join('')}

  <!-- Unidades DIRC -->
  ${['UGV', 'UGPV', 'UGPNN', 'GPI'].map((u, i) => {
    const x = 650 + (i % 2) * 90, y = 180 + Math.floor(i / 2) * 50
    return `
      <line x1="760" y1="152" x2="${x + 35}" y2="${y}" stroke="#7c3aed" stroke-width="1" opacity="0.5"/>
      <rect x="${x}" y="${y}" width="70" height="26" rx="6" fill="#fff" stroke="#7c3aed" stroke-width="1.5"/>
      <text x="${x + 35}" y="${y + 18}" font-family="Inter,system-ui" font-size="11" font-weight="600" fill="#7c3aed" text-anchor="middle">${u}</text>
    `
  }).join('')}

  <!-- Unidades DAFI -->
  ${['UGA', 'UGOFF', 'UGCF', 'UGPE', 'UGAC', 'GC', 'GAQ', 'GFC'].map((u, i) => {
    const x = 930 + (i % 4) * 70, y = 180 + Math.floor(i / 4) * 50
    return `
      <line x1="1060" y1="152" x2="${x + 30}" y2="${y}" stroke="#6d28d9" stroke-width="1" opacity="0.5"/>
      <rect x="${x}" y="${y}" width="60" height="26" rx="6" fill="#fff" stroke="#6d28d9" stroke-width="1.5"/>
      <text x="${x + 30}" y="${y + 18}" font-family="Inter,system-ui" font-size="11" font-weight="600" fill="#6d28d9" text-anchor="middle">${u}</text>
    `
  }).join('')}

  <!-- legenda -->
  <text x="20" y="320" font-family="Inter,system-ui" font-size="11" fill="#94a3b8">Siglas das unidades MTI conforme organograma do requisito (§7.4). Cargo/Função aponta para Estrutura — pessoa executante é o ocupante atual.</text>

  <!-- mapeamento cargo→estrutura -->
  <rect x="20" y="360" width="1200" height="320" rx="14" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="40" y="392" font-family="Inter,system-ui" font-size="13" font-weight="700" fill="#0f172a">Cargo/Função × Estrutura (exemplos de presets)</text>
  ${[
    ['Diretor DIRC', 'Gab. DIRC', 'aprovar proposta, assinar', '#7c3aed', 420],
    ['Analista DIRC', 'UGV / UGPNN', 'registrar demanda, editar proposta', '#7c3aed', 470],
    ['Diretor DTIC', 'Gab. DTIC', 'assinar (técnica)', '#0369a1', 520],
    ['Diretor DAFI', 'Gab. DAFI', 'assinar complementar, finalizar contrato', '#6d28d9', 570],
    ['Presidente da MTI', 'Presidência', 'aprovar / assinar / finalizar', '#b45309', 620],
  ].map(([cargo, est, perm, c, y]) => `
    <rect x="40" y="${y}" width="220" height="36" rx="8" fill="#fff" stroke="${c}" stroke-width="1.5"/>
    <text x="50" y="${y + 23}" font-family="Inter,system-ui" font-size="12.5" font-weight="700" fill="${c}">${cargo}</text>
    <text x="290" y="${y + 23}" font-family="Inter,system-ui" font-size="12.5" fill="#475569">→ ${est}</text>
    <text x="540" y="${y + 23}" font-family="Inter,system-ui" font-size="11.5" fill="#64748b">${perm}</text>
  `).join('')}
</svg>`

const SVG_TIPOS_CONTRATACAO = `
<svg viewBox="0 0 1000 460" style="width:100%;max-width:1000px;display:block;margin:8px auto;">
  ${[
    ['Tipo 1', 'Objeto específico', '#7c3aed', 30, [
      'Usa o código SIAG/Protheus do ITEM específico',
      'Contratação granular item-a-item',
      'Ex.: 1 licença Workspace Frontline 5GB (SIAG 111063)',
      'Adequado quando o cliente pede produto pontual',
    ]],
    ['Tipo 2', 'Catálogo do produto', '#0d9488', 350, [
      'Usa o código do CATÁLOGO DO PRODUTO',
      'Permite trocar itens dentro do mesmo produto sem novo contrato',
      'Ex.: Catálogo MTI Workspace 8.0 (todos os planos)',
      'Adequado quando há composição esperada',
    ]],
    ['Tipo 3', 'Catálogo geral / ecossistema', '#b45309', 670, [
      'Usa o código do ECOSSISTEMA / Catálogo Universal',
      'Cliente compra créditos / moeda de serviços (HST, USN, etc)',
      'Ex.: MTI Créditos de Serviço (SIAG 0018787)',
      'Adequado para consumo amplo e variável',
    ]],
  ].map(([numero, titulo, cor, x, lista]) => `
    <rect x="${x}" y="30" width="300" height="400" rx="16" fill="${cor}" opacity="0.08"/>
    <rect x="${x}" y="30" width="300" height="58" rx="16" fill="${cor}"/>
    <text x="${x + 24}" y="58" font-family="Inter,system-ui" font-size="14" font-weight="800" fill="#fff" letter-spacing="0.05em">${numero.toUpperCase()}</text>
    <text x="${x + 24}" y="78" font-family="Inter,system-ui" font-size="16" font-weight="700" fill="#fff">${titulo}</text>
    ${lista.map((it, i) => `
      <circle cx="${x + 26}" cy="${122 + i * 70}" r="5" fill="${cor}"/>
      <text x="${x + 42}" y="${127 + i * 70}" font-family="Inter,system-ui" font-size="12.5" fill="#0f172a">${it}</text>
    `).join('')}
  `).join('')}
</svg>`

const SVG_SNAPSHOT = `
<svg viewBox="0 0 1100 460" style="width:100%;max-width:1100px;display:block;margin:8px auto;">
  <defs>
    <marker id="snap-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#0d9488"/></marker>
  </defs>
  <!-- Catálogo -->
  <rect x="40" y="60" width="280" height="220" rx="16" fill="#ccfbf1" stroke="#0d9488" stroke-width="2"/>
  <text x="180" y="92" font-family="Inter,system-ui" font-size="15" font-weight="700" fill="#0d9488" text-anchor="middle">Catálogo Comercial</text>
  <text x="180" y="112" font-family="Inter,system-ui" font-size="11.5" fill="#0d9488" text-anchor="middle">(Produto / Licença / Serviço / Universal / Parceria)</text>
  ${['Descrição', 'Métrica', 'Valor unitário', 'Custo parceiro', 'Códigos SIAG/Protheus', 'Universal / Individualizado', 'Versão catálogo'].map((c, i) => `
    <circle cx="62" cy="${145 + i * 18}" r="3" fill="#0d9488"/>
    <text x="74" y="${149 + i * 18}" font-family="Inter,system-ui" font-size="11.5" fill="#0f172a">${c}</text>
  `).join('')}

  <!-- Snapshot arrow -->
  <path d="M 340 170 C 410 170, 410 220, 480 220" stroke="#0d9488" stroke-width="3" fill="none" marker-end="url(#snap-arrow)"/>
  <rect x="370" y="140" width="120" height="32" rx="8" fill="#0d9488"/>
  <text x="430" y="161" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">snapshot()</text>

  <!-- Item da Proposta -->
  <rect x="500" y="60" width="280" height="220" rx="16" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="640" y="92" font-family="Inter,system-ui" font-size="15" font-weight="700" fill="#7c3aed" text-anchor="middle">Item da Proposta</text>
  <text x="640" y="112" font-family="Inter,system-ui" font-size="11.5" fill="#7c3aed" text-anchor="middle">(snapshot CONGELADO)</text>
  ${['Descrição (copiada)', 'Métrica (copiada)', 'Valor unitário (copiado)', 'Códigos SIAG/Protheus (copiados)', 'Versão catálogo (copiada)', 'Quantidade (preenchida)', 'Valor total = qtd × unit'].map((c, i) => `
    <circle cx="522" cy="${145 + i * 18}" r="3" fill="#7c3aed"/>
    <text x="534" y="${149 + i * 18}" font-family="Inter,system-ui" font-size="11.5" fill="#0f172a">${c}</text>
  `).join('')}

  <!-- Timeline -->
  <text x="40" y="330" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="#475569" letter-spacing="0.05em">CENÁRIO: catálogo é REAJUSTADO depois de a proposta ser composta</text>
  <line x1="40" y1="370" x2="780" y2="370" stroke="#cbd5e1" stroke-width="2"/>
  ${[
    [60, 'T0', 'Item 5GB = R$ 241,85', '#0d9488'],
    [230, 'T1', 'Proposta cria item (snapshot R$ 241,85)', '#7c3aed'],
    [430, 'T2', 'Catálogo reajusta para R$ 280,00', '#b45309'],
    [620, 'T3', 'Proposta segue válida com R$ 241,85', '#059669'],
  ].map(([x, t, desc, c]) => `
    <circle cx="${x}" cy="370" r="8" fill="${c}"/>
    <text x="${x}" y="396" font-family="Inter,system-ui" font-size="11.5" font-weight="700" fill="${c}" text-anchor="middle">${t}</text>
    <text x="${x}" y="416" font-family="Inter,system-ui" font-size="11" fill="#475569" text-anchor="middle">${desc.split(' ').slice(0, 3).join(' ')}</text>
    <text x="${x}" y="432" font-family="Inter,system-ui" font-size="11" fill="#475569" text-anchor="middle">${desc.split(' ').slice(3).join(' ')}</text>
  `).join('')}

  <!-- box conclusivo -->
  <rect x="820" y="320" width="260" height="130" rx="12" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
  <text x="950" y="350" font-family="Inter,system-ui" font-size="13" font-weight="700" fill="#b45309" text-anchor="middle">Por que snapshot?</text>
  <text x="836" y="378" font-family="Inter,system-ui" font-size="11.5" fill="#0f172a">• Protege propostas antigas</text>
  <text x="836" y="396" font-family="Inter,system-ui" font-size="11.5" fill="#0f172a">• Permite rastrear versão</text>
  <text x="836" y="414" font-family="Inter,system-ui" font-size="11.5" fill="#0f172a">• Aceita item manual com</text>
  <text x="848" y="430" font-family="Inter,system-ui" font-size="11.5" fill="#0f172a">justificativa formal</text>
</svg>`

const SVG_WORKFLOW = `
<svg viewBox="0 0 1240 320" style="width:100%;max-width:1240px;display:block;margin:8px auto;">
  <defs>
    <marker id="wf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b"/></marker>
  </defs>
  <!-- start -->
  <circle cx="40" cy="160" r="16" fill="#fff" stroke="#059669" stroke-width="3"/>
  <text x="40" y="200" font-family="Inter,system-ui" font-size="11" font-weight="600" fill="#059669" text-anchor="middle">Início</text>

  ${[
    [120, 'DIRC compõe', '#7c3aed'],
  ].map(([x, t, c]) => `
    <rect x="${x - 50}" y="140" width="120" height="44" rx="10" fill="#fff" stroke="${c}" stroke-width="2"/>
    <text x="${x + 10}" y="166" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="${c}" text-anchor="middle">${t}</text>
  `).join('')}
  <line x1="56" y1="160" x2="70" y2="160" stroke="#1e293b" stroke-width="1.5" marker-end="url(#wf-arrow)"/>

  <!-- gateway parceiro -->
  <polygon points="270,160 295,135 320,160 295,185" fill="#fff" stroke="#0c1ba8" stroke-width="2"/>
  <text x="295" y="164" font-family="Inter,system-ui" font-size="11" font-weight="700" fill="#0c1ba8" text-anchor="middle">Parc?</text>
  <line x1="190" y1="160" x2="270" y2="160" stroke="#1e293b" stroke-width="1.5" marker-end="url(#wf-arrow)"/>

  <!-- parceiro analisa (caminho sim) -->
  <rect x="280" y="40" width="160" height="44" rx="10" fill="#fff" stroke="#0c1ba8" stroke-width="2"/>
  <text x="360" y="66" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#0c1ba8" text-anchor="middle">Análise do parceiro</text>
  <path d="M 295 135 C 295 105, 320 90, 360 84" stroke="#1e293b" stroke-width="1.5" fill="none" marker-end="url(#wf-arrow)"/>
  <text x="240" y="118" font-family="Inter,system-ui" font-size="10.5" font-weight="600" fill="#0c1ba8">Sim</text>

  <!-- DTIC -->
  <rect x="480" y="140" width="120" height="44" rx="10" fill="#fff" stroke="#0369a1" stroke-width="2"/>
  <text x="540" y="166" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#0369a1" text-anchor="middle">DTIC assina</text>
  <path d="M 320 160 L 480 160" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="392" y="155" font-family="Inter,system-ui" font-size="10.5" font-weight="600" fill="#94a3b8">Não (sem parceiro)</text>
  <path d="M 440 62 C 480 62, 540 100, 540 140" stroke="#1e293b" stroke-width="1.5" fill="none" marker-end="url(#wf-arrow)"/>

  <!-- gateway DAFI -->
  <polygon points="640,160 665,135 690,160 665,185" fill="#fff" stroke="#6d28d9" stroke-width="2"/>
  <text x="665" y="164" font-family="Inter,system-ui" font-size="10.5" font-weight="700" fill="#6d28d9" text-anchor="middle">DAFI?</text>
  <line x1="600" y1="160" x2="640" y2="160" stroke="#1e293b" stroke-width="1.5" marker-end="url(#wf-arrow)"/>

  <!-- DAFI complementar (opcional) -->
  <rect x="650" y="240" width="160" height="44" rx="10" fill="#fff" stroke="#6d28d9" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="730" y="266" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#6d28d9" text-anchor="middle">DAFI assina (opcional)</text>
  <line x1="665" y1="185" x2="665" y2="240" stroke="#1e293b" stroke-width="1.5" marker-end="url(#wf-arrow)"/>
  <text x="635" y="220" font-family="Inter,system-ui" font-size="10.5" font-weight="600" fill="#6d28d9">Sim</text>

  <!-- Presidência -->
  <rect x="830" y="140" width="140" height="44" rx="10" fill="#fff" stroke="#b45309" stroke-width="2"/>
  <text x="900" y="166" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#b45309" text-anchor="middle">Presidência assina</text>
  <line x1="690" y1="160" x2="830" y2="160" stroke="#1e293b" stroke-width="1.5" marker-end="url(#wf-arrow)"/>
  <text x="755" y="155" font-family="Inter,system-ui" font-size="10.5" font-weight="600" fill="#94a3b8">Não</text>
  <path d="M 810 264 C 880 264, 900 220, 900 184" stroke="#1e293b" stroke-width="1.5" fill="none" marker-end="url(#wf-arrow)"/>

  <!-- Envio sistema -->
  <rect x="1010" y="140" width="140" height="44" rx="10" fill="#fff" stroke="#059669" stroke-width="2"/>
  <text x="1080" y="166" font-family="Inter,system-ui" font-size="11.5" font-weight="600" fill="#059669" text-anchor="middle">Envia ao cliente</text>
  <line x1="970" y1="160" x2="1010" y2="160" stroke="#1e293b" stroke-width="1.5" marker-end="url(#wf-arrow)"/>

  <!-- end -->
  <circle cx="1190" cy="160" r="16" fill="#fff" stroke="#dc2626" stroke-width="3"/>
  <line x1="1150" y1="160" x2="1174" y2="160" stroke="#1e293b" stroke-width="1.5" marker-end="url(#wf-arrow)"/>
  <text x="1190" y="200" font-family="Inter,system-ui" font-size="11" font-weight="600" fill="#dc2626" text-anchor="middle">Aprovada</text>

  <!-- linhas de retorno -->
  <path d="M 1080 184 C 1080 250, 360 280, 130 200" stroke="#dc2626" stroke-width="1.4" fill="none" stroke-dasharray="6 4" marker-end="url(#wf-arrow)" opacity="0.55"/>
  <text x="600" y="305" font-family="Inter,system-ui" font-size="11" fill="#dc2626" text-anchor="middle">Ajuste / Reprovação → volta para revisão da proposta</text>
</svg>`

const SVG_RACI = `
<svg viewBox="0 0 1200 540" style="width:100%;max-width:1200px;display:block;margin:8px auto;font-family:'Inter',system-ui;">
  <!-- header (papéis) -->
  ${[
    ['DIRC', 320, '#7c3aed'],
    ['Parceiro', 440, '#0c1ba8'],
    ['DTIC', 560, '#0369a1'],
    ['DAFI', 680, '#6d28d9'],
    ['Presidência', 800, '#b45309'],
    ['Cliente', 920, '#0891b2'],
    ['Sistema', 1040, '#059669'],
  ].map(([t, x, c]) => `
    <rect x="${x - 50}" y="20" width="100" height="40" rx="8" fill="${c}"/>
    <text x="${x}" y="45" font-family="Inter,system-ui" font-size="12.5" font-weight="700" fill="#fff" text-anchor="middle">${t}</text>
  `).join('')}

  <!-- linhas -->
  ${[
    ['Registrar demanda', { DIRC: 'R', Parceiro: 'C', Cliente: 'I' }, 80],
    ['Análise DIRC', { DIRC: 'A', Parceiro: 'I' }, 122],
    ['Definir tipo contratação', { DIRC: 'R', DTIC: 'C' }, 164],
    ['Selecionar catálogo', { DIRC: 'R', Parceiro: 'C' }, 206],
    ['Snapshot do item', { DIRC: 'R', Sistema: 'A' }, 248],
    ['Compor proposta', { DIRC: 'R', Parceiro: 'C', DTIC: 'I' }, 290],
    ['Análise do parceiro', { DIRC: 'I', Parceiro: 'A' }, 332],
    ['Assinatura DTIC', { DTIC: 'A', DIRC: 'I' }, 374],
    ['Assinatura DAFI', { DAFI: 'A', DIRC: 'I' }, 416],
    ['Assinatura Presidência', { Presidência: 'A', DIRC: 'I', Cliente: 'I' }, 458],
    ['Envio ao cliente', { Sistema: 'R', Cliente: 'I', DIRC: 'C' }, 500],
  ].map(([atividade, atribs, y]) => `
    <rect x="20" y="${y - 18}" width="280" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="36" y="${y + 4}" font-family="Inter,system-ui" font-size="12" font-weight="600" fill="#0f172a">${atividade}</text>
    ${[
      ['DIRC', 320, '#7c3aed'],
      ['Parceiro', 440, '#0c1ba8'],
      ['DTIC', 560, '#0369a1'],
      ['DAFI', 680, '#6d28d9'],
      ['Presidência', 800, '#b45309'],
      ['Cliente', 920, '#0891b2'],
      ['Sistema', 1040, '#059669'],
    ].map(([col, x, c]) => {
      const v = atribs[col]
      if (!v) return ''
      const colors = { R: '#0d9488', A: '#b45309', C: '#0369a1', I: '#94a3b8' }
      return `<circle cx="${x}" cy="${y - 2}" r="11" fill="${colors[v]}"/><text x="${x}" y="${y + 2}" font-family="Inter,system-ui" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">${v}</text>`
    }).join('')}
  `).join('')}

  <!-- legenda -->
  <rect x="20" y="525" width="1160" height="0" stroke="#e2e8f0"/>
  ${[
    ['R', 'Responsible — executa', '#0d9488', 340],
    ['A', 'Accountable — aprova', '#b45309', 540],
    ['C', 'Consulted — opina', '#0369a1', 740],
    ['I', 'Informed — fica ciente', '#94a3b8', 940],
  ].map(([k, t, c, x]) => `
    <circle cx="${x}" cy="528" r="9" fill="${c}"/>
    <text x="${x}" y="532" font-family="Inter,system-ui" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">${k}</text>
    <text x="${x + 16}" y="532" font-family="Inter,system-ui" font-size="11" fill="#475569">${t}</text>
  `).join('')}
</svg>`

const SVG_SM_INTEGRACAO = `
<svg viewBox="0 0 1100 380" style="width:100%;max-width:1100px;display:block;margin:8px auto;">
  <defs>
    <marker id="sm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b"/></marker>
  </defs>
  ${[
    ['Não enviado', 80, 100, '#94a3b8'],
    ['Pendente', 280, 100, '#b45309'],
    ['Enviado', 480, 100, '#0369a1'],
    ['Confirmado', 700, 100, '#059669'],
    ['Erro', 480, 240, '#dc2626'],
    ['Reprocessado', 280, 240, '#7c3aed'],
    ['Dispensado', 880, 240, '#94a3b8'],
  ].map(([t, x, y, c]) => `
    <ellipse cx="${x}" cy="${y}" rx="80" ry="34" fill="#fff" stroke="${c}" stroke-width="2.5"/>
    <text x="${x}" y="${y + 5}" font-family="Inter,system-ui" font-size="13" font-weight="700" fill="${c}" text-anchor="middle">${t}</text>
  `).join('')}

  <!-- transições -->
  <line x1="160" y1="100" x2="200" y2="100" stroke="#1e293b" stroke-width="1.5" marker-end="url(#sm-arrow)"/>
  <line x1="360" y1="100" x2="400" y2="100" stroke="#1e293b" stroke-width="1.5" marker-end="url(#sm-arrow)"/>
  <line x1="560" y1="100" x2="620" y2="100" stroke="#1e293b" stroke-width="1.5" marker-end="url(#sm-arrow)"/>
  <line x1="480" y1="134" x2="480" y2="206" stroke="#dc2626" stroke-width="1.5" marker-end="url(#sm-arrow)"/>
  <text x="492" y="180" font-family="Inter,system-ui" font-size="11" font-weight="600" fill="#dc2626">falha</text>
  <line x1="400" y1="240" x2="360" y2="240" stroke="#1e293b" stroke-width="1.5" marker-end="url(#sm-arrow)"/>
  <line x1="280" y1="206" x2="280" y2="134" stroke="#7c3aed" stroke-width="1.5" marker-end="url(#sm-arrow)"/>
  <text x="290" y="180" font-family="Inter,system-ui" font-size="11" font-weight="600" fill="#7c3aed">reenvio</text>
  <line x1="80" y1="134" x2="800" y2="240" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#sm-arrow)" opacity="0.55"/>
  <text x="440" y="200" font-family="Inter,system-ui" font-size="11" fill="#94a3b8">dispensa com justificativa</text>

  <!-- nota -->
  <rect x="20" y="320" width="1060" height="40" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
  <text x="40" y="345" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="#b45309">Importante:</text>
  <text x="115" y="345" font-family="Inter,system-ui" font-size="12" fill="#0f172a">Pendente / Erro / Não enviado / Dispensado exigem JUSTIFICATIVA preenchida no Evento de Integração.</text>
</svg>`

const SVG_FUNIL = `
<svg viewBox="0 0 900 540" style="width:100%;max-width:900px;display:block;margin:8px auto;">
  ${[
    ['Demandas captadas', 100, 750, '#7c3aed', 14],
    ['Análises DIRC', 165, 660, '#7c3aed', 12],
    ['Propostas em composição', 230, 580, '#0d9488', 9],
    ['Documento gerado', 295, 500, '#6d28d9', 7],
    ['Em assinatura', 360, 420, '#0369a1', 6],
    ['Aprovadas + Enviadas', 425, 340, '#b45309', 5],
    ['Contratos recebidos', 490, 260, '#0891b2', 4],
    ['Publicados + Integrados', 0, 180, '#059669', 0],
  ].slice(0, 7).map(([t, y, w, c, n], i, arr) => {
    const nextW = arr[i + 1] ? arr[i + 1][2] : 180
    const cx = 450
    const x0 = cx - w / 2
    const x1 = cx + w / 2
    const x2 = cx + nextW / 2
    const x3 = cx - nextW / 2
    const y0 = y
    const y1 = y + 60
    return `
      <polygon points="${x0},${y0} ${x1},${y0} ${x2},${y1} ${x3},${y1}" fill="${c}" opacity="${1 - i * 0.07}"/>
      <text x="${cx}" y="${y + 36}" font-family="Inter,system-ui" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">${t}</text>
      <text x="${cx + w / 2 + 24}" y="${y + 40}" font-family="Inter,system-ui" font-size="12" font-weight="700" fill="${c}">${n}</text>
    `
  }).join('')}
  <!-- handover/kickoff embaixo -->
  <rect x="320" y="430" width="260" height="50" rx="14" fill="#059669"/>
  <text x="450" y="461" font-family="Inter,system-ui" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">Kick-off agendado = Fim Fase 1</text>
  <line x1="450" y1="400" x2="450" y2="430" stroke="#059669" stroke-width="3" marker-end="url(#wf-arrow)"/>
</svg>`

const SVG_SM_PROPOSTA = `
<svg viewBox="0 0 1240 540" style="width:100%;max-width:1240px;display:block;margin:8px auto;">
  <defs>
    <marker id="smp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b"/></marker>
  </defs>
  ${[
    ['Em composição', 100, 80, '#7c3aed'],
    ['Em análise DIRC', 100, 180, '#7c3aed'],
    ['Aguardando parceiro', 300, 80, '#0c1ba8'],
    ['Em revisão', 300, 180, '#7c3aed'],
    ['Documento gerado', 500, 80, '#6d28d9'],
    ['Em assinatura', 700, 80, '#0369a1'],
    ['Aprovada', 900, 80, '#b45309'],
    ['Enviada ao cliente', 1100, 80, '#0891b2'],
    ['Aguardando retorno do cliente', 1100, 180, '#0891b2'],
    ['Contrato recebido', 900, 180, '#b45309'],
    ['Contrato cadastrado', 700, 180, '#059669'],
    ['Em Contratação', 500, 180, '#b45309'],
    ['Suspensa', 100, 320, '#94a3b8'],
    ['Cancelada', 300, 320, '#dc2626'],
  ].map(([t, x, y, c]) => `
    <rect x="${x - 80}" y="${y - 22}" width="160" height="44" rx="10" fill="#fff" stroke="${c}" stroke-width="2"/>
    <text x="${x}" y="${y + 5}" font-family="Inter,system-ui" font-size="11.5" font-weight="700" fill="${c}" text-anchor="middle">${t}</text>
  `).join('')}
  <!-- transições principais -->
  ${[
    [180, 80, 220, 80],
    [180, 80, 300, 158], 
    [300, 102, 300, 158],
    [380, 80, 420, 80],
    [580, 80, 620, 80],
    [780, 80, 820, 80],
    [980, 80, 1020, 80],
    [1100, 102, 1100, 158],
    [1020, 180, 980, 180],
    [820, 180, 780, 180],
    [620, 180, 580, 180],
    [420, 180, 380, 180],
  ].map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1e293b" stroke-width="1.5" marker-end="url(#smp-arrow)"/>`).join('')}
  <!-- transições laterais -->
  <line x1="100" y1="298" x2="100" y2="102" stroke="#dc2626" stroke-width="1.4" stroke-dasharray="5 3" opacity="0.6"/>
  <line x1="300" y1="298" x2="300" y2="202" stroke="#dc2626" stroke-width="1.4" stroke-dasharray="5 3" opacity="0.6"/>
  <text x="190" y="280" font-family="Inter,system-ui" font-size="11" fill="#94a3b8" font-style="italic">↑ pode suspender ou cancelar em qualquer momento</text>

  <!-- start/end -->
  <circle cx="32" cy="80" r="14" fill="#fff" stroke="#059669" stroke-width="3"/>
  <line x1="46" y1="80" x2="18" y2="80" stroke="#059669" stroke-width="3" stroke-dasharray="4 3"/>
  <line x1="60" y1="80" x2="20" y2="80" stroke="#1e293b" stroke-width="1.5" marker-end="url(#smp-arrow)"/>
  <text x="32" y="48" font-family="Inter,system-ui" font-size="10" font-weight="600" fill="#059669" text-anchor="middle">Início</text>
  <circle cx="640" cy="180" r="14" fill="#fff" stroke="#dc2626" stroke-width="3"/>
  <text x="640" y="220" font-family="Inter,system-ui" font-size="10" font-weight="600" fill="#dc2626" text-anchor="middle">Fim</text>
  <line x1="620" y1="180" x2="626" y2="180" stroke="#1e293b" stroke-width="1.5" marker-end="url(#smp-arrow)"/>

  <!-- legenda -->
  <text x="500" y="440" font-family="Inter,system-ui" font-size="12" fill="#475569" text-anchor="middle">Linhas pontilhadas vermelhas = transições para Suspensa/Cancelada permitidas em quase qualquer estado.</text>
  <text x="500" y="465" font-family="Inter,system-ui" font-size="12" fill="#475569" text-anchor="middle">Ajuste/Reprovação em assinatura volta para "Em revisão" ou "Em composição".</text>
</svg>`

// ----------------------------------------------------------------------------
// BUILDER
// ----------------------------------------------------------------------------

export function buildFlowDetalhado(IDS) {
  const {
    F_ORG, F_PES, F_USR, F_EST, F_CGF,
    F_PV, F_LIC, F_SRV, F_UNI, F_CPP,
    F_DEM, F_PRP, F_PRI,
    F_DTP, F_DPM, F_DGD,
    F_WFM, F_WFE, F_TRA,
    F_ENV, F_EXT,
    F_CTR, F_CTI, F_REC, F_PUB, F_IGE,
    F_HOV, F_KOF,
    F_NTF, F_HST,
    F_VOP,
  } = IDS

  let n = 0
  const next = () => ++n

  // ----- MÓDULO 0: Capa e contexto -----
  const M0 = { modulo: 'Módulo 0 · Contexto', accent: '#7c3aed' }

  const capa = {
    id: 'step-patlas-f1d-capa', type: 'html',
    title: 'Capa — Manual completo passo a passo',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: 'Atlas V2 — Fase 1 (Manual detalhado)',
    htmlContent: slide({
      ...M0, n: next(),
      title: 'Atlas V2 — Manual completo passo a passo',
      lead: 'Apresentação didática da Fase 1: da identificação da demanda ao kick-off, com fluxograma BPMN, modelagem (ER + arquitetura em camadas), state machines, matriz RACI, funil e detalhamento de cada uma das 31 classes.',
      body: `
        ${grid([
          card('Objetivo da apresentação', 'Capacitar qualquer pessoa nova no Atlas a entender a Fase 1 do início ao fim, com vocabulário, diagramas e exemplos reais (SEMA, SEPLAG, SETASC).', '#7c3aed'),
          card('Público-alvo', 'DIRC, DTIC, DAFI, Presidência, Parceiros e novos analistas. Sem pré-requisitos técnicos.', '#0d9488'),
          card('Duração estimada', '45–60 minutos linha a linha. Pode ser usado também como referência de consulta (cada slide é autocontido).', '#b45309'),
          card('Como navegar', 'Use Próximo/Anterior. Steps de classe abrem a tela real do Atlas; steps BPMN/HTML mostram diagramas e regras.', '#0891b2'),
        ])}
        ${callout('Premissa de leitura',
          'Esta apresentação é COMPLEMENTAR ao flow operacional "Fase 1 — Da demanda ao kick-off". Aquela mostra o fluxo passo a passo; esta explica por quê e como cada peça se encaixa.',
          '#7c3aed')}
      `,
    }),
  }

  const oQueE = {
    id: 'step-patlas-f1d-o-que-e', type: 'html',
    title: 'O que é o Especificador Sydle e o Atlas',
    htmlContent: slide({
      ...M0, n: next(),
      title: 'O que é o Especificador Sydle e o Atlas',
      lead: 'Antes de entrar no fluxo, vamos alinhar o vocabulário básico.',
      body: `
        ${grid([
          card('Especificador Sydle',
            '<b>Ferramenta</b> que serve para criar protótipos navegáveis e fiéis de produtos antes da implementação real. Permite modelar classes (forms), workspaces, fluxos e apresentações.',
            '#7c3aed'),
          card('Atlas',
            '<b>Produto MTI</b> que está sendo especificado: a Plataforma de Gestão Comercial. Atlas V2 = versão fiel à planilha "Gestão Centralizada - DIRC.xlsx", organograma MTI e BPMN.',
            '#0d9488'),
          card('Fase 1',
            'Escopo desta especificação. Cobre da <b>demanda</b> ao <b>kick-off</b>. NÃO cobre OS operacional, NF, DAR, pagamento, BI, CMDB (são fase futura).',
            '#b45309'),
          card('Classe vs Form',
            'No vocabulário do usuário falamos em <b>classe</b>. No código é um <i>FormDef</i> (forms.json). Cada classe tem campos, abas (seções), métodos (botões) e presets.',
            '#0891b2'),
        ])}
        ${callout('Atlas NÃO é o sistema final',
          'Atlas (o protótipo no Especificador Sydle) <b>especifica</b> o que será construído depois em SydleONE. A Fase 1 entrega <b>fluxo navegável + regras + modelagem</b>.',
          '#dc2626')}
      `,
    }),
  }

  const personas = {
    id: 'step-patlas-f1d-personas', type: 'html',
    title: 'Personas e papéis',
    htmlContent: slide({
      ...M0, n: next(),
      title: 'Personas e papéis na Fase 1',
      lead: 'Sete personas se relacionam ao longo da jornada. Conhecê-las desde o início ajuda a entender o restante.',
      body: `
        ${grid([
          card('DIRC — Analista',
            'Recebe a demanda, analisa, define tipo de contratação, monta a proposta, gera o documento e cadastra o cliente após contrato.',
            '#7c3aed'),
          card('DIRC — Diretor',
            'Aprova a proposta antes do envio. Pode atuar como assinante DIRC no workflow.',
            '#7c3aed'),
          card('DTIC — Diretor',
            'Avalia viabilidade técnica e <b>assina</b> a proposta. Etapa obrigatória do workflow.',
            '#0369a1'),
          card('DAFI — Diretor',
            'Assinatura <b>complementar opcional</b> (Gestão Administrativa). Quando o modelo de proposta exigir.',
            '#6d28d9'),
          card('Presidência',
            '<b>Aprovação final</b> antes do envio da proposta ao cliente.',
            '#b45309'),
          card('Parceiro autorizado',
            'Quando vinculado, analisa a proposta antes das assinaturas internas. Vê APENAS o que lhe é vinculado.',
            '#0c1ba8'),
          card('Cliente / Órgão',
            'Identificado na demanda (sem cadastro formal). Recebe a proposta. Retorna o contrato assinado. <b>Cadastro formal só depois do contrato.</b>',
            '#0891b2'),
          card('Sistema / Pós-vendas',
            'Envia notificações, registra integrações, configura recorrência, publica contrato, gera handover, agenda kick-off.',
            '#059669'),
        ], 4)}
      `,
    }),
  }

  const mapa = {
    id: 'step-patlas-f1d-mapa', type: 'html',
    title: 'Mapa mental dos módulos da Fase 1',
    htmlContent: slide({
      ...M0, n: next(),
      title: 'Mapa mental dos módulos da Fase 1',
      lead: 'A Fase 1 se organiza em 8 macroblocos. Esta apresentação percorre cada um, terminando em uma síntese.',
      body: SVG_MIND_MAP + callout('Como ler',
        'Os 8 ramos refletem a sequência cronológica. Cada um corresponde a 1–2 módulos desta apresentação. Os blocos coloridos antecipam os workspaces (Administração=azul, Catálogo=verde, Propostas=roxo, etc).',
        '#7c3aed'),
    }),
  }

  // ----- MÓDULO 1: Arquitetura e modelagem -----
  const M1 = { modulo: 'Módulo 1 · Arquitetura e modelagem', accent: '#1e40af' }

  const arquitetura = {
    id: 'step-patlas-f1d-arq', type: 'html',
    title: 'Arquitetura do Atlas em camadas',
    htmlContent: slide({
      ...M1, n: next(),
      title: 'Arquitetura do Atlas em camadas',
      lead: 'O Especificador organiza tudo em 5 camadas. Entender essa pilha é fundamental para conversar sobre o protótipo.',
      body: SVG_ARCHITECTURE + grid([
        card('Apresentação',
          '<b>Flow</b> = roteiro. Cada <b>Step</b> é uma tela: HTML, BPMN, Classe ou Workspace. Este manual é um Flow de 45 steps.',
          '#7c3aed'),
        card('Explorer',
          '<b>Workspace</b> = visão por usuário. Agrupa <b>Pacotes</b>, que contêm <b>Classes</b>. O Atlas V2 tem 6 workspaces.',
          '#0d9488'),
        card('Forms',
          'A classe em si: <b>seções (abas)</b>, <b>campos</b>, <b>métodos (botões)</b> e <b>presets</b> (dados de exemplo).',
          '#0369a1'),
        card('Persistência',
          'Tudo vive em JSON em data/subprojects/atlas-v2/epics/atlas-v2-fase1/. O script build-atlas-v2-fase1.mjs é a fonte de verdade.',
          '#475569'),
      ], 4),
    }),
  }

  const modeloDados = {
    id: 'step-patlas-f1d-modelo', type: 'html',
    title: 'Modelo de dados — visão geral',
    htmlContent: slide({
      ...M1, n: next(),
      title: 'Modelo de dados — visão geral das 31 classes',
      lead: 'A modelagem é organizada em 5 blocos: Identidade, Catálogo, Demanda→Proposta, Documento+Workflow e Contrato+Operacionalização.',
      body: SVG_ER + callout('Como ler o modelo',
        'Setas indicam referência (FK). A <i>linha pontilhada verde</i> do Catálogo até o Item da Proposta é o <b>snapshot</b>: cópia congelada dos dados. A "espinha dorsal" do processo passa por Proposta → Documento → Trâmite → Contrato.',
        '#0d9488'),
    }),
  }

  const bpmnGeral = {
    id: 'step-patlas-f1d-bpmn-geral', type: 'html',
    title: 'BPMN completo da Fase 1 (lanes por responsável)',
    htmlContent: slide({
      ...M1, n: next(),
      title: 'BPMN completo da Fase 1',
      lead: 'Visão BPMN com 7 swim lanes (DIRC, Parceiro, DTIC, DAFI, Presidência, Cliente, Sistema). Setas pontilhadas marcam caminhos opcionais.',
      body: SVG_BPMN + grid([
        card('Caminho principal',
          'DIRC registra → analisa → define tipo → catálogo → snapshot → compõe → documento → análise parceiro (se houver) → DTIC → DAFI (se exigido) → Presidência → envio → contrato → operações → handover → kick-off.',
          '#7c3aed'),
        card('Caminhos opcionais',
          '<b>Sem parceiro</b>: pula análise do parceiro. <b>Sem DAFI</b>: pula assinatura complementar. <b>Cliente recusa</b>: proposta pode ser Suspensa/Cancelada.',
          '#94a3b8'),
      ])
    }),
  }

  // ----- MÓDULO 2: Identidade -----
  const M2 = { modulo: 'Módulo 2 · Identidade', accent: '#1e40af' }

  const wsAdm = {
    id: 'step-patlas-f1d-ws-adm', type: 'workspace',
    title: 'Workspace Administração Atlas',
    linkedWorkspaceId: 'ws-patlas-administracao',
    workspacePresentationDescription: 'Workspace usado por administradores e DIRC para manter a base cadastral. Contém Identidade (Organização, Pessoa, Usuário), Estrutura MTI, Cargos/Permissões e Auditoria.',
  }

  const orgStep = {
    id: 'step-patlas-f1d-org', type: 'class',
    title: 'Classe: Organização — base cadastral',
    linkedFormId: F_ORG,
    classPresentationTitle: 'Organização',
    classPresentationDescription: 'Cadastra MTI, unidades MTI, clientes/órgãos, parceiros, fornecedores. 5 abas (Dados principais, Contatos, Endereço, Vínculos, Status). Status Inativa/Bloqueada/Suspensa NÃO aparece como opção principal em nova proposta. Parceiro só pode ser usado se Ativo.',
  }

  const pesStep = {
    id: 'step-patlas-f1d-pes', type: 'class',
    title: 'Classe: Pessoa — quem assina e atua',
    linkedFormId: F_PES,
    classPresentationTitle: 'Pessoa',
    classPresentationDescription: 'Pessoas vinculadas à MTI, parceiros ou clientes. Pessoa pode existir sem usuário. Para assinar, precisa ter "Pode assinar = Sim" e estar em cargo apto. 5 abas: Dados pessoais, Contato, Organização e função, Assinatura, Observações.',
  }

  const usrStep = {
    id: 'step-patlas-f1d-usr', type: 'class',
    title: 'Classe: Usuário — acesso e credenciais',
    linkedFormId: F_USR,
    classPresentationTitle: 'Usuário',
    classPresentationDescription: 'Controla autenticação (MT Login, Gov.br, AD/LDAP) e perfis. Cliente só recebe credenciais APÓS contrato recebido — premissa obrigatória. Parceiro vê apenas o que está vinculado à sua organização.',
  }

  const estCgfStep = {
    id: 'step-patlas-f1d-est-cgf', type: 'html',
    title: 'Estrutura MTI + Cargo/Função (modelo)',
    htmlContent: slide({
      ...M2, n: next(),
      title: 'Estrutura MTI + Cargo/Função',
      lead: 'A assinatura é por CARGO, não por pessoa. Quem assina é o ocupante atual do cargo. Mudou o ocupante? Novas pendências vão automaticamente para o novo.',
      body: SVG_HIERARQUIA_MTI + callout('Premissa obrigatória — Assinatura por cargo/função',
        '<b>Assinante configurado: Diretor DIRC</b> &nbsp;→&nbsp; <b>Pessoa executante: quem ocupa o cargo no momento.</b> Se ocupante muda, novas pendências vão para o novo, sem reconfiguração do workflow.',
        '#b45309'),
    }),
  }

  // ----- MÓDULO 3: Catálogo -----
  const M3 = { modulo: 'Módulo 3 · Catálogo comercial', accent: '#0d9488' }

  const wsCat = {
    id: 'step-patlas-f1d-ws-cat', type: 'workspace',
    title: 'Workspace Catálogo Comercial',
    linkedWorkspaceId: 'ws-patlas-catalogo',
    workspacePresentationDescription: 'Cinco catálogos: Produtos Vigentes, Catálogo de Licenças, Catálogo de Serviços, Catálogo Universal (Tipo 3) e Catálogos por Parceria (12 parcerias). Itens Paralisados/Suspensos aparecem apenas para consulta.',
  }

  const pvStep = {
    id: 'step-patlas-f1d-pv', type: 'class',
    title: 'Classe: Produto Vigente — origem planilha "Produtos Vigentes"',
    linkedFormId: F_PV,
    classPresentationTitle: 'Produto Vigente',
    classPresentationDescription: '6 abas (Identificação, Cobrança, Responsáveis, Códigos, Catálogo/Parceria, Status). Campos vêm direto das colunas da planilha: Descrição, Solução, Métrica, Cobrança, Valor Unitário, FC, Focal Vendas/Pós, Unidade DTIC, Parceiro, Códigos SIAG/Protheus, Link catálogo. Presets reais: MTI CLOUD (SIAG 0005315) e MTI Créditos TIC (SIAG 0018787).',
  }

  const licStep = {
    id: 'step-patlas-f1d-lic', type: 'class',
    title: 'Classe: Catálogo de Licença — Universal × Individualizado',
    linkedFormId: F_LIC,
    classPresentationTitle: 'Catálogo de Licença',
    classPresentationDescription: 'Origem: planilha "CATÁLOGO DE LICENÇAS" (~83 entradas). Campos-chave: Universal=Sim → compõe catálogo maior; Individualizado=Sim → contratada como objeto específico. Modelo de venda é obrigatório (Por Licença / Por Usuário / Por Pacote / Por Consumo / Por Catálogo). Preset real: MTI Workspace Frontline 5GB (SIAG 111063, R$ 241,85, Paralisada).',
  }

  const srvStep = {
    id: 'step-patlas-f1d-srv', type: 'class',
    title: 'Classe: Catálogo de Serviço — complexidade e HST/UST',
    linkedFormId: F_SRV,
    classPresentationTitle: 'Catálogo de Serviço',
    classPresentationDescription: 'Origem: planilha "CATÁLOGO DE SERVIÇOS". Tem Complexidade (Sem/Muito baixa/Baixa/Média/Alta/Muito alta/Especial), QTDE HST/UST por execução, recorrência inclui "Por Homologação". Column 26 da planilha foi renomeada para "Observações/Controle interno". Preset real: MTI Simplifica — Elaborar Plano de Projeto / Complexidade Média / 10 USTs / R$ 1.610,20.',
  }

  const uniCpp = {
    id: 'step-patlas-f1d-uni-cpp', type: 'html',
    title: 'Catálogo Universal × Catálogo por Parceria',
    htmlContent: slide({
      ...M3, n: next(),
      title: 'Catálogo Universal × Catálogo por Parceria',
      lead: 'São dois conceitos diferentes que sustentam contratações Tipo 2 e Tipo 3.',
      body: SVG_TIPOS_CONTRATACAO + grid([
        card('Catálogo Universal',
          'Apoia contratação <b>Tipo 3</b> (créditos / ecossistema). Tem campos de valor por complexidade (Muito baixa → Muito alta) e conversores. Pense em <b>"moeda de serviços"</b>: cliente compra créditos genéricos e consome conforme demanda.',
          '#0d9488'),
        card('Catálogo por Parceria',
          'Cada parceria tem seu próprio catálogo (MTI Cloud, Workspace, Simplifica, IA, Lab, Connect, Now, QI, SaaS, DevSec.Gov, Host, Data Security). Núcleo fixo de ~30 campos + campos dinâmicos (vCPU, RAM, capacidade, tag da máquina, etc.).',
          '#0c1ba8'),
      ]),
    }),
  }

  // ----- MÓDULO 4: Captação -----
  const M4 = { modulo: 'Módulo 4 · Demanda → Análise', accent: '#7c3aed' }

  const capt = {
    id: 'step-patlas-f1d-capt', type: 'html',
    title: 'Da captação à análise da DIRC',
    htmlContent: slide({
      ...M4, n: next(),
      title: 'Captação e análise da demanda',
      lead: 'A jornada começa quando uma demanda chega à MTI. <b>Importante: o cliente NÃO monta proposta no fluxo principal da Fase 1.</b>',
      body: `
        ${grid([
          card('Como chega a demanda',
            '<b>Origem:</b> E-mail, WhatsApp, Marketplace/site comercial, Reunião, Parceiro, Portal futuro, Outro.<br><b>Tipo:</b> Nova contratação, Renovação, Ampliação, Substituição, Proposta complementar, Estudo de viabilidade.',
            '#7c3aed'),
          card('Quem registra',
            'A DIRC (analista ou diretor). Eventualmente um <b>parceiro autorizado</b> pode registrar em nome do cliente. Em ambos os casos, é a DIRC que analisa antes de virar proposta.',
            '#1e40af'),
          card('Resultado da análise',
            '5 caminhos possíveis: <b>Prosseguir</b> (cria proposta), <b>Solicitar complemento</b>, <b>Enviar ao parceiro</b>, <b>Rejeitar</b>, <b>Cancelar</b>. Todos com justificativa textual.',
            '#0d9488'),
          card('Cliente identificado, sem cadastro',
            'Na demanda, o cliente é apenas <b>identificado</b> (SEMA, SEPLAG, SETASC). Sem usuário, sem credenciais. Esse cadastro formal só virá depois do contrato.',
            '#0891b2'),
        ])}
      `,
    }),
  }

  const demStep = {
    id: 'step-patlas-f1d-dem', type: 'class',
    title: 'Classe: Demanda — protocolo e triagem',
    linkedFormId: F_DEM,
    classPresentationTitle: 'Demanda / Evento Comercial',
    classPresentationDescription: '6 abas: Resumo, Cliente e solicitante, Necessidade, Análise DIRC, Anexos, Histórico. Status: Recebida → Em análise DIRC → Aguardando complemento ou Em composição de proposta ou Enviada ao parceiro. Presets reais: COT-2026-001/002/003 (SEMA, SEPLAG, SETASC).',
  }

  const bpmnDirc = {
    id: 'step-patlas-f1d-bpmn-dirc', type: 'bpmnActivity',
    title: 'BPMN: análise da DIRC',
    bpmnTaskType: 'userTask',
    bpmnActivityKey: 'Análise da DIRC',
    bpmnDescription: 'Quando uma demanda é registrada, a DIRC inicia a análise inicial. Decide se a demanda vira proposta, precisa de complemento, vai ao parceiro ou é rejeitada.',
    assigneeRole: 'Analista DIRC',
    assigneeRoleDetail: 'Analista responsável pela demanda (cargo/função "Analista DIRC"). Pode ser revisado pelo Diretor DIRC.',
    bpmnRuleList: [
      'Toda demanda passa por análise antes de virar proposta — não há "auto-conversão".',
      'Complemento solicitado mantém a demanda na DIRC, com status "Aguardando complemento".',
      'Rejeição exige justificativa textual.',
      'Cliente Inativo/Bloqueado/Suspenso não pode prosseguir como cliente da nova proposta.',
    ],
    bpmnPossiblePaths: [
      { key: 'Prosseguir → Criar proposta', value: 'step-patlas-f1d-tipos' },
      { key: 'Solicitar complemento', value: 'step-patlas-f1d-dem' },
      { key: 'Enviar ao parceiro', value: 'step-patlas-f1d-bpmn-wf' },
      { key: 'Rejeitar / Cancelar', value: 'step-patlas-f1d-funil' },
    ],
    bpmnSla: '3 dias úteis para primeira análise',
    bpmnSlaIfExceeded: 'Notificação ao Diretor DIRC + card "Demandas aguardando complemento" piora na Visão Operacional.',
  }

  const tipos = {
    id: 'step-patlas-f1d-tipos', type: 'html',
    title: 'Os 3 tipos de contratação',
    htmlContent: slide({
      ...M4, n: next(),
      title: 'Os 3 tipos de contratação',
      lead: 'A DIRC define o tipo ANTES de selecionar itens. Esse tipo determina qual código SIAG/Protheus será usado em cada item.',
      body: SVG_TIPOS_CONTRATACAO + callout('Por que isso importa?',
        'Cada catálogo tem múltiplos códigos: do item específico, do catálogo do produto e do catálogo geral. O tipo escolhido define qual desses códigos vira o "Código SIAG/Protheus usado" no item contratado. Erro aqui = nota fiscal errada lá na frente.',
        '#b45309'),
    }),
  }

  // ----- MÓDULO 5: Proposta e snapshot -----
  const M5 = { modulo: 'Módulo 5 · Proposta e snapshot', accent: '#7c3aed' }

  const snapExplain = {
    id: 'step-patlas-f1d-snap-explain', type: 'html',
    title: 'A lógica do snapshot do catálogo',
    htmlContent: slide({
      ...M5, n: next(),
      title: 'A lógica do snapshot do catálogo',
      lead: 'Quando você adiciona um item de catálogo na proposta, o Atlas COPIA todos os dados relevantes para o Item da Proposta. A proposta vira uma fotografia do catálogo naquele momento.',
      body: SVG_SNAPSHOT + grid([
        card('O que é copiado',
          'Descrição, métrica, valor unitário, custo parceiro, markup, distribuições parceiro/MTI, modelo de venda, recorrência, códigos SIAG/Protheus de todos os 3 níveis, parceria, versão catálogo, universal/individualizado.',
          '#0d9488'),
        card('O que é preenchido na proposta',
          'Quantidade (e o Valor total = qtd × valor unitário). Justificativa, se for ajuste. Justificativa obrigatória, se o item for Manual (origem ≠ catálogo).',
          '#7c3aed'),
        card('Item Manual',
          'Quando o catálogo não cobre. <b>Justificativa OBRIGATÓRIA.</b> Versão catálogo fica em branco. Códigos podem ser inseridos manualmente.',
          '#b45309'),
        card('Ajuste pela DIRC',
          'Se a DIRC mudar valor/quantidade depois do snapshot, "Justificativa de ajuste" passa a ser obrigatória. O snapshot original fica preservado para auditoria.',
          '#dc2626'),
      ]),
    }),
  }

  const prpStep = {
    id: 'step-patlas-f1d-prp', type: 'class',
    title: 'Classe: Proposta — núcleo do processo',
    linkedFormId: F_PRP,
    classPresentationTitle: 'Proposta',
    classPresentationDescription: '9 abas: Dados comerciais, Cliente e parceiro, Escopo e objetivo, Itens da proposta, Valores e vigência, Documento, Workflow e assinaturas, Envio ao cliente, Histórico. Origem: planilha "Propostas". Presets reais: PROP-98/2025 SEMA (R$ 169.127,04 suspensa) e PROP-3/2025 SEPLAG (R$ 16.563.415,72 em contratação).',
  }

  const priStep = {
    id: 'step-patlas-f1d-pri', type: 'class',
    title: 'Classe: Item da Proposta — onde mora o snapshot',
    linkedFormId: F_PRI,
    classPresentationTitle: 'Item da Proposta',
    classPresentationDescription: '6 abas (Origem, Dados copiados, Quantidade e valores, Contratação e recorrência, Parceiro e responsáveis, Justificativas). Cada item tem todos os 6 códigos SIAG/Protheus (item específico, catálogo produto, catálogo geral) + o código "usado" derivado do Tipo de Contratação.',
  }

  // ----- MÓDULO 6: Documento + Workflow -----
  const M6 = { modulo: 'Módulo 6 · Documento e workflow', accent: '#6d28d9' }

  const docExplain = {
    id: 'step-patlas-f1d-doc-explain', type: 'html',
    title: 'Modelo + Parâmetro = Documento Gerado',
    htmlContent: slide({
      ...M6, n: next(),
      title: 'Modelo + Parâmetro = Documento Gerado',
      lead: 'Documentos da proposta e do contrato não são feitos do zero. Eles são gerados a partir de um Modelo + Parâmetros preenchidos com dados da Proposta/Cliente/Contrato.',
      body: `
        ${grid([
          card('Modelo de Documento',
            'Template reutilizável com HTML/parâmetros e versão. Quando publicado, NÃO pode ser editado direto — alteração gera nova versão. Tipos: Proposta, Contrato, Handover, Termo, Anexo.',
            '#6d28d9'),
          card('Parâmetro de Documento',
            'Define os placeholders: <code>{{cliente}}</code>, <code>{{valor_total}}</code>, <code>{{parceiro}}</code>, <code>{{vigencia_meses}}</code>... Cada um aponta para uma origem (Proposta/Cliente/Parceiro/Item/Contrato/Manual/Sistema).',
            '#7c3aed'),
          card('Documento Gerado',
            'Instância. Guarda a versão do modelo usado (snapshot do template!) e a versão da proposta. Mudanças no modelo depois não afetam documentos já gerados.',
            '#0369a1'),
          card('Quando é gerado?',
            'A DIRC chama "Gerar documento da proposta". Antes do workflow. Sai um PDF/HTML pronto para revisão e assinatura.',
            '#0d9488'),
        ], 2)}
      `,
    }),
  }

  const dgdStep = {
    id: 'step-patlas-f1d-dgd', type: 'class',
    title: 'Classe: Documento Gerado',
    linkedFormId: F_DGD,
    classPresentationTitle: 'Documento Gerado',
    classPresentationDescription: 'Vinculado à proposta OU ao contrato. Status: Gerado → Em revisão → Enviado para assinatura → Assinado → Enviado ao cliente → Cancelado. Guarda a versão do modelo e da proposta no momento da geração.',
  }

  const bpmnWf = {
    id: 'step-patlas-f1d-bpmn-wf', type: 'html',
    title: 'BPMN do workflow de aprovação',
    htmlContent: slide({
      ...M6, n: next(),
      title: 'BPMN do workflow de aprovação',
      lead: 'O workflow padrão de aprovação de proposta tem 4 gateways (Parceiro?, DAFI?, retorno por ajuste/reprovação). Veja o desenho:',
      body: SVG_WORKFLOW + grid([
        card('Sem parceiro',
          'A etapa "Análise do parceiro" é dispensada automaticamente. Vai direto para DTIC.',
          '#94a3b8'),
        card('Sem DAFI',
          'Quando o modelo de workflow não exige assinatura complementar, pula direto para Presidência.',
          '#94a3b8'),
        card('Ajuste',
          'Volta para revisão da proposta. A DIRC ajusta, regenera documento e submete de novo.',
          '#dc2626'),
        card('Reprovação',
          'Pode encerrar a proposta como Suspensa/Cancelada, OU voltar para nova composição.',
          '#dc2626'),
      ], 4),
    }),
  }

  const raci = {
    id: 'step-patlas-f1d-raci', type: 'html',
    title: 'Matriz RACI das assinaturas',
    htmlContent: slide({
      ...M6, n: next(),
      title: 'Matriz RACI — quem faz o quê na Fase 1',
      lead: 'R = Responsible (executa). A = Accountable (aprova/é responsável final). C = Consulted (opina). I = Informed (fica ciente).',
      body: SVG_RACI + callout('Como usar a RACI',
        'Em cada atividade existe <b>exatamente um A</b> (quem responde). Pode haver vários R/C/I. Esta visão ajuda a entender por que a assinatura por <b>cargo/função</b> é fundamental: o A é o ocupante atual do cargo, não uma pessoa específica.',
        '#6d28d9'),
    }),
  }

  const traStep = {
    id: 'step-patlas-f1d-tra', type: 'class',
    title: 'Classe: Trâmite de Assinatura',
    linkedFormId: F_TRA,
    classPresentationTitle: 'Trâmite de Assinatura',
    classPresentationDescription: '5 abas (Documento e proposta, Assinante, Status e prazo, Resultado, Histórico). Grupo: DIRC / Parceiro / DTIC / Presidência / Complementar (DAFI). Ajuste solicitado ou Reprovado volta para revisão. Dispensado (sem parceiro) registra a dispensa sem bloquear o fluxo.',
  }

  // ----- MÓDULO 7: Envio + contratação externa + contrato -----
  const M7 = { modulo: 'Módulo 7 · Envio e contratação externa', accent: '#0891b2' }

  const envStep = {
    id: 'step-patlas-f1d-env', type: 'class',
    title: 'Classe: Envio da Proposta',
    linkedFormId: F_ENV,
    classPresentationTitle: 'Envio da Proposta',
    classPresentationDescription: 'Registra o envio formal ao cliente DEPOIS da aprovação no workflow. Canal (E-mail/Portal futuro/Link), destinatários, data, status (Enviado/Erro/Reenviado/Cancelado). Quem envia é o Sistema (ou DIRC, manualmente).',
  }

  const extStep = {
    id: 'step-patlas-f1d-ext', type: 'class',
    title: 'Classe: Contratação Externa',
    linkedFormId: F_EXT,
    classPresentationTitle: 'Contratação Externa',
    classPresentationDescription: 'Atlas acompanha o que acontece FORA dele (compras do cliente, jurídico). Status: Aguardando cliente → Documentação solicitada → Documentação enviada → Em contratação externa → Contrato assinado recebido | Recusada | Sem retorno.',
  }

  const ctrExplain = {
    id: 'step-patlas-f1d-ctr-explain', type: 'html',
    title: 'Recepção do contrato e divergências',
    htmlContent: slide({
      ...M7, n: next(),
      title: 'Recepção do contrato e divergências',
      lead: 'Quando o contrato volta da contratação externa, ele pode estar IDÊNTICO à proposta — ou DIVERGIR. Toda divergência precisa ser registrada com tipo e justificativa.',
      body: `
        ${grid([
          card('Obrigatório no contrato',
            '<b>Anexo</b> do contrato assinado.<br><b>Data de retorno</b> à MTI.<br><b>Proposta vinculada</b> (a que originou).<br><b>Cliente</b> (a organização cadastrada).',
            '#b45309'),
          card('Tipos de divergência',
            '<ul style="margin:6px 0;padding-left:18px;"><li>Redução de escopo</li><li>Alteração de quantidade</li><li>Item removido / substituído</li><li>Ajuste de valor</li><li>Erro do cliente</li><li>Adequação contratual</li><li>Outro</li></ul>',
            '#dc2626'),
          card('Exemplo real — CT-2026-002 SEPLAG',
            'Cliente reduziu de 300 para 250 USN por restrição orçamentária. Tipo: Redução de escopo. Justificativa documentada no Item Contratado.',
            '#0891b2'),
          card('Itens contratados ≠ Itens da proposta',
            'Cada Item Contratado tem referência ao Item da Proposta de origem. Se houve alteração, "Alterado no contrato? = Sim" + Motivo. Preserva auditoria.',
            '#7c3aed'),
        ])}
      `,
    }),
  }

  const ctrStep = {
    id: 'step-patlas-f1d-ctr', type: 'class',
    title: 'Classe: Contrato',
    linkedFormId: F_CTR,
    classPresentationTitle: 'Contrato',
    classPresentationDescription: '9 abas. Status: Recebido → Em revisão → Itens revisados → Cliente cadastrado → Integrações pendentes → Publicação pendente → Publicado → Handover gerado → Kick-off agendado → Finalizado. Checklist booleano: cliente cadastrado, credenciais enviadas, recorrências configuradas, publicação registrada, integrações Protheus/ServiceNow.',
  }

  const ctiStep = {
    id: 'step-patlas-f1d-cti', type: 'class',
    title: 'Classe: Item Contratado',
    linkedFormId: F_CTI,
    classPresentationTitle: 'Item Contratado',
    classPresentationDescription: 'Comparativo proposta × contrato. Cada divergência exige motivo. Recorrência por item (Mensal/Anual/Sob demanda/Por execução/Única/Pro-rata).',
  }

  // ----- MÓDULO 8: Operacionalização -----
  const M8 = { modulo: 'Módulo 8 · Operacionalização', accent: '#059669' }

  const bpmnOps = {
    id: 'step-patlas-f1d-bpmn-ops', type: 'bpmnActivity',
    title: 'BPMN: pós-contrato — 6 atividades em paralelo',
    bpmnTaskType: 'systemTask',
    bpmnActivityKey: 'Operacionalização pós-contrato',
    bpmnDescription: 'Quando o contrato é registrado, 6 atividades são disparadas (a maioria podendo ser paralela): cadastro formal do cliente, envio de credenciais, integrações com Protheus e ServiceNow, configuração de recorrências, registro de publicação, e geração do handover.',
    assigneeRole: 'Sistema + Analista DIRC + Pós-vendas',
    assigneeRoleDetail: 'Sistema dispara, DIRC valida cadastro/credenciais, Pós-vendas recebe o handover.',
    bpmnRuleList: [
      'Cliente só recebe credenciais APÓS cadastro formal — premissa obrigatória.',
      'Protheus e ServiceNow exigem status rastreável (Não enviado/Pendente/Enviado/Confirmado/Erro/Reprocessado/Dispensado).',
      'Pendente / Erro / Não enviado / Dispensado exigem JUSTIFICATIVA preenchida.',
      'Publicação é OBRIGATÓRIA. Contrato sem publicação não é finalizado.',
      'Recorrência configurada por item contratado.',
    ],
    bpmnPossiblePaths: [
      { key: 'Tudo OK → Handover', value: 'step-patlas-f1d-hov' },
      { key: 'Integração com erro', value: 'step-patlas-f1d-integ-sm' },
      { key: 'Publicação pendente (bloqueio)', value: 'step-patlas-f1d-pub' },
    ],
    bpmnSla: '15 dias úteis para concluir todas as atividades pós-contrato',
    bpmnSlaIfExceeded: 'Card de gargalo na Visão Operacional + notificação para a DIRC.',
  }

  const integSm = {
    id: 'step-patlas-f1d-integ-sm', type: 'html',
    title: 'State machine — status de integração',
    htmlContent: slide({
      ...M8, n: next(),
      title: 'State machine — status de integração (Protheus / ServiceNow)',
      lead: 'Esta é a única state machine literal do Atlas. Aplicável aos eventos de integração com sistemas externos.',
      body: SVG_SM_INTEGRACAO + grid([
        card('Estados intermediários',
          '<b>Não enviado:</b> ainda não foi tentado.<br><b>Pendente:</b> aguardando processamento.<br><b>Enviado:</b> chegou no destino, aguarda confirmação.',
          '#7c3aed'),
        card('Estados terminais positivos',
          '<b>Confirmado:</b> integração bem-sucedida.<br><b>Reprocessado:</b> erro corrigido e reenvio bem-sucedido.<br><b>Dispensado:</b> formalmente fora de escopo (com justificativa).',
          '#059669'),
      ]),
    }),
  }

  const igeStep = {
    id: 'step-patlas-f1d-ige', type: 'class',
    title: 'Classe: Evento de Integração',
    linkedFormId: F_IGE,
    classPresentationTitle: 'Evento de Integração',
    classPresentationDescription: 'Cada chamada para Protheus/ServiceNow/CMDB (futuro)/ClickSense (futuro). Tipo de evento: Cadastro, Consulta, Envio, Retorno, Reprocessamento, Cancelamento. Justificativa obrigatória se status ≠ Confirmado/Enviado.',
  }

  const recStep = {
    id: 'step-patlas-f1d-rec', type: 'class',
    title: 'Classe: Recorrência de Cobrança',
    linkedFormId: F_REC,
    classPresentationTitle: 'Recorrência de Cobrança',
    classPresentationDescription: 'Configurada por item contratado. Não executa cobrança (isso é fase futura). Apenas registra a regra: Mensal/Anual/Sob demanda/Por execução/Única/Pro-rata, com data início/fim e dia previsto.',
  }

  const pubStep = {
    id: 'step-patlas-f1d-pub', type: 'class',
    title: 'Classe: Publicação do Contrato — passo obrigatório',
    linkedFormId: F_PUB,
    classPresentationTitle: 'Publicação do Contrato',
    classPresentationDescription: 'Extrato + data SÃO mandatórios. Contrato não finaliza sem publicação. Veículo: Diário Oficial do Estado, portal, outro. Preset real: DOE-MT Edição 28.945 de 12/03/2026.',
  }

  // ----- MÓDULO 9: Encerramento -----
  const M9 = { modulo: 'Módulo 9 · Encerramento da Fase 1', accent: '#059669' }

  const hovStep = {
    id: 'step-patlas-f1d-hov', type: 'class',
    title: 'Classe: Handover — transferência para pós-vendas',
    linkedFormId: F_HOV,
    classPresentationTitle: 'Handover',
    classPresentationDescription: 'Documento operacional que transfere o atendimento da DIRC para o Pós-vendas. Status: Pendente → Gerado → Enviado → Aguardando kick-off → Kick-off agendado → Concluído. Vinculado ao contrato, cliente e proposta.',
  }

  const kofStep = {
    id: 'step-patlas-f1d-kof', type: 'class',
    title: 'Classe: Kick-off — marco final operacional',
    linkedFormId: F_KOF,
    classPresentationTitle: 'Kick-off',
    classPresentationDescription: 'Reunião com MTI, cliente e parceiro. Participantes, data, link/local, pauta. Status: Aguardando agendamento → Agendado → Realizado | Reagendar | Cancelado. <b>Kick-off agendado encerra operacionalmente a Fase 1.</b>',
  }

  const vopStep = {
    id: 'step-patlas-f1d-vop', type: 'class',
    title: 'Classe: Visão Operacional da Fase 1',
    linkedFormId: F_VOP,
    classPresentationTitle: 'Visão Operacional',
    classPresentationDescription: '22 indicadores em 5 grupos: Demandas, Propostas, Assinaturas pendentes, Contratos, Pós-contrato. 8 filtros: Cliente, Parceiro, Solução, Responsável DIRC, Status, Período, Tipo de contratação. Presets: Painel Geral, Painel SEMA, Painel SEPLAG, Painel de Gargalos.',
  }

  // ----- MÓDULO 10: Síntese -----
  const M10 = { modulo: 'Módulo 10 · Síntese', accent: '#7c3aed' }

  const funil = {
    id: 'step-patlas-f1d-funil', type: 'html',
    title: 'Funil consolidado da Fase 1',
    htmlContent: slide({
      ...M10, n: next(),
      title: 'Funil consolidado da Fase 1',
      lead: 'De cima para baixo: do volume de captação à conclusão operacional. Quanto mais para baixo, mais peso e atenção da operação.',
      body: SVG_FUNIL + callout('Métricas de saúde',
        'Demandas → Propostas: taxa de qualificação. Propostas → Aprovadas: taxa de aprovação. Enviadas → Contratos recebidos: taxa de fechamento. Recebidos → Publicados+Integrados: SLA de operacionalização. Tudo isso é visível na Visão Operacional.',
        '#059669'),
    }),
  }

  const smPrp = {
    id: 'step-patlas-f1d-sm-prp', type: 'html',
    title: 'State machine — Status da Proposta',
    htmlContent: slide({
      ...M10, n: next(),
      title: 'State machine — Status da Proposta',
      lead: 'A proposta passa por 12+ estados ao longo da Fase 1. Veja todas as transições possíveis:',
      body: SVG_SM_PROPOSTA,
    }),
  }

  const glossario = {
    id: 'step-patlas-f1d-glossario', type: 'html',
    title: 'Glossário rápido + próximos passos',
    htmlContent: slide({
      ...M10, n: next(),
      title: 'Glossário rápido + próximos passos',
      lead: 'Termos essenciais para conversar sobre Atlas V2 com confiança.',
      body: `
        <h2 style="font-size:1.15rem;margin:24px 0 8px 0;color:#7c3aed;">Glossário</h2>
        ${grid([
          card('Snapshot', 'Cópia congelada dos dados do catálogo no Item da Proposta. Garante que alteração futura no catálogo não afete proposta antiga.', '#0d9488'),
          card('Tipo de contratação', '1=Objeto específico, 2=Catálogo do produto, 3=Catálogo geral/ecossistema. Define qual código SIAG/Protheus é usado.', '#7c3aed'),
          card('Universal × Individualizado', 'Universal=Sim → entra em catálogo maior. Individualizado=Sim → contratada como objeto específico.', '#0d9488'),
          card('Workflow', 'Modelo configurável de aprovação. Aponta para Cargo/Função, não para pessoa.', '#6d28d9'),
          card('Trâmite', 'Instância de assinatura/aprovação. Status: Pendente, Assinado, Ajuste, Reprovado, Dispensado.', '#6d28d9'),
          card('Divergência', 'Diferença entre proposta enviada e contrato recebido. 8 tipos. Sempre exige tipo + justificativa.', '#dc2626'),
          card('Publicação', 'Extrato no DOE-MT (ou veículo equivalente). OBRIGATÓRIA antes de finalizar contrato.', '#b45309'),
          card('Handover', 'Documento de transferência da DIRC para Pós-vendas. Precede o kick-off.', '#059669'),
        ], 4)}
        <h2 style="font-size:1.15rem;margin:24px 0 8px 0;color:#b45309;">Próximos passos (Fase 2+)</h2>
        ${grid([
          card('Portal do cliente completo', 'Acompanhamento pelo cliente em tempo real, abertura de OS, consulta a faturas.', '#94a3b8'),
          card('OS operacional', 'Ordem de serviço a partir de cada item contratado.', '#94a3b8'),
          card('Faturamento + NF + DAR', 'Geração de cobrança, NF, DAR, integração com Protheus operacional.', '#94a3b8'),
          card('BI / Qlik / ClickSense', 'Painéis analíticos consolidados com dados reais.', '#94a3b8'),
        ], 4)}
      `,
    }),
  }

  const fim = {
    id: 'step-patlas-f1d-fim', type: 'html',
    title: 'Fim da apresentação',
    htmlContent: slide({
      ...M10, n: next(),
      title: 'Fim da apresentação',
      lead: 'Você concluiu o manual completo da Fase 1 do Atlas V2.',
      body: `
        ${callout('Resumo em uma frase',
          'Atlas V2 — Fase 1 = jornada da <b>identificação da demanda</b> ao <b>kick-off agendado</b>, com snapshot de catálogo, assinatura por cargo/função, integrações rastreáveis e publicação obrigatória.',
          '#7c3aed')}
        <div style="display:flex;gap:14px;flex-wrap:wrap;margin:18px 0;">
          ${tag('31 classes', '#1e40af')}
          ${tag('6 workspaces', '#0d9488')}
          ${tag('22 etapas operacionais', '#7c3aed')}
          ${tag('45 slides didáticos', '#6d28d9')}
          ${tag('155 presets reais', '#b45309')}
          ${tag('Validação cruzada 0 erros', '#059669')}
        </div>
        <h2 style="font-size:1.15rem;margin:24px 0 8px 0;color:#0d9488;">Onde voltar quando tiver dúvida</h2>
        <ul style="line-height:1.7;color:#334155;">
          <li><b>Flow operacional</b> ("Fase 1 — Da demanda ao kick-off"): roteiro de uso real, com navegação por métodos.</li>
          <li><b>Flow detalhado</b> (este): vocabulário, regras, diagramas, RACI, state machines.</li>
          <li><b>Visão Operacional</b>: indicadores e gargalos em tempo real.</li>
          <li><b>ARQUITETURA-ESPECIFICADOR-SYDLE.md</b>: como o protótipo funciona internamente.</li>
        </ul>
      `,
    }),
  }

  // ============================================================================
  // MONTA ARRAY FINAL DE STEPS (45)
  // ============================================================================

  const steps = [
    // Módulo 0 (4)
    capa, oQueE, personas, mapa,
    // Módulo 1 (3)
    arquitetura, modeloDados, bpmnGeral,
    // Módulo 2 (5)
    wsAdm, orgStep, pesStep, usrStep, estCgfStep,
    // Módulo 3 (5)
    wsCat, pvStep, licStep, srvStep, uniCpp,
    // Módulo 4 (4)
    capt, demStep, bpmnDirc, tipos,
    // Módulo 5 (3)
    snapExplain, prpStep, priStep,
    // Módulo 6 (5)
    docExplain, dgdStep, bpmnWf, raci, traStep,
    // Módulo 7 (5)
    envStep, extStep, ctrExplain, ctrStep, ctiStep,
    // Módulo 8 (5)
    bpmnOps, integSm, igeStep, recStep, pubStep,
    // Módulo 9 (3)
    hovStep, kofStep, vopStep,
    // Módulo 10 (3)
    funil, smPrp, glossario, fim,
  ]

  return {
    id: 'flow-patlas-fase1-manual-completo',
    name: 'Fase 1 — Manual completo passo a passo (detalhado)',
    steps,
  }
}
