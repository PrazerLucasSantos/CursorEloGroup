# -*- coding: utf-8 -*-
"""Extrai inventário das 5 classes F2 no atlas-v2 + rows do de-para 31/08."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "exports/_audit_atlas_v2_finalizacao.txt"

forms = json.loads(
    (ROOT / "data/subprojects/atlas-prototipo/epics/atlas-v2/forms.json").read_text(encoding="utf-8")
)
FIDS = [
    "form-patlasv4-proto-cat-parceria",
    "form-patlasv4-proto-cat-solucao",
    "form-patlasv4-proto-cat-catalogo",
    "form-patlasv4-proto-cat-produto",
    "form-patlasv4-proto-cat-dados-parceria",
]

lines: list[str] = []

def w(s: str = "") -> None:
    lines.append(s)

for fid in FIDS:
    f = next(x for x in forms if x["id"] == fid)
    w("=" * 80)
    w(f"FORM {f.get('name')} ({fid})")
    w(f"layout={f.get('sectionLayout')} metadata={(f.get('metadata') or '')[:160]}")
    w("SECTIONS:")
    for s in f.get("sections") or []:
        parent = s.get("parentSectionId")
        w(f"  {s['id']} | {s.get('title')} | parent={parent}")
    w("FIELDS:")
    for fld in f.get("fields") or []:
        flags = []
        if fld.get("hidden"):
            flags.append("HIDDEN")
        if fld.get("readOnly"):
            flags.append("RO")
        if fld.get("required"):
            flags.append("REQ")
        if fld.get("partnerHidden"):
            flags.append("partnerHidden")
        spec = fld.get("spec") or ""
        spec_ok = "SPEC_OK" if ("Como usar" in spec or "Para que serve" in spec) else "SPEC_WEAK"
        lab = fld.get("label") or ""
        if str(lab).startswith("DELETE"):
            flags.append("DELETE!")
        w(
            f"  [{fld.get('sectionId')}] {fld.get('type'):22} {lab[:50]:50} "
            f"{','.join(flags) or '-':28} {spec_ok} id={fld.get('id')}"
        )
    w("METHODS:")
    for m in f.get("methods") or []:
        w(f"  {m.get('name')} | {m.get('kind')} | {(m.get('spec') or '')[:100]}")
    rules = f.get("fieldVisibilityRules") or []
    w(f"VISIBILITY RULES: {len(rules)}")
    for r in rules:
        w(
            f"  {r.get('id')}: {r.get('sourceFieldId')} {r.get('operator')} "
            f"{r.get('expectedOptionText') or r.get('expectedBoolean')} → {r.get('action')} {r.get('targetFieldIds')}"
        )
    w(f"PRESETS: {len(f.get('exampleValuePresets') or [])}")
    w()

# De-para extract
html = (ROOT / "exports/de-para-planilhas-prototipo-final-20260831.html").read_text(encoding="utf-8")
w("=" * 80)
w("DE-PARA 31/08 — rows (campo, classe, destino, forma, nota)")
for m in re.finditer(
    r'\["([^"]+)",\s*"([^"]+)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)"\]',
    html,
):
    campo, classe, destino, forma, nota = m.groups()
    if classe in {
        "Produto",
        "Catálogo",
        "Parceria",
        "Solução",
        "Dados de Parceria por Produto",
        "Catálogo / Solução",
        "Catálogo / Produto",
        "Catálogo / Parceria",
        "Parceria / Catálogo",
        "Fora do Atlas / Proteus",
    }:
        w(f"  [{classe}] {campo} → {destino} | {forma} | {nota[:120]}")

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {OUT} ({len(lines)} lines)")
