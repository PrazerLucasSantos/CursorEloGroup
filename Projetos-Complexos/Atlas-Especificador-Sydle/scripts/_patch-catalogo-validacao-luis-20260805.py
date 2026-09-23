# -*- coding: utf-8 -*-
"""Alinha forms de Catálogo/Produto à validação Luís 05/08/2026."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"

FID_MET = "form-patlasv4-proto-cat-metrica"
FID_COB = "form-patlasv4-proto-cat-tipo-cobranca"
FID_MV = "form-patlasv4-proto-cat-modelo-venda"
FID_SOL = "form-patlasv4-proto-cat-solucao"
FID_PAR = "form-patlasv4-proto-cat-parceria"
FID_PROD = "form-patlasv4-proto-cat-produto"
FID_CAT = "form-patlasv4-proto-cat-catalogo"
FID_UNI = "form-patlasv4-proto-cat-universal"

PROD_FOCAL_V = "form-patlasv4-proto-cat-produto-focal-vendas"
PROD_FOCAL_P = "form-patlasv4-proto-cat-produto-focal-posvendas"
PROD_DTIC = "form-patlasv4-proto-cat-produto-unidade-dtic"
PROD_QTDE = "form-patlasv4-proto-cat-produto-qtde-hst-ust"
PROD_QTDE_NEW = "form-patlasv4-proto-cat-produto-qtde-metrica"

CAT_TOGGLE_UNI = "form-patlasv4-proto-cat-catalogo-toggle-universal"
CAT_TOGGLE_SERV = "form-patlasv4-proto-cat-catalogo-toggle-servicos"


def find(forms: list, fid: str) -> dict:
    for f in forms:
        if f.get("id") == fid:
            return f
    raise KeyError(fid)


def field(form: dict, fid: str) -> dict | None:
    for fl in form.get("fields") or []:
        if fl.get("id") == fid:
            return fl
    return None


def hide_fields(form: dict, ids: list[str], reason: str) -> None:
    for fid in ids:
        fl = field(form, fid)
        if not fl:
            continue
        fl["hidden"] = True
        fl["required"] = False
        fl["relevance"] = "common"
        spec = fl.get("spec") or ""
        note = f"\n\n**Validação Luís 05/08:** {reason}"
        if "Validação Luís 05/08" not in spec:
            fl["spec"] = spec + note if spec else note.strip()


def scrub_presets(form: dict, keys: list[str]) -> None:
    for p in form.get("exampleValuePresets") or []:
        fv = p.get("fieldValues") or {}
        for k in keys:
            fv.pop(k, None)


def patch_cobranca(form: dict) -> None:
    form["metadata"] = (
        "Validação Luís 05/08: cobrança do produto = Mensal · Anual · Conforme homologação. "
        "Sob demanda / OS = forma de consumo (proposta/Fase 3), não tipo de cobrança do item."
    )
    modelo = field(form, "form-patlasv4-proto-cat-tipo-cobranca-modelo")
    if modelo:
        modelo["spec"] = (
            "**Para que serve:** Nome do tipo de cobrança do produto.\n\n"
            "**Valores alinhados (Luís 05/08):** Mensal · Anual · Conforme homologação.\n\n"
            "**Regras:** Distinto de forma de consumo (sob demanda / OS)."
        )
    recorr = field(form, "form-patlasv4-proto-cat-tipo-cobranca-recorrencia")
    if recorr:
        recorr["hidden"] = True
        recorr["required"] = False
        recorr["spec"] = (
            "Oculto pós-validação Luís: cobrança ficou nos três valores acima; "
            "recorrência/consumo detalhado na Fase 3."
        )
    form["exampleValuePresets"] = [
        {
            "id": "p-tc-mensal",
            "name": "Mensal",
            "fieldValues": {
                "form-patlasv4-proto-cat-tipo-cobranca-modelo": "Mensal",
            },
        },
        {
            "id": "p-tc-anual",
            "name": "Anual",
            "fieldValues": {
                "form-patlasv4-proto-cat-tipo-cobranca-modelo": "Anual",
            },
        },
        {
            "id": "p-tc-homolog",
            "name": "Conforme homologação",
            "fieldValues": {
                "form-patlasv4-proto-cat-tipo-cobranca-modelo": "Conforme homologação",
            },
        },
    ]
    form["activeExamplePresetId"] = "p-tc-mensal"


def patch_modelo_venda(form: dict) -> None:
    form["metadata"] = (
        "Validação Luís 05/08: provisório — Por Licença · Por Serviço · Por Pacote. "
        "Luís pode simplificar/remover; detalhes (OP/Subscrição) podem ir na descrição do produto."
    )
    ident = field(form, "form-patlasv4-proto-cat-modelo-venda-identificador")
    if ident:
        ident["spec"] = (
            "**Para que serve:** Forma comercial do produto (não confundir com Tipo de Cobrança).\n\n"
            "**Valores provisórios:** Por Licença · Por Serviço · Por Pacote.\n\n"
            "**Status:** a confirmar com Luís (possível enxugar)."
        )
    form["exampleValuePresets"] = [
        {
            "id": "p-mv-licenca",
            "name": "Por Licença",
            "fieldValues": {
                "form-patlasv4-proto-cat-modelo-venda-identificador": "Por Licença",
                "form-patlasv4-proto-cat-modelo-venda-descricao": "Comercialização unitária de licença",
            },
        },
        {
            "id": "p-mv-servico",
            "name": "Por Serviço",
            "fieldValues": {
                "form-patlasv4-proto-cat-modelo-venda-identificador": "Por Serviço",
                "form-patlasv4-proto-cat-modelo-venda-descricao": "Prestação de serviço (UST/HST)",
            },
        },
        {
            "id": "p-mv-pacote",
            "name": "Por Pacote",
            "fieldValues": {
                "form-patlasv4-proto-cat-modelo-venda-identificador": "Por Pacote",
                "form-patlasv4-proto-cat-modelo-venda-descricao": "Conjunto fechado de itens/entregas",
            },
        },
    ]
    form["activeExamplePresetId"] = "p-mv-servico"


def patch_metrica(form: dict) -> None:
    form["metadata"] = (
        "Validação Luís 05/08: classe só nome (+ descrição). "
        "Métricas de catálogo canônicas: USN · UST · HST. Sem cálculo na classe."
    )
    desc = field(form, "form-patlasv4-proto-cat-metrica-descricao")
    if desc:
        desc["label"] = "Descrição (simples)"
        desc["spec"] = (
            "**Para que serve:** Texto simples explicando a métrica.\n\n"
            "**Regras (Luís):** só nome é obrigatório; descrição opcional e simples."
        )


def patch_solucao(form: dict) -> None:
    form["metadata"] = (
        "Validação Luís 05/08: Solução enxuta = Nome + Parceria + Descrição. "
        "Fabricante/docs ocultos (opcional futuro)."
    )
    hide_fields(
        form,
        [
            "form-patlasv4-proto-cat-solucao-fabricante-nome",
            "form-patlasv4-proto-cat-solucao-fabricante-contato",
            "form-patlasv4-proto-cat-solucao-documentos-apoio",
            "form-patlasv4-proto-cat-solucao-observacoes",
        ],
        "fora do escopo mínimo validado (nome + parceria + descrição).",
    )
    scrub_presets(
        form,
        [
            "form-patlasv4-proto-cat-solucao-fabricante-nome",
            "form-patlasv4-proto-cat-solucao-fabricante-contato",
            "form-patlasv4-proto-cat-solucao-documentos-apoio",
            "form-patlasv4-proto-cat-solucao-observacoes",
        ],
    )


def patch_parceria(form: dict) -> None:
    form["metadata"] = (
        "Validação Luís 05/08: Parceria = Nome + Organização + Soluções. "
        "Status DIREX / responsável / datas ocultos do mínimo validado."
    )
    hide_fields(
        form,
        [
            "form-patlasv4-proto-cat-parceria-descricao",
            "form-patlasv4-proto-cat-parceria-status",
            "form-patlasv4-proto-cat-parceria-observacoes",
            "form-patlasv4-proto-cat-parceria-data-homologacao-direx",
            "form-patlasv4-proto-cat-parceria-responsavel-homologacao",
        ],
        "fora do mínimo validado (nome + organização + soluções).",
    )
    scrub_presets(
        form,
        [
            "form-patlasv4-proto-cat-parceria-descricao",
            "form-patlasv4-proto-cat-parceria-status",
            "form-patlasv4-proto-cat-parceria-observacoes",
            "form-patlasv4-proto-cat-parceria-data-homologacao-direx",
            "form-patlasv4-proto-cat-parceria-responsavel-homologacao",
        ],
    )


def patch_produto(form: dict) -> None:
    form["metadata"] = (
        "Validação Luís 05/08 — Produto: Licença|Serviço; qtde da métrica; "
        "cobrança Mensal/Anual/Conforme homologação; focais/DTIC no catálogo da parceria; "
        "complexidade só Serviço; moeda/fator se Universal=Sim."
    )

    # Rename quantity field
    qtde = field(form, PROD_QTDE)
    if qtde:
        qtde["id"] = PROD_QTDE_NEW
        qtde["label"] = "Quantidade da métrica"
        qtde["spec"] = (
            "**Para que serve:** Quantidade da métrica selecionada (USN, UST, HST ou outra).\n\n"
            "**Regras (Luís 05/08):** NÃO hardcodar “qtde HST/UST”. Depende da métrica do produto.\n\n"
            "**Visibilidade:** somente se Tipo = Serviço."
        )
        qtde["hidden"] = True

    # Hide focals / DTIC on product
    hide_fields(
        form,
        [PROD_FOCAL_V, PROD_FOCAL_P, PROD_DTIC],
        "responsáveis ficam no Catálogo da parceria, não no Produto.",
    )

    cob = field(form, "form-patlasv4-proto-cat-produto-cobranca")
    if cob:
        cob["options"] = ["Mensal", "Anual", "Conforme homologação"]
        cob["spec"] = (
            "**Para que serve:** Quando o produto é cobrado.\n\n"
            "**Valores (Luís):** Mensal · Anual · Conforme homologação.\n\n"
            "**Regras:** Distinto de consumo sob demanda/OS (Fase 3)."
        )

    mv = field(form, "form-patlasv4-proto-cat-produto-modelo-venda")
    if mv:
        mv["options"] = ["Por Licença", "Por Serviço", "Por Pacote"]
        mv["spec"] = (
            "**Para que serve:** Forma comercial (provisório pós-Luís).\n\n"
            "**Valores:** Por Licença · Por Serviço · Por Pacote.\n\n"
            "**Status:** a confirmar."
        )

    tipo = field(form, "form-patlasv4-proto-cat-produto-tipo")
    if tipo:
        tipo["spec"] = (
            "**Para que serve:** Natureza do item — só Licença ou Serviço.\n\n"
            "**Regras (Luís):** não existe outra coisa. Serviço → complexidade, coeficiente, peso, qtde da métrica. "
            "Licença → esses campos ocultos."
        )

    moeda = field(form, "form-patlasv4-proto-cat-produto-moeda-universal")
    if moeda:
        moeda["spec"] = (
            "**Para que serve:** Valor da moeda universal (preenchido quando Universal=Sim).\n\n"
            "**Regras (Luís):** aparece só se Universal; base do fator automático (até 6 casas)."
        )

    fator = field(form, "form-patlasv4-proto-cat-produto-fator-conversao")
    if fator:
        fator["spec"] = (
            "**Para que serve:** Fator = valor unitário ÷ valor da moeda universal.\n\n"
            "**Regras (Luís):** calculado automaticamente; até 6 casas decimais; só se Universal=Sim."
        )

    cx = field(form, "form-patlasv4-proto-cat-produto-coeficiente-complexidade")
    if cx:
        cx["readOnly"] = True
        cx["spec"] = (
            "**Para que serve:** Coeficiente derivado da complexidade (ex.: muito baixa 0,4).\n\n"
            "**Regras (Luís):** tipicamente determinado pelo catálogo/parceria; exibido em leitura "
            "conforme a complexidade escolhida. Só Serviço."
        )

    # Visibility rules
    rules = form.get("fieldVisibilityRules") or []
    for r in rules:
        if r.get("id") == "rule-cat-prod-servico-show":
            targets = r.get("targetFieldIds") or []
            targets = [
                PROD_QTDE_NEW if t == PROD_QTDE else t
                for t in targets
            ]
            # ensure qtde metrica present
            if PROD_QTDE_NEW not in targets:
                targets.append(PROD_QTDE_NEW)
            r["targetFieldIds"] = targets
        if r.get("id") == "rule-prod-moeda-univ":
            # also show fator when universal
            tids = r.setdefault("targetFieldIds", [])
            if "form-patlasv4-proto-cat-produto-fator-conversao" not in tids:
                tids.append("form-patlasv4-proto-cat-produto-fator-conversao")

    # Scrub presets
    for p in form.get("exampleValuePresets") or []:
        fv = p.get("fieldValues") or {}
        for k in (PROD_FOCAL_V, PROD_FOCAL_P, PROD_DTIC):
            fv.pop(k, None)
        if PROD_QTDE in fv:
            fv[PROD_QTDE_NEW] = fv.pop(PROD_QTDE)
        cobr = fv.get("form-patlasv4-proto-cat-produto-cobranca")
        if cobr == "Sob Demanda":
            fv["form-patlasv4-proto-cat-produto-cobranca"] = "Conforme homologação"
        if cobr == "Homologação":
            fv["form-patlasv4-proto-cat-produto-cobranca"] = "Conforme homologação"
        mvv = fv.get("form-patlasv4-proto-cat-produto-modelo-venda")
        if mvv == "Serviço":
            fv["form-patlasv4-proto-cat-produto-modelo-venda"] = "Por Serviço"
        if mvv == "Homologação":
            fv["form-patlasv4-proto-cat-produto-modelo-venda"] = "Por Pacote"


def insert_after(fields: list, after_id: str, new_fields: list[dict]) -> None:
    idx = next((i for i, f in enumerate(fields) if f.get("id") == after_id), None)
    if idx is None:
        fields.extend(new_fields)
        return
    for j, nf in enumerate(new_fields):
        fields.insert(idx + 1 + j, nf)


def patch_catalogo(form: dict) -> None:
    form["name"] = "Catálogo da parceria"
    form["metadata"] = (
        "Validação Luís 05/08 — Catálogo da parceria: cardápio versionado + focais/DTIC. "
        "Toggles Universal? e Catálogo de serviços?. Produtos aprovados formam o cardápio. "
        "CSV pode variar por parceria."
    )

    # Add toggles after parceria field (or after identificador)
    fields = form["fields"]
    if not field(form, CAT_TOGGLE_UNI):
        insert_after(
            fields,
            "form-patlasv4-proto-cat-catalogo-parceria",
            [
                {
                    "id": CAT_TOGGLE_UNI,
                    "label": "Universal?",
                    "type": "boolean",
                    "size": "medium",
                    "readOnly": False,
                    "required": True,
                    "multiple": False,
                    "relevance": "highlight",
                    "sectionId": "sec-cat-parceria",
                    "spec": (
                        "**Para que serve:** Indica se este catálogo da parceria pode ser comercializado "
                        "via créditos universais (Tipo 3).\n\n"
                        "**Regras (Luís):** pode ser Sim junto com Catálogo de serviços. "
                        "Nem toda parceria entra no crédito universal de TIC."
                    ),
                },
                {
                    "id": CAT_TOGGLE_SERV,
                    "label": "Catálogo de serviços?",
                    "type": "boolean",
                    "size": "medium",
                    "readOnly": False,
                    "required": True,
                    "multiple": False,
                    "relevance": "highlight",
                    "sectionId": "sec-cat-parceria",
                    "spec": (
                        "**Para que serve:** Indica comercialização com métrica de serviço (UST/HST) — caminho Tipo 2 de serviços.\n\n"
                        "**Regras (Luís):** independente de Universal?; ambos podem ser Sim."
                    ),
                },
            ],
        )

    cob = field(form, "form-patlasv4-proto-cat-catalogo-cobranca")
    if cob:
        cob["required"] = False
        cob["options"] = ["Mensal", "Anual", "Conforme homologação"]
        cob["spec"] = (
            "**Para que serve:** Cobrança do pacote/catálogo, quando aplicável.\n\n"
            "**Valores:** Mensal · Anual · Conforme homologação.\n\n"
            "**Nota (Luís):** sob demanda amarra a catálogo de serviços/métrica; "
            "consumo detalhado na Fase 3. Obrigatório no produto."
        )

    # Update focals specs
    for fid, label in [
        ("form-patlasv4-proto-cat-catalogo-focal-vendas", "Focal de vendas"),
        ("form-patlasv4-proto-cat-catalogo-focal-posvendas", "Focal de pós-vendas"),
        ("form-patlasv4-proto-cat-catalogo-unidade-dtic", "Unidade DTIC"),
    ]:
        fl = field(form, fid)
        if fl:
            fl["spec"] = (
                f"**Para que serve:** {label} do catálogo da parceria.\n\n"
                "**Regras (Luís 05/08):** responsáveis ficam AQUI (não no Produto nem no Universal). "
                "Cada parceria tem seus representantes."
            )

    for p in form.get("exampleValuePresets") or []:
        fv = p.get("fieldValues") or {}
        cobr = fv.get("form-patlasv4-proto-cat-catalogo-cobranca")
        if cobr in ("Sob Demanda", "Homologação"):
            # Simplifica/serviços → conforme homologação como default de produto-path;
            # catálogo de serviços usa toggle
            fv["form-patlasv4-proto-cat-catalogo-cobranca"] = "Conforme homologação"
        name = (p.get("name") or "").lower()
        if "simplifica" in name or "ust" in name:
            fv[CAT_TOGGLE_UNI] = True
            fv[CAT_TOGGLE_SERV] = True
        elif "host" in name or "usn" in name:
            fv[CAT_TOGGLE_UNI] = True
            fv[CAT_TOGGLE_SERV] = False
        else:
            fv.setdefault(CAT_TOGGLE_UNI, False)
            fv.setdefault(CAT_TOGGLE_SERV, False)


def patch_universal(form: dict) -> None:
    form["name"] = "Catálogo Universal"
    form["metadata"] = (
        "Validação Luís 05/08 — redirecionador de créditos (Tipo 3). "
        "SEM focais/responsáveis. Agrega catálogos de parceria elegíveis."
    )
    ident = field(form, "form-patlasv4-proto-cat-universal-identificador")
    if ident:
        ident["spec"] = (
            "**Para que serve:** Nome do catálogo universal (créditos).\n\n"
            "**Regras (Luís):** é redirecionador — aponta para catálogos de parceria; "
            "não tem focais/DTIC."
        )
    cats = field(form, "form-patlasv4-proto-cat-universal-catalogos")
    if cats:
        cats["spec"] = (
            "**Para que serve:** Catálogos da parceria elegíveis ao Tipo 3.\n\n"
            "**Regras:** só catálogos com Universal?=Sim. Sem responsáveis neste formulário."
        )
    status = field(form, "form-patlasv4-proto-cat-universal-status")
    if status:
        status["options"] = ["Ativo", "Homologado", "Paralisado"]
        # drop Concluído if present


def replace_options_everywhere(forms: list) -> int:
    """Update reference options on any field pointing to cobrança/modelo."""
    n = 0
    cob_opts = ["Mensal", "Anual", "Conforme homologação"]
    mv_opts = ["Por Licença", "Por Serviço", "Por Pacote"]
    for form in forms:
        for fl in form.get("fields") or []:
            linked = fl.get("linkedFormId")
            if linked == FID_COB and "options" in fl:
                fl["options"] = cob_opts
                n += 1
            if linked == FID_MV and "options" in fl:
                fl["options"] = mv_opts
                n += 1
        for p in form.get("exampleValuePresets") or []:
            fv = p.get("fieldValues") or {}
            for k, v in list(fv.items()):
                if isinstance(v, str):
                    if v == "Sob Demanda" and "cobranca" in k:
                        fv[k] = "Conforme homologação"
                        n += 1
                    elif v == "Homologação" and "cobranca" in k:
                        fv[k] = "Conforme homologação"
                        n += 1
                    elif v == "Serviço" and "modelo-venda" in k:
                        fv[k] = "Por Serviço"
                        n += 1
                    elif v == "Homologação" and "modelo-venda" in k:
                        fv[k] = "Por Pacote"
                        n += 1
    return n


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))

    patch_metrica(find(forms, FID_MET))
    patch_cobranca(find(forms, FID_COB))
    patch_modelo_venda(find(forms, FID_MV))
    patch_solucao(find(forms, FID_SOL))
    patch_parceria(find(forms, FID_PAR))
    patch_produto(find(forms, FID_PROD))
    patch_catalogo(find(forms, FID_CAT))
    patch_universal(find(forms, FID_UNI))
    n = replace_options_everywhere(forms)

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK patched", FORMS)
    print("option/preset replacements:", n)

    # sanity
    prod = find(forms, FID_PROD)
    assert field(prod, PROD_QTDE_NEW), "qtde metrica missing"
    assert field(prod, PROD_FOCAL_V)["hidden"] is True
    cat = find(forms, FID_CAT)
    assert field(cat, CAT_TOGGLE_UNI)
    assert cat["name"] == "Catálogo da parceria"
    print("sanity ok")


if __name__ == "__main__":
    main()
