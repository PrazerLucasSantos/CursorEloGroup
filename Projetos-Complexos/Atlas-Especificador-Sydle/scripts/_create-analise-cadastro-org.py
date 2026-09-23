# -*- coding: utf-8 -*-
"""Cria a classe Análise de cadastro da organização (Atlas)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPIC = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS_PATH = EPIC / "forms.json"
WS_PATH = EPIC / "workspaces.json"
CG_PATH = EPIC / "class-groups.json"

FORM_ID = "form-patlasv4-proto-analise-cadastro-org"
ORG_FORM = "form-patlasv4-proto-unidade-organizacional"
PESSOA_FORM = "form-patlasv4-proto-pessoa"

ALERT_HTML = """<div class="proto-alert proto-alert--info">
  <strong>Análise de cadastro</strong>
  <p>Revise os dados enviados pelo portal (parceiro ou cliente). Ao final, escolha Aprovar, Reprovar ou Solicitar ajuste e assine a decisão.</p>
</div>
<style>
  .proto-alert { margin: 0 0 12px; padding: 10px 12px; border-radius: 8px; border: 1px solid #0ea5e966; background: #f0f9ff; color: #0c4a6e; font-size: 0.9rem; }
  .proto-alert p { margin: 4px 0 0; }
</style>"""


def build_form() -> dict:
    return {
        "id": FORM_ID,
        "name": "Análise de cadastro da organização",
        "sectionLayout": "accordion",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Classe Atlas — análise do cadastro enviado pelo portal (parceiro/cliente). "
            "Exibe a Organização em modo leitura e registra a decisão MTI: Aprovar, Reprovar ou Solicitar ajuste. "
            "Justificativa e anexo aparecem em Reprovar e Solicitar ajuste; assinatura é obrigatória em todas as opções. "
            "Não é método da classe Organização."
        ),
        "sections": [
            {
                "id": "sec-analise-org-cadastro",
                "title": "Organização (dados do portal)",
                "icon": "apartment",
            },
            {
                "id": "sec-analise-org-decisao",
                "title": "Decisão",
                "icon": "fact_check",
            },
            {
                "id": "sec-analise-org-assinatura",
                "title": "Assinatura",
                "icon": "draw",
            },
        ],
        "fields": [
            {
                "id": "patlasv4proto-analise-html-intro",
                "type": "html",
                "label": "",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-analise-org-cadastro",
                "htmlContent": ALERT_HTML,
                "spec": "Contexto da análise MTI sobre o cadastro preenchido no portal.",
            },
            {
                "id": "patlasv4proto-analise-origem",
                "label": "Origem do preenchimento",
                "type": "textOptions",
                "size": "medium",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-analise-org-cadastro",
                "options": ["Portal do Parceiro", "Portal do Cliente"],
                "spec": "Indica de qual portal vieram os dados analisados.",
            },
            {
                "id": "patlasv4proto-analise-status-atual",
                "label": "Status atual da habilitação",
                "type": "textOptions",
                "size": "large",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-analise-org-cadastro",
                "options": [
                    "Incompleta",
                    "Em apresentação",
                    "Completa – aguardando MTI",
                    "Aprovada pela MTI",
                    "Reprovada pela MTI",
                ],
                "spec": "Espelho do status da organização no momento da análise.",
            },
            {
                "id": "patlasv4proto-analise-organizacao",
                "label": "Organização",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": True,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-analise-org-cadastro",
                "linkedFormId": ORG_FORM,
                "embeddedDisplay": "form",
                "spec": (
                    "Classe Organização embutida (somente leitura) com os dados preenchidos "
                    "pelo parceiro/cliente no portal."
                ),
            },
            # --- Decisão ---
            {
                "id": "patlasv4proto-analise-alerta-decisao",
                "label": "Decisão da análise",
                "type": "alert",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-analise-org-decisao",
                "alertVariant": "info",
                "alertTitle": "Selecione o resultado",
                "alertMessage": (
                    "Aprovar → status \"Aprovada pela MTI\" e libera acesso comercial. "
                    "Solicitar ajuste → volta para \"Em apresentação\" e notifica o responsável. "
                    "Reprovar → status \"Reprovada pela MTI\" (rejeição definitiva)."
                ),
            },
            {
                "id": "patlasv4proto-analise-decisao",
                "label": "Decisão",
                "type": "textOptions",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-analise-org-decisao",
                "options": ["Aprovar", "Reprovar", "Solicitar ajuste"],
                "spec": "Resultado da análise MTI. Obrigatório.",
            },
            {
                "id": "patlasv4proto-analise-novo-status",
                "label": "Novo status (após confirmar)",
                "type": "text",
                "size": "medium",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-analise-org-decisao",
                "spec": "Calculado conforme a decisão: Aprovada / Reprovada / Em apresentação.",
            },
            {
                "id": "patlasv4proto-analise-justificativa",
                "label": "Justificativa",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-analise-org-decisao",
                "hidden": True,
                "textLong": True,
                "spec": (
                    "Obrigatória em Reprovar e Solicitar ajuste. "
                    "Comunicada ao responsável da organização."
                ),
            },
            {
                "id": "patlasv4proto-analise-anexo",
                "label": "Anexo",
                "type": "file",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-analise-org-decisao",
                "hidden": True,
                "spec": (
                    "Anexo de apoio (parecer, checklist, print do item a corrigir). "
                    "Exibido em Reprovar e Solicitar ajuste."
                ),
            },
            {
                "id": "patlasv4proto-analise-observacao",
                "label": "Observação (opcional)",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-analise-org-decisao",
                "hidden": True,
                "textLong": True,
                "spec": "Observação livre — típica na aprovação.",
            },
            # --- Assinatura (sempre) ---
            {
                "id": "patlasv4proto-analise-assinado-por",
                "label": "Assinado por",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-analise-org-assinatura",
                "linkedFormId": PESSOA_FORM,
                "options": [
                    "Bernardo de Souza Machado",
                    "Lucas dos Santos",
                    "Helena Ribeiro Lima",
                ],
                "spec": "Analista MTI responsável pela decisão.",
            },
            {
                "id": "patlasv4proto-analise-data-assinatura",
                "label": "Data da assinatura",
                "type": "date",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-analise-org-assinatura",
                "spec": "Data/hora em que a assinatura digital é confirmada.",
            },
            {
                "id": "patlasv4proto-analise-assinatura",
                "label": "Confirmar assinatura digital",
                "type": "boolean",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-analise-org-assinatura",
                "spec": "Obrigatória para Aprovar, Reprovar e Solicitar ajuste.",
            },
        ],
        "fieldVisibilityRules": [
            {
                "id": "rule-analise-show-justificativa-reprovar",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-analise-decisao",
                "sourceKind": "textOptions",
                "expectedOptionText": "Reprovar",
                "action": "show",
                "targetFieldIds": [
                    "patlasv4proto-analise-justificativa",
                    "patlasv4proto-analise-anexo",
                ],
            },
            {
                "id": "rule-analise-show-justificativa-ajuste",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-analise-decisao",
                "sourceKind": "textOptions",
                "expectedOptionText": "Solicitar ajuste",
                "action": "show",
                "targetFieldIds": [
                    "patlasv4proto-analise-justificativa",
                    "patlasv4proto-analise-anexo",
                ],
            },
            {
                "id": "rule-analise-show-obs-aprovar",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-analise-decisao",
                "sourceKind": "textOptions",
                "expectedOptionText": "Aprovar",
                "action": "show",
                "targetFieldIds": ["patlasv4proto-analise-observacao"],
            },
        ],
        "exampleValuePresets": [
            {
                "id": "patlasv4proto-p-analise-cadastro-parceiro-aprovar",
                "name": "Parceiro — Aprovar (EloGroup)",
                "iconColor": "#16a34a",
                "fieldValues": {
                    "patlasv4proto-analise-origem": "Portal do Parceiro",
                    "patlasv4proto-analise-status-atual": "Completa – aguardando MTI",
                    "patlasv4proto-analise-decisao": "Aprovar",
                    "patlasv4proto-analise-novo-status": "Aprovada pela MTI",
                    "patlasv4proto-analise-observacao": "Documentação MIPP completa e validada.",
                    "patlasv4proto-analise-assinado-por": "Bernardo de Souza Machado",
                    "patlasv4proto-analise-data-assinatura": "03/08/2026",
                    "patlasv4proto-analise-assinatura": True,
                },
                "embeddedRowsByFieldId": {
                    "patlasv4proto-analise-organizacao": [org_row_parceiro_aguardando()],
                },
            },
            {
                "id": "patlasv4proto-p-analise-cadastro-parceiro-ajuste",
                "name": "Parceiro — Solicitar ajuste",
                "iconColor": "#ca8a04",
                "fieldValues": {
                    "patlasv4proto-analise-origem": "Portal do Parceiro",
                    "patlasv4proto-analise-status-atual": "Completa – aguardando MTI",
                    "patlasv4proto-analise-decisao": "Solicitar ajuste",
                    "patlasv4proto-analise-novo-status": "Em apresentação",
                    "patlasv4proto-analise-justificativa": (
                        "O CNPJ anexado está ilegível. Reenvie o documento atualizado e legível "
                        "e complete o grupo Qualificação Econômica e Financeira."
                    ),
                    "patlasv4proto-analise-anexo": "checklist-ajuste-mipp.pdf",
                    "patlasv4proto-analise-assinado-por": "Bernardo de Souza Machado",
                    "patlasv4proto-analise-data-assinatura": "03/08/2026",
                    "patlasv4proto-analise-assinatura": True,
                },
                "embeddedRowsByFieldId": {
                    "patlasv4proto-analise-organizacao": [org_row_parceiro_aguardando()],
                },
            },
            {
                "id": "patlasv4proto-p-analise-cadastro-parceiro-reprovar",
                "name": "Parceiro — Reprovar",
                "iconColor": "#b91c1c",
                "fieldValues": {
                    "patlasv4proto-analise-origem": "Portal do Parceiro",
                    "patlasv4proto-analise-status-atual": "Completa – aguardando MTI",
                    "patlasv4proto-analise-decisao": "Reprovar",
                    "patlasv4proto-analise-novo-status": "Reprovada pela MTI",
                    "patlasv4proto-analise-justificativa": (
                        "Documentação insuficiente / não atende aos requisitos MIPP. "
                        "Cadastro reprovado definitivamente."
                    ),
                    "patlasv4proto-analise-anexo": "parecer-reprovacao.pdf",
                    "patlasv4proto-analise-assinado-por": "Bernardo de Souza Machado",
                    "patlasv4proto-analise-data-assinatura": "03/08/2026",
                    "patlasv4proto-analise-assinatura": True,
                },
                "embeddedRowsByFieldId": {
                    "patlasv4proto-analise-organizacao": [org_row_parceiro_aguardando()],
                },
            },
            {
                "id": "patlasv4proto-p-analise-cadastro-cliente-aprovar",
                "name": "Cliente — Aprovar",
                "iconColor": "#0F6CBD",
                "fieldValues": {
                    "patlasv4proto-analise-origem": "Portal do Cliente",
                    "patlasv4proto-analise-status-atual": "Completa – aguardando MTI",
                    "patlasv4proto-analise-decisao": "Aprovar",
                    "patlasv4proto-analise-novo-status": "Aprovada pela MTI",
                    "patlasv4proto-analise-observacao": "Cadastro cliente validado.",
                    "patlasv4proto-analise-assinado-por": "Bernardo de Souza Machado",
                    "patlasv4proto-analise-data-assinatura": "03/08/2026",
                    "patlasv4proto-analise-assinatura": True,
                },
                "embeddedRowsByFieldId": {
                    "patlasv4proto-analise-organizacao": [org_row_cliente_aguardando()],
                },
            },
        ],
        "activeExamplePresetId": "patlasv4proto-p-analise-cadastro-parceiro-ajuste",
        "methods": [],
    }


def org_row_parceiro_aguardando() -> dict:
    return {
        "patlasv4proto-uo-nome": "EloGroup",
        "patlasv4proto-uo-sigla": "ELO",
        "patlasv4proto-uo-nivel": 0,
        "patlasv4proto-uo-contato-email-principal": "contato@elogroup.com.br",
        "patlasv4proto-uo-tipo-organizacao": "Parceiro",
        "patlasv4proto-uo-produto-parceria": "Parceria EloGroup — MTI Simplifica",
        "patlasv4proto-uo-ativo": True,
        "patlasv4proto-uo-empresa": True,
        "patlasv4proto-uo-habilitacao-status": "Completa – aguardando MTI",
        "patlasv4proto-uo-prog-juridica": "12/19",
        "patlasv4proto-uo-prog-tecnica": "6/10",
        "patlasv4proto-uo-prog-financeira": "4/11",
        "patlasv4proto-uo-prog-compliance": "0/—",
        "patlasv4proto-uo-grupos-mipp-referencia": [
            "Habilitação Jurídica",
            "Qualificação Técnica",
        ],
        "patlasv4proto-uo-etapas-selecao": [
            "Habilitação documental",
            "Execução da parceria",
        ],
        "patlasv4proto-uo-acesso-comercial": False,
        "patlasv4proto-uo-nda-assinado": False,
        "patlasv4proto-uo-contato-emails": {
            "embeddedDemoInstances": [
                {
                    "patlasv4proto-peml-tipo": "Comercial",
                    "patlasv4proto-peml-email": "contato@elogroup.com.br",
                }
            ]
        },
        "patlasv4proto-uo-contato-telefones": {
            "embeddedDemoInstances": [
                {
                    "patlasv4proto-ptel-tipo": "Celular",
                    "patlasv4proto-ptel-pais": "Brasil",
                    "patlasv4proto-ptel-ddi": "+55",
                    "patlasv4proto-ptel-numero": "(11) 3000-0000",
                }
            ]
        },
    }


def org_row_cliente_aguardando() -> dict:
    return {
        "patlasv4proto-uo-nome": "Secretaria de Estado de Planejamento e Gestão",
        "patlasv4proto-uo-sigla": "SEPLAG",
        "patlasv4proto-uo-nivel": 0,
        "patlasv4proto-uo-contato-email-principal": "cadastro@seplag.mt.gov.br",
        "patlasv4proto-uo-tipo-organizacao": "Cliente",
        "patlasv4proto-uo-ativo": True,
        "patlasv4proto-uo-empresa": True,
        "patlasv4proto-uo-habilitacao-status": "Completa – aguardando MTI",
        "patlasv4proto-uo-acesso-comercial": False,
        "patlasv4proto-uo-nda-assinado": False,
    }


def upsert_form(forms: list[dict], form: dict) -> None:
    for i, f in enumerate(forms):
        if f.get("id") == form["id"]:
            forms[i] = form
            return
    # inserir após a classe Organização
    for i, f in enumerate(forms):
        if f.get("id") == ORG_FORM:
            forms.insert(i + 1, form)
            return
    forms.append(form)


def patch_workspaces(ws: list[dict]) -> None:
    entry = {
        "id": "cls-mapa-analise-cadastro-org",
        "name": "Análise de cadastro da organização",
        "linkedFormId": FORM_ID,
        "linkedFormExamplePresetIds": [
            "patlasv4proto-p-analise-cadastro-parceiro-aprovar",
            "patlasv4proto-p-analise-cadastro-parceiro-ajuste",
            "patlasv4proto-p-analise-cadastro-parceiro-reprovar",
            "patlasv4proto-p-analise-cadastro-cliente-aprovar",
        ],
    }
    for w in ws:
        for pkg in w.get("packages") or []:
            classes = pkg.get("classes") or []
            # remove se já existir
            classes = [c for c in classes if c.get("id") != entry["id"] and c.get("linkedFormId") != FORM_ID]
            if pkg.get("id") == "pkg-mapa-portal-f1":
                # após onboarding org
                idx = next(
                    (
                        i + 1
                        for i, c in enumerate(classes)
                        if c.get("linkedFormId") == "form-patlasv4-proto-portal-onboarding-org"
                    ),
                    len(classes),
                )
                classes.insert(idx, entry)
                pkg["classes"] = classes
                return
            pkg["classes"] = classes
    # fallback: primeiro workspace
    if ws and ws[0].get("packages"):
        ws[0]["packages"][0].setdefault("classes", []).append(entry)


def patch_class_groups(cg: dict) -> None:
    assignments = cg.setdefault("assignments", {})
    assignments[FORM_ID] = "grp-01-organizacao"
    order = cg.setdefault("memberOrderByGroup", {})
    members = list(order.get("grp-01-organizacao") or [])
    if FORM_ID not in members:
        # logo após Organização
        if "form-patlasv4-proto-unidade-organizacional" in members:
            i = members.index("form-patlasv4-proto-unidade-organizacional")
            members.insert(i + 1, FORM_ID)
        else:
            members.append(FORM_ID)
    order["grp-01-organizacao"] = members


def main() -> None:
    forms = json.loads(FORMS_PATH.read_text(encoding="utf-8"))
    upsert_form(forms, build_form())
    FORMS_PATH.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    ws = json.loads(WS_PATH.read_text(encoding="utf-8"))
    patch_workspaces(ws)
    WS_PATH.write_text(json.dumps(ws, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    cg = json.loads(CG_PATH.read_text(encoding="utf-8"))
    patch_class_groups(cg)
    CG_PATH.write_text(json.dumps(cg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("OK", FORM_ID)


if __name__ == "__main__":
    main()
