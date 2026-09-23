# -*- coding: utf-8 -*-
"""Gera HTML BPMN completo da Fase 1 — Cadastro da Organização."""
from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STEPS = json.loads((ROOT / "exports/_fase1_flow_dump.json").read_text(encoding="utf-8"))
OUT = ROOT / "exports/fase1-fluxo-bpmn-completo.html"

ROLE_CLASS = {
    "Analista MTI": "lane-mti",
    "Responsável parceiro": "lane-parceiro",
    "Sistema": "lane-sistema",
}

ROLE_COLOR = {
    "Analista MTI": "#003366",
    "Responsável parceiro": "#0b6e4f",
    "Sistema": "#5b6472",
}


def esc(s):
    return html.escape(str(s) if s is not None else "")


def node_shape(step):
    title = step.get("title") or ""
    key = (step.get("key") or "").lower()
    paths = step.get("paths") or []
    if step.get("type") == "html" and ("Fim" in title or title.startswith("Fim")):
        return "end"
    if step.get("type") == "html":
        return "doc"
    if len(paths) >= 2 or "gateway" in key or "?" in title or "decidir" in key or "há mais" in title.lower() or "está vencido" in title.lower():
        return "gateway"
    if step.get("role") == "Sistema" and ("Status" in title or "Gravar" in (step.get("key") or "") or "Notificar" in (step.get("key") or "") or "OCR" in (step.get("key") or "") or "Calcular" in (step.get("key") or "") or "Marcar" in (step.get("key") or "")):
        return "service"
    return "task"


def build_steps_html():
    blocks = []
    for i, s in enumerate(STEPS):
        if s.get("type") == "html" and s["id"] in ("step-f1-inicio", "step-f1-status"):
            continue
        role = s.get("role") or ("—" if s.get("type") == "html" else "—")
        shape = node_shape(s)
        paths = s.get("paths") or []
        rules = s.get("rules") or []
        lane = ROLE_CLASS.get(role, "lane-other")
        path_html = ""
        if paths:
            items = "".join(
                f'<li><span class="path-key">{esc(p.get("key"))}</span> → <code>{esc(p.get("value"))}</code></li>'
                for p in paths
            )
            path_html = f'<div class="meta-block"><strong>Caminhos</strong><ul>{items}</ul></div>'
        rules_html = ""
        if rules:
            items = "".join(f"<li>{esc(r)}</li>" for r in rules)
            rules_html = f'<div class="meta-block"><strong>Regras</strong><ul>{items}</ul></div>'
        form_html = f'<div class="meta-block"><strong>Formulário</strong> <code>{esc(s.get("form"))}</code></div>' if s.get("form") else ""
        blocks.append(
            f"""
<article class="step-card {lane}" id="{esc(s['id'])}" data-role="{esc(role)}" data-shape="{shape}">
  <header>
    <span class="shape-tag shape-{shape}">{shape}</span>
    <span class="role-tag">{esc(role)}</span>
    <h3>{esc(s.get('title'))}</h3>
  </header>
  <p class="desc">{esc(s.get('desc') or s.get('key') or '—')}</p>
  <div class="grid-meta">
    <div><span class="lbl">Atividade</span><div>{esc(s.get('key') or '—')}</div></div>
    <div><span class="lbl">Detalhe do perfil</span><div>{esc(s.get('roleDetail') or '—')}</div></div>
    <div><span class="lbl">Entradas</span><div>{esc(s.get('inputs') or '—')}</div></div>
    <div><span class="lbl">Saídas</span><div>{esc(s.get('outputs') or '—')}</div></div>
  </div>
  {path_html}{rules_html}{form_html}
</article>"""
        )
    return "\n".join(blocks)


