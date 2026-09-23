#!/usr/bin/env python3
"""Implementa visão do cliente sobre documentos (reunião 19/06/2026) no protótipo Atlas."""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPIC = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS_PATH = EPIC / "forms.json"
GROUPS_PATH = EPIC / "class-groups.json"

GRUPO_FIELD_TDOC = "mqlh5j3aabnkci"
GRUPO_FIELD_UODOC = "mqlh6yafch5jzb"

GRUPOS = [
    "Habilitação Jurídica",
    "Qualificação Técnica",
    "Qualificação Econômica e Financeira",
    "Compliance (adendo)",
]

MIPP_NOMES = [
    "Ato constitutivo e ata de eleição de administradores (S.A.)",
    "Ato constitutivo, estatuto ou contrato social em vigor (sociedade empresária)",
    "Inscrição do ato constitutivo no Registro Mercantil (sociedade simples) + diretoria",
    "CCMEI + CPF e RG (MEI)",
    "Registro na Junta Comercial (empresa individual)",
    "Prova de inscrição no CNPJ",
    "Cédula de Identidade (RG) e CPF",
    "Procuração e documentos do representante legal",
    "Certidão negativa de falência ou recuperação judicial",
    "Certidão de débitos relativos a créditos tributários federais e dívida ativa da União",
    "Prova de regularidade fiscal com a Fazenda Federal (RFB)",
    "Prova de regularidade com o FGTS",
    "Prova de regularidade fiscal com a Fazenda Estadual (SEFAZ/PGE)",
    "Prova de regularidade fiscal com a Fazenda Municipal",
    "Cadastro Nacional de Empresas Inidôneas e Suspensas (CGU)",
    "Certidão negativa de licitantes inidôneos (TCU)",
    "Certidão de empresa inidônea da CGE-MT",
    "Lista de inidôneos TCE/MT ou certidão negativa",
    "Certidão de improbidade administrativa e inelegibilidade (CNJ)",
    "Atestado de capacidade técnica e qualificação de equipe",
    "Comprovação de aptidão para desempenho de atividade pertinente",
    "Histórico de negócios com a Administração Pública",
    "Proposta de transferência de conhecimento ou tecnologia para a MTI",
    "Proposta de capacitação e/ou mentoring para a MTI",
    "Premiações",
    "Trabalhos realizados com sucesso na Administração Pública",
    "Certificados reconhecidos internacionalmente",
    "Certificado de qualificação técnica (fabricantes ou clientes)",
    "Notório reconhecimento do mercado do ramo de atividade",
    "Balanço Patrimonial (último exercício)",
    "Demonstração do Resultado do Exercício (DRE)",
    "Demonstração das Mutações do Patrimônio Líquido (DMPL)",
    "Demonstração dos Fluxos de Caixa (DFC)",
    "Demonstração de Valor Adicionado (DVA)",
    "Notas Explicativas",
    "Índice de Liquidez Corrente",
    "Índice de Liquidez Seca",
    "Índice de Liquidez Imediata",
    "Índice de Liquidez Geral",
    "Índice de Solvência",
]

FORM_UO_DOC_EXEC = {
    "id": "form-patlasv4-proto-uo-doc-execucao",
    "name": "Documento de execução da parceria",
    "sectionLayout": "none",
    "metadata": (
        "Modelos operacionais da org raiz — papel timbrado, modelo de proposta/contrato. "
        "Separado da grade MIPP de habilitação (decisão Luiz 19/06/2026)."
    ),
    "fields": [
        {
            "id": "patlasv4proto-uodexec-tipo",
            "label": "Tipo",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "identity",
            "options": [
                "Papel timbrado",
                "Modelo de proposta",
                "Modelo de contrato",
                "Modelo de ordem de serviço",
                "Outro modelo operacional",
            ],
            "spec": "Documentos de execução — não entram na habilitação MIPP.",
        },
        {
            "id": "patlasv4proto-uodexec-arquivo",
            "label": "Arquivo",
            "type": "file",
            "size": "medium",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "common",
            "spec": "PDF/DOCX do modelo.",
        },
        {
            "id": "patlasv4proto-uodexec-data-anexo",
            "label": "Data do anexo",
            "type": "date",
            "size": "small",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "spec": "Preenchida no upload.",
        },
        {
            "id": "patlasv4proto-uodexec-ativo",
            "label": "Ativo",
            "type": "boolean",
            "size": "small",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "common",
        },
        {
            "id": "patlasv4proto-uodexec-observacao",
            "label": "Observação",
            "type": "text",
            "size": "medium",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "textLong": True,
        },
    ],
    "exampleValuePresets": [],
}

