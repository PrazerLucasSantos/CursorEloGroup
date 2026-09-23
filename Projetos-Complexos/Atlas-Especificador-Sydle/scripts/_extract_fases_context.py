"""Extract full context around faturamento/homologar fases from key DOCX."""
from __future__ import annotations

import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(
    r"C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
    r"\docs\Fontes de Dados para analise"
)
OUT = Path(
    r"C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
    r"\exports\_fontes_fases_context.txt"
)


def docx_text(path: Path) -> str:
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml")
    root = ET.fromstring(xml)
    parts = []
    for t in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"):
        if t.text:
            parts.append(t.text)
        if t.tail:
            parts.append(t.tail)
    return re.sub(r"\s+", " ", " ".join(parts))


def dump_around(text: str, needles: list[str], radius: int = 500) -> list[str]:
    out = []
    low = text.lower()
    for n in needles:
        for m in re.finditer(re.escape(n.lower()), low):
            a = max(0, m.start() - radius)
            b = min(len(text), m.end() + radius)
            out.append(text[a:b])
    return out


def main():
    targets = [
        "Projeto Atlas - Modelagem Fase 1 (5).docx",
        "Atlas _ Requisitos.docx",
        "Atlas _ Requisitos (1).docx",
        "Discovery 15 06.docx",
        "Projeto Atlas - Modelagem Fase 1.docx",
    ]
    needles = [
        "faturamento separado por fase",
        "faturando as fases",
        "homologar em uma reunião",
        "envio para faturamento",
        "termo de homologação",
        "Não podemos ser preface",
        "nao podemos ser preface",
        "não tem problema nenhum",
    ]
    lines = []
    for name in targets:
        p = ROOT / name
        if not p.exists():
            lines.append(f"MISSING {name}")
            continue
        text = docx_text(p)
        lines.append("=" * 80)
        lines.append(name)
        lines.append(f"chars={len(text)}")
        hits = dump_around(text, needles, 700)
        if not hits:
            # broader
            hits = dump_around(text, ["faturamento", "homologar em", "por fase"], 400)
        for i, h in enumerate(hits[:12]):
            lines.append(f"--- hit {i+1} ---")
            lines.append(h)
            lines.append("")
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print("wrote", OUT)


if __name__ == "__main__":
    main()
