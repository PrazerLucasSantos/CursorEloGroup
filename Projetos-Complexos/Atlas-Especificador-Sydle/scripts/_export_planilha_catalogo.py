# -*- coding: utf-8 -*-
"""Gera planilha CSV dos campos da tela Catálogo da parceria."""
from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
OUT = ROOT / "exports/planilha-campos-catalogo-parceria.csv"


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    cat = next(f for f in forms if f["id"] == "form-patlasv4-proto-cat-catalogo")
    sections = {s["id"]: s["title"] for s in cat.get("sections") or []}
    labels = {f["id"]: f["label"] for f in cat["fields"]}

    show_when: dict[str, str] = {}
    for r in cat.get("fieldVisibilityRules") or []:
        src = labels.get(r["sourceFieldId"], r["sourceFieldId"])
        if r.get("sourceKind") == "boolean":
            val = "Sim" if r.get("expectedBoolean") else "Não"
            cond = f"{src} = {val}"
        else:
            cond = f"{src} = {r.get('expectedOptionText')}"
        for tid in r.get("targetFieldIds") or []:
            show_when[tid] = cond

    enrich = {
        "form-patlasv4-proto-cat-catalogo-toggle-universal": (
            "Não confundir com Tipo de oferta Universal/Individualizado do Produto. "
            "Controla elegibilidade a Catálogo Universal (N3)."
        ),
        "form-patlasv4-proto-cat-catalogo-toggle-servicos": (
            "Pode ser Sim junto com É universal?. "
            "Catálogo de serviços sem universal é permitido (ex.: serviços administrativos)."
        ),
        "form-patlasv4-proto-cat-catalogo-estrutura-variacao": (
            "Se É catálogo de serviços? = Não → usar Sem variação. "
            "Por complexidade abre tabela de faixas; Por peso governa Peso no Produto."
        ),
        "form-patlasv4-proto-cat-catalogo-cobranca": (
            "Legado oculto. Cobrança oficial fica no Produto "
            "(Mensal / Anual / Conforme homologação)."
        ),
        "form-patlasv4-proto-cat-catalogo-valor-unitario": (
            "Legado oculto. Usar Valor unitário da métrica na tabela embutida."
        ),
        "form-patlasv4-proto-cat-catalogo-produtos": (
            "Não obrigatório na criação; parceiro alimenta depois (tela/CSV)."
        ),
        "form-patlasv4-proto-cat-catalogo-focal-vendas": (
            "Focais ficam no Catálogo da parceria; não no Produto nem no Universal N3."
        ),
        "form-patlasv4-proto-cat-catalogo-focal-posvendas": (
            "Focais ficam no Catálogo da parceria; não no Produto nem no Universal N3."
        ),
        "form-patlasv4-proto-cat-catalogo-unidade-dtic": (
            "Unidade MTI responsável; obrigatória para publicar (pode vazia no Rascunho)."
        ),
        "form-patlasv4-proto-cat-catalogo-preencher-manual": (
            "Integração SIAG/Protheus adiada; campo retirado da tela nesta fase."
        ),
        "form-patlasv4-proto-cat-catalogo-status-fluxo": (
            "Duplicata legada. Usar apenas Status do catálogo."
        ),
    }

    rows: list[dict[str, str]] = []

    def add_row(
        *,
        secao: str,
        field: dict,
        visibilidade: str,
        obs: str = "",
    ) -> None:
        opts = field.get("options")
        dominio = " | ".join(opts) if isinstance(opts, list) and opts else ""
        linked = field.get("linkedFormId") or ""
        if not dominio and linked:
            dominio = f"Referência → {linked}"
        rows.append(
            {
                "Seção": secao,
                "Nome do campo": field["label"],
                "ID técnico": field["id"],
                "Tipo": field["type"],
                "Obrigatório": "Sim" if field.get("required") else "Não",
                "Somente leitura": "Sim" if field.get("readOnly") else "Não",
                "Múltiplo": "Sim" if field.get("multiple") else "Não",
                "Visibilidade": visibilidade,
                "Opções / domínio": dominio,
                "Classe referenciada": linked,
                "Regra de negócio / descrição": (field.get("spec") or "").replace("\n", " "),
                "Observação": obs or enrich.get(field["id"], ""),
            }
        )

    for f in cat["fields"]:
        hid = f.get("hidden") is True
        fid = f["id"]
        if fid in show_when:
            vis = f"Condicional (inicia oculto): exibir quando {show_when[fid]}"
        elif hid:
            vis = "Oculto (legado / fora de escopo nesta fase)"
        elif fid.endswith("estrutura-variacao"):
            vis = (
                "Visível; regra de negócio: obrigatório quando "
                "É catálogo de serviços? = Sim; se Não → Sem variação"
            )
        else:
            vis = "Visível"
        add_row(
            secao=sections.get(f.get("sectionId"), ""),
            field=f,
            visibilidade=vis,
        )

    em = next(x for x in forms if x["id"] == "form-patlasv4-proto-cat-catalogo-metrica")
    for f in em["fields"]:
        add_row(
            secao="Métricas permitidas (linha embutida)",
            field=f,
            visibilidade="Visível dentro da tabela Métricas permitidas",
            obs="Composição CatalogoMétrica[]; valor da métrica no catálogo ≠ preço do Produto.",
        )

    ecx = next(x for x in forms if x["id"] == "form-patlasv4-proto-cat-catalogo-complexidade")
    for f in ecx["fields"]:
        add_row(
            secao="Complexidades e coeficientes (linha embutida)",
            field=f,
            visibilidade=(
                "Condicional: a tabela só aparece quando Estrutura de variação = Por complexidade"
            ),
            obs="Composição CatalogoComplexidade[]; coeficiente herdado RO no Produto.",
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
    with OUT.open("w", encoding="utf-8-sig", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, delimiter=";")
        w.writeheader()
        w.writerows(rows)

    # also markdown table for chat convenience
    md = ROOT / "exports/planilha-campos-catalogo-parceria.md"
    lines = [
        "# Campos da tela — Catálogo da parceria",
        "",
        "Fonte do modelo: protótipo `form-patlasv4-proto-cat-catalogo` alinhado ao `catalogo.m4a`.",
        "",
        f"Arquivo CSV (Excel): `{OUT.name}` (separador `;`, UTF-8 BOM).",
        "",
        "| Seção | Nome do campo | Tipo | Obrigatório | Somente leitura | Visibilidade | Regra de negócio |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for r in rows:
        rn = (r["Regra de negócio / descrição"] or r["Observação"] or "").replace("|", "/")
        if len(rn) > 120:
            rn = rn[:117] + "..."
        lines.append(
            f"| {r['Seção']} | {r['Nome do campo']} | {r['Tipo']} | {r['Obrigatório']} | "
            f"{r['Somente leitura']} | {r['Visibilidade']} | {rn} |"
        )
    md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"OK {OUT} ({len(rows)} linhas)")
    print(f"OK {md}")


if __name__ == "__main__":
    main()
