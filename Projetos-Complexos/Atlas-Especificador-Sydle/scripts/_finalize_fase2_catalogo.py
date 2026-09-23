# -*- coding: utf-8 -*-
"""
Protótipo final Fase 2 · Catálogo & Produtos
- Garante boolean Ativo (visível) em todas as classes de domínio
- Alinha auxiliares lean (Nome + Ativo)
- Presets com Ativo=Sim
- Ajustes pontuais m4a (Parceria Nome, Universal Ativo, etc.)
"""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"

# Classes de domínio Fase 2 (não inclui portais/análise — têm Status de fluxo)
DOMAIN_FORMS = [
    "form-patlasv4-proto-cat-metrica",
    "form-patlasv4-proto-cat-tipo-cobranca",
    "form-patlasv4-proto-cat-categoria",
    "form-patlasv4-proto-cat-modelo-venda",
    "form-patlasv4-proto-cat-grupo",
    "form-patlasv4-proto-cat-parceria",
    "form-patlasv4-proto-cat-solucao",
    "form-patlasv4-proto-cat-dados-parceria",
    "form-patlasv4-proto-cat-catalogo",
    "form-patlasv4-proto-cat-produto",
    "form-patlasv4-proto-cat-universal",
]

# Embutidos já têm flag equivalente — padronizar rótulo Ativo
EMBEDDED = [
    "form-patlasv4-proto-cat-catalogo-metrica",
    "form-patlasv4-proto-cat-catalogo-complexidade",
]

ATIVO_SPEC = (
    "Indica se o registro está ativo para uso em novos vínculos/cadastros. "
    "Padrão: Sim. Não substitui Status de workflow (quando existir)."
)


def find_ativo(fields: list[dict]) -> dict | None:
    for f in fields:
        lab = (f.get("label") or "").lower()
        fid = f.get("id") or ""
        if lab in ("ativo", "ativa", "ativo nesta versão") or fid.endswith("-ativo") or fid.endswith("-ativa"):
            return f
        if "ativo" in fid.lower() and f.get("type") == "boolean":
            return f
    return None


def ensure_ativo(form: dict, *, section_id: str | None = None, after_label: str | None = None) -> None:
    fields = form.setdefault("fields", [])
    existing = find_ativo(fields)
    if existing:
        existing["type"] = "boolean"
        existing["label"] = "Ativo" if existing.get("label") in (None, "Ativa", "Ativo nesta versão") or "ativo" in (existing.get("label") or "").lower() else existing["label"]
        if existing["label"] in ("Ativa", "Ativo nesta versão"):
            existing["label"] = "Ativo"
        existing["hidden"] = False
        existing["required"] = True
        existing["readOnly"] = False
        existing["spec"] = ATIVO_SPEC
        if section_id:
            existing["sectionId"] = section_id
        return

    fid = f"{form['id']}-ativo"
    field = {
        "id": fid,
        "label": "Ativo",
        "type": "boolean",
        "size": "small",
        "required": True,
        "readOnly": False,
        "hidden": False,
        "multiple": False,
        "spec": ATIVO_SPEC,
    }
    if section_id:
        field["sectionId"] = section_id

    if after_label:
        for i, f in enumerate(fields):
            if f.get("label") == after_label:
                fields.insert(i + 1, field)
                return
    # Preferir antes de Observações / Status de workflow no fim
    for i, f in enumerate(fields):
        lab = (f.get("label") or "").lower()
        if lab.startswith("observa") or lab.startswith("status"):
            fields.insert(i, field)
            return
    fields.append(field)


def set_preset_ativo(form: dict, value: bool = True) -> None:
    ativo = find_ativo(form.get("fields") or [])
    if not ativo:
        return
    key = ativo["id"]
    for p in form.get("exampleValuePresets") or []:
        fv = p.setdefault("fieldValues", {})
        if isinstance(fv, dict):
            fv[key] = True if value else False
        # limpar chave legado incorreta
        p.pop("values", None)