FORM_PROPOSTA_BLOCO = {
    "id": "form-patlasv4-proto-proposta-bloco-produto",
    "name": "PR — Bloco por produto",
    "sectionLayout": "none",
    "metadata": (
        "Formulário e aprovação independente por produto/grupo (decisão Luiz 19/06/2026). "
        "PDF final só após todos os blocos aprovados."
    ),
    "fields": [
        {
            "id": "patlasv4proto-pbp-produto",
            "label": "Produto / Serviço",
            "type": "reference",
            "size": "medium",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "identity",
            "linkedFormId": "form-patlasv4-proto-catalogo-produto-servico",
            "options": [
                "CSPS - Plataforma de Simplificação",
                "Cloud",
                "Block Secure",
            ],
            "spec": "Um bloco por produto ou grupo de produtos.",
        },
        {
            "id": "patlasv4proto-pbp-status",
            "label": "Status do bloco",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "highlight",
            "options": [
                "Em preenchimento",
                "Em revisão",
                "Aprovado",
                "Recusado",
            ],
            "spec": "Aprovação por bloco — não pelo documento inteiro.",
        },
        {
            "id": "patlasv4proto-pbp-vigencia-inicio",
            "label": "Vigência — início",
            "type": "date",
            "size": "small",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
        },
        {
            "id": "patlasv4proto-pbp-vigencia-fim",
            "label": "Vigência — fim",
            "type": "date",
            "size": "small",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
        },
        {
            "id": "patlasv4proto-pbp-quantidade",
            "label": "Quantidade",
            "type": "number",
            "size": "small",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "spec": "Quantitativos exigem aprovação formal.",
        },
        {
            "id": "patlasv4proto-pbp-valor-total",
            "label": "Valor total do bloco",
            "type": "number",
            "size": "small",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "currency": True,
        },
        {
            "id": "patlasv4proto-pbp-quantitativos-aprovados",
            "label": "Quantitativos aprovados",
            "type": "boolean",
            "size": "medium",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "spec": "Sim quando status = Aprovado.",
        },
        {
            "id": "patlasv4proto-pbp-justificativa-recusa",
            "label": "Justificativa de recusa",
            "type": "text",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "textLong": True,
            "spec": "Obrigatória quando status = Recusado.",
        },
        {
            "id": "patlasv4proto-pbp-observacao",
            "label": "Observação",
            "type": "text",
            "size": "medium",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "textLong": True,
        },
    ],
    "exampleValuePresets": [],
}

