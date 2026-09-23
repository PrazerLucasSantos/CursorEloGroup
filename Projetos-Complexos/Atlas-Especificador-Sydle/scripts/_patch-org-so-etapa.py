# -*- coding: utf-8 -*-
"""Fluxo: selecionar so a etapa; ao incluir, exibe grupos e documentos da etapa."""
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
FORM_TDOC = "form-patlasv4-proto-tipo-documento"
FORM_METH_ETAPAS = "form-patlasv4-proto-metodo-incluir-etapas-doc"
FORM_METH_GRUPOS = "form-patlasv4-proto-metodo-incluir-grupos-doc"

ETAPAS = [
    "Habilitação documental",
    "Pré-rito parceria",
    "Execução da parceria",
]

GRUPO_ETAPA = {
    "Habilitação Jurídica": "Habilitação documental",
    "Qualificação Técnica": "Habilitação documental",
    "Qualificação Econômica e Financeira": "Habilitação documental",
    "Compliance (adendo)": "Habilitação documental",
    "Pré-rito parceria": "Pré-rito parceria",
    "Documentos de execução": "Execução da parceria",
}


def tipos_por_grupo(forms: list[dict]) -> dict[str, list[str]]:
    """Nome do grupo → lista de nomes de tipos (categoria Organização)."""
    tdoc = next((f for f in forms if f["id"] == FORM_TDOC), None)
    out: dict[str, list[str]] = {g: [] for g in GRUPO_ETAPA}
    if not tdoc:
        return out
    for p in tdoc.get("exampleValuePresets") or []:
        fv = p.get("fieldValues") or {}
        if fv.get("patlasv4proto-tdoc-categoria") != "Organização":
            continue
        if fv.get("patlasv4proto-tdoc-ativo") is False:
            continue
        grupo = fv.get("mqlh5j3aabnkci")
        nome = fv.get("patlasv4proto-tdoc-nome")
        if grupo in out and nome and nome not in out[grupo]:
            out[grupo].append(nome)
    return out


def build_etapa_row(
    etapa: str,
    ordem: int,
    tipos_map: dict[str, list[str]],
    *,
    max_tipos: int | None = 3,
) -> dict:
    grupos = [g for g, e in GRUPO_ETAPA.items() if e == etapa]
    grupo_rows = []
    for g in grupos:
        tipos = tipos_map.get(g) or []
        if max_tipos is not None:
            tipos = tipos[:max_tipos]
        # Fallback se catálogo vazio para o grupo
        if not tipos and g == "Documentos de execução":
            tipos = [
                "Contrato de Parceria",
                "Plano de Negócio",
                "Plano de Operação",
                "Papel Timbrado",
                "Logo Marca",
            ]
            if max_tipos is not None:
                tipos = tipos[:max_tipos]
        if not tipos and g == "Pré-rito parceria":
            tipos = [
                "Contrato de Parceria",
                "Plano de Negócio",
                "Plano de Operação",
                "Papel Timbrado",
                "Logo Marca",
            ]
            if max_tipos is not None:
                tipos = tipos[:max_tipos]
        tipo_rows = [
            {
                "mqlh6yafch5jzb": g,
                "patlasv4proto-uodoc-tipo": t,
                "patlasv4proto-uodoc-status-validacao": "Pendente",
            }
            for t in tipos
        ]
        grupo_rows.append(
            {
                "patlasv4proto-uogrpetapa-grupo": g,
                "patlasv4proto-uogrpetapa-progresso": f"0/{len(tipo_rows) or '—'}",
                "patlasv4proto-uogrpetapa-tipos": {
                    "embeddedDemoInstances": tipo_rows
                },
            }
        )
    return {
        "patlasv4proto-uoetapa-nome": etapa,
        "patlasv4proto-uoetapa-ordem": ordem,
        "patlasv4proto-uoetapa-ativo": True,
        "patlasv4proto-uoetapa-grupos": {"embeddedDemoInstances": grupo_rows},
    }


def patch_etapa_form(forms: list[dict]) -> None:
    form = next(f for f in forms if f["id"] == FORM_ETAPA)
    for f in form["fields"]:
        if f["id"] in (
            "patlasv4proto-uoetapa-nome",
            "patlasv4proto-uoetapa-ordem",
            "patlasv4proto-uoetapa-ativo",
        ):
            f["hidden"] = True
            f["readOnly"] = True
        if f["id"] == "patlasv4proto-uoetapa-grupos":
            f["label"] = "Grupos e documentos da etapa"
            f["readOnly"] = False
            f["embeddedDisplay"] = "form"
            f["spec"] = (
                "Carregado ao Incluir etapas a partir do catálogo (Grupo de Documento → Etapa). "
                "Não se seleciona grupo na Organização: a etapa já traz os grupos e documentos. "
                "Nos documentos, anexe arquivos e acompanhe a validação."
            )
    form["metadata"] = (
        "Etapa incluída. Exibe automaticamente os grupos configurados na etapa "
        "(catálogo) e os documentos/tipos de cada grupo."
    )


