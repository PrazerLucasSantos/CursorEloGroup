# -*- coding: utf-8 -*-
"""Gera o markdown de prompts do Documentador a partir do dump do Fase 2.pptx."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "exports" / "_pptx_fase2_hoje.json"
OUT = ROOT / "src" / "documentador" / "prompts-fase2.md"

RE_RFN = re.compile(
    r"((?:RF|RN)-[A-Z0-9]+(?:[.-][A-Z0-9]+)*)\s*(?:—+|:\s*|\s+-\s+)",
    re.I,
)


def limpar(t: str) -> str:
    return (
        t.replace("\u000b", " ")
        .replace("\u00a0", " ")
        .replace("\r", "")
        .replace("\t", " ")
        .strip()
    )


def split_codigos(texto: str) -> tuple[list[tuple[str, str]], list[tuple[str, str]]]:
    texto = limpar(texto)
    texto = re.sub(r"^Requisitos\s+funcionais\s*", "", texto, flags=re.I)
    texto = re.sub(r"^Requisitos\s+Funcionais\s*", "", texto, flags=re.I)
    texto = re.sub(r"\s*Regras\s+de\s+neg[oó]cio[s]?\s*", " ", texto, flags=re.I)
    texto = re.sub(r"\s*Regras\s+de\s+Neg[oó]cios\s*", " ", texto, flags=re.I)
    texto = re.sub(r"\s+Regras\s+", " ", texto)
    parts = list(RE_RFN.finditer(texto))
    rfs, rns = [], []
    if not parts:
        return rfs, rns
    for i, m in enumerate(parts):
        fim = parts[i + 1].start() if i + 1 < len(parts) else len(texto)
        corpo = limpar(texto[m.end() : fim])
        codigo = m.group(1).upper().replace(" ", "")
        if codigo.startswith("RN"):
            rns.append((codigo, corpo))
        else:
            rfs.append((codigo, corpo))
    return rfs, rns


def tabela_para_linhas(rows: list[list[str]]) -> list[str]:
    if rows and len(rows[0]) >= 2 and limpar(rows[0][0]) == limpar(rows[0][-1]):
        rows = [r[:-1] if len(r) == len(rows[0]) else r for r in rows]
    out = []
    seen = set()
    for row in rows:
        cells = [limpar(c).replace("|", "/") for c in row]
        line = " | ".join(cells)
        if not line.strip(" |"):
            continue
        if line in seen:
            continue
        seen.add(line)
        out.append(line)
    return out


def kv_da_tabela(rows: list[list[str]]) -> dict[str, str]:
    d = {}
    for row in rows:
        if len(row) >= 2:
            k = limpar(row[0])
            v = limpar(" ".join(row[1:]))
            if k:
                d[k] = v
    return d


def eh_campos(rows: list[list[str]]) -> bool:
    if not rows:
        return False
    first = limpar(rows[0][0]).lower()
    return first in {"campo", "seção", "secao", "nome do campo"}


def main() -> int:
    slides = json.loads(SRC.read_text(encoding="utf-8"))
    blocos: list[str] = []
    indice: list[str] = []

    i = 0
    n = len(slides)
    classe_n = 0
    while i < n:
        s = slides[i]
        num = s["slide"]
        items = s["items"]
        titulo = ""
        for it in items:
            if it.get("text") and not titulo:
                titulo = limpar(it["text"]).split("\n")[0]
        titulo = titulo or f"Slide {num}"

        tabelas = [it["table"] for it in items if "table" in it]
        textos = [limpar(it["text"]) for it in items if it.get("text")]

        # Agrupa continuação da mesma classe (Catálogo / Produto)
        j = i + 1
        extra_tabs: list[list[list[str]]] = []
        extra_textos: list[str] = []
        while j < n:
            nxt_items = slides[j]["items"]
            nxt_title = ""
            for it in nxt_items:
                if it.get("text") and not nxt_title:
                    nxt_title = limpar(it["text"]).split("\n")[0]
            mesmo = nxt_title == titulo or (
                titulo.startswith("Classe")
                and nxt_title.lower().startswith(titulo.lower().replace("classe – ", "").replace("classe - ", "")[:12])
                and "campos" in nxt_title.lower()
            ) or (
                "catálogo da parceira" in titulo.lower()
                and ("catálogo da parceira" in nxt_title.lower() or "catálogo da parceria" in nxt_title.lower())
            ) or (
                titulo.lower().endswith("produto")
                and "produto" in nxt_title.lower()
                and ("classe" in nxt_title.lower() or "campos" in nxt_title.lower())
            ) or (
                "catálogo universal" in titulo.lower()
                and "catálogo universal" in nxt_title.lower()
            )
            if not mesmo:
                break
            extra_tabs.extend(it["table"] for it in nxt_items if "table" in it)
            extra_textos.extend(limpar(it["text"]) for it in nxt_items if it.get("text"))
            j += 1

        slides_span = list(range(num, slides[j - 1]["slide"] + 1)) if j > i else [num]
        todas_tabs = tabelas + extra_tabs

        kv: dict[str, str] = {}
        req_partes: list[str] = []
        campos_rows: list[list[str]] | None = None
        extra_tabelas: list[tuple[str, list[list[str]]]] = []
        for tab in todas_tabs:
            if not tab:
                continue
            if eh_campos(tab):
                if campos_rows is None:
                    campos_rows = tab
                else:
                    extra_tabelas.append(("campos", tab))
                continue
            h0 = limpar(tab[0][0]).lower() if tab[0] else ""
            h1 = limpar(tab[0][1]).lower() if len(tab[0]) > 1 else ""
            if h0 in {"id", "tipo"} or h1 in {"requisito", "contrato"}:
                nome_tab = next((t for t in textos if "requisito" in t.lower() or "exemplo" in t.lower()), "Tabela")
                extra_tabelas.append((nome_tab, tab))
                continue
            if all(len(r) >= 2 for r in tab) and max(len(r) for r in tab) <= 3:
                merged = kv_da_tabela(tab)
                if "Requisitos e Regras" in merged:
                    req_partes.append(merged.pop("Requisitos e Regras"))
                for k, v in merged.items():
                    if k == "Necessidade" and kv.get("Necessidade"):
                        continue
                    if k == "Como é usado / contexto" and kv.get("Como é usado / contexto"):
                        continue
                    kv[k] = v
            else:
                extra_tabelas.append(("Tabela", tab))

        nome_classe = titulo
        nome_classe = re.sub(r"^Classe\s*[–\-]\s*", "", nome_classe, flags=re.I)
        nome_classe = re.sub(r"\s*-\s*campos$", "", nome_classe, flags=re.I)
        nome_classe = re.sub(r"\s*–\s*campos$", "", nome_classe, flags=re.I)
        nome_classe = nome_classe.replace(" / objetos", "")

        necessidade = kv.get("Necessidade", "")
        contexto = kv.get("Como é usado / contexto", "") or kv.get("Como é usado /contexto", "")
        req = " ".join(req_partes) or kv.get("Requisitos e Regras", "")

        rfs, rns = split_codigos(req)

        # Blocos extras de tipo (Contrata, Consome...)
        rotulos_livres = []
        for k, v in kv.items():
            if k in {"Necessidade", "Como é usado / contexto", "Requisitos e Regras"}:
                continue
            rotulos_livres.append((k, v))

        classe_n += 1
        span = f"slides {slides_span[0]}" if len(slides_span) == 1 else f"slides {slides_span[0]}–{slides_span[-1]}"
        indice.append(f"| {classe_n} | {nome_classe} | {span} |")

        prompt = [f"classe {classe_n}: {nome_classe}"]
        if necessidade:
            prompt.append(f"necessidade: {necessidade}")
        if contexto:
            bullets = [p.strip() for p in re.split(r"(?<=[.;])\s+(?=[A-ZÁÉÍÓÚÀÂÊÔÃÕ])", contexto) if p.strip()]
            if len(bullets) <= 1:
                bullets = [contexto]
            prompt.append("como é usado / contexto:")
            for b in bullets:
                prompt.append(f"- {b}")
        if rfs:
            prompt.append("requisitos:")
            for c, t in rfs:
                prompt.append(f"{c}: {t}")
        if rns:
            prompt.append("regras:")
            for c, t in rns:
                prompt.append(f"{c}: {t}")
        if not rfs and not rns and req:
            prompt.append("requisitos e regras:")
            prompt.append(req)
        for k, v in rotulos_livres:
            prompt.append(f"bloco: {k}")
            prompt.append(v)
        if campos_rows:
            prompt.append("campos:")
            prompt.extend(tabela_para_linhas(campos_rows))
        for nome_tab, tab in extra_tabelas:
            rotulo = nome_tab
            if rotulo in {"Tabela", "campos"}:
                rotulo = f"{nome_classe} – campos"
            prompt.append(f"seção tabela: {rotulo}")
            prompt.extend(tabela_para_linhas(tab))

        # BPMN / fluxo sem tabela de requisitos
        if not kv and not campos_rows and not extra_tabelas and not rotulos_livres:
            prompt = [f"classe {classe_n}: {nome_classe}"]
            corpo = [t for t in textos if t and t != titulo]
            if corpo:
                prompt.append("necessidade: Documentar o fluxo e as regras operacionais correspondentes a este slide.")
                prompt.append("como é usado / contexto:")
                for t in corpo[:8]:
                    for linha in t.split("\n"):
                        linha = limpar(linha)
                        if linha:
                            prompt.append(f"- {linha}")
            extra_linhas = []
            for t in textos:
                if t == titulo:
                    continue
                extra_linhas.extend(limpar(x) for x in t.split("\n") if limpar(x))
            if extra_linhas and "como é usado" not in "\n".join(prompt):
                prompt.append("bloco lista: Passos e raias")
                for linha in extra_linhas:
                    prompt.append(f"- {linha}")

        blocos.append(f"## {classe_n}. {nome_classe}\n\nOrigem: {span} do `Fase 2.pptx`.\n\n```text\n" + "\n".join(prompt) + "\n```\n")
        i = j

    unico = ["título: Requisitos — Atlas Fase 2", ""]
    for b in blocos:
        m = re.search(r"```text\n(.*)\n```", b, re.S)
        if m:
            unico.append(m.group(1))
            unico.append("")

    md = []
    md.append("# Prompts — replicar *Fase 2.pptx* no Documentador")
    md.append("")
    md.append("Fonte: `c:\\Users\\LucasSantos\\EloGroup\\MTI - 1. Projeto Atlas\\Requisitos\\Fase 2.pptx` (31 slides, 19/08/2026).")
    md.append("")
    md.append("## Como usar")
    md.append("")
    md.append("1. Abra [http://localhost:5199/documentador.html](http://localhost:5199/documentador.html).")
    md.append("2. Clique em **Novo** para começar em branco.")
    md.append("3. Cole **um bloco** ` ```text ` por vez no Prompt e clique em **Aplicar ao projeto**.")
    md.append("4. Ou cole o [prompt único](#prompt-único-todas-as-classes) de uma vez.")
    md.append("5. Arraste os blocos se quiser reordenar. **Salvar PPTX** exporta no layout de classe.")
    md.append("")
    md.append("Diagramas BPMN (slides 22–26 e 31) viram listas: o Documentador replica o conteúdo textual, não o desenho das raias.")
    md.append("")
    md.append("## Índice")
    md.append("")
    md.append("| # | Classe / slide | Origem |")
    md.append("|---|---|---|")
    md.extend(indice)
    md.append("")
    md.append("---")
    md.append("")
    md.extend(blocos)
    md.append("---")
    md.append("")
    md.append("## Prompt único (todas as classes)")
    md.append("")
    md.append("Cole tudo de uma vez no Prompt e aplique. Cada `classe N:` cria/seleciona a aba correspondente.")
    md.append("")
    md.append("```text")
    md.append("\n".join(unico).strip())
    md.append("```")
    md.append("")

    OUT.write_text("\n".join(md), encoding="utf-8")
    print(f"Wrote {OUT} classes={classe_n} bytes={OUT.stat().st_size}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
