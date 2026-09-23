# -*- coding: utf-8 -*-
"""Fecha gaps Discovery no protótipo Catálogo/Produto (backoffice)."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
GROUPS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json"

forms = json.loads(FORMS.read_text(encoding="utf-8"))
by_id = {f["id"]: f for f in forms}


def field(
    fid: str,
    label: str,
    typ: str,
    *,
    required: bool = False,
    read_only: bool = False,
    size: str = "medium",
    relevance: str = "common",
    hidden: bool = False,
    options: list | None = None,
    linked: str | None = None,
    multiple: bool = False,
    spec: str = "",
    text_long: bool = False,
    alert_variant: str | None = None,
    alert_title: str | None = None,
    alert_message: str | None = None,
) -> dict:
    f: dict = {
        "id": fid,
        "label": label,
        "type": typ,
        "size": size,
        "readOnly": read_only,
        "required": required,
        "multiple": multiple,
        "relevance": relevance,
        "spec": spec,
    }
    if hidden:
        f["hidden"] = True
    if options is not None:
        f["options"] = options
    if linked:
        f["linkedFormId"] = linked
    if text_long:
        f["textLong"] = True
    if alert_variant:
        f["alertVariant"] = alert_variant
        f["alertTitle"] = alert_title or ""
        f["alertMessage"] = alert_message or ""
    return f


# ---------- Produto: categoria + moeda + método recalcular ----------
prod = by_id["form-patlasv4-proto-cat-produto"]
prod_fields = prod["fields"]
ids = {f["id"] for f in prod_fields}

# Insert categoria after grupo
if "form-patlasv4-proto-cat-produto-categoria" not in ids:
    grupo_idx = next(i for i, f in enumerate(prod_fields) if f["id"].endswith("-grupo"))
    prod_fields.insert(
        grupo_idx + 1,
        field(
            "form-patlasv4-proto-cat-produto-categoria",
            "Categoria de Serviços",
            "reference",
            required=False,
            linked="form-patlasv4-proto-cat-categoria",
            spec=(
                "**Para que serve:** Classifica o produto por natureza (Cloud, Desenvolvimento…).\n\n"
                "**Onde é usado:** Filtros, relatórios, visão planilha.\n\n"
                "**Origem / de onde vem:** Classe Categoria de Serviços (MTI).\n\n"
                "**Regras:** Opcional. Distinto de Grupo (linha/oferta)."
            ),
        ),
    )

# Insert moeda universal before fator
if "form-patlasv4-proto-cat-produto-moeda-universal" not in ids:
    fator_idx = next(i for i, f in enumerate(prod_fields) if f["id"].endswith("-fator-conversao"))
    prod_fields.insert(
        fator_idx,
        field(
            "form-patlasv4-proto-cat-produto-moeda-universal",
            "Valor da moeda universal (R$)",
            "number",
            required=False,
            hidden=True,
            spec=(
                "**Para que serve:** Valor unitário do objeto/moeda universal (ex.: crédito de serviço R$ 282,58) usado no Tipo 3.\n\n"
                "**Onde é usado:** Cálculo do fator: `valor_unitário ÷ moeda_universal` (**RN-FAT-01**).\n\n"
                "**Origem / de onde vem:** Parametrização do objeto Tipo 3 / Catálogo Universal (MTI).\n\n"
                "**Regras:** Visível se Universal = Sim. Se métrica USN e moeda em real 1:1, usar 1 (fator típico 1)."
            ),
        ),
    )

fator = next(f for f in prod_fields if f["id"].endswith("-fator-conversao"))
fator["spec"] = (
    "**Para que serve:** Quantas unidades da moeda universal equivalem a 1 unidade deste produto (Tipo 3).\n\n"
    "**Onde é usado:** Orçamento/OS Tipo 3.\n\n"
    "**Origem / de onde vem:** **Calculado** — método «Recalcular fator» ou ao salvar: "
    "`valor_unitário ÷ valor_moeda_universal`. Ex.: 22679 ÷ 282,58 ≈ 80,25.\n\n"
    "**Regras:** Somente leitura. Vazio se Universal=Não (**RN-P-03**) ou moeda ≤ 0."
)

# Visibility rules for moeda
rules = prod.setdefault("fieldVisibilityRules", [])
rule_ids = {r.get("id") for r in rules}
if "rule-prod-moeda-univ" not in rule_ids:
    rules.append(
        {
            "id": "rule-prod-moeda-univ",
            "operator": "eq",
            "sourceFieldId": "form-patlasv4-proto-cat-produto-universal",
            "sourceKind": "boolean",
            "expectedBoolean": True,
            "action": "show",
            "targetFieldIds": ["form-patlasv4-proto-cat-produto-moeda-universal"],
        }
    )

# Update presets with categoria + moeda
for preset in prod.get("exampleValuePresets") or []:
    fv = preset.setdefault("fieldValues", {})
    if "form-patlasv4-proto-cat-produto-categoria" not in fv:
        if "Host" in str(fv.get("form-patlasv4-proto-cat-produto-grupo", "")):
            fv["form-patlasv4-proto-cat-produto-categoria"] = "Cloud / Infra"
        else:
            fv["form-patlasv4-proto-cat-produto-categoria"] = "Desenvolvimento"
    univ = fv.get("form-patlasv4-proto-cat-produto-universal")
    if univ and "form-patlasv4-proto-cat-produto-moeda-universal" not in fv:
        # Discovery example: serviço 22679 / 282.58
        vu = float(fv.get("form-patlasv4-proto-cat-produto-valor-unitario") or 0)
        if vu >= 20000:
            fv["form-patlasv4-proto-cat-produto-moeda-universal"] = 282.58
            fv["form-patlasv4-proto-cat-produto-fator-conversao"] = round(vu / 282.58, 2)
        elif fv.get("form-patlasv4-proto-cat-produto-metrica") == "USN":
            fv["form-patlasv4-proto-cat-produto-moeda-universal"] = 1
            fv["form-patlasv4-proto-cat-produto-fator-conversao"] = round(vu / 1, 2) if vu else 1
        else:
            # Simplifica UST 161.02 style — moeda do pacote
            moeda = 282.58
            fv["form-patlasv4-proto-cat-produto-moeda-universal"] = moeda
            if vu:
                fv["form-patlasv4-proto-cat-produto-fator-conversao"] = round(vu / moeda, 2)

methods = prod.setdefault("methods", [])
if not any(m["id"] == "patlasv4proto-prod-meth-recalc-fator" for m in methods):
    methods.insert(
        0,
        {
            "id": "patlasv4proto-prod-meth-recalc-fator",
            "name": "Recalcular fator",
            "icon": "calculate",
            "kind": "destaque",
            "spec": "Discovery: fator = valor unitário ÷ moeda universal. Só se Universal = Sim e moeda > 0.",
        },
    )

# ---------- Universal: observações ----------
univ = by_id["form-patlasv4-proto-cat-universal"]
u_ids = {f["id"] for f in univ["fields"]}
if "form-patlasv4-proto-cat-universal-observacoes" not in u_ids:
    univ["fields"].append(
        field(
            "form-patlasv4-proto-cat-universal-observacoes",
            "Observações",
            "text",
            size="large",
            text_long=True,
            spec="**Para que serve:** Notas livres do Catálogo Universal.\n\n**Regras:** Opcional. Pedido Discovery: observação em todas as telas.",
        )
    )
    for p in univ.get("exampleValuePresets") or []:
        p.setdefault("fieldValues", {})["form-patlasv4-proto-cat-universal-observacoes"] = (
            "Agrega catálogos Tipo 2 com métrica universal para contratos Tipo 3."
        )

# ---------- Parceria / Solução: observações ----------
for form_id, label_ex in [
    ("form-patlasv4-proto-cat-parceria", "Primeiro cadastro pela MTI. N parcerias no mesmo CNPJ."),
    ("form-patlasv4-proto-cat-solucao", "Fabricante em texto. Docs de apoio opcionais."),
]:
    form = by_id[form_id]
    fid = f"{form_id}-observacoes"
    if not any(f["id"] == fid for f in form["fields"]):
        form["fields"].append(
            field(
                fid,
                "Observações",
                "text",
                size="large",
                text_long=True,
                spec="**Para que serve:** Observações da tela.\n\n**Regras:** Opcional (Discovery: observação em todas as telas).",
            )
        )
        for p in form.get("exampleValuePresets") or []:
            p.setdefault("fieldValues", {})[fid] = label_ex

# ---------- Visão planilha (método form) ----------
PLANILHA_ID = "form-patlasv4-proto-metodo-cat-visao-planilha"
if PLANILHA_ID not in by_id:
    planilha = {
        "id": PLANILHA_ID,
        "name": "Catálogo — Visão planilha",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Discovery Luís: expandir visão tipo planilha à direita com todos os produtos, "
            "filtros (ex. complexidade média) e seleção em massa."
        ),
        "fields": [
            field(
                "patlasv4proto-mcat-grade-alerta",
                "Visão planilha",
                "alert",
                size="large",
                alert_variant="info",
                alert_title="Grade de produtos da versão",
                alert_message=(
                    "Filtre e selecione em massa. Use Exportar CSV para baixar a grade filtrada. "
                    "Edição inline: abra o produto pela caneta na linha."
                ),
                spec="Orienta UX Discovery.",
            ),
            field(
                "patlasv4proto-mcat-grade-filtro-tipo",
                "Filtro — Tipo",
                "textOptions",
                options=["(Todos)", "Licença", "Serviço"],
                relevance="highlight",
                spec="Filtro da grade.",
            ),
            field(
                "patlasv4proto-mcat-grade-filtro-complexidade",
                "Filtro — Complexidade",
                "textOptions",
                options=["(Todas)", "Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"],
                relevance="highlight",
                spec="Discovery: pegar todos de complexidade média de uma vez.",
            ),
            field(
                "patlasv4proto-mcat-grade-filtro-grupo",
                "Filtro — Grupo",
                "text",
                spec="Texto livre / ref visual (protótipo).",
            ),
            field(
                "patlasv4proto-mcat-grade-filtro-categoria",
                "Filtro — Categoria",
                "text",
                spec="Filtra por Categoria de Serviços.",
            ),
            {
                "id": "patlasv4proto-mcat-grade-produtos",
                "label": "Produtos (grade)",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "identity",
                "linkedFormId": "form-patlasv4-proto-cat-produto",
                "embeddedDisplay": "table",
                "spec": (
                    "**Para que serve:** Grade planilha com os produtos do catálogo/versão.\n\n"
                    "**Onde é usado:** Método Visão planilha no backoffice.\n\n"
                    "**Regras:** Colunas = campos do produto. Seleção múltipla para ações em massa."
                ),
            },
            field(
                "patlasv4proto-mcat-grade-selecionados",
                "Linhas selecionadas",
                "text",
                read_only=True,
                size="large",
                spec="Contagem após filtro/seleção (protótipo).",
            ),
        ],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-mcat-grade-exemplo",
                "name": "SIMPLIFICA v1.5 — filtro complexidade Alta",
                "fieldValues": {
                    "patlasv4proto-mcat-grade-filtro-tipo": "Serviço",
                    "patlasv4proto-mcat-grade-filtro-complexidade": "Alta",
                    "patlasv4proto-mcat-grade-filtro-grupo": "MTI Simplifica",
                    "patlasv4proto-mcat-grade-filtro-categoria": "Desenvolvimento",
                    "patlasv4proto-mcat-grade-produtos": [
                        "Elaborar plano de projeto",
                        "Analytics HST",
                    ],
                    "patlasv4proto-mcat-grade-selecionados": "2 de 80 exibidos (filtro Complexidade=Alta)",
                },
            }
        ],
        "activeExamplePresetId": "patlasv4proto-p-mcat-grade-exemplo",
        "methods": [
            {
                "id": "patlasv4proto-mcat-grade-meth-aplicar",
                "name": "Aplicar filtros",
                "icon": "filter_list",
                "kind": "destaque",
                "spec": "Atualiza a grade conforme filtros (protótipo: alerta + preset).",
            },
            {
                "id": "patlasv4proto-mcat-grade-meth-export",
                "name": "Exportar grade CSV",
                "icon": "download",
                "kind": "comum",
            },
            {
                "id": "patlasv4proto-mcat-grade-meth-selecionar",
                "name": "Selecionar todos filtrados",
                "icon": "select_all",
                "kind": "comum",
            },
        ],
    }
    forms.append(planilha)
    by_id[PLANILHA_ID] = planilha

# Wire Visão planilha method on catalogo
cat = by_id["form-patlasv4-proto-cat-catalogo"]
for m in cat.get("methods") or []:
    if m["id"] == "patlasv4proto-cat-meth-grade":
        m["inputFormId"] = PLANILHA_ID
        m["kind"] = "destaque"
        m["spec"] = (
            "Discovery: grade tipo planilha com filtros (complexidade, tipo, grupo) e seleção em massa."
        )
        break

# Also add Visão planilha on produto form for convenience? Only catalog is enough.

FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# class-groups
cg = json.loads(GROUPS.read_text(encoding="utf-8"))
ftg = cg.setdefault("formToGroup", {})
ftg[PLANILHA_ID] = "grp-atlas-produtos-met"
met_list = cg.setdefault("formsByGroup", {}).setdefault("grp-atlas-produtos-met", [])
if PLANILHA_ID not in met_list:
    met_list.append(PLANILHA_ID)
GROUPS.write_text(json.dumps(cg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print("OK forms + class-groups")
print("  produto: categoria, moeda, recalc method")
print("  universal/parceria/solucao: observacoes")
print("  visao planilha:", PLANILHA_ID)
