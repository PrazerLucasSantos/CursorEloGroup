"""
Build Atlas knowledge base from docs/Fontes de Dados para analise.
1) Extract all DOCX/PDF/PPTX/XLSX text
2) Inventory media
3) Optionally queue Whisper for unique videos lacking transcript
"""
from __future__ import annotations

import hashlib
import json
import re
import zipfile
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(
    r"C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
    r"\docs\Fontes de Dados para analise"
)
OUT = Path(
    r"C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
    r"\docs\conhecimento-atlas"
)
TX = OUT / "transcricoes"
MEDIA = OUT / "inventario-midia.json"
INDEX = OUT / "INDEX.md"
SINT = OUT / "sintese-temas.md"

W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
A_NS = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

THEMES = {
    "catalogo_produtos": [
        r"cat[aá]logo",
        r"produto",
        r"fator",
        r"USN|UST|HST",
        r"markup",
        r"CSV",
        r"universal",
        r"individualizado",
        r"apostila",
        r"snapshot",
    ],
    "parceria_organizacao": [
        r"parceria",
        r"parceiro",
        r"organiza[cç][aã]o",
        r"CNPJ",
        r"DIREX",
        r"solu[cç][aã]o",
        r"fabricante",
    ],
    "contrato_os_orcamento": [
        r"contrato",
        r"ordem de servi[cç]o|\bOS\b",
        r"or[cç]amento",
        r"demanda",
        r"cota[cç][aã]o",
        r"objeto contrat",
    ],
    "faturamento_homologacao": [
        r"fatur",
        r"homolog",
        r"termo de homolog",
        r"RAER",
        r"cobran[cç]a",
        r"parcela",
    ],
    "fases_projeto": [
        r"fase\s*[123]",
        r"esteira",
        r"PEAP",
        r"faturamento separado por fase",
        r"faturando as fases",
    ],
    "portais_permissoes": [
        r"portal",
        r"permiss",
        r"cargo",
        r"perfil",
        r"RBAC",
        r"cliente",
        r"secretaria",
    ],
    "assinatura_workflow": [
        r"assinatura",
        r"workflow",
        r"proposta",
        r"Gov\.?Br",
        r"certifica",
    ],
    "integracoes": [
        r"SIAG",
        r"Protheus",
        r"Proteus",
        r"ServiceNow",
        r"HCMX",
        r"integra[cç]",
    ],
}


def slug(name: str) -> str:
    s = re.sub(r"[^\w\-]+", "_", name, flags=re.U)
    return s.strip("_")[:120]


def docx_text(path: Path) -> str:
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    parts = []
    for t in root.iter(f"{W_NS}t"):
        if t.text:
            parts.append(t.text)
        if t.tail:
            parts.append(t.tail)
    return re.sub(r"[ \t]+", " ", " ".join(parts)).strip()


def pptx_text(path: Path) -> str:
    with zipfile.ZipFile(path) as z:
        names = sorted(
            n for n in z.namelist() if n.startswith("ppt/slides/slide") and n.endswith(".xml")
        )
        parts = []
        for n in names:
            root = ET.fromstring(z.read(n))
            for t in root.iter(f"{A_NS}t"):
                if t.text:
                    parts.append(t.text)
    return re.sub(r"\s+", " ", " ".join(parts)).strip()


def pdf_text(path: Path) -> str:
    try:
        from pypdf import PdfReader

        r = PdfReader(str(path))
        return "\n".join((p.extract_text() or "") for p in r.pages)
    except Exception as e:
        return f"[pdf error: {e}]"


def xlsx_preview(path: Path, max_cells: int = 5000) -> str:
    try:
        import openpyxl

        wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
        parts = []
        n = 0
        for ws in wb.worksheets:
            parts.append(f"## Sheet: {ws.title}")
            for row in ws.iter_rows(values_only=True):
                vals = [str(v) for v in row if v is not None and str(v).strip()]
                if vals:
                    parts.append(" | ".join(vals))
                    n += len(vals)
                if n >= max_cells:
                    parts.append("…[truncado]")
                    return "\n".join(parts)
        return "\n".join(parts)
    except Exception as e:
        return f"[xlsx error: {e}]"


