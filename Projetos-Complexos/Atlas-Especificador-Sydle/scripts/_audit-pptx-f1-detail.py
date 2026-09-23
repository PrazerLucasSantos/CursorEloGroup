# -*- coding: utf-8 -*-
"""Detalhe F1: campos e fases no PPTX em andamento."""
import re
from pptx import Presentation

PPTX = (
    r"c:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho"
    r"\Documentação de requisitos\Requisitos Atlas - Final - em andamento.pptx"
)

prs = Presentation(PPTX)
all_rows = []
all_blob = []

for si, slide in enumerate(prs.slides):
    slide_text = []
    module = ""
    for sh in slide.shapes:
        if sh.has_text_frame:
            t = sh.text_frame.text
            slide_text.append(t)
            if re.match(r"^(Organização|Pessoa|Cargo|Assinatura|Notificações|Tipo de Documento|Versões de Processo|Template|Dossiê|Catálogo)", t.strip().split("\n")[0]):
                module = t.strip().split("\n")[0]
        if sh.has_table:
            tbl = sh.table
            for ri in range(len(tbl.rows)):
                try:
                    row = [tbl.cell(ri, ci).text.strip() for ci in range(len(tbl.columns))]
                except Exception:
                    continue
                if row and row[0] not in ("Campo", ""):
                    all_rows.append({"slide": si + 1, "module": module, "row": row})
                    all_blob.append(" | ".join(row))
    all_blob.append("\n".join(slide_text))

blob = "\n".join(all_blob)

# F1 delivery checklist from Atlas_Entregas_por_Fase
checks = [
    ("1 Organização — cadastro base", ["Tipo de Organização", "Hierarquia", "MIPP", "Tributos", "Documentos de habilitação"]),
    ("2 Métodos org — aprovar/ajuste/migrar/substituir", ["Aprovar cadastro", "Solicitar ajuste", "Migrar cargos", "Substituir unidade"]),
    ("3 Pessoa — cadastro", ["CPF", "Matrícula Sigadoc", "Dados bancários", "Ocupante"]),
    ("4 Filiação e contatos Pessoa", ["Filiação", "Tipo de telefone", "Telefone"]),
    ("5 Cargo — base", ["Pode assinar", "Suplente", "Substituto", "Região"]),
    ("6 Visibilidade produto Cargo", ["Produto", "visibilidade", "filiação de produto"]),
    ("7 Tipo Doc + OCR", ["Modo automático", "OCR", "vencimento", "alerta"]),
    ("8 OCR vencimento (regra)", ["Modo automático", "data de vencimento"]),
    ("9 Template", ["Mustache", "bloco", "versionamento", "publicação"]),
    ("10 Assinatura digital", ["Enviar para assinatura", "Recusar", "Selecionar método", "Envelope", "paralel"]),
    ("11 Gov.br / MT Login", ["Gov.br", "MT Login", "OAuth", "federado"]),
    ("12 Painel assinaturas", ["Painel", "pendente", "Aprovar", "Recusar"]),
    ("13 Notificações multicanal", ["E-mail", "WhatsApp", "SMS", "badge"]),
    ("14 Auditoria cadastros", ["Auditoria", "Histórico", "trilha", "metadados"]),
]

print("=== F1 ENTREGAS × PPTX (campo/regra) ===\n")
for name, terms in checks:
    found = [t for t in terms if re.search(re.escape(t), blob, re.I)]
    missing = [t for t in terms if t not in found]
    if len(found) == len(terms):
        status = "PRONTO"
    elif found:
        status = "PARCIAL"
    else:
        status = "FALTA"
    print(f"[{status}] {name}")
    if found:
        print(f"       ok: {', '.join(found)}")
    if missing:
        print(f"       falta: {', '.join(missing)}")
    print()

# Modules marked Fase 1 in slide headers
print("=== MÓDULOS COM MARCA 'Fase 1' NO PPTX ===")
fase_hits = []
for si, slide in enumerate(prs.slides):
    for sh in slide.shapes:
        if sh.has_text_frame:
            t = sh.text_frame.text
            if re.search(r"Fase\s*1|FASE\s*1", t):
                first = t.strip().split("\n")[0][:80]
                fase_hits.append((si + 1, first))
for n, t in fase_hits[:30]:
    print(f"  slide {n}: {t}")
print(f"  total slides com 'Fase 1': {len(fase_hits)}")

print("\n=== MÓDULOS QUE DEVEM SAIR / MOVER DE F1 NO PPTX ===")
wrong_f1 = [
    ("Versões de Processo (slides 64-66)", r"Versões de Processo", "F2 — Hub Processos"),
    ("Dossiê EV (slides 72-78)", r"Dossiê", "F2"),
    ("Catálogo & Produto (slides 79-99)", r"Catálogo", "F3"),
]
for label, pat, target in wrong_f1:
    m = re.search(pat, blob, re.I)
    print(f"  REMOVER/REETIQUETAR: {label} → {target}")

# Convite embedded in Org?
print("\n=== CONVITE (deve ser F2) ===")
for term in ["Convite", "código de convite", "link de convite", "Gerar convite"]:
    print(f"  {term}: {'OK' if re.search(term, blob, re.I) else '--'}")

# Specific field search
print("\n=== CAMPOS ESPECÍFICOS ===")
specific = [
    "Representa Organização",
    "Compliance",
    "Isento de ICMS",
    "DAFI",
    "Pré-cadastrar acesso",
    "Natureza do vínculo",
    "Filial",
    "Filiação",
    "Administrador",
    "módulos executor",
    "ICP",
    "Certificado A3",
    "Senha + MFA",
    "Ordem de assinatura",
    "signatário",
    "Regra por evento",
    "Canal",
]
for s in specific:
    print(f"  [{'OK' if re.search(re.escape(s), blob, re.I) else '--'}] {s}")