def patch_grupo_form(forms: list[dict]) -> None:
    form = next(f for f in forms if f["id"] == FORM_GRUPO)
    for f in form["fields"]:
        if f["id"] == "patlasv4proto-uogrpetapa-grupo":
            # Identidade no título do acordeão; campo oculto no corpo
            f["hidden"] = True
            f["readOnly"] = True
            f["spec"] = (
                "Herdado do catálogo ao incluir a etapa. Exibido no título do acordeão."
            )
        if f["id"] == "patlasv4proto-uogrpetapa-progresso":
            f["hidden"] = True
        if f["id"] == "patlasv4proto-uogrpetapa-tipos":
            f["hidden"] = False
            f["readOnly"] = False
            f["label"] = "Documentos"
            f["embeddedDisplay"] = "table"
            f["spec"] = (
                "Tipos/documentos do grupo (vindos do catálogo ao incluir a etapa). "
                "Anexar arquivo e acompanhar validação."
            )
    form["metadata"] = (
        "Grupo da etapa (configurado no catálogo). Exibe os documentos do grupo."
    )
    form["name"] = "(01.e9) Grupo na etapa"


def patch_meth_etapas(forms: list[dict], tipos_map: dict[str, list[str]]) -> None:
    resumo_parts = []
    for etapa in ETAPAS:
        gs = [g for g, e in GRUPO_ETAPA.items() if e == etapa]
        resumo_parts.append(f"{etapa}: {', '.join(gs)}")

    form = {
        "id": FORM_METH_ETAPAS,
        "name": "(01.m8) Incluir etapas documentacionais",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Inclui as etapas selecionadas. Para cada etapa, carrega automaticamente "
            "os grupos do catálogo (Grupo de Documento.Etapa) e os tipos de documento de cada grupo."
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
                    "Não é necessário selecionar grupos. Ao incluir a etapa, "
                    "aparecem os grupos configurados nela e os documentos de cada grupo."
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
                "label": "O que será carregado",
                "type": "text",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "textLong": True,
                "spec": "Backend: cria a etapa e materializa grupos + tipos do catálogo.",
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
                        "Incluirá as etapas e respectivos grupos/documentos:\n"
                        + "\n".join(resumo_parts)
                    ),
                },
            }
        ],
        "activeExamplePresetId": "patlasv4proto-p-meth-iet",
    }
    ids = {f["id"]: i for i, f in enumerate(forms)}
    if FORM_METH_ETAPAS in ids:
        forms[ids[FORM_METH_ETAPAS]] = form
    else:
        forms.append(form)


def patch_org(org: dict, tipos_map: dict[str, list[str]]) -> None:
    fields = org["fields"]

    # Remover campo Grupos a incluir
    org["fields"] = [f for f in fields if f["id"] != "patlasv4proto-uo-grupos-selecao"]
    fields = org["fields"]
    by_id = {f["id"]: f for f in fields}

    if "patlasv4proto-uo-etapas-selecao" in by_id:
        by_id["patlasv4proto-uo-etapas-selecao"]["spec"] = (
            "Selecione apenas as etapas e use Incluir etapas. "
            "Grupos e documentos vêm do catálogo (configurados na etapa) — não há seleção de grupo aqui."
        )
        by_id["patlasv4proto-uo-etapas-selecao"]["label"] = "Etapas a incluir"

    if "patlasv4proto-uo-etapas-documentacionais" in by_id:
        ef = by_id["patlasv4proto-uo-etapas-documentacionais"]
        ef["label"] = "Etapas incluídas"
        ef["readOnly"] = False
        ef["spec"] = (
            "Resultado de Incluir etapas. Cada etapa exibe os grupos configurados no catálogo "
            "e os documentos de cada grupo. Na Organização só se seleciona a etapa — "
            "grupo não é escolhido aqui."
        )

    # Tirar grupos-selecao das regras
    for rule in org.get("fieldVisibilityRules") or []:
        tids = rule.get("targetFieldIds") or []
        if "patlasv4proto-uo-grupos-selecao" in tids:
            rule["targetFieldIds"] = [
                t for t in tids if t != "patlasv4proto-uo-grupos-selecao"
            ]

    # Remover método Incluir grupos
    org["methods"] = [
        m
        for m in (org.get("methods") or [])
        if m.get("id") != "patlasv4proto-uo-meth-incluir-grupos"
        and m.get("inputFormId") != FORM_METH_GRUPOS
    ]

    # Garantir método Incluir etapas
    methods = org.setdefault("methods", [])
    if not any(m.get("id") == "patlasv4proto-uo-meth-incluir-etapas" for m in methods):
        idx = next(
            (i for i, m in enumerate(methods) if m["id"] == "patlasv4proto-uo-meth-salvar"),
            0,
        )
        methods.insert(
            idx + 1,
            {
                "id": "patlasv4proto-uo-meth-incluir-etapas",
                "name": "Incluir etapas",
                "icon": "playlist_add",
                "kind": "destaque",
                "inputFormId": FORM_METH_ETAPAS,
            },
        )

    # Presets: etapas completas a partir do catálogo (grupos+tipos), sem grupos-selecao
    for preset in org.get("exampleValuePresets") or []:
        fv = preset.setdefault("fieldValues", {})
        fv.pop("patlasv4proto-uo-grupos-selecao", None)
        emb = preset.setdefault("embeddedRowsByFieldId", {})

        # Quais etapas manter: as já presentes ou as de etapas-selecao
        existing = emb.get("patlasv4proto-uo-etapas-documentacionais") or []
        names = [r.get("patlasv4proto-uoetapa-nome") for r in existing if r.get("patlasv4proto-uoetapa-nome")]
        if not names and fv.get("patlasv4proto-uo-etapas-selecao"):
            names = list(fv["patlasv4proto-uo-etapas-selecao"])
        if not names and preset.get("id", "").endswith("parceiro"):
            names = ["Habilitação documental", "Execução da parceria"]
        if not names and preset.get("id", "").endswith("-mti"):
            names = ["Habilitação documental", "Execução da parceria"]

        if names:
            fv["patlasv4proto-uo-etapas-selecao"] = names
            # Para demo, manter dados de anexo já existentes quando possível,
            # mas garantir estrutura grupo←etapa do catálogo.
            # Rebuild from catalog for consistency with the new rule.
            emb["patlasv4proto-uo-etapas-documentacionais"] = [
                build_etapa_row(n, i + 1, tipos_map, max_tipos=3)
                for i, n in enumerate(names)
            ]

    org["metadata"] = (
        "Protótipo Atlas — Organização. Documentos: selecionar/incluir apenas a etapa; "
        "grupos e documentos vêm do catálogo (Grupo de Documento configurado na etapa)."
    )


