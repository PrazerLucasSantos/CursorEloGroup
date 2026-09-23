#!/usr/bin/env python3
"""Finaliza Fase 1 do Atlas Protótipo: métodos, grupos, UO derivada, migração UO extinta."""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPIC = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS_PATH = EPIC / "forms.json"
GROUPS_PATH = EPIC / "class-groups.json"

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

CARGO_NAMES = [
    "Diretor DIRC",
    "Analista DIRC",
    "Analista DTIC",
    "Gerente de Projetos",
    "Fiscal de Contrato",
]

CARGO_UO_MAP = {
    "Diretor DIRC": "MTI/DIRC",
    "Analista DIRC": "MTI/DIRC",
    "Analista DTIC": "MTI/DTIC",
    "Gerente de Projetos": "MTI/UGP",
    "Fiscal de Contrato": "SEPLAG/GECON",
}

FORM_CADASTRAR_CARGO = {
    "id": "form-patlasv4-proto-metodo-cadastrar-cargo",
    "name": "Organização/Método/Cadastrar cargo",
    "sectionLayout": "none",
    "defaultCanvasMode": "edit",
    "metadata": (
        "Método Cadastrar cargo na Organização (UO). Cria registro na classe Cargo "
        "vinculado à organização raiz + caminho UO da unidade corrente. "
        "Decisão 19/06/2026 (Luiz/MTI)."
    ),
    "fields": [
        {
            "id": "patlasv4proto-mcc-organizacao",
            "label": "Organização",
            "type": "reference",
            "size": "large",
            "readOnly": True,
            "required": True,
            "multiple": False,
            "relevance": "identity",
            "options": [
                "Empresa Mato-grossense de Tecnologia da Informação",
                "EloGroup",
                "Secretaria de Estado de Planejamento e Gestão",
            ],
            "linkedFormId": "form-patlasv4-proto-unidade-organizacional",
            "spec": "Preenchido automaticamente — organização raiz (Empresa = Sim) da árvore.",
        },
        {
            "id": "patlasv4proto-mcc-caminho-uo",
            "label": "Unidade organizacional (caminho)",
            "type": "text",
            "size": "medium",
            "readOnly": True,
            "required": True,
            "multiple": False,
            "relevance": "highlight",
            "spec": "Caminho hierárquico da UO corrente (ex.: MTI/DIRC). Gravado no Cargo.",
        },
        {
            "id": "patlasv4proto-mcc-perfil",
            "label": "Perfil",
            "type": "textOptions",
            "size": "small",
            "readOnly": True,
            "required": True,
            "multiple": False,
            "relevance": "common",
            "options": ["MTI", "Parceiro", "Cliente"],
            "spec": "Derivado do Tipo do cadastro da organização raiz.",
        },
        {
            "id": "patlasv4proto-mcc-nome-cargo",
            "label": "Nome do cargo",
            "type": "text",
            "size": "medium",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "identity",
            "spec": "Ex.: Diretor, Analista, Gerente de Projetos.",
        },
        {
            "id": "patlasv4proto-mcc-sigla",
            "label": "Sigla / Abreviatura",
            "type": "text",
            "size": "medium",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "common",
            "spec": "Ex.: DIR, ANL, GP.",
        },
        {
            "id": "patlasv4proto-mcc-administrador",
            "label": "Administrador",
            "type": "boolean",
            "size": "small",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "highlight",
            "spec": "Sim → acesso total. Não → executor com Módulos (executor).",
        },
        {
            "id": "patlasv4proto-mcc-modulos-executor",
            "label": "Módulos (executor)",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": False,
            "multiple": True,
            "relevance": "common",
            "hidden": True,
            "options": ["Catálogo/ Proposta"],
            "spec": "Somente quando Administrador = Não. Interseção com Módulos visíveis da UO.",
        },
        {
            "id": "patlasv4proto-mcc-pode-assinar",
            "label": "Pode assinar",
            "type": "boolean",
            "size": "small",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "common",
            "spec": "Sim → cargo disponível no Workflow de Assinatura.",
        },
        {
            "id": "patlasv4proto-mcc-papel-assinatura",
            "label": "Papel na assinatura",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "hidden": True,
            "options": [
                "Assinante principal",
                "Assinante complementar",
                "Observador",
            ],
            "spec": "Somente quando Pode assinar = Sim.",
        },
        {
            "id": "patlasv4proto-mcc-ativo",
            "label": "Ativo",
            "type": "boolean",
            "size": "small",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "common",
            "spec": "Cargo disponível nos seletores.",
        },
        {
            "id": "patlasv4proto-mcc-observacoes",
            "label": "Observações",
            "type": "text",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "textLong": True,
            "spec": "",
        },
        {
            "id": "patlasv4proto-mcc-confirmar",
            "label": "Confirmar cadastro",
            "type": "boolean",
            "size": "large",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "highlight",
            "spec": "Sim → cria registro na classe Cargo e vincula à organização.",
        },
        {
            "id": "patlasv4proto-mcc-cargo-criado",
            "label": "Cargo criado",
            "type": "reference",
            "size": "large",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "highlight",
            "hidden": True,
            "options": CARGO_NAMES,
            "linkedFormId": "form-patlasv4-proto-cargo",
            "spec": "Saída após confirmação — referência ao novo Cargo.",
        },
    ],
    "fieldVisibilityRules": [
        {
            "id": "rule-mcc-show-modulos-executor",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-mcc-administrador",
            "sourceKind": "boolean",
            "expectedBoolean": False,
            "action": "show",
            "targetFieldIds": ["patlasv4proto-mcc-modulos-executor"],
        },
        {
            "id": "rule-mcc-hide-modulos-admin",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-mcc-administrador",
            "sourceKind": "boolean",
            "expectedBoolean": True,
            "action": "hide",
            "targetFieldIds": ["patlasv4proto-mcc-modulos-executor"],
        },
        {
            "id": "rule-mcc-show-papel-assinar",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-mcc-pode-assinar",
            "sourceKind": "boolean",
            "expectedBoolean": True,
            "action": "show",
            "targetFieldIds": ["patlasv4proto-mcc-papel-assinatura"],
        },
        {
            "id": "rule-mcc-hide-papel-sem-assinar",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-mcc-pode-assinar",
            "sourceKind": "boolean",
            "expectedBoolean": False,
            "action": "hide",
            "targetFieldIds": ["patlasv4proto-mcc-papel-assinatura"],
        },
        {
            "id": "rule-mcc-show-saida-confirmar",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-mcc-confirmar",
            "sourceKind": "boolean",
            "expectedBoolean": True,
            "action": "show",
            "targetFieldIds": ["patlasv4proto-mcc-cargo-criado"],
        },
    ],
    "exampleValuePresets": [
        {
            "id": "patlasv4proto-p-metodo-cadastrar-cargo-dirc",
            "name": "Novo cargo — DIRC",
            "iconColor": "#0c4a6e",
            "fieldValues": {
                "patlasv4proto-mcc-organizacao": "Empresa Mato-grossense de Tecnologia da Informação",
                "patlasv4proto-mcc-caminho-uo": "MTI/DIRC",
                "patlasv4proto-mcc-perfil": "MTI",
                "patlasv4proto-mcc-nome-cargo": "Coordenador DIRC",
                "patlasv4proto-mcc-sigla": "COORD",
                "patlasv4proto-mcc-administrador": False,
                "patlasv4proto-mcc-modulos-executor": ["Catálogo/ Proposta"],
                "patlasv4proto-mcc-pode-assinar": True,
                "patlasv4proto-mcc-papel-assinatura": "Assinante complementar",
                "patlasv4proto-mcc-ativo": True,
                "patlasv4proto-mcc-confirmar": False,
            },
        },
        {
            "id": "patlasv4proto-p-metodo-cadastrar-cargo-ugp",
            "name": "Novo cargo — UGP",
            "iconColor": "#0369a1",
            "fieldValues": {
                "patlasv4proto-mcc-organizacao": "Empresa Mato-grossense de Tecnologia da Informação",
                "patlasv4proto-mcc-caminho-uo": "MTI/UGP",
                "patlasv4proto-mcc-perfil": "MTI",
                "patlasv4proto-mcc-nome-cargo": "Analista UGP",
                "patlasv4proto-mcc-sigla": "ANL-UGP",
                "patlasv4proto-mcc-administrador": False,
                "patlasv4proto-mcc-modulos-executor": ["Catálogo/ Proposta"],
                "patlasv4proto-mcc-pode-assinar": False,
                "patlasv4proto-mcc-ativo": True,
                "patlasv4proto-mcc-confirmar": True,
                "patlasv4proto-mcc-cargo-criado": "Gerente de Projetos",
            },
        },
    ],
    "activeExamplePresetId": "patlasv4proto-p-metodo-cadastrar-cargo-dirc",
}

