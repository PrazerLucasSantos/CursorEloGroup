# -*- coding: utf-8 -*-
import json
from pathlib import Path

p = Path(__file__).resolve().parent.parent / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
forms = json.loads(p.read_text(encoding="utf-8"))
org = next(f for f in forms if f["id"] == "form-patlasv4-proto-unidade-organizacional")
print("fields docs:", [f["id"] for f in org["fields"] if "etapa" in f["id"] or "grupo" in f["id"]])
print("methods:", [m["name"] for m in org.get("methods") or [] if "ncluir" in m["name"] or "etapa" in m["name"].lower()])
pp = next(x for x in org["exampleValuePresets"] if "parceiro" in x["id"])
print("selecao", pp["fieldValues"].get("patlasv4proto-uo-etapas-selecao"))
print("grupos_selecao" in (pp.get("fieldValues") or {}))
for e in pp["embeddedRowsByFieldId"]["patlasv4proto-uo-etapas-documentacionais"]:
    print("ETAPA", e["patlasv4proto-uoetapa-nome"])
    for g in e["patlasv4proto-uoetapa-grupos"]["embeddedDemoInstances"]:
        tipos = g["patlasv4proto-uogrpetapa-tipos"]["embeddedDemoInstances"]
        print("  ", g["patlasv4proto-uogrpetapa-grupo"], "docs", len(tipos))
gdoc = next(f for f in forms if f["id"] == "form-patlasv4-proto-grupo-documento")
print("gdoc etapa field", any(f["id"]=="patlasv4proto-gdoc-etapa" for f in gdoc["fields"]))
