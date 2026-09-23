# -*- coding: utf-8 -*-
"""Implement Fase 2 prototype gaps (catalogo.m4a confirmed / checkpoint)."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

FORMS_PATH = Path("data/subprojects/atlas-prototipo/epics/prototipo/forms.json")
WS_PATH = Path("data/subprojects/atlas-prototipo/epics/prototipo/workspaces.json")

PROD = "form-patlasv4-proto-cat-produto"
CAT = "form-patlasv4-proto-cat-catalogo"
PARC = "form-patlasv4-proto-cat-parceria"
SOL = "form-patlasv4-proto-cat-solucao"
DP = "form-patlasv4-proto-cat-dados-parceria"

HIDE_INHERITED = [
    f"{PROD}-catalogo",
    f"{PROD}-parceria",
    f"{PROD}-solucao",
    f"{PROD}-versao-catalogo",
]
HIDE_IN_PARCERIA_VIEW = [
    f"{PROD}-catalogo",
    f"{PROD}-parceria",
]


def fld(**kwargs):
    base = {
        "size": "medium",
        "readOnly": False,
        "required": False,
        "multiple": False,
        "relevance": "common",
        "hidden": None,
    }
    base.update(kwargs)
    return base


def alert(**kwargs):
    d = fld(type="alert", label="", size="large", **kwargs)
    return d


def method(**kwargs):
    return kwargs


def has_field(form, fid):
    return any(x.get("id") == fid for x in form.get("fields") or [])


def has_form(forms, fid):
    return any(x.get("id") == fid for x in forms)


def get(forms, fid):
    return next(x for x in forms if x["id"] == fid)


def add_section(form, section):
    secs = form.setdefault("sections", [])
    if not any(s.get("id") == section["id"] for s in secs):
        secs.append(section)


def insert_fields_before_hidden_extras(form, new_fields):
    fields = form.setdefault("fields", [])
    existing = {f["id"] for f in fields}
    to_add = [f for f in new_fields if f["id"] not in existing]
    if not to_add:
        return
    # append before first hidden field if possible, else at end
    idx = next((i for i, f in enumerate(fields) if f.get("hidden") is True), len(fields))
    for i, f in enumerate(to_add):
        fields.insert(idx + i, f)


def prod_row(nome, part, tipo, oferta, solucao=None, versao=None, status="Homologado", modelo=None, valor=None):
    row = {
        f"{PROD}-identificador": nome,
        f"{PROD}-part-number": part,
        f"{PROD}-tipo": tipo,
        f"{PROD}-tipo-oferta": oferta,
        f"{PROD}-status": status,
        f"{PROD}-ativo": True,
    }
    if solucao:
        row[f"{PROD}-solucao"] = solucao
    if versao:
        row[f"{PROD}-versao-catalogo"] = versao
    if modelo:
        row[f"{PROD}-modelo-venda"] = modelo
    if valor is not None:
        row[f"{PROD}-valor-unitario"] = valor
    return row


CARD_HTML = """<div class="atlas-card-prod">
  <div class="atlas-card-prod__top">
    <span class="atlas-card-prod__nome">Elaborar plano de projeto</span>
    <span class="atlas-card-prod__status">Homologado</span>
  </div>
  <div class="atlas-card-prod__tipo">Serviço</div>
