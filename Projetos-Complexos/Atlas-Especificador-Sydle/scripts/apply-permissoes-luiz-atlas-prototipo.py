#!/usr/bin/env python3
"""Aplica modelo de permissões Luiz/MTI (reunião 19/06/2026) em atlas-prototipo/epics/prototipo/forms.json."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS_PATH = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"

UO_MODULOS_OPTIONS = [
    "Parcerias",
    "Propostas",
    "Catálogos",
    "Workflow",
    "Relatórios",
    "Saldo",
    "Contábil",
    "Pedidos de venda",
    "Cadastro de fornecedor",
]

UO_MODULOS_FIELD = {
    "id": "patlasv4proto-uo-modulos-visiveis",
    "label": "Módulos visíveis",
    "type": "textOptions",
    "size": "large",
    "readOnly": False,
    "required": False,
    "multiple": True,
    "relevance": "highlight",
    "sectionId": "sec-patlasv4proto-uo-permissoes",
    "options": UO_MODULOS_OPTIONS,
    "spec": "Decisão 19/06/2026 (Luiz/MTI): cardápio de funcionalidades que esta UO enxerga na hierarquia. Permissão efetiva = interseção com módulos do Cargo (executor) ou acesso total se Cargo.Administrador = Sim.",
}

UO_PERMISSOES_SECTION = {
    "id": "sec-patlasv4proto-uo-permissoes",
    "title": "Permissões da UO",
    "icon": "security",
}

CARGO_UO_FIELD = {
    "id": "patlasv4proto-cargo-unidade-organizacional",
    "label": "Unidade organizacional",
    "type": "textOptions",
    "size": "medium",
    "readOnly": False,
    "required": True,
    "multiple": False,
    "relevance": "highlight",
    "sectionId": "sec-cargo-dados-do-cargo",
    "options": [
        "MTI",
        "MTI/DIRC",
        "MTI/DIRC/UGP",
        "MTI/DTIC",
        "MTI/DIRADM",
        "EloGroup",
        "SEPLAG/GECON",
    ],
    "spec": "Decisão 19/06/2026: cargo vinculado à UO (nível n1, n2…). Caminho hierárquico da árvore organizacional. Ocupante herda esta UO — não seleciona UO no Atribuir cargo.",
}

CARGO_ADMIN_FIELD = {
    "id": "patlasv4proto-cargo-administrador",
    "label": "Administrador",
    "type": "boolean",
    "size": "small",
    "readOnly": False,
    "required": True,
    "multiple": False,
    "relevance": "highlight",
    "sectionId": "sec-cargo-permissoes-de-visualizacao",
    "spec": "Sim → acesso total; ignora filtro hierárquico da UO. Não → executor; módulos limitados pelo campo Módulos (executor) e pela UO.",
}

UO_PRESET_MODULES: dict[str, list[str]] = {
    "patlasv4proto-p-unidade-organizacional-mti": UO_MODULOS_OPTIONS,
    "patlasv4proto-p-uo-mti-ii-1-3": [
        "Parcerias",
        "Propostas",
        "Catálogos",
        "Workflow",
    ],
    "patlasv4proto-p-uo-mti-ii-1-2": [
        "Relatórios",
        "Saldo",
    ],
    "patlasv4proto-p-uo-mti-ii-1-1": [
        "Contábil",
        "Pedidos de venda",
        "Relatórios",
        "Cadastro de fornecedor",
    ],
    "patlasv4proto-p-uo-mti-iii-6": [
        "Propostas",
        "Catálogos",
    ],
}


def find_form(forms: list, form_id: str) -> dict:
    for f in forms:
        if f.get("id") == form_id:
            return f
    raise KeyError(form_id)


def ensure_uo_permissions(form: dict) -> None:
    form["metadata"] = (
        "Protótipo Atlas — UO. Permissões por nível hierárquico (módulos visíveis). "
        "Abas Responsáveis/Usuários com limite, convites e método Gerar Código de Convite (Fase 1). "
        "Decisão 19/06/2026 (Luiz/MTI)."
    )
    sections = form.setdefault("sections", [])
    if not any(s.get("id") == UO_PERMISSOES_SECTION["id"] for s in sections):
        # Inserir após Ajustes
        insert_at = next(
            (i + 1 for i, s in enumerate(sections) if s.get("id") == "sec-mqgzc7zd-iw61vf1"),
            len(sections),
        )
        sections.insert(insert_at, UO_PERMISSOES_SECTION)

    fields = form.setdefault("fields", [])
    if not any(f.get("id") == UO_MODULOS_FIELD["id"] for f in fields):
        # Após caminho hierárquico
        insert_at = next(
            (i + 1 for i, f in enumerate(fields) if f.get("id") == "patlasv4proto-uo-caminho"),
            len(fields),
        )
        fields.insert(insert_at, UO_MODULOS_FIELD)

    for preset in form.get("exampleValuePresets", []):
        pid = preset.get("id", "")
        if pid in UO_PRESET_MODULES:
            preset.setdefault("fieldValues", {})[
                "patlasv4proto-uo-modulos-visiveis"
            ] = UO_PRESET_MODULES[pid]
        if pid == "patlasv4proto-p-uo-mti-ii-1-2":
            preset["fieldValues"]["patlasv4proto-uo-caminho"] = "MTI/DTIC"
        if pid == "patlasv4proto-p-uo-mti-ii-1-1":
            preset["fieldValues"]["patlasv4proto-uo-caminho"] = "MTI/DIRADM"


def ensure_cargo(form: dict) -> None:
    form["metadata"] = (
        "Protótipo Atlas — Cargo. Decisão 19/06/2026: vinculado à UO + flag Administrador + módulos executor. "
        "RN-CARGO-07/08: Pode assinar habilita no Workflow; papel na aba Assinatura."
    )
    fields = form["fields"]

    if not any(f.get("id") == CARGO_UO_FIELD["id"] for f in fields):
        org_idx = next(
            i for i, f in enumerate(fields) if f.get("id") == "patlasv4proto-cargo-dados-do-cargo-organizacao"
        )
        fields.insert(org_idx + 1, CARGO_UO_FIELD)

    if not any(f.get("id") == CARGO_ADMIN_FIELD["id"] for f in fields):
        perm_idx = next(i for i, f in enumerate(fields) if f.get("id") == "mql22xheoalehd")
        fields.insert(perm_idx, CARGO_ADMIN_FIELD)

    for f in fields:
        if f.get("id") == "mql22xheoalehd":
            f["label"] = "Módulos (executor)"
            f["options"] = ["Catálogo/ Proposta"]
            f["required"] = False
            f["spec"] = (
                "Somente quando Administrador = Não. Macro: Catálogo/Proposta (Publicação, Handover e Kick-off inclusos). "
                "Interseção com Módulos visíveis da UO do cargo."
            )
        if f.get("id") == "patlasv4proto-cargo-dados-do-cargo-organizacao":
            f["spec"] = "Organização raiz (nível 0). MTI, Parceiro ou Cliente."

    rules = form.setdefault("fieldVisibilityRules", [])
    # Remover regra antiga que escondia módulo junto com assinatura
    form["fieldVisibilityRules"] = [
        r
        for r in rules
        if r.get("id") != "57dcaf22-f370-43e8-8ec8-6ab1dba71d98"
    ]
    form["fieldVisibilityRules"].extend(
        [
            {
                "id": "rule-cargo-hide-assinatura-sem-pode-assinar",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-cargo-dados-do-cargo-pode-assinar",
                "action": "hide",
                "targetFieldIds": ["mql1x61b2i3yjc"],
                "sourceKind": "boolean",
                "expectedBoolean": False,
            },
            {
                "id": "rule-cargo-hide-modulos-quando-admin",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-cargo-administrador",
                "action": "hide",
                "targetFieldIds": ["mql22xheoalehd"],
                "sourceKind": "boolean",
                "expectedBoolean": True,
            },
        ]
    )

    presets = {
        "patlasv4proto-p-cargo-mti": {
            "patlasv4proto-cargo-unidade-organizacional": "MTI/DIRC",
            "patlasv4proto-cargo-administrador": True,
            "patlasv4proto-cargo-dados-do-cargo-nome-do-cargo": "Diretor DIRC",
        },
        "patlasv4proto-p-cargo-parceiro": {
            "patlasv4proto-cargo-unidade-organizacional": "EloGroup",
            "patlasv4proto-cargo-administrador": False,
            "mql22xheoalehd": ["Catálogo/ Proposta"],
        },
        "patlasv4proto-p-cargo-cliente": {
            "patlasv4proto-cargo-unidade-organizacional": "SEPLAG/GECON",
            "patlasv4proto-cargo-administrador": False,
            "mql22xheoalehd": ["Catálogo/ Proposta"],
        },
    }
    for preset in form.get("exampleValuePresets", []):
        pid = preset.get("id")
        if pid in presets:
            preset.setdefault("fieldValues", {}).update(presets[pid])
        if pid == "patlasv4proto-p-cargo-mti":
            rows = preset.get("embeddedRowsByFieldId", {}).get(
                "patlasv4proto-cargo-ocupantes-lista", []
            )
            for row in rows:
                row["patlasv4proto-cargo-ocupantes-unidade-de-atuacao"] = "MTI/DIRC"

    # Novos presets ilustrativos
    new_presets = [
        {
            "id": "patlasv4proto-p-cargo-analista-dirc",
            "name": "Analista DIRC (executor)",
            "iconColor": "#0284c7",
            "fieldValues": {
                "patlasv4proto-cargo-dados-do-cargo-organizacao": "Empresa Mato-grossense de Tecnologia da Informação",
                "patlasv4proto-cargo-unidade-organizacional": "MTI/DIRC",
                "patlasv4proto-cargo-dados-do-cargo-perfil": "MTI",
                "patlasv4proto-cargo-dados-do-cargo-nome-do-cargo": "Analista DIRC",
                "patlasv4proto-cargo-dados-do-cargo-sigla-abreviatura": "ANL",
                "patlasv4proto-cargo-administrador": False,
                "mql22xheoalehd": ["Catálogo/ Proposta"],
                "patlasv4proto-cargo-dados-do-cargo-pode-assinar": False,
                "patlasv4proto-cargo-dados-do-cargo-ativo": True,
            },
        },
        {
            "id": "patlasv4proto-p-cargo-analista-dtic",
            "name": "Analista DTIC (executor)",
            "iconColor": "#0891b2",
            "fieldValues": {
                "patlasv4proto-cargo-dados-do-cargo-organizacao": "Empresa Mato-grossense de Tecnologia da Informação",
                "patlasv4proto-cargo-unidade-organizacional": "MTI/DTIC",
                "patlasv4proto-cargo-dados-do-cargo-perfil": "MTI",
                "patlasv4proto-cargo-dados-do-cargo-nome-do-cargo": "Analista DTIC",
                "patlasv4proto-cargo-dados-do-cargo-sigla-abreviatura": "ANL-TIC",
                "patlasv4proto-cargo-administrador": False,
                "mql22xheoalehd": ["Catálogo/ Proposta"],
                "patlasv4proto-cargo-dados-do-cargo-pode-assinar": False,
                "patlasv4proto-cargo-dados-do-cargo-ativo": True,
            },
        },
    ]
    existing_ids = {p.get("id") for p in form.get("exampleValuePresets", [])}
    for p in new_presets:
        if p["id"] not in existing_ids:
            form.setdefault("exampleValuePresets", []).append(p)


def ensure_ocupante(form: dict) -> None:
    form["metadata"] = (
        "Fonte oficial Servidor + Cargo + Região + Condição (RN-CARGO-03). "
        "UO derivada do Cargo (somente leitura). Decisão 19/06/2026."
    )
    for f in form["fields"]:
        if f.get("id") == "patlasv4proto-cargo-ocupantes-unidade-de-atuacao":
            f["readOnly"] = True
            f["options"] = [
                "MTI",
                "MTI/DIRC",
                "MTI/DIRC/UGP",
                "MTI/DTIC",
                "MTI/DIRADM",
                "EloGroup",
                "SEPLAG/GECON",
            ]
            f["spec"] = (
                "Somente leitura — preenchido automaticamente a partir da UO do Cargo pai. "
                "Decisão 19/06/2026: ocupante não seleciona UO."
            )


def ensure_atribuir_cargo(form: dict) -> None:
    form["metadata"] = (
        "Atribui cargo à pessoa e cria/atualiza Servidor + Ocupante (backend). "
        "Fluxo: 1) Perfil; 2) Organização; 3) Matrícula se MTI; 4) Cargo (UO vem do cargo); "
        "5) Condição; 6) Região; 7) Ativo. Decisão 19/06/2026: sem seleção de UO."
    )
    for f in form["fields"]:
        if f.get("id") == "patlasv4proto-pac-cargo":
            f["spec"] = (
                "Lista filtrada: Perfil + Organização. A UO de lotação está no Cargo — "
                "não se seleciona UO neste método."
            )
        if f.get("id") == "patlasv4proto-pac-caminho-uo":
            f["hidden"] = True
            f["required"] = False
            f["readOnly"] = True
            f["label"] = "Unidade organizacional (nao usado)"
            f["spec"] = "Removido do fluxo — UO herdada do Cargo (decisão 19/06/2026). Mantido oculto para compatibilidade backend."

    # Regras: mostrar ativo após cargo (sem UO)
    form["fieldVisibilityRules"] = [
        r
        for r in form.get("fieldVisibilityRules", [])
        if r.get("id")
        not in (
            "rule-pac-show-uo-cargo-diretor",
            "rule-pac-show-uo-cargo-gp",
            "rule-pac-show-uo-cargo-fisc",
        )
    ]
    form["fieldVisibilityRules"].extend(
        [
            {
                "id": "rule-pac-show-ativo-cargo-diretor",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-pac-cargo",
                "sourceKind": "textOptions",
                "expectedOptionText": "Diretor",
                "action": "show",
                "targetFieldIds": ["patlasv4proto-pac-ativo"],
            },
            {
                "id": "rule-pac-show-ativo-cargo-diretor-dirc",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-pac-cargo",
                "sourceKind": "textOptions",
                "expectedOptionText": "Diretor DIRC",
                "action": "show",
                "targetFieldIds": ["patlasv4proto-pac-ativo"],
            },
            {
                "id": "rule-pac-show-ativo-cargo-analista-dirc",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-pac-cargo",
                "sourceKind": "textOptions",
                "expectedOptionText": "Analista DIRC",
                "action": "show",
                "targetFieldIds": ["patlasv4proto-pac-ativo"],
            },
            {
                "id": "rule-pac-show-ativo-cargo-gp",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-pac-cargo",
                "sourceKind": "textOptions",
                "expectedOptionText": "Gerente de Projetos",
                "action": "show",
                "targetFieldIds": ["patlasv4proto-pac-ativo"],
            },
            {
                "id": "rule-pac-show-ativo-cargo-fisc",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-pac-cargo",
                "sourceKind": "textOptions",
                "expectedOptionText": "Fiscal de Contrato",
                "action": "show",
                "targetFieldIds": ["patlasv4proto-pac-ativo"],
            },
        ]
    )

    cargo_options = [
        "Diretor DIRC",
        "Analista DIRC",
        "Analista DTIC",
        "Gerente de Projetos",
        "Fiscal de Contrato",
    ]
    for f in form["fields"]:
        if f.get("id") == "patlasv4proto-pac-cargo":
            f["options"] = cargo_options

    for preset in form.get("exampleValuePresets", []):
        fv = preset.get("fieldValues", {})
        fv.pop("patlasv4proto-pac-caminho-uo", None)
        if preset.get("id") == "patlasv4proto-p-metodo-atribuir-cargo-felipe":
            fv["patlasv4proto-pac-cargo"] = "Analista DIRC"
        if preset.get("id") == "patlasv4proto-p-metodo-atribuir-cargo-ricardo":
            fv["patlasv4proto-pac-cargo"] = "Gerente de Projetos"


def ensure_resumo_atribuicao(form: dict) -> None:
    form["metadata"] = (
        "Espelho somente leitura das atribuições (método Atribuir cargo). "
        "UO exibida é derivada do Cargo. Decisão 19/06/2026."
    )
    for f in form["fields"]:
        if f.get("id") == "patlasv4proto-par-caminho-uo":
            f["spec"] = "Derivado do Cargo — não informado no Atribuir cargo."


def ensure_servidor_permissao(form: dict) -> None:
    for f in form["fields"]:
        if f.get("id") == "patlasv4proto-sperm-caminho-uo":
            opts = f.get("options", [])
            for add in ("MTI/DTIC", "MTI/DIRADM"):
                if add not in opts:
                    opts.append(add)
            f["options"] = opts


def main() -> None:
    data = json.loads(FORMS_PATH.read_text(encoding="utf-8"))
    ensure_uo_permissions(find_form(data, "form-patlasv4-proto-unidade-organizacional"))
    ensure_cargo(find_form(data, "form-patlasv4-proto-cargo"))
    ensure_ocupante(find_form(data, "form-patlasv4-proto-cargo-ocupante"))
    ensure_atribuir_cargo(find_form(data, "form-patlasv4-proto-metodo-atribuir-cargo-pessoa"))
    ensure_resumo_atribuicao(find_form(data, "form-patlasv4-proto-pessoa-atribuicao-resumo"))
    ensure_servidor_permissao(find_form(data, "form-patlasv4-proto-servidor-permissao"))
    FORMS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Atualizado: {FORMS_PATH}")


if __name__ == "__main__":
    main()