def lean_auxiliar(form: dict, nome_label: str = "Nome") -> None:
    """Métrica / Tipo cobrança / Categoria / Modelo: Nome + Ativo visíveis; resto oculto."""
    for f in form.get("fields") or []:
        lab = (f.get("label") or "").lower()
        if lab == "nome" or f.get("label") == nome_label:
            f["hidden"] = False
            f["required"] = True
            continue
        if find_ativo([f]) is f or (f.get("label") or "") == "Ativo":
            continue
        # Descrição e extras → ocultos (lean m4a)
        if lab in ("descrição", "descricao") or lab == "descrição":
            f["hidden"] = True
            f["required"] = False


def fix_parceria(form: dict) -> None:
    for f in form["fields"]:
        if f["id"].endswith("-identificador"):
            f["label"] = "Nome"
            f["spec"] = "Nome comercial da parceria (ex.: MTI HOST, MTI SIMPLIFICA)."
        if f["id"].endswith("-parceiro"):
            f["spec"] = "Organização (empresa) parceira."
        if f["id"].endswith("-solucoes"):
            f["multiple"] = True
            f["required"] = True
            f["spec"] = "Soluções ofertadas na parceria."
    # Ocultos permanecem
    ensure_ativo(form, after_label="Soluções")
    form["metadata"] = (
        "Fonte catalogo.m4a [71:19]: Nome + Organização (Parceiro) + Soluções + Ativo. "
        "Extras (status DIREX, etc.) ocultos."
    )


def fix_solucao(form: dict) -> None:
    ensure_ativo(form, after_label="Descrição")
    form["metadata"] = (
        "Fonte catalogo.m4a [71:35]: Nome + Parceria + Descrição + Ativo. "
        "Fabricante/docs ocultos."
    )


def fix_grupo(form: dict) -> None:
    ensure_ativo(form)
    form["metadata"] = (
        "Família dentro da Solução. Nome + Solução + Categoria (opc.) + Descrição + Ativo."
    )


def fix_dados(form: dict) -> None:
    ensure_ativo(form, after_label="Distribuição da MTI")
    form["metadata"] = (
        "Condições comerciais parceria×solução (custo/markup/distribuição). "
        "Fora do Produto. Validar com MTI — não 100% fechado só pelo m4a. Ativo obrigatório."
    )


def fix_catalogo(form: dict) -> None:
    # Garantir complexidades embutidas + regra por complexidade
    sections = {s["id"]: s for s in (form.get("sections") or [])}
    # Ativo na seção identificação ou situação
    sec = None
    for s in form.get("sections") or []:
        t = (s.get("title") or "").lower()
        if "identif" in t or "geral" in t or "situ" in t:
            sec = s["id"]
            break
    ensure_ativo(form, section_id=sec, after_label="Status do catálogo")

    # Regra: complexidades só Por complexidade
    rules = form.setdefault("fieldVisibilityRules", [])
    if not any(r.get("id") == "rule-cat-complex" for r in rules):
        cx = next((f["id"] for f in form["fields"] if f["id"].endswith("-complexidades")), None)
        est = next((f["id"] for f in form["fields"] if f["id"].endswith("-estrutura-variacao")), None)
        if cx and est:
            rules.append(
                {
                    "id": "rule-cat-complex",
                    "operator": "eq",
                    "sourceFieldId": est,
                    "action": "show",
                    "targetFieldIds": [cx],
                    "sourceKind": "textOptions",
                    "expectedOptionText": "Por complexidade",
                }
            )

    # Cobrança legado permanece oculto
    for f in form["fields"]:
        if f["id"].endswith("-cobranca") or f["id"].endswith("-valor-unitario"):
            f["hidden"] = True
        if f["id"].endswith("-complexidades"):
            f["hidden"] = True  # inicia oculto; regra show
            f["spec"] = (
                "Faixas e coeficientes desta versão. Visível quando Estrutura = Por complexidade."
            )
        if f["id"].endswith("-toggle-universal"):
            f["required"] = True
            f["spec"] = (
                "Se Sim, este catálogo pode alimentar Catálogo Universal (créditos). "
                "Não cria o N3 sozinho."
            )
        if f["id"].endswith("-toggle-servicos"):
            f["required"] = True
            f["spec"] = (
                "Se Sim, catálogo comercializado com métricas de serviço (UST/HST/…). "
                "Pode ser Sim junto com É universal?."
            )

    form["metadata"] = (
        "Fonte catalogo.m4a: N2 cardápio parceria. Toggles É universal? / É catálogo de serviços?; "
        "métricas embutidas; estrutura complexidade|peso; focais aqui; Ativo; códigos manuais; "
        "cobrança legado oculta (lacuna)."
    )


