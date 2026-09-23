from pathlib import Path
import zipfile, re, xml.etree.ElementTree as ET

pptx = Path(
    r"c:/Users/LucasSantos/OneDrive - EloGroup/Área de Trabalho/Cursor/Especificador Sydle/exports/_Fase2_req_final_copy.pptx"
)
out_path = Path(
    r"c:/Users/LucasSantos/OneDrive - EloGroup/Área de Trabalho/Cursor/Especificador Sydle/exports/_audit_fase2_req_final.txt"
)

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

with zipfile.ZipFile(pptx) as z:
    slides = sorted(
        [n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)],
        key=lambda x: int(re.search(r"slide(\d+)", x).group(1)),
    )
    chunks = [f"TOTAL_SLIDES={len(slides)}\n"]
    for sn in slides:
        root = ET.fromstring(z.read(sn))
        # collect text runs in document order
        lines = []
        for t in root.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}t"):
            if t.text is not None:
                lines.append(t.text)
        # Also try table cells as paragraphs
        full = " ".join(lines)
        full = re.sub(r"[ \t]+", " ", full)
        full = re.sub(r" ?\n ?", "\n", full).strip()
        # Better: group by paragraph
        paras = []
        for p_el in root.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}p"):
            texts = [
                t.text or ""
                for t in p_el.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}t")
            ]
            line = "".join(texts).strip()
            if line:
                paras.append(line)
        num = re.search(r"slide(\d+)", sn).group(1)
        body = "\n".join(paras) if paras else full
        chunks.append(f"===== SLIDE {num} =====\n{body}\n")

out_path.write_text("\n".join(chunks), encoding="utf-8")
print(f"slides={len(slides)} out={out_path} chars={out_path.stat().st_size}")
