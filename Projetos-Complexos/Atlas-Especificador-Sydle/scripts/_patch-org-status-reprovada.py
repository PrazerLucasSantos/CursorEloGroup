"""Add Reprovada pela MTI to org status + Reprovar method form."""
from __future__ import annotations

import json
from pathlib import Path

EPIC = Path(__file__).resolve().parents[1] / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS = EPIC / "forms.json"
GROUPS = EPIC / "class-groups.json"

OPTS = [
    "Incompleta",
    "Em apresentação",
    "Completa – aguardando MTI",
    "Aprovada pela MTI",
    "Reprovada pela MTI",
]
SPEC = (
    "Ciclo da habilitação documental do parceiro. "
    "Incompleta → (Disponibilizar) Em apresentação → (Parceiro envia) Completa – aguardando MTI → "
    "(Aprovar) Aprovada pela MTI | (Solicitar ajuste) Em apresentação | (Reprovar) Reprovada pela MTI."
)

REPROVAR_FORM = {
    "id": "form-patlasv4-proto-metodo-reprovar-cadastro-org",
    "name": "Reprovar cadastro",
    "sectionLayout": "none",
    "defaultCanvasMode": "edit",
    "metadata": (
        "Confirmação da reprovação. Ao confirmar, o Status da habilitação documental muda para "
        '"Reprovada pela MTI". Uso para rejeição definitiva (diferente de Solicitar ajuste).'
    ),
    "fields": [
        {
            "id": "patlasv4proto-reprovar-org-alerta",
            "label": "Reprovação do cadastro",
            "type": "alert",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "alertVariant": "error",
            "alertTitle": "Confirmar reprovação",
            "alertMessage": (
                'Ao confirmar, o Status da habilitação documental muda para "Reprovada pela MTI". '
                "Esta ação é para rejeição definitiva (para correção, use Solicitar ajuste)."
            ),
        },
        {
            "id": "patlasv4proto-reprovar-org-novo-status",
            "label": "Novo status",
            "type": "text",
            "size": "medium",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
        },
        {
            "id": "patlasv4proto-reprovar-org-motivo",
            "label": "Motivo da reprovação",
            "type": "longText",
            "size": "large",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "common",
            "spec": "Informe o motivo que será comunicado ao responsável da organização.",
        },
    ],
    "exampleValuePresets": [
        {
            "id": "patlasv4proto-p-reprovar-org",
            "name": "Exemplo",
            "iconColor": "#b91c1c",
            "fieldValues": {
                "patlasv4proto-reprovar-org-novo-status": "Reprovada pela MTI",
                "patlasv4proto-reprovar-org-motivo": (
                    "Documentação insuficiente / não atende aos requisitos MIPP."
                ),
            },
        }
    ],
    "activeExamplePresetId": "patlasv4proto-p-reprovar-org",
}


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))

    org = next(f for f in forms if f["id"] == "form-patlasv4-proto-unidade-organizacional")
    for field in org["fields"]:
        if field["id"] == "patlasv4proto-uo-habilitacao-status":
            field["options"] = list(OPTS)
            field["spec"] = SPEC
            break

    portal = next((f for f in forms if f["id"] == "form-patlasv4-proto-portal-onboarding-org"), None)
    if portal:
        for field in portal["fields"]:
            if field["id"] == "patlasv4proto-portal-org-status-habilitacao":
                field["options"] = list(OPTS)
                field["spec"] = (
                    "Espelho do Status da habilitação documental da Organização (somente leitura no portal)."
                )
                break

    for m in org.get("methods") or []:
        if m.get("id") in ("mqr0l45hugm3rj", "patlasv4proto-uo-meth-reprovar-cadastro") or m.get(
            "name"
        ) in ("Reprovar", "Reprovar cadastro"):
            m["id"] = "patlasv4proto-uo-meth-reprovar-cadastro"
            m["name"] = "Reprovar cadastro"
            m["icon"] = "cancel"
            m["kind"] = "destaque"
            m["inputFormId"] = REPROVAR_FORM["id"]
            break

    ids = [f["id"] for f in forms]
    if REPROVAR_FORM["id"] not in ids:
        if "form-patlasv4-proto-metodo-aprovar-cadastro-org" in ids:
            forms.insert(ids.index("form-patlasv4-proto-metodo-aprovar-cadastro-org") + 1, REPROVAR_FORM)
        else:
            forms.append(REPROVAR_FORM)
    else:
        forms[ids.index(REPROVAR_FORM["id"])] = REPROVAR_FORM

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    cg = json.loads(GROUPS.read_text(encoding="utf-8"))
    assigns = cg.setdefault("assignments", {})
    aprovar_grp = assigns.get("form-patlasv4-proto-metodo-aprovar-cadastro-org")
    if aprovar_grp:
        assigns[REPROVAR_FORM["id"]] = aprovar_grp
        order = cg.setdefault("memberOrderByGroup", {}).setdefault(aprovar_grp, [])
        fid = REPROVAR_FORM["id"]
        if fid not in order:
            if "form-patlasv4-proto-metodo-aprovar-cadastro-org" in order:
                i = order.index("form-patlasv4-proto-metodo-aprovar-cadastro-org") + 1
                order.insert(i, fid)
            else:
                order.append(fid)
        GROUPS.write_text(json.dumps(cg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("ok")


if __name__ == "__main__":
    main()
