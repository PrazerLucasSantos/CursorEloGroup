# -*- coding: utf-8 -*-
"""Apply 17/08 Fase 2 validation deltas to atlas-prototipo forms + workspace."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
WS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/workspaces.json"


def fget(forms: list, fid: str) -> dict:
    for item in forms:
        if item.get("id") == fid:
            return item
    raise KeyError(fid)


def field(form: dict, fid: str) -> dict:
    for item in form.get("fields") or []:
        if item.get("id") == fid:
            return item
    raise KeyError(fid)


def insert_after(form: dict, after_id: str, new_field: dict) -> None:
    fields = form["fields"]
    for i, item in enumerate(fields):
        if item.get("id") == after_id:
            fields.insert(i + 1, new_field)
            return
    raise KeyError(after_id)


def hide_field(form: dict, fid: str) -> None:
    try:
        fl = field(form, fid)
    except KeyError:
        return
    fl["hidden"] = True


def main() -> int:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    workspaces = json.loads(WS.read_text(encoding="utf-8"))

    # --- Tipo de cobrança ---
    tc = fget(forms, "form-patlasv4-proto-cat-tipo-cobranca")
    tc["metadata"] = (
        "Validação 17/08: Nome + Ativo. Mensal · Anual · Conforme homologação · Única. "
        "Recorrência/pro rata são do contrato. Cadastro só MTI. Perpétuo → cobrança Única."
    )
    field(tc, "form-patlasv4-proto-cat-tipo-cobranca-nome")["spec"] = (
        "Nome controlado. Valores: Mensal · Anual · Conforme homologação · Única. "
        "Única aplica-se quando o modelo de venda for Perpétuo. Recorrência não fica nesta classe."
    )
    if not any(p.get("id") == "p-tc-unico" for p in tc.get("exampleValuePresets") or []):
        tc.setdefault("exampleValuePresets", []).append(
            {
                "id": "p-tc-unico",
                "name": "Única",
                "fieldValues": {
                    "form-patlasv4-proto-cat-tipo-cobranca-nome": "Única",
                    "form-patlasv4-proto-cat-tipo-cobranca-descricao": (
                        "Cobra uma única vez. Usar quando o modelo de venda for Perpétuo."
                    ),
                    "form-patlasv4-proto-cat-tipo-cobranca-ativo": True,
                },
            }
        )

    # --- Vertical (mantém id da classe Categoria para não quebrar vínculos) ---
    cat = fget(forms, "form-patlasv4-proto-cat-categoria")
    cat["name"] = "Vertical de Serviço de TI"
    cat["metadata"] = (
        "Validação 17/08: ex-Categoria de Serviço. Verticais de atuação em TI. "
        "Relacionada à Parceria (não ao parceiro). Cadastro só MTI. Anti-órfão."
    )
    cat["sections"] = [
        {"id": "sec-cat-catg-info", "title": "Informações", "icon": "info"},
        {"id": "sec-cat-catg-uso", "title": "Onde é usada", "icon": "account_tree"},
    ]
    field(cat, "form-patlasv4-proto-cat-categoria-identificador")["spec"] = (
        "Nome da vertical de atuação em TI. Ex.: Dados e Inteligência Artificial."
    )
    desc = field(cat, "form-patlasv4-proto-cat-categoria-descricao")
    desc["hidden"] = False
    desc["spec"] = "Texto da vertical. Cadastro MTI."
    if not any(x.get("id") == "form-patlasv4-proto-cat-categoria-parcerias" for x in cat["fields"]):
        cat["fields"].append(
            {
                "id": "form-patlasv4-proto-cat-categoria-parcerias",
                "label": "Parcerias",
                "type": "reference",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-cat-catg-uso",
                "linkedFormId": "form-patlasv4-proto-cat-parceria",
                "options": ["MTI SIMPLIFICA", "MTI HOST", "MTI QI", "MTI SaaS"],
                "spec": (
                    "Parcerias relacionadas a esta vertical (não ao parceiro/CNPJ). "
                    "Consulta reversa para evitar registros órfãos. Somente leitura."
                ),
            }
        )
    cat["exampleValuePresets"] = [
        {
            "id": "p-vert-dados-ia",
            "name": "Dados e Inteligência Artificial",
            "fieldValues": {
                "form-patlasv4-proto-cat-categoria-identificador": "Dados e Inteligência Artificial",
                "form-patlasv4-proto-cat-categoria-descricao": "Vertical de dados, analytics e IA.",
                "form-patlasv4-proto-cat-categoria-ativo": True,
                "form-patlasv4-proto-cat-categoria-parcerias": ["MTI QI"],
            },
        },
        {
            "id": "p-vert-automacao",
            "name": "Automação e Processos",
            "fieldValues": {
                "form-patlasv4-proto-cat-categoria-identificador": "Automação e Processos",
                "form-patlasv4-proto-cat-categoria-descricao": "Vertical de automação e simplificação de processos.",
                "form-patlasv4-proto-cat-categoria-ativo": True,
                "form-patlasv4-proto-cat-categoria-parcerias": ["MTI SIMPLIFICA"],
            },
        },
        {
            "id": "p-vert-ciber",
            "name": "Cibersegurança",
            "fieldValues": {
                "form-patlasv4-proto-cat-categoria-identificador": "Cibersegurança",
                "form-patlasv4-proto-cat-categoria-descricao": "Vertical de segurança da informação e cibersegurança.",
                "form-patlasv4-proto-cat-categoria-ativo": True,
                "form-patlasv4-proto-cat-categoria-parcerias": ["MTI HOST"],
            },
        },
        {
            "id": "p-vert-nuvem",
            "name": "Nuvem",
            "fieldValues": {
                "form-patlasv4-proto-cat-categoria-identificador": "Nuvem",
                "form-patlasv4-proto-cat-categoria-descricao": "Vertical de nuvem e infraestrutura como serviço.",
                "form-patlasv4-proto-cat-categoria-ativo": True,
                "form-patlasv4-proto-cat-categoria-parcerias": ["MTI HOST"],
            },
        },
        {
            "id": "p-vert-conect",
            "name": "Conectividade",
            "fieldValues": {
                "form-patlasv4-proto-cat-categoria-identificador": "Conectividade",
                "form-patlasv4-proto-cat-categoria-descricao": "Vertical de conectividade.",
                "form-patlasv4-proto-cat-categoria-ativo": True,
                "form-patlasv4-proto-cat-categoria-parcerias": [],
            },
        },
        {
            "id": "p-vert-ident-gov",
            "name": "Identidade e governo",
            "fieldValues": {
                "form-patlasv4-proto-cat-categoria-identificador": "Identidade e governo",
                "form-patlasv4-proto-cat-categoria-descricao": "Vertical de identidade e governo digital.",
                "form-patlasv4-proto-cat-categoria-ativo": True,
                "form-patlasv4-proto-cat-categoria-parcerias": ["MTI SaaS"],
            },
        },
    ]
    cat["activeExamplePresetId"] = "p-vert-automacao"

    # --- Grupo ---
    grp = fget(forms, "form-patlasv4-proto-cat-grupo")
    grp["metadata"] = (
        "Validação 17/08: Grupo atrelado à Parceria. Filtro parceria ou Todos. "
        "Obrigatório no Produto. Parceiro e MTI cadastram (também via CSV). SKU é opcional no produto."
    )
    if not any(x.get("id") == "form-patlasv4-proto-cat-grupo-filtro" for x in grp["fields"]):
        grp["fields"].insert(
            0,
            {
                "id": "form-patlasv4-proto-cat-grupo-filtro",
                "label": "Filtro — Parceria",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-cat-grp-info",
                "options": ["Todos", "MTI SIMPLIFICA", "MTI HOST"],
                "spec": (
                    "Lista de grupos: filtrar pela parceria selecionada ou Todos, "
                    "para não poluir a tela. Luís 17/08."
                ),
            },
        )
    if not any(x.get("id") == "form-patlasv4-proto-cat-grupo-parceria" for x in grp["fields"]):
        insert_after(
            grp,
            "form-patlasv4-proto-cat-grupo-identificador",
            {
                "id": "form-patlasv4-proto-cat-grupo-parceria",
                "label": "Parceria",
                "type": "reference",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-cat-grp-info",
                "linkedFormId": "form-patlasv4-proto-cat-parceria",
                "options": ["MTI SIMPLIFICA", "MTI HOST"],
                "spec": (
                    "Grupo é da parceria (não do parceiro/CNPJ). Obrigatório. "
                    "Parceiro pode cadastrar os grupos da própria parceria, inclusive via CSV."
                ),
            },
        )
    sol = field(grp, "form-patlasv4-proto-cat-grupo-solucao")
    sol["required"] = False
    sol["hidden"] = True
    sol["spec"] = "Opcional/legado. O vínculo obrigatório passou a ser a Parceria (17/08)."
    hide_field(grp, "form-patlasv4-proto-cat-grupo-categoria")
    field(grp, "form-patlasv4-proto-cat-grupo-categoria")["spec"] = (
        "Não usar. Vertical de Serviço de TI fica no Produto (tipo Serviço), não no Grupo."
    )
    grp["exampleValuePresets"] = [
        {
            "id": "p-grp-analise",
            "name": "Análise e Modelagem · Simplifica",
            "fieldValues": {
                "form-patlasv4-proto-cat-grupo-filtro": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-grupo-identificador": "Análise e Modelagem de Processos",
                "form-patlasv4-proto-cat-grupo-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-grupo-descricao": "Família de serviços de análise e modelagem.",
                "form-patlasv4-proto-cat-grupo-ativo": True,
            },
        },
        {
            "id": "p-grp-automacao",
            "name": "Automação · Simplifica",
            "fieldValues": {
                "form-patlasv4-proto-cat-grupo-filtro": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-grupo-identificador": "Automação de processos",
                "form-patlasv4-proto-cat-grupo-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-grupo-descricao": "Família de automação da parceria Simplifica.",
                "form-patlasv4-proto-cat-grupo-ativo": True,
            },
        },
        {
            "id": "p-grp-dados",
            "name": "Gestão de dados · Simplifica",
            "fieldValues": {
                "form-patlasv4-proto-cat-grupo-filtro": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-grupo-identificador": "Gestão de dados",
                "form-patlasv4-proto-cat-grupo-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-grupo-ativo": True,
            },
        },
        {
            "id": "p-grp-host",
            "name": "Infraestrutura · Host",
            "fieldValues": {
                "form-patlasv4-proto-cat-grupo-filtro": "MTI HOST",
                "form-patlasv4-proto-cat-grupo-identificador": "Infraestrutura",
                "form-patlasv4-proto-cat-grupo-parceria": "MTI HOST",
                "form-patlasv4-proto-cat-grupo-descricao": "Grupos do catálogo Host.",
                "form-patlasv4-proto-cat-grupo-ativo": True,
            },
        },
        {
            "id": "p-grp-todos",
            "name": "Filtro Todos",
            "fieldValues": {
                "form-patlasv4-proto-cat-grupo-filtro": "Todos",
                "form-patlasv4-proto-cat-grupo-identificador": "(visão consolidada)",
                "form-patlasv4-proto-cat-grupo-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-grupo-descricao": "Exemplo do filtro Todos — lista grupos de todas as parcerias.",
                "form-patlasv4-proto-cat-grupo-ativo": True,
            },
        },
    ]
    grp["activeExamplePresetId"] = "p-grp-analise"

    # --- Modelo de venda ---
    mv = fget(forms, "form-patlasv4-proto-cat-modelo-venda")
    mv["metadata"] = (
        "Validação 17/08: Nome, descrição, ativo. Seleção no Produto. "
        "MTI reduz a lista antes da carga. Perpétuo → Tipo de cobrança Única."
    )
    field(mv, "form-patlasv4-proto-cat-modelo-venda-identificador")["spec"] = (
        "Nome do modelo. Lista será reduzida pela MTI. Se Perpétuo, a cobrança do produto deve ser Única."
    )
    existing_mv = {p.get("id") for p in mv.get("exampleValuePresets") or []}
    extras_mv = [
        {
            "id": "p-mv-perpetuo",
            "name": "Perpétuo",
            "fieldValues": {
                "form-patlasv4-proto-cat-modelo-venda-identificador": "Perpétuo",
                "form-patlasv4-proto-cat-modelo-venda-descricao": (
                    "Licenciamento perpétuo. Compatibilizar com Tipo de cobrança Única."
                ),
                "form-patlasv4-proto-cat-modelo-venda-ativo": True,
            },
        },
        {
            "id": "p-mv-ust",
            "name": "Por UST",
            "fieldValues": {
                "form-patlasv4-proto-cat-modelo-venda-identificador": "Por UST",
                "form-patlasv4-proto-cat-modelo-venda-descricao": (
                    "Empacotamento em Unidade de Serviço Técnico. Lista ainda será reduzida pela MTI."
                ),
                "form-patlasv4-proto-cat-modelo-venda-ativo": True,
            },
        },
    ]
    for extra in extras_mv:
        if extra["id"] not in existing_mv:
            mv.setdefault("exampleValuePresets", []).append(extra)

    # --- Catálogo ---
    catlg = fget(forms, "form-patlasv4-proto-cat-catalogo")
    catlg["metadata"] = (
        "Validação 17/08: tipos Universal / Serviços / Licenciamento. "
        "Métricas + valor unitário no catálogo. Complexidade SAI do catálogo (vai ao Produto). "
        "Vigência não exibida. Parceiro monta o rascunho no portal; MTI homologa/publica."
    )
    field(catlg, "form-patlasv4-proto-cat-catalogo-toggle-universal")["spec"] = (
        "Catálogo universal: produtos herdam tipo de oferta Universal (somente leitura no Produto). "
        "Não misturar com individualizado. Métricas: USN, UST e HST."
    )
    field(catlg, "form-patlasv4-proto-cat-catalogo-toggle-servicos")["spec"] = (
        "Catálogo de serviços: métricas UST e HST. Pode ser Sim junto com universal. "
        "Complexidade não é deste formulário — fica no Produto/Serviço."
    )
    if not any(x.get("id") == "form-patlasv4-proto-cat-catalogo-toggle-licenca" for x in catlg["fields"]):
        insert_after(
            catlg,
            "form-patlasv4-proto-cat-catalogo-toggle-servicos",
            {
                "id": "form-patlasv4-proto-cat-catalogo-toggle-licenca",
                "label": "É catálogo de licenciamento?",
                "type": "boolean",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "common",
                "spec": (
                    "Incluído em 17/08 (faltava a licença). Métrica permitida: USN. "
                    "Produtos herdam a característica do catálogo."
                ),
                "sectionId": "sec-cat-props",
            },
        )
    ev = field(catlg, "form-patlasv4-proto-cat-catalogo-estrutura-variacao")
    ev["hidden"] = True
    ev["spec"] = "Removido em 17/08. Complexidade/peso ficam no Produto, não no Catálogo."
    cx = field(catlg, "form-patlasv4-proto-cat-catalogo-complexidades")
    cx["hidden"] = True
    cx["spec"] = "Removido em 17/08. Faixa de complexidade é cadastrada no Produto/Serviço."
    for sec in catlg.get("sections") or []:
        if sec.get("id") == "sec-cat-complex":
            sec["title"] = "Complexidades (não usar — movido ao Produto)"
    field(catlg, "form-patlasv4-proto-cat-catalogo-metricas")["spec"] = (
        "Métrica + valor unitário (pode diferir do padronizado). "
        "Universal → USN/UST/HST; Serviços → UST/HST; Licenciamento → USN."
    )
    field(catlg, "form-patlasv4-proto-cat-catalogo-cod-siag-cat")["spec"] = (
        "Opcional no cadastro. Obrigatório no contrato. Imediato só N2 e objetos USN/UST/HST."
    )
    field(catlg, "form-patlasv4-proto-cat-catalogo-cod-protheus-cat")["spec"] = (
        "Opcional no cadastro. Obrigatório no contrato se ainda não houver código."
    )
    catlg["fieldVisibilityRules"] = [
        r
        for r in (catlg.get("fieldVisibilityRules") or [])
        if r.get("id") != "rule-cat-complex"
    ]
    for preset in catlg.get("exampleValuePresets") or []:
        fv = preset.setdefault("fieldValues", {})
        fv.pop("form-patlasv4-proto-cat-catalogo-estrutura-variacao", None)
        if "form-patlasv4-proto-cat-catalogo-toggle-licenca" not in fv:
            fv["form-patlasv4-proto-cat-catalogo-toggle-licenca"] = False
        # Simplifica: serviços+universal; Host: serviços
        if preset.get("id") == "form-patlasv4-proto-cat-catalogo-p-simplifica":
            fv["form-patlasv4-proto-cat-catalogo-toggle-licenca"] = False
            fv["form-patlasv4-proto-cat-catalogo-toggle-universal"] = True
        if preset.get("id") == "form-patlasv4-proto-cat-catalogo-p-host":
            fv["form-patlasv4-proto-cat-catalogo-toggle-licenca"] = False
        rows = (preset.get("embeddedRowsByFieldId") or {}).get(
            "form-patlasv4-proto-cat-catalogo-produtos"
        ) or []
        oferta = (
            "Universal"
            if fv.get("form-patlasv4-proto-cat-catalogo-toggle-universal")
            else "Individualizado"
        )
        for row in rows:
            row["form-patlasv4-proto-cat-produto-tipo-oferta"] = oferta
            if not row.get("form-patlasv4-proto-cat-produto-grupo"):
                if "HOST" in str(fv.get("form-patlasv4-proto-cat-catalogo-parceria") or ""):
                    row["form-patlasv4-proto-cat-produto-grupo"] = "Infraestrutura"
                    row["form-patlasv4-proto-cat-produto-categoria"] = "Nuvem"
                else:
                    row["form-patlasv4-proto-cat-produto-grupo"] = "Análise e Modelagem de Processos"
                    if row.get("form-patlasv4-proto-cat-produto-tipo") == "Serviço":
                        row["form-patlasv4-proto-cat-produto-categoria"] = "Automação e Processos"

    # --- Produto ---
    prod = fget(forms, "form-patlasv4-proto-cat-produto")
    prod["metadata"] = (
        "Validação 17/08: Catálogo 1º; tipo de oferta e moeda herdados (RO); "
        "Grupo obrigatório; Vertical se Serviço; complexidade no item; SIAG opcional "
        "(obrigatório no contrato). Parceiro monta no portal."
    )
    tof = field(prod, "form-patlasv4-proto-cat-produto-tipo-oferta")
    tof["readOnly"] = True
    tof["spec"] = (
        "Herdado do Catálogo. Não recadastrar. Catálogo universal só tem produtos universais; "
        "individualizado só individualizados (sem mistura). 17/08."
    )
    grp_f = field(prod, "form-patlasv4-proto-cat-produto-grupo")
    grp_f["required"] = True
    grp_f["spec"] = (
        "Obrigatório. Filtrar grupos pela parceria do catálogo. SKU/Part Number é opcional."
    )
    vert = field(prod, "form-patlasv4-proto-cat-produto-categoria")
    vert["label"] = "Vertical de Serviço de TI"
    vert["spec"] = (
        "Exibir quando Tipo = Serviço. Aponta para Vertical de Serviço de TI (ex-Categoria). 17/08."
    )
    vert["options"] = [
        "Dados e Inteligência Artificial",
        "Automação e Processos",
        "Cibersegurança",
        "Nuvem",
        "Conectividade",
        "Identidade e governo",
    ]
    field(prod, "form-patlasv4-proto-cat-produto-part-number")["spec"] = (
        "SKU/Part Number opcional — nem todo fabricante trabalha com SKU. 17/08."
    )
    field(prod, "form-patlasv4-proto-cat-produto-moeda-universal")["spec"] = (
        "Somente leitura. Exibe o valor da moeda universal do Catálogo; não recadastrar no Produto."
    )
    field(prod, "form-patlasv4-proto-cat-produto-complexidade")["spec"] = (
        "Do Produto/Serviço, não do Catálogo. Serviços do mesmo catálogo podem ter faixas diferentes. 17/08."
    )
    field(prod, "form-patlasv4-proto-cat-produto-coeficiente-complexidade")["spec"] = (
        "Coeficiente da faixa do item. Não depende mais de tabela no Catálogo."
    )
    field(prod, "form-patlasv4-proto-cat-produto-peso")["spec"] = (
        "Opcional no Serviço. Não depende de estrutura de variação do Catálogo."
    )
    field(prod, "form-patlasv4-proto-cat-produto-cod-siag-item")["spec"] = (
        "Opcional no cadastro. Obrigatório no contrato. Código imediato só N2 e USN/UST/HST; "
        "itens N1 só recebem código na contratação."
    )
    field(prod, "form-patlasv4-proto-cat-produto-cod-protheus-item")["spec"] = (
        "Opcional no cadastro. No contrato: se já existir, reaproveitar; senão informar na mão."
    )
    hide_field(prod, "form-patlasv4-proto-cat-produto-cfg-usa-complexidade")
    hide_field(prod, "form-patlasv4-proto-cat-produto-cfg-usa-peso")
    prod["fieldVisibilityRules"] = [
        r
        for r in (prod.get("fieldVisibilityRules") or [])
        if r.get("id") not in {"rule-prod-hide-cx-se-nao-usa", "rule-prod-hide-peso-se-nao-usa"}
    ]
    for preset in prod.get("exampleValuePresets") or []:
        fv = preset.setdefault("fieldValues", {})
        if fv.get("form-patlasv4-proto-cat-produto-categoria") in {
            "Soluções SaaS",
            "Treinamento e Capacitação",
            "Consultoria em Processos",
        }:
            fv["form-patlasv4-proto-cat-produto-categoria"] = "Automação e Processos"
        if not fv.get("form-patlasv4-proto-cat-produto-grupo"):
            fv["form-patlasv4-proto-cat-produto-grupo"] = (
                "Infraestrutura"
                if "HOST" in str(fv.get("form-patlasv4-proto-cat-produto-parceria") or "")
                else "Análise e Modelagem de Processos"
            )
        if fv.get("form-patlasv4-proto-cat-produto-tipo") == "Serviço" and not fv.get(
            "form-patlasv4-proto-cat-produto-categoria"
        ):
            fv["form-patlasv4-proto-cat-produto-categoria"] = (
                "Nuvem" if "HOST" in str(fv.get("form-patlasv4-proto-cat-produto-parceria") or "") else "Automação e Processos"
            )
        # Sem mistura: Simplifica (universal) não tem item individualizado.
        if fv.get("form-patlasv4-proto-cat-produto-catalogo") == "Catálogo MTI Simplifica":
            fv["form-patlasv4-proto-cat-produto-tipo-oferta"] = "Universal"

    # --- Dados de parceria ---
    dp = fget(forms, "form-patlasv4-proto-cat-dados-parceria")
    dp["metadata"] = (
        "Validação 17/08: Período mínimo (12/24/36/48/60) obrigatório, vem no CSV. "
        "Custo informado à MTI à parte (não no CSV do parceiro). Markup da MTI gera % automaticamente (RO). "
        "Perpétuo não entra neste campo."
    )
    alerta = field(dp, "form-patlasv4-proto-cat-dados-parceria-alerta-proposta")
    alerta["alertTitle"] = "Dados comerciais do produto na parceria"
    alerta["alertVariant"] = "info"
    alerta["alertMessage"] = (
        "Parceiro envia o custo à MTI à parte — não vai no CSV. A MTI aplica o markup "
        "(ex.: 1,10 a 1,50) e o sistema gera % parceiro e % MTI (somente leitura). "
        "Fórmula exata ainda pendente da MTI."
    )
    vig = field(dp, "form-patlasv4-proto-cat-dados-parceria-vigencia")
    vig["hidden"] = True
    vig["required"] = False
    vig["spec"] = "Substituído por Período mínimo (17/08). Não exibir."
    per = field(dp, "form-patlasv4-proto-cat-dados-parceria-periodo-minimo")
    per["required"] = True
    per["label"] = "Período mínimo"
    per["options"] = ["12 meses", "24 meses", "36 meses", "48 meses", "60 meses"]
    per["spec"] = (
        "Obrigatório. Substitui vigência. Governa apostilamento, reajuste e vigência; "
        "justifica o preço (36 < 24 < 12). Vem no CSV. Sem Perpétuo (isso é modelo de venda / cobrança Única)."
    )
    if per.get("sectionId") is None:
        per["sectionId"] = "sec-cat-dp-info"
    field(dp, "form-patlasv4-proto-cat-dados-parceria-custo-parceiro")["spec"] = (
        "Custo de entrada informado pelo parceiro à MTI à parte — não trafega no CSV do parceiro. "
        "No contrato, só a MTI vê."
    )
    mk = field(dp, "form-patlasv4-proto-cat-dados-parceria-markup")
    mk["spec"] = (
        "Markup aplicado pela MTI (ex.: 1,10 / 1,18 / 1,23 / 1,25 / 1,40 / 1,50). "
        "Ao informar, gera automaticamente % parceiro e % MTI. Fórmula exata pendente."
    )
    dpar = field(dp, "form-patlasv4-proto-cat-dados-parceria-dist-parceiro")
    dpar["readOnly"] = True
    dpar["spec"] = "Somente leitura. Calculado a partir do markup (fórmula pendente da MTI)."
    dmti = field(dp, "form-patlasv4-proto-cat-dados-parceria-dist-mti")
    dmti["readOnly"] = True
    dmti["spec"] = "Somente leitura. Calculado a partir do markup (fórmula pendente da MTI)."
    for preset in dp.get("exampleValuePresets") or []:
        fv = preset.setdefault("fieldValues", {})
        vig_val = fv.pop("form-patlasv4-proto-cat-dados-parceria-vigencia", None)
        if "form-patlasv4-proto-cat-dados-parceria-periodo-minimo" not in fv:
            mapped = {
                "12 Meses": "12 meses",
                "24 Meses": "24 meses",
                "36 Meses": "36 meses",
                "48 Meses": "48 meses",
            }.get(str(vig_val or ""), "12 meses")
            fv["form-patlasv4-proto-cat-dados-parceria-periodo-minimo"] = mapped

    # --- Visão planilha ---
    vis = fget(forms, "form-patlasv4-proto-metodo-cat-visao-planilha")
    vis["metadata"] = (
        "Luís 17/08: tabelão concatenando Parceiro → Parceria → Catálogo → Produto → "
        "modelo, cobrança, métrica, valor, custo, markup e %."
    )
    field(vis, "patlasv4proto-mcat-grade-alerta")["alertMessage"] = (
        "Visão concatenada (como planilha/CSV): Parceiro, Parceria, Catálogo, Produto e demais colunas, "
        "incluindo custo, markup e distribuição. Filtre e exporte CSV."
    )
    try:
        field(vis, "patlasv4proto-mcat-grade-filtro-categoria")["label"] = "Filtro — Vertical"
        field(vis, "patlasv4proto-mcat-grade-filtro-categoria")["spec"] = (
            "Filtra por Vertical de Serviço de TI."
        )
    except KeyError:
        pass
    grade = field(vis, "patlasv4proto-mcat-grade-produtos")
    grade["type"] = "embeddedReference"
    grade["linkedFormId"] = "form-patlasv4-proto-cat-visao-planilha-linha"
    grade["embeddedDisplay"] = "table"
    grade["spec"] = (
        "Grade com a cadeia completa, incluindo custo, markup e % (pedido de Luís 17/08). "
        "Espelha o CSV de alimentação."
    )
    grade.pop("options", None)

    linha_form = {
        "id": "form-patlasv4-proto-cat-visao-planilha-linha",
        "name": "Linha da visão planilha",
        "sectionLayout": "none",
        "defaultCanvasMode": "read",
        "metadata": "Colunas concatenadas da visão tabular / CSV. 17/08.",
        "fields": [
            {"id": "vpl-parceiro", "label": "Parceiro", "type": "text", "size": "medium", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
            {"id": "vpl-parceria", "label": "Parceria", "type": "text", "size": "medium", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
            {"id": "vpl-catalogo", "label": "Catálogo", "type": "text", "size": "medium", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
            {"id": "vpl-produto", "label": "Produto", "type": "text", "size": "medium", "readOnly": True, "required": True, "multiple": False, "relevance": "identity"},
            {"id": "vpl-modelo", "label": "Modelo de venda", "type": "text", "size": "small", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
            {"id": "vpl-cobranca", "label": "Tipo de cobrança", "type": "text", "size": "small", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
            {"id": "vpl-metrica", "label": "Métrica", "type": "text", "size": "small", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
            {"id": "vpl-valor", "label": "Valor unitário", "type": "number", "size": "small", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
            {"id": "vpl-periodo", "label": "Período mínimo", "type": "text", "size": "small", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
            {"id": "vpl-custo", "label": "Custo do parceiro", "type": "number", "size": "small", "readOnly": True, "required": False, "multiple": False, "relevance": "common", "spec": "Preenchido pela MTI; vazio no CSV do parceiro."},
            {"id": "vpl-markup", "label": "Markup", "type": "number", "size": "small", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
            {"id": "vpl-pct-parc", "label": "% parceiro", "type": "number", "size": "small", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
            {"id": "vpl-pct-mti", "label": "% MTI", "type": "number", "size": "small", "readOnly": True, "required": False, "multiple": False, "relevance": "common"},
        ],
    }
    if not any(x.get("id") == linha_form["id"] for x in forms):
        forms.append(linha_form)

    vis["exampleValuePresets"] = [
        {
            "id": "patlasv4proto-p-mcat-grade-exemplo",
            "name": "SIMPLIFICA — tabelão com custo/markup/%",
            "fieldValues": {
                "patlasv4proto-mcat-grade-filtro-tipo": "Serviço",
                "patlasv4proto-mcat-grade-filtro-complexidade": "Alta",
                "patlasv4proto-mcat-grade-filtro-grupo": "Análise e Modelagem de Processos",
                "patlasv4proto-mcat-grade-filtro-categoria": "Automação e Processos",
                "patlasv4proto-mcat-grade-selecionados": "2 linhas",
            },
            "embeddedRowsByFieldId": {
                "patlasv4proto-mcat-grade-produtos": [
                    {
                        "vpl-parceiro": "EloGroup",
                        "vpl-parceria": "MTI SIMPLIFICA",
                        "vpl-catalogo": "Catálogo MTI Simplifica",
                        "vpl-produto": "Elaborar plano de projeto",
                        "vpl-modelo": "Por serviço",
                        "vpl-cobranca": "Mensal",
                        "vpl-metrica": "UST",
                        "vpl-valor": 15000,
                        "vpl-periodo": "12 meses",
                        "vpl-custo": 120,
                        "vpl-markup": 1.34,
                        "vpl-pct-parc": 80,
                        "vpl-pct-mti": 20,
                    },
                    {
                        "vpl-parceiro": "EloGroup",
                        "vpl-parceria": "MTI SIMPLIFICA",
                        "vpl-catalogo": "Catálogo MTI Simplifica",
                        "vpl-produto": "Implantação MTI Simplifica",
                        "vpl-modelo": "Por serviço",
                        "vpl-cobranca": "Conforme homologação",
                        "vpl-metrica": "UST",
                        "vpl-valor": 25000,
                        "vpl-periodo": "12 meses",
                        "vpl-custo": 18000,
                        "vpl-markup": 1.25,
                        "vpl-pct-parc": 80,
                        "vpl-pct-mti": 20,
                    },
                ]
            },
        }
    ]

    # --- Portal parceiro ---
    ppc = fget(forms, "form-patlasv4-proto-portal-parceiro-catalogo")
    ppc["metadata"] = (
        "Portal do Parceiro (17/08): o parceiro monta o catálogo (rascunho) e os produtos, "
        "cadastra grupos da parceria, importa CSV (sem custo/%) e envia à MTI. "
        "Não homologa, não publica e não apostila."
    )
    field(ppc, "patlasv4proto-ppc-alerta")["alertTitle"] = "Portal do Parceiro — catálogo e produtos"
    field(ppc, "patlasv4proto-ppc-alerta")["alertMessage"] = (
        "Você monta o catálogo (rascunho) e os produtos da sua parceria, pode cadastrar grupos e "
        "importar CSV. Ao enviar, a MTI analisa (ajuste / homologar / reprovar). "
        "Você não publica e não apostila. Custo e markup não vão no CSV — a MTI complementa."
    )
    if not any(s.get("id") == "sec-ppc-grupos" for s in ppc.get("sections") or []):
        secs = ppc["sections"]
        idx = next((i for i, s in enumerate(secs) if s.get("id") == "sec-ppc-produtos"), 2)
        secs.insert(idx, {"id": "sec-ppc-grupos", "title": "Grupos da parceria", "icon": "account_tree"})
    if not any(x.get("id") == "patlasv4proto-ppc-grupos" for x in ppc["fields"]):
        insert_after(
            ppc,
            "patlasv4proto-ppc-produtos",
            {
                "id": "patlasv4proto-ppc-grupos",
                "label": "Grupos",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-ppc-grupos",
                "linkedFormId": "form-patlasv4-proto-cat-grupo",
                "embeddedDisplay": "table",
                "spec": "Parceiro cadastra grupos da própria parceria (também via CSV). Obrigatório no produto.",
            },
        )
    meths = ppc.setdefault("methods", [])
    if not any(m.get("id") == "patlasv4proto-ppc-meth-grupo" for m in meths):
        meths.insert(
            1,
            {
                "id": "patlasv4proto-ppc-meth-grupo",
                "name": "Cadastrar grupo",
                "icon": "create_new_folder",
                "kind": "comum",
                "spec": "Abre cadastro de Grupo da parceria logada.",
            },
        )
    for preset in ppc.get("exampleValuePresets") or []:
        emb = preset.setdefault("embeddedRowsByFieldId", {})
        if "patlasv4proto-ppc-grupos" not in emb:
            emb["patlasv4proto-ppc-grupos"] = [
                {
                    "form-patlasv4-proto-cat-grupo-identificador": "Análise e Modelagem de Processos",
                    "form-patlasv4-proto-cat-grupo-parceria": preset.get("fieldValues", {}).get(
                        "patlasv4proto-ppc-parceria", "MTI SIMPLIFICA"
                    ),
                    "form-patlasv4-proto-cat-grupo-ativo": True,
                }
            ]

    # --- CSV do parceiro ---
    csvf = fget(forms, "form-patlasv4-proto-metodo-cat-import-csv")
    csvf["metadata"] = (
        "Validação 17/08: CSV do parceiro traz produtos, grupos e período mínimo. "
        "Não traz custo, markup nem %. Esses dados a MTI complementa no backoffice."
    )
    field(csvf, "patlasv4proto-mcat-csv-alerta")["alertMessage"] = (
        "Baixe o template, preencha e reenvie. O CSV do parceiro inclui produtos, grupos e período mínimo. "
        "Não inclui custo, markup nem % de distribuição — a MTI preenche isso no backoffice. "
        "Linhas inválidas são rejeitadas com mensagem."
    )
    field(csvf, "patlasv4proto-mcat-csv-arquivo")["spec"] = (
        "UTF-8 no template Atlas. Colunas de produto/grupo/período mínimo. "
        "Sem custo, markup ou %. Obrigatório validar encoding e colunas antes de gravar."
    )

    # --- Parceria: MTI cria o acordo; parceiro monta o catálogo ---
    parc = fget(forms, "form-patlasv4-proto-cat-parceria")
    parc["metadata"] = (
        "Validação 17/08: MTI cria a Parceria (salvar gera o casulo/rascunho de catálogo). "
        "O parceiro monta o catálogo e os produtos no portal. Homologar ≠ publicar ≠ cliente ver."
    )
    alerta_p = field(parc, "form-patlasv4-proto-cat-parceria-alerta-visao")
    alerta_p["alertTitle"] = "Parceria cria o casulo; o parceiro monta o catálogo"
    alerta_p["alertMessage"] = (
        "Ao salvar a parceria, o sistema abre um rascunho de catálogo por solução. "
        "Quem preenche catálogo e produtos é o parceiro no portal (tela ou CSV). "
        "Esta seção só consulta os catálogos/produtos já montados — não é um segundo catálogo."
    )
    field(parc, "form-patlasv4-proto-cat-parceria-catalogos")["spec"] = (
        "Catálogos N2 desta parceria. Casulo criado ao salvar a parceria; conteúdo montado pelo parceiro no portal."
    )

    # --- Workspace ---
    for ws in workspaces:
        for pkg in ws.get("packages") or []:
            for cls in pkg.get("classes") or []:
                if cls.get("id") == "cls-mapa-categoria":
                    cls["name"] = "Vertical de Serviço de TI"
                    cls["linkedFormExamplePresetIds"] = [
                        "p-vert-dados-ia",
                        "p-vert-automacao",
                        "p-vert-ciber",
                        "p-vert-nuvem",
                        "p-vert-ident-gov",
                    ]
                if cls.get("id") == "cls-mapa-grupo-cat":
                    cls["linkedFormExamplePresetIds"] = [
                        "p-grp-analise",
                        "p-grp-automacao",
                        "p-grp-dados",
                        "p-grp-host",
                        "p-grp-todos",
                    ]
                if cls.get("id") == "cls-mapa-tipo-cobranca":
                    ids = list(cls.get("linkedFormExamplePresetIds") or [])
                    if "p-tc-unico" not in ids:
                        ids.append("p-tc-unico")
                    cls["linkedFormExamplePresetIds"] = ids
                if cls.get("id") == "cls-mapa-modelo-venda":
                    ids = list(cls.get("linkedFormExamplePresetIds") or [])
                    for extra in ("p-mv-perpetuo", "p-mv-ust"):
                        if extra not in ids:
                            ids.append(extra)
                    cls["linkedFormExamplePresetIds"] = ids

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    WS.write_text(json.dumps(workspaces, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print("OK forms", FORMS.stat().st_size, "ws", WS.stat().st_size, "nforms", len(forms))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
