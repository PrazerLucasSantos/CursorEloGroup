# -*- coding: utf-8 -*-
"""
Finaliza Atlas V2 F2 — alinhado às fontes do chat + de-para 31/08 + requisitos 25–26/08.

Fontes soberanas (31/08 supersede onde conflitar):
- exports/de-para-planilhas-prototipo-final-20260831.html
- exports/requisitos-atlas-fase2-validacao-20260826.md
- decisões chat (fiscal fora; Universal/Individualizado; % parceiro vê nos próprios produtos)

Ações:
1. Restaura Sigla + alerta RN-IMP-01 na Parceria; corrige tipos Status/Índice
2. Reorganiza Catálogo e DPP em abas/sub-seções
3. Ajusta Produto (SIAG opcional F2; partnerHidden códigos; labels)
4. Completa masters F2 (Grupo, Métrica, Tipo Cobrança, Modelo Venda, Vertical)
5. Specs + métodos + partnerHidden finais
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/atlas-v2/forms.json"

LEGEND = (
    "`!` Parceiro · `#` MTI · `!#` Ambos · `?` Importado ERP (RO; admin edita) · "
    "MAIÚSCULAS/partnerHidden = parceiro não vê"
)
FONTE = "De-para 31/08 · requisitos F2 25–26/08 · chat ATLAS Catálogo"
META = "FINAL F2 Atlas V2 · validação 31/08/2026 · pronto para validação"


def D(serve: str, usar: str, origem: str, regras: str, *, classe: str, preenche: str = "", visualiza: str = "") -> str:
    lines = [
        f"**Classe:** {classe}",
        f"**Legenda:** {LEGEND}",
        f"**Para que serve:** {serve}",
        f"**Como usar:** {usar}",
        f"**Origem / de onde vem:** {origem}",
        f"**Regras:** {regras}",
    ]
    if preenche:
        lines.append(f"**Quem preenche:** {preenche}")
    if visualiza:
        lines.append(f"**Quem visualiza:** {visualiza}")
    lines.append("**Validação:** Confirmado — 31/08/2026")
    lines.append(f"**Fontes:** {FONTE}")
    return "\n".join(lines)


def find_form(forms: list, fid: str) -> dict:
    for f in forms:
        if f.get("id") == fid:
            return f
    raise KeyError(fid)


def fld_by_id(form: dict, fid: str) -> dict | None:
    return next((x for x in form.get("fields", []) if x.get("id") == fid), None)


def upsert(form: dict, field: dict, after_id: str | None = None) -> None:
    fields = form["fields"]
    idx = next((i for i, f in enumerate(fields) if f.get("id") == field["id"]), -1)
    if idx >= 0:
        cur = fields[idx]
        merged = {**cur, **field}
        # preserve options/linkedFormId if not overwritten
        fields[idx] = merged
        return
    if after_id:
        ai = next((i for i, f in enumerate(fields) if f.get("id") == after_id), -1)
        if ai >= 0:
            fields.insert(ai + 1, field)
            return
    fields.append(field)


def reorder(form: dict, order: list[str]) -> None:
    by = {f["id"]: f for f in form["fields"]}
    out = []
    seen = set()
    for fid in order:
        if fid in by:
            out.append(by[fid])
            seen.add(fid)
    for f in form["fields"]:
        if f["id"] not in seen:
            out.append(f)
    form["fields"] = out


def set_sec(form: dict, fid: str, section_id: str) -> None:
    f = fld_by_id(form, fid)
    if f:
        f["sectionId"] = section_id


def humanize_label(label: str) -> str:
    if not label:
        return label
    # Keep intentional acronyms but soften shouting OBSERVAÇÕES / CUSTO...
    fixes = {
        "OBSERVAÇÕES": "Observações",
        "CUSTO DE MERCADO MTI": "Custo de mercado MTI",
        "MARKUP": "Markup",
        "CÓDIGO SIAG - ITEM": "Código SIAG — item",
        "CÓDIGO PROTEUS - ITEM": "Código Protheus — item",
        "CÓDIGO N2 — SIAG": "Código N2 — SIAG",
        "CÓDIGO N2 — PROTHEUS": "Código N2 — Protheus",
        "CÓDIGO N3 — SIAG": "Código N3 — SIAG",
        "CÓDIGO N3 — PROTHEUS": "Código N3 — Protheus",
        "FOCAL Vendas": "Focal vendas",
        "FOCAL Pós-vendas": "Focal pós-vendas",
    }
    return fixes.get(label, label)


# ─── PARCERIA ───────────────────────────────────────────────────────
def finalize_parceria(form: dict) -> None:
    form["metadata"] = (
        f"{META} · RN-PAR-01..06 · RN-IMP-01 · Sigla → Código Atlas · Índice reajuste · "
        "Salvar gera Catálogo Rascunho"
    )
    form["sectionLayout"] = "tabs"
    form["sections"] = [
        {"id": "sec-parc-dados", "title": "Dados principais", "icon": "handshake"},
        {"id": "sec-parc-solucoes", "title": "Soluções da parceria", "icon": "layers"},
        {"id": "sec-parc-itens", "title": "Itens do catálogo", "icon": "inventory_2"},
    ]

    upsert(
        form,
        {
            "id": "form-patlasv4-proto-cat-parceria-alerta-import",
            "label": "Regra de importação",
            "type": "alert",
            "size": "large",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "highlight",
            "sectionId": "sec-parc-dados",
            "alertVariant": "info",
            "alertTitle": "RN-IMP-01 — Dados comerciais nascem no Atlas",
            "alertMessage": (
                "Importação ERP = somente códigos (parceira, N1/N2/N3). "
                "Dados comerciais cadastram-se no Atlas. Pós-importação: editável somente por administrador."
            ),
            "spec": "Regra transversal validada 31/08/2026 — não é campo persistido.",
        },
        None,
    )

    upsert(
        form,
        {
            "id": "form-patlasv4-proto-cat-parceria-sigla",
            "label": "Sigla (prefixo Código Atlas)",
            "type": "text",
            "size": "medium",
            "readOnly": False,
            "required": True,
            "multiple": False,
            "relevance": "highlight",
            "sectionId": "sec-parc-dados",
            "hidden": False,
            "spec": D(
                "Prefixo alfanumérico para gerar o Código Atlas dos produtos desta parceria.",
                "Informe 2–6 caracteres (ex.: SIMP, HOST) antes de cadastrar produtos.",
                "MTI define no cadastro da parceria.",
                "RN-PAR-05 / RN-PROD-08: Única entre parcerias. Código Atlas = Sigla + sequencial (SIMP001). ≠ Código Protheus.",
                classe="Parceria (Atlas Fase 2)",
                preenche="MTI",
                visualiza="MTI · Parceiro (consulta)",
            ),
        },
        "form-patlasv4-proto-cat-parceria-identificador",
    )

    # Índice = textOptions (não reference)
    idx = fld_by_id(form, "form-patlasv4-proto-cat-parceria-indice-reajuste")
    if idx:
        idx["type"] = "textOptions"
        idx["label"] = "Índice de reajuste"
        idx["options"] = ["IPCA", "IGPM", "INPC", "CPI"]
        idx.pop("linkedFormId", None)
        idx["spec"] = D(
            "Sigla do índice econômico aplicável aos reajustes desta parceria.",
            "Selecione IPCA, IGPM, INPC ou CPI. Cálculo numérico = evento pós-aprovação (12 meses).",
            "MTI cadastra por parceria.",
            "RN-PARC-06 (31/08): Índice por parceria. Manifestação de interesse ≠ índice.",
            classe="Parceria (Atlas Fase 2)",
            preenche="MTI",
            visualiza="MTI · Parceiro (consulta)",
        )

    st = fld_by_id(form, "form-patlasv4-proto-cat-parceria-status")
    if st:
        st["type"] = "textOptions"
        st["label"] = "Status"
        st["options"] = [
            "Rascunho",
            "Aguardando Análise - MTI",
            "Ajuste Solicitado",
            "Reprovado",
            "Homologado",
            "Ativo",
            "Paralisado",
        ]
        st.pop("linkedFormId", None)

    ativo = fld_by_id(form, "form-patlasv4-proto-cat-parceria-ativo")
    if ativo:
        ativo["required"] = True

    cat = fld_by_id(form, "form-patlasv4-proto-cat-parceria-catalogos")
    if cat:
        cat["readOnly"] = True
        cat["label"] = "Catálogo da parceria"

    # Map sections
    for fid, sec in [
        ("form-patlasv4-proto-cat-parceria-alerta-import", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-identificador", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-sigla", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-codigo-parceira", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-parceiro", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-vertical", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-indice-reajuste", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-descricao", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-catalogos", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-status", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-ativo", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-observacoes", "sec-parc-dados"),
        ("form-patlasv4-proto-cat-parceria-solucoes-view", "sec-parc-solucoes"),
        ("form-patlasv4-proto-cat-parceria-produtos", "sec-parc-itens"),
    ]:
        set_sec(form, fid, sec)

    reorder(
        form,
        [
            "form-patlasv4-proto-cat-parceria-alerta-import",
            "form-patlasv4-proto-cat-parceria-identificador",
            "form-patlasv4-proto-cat-parceria-sigla",
            "form-patlasv4-proto-cat-parceria-codigo-parceira",
            "form-patlasv4-proto-cat-parceria-parceiro",
            "form-patlasv4-proto-cat-parceria-vertical",
            "form-patlasv4-proto-cat-parceria-indice-reajuste",
            "form-patlasv4-proto-cat-parceria-descricao",
            "form-patlasv4-proto-cat-parceria-catalogos",
            "form-patlasv4-proto-cat-parceria-status",
            "form-patlasv4-proto-cat-parceria-ativo",
            "form-patlasv4-proto-cat-parceria-observacoes",
            "form-patlasv4-proto-cat-parceria-solucoes-view",
            "form-patlasv4-proto-cat-parceria-produtos",
        ],
    )

    # Specs key fields
    for fid, spec in {
        "form-patlasv4-proto-cat-parceria-identificador": D(
            "Nome comercial do acordo MTI × parceira (ex.: MTI SIMPLIFICA).",
            "MTI cadastra ao criar. Parceiro consulta após habilitação.",
            "Digitado pela MTI. Não importa ERP.",
            "RN-PARC-01: Obrigatório e único. Ao salvar, gera Catálogo Rascunho (RN-PAR-03).",
            classe="Parceria (Atlas Fase 2)", preenche="MTI", visualiza="MTI · Parceiro",
        ),
        "form-patlasv4-proto-cat-parceria-codigo-parceira": D(
            "Código da organização parceira no ERP (Protheus/Infocenter).",
            "Importado na carga. Após importação, só administrador altera.",
            "Importação ERP (somente códigos — Luís 31/08).",
            "RN-IMP-01. Parceiro visualiza vínculo; não edita código.",
            classe="Parceria (Atlas Fase 2)", preenche="Importação / Admin", visualiza="MTI · Parceiro (consulta)",
        ),
        "form-patlasv4-proto-cat-parceria-parceiro": D(
            "Organização parceira vinculada ao acordo.",
            "Selecione organização habilitada antes de liberar o portal.",
            "Referência Organização (Fase 1).",
            "Obrigatório quando há parceria comercial. Produto 100% MTI pode existir sem parceria (31/08).",
            classe="Parceria (Atlas Fase 2)", preenche="MTI", visualiza="MTI · Parceiro",
        ),
        "form-patlasv4-proto-cat-parceria-vertical": D(
            "Vertical de Serviço de TI do acordo.",
            "Selecione antes de publicar. Exibida RO no Catálogo/Produto.",
            "Cadastro na Parceria (não Organização, não Produto).",
            "RN-PARC-02 / RN-VERT-02: Obrigatório. Produto herda RO.",
            classe="Parceria (Atlas Fase 2)", preenche="MTI", visualiza="MTI · Parceiro (RO no catálogo/produto)",
        ),
    }.items():
        f = fld_by_id(form, fid)
        if f:
            f["spec"] = spec

    form["methods"] = [
        {
            "id": "patlasv4proto-parc-meth-salvar-gera-cat",
            "name": "Salvar (gera Catálogo Rascunho)",
            "icon": "save",
            "kind": "destaque",
            "spec": "RN-PAR-03: Persiste Parceria e, na criação, gera Catálogo em Rascunho vinculado.",
        },
        {
            "id": "patlasv4proto-parc-meth-enviar",
            "name": "Enviar para análise MTI",
            "icon": "send",
            "kind": "destaque",
            "spec": "Status → Aguardando Análise - MTI. Parceiro em RO até decisão (RN-MTI-01).",
        },
    ]

    # presets: ensure sigla
    for p in form.get("exampleValuePresets", []):
        fv = p.setdefault("fieldValues", {})
        if "SIMPLIFICA" in str(fv.get("form-patlasv4-proto-cat-parceria-identificador", "")).upper():
            fv.setdefault("form-patlasv4-proto-cat-parceria-sigla", "SIMP")
            fv.setdefault("form-patlasv4-proto-cat-parceria-indice-reajuste", "IPCA")
            fv.setdefault("form-patlasv4-proto-cat-parceria-status", "Ativo")
        if "HOST" in str(fv.get("form-patlasv4-proto-cat-parceria-identificador", "")).upper():
            fv.setdefault("form-patlasv4-proto-cat-parceria-sigla", "HOST")
            fv.setdefault("form-patlasv4-proto-cat-parceria-indice-reajuste", "IGPM")
            fv.setdefault("form-patlasv4-proto-cat-parceria-status", "Ativo")


# ─── SOLUÇÃO ────────────────────────────────────────────────────────
def finalize_solucao(form: dict) -> None:
    form["metadata"] = f"{META} · RN-SOL-01..05 · Catálogo resolvido pelo sistema"
    form["sectionLayout"] = "tabs"
    form["sections"] = [
        {"id": "sec-sol-dados", "title": "Dados", "icon": "inventory_2"},
        {"id": "sec-sol-produtos", "title": "Produtos da solução", "icon": "view_list"},
    ]
    for fid, sec in [
        ("form-patlasv4-proto-cat-solucao-identificador", "sec-sol-dados"),
        ("form-patlasv4-proto-cat-solucao-parceria", "sec-sol-dados"),
        ("form-patlasv4-proto-cat-solucao-catalogo", "sec-sol-dados"),
        ("form-patlasv4-proto-cat-solucao-descricao", "sec-sol-dados"),
        ("form-patlasv4-proto-cat-solucao-documentos-apoio", "sec-sol-dados"),
        ("form-patlasv4-proto-cat-solucao-ativo", "sec-sol-dados"),
        ("form-patlasv4-proto-cat-solucao-observacoes", "sec-sol-dados"),
        ("form-patlasv4-proto-cat-solucao-produtos", "sec-sol-produtos"),
    ]:
        set_sec(form, fid, sec)

    # Fabricante permanece FORA até sign-off (RN-SOL-05) — não reintroduzir
    form["methods"] = [
        {
            "id": "patlasv4proto-sol-meth-salvar",
            "name": "Salvar",
            "icon": "save",
            "kind": "destaque",
            "spec": "Persiste Solução. Sistema resolve Catálogo N2 (RN-SOL-03).",
        },
        {
            "id": "patlasv4proto-sol-meth-inativar",
            "name": "Inativar",
            "icon": "block",
            "kind": "menu",
            "spec": "RN-SOL-04: Ativo = Não. Preferir inativar a excluir com vínculos.",
        },
    ]


# ─── CATÁLOGO ───────────────────────────────────────────────────────
def finalize_catalogo(form: dict) -> None:
    form["metadata"] = (
        f"{META} · RN-CAT-01..08 · Eixo Universal/Individualizado · "
        "Tipo Licença/Serviço = por Produto · Focais/DTIC no Catálogo"
    )
    TAB = "sec-cat-dados"
    form["sectionLayout"] = "tabs"
    form["sections"] = [
        {"id": TAB, "title": "Catálogo", "icon": "menu_book"},
        {"id": "sec-cat-sub-ident", "title": "Identificação", "icon": "badge", "parentSectionId": TAB},
        {"id": "sec-cat-sub-class", "title": "Classificação de oferta", "icon": "category", "parentSectionId": TAB},
        {"id": "sec-cat-sub-var", "title": "Variação e métricas", "icon": "tune", "parentSectionId": TAB},
        {"id": "sec-cat-sub-resp", "title": "Responsáveis MTI", "icon": "group", "parentSectionId": TAB},
        {"id": "sec-cat-sub-cod", "title": "Códigos N2 / N3", "icon": "qr_code", "parentSectionId": TAB},
        {"id": "sec-cat-produtos", "title": "Produtos do catálogo", "icon": "view_list"},
    ]

    # Vertical RO herdada (de-para: exibir no Catálogo RO)
    upsert(
        form,
        {
            "id": "form-patlasv4-proto-cat-catalogo-vertical",
            "label": "Vertical de serviço de TI",
            "type": "reference",
            "size": "medium",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "sectionId": "sec-cat-sub-ident",
            "linkedFormId": "form-patlasv4-proto-cat-categoria",
            "spec": D(
                "Vertical do acordo, herdada da Parceria.",
                "Somente leitura. Cadastro na Parceria.",
                "Herdado da Parceria.",
                "RN-VERT-02 / RN-CAT-09: Não editar no Catálogo.",
                classe="Catálogo (Atlas Fase 2)",
                preenche="Sistema",
                visualiza="MTI · Parceiro (consulta)",
            ),
        },
        "form-patlasv4-proto-cat-catalogo-parceria",
    )

    # Alerta eixo oferta visível
    alerta = fld_by_id(form, "form-patlasv4-proto-cat-catalogo-alerta-oferta")
    if alerta:
        alerta.pop("hidden", None)
        alerta["sectionId"] = "sec-cat-sub-class"
        alerta["alertTitle"] = "Universal × Individualizado (31/08)"
        alerta["alertMessage"] = (
            "Eixo principal do catálogo. Licença e Serviço são definidos por item (Produto.Tipo), "
            "não por toggle de serviços/licenciamento do catálogo."
        )

    # Parceria opcional para catálogo 100% MTI
    parc = fld_by_id(form, "form-patlasv4-proto-cat-catalogo-parceria")
    if parc:
        parc["required"] = False
        parc["spec"] = D(
            "Parceria dona deste catálogo.",
            "Obrigatória para catálogo de parceiro. Vazia permitida se catálogo 100% MTI (31/08).",
            "Referência Parceria.",
            "Produto MTI exclusivo pode ficar sem parceria.",
            classe="Catálogo (Atlas Fase 2)", preenche="MTI", visualiza="MTI · Parceiro",
        )

    # partnerHidden códigos ERP
    for fid in [
        "form-patlasv4-proto-cat-catalogo-cod-siag-cat",
        "form-patlasv4-proto-cat-catalogo-cod-protheus-cat",
        "form-patlasv4-proto-cat-catalogo-cod-siag-univ",
        "form-patlasv4-proto-cat-catalogo-cod-protheus-univ",
    ]:
        f = fld_by_id(form, fid)
        if f:
            f["partnerHidden"] = True

    # Unidade DTIC / focais — parceiro RO (partner não edita = readOnly false for MTI, but partner can't edit in portal via partnerHidden? Actually partner should SEE them RO - use readOnly false for MTI, and in portal they'd be RO by role. Mark as not partnerHidden so partner sees.)
    for fid in [
        "form-patlasv4-proto-cat-catalogo-focal-vendas",
        "form-patlasv4-proto-cat-catalogo-focal-posvendas",
        "form-patlasv4-proto-cat-catalogo-unidade-dtic",
    ]:
        f = fld_by_id(form, fid)
        if f:
            f.pop("partnerHidden", None)

    # Status required
    st = fld_by_id(form, "form-patlasv4-proto-cat-catalogo-status")
    if st:
        st["required"] = True

    ativo = fld_by_id(form, "form-patlasv4-proto-cat-catalogo-ativo")
    if ativo:
        ativo["required"] = True

    # Objeto comercialização required? 31/08 says MTI defines - make required for publish but optional in draft - keep False

    sec_map = {
        "form-patlasv4-proto-cat-catalogo-identificador": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-parceria": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-vertical": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-solucao": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-objeto-comercializacao": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-descricao": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-status": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-ativo": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-versao": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-versao-anterior": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-data-atualizacao-preco": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-alerta-oferta": "sec-cat-sub-class",
        "form-patlasv4-proto-cat-catalogo-toggle-universal": "sec-cat-sub-class",
        "form-patlasv4-proto-cat-catalogo-toggle-individualizado": "sec-cat-sub-class",
        "form-patlasv4-proto-cat-catalogo-variacao": "sec-cat-sub-var",
        "form-patlasv4-proto-cat-catalogo-faixas-complexidade": "sec-cat-sub-var",
        "form-patlasv4-proto-cat-catalogo-metricas": "sec-cat-sub-var",
        "form-patlasv4-proto-cat-catalogo-focal-vendas": "sec-cat-sub-resp",
        "form-patlasv4-proto-cat-catalogo-focal-posvendas": "sec-cat-sub-resp",
        "form-patlasv4-proto-cat-catalogo-unidade-dtic": "sec-cat-sub-resp",
        "form-patlasv4-proto-cat-catalogo-cod-siag-cat": "sec-cat-sub-cod",
        "form-patlasv4-proto-cat-catalogo-cod-protheus-cat": "sec-cat-sub-cod",
        "form-patlasv4-proto-cat-catalogo-cod-siag-univ": "sec-cat-sub-cod",
        "form-patlasv4-proto-cat-catalogo-cod-protheus-univ": "sec-cat-sub-cod",
        "form-patlasv4-proto-cat-catalogo-observacoes": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-produtos": "sec-cat-produtos",
        "form-patlasv4-proto-cat-catalogo-alerta-trava-parceiro": "sec-cat-sub-ident",
        "form-patlasv4-proto-cat-catalogo-alerta-atos": "sec-cat-sub-ident",
    }
    for fid, sec in sec_map.items():
        set_sec(form, fid, sec)

    # Unhide trava alerta
    trava = fld_by_id(form, "form-patlasv4-proto-cat-catalogo-alerta-trava-parceiro")
    if trava:
        trava.pop("hidden", None)

    atos = fld_by_id(form, "form-patlasv4-proto-cat-catalogo-alerta-atos")
    if atos:
        atos.pop("hidden", None)

    # Visibility rules intact + ensure
    form["fieldVisibilityRules"] = [
        {
            "id": "rule-cat-variacao-complexidade",
            "operator": "eq",
            "sourceFieldId": "form-patlasv4-proto-cat-catalogo-variacao",
            "action": "show",
            "targetFieldIds": ["form-patlasv4-proto-cat-catalogo-faixas-complexidade"],
            "sourceKind": "textOptions",
            "expectedOptionText": "Por Complexidade",
        },
        {
            "id": "rule-cat-univ-codes",
            "operator": "eq",
            "sourceFieldId": "form-patlasv4-proto-cat-catalogo-toggle-universal",
            "action": "show",
            "targetFieldIds": [
                "form-patlasv4-proto-cat-catalogo-cod-siag-univ",
                "form-patlasv4-proto-cat-catalogo-cod-protheus-univ",
            ],
            "expectedBoolean": True,
            "sourceKind": "boolean",
        },
    ]

    # Method specs for empty ones
    for m in form.get("methods") or []:
        if m.get("name") == "Exportar CSV" and not (m.get("spec") or "").strip():
            m["spec"] = "Exporta planilha comercial do catálogo (sem markup/% MTI no arquivo do parceiro — RN-CSV-01)."
        if m.get("name") == "Exportar PDF" and not (m.get("spec") or "").strip():
            m["spec"] = "Gera PDF do catálogo/versão para análise e distribuição."
        if m.get("name") == "Solicitar ajuste" and not (m.get("spec") or "").strip():
            m["spec"] = "Devolve ao parceiro com justificativa. Status → Ajuste solicitado. Parceiro pode reeditar."

    # presets vertical
    for p in form.get("exampleValuePresets", []):
        fv = p.setdefault("fieldValues", {})
        if fv.get("form-patlasv4-proto-cat-catalogo-parceria") == "MTI SIMPLIFICA":
            fv.setdefault("form-patlasv4-proto-cat-catalogo-vertical", "Automação e Processos")
            fv.setdefault("form-patlasv4-proto-cat-catalogo-toggle-individualizado", True)
            fv.setdefault("form-patlasv4-proto-cat-catalogo-objeto-comercializacao", "MTI Simplifica")
        if fv.get("form-patlasv4-proto-cat-catalogo-parceria") == "MTI HOST":
            fv.setdefault("form-patlasv4-proto-cat-catalogo-vertical", "Nuvem")
            fv.setdefault("form-patlasv4-proto-cat-catalogo-toggle-individualizado", True)


# ─── PRODUTO ────────────────────────────────────────────────────────
def finalize_produto(form: dict) -> None:
    form["metadata"] = (
        f"{META} · RN-PROD-01..12 · item de catálogo · herança Catálogo · "
        "DPP em aba própria · códigos ERP partnerHidden"
    )

    # SIAG opcional F2
    siag = fld_by_id(form, "form-patlasv4-proto-cat-produto-cod-siag-item")
    if siag:
        siag["required"] = False
        siag["partnerHidden"] = True
        siag["label"] = "Código SIAG — item"

    prot = fld_by_id(form, "form-patlasv4-proto-cat-produto-cod-protheus-item")
    if prot:
        prot["partnerHidden"] = True
        prot["label"] = "Código Protheus — item"

    # Solução: required False when MTI-only? Keep required when catalog has solution - keep True as catalog always has solução

    alerta = fld_by_id(form, "form-patlasv4-proto-cat-produto-alerta-perpetuo")
    if alerta:
        alerta.pop("hidden", None)  # shown by visibility rule when Perpétuo

    # Ensure methods include note about CSV on catalog
    form["methods"] = [
        {
            "id": "patlasv4proto-prod-meth-salvar",
            "name": "Salvar",
            "icon": "save",
            "kind": "destaque",
            "spec": "Persiste item. Herda Parceria/Solução/Versão/Tipo de oferta do Catálogo (RN-PROD-01). Gera Código Atlas se novo (RN-PROD-08).",
        },
        {
            "id": "patlasv4proto-prod-meth-enviar",
            "name": "Enviar para análise",
            "icon": "send",
            "kind": "menu",
            "spec": "Envia junto ao fluxo do catálogo. Após envio, parceiro em RO (RN-MTI-01).",
        },
    ]

    # Presets: vertical present
    for p in form.get("exampleValuePresets", []):
        fv = p.setdefault("fieldValues", {})
        if fv.get("form-patlasv4-proto-cat-produto-parceria") == "MTI SIMPLIFICA":
            fv.setdefault("form-patlasv4-proto-cat-produto-vertical", "Automação e Processos")


# ─── DPP ────────────────────────────────────────────────────────────
def finalize_dpp(form: dict) -> None:
    form["metadata"] = (
        f"{META} · RN-DP-01..05 · Custo (parceiro) + Markup (MTI sigilo) · "
        "% calculados — parceiro vê nos próprios produtos (31/08)"
    )
    form["sectionLayout"] = "tabs"
    form["sections"] = [
        {"id": "sec-dp-info", "title": "Vínculo", "icon": "link"},
        {"id": "sec-dp-cond", "title": "Condições comerciais", "icon": "payments"},
    ]

    upsert(
        form,
        {
            "id": "form-patlasv4-proto-cat-dados-parceria-alerta",
            "label": "Escopo DPP",
            "type": "alert",
            "size": "large",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "highlight",
            "sectionId": "sec-dp-cond",
            "alertVariant": "info",
            "alertTitle": "RN-DP-01 — Condições comerciais canônicas",
            "alertMessage": (
                "Parceiro: Custo + Período mínimo. MTI: Markup e custo de mercado (sigilo). "
                "% Parceiro e % MTI calculados — parceiro visualiza nos próprios produtos (31/08). "
                "CSV do parceiro sem markup/% MTI (RN-CSV-01). Valor unitário do Produto = custo × markup."
            ),
            "spec": "RN-DP-01 / RN-DP-03 (atualizado 31/08) / RN-CSV-01",
        },
        None,
    )

    # Remove old alerta if different id
    form["fields"] = [
        f
        for f in form["fields"]
        if f.get("id") != "form-patlasv4-proto-cat-dados-parceria-alerta-proposta"
    ]

    for fid, sec in [
        ("form-patlasv4-proto-cat-dados-parceria-parceria", "sec-dp-info"),
        ("form-patlasv4-proto-cat-dados-parceria-solucao", "sec-dp-info"),
        ("form-patlasv4-proto-cat-dados-parceria-produto", "sec-dp-info"),
        ("form-patlasv4-proto-cat-dados-parceria-ativo", "sec-dp-info"),
        ("form-patlasv4-proto-cat-dados-parceria-alerta", "sec-dp-cond"),
        ("form-patlasv4-proto-cat-dados-parceria-periodo-minimo", "sec-dp-cond"),
        ("form-patlasv4-proto-cat-dados-parceria-custo-parceiro", "sec-dp-cond"),
        ("form-patlasv4-proto-cat-dados-parceria-custo-mercado", "sec-dp-cond"),
        ("form-patlasv4-proto-cat-dados-parceria-markup", "sec-dp-cond"),
        ("form-patlasv4-proto-cat-dados-parceria-dist-parceiro", "sec-dp-cond"),
        ("form-patlasv4-proto-cat-dados-parceria-dist-mti", "sec-dp-cond"),
    ]:
        set_sec(form, fid, sec)

    # Labels / partnerHidden
    for fid, label, ph in [
        ("form-patlasv4-proto-cat-dados-parceria-custo-parceiro", "Custo do parceiro", False),
        ("form-patlasv4-proto-cat-dados-parceria-custo-mercado", "Custo de mercado MTI", True),
        ("form-patlasv4-proto-cat-dados-parceria-markup", "Markup", True),
        ("form-patlasv4-proto-cat-dados-parceria-dist-parceiro", "% Parceiro", False),
        ("form-patlasv4-proto-cat-dados-parceria-dist-mti", "% MTI", False),
        ("form-patlasv4-proto-cat-dados-parceria-periodo-minimo", "Período mínimo", False),
    ]:
        f = fld_by_id(form, fid)
        if not f:
            continue
        f["label"] = label
        if ph:
            f["partnerHidden"] = True
        else:
            f.pop("partnerHidden", None)

    # % are RO calculated; not required to fill (system fills) — keep required for display completeness
    for fid in [
        "form-patlasv4-proto-cat-dados-parceria-dist-parceiro",
        "form-patlasv4-proto-cat-dados-parceria-dist-mti",
    ]:
        f = fld_by_id(form, fid)
        if f:
            f["readOnly"] = True
            f["required"] = False  # calculated — don't block save before calc in prototype

    reorder(
        form,
        [
            "form-patlasv4-proto-cat-dados-parceria-parceria",
            "form-patlasv4-proto-cat-dados-parceria-solucao",
            "form-patlasv4-proto-cat-dados-parceria-produto",
            "form-patlasv4-proto-cat-dados-parceria-ativo",
            "form-patlasv4-proto-cat-dados-parceria-alerta",
            "form-patlasv4-proto-cat-dados-parceria-periodo-minimo",
            "form-patlasv4-proto-cat-dados-parceria-custo-parceiro",
            "form-patlasv4-proto-cat-dados-parceria-custo-mercado",
            "form-patlasv4-proto-cat-dados-parceria-markup",
            "form-patlasv4-proto-cat-dados-parceria-dist-parceiro",
            "form-patlasv4-proto-cat-dados-parceria-dist-mti",
        ],
    )

    form["methods"] = [
        {
            "id": "patlasv4proto-dp-meth-salvar",
            "name": "Salvar",
            "icon": "save",
            "kind": "destaque",
            "spec": "Persiste condições. Recalcula % e valor unitário do Produto (custo × markup). Fórmula fina a sign-off Luís (RN-DP-04).",
        },
        {
            "id": "patlasv4proto-dp-meth-inativar",
            "name": "Inativar",
            "icon": "block",
            "kind": "menu",
            "spec": "Ativo = Não sem apagar histórico.",
        },
    ]


# ─── MASTERS ────────────────────────────────────────────────────────
MASTER_SPECS = {
    "form-patlasv4-proto-cat-grupo": {
        "meta": f"{META} · RN-GRP-01..03 · Grupo comercial por Parceria",
        "methods": True,
    },
    "form-patlasv4-proto-cat-metrica": {
        "meta": f"{META} · Métricas comerciais (UST/HST/USN…) · filtradas no Catálogo",
        "methods": True,
    },
    "form-patlasv4-proto-cat-tipo-cobranca": {
        "meta": f"{META} · RN-COB-01..03 · Perpétuo → Única",
        "methods": True,
    },
    "form-patlasv4-proto-cat-modelo-venda": {
        "meta": f"{META} · RN-MV-01..03 · distinto de Tipo de Cobrança",
        "methods": True,
    },
    "form-patlasv4-proto-cat-categoria": {
        "meta": f"{META} · Vertical de Serviço de TI · RN-VERT-01..05 · vincula à Parceria",
        "methods": True,
    },
    "form-patlasv4-proto-cat-catalogo-complexidade": {
        "meta": f"{META} · Faixa + coeficiente · usado quando Catálogo.Variação = Por Complexidade",
        "methods": True,
    },
}


def finalize_master(form: dict, meta: str) -> None:
    form["metadata"] = meta
    # Humanize + minimal specs
    for fld in form.get("fields", []):
        if fld.get("type") == "alert":
            continue
        lab = humanize_label(fld.get("label") or "")
        fld["label"] = lab
        if not fld.get("spec") or "Como usar" not in fld.get("spec", ""):
            fld["spec"] = D(
                f"Campo «{lab}» do cadastro mestre {form.get('name')}.",
                "MTI mantém no backoffice; Produto/Catálogo selecionam valores ativos.",
                "Cadastro Atlas Fase 2.",
                "Não excluir em uso; preferir inativar.",
                classe=f"{form.get('name')} (Atlas Fase 2)",
                preenche="MTI",
                visualiza="MTI · Parceiro (seleção nos cadastros)",
            )
    if not form.get("methods"):
        slug = form["id"].replace("form-patlasv4-proto-cat-", "")
        form["methods"] = [
            {
                "id": f"patlasv4proto-{slug}-meth-salvar",
                "name": "Salvar",
                "icon": "save",
                "kind": "destaque",
                "spec": f"Persiste {form.get('name')}.",
            },
            {
                "id": f"patlasv4proto-{slug}-meth-inativar",
                "name": "Inativar",
                "icon": "block",
                "kind": "menu",
                "spec": "Ativo = Não. Preferir inativar a excluir se houver vínculos.",
            },
        ]


def humanize_all(form: dict) -> None:
    for fld in form.get("fields", []):
        if "label" in fld and isinstance(fld["label"], str):
            fld["label"] = humanize_label(fld["label"])


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))

    finalize_parceria(find_form(forms, "form-patlasv4-proto-cat-parceria"))
    finalize_solucao(find_form(forms, "form-patlasv4-proto-cat-solucao"))
    finalize_catalogo(find_form(forms, "form-patlasv4-proto-cat-catalogo"))
    finalize_produto(find_form(forms, "form-patlasv4-proto-cat-produto"))
    finalize_dpp(find_form(forms, "form-patlasv4-proto-cat-dados-parceria"))

    for fid, cfg in MASTER_SPECS.items():
        try:
            finalize_master(find_form(forms, fid), cfg["meta"])
        except KeyError:
            print(f"WARN: master ausente {fid}")

    # Humanize labels on core 5
    for fid in [
        "form-patlasv4-proto-cat-parceria",
        "form-patlasv4-proto-cat-solucao",
        "form-patlasv4-proto-cat-catalogo",
        "form-patlasv4-proto-cat-produto",
        "form-patlasv4-proto-cat-dados-parceria",
    ]:
        humanize_all(find_form(forms, fid))

    # Strip any leftover DELETE
    for fid in [
        "form-patlasv4-proto-cat-parceria",
        "form-patlasv4-proto-cat-solucao",
        "form-patlasv4-proto-cat-catalogo",
        "form-patlasv4-proto-cat-produto",
        "form-patlasv4-proto-cat-dados-parceria",
    ]:
        f = find_form(forms, fid)
        f["fields"] = [x for x in f["fields"] if not str(x.get("label", "")).startswith("DELETE")]
        f["sections"] = [
            s
            for s in f.get("sections", [])
            if "DELETE" not in str(s.get("title", "")) and "delete" not in str(s.get("id", "")).lower()
        ]

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Report
    print(f"OK finalizado: {FORMS}")
    for fid in [
        "form-patlasv4-proto-cat-parceria",
        "form-patlasv4-proto-cat-solucao",
        "form-patlasv4-proto-cat-catalogo",
        "form-patlasv4-proto-cat-produto",
        "form-patlasv4-proto-cat-dados-parceria",
    ]:
        f = find_form(forms, fid)
        active = [x for x in f["fields"] if x.get("type") != "alert" and not x.get("hidden")]
        print(
            f"  {f['name']}: {len(active)} campos · {len(f.get('methods') or [])} métodos · "
            f"layout={f.get('sectionLayout')} · secs={len(f.get('sections') or [])}"
        )
        sigla = fld_by_id(f, "form-patlasv4-proto-cat-parceria-sigla") if "parceria" in fid else None
        if fid.endswith("parceria") and not fid.endswith("dados-parceria"):
            print(f"    Sigla: {'OK' if sigla else 'MISSING'}")


if __name__ == "__main__":
    main()