</div>
<style>
.atlas-card-prod{border:1px solid #d7d7db;border-radius:10px;padding:12px 14px;max-width:320px;background:#fff;font-family:Arial,sans-serif}
.atlas-card-prod__top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
.atlas-card-prod__nome{font-weight:700;font-size:14px;color:#1f1f1f}
.atlas-card-prod__status{font-size:11px;background:#e8f5e9;color:#1b5e20;border-radius:999px;padding:2px 8px;white-space:nowrap}
.atlas-card-prod__tipo{margin-top:6px;font-size:12px;color:#5f6368}
</style>"""


def patch_parceria(form):
    add_section(form, {"id": "sec-cat-parc-visao", "title": "Visão da parceria (agrupamento)", "icon": "view_list"})
    for f in form["fields"]:
        if f["id"] == f"{PARC}-ativo" and not f.get("sectionId"):
            f["sectionId"] = "sec-cat-parc-info"
    insert_fields_before_hidden_extras(
        form,
        [
            alert(
                id=f"{PARC}-alerta-visao",
                sectionId="sec-cat-parc-visao",
                alertVariant="info",
                alertTitle="Isto não é um segundo catálogo",
                alertMessage="O cardápio comercializável é o Catálogo da parceria daquela Solução (N2). Esta seção só junta, para consulta, os catálogos/produtos de todas as soluções desta parceria.",
                spec="**Para que serve:** Evitar confundir visão agregada com classe Catálogo.\n\n**Regras:** Não cadastrar produto aqui. Cadastro no Catálogo N2.",
            ),
            fld(
                id=f"{PARC}-catalogos",
                label="Catálogos desta parceria",
                type="reference",
                size="large",
                multiple=True,
                readOnly=True,
                required=False,
                sectionId="sec-cat-parc-visao",
                linkedFormId=CAT,
                options=["Catálogo MTI Simplifica", "MTI HOST"],
                spec="**Para que serve:** Lista os catálogos N2 (um por Solução/versão) desta parceria.\n\n**Origem:** Classe Catálogo com Parceria = este registro.\n\n**Regras:** Somente leitura. Não é um catálogo agregado.",
            ),
            fld(
                id=f"{PARC}-produtos",
                label="Produtos da parceria (todas as soluções)",
                type="embeddedReference",
                size="large",
                multiple=True,
                readOnly=True,
                required=False,
                sectionId="sec-cat-parc-visao",
                linkedFormId=PROD,
                embeddedDisplay="table",
                embeddedTableHiddenFieldIds=HIDE_IN_PARCERIA_VIEW,
                spec="**Para que serve:** Consulta agregada dos produtos de todos os catálogos/soluções desta parceria.\n\n**Onde é usado:** Backoffice MTI — ver o cardápio inteiro do acordo.\n\n**Origem:** Produtos cujo Catálogo.Parceria = este registro.\n\n**Regras:** Somente leitura. A coluna Solução permanece visível para distinguir os cardápios. Cadastro/edição no Catálogo da solução (N2).",
            ),
        ],
    )
    for p in form.get("exampleValuePresets") or []:
        emb = dict(p.get("embeddedRowsByFieldId") or {})
        if p["id"].endswith("simplifica"):
            p.setdefault("fieldValues", {})[f"{PARC}-catalogos"] = "Catálogo MTI Simplifica"
            emb[f"{PARC}-produtos"] = [
                prod_row("Elaborar plano de projeto", "SIMP-SRV-01", "Serviço", "Universal", solucao="MTI Simplifica", versao="9.4", modelo="Por UST", valor=1),
                prod_row("Licença plataforma Simplifica", "SIMP-LIC-01", "Licença", "Individualizado", solucao="MTI Simplifica", versao="9.4", modelo="Por licença", valor=1500),
                prod_row("Implantação MTI Simplifica", "SIMP-SRV-02", "Serviço", "Individualizado", solucao="MTI Simplifica", versao="9.4", modelo="Por serviço", valor=25000),
            ]
        elif p["id"].endswith("host"):
            p.setdefault("fieldValues", {})[f"{PARC}-catalogos"] = "MTI HOST"
            emb[f"{PARC}-produtos"] = [
                prod_row("Serviço de hospedagem", "HOST-SRV-01", "Serviço", "Individualizado", solucao="MTI Host", versao="1.0", modelo="Por serviço", valor=8000),
            ]
        p["embeddedRowsByFieldId"] = emb


def patch_solucao(form):
    add_section(form, {"id": "sec-cat-sol-produtos", "title": "Produtos desta solução", "icon": "inventory_2"})
    insert_fields_before_hidden_extras(
        form,
        [
            alert(
                id=f"{SOL}-alerta-produtos",
                sectionId="sec-cat-sol-produtos",
                alertVariant="info",
                alertTitle="Cardápio = Catálogo N2 desta solução",
                alertMessage="Os produtos abaixo são os do Catálogo da parceria vinculado a esta Solução (Parceria + Solução + Versão). Não existe um catálogo separado «só da solução».",
                spec="**Para que serve:** Deixar explícito que o comercializável é o N2 desta solução.\n\n**Regras:** Consulta. Inclusão no Catálogo.",
            ),
            fld(
                id=f"{SOL}-catalogo",
                label="Catálogo desta solução",
                type="reference",
                size="large",
                readOnly=True,
                required=False,
                sectionId="sec-cat-sol-produtos",
                linkedFormId=CAT,
                options=["Catálogo MTI Simplifica", "MTI HOST"],
                spec="**Para que serve:** Aponta o Catálogo N2 (Parceria + esta Solução + Versão).\n\n**Regras:** Somente leitura. Uma solução pode ter versões ao longo do tempo.",
            ),
            fld(
                id=f"{SOL}-produtos",
                label="Produtos da solução",
                type="embeddedReference",
                size="large",
                multiple=True,
                readOnly=True,
                required=False,
                sectionId="sec-cat-sol-produtos",
                linkedFormId=PROD,
                embeddedDisplay="table",
                embeddedTableHiddenFieldIds=HIDE_INHERITED,
                spec="**Para que serve:** Lista os produtos do catálogo desta Solução/versão.\n\n**Origem:** Produtos com Catálogo.Solução = este registro.\n\n**Regras:** Somente leitura. Edição no Catálogo N2.",
            ),
        ],
    )
    for p in form.get("exampleValuePresets") or []:
        emb = dict(p.get("embeddedRowsByFieldId") or {})
        fv = p.setdefault("fieldValues", {})
        if p["id"] == "p-sol-simplifica":
            fv[f"{SOL}-catalogo"] = "Catálogo MTI Simplifica"
            emb[f"{SOL}-produtos"] = [
                prod_row("Elaborar plano de projeto", "SIMP-SRV-01", "Serviço", "Universal", versao="9.4"),
                prod_row("Licença plataforma Simplifica", "SIMP-LIC-01", "Licença", "Individualizado", versao="9.4"),
                prod_row("Implantação MTI Simplifica", "SIMP-SRV-02", "Serviço", "Individualizado", versao="9.4"),
            ]
        elif p["id"] == "p-sol-host":
            fv[f"{SOL}-catalogo"] = "MTI HOST"
            emb[f"{SOL}-produtos"] = [
                prod_row("Serviço de hospedagem", "HOST-SRV-01", "Serviço", "Individualizado", versao="1.0"),
            ]
        p["embeddedRowsByFieldId"] = emb


def patch_dados_parceria(form):
    form["metadata"] = (
        "PROPOSTA (não fechado no catalogo.m4a). Granularidade candidata: 1 registro por Parceria × Solução × Produto. "
        "Custo/markup/% fora do valor unitário de venda. Ativo obrigatório."
    )
    if not has_field(form, f"{DP}-produto"):
        fields = form["fields"]
        idx = next(i for i, x in enumerate(fields) if x["id"] == f"{DP}-solucao") + 1
        fields.insert(
            idx,
            fld(
                id=f"{DP}-produto",
                label="Produto",
                type="reference",
                size="medium",
                required=True,
                sectionId="sec-cat-dp-info",
                linkedFormId=PROD,
                options=[
                    "Elaborar plano de projeto",
                    "Licença plataforma Simplifica",
                    "Serviço de hospedagem",
                ],
                spec="**Para que serve:** Item ao qual se aplicam custo, markup e distribuição.\n\n**Onde é usado:** Um registro por combinação parceria × solução × produto (proposta).\n\n**Origem:** Classe Produto do catálogo N2 daquela solução.\n\n**Regras:** Obrigatório nesta proposta. Não substitui o valor unitário de venda (fica no Produto). Classe ainda a confirmar com a MTI.",
            ),
        )
    add_section(form, {"id": "sec-cat-dp-aviso", "title": "Escopo", "icon": "info"})
    if not has_field(form, f"{DP}-alerta-proposta"):
        form["fields"].insert(
            0,
            alert(
                id=f"{DP}-alerta-proposta",
                sectionId="sec-cat-dp-aviso",
                alertVariant="warning",
                alertTitle="Classe proposta",
                alertMessage="Não é um valor único para todos os produtos da parceria. A intenção é informar custo/markup/% por produto (Parceria × Solução × Produto). Existência e granularidade ainda a confirmar com a MTI.",
                spec="**Regras:** Não tratar como requisito fechado do catalogo.m4a.",
            ),
        )
    mapping = {
        "form-patlasv4-proto-cat-dados-parceria-p-host": "Serviço de hospedagem",
        "form-patlasv4-proto-cat-dados-parceria-p-simplifica": "Elaborar plano de projeto",
    }
    for p in form.get("exampleValuePresets") or []:
        if p["id"] in mapping:
            p.setdefault("fieldValues", {})[f"{DP}-produto"] = mapping[p["id"]]


def patch_catalogo(form):
    methods = form.setdefault("methods", [])
    by_id = {m["id"]: m for m in methods}
    if "patlasv4proto-cat-meth-publicar" in by_id:
        by_id["patlasv4proto-cat-meth-publicar"]["name"] = "Publicar"
        by_id["patlasv4proto-cat-meth-publicar"]["kind"] = "destaque"
        by_id["patlasv4proto-cat-meth-publicar"]["icon"] = "publish"
        by_id["patlasv4proto-cat-meth-publicar"]["inputFormId"] = "form-patlasv4-proto-metodo-cat-publicar"
        by_id["patlasv4proto-cat-meth-publicar"]["spec"] = (
            "Só após Homologado. Disponibiliza em produção. Cliente ainda não vê — falta apostilar."
        )
    extras = [
        method(
            id="patlasv4proto-cat-meth-homologar",
            name="Homologar",
            icon="verified",
            kind="destaque",
            inputFormId="form-patlasv4-proto-metodo-cat-homologar",
            spec="Parecer de análise: status Homologado. Não publica e não apostila.",
        ),
        method(
            id="patlasv4proto-cat-meth-apostilar",
            name="Apostilar no contrato",
            icon="contract",
            kind="destaque",
            inputFormId="form-patlasv4-proto-metodo-cat-apostilar",
            spec="Libera a versão no contrato do cliente. Publicar ≠ cliente ver.",
        ),
        method(
            id="patlasv4proto-cat-meth-reprovar",
            name="Reprovar",
            icon="cancel",
            kind="menu",
            inputFormId="form-patlasv4-proto-metodo-cat-reprovar",
            spec="Exige justificativa. Espelha no Portal do Parceiro.",
        ),
        method(
            id="patlasv4proto-cat-meth-paralisar",
            name="Paralisar",
            icon="pause_circle",
            kind="menu",
            inputFormId="form-patlasv4-proto-metodo-cat-paralisar",
            spec="RF-MTI-06. Exige motivo.",
        ),
    ]
    existing = {m["id"] for m in methods}
    for m in extras:
        if m["id"] not in existing:
            methods.append(m)
    add_section(form, {"id": "sec-cat-fluxo", "title": "Fluxo e notificações", "icon": "campaign"})
    insert_fields_before_hidden_extras(
        form,
        [
            alert(
                id=f"{CAT}-alerta-atos",
                sectionId="sec-cat-fluxo",
                alertVariant="info",
                alertTitle="Homologar ≠ Publicar ≠ Apostilar",
                alertMessage="Homologar = parecer. Publicar = produção. Apostilar = cliente passa a consultar a versão no contrato.",
                spec="**Fonte:** validação catálogo Fase 2 / BPMN.",
            ),
            fld(
                id=f"{CAT}-ultima-notificacao",
                label="Última notificação do fluxo",
                type="text",
                size="large",
                readOnly=True,
                sectionId="sec-cat-fluxo",
                textLong=True,
                spec="**Para que serve:** Espelho da última notificação (envio, ajuste, homologação, publicação, apostila).\n\n**Regras:** Somente leitura. Protótipo do RF de notificações do fluxo.",
            ),
        ],
    )
    for p in form.get("exampleValuePresets") or []:
        fv = p.setdefault("fieldValues", {})
        if "simplifica" in p["id"]:
            fv[f"{CAT}-ultima-notificacao"] = "13/08 10:12 · Enviado à MTI · Parceiro EloGroup"
        else:
            fv[f"{CAT}-ultima-notificacao"] = "12/08 16:40 · Publicado · aguarda apostila no contrato"


def patch_produto(form):
    add_section(form, {"id": "sec-prod-card", "title": "Card da listagem", "icon": "style"})
    if not has_field(form, f"{PROD}-card"):
        form["fields"].append(
            fld(
                id=f"{PROD}-card",
                label="Prévia do card",
                type="html",
                size="large",
                readOnly=True,
                required=False,
                sectionId="sec-prod-card",
                htmlContent=CARD_HTML,
                spec="**Para que serve:** Card da lista = nome + tipo (Licença/Serviço) + status. Sem cobrança, métrica ou modelo de venda.\n\n**Regras:** Somente leitura / prévia de UI.",
            )
        )
    methods = form.setdefault("methods", [])
    existing = {m["id"] for m in methods}
    for m in [
        method(
            id="patlasv4proto-prod-meth-reprovar",
            name="Reprovar",
            icon="cancel",
            kind="menu",
            inputFormId="form-patlasv4-proto-metodo-cat-reprovar",
            spec="Exige justificativa.",
        ),
        method(
            id="patlasv4proto-prod-meth-paralisar",
            name="Paralisar",
            icon="pause_circle",
            kind="menu",
            inputFormId="form-patlasv4-proto-metodo-cat-paralisar",
            spec="RF-MTI-06.",
        ),
    ]:
        if m["id"] not in existing:
            methods.append(m)


def patch_analise(form):
    dec = next(x for x in form["fields"] if x["id"] == "patlasv4proto-ac-decisao")
    if "Paralisar" not in (dec.get("options") or []):
        dec["options"] = ["Aprovar", "Solicitar ajuste", "Reprovar", "Paralisar"]
        dec["spec"] = (
            "**Para que serve:** Parecer da MTI: Aprovar (homologar), Solicitar ajuste, Reprovar ou Paralisar.\n\n"
            "**Regras:** Obrigatório. Homologar ≠ Publicar ≠ Apostilar. Justificativa em ajuste, reprovação e paralisação."
        )
    if not has_field(form, "patlasv4proto-ac-alerta-atos"):
        form["fields"].insert(
            1,
            alert(
                id="patlasv4proto-ac-alerta-atos",
                sectionId="sec-ac-decisao",
                alertVariant="info",
                alertTitle="Aprovar homologa — não publica",
                alertMessage="Depois de Homologado, use Publicar no Catálogo e, para o cliente ver, Apostilar no contrato.",
                spec="Separa os três atos no backoffice.",
            ),
        )


def patch_portal_parceiro(form):
    add_section(form, {"id": "sec-ppc-home", "title": "Indicadores (home)", "icon": "dashboard"})
    add_section(form, {"id": "sec-ppc-hist", "title": "Histórico de status", "icon": "history"})
    insert_fields_before_hidden_extras(
        form,
        [
            fld(
                id="patlasv4proto-ppc-ind-rascunho",
                label="Rascunhos",
                type="number",
                size="small",
                readOnly=True,
                sectionId="sec-ppc-home",
                spec="RF-PARC-13 (proposto). Contagem de envios em rascunho. Somente leitura.",
            ),
            fld(
                id="patlasv4proto-ppc-ind-aguardando",
                label="Aguardando análise MTI",
                type="number",
                size="small",
                readOnly=True,
                sectionId="sec-ppc-home",
                spec="RF-PARC-13 (proposto).",
            ),
            fld(
                id="patlasv4proto-ppc-ind-ajuste",
                label="Ajuste solicitado",
                type="number",
                size="small",
                readOnly=True,
                sectionId="sec-ppc-home",
                spec="RF-PARC-13 (proposto).",
            ),
            fld(
                id="patlasv4proto-ppc-ind-homologado",
                label="Homologados",
                type="number",
                size="small",
                readOnly=True,
                sectionId="sec-ppc-home",
                spec="RF-PARC-13 (proposto).",
            ),
            fld(
                id="patlasv4proto-ppc-historico",
                label="Histórico de status",
                type="embeddedReference",
                size="large",
                multiple=True,
                readOnly=True,
                sectionId="sec-ppc-hist",
                linkedFormId="form-patlasv4-proto-cat-historico-status",
                embeddedDisplay="table",
                spec="RF-PARC-12. Trilha de status espelhada com o backoffice. Somente leitura.",
            ),
        ],
    )
    for p in form.get("exampleValuePresets") or []:
        fv = p.setdefault("fieldValues", {})
        fv.setdefault("patlasv4proto-ppc-ind-rascunho", 1)
        fv.setdefault("patlasv4proto-ppc-ind-aguardando", 1)
        fv.setdefault("patlasv4proto-ppc-ind-ajuste", 1 if "ajuste" in p["id"] else 0)
        fv.setdefault("patlasv4proto-ppc-ind-homologado", 0)
        emb = dict(p.get("embeddedRowsByFieldId") or {})
        if "patlasv4proto-ppc-historico" not in emb:
            status = fv.get("patlasv4proto-ppc-status") or "Rascunho (parceiro)"
            emb["patlasv4proto-ppc-historico"] = [
                {
                    "form-patlasv4-proto-cat-historico-status-data": "2026-08-10",
                    "form-patlasv4-proto-cat-historico-status-status": "Rascunho (parceiro)",
                    "form-patlasv4-proto-cat-historico-status-ator": "Parceiro EloGroup",
                    "form-patlasv4-proto-cat-historico-status-obs": "Salvou rascunho.",
                },
                {
                    "form-patlasv4-proto-cat-historico-status-data": "2026-08-12",
                    "form-patlasv4-proto-cat-historico-status-status": status,
                    "form-patlasv4-proto-cat-historico-status-ator": "Sistema / MTI",
                    "form-patlasv4-proto-cat-historico-status-obs": "Última transição.",
                },
            ]
        p["embeddedRowsByFieldId"] = emb


def patch_portal_cliente(form):
    alerta = next((x for x in form["fields"] if x["id"] == "patlasv4proto-pcc-alerta"), None)
    if alerta:
        alerta["alertTitle"] = "Fase 2: só consultar o catálogo apostilado"
        alerta["alertMessage"] = (
            "Cadastro é do Parceiro/MTI. Nesta fase você consulta a versão apostilada no contrato. "
            "Cotação, demanda, orçamento, OS e saldo são Fase 3 (métodos abaixo marcados como proposto)."
        )
    for m in form.get("methods") or []:
        if m["id"] == "patlasv4proto-pcc-meth-consultar":
            m["spec"] = "RF-CLI-01 · Fase 2"
        elif m["id"] != "patlasv4proto-pcc-meth-consultar":
            spec = m.get("spec") or ""
            if "Fase 3" not in spec:
                m["spec"] = (spec + " · Fase 3 / proposto").strip(" ·")


def patch_csv(form):
    extras = [
        fld(
            id="patlasv4proto-mcat-csv-parceria",
            label="Parceria (template)",
            type="reference",
            linkedFormId=PARC,
            options=["MTI SIMPLIFICA", "MTI HOST"],
            spec="CSV pode variar por parceria. Define qual template oficial aplicar.",
        ),
        fld(
            id="patlasv4proto-mcat-csv-template",
            label="Colunas do template",
            type="text",
            size="large",
            readOnly=True,
            textLong=True,
            spec="Prévia das colunas oficiais desta parceria. Detalhe operacional ainda pendente de fechamento (não inventar layout definitivo).",
        ),
        fld(
            id="patlasv4proto-mcat-csv-previa",
            label="Prévia das linhas válidas",
            type="embeddedReference",
            size="large",
            multiple=True,
            readOnly=True,
            linkedFormId=PROD,
            embeddedDisplay="table",
            embeddedTableHiddenFieldIds=HIDE_INHERITED,
            spec="Linhas que passaram na validação, antes de gravar.",
        ),
        fld(
            id="patlasv4proto-mcat-csv-erros",
            label="Linhas com erro",
            type="text",
            size="large",
            readOnly=True,
            textLong=True,
            spec="Mensagens por linha rejeitada. Não grava as inválidas.",
        ),
    ]
    existing = {f["id"] for f in form["fields"]}
    for f in extras:
        if f["id"] not in existing:
            form["fields"].append(f)
    for p in form.get("exampleValuePresets") or []:
        fv = p.setdefault("fieldValues", {})
        fv.setdefault("patlasv4proto-mcat-csv-parceria", "MTI SIMPLIFICA")
        fv.setdefault(
            "patlasv4proto-mcat-csv-template",
            "nome;part_number;tipo;tipo_oferta;grupo;metrica;cobranca;valor_unitario;descricao",
        )
        fv.setdefault(
            "patlasv4proto-mcat-csv-erros",
            "Linha 14: tipo inválido (esperado Licença|Serviço).\nLinha 22: métrica HST não permitida neste catálogo.",
        )
        emb = dict(p.get("embeddedRowsByFieldId") or {})
        emb.setdefault(
            "patlasv4proto-mcat-csv-previa",
            [
                prod_row("Elaborar plano de projeto", "SIMP-SRV-01", "Serviço", "Universal"),
                prod_row("Licença plataforma Simplifica", "SIMP-LIC-01", "Licença", "Individualizado"),
            ],
        )
        p["embeddedRowsByFieldId"] = emb


def new_method_forms():
    def simple_method(fid, name, title, message, variant, extra_fields, preset):
        return {
            "id": fid,
            "name": name,
            "sectionLayout": "none",
            "defaultCanvasMode": "edit",
            "metadata": "Fase 2 · Catálogo — ato de fluxo (Homologar ≠ Publicar ≠ Apostilar).",
            "fields": [
                alert(
                    id=f"{fid}-alerta",
                    alertVariant=variant,
                    alertTitle=title,
                    alertMessage=message,
                    spec="Texto fixo do método.",
                ),
                *extra_fields,
            ],
            "exampleValuePresets": [preset],
            "activeExamplePresetId": preset["id"],
        }

    return [
        simple_method(
            "form-patlasv4-proto-metodo-cat-homologar",
            "Catálogo — Homologar",
            "Homologar não publica",
            "O status passa a Homologado. Publicar e apostilar são atos seguintes, da MTI.",
            "info",
            [
                fld(
                    id="patlasv4proto-mcat-hom-obs",
                    label="Observação (opcional)",
                    type="text",
                    size="large",
                    textLong=True,
                    spec="Histórico / notificação opcional ao parceiro.",
                )
            ],
            {
                "id": "p-mcat-hom-ex",
                "name": "Homologar Simplifica 9.4",
                "fieldValues": {"patlasv4proto-mcat-hom-obs": "Itens conferidos. Segue para publicação."},
            },
        ),
        simple_method(
            "form-patlasv4-proto-metodo-cat-publicar",
            "Catálogo — Publicar",
            "Publicar ≠ cliente ver",
            "Disponibiliza em produção. O cliente só consulta depois da apostila no contrato.",
            "warning",
            [
                fld(
                    id="patlasv4proto-mcat-pub-confirmar",
                    label="Confirmar publicação",
                    type="boolean",
                    required=True,
                    spec="Obrigatório. Só habilitado se status = Homologado.",
                )
            ],
            {
                "id": "p-mcat-pub-ex",
                "name": "Publicar após homologado",
                "fieldValues": {"patlasv4proto-mcat-pub-confirmar": True},
            },
        ),
        simple_method(
            "form-patlasv4-proto-metodo-cat-apostilar",
            "Catálogo — Apostilar no contrato",
            "Apostila libera a visão do cliente",
            "Grava a versão no contrato. OS/orçamentos já abertos não mudam de versão (Fase 3).",
            "warning",
            [
                fld(
                    id="patlasv4proto-mcat-ap-contrato",
                    label="Contrato",
                    type="text",
                    required=True,
                    spec="Contrato do cliente que receberá a versão. Cadastro contratual detalhado = Fase 3; aqui só o ato de apostila da versão.",
                ),
                fld(
                    id="patlasv4proto-mcat-ap-versao",
                    label="Versão a apostilar",
                    type="text",
                    required=True,
                    readOnly=True,
                    spec="Herdada do catálogo publicado.",
                ),
                fld(
                    id="patlasv4proto-mcat-ap-data",
                    label="Data da apostila",
                    type="date",
                    required=True,
                ),
            ],
            {
                "id": "p-mcat-ap-ex",
                "name": "Apostilar SEPLAG · 9.4",
                "fieldValues": {
                    "patlasv4proto-mcat-ap-contrato": "Contrato SEPLAG · Simplifica",
                    "patlasv4proto-mcat-ap-versao": "9.4",
                    "patlasv4proto-mcat-ap-data": "2026-08-17",
                },
            },
        ),
        simple_method(
            "form-patlasv4-proto-metodo-cat-reprovar",
            "Catálogo/Produto — Reprovar",
            "Reprovação exige motivo",
            "O parceiro é notificado. Não publica. Pode gerar novo rascunho depois.",
            "error",
            [
                fld(
                    id="patlasv4proto-mcat-rep-motivo",
                    label="Justificativa",
                    type="text",
                    size="large",
                    required=True,
                    textLong=True,
                    spec="Obrigatório. Visível no Portal do Parceiro.",
                )
            ],
            {
                "id": "p-mcat-rep-ex",
                "name": "Reprovar carga incompleta",
                "fieldValues": {"patlasv4proto-mcat-rep-motivo": "Itens sem métrica do catálogo. Recarregar CSV."},
            },
        ),
        simple_method(
            "form-patlasv4-proto-metodo-cat-paralisar",
            "Catálogo/Produto — Paralisar",
            "Paralisar o cardápio/item",
            "Remove da oferta de novos vínculos. Exige motivo. Não apaga histórico/versão.",
            "warning",
            [
                fld(
                    id="patlasv4proto-mcat-par-motivo",
                    label="Motivo",
                    type="text",
                    size="large",
                    required=True,
                    textLong=True,
                    spec="RF-MTI-06. Obrigatório.",
                )
            ],
            {
                "id": "p-mcat-par-ex",
                "name": "Paralisar versão substituída",
                "fieldValues": {"patlasv4proto-mcat-par-motivo": "Substituída pela versão 9.5 após apostila."},
            },
        ),
    ]


def new_support_forms():
    hist = {
        "id": "form-patlasv4-proto-cat-historico-status",
        "name": "Histórico de status (catálogo)",
        "sectionLayout": "none",
        "defaultCanvasMode": "read",
        "metadata": "RF-PARC-12 — linha da trilha de status. Somente leitura no portal.",
        "fields": [
            fld(id="form-patlasv4-proto-cat-historico-status-data", label="Data", type="date", required=True, readOnly=True),
            fld(
                id="form-patlasv4-proto-cat-historico-status-status",
                label="Status",
                type="textOptions",
                required=True,
                readOnly=True,
                options=[
                    "Rascunho (parceiro)",
                    "Aguardando análise MTI",
                    "Ajuste solicitado",
                    "Homologado",
                    "Ativo (publicado)",
                    "Paralisado",
                    "Reprovado",
                    "Apostilado",
                ],
            ),
            fld(id="form-patlasv4-proto-cat-historico-status-ator", label="Quem", type="text", readOnly=True),
            fld(id="form-patlasv4-proto-cat-historico-status-obs", label="Observação", type="text", size="large", readOnly=True),
        ],
        "exampleValuePresets": [
            {
                "id": "p-hist-envio",
                "name": "Enviado",
                "fieldValues": {
                    "form-patlasv4-proto-cat-historico-status-data": "2026-08-12",
                    "form-patlasv4-proto-cat-historico-status-status": "Aguardando análise MTI",
                    "form-patlasv4-proto-cat-historico-status-ator": "Parceiro EloGroup",
                    "form-patlasv4-proto-cat-historico-status-obs": "CSV 80 itens.",
                },
            }
        ],
        "activeExamplePresetId": "p-hist-envio",
    }
    fila_item = {
        "id": "form-patlasv4-proto-fila-item-catalogo",
        "name": "Item da fila de análise",
        "sectionLayout": "none",
        "defaultCanvasMode": "read",
        "metadata": "Linha da fila MTI (RF-AN-01).",
        "fields": [
            fld(id="form-patlasv4-proto-fila-item-catalogo-parceiro", label="Parceiro", type="text", readOnly=True),
            fld(id="form-patlasv4-proto-fila-item-catalogo-parceria", label="Parceria", type="text", readOnly=True),
            fld(id="form-patlasv4-proto-fila-item-catalogo-solucao", label="Solução", type="text", readOnly=True),
            fld(id="form-patlasv4-proto-fila-item-catalogo-catalogo", label="Catálogo / versão", type="text", readOnly=True),
            fld(
                id="form-patlasv4-proto-fila-item-catalogo-status",
                label="Status",
                type="textOptions",
                readOnly=True,
                options=["Aguardando análise MTI", "Ajuste solicitado", "Homologado"],
            ),
            fld(id="form-patlasv4-proto-fila-item-catalogo-envio", label="Enviado em", type="date", readOnly=True),
        ],
        "exampleValuePresets": [
            {
                "id": "p-fila-item-simp",
                "name": "Simplifica aguardando",
                "fieldValues": {
                    "form-patlasv4-proto-fila-item-catalogo-parceiro": "EloGroup",
                    "form-patlasv4-proto-fila-item-catalogo-parceria": "MTI SIMPLIFICA",
                    "form-patlasv4-proto-fila-item-catalogo-solucao": "MTI Simplifica",
                    "form-patlasv4-proto-fila-item-catalogo-catalogo": "Catálogo MTI Simplifica · 9.4",
                    "form-patlasv4-proto-fila-item-catalogo-status": "Aguardando análise MTI",
                    "form-patlasv4-proto-fila-item-catalogo-envio": "2026-08-13",
                },
            }
        ],
        "activeExamplePresetId": "p-fila-item-simp",
    }
    fila = {
        "id": "form-patlasv4-proto-fila-analise-catalogo",
        "name": "Fila de análise MTI (catálogo)",
        "sectionLayout": "accordion",
        "defaultCanvasMode": "edit",
        "metadata": "RF-AN-01 — fila de envios aguardando parecer. Não substitui o formulário de decisão.",
        "sections": [
            {"id": "sec-fila-filtro", "title": "Filtros", "icon": "filter_alt"},
            {"id": "sec-fila-itens", "title": "Aguardando análise", "icon": "inbox"},
        ],
        "fields": [
            alert(
                id="form-patlasv4-proto-fila-analise-catalogo-alerta",
                sectionId="sec-fila-filtro",
                alertVariant="info",
                alertTitle="Fila do backoffice MTI",
                alertMessage="Abra o item para registrar a decisão (Aprovar / Ajuste / Reprovar / Paralisar). Homologar ≠ Publicar ≠ Apostilar.",
                spec="RF-AN-01.",
            ),
            fld(
                id="form-patlasv4-proto-fila-analise-catalogo-filtro-status",
                label="Status",
                type="textOptions",
                sectionId="sec-fila-filtro",
                options=["Aguardando análise MTI", "Ajuste solicitado", "(Todos)"],
            ),
            fld(
                id="form-patlasv4-proto-fila-analise-catalogo-filtro-parceria",
                label="Parceria",
                type="reference",
                sectionId="sec-fila-filtro",
                linkedFormId=PARC,
                options=["MTI SIMPLIFICA", "MTI HOST"],
            ),
            fld(
                id="form-patlasv4-proto-fila-analise-catalogo-itens",
                label="Envios",
                type="embeddedReference",
                size="large",
                multiple=True,
                sectionId="sec-fila-itens",
                linkedFormId="form-patlasv4-proto-fila-item-catalogo",
                embeddedDisplay="table",
                spec="Lista operacional. Clique no item para abrir a Análise.",
            ),
        ],
        "methods": [
            method(id="patlasv4proto-fila-abrir", name="Abrir análise", icon="fact_check", kind="destaque", spec="Abre Análise de catálogo (MTI)."),
        ],
        "exampleValuePresets": [
            {
                "id": "p-fila-hoje",
                "name": "Fila 13/08",
                "fieldValues": {
                    "form-patlasv4-proto-fila-analise-catalogo-filtro-status": "Aguardando análise MTI",
                    "form-patlasv4-proto-fila-analise-catalogo-filtro-parceria": "MTI SIMPLIFICA",
                },
                "embeddedRowsByFieldId": {
                    "form-patlasv4-proto-fila-analise-catalogo-itens": [
                        {
                            "form-patlasv4-proto-fila-item-catalogo-parceiro": "EloGroup",
                            "form-patlasv4-proto-fila-item-catalogo-parceria": "MTI SIMPLIFICA",
                            "form-patlasv4-proto-fila-item-catalogo-solucao": "MTI Simplifica",
                            "form-patlasv4-proto-fila-item-catalogo-catalogo": "Catálogo MTI Simplifica · 9.4",
                            "form-patlasv4-proto-fila-item-catalogo-status": "Aguardando análise MTI",
                            "form-patlasv4-proto-fila-item-catalogo-envio": "2026-08-13",
                        },
                        {
                            "form-patlasv4-proto-fila-item-catalogo-parceiro": "EloGroup",
                            "form-patlasv4-proto-fila-item-catalogo-parceria": "MTI HOST",
                            "form-patlasv4-proto-fila-item-catalogo-solucao": "MTI Host",
                            "form-patlasv4-proto-fila-item-catalogo-catalogo": "MTI HOST · 1.0",
                            "form-patlasv4-proto-fila-item-catalogo-status": "Aguardando análise MTI",
                            "form-patlasv4-proto-fila-item-catalogo-envio": "2026-08-12",
                        },
                    ]
                },
            }
        ],
        "activeExamplePresetId": "p-fila-hoje",
    }
    notif = {
        "id": "form-patlasv4-proto-cat-notificacao-fluxo",
        "name": "Notificação do fluxo (catálogo)",
        "sectionLayout": "none",
        "defaultCanvasMode": "read",
        "metadata": "Protótipo das notificações do fluxo de catálogo (envio, ajuste, homologação, publicação, apostila). Não substitui a classe Configuração de Notificação da Fase 1.",
        "fields": [
            fld(
                id="form-patlasv4-proto-cat-notificacao-fluxo-evento",
                label="Evento",
                type="textOptions",
                required=True,
                options=[
                    "Enviado à MTI",
                    "Ajuste solicitado",
                    "Homologado",
                    "Publicado",
                    "Apostilado",
                    "Reprovado",
                    "Paralisado",
                ],
            ),
            fld(id="form-patlasv4-proto-cat-notificacao-fluxo-destinatario", label="Destinatário", type="text", required=True),
            fld(id="form-patlasv4-proto-cat-notificacao-fluxo-quando", label="Quando", type="date", required=True),
            fld(
                id="form-patlasv4-proto-cat-notificacao-fluxo-mensagem",
                label="Mensagem",
                type="text",
                size="large",
                textLong=True,
                required=True,
            ),
        ],
        "exampleValuePresets": [
            {
                "id": "p-notif-envio",
                "name": "Fila MTI notificada",
                "fieldValues": {
                    "form-patlasv4-proto-cat-notificacao-fluxo-evento": "Enviado à MTI",
                    "form-patlasv4-proto-cat-notificacao-fluxo-destinatario": "Fila MTI / Focal vendas",
                    "form-patlasv4-proto-cat-notificacao-fluxo-quando": "2026-08-13",
                    "form-patlasv4-proto-cat-notificacao-fluxo-mensagem": "Catálogo MTI Simplifica v9.4 aguardando análise.",
                },
            },
            {
                "id": "p-notif-ajuste",
                "name": "Parceiro — ajuste",
                "fieldValues": {
                    "form-patlasv4-proto-cat-notificacao-fluxo-evento": "Ajuste solicitado",
                    "form-patlasv4-proto-cat-notificacao-fluxo-destinatario": "Responsável parceiro",
                    "form-patlasv4-proto-cat-notificacao-fluxo-quando": "2026-08-14",
                    "form-patlasv4-proto-cat-notificacao-fluxo-mensagem": "Corrigir métrica dos itens 14 e 22. Ver justificativa no portal.",
                },
            },
        ],
        "activeExamplePresetId": "p-notif-envio",
    }
    return [hist, fila_item, fila, notif]


def patch_workspace(ws):
    def walk(o):
        if isinstance(o, dict):
            if o.get("id") == "pkg-fase-2-catalogo":
                return o
            for v in o.values():
                r = walk(v)
                if r:
                    return r
        elif isinstance(o, list):
            for i in o:
                r = walk(i)
                if r:
                    return r
        return None

    pkg = walk(ws)
    if not pkg:
        raise SystemExit("pkg-fase-2-catalogo not found")
    existing = {c["id"] for c in pkg["classes"]}
    extras = [
        {
            "id": "cls-mapa-fila-analise",
            "name": "Fila de análise MTI (catálogo)",
            "linkedFormId": "form-patlasv4-proto-fila-analise-catalogo",
            "linkedFormExamplePresetIds": ["p-fila-hoje"],
        },
        {
            "id": "cls-mapa-notif-fluxo-cat",
            "name": "Notificação do fluxo (catálogo)",
            "linkedFormId": "form-patlasv4-proto-cat-notificacao-fluxo",
            "linkedFormExamplePresetIds": ["p-notif-envio", "p-notif-ajuste"],
        },
    ]
    # insert after Análise de catálogo
    idx = next((i for i, c in enumerate(pkg["classes"]) if c["id"] == "cls-mapa-analise-catalogo"), len(pkg["classes"]) - 1)
    for j, c in enumerate(extras):
        if c["id"] not in existing:
            pkg["classes"].insert(idx + 1 + j, c)


def main():
    forms = json.loads(FORMS_PATH.read_text(encoding="utf-8"))
    patch_parceria(get(forms, PARC))
    patch_solucao(get(forms, SOL))
    patch_dados_parceria(get(forms, DP))
    patch_catalogo(get(forms, CAT))
    patch_produto(get(forms, PROD))
    patch_analise(get(forms, "form-patlasv4-proto-analise-catalogo"))
    patch_portal_parceiro(get(forms, "form-patlasv4-proto-portal-parceiro-catalogo"))
    patch_portal_cliente(get(forms, "form-patlasv4-proto-portal-cliente-catalogo"))
    patch_csv(get(forms, "form-patlasv4-proto-metodo-cat-import-csv"))

    for nf in new_method_forms() + new_support_forms():
        if not has_form(forms, nf["id"]):
            forms.append(nf)

    ws = json.loads(WS_PATH.read_text(encoding="utf-8"))
    patch_workspace(ws)

    FORMS_PATH.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    WS_PATH.write_text(json.dumps(ws, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK forms", len(forms), "new ids", [x["id"] for x in forms if x["id"].startswith("form-patlasv4-proto-metodo-cat-homologar") or "fila" in x["id"] or "historico-status" in x["id"] or "notificacao-fluxo" in x["id"] or "apostilar" in x["id"] or "paralisar" in x["id"] or "reprovar" in x["id"] and "metodo-cat" in x["id"]])


if __name__ == "__main__":
    main()