def patch_class_groups() -> None:
    data = json.loads(CLASS_GROUPS.read_text(encoding="utf-8"))
    assigns = data.setdefault("assignments", {})
    assigns.pop(FORM_METH_GRUPOS, None)
    order = data.setdefault("memberOrderByGroup", {})
    met = order.setdefault("grp-01-organizacao-met", [])
    if FORM_METH_GRUPOS in met:
        met.remove(FORM_METH_GRUPOS)
    if FORM_METH_ETAPAS not in met:
        met.append(FORM_METH_ETAPAS)
    assigns[FORM_METH_ETAPAS] = "grp-01-organizacao-met"
    CLASS_GROUPS.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    tipos_map = tipos_por_grupo(forms)

    # Garantir etapa no catálogo Grupo de Documento
    gdoc = next(f for f in forms if f["id"] == FORM_GDOC)
    if not any(f["id"] == "patlasv4proto-gdoc-etapa" for f in gdoc["fields"]):
        gdoc["fields"].insert(
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
                    "Etapa em que este grupo é configurado. Na Organização, ao incluir a etapa, "
                    "este grupo e seus tipos aparecem automaticamente."
                ),
            },
        )
    for p in gdoc.get("exampleValuePresets") or []:
        nome = (p.get("fieldValues") or {}).get("patlasv4proto-gdoc-nome")
        if nome in GRUPO_ETAPA:
            p.setdefault("fieldValues", {})["patlasv4proto-gdoc-etapa"] = GRUPO_ETAPA[nome]
    gdoc["metadata"] = (
        "Catálogo — grupo de documentos configurado em uma Etapa documentacional. "
        "Na Organização só se inclui a etapa; grupos e tipos vêm daqui."
    )

    patch_etapa_form(forms)
    patch_grupo_form(forms)
    patch_meth_etapas(forms, tipos_map)

    # Remover form do método Incluir grupos se existir
    forms = [f for f in forms if f["id"] != FORM_METH_GRUPOS]

    org = next(f for f in forms if f["id"] == FORM_UO)
    patch_org(org, tipos_map)
    patch_class_groups()

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    v = json.loads(FORMS.read_text(encoding="utf-8"))
    org2 = next(f for f in v if f["id"] == FORM_UO)
    fids = {f["id"] for f in org2["fields"]}
    mids = {m["id"] for m in org2.get("methods") or []}
    etapa = next(f for f in v if f["id"] == FORM_ETAPA)
    grupos_f = next(x for x in etapa["fields"] if x["id"] == "patlasv4proto-uoetapa-grupos")
    msg = (
        f"OK. sem_grupos_selecao={('patlasv4proto-uo-grupos-selecao' not in fids)} "
        f"sem_meth_grupos={('patlasv4proto-uo-meth-incluir-grupos' not in mids)} "
        f"meth_etapas={('patlasv4proto-uo-meth-incluir-etapas' in mids)} "
        f"grupos_readonly={grupos_f.get('readOnly')} "
        f"form_meth_grupos={any(f['id']==FORM_METH_GRUPOS for f in v)}"
    )
    print(msg.encode("ascii", "replace").decode("ascii"))


if __name__ == "__main__":
    main()