FORM_METODO_APROVAR_BLOCO = {
    "id": "form-patlasv4-proto-metodo-aprovar-bloco-produto",
    "name": "PR — Parâmetro: Aprovar bloco de produto",
    "sectionLayout": "none",
    "defaultCanvasMode": "edit",
    "metadata": (
        "Aprova ou recusa um bloco de produto na proposta. "
        "Decisão 19/06/2026 — revisão por bloco, não documento monolítico."
    ),
    "fields": [
        {
            "id": "patlasv4proto-mab-bloco",
            "label": "Bloco de produto",
            "type": "reference",
            "size": "large",
            "readOnly": True,
            "required": True,
            "multiple": False,
            "relevance": "identity",
            "linkedFormId": "form-patlasv4-proto-proposta-bloco-produto",
            "spec": "Bloco selecionado na proposta.",
        },
        {
            "id": "patlasv4proto-mab-decisao",
            "label": "Decisão",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "highlight",
            "options": ["Aprovar", "Recusar", "Solicitar revisão"],
        },
        {
            "id": "patlasv4proto-mab-justificativa",
            "label": "Justificativa",
            "type": "text",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "textLong": True,
            "spec": "Obrigatória para Recusar ou Solicitar revisão.",
        },
    ],
    "exampleValuePresets": [],
}


def find_form(forms: list, form_id: str) -> dict | None:
    for f in forms:
        if f.get("id") == form_id:
            return f
    return None


def find_field(form: dict, field_id: str) -> dict | None:
    for f in form.get("fields", []):
        if f.get("id") == field_id:
            return f
    return None


def upsert_field(form: dict, field: dict) -> None:
    fields = form.setdefault("fields", [])
    for i, f in enumerate(fields):
        if f.get("id") == field["id"]:
            fields[i] = field
            return
    fields.append(field)


def upsert_rule(form: dict, rule: dict) -> None:
    rules = form.setdefault("fieldVisibilityRules", [])
    for i, r in enumerate(rules):
        if r.get("id") == rule["id"]:
            rules[i] = rule
            return
    rules.append(rule)


def patch_grupo_options(form: dict, field_id: str) -> None:
    f = find_field(form, field_id)
    if f:
        f["options"] = list(GRUPOS)


def patch_tipo_documento(tdoc: dict) -> None:
    tdoc["metadata"] = (
        "Protótipo Atlas — Tipos de documento MIPP Anexo II + Compliance. "
        "Se aplica a = Organização (empresa). Decisão Luiz 19/06/2026."
    )
    patch_grupo_options(tdoc, GRUPO_FIELD_TDOC)
    upsert_field(
        tdoc,
        {
            "id": "patlasv4proto-tdoc-obrigatorio-parceiro",
            "label": "Obrigatório para parceiro",
            "type": "boolean",
            "size": "small",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "common",
            "spec": "Todos os tipos MIPP são obrigatórios para parceiro habilitado.",
        },
    )
    upsert_field(
        tdoc,
        {
            "id": "patlasv4proto-tdoc-modo-vencimento-padrao",
            "label": "Modo de vencimento padrão",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "options": ["Automático (OCR)", "Manual / Recorrente"],
            "spec": "Automático: lê data do PDF. Manual: operador define recorrência.",
        },
    )
    for p in tdoc.get("exampleValuePresets", []):
        fv = p.setdefault("fieldValues", {})
        fv.setdefault("patlasv4proto-tdoc-obrigatorio-parceiro", True)
        fv.setdefault("patlasv4proto-tdoc-modo-vencimento-padrao", "Manual / Recorrente")


