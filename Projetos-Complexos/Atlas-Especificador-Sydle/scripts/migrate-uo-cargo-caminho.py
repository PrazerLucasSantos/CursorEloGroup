#!/usr/bin/env python3
"""Migra cargos quando UO é extinta — atualiza caminho UO nos presets/registros de Cargo.

Uso (protótipo / dados locais):
  python scripts/migrate-uo-cargo-caminho.py \\
    --origem MTI/DIRC \\
    --destino MTI/UGP \\
    [--dry-run]

Em produção Sydle: equivalente a query/update em Cargo onde
patlasv4proto-cargo-unidade-organizacional = origem → destino,
após validar patlasv4proto-uo-substituida e Ativo = Não na UO origem.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS_PATH = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
CAMPO_UO = "patlasv4proto-cargo-unidade-organizacional"
CAMPO_UO_OCUPANTE = "patlasv4proto-cargo-ocupantes-unidade-de-atuacao"


def migrate_cargo_presets(forms: list, origem: str, destino: str, dry_run: bool) -> int:
    cargo = next(f for f in forms if f.get("id") == "form-patlasv4-proto-cargo")
    count = 0
    for preset in cargo.get("exampleValuePresets", []):
        fv = preset.get("fieldValues", {})
        if fv.get(CAMPO_UO) == origem:
            count += 1
            if not dry_run:
                fv[CAMPO_UO] = destino
        for row in preset.get("embeddedRowsByFieldId", {}).get(
            "patlasv4proto-cargo-ocupantes-lista", []
        ):
            if row.get(CAMPO_UO_OCUPANTE) == origem:
                count += 1
                if not dry_run:
                    row[CAMPO_UO_OCUPANTE] = destino
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrar caminho UO nos cargos do protótipo")
    parser.add_argument("--origem", required=True, help="Caminho UO extinta (ex.: MTI/DIRC)")
    parser.add_argument("--destino", required=True, help="Caminho UO substituta (ex.: MTI/UGP)")
    parser.add_argument("--dry-run", action="store_true", help="Apenas reporta, não grava")
    args = parser.parse_args()

    forms = json.loads(FORMS_PATH.read_text(encoding="utf-8"))
    n = migrate_cargo_presets(forms, args.origem, args.destino, args.dry_run)

    if args.dry_run:
        print(f"[dry-run] {n} ocorrência(s) de {args.origem} → {args.destino}")
    else:
        FORMS_PATH.write_text(
            json.dumps(forms, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Migrados {n} registro(s): {args.origem} → {args.destino}")


if __name__ == "__main__":
    main()
