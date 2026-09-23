# -*- coding: utf-8 -*-
"""
Atlas V2 — classes F2 prontas para validação final (31/08/2026).
Parceria · Solução · Catálogo · Produto · Dados de Parceria por Produto.

- Reaplica patches F2 (specs, campos, DPP)
- Remove campos/seções DELETE (somente o que o Atlas F2 contém)
- Restaura campos condicionais funcionais (vertical, serviço, universal)
- Completa specs padronizadas e métodos
"""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/atlas-v2/forms.json"
PATCH_3108 = ROOT / "scripts/_patch_f2_3108_classes_final.py"
PATCH_COMPLETO = ROOT / "scripts/_patch_prototipo_completo_f2.py"

F2_FORMS = [
    "form-patlasv4-proto-cat-parceria",
    "form-patlasv4-proto-cat-solucao",
    "form-patlasv4-proto-cat-catalogo",
    "form-patlasv4-proto-cat-produto",
    "form-patlasv4-proto-cat-dados-parceria",
]

LEGEND = (
    "`!` Parceiro · `#` MTI · `!#` Ambos · `?` Importado ERP (RO; admin edita) · "
    "MAIÚSCULAS = parceiro não vê"
)
FONTE = "Reunião ATLAS Catálogo 31/08/2026 · Atlas V2 validação final"
META_SUFFIX = " · Atlas V2 — validação final F2 (somente campos Atlas)"


def D(serve: str, usar: str, origem: str, regras: str, *, classe: str, preenche: str = "", visualiza: str = "") -> str:
    lines = [
        f"**Classe:** {classe}",
        f"**Legenda:** {LEGEND}",
        f"**Para que serve:** {serve}",
        f"**Como usar:** {usar}",
        f"**Origem / de onde vem:** {origem}",
        f"**Regras:** {regras}",
    ]
    if preenche:
        lines.append(f"**Quem preenche:** {preenche}")
    if visualiza:
        lines.append(f"**Quem visualiza:** {visualiza}")
    lines.append("**Validação:** Confirmado — 31/08/2026")
    lines.append(f"**Fontes:** {FONTE}")
    return "\n".join(lines)


