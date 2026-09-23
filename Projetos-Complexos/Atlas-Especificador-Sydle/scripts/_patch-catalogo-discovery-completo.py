# -*- coding: utf-8 -*-
"""Alinha Catálogo & Produtos ao Discovery 08/07/2026 + anexo Sydle + especificação."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPIC = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS = EPIC / "forms.json"
WS = EPIC / "workspaces.json"
CG = EPIC / "class-groups.json"

# --- Method forms ---

def method_nova_versao() -> dict:
    return {
        "id": "form-patlasv4-proto-metodo-cat-nova-versao",
        "name": "Catálogo — Criar nova versão",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Discovery 08/07/2026: nova versão NÃO sobrescreve a anterior. "
            "Cliente só vê a nova após apostilamento do contrato. OS/orçamentos "
            "antigos mantêm snapshot da versão da época."
        ),
        "fields": [
            {
                "id": "patlasv4proto-mcat-nv-alerta",
                "label": "Nova versão",
                "type": "alert",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "alertVariant": "warning",
                "alertTitle": "Versionamento imutável",
                "alertMessage": (
                    "Ao confirmar, o sistema cria uma nova versão do catálogo "
                    "(ex.: 1.5 → 1.7) copiando os produtos. A versão anterior "
                    "permanece para contratos, OS e orçamentos em snapshot."
                ),
            },
            {
                "id": "patlasv4proto-mcat-nv-versao-atual",
                "label": "Versão atual",
                "type": "text",
                "size": "small",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "spec": "Somente leitura — origem do snapshot.",
            },
            {
                "id": "patlasv4proto-mcat-nv-nova-versao",
                "label": "Nova versão",
                "type": "text",
                "size": "small",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "spec": "Ex.: 1.7. Deve ser maior que a versão atual.",
            },
            {
                "id": "patlasv4proto-mcat-nv-motivo",
                "label": "Motivo / changelog",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "textLong": True,
                "spec": "Descreva inclusões, descontinuações e ajustes de preço.",
            },
            {
                "id": "patlasv4proto-mcat-nv-copiar-produtos",
                "label": "Copiar produtos da versão atual",
                "type": "boolean",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "common",
                "spec": "Default Sim. Se Não, inicia versão vazia para import CSV.",
            },
        ],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-mcat-nv-exemplo",
                "name": "1.5 → 1.7 (Simplifica)",
                "iconColor": "#ca8a04",
                "fieldValues": {
                    "patlasv4proto-mcat-nv-versao-atual": "1.5",
                    "patlasv4proto-mcat-nv-nova-versao": "1.7",
                    "patlasv4proto-mcat-nv-motivo": (
                        "Inclusão de 12 serviços; reajuste UST; descontinuação de 2 itens legados."
                    ),
                    "patlasv4proto-mcat-nv-copiar-produtos": True,
                },
            }
        ],
        "activeExamplePresetId": "patlasv4proto-p-mcat-nv-exemplo",
    }


def method_import_csv() -> dict:
    return {
        "id": "form-patlasv4-proto-metodo-cat-import-csv",
        "name": "Catálogo/Produto — Importar CSV",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Discovery: parcerias com 80+ serviços — disponibilizar template CSV "
            "oficial; upload cria/atualiza produtos da versão."
        ),
        "fields": [
            {
                "id": "patlasv4proto-mcat-csv-alerta",
                "label": "Importação",
                "type": "alert",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "alertVariant": "info",
                "alertTitle": "Template oficial",
                "alertMessage": (
                    "Baixe o template, preencha e reenvie. Linhas inválidas são "
                    "rejeitadas com mensagem. Preferível a cadastro manual em massa."
                ),
            },
            {
                "id": "patlasv4proto-mcat-csv-arquivo",
                "label": "Arquivo CSV",
                "type": "file",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "spec": "CSV UTF-8 com colunas do template Atlas.",
            },
            {
                "id": "patlasv4proto-mcat-csv-modo",
                "label": "Modo",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "options": ["Somente novos", "Atualizar existentes", "Substituir versão"],
                "spec": "Substituir versão só em rascunho não apostilado.",
            },
            {
                "id": "patlasv4proto-mcat-csv-resumo",
                "label": "Resumo (após validação)",
                "type": "text",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "textLong": True,
                "spec": "Ex.: 80 ok · 2 erros · 8 novos.",
            },
        ],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-mcat-csv-exemplo",
                "name": "Importação Simplifica 80 itens",
                "fieldValues": {
                    "patlasv4proto-mcat-csv-arquivo": "mti-simplifica-v1.7.csv",
                    "patlasv4proto-mcat-csv-modo": "Atualizar existentes",
                    "patlasv4proto-mcat-csv-resumo": "80 ok · 0 erros · 12 novos · 2 descontinuados",
                },
            }
        ],
        "activeExamplePresetId": "patlasv4proto-p-mcat-csv-exemplo",
    }


def method_aprovar() -> dict:
    return {
        "id": "form-patlasv4-proto-metodo-cat-aprovar",
        "name": "Catálogo/Produto — Aprovar",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": "Parecer MTI quando o parceiro envia cadastro de catálogo/produto.",
        "fields": [
            {
                "id": "patlasv4proto-mcat-ap-alerta",
                "label": "Aprovação",
                "type": "alert",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "alertVariant": "success",
                "alertTitle": "Homologar cadastro",
                "alertMessage": "Status → Homologado/Ativo. Catálogo fica elegível a contratos.",
            },
            {
                "id": "patlasv4proto-mcat-ap-obs",
                "label": "Observação (opcional)",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "textLong": True,
            },
            {
                "id": "patlasv4proto-mcat-ap-assinatura",
                "label": "Confirmar assinatura digital",
                "type": "boolean",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
            },
        ],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-mcat-ap-exemplo",
                "name": "Aprovar Simplifica",
                "fieldValues": {
                    "patlasv4proto-mcat-ap-obs": "Documentação e preços validados.",
                    "patlasv4proto-mcat-ap-assinatura": True,
                },
            }
        ],
        "activeExamplePresetId": "patlasv4proto-p-mcat-ap-exemplo",
    }


def method_solicitar_ajuste() -> dict:
    return {
        "id": "form-patlasv4-proto-metodo-cat-solicitar-ajuste",
        "name": "Catálogo/Produto — Solicitar ajuste",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": "Devolve ao parceiro com justificativa e anexo (Discovery).",
        "fields": [
            {
                "id": "patlasv4proto-mcat-aj-alerta",
                "label": "Ajuste",
                "type": "alert",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "alertVariant": "warning",
                "alertTitle": "Solicitar correção",
                "alertMessage": "O responsável da parceria é notificado com o motivo abaixo.",
            },
            {
                "id": "patlasv4proto-mcat-aj-motivo",
                "label": "Justificativa",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "textLong": True,
            },
            {
                "id": "patlasv4proto-mcat-aj-anexo",
                "label": "Anexo",
                "type": "file",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
            },
            {
                "id": "patlasv4proto-mcat-aj-assinatura",
                "label": "Confirmar assinatura digital",
                "type": "boolean",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
            },
        ],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-mcat-aj-exemplo",
                "name": "Preço divergente",
                "iconColor": "#ca8a04",
                "fieldValues": {
                    "patlasv4proto-mcat-aj-motivo": (
                        "Valor unitário do item Q501011 diverge da planilha CGS. "
                        "Corrigir e reenviar CSV."
                    ),
                    "patlasv4proto-mcat-aj-anexo": "checklist-ajuste-catalogo.pdf",
                    "patlasv4proto-mcat-aj-assinatura": True,
                },
            }
        ],
        "activeExamplePresetId": "patlasv4proto-p-mcat-aj-exemplo",
    }


def upsert(forms: list[dict], form: dict, after_id: str | None = None) -> None:
    for i, f in enumerate(forms):
        if f.get("id") == form["id"]:
            forms[i] = form
            return
    if after_id:
        for i, f in enumerate(forms):
            if f.get("id") == after_id:
                forms.insert(i + 1, form)
                return
    forms.append(form)


def patch_catalogo(f: dict) -> None:
    f["sectionLayout"] = "accordion"
    f["defaultCanvasMode"] = "edit"
    f["metadata"] = (
        "Discovery 08/07/2026 — Catálogo Tipo 2/3. Versão é atributo do contrato; "
        "nova versão não sobrescreve. CSV import/export. Parecer MTI. "
        "Layout acordeão (página contínua)."
    )
    # ensure observacoes can feed templates
    for fld in f.get("fields") or []:
        if fld.get("id") == "form-patlasv4-proto-cat-catalogo-observacoes":
            fld["type"] = "text"
            fld["textLong"] = True
            fld["spec"] = "Texto livre; pode alimentar templates de proposta/OS."
        if fld.get("id") == "form-patlasv4-proto-cat-catalogo-identificador":
            fld["label"] = "Nome do catálogo"
        if fld.get("id") == "form-patlasv4-proto-cat-catalogo-versao":
            fld["spec"] = (
                "Ex.: 1.5 / 1.7 / 8.0. Atributo também do contrato. "
                "Cliente só vê nova versão após apostilamento (RN-VER-03)."
            )

    # sections accordion titles
    f["sections"] = [
        {"id": "sec-cat-ident", "title": "Identificação", "icon": "badge"},
        {"id": "sec-cat-codigos", "title": "Códigos (SIAG / Protheus)", "icon": "qr_code"},
        {"id": "sec-cat-cobranca", "title": "Cobrança e valores", "icon": "payments"},
        {"id": "sec-cat-resp", "title": "Responsáveis", "icon": "group"},
        {"id": "sec-cat-parceria", "title": "Parceria", "icon": "handshake"},
        {"id": "sec-cat-status", "title": "Status e observações", "icon": "flag"},
    ]
    # map sectionIds if missing
    section_map = {
        "form-patlasv4-proto-cat-catalogo-identificador": "sec-cat-ident",
        "form-patlasv4-proto-cat-catalogo-versao": "sec-cat-ident",
        "form-patlasv4-proto-cat-catalogo-versao-anterior": "sec-cat-ident",
        "form-patlasv4-proto-cat-catalogo-produtos": "sec-cat-ident",
        "form-patlasv4-proto-cat-catalogo-alerta-integracao": "sec-cat-codigos",
        "form-patlasv4-proto-cat-catalogo-preencher-manual": "sec-cat-codigos",
        "form-patlasv4-proto-cat-catalogo-cod-siag-cat": "sec-cat-codigos",
        "form-patlasv4-proto-cat-catalogo-cod-protheus-cat": "sec-cat-codigos",
        "form-patlasv4-proto-cat-catalogo-cod-siag-univ": "sec-cat-codigos",
        "form-patlasv4-proto-cat-catalogo-cod-protheus-univ": "sec-cat-codigos",
        "form-patlasv4-proto-cat-catalogo-cobranca": "sec-cat-cobranca",
        "form-patlasv4-proto-cat-catalogo-valor-unitario": "sec-cat-cobranca",
        "form-patlasv4-proto-cat-catalogo-focal-vendas": "sec-cat-resp",
        "form-patlasv4-proto-cat-catalogo-focal-posvendas": "sec-cat-resp",
        "form-patlasv4-proto-cat-catalogo-unidade-dtic": "sec-cat-resp",
        "form-patlasv4-proto-cat-catalogo-link-parceria": "sec-cat-parceria",
        "form-patlasv4-proto-cat-catalogo-parceria": "sec-cat-parceria",
        "form-patlasv4-proto-cat-catalogo-status": "sec-cat-status",
        "form-patlasv4-proto-cat-catalogo-observacoes": "sec-cat-status",
    }
    for fld in f.get("fields") or []:
        sid = section_map.get(fld.get("id"))
        if sid:
            fld["sectionId"] = sid

    f["methods"] = [
        {
            "id": "patlasv4proto-cat-meth-nova-versao",
            "name": "Criar nova versão",
            "icon": "content_copy",
            "kind": "destaque",
            "inputFormId": "form-patlasv4-proto-metodo-cat-nova-versao",
        },
        {
            "id": "patlasv4proto-cat-meth-import-csv",
            "name": "Importar CSV",
            "icon": "upload_file",
            "kind": "destaque",
            "inputFormId": "form-patlasv4-proto-metodo-cat-import-csv",
        },
        {"id": "patlasv4proto-cat-meth-export-csv", "name": "Exportar CSV", "icon": "download", "kind": "comum"},
        {"id": "patlasv4proto-cat-meth-export-pdf", "name": "Exportar PDF", "icon": "picture_as_pdf", "kind": "comum"},
        {"id": "patlasv4proto-cat-meth-grade", "name": "Visão planilha", "icon": "table_view", "kind": "comum"},
        {"id": "patlasv4proto-cat-meth-enviar", "name": "Enviar para análise", "icon": "send", "kind": "destaque"},
        {
            "id": "patlasv4proto-cat-meth-aprovar",
            "name": "Aprovar",
            "icon": "check_circle",
            "kind": "destaque",
            "inputFormId": "form-patlasv4-proto-metodo-cat-aprovar",
        },
        {
            "id": "patlasv4proto-cat-meth-ajuste",
            "name": "Solicitar ajuste",
            "icon": "edit_note",
            "kind": "destaque",
            "inputFormId": "form-patlasv4-proto-metodo-cat-solicitar-ajuste",
        },
        {"id": "patlasv4proto-cat-meth-publicar", "name": "Publicar (homologar)", "icon": "verified", "kind": "comum"},
    ]

    f["exampleValuePresets"] = [
        {
            "id": "form-patlasv4-proto-cat-catalogo-p-host",
            "name": "MTI HOST · v8.0 (licenciamento USN)",
            "iconColor": "#0F6CBD",
            "fieldValues": {
                "form-patlasv4-proto-cat-catalogo-identificador": "MTI HOST",
                "form-patlasv4-proto-cat-catalogo-versao": "8.0",
                "form-patlasv4-proto-cat-catalogo-preencher-manual": False,
                "form-patlasv4-proto-cat-catalogo-cobranca": "Sob Demanda",
                "form-patlasv4-proto-cat-catalogo-valor-unitario": 0,
                "form-patlasv4-proto-cat-catalogo-focal-vendas": "Bernardo de Souza Machado",
                "form-patlasv4-proto-cat-catalogo-focal-posvendas": "Lucas dos Santos",
                "form-patlasv4-proto-cat-catalogo-unidade-dtic": "MTI/DTIC",
                "form-patlasv4-proto-cat-catalogo-parceria": "MTI HOST",
                "form-patlasv4-proto-cat-catalogo-status": "Homologado",
                "form-patlasv4-proto-cat-catalogo-produtos": [
                    "MTI HOST - Infraestrutura",
                    "MTI HOST - Backup",
                ],
                "form-patlasv4-proto-cat-catalogo-observacoes": (
                    "Catálogo de licenciamento/infra. Métrica USN. Tipo 2."
                ),
            },
        },
        {
            "id": "form-patlasv4-proto-cat-catalogo-p-simplifica",
            "name": "MTI SIMPLIFICA · v1.5 (UST — snapshot)",
            "iconColor": "#7c3aed",
            "fieldValues": {
                "form-patlasv4-proto-cat-catalogo-identificador": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-catalogo-versao": "1.5",
                "form-patlasv4-proto-cat-catalogo-preencher-manual": False,
                "form-patlasv4-proto-cat-catalogo-cobranca": "Sob Demanda",
                "form-patlasv4-proto-cat-catalogo-valor-unitario": 161.02,
                "form-patlasv4-proto-cat-catalogo-focal-vendas": "Bernardo de Souza Machado",
                "form-patlasv4-proto-cat-catalogo-focal-posvendas": "Gabriel Estácio",
                "form-patlasv4-proto-cat-catalogo-unidade-dtic": "MTI/DTIC",
                "form-patlasv4-proto-cat-catalogo-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-catalogo-status": "Ativo",
                "form-patlasv4-proto-cat-catalogo-produtos": [
                    "Implantação MTI Simplifica",
                    "Elaborar plano de projeto",
                ],
                "form-patlasv4-proto-cat-catalogo-observacoes": (
                    "Versão 1.5 em contratos Seplag/MPMS. Nova versão 1.7 exige apostilamento."
                ),
            },
        },
        {
            "id": "form-patlasv4-proto-cat-catalogo-p-simplifica-17",
            "name": "MTI SIMPLIFICA · v1.7 (após nova versão)",
            "iconColor": "#16a34a",
            "fieldValues": {
                "form-patlasv4-proto-cat-catalogo-identificador": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-catalogo-versao": "1.7",
                "form-patlasv4-proto-cat-catalogo-versao-anterior": "1.5",
                "form-patlasv4-proto-cat-catalogo-preencher-manual": False,
                "form-patlasv4-proto-cat-catalogo-cobranca": "Sob Demanda",
                "form-patlasv4-proto-cat-catalogo-valor-unitario": 161.02,
                "form-patlasv4-proto-cat-catalogo-unidade-dtic": "MTI/DTIC",
                "form-patlasv4-proto-cat-catalogo-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-catalogo-status": "Homologado",
                "form-patlasv4-proto-cat-catalogo-observacoes": (
                    "92 serviços. Clientes só enxergam após apostilar contrato para 1.7."
                ),
            },
        },
    ]
    f["activeExamplePresetId"] = "form-patlasv4-proto-cat-catalogo-p-simplifica"


def patch_produto(f: dict) -> None:
    f["sectionLayout"] = "none"
    f["sections"] = []
    f["defaultCanvasMode"] = "edit"
    f["metadata"] = (
        "Discovery 08/07/2026 — Produto em página única (sem sub-abas). "
        "Card: Nome + Tipo + Grupo + tag status. Toggles Universal e Individualizado "
        "independentes. Fator RO (Tipo 3). Sem markup (RN-P-05 → Dados de Parceria)."
    )
    for fld in f.get("fields") or []:
        fid = fld.get("id")
        if fid == "form-patlasv4-proto-cat-produto-identificador":
            fld["label"] = "Nome do produto"
            fld["relevance"] = "identity"
        if fid == "form-patlasv4-proto-cat-produto-complexidade":
            fld["spec"] = (
                "Somente Serviço. Faixa textual (ex.: Simplifica). "
                "Alternativa ao coeficiente — usar um OU outro conforme a parceria."
            )
        if fid == "form-patlasv4-proto-cat-produto-coeficiente-complexidade":
            fld["spec"] = (
                "Somente Serviço. Use quando a parceria mede complexidade em número "
                "(0,8 / 1,0 / 1,2). Alternativa à complexidade textual."
            )
        if fid == "form-patlasv4-proto-cat-produto-fator-conversao":
            fld["spec"] = (
                "Calculado Tipo 3: unitário ÷ moeda universal (ex.: 22679 ÷ 282,58 ≈ 80,25). "
                "USN tipicamente 1. Vazio se só Individualizado (RN-P-03)."
            )
        # remove sectionId for single page
        fld.pop("sectionId", None)

    f["methods"] = [
        {
            "id": "patlasv4proto-prod-meth-import-csv",
            "name": "Importar CSV",
            "icon": "upload_file",
            "kind": "destaque",
            "inputFormId": "form-patlasv4-proto-metodo-cat-import-csv",
        },
        {"id": "patlasv4proto-prod-meth-export-csv", "name": "Exportar CSV", "icon": "download", "kind": "comum"},
        {"id": "patlasv4proto-prod-meth-export-pdf", "name": "Exportar PDF", "icon": "picture_as_pdf", "kind": "comum"},
        {"id": "patlasv4proto-prod-meth-enviar", "name": "Enviar para análise", "icon": "send", "kind": "destaque"},
        {
            "id": "patlasv4proto-prod-meth-aprovar",
            "name": "Aprovar",
            "icon": "check_circle",
            "kind": "destaque",
            "inputFormId": "form-patlasv4-proto-metodo-cat-aprovar",
        },
        {
            "id": "patlasv4proto-prod-meth-ajuste",
            "name": "Solicitar ajuste",
            "icon": "edit_note",
            "kind": "destaque",
            "inputFormId": "form-patlasv4-proto-metodo-cat-solicitar-ajuste",
        },
        {"id": "patlasv4proto-prod-meth-inativar", "name": "Inativar", "icon": "block", "kind": "comum"},
    ]

    f["exampleValuePresets"] = [
        {
            "id": "form-patlasv4-proto-cat-produto-p-host",
            "name": "Licença USN · Universal (Tipo 2/3)",
            "iconColor": "#0F6CBD",
            "fieldValues": {
                "form-patlasv4-proto-cat-produto-identificador": "MTI HOST - Infraestrutura",
                "form-patlasv4-proto-cat-produto-part-number": "HOST-INFRA-01",
                "form-patlasv4-proto-cat-produto-tipo": "Licença",
                "form-patlasv4-proto-cat-produto-grupo": "MTI Host",
                "form-patlasv4-proto-cat-produto-status": "Homologado",
                "form-patlasv4-proto-cat-produto-universal": True,
                "form-patlasv4-proto-cat-produto-individualizado": False,
                "form-patlasv4-proto-cat-produto-preencher-manual": False,
                "form-patlasv4-proto-cat-produto-modelo-venda": "Por Licença",
                "form-patlasv4-proto-cat-produto-metrica": "USN",
                "form-patlasv4-proto-cat-produto-cobranca": "Sob Demanda",
                "form-patlasv4-proto-cat-produto-valor-unitario": 1,
                "form-patlasv4-proto-cat-produto-fator-conversao": 1,
                "form-patlasv4-proto-cat-produto-unidade-dtic": "MTI/DTIC",
                "form-patlasv4-proto-cat-produto-parceria": "MTI HOST",
                "form-patlasv4-proto-cat-produto-catalogo": "MTI HOST",
                "form-patlasv4-proto-cat-produto-focal-vendas": "Bernardo de Souza Machado",
                "form-patlasv4-proto-cat-produto-observacoes": "Licenciamento USN — fator 1 no Tipo 3.",
            },
        },
        {
            "id": "form-patlasv4-proto-cat-produto-p-serv",
            "name": "Serviço UST · Universal+Individual (fator Tipo 3)",
            "iconColor": "#7c3aed",
            "fieldValues": {
                "form-patlasv4-proto-cat-produto-identificador": "Implantação MTI Simplifica",
                "form-patlasv4-proto-cat-produto-part-number": "SIMP-IMPL-01",
                "form-patlasv4-proto-cat-produto-tipo": "Serviço",
                "form-patlasv4-proto-cat-produto-grupo": "MTI Simplifica",
                "form-patlasv4-proto-cat-produto-status": "Ativo",
                "form-patlasv4-proto-cat-produto-universal": True,
                "form-patlasv4-proto-cat-produto-individualizado": True,
                "form-patlasv4-proto-cat-produto-preencher-manual": False,
                "form-patlasv4-proto-cat-produto-modelo-venda": "Serviço",
                "form-patlasv4-proto-cat-produto-metrica": "UST",
                "form-patlasv4-proto-cat-produto-cobranca": "Sob Demanda",
                "form-patlasv4-proto-cat-produto-valor-unitario": 22679,
                "form-patlasv4-proto-cat-produto-fator-conversao": 80.25,
                "form-patlasv4-proto-cat-produto-complexidade": "Média",
                "form-patlasv4-proto-cat-produto-coeficiente-complexidade": 1.0,
                "form-patlasv4-proto-cat-produto-peso": 1,
                "form-patlasv4-proto-cat-produto-qtde-hst-ust": 10,
                "form-patlasv4-proto-cat-produto-unidade-dtic": "MTI/DTIC",
                "form-patlasv4-proto-cat-produto-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-produto-catalogo": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-produto-focal-vendas": "Bernardo de Souza Machado",
                "form-patlasv4-proto-cat-produto-focal-posvendas": "Gabriel Estácio",
                "form-patlasv4-proto-cat-produto-observacoes": (
                    "Ex. Discovery: 22679 ÷ 282,58 ≈ 80,25. Pode vender no catálogo (Tipo 2/3) "
                    "ou individualizado (Tipo 1)."
                ),
            },
        },
        {
            "id": "form-patlasv4-proto-cat-produto-p-tipo1",
            "name": "Serviço · só Individualizado (Tipo 1 — sem fator)",
            "iconColor": "#b91c1c",
            "fieldValues": {
                "form-patlasv4-proto-cat-produto-identificador": "Criação de instância de computação",
                "form-patlasv4-proto-cat-produto-part-number": "HST-INST-01",
                "form-patlasv4-proto-cat-produto-tipo": "Serviço",
                "form-patlasv4-proto-cat-produto-grupo": "MTI Cloud",
                "form-patlasv4-proto-cat-produto-status": "Ativo",
                "form-patlasv4-proto-cat-produto-universal": False,
                "form-patlasv4-proto-cat-produto-individualizado": True,
                "form-patlasv4-proto-cat-produto-preencher-manual": False,
                "form-patlasv4-proto-cat-produto-modelo-venda": "Serviço",
                "form-patlasv4-proto-cat-produto-metrica": "HST",
                "form-patlasv4-proto-cat-produto-cobranca": "Sob Demanda",
                "form-patlasv4-proto-cat-produto-valor-unitario": 161.02,
                "form-patlasv4-proto-cat-produto-qtde-hst-ust": 1,
                "form-patlasv4-proto-cat-produto-unidade-dtic": "MTI/DTIC",
                "form-patlasv4-proto-cat-produto-catalogo": "MTI HOST",
                "form-patlasv4-proto-cat-produto-observacoes": (
                    "1 HST por execução (~30–40 min). Sem fator Tipo 3 (RN-P-03)."
                ),
            },
        },
        {
            "id": "form-patlasv4-proto-cat-produto-p-plano",
            "name": "Elaborar plano de projeto (UST · complexidade)",
            "iconColor": "#0d9488",
            "fieldValues": {
                "form-patlasv4-proto-cat-produto-identificador": "Elaborar plano de projeto",
                "form-patlasv4-proto-cat-produto-part-number": "SIMP-PP-10",
                "form-patlasv4-proto-cat-produto-tipo": "Serviço",
                "form-patlasv4-proto-cat-produto-grupo": "MTI Simplifica",
                "form-patlasv4-proto-cat-produto-status": "Ativo",
                "form-patlasv4-proto-cat-produto-universal": True,
                "form-patlasv4-proto-cat-produto-individualizado": False,
                "form-patlasv4-proto-cat-produto-modelo-venda": "Serviço",
                "form-patlasv4-proto-cat-produto-metrica": "UST",
                "form-patlasv4-proto-cat-produto-cobranca": "Sob Demanda",
                "form-patlasv4-proto-cat-produto-valor-unitario": 1610.2,
                "form-patlasv4-proto-cat-produto-fator-conversao": 5.7,
                "form-patlasv4-proto-cat-produto-complexidade": "Alta",
                "form-patlasv4-proto-cat-produto-coeficiente-complexidade": 1.2,
                "form-patlasv4-proto-cat-produto-qtde-hst-ust": 10,
                "form-patlasv4-proto-cat-produto-unidade-dtic": "MTI/DTIC",
                "form-patlasv4-proto-cat-produto-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-produto-catalogo": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-produto-observacoes": (
                    "10 UST cobrem o time (Lucas+Gabriel+Bernardo) — não é 10 horas."
                ),
            },
        },
    ]
    f["activeExamplePresetId"] = "form-patlasv4-proto-cat-produto-p-serv"


def patch_parceria(f: dict) -> None:
    f["metadata"] = (
        "Discovery: classe separada da Organização. N parcerias / 1 CNPJ. "
        "Primeiro cadastro pela MTI."
    )
    f["exampleValuePresets"] = [
        {
            "id": "form-patlasv4-proto-cat-parceria-p-simplifica",
            "name": "MTI SIMPLIFICA · EloGroup",
            "iconColor": "#7c3aed",
            "fieldValues": {
                "form-patlasv4-proto-cat-parceria-identificador": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-parceria-descricao": (
                    "<p>Parceria de serviços de desenvolvimento (UST) — EloGroup.</p>"
                ),
                "form-patlasv4-proto-cat-parceria-parceiro": "EloGroup / EloGP",
                "form-patlasv4-proto-cat-parceria-status": "Homologada",
                "form-patlasv4-proto-cat-parceria-solucoes": ["MTI Simplifica"],
            },
        },
        {
            "id": "form-patlasv4-proto-cat-parceria-p-host",
            "name": "MTI HOST · EloGroup",
            "iconColor": "#0F6CBD",
            "fieldValues": {
                "form-patlasv4-proto-cat-parceria-identificador": "MTI HOST",
                "form-patlasv4-proto-cat-parceria-descricao": (
                    "<p>Parceria de licenciamento/infraestrutura (USN/HST).</p>"
                ),
                "form-patlasv4-proto-cat-parceria-parceiro": "EloGroup / EloGP",
                "form-patlasv4-proto-cat-parceria-status": "Homologada",
                "form-patlasv4-proto-cat-parceria-solucoes": ["MTI Host"],
            },
        },
    ]
    f["activeExamplePresetId"] = "form-patlasv4-proto-cat-parceria-p-simplifica"


def patch_solucao(f: dict) -> None:
    f["metadata"] = (
        "Discovery: nome, parceria, descrição, fabricante (texto) e documentos "
        "(timbrado, Gartner, autorizações). Sem classe Fabricante."
    )
    f["exampleValuePresets"] = [
        {
            "id": "form-patlasv4-proto-cat-solucao-p-simplifica",
            "name": "MTI Simplifica",
            "iconColor": "#7c3aed",
            "fieldValues": {
                "form-patlasv4-proto-cat-solucao-identificador": "MTI Simplifica",
                "form-patlasv4-proto-cat-solucao-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-solucao-descricao": (
                    "<p>Solução de desenvolvimento e simplificação de processos.</p>"
                ),
                "form-patlasv4-proto-cat-solucao-fabricante-nome": "EloGroup",
                "form-patlasv4-proto-cat-solucao-fabricante-contato": "contato@elogroup.com.br",
                "form-patlasv4-proto-cat-solucao-documentos-apoio": "papel-timbrado-elogroup.pdf",
            },
        },
        {
            "id": "form-patlasv4-proto-cat-solucao-p-host",
            "name": "MTI Host",
            "iconColor": "#0F6CBD",
            "fieldValues": {
                "form-patlasv4-proto-cat-solucao-identificador": "MTI Host",
                "form-patlasv4-proto-cat-solucao-parceria": "MTI HOST",
                "form-patlasv4-proto-cat-solucao-descricao": "<p>Infraestrutura e hosting.</p>",
                "form-patlasv4-proto-cat-solucao-fabricante-nome": "EloGroup",
                "form-patlasv4-proto-cat-solucao-fabricante-contato": "hosting@elogroup.com.br",
            },
        },
    ]
    f["activeExamplePresetId"] = "form-patlasv4-proto-cat-solucao-p-simplifica"


def patch_universal(f: dict) -> None:
    f["exampleValuePresets"] = [
        {
            "id": "form-patlasv4-proto-cat-universal-p-mti",
            "name": "Catálogo Universal MTI (CGS)",
            "iconColor": "#0c4a6e",
            "fieldValues": {
                "form-patlasv4-proto-cat-universal-identificador": "Catálogo Universal MTI",
                "form-patlasv4-proto-cat-universal-status": "Ativo",
                "form-patlasv4-proto-cat-universal-catalogos": [
                    "MTI HOST",
                    "MTI SIMPLIFICA",
                ],
                "form-patlasv4-proto-cat-universal-cod-siag": "CU-MTI-001",
                "form-patlasv4-proto-cat-universal-cod-protheus": "CU-PTH-001",
            },
        }
    ]
    f["activeExamplePresetId"] = "form-patlasv4-proto-cat-universal-p-mti"


def patch_dados_parceria(f: dict) -> None:
    f["metadata"] = (
        "Anexo Sydle + modelo comercial. Markup e distribuição NÃO ficam no Produto "
        "(RN-P-05). Discovery citou markup na tela; consolidado nesta classe."
    )
    f["exampleValuePresets"] = [
        {
            "id": "form-patlasv4-proto-cat-dados-parceria-p-host",
            "name": "EloGroup × MTI Host",
            "fieldValues": {
                "form-patlasv4-proto-cat-dados-parceria-parceria": "MTI HOST",
                "form-patlasv4-proto-cat-dados-parceria-solucao": "MTI Host",
                "form-patlasv4-proto-cat-dados-parceria-vigencia": "12 Meses",
                "form-patlasv4-proto-cat-dados-parceria-custo-parceiro": 1000,
                "form-patlasv4-proto-cat-dados-parceria-markup": 1.18,
                "form-patlasv4-proto-cat-dados-parceria-dist-parceiro": 84,
                "form-patlasv4-proto-cat-dados-parceria-dist-mti": 16,
            },
        },
        {
            "id": "form-patlasv4-proto-cat-dados-parceria-p-simplifica",
            "name": "EloGroup × MTI Simplifica",
            "fieldValues": {
                "form-patlasv4-proto-cat-dados-parceria-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-dados-parceria-solucao": "MTI Simplifica",
                "form-patlasv4-proto-cat-dados-parceria-vigencia": "24 Meses",
                "form-patlasv4-proto-cat-dados-parceria-custo-parceiro": 120,
                "form-patlasv4-proto-cat-dados-parceria-markup": 1.34,
                "form-patlasv4-proto-cat-dados-parceria-dist-parceiro": 80,
                "form-patlasv4-proto-cat-dados-parceria-dist-mti": 20,
            },
        },
    ]
    f["activeExamplePresetId"] = "form-patlasv4-proto-cat-dados-parceria-p-simplifica"


def patch_params(forms_by_id: dict) -> None:
    # Métrica
    m = forms_by_id["form-patlasv4-proto-cat-metrica"]
    m["metadata"] = "Métricas universais Discovery: USN (licença), UST (dev), HST (hora técnica)."
    m["exampleValuePresets"] = [
        {
            "id": "p-metrica-usn",
            "name": "USN",
            "fieldValues": {
                "form-patlasv4-proto-cat-metrica-identificador": "USN",
                "form-patlasv4-proto-cat-metrica-descricao": (
                    "Licenciamento software/IaaS. Tipo 2/3. Fator tipicamente 1."
                ),
            },
        },
        {
            "id": "p-metrica-ust",
            "name": "UST",
            "fieldValues": {
                "form-patlasv4-proto-cat-metrica-identificador": "UST",
                "form-patlasv4-proto-cat-metrica-descricao": (
                    "Unidade de Serviço Técnico — não linear com hora; complexidade do time."
                ),
            },
        },
        {
            "id": "p-metrica-hst",
            "name": "HST",
            "fieldValues": {
                "form-patlasv4-proto-cat-metrica-identificador": "HST",
                "form-patlasv4-proto-cat-metrica-descricao": (
                    "Hora de Serviço Técnico — equivalência com hora de profissional."
                ),
            },
        },
    ]
    m["activeExamplePresetId"] = "p-metrica-ust"

    g = forms_by_id["form-patlasv4-proto-cat-grupo"]
    g["exampleValuePresets"] = [
        {
            "id": "p-grupo-host",
            "name": "MTI Host",
            "fieldValues": {
                "form-patlasv4-proto-cat-grupo-identificador": "MTI Host",
                "form-patlasv4-proto-cat-grupo-descricao": "Infraestrutura e hosting",
            },
        },
        {
            "id": "p-grupo-simplifica",
            "name": "MTI Simplifica",
            "fieldValues": {
                "form-patlasv4-proto-cat-grupo-identificador": "MTI Simplifica",
                "form-patlasv4-proto-cat-grupo-descricao": "Serviços de desenvolvimento",
            },
        },
        {
            "id": "p-grupo-cloud",
            "name": "MTI Cloud",
            "fieldValues": {
                "form-patlasv4-proto-cat-grupo-identificador": "MTI Cloud",
                "form-patlasv4-proto-cat-grupo-descricao": "Serviços cloud / HST",
            },
        },
    ]
    g["activeExamplePresetId"] = "p-grupo-simplifica"

    c = forms_by_id["form-patlasv4-proto-cat-categoria"]
    c["metadata"] = (
        "Anexo Sydle [Atlas] Produtos. Parametrização de categorias; "
        "confirmar nomenclatura com MTI se necessário."
    )
    c["exampleValuePresets"] = [
        {
            "id": "p-cat-cloud",
            "name": "Cloud / Infra",
            "fieldValues": {
                "form-patlasv4-proto-cat-categoria-identificador": "Cloud / Infra",
                "form-patlasv4-proto-cat-categoria-descricao": "Licenças e infraestrutura",
            },
        },
        {
            "id": "p-cat-dev",
            "name": "Desenvolvimento",
            "fieldValues": {
                "form-patlasv4-proto-cat-categoria-identificador": "Desenvolvimento",
                "form-patlasv4-proto-cat-categoria-descricao": "Serviços UST / projetos",
            },
        },
    ]
    c["activeExamplePresetId"] = "p-cat-dev"

    mv = forms_by_id["form-patlasv4-proto-cat-modelo-venda"]
    mv["exampleValuePresets"] = [
        {
            "id": "p-mv-licenca",
            "name": "Por Licença",
            "fieldValues": {
                "form-patlasv4-proto-cat-modelo-venda-identificador": "Por Licença",
                "form-patlasv4-proto-cat-modelo-venda-descricao": "Comercialização unitária de licença",
            },
        },
        {
            "id": "p-mv-servico",
            "name": "Serviço",
            "fieldValues": {
                "form-patlasv4-proto-cat-modelo-venda-identificador": "Serviço",
                "form-patlasv4-proto-cat-modelo-venda-descricao": "Prestação sob demanda / UST-HST",
            },
        },
        {
            "id": "p-mv-homolog",
            "name": "Homologação",
            "fieldValues": {
                "form-patlasv4-proto-cat-modelo-venda-identificador": "Homologação",
                "form-patlasv4-proto-cat-modelo-venda-descricao": "Modelo de homologação",
            },
        },
    ]
    mv["activeExamplePresetId"] = "p-mv-servico"

    tc = forms_by_id["form-patlasv4-proto-cat-tipo-cobranca"]
    tc["exampleValuePresets"] = [
        {
            "id": "p-tc-sob",
            "name": "Sob Demanda",
            "fieldValues": {
                "form-patlasv4-proto-cat-tipo-cobranca-modelo": "Sob Demanda",
                "form-patlasv4-proto-cat-tipo-cobranca-recorrencia": "Por Execução",
            },
        },
        {
            "id": "p-tc-mensal",
            "name": "Mensal",
            "fieldValues": {
                "form-patlasv4-proto-cat-tipo-cobranca-modelo": "Mensal",
                "form-patlasv4-proto-cat-tipo-cobranca-recorrencia": "Mensal",
            },
        },
        {
            "id": "p-tc-anual",
            "name": "Anual",
            "fieldValues": {
                "form-patlasv4-proto-cat-tipo-cobranca-modelo": "Anual",
                "form-patlasv4-proto-cat-tipo-cobranca-recorrencia": "Anual",
            },
        },
        {
            "id": "p-tc-homolog",
            "name": "Homologação",
            "fieldValues": {
                "form-patlasv4-proto-cat-tipo-cobranca-modelo": "Homologação",
                "form-patlasv4-proto-cat-tipo-cobranca-recorrencia": "Por Homologação",
            },
        },
    ]
    tc["activeExamplePresetId"] = "p-tc-sob"


def patch_workspace(ws: list) -> None:
    pkg = {
        "id": "pkg-fase-2-catalogo",
        "name": "Fase 2 · Catálogo & Produtos",
        "classes": [
            {
                "id": "cls-mapa-catalogo",
                "name": "Catálogo",
                "linkedFormId": "form-patlasv4-proto-cat-catalogo",
                "linkedFormExamplePresetIds": [
                    "form-patlasv4-proto-cat-catalogo-p-host",
                    "form-patlasv4-proto-cat-catalogo-p-simplifica",
                    "form-patlasv4-proto-cat-catalogo-p-simplifica-17",
                ],
            },
            {
                "id": "cls-mapa-catalogo-universal",
                "name": "Catálogo Universal",
                "linkedFormId": "form-patlasv4-proto-cat-universal",
                "linkedFormExamplePresetIds": ["form-patlasv4-proto-cat-universal-p-mti"],
            },
            {
                "id": "cls-mapa-produto",
                "name": "Produto",
                "linkedFormId": "form-patlasv4-proto-cat-produto",
                "linkedFormExamplePresetIds": [
                    "form-patlasv4-proto-cat-produto-p-host",
                    "form-patlasv4-proto-cat-produto-p-serv",
                    "form-patlasv4-proto-cat-produto-p-tipo1",
                    "form-patlasv4-proto-cat-produto-p-plano",
                ],
            },
            {
                "id": "cls-mapa-solucao",
                "name": "Solução",
                "linkedFormId": "form-patlasv4-proto-cat-solucao",
                "linkedFormExamplePresetIds": [
                    "form-patlasv4-proto-cat-solucao-p-simplifica",
                    "form-patlasv4-proto-cat-solucao-p-host",
                ],
            },
            {
                "id": "cls-mapa-parceria-cat",
                "name": "Parceria",
                "linkedFormId": "form-patlasv4-proto-cat-parceria",
                "linkedFormExamplePresetIds": [
                    "form-patlasv4-proto-cat-parceria-p-simplifica",
                    "form-patlasv4-proto-cat-parceria-p-host",
                ],
            },
            {
                "id": "cls-mapa-dados-parceria",
                "name": "Dados de Parceria por Produto",
                "linkedFormId": "form-patlasv4-proto-cat-dados-parceria",
                "linkedFormExamplePresetIds": [
                    "form-patlasv4-proto-cat-dados-parceria-p-host",
                    "form-patlasv4-proto-cat-dados-parceria-p-simplifica",
                ],
            },
            {
                "id": "cls-mapa-metrica",
                "name": "Métrica",
                "linkedFormId": "form-patlasv4-proto-cat-metrica",
                "linkedFormExamplePresetIds": ["p-metrica-usn", "p-metrica-ust", "p-metrica-hst"],
            },
            {
                "id": "cls-mapa-tipo-cobranca",
                "name": "Tipo de Cobrança",
                "linkedFormId": "form-patlasv4-proto-cat-tipo-cobranca",
                "linkedFormExamplePresetIds": [
                    "p-tc-sob",
                    "p-tc-mensal",
                    "p-tc-anual",
                    "p-tc-homolog",
                ],
            },
            {
                "id": "cls-mapa-grupo-cat",
                "name": "Grupo",
                "linkedFormId": "form-patlasv4-proto-cat-grupo",
                "linkedFormExamplePresetIds": [
                    "p-grupo-host",
                    "p-grupo-simplifica",
                    "p-grupo-cloud",
                ],
            },
            {
                "id": "cls-mapa-modelo-venda",
                "name": "Modelo de Venda",
                "linkedFormId": "form-patlasv4-proto-cat-modelo-venda",
                "linkedFormExamplePresetIds": ["p-mv-licenca", "p-mv-servico", "p-mv-homolog"],
            },
            {
                "id": "cls-mapa-categoria",
                "name": "Categoria de Serviços",
                "linkedFormId": "form-patlasv4-proto-cat-categoria",
                "linkedFormExamplePresetIds": ["p-cat-cloud", "p-cat-dev"],
            },
        ],
    }
    for w in ws:
        packages = w.get("packages") or []
        found = False
        for i, p in enumerate(packages):
            if p.get("id") == "pkg-fase-2-catalogo":
                packages[i] = pkg
                found = True
                break
        if not found:
            packages.append(pkg)
        w["packages"] = packages


def patch_class_groups(cg: dict) -> None:
    assign = cg.setdefault("assignments", {})
    for mid in [
        "form-patlasv4-proto-metodo-cat-nova-versao",
        "form-patlasv4-proto-metodo-cat-import-csv",
        "form-patlasv4-proto-metodo-cat-aprovar",
        "form-patlasv4-proto-metodo-cat-solicitar-ajuste",
    ]:
        assign[mid] = "grp-atlas-produtos-met"
    order = cg.setdefault("memberOrderByGroup", {})
    order["grp-atlas-produtos-met"] = [
        "form-patlasv4-proto-metodo-cat-nova-versao",
        "form-patlasv4-proto-metodo-cat-import-csv",
        "form-patlasv4-proto-metodo-cat-aprovar",
        "form-patlasv4-proto-metodo-cat-solicitar-ajuste",
    ]
    # ensure main product classes order matches Sydle annex
    order["grp-atlas-produtos"] = [
        "form-patlasv4-proto-cat-catalogo",
        "form-patlasv4-proto-cat-universal",
        "form-patlasv4-proto-cat-categoria",
        "form-patlasv4-proto-cat-dados-parceria",
        "form-patlasv4-proto-cat-grupo",
        "form-patlasv4-proto-cat-metrica",
        "form-patlasv4-proto-cat-modelo-venda",
        "form-patlasv4-proto-cat-produto",
        "form-patlasv4-proto-cat-solucao",
        "form-patlasv4-proto-cat-tipo-cobranca",
    ]


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    by_id = {f["id"]: f for f in forms}

    for mf in [
        method_nova_versao(),
        method_import_csv(),
        method_aprovar(),
        method_solicitar_ajuste(),
    ]:
        upsert(forms, mf, after_id="form-patlasv4-proto-cat-catalogo")
        by_id[mf["id"]] = mf

    # refresh by_id after upserts
    by_id = {f["id"]: f for f in forms}

    patch_catalogo(by_id["form-patlasv4-proto-cat-catalogo"])
    patch_produto(by_id["form-patlasv4-proto-cat-produto"])
    patch_parceria(by_id["form-patlasv4-proto-cat-parceria"])
    patch_solucao(by_id["form-patlasv4-proto-cat-solucao"])
    patch_universal(by_id["form-patlasv4-proto-cat-universal"])
    patch_dados_parceria(by_id["form-patlasv4-proto-cat-dados-parceria"])
    patch_params(by_id)

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    ws = json.loads(WS.read_text(encoding="utf-8"))
    patch_workspace(ws)
    WS.write_text(json.dumps(ws, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    cg = json.loads(CG.read_text(encoding="utf-8"))
    patch_class_groups(cg)
    CG.write_text(json.dumps(cg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("OK — Catálogo/Produtos alinhados à Discovery + Sydle")


if __name__ == "__main__":
    main()
