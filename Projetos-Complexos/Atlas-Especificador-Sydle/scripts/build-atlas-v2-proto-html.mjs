/**
 * Gera HTML protótipo navegável Atlas V2 (edição + visualização).
 * Depende de exports/atlas-v2-proto-data.json (rode build-atlas-v2-proto.mjs antes).
 */
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const data = readFileSync(join(root, 'exports/atlas-v2-proto-data.json'), 'utf8')

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Atlas V2 — Protótipo navegável</title>
<style>
:root{
  --ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--bg:#f1f5f9;--card:#fff;
  --brand:#0c4a6e;--brand2:#0369a1;--ok:#166534;--ok-bg:#dcfce7;
  --warn:#b45309;--warn-bg:#fef3c7;--edit:#7c3aed;--view:#0f766e;
  --shadow:0 8px 28px rgba(15,23,42,.08);--radius:12px;
  --font:"Segoe UI",system-ui,sans-serif;
}
*{box-sizing:border-box}
html,body{height:100%;margin:0}
body{font-family:var(--font);color:var(--ink);background:var(--bg);display:flex;flex-direction:column}
button,input,select,textarea{font:inherit}
a{color:var(--brand2)}

.app{display:grid;grid-template-columns:300px 1fr;min-height:100vh}
@media(max-width:980px){.app{grid-template-columns:1fr}.sidebar{position:relative;height:auto;max-height:42vh}}