def file_hash(path: Path, limit: int = 2_000_000) -> str:
    h = hashlib.md5()
    with open(path, "rb") as f:
        h.update(f.read(limit))
        h.update(str(path.stat().st_size).encode())
    return h.hexdigest()[:12]


def normalize_title(name: str, keep_date: bool = False) -> str:
    n = Path(name).stem.lower()
    n = re.sub(r"\s*\(\d+\)\s*", " ", n)
    # capture date YYYYMMDD if present
    m = re.search(r"(20\d{6})", n)
    date = m.group(1) if m else ""
    n = re.sub(r"-?\d{8}[_ ].*", "", n)
    n = re.sub(r"grava[cç][aã]o.*", "", n)
    n = re.sub(r"meeting recording.*", "", n)
    n = re.sub(r"\s+", " ", n).strip()
    if keep_date and date:
        return f"{n}::{date}"
    return n


def base_title(title_norm: str) -> str:
    return title_norm.split("::")[0]


def theme_hits(text: str) -> dict[str, int]:
    low = text.lower()
    out = {}
    for theme, pats in THEMES.items():
        c = 0
        for p in pats:
            c += len(re.findall(p, low, flags=re.I))
        if c:
            out[theme] = c
    return out


def extract_key_quotes(text: str, limit: int = 8) -> list[str]:
    quotes = []
    patterns = [
        r".{0,60}faturamento separado por fase.{0,120}",
        r".{0,60}faturando as fases.{0,120}",
        r".{0,40}parceiro n[aã]o.{0,80}produ[cç][aã]o.{0,40}",
        r".{0,40}apostil.{0,100}",
        r".{0,40}snapshot.{0,100}",
        r".{0,40}fator de convers[aã]o.{0,100}",
        r".{0,40}1 produto.{0,80}cat[aá]logo.{0,40}",
        r".{0,40}somente PJ.{0,80}",
        r".{0,40}DIREX.{0,100}",
        r".{0,40}tipo [123].{0,100}",
    ]
    seen = set()
    for p in patterns:
        for m in re.finditer(p, text, flags=re.I | re.S):
            q = re.sub(r"\s+", " ", m.group(0)).strip()
            key = q[:80].lower()
            if key in seen:
                continue
            seen.add(key)
            quotes.append(q)
            if len(quotes) >= limit:
                return quotes
    return quotes


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    TX.mkdir(parents=True, exist_ok=True)

    inventory = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "root": str(ROOT),
        "documents": [],
        "media": [],
        "video_groups": {},
    }

    # --- documents ---
    doc_files = []
    for ext in ("*.docx", "*.pdf", "*.pptx", "*.xlsx"):
        doc_files.extend(ROOT.glob(ext))
    doc_files = sorted({p.resolve() for p in doc_files})

    theme_index: dict[str, list[str]] = defaultdict(list)
    all_quotes: list[tuple[str, str]] = []

    for path in doc_files:
        print(f"DOC {path.name}")
        try:
            if path.suffix.lower() == ".docx":
                text = docx_text(path)
            elif path.suffix.lower() == ".pdf":
                text = pdf_text(path)
            elif path.suffix.lower() == ".pptx":
                text = pptx_text(path)
            else:
                text = xlsx_preview(path)
        except Exception as e:
            text = f"[extract error: {e}]"

        out_name = slug(path.stem) + ".txt"
        out_path = TX / out_name
        header = (
            f"# Fonte: {path.name}\n"
            f"# Tipo: documento\n"
            f"# Extraído: {datetime.now().isoformat(timespec='seconds')}\n"
            f"# Chars: {len(text)}\n\n"
        )
        out_path.write_text(header + text, encoding="utf-8")

        themes = theme_hits(text)
        for t in themes:
            theme_index[t].append(path.name)
        quotes = extract_key_quotes(text)
        for q in quotes:
            all_quotes.append((path.name, q))

        inventory["documents"].append(
            {
                "file": path.name,
                "path": str(path),
                "bytes": path.stat().st_size,
                "chars": len(text),
                "transcript": str(out_path.relative_to(OUT)),
                "themes": themes,
                "title_norm": normalize_title(path.name),
            }
        )

    # --- media ---
    media_files = []
    for ext in ("*.mp4", "*.m4a"):
        media_files.extend(ROOT.glob(ext))
    media_files = sorted({p.resolve() for p in media_files})

    groups: dict[str, list[dict]] = defaultdict(list)
    for path in media_files:
        info = {
            "file": path.name,
            "path": str(path),
            "bytes": path.stat().st_size,
            "mb": round(path.stat().st_size / 1e6, 1),
            "ext": path.suffix.lower(),
            "hash12": file_hash(path),
            "title_norm": normalize_title(path.name, keep_date=True),
            "title_base": normalize_title(path.name, keep_date=False),
        }
        inventory["media"].append(info)
        groups[info["title_norm"]].append(info)

    # pick canonical media per dated group (largest)
    canonical = []
    for title, items in groups.items():
        # Prefer m4a (audio-only, faster Whisper) when present; else largest file
        m4as = [i for i in items if i["ext"] == ".m4a"]
        best = max(m4as, key=lambda x: x["bytes"]) if m4as else max(items, key=lambda x: x["bytes"])
        base = best["title_base"]
        # match docs: same base name tokens OR exact stem containment
        scored = []
        stem_low = Path(best["file"]).stem.lower()
        for d in inventory["documents"]:
            dstem = Path(d["file"]).stem.lower()
            # strong: doc stem is prefix of media or vice-versa (ignore date)
            dbase = normalize_title(d["file"], keep_date=False)
            if dbase and (dbase == base or dbase in base or base in dbase):
                scored.append((10, d))
                continue
            if dstem.replace(" ", "")[:20] and dstem.replace(" ", "")[:20] in stem_low.replace(
                " ", ""
            ):
                scored.append((8, d))
                continue
            dt = {t for t in d["title_norm"].split() if len(t) > 3}
            bt = {t for t in base.split() if len(t) > 3}
            score = len(dt & bt)
            if score >= 2:
                scored.append((score, d))
        scored.sort(key=lambda x: x[0], reverse=True)
        matched = []
        seen = set()
        for _, d in scored:
            if d["file"] in seen:
                continue
            seen.add(d["file"])
            matched.append(d["file"])
            if len(matched) >= 3:
                break

        need_whisper = len(matched) == 0
        # Catalog discovery: reuse existing whisper
        if "catalog" in base or "catálogo" in base or "catalogo" in base:
            existing = Path(
                r"C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
                r"\exports\_atlas_catalogo_whisper.txt"
            )
            if existing.exists():
                need_whisper = False
                matched = [str(existing)]
        # Dated Modelagem/Checkpoint after June may share generic DOCX but content differs —
        # if date >= 20260701 and only generic Modelagem/Checkpoint doc matched, still whisper.
        date_part = title.split("::")[-1] if "::" in title else ""
        if date_part.isdigit() and int(date_part) >= 20260701:
            generic_only = all(
                ("modelagem fase 1" in m.lower() or "checkpoint atlas" in m.lower())
                and "(" not in m  # allow numbered variants as weak
                for m in matched
            ) if matched else True
            # July+ modelagem/checkpoint: force whisper unless catalog
            if ("modelagem" in base or "checkpoint" in base) and "catalog" not in base:
                need_whisper = True

        entry = {
            "title_norm": title,
            "title_base": base,
            "canonical_file": best["file"],
            "canonical_path": best["path"],
            "mb": best["mb"],
            "duplicates": [i["file"] for i in items if i["file"] != best["file"]],
            "matched_docs": matched,
            "needs_whisper": need_whisper,
        }
        canonical.append(entry)

    inventory["video_groups"] = {
        "count_unique": len(canonical),
        "needs_whisper": [c for c in canonical if c["needs_whisper"]],
        "has_docx": [c for c in canonical if not c["needs_whisper"]],
        "all": canonical,
    }

    MEDIA.write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding="utf-8")

    # INDEX
    lines = [
        "# Base de conhecimento — Fontes Atlas",
        "",
        f"Gerado em: {inventory['generated_at']}",
        f"Origem: `{ROOT}`",
        "",
        "## Resumo",
        f"- Documentos extraídos: **{len(inventory['documents'])}**",
        f"- Mídias (mp4/m4a): **{len(inventory['media'])}**",
        f"- Grupos únicos de reunião: **{len(canonical)}**",
        f"- Precisam Whisper (sem ata DOCX clara): **{len(inventory['video_groups']['needs_whisper'])}**",
        "",
        "## Documentos",
        "",
        "| Arquivo | Chars | Temas principais | Transcript |",
        "|---|---:|---|---|",
    ]
    for d in inventory["documents"]:
        top = ", ".join(
            f"{k}({v})" for k, v in sorted(d["themes"].items(), key=lambda x: -x[1])[:4]
        )
        lines.append(
            f"| {d['file']} | {d['chars']} | {top or '—'} | `{d['transcript']}` |"
        )

    lines += [
        "",
        "## Reuniões (vídeo/áudio) — canônicos",
        "",
        "| Título normalizado | Arquivo | MB | Ata? | Whisper? |",
        "|---|---|---:|---|---|",
    ]
    for c in sorted(canonical, key=lambda x: x["title_norm"]):
        ata = "sim" if c["matched_docs"] else "não"
        wh = "SIM" if c["needs_whisper"] else "não"
        lines.append(
            f"| {c['title_norm'][:60]} | {c['canonical_file'][:50]} | {c['mb']} | {ata} | {wh} |"
        )

    lines += ["", "## Citações-chave detectadas", ""]
    for src, q in all_quotes[:40]:
        lines.append(f"- **{src}**: …{q}…")

    lines += [
        "",
        "## Como usar",
        "- Transcrições em `transcricoes/`.",
        "- Inventário completo: `inventario-midia.json`.",
        "- Síntese temática: `sintese-temas.md`.",
        "- Vídeos marcados Whisper=SIM devem ser processados pelo script `_whisper_fontes_queue.py`.",
        "",
    ]
    INDEX.write_text("\n".join(lines), encoding="utf-8")

    # Síntese
    sint = [
        "# Síntese temática — Fontes Atlas",
        "",
        "Índice automático a partir das atas/DOCX/PDF. Vídeos sem ata entram após Whisper.",
        "",
    ]
    for theme, files in sorted(theme_index.items(), key=lambda x: -len(x[1])):
        sint.append(f"## {theme}")
        sint.append(f"Fontes ({len(files)}):")
        for f in sorted(set(files)):
            sint.append(f"- {f}")
        sint.append("")

    sint += [
        "## Decisões / falas críticas (extraídas)",
        "",
        "### Faturamento por fase (projeto, não catálogo)",
        "- Modelagem Fase 1 (5): Lucas pergunta a Luís sobre **faturamento separado por fase**; Luís responde que **não tem problema nenhum** (áudio degradado no Whisper da ata).",
        "- Atlas Requisitos (Fernanda): **faturando as fases** = entregar escopo mapeado (formulários/integrações) para faturar fases do projeto; homologar F1/F2/F3 a cada ~4 semanas.",
        "",
        "### Catálogo (já consolidado em outras atas)",
        "- Ver também `exports/_atlas_catalogo_whisper.txt` (Discovery Catálogo 08/07).",
        "",
        "### Homologação",
        "- Termo de homologação = etapa pós-OS / projeto (não = homologar produto em fases).",
        "- Parceiro alimenta homologação; MTI sobe produção (PDF PEAP).",
        "",
    ]
    SINT.write_text("\n".join(sint), encoding="utf-8")

    # whisper queue file
    queue = OUT / "whisper_queue.json"
    queue.write_text(
        json.dumps(inventory["video_groups"]["needs_whisper"], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Wrote {INDEX}")
    print(f"Docs={len(inventory['documents'])} media={len(inventory['media'])} unique={len(canonical)}")
    print(f"Need whisper={len(inventory['video_groups']['needs_whisper'])}")


if __name__ == "__main__":
    main()
