#!/usr/bin/env python3
"""Cria subprojeto atlas-prototipo com cópia organizada do atlas-prototipo atual."""
from __future__ import annotations

import json
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC_EPIC = ROOT / "data/subprojects/atlas-v4/epics/atlas-prototipo"
DST_SUB = ROOT / "data/subprojects/atlas-prototipo"
DST_EPIC = DST_SUB / "epics/prototipo"

NAO_USADO_SUFFIX = " (nao usado)"
NAO_USADO_GROUP = "grp-nao-usado"

# Telas principais (Explorer) -> grupo
TELA_GROUPS: list[tuple[str, str, str]] = [
    ("grp-tela-organizacao", "Tela — Organização", "form-patlasv4-proto-unidade-organizacional"),
    ("grp-tela-tipo-documento", "Tela — Tipo Documento (catálogo CO)", "form-patlasv4-proto-tipo-documento"),
    ("grp-tela-pessoas", "Tela — Pessoas", "form-patlasv4-proto-pessoa"),
    ("grp-tela-cargo", "Tela — Cargo", "form-patlasv4-proto-cargo"),
    ("grp-tela-convite", "Tela — Convite de Cadastro", "form-patlasv4-proto-convite-cadastro"),
    ("grp-tela-versoes-processo", "Tela — Versões de Processo", "form-patlasv4-proto-config-processo"),
    ("grp-tela-template", "Tela — Template", "form-patlasv4-proto-template"),
    ("grp-tela-catalogo", "Tela — Catálogo de Produtos/Serviços", "form-patlasv4-proto-catalogo-produto-servico"),
    ("grp-tela-modelo-contrato", "Tela — Modelo de Contrato", "form-patlasv4-proto-modelo-contrato"),
    ("grp-tela-workflow-assinatura", "Tela — Workflow de Assinatura", "mqebasqyphbwea"),
    ("grp-tela-processos", "Tela — Processos", "form-patlasv4-proto-processos"),
    ("grp-tela-painel-assinaturas", "Tela — Painel de Assinaturas", "form-patlasv4-proto-painel-assinaturas-pendentes"),
    ("grp-tela-solicitacao-vinculo", "Tela — Solicitação de vínculo", "form-patlasv4-proto-solicitacao-vinculo"),
    ("grp-tela-proposta", "Tela — Proposta", "form-patlasv4-proto-proposta"),
    ("grp-tela-documentos", "Tela — Documentos", "form-patlasv4-proto-documentos"),
    ("grp-tela-contrato", "Tela — Contrato", "form-patlasv4-proto-contrato"),
    ("grp-tela-os", "Tela — Ordem de Serviço", "form-patlasv4-proto-emissao-ordem-servico"),
    ("grp-tela-termo-homologacao", "Tela — Termo de Homologação", "form-patlasv4-proto-termo-homologacao"),
    ("grp-tela-raer", "Tela — RAER", "form-patlasv4-proto-raer"),
    ("grp-tela-dossie-ev", "Tela — Dossiê da Entrega de Valor", "form-patlasv4-proto-dossie-entrega-valor"),
    ("grp-tela-projetos", "Tela — Projetos", "form-patlasv4-proto-projeto"),
]

