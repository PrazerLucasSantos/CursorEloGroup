# -*- coding: utf-8 -*-
"""Implementa gaps/parciais DIRC (PDF PEAP F3) no protótipo backoffice."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS_PATHS = [
    ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json",
    ROOT / "data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json",
]

FORM_PRODUTO = "form-patlasv4-proto-cat-produto"
FORM_PARCERIA = "form-patlasv4-proto-cat-parceria"
FORM_DADOS = "form-patlasv4-proto-cat-dados-parceria"
FORM_GRP_ATEND = "form-patlasv4-proto-cat-grupo-atendimento"


def field(
    fid: str,
    label: str,
    typ: str,
    *,
    required: bool = False,
    relevance: str = "common",
    size: str = "medium",
    options: list[str] | None = None,
    linked: str | None = None,
    spec: str = "",
    read_only: bool = False,
) -> dict:
    f: dict = {
        "id": fid,
        "label": label,
        "type": typ,
        "size": size,
        "readOnly": read_only,
        "required": required,
        "multiple": False,
        "relevance": relevance,
        "spec": spec,
    }
    if options is not None:
        f["options"] = options
    if linked is not None:
        f["linkedFormId"] = linked
    return f


def ensure_grupo_atendimento(forms: list[dict]) -> None:
    if any(f.get("id") == FORM_GRP_ATEND for f in forms):
        return
    forms.append(
        {
            "id": FORM_GRP_ATEND,
            "name": "Grupo de Atendimento",
            "metadata": (
                "PDF PEAP F3: UG/GO (Gerências de Unidade e Operacionais) "
                "responsáveis pelo atendimento do item."
            ),
            "sectionLayout": "none",
            "sections": [],
            "fields": [
                field(
                    f"{FORM_GRP_ATEND}-identificador",
                    "Identificador",
                    "text",
                    required=True,
                    relevance="identity",
                    spec="Sigla/nome da UG ou GO (ex.: UG-CLOUD, GO-SIMPLIFICA).",
                ),
                field(
                    f"{FORM_GRP_ATEND}-tipo",
                    "Tipo",
                    "textOptions",
                    required=True,
                    options=["UG", "GO", "Outro"],
                    spec="UG = Gerência de Unidade; GO = Gerência Operacional (PDF DIRC).",
                ),
                field(
                    f"{FORM_GRP_ATEND}-descricao",
                    "Descrição",
                    "text",
                    size="large",
                    spec="Escopo de atendimento da gerência.",
                ),
            ],
            "methods": [],
            "exampleValuePresets": [
                {
                    "id": "preset-grp-atend-ug-cloud",
                    "name": "UG Cloud",
                    "iconColor": "#0c1ba8",
                    "fieldValues": {
                        f"{FORM_GRP_ATEND}-identificador": "UG-CLOUD",
                        f"{FORM_GRP_ATEND}-tipo": "UG",
                        f"{FORM_GRP_ATEND}-descricao": "Atendimento soluções cloud / HOST",
                    },
                },
                {
                    "id": "preset-grp-atend-go-simp",
                    "name": "GO Simplifica",
                    "iconColor": "#0f766e",
                    "fieldValues": {
                        f"{FORM_GRP_ATEND}-identificador": "GO-SIMPLIFICA",
                        f"{FORM_GRP_ATEND}-tipo": "GO",
                        f"{FORM_GRP_ATEND}-descricao": "Operação do catálogo Simplifica",
                    },
                },
            ],
            "activeExamplePresetId": "preset-grp-atend-ug-cloud",
            "defaultCanvasMode": "read",
        }
    )


NEW_PRODUTO_FIELDS = [
    field(
        f"{FORM_PRODUTO}-descricao-solucao",
        "Descrição da solução ofertada",
        "html",
        size="large",
        spec=(
            "**PDF PEAP F3 / DIRC:** descrição comercial da solução ofertada no item. "
            "Complementa a classe Solução; visível no produto para cadastro/CSV."
        ),
    ),
    field(
        f"{FORM_PRODUTO}-especificacao-01",
        "Especificação 01",
        "text",
        size="large",
        spec="Atributo DIRC — detalhe técnico/comercial 1.",
    ),
    field(
        f"{FORM_PRODUTO}-especificacao-02",
        "Especificação 02",
        "text",
        size="large",
        spec="Atributo DIRC — detalhe técnico/comercial 2.",
    ),
    field(
        f"{FORM_PRODUTO}-especificacao-03",
        "Especificação 03",
        "text",
        size="large",
        spec="Atributo DIRC — detalhe técnico/comercial 3.",
    ),
    field(
        f"{FORM_PRODUTO}-especificacao-04",
        "Especificação 04",
        "text",
        size="large",
        spec="Atributo DIRC — detalhe técnico/comercial 4.",
    ),
    field(
        f"{FORM_PRODUTO}-periodo-minimo",
        "Período mínimo",
        "textOptions",
        options=["12 meses", "24 meses", "36 meses", "48 meses", "Perpétuo", "Sob demanda"],
        spec="PDF DIRC: prazo mínimo de consumo/contratação do item (12/24/36…).",
    ),
    field(
        f"{FORM_PRODUTO}-grupo-atendimento",
        "Grupo de atendimento (UG/GO)",
        "reference",
        linked=FORM_GRP_ATEND,
        spec="PDF DIRC: gerência UG/GO responsável pelo atendimento do item.",
    ),
    field(
        f"{FORM_PRODUTO}-data-atualizacao-preco",
        "Data de atualização de preço",
        "date",
        size="small",
        spec="PDF DIRC: quando os preços foram homologados pela DIREX.",
    ),
    field(
        f"{FORM_PRODUTO}-ultimo-indice-reajuste",
        "Último índice de reajuste",
        "text",
        spec="PDF DIRC: diferença preço original×atualizado (ICTI/IPCA acumulado 12 meses, etc.).",
    ),
    field(
        f"{FORM_PRODUTO}-ultima-homologacao",
        "Última homologação (DIREX)",
        "date",
        size="small",
        spec="PDF DIRC: data da assinatura da última homologação pela DIREX.",
    ),
    field(
        f"{FORM_PRODUTO}-riscos",
        "Riscos",
        "html",
        size="large",
        spec="PDF DIRC: artefato de gestão de projeto associado ao item de catálogo.",
    ),
    field(
        f"{FORM_PRODUTO}-restricoes",
        "Restrições",
        "html",
        size="large",
        spec="PDF DIRC: restrições do item/oferta.",
    ),
    field(
        f"{FORM_PRODUTO}-exigencias",
        "Exigências",
        "html",
        size="large",
        spec="PDF DIRC: exigências para consumo/entrega.",
    ),
    field(
        f"{FORM_PRODUTO}-marcos-sucesso",
        "Marcos de sucesso",
        "html",
        size="large",
        spec="PDF DIRC: marcos de sucesso da oferta/serviço.",
    ),
    field(
        f"{FORM_PRODUTO}-prazo-entrega",
        "Prazo de entrega",
        "text",
        spec="PDF DIRC: prazo de entrega associado ao item.",
    ),
]


def patch_produto(form: dict) -> None:
    fields = form.setdefault("fields", [])
    existing = {f.get("id") for f in fields}

    # Expand status options
    for fld in fields:
        if fld.get("id") == f"{FORM_PRODUTO}-status":
            opts = list(fld.get("options") or [])
            for o in ("Ativo", "Suspenso", "Reajuste de Preço", "Homologado", "Paralisado", "Concluído"):
                if o not in opts:
                    opts.append(o)
            fld["options"] = opts
            fld["spec"] = (
                "**PDF DIRC / Discovery:** status operacional do item "
                "(Ativo / Suspenso / Reajuste de Preço / Homologado / Paralisado / Concluído).\n\n"
                "Distinto do status do fluxo portal↔MTI."
            )

    # Insert new fields before observacoes
    insert_at = next(
        (i for i, f in enumerate(fields) if f.get("id") == f"{FORM_PRODUTO}-observacoes"),
        len(fields),
    )
    to_add = [deepcopy(f) for f in NEW_PRODUTO_FIELDS if f["id"] not in existing]
    for i, nf in enumerate(to_add):
        fields.insert(insert_at + i, nf)

    # Enrich presets
    for preset in form.get("exampleValuePresets") or []:
        fv = preset.setdefault("fieldValues", {})
        fv.setdefault(
            f"{FORM_PRODUTO}-descricao-solucao",
            "Solução de implantação e capacitação no ecossistema MTI Simplifica.",
        )
        fv.setdefault(f"{FORM_PRODUTO}-especificacao-01", "Escopo: discovery + configuração inicial")
        fv.setdefault(f"{FORM_PRODUTO}-especificacao-02", "Entregáveis: plano de implantação e handover")
        fv.setdefault(f"{FORM_PRODUTO}-especificacao-03", "Ambiente: Produção após homologação MTI")
        fv.setdefault(f"{FORM_PRODUTO}-especificacao-04", "Suporte: horário comercial")
        fv.setdefault(f"{FORM_PRODUTO}-periodo-minimo", "12 meses")
        fv.setdefault(f"{FORM_PRODUTO}-data-atualizacao-preco", "2026-03-01")
        fv.setdefault(f"{FORM_PRODUTO}-ultimo-indice-reajuste", "IPCA 12m 4,2%")
        fv.setdefault(f"{FORM_PRODUTO}-ultima-homologacao", "2026-03-15")
        fv.setdefault(f"{FORM_PRODUTO}-prazo-entrega", "30 dias corridos após OS")
        if f"{FORM_PRODUTO}-status" in fv and fv[f"{FORM_PRODUTO}-status"] == "Ativo":
            pass


def patch_parceria(form: dict) -> None:
    fields = form.setdefault("fields", [])
    existing = {f.get("id") for f in fields}
    for fld in fields:
        if fld.get("id") == f"{FORM_PARCERIA}-status":
            opts = list(fld.get("options") or [])
            for o in (
                "Ativa",
                "Homologada (DIREX)",
                "Aguardando homologação DIREX",
                "Paralisada",
                "Concluída",
            ):
                if o not in opts:
                    opts.append(o)
            # keep legacy Homologada if present
            if "Homologada" not in opts:
                opts.insert(1, "Homologada")
            fld["options"] = opts
            fld["spec"] = (
                "**PDF PEAP F3:** homologação da parceria pela alta administração "
                "(Diretores/Presidência/DIREX). Homologada (DIREX) autoriza uso dos produtos.\n\n"
                "Obrigatório."
            )

    extras = [
        field(
            f"{FORM_PARCERIA}-data-homologacao-direx",
            "Data homologação DIREX",
            "date",
            size="small",
            spec="Data da autorização institucional da parceria (DIREX/Presidência).",
        ),
        field(
            f"{FORM_PARCERIA}-responsavel-homologacao",
            "Responsável homologação",
            "text",
            spec="Diretor/Presidência que atestou a parceria.",
        ),
    ]
    for nf in extras:
        if nf["id"] not in existing:
            fields.append(nf)


def patch_dados_parceria(form: dict) -> None:
    fields = form.setdefault("fields", [])
    existing = {f.get("id") for f in fields}
    extras = [
        field(
            f"{FORM_DADOS}-periodo-minimo",
            "Período mínimo (comercial)",
            "textOptions",
            options=["12 meses", "24 meses", "36 meses", "48 meses", "Perpétuo"],
            spec="Espelho comercial do período mínimo do item (PDF DIRC) na combinação parceria×produto.",
        ),
    ]
    for nf in extras:
        if nf["id"] not in existing:
            # insert after vigencia if possible
            idx = next(
                (i for i, f in enumerate(fields) if "vigencia" in (f.get("id") or "")),
                len(fields) - 1,
            )
            fields.insert(idx + 1, nf)


def process(path: Path) -> None:
    if not path.exists():
        print("skip", path)
        return
    forms = json.loads(path.read_text(encoding="utf-8"))
    # atlas-v4 may use different product id
    ensure_grupo_atendimento(forms)
    for form in forms:
        fid = form.get("id") or ""
        if fid == FORM_PRODUTO or (fid.endswith("cat-produto") and "metodo" not in fid):
            if "produto" in fid and "servico" not in fid:
                patch_produto(form)
        if fid == FORM_PARCERIA or fid.endswith("cat-parceria"):
            patch_parceria(form)
        if fid == FORM_DADOS or "dados-parceria" in fid:
            patch_dados_parceria(form)

    path.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("patched", path)


def main() -> None:
    for p in FORMS_PATHS:
        process(p)


if __name__ == "__main__":
    main()
