# -*- coding: utf-8 -*-
"""
Gera a documentação de uma classe Atlas em PowerPoint (.pptx), no padrão visual
do template `docs/Atlas requisitos.pptx` (barra azul accent1, cabeçalho cinza,
logo ELOGROUP do master). Data-driven a partir do forms.json.

Uso: python scripts/gerar-pptx-classe.py pessoa
"""
import json
import os
import sys
import copy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_classes_config as acc

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FORMS_PATH = os.path.join(ROOT, "data/subprojects/atlas-prototipo/epics/prototipo/forms.json")
TEMPLATE = os.path.join(ROOT, "docs/entregaveis/pptx/Atlas requisitos.pptx")

CLASSE = sys.argv[1] if len(sys.argv) > 1 else "pessoa"
CFG = acc.CONFIG[CLASSE]
OUT_PATH = os.path.join(ROOT, CFG["out"].replace("/docx/", "/pptx/").replace(".docx", ".pptx"))
TITULO_TELA = CFG["titulo"].split("—")[0].strip()
if TITULO_TELA.lower().startswith("classe "):
    TITULO_TELA = TITULO_TELA[len("classe "):].strip()

# Paleta (tema do template)
BLUE = RGBColor(0x18, 0x22, 0xDC)      # accent1
GREY_HDR = RGBColor(0xD9, 0xD9, 0xD9)  # cabeçalho da tabela
DARK = RGBColor(0x27, 0x27, 0x27)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LINE = RGBColor(0xBF, 0xBF, 0xBF)

F_TITLE = "PP Telegraf"
F_HEAD = "PP Telegraf"
F_LABEL = "PP Telegraf SemiBold"
F_BODY = "Arial"

with open(FORMS_PATH, encoding="utf-8") as f:
    FORMS = json.load(f)
FORM_BY_ID = {fm["id"]: fm for fm in FORMS}
LABEL_BY_ID = {}
for fm in FORMS:
    for fld in fm.get("fields", []):
        LABEL_BY_ID[fld["id"]] = fld.get("label", fld["id"])


def friendly_type(fld):
    t = fld.get("type")
    base = {
        "text": "Texto longo" if fld.get("textLong") else "Texto",
        "number": "Número", "date": "Data", "boolean": "Sim/Não",
        "file": "Arquivo", "alert": "Aviso na tela",
    }.get(t)
    if base:
        return base
    if t == "textOptions":
        return "Opções (várias)" if fld.get("multiple") else "Opções (uma)"
    if t == "reference":
        return "Seleção (várias)" if fld.get("multiple") else "Seleção"
    if t == "embeddedReference":
        return "Tabela"
    return t or "—"


def tipo_cell(fld):
    txt = friendly_type(fld)
    opts = fld.get("options") or []
    if opts and fld.get("type") in ("textOptions", "reference"):
        amostra = " · ".join(opts[:6]) + ("…" if len(opts) > 6 else "")
        txt += f"\nOpções: {amostra}"
    return txt


def regra_cell(fld):
    parts = []
    if fld.get("required") and not fld.get("readOnly"):
        parts.append("Obrigatório")
    if fld.get("readOnly"):
        parts.append("Somente leitura")
    if fld.get("hidden"):
        parts.append("Oculto (condicional)")
    return "\n".join(parts)


def obs_cell(fld):
    return fld.get("spec") or fld.get("label") or ""


# ---------- estilo de células ----------

def set_fill(cell, rgb):
    cell.fill.solid()
    cell.fill.fore_color.rgb = rgb


def no_fill(cell):
    cell.fill.background()