def build_swimlane_svg():
    """Simplified horizontal swimlane overview (main path)."""
    # Main happy path nodes for visual overview
    lanes = [
        ("Analista MTI", [
            ("1", "Criar org"),
            ("2", "Dados mín."),
            ("3", "Etapas"),
            ("4", "Pré-cad. CPF"),
            ("5", "Disponibilizar"),
            ("13", "Fila MTI"),
            ("14", "Validar docs"),
            ("15", "Decidir"),
            ("16", "Aprovar"),
        ]),
        ("Sistema", [
            ("5a", "Em apresent."),
            ("6", "Notificar"),
            ("9a–g", "Vencimento"),
            ("12a", "Aguardando"),
            ("16a/17a/18a", "Status"),
        ]),
        ("Responsável parceiro", [
            ("7", "Login portal"),
            ("8", "Dados"),
            ("9", "Anexar docs"),
            ("10", "Tributos"),
            ("11", "Contato"),
            ("12", "Enviar"),
        ]),
    ]
    # Also show decision branches as note under MTI
    w, h = 1100, 420
    lane_h = 120
    parts = [
        f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="Raias BPMN Fase 1">'
        f'<rect width="{w}" height="{h}" fill="#f8fafc" rx="12"/>'
    ]
    colors = {"Analista MTI": "#003366", "Sistema": "#5b6472", "Responsável parceiro": "#0b6e4f"}
    for li, (lane, nodes) in enumerate(lanes):
        y = 20 + li * lane_h
        c = colors[lane]
        parts.append(f'<rect x="12" y="{y}" width="150" height="{lane_h-16}" fill="{c}" rx="8"/>')
        parts.append(
            f'<text x="87" y="{y + lane_h/2 - 8}" text-anchor="middle" fill="#fff" font-size="12" font-family="Segoe UI,Arial" font-weight="700">{esc(lane)}</text>'
        )
        x0 = 180
        gap = (w - 200) / max(len(nodes), 1)
        for ni, (num, label) in enumerate(nodes):
            x = x0 + ni * gap
            parts.append(
                f'<rect x="{x}" y="{y + 28}" width="96" height="52" rx="8" fill="#fff" stroke="{c}" stroke-width="2"/>'
            )
            parts.append(
                f'<text x="{x+48}" y="{y+48}" text-anchor="middle" font-size="10" font-family="Segoe UI,Arial" fill="{c}" font-weight="700">{esc(num)}</text>'
            )
            parts.append(
                f'<text x="{x+48}" y="{y+66}" text-anchor="middle" font-size="10" font-family="Segoe UI,Arial" fill="#1f2328">{esc(label)}</text>'
            )
            if ni < len(nodes) - 1:
                parts.append(
                    f'<line x1="{x+96}" y1="{y+54}" x2="{x+gap}" y2="{y+54}" stroke="{c}" stroke-width="1.5" marker-end="url(#arrow)"/>'
                )
    parts.append(
        '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">'
        '<path d="M0,0 L6,3 L0,6 Z" fill="#64748b"/></marker></defs>'
    )
    parts.append("</svg>")
    return "".join(parts)


