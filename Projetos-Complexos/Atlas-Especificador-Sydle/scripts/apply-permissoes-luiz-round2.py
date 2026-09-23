#!/usr/bin/env python3
"""Rodada 2 — alinhamento fino permissões Luiz/MTI no atlas-prototipo."""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS_PATH = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
GUIA_PATH = ROOT / "docs/entregaveis/markdown/Atlas_Prototipo_Guia_Completo_Cliente.md"

STANDARD_CAMINHOS = [
    "MTI",
    "MTI/GDP",
    "MTI/DIRC",
    "MTI/DTIC",
    "MTI/DIRADM",
    "MTI/UGP",
    "EloGroup",
    "SEPLAG/GECON",
]

PATH_REPLACEMENTS = {
    "MTI/GDIRC": "MTI/DIRC",
    "MTI/DIRC/UGP": "MTI/UGP",
}

CAMINHO_FIELD_IDS = {
    "patlasv4proto-cargo-unidade-organizacional",
    "patlasv4proto-cargo-ocupantes-unidade-de-atuacao",
    "patlasv4proto-pva-caminho-uo",
    "patlasv4proto-par-caminho-uo",
    "patlasv4proto-pac-caminho-uo",
    "patlasv4proto-sperm-caminho-uo",
    "patlasv4proto-scm-caminho-uo",
    "patlasv4proto-uoca-unidade",
    "patlasv4proto-uopc-unidade",
}


def find_form(forms: list, form_id: str) -> dict:
    for f in forms:
        if f.get("id") == form_id:
            return f
    raise KeyError(form_id)


def replace_paths_in_value(value):
    if isinstance(value, str):
        return PATH_REPLACEMENTS.get(value, value.replace("MTI/GDIRC", "MTI/DIRC").replace("MTI/DIRC/UGP", "MTI/UGP"))
    if isinstance(value, list):
        return [replace_paths_in_value(v) for v in value]
    if isinstance(value, dict):
        return {k: replace_paths_in_value(v) for k, v in value.items()}
    return value


def normalize_caminho_options(field: dict) -> None:
    fid = field.get("id", "")
    label = (field.get("label") or "").lower()
    if fid in CAMINHO_FIELD_IDS or "caminho" in label or fid.endswith("-caminho-uo"):
        opts = field.get("options")
        if isinstance(opts, list) and opts and all(isinstance(o, str) for o in opts):
            merged = set(STANDARD_CAMINHOS)
            for o in opts:
                merged.add(replace_paths_in_value(o))
            merged.discard("MTI/GDIRC")
            merged.discard("MTI/DIRC/UGP")
            field["options"] = sorted(merged, key=lambda x: (x.count("/"), x))


def patch_uo_presets(form: dict) -> None:
    patches = {
        "patlasv4proto-p-uo-mti-ii-1": {"patlasv4proto-uo-caminho": "MTI/GDP"},
        "patlasv4proto-p-uo-mti-iii-6": {
            "patlasv4proto-uo-sigla": "UGP",
            "patlasv4proto-uo-caminho": "MTI/UGP",
        },
    }
    for preset in form.get("exampleValuePresets", []):
        pid = preset.get("id")
        if pid in patches:
            preset.setdefault("fieldValues", {}).update(patches[pid])


