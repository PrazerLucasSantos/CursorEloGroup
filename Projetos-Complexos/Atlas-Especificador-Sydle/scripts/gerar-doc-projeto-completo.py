# -*- coding: utf-8 -*-
"""Gera a documentação COMPLETA do projeto (todas as classes) em Markdown,
alinhada ao formato PPTX: Campo | Tipo | Obrig. | Observação — uma tabela por aba."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EPIC = os.path.join(ROOT, "data/subprojects/atlas-prototipo/epics/prototipo")
OUT = os.path.join(ROOT, "docs/entregaveis/markdown/Atlas_Projeto_Completo.md")

forms = json.load(open(os.path.join(EPIC, "forms.json"), encoding="utf-8"))
cg = json.load(open(os.path.join(EPIC, "class-groups.json"), encoding="utf-8"))
FBI = {f["id"]: f for f in forms}
LBL = {fl["id"]: fl.get("label", fl["id"]) for f in forms for fl in f.get("fields", [])}


def esc(s):
    return str(s if s is not None else "").replace("|", "\\|").replace("\n", " ")


def friendly_type(fld):
    t = fld.get("type")
    base = {
        "text": "Texto longo" if fld.get("textLong") else "Texto",
        "number": "Número",
        "decimal": "Decimal",
        "date": "Data",
        "boolean": "Sim/Não",
        "file": "Arquivo",
        "html": "HTML",
        "alert": "Aviso",
        "geopoint": "Geo",
    }.get(t)
    if base:
        return base
    if t == "textOptions":
        opts = fld.get("options") or []
        base = "Opções (várias)" if fld.get("multiple") else "Opções"
        if opts:
            amostra = " · ".join(opts[:8])
            if len(opts) > 8:
                amostra += "…"
            base += f". Ex.: {amostra}"
        return base
    if t == "reference":
        ref = FBI.get(fld.get("linkedFormId"))
        hint = f" → {ref['name']}" if ref else ""
        return ("Seleção (várias)" if fld.get("multiple") else "Seleção") + hint
    if t == "embeddedReference":
        return "Tabela (múltiplas linhas)"
    return t or "—"


def obrig_cell(fld):
    if fld.get("readOnly"):
        return "Leit."
    if fld.get("required"):
        return "Sim"
    if fld.get("hidden"):
        return "Cond."
    return "Não"


def _rule_desc(r):
    src = LBL.get(r["sourceFieldId"], r["sourceFieldId"])
    if r.get("sourceKind") == "boolean":
        val = "Sim" if r.get("expectedBoolean") else "Não"
    elif r.get("expectedOptionText"):
        val = r["expectedOptionText"]
    elif r.get("expectedOptionTexts"):
        val = ", ".join(r["expectedOptionTexts"])
    else:
        val = "—"
    cmp = "≠" if r.get("operator") == "neq" else "="
    act = {
        "show": "Exibido",
        "hide": "Oculto",
        "readonly": "Somente leitura",
        "editable": "Editável",
    }.get(r.get("action"), r.get("action", ""))
    return f"{act} quando «{src}» {cmp} «{val}»."


def obs_cell(fld, form):
    if fld.get("type") == "alert":
        return fld.get("alertMessage", "")
    parts = []
    if fld.get("spec"):
        parts.append(fld["spec"].strip())
    for r in form.get("fieldVisibilityRules", []):
        if fld.get("id") in r.get("targetFieldIds", []):
            parts.append(_rule_desc(r))
    if fld.get("readOnly") and fld.get("required"):
        parts.append("Preenchimento obrigatório pelo sistema.")
    elif fld.get("readOnly"):
        parts.append("Calculado ou preenchido automaticamente.")
    if fld.get("multiple"):
        parts.append("Permite múltiplos valores.")
    return " ".join(parts)


def field_rows(form, field_list, prefix=""):
    rows = []
    for fld in field_list:
        if fld.get("type") == "embeddedReference":
            group = fld.get("label", "Tabela")
            linked = FBI.get(fld.get("linkedFormId"))
            if linked:
                rows.extend(field_rows(form, linked.get("fields", []), prefix=group))
            else:
                label = f"{prefix} › {fld.get('label', '')}" if prefix else fld.get("label", "")
                rows.append((label, friendly_type(fld), obrig_cell(fld), obs_cell(fld, form)))
        else:
            label = fld.get("label", "")
            if prefix:
                label = f"{prefix} › {label}"
            rows.append((label, friendly_type(fld), obrig_cell(fld), obs_cell(fld, form)))
    return rows


def render_form(out, form):
    screen = form.get("name", "(sem nome)")
    out.append(f"### {screen}\n")
    if form.get("metadata"):
        out.append(f"*{form['metadata']}*\n")

    secs = form.get("sections", [])
    flds = form.get("fields", [])
    tops = [s for s in secs if not s.get("parentSectionId")]

    def write_table(title, rows):
        if not rows:
            return
        out.append(f"**{title}**\n")
        out.append("| Campo | Tipo | Obrig. | Observação |")
        out.append("|---|---|---|---|")
        for label, tipo, obrig, obs in rows:
            out.append(f"| {esc(label)} | {esc(tipo)} | {obrig} | {esc(obs)} |")
        out.append("")

    if not tops:
        write_table(f"Tela: {screen}", field_rows(form, flds))
    else:
        for sec in tops:
            sec_ids = {sec["id"]}
            for sub in [s for s in secs if s.get("parentSectionId") == sec["id"]]:
                sec_ids.add(sub["id"])
            tab_title = f"Tela: {screen} › Aba: {sec.get('title', '').strip()}"
            write_table(tab_title, field_rows(form, [f for f in flds if f.get("sectionId") in sec_ids]))

    methods = form.get("methods", [])
    if methods:
        out.append("**Métodos / Ações:**")
        for m in methods:
            extra = ""
            inp = FBI.get(m.get("inputFormId"))
            if inp and inp.get("metadata"):
                extra = f" — {inp['metadata']}"
            elif m.get("spec"):
                extra = f" — {m['spec']}"
            out.append(f"- **{m.get('name', '')}**{extra}")
        out.append("")

    presets = form.get("exampleValuePresets", [])
    if presets:
        nomes = ", ".join(p.get("name", "") for p in presets[:8])
        mais = f" … (+{len(presets) - 8})" if len(presets) > 8 else ""
        out.append(f"**Exemplos ({len(presets)}):** {nomes}{mais}\n")
    out.append("---\n")


# ---------- montagem ----------
out = []
out.append("# Projeto Atlas — Documentação Completa do Protótipo\n")
out.append("**Plataforma:** SYDLE ONE · **Órgão:** MTI · **Elaborado por:** EloGroup\n")
out.append(
    "Documentação gerada automaticamente do protótipo. Formato: **Campo | Tipo | Obrig. | Observação** "
    "(campos de tabelas embutidas aparecem inline com prefixo «Grupo › Campo»).\n"
)

tops = [g for g in cg["groups"] if not g.get("parentGroupId")]
n_classes = 0
out.append("## Índice de grupos\n")
for g in tops:
    out.append(f"- {g['name']}")
out.append("")

for g in tops:
    out.append(f"\n# {g['name']}\n")
    for fid in cg["memberOrderByGroup"].get(g["id"], []):
        if fid in FBI:
            render_form(out, FBI[fid])
            n_classes += 1
    for sub in [s for s in cg["groups"] if s.get("parentGroupId") == g["id"]]:
        ids = cg["memberOrderByGroup"].get(sub["id"], [])
        if not ids:
            continue
        out.append(f"## {g['name']} › {sub['name']}\n")
        for fid in ids:
            if fid in FBI:
                render_form(out, FBI[fid])
                n_classes += 1

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(out))

print("Documento gerado:", OUT)
print("Grupos:", len(tops), "| Classes documentadas:", n_classes)