def bottom_border(cell, rgb=LINE, w=6350):
    tcPr = cell._tc.get_or_add_tcPr()
    for tag in ("a:lnB",):
        existing = tcPr.find(qn(tag))
        if existing is not None:
            tcPr.remove(existing)
        ln = tcPr.makeelement(qn(tag), {"w": str(w), "cap": "flat"})
        fill = ln.makeelement(qn("a:solidFill"), {})
        clr = fill.makeelement(qn("a:srgbClr"), {"val": "%02X%02X%02X" % (rgb[0], rgb[1], rgb[2])})
        fill.append(clr)
        ln.append(fill)
        tcPr.append(ln)


def style_cell(cell, text, *, bold=False, size=11, color=DARK, font=F_BODY,
               align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE):
    cell.vertical_anchor = anchor
    cell.margin_left = Inches(0.08)
    cell.margin_right = Inches(0.08)
    cell.margin_top = Inches(0.02)
    cell.margin_bottom = Inches(0.02)
    tf = cell.text_frame
    tf.word_wrap = True
    lines = str(text).split("\n")
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(0)
        p.space_before = Pt(0)
        r = p.add_run()
        r.text = ln
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.name = font
        r.font.color.rgb = color


# ---------- montagem ----------

prs = Presentation(TEMPLATE)
LAYOUT = None
for lay in prs.slide_layouts:
    if lay.name == "Todo branco":
        LAYOUT = lay
        break
if LAYOUT is None:
    LAYOUT = prs.slide_layouts[1]

# remove slides existentes do template (rel + entrada na lista)
xml_slides = prs.slides._sldIdLst
for sld in list(xml_slides):
    rId = sld.get(qn("r:id"))
    try:
        prs.part.drop_rel(rId)
    except Exception:
        pass
    xml_slides.remove(sld)

SW = prs.slide_width
SH = prs.slide_height


def add_slide():
    return prs.slides.add_slide(LAYOUT)


def add_title(slide, text):
    box = slide.shapes.add_textbox(Inches(0.6), Inches(0.22), Inches(8.0), Inches(0.5))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = text
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.name = F_TITLE
    r.font.color.rgb = DARK


def add_intro(slide, text):
    box = slide.shapes.add_textbox(Inches(0.6), Inches(0.72), Inches(12.1), Inches(0.5))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = text
    r.font.size = Pt(10)
    r.font.name = F_TITLE
    r.font.color.rgb = DARK


# ---- Slide 1: História / Contexto / Requisitos e Regras ----

def build_intro_slide():
    slide = add_slide()
    add_title(slide, f"{TITULO_TELA} — Visão geral")
    rows = 3
    tbl_shape = slide.shapes.add_table(rows, 2, Inches(0.6), Inches(0.95),
                                       Inches(12.13), Inches(5.9))
    table = tbl_shape.table
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(9.93)
    table.rows[0].height = Inches(1.1)
    table.rows[1].height = Inches(1.7)
    table.rows[2].height = Inches(3.1)

    labels = ["História", "Contexto da História", "Requisitos e Regras"]
    for i, lab in enumerate(labels):
        c = table.cell(i, 0)
        set_fill(c, BLUE)
        style_cell(c, lab, bold=True, size=12, color=WHITE, font=F_LABEL,
                   anchor=MSO_ANCHOR.TOP)

    # conteúdo
    c0 = table.cell(0, 1)
    no_fill(c0)
    style_cell(c0, CFG["historia"], size=11, color=DARK, anchor=MSO_ANCHOR.TOP)

    c1 = table.cell(1, 1)
    no_fill(c1)
    style_cell(c1, CFG["contexto"], size=10.5, color=DARK, anchor=MSO_ANCHOR.TOP)

    c2 = table.cell(2, 1)
    no_fill(c2)
    c2.vertical_anchor = MSO_ANCHOR.TOP
    tf = c2.text_frame
    tf.word_wrap = True

    def add_par(text, bold=False, size=10.5, bullet=False, color=DARK, first=False):
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        p.space_after = Pt(1)
        p.space_before = Pt(0)
        r = p.add_run()
        r.text = ("•  " if bullet else "") + text
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.name = F_BODY
        r.font.color.rgb = color

    add_par("Requisitos Funcionais", bold=True, size=11, color=BLUE, first=True)
    for req in CFG["requisitos"]:
        add_par(req, bullet=True)
    add_par("Regras de Negócio", bold=True, size=11, color=BLUE)
    for rg in CFG["regras"]:
        add_par(rg, bullet=True)

    for i in range(rows):
        bottom_border(table.cell(i, 0))
        bottom_border(table.cell(i, 1))


