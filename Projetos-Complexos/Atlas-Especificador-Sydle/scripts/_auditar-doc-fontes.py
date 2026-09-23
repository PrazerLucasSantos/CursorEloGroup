# -*- coding: utf-8 -*-
"""Auditoria: documentação gerada × protótipo × cobertura de módulos."""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_classes_config as acc

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FORMS_PATH = os.path.join(ROOT, "data/subprojects/atlas-prototipo/epics/prototipo/forms.json")
CG_PATH = os.path.join(ROOT, "data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json")
MD_PATH = os.path.join(ROOT, "docs/entregaveis/markdown/Atlas_Projeto_Completo.md")
FONTES_TXT = os.path.join(ROOT, "docs/_fontes_txt")

# espelho das exclusões do gerador PPTX
EXCLUDE_STANDALONE = {
    "form-patlasv4-proto-convite-cadastro",
    "form-patlasv4-proto-metodo-gerar-convite",
    "form-patlasv4-proto-pessoa-habilidade",
    "form-patlasv4-proto-pessoa-exp-academica",
    "form-patlasv4-proto-pessoa-exp-profissional",
    "form-patlasv4-proto-metodo-enviar-protheus",
}
EXCLUDE_METHOD_FORMS = {
    "form-patlasv4-proto-metodo-aprovar-cadastro-org",
    "form-patlasv4-proto-metodo-solicitar-ajuste-org",
}
MODULE_FORMS = set()
for key in acc.CONFIG:
    cfg = acc.CONFIG[key]
    if cfg.get("form_id"):
        MODULE_FORMS.add(cfg["form_id"])
    for ax in cfg.get("anexos_forms", []):
        MODULE_FORMS.add(ax["form_id"])
EXTRA = [
    "form-patlasv4-proto-cat-produto", "form-patlasv4-proto-cat-catalogo",
    "form-patlasv4-proto-cat-universal", "form-patlasv4-proto-cat-dados-parceria",
    "form-patlasv4-proto-processos", "form-patlasv4-proto-proposta",
    "form-patlasv4-proto-documentos", "form-patlasv4-proto-contrato",
    "form-patlasv4-proto-emissao-ordem-servico", "form-patlasv4-proto-projeto",
]
METHOD_FORMS_DOC = set(EXTRA) | MODULE_FORMS
METHOD_FORMS_DOC |= {
    "form-patlasv4-proto-metodo-cadastrar-cargo",
    "form-patlasv4-proto-metodo-migrar-cargos-uo",
    "form-patlasv4-proto-metodo-adicionar-grupos-mipp",
    "form-patlasv4-proto-metodo-substituir-unidade",
    "form-patlasv4-proto-metodo-atribuir-cargo-pessoa",
    "form-patlasv4-proto-metodo-opcoes-pessoa",
    "form-patlasv4-proto-metodo-precadastro-acesso",
    "form-patlasv4-proto-metodo-criar-pessoa",
    "form-patlasv4-proto-metodo-preparar-proposta",
    "form-patlasv4-proto-metodo-aprovar-bloco-produto",
    "form-patlasv4-proto-metodo-criar-os",
    "form-patlasv4-proto-metodo-zerar-pedido-venda",
}

forms = json.load(open(FORMS_PATH, encoding="utf-8"))
cg = json.load(open(CG_PATH, encoding="utf-8"))
fbi = {f["id"]: f for f in forms}
md = open(MD_PATH, encoding="utf-8").read() if os.path.isfile(MD_PATH) else ""

all_form_ids = {f["id"] for f in forms}
member_ids = set()
for gids in cg.get("memberOrderByGroup", {}).values():
    member_ids.update(gids)

# forms no protótipo mas fora do PPTX principal
in_proto_not_pptx = []
for fid in sorted(member_ids):
    if fid not in fbi:
        continue
    fm = fbi[fid]
    if fid in EXCLUDE_STANDALONE:
        in_proto_not_pptx.append((fid, fm["name"], "EXCLUÍDO (backlog/F1)"))
    elif fid not in MODULE_FORMS and fid not in EXTRA and not fid.startswith("form-patlasv4-proto-metodo"):
        in_proto_not_pptx.append((fid, fm["name"], "NÃO NO MODULE_ORDER/EXTRA"))

# métodos (input forms) no protótipo
method_forms = [f for f in forms if f["id"].startswith("form-patlasv4-proto-metodo")]
missing_method_slides = []
for mf in method_forms:
    fid = mf["id"]
    if fid in EXCLUDE_METHOD_FORMS or fid in EXCLUDE_STANDALONE:
        continue
    if fid not in METHOD_FORMS_DOC:
        missing_method_slides.append((fid, mf["name"]))