SOLUCAO_SPECS: dict[str, str] = {
    "form-patlasv4-proto-cat-solucao-identificador": D(
        "Nome comercial da oferta vinculada à parceria (ex.: MTI Simplifica).",
        "MTI cadastra após criar a Parceria. Único dentro da mesma parceria.",
        "Digitado pela MTI no backoffice.",
        "RN-SOL-01: Obrigatório. Estrutura Parceria → Solução → Catálogo → Produtos.",
        classe="Solução (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-solucao-parceria": D(
        "Parceria comercial dona desta solução.",
        "Selecione a parceria habilitada antes de cadastrar catálogo/produtos.",
        "Referência Parceria.",
        "RN-SOL-01/02: Obrigatório. Filtra catálogos e produtos nos demais contextos.",
        classe="Solução (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-solucao-catalogo": D(
        "Catálogo N2 gerado/resolvido para esta solução.",
        "Somente consulta. Sistema preenche a partir de Parceria + Solução.",
        "RN-PAR-03 / RN-SOL-03: gerado automaticamente.",
        "Não selecionar catálogo de outra parceria manualmente.",
        classe="Solução (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-solucao-descricao": D(
        "Escopo e contexto da solução comercial.",
        "Opcional. Complementa o nome para equipes internas e parceiro.",
        "MTI no cadastro.",
        "Distinto do objeto de comercialização (Catálogo) e do item (Produto).",
        classe="Solução (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-solucao-documentos-apoio": D(
        "Arquivos de suporte à solução (PDF, DOC).",
        "Anexe materiais técnicos/comerciais opcionais.",
        "Upload MTI.",
        "RN-SOL-05: Opcional até sign-off formal MTI (apresentado 05/08).",
        classe="Solução (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-solucao-ativo": D(
        "Indica se a solução aceita novos vínculos comerciais.",
        "Desligue para bloquear novos catálogos sem apagar histórico.",
        "MTI altera no backoffice.",
        "RN-SOL-04: Com produtos/catálogo vinculados, preferir inativar a excluir.",
        classe="Solução (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-solucao-observacoes": D(
        "Notas internas MTI sobre a solução.",
        "Uso interno; parceiro não visualiza.",
        "Digitado pela MTI.",
        "Opcional. Não substitui campos estruturados.",
        classe="Solução (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-solucao-produtos": D(
        "Itens de catálogo vinculados a esta solução.",
        "Consulta e navegação. Cadastre produtos no Catálogo ou portal parceiro.",
        "Agregação Produto filtrada por Solução/Catálogo.",
        "Parceiro edita itens no portal em Rascunho; após envio, somente leitura (RN-MTI-01).",
        classe="Solução (Atlas Fase 2)",
        preenche="Sistema / Parceiro (itens)",
        visualiza="MTI · Parceiro",
    ),
}

DPP_SPECS: dict[str, str] = {
    "form-patlasv4-proto-cat-dados-parceria-parceria": D(
        "Parceria à qual se aplicam custo, markup e rateio deste registro.",
        "Selecione a parceria do produto. Herdável do contexto Produto/Catálogo.",
        "Referência Parceria.",
        "RN-DP-01: Contexto comercial canônico — separado do cadastro estrutural do Produto.",
        classe="Dados de Parceria por Produto (Atlas Fase 2)",
        preenche="MTI / Sistema",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-dados-parceria-solucao": D(
        "Solução comercial associada às condições.",
        "Selecione solução da parceria antes do produto.",
        "Referência Solução.",
        "Obrigatório. Amarra parceria × solução × produto para precificação.",
        classe="Dados de Parceria por Produto (Atlas Fase 2)",
        preenche="MTI / Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-dados-parceria-produto": D(
        "Item de catálogo ao qual se aplicam as condições comerciais.",
        "Um registro por combinação parceria × solução × produto.",
        "Referência Produto.",
        "RN-DP-01: Obrigatório. Não substitui valor unitário exibido no Produto (calculado).",
        classe="Dados de Parceria por Produto (Atlas Fase 2)",
        preenche="MTI / Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-dados-parceria-periodo-minimo": D(
        "Compromisso mínimo de contratação em meses.",
        "Parceiro seleciona 12, 24, 36, 48 ou 60.",
        "Cadastro Atlas / planilha col. Período Mínimo.",
        "RN-DP-02: Obrigatório. Perpétuo = Modelo de Venda no Produto, não aqui.",
        classe="Dados de Parceria por Produto (Atlas Fase 2)",
        preenche="Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-dados-parceria-custo-parceiro": D(
        "Custo de entrada informado pelo parceiro.",
        "Parceiro preenche no portal ou CSV (obrigatório).",
        "Planilha col. Custo — dado nasce no Atlas.",
        "RN-DP-01: Participa do cálculo valor unitário (custo × markup MTI).",
        classe="Dados de Parceria por Produto (Atlas Fase 2)",
        preenche="Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-dados-parceria-custo-mercado": D(
        "Referência de mercado / base MTI para composição de preço.",
        "MTI informa quando aplicável. Parceiro não visualiza (sigilo).",
        "Cadastro MTI.",
        "RN-DP-03: partnerHidden. Complementa markup na fórmula (sign-off fórmula pendente).",
        classe="Dados de Parceria por Produto (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-dados-parceria-markup": D(
        "Multiplicador aplicado pela MTI sobre o custo do parceiro.",
        "MTI preenche (ex.: 1,18). Parceiro não vê.",
        "Cadastro MTI — planilha col. MARKUP.",
        "RN-DP-03: Gera % Parceiro, % MTI e valor unitário do Produto. CSV parceiro sem markup.",
        classe="Dados de Parceria por Produto (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-dados-parceria-dist-parceiro": D(
        "Percentual de rateio do parceiro.",
        "Somente leitura — calculado a partir de custo + markup.",
        "Sistema após Salvar.",
        "31/08: parceiro visualiza nos próprios produtos; não edita.",
        classe="Dados de Parceria por Produto (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (nos próprios produtos)",
    ),
    "form-patlasv4-proto-cat-dados-parceria-dist-mti": D(
        "Percentual de rateio da MTI.",
        "Somente leitura — calculado.",
        "Sistema após Salvar.",
        "31/08: parceiro visualiza nos próprios produtos; não edita.",
        classe="Dados de Parceria por Produto (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (nos próprios produtos)",
    ),
    "form-patlasv4-proto-cat-dados-parceria-ativo": D(
        "Disponibilidade do registro de condições comerciais.",
        "Desligue para inativar sem apagar histórico.",
        "MTI / Parceiro conforme permissão.",
        "Independe do Status de workflow do Produto/Catálogo.",
        classe="Dados de Parceria por Produto (Atlas Fase 2)",
        preenche="MTI / Parceiro",
        visualiza="MTI · Parceiro",
    ),
}

# Campos técnicos herdados do Catálogo — permanecem ocultos (não são DELETE; necessários ao protótipo)
PRODUTO_CFG_IDS = {
    "form-patlasv4-proto-cat-produto-cfg-usa-complexidade",
    "form-patlasv4-proto-cat-produto-cfg-usa-peso",
    "form-patlasv4-proto-cat-produto-cfg-exige-qtde",
}

PRODUTO_UNHIDE = {
    "form-patlasv4-proto-cat-produto-vertical",
    "form-patlasv4-proto-cat-produto-complexidade",
    "form-patlasv4-proto-cat-produto-coeficiente-complexidade",
    "form-patlasv4-proto-cat-produto-peso",
    "form-patlasv4-proto-cat-produto-qtde-metrica",
    "form-patlasv4-proto-cat-produto-consumo-os",
    "form-patlasv4-proto-cat-produto-moeda-universal",
    "form-patlasv4-proto-cat-produto-alerta-perpetuo",
}


def find_form(forms: list, fid: str) -> dict:
    for f in forms:
        if f.get("id") == fid:
            return f
    raise KeyError(fid)


def is_delete_field(fld: dict) -> bool:
    return str(fld.get("label", "")).startswith("DELETE")


def is_delete_section(sec: dict) -> bool:
    title = str(sec.get("title", ""))
    sid = str(sec.get("id", "")).lower()
    return "DELETE" in title or ("delete" in sid and "fora" in title.lower())


def strip_orphan_keys(obj, keys: set[str]) -> None:
    if isinstance(obj, dict):
        for k in list(obj.keys()):
            if k in keys:
                del obj[k]
            else:
                strip_orphan_keys(obj[k], keys)
    elif isinstance(obj, list):
        for item in obj:
            strip_orphan_keys(item, keys)


def clean_presets(form: dict, removed_ids: set[str]) -> None:
    for p in form.get("exampleValuePresets", []):
        fv = p.get("fieldValues", {})
        for k in list(fv.keys()):
            if k in removed_ids:
                del fv[k]
        emb = p.get("embeddedRowsByFieldId", {})
        if isinstance(emb, dict):
            for rows in emb.values():
                if isinstance(rows, list):
                    for row in rows:
                        if isinstance(row, dict):
                            for k in list(row.keys()):
                                if k in removed_ids:
                                    del row[k]
        strip_orphan_keys(p, removed_ids)


def clean_visibility_rules(form: dict, valid_ids: set[str]) -> None:
    rules = form.get("fieldVisibilityRules") or []
    cleaned = []
    for r in rules:
        src = r.get("sourceFieldId")
        if src and src not in valid_ids:
            continue
        targets = [t for t in r.get("targetFieldIds", []) if t in valid_ids]
        if not targets:
            continue
        r2 = {**r, "targetFieldIds": targets}
        cleaned.append(r2)
    form["fieldVisibilityRules"] = cleaned if cleaned else None
    if form.get("fieldVisibilityRules") is None:
        form.pop("fieldVisibilityRules", None)


def purge_delete_content(form: dict) -> set[str]:
    removed: set[str] = set()
    for fld in form.get("fields", []):
        if is_delete_field(fld):
            removed.add(fld["id"])

    delete_sec_ids = {s["id"] for s in form.get("sections", []) if is_delete_section(s)}
    first_sec = next((s["id"] for s in form.get("sections", []) if s["id"] not in delete_sec_ids), None)

    for fld in form.get("fields", []):
        if fld.get("sectionId") in delete_sec_ids and not is_delete_field(fld):
            if first_sec:
                fld["sectionId"] = first_sec

    form["fields"] = [f for f in form.get("fields", []) if f["id"] not in removed]
    form["sections"] = [s for s in form.get("sections", []) if s["id"] not in delete_sec_ids]

    # Seções vazias (ex.: card listagem)
    used_secs = {f.get("sectionId") for f in form.get("fields", []) if f.get("sectionId")}
    form["sections"] = [s for s in form.get("sections", []) if s["id"] in used_secs or s.get("title")]

    valid_ids = {f["id"] for f in form.get("fields", [])}
    clean_visibility_rules(form, valid_ids)
    clean_presets(form, removed)

    for fld in form.get("fields", []):
        if fld.get("type") == "embeddedReference" and fld.get("embeddedTableHiddenFieldIds"):
            fld["embeddedTableHiddenFieldIds"] = [
                x for x in fld["embeddedTableHiddenFieldIds"] if x in valid_ids
            ]

    return removed


def load_patch_module(path: Path):
    spec = importlib.util.spec_from_file_location(f"patch_{path.stem}", path)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    return mod


def apply_f2_patches(forms_path: Path) -> None:
    mod = load_patch_module(PATCH_3108)
    forms = json.loads(forms_path.read_text(encoding="utf-8"))
    mod.patch_parceria(mod.find_form(forms, "form-patlasv4-proto-cat-parceria"))
    mod.patch_catalogo(mod.find_form(forms, "form-patlasv4-proto-cat-catalogo"))
    mod.patch_produto(mod.find_form(forms, "form-patlasv4-proto-cat-produto"))
    mod.apply_specs_fallback(mod.find_form(forms, "form-patlasv4-proto-cat-parceria"), "Parceria")
    mod.apply_specs_fallback(mod.find_form(forms, "form-patlasv4-proto-cat-catalogo"), "Catálogo")
    mod.apply_specs_fallback(mod.find_form(forms, "form-patlasv4-proto-cat-produto"), "Produto")
    forms_path.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def apply_completo_patches(forms_path: Path, forms: list) -> int:
    mod = load_patch_module(PATCH_COMPLETO)
    total = 0
    for fid in F2_FORMS:
        total += mod.enforce_delete(mod.find_form(forms, fid))
    mod.patch_dpp(mod.find_form(forms, "form-patlasv4-proto-cat-dados-parceria"))
    mod.patch_produto_structure(mod.find_form(forms, "form-patlasv4-proto-cat-produto"))
    mod.patch_catalogo_structure(mod.find_form(forms, "form-patlasv4-proto-cat-catalogo"))
    mod.patch_parceria_structure(mod.find_form(forms, "form-patlasv4-proto-cat-parceria"))
    mod.enforce_delete(mod.find_form(forms, "form-patlasv4-proto-cat-solucao"))
    return total


def patch_solucao(form: dict) -> None:
    form["metadata"] = "FINAL F2 2026-08-31 · RN-SOL-01..05 · Parceria obrigatória · Catálogo resolvido pelo sistema" + META_SUFFIX

    for fld in form["fields"]:
        fid = fld.get("id", "")
        if fid in SOLUCAO_SPECS:
            fld["spec"] = SOLUCAO_SPECS[fid]
        if fid == "form-patlasv4-proto-cat-solucao-ativo":
            fld["required"] = True
        if fid == "form-patlasv4-proto-cat-solucao-alerta-produtos":
            fld.pop("hidden", None)

    form["methods"] = [
        {
            "id": "patlasv4proto-sol-meth-salvar",
            "name": "Salvar",
            "icon": "save",
            "kind": "destaque",
            "spec": "Persiste Solução na Parceria. Sistema resolve/atualiza referência ao Catálogo N2 (RN-SOL-03).",
        },
        {
            "id": "patlasv4proto-sol-meth-inativar",
            "name": "Inativar",
            "icon": "block",
            "kind": "menu",
            "spec": "RN-SOL-04: Define Ativo = Não. Não excluir se houver catálogo/produtos vinculados.",
        },
    ]


def patch_dpp_final(form: dict) -> None:
    form["metadata"] = (
        "FINAL F2 2026-08-31 · RN-DP-01..05 · Custo (parceiro) + Markup (MTI) + % calculados + Período mínimo"
        + META_SUFFIX
    )

    for fld in form["fields"]:
        fid = fld.get("id", "")
        if fid in DPP_SPECS:
            fld["spec"] = DPP_SPECS[fid]
        if fid == "form-patlasv4-proto-cat-dados-parceria-parceria":
            fld["required"] = True
            fld["label"] = "Parceria"
        if fid == "form-patlasv4-proto-cat-dados-parceria-custo-parceiro":
            fld["label"] = "!Custo do parceiro"
        if fid == "form-patlasv4-proto-cat-dados-parceria-periodo-minimo":
            fld["label"] = "!Período mínimo"
        if fid == "form-patlasv4-proto-cat-dados-parceria-ativo":
            fld["sectionId"] = "sec-cat-dp-info"
            fld["required"] = True
        if fid == "form-patlasv4-proto-cat-dados-parceria-markup":
            fld["partnerHidden"] = True
        if fid == "form-patlasv4-proto-cat-dados-parceria-custo-mercado":
            fld["partnerHidden"] = True

    alert = next((f for f in form["fields"] if f.get("id") == "form-patlasv4-proto-cat-dados-parceria-alerta-proposta"), None)
    if alert:
        alert["alertTitle"] = "RN-DP-01 — Condições comerciais canônicas"
        alert["alertMessage"] = (
            "Parceiro: Custo + Período mínimo. MTI: Markup + custo de mercado (sigilo). "
            "% Parceiro e % MTI calculados — parceiro vê nos próprios produtos (31/08). "
            "CSV do parceiro sem markup/% MTI."
        )

    form["methods"] = [
        {
            "id": "patlasv4proto-dp-meth-salvar",
            "name": "Salvar",
            "icon": "save",
            "kind": "destaque",
            "spec": "Persiste condições comerciais. Recalcula % Parceiro, % MTI e valor unitário do Produto vinculado.",
        },
        {
            "id": "patlasv4proto-dp-meth-inativar",
            "name": "Inativar",
            "icon": "block",
            "kind": "menu",
            "spec": "Define Ativo = Não sem apagar histórico de condições comerciais.",
        },
    ]


def patch_produto_final(form: dict) -> None:
    form["metadata"] = (
        "FINAL F2 2026-08-31 · RN-PROD-01..12 · RN-DP · RN-IMP · Item de catálogo · parceria opcional MTI"
        + META_SUFFIX
    )

    form["sections"] = [s for s in form.get("sections", []) if s.get("id") != "sec-prod-card"]

    for fld in form["fields"]:
        fid = fld.get("id", "")
        if fid in PRODUTO_UNHIDE:
            fld.pop("hidden", None)
        if fid in PRODUTO_CFG_IDS:
            fld["hidden"] = True
            fld["readOnly"] = True
        if fid == "form-patlasv4-proto-cat-produto-vertical":
            fld["label"] = "Vertical de serviço de TI"
        if fid == "form-patlasv4-proto-cat-produto-moeda-universal":
            fld["label"] = "#Valor da moeda universal"

    form["methods"] = [
        {
            "id": "patlasv4proto-prod-meth-salvar",
            "name": "Salvar",
            "icon": "save",
            "kind": "destaque",
            "spec": "Persiste item de catálogo. Herda contexto do Catálogo (RN-PROD-01). Gera Código Atlas se novo.",
        },
        {
            "id": "patlasv4proto-prod-meth-enviar",
            "name": "Enviar para análise",
            "icon": "send",
            "kind": "menu",
            "spec": "Envia item/catálogo para análise MTI. Parceiro fica somente leitura após envio (RN-MTI-01).",
        },
    ]


def patch_parceria_final(form: dict) -> None:
    form["metadata"] = (
        "FINAL F2 2026-08-31 · RN-PAR-01..06 · RN-IMP-01 · Índice reajuste · Salvar → Catálogo Rascunho"
        + META_SUFFIX
    )

    # Remover referência legada oculta (substituída por embedded Soluções)
    legacy = "form-patlasv4-proto-cat-parceria-solucoes"
    form["fields"] = [f for f in form["fields"] if f.get("id") != legacy]
    for p in form.get("exampleValuePresets", []):
        p.get("fieldValues", {}).pop(legacy, None)

    for fld in form["fields"]:
        if fld.get("id") == "form-patlasv4-proto-cat-parceria-alerta-visao":
            form["fields"] = [f for f in form["fields"] if f.get("id") != "form-patlasv4-proto-cat-parceria-alerta-visao"]
            break
        if fld.get("id") == "form-patlasv4-proto-cat-parceria-solucoes-view":
            fld["label"] = "Soluções da parceria"


def patch_catalogo_final(form: dict) -> None:
    form["metadata"] = (
        "FINAL F2 2026-08-31 · RN-CAT-01..08 · Eixo Universal/Individualizado · Tipo Licença/Serviço = Produto"
        + META_SUFFIX
    )

    for fid in (
        "form-patlasv4-proto-cat-catalogo-alerta-trava-parceiro",
        "form-patlasv4-proto-cat-catalogo-faixas-complexidade",
        "form-patlasv4-proto-cat-catalogo-cod-siag-univ",
        "form-patlasv4-proto-cat-catalogo-cod-protheus-univ",
    ):
        fld = next((f for f in form["fields"] if f.get("id") == fid), None)
        if fld:
            fld.pop("hidden", None)


def ensure_spec_complete(form: dict, classe: str) -> None:
    for fld in form.get("fields", []):
        if fld.get("type") == "alert":
            continue
        if fld.get("id") in PRODUTO_CFG_IDS:
            continue
        spec = fld.get("spec") or ""
        if "Como usar" not in spec and "Para que serve" not in spec:
            label = fld.get("label", fld.get("id", ""))
            fld["spec"] = D(
                f"Campo `{label}` da classe {classe}.",
                "Consulte regras RN associadas ao formulário e legenda do label.",
                "Cadastro Atlas Fase 2.",
                "Governança portal MTI ↔ parceiro conforme validação 31/08.",
                classe=f"{classe} (Atlas Fase 2)",
            )


def audit_form(form: dict, name: str) -> dict:
    fields = form.get("fields", [])
    delete_n = sum(1 for f in fields if is_delete_field(f))
    active = [
        f
        for f in fields
        if not is_delete_field(f)
        and f.get("type") != "alert"
        and not (f.get("hidden") and f.get("id") not in PRODUTO_CFG_IDS)
    ]
    with_usar = sum(1 for f in active if "Como usar" in (f.get("spec") or ""))
    methods = form.get("methods") or []
    return {
        "name": name,
        "active": len(active),
        "delete_left": delete_n,
        "specs_ok": with_usar,
        "methods": len(methods),
    }


def main() -> None:
    if not FORMS.is_file():
        sys.exit(f"Arquivo não encontrado: {FORMS}")

    # 1) Reaplicar patches F2 no atlas-v2 (specs + campos)
    apply_f2_patches(FORMS)

    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    total_del_hidden = apply_completo_patches(FORMS, forms)

    # 3) Remover DELETE + ajustes finais Atlas V2
    total_purged = 0
    for fid in F2_FORMS:
        f = find_form(forms, fid)
        total_purged += len(purge_delete_content(f))

    patch_solucao(find_form(forms, "form-patlasv4-proto-cat-solucao"))
    patch_dpp_final(find_form(forms, "form-patlasv4-proto-cat-dados-parceria"))
    patch_produto_final(find_form(forms, "form-patlasv4-proto-cat-produto"))
    patch_parceria_final(find_form(forms, "form-patlasv4-proto-cat-parceria"))
    patch_catalogo_final(find_form(forms, "form-patlasv4-proto-cat-catalogo"))

    for fid, cls in [
        ("form-patlasv4-proto-cat-parceria", "Parceria"),
        ("form-patlasv4-proto-cat-solucao", "Solução"),
        ("form-patlasv4-proto-cat-catalogo", "Catálogo"),
        ("form-patlasv4-proto-cat-produto", "Produto"),
        ("form-patlasv4-proto-cat-dados-parceria", "Dados de Parceria por Produto"),
    ]:
        ensure_spec_complete(find_form(forms, fid), cls)

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"OK Atlas V2 F2 final — {total_purged} campos DELETE removidos")
    print(f"   (antes da limpeza: {total_del_hidden} estavam ocultos como DELETE)")
    print(f"   {FORMS}\n")
    for fid in F2_FORMS:
        f = find_form(forms, fid)
        a = audit_form(f, f.get("name", fid))
        print(
            f"  {a['name']}: {a['active']} campos · {a['specs_ok']} specs completas · "
            f"{a['methods']} métodos · DELETE restante: {a['delete_left']}"
        )


if __name__ == "__main__":
    main()
