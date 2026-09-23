# -*- coding: utf-8 -*-
"""Ajusta specs/exemplos do protótipo catálogo conforme validação Discovery (minuta v0.9)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
FORMS_V4 = ROOT / "data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json"

REPLACEMENTS: list[tuple[str, str]] = [
    (
        "**RN-P-01:** exatamente 1 catálogo",
        "**RN-P-01:** produto referencia um catálogo (modelo 1:1 candidata do protótipo; formalizar cardinalidade)",
    ),
    (
        "**RN-P-01:** produto pertence a exatamente 1 catálogo",
        "**RN-P-01:** produto referencia um catálogo (modelo 1:1 candidata do protótipo; formalizar cardinalidade)",
    ),
    (
        "produto pertence a exatamente 1 catálogo",
        "produto referencia um catálogo (1:1 candidata — formalizar)",
    ),
    (
        "Cada produto referencia **um** catálogo (vínculo inverso preferencial)",
        "Cada produto referencia um catálogo (1:1 candidata do protótipo; formalizar)",
    ),
    (
        "Não existe classe Fabricante.",
        "Fabricante em texto (provisório) — não formalizar ausência definitiva de classe até confirmação.",
    ),
    (
        "Sem classe Fabricante.",
        "Fabricante em texto (provisório).",
    ),
    (
        "Discovery: fabricante = campos texto na Solução.",
        "Discovery: fabricante = campos texto na Solução (provisório).",
    ),
    (
        "Ex.: 22679 ÷ 282,58 ≈ 80,25.",
        "Fórmula candidata: unitário ÷ moeda (números oficiais pendentes de áudio/planilha).",
    ),
    (
        "ex.: crédito de serviço R$ 282,58",
        "ex.: valor da moeda universal parametrizada (número oficial a fechar)",
    ),
    (
        "Ex. Discovery: 22679 ÷ 282,58 ≈ 80,25.",
        "Exemplo ilustrativo (não oficializar): unitário ÷ moeda. ",
    ),
    (
        "Destaque no card da lista.",
        "Campo citado; destaque no card = candidata (Discovery: nome + tipo + tag de status).",
    ),
    (
        "Destaque visual no card da lista (junto com Tipo e Status).",
        "Destaque no card da lista (junto com Tipo e tag de Status) — Discovery.",
    ),
    (
        "Prazo solicitado pelo demandante.",
        "Prazo solicitado pelo responsável da unidade/secretaria (cliente = PJ).",
    ),
]

OBS_ILLUSTRATIVE = (
    "Exemplo ilustrativo de cálculo (não oficializar coeficientes até planilha/áudio). "
    "Pode vender no catálogo (Tipo 2/3) ou individualizado (Tipo 1)."
)


def patch_text(s: str) -> str:
    out = s
    for a, b in REPLACEMENTS:
        out = out.replace(a, b)
    # Soft leftover official numbers in specs
    out = re.sub(
        r"22679\s*÷\s*282[,.]58\s*≈\s*80[,.]2[56]",
        "unitário ÷ moeda (exemplo ilustrativo — não oficializar)",
        out,
    )
    return out


def walk(obj):
    if isinstance(obj, dict):
        return {k: walk(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [walk(x) for x in obj]
    if isinstance(obj, str):
        return patch_text(obj)
    return obj


def soft_produto_presets(form: dict) -> None:
    if form.get("id") != "form-patlasv4-proto-cat-produto":
        return
    # Soft relevance: Grupo = common (candidata no card); Nome/Tipo = highlight; Status = highlight if present
    for fld in form.get("fields") or []:
        fid = fld.get("id") or ""
        label = (fld.get("label") or "").lower()
        if fid.endswith("-grupo") or label == "grupo":
            fld["relevance"] = "common"
            if isinstance(fld.get("spec"), str):
                if "candidata" not in fld["spec"]:
                    fld["spec"] = patch_text(fld["spec"])
                    if "card = candidata" not in fld["spec"]:
                        fld["spec"] += (
                            "\n\n**Card:** Grupo no card = candidata (não fechada na Discovery)."
                        )
        if fid.endswith("-identificador") or label.startswith("identificador") or label == "nome":
            fld["relevance"] = "identity"
        if fid.endswith("-tipo") or label == "tipo":
            fld["relevance"] = "highlight"
        if "status" in fid and "fluxo" not in fid:
            fld["relevance"] = "highlight"
        if "cobranca" in fid or "metrica" in fid:
            # keep out of card emphasis
            if fld.get("relevance") == "highlight":
                fld["relevance"] = "common"

    for preset in form.get("exampleValuePresets") or []:
        fv = preset.get("fieldValues") or {}
        # Keep sample math workable but annotate obs
        if "form-patlasv4-proto-cat-produto-observacoes" in fv:
            fv["form-patlasv4-proto-cat-produto-observacoes"] = OBS_ILLUSTRATIVE
        # Soft note in preset name if it claims Discovery official
        name = preset.get("name") or ""
        if "Discovery" in name and "ilustr" not in name.lower():
            preset["name"] = name.replace("Discovery", "Discovery (exemplo ilustrativo)")


def soft_solucao(form: dict) -> None:
    if form.get("id") != "form-patlasv4-proto-cat-solucao":
        return
    meta = form.get("metadata") or ""
    form["metadata"] = patch_text(meta)
    if "provisório" not in (form.get("metadata") or ""):
        form["metadata"] = (form.get("metadata") or "") + " Fabricante em texto (provisório)."


def soft_parceria(form: dict) -> None:
    if form.get("id") != "form-patlasv4-proto-cat-parceria":
        return
    meta = form.get("metadata") or ""
    note = (
        "Primeiro cadastro da entidade Parceria = MTI. "
        "Primeiro carregamento de produtos = parceira + validação MTI."
    )
    if "Primeiro cadastro da entidade Parceria" not in meta:
        form["metadata"] = (meta + " " + note).strip()


def soft_dados_parceria(form: dict) -> None:
    if "dados-parceria" not in (form.get("id") or "") and "Dados de Parceria" not in (
        form.get("name") or ""
    ):
        return
    meta = form.get("metadata") or ""
    if "origem protótipo" not in meta.lower():
        form["metadata"] = (
            (meta + " Origem: protótipo — validar com MTI (não regra fechada só da Discovery).").strip()
        )


def soft_universal(form: dict) -> None:
    if form.get("id") != "form-patlasv4-proto-cat-universal":
        return
    meta = form.get("metadata") or ""
    if "objetos" not in meta.lower():
        form["metadata"] = (
            (meta + " No contrato: objetos específicos, objetos universais ou catálogo (Discovery F3).").strip()
        )


def process(path: Path) -> None:
    if not path.exists():
        print("skip missing", path)
        return
    forms = json.loads(path.read_text(encoding="utf-8"))
    forms = walk(forms)
    for form in forms:
        soft_produto_presets(form)
        soft_solucao(form)
        soft_parceria(form)
        soft_dados_parceria(form)
        soft_universal(form)
    path.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("patched", path)


def main() -> None:
    process(FORMS)
    process(FORMS_V4)


if __name__ == "__main__":
    main()
