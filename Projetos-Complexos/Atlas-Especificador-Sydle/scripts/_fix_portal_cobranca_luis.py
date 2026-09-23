from pathlib import Path

base = Path(__file__).resolve().parents[1] / "src" / "portalParceiro"
p = base / "portalParceiroData.ts"
t = p.read_text(encoding="utf-8")
old = "cobranca: 'Sob Demanda'"
new = "cobranca: 'Conforme homologação'"
print("data replacements", t.count(old))
p.write_text(t.replace(old, new), encoding="utf-8")

cpath = base / "portalParceiroCsv.ts"
c = cpath.read_text(encoding="utf-8")
cpath.write_text(c.replace("'Sob Demanda'", "'Conforme homologação'"), encoding="utf-8")
print("csv done")

ws = Path(__file__).resolve().parents[1] / "data/subprojects/atlas-prototipo/epics/prototipo/workspaces.json"
w = ws.read_text(encoding="utf-8")
w2 = w.replace('"name": "Catálogo",\n            "linkedFormId": "form-patlasv4-proto-cat-catalogo"',
               '"name": "Catálogo da parceria",\n            "linkedFormId": "form-patlasv4-proto-cat-catalogo"')
ws.write_text(w2, encoding="utf-8")
print("workspace renamed", w != w2)
