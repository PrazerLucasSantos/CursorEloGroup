#!/usr/bin/env python3
"""Reorganiza grupos de classes do Atlas Protótipo: domínios claros, numeração, remove não usadas."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPIC = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS_PATH = EPIC / "forms.json"
GROUPS_PATH = EPIC / "class-groups.json"
WORKSPACES_PATH = EPIC / "workspaces.json"

# --- Formulários removidos do épico (F2, legado, duplicado) ---
FORMS_TO_DELETE = {
    "form-patlasv4-proto-auditoria",
    "form-patlasv4-proto-cargo-perm-visualizacao",
    "form-patlasv4-proto-cargo-permissao-processo",
    "form-patlasv4-proto-cliente",
    "form-patlasv4-proto-contrato-asset-covered",
    "form-patlasv4-proto-contrato-hist-aprovacao",
    "form-patlasv4-proto-contrato-historico",
    "form-patlasv4-proto-contrato-ic-coberto",
    "form-patlasv4-proto-contrato-linha-gasto",
    "form-patlasv4-proto-contrato-oferta",
    "form-patlasv4-proto-contrato-secundario",
    "form-patlasv4-proto-contrato-sla",
    "form-patlasv4-proto-contrato-tabela-valores",
    "form-patlasv4-proto-contrato-termo-condicao",
    "form-patlasv4-proto-contrato-usuario-coberto",
    "form-patlasv4-proto-documentos-templates",
    "form-patlasv4-proto-metodo-criar-servidor",
    "form-patlasv4-proto-metodo-criar-servidor-permissao",
    "form-patlasv4-proto-metodo-desligar-pessoa",
    "form-patlasv4-proto-metodo-inativar-acesso-pessoa",
    "form-patlasv4-proto-pessoa-outro-nome",
    "form-patlasv4-proto-pessoa-vinculo-acesso",
    "form-patlasv4-proto-usuario",
    "form-patlasv4-proto-workflow-processo",
    "form-patlasv4-proto-workflow-processo-etapa",
    "form-patlasv4-proto-bloco-reutilizavel",
    "form-patlasv4-proto-projeto",
    "form-patlasv4-proto-projeto-contato",
    "form-patlasv4-proto-projeto-tarefa",
    "form-patlasv4-proto-projeto-demanda",
    "form-patlasv4-proto-projeto-relatorio-status",
    "form-patlasv4-proto-projeto-item-relacionado",
    "form-patlasv4-proto-projeto-registro-hora",
    "form-patlasv4-proto-projeto-linha-gasto",
    "form-patlasv4-proto-raer",
    "form-patlasv4-proto-raer-indicador-entrega",
    "form-patlasv4-proto-raer-entrega-realizada",
    "form-patlasv4-proto-raer-plano-acao",
    "form-patlasv4-proto-dossie-entrega-valor",
    "form-patlasv4-proto-ev-kpi",
    "form-patlasv4-proto-ev-kpi-medicao",
    "form-patlasv4-proto-ev-plano-acao",
    "form-patlasv4-proto-ev-transicao-status",
    "form-patlasv4-proto-ev-timeline-marco",
    "form-patlasv4-proto-ev-metodo-devolver",
}

# form_id -> nome de exibição numerado (ordem cadastro → config → fluxo → assinatura)
DISPLAY_NAMES: dict[str, str] = {
    # 01 Organização
    "form-patlasv4-proto-unidade-organizacional": "(1) Organização",
    "form-patlasv4-proto-uo-conta-bancaria": "(1.1) Conta bancária",
    "form-patlasv4-proto-uo-documento": "(1.2) Documento habilitação MIPP",
    "form-patlasv4-proto-uo-doc-execucao": "(1.3) Documento execução parceria",
    "form-patlasv4-proto-uo-tributo": "(1.4) Tributos e encargos",
    "form-patlasv4-proto-uo-cargo-atribuido": "(1.5) Cargo atribuído",
    "form-patlasv4-proto-uo-pessoa-cargo": "(1.6) Pessoa no cargo",
    "form-patlasv4-proto-metodo-gerar-convite": "(1.M1) Gerar convite",
    "form-patlasv4-proto-metodo-cadastrar-cargo": "(1.M2) Cadastrar cargo",
    "form-patlasv4-proto-metodo-migrar-cargos-uo": "(1.M3) Migrar cargos UO extinta",
    # 02 Cargo
    "form-patlasv4-proto-cargo": "(2) Cargo",
    "form-patlasv4-proto-cargo-ocupante": "(2.1) Ocupante do cargo",
    # 03 Pessoa
    "form-patlasv4-proto-pessoa": "(3) Pessoa",
    "form-patlasv4-proto-pessoa-filiacao": "(3.1) Filiação",
    "form-patlasv4-proto-pessoa-habilidade": "(3.2) Habilidade",
    "form-patlasv4-proto-pessoa-exp-academica": "(3.3) Experiência acadêmica",
    "form-patlasv4-proto-pessoa-exp-profissional": "(3.4) Experiência profissional",
    "form-patlasv4-proto-pessoa-telefone": "(3.5) Telefone",
    "form-patlasv4-proto-pessoa-email": "(3.6) E-mail",
    "form-patlasv4-proto-pessoa-endereco": "(3.7) Endereço",
    "form-patlasv4-proto-pessoa-rede-social": "(3.8) Rede social",
    "form-patlasv4-proto-pessoa-atribuicao-resumo": "(3.9) Atribuição resumo",
    "form-patlasv4-proto-metodo-criar-pessoa": "(3.M1) Criar pessoa",
    "form-patlasv4-proto-metodo-opcoes-pessoa": "(3.M2) Opções pessoa",
    "form-patlasv4-proto-metodo-atribuir-cargo-pessoa": "(3.M3) Atribuir cargo",
    # 04 Convite
    "form-patlasv4-proto-convite-cadastro": "(4) Convite de cadastro",
    "form-patlasv4-proto-solicitacao-vinculo": "(4.1) Solicitação de vínculo",
    # 05 Documentos — configuração
    "form-patlasv4-proto-tipo-documento": "(5) Tipo Documento · catálogo MIPP",
    "form-patlasv4-proto-catalogo-produto-servico": "(6) Catálogo Produtos/Serviços",
    "form-patlasv4-proto-config-processo": "(7) Versões de Processo",
    "form-patlasv4-proto-versao-processo": "(7.1) Versão de processo",
    "mqb5ag1k51kz2u": "(7.2) Tipo de processo",
    "form-patlasv4-proto-clausula-ecm": "(8) Cláusula · Biblioteca ECM",
    "form-patlasv4-proto-template": "(9) Template documental",
    "form-patlasv4-proto-template-bloco": "(9.1) Bloco do template",
    "form-patlasv4-proto-modelo-contrato": "(10) Modelo de contrato",
    "form-patlasv4-proto-revisao-bloco": "(9.2) Revisão · bloco de texto",
    "form-patlasv4-proto-hist-edicao-bloco": "(9.3) Histórico edição de bloco",
    # 05 Documentos — fluxo operacional
    "form-patlasv4-proto-processos": "(11) Processos",
    "form-patlasv4-proto-proposta": "(12) Proposta",
    "form-patlasv4-proto-proposta-item-catalogo": "(12.1) Item catálogo na proposta",
    "form-patlasv4-proto-proposta-bloco-produto": "(12.2) Bloco por produto",
    "form-patlasv4-proto-revisao-documento": "(12.M0) Parâm. · Confirmar e gerar PDF",
    "form-patlasv4-proto-geracao-pdf-saida": "(12.3) Saída PDF gerado",
    "form-patlasv4-proto-documentos": "(13) Documentos gerados",
    "form-patlasv4-proto-contrato": "(14) Contrato",
    "form-patlasv4-proto-contrato-ordem-servico": "(14.1) OS vinculada ao contrato",
    "form-patlasv4-proto-contrato-produto-contratado": "(14.2) Produto contratado",
    "form-patlasv4-proto-emissao-ordem-servico": "(15) Ordem de Serviço",
    "form-patlasv4-proto-termo-homologacao": "(16) Termo de homologação",
    "form-patlasv4-proto-metodo-preparar-proposta": "(12.M1) Preparar proposta",
    "form-patlasv4-proto-metodo-aprovar-bloco-produto": "(12.M2) Aprovar/recusar bloco",
    "form-patlasv4-proto-metodo-criar-os": "(15.M1) Criar OS",
    "form-patlasv4-proto-metodo-zerar-pedido-venda": "(15.M2) Zerar pedido venda",
    # 06 Assinatura
    "mqebasqyphbwea": "(17) Workflow de Assinatura",
    "form-patlasv4-proto-painel-assinaturas-pendentes": "(18) Painel assinaturas pendentes",
    "form-patlasv4-proto-workflow-etapa": "(17.1) Etapa do workflow",
    "form-patlasv4-proto-assinatura-documentos": "(17.2) Documento do envelope",
    "form-patlasv4-proto-assinatura-signatario": "(17.3) Signatário",
    "form-patlasv4-proto-assinatura-controle-acesso": "(17.4) Controle de acesso",
    "form-patlasv4-proto-painel-assinatura-item": "(18.1) Item do painel",
    "form-patlasv4-proto-processo-envelope-historico": "(17.5) Histórico de envelope",
    "form-patlasv4-proto-metodo-enviar-assinatura": "(17.M1) Enviar para assinatura",
    "form-patlasv4-proto-metodo-recusar-assinatura": "(17.M2) Recusar assinatura",
    "form-patlasv4-proto-metodo-selecionar-metodo-assinatura": "(17.M3) Selecionar método",
    # 07 Backlog
    "form-patlasv4-proto-portal-vinculo-organizacao": "(B1) Portal vínculo organização",
    "form-patlasv4-proto-metodo-enviar-protheus": "(B2) Enviar Protheus",
    "form-patlasv4-proto-metodo-gerar-convite-saida": "(B3) Gerar convite saída",
    # 08 Servidor (backend)
    "form-patlasv4-proto-servidor": "(S1) Servidor",
    "form-patlasv4-proto-servidor-permissao": "(S1.1) Permissão servidor",
}

GROUPS = [
    {"id": "grp-01-organizacao", "name": "01 · Organização"},
    {"id": "grp-01-organizacao-emb", "name": "Embutidas", "parentGroupId": "grp-01-organizacao"},
    {"id": "grp-01-organizacao-met", "name": "Métodos", "parentGroupId": "grp-01-organizacao"},
    {"id": "grp-02-cargo", "name": "02 · Cargo"},
    {"id": "grp-02-cargo-emb", "name": "Embutidas", "parentGroupId": "grp-02-cargo"},
    {"id": "grp-03-pessoa", "name": "03 · Pessoa"},
    {"id": "grp-03-pessoa-emb", "name": "Embutidas", "parentGroupId": "grp-03-pessoa"},
    {"id": "grp-03-pessoa-met", "name": "Métodos", "parentGroupId": "grp-03-pessoa"},
    {"id": "grp-04-convite", "name": "04 · Convite"},
    {"id": "grp-05-documentos", "name": "05 · Documentos"},
    {"id": "grp-05-documentos-emb", "name": "Embutidas", "parentGroupId": "grp-05-documentos"},
    {"id": "grp-05-documentos-met", "name": "Métodos", "parentGroupId": "grp-05-documentos"},
    {"id": "grp-06-assinatura", "name": "06 · Assinatura"},
    {"id": "grp-06-assinatura-emb", "name": "Embutidas", "parentGroupId": "grp-06-assinatura"},
    {"id": "grp-06-assinatura-met", "name": "Métodos", "parentGroupId": "grp-06-assinatura"},
    {"id": "grp-07-backlog", "name": "07 · Backlog"},
    {"id": "grp-08-servidor", "name": "08 · Servidor (backend)"},
]

ASSIGNMENTS: dict[str, str] = {
    "form-patlasv4-proto-unidade-organizacional": "grp-01-organizacao",
    "form-patlasv4-proto-uo-conta-bancaria": "grp-01-organizacao-emb",
    "form-patlasv4-proto-uo-documento": "grp-01-organizacao-emb",
    "form-patlasv4-proto-uo-doc-execucao": "grp-01-organizacao-emb",
    "form-patlasv4-proto-uo-tributo": "grp-01-organizacao-emb",
    "form-patlasv4-proto-uo-cargo-atribuido": "grp-01-organizacao-emb",
    "form-patlasv4-proto-uo-pessoa-cargo": "grp-01-organizacao-emb",
    "form-patlasv4-proto-metodo-gerar-convite": "grp-01-organizacao-met",
    "form-patlasv4-proto-metodo-cadastrar-cargo": "grp-01-organizacao-met",
    "form-patlasv4-proto-metodo-migrar-cargos-uo": "grp-01-organizacao-met",
    "form-patlasv4-proto-cargo": "grp-02-cargo",
    "form-patlasv4-proto-cargo-ocupante": "grp-02-cargo-emb",
    "form-patlasv4-proto-pessoa": "grp-03-pessoa",
    "form-patlasv4-proto-pessoa-filiacao": "grp-03-pessoa-emb",
    "form-patlasv4-proto-pessoa-habilidade": "grp-03-pessoa-emb",
    "form-patlasv4-proto-pessoa-exp-academica": "grp-03-pessoa-emb",
    "form-patlasv4-proto-pessoa-exp-profissional": "grp-03-pessoa-emb",
    "form-patlasv4-proto-pessoa-telefone": "grp-03-pessoa-emb",
    "form-patlasv4-proto-pessoa-email": "grp-03-pessoa-emb",
    "form-patlasv4-proto-pessoa-endereco": "grp-03-pessoa-emb",
    "form-patlasv4-proto-pessoa-rede-social": "grp-03-pessoa-emb",
    "form-patlasv4-proto-pessoa-atribuicao-resumo": "grp-03-pessoa-emb",
    "form-patlasv4-proto-metodo-criar-pessoa": "grp-03-pessoa-met",
    "form-patlasv4-proto-metodo-opcoes-pessoa": "grp-03-pessoa-met",
    "form-patlasv4-proto-metodo-atribuir-cargo-pessoa": "grp-03-pessoa-met",
    "form-patlasv4-proto-convite-cadastro": "grp-04-convite",
    "form-patlasv4-proto-solicitacao-vinculo": "grp-04-convite",
    "form-patlasv4-proto-tipo-documento": "grp-05-documentos",
    "form-patlasv4-proto-catalogo-produto-servico": "grp-05-documentos",
    "form-patlasv4-proto-config-processo": "grp-05-documentos",
    "form-patlasv4-proto-clausula-ecm": "grp-05-documentos",
    "form-patlasv4-proto-template": "grp-05-documentos",
    "form-patlasv4-proto-modelo-contrato": "grp-05-documentos",
    "form-patlasv4-proto-processos": "grp-05-documentos",
    "form-patlasv4-proto-proposta": "grp-05-documentos",
    "form-patlasv4-proto-documentos": "grp-05-documentos",
    "form-patlasv4-proto-contrato": "grp-05-documentos",
    "form-patlasv4-proto-emissao-ordem-servico": "grp-05-documentos",
    "form-patlasv4-proto-termo-homologacao": "grp-05-documentos",
    "form-patlasv4-proto-versao-processo": "grp-05-documentos-emb",
    "mqb5ag1k51kz2u": "grp-05-documentos-emb",
    "form-patlasv4-proto-template-bloco": "grp-05-documentos-emb",
    "form-patlasv4-proto-revisao-bloco": "grp-05-documentos-emb",
    "form-patlasv4-proto-hist-edicao-bloco": "grp-05-documentos-emb",
    "form-patlasv4-proto-proposta-item-catalogo": "grp-05-documentos-emb",
    "form-patlasv4-proto-proposta-bloco-produto": "grp-05-documentos-emb",
    "form-patlasv4-proto-revisao-documento": "grp-05-documentos-emb",
    "form-patlasv4-proto-geracao-pdf-saida": "grp-05-documentos-emb",
    "form-patlasv4-proto-contrato-ordem-servico": "grp-05-documentos-emb",
    "form-patlasv4-proto-contrato-produto-contratado": "grp-05-documentos-emb",
    "form-patlasv4-proto-metodo-preparar-proposta": "grp-05-documentos-met",
    "form-patlasv4-proto-metodo-aprovar-bloco-produto": "grp-05-documentos-met",
    "form-patlasv4-proto-metodo-criar-os": "grp-05-documentos-met",
    "form-patlasv4-proto-metodo-zerar-pedido-venda": "grp-05-documentos-met",
    "mqebasqyphbwea": "grp-06-assinatura",
    "form-patlasv4-proto-painel-assinaturas-pendentes": "grp-06-assinatura",
    "form-patlasv4-proto-workflow-etapa": "grp-06-assinatura-emb",
    "form-patlasv4-proto-assinatura-documentos": "grp-06-assinatura-emb",
    "form-patlasv4-proto-assinatura-signatario": "grp-06-assinatura-emb",
    "form-patlasv4-proto-assinatura-controle-acesso": "grp-06-assinatura-emb",
    "form-patlasv4-proto-painel-assinatura-item": "grp-06-assinatura-emb",
    "form-patlasv4-proto-processo-envelope-historico": "grp-06-assinatura-emb",
    "form-patlasv4-proto-metodo-enviar-assinatura": "grp-06-assinatura-met",
    "form-patlasv4-proto-metodo-recusar-assinatura": "grp-06-assinatura-met",
    "form-patlasv4-proto-metodo-selecionar-metodo-assinatura": "grp-06-assinatura-met",
    "form-patlasv4-proto-portal-vinculo-organizacao": "grp-07-backlog",
    "form-patlasv4-proto-metodo-enviar-protheus": "grp-07-backlog",
    "form-patlasv4-proto-metodo-gerar-convite-saida": "grp-07-backlog",
    "form-patlasv4-proto-servidor": "grp-08-servidor",
    "form-patlasv4-proto-servidor-permissao": "grp-08-servidor",
}

MEMBER_ORDER: dict[str, list[str]] = {
    "grp-01-organizacao": ["form-patlasv4-proto-unidade-organizacional"],
    "grp-01-organizacao-emb": [
        "form-patlasv4-proto-uo-conta-bancaria",
        "form-patlasv4-proto-uo-documento",
        "form-patlasv4-proto-uo-doc-execucao",
        "form-patlasv4-proto-uo-tributo",
        "form-patlasv4-proto-uo-cargo-atribuido",
        "form-patlasv4-proto-uo-pessoa-cargo",
    ],
    "grp-01-organizacao-met": [
        "form-patlasv4-proto-metodo-gerar-convite",
        "form-patlasv4-proto-metodo-cadastrar-cargo",
        "form-patlasv4-proto-metodo-migrar-cargos-uo",
    ],
    "grp-02-cargo": ["form-patlasv4-proto-cargo"],
    "grp-02-cargo-emb": ["form-patlasv4-proto-cargo-ocupante"],
    "grp-03-pessoa": ["form-patlasv4-proto-pessoa"],
    "grp-03-pessoa-emb": [
        "form-patlasv4-proto-pessoa-filiacao",
        "form-patlasv4-proto-pessoa-habilidade",
        "form-patlasv4-proto-pessoa-exp-academica",
        "form-patlasv4-proto-pessoa-exp-profissional",
        "form-patlasv4-proto-pessoa-telefone",
        "form-patlasv4-proto-pessoa-email",
        "form-patlasv4-proto-pessoa-endereco",
        "form-patlasv4-proto-pessoa-rede-social",
        "form-patlasv4-proto-pessoa-atribuicao-resumo",
    ],
    "grp-03-pessoa-met": [
        "form-patlasv4-proto-metodo-criar-pessoa",
        "form-patlasv4-proto-metodo-opcoes-pessoa",
        "form-patlasv4-proto-metodo-atribuir-cargo-pessoa",
    ],
    "grp-04-convite": [
        "form-patlasv4-proto-convite-cadastro",
        "form-patlasv4-proto-solicitacao-vinculo",
    ],
    "grp-05-documentos": [
        "form-patlasv4-proto-tipo-documento",
        "form-patlasv4-proto-catalogo-produto-servico",
        "form-patlasv4-proto-config-processo",
        "form-patlasv4-proto-clausula-ecm",
        "form-patlasv4-proto-template",
        "form-patlasv4-proto-modelo-contrato",
        "form-patlasv4-proto-processos",
        "form-patlasv4-proto-proposta",
        "form-patlasv4-proto-documentos",
        "form-patlasv4-proto-contrato",
        "form-patlasv4-proto-emissao-ordem-servico",
        "form-patlasv4-proto-termo-homologacao",
    ],
    "grp-05-documentos-emb": [
        "form-patlasv4-proto-versao-processo",
        "mqb5ag1k51kz2u",
        "form-patlasv4-proto-template-bloco",
        "form-patlasv4-proto-revisao-bloco",
        "form-patlasv4-proto-hist-edicao-bloco",
        "form-patlasv4-proto-proposta-item-catalogo",
        "form-patlasv4-proto-proposta-bloco-produto",
        "form-patlasv4-proto-revisao-documento",
        "form-patlasv4-proto-geracao-pdf-saida",
        "form-patlasv4-proto-contrato-ordem-servico",
        "form-patlasv4-proto-contrato-produto-contratado",
    ],
    "grp-05-documentos-met": [
        "form-patlasv4-proto-metodo-preparar-proposta",
        "form-patlasv4-proto-metodo-aprovar-bloco-produto",
        "form-patlasv4-proto-metodo-criar-os",
        "form-patlasv4-proto-metodo-zerar-pedido-venda",
    ],
    "grp-06-assinatura": [
        "mqebasqyphbwea",
        "form-patlasv4-proto-painel-assinaturas-pendentes",
    ],
    "grp-06-assinatura-emb": [
        "form-patlasv4-proto-workflow-etapa",
        "form-patlasv4-proto-assinatura-documentos",
        "form-patlasv4-proto-assinatura-signatario",
        "form-patlasv4-proto-assinatura-controle-acesso",
        "form-patlasv4-proto-painel-assinatura-item",
        "form-patlasv4-proto-processo-envelope-historico",
    ],
    "grp-06-assinatura-met": [
        "form-patlasv4-proto-metodo-enviar-assinatura",
        "form-patlasv4-proto-metodo-recusar-assinatura",
        "form-patlasv4-proto-metodo-selecionar-metodo-assinatura",
    ],
    "grp-07-backlog": [
        "form-patlasv4-proto-portal-vinculo-organizacao",
        "form-patlasv4-proto-metodo-enviar-protheus",
        "form-patlasv4-proto-metodo-gerar-convite-saida",
    ],
    "grp-08-servidor": [
        "form-patlasv4-proto-servidor",
        "form-patlasv4-proto-servidor-permissao",
    ],
    "__sem_grupo__": [],
}

WORKSPACE_DELETE_FORMS = FORMS_TO_DELETE


def patch_linked_form_ids(obj, old: str, new: str) -> None:
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "linkedFormId" and v == old:
                obj[k] = new
            elif k == "inputFormId" and v == old:
                obj[k] = new
            else:
                patch_linked_form_ids(v, old, new)
    elif isinstance(obj, list):
        for item in obj:
            patch_linked_form_ids(item, old, new)


def remove_bloco_reutilizavel_from_template(forms: list) -> None:
    for f in forms:
        if f.get("id") != "form-patlasv4-proto-template":
            continue
        sec_id = "sec-template-blocos-reutil"
        f["sections"] = [s for s in f.get("sections", []) if s.get("id") != sec_id]
        f["fields"] = [
            fld
            for fld in f.get("fields", [])
            if fld.get("linkedFormId") != "form-patlasv4-proto-bloco-reutilizavel"
            and fld.get("id") != "patlasv4proto-template-blocos-reutilizaveis"
        ]
        f["metadata"] = (
            "Protótipo Atlas — Template documental. ABAs: Dados do Template, Blocos do Template, "
            "Cláusulas ECM. RF02 fundo + Mustache."
        )


def apply_display_names(forms: list) -> None:
    prefix_re = re.compile(r"^\([^)]+\)\s*")
    for f in forms:
        fid = f.get("id")
        if fid not in DISPLAY_NAMES:
            continue
        base = DISPLAY_NAMES[fid]
        f["name"] = base


def clean_workspaces(ws: list) -> None:
    for workspace in ws:
        for pkg in workspace.get("packages", []):
            pkg["classes"] = [
                c
                for c in pkg.get("classes", [])
                if c.get("linkedFormId") not in WORKSPACE_DELETE_FORMS
            ]


def validate_assignments(forms: list) -> None:
    form_ids = {f["id"] for f in forms}
    for fid in ASSIGNMENTS:
        if fid not in form_ids:
            raise KeyError(f"Assignment references missing form: {fid}")
    for fid in form_ids:
        if fid not in ASSIGNMENTS:
            raise ValueError(f"Form without group assignment: {fid}")


def main() -> None:
    forms = json.loads(FORMS_PATH.read_text(encoding="utf-8"))

    patch_linked_form_ids(
        forms,
        "form-patlasv4-proto-documentos-templates",
        "form-patlasv4-proto-template",
    )
    remove_bloco_reutilizavel_from_template(forms)

    forms = [f for f in forms if f.get("id") not in FORMS_TO_DELETE]
    apply_display_names(forms)
    validate_assignments(forms)

    FORMS_PATH.write_text(
        json.dumps(forms, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    groups_doc = {
        "groups": GROUPS,
        "assignments": ASSIGNMENTS,
        "memberOrderByGroup": MEMBER_ORDER,
    }
    GROUPS_PATH.write_text(
        json.dumps(groups_doc, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    ws = json.loads(WORKSPACES_PATH.read_text(encoding="utf-8"))
    clean_workspaces(ws)
    WORKSPACES_PATH.write_text(
        json.dumps(ws, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"OK — {len(forms)} forms · {len(FORMS_TO_DELETE)} removidos")
    print("Grupos: 01 Org -> 02 Cargo -> 03 Pessoa -> 04 Convite -> 05 Documentos -> 06 Assinatura")
    print("Recarregue o browser (F5) na aba Classes do épico prototipo")


if __name__ == "__main__":
    main()
