import json
from pathlib import Path

p = Path(
    r"c:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
    r"\exports\_pptx_color_audit.json"
)
d = json.loads(p.read_text(encoding="utf-8"))
want = {6, 10, 11, 12, 22, 23, 24, 30, 34}
out = []
for s in d["slides_text"]:
    if s["slide"] in want:
        out.append("=" * 60)
        out.append(f"SLIDE {s['slide']}: {s['title']}")
        out.append("=" * 60)
        out.append(s["text"])
        out.append("")
Path(
    r"c:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
    r"\exports\_pptx_slides_highlighted.txt"
).write_text("\n".join(out), encoding="utf-8")
print("ok", len(out))