.sidebar{
  background:linear-gradient(180deg,#0c4a6e 0%,#0f2744 100%);color:#fff;
  padding:18px 14px 28px;overflow:auto;position:sticky;top:0;height:100vh;
}
.brand{font-size:1.05rem;font-weight:700;margin:0 0 2px}
.brand-sub{font-size:.75rem;opacity:.75;margin:0 0 14px}
.search{
  width:100%;border:0;border-radius:8px;padding:9px 11px;margin-bottom:12px;
  background:rgba(255,255,255,.12);color:#fff;outline:none;
}
.search::placeholder{color:rgba(255,255,255,.55)}
.pkg{margin-bottom:14px}
.pkg-title{
  font-size:.68rem;text-transform:uppercase;letter-spacing:.06em;opacity:.7;
  margin:0 0 6px;padding:0 6px;
}
.nav-item{
  display:block;width:100%;text-align:left;border:0;background:transparent;color:#e2e8f0;
  padding:8px 10px;border-radius:8px;cursor:pointer;font-size:.84rem;margin-bottom:2px;
}
.nav-item:hover{background:rgba(255,255,255,.1)}
.nav-item.active{background:#fff;color:var(--brand);font-weight:600}
.nav-item .meta{display:block;font-size:.7rem;opacity:.7;margin-top:2px;font-weight:500}
.nav-item.active .meta{opacity:.65;color:var(--brand)}
.hidden{display:none!important}

.main{padding:20px 24px 64px;max-width:1180px}
.topbar{
  display:flex;flex-wrap:wrap;gap:10px;align-items:center;
  background:var(--card);border:1px solid var(--line);border-radius:var(--radius);
  padding:12px 14px;margin-bottom:16px;box-shadow:var(--shadow);
}
.mode-switch{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden}
.mode-switch button{
  border:0;background:#fff;padding:8px 14px;cursor:pointer;font-weight:600;font-size:.82rem;color:var(--muted);
}
.mode-switch button.on-edit{background:var(--edit);color:#fff}
.mode-switch button.on-view{background:var(--view);color:#fff}
.chip{
  display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 10px;
  font-size:.75rem;font-weight:600;background:#e0f2fe;color:var(--brand);
}
.chip.view{background:#ccfbf1;color:var(--view)}
.chip.edit{background:#ede9fe;color:var(--edit)}
select.preset,select.section-jump{
  border:1px solid var(--line);border-radius:8px;padding:7px 10px;background:#fff;min-width:180px;
}
.spacer{flex:1}
.btn{
  border:1px solid var(--line);background:#fff;border-radius:8px;padding:8px 12px;
  cursor:pointer;font-weight:600;font-size:.82rem;
}
.btn:hover{background:#f8fafc}
.btn.primary{background:var(--brand);border-color:var(--brand);color:#fff}
.btn.primary:hover{background:#083552}
.btn.ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.25)}

.hero{
  background:var(--card);border:1px solid var(--line);border-radius:16px;
  padding:20px 22px;margin-bottom:16px;box-shadow:var(--shadow);
}
.hero h1{margin:0 0 6px;font-size:1.45rem}
.hero p{margin:0;color:var(--muted);font-size:.92rem}
.hero .path{margin-top:8px;font-size:.78rem;color:var(--muted)}

.methods{
  display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;
}
.methods .btn.destaque{background:var(--brand2);border-color:var(--brand2);color:#fff}
.methods .btn.comum{background:#fff}

.canvas{
  background:var(--card);border:1px solid var(--line);border-radius:16px;
  box-shadow:var(--shadow);overflow:hidden;
}
.tabs{
  display:flex;flex-wrap:wrap;gap:4px;padding:10px 12px;border-bottom:1px solid var(--line);
  background:#f8fafc;
}
.tab{
  border:0;background:transparent;padding:8px 12px;border-radius:8px;cursor:pointer;
  font-size:.82rem;font-weight:600;color:var(--muted);
}
.tab.active{background:#fff;color:var(--brand);box-shadow:0 1px 3px rgba(0,0,0,.08)}
.panel{padding:18px 20px 24px}
.section-block{margin-bottom:22px}
.section-block h3{
  margin:0 0 12px;font-size:.95rem;color:var(--brand);
  display:flex;align-items:center;gap:8px;
}
.section-block h3 .ico{
  width:28px;height:28px;border-radius:8px;background:#e0f2fe;display:inline-flex;
  align-items:center;justify-content:center;font-size:.75rem;font-weight:700;
}
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:12px}
.field{display:flex;flex-direction:column;gap:5px}
.field.s-small{grid-column:span 3}
.field.s-medium{grid-column:span 4}
.field.s-large{grid-column:span 6}
.field.s-full,.field.s-xlarge{grid-column:span 12}
@media(max-width:820px){.field.s-small,.field.s-medium,.field.s-large{grid-column:span 12}}
.label{
  font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);
  display:flex;align-items:center;gap:6px;
}
.req{color:#b91c1c}
.ro-tag{font-size:.65rem;background:#f1f5f9;color:var(--muted);padding:1px 6px;border-radius:999px;text-transform:none;letter-spacing:0;font-weight:600}
.ctrl{
  border:1px solid var(--line);border-radius:8px;padding:9px 11px;background:#fff;width:100%;
  min-height:38px;
}
.ctrl:focus{outline:2px solid #bae6fd;border-color:var(--brand2)}
.ctrl:disabled,.ctrl[readonly]{background:#f8fafc;color:#334155}
textarea.ctrl{min-height:88px;resize:vertical}
.mode-view .ctrl{border-color:transparent;background:#f8fafc;pointer-events:none}
.mode-view .ctrl:disabled,.mode-view .ctrl[readonly]{background:#f1f5f9}
.check{display:flex;align-items:center;gap:8px;min-height:38px}
.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:10px}
table.embed{width:100%;border-collapse:collapse;font-size:.82rem}
table.embed th,table.embed td{border-bottom:1px solid var(--line);padding:8px 10px;text-align:left}
table.embed th{background:#f8fafc;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.empty{color:var(--muted);font-size:.85rem;padding:12px;background:#f8fafc;border-radius:8px;border:1px dashed var(--line)}
.toast{
  position:fixed;right:18px;bottom:18px;background:#0f172a;color:#fff;
  padding:12px 16px;border-radius:10px;font-size:.85rem;box-shadow:var(--shadow);
  opacity:0;transform:translateY(8px);transition:.2s;z-index:50;max-width:320px;
}
.toast.show{opacity:1;transform:none}
.welcome{
  background:var(--card);border:1px solid var(--line);border-radius:16px;padding:28px;
  box-shadow:var(--shadow);
}
.welcome h2{margin:0 0 8px}
.welcome p{margin:0 0 14px;color:var(--muted)}
.pkg-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.pkg-card{
  border:1px solid var(--line);border-radius:12px;padding:14px;cursor:pointer;background:#fff;
}
.pkg-card:hover{border-color:#93c5fd;box-shadow:var(--shadow)}
.pkg-card strong{display:block;margin-bottom:4px}
.pkg-card span{font-size:.8rem;color:var(--muted)}
.accordion .section-block{
  border:1px solid var(--line);border-radius:12px;padding:0;overflow:hidden;margin-bottom:10px;
}
.accordion .section-block h3{
  margin:0;padding:12px 14px;background:#f8fafc;cursor:pointer;user-select:none;
}
.accordion .section-body{padding:14px;display:none}
.accordion .section-block.open .section-body{display:block}
.footer-note{margin-top:18px;font-size:.78rem;color:var(--muted)}
</style>
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <p class="brand">Atlas V2 · Protótipo</p>
    <p class="brand-sub">Todas as classes do mapa · edição / visualização</p>
    <input class="search" id="search" placeholder="Buscar classe…" />
    <div id="nav"></div>
  </aside>
  <main class="main" id="main">
    <div class="welcome" id="welcome">
      <h2>Protótipo navegável — Atlas V2</h2>
      <p>Selecione uma classe na lateral. Alterne entre <strong>modo edição</strong> e <strong>modo visualização</strong>. Use os exemplos (presets) quando existirem.</p>
      <div class="pkg-cards" id="pkgCards"></div>
      <p class="footer-note" id="stats"></p>
    </div>
    <div id="workspace" class="hidden"></div>
  </main>
</div>
<div class="toast" id="toast"></div>
<script>
window.ATLAS_V2_PROTO = ${data};
</script>
<script>
(function () {
  const DATA = window.ATLAS_V2_PROTO;
  const state = {
    mode: 'edit', // edit | view
    packageId: null,
    classId: null,
    formId: null,
    tabId: null,
    values: {},
    embedded: {},
  };

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function formOf(id) { return DATA.forms[id]; }

  function classMeta(pkgId, classId) {
    const pkg = DATA.packages.find((p) => p.id === pkgId);
    const cls = pkg?.classes.find((c) => c.id === classId);
    return { pkg, cls, form: cls ? formOf(cls.formId) : null };
  }

  function sizeClass(size) {
    if (size === 'small') return 's-small';
    if (size === 'large') return 's-large';
    if (size === 'xlarge' || size === 'full') return 's-full';
    return 's-medium';
  }

  function visibleFields(form) {
    return (form.fields || []).filter((f) => !f.hidden);
  }

  function topSections(form) {
    const secs = form.sections || [];
    const tops = secs.filter((s) => !s.parentSectionId);
    if (tops.length) return tops;
    return [{ id: '__all__', title: 'Dados', icon: 'list' }];
  }

  function fieldsForSection(form, sectionId) {
    const fields = visibleFields(form);
    if (sectionId === '__all__') return fields;
    const childIds = (form.sections || [])
      .filter((s) => s.parentSectionId === sectionId)
      .map((s) => s.id);
    const ids = new Set([sectionId, ...childIds]);
    const inSec = fields.filter((f) => ids.has(f.sectionId));
    if (inSec.length) return inSec;
    // orphan fields without section go to first section
    const tops = topSections(form);
    if (tops[0]?.id === sectionId) {
      return fields.filter((f) => !f.sectionId || !form.sections?.some((s) => s.id === f.sectionId));
    }
    return inSec;
  }

  function applyPreset(form, preset) {
    state.values = { ...(preset.fieldValues || {}) };
    state.embedded = { ...(preset.embeddedRowsByFieldId || {}) };
    // map labels for linked forms when values are display names already
  }

  function ensureDefaults(form) {
    for (const f of form.fields || []) {
      if (state.values[f.id] !== undefined) continue;
      if (f.type === 'boolean') state.values[f.id] = false;
      else if (f.multiple) state.values[f.id] = [];
      else state.values[f.id] = '';
    }
  }

  function renderNav() {
    const q = ($('#search').value || '').trim().toLowerCase();
    const nav = $('#nav');
    nav.innerHTML = DATA.packages.map((pkg) => {
      const classes = pkg.classes.filter((c) => !q || c.name.toLowerCase().includes(q) || pkg.name.toLowerCase().includes(q));
      if (!classes.length) return '';
      return \`<div class="pkg">
        <div class="pkg-title">\${esc(pkg.name)}</div>
        \${classes.map((c) => {
          const form = formOf(c.formId);
          const active = state.classId === c.id ? 'active' : '';
          const n = form ? form.fields.filter((f) => !f.hidden).length : 0;
          return \`<button class="nav-item \${active}" data-pkg="\${esc(pkg.id)}" data-class="\${esc(c.id)}">
            \${esc(c.name)}
            <span class="meta">\${n} campos · \${(form?.methods || []).length} métodos</span>
          </button>\`;
        }).join('')}
      </div>\`;
    }).join('');

    $$('.nav-item', nav).forEach((btn) => {
      btn.addEventListener('click', () => openClass(btn.dataset.pkg, btn.dataset.class));
    });
  }

  function renderWelcome() {
    $('#welcome').classList.toggle('hidden', !!state.classId);
    $('#workspace').classList.toggle('hidden', !state.classId);
    $('#pkgCards').innerHTML = DATA.packages.map((pkg) => \`
      <div class="pkg-card" data-pkg="\${esc(pkg.id)}">
        <strong>\${esc(pkg.name)}</strong>
        <span>\${pkg.classes.length} classes</span>
      </div>\`).join('');
    $$('.pkg-card').forEach((card) => {
      card.addEventListener('click', () => {
        const pkg = DATA.packages.find((p) => p.id === card.dataset.pkg);
        if (pkg?.classes[0]) openClass(pkg.id, pkg.classes[0].id);
      });
    });
    const totalForms = Object.keys(DATA.forms).length;
    const totalClasses = DATA.packages.reduce((n, p) => n + p.classes.length, 0);
    $('#stats').textContent = \`\${DATA.packages.length} pacotes · \${totalClasses} classes no mapa · \${totalForms} formulários carregados · gerado \${new Date(DATA.generatedAt).toLocaleString('pt-BR')}\`;
  }

  function openClass(pkgId, classId) {
    const { pkg, cls, form } = classMeta(pkgId, classId);
    if (!cls || !form) { toast('Formulário não encontrado'); return; }
    state.packageId = pkgId;
    state.classId = classId;
    state.formId = form.id;
    state.tabId = topSections(form)[0]?.id || null;
    state.values = {};
    state.embedded = {};
    const preferred = (cls.presetIds || [])[0];
    const preset = (form.presets || []).find((p) => p.id === preferred) || form.presets?.[0];
    if (preset) applyPreset(form, preset);
    ensureDefaults(form);
    renderNav();
    renderWorkspace();
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[c]);
  }

  function fieldControl(f) {
    const val = state.values[f.id];
    const ro = state.mode === 'view' || f.readOnly;
    const disabled = ro ? 'disabled' : '';
    const readonly = ro && !['boolean', 'textOptions', 'reference'].includes(f.type) ? 'readonly' : '';

    if (f.type === 'boolean') {
      return \`<label class="check"><input type="checkbox" data-fid="\${esc(f.id)}" \${val ? 'checked' : ''} \${disabled}/> <span>\${val ? 'Sim' : 'Não'}</span></label>\`;
    }
    if (f.type === 'textOptions' || (f.type === 'reference' && f.options?.length)) {
      const opts = f.options || [];
      return \`<select class="ctrl" data-fid="\${esc(f.id)}" \${disabled}>
        <option value="">— selecionar —</option>
        \${opts.map((o) => \`<option value="\${esc(o)}" \${String(val) === String(o) ? 'selected' : ''}>\${esc(o)}</option>\`).join('')}
      </select>\`;
    }
    if (f.type === 'reference') {
      return \`<input class="ctrl" data-fid="\${esc(f.id)}" value="\${esc(val)}" placeholder="Referência" \${disabled} \${readonly}/>\`;
    }
    if (f.type === 'embeddedReference') {
      const rows = state.embedded[f.id] || [];
      if (!rows.length) return \`<div class="empty">Sem linhas · \${esc(f.embeddedDisplay || 'tabela')}</div>\`;
      const keys = Object.keys(rows[0] || {}).slice(0, 6);
      return \`<div class="table-wrap"><table class="embed"><thead><tr>\${keys.map((k) => \`<th>\${esc(shortLabel(k))}</th>\`).join('')}</tr></thead>
        <tbody>\${rows.map((r) => \`<tr>\${keys.map((k) => \`<td>\${esc(r[k])}</td>\`).join('')}</tr>\`).join('')}</tbody></table></div>\`;
    }
    if (f.type === 'file') {
      return \`<input class="ctrl" type="text" data-fid="\${esc(f.id)}" value="\${esc(val)}" placeholder="arquivo…" \${disabled} \${readonly}/>\`;
    }
    if (f.type === 'date') {
      return \`<input class="ctrl" type="date" data-fid="\${esc(f.id)}" value="\${esc(val)}" \${disabled} \${readonly}/>\`;
    }
    if (f.type === 'number') {
      return \`<input class="ctrl" type="number" step="any" data-fid="\${esc(f.id)}" value="\${esc(val)}" \${disabled} \${readonly}/>\`;
    }
    if (f.textLong) {
      return \`<textarea class="ctrl" data-fid="\${esc(f.id)}" \${disabled} \${readonly}>\${esc(val)}</textarea>\`;
    }
    return \`<input class="ctrl" type="text" data-fid="\${esc(f.id)}" value="\${esc(val)}" \${disabled} \${readonly}/>\`;
  }

  function shortLabel(id) {
    const parts = String(id).split('-');
    return parts.slice(-2).join(' ');
  }

  function renderField(f) {
    return \`<div class="field \${sizeClass(f.size)}">
      <div class="label">
        \${esc(f.label)}\${f.required ? '<span class="req">*</span>' : ''}
        \${f.readOnly ? '<span class="ro-tag">somente leitura</span>' : ''}
      </div>
      \${fieldControl(f)}
    </div>\`;
  }

  function renderSections(form) {
    const tops = topSections(form);
    const layout = form.sectionLayout || 'tabs';

    if (layout === 'accordion') {
      return \`<div class="panel accordion">\${tops.map((sec, i) => {
        const open = !state.tabId || state.tabId === sec.id || (i === 0 && !state.tabId);
        const fields = fieldsForSection(form, sec.id);
        const children = (form.sections || []).filter((s) => s.parentSectionId === sec.id);
        return \`<div class="section-block \${open ? 'open' : ''}" data-sec="\${esc(sec.id)}">
          <h3 data-acc="\${esc(sec.id)}"><span class="ico">\${esc((sec.icon || 'S').slice(0, 2))}</span>\${esc(sec.title)}</h3>
          <div class="section-body">
            \${children.length ? children.map((ch) => {
              const chFields = fieldsForSection(form, ch.id);
              return \`<div class="section-block"><h3><span class="ico">·</span>\${esc(ch.title)}</h3><div class="grid">\${chFields.map(renderField).join('')}</div></div>\`;
            }).join('') : \`<div class="grid">\${fields.map(renderField).join('')}</div>\`}
          </div>
        </div>\`;
      }).join('')}</div>\`;
    }

    // tabs / none
    const active = state.tabId || tops[0]?.id;
    const fields = fieldsForSection(form, active);
    const children = (form.sections || []).filter((s) => s.parentSectionId === active);
    return \`
      \${tops.length > 1 ? \`<div class="tabs">\${tops.map((s) => \`
        <button class="tab \${s.id === active ? 'active' : ''}" data-tab="\${esc(s.id)}">\${esc(s.title)}</button>
      \`).join('')}</div>\` : ''}
      <div class="panel">
        \${children.length ? children.map((ch) => {
          const chFields = fieldsForSection(form, ch.id);
          return \`<div class="section-block"><h3><span class="ico">·</span>\${esc(ch.title)}</h3><div class="grid">\${chFields.map(renderField).join('') || '<div class="empty">Sem campos nesta subseção</div>'}</div></div>\`;
        }).join('') : \`<div class="grid">\${fields.map(renderField).join('') || '<div class="empty">Sem campos visíveis nesta seção</div>'}</div>\`}
      </div>\`;
  }

  function renderWorkspace() {
    const { pkg, cls, form } = classMeta(state.packageId, state.classId);
    if (!form) return;
    renderWelcome();

    const presets = form.presets || [];
    const methods = form.methods || [];

    $('#workspace').innerHTML = \`
      <div class="topbar">
        <div class="mode-switch">
          <button type="button" id="btnEdit" class="\${state.mode === 'edit' ? 'on-edit' : ''}">Modo edição</button>
          <button type="button" id="btnView" class="\${state.mode === 'view' ? 'on-view' : ''}">Modo visualização</button>
        </div>
        <span class="chip \${state.mode}">\${state.mode === 'edit' ? 'Editando campos' : 'Somente leitura'}</span>
        \${presets.length ? \`<label style="font-size:.78rem;color:var(--muted)">Exemplo
          <select class="preset" id="preset">
            \${presets.map((p) => \`<option value="\${esc(p.id)}">\${esc(p.name)}</option>\`).join('')}
          </select></label>\` : ''}
        <div class="spacer"></div>
        <button class="btn" id="btnClear">Limpar</button>
        <button class="btn primary" id="btnSave">Salvar rascunho</button>
      </div>

      <div class="hero">
        <h1>\${esc(cls.name)}</h1>
        <p>\${esc(form.metadata || form.name)}</p>
        <div class="path">\${esc(pkg.name)} · formulário <code>\${esc(form.id)}</code> · layout \${esc(form.sectionLayout)}</div>
      </div>

      \${methods.length ? \`<div class="methods">\${methods.map((m) => \`
        <button class="btn \${m.kind || 'comum'}" data-method="\${esc(m.id)}">\${esc(m.name)}</button>
      \`).join('')}</div>\` : ''}

      <div class="canvas mode-\${state.mode}" id="canvas">
        \${renderSections(form)}
      </div>
      <p class="footer-note">Protótipo gerado a partir de forms.json + workspaces.json do épico Atlas V2. Campos ocultos/partnerHidden não aparecem.</p>
    \`;

    // restore preset select
    if (presets.length) {
      const sel = $('#preset');
      const current = presets.find((p) => JSON.stringify(p.fieldValues) === JSON.stringify(state.values));
      if (current) sel.value = current.id;
      sel.addEventListener('change', () => {
        const p = presets.find((x) => x.id === sel.value);
        if (!p) return;
        applyPreset(form, p);
        ensureDefaults(form);
        renderWorkspace();
        toast('Exemplo aplicado: ' + p.name);
      });
    }

    $('#btnEdit').addEventListener('click', () => { state.mode = 'edit'; renderWorkspace(); });
    $('#btnView').addEventListener('click', () => { state.mode = 'view'; renderWorkspace(); });
    $('#btnClear').addEventListener('click', () => {
      state.values = {};
      state.embedded = {};
      ensureDefaults(form);
      renderWorkspace();
      toast('Campos limpos');
    });
    $('#btnSave').addEventListener('click', () => {
      try {
        localStorage.setItem('atlas-v2-proto:' + form.id, JSON.stringify({ values: state.values, embedded: state.embedded }));
        toast('Rascunho salvo neste navegador');
      } catch { toast('Não foi possível salvar'); }
    });

    $$('.tab').forEach((tab) => {
      tab.addEventListener('click', () => { state.tabId = tab.dataset.tab; renderWorkspace(); });
    });
    $$('[data-acc]').forEach((h) => {
      h.addEventListener('click', () => {
        state.tabId = h.dataset.acc;
        const block = h.closest('.section-block');
        block.classList.toggle('open');
      });
    });
    $$('[data-method]').forEach((btn) => {
      btn.addEventListener('click', () => toast('Método: ' + btn.textContent.trim()));
    });

    // bind inputs
    $$('[data-fid]').forEach((el) => {
      const fid = el.dataset.fid;
      const sync = () => {
        if (el.type === 'checkbox') {
          state.values[fid] = el.checked;
          const span = el.parentElement.querySelector('span');
          if (span) span.textContent = el.checked ? 'Sim' : 'Não';
        } else {
          state.values[fid] = el.value;
        }
      };
      el.addEventListener('input', sync);
      el.addEventListener('change', sync);
    });

    // try restore draft
    try {
      const raw = localStorage.getItem('atlas-v2-proto:' + form.id);
      // only auto-load if empty preset and draft exists — skip auto to avoid surprise
    } catch {}
  }

  $('#search').addEventListener('input', renderNav);
  renderNav();
  renderWelcome();

  // deep link ?class= / ?form=
  const params = new URLSearchParams(location.search);
  const wantForm = params.get('form');
  const wantClass = params.get('class');
  if (wantForm || wantClass) {
    for (const pkg of DATA.packages) {
      for (const c of pkg.classes) {
        if ((wantForm && c.formId === wantForm) || (wantClass && (c.id === wantClass || c.name === wantClass))) {
          openClass(pkg.id, c.id);
          return;
        }
      }
    }
  }
})();
</script>
</body>
</html>
`

writeFileSync(join(root, 'exports/atlas-v2-prototipo.html'), html)
console.log('HTML:', join(root, 'exports/atlas-v2-prototipo.html'))
console.log('Size KB:', Math.round(Buffer.byteLength(html) / 1024))