FORM_MIGRAR_CARGOS = {
    "id": "form-patlasv4-proto-metodo-migrar-cargos-uo",
    "name": "Organização/Método/Migrar cargos (UO extinta)",
    "sectionLayout": "none",
    "defaultCanvasMode": "edit",
    "metadata": (
        "Processo UO extinta → migrar cargos. Quando Ativo = Não e Unidade substituída por "
        "preenchida, atualiza patlasv4proto-cargo-unidade-organizacional dos cargos afetados. "
        "Ver docs/Atlas_UO_Extinta_Migracao_Cargos.md e scripts/migrate-uo-cargo-caminho.py."
    ),
    "fields": [
        {
            "id": "patlasv4proto-muc-caminho-origem",
            "label": "UO extinta (caminho origem)",
            "type": "text",
            "size": "medium",
            "readOnly": True,
            "required": True,
            "multiple": False,
            "relevance": "highlight",
            "spec": "Caminho da UO sendo extinta (ex.: MTI/DIRC/LEGADO).",
        },
        {
            "id": "patlasv4proto-muc-substituida-por",
            "label": "Unidade substituída por",
            "type": "reference",
            "size": "large",
            "readOnly": True,
            "required": True,
            "multiple": False,
            "relevance": "identity",
            "options": [
                "Gabinete da Diretoria de Relacionamento com o Cliente",
                "Unidade de Gestão de Projetos",
                "Gabinete da Diretoria de Tecnologia da Informação e Comunicação",
            ],
            "linkedFormId": "form-patlasv4-proto-unidade-organizacional",
            "spec": "Campo patlasv4proto-uo-substituida da UO extinta.",
        },
        {
            "id": "patlasv4proto-muc-caminho-destino",
            "label": "Caminho destino",
            "type": "textOptions",
            "size": "medium",
            "readOnly": True,
            "required": True,
            "multiple": False,
            "relevance": "highlight",
            "options": STANDARD_CAMINHOS,
            "spec": "Caminho hierárquico da UO substituta.",
        },
        {
            "id": "patlasv4proto-muc-cargos-afetados",
            "label": "Cargos a migrar",
            "type": "embeddedReference",
            "size": "large",
            "readOnly": True,
            "required": False,
            "multiple": True,
            "relevance": "common",
            "linkedFormId": "form-patlasv4-proto-cargo",
            "embeddedDisplay": "table",
            "spec": "Pré-visualização dos cargos com UO = caminho origem.",
        },
        {
            "id": "patlasv4proto-muc-confirmar",
            "label": "Confirmar migração",
            "type": "boolean",
            "size": "large",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "highlight",
            "spec": "Sim → executa script de migração (backend).",
        },
        {
            "id": "patlasv4proto-muc-resultado",
            "label": "Resultado",
            "type": "text",
            "size": "large",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "hidden": True,
            "textLong": True,
            "spec": "Resumo: N cargos migrados de ORIGEM → DESTINO.",
        },
    ],
    "fieldVisibilityRules": [
        {
            "id": "rule-muc-show-resultado",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-muc-confirmar",
            "sourceKind": "boolean",
            "expectedBoolean": True,
            "action": "show",
            "targetFieldIds": ["patlasv4proto-muc-resultado"],
        },
    ],
    "exampleValuePresets": [
        {
            "id": "patlasv4proto-p-metodo-migrar-cargos-exemplo",
            "name": "Exemplo — reestruturação DIRC",
            "iconColor": "#b45309",
            "fieldValues": {
                "patlasv4proto-muc-caminho-origem": "MTI/DIRC",
                "patlasv4proto-muc-substituida-por": "Unidade de Gestão de Projetos",
                "patlasv4proto-muc-caminho-destino": "MTI/UGP",
                "patlasv4proto-muc-confirmar": False,
            },
            "embeddedRowsByFieldId": {
                "patlasv4proto-muc-cargos-afetados": [
                    {
                        "patlasv4proto-cargo-dados-do-cargo-nome-do-cargo": "Analista DIRC",
                        "patlasv4proto-cargo-unidade-organizacional": "MTI/DIRC",
                    }
                ],
            },
        },
    ],
    "activeExamplePresetId": "patlasv4proto-p-metodo-migrar-cargos-exemplo",
}

