# -*- coding: utf-8 -*-
"""
Consolida protótipo Atlas F2 — completo e alinhado 31/08/2026.
- Reaplica patch 3108 (Parceria/Catálogo/Produto)
- Garante DELETE oculto e seções colapsadas
- Corrige Dados de Parceria por Produto (31/08)
- Limpa presets órfãos (categoria, período)
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
PATCH_3108 = ROOT / "scripts/_patch_f2_3108_classes_final.py"

F2_FORMS = [
    "form-patlasv4-proto-cat-parceria",
    "form-patlasv4-proto-cat-solucao",
    "form-patlasv4-proto-cat-catalogo",
    "form-patlasv4-proto-cat-produto",
    "form-patlasv4-proto-cat-dados-parceria",
]

LEGEND = (
    "`!` Parceiro · `#` MTI · `!#` Ambos · `?` Importado ERP (RO; admin edita) · "
    "MAIÚSCULAS = parceiro não vê"
)


def find_form(forms: list, fid: str) -> dict:
    for f in forms:
        if f.get("id") == fid:
            return f
    raise KeyError(fid)


def is_delete_field(fld: dict) -> bool:
    return str(fld.get("label", "")).startswith("DELETE")


def enforce_delete(form: dict) -> int:
    n = 0
    delete_sec = None
    for sec in form.get("sections", []):
        sid = sec.get("id", "")
        title = str(sec.get("title", ""))
        if "delete" in sid.lower() or "DELETE" in title or "fora" in title.lower():
            sec["collapsible"] = True
            sec["defaultCollapsed"] = True
            if not delete_sec:
                delete_sec = sec.get("id")
    for fld in form.get("fields", []):
        if is_delete_field(fld):
            fld["hidden"] = True
            fld["readOnly"] = True
            fld["required"] = False
            if delete_sec:
                fld["sectionId"] = delete_sec
            n += 1
    return n


def strip_orphan_keys(obj, keys: set[str]) -> None:
    if isinstance(obj, dict):
        for k in list(obj.keys()):
            if k in keys:
                del obj[k]
            else:
                strip_orphan_keys(obj[k], keys)
    elif isinstance(obj, list):
        for item in obj:
            strip_orphan_keys(item, keys)


def patch_dpp(form: dict) -> None:
    form["metadata"] = (
        "FINAL F2 2026-08-31 · RN-DP-01..05. Custo (parceiro) + Markup (MTI, sigilo) + "
        "% calculados (parceiro vê nos próprios produtos — 31/08) + Período mínimo."
    )
    alert = next(
        (f for f in form["fields"] if f.get("id") == "form-patlasv4-proto-cat-dados-parceria-alerta-proposta"),
        None,
    )
    if alert:
        alert["alertTitle"] = "RN-DP-01 — Condições comerciais canônicas"
        alert["alertMessage"] = (
            "Parceiro informa Custo e Período mínimo (col. planilha). MTI informa Markup e custo de mercado "
            "(parceiro não vê). % Parceiro e % MTI calculados — parceiro visualiza nos próprios produtos (31/08). "
            "CSV do parceiro sem markup/% MTI."
        )
        alert["spec"] = "RN-DP-01 / RN-DP-03 / RN-CSV-01 — validado 31/08/2026."

    specs = {
        "form-patlasv4-proto-cat-dados-parceria-custo-parceiro": (
            "**Para que serve:** Custo de entrada informado pelo parceiro.\n"
            "**Como usar:** Parceiro preenche no portal ou planilha (obrigatório).\n"
            "**Regras:** RN-DP-01. Participa do cálculo do valor unitário (custo × markup)."
        ),
        "form-patlasv4-proto-cat-dados-parceria-markup": (
            "**Para que serve:** Multiplicador aplicado pela MTI sobre o custo.\n"
            "**Como usar:** MTI preenche (ex.: 1,18). Parceiro não vê.\n"
            "**Regras:** RN-DP-03 partnerHidden. Gera % Parceiro e % MTI automaticamente."
        ),
        "form-patlasv4-proto-cat-dados-parceria-dist-parceiro": (
            "**Para que serve:** Percentual de rateio do parceiro.\n"
            "**Como usar:** Somente leitura — calculado a partir de custo + markup.\n"
            "**Regras:** 31/08: parceiro **visualiza** nos próprios produtos."
        ),
        "form-patlasv4-proto-cat-dados-parceria-dist-mti": (
            "**Para que serve:** Percentual de rateio da MTI.\n"
            "**Como usar:** Somente leitura — calculado.\n"
            "**Regras:** 31/08: parceiro **visualiza** nos próprios produtos."
        ),
        "form-patlasv4-proto-cat-dados-parceria-periodo-minimo": (
            "**Para que serve:** Compromisso mínimo de contratação em meses.\n"
            "**Como usar:** Parceiro seleciona 12, 24, 36, 48 ou 60.\n"
            "**Regras:** RN-DP-02. Obrigatório. Perpétuo = Modelo de Venda, não aqui."
        ),
    }

    for fld in form["fields"]:
        fid = fld.get("id", "")
        if fid == "form-patlasv4-proto-cat-dados-parceria-dist-parceiro":
            fld["label"] = "% Parceiro"
            fld["readOnly"] = True
            fld.pop("partnerHidden", None)
        if fid == "form-patlasv4-proto-cat-dados-parceria-dist-mti":
            fld["label"] = "% MTI"
            fld["readOnly"] = True
            fld.pop("partnerHidden", None)
        if fid == "form-patlasv4-proto-cat-dados-parceria-markup":
            fld["partnerHidden"] = True
        if fid == "form-patlasv4-proto-cat-dados-parceria-custo-mercado":
            fld["partnerHidden"] = True
        if fid in specs:
            base = specs[fid]
            fld["spec"] = f"**Classe:** Dados de Parceria por Produto (F2)\n**Legenda:** {LEGEND}\n{base}\n**Validação:** 31/08/2026"

    # Presets: período = valor da option (12, não "12 meses")
    for p in form.get("exampleValuePresets", []):
        fv = p.get("fieldValues", {})
        pm = fv.get("form-patlasv4-proto-cat-dados-parceria-periodo-minimo")
        if isinstance(pm, str) and "meses" in pm.lower():
            fv["form-patlasv4-proto-cat-dados-parceria-periodo-minimo"] = pm.split()[0]


def patch_produto_structure(form: dict) -> None:
    # Remove seção duplicada vazia
    form["sections"] = [s for s in form.get("sections", []) if s.get("id") != "sec-prod-cond-parc"]

    # Valor unitário: exibido calculado (RO) — parceiro vê, não edita fórmula
    vu = next((f for f in form["fields"] if f.get("id") == "form-patlasv4-proto-cat-produto-valor-unitario"), None)
    if vu:
        vu["readOnly"] = True

    # Limpar presets
    orphan = {"form-patlasv4-proto-cat-produto-categoria"}
    for p in form.get("exampleValuePresets", []):
        strip_orphan_keys(p, orphan)

    # Exemplo DPP embutido no preset serviço
    for p in form.get("exampleValuePresets", []):
        if p.get("id") == "form-patlasv4-proto-cat-produto-p-serv":
            p.setdefault("embeddedRowsByFieldId", {})
            p["embeddedRowsByFieldId"]["form-patlasv4-proto-cat-produto-dados-parceria"] = [
                {
                    "form-patlasv4-proto-cat-dados-parceria-parceria": "MTI SIMPLIFICA",
                    "form-patlasv4-proto-cat-dados-parceria-solucao": "MTI Simplifica",
                    "form-patlasv4-proto-cat-dados-parceria-produto": "Elaborar plano de projeto",
                    "form-patlasv4-proto-cat-dados-parceria-custo-parceiro": 120,
                    "form-patlasv4-proto-cat-dados-parceria-markup": 1.34,
                    "form-patlasv4-proto-cat-dados-parceria-dist-parceiro": 80,
                    "form-patlasv4-proto-cat-dados-parceria-dist-mti": 20,
                    "form-patlasv4-proto-cat-dados-parceria-periodo-minimo": "24",
                    "form-patlasv4-proto-cat-dados-parceria-ativo": True,
                }
            ]


def patch_catalogo_structure(form: dict) -> None:
    vf = next((f for f in form["fields"] if f.get("id") == "form-patlasv4-proto-cat-catalogo-variacao"), None)
    if vf:
        vf["hidden"] = False
        vf["sectionId"] = "sec-cat-variacao"

    ff = next(
        (f for f in form["fields"] if f.get("id") == "form-patlasv4-proto-cat-catalogo-faixas-complexidade"),
        None,
    )
    if ff:
        ff["sectionId"] = "sec-cat-variacao"

    # Presets: toggles legado off; individualizado coerente
    orphan = {
        "form-patlasv4-proto-cat-catalogo-toggle-servicos",
        "form-patlasv4-proto-cat-catalogo-toggle-licenca",
        "form-patlasv4-proto-cat-catalogo-ultima-notificacao",
    }
    for p in form.get("exampleValuePresets", []):
        fv = p.get("fieldValues", {})
        for k in list(fv.keys()):
            if k in orphan:
                del fv[k]
        if fv.get("form-patlasv4-proto-cat-catalogo-toggle-universal") is True:
            fv.setdefault("form-patlasv4-proto-cat-catalogo-toggle-individualizado", True)
        elif fv.get("form-patlasv4-proto-cat-catalogo-toggle-universal") is False:
            fv["form-patlasv4-proto-cat-catalogo-toggle-individualizado"] = True
        strip_orphan_keys(p.get("embeddedRowsByFieldId", {}), {"form-patlasv4-proto-cat-produto-categoria"})


def patch_parceria_structure(form: dict) -> None:
    alert = next(
        (f for f in form["fields"] if f.get("id") == "form-patlasv4-proto-cat-parceria-alerta-visao"),
        None,
    )
    if alert:
        alert["hidden"] = True  # redundante com alerta-import


def main() -> None:
    # Reaplicar specs/campos 31/08
    r = subprocess.run([sys.executable, str(PATCH_3108)], cwd=str(ROOT))
    if r.returncode != 0:
        sys.exit(r.returncode)

    forms = json.loads(FORMS.read_text(encoding="utf-8"))

    total_del = 0
    for fid in F2_FORMS:
        f = find_form(forms, fid)
        total_del += enforce_delete(f)

    patch_dpp(find_form(forms, "form-patlasv4-proto-cat-dados-parceria"))
    patch_produto_structure(find_form(forms, "form-patlasv4-proto-cat-produto"))
    patch_catalogo_structure(find_form(forms, "form-patlasv4-proto-cat-catalogo"))
    patch_parceria_structure(find_form(forms, "form-patlasv4-proto-cat-parceria"))

    # Solução: DELETE oculto
    enforce_delete(find_form(forms, "form-patlasv4-proto-cat-solucao"))

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"OK protótipo F2 completo — {total_del} campos DELETE garantidos ocultos")
    print(f"   {FORMS}")


if __name__ == "__main__":
    main()
