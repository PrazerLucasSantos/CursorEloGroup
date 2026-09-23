"""Empilha seções de Cargo e alinha a tabela Ocupantes ao Sydle."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPIC = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS = EPIC / "forms.json"
GROUPS = EPIC / "class-groups.json"

FORM_CARGO = "form-patlasv4-proto-cargo"
FORM_OCUPANTE = "form-patlasv4-proto-cargo-ocupante"
FORM_DETALHE = "form-patlasv4-proto-uo-cargo-ocupante-detalhe"


def field_by_id(fields: list[dict], field_id: str) -> dict | None:
    return next((field for field in fields if field.get("id") == field_id), None)


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    cargo = next(form for form in forms if form["id"] == FORM_CARGO)
    ocupante = next(form for form in forms if form["id"] == FORM_OCUPANTE)

    # Cargo: todas as seções na mesma tela, uma abaixo da outra.
    cargo["sectionLayout"] = "accordion"
    cargo["metadata"] = (
        "Cargo com seções empilhadas: Dados, Assinatura, Permissões do Cargo e Ocupantes."
    )

    # Preserva a versão detalhada usada no botão Visualizar da Organização.
    forms_by_id = {form["id"]: index for index, form in enumerate(forms)}
    detalhe = (
        deepcopy(forms[forms_by_id[FORM_DETALHE]])
        if FORM_DETALHE in forms_by_id
        else deepcopy(ocupante)
    )
    detalhe["id"] = FORM_DETALHE
    detalhe["name"] = "Detalhes do ocupante"
    detalhe["defaultCanvasMode"] = "read"
    detalhe["metadata"] = (
        "Detalhes do ocupante acessados pela tabela Cargos atribuídos da Organização."
    )
    for field in detalhe["fields"]:
        field["readOnly"] = True
    if FORM_DETALHE in forms_by_id:
        forms[forms_by_id[FORM_DETALHE]] = detalhe
    else:
        forms.insert(forms_by_id[FORM_OCUPANTE] + 1, detalhe)

    # Ocupante do Cargo: colunas exatamente como no anexo.
    servidor = field_by_id(
        ocupante["fields"], "patlasv4proto-cargo-ocupantes-servidor"
    )
    if servidor:
        servidor["label"] = "Pessoa"
        servidor["readOnly"] = True
        servidor["required"] = True
        pessoa_exemplo = "lucas.santos / lucas.santos@elogroup.com.br"
        options = servidor.setdefault("options", [])
        if pessoa_exemplo not in options:
            options.append(pessoa_exemplo)

    occupant_field_ids = [
        "patlasv4proto-cargo-ocupantes-servidor",
        "patlasv4proto-cargo-ocupantes-condicao",
        "patlasv4proto-cargo-ocupantes-regiao-atuacao",
        "patlasv4proto-cargo-ocupantes-data-de-inicio",
        "patlasv4proto-cargo-ocupantes-data-de-fim",
        "patlasv4proto-cargo-ocupantes-ativo",
    ]
    fields_by_id = {field["id"]: field for field in ocupante["fields"]}
    ocupante["fields"] = [
        fields_by_id[field_id]
        for field_id in occupant_field_ids
        if field_id in fields_by_id
    ]
    ocupante["defaultCanvasMode"] = "read"
    ocupante["metadata"] = (
        "Linha somente leitura da tabela Ocupantes: Pessoa, Condição, Região de atuação, "
        "Data de início, Data de fim e Ativo."
    )
    for field in ocupante["fields"]:
        field["readOnly"] = True

    ocupantes_lista = field_by_id(
        cargo["fields"], "patlasv4proto-cargo-ocupantes-lista"
    )
    if ocupantes_lista:
        ocupantes_lista["readOnly"] = True
        ocupantes_lista["label"] = "Ocupantes"
        ocupantes_lista["linkedFormId"] = FORM_OCUPANTE
        ocupantes_lista["embeddedDisplay"] = "table"
        ocupantes_lista["spec"] = (
            "Tabela somente leitura: Pessoa, Condição, Região de atuação, "
            "Data de início, Data de fim e Ativo."
        )

    # O cenário ativo reproduz os dados do anexo.
    active = next(
        (
            preset
            for preset in cargo.get("exampleValuePresets") or []
            if preset["id"] == cargo.get("activeExamplePresetId")
        ),
        None,
    )
    if active:
        active.setdefault("embeddedRowsByFieldId", {})[
            "patlasv4proto-cargo-ocupantes-lista"
        ] = [
            {
                "patlasv4proto-cargo-ocupantes-servidor": (
                    "lucas.santos / lucas.santos@elogroup.com.br"
                ),
                "patlasv4proto-cargo-ocupantes-condicao": "Substituto",
                "patlasv4proto-cargo-ocupantes-regiao-atuacao": None,
                "patlasv4proto-cargo-ocupantes-data-de-inicio": None,
                "patlasv4proto-cargo-ocupantes-data-de-fim": None,
                "patlasv4proto-cargo-ocupantes-ativo": True,
            }
        ]

    # A tabela Cargos atribuídos da Organização mantém o popup detalhado.
    cargo_atribuido = next(
        form
        for form in forms
        if form["id"] == "form-patlasv4-proto-uo-cargo-atribuido"
    )
    ocupante_popup = field_by_id(
        cargo_atribuido["fields"], "patlasv4proto-uoca-ocupante"
    )
    if ocupante_popup:
        ocupante_popup["linkedFormId"] = FORM_DETALHE

    FORMS.write_text(
        json.dumps(forms, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    groups = json.loads(GROUPS.read_text(encoding="utf-8"))
    groups.setdefault("assignments", {})[FORM_DETALHE] = "grp-01-organizacao-emb"
    order = groups.setdefault("memberOrderByGroup", {}).setdefault(
        "grp-01-organizacao-emb", []
    )
    if FORM_DETALHE not in order:
        anchor = "form-patlasv4-proto-uo-cargo-atribuido"
        index = order.index(anchor) + 1 if anchor in order else len(order)
        order.insert(index, FORM_DETALHE)
    GROUPS.write_text(
        json.dumps(groups, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print("ok")


if __name__ == "__main__":
    main()
