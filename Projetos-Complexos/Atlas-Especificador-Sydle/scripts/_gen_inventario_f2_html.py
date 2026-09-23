# -*- coding: utf-8 -*-
"""Gera HTML inventário F2 editável — status, relevância, tipo, ordem, seed salvo."""
from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/atlas-v2/forms.json"
OUT = ROOT / "exports/inventario-campos-classes-fase2-atlas-v2.html"
SEED = ROOT / "exports/inventario-fase2-marcacoes-seed.json"

F2_FORM_IDS = [
    "form-patlasv4-proto-cat-parceria",
    "form-patlasv4-proto-cat-solucao",
    "form-patlasv4-proto-cat-catalogo",
    "form-patlasv4-proto-cat-produto",
    "form-patlasv4-proto-cat-dados-parceria",
    "form-patlasv4-proto-cat-grupo",
    "form-patlasv4-proto-cat-metrica",
    "form-patlasv4-proto-cat-tipo-cobranca",
    "form-patlasv4-proto-cat-modelo-venda",
    "form-patlasv4-proto-cat-categoria",
    "form-patlasv4-proto-cat-catalogo-complexidade",
]

NAME_OVERRIDE = {
    "form-patlasv4-proto-cat-categoria": "Vertical de Serviço de TI",
    "form-patlasv4-proto-cat-catalogo-complexidade": "Complexidade do catálogo (faixa)",
}

STATUS_OPTS = ["—", "ajustar", "correto", "errado", "remover", "falta"]

# Anexo / dropdown Relevância (UI Especificador)
RELEVANCE_OPTS = ["Identidade", "Destaque", "Comum", "Avançada"]
RELEVANCE_FROM_CODE = {
    "identity": "Identidade",
    "highlight": "Destaque",
    "common": "Comum",
    "advanced": "Avançada",
}

# Tipos do seletor (anexos + labels do Especificador)
TYPE_OPTS = [
    "Texto",
    "Identificador",
    "Número",
    "Número longo",
    "Decimal",
    "Booleano",
    "Data",
    "Arquivo",
    "Referência",
    "Ref. Embutida",
    "Opções em texto",
    "Dinâmico",
    "Coordenada geográfica",
    "HTML",
]
TYPE_FROM_CODE = {
    "text": "Texto",
    "number": "Número",
    "decimal": "Decimal",
    "boolean": "Booleano",
    "date": "Data",
    "reference": "Referência",
    "textOptions": "Opções em texto",
    "embeddedReference": "Ref. Embutida",
    "file": "Arquivo",
    "geopoint": "Coordenada geográfica",
    "html": "HTML",
    "alert": "Alerta",
}

LS_KEY = "atlas-f2-inventario-campos-v4"

# Marcações salvas da validação (print Parceria)
SEED_STATUS = {
    "form-patlasv4-proto-cat-parceria-codigo-parceira": "falta",
    "form-patlasv4-proto-cat-parceria-identificador": "correto",
    "form-patlasv4-proto-cat-parceria-sigla": "falta",
    "form-patlasv4-proto-cat-parceria-catalogos": "correto",
    "form-patlasv4-proto-cat-parceria-parceiro": "correto",
    "form-patlasv4-proto-cat-parceria-vertical": "correto",
    "form-patlasv4-proto-cat-parceria-indice-reajuste": "falta",
    "form-patlasv4-proto-cat-parceria-descricao": "correto",
    "form-patlasv4-proto-cat-parceria-status": "correto",
    "form-patlasv4-proto-cat-parceria-ativo": "correto",
    "form-patlasv4-proto-cat-parceria-observacoes": "correto",
    "form-patlasv4-proto-cat-parceria-solucoes-view": "correto",
    "form-patlasv4-proto-cat-parceria-produtos": "correto",
}


def yes_no(v) -> str:
    return "Sim" if v is True else "Não"


def esc(s) -> str:
    return html.escape("" if s is None else str(s))


