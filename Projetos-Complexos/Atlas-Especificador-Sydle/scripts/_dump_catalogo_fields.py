# -*- coding: utf-8 -*-
import json
from pathlib import Path

out = Path("exports/_dump_catalogo_fields_out.txt")
forms = json.loads(Path("data/subprojects/atlas-prototipo/epics/prototipo/forms.json").read_text(encoding="utf-8"))
cat = next(f for f in forms if f["id"] == "form-patlasv4-proto-cat-catalogo")
lines = []
lines.append(f"NAME {cat['name']}")
lines.append(f"META {cat.get('metadata', '')}")
lines.append("---SECTIONS---")
for s in cat.get("sections") or []:
    lines.append(f"{s['id']} | {s['title']}")
lines.append("---FIELDS---")
for f in cat["fields"]:
    flags = []
    if f.get("required"):
        flags.append("REQ")
    if f.get("readOnly"):
        flags.append("RO")
    if f.get("hidden"):
        flags.append("HID")
    if f.get("multiple"):
        flags.append("MULTI")
    opts = f.get("options")
    opt = " | ".join(opts) if isinstance(opts, list) else ""
    lines.append(
        " | ".join(
            [
                f.get("sectionId") or "",
                f["label"],
                f["type"],
                ",".join(flags) or "-",
                f.get("linkedFormId") or "-",
                opt or "-",
                (f.get("spec") or "").replace("\n", " "),
            ]
        )
    )
lines.append("---RULES---")
for r in cat.get("fieldVisibilityRules") or []:
    lines.append(json.dumps(r, ensure_ascii=False))
lines.append("---METHODS---")
for m in cat.get("methods") or []:
    lines.append(f"{m.get('name')} | {m.get('kind')} | {(m.get('spec') or '')}")
for eid in [
    "form-patlasv4-proto-cat-catalogo-metrica",
    "form-patlasv4-proto-cat-catalogo-complexidade",
]:
    e = next(f for f in forms if f["id"] == eid)
    lines.append(f"---EMBED {e['name']}---")
    for f in e["fields"]:
        flags = []
        if f.get("required"):
            flags.append("REQ")
        if f.get("readOnly"):
            flags.append("RO")
        if f.get("hidden"):
            flags.append("HID")
        lines.append(f"{f['label']} | {f['type']} | {','.join(flags) or '-'} | {(f.get('spec') or '')}")
out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
