# -*- coding: utf-8 -*-
"""Corrige Produto conforme revisão catalogo.m4a (Luís)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
FORM_ID = "form-patlasv4-proto-cat-produto"


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    prod = next(f for f in forms if f["id"] == FORM_ID)

    for f in prod["fields"]:
        fid = f["id"]
        if fid == f"{FORM_ID}-part-number":
            # [12:47] Part Number no controle do produto (não só Licença)
            f["hidden"] = False
            f["spec"] = (
                "Campo confirmado na fonte. Obrigatoriedade/formato = lacuna (Protheus). "
                "Não copiar automaticamente o Nome do produto."
            )
        if fid == f"{FORM_ID}-consumo-os":
            f["spec"] = (
                "Consumo sob demanda / via OS (créditos). NÃO é Tipo de cobrança [46:46–47:20]. "
                "Exibir somente quando Tipo de oferta = Universal [49:40]."
            )
            f["hidden"] = True
        if fid == f"{FORM_ID}-moeda-universal":
            f["readOnly"] = True
            f["spec"] = (
                "Exibir se Tipo de oferta = Universal [53:08]. Luís: valor sempre 1 (preenchido). "
                "Somente leitura. Sem fator no cadastro N3 [48:06]."
            )
            f["hidden"] = True

    # Regras de visibilidade
    new_rules = []
    for r in prod.get("fieldVisibilityRules") or []:
        rid = r.get("id")
        if rid == "rule-prod-sku-licenca":
            # Part Number passa a ser sempre visível
            continue
        if rid == "rule-prod-servico-base":
            # Remover consumo-os: sob demanda só Universal [49:40]
            r = {
                **r,
                "targetFieldIds": [
                    t
                    for t in r.get("targetFieldIds") or []
                    if t != f"{FORM_ID}-consumo-os"
                ],
            }
            new_rules.append(r)
            continue
        if rid == "rule-prod-universal-consumo":
            # consumo-os + moeda quando Universal
            r = {
                **r,
                "targetFieldIds": [
                    f"{FORM_ID}-consumo-os",
                    f"{FORM_ID}-moeda-universal",
                ],
                "action": "show",
            }
            new_rules.append(r)
            continue
        if rid == "rule-prod-moeda-universal":
            # Redundante com universal-consumo; manter só uma
            continue
        new_rules.append(r)

    # Garante regra Universal se sumiu
    if not any(r.get("id") == "rule-prod-universal-consumo" for r in new_rules):
        new_rules.append(
            {
                "id": "rule-prod-universal-consumo",
                "operator": "eq",
                "sourceFieldId": f"{FORM_ID}-tipo-oferta",
                "action": "show",
                "targetFieldIds": [
                    f"{FORM_ID}-consumo-os",
                    f"{FORM_ID}-moeda-universal",
                ],
                "sourceKind": "textOptions",
                "expectedOptionText": "Universal",
            }
        )

    prod["fieldVisibilityRules"] = new_rules
    prod["metadata"] = (
        "Fonte catalogo.m4a: Catálogo primeiro [55:01]; Parceria/Solução/versão herdadas; "
        "tipo Licença|Serviço; oferta Universal|Individualizado; cobrança Mensal/Anual/Conforme homologação; "
        "métrica filtrada; qtde genérica; complexidade/peso só Serviço+estrutura catálogo; "
        "focais NÃO no produto [50:18]; fator NÃO no cadastro N3 [48:06]; "
        "moeda universal RO=1 se Universal [53:08]; consumo OS só se Universal [49:40]; "
        "Part Number sempre visível (obrig. = lacuna Protheus)."
    )

    # Preset host Individualizado: sem consumo-os
    for p in prod.get("exampleValuePresets") or []:
        vals = p.get("values") or {}
        if p.get("id") == f"{FORM_ID}-p-host":
            vals.pop(f"{FORM_ID}-consumo-os", None)
        if p.get("id") == f"{FORM_ID}-p-lic":
            vals.pop(f"{FORM_ID}-consumo-os", None)
            vals.pop(f"{FORM_ID}-moeda-universal", None)

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK forms.json Produto corrigido")
    print("Regras:", [r["id"] for r in new_rules])


if __name__ == "__main__":
    main()