def patch_uo_documento(uodoc: dict) -> None:
    uodoc["metadata"] = (
        "Documento de habilitação MIPP na org raiz. Tipo via catálogo; "
        "vencimento automático ou recorrente. Decisão Luiz 19/06/2026."
    )
    patch_grupo_options(uodoc, GRUPO_FIELD_UODOC)
    tipo = find_field(uodoc, "patlasv4proto-uodoc-tipo")
    if tipo:
        tipo["options"] = list(MIPP_NOMES)
    arq = find_field(uodoc, "patlasv4proto-uodoc-arquivo")
    if arq:
        arq["required"] = True
    upsert_field(
        uodoc,
        {
            "id": "patlasv4proto-uodoc-modo-vencimento",
            "label": "Modo de vencimento",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "common",
            "options": ["Automático (OCR)", "Manual / Recorrente"],
            "spec": "OCR pós-F1. Manual na F1.",
        },
    )
    upsert_field(
        uodoc,
        {
            "id": "patlasv4proto-uodoc-recorrencia",
            "label": "Recorrência",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "options": [
                "Anual",
                "Semestral",
                "Conforme alteração cadastral",
                "Não se aplica",
            ],
            "spec": "Usado quando modo = Manual / Recorrente.",
            "hidden": True,
        },
    )
    upsert_field(
        uodoc,
        {
            "id": "patlasv4proto-uodoc-status-validacao",
            "label": "Status de validação",
            "type": "textOptions",
            "size": "small",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "common",
            "options": ["Pendente", "Aprovado", "Recusado", "Vencido"],
            "spec": "Validação humana na F1. IA validação pós-F1.",
        },
    )
    upsert_rule(
        uodoc,
        {
            "id": "rule-uodoc-show-recorrencia-manual",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-uodoc-modo-vencimento",
            "sourceKind": "textOptions",
            "expectedOptionText": "Manual / Recorrente",
            "action": "show",
            "targetFieldIds": ["patlasv4proto-uodoc-recorrencia"],
        },
    )


def patch_unidade_organizacional(uo: dict) -> None:
    uo["metadata"] = (
        "Protótipo Atlas Fase 1 — Organização. Documentos MIPP só na org raiz (Empresa=Sim). "
        "Docs execução separados. Decisão Luiz 19/06/2026."
    )
    docs = find_field(uo, "patlasv4proto-uo-documentos")
    if docs:
        docs["label"] = "Documentos de habilitação (MIPP)"
        docs["spec"] = (
            "Grade MIPP — somente org raiz. Progresso por grupo (ex. 19/19 jurídica). "
            "Parceiro sem habilitação completa não acessa proposta/catálogo."
        )
    upsert_field(
        uo,
        {
            "id": "patlasv4proto-uo-habilitacao-status",
            "label": "Status da habilitação documental",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "highlight",
            "sectionId": "sec-patlasv4proto-uo-ajustes",
            "hidden": True,
            "options": [
                "Incompleta",
                "Em apresentação (DPM)",
                "Completa — aguardando MTI",
                "Aprovada pela MTI",
            ],
            "spec": "Fluxo parceiro — fase DPM apresentação documentos.",
        },
    )
    for fid, label in [
        ("patlasv4proto-uo-prog-juridica", "Progresso — Habilitação jurídica"),
        ("patlasv4proto-uo-prog-tecnica", "Progresso — Qualificação técnica"),
        ("patlasv4proto-uo-prog-financeira", "Progresso — Qualificação financeira"),
        ("patlasv4proto-uo-prog-compliance", "Progresso — Compliance"),
    ]:
        upsert_field(
            uo,
            {
                "id": fid,
                "label": label,
                "type": "text",
                "size": "small",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-patlasv4proto-uo-ajustes",
                "hidden": True,
                "spec": "Ex.: 19/19 — calculado a partir dos anexos MIPP.",
            },
        )
    upsert_field(
        uo,
        {
            "id": "patlasv4proto-uo-acesso-comercial-bloqueado",
            "label": "Acesso comercial bloqueado",
            "type": "boolean",
            "size": "medium",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "sectionId": "sec-patlasv4proto-uo-ajustes",
            "hidden": True,
            "spec": "Sim enquanto habilitação MIPP incompleta — sem proposta/catálogo.",
        },
    )
    upsert_field(
        uo,
        {
            "id": "patlasv4proto-uo-docs-execucao",
            "label": "Documentos de execução da parceria",
            "type": "embeddedReference",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": True,
            "relevance": "common",
            "sectionId": "sec-patlasv4proto-uo-ajustes",
            "linkedFormId": "form-patlasv4-proto-uo-doc-execucao",
            "embeddedDisplay": "table",
            "hidden": True,
            "spec": "Papel timbrado, modelos de proposta/contrato — separado do MIPP.",
        },
    )

    habilitacao_fields = [
        "patlasv4proto-uo-habilitacao-status",
        "patlasv4proto-uo-prog-juridica",
        "patlasv4proto-uo-prog-tecnica",
        "patlasv4proto-uo-prog-financeira",
        "patlasv4proto-uo-prog-compliance",
        "patlasv4proto-uo-acesso-comercial-bloqueado",
    ]
    show_ajustes = find_rule_targets(uo, "rule-uo-show-ajustes-empresa")
    hide_ajustes = find_rule_targets(uo, "rule-uo-hide-ajustes-nao-empresa")
    for fid in ["patlasv4proto-uo-docs-execucao"]:
        if fid not in show_ajustes:
            show_ajustes.append(fid)
        if fid not in hide_ajustes:
            hide_ajustes.append(fid)

    upsert_rule(
        uo,
        {
            "id": "rule-uo-show-habilitacao-parceiro",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-uo-tipo-organizacao",
            "sourceKind": "textOptions",
            "expectedOptionText": "Parceiro",
            "action": "show",
            "targetFieldIds": habilitacao_fields,
        },
    )
    upsert_rule(
        uo,
        {
            "id": "rule-uo-hide-habilitacao-nao-parceiro",
            "operator": "neq",
            "sourceFieldId": "patlasv4proto-uo-tipo-organizacao",
            "sourceKind": "textOptions",
            "expectedOptionText": "Parceiro",
            "action": "hide",
            "targetFieldIds": habilitacao_fields,
        },
    )


