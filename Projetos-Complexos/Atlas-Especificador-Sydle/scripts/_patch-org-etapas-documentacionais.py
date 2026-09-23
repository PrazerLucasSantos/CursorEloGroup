# -*- coding: utf-8 -*-
"""Organização: hierarquia Etapa documentacional → Grupo → Tipos."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
CLASS_GROUPS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json"

FORM_ETAPA = "form-patlasv4-proto-uo-etapa-documentacional"
FORM_GRUPO = "form-patlasv4-proto-uo-grupo-doc-etapa"
FORM_UO = "form-patlasv4-proto-unidade-organizacional"
FORM_UOdoc = "form-patlasv4-proto-uo-documento"
FORM_GDOC = "form-patlasv4-proto-grupo-documento"

FIELD_ETAPAS = "patlasv4proto-uo-etapas-documentacionais"
OLD_FIELDS = [
    "patlasv4proto-uo-grupos-mipp-referencia",
    "patlasv4proto-uo-documentos",
    "patlasv4proto-uo-docs-execucao",
]


def form_etapa() -> dict:
    return {
        "id": FORM_ETAPA,
        "name": "(01.e8) Etapa documentacional",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Agrupador documental da Organização. Cada etapa (Habilitação, Pré-rito, Execução) "
            "contém grupos de documentos; cada grupo contém os tipos/anexos."
        ),
        "fields": [
            {
                "id": "patlasv4proto-uoetapa-nome",
                "label": "Etapa documentacional",
                "type": "textOptions",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "options": [
                    "Habilitação documental",
                    "Pré-rito parceria",
                    "Execução da parceria",
                ],
                "spec": (
                    "Fase documental da organização. Habilitação: grade MIPP do parceiro. "
                    "Pré-rito: checklist interno pós pré-rito comercial. "
                    "Execução: modelos operacionais da parceria."
                ),
            },
            {
                "id": "patlasv4proto-uoetapa-ordem",
                "label": "Ordem",
                "type": "number",
                "size": "small",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "spec": "Sequência de exibição das etapas na aba Documentos (1, 2, 3…).",
            },
            {
                "id": "patlasv4proto-uoetapa-ativo",
                "label": "Ativo",
                "type": "boolean",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "common",
                "spec": "Etapa inativa deixa de exigir documentos novos, sem apagar o histórico.",
            },
            {
                "id": "patlasv4proto-uoetapa-grupos",
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
                    "Grupos vinculados a esta etapa. Dentro de cada grupo ficam os tipos de documento "
                    "(anexos e validação)."
                ),
            },
        ],
        "exampleValuePresets": [],
    }


def form_grupo() -> dict:
    return {
        "id": FORM_GRUPO,
        "name": "(01.e9) Grupo de documentos na etapa",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Grupo documental dentro de uma etapa da Organização. Referencia o catálogo "
            "Grupo de Documento e embute os tipos/anexos da grade."
        ),
        "fields": [
            {
                "id": "patlasv4proto-uogrpetapa-grupo",
                "label": "Grupo de documentos",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "linkedFormId": FORM_GDOC,
                "options": [
                    "Habilitação Jurídica",
                    "Qualificação Técnica",
                    "Qualificação Econômica e Financeira",
                    "Compliance (adendo)",
                    "Pré-rito parceria",
                    "Documentos de execução",
                ],
                "spec": "Referência ao cadastro Grupo de Documento (catálogo).",
            },
            {
                "id": "patlasv4proto-uogrpetapa-progresso",
                "label": "Progresso",
                "type": "text",
                "size": "small",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "spec": "Calculado — anexos válidos / tipos exigidos no grupo (ex.: 12/19).",
            },
            {
                "id": "patlasv4proto-uogrpetapa-tipos",
                "label": "Tipos de documentos",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "linkedFormId": FORM_UOdoc,
                "embeddedDisplay": "table",
                "spec": (
                    "Tipos/anexos deste grupo. Grade com tipo, arquivo, vencimento e status de validação."
                ),
            },
        ],
        "exampleValuePresets": [],
    }


def nest_tipos(docs: list[dict]) -> list[dict]:
    """Agrupa linhas flat de uo-documento por grupo (campo mqlh6yafch5jzb)."""
    by_group: dict[str, list[dict]] = {}
    for row in docs:
        g = str(row.get("mqlh6yafch5jzb") or "Habilitação Jurídica")
        row = {**row, "mqlh6yafch5jzb": g}
        by_group.setdefault(g, []).append(row)
    out = []
    for g, rows in by_group.items():
        out.append(
            {
                "patlasv4proto-uogrpetapa-grupo": g,
                "patlasv4proto-uogrpetapa-progresso": f"{len(rows)}/{len(rows)}",
                "patlasv4proto-uogrpetapa-tipos": {"embeddedDemoInstances": rows},
            }
        )
    return out


def exec_to_tipos(rows: list[dict]) -> list[dict]:
    """Converte docs de execução para linhas no formato uo-documento (demo)."""
    mapped = []
    for r in rows:
        mapped.append(
            {
                "mqlh6yafch5jzb": "Documentos de execução",
                "patlasv4proto-uodoc-tipo": r.get("patlasv4proto-uodexec-tipo", ""),
                "patlasv4proto-uodoc-arquivo": r.get("patlasv4proto-uodexec-arquivo", ""),
                "patlasv4proto-uodoc-data-anexo": r.get("patlasv4proto-uodexec-data-anexo", ""),
                "patlasv4proto-uodoc-status-validacao": "Aprovado"
                if r.get("patlasv4proto-uodexec-ativo")
                else "Pendente",
            }
        )
    return mapped


def build_etapas_from_preset(emb: dict) -> list[dict]:
    docs = list(emb.get("patlasv4proto-uo-documentos") or [])
    exec_docs = list(emb.get("patlasv4proto-uo-docs-execucao") or [])
    etapas: list[dict] = []

    if docs:
        etapas.append(
            {
                "patlasv4proto-uoetapa-nome": "Habilitação documental",
                "patlasv4proto-uoetapa-ordem": 1,
                "patlasv4proto-uoetapa-ativo": True,
                "patlasv4proto-uoetapa-grupos": {"embeddedDemoInstances": nest_tipos(docs)},
            }
        )

    if exec_docs:
        tipos = exec_to_tipos(exec_docs)
        # Papel timbrado / Logo etc. → etapa Execução; se tiver Contrato/Planos → Pré-rito
        prerito_names = {
            "Contrato de Parceria",
            "Plano de Negócio",
            "Plano de Operação",
            "Papel Timbrado",
            "Logo Marca",
        }
        prerito = [t for t in tipos if t.get("patlasv4proto-uodoc-tipo") in prerito_names]
        execucao = [t for t in tipos if t not in prerito]
        # Papel timbrado e Logo no preset atual vão para Execução (não estão no set pré-rito com capitalização exata)
        # "Papel timbrado" vs "Papel Timbrado" — normalize
        prerito2, execucao2 = [], []
        for t in tipos:
            nome = str(t.get("patlasv4proto-uodoc-tipo") or "")
            if nome.casefold() in {x.casefold() for x in prerito_names} or nome.casefold() in {
                "papel timbrado",
                "logo marca",
                "logo institucional",
            }:
                # Logo institucional / Papel timbrado: Execução operacional
                if nome.casefold() in {"papel timbrado", "logo marca", "logo institucional"}:
                    execucao2.append(t)
                else:
                    prerito2.append(t)
            else:
                execucao2.append(t)

        ordem = 2 if docs else 1
        if prerito2:
            etapas.append(
                {
                    "patlasv4proto-uoetapa-nome": "Pré-rito parceria",
                    "patlasv4proto-uoetapa-ordem": ordem,
                    "patlasv4proto-uoetapa-ativo": True,
                    "patlasv4proto-uoetapa-grupos": {
                        "embeddedDemoInstances": [
                            {
                                "patlasv4proto-uogrpetapa-grupo": "Pré-rito parceria",
                                "patlasv4proto-uogrpetapa-progresso": f"{len(prerito2)}/5",
                                "patlasv4proto-uogrpetapa-tipos": {
                                    "embeddedDemoInstances": prerito2
                                },
                            }
                        ]
                    },
                }
            )
            ordem += 1
        if execucao2:
            etapas.append(
                {
                    "patlasv4proto-uoetapa-nome": "Execução da parceria",
                    "patlasv4proto-uoetapa-ordem": ordem,
                    "patlasv4proto-uoetapa-ativo": True,
                    "patlasv4proto-uoetapa-grupos": {
                        "embeddedDemoInstances": [
                            {
                                "patlasv4proto-uogrpetapa-grupo": "Documentos de execução",
                                "patlasv4proto-uogrpetapa-progresso": f"{len(execucao2)}/{len(execucao2)}",
                                "patlasv4proto-uogrpetapa-tipos": {
                                    "embeddedDemoInstances": execucao2
                                },
                            }
                        ]
                    },
                }
            )

    return etapas


def patch_org(org: dict) -> None:
    """Mantém as subseções existentes; coloca a hierarquia na Habilitação documental."""
    fields = org["fields"]
    by_id = {f["id"]: f for f in fields}

    # Campos antigos: ocultos e fora das regras de show
    for fid in OLD_FIELDS:
        if fid in by_id:
            by_id[fid]["hidden"] = True
            if fid == "patlasv4proto-uo-grupos-mipp-referencia":
                by_id[fid]["spec"] = (
                    "Legado — substituído por Etapas documentacionais (Etapa → Grupo → Tipos)."
                )
            elif fid == "patlasv4proto-uo-documentos":
                by_id[fid]["spec"] = (
                    "Legado — tipos agora ficam dentro de cada Grupo na etapa. Mantido oculto."
                )
            elif fid == "patlasv4proto-uo-docs-execucao":
                by_id[fid]["spec"] = (
                    "Legado — migrado para a etapa Execução da parceria. Mantido oculto."
                )

    etapas_field = {
        "id": FIELD_ETAPAS,
        "label": "Etapas documentacionais",
        "type": "embeddedReference",
        "size": "large",
        "readOnly": False,
        "required": False,
        "multiple": True,
        "relevance": "common",
        "sectionId": "sec-patlasv4proto-uo-documentos-aba",
        "linkedFormId": FORM_ETAPA,
        "embeddedDisplay": "form",
        # hidden=true + regra Empresa=Sim (mesmo padrão dos demais campos da aba Documentos)
        "hidden": True,
        "spec": (
            "Agrupamento: Etapa documentacional → Grupo de documentos → Tipos de documentos. "
            "Visível na organização raiz (Empresa = Sim)."
        ),
    }

    if FIELD_ETAPAS in by_id:
        # atualizar in-place
        for k, v in etapas_field.items():
            by_id[FIELD_ETAPAS][k] = v
    else:
        insert_at = next(
            (
                i
                for i, f in enumerate(fields)
                if f["id"] == "patlasv4proto-uo-grupos-mipp-referencia"
            ),
            len(fields),
        )
        fields.insert(insert_at, etapas_field)

    # Visibility: trocar old fields por FIELD_ETAPAS nas regras Empresa
    for rule in org.get("fieldVisibilityRules") or []:
        targets = rule.get("targetFieldIds") or []
        touched = False
        new_targets = []
        for t in targets:
            if t in OLD_FIELDS:
                touched = True
                continue
            new_targets.append(t)
        if touched or FIELD_ETAPAS in targets or rule["id"] in (
            "rule-uo-show-ajustes-empresa",
            "rule-uo-hide-ajustes-nao-empresa",
        ):
            if FIELD_ETAPAS not in new_targets and rule["id"] in (
                "rule-uo-show-ajustes-empresa",
                "rule-uo-hide-ajustes-nao-empresa",
            ):
                new_targets.append(FIELD_ETAPAS)
            rule["targetFieldIds"] = new_targets

    # Presets: migrar documentos/execucao → etapas aninhadas
    for preset in org.get("exampleValuePresets") or []:
        emb = preset.setdefault("embeddedRowsByFieldId", {})
        fv = preset.get("fieldValues") or {}
        # Se já tem etapas, não sobrescrever (idempotente parcial)
        if emb.get(FIELD_ETAPAS):
            emb.pop("patlasv4proto-uo-documentos", None)
            emb.pop("patlasv4proto-uo-docs-execucao", None)
            continue
        etapas = build_etapas_from_preset(emb)
        if not etapas and fv.get("patlasv4proto-uo-grupos-mipp-referencia"):
            grupos_ref = fv["patlasv4proto-uo-grupos-mipp-referencia"]
            if isinstance(grupos_ref, list):
                etapas = [
                    {
                        "patlasv4proto-uoetapa-nome": "Habilitação documental",
                        "patlasv4proto-uoetapa-ordem": 1,
                        "patlasv4proto-uoetapa-ativo": True,
                        "patlasv4proto-uoetapa-grupos": {
                            "embeddedDemoInstances": [
                                {
                                    "patlasv4proto-uogrpetapa-grupo": g,
                                    "patlasv4proto-uogrpetapa-progresso": "0/—",
                                    "patlasv4proto-uogrpetapa-tipos": {
                                        "embeddedDemoInstances": []
                                    },
                                }
                                for g in grupos_ref
                            ]
                        },
                    }
                ]
        if etapas:
            emb[FIELD_ETAPAS] = etapas
        emb.pop("patlasv4proto-uo-documentos", None)
        emb.pop("patlasv4proto-uo-docs-execucao", None)

    org["metadata"] = (
        "Protótipo Atlas Fase 1 — Organização. Documentos agrupados por "
        "Etapa documentacional → Grupo de documentos → Tipos. Só na org raiz (Empresa=Sim). "
        "Decisão Luiz 19/06/2026."
    )


def ensure_gdoc_presets(forms: list[dict]) -> None:
    gdoc = next(f for f in forms if f["id"] == FORM_GDOC)
    presets = gdoc.setdefault("exampleValuePresets", [])
    existing = {p.get("name") for p in presets}
    extras = [
        ("Pré-rito parceria", "#b45309", "patlasv4proto-p-gdoc-prerito"),
        ("Documentos de execução", "#334155", "patlasv4proto-p-gdoc-execucao"),
    ]
    for name, color, pid in extras:
        if name in existing:
            continue
        presets.append(
            {
                "id": pid,
                "name": name,
                "iconColor": color,
                "fieldValues": {
                    "patlasv4proto-gdoc-nome": name,
                    "patlasv4proto-gdoc-ativo": True,
                },
            }
        )
    # Atualizar options onde Grupo é referenciado no form grupo-na-etapa (já no form)
    # Também no form uo-documento e tipo-documento options
    for f in forms:
        for field in f.get("fields") or []:
            if field.get("linkedFormId") == FORM_GDOC and isinstance(field.get("options"), list):
                for name, _, _ in extras:
                    if name not in field["options"]:
                        field["options"].append(name)


def patch_class_groups() -> None:
    data = json.loads(CLASS_GROUPS.read_text(encoding="utf-8"))
    assigns = data.setdefault("assignments", {})
    order = data.setdefault("memberOrderByGroup", {}).setdefault(
        "grp-01-organizacao-emb", []
    )
    for fid in (FORM_ETAPA, FORM_GRUPO):
        assigns[fid] = "grp-01-organizacao-emb"
        if fid not in order:
            # inserir após uo-documento
            if FORM_UOdoc in order:
                i = order.index(FORM_UOdoc) + 1
                order.insert(i, fid)
            else:
                order.append(fid)
    CLASS_GROUPS.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    ids = {f["id"] for f in forms}

    if FORM_GRUPO not in ids:
        # inserir após uo-documento
        idx = next(i for i, f in enumerate(forms) if f["id"] == FORM_UOdoc)
        forms.insert(idx + 1, form_grupo())
        forms.insert(idx + 2, form_etapa())
    else:
        # atualizar in-place
        for i, f in enumerate(forms):
            if f["id"] == FORM_ETAPA:
                forms[i] = form_etapa()
            elif f["id"] == FORM_GRUPO:
                forms[i] = form_grupo()

    org = next(f for f in forms if f["id"] == FORM_UO)
    patch_org(org)
    ensure_gdoc_presets(forms)
    patch_class_groups()

    FORMS.write_text(
        json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    # verify
    verify = json.loads(FORMS.read_text(encoding="utf-8"))
    vids = {f["id"] for f in verify}
    org2 = next(f for f in verify if f["id"] == FORM_UO)
    has_field = any(f["id"] == FIELD_ETAPAS for f in org2["fields"])
    msg = (
        f"OK patch applied. etapa_form={FORM_ETAPA in vids} "
        f"grupo_form={FORM_GRUPO in vids} field={has_field}"
    )
    print(msg.encode("ascii", "replace").decode("ascii"))


if __name__ == "__main__":
    main()
