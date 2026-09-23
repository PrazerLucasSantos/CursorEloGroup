# -*- coding: utf-8 -*-
"""Ajusta formulário Produto conforme lista de alterações (ordem, visibilidade, códigos)."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"
WORKSPACES = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/workspaces.json"

PID = "form-patlasv4-proto-cat-produto"


def f(
    fid: str,
    label: str,
    typ: str,
    *,
    required: bool = False,
    relevance: str = "common",
    size: str = "medium",
    section: str | None = None,
    read_only: bool = False,
    hidden: bool = False,
    options: list | None = None,
    linked: str | None = None,
    spec: str = "",
    text_long: bool = False,
):
    out: dict = {
        "id": fid,
        "label": label,
        "type": typ,
        "size": size,
        "readOnly": read_only,
        "required": required,
        "multiple": False,
        "relevance": relevance,
        "spec": spec,
    }
    if section:
        out["sectionId"] = section
    if hidden:
        out["hidden"] = True
    if options is not None:
        out["options"] = options
    if linked:
        out["linkedFormId"] = linked
    if text_long:
        out["textLong"] = True
    return out


def rule_text(rid: str, source: str, option: str, action: str, targets: list[str]) -> dict:
    return {
        "id": rid,
        "operator": "eq",
        "sourceFieldId": source,
        "action": action,
        "targetFieldIds": targets,
        "sourceKind": "textOptions",
        "expectedOptionText": option,
    }


def rule_bool(rid: str, source: str, expected: bool, action: str, targets: list[str]) -> dict:
    return {
        "id": rid,
        "operator": "eq",
        "sourceFieldId": source,
        "action": action,
        "targetFieldIds": targets,
        "sourceKind": "boolean",
        "expectedBoolean": expected,
    }


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    old = next(x for x in forms if x["id"] == PID)
    methods = old.get("methods", [])

    tipo = f"{PID}-tipo"
    oferta = f"{PID}-tipo-oferta"
    cfg_cx = f"{PID}-cfg-usa-complexidade"
    cfg_peso = f"{PID}-cfg-usa-peso"
    cfg_qtde = f"{PID}-cfg-exige-qtde"

    new = {
        "id": PID,
        "name": "Produto",
        "sectionLayout": "accordion",
        "defaultCanvasMode": "edit",
        "metadata": (
            "Produto — Catálogo primeiro; Parceria/Solução herdadas RO; "
            "focais só em Responsáveis herdados (RO); códigos só do item; "
            "sem Preencher manualmente?/mensagem de falha de integração; "
            "fator de conversão pendente (fora do formulário); "
            "Grupo e Part Number não obrigatórios até validação."
        ),
        "sections": [
            {"id": "sec-prod-ctx", "title": "Contexto do Catálogo", "icon": "account_tree"},
            {"id": "sec-prod-ident", "title": "Identificação", "icon": "badge"},
            {"id": "sec-prod-com", "title": "Comercialização", "icon": "payments"},
            {"id": "sec-prod-cond", "title": "Características condicionais", "icon": "rule"},
            {"id": "sec-prod-cod", "title": "Códigos do item", "icon": "qr_code"},
            {"id": "sec-prod-resp", "title": "Responsáveis herdados do Catálogo", "icon": "group"},
            {"id": "sec-prod-esp", "title": "Especificações e observações", "icon": "description"},
            {"id": "sec-prod-status", "title": "Situação", "icon": "flag"},
            {"id": "sec-prod-cfg", "title": "Configuração herdada do Catálogo", "icon": "settings"},
        ],
        "fields": [
            # 1–3 ordem + versão
            f(f"{PID}-catalogo", "Catálogo", "reference", required=True, relevance="identity", section="sec-prod-ctx",
              linked="form-patlasv4-proto-cat-catalogo", options=["Catálogo MTI Simplifica", "MTI HOST"],
              spec="Primeiro campo do cadastro. Controla Parceria, Solução, métricas e estrutura condicional."),
            f(f"{PID}-parceria", "Parceria", "reference", read_only=True, required=True, section="sec-prod-ctx",
              linked="form-patlasv4-proto-cat-parceria", options=["MTI SIMPLIFICA", "MTI HOST"],
              spec="Obtida do Catálogo selecionado. Não permite seleção incompatível."),
            f(f"{PID}-solucao", "Solução", "reference", read_only=True, required=True, section="sec-prod-ctx",
              linked="form-patlasv4-proto-cat-solucao", options=["MTI Simplifica", "MTI Host"],
              spec="Obtida do Catálogo selecionado. Somente leitura."),
            f(f"{PID}-versao-catalogo", "Versão do catálogo", "text", read_only=True, required=True, section="sec-prod-ctx",
              spec="Versão do Catálogo em que o Produto será gravado."),
            # 4–8 identificação (ordem pedida)
            f(f"{PID}-identificador", "Nome do produto", "text", required=True, section="sec-prod-ident",
              spec="Nome comercial específico. Não copiar automaticamente para Part Number."),
            f(f"{PID}-part-number", "Part Number (SKU)", "text", section="sec-prod-ident", hidden=True,
              spec="Quando aplicável (ex.: Licença). Não obrigatório até validação Protheus. Sem preenchimento automático pelo Nome."),
            f(tipo, "Tipo de produto", "textOptions", required=True, section="sec-prod-ident",
              options=["Licença", "Serviço"], spec="Somente Licença ou Serviço."),
            f(oferta, "Tipo de oferta", "textOptions", required=True, section="sec-prod-ident",
              options=["Universal", "Individualizado"],
              spec="Comportamento Universal×Individualizado ainda sob validação. Não cria N3 automaticamente."),
            f(f"{PID}-grupo", "Grupo", "reference", section="sec-prod-ident",
              linked="form-patlasv4-proto-cat-grupo",
              options=["Análise e Modelagem de Processos", "MTI Simplifica"],
              spec="Permanece no formulário. NÃO obrigatório até validação Solução/Grupo/Categoria."),
            f(f"{PID}-categoria", "Categoria de serviços", "reference", section="sec-prod-ident", hidden=True,
              linked="form-patlasv4-proto-cat-categoria",
              options=["Treinamento e Capacitação", "Consultoria em Processos", "Soluções SaaS"],
              spec="Exibir para Serviço. Separação vs Grupo ainda sob validação."),
            f(f"{PID}-descricao", "Descrição do produto", "text", size="large", text_long=True, section="sec-prod-ident",
              spec="Escopo/entrega/resultado."),
            # Comercialização
            f(f"{PID}-modelo-venda", "Modelo de venda", "reference", required=True, section="sec-prod-com",
              linked="form-patlasv4-proto-cat-modelo-venda",
              options=["Por licença", "Por serviço", "Por pacote"],
              spec="Lista provisória: Por licença · Por serviço · Por pacote. Sem Consumo/Unitário/Por homologação/On-premise/Perpétuo/Subscrição."),
            f(f"{PID}-cobranca", "Tipo de cobrança", "reference", required=True, section="sec-prod-com",
              linked="form-patlasv4-proto-cat-tipo-cobranca",
              options=["Mensal", "Anual", "Conforme homologação"],
              spec="Somente Mensal · Anual · Conforme homologação. Sob demanda NÃO é tipo de cobrança."),
            f(f"{PID}-consumo-os", "Consumo por ordem de serviço?", "boolean", section="sec-prod-com", hidden=True,
              spec="Representa o antigo 'Sob demanda' como consumo via OS — não é Tipo de cobrança."),
            f(f"{PID}-valor-unitario", "Valor unitário", "number", required=True, section="sec-prod-com",
              spec="Preço próprio do Produto (Licença ou Serviço), mesmo se convertido para métrica do Catálogo."),
            f(f"{PID}-metrica", "Métrica", "reference", section="sec-prod-com",
              linked="form-patlasv4-proto-cat-metrica", options=["USN", "UST", "HST"],
              spec="Somente Métricas permitidas pelo Catálogo (sem texto livre). Se houver só uma, pré-preencher e RO no runtime."),
            f(f"{PID}-qtde-metrica", "Quantidade da métrica por execução", "number", section="sec-prod-com", hidden=True,
              spec="Não citar HST/UST no rótulo. Só Serviço + Catálogo/Métrica exigir quantidade. Oculto para Licença."),
            f(f"{PID}-moeda-universal", "Valor da moeda universal (R$)", "number", section="sec-prod-com", hidden=True,
              spec="Somente em contexto Universal. Sem regra de cálculo automática (ex.: =1) até validação."),
            # Condicionais
            f(f"{PID}-complexidade", "Complexidade", "textOptions", section="sec-prod-cond", hidden=True,
              options=["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"],
              spec="Só Serviço + Catálogo por complexidade. Opções = faixas do Catálogo. Oculto para Licença."),
            f(f"{PID}-coeficiente-complexidade", "Coeficiente de complexidade", "number", read_only=True,
              section="sec-prod-cond", hidden=True,
              spec="Somente leitura. Preenchido pela faixa selecionada na versão do Catálogo — não livre."),
            f(f"{PID}-peso", "Peso", "number", section="sec-prod-cond", hidden=True,
              spec="Só Serviço + Catálogo por peso. Oculto para Licença ou catálogo sem peso."),
            # Códigos do item apenas
            f(f"{PID}-cod-siag-item", "Código SIAG - Item", "text", section="sec-prod-cod",
              spec="Código do item. Manual/planilha nesta etapa. Sem mensagem de falha de integração."),
            f(f"{PID}-cod-protheus-item", "Código Protheus - Item", "text", section="sec-prod-cod",
              spec="Código do item. Manual/planilha nesta etapa. Sem integração SIAG/Protheus nesta fase."),
            # Responsáveis herdados (consulta)
            f(f"{PID}-focal-vendas", "Focal de vendas (herdado)", "reference", read_only=True, section="sec-prod-resp",
              linked="form-patlasv4-proto-pessoa", options=["LUCAS DOS SANTOS"],
              spec="Consulta — cadastrado no Catálogo. Produto não pode ter focal diferente."),
            f(f"{PID}-focal-posvendas", "Focal de pós-vendas (herdado)", "reference", read_only=True, section="sec-prod-resp",
              linked="form-patlasv4-proto-pessoa", options=["LUCAS DOS SANTOS"],
              spec="Consulta — cadastrado no Catálogo."),
            f(f"{PID}-unidade-dtic", "Unidade DTIC (herdada)", "reference", read_only=True, section="sec-prod-resp",
              linked="form-patlasv4-proto-unidade-organizacional", options=["Unidade de Gestão de Projetos"],
              spec="Consulta — cadastrada no Catálogo."),
            # Specs / status
            f(f"{PID}-especificacao-01", "Especificação 01", "text", section="sec-prod-esp"),
            f(f"{PID}-especificacao-02", "Especificação 02", "text", section="sec-prod-esp"),
            f(f"{PID}-especificacao-03", "Especificação 03", "text", section="sec-prod-esp"),
            f(f"{PID}-especificacao-04", "Especificação 04", "text", section="sec-prod-esp"),
            f(f"{PID}-observacoes", "Observações", "text", size="large", text_long=True, section="sec-prod-esp",
              spec="Complementar; não substitui Nome/Descrição."),
            f(f"{PID}-status", "Status do produto", "textOptions", read_only=True, required=True, section="sec-prod-status",
              options=["Rascunho", "Em análise", "Ajuste solicitado", "Reprovado", "Aprovado", "Publicado", "Substituído"],
              spec="Gerado pelo workflow."),
            # Flags RO herdadas do Catálogo (para regras AND via show+hide)
            f(cfg_cx, "Catálogo usa complexidade?", "boolean", read_only=True, section="sec-prod-cfg", hidden=True,
              spec="Herdado do Catálogo (estrutura de variação). Controla exibição de Complexidade."),
            f(cfg_peso, "Catálogo usa peso?", "boolean", read_only=True, section="sec-prod-cfg", hidden=True,
              spec="Herdado do Catálogo. Controla exibição de Peso."),
            f(cfg_qtde, "Métrica exige quantidade por execução?", "boolean", read_only=True, section="sec-prod-cfg", hidden=True,
              spec="Herdado da configuração Catálogo/Métrica. Controla Quantidade da métrica por execução."),
        ],
        # Última regra que afeta um alvo vence → show Serviço depois hide se flag=false
        "fieldVisibilityRules": [
            rule_text("rule-prod-sku-licenca", tipo, "Licença", "show", [f"{PID}-part-number"]),
            rule_text(
                "rule-prod-servico-base",
                tipo,
                "Serviço",
                "show",
                [
                    f"{PID}-categoria",
                    f"{PID}-consumo-os",
                    f"{PID}-qtde-metrica",
                    f"{PID}-complexidade",
                    f"{PID}-coeficiente-complexidade",
                    f"{PID}-peso",
                ],
            ),
            rule_bool("rule-prod-hide-qtde-se-nao-exige", cfg_qtde, False, "hide", [f"{PID}-qtde-metrica"]),
            rule_bool(
                "rule-prod-hide-cx-se-nao-usa",
                cfg_cx,
                False,
                "hide",
                [f"{PID}-complexidade", f"{PID}-coeficiente-complexidade"],
            ),
            rule_bool("rule-prod-hide-peso-se-nao-usa", cfg_peso, False, "hide", [f"{PID}-peso"]),
            rule_text("rule-prod-moeda-universal", oferta, "Universal", "show", [f"{PID}-moeda-universal"]),
        ],
        "exampleValuePresets": [
            {
                "id": f"{PID}-p-serv",
                "name": "Serviço UST · Simplifica",
                "fieldValues": {
                    f"{PID}-catalogo": "Catálogo MTI Simplifica",
                    f"{PID}-parceria": "MTI SIMPLIFICA",
                    f"{PID}-solucao": "MTI Simplifica",
                    f"{PID}-versao-catalogo": "9.4",
                    f"{PID}-identificador": "Elaborar plano de projeto",
                    f"{PID}-descricao": "Elaboração do plano de projeto (remoto).",
                    tipo: "Serviço",
                    oferta: "Universal",
                    f"{PID}-categoria": "Soluções SaaS",
                    f"{PID}-grupo": "Análise e Modelagem de Processos",
                    f"{PID}-modelo-venda": "Por serviço",
                    f"{PID}-cobranca": "Conforme homologação",
                    f"{PID}-consumo-os": True,
                    f"{PID}-valor-unitario": 1610.2,
                    f"{PID}-metrica": "UST",
                    f"{PID}-qtde-metrica": 10,
                    f"{PID}-complexidade": "Média",
                    f"{PID}-coeficiente-complexidade": 1,
                    f"{PID}-moeda-universal": 1,
                    f"{PID}-status": "Rascunho",
                    f"{PID}-focal-vendas": "LUCAS DOS SANTOS",
                    f"{PID}-focal-posvendas": "LUCAS DOS SANTOS",
                    f"{PID}-unidade-dtic": "Unidade de Gestão de Projetos",
                    cfg_cx: True,
                    cfg_peso: False,
                    cfg_qtde: True,
                },
            },
            {
                "id": f"{PID}-p-lic",
                "name": "Licença · Por licença",
                "fieldValues": {
                    f"{PID}-catalogo": "Catálogo MTI Simplifica",
                    f"{PID}-parceria": "MTI SIMPLIFICA",
                    f"{PID}-solucao": "MTI Simplifica",
                    f"{PID}-versao-catalogo": "9.4",
                    f"{PID}-identificador": "Licença plataforma Simplifica",
                    f"{PID}-descricao": "Licenciamento SaaS da plataforma.",
                    tipo: "Licença",
                    f"{PID}-part-number": "SIMP-LIC-01",
                    oferta: "Individualizado",
                    f"{PID}-grupo": "Análise e Modelagem de Processos",
                    f"{PID}-modelo-venda": "Por licença",
                    f"{PID}-cobranca": "Anual",
                    f"{PID}-valor-unitario": 1200,
                    f"{PID}-metrica": "USN",
                    f"{PID}-status": "Rascunho",
                    f"{PID}-focal-vendas": "LUCAS DOS SANTOS",
                    cfg_cx: False,
                    cfg_peso: False,
                    cfg_qtde: False,
                },
            },
            {
                "id": f"{PID}-p-host",
                "name": "Serviço · HOST (peso)",
                "fieldValues": {
                    f"{PID}-catalogo": "MTI HOST",
                    f"{PID}-parceria": "MTI HOST",
                    f"{PID}-solucao": "MTI Host",
                    f"{PID}-versao-catalogo": "1.0",
                    f"{PID}-identificador": "Serviço de hospedagem",
                    tipo: "Serviço",
                    oferta: "Individualizado",
                    f"{PID}-modelo-venda": "Por serviço",
                    f"{PID}-cobranca": "Mensal",
                    f"{PID}-valor-unitario": 500,
                    f"{PID}-metrica": "HST",
                    f"{PID}-peso": 2,
                    f"{PID}-status": "Rascunho",
                    cfg_cx: False,
                    cfg_peso: True,
                    cfg_qtde: False,
                },
            },
        ],
        "activeExamplePresetId": f"{PID}-p-serv",
        "methods": methods,
    }

    for i, form in enumerate(forms):
        if form.get("id") == PID:
            forms[i] = new
            break

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Workspace: alinhar presets do Produto
    ws = json.loads(WORKSPACES.read_text(encoding="utf-8"))

    def walk(obj):
        if isinstance(obj, dict):
            if obj.get("linkedFormId") == PID and "linkedFormExamplePresetIds" in obj:
                obj["linkedFormExamplePresetIds"] = [
                    f"{PID}-p-serv",
                    f"{PID}-p-lic",
                    f"{PID}-p-host",
                ]
            for v in obj.values():
                walk(v)
        elif isinstance(obj, list):
            for x in obj:
                walk(x)

    walk(ws)
    WORKSPACES.write_text(json.dumps(ws, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK produto + workspaces")


if __name__ == "__main__":
    main()
