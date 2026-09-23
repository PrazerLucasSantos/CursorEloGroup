# -*- coding: utf-8 -*-
"""Simplifica UX Documentos: selecionar/incluir etapas e grupos; oculta campos tecnicos."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
CLASS_GROUPS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json"

FORM_UO = "form-patlasv4-proto-unidade-organizacional"
FORM_ETAPA = "form-patlasv4-proto-uo-etapa-documentacional"
FORM_GRUPO = "form-patlasv4-proto-uo-grupo-doc-etapa"
FORM_GDOC = "form-patlasv4-proto-grupo-documento"
FORM_METH_ETAPAS = "form-patlasv4-proto-metodo-incluir-etapas-doc"
FORM_METH_GRUPOS = "form-patlasv4-proto-metodo-incluir-grupos-doc"

ETAPAS = [
    "Habilitação documental",
    "Pré-rito parceria",
    "Execução da parceria",
]

# Catálogo: grupo → etapa
GRUPO_ETAPA = {
    "Habilitação Jurídica": "Habilitação documental",
    "Qualificação Técnica": "Habilitação documental",
    "Qualificação Econômica e Financeira": "Habilitação documental",
    "Compliance (adendo)": "Habilitação documental",
    "Pré-rito parceria": "Pré-rito parceria",
    "Documentos de execução": "Execução da parceria",
}


def patch_gdoc(forms: list[dict]) -> None:
    gdoc = next(f for f in forms if f["id"] == FORM_GDOC)
    fields = gdoc["fields"]
    if not any(f["id"] == "patlasv4proto-gdoc-etapa" for f in fields):
        fields.insert(
            1,
            {
                "id": "patlasv4proto-gdoc-etapa",
                "label": "Etapa documentacional",
                "type": "textOptions",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "options": list(ETAPAS),
                "spec": (
                    "Etapa à qual este grupo pertence. Na Organização, ao incluir a etapa, "
                    "os grupos desta etapa ficam disponíveis para seleção/inclusão."
                ),
            },
        )
    gdoc["metadata"] = (
        "Catálogo — agrupa tipos de documento por etapa documentacional "
        "(Habilitação, Pré-rito, Execução). Referenciado em Tipo de Documento e Organização."
    )
    for p in gdoc.get("exampleValuePresets") or []:
        nome = (p.get("fieldValues") or {}).get("patlasv4proto-gdoc-nome")
        if nome and nome in GRUPO_ETAPA:
            p.setdefault("fieldValues", {})["patlasv4proto-gdoc-etapa"] = GRUPO_ETAPA[nome]


def patch_etapa_form(forms: list[dict]) -> None:
    form = next(f for f in forms if f["id"] == FORM_ETAPA)
    for f in form["fields"]:
        if f["id"] in (
            "patlasv4proto-uoetapa-nome",
            "patlasv4proto-uoetapa-ordem",
            "patlasv4proto-uoetapa-ativo",
        ):
            f["hidden"] = True
            if f["id"] == "patlasv4proto-uoetapa-nome":
                f["spec"] = (
                    "Identidade da etapa (somente leitura na UI). Definida ao Incluir etapas. "
                    "Exibida no título do acordeão."
                )
                f["readOnly"] = True
            elif f["id"] == "patlasv4proto-uoetapa-ordem":
                f["spec"] = "Preenchida automaticamente ao incluir a etapa. Oculta na UI."
                f["readOnly"] = True
            else:
                f["spec"] = "Definido ao incluir a etapa. Oculto na UI."
                f["readOnly"] = True
        if f["id"] == "patlasv4proto-uoetapa-grupos":
            f["embeddedDisplay"] = "table"
            f["label"] = "Grupos de documentos"
            f["readOnly"] = True
            f["spec"] = (
                "Grupos incluídos nesta etapa (somente o nome). "
                "Preenchidos pelo método Incluir grupos na Organização — não editar manualmente."
            )
    form["metadata"] = (
        "Etapa incluída na Organização. Campos técnicos ocultos; "
        "exibe somente os grupos de documentos incluídos."
    )


def patch_grupo_form(forms: list[dict]) -> None:
    form = next(f for f in forms if f["id"] == FORM_GRUPO)
    for f in form["fields"]:
        if f["id"] == "patlasv4proto-uogrpetapa-progresso":
            f["hidden"] = True
        if f["id"] == "patlasv4proto-uogrpetapa-tipos":
            f["hidden"] = True
            f["spec"] = (
                "Legado/interno — tipos carregados no backend ao incluir o grupo. "
                "Oculto na UI da etapa (somente o nome do grupo é exibido)."
            )
        if f["id"] == "patlasv4proto-uogrpetapa-grupo":
            f["spec"] = "Nome do grupo de documentos incluído nesta etapa."
    form["metadata"] = (
        "Linha de grupo incluído na etapa. Na UI, apenas o nome do grupo de documentos."
    )
    # Remover campos ocultos extras da grade: só o nome fica visível
    form["name"] = "(01.e9) Grupo na etapa"


def meth_incluir_etapas() -> dict:
    return {
        "id": FORM_METH_ETAPAS,
        "name": "(01.m8) Incluir etapas documentacionais",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Inclui na Organização as etapas selecionadas em «Etapas a incluir». "
            "Após incluir, os grupos de documento dessas etapas ficam disponíveis em «Grupos a incluir»."
        ),
        "fields": [
            {
                "id": "patlasv4proto-meth-iet-alerta",
                "label": "Incluir etapas",
                "type": "alert",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "alertVariant": "info",
                "alertTitle": "Confirmar inclusão de etapas",
                "alertMessage": (
                    "As etapas selecionadas serão adicionadas em Etapas documentacionais. "
                    "Em seguida, selecione os grupos de cada etapa e use Incluir grupos."
                ),
            },
            {
                "id": "patlasv4proto-meth-iet-etapas",
                "label": "Etapas selecionadas",
                "type": "textOptions",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": True,
                "relevance": "highlight",
                "options": list(ETAPAS),
                "spec": "Espelho do campo Etapas a incluir da Organização.",
            },
            {
                "id": "patlasv4proto-meth-iet-resumo",
                "label": "Resumo",
                "type": "text",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "textLong": True,
                "spec": (
                    "Backend: cria uma linha por etapa ainda não existente; "
                    "habilita na seleção os grupos do catálogo com Etapa = etapa incluída."
                ),
            },
        ],
        "hiddenLabelFieldIds": ["patlasv4proto-meth-iet-alerta"],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-meth-iet",
                "name": "Habilitação + Execução",
                "iconColor": "#2B9CBF",
                "fieldValues": {
                    "patlasv4proto-meth-iet-etapas": [
                        "Habilitação documental",
                        "Execução da parceria",
                    ],
                    "patlasv4proto-meth-iet-resumo": (
                        "Incluirá as etapas Habilitação documental e Execução da parceria. "
                        "Grupos disponíveis: Habilitação Jurídica, Qualificação Técnica, "
                        "Qualificação Econômica e Financeira, Compliance (adendo), "
                        "Documentos de execução."
                    ),
                },
            }
        ],
        "activeExamplePresetId": "patlasv4proto-p-meth-iet",
    }


def meth_incluir_grupos() -> dict:
    return {
        "id": FORM_METH_GRUPOS,
        "name": "(01.m9) Incluir grupos de documentos",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Inclui na etapa correspondente os grupos selecionados em «Grupos a incluir». "
            "Pré-requisito: etapas já incluídas. Carrega os tipos do catálogo em cada grupo."
        ),
        "fields": [
            {
                "id": "patlasv4proto-meth-igd-alerta",
                "label": "Incluir grupos",
                "type": "alert",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "alertVariant": "info",
                "alertTitle": "Confirmar inclusão de grupos",
                "alertMessage": (
                    "Os grupos selecionados serão adicionados nas etapas documentacionais "
                    "já incluídas (conforme a Etapa de cada grupo no catálogo)."
                ),
            },
            {
                "id": "patlasv4proto-meth-igd-grupos",
                "label": "Grupos selecionados",
                "type": "reference",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": True,
                "relevance": "highlight",
                "linkedFormId": FORM_GDOC,
                "options": list(GRUPO_ETAPA.keys()),
                "spec": "Espelho do campo Grupos a incluir da Organização.",
            },
            {
                "id": "patlasv4proto-meth-igd-resumo",
                "label": "Resumo",
                "type": "text",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "textLong": True,
                "spec": (
                    "Backend: para cada grupo, localiza a etapa incluída e adiciona o nome do grupo; "
                    "carrega os tipos obrigatórios do catálogo (status Pendente)."
                ),
            },
        ],
        "hiddenLabelFieldIds": ["patlasv4proto-meth-igd-alerta"],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-meth-igd",
                "name": "Jurídica + Técnica",
                "iconColor": "#F59740",
                "fieldValues": {
                    "patlasv4proto-meth-igd-grupos": [
                        "Habilitação Jurídica",
                        "Qualificação Técnica",
                    ],
                    "patlasv4proto-meth-igd-resumo": (
                        "Incluirá Habilitação Jurídica e Qualificação Técnica na etapa "
                        "Habilitação documental, com os tipos obrigatórios do catálogo."
                    ),
                },
            }
        ],
        "activeExamplePresetId": "patlasv4proto-p-meth-igd",
    }


def ensure_form(forms: list[dict], form: dict, after_id: str | None = None) -> None:
    ids = {f["id"]: i for i, f in enumerate(forms)}
    if form["id"] in ids:
        forms[ids[form["id"]]] = form
        return
    if after_id and after_id in ids:
        forms.insert(ids[after_id] + 1, form)
    else:
        forms.append(form)


def patch_org(org: dict) -> None:
    fields = org["fields"]
    by_id = {f["id"]: f for f in fields}

    selecao_etapas = {
        "id": "patlasv4proto-uo-etapas-selecao",
        "label": "Etapas a incluir",
        "type": "textOptions",
        "size": "large",
        "readOnly": False,
        "required": False,
        "multiple": True,
        "relevance": "common",
        "sectionId": "sec-patlasv4proto-uo-documentos-aba",
        "options": list(ETAPAS),
        "hidden": True,
        "spec": (
            "Selecione as etapas documentacionais e use o método Incluir etapas. "
            "Após incluir, os grupos dessas etapas ficam disponíveis em Grupos a incluir."
        ),
    }
    selecao_grupos = {
        "id": "patlasv4proto-uo-grupos-selecao",
        "label": "Grupos a incluir",
        "type": "reference",
        "size": "large",
        "readOnly": False,
        "required": False,
        "multiple": True,
        "relevance": "common",
        "sectionId": "sec-patlasv4proto-uo-documentos-aba",
        "linkedFormId": FORM_GDOC,
        "options": list(GRUPO_ETAPA.keys()),
        "hidden": True,
        "spec": (
            "Lista filtrada pelas etapas já incluídas (protótipo: catálogo completo). "
            "Selecione os grupos e use Incluir grupos — cada grupo entra na sua etapa."
        ),
    }

    # Inserir seleções antes de etapas-documentacionais
    insert_at = next(
        (i for i, f in enumerate(fields) if f["id"] == "patlasv4proto-uo-etapas-documentacionais"),
        0,
    )
    if "patlasv4proto-uo-etapas-selecao" not in by_id:
        fields.insert(insert_at, selecao_etapas)
        insert_at += 1
    else:
        by_id["patlasv4proto-uo-etapas-selecao"].update(selecao_etapas)

    # re-resolve after possible insert
    fields = org["fields"]
    by_id = {f["id"]: f for f in fields}
    insert_at = next(
        (i for i, f in enumerate(fields) if f["id"] == "patlasv4proto-uo-etapas-documentacionais"),
        len(fields),
    )
    if "patlasv4proto-uo-grupos-selecao" not in by_id:
        fields.insert(insert_at, selecao_grupos)
    else:
        by_id["patlasv4proto-uo-grupos-selecao"].update(selecao_grupos)

    by_id = {f["id"]: f for f in org["fields"]}
    if "patlasv4proto-uo-etapas-documentacionais" in by_id:
        ef = by_id["patlasv4proto-uo-etapas-documentacionais"]
        ef["label"] = "Etapas incluídas"
        ef["spec"] = (
            "Resultado das inclusões. Cada etapa mostra só os grupos incluídos (nome). "
            "Campos técnicos da etapa ficam ocultos."
        )
        ef["readOnly"] = False

    # Visibility: show seleções + etapas quando Empresa=Sim
    for rule in org.get("fieldVisibilityRules") or []:
        if rule["id"] in (
            "rule-uo-show-ajustes-empresa",
            "rule-uo-hide-ajustes-nao-empresa",
        ):
            tids = rule.setdefault("targetFieldIds", [])
            for fid in (
                "patlasv4proto-uo-etapas-selecao",
                "patlasv4proto-uo-grupos-selecao",
                "patlasv4proto-uo-etapas-documentacionais",
            ):
                if fid not in tids:
                    tids.append(fid)

    # Methods
    methods = org.setdefault("methods", [])
    meth_ids = {m["id"] for m in methods}
    for mid, name, icon, form_id in (
        (
            "patlasv4proto-uo-meth-incluir-etapas",
            "Incluir etapas",
            "playlist_add",
            FORM_METH_ETAPAS,
        ),
        (
            "patlasv4proto-uo-meth-incluir-grupos",
            "Incluir grupos",
            "create_new_folder",
            FORM_METH_GRUPOS,
        ),
    ):
        if mid not in meth_ids:
            # inserir após salvar
            idx = next(
                (i for i, m in enumerate(methods) if m["id"] == "patlasv4proto-uo-meth-salvar"),
                0,
            )
            methods.insert(
                idx + 1,
                {
                    "id": mid,
                    "name": name,
                    "icon": icon,
                    "kind": "destaque",
                    "inputFormId": form_id,
                },
            )
            meth_ids.add(mid)

    # Presets: preencher seleções conforme etapas já incluídas
    for preset in org.get("exampleValuePresets") or []:
        emb = preset.get("embeddedRowsByFieldId") or {}
        fv = preset.setdefault("fieldValues", {})
        etapas_rows = emb.get("patlasv4proto-uo-etapas-documentacionais") or []
        etapa_names = []
        grupo_names = []
        for er in etapas_rows:
            en = er.get("patlasv4proto-uoetapa-nome")
            if en:
                etapa_names.append(en)
            grupos = er.get("patlasv4proto-uoetapa-grupos") or {}
            if isinstance(grupos, dict):
                for g in grupos.get("embeddedDemoInstances") or []:
                    gn = g.get("patlasv4proto-uogrpetapa-grupo")
                    if gn:
                        grupo_names.append(gn)
        if etapa_names:
            fv["patlasv4proto-uo-etapas-selecao"] = etapa_names
        if grupo_names:
            fv["patlasv4proto-uo-grupos-selecao"] = grupo_names

    org["metadata"] = (
        "Protótipo Atlas Fase 1 — Organização. Fluxo documental: "
        "selecionar/incluir etapas → aparecem grupos da etapa → selecionar/incluir grupos. "
        "Só na org raiz (Empresa=Sim)."
    )


def patch_class_groups() -> None:
    data = json.loads(CLASS_GROUPS.read_text(encoding="utf-8"))
    assigns = data.setdefault("assignments", {})
    order = data.setdefault("memberOrderByGroup", {}).setdefault(
        "grp-01-organizacao-met", []
    )
    for fid in (FORM_METH_ETAPAS, FORM_METH_GRUPOS):
        assigns[fid] = "grp-01-organizacao-met"
        if fid not in order:
            order.append(fid)
    CLASS_GROUPS.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    ids = {f["id"] for f in forms}
    if FORM_ETAPA not in ids or FORM_GRUPO not in ids:
        raise SystemExit("Etapa/Grupo forms missing — run base patch first")

    patch_gdoc(forms)
    patch_etapa_form(forms)
    patch_grupo_form(forms)
    ensure_form(forms, meth_incluir_etapas(), after_id="form-patlasv4-proto-metodo-adicionar-grupos-mipp")
    ensure_form(forms, meth_incluir_grupos(), after_id=FORM_METH_ETAPAS)

    org = next(f for f in forms if f["id"] == FORM_UO)
    patch_org(org)
    patch_class_groups()

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # verify
    v = json.loads(FORMS.read_text(encoding="utf-8"))
    org2 = next(f for f in v if f["id"] == FORM_UO)
    etapa = next(f for f in v if f["id"] == FORM_ETAPA)
    grupo = next(f for f in v if f["id"] == FORM_GRUPO)
    hidden_etapa = [f["id"] for f in etapa["fields"] if f.get("hidden")]
    hidden_grupo = [f["id"] for f in grupo["fields"] if f.get("hidden")]
    field_ids = {f["id"] for f in org2["fields"]}
    meth_ids = {m["id"] for m in org2.get("methods") or []}
    msg = (
        f"OK ux. hidden_etapa={hidden_etapa} hidden_grupo={hidden_grupo} "
        f"selecao_etapas={'patlasv4proto-uo-etapas-selecao' in field_ids} "
        f"selecao_grupos={'patlasv4proto-uo-grupos-selecao' in field_ids} "
        f"meth_etapas={'patlasv4proto-uo-meth-incluir-etapas' in meth_ids} "
        f"meth_grupos={'patlasv4proto-uo-meth-incluir-grupos' in meth_ids}"
    )
    print(msg.encode("ascii", "replace").decode("ascii"))


if __name__ == "__main__":
    main()
