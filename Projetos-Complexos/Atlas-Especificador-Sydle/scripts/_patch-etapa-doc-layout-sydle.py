# -*- coding: utf-8 -*-
"""Alinha Etapa de Documentação ao layout Sydle: seleção de grupos + lista com tipos."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPIC = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS_PATH = EPIC / "forms.json"

FORM_ETAPA = "form-patlasv4-proto-cat-etapa-documentacional"
FORM_GRUPO = "form-patlasv4-proto-cat-etapa-grupo"
FORM_TIPO = "form-patlasv4-proto-cat-etapa-tipo"
FORM_TDOC = "form-patlasv4-proto-tipo-documento"

GRUPOS_OPTS = [
    "Habilitação Jurídica",
    "Qualificação Técnica",
    "Qualificação Econômica e Financeira",
    "Compliance (adendo)",
    "Pré-rito parceria",
    "Documentos de execução",
]

BTN_INCLUIR = """<div class="proto-add-grupos-wrap">
  <button type="button" class="btn-add-grupos" data-action="incluir-grupos-etapa">
    <span aria-hidden="true">+</span> Incluir
  </button>
</div>
<style>
  .proto-add-grupos-wrap { margin: 0 0 8px; display: flex; align-items: flex-end; min-height: 2.4rem; }
  .btn-add-grupos {
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
  }
  .btn-add-grupos:hover { background-color: #565656; }
</style>"""


def tipos_from_catalog(forms: list[dict]) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {g: [] for g in GRUPOS_OPTS}
    tdoc = next((f for f in forms if f.get("id") == FORM_TDOC), None)
    if not tdoc:
        return out
    for p in tdoc.get("exampleValuePresets") or []:
        fv = p.get("fieldValues") or {}
        if fv.get("patlasv4proto-tdoc-ativo") is False:
            continue
        grupo = fv.get("mqlh5j3aabnkci")
        nome = fv.get("patlasv4proto-tdoc-nome")
        if isinstance(grupo, str) and isinstance(nome, str) and grupo in out:
            if nome not in out[grupo]:
                out[grupo].append(nome)
    return out


def main() -> None:
    forms = json.loads(FORMS_PATH.read_text(encoding="utf-8"))
    tipos_map = tipos_from_catalog(forms)
    all_tipos: list[str] = []
    for g in GRUPOS_OPTS:
        for t in tipos_map.get(g) or []:
            if t not in all_tipos:
                all_tipos.append(t)

    # --- Tipo na etapa ---
    for f in forms:
        if f.get("id") != FORM_TIPO:
            continue
        f["name"] = "Tipo na etapa"
        f["metadata"] = (
            "Linha da lista de documentos da etapa: Tipo de documento + Obrigatório na etapa."
        )
        for fld in f.get("fields") or []:
            if fld.get("id") == "patlasv4proto-catetapatipo-tipo":
                fld["label"] = "Tipo de documento"
                if all_tipos:
                    fld["options"] = all_tipos
            if fld.get("id") == "patlasv4proto-catetapatipo-obrigatorio":
                fld["label"] = "Obrigatório na etapa"
                fld["required"] = True
                fld["relevance"] = "highlight"

    # --- Grupo na etapa (acordeão da lista) ---
    for f in forms:
        if f.get("id") != FORM_GRUPO:
            continue
        f["name"] = "Grupo na etapa"
        f["metadata"] = (
            "Grupo incluído na etapa. Cabeçalho do acordeão = nome do grupo. "
            "Dentro: tabela Documentos (Tipo + Obrigatório na etapa)."
        )
        for fld in f.get("fields") or []:
            if fld.get("id") == "patlasv4proto-catetapagrp-grupo":
                fld["label"] = "Grupo de documentos"
                fld["readOnly"] = True
                fld["hidden"] = True
                fld["spec"] = "Preenchido ao Incluir a partir da seleção. Identidade do acordeão."
            if fld.get("id") == "patlasv4proto-catetapagrp-tipos":
                fld["label"] = "Documentos"
                fld["required"] = True
                fld["embeddedDisplay"] = "table"
                fld["spec"] = (
                    "Tipos do grupo na etapa. Adicione (+) ou remova linhas. "
                    "Marque Obrigatório na etapa."
                )

    # --- Etapa de Documentação ---
    for f in forms:
        if f.get("id") != FORM_ETAPA:
            continue
        f["name"] = "Etapa de Documentação"
        f["metadata"] = (
            "Catálogo Sydle — Nome, seleção de Grupos de documentos, Incluir → "
            "Lista de documentos (acordeão por grupo com tipos e obrigatoriedade), Ativo e Descrição. "
            "Na Organização, ao incluir a etapa, grupos e tipos vêm daqui."
        )
        # preserve presets
        presets = f.get("exampleValuePresets") or []
        active = f.get("activeExamplePresetId")

        f["fields"] = [
            {
                "id": "patlasv4proto-catetapa-nome",
                "label": "Nome",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "spec": "Ex.: Etapa 1, Habilitação documental, Pré-rito parceria.",
            },
            {
                "id": "patlasv4proto-catetapa-grupos-selecao",
                "label": "Grupos de documentos",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": True,
                "relevance": "highlight",
                "linkedFormId": "form-patlasv4-proto-grupo-documento",
                "options": GRUPOS_OPTS,
                "spec": (
                    "Selecione um ou mais grupos (chips) e clique em Incluir. "
                    "Cada grupo entra na Lista de documentos com seus tipos do catálogo."
                ),
            },
            {
                "id": "patlasv4proto-catetapa-grupos-incluir",
                "type": "html",
                "label": "",
                "size": "small",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "htmlContent": BTN_INCLUIR,
                "spec": "Inclui os grupos selecionados na Lista de documentos, com os tipos do catálogo MIPP.",
            },
            {
                "id": "patlasv4proto-catetapa-grupos",
                "label": "Lista de documentos",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "linkedFormId": FORM_GRUPO,
                "embeddedDisplay": "form",
                "spec": (
                    "Resultado do Incluir. Um acordeão por grupo; dentro, Documentos "
                    "(Tipo de documento + Obrigatório na etapa)."
                ),
            },
            {
                "id": "patlasv4proto-catetapa-ativo",
                "label": "Ativo",
                "type": "boolean",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "common",
                "spec": "Etapas inativas não aparecem em Etapas a incluir na Organização.",
            },
            {
                "id": "patlasv4proto-catetapa-descricao",
                "label": "Descrição",
                "type": "text",
                "size": "large",
                "textLong": True,
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "spec": "Texto livre / orientação sobre a etapa (editor rico no Sydle).",
            },
            {
                "id": "patlasv4proto-catetapa-ordem",
                "label": "Ordem",
                "type": "number",
                "size": "small",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "hidden": True,
                "spec": "Ordem de exibição ao incluir etapas na Organização (oculto no layout Sydle).",
            },
        ]

        # enrich presets: grupos-selecao from embedded rows; keep lista
        for p in presets:
            fv = dict(p.get("fieldValues") or {})
            rows = (p.get("embeddedRowsByFieldId") or {}).get("patlasv4proto-catetapa-grupos") or []
            nomes = []
            for row in rows:
                g = row.get("patlasv4proto-catetapagrp-grupo")
                if isinstance(g, str) and g.strip():
                    nomes.append(g)
            if nomes:
                fv["patlasv4proto-catetapa-grupos-selecao"] = nomes
            if "patlasv4proto-catetapa-descricao" not in fv:
                fv["patlasv4proto-catetapa-descricao"] = ""
            p["fieldValues"] = fv

        f["exampleValuePresets"] = presets
        if active:
            f["activeExamplePresetId"] = active

    FORMS_PATH.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK", FORM_ETAPA)


if __name__ == "__main__":
    main()