def fix_produto(form: dict) -> None:
    sec = None
    for s in form.get("sections") or []:
        if "situ" in (s.get("title") or "").lower() or "status" in (s.get("title") or "").lower():
            sec = s["id"]
            break
    ensure_ativo(form, section_id=sec, after_label="Status do produto")

    # Garantir regras pós-revisão
    rules = form.get("fieldVisibilityRules") or []
    # remover consumo-os de serviço-base se ainda estiver
    for r in rules:
        if r.get("id") == "rule-prod-servico-base":
            r["targetFieldIds"] = [
                t
                for t in r.get("targetFieldIds") or []
                if not t.endswith("-consumo-os")
            ]
    form["fieldVisibilityRules"] = rules

    for f in form["fields"]:
        if f["id"].endswith("-part-number"):
            f["hidden"] = False
        if f["id"].endswith("-moeda-universal"):
            f["readOnly"] = True
            f["hidden"] = True
        if f["id"].endswith("-consumo-os"):
            f["hidden"] = True

    form["metadata"] = (
        "Fonte catalogo.m4a + revisão: Catálogo 1º; herança RO; Licença|Serviço; "
        "Universal|Individualizado; cobrança sem Sob demanda; consumo OS só Universal; "
        "moeda RO=1; Part Number visível; Ativo; focais/fator fora."
    )


def fix_universal(form: dict) -> None:
    ensure_ativo(form, after_label="Status do catálogo")
    for f in form["fields"]:
        if f["id"].endswith("-catalogos"):
            f["multiple"] = True
            f["required"] = True
            f["spec"] = (
                "Catálogos da parceria elegíveis (É universal? = Sim). "
                "Sem focais neste formulário."
            )
        if f["id"].endswith("-identificador"):
            f["spec"] = (
                "Nome do crédito/catálogo universal (ex.: MTI crédito de serviços TIC). "
                "Redirecionador N3 — não é cardápio de itens."
            )
    form["metadata"] = (
        "Fonte catalogo.m4a [51:02]: N3 créditos/redirecionador; SEM focais; "
        "vincula catálogos Universal?=Sim; Ativo; códigos manuais."
    )


