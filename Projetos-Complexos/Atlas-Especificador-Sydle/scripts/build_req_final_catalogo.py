# -*- coding: utf-8 -*-
"""Documentação de requisitos FINAL — Catálogo & Produtos (Atlas / MTI)."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "exports" / "requisitos-finais-catalogo-produtos-atlas.html"
NAVY = "#181fdb"


def esc(s: object) -> str:
    return (
        str(s or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
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
    necessidade: str,
    o_que: str,
    como_usa: str,
    deve: list[str],
    regras: list[str],
    validacoes: list[str] | None = None,
    acoes: list[str] | None = None,
    table: tuple[str, list[str], list[list[str]]] | None = None,
    extra: str = "",
) -> str:
    kind_map = {
        "conceito": ("Conceito", "conceito"),
        "fluxo": ("Fluxo", "fluxo"),
        "config": ("Configuração", "metodo"),
        "cadastro": ("Classe", "cadastro"),
        "portal": ("Portal", "tela"),
        "backoffice": ("Backoffice", "metodo"),
        "regra": ("Regras", "regra"),
        "aceite": ("Aceite", "regra"),
    }
    lab, css = kind_map[kind]
    gtitle = {
        "intro": "Introdução",
        "negocio": "Negócio e configuração",
        "fluxo": "Fluxo operacional",
        "classes": "Classes e cadastros",
        "parceiro": "Portal do Parceiro",
        "cliente": "Portal do Cliente",
        "mti": "Backoffice MTI",
        "catalogo": "Catálogo RF / RN",
        "aceite": "Aceite e glossário",
    }[group]

    def block(sub: str, items: list[str] | None) -> str:
        if not items:
            return ""
        return (
            f'<div class="story__sub">{esc(sub)}</div>'
            f"<ul>{''.join(f'<li>{x}</li>' for x in items)}</ul>"
        )

    val_h = ""
    if validacoes or acoes:
        val_h = (
            '<div class="story__row story__row--grow">'
            '<div class="story__lab">Operação</div><div class="story__val">'
            + block("Ações do fluxo", acoes)
            + block("Validações", validacoes)
            + "</div></div>"
        )

    table_h = tbl(*table) if table else ""
    return f"""
<section class="slide" id="{sid}" data-group="{group}" data-kind="{css}">
  <header class="slide__top">
    <div>
      <div class="kind-row">
        <span class="badge badge--{css}">{lab}</span>
        <span class="group-pill">{esc(gtitle)}</span>
      </div>
      <h1 class="slide__title">{esc(title)}</h1>
    </div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <div class="story">
    <div class="story__row"><div class="story__lab">Necessidade</div><div class="story__val">{esc(necessidade)}</div></div>
    <div class="story__row"><div class="story__lab">O que é</div><div class="story__val">{o_que}</div></div>
    <div class="story__row"><div class="story__lab">Como é usado</div><div class="story__val">{como_usa}</div></div>
    <div class="story__row story__row--grow"><div class="story__lab">O sistema deve</div>
      <div class="story__val">
        {block("Requisitos funcionais", deve)}
        {block("Regras de negócio", regras)}
      </div>
    </div>
    {val_h}
  </div>
  {table_h}
  {extra}
</section>"""


GROUPS = [
    ("intro", "Introdução", "Capa · Como ler · Objetivo"),
    ("negocio", "Negócio e configuração", "Tipos · Papéis · Ordem de cadastro"),
    ("fluxo", "Fluxo operacional", "Passo a passo · Status · Validações"),
    ("classes", "Classes e cadastros", "Campos · RF · RN · Ações"),
    ("parceiro", "Portal do Parceiro", "Rascunho · CSV · Envio · Ajuste"),
    ("cliente", "Portal do Cliente", "Consulta · Cotação · Orçamento · OS"),
    ("mti", "Backoffice MTI", "Análise · Publicação · Apostila"),
    ("catalogo", "Catálogo RF / RN", "Lista consolidada"),
    ("aceite", "Aceite e glossário", "Critérios · Termos · Fontes"),
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
.story{{border:1px solid var(--line);display:flex;flex-direction:column}}
.story__row{{display:grid;grid-template-columns:150px minmax(0,1fr);min-height:42px;border-bottom:1px solid var(--line)}}
.story__row:last-child{{border-bottom:none}}
.story__lab{{background:var(--navy);color:#fff;font-weight:700;font-size:12.5px;display:flex;align-items:center;padding:10px 12px}}
.story__val{{padding:10px 14px;font-size:13px}}
.story__sub{{color:var(--navy);font-weight:700;margin:6px 0 3px}}
.story__sub:first-child{{margin-top:0}}
.story__val ul{{margin:0 0 6px;padding-left:18px}}
.story__val li{{margin:0 0 3px}}
.badge{{display:inline-block;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:999px}}
.badge--cadastro{{background:#dcfce7;color:#166534}}
.badge--tela{{background:#dbeafe;color:#1e40af}}
.badge--metodo{{background:#ffedd5;color:#9a3412}}
.badge--regra{{background:#fef3c7;color:#92400e}}
.badge--fluxo{{background:#ede9fe;color:#5b21b6}}
.badge--conceito{{background:#f3f4f6;color:#374151}}
.kind-row{{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px}}
.group-pill{{font-size:11px;color:#475569;background:#f1f5f9;padding:2px 8px;border-radius:999px}}
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
.st--bad{{background:#fee2e2;border-color:#fca5a5;color:#991b1b}}
.st--mute{{background:#f1f5f9;border-color:#cbd5e1;color:#475569}}
.lanes{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:8px}}
.lane{{border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fafafa}}
.lane__h{{padding:8px 10px;font-weight:700;color:#fff;font-size:13px}}
.lane--parc .lane__h{{background:var(--parc)}}.lane--mti .lane__h{{background:var(--navy)}}.lane--cli .lane__h{{background:var(--cli)}}
.lane ol{{margin:0;padding:10px 10px 10px 28px;font-size:12.5px;line-height:1.45}}
.lane li{{margin:0 0 6px}}
.steps{{counter-reset:step;margin:8px 0;padding:0;list-style:none}}
.steps li{{position:relative;padding:10px 12px 10px 52px;border:1px solid var(--line);border-radius:8px;margin:0 0 8px;background:#fafafa}}
.steps li::before{{counter-increment:step;content:counter(step);position:absolute;left:12px;top:10px;width:28px;height:28px;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;font-size:13px;display:grid;place-items:center}}
.steps b{{color:var(--navy)}}
.callout{{border-left:4px solid var(--navy);background:#f5f6ff;padding:10px 14px;font-size:13px;margin:8px 0}}
.callout--warn{{border-left-color:#d97706;background:#fffbeb}}
@media print{{.toolbar,.nav-groups{{display:none!important}}.grp>summary{{display:none}}.grp__body{{padding:0}}.slide{{box-shadow:none;width:100%}}}}
"""


