# -*- coding: utf-8 -*-
"""Requisitos detalhados: Portal Parceiro, Portal Cliente e cada cadastro (classe)."""
from __future__ import annotations


def append_portal_and_class_requirements(s, story, tbl):
    """Append slides to list s using story/tbl helpers from the main builder."""

    s.append(
        (
            "parceiro",
            """
<section class="slide" id="pp-rf-catalogo" data-group="parceiro">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--tela">Portal</span></div>
    <h1 class="slide__title">Portal do Parceiro — catálogo de requisitos</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">Requisitos completos do canal do parceiro (Discovery + protótipo), em complemento aos cadastros de Catálogo e Produto.</p>
"""
            + tbl(
                "Requisitos funcionais — Portal do Parceiro",
                ["ID", "Requisito", "Prioridade"],
                [
                    ["RF-PARC-01", "Salvar rascunho de catálogo e produtos da própria parceria", "Alta"],
                    ["RF-PARC-02", "Incluir produtos manualmente ou por CSV (template oficial)", "Alta"],
                    ["RF-PARC-03", "Exportar CSV e PDF (grade completa, filtrada ou selecionada)", "Alta"],
                    ["RF-PARC-04", "Enviar à MTI (status Aguardando; trava edição)", "Alta"],
                    ["RF-PARC-05", "Receber ajuste com motivo; corrigir e reenviar", "Alta"],
                    ["RF-PARC-06", "Acompanhar status espelhado (Rascunho → … → Publicado / Reprovado / Paralisado)", "Alta"],
                    ["RF-PARC-07", "Visão planilha com filtros e seleção em massa", "Alta"],
                    ["RF-PARC-08", "Baixar template CSV oficial", "Média"],
                    ["RF-PARC-09", "Fila Enviados/ajustes por status", "Alta"],
                    ["RF-PARC-10", "Exibir justificativa da MTI em destaque", "Alta"],
                    ["RF-PARC-11", "Novo rascunho após Reprovado/Paralisado", "Média"],
                    ["RF-PARC-12", "Histórico de status no detalhe", "Média"],
                    ["RF-PARC-13", "Home com KPIs (catálogos, aguardando, ajustes)", "Baixa"],
                    ["RF-PARC-14", "Mensagem opcional ao analista no envio", "Baixa"],
                ],
            )
            + tbl(
                "Regras — Portal do Parceiro",
                ["ID", "Regra"],
                [
                    ["RN-PARC-01", "Parecer MTI obrigatório quando a origem é o portal do parceiro"],
                    ["RN-PARC-02", "Ajuste exige justificativa visível no portal"],
                    ["RN-PARC-03", "Parceiro só vê/edita catálogos da sua parceria"],
                    ["RN-PARC-04", "Edição só em Rascunho ou Ajuste solicitado"],
                    ["RN-PARC-05", "Enviar exige ao menos um produto"],
                    ["RN-PARC-06", "Publicar/versionar contrato não é ação do portal"],
                ],
            )
            + "</section>",
        )
    )

    s.append(
        (
            "cliente",
            """
<section class="slide" id="pc-rf-catalogo" data-group="cliente">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--tela">Portal</span></div>
    <h1 class="slide__title">Portal do Cliente — catálogo de requisitos</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">Requisitos do canal de consumo. O cliente <strong>não cadastra</strong> catálogo/produto.</p>
"""
            + tbl(
                "Requisitos funcionais — Portal do Cliente",
                ["ID", "Requisito", "Prioridade"],
                [
                    ["RF-CLI-01", "Consultar catálogo da versão apostilada no contrato", "Alta"],
                    ["RF-CLI-02", "Abrir demanda e/ou solicitar/receber orçamento", "Alta"],
                    ["RF-CLI-03", "Abrir OS (direto ou via orçamento autorizado)", "Alta"],
                    ["RF-CLI-04", "Acompanhar demandas, orçamentos e OS", "Alta"],
                    ["RF-CLI-05", "Não exibir versão nova até apostila", "Alta"],
                    ["RF-CLI-06", "Cotação a partir do catálogo gera demanda", "Alta"],
                    ["RF-CLI-07", "Gestor aceitar/recusar proposta de orçamento", "Alta"],
                    ["RF-CLI-08", "Autorizar atendimento gerando/vinculando OS", "Alta"],
                    ["RF-CLI-09", "Contratos: versão apostilada e pendente", "Alta"],
                    ["RF-CLI-10", "Filtros: busca, no contrato, solução, só apostiladas", "Média"],
                    ["RF-CLI-11", "Hierarquia Demandante → Gestor", "Alta"],
                    ["RF-CLI-12", "OS exige contrato, catálogo/versão e itens", "Alta"],
                    ["RF-CLI-13", "Aviso: cliente não cadastra catálogo", "Média"],
                    ["RF-CLI-14", "Orçamento com itens, valores e versão (snapshot)", "Alta"],
                ],
            )
            + tbl(
                "Regras — Portal do Cliente",
                ["ID", "Regra"],
                [
                    ["RN-CLI-01", "Cliente nunca cria/edita catálogo ou produto"],
                    ["RN-CLI-02", "Consulta padrão = versões apostiladas"],
                    ["RN-CLI-03", "OS/orçamento gravam snapshot da versão"],
                    ["RN-CLI-04", "Demandante sobe; gestor aprova e autoriza"],
                    ["RN-VER-01", "Versão do catálogo é atributo do contrato"],
                    ["RN-VER-03", "Cliente só troca de cardápio após apostila"],
                ],
            )
            + "</section>",
        )
    )

    s.append(
        (
            "cadastros",
            """
<section class="slide" id="cad-indice" data-group="cadastros">
  <header class="slide__top">
    <div><div class="kind-row"><span class="badge badge--cadastro">Cadastro</span></div>
    <h1 class="slide__title">Requisitos por cadastro (classe)</h1></div>
    <div class="slide__meta"><span class="logo-pill">MTI <i>SIMPLIFICA</i></span></div>
  </header>
  <p class="lead">Cada página seguinte detalha <strong>uma classe/cadastro</strong>: campos, requisitos funcionais, regras e ações.</p>
"""
            + tbl(
                "Índice",
                ["Cadastro", "Quem mantém", "Onde entra"],
                [
                    ["Métrica", "MTI", "Produto"],
                    ["Tipo de cobrança", "MTI", "Catálogo · Produto"],
                    ["Categoria de serviços", "MTI", "Produto · filtros"],
                    ["Grupo", "MTI", "Produto · lista"],
                    ["Modelo de venda", "MTI", "Produto"],
                    ["Parceria", "MTI", "Catálogo · Portal parceiro"],
                    ["Solução", "MTI/Parceiro", "Parceria"],
                    ["Catálogo", "Parceiro+MTI", "Portal · Backoffice · Contrato"],
                    ["Catálogo universal", "MTI", "Tipo 3"],
                    ["Produto", "Parceiro+MTI", "Portal · Consumo"],
                    ["Dados de parceria", "MTI/Parceiro", "Markup"],
                ],
            )
            + "</section>",
        )
    )

    cadastros = _classes()
    for c in cadastros:
        extra = tbl(f"Ações — {c['nome']}", ["Ação", "Quem"], c["acoes"])
        s.append(
            (
                "cadastros",
                story(
                    c["sid"],
                    "cadastros",
                    "cadastro",
                    f"Classe / cadastro — {c['nome']}",
                    c["historia"],
                    c["o_que"],
                    c["contexto"],
                    c["simples"],
                    c["rfs"],
                    c["rns"],
                    flow=c["flow"],
                    flow_note=f"Requisitos do cadastro «{c['nome']}».",
                    table=(
                        f"Campos — {c['nome']}",
                        ["Campo", "Tipo", "Obrigatório", "Observação"],
                        c["fields"],
                    ),
                    extra=extra,
                ),
            )
        )