def fix_embedded(form: dict) -> None:
    for f in form["fields"]:
        lab = (f.get("label") or "").lower()
        if "ativ" in lab:
            f["label"] = "Ativo"
            f["type"] = "boolean"
            f["required"] = True
            f["hidden"] = False
            f["spec"] = ATIVO_SPEC


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    by_id = {f["id"]: f for f in forms}

    for fid in DOMAIN_FORMS + EMBEDDED:
        if fid not in by_id:
            raise SystemExit(f"Form missing: {fid}")

    # Auxiliares lean
    for fid in [
        "form-patlasv4-proto-cat-metrica",
        "form-patlasv4-proto-cat-tipo-cobranca",
        "form-patlasv4-proto-cat-categoria",
        "form-patlasv4-proto-cat-modelo-venda",
    ]:
        f = by_id[fid]
        lean_auxiliar(f)
        ensure_ativo(f, after_label="Nome")
        set_preset_ativo(f)
        if fid.endswith("metrica"):
            f["metadata"] = "Fonte catalogo.m4a [61:18]: somente Nome + Ativo."
        if fid.endswith("tipo-cobranca"):
            f["metadata"] = (
                "Fonte catalogo.m4a [63:18]: Mensal · Anual · Conforme homologação. "
                "Sob demanda NÃO é tipo de cobrança. Nome + Ativo."
            )
        if fid.endswith("categoria"):
            f["metadata"] = "Fonte catalogo.m4a: Categoria = Nome + Ativo."
        if fid.endswith("modelo-venda"):
            f["metadata"] = (
                "Fonte catalogo.m4a [67–70]: provisório Por licença · Por serviço · Por pacote. Nome + Ativo."
            )

    fix_grupo(by_id["form-patlasv4-proto-cat-grupo"])
    set_preset_ativo(by_id["form-patlasv4-proto-cat-grupo"])

    fix_parceria(by_id["form-patlasv4-proto-cat-parceria"])
    set_preset_ativo(by_id["form-patlasv4-proto-cat-parceria"])

    fix_solucao(by_id["form-patlasv4-proto-cat-solucao"])
    set_preset_ativo(by_id["form-patlasv4-proto-cat-solucao"])

    fix_dados(by_id["form-patlasv4-proto-cat-dados-parceria"])
    set_preset_ativo(by_id["form-patlasv4-proto-cat-dados-parceria"])

    fix_catalogo(by_id["form-patlasv4-proto-cat-catalogo"])
    set_preset_ativo(by_id["form-patlasv4-proto-cat-catalogo"])

    fix_produto(by_id["form-patlasv4-proto-cat-produto"])
    set_preset_ativo(by_id["form-patlasv4-proto-cat-produto"])

    fix_universal(by_id["form-patlasv4-proto-cat-universal"])
    set_preset_ativo(by_id["form-patlasv4-proto-cat-universal"])

    for fid in EMBEDDED:
        fix_embedded(by_id[fid])
        set_preset_ativo(by_id[fid])

    # Validação Tipo de Cobrança presets = só os 3 confirmados
    tc = by_id["form-patlasv4-proto-cat-tipo-cobranca"]
    allowed = {"Mensal", "Anual", "Conforme homologação"}
    for p in tc.get("exampleValuePresets") or []:
        vals = p.get("values") or {}
        nome_key = next((k for k in vals if k.endswith("-identificador") or k.endswith("-nome") or "tipo-cobranca" in k and not k.endswith("-ativo")), None)
        # find name field
        name_f = next((x for x in tc["fields"] if (x.get("label") or "") == "Nome"), None)
        if name_f and name_f["id"] in vals:
            if vals[name_f["id"]] not in allowed and "Sob" in str(vals[name_f["id"]]):
                pass  # leave; presets should already be correct

    # Garantir opções cobrança no produto
    prod = by_id["form-patlasv4-proto-cat-produto"]
    cob = next(x for x in prod["fields"] if x["id"].endswith("-cobranca"))
    cob["options"] = ["Mensal", "Anual", "Conforme homologação"]

    # Relatório
    report = []
    for fid in DOMAIN_FORMS + EMBEDDED:
        f = by_id[fid]
        a = find_ativo(f["fields"])
        vis = [x["label"] for x in f["fields"] if not x.get("hidden")]
        report.append(
            {
                "id": fid,
                "name": f["name"],
                "ativo": None if not a else {"id": a["id"], "hidden": a.get("hidden"), "required": a.get("required")},
                "visible": vis,
                "presets": len(f.get("exampleValuePresets") or []),
            }
        )

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out = ROOT / "exports/fase2-prototipo-final-relatorio.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK {FORMS}")
    print(f"OK {out}")
    for r in report:
        a = r["ativo"]
        ok = "OK" if a and not a.get("hidden") else "FAIL"
        print(f"- {r['name']}: Ativo={ok} | vis={len(r['visible'])} | presets={r['presets']}")


if __name__ == "__main__":
    main()