def find_rule_targets(uo: dict, rule_id: str) -> list:
    for r in uo.get("fieldVisibilityRules", []):
        if r.get("id") == rule_id:
            return r.setdefault("targetFieldIds", [])
    return []


def patch_proposta(proposta: dict) -> None:
    proposta["metadata"] = (
        "Proposta — blocos por produto com aprovação independente (Luiz 19/06/2026). "
        "PDF só após todos os blocos aprovados."
    )
    status = find_field(proposta, "patlasv4proto-proposta-status-da-proposta")
    if status:
        opts = status.get("options", [])
        for o in ["Aguardando blocos", "Blocos em revisão"]:
            if o not in opts:
                opts.insert(1, o)
        status["options"] = opts
    upsert_field(
        proposta,
        {
            "id": "patlasv4proto-proposta-blocos-produto",
            "label": "Blocos por produto",
            "type": "embeddedReference",
            "size": "large",
            "readOnly": False,
            "required": True,
            "multiple": True,
            "relevance": "highlight",
            "linkedFormId": "form-patlasv4-proto-proposta-bloco-produto",
            "embeddedDisplay": "table",
            "spec": (
                "Um formulário por produto/grupo. Aprovação independente. "
                "Texto padrão do template fora deste fluxo."
            ),
        },
    )
    upsert_field(
        proposta,
        {
            "id": "patlasv4proto-proposta-todos-blocos-aprovados",
            "label": "Todos os blocos aprovados",
            "type": "boolean",
            "size": "medium",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "spec": "Pré-condição para Confirmar e Gerar PDF.",
        },
    )
    methods = proposta.setdefault("methods", [])
    if not any(m.get("id") == "patlasv4proto-prop-meth-aprovar-bloco" for m in methods):
        methods.insert(
            1,
            {
                "id": "patlasv4proto-prop-meth-aprovar-bloco",
                "name": "Aprovar / Recusar bloco",
                "icon": "fact_check",
                "kind": "menu",
                "inputFormId": "form-patlasv4-proto-metodo-aprovar-bloco-produto",
                "spec": "Revisão por bloco de produto — decisão 19/06/2026.",
            },
        )
    # Atualizar preset MTI com blocos exemplo
    for preset in proposta.get("exampleValuePresets", []):
        if preset.get("id") == "patlasv4proto-p-proposta-mti":
            preset.setdefault("fieldValues", {})[
                "patlasv4proto-proposta-todos-blocos-aprovados"
            ] = False
            preset.setdefault("embeddedRowsByFieldId", {})[
                "patlasv4proto-proposta-blocos-produto"
            ] = [
                {
                    "patlasv4proto-pbp-produto": "CSPS - Plataforma de Simplificação",
                    "patlasv4proto-pbp-status": "Aprovado",
                    "patlasv4proto-pbp-quantidade": 1,
                    "patlasv4proto-pbp-valor-total": 2500,
                    "patlasv4proto-pbp-quantitativos-aprovados": True,
                },
                {
                    "patlasv4proto-pbp-produto": "Block Secure",
                    "patlasv4proto-pbp-status": "Em revisão",
                    "patlasv4proto-pbp-quantidade": 10,
                    "patlasv4proto-pbp-valor-total": 15000,
                    "patlasv4proto-pbp-quantitativos-aprovados": False,
                    "patlasv4proto-pbp-justificativa-recusa": "",
                },
            ]
            preset["fieldValues"]["patlasv4proto-proposta-status-da-proposta"] = (
                "Blocos em revisão"
            )


