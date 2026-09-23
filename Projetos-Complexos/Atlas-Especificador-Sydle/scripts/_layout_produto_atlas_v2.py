# -*- coding: utf-8 -*-
"""
Reorganiza disposição da classe Produto no épico Atlas V2.
- Aba 1 «Produto» com sub-seções claras
- Aba 2 «Dados de Parceria por Produto» somente com o vínculo DPP
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/atlas-v2/forms.json"
FORM_ID = "form-patlasv4-proto-cat-produto"

# Tab principal + sub-seções
TAB_PROD = "sec-prod-dados"
TAB_DPP = "sec-prod-dpp"

SUB_CTX = "sec-prod-sub-contexto"
SUB_IDENT = "sec-prod-sub-ident"
SUB_CLASS = "sec-prod-sub-class"
SUB_PREC = "sec-prod-sub-prec"
SUB_COND = "sec-prod-sub-cond"
SUB_COD = "sec-prod-sub-codigos"

SECTIONS = [
    {"id": TAB_PROD, "title": "Produto", "icon": "inventory_2"},
    {"id": SUB_CTX, "title": "Contexto do catálogo", "icon": "account_tree", "parentSectionId": TAB_PROD},
    {"id": SUB_IDENT, "title": "Identificação", "icon": "badge", "parentSectionId": TAB_PROD},
    {"id": SUB_CLASS, "title": "Classificação comercial", "icon": "sell", "parentSectionId": TAB_PROD},
    {"id": SUB_PREC, "title": "Precificação", "icon": "payments", "parentSectionId": TAB_PROD},
    {"id": SUB_COND, "title": "Características do serviço", "icon": "rule", "parentSectionId": TAB_PROD},
    {"id": SUB_COD, "title": "Códigos do item (N1)", "icon": "qr_code", "parentSectionId": TAB_PROD},
    {"id": TAB_DPP, "title": "Dados de Parceria por Produto", "icon": "handshake"},
]

# Ordem canônica dos campos por seção
FIELD_ORDER: list[tuple[str, str]] = [
    # Contexto
    ("form-patlasv4-proto-cat-produto-catalogo", SUB_CTX),
    ("form-patlasv4-proto-cat-produto-parceria", SUB_CTX),
    ("form-patlasv4-proto-cat-produto-solucao", SUB_CTX),
    ("form-patlasv4-proto-cat-produto-versao-catalogo", SUB_CTX),
    ("form-patlasv4-proto-cat-produto-vertical", SUB_CTX),
    ("form-patlasv4-proto-cat-produto-tipo-oferta", SUB_CTX),
    # Identificação
    ("form-patlasv4-proto-cat-produto-codigo-atlas", SUB_IDENT),
    ("form-patlasv4-proto-cat-produto-identificador", SUB_IDENT),
    ("form-patlasv4-proto-cat-produto-descricao", SUB_IDENT),
    ("form-patlasv4-proto-cat-produto-nome-comercializacao", SUB_IDENT),
    ("form-patlasv4-proto-cat-produto-part-number", SUB_IDENT),
    ("form-patlasv4-proto-cat-produto-tipo", SUB_IDENT),
    ("form-patlasv4-proto-cat-produto-status", SUB_IDENT),
    ("form-patlasv4-proto-cat-produto-ativo", SUB_IDENT),
    # Classificação
    ("form-patlasv4-proto-cat-produto-grupo", SUB_CLASS),
    ("form-patlasv4-proto-cat-produto-modelo-venda", SUB_CLASS),
    ("form-patlasv4-proto-cat-produto-alerta-perpetuo", SUB_CLASS),
    ("form-patlasv4-proto-cat-produto-cobranca", SUB_CLASS),
    ("form-patlasv4-proto-cat-produto-metrica", SUB_CLASS),
    # Precificação
    ("form-patlasv4-proto-cat-produto-valor-unitario", SUB_PREC),
    ("form-patlasv4-proto-cat-produto-data-atualizacao-preco", SUB_PREC),
    ("form-patlasv4-proto-cat-produto-moeda-universal", SUB_PREC),
    # Condicionais serviço (+ flags técnicas ocultas usadas nas regras de visibilidade)
    ("form-patlasv4-proto-cat-produto-cfg-usa-complexidade", SUB_COND),
    ("form-patlasv4-proto-cat-produto-cfg-usa-peso", SUB_COND),
    ("form-patlasv4-proto-cat-produto-cfg-exige-qtde", SUB_COND),
    ("form-patlasv4-proto-cat-produto-complexidade", SUB_COND),
    ("form-patlasv4-proto-cat-produto-coeficiente-complexidade", SUB_COND),
    ("form-patlasv4-proto-cat-produto-peso", SUB_COND),
    ("form-patlasv4-proto-cat-produto-qtde-metrica", SUB_COND),
    ("form-patlasv4-proto-cat-produto-consumo-os", SUB_COND),
    # Códigos
    ("form-patlasv4-proto-cat-produto-cod-siag-item", SUB_COD),
    ("form-patlasv4-proto-cat-produto-cod-protheus-item", SUB_COD),
    # DPP — aba exclusiva
    ("form-patlasv4-proto-cat-produto-dados-parceria", TAB_DPP),
]


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    form = next(f for f in forms if f.get("id") == FORM_ID)

    by_id = {fld["id"]: fld for fld in form.get("fields", [])}
    order_map = {fid: sec for fid, sec in FIELD_ORDER}

    # Remove alerta DPP redundante (a aba já deixa o vínculo explícito)
    drop = {"form-patlasv4-proto-cat-produto-alerta-dpp"}

    ordered: list[dict] = []
    seen: set[str] = set()
    for fid, sec in FIELD_ORDER:
        fld = by_id.get(fid)
        if not fld:
            continue
        fld = {**fld, "sectionId": sec}
        ordered.append(fld)
        seen.add(fid)

    # Campos restantes (não listados) → Identificação, exceto drops
    for fld in form.get("fields", []):
        fid = fld.get("id")
        if not fid or fid in seen or fid in drop:
            continue
        sec = order_map.get(fid, SUB_IDENT)
        ordered.append({**fld, "sectionId": sec})

    # DPP: edição habilitada na aba (cadastro embutido)
    dpp = next((f for f in ordered if f.get("id") == "form-patlasv4-proto-cat-produto-dados-parceria"), None)
    if dpp:
        dpp["readOnly"] = False
        dpp["label"] = "Dados de Parceria por Produto"
        dpp["embeddedDisplay"] = "table"
        dpp["relevance"] = "highlight"

    form["sectionLayout"] = "tabs"
    form["sections"] = SECTIONS
    form["fields"] = ordered

    meta = form.get("metadata") or ""
    if "disposição" not in meta.lower():
        form["metadata"] = (
            (meta.rstrip() + " · ") if meta else ""
        ) + "Disposição: aba Produto (sub-seções) + aba exclusiva Dados de Parceria por Produto."

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("OK Produto — layout reorganizado")
    print(f"  abas: {[s['title'] for s in SECTIONS if not s.get('parentSectionId')]}")
    print(f"  sub-seções: {[s['title'] for s in SECTIONS if s.get('parentSectionId')]}")
    print(f"  campos: {len(ordered)}")
    for sec in SECTIONS:
        n = sum(1 for f in ordered if f.get("sectionId") == sec["id"] and f.get("type") != "alert")
        print(f"    {sec['title']}: {n}")


if __name__ == "__main__":
    main()
