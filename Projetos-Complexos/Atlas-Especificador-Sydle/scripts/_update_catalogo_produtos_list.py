# -*- coding: utf-8 -*-
"""Upgrade Catalogo.Produtos to embedded table of products for this catalog/solution."""
import json
from pathlib import Path

path = Path("data/subprojects/atlas-prototipo/epics/prototipo/forms.json")
forms = json.loads(path.read_text(encoding="utf-8"))
cat = next(f for f in forms if f["id"] == "form-patlasv4-proto-cat-catalogo")

for s in cat.get("sections") or []:
    if s["id"] == "sec-cat-produtos":
        s["title"] = "Produtos da solução (neste catálogo)"

for f in cat["fields"]:
    if f["id"] == "form-patlasv4-proto-cat-catalogo-produtos":
        f["label"] = "Produtos da solução"
        f["type"] = "embeddedReference"
        f["multiple"] = True
        f["required"] = False
        f["size"] = "large"
        f["linkedFormId"] = "form-patlasv4-proto-cat-produto"
        f["embeddedDisplay"] = "table"
        f.pop("options", None)
        f["spec"] = (
            "**Para que serve:** Lista os produtos deste Catálogo da parceria — "
            "ou seja, os produtos da Solução/versão vinculada a este catálogo.\n\n"
            "**Onde é usado:** Manutenção do cardápio no backoffice; espelho do que o parceiro "
            "envia via portal/CSV; base para consumo comercial (Fase 3).\n\n"
            "**Origem / de onde vem:** Classe Produto com Catálogo = este registro "
            "(Parceria + Solução + Versão já definidos no cabeçalho).\n\n"
            "**Regras:** Não obrigatório na criação inicial do catálogo. "
            "Incluir depois (manual ou CSV). Cada produto pertence a um único catálogo. "
            "Não listar aqui produtos de outras soluções/versões."
        )
        print("updated field", f["id"])


def prod_row(nome, part, tipo, oferta, modelo=None, metrica=None, valor=None, moeda=None, consumo=None):
    row = {
        "form-patlasv4-proto-cat-produto-identificador": nome,
        "form-patlasv4-proto-cat-produto-part-number": part,
        "form-patlasv4-proto-cat-produto-tipo": tipo,
        "form-patlasv4-proto-cat-produto-tipo-oferta": oferta,
        "form-patlasv4-proto-cat-produto-ativo": True,
    }
    if modelo:
        row["form-patlasv4-proto-cat-produto-modelo-venda"] = modelo
    if metrica:
        row["form-patlasv4-proto-cat-produto-metrica"] = metrica
    if valor is not None:
        row["form-patlasv4-proto-cat-produto-valor-unitario"] = valor
    if moeda:
        row["form-patlasv4-proto-cat-produto-moeda-universal"] = moeda
    if consumo is not None:
        row["form-patlasv4-proto-cat-produto-consumo-os"] = consumo
    return row


for p in cat.get("exampleValuePresets") or []:
    emb = dict(p.get("embeddedRowsByFieldId") or {})
    if p["id"] == "form-patlasv4-proto-cat-catalogo-p-simplifica":
        emb["form-patlasv4-proto-cat-catalogo-produtos"] = [
            prod_row(
                "Elaborar plano de projeto",
                "SIMP-SRV-01",
                "Serviço",
                "Universal",
                modelo="Por UST",
                metrica="UST",
                valor=1,
                moeda="BRL",
                consumo=True,
            ),
            prod_row(
                "Licença plataforma Simplifica",
                "SIMP-LIC-01",
                "Licença",
                "Individualizado",
                modelo="Por licença",
                valor=1500,
                moeda="BRL",
            ),
            prod_row(
                "Implantação MTI Simplifica",
                "SIMP-SRV-02",
                "Serviço",
                "Individualizado",
                modelo="Por serviço",
                valor=25000,
                moeda="BRL",
            ),
        ]
        p["embeddedRowsByFieldId"] = emb
        print("preset simplifica products", len(emb["form-patlasv4-proto-cat-catalogo-produtos"]))
    elif p["id"] == "form-patlasv4-proto-cat-catalogo-p-host":
        emb["form-patlasv4-proto-cat-catalogo-produtos"] = [
            prod_row(
                "Serviço de hospedagem",
                "HOST-SRV-01",
                "Serviço",
                "Individualizado",
                modelo="Por serviço",
                valor=8000,
                moeda="BRL",
            ),
        ]
        p["embeddedRowsByFieldId"] = emb
        print("preset host products", len(emb["form-patlasv4-proto-cat-catalogo-produtos"]))

path.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("OK wrote", path)