# Forms explicitamente não usados / legado / stub
FORCE_NAO_USADO = {
    "mqedrpdvcau6e6",
    "mqehbuqf2zcbhn",
    "form-patlasv4-proto-auditoria",
    "form-patlasv4-proto-documentos-templates",
    "form-patlasv4-proto-workflow-processo",
    "form-patlasv4-proto-workflow-processo-etapa",
    "form-patlasv4-proto-cliente",
    "form-patlasv4-proto-portal-vinculo-organizacao",
    "form-patlasv4-proto-metodo-desligar-pessoa",
    "form-patlasv4-proto-metodo-inativar-acesso-pessoa",
    "form-patlasv4-proto-metodo-criar-servidor",
    "form-patlasv4-proto-metodo-criar-servidor-permissao",
    "form-patlasv4-proto-metodo-gerar-convite-saida",
    "form-patlasv4-proto-pessoa-vinculo-acesso",
    "form-patlasv4-proto-cargo-perm-visualizacao",
    "form-patlasv4-proto-cargo-permissao-processo",
    "form-patlasv4-proto-pessoa-outro-nome",
    "form-patlasv4-proto-pessoa-dados-bancarios",
    "form-patlasv4-proto-pessoa-documento",
    "form-patlasv4-proto-geracao-pdf-saida",
    "form-patlasv4-proto-usuario",
    "form-patlasv4-proto-contrato-usuario-coberto",
    "form-patlasv4-proto-contrato-linha-gasto",
    "form-patlasv4-proto-contrato-termo-condicao",
    "form-patlasv4-proto-contrato-historico",
    "form-patlasv4-proto-contrato-secundario",
    "form-patlasv4-proto-contrato-asset-covered",
    "form-patlasv4-proto-contrato-ic-coberto",
    "form-patlasv4-proto-contrato-oferta",
    "form-patlasv4-proto-contrato-sla",
    "form-patlasv4-proto-contrato-hist-aprovacao",
    "form-patlasv4-proto-contrato-tabela-valores",
    "form-patlasv4-proto-projeto-cliente",
}

# Servidor: backend oculto mas referenciado — grupo dedicado embutido
SERVIDOR_FORMS = {
    "form-patlasv4-proto-servidor",
    "form-patlasv4-proto-servidor-permissao",
}