def section_title(form: dict, section_id: str | None) -> str:
    if not section_id:
        return "—"
    for s in form.get("sections") or []:
        if s.get("id") == section_id:
            parent = s.get("parentSectionId")
            title = s.get("title") or section_id
            if parent:
                parent_title = next(
                    (x.get("title") for x in form["sections"] if x.get("id") == parent),
                    None,
                )
                if parent_title:
                    return f"{parent_title} › {title}"
            return title
    return section_id


def ref_class(forms_by_id: dict, fld: dict) -> str:
    lid = fld.get("linkedFormId")
    if not lid:
        return "—"
    ref = forms_by_id.get(lid)
    if ref:
        return NAME_OVERRIDE.get(lid) or ref.get("name") or lid
    return lid


def options_str(fld: dict) -> str:
    opts = fld.get("options")
    if not opts:
        return "—"
    if isinstance(opts, list):
        return ", ".join(str(o) for o in opts)
    return str(opts)


def default_str(fld: dict) -> str:
    for key in ("defaultValue", "default", "value"):
        if key in fld and fld[key] is not None and fld[key] != "":
            v = fld[key]
            if isinstance(v, bool):
                return "Sim" if v else "Não"
            return str(v)
    return "—"


def collect_examples(form: dict) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}

    def add(fid: str, val) -> None:
        if val is None or val == "":
            return
        if isinstance(val, bool):
            s = "Sim" if val else "Não"
        elif isinstance(val, list):
            s = ", ".join(str(x) for x in val)
        else:
            s = str(val)
        bucket = out.setdefault(fid, [])
        if s not in bucket:
            bucket.append(s)

    for p in form.get("exampleValuePresets") or []:
        for fid, val in (p.get("fieldValues") or {}).items():
            add(fid, val)
        for rows in (p.get("embeddedRowsByFieldId") or {}).values():
            if isinstance(rows, list):
                for row in rows:
                    if isinstance(row, dict):
                        for fid, val in row.items():
                            add(fid, val)
    return out


def example_str(examples: dict[str, list[str]], fid: str) -> str:
    vals = examples.get(fid) or []
    return " · ".join(vals[:3]) if vals else "—"


def select_html(css: str, fid: str, options: list[str], selected: str, attr: str) -> str:
    opts = []
    for o in options:
        sel = " selected" if o == selected else ""
        opts.append(f'<option value="{esc(o)}"{sel}>{esc(o)}</option>')
    return (
        f'<select class="{esc(css)}" data-fid="{esc(fid)}" data-attr="{esc(attr)}" '
        f'aria-label="{esc(attr)}">{"".join(opts)}</select>'
    )


def blank_row(form_id: str, idx: int = 0) -> str:
    fid = f"blank:{form_id}:{idx}"
    cells = [
        '<td class="c drag"><span class="drag-handle" title="Arrastar">⠿</span>'
        f'<button type="button" class="btn-up" data-fid="{esc(fid)}" title="Subir">↑</button>'
        f'<button type="button" class="btn-down" data-fid="{esc(fid)}" title="Descer">↓</button></td>',
        f'<td class="c check"><input type="checkbox" class="row-check" data-fid="{esc(fid)}"/></td>',
        f'<td>{select_html("status-sel", fid, STATUS_OPTS, "falta", "status")}</td>',
    ]
    editable = [
        ("seção", "Seção"),
        ("nome", "Nome do campo"),
    ]
    for key, ph in editable:
        cells.append(
            f'<td contenteditable="true" class="edit-cell" data-fid="{esc(fid)}" '
            f'data-col="{esc(key)}" data-placeholder="{esc(ph)}"></td>'
        )
    cells.append(
        f'<td>{select_html("relev-sel", fid, RELEVANCE_OPTS, "Comum", "relevance")}</td>'
    )
    cells.append(
        f'<td>{select_html("tipo-sel", fid, TYPE_OPTS, "Texto", "type")}</td>'
    )
    for key, ph in [
        ("ref", "Classe referenciada"),
        ("mult", ""),
        ("obr", ""),
        ("ro", ""),
        ("hid", ""),
        ("padrao", ""),
        ("opts", "Opções disponíveis"),
        ("ex", "Exemplo"),
    ]:
        cells.append(
            f'<td contenteditable="true" class="edit-cell" data-fid="{esc(fid)}" '
            f'data-col="{esc(key)}" data-placeholder="{esc(ph)}"></td>'
        )
    return (
        f'<tr class="blank-row status-falta" data-fid="{esc(fid)}" data-blank="1" draggable="true">'
        f'{"".join(cells)}</tr>'
    )


