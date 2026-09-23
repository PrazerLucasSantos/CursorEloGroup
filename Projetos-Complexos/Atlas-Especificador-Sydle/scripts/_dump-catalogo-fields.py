# -*- coding: utf-8 -*-
"""Lista campos das forms de catálogo/produto para enriquecer specs."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
OUT = ROOT / "exports/_catalogo_fields_dump.txt"

IDS = [
    "form-patlasv4-proto-cat-catalogo",
    "form-patlasv4-proto-cat-produto",
    "form-patlasv4-proto-cat-universal",
    "form-patlasv4-proto-cat-parceria",
    "form-patlasv4-proto-cat-solucao",
    "form-patlasv4-proto-cat-metrica",
    "form-patlasv4-proto-cat-tipo-cobranca",
    "form-patlasv4-proto-cat-categoria",
    "form-patlasv4-proto-cat-grupo",
    "form-patlasv4-proto-cat-modelo-venda",
    "form-patlasv4-proto-cat-dados-parceria",
    "form-patlasv4-proto-analise-catalogo",
    "form-patlasv4-proto-portal-parceiro-catalogo",
    "form-patlasv4-proto-portal-cliente-catalogo",
    "form-patlasv4-proto-metodo-cat-nova-versao",
    "form-patlasv4-proto-metodo-cat-import-csv",
    "form-patlasv4-proto-metodo-cat-aprovar",
    "form-patlasv4-proto-metodo-cat-solicitar-ajuste",
]

forms = {f["id"]: f for f in json.loads(FORMS.read_text(encoding="utf-8"))}
lines: list[str] = []
for fid in IDS:
    f = forms.get(fid)
    if not f:
        lines.append(f"MISSING {fid}\n")
        continue
    lines.append(f"=== {fid} === {f.get('name')}\n")
    for x in f.get("fields") or []:
        lines.append(
            f"  {x.get('id')}|{x.get('type')}|{x.get('label')}|req={x.get('required')}|ro={x.get('readOnly')}|spec={(x.get('spec') or '')[:60]!r}\n"
        )
    lines.append("\n")

OUT.write_text("".join(lines), encoding="utf-8")
print("wrote", OUT)
