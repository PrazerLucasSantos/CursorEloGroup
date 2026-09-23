/**
 * Reescreve o portal HTML com o formulário completo da classe Solicitação de Selo.
 * node scripts/patch-portal-solicitacao-completa.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const frag = JSON.parse(fs.readFileSync(path.join(__dirname, '_sol-form-fragments.json'), 'utf8'))
const outPath = path.join(root, 'public/portal-selo-nao-e-nao.html')

const extraCss = `
    .sol-tabs {
      display: flex; flex-wrap: wrap; gap: 4px;
      border-bottom: 1px solid #e5e7eb;
      margin: 0 0 20px; padding: 0 0 0;
    }
    .sol-tab {
      border: 0; background: transparent;
      padding: 10px 14px; font: inherit; font-size: .9rem;
      color: var(--muted); cursor: pointer;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
    }
    .sol-tab.is-active { color: var(--blue); font-weight: 700; border-bottom-color: var(--blue); }
    .sol-tab:hover { color: var(--text); }
    .sol-panel { display: none; }
    .sol-panel.is-active { display: block; }
    .seg { display: flex; gap: 8px; flex-wrap: wrap; padding: 4px 0 8px; }
    .seg__opt {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 14px; border: 1px solid var(--line); border-radius: 999px;
      cursor: pointer; font-size: .9rem; user-select: none;
    }
    .seg__opt:has(input:checked) {
      border-color: var(--blue); background: var(--blue-soft); color: var(--blue); font-weight: 600;
    }
    .seg__opt input { accent-color: var(--blue); }
    .toggle-row {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; font-size: .95rem; cursor: pointer;
    }
    .toggle-row input { width: 18px; height: 18px; accent-color: var(--blue); }
    .hint { margin: 0 0 10px; font-size: .85rem; color: var(--muted); }
    .cap-table-wrap { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
    .cap-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: .88rem; }
    .cap-table th, .cap-table td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eee; }
    .cap-table input, .cap-table select { width: 100%; border: 0; border-bottom: 1px solid var(--line); padding: 4px 0; font: inherit; background: transparent; }
    .btn--sm { padding: 6px 12px; font-size: .85rem; }
    .field.is-hidden-by-rule { display: none !important; }
    .wizard-note {
      background: var(--blue-soft); border: 1px solid var(--blue-border);
      border-radius: 6px; padding: 10px 14px; margin: 0 0 18px;
      font-size: .88rem; color: #1e3a5f;
    }
    .form-actions-bar {
      position: sticky; bottom: 0; background: #fff;
      border-top: 1px solid #e5e7eb; padding: 12px 0 4px;
      margin-top: 8px; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    }
`

const solicitacaoView = `
    <!-- Formulário completo = classe Solicitação de Selo (${frag.meta.fieldCount} campos) -->
    <main class="page hidden" id="view-solicitacao">
      <div class="wizard-note">
        Formulário alinhado à classe <strong>Solicitação de Selo</strong> (${frag.meta.fieldCount} campos · ${frag.meta.sectionTitles.length} abas).
        Preencha todas as abas antes de protocolar.
      </div>
      <form id="formSolicitacao" novalidate>
        <div class="sol-tabs" role="tablist">${frag.tabs}</div>
        ${frag.panels}
        <div class="form-actions-bar">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn--ghost" data-go="cadastro">← Cadastro</button>
            <button type="button" class="btn btn--outline" id="btnSalvarRascunho">Salvar rascunho</button>
          </div>
          <div class="actions" style="margin:0;padding:0">
            <button type="button" class="btn btn--ghost" data-go="menu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
              Cancelar
            </button>
            <button type="submit" class="btn btn--primary" id="btnProtocolar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Protocolar solicitação
            </button>
          </div>
        </div>
      </form>
    </main>
`

// Read current portal and surgically update
let html = fs.readFileSync(outPath, 'utf8')

// inject CSS before </style>
if (!html.includes('.sol-tabs')) {
  html = html.replace('</style>', `${extraCss}\n  </style>`)
}

// ensure view-solicitacao exists: insert after view-cadastro closing main
if (!html.includes('id="view-solicitacao"')) {
  html = html.replace(
    '    <!-- 3. Lista de solicitações -->',
    `${solicitacaoView}\n\n    <!-- 3. Lista de solicitações -->`,
  )
} else {
  html = html.replace(
    /<!-- Formulário completo[\s\S]*?<main class="page hidden" id="view-solicitacao">[\s\S]*?<\/main>\s*(?=<!-- 3\. Lista)/,
    solicitacaoView + '\n\n    ',
  )
}

// Change cadastro submit button text / keep cancel
html = html.replace(
  /(<form id="formCadastro"[\s\S]*?<button type="submit" class="btn btn--primary">)([\s\S]*?)(<\/button>)/,
  `$1\n            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>\n            Continuar para solicitação\n          $3`,
)

// Remove the incomplete "Solicitação do selo" mini section from cadastro if still there
html = html.replace(
  /\s*<h2 class="section-title">Solicitação do selo<\/h2>[\s\S]*?(?=\s*<div class="actions">)/,
  '\n\n        ',
)

// Update titles map and views + JS — replace script block from const STORAGE_KEY
const metaJson = JSON.stringify(frag.meta)

const newScript = `
  <script>
    const STORAGE_KEY = 'nen-portal-solicitacoes-v1'
    const CLASS_META = ${metaJson}

    const seed = [
      {
        id: 's1',
        protocolo: '2026/SELO-00042',
        data: '02/06/2026',
        criadoEm: '02/06/2026, 13:16',
        atualizadoEm: '08/06/2026, 11:18',
        descricao: 'Casa Noturna Aurora — solicitação inicial',
        status: 'Aguardando ajuste',
        empresa: '12.345.678/0001-90 — Casa Noturna Aurora LTDA — Cuiabá',
        step: 1,
        historico: [
          {
            quem: 'Sistema',
            quando: '8 de jun. de 2026, 11:18',
            fuso: 'GMT-3',
            texto: 'Sua solicitação precisa de ajustes. Prazo para complementação: 15/06/2026 às 12:00.\\n\\nJustificativa: Enviar foto nítida do cartaz A3 no banheiro feminino.\\n\\nClique em Atender para realizar os ajustes necessários.',
            precisaAtender: true
          },
          {
            quem: 'Sistema',
            quando: '2 de jun. de 2026, 13:20',
            fuso: 'GMT-3',
            texto: 'Solicitação protocolada e encaminhada à análise do PROCON.'
          }
        ]
      },
      {
        id: 's2',
        protocolo: '2026/SELO-00038',
        data: '20/05/2026',
        criadoEm: '20/05/2026, 09:40',
        atualizadoEm: '28/05/2026, 16:02',
        descricao: 'Bar Pantanal — solicitação inicial',
        status: 'Em andamento',
        empresa: '98.765.432/0001-10 — Bar e Eventos Pantanal ME — Várzea Grande',
        step: 1,
        historico: [
          {
            quem: 'Sistema',
            quando: '28 de maio de 2026, 16:02',
            fuso: 'GMT-3',
            texto: 'Pedido em análise pelo PROCON. Prazo restante estimado: 12 dias.'
          },
          {
            quem: 'Sistema',
            quando: '20 de maio de 2026, 09:42',
            fuso: 'GMT-3',
            texto: 'Solicitação protocolada com sucesso.'
          }
        ]
      },
      {
        id: 's3',
        protocolo: '2026/SELO-00021',
        data: '10/03/2026',
        criadoEm: '10/03/2026, 11:05',
        atualizadoEm: '02/04/2026, 14:30',
        descricao: 'Casa Noturna Aurora — deferido',
        status: 'Deferido',
        empresa: '12.345.678/0001-90 — Casa Noturna Aurora LTDA — Cuiabá',
        step: 2,
        historico: [
          {
            quem: 'Sistema',
            quando: '2 de abr. de 2026, 14:30',
            fuso: 'GMT-3',
            texto: 'Pedido deferido. Certificado do selo disponível para download (validade 24 meses).'
          },
          {
            quem: 'Sistema',
            quando: '10 de mar. de 2026, 11:08',
            fuso: 'GMT-3',
            texto: 'Solicitação protocolada.'
          }
        ]
      }
    ]

    function loadSolicitacoes() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw)
      } catch (_) {}
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return structuredClone(seed)
    }
    function saveSolicitacoes(list) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    }

    let solicitacoes = loadSolicitacoes()
    let currentId = null
    let stack = ['menu']
    let cadastroDraft = {}
    let capacitados = []

    const views = {
      menu: document.getElementById('view-menu'),
      cadastro: document.getElementById('view-cadastro'),
      solicitacao: document.getElementById('view-solicitacao'),
      lista: document.getElementById('view-lista'),
      detalhe: document.getElementById('view-detalhe'),
    }
    const titles = {
      menu: 'Selo Não é Não',
      cadastro: 'Atualizar cadastro',
      solicitacao: 'Solicitação de Selo',
      lista: 'Solicitações',
      detalhe: 'Visualizar Solicitação',
    }

    function toast(msg) {
      const el = document.getElementById('toast')
      el.textContent = msg
      el.classList.add('show')
      clearTimeout(toast._t)
      toast._t = setTimeout(() => el.classList.remove('show'), 2800)
    }

    function showView(name, { push = true } = {}) {
      Object.entries(views).forEach(([k, el]) => {
        if (!el) return
        el.classList.toggle('hidden', k !== name)
      })
      document.getElementById('topTitle').textContent = titles[name] || 'Selo Não é Não'
      if (push && stack[stack.length - 1] !== name) stack.push(name)
      if (name === 'lista') renderLista()
      if (name === 'detalhe') renderDetalhe()
      if (name === 'solicitacao') {
        applyCamVisibility()
        updatePerc()
        renderCapTable()
      }
    }

    function goBack() {
      if (stack.length > 1) stack.pop()
      showView(stack[stack.length - 1] || 'menu', { push: false })
    }

    function statusClass(status) {
      if (/ajuste/i.test(status)) return 'status-pill--ajuste'
      if (/aguarda/i.test(status)) return 'status-pill--aguarda'
      if (/andamento/i.test(status)) return 'status-pill--andamento'
      if (/deferido/i.test(status)) return 'status-pill--deferido'
      if (/indefer/i.test(status)) return 'status-pill--indeferido'
      return ''
    }

    // Tabs
    document.querySelectorAll('.sol-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = tab.getAttribute('data-tab')
        document.querySelectorAll('.sol-tab').forEach((t) => t.classList.toggle('is-active', t === tab))
        document.querySelectorAll('.sol-panel').forEach((p) => p.classList.toggle('is-active', p.getAttribute('data-panel') === id))
      })
    })

    // Camera visibility rule (classe)
    function applyCamVisibility() {
      const checked = document.querySelector('input[name="nen-sol-tem-cam"]:checked')
      const show = checked && checked.value === 'Sim'
      CLASS_META.camShow.forEach((fid) => {
        const el = document.querySelector('[data-field-id="' + fid + '"]')
        if (!el) return
        el.classList.toggle('is-hidden-by-rule', !show)
        el.querySelectorAll('input,select,textarea').forEach((inp) => {
          if (!show) {
            if (inp.type === 'radio' || inp.type === 'checkbox') inp.checked = false
            else if (inp.type !== 'file') inp.value = ''
            inp.required = false
          }
        })
      })
    }
    document.getElementById('formSolicitacao')?.addEventListener('change', (e) => {
      if (e.target && e.target.name === 'nen-sol-tem-cam') applyCamVisibility()
      if (e.target && (e.target.name === 'nen-sol-qtd-func' || e.target.name === 'nen-sol-qtd-cap')) updatePerc()
    })

    function updatePerc() {
      const f = Number(document.getElementById('nen-sol-qtd-func')?.value || 0)
      const c = Number(document.getElementById('nen-sol-qtd-cap')?.value || 0)
      const perc = f > 0 ? Math.round((c / f) * 1000) / 10 + '%' : '—'
      const inp = document.getElementById('nen-sol-perc')
      if (inp) inp.value = perc
    }

    // Capacitados table
    const VINCULOS = ['Empregatício', 'Prestação de serviço', 'Terceirizado', 'Sócio', 'Outro']
    function renderCapTable() {
      const body = document.getElementById('capBody')
      if (!body) return
      body.innerHTML = capacitados.map((row, i) => \`
        <tr>
          <td><input data-cap="\${i}" data-k="nome" value="\${row.nome || ''}" /></td>
          <td><input data-cap="\${i}" data-k="funcao" value="\${row.funcao || ''}" /></td>
          <td>
            <select data-cap="\${i}" data-k="vinculo">
              \${VINCULOS.map((v) => '<option ' + (row.vinculo === v ? 'selected' : '') + '>' + v + '</option>').join('')}
            </select>
          </td>
          <td><input data-cap="\${i}" data-k="curso" value="\${row.curso || 'Protocolo Não é Não'}" /></td>
          <td><input data-cap="\${i}" data-k="data" type="date" value="\${row.data || ''}" /></td>
          <td><button type="button" class="btn btn--ghost btn--sm" data-del-cap="\${i}">✕</button></td>
        </tr>
      \`).join('')
    }
    document.getElementById('btnAddCap')?.addEventListener('click', () => {
      capacitados.push({ nome: '', funcao: '', vinculo: 'Empregatício', curso: 'Protocolo Não é Não', data: '' })
      renderCapTable()
    })
    document.getElementById('capBody')?.addEventListener('input', (e) => {
      const t = e.target
      if (!t.dataset.cap) return
      const i = Number(t.dataset.cap)
      capacitados[i][t.dataset.k] = t.value
    })
    document.getElementById('capBody')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-del-cap]')
      if (!btn) return
      capacitados.splice(Number(btn.getAttribute('data-del-cap')), 1)
      renderCapTable()
    })

    function fillSolicitacaoDefaults() {
      const set = (id, val) => {
        const el = document.getElementById(id)
        if (el && 'value' in el) el.value = val
      }
      const setRadio = (name, val) => {
        const el = document.querySelector('input[name="' + name + '"][value="' + val + '"]')
        if (el) el.checked = true
      }
      set('nen-sol-cnpj', cadastroDraft.cnpj || '12.345.678/0001-90')
      set('nen-sol-razao', 'Casa Noturna Aurora LTDA')
      set('nen-sol-fantasia', 'Aurora Night')
      set('nen-sol-end', [cadastroDraft.logradouro, cadastroDraft.numero, cadastroDraft.bairro].filter(Boolean).join(', ') || 'Av. das Flores, 120, Centro')
      set('nen-sol-mun', cadastroDraft.cidade || 'Cuiabá')
      set('nen-sol-cnae', '56.30-2-01 — Bares e outros estabelecimentos especializados')
      set('nen-sol-resp', cadastroDraft.nome || document.getElementById('nomeReadonly')?.textContent || 'Lucas Santos')
      set('nen-sol-contato', (cadastroDraft.email || '') + ' / ' + (cadastroDraft.telefone || ''))
      set('nen-sol-qtd-func', '12')
      set('nen-sol-qtd-cap', '10')
      set('nen-sol-codigo', 'Sinal vermelho / código gestual')
      set('nen-sol-como-info', 'Cartaz A3 no banheiro + briefing da equipe')
      ;['nen-sol-boate','nen-sol-show','nen-sol-alcool','nen-sol-banheiro','nen-sol-acionar','nen-sol-190','nen-sol-180','nen-sol-a3','nen-sol-tem-cam'].forEach((n) => setRadio(n, 'Sim'))
      setRadio('nen-sol-esporte', 'Não')
      setRadio('nen-sol-sancao', 'Não')
      for (let i = 1; i <= 11; i++) setRadio('nen-sol-p' + i, 'Sim')
      const dec1 = document.getElementById('nen-sol-dec-impl')
      const dec2 = document.getElementById('nen-sol-dec-ver')
      if (dec1) dec1.checked = true
      if (dec2) dec2.checked = true
      if (capacitados.length === 0) {
        capacitados = [
          { nome: 'Ana Paula Ribeiro', funcao: 'Gerente', vinculo: 'Empregatício', curso: 'Protocolo Não é Não', data: '2026-02-10' },
          { nome: 'Bruno Mendes', funcao: 'Segurança', vinculo: 'Prestação de serviço', curso: 'Protocolo Não é Não', data: '2026-02-12' },
        ]
      }
      updatePerc()
      applyCamVisibility()
      // show cam follow-ups after Sim
      applyCamVisibility()
      setRadio('nen-sol-cam-30', 'Sim')
      setRadio('nen-sol-cam-acesso', 'Sim')
      renderCapTable()
    }

    function collectSolicitacaoForm() {
      const form = document.getElementById('formSolicitacao')
      const data = {}
      CLASS_META.fieldIds.forEach((id) => {
        if (id === 'nen-sol-capacitados') {
          data[id] = capacitados.slice()
          return
        }
        const radios = form.querySelectorAll('input[name="' + id + '"]')
        if (radios.length && radios[0].type === 'radio') {
          const checked = form.querySelector('input[name="' + id + '"]:checked')
          data[id] = checked ? checked.value : ''
          return
        }
        const el = form.querySelector('[name="' + id + '"]')
        if (!el) return
        if (el.type === 'checkbox') data[id] = el.checked ? 'Sim' : 'Não'
        else if (el.type === 'file') data[id] = el.files && el.files.length ? Array.from(el.files).map((f) => f.name).join(', ') : ''
        else data[id] = el.value
      })
      return data
    }

    function validateSolicitacao() {
      const missing = []
      // required radios Sim/Não
      document.querySelectorAll('#formSolicitacao [data-field-id]').forEach((wrap) => {
        if (wrap.classList.contains('is-hidden-by-rule')) return
        const radios = wrap.querySelectorAll('input[type="radio"][required], input[type="radio"]')
        if (radios.length) {
          const name = radios[0].name
          const need = [...radios].some((r) => r.required) || wrap.querySelector('.req')
          if (need && !wrap.querySelector('input[name="' + name + '"]:checked')) {
            missing.push(wrap.querySelector('label')?.textContent?.replace('*', '').trim() || name)
          }
        }
        wrap.querySelectorAll('input[required], select[required], textarea[required]').forEach((inp) => {
          if (inp.type === 'radio' || inp.type === 'checkbox') return
          if (inp.type === 'file') {
            if (!inp.files || !inp.files.length) missing.push(inp.labels?.[0]?.textContent || inp.name)
            return
          }
          if (!String(inp.value || '').trim()) missing.push(inp.labels?.[0]?.textContent || inp.name)
        })
        wrap.querySelectorAll('input[type="checkbox"][required]').forEach((inp) => {
          if (!inp.checked) missing.push(inp.closest('label')?.textContent || inp.name)
        })
      })
      if (capacitados.length < 2) missing.push('Capacitados (mínimo 2)')
      capacitados.forEach((c, i) => {
        if (!c.nome || !c.funcao) missing.push('Capacitado #' + (i + 1) + ' incompleto')
      })
      return [...new Set(missing.map((m) => String(m).replace(/\\*/g, '').trim()))]
    }

    function renderLista() {
      const q = (document.getElementById('fProtocolo').value || '').trim().toLowerCase()
      const d = (document.getElementById('fData').value || '').trim()
      const st = document.getElementById('fStatus').value
      const rows = solicitacoes.filter((s) => {
        if (q && !s.protocolo.toLowerCase().includes(q) && !s.descricao.toLowerCase().includes(q)) return false
        if (d && !s.data.includes(d)) return false
        if (st && s.status !== st) return false
        return true
      })
      document.getElementById('listaBody').innerHTML = rows.map((s) => \`
        <tr class="row-click" data-id="\${s.id}">
          <td>\${s.protocolo}</td>
          <td>\${s.data}</td>
          <td>\${s.descricao}</td>
          <td><span class="status-pill \${statusClass(s.status)}">\${s.status}</span></td>
          <td class="chev-cell">›</td>
        </tr>
      \`).join('') || '<tr><td colspan="5" style="color:#6b7280;padding:24px 8px">Nenhuma solicitação encontrada.</td></tr>'
    }

    function renderStepper(step) {
      const steps = [
        { label: 'Novo' },
        { label: 'Em andamento' },
        { label: 'Encerrado' },
      ]
      return steps.map((s, i) => {
        let cls = 'step--todo'
        if (i < step) cls = 'step--done'
        else if (i === step) cls = 'step--current'
        const dot = cls === 'step--done' ? '✓' : i === 1 ? '···' : '⌛'
        const line = i < steps.length - 1 ? '<div class="step__line ' + (i < step ? 'step__line--done' : '') + '"></div>' : ''
        return '<div class="step ' + cls + '"><div class="step__dot">' + dot + '</div><span>' + s.label + '</span></div>' + line
      }).join('')
    }

    function renderDetalhe() {
      const s = solicitacoes.find((x) => x.id === currentId)
      if (!s) return
      document.getElementById('crumbProtocolo').textContent = 'Selo Não é Não — ' + s.protocolo
      document.getElementById('detailTitle').textContent = 'Selo Não é Não — ' + s.protocolo
      document.getElementById('stepper').innerHTML = renderStepper(s.step)
      document.getElementById('summaryBox').innerHTML = \`
        <div><dt>Data da criação</dt><dd>\${s.criadoEm}</dd></div>
        <div><dt>Data da última atualização</dt><dd>\${s.atualizadoEm}</dd></div>
        <div><dt>Status</dt><dd>\${s.status}</dd></div>
        <div><dt>Protocolo</dt><dd>\${s.protocolo}</dd></div>
      \`
      let formBlock = ''
      if (s.form) {
        const entries = Object.entries(s.form).filter(([k]) => k !== 'nen-sol-capacitados')
        formBlock = '<div class="hist-card"><div class="hist-avatar">F</div><div><div class="hist-meta"><strong>Dados da solicitação</strong></div><div class="hist-body">' +
          entries.map(([k, v]) => '<p><strong>' + k.replace(/^nen-sol-/, '') + ':</strong> ' + (typeof v === 'object' ? JSON.stringify(v) : (v || '—')) + '</p>').join('') +
          (Array.isArray(s.form['nen-sol-capacitados'])
            ? '<p><strong>capacitados:</strong> ' + s.form['nen-sol-capacitados'].map((c) => c.nome).join(', ') + '</p>'
            : '') +
          '</div></div></div>'
      }
      document.getElementById('historico').innerHTML = formBlock + s.historico.map((h, idx) => \`
        <article class="hist-card">
          <div class="hist-avatar" aria-hidden>S</div>
          <div>
            <div class="hist-meta"><strong>\${h.quem}</strong> \${h.quando} · Fuso: \${h.fuso}</div>
            <div class="hist-body">\${h.texto.split('\\\\n').map((p) => '<p>' + (p || '&nbsp;') + '</p>').join('')}</div>
            \${h.precisaAtender ? '<div class="hist-actions"><button type="button" class="btn btn--primary" data-atender="' + idx + '">Atender</button></div>' : ''}
          </div>
        </article>
      \`).join('')
    }

    function nextProtocolo() {
      const n = 100 + solicitacoes.length
      return '2026/SELO-00' + n
    }
    function todayParts() {
      const now = new Date()
      const dd = String(now.getDate()).padStart(2, '0')
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const yyyy = now.getFullYear()
      const hh = String(now.getHours()).padStart(2, '0')
      const mi = String(now.getMinutes()).padStart(2, '0')
      const meses = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']
      return {
        data: dd + '/' + mm + '/' + yyyy,
        criadoEm: dd + '/' + mm + '/' + yyyy + ', ' + hh + ':' + mi,
        histQuando: now.getDate() + ' de ' + meses[now.getMonth()] + ' de ' + yyyy + ', ' + hh + ':' + mi,
      }
    }

    document.querySelectorAll('[data-go]').forEach((btn) => {
      btn.addEventListener('click', () => showView(btn.getAttribute('data-go')))
    })
    document.getElementById('btnBack').addEventListener('click', goBack)
    document.getElementById('btnSair').addEventListener('click', () => {
      toast('Sessão encerrada (protótipo).')
      stack = ['menu']
      showView('menu', { push: false })
    })

    document.getElementById('empresa')?.addEventListener('change', (e) => {
      const v = e.target.value
      const cnpj = (v.match(/\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}/) || [''])[0]
      document.getElementById('cnpj').value = cnpj
    })

    // Cadastro → Solicitação completa
    document.getElementById('formCadastro').addEventListener('submit', (e) => {
      e.preventDefault()
      const fd = new FormData(e.target)
      cadastroDraft = Object.fromEntries(fd.entries())
      cadastroDraft.nome = document.getElementById('nomeReadonly')?.textContent || ''
      cadastroDraft.cpf = document.getElementById('cpfReadonly')?.textContent || ''
      fillSolicitacaoDefaults()
      showView('solicitacao')
      toast('Cadastro confirmado. Complete a Solicitação de Selo (' + CLASS_META.fieldCount + ' campos).')
    })

    document.getElementById('btnSalvarRascunho')?.addEventListener('click', () => {
      const form = collectSolicitacaoForm()
      form['nen-sol-status'] = 'RASCUNHO'
      localStorage.setItem(STORAGE_KEY + '-rascunho', JSON.stringify({ cadastroDraft, form, capacitados }))
      toast('Rascunho salvo neste navegador.')
    })

    document.getElementById('formSolicitacao').addEventListener('submit', (e) => {
      e.preventDefault()
      applyCamVisibility()
      const missing = validateSolicitacao()
      if (missing.length) {
        toast('Campos pendentes: ' + missing.slice(0, 3).join('; ') + (missing.length > 3 ? '…' : ''))
        return
      }
      const form = collectSolicitacaoForm()
      const t = todayParts()
      const prot = nextProtocolo()
      form['nen-sol-protocolo'] = prot
      form['nen-sol-status'] = 'PROTOCOLADO'
      const fantasia = form['nen-sol-fantasia'] || 'Estabelecimento'
      const item = {
        id: 's' + Date.now(),
        protocolo: prot,
        data: t.data,
        criadoEm: t.criadoEm,
        atualizadoEm: t.criadoEm,
        descricao: fantasia + ' — solicitação inicial',
        status: 'Aguardando',
        empresa: form['nen-sol-cnpj'] + ' — ' + form['nen-sol-razao'],
        step: 0,
        form,
        cadastro: cadastroDraft,
        historico: [
          {
            quem: 'Sistema',
            quando: t.histQuando,
            fuso: 'GMT-3',
            texto: 'Solicitação protocolada com sucesso (' + CLASS_META.fieldCount + ' campos da classe). Encaminhada à análise do PROCON.'
          }
        ],
      }
      solicitacoes = [item, ...solicitacoes]
      saveSolicitacoes(solicitacoes)
      toast('Protocolado: ' + prot)
      stack = ['menu']
      showView('lista')
    })

    ;['fProtocolo', 'fData', 'fStatus'].forEach((id) => {
      const el = document.getElementById(id)
      el?.addEventListener('input', renderLista)
      el?.addEventListener('change', renderLista)
    })

    document.getElementById('listaBody').addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-id]')
      if (!tr) return
      currentId = tr.getAttribute('data-id')
      showView('detalhe')
    })

    document.getElementById('historico').addEventListener('click', (e) => {
      if (!e.target.closest('[data-atender]')) return
      document.getElementById('modalAjuste').classList.remove('hidden')
      document.getElementById('ajusteResp').value = ''
      document.getElementById('ajusteAnexo').value = ''
    })
    document.getElementById('btnFechaAjuste').addEventListener('click', () => {
      document.getElementById('modalAjuste').classList.add('hidden')
    })
    document.getElementById('modalAjuste').addEventListener('click', (e) => {
      if (e.target.id === 'modalAjuste') document.getElementById('modalAjuste').classList.add('hidden')
    })
    document.getElementById('btnEnviaAjuste').addEventListener('click', () => {
      const resp = document.getElementById('ajusteResp').value.trim()
      if (!resp) { toast('Informe a resposta / esclarecimento.'); return }
      const s = solicitacoes.find((x) => x.id === currentId)
      if (!s) return
      const t = todayParts()
      s.status = 'Em andamento'
      s.step = 1
      s.atualizadoEm = t.criadoEm
      s.historico = s.historico.map((h) => ({ ...h, precisaAtender: false }))
      s.historico.unshift({
        quem: 'Sistema',
        quando: t.histQuando,
        fuso: 'GMT-3',
        texto: 'Complementação recebida. Pedido retomado para análise do PROCON.\\n\\nResposta do solicitante: ' + resp,
      })
      saveSolicitacoes(solicitacoes)
      document.getElementById('modalAjuste').classList.add('hidden')
      toast('Complementação enviada.')
      renderDetalhe()
    })
    document.getElementById('btnResumo').addEventListener('click', () => {
      const s = solicitacoes.find((x) => x.id === currentId)
      if (!s) return
      toast(s.protocolo + ' · campos classe: ' + (s.form ? Object.keys(s.form).length : '—'))
    })

    // Verify all class fields exist in DOM
    const missingDom = CLASS_META.fieldIds.filter((id) => {
      if (id === 'nen-sol-capacitados') return !document.getElementById('capTable')
      return !document.querySelector('[data-field-id="' + id + '"], [name="' + id + '"], #' + id)
    })
    if (missingDom.length) console.warn('Campos da classe ausentes no DOM:', missingDom)
    else console.info('Portal OK: ' + CLASS_META.fieldCount + ' campos da classe Solicitação de Selo.')

    showView('menu', { push: false })
    stack = ['menu']
  </script>
`

// Replace existing script
html = html.replace(/<script>[\s\S]*<\/script>\s*<\/body>/, newScript + '\n</body>')

fs.writeFileSync(outPath, html)
console.log('Wrote', outPath)

// verify field count in output
const count = (html.match(/data-field-id="/g) || []).length
console.log('data-field-id count', count, 'expected', frag.meta.fieldCount)
const missing = frag.meta.fieldIds.filter((id) => !html.includes('data-field-id="' + id + '"') && id !== 'nen-sol-protocolo')
// protocol/status use data-field-id too
const missing2 = frag.meta.fieldIds.filter((id) => !html.includes(id))
console.log('ids missing from html', missing2)
