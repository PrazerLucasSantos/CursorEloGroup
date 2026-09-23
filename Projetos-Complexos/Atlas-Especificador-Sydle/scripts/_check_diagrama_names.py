# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

p = Path(
    r"C:\Users\LucasSantos\.cursor\projects\c-Users-LucasSantos-OneDrive-EloGroup-rea-de-Trabalho-Cursor-Especificador-Sydle\canvases\diagrama-classes-fase2-catalogo.canvas.tsx"
)
t = p.read_text(encoding="utf-8")
m = re.search(r"const FIELDS: FieldRow\[\] = (\[.*?\]);\n\ntype NodeDef", t, re.S)
rows = json.loads(m.group(1))
fset = set(r["classe"] for r in rows)
nodes = re.findall(r'classe: "([^"]+)"', t)
print("nodes without fields:")
for n in nodes:
    if n not in fset:
        print(" MISS", n)
print("fields without nodes:")
nset = set(nodes)
for c in sorted(fset):
    if c not in nset:
        print(" ORPHAN", c)
