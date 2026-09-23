# -*- coding: utf-8 -*-
"""Duplica épico atlas-prototipo/prototipo → atlas-prototipo/atlas-v2."""
from __future__ import annotations

import json
import shutil
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUB = ROOT / "data/subprojects/atlas-prototipo/epics"
SRC = SUB / "prototipo"
DST = SUB / "atlas-v2"


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"Origem não encontrada: {SRC}")
    if DST.exists():
        raise SystemExit(f"Destino já existe: {DST} — remova ou renomeie antes de duplicar.")

    shutil.copytree(SRC, DST)

    epic_meta = {"name": "Atlas V2"}
    (DST / "epic.json").write_text(json.dumps(epic_meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    ctx = (DST / "context.md").read_text(encoding="utf-8")
    body = ctx.split("\n", 1)[1] if "\n" in ctx else ""
    ctx = (
        "# Atlas V2\n\n"
        f"Cópia do épico **Atlas Protótipo** (`prototipo`) em {date.today().isoformat()}.\n"
        "Baseline F2 validado 31/08/2026 — evolução independente a partir daqui.\n\n"
        + body.lstrip("\n")
    )
    (DST / "context.md").write_text(ctx, encoding="utf-8")

    ws_path = DST / "workspaces.json"
    if ws_path.exists():
        workspaces = json.loads(ws_path.read_text(encoding="utf-8"))
        for ws in workspaces:
            if ws.get("id") == "ws-atlas-prototipo-organizado":
                ws["id"] = "ws-atlas-v2-organizado"
                ws["name"] = "Mapa do Fluxo — Atlas V2"
        ws_path.write_text(json.dumps(workspaces, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    flows_path = DST / "flows.json"
    if flows_path.exists():
        raw = flows_path.read_text(encoding="utf-8")
        if "atlas-prototipo" in raw:
            flows_path.write_text(raw.replace("atlas-prototipo", "atlas-v2"), encoding="utf-8")

    n_files = sum(1 for _ in DST.rglob("*") if _.is_file())
    print(f"OK: {DST}")
    print(f"    arquivos: {n_files}")
    print(f"    epic.json: Atlas V2")


if __name__ == "__main__":
    main()