def build() -> None:
    s: list[tuple[str, str]] = []

    # --- capa ---
    s.append(
        (
            "intro",
            f"""
<section class="slide slide--cover" id="capa" data-group="intro">
  <div class="cover">
    <div class="cover__left">
      <div class="cover__logos">
        <div class="cover__logo-txt">MTI<br/>Empresa de Tecnologia<br/>da Informação</div>
        <div class="cover__sep"></div>
        <div class="cover__logo-txt" style="color:{NAVY}">MTI<br/><span style="border:1px solid {NAVY};padding:1px 8px;border-radius:999px;font-size:10px">SIMPLIFICA</span></div>
      </div>
      <div class="cover__frame">
        <h1>Documentação de Requisitos<br/>Catálogo e Produtos</h1>
        <div class="cover__sub">
          <div><strong>Minuta para validação · v0.9</strong> — 04/08/2026</div>
          <div>Projeto Atlas · MTI Simplifica</div>
          <div>Backoffice · Portal do Parceiro · Portal do Cliente</div>
          <div style="margin-top:10px;font-size:12px">Aprovação formal pendente (Discovery 08/07)</div>
        </div>
      </div>
      <div class="cover__foot">
        Base: Discovery Catálogo 08/07/2026 · protótipo atlas-prototipo · portais<br/>
        Classes do grupo [Atlas] Produtos · Parceria em [Atlas] Organização<br/>
        Itens marcados como <em>proposto</em> / <em>protótipo</em> ainda não são decisão fechada da Discovery.
      </div>
    </div>
    <div class="cover__right"><div class="cover__badge">ATLAS <span>MINUTA</span></div></div>
  </div>
</section>""",
        )
    )

    s.append(
        (
            "intro",
            """
<section class="slide" id="como-ler" data-group="intro">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--conceito">Guia</span></div>
    <h1 class="slide__title">Como ler este documento</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">Esta é a <strong>minuta de requisitos para validação</strong> do domínio Catálogo &amp; Produtos. Linguagem de negócio; IDs RF/RN para rastreio. Ainda não substitui aprovação formal da MTI.</p>
"""
            + tbl(
                "Estrutura",
                ["Parte", "O que responde"],
                [
                    ["Negócio e configuração", "Por que existe, tipos 1/2/3, quem configura o quê e em que ordem"],
                    ["Fluxo operacional", "Passo a passo MTI ↔ Parceiro ↔ Cliente; estados de fluxo = propostos"],
                    ["Classes e cadastros", "Cada classe: uso, campos, RF, RN, ações e validações"],
                    ["Portais e backoffice", "Requisitos por canal (Parceiro, Cliente, MTI)"],
                    ["Catálogo RF/RN + aceite", "Lista consolidada, critérios de aceite e glossário"],
                ],
            )
            + tbl(
                "Origem do requisito (legenda)",
                ["Marca", "Significado"],
                [
                    ["Confirmado (Discovery)", "Fala explícita na reunião 08/07/2026"],
                    ["Protótipo", "Presente em forms/portais; validar com MTI"],
                    ["Proposto", "Workflow/UI candidata — não fechada na Discovery"],
                    ["QA / teste", "Critério de verificação; não é regra de negócio"],
                ],
            )
            + """
  <div class="callout">Não usa jargão de plataforma. “Classe” = cadastro de negócio. “Status do fluxo” (proposto) = andamento portal↔MTI — distinto do status do objeto (Ativo / Homologado / Paralisado).</div>
</section>""",
        )
    )

    s.append(
        (
            "intro",
            story(
                "objetivo",
                "intro",
                "conceito",
                "Objetivo e escopo",
                "A MTI precisa cadastrar, versionar, homologar e disponibilizar catálogos/produtos para contratação nos modelos Tipo 1, 2 e 3 (CGS), com participação do parceiro e consumo pelo cliente.",
                "Conjunto de cadastros, regras e fluxos do <strong>cardápio comercial</strong>: listas → parceria/solução → catálogo/produtos → parecer → publicação → apostila → consumo. Na Discovery foi informado vínculo com a Lei 14.133 e orientação da SGDI — base normativa pendente de validação jurídica.",
                "<strong>Fase de configuração (priorizar agora):</strong> cadastros, CSV, parecer, versão, fator, portais.<br/><strong>Fase de consumo (Discovery/proposta):</strong> objeto no contrato, apostila, demanda/orçamento/OS com snapshot — manter regras confirmadas; fluxos detalhados ainda em modelagem.",
                [
                    "<strong>RF-ESC-01:</strong> Cobrir backoffice MTI, Portal do Parceiro e Portal do Cliente.",
                    "<strong>RF-ESC-02:</strong> Implementar as classes do protótipo (listas, Parceria, Solução, Catálogo, Universal, Produto, Dados de Parceria) — origem protótipo.",
                    "<strong>RF-ESC-03:</strong> Espelhar status do fluxo entre portal do parceiro e análise MTI — proposto/protótipo.",
                    "<strong>RF-ESC-04:</strong> Preparar vínculo com contrato/OS (versão + apostila + snapshot) sem inventar fluxo paralelo.",
                ],
                [
                    "<strong>RN-ESC-01:</strong> Parceiro não publica em produção nem cria versão contratual — proposto (alinhado à governança MTI).",
                    "<strong>RN-ESC-02:</strong> Cliente nunca cadastra catálogo/produto — proposto (cliente = consumidor na Discovery).",
                    "<strong>RN-ESC-03:</strong> Cadastro de produto originado do parceiro exige validação/parecer da MTI.",
                ],
            ),
        )
    )

    # --- negocio ---
    s.append(
        (
            "negocio",
            story(
                "tipos",
                "negocio",
                "conceito",
                "Três formas de contratar (Tipos 1, 2 e 3)",
                "A contratação de TI não se resume a “um item = um preço”. Na Discovery foi informado que o modelo se relaciona à Lei 14.133 e à orientação da SGDI (base normativa pendente de validação).",
                "Três metodologias coexistindo na MTI. Flags Universal / Individualizado e a métrica definem elegibilidade do produto; o <strong>tipo de contratação decorre do objeto definido no contrato</strong> (não de uma escolha isolada no cadastro).",
                "No cadastro, o produto carrega flags e (quando aplicável) fator. No contrato, seleciona-se a fonte/objeto (específico, catálogo Tipo 2 ou créditos Tipo 3). Quem opera a tela de contrato deve ser validado na modelagem F3.",
                [
                    "<strong>RF-TIPO-01:</strong> Manter no produto os indicadores Universal e Individualizado (independentes).",
                    "<strong>RF-TIPO-02:</strong> Exigir métrica em todo produto (lista cadastrada).",
                    "<strong>RF-TIPO-03:</strong> Quando Universal=Sim e houver moeda do Tipo 3, calcular/exibir fator de conversão.",
                ],
                [
                    "<strong>RN-TIPO-01:</strong> Tipo 1 — direito só ao item contratado.",
                    "<strong>RN-TIPO-02:</strong> Tipo 2 — saldo em moeda (USN/UST/HST) consome itens do catálogo na mesma métrica.",
                    "<strong>RN-TIPO-03:</strong> Tipo 3 (CGS) — créditos de TI e/ou Serviço dão acesso a produtos ativos em métricas universais.",
                    "<strong>RN-TIPO-04:</strong> Tipo 3 só se aplica a parcerias/produtos classificados em métricas universais (USN/UST/HST) — elegibilidade do “Tipo 2”; não é pré-condição contratual genérica.",
                    "<strong>RN-TIPO-05:</strong> Produto só Individualizado (Universal=Não) não entra em fator do Tipo 3.",
                    "<strong>RN-TIPO-06:</strong> A forma de contratação decorre do objeto contratado e das regras de elegibilidade (não “a MTI escolhe o tipo” no cadastro).",
                ],
                table=(
                    "Resumo dos tipos",
                    ["Tipo", "O que se contrata", "O que se consome"],
                    [
                        ["1", "Produto/licença específica", "Somente aquele item"],
                        ["2", "Objeto-moeda ligado a um catálogo", "Itens do catálogo na métrica"],
                        ["3 · CGS", "MTI Créditos de TI e/ou Serviço", "Produtos ativos universais MTI (com fator)"],
                    ],
                ),
            ),
        )
    )

    s.append(
        (
            "negocio",
            story(
                "metricas",
                "negocio",
                "conceito",
                "Métricas universais (USN, UST, HST)",
                "Sem métrica padronizada não dá para montar saldo de contrato nem converter itens no Tipo 3.",
                "Unidades de medida comerciais. Três universais em uso; outras podem ser cadastradas, mas o processamento Tipo 2/3 foca nas universais do contrato.",
                "MTI cadastra a lista. Todo produto escolhe uma. No Tipo 3, o fator usa a moeda universal correspondente (licença vs serviço).",
                [
                    "<strong>RF-MET-01:</strong> Criar, editar e listar métricas (cadastro parametrizável: sigla + descrição).",
                    "<strong>RF-MET-02:</strong> Produto referencia métrica cadastrada (não texto livre).",
                ],
                [
                    "<strong>RN-MET-01:</strong> USN → licenciamento software/IaaS; no Tipo 3 fator tipicamente 1.",
                    "<strong>RN-MET-02:</strong> UST → serviço técnico; não linear com hora (complexidade do time).",
                    "<strong>RN-MET-03:</strong> HST → hora de serviço técnico, com equivalência a hora de profissional identificável.",
                    "<strong>RN-MET-04:</strong> “Horas” legadas migram para HST (plano de migração a confirmar).",
                ],
            ),
        )
    )

    s.append(
        (
            "negocio",
            """
<section class="slide" id="papeis" data-group="negocio">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--conceito">Papéis</span></div>
    <h1 class="slide__title">Quem faz o quê — três canais</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <div class="lanes">
    <div class="lane lane--mti"><div class="lane__h">MTI (backoffice)</div>
      <ol>
        <li>Listas básicas (métrica, grupo, cobrança…)</li>
        <li>Parceria e solução</li>
        <li>Catálogo universal</li>
        <li>Pode cadastrar catálogo/produto interno</li>
        <li>Analisa envios do parceiro</li>
        <li>Publica, versiona, paralisa</li>
        <li>Apostila versão no contrato</li>
      </ol>
    </div>
    <div class="lane lane--parc"><div class="lane__h">Parceiro (portal)</div>
      <ol>
        <li>Monta rascunho do seu catálogo</li>
        <li>Inclui produtos (manual ou CSV)</li>
        <li>Visão planilha / exporta</li>
        <li>Envia à MTI</li>
        <li>Corrige após ajuste</li>
        <li>Acompanha status espelhado</li>
        <li><strong>Não</strong> publica nem apostila</li>
      </ol>
    </div>
    <div class="lane lane--cli"><div class="lane__h">Cliente (portal)</div>
      <ol>
        <li>Vê só versão apostilada</li>
        <li>Consulta produtos liberados</li>
        <li>Cotação → demanda</li>
        <li>Recebe/aceita orçamento</li>
        <li>Autoriza → OS</li>
        <li><strong>Não</strong> cadastra catálogo</li>
      </ol>
    </div>
  </div>
"""
            + tbl(
                "Matriz de permissões",
                ["Ação", "MTI", "Parceiro", "Cliente"],
                [
                    ["Cadastrar listas / parceria / universal", "Sim", "Não", "Não"],
                    ["Criar/editar rascunho catálogo/produto", "Sim", "Sim (sua parceria)", "Não"],
                    ["Importar/exportar CSV", "Sim", "Sim", "Não"],
                    ["Enviar para análise", "Interno", "Sim", "Não"],
                    ["Aprovar / ajuste / reprovar", "Sim", "Não", "Não"],
                    ["Publicar em produção", "Sim", "Não", "Não"],
                    ["Criar nova versão", "Sim", "Não*", "Não"],
                    ["Apostilar no contrato", "Sim", "Não", "Não"],
                    ["Consultar catálogo contratado", "Sim", "Limitado", "Sim (apostilado)"],
                    ["Cotação / OS", "Apoia", "Pode orçar (fluxo)", "Sim"],
                ],
            )
            + """
  <p class="lead" style="margin-top:8px">* Parceiro pode abrir novo rascunho após reprovação/paralisação; a versão contratual é governança MTI.</p>
</section>""",
        )
    )

    s.append(
        (
            "negocio",
            """
<section class="slide" id="config-ordem" data-group="negocio">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--metodo">Configuração</span></div>
    <h1 class="slide__title">Como configurar — ordem recomendada</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">A configuração no backoffice deve respeitar dependências. Sem listas e parceria, o produto não fecha.</p>
  <ol class="steps">
    <li><b>Listas básicas (MTI)</b> — Métrica, Tipo de Cobrança, Categoria, Grupo, Modelo de Venda.</li>
    <li><b>Organização parceiro (já Fase 1)</b> — CNPJ homologado.</li>
    <li><b>Parceria</b> — vinculada à Organização; N parcerias no mesmo CNPJ permitidas.</li>
    <li><b>Solução</b> — oferta da parceria; fabricante em texto + documentos de apoio.</li>
    <li><b>Catálogo</b> — identificador + versão; cobrança; Unidade DTIC; parceria.</li>
    <li><b>Produtos</b> — página única; produto referencia um catálogo (cardinalidade 1 catálogo por produto — candidata do protótipo; formalizar); CSV para volume. <em>Primeiro carregamento de produtos na parceria: parceira + validação MTI.</em></li>
    <li><b>Dados de Parceria por Produto</b> — custo, markup e distribuição % (parceiro + MTI = 100).</li>
    <li><b>Catálogo Universal</b> — agrega catálogos elegíveis ao Tipo 3.</li>
    <li><b>Parecer / Publicar / Nova versão</b> — governança MTI; depois apostila no contrato.</li>
  </ol>
  <div class="callout callout--warn">Markup <strong>não</strong> fica no cadastro do Produto. Valor unitário do produto é o preço de comercialização; o markup oficial fica em Dados de Parceria.</div>
</section>""",
        )
    )

    # --- fluxo ---
    s.append(
        (
            "fluxo",
            """
<section class="slide" id="fluxo-e2e" data-group="fluxo">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--fluxo">Fluxo</span></div>
    <h1 class="slide__title">Fluxo ponta a ponta</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <ol class="steps">
    <li><b>Configurar base (MTI)</b> — listas, parceria, solução.</li>
    <li><b>Montar catálogo</b> — MTI no backoffice <em>ou</em> parceiro no portal (rascunho).</li>
    <li><b>Incluir produtos</b> — manual, planilha ou CSV (template oficial).</li>
    <li><b>Definir markup</b> — Dados de Parceria (quando aplicável).</li>
    <li><b>Enviar à MTI</b> — status → Aguardando análise; edição travada.</li>
    <li><b>Analisar</b> — Aprovar · Solicitar ajuste (com motivo) · Reprovar · Paralisar.</li>
    <li><b>Ajuste (loop)</b> — parceiro corrige → reenvia → volta à análise.</li>
    <li><b>Publicar</b> — após parecer favorável (transição Homologado→Publicado = proposta).</li>
    <li><b>Nova versão</b> — preserva a anterior; não sobrescreve (cópia automática = alternativa; CSV round-trip confirmado).</li>
    <li><b>Apostilar no contrato</b> — só então o cliente vê a versão no portal.</li>
    <li><b>Consumo</b> — demanda/orçamento/OS com snapshot (detalhe F3; serviço exige orçamento prévio).</li>
  </ol>
</section>""",
        )
    )

    s.append(
        (
            "fluxo",
            """
<section class="slide" id="fluxo-status" data-group="fluxo">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--fluxo">Status</span></div>
    <h1 class="slide__title">Status do fluxo (espelho portal ↔ MTI)</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">Estados <strong>propostos</strong> (protótipo/portais) para o ciclo portal↔análise — <em>não fechados como máquina oficial na Discovery</em>. Distintos do status do objeto (Ativo / Homologado / Paralisado no cadastro).</p>
  <div class="status-row">
    <span class="st st--mute">Rascunho (parceiro)</span>
    <span>→</span>
    <span class="st st--wait">Aguardando análise MTI</span>
    <span>→</span>
    <span class="st st--warn">Ajuste solicitado</span>
    <span>ou</span>
    <span class="st st--ok">Homologado</span>
    <span>→</span>
    <span class="st st--ok">Ativo (publicado)</span>
  </div>
  <div class="status-row">
    <span class="st st--bad">Reprovado</span>
    <span class="st st--mute">Paralisado</span>
    <span style="font-size:12px;color:#555">— após estes, parceiro pode abrir novo rascunho (proposto)</span>
  </div>
"""
            + tbl(
                "Transições propostas (validar com MTI)",
                ["De", "Ação", "Para", "Validação / origem"],
                [
                    ["Rascunho / Ajuste", "Enviar à MTI", "Aguardando", "Proposto · ≥1 produto; trava edição"],
                    ["Aguardando", "Solicitar ajuste", "Ajuste", "Discovery: aprovar/ajuste · justificativa = proposto"],
                    ["Aguardando", "Aprovar", "Homologado", "Proposto"],
                    ["Homologado", "Publicar", "Ativo (publicado)", "Proposto — transição Homologado→Publicado não fechada na Discovery"],
                    ["Aguardando", "Reprovar", "Reprovado", "Proposto"],
                    ["Qualquer elegível", "Paralisar", "Paralisado", "Status citado na Discovery; ação/transição = proposto"],
                    ["Reprovado / Paralisado", "Novo rascunho", "Rascunho", "Proposto"],
                ],
            )
            + """
  <div class="callout callout--warn">Não misturar status do <strong>objeto</strong> com status do <strong>fluxo</strong>. Até validação, tratar a tabela acima como candidatos.</div>
  <div class="callout">Edição pelo parceiro (proposto): somente em <strong>Rascunho</strong> ou <strong>Ajuste solicitado</strong>.</div>
</section>""",
        )
    )

    s.append(
        (
            "fluxo",
            story(
                "fluxo-acoes",
                "fluxo",
                "fluxo",
                "Ações do fluxo — resumo operacional",
                "Cada etapa precisa de ação clara e validação, para o parceiro não “furar” a governança e o cliente não ver versão errada.",
                "Conjunto de botões/métodos do protótipo (Catálogo, Produto, Análise, Portais) alinhados às regras do Discovery.",
                "No dia a dia: parceiro opera no portal; analista MTI no backoffice (análise + publicar + apostilar); cliente só consome no portal dele.",
                [
                    "<strong>RF-FLUX-01:</strong> Registrar histórico de mudanças de status — proposto/protótipo.",
                    "<strong>RF-FLUX-02:</strong> Exibir justificativa da MTI no portal em Ajuste / Reprovado / Paralisado — proposto.",
                    "<strong>RF-FLUX-03:</strong> Publicar após parecer favorável — proposto (transição Homologado→Publicado a validar).",
                    "<strong>RF-FLUX-04:</strong> Apostila libera visão do cliente sem alterar o conteúdo já versionado — confirmado (Discovery).",
                ],
                [
                    "<strong>RN-FLUX-01:</strong> Produtos cadastrados pela parceira exigem validação/parecer da MTI — confirmado.",
                    "<strong>RN-FLUX-02:</strong> Ajuste/reprovação com justificativa — proposto (aprovar/ajuste citados; motivo obrigatório a fechar).",
                    "<strong>RN-FLUX-03:</strong> Publicação após homologação — proposto.",
                    "<strong>RN-VER-03:</strong> Cliente vê nova versão só após apostilamento — confirmado.",
                ],
                acoes=[
                    "Parceiro: Salvar rascunho · Template CSV · Importar CSV · Exportar CSV/PDF · Visão planilha · Enviar à MTI",
                    "MTI análise: Aprovar · Solicitar ajuste · Reprovar · Paralisar · Confirmar decisão (proposto)",
                    "MTI catálogo: Criar nova versão · Publicar · Apostilar no contrato",
                    "Cliente: Consultar · Demanda/orçamento · OS (fluxos detalhados em modelagem F3)",
                ],
                validacoes=[
                    "Enviar: ao menos 1 produto — proposto",
                    "Ajuste/Reprovar: justificativa — proposto",
                    "Publicar após parecer — proposto",
                    "Fator: Universal=Sim + moeda; senão oculto/nulo — conceito confirmado; UI proposta",
                    "Distribuição % = 100 — origem protótipo (Dados de Parceria)",
                    "CSV: template round-trip — confirmado; rejeição por linha — a especificar",
                ],
            ),
        )
    )

    # --- classes ---
    classes = [
        dict(
            sid="cls-metrica",
            nome="Métrica",
            nec="Padronizar a unidade comercial dos produtos e do saldo contratual.",
            oque="Cadastro simples de sigla (USN, UST, HST…) e descrição.",
            usa="MTI mantém a lista. Produto e contratos referenciam. Base do Tipo 2/3.",
            fields=[
                ["Identificador (sigla)", "Texto", "Sim", "USN, UST, HST, UST-IA…"],
                ["Descrição", "Texto", "Não", "Uso típico e comportamento"],
            ],
            rf=[
                "<strong>RF-MET-01:</strong> Criar, editar e listar métricas (parametrizável).",
                "<strong>RF-MET-02:</strong> Produto referencia métrica cadastrada (não texto livre).",
                "<strong>RF-MET-03:</strong> Sigla única — proposto/integridade.",
                "<strong>RF-MET-04:</strong> Impedir exclusão se usada em produto homologado — proposto/integridade.",
            ],
            rn=[
                "<strong>RN-MET-01…04:</strong> ver seção Métricas universais (confirmadas na Discovery; siglas a conferir no áudio/oficial).",
            ],
            acoes=["Criar", "Editar", "Inativar (se permitido)"],
            vals=["Sigla obrigatória e única", "Não excluir se referenciada em item homologado"],
        ),
        dict(
            sid="cls-cobranca",
            nome="Tipo de Cobrança",
            nec="Informar como o item/catálogo é cobrado (sob demanda, mensal, anual…).",
            oque="Modelo + recorrência.",
            usa="Obrigatório em Catálogo e Produto. Não precisa aparecer no card do produto.",
            fields=[
                ["Modelo", "Texto", "Sim", "Sob Demanda, Mensal, Anual, Homologação, Pro-Rata…"],
                ["Recorrência", "Texto", "Não", "Mensal, Por Execução…"],
            ],
            rf=[
                "<strong>RF-COB-01:</strong> CRUD da lista.",
                "<strong>RF-COB-02:</strong> Obrigatório em Catálogo e Produto.",
                "<strong>RF-COB-03:</strong> Não excluir se referenciado em item homologado.",
            ],
            rn=["<strong>RN-COB-01:</strong> Cobrança no formulário; não destacar no card da lista de produto."],
            acoes=["Criar", "Editar"],
            vals=["Modelo obrigatório"],
        ),
        dict(
            sid="cls-categoria",
            nome="Categoria de Serviços",
            nec="Classificar produtos para filtro e organização (ex.: Cloud, Desenvolvimento).",
            oque="Lista parametrizável (identificador + descrição).",
            usa="Opcional no Produto; filtro na visão planilha.",
            fields=[
                ["Identificador", "Texto", "Sim", "Ex.: Cloud / Infra"],
                ["Descrição", "Texto", "Não", ""],
            ],
            rf=[
                "<strong>RF-CATG-01:</strong> CRUD.",
                "<strong>RF-CATG-02:</strong> Vincular opcionalmente ao Produto.",
                "<strong>RF-CATG-03:</strong> Usar como filtro na planilha.",
                "<strong>RF-CATG-04:</strong> Não excluir se usada em produto homologado.",
            ],
            rn=["<strong>RN-CATG-01:</strong> Não excluir categoria referenciada homologada."],
            acoes=["Criar", "Editar"],
            vals=["Identificador obrigatório"],
        ),
        dict(
            sid="cls-grupo",
            nome="Grupo",
            nec="Agrupar produtos para leitura rápida na lista (destaque no card).",
            oque="Lista parametrizável.",
            usa="Obrigatório no Produto; aparece no card junto com Nome, Tipo e status.",
            fields=[
                ["Identificador", "Texto", "Sim", "Ex.: MTI Host, MTI Simplifica"],
                ["Descrição", "Texto", "Não", ""],
            ],
            rf=[
                "<strong>RF-GRP-01:</strong> CRUD.",
                "<strong>RF-GRP-02:</strong> Obrigatório no Produto.",
                "<strong>RF-GRP-03:</strong> Destacar no card/lista.",
                "<strong>RF-GRP-04:</strong> Filtrar na visão planilha.",
            ],
            rn=["<strong>RN-GRP-01:</strong> Grupo obrigatório e visível no card."],
            acoes=["Criar", "Editar"],
            vals=["Identificador obrigatório"],
        ),
        dict(
            sid="cls-modelo",
            nome="Modelo de Venda",
            nec="Indicar o modelo comercial do produto (por licença, serviço, homologação).",
            oque="Lista parametrizável.",
            usa="Obrigatório no Produto.",
            fields=[
                ["Identificador", "Texto", "Sim", "Por Licença, Serviço, Homologação…"],
                ["Descrição", "Texto", "Não", ""],
            ],
            rf=[
                "<strong>RF-MV-01:</strong> CRUD.",
                "<strong>RF-MV-02:</strong> Obrigatório no Produto.",
            ],
            rn=["<strong>RN-MV-01:</strong> Modelo de venda obrigatório no produto."],
            acoes=["Criar", "Editar"],
            vals=["Identificador obrigatório"],
        ),
        dict(
            sid="cls-parceria",
            nome="Parceria",
            nec="Separar o acordo comercial da organização (CNPJ). Mesma empresa pode ter várias parcerias.",
            oque="Classe distinta de Organização. Referencia o parceiro (UO/organização) e as soluções.",
            usa="O <strong>primeiro cadastro da entidade Parceria</strong> é feito pela MTI. Define o escopo do Portal do Parceiro. (Não confundir com o primeiro carregamento de <em>produtos</em>, feito pela parceira e validado pela MTI.)",
            fields=[
                ["Identificador", "Texto", "Sim", "Ex.: MTI SIMPLIFICA"],
                ["Descrição", "HTML", "Não", ""],
                ["Parceiro", "Ref. Organização", "Sim", "CNPJ da empresa"],
                ["Status", "Lista", "Sim", "Ativa · Concluída · Homologada · Paralisada"],
                ["Soluções", "Ref. múltipla", "Sim", "Soluções da parceria"],
                ["Observações", "Texto", "Não", ""],
            ],
            rf=[
                "<strong>RF-PAR-01:</strong> Criar/editar no backoffice MTI.",
                "<strong>RF-PAR-02:</strong> Vincular a Organização existente.",
                "<strong>RF-PAR-03:</strong> Permitir N parcerias no mesmo CNPJ.",
                "<strong>RF-PAR-04:</strong> Controlar status Ativa/Homologada/Paralisada.",
                "<strong>RF-PAR-05:</strong> Associar soluções.",
                "<strong>RF-PAR-06:</strong> Restringir portal do parceiro ao escopo da parceria — proposto/protótipo.",
            ],
            rn=[
                "<strong>RN-PAR-01:</strong> O primeiro cadastro da entidade <em>Parceria</em> é realizado pela MTI.",
                "<strong>RN-PAR-02:</strong> Parceria ≠ Organização.",
                "<strong>RN-PAR-03:</strong> Alterações sensíveis posteriores pedem autorização MTI — candidata (campos/fluxo a especificar).",
                "<strong>RN-PAR-04:</strong> Paralisada bloqueia novos produtos na fila — proposto (não fechado na Discovery).",
            ],
            acoes=["Criar", "Editar", "Homologar", "Paralisar"],
            vals=["Parceiro obrigatório", "Status obrigatório"],
        ),
        dict(
            sid="cls-solucao",
            nome="Solução",
            nec="Descrever a oferta da parceria (ex.: MTI Simplifica) com fabricante e documentos.",
            oque="Cadastro ligado à parceria. Fabricante: <strong>nome e contato em texto</strong> (direção da Discovery; não formalizar ausência definitiva de classe Fabricante até confirmação).",
            usa="Apoia catálogo/demanda; documentos (papel timbrado, Gartner, autorizações) — tipos/cardinalidade a detalhar.",
            fields=[
                ["Identificador", "Texto", "Sim", ""],
                ["Parceria", "Ref.", "Não*", "Opcional na fala; solução própria MTI = a confirmar"],
                ["Descrição", "HTML", "Não", ""],
                ["Fabricante — nome", "Texto", "Não", "Texto livre"],
                ["Fabricante — contato", "Texto", "Não", ""],
                ["Documentos de apoio", "Arquivo", "Não", "Múltiplos — regras a definir"],
                ["Observações", "Texto", "Não", ""],
            ],
            rf=[
                "<strong>RF-SOL-01:</strong> Criar/editar solução vinculada à parceria.",
                "<strong>RF-SOL-02:</strong> Fabricante em texto (nome/contato) — provisório.",
                "<strong>RF-SOL-03:</strong> Anexar documentos de apoio.",
                "<strong>RF-SOL-04:</strong> Listar soluções no contexto do catálogo/demanda — parcial.",
            ],
            rn=[
                "<strong>RN-SOL-01:</strong> Preferir campos texto de fabricante na Solução (sem cadastro completo de fabricante) — provisório até confirmação formal.",
                "<strong>RN-SOL-02:</strong> Solução vinculada à parceria (quando de parceiro).",
            ],
            acoes=["Criar", "Editar", "Anexar documentos"],
            vals=["Identificador obrigatório"],
        ),
        dict(
            sid="cls-catalogo",
            nome="Catálogo",
            nec="Empacotar produtos versionados para contratação e consumo.",
            oque="Cabeçalho do cardápio: identificador, versão, cobrança, responsáveis, parceria, status do objeto + status do fluxo.",
            usa="Criado pela MTI ou pelo parceiro (rascunho). Importa produtos; envia à análise; MTI publica e versiona. Versão também é atributo do contrato.",
            fields=[
                ["Identificador do catálogo", "Texto", "Sim", "Ex.: MTI HOST"],
                ["Versão do catálogo", "Texto", "Sim", "Ex.: 1.5 — atributo do contrato"],
                ["Versão anterior", "Texto RO", "Não", "Auto ao criar nova versão"],
                ["Produtos", "Ref. múltipla", "Não", "Preferir vínculo inverso + CSV"],
                ["Preencher códigos manualmente?", "Sim/Não", "Sim", "Default Não"],
                ["Códigos SIAG/Protheus (cat. e univ.)", "Texto", "Cond.", "Visíveis se manual=Sim"],
                ["Cobrança", "Ref.", "Sim", "Tipo de Cobrança"],
                ["Valor unitário", "Número", "Sim", "Pacote Tipo 2; pode ser 0"],
                ["Focal vendas / pós-vendas", "Ref. Pessoa", "Não", ""],
                ["Unidade DTIC", "Ref. Org", "Sim", "UO MTI responsável"],
                ["Link catálogo parceria", "URL", "Não", ""],
                ["Parceria", "Ref.", "Não", "Classe Parceria"],
                ["Status do catálogo", "Lista", "Sim", "Ativo · Concluído · Homologado · Paralisado"],
                ["Status do fluxo", "Lista", "Sist.", "Espelho portal↔MTI"],
                ["Observações", "Texto", "Não", ""],
            ],
            rf=[
                "<strong>RF-CTL-01:</strong> Criar/editar rascunho com versão.",
                "<strong>RF-CTL-02:</strong> Importar produtos via CSV (template).",
                "<strong>RF-CTL-03:</strong> Exportar CSV e PDF.",
                "<strong>RF-CTL-04:</strong> Visão planilha com filtros e seleção.",
                "<strong>RF-CTL-05:</strong> Enviar à análise MTI.",
                "<strong>RF-CTL-06:</strong> Aprovar / ajuste / reprovar.",
                "<strong>RF-CTL-07:</strong> Publicar após homologar — proposto.",
                "<strong>RF-CTL-08:</strong> Criar nova versão sem sobrescrever (cópia automática de produtos = alternativa; CSV round-trip confirmado).",
                "<strong>RF-CTL-09:</strong> Paralisar — proposto.",
                "<strong>RF-CTL-10:</strong> Espelhar status no Portal do Parceiro — proposto/protótipo.",
            ],
            rn=[
                "<strong>RN-VER-01:</strong> Versão é atributo do contrato.",
                "<strong>RN-VER-02:</strong> Nova versão não sobrescreve a anterior.",
                "<strong>RN-VER-03:</strong> Cliente vê nova versão só após apostila (ator do apostilamento a confirmar).",
                "<strong>RN-CTL-01:</strong> Versão publicada/em uso não se edita no lugar — cria-se nova.",
                "<strong>RN-CSV-01:</strong> Template CSV round-trip.",
            ],
            acoes=[
                "Criar nova versão",
                "Importar CSV · Exportar CSV · Exportar PDF · Visão planilha",
                "Enviar para análise · Aprovar · Solicitar ajuste · Publicar (homologar)",
            ],
            vals=[
                "Identificador e versão obrigatórios",
                "Unidade DTIC e cobrança obrigatórias",
                "Códigos SIAG/Protheus só se Preencher manualmente=Sim",
                "Enviar exige ≥1 produto",
            ],
        ),
        dict(
            sid="cls-universal",
            nome="Catálogo Universal e objetos contratados",
            nec="Agregar catálogos elegíveis ao Tipo 3 (CGS) e manter objetos de contratação separados dos catálogos.",
            oque="Camada que referencia catálogos. Na Discovery: <strong>objetos específicos e objetos universais ficam separados dos catálogos</strong>; universais apontam para seus catálogos respectivos no cadastro do contrato.",
            usa="MTI mantém. No contrato Tipo 3, a seleção da fonte (específico / universal / catálogo) determina o que o cliente pode consumir — não reduzir Universal só a uma lista de catálogos.",
            fields=[
                ["Identificador", "Texto", "Sim", "Ex.: Catálogo Universal MTI"],
                ["Código SIAG / Protheus", "Texto", "Não", ""],
                ["Status", "Lista", "Sim", "Ativo · Concluído · Homologado · Paralisado"],
                ["Catálogos", "Ref. múltipla", "Sim", "Camada vinculada"],
            ],
            rf=[
                "<strong>RF-UNI-01:</strong> Criar/editar registro de Catálogo Universal.",
                "<strong>RF-UNI-02:</strong> Vincular catálogos — ativo = proposto.",
                "<strong>RF-UNI-03:</strong> Publicar/paralisar — proposto.",
                "<strong>RF-UNI-04:</strong> Bloquear vínculo de catálogo paralisado em novos contratos — proposto.",
                "<strong>RF-UNI-05:</strong> No contrato, permitir selecionar fonte: objetos específicos, objetos universais ou catálogo (Discovery F3).",
            ],
            rn=[
                "<strong>RN-UNI-01:</strong> Preferir catálogos ativos em novos vínculos — proposto.",
                "<strong>RN-UNI-02:</strong> Objetos contratados (específicos/universais) são mantidos separados dos catálogos; universais apontam para seus catálogos.",
                "<strong>RN-TIPO-04:</strong> (mesmo ID) Elegibilidade Tipo 3 = métricas universais USN/UST/HST — ver seção Tipos.",
            ],
            acoes=["Vincular catálogos", "Publicar"],
            vals=["Pelo menos um catálogo vinculado — proposto", "Não vincular paralisado — proposto"],
        ),
        dict(
            sid="cls-produto",
            nome="Produto",
            nec="Item comercializável (licença ou serviço) dentro de um catálogo.",
            oque="Cadastro em <strong>página única</strong>. Card da lista: na Discovery, destacar <strong>nome + tipo</strong> e status como tag; tirar cobrança/métrica do card. Grupo no card = candidata (não fechada).",
            usa="Base do CSV, do fator Tipo 3, da planilha e do consumo no contrato/OS.",
            fields=[
                ["Nome / Identificador", "Texto", "Cand.", "Destaque no card"],
                ["Part Number (SKU)", "Texto", "Cand.", "Ex.: Q501011"],
                ["Tipo", "Licença|Serviço", "Cand.", "No card"],
                ["Grupo", "Ref.", "Cand.", "Campo citado; no card = a confirmar"],
                ["Categoria", "Ref.", "Não", "Origem protótipo — não na Discovery"],
                ["Status do produto", "Lista", "Cand.", "Tag verde/vermelha"],
                ["Universal", "Sim/Não", "Sim", "Independente"],
                ["Individualizado", "Sim/Não", "Sim", "Independente"],
                ["Preencher códigos manualmente?", "Sim/Não", "Cand.", "Default Não"],
                ["Códigos SIAG/Protheus (6)", "Texto", "Cond.", "Nomes oficiais a confirmar"],
                ["Modelo de venda", "Ref.", "Cand.", ""],
                ["Métrica", "Ref.", "Sim", "Não no card"],
                ["Cobrança", "Ref.", "Cand.", "Não no card"],
                ["Valor unitário (R$)", "Número", "Cand.", "Base do fator"],
                ["Valor moeda universal", "Número", "Cond.", "Se Universal=Sim (Tipo 3)"],
                ["Fator de conversão", "Número RO", "Cond.", "Cálculo automático; UI Recalcular = protótipo"],
                ["Complexidade / coef. / peso / qtde", "Cond.", "Não", "Conforme produto; frequente em serviço — não exclusivo fechado"],
                ["Focal vendas / pós", "Ref. Pessoa", "Não", "Mesma página"],
                ["Unidade DTIC", "Ref.", "Cand.", ""],
                ["Parceria", "Ref.", "Não", ""],
                ["Catálogo", "Ref.", "Cand.", "1 catálogo — candidata do protótipo"],
                ["Observações", "Texto/HTML", "Não", ""],
            ],
            rf=[
                "<strong>RF-PROD-01:</strong> Página única de cadastro.",
                "<strong>RF-PROD-02:</strong> Campos do inventário Discovery/protótipo — obrigatoriedade por campo a formalizar (não assumir todos Sim).",
                "<strong>RF-PROD-03:</strong> Categoria opcional — origem protótipo.",
                "<strong>RF-PROD-04:</strong> Calcular/exibir fator se Universal=Sim; recálculo/exibição esperado (botão = UX protótipo).",
                "<strong>RF-PROD-05:</strong> Complexidade/peso/qtde conforme o produto (uso frequente em serviço) — não afirmar exclusividade até validar.",
                "<strong>RF-PROD-06:</strong> CSV import/export e PDF.",
                "<strong>RF-PROD-07:</strong> Enviar / aprovar / ajuste / inativar — parcial/proposto.",
                "<strong>RF-PROD-08:</strong> Card: nome + tipo + tag de status; sem cobrança/métrica. Grupo no card = candidata.",
                "<strong>RF-PROD-09:</strong> Observações livres.",
            ],
            rn=[
                "<strong>RN-P-01:</strong> Produto referencia um catálogo (modelo 1 catálogo por produto = candidata do protótipo; formalizar cardinalidade).",
                "<strong>RN-P-02:</strong> Universal e Individualizado independentes.",
                "<strong>RN-P-03:</strong> Universal=Não → sem fator Tipo 3.",
                "<strong>RN-P-04:</strong> Fora de métricas universais → sem fator.",
                "<strong>RN-P-05:</strong> Markup oficial em Dados de Parceria (protótipo) — não misturar com valor unitário do Produto; localização final a confirmar se divergir da Discovery.",
                "<strong>RN-FAT-01:</strong> Fator calculado a partir do valor unitário e da moeda universal (fórmula oficial pendente de áudio/planilha).",
                "<strong>RN-FAT-02:</strong> USN no Tipo 3: relação tipicamente 1:1.",
                "<strong>RN-FAT-03:</strong> Em orçamento/OS Tipo 3, o consumo usa moeda × fator × quantidade [× complexidade] [× peso] quando aplicáveis.",
                "<strong>RN-CX-01:</strong> Complexidade texto ou coeficiente, conforme parceria.",
            ],
            acoes=[
                "Recalcular/exibir fator (UX protótipo)",
                "Importar CSV · Exportar CSV · Exportar PDF",
                "Enviar para análise · Aprovar · Solicitar ajuste · Inativar — proposto",
            ],
            vals=[
                "Obrigatoriedade campo a campo — dicionário a formalizar",
                "Complexidade conforme produto (não “somente Serviço” fechado)",
                "Fator calculado / somente leitura",
                "Códigos manuais sob flag — parcial",
            ],
        ),
        dict(
            sid="cls-dados-parceria",
            nome="Dados de Parceria por Produto",
            nec="Guardar custo, markup e repartição financeira sem misturar com o preço de venda do produto (classe do protótipo).",
            oque="Cadastro por combinação parceria/solução/produto (vigência, custo, markup, %). <strong>Origem: protótipo</strong> — não apresentar como regra fechada só da Discovery.",
            usa="MTI e/ou parceiro (conforme governança) informam distribuição. Validação soma 100% = proposta do protótipo.",
            fields=[
                ["Parceria", "Ref.", "Não", "Protótipo"],
                ["Solução", "Ref.", "Sim", "Protótipo"],
                ["Vigência", "Texto", "Sim", "Protótipo"],
                ["Custo do parceiro", "Número", "Sim", "Protótipo"],
                ["Markup", "Número", "Sim", "Protótipo — localização final a confirmar"],
                ["Distribuição parceiro %", "Número", "Sim", "Protótipo"],
                ["Distribuição MTI %", "Número", "Sim", "Protótipo"],
            ],
            rf=[
                "<strong>RF-DP-01:</strong> Criar/editar por produto/solução — protótipo.",
                "<strong>RF-DP-02:</strong> Validar % parceiro + % MTI = 100 — protótipo.",
                "<strong>RF-DP-03:</strong> Não gravar markup no Produto — protótipo (confirmar vs Discovery).",
            ],
            rn=[
                "<strong>RN-DP-01:</strong> Soma das distribuições = 100% — protótipo.",
                "<strong>RN-P-05:</strong> Markup neste cadastro, não no Produto — protótipo.",
            ],
            acoes=["Criar", "Editar"],
            vals=["Soma % = 100", "Custo e markup obrigatórios"],
        ),
    ]

    s.append(
        (
            "classes",
            """
<section class="slide" id="cls-indice" data-group="classes">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--cadastro">Índice</span></div>
    <h1 class="slide__title">Classes do domínio Catálogo &amp; Produtos</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">Alinhadas ao protótipo <code>form-patlasv4-proto-cat-*</code>. Cada slide seguinte detalha uso, campos, RF, RN, ações e validações.</p>
"""
            + tbl(
                "Mapa de classes",
                ["#", "Classe", "Quem configura", "Depende de"],
                [
                    ["1", "Métrica", "MTI", "—"],
                    ["2", "Tipo de Cobrança", "MTI", "—"],
                    ["3", "Categoria de Serviços", "MTI", "—"],
                    ["4", "Grupo", "MTI", "—"],
                    ["5", "Modelo de Venda", "MTI", "—"],
                    ["6", "Parceria", "MTI", "Organização (F1)"],
                    ["7", "Solução", "MTI", "Parceria"],
                    ["8", "Catálogo", "MTI / Parceiro", "Listas + Parceria"],
                    ["9", "Produto", "MTI / Parceiro", "Catálogo + listas"],
                    ["10", "Dados de Parceria por Produto", "MTI (/parceiro)", "Produto + Solução"],
                    ["11", "Catálogo Universal / objetos", "MTI", "Catálogos + objetos contratados"],
                ],
            )
            + "</section>",
        )
    )

    for c in classes:
        s.append(
            (
                "classes",
                story(
                    c["sid"],
                    "classes",
                    "cadastro",
                    c["nome"],
                    c["nec"],
                    c["oque"],
                    c["usa"],
                    c["rf"],
                    c["rn"],
                    validacoes=c["vals"],
                    acoes=c["acoes"],
                    table=("Campos", ["Campo", "Tipo", "Obrig.", "Observação"], c["fields"]),
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
                "O parceiro precisa montar e enviar o catálogo sem acessar o backoffice da MTI, com status transparente.",
                "Canal exclusivo do parceiro para rascunho, CSV, planilha, envio e correção após ajuste.",
                "Home com KPIs → Meus catálogos → Detalhe (produtos) → Enviados/ajustes. Análise real é da MTI; o portal só espelha.",
                [
                    "<strong>RF-PARC-01:</strong> Salvar rascunho de catálogo e produtos da própria parceria.",
                    "<strong>RF-PARC-02:</strong> Incluir produtos manualmente ou por CSV (template oficial).",
                    "<strong>RF-PARC-03:</strong> Exportar CSV e PDF (completa, filtrada ou selecionada).",
                    "<strong>RF-PARC-04:</strong> Enviar à MTI (Aguardando; trava edição).",
                    "<strong>RF-PARC-05:</strong> Receber ajuste com motivo; corrigir e reenviar.",
                    "<strong>RF-PARC-06:</strong> Acompanhar status espelhado.",
                    "<strong>RF-PARC-07:</strong> Visão planilha com filtros e seleção em massa.",
                    "<strong>RF-PARC-08:</strong> Baixar template CSV oficial.",
                    "<strong>RF-PARC-09:</strong> Fila Enviados/ajustes por status.",
                    "<strong>RF-PARC-10:</strong> Justificativa MTI em destaque.",
                    "<strong>RF-PARC-11:</strong> Novo rascunho após Reprovado/Paralisado.",
                    "<strong>RF-PARC-12:</strong> Histórico de status no detalhe.",
                    "<strong>RF-PARC-13:</strong> Home com KPIs.",
                    "<strong>RF-PARC-14:</strong> Mensagem opcional ao analista no envio.",
                ],
                [
                    "<strong>RN-PARC-01:</strong> Parecer MTI obrigatório quando origem = portal.",
                    "<strong>RN-PARC-02:</strong> Ajuste exige justificativa visível.",
                    "<strong>RN-PARC-03:</strong> Só vê/edita catálogos da sua parceria.",
                    "<strong>RN-PARC-04:</strong> Edição só em Rascunho ou Ajuste.",
                    "<strong>RN-PARC-05:</strong> Enviar exige ≥1 produto.",
                    "<strong>RN-PARC-06:</strong> Publicar/versionar/apostilar não é ação do portal.",
                ],
                acoes=[
                    "Salvar rascunho · Importar CSV · Exportar CSV/PDF · Visão planilha · Enviar à MTI",
                ],
                validacoes=[
                    "podeEditar apenas Rascunho/Ajuste",
                    "podeEnviar apenas Rascunho/Ajuste com produtos",
                    "Import CSV só quando editável",
                ],
            ),
        )
    )

    s.append(
        (
            "parceiro",
            """
<section class="slide" id="pp-rf" data-group="parceiro">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--tela">Portal</span></div>
    <h1 class="slide__title">Portal do Parceiro — catálogo RF</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
"""
            + tbl(
                "Requisitos funcionais — Portal do Parceiro (consolidado)",
                ["ID", "Requisito", "Prioridade"],
                [
                    ["RF-PARC-01", "Salvar rascunho da própria parceria", "Alta"],
                    ["RF-PARC-02", "Incluir produtos manual ou CSV", "Alta"],
                    ["RF-PARC-03", "Exportar CSV/PDF", "Alta"],
                    ["RF-PARC-04", "Enviar à MTI e travar edição", "Alta"],
                    ["RF-PARC-05", "Corrigir após ajuste", "Alta"],
                    ["RF-PARC-06", "Status espelhado", "Alta"],
                    ["RF-PARC-07", "Visão planilha + filtros", "Alta"],
                    ["RF-PARC-08", "Template CSV", "Média"],
                    ["RF-PARC-09", "Fila enviados/ajustes", "Alta"],
                    ["RF-PARC-10", "Justificativa em destaque", "Alta"],
                    ["RF-PARC-11", "Novo rascunho pós-reprovação", "Média"],
                    ["RF-PARC-12", "Histórico de status", "Média"],
                    ["RF-PARC-13", "KPIs na home", "Baixa"],
                    ["RF-PARC-14", "Mensagem ao analista", "Baixa"],
                ],
            )
            + "</section>",
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
                "O cliente precisa consumir o catálogo contratado com segurança de versão, sem cadastrar produtos.",
                "Canal de consulta e solicitação. Cliente = <strong>somente pessoa jurídica</strong>; pessoas são responsáveis. Contrato pode distribuir saldo entre secretarias/unidades com segregação de acesso.",
                "Versão apostilada é a visível. Orçamento de <em>serviço</em> é prévio ao consumo. Fluxos detalhados de cotação/demanda/gestor no portal = proposta (protótipo), não fechados na Discovery.",
                [
                    "<strong>RF-CLI-01:</strong> Consultar catálogo da versão apostilada.",
                    "<strong>RF-CLI-02:</strong> Demandar via portal e/ou receber orçamento (proativo ou sob demanda) — estados a modelar.",
                    "<strong>RF-CLI-03:</strong> Distinguir abertura de OS, orçamento prévio e consumo: serviço exige orçamento antes do consumo; licenciamento pode ter orçamento dispensável; OS pode existir em cenários distintos (três modelos Discovery — F3).",
                    "<strong>RF-CLI-04:</strong> Acompanhar demandas, orçamentos e OS — proposto/protótipo.",
                    "<strong>RF-CLI-05:</strong> Não exibir versão nova até apostila.",
                    "<strong>RF-CLI-06:</strong> Cotação → demanda — proposto (protótipo).",
                    "<strong>RF-CLI-07:</strong> Aceitar/recusar proposta — proposto.",
                    "<strong>RF-CLI-08:</strong> Após orçamento, cliente decide se abre/autoriza OS — não afirmar geração automática sem validação.",
                    "<strong>RF-CLI-09:</strong> Contratos: versão apostilada (e pendente se houver) — parcial/protótipo.",
                    "<strong>RF-CLI-10:</strong> Snapshot da versão na OS/orçamento.",
                    "<strong>RF-CLI-11:</strong> Itens a partir do contrato/catálogo da versão.",
                    "<strong>RF-CLI-12:</strong> Recusa com motivo — proposto.",
                    "<strong>RF-CLI-13:</strong> Respeitar hierarquia do cliente: distribuição de saldo e segregação entre secretarias/unidades.",
                    "<strong>RF-CLI-14:</strong> Não cadastrar/editar catálogo/produto — proposto (cliente = consumidor).",
                ],
                [
                    "<strong>RN-CLI-01:</strong> Cliente cadastralmente é pessoa jurídica (somente PJ); pessoas = responsáveis.",
                    "<strong>RN-CLI-02:</strong> Visibilidade pela versão apostilada.",
                    "<strong>RN-CLI-03:</strong> OS/orçamento preservam a versão do catálogo (snapshot).",
                    "<strong>RN-CLI-04:</strong> Hierarquia do cliente permite rateio de saldo por secretaria/unidade no mesmo contrato, com segregação de acesso/consumo entre unidades.",
                    "<strong>RN-ORC-01:</strong> Serviço exige orçamento prévio de estimativa antes do consumo.",
                    "<strong>RN-ORC-02:</strong> Licenciamento pode ter orçamento; pode ser dispensável (não requisito sempre obrigatório).",
                    "<strong>RN-VER-03:</strong> Sem apostila, versão nova não entra na consulta padrão.",
                    "<strong>RN-SNAP-01:</strong> Snapshot na abertura de OS/orçamento (preservação histórica).",
                    "<strong>RN-SNAP-02:</strong> Auditoria deve recuperar catálogo/produtos da versão do snapshot.",
                ],
                acoes=[
                    "Consultar catálogo · Demanda / orçamento · OS (detalhe F3)",
                    "Aceitar/recusar orçamento · Autorizar — proposto no protótipo",
                ],
                validacoes=[
                    "Consulta filtra por versão apostilada",
                    "Serviço: orçamento antes do consumo",
                    "Não misturar abertura de OS com autorização de consumo de serviço",
                ],
            ),
        )
    )

    # --- mti ---
    s.append(
        (
            "mti",
            story(
                "mti-analise",
                "mti",
                "backoffice",
                "Backoffice MTI — análise e publicação",
                "Nada que veio do parceiro entra em produção sem parecer da MTI.",
                "Tela/fluxo de análise de catálogo/produto: decisão + justificativa + confirmação (assinatura quando aplicável).",
                "Fila de itens em Aguardando. Analista confere valores/métricas/CSV, decide, confirma. Status espelha no portal.",
                [
                    "<strong>RF-MTI-01:</strong> Cadastrar e manter listas, parcerias e soluções.",
                    "<strong>RF-MTI-02:</strong> Analisar: aprovar, solicitar ajuste (com motivo) ou reprovar.",
                    "<strong>RF-MTI-03:</strong> Publicar catálogo após parecer — proposto.",
                    "<strong>RF-MTI-04:</strong> Criar nova versão preservando a anterior (cópia automática de produtos = alternativa; CSV round-trip confirmado).",
                    "<strong>RF-MTI-05:</strong> Apostilar versão de catálogo no contrato (ator a confirmar).",
                    "<strong>RF-MTI-06:</strong> Paralisar catálogo/produto — proposto.",
                    "<strong>RF-MTI-07:</strong> Manter catálogo universal / objetos separados.",
                    "<strong>RF-MTI-08:</strong> Conferir fator com teste de mesa/planilha — apoio à Discovery; requisito formal a fechar.",
                    "<strong>RF-AN-01:</strong> Exibir enviados e status — proposto/protótipo.",
                    "<strong>RF-AN-02:</strong> Registrar decisão com ator/data — proposto.",
                    "<strong>RF-AN-03:</strong> Exigir motivo em ajuste/reprovação — proposto.",
                    "<strong>RF-AN-04:</strong> Após aprovar, permitir publicar — proposto.",
                    "<strong>RF-AN-05:</strong> Espelhar status no Portal do Parceiro — proposto.",
                ],
                [
                    "<strong>RN-MTI-01:</strong> Produtos do parceiro exigem validação MTI.",
                    "<strong>RN-MTI-02:</strong> Solicitar ajuste — citado; justificativa obrigatória = proposta.",
                    "<strong>RN-MTI-03:</strong> Publicar após homologar — proposto.",
                    "<strong>RN-MTI-04:</strong> Versão em uso não é editada no lugar — cria-se outra.",
                    "<strong>RN-AN-01:</strong> Motivo em ajuste/reprovação — proposto.",
                    "<strong>RN-AN-02:</strong> Publicar após parecer favorável — proposto.",
                ],
                acoes=["Confirmar decisão (Aprovar / Ajuste / Reprovar / Paralisar) — proposto", "Publicar — proposto", "Criar nova versão", "Apostilar"],
                validacoes=["Justificativa se ajuste/reprovar — proposto", "Apostila não altera conteúdo versionado"],
            ),
        )
    )

    # --- fator exemplo ---
    s.append(
        (
            "fluxo",
            """
<section class="slide" id="fator-exemplo" data-group="fluxo">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--regra">Cálculo</span></div>
    <h1 class="slide__title">Fator de conversão (Tipo 3) — estrutura e exemplo ilustrativo</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">O fator existe no Tipo 3. Orçar só “moeda × quantidade” sem o fator distorce o preço. <strong>Números abaixo são ilustrativos</strong> — pendentes de conferência do áudio/planilha de teste de mesa (transcrição degradada).</p>
"""
            + tbl(
                "Estrutura do cálculo (candidata)",
                ["Regra", "Conteúdo"],
                [
                    ["RN-FAT-01", "Fator calculado a partir do valor unitário do produto e do valor da moeda universal (fórmula oficial a fechar)."],
                    ["RN-FAT-02", "Licenciamento/USN no Tipo 3: relação tipicamente 1:1."],
                    ["RN-FAT-03", "Orçamento/OS Tipo 3: moeda × fator × quantidade [× complexidade] [× peso] quando aplicáveis."],
                    ["UX", "Recálculo/exibição esperado na Discovery; botão “Recalcular fator” = decisão de protótipo."],
                ],
            )
            + tbl(
                "Exemplo ilustrativo (não oficial)",
                ["Variável", "Valor (exemplo)"],
                [
                    ["Valor unitário do produto", "A confirmar (ex.: ordem de grandeza citada na mesa)"],
                    ["Valor da moeda universal (serviço)", "A confirmar (transcrição oscila valores)"],
                    ["Fator", "unitário ÷ moeda (não oficializar coeficiente até planilha/áudio)"],
                    ["Consumo", "fator × qtde [× coef. complexidade] [× peso]"],
                ],
            )
            + """
  <div class="callout callout--warn">Não usar R$ 22.679 / R$ 282,58 / fator 80,26 como valores oficiais de requisito até validação.</div>
</section>""",
        )
    )

    # --- catalogo RF RN ---
    s.append(
        (
            "catalogo",
            """
<section class="slide" id="rf-consolidado" data-group="catalogo">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--regra">RF</span></div>
    <h1 class="slide__title">Catálogo consolidado — requisitos funcionais (principais)</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
"""
            + tbl(
                "RF por área",
                ["Área", "IDs", "Foco"],
                [
                    ["Escopo / tipos", "RF-ESC-*, RF-TIPO-*", "Cobertura e flags Universal/Individualizado"],
                    ["Listas", "RF-MET, COB, CATG, GRP, MV", "Parametrização MTI"],
                    ["Parceria / Solução", "RF-PAR-*, RF-SOL-*", "Governança e fabricante texto"],
                    ["Catálogo / Universal / Produto", "RF-CTL-*, RF-UNI-*, RF-PROD-*", "Cadastro, CSV, versão, fator"],
                    ["Dados de Parceria", "RF-DP-*", "Markup e distribuição 100%"],
                    ["Fluxo / Análise MTI", "RF-FLUX-*, RF-MTI-*, RF-AN-*", "Parecer, publicar, apostilar"],
                    ["Portal Parceiro", "RF-PARC-01…14", "Rascunho → envio → ajuste"],
                    ["Portal Cliente", "RF-CLI-01…14", "Consulta apostilada → OS"],
                ],
            )
            + "</section>",
        )
    )

    s.append(
        (
            "catalogo",
            """
<section class="slide" id="rn-consolidado" data-group="catalogo">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--regra">RN</span></div>
    <h1 class="slide__title">Catálogo consolidado — regras de negócio</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
"""
            + tbl(
                "Regras críticas",
                ["ID", "Regra"],
                [
                    ["RN-TIPO-01…06", "Tipos 1/2/3; elegibilidade USN/UST/HST; tipo decorre do objeto contratado"],
                    ["RN-P-01", "Produto referencia um catálogo (1:1 candidata — formalizar)"],
                    ["RN-P-02…04", "Flags independentes; sem fator se só indiv. ou fora de métrica universal"],
                    ["RN-P-05", "Markup em Dados de Parceria (protótipo) — confirmar vs Discovery"],
                    ["RN-DP-01", "% parceiro + % MTI = 100 (protótipo)"],
                    ["RN-VER-01…03", "Versão no contrato; não sobrescreve; cliente só após apostila"],
                    ["RN-SNAP-01", "OS/orçamento com snapshot da versão"],
                    ["RN-SNAP-02", "Auditoria recupera catálogo/produtos do snapshot"],
                    ["RN-FAT-01", "Fator a partir de unitário e moeda (fórmula oficial pendente)"],
                    ["RN-FAT-02", "USN Tipo 3 tipicamente 1:1"],
                    ["RN-FAT-03", "Consumo Tipo 3: moeda × fator × qtde [× complexidade] [× peso]"],
                    ["RN-ORC-01/02", "Serviço: orçamento prévio; licença: orçamento pode ser dispensável"],
                    ["RN-CLI-01/04", "Cliente = PJ; saldo/segregação por secretaria"],
                    ["RN-CSV-01", "Template CSV round-trip"],
                    ["RN-PAR-01", "Primeiro cadastro da entidade Parceria = MTI"],
                    ["RN-UNI-02", "Objetos específicos/universais separados dos catálogos"],
                    ["RN-SOL-01", "Fabricante em texto (provisório)"],
                ],
            )
            + "</section>",
        )
    )

    # --- aceite ---
    s.append(
        (
            "aceite",
            """
<section class="slide" id="aceite" data-group="aceite">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--regra">Aceite</span></div>
    <h1 class="slide__title">Critérios de aceite</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
"""
            + tbl(
                "Checklist (origem marcada)",
                ["#", "Critério", "Origem"],
                [
                    ["1", "Catálogo com produtos nas combinações de flags (univ./indiv./ambos) e tags", "QA — quantidade/versão = teste"],
                    ["2", "Nova versão sem perder a anterior; auditável", "Confirmado (números 1.0/1.1 = teste)"],
                    ["3", "Importar CSV; rejeitar inválida com mensagem", "QA — “≥20 linhas” = decisão de teste"],
                    ["4", "Exportar CSV e reimportar em nova versão", "Confirmado (round-trip)"],
                    ["5", "Complexidade/peso conforme produto (frequente em serviço)", "Parcial — não exclusividade fechada"],
                    ["6", "Fator quando Universal=Sim; sem fator se só Individualizado", "Confirmado (UI oculto = proposta)"],
                    ["7", "Duas parcerias na mesma Organização", "Confirmado"],
                    ["8", "Aprovar/ajuste MTI; publicação após parecer", "Parcial/proposto (máquina de estados)"],
                    ["9", "Card: nome + tipo + tag; sem cobrança/métrica", "Parcial — Grupo candidata"],
                    ["10", "Códigos manuais sob flag", "Parcial"],
                    ["11", "Parceiro: cadastro/CSV + validação MTI", "Confirmado (estados detalhados = proposto)"],
                    ["12a", "Versão invisível ao cliente até apostila", "Confirmado"],
                    ["12b", "Cotação gera demanda", "Proposto — separar de 12a"],
                    ["13", "Distribuição ≠100% rejeitada", "Protótipo (Dados de Parceria)"],
                    ["14", "OS/orçamento gravam versão (snapshot)", "Confirmado"],
                    ["15", "Cliente = PJ; saldo/segregação por secretaria", "Confirmado"],
                    ["16", "Serviço: orçamento antes do consumo", "Confirmado"],
                ],
            )
            + "</section>",
        )
    )

    s.append(
        (
            "aceite",
            """
<section class="slide" id="glossario" data-group="aceite">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--conceito">Glossário</span></div>
    <h1 class="slide__title">Glossário e fontes</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
"""
            + tbl(
                "Termos",
                ["Termo", "Significado"],
                [
                    ["CGS", "Catálogo Geral de Soluções (Tipo 3) — nome oficial a confirmar"],
                    ["USN / UST / HST", "Métricas universais (siglas a confirmar no áudio/oficial)"],
                    ["Fator", "Conversão preço → moeda Tipo 3 (fórmula oficial pendente)"],
                    ["Apostila", "Libera nova versão do catálogo no contrato do cliente"],
                    ["Snapshot", "Preservação da versão na OS/orçamento"],
                    ["Status do fluxo", "Andamento portal↔MTI — estados propostos"],
                    ["Status do objeto", "Ativo / Homologado / Paralisado no cadastro"],
                    ["Objeto contratado", "Específico ou universal — separado do catálogo"],
                    ["Markup", "Em Dados de Parceria (protótipo)"],
                    ["Universal / Individualizado", "Flags independentes de oferta"],
                ],
            )
            + tbl(
                "Fontes desta versão",
                ["Fonte", "Uso"],
                [
                    ["Discovery Catálogo 08/07/2026 (ata + Whisper)", "Regras de negócio e UX"],
                    ["Protótipo atlas-prototipo (forms cat-*)", "Campos, métodos, classes"],
                    ["Portal Parceiro / Portal Cliente (apps)", "Fluxo, status, ações"],
                    ["especificacao-catalogo-produtos-atlas.md (03/08)", "Spec de implementação"],
                    ["Entregáveis Atlas (Fases / F3 Catálogo)", "Encaixe no PEAP"],
                ],
            )
            + """
  <div class="callout">Minuta v0.9 (04/08/2026). Implementação deve respeitar origem Confirmado / Protótipo / Proposto / QA. Aprovação formal MTI pendente.</div>
</section>""",
        )
    )

    # assemble HTML
    by: dict[str, list[str]] = {g: [] for g, _, _ in GROUPS}
    for g, html in s:
        by[g].append(html)

    nav_btns = "".join(
        f'<button type="button" data-group="{gid}"><span>{esc(title)}</span><small>{esc(desc)}</small></button>'
        for gid, title, desc in GROUPS
    )

    bodies = []
    for gid, title, desc in GROUPS:
        slides = "\n".join(by.get(gid) or [])
        bodies.append(
            f'<details class="grp" open data-group="{gid}">'
            f"<summary>{esc(title)}<span class=\"grp__meta\">{esc(desc)}</span></summary>"
            f'<div class="grp__body">{slides}</div></details>'
        )

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Minuta de requisitos — Catálogo e Produtos · Atlas MTI</title>
<style>{css()}</style>
</head>
<body>
<div class="toolbar">
  <div><strong>Atlas · Minuta Catálogo &amp; Produtos</strong> · v0.9 · 04/08/2026</div>
  <div>
    <button type="button" class="primary" onclick="window.print()">Imprimir / PDF</button>
    <button type="button" onclick="document.querySelectorAll('.grp').forEach(d=>d.open=true)">Abrir tudo</button>
    <button type="button" onclick="document.querySelectorAll('.grp').forEach(d=>d.open=false)">Fechar tudo</button>
  </div>
</div>
<div class="deck">
  <nav class="nav-groups">
    <div class="nav-groups__title">Navegação</div>
    <div class="nav-groups__row">{nav_btns}</div>
  </nav>
  {''.join(bodies)}
</div>
<script>
const btns=[...document.querySelectorAll('.nav-groups button')];
function show(g){{
  document.querySelectorAll('.grp').forEach(d=>{{
    const on=!g||d.dataset.group===g;
    d.style.display=on?'':'none';
    if(on) d.open=true;
  }});
  btns.forEach(b=>b.classList.toggle('is-on',!g||b.dataset.group===g));
}}
btns.forEach(b=>b.addEventListener('click',()=>{{
  const g=b.dataset.group;
  show(b.classList.contains('is-on')?null:g);
}}));
</script>
</body>
</html>
"""
    OUT.write_text(html, encoding="utf-8")
    # also mirror as the main doc name the client has been opening
    mirror = ROOT / "exports" / "documentacao-requisitos-catalogo-produtos.html"
    mirror.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT} · {OUT.stat().st_size/1024:.1f} KB · groups {len(GROUPS)}")
    print(f"Mirrored {mirror}")


if __name__ == "__main__":
    build()