def field_row(form: dict, fld: dict, forms_by_id: dict, examples: dict) -> str:
    fid = fld.get("id") or ""
    status = SEED_STATUS.get(fid, "—")
    relev = RELEVANCE_FROM_CODE.get(fld.get("relevance") or "", "Comum")
    tipo = TYPE_FROM_CODE.get(fld.get("type") or "", fld.get("type") or "Texto")
    if tipo not in TYPE_OPTS:
        TYPE_OPTS.append(tipo)

    status_cls = f" status-{status}" if status not in ("—", "") else ""
    return (
        f'<tr data-fid="{esc(fid)}" draggable="true" class="{status_cls.strip()}">'
        '<td class="c drag"><span class="drag-handle" title="Arrastar">⠿</span>'
        f'<button type="button" class="btn-up" data-fid="{esc(fid)}" title="Subir">↑</button>'
        f'<button type="button" class="btn-down" data-fid="{esc(fid)}" title="Descer">↓</button></td>'
        f'<td class="c check"><input type="checkbox" class="row-check" data-fid="{esc(fid)}"/></td>'
        f'<td>{select_html("status-sel", fid, STATUS_OPTS, status, "status")}</td>'
        f"<td>{esc(section_title(form, fld.get('sectionId')))}</td>"
        f'<td class="nome">{esc(fld.get("label") or "—")}</td>'
        f'<td>{select_html("relev-sel", fid, RELEVANCE_OPTS, relev, "relevance")}</td>'
        f'<td>{select_html("tipo-sel", fid, TYPE_OPTS, tipo, "type")}</td>'
        f"<td>{esc(ref_class(forms_by_id, fld))}</td>"
        f'<td class="c">{esc(yes_no(fld.get("multiple")))}</td>'
        f'<td class="c">{esc(yes_no(fld.get("required")))}</td>'
        f'<td class="c">{esc(yes_no(fld.get("readOnly")))}</td>'
        f'<td class="c">{esc(yes_no(fld.get("hidden")))}</td>'
        f"<td>{esc(default_str(fld))}</td>"
        f'<td class="opts">{esc(options_str(fld))}</td>'
        f'<td class="ex">{esc(example_str(examples, fid))}</td>'
        "</tr>"
    )