CLASS_GROUPS = {
    "groups": [
        {"id": "grp-f1-organizacao", "name": "F1 · Organização"},
        {"id": "grp-f1-organizacao-ref", "name": "Referências", "parentGroupId": "grp-f1-organizacao"},
        {"id": "grp-f1-organizacao-metodos", "name": "Métodos", "parentGroupId": "grp-f1-organizacao"},
        {"id": "grp-f1-pessoa", "name": "F1 · Pessoas"},
        {"id": "grp-f1-pessoa-ref", "name": "Referências", "parentGroupId": "grp-f1-pessoa"},
        {"id": "grp-f1-pessoa-metodos", "name": "Métodos", "parentGroupId": "grp-f1-pessoa"},
        {"id": "grp-f1-cargo", "name": "F1 · Cargo"},
        {"id": "grp-f1-cargo-ref", "name": "Referências", "parentGroupId": "grp-f1-cargo"},
        {"id": "grp-f1-convite", "name": "F1 · Convite de Cadastro"},
        {"id": "grp-f1-tipo-documento", "name": "F1 · Tipo Documento (CO)"},
        {"id": "grp-f1-versoes-processo", "name": "F1 · Versões de Processo"},
        {"id": "grp-f1-versoes-processo-ref", "name": "Referências", "parentGroupId": "grp-f1-versoes-processo"},
        {"id": "grp-f1-assinatura", "name": "F1 · Assinatura (Workflow)"},
        {"id": "grp-f1-assinatura-ref", "name": "Referências", "parentGroupId": "grp-f1-assinatura"},
        {"id": "grp-f1-assinatura-metodos", "name": "Métodos", "parentGroupId": "grp-f1-assinatura"},
        {"id": "grp-f1-processos", "name": "F1 · Processos e fluxo documental"},
        {"id": "grp-f1-processos-ref", "name": "Referências", "parentGroupId": "grp-f1-processos"},
        {"id": "grp-f1-processos-metodos", "name": "Métodos", "parentGroupId": "grp-f1-processos"},
        {"id": "grp-f1-os-termo", "name": "F1 · OS e Termo de Homologação"},
        {"id": "grp-f1-os-termo-metodos", "name": "Métodos", "parentGroupId": "grp-f1-os-termo"},
        {"id": "grp-validar-catalogo", "name": "Validar · Catálogo"},
        {"id": "grp-validar", "name": "Validar · Template e demais"},
        {"id": "grp-backlog", "name": "Backlog · Portal, notificações e integrações"},
        {"id": "grp-embutido-servidor", "name": "Embutido · Servidor (backend)"},
        {"id": "grp-nao-usado", "name": "Não usado · Fase 1"},
    ],
    "assignments": {
        "form-patlasv4-proto-unidade-organizacional": "grp-f1-organizacao",
        "form-patlasv4-proto-uo-conta-bancaria": "grp-f1-organizacao-ref",
        "form-patlasv4-proto-uo-documento": "grp-f1-organizacao-ref",
        "form-patlasv4-proto-uo-tributo": "grp-f1-organizacao-ref",
        "form-patlasv4-proto-uo-cargo-atribuido": "grp-f1-organizacao-ref",
        "form-patlasv4-proto-uo-pessoa-cargo": "grp-f1-organizacao-ref",
        "form-patlasv4-proto-metodo-gerar-convite": "grp-f1-organizacao-metodos",
        "form-patlasv4-proto-metodo-cadastrar-cargo": "grp-f1-organizacao-metodos",
        "form-patlasv4-proto-metodo-migrar-cargos-uo": "grp-f1-organizacao-metodos",
        "form-patlasv4-proto-pessoa": "grp-f1-pessoa",
        "form-patlasv4-proto-pessoa-filiacao": "grp-f1-pessoa-ref",
        "form-patlasv4-proto-pessoa-habilidade": "grp-f1-pessoa-ref",
        "form-patlasv4-proto-pessoa-exp-academica": "grp-f1-pessoa-ref",
        "form-patlasv4-proto-pessoa-exp-profissional": "grp-f1-pessoa-ref",
        "form-patlasv4-proto-pessoa-telefone": "grp-f1-pessoa-ref",
        "form-patlasv4-proto-pessoa-email": "grp-f1-pessoa-ref",
        "form-patlasv4-proto-pessoa-endereco": "grp-f1-pessoa-ref",
        "form-patlasv4-proto-pessoa-rede-social": "grp-f1-pessoa-ref",
        "form-patlasv4-proto-pessoa-atribuicao-resumo": "grp-f1-pessoa-ref",
        "form-patlasv4-proto-metodo-criar-pessoa": "grp-f1-pessoa-metodos",
        "form-patlasv4-proto-metodo-opcoes-pessoa": "grp-f1-pessoa-metodos",
        "form-patlasv4-proto-metodo-atribuir-cargo-pessoa": "grp-f1-pessoa-metodos",
        "form-patlasv4-proto-cargo": "grp-f1-cargo",
        "form-patlasv4-proto-cargo-ocupante": "grp-f1-cargo-ref",
        "form-patlasv4-proto-convite-cadastro": "grp-f1-convite",
        "form-patlasv4-proto-tipo-documento": "grp-f1-tipo-documento",
        "form-patlasv4-proto-config-processo": "grp-f1-versoes-processo",
        "form-patlasv4-proto-versao-processo": "grp-f1-versoes-processo-ref",
        "mqb5ag1k51kz2u": "grp-f1-versoes-processo-ref",
        "mqebasqyphbwea": "grp-f1-assinatura",
        "form-patlasv4-proto-painel-assinaturas-pendentes": "grp-f1-assinatura",
        "form-patlasv4-proto-workflow-etapa": "grp-f1-assinatura-ref",
        "form-patlasv4-proto-assinatura-documentos": "grp-f1-assinatura-ref",
        "form-patlasv4-proto-assinatura-signatario": "grp-f1-assinatura-ref",
        "form-patlasv4-proto-assinatura-controle-acesso": "grp-f1-assinatura-ref",
        "form-patlasv4-proto-painel-assinatura-item": "grp-f1-assinatura-ref",
        "form-patlasv4-proto-processo-envelope-historico": "grp-f1-assinatura-ref",
        "form-patlasv4-proto-metodo-enviar-assinatura": "grp-f1-assinatura-metodos",
        "form-patlasv4-proto-metodo-recusar-assinatura": "grp-f1-assinatura-metodos",
        "form-patlasv4-proto-metodo-selecionar-metodo-assinatura": "grp-f1-assinatura-metodos",
        "form-patlasv4-proto-processos": "grp-f1-processos",
        "form-patlasv4-proto-proposta": "grp-f1-processos",
        "form-patlasv4-proto-documentos": "grp-f1-processos",
        "form-patlasv4-proto-contrato": "grp-f1-processos",
        "form-patlasv4-proto-proposta-item-catalogo": "grp-f1-processos-ref",
        "form-patlasv4-proto-metodo-preparar-proposta": "grp-f1-processos-metodos",
        "form-patlasv4-proto-revisao-documento": "grp-f1-processos-ref",
        "form-patlasv4-proto-contrato-ordem-servico": "grp-f1-processos-ref",
        "form-patlasv4-proto-contrato-produto-contratado": "grp-f1-processos-ref",
        "form-patlasv4-proto-emissao-ordem-servico": "grp-f1-os-termo",
        "form-patlasv4-proto-termo-homologacao": "grp-f1-os-termo",
        "form-patlasv4-proto-metodo-criar-os": "grp-f1-os-termo-metodos",
        "form-patlasv4-proto-metodo-zerar-pedido-venda": "grp-f1-os-termo-metodos",
        "form-patlasv4-proto-catalogo-produto-servico": "grp-validar-catalogo",
        "form-patlasv4-proto-template": "grp-validar",
        "form-patlasv4-proto-template-bloco": "grp-validar",
        "form-patlasv4-proto-bloco-reutilizavel": "grp-validar",
        "form-patlasv4-proto-clausula-ecm": "grp-validar",
        "form-patlasv4-proto-revisao-bloco": "grp-validar",
        "form-patlasv4-proto-hist-edicao-bloco": "grp-validar",
        "form-patlasv4-proto-modelo-contrato": "grp-validar",
        "form-patlasv4-proto-projeto": "grp-validar",
        "form-patlasv4-proto-projeto-contato": "grp-validar",
        "form-patlasv4-proto-projeto-tarefa": "grp-validar",
        "form-patlasv4-proto-projeto-demanda": "grp-validar",
        "form-patlasv4-proto-projeto-relatorio-status": "grp-validar",
        "form-patlasv4-proto-projeto-item-relacionado": "grp-validar",
        "form-patlasv4-proto-projeto-registro-hora": "grp-validar",
        "form-patlasv4-proto-projeto-linha-gasto": "grp-validar",
        "form-patlasv4-proto-raer": "grp-validar",
        "form-patlasv4-proto-raer-indicador-entrega": "grp-validar",
        "form-patlasv4-proto-raer-entrega-realizada": "grp-validar",
        "form-patlasv4-proto-raer-plano-acao": "grp-validar",
        "form-patlasv4-proto-dossie-entrega-valor": "grp-validar",
        "form-patlasv4-proto-ev-kpi": "grp-validar",
        "form-patlasv4-proto-ev-kpi-medicao": "grp-validar",
        "form-patlasv4-proto-ev-plano-acao": "grp-validar",
        "form-patlasv4-proto-ev-transicao-status": "grp-validar",
        "form-patlasv4-proto-ev-timeline-marco": "grp-validar",
        "form-patlasv4-proto-ev-metodo-devolver": "grp-validar",
        "form-patlasv4-proto-solicitacao-vinculo": "grp-validar",
        "form-patlasv4-proto-portal-vinculo-organizacao": "grp-backlog",
        "form-patlasv4-proto-metodo-enviar-protheus": "grp-backlog",
        "form-patlasv4-proto-metodo-gerar-convite-saida": "grp-backlog",
        "mqedrpdvcau6e6": "grp-backlog",
        "mqehbuqf2zcbhn": "grp-backlog",
        "form-patlasv4-proto-servidor": "grp-embutido-servidor",
        "form-patlasv4-proto-servidor-permissao": "grp-embutido-servidor",
        "form-patlasv4-proto-auditoria": "grp-nao-usado",
        "form-patlasv4-proto-cargo-perm-visualizacao": "grp-nao-usado",
        "form-patlasv4-proto-cargo-permissao-processo": "grp-nao-usado",
        "form-patlasv4-proto-cliente": "grp-nao-usado",
        "form-patlasv4-proto-contrato-asset-covered": "grp-nao-usado",
        "form-patlasv4-proto-contrato-hist-aprovacao": "grp-nao-usado",
        "form-patlasv4-proto-contrato-historico": "grp-nao-usado",
        "form-patlasv4-proto-contrato-ic-coberto": "grp-nao-usado",
        "form-patlasv4-proto-contrato-linha-gasto": "grp-nao-usado",
        "form-patlasv4-proto-contrato-oferta": "grp-nao-usado",
        "form-patlasv4-proto-contrato-secundario": "grp-nao-usado",
        "form-patlasv4-proto-contrato-sla": "grp-nao-usado",
        "form-patlasv4-proto-contrato-tabela-valores": "grp-nao-usado",
        "form-patlasv4-proto-contrato-termo-condicao": "grp-nao-usado",
        "form-patlasv4-proto-contrato-usuario-coberto": "grp-nao-usado",
        "form-patlasv4-proto-documentos-templates": "grp-nao-usado",
        "form-patlasv4-proto-geracao-pdf-saida": "grp-nao-usado",
        "form-patlasv4-proto-metodo-criar-servidor": "grp-nao-usado",
        "form-patlasv4-proto-metodo-criar-servidor-permissao": "grp-nao-usado",
        "form-patlasv4-proto-metodo-desligar-pessoa": "grp-nao-usado",
        "form-patlasv4-proto-metodo-inativar-acesso-pessoa": "grp-nao-usado",
        "form-patlasv4-proto-pessoa-outro-nome": "grp-nao-usado",
        "form-patlasv4-proto-pessoa-vinculo-acesso": "grp-nao-usado",
        "form-patlasv4-proto-usuario": "grp-nao-usado",
        "form-patlasv4-proto-workflow-processo": "grp-nao-usado",
        "form-patlasv4-proto-workflow-processo-etapa": "grp-nao-usado",
    },
    "memberOrderByGroup": {},
}


