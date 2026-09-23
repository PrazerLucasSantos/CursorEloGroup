# -*- coding: utf-8 -*-
"""Fecha gaps restantes do protótipo Atlas Fase 2 para validação (pós-17/08)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
WS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/workspaces.json"

MODELOS = ["Por licença", "Por serviço", "Por pacote", "Perpétuo", "Por UST"]
COBRANCAS = ["Mensal", "Anual", "Conforme homologação", "Única"]
CSV_COLS = (
    "nome;part_number;tipo;grupo;vertical;modelo_venda;cobranca;metrica;"
    "valor_unitario;periodo_minimo;complexidade;peso;descricao"
)


def fget(forms: list, fid: str) -> dict:
    for item in forms:
        if item.get("id") == fid:
            return item
    raise KeyError(fid)


def field(form: dict, fid: str) -> dict:
    for item in form.get("fields") or []:
        if item.get("id") == fid:
            return item
    raise KeyError(fid)


def ensure_field(form: dict, after_id: str | None, new_field: dict) -> None:
    fields = form["fields"]
    if any(x.get("id") == new_field["id"] for x in fields):
        return
    if after_id is None:
        fields.append(new_field)
        return
    for i, item in enumerate(fields):
        if item.get("id") == after_id:
            fields.insert(i + 1, new_field)
            return
    fields.append(new_field)


def upsert_preset(form: dict, preset: dict) -> None:
    presets = form.setdefault("exampleValuePresets", [])
    for i, p in enumerate(presets):
        if p.get("id") == preset["id"]:
            presets[i] = preset
            return
    presets.append(preset)


def main() -> int:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    workspaces = json.loads(WS.read_text(encoding="utf-8"))

    # --- Produto: listas + alerta Perpétuo→Única + presets ---
    prod = fget(forms, "form-patlasv4-proto-cat-produto")
    mv = field(prod, "form-patlasv4-proto-cat-produto-modelo-venda")
    mv["options"] = list(MODELOS)
    mv["spec"] = (
        "Valores: Por licença · Por serviço · Por pacote · Perpétuo · Por UST. "
        "Se Perpétuo, o Tipo de cobrança do produto deve ser Única (regra 17/08)."
    )
    cob = field(prod, "form-patlasv4-proto-cat-produto-cobranca")
    cob["options"] = list(COBRANCAS)
    cob["spec"] = (
        "Mensal · Anual · Conforme homologação · Única. "
        "Sob demanda não é tipo de cobrança. Modelo Perpétuo → cobrança Única."
    )
    ensure_field(
        prod,
        "form-patlasv4-proto-cat-produto-cobranca",
        {
            "id": "form-patlasv4-proto-cat-produto-alerta-perpetuo",
            "label": "Regra Perpétuo",
            "type": "alert",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "highlight",
            "sectionId": "sec-prod-com",
            "alertVariant": "info",
            "alertTitle": "Modelo Perpétuo → cobrança Única",
            "alertMessage": (
                "Ao selecionar Modelo de venda = Perpétuo, selecione Tipo de cobrança = Única. "
                "No Sydle isso será automático; neste protótipo a regra é demonstrada nos cenários "
                "«Licença Perpétua» e na especificação dos campos."
            ),
            "alertCollapsible": True,
            "spec": "RN-MV-03 / RN-COB-02 — Perpétuo implica cobrança Única.",
        },
    )
    upsert_preset(
        prod,
        {
            "id": "form-patlasv4-proto-cat-produto-p-perpetuo",
            "name": "Licença Perpétua → cobrança Única",
            "fieldValues": {
                "form-patlasv4-proto-cat-produto-catalogo": "Catálogo MTI Simplifica",
                "form-patlasv4-proto-cat-produto-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-produto-solucao": "MTI Simplifica",
                "form-patlasv4-proto-cat-produto-versao-catalogo": "9.4",
                "form-patlasv4-proto-cat-produto-identificador": "Licença perpétua plataforma",
                "form-patlasv4-proto-cat-produto-part-number": "LIC-PERP-01",
                "form-patlasv4-proto-cat-produto-tipo": "Licença",
                "form-patlasv4-proto-cat-produto-tipo-oferta": "Universal",
                "form-patlasv4-proto-cat-produto-grupo": "Análise e Modelagem de Processos",
                "form-patlasv4-proto-cat-produto-modelo-venda": "Perpétuo",
                "form-patlasv4-proto-cat-produto-cobranca": "Única",
                "form-patlasv4-proto-cat-produto-valor-unitario": 45000,
                "form-patlasv4-proto-cat-produto-metrica": "USN",
                "form-patlasv4-proto-cat-produto-status": "Rascunho",
                "form-patlasv4-proto-cat-produto-ativo": True,
            },
        },
    )
    upsert_preset(
        prod,
        {
            "id": "form-patlasv4-proto-cat-produto-p-ust",
            "name": "Serviço Por UST — Simplifica",
            "fieldValues": {
                "form-patlasv4-proto-cat-produto-catalogo": "Catálogo MTI Simplifica",
                "form-patlasv4-proto-cat-produto-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-produto-solucao": "MTI Simplifica",
                "form-patlasv4-proto-cat-produto-versao-catalogo": "9.4",
                "form-patlasv4-proto-cat-produto-identificador": "Análise de requisitos (UST)",
                "form-patlasv4-proto-cat-produto-tipo": "Serviço",
                "form-patlasv4-proto-cat-produto-tipo-oferta": "Universal",
                "form-patlasv4-proto-cat-produto-grupo": "Análise e Modelagem de Processos",
                "form-patlasv4-proto-cat-produto-categoria": "Automação e Processos",
                "form-patlasv4-proto-cat-produto-modelo-venda": "Por UST",
                "form-patlasv4-proto-cat-produto-cobranca": "Mensal",
                "form-patlasv4-proto-cat-produto-valor-unitario": 180,
                "form-patlasv4-proto-cat-produto-metrica": "UST",
                "form-patlasv4-proto-cat-produto-complexidade": "Média",
                "form-patlasv4-proto-cat-produto-coeficiente-complexidade": 1.0,
                "form-patlasv4-proto-cat-produto-status": "Rascunho",
                "form-patlasv4-proto-cat-produto-ativo": True,
            },
        },
    )

    # --- Modelo / Cobrança mestres: options espelhadas nos presets já existem ---
    mv_form = fget(forms, "form-patlasv4-proto-cat-modelo-venda")
    field(mv_form, "form-patlasv4-proto-cat-modelo-venda-identificador")["spec"] = (
        "Nome do modelo. Valores oficiais: "
        + " · ".join(MODELOS)
        + ". Se Perpétuo, cobrança do produto = Única."
    )
    tc_form = fget(forms, "form-patlasv4-proto-cat-tipo-cobranca")
    field(tc_form, "form-patlasv4-proto-cat-tipo-cobranca-nome")["spec"] = (
        "Nome controlado. Valores: " + " · ".join(COBRANCAS) + ". "
        "Única aplica-se quando o modelo de venda for Perpétuo. Recorrência não fica nesta classe."
    )

    # --- Parceria: Soluções RO; método gerar casulo ---
    parc = fget(forms, "form-patlasv4-proto-cat-parceria")
    sol = field(parc, "form-patlasv4-proto-cat-parceria-solucoes")
    sol["required"] = False
    sol["readOnly"] = True
    sol["spec"] = (
        "Consulta reversa: soluções vinculadas depois da criação da Parceria "
        "(cadastradas na classe Solução). Não são pré-requisito para salvar a Parceria."
    )
    alerta_p = field(parc, "form-patlasv4-proto-cat-parceria-alerta-visao")
    alerta_p["alertTitle"] = "Ao salvar: gera Catálogo em Rascunho (casulo)"
    alerta_p["alertMessage"] = (
        "MTI cadastra a Parceria. Ao salvar, o sistema gera automaticamente um Catálogo em branco "
        "(status Rascunho) para o parceiro montar no portal (tela ou CSV). "
        "Homologar, publicar e apostilar são atos exclusivos da MTI. "
        "Use o método «Gerar catálogo rascunho» para simular o casulo neste protótipo."
    )
    field(parc, "form-patlasv4-proto-cat-parceria-catalogos")["spec"] = (
        "Inclui o rascunho gerado ao salvar a Parceria. Conteúdo montado pelo parceiro no portal."
    )

    casulo_form_id = "form-patlasv4-proto-metodo-cat-gerar-casulo"
    if not any(x.get("id") == casulo_form_id for x in forms):
        forms.append(
            {
                "id": casulo_form_id,
                "name": "Parceria — Gerar catálogo rascunho",
                "sectionLayout": "none",
                "defaultCanvasMode": "edit",
                "metadata": (
                    "Simula RF-PAR-06: ao salvar a Parceria, cria Catálogo em Rascunho (casulo) "
                    "para o parceiro montar no portal."
                ),
                "fields": [
                    {
                        "id": "mcat-casulo-alerta",
                        "label": "Confirmação",
                        "type": "alert",
                        "size": "large",
                        "readOnly": False,
                        "required": False,
                        "multiple": False,
                        "relevance": "highlight",
                        "alertVariant": "success",
                        "alertTitle": "Casulo gerado",
                        "alertMessage": (
                            "Será criado um Catálogo em branco, status Rascunho, vinculado a esta Parceria. "
                            "O parceiro completa produtos/grupos no portal. A MTI homologa depois."
                        ),
                    },
                    {
                        "id": "mcat-casulo-parceria",
                        "label": "Parceria",
                        "type": "reference",
                        "size": "medium",
                        "readOnly": True,
                        "required": True,
                        "multiple": False,
                        "relevance": "identity",
                        "linkedFormId": "form-patlasv4-proto-cat-parceria",
                        "options": ["MTI SIMPLIFICA", "MTI HOST"],
                        "spec": "Parceria recém-salva que recebe o casulo.",
                    },
                    {
                        "id": "mcat-casulo-catalogo",
                        "label": "Catálogo gerado",
                        "type": "text",
                        "size": "medium",
                        "readOnly": True,
                        "required": True,
                        "multiple": False,
                        "relevance": "identity",
                        "spec": "Nome provisório do rascunho (ex.: Catálogo <Parceria> — rascunho).",
                    },
                    {
                        "id": "mcat-casulo-status",
                        "label": "Status",
                        "type": "textOptions",
                        "size": "small",
                        "readOnly": True,
                        "required": True,
                        "multiple": False,
                        "relevance": "common",
                        "options": ["Rascunho"],
                        "spec": "Sempre inicia em Rascunho.",
                    },
                ],
                "exampleValuePresets": [
                    {
                        "id": "p-mcat-casulo-simplifica",
                        "name": "Casulo SIMPLIFICA",
                        "fieldValues": {
                            "mcat-casulo-parceria": "MTI SIMPLIFICA",
                            "mcat-casulo-catalogo": "Catálogo MTI SIMPLIFICA — rascunho",
                            "mcat-casulo-status": "Rascunho",
                        },
                    }
                ],
                "activeExamplePresetId": "p-mcat-casulo-simplifica",
            }
        )
    meths = parc.setdefault("methods", [])
    if not any(m.get("id") == "patlasv4proto-par-meth-casulo" for m in meths):
        meths.insert(
            0,
            {
                "id": "patlasv4proto-par-meth-casulo",
                "name": "Gerar catálogo rascunho",
                "icon": "note_add",
                "kind": "destaque",
                "inputFormId": casulo_form_id,
            },
        )
    for preset in parc.get("exampleValuePresets") or []:
        fv = preset.setdefault("fieldValues", {})
        cats = fv.get("form-patlasv4-proto-cat-parceria-catalogos")
        if not cats:
            nome = fv.get("form-patlasv4-proto-cat-parceria-identificador") or "Parceria"
            fv["form-patlasv4-proto-cat-parceria-catalogos"] = [f"Catálogo {nome} — rascunho"]

    # --- Métrica: Descrição + Catálogos ---
    met = fget(forms, "form-patlasv4-proto-cat-metrica")
    met["metadata"] = (
        "Validação 17/08: Nome, Descrição e Ativo. Consulta reversa: Catálogos, Parcerias e Produtos "
        "que usam a métrica. Cadastro exclusivo MTI."
    )
    desc = field(met, "form-patlasv4-proto-cat-metrica-descricao")
    desc["hidden"] = False
    desc["required"] = False
    desc["spec"] = "Descrição da métrica. Ex.: Unidade de Serviço Técnico."
    ensure_field(
        met,
        "form-patlasv4-proto-cat-metrica-parcerias",
        {
            "id": "form-patlasv4-proto-cat-metrica-catalogos",
            "label": "Catálogos",
            "type": "reference",
            "size": "large",
            "readOnly": True,
            "required": False,
            "multiple": True,
            "relevance": "common",
            "sectionId": "sec-cat-met-uso",
            "linkedFormId": "form-patlasv4-proto-cat-catalogo",
            "options": ["Catálogo MTI Simplifica", "MTI HOST"],
            "spec": (
                "Consulta reversa: catálogos que incluem esta métrica em «Métricas permitidas». "
                "Somente leitura — evita exclusão com relacionamentos."
            ),
        },
    )
    field(met, "form-patlasv4-proto-cat-metrica-parcerias")["spec"] = (
        "Consulta reversa: parcerias que usam esta métrica (via catálogo/produto)."
    )
    field(met, "form-patlasv4-proto-cat-metrica-produtos")["spec"] = (
        "Consulta reversa: produtos que selecionaram esta métrica."
    )
    for preset in met.get("exampleValuePresets") or []:
        fv = preset.setdefault("fieldValues", {})
        if "form-patlasv4-proto-cat-metrica-descricao" not in fv:
            nome = str(fv.get("form-patlasv4-proto-cat-metrica-identificador") or "")
            fv["form-patlasv4-proto-cat-metrica-descricao"] = {
                "UST": "Unidade de Serviço Técnico",
                "USN": "Unidade de Serviço de Negócio / licenciamento",
                "HST": "Hora de Serviço Técnico",
            }.get(nome, f"Métrica {nome}")
        if "form-patlasv4-proto-cat-metrica-catalogos" not in fv:
            fv["form-patlasv4-proto-cat-metrica-catalogos"] = [
                "Catálogo MTI Simplifica",
                "MTI HOST",
            ]

    # --- Complexidade do catálogo: deprecar (não usar) ---
    cx = fget(forms, "form-patlasv4-proto-cat-catalogo-complexidade")
    cx["name"] = "Complexidade do catálogo (removido — não usar)"
    cx["metadata"] = (
        "REMOVIDO na validação 17/08. Complexidade e coeficiente ficam no Produto (tipo Serviço). "
        "Não exibir no workspace de validação. Mantido só para histórico do protótipo."
    )
    for fl in cx.get("fields") or []:
        fl["hidden"] = True
    ensure_field(
        cx,
        None,
        {
            "id": "form-patlasv4-proto-cat-cx-alerta-removido",
            "label": "Aviso",
            "type": "alert",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "highlight",
            "alertVariant": "warning",
            "alertTitle": "Classe removida do Catálogo (17/08)",
            "alertMessage": (
                "Não use esta classe. Cadastre Complexidade / coeficiente / peso no Produto "
                "quando Tipo = Serviço."
            ),
        },
    )
    # ensure alert not hidden
    field(cx, "form-patlasv4-proto-cat-cx-alerta-removido")["hidden"] = False

    # --- CSV: colunas sem custo/markup/% + período mínimo ---
    csvf = fget(forms, "form-patlasv4-proto-metodo-cat-import-csv")
    tpl = field(csvf, "patlasv4proto-mcat-csv-template")
    tpl["spec"] = (
        "Prévia das colunas oficiais do parceiro (sem custo, markup ou %). "
        "Inclui grupo e período mínimo. Layout alinhado à validação 17/08."
    )
    for preset in csvf.get("exampleValuePresets") or []:
        fv = preset.setdefault("fieldValues", {})
        fv["patlasv4proto-mcat-csv-template"] = CSV_COLS
        fv["patlasv4proto-mcat-csv-resumo"] = (
            "80 ok · 0 erros · 12 novos · colunas sem custo/markup/% · período_mínimo presente"
        )

    # --- Dados de parceria: limpar aviso legado + markup demo ---
    dp = fget(forms, "form-patlasv4-proto-cat-dados-parceria")
    try:
        aviso = field(dp, "form-patlasv4-proto-cat-dados-parceria-alerta-proposta")
        # keep info alert from prior script; ensure not saying "não requisito fechado"
        if "não tratar" in (aviso.get("alertMessage") or "").lower() or "catalogo.m4a" in (
            aviso.get("spec") or ""
        ):
            pass
    except KeyError:
        pass
    # hide obsolete "Aviso" that still says open requirement if present
    for fl in dp.get("fields") or []:
        if fl.get("id") == "form-patlasv4-proto-cat-dados-parceria-aviso-legado":
            fl["hidden"] = True
        msg = (fl.get("alertMessage") or "") + (fl.get("spec") or "")
        if fl.get("type") == "alert" and "catalogo.m4a" in msg.lower():
            fl["hidden"] = True
            fl["spec"] = "Legado — oculto. Classe validada em 17/08."

    # --- Catálogo: garantir valor unitário da métrica visível na spec ---
    catlg = fget(forms, "form-patlasv4-proto-cat-catalogo")
    field(catlg, "form-patlasv4-proto-cat-catalogo-metricas")["spec"] = (
        "Obrigatório informar métrica + valor unitário da métrica. "
        "Universal → USN/UST/HST; Serviços → UST/HST; Licenciamento → USN. "
        "Valor unitário da métrica ≠ valor unitário do Produto."
    )
    # licensing demo preset if missing
    upsert_preset(
        catlg,
        {
            "id": "form-patlasv4-proto-cat-catalogo-p-licenca",
            "name": "Catálogo Licenciamento",
            "fieldValues": {
                "form-patlasv4-proto-cat-catalogo-identificador": "Catálogo Licenças Simplifica",
                "form-patlasv4-proto-cat-catalogo-parceria": "MTI SIMPLIFICA",
                "form-patlasv4-proto-cat-catalogo-solucao": "MTI Simplifica",
                "form-patlasv4-proto-cat-catalogo-versao": "1.0",
                "form-patlasv4-proto-cat-catalogo-status": "Rascunho",
                "form-patlasv4-proto-cat-catalogo-ativo": True,
                "form-patlasv4-proto-cat-catalogo-toggle-universal": False,
                "form-patlasv4-proto-cat-catalogo-toggle-servicos": False,
                "form-patlasv4-proto-cat-catalogo-toggle-licenca": True,
            },
            "embeddedRowsByFieldId": {
                "form-patlasv4-proto-cat-catalogo-metricas": [
                    {
                        "form-patlasv4-proto-cat-cmet-metrica": "USN",
                        "form-patlasv4-proto-cat-cmet-valor": 1,
                        "form-patlasv4-proto-cat-cmet-exige-qtde": False,
                        "form-patlasv4-proto-cat-cmet-ativo": True,
                    }
                ]
            },
        },
    )

    # --- Portal parceiro: reforçar CSV sem custo ---
    ppc = fget(forms, "form-patlasv4-proto-portal-parceiro-catalogo")
    field(ppc, "patlasv4proto-ppc-alerta")["alertMessage"] = (
        "Você monta o catálogo (rascunho) e os produtos da sua parceria, cadastra grupos e "
        "importa CSV (com período mínimo; sem custo, markup nem %). Ao enviar, a MTI analisa. "
        "Você não homologa, não publica e não apostila."
    )

    # --- Workspace: presets novos no mapa ---
    for ws in workspaces:
        for pkg in ws.get("packages") or []:
            for cls in pkg.get("classes") or []:
                if cls.get("id") == "cls-mapa-produto":
                    ids = list(cls.get("linkedFormExamplePresetIds") or [])
                    for extra in (
                        "form-patlasv4-proto-cat-produto-p-perpetuo",
                        "form-patlasv4-proto-cat-produto-p-ust",
                    ):
                        if extra not in ids:
                            ids.append(extra)
                    cls["linkedFormExamplePresetIds"] = ids
                if cls.get("id") == "cls-mapa-catalogo":
                    ids = list(cls.get("linkedFormExamplePresetIds") or [])
                    if "form-patlasv4-proto-cat-catalogo-p-licenca" not in ids:
                        ids.append("form-patlasv4-proto-cat-catalogo-p-licenca")
                    cls["linkedFormExamplePresetIds"] = ids
                if cls.get("linkedFormId") == "form-patlasv4-proto-cat-catalogo-complexidade":
                    cls["name"] = "Complexidade (removido — não usar)"

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    WS.write_text(json.dumps(workspaces, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print("OK finalize validacao", "forms", len(forms))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
