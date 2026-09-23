# -*- coding: utf-8 -*-
"""Progresso no cabecalho: grupo + etapa; nome do grupo a esquerda."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"

FORM_ETAPA = "form-patlasv4-proto-uo-etapa-documentacional"
FORM_GRUPO = "form-patlasv4-proto-uo-grupo-doc-etapa"
FORM_UO = "form-patlasv4-proto-unidade-organizacional"


def parse_prog(s: str | None) -> tuple[int, int] | None:
    if not s or not isinstance(s, str):
        return None
    m = re.match(r"^\s*(\d+)\s*/\s*(\d+)\s*$", s)
    if not m:
        return None
    return int(m.group(1)), int(m.group(2))


def sum_progress(grupos: list[dict]) -> str:
    done = total = 0
    any_ok = False
    for g in grupos:
        p = parse_prog(g.get("patlasv4proto-uogrpetapa-progresso"))
        if not p:
            tipos = g.get("patlasv4proto-uogrpetapa-tipos") or {}
            if isinstance(tipos, dict):
                n = len(tipos.get("embeddedDemoInstances") or [])
                if n:
                    # contar aprovados se houver status
                    ap = 0
                    for t in tipos.get("embeddedDemoInstances") or []:
                        if t.get("patlasv4proto-uodoc-status-validacao") == "Aprovado":
                            ap += 1
                    done += ap
                    total += n
                    any_ok = True
            continue
        any_ok = True
        done += p[0]
        total += p[1]
    if not any_ok:
        return "0/—"
    return f"{done}/{total}"


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))

    grupo = next(f for f in forms if f["id"] == FORM_GRUPO)
    for f in grupo["fields"]:
        if f["id"] == "patlasv4proto-uogrpetapa-grupo":
            f["hidden"] = True
            f["relevance"] = "identity"
            f["spec"] = (
                "Nome do grupo — identidade do acordeão (esquerda). "
                "Oculto no corpo; valor vem do catálogo ao incluir a etapa."
            )
        if f["id"] == "patlasv4proto-uogrpetapa-progresso":
            f["hidden"] = True
            f["relevance"] = "highlight"
            f["spec"] = (
                "Progresso do grupo (ex.: 12/19) — exibido à direita no cabeçalho do acordeão."
            )

    etapa = next(f for f in forms if f["id"] == FORM_ETAPA)
    fields = etapa["fields"]
    by_id = {f["id"]: f for f in fields}
    by_id["patlasv4proto-uoetapa-ordem"]["relevance"] = "common"
    if "patlasv4proto-uoetapa-progresso" not in by_id:
        # inserir antes de grupos
        idx = next(i for i, f in enumerate(fields) if f["id"] == "patlasv4proto-uoetapa-grupos")
        fields.insert(
            idx,
            {
                "id": "patlasv4proto-uoetapa-progresso",
                "label": "Progresso da etapa",
                "type": "text",
                "size": "small",
                "readOnly": True,
                "required": False,
                "multiple": False,
                "relevance": "highlight",
                "hidden": True,
                "spec": (
                    "Progresso agregado da etapa (soma dos grupos, ex.: 22/40) — "
                    "exibido à direita no cabeçalho do acordeão."
                ),
            },
        )

    org = next(f for f in forms if f["id"] == FORM_UO)
    for preset in org.get("exampleValuePresets") or []:
        emb = preset.get("embeddedRowsByFieldId") or {}
        etapas = emb.get("patlasv4proto-uo-etapas-documentacionais") or []
        for er in etapas:
            grupos_cell = er.get("patlasv4proto-uoetapa-grupos") or {}
            grupos = (
                grupos_cell.get("embeddedDemoInstances")
                if isinstance(grupos_cell, dict)
                else []
            ) or []
            for g in grupos:
                if not g.get("patlasv4proto-uogrpetapa-progresso"):
                    tipos = g.get("patlasv4proto-uogrpetapa-tipos") or {}
                    rows = (
                        tipos.get("embeddedDemoInstances")
                        if isinstance(tipos, dict)
                        else []
                    ) or []
                    ap = sum(
                        1
                        for t in rows
                        if t.get("patlasv4proto-uodoc-status-validacao") == "Aprovado"
                    )
                    g["patlasv4proto-uogrpetapa-progresso"] = f"{ap}/{len(rows) or '—'}"
            er["patlasv4proto-uoetapa-progresso"] = sum_progress(list(grupos))

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK progresso grupo+etapa no cabecalho")


if __name__ == "__main__":
    main()