def build_member_order(assignments: dict[str, str]) -> dict[str, list[str]]:
    order: dict[str, list[str]] = {}
    for form_id, gid in assignments.items():
        order.setdefault(gid, []).append(form_id)
    return order


def find_form(forms: list, form_id: str) -> dict | None:
    for f in forms:
        if f.get("id") == form_id:
            return f
    return None


def upsert_form(forms: list, form_def: dict) -> None:
    fid = form_def["id"]
    for i, f in enumerate(forms):
        if f.get("id") == fid:
            forms[i] = form_def
            return
    forms.append(form_def)


def patch_uo_form(form: dict) -> None:
    form["metadata"] = (
        "Protótipo Atlas Fase 1 — Organização (UO). Permissões por módulos visíveis. "
        "Métodos: Gerar Código de Convite, Cadastrar cargo, Migrar cargos (UO extinta). "
        "Classe Nível Organizacional NÃO existe (decisão 19–20/06/2026). "
        "Decisão 19/06/2026 (Luiz/MTI)."
    )
    for f in form.get("fields", []):
        if f.get("id") == "patlasv4proto-uo-substituida":
            f["spec"] = (
                "UO substituta em reestruturações. Quando Ativo = Não e este campo preenchido, "
                "usar método Migrar cargos para atualizar patlasv4proto-cargo-unidade-organizacional. "
                "Ver docs/Atlas_UO_Extinta_Migracao_Cargos.md."
            )
        if f.get("id") == "patlasv4proto-uo-nivel-organizacional":
            f["hidden"] = True
            f["spec"] = "OBSOLETO — classe Nível Organizacional não existe. Campo oculto."

    methods = form.setdefault("methods", [])
    new_methods = [
        {
            "id": "patlasv4proto-uo-meth-cadastrar-cargo",
            "name": "Cadastrar cargo",
            "icon": "badge",
            "kind": "destaque",
            "inputFormId": "form-patlasv4-proto-metodo-cadastrar-cargo",
        },
        {
            "id": "patlasv4proto-uo-meth-migrar-cargos",
            "name": "Migrar cargos",
            "icon": "swap_horiz",
            "kind": "destaque",
            "inputFormId": "form-patlasv4-proto-metodo-migrar-cargos-uo",
        },
    ]
    existing_ids = {m.get("id") for m in methods}
    for m in new_methods:
        if m["id"] not in existing_ids:
            methods.append(m)


