# -*- coding: utf-8 -*-
import json
import os
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
forms = json.load(open(
    os.path.join(ROOT, "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"),
    encoding="utf-8",
))
fbi = {f["id"]: f for f in forms}
FID = "form-patlasv4-proto-unidade-organizacional"
uo = fbi[FID]
lbl = {fl["id"]: fl.get("label", fl["id"]) for f in forms for fl in f.get("fields", [])}

METHOD_FORMS = [
    "form-patlasv4-proto-metodo-cadastrar-cargo",
    "form-patlasv4-proto-metodo-migrar-cargos-uo",
    "form-patlasv4-proto-metodo-adicionar-grupos-mipp",
    "form-patlasv4-proto-metodo-substituir-unidade",
    "form-patlasv4-proto-metodo-aprovar-cadastro-org",
    "form-patlasv4-proto-metodo-solicitar-ajuste-org",
]


def obrig(fld):
    if fld.get("readOnly"):
        return "Leitura"
    if fld.get("required"):
        return "Sim"
    if fld.get("hidden"):
        return "Condicional"
    return "Não"


def rule_txt(r):
    src = lbl.get(r["sourceFieldId"], r["sourceFieldId"])
    if r.get("sourceKind") == "boolean":
        val = "Sim" if r.get("expectedBoolean") else "Não"
    else:
        val = r.get("expectedOptionText") or ", ".join(r.get("expectedOptionTexts") or [])
    cmp = "≠" if r.get("operator") == "neq" else "="
    act = {"show": "exibe", "hide": "oculta", "readonly": "somente leitura"}.get(
        r.get("action"), r.get("action")
    )
    tg = [lbl.get(t, t) for t in r.get("targetFieldIds", [])]
    return f"Se «{src}» {cmp} «{val}» → {act}: " + ", ".join(tg)


def rules_for(field_id):
    return [
        rule_txt(r)
        for r in uo.get("fieldVisibilityRules", [])
        if field_id in r.get("targetFieldIds", [])
    ]


tops = {s["id"]: s["title"] for s in uo["sections"] if not s.get("parentSectionId")}
tab_for = {}
for s in uo["sections"]:
    if not s.get("parentSectionId"):
        tab_for[s["id"]] = s["title"]
    else:
        tab_for[s["id"]] = tops.get(s["parentSectionId"], "?")

by_tab = defaultdict(list)
for fld in uo["fields"]:
    tab = tab_for.get(fld.get("sectionId"), "?")
    if fld.get("type") == "embeddedReference":
        linked = fbi.get(fld.get("linkedFormId"))
        group = fld.get("label", "Tabela")
        if linked:
            for sub in linked.get("fields", []):
                by_tab[tab].append((f"{group} › {sub.get('label', '')}", sub, group))
    elif fld.get("type") != "alert":
        by_tab[tab].append((fld.get("label", ""), fld, None))

# print summary for agent
for tab, items in by_tab.items():
    print("TAB:", tab, len(items))
for r in uo.get("fieldVisibilityRules", []):
    print("RULE:", rule_txt(r))