def build_mermaid():
    lines = [
        "flowchart TB",
        "  classDef mti fill:#003366,color:#fff,stroke:#002244",
        "  classDef parc fill:#0b6e4f,color:#fff,stroke:#064e3b",
        "  classDef sys fill:#e2e8f0,color:#1f2328,stroke:#64748b",
        "  classDef gate fill:#fff7ed,color:#9a3412,stroke:#ea580c",
        "  classDef endn fill:#fef2f2,color:#991b1b,stroke:#dc2626",
        "  classDef ok fill:#ecfdf5,color:#065f46,stroke:#059669",
        "",
        "  Start([Início Fase 1]) --> Criar[1 Criar Organização raiz Parceiro]",
        "  Criar --> Dados[2 Dados mínimos]",
        "  Dados --> Etapas[3 Incluir etapas documentacionais]",
        "  Etapas -->|opcional| Cat[3a Catálogo Etapa]",
        "  Etapas --> Resp[4 Pré-cadastrar responsável CPF]",
        "  Cat --> Resp",
        "  Resp --> Disp[5 Disponibilizar]",
        "  Disp --> St1[5a Status Em apresentação]",
        "  St1 --> Not1[6 Notificar responsável]",
        "  Not1 --> Login[7 Login portal]",
        "  Login --> GAj{7a Há ajuste?}",
        "  GAj -->|Sim| Motivo[7b Ler motivo]",
        "  GAj -->|Não| Prep[8 Preencher dados]",
        "  Motivo --> Prep",
        "  Prep --> Anexar[9 Anexar documentos]",
        "  Anexar --> Modo{9a Modo vencimento}",
        "  Modo -->|Automático| OCR[9b OCR]",
        "  Modo -->|Calculado| Calc[9c Periodicidade]",
        "  Modo -->|Manual| Man[9d Data manual]",
        "  OCR -->|ok| Check{9e Vencido?}",
        "  OCR -->|falha| Man",
        "  Calc --> Check",
        "  Man --> Check",
        "  Check -->|Sim| Ven[9f Vencido]",
        "  Check -->|Não| Pend[9g Pendente]",
        "  Ven --> MaisDoc{9h Mais docs?}",
        "  Pend --> MaisDoc",
        "  MaisDoc -->|Sim| Anexar",
        "  MaisDoc -->|Não| Trib[10 Tributos]",
        "  Trib --> Cont[11 Contatos]",
        "  Cont --> Env[12 Enviar cadastro]",
        "  Env --> St2[12a Completa aguardando MTI]",
        "  St2 --> Fila[13 Fila análise MTI]",
        "  Fila --> Analisar[14 Validar documento]",
        "  Analisar -->|Aprovar doc| DocOk[14a Aprovado]",
        "  Analisar -->|Recusar doc| DocNo[14b Recusado]",
        "  DocOk --> MaisAn{14c Mais docs?}",
        "  DocNo --> MaisAn",
        "  MaisAn -->|Sim| Analisar",
        "  MaisAn -->|Não| Decidir{15 Decidir cadastro}",
        "  Decidir -->|Aprovar| Aprovar[16 Aprovar cadastro]",
        "  Decidir -->|Ajuste| Ajuste[17 Solicitar ajuste]",
        "  Decidir -->|Reprovar| Reprovar[18 Reprovar cadastro]",
        "  Aprovar --> StOk[16a Aprovada]",
        "  StOk --> FimOk([Fim aprovado · acesso comercial])",
        "  Ajuste --> StAj[17a Em apresentação]",
        "  StAj --> NotAj[17b Notificar ajuste]",
        "  NotAj --> Login",
        "  Reprovar --> StRep[18a Reprovada]",
        "  StRep --> FimNo([Fim reprovado])",
        "",
        "  class Criar,Dados,Etapas,Cat,Resp,Disp,Fila,Analisar,DocOk,DocNo,Aprovar,Ajuste,Reprovar mti",
        "  class Login,Motivo,Prep,Anexar,Man,Trib,Cont,Env parc",
        "  class St1,Not1,OCR,Calc,Ven,Pend,St2,StOk,StAj,NotAj,StRep sys",
        "  class GAj,Modo,Check,MaisDoc,MaisAn,Decidir gate",
        "  class FimOk ok",
        "  class FimNo endn",
    ]
    return "\n".join(lines)


HTML = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Atlas · Fase 1 — Fluxo BPMN completo</title>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";
  mermaid.initialize({{ startOnLoad: true, theme: "base", flowchart: {{ htmlLabels: true, curve: "basis" }},
    themeVariables: {{ fontFamily: "Segoe UI, Arial, sans-serif", fontSize: "13px" }} }});