def _classes():
    return [
        dict(
            sid="cad-metrica",
            nome="Métrica",
            historia="Como MTI, quero cadastrar USN, UST, HST… para padronizar a unidade de cada produto.",
            o_que="Cadastro das <strong>unidades de medida</strong>. O produto escolhe uma métrica já cadastrada.",
            contexto="USN = licença/infra; UST = esforço/complexidade; HST = hora de profissional.",
            simples="É a unidade com que se vende e se consome o item.",
            fields=[
                ["Identificador (sigla)", "Texto", "Sim", "Único — USN, UST, HST"],
                ["Descrição", "Texto", "Não", "Explicação"],
            ],
            rfs=[
                "<strong>RF-MET-01:</strong> Criar, editar e listar métricas.",
                "<strong>RF-MET-02:</strong> Exigir sigla única.",
                "<strong>RF-MET-03:</strong> Disponibilizar lista no Produto.",
                "<strong>RF-MET-04:</strong> Impedir exclusão se usada em produto homologado.",
            ],
            rns=[
                "<strong>RN-MET-01:</strong> USN → licença/infra; UST/HST → serviço.",
                "<strong>RN-MET-02:</strong> UST ≠ hora linear; HST ≈ hora de trabalho.",
                "<strong>RN-MET-03:</strong> “Horas” legadas migram para HST.",
            ],
            acoes=[["Criar / Editar", "MTI"], ["Bloquear exclusão em uso", "Sistema"]],
            flow=[1, 4],
        ),
        dict(
            sid="cad-cobranca",
            nome="Tipo de cobrança",
            historia="Como MTI, quero padronizar o modelo de cobrança dos itens.",
            o_que="Cadastro referenciado por <strong>Catálogo</strong> e <strong>Produto</strong>.",
            contexto="Não destacar cobrança no card da lista.",
            simples="Sob demanda, mensal, anual…?",
            fields=[
                ["Modelo", "Texto", "Sim", "Ex.: sob demanda, mensal"],
                ["Recorrência", "Texto", "Não", "Se aplicável"],
            ],
            rfs=[
                "<strong>RF-COB-01:</strong> Criar, editar e listar tipos.",
                "<strong>RF-COB-02:</strong> Obrigatório em Catálogo e Produto.",
                "<strong>RF-COB-03:</strong> Não excluir se referenciado em item homologado.",
            ],
            rns=[
                "<strong>RN-COB-01:</strong> Não excluir tipo em uso homologado.",
                "<strong>RN-COB-02:</strong> Cobrança no formulário, não no card.",
            ],
            acoes=[["Criar / Editar", "MTI"]],
            flow=[1, 3, 4],
        ),
        dict(
            sid="cad-categoria",
            nome="Categoria de serviços",
            historia="Como MTI, quero classificar a natureza do produto (Cloud, Desenvolvimento…).",
            o_que="Cadastro de <strong>categoria</strong>, distinto de Grupo.",
            contexto="Filtros da visão planilha e relatórios.",
            simples="Categoria = natureza; Grupo = linha/oferta.",
            fields=[
                ["Identificador", "Texto", "Sim", "Único"],
                ["Descrição", "Texto", "Não", "Detalhe"],
            ],
            rfs=[
                "<strong>RF-CATG-01:</strong> Criar, editar e listar.",
                "<strong>RF-CATG-02:</strong> Vincular opcionalmente ao Produto.",
                "<strong>RF-CATG-03:</strong> Usar como filtro na planilha.",
                "<strong>RF-CATG-04:</strong> Não excluir se usada em produto homologado.",
            ],
            rns=["<strong>RN-CATG-01:</strong> Não excluir categoria referenciada homologada."],
            acoes=[["Criar / Editar", "MTI"]],
            flow=[1, 4, 7],
        ),
        dict(
            sid="cad-grupo",
            nome="Grupo",
            historia="Como MTI, quero agrupar produtos para lista e filtros.",
            o_que="Cadastro de <strong>grupo</strong> (Implantação, Sustentação, Host…).",
            contexto="Destaque no card da lista de produtos.",
            simples="Pasta visual do cardápio.",
            fields=[
                ["Identificador", "Texto", "Sim", "Único"],
                ["Descrição", "Texto", "Não", "Detalhe"],
            ],
            rfs=[
                "<strong>RF-GRP-01:</strong> Criar, editar e listar.",
                "<strong>RF-GRP-02:</strong> Obrigatório no Produto.",
                "<strong>RF-GRP-03:</strong> Destacar no card/lista.",
                "<strong>RF-GRP-04:</strong> Filtrar na visão planilha.",
            ],
            rns=["<strong>RN-GRP-01:</strong> Grupo obrigatório e visível no card."],
            acoes=[["Criar / Editar", "MTI"]],
            flow=[1, 4],
        ),
        dict(
            sid="cad-modelo",
            nome="Modelo de venda",
            historia="Como MTI, quero registrar a forma de comercialização do item.",
            o_que="Cadastro referenciado pelo Produto.",
            contexto="Não precisa destacar no card.",
            simples="Licença, serviço, pacote…?",
            fields=[
                ["Identificador", "Texto", "Sim", "Único"],
                ["Descrição", "Texto", "Não", "Detalhe"],
            ],
            rfs=[
                "<strong>RF-MV-01:</strong> Criar, editar e listar.",
                "<strong>RF-MV-02:</strong> Obrigatório no Produto.",
            ],
            rns=["<strong>RN-MV-01:</strong> Modelo de venda obrigatório no produto."],
            acoes=[["Criar / Editar", "MTI"]],
            flow=[1, 4],
        ),
        dict(
            sid="cad-parceria",
            nome="Parceria",
            historia="Como MTI, quero cadastrar a linha de oferta ligada a um CNPJ, sem misturar com Organização.",
            o_que="Cadastro da <strong>parceria</strong> (SIMPLIFICA, HOST…). N parcerias no mesmo CNPJ.",
            contexto="1º cadastro pela MTI; portal do parceiro usa esse escopo.",
            simples="Parceria = oferta; Organização = empresa.",
            fields=[
                ["Identificador", "Texto", "Sim", "Nome"],
                ["Descrição", "Texto longo", "Não", "Escopo"],
                ["Organização", "Referência", "Sim", "CNPJ homologado"],
                ["Status", "Lista", "Sim", "Ativa · Homologada · Paralisada"],
                ["Soluções", "Lista", "Não", "Vinculadas"],
                ["Observações", "Texto", "Não", "Notas"],
            ],
            rfs=[
                "<strong>RF-PAR-01:</strong> Criar/editar no backoffice MTI.",
                "<strong>RF-PAR-02:</strong> Vincular a Organização existente.",
                "<strong>RF-PAR-03:</strong> Permitir N parcerias no mesmo CNPJ.",
                "<strong>RF-PAR-04:</strong> Controlar status Ativa/Homologada/Paralisada.",
                "<strong>RF-PAR-05:</strong> Associar soluções.",
                "<strong>RF-PAR-06:</strong> Disponibilizar no escopo do Portal do Parceiro.",
            ],
            rns=[
                "<strong>RN-PAR-01:</strong> Primeiro cadastro pela MTI.",
                "<strong>RN-PAR-02:</strong> Parceria ≠ Organização.",
                "<strong>RN-PAR-03:</strong> Paralisada bloqueia novos produtos na fila.",
            ],
            acoes=[["Criar / Homologar / Paralisar", "MTI"], ["Usar no catálogo", "Parceiro"]],
            flow=[2, 3],
        ),
        dict(
            sid="cad-solucao",
            nome="Solução",
            historia="Como MTI/parceiro, quero cadastrar a solução com fabricante e documentos.",
            o_que="Cadastro da <strong>solução</strong>. Fabricante é texto (sem cadastro próprio).",
            contexto="Anexos de apoio (papel timbrado, autorizações…).",
            simples="Produto de negócio da parceria.",
            fields=[
                ["Identificador", "Texto", "Sim", "Nome"],
                ["Descrição", "Texto", "Não", "Detalhe"],
                ["Parceria", "Referência", "Sim", "Dona"],
                ["Fabricante (nome)", "Texto", "Não", "Texto livre"],
                ["Fabricante (contato)", "Texto", "Não", "Opcional"],
                ["Documentos de apoio", "Arquivo(s)", "Não", "Anexos"],
                ["Observações", "Texto", "Não", "Notas"],
            ],
            rfs=[
                "<strong>RF-SOL-01:</strong> Criar/editar solução vinculada à parceria.",
                "<strong>RF-SOL-02:</strong> Fabricante em texto (nome/contato).",
                "<strong>RF-SOL-03:</strong> Anexar documentos.",
                "<strong>RF-SOL-04:</strong> Listar soluções no contexto do catálogo/demanda.",
            ],
            rns=[
                "<strong>RN-SOL-01:</strong> Sem cadastro Fabricante.",
                "<strong>RN-SOL-02:</strong> Solução pertence a uma parceria.",
            ],
            acoes=[["Criar / Editar / Anexar", "MTI (apoio parceiro)"]],
            flow=[2],
        ),
        dict(
            sid="cad-catalogo",
            nome="Catálogo",
            historia="Como parceiro/MTI, quero montar e versionar o cardápio da parceria.",
            o_que="Cadastro do <strong>catálogo versionado</strong>. Versão também é atributo do contrato.",
            contexto="CSV, planilha, parecer, publicar, nova versão; cliente só vê após apostila.",
            simples="Cardápio em versão (1.5, 1.7…). Nova versão não apaga a antiga.",
            fields=[
                ["Identificador", "Texto", "Sim", "Nome"],
                ["Versão", "Texto", "Sim", "Ex.: 1.5"],
                ["Versão anterior", "Texto (leitura)", "Não", "Ao criar nova"],
                ["Parceria", "Referência", "Sim", "Dono"],
                ["Tipo de cobrança", "Referência", "Sim", "Padrão"],
                ["Valor unitário (pacote)", "Número", "Sim", "Pode ser 0"],
                ["Unidade DTIC", "Referência", "Sim", "UO MTI"],
                ["Códigos SIAG/Protheus", "Texto", "Condicional", "Se manual"],
                ["Status do negócio", "Lista", "Sim", "Ativo · Homologado · Paralisado"],
                ["Status do fluxo", "Lista", "Sistema", "Espelho portal ↔ MTI"],
                ["Observações", "Texto", "Não", "Notas"],
            ],
            rfs=[
                "<strong>RF-CTL-01:</strong> Criar/editar rascunho com versão.",
                "<strong>RF-CTL-02:</strong> Importar produtos via CSV.",
                "<strong>RF-CTL-03:</strong> Exportar CSV e PDF.",
                "<strong>RF-CTL-04:</strong> Visão planilha com filtros/seleção.",
                "<strong>RF-CTL-05:</strong> Enviar à análise MTI.",
                "<strong>RF-CTL-06:</strong> Aprovar / ajuste / reprovar.",
                "<strong>RF-CTL-07:</strong> Publicar após homologar.",
                "<strong>RF-CTL-08:</strong> Criar nova versão sem sobrescrever.",
                "<strong>RF-CTL-09:</strong> Paralisar.",
                "<strong>RF-CTL-10:</strong> Espelhar status no Portal do Parceiro.",
            ],
            rns=[
                "<strong>RN-VER-01:</strong> Versão é atributo do contrato.",
                "<strong>RN-VER-02:</strong> Nova versão não sobrescreve a anterior.",
                "<strong>RN-VER-03:</strong> Cliente vê nova versão só após apostila.",
                "<strong>RN-CTL-01:</strong> Homologada não se edita — cria-se nova.",
                "<strong>RN-CSV-01:</strong> Template CSV round-trip.",
            ],
            acoes=[
                ["Rascunho / CSV / Planilha / Enviar", "Parceiro"],
                ["Analisar / Publicar / Nova versão", "MTI"],
                ["Apostilar", "MTI"],
            ],
            flow=[3, 7, 8, 9, 10],
        ),
        dict(
            sid="cad-universal",
            nome="Catálogo universal",
            historia="Como MTI, quero agregar catálogos elegíveis para Tipo 3.",
            o_que="Cadastro do <strong>catálogo universal</strong>.",
            contexto="Métricas universais USN/UST/HST.",
            simples="Cardápio geral dos créditos Tipo 3.",
            fields=[
                ["Identificador", "Texto", "Sim", "Nome"],
                ["Status", "Lista", "Sim", "Ativo/Homologado/Paralisado"],
                ["Catálogos", "Lista", "Sim", "Vinculados"],
                ["Códigos SIAG/Protheus", "Texto", "Não", "Integração"],
                ["Observações", "Texto", "Não", "Notas"],
            ],
            rfs=[
                "<strong>RF-UNI-01:</strong> Criar/editar universal.",
                "<strong>RF-UNI-02:</strong> Vincular catálogos ativos.",
                "<strong>RF-UNI-03:</strong> Publicar/paralisar.",
                "<strong>RF-UNI-04:</strong> Impedir vínculo de catálogo paralisado em novos contratos.",
            ],
            rns=[
                "<strong>RN-UNI-01:</strong> Só catálogos ativos em novos vínculos.",
                "<strong>RN-TIPO-04:</strong> Tipo 3 só com métricas universais.",
            ],
            acoes=[["Criar / Vincular / Publicar", "MTI"]],
            flow=[6, 9],
        ),
        dict(
            sid="cad-produto",
            nome="Produto",
            historia="Como parceiro/MTI, quero cadastrar o item em uma página com preço, métrica e flags.",
            o_que="Cadastro do <strong>produto</strong> — exatamente 1 catálogo.",
            contexto="Card: Nome+Tipo+Grupo+status; fator calculado; toggles independentes.",
            simples="Linha do cardápio.",
            fields=[
                ["Identificador", "Texto", "Sim", "Nome"],
                ["Part number", "Texto", "Sim", "SKU"],
                ["Tipo", "Lista", "Sim", "Licença · Serviço · Infra"],
                ["Catálogo", "Referência", "Sim", "Exatamente 1"],
                ["Grupo", "Referência", "Sim", "Card"],
                ["Categoria", "Referência", "Não", "Natureza"],
                ["Status", "Lista", "Sim", "Ativo · Homologado · Paralisado"],
                ["Status do fluxo", "Lista", "Sistema", "Espelho portal"],
                ["Universal", "Sim/Não", "Sim", "Tipo 2/3"],
                ["Individualizado", "Sim/Não", "Sim", "Tipo 1"],
                ["Modelo de venda", "Referência", "Sim", "Forma"],
                ["Métrica", "Referência", "Sim", "USN/UST/HST"],
                ["Cobrança", "Referência", "Sim", "Tipo"],
                ["Valor unitário", "Número", "Sim", "R$ ≥ 0"],
                ["Moeda universal", "Número", "Se Universal", "Base do fator"],
                ["Fator de conversão", "Número (leitura)", "Calculado", "unitário ÷ moeda"],
                ["Complexidade/coef/peso/qtde", "Condicional", "Se Serviço", "Conforme parceria"],
                ["Unidade DTIC", "Referência", "Sim", "UO"],
                ["Parceria", "Referência", "Não", "Opcional"],
                ["Códigos SIAG/Protheus", "Texto", "Condicional", "Se manual"],
                ["Observações", "Texto", "Não", "Notas"],
            ],
            rfs=[
                "<strong>RF-PROD-01:</strong> Página única de cadastro.",
                "<strong>RF-PROD-02:</strong> Exigir catálogo, grupo, tipo, métrica, cobrança, modelo, valor, flags.",
                "<strong>RF-PROD-03:</strong> Categoria opcional.",
                "<strong>RF-PROD-04:</strong> Moeda + recalcular fator se Universal=Sim.",
                "<strong>RF-PROD-05:</strong> Complexidade só se Serviço.",
                "<strong>RF-PROD-06:</strong> CSV import/export e PDF.",
                "<strong>RF-PROD-07:</strong> Enviar / aprovar / ajuste / inativar.",
                "<strong>RF-PROD-08:</strong> Card: Nome, Tipo, Grupo, status.",
                "<strong>RF-PROD-09:</strong> Observações livres.",
            ],
            rns=[
                "<strong>RN-P-01:</strong> Produto ∈ 1 catálogo.",
                "<strong>RN-P-02:</strong> Universal e Individualizado independentes.",
                "<strong>RN-P-03:</strong> Universal=Não → sem fator Tipo 3.",
                "<strong>RN-P-04:</strong> Fora de métricas universais → sem fator.",
                "<strong>RN-P-05:</strong> Markup não fica no produto.",
                "<strong>RN-FAT-01:</strong> Fator = unitário ÷ moeda.",
                "<strong>RN-FAT-02:</strong> USN Tipo 3: fator tipicamente 1.",
                "<strong>RN-CX-01:</strong> Complexidade texto ou coeficiente.",
            ],
            acoes=[
                ["CRUD + CSV + Recalcular fator", "Parceiro/MTI"],
                ["Enviar análise", "Parceiro/MTI"],
                ["Aprovar / Ajuste / Inativar", "MTI"],
            ],
            flow=[4, 5, 7, 8],
        ),
        dict(
            sid="cad-markup",
            nome="Dados de parceria (markup)",
            historia="Como MTI/parceiro, quero registrar custo e margem separados do preço de venda.",
            o_que="Cadastro de <strong>precificação interna</strong>.",
            contexto="Markup oficial não vai no Produto.",
            simples="Combinado de margem — não é o preço do cliente.",
            fields=[
                ["Produto", "Referência", "Sim", "Item"],
                ["Custo do parceiro", "Número", "Sim", "R$"],
                ["Markup %", "Número", "Sim", "Sobre o custo"],
                ["% Parceiro", "Número", "Sim", "Parte parceiro"],
                ["% MTI", "Número", "Sim", "Parte MTI"],
            ],
            rfs=[
                "<strong>RF-DP-01:</strong> Criar/editar por produto.",
                "<strong>RF-DP-02:</strong> Validar % parceiro + % MTI = 100.",
                "<strong>RF-DP-03:</strong> Não gravar markup no Produto.",
            ],
            rns=[
                "<strong>RN-DP-01:</strong> Soma das distribuições = 100%.",
                "<strong>RN-P-05:</strong> Markup neste cadastro, não no Produto.",
            ],
            acoes=[["Informar custo/markup/%", "MTI e/ou Parceiro"]],
            flow=[5],
        ),
    ]