def patch_uo_mti_root_embedded(form: dict) -> None:
    for preset in form.get("exampleValuePresets", []):
        if preset.get("id") != "patlasv4proto-p-unidade-organizacional-mti":
            continue
        emb = preset.setdefault("embeddedRowsByFieldId", {})
        emb["patlasv4proto-uo-cargos-atribuidos"] = [
            {
                "patlasv4proto-uoca-cargo": "Diretor DIRC",
                "patlasv4proto-uoca-organizacao": "Empresa Mato-grossense de Tecnologia da Informação",
                "patlasv4proto-uoca-unidade": "MTI/DIRC",
                "patlasv4proto-uoca-pessoa-titular": "Felipe Oliveira Costa",
                "patlasv4proto-uoca-condicao": "Titular",
                "patlasv4proto-uoca-regiao": "MT",
                "patlasv4proto-uoca-data-inicio": "01/01/2020",
                "patlasv4proto-uoca-ativo": True,
            },
            {
                "patlasv4proto-uoca-cargo": "Gerente de Projetos",
                "patlasv4proto-uoca-organizacao": "Empresa Mato-grossense de Tecnologia da Informação",
                "patlasv4proto-uoca-unidade": "MTI/UGP",
                "patlasv4proto-uoca-pessoa-titular": "Felipe Oliveira Costa",
                "patlasv4proto-uoca-condicao": "Titular",
                "patlasv4proto-uoca-regiao": "Todos",
                "patlasv4proto-uoca-data-inicio": "15/03/2022",
                "patlasv4proto-uoca-ativo": True,
            },
        ]
        emb["patlasv4proto-uo-pessoas-nos-cargos"] = [
            {
                "patlasv4proto-uopc-cargo": "Diretor DIRC",
                "patlasv4proto-uopc-pessoa": "Felipe Oliveira Costa",
                "patlasv4proto-uopc-condicao": "Titular",
                "patlasv4proto-uopc-unidade": "MTI/DIRC",
                "patlasv4proto-uopc-regiao": "MT",
                "patlasv4proto-uopc-data-inicio": "01/01/2020",
                "patlasv4proto-uopc-ativo": True,
            },
            {
                "patlasv4proto-uopc-cargo": "Diretor DIRC",
                "patlasv4proto-uopc-pessoa": "Carlos Eduardo Souza",
                "patlasv4proto-uopc-condicao": "Substituto",
                "patlasv4proto-uopc-unidade": "MTI/DIRC",
                "patlasv4proto-uopc-regiao": "MT",
                "patlasv4proto-uopc-data-inicio": "01/06/2024",
                "patlasv4proto-uopc-ativo": True,
                "patlasv4proto-uopc-observacao": "Substituto em período de férias do titular.",
            },
            {
                "patlasv4proto-uopc-cargo": "Gerente de Projetos",
                "patlasv4proto-uopc-pessoa": "Felipe Oliveira Costa",
                "patlasv4proto-uopc-condicao": "Titular",
                "patlasv4proto-uopc-unidade": "MTI/UGP",
                "patlasv4proto-uopc-regiao": "Todos",
                "patlasv4proto-uopc-data-inicio": "15/03/2022",
                "patlasv4proto-uopc-ativo": True,
            },
            {
                "patlasv4proto-uopc-cargo": "Gerente de Projetos",
                "patlasv4proto-uopc-pessoa": "Helena Ribeiro Lima",
                "patlasv4proto-uopc-condicao": "Suplente",
                "patlasv4proto-uopc-unidade": "MTI/UGP",
                "patlasv4proto-uopc-regiao": "MT",
                "patlasv4proto-uopc-data-inicio": "10/01/2025",
                "patlasv4proto-uopc-data-fim": "30/06/2025",
                "patlasv4proto-uopc-ativo": False,
                "patlasv4proto-uopc-observacao": "Suplência encerrada.",
            },
        ]


