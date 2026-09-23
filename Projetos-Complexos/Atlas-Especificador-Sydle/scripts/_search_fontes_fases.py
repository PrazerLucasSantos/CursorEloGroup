"""Search Fontes de Dados for homologar/faturar em fases (and related)."""
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
    r"\exports\_fontes_fases_search.txt"
)

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}

PATTERNS = [
    r"fatur\w*.{0,40}fase",
    r"fase.{0,40}fatur",
    r"homolog\w*.{0,40}fase",
    r"fase.{0,40}homolog",
    r"em\s+fases",
    r"por\s+fases",
    r"faturar\s+em",
    r"homologar\s+em",
    r"faturamento\s+fase",
    r"homologa[cç][aã]o\s+fase",
    r"fasead[oa]",
    r"parcelad",
    r"em\s+etapas",
    r"por\s+etapa",
]


def docx_text(path: Path) -> str:
    try:
        with zipfile.ZipFile(path) as z:
            xml = z.read("word/document.xml")
        root = ET.fromstring(xml)
        parts = []
        for t in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"):
            if t.text:
                parts.append(t.text)
            if t.tail:
                parts.append(t.tail)
        return " ".join(parts)
    except Exception as e:
        return f"__ERR__{e}"


def pptx_text(path: Path) -> str:
    try:
        with zipfile.ZipFile(path) as z:
            names = [n for n in z.namelist() if n.startswith("ppt/slides/slide") and n.endswith(".xml")]
            parts = []
            for n in sorted(names):
                root = ET.fromstring(z.read(n))
                for t in root.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}t"):
                    if t.text:
                        parts.append(t.text)
            return " ".join(parts)
    except Exception as e:
        return f"__ERR__{e}"


def pdf_text(path: Path) -> str:
    try:
        from pypdf import PdfReader

        r = PdfReader(str(path))
        return "\n".join((p.extract_text() or "") for p in r.pages)
    except Exception:
        try:
            import PyPDF2

            r = PyPDF2.PdfReader(open(path, "rb"))
            return "\n".join((p.extract_text() or "") for p in r.pages)
        except Exception as e:
            return f"__ERR__{e}"


def xlsx_text(path: Path) -> str:
    try:
        import openpyxl

        wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
        parts = []
        for ws in wb.worksheets:
            for row in ws.iter_rows(values_only=True):
                for v in row:
                    if v is not None:
                        parts.append(str(v))
        return "\n".join(parts)
    except Exception as e:
        return f"__ERR__{e}"


def windows(text: str, match: re.Match, radius: int = 220) -> str:
    a = max(0, match.start() - radius)
    b = min(len(text), match.end() + radius)
    snip = text[a:b].replace("\n", " ")
    return re.sub(r"\s+", " ", snip).strip()


def main():
    files = []
    for ext in ("*.docx", "*.pptx", "*.pdf", "*.xlsx", "*.txt", "*.md", "*.vtt", "*.srt"):
        files.extend(ROOT.glob(ext))
    # also nested
    for ext in ("*.docx", "*.pptx", "*.pdf", "*.xlsx", "*.txt", "*.md", "*.vtt", "*.srt"):
        files.extend(ROOT.rglob(ext))
    files = sorted({f.resolve() for f in files if f.is_file() and f.name != "desktop.ini"})

    lines = [f"ROOT={ROOT}", f"files_scanned={len(files)}", ""]
    hits_total = 0
    luis_near = []

    for f in files:
        if f.suffix.lower() == ".docx":
            text = docx_text(f)
        elif f.suffix.lower() == ".pptx":
            text = pptx_text(f)
        elif f.suffix.lower() == ".pdf":
            text = pdf_text(f)
        elif f.suffix.lower() == ".xlsx":
            text = xlsx_text(f)
        else:
            try:
                text = f.read_text(encoding="utf-8", errors="ignore")
            except Exception as e:
                text = f"__ERR__{e}"

        if text.startswith("__ERR__"):
            lines.append(f"[SKIP] {f.name}: {text}")
            continue

        file_hits = []
        low = text.lower()
        for pat in PATTERNS:
            for m in re.finditer(pat, low, flags=re.I):
                snip = windows(text, m)
                file_hits.append((pat, snip))

        # also explicit phrases
        for pat in [
            r".{0,80}fatur\w*.{0,30}em\s+fase.{0,80}",
            r".{0,80}homolog\w*.{0,30}em\s+fase.{0,80}",
            r".{0,80}(luis|luís).{0,120}(fatur|homolog).{0,80}",
            r".{0,80}(fatur|homolog).{0,120}(luis|luís).{0,80}",
        ]:
            for m in re.finditer(pat, text, flags=re.I | re.S):
                snip = re.sub(r"\s+", " ", m.group(0))
                file_hits.append(("combo", snip[:400]))

        if file_hits:
            hits_total += len(file_hits)
            lines.append("=" * 70)
            lines.append(f"FILE: {f.name}")
            lines.append(f"chars={len(text)} hits={len(file_hits)}")
            seen = set()
            for pat, snip in file_hits:
                key = snip[:160]
                if key in seen:
                    continue
                seen.add(key)
                lines.append(f"  PAT[{pat}] :: {snip}")
                if re.search(r"luis|luís", snip, re.I) and re.search(
                    r"fatur|homolog|fase", snip, re.I
                ):
                    luis_near.append((f.name, snip))

        # secondary: count mentions of faturamento / homologação near "fase" within 80 chars
        for m in re.finditer(r"fase", low):
            a = max(0, m.start() - 80)
            b = min(len(low), m.end() + 80)
            window = low[a:b]
            if ("fatur" in window or "homolog" in window) and (
                "em fase" in window or "por fase" in window or "nas fase" in window or "das fase" in window
            ):
                snip = re.sub(r"\s+", " ", text[a:b])
                luis_near.append((f.name + " [prox]", snip))

    lines.append("")
    lines.append("=" * 70)
    lines.append(f"TOTAL_PATTERN_HITS={hits_total}")
    lines.append(f"LUIS_OR_STRONG_NEAR={len(luis_near)}")
    for name, snip in luis_near[:50]:
        lines.append(f"  * {name}: {snip}")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"files={len(files)} hits={hits_total} strong={len(luis_near)}")


if __name__ == "__main__":
    main()
