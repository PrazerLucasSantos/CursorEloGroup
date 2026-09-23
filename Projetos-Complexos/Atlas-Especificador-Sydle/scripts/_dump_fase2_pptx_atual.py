# -*- coding: utf-8 -*-
from __future__ import annotations

from pathlib import Path

from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

PPTX = Path(r"c:\Users\LucasSantos\EloGroup\MTI - 1. Projeto Atlas\Requisitos") / "Fase 2.pptx"
OUT = Path(__file__).resolve().parents[1] / "exports" / "_pptx_fase2_atual_dump.txt"


def iter_shapes(shapes):
    for s in shapes:
        yield s
        if s.shape_type == MSO_SHAPE_TYPE.GROUP:
            try:
                yield from iter_shapes(s.shapes)
            except Exception:
                pass


def main() -> int:
    prs = Presentation(str(PPTX))
    lines = [
        f"PPTX: {PPTX}",
        f"Slides: {len(prs.slides)}",
        f"Size_bytes: {PPTX.stat().st_size}",
        "",
    ]
    for i, slide in enumerate(prs.slides, 1):
        texts = []
        for shape in iter_shapes(slide.shapes):
            try:
                if shape.has_text_frame:
                    t = shape.text_frame.text.strip()
                    if t:
                        texts.append(t)
                if shape.has_table:
                    for row in shape.table.rows:
                        texts.append(
                            " | ".join(
                                c.text_frame.text.strip().replace("\n", " ")
                                for c in row.cells
                            )
                        )
            except Exception:
                pass
        notes = ""
        try:
            if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
                notes = slide.notes_slide.notes_text_frame.text.strip()
        except Exception:
            pass
        title = texts[0].replace("\n", " | ")[:180] if texts else "(sem texto)"
        lines.append("=" * 72)
        lines.append(f"SLIDE {i}: {title}")
        lines.append("=" * 72)
        lines.append("\n".join(texts))
        if notes:
            lines.append("--- NOTES ---")
            lines.append(notes)
        lines.append("")
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} chars={OUT.stat().st_size} slides={len(prs.slides)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