def patch_uoca_uopc_forms(forms: list) -> None:
    for form_id, meta in (
        (
            "form-patlasv4-proto-uo-cargo-atribuido",
            "Espelho somente leitura — cargo + org + caminho UO (derivado do Cargo). Decisão 19/06/2026.",
        ),
        (
            "form-patlasv4-proto-uo-pessoa-cargo",
            "Espelho somente leitura — pessoa no cargo + caminho UO (derivado do Cargo). Decisão 19/06/2026.",
        ),
    ):
        form = find_form(forms, form_id)
        form["metadata"] = meta
        for f in form["fields"]:
            if f.get("id") in ("patlasv4proto-uoca-unidade", "patlasv4proto-uopc-unidade"):
                f["type"] = "textOptions"
                f["label"] = "Unidade organizacional (caminho)"
                f["readOnly"] = True
                f["required"] = True
                f["linkedFormId"] = None
                f["options"] = list(STANDARD_CAMINHOS)
                f["spec"] = (
                    "Somente leitura — caminho hierárquico herdado do Cargo (ex.: MTI/DIRC). "
                    "Decisão 19/06/2026."
                )
            if f.get("id") == "patlasv4proto-uoca-cargo":
                f["readOnly"] = True
                f["options"] = [
                    "Diretor DIRC",
                    "Analista DIRC",
                    "Analista DTIC",
                    "Gerente de Projetos",
                    "Fiscal de Contrato",
                ]
            if f.get("id") == "patlasv4proto-uopc-cargo":
                f["readOnly"] = True
                f["options"] = [
                    "Diretor DIRC",
                    "Analista DIRC",
                    "Analista DTIC",
                    "Gerente de Projetos",
                    "Fiscal de Contrato",
                ]
            if f.get("id") in ("patlasv4proto-uoca-organizacao",):
                f["readOnly"] = True
            if f.get("id") in ("patlasv4proto-uoca-condicao", "patlasv4proto-uopc-condicao"):
                f["readOnly"] = True


def patch_cargo(form: dict) -> None:
    opts = list(STANDARD_CAMINHOS)
    for f in form["fields"]:
        if f.get("id") == "patlasv4proto-cargo-unidade-organizacional":
            f["options"] = opts
    for preset in form.get("exampleValuePresets", []):
        if preset.get("id") == "patlasv4proto-p-cargo-parceiro":
            preset["fieldValues"]["patlasv4proto-cargo-unidade-organizacional"] = "EloGroup"
        if preset.get("id") == "patlasv4proto-p-cargo-mti":
            pass  # already MTI/DIRC
    # Gerente de Projetos MTI/UGP
    gp = {
        "id": "patlasv4proto-p-cargo-gp-ugp",
        "name": "Gerente de Projetos UGP",
        "iconColor": "#0369a1",
        "fieldValues": {
            "patlasv4proto-cargo-dados-do-cargo-organizacao": "Empresa Mato-grossense de Tecnologia da Informação",
            "patlasv4proto-cargo-unidade-organizacional": "MTI/UGP",
            "patlasv4proto-cargo-dados-do-cargo-perfil": "MTI",
            "patlasv4proto-cargo-dados-do-cargo-nome-do-cargo": "Gerente de Projetos",
            "patlasv4proto-cargo-dados-do-cargo-sigla-abreviatura": "GP",
            "patlasv4proto-cargo-administrador": False,
            "mql22xheoalehd": ["Catálogo/ Proposta"],
            "patlasv4proto-cargo-dados-do-cargo-pode-assinar": True,
            "patlasv4proto-cargo-dados-do-cargo-ativo": True,
        },
    }
    ids = {p.get("id") for p in form.get("exampleValuePresets", [])}
    if gp["id"] not in ids:
        form.setdefault("exampleValuePresets", []).append(gp)

    rules = form.setdefault("fieldVisibilityRules", [])
    rules = [r for r in rules if r.get("id") != "rule-cargo-show-modulos-quando-executor"]
    rules.append(
        {
            "id": "rule-cargo-show-modulos-quando-executor",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-cargo-administrador",
            "action": "show",
            "targetFieldIds": ["mql22xheoalehd"],
            "sourceKind": "boolean",
            "expectedBoolean": False,
        }
    )
    form["fieldVisibilityRules"] = rules
    for f in form["fields"]:
        if f.get("id") == "mql22xheoalehd":
            f["hidden"] = True  # shown only when Administrador = Não


