# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANVAS = Path(
    r"C:\Users\LucasSantos\.cursor\projects\c-Users-LucasSantos-OneDrive-EloGroup-rea-de-Trabalho-Cursor-Especificador-Sydle\canvases\diagrama-classes-fase2-catalogo.canvas.tsx"
)
OUT = ROOT / "exports" / "diagrama-classes-fase2.html"

text = CANVAS.read_text(encoding="utf-8")
m = re.search(r"const COLUNAS: Coluna\[\] = (\[.*?\]);\n\nconst GRUPOS", text, re.S)
if not m:
    raise SystemExit("Não achei COLUNAS no canvas")
payload = m.group(1)

html = r"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Classes e campos — Fase 2 · Catálogo &amp; Produtos</title>
  <style>
    :root {
      --ink: #1f2328;
      --muted: #5b6578;
      --line: #c9ced6;
      --fill: #eef0f3;
      --paper: #ffffff;
      --board: #f4f5f7;
      --accent: #2f6fed;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      background: #fff;
      color: var(--ink);
      font: 13px/1.4 "Segoe UI", system-ui, sans-serif;
    }
    .page { padding: 20px 24px 40px; max-width: 100%; }
    h1 { font-size: 20px; font-weight: 650; margin: 0 0 8px; }
    .hint { color: var(--muted); margin: 0 0 14px; }
    .pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .pill {
      border: 1px solid var(--line);
      background: #fff;
      border-radius: 999px;
      padding: 6px 12px;
      cursor: pointer;
      color: var(--ink);
    }
    .pill.active { background: var(--fill); }
    .legado { display: flex; align-items: center; gap: 8px; margin: 0 0 14px; color: var(--ink); }
    .board {
      position: relative;
      overflow: auto;
      min-height: 420px;
      max-height: calc(100vh - 220px);
      padding: 28px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background-color: var(--board);
      background-image: radial-gradient(#c5c9d1 1.1px, transparent 1.1px);
      background-size: 16px 16px;
    }
    .cols {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 40px;
      min-width: max-content;
    }
    .col { display: flex; flex-direction: column; align-items: flex-start; flex-shrink: 0; }
    .box {
      width: 200px;
      min-height: 44px;
      padding: 8px 12px;
      border: 1px solid #5c6370;
      border-radius: 8px;
      background: var(--paper);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 13px;
      color: var(--ink);
      cursor: pointer;
    }
    .box.head { background: var(--fill); cursor: default; font-weight: 650; }
    .box.opcao { background: var(--fill); cursor: default; font-weight: 650; }
    .box.on { background: var(--fill); border-color: var(--accent); font-weight: 650; }
    .down {
      height: 16px;
      width: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fork { display: flex; align-items: flex-start; }
    .ramos { display: flex; flex-direction: column; gap: 12px; }
    .rama { display: flex; align-items: flex-start; gap: 8px; }
    .se {
      width: 92px;
      min-height: 44px;
      display: flex;
      align-items: center;
      color: var(--muted);
      font-size: 12px;
      flex-shrink: 0;
    }
    .stack { display: flex; flex-direction: column; gap: 8px; }
    .detail {
      margin-top: 16px;
      max-width: 820px;
    }
    .detail h2 { font-size: 14px; margin: 0 0 8px; }
    .detail p { margin: 0 0 6px; color: var(--ink); }
    .status {
      display: inline-block;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 11px;
      background: var(--fill);
      margin-left: 8px;
    }
    .status.ok { background: #e4f4ea; }
    .status.warn { background: #f8eed6; }
    .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 12px; }
    #btnLimpo {
      border: 1px solid var(--line);
      background: #fff;
      border-radius: 8px;
      padding: 6px 12px;
      cursor: pointer;
      color: var(--ink);
    }
    body.limpo .chrome { display: none; }
    body.limpo .detail { display: none; }
    body.limpo .page { padding: 12px; }
    body.limpo .board {
      max-height: none;
      min-height: calc(100vh - 56px);
      border: none;
    }
    body.limpo .cols { justify-content: center; width: 100%; }
    body.limpo .box.on {
      background: var(--paper);
      border-color: #5c6370;
      font-weight: normal;
    }
    body.limpo .toolbar { margin: 0; position: absolute; top: 10px; right: 12px; z-index: 3; }
    body.limpo .page { position: relative; }
  </style>
</head>
<body>
  <div class="page">
    <div class="chrome">
      <h1>Classes e campos — Fase 2 · Catálogo &amp; Produtos</h1>
      <p class="hint">Coluna da classe à esquerda. Se marcar ou informar um campo faz outros aparecerem, esses campos ficam à direita.</p>
    </div>
    <div class="toolbar">
      <div class="pills chrome" id="pills"></div>
      <button type="button" id="btnLimpo">Ocultar informações</button>
    </div>
    <label class="legado chrome"><input type="checkbox" id="legado" /> Mostrar campos legado (Descrição, Recorrência, etc.)</label>
    <div class="board" id="board"></div>
    <div class="detail" id="detail"></div>
  </div>
  <script>
    const COLUNAS = __PAYLOAD__;
    const GRUPOS = [
      { id: "aux", label: "1. Cadastros auxiliares", classes: ["Métrica", "Tipo de Cobrança", "Categoria de Serviços", "Grupo", "Modelo de Venda"] },
      { id: "ctx", label: "2. Parceria e solução", classes: ["Parceria", "Solução"] },
      { id: "cat", label: "3. Catálogo", classes: ["Catálogo", "Métrica do catálogo", "Complexidade do catálogo", "Catálogo Universal"] },
      { id: "prod", label: "4. Produto", classes: ["Produto", "Dados de Parceria por Produto"] },
      { id: "analise", label: "5. Análise MTI", classes: ["Análise de catálogo / produto (MTI)"] }
    ];
    const BOX_H = 44, FORK_W = 52;
    let grupo = "ctx";
    let legado = false;
    let sel = "Solução|Nome";

    const $ = (id) => document.getElementById(id);
    function esc(s) {
      return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }
    function vis(list) {
      return legado ? list : list.filter((f) => f.status !== "Legado");
    }
    function isOn(classe, campo) {
      return sel === classe + "|" + campo;
    }
    function box(classe, f, extra) {
      const on = isOn(classe, f.campo) ? " on" : "";
      return `<button type="button" class="box${on} ${extra || ""}" data-sel="${esc(classe + "|" + f.campo)}">${esc(f.campo)}${f.obrg === "Sim" ? " *" : ""}</button>`;
    }
    function arrowDown() {
      return `<div class="down"><svg width="10" height="12"><path d="M5 1 v7 M2 5.5 L5 9 L8 5.5" fill="none" stroke="#8a93a3" stroke-width="1.3"/></svg></div>`;
    }
    function forkSvg(centers) {
      const startY = BOX_H / 2, neck = 22;
      const h = Math.max(startY + 8, ...centers.map((y) => y + 10));
      const d = [`M 0 ${startY} H ${neck}`].concat(centers.map((y) => `M ${neck} ${startY} V ${y} H ${FORK_W}`)).join(" ");
      const heads = centers.map((y) => `<path d="M ${FORK_W - 7} ${y - 3.5} L ${FORK_W} ${y} L ${FORK_W - 7} ${y + 3.5}" fill="none" stroke="#5c6370" stroke-width="1.6"/>`).join("");
      return `<svg width="${FORK_W}" height="${h}" style="flex-shrink:0;overflow:visible"><path d="${d}" fill="none" stroke="#5c6370" stroke-width="1.6"/>${heads}</svg>`;
    }
    function miniArrow() {
      return `<svg width="36" height="${BOX_H}" style="flex-shrink:0"><path d="M 0 ${BOX_H / 2} H 36" fill="none" stroke="#5c6370" stroke-width="1.6"/><path d="M 29 ${BOX_H / 2 - 3.5} L 36 ${BOX_H / 2} L 29 ${BOX_H / 2 + 3.5}" fill="none" stroke="#5c6370" stroke-width="1.6"/></svg>`;
    }
    function ramaAltura(rama) {
      const campos = vis(rama.campos || []);
      const n = Math.max(1, campos.length);
      const stack = n * BOX_H + Math.max(0, n - 1) * 8;
      return Math.max(BOX_H, stack);
    }
    function ramaRow(classe, rama) {
      const campos = vis(rama.campos || []);
      if (rama.tipo === "opcao") {
        const extra = campos.length
          ? miniArrow() + `<div class="stack">${campos.map((f) => box(classe, f)).join("")}</div>`
          : "";
        return `<div class="rama"><div class="box opcao">${esc(rama.condicao)}</div>${extra}</div>`;
      }
      return `<div class="rama"><div class="se">se ${esc(rama.condicao)}</div><div class="stack">${campos.map((f) => box(classe, f)).join("")}</div></div>`;
    }
    function fieldFork(classe, trigger, ramos) {
      let y = BOX_H / 2;
      const centers = [];
      ramos.forEach((rama, i) => {
        if (i === 0) {
          centers.push(BOX_H / 2);
          y = ramaAltura(rama);
        } else {
          y += 12;
          centers.push(y + BOX_H / 2);
          y += ramaAltura(rama);
        }
      });
      return `<div class="fork">${box(classe, trigger)}${forkSvg(centers)}<div class="ramos">${ramos.map((r) => ramaRow(classe, r)).join("")}</div></div>`;
    }
    function allFields(col) {
      const laterais = Object.values(col.ramos || {}).flatMap((rs) => rs.flatMap((r) => r.campos || []));
      return [...col.campos, ...laterais].map((f) => ({ ...f, classe: col.classe }));
    }
    function render() {
      $("pills").innerHTML = GRUPOS.map(
        (g) => `<button type="button" class="pill${g.id === grupo ? " active" : ""}" data-grupo="${g.id}">${esc(g.label)}</button>`
      ).join("");
      const g = GRUPOS.find((x) => x.id === grupo) || GRUPOS[0];
      const visiveis = COLUNAS.filter((c) => g.classes.includes(c.classe));
      $("board").innerHTML = `<div class="cols">${visiveis
        .map((col) => {
          const campos = vis(col.campos);
          const body = campos
            .map((f) => {
              const ramos = (col.ramos || {})[f.campo] || [];
              const inner = ramos.length ? fieldFork(col.classe, f, ramos) : box(col.classe, f);
              return `<div>${arrowDown()}${inner}</div>`;
            })
            .join("");
          return `<div class="col"><div class="box head">${esc(col.classe)}</div>${body}</div>`;
        })
        .join("")}</div>`;

      const selected = visiveis.flatMap(allFields).find((f) => f.classe + "|" + f.campo === sel);
      if (!selected) {
        $("detail").innerHTML = "";
        return;
      }
      const tone = selected.status === "Confirmado" ? "ok" : selected.status === "Aberto na fonte" ? "warn" : "";
      $("detail").innerHTML = `
        <h2>${esc(selected.classe)} · ${esc(selected.campo)} <span class="status ${tone}">${esc(selected.status)}</span></h2>
        <p><b>Para que serve:</b> ${esc(selected.para)}</p>
        <p><b>De onde vem:</b> ${esc(selected.origem)}</p>
        <p><b>Quando aparece:</b> ${esc(selected.vis)}</p>
        ${selected.controla ? `<p><b>Ao informar este campo:</b> ${esc(selected.controla)}</p>` : ""}
        <p><b>Regra:</b> ${esc(selected.regra)}${selected.ro === "Sim" ? " Somente leitura." : ""}</p>
      `;
    }
    document.addEventListener("click", (e) => {
      const pill = e.target.closest("[data-grupo]");
      if (pill) {
        grupo = pill.getAttribute("data-grupo");
        const g = GRUPOS.find((x) => x.id === grupo);
        const col = COLUNAS.find((c) => g.classes.includes(c.classe));
        const first = col && vis(col.campos)[0];
        if (first) sel = col.classe + "|" + first.campo;
        render();
        return;
      }
      const btn = e.target.closest("[data-sel]");
      if (btn) {
        sel = btn.getAttribute("data-sel");
        render();
      }
    });
    $("legado").addEventListener("change", (e) => {
      legado = e.target.checked;
      render();
    });
    $("btnLimpo").addEventListener("click", () => {
      const on = document.body.classList.toggle("limpo");
      $("btnLimpo").textContent = on ? "Mostrar informações" : "Ocultar informações";
    });
    render();
  </script>
</body>
</html>
"""

OUT.write_text(html.replace("__PAYLOAD__", payload), encoding="utf-8")
print("wrote", OUT, OUT.stat().st_size)
