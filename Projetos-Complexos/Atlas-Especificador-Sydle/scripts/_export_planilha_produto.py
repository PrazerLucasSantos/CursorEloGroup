# -*- coding: utf-8 -*-
"""Exporta planilha + markdown dos campos da classe Produto (Fase 2)."""
from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
OUT_CSV = ROOT / "exports/planilha-campos-produto.csv"
OUT_MD = ROOT / "exports/planilha-campos-produto.md"


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    prod = next(f for f in forms if f["id"] == "form-patlasv4-proto-cat-produto")
    sections = {s["id"]: s["title"] for s in prod.get("sections") or []}
    labels = {f["id"]: f["label"] for f in prod["fields"]}

    show_when: dict[str, list[str]] = {}
    for r in prod.get("fieldVisibilityRules") or []:
        src = labels.get(r["sourceFieldId"], r["sourceFieldId"])
        if r.get("sourceKind") == "boolean":
            val = "Sim" if r.get("expectedBoolean") else "Não"
            cond = f"{src} = {val}"
        else:
            cond = f"{src} = {r.get('expectedOptionText')}"
        action = r.get("action")
        for tid in r.get("targetFieldIds") or []:
            show_when.setdefault(tid, []).append(f"{action}:{cond}")

    enrich = {
        "form-patlasv4-proto-cat-produto-catalogo": (
            "Primeiro campo. Controla herança e métricas/estrutura do catálogo."
        ),
        "form-patlasv4-proto-cat-produto-parceria": "Herdada do Catálogo; não selecionar de novo.",
        "form-patlasv4-proto-cat-produto-solucao": "Herdada do Catálogo; somente leitura.",
        "form-patlasv4-proto-cat-produto-tipo-oferta": (
            "Universal | Individualizado no Produto. Não confundir com toggle É universal? do Catálogo."
        ),
        "form-patlasv4-proto-cat-produto-cobranca": (
            "Mensal · Anual · Conforme homologação. Sob demanda NÃO é tipo de cobrança."
        ),
        "form-patlasv4-proto-cat-produto-consumo-os": (
            "Representa consumo sob demanda/via OS (créditos). Não é Tipo de cobrança."
        ),
        "form-patlasv4-proto-cat-produto-moeda-universal": (
            "Exibir se Tipo de oferta = Universal. Fonte: valor preenchido como 1 no cadastro universal."
        ),
        "form-patlasv4-proto-cat-produto-qtde-metrica": (
            "Nome genérico; não citar HST/UST. Só Serviço + métrica/catálogo exigir quantidade."
        ),
        "form-patlasv4-proto-cat-produto-part-number": (
            "Campo confirmado; obrigatoriedade/formato = lacuna Protheus. Não copiar o Nome."
        ),
        "form-patlasv4-proto-cat-produto-grupo": (
            "Agrupamento confirmado; obrigatoriedade absoluta = lacuna."
        ),
        "form-patlasv4-proto-cat-produto-modelo-venda": (
            "Provisório: Por licença · Por serviço · Por pacote."
        ),
    }

    rows: list[dict[str, str]] = []
    for f in prod["fields"]:
        fid = f["id"]
        hid = f.get("hidden") is True
        rules = show_when.get(fid) or []

        if fid.startswith("form-patlasv4-proto-cat-produto-cfg-"):
            vis = "Oculto (flag técnica herdada do Catálogo; não exibir ao usuário)"
        elif hid and any(x.startswith("show:") for x in rules):
            shows = [x[5:] for x in rules if x.startswith("show:")]
            hides = [x[5:] for x in rules if x.startswith("hide:")]
            vis = "Condicional (inicia oculto): exibir quando " + " E ".join(shows)
            if hides:
                vis += "; ocultar novamente se " + " OU ".join(hides)
        elif hid:
            vis = "Oculto (legado / fora de escopo nesta fase)"
        elif rules:
            vis = "Visível; regras adicionais: " + "; ".join(rules)
        else:
            vis = "Visível"

        opts = f.get("options")
        dominio = " | ".join(opts) if isinstance(opts, list) and opts else ""
        linked = f.get("linkedFormId") or ""
        if not dominio and linked:
            dominio = f"Referência → {linked}"

        rows.append(
            {
                "Seção": sections.get(f.get("sectionId"), ""),
                "Nome do campo": f["label"],
                "ID técnico": fid,
                "Tipo": f["type"],
                "Obrigatório": "Sim" if f.get("required") else "Não",
                "Somente leitura": "Sim" if f.get("readOnly") else "Não",
                "Múltiplo": "Sim" if f.get("multiple") else "Não",
                "Visibilidade": vis,
                "Opções / domínio": dominio,
                "Classe referenciada": linked,
                "Regra de negócio / descrição": (f.get("spec") or "").replace("\n", " "),
                "Observação": enrich.get(fid, ""),
            }
        )

    cols = [
        "Seção",
        "Nome do campo",
        "ID técnico",
        "Tipo",
        "Obrigatório",
        "Somente leitura",
        "Múltiplo",
        "Visibilidade",
        "Opções / domínio",
        "Classe referenciada",
        "Regra de negócio / descrição",
        "Observação",
    ]
    with OUT_CSV.open("w", encoding="utf-8-sig", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, delimiter=";")
        w.writeheader()
        w.writerows(rows)

    lines = [
        "# Campos da tela — Produto",
        "",
        "Fonte: protótipo `form-patlasv4-proto-cat-produto` alinhado ao `catalogo.m4a`.",
        "",
        f"CSV (Excel): `{OUT_CSV.name}` (separador `;`, UTF-8 BOM).",
        "",
        "| Seção | Nome do campo | Tipo | Obrg | S. Leitura | Visibilidade | Regra de negócio |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for r in rows:
        if "flag técnica" in r["Visibilidade"] or r["Visibilidade"].startswith("Oculto (legado"):
            continue  # doc de negócio: ocultos técnicos no CSV
        rn = (r["Regra de negócio / descrição"] or r["Observação"] or "").replace("|", "/")
        if len(rn) > 110:
            rn = rn[:107] + "..."
        vis = r["Visibilidade"]
        if len(vis) > 70:
            vis = vis[:67] + "..."
        lines.append(
            f"| {r['Seção']} | {r['Nome do campo']} | {r['Tipo']} | {r['Obrigatório']} | "
            f"{r['Somente leitura']} | {vis} | {rn} |"
        )
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"OK {OUT_CSV} ({len(rows)} linhas)")
    print(f"OK {OUT_MD}")


if __name__ == "__main__":
    main()