# ---- Slides de Telas e Campos ----

COL_W = [Inches(2.7), Inches(2.0), Inches(2.7), Inches(4.73)]
HEADERS = ["Campo", "Tipo", "Regras de Campo", "Observação"]
TABLE_LEFT = Inches(0.6)
TABLE_TOP = Inches(1.25)
ROWS_PER_SLIDE = 9


def collect_rows_for_form(form):
    """Lista de blocos: ('bar', titulo) | ('fields', [campo,tipo,regra,obs])."""
    blocks = []
    secs = form.get("sections", [])
    flds = form.get("fields", [])
    embed_titles = CFG.get("embed_titles", {})

    def emit_fields(field_list):
        for fld in field_list:
            if fld.get("type") == "alert":
                blocks.append(("fields", [fld.get("label", "Aviso"),
                                          "Aviso na tela", "",
                                          fld.get("alertMessage", "")]))
                continue
            if fld.get("type") == "embeddedReference":
                title = embed_titles.get(fld["id"], fld.get("label", "Tabela"))
                blocks.append(("subbar", f"Tabela: {title}"))
                linked = FORM_BY_ID.get(fld.get("linkedFormId"))
                if linked:
                    for sub in linked.get("fields", []):
                        if sub.get("type") == "alert":
                            continue
                        blocks.append(("fields", [sub.get("label", ""), tipo_cell(sub),
                                                  regra_cell(sub), obs_cell(sub)]))
                continue
            blocks.append(("fields", [fld.get("label", ""), tipo_cell(fld),
                                      regra_cell(fld), obs_cell(fld)]))

    if not secs:
        emit_fields(flds)
        return [("bar", f"Tela: {TITULO_TELA}")] + blocks

    out = []
    tops = [s for s in secs if not s.get("parentSectionId")]
    for sec in tops:
        out.append(("bar", f"Tela: {TITULO_TELA}   ›   Aba: {sec.get('title','').strip()}"))
        blocks = []
        emit_fields([f for f in flds if f.get("sectionId") == sec["id"]])
        out += blocks
        for sub in [s for s in secs if s.get("parentSectionId") == sec["id"]]:
            out.append(("subbar", f"Aba: {sec.get('title','').strip()} › {sub.get('title','').strip()}"))
            blocks = []
            emit_fields([f for f in flds if f.get("sectionId") == sub["id"]])
            out += blocks
    return out


def render_blocks(blocks, slide_title):
    """Pagina blocos em slides com tabela de 4 colunas."""
    i = 0
    n = len(blocks)
    current_bar = None
    while i < n:
        # pula barras consecutivas, registra a última como cabeçalho do bloco
        slide = add_slide()
        add_title(slide, slide_title)
        # monta linhas desta página
        page = []
        # sempre começa com uma barra (a vigente) + cabeçalho de colunas
        # encontra a barra vigente
        if blocks[i][0] in ("bar", "subbar"):
            current_bar = blocks[i]
            i += 1
        if current_bar is None:
            current_bar = ("bar", f"Tela: {TITULO_TELA}")
        page.append(current_bar)
        page.append(("colhdr", HEADERS))
        count = 0
        while i < n and count < ROWS_PER_SLIDE:
            kind, payload = blocks[i]
            if kind in ("bar", "subbar"):
                current_bar = blocks[i]
                page.append(blocks[i])
                page.append(("colhdr", HEADERS))
                i += 1
                continue
            page.append(blocks[i])
            count += 1
            i += 1
        _draw_table(slide, page)