def patch_pessoa_form(form: dict) -> None:
    form["metadata"] = (
        "Protótipo Atlas Fase 1 — Pessoas. Exibe todas as abas e campos (Geral, Contato, "
        "Complementares, Currículo) para MTI, Parceiro e Cliente — sem versão simplificada. "
        "Métodos: Criar, Editar, Opções, Atribuir cargo (Servidor + Ocupante no backend)."
    )
    for f in form.get("fields", []):
        if f.get("id") == "patlasv4proto-pes-fornecedor":
            f["spec"] = (
                "Visível para todos os perfis. Campos condicionais de fornecedor aparecem quando = Sim."
            )


def patch_atribuir_cargo(form: dict) -> None:
    form["metadata"] = (
        "Atribui cargo à pessoa (Servidor + Ocupante no backend). Fluxo: Perfil → Organização → "
        "Matrícula (MTI) → Cargo → UO derivada (read-only) → Condição → Região → Ativo. "
        "Decisão 19/06/2026: UO vem do Cargo."
    )
    fields = form.setdefault("fields", [])
    field_ids = {f.get("id") for f in fields}

    if "patlasv4proto-pac-uo-derivada" not in field_ids:
        insert_after = next(
            (i + 1 for i, f in enumerate(fields) if f.get("id") == "patlasv4proto-pac-cargo"),
            len(fields),
        )
        fields.insert(
            insert_after,
            {
                "id": "patlasv4proto-pac-uo-derivada",
                "label": "Unidade organizacional (derivada do Cargo)",
                "type": "textOptions",
                "size": "medium",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "hidden": True,
                "options": STANDARD_CAMINHOS,
                "spec": "Somente leitura — caminho UO gravado no Cargo selecionado.",
            },
        )

    for f in fields:
        if f.get("id") == "patlasv4proto-pac-caminho-uo":
            f["label"] = "Unidade organizacional (legado oculto)"
            f["hidden"] = True

    pos_targets = [
        "patlasv4proto-pac-uo-derivada",
        "patlasv4proto-pac-condicao",
        "patlasv4proto-pac-regiao",
        "patlasv4proto-pac-ativo",
    ]
    rules = form.setdefault("fieldVisibilityRules", [])
    rules = [r for r in rules if not r.get("id", "").startswith("rule-pac-show-pos-cargo-")]
    for name in CARGO_NAMES:
        slug = name.lower().replace(" ", "-")
        rules.append(
            {
                "id": f"rule-pac-show-pos-cargo-{slug}",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-pac-cargo",
                "sourceKind": "textOptions",
                "expectedOptionText": name,
                "action": "show",
                "targetFieldIds": pos_targets,
            }
        )
    form["fieldVisibilityRules"] = rules

    for preset in form.get("exampleValuePresets", []):
        cargo = preset.get("fieldValues", {}).get("patlasv4proto-pac-cargo")
        if cargo in CARGO_UO_MAP:
            preset.setdefault("fieldValues", {})["patlasv4proto-pac-uo-derivada"] = CARGO_UO_MAP[cargo]
        if "patlasv4proto-pac-condicao" not in preset.get("fieldValues", {}):
            preset.setdefault("fieldValues", {})["patlasv4proto-pac-condicao"] = "Titular"
        if "patlasv4proto-pac-regiao" not in preset.get("fieldValues", {}):
            preset.setdefault("fieldValues", {})["patlasv4proto-pac-regiao"] = ["Todos"]