def build() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    forms_by_id = {f["id"]: f for f in forms}

    # Persist seed on disk
    seed_payload = {fid: {"status": st} for fid, st in SEED_STATUS.items()}
    SEED.write_text(json.dumps(seed_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    blocks: list[str] = []
    toc: list[str] = []

    for form_id in F2_FORM_IDS:
        form = forms_by_id.get(form_id)
        if not form:
            continue
        name = NAME_OVERRIDE.get(form_id) or form.get("name") or form_id
        examples = collect_examples(form)
        fields = [f for f in (form.get("fields") or []) if f.get("type") != "alert"]
        toc.append(
            f'<li><a href="#{esc(form_id)}">{esc(name)}</a> '
            f'<span class="count">{len(fields)}</span></li>'
        )
        rows = [field_row(form, fld, forms_by_id, examples) for fld in fields]
        methods = form.get("methods") or []
        meth_html = ""
        if methods:
            items = "".join(
                f"<li><strong>{esc(m.get('name'))}</strong>"
                f' <span class="muted">({esc(m.get("kind") or "—")})</span>'
                f" — {esc((m.get('spec') or '')[:180])}</li>"
                for m in methods
            )
            meth_html = f'<div class="methods"><h3>Métodos</h3><ul>{items}</ul></div>'

        blocks.append(
            f"""
<section class="classe" id="{esc(form_id)}" data-form="{esc(form_id)}">
  <header>
    <h2>{esc(name)}</h2>
    <p class="meta"><code>{esc(form_id)}</code> · {len(fields)} campos</p>
  </header>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th class="c">Ordem</th>
          <th class="c">✓</th>
          <th>Status</th>
          <th>Seção</th>
          <th>Nome</th>
          <th>Relevância</th>
          <th>Tipo</th>
          <th>Classe referenciada</th>
          <th>Múltiplo</th>
          <th>Obrigatório</th>
          <th>Somente leitura</th>
          <th>Oculto</th>
          <th>Valor padrão</th>
          <th>Opções disponíveis</th>
          <th>Exemplo</th>
        </tr>
      </thead>
      <tbody>
        {''.join(rows)}
        {blank_row(form_id, 0)}
      </tbody>
    </table>
    <p class="add-row-hint"><button type="button" class="btn-add-row" data-form="{esc(form_id)}">+ Nova linha neste agrupamento</button></p>
  </div>
  {meth_html}
</section>
"""
        )

    seed_js = json.dumps(seed_payload, ensure_ascii=False)
    type_opts_js = json.dumps(TYPE_OPTS, ensure_ascii=False)
    relev_opts_js = json.dumps(RELEVANCE_OPTS, ensure_ascii=False)
    status_opts_js = json.dumps(STATUS_OPTS, ensure_ascii=False)

    doc = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Inventário de campos — Classes Fase 2 · Atlas V2</title>
<style>
  :root {{
    --ink:#1a2332; --muted:#5c6b7a; --line:#d8e0ea; --bg:#f6f8fb; --card:#fff; --accent:#0c4a6e; --head:#0f2744;
  }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; font-family:"Segoe UI",system-ui,sans-serif; color:var(--ink); background:var(--bg); line-height:1.45; }}
  .page {{ max-width:1560px; margin:0 auto; padding:28px 20px 64px; }}
  header.hero {{
    background:linear-gradient(135deg,#0c4a6e,#163a5f 55%,#1e3a5f); color:#fff;
    border-radius:14px; padding:28px 32px; margin-bottom:20px;
  }}
  header.hero h1 {{ margin:0 0 8px; font-size:1.55rem; }}
  header.hero p {{ margin:0; opacity:.9; font-size:.95rem; }}
  .toolbar {{
    display:flex; flex-wrap:wrap; gap:10px; align-items:center;
    background:var(--card); border:1px solid var(--line); border-radius:12px;
    padding:12px 16px; margin-bottom:16px;
  }}
  .toolbar button {{
    border:1px solid var(--line); background:#fff; border-radius:8px;
    padding:7px 12px; cursor:pointer; font-weight:600; font-size:.85rem;
  }}
  .toolbar button:hover {{ background:#eef6fc; }}
  .toolbar .hint {{ color:var(--muted); font-size:.82rem; margin-left:auto; }}
  .anexo {{
    background:#fff8e8; border:1px solid #f0d9a0; border-radius:12px;
    padding:14px 18px; margin-bottom:20px; font-size:.9rem;
  }}
  .anexo h2 {{ margin:0 0 8px; font-size:.95rem; color:#8a5a00; }}
  .anexo ul {{ margin:0; padding-left:1.2rem; columns:2; }}
  .anexo code {{ background:#fff; padding:1px 6px; border-radius:4px; }}
  nav.toc {{
    background:var(--card); border:1px solid var(--line); border-radius:12px;
    padding:16px 20px; margin-bottom:28px;
  }}
  nav.toc h2 {{ margin:0 0 10px; font-size:.95rem; color:var(--accent); text-transform:uppercase; letter-spacing:.04em; }}
  nav.toc ul {{ list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:8px 14px; }}
  nav.toc a {{ color:var(--ink); text-decoration:none; font-weight:600; font-size:.92rem; }}
  nav.toc .count {{
    display:inline-block; background:#e8eef5; color:var(--muted);
    font-size:.75rem; font-weight:600; padding:1px 7px; border-radius:999px; margin-left:4px;
  }}
  section.classe {{
    background:var(--card); border:1px solid var(--line); border-radius:12px;
    padding:18px 18px 8px; margin-bottom:22px; scroll-margin-top:16px;
  }}
  section.classe > header h2 {{ margin:0 0 4px; font-size:1.25rem; color:var(--head); }}
  section.classe .meta {{ margin:0 0 14px; color:var(--muted); font-size:.85rem; }}
  section.classe .meta code {{ background:#eef3f8; padding:1px 6px; border-radius:4px; font-size:.8rem; }}
  .table-wrap {{ overflow-x:auto; margin-bottom:8px; }}
  table {{ width:100%; border-collapse:collapse; font-size:.82rem; min-width:1360px; }}
  th, td {{ border:1px solid var(--line); padding:6px 8px; vertical-align:middle; text-align:left; }}
  th {{ background:#0c4a6e; color:#fff; font-weight:600; white-space:nowrap; position:sticky; top:0; z-index:1; }}
  tbody tr:nth-child(even) {{ background:#f9fbfd; }}
  tbody tr:hover {{ background:#eef6fc; }}
  tbody tr.dragging {{ opacity:.45; }}
  tbody tr.drag-over {{ outline:2px dashed #0c4a6e; }}
  tr.status-ajustar {{ background:#fff8e6 !important; }}
  tr.status-correto {{ background:#eaf7ef !important; }}
  tr.status-errado {{ background:#fdecec !important; }}
  tr.status-remover {{ background:#f3f0f0 !important; opacity:.75; }}
  tr.status-falta {{ background:#e8f0ff !important; }}
  tr.blank-row {{ background:#fafcfa !important; }}
  td.c {{ text-align:center; white-space:nowrap; }}
  td.drag {{ width:72px; }}
  td.nome {{ font-weight:600; }}
  td.opts, td.ex {{ max-width:240px; font-size:.78rem; color:#334; }}
  td.ex {{ color:#1a5f3a; }}
  .drag-handle {{ cursor:grab; color:#6b7c8d; margin-right:4px; user-select:none; }}
  .btn-up, .btn-down {{
    border:1px solid #c5d0dc; background:#fff; border-radius:4px;
    width:22px; height:22px; line-height:1; cursor:pointer; font-size:.7rem; padding:0; margin:0 1px;
  }}
  .btn-up:hover, .btn-down:hover {{ background:#e8f3fb; }}
  select.status-sel, select.relev-sel, select.tipo-sel {{
    width:100%; min-width:110px; border:1px solid #c5d0dc; border-radius:6px;
    padding:4px 6px; font-size:.8rem; background:#fff;
  }}
  td.edit-cell {{ min-width:70px; outline:none; background:#fff; }}
  td.edit-cell:empty:before {{ content:attr(data-placeholder); color:#9aa8b5; font-style:italic; }}
  td.edit-cell:focus {{ box-shadow:inset 0 0 0 2px #9bbad4; background:#f7fbff; }}
  .add-row-hint {{ margin:0 0 10px; }}
  .btn-add-row {{
    border:1px dashed #9bbad4; background:#f7fbff; color:var(--accent);
    border-radius:8px; padding:6px 12px; cursor:pointer; font-weight:600; font-size:.82rem;
  }}
  .methods {{ border-top:1px solid var(--line); padding:10px 4px 14px; font-size:.85rem; }}
  .methods h3 {{ margin:0 0 6px; font-size:.9rem; color:var(--accent); }}
  .muted {{ color:var(--muted); }}
  footer.note {{ margin-top:8px; color:var(--muted); font-size:.8rem; }}
</style>
</head>
<body>
<div class="page">
  <header class="hero">
    <h1>Inventário de campos — Classes Fase 2</h1>
    <p>Épico <strong>Atlas V2</strong> · marcações da validação salvas · ordem / relevância / tipo editáveis</p>
  </header>

  <div class="toolbar">
    <button type="button" id="btn-export">Exportar JSON</button>
    <button type="button" id="btn-reset-seed">Restaurar seed (print Parceria)</button>
    <button type="button" id="btn-clear">Limpar marcações</button>
    <span class="hint" id="save-hint">Seed em disco + localStorage</span>
  </div>

  <aside class="anexo">
    <h2>Anexo — Relevância</h2>
    <ul>
      <li><code>Identidade</code></li>
      <li><code>Destaque</code></li>
      <li><code>Comum</code></li>
      <li><code>Avançada</code></li>
    </ul>
    <h2 style="margin-top:12px">Anexo — Tipo (seletor)</h2>
    <ul>
      {''.join(f'<li><code>{esc(t)}</code></li>' for t in TYPE_OPTS)}
    </ul>
  </aside>

  <nav class="toc">
    <h2>Classes</h2>
    <ul>{''.join(toc)}</ul>
  </nav>

  {''.join(blocks)}

  <footer class="note">
    Ordem (arrastar / ↑↓) · Checkbox · Status · Seção · Nome · Relevância · Tipo · Classe referenciada · Múltiplo · Obrigatório · Somente leitura · Oculto · Valor padrão · Opções · Exemplo.
    Seed salvo em <code>exports/inventario-fase2-marcacoes-seed.json</code>.
  </footer>
</div>
<script>
(function () {{
  const KEY = {json.dumps(LS_KEY)};
  const SEED = {seed_js};
  const STATUS_OPTS = {status_opts_js};
  const RELEV_OPTS = {relev_opts_js};
  const TYPE_OPTS = {type_opts_js};

  function load() {{
    try {{ return JSON.parse(localStorage.getItem(KEY) || "{{}}"); }}
    catch (e) {{ return {{}}; }}
  }}
  function save(state) {{
    localStorage.setItem(KEY, JSON.stringify(state));
    const h = document.getElementById("save-hint");
    if (h) h.textContent = "Salvo · " + new Date().toLocaleTimeString();
  }}
  function upsert(fid, patch) {{
    const s = load();
    s[fid] = Object.assign({{}}, s[fid] || {{}}, patch);
    save(s);
  }}
  function applyRowStyle(tr, status) {{
    tr.classList.remove("status-ajustar","status-correto","status-errado","status-remover","status-falta");
    if (status && status !== "—") tr.classList.add("status-" + status);
  }}
  function ensureSeed() {{
    const s = load();
    if (s.__seedApplied) return s;
    Object.keys(SEED).forEach((fid) => {{
      s[fid] = Object.assign({{}}, SEED[fid], s[fid] || {{}});
    }});
    s.__seedApplied = true;
    save(s);
    return s;
  }}
  function selectHtml(css, fid, opts, selected, attr) {{
    return `<select class="${{css}}" data-fid="${{fid}}" data-attr="${{attr}}">${{opts.map(o =>
      `<option value="${{o}}"${{o===selected?" selected":""}}>${{o}}</option>`).join("")}}</select>`;
  }}
  function makeBlankRow(formId, idx) {{
    const fid = `blank:${{formId}}:${{idx}}`;
    const tr = document.createElement("tr");
    tr.className = "blank-row status-falta";
    tr.setAttribute("data-fid", fid);
    tr.setAttribute("data-blank", "1");
    tr.draggable = true;
    const editCols = [
      ["seção","Seção"],["nome","Nome do campo"],["ref","Classe referenciada"],
      ["mult",""],["obr",""],["ro",""],["hid",""],["padrao",""],["opts","Opções disponíveis"],["ex","Exemplo"]
    ];
    let html =
      `<td class="c drag"><span class="drag-handle">⠿</span>` +
      `<button type="button" class="btn-up" data-fid="${{fid}}">↑</button>` +
      `<button type="button" class="btn-down" data-fid="${{fid}}">↓</button></td>` +
      `<td class="c check"><input type="checkbox" class="row-check" data-fid="${{fid}}"/></td>` +
      `<td>${{selectHtml("status-sel", fid, STATUS_OPTS, "falta", "status")}}</td>` +
      `<td contenteditable="true" class="edit-cell" data-fid="${{fid}}" data-col="seção" data-placeholder="Seção"></td>` +
      `<td contenteditable="true" class="edit-cell" data-fid="${{fid}}" data-col="nome" data-placeholder="Nome do campo"></td>` +
      `<td>${{selectHtml("relev-sel", fid, RELEV_OPTS, "Comum", "relevance")}}</td>` +
      `<td>${{selectHtml("tipo-sel", fid, TYPE_OPTS, "Texto", "type")}}</td>`;
    for (const [key, ph] of editCols.slice(2)) {{
      html += `<td contenteditable="true" class="edit-cell" data-fid="${{fid}}" data-col="${{key}}" data-placeholder="${{ph}}"></td>`;
    }}
    tr.innerHTML = html;
    return tr;
  }}
  function hydrateRow(tr) {{
    const fid = tr.getAttribute("data-fid");
    if (!fid) return;
    const row = load()[fid] || {{}};
    const cb = tr.querySelector(".row-check");
    if (cb && row.checked) cb.checked = true;
    const statusSel = tr.querySelector(".status-sel");
    if (statusSel && row.status) {{ statusSel.value = row.status; applyRowStyle(tr, row.status); }}
    const relevSel = tr.querySelector(".relev-sel");
    if (relevSel && row.relevance) relevSel.value = row.relevance;
    const tipoSel = tr.querySelector(".tipo-sel");
    if (tipoSel && row.type) tipoSel.value = row.type;
    if (tr.getAttribute("data-blank") === "1" && row.cells) {{
      tr.querySelectorAll(".edit-cell").forEach((td) => {{
        const col = td.getAttribute("data-col");
        if (col && row.cells[col] != null) td.textContent = row.cells[col];
      }});
    }}
  }}
  function persistOrder(tbody) {{
    const formId = tbody.closest("section")?.getAttribute("data-form");
    if (!formId) return;
    const order = Array.from(tbody.querySelectorAll("tr[data-fid]")).map((tr) => tr.getAttribute("data-fid"));
    const s = load();
    s.__order = s.__order || {{}};
    s.__order[formId] = order;
    save(s);
  }}
  function applySavedOrders() {{
    const s = load();
    const orders = s.__order || {{}};
    Object.keys(orders).forEach((formId) => {{
      const section = document.getElementById(formId);
      const tbody = section && section.querySelector("tbody");
      if (!tbody) return;
      const map = new Map(Array.from(tbody.querySelectorAll("tr[data-fid]")).map((tr) => [tr.getAttribute("data-fid"), tr]));
      orders[formId].forEach((fid) => {{
        const tr = map.get(fid);
        if (tr) tbody.appendChild(tr);
      }});
    }});
  }}
  function moveRow(tr, dir) {{
    const tbody = tr.parentElement;
    if (!tbody) return;
    if (dir < 0 && tr.previousElementSibling) tbody.insertBefore(tr, tr.previousElementSibling);
    if (dir > 0 && tr.nextElementSibling) tbody.insertBefore(tr.nextElementSibling, tr);
    persistOrder(tbody);
  }}

  ensureSeed();
  // restore extra blanks first
  const state0 = load();
  Object.keys(state0).forEach((fid) => {{
    const m = /^blank:([^:]+):(\\d+)$/.exec(fid);
    if (!m) return;
    const formId = m[1], idx = parseInt(m[2], 10);
    const section = document.getElementById(formId);
    const tbody = section && section.querySelector("tbody");
    if (!tbody) return;
    if (tbody.querySelector(`tr[data-fid="${{fid}}"]`)) return;
    const tr = makeBlankRow(formId, idx);
    tbody.appendChild(tr);
  }});
  applySavedOrders();
  document.querySelectorAll("tr[data-fid]").forEach(hydrateRow);

  document.body.addEventListener("change", (e) => {{
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const fid = t.getAttribute("data-fid");
    if (!fid) return;
    if (t.classList.contains("row-check")) upsert(fid, {{ checked: /** @type {{HTMLInputElement}} */(t).checked }});
    if (t.classList.contains("status-sel")) {{
      upsert(fid, {{ status: /** @type {{HTMLSelectElement}} */(t).value }});
      applyRowStyle(t.closest("tr"), /** @type {{HTMLSelectElement}} */(t).value);
    }}
    if (t.classList.contains("relev-sel")) upsert(fid, {{ relevance: /** @type {{HTMLSelectElement}} */(t).value }});
    if (t.classList.contains("tipo-sel")) upsert(fid, {{ type: /** @type {{HTMLSelectElement}} */(t).value }});
  }});
  document.body.addEventListener("input", (e) => {{
    const t = e.target;
    if (!(t instanceof HTMLElement) || !t.classList.contains("edit-cell")) return;
    const fid = t.getAttribute("data-fid");
    const col = t.getAttribute("data-col");
    if (!fid || !col) return;
    const s = load();
    const row = Object.assign({{}}, s[fid] || {{}});
    row.cells = Object.assign({{}}, row.cells || {{}});
    row.cells[col] = t.textContent || "";
    s[fid] = row;
    save(s);
  }});
  document.body.addEventListener("click", (e) => {{
    const up = e.target.closest(".btn-up");
    const down = e.target.closest(".btn-down");
    if (up || down) {{
      const tr = (up || down).closest("tr");
      if (tr) moveRow(tr, up ? -1 : 1);
      return;
    }}
    const btn = e.target.closest(".btn-add-row");
    if (!btn) return;
    const formId = btn.getAttribute("data-form");
    const tbody = document.getElementById(formId)?.querySelector("tbody");
    if (!tbody) return;
    let max = -1;
    tbody.querySelectorAll("tr.blank-row").forEach((tr) => {{
      const m = /^blank:[^:]+:(\\d+)$/.exec(tr.getAttribute("data-fid") || "");
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }});
    const idx = max + 1;
    const tr = makeBlankRow(formId, idx);
    tbody.appendChild(tr);
    upsert(`blank:${{formId}}:${{idx}}`, {{ status: "falta", relevance: "Comum", type: "Texto", cells: {{}} }});
    persistOrder(tbody);
  }});

  // Drag and drop
  let dragTr = null;
  document.body.addEventListener("dragstart", (e) => {{
    const tr = e.target.closest("tr[data-fid]");
    if (!tr) return;
    dragTr = tr;
    tr.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }});
  document.body.addEventListener("dragend", () => {{
    if (dragTr) dragTr.classList.remove("dragging");
    document.querySelectorAll("tr.drag-over").forEach((r) => r.classList.remove("drag-over"));
    if (dragTr?.parentElement) persistOrder(dragTr.parentElement);
    dragTr = null;
  }});
  document.body.addEventListener("dragover", (e) => {{
    e.preventDefault();
    const tr = e.target.closest("tbody tr[data-fid]");
    if (!tr || !dragTr || tr === dragTr) return;
    document.querySelectorAll("tr.drag-over").forEach((r) => r.classList.remove("drag-over"));
    tr.classList.add("drag-over");
    const tbody = tr.parentElement;
    const rect = tr.getBoundingClientRect();
    const before = e.clientY < rect.top + rect.height / 2;
    tbody.insertBefore(dragTr, before ? tr : tr.nextSibling);
  }});

  document.getElementById("btn-export").addEventListener("click", () => {{
    const blob = new Blob([JSON.stringify(load(), null, 2)], {{ type: "application/json" }});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "inventario-fase2-marcacoes.json";
    a.click();
  }});
  document.getElementById("btn-reset-seed").addEventListener("click", () => {{
    if (!confirm("Restaurar status do seed (print Parceria)?")) return;
    const s = load();
    Object.keys(SEED).forEach((fid) => {{ s[fid] = Object.assign({{}}, s[fid] || {{}}, SEED[fid]); }});
    s.__seedApplied = true;
    save(s);
    location.reload();
  }});
  document.getElementById("btn-clear").addEventListener("click", () => {{
    if (!confirm("Limpar todas as marcações?")) return;
    localStorage.removeItem(KEY);
    location.reload();
  }});
}})();
</script>
</body>
</html>
"""
    OUT.write_text(doc, encoding="utf-8")
    print(f"OK: {OUT}")
    print(f"SEED: {SEED} ({len(SEED_STATUS)} status)")
    print(f"classes: {len(toc)}")


if __name__ == "__main__":
    build()
