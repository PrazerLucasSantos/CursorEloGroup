# -*- coding: utf-8 -*-
"""Aplica especificação Projeto Atlas Fase 2 (.pm) nas classes de catálogo/produto."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS_PATH = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"


def field(
    fid: str,
    label: str,
    typ: str,
    *,
    required: bool = False,
    relevance: str = "common",
    size: str = "medium",
    section: str | None = None,
    read_only: bool = False,
    hidden: bool = False,
    multiple: bool = False,
    options: list | None = None,
    linked: str | None = None,
    spec: str = "",
    text_long: bool = False,
    embedded_display: str | None = None,
):
    f: dict = {
        "id": fid,
        "label": label,
        "type": typ,
        "size": size,
        "readOnly": read_only,
        "required": required,
        "multiple": multiple,
        "relevance": relevance,
        "spec": spec,
    }
    if section:
        f["sectionId"] = section
    if hidden:
        f["hidden"] = True
    if options is not None:
        f["options"] = options
    if linked:
        f["linkedFormId"] = linked
    if text_long:
        f["textLong"] = True
    if embedded_display:
        f["embeddedDisplay"] = embedded_display
    return f


def vis_rule(rid: str, source: str, op: str, expected, action: str, targets: list[str], **extra):
    r = {
        "id": rid,
        "operator": op,
        "sourceFieldId": source,
        "action": action,
        "targetFieldIds": targets,
    }
    if op == "eq":
        if isinstance(expected, bool):
            r["expectedBoolean"] = expected
        else:
            r["expectedOptionText"] = expected
    r.update(extra)
    return r


def replace_form(forms: list, form_id: str, new_form: dict) -> None:
    for i, f in enumerate(forms):
        if f.get("id") == form_id:
            # preserve methods if new_form omits and old has
            if "methods" not in new_form and f.get("methods"):
                new_form["methods"] = f["methods"]
            forms[i] = new_form
            return
    forms.append(new_form)


def upsert_after(forms: list, after_id: str, new_form: dict) -> None:
    existing = next((i for i, f in enumerate(forms) if f.get("id") == new_form["id"]), None)
    if existing is not None:
        forms[existing] = new_form
        return
    for i, f in enumerate(forms):
        if f.get("id") == after_id:
            forms.insert(i + 1, new_form)
            return
    forms.append(new_form)


def main() -> None:
    forms = json.loads(FORMS_PATH.read_text(encoding="utf-8"))

    # ---- Tipo de cobrança (PM §5 — sem código interno no formulário de negócio) ----
    replace_form(
        forms,
        "form-patlasv4-proto-cat-tipo-cobranca",
        {
            "id": "form-patlasv4-proto-cat-tipo-cobranca",
            "name": "Tipo de Cobrança",
            "sectionLayout": "tabs",
            "defaultCanvasMode": "edit",
            "metadata": "PM Atlas Fase 2 §5. Mensal · Anual · Conforme homologação. Sob demanda NÃO é tipo de cobrança (consumo por OS no Produto).",
            "sections": [{"id": "sec-cat-tc-info", "title": "Informações", "icon": "info"}],
            "fields": [
                field(
                    "form-patlasv4-proto-cat-tipo-cobranca-nome",
                    "Nome",
                    "text",
                    required=True,
                    relevance="identity",
                    section="sec-cat-tc-info",
                    spec="Nome controlado e único. Valores confirmados: Mensal · Anual · Conforme homologação.",
                ),
                field(
                    "form-patlasv4-proto-cat-tipo-cobranca-descricao",
                    "Descrição",
                    "text",
                    size="large",
                    text_long=True,
                    section="sec-cat-tc-info",
                    spec="Explica quando a cobrança ocorre, sem criar nova modalidade.",
                ),
                field(
                    "form-patlasv4-proto-cat-tipo-cobranca-ativo",
                    "Ativo",
                    "boolean",
                    required=True,
                    size="small",
                    section="sec-cat-tc-info",
                    spec="Padrão Sim. Desativação lógica — não altera produtos históricos.",
                ),
            ],
            "exampleValuePresets": [
                {
                    "id": "p-tc-mensal",
                    "name": "Mensal",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-tipo-cobranca-nome": "Mensal",
                        "form-patlasv4-proto-cat-tipo-cobranca-descricao": "Cobrança mensalizada do produto.",
                        "form-patlasv4-proto-cat-tipo-cobranca-ativo": True,
                    },
                },
                {
                    "id": "p-tc-anual",
                    "name": "Anual",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-tipo-cobranca-nome": "Anual",
                        "form-patlasv4-proto-cat-tipo-cobranca-descricao": "Cobrança anual do produto.",
                        "form-patlasv4-proto-cat-tipo-cobranca-ativo": True,
                    },
                },
                {
                    "id": "p-tc-homolog",
                    "name": "Conforme homologação",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-tipo-cobranca-nome": "Conforme homologação",
                        "form-patlasv4-proto-cat-tipo-cobranca-descricao": "Cobra quando houver homologação da entrega/serviço.",
                        "form-patlasv4-proto-cat-tipo-cobranca-ativo": True,
                    },
                },
            ],
            "activeExamplePresetId": "p-tc-mensal",
        },
    )

    # ---- Solução (PM §6) ----
    replace_form(
        forms,
        "form-patlasv4-proto-cat-solucao",
        {
            "id": "form-patlasv4-proto-cat-solucao",
            "name": "Solução",
            "sectionLayout": "tabs",
            "defaultCanvasMode": "edit",
            "metadata": "PM Atlas Fase 2 §6. Oferta macro da parceria. Observação genérica retirada; fabricante/anexos não obrigatórios.",
            "sections": [{"id": "sec-cat-sol-info", "title": "Informações", "icon": "info"}],
            "fields": [
                field(
                    "form-patlasv4-proto-cat-solucao-identificador",
                    "Nome",
                    "text",
                    required=True,
                    relevance="identity",
                    section="sec-cat-sol-info",
                    spec="Nome comercial da solução; único dentro da parceria. Ex.: MTI Simplifica, MTI Cloud.",
                ),
                field(
                    "form-patlasv4-proto-cat-solucao-parceria",
                    "Parceria",
                    "reference",
                    required=True,
                    section="sec-cat-sol-info",
                    linked="form-patlasv4-proto-cat-parceria",
                    options=["MTI SIMPLIFICA", "MTI HOST"],
                    spec="Somente parceria aprovada/habilitada. Não alterar após haver Catálogo/Produto vinculado.",
                ),
                field(
                    "form-patlasv4-proto-cat-solucao-descricao",
                    "Descrição",
                    "text",
                    size="large",
                    text_long=True,
                    section="sec-cat-sol-info",
                    spec="Escopo funcional e comercial da solução.",
                ),
                field(
                    "form-patlasv4-proto-cat-solucao-ativo",
                    "Ativo",
                    "boolean",
                    required=True,
                    size="small",
                    section="sec-cat-sol-info",
                    spec="Padrão Sim. Desativação lógica.",
                ),
                # legado oculto
                field(
                    "form-patlasv4-proto-cat-solucao-observacoes",
                    "Observações (histórico)",
                    "text",
                    size="large",
                    text_long=True,
                    section="sec-cat-sol-info",
                    hidden=True,
                    read_only=True,
                    spec="Legado — conteúdo migrado para Descrição. Somente leitura histórica.",
                ),
                field(
                    "form-patlasv4-proto-cat-solucao-fabricante-nome",
                    "Fabricante — nome",
                    "text",
                    section="sec-cat-sol-info",
                    hidden=True,
                    spec="Não confirmado na validação — oculto.",
                ),
                field(
                    "form-patlasv4-proto-cat-solucao-fabricante-contato",
                    "Fabricante — contato",
                    "text",
                    section="sec-cat-sol-info",
                    hidden=True,
                    spec="Não confirmado — oculto.",
                ),
                field(
                    "form-patlasv4-proto-cat-solucao-documentos-apoio",
                    "Documentos de apoio",
                    "file",
                    section="sec-cat-sol-info",
                    hidden=True,
                    spec="Não obrigatório / não confirmado — oculto no formulário principal.",
                ),
            ],
            "exampleValuePresets": [
                {
                    "id": "p-sol-simplifica",
                    "name": "MTI Simplifica",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-solucao-identificador": "MTI Simplifica",
                        "form-patlasv4-proto-cat-solucao-parceria": "MTI SIMPLIFICA",
                        "form-patlasv4-proto-cat-solucao-descricao": "Solução SaaS de simplificação e desburocratização de processos.",
                        "form-patlasv4-proto-cat-solucao-ativo": True,
                    },
                },
                {
                    "id": "p-sol-host",
                    "name": "MTI Host",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-solucao-identificador": "MTI Host",
                        "form-patlasv4-proto-cat-solucao-parceria": "MTI HOST",
                        "form-patlasv4-proto-cat-solucao-descricao": "Infraestrutura de TI gerenciada como serviço (IAaaS).",
                        "form-patlasv4-proto-cat-solucao-ativo": True,
                    },
                },
            ],
            "activeExamplePresetId": "p-sol-simplifica",
        },
    )

    # ---- Modelo de venda (PM §7) ----
    replace_form(
        forms,
        "form-patlasv4-proto-cat-modelo-venda",
        {
            "id": "form-patlasv4-proto-cat-modelo-venda",
            "name": "Modelo de Venda",
            "sectionLayout": "tabs",
            "defaultCanvasMode": "edit",
            "metadata": "PM Atlas Fase 2 §7. Por licença · Por serviço · Por pacote. On-premise/Perpétuo/Subscrição = PENDENTE (não incluir).",
            "sections": [{"id": "sec-cat-mv-info", "title": "Informações", "icon": "info"}],
            "fields": [
                field(
                    "form-patlasv4-proto-cat-modelo-venda-identificador",
                    "Nome",
                    "text",
                    required=True,
                    relevance="identity",
                    section="sec-cat-mv-info",
                    spec="Nome único. Confirmados: Por licença · Por serviço · Por pacote.",
                ),
                field(
                    "form-patlasv4-proto-cat-modelo-venda-descricao",
                    "Descrição",
                    "text",
                    size="large",
                    text_long=True,
                    section="sec-cat-mv-info",
                    spec="Explicação objetiva do empacotamento comercial.",
                ),
                field(
                    "form-patlasv4-proto-cat-modelo-venda-ativo",
                    "Ativo",
                    "boolean",
                    required=True,
                    size="small",
                    section="sec-cat-mv-info",
                    spec="Padrão Sim. Consumo/Unitário/Por homologação não são modelos ativos.",
                ),
            ],
            "exampleValuePresets": [
                {
                    "id": "p-mv-lic",
                    "name": "Por licença",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-modelo-venda-identificador": "Por licença",
                        "form-patlasv4-proto-cat-modelo-venda-descricao": "Empacotamento comercial de produto tipo Licença.",
                        "form-patlasv4-proto-cat-modelo-venda-ativo": True,
                    },
                },
                {
                    "id": "p-mv-serv",
                    "name": "Por serviço",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-modelo-venda-identificador": "Por serviço",
                        "form-patlasv4-proto-cat-modelo-venda-descricao": "Empacotamento comercial de produto tipo Serviço.",
                        "form-patlasv4-proto-cat-modelo-venda-ativo": True,
                    },
                },
                {
                    "id": "p-mv-pac",
                    "name": "Por pacote",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-modelo-venda-identificador": "Por pacote",
                        "form-patlasv4-proto-cat-modelo-venda-descricao": "Composição em pacote (Licença ou Serviço).",
                        "form-patlasv4-proto-cat-modelo-venda-ativo": True,
                    },
                },
            ],
            "activeExamplePresetId": "p-mv-serv",
        },
    )

    # ---- Métrica (PM §8) ----
    replace_form(
        forms,
        "form-patlasv4-proto-cat-metrica",
        {
            "id": "form-patlasv4-proto-cat-metrica",
            "name": "Métrica",
            "sectionLayout": "tabs",
            "defaultCanvasMode": "edit",
            "metadata": "PM Atlas Fase 2 §8. Sem valor, quantidade, fator, complexidade nesta classe. Siglas oficiais a validar na planilha-dicionário.",
            "sections": [{"id": "sec-cat-met-info", "title": "Informações", "icon": "info"}],
            "fields": [
                field(
                    "form-patlasv4-proto-cat-metrica-identificador",
                    "Nome",
                    "text",
                    required=True,
                    relevance="identity",
                    section="sec-cat-met-info",
                    spec="Sigla ou nome oficial da métrica. Não inferir significados automaticamente.",
                ),
                field(
                    "form-patlasv4-proto-cat-metrica-descricao",
                    "Descrição",
                    "text",
                    size="large",
                    text_long=True,
                    section="sec-cat-met-info",
                    spec="Nome por extenso e regra conceitual, quando fornecidos pelo dicionário oficial.",
                ),
                field(
                    "form-patlasv4-proto-cat-metrica-ativo",
                    "Ativo",
                    "boolean",
                    required=True,
                    size="small",
                    section="sec-cat-met-info",
                    spec="Padrão Sim.",
                ),
            ],
            "exampleValuePresets": [
                {
                    "id": "p-metrica-usn",
                    "name": "USN",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-metrica-identificador": "USN",
                        "form-patlasv4-proto-cat-metrica-descricao": "Unidade de Software/Nuvem (licenciamento/IaaS) — sigla sujeita a dicionário oficial.",
                        "form-patlasv4-proto-cat-metrica-ativo": True,
                    },
                },
                {
                    "id": "p-metrica-ust",
                    "name": "UST",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-metrica-identificador": "UST",
                        "form-patlasv4-proto-cat-metrica-descricao": "Unidade de Serviço Técnico.",
                        "form-patlasv4-proto-cat-metrica-ativo": True,
                    },
                },
                {
                    "id": "p-metrica-hst",
                    "name": "HST",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-metrica-identificador": "HST",
                        "form-patlasv4-proto-cat-metrica-descricao": "Hora de Serviço Técnico.",
                        "form-patlasv4-proto-cat-metrica-ativo": True,
                    },
                },
            ],
            "activeExamplePresetId": "p-metrica-ust",
        },
    )

    # ---- Grupo (PM §9) ----
    replace_form(
        forms,
        "form-patlasv4-proto-cat-grupo",
        {
            "id": "form-patlasv4-proto-cat-grupo",
            "name": "Grupo",
            "sectionLayout": "tabs",
            "defaultCanvasMode": "edit",
            "metadata": "PM Atlas Fase 2 §9. Família específica dentro da Solução. Não repetir nome da solução/parceria no Nome.",
            "sections": [{"id": "sec-cat-grp-info", "title": "Informações", "icon": "info"}],
            "fields": [
                field(
                    "form-patlasv4-proto-cat-grupo-identificador",
                    "Nome",
                    "text",
                    required=True,
                    relevance="identity",
                    section="sec-cat-grp-info",
                    spec="Nome curto da família. Ex.: Análise e Modelagem de Processos.",
                ),
                field(
                    "form-patlasv4-proto-cat-grupo-solucao",
                    "Solução",
                    "reference",
                    required=True,
                    section="sec-cat-grp-info",
                    linked="form-patlasv4-proto-cat-solucao",
                    options=["MTI Simplifica", "MTI Host"],
                    spec="Solução ativa que governa o Grupo. Combinação solução+nome única.",
                ),
                field(
                    "form-patlasv4-proto-cat-grupo-categoria",
                    "Categoria de serviços",
                    "reference",
                    section="sec-cat-grp-info",
                    linked="form-patlasv4-proto-cat-categoria",
                    options=["Treinamento e Capacitação", "Consultoria em Processos", "Soluções SaaS"],
                    spec="Opcional até fechamento formal da taxonomia (PENDENTE).",
                ),
                field(
                    "form-patlasv4-proto-cat-grupo-descricao",
                    "Descrição",
                    "text",
                    size="large",
                    text_long=True,
                    section="sec-cat-grp-info",
                    spec="Explica o recorte do Grupo.",
                ),
                field(
                    "form-patlasv4-proto-cat-grupo-ativo",
                    "Ativo",
                    "boolean",
                    required=True,
                    size="small",
                    section="sec-cat-grp-info",
                    spec="Padrão Sim.",
                ),
            ],
            "exampleValuePresets": [
                {
                    "id": "p-grp-analise",
                    "name": "Análise e Modelagem",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-grupo-identificador": "Análise e Modelagem de Processos",
                        "form-patlasv4-proto-cat-grupo-solucao": "MTI Simplifica",
                        "form-patlasv4-proto-cat-grupo-categoria": "Consultoria em Processos",
                        "form-patlasv4-proto-cat-grupo-descricao": "Família de serviços de análise e modelagem.",
                        "form-patlasv4-proto-cat-grupo-ativo": True,
                    },
                }
            ],
            "activeExamplePresetId": "p-grp-analise",
        },
    )

    # ---- Categoria de serviços (PM §10) ----
    replace_form(
        forms,
        "form-patlasv4-proto-cat-categoria",
        {
            "id": "form-patlasv4-proto-cat-categoria",
            "name": "Categoria de Serviços",
            "sectionLayout": "tabs",
            "defaultCanvasMode": "edit",
            "metadata": "PM Atlas Fase 2 §10. Nome curto/reutilizável. Não prefixar com parceria/solução.",
            "sections": [{"id": "sec-cat-catg-info", "title": "Informações", "icon": "info"}],
            "fields": [
                field(
                    "form-patlasv4-proto-cat-categoria-identificador",
                    "Nome",
                    "text",
                    required=True,
                    relevance="identity",
                    section="sec-cat-catg-info",
                    spec="Nome curto. Ex.: Treinamento e Capacitação (não caixa alta integral).",
                ),
                field(
                    "form-patlasv4-proto-cat-categoria-descricao",
                    "Descrição",
                    "text",
                    size="large",
                    text_long=True,
                    section="sec-cat-catg-info",
                    spec="Texto detalhado que delimita o conteúdo da categoria.",
                ),
                field(
                    "form-patlasv4-proto-cat-categoria-ativo",
                    "Ativo",
                    "boolean",
                    required=True,
                    size="small",
                    section="sec-cat-catg-info",
                    spec="Padrão Sim.",
                ),
            ],
            "exampleValuePresets": [
                {
                    "id": "p-catg-trein",
                    "name": "Treinamento e Capacitação",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-categoria-identificador": "Treinamento e Capacitação",
                        "form-patlasv4-proto-cat-categoria-descricao": "Serviços de treinamento e capacitação em desenvolvimento seguro de aplicações.",
                        "form-patlasv4-proto-cat-categoria-ativo": True,
                    },
                },
                {
                    "id": "p-catg-saas",
                    "name": "Soluções SaaS",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-categoria-identificador": "Soluções SaaS",
                        "form-patlasv4-proto-cat-categoria-descricao": "Serviços de solução SaaS de simplificação e desburocratização de processos.",
                        "form-patlasv4-proto-cat-categoria-ativo": True,
                    },
                },
            ],
            "activeExamplePresetId": "p-catg-saas",
        },
    )

    # ---- CatalogoMetrica / CatalogoComplexidade (PM §13) ----
    form_cat_met = {
        "id": "form-patlasv4-proto-cat-catalogo-metrica",
        "name": "Métrica do catálogo",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": "PM §13.2 CatalogoMetrica — linha da coleção no Catálogo N2.",
        "fields": [
            field(
                "form-patlasv4-proto-cat-cmet-metrica",
                "Métrica",
                "reference",
                required=True,
                relevance="identity",
                linked="form-patlasv4-proto-cat-metrica",
                options=["USN", "UST", "HST"],
                spec="Métrica ativa; não duplicar na mesma versão.",
            ),
            field(
                "form-patlasv4-proto-cat-cmet-valor",
                "Valor unitário da métrica",
                "number",
                required=True,
                spec="Valor da métrica no Catálogo (> 0 para publicar). Não é preço do Produto.",
            ),
            field(
                "form-patlasv4-proto-cat-cmet-exige-qtde",
                "Exige quantidade por execução?",
                "boolean",
                required=True,
                size="small",
                spec="Governa o campo correspondente no Produto tipo Serviço.",
            ),
            field(
                "form-patlasv4-proto-cat-cmet-ativo",
                "Ativo nesta versão",
                "boolean",
                required=True,
                size="small",
                spec="Padrão Sim; faz parte do snapshot versionado.",
            ),
        ],
        "exampleValuePresets": [
            {
                "id": "p-cmet-ust",
                "name": "UST",
                "fieldValues": {
                    "form-patlasv4-proto-cat-cmet-metrica": "UST",
                    "form-patlasv4-proto-cat-cmet-valor": 161.02,
                    "form-patlasv4-proto-cat-cmet-exige-qtde": True,
                    "form-patlasv4-proto-cat-cmet-ativo": True,
                },
            }
        ],
        "activeExamplePresetId": "p-cmet-ust",
    }
    form_cat_cx = {
        "id": "form-patlasv4-proto-cat-catalogo-complexidade",
        "name": "Complexidade do catálogo",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": "PM §13.3 CatalogoComplexidade — faixa + coeficiente uniforme na versão.",
        "fields": [
            field(
                "form-patlasv4-proto-cat-ccx-faixa",
                "Faixa",
                "textOptions",
                required=True,
                relevance="identity",
                options=["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"],
                spec="Uma linha por faixa habilitada.",
            ),
            field(
                "form-patlasv4-proto-cat-ccx-coef",
                "Coeficiente",
                "number",
                required=True,
                spec="Decimal positivo; uniforme para todos os Produtos da faixa nesta versão.",
            ),
            field(
                "form-patlasv4-proto-cat-ccx-ativa",
                "Ativa",
                "boolean",
                required=True,
                size="small",
                spec="Somente faixas ativas aparecem no Produto.",
            ),
        ],
        "exampleValuePresets": [
            {
                "id": "p-ccx-media",
                "name": "Média",
                "fieldValues": {
                    "form-patlasv4-proto-cat-ccx-faixa": "Média",
                    "form-patlasv4-proto-cat-ccx-coef": 1.0,
                    "form-patlasv4-proto-cat-ccx-ativa": True,
                },
            }
        ],
        "activeExamplePresetId": "p-ccx-media",
    }
    # ---- Catálogo (PM §11) — rebuild fields, keep methods ----
    old_cat = next(f for f in forms if f["id"] == "form-patlasv4-proto-cat-catalogo")
    cat_methods = old_cat.get("methods", [])
    replace_form(
        forms,
        "form-patlasv4-proto-cat-catalogo",
        {
            "id": "form-patlasv4-proto-cat-catalogo",
            "name": "Catálogo",
            "sectionLayout": "accordion",
            "defaultCanvasMode": "edit",
            "metadata": "PM Atlas Fase 2 §11 — Catálogo N2. Sem Preencher manualmente?; sem valor unitário genérico (usar Métricas permitidas); focais aqui.",
            "sections": [
                {"id": "sec-cat-ident", "title": "Identificação", "icon": "badge"},
                {"id": "sec-cat-props", "title": "Propriedades do catálogo", "icon": "tune"},
                {"id": "sec-cat-metricas", "title": "Métricas permitidas", "icon": "straighten"},
                {"id": "sec-cat-complex", "title": "Complexidades e coeficientes", "icon": "stacked_bar_chart"},
                {"id": "sec-cat-codigos", "title": "Códigos", "icon": "qr_code"},
                {"id": "sec-cat-resp", "title": "Responsáveis", "icon": "group"},
                {"id": "sec-cat-produtos", "title": "Produtos", "icon": "inventory_2"},
                {"id": "sec-cat-obs", "title": "Observações", "icon": "notes"},
            ],
            "fields": [
                field("form-patlasv4-proto-cat-catalogo-identificador", "Nome do catálogo", "text", required=True, relevance="identity", section="sec-cat-ident", spec="Nome comercial da família do catálogo."),
                field("form-patlasv4-proto-cat-catalogo-parceria", "Parceria", "reference", required=True, section="sec-cat-ident", linked="form-patlasv4-proto-cat-parceria", options=["MTI SIMPLIFICA", "MTI HOST"], spec="Somente parceria aprovada/habilitada; selecionar antes dos demais vínculos."),
                field("form-patlasv4-proto-cat-catalogo-solucao", "Solução", "reference", required=True, section="sec-cat-ident", linked="form-patlasv4-proto-cat-solucao", options=["MTI Simplifica", "MTI Host"], spec="Filtrada pela Parceria; Produtos herdam este contexto."),
                field("form-patlasv4-proto-cat-catalogo-descricao", "Descrição", "text", size="large", text_long=True, section="sec-cat-ident", spec="Escopo do catálogo."),
                field("form-patlasv4-proto-cat-catalogo-versao", "Versão", "text", required=True, section="sec-cat-ident", spec="Ex.: 9.4 — único na família. Obrigatório para publicar."),
                field("form-patlasv4-proto-cat-catalogo-versao-anterior", "Versão anterior", "text", read_only=True, section="sec-cat-ident", spec="Preenchida ao criar nova versão; vazia na primeira."),
                field("form-patlasv4-proto-cat-catalogo-vigencia-inicio", "Início de vigência", "date", section="sec-cat-ident", spec="Obrigatório para publicar."),
                field("form-patlasv4-proto-cat-catalogo-vigencia-fim", "Fim de vigência", "date", read_only=True, section="sec-cat-ident", spec="Preenchido quando a versão for substituída/encerrada."),
                field(
                    "form-patlasv4-proto-cat-catalogo-status",
                    "Status do catálogo",
                    "textOptions",
                    required=True,
                    read_only=True,
                    section="sec-cat-ident",
                    options=["Rascunho", "Em análise", "Ajuste solicitado", "Reprovado", "Aprovado", "Publicado", "Substituído"],
                    spec="Controlado pelo workflow; nunca digitado livremente.",
                ),
                field("form-patlasv4-proto-cat-catalogo-toggle-universal", "É universal?", "boolean", required=True, section="sec-cat-props", spec="Padrão Não. Independente de Catálogo de serviços."),
                field("form-patlasv4-proto-cat-catalogo-toggle-servicos", "É catálogo de serviços?", "boolean", required=True, section="sec-cat-props", spec="Padrão Não. Pode ser Sim junto com universal."),
                field(
                    "form-patlasv4-proto-cat-catalogo-estrutura-variacao",
                    "Estrutura de variação",
                    "textOptions",
                    section="sec-cat-props",
                    options=["Sem variação", "Por complexidade", "Por peso"],
                    spec="Obrigatório quando catálogo de serviços = Sim. Se serviços = Não → Sem variação.",
                ),
                field(
                    "form-patlasv4-proto-cat-catalogo-objeto-universal",
                    "Objeto universal vinculado",
                    "reference",
                    section="sec-cat-props",
                    linked="form-patlasv4-proto-cat-universal",
                    options=["Créditos TIC", "Créditos de Serviço"],
                    hidden=True,
                    spec="Exibir quando universal = Sim (N2 → N3).",
                ),
                field(
                    "form-patlasv4-proto-cat-catalogo-metricas",
                    "Métricas permitidas",
                    "embeddedReference",
                    multiple=True,
                    size="large",
                    section="sec-cat-metricas",
                    linked="form-patlasv4-proto-cat-catalogo-metrica",
                    embedded_display="table",
                    spec="Coleção CatalogoMetrica[]. Sem valor unitário genérico fora desta relação.",
                ),
                field(
                    "form-patlasv4-proto-cat-catalogo-complexidades",
                    "Complexidades e coeficientes",
                    "embeddedReference",
                    multiple=True,
                    size="large",
                    section="sec-cat-complex",
                    linked="form-patlasv4-proto-cat-catalogo-complexidade",
                    embedded_display="table",
                    hidden=True,
                    spec="Somente se estrutura = Por complexidade. Coeficiente uniforme por faixa.",
                ),
                field("form-patlasv4-proto-cat-catalogo-cod-siag-cat", "Código SIAG - Catálogo", "text", section="sec-cat-codigos", spec="Manual/importação nesta fase. Sem integração automática."),
                field("form-patlasv4-proto-cat-catalogo-cod-protheus-cat", "Código Protheus - Catálogo", "text", section="sec-cat-codigos", spec="Manual/importação nesta fase."),
                field("form-patlasv4-proto-cat-catalogo-cod-siag-univ", "Código SIAG - Catálogo Universal", "text", section="sec-cat-codigos", hidden=True, spec="Somente se universal = Sim."),
                field("form-patlasv4-proto-cat-catalogo-cod-protheus-univ", "Código Protheus - Catálogo Universal", "text", section="sec-cat-codigos", hidden=True, spec="Somente se universal = Sim."),
                field(
                    "form-patlasv4-proto-cat-catalogo-responsavel",
                    "Representante/Responsável",
                    "reference",
                    section="sec-cat-resp",
                    linked="form-patlasv4-proto-pessoa",
                    options=["LUCAS DOS SANTOS", "Ricardo Almeida Ferreira", "Felipe Oliveira Costa"],
                    spec="Responsável principal. Obrigatório para publicar.",
                ),
                field("form-patlasv4-proto-cat-catalogo-focal-vendas", "Focal de vendas", "reference", section="sec-cat-resp", linked="form-patlasv4-proto-pessoa", options=["LUCAS DOS SANTOS", "Ricardo Almeida Ferreira", "Felipe Oliveira Costa"], spec="Pertence ao Catálogo; não repetir em Produto."),
                field("form-patlasv4-proto-cat-catalogo-focal-posvendas", "Focal de pós-vendas", "reference", section="sec-cat-resp", linked="form-patlasv4-proto-pessoa", options=["LUCAS DOS SANTOS", "Ricardo Almeida Ferreira", "Felipe Oliveira Costa"], spec="Pertence ao Catálogo; não repetir em Produto."),
                field("form-patlasv4-proto-cat-catalogo-unidade-dtic", "Unidade DTIC", "reference", section="sec-cat-resp", linked="form-patlasv4-proto-unidade-organizacional", options=["Unidade de Gestão de Projetos", "Gabinete da Diretoria de Tecnologia da Informação"], spec="Obrigatório para publicar; pode ficar vazio no Rascunho."),
                field(
                    "form-patlasv4-proto-cat-catalogo-produtos",
                    "Produtos",
                    "reference",
                    multiple=True,
                    size="large",
                    section="sec-cat-produtos",
                    linked="form-patlasv4-proto-cat-produto",
                    options=["Implantação MTI Simplifica", "Elaborar plano de projeto"],
                    spec="Não obrigatório na criação inicial. Incluir após salvar o Catálogo (manual/CSV).",
                ),
                field("form-patlasv4-proto-cat-catalogo-observacoes", "Observações", "text", size="large", text_long=True, section="sec-cat-obs", spec="Nota complementar; não substitui campos estruturados."),
                # legado oculto
                field("form-patlasv4-proto-cat-catalogo-preencher-manual", "Preencher manualmente?", "boolean", hidden=True, section="sec-cat-codigos", spec="REMOVIDO pela PM — integração fora desta etapa."),
                field("form-patlasv4-proto-cat-catalogo-valor-unitario", "Valor unitário (legado)", "number", hidden=True, section="sec-cat-metricas", spec="REMOVIDO — usar valor na linha de Métricas permitidas."),
                field("form-patlasv4-proto-cat-catalogo-cobranca", "Cobrança (legado)", "reference", hidden=True, section="sec-cat-props", linked="form-patlasv4-proto-cat-tipo-cobranca", options=["Mensal", "Anual", "Conforme homologação"], spec="Cobrança fica no Produto (PM)."),
                field("form-patlasv4-proto-cat-catalogo-link-parceria", "Link do catálogo de parceria", "text", hidden=True, section="sec-cat-obs", spec="Opcional/legado."),
                field(
                    "form-patlasv4-proto-cat-catalogo-status-fluxo",
                    "Status do fluxo (legado)",
                    "textOptions",
                    read_only=True,
                    hidden=True,
                    section="sec-cat-ident",
                    options=["Rascunho (parceiro)", "Aguardando análise MTI", "Ajuste solicitado", "Homologado", "Ativo (publicado)", "Paralisado", "Reprovado"],
                    spec="Substituído por Status do catálogo (workflow PM §15).",
                ),
            ],
            "fieldVisibilityRules": [
                vis_rule("rule-cat-univ-codes", "form-patlasv4-proto-cat-catalogo-toggle-universal", "eq", True, "show", [
                    "form-patlasv4-proto-cat-catalogo-cod-siag-univ",
                    "form-patlasv4-proto-cat-catalogo-cod-protheus-univ",
                    "form-patlasv4-proto-cat-catalogo-objeto-universal",
                ]),
                vis_rule("rule-cat-complex", "form-patlasv4-proto-cat-catalogo-estrutura-variacao", "eq", "Por complexidade", "show", [
                    "form-patlasv4-proto-cat-catalogo-complexidades",
                ]),
            ],
            "exampleValuePresets": [
                {
                    "id": "form-patlasv4-proto-cat-catalogo-p-simplifica",
                    "name": "MTI Simplifica 9.4",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-catalogo-identificador": "Catálogo MTI Simplifica",
                        "form-patlasv4-proto-cat-catalogo-parceria": "MTI SIMPLIFICA",
                        "form-patlasv4-proto-cat-catalogo-solucao": "MTI Simplifica",
                        "form-patlasv4-proto-cat-catalogo-descricao": "Cardápio versionado Simplifica.",
                        "form-patlasv4-proto-cat-catalogo-versao": "9.4",
                        "form-patlasv4-proto-cat-catalogo-status": "Publicado",
                        "form-patlasv4-proto-cat-catalogo-toggle-universal": True,
                        "form-patlasv4-proto-cat-catalogo-toggle-servicos": True,
                        "form-patlasv4-proto-cat-catalogo-estrutura-variacao": "Por complexidade",
                        "form-patlasv4-proto-cat-catalogo-focal-vendas": "LUCAS DOS SANTOS",
                        "form-patlasv4-proto-cat-catalogo-unidade-dtic": "Unidade de Gestão de Projetos",
                    },
                }
            ],
            "activeExamplePresetId": "form-patlasv4-proto-cat-catalogo-p-simplifica",
            "methods": cat_methods,
        },
    )

    upsert_after(forms, "form-patlasv4-proto-cat-catalogo", form_cat_met)
    upsert_after(forms, "form-patlasv4-proto-cat-catalogo-metrica", form_cat_cx)

    # ---- Produto (PM §12) ----
    old_prod = next(f for f in forms if f["id"] == "form-patlasv4-proto-cat-produto")
    prod_methods = [
        m
        for m in (old_prod.get("methods") or [])
        if m.get("id") != "patlasv4proto-prod-meth-recalc-fator"
    ]
    replace_form(
        forms,
        "form-patlasv4-proto-cat-produto",
        {
            "id": "form-patlasv4-proto-cat-produto",
            "name": "Produto",
            "sectionLayout": "accordion",
            "defaultCanvasMode": "edit",
            "metadata": "PM Atlas Fase 2 §12. Catálogo primeiro; herança Parceria/Solução/versão; sem fator; sem focais editáveis; consumo por OS; códigos só do item.",
            "sections": [
                {"id": "sec-prod-ctx", "title": "Contexto do Catálogo", "icon": "account_tree"},
                {"id": "sec-prod-ident", "title": "Identificação", "icon": "badge"},
                {"id": "sec-prod-com", "title": "Comercialização", "icon": "payments"},
                {"id": "sec-prod-cond", "title": "Características condicionais", "icon": "rule"},
                {"id": "sec-prod-cod", "title": "Códigos do item", "icon": "qr_code"},
                {"id": "sec-prod-resp", "title": "Responsáveis herdados do Catálogo", "icon": "group"},
                {"id": "sec-prod-esp", "title": "Especificações e observações", "icon": "description"},
                {"id": "sec-prod-status", "title": "Situação", "icon": "flag"},
            ],
            "fields": [
                field("form-patlasv4-proto-cat-produto-catalogo", "Catálogo", "reference", required=True, relevance="identity", section="sec-prod-ctx", linked="form-patlasv4-proto-cat-catalogo", options=["Catálogo MTI Simplifica", "MTI HOST"], spec="Primeiro campo. Somente catálogo habilitado/editável."),
                field("form-patlasv4-proto-cat-produto-parceria", "Parceria", "reference", read_only=True, required=True, section="sec-prod-ctx", linked="form-patlasv4-proto-cat-parceria", options=["MTI SIMPLIFICA", "MTI HOST"], spec="Herdada do Catálogo — não selecionar de novo."),
                field("form-patlasv4-proto-cat-produto-solucao", "Solução", "reference", read_only=True, required=True, section="sec-prod-ctx", linked="form-patlasv4-proto-cat-solucao", options=["MTI Simplifica", "MTI Host"], spec="Herdada do Catálogo."),
                field("form-patlasv4-proto-cat-produto-versao-catalogo", "Versão do catálogo", "text", read_only=True, required=True, section="sec-prod-ctx", spec="Versão em que o Produto será gravado."),
                field("form-patlasv4-proto-cat-produto-identificador", "Nome do produto", "text", required=True, section="sec-prod-ident", spec="Nome comercial específico."),
                field("form-patlasv4-proto-cat-produto-descricao", "Descrição do produto", "text", size="large", text_long=True, section="sec-prod-ident", spec="Obrigatório para enviar. Escopo/entrega/resultado."),
                field("form-patlasv4-proto-cat-produto-tipo", "Tipo de produto", "textOptions", required=True, section="sec-prod-ident", options=["Licença", "Serviço"], spec="Somente Licença ou Serviço."),
                field("form-patlasv4-proto-cat-produto-part-number", "Part Number (SKU)", "text", section="sec-prod-ident", hidden=True, spec="Exibir para Licença (opcional no protótipo). Não preencher com o nome."),
                field("form-patlasv4-proto-cat-produto-tipo-oferta", "Tipo de oferta", "textOptions", required=True, section="sec-prod-ident", options=["Universal", "Individualizado"], spec="Se Catálogo.universal=Não → Individualizado fixo. Não cria N3 automaticamente."),
                field("form-patlasv4-proto-cat-produto-categoria", "Categoria de serviços", "reference", section="sec-prod-ident", linked="form-patlasv4-proto-cat-categoria", options=["Treinamento e Capacitação", "Consultoria em Processos", "Soluções SaaS"], hidden=True, spec="Exibir para Serviço."),
                field("form-patlasv4-proto-cat-produto-grupo", "Grupo", "reference", required=True, section="sec-prod-ident", linked="form-patlasv4-proto-cat-grupo", options=["Análise e Modelagem de Processos", "MTI Simplifica"], spec="Filtrado pela Solução do Catálogo."),
                field("form-patlasv4-proto-cat-produto-modelo-venda", "Modelo de venda", "reference", required=True, section="sec-prod-com", linked="form-patlasv4-proto-cat-modelo-venda", options=["Por licença", "Por serviço", "Por pacote"], spec="Compatível com Licença/Serviço."),
                field("form-patlasv4-proto-cat-produto-cobranca", "Tipo de cobrança", "reference", required=True, section="sec-prod-com", linked="form-patlasv4-proto-cat-tipo-cobranca", options=["Mensal", "Anual", "Conforme homologação"], spec="Somente os três valores confirmados. Sem Sob demanda."),
                field("form-patlasv4-proto-cat-produto-consumo-os", "Consumo por ordem de serviço?", "boolean", section="sec-prod-com", hidden=True, spec="Substitui Sob demanda como cobrança. Se Sim, consumo depende de OS. Obrigatório para Serviço."),
                field("form-patlasv4-proto-cat-produto-valor-unitario", "Valor unitário", "number", required=True, section="sec-prod-com", spec="Preço próprio do Produto; > 0 no envio."),
                field("form-patlasv4-proto-cat-produto-metrica", "Métrica", "reference", section="sec-prod-com", linked="form-patlasv4-proto-cat-metrica", options=["USN", "UST", "HST"], spec="Somente métricas permitidas no Catálogo."),
                field("form-patlasv4-proto-cat-produto-qtde-metrica", "Quantidade da métrica por execução", "number", section="sec-prod-com", hidden=True, spec="Nunca usar 'Quantidade de HSTs/USTs'. Serviço + métrica que exige quantidade."),
                field("form-patlasv4-proto-cat-produto-complexidade", "Complexidade", "textOptions", section="sec-prod-cond", hidden=True, options=["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"], spec="Serviço + catálogo por complexidade; só faixas ativas."),
                field("form-patlasv4-proto-cat-produto-coeficiente-complexidade", "Coeficiente de complexidade", "number", read_only=True, section="sec-prod-cond", hidden=True, spec="Somente leitura; herdado da versão do Catálogo."),
                field("form-patlasv4-proto-cat-produto-peso", "Peso", "number", section="sec-prod-cond", hidden=True, spec="Serviço + catálogo por peso."),
                field("form-patlasv4-proto-cat-produto-cod-siag-item", "Código SIAG - Item", "text", section="sec-prod-cod", spec="Manual/importação. Sem integração automática."),
                field("form-patlasv4-proto-cat-produto-cod-protheus-item", "Código Protheus - Item", "text", section="sec-prod-cod", spec="Manual/importação."),
                field("form-patlasv4-proto-cat-produto-focal-vendas", "Focal de vendas (herdado)", "reference", read_only=True, section="sec-prod-resp", linked="form-patlasv4-proto-pessoa", options=["LUCAS DOS SANTOS"], spec="Somente leitura — vem do Catálogo."),
                field("form-patlasv4-proto-cat-produto-focal-posvendas", "Focal de pós-vendas (herdado)", "reference", read_only=True, section="sec-prod-resp", linked="form-patlasv4-proto-pessoa", options=["LUCAS DOS SANTOS"], spec="Somente leitura — vem do Catálogo."),
                field("form-patlasv4-proto-cat-produto-unidade-dtic", "Unidade DTIC (herdada)", "reference", read_only=True, section="sec-prod-resp", linked="form-patlasv4-proto-unidade-organizacional", options=["Unidade de Gestão de Projetos"], spec="Somente leitura — vem do Catálogo."),
                field("form-patlasv4-proto-cat-produto-especificacao-01", "Especificação 01", "text", section="sec-prod-esp", spec="Template dinâmico do Catálogo (protótipo)."),
                field("form-patlasv4-proto-cat-produto-especificacao-02", "Especificação 02", "text", section="sec-prod-esp"),
                field("form-patlasv4-proto-cat-produto-especificacao-03", "Especificação 03", "text", section="sec-prod-esp"),
                field("form-patlasv4-proto-cat-produto-especificacao-04", "Especificação 04", "text", section="sec-prod-esp"),
                field("form-patlasv4-proto-cat-produto-observacoes", "Observações", "text", size="large", text_long=True, section="sec-prod-esp", spec="Complementar; não substitui Nome/Descrição."),
                field(
                    "form-patlasv4-proto-cat-produto-status",
                    "Status do produto",
                    "textOptions",
                    required=True,
                    read_only=True,
                    section="sec-prod-status",
                    options=["Rascunho", "Em análise", "Ajuste solicitado", "Reprovado", "Aprovado", "Publicado", "Substituído"],
                    spec="Gerado pelo workflow.",
                ),
                # legado oculto / removido da UI
                field("form-patlasv4-proto-cat-produto-universal", "Universal (legado)", "boolean", hidden=True, section="sec-prod-ident", spec="Substituído por Tipo de oferta."),
                field("form-patlasv4-proto-cat-produto-individualizado", "Individualizado (legado)", "boolean", hidden=True, section="sec-prod-ident", spec="Substituído por Tipo de oferta."),
                field("form-patlasv4-proto-cat-produto-preencher-manual", "Preencher manualmente?", "boolean", hidden=True, section="sec-prod-cod", spec="REMOVIDO pela PM."),
                field("form-patlasv4-proto-cat-produto-cod-siag-cat", "Código SIAG - Catálogo", "text", hidden=True, section="sec-prod-cod", spec="Não editável no Produto."),
                field("form-patlasv4-proto-cat-produto-cod-protheus-cat", "Código Protheus - Catálogo", "text", hidden=True, section="sec-prod-cod", spec="Não editável no Produto."),
                field("form-patlasv4-proto-cat-produto-cod-siag-univ", "Código SIAG - Catálogo Universal", "text", hidden=True, section="sec-prod-cod"),
                field("form-patlasv4-proto-cat-produto-cod-protheus-univ", "Código Protheus - Catálogo Universal", "text", hidden=True, section="sec-prod-cod"),
                field("form-patlasv4-proto-cat-produto-moeda-universal", "Valor da moeda universal (R$)", "number", hidden=True, section="sec-prod-com", spec="Não exibir no Produto comum (N3 pendente)."),
                field("form-patlasv4-proto-cat-produto-fator-conversao", "Fator de conversão", "number", hidden=True, read_only=True, section="sec-prod-com", spec="REMOVIDO do formulário de Produto (PM)."),
                field("form-patlasv4-proto-cat-produto-link-catalogo", "Link do catálogo", "text", hidden=True, section="sec-prod-esp"),
                field("form-patlasv4-proto-cat-produto-status-fluxo", "Status do fluxo (legado)", "textOptions", read_only=True, hidden=True, section="sec-prod-status", options=["Rascunho (parceiro)", "Aguardando análise MTI", "Ajuste solicitado", "Homologado", "Ativo (publicado)", "Paralisado", "Reprovado"]),
            ],
            "fieldVisibilityRules": [
                vis_rule("rule-prod-sku-licenca", "form-patlasv4-proto-cat-produto-tipo", "eq", "Licença", "show", [
                    "form-patlasv4-proto-cat-produto-part-number",
                ]),
                vis_rule("rule-prod-servico-campos", "form-patlasv4-proto-cat-produto-tipo", "eq", "Serviço", "show", [
                    "form-patlasv4-proto-cat-produto-categoria",
                    "form-patlasv4-proto-cat-produto-consumo-os",
                    "form-patlasv4-proto-cat-produto-qtde-metrica",
                    "form-patlasv4-proto-cat-produto-complexidade",
                    "form-patlasv4-proto-cat-produto-coeficiente-complexidade",
                    "form-patlasv4-proto-cat-produto-peso",
                ]),
            ],
            "exampleValuePresets": [
                {
                    "id": "form-patlasv4-proto-cat-produto-p-serv",
                    "name": "Serviço UST · Simplifica",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-produto-catalogo": "Catálogo MTI Simplifica",
                        "form-patlasv4-proto-cat-produto-parceria": "MTI SIMPLIFICA",
                        "form-patlasv4-proto-cat-produto-solucao": "MTI Simplifica",
                        "form-patlasv4-proto-cat-produto-versao-catalogo": "9.4",
                        "form-patlasv4-proto-cat-produto-identificador": "Elaborar plano de projeto",
                        "form-patlasv4-proto-cat-produto-descricao": "Elaboração do plano de projeto (remoto).",
                        "form-patlasv4-proto-cat-produto-tipo": "Serviço",
                        "form-patlasv4-proto-cat-produto-tipo-oferta": "Universal",
                        "form-patlasv4-proto-cat-produto-categoria": "Soluções SaaS",
                        "form-patlasv4-proto-cat-produto-grupo": "Análise e Modelagem de Processos",
                        "form-patlasv4-proto-cat-produto-modelo-venda": "Por serviço",
                        "form-patlasv4-proto-cat-produto-cobranca": "Conforme homologação",
                        "form-patlasv4-proto-cat-produto-consumo-os": True,
                        "form-patlasv4-proto-cat-produto-valor-unitario": 1610.2,
                        "form-patlasv4-proto-cat-produto-metrica": "UST",
                        "form-patlasv4-proto-cat-produto-qtde-metrica": 10,
                        "form-patlasv4-proto-cat-produto-complexidade": "Média",
                        "form-patlasv4-proto-cat-produto-coeficiente-complexidade": 1,
                        "form-patlasv4-proto-cat-produto-status": "Rascunho",
                    },
                },
                {
                    "id": "form-patlasv4-proto-cat-produto-p-lic",
                    "name": "Licença · Por licença",
                    "fieldValues": {
                        "form-patlasv4-proto-cat-produto-catalogo": "Catálogo MTI Simplifica",
                        "form-patlasv4-proto-cat-produto-parceria": "MTI SIMPLIFICA",
                        "form-patlasv4-proto-cat-produto-solucao": "MTI Simplifica",
                        "form-patlasv4-proto-cat-produto-versao-catalogo": "9.4",
                        "form-patlasv4-proto-cat-produto-identificador": "Licença plataforma Simplifica",
                        "form-patlasv4-proto-cat-produto-descricao": "Licenciamento SaaS da plataforma.",
                        "form-patlasv4-proto-cat-produto-tipo": "Licença",
                        "form-patlasv4-proto-cat-produto-part-number": "SIMP-LIC-01",
                        "form-patlasv4-proto-cat-produto-tipo-oferta": "Individualizado",
                        "form-patlasv4-proto-cat-produto-grupo": "Análise e Modelagem de Processos",
                        "form-patlasv4-proto-cat-produto-modelo-venda": "Por licença",
                        "form-patlasv4-proto-cat-produto-cobranca": "Anual",
                        "form-patlasv4-proto-cat-produto-valor-unitario": 1200,
                        "form-patlasv4-proto-cat-produto-metrica": "USN",
                        "form-patlasv4-proto-cat-produto-status": "Rascunho",
                    },
                },
            ],
            "activeExamplePresetId": "form-patlasv4-proto-cat-produto-p-serv",
            "methods": prod_methods,
        },
    )

    # Rename display of catalog class already "Catálogo"; ensure partnership form name stays
    FORMS_PATH.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK", FORMS_PATH)
    print("forms count", len(forms))


if __name__ == "__main__":
    main()
