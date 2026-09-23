import json
from pathlib import Path

forms = json.loads(
    Path("data/subprojects/atlas-prototipo/epics/prototipo/forms.json").read_text(encoding="utf-8")
)
org = next(f for f in forms if f["id"] == "form-patlasv4-proto-unidade-organizacional")
parent = "sec-patlasv4proto-uo-ajustes"
subs = [s["id"] for s in org["sections"] if s.get("parentSectionId") == parent]
section_ids = {parent, *subs}
fields_in = [f for f in org["fields"] if f.get("sectionId") in section_ids]
print("fields in Dados da Organizacao:")
for f in fields_in:
    print(f"  {f['id']}: {f.get('label')!r} hidden={f.get('hidden')}")

hide = next(r for r in org["fieldVisibilityRules"] if r["id"] == "rule-uo-hide-ajustes-nao-empresa")
show = next(r for r in org["fieldVisibilityRules"] if r["id"] == "rule-uo-show-ajustes-empresa")
print("HIDE", hide["targetFieldIds"])
missing = [f["id"] for f in fields_in if f["id"] not in set(hide["targetFieldIds"])]
print("NOT in hide rule:", missing)
