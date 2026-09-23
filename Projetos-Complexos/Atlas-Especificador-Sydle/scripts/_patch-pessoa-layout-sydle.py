# -*- coding: utf-8 -*-
"""Alinha classe Pessoa ao layout Sydle (Dados Pessoais / Complementares / Profissional / Contato)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS_PATH = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"

FORM_PESSOA = "form-patlasv4-proto-pessoa"
FORM_DOC = "form-patlasv4-proto-pessoa-documento"
FORM_FIL = "form-patlasv4-proto-pessoa-filiacao"
FORM_TEL = "form-patlasv4-proto-pessoa-telefone"
FORM_EML = "form-patlasv4-proto-pessoa-email"
FORM_END = "form-patlasv4-proto-pessoa-endereco"
FORM_RED = "form-patlasv4-proto-pessoa-rede-social"

ALERT_PROTHEUS = """<div class="proto-alert proto-alert--warn">
  <strong>Protheus</strong>
  <p>Não foi possível se conectar ao Protheus para obtenção automática da matrícula do servidor. Se desejar, pode inserir manualmente.</p>
</div>
<style>
  .proto-alert { margin: 0 0 12px; padding: 10px 12px; border-radius: 8px; border: 1px solid #eab30866; background: #fefce8; color: #854d0e; font-size: 0.9rem; }
  .proto-alert p { margin: 4px 0 0; }
</style>"""

SECTIONS = [
    {"id": "sec-pes-dados-pessoais", "title": "Dados Pessoais", "icon": "badge"},
    {"id": "sec-pes-info-complementares", "title": "Informações Complementares", "icon": "info"},
    {"id": "sec-pes-profissional", "title": "Profissional", "icon": "work"},
    {"id": "sec-pes-contato", "title": "Contato", "icon": "contact_mail"},
    {"id": "sec-pes-credenciais", "title": "Credenciais", "icon": "lock", "hidden": True},
]


def form_documento() -> dict:
    return {
        "id": FORM_DOC,
        "name": "Documento da pessoa",
        "sectionLayout": "none",
        "defaultCanvasMode": "edit",
        "metadata": "Linha da tabela Documentos: Tipo, Número e Arquivo.",
        "fields": [
            {
                "id": "patlasv4proto-pdoc-tipo",
                "label": "Tipo",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "options": ["CPF", "RG", "CNH", "Passaporte", "RNE", "Certidão", "Outro"],
                "spec": "Tipo do documento de identificação.",
            },
            {
                "id": "patlasv4proto-pdoc-numero",
                "label": "Número",
                "type": "text",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "spec": "Número do documento.",
            },
            {
                "id": "patlasv4proto-pdoc-arquivo",
                "label": "Arquivo",
                "type": "file",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "spec": "Cópia digitalizada (PDF, JPG ou PNG).",
            },
        ],
        "exampleValuePresets": [],
    }


def upsert_form(forms: list[dict], form: dict) -> None:
    for i, f in enumerate(forms):
        if f.get("id") == form["id"]:
            # preserve presets if any
            if f.get("exampleValuePresets") and not form.get("exampleValuePresets"):
                form["exampleValuePresets"] = f["exampleValuePresets"]
            if f.get("activeExamplePresetId") and not form.get("activeExamplePresetId"):
                form["activeExamplePresetId"] = f["activeExamplePresetId"]
            forms[i] = form
            return
    forms.insert(0, form)


def main() -> None:
    forms = json.loads(FORMS_PATH.read_text(encoding="utf-8"))

    upsert_form(forms, form_documento())

    # --- Filiação ---
    for f in forms:
        if f.get("id") != FORM_FIL:
            continue
        f["metadata"] = "Linha embutida — Filiação (Nome, Nome social, Sexo, Grau de relacionamento)."
        f["fields"] = [
            {
                "id": "patlasv4proto-pfil-nome",
                "label": "Nome",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "spec": "Nome completo do familiar ou responsável.",
            },
            {
                "id": "patlasv4proto-pfil-nome-social",
                "label": "Nome social",
                "type": "text",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "spec": "Nome social, quando houver.",
            },
            {
                "id": "patlasv4proto-pfil-sexo",
                "label": "Sexo",
                "type": "textOptions",
                "size": "small",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "options": ["Masculino", "Feminino"],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pfil-tipo-vinculo",
                "label": "Grau de relacionamento",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "options": ["Pai", "Mãe", "Guardião", "Representante legal"],
                "spec": "Grau de relacionamento (Sydle).",
            },
        ]

    # --- Telefone ---
    for f in forms:
        if f.get("id") != FORM_TEL:
            continue
        for fld in f.get("fields") or []:
            if fld.get("id") == "patlasv4proto-ptel-tipo":
                fld["options"] = [
                    "Celular",
                    "Comercial",
                    "Residencial",
                    "WhatsApp",
                    "MT Login",
                    "Outro",
                ]
            if fld.get("id") == "patlasv4proto-ptel-ramal":
                fld["label"] = "Ramal"
                fld["hidden"] = False

    # --- E-mail ---
    for f in forms:
        if f.get("id") != FORM_EML:
            continue
        for fld in f.get("fields") or []:
            if fld.get("id") == "patlasv4proto-peml-tipo":
                fld["options"] = ["MT Login", "Pessoal", "Comercial", "Institucional", "Outro"]

    # --- Rede social ---
    for f in forms:
        if f.get("id") != FORM_RED:
            continue
        f["fields"] = [
            {
                "id": "patlasv4proto-pred-rede",
                "label": "Rede Social",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "options": [
                    "Blog",
                    "Facebook",
                    "Google Maps",
                    "Instagram",
                    "LinkedIn",
                    "TikTok",
                    "X",
                    "YouTube",
                ],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pred-url",
                "label": "Url",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "highlight",
                "spec": "",
            },
            {
                "id": "patlasv4proto-pred-dados-adicionais",
                "label": "Dados adicionais",
                "type": "text",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "spec": "Metadados extras (no Sydle abre edição auxiliar).",
            },
            {
                "id": "patlasv4proto-pred-usuario",
                "label": "Usuário",
                "type": "text",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "hidden": True,
                "spec": "Legado — preferir Dados adicionais.",
            },
        ]

    # --- Pessoa principal ---
    for f in forms:
        if f.get("id") != FORM_PESSOA:
            continue
        presets = f.get("exampleValuePresets") or []
        active = f.get("activeExamplePresetId")
        methods = f.get("methods") or []

        f["name"] = "Pessoa"
        f["sectionLayout"] = "accordion"
        f["defaultCanvasMode"] = "edit"
        f["metadata"] = (
            "Protótipo Atlas — Pessoa alinhada ao Sydle. Acordeões: Dados Pessoais, "
            "Informações Complementares, Profissional e Contato."
        )
        f["sections"] = [s for s in SECTIONS if not s.get("hidden")] + [
            {"id": "sec-pes-credenciais", "title": "Credenciais", "icon": "lock"}
        ]

        f["fields"] = [
            # Dados Pessoais
            {
                "id": "patlasv4proto-pes-nome",
                "label": "Nome",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": True,
                "multiple": False,
                "relevance": "identity",
                "sectionId": "sec-pes-dados-pessoais",
                "spec": "Nome completo. Obrigatório.",
            },
            {
                "id": "patlasv4proto-pes-outros-nomes",
                "label": "Outros nomes",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pes-dados-pessoais",
                "spec": "Lista de outros nomes (adicionar com +).",
            },
            {
                "id": "patlasv4proto-pes-foto",
                "label": "Foto",
                "type": "file",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-dados-pessoais",
                "spec": "PNG, JPG ou PDF.",
            },
            {
                "id": "patlasv4proto-pes-nasc",
                "label": "Data de nascimento",
                "type": "date",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-dados-pessoais",
                "spec": "Não pode ser futura.",
            },
            {
                "id": "patlasv4proto-pes-falecido",
                "label": "Falecido?",
                "type": "boolean",
                "size": "small",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-dados-pessoais",
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-documentos",
                "label": "Documentos",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pes-dados-pessoais",
                "linkedFormId": FORM_DOC,
                "embeddedDisplay": "table",
                "spec": "Tabela: Tipo, Número, Arquivo.",
            },
            # Informações Complementares
            {
                "id": "patlasv4proto-pes-filiacao",
                "label": "Filiação",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pes-info-complementares",
                "linkedFormId": FORM_FIL,
                "embeddedDisplay": "table",
                "spec": "Nome, Nome social, Sexo, Grau de relacionamento.",
            },
            {
                "id": "patlasv4proto-pes-sexo",
                "label": "Sexo",
                "type": "textOptions",
                "size": "small",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-info-complementares",
                "options": ["Masculino", "Feminino"],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-genero",
                "label": "Gênero",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-info-complementares",
                "options": ["Homem", "Mulher", "Não binário", "Outro"],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-deficiencias",
                "label": "Deficiências",
                "type": "textOptions",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pes-info-complementares",
                "options": [
                    "Física",
                    "Auditiva",
                    "Visual",
                    "Intelectual",
                    "Mental",
                    "Reabilitado/readaptado",
                ],
                "spec": "Multi-seleção (chips).",
            },
            {
                "id": "patlasv4proto-pes-pais-nasc",
                "label": "País de nascimento",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-info-complementares",
                "options": ["Brasil", "Argentina", "Paraguai", "Bolívia", "Outro"],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-nacionalidade",
                "label": "Nacionalidade",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-info-complementares",
                "options": ["Brasil", "Argentina", "Paraguai", "Bolívia", "Outro"],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-naturalidade",
                "label": "Naturalidade",
                "type": "textOptions",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-info-complementares",
                "options": [
                    "Laranjeiras do Sul / Paraná",
                    "Cuiabá/MT",
                    "Várzea Grande/MT",
                    "Brasília/DF",
                    "São Paulo/SP",
                    "Quedas do Iguaçu / Paraná",
                    "Outro",
                ],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-estado-civil",
                "label": "Estado Civil",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-info-complementares",
                "options": ["Solteiro", "Casado", "Divorciado", "Viúvo", "União estável"],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-cor-raca",
                "label": "Cor ou raça",
                "type": "textOptions",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-info-complementares",
                "options": ["Branca", "Preta", "Parda", "Amarela", "Indígena"],
                "spec": "",
            },
            # Profissional
            {
                "id": "patlasv4proto-pes-html-alerta-protheus",
                "type": "html",
                "label": "",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "htmlContent": ALERT_PROTHEUS,
                "spec": "Alerta quando a integração Protheus não retorna a matrícula.",
            },
            {
                "id": "patlasv4proto-pes-perfil",
                "label": "Perfil",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "hidden": True,
                "options": ["MTI", "Parceiro", "Cliente"],
                "spec": "Perfil de sistema (oculto no layout Sydle atual; usado em regras).",
            },
            {
                "id": "patlasv4proto-pes-organizacao",
                "label": "Organização",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-pes-profissional",
                "linkedFormId": "form-patlasv4-proto-unidade-organizacional",
                "options": [
                    "Empresa Mato-grossense de Tecnologia da Informação / MTI",
                    "EloGroup / EloGP",
                    "Secretaria de Estado de Planejamento e Gestão / SEPLAG",
                ],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-unidade",
                "label": "Unidade organizacional",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "hidden": True,
                "linkedFormId": "form-patlasv4-proto-unidade-organizacional",
                "options": [
                    "MTI",
                    "MTI/DIRC",
                    "MTI/DTIC",
                    "EloGroup",
                    "SEPLAG/GECON",
                ],
                "spec": "Oculto no layout Sydle; caminho pode vir na Organização.",
            },
            {
                "id": "patlasv4proto-pes-cargo",
                "label": "Cargo",
                "type": "reference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "linkedFormId": "form-patlasv4-proto-cargo",
                "options": [
                    "Diretor DIRC",
                    "Analista DIRC",
                    "Analista DTIC",
                    "Gerente de Projetos",
                    "Fiscal de Contrato",
                    "Responsável legal",
                    "Analista comercial",
                    "Gestor de contratos",
                ],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-matricula",
                "label": "Matrícula",
                "type": "text",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "hidden": True,
                "spec": "Inserção manual quando Protheus falha (perfil MTI).",
            },
            {
                "id": "patlasv4proto-pes-condicao-cargo",
                "label": "Condição",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "options": ["Titular", "Substituto", "Suplente"],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-regiao-atuacao",
                "label": "Região de atuação",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "options": [
                    "Todos",
                    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
                    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
                    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
                ],
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-data-inicio",
                "label": "Data de início",
                "type": "date",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "spec": "Início da ocupação no cargo.",
            },
            {
                "id": "patlasv4proto-pes-data-fim",
                "label": "Data de fim",
                "type": "date",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "spec": "Fim da ocupação, quando houver.",
            },
            {
                "id": "patlasv4proto-pes-status-vinculo-funcional",
                "label": "Status vínculo funcional",
                "type": "textOptions",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "hidden": True,
                "options": ["Ativo", "Inativo", "Suspenso", "Aguardando validação Protheus"],
                "spec": "Oculto no layout Sydle atual.",
            },
            {
                "id": "patlasv4proto-pes-data-validacao-protheus",
                "label": "Data última validação Protheus",
                "type": "date",
                "size": "medium",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-profissional",
                "hidden": True,
                "spec": "",
            },
            # Contato
            {
                "id": "patlasv4proto-pes-telefones",
                "label": "Telefones",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pes-contato",
                "linkedFormId": FORM_TEL,
                "embeddedDisplay": "table",
                "spec": "Tipo, País, DDI, Número, Ramal.",
            },
            {
                "id": "patlasv4proto-pes-emails",
                "label": "E-mails",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pes-contato",
                "linkedFormId": FORM_EML,
                "embeddedDisplay": "table",
                "spec": "Tipo e Email.",
            },
            {
                "id": "patlasv4proto-pes-email-principal",
                "label": "E-mail principal",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "sectionId": "sec-pes-contato",
                "spec": "Seleção/destaque do e-mail principal.",
            },
            {
                "id": "patlasv4proto-pes-enderecos",
                "label": "Endereços",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pes-contato",
                "linkedFormId": FORM_END,
                "embeddedDisplay": "form",
                "spec": "Lista de endereços (acordeão / +).",
            },
            {
                "id": "patlasv4proto-pes-redes",
                "label": "Redes sociais",
                "type": "embeddedReference",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": True,
                "relevance": "common",
                "sectionId": "sec-pes-contato",
                "linkedFormId": FORM_RED,
                "embeddedDisplay": "table",
                "spec": "Rede Social, Url, Dados adicionais.",
            },
            # Credenciais (mantidas, seção própria)
            {
                "id": "patlasv4proto-pes-ativo-acesso",
                "label": "Ativo para acesso",
                "type": "boolean",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-credenciais",
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-login",
                "label": "Login",
                "type": "text",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-credenciais",
                "hidden": True,
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-senha",
                "label": "Senha",
                "type": "text",
                "size": "medium",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-credenciais",
                "hidden": True,
                "spec": "",
            },
            {
                "id": "patlasv4proto-pes-token-certificado",
                "label": "Token do certificado digital",
                "type": "text",
                "size": "large",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "sectionId": "sec-pes-credenciais",
                "spec": "",
            },
        ]

        # Migrate document rows in presets from uodoc → pdoc
        for p in presets:
            emb = p.get("embeddedRowsByFieldId") or {}
            docs = emb.get("patlasv4proto-pes-documentos")
            if isinstance(docs, list):
                new_docs = []
                for row in docs:
                    if not isinstance(row, dict):
                        continue
                    if "patlasv4proto-pdoc-tipo" in row or "patlasv4proto-pdoc-numero" in row:
                        new_docs.append(row)
                        continue
                    new_docs.append(
                        {
                            "patlasv4proto-pdoc-tipo": row.get("patlasv4proto-uodoc-tipo")
                            or row.get("tipo")
                            or "CPF",
                            "patlasv4proto-pdoc-numero": row.get("patlasv4proto-uodoc-numero")
                            or row.get("numero")
                            or "",
                            "patlasv4proto-pdoc-arquivo": row.get("patlasv4proto-uodoc-arquivo")
                            or row.get("arquivo"),
                        }
                    )
                emb["patlasv4proto-pes-documentos"] = new_docs
                p["embeddedRowsByFieldId"] = emb
            # normalize estado civil labels
            fv = p.get("fieldValues") or {}
            ec = fv.get("patlasv4proto-pes-estado-civil")
            if isinstance(ec, str):
                fv["patlasv4proto-pes-estado-civil"] = (
                    ec.replace("(a)", "").replace("Solteiro", "Solteiro").strip()
                )
                if fv["patlasv4proto-pes-estado-civil"] == "Solteiro":
                    pass
                elif "Solteiro" in ec:
                    fv["patlasv4proto-pes-estado-civil"] = "Solteiro"
                elif "Casado" in ec:
                    fv["patlasv4proto-pes-estado-civil"] = "Casado"
                elif "Divorciado" in ec:
                    fv["patlasv4proto-pes-estado-civil"] = "Divorciado"
                elif "Viúvo" in ec:
                    fv["patlasv4proto-pes-estado-civil"] = "Viúvo"
            p["fieldValues"] = fv

        # Add Lucas DOS SANTOS preset matching screenshots
        lucas = {
            "id": "patlasv4proto-p-pessoa-lucas-santos",
            "name": "LUCAS DOS SANTOS",
            "iconColor": "#0F6CBD",
            "fieldValues": {
                "patlasv4proto-pes-nome": "LUCAS DOS SANTOS",
                "patlasv4proto-pes-nasc": "28/02/2000",
                "patlasv4proto-pes-falecido": False,
                "patlasv4proto-pes-sexo": "Masculino",
                "patlasv4proto-pes-genero": "Homem",
                "patlasv4proto-pes-deficiencias": [
                    "Física",
                    "Auditiva",
                    "Visual",
                    "Intelectual",
                    "Mental",
                    "Reabilitado/readaptado",
                ],
                "patlasv4proto-pes-pais-nasc": "Brasil",
                "patlasv4proto-pes-nacionalidade": "Brasil",
                "patlasv4proto-pes-naturalidade": "Laranjeiras do Sul / Paraná",
                "patlasv4proto-pes-estado-civil": "Solteiro",
                "patlasv4proto-pes-cor-raca": "Branca",
                "patlasv4proto-pes-organizacao": "EloGroup / EloGP",
                "patlasv4proto-pes-perfil": "Parceiro",
                "patlasv4proto-pes-email-principal": "contatolucas.dsantos@gmail.com",
                "patlasv4proto-pes-ativo-acesso": True,
                "patlasv4proto-pes-login": "lucas.santos",
            },
            "embeddedRowsByFieldId": {
                "patlasv4proto-pes-documentos": [
                    {
                        "patlasv4proto-pdoc-tipo": "CPF",
                        "patlasv4proto-pdoc-numero": "117.349.439-12",
                        "patlasv4proto-pdoc-arquivo": "Imagem.pdf",
                    }
                ],
                "patlasv4proto-pes-filiacao": [
                    {
                        "patlasv4proto-pfil-nome": "LUCAS DOS SANTOS",
                        "patlasv4proto-pfil-sexo": "Masculino",
                        "patlasv4proto-pfil-tipo-vinculo": "Pai",
                    },
                    {
                        "patlasv4proto-pfil-nome": "LUCAS DOS SANTOS",
                        "patlasv4proto-pfil-sexo": "Feminino",
                        "patlasv4proto-pfil-tipo-vinculo": "Mãe",
                    },
                    {
                        "patlasv4proto-pfil-nome": "LUCAS DOS SANTOS",
                        "patlasv4proto-pfil-sexo": "Masculino",
                        "patlasv4proto-pfil-tipo-vinculo": "Guardião",
                    },
                    {
                        "patlasv4proto-pfil-nome": "LUCAS DOS SANTOS",
                        "patlasv4proto-pfil-sexo": "Feminino",
                        "patlasv4proto-pfil-tipo-vinculo": "Representante legal",
                    },
                ],
                "patlasv4proto-pes-telefones": [
                    {
                        "patlasv4proto-ptel-tipo": "Celular",
                        "patlasv4proto-ptel-pais": "Brasil",
                        "patlasv4proto-ptel-ddi": "+55",
                        "patlasv4proto-ptel-numero": "(46) 90011-2233",
                    },
                    {
                        "patlasv4proto-ptel-tipo": "Comercial",
                        "patlasv4proto-ptel-pais": "Brasil",
                        "patlasv4proto-ptel-ddi": "+55",
                        "patlasv4proto-ptel-numero": "(46) 90011-2233",
                        "patlasv4proto-ptel-ramal": "1234567890",
                    },
                    {
                        "patlasv4proto-ptel-tipo": "MT Login",
                        "patlasv4proto-ptel-pais": "Brasil",
                        "patlasv4proto-ptel-ddi": "+55",
                        "patlasv4proto-ptel-numero": "(46) 90011-2233",
                    },
                    {
                        "patlasv4proto-ptel-tipo": "Residencial",
                        "patlasv4proto-ptel-pais": "Brasil",
                        "patlasv4proto-ptel-ddi": "+55",
                        "patlasv4proto-ptel-numero": "(46) 90011-2233",
                    },
                    {
                        "patlasv4proto-ptel-tipo": "WhatsApp",
                        "patlasv4proto-ptel-pais": "Brasil",
                        "patlasv4proto-ptel-ddi": "+55",
                        "patlasv4proto-ptel-numero": "(46) 90011-2233",
                    },
                ],
                "patlasv4proto-pes-emails": [
                    {
                        "patlasv4proto-peml-tipo": "MT Login",
                        "patlasv4proto-peml-email": "morgota.lucas@gmail.com",
                    },
                    {
                        "patlasv4proto-peml-tipo": "Pessoal",
                        "patlasv4proto-peml-email": "morgota.lucas@gmail.com",
                    },
                    {
                        "patlasv4proto-peml-tipo": "Comercial",
                        "patlasv4proto-peml-email": "contatolucas.dsantos@gmail.com",
                    },
                ],
                "patlasv4proto-pes-enderecos": [
                    {
                        "patlasv4proto-pend-logradouro": "Sandalo",
                        "patlasv4proto-pend-cidade": "Quedas do Iguaçu",
                        "patlasv4proto-pend-estado": "Paraná",
                        "patlasv4proto-pend-pais": "Brasil",
                        "patlasv4proto-pend-bairro": "Centro",
                        "patlasv4proto-pend-numero": "S/N",
                        "patlasv4proto-pend-cep": "85450-000",
                    }
                ],
                "patlasv4proto-pes-redes": [
                    {
                        "patlasv4proto-pred-rede": "Blog",
                        "patlasv4proto-pred-url": "https://blog.exemplo.com/lucas",
                    },
                    {
                        "patlasv4proto-pred-rede": "Facebook",
                        "patlasv4proto-pred-url": "https://facebook.com/lucas",
                        "patlasv4proto-pred-dados-adicionais": "Editar",
                    },
                    {
                        "patlasv4proto-pred-rede": "Google Maps",
                        "patlasv4proto-pred-url": "https://Rua teste. 270 - bairro teste, São Paulo - SP, 05413-010",
                        "patlasv4proto-pred-dados-adicionais": "Editar",
                    },
                    {
                        "patlasv4proto-pred-rede": "Instagram",
                        "patlasv4proto-pred-url": "https://instagram.com/lucas",
                    },
                    {
                        "patlasv4proto-pred-rede": "LinkedIn",
                        "patlasv4proto-pred-url": "https://linkedin.com/in/lucas",
                        "patlasv4proto-pred-dados-adicionais": "Editar",
                    },
                    {
                        "patlasv4proto-pred-rede": "TikTok",
                        "patlasv4proto-pred-url": "https://tiktok.com/@lucas",
                    },
                    {
                        "patlasv4proto-pred-rede": "X",
                        "patlasv4proto-pred-url": "https://x.com/lucas",
                    },
                    {
                        "patlasv4proto-pred-rede": "YouTube",
                        "patlasv4proto-pred-url": "https://youtube.com/@lucas",
                    },
                ],
            },
        }
        if not any(p.get("id") == lucas["id"] for p in presets):
            presets.insert(0, lucas)

        f["exampleValuePresets"] = presets
        f["activeExamplePresetId"] = "patlasv4proto-p-pessoa-lucas-santos"
        f["methods"] = methods
        f["fieldVisibilityRules"] = [
            {
                "id": "rule-pes-show-login-senha",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-pes-ativo-acesso",
                "sourceKind": "boolean",
                "expectedBoolean": True,
                "action": "show",
                "targetFieldIds": [
                    "patlasv4proto-pes-login",
                    "patlasv4proto-pes-senha",
                ],
            },
            {
                "id": "rule-pes-show-matricula-perfil-mti",
                "operator": "eq",
                "sourceFieldId": "patlasv4proto-pes-perfil",
                "sourceKind": "textOptions",
                "expectedOptionText": "MTI",
                "action": "show",
                "targetFieldIds": ["patlasv4proto-pes-matricula"],
            },
        ]

    FORMS_PATH.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK Pessoa alinhada ao Sydle")


if __name__ == "__main__":
    main()