def patch_proposta_item(item: dict) -> None:
    upsert_field(
        item,
        {
            "id": "patlasv4proto-pri-status-bloco",
            "label": "Status do bloco",
            "type": "textOptions",
            "size": "small",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "options": [
                "Em preenchimento",
                "Em revisão",
                "Aprovado",
                "Recusado",
            ],
        },
    )
    upsert_field(
        item,
        {
            "id": "patlasv4proto-pri-vigencia-inicio",
            "label": "Vigência — início",
            "type": "date",
            "size": "small",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
        },
    )
    upsert_field(
        item,
        {
            "id": "patlasv4proto-pri-vigencia-fim",
            "label": "Vigência — fim",
            "type": "date",
            "size": "small",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
        },
    )


def patch_assinatura_signatario(sig: dict) -> None:
    papel = find_field(sig, "patlasv4proto-assin-sig-papel")
    if papel:
        papel["options"] = ["Principal", "Complementar", "Observador"]
        papel["spec"] = "Decisão 19/06/2026 — não usar Parceiro/Cliente como papel."
    upsert_field(
        sig,
        {
            "id": "patlasv4proto-assin-sig-ordem",
            "label": "Ordem de assinatura",
            "type": "number",
            "size": "small",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "common",
            "spec": "Mesma ordem = paralelo. Presidente/diretor por último.",
        },
    )
    upsert_field(
        sig,
        {
            "id": "patlasv4proto-assin-sig-assina-por-ultimo",
            "label": "Assina por último",
            "type": "boolean",
            "size": "small",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "spec": "Presidente assina após todos os demais (sequencial).",
        },
    )
    upsert_field(
        sig,
        {
            "id": "patlasv4proto-assin-sig-metodo",
            "label": "Método de assinatura",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "options": [
                "Certificado digital (token)",
                "Gov.br",
                "MT Login",
            ],
            "spec": "Sem senha simples — MFA ou certificado (Luiz 19/06/2026).",
        },
    )


def patch_workflow_etapa(etapa: dict) -> None:
    papel = find_field(etapa, "patlasv4proto-wf-etapa-papel-envelope")
    if papel:
        papel["options"] = ["Principal", "Complementar", "Observador"]
        papel["spec"] = "Papéis de assinatura — decisão 19/06/2026."


def patch_metodo_assinatura(m: dict) -> None:
    met = find_field(m, "patlasv4proto-msel-metodo")
    if met:
        met["options"] = [
            "Certificado digital (token)",
            "Gov.br",
            "MT Login",
        ]
        met["spec"] = "Senha simples removida — Luiz 19/06/2026."


def patch_documentos(doc: dict) -> None:
    h = find_field(doc, "patlasv4proto-documentos-hash-integridade")
    if h:
        h["hidden"] = False
        h["label"] = "Hash de integridade (SHA-256)"
        h["spec"] = "RF06 — hash do PDF após geração."


