# -*- coding: utf-8 -*-
"""Gera documentação de requisitos Catálogo & Produtos (linguagem de negócio)."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from doc_catalogo_classes_portais import append_portal_and_class_requirements

OUT = ROOT / "exports" / "documentacao-requisitos-catalogo-produtos.html"
NAVY = "#181fdb"


def esc(s: object) -> str:
    return (
        str(s or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


FLOW = [
    (1, "Listas básicas", "MTI"),
    (2, "Parceria e solução", "MTI"),
    (3, "Montar catálogo", "Parceiro"),
    (4, "Incluir produtos", "Parceiro"),
    (5, "Definir markup", "Ambos"),
    (6, "Catálogo universal", "MTI"),
    (7, "Revisar e enviar", "Parceiro"),
    (8, "Analisar e decidir", "MTI"),
    (9, "Publicar", "MTI"),
    (10, "Apostilar → cliente vê", "MTI/Cliente"),
]


def flow_strip(active: list[int], note: str = "", title: str = "Mapa do fluxo") -> str:
    cells = []
    for n, label, who in FLOW:
        on = " is-on" if n in active else ""
        cells.append(
            f'<div class="flow-step{on}" title="{esc(who)}">'
            f'<span class="flow-step__n">{n}</span>'
            f'<span class="flow-step__l">{esc(label)}</span>'
            f'<span class="flow-step__who">{esc(who)}</span></div>'
        )
    row = '<span class="flow-gap">→</span>'.join(cells)
    note_h = f'<p class="flow-map__note">{note}</p>' if note else ""
    return (
        '<div class="flow-map">'
        f'<div class="flow-map__title">{esc(title)}</div>'
        f'<div class="flow-map__row">{row}</div>{note_h}</div>'
    )


def tbl(title: str, headers: list[str], rows: list[list[str]]) -> str:
    th = "".join(f"<th>{esc(h)}</th>" for h in headers)
    body = []
    for r in rows:
        body.append("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>")
    return (
        f'<div class="tbl"><div class="tbl__bar">{esc(title)}</div>'
        f"<table><thead><tr>{th}</tr></thead><tbody>{''.join(body)}</tbody></table></div>"
    )


def story(
    sid: str,
    group: str,
    kind: str,
    title: str,
    historia: str,
    o_que: str,
    contexto: str,
    simples: str,
    deve: list[str],
    regras: list[str],
    flow: list[int] | None = None,  # legado: não renderizado
    flow_note: str = "",  # legado: não renderizado
    table: tuple[str, list[str], list[list[str]]] | None = None,
    extra: str = "",
) -> str:
    kind_lab = {
        "cadastro": ("Cadastro", "cadastro"),
        "tela": ("Tela", "tela"),
        "acao": ("Ação", "metodo"),
        "regra": ("Regra", "regra"),
        "fluxo": ("Fluxo", "fluxo"),
        "conceito": ("Conceito", "conceito"),
        "portal": ("Portal", "tela"),
        "backoffice": ("Backoffice", "metodo"),
    }[kind]
    deve_ul = "".join(f"<li>{x}</li>" for x in deve)
    regras_ul = "".join(f"<li>{x}</li>" for x in regras)
    table_h = tbl(*table) if table else ""
    return f"""
<section class="slide" id="{sid}" data-group="{group}" data-kind="{kind_lab[1]}">
  <header class="slide__top">
    <div>
      <div class="kind-row">
        <span class="badge badge--{kind_lab[1]}">{kind_lab[0]}</span>
        <span class="group-pill">{esc(group_title(group))}</span>
      </div>
      <h1 class="slide__title">{esc(title)}</h1>
    </div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <div class="story">
    <div class="story__row"><div class="story__lab">Necessidade</div><div class="story__val">{esc(historia)}</div></div>
    <div class="story__row"><div class="story__lab">O que é</div><div class="story__val">{o_que}</div></div>
    <div class="story__row"><div class="story__lab">Contexto</div><div class="story__val">{esc(contexto)}</div></div>
    <div class="story__row"><div class="story__lab">Em palavras simples</div><div class="story__val explain-txt">{simples}</div></div>
    <div class="story__row story__row--grow"><div class="story__lab">O sistema deve</div>
      <div class="story__val">
        <div class="story__sub">Requisitos</div><ul>{deve_ul}</ul>
        <div class="story__sub">Regras de negócio</div><ul>{regras_ul}</ul>
      </div>
    </div>
  </div>
  {table_h}
  {extra}
</section>"""


def group_title(g: str) -> str:
    return {
        "guia": "Guia",
        "fluxo": "Fluxo completo",
        "backoffice": "Backoffice MTI",
        "parceiro": "Portal do Parceiro",
        "cliente": "Portal do Cliente",
        "cadastros": "Cadastros",
        "regras": "Regras e glossário",
    }.get(g, g)


GROUPS = [
    ("guia", "Guia e visão geral", "Para que serve · Tipos · Papéis"),
    ("fluxo", "Fluxo completo", "Passo a passo · Status · Ajuste"),
    ("backoffice", "Backoffice MTI", "Cadastro · Análise · Publicação"),
    ("parceiro", "Portal do Parceiro", "Rascunho · CSV · Envio · Ajuste"),
    ("cliente", "Portal do Cliente", "Consulta · Cotação · Orçamento · OS"),
    ("cadastros", "Cadastros detalhados", "Requisitos, campos e regras de cada classe"),
    ("regras", "Regras gerais e glossário", "Resumo · termos do dia a dia"),
]


def css() -> str:
    return f"""
