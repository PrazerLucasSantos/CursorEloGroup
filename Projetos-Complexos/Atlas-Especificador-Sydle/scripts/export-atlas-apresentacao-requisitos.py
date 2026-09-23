# -*- coding: utf-8 -*-
"""
Exporta a apresentação do protótipo Atlas como DOCUMENTO DE REQUISITOS:
para cada tela do Mapa do Fluxo (Fase 1) gera um passo HTML completo
(história, contexto, requisitos, regras, campos por aba, métodos, regras
condicionais, fluxo) seguido do passo de classe (tela ao vivo).

Saídas:
  exports/presentations/atlas-prototipo-apresentacao-requisitos.json
  exports/zips/atlas-prototipo-apresentacao-requisitos.zip  (com --zip)
"""
import json
import os
import sys
import subprocess
import html as _html

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from atlas_classes_config import CONFIG

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EPIC = os.path.join(ROOT, "data/subprojects/atlas-prototipo/epics/prototipo")
OUT_JSON = os.path.join(ROOT, "exports/presentations/atlas-prototipo-apresentacao-requisitos.json")
WORKSPACE_ID = "ws-atlas-prototipo-organizado"
WANT_ZIP = "--zip" in sys.argv


def load(name, fb):
    p = os.path.join(EPIC, name)
    if not os.path.exists(p):
        return fb
    with open(p, encoding="utf-8") as f:
        return json.load(f)


FORMS = load("forms.json", [])
WORKSPACES = load("workspaces.json", [])
PORTALS = load("portals.json", [])
EPIC_META = load("epic.json", {"name": "Atlas Protótipo"})

FORM_BY_ID = {fm["id"]: fm for fm in FORMS}
LABEL_BY_ID = {fl["id"]: fl.get("label", fl["id"]) for fm in FORMS for fl in fm.get("fields", [])}
NARR_BY_FORMID = {cfg["form_id"]: cfg for cfg in CONFIG.values()}


def esc(s):
    return _html.escape(str(s if s is not None else ""))


def friendly_type(fld):
    t = fld.get("type")
    base = {"text": "Texto longo" if fld.get("textLong") else "Texto", "number": "Número",
            "date": "Data", "boolean": "Sim/Não", "file": "Arquivo", "alert": "Aviso na tela"}.get(t)
    if base:
        return base
    if t == "textOptions":
        return "Opções (várias)" if fld.get("multiple") else "Opções (uma)"
    if t == "reference":
        return "Seleção (várias)" if fld.get("multiple") else "Seleção"
    if t == "embeddedReference":
        return "Tabela"
    return t or "—"


def tipo_html(fld):
    txt = esc(friendly_type(fld))
    opts = fld.get("options") or []
    if opts and fld.get("type") in ("textOptions", "reference"):
        amostra = " · ".join(opts[:8]) + ("…" if len(opts) > 8 else "")
        txt += f"<br><span style='color:#64748b;font-size:.85em'>Opções: {esc(amostra)}</span>"
    return txt


def regra_html(fld):
    parts = []
    if fld.get("required") and not fld.get("readOnly"):
        parts.append("Obrigatório")
    if fld.get("readOnly"):
        parts.append("Somente leitura")
    if fld.get("hidden"):
        parts.append("Oculto (condicional)")
    return esc(" · ".join(parts)) or "—"


def obs_html(fld):
    return esc(fld.get("spec") or fld.get("label") or "")


def rule_text(rule):
    src = LABEL_BY_ID.get(rule["sourceFieldId"], rule["sourceFieldId"])
    tgs = [LABEL_BY_ID.get(t, t) for t in rule.get("targetFieldIds", [])]
    val = ("Sim" if rule.get("expectedBoolean") else "Não") if rule.get("sourceKind") == "boolean" else rule.get("expectedOptionText", "")
    cmp = "for diferente de" if rule.get("operator") == "neq" else "="
    act = {"show": "mostrar", "hide": "ocultar", "readonly": "tornar só leitura", "editable": "tornar editável"}.get(rule.get("action"), rule.get("action"))
    return f"Quando «{esc(src)}» {cmp} «{esc(val)}» → {act}: {esc('; '.join(tgs))}"


TH = "style='background:#0c4a6e;color:#fff;padding:6px 8px;text-align:left;font-size:.82rem'"
TD = "style='border-bottom:1px solid #e2e8f0;padding:6px 8px;font-size:.82rem;vertical-align:top'"
TDB = "style='border-bottom:1px solid #e2e8f0;padding:6px 8px;font-size:.82rem;vertical-align:top;font-weight:700;color:#0f172a'"


