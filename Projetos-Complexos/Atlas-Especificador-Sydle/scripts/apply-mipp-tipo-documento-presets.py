#!/usr/bin/env python3
"""Tipos de documento MIPP Anexo II — Habilitação Parceria Estratégica (PDF MTI)."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS_PATH = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
WORKSPACES_PATH = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/workspaces.json"

GRUPO_FIELD = "mqlh5j3aabnkci"
GRUPOS_PDF = [
    "Habilitação Jurídica",
    "Qualificação Técnica",
    "Qualificação Econômica e Financeira",
]

# (grupo, nome) — fonte: MIPP Anexo II Habilitação Parceria Estratégica
MIPP_DOCUMENTOS: list[tuple[str, str]] = [
    # Habilitação Jurídica — itens 1–19
    (
        "Habilitação Jurídica",
        "Ato constitutivo e ata de eleição de administradores (S.A.)",
    ),
    (
        "Habilitação Jurídica",
        "Ato constitutivo, estatuto ou contrato social em vigor (sociedade empresária)",
    ),
    (
        "Habilitação Jurídica",
        "Inscrição do ato constitutivo no Registro Mercantil (sociedade simples) + diretoria",
    ),
    (
        "Habilitação Jurídica",
        "CCMEI + CPF e RG (MEI)",
    ),
    (
        "Habilitação Jurídica",
        "Registro na Junta Comercial (empresa individual)",
    ),
    (
        "Habilitação Jurídica",
        "Prova de inscrição no CNPJ",
    ),
    (
        "Habilitação Jurídica",
        "Cédula de Identidade (RG) e CPF",
    ),
    (
        "Habilitação Jurídica",
        "Procuração e documentos do representante legal",
    ),
    (
        "Habilitação Jurídica",
        "Certidão negativa de falência ou recuperação judicial",
    ),
    (
        "Habilitação Jurídica",
        "Certidão de débitos relativos a créditos tributários federais e dívida ativa da União",
    ),
    (
        "Habilitação Jurídica",
        "Prova de regularidade fiscal com a Fazenda Federal (RFB)",
    ),
    (
        "Habilitação Jurídica",
        "Prova de regularidade com o FGTS",
    ),
    (
        "Habilitação Jurídica",
        "Prova de regularidade fiscal com a Fazenda Estadual (SEFAZ/PGE)",
    ),
    (
        "Habilitação Jurídica",
        "Prova de regularidade fiscal com a Fazenda Municipal",
    ),
    (
        "Habilitação Jurídica",
        "Cadastro Nacional de Empresas Inidôneas e Suspensas (CGU)",
    ),
    (
        "Habilitação Jurídica",
        "Certidão negativa de licitantes inidôneos (TCU)",
    ),
    (
        "Habilitação Jurídica",
        "Certidão de empresa inidônea da CGE-MT",
    ),
    (
        "Habilitação Jurídica",
        "Lista de inidôneos TCE/MT ou certidão negativa",
    ),
    (
        "Habilitação Jurídica",
        "Certidão de improbidade administrativa e inelegibilidade (CNJ)",
    ),
    # Qualificação Técnica — itens 1–10
    (
        "Qualificação Técnica",
        "Atestado de capacidade técnica e qualificação de equipe",
    ),
    (
        "Qualificação Técnica",
        "Comprovação de aptidão para desempenho de atividade pertinente",
    ),
    (
        "Qualificação Técnica",
        "Histórico de negócios com a Administração Pública",
    ),
    (
        "Qualificação Técnica",
        "Proposta de transferência de conhecimento ou tecnologia para a MTI",
    ),
    (
        "Qualificação Técnica",
        "Proposta de capacitação e/ou mentoring para a MTI",
    ),
    (
        "Qualificação Técnica",
        "Premiações",
    ),
    (
        "Qualificação Técnica",
        "Trabalhos realizados com sucesso na Administração Pública",
    ),
    (
        "Qualificação Técnica",
        "Certificados reconhecidos internacionalmente",
    ),
    (
        "Qualificação Técnica",
        "Certificado de qualificação técnica (fabricantes ou clientes)",
    ),
    (
        "Qualificação Técnica",
        "Notório reconhecimento do mercado do ramo de atividade",
    ),
    # Qualificação Econômica e Financeira — itens 1–11
    (
        "Qualificação Econômica e Financeira",
        "Balanço Patrimonial (último exercício)",
    ),
    (
        "Qualificação Econômica e Financeira",
        "Demonstração do Resultado do Exercício (DRE)",
    ),
    (
        "Qualificação Econômica e Financeira",
        "Demonstração das Mutações do Patrimônio Líquido (DMPL)",
    ),
    (
        "Qualificação Econômica e Financeira",
        "Demonstração dos Fluxos de Caixa (DFC)",
    ),
    (
        "Qualificação Econômica e Financeira",
        "Demonstração de Valor Adicionado (DVA)",
    ),
    (
        "Qualificação Econômica e Financeira",
        "Notas Explicativas",
    ),
    (
        "Qualificação Econômica e Financeira",
        "Índice de Liquidez Corrente",
    ),
    (
        "Qualificação Econômica e Financeira",
        "Índice de Liquidez Seca",
    ),
    (
        "Qualificação Econômica e Financeira",
        "Índice de Liquidez Imediata",
    ),
    (
        "Qualificação Econômica e Financeira",
        "Índice de Liquidez Geral",
    ),
    (
        "Qualificação Econômica e Financeira",
        "Índice de Solvência",
    ),
]

COLORS = {
    "Habilitação Jurídica": "#0c4a6e",
    "Qualificação Técnica": "#7c3aed",
    "Qualificação Econômica e Financeira": "#b45309",
}


def find_form(forms: list, form_id: str) -> dict:
    for f in forms:
        if f.get("id") == form_id:
            return f
    raise KeyError(form_id)


def build_presets() -> list[dict]:
    presets = []
    for i, (grupo, nome) in enumerate(MIPP_DOCUMENTOS, start=1):
        presets.append(
            {
                "id": f"patlasv4proto-p-tdoc-mipp-{i:02d}",
                "name": f"{grupo} — item {i if grupo == 'Habilitação Jurídica' else ''}".strip(" —"),
                "iconColor": COLORS[grupo],
                "fieldValues": {
                    GRUPO_FIELD: grupo,
                    "patlasv4proto-tdoc-nome": nome,
                    "patlasv4proto-tdoc-categoria": "Organização",
                    "patlasv4proto-tdoc-ativo": True,
                },
            }
        )
    # Corrigir nomes dos presets para ficarem legíveis
    jur, tec, fin = 0, 0, 0
    for p, (grupo, nome) in zip(presets, MIPP_DOCUMENTOS):
        if grupo == "Habilitação Jurídica":
            jur += 1
            p["name"] = f"Jurídica {jur:02d} — {nome[:48]}{'…' if len(nome) > 48 else ''}"
        elif grupo == "Qualificação Técnica":
            tec += 1
            p["name"] = f"Técnica {tec:02d} — {nome[:48]}{'…' if len(nome) > 48 else ''}"
        else:
            fin += 1
            p["name"] = f"Financeira {fin:02d} — {nome[:48]}{'…' if len(nome) > 48 else ''}"
    return presets


def patch_grupo_options(form: dict, field_id: str) -> None:
    for f in form.get("fields", []):
        if f.get("id") == field_id:
            f["options"] = list(GRUPOS_PDF)
            return


def main() -> None:
    forms = json.loads(FORMS_PATH.read_text(encoding="utf-8"))
    tdoc = find_form(forms, "form-patlasv4-proto-tipo-documento")
    uodoc = find_form(forms, "form-patlasv4-proto-uo-documento")

    presets = build_presets()
    tdoc["exampleValuePresets"] = presets
    tdoc["activeExamplePresetId"] = presets[0]["id"]
    tdoc["metadata"] = (
        "Protótipo Atlas — Tipos de documento MIPP Anexo II (Habilitação Parceria Estratégica). "
        "Grupos: Habilitação Jurídica, Qualificação Técnica, Qualificação Econômica e Financeira. "
        "Se aplica a = Organização (empresa)."
    )

    patch_grupo_options(tdoc, GRUPO_FIELD)
    patch_grupo_options(uodoc, "mqlh6yafch5jzb")

    # Opções de referência no documento embutido (amostra representativa)
    nomes = [nome for _, nome in MIPP_DOCUMENTOS]
    for f in uodoc.get("fields", []):
        if f.get("id") == "patlasv4proto-uodoc-tipo":
            f["options"] = nomes[:12] + nomes[18:22] + nomes[28:32]

    FORMS_PATH.write_text(
        json.dumps(forms, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    ws = json.loads(WORKSPACES_PATH.read_text(encoding="utf-8"))
    preset_ids = [p["id"] for p in presets]
    for pkg in ws[0].get("packages", []):
        for cls in pkg.get("classes", []):
            if cls.get("linkedFormId") == "form-patlasv4-proto-tipo-documento":
                cls["linkedFormExamplePresetIds"] = preset_ids
    WORKSPACES_PATH.write_text(
        json.dumps(ws, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"OK — {len(presets)} tipos MIPP (Organização)")
    print(f"  Jurídica: 19 | Técnica: 10 | Financeira: 11")


if __name__ == "__main__":
    main()
