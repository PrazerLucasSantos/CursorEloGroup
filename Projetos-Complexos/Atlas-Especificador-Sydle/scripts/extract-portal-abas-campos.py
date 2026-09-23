import json
from pathlib import Path

forms = json.loads(Path("data/subprojects/atlas-prototipo/epics/prototipo/forms.json").read_text(encoding="utf-8"))
by = {f["id"]: f for f in forms}

TYPE_MAP = {
    "boolean": "Sim/Não",
    "date": "Data",
    "number": "Número",
    "file": "Arquivo",
    "alert": "Aviso na tela",
    "html": "HTML / botão",
}


def tip(f):
    t = f.get("type")
    if t == "text":
        return "Texto longo" if f.get("textLong") else "Texto"
    if t == "textOptions":
        base = "Opções (várias)" if f.get("multiple") else "Opções (uma)"
        opts = f.get("options") or []
        if opts and len(opts) <= 8:
            return f"{base}: {', '.join(opts)}"
        if opts:
            return f"{base} ({len(opts)} opções)"
        return base
    if t == "reference":
        return "Seleção (várias)" if f.get("multiple") else "Seleção (uma)"
    if t == "embeddedReference":
        return "Tabela"
    return TYPE_MAP.get(t, t or "—")


def dump(fid, out_name):
    fm = by[fid]
    secs = {s["id"]: s for s in fm.get("sections", [])}
    lines = [f"# {out_name}", f"Fonte: {fm['name']}", ""]
    for s in fm.get("sections", []):
        parent = s.get("parentSectionId")
        title = s["title"].strip()
        if parent:
            title = f"{secs[parent]['title'].strip()} > {title}"
        fields = [f for f in fm["fields"] if f.get("sectionId") == s["id"]]
        if not fields:
            continue
        lines.append(f"## {title}")
        lines.append("Campo | Tipo | Regras e validação")
        lines.append("---|---|---")
        for f in fields:
            label = (f.get("label") or f.get("id") or "—").strip()
            ro = "Somente leitura." if f.get("readOnly") else ""
            req = "Obrigatório." if f.get("required") else ""
            hidden = "Oculto por regra de visualização." if f.get("hidden") else ""
            spec = " ".join((f.get("spec") or "").split())
            if f.get("type") == "alert":
                spec = f.get("alertMessage") or spec
            rules = " ".join(x for x in [spec, req, ro, hidden] if x) or "—"
            lines.append(f"{label} | {tip(f)} | {rules}")
        lines.append("")
    Path(f"exports/{out_name}.md").write_text("\n".join(lines), encoding="utf-8")
    print("wrote", out_name, "fields", sum(1 for f in fm["fields"] if f.get("sectionId")))


dump("form-patlasv4-proto-pessoa", "portal-aba-usuario-pessoa")
dump("form-patlasv4-proto-unidade-organizacional", "portal-aba-dados-parceria-org")
