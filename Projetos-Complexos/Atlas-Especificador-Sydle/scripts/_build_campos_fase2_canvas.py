# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "exports/_campos_fase2_dump.json").read_text(encoding="utf-8"))

LINK = {
    "form-patlasv4-proto-cat-catalogo": "Catálogo da parceria",
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
    "form-patlasv4-proto-cat-catalogo-metrica": "Métrica do catálogo (linha)",
    "form-patlasv4-proto-cat-catalogo-complexidade": "Complexidade do catálogo (linha)",
}


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
    pq = bag.get("para que serve") or bag.get("para quê serve") or lead
    origem = (
        bag.get("origem")
        or bag.get("origem / de onde vem")
        or bag.get("de onde vem")
        or ""
    )
    regras = bag.get("regras") or ""
    if not pq:
        pq = lead or spec.strip()
    if not regras:
        skip = {
            "para que serve",
            "para quê serve",
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


LABEL_BY_ID = {}
for form in data:
    for fld in form["fields"]:
        LABEL_BY_ID[fld["id"]] = fld["label"]


def vis_text(fld):
    bits = []
    for r in fld["rules"]:
        src_label = LABEL_BY_ID.get(r.get("source") or "", "campo relacionado")
        action = r.get("action")
        kind = r.get("kind")
        if action == "show":
            if kind == "textOptions":
                bits.append(f"Exibir quando {src_label} = {r.get('opt')}")
            elif kind == "boolean":
                val = "Sim" if r.get("bool") else "Não"
                bits.append(f"Exibir quando {src_label} = {val}")
            else:
                bits.append(f"Exibir conforme {src_label}")
        elif action == "hide":
            if kind == "boolean":
                val = "Sim" if r.get("bool") else "Não"
                bits.append(f"Ocultar quando {src_label} = {val}")
            elif kind == "textOptions":
                bits.append(f"Ocultar quando {src_label} = {r.get('opt')}")
            else:
                bits.append(f"Ocultar conforme {src_label}")
    if fld["hidden"] and not bits:
        return "Oculto — legado / fora do mínimo da fonte"
    if fld["hidden"] and bits:
        return "Inicia oculto. " + "; ".join(bits)
    return "; ".join(bits) if bits else "Sempre visível"


def origem_fallback(fld):
    if fld["readOnly"] and fld["linked"]:
        return "Consulta / herança de " + LINK.get(fld["linked"], fld["linked"])
    if fld["linked"]:
        return "Seleção na classe " + LINK.get(fld["linked"], fld["linked"])
    if fld["type"] == "boolean":
        return "Preenchido (Sim/Não)"
    if fld["type"] == "textOptions":
        return "Seleção na lista do próprio campo"
    if "status" in (fld["id"] or "").lower() and fld["readOnly"]:
        return "Sistema (workflow)"
    return "Preenchido pelo usuário"


rows = []
for form in data:
    for fld in form["fields"]:
        if fld["type"] == "alert":
            continue
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
            opts = "Valores: " + ", ".join(fld["options"][:12])
        regra = regras
        if opts:
            regra = (regras + " " + opts).strip()
        vis = vis_text(fld)
        if regra.strip() == pq.strip():
            bits = []
            bits.append("Obrigatório." if fld["required"] else "Opcional.")
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
            for x in (
                "não confirmado",
                "nao confirmado",
                "lacuna",
                "provisório",
                "provisorio",
                "pendente",
                "adiado",
            )
        ):
            status = "Aberto na fonte"
        else:
            status = "Confirmado"
        rows.append(
            {
                "classe": form["name"],
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

(ROOT / "exports/_campos_fase2_canvas.json").write_text(
    json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8"
)

md = [
    "# Detalhamento dos campos — Fase 2 Catálogo",
    "",
    "Fonte de regras: `catalogo.m4a`. O protótipo ilustra o confirmado; o que está **Aberto** ou **Legado** não é versão final.",
    "",
    "Colunas: **Para que serve** · **De onde vem** · **Quando aparece** · **Obrigatório** · **Somente leitura** · **Regra**.",
    "",
]
from collections import defaultdict
by = defaultdict(list)
for r in rows:
    by[r["classe"]].append(r)
for classe, items in by.items():
    md.append(f"## {classe}")
    md.append("")
    current_sec = None
    for r in items:
        if r["secao"] != current_sec:
            current_sec = r["secao"]
            md.append(f"### {current_sec}")
            md.append("")
        tag = r["status"]
        md.append(f"#### {r['campo']}")
        md.append("")
        md.append(f"- **Tipo:** {r['tipo']}")
        md.append(f"- **Obrigatório:** {r['obrg']}")
        md.append(f"- **Somente leitura:** {r['ro']}")
        md.append(f"- **Quando aparece:** {r['vis']}")
        md.append(f"- **De onde vem:** {r['origem']}")
        md.append(f"- **Para que serve:** {r['para']}")
        md.append(f"- **Regra:** {r['regra']}")
        md.append(f"- **Situação vs fonte:** {tag}")
        md.append("")
(ROOT / "exports/detalhamento-campos-fase2-catalogo.md").write_text("\n".join(md), encoding="utf-8")
print(len(rows), "visible", sum(1 for r in rows if not r["oculto"]))
print("md ok")