def patch_uo_tributo(trib: dict) -> None:
    trib["metadata"] = (
        "Tributos org raiz — toggle + documento comprobatório obrigatório quando marcado. "
        "Decisão Luiz 19/06/2026."
    )
    for f in trib.get("fields", []):
        if f.get("type") == "file" and "comprobatório" in f.get("label", "").lower():
            f["spec"] = (
                "Obrigatório quando tributo/isento marcado. "
                "Isento → anexar comprovante de isenção."
            )


def patch_elogroup_preset(uo: dict) -> None:
    for preset in uo.get("exampleValuePresets", []):
        if preset.get("id") != "patlasv4proto-p-unidade-organizacional-parceiro":
            continue
        fv = preset.setdefault("fieldValues", {})
        fv["patlasv4proto-uo-habilitacao-status"] = "Em apresentação (DPM)"
        fv["patlasv4proto-uo-prog-juridica"] = "12/19"
        fv["patlasv4proto-uo-prog-tecnica"] = "6/10"
        fv["patlasv4proto-uo-prog-financeira"] = "4/11"
        fv["patlasv4proto-uo-prog-compliance"] = "0/—"
        fv["patlasv4proto-uo-acesso-comercial-bloqueado"] = True
        emb = preset.setdefault("embeddedRowsByFieldId", {})
        emb["patlasv4proto-uo-documentos"] = [
            {
                "mqlh6yafch5jzb": "Habilitação Jurídica",
                "patlasv4proto-uodoc-tipo": "Prova de inscrição no CNPJ",
                "patlasv4proto-uodoc-arquivo": "cnpj_elogroup.pdf",
                "patlasv4proto-uodoc-data-anexo": "01/03/2026",
                "patlasv4proto-uodoc-modo-vencimento": "Manual / Recorrente",
                "patlasv4proto-uodoc-recorrencia": "Conforme alteração cadastral",
                "patlasv4proto-uodoc-status-validacao": "Aprovado",
            },
            {
                "mqlh6yafch5jzb": "Habilitação Jurídica",
                "patlasv4proto-uodoc-tipo": "Certidão de débitos relativos a créditos tributários federais e dívida ativa da União",
                "patlasv4proto-uodoc-arquivo": "cnd_federal_elogroup.pdf",
                "patlasv4proto-uodoc-data-anexo": "15/05/2026",
                "patlasv4proto-uodoc-data-vencimento": "15/05/2027",
                "patlasv4proto-uodoc-modo-vencimento": "Automático (OCR)",
                "patlasv4proto-uodoc-status-validacao": "Pendente",
            },
        ]
        emb["patlasv4proto-uo-docs-execucao"] = [
            {
                "patlasv4proto-uodexec-tipo": "Papel timbrado",
                "patlasv4proto-uodexec-arquivo": "timbrado_elogroup.pdf",
                "patlasv4proto-uodexec-ativo": True,
            }
        ]


def ensure_form(forms: list, form_def: dict) -> None:
    existing = find_form(forms, form_def["id"])
    if existing:
        existing.clear()
        existing.update(deepcopy(form_def))
    else:
        forms.append(deepcopy(form_def))


