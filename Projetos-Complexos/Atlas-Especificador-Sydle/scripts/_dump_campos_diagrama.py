# -*- coding: utf-8 -*-
"""Dump extra process forms and write the class diagram canvas."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = json.loads(
    (ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json").read_text(
        encoding="utf-8"
    )
)
by_id = {f["id"]: f for f in FORMS}

LINK = {
    "form-patlasv4-proto-cat-catalogo": "Catálogo",
    "form-patlasv4-proto-cat-produto": "Produto",
    "form-patlasv4-proto-cat-solucao": "Solução",
    "form-patlasv4-proto-cat-parceria": "Parceria",
    "form-patlasv4-proto-unidade-organizacional": "Organização",
    "form-patlasv4-proto-cat-universal": "Catálogo Universal",
    "form-patlasv4-proto-cat-metrica": "Métrica",
    "form-patlasv4-proto-cat-categoria": "Categoria de Serviços",
    "form-patlasv4-proto-cat-grupo": "Grupo",
    "form-patlasv4-proto-cat-modelo-venda": "Modelo de Venda",
    "form-patlasv4-proto-cat-tipo-cobranca": "Tipo de Cobrança",
    "form-patlasv4-proto-pessoa": "Pessoa",
    "form-patlasv4-proto-cat-catalogo-metrica": "Métrica do catálogo",
    "form-patlasv4-proto-cat-catalogo-complexidade": "Complexidade do catálogo",
    "form-patlasv4-proto-fila-item-catalogo": "Item da fila MTI",
}

EXTRA_IDS = [
    "form-patlasv4-proto-portal-parceiro-catalogo",
    "form-patlasv4-proto-analise-catalogo",
    "form-patlasv4-proto-fila-analise-catalogo",
    "form-patlasv4-proto-fila-item-catalogo",
    "form-patlasv4-proto-cat-notificacao-fluxo",
    "form-patlasv4-proto-portal-cliente-catalogo",
    "form-patlasv4-proto-cat-historico-status",
]


def parse_spec(spec: str):
    if not spec:
        return "", "", ""
    parts = re.split(r"\*\*([^*]+):\*\*", spec)
    if len(parts) == 1:
        return spec.strip(), "", spec.strip()
    bag = {}
    lead = parts[0].strip()
    for i in range(1, len(parts), 2):
        k = parts[i].strip().lower()
        v = parts[i + 1].strip() if i + 1 < len(parts) else ""
        bag[k] = v
    pq = bag.get("para que serve") or lead
    origem = bag.get("origem") or bag.get("origem / de onde vem") or bag.get("de onde vem") or ""
    regras = bag.get("regras") or ""
    if not pq:
        pq = lead or spec.strip()
    if not regras:
        skip = {
            "para que serve",
            "origem",
            "origem / de onde vem",
            "de onde vem",
            "regras",
            "onde é usado",
            "validação luís 05/08",
        }
        extra = [v for k, v in bag.items() if k not in skip]
        regras = " ".join(extra).strip() or spec.strip()
    return pq, origem, regras


def dump_form(form: dict) -> dict:
    sections = {s["id"]: s.get("title", "") for s in (form.get("sections") or [])}
    rules = form.get("fieldVisibilityRules") or []
    hidden_by: dict[str, list] = defaultdict(list)
    for r in rules:
        for t in r.get("targetFieldIds") or []:
            hidden_by[t].append(r)
    fields = []
    for fld in form.get("fields") or []:
        if fld.get("type") == "alert":
            continue
        fields.append(
            {
                "id": fld.get("id"),
                "label": fld.get("label") or fld.get("id"),
                "type": fld.get("type"),
                "section": sections.get(fld.get("sectionId") or "", ""),
                "required": bool(fld.get("required")),
                "readOnly": bool(fld.get("readOnly")),
                "hidden": fld.get("hidden") is True,
                "linked": fld.get("linkedFormId") or "",
                "options": fld.get("options") or [],
                "spec": (fld.get("spec") or "").strip(),
                "rules": hidden_by.get(fld.get("id") or "", []),
            }
        )
    return {"id": form["id"], "name": form.get("name"), "fields": fields}


LABEL_BY_ID: dict[str, str] = {}
for f in FORMS:
    for fld in f.get("fields") or []:
        if fld.get("id") and fld.get("label"):
            LABEL_BY_ID[fld["id"]] = fld["label"]


def vis_text(fld) -> str:
    bits = []
    for r in fld["rules"]:
        src_label = LABEL_BY_ID.get(r.get("sourceFieldId") or "", "campo relacionado")
        action = r.get("action")
        kind = r.get("sourceKind")
        if action == "show":
            if kind == "textOptions":
                bits.append(f"Exibir quando {src_label} = {r.get('expectedOptionText')}")
            elif kind == "boolean":
                val = "Sim" if r.get("expectedBoolean") else "Não"
                bits.append(f"Exibir quando {src_label} = {val}")
            else:
                bits.append(f"Exibir conforme {src_label}")
        elif action == "hide":
            if kind == "boolean":
                val = "Sim" if r.get("expectedBoolean") else "Não"
                bits.append(f"Ocultar quando {src_label} = {val}")
            elif kind == "textOptions":
                bits.append(f"Ocultar quando {src_label} = {r.get('expectedOptionText')}")
            else:
                bits.append(f"Ocultar conforme {src_label}")
    if fld["hidden"] and not bits:
        return "Oculto — legado / fora do mínimo da fonte"
    if fld["hidden"] and bits:
        return "Inicia oculto. " + "; ".join(bits)
    return "; ".join(bits) if bits else "Sempre visível"


def origem_fallback(fld) -> str:
    if fld["readOnly"] and fld["linked"]:
        return "Consulta / herança de " + LINK.get(fld["linked"], fld["linked"])
    if fld["linked"]:
        return "Seleção na classe " + LINK.get(fld["linked"], fld["linked"])
    if fld["type"] == "boolean":
        return "Preenchido (Sim/Não)"
    if fld["type"] == "textOptions":
        return "Seleção na lista do próprio campo"
    return "Preenchido pelo usuário"


def rows_from_form(form: dict) -> list[dict]:
    dumped = dump_form(form)
    out = []
    for fld in dumped["fields"]:
        pq, origem, regras = parse_spec(fld["spec"])
        if not origem:
            origem = origem_fallback(fld)
        if not pq:
            pq = fld["label"]
        if not regras:
            regras = (fld["spec"] or "—").replace("\n", " ")
        tipo = fld["type"]
        if fld["linked"]:
            tipo = tipo + " → " + LINK.get(fld["linked"], fld["linked"])
        opts = ""
        if fld["options"] and fld["type"] == "textOptions":
            opts = "Valores: " + ", ".join(str(o) for o in fld["options"][:10])
        regra = regras
        if opts:
            regra = (regras + " " + opts).strip()
        vis = vis_text(fld)
        if regra.strip() == pq.strip():
            bits = ["Obrigatório." if fld["required"] else "Opcional."]
            if fld["readOnly"]:
                bits.append("Somente leitura.")
            bits.append(vis + ".")
            if opts:
                bits.append(opts)
            regra = " ".join(bits)
        blob = (pq + " " + regra + " " + origem).lower()
        if fld["hidden"] and "inicia oculto" not in vis.lower():
            status = "Legado"
        elif any(
            x in blob
            for x in ("não confirmado", "lacuna", "provisório", "pendente", "adiado", "fase 3")
        ):
            status = "Aberto na fonte"
        else:
            status = "Confirmado"
        out.append(
            {
                "classe": dumped["name"],
                "secao": fld["section"] or "—",
                "campo": fld["label"],
                "tipo": tipo,
                "obrg": "Sim" if fld["required"] else "Não",
                "ro": "Sim" if fld["readOnly"] else "Não",
                "vis": vis,
                "origem": origem.replace("\n", " ").strip(),
                "para": pq.replace("\n", " ").strip(),
                "regra": regra.replace("\n", " ").strip(),
                "oculto": fld["hidden"],
                "status": status,
            }
        )
    return out


base = json.loads((ROOT / "exports/_campos_fase2_canvas.json").read_text(encoding="utf-8"))
# Normalize classe names used in the diagram
rename = {
    "Métrica do catálogo": "Métrica do catálogo",
    "Complexidade do catálogo": "Complexidade do catálogo",
}
for r in base:
    r["classe"] = rename.get(r["classe"], r["classe"])

extra: list[dict] = []
for fid in EXTRA_IDS:
    extra.extend(rows_from_form(by_id[fid]))

all_rows = base + extra
(ROOT / "exports/_campos_fase2_diagrama.json").write_text(
    json.dumps(all_rows, ensure_ascii=False), encoding="utf-8"
)
print("rows", len(all_rows), "classes", len({r["classe"] for r in all_rows}))
print({r["classe"] for r in extra})
