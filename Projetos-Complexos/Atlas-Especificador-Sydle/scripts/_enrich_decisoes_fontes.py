"""Enrich sintese-temas.md by scanning all transcricoes for decision-like sentences."""
from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

TX = Path(
    r"C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
    r"\docs\conhecimento-atlas\transcricoes"
)
OUT = Path(
    r"C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
    r"\docs\conhecimento-atlas\decisoes-extraidas.md"
)

RULES = [
    ("faturamento_fases_projeto", r"faturamento separado por fase|faturando as fases|por fase mesmo"),
    ("parceiro_producao", r"parceiro n[aã]o.{0,40}produ|ambiente de homologa"),
    ("apostila_versao", r"apostil"),
    ("snapshot_os", r"snapshot"),
    ("fator_conversao", r"fator de convers"),
    ("tipo_contratacao", r"tipo\s*[123]|cat[aá]logo geral|CGS|cr[eé]ditos"),
    ("cliente_pj", r"somente PJ|pessoa jur[ií]dica"),
    ("direx", r"DIREX|diretoria|presid[eê]ncia"),
    ("parecer_mti", r"parecer|aprovar|ajuste solicitado|homolog"),
    ("csv_catalogo", r"\bCSV\b|planilha|template"),
    ("secretaria_saldo", r"secretaria|rateio|segrega"),
    ("orcamento_servico", r"or[cç]amento pr[eé]vio|or[cç]amento"),
]


def main():
    buckets: dict[str, list[str]] = defaultdict(list)
    for path in sorted(TX.glob("*.txt")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        # chunk by ~sentences
        for rule, pat in RULES:
            for m in re.finditer(pat, text, flags=re.I):
                a = max(0, m.start() - 100)
                b = min(len(text), m.end() + 160)
                snip = re.sub(r"\s+", " ", text[a:b]).strip()
                key = snip[:90].lower()
                if any(key in x.lower() for x in buckets[rule]):
                    continue
                buckets[rule].append(f"[{path.name}] {snip}")
                if len(buckets[rule]) >= 12:
                    break

    lines = [
        "# Decisões e falas extraídas — conhecimento Atlas",
        "",
        "Varredura automática nas transcrições/atas em `transcricoes/`.",
        "Usar como índice; validar no áudio quando a ata estiver degradada.",
        "",
    ]
    for rule, items in buckets.items():
        lines.append(f"## {rule}")
        for it in items:
            lines.append(f"- {it}")
        lines.append("")
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} themes={len(buckets)}")


if __name__ == "__main__":
    main()