def field_table(fields):
    rows = []
    for fld in fields:
        if fld.get("type") == "alert":
            rows.append(f"<tr><td {TDB}>{esc(fld.get('label','Aviso'))}</td><td {TD}>Aviso na tela</td><td {TD}>—</td><td {TD}>{esc(fld.get('alertMessage',''))}</td></tr>")
            continue
        if fld.get("type") == "embeddedReference":
            title = fld.get("label", "Tabela")
            rows.append(f"<tr><td colspan='4' style='background:#e0f2fe;color:#0c4a6e;font-weight:700;padding:6px 8px;font-size:.82rem'>Tabela: {esc(title)} — cada linha contém:</td></tr>")
            linked = FORM_BY_ID.get(fld.get("linkedFormId"))
            for sub in (linked.get("fields", []) if linked else []):
                if sub.get("type") == "alert":
                    continue
                rows.append(f"<tr><td {TDB}>{esc(sub.get('label',''))}</td><td {TD}>{tipo_html(sub)}</td><td {TD}>{regra_html(sub)}</td><td {TD}>{obs_html(sub)}</td></tr>")
            continue
        rows.append(f"<tr><td {TDB}>{esc(fld.get('label',''))}</td><td {TD}>{tipo_html(fld)}</td><td {TD}>{regra_html(fld)}</td><td {TD}>{obs_html(fld)}</td></tr>")
    head = f"<tr><th {TH}>Campo</th><th {TH}>Tipo</th><th {TH}>Regra do campo</th><th {TH}>Observação</th></tr>"
    return f"<table style='border-collapse:collapse;width:100%;margin:6px 0 14px'>{head}{''.join(rows)}</table>"


def section_label(t):
    return f"<h3 style='color:#0c4a6e;font-size:1rem;margin:16px 0 4px;border-left:4px solid #1822dc;padding-left:8px'>{esc(t)}</h3>"


def ul(items):
    return "<ul style='margin:4px 0 10px 18px;padding:0'>" + "".join(f"<li style='margin:2px 0;font-size:.9rem'>{esc(i)}</li>" for i in items) + "</ul>"


def build_requisitos_html(form, nome_tela):
    cfg = NARR_BY_FORMID.get(form["id"])
    out = [f"<div style='font-family:Calibri,Arial,sans-serif;color:#1e293b;line-height:1.45'>"]
    out.append(f"<h2 style='color:#0c4a6e;margin:0 0 2px'>{esc(nome_tela)}</h2>")
    out.append("<p style='color:#64748b;margin:0 0 10px;font-size:.85rem'>Documento de requisitos da tela — Projeto Atlas · Fase 1</p>")

    if cfg:
        out.append(section_label("História de usuário"))
        out.append(f"<p style='font-size:.9rem;margin:2px 0 8px'>{esc(cfg['historia'])}</p>")
        out.append(section_label("Contexto"))
        out.append(f"<p style='font-size:.9rem;margin:2px 0 8px'>{esc(cfg['contexto'])}</p>")
        out.append(section_label("Requisitos funcionais"))
        out.append(ul(cfg["requisitos"]))
        out.append(section_label("Regras de negócio"))
        out.append(ul(cfg["regras"]))
    elif form.get("metadata"):
        out.append(section_label("Contexto"))
        out.append(f"<p style='font-size:.9rem;margin:2px 0 8px'>{esc(form['metadata'])}</p>")

    # Campos por aba
    out.append(section_label("Telas e campos"))
    secs = form.get("sections", [])
    flds = form.get("fields", [])
    if not secs:
        out.append(field_table(flds))
    else:
        tops = [s for s in secs if not s.get("parentSectionId")]
        for sec in tops:
            out.append(f"<h4 style='margin:10px 0 2px;color:#0f172a'>Aba: {esc(sec.get('title','').strip())}</h4>")
            direct = [f for f in flds if f.get("sectionId") == sec["id"]]
            if direct:
                out.append(field_table(direct))
            for sub in [s for s in secs if s.get("parentSectionId") == sec["id"]]:
                out.append(f"<h5 style='margin:8px 0 2px;color:#334155'>{esc(sub.get('title','').strip())}</h5>")
                sf = [f for f in flds if f.get("sectionId") == sub["id"]]
                if sf:
                    out.append(field_table(sf))

    # Métodos
    methods = form.get("methods", [])
    if methods:
        out.append(section_label("Métodos e ações"))
        items = []
        for m in methods:
            inp = FORM_BY_ID.get(m.get("inputFormId"))
            extra = f" — {inp['metadata']}" if inp and inp.get("metadata") else (f" — {m.get('spec')}" if m.get("spec") else "")
            items.append(f"{m.get('name','')}{extra}")
        out.append(ul(items))
    elif cfg and cfg.get("metodos_nota"):
        out.append(section_label("Métodos e ações"))
        out.append(f"<p style='font-size:.9rem;margin:2px 0 8px'>{esc(cfg['metodos_nota'])}</p>")

    # Regras condicionais
    rules = form.get("fieldVisibilityRules", [])
    if rules:
        out.append(section_label("Regras de exibição condicional"))
        out.append("<ul style='margin:4px 0 10px 18px;padding:0'>" + "".join(f"<li style='margin:2px 0;font-size:.85rem'>{rule_text(r)}</li>" for r in rules) + "</ul>")

    if cfg and cfg.get("fluxo"):
        out.append(section_label("Fluxo típico"))
        out.append(f"<p style='font-size:.9rem;margin:2px 0 8px'>{esc(cfg['fluxo'])}</p>")

    out.append("</div>")
    return "".join(out)