def _draw_table(slide, page):
    rows = len(page)
    tbl_shape = slide.shapes.add_table(rows, 4, TABLE_LEFT, TABLE_TOP,
                                       sum(COL_W, Emu(0)), Inches(0.4 * rows))
    table = tbl_shape.table
    for ci, w in enumerate(COL_W):
        table.columns[ci].width = w
    for ri, (kind, payload) in enumerate(page):
        if kind in ("bar", "subbar"):
            c0 = table.cell(ri, 0)
            c3 = table.cell(ri, 3)
            c0.merge(c3)
            set_fill(c0, BLUE)
            style_cell(c0, payload, bold=(kind == "bar"), size=12 if kind == "bar" else 11,
                       color=WHITE, font=F_HEAD)
        elif kind == "colhdr":
            for ci, h in enumerate(payload):
                c = table.cell(ri, ci)
                set_fill(c, GREY_HDR)
                style_cell(c, h, bold=True, size=11, color=DARK, font=F_HEAD)
        else:  # fields
            for ci, val in enumerate(payload):
                c = table.cell(ri, ci)
                no_fill(c)
                style_cell(c, val, bold=(ci == 0), size=10,
                           color=DARK, font=(F_BODY if ci != 0 else F_HEAD))
                bottom_border(c)


# ---- anexos (telas relacionadas) ----

def build_anexos():
    for ax in CFG.get("anexos_forms", []):
        fm = FORM_BY_ID.get(ax["form_id"])
        if not fm:
            continue
        blocks = collect_rows_for_form_named(fm, ax["titulo"])
        render_blocks(blocks, f"Telas relacionadas — {ax['titulo']}")


def collect_rows_for_form_named(form, nome):
    secs = form.get("sections", [])
    flds = form.get("fields", [])
    embed_titles = CFG.get("embed_titles", {})

    def fld_row(fld):
        return ("fields", [fld.get("label", ""), tipo_cell(fld), regra_cell(fld), obs_cell(fld)])

    def emit(field_list, out):
        for fld in field_list:
            if fld.get("type") == "alert":
                out.append(("fields", [fld.get("label", "Aviso"), "Aviso na tela", "", fld.get("alertMessage", "")]))
            elif fld.get("type") == "embeddedReference":
                title = embed_titles.get(fld["id"], fld.get("label", "Tabela"))
                out.append(("subbar", f"Tabela: {title}"))
                linked = FORM_BY_ID.get(fld.get("linkedFormId"))
                if linked:
                    for sub in linked.get("fields", []):
                        if sub.get("type") != "alert":
                            out.append(fld_row(sub))
            else:
                out.append(fld_row(fld))

    if not secs:
        out = [("bar", nome)]
        emit(flds, out)
        return out
    out = []
    tops = [s for s in secs if not s.get("parentSectionId")]
    for sec in tops:
        out.append(("bar", f"{nome}   ›   Aba: {sec.get('title','').strip()}"))
        emit([f for f in flds if f.get("sectionId") == sec["id"]], out)
        for sub in [s for s in secs if s.get("parentSectionId") == sec["id"]]:
            out.append(("subbar", f"Aba: {sec.get('title','').strip()} › {sub.get('title','').strip()}"))
            emit([f for f in flds if f.get("sectionId") == sub["id"]], out)
    return out


# Execução
uo = FORM_BY_ID[CFG["form_id"]]
build_intro_slide()

intro_txt = ("A tela é organizada em abas. Os blocos que no sistema são tabelas "
             "vinculadas estão apresentados como parte da própria aba, com seus campos.")
blocks = collect_rows_for_form(uo)
# primeiro slide de telas leva o intro
render_blocks(blocks, "Telas e Campos")
build_anexos()

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
prs.save(OUT_PATH)
print("PPTX gerado:", OUT_PATH)
print("Slides:", len(prs.slides._sldIdLst))
