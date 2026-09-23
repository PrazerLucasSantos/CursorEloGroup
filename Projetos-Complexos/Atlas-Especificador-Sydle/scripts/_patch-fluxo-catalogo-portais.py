# -*- coding: utf-8 -*-
"""Fluxo Catálogo: Portal Parceiro ↔ Backoffice MTI ↔ Portal Cliente."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPIC = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS = EPIC / "forms.json"
WS = EPIC / "workspaces.json"
CG = EPIC / "class-groups.json"
FLOWS = EPIC / "flows.json"

STATUS_OPTS = [
    "Rascunho (parceiro)",
    "Aguardando análise MTI",
    "Ajuste solicitado",
    "Homologado",
    "Ativo (publicado)",
    "Paralisado",
    "Reprovado",
]


def upsert(forms: list, form: dict, after: str | None = None) -> None:
    for i, f in enumerate(forms):
        if f.get("id") == form["id"]:
            forms[i] = form
            return
    if after:
        for i, f in enumerate(forms):
            if f.get("id") == after:
                forms.insert(i + 1, form)
                return
    forms.append(form)


def ensure_status_field(form: dict, field_id: str, section_id: str | None = None) -> None:
    fields = form.setdefault("fields", [])
    if any(f.get("id") == field_id for f in fields):
        for f in fields:
            if f["id"] == field_id:
                f["options"] = STATUS_OPTS
                f["label"] = "Status do fluxo (portal ↔ MTI)"
                f["spec"] = (
                    "Espelho entre portal do parceiro e backoffice MTI. "
                    "Cliente NÃO altera — só consome versão apostilada no contrato."
                )
                f["relevance"] = "highlight"
        return
    fld = {
        "id": field_id,
        "label": "Status do fluxo (portal ↔ MTI)",
        "type": "textOptions",
        "size": "large",
        "readOnly": True,
        "required": False,
        "multiple": False,
        "relevance": "highlight",
        "options": STATUS_OPTS,
        "spec": (
            "Espelho portal parceiro ↔ backoffice. "
            "Cliente não cadastra catálogo — só consome versão do contrato."
        ),
    }
    if section_id:
        fld["sectionId"] = section_id
    # insert near status if exists
    for i, f in enumerate(fields):
        if "status" in (f.get("id") or "") and "fluxo" not in (f.get("id") or ""):
            fields.insert(i + 1, fld)
            return
    fields.append(fld)


def form_analise_catalogo() -> dict:
    return {
        "id": "form-patlasv4-proto-analise-catalogo",
        "name": "Análise de catálogo / produto (MTI)",
        "sectionLayout": "accordion",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Backoffice MTI — analisa catálogo/produto enviado pelo Portal do Parceiro. "
            "Cliente não envia cadastro de catálogo. Decisão: Aprovar, Solicitar ajuste ou Reprovar. "
            "Assinatura obrigatória. Após aprovar, MTI pode Publicar (homologar) e criar versão."
        ),
        "sections": [
            {"id": "sec-ac-origem", "title": "Origem (portal)", "icon": "language"},
            {"id": "sec-ac-objeto", "title": "Catálogo / Produto em análise", "icon": "category"},
            {"id": "sec-ac-decisao", "title": "Decisão MTI", "icon": "fact_check"},
            {"id": "sec-ac-assinatura", "title": "Assinatura", "icon": "draw"},
        ],
        "fields": [
            {
                "id": "patlasv4proto-ac-alerta",
                "type": "alert",
                "label": "Análise",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-ac-origem",
                "alertVariant": "info",
                "alertTitle": "Somente backoffice MTI",
                "alertMessage": (
                    "Parceiro cadastra e envia pelo portal. MTI decide aqui. "
                    "Cliente acessa apenas o Portal do Cliente para consumir a versão "
                    "homologada vinculada ao contrato (após apostilamento)."
                ),
            },
            {
                "id": "patlasv4proto-ac-origem",
                "label": "Origem",
                "type": "textOptions",
                "size": "medium",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-ac-origem",
                "options": ["Portal do Parceiro", "Cadastro interno MTI"],
            },
            {
                "id": "patlasv4proto-ac-parceiro",
                "label": "Parceiro / Organização",
                "type": "reference",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-ac-origem",
                "linkedFormId": "form-patlasv4-proto-unidade-organizacional",
                "options": ["EloGroup / EloGP"],
            },
            {
                "id": "patlasv4proto-ac-parceria",
                "label": "Parceria",
                "type": "reference",
                "size": "medium",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-ac-origem",
                "linkedFormId": "form-patlasv4-proto-cat-parceria",
                "options": ["MTI SIMPLIFICA", "MTI HOST"],
            },
            {
                "id": "patlasv4proto-ac-status-atual",
                "label": "Status atual",
                "type": "textOptions",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-ac-origem",
                "options": STATUS_OPTS,
            },
            {
                "id": "patlasv4proto-ac-catalogo",
                "label": "Catálogo enviado",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-ac-objeto",
                "linkedFormId": "form-patlasv4-proto-cat-catalogo",
                "embeddedDisplay": "form",
            },
            {
                "id": "patlasv4proto-ac-produtos",
                "label": "Produtos enviados",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-ac-objeto",
                "linkedFormId": "form-patlasv4-proto-cat-produto",
                "embeddedDisplay": "table",
            },
            {
                "id": "patlasv4proto-ac-decisao",
                "label": "Decisão",
                "type": "textOptions",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-ac-decisao",
                "options": ["Aprovar", "Solicitar ajuste", "Reprovar"],
            },
            {
                "id": "patlasv4proto-ac-novo-status",
                "label": "Novo status (após confirmar)",
                "type": "text",
                "size": "medium",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-ac-decisao",
                "spec": "Aprovar→Homologado | Ajuste→Ajuste solicitado | Reprovar→Reprovado",
            },
            {
                "id": "patlasv4proto-ac-justificativa",
                "label": "Justificativa",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-ac-decisao",
                "hidden": True,
                "textLong": True,
            },
            {
                "id": "patlasv4proto-ac-anexo",
                "label": "Anexo",
                "type": "file",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-ac-decisao",
                "hidden": True,
            },
            {
                "id": "patlasv4proto-ac-obs",
                "label": "Observação (aprovação)",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-ac-decisao",
                "hidden": True,
                "textLong": True,
            },
            {
                "id": "patlasv4proto-ac-publicar",
                "label": "Publicar após aprovar (Produção)",
                "type": "boolean",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-ac-decisao",
                "hidden": True,
                "spec": "Se Sim, status → Ativo (publicado). Cliente passa a ver na versão do contrato.",
            },
            {
                "id": "patlasv4proto-ac-assinado-por",
                "label": "Assinado por",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-ac-assinatura",
                "linkedFormId": "form-patlasv4-proto-pessoa",
                "options": ["Bernardo de Souza Machado", "Lucas dos Santos"],
            },
            {
                "id": "patlasv4proto-ac-data",
                "label": "Data da assinatura",
                "type": "date",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-ac-assinatura",
            },
            {
                "id": "patlasv4proto-ac-assinatura",
                "label": "Confirmar assinatura digital",
                "type": "boolean",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-ac-assinatura",
            },
        ],
        "fieldVisibilityRules": [
            {
                "id": "rule-ac-ajuste",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-ac-decisao",
                "sourceKind": "textOptions",
                "expectedOptionText": "Solicitar ajuste",
                "action": "show",
                "targetFieldIds": ["patlasv4proto-ac-justificativa", "patlasv4proto-ac-anexo"],
            },
            {
                "id": "rule-ac-reprovar",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-ac-decisao",
                "sourceKind": "textOptions",
                "expectedOptionText": "Reprovar",
                "action": "show",
                "targetFieldIds": ["patlasv4proto-ac-justificativa", "patlasv4proto-ac-anexo"],
            },
            {
                "id": "rule-ac-aprovar",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-ac-decisao",
                "sourceKind": "textOptions",
                "expectedOptionText": "Aprovar",
                "action": "show",
                "targetFieldIds": ["patlasv4proto-ac-obs", "patlasv4proto-ac-publicar"],
            },
        ],
        "methods": [
            {
                "id": "patlasv4proto-ac-meth-confirmar",
                "name": "Confirmar decisão",
                "icon": "task_alt",
                "kind": "destaque",
            }
        ],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-ac-ajuste",
                "name": "Parceiro — Solicitar ajuste (Simplifica)",
                "iconColor": "#ca8a04",
                "fieldValues": {
                    "patlasv4proto-ac-origem": "Portal do Parceiro",
                    "patlasv4proto-ac-parceiro": "EloGroup / EloGP",
                    "patlasv4proto-ac-parceria": "MTI SIMPLIFICA",
                    "patlasv4proto-ac-status-atual": "Aguardando análise MTI",
                    "patlasv4proto-ac-decisao": "Solicitar ajuste",
                    "patlasv4proto-ac-novo-status": "Ajuste solicitado",
                    "patlasv4proto-ac-justificativa": (
                        "Valor unitário diverge da planilha CGS. Corrigir CSV e reenviar."
                    ),
                    "patlasv4proto-ac-anexo": "checklist-ajuste.pdf",
                    "patlasv4proto-ac-assinado-por": "Bernardo de Souza Machado",
                    "patlasv4proto-ac-data": "03/08/2026",
                    "patlasv4proto-ac-assinatura": True,
                },
                "embeddedRowsByFieldId": {
                    "patlasv4proto-ac-catalogo": [
                        {
                            "form-patlasv4-proto-cat-catalogo-identificador": "MTI SIMPLIFICA",
                            "form-patlasv4-proto-cat-catalogo-versao": "1.5",
                            "form-patlasv4-proto-cat-catalogo-status": "Ativo",
                        }
                    ],
                    "patlasv4proto-ac-produtos": [
                        {
                            "form-patlasv4-proto-cat-produto-identificador": "Implantação MTI Simplifica",
                            "form-patlasv4-proto-cat-produto-valor-unitario": 22679,
                            "form-patlasv4-proto-cat-produto-metrica": "UST",
                        }
                    ],
                },
            },
            {
                "id": "patlasv4proto-p-ac-aprovar",
                "name": "Parceiro — Aprovar e publicar",
                "iconColor": "#16a34a",
                "fieldValues": {
                    "patlasv4proto-ac-origem": "Portal do Parceiro",
                    "patlasv4proto-ac-parceiro": "EloGroup / EloGP",
                    "patlasv4proto-ac-parceria": "MTI HOST",
                    "patlasv4proto-ac-status-atual": "Aguardando análise MTI",
                    "patlasv4proto-ac-decisao": "Aprovar",
                    "patlasv4proto-ac-novo-status": "Ativo (publicado)",
                    "patlasv4proto-ac-obs": "Catálogo validado.",
                    "patlasv4proto-ac-publicar": True,
                    "patlasv4proto-ac-assinado-por": "Bernardo de Souza Machado",
                    "patlasv4proto-ac-data": "03/08/2026",
                    "patlasv4proto-ac-assinatura": True,
                },
            },
        ],
        "activeExamplePresetId": "patlasv4proto-p-ac-ajuste",
    }


def form_portal_parceiro_catalogo() -> dict:
    return {
        "id": "form-patlasv4-proto-portal-parceiro-catalogo",
        "name": "Portal Parceiro — Meus catálogos e produtos",
        "sectionLayout": "accordion",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Portal do Parceiro: cadastrar/editar rascunho de catálogo e produtos da sua parceria, "
            "importar CSV e enviar à MTI. Não cria versão contratual nem publica em Produção. "
            "Cliente não usa este formulário."
        ),
        "sections": [
            {"id": "sec-ppc-contexto", "title": "Contexto da parceria", "icon": "handshake"},
            {"id": "sec-ppc-catalogo", "title": "Catálogo (rascunho)", "icon": "category"},
            {"id": "sec-ppc-produtos", "title": "Produtos", "icon": "inventory_2"},
            {"id": "sec-ppc-envio", "title": "Envio à MTI", "icon": "send"},
        ],
        "fields": [
            {
                "id": "patlasv4proto-ppc-alerta",
                "type": "alert",
                "label": "",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-ppc-contexto",
                "alertVariant": "info",
                "alertTitle": "Portal do Parceiro",
                "alertMessage": (
                    "Você cadastra e envia. A MTI analisa no backoffice (aprovar / ajuste / reprovar). "
                    "O cliente só vê o catálogo publicado na versão do contrato dele."
                ),
            },
            {
                "id": "patlasv4proto-ppc-organizacao",
                "label": "Organização (parceiro)",
                "type": "reference",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-ppc-contexto",
                "linkedFormId": "form-patlasv4-proto-unidade-organizacional",
                "options": ["EloGroup / EloGP"],
            },
            {
                "id": "patlasv4proto-ppc-parceria",
                "label": "Parceria",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-ppc-contexto",
                "linkedFormId": "form-patlasv4-proto-cat-parceria",
                "options": ["MTI SIMPLIFICA", "MTI HOST"],
            },
            {
                "id": "patlasv4proto-ppc-status",
                "label": "Status do envio",
                "type": "textOptions",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-ppc-contexto",
                "options": STATUS_OPTS,
            },
            {
                "id": "patlasv4proto-ppc-justificativa-mti",
                "label": "Última justificativa da MTI",
                "type": "text",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-ppc-contexto",
                "textLong": True,
                "spec": "Preenchido quando MTI solicita ajuste ou reprova.",
            },
            {
                "id": "patlasv4proto-ppc-catalogo",
                "label": "Catálogo",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-ppc-catalogo",
                "linkedFormId": "form-patlasv4-proto-cat-catalogo",
                "embeddedDisplay": "form",
            },
            {
                "id": "patlasv4proto-ppc-produtos",
                "label": "Produtos",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-ppc-produtos",
                "linkedFormId": "form-patlasv4-proto-cat-produto",
                "embeddedDisplay": "table",
            },
            {
                "id": "patlasv4proto-ppc-alerta-envio",
                "type": "alert",
                "label": "",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-ppc-envio",
                "alertVariant": "warning",
                "alertTitle": "Enviar à MTI",
                "alertMessage": (
                    "Ao enviar, o status muda para «Aguardando análise MTI». "
                    "Edição fica bloqueada até a MTI devolver (ajuste) ou homologar."
                ),
            },
            {
                "id": "patlasv4proto-ppc-obs-envio",
                "label": "Mensagem ao analista MTI (opcional)",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-ppc-envio",
                "textLong": True,
            },
        ],
        "methods": [
            {
                "id": "patlasv4proto-ppc-meth-salvar",
                "name": "Salvar rascunho",
                "icon": "save",
                "kind": "comum",
            },
            {
                "id": "patlasv4proto-ppc-meth-csv",
                "name": "Importar CSV",
                "icon": "upload_file",
                "kind": "destaque",
                "inputFormId": "form-patlasv4-proto-metodo-cat-import-csv",
            },
            {
                "id": "patlasv4proto-ppc-meth-enviar",
                "name": "Enviar à MTI",
                "icon": "send",
                "kind": "destaque",
            },
        ],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-ppc-rascunho",
                "name": "Rascunho Simplifica (parceiro)",
                "iconColor": "#7c3aed",
                "fieldValues": {
                    "patlasv4proto-ppc-organizacao": "EloGroup / EloGP",
                    "patlasv4proto-ppc-parceria": "MTI SIMPLIFICA",
                    "patlasv4proto-ppc-status": "Rascunho (parceiro)",
                    "patlasv4proto-ppc-obs-envio": "Primeira carga CSV 80 itens.",
                },
                "embeddedRowsByFieldId": {
                    "patlasv4proto-ppc-catalogo": [
                        {
                            "form-patlasv4-proto-cat-catalogo-identificador": "MTI SIMPLIFICA",
                            "form-patlasv4-proto-cat-catalogo-versao": "1.5",
                            "form-patlasv4-proto-cat-catalogo-status": "Ativo",
                            "form-patlasv4-proto-cat-catalogo-parceria": "MTI SIMPLIFICA",
                        }
                    ],
                    "patlasv4proto-ppc-produtos": [
                        {
                            "form-patlasv4-proto-cat-produto-identificador": "Implantação MTI Simplifica",
                            "form-patlasv4-proto-cat-produto-tipo": "Serviço",
                            "form-patlasv4-proto-cat-produto-metrica": "UST",
                            "form-patlasv4-proto-cat-produto-valor-unitario": 22679,
                            "form-patlasv4-proto-cat-produto-status": "Ativo",
                        }
                    ],
                },
            },
            {
                "id": "patlasv4proto-p-ppc-aguardando",
                "name": "Aguardando MTI",
                "iconColor": "#0F6CBD",
                "fieldValues": {
                    "patlasv4proto-ppc-organizacao": "EloGroup / EloGP",
                    "patlasv4proto-ppc-parceria": "MTI SIMPLIFICA",
                    "patlasv4proto-ppc-status": "Aguardando análise MTI",
                },
            },
            {
                "id": "patlasv4proto-p-ppc-ajuste",
                "name": "Ajuste solicitado pela MTI",
                "iconColor": "#ca8a04",
                "fieldValues": {
                    "patlasv4proto-ppc-organizacao": "EloGroup / EloGP",
                    "patlasv4proto-ppc-parceria": "MTI SIMPLIFICA",
                    "patlasv4proto-ppc-status": "Ajuste solicitado",
                    "patlasv4proto-ppc-justificativa-mti": (
                        "Valor unitário diverge da planilha CGS. Corrigir e reenviar."
                    ),
                },
            },
        ],
        "activeExamplePresetId": "patlasv4proto-p-ppc-rascunho",
    }


def form_portal_cliente_catalogo_info() -> dict:
    """Spec form documenting client consumption (no cadastro)."""
    return {
        "id": "form-patlasv4-proto-portal-cliente-catalogo",
        "name": "Portal Cliente — Catálogo (consumo)",
        "sectionLayout": "accordion",
        "defaultCanvasMode": "read",
        "metadata": (
            "Portal do Cliente: SOMENTE consumo. Não cadastra catálogo/produto. "
            "Vê itens em Produção da versão apostilada no contrato. "
            "Ações: cotação, demanda, OS sobre itens contratados."
        ),
        "sections": [
            {"id": "sec-pcc-aviso", "title": "Regras de acesso", "icon": "info"},
            {"id": "sec-pcc-contrato", "title": "Contrato e versão", "icon": "description"},
            {"id": "sec-pcc-acoes", "title": "Ações do cliente", "icon": "bolt"},
        ],
        "fields": [
            {
                "id": "patlasv4proto-pcc-alerta",
                "type": "alert",
                "label": "",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pcc-aviso",
                "alertVariant": "warning",
                "alertTitle": "Cliente não cadastra catálogo",
                "alertMessage": (
                    "Cadastro e envio são do Parceiro (portal) e da MTI (backoffice). "
                    "Você consulta o catálogo da versão do seu contrato e consome via "
                    "cotação, demanda ou ordem de serviço."
                ),
            },
            {
                "id": "patlasv4proto-pcc-contrato",
                "label": "Contrato vigente",
                "type": "text",
                "size": "medium",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-pcc-contrato",
            },
            {
                "id": "patlasv4proto-pcc-versao",
                "label": "Versão do catálogo no contrato",
                "type": "text",
                "size": "small",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-pcc-contrato",
                "spec": "RN-VER-03 — só muda após apostilamento.",
            },
            {
                "id": "patlasv4proto-pcc-catalogo",
                "label": "Itens visíveis (Produção)",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pcc-contrato",
                "linkedFormId": "form-patlasv4-proto-cat-produto",
                "embeddedDisplay": "table",
            },
            {
                "id": "patlasv4proto-pcc-acoes",
                "label": "Ações disponíveis",
                "type": "textOptions",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pcc-acoes",
                "options": [
                    "Consultar catálogo da versão do contrato",
                    "Nova cotação (gera demanda à MTI)",
                    "Abrir ordem de serviço (itens contratados)",
                    "Acompanhar demandas / OS",
                ],
            },
        ],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-pcc-seplag",
                "name": "Cliente SEPLAG — catálogo v1.5",
                "fieldValues": {
                    "patlasv4proto-pcc-contrato": "CTR-2026-SEPLAG-001",
                    "patlasv4proto-pcc-versao": "1.5",
                    "patlasv4proto-pcc-acoes": [
                        "Consultar catálogo da versão do contrato",
                        "Nova cotação (gera demanda à MTI)",
                        "Abrir ordem de serviço (itens contratados)",
                        "Acompanhar demandas / OS",
                    ],
                },
            }
        ],
        "activeExamplePresetId": "patlasv4proto-p-pcc-seplag",
        "methods": [],
    }


def patch_backoffice_methods(cat: dict, prod: dict) -> None:
    """Ensure MTI methods are labeled as backoffice-only."""
    for meth in cat.get("methods") or []:
        if meth.get("id") == "patlasv4proto-cat-meth-enviar":
            meth["name"] = "Enviar para análise (interno)"
            meth["spec"] = "Uso MTI quando o cadastro é interno. Parceiro envia pelo portal."
        if meth.get("id") == "patlasv4proto-cat-meth-aprovar":
            meth["spec"] = "Backoffice MTI — ou use a classe Análise de catálogo."
        if meth.get("id") == "patlasv4proto-cat-meth-publicar":
            meth["spec"] = "Backoffice MTI — publica em Produção para o Portal do Cliente."
        if meth.get("id") == "patlasv4proto-cat-meth-nova-versao":
            meth["spec"] = "Backoffice MTI — cliente só vê após apostilamento."
    for meth in prod.get("methods") or []:
        if "enviar" in (meth.get("id") or ""):
            meth["spec"] = "Backoffice / interno. Parceiro usa o portal."


def patch_workspace(ws: list) -> None:
    entries = [
        {
            "id": "cls-mapa-portal-parceiro-catalogo",
            "name": "Portal Parceiro — Catálogos/Produtos",
            "linkedFormId": "form-patlasv4-proto-portal-parceiro-catalogo",
            "linkedFormExamplePresetIds": [
                "patlasv4proto-p-ppc-rascunho",
                "patlasv4proto-p-ppc-aguardando",
                "patlasv4proto-p-ppc-ajuste",
            ],
        },
        {
            "id": "cls-mapa-analise-catalogo",
            "name": "Análise de catálogo (MTI)",
            "linkedFormId": "form-patlasv4-proto-analise-catalogo",
            "linkedFormExamplePresetIds": [
                "patlasv4proto-p-ac-ajuste",
                "patlasv4proto-p-ac-aprovar",
            ],
        },
        {
            "id": "cls-mapa-portal-cliente-catalogo",
            "name": "Portal Cliente — Catálogo (consumo)",
            "linkedFormId": "form-patlasv4-proto-portal-cliente-catalogo",
            "linkedFormExamplePresetIds": ["patlasv4proto-p-pcc-seplag"],
        },
    ]
    for w in ws:
        for pkg in w.get("packages") or []:
            if pkg.get("id") == "pkg-fase-2-catalogo":
                classes = pkg.get("classes") or []
                ids = {c.get("id") for c in classes}
                for e in entries:
                    if e["id"] not in ids:
                        classes.append(e)
                pkg["classes"] = classes
            if pkg.get("id") == "pkg-mapa-portal-f1":
                classes = pkg.get("classes") or []
                ids = {c.get("id") for c in classes}
                for e in entries[:1]:  # portal parceiro catalog also in portal pkg
                    if e["id"] not in ids:
                        classes.append(e)
                pkg["classes"] = classes


def patch_class_groups(cg: dict) -> None:
    a = cg.setdefault("assignments", {})
    a["form-patlasv4-proto-analise-catalogo"] = "grp-atlas-produtos"
    a["form-patlasv4-proto-portal-parceiro-catalogo"] = "grp-atlas-produtos"
    a["form-patlasv4-proto-portal-cliente-catalogo"] = "grp-atlas-produtos"
    order = cg.setdefault("memberOrderByGroup", {})
    members = list(order.get("grp-atlas-produtos") or [])
    for fid in [
        "form-patlasv4-proto-analise-catalogo",
        "form-patlasv4-proto-portal-parceiro-catalogo",
        "form-patlasv4-proto-portal-cliente-catalogo",
    ]:
        if fid not in members:
            members.append(fid)
    order["grp-atlas-produtos"] = members


def patch_flow(flows: list) -> None:
    flow = {
        "id": "flow-proto-catalogo-portal-mti-cliente",
        "name": "Catálogo — Parceiro (portal) → MTI (backoffice) → Cliente (portal)",
        "description": (
            "Parceiro cadastra/envia no portal; MTI analisa/publica no backoffice; "
            "Cliente consome versão do contrato no portal (sem cadastro)."
        ),
        "lanes": [
            {"id": "lane-parceiro", "name": "Portal do Parceiro"},
            {"id": "lane-mti", "name": "Backoffice MTI"},
            {"id": "lane-cliente", "name": "Portal do Cliente"},
        ],
        "nodes": [
            {"id": "n1", "name": "Cadastrar catálogo/produtos (CSV ou manual)", "laneId": "lane-parceiro"},
            {"id": "n2", "name": "Salvar rascunho", "laneId": "lane-parceiro"},
            {"id": "n3", "name": "Enviar à MTI", "laneId": "lane-parceiro"},
            {"id": "n4", "name": "Análise (aprovar / ajuste / reprovar)", "laneId": "lane-mti"},
            {"id": "n5", "name": "Parceiro corrige e reenvia", "laneId": "lane-parceiro"},
            {"id": "n6", "name": "Publicar + nova versão (se preciso)", "laneId": "lane-mti"},
            {"id": "n7", "name": "Apostilar contrato (versão)", "laneId": "lane-mti"},
            {"id": "n8", "name": "Consultar catálogo da versão", "laneId": "lane-cliente"},
            {"id": "n9", "name": "Cotação / Demanda / OS", "laneId": "lane-cliente"},
        ],
        "edges": [
            {"from": "n1", "to": "n2"},
            {"from": "n2", "to": "n3"},
            {"from": "n3", "to": "n4"},
            {"from": "n4", "to": "n5", "label": "Solicitar ajuste"},
            {"from": "n5", "to": "n3"},
            {"from": "n4", "to": "n6", "label": "Aprovar"},
            {"from": "n6", "to": "n7"},
            {"from": "n7", "to": "n8"},
            {"from": "n8", "to": "n9"},
        ],
    }
    for i, f in enumerate(flows):
        if f.get("id") == flow["id"]:
            flows[i] = flow
            return
    flows.insert(0, flow)


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    by = {f["id"]: f for f in forms}

    ensure_status_field(by["form-patlasv4-proto-cat-catalogo"], "form-patlasv4-proto-cat-catalogo-status-fluxo", "sec-cat-status")
    ensure_status_field(by["form-patlasv4-proto-cat-produto"], "form-patlasv4-proto-cat-produto-status-fluxo")
    patch_backoffice_methods(by["form-patlasv4-proto-cat-catalogo"], by["form-patlasv4-proto-cat-produto"])

    # enrich catalog presets with fluxo status
    for p in by["form-patlasv4-proto-cat-catalogo"].get("exampleValuePresets") or []:
        fv = p.setdefault("fieldValues", {})
        if "simplifica-17" in p.get("id", ""):
            fv["form-patlasv4-proto-cat-catalogo-status-fluxo"] = "Ativo (publicado)"
        elif "simplifica" in p.get("id", ""):
            fv["form-patlasv4-proto-cat-catalogo-status-fluxo"] = "Homologado"
        else:
            fv["form-patlasv4-proto-cat-catalogo-status-fluxo"] = "Ativo (publicado)"

    for form in [
        form_analise_catalogo(),
        form_portal_parceiro_catalogo(),
        form_portal_cliente_catalogo_info(),
    ]:
        upsert(forms, form, after="form-patlasv4-proto-cat-catalogo")

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    ws = json.loads(WS.read_text(encoding="utf-8"))
    patch_workspace(ws)
    WS.write_text(json.dumps(ws, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    cg = json.loads(CG.read_text(encoding="utf-8"))
    patch_class_groups(cg)
    CG.write_text(json.dumps(cg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    flows = json.loads(FLOWS.read_text(encoding="utf-8"))
    if isinstance(flows, dict):
        fl = flows.get("flows") or flows.get("items") or []
        patch_flow(fl)
        if "flows" in flows:
            flows["flows"] = fl
        elif "items" in flows:
            flows["items"] = fl
        else:
            flows = fl
    else:
        patch_flow(flows)
    FLOWS.write_text(json.dumps(flows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("OK forms+ws+cg+flow portal/backoffice catalogo")


if __name__ == "__main__":
    main()
