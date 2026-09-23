# -*- coding: utf-8 -*-
"""Ajusta textos de flows/portals do protótipo catálogo (validação Discovery)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATHS = [
    ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/flows.json",
    ROOT / "data/subprojects/atlas-v4/epics/atlas-prototipo/flows.json",
    ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/portals.json",
    ROOT / "data/subprojects/atlas-v4/epics/atlas-prototipo/portals.json",
]

REPLACEMENTS = [
    (
        "Produto pertence a exatamente 1 catálogo",
        "Produto referencia um catálogo (1:1 candidata — formalizar)",
    ),
    (
        "não há classe Fabricante",
        "fabricante em texto (provisório)",
    ),
    (
        "não há classe Fabricante.",
        "fabricante em texto (provisório).",
    ),
    (
        "com fabricante em campos texto (não há classe Fabricante).",
        "com fabricante em campos texto (provisório).",
    ),
    (
        "Se demandante (nível 2): gestor aprova, recusa ou devolve. Gestor/sem hierarquia: segue.",
        "Responsável da unidade/secretaria: gestor aprova, recusa ou devolve. Gestor/sem hierarquia: segue. Saldo segregado por secretaria (RN-CLI-04).",
    ),
    (
        "Card: só nome, tipo, grupo e status",
        "Card: nome + tipo + tag de status (Grupo candidata)",
    ),
    (
        "22679 ÷ 282,58 ≈ 80,25",
        "unitário ÷ moeda (exemplo ilustrativo — não oficializar)",
    ),
    (
        "22679 ÷ 282,58",
        "unitário ÷ moeda (ilustrativo)",
    ),
]


def walk(obj):
    if isinstance(obj, dict):
        return {k: walk(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [walk(x) for x in obj]
    if isinstance(obj, str):
        out = obj
        for a, b in REPLACEMENTS:
            out = out.replace(a, b)
        return out
    return obj


def main() -> None:
    for path in PATHS:
        if not path.exists():
            print("skip", path)
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        path.write_text(json.dumps(walk(data), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("patched", path)


if __name__ == "__main__":
    main()
