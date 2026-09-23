# -*- coding: utf-8 -*-
"""
Enriquece o Detalhamento (`spec`) de todos os campos de Catálogo/Produtos
no backoffice do protótipo Atlas.

Formato padrão:
  **Para que serve:** ...
  **Onde é usado:** ...
  **Origem / de onde vem:** ...
  **Regras:** ...
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"

FORM_IDS = {
    "form-patlasv4-proto-cat-catalogo",
    "form-patlasv4-proto-cat-produto",
    "form-patlasv4-proto-cat-universal",
    "form-patlasv4-proto-cat-parceria",
    "form-patlasv4-proto-cat-solucao",
    "form-patlasv4-proto-cat-metrica",
    "form-patlasv4-proto-cat-tipo-cobranca",
    "form-patlasv4-proto-cat-categoria",
    "form-patlasv4-proto-cat-grupo",
    "form-patlasv4-proto-cat-modelo-venda",
    "form-patlasv4-proto-cat-dados-parceria",
    "form-patlasv4-proto-analise-catalogo",
    "form-patlasv4-proto-portal-parceiro-catalogo",
    "form-patlasv4-proto-portal-cliente-catalogo",
    "form-patlasv4-proto-metodo-cat-nova-versao",
    "form-patlasv4-proto-metodo-cat-import-csv",
    "form-patlasv4-proto-metodo-cat-aprovar",
    "form-patlasv4-proto-metodo-cat-solicitar-ajuste",
}


def S(
    serve: str,
    usado: str,
    origem: str,
    regras: str,
) -> str:
    return (
        f"**Para que serve:** {serve}\n\n"
        f"**Onde é usado:** {usado}\n\n"
        f"**Origem / de onde vem:** {origem}\n\n"
        f"**Regras:** {regras}"
    )


SPECS: dict[str, str] = {
    # ── Catálogo ──────────────────────────────────────────────
    "form-patlasv4-proto-cat-catalogo-identificador": S(
        "Nome comercial/oficial do catálogo da parceria (o “cardápio”).",
        "Lista de catálogos no backoffice; Portal do Parceiro; vínculo em Contrato (versão); filtros de cotação/OS no Portal do Cliente; relatórios e templates.",
        "Digitado pela MTI (backoffice) ou pelo Parceiro (portal) no rascunho. Não vem de integração automática.",
        "Obrigatório. Deve ser único por parceria+versão na prática operacional. Exemplos: `MTI HOST`, `MTI SIMPLIFICA`.",
    ),
    "form-patlasv4-proto-cat-catalogo-versao": S(
        "Identifica qual edição do cardápio está sendo cadastrada (1.5, 1.7…). É o elo com o contrato do cliente.",
        "Contrato (atributo versão do catálogo); OS/orçamento (snapshot); Portal do Cliente (o que o órgão enxerga); método Criar nova versão.",
        "Informada no cadastro. Ao criar nova versão, a MTI define o próximo número; a versão antiga permanece.",
        "Obrigatório. **RN-VER-01** (versão também é do contrato). **RN-VER-02** (não sobrescreve versão publicada). **RN-VER-03** (cliente só vê nova versão após apostilamento).",
    ),
    "form-patlasv4-proto-cat-catalogo-versao-anterior": S(
        "Guarda o histórico: de qual versão este catálogo foi derivado.",
        "Auditoria, rastreio de changelog e comparação entre versões no backoffice.",
        "Preenchido **automaticamente** pelo método `Criar nova versão` (cópia da versão de origem).",
        "Somente leitura. Vazio na primeira versão (ex.: 1.0 / 1.5 inicial).",
    ),
    "form-patlasv4-proto-cat-catalogo-produtos": S(
        "Lista os produtos que compõem este catálogo.",
        "Tela do catálogo; importação CSV; análise MTI; Portal do Cliente (itens da versão); consumo em cotação/OS.",
        "Cada produto referencia **um** catálogo (vínculo inverso preferencial). Pode ser montado manualmente ou via CSV.",
        "**RN-P-01:** produto pertence a exatamente 1 catálogo. Para volume (≥80 itens), usar Importar CSV.",
    ),
    "form-patlasv4-proto-cat-catalogo-alerta-integracao": S(
        "Orienta o usuário sobre códigos SIAG/Protheus: o ideal é integração; o manual é exceção.",
        "Somente UI do formulário Catálogo (alerta informativo).",
        "Texto fixo de configuração do formulário (não é dado de negócio).",
        "Não grava valor. Aparece junto ao toggle “Preencher manualmente?”.",
    ),
    "form-patlasv4-proto-cat-catalogo-preencher-manual": S(
        "Controla se os códigos de sistemas legados (SIAG/Protheus) serão digitados à mão.",
        "Exibe/oculta os campos de código do catálogo e do universal; impacta carga CSV e homologação.",
        "Default **Não**. Usuário MTI/parceiro altera quando a integração ainda não devolveu o código.",
        "Obrigatório. Se `Sim`, mostrar códigos SIAG/Protheus (catálogo e universal). Se `Não`, códigos vêm da integração quando disponível.",
    ),
    "form-patlasv4-proto-cat-catalogo-cod-siag-cat": S(
        "Código do catálogo no SIAG (sistema legado/governo).",
        "Integrações, conciliação financeira/contratual e exportações para sistemas externos.",
        "Preferencialmente **integração SIAG**. Manual só se “Preencher manualmente? = Sim”.",
        "Visível/obrigatório conforme regra de preenchimento manual. Não inventar código se a integração for a fonte oficial.",
    ),
    "form-patlasv4-proto-cat-catalogo-cod-protheus-cat": S(
        "Código do catálogo no Protheus (ERP).",
        "Integração ERP, faturamento e sincronização de itens.",
        "Preferencialmente **integração Protheus**. Manual somente com o toggle ligado.",
        "Mesma regra de visibilidade do código SIAG do catálogo.",
    ),
    "form-patlasv4-proto-cat-catalogo-cod-siag-univ": S(
        "Código SIAG do Catálogo Universal ao qual este catálogo se liga (camada superior).",
        "Amarração Tipo 2/3 (moeda universal) e integrações que tratam o universal como objeto.",
        "Herdado/relacionado ao **Catálogo Universal** vinculado, ou digitado se manual.",
        "Visível se preenchimento manual. Usado quando o catálogo participa do Universal MTI.",
    ),
    "form-patlasv4-proto-cat-catalogo-cod-protheus-univ": S(
        "Código Protheus do Catálogo Universal associado.",
        "Integração ERP da camada universal / objetos de contrato Tipo 2–3.",
        "Integração Protheus ou digitação manual condicionada.",
        "Visível se “Preencher manualmente? = Sim”.",
    ),
    "form-patlasv4-proto-cat-catalogo-cobranca": S(
        "Define o modelo de cobrança do catálogo como pacote (sob demanda, mensal, anual, homologação…).",
        "Comercialização, propostas, contratos Tipo 2 e regras de recorrência de faturamento.",
        "Referência à classe **Tipo de Cobrança** (metadado pré-cadastrado pela MTI no backoffice).",
        "Obrigatório. Cadastre o tipo de cobrança antes de fechar o catálogo.",
    ),
    "form-patlasv4-proto-cat-catalogo-valor-unitario": S(
        "Valor do catálogo enquanto “pacote/moeda” (especialmente Tipo 2). Pode ser 0 se o preço está só nos produtos.",
        "Contratos Tipo 2; cálculos de saldo; fator de conversão em cenários de pacote.",
        "Informado pela MTI ou parceiro no cadastro. Não calculado automaticamente.",
        "Obrigatório (numérico ≥ 0). Em muitos catálogos de serviço o preço unitário vive no **Produto**.",
    ),
    "form-patlasv4-proto-cat-catalogo-focal-vendas": S(
        "Pessoa MTI responsável comercial pelo catálogo (ponto focal de vendas).",
        "Contatos em templates, notificações, fila de análise e atendimento ao parceiro/cliente.",
        "Referência à classe **Pessoa** (cadastro RH / usuários MTI).",
        "Opcional, mas recomendado para operação. Não confundir com focal do produto (pode diferir).",
    ),
    "form-patlasv4-proto-cat-catalogo-focal-posvendas": S(
        "Pessoa MTI responsável pelo pós-venda / sustentação do catálogo.",
        "Escalonamento de suporte, OS e comunicação após contratação.",
        "Referência à classe **Pessoa**.",
        "Opcional. Pode ser a mesma pessoa do focal de vendas.",
    ),
    "form-patlasv4-proto-cat-catalogo-unidade-dtic": S(
        "Unidade organizacional da MTI (UO/DTIC) dona do catálogo.",
        "Governança, permissões, filas de análise e rateios internos.",
        "Referência à classe **Organização** (UO MTI já cadastrada na Fase 1).",
        "Obrigatório. Deve ser UO da MTI, não o CNPJ do parceiro.",
    ),
    "form-patlasv4-proto-cat-catalogo-link-parceria": S(
        "URL externa do catálogo mantido pela parceria (site, drive, SIAG parceiro etc.).",
        "Consulta rápida no backoffice e no portal; não substitui o cadastro Atlas.",
        "Informado pelo parceiro/MTI (texto/URL). Não sincroniza automaticamente os itens.",
        "Opcional. Validar URL se preenchido.",
    ),
    "form-patlasv4-proto-cat-catalogo-parceria": S(
        "Liga o catálogo à parceria comercial (ex.: MTI SIMPLIFICA).",
        "Filtros por parceria; Portal do Parceiro (só vê as suas); análise MTI; dados de markup.",
        "Referência à classe **Parceria** (criada pela MTI a partir da Organização parceiro).",
        "Recomendado/obrigatório na operação com parceiros. Uma org pode ter N parcerias — o catálogo aponta para **uma**.",
    ),
    "form-patlasv4-proto-cat-catalogo-status": S(
        "Situação de negócio do catálogo no cadastro (Ativo, Homologado, Paralisado…). Tag visual na lista.",
        "Listagens backoffice; elegibilidade para contrato; bloqueio de novos produtos quando Paralisado.",
        "Alterado por métodos MTI (aprovar, publicar, paralisar) ou cadastro interno.",
        "Obrigatório. Diferente do **Status do fluxo** (portal↔MTI). Homologado/Ativo = elegível a contrato após regras de versão.",
    ),
    "form-patlasv4-proto-cat-catalogo-status-fluxo": S(
        "Espelho do andamento entre Portal do Parceiro e backoffice (rascunho → análise → ajuste/homologado/publicado).",
        "Portal do Parceiro; fila de Análise MTI; auditoria do ciclo de envio.",
        "Atualizado pelos eventos: Salvar rascunho / Enviar à MTI / decisão da Análise / Publicar.",
        "Somente leitura no formulário. Cliente **não** altera. Valores: Rascunho (parceiro), Aguardando análise MTI, Ajuste solicitado, Homologado, Ativo (publicado), Reprovado, Paralisado.",
    ),
    "form-patlasv4-proto-cat-catalogo-observacoes": S(
        "Texto livre de apoio (regras comerciais, exceções, notas para proposta).",
        "Pode alimentar templates de proposta/OS/notificações; aparece na análise.",
        "Digitado por MTI ou parceiro.",
        "Opcional. Não substitui justificativa formal da análise.",
    ),
    # ── Produto ───────────────────────────────────────────────
    "form-patlasv4-proto-cat-produto-identificador": S(
        "Nome comercial do item do catálogo (o “prato” do cardápio).",
        "Card/lista de produtos; Portal Cliente/Parceiro; cotação; OS; templates.",
        "Cadastro manual ou coluna do CSV de importação.",
        "Obrigatório. Destaque visual no card da lista (junto com Tipo e Status).",
    ),
    "form-patlasv4-proto-cat-produto-part-number": S(
        "SKU / part number do fabricante ou código interno do parceiro.",
        "Conciliação com planilhas do parceiro, CSV, integrações e auditoria.",
        "Informado pelo parceiro/MTI; frequentemente vem da planilha oficial da parceria.",
        "Obrigatório. Ex.: `Q501011`. Preferir estabilidade entre versões do catálogo.",
    ),
    "form-patlasv4-proto-cat-produto-tipo": S(
        "Classifica o item como Licença ou Serviço — muda quais campos de esforço aparecem.",
        "UI (card); regras de complexidade/peso/qtde HST-UST; fator Tipo 3; relatórios.",
        "Selecionado no cadastro/CSV.",
        "Obrigatório. Se `Serviço`, mostrar complexidade/coeficiente/peso/qtde. Se `Licença`, esses campos ficam ocultos.",
    ),
    "form-patlasv4-proto-cat-produto-grupo": S(
        "Agrupa produtos para filtro, relatório e organização visual (ex.: Implantação, Sustentação).",
        "Listas, filtros no portal, exportações e visão gerencial.",
        "Referência à classe **Grupo** (metadado cadastrado pela MTI).",
        "Obrigatório. Cadastre o Grupo antes de usar no produto. Destaque no card da lista.",
    ),
    "form-patlasv4-proto-cat-produto-status": S(
        "Situação do produto (Ativo, Homologado, Paralisado…). Controla se entra em consumo.",
        "Tag na lista; elegibilidade Tipo 2/3 (produtos ativos); Portal do Cliente.",
        "Métodos de homologação/inativação ou cadastro.",
        "Obrigatório. Tag verde (Ativo/Homologado) / vermelho (Paralisado). Produto paralisado não deve entrar em novos consumos.",
    ),
    "form-patlasv4-proto-cat-produto-status-fluxo": S(
        "Andamento do item no ciclo portal parceiro ↔ análise MTI (mesmo espelho do catálogo).",
        "Portal do Parceiro; Análise MTI; bloqueio de edição enquanto aguarda parecer.",
        "Eventos de envio/parecer/publicação (igual ao status de fluxo do catálogo).",
        "Somente leitura. Cliente não cadastra/altera.",
    ),
    "form-patlasv4-proto-cat-produto-universal": S(
        "Indica se o produto entra na lógica de catálogo/moeda (Tipos 2 e 3).",
        "Contratação Tipo 2/3; Catálogo Universal; cálculo de fator; listagens de objetos universais.",
        "Toggle no cadastro/CSV. Independente do toggle Individualizado (**RN-P-02**).",
        "Obrigatório (Sim/Não). Pode ser Sim junto com Individualizado = Sim.",
    ),
    "form-patlasv4-proto-cat-produto-individualizado": S(
        "Indica se o produto pode ser vendido/contratado como item avulso (Tipo 1), fora da moeda do catálogo.",
        "Contratos Tipo 1; objetos específicos; propostas unitárias.",
        "Toggle no cadastro/CSV. Independente de Universal (**RN-P-02**).",
        "Obrigatório. Se **somente** Individualizado (Universal=Não): **sem** fator de conversão Tipo 3 (**RN-P-03**).",
    ),
    "form-patlasv4-proto-cat-produto-alerta-integracao": S(
        "Explica que códigos SIAG/Protheus preferem integração; manual é exceção.",
        "UI do formulário Produto.",
        "Texto fixo do formulário.",
        "Não grava dado. Acompanha o toggle de preenchimento manual.",
    ),
    "form-patlasv4-proto-cat-produto-preencher-manual": S(
        "Liga/desliga a digitação manual dos seis códigos (item, catálogo, universal × SIAG/Protheus).",
        "Visibilidade dos campos de código; CSV; integração.",
        "Default **Não**.",
        "Obrigatório. Se Sim, exibir os seis códigos.",
    ),
    "form-patlasv4-proto-cat-produto-cod-siag-item": S(
        "Código SIAG do item/produto.",
        "Integração e conciliação do item unitário.",
        "Integração SIAG ou digitação manual condicionada.",
        "Visível se preenchimento manual.",
    ),
    "form-patlasv4-proto-cat-produto-cod-protheus-item": S(
        "Código Protheus do item/produto.",
        "ERP / faturamento do item.",
        "Integração Protheus ou manual.",
        "Visível se preenchimento manual.",
    ),
    "form-patlasv4-proto-cat-produto-cod-siag-cat": S(
        "Código SIAG do catálogo ao qual o produto pertence (redundância útil para integração).",
        "Integrações que precisam do par item↔catálogo sem navegar relacionamentos.",
        "Preferencialmente herdado do Catálogo; pode ser manual.",
        "Visível se preenchimento manual. Deve ser coerente com o catálogo referenciado.",
    ),
    "form-patlasv4-proto-cat-produto-cod-protheus-cat": S(
        "Código Protheus do catálogo do produto.",
        "Integração ERP item↔catálogo.",
        "Herdado do catálogo ou manual.",
        "Visível se preenchimento manual.",
    ),
    "form-patlasv4-proto-cat-produto-cod-siag-univ": S(
        "Código SIAG do Catálogo Universal relacionado.",
        "Cenários Tipo 2/3 e objetos universais.",
        "Do Universal / catálogo pai, ou manual.",
        "Visível se preenchimento manual.",
    ),
    "form-patlasv4-proto-cat-produto-cod-protheus-univ": S(
        "Código Protheus do Catálogo Universal relacionado.",
        "Integração ERP da camada universal.",
        "Do Universal / catálogo pai, ou manual.",
        "Visível se preenchimento manual.",
    ),
    "form-patlasv4-proto-cat-produto-modelo-venda": S(
        "Como o item é comercializado (por licença, serviço, homologação…).",
        "Regras comerciais, propostas e relatórios. Não é destaque no card da lista.",
        "Referência à classe **Modelo de Venda** (metadado MTI).",
        "Obrigatório. Cadastre o modelo antes de usar.",
    ),
    "form-patlasv4-proto-cat-produto-metrica": S(
        "Unidade de medida/moeda do item (USN, UST, HST…). Define como o consumo debita o contrato.",
        "Cálculos Tipo 2/3; OS; orçamento; fator de conversão; Portal do Cliente.",
        "Referência à classe **Métrica** (pré-cadastrada pela MTI).",
        "Obrigatório. Não destacar no card. Parceria fora das métricas universais: sem fator Tipo 3 (**RN-P-04**).",
    ),
    "form-patlasv4-proto-cat-produto-cobranca": S(
        "Modelo de cobrança do item (pode diferir do catálogo).",
        "Faturamento unitário; propostas; não destacar no card.",
        "Referência a **Tipo de Cobrança**.",
        "Obrigatório.",
    ),
    "form-patlasv4-proto-cat-produto-valor-unitario": S(
        "Preço unitário de comercialização em R$. Base do fator Tipo 3 e do consumo.",
        "Cotação; OS; orçamento; cálculo `fator = unitário ÷ moeda_universal` (**RN-FAT-01**).",
        "Informado no cadastro/CSV (parceiro ou MTI). Markup **não** fica aqui (**RN-P-05**).",
        "Obrigatório, ≥ 0. Conferir com planilha CGS/parceiro na análise MTI.",
    ),
    "form-patlasv4-proto-cat-produto-fator-conversao": S(
        "Quantas unidades da moeda universal equivalem a 1 unidade deste produto (Tipo 3).",
        "Orçamento/OS Tipo 3: `moeda × fator × qtde [× complexidade] [× peso]` (**RN-FAT-03**).",
        "**Calculado** pelo sistema: `valor_unitário_produto ÷ valor_moeda_universal` (ex.: 22679 ÷ 282,58 ≈ 80,26). Licenciamento USN tipicamente fator 1 (**RN-FAT-02**).",
        "Somente leitura. Vazio se produto só Individualizado (**RN-P-03**) ou parceria sem métrica universal (**RN-P-04**).",
    ),
    "form-patlasv4-proto-cat-produto-complexidade": S(
        "Faixa textual de complexidade do serviço (ex.: Muito Baixa…Muito Alta), quando a parceria usa texto.",
        "Cálculo de esforço/total de serviço; OS.",
        "Cadastro/CSV. Alternativa ao coeficiente numérico (**RN-CX-01**).",
        "Somente se Tipo = Serviço. Visível condicionalmente.",
    ),
    "form-patlasv4-proto-cat-produto-coeficiente-complexidade": S(
        "Multiplicador numérico de complexidade (ex.: 0,8 / 1,0 / 1,2) quando a parceria mede assim.",
        "Total serviço = valor × qtde × complexidade × peso (**RN-CX-02**).",
        "Cadastro/CSV conforme tabela da parceria.",
        "Somente Serviço. Usar texto **ou** coeficiente conforme parceria (**RN-CX-01**).",
    ),
    "form-patlasv4-proto-cat-produto-peso": S(
        "Fator de peso do serviço, se a parceria utilizar na fórmula de total.",
        "Cálculo de OS/orçamento de serviços.",
        "Cadastro/CSV da parceria.",
        "Somente Serviço e somente se a parceria usar peso. Default típico 1.",
    ),
    "form-patlasv4-proto-cat-produto-qtde-hst-ust": S(
        "Quantidade padrão de HST/UST consumida por execução do serviço.",
        "Sugestão na abertura de OS/orçamento; planejamento de saldo.",
        "Parametrizado no cadastro do produto (parceiro/MTI).",
        "Somente Serviço. Opcional.",
    ),
    "form-patlasv4-proto-cat-produto-focal-vendas": S(
        "Pessoa MTI focal comercial deste produto (pode diferir do catálogo).",
        "Contatos e notificações; mesma página do produto (sem sub-aba).",
        "Referência **Pessoa**.",
        "Opcional.",
    ),
    "form-patlasv4-proto-cat-produto-focal-posvendas": S(
        "Pessoa MTI focal de pós-venda do produto.",
        "Suporte/OS após contratação.",
        "Referência **Pessoa**.",
        "Opcional.",
    ),
    "form-patlasv4-proto-cat-produto-unidade-dtic": S(
        "UO MTI responsável pelo produto.",
        "Governança, filas e permissões.",
        "Referência **Organização** (UO MTI).",
        "Obrigatório.",
    ),
    "form-patlasv4-proto-cat-produto-parceria": S(
        "Parceria comercial do produto (redundante útil quando o catálogo já tem parceria).",
        "Filtros, markup (Dados de Parceria), Portal do Parceiro.",
        "Referência **Parceria**. Frequentemente herdada do catálogo.",
        "Opcional no formulário, mas operacionalmente alinhada ao catálogo.",
    ),
    "form-patlasv4-proto-cat-produto-catalogo": S(
        "Catálogo (cardápio) ao qual o produto pertence — vínculo obrigatório.",
        "Tudo que lista produtos por catálogo/versão; CSV; análise; portal.",
        "Referência **Catálogo**. No CSV, coluna de catálogo/versão.",
        "**RN-P-01:** exatamente 1 catálogo. Obrigatório.",
    ),
    "form-patlasv4-proto-cat-produto-link-catalogo": S(
        "URL de apoio do item/catálogo na base da parceria.",
        "Consulta rápida; não substitui o cadastro.",
        "Informado manualmente.",
        "Opcional.",
    ),
    "form-patlasv4-proto-cat-produto-observacoes": S(
        "Texto rico com notas do produto (escopo, exclusões, condições).",
        "Templates de proposta/OS; análise MTI.",
        "Digitado ou importado.",
        "Opcional. Markup **não** vai aqui — usar Dados de Parceria por Produto.",
    ),
    # ── Universal ─────────────────────────────────────────────
    "form-patlasv4-proto-cat-universal-identificador": S(
        "Nome do Catálogo Universal (camada que agrega catálogos para Tipos 2/3 / CGS).",
        "Contratos com objetos universais; conversão de moeda; visão consolidada MTI.",
        "Cadastro MTI no backoffice.",
        "Obrigatório. Ex.: `Catálogo Universal MTI`.",
    ),
    "form-patlasv4-proto-cat-universal-cod-siag": S(
        "Código SIAG do universal.",
        "Integração e objetos contratuais Tipo 2/3.",
        "Integração SIAG ou digitação.",
        "Opcional até haver integração.",
    ),
    "form-patlasv4-proto-cat-universal-cod-protheus": S(
        "Código Protheus do universal.",
        "Integração ERP.",
        "Integração Protheus ou digitação.",
        "Opcional até haver integração.",
    ),
    "form-patlasv4-proto-cat-universal-status": S(
        "Situação do universal (Ativo, Homologado, Paralisado…).",
        "Elegibilidade para novos contratos Tipo 2/3.",
        "Alterado pela MTI.",
        "Obrigatório.",
    ),
    "form-patlasv4-proto-cat-universal-catalogos": S(
        "Catálogos (camada 2) vinculados a este universal.",
        "Define quais cardápios alimentam a moeda/créditos universais.",
        "Seleção de registros **Catálogo** já existentes.",
        "Obrigatório (ao menos um na operação). Catálogos paralisados não devem entrar em novos vínculos.",
    ),
    # ── Parceria ──────────────────────────────────────────────
    "form-patlasv4-proto-cat-parceria-identificador": S(
        "Nome da parceria comercial MTI × organização (ex.: MTI HOST).",
        "Catálogos, produtos, soluções, Portal do Parceiro, análise.",
        "Primeiro cadastro **pela MTI** no backoffice (Discovery).",
        "Obrigatório. Uma Organização pode ter N parcerias.",
    ),
    "form-patlasv4-proto-cat-parceria-descricao": S(
        "Texto rico explicando o objeto da parceria.",
        "Consulta no backoffice; materiais de apoio.",
        "Digitado pela MTI (com insumos do parceiro).",
        "Opcional.",
    ),
    "form-patlasv4-proto-cat-parceria-parceiro": S(
        "Organização (CNPJ) que é a empresa parceira.",
        "Habilitação Fase 1; Portal do Parceiro; vínculos contratuais.",
        "Referência **Organização** já homologada (Fase 1).",
        "Obrigatório. Sem organização homologada não se cria parceria operacional.",
    ),
    "form-patlasv4-proto-cat-parceria-status": S(
        "Ativa / Homologada / Paralisada / Concluída — governança da parceria.",
        "Bloqueia novos produtos em homologação se Paralisada; libera portal se Homologada/Ativa.",
        "MTI (DIREX/Presidência para Homologada, quando aplicável).",
        "Obrigatório. Homologada = autorizada institucionalmente.",
    ),
    "form-patlasv4-proto-cat-parceria-solucoes": S(
        "Soluções ofertadas dentro da parceria (com fabricante em texto).",
        "Cadastro de produtos; documentos de apoio; visão comercial.",
        "Registros da classe **Solução** vinculados.",
        "Obrigatório na operação (ao menos uma solução típica).",
    ),
    # ── Solução ───────────────────────────────────────────────
    "form-patlasv4-proto-cat-solucao-identificador": S(
        "Nome da solução ofertada (linha de produto da parceria ou MTI).",
        "Produtos, Dados de Parceria, documentos, filtros.",
        "Cadastro MTI/parceiro no backoffice.",
        "Obrigatório.",
    ),
    "form-patlasv4-proto-cat-solucao-parceria": S(
        "Parceria dona da solução. Vazio = solução própria MTI.",
        "Escopo de quem pode editar; vínculo comercial.",
        "Referência **Parceria**.",
        "Opcional. Se preenchida, restringe ao contexto da parceria.",
    ),
    "form-patlasv4-proto-cat-solucao-descricao": S(
        "Descrição rica da solução.",
        "Consulta e materiais.",
        "Digitação.",
        "Opcional.",
    ),
    "form-patlasv4-proto-cat-solucao-fabricante-nome": S(
        "Nome do fabricante (texto livre). Não existe classe Fabricante.",
        "Documentação, compliance e apoio comercial.",
        "Informado pelo parceiro/MTI.",
        "Opcional, recomendado. Discovery: fabricante = campos texto na Solução.",
    ),
    "form-patlasv4-proto-cat-solucao-fabricante-contato": S(
        "Contato do fabricante (e-mail/telefone/texto).",
        "Acionamento em dúvidas técnicas/comerciais.",
        "Informado no cadastro.",
        "Opcional, recomendado.",
    ),
    "form-patlasv4-proto-cat-solucao-documentos-apoio": S(
        "Anexos (papel timbrado, Gartner, autorizações, etc.).",
        "Análise MTI; compliance; consulta.",
        "Upload no cadastro da solução.",
        "Opcional. Múltiplos arquivos.",
    ),
    # ── Metadados ─────────────────────────────────────────────
    "form-patlasv4-proto-cat-metrica-identificador": S(
        "Sigla da métrica/unidade de moeda (USN, UST, HST, UST-IA…).",
        "Campo Métrica do Produto; contratos Tipo 2/3; cálculos de consumo.",
        "Cadastro MTI (backoffice) **antes** dos produtos.",
        "Obrigatório e único. USN/UST/HST são as métricas universais típicas.",
    ),
    "form-patlasv4-proto-cat-metrica-descricao": S(
        "Explica o significado da métrica para quem cadastra ou analisa.",
        "Ajuda de preenchimento; treinamento; documentação.",
        "Digitado pela MTI.",
        "Opcional, fortemente recomendado.",
    ),
    "form-patlasv4-proto-cat-tipo-cobranca-modelo": S(
        "Nome do modelo de cobrança (Sob Demanda, Mensal, Anual…).",
        "Referenciado por Catálogo e Produto.",
        "Cadastro MTI de metadados.",
        "Obrigatório.",
    ),
    "form-patlasv4-proto-cat-tipo-cobranca-recorrencia": S(
        "Detalha a recorrência (Mensal, Por Execução, Por Homologação…).",
        "Regras de faturamento e textos comerciais.",
        "Cadastro MTI.",
        "Opcional.",
    ),
    "form-patlasv4-proto-cat-categoria-identificador": S(
        "Nome da categoria de serviços (ex.: Cloud/Infra, Desenvolvimento).",
        "Classificação gerencial; filtros; relatórios Sydle.",
        "Cadastro MTI (metadado). Pode não existir no discovery inicial — mantida alinhada ao Sydle.",
        "Obrigatório se a categoria for usada nos produtos/processos.",
    ),
    "form-patlasv4-proto-cat-categoria-descricao": S(
        "Descrição da categoria.",
        "Ajuda e documentação.",
        "MTI.",
        "Opcional.",
    ),
    "form-patlasv4-proto-cat-grupo-identificador": S(
        "Nome do grupo de produtos (filtro/organização).",
        "Campo Grupo do Produto; cards; relatórios.",
        "Cadastro MTI de metadados.",
        "Obrigatório e único por domínio de grupo.",
    ),
    "form-patlasv4-proto-cat-grupo-descricao": S(
        "Descrição do grupo.",
        "Ajuda de preenchimento.",
        "MTI.",
        "Opcional.",
    ),
    "form-patlasv4-proto-cat-modelo-venda-identificador": S(
        "Nome do modelo de venda (Por Licença, Serviço, Homologação…).",
        "Campo Modelo de venda do Produto.",
        "Cadastro MTI.",
        "Obrigatório.",
    ),
    "form-patlasv4-proto-cat-modelo-venda-descricao": S(
        "Descrição do modelo de venda.",
        "Ajuda e documentação comercial.",
        "MTI.",
        "Opcional.",
    ),
    # ── Dados de parceria ─────────────────────────────────────
    "form-patlasv4-proto-cat-dados-parceria-parceria": S(
        "Parceria à qual se aplica o custo/markup deste registro.",
        "Cálculos internos MTI×parceiro; não aparece no Produto (**RN-P-05**).",
        "Referência **Parceria**.",
        "Opcional no form, mas necessário na operação de markup.",
    ),
    "form-patlasv4-proto-cat-dados-parceria-solucao": S(
        "Solução associada aos dados comerciais (custo/markup).",
        "Amarração parceria×solução×produto para composição de preço.",
        "Referência **Solução**.",
        "Obrigatório.",
    ),
    "form-patlasv4-proto-cat-dados-parceria-vigencia": S(
        "Prazo de validade das condições comerciais (12 meses, perpétua…).",
        "Revisão periódica de markup/custo.",
        "Acordo comercial MTI×parceiro.",
        "Obrigatório.",
    ),
    "form-patlasv4-proto-cat-dados-parceria-custo-parceiro": S(
        "Quanto o parceiro cobra da MTI pelo item (R$) — custo de entrada.",
        "Formação de preço interno; margem; auditoria. **Não** é o valor unitário do Produto.",
        "Planilha/contrato com o parceiro; informado no backoffice.",
        "Obrigatório, ≥ 0. Markup oficial fica neste formulário (**RN-P-05**).",
    ),
    "form-patlasv4-proto-cat-dados-parceria-markup": S(
        "Markup oficial da combinação parceria×produto (margem aplicada sobre o custo).",
        "Precificação interna MTI; não cadastrar markup no Produto.",
        "Negociação MTI×parceiro / política comercial.",
        "Obrigatório. **RN-P-05.**",
    ),
    "form-patlasv4-proto-cat-dados-parceria-dist-parceiro": S(
        "Percentual da distribuição financeira pertencente ao parceiro.",
        "Rateio de receita; relatórios de parceria.",
        "Acordo comercial.",
        "Obrigatório. **RN-DP-01:** parceiro % + MTI % = 100.",
    ),
    "form-patlasv4-proto-cat-dados-parceria-dist-mti": S(
        "Percentual da distribuição financeira pertencente à MTI.",
        "Rateio de receita; relatórios.",
        "Acordo comercial.",
        "Obrigatório. Soma com distribuição do parceiro deve ser 100% (**RN-DP-01**).",
    ),
    # ── Análise MTI ───────────────────────────────────────────
    "patlasv4proto-ac-alerta": S(
        "Deixa claro que a análise é exclusiva do backoffice MTI.",
        "Orientação na abertura da análise.",
        "Texto fixo do formulário.",
        "Não grava dado de negócio.",
    ),
    "patlasv4proto-ac-origem": S(
        "Indica se o pedido veio do Portal do Parceiro ou de cadastro interno MTI.",
        "Triagem da fila; SLA; auditoria.",
        "Sistema: derivado do canal que criou/enviou o catálogo.",
        "Somente leitura.",
    ),
    "patlasv4proto-ac-parceiro": S(
        "Organização parceira dona do envio.",
        "Contexto da análise; contato; filtros.",
        "Herdado do catálogo/parceria / sessão do portal.",
        "Somente leitura.",
    ),
    "patlasv4proto-ac-parceria": S(
        "Parceria do catálogo em análise.",
        "Contexto comercial da decisão.",
        "Herdado do catálogo enviado.",
        "Somente leitura.",
    ),
    "patlasv4proto-ac-status-atual": S(
        "Status de fluxo no momento da abertura da análise.",
        "Validar se ainda está “Aguardando análise” antes de decidir.",
        "Espelho do status de fluxo do catálogo/produto.",
        "Somente leitura.",
    ),
    "patlasv4proto-ac-catalogo": S(
        "Snapshot/embutido do catálogo enviado para parecer.",
        "Conferência de versão, valores e metadados sem sair da análise.",
        "Registro Catálogo vinculado ao envio do portal/backoffice.",
        "Somente leitura nesta tela.",
    ),
    "patlasv4proto-ac-produtos": S(
        "Lista dos produtos enviados junto com o catálogo.",
        "Checagem de preço, métrica, CSV e inconsistências.",
        "Produtos do catálogo no momento do envio.",
        "Somente leitura. Tabela embutida.",
    ),
    "patlasv4proto-ac-decisao": S(
        "Parecer da MTI: Aprovar, Solicitar ajuste ou Reprovar.",
        "Atualiza status de fluxo no portal e libera/bloqueia publicação.",
        "Preenchido pelo analista MTI no backoffice.",
        "Obrigatório. Controla visibilidade de justificativa/obs/publicar.",
    ),
    "patlasv4proto-ac-novo-status": S(
        "Prévia do status que será gravado após confirmar a decisão.",
        "Transparência para o analista antes da assinatura.",
        "Calculado: Aprovar→Homologado (ou Ativo se publicar); Ajuste→Ajuste solicitado; Reprovar→Reprovado.",
        "Somente leitura.",
    ),
    "patlasv4proto-ac-justificativa": S(
        "Motivo formal do ajuste ou da reprovação — o parceiro verá no portal.",
        "Portal do Parceiro (campo justificativa); auditoria; reenvio.",
        "Digitado pelo analista MTI.",
        "Obrigatório quando Decisão = Solicitar ajuste ou Reprovar.",
    ),
    "patlasv4proto-ac-anexo": S(
        "Arquivo de apoio ao parecer (checklist, planilha marcada, print).",
        "Portal/parceiro e trilha de auditoria.",
        "Upload do analista.",
        "Opcional; aparece com ajuste/reprovação.",
    ),
    "patlasv4proto-ac-obs": S(
        "Observação interna/externa da aprovação (não é justificativa de rejeição).",
        "Histórico do catálogo; notificação opcional.",
        "Analista MTI.",
        "Visível quando Decisão = Aprovar. Opcional.",
    ),
    "patlasv4proto-ac-publicar": S(
        "Se Sim, além de homologar, publica em Produção (status Ativo publicado).",
        "Disponibiliza para consumo após regras de contrato/apostila.",
        "Analista MTI na aprovação.",
        "Visível só em Aprovar. Cliente só vê a versão no portal após apostilamento (**RN-VER-03**).",
    ),
    "patlasv4proto-ac-assinado-por": S(
        "Quem assina digitalmente o parecer.",
        "Conformidade e trilha de auditoria da análise.",
        "Referência **Pessoa** (analista logado / selecionado).",
        "Obrigatório.",
    ),
    "patlasv4proto-ac-data": S(
        "Data da assinatura do parecer.",
        "Auditoria e SLA.",
        "Informada/gerada no momento da confirmação.",
        "Obrigatório.",
    ),
    "patlasv4proto-ac-assinatura": S(
        "Confirmação explícita da assinatura digital do parecer.",
        "Habilita a gravação da decisão.",
        "Ação do analista.",
        "Obrigatório = Sim para confirmar.",
    ),
    # ── Portal parceiro (form espelho backoffice) ─────────────
    "patlasv4proto-ppc-alerta": S(
        "Explica o papel do Portal do Parceiro neste formulário espelho.",
        "Orientação ao homologar/especificar no backoffice.",
        "Texto fixo.",
        "Não grava dado.",
    ),
    "patlasv4proto-ppc-organizacao": S(
        "Organização do usuário parceiro logado.",
        "Filtro de catálogos; segurança (só vê o que é dele).",
        "Sessão do portal / Organização homologada.",
        "Somente leitura.",
    ),
    "patlasv4proto-ppc-parceria": S(
        "Parceria em que o parceiro está cadastrando o catálogo.",
        "Escopo dos produtos; envio à MTI.",
        "Lista de parcerias da organização (cadastradas pela MTI).",
        "Obrigatório. Parceiro não cria parceria aqui.",
    ),
    "patlasv4proto-ppc-status": S(
        "Status do envio espelhado com o backoffice.",
        "Bloqueio de edição; fila “Enviados/ajustes” no portal.",
        "Mesmo campo de status de fluxo do catálogo.",
        "Somente leitura.",
    ),
    "patlasv4proto-ppc-justificativa-mti": S(
        "Última justificativa devolvida pela MTI (ajuste/reprovação).",
        "Orientar a correção no portal antes do reenvio.",
        "Vem da Análise MTI (campo justificativa).",
        "Somente leitura. Preenchido só após parecer de ajuste/reprovação.",
    ),
    "patlasv4proto-ppc-catalogo": S(
        "Catálogo em rascunho/edição no contexto do portal.",
        "Montagem do cardápio antes do envio.",
        "Registro Catálogo da parceria.",
        "Obrigatório. Editável só em Rascunho ou Ajuste solicitado.",
    ),
    "patlasv4proto-ppc-produtos": S(
        "Produtos do catálogo no portal (manual ou CSV).",
        "Envio à MTI; correção pós-ajuste.",
        "Classe Produto / import CSV.",
        "Editável conforme status. Preferir CSV para volume.",
    ),
    "patlasv4proto-ppc-alerta-envio": S(
        "Avisa que ao enviar o status muda e a edição trava.",
        "UI antes do método Enviar à MTI.",
        "Texto fixo.",
        "Não grava dado.",
    ),
    "patlasv4proto-ppc-obs-envio": S(
        "Mensagem opcional do parceiro para o analista MTI.",
        "Aparece no contexto da análise no backoffice.",
        "Digitada no portal no momento do envio.",
        "Opcional.",
    ),
    # ── Portal cliente (form espelho) ─────────────────────────
    "patlasv4proto-pcc-alerta": S(
        "Deixa explícito: cliente não cadastra catálogo/produto.",
        "Portal do Cliente / especificação no backoffice.",
        "Texto fixo.",
        "Não grava dado.",
    ),
    "patlasv4proto-pcc-contrato": S(
        "Contrato do órgão logado que define o direito de consumo.",
        "Filtro do catálogo visível; cotação; OS.",
        "Cadastro contratual (Fase 3) no backoffice MTI.",
        "Somente leitura no portal.",
    ),
    "patlasv4proto-pcc-versao": S(
        "Versão do catálogo apostilada neste contrato.",
        "Quais itens o cliente enxerga/consome.",
        "Atributo do contrato; só muda com apostilamento (**RN-VER-03**).",
        "Somente leitura.",
    ),
    "patlasv4proto-pcc-catalogo": S(
        "Itens em Produção da versão do contrato (visão de consumo).",
        "Cotação, demanda e OS.",
        "Produtos do catálogo publicado na versão vinculada.",
        "Somente leitura. Sem ação de cadastro.",
    ),
    "patlasv4proto-pcc-acoes": S(
        "Lista o que o cliente pode fazer (consultar, cotar, OS…).",
        "Orientação de UX / especificação.",
        "Regras de perfil do Portal do Cliente.",
        "Somente leitura / informativo.",
    ),
    # ── Métodos ───────────────────────────────────────────────
    "patlasv4proto-mcat-nv-alerta": S(
        "Explica que nova versão não apaga a anterior.",
        "Método Criar nova versão.",
        "Texto fixo.",
        "Alinha a **RN-VER-02**.",
    ),
    "patlasv4proto-mcat-nv-versao-atual": S(
        "Versão de origem do snapshot.",
        "Conferência antes de gerar N+1.",
        "Campo versão do catálogo atual.",
        "Somente leitura.",
    ),
    "patlasv4proto-mcat-nv-nova-versao": S(
        "Número da nova versão a criar.",
        "Novo registro de catálogo; contratos futuros/apostila.",
        "Informado pela MTI.",
        "Obrigatório. Deve ser maior/diferente da atual. Ex.: 1.7.",
    ),
    "patlasv4proto-mcat-nv-motivo": S(
        "Changelog: o que mudou (preço, itens novos, descontinuações).",
        "Auditoria; comunicação ao parceiro/cliente; apostilamento.",
        "Digitado pela MTI.",
        "Obrigatório.",
    ),
    "patlasv4proto-mcat-nv-copiar-produtos": S(
        "Se Sim, copia os produtos da versão atual para a nova; se Não, começa vazia (CSV).",
        "Velocidade de versionamento vs. recarga total.",
        "Escolha da MTI no método.",
        "Obrigatório. Default Sim.",
    ),
    "patlasv4proto-mcat-csv-alerta": S(
        "Orienta uso do template oficial CSV.",
        "Método Importar CSV.",
        "Texto fixo.",
        "**RN-CSV-01.**",
    ),
    "patlasv4proto-mcat-csv-arquivo": S(
        "Arquivo CSV UTF-8 com as colunas do template Atlas.",
        "Carga em massa de produtos no catálogo/versão.",
        "Planilha do parceiro ou export anterior do Atlas.",
        "Obrigatório. Validar encoding e colunas antes de gravar.",
    ),
    "patlasv4proto-mcat-csv-modo": S(
        "Como aplicar o arquivo: acrescentar, atualizar ou substituir (com restrições).",
        "Evita apagar versão já apostilada por engano.",
        "Escolha do usuário no método.",
        "Obrigatório. Substituir versão só em rascunho não apostilado.",
    ),
    "patlasv4proto-mcat-csv-resumo": S(
        "Resultado da validação (ok / erros / novos).",
        "Feedback antes de confirmar a importação.",
        "Calculado pelo validador do CSV.",
        "Somente leitura.",
    ),
    "patlasv4proto-mcat-ap-alerta": S(
        "Método rápido de aprovação (alternativo à classe Análise completa).",
        "Backoffice MTI.",
        "Texto fixo.",
        "Preferir Análise de catálogo quando origem = portal.",
    ),
    "patlasv4proto-mcat-ap-obs": S(
        "Observação opcional da aprovação.",
        "Histórico do registro.",
        "Analista.",
        "Opcional.",
    ),
    "patlasv4proto-mcat-ap-assinatura": S(
        "Confirma assinatura digital da aprovação.",
        "Trilha de auditoria.",
        "Analista.",
        "Obrigatório = Sim.",
    ),
    "patlasv4proto-mcat-aj-alerta": S(
        "Método de devolução com ajuste (espelha no portal).",
        "Backoffice MTI.",
        "Texto fixo.",
        "Justificativa obrigatória.",
    ),
    "patlasv4proto-mcat-aj-motivo": S(
        "Justificativa do ajuste — visível ao parceiro.",
        "Portal do Parceiro; reenvio.",
        "Analista MTI.",
        "Obrigatório.",
    ),
    "patlasv4proto-mcat-aj-anexo": S(
        "Anexo de apoio ao pedido de ajuste.",
        "Portal/parceiro e auditoria.",
        "Upload do analista.",
        "Opcional.",
    ),
    "patlasv4proto-mcat-aj-assinatura": S(
        "Confirma assinatura digital do pedido de ajuste.",
        "Auditoria.",
        "Analista.",
        "Obrigatório = Sim.",
    ),
}


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    updated_fields = 0
    missing: list[str] = []
    for form in forms:
        if form.get("id") not in FORM_IDS:
            continue
        for field in form.get("fields") or []:
            fid = field.get("id")
            if not fid:
                continue
            if fid in SPECS:
                field["spec"] = SPECS[fid]
                updated_fields += 1
            else:
                # fallback genérico para não deixar vazio
                if field.get("type") == "alert":
                    field["spec"] = S(
                        "Mensagem de orientação na tela.",
                        "Somente interface do formulário.",
                        "Texto configurado no protótipo.",
                        "Não grava dado de negócio.",
                    )
                    updated_fields += 1
                else:
                    missing.append(f"{form['id']}::{fid}")

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK specs atualizados: {updated_fields}")
    if missing:
        print(f"Sem spec explícita ({len(missing)}):")
        for m in missing:
            print(" ", m)


if __name__ == "__main__":
    main()
