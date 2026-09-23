"""Hide modo/periodicidade on UO documento; add Adicionar button for etapas."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"

HTML_ADICIONAR = """<div class="proto-add-etapas-wrap">
  <button type="button" class="btn-add-etapas" data-action="adicionar-etapas">
    <span aria-hidden="true">+</span> Adicionar
  </button>
</div>
<style>
  .proto-add-etapas-wrap { margin: 0 0 4px; display: flex; align-items: flex-end; min-height: 2.4rem; }
  .btn-add-etapas {
    background-color: #6b6b6f;
    color: #ffffff;
    border: none;
    border-radius: 20px;
    padding: 6px 14px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background-color 0.2s ease, transform 0.2s ease;
  }
  .btn-add-etapas:hover { background-color: #565656; transform: translateY(-1px); }
  .btn-add-etapas:active { transform: translateY(0); }
</style>"""

ADD_FIELD = {
    "id": "patlasv4proto-uo-etapas-adicionar",
    "type": "html",
    "label": "",
    "size": "small",
    "readOnly": False,
    "required": False,
    "multiple": False,
    "relevance": "common",
    "sectionId": "sec-patlasv4proto-uo-documentos-aba",
    "hidden": True,
    "htmlContent": HTML_ADICIONAR,
    "spec": "Inclui as etapas selecionadas no grid Etapas incluídas (grupos e documentos do catálogo).",
}


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))

    doc = next(f for f in forms if f["id"] == "form-patlasv4-proto-uo-documento")
    for fid in ("patlasv4proto-uodoc-modo-vencimento", "patlasv4proto-uodoc-periodicidade"):
        for field in doc["fields"]:
            if field["id"] == fid:
                field["hidden"] = True

    org = next(f for f in forms if f["id"] == "form-patlasv4-proto-unidade-organizacional")
    fields = org["fields"]
    ids = [f["id"] for f in fields]

    selecao = next(f for f in fields if f["id"] == "patlasv4proto-uo-etapas-selecao")
    selecao["size"] = "medium"
    selecao["spec"] = (
        "Selecione as etapas e clique em Adicionar. Grupos e documentos vêm do catálogo "
        "(configurados na etapa) — não há seleção de grupo aqui."
    )

    incluidas = next(f for f in fields if f["id"] == "patlasv4proto-uo-etapas-documentacionais")
    incluidas["spec"] = (
        "Resultado de Adicionar. Cada etapa exibe os grupos configurados no catálogo e os "
        "documentos de cada grupo. Na Organização só se seleciona a etapa — grupo não é escolhido aqui."
    )

    if "patlasv4proto-uo-etapas-adicionar" not in ids:
        idx = ids.index("patlasv4proto-uo-etapas-selecao") + 1
        fields.insert(idx, ADD_FIELD)
    else:
        btn = next(f for f in fields if f["id"] == "patlasv4proto-uo-etapas-adicionar")
        btn["htmlContent"] = HTML_ADICIONAR
        btn["sectionId"] = "sec-patlasv4proto-uo-documentos-aba"
        btn["hidden"] = True

    for rule in org.get("fieldVisibilityRules") or []:
        if rule.get("id") in (
            "rule-uo-show-ajustes-empresa",
            "rule-uo-hide-ajustes-nao-empresa",
        ):
            targets = rule.setdefault("targetFieldIds", [])
            if "patlasv4proto-uo-etapas-adicionar" not in targets:
                # Keep next to etapas-selecao in the list when present
                if "patlasv4proto-uo-etapas-selecao" in targets:
                    i = targets.index("patlasv4proto-uo-etapas-selecao")
                    targets.insert(i + 1, "patlasv4proto-uo-etapas-adicionar")
                else:
                    targets.append("patlasv4proto-uo-etapas-adicionar")

    # Remove método Incluir etapas — fluxo passa pelo botão Adicionar
    org["methods"] = [
        m for m in (org.get("methods") or []) if m.get("id") != "patlasv4proto-uo-meth-incluir-etapas"
    ]

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("patched", FORMS)


if __name__ == "__main__":
    main()
