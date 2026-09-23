# -*- coding: utf-8 -*-
"""Atualiza Tipo Documento MIPP: obrigatórios, 3 modos de vencimento, periodicidade."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"

MODO_AUTO = "Automático"
MODO_CALC = "Calculado"
MODO_MANUAL = "Manual"
PERIODICIDADES = ["Anual", "Semestral", "Trimestral", "Mensal"]

OBRIG_MTI_ID = "mqvcgep5zzxaci"  # id existente no form


def find_form(forms: list, fid: str) -> dict:
    for f in forms:
        if f.get("id") == fid:
            return f
    raise KeyError(fid)


def find_field(form: dict, fid: str) -> dict | None:
    for f in form.get("fields", []):
        if f.get("id") == fid:
            return f
    return None


def upsert_field(form: dict, field: dict, after_id: str | None = None) -> None:
    fields = form.setdefault("fields", [])
    for i, f in enumerate(fields):
        if f.get("id") == field["id"]:
            fields[i] = {**f, **field}
            return
    if after_id:
        for i, f in enumerate(fields):
            if f.get("id") == after_id:
                fields.insert(i + 1, field)
                return
    fields.append(field)


def patch_tipo_documento(tdoc: dict) -> None:
    tdoc["metadata"] = (
        "Catálogo MIPP — Tipo de Documento. "
        "Obrigatório para parceiro * e Obrigatório MTI *. "
        "Modo de vencimento: Automático (OCR), Calculado (periodicidade) ou Manual. "
        "Periodicidade * (Anual/Semestral/Trimestral/Mensal) exigida quando modo = Calculado."
    )

    obr_parc = find_field(tdoc, "patlasv4proto-tdoc-obrigatorio-parceiro")
    if obr_parc:
        obr_parc["required"] = True
        obr_parc["label"] = "Obrigatório para parceiro"
        obr_parc["spec"] = (
            "Se Sim, o tipo entra na grade obrigatória do portal do parceiro "
            "quando o grupo MIPP estiver vinculado à organização."
        )

    obr_mti = find_field(tdoc, OBRIG_MTI_ID)
    if obr_mti:
        obr_mti["required"] = True
        obr_mti["label"] = "Obrigatório MTI"
        obr_mti["spec"] = (
            "Se Sim, o tipo é exigido também no back-office MTI "
            "(controle interno da habilitação)."
        )
        obr_mti["relevance"] = "common"
        obr_mti["hidden"] = False

    modo = find_field(tdoc, "patlasv4proto-tdoc-modo-vencimento-padrao")
    if modo:
        modo["required"] = True
        modo["options"] = [MODO_AUTO, MODO_CALC, MODO_MANUAL]
        modo["spec"] = (
            "Automático: OCR/backend lê a data no arquivo. "
            "Calculado: sistema calcula a data pela Periodicidade. "
            "Manual: responsável informa a data de vencimento."
        )

    # Periodicidade direta no Tipo (substitui recorrência embutida na UX principal)
    upsert_field(
        tdoc,
        {
            "id": "patlasv4proto-tdoc-periodicidade",
            "label": "Periodicidade",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "highlight",
            "hidden": False,
            "options": list(PERIODICIDADES),
            "spec": (
                "Obrigatória quando Modo de vencimento = Calculado. "
                "Define o intervalo usado para calcular a Data de vencimento."
            ),
        },
        after_id="patlasv4proto-tdoc-modo-vencimento-padrao",
    )

    # Esconde recorrência embutida antiga (mantém form para compatibilidade)
    rec = find_field(tdoc, "patlasv4proto-tdoc-recorrencia")
    if rec:
        rec["hidden"] = True
        rec["required"] = False
        rec["spec"] = (
            "Legado — use o campo Periodicidade. Mantido oculto para compatibilidade."
        )

    tdoc["fieldVisibilityRules"] = [
        {
            "id": "rule-tdoc-show-periodicidade-calculado",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-tdoc-modo-vencimento-padrao",
            "sourceKind": "textOptions",
            "expectedOptionText": MODO_CALC,
            "action": "show",
            "targetFieldIds": ["patlasv4proto-tdoc-periodicidade"],
        },
        {
            "id": "rule-tdoc-hide-periodicidade-automatico",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-tdoc-modo-vencimento-padrao",
            "sourceKind": "textOptions",
            "expectedOptionText": MODO_AUTO,
            "action": "hide",
            "targetFieldIds": ["patlasv4proto-tdoc-periodicidade"],
        },
        {
            "id": "rule-tdoc-hide-periodicidade-manual",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-tdoc-modo-vencimento-padrao",
            "sourceKind": "textOptions",
            "expectedOptionText": MODO_MANUAL,
            "action": "hide",
            "targetFieldIds": ["patlasv4proto-tdoc-periodicidade"],
        },
        {
            "id": "rule-tdoc-hide-recorrencia-sempre",
            "operator": "eq",
            "sourceFieldId": "patlasv4proto-tdoc-ativo",
            "sourceKind": "boolean",
            "expectedBool": True,
            "action": "hide",
            "targetFieldIds": ["patlasv4proto-tdoc-recorrencia"],
        },
    ]


def patch_recorrencia_form(rec: dict) -> None:
    """Alinha form legado de recorrência às 4 periodicidades."""
    per = find_field(rec, "patlasv4proto-tdocrec-periodicidade")
    if per:
        per["options"] = list(PERIODICIDADES)
        per["required"] = True
        per["spec"] = "Periodicidade de renovação: Anual, Semestral, Trimestral ou Mensal."
    for p in rec.get("exampleValuePresets", []):
        fv = p.get("fieldValues", {})
        if fv.get("patlasv4proto-tdocrec-periodicidade") not in PERIODICIDADES:
            fv["patlasv4proto-tdocrec-periodicidade"] = "Anual"


def patch_uo_documento(uodoc: dict) -> None:
    uodoc["metadata"] = (
        "Documento de habilitação MIPP. Modo herdado do Tipo: "
        "Automático (OCR), Calculado (periodicidade) ou Manual. "
        "Se OCR falhar no modo Automático, origem passa a Manual (correção OCR). "
        "Status de validação: Pendente/Vencido (sistema); Aprovado/Recusado (MTI humana F1)."
    )

    modo = find_field(uodoc, "patlasv4proto-uodoc-modo-vencimento")
    if modo:
        modo["options"] = [MODO_AUTO, MODO_CALC, MODO_MANUAL]
        modo["spec"] = (
            "Somente leitura — herdado do Tipo de Documento. "
            "Automático: OCR. Calculado: periodicidade do tipo. Manual: data informada."
        )

    origem = find_field(uodoc, "patlasv4proto-uodoc-origem-vencimento")
    if origem:
        origem["options"] = [
            "OCR (automático)",
            "Calculado (periodicidade)",
            "Manual",
            "Manual (correção OCR)",
        ]
        origem["spec"] = (
            "Como a data foi definida: OCR; cálculo pela periodicidade; "
            "manual pelo responsável; ou manual após falha do OCR."
        )

    # Periodicidade herdada (somente leitura) no documento da org
    upsert_field(
        uodoc,
        {
            "id": "patlasv4proto-uodoc-periodicidade",
            "label": "Periodicidade",
            "type": "textOptions",
            "size": "small",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "options": list(PERIODICIDADES),
            "spec": "Herdada do Tipo quando Modo = Calculado.",
        },
        after_id="patlasv4proto-uodoc-modo-vencimento",
    )


def guess_modo(nome: str) -> tuple[str, str | None]:
    """Heurística de preset: certidões → Calculado/Anual; atos → Manual; CNPJ → Automático."""
    n = nome.lower()
    if "cnpj" in n or "certidão" in n or "certidao" in n or "cnd" in n or "fgts" in n:
        if "cnpj" in n and "prova" in n:
            return MODO_AUTO, None
        if "certidão" in n or "certidao" in n or "débito" in n or "debito" in n or "fgts" in n:
            return MODO_CALC, "Anual"
        return MODO_AUTO, None
    if "ato constitutivo" in n or "contrato social" in n or "estatuto" in n or "ccmei" in n:
        return MODO_MANUAL, None
    if "balanço" in n or "balanco" in n or "demonstração" in n or "demonstracao" in n:
        return MODO_CALC, "Anual"
    if "índice" in n or "indice" in n:
        return MODO_CALC, "Anual"
    return MODO_CALC, "Anual"


def patch_presets(tdoc: dict) -> None:
    for p in tdoc.get("exampleValuePresets", []):
        fv = p.setdefault("fieldValues", {})
        fv["patlasv4proto-tdoc-obrigatorio-parceiro"] = True
        fv[OBRIG_MTI_ID] = True
        nome = fv.get("patlasv4proto-tdoc-nome", "")
        modo, per = guess_modo(nome)
        # Migrar valores antigos
        old = fv.get("patlasv4proto-tdoc-modo-vencimento-padrao", "")
        if old in ("Manual / Recorrente", "Automático (backend)"):
            pass  # overwritten below
        fv["patlasv4proto-tdoc-modo-vencimento-padrao"] = modo
        if per:
            fv["patlasv4proto-tdoc-periodicidade"] = per
        else:
            fv.pop("patlasv4proto-tdoc-periodicidade", None)
        # Limpar recorrência embutida legada nos presets
        fv.pop("patlasv4proto-tdoc-recorrencia", None)


def patch_embedded_examples(forms: list) -> None:
    """Atualiza exemplos embutidos na Organização que citam modo antigo."""
    org = find_form(forms, "form-patlasv4-proto-unidade-organizacional")
    for preset in org.get("exampleValuePresets", []):
        rows_by = preset.get("embeddedRowsByFieldId", {})
        for _fid, rows in rows_by.items():
            if not isinstance(rows, list):
                continue
            for row in rows:
                if not isinstance(row, dict):
                    continue
                if "patlasv4proto-uodoc-modo-vencimento" in row:
                    old = row["patlasv4proto-uodoc-modo-vencimento"]
                    if old == "Automático (backend)":
                        row["patlasv4proto-uodoc-modo-vencimento"] = MODO_AUTO
                    elif old == "Manual / Recorrente":
                        row["patlasv4proto-uodoc-modo-vencimento"] = MODO_CALC
                        row.setdefault("patlasv4proto-uodoc-periodicidade", "Anual")
                if row.get("patlasv4proto-uodoc-origem-vencimento") == "Recorrência (calculada)":
                    row["patlasv4proto-uodoc-origem-vencimento"] = "Calculado (periodicidade)"


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    tdoc = find_form(forms, "form-patlasv4-proto-tipo-documento")
    uodoc = find_form(forms, "form-patlasv4-proto-uo-documento")
    rec = find_form(forms, "form-patlasv4-proto-tdoc-recorrencia")

    patch_tipo_documento(tdoc)
    patch_uo_documento(uodoc)
    patch_recorrencia_form(rec)
    patch_presets(tdoc)
    patch_embedded_examples(forms)

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK Tipo Documento + Documento MIPP atualizados")
    print(f"  Modos: {MODO_AUTO} | {MODO_CALC} | {MODO_MANUAL}")
    print(f"  Periodicidade: {', '.join(PERIODICIDADES)}")
    print(f"  Presets: {len(tdoc.get('exampleValuePresets', []))}")


if __name__ == "__main__":
    main()
