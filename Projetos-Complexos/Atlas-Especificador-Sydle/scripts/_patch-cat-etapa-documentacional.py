"""Cria classe catálogo Etapa documentacional (nome + grupos + tipos add/remove)."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPIC = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS_PATH = EPIC / "forms.json"
GROUPS_PATH = EPIC / "class-groups.json"
WS_PATH = EPIC / "workspaces.json"

FORM_ETAPA = "form-patlasv4-proto-cat-etapa-documentacional"
FORM_GRUPO = "form-patlasv4-proto-cat-etapa-grupo"
FORM_TIPO = "form-patlasv4-proto-cat-etapa-tipo"

GRUPOS_OPTS = [
    "Habilitação Jurídica",
    "Qualificação Técnica",
    "Qualificação Econômica e Financeira",
    "Compliance (adendo)",
    "Pré-rito parceria",
    "Documentos de execução",
]

ETAPAS_OPTS = [
    "Habilitação documental",
    "Pré-rito parceria",
    "Execução da parceria",
]

FALLBACK_TIPOS = {
    "Compliance (adendo)": [
        "Política de compliance / anticorrupção",
        "Declaração de conflito de interesses",
    ],
    "Pré-rito parceria": [
        "Contrato de Parceria",
        "Plano de Negócio",
        "Plano de Operação",
        "Papel Timbrado",
        "Logo Marca",
    ],
    "Documentos de execução": [
        "Contrato de Parceria",
        "Plano de Negócio",
        "Plano de Operação",
        "Papel Timbrado",
        "Logo Marca",
    ],
}

GRUPO_ETAPA = {
    "Habilitação Jurídica": "Habilitação documental",
    "Qualificação Técnica": "Habilitação documental",
    "Qualificação Econômica e Financeira": "Habilitação documental",
    "Compliance (adendo)": "Habilitação documental",
    "Pré-rito parceria": "Pré-rito parceria",
    "Documentos de execução": "Execução da parceria",
}


def form_tipo_na_etapa(tipo_options: list[str]) -> dict:
    return {
        "id": FORM_TIPO,
        "name": "(05.00.e2) Tipo na etapa",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": "Linha da tabela de documentos da etapa: referência ao Tipo de Documento do catálogo. Permite adicionar e remover tipos do grupo na etapa.",
        "fields": [
            {
                "id": "patlasv4proto-catetapatipo-tipo",
                "label": "Tipo de documento",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "linkedFormId": "form-patlasv4-proto-tipo-documento",
                "options": tipo_options,
                "spec": "Selecione o tipo de documento do catálogo MIPP. Use + / remover nas linhas da tabela.",
            },
            {
                "id": "patlasv4proto-catetapatipo-obrigatorio",
                "label": "Obrigatório na etapa",
                "type": "boolean",
                "size": "small",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "spec": "Indica se o tipo é obrigatório quando a etapa é incluída na Organização.",
            },
        ],
        "exampleValuePresets": [],
    }


def form_grupo_na_etapa() -> dict:
    return {
        "id": FORM_GRUPO,
        "name": "(05.00.e1) Grupo na etapa",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": "Grupo selecionado na etapa. Ao escolher o Grupo de Documento, configure abaixo os Tipos de Documento (adicionar/remover).",
        "fields": [
            {
                "id": "patlasv4proto-catetapagrp-grupo",
                "label": "Grupo de documentos",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "linkedFormId": "form-patlasv4-proto-grupo-documento",
                "options": GRUPOS_OPTS,
                "spec": "Selecione o grupo do catálogo. O nome aparece no título do acordeão.",
            },
            {
                "id": "patlasv4proto-catetapagrp-tipos",
                "label": "Documentos (tipos)",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "linkedFormId": FORM_TIPO,
                "embeddedDisplay": "table",
                "spec": "Tipos de documento deste grupo na etapa. Adicione ou remova linhas. Em geral, use os tipos já cadastrados no Grupo de Documento.",
            },
        ],
        "exampleValuePresets": [],
    }


def form_etapa() -> dict:
    return {
        "id": FORM_ETAPA,
        "name": "(05.00) Etapa documentacional",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Catálogo — define as etapas documentacionais (ex.: Habilitação documental). "
            "Em cada etapa, selecione os Grupos de Documento e configure os Tipos (documentos) "
            "com adicionar/remover. Na Organização, ao incluir a etapa, grupos e tipos vêm daqui."
        ),
        "fields": [
            {
                "id": "patlasv4proto-catetapa-nome",
                "label": "Nome",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "spec": "Ex.: Habilitação documental, Pré-rito parceria, Execução da parceria.",
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
                "spec": "Ordem de exibição ao incluir etapas na Organização.",
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
                "id": "patlasv4proto-catetapa-grupos",
                "label": "Grupos de documentos",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "linkedFormId": FORM_GRUPO,
                "embeddedDisplay": "form",
                "spec": (
                    "Adicione grupos à etapa. Em cada grupo, selecione o Grupo de Documento "
                    "e monte a lista de Tipos de Documento (adicionar/remover)."
                ),
            },
        ],
        "exampleValuePresets": [],
        "activeExamplePresetId": None,
    }


def build_tipo_rows(tipos: list[str]) -> list[dict]:
    return [
        {
            "patlasv4proto-catetapatipo-tipo": t,
            "patlasv4proto-catetapatipo-obrigatorio": True,
        }
        for t in tipos
    ]


def build_grupo_row(grupo: str, tipos: list[str]) -> dict:
    return {
        "patlasv4proto-catetapagrp-grupo": grupo,
        "patlasv4proto-catetapagrp-tipos": {"embeddedDemoInstances": build_tipo_rows(tipos)},
    }


def build_etapa_presets(tipos_por_grupo: dict[str, list[str]]) -> list[dict]:
    presets = []
    meta = [
        ("patlasv4proto-p-catetapa-habilitacao", "Habilitação documental", 1, "#0c4a6e"),
        ("patlasv4proto-p-catetapa-prerito", "Pré-rito parceria", 2, "#b45309"),
        ("patlasv4proto-p-catetapa-execucao", "Execução da parceria", 3, "#334155"),
    ]
    for pid, nome, ordem, color in meta:
        grupos = [g for g, e in GRUPO_ETAPA.items() if e == nome]
        grupo_rows = []
        for g in grupos:
            tipos = list(tipos_por_grupo.get(g) or FALLBACK_TIPOS.get(g) or [])
            grupo_rows.append(build_grupo_row(g, tipos))
        presets.append(
            {
                "id": pid,
                "name": nome,
                "iconColor": color,
                "fieldValues": {
                    "patlasv4proto-catetapa-nome": nome,
                    "patlasv4proto-catetapa-ordem": ordem,
                    "patlasv4proto-catetapa-ativo": True,
                },
                "embeddedRowsByFieldId": {
                    "patlasv4proto-catetapa-grupos": grupo_rows,
                },
            }
        )
    return presets


def tipos_from_catalog(forms: list) -> tuple[dict[str, list[str]], list[str]]:
    tdoc = next(f for f in forms if f["id"] == "form-patlasv4-proto-tipo-documento")
    by_g: dict[str, list[str]] = defaultdict(list)
    all_names: list[str] = []
    for p in tdoc.get("exampleValuePresets") or []:
        fv = p.get("fieldValues") or {}
        if fv.get("patlasv4proto-tdoc-ativo") is False:
            continue
        g = fv.get("mqlh5j3aabnkci")
        n = fv.get("patlasv4proto-tdoc-nome")
        if isinstance(n, str) and n not in all_names:
            all_names.append(n)
        if isinstance(g, str) and isinstance(n, str) and n not in by_g[g]:
            by_g[g].append(n)
    for g, tipos in FALLBACK_TIPOS.items():
        for t in tipos:
            if t not in all_names:
                all_names.append(t)
            if t not in by_g[g]:
                by_g[g].append(t)
    return dict(by_g), all_names


def upsert_form(forms: list, form: dict, before_id: str | None = None) -> None:
    ids = [f["id"] for f in forms]
    if form["id"] in ids:
        forms[ids.index(form["id"])] = form
        return
    if before_id and before_id in ids:
        forms.insert(ids.index(before_id), form)
    else:
        forms.append(form)


def patch_gdoc_etapa(forms: list) -> None:
    gdoc = next(f for f in forms if f["id"] == "form-patlasv4-proto-grupo-documento")
    for field in gdoc["fields"]:
        if field["id"] != "patlasv4proto-gdoc-etapa":
            continue
        field["type"] = "reference"
        field["linkedFormId"] = FORM_ETAPA
        field["options"] = list(ETAPAS_OPTS)
        field["spec"] = (
            "Etapa do catálogo à qual este grupo pertence. "
            "Configure também os tipos dentro da classe Etapa documentacional."
        )
        break
    gdoc["metadata"] = (
        "Catálogo — grupo de documentos. Associe à Etapa documentacional. "
        "A composição completa (grupos + tipos) é configurada na classe Etapa documentacional."
    )


def patch_class_groups(data: dict) -> None:
    groups = data.setdefault("groups", [])
    if not any(g.get("id") == "grp-05-tipo-doc-emb" for g in groups):
        # insert emb after grp-05-tipo-doc
        idx = next(i for i, g in enumerate(groups) if g["id"] == "grp-05-tipo-doc")
        groups.insert(
            idx + 1,
            {
                "id": "grp-05-tipo-doc-emb",
                "name": "Embutidas",
                "parentGroupId": "grp-05-tipo-doc",
            },
        )

    assigns = data.setdefault("assignments", {})
    assigns[FORM_ETAPA] = "grp-05-tipo-doc"
    assigns[FORM_GRUPO] = "grp-05-tipo-doc-emb"
    assigns[FORM_TIPO] = "grp-05-tipo-doc-emb"

    order = data.setdefault("memberOrderByGroup", {})
    main = order.setdefault("grp-05-tipo-doc", [])
    for fid in (FORM_ETAPA, "form-patlasv4-proto-grupo-documento", "form-patlasv4-proto-tipo-documento"):
        if fid in main:
            main.remove(fid)
    # keep tdoc-recorrencia at end if present
    rest = [x for x in main if x not in (FORM_ETAPA,)]
    order["grp-05-tipo-doc"] = [
        FORM_ETAPA,
        "form-patlasv4-proto-grupo-documento",
        "form-patlasv4-proto-tipo-documento",
        *[x for x in rest if x not in (
            "form-patlasv4-proto-grupo-documento",
            "form-patlasv4-proto-tipo-documento",
            FORM_ETAPA,
        )],
    ]
    order["grp-05-tipo-doc-emb"] = [FORM_GRUPO, FORM_TIPO]


def patch_workspace(ws: list) -> None:
    for w in ws:
        for pkg in w.get("packages") or []:
            if pkg.get("id") != "pkg-mapa-2-config":
                continue
            classes = pkg.setdefault("classes", [])
            if any(c.get("linkedFormId") == FORM_ETAPA for c in classes):
                return
            classes.insert(
                0,
                {
                    "id": "cls-mapa-etapa-documentacional",
                    "name": "(5.00) Etapa documentacional",
                    "linkedFormId": FORM_ETAPA,
                    "linkedFormExamplePresetIds": [
                        "patlasv4proto-p-catetapa-habilitacao",
                        "patlasv4proto-p-catetapa-prerito",
                        "patlasv4proto-p-catetapa-execucao",
                    ],
                },
            )
            pkg["name"] = "F1 · Configuração documental (5.00, 5.0, 5, 7)"
            return


def main() -> None:
    forms = json.loads(FORMS_PATH.read_text(encoding="utf-8"))
    tipos_por_grupo, tipo_options = tipos_from_catalog(forms)

    etapa = form_etapa()
    etapa["exampleValuePresets"] = build_etapa_presets(tipos_por_grupo)
    etapa["activeExamplePresetId"] = "patlasv4proto-p-catetapa-habilitacao"

    upsert_form(forms, form_tipo_na_etapa(tipo_options), before_id="form-patlasv4-proto-grupo-documento")
    upsert_form(forms, form_grupo_na_etapa(), before_id="form-patlasv4-proto-grupo-documento")
    upsert_form(forms, etapa, before_id="form-patlasv4-proto-grupo-documento")
    patch_gdoc_etapa(forms)

    FORMS_PATH.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    groups = json.loads(GROUPS_PATH.read_text(encoding="utf-8"))
    patch_class_groups(groups)
    GROUPS_PATH.write_text(json.dumps(groups, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if WS_PATH.exists():
        ws = json.loads(WS_PATH.read_text(encoding="utf-8"))
        patch_workspace(ws)
        WS_PATH.write_text(json.dumps(ws, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # sanity
    ids = [f["id"] for f in forms]
    assert FORM_ETAPA in ids and FORM_GRUPO in ids and FORM_TIPO in ids
    et = next(f for f in forms if f["id"] == FORM_ETAPA)
    print("etapa presets", len(et["exampleValuePresets"]))
    for p in et["exampleValuePresets"]:
        rows = (p.get("embeddedRowsByFieldId") or {}).get("patlasv4proto-catetapa-grupos") or []
        ntipos = 0
        for r in rows:
            t = r.get("patlasv4proto-catetapagrp-tipos") or {}
            ntipos += len(t.get("embeddedDemoInstances") or [])
        print(f"  {p['name']}: {len(rows)} grupos, {ntipos} tipos")
    print("ok")


if __name__ == "__main__":
    main()