def main() -> None:
    forms: list = json.loads(FORMS_PATH.read_text(encoding="utf-8"))
    form_ids = {f["id"] for f in forms}

    upsert_form(forms, deepcopy(FORM_CADASTRAR_CARGO))
    upsert_form(forms, deepcopy(FORM_MIGRAR_CARGOS))

    uo = find_form(forms, "form-patlasv4-proto-unidade-organizacional")
    if uo:
        patch_uo_form(uo)

    pessoa = find_form(forms, "form-patlasv4-proto-pessoa")
    if pessoa:
        patch_pessoa_form(pessoa)

    atribuir = find_form(forms, "form-patlasv4-proto-metodo-atribuir-cargo-pessoa")
    if atribuir:
        patch_atribuir_cargo(atribuir)

    # Garantir assignments cobrem todos os forms existentes
    assignments = dict(CLASS_GROUPS["assignments"])
    for f in forms:
        fid = f["id"]
        if fid not in assignments:
            assignments[fid] = "grp-validar"
            print(f"WARN: form {fid} sem grupo explícito → Validar")

    CLASS_GROUPS["assignments"] = assignments
    CLASS_GROUPS["memberOrderByGroup"] = build_member_order(assignments)

    FORMS_PATH.write_text(
        json.dumps(forms, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    GROUPS_PATH.write_text(
        json.dumps(CLASS_GROUPS, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"OK forms.json — {len(forms)} formulários")
    print(f"OK class-groups.json — {len(CLASS_GROUPS['groups'])} grupos")
    print(f"Novos métodos: Cadastrar cargo, Migrar cargos")
    print(f"Campo UO derivada em Atribuir cargo")


if __name__ == "__main__":
    main()
