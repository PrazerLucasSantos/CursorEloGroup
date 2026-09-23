# -*- coding: utf-8 -*-
"""Remove prefixos de legenda (! # ? !#) dos labels no épico atlas-v2."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/atlas-v2/forms.json"

LEGEND_PREFIX = re.compile(r"^[!#?]+")


def clean_label(label: str) -> str:
    return LEGEND_PREFIX.sub("", label).lstrip()


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    changed = 0
    for form in forms:
        for fld in form.get("fields", []):
            lab = fld.get("label")
            if not isinstance(lab, str):
                continue
            new = clean_label(lab)
            if new != lab:
                fld["label"] = new
                changed += 1

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: {changed} labels limpos em {FORMS}")


if __name__ == "__main__":
    main()