</script>
<style>
  :root {{
    --mti: #003366;
    --mti-mid: #004a8d;
    --parc: #0b6e4f;
    --sys: #5b6472;
    --bg: #f1f5f9;
    --card: #ffffff;
    --text: #0f172a;
    --muted: #64748b;
    --line: #e2e8f0;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    font-family: "Segoe UI", Arial, sans-serif;
    color: var(--text);
    background: var(--bg);
    line-height: 1.5;
  }}
  .top {{
    background: linear-gradient(135deg, #003366, #005299);
    color: #fff;
    padding: 28px 32px 24px;
  }}
  .top h1 {{ margin: 0 0 8px; font-size: 26px; }}
  .top p {{ margin: 0; opacity: .92; max-width: 900px; }}
  .wrap {{ max-width: 1180px; margin: 0 auto; padding: 24px 20px 64px; }}
  nav.toc {{
    display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 24px;
  }}
  nav.toc a {{
    text-decoration: none; color: var(--mti);
    background: #fff; border: 1px solid var(--line);
    padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 600;
  }}
  section.block {{
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 20px 22px;
    margin-bottom: 20px;
  }}
  section.block h2 {{
    margin: 0 0 12px;
    font-size: 18px;
    color: var(--mti);
    border-left: 4px solid var(--mti-mid);
    padding-left: 10px;
  }}
  section.block h3 {{ margin: 18px 0 8px; font-size: 15px; color: #1e293b; }}
  table {{
    width: 100%; border-collapse: collapse; font-size: 13px;
  }}
  th, td {{
    border: 1px solid var(--line); padding: 8px 10px; text-align: left; vertical-align: top;
  }}
  th {{ background: #e8eef5; color: var(--mti); font-size: 12px; }}
  .legend {{
    display: flex; flex-wrap: wrap; gap: 10px; margin: 12px 0;
  }}
  .pill {{
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700;
  }}
  .pill i {{ width: 10px; height: 10px; border-radius: 50%; display: inline-block; }}
  .pill-mti {{ background: #e8eef5; color: var(--mti); }}
  .pill-mti i {{ background: var(--mti); }}
  .pill-parc {{ background: #e8f6ef; color: var(--parc); }}
  .pill-parc i {{ background: var(--parc); }}
  .pill-sys {{ background: #eef1f4; color: var(--sys); }}
  .pill-sys i {{ background: var(--sys); }}
  .pill-gate {{ background: #fff7ed; color: #9a3412; }}
  .pill-gate i {{ background: #ea580c; }}
  .mermaid {{
    background: #fff; border: 1px solid var(--line); border-radius: 10px;
    padding: 12px; overflow-x: auto;
  }}
  .filters {{ display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }}
  .filters button {{
    border: 1px solid var(--line); background: #fff; border-radius: 8px;
    padding: 6px 12px; cursor: pointer; font-weight: 600; font-size: 13px;
  }}
  .filters button.active {{ background: var(--mti); color: #fff; border-color: var(--mti); }}
  .step-card {{
    border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px;
    margin-bottom: 12px; background: #fff; border-left: 5px solid #94a3b8;
  }}
  .step-card.lane-mti {{ border-left-color: var(--mti); }}
  .step-card.lane-parceiro {{ border-left-color: var(--parc); }}
  .step-card.lane-sistema {{ border-left-color: var(--sys); }}
  .step-card header {{ display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 6px; }}
  .step-card h3 {{ margin: 0; flex: 1 1 220px; font-size: 15px; }}
  .role-tag, .shape-tag {{
    font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px;
  }}
  .role-tag {{ background: #f1f5f9; color: #334155; }}
  .shape-tag {{ text-transform: uppercase; letter-spacing: .04em; }}
  .shape-task {{ background: #dbeafe; color: #1e40af; }}
  .shape-gateway {{ background: #ffedd5; color: #9a3412; }}
  .shape-service {{ background: #e2e8f0; color: #334155; }}
  .shape-end {{ background: #fee2e2; color: #991b1b; }}
  .shape-doc {{ background: #f3e8ff; color: #6b21a8; }}
  .desc {{ margin: 0 0 10px; color: #334155; font-size: 13.5px; }}
  .grid-meta {{
    display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px 16px;
    font-size: 13px; margin-bottom: 8px;
  }}
  .lbl {{ display: block; font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase; }}
  .meta-block {{ margin-top: 8px; font-size: 13px; }}
  .meta-block ul {{ margin: 4px 0 0; padding-left: 18px; }}
  .path-key {{ font-weight: 700; color: var(--mti-mid); }}
  code {{ font-size: 12px; background: #f1f5f9; padding: 1px 5px; border-radius: 4px; }}
  .actions-grid {{
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;
  }}
  .action-box {{
    border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; background: #fafbfc;
  }}
  .action-box h4 {{ margin: 0 0 6px; color: var(--mti); font-size: 14px; }}
  .action-box ul {{ margin: 0; padding-left: 18px; font-size: 13px; }}
  .status-ok {{ color: #065f46; font-weight: 700; }}
  .status-bad {{ color: #991b1b; font-weight: 700; }}
  .status-wait {{ color: #9a6700; font-weight: 700; }}
  @media (max-width: 720px) {{
    .grid-meta {{ grid-template-columns: 1fr; }}
  }}
</style>
</head>
<body>
  <header class="top">
    <h1>Atlas · Fase 1 — Fluxo BPMN completo</h1>
    <p>
      Cadastro da Organização (parceiro) ponta a ponta: perfis, ações, status de habilitação,
      status de documento, catálogo documental, portal e decisões da MTI.
      Inclui raias BPMN, diagrama navegável e catálogo de atividades.
    </p>
  </header>

  <div class="wrap">
    <nav class="toc">
      <a href="#visao">Visão geral</a>
      <a href="#perfis">Perfis</a>
      <a href="#status">Status</a>
      <a href="#acoes">Ações / métodos</a>
      <a href="#raias">Raias</a>
      <a href="#bpmn">Diagrama BPMN</a>
      <a href="#catalogo">Catálogo de atividades</a>
      <a href="#classes">Classes envolvidas</a>
    </nav>

    <section class="block" id="visao">
      <h2>1. Visão geral</h2>
      <p>
        A Fase 1 estabelece o <strong>primeiro vínculo</strong> entre MTI e parceiro:
        a MTI cria a organização, configura etapas documentacionais e pré-cadastra o responsável;
        o parceiro completa e envia pelo portal; a MTI analisa documentos e decide o cadastro.
      </p>
      <ol>
        <li><strong>MTI (back-office):</strong> Criar → dados mínimos → etapas → pré-cadastro CPF → Disponibilizar.</li>
        <li><strong>Parceiro (portal):</strong> Login → dados → anexos (vencimento) → tributos → contato → Enviar.</li>
        <li><strong>MTI:</strong> Validar cada documento → Aprovar / Solicitar ajuste / Reprovar cadastro.</li>
      </ol>
      <div class="legend">
        <span class="pill pill-mti"><i></i> Analista MTI</span>
        <span class="pill pill-parc"><i></i> Responsável parceiro</span>
        <span class="pill pill-sys"><i></i> Sistema</span>
        <span class="pill pill-gate"><i></i> Gateway / decisão</span>
      </div>
    </section>

    <section class="block" id="perfis">
      <h2>2. Perfis (raiás / lanes)</h2>
      <table>
        <thead>
          <tr><th>Perfil</th><th>Onde age</th><th>Responsabilidades na Fase 1</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Analista MTI</strong></td>
            <td>Back-office · Organização / Pessoa / Catálogo</td>
            <td>Criar org, etapas, pré-cadastrar CPF, Disponibilizar, validar documentos, Aprovar / Solicitar ajuste / Reprovar, Exportar dossiê, Substituir unidade / Migrar cargos</td>
          </tr>
          <tr>
            <td><strong>Responsável parceiro</strong></td>
            <td>Portal (MT Login / Gov.br)</td>
            <td>Completar dados, anexar documentos, tributos, contato, enviar cadastro, atender ajuste (Meu painel)</td>
          </tr>
          <tr>
            <td><strong>Sistema</strong></td>
            <td>Regras / notificações / OCR</td>
            <td>Gravar status da habilitação, notificar, obter/calcular vencimento, marcar Pendente/Vencido, bloquear envio com doc vencido</td>
          </tr>
          <tr>
            <td><strong>Gestor de cadastro MTI</strong> (apoio)</td>
            <td>Catálogo e estrutura</td>
            <td>Manter Etapa documentacional, Grupo, Tipo de Documento, Cargo, Pessoa, Template, Notificação</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="block" id="status">
      <h2>3. Status</h2>
      <h3>3.1 Habilitação da Organização (parceiro)</h3>
      <table>
        <thead><tr><th>Status</th><th>Significado</th><th>Quem age</th></tr></thead>
        <tbody>
          <tr><td><span class="status-wait">Incompleta</span></td><td>Cadastro mínimo; portal não liberado</td><td>MTI</td></tr>
          <tr><td><span class="status-wait">Em apresentação</span></td><td>Parceiro preenchendo ou corrigindo após ajuste</td><td>Parceiro</td></tr>
          <tr><td><span class="status-wait">Completa – aguardando MTI</span></td><td>Enviado; fila de análise</td><td>MTI</td></tr>
          <tr><td><span class="status-ok">Aprovada pela MTI</span></td><td>Habilitação ok; acesso comercial liberado</td><td>—</td></tr>
          <tr><td><span class="status-bad">Reprovada pela MTI</span></td><td>Rejeição definitiva neste cadastro</td><td>—</td></tr>
        </tbody>
      </table>
      <h3>3.2 Status do documento (anexo)</h3>
      <table>
        <thead><tr><th>Status</th><th>Origem</th><th>Regra</th></tr></thead>
        <tbody>
          <tr><td>Pendente</td><td>Sistema</td><td>Anexo vigente; aguarda análise humana</td></tr>
          <tr><td>Vencido</td><td>Sistema</td><td>Data &lt; hoje; impede envio até reanexo</td></tr>
          <tr><td>Aprovado</td><td>MTI</td><td>Documento aceito</td></tr>
          <tr><td>Recusado</td><td>MTI</td><td>Documento rejeitado</td></tr>
        </tbody>
      </table>
      <p style="font-size:13px;color:#64748b">Não confundir status do <em>documento</em> com status da <em>organização</em>.</p>
    </section>

    <section class="block" id="acoes">
      <h2>4. Ações / métodos por classe</h2>
      <div class="actions-grid">
        <div class="action-box">
          <h4>Organização</h4>
          <ul>
            <li>Criar · Editar · Salvar</li>
            <li>Disponibilizar para parceiro finalizar</li>
            <li>Aprovar cadastro</li>
            <li>Solicitar ajuste</li>
            <li>Reprovar cadastro</li>
            <li>Exportar dossiê Doc. Cad. Parceria</li>
            <li>Substituir unidade · Migrar cargos</li>
          </ul>
        </div>
        <div class="action-box">
          <h4>Pessoa</h4>
          <ul>
            <li>Criar · Editar</li>
            <li>Pré-cadastrar acesso (CPF)</li>
          </ul>
        </div>
        <div class="action-box">
          <h4>Documento (UO)</h4>
          <ul>
            <li>Anexar arquivo</li>
            <li>Aprovar / Recusar (MTI)</li>
            <li>Recálculo Pendente / Vencido (sistema)</li>
          </ul>
        </div>
        <div class="action-box">
          <h4>Portal</h4>
          <ul>
            <li>Login (MT Login / Gov.br)</li>
            <li>Completar cadastro da org</li>
            <li>Enviar / Salvar → MTI</li>
            <li>Meu painel · Atender ajuste</li>
            <li>Meus dados</li>
          </ul>
        </div>
        <div class="action-box">
          <h4>Catálogo documental</h4>
          <ul>
            <li>Etapa documentacional (Nome, Ordem, Ativo, Grupos)</li>
            <li>Grupo de Documento</li>
            <li>Tipo de Documento (modo vencimento, obrigatoriedade)</li>
          </ul>
        </div>
        <div class="action-box">
          <h4>Template / Notificação</h4>
          <ul>
            <li>Publicar versão · Pré-visualizar</li>
            <li>Regras de notificação (liberação, ajuste, aprovação, vencimento, responsável)</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="block" id="raias">
      <h2>5. Raias BPMN (visão resumida)</h2>
      {build_swimlane_svg()}
      <p style="font-size:13px;color:#64748b;margin:10px 0 0">
        Loops e gateways detalhados estão no diagrama Mermaid abaixo (ajuste, vencimento, análise documental).
      </p>
    </section>

    <section class="block" id="bpmn">
      <h2>6. Diagrama BPMN completo (navegável)</h2>
      <div class="mermaid">
{build_mermaid()}
      </div>
    </section>

    <section class="block" id="catalogo">
      <h2>7. Catálogo completo de atividades</h2>
      <div class="filters" id="filters">
        <button type="button" class="active" data-filter="all">Todos</button>
        <button type="button" data-filter="Analista MTI">Analista MTI</button>
        <button type="button" data-filter="Responsável parceiro">Parceiro</button>
        <button type="button" data-filter="Sistema">Sistema</button>
      </div>
      <div id="steps">
{build_steps_html()}
      </div>
    </section>

    <section class="block" id="classes">
      <h2>8. Classes e objetos da Fase 1</h2>
      <table>
        <thead><tr><th>Classe</th><th>Papel no fluxo</th></tr></thead>
        <tbody>
          <tr><td>Organização</td><td>Objeto central do onboarding; status de habilitação; métodos de decisão</td></tr>
          <tr><td>Etapa documentacional (catálogo)</td><td>Fonte da composição Etapa → Grupo → Tipo</td></tr>
          <tr><td>Etapa do Cadastro Organizacional (UO)</td><td>Instância da etapa na org (<code>etapasIncluidas</code>)</td></tr>
          <tr><td>Grupo / Tipo de Documento</td><td>Catálogo MIPP; modo de vencimento</td></tr>
          <tr><td>Documento habilitação</td><td>Anexo + vencimento + status Pendente/Vencido/Aprovado/Recusado</td></tr>
          <tr><td>Habilitação Documental</td><td>status, NDA, acesso comercial, docs de execução</td></tr>
          <tr><td>Pessoa</td><td>Responsável; pré-cadastro CPF</td></tr>
          <tr><td>Cargo</td><td>Permissões e ocupantes (estrutura MTI / vínculos)</td></tr>
          <tr><td>Contato / Tributo</td><td>Preenchidos pelo parceiro no portal</td></tr>
          <tr><td>Notificação</td><td>Liberação, ajuste, decisão, vencimento, troca de responsável</td></tr>
          <tr><td>Template documental</td><td>Modelos homologados (base documental da plataforma)</td></tr>
        </tbody>
      </table>
      <h3>Critério de conclusão da Fase 1 (onboarding)</h3>
      <p>
        Organização parceiro com etapas, responsável pré-cadastrado, cadastro enviado,
        documentos obrigatórios <strong>Aprovados</strong> e método <strong>Aprovar cadastro</strong>
        executado → status <span class="status-ok">Aprovada pela MTI</span> e acesso comercial liberado.
      </p>
    </section>
  </div>

  <script>
    const buttons = document.querySelectorAll('#filters button');
    const cards = document.querySelectorAll('.step-card');
    buttons.forEach(btn => {{
      btn.addEventListener('click', () => {{
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        cards.forEach(c => {{
          const show = f === 'all' || c.dataset.role === f;
          c.style.display = show ? '' : 'none';
        }});
      }});
    }});
  </script>
</body>
</html>
"""

OUT.write_text(HTML, encoding="utf-8")
print(OUT)


if __name__ == "__main__":
    pass