:root{{--navy:{NAVY};--ink:#111;--muted:#555;--line:#d8d8d8;--th:#efefef;--parc:#2563eb;--cli:#7c3aed;--page-w:1280px}}
*{{box-sizing:border-box}}html{{scroll-behavior:smooth}}
body{{margin:0;background:#c8cdd6;color:var(--ink);font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.4}}
.toolbar{{position:sticky;top:0;z-index:50;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 16px;background:#111;color:#fff;font-size:12px}}
.toolbar button{{color:#fff;background:#333;border:1px solid #555;border-radius:4px;padding:6px 10px;font:inherit;cursor:pointer}}
.toolbar .primary{{background:var(--navy);border-color:var(--navy)}}
.deck{{padding:18px 12px 48px;display:flex;flex-direction:column;align-items:center;gap:18px}}
.slide{{width:min(100%,var(--page-w));min-height:640px;background:#fff;padding:22px 32px 20px;box-shadow:0 8px 28px rgba(0,0,0,.18);display:flex;flex-direction:column;gap:10px;page-break-after:always}}
.slide__top{{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}}
.slide__title{{margin:0;font-size:22px;font-weight:700}}
.slide__meta{{color:var(--muted);font-size:12px}}
.logo-pill{{font-weight:700}}.logo-pill i{{font-style:normal;margin-left:4px;padding:1px 8px;border:1px solid #111;border-radius:999px;font-size:10px}}
.lead{{margin:0;color:#333;font-size:14px;max-width:98%}}
.flow-map{{border:1px solid var(--line);background:#f7f8ff;padding:10px 12px;border-radius:8px}}
.flow-map__title{{font-size:11px;font-weight:700;color:var(--navy);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em}}
.flow-map__row{{display:flex;flex-wrap:wrap;align-items:stretch;gap:4px}}
.flow-step{{display:flex;flex-direction:column;align-items:center;min-width:88px;max-width:110px;padding:6px 6px 4px;border-radius:8px;background:#fff;border:1px solid #dbe0f5;opacity:.4}}
.flow-step.is-on{{opacity:1;border-color:var(--navy);box-shadow:0 0 0 2px rgba(24,31,219,.15);background:#eef0ff}}
.flow-step__n{{width:20px;height:20px;border-radius:50%;background:var(--navy);color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center}}
.flow-step.is-on .flow-step__n{{background:#16a34a}}
.flow-step__l{{font-size:10.5px;text-align:center;margin-top:3px;line-height:1.2;font-weight:700}}
.flow-step__who{{font-size:9px;color:#64748b;margin-top:2px;text-align:center}}
.flow-gap{{color:#94a3b8;font-size:14px;align-self:center;padding:0 2px}}
.flow-map__note{{margin:8px 0 0;font-size:12px;color:#444}}
.flow-loop{{margin-top:8px;padding:8px 10px;border:1px dashed #dc2626;border-radius:6px;background:#fef2f2;font-size:12.5px;color:#7f1d1d}}
.lanes{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:8px}}
.lane{{border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fafafa}}
.lane__h{{padding:8px 10px;font-weight:700;color:#fff;font-size:13px}}
.lane--parc .lane__h{{background:var(--parc)}}.lane--mti .lane__h{{background:var(--navy)}}.lane--cli .lane__h{{background:var(--cli)}}
.lane ol{{margin:0;padding:10px 10px 10px 28px;font-size:12.5px;line-height:1.45}}
.lane li{{margin:0 0 6px}}
.story{{border:1px solid var(--line);display:flex;flex-direction:column}}
.story__row{{display:grid;grid-template-columns:150px minmax(0,1fr);min-height:42px;border-bottom:1px solid var(--line)}}
.story__row:last-child{{border-bottom:none}}
.story__lab{{background:var(--navy);color:#fff;font-weight:700;font-size:12.5px;display:flex;align-items:center;padding:10px 12px}}
.story__val{{padding:10px 14px;font-size:13px}}
.explain-txt{{font-size:13px;color:#222}}
.story__sub{{color:var(--navy);font-weight:700;margin:6px 0 3px}}
.story__sub:first-child{{margin-top:0}}
.story__val ul{{margin:0 0 6px;padding-left:18px}}
.story__val li{{margin:0 0 3px}}
.badge{{display:inline-block;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:999px}}
.badge--cadastro,.badge--classe{{background:#dcfce7;color:#166534}}
.badge--tela{{background:#dbeafe;color:#1e40af}}
.badge--metodo{{background:#ffedd5;color:#9a3412}}
.badge--regra{{background:#fef3c7;color:#92400e}}
.badge--fluxo{{background:#ede9fe;color:#5b21b6}}
.badge--conceito{{background:#f3f4f6;color:#374151}}
.kind-row{{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px}}
.group-pill{{font-size:11px;color:#475569;background:#f1f5f9;padding:2px 8px;border-radius:999px}}
.legend-kinds{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:8px}}
.lk{{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);padding:10px;background:#fafafa;font-size:12.5px}}
.nav-groups{{position:sticky;top:44px;z-index:40;width:min(100%,var(--page-w));margin:0 auto;padding:10px 12px;background:#fff;border:1px solid var(--line);box-shadow:0 4px 16px rgba(0,0,0,.08)}}
.nav-groups__title{{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--navy);margin:0 0 8px}}
.nav-groups__row{{display:flex;flex-wrap:wrap;gap:6px}}
.nav-groups button{{font:inherit;font-size:12px;font-weight:600;padding:7px 12px;border:1px solid #c7c9d9;border-radius:6px;background:#f8f9fc;cursor:pointer}}
.nav-groups button.is-on{{background:var(--navy);border-color:var(--navy);color:#fff}}
.nav-groups button small{{display:block;font-weight:500;opacity:.85;font-size:10px;margin-top:1px}}
.grp{{width:min(100%,var(--page-w));border:none;background:transparent}}
.grp>summary{{list-style:none;cursor:pointer;background:var(--navy);color:#fff;padding:14px 18px;font-weight:700;font-size:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;border-radius:8px;box-shadow:0 4px 14px rgba(24,31,219,.25)}}
.grp>summary::-webkit-details-marker{{display:none}}
.grp>summary::after{{content:"▾";font-size:18px}}
.grp[open]>summary::after{{content:"▴"}}
.grp__meta{{font-size:12px;font-weight:500;opacity:.9;text-align:right}}
.grp__body{{display:flex;flex-direction:column;gap:18px;padding:16px 0 8px}}
.grp__body .slide{{width:100%}}
.tbl{{border:1px solid var(--line)}}
.tbl__bar{{background:var(--navy);color:#fff;font-weight:700;font-size:13px;padding:7px 12px}}
.tbl table{{width:100%;border-collapse:collapse;font-size:12.5px}}
.tbl th{{background:var(--th);text-align:left;font-weight:700;padding:7px 9px;border-bottom:1px solid var(--line)}}
.tbl td{{padding:6px 9px;border-bottom:1px solid #ececec;vertical-align:top}}
.slide--cover{{padding:0;overflow:hidden;min-height:720px}}
.cover{{display:grid;grid-template-columns:1.55fr 1fr;min-height:720px}}
.cover__left{{padding:36px 40px;display:flex;flex-direction:column}}
.cover__logos{{display:flex;justify-content:flex-end;align-items:center;gap:14px;margin-bottom:48px}}
.cover__logo-txt{{font-size:11px;font-weight:700;line-height:1.25;text-align:right}}
.cover__sep{{width:1px;height:36px;background:#999}}
.cover__frame{{border:2px solid var(--navy);padding:36px 40px;max-width:92%;margin:auto 0}}
.cover__frame h1{{margin:0 0 28px;text-align:center;color:var(--navy);font-size:22px;line-height:1.35}}
.cover__sub{{text-align:right;font-size:13px;line-height:1.5}}
.cover__foot{{margin-top:auto;text-align:center;font-size:12px;line-height:1.5}}
.cover__right{{background:linear-gradient(160deg,rgba(10,14,90,.75),rgba(24,31,219,.55)),radial-gradient(circle at 30% 40%,#4b5563,#0f172a 70%);position:relative}}
.cover__badge{{position:absolute;right:18px;bottom:18px;background:#000;color:#fff;font-size:11px;font-weight:700;padding:8px 12px}}
.cover__badge span{{display:inline-block;margin-left:6px;padding:1px 8px;border:1px solid #fff;border-radius:999px;font-size:9px}}
.status-row{{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0}}
.st{{padding:6px 10px;border-radius:999px;font-size:11.5px;font-weight:700;border:1px solid #cbd5e1;background:#f8fafc}}
.st--ok{{background:#dcfce7;border-color:#86efac;color:#166534}}
.st--wait{{background:#dbeafe;border-color:#93c5fd;color:#1e40af}}
.st--warn{{background:#fef3c7;border-color:#fcd34d;color:#92400e}}
.st--off{{background:#fee2e2;border-color:#fca5a5;color:#991b1b}}
.arrow{{color:#64748b}}
.callout{{border-left:4px solid var(--navy);background:#f8fafc;padding:10px 14px;font-size:13px;margin:6px 0}}
@media print{{body{{background:#fff}}.toolbar,.nav-groups{{display:none!important}}.deck{{padding:0;gap:0}}.slide{{box-shadow:none;width:100%}}@page{{size:landscape;margin:8mm}}}}
@media(max-width:900px){{.story__row{{grid-template-columns:1fr}}.cover{{grid-template-columns:1fr}}.lanes{{grid-template-columns:1fr}}}}
"""


def build_slides() -> list[tuple[str, str]]:
    """Return list of (group_id, html)."""
    s: list[tuple[str, str]] = []

    # --- capa / guia ---
    s.append(
        (
            "guia",
            """
<section class="slide slide--cover" id="capa">
  <div class="cover">
    <div class="cover__left">
      <div class="cover__logos">
        <div class="cover__logo-txt">SEPLAG<br/><small>Secretaria de Estado de Planejamento e Gestão</small></div>
        <div class="cover__sep"></div>
        <div class="cover__logo-txt">Governo de<br/>Mato Grosso</div>
      </div>
      <div class="cover__frame">
        <h1>ATLAS – Catálogo e Produtos<br/>Documentação de Requisitos</h1>
        <div class="cover__sub">
          <div>Fase 2 — Cadastro, homologação e preparação do consumo</div>
          <div>Fonte: Discovery Catálogo (reunião 08/07/2026 · áudio + ata Teams)</div>
          <div>Versão 2.0 · 04/08/2026 · Consórcio EloGroup</div>
        </div>
      </div>
      <div class="cover__foot">
        <div>Empresa Mato-grossense de Tecnologia da Informação (MTI)</div>
        <div>Documento para negócio e validação — sem jargão técnico de plataforma</div>
      </div>
    </div>
    <div class="cover__right"><div class="cover__badge">MTI <span>SIMPLIFICA</span></div></div>
  </div>
</section>""",
        )
    )

    s.append(
        (
            "guia",
            """
<section class="slide" id="como-ler" data-group="guia">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--conceito">Guia</span></div>
    <h1 class="slide__title">Como ler este documento</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">Este material descreve <strong>o que o Atlas precisa fazer</strong> no domínio de catálogo de produtos e serviços, com base na reunião Discovery com a MTI (Luis) e no protótipo validado (backoffice + Portal do Parceiro + Portal do Cliente).</p>
  <div class="legend-kinds">
    <div class="lk"><span class="badge badge--conceito">Conceito</span><div><b>Ideia de negócio</b><br/>Explica o “porquê” sem detalhar tela.</div></div>
    <div class="lk"><span class="badge badge--fluxo">Fluxo</span><div><b>Passo a passo</b><br/>Quem faz o quê, em que ordem, e o que acontece se houver ajuste.</div></div>
    <div class="lk"><span class="badge badge--metodo">Backoffice</span><div><b>Área interna da MTI</b><br/>Cadastros, análise, publicação e versões.</div></div>
    <div class="lk"><span class="badge badge--tela">Portal</span><div><b>Canal do Parceiro ou do Cliente</b><br/>O que cada um vê e pode fazer.</div></div>
    <div class="lk"><span class="badge badge--cadastro">Cadastro</span><div><b>Registro no sistema</b><br/>Campos e regras de cada tipo de informação.</div></div>
    <div class="lk"><span class="badge badge--regra">Regra</span><div><b>Obrigação de negócio</b><br/>O que sempre vale, mesmo mudando a tela.</div></div>
  </div>
  <div class="callout" style="margin-top:12px"><strong>Fontes:</strong> gravação Teams 08/07/2026 (~1h28) · áudio <em>atlas catalogo.m4a</em> · ata Word · protótipo Atlas (portais e backoffice).</div>
</section>""",
        )
    )

    s.append(
        (
            "guia",
            story(
                "visao",
                "guia",
                "conceito",
                "O que é o catálogo e para que serve",
                "A MTI precisa de um cardápio oficial de produtos e serviços de TI, com preços, unidades de medida e versão controlada, para que contratos públicos consumam itens corretos.",
                "O <strong>catálogo</strong> é o cardápio homologado. A <strong>Fase 2</strong> monta e aprova esse cardápio. A <strong>Fase 3</strong> é o consumo (contrato, orçamento, ordem de serviço).",
                "Pela Lei 14.133 e orientações da SGDI, a contratação pública de TI não fica só no item unitário: há contratação por catálogo (moeda) e por catálogo geral de soluções.",
                "Pense em um restaurante: a Fase 2 escreve e valida o cardápio; a Fase 3 é quando o cliente pede o prato. Misturar as duas fases gera confusão entre cadastro e operação.",
                [
                    "<strong>RF-F2-01:</strong> Permitir cadastrar parceria, solução, catálogo, catálogo universal, produto e dados de parceria (markup).",
                    "<strong>RF-F2-02:</strong> Manter listas básicas: métrica, tipo de cobrança, categoria, grupo e modelo de venda.",
                    "<strong>RF-F2-03:</strong> Versionar o catálogo sem apagar a versão antiga usada em contratos.",
                    "<strong>RF-F2-04:</strong> Importar/exportar planilha (CSV) e exportar PDF; visão tipo planilha com filtros.",
                    "<strong>RF-F2-05:</strong> Calcular automaticamente o fator de conversão (somente leitura) quando o produto for universal.",
                    "<strong>RF-F2-06:</strong> Fluxo: enviar para análise → aprovar ou pedir ajuste → publicar.",
                ],
                [
                    "<strong>RN-CAT-01:</strong> Cada produto pertence a exatamente um catálogo.",
                    "<strong>RN-CAT-02:</strong> Parceria é diferente de organização (mesmo CNPJ pode ter várias parcerias).",
                    "<strong>RN-CAT-03:</strong> Markup oficial fica em Dados de Parceria — não no valor de venda do produto.",
                    "<strong>RN-CAT-04:</strong> Fator = valor unitário ÷ valor da moeda universal.",
                    "<strong>RN-CAT-05:</strong> Nova versão congela a anterior; contratos antigos permanecem nela até apostila.",
                ],
                flow=list(range(1, 11)),
                flow_note="Visão geral: todos os 10 passos da Fase 2 até o cliente enxergar a versão no contrato.",
            ),
        )
    )

    s.append(
        (
            "guia",
            story(
                "tipos",
                "guia",
                "regra",
                "Três formas de contratar (Tipos 1, 2 e 3)",
                "O sistema precisa preparar os produtos para as três formas de contratação usadas pela MTI.",
                "Não é um cadastro separado chamado “tipo de contratação”. O tipo nasce da combinação de flags no produto (universal / individualizado), da métrica e do objeto contratado na Fase 3.",
                "Discovery: Tipo 1 = item fechado; Tipo 2 = contrata uma “moeda” e consome o catálogo; Tipo 3 (CGS) = créditos amplos em métricas universais (USN / UST / HST).",
                "Analogia da reunião: como câmbio — você tem um saldo em “moedas” e cada item do catálogo “cobra” uma quantidade dessas moedas.",
                [
                    "<strong>RF-TIPO-01:</strong> Exibir e gravar, no produto, se ele é Universal e/ou Individualizado (dois interruptores independentes).",
                    "<strong>RF-TIPO-02:</strong> Exigir métrica (USN, UST, HST…) em todo produto.",
                    "<strong>RF-TIPO-03:</strong> Quando Universal = Sim, permitir informar valor da moeda e calcular o fator.",
                ],
                [
                    "<strong>RN-TIPO-01:</strong> Tipo 1 — direito só ao item contratado.",
                    "<strong>RN-TIPO-02:</strong> Tipo 2 — saldo em moeda consome itens do catálogo na mesma métrica.",
                    "<strong>RN-TIPO-03:</strong> Tipo 3 — só produtos em métricas universais; fator obrigatório nos serviços universais.",
                    "<strong>RN-TIPO-04:</strong> Universal e Individualizado podem ser Sim ao mesmo tempo.",
                    "<strong>RN-TIPO-05:</strong> Produto só individualizado (Universal = Não) não entra em fator do Tipo 3.",
                ],
                flow=[3, 4, 6, 10],
                table=(
                    "Resumo dos tipos",
                    ["Tipo", "O que se contrata", "O que se pode consumir", "Nome interno"],
                    [
                        ["1", "Produto/licença específico", "Só aquele item", "Individualizado"],
                        ["2", "Objeto-moeda (USN, UST ou HST) ligado a um catálogo", "Itens do catálogo na métrica", "Catálogo de produto/serviço"],
                        ["3", "Créditos de TI e/ou de Serviço (CGS)", "Produtos ativos nas métricas universais", "Catálogo Geral de Soluções"],
                    ],
                ),
            ),
        )
    )

    s.append(
        (
            "guia",
            story(
                "metricas-conceito",
                "guia",
                "conceito",
                "Unidades de medida (USN, UST e HST)",
                "Precisamos de unidades claras para precificar e consumir itens sem confundir “hora” com “esforço de time”.",
                "São registros da lista <strong>Métrica</strong>. Em uso na MTI: USN (licenciamento), UST (serviço por complexidade/time), HST (hora de profissional).",
                "Discovery: UST não é linear com hora — 10 UST podem cobrir Lucas + Gabriel + Bernardo. HST ≈ hora identificável (ex.: criação de instância ~30–40 min = 1 HST).",
                "USN é a moeda típica de licença/infra. UST é o “pacote de esforço” de desenvolvimento. HST é a hora do técnico.",
                [
                    "<strong>RF-MET-01:</strong> Cadastrar métricas com sigla e descrição.",
                    "<strong>RF-MET-02:</strong> O produto deve escolher uma métrica já cadastrada (não texto livre).",
                ],
                [
                    "<strong>RN-MET-01:</strong> USN → licença/infra; UST/HST → serviço.",
                    "<strong>RN-MET-02:</strong> UST ≠ hora linear; HST ≈ hora de trabalho.",
                    "<strong>RN-MET-03:</strong> “Horas” legadas migram para HST.",
                ],
                flow=[1, 4],
            ),
        )
    )

    s.append(
        (
            "guia",
            """
<section class="slide" id="papeis" data-group="guia">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--conceito">Conceito</span></div>
    <h1 class="slide__title">Quem faz o quê</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">Três canais distintos. Ninguém “mistura” papel: o parceiro não publica, o cliente não cadastra catálogo, a MTI não opera pelo portal do cliente.</p>
"""
            + tbl(
                "Matriz de papéis",
                ["Quem", "Onde trabalha", "Pode cadastrar catálogo?", "Principais ações"],
                [
                    ["<strong>MTI</strong>", "Backoffice (área interna)", "Sim (cadastro interno e análise)", "Listas básicas · Parceria · Análise · Publicar · Nova versão · Apostilar · Paralisar"],
                    ["<strong>Parceiro</strong>", "Portal do Parceiro", "Sim, só rascunho da sua parceria", "Salvar · CSV · Planilha · Enviar à MTI · Corrigir após ajuste · Acompanhar status"],
                    ["<strong>Cliente</strong>", "Portal do Cliente", "<strong>Não</strong>", "Consultar versão apostilada · Cotação · Demanda · Orçamento · Ordem de serviço"],
                ],
            )
            + """
  <div class="callout"><strong>Discovery:</strong> “Essa visão para o cliente não é automática, só a partir de um apostilamento.” A versão do catálogo é atributo do contrato.</div>
</section>""",
        )
    )

    # --- fluxo ---
    s.append(
        (
            "fluxo",
            f"""
<section class="slide" id="fluxo-mapa" data-group="fluxo">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--fluxo">Fluxo</span></div>
    <h1 class="slide__title">Fluxo completo — do cadastro ao cliente</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">Leia este mapa antes dos detalhes. O caminho feliz segue 10 passos. Se a MTI pedir ajuste, o parceiro volta ao passo 7, corrige e reenvia.</p>
  {flow_strip(list(range(1, 11)), "Caminho feliz. Publicar (9) não mostra sozinho ao cliente — falta a apostila no contrato (10).")}
  <div class="flow-loop"><strong>Loop de ajuste:</strong> passo 8 (MTI pede correção com motivo) → status “Ajuste solicitado” → parceiro edita de novo (passos 3–7) → reenvia → volta ao passo 8.</div>
"""
            + tbl(
                "Passos × responsável × resultado",
                ["#", "Passo", "Quem", "Resultado esperado"],
                [
                    ["1", "Preparar listas básicas (métrica, cobrança, categoria, grupo, modelo de venda)", "MTI", "Listas prontas para o produto usar"],
                    ["2", "Criar parceria e soluções", "MTI", "Parceira homologada com soluções e fabricante em texto"],
                    ["3", "Montar catálogo (versão)", "Parceiro", "Rascunho do cardápio da parceria"],
                    ["4", "Incluir produtos (manual ou planilha)", "Parceiro", "Itens com preço, métrica e flags"],
                    ["5", "Informar markup / dados de parceria", "Ambos", "Custo × markup e % MTI/parceiro = 100%"],
                    ["6", "Montar catálogo universal (se Tipo 3)", "MTI", "Agrega catálogos elegíveis"],
                    ["7", "Revisar e enviar à MTI", "Parceiro", "Status “Aguardando MTI”; edição travada"],
                    ["8", "Analisar: aprovar, pedir ajuste ou reprovar", "MTI", "Decisão com assinatura; ajuste exige motivo"],
                    ["9", "Publicar em produção", "MTI", "Catálogo ativo para uso contratual"],
                    ["10", "Apostilar versão no contrato", "MTI → Cliente", "Cliente passa a ver/consumir a versão"],
                ],
            )
            + """
</section>""",
        )
    )

    s.append(
        (
            "fluxo",
            """
<section class="slide" id="fluxo-raias" data-group="fluxo">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--fluxo">Fluxo</span></div>
    <h1 class="slide__title">Visão por canal — três raias</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <div class="lanes">
    <div class="lane lane--parc">
      <div class="lane__h">Portal do Parceiro</div>
      <ol>
        <li>Criar rascunho do catálogo da sua parceria</li>
        <li>Incluir produtos (tela ou CSV)</li>
        <li>Usar visão planilha com filtros (ex.: complexidade média)</li>
        <li>Exportar CSV/PDF para trabalhar offline</li>
        <li>Enviar à MTI</li>
        <li>Se houver ajuste: ler motivo, corrigir e reenviar</li>
        <li>Acompanhar status espelhado (rascunho → aguardando → homologado…)</li>
      </ol>
    </div>
    <div class="lane lane--mti">
      <div class="lane__h">Backoffice MTI</div>
      <ol>
        <li>Cadastrar listas básicas e parceria</li>
        <li>Receber fila “Aguardando análise”</li>
        <li>Conferir valores com planilha CGS</li>
        <li>Aprovar, pedir ajuste (com motivo) ou reprovar</li>
        <li>Publicar após aprovar</li>
        <li>Criar nova versão sem apagar a antiga</li>
        <li>Apostilar versão no contrato do cliente</li>
        <li>Paralisar catálogo quando necessário</li>
      </ol>
    </div>
    <div class="lane lane--cli">
      <div class="lane__h">Portal do Cliente</div>
      <ol>
        <li>Não cadastra catálogo nem produto</li>
        <li>Consulta só a versão apostilada no contrato</li>
        <li>Monta cotação (gera demanda)</li>
        <li>Abre e acompanha demandas</li>
        <li>Recebe proposta de orçamento → aceita ou recusa</li>
        <li>Autoriza atendimento e/ou abre ordem de serviço</li>
        <li>Versão nova só aparece após apostila</li>
      </ol>
    </div>
  </div>
</section>""",
        )
    )

    s.append(
        (
            "fluxo",
            """
<section class="slide" id="fluxo-status" data-group="fluxo">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--fluxo">Fluxo</span></div>
    <h1 class="slide__title">Jornada de status (parceiro ↔ MTI)</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">O mesmo status aparece no Portal do Parceiro e no backoffice. Enquanto “Aguardando MTI”, o parceiro não edita.</p>
  <div class="status-row">
    <span class="st">Rascunho (parceiro)</span><span class="arrow">→</span>
    <span class="st st--wait">Aguardando análise MTI</span><span class="arrow">→</span>
    <span class="st st--warn">Ajuste solicitado</span><span class="arrow">↻</span>
    <span class="st st--ok">Homologado</span><span class="arrow">→</span>
    <span class="st st--ok">Ativo (publicado)</span>
  </div>
  <div class="status-row">
    <span class="st st--off">Reprovado</span>
    <span class="st st--off">Paralisado</span>
    <span class="pc-muted" style="font-size:12px">Saídas finais ou bloqueio de novos consumos</span>
  </div>
"""
            + tbl(
                "O que cada status significa",
                ["Status", "Parceiro pode editar?", "Próximo passo típico"],
                [
                    ["Rascunho (parceiro)", "Sim", "Completar itens e enviar"],
                    ["Aguardando análise MTI", "Não", "MTI analisa no backoffice"],
                    ["Ajuste solicitado", "Sim", "Corrigir conforme motivo e reenviar"],
                    ["Homologado", "Não", "MTI publica"],
                    ["Ativo (publicado)", "Não", "Apostilar nos contratos que devem usar"],
                    ["Reprovado", "Não (clonar novo rascunho)", "Abrir novo ciclo"],
                    ["Paralisado", "Não", "Sem novos consumos até reativar"],
                ],
            )
            + """
  <div class="flow-loop"><strong>Regra:</strong> pedir ajuste exige motivo obrigatório, visível no portal. Publicar só depois de homologar.</div>
</section>""",
        )
    )

    # --- backoffice ---
    s.append(
        (
            "backoffice",
            story(
                "bo-visao",
                "backoffice",
                "backoffice",
                "Backoffice MTI — visão geral",
                "Como analista MTI, preciso preparar o domínio, analisar o que o parceiro enviou, publicar e controlar versões.",
                "Área interna do Atlas usada só pela MTI. É o lugar da verdade para parecer, publicação e versionamento.",
                "Discovery: primeiro cadastro da parceria é da MTI; parecer obrigatório quando o parceiro cadastra; publicar após aprovar; nova versão sem sobrescrever.",
                "O backoffice é a “cozinha e o controle de qualidade”. O portal do parceiro é a porta de entrada do fornecedor.",
                [
                    "<strong>RF-MTI-01:</strong> Cadastrar e manter listas básicas e parcerias/soluções.",
                    "<strong>RF-MTI-02:</strong> Analisar catálogo/produto enviado: aprovar, solicitar ajuste (com motivo) ou reprovar.",
                    "<strong>RF-MTI-03:</strong> Publicar catálogo homologado em produção.",
                    "<strong>RF-MTI-04:</strong> Criar nova versão copiando produtos e congelando a anterior.",
                    "<strong>RF-MTI-05:</strong> Apostilar versão de catálogo no contrato (libera visão do cliente).",
                    "<strong>RF-MTI-06:</strong> Paralisar catálogo/produto quando necessário.",
                    "<strong>RF-MTI-07:</strong> Cadastrar catálogo universal agregando catálogos elegíveis.",
                    "<strong>RF-MTI-08:</strong> Conferir fator calculado e valores com a planilha de referência (CGS).",
                ],
                [
                    "<strong>RN-MTI-01:</strong> Sem parecer MTI, cadastro do parceiro não publica.",
                    "<strong>RN-MTI-02:</strong> Solicitar ajuste exige justificativa.",
                    "<strong>RN-MTI-03:</strong> Publicar só após homologar.",
                    "<strong>RN-MTI-04:</strong> Versão homologada não é editada — cria-se outra.",
                ],
                flow=[1, 2, 6, 8, 9, 10],
                table=(
                    "Ações do backoffice",
                    ["Ação", "Quando", "Efeito"],
                    [
                        ["Aprovar", "Fila de análise", "Status → Homologado"],
                        ["Solicitar ajuste", "Há divergência (ex.: valor ≠ planilha)", "Status → Ajuste + motivo no portal"],
                        ["Reprovar", "Fora do escopo / inconsistente", "Status → Reprovado"],
                        ["Publicar", "Já homologado", "Status → Ativo (publicado)"],
                        ["Nova versão", "Evolução do cardápio", "Nova versão + cópia; antiga congelada"],
                        ["Apostilar", "Contrato deve usar nova versão", "Cliente passa a ver a versão"],
                        ["Paralisar", "Bloquear novos consumos", "Status → Paralisado"],
                    ],
                ),
            ),
        )
    )

    s.append(
        (
            "backoffice",
            story(
                "bo-analise",
                "backoffice",
                "acao",
                "Análise de catálogo / produto",
                "Como analista, quero decidir sobre o envio do parceiro com registro claro da decisão.",
                "Tela de análise no backoffice com origem do portal, decisão (aprovar / ajuste / reprovar), motivo quando necessário e opção de publicar após aprovar.",
                "Discovery: “tudo envolve aprovação da MTI conforme o parceiro cadastra”; fluxo de parecer + exportação PDF/CSV.",
                "É o “carimbo” oficial. Sem ele, o cardápio do parceiro não vira oferta publicada.",
                [
                    "<strong>RF-AN-01:</strong> Exibir catálogo/produtos enviados e status atual.",
                    "<strong>RF-AN-02:</strong> Registrar decisão: Aprovar, Solicitar ajuste ou Reprovar.",
                    "<strong>RF-AN-03:</strong> Exigir motivo ao solicitar ajuste ou reprovar.",
                    "<strong>RF-AN-04:</strong> Após aprovar, permitir publicar (homologar em produção).",
                    "<strong>RF-AN-05:</strong> Espelhar o novo status no Portal do Parceiro imediatamente (protótipo: simulação de espelho).",
                ],
                [
                    "<strong>RN-AN-01:</strong> Motivo obrigatório em ajuste e reprovação.",
                    "<strong>RN-AN-02:</strong> Publicar só se status estiver Homologado (ou equivalente aprovado).",
                ],
                flow=[8, 9],
            ),
        )
    )

    # --- parceiro ---
    s.append(
        (
            "parceiro",
            story(
                "pp-visao",
                "parceiro",
                "portal",
                "Portal do Parceiro — visão geral",
                "Como parceiro (distribuidora), quero montar o catálogo da minha parceria, enviar à MTI e corrigir se houver pedido de ajuste.",
                "Canal exclusivo do parceiro. Não publica, não cria versão contratual e não atende o cliente final neste fluxo.",
                "Discovery: upload CSV (parceria com 80+ serviços), exportar para trabalhar offline e subir nova versão, parecer MTI, visão planilha.",
                "É a mesa de trabalho do fornecedor. A MTI só entra depois do “Enviar”.",
                [
                    "<strong>RF-PARC-01:</strong> Salvar rascunho de catálogo e produtos da própria parceria.",
                    "<strong>RF-PARC-02:</strong> Incluir produtos manualmente ou por importação CSV (template oficial).",
                    "<strong>RF-PARC-03:</strong> Exportar CSV e PDF (grade completa ou filtrada).",
                    "<strong>RF-PARC-04:</strong> Enviar à MTI (status → Aguardando; trava edição).",
                    "<strong>RF-PARC-05:</strong> Receber ajuste com motivo; corrigir e reenviar.",
                    "<strong>RF-PARC-06:</strong> Acompanhar status espelhado (rascunho, aguardando, ajuste, homologado, publicado, reprovado, paralisado).",
                    "<strong>RF-PARC-07:</strong> Visão planilha dos produtos com filtros (tipo, complexidade, grupo, categoria) e seleção em massa.",
                    "<strong>RF-PARC-08:</strong> Após reprovação/paralisação, poder abrir novo rascunho a partir do ciclo anterior.",
                ],
                [
                    "<strong>RN-PARC-01:</strong> Parecer MTI obrigatório quando o cadastro vem do parceiro.",
                    "<strong>RN-PARC-02:</strong> Solicitar ajuste exige justificativa visível no portal.",
                    "<strong>RN-PARC-03:</strong> Parceiro só vê/edita catálogos da sua organização/parceria.",
                    "<strong>RN-PARC-04:</strong> Enviar exige ao menos um produto no catálogo.",
                ],
                flow=[3, 4, 5, 7, 8],
            ),
        )
    )

    s.append(
        (
            "parceiro",
            story(
                "pp-telas",
                "parceiro",
                "tela",
                "Telas e ações do Portal do Parceiro (protótipo)",
                "Como usuário do portal, preciso de um caminho claro: início → meus catálogos → detalhe → enviados/ajustes.",
                "Protótipo implementado: home com papéis, lista de catálogos, detalhe editável, visão planilha, importação/exportação CSV/PDF, fila de enviados e pareceres, simulação de espelho do backoffice.",
                "Alinha RF-PARC ao que está no app Portal do Parceiro.",
                "Se o parceiro entender a tela sem treinamento longo, o requisito de usabilidade está bom.",
                [
                    "<strong>RF-PARC-T01:</strong> Home com resumo (qtde de catálogos, aguardando MTI, ajustes).",
                    "<strong>RF-PARC-T02:</strong> Lista “Meus catálogos” com versão, parceria, qtde de produtos e status.",
                    "<strong>RF-PARC-T03:</strong> Detalhe com identificador, versão, parceria, grade de produtos e mensagem ao analista.",
                    "<strong>RF-PARC-T04:</strong> Botões: Salvar rascunho, Template CSV, Importar CSV, Enviar à MTI, Exportar CSV/PDF, Visão planilha.",
                    "<strong>RF-PARC-T05:</strong> Tela “Enviados / ajustes” com filas: aguardando, ajuste, e pareceres finais.",
                    "<strong>RF-PARC-T06:</strong> Exibir justificativa da MTI em destaque quando status = Ajuste / Reprovado / Paralisado.",
                ],
                [
                    "<strong>RN-PARC-T01:</strong> Campos editáveis só em Rascunho ou Ajuste solicitado.",
                    "<strong>RN-PARC-T02:</strong> Histórico de mudanças de status deve ser consultável no detalhe.",
                ],
                flow=[3, 4, 7],
                table=(
                    "Campos do produto na grade do portal",
                    ["Campo", "Obrigatório?", "Observação"],
                    [
                        ["Identificador", "Sim", "Nome do item"],
                        ["Part number", "Não", "SKU / código do parceiro"],
                        ["Tipo", "Sim", "Licença · Serviço · Infraestrutura"],
                        ["Métrica", "Sim", "USN · UST · HST…"],
                        ["Valor unitário", "Sim", "R$ de comercialização"],
                        ["Complexidade", "Se serviço", "Usada em filtros da planilha"],
                        ["Grupo / Categoria", "Não", "Organização e filtros"],
                        ["Status do item", "Sim", "Ex.: Ativo"],
                    ],
                ),
            ),
        )
    )

    # --- cliente ---
    s.append(
        (
            "cliente",
            story(
                "pc-visao",
                "cliente",
                "portal",
                "Portal do Cliente — visão geral",
                "Como cliente (administração pública), quero consumir o catálogo da versão do meu contrato — sem cadastrar produtos.",
                "Canal de consumo. Cadastro de catálogo/produto é do parceiro e da MTI.",
                "Discovery: cliente pode demandar pelo portal ou receber orçamento apresentado; OS pode nascer do orçamento ou direto; versão só após apostila.",
                "O cliente não escreve o cardápio — ele escolhe o prato da versão que o contrato liberou.",
                [
                    "<strong>RF-CLI-01:</strong> Consultar catálogo/produtos da versão apostilada no contrato.",
                    "<strong>RF-CLI-02:</strong> Abrir demanda e/ou solicitar/receber orçamento pelo portal.",
                    "<strong>RF-CLI-03:</strong> Abrir ordem de serviço (direto ou após orçamento autorizado).",
                    "<strong>RF-CLI-04:</strong> Acompanhar demandas, orçamentos e OS.",
                    "<strong>RF-CLI-05:</strong> Não exibir versão nova do catálogo até apostila no contrato.",
                    "<strong>RF-CLI-06:</strong> Cotação a partir do catálogo em produção gera demanda para a MTI.",
                    "<strong>RF-CLI-07:</strong> Aceitar ou recusar proposta de orçamento (gestor).",
                    "<strong>RF-CLI-08:</strong> Autorizar atendimento via contrato/orçamento, gerando OS.",
                ],
                [
                    "<strong>RN-CLI-01:</strong> Cliente nunca cadastra/edita catálogo ou produto.",
                    "<strong>RN-CLI-02:</strong> Visibilidade filtrada pela versão apostilada (padrão).",
                    "<strong>RN-CLI-03:</strong> OS/orçamento devem registrar a versão do catálogo usada (snapshot).",
                    "<strong>RN-CLI-04:</strong> Demandante sobe para gestor; gestor aprova hierarquia e autoriza.",
                ],
                flow=[10],
                flow_note="O cliente entra de fato no passo 10 (depois da apostila). Cotação/demanda/OS usam o cardápio já liberado.",
            ),
        )
    )

    s.append(
        (
            "cliente",
            story(
                "pc-fluxo-consumo",
                "cliente",
                "fluxo",
                "Fluxo de consumo no Portal do Cliente",
                "Como cliente, quero um caminho completo: ver catálogo → cotar/demanda → orçamento → autorizar → OS.",
                "Protótipo: Catálogo MTI (filtro por versão apostilada), Nova cotação, Demandas (com perfis Cliente/Parceiro/MTI e cargos Demandante/Gestor), Meus contratos (apostila simulada), Ordens de serviço.",
                "Discovery: orçamento prévio é o padrão em serviços; OS pode existir sem orçamento; Seplag/MPMS como exemplos de operação.",
                "É o caminho do pedido: do interesse à ordem de serviço, sempre sobre o cardápio liberado no contrato.",
                [
                    "<strong>RF-CLI-F01:</strong> Em Meus contratos, mostrar versão apostilada e, se houver, versão pendente ainda invisível.",
                    "<strong>RF-CLI-F02:</strong> Permitir simular/registrar apostila que libera a versão pendente (operação MTI/jurídico — no protótipo há botão didático).",
                    "<strong>RF-CLI-F03:</strong> Cotação envia solicitação e abre demanda vinculada.",
                    "<strong>RF-CLI-F04:</strong> Demanda em orçamento exibe proposta com itens, quantidades, valores e versão do catálogo.",
                    "<strong>RF-CLI-F05:</strong> Gestor aceita orçamento → vai para autorização → gera/vincula OS.",
                    "<strong>RF-CLI-F06:</strong> Gestor pode recusar orçamento; parceiro/MTI pode reenviar proposta.",
                    "<strong>RF-CLI-F07:</strong> Nova OS exige contrato, catálogo/versão e itens do contrato.",
                ],
                [
                    "<strong>RN-CLI-F01:</strong> Sem apostila, item de versão nova não entra na consulta padrão.",
                    "<strong>RN-CLI-F02:</strong> Aceitar orçamento não substitui a autorização final do gestor quando o fluxo exigir.",
                ],
                flow=[10],
                table=(
                    "Status da demanda (consumo)",
                    ["Status", "Quem age", "Próximo passo"],
                    [
                        ["Aguardando gestor", "Gestor do cliente", "Aprovar / devolver / recusar"],
                        ["Aguardando análise / Em análise", "MTI ou Parceiro notificado", "Via contrato ou enviar a orçamento"],
                        ["Em orçamento", "Parceiro/MTI → Cliente", "Proposta → aceitar/recusar"],
                        ["Aguardando autorização", "Gestor", "Autorizar (OS) / não autorizar"],
                        ["Aprovada · em atendimento", "Operação", "Execução / ServiceNow"],
                        ["Devolvida / Recusada / Não autorizada", "Cliente", "Ajustar e reenviar ou reabrir"],
                    ],
                ),
            ),
        )
    )

    # --- portais (RF completos) + cadastros/classes (RF/RN por classe) ---
    append_portal_and_class_requirements(s, story, tbl)

    # --- regras ---
    s.append(
        (
            "regras",
            """
<section class="slide" id="regras-gerais" data-group="regras">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--regra">Regra</span></div>
    <h1 class="slide__title">Regras gerais (resumo executivo)</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
"""
            + tbl(
                "Não negociáveis da Discovery",
                ["Regra", "Significado prático"],
                [
                    ["Parceria ≠ Organização", "Mesmo CNPJ pode ter várias parcerias (SIMPLIFICA, HOST…)"],
                    ["Fabricante é texto", "Não criar cadastro separado de fabricante"],
                    ["Dois interruptores no produto", "Universal e Individualizado independentes"],
                    ["Produto em uma página", "Evitar excesso de abas no cadastro"],
                    ["Fator é calculado", "Não digitar fator à mão quando Universal = Sim"],
                    ["Markup fora do produto", "Vai em Dados de Parceria"],
                    ["Versão no contrato", "Cliente só troca de cardápio com apostila"],
                    ["CSV nos dois sentidos", "Importar carga e exportar para nova versão"],
                    ["Parecer MTI obrigatório", "Quando a origem for o portal do parceiro"],
                    ["Cliente não cadastra", "Só consome versão liberada"],
                ],
            )
            + """
</section>""",
        )
    )

    s.append(
        (
            "regras",
            """
<section class="slide" id="glossario" data-group="regras">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--conceito">Conceito</span></div>
    <h1 class="slide__title">Glossário em linguagem do dia a dia</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
"""
            + tbl(
                "Termos",
                ["Termo", "Significado simples"],
                [
                    ["Catálogo", "Cardápio versionado de itens de uma parceria"],
                    ["Produto", "Item do cardápio (licença ou serviço)"],
                    ["Parceria", "Linha de oferta (SIMPLIFICA, HOST…) ligada a um CNPJ"],
                    ["Organização", "Empresa/CNPJ (parceiro ou cliente) — cadastro da Fase 1"],
                    ["Moeda / métrica", "Unidade com a qual se compra e se consome (USN, UST, HST)"],
                    ["Fator de conversão", "Quantas “moedas” equivalem a 1 unidade do produto"],
                    ["Markup", "Acordo interno de margem entre MTI e parceiro"],
                    ["Homologar / Publicar", "Aprovar e tornar o cardápio válido em produção"],
                    ["Apostilar", "Atualizar o contrato para uma nova versão do catálogo"],
                    ["Ordem de serviço (OS)", "Autorização de consumo/execução sobre o contrato"],
                    ["Orçamento", "Proposta de consumo antes (ou junto) da OS"],
                    ["Demanda", "Pedido formal do cliente (ou parceiro) que inicia o atendimento"],
                    ["Backoffice", "Área interna da MTI"],
                    ["Portal do Parceiro", "Canal onde o fornecedor cadastra e envia o cardápio"],
                    ["Portal do Cliente", "Canal onde o órgão consulta e consome o cardápio liberado"],
                ],
            )
            + """
  <div class="callout"><strong>Fora desta Fase 2 (mas preparado):</strong> medição/faturamento completo, integração profunda SIAG/Protheus e orquestração ServiceNow — tratados como continuidade da Fase 3.</div>
</section>""",
        )
    )

    return s


def main() -> None:
    slides = build_slides()
    by: dict[str, list[str]] = {g[0]: [] for g in GROUPS}
    # capa goes before nav; extract
    cover = ""
    how = ""
    for g, html in slides:
        if 'id="capa"' in html:
            cover = html
            continue
        if 'id="como-ler"' in html:
            how = html
            continue
        by.setdefault(g, []).append(html)

    accordion = []
    for gid, title, meta in GROUPS:
        pages = by.get(gid, [])
        if not pages:
            continue
        open_attr = " open" if gid == "guia" else ""
        accordion.append(
            f'<details class="grp" id="grp-{gid}" data-grp="{gid}"{open_attr}>'
            f"<summary><span>{esc(title)}</span>"
            f'<span class="grp__meta">{len(pages)} página(s) · {esc(meta)}</span></summary>'
            f'<div class="grp__body">{"".join(pages)}</div></details>'
        )

    nav = "".join(
        f'<button type="button" data-jump="{gid}"><span>{esc(title)}</span><small>{esc(meta)}</small></button>'
        for gid, title, meta in GROUPS
    )

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>ATLAS — Catálogo e Produtos | Documentação de Requisitos</title>
<style>{css()}</style>
</head>
<body>
<div class="toolbar">
  <div><strong>ATLAS</strong> · Catálogo e Produtos · Documentação de Requisitos v2.0</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button type="button" onclick="expandAll(true)">Abrir todos</button>
    <button type="button" onclick="expandAll(false)">Fechar todos</button>
    <button type="button" class="primary" onclick="window.print()">Imprimir / PDF</button>
  </div>
</div>
<main class="deck deck--grouped">
{cover}
{how}
<nav class="nav-groups" aria-label="Índice do documento">
  <p class="nav-groups__title">Índice — clique para abrir a seção</p>
  <div class="nav-groups__row">{nav}</div>
</nav>
{''.join(accordion)}
</main>
<script>
function expandAll(open){{document.querySelectorAll('details.grp').forEach(d=>d.open=open)}}
document.querySelectorAll('.nav-groups button').forEach(btn=>{{
  btn.addEventListener('click',()=>{{
    const id=btn.getAttribute('data-jump')
    document.querySelectorAll('.nav-groups button').forEach(b=>b.classList.remove('is-on'))
    btn.classList.add('is-on')
    document.querySelectorAll('details.grp').forEach(d=>{{d.open=d.getAttribute('data-grp')===id}})
    document.getElementById('grp-'+id)?.scrollIntoView({{behavior:'smooth',block:'start'}})
  }})
}})
window.addEventListener('beforeprint',()=>expandAll(true))
</script>
</body>
</html>
"""
    OUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT} · {OUT.stat().st_size/1024:.1f} KB · groups {len(GROUPS)}")


if __name__ == "__main__":
    main()
