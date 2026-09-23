# -*- coding: utf-8 -*-
"""Remove todos os campos type=alert do épico atlas-v2."""
from __future__ import annotations

import json
from pathlib import Path

FORMS = Path(__file__).resolve().parents[1] / "data/subprojects/atlas-prototipo/epics/atlas-v2/forms.json"
LOG = Path(__file__).resolve().parents[1] / "exports/_strip_alerts_atlas_v2_log.txt"


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    log: list[str] = []
    total = 0
    for form in forms:
        alerts = [f for f in form.get("fields", []) if f.get("type") == "alert"]
        if not alerts:
            continue
        alert_ids = {a["id"] for a in alerts}
        for a in alerts:
            title = a.get("alertTitle") or a.get("label") or ""
            log.append(f"{form.get('name')}: {a.get('id')} | {title}")
        form["fields"] = [f for f in form["fields"] if f.get("type") != "alert"]
        rules = form.get("fieldVisibilityRules") or []
        if rules:
            cleaned = []
            for r in rules:
                targets = [t for t in (r.get("targetFieldIds") or []) if t not in alert_ids]
                if not targets:
                    continue
                cleaned.append({**r, "targetFieldIds": targets})
            if cleaned:
                form["fieldVisibilityRules"] = cleaned
            else:
                form.pop("fieldVisibilityRules", None)
        total += len(alerts)

    remaining = sum(1 for f in forms for x in f.get("fields", []) if x.get("type") == "alert")
    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    log.append(f"\nOK: {total} avisos removidos · restantes: {remaining}")
    LOG.write_text("\n".join(log), encoding="utf-8")
    print(f"OK: {total} alerts removed, remaining={remaining}")


if __name__ == "__main__":
    main()