# Embutidas / suporte por tela (além de auto-detect)
EXTRA_BY_TELA: dict[str, list[str]] = {
    "grp-tela-organizacao": [
        "form-patlasv4-proto-uo-conta-bancaria",
        "form-patlasv4-proto-uo-documento",
        "form-patlasv4-proto-uo-tributo",
        "form-patlasv4-proto-uo-cargo-atribuido",
        "form-patlasv4-proto-uo-pessoa-cargo",
        "form-patlasv4-proto-metodo-gerar-convite",
    ],
    "grp-tela-pessoas": [
        "form-patlasv4-proto-pessoa-email",
        "form-patlasv4-proto-pessoa-telefone",
        "form-patlasv4-proto-pessoa-endereco",
        "form-patlasv4-proto-pessoa-rede-social",
        "form-patlasv4-proto-pessoa-filiacao",
        "form-patlasv4-proto-pessoa-habilidade",
        "form-patlasv4-proto-pessoa-exp-academica",
        "form-patlasv4-proto-pessoa-exp-profissional",
        "form-patlasv4-proto-metodo-criar-pessoa",
        "form-patlasv4-proto-metodo-opcoes-pessoa",
        "form-patlasv4-proto-metodo-atribuir-cargo-pessoa",
        "form-patlasv4-proto-pessoa-atribuicao-resumo",
    ],
    "grp-tela-cargo": ["form-patlasv4-proto-cargo-ocupante"],
    "grp-tela-versoes-processo": ["form-patlasv4-proto-versao-processo", "mqb5ag1k51kz2u"],
    "grp-tela-template": [
        "form-patlasv4-proto-template-bloco",
        "form-patlasv4-proto-bloco-reutilizavel",
        "form-patlasv4-proto-clausula-ecm",
        "form-patlasv4-proto-revisao-bloco",
        "form-patlasv4-proto-hist-edicao-bloco",
    ],
    "grp-tela-workflow-assinatura": [
        "form-patlasv4-proto-workflow-etapa",
        "form-patlasv4-proto-assinatura-documentos",
        "form-patlasv4-proto-assinatura-signatario",
        "form-patlasv4-proto-assinatura-controle-acesso",
        "form-patlasv4-proto-metodo-enviar-assinatura",
        "form-patlasv4-proto-metodo-recusar-assinatura",
        "form-patlasv4-proto-metodo-selecionar-metodo-assinatura",
        "form-patlasv4-proto-painel-assinatura-item",
        "form-patlasv4-proto-processo-envelope-historico",
    ],
    "grp-tela-proposta": [
        "form-patlasv4-proto-proposta-item-catalogo",
        "form-patlasv4-proto-metodo-preparar-proposta",
        "form-patlasv4-proto-revisao-documento",
    ],
    "grp-tela-documentos": ["form-patlasv4-proto-hist-edicao-bloco"],
    "grp-tela-contrato": [
        "form-patlasv4-proto-contrato-ordem-servico",
        "form-patlasv4-proto-contrato-produto-contratado",
        "form-patlasv4-proto-metodo-enviar-protheus",
    ],
    "grp-tela-os": [
        "form-patlasv4-proto-metodo-criar-os",
        "form-patlasv4-proto-metodo-zerar-pedido-venda",
    ],
    "grp-tela-raer": [
        "form-patlasv4-proto-raer-indicador-entrega",
        "form-patlasv4-proto-raer-entrega-realizada",
        "form-patlasv4-proto-raer-plano-acao",
    ],
    "grp-tela-dossie-ev": [
        "form-patlasv4-proto-ev-kpi",
        "form-patlasv4-proto-ev-kpi-medicao",
        "form-patlasv4-proto-ev-plano-acao",
        "form-patlasv4-proto-ev-transicao-status",
        "form-patlasv4-proto-ev-timeline-marco",
        "form-patlasv4-proto-ev-metodo-devolver",
    ],
    "grp-tela-projetos": [
        "form-patlasv4-proto-projeto-contato",
        "form-patlasv4-proto-projeto-tarefa",
        "form-patlasv4-proto-projeto-demanda",
        "form-patlasv4-proto-projeto-relatorio-status",
        "form-patlasv4-proto-projeto-item-relacionado",
        "form-patlasv4-proto-projeto-registro-hora",
        "form-patlasv4-proto-projeto-linha-gasto",
    ],
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def collect_references(forms: list[dict]) -> set[str]:
    refs: set[str] = set()
    for form in forms:
        for field in form.get("fields") or []:
            if field.get("linkedFormId"):
                refs.add(field["linkedFormId"])
        for method in form.get("methods") or []:
            if method.get("inputFormId"):
                refs.add(method["inputFormId"])
    return refs


def collect_embedded_map(forms: list[dict]) -> dict[str, set[str]]:
    m: dict[str, set[str]] = defaultdict(set)
    for form in forms:
        fid = form["id"]
        for field in form.get("fields") or []:
            if field.get("type") == "embeddedReference" and field.get("linkedFormId"):
                m[fid].add(field["linkedFormId"])
    return m


def field_is_used(form: dict, field: dict) -> bool:
    fid = field["id"]
    rules = form.get("fieldVisibilityRules") or []
    for r in rules:
        if r.get("sourceFieldId") == fid:
            return True
        if fid in r.get("targetFieldIds", []):
            return True
    if field.get("type") == "embeddedReference":
        return True
    if not field.get("hidden", False):
        return True
    for r in rules:
        if r.get("action") == "show" and fid in r.get("targetFieldIds", []):
            return True
    return False


def reorder_and_mark_fields(form: dict) -> tuple[int, int]:
    fields = form.get("fields") or []
    used, unused = [], []
    for f in fields:
        if field_is_used(form, f):
            used.append(f)
        else:
            nf = dict(f)
            label = (nf.get("label") or nf.get("name") or "Campo").strip()
            if NAO_USADO_SUFFIX.strip() not in label:
                nf["label"] = label + NAO_USADO_SUFFIX
            unused.append(nf)
    form["fields"] = used + unused
    return len(used), len(unused)


def assign_forms_to_groups(forms: list[dict]) -> tuple[list[dict], dict[str, str], dict[str, list[str]]]:
    form_ids = {f["id"] for f in forms}
    main_forms = {main for _, _, main in TELA_GROUPS}
    assignments: dict[str, str] = {}
    member_order: dict[str, list[str]] = {}

    groups = [{"id": gid, "name": name} for gid, name, _ in TELA_GROUPS]
    groups.append({"id": "grp-embutido-servidor", "name": "Embutido — Servidor (backend)"})
    groups.append({"id": NAO_USADO_GROUP, "name": "Não usado"})

    embedded = collect_embedded_map(forms)

    # 1) Reservar telas principais
    for gid, _, main in TELA_GROUPS:
        if main in form_ids:
            assignments[main] = gid
            member_order[gid] = [main]

    # 2) Extras e embutidas diretas de cada tela
    for gid, _, main in TELA_GROUPS:
        order = list(member_order.get(gid, []))
        for extra in EXTRA_BY_TELA.get(gid, []):
            if extra in form_ids and extra not in assignments and extra not in FORCE_NAO_USADO:
                assignments[extra] = gid
                order.append(extra)
        for child in embedded.get(main, []):
            if (
                child in form_ids
                and child not in assignments
                and child not in FORCE_NAO_USADO
                and child not in main_forms
            ):
                assignments[child] = gid
                order.append(child)
        member_order[gid] = order

    # 3) Propagar embutidas de forms já atribuídos
    changed = True
    while changed:
        changed = False
        for parent, children in embedded.items():
            pg = assignments.get(parent)
            if not pg or pg == NAO_USADO_GROUP:
                continue
            for child in children:
                if child in FORCE_NAO_USADO or child in SERVIDOR_FORMS or child in main_forms:
                    continue
                if child not in assignments and child in form_ids:
                    assignments[child] = pg
                    member_order.setdefault(pg, [])
                    if child not in member_order[pg]:
                        member_order[pg].append(child)
                    changed = True

    # Servidor backend
    member_order["grp-embutido-servidor"] = [f for f in SERVIDOR_FORMS if f in form_ids]
    for fid in member_order["grp-embutido-servidor"]:
        assignments[fid] = "grp-embutido-servidor"

    # Não usado: forçados + órfãos
    nao_usado_order: list[str] = []
    for fid in sorted(FORCE_NAO_USADO):
        if fid in form_ids:
            nao_usado_order.append(fid)
            assignments[fid] = NAO_USADO_GROUP

    for form in forms:
        fid = form["id"]
        if fid in assignments:
            continue
        nao_usado_order.append(fid)
        assignments[fid] = NAO_USADO_GROUP

    member_order[NAO_USADO_GROUP] = nao_usado_order

    # Renomear classes não usadas
    for form in forms:
        if assignments.get(form["id"]) == NAO_USADO_GROUP:
            name = form.get("name") or form["id"]
            if NAO_USADO_SUFFIX.strip() not in name:
                form["name"] = name + NAO_USADO_SUFFIX

    return groups, assignments, member_order


def copy_epic():
    if DST_SUB.exists():
        shutil.rmtree(DST_SUB)
    shutil.copytree(SRC_EPIC, DST_EPIC)
    # Remove nested wrong structure - copytree copied epic into epics/prototipo
    # We need subproject root files
    save_json(DST_SUB / "subproject.json", {"name": "Atlas - Protótipo"})
    (DST_SUB / "context.md").write_text("# Atlas - Protótipo\n\nCópia organizada do protótipo Atlas (cadastro, assinatura, fluxo F1).\n", encoding="utf-8")
    save_json(DST_EPIC / "epic.json", {"name": "Atlas Protótipo"})


def main():
    copy_epic()

    forms_path = DST_EPIC / "forms.json"
    forms: list[dict] = load_json(forms_path)

    total_used = total_unused = 0
    for form in forms:
        u, nu = reorder_and_mark_fields(form)
        total_used += u
        total_unused += nu

    groups, assignments, member_order = assign_forms_to_groups(forms)
    save_json(forms_path, forms)

    save_json(
        DST_EPIC / "class-groups.json",
        {"groups": groups, "assignments": assignments, "memberOrderByGroup": member_order},
    )

    workspaces = load_json(DST_EPIC / "workspaces.json")
    if workspaces:
        workspaces[0]["id"] = "ws-atlas-prototipo-organizado"
        workspaces[0]["name"] = "Atlas - Protótipo"
        # Remove workspace class for missing form
        for pkg in workspaces[0].get("packages") or []:
            pkg["classes"] = [
                c for c in (pkg.get("classes") or []) if c.get("linkedFormId") != "form-patlasv4-proto-projeto-cliente"
            ]
        save_json(DST_EPIC / "workspaces.json", workspaces)

    print(f"Subprojeto criado: {DST_SUB}")
    print(f"Épico: {DST_EPIC}")
    print(f"Formulários: {len(forms)}")
    print(f"Grupos: {len(groups)}")
    print(f"Campos marcados (nao usado): {total_unused} / {total_used + total_unused}")
    print(f"Classes em Não usado: {len(member_order.get(NAO_USADO_GROUP, []))}")


if __name__ == "__main__":
    main()
