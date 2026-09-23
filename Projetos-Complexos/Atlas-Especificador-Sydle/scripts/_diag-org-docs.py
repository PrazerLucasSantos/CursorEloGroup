# -*- coding: utf-8 -*-
import json
from pathlib import Path

p = Path(__file__).resolve().parent.parent / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
forms = json.loads(p.read_text(encoding="utf-8"))
org = next(f for f in forms if f["id"] == "form-patlasv4-proto-unidade-organizacional")

print("sections docs-related:")
for s in org["sections"]:
    if "document" in s["id"] or "habilit" in s.get("id", "") or "execuc" in s.get("id", ""):
        print(" ", s)

print("\nfields on documentos / etapas / docs:")
for f in org["fields"]:
    sid = f.get("sectionId") or ""
    if (
        sid == "sec-patlasv4proto-uo-documentos-aba"
        or "etapa" in f["id"]
        or "document" in f["id"]
        or "mipp" in f["id"]
        or "execucao" in f["id"]
        or "habilitacao" in f["id"]
        or "prog-" in f["id"]
        or "acesso-comercial" in f["id"]
    ):
        print(
            f"  {f['id'][:55]:55} hidden={str(f.get('hidden')):5} type={f['type']:18} sec={sid}"
        )

print("\nvisibility rules:")
for r in org.get("fieldVisibilityRules") or []:
    tids = r.get("targetFieldIds") or []
    if any(
        "etapa" in t or "document" in t or "mipp" in t or "execucao" in t or "habilitacao" in t or "prog-" in t
        for t in tids
    ):
        print(
            r["id"],
            "src=",
            r.get("sourceFieldId"),
            r.get("expectedBoolean", r.get("expectedOptionText")),
            "->",
            tids,
        )

print("\nactivePreset:", org.get("activeExamplePresetId"))
for preset in org["exampleValuePresets"]:
    if preset["id"] in (
        org.get("activeExamplePresetId"),
        "patlasv4proto-p-unidade-organizacional-mti",
        "patlasv4proto-p-unidade-organizacional-parceiro",
    ):
        fv = preset.get("fieldValues") or {}
        emb = preset.get("embeddedRowsByFieldId") or {}
        print(
            preset["id"],
            "empresa=",
            fv.get("patlasv4proto-uo-empresa"),
            "etapas=",
            len(emb.get("patlasv4proto-uo-etapas-documentacionais") or []),
            "old_docs=",
            "patlasv4proto-uo-documentos" in emb,
        )

print("\nforms exist:")
ids = {f["id"] for f in forms}
for i in (
    "form-patlasv4-proto-uo-etapa-documentacional",
    "form-patlasv4-proto-uo-grupo-doc-etapa",
):
    print(" ", i, i in ids)