def patch_atribuir_cargo(form: dict) -> None:
    for f in form["fields"]:
        if f.get("id") in ("patlasv4proto-pac-condicao", "patlasv4proto-pac-regiao"):
            f["hidden"] = True
    remove_ids = {
        "rule-pac-show-ativo-cargo-diretor",
        "rule-pac-show-ativo-cargo-diretor-dirc",
        "rule-pac-show-ativo-cargo-analista-dirc",
        "rule-pac-show-ativo-cargo-gp",
        "rule-pac-show-ativo-cargo-fisc",
    }
    rules = [r for r in form.get("fieldVisibilityRules", []) if r.get("id") not in remove_ids]
    cargo_names = [
        "Diretor DIRC",
        "Analista DIRC",
        "Analista DTIC",
        "Gerente de Projetos",
        "Fiscal de Contrato",
    ]
    for name in cargo_names:
        rid = f"rule-pac-show-pos-cargo-{name.lower().replace(' ', '-')}"
        rules.append(
            {
                "id": rid,
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-pac-cargo",
                "sourceKind": "textOptions",
                "expectedOptionText": name,
                "action": "show",
                "targetFieldIds": [
                    "patlasv4proto-pac-condicao",
                    "patlasv4proto-pac-regiao",
                    "patlasv4proto-pac-ativo",
                ],
            }
        )
    form["fieldVisibilityRules"] = rules
    for preset in form.get("exampleValuePresets", []):
        if preset.get("id") == "patlasv4proto-p-metodo-atribuir-cargo-felipe":
            preset["fieldValues"]["patlasv4proto-pac-cargo"] = "Gerente de Projetos"


def patch_resumo(form: dict) -> None:
    for f in form["fields"]:
        if f.get("id") == "patlasv4proto-par-caminho-uo":
            f["options"] = list(STANDARD_CAMINHOS)
        if f.get("id") == "patlasv4proto-par-cargo":
            f["options"] = [
                "Diretor DIRC",
                "Analista DIRC",
                "Analista DTIC",
                "Gerente de Projetos",
                "Fiscal de Contrato",
            ]


def patch_all_forms(forms: list) -> None:
    for form in forms:
        for field in form.get("fields", []):
            normalize_caminho_options(field)
        form["exampleValuePresets"] = replace_paths_in_value(form.get("exampleValuePresets", []))
        if isinstance(form.get("fieldValues"), dict):
            form["fieldValues"] = replace_paths_in_value(form["fieldValues"])