def box(title, html_inner, border="#1822dc", bg="#eef2ff"):
    return (f"<div style='border-left:4px solid {border};background:{bg};padding:16px 20px;border-radius:8px'>"
            f"<div style='font-weight:700;color:#1e293b;margin-bottom:8px'>{esc(title)}</div>{html_inner}</div>")


# ---- montagem do fluxo ----
ws = next((w for w in WORKSPACES if w.get("id") == WORKSPACE_ID), WORKSPACES[0] if WORKSPACES else None)
steps = []

main_ids = []
for pkg in (ws.get("packages", []) if ws else []):
    for cls in pkg.get("classes", []):
        if cls.get("linkedFormId"):
            main_ids.append(cls["linkedFormId"])

steps.append({
    "id": "step-capa",
    "title": "Atlas — Documento de Requisitos (Fase 1)",
    "type": "html",
    "htmlPresentationShowHeader": True,
    "htmlPresentationHeaderTitle": "Atlas — Requisitos da Fase 1",
    "htmlContent": box(
        "Apresentação no formato de documento de requisitos",
        f"<p style='margin:0 0 8px'>Cada tela é apresentada primeiro como <strong>documento de requisitos</strong> "
        f"(história, contexto, requisitos, regras, campos, métodos) e em seguida como <strong>tela ao vivo</strong> do protótipo.</p>"
        f"<p style='margin:0;color:#475569;font-size:.9rem'><strong>{len(main_ids)}</strong> telas no fluxo da Fase 1.</p>",
        border="#0c4a6e", bg="#e0f2fe"),
})

if ws:
    steps.append({
        "id": "step-workspace",
        "title": f"Mapa do Fluxo — {ws.get('name','')}",
        "type": "workspace",
        "linkedWorkspaceId": ws["id"],
        "workspacePresentationDescription": "Pacotes e telas na ordem do fluxo da Fase 1.",
    })

for pkg in (ws.get("packages", []) if ws else []):
    steps.append({
        "id": f"step-pkg-{pkg['id']}",
        "title": pkg.get("name", ""),
        "type": "html",
        "htmlPresentationShowHeader": True,
        "htmlPresentationHeaderTitle": pkg.get("name", ""),
        "htmlContent": box(pkg.get("name", ""), f"<p style='margin:0'>{len(pkg.get('classes',[]))} tela(s) neste grupo.</p>", border="#64748b", bg="#f1f5f9"),
    })
    for cls in pkg.get("classes", []):
        fid = cls.get("linkedFormId")
        form = FORM_BY_ID.get(fid)
        if not form:
            continue
        nome = cls.get("name") or form.get("name", "")
        steps.append({
            "id": f"step-req-{fid}",
            "title": f"Requisitos — {nome}",
            "type": "html",
            "htmlPresentationShowHeader": True,
            "htmlPresentationHeaderTitle": f"Requisitos — {nome}",
            "htmlContent": build_requisitos_html(form, nome),
        })
        steps.append({
            "id": f"step-tela-{fid}",
            "title": f"Tela — {nome}",
            "type": "class",
            "linkedFormId": fid,
            "classPresentationTitle": nome,
            "classPresentationDescription": (NARR_BY_FORMID.get(fid, {}).get("historia") or form.get("metadata") or "")[:600],
            "linkedFormExamplePresetIds": cls.get("linkedFormExamplePresetIds"),
        })

presentation = {
    "version": 1,
    "meta": {"epicName": EPIC_META.get("name", "Atlas Protótipo"),
             "flowName": "Atlas — Documento de Requisitos (Fase 1)"},
    "bundle": {"forms": FORMS, "workspaces": WORKSPACES, "portals": PORTALS},
    "flow": {"id": "flow-atlas-requisitos-fase1",
             "name": "Atlas — Documento de Requisitos (Fase 1)", "steps": steps},
    "initialStepId": steps[0]["id"] if steps else None,
}

os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(presentation, f, ensure_ascii=False, indent=2)
print("Apresentação JSON:", OUT_JSON)
print("Etapas:", len(steps), "| Telas:", len(main_ids))

if WANT_ZIP:
    dist = os.path.join(ROOT, "dist/presentation.html")
    if not os.path.exists(dist):
        print("Executando npm run build...")
        subprocess.run("npm run build", cwd=ROOT, shell=True, check=True)
    zip_script = os.path.join(ROOT, "scripts/zip-presentation-export.mjs")
    subprocess.run(["node", zip_script, OUT_JSON], cwd=ROOT, check=True)
    print("ZIP: exports/zips/atlas-prototipo-apresentacao-requisitos.zip")
