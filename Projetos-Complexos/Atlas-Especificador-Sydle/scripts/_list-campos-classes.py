import json
from pathlib import Path

forms = json.loads(
    Path(
        r"c:/Users/LucasSantos/OneDrive - EloGroup/Área de Trabalho/Cursor/Especificador Sydle/data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
    ).read_text(encoding="utf-8")
)
ids = [
    "form-patlasv4-proto-cat-metrica",
    "form-patlasv4-proto-cat-tipo-cobranca",
    "form-patlasv4-proto-cat-categoria",
    "form-patlasv4-proto-cat-grupo",
    "form-patlasv4-proto-cat-modelo-venda",
    "form-patlasv4-proto-cat-parceria",
    "form-patlasv4-proto-cat-solucao",
    "form-patlasv4-proto-cat-catalogo",
    "form-patlasv4-proto-cat-produto",
    "form-patlasv4-proto-cat-dados-parceria",
    "form-patlasv4-proto-cat-universal",
    "form-patlasv4-proto-cat-grupo-atendimento",
]
by = {f["id"]: f for f in forms}
lines = []
for fid in ids:
    f = by[fid]
    lines.append(f"## {f.get('name', '')} ({fid})")
    for fl in f.get("fields") or []:
        if fl.get("type") == "alert":
            continue
        hid = " [oculto]" if fl.get("hidden") else ""
        obl = "obrig." if fl.get("required") else "opc."
        opts = ""
        if fl.get("options"):
            opts = " | opts: " + ", ".join(str(o) for o in fl["options"][:12])
        lines.append(f"- {fl.get('label')} ({fl.get('type')}, {obl}){hid}{opts}")
    lines.append("")
text = "\n".join(lines)
Path(
    r"c:/Users/LucasSantos/OneDrive - EloGroup/Área de Trabalho/Cursor/Especificador Sydle/exports/_campos_classes_catalogo.txt"
).write_text(text, encoding="utf-8")
print(text)
