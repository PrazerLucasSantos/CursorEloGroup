import json
from pathlib import Path

forms = json.loads(Path("data/subprojects/atlas-prototipo/epics/prototipo/forms.json").read_text(encoding="utf-8"))
by = {f["id"]: f for f in forms}

checks = []

# Cobrança options
cob = by["form-patlasv4-proto-cat-tipo-cobranca"]
opts = [p["name"] for p in cob.get("placeholders") or []]
checks.append(("Cobrança placeholders", opts, opts == ["Mensal", "Anual", "Conforme homologação"]))
recorr = next(f for f in cob["fields"] if "recorrencia" in f["id"])
checks.append(("Recorrência hidden", recorr.get("hidden"), True))

# Modelo venda
mv = by["form-patlasv4-proto-cat-modelo-venda"]
opts = [p["name"] for p in mv.get("placeholders") or []]
checks.append(("Modelo venda placeholders", opts, opts == ["Por Licença", "Por Serviço", "Por Pacote"]))

# Parceria hidden extras
par = by["form-patlasv4-proto-cat-parceria"]
hid = {f["label"]: f.get("hidden") for f in par["fields"] if f.get("type") != "alert"}
checks.append(("Parceria status hidden", hid.get("Status"), True))
vis = [f["label"] for f in par["fields"] if not f.get("hidden") and f.get("type") != "alert"]
checks.append(("Parceria visible fields", vis, True))

# Solucao
sol = by["form-patlasv4-proto-cat-solucao"]
vis = [f["label"] for f in sol["fields"] if not f.get("hidden") and f.get("type") != "alert"]
checks.append(("Solução visible", vis, True))

# Catalogo toggles + focals
cat = by["form-patlasv4-proto-cat-catalogo"]
labels = {f["id"]: (f.get("label"), f.get("hidden"), f.get("required")) for f in cat["fields"]}
checks.append(("Cat has Universal?", "form-patlasv4-proto-cat-catalogo-toggle-universal" in labels, True))
checks.append(("Cat has Serviços?", "form-patlasv4-proto-cat-catalogo-toggle-servicos" in labels, True))
checks.append(("Cat focal vendas visible", not labels["form-patlasv4-proto-cat-catalogo-focal-vendas"][1], True))
checks.append(("Cat name", cat.get("name"), True))

# Produto focals hidden, qtde metrica
prod = by["form-patlasv4-proto-cat-produto"]
plabels = {f["id"]: f for f in prod["fields"]}
checks.append(("Prod focal vendas hidden", plabels["form-patlasv4-proto-cat-produto-focal-vendas"].get("hidden"), True))
checks.append(("Prod DTIC hidden", plabels["form-patlasv4-proto-cat-produto-unidade-dtic"].get("hidden"), True))
q = plabels.get("form-patlasv4-proto-cat-produto-qtde-metrica") or plabels.get("form-patlasv4-proto-cat-produto-qtde-hst-ust")
checks.append(("Qtde métrica label/id", (q["id"] if q else None, q.get("label") if q else None), True))
checks.append(("Tipo produto opts", plabels["form-patlasv4-proto-cat-produto-tipo"].get("options"), True))
checks.append(("Cobrança produto opts", plabels["form-patlasv4-proto-cat-produto-cobranca"].get("options"), True))

# Universal no focals
uni = by["form-patlasv4-proto-cat-universal"]
ulabels = [f["label"] for f in uni["fields"] if not f.get("hidden") and f.get("type") != "alert"]
checks.append(("Universal fields", ulabels, True))
ustatus = plabels  # noop
st = next(f for f in uni["fields"] if "status" in f["id"])
checks.append(("Universal status opts", st.get("options"), True))

# Dados parceria still exists
dp = by.get("form-patlasv4-proto-cat-dados-parceria")
checks.append(("Dados parceria exists (prototype)", bool(dp), True))

out = Path("exports/_proto_check_luis.txt")
lines = []
for name, val, _ in checks:
    lines.append(f"{name}: {val}")
out.write_text("\n".join(lines), encoding="utf-8")
print("OK wrote", out)