def patch_class_groups(groups: dict) -> None:
    assignments = groups.setdefault("assignments", {})
    order = groups.setdefault("memberOrderByGroup", {})

    new_assignments = {
        "form-patlasv4-proto-uo-doc-execucao": "grp-f1-organizacao-ref",
        "form-patlasv4-proto-proposta-bloco-produto": "grp-f1-processos-ref",
        "form-patlasv4-proto-metodo-aprovar-bloco-produto": "grp-f1-processos-metodos",
        "form-patlasv4-proto-geracao-pdf-saida": "grp-f1-processos-ref",
        "form-patlasv4-proto-template": "grp-f1-processos-ref",
    }
    assignments.update(new_assignments)

    org_ref = order.setdefault("grp-f1-organizacao-ref", [])
    for fid in ["form-patlasv4-proto-uo-doc-execucao"]:
        if fid not in org_ref:
            idx = org_ref.index("form-patlasv4-proto-uo-documento") + 1
            org_ref.insert(idx, fid)

    proc_ref = order.setdefault("grp-f1-processos-ref", [])
    for fid in [
        "form-patlasv4-proto-proposta-bloco-produto",
        "form-patlasv4-proto-template",
        "form-patlasv4-proto-geracao-pdf-saida",
    ]:
        if fid not in proc_ref:
            proc_ref.insert(0, fid)

    proc_met = order.setdefault("grp-f1-processos-metodos", [])
    if "form-patlasv4-proto-metodo-aprovar-bloco-produto" not in proc_met:
        proc_met.append("form-patlasv4-proto-metodo-aprovar-bloco-produto")

    # Remover de nao-usado / validar se movidos
    nao = order.get("grp-nao-usado", [])
    validar = order.get("grp-validar", [])
    for fid in ["form-patlasv4-proto-geracao-pdf-saida", "form-patlasv4-proto-template"]:
        if fid in nao:
            nao.remove(fid)
        if fid in validar:
            validar.remove(fid)
        if assignments.get(fid) == "grp-nao-usado":
            assignments[fid] = "grp-f1-processos-ref"
        if assignments.get(fid) == "grp-validar":
            assignments[fid] = "grp-f1-processos-ref"


def main() -> None:
    forms = json.loads(FORMS_PATH.read_text(encoding="utf-8"))

    ensure_form(forms, FORM_UO_DOC_EXEC)
    ensure_form(forms, FORM_PROPOSTA_BLOCO)
    ensure_form(forms, FORM_METODO_APROVAR_BLOCO)

    patch_tipo_documento(find_form(forms, "form-patlasv4-proto-tipo-documento"))
    patch_uo_documento(find_form(forms, "form-patlasv4-proto-uo-documento"))
    patch_unidade_organizacional(
        find_form(forms, "form-patlasv4-proto-unidade-organizacional")
    )
    patch_elogroup_preset(find_form(forms, "form-patlasv4-proto-unidade-organizacional"))
    patch_uo_tributo(find_form(forms, "form-patlasv4-proto-uo-tributo"))
    patch_proposta(find_form(forms, "form-patlasv4-proto-proposta"))
    patch_proposta_item(find_form(forms, "form-patlasv4-proto-proposta-item-catalogo"))
    patch_assinatura_signatario(
        find_form(forms, "form-patlasv4-proto-assinatura-signatario")
    )
    patch_workflow_etapa(find_form(forms, "form-patlasv4-proto-workflow-etapa"))
    patch_metodo_assinatura(
        find_form(forms, "form-patlasv4-proto-metodo-selecionar-metodo-assinatura")
    )
    patch_documentos(find_form(forms, "form-patlasv4-proto-documentos"))

    pdf_saida = find_form(forms, "form-patlasv4-proto-geracao-pdf-saida")
    if pdf_saida:
        pdf_saida["name"] = "Saída — PDF gerado"
        pdf_saida["metadata"] = "RF06 — PDF imutável + hash SHA-256 após geração."

    FORMS_PATH.write_text(
        json.dumps(forms, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    groups = json.loads(GROUPS_PATH.read_text(encoding="utf-8"))
    patch_class_groups(groups)
    GROUPS_PATH.write_text(
        json.dumps(groups, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print("OK — Documentos visão cliente aplicados")
    print("  + uo-doc-execucao, proposta-bloco-produto, metodo-aprovar-bloco")
    print("  + vencimento recorrente, progresso habilitação, assinatura Luiz 19/06")


if __name__ == "__main__":
    main()
