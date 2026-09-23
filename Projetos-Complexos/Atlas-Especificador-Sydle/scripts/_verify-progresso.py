# -*- coding: utf-8 -*-
import json
from pathlib import Path

p = Path(__file__).resolve().parent.parent / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
forms = json.loads(p.read_text(encoding="utf-8"))
org = next(f for f in forms if f["id"] == "form-patlasv4-proto-unidade-organizacional")
pp = next(x for x in org["exampleValuePresets"] if "parceiro" in x["id"])
for e in pp["embeddedRowsByFieldId"]["patlasv4proto-uo-etapas-documentacionais"]:
    print("ETAPA", e.get("patlasv4proto-uoetapa-nome"), "prog", e.get("patlasv4proto-uoetapa-progresso"))
    for g in e["patlasv4proto-uoetapa-grupos"]["embeddedDemoInstances"]:
        print("  ", g.get("patlasv4proto-uogrpetapa-grupo"), g.get("patlasv4proto-uogrpetapa-progresso"))
