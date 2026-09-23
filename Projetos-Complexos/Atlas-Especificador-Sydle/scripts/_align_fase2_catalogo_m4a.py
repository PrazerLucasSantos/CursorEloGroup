# -*- coding: utf-8 -*-
"""Alinha forms Fase 2 ao catalogo.m4a (Validação 05/08/2026).

Fonte: docs/conhecimento-atlas/transcricoes/AUDIO_catalogo_m4a.txt
Regra: correções de Luís prevalecem sobre o protótipo apresentado quando há conflito.
Não inventa campos; apenas esconde/ajusta o que a fonte confirmou ou corrigiu.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
WORKSPACES = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/workspaces.json"


def find(forms: list, fid: str) -> dict:
    return next(f for f in forms if f["id"] == fid)


def field(form: dict, fid: str) -> dict | None:
    return next((x for x in form["fields"] if x["id"] == fid), None)


def hide(form: dict, fid: str, *, spec: str | None = None, required: bool = False) -> None:
    f = field(form, fid)
    if not f:
        return
    f["hidden"] = True
    f["required"] = required
    if spec is not None:
        f["spec"] = spec


def show_req(form: dict, fid: str, *, required: bool = True, read_only: bool | None = None, spec: str | None = None) -> None:
    f = field(form, fid)
    if not f:
        return
    f.pop("hidden", None)
    f["required"] = required
    if read_only is not None:
        f["readOnly"] = read_only
    if spec is not None:
        f["spec"] = spec


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))

    # --- Métrica: Luís — somente Nome [61:18] ---
    met = find(forms, "form-patlasv4-proto-cat-metrica")
    met["metadata"] = (
        "Fonte catalogo.m4a [61:18]: classe Métrica — somente Nome. "
        "Exemplos: UST, USN, HST e outras criáveis. Descrição/Ativo ocultos (não confirmados como obrigatórios)."
    )
    show_req(met, "form-patlasv4-proto-cat-metrica-identificador", required=True, spec="Nome da métrica. Ex.: UST, USN, HST.")
    hide(met, "form-patlasv4-proto-cat-metrica-descricao", spec="Não confirmado por Luís como campo da classe (m4a [61:18]).")
    hide(met, "form-patlasv4-proto-cat-metrica-ativo", spec="Não confirmado na fonte m4a.")

    # --- Tipo de Cobrança: Mensal / Anual / Conforme homologação [63:18]; sem recorrência; sem sob demanda ---
    tc = find(forms, "form-patlasv4-proto-cat-tipo-cobranca")
    tc["metadata"] = (
        "Fonte catalogo.m4a [63:18–63:50]: Mensal · Anual · Conforme homologação. "
        "Sob demanda NÃO é tipo de cobrança (consumo/crédito/OS). Recorrência detalhada não validada."
    )
    # ensure presets only the three
    tc["exampleValuePresets"] = [
        {
            "id": "p-tc-mensal",
            "name": "Mensal",
            "fieldValues": {
                "form-patlasv4-proto-cat-tipo-cobranca-nome": "Mensal",
                "form-patlasv4-proto-cat-tipo-cobranca-descricao": "Cobra todo mês.",
                "form-patlasv4-proto-cat-tipo-cobranca-ativo": True,
            },
        },
        {
            "id": "p-tc-anual",
            "name": "Anual",
            "fieldValues": {
                "form-patlasv4-proto-cat-tipo-cobranca-nome": "Anual",
                "form-patlasv4-proto-cat-tipo-cobranca-descricao": "Cobra anualmente.",
                "form-patlasv4-proto-cat-tipo-cobranca-ativo": True,
            },
        },
        {
            "id": "p-tc-homolog",
            "name": "Conforme homologação",
            "fieldValues": {
                "form-patlasv4-proto-cat-tipo-cobranca-nome": "Conforme homologação",
                "form-patlasv4-proto-cat-tipo-cobranca-descricao": "Cobra ao apresentar documento de homologação.",
                "form-patlasv4-proto-cat-tipo-cobranca-ativo": True,
            },
        },
    ]
    tc["activeExamplePresetId"] = "p-tc-mensal"
    hide(tc, "form-patlasv4-proto-cat-tipo-cobranca-descricao", spec="Opcional / não confirmada como obrigatória na fonte.")
    # if ativo exists keep optional hidden lean
    hide(tc, "form-patlasv4-proto-cat-tipo-cobranca-ativo", spec="Não confirmado na fonte m4a.")

    # --- Categoria: só Nome [08:15], [65:11] ---
    catg = find(forms, "form-patlasv4-proto-cat-categoria")
    catg["metadata"] = "Fonte catalogo.m4a: Categoria de serviço — somente Nome."
    hide(catg, "form-patlasv4-proto-cat-categoria-descricao", spec="Não confirmado; lean = só Nome.")
    hide(catg, "form-patlasv4-proto-cat-categoria-ativo", spec="Não confirmado na fonte.")

    # --- Modelo de venda: Por licença / Por serviço / Por pacote [67–70] provisório ---
    mv = find(forms, "form-patlasv4-proto-cat-modelo-venda")
    mv["metadata"] = (
        "Fonte catalogo.m4a [67:27–70:18]: provisório Por licença · Por serviço · Por pacote. "
        "On-premise/Perpétuo/Subscrição/Consumo/Unitário/Por homologação NÃO incluir."
    )
    hide(mv, "form-patlasv4-proto-cat-modelo-venda-descricao", spec="Opcional; detalhe pode ir na descrição do produto (Luís).")
    hide(mv, "form-patlasv4-proto-cat-modelo-venda-ativo", spec="Não confirmado na fonte.")

    # --- Solução: Nome + Parceria + Descrição se necessária [71:35]; fabricante não obrigatório ---
    sol = find(forms, "form-patlasv4-proto-cat-solucao")
    sol["metadata"] = (
        "Fonte catalogo.m4a [71:35–71:40]: Nome + Parceria + Descrição se necessária. "
        "Fabricante/contato/documentos = não confirmados como obrigatórios (ocultos)."
    )
    hide(sol, "form-patlasv4-proto-cat-solucao-observacoes", spec="Retirar; não duplicar Descrição.")
    hide(sol, "form-patlasv4-proto-cat-solucao-fabricante-nome", spec="Não confirmado como obrigatório na validação lean.")
    hide(sol, "form-patlasv4-proto-cat-solucao-fabricante-contato", spec="Não confirmado como obrigatório na validação lean.")
    hide(sol, "form-patlasv4-proto-cat-solucao-documentos-apoio", spec="Não confirmado na validação lean.")
    hide(sol, "form-patlasv4-proto-cat-solucao-ativo", spec="Não confirmado na fonte.")

    # --- Parceria: lean Nome + Organização + Soluções [71:19] ---
    parc = find(forms, "form-patlasv4-proto-cat-parceria")
    parc["metadata"] = (
        "Fonte catalogo.m4a [71:19–71:32]: para vínculo ao catálogo — Nome + Organização + Soluções. "
        "Extras (status, DIREX, responsável, observações) ocultos."
    )
    hide(parc, "form-patlasv4-proto-cat-parceria-status", spec="Não confirmado neste formulário mínimo.")
    hide(parc, "form-patlasv4-proto-cat-parceria-observacoes", spec="Não confirmado no mínimo.")
    hide(parc, "form-patlasv4-proto-cat-parceria-data-homologacao-direx", spec="Não confirmado (Zerex/DIREX).")
    hide(parc, "form-patlasv4-proto-cat-parceria-responsavel-homologacao", spec="Não confirmado.")

    # --- Catálogo ---
    cat = find(forms, "form-patlasv4-proto-cat-catalogo")
    cat["metadata"] = (
        "Fonte catalogo.m4a: Catálogo da parceria (N2). Toggles É universal? e É catálogo de serviços? "
        "[58:41]; focais/DTIC aqui [50:44]; estrutura por complexidade ou peso [55:55]; "
        "métricas permitidas + valor por métrica; cobrança/VU genérico legados ocultos; "
        "códigos manuais (integração adiada) [65:48]."
    )
    # ensure legacy cobrança/vu hidden
    hide(cat, "form-patlasv4-proto-cat-catalogo-cobranca", spec="Cobrança oficial no Produto [46:46]. No catálogo ficou a validar [58:06].")
    hide(cat, "form-patlasv4-proto-cat-catalogo-valor-unitario", spec="Substituído por valor unitário por métrica embutida.")
    hide(cat, "form-patlasv4-proto-cat-catalogo-preencher-manual", spec="Integração adiada; sem toggle de falha.")
    hide(cat, "form-patlasv4-proto-cat-catalogo-status-fluxo", spec="Usar um único Status do catálogo.")
    hide(cat, "form-patlasv4-proto-cat-catalogo-link-parceria", spec="Não confirmado.")
    # Universal N3 codes stay conditional via existing rule
    # Add catalog preset HOST if missing
    presets = cat.get("exampleValuePresets") or []
    ids = {p["id"] for p in presets}
    if "form-patlasv4-proto-cat-catalogo-p-host" not in ids:
        presets.append(
            {
                "id": "form-patlasv4-proto-cat-catalogo-p-host",
                "name": "MTI HOST",
                "fieldValues": {
                    "form-patlasv4-proto-cat-catalogo-identificador": "MTI HOST",
                    "form-patlasv4-proto-cat-catalogo-parceria": "MTI HOST",
                    "form-patlasv4-proto-cat-catalogo-solucao": "MTI Host",
                    "form-patlasv4-proto-cat-catalogo-versao": "1.0",
                    "form-patlasv4-proto-cat-catalogo-status": "Publicado",
                    "form-patlasv4-proto-cat-catalogo-toggle-universal": False,
                    "form-patlasv4-proto-cat-catalogo-toggle-servicos": True,
                    "form-patlasv4-proto-cat-catalogo-estrutura-variacao": "Por peso",
                },
            }
        )
    cat["exampleValuePresets"] = presets

    # --- Produto ---
    prod = find(forms, "form-patlasv4-proto-cat-produto")
    prod["metadata"] = (
        "Fonte catalogo.m4a: Catálogo primeiro [55:01]; Parceria/Solução/versão herdadas; "
        "tipo Licença|Serviço; oferta Universal|Individualizado; cobrança Mensal/Anual/Conforme homologação; "
        "métrica filtrada; qtde genérica; complexidade/peso só Serviço+estrutura catálogo; "
        "focais NÃO no produto [50:18]; fator NÃO no cadastro N3 [48:06]; moeda universal se Universal (Luís: 1) [53:08]; "
        "Part Number presente mas obrigatoriedade/formato = lacuna Protheus."
    )
    # Part number: visible for Licença via rule; NOT required
    pn = field(prod, "form-patlasv4-proto-cat-produto-part-number")
    if pn:
        pn["required"] = False
        pn["spec"] = "Confirmado na fonte como campo; obrigatoriedade/formato = lacuna (Protheus). Não copiar o Nome."
    # Métrica required when catalog has metrics - keep not hard-required (lacuna exact obligation)
    metf = field(prod, "form-patlasv4-proto-cat-produto-metrica")
    if metf:
        metf["spec"] = (
            "Selecionar métrica (UST/USN/HST ou outras). Filtrar pelas métricas do Catálogo. "
            "Não fixar quantidade UST+HST [23:33]."
        )
        metf["options"] = ["USN", "UST", "HST", "Unitário", "Peça", "Licenciamento"]
    # Cobrança options locked
    cob = field(prod, "form-patlasv4-proto-cat-produto-cobranca")
    if cob:
        cob["options"] = ["Mensal", "Anual", "Conforme homologação"]
        cob["spec"] = "Mensal · Anual · Conforme homologação [63:18]. Sem Sob demanda."
    # Consumo OS = sob demanda operacional
    cons = field(prod, "form-patlasv4-proto-cat-produto-consumo-os")
    if cons:
        cons["spec"] = (
            "Representa consumo sob demanda / via OS (créditos). "
            "NÃO é Tipo de cobrança [46:46–47:20]. Exibir quando oferta Universal ou Serviço conforme catálogo."
        )
    # Moeda universal
    moeda = field(prod, "form-patlasv4-proto-cat-produto-moeda-universal")
    if moeda:
        moeda["spec"] = (
            "Exibir se Tipo de oferta = Universal [53:08]. Luís: valor preenchido como 1 no cadastro universal. "
            "Sem fator no cadastro N3 [48:06]."
        )
        moeda["label"] = "Valor da moeda universal"
    # Grupo not hard-required (obligation lacuna)
    grp = field(prod, "form-patlasv4-proto-cat-produto-grupo")
    if grp:
        grp["required"] = False
        grp["spec"] = "Agrupamento confirmado na fonte; obrigatoriedade absoluta = lacuna."
    # Modelo venda options
    md = field(prod, "form-patlasv4-proto-cat-produto-modelo-venda")
    if md:
        md["options"] = ["Por licença", "Por serviço", "Por pacote"]
        md["spec"] = "Provisório [67–70]: Por licença · Por serviço · Por pacote."

    # Visibility: show consumo-os also for Universal oferta
    rules = prod.get("fieldVisibilityRules") or []
    # ensure rule for universal → consumo-os + moeda
    if not any(r.get("id") == "rule-prod-universal-consumo" for r in rules):
        rules.append(
            {
                "id": "rule-prod-universal-consumo",
                "operator": "eq",
                "sourceFieldId": "form-patlasv4-proto-cat-produto-tipo-oferta",
                "action": "show",
                "targetFieldIds": [
                    "form-patlasv4-proto-cat-produto-consumo-os",
                    "form-patlasv4-proto-cat-produto-moeda-universal",
                ],
                "sourceKind": "textOptions",
                "expectedOptionText": "Universal",
            }
        )
    # remove duplicate moeda-only rule if both exist - keep both ok (last wins for same targets)
    prod["fieldVisibilityRules"] = rules

    # Update presets: no sob demanda cobrança; moeda=1 when universal
    for p in prod.get("exampleValuePresets") or []:
        fv = p.get("fieldValues") or {}
        if fv.get("form-patlasv4-proto-cat-produto-cobranca") == "Sob demanda":
            fv["form-patlasv4-proto-cat-produto-cobranca"] = "Conforme homologação"
        if fv.get("form-patlasv4-proto-cat-produto-tipo-oferta") == "Universal":
            fv["form-patlasv4-proto-cat-produto-moeda-universal"] = 1
            fv["form-patlasv4-proto-cat-produto-consumo-os"] = True
        p["fieldValues"] = fv

    # --- Catálogo Universal: sem focais ---
    univ = find(forms, "form-patlasv4-proto-cat-universal")
    univ["metadata"] = (
        "Fonte catalogo.m4a [51:02]: Catálogo Universal (N3) = redirecionador de créditos; "
        "SEM focais/responsáveis. Códigos adiados."
    )

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # --- Workspaces: presets existentes apenas ---
    ws = json.loads(WORKSPACES.read_text(encoding="utf-8"))

    def fix_presets(obj):
        if isinstance(obj, dict):
            lid = obj.get("linkedFormId")
            if lid == "form-patlasv4-proto-cat-catalogo":
                obj["linkedFormExamplePresetIds"] = [
                    "form-patlasv4-proto-cat-catalogo-p-simplifica",
                    "form-patlasv4-proto-cat-catalogo-p-host",
                ]
            elif lid == "form-patlasv4-proto-cat-solucao":
                obj["linkedFormExamplePresetIds"] = ["p-sol-simplifica", "p-sol-host"]
            elif lid == "form-patlasv4-proto-cat-grupo":
                obj["linkedFormExamplePresetIds"] = ["p-grp-analise"]
            elif lid == "form-patlasv4-proto-cat-modelo-venda":
                obj["linkedFormExamplePresetIds"] = ["p-mv-lic", "p-mv-serv", "p-mv-pac"]
            elif lid == "form-patlasv4-proto-cat-categoria":
                obj["linkedFormExamplePresetIds"] = ["p-catg-trein", "p-catg-saas"]
            elif lid == "form-patlasv4-proto-cat-tipo-cobranca":
                obj["linkedFormExamplePresetIds"] = ["p-tc-mensal", "p-tc-anual", "p-tc-homolog"]
            for v in obj.values():
                fix_presets(v)
        elif isinstance(obj, list):
            for x in obj:
                fix_presets(x)

    fix_presets(ws)
    WORKSPACES.write_text(json.dumps(ws, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK forms + workspaces alinhados ao catalogo.m4a")


if __name__ == "__main__":
    main()