def patch_guia() -> None:
    if not GUIA_PATH.exists():
        return
    text = GUIA_PATH.read_text(encoding="utf-8")

    old_cargo_sections = """**Abas ou seções principais**

- **Dados do Cargo**
- **Ocupantes**
- **Perfil de Permissões**

**Campos da tela**

##### Dados do Cargo

| Campo | Descrição e regras |
| --- | --- |
| Nome do Cargo | **Tipo:** Texto (obrigatório)<br>**Regra / finalidade:** Ex.: Diretor, Gerente de Unidade, Analista, Gerente de Projetos. |
| Sigla / Abreviatura | **Tipo:** Texto (obrigatório)<br>**Regra / finalidade:** Ex.: DIR, GUE, GP. |
| Organização | **Tipo:** Vínculo com outro cadastro (obrigatório)<br>**Vincula a:** Organização.<br>**Regra / finalidade:** unidade organizacional com Representa Organização? = Sim — MTI, Parceiro ou Cliente. Nunca subunidade ( ). |
| Pode assinar | **Tipo:** Sim ou Não (obrigatório)<br>**Regra / finalidade:** Sim → cargo disponível nas etapas do Workflow. Não autoriza assinatura automática . |
| Ativo | **Tipo:** Sim ou Não (obrigatório)<br>**Regra / finalidade:** Inativo some dos seletores. Ocupações e histórico preservados. |
| Observações | **Tipo:** Texto<br>**Regra / finalidade:** Ex.: Cargo utilizado nos fluxos de proposta e contrato da MTI. |

##### Ocupantes

| Campo | Descrição e regras |
| --- | --- |
| Ocupantes | **Tipo:** Tabela de itens relacionados (aceita vários valores)<br>**Conteúdo da tabela:** cada linha segue o cadastro *Ocupante*.<br>**Colunas da tabela:** **Pessoa:** Vínculo com outro cadastro (obrigatório) — Vincula a: Servidor — Sempre referência a Servidor ativo e não desligado — nunca Pessoa diretamente (, ). · **Condição:** Lista de opções (obrigatório) — Opções: Titular · Substituto · Suplente — Titular indisponível → Substituto; ausente → Suplente. Registrada no histórico ao atuar. · **Unidade de atuação:** Vínculo com outro cadastro (obrigatório) — Vincula a: Organização — Apenas unidades da Organização do Cargo . Sem subunidades → usar a raiz . · **Região de atuação:** Lista de opções (aceita vários valores) — Opções: Todos · AC · AL · AP · AM · BA · CE · DF · ES · GO · MA · MT · MS · MG · PA · PB · PR · PE · PI · RJ · RN · RS · RO · RR · SC · SP · SE · TO — Padrão Todos. Restringe roteamento por UF quando diferente de Todos . · **Data de início:** Data e hora — Início da vigência da ocupação. · **Data de fim:** Data e hora — Fim da vigência. Vazio = ocupação ativa. · **Observação:** Texto — Texto livre complementar. · **Ativo:** Sim ou Não (obrigatório) — Ocupação inativa não entra em roteamento nem workflows.<br>**Regra / finalidade:** Fonte oficial Servidor + Cargo + Unidade + Região + Condição . |

##### Perfil de Permissões

| Campo | Descrição e regras |
| --- | --- |
| Perfil de Permissões | **Tipo:** Tabela de itens relacionados (aceita vários valores)<br>**Conteúdo da tabela:** cada linha segue o cadastro *Permissão de Processo*.<br>**Colunas da tabela:** **Tipo de Processo:** Lista de opções (obrigatório) — Opções: Proposta · Contrato · Ordem de Serviço (OS) · Projetos — Lista técnica do backend . Proposta, Contrato, OS, Homologação, RAER. · **Métodos / Ações:** Lista de opções (obrigatório, aceita vários valores) — Opções: Visualizar · Criar proposta · Editar proposta · Gerar documento · Enviar para assinatura · Homologar · Emitir OS · Cadastrar contrato — Filtrado pelo Tipo de Processo. Nunca incluir Aprovar, Recusar ou Assinar .<br>**Regra / finalidade:** Tipo de Processo + Métodos/Ações do backend. Sem Aprovar/Recusar/Assinar . |"""

    new_cargo_sections = """**Abas ou seções principais**

- **Dados**
- **Assinatura**
- **Permissões do Cargo**
- **Ocupantes**

**Campos da tela**

##### Dados

| Campo | Descrição e regras |
| --- | --- |
| Nome do Cargo | **Tipo:** Texto (obrigatório)<br>**Regra / finalidade:** Ex.: Diretor DIRC, Analista, Gerente de Projetos. |
| Sigla / Abreviatura | **Tipo:** Texto (obrigatório)<br>**Regra / finalidade:** Ex.: DIR, ANL, GP. |
| Organização | **Tipo:** Vínculo com outro cadastro (obrigatório)<br>**Vincula a:** Organização raiz (nível 0). |
| Unidade organizacional | **Tipo:** Lista de opções (obrigatório)<br>**Opções:** caminho hierárquico — ex.: MTI/DIRC, MTI/DTIC, MTI/UGP.<br>**Regra / finalidade:** Decisão 19/06/2026 — cargo vinculado à UO; ocupante herda este caminho. |
| Perfil | **Tipo:** Lista de opções (somente leitura)<br>**Opções:** MTI · Parceiro · Cliente |
| Ativo | **Tipo:** Sim ou Não (obrigatório) |
| Observações | **Tipo:** Texto |

##### Assinatura

| Campo | Descrição e regras |
| --- | --- |
| Pode assinar | **Tipo:** Sim ou Não (obrigatório)<br>**Regra / finalidade:** Habilita cargo nas etapas do Workflow. |
| Papel na assinatura | **Tipo:** Lista de opções<br>**Opções:** Assinante principal · Assinante complementar · Observador |

##### Permissões do Cargo

| Campo | Descrição e regras |
| --- | --- |
| Administrador | **Tipo:** Sim ou Não (obrigatório)<br>**Regra / finalidade:** Sim → acesso total (ignora filtro hierárquico da UO). Não → executor. |
| Módulos (executor) | **Tipo:** Lista múltipla<br>**Opções:** Catálogo/ Proposta<br>**Regra / finalidade:** Somente quando Administrador = Não. Interseção com Módulos visíveis da UO do cargo. |

##### Ocupantes

| Campo | Descrição e regras |
| --- | --- |
| Ocupantes | **Tipo:** Tabela (cadastro *Ocupante*)<br>**Colunas:** **Servidor** · **Condição** (Titular/Substituto/Suplente) · **Unidade organizacional (caminho)** — somente leitura, derivada do Cargo · **Região** · **Vigência** · **Ativo**<br>**Regra / finalidade:** Fonte oficial Servidor + Cargo + Região + Condição. |"""

    if old_cargo_sections in text:
        text = text.replace(old_cargo_sections, new_cargo_sections)

    # Organização — add Permissões da UO after Ajustes mention if we find a good anchor
    uo_perm_block = """##### Permissões da UO

| Campo | Descrição e regras |
| --- | --- |
| Módulos visíveis | **Tipo:** Lista múltipla<br>**Opções:** Parcerias · Propostas · Catálogos · Workflow · Relatórios · Saldo · Contábil · Pedidos de venda · Cadastro de fornecedor<br>**Regra / finalidade:** Decisão 19/06/2026 — cardápio do que esta UO enxerga na hierarquia. Ex.: DIRC → parcerias/propostas; DTIC → relatórios/saldo; DIRADM → contábil/fornecedor. |

"""
    anchor = "##### Dados da Unidade"
    if uo_perm_block.strip() not in text and anchor in text:
        text = text.replace(anchor, uo_perm_block + anchor, 1)

    # Cargo atribuído embedded
    text = text.replace(
        "**Unidade organizacional:** Vínculo com outro cadastro (obrigatório) — Vincula a: Organização",
        "**Unidade organizacional (caminho):** Texto/lista (somente leitura) — ex.: MTI/DIRC — derivado do Cargo",
    )
    text = text.replace(
        "**Unidade organizacional:** Vínculo com outro cadastro — Vincula a: Organização",
        "**Unidade organizacional (caminho):** Somente leitura — derivado do Cargo",
    )

    text = text.replace("MTI/DIRC/UGP", "MTI/UGP")
    text = text.replace("MTI/GDIRC", "MTI/DIRC")

    GUIA_PATH.write_text(text, encoding="utf-8")


def main() -> None:
    data = json.loads(FORMS_PATH.read_text(encoding="utf-8"))
    patch_all_forms(data)
    uo = find_form(data, "form-patlasv4-proto-unidade-organizacional")
    patch_uo_presets(uo)
    patch_uo_mti_root_embedded(uo)
    patch_uoca_uopc_forms(data)
    patch_cargo(find_form(data, "form-patlasv4-proto-cargo"))
    patch_atribuir_cargo(find_form(data, "form-patlasv4-proto-metodo-atribuir-cargo-pessoa"))
    patch_resumo(find_form(data, "form-patlasv4-proto-pessoa-atribuicao-resumo"))
    FORMS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    patch_guia()
    print(f"Atualizado: {FORMS_PATH}")
    print(f"Guia: {GUIA_PATH}")


if __name__ == "__main__":
    main()