# métodos embutidos em forms principais
embedded_methods = []
for fm in forms:
    for m in fm.get("methods", []):
        inp = m.get("inputFormId")
        if inp and inp in fbi:
            embedded_methods.append((fm["name"], m.get("name"), inp))

# campos sem spec no protótipo (amostra organização)
uo = fbi.get("form-patlasv4-proto-unidade-organizacional")
no_spec = []
if uo:
    for fld in uo.get("fields", []):
        if fld.get("type") in ("alert",):
            continue
        if not fld.get("spec") and fld.get("type") != "embeddedReference":
            no_spec.append(fld.get("label"))

# keywords nas fontes
keywords = {
    "pré-cadastro CPF": r"pr[eé].?cadastr|CPF.*(portal|acesso)",
    "convite código backlog": r"convite.*(c[oó]digo|link)|backlog",
    "habilitação MIPP": r"MIPP|habilita[cç][aã]o documental",
    "tributos DAFI": r"DAFI|tributo|isen[cç][aã]o.*ICMS",
    "assinatura paralela": r"paralel|sem ordem|recusa.*envelope",
    "Pro-Rata": r"pro.?rata|pr[oó].?rata",
    "catálogo F1": r"cat[aá]logo.*(fase|Fase)",
    "Servidor oculto": r"[Ss]ervidor.*(ocult|n[aã]o.*ver|backoffice)",
    "Protheus F2": r"Protheus|pedido de venda",
    "ServiceNow": r"ServiceNow|SNOW",
    "Gov.br MT Login": r"Gov\.?br|MT Login",
    "grupos documento Compliance": r"[Cc]ompliance|4.*grupo",
    "pessoa específica workflow": r"pessoa espec[ií]fica|opcional.*cargo",
}
fonte_hits = {k: [] for k in keywords}
if os.path.isdir(FONTES_TXT):
    for fn in os.listdir(FONTES_TXT):
        if not fn.endswith(".txt"):
            continue
        text = open(os.path.join(FONTES_TXT, fn), encoding="utf-8", errors="ignore").read()
        for kw, pat in keywords.items():
            if re.search(pat, text, re.I):
                fonte_hits[kw].append(fn)

# verificar presença no MD gerado
md_checks = {
    "Organização tributos isenção ICMS": "Isento de ICMS",
    "Organização MIPP status": "Status da habilitação documental",
    "Cargo pode assinar": "Pode assinar",
    "Assinatura recusa motivo": "motivo",
    "Pro-Rata cobrança": "Pro-Rata",
    "Pré-cadastrar acesso CPF": "Pré-cadastrar acesso",
    "Solicitação vínculo": "Solicitação de vínculo",
    "Versão processo": "Versão",
    "Dossiê entrega": "Dossiê",
}
md_presence = {k: (v in md) for k, v in md_checks.items()}

print("=== AUDITORIA DOCUMENTAÇÃO × PROTÓTIPO ===\n")
print(f"Forms no protótipo: {len(forms)}")
print(f"Classes em class-groups: {len(member_ids)}")
print(f"Forms em atlas_classes_config: {len(MODULE_FORMS)}")

print("\n--- Forms no protótipo NÃO no PPTX principal ---")
for fid, name, reason in in_proto_not_pptx[:40]:
    print(f"  [{reason}] {name} ({fid})")
if len(in_proto_not_pptx) > 40:
    print(f"  ... +{len(in_proto_not_pptx)-40}")

print("\n--- Métodos (forms) sem slide dedicado no PPTX ---")
for fid, name in missing_method_slides:
    print(f"  {name} ({fid})")
if not missing_method_slides:
    print("  (nenhum — ou todos cobertos por lista manual/exclusão)")

print("\n--- Métodos embutidos em telas (amostra) ---")
for parent, mname, inp in embedded_methods[:15]:
    print(f"  {parent} › {mname} → {fbi[inp]['name']}")
print(f"  Total métodos embutidos: {len(embedded_methods)}")

print("\n--- Campos Organização sem spec (obs vazia na doc) ---")
for lbl in no_spec[:20]:
    print(f"  {lbl}")

print("\n--- Keywords nas fontes (_fontes_txt) ---")
for kw, files in fonte_hits.items():
    print(f"  {kw}: {len(files)} arquivo(s) — {', '.join(files[:3])}")

print("\n--- Presença no Atlas_Projeto_Completo.md ---")
for k, ok in md_presence.items():
    print(f"  {'OK' if ok else 'FALTA'} — {k}")
