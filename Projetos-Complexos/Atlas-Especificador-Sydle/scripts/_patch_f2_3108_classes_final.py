# -*- coding: utf-8 -*-
"""
Finaliza classes Parceria, Catálogo e Produto — validação 31/08/2026.
- Aplica decisões da reunião ATLAS Catálogo (de-para + DOCX + chat).
- Padroniza detalhamento: Para que serve · Como usar · Origem · Regras.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json"

LEGEND = (
    "`!` Parceiro preenche · `#` MTI preenche · `!#` Ambos · "
    "`?` Importado Protheus (RO pós-carga; admin edita) · "
    "MAIÚSCULAS = parceiro não preenche e não visualiza"
)
FONTE = "Reunião ATLAS Catálogo 31/08/2026 · validações 05–25/08 · de-para planilha"


def D(
    serve: str,
    usar: str,
    origem: str,
    regras: str,
    *,
    classe: str,
    preenche: str = "",
    visualiza: str = "",
) -> str:
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


# ── SPECS por field id ─────────────────────────────────────────────
SPECS: dict[str, str] = {
    # ═══ PARCERIA ═══
    "form-patlasv4-proto-cat-parceria-identificador": D(
        "Nome comercial do acordo entre MTI e parceira (ex.: MTI SIMPLIFICA).",
        "MTI cadastra ao criar a parceria. Parceiro consulta após habilitação no portal.",
        "Digitado pela MTI no backoffice. Não importa da planilha ERP.",
        "RN-PARC-01: Obrigatório e único na operação. Planilha T2 col. Parceria (#Nome). "
        "Ao salvar, gera Catálogo em Rascunho (RN-PAR-03).",
        classe="Parceria (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-parceria-sigla": D(
        "Prefixo alfanumérico para gerar o Código Atlas dos produtos desta parceria.",
        "Informe 2–6 caracteres (ex.: SIMP, HOST) antes de cadastrar produtos.",
        "MTI define no cadastro da parceria.",
        "RN-PAR-05 / RN-PROD-08: Única entre parcerias. Código Atlas = Sigla + sequencial (SIMP001). "
        "≠ Código Protheus item.",
        classe="Parceria (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-parceria-codigo-parceira": D(
        "Código da organização parceira no ERP (Protheus/Infocenter).",
        "Importado na carga inicial de códigos. Após importação, só administrador altera.",
        "Importação ERP (somente códigos — Luís 31/08). Não nasce comercialmente no Atlas.",
        "RN-IMP-01: Dados comerciais nascem no Atlas; ERP = códigos. "
        "Classe Parceria. Parceiro visualiza vínculo; não edita código.",
        classe="Parceria (Atlas Fase 2)",
        preenche="Importação ERP / Admin",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-parceria-catalogos": D(
        "Referência ao catálogo gerado automaticamente para esta parceria.",
        "Somente consulta. Edite produtos no Catálogo ou no portal do parceiro.",
        "Sistema cria ao salvar nova Parceria (status Rascunho).",
        "RN-PAR-03: Um catálogo rascunho por parceria/solução. Parceiro monta itens; MTI homologa/publica.",
        classe="Parceria (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-parceria-vertical": D(
        "Vertical de Serviço de TI do acordo (Dados e IA, Nuvem…).",
        "Selecione a vertical antes de publicar. Exibida no catálogo (RO) para o parceiro.",
        "Cadastro Atlas — classe Parceria (não Organização, não Produto).",
        "RN-PARC-02: Obrigatório. Planilha T1 Vertical Atuação → Parceria. "
        "Produto herda RO da Parceria via Catálogo.",
        classe="Parceria (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (consulta RO no catálogo)",
    ),
    "form-patlasv4-proto-cat-parceria-descricao": D(
        "Texto descritivo do acordo comercial.",
        "Opcional. Complementa o nome da parceria para equipes internas.",
        "Digitado pela MTI.",
        "Não substitui objeto de comercialização (Solução/Catálogo).",
        classe="Parceria (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-parceria-parceiro": D(
        "Organização(ões) parceira(s) vinculada(s) ao acordo.",
        "Selecione ao menos uma organização habilitada antes de liberar o portal.",
        "Referência à classe Organização (Fase 1).",
        "Obrigatório quando há parceria comercial. Produto 100% MTI pode existir sem parceria (Gabriel/Luís 31/08).",
        classe="Parceria (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-parceria-status": D(
        "Estágio do workflow portal ↔ MTI da parceria.",
        "Parceiro envia para análise; MTI decide. Não confundir com Ativo (flag operacional).",
        "Atualizado por métodos Enviar / Análise MTI.",
        "Fluxo: Rascunho → Aguardando Análise - MTI → Ajuste/Reprovado/Homologado → Ativo/Paralisado. "
        "RN-PAR-04: Parceiro NÃO publica nem apostila. Durante análise, parceiro em RO.",
        classe="Parceria (Atlas Fase 2)",
        preenche="Parceiro / MTI (workflow)",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-parceria-ativo": D(
        "Indica se a parceria aceita novos vínculos comerciais.",
        "Desligue para bloquear novos catálogos sem encerrar histórico.",
        "MTI altera no backoffice.",
        "Independe do Status de workflow. Preferir inativar a excluir com vínculos.",
        classe="Parceria (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-parceria-observacoes": D(
        "Notas internas MTI sobre a parceria.",
        "Uso interno; não aparece ao parceiro.",
        "Digitado pela MTI.",
        "Opcional. Não substitui campos estruturados.",
        classe="Parceria (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-parceria-solucoes-view": D(
        "Visão consolidada das soluções e seus produtos nesta parceria.",
        "Consulta e navegação. Cadastre soluções na aba Soluções; produtos no Catálogo/portal.",
        "Sistema agrega Solução + Produto vinculados.",
        "Accordion: solução + tabela de itens. Parceiro edita itens no portal em Rascunho.",
        classe="Parceria (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta/edição de itens no portal)",
    ),
    "form-patlasv4-proto-cat-parceria-produtos": D(
        "Lista agregada de todos os itens de catálogo desta parceria (todas as soluções).",
        "Use para auditoria e visão gerencial. Cadastro unitário no Catálogo ou CSV.",
        "Consulta reversa Produto → Parceria.",
        "Somente leitura no backoffice. Renomeado de “produtos da parceria” para “itens do catálogo da parceria” (UX 31/08).",
        classe="Parceria (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-parceria-indice-reajuste": D(
        "Sigla do índice econômico aplicável aos reajustes desta parceria.",
        "Selecione IPCA, IGPM, INPC ou CPI conforme contrato. Cálculo numérico = evento pós-aprovação (12 meses).",
        "MTI cadastra por parceria. Não confundir com manifestação de interesse.",
        "RN-PARC-06: Índice por parceria (planilha T2). Valor percentual calculado automaticamente após homologação — não campo de cadastro manual.",
        classe="Parceria (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (consulta)",
    ),
    # ═══ CATÁLOGO ═══
    "form-patlasv4-proto-cat-catalogo-identificador": D(
        "Nome comercial da família do catálogo (cardápio da solução).",
        "Cadastre antes dos produtos. Parceiro monta rascunho no portal.",
        "MTI ou parceiro no rascunho. Não importa ERP.",
        "RN-CAT-01: Obrigatório. Produto sempre vinculado a um catálogo.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI / Parceiro (rascunho)",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-catalogo-parceria": D(
        "Parceria dona deste catálogo.",
        "Selecione parceria habilitada antes de Solução e produtos.",
        "Referência Parceria. Opcional para catálogo 100% MTI.",
        "Obrigatório quando catálogo é de parceiro. Produto MTI exclusivo pode ficar sem parceria.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-catalogo-solucao": D(
        "Solução comercial à qual o catálogo pertence.",
        "Filtrada pela Parceria. Produtos herdam Parceria + Solução + Versão.",
        "Referência Solução.",
        "Obrigatório. Estrutura: Parceria → Solução → Catálogo N2 → Produtos.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-catalogo-objeto-comercializacao": D(
        "Objeto de comercialização registrado no CIAG e Protheus (nome comercial da oferta).",
        "MTI define; parceiro preenche planilha col. B = col. E (OBJETO COMERCIAL*).",
        "Cadastro Atlas — não importação de dados comerciais ERP.",
        "RN-CAT-02: Distinto do item de catálogo (Produto col. C) e do nome da Solução.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI / Parceiro (planilha col. B/E)",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-catalogo-descricao": D(
        "Escopo e contexto do catálogo.",
        "Opcional. Descreve o propósito do cardápio.",
        "MTI ou parceiro no rascunho.",
        "Não substitui objeto de comercialização.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI / Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-catalogo-status": D(
        "Estágio do ciclo de vida do catálogo (workflow).",
        "Parceiro envia; MTI homologa, publica e apostila.",
        "Métodos Salvar / Enviar / Homologar / Publicar / Apostilar.",
        "Rascunho → Em análise → Ajuste/Reprovado → Homologado → Publicado → Substituído. "
        "Homologar ≠ Publicar ≠ Apostilar. RN-PAR-04: Publicar/Apostilar = somente MTI.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="Workflow",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-catalogo-ativo": D(
        "Disponibilidade do catálogo para novos vínculos.",
        "Desligue para bloquear novos produtos sem apagar histórico.",
        "MTI.",
        "Independe do Status de workflow.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-catalogo-versao": D(
        "Número da edição do cardápio (1.0, 1.1…).",
        "Nasce 1.0. Incrementa por evento (inclusão item, reajuste). Use filtro de versão para histórico.",
        "Sistema incrementa; MTI pode ajustar excepcionalmente.",
        "RN-CAT-07: Única por Parceria+Solução. Obrigatória para publicar. Versão antiga permanece consultável.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="Sistema / MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-catalogo-versao-anterior": D(
        "Versão de origem quando este catálogo foi derivado.",
        "Somente consulta. Preenchido ao criar nova versão.",
        "Método Criar nova versão.",
        "Vazio na primeira versão (1.0).",
        classe="Catálogo (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-catalogo-toggle-universal": D(
        "Indica se o catálogo participa da camada Universal (N3 / moeda universal).",
        "Marque Sim se itens usam catálogo universal MTI. Pode coexistir com Individualizado.",
        "MTI define na publicação.",
        "RN-CAT-03 (31/08): Eixo principal Universal vs Individualizado — NÃO usar toggles serviço/licenciamento como eixo. "
        "Se Sim: exibir códigos N3; produtos herdados Tipo oferta = Universal.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (consulta RO)",
    ),
    "form-patlasv4-proto-cat-catalogo-toggle-individualizado": D(
        "Indica se o catálogo admite oferta individualizada (N1 avulso).",
        "Marque Sim para catálogos só individualizados ou universal+individualizado.",
        "MTI define.",
        "RN-CAT-03b: Pode ser só Individualizado (Universal=Não) ou ambos. Substitui coluna INDIVIDUALIZADO N1.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta RO)",
    ),
    "form-patlasv4-proto-cat-catalogo-variacao": D(
        "Modo de variação de preço/esforço para serviços (complexidade ou peso).",
        "Obrigatório quando o catálogo contém itens Serviço com variação. Licença ignora.",
        "MTI seleciona Por Complexidade, Por Peso ou Sem variação.",
        "17/08: Variação no Catálogo; valores de complexidade/peso no Produto. "
        "Tipo Licença/Serviço é por **item** (Produto), não toggle do catálogo (31/08).",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI",
    ),
    "form-patlasv4-proto-cat-catalogo-faixas-complexidade": D(
        "Tabela de faixas e coeficientes desta versão do catálogo.",
        "Preencha quando Variação = Por Complexidade. Produto seleciona faixa.",
        "MTI cadastra por versão.",
        "Cada linha: Faixa + Coeficiente. Produto.Complexidade → coeficiente RO derivado.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI",
    ),
    "form-patlasv4-proto-cat-catalogo-metricas": D(
        "Métricas que produtos deste catálogo podem selecionar.",
        "Cadastre UST/HST/USN etc. antes de incluir produtos.",
        "MTI define lista permitida.",
        "RN-CAT-04: Produto só escolhe métricas desta lista. Métrica Comum = licenciamento OU serviço do item.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-catalogo-focal-vendas": D(
        "Pessoa MTI responsável comercial pelo catálogo.",
        "MTI informa o focal. Parceiro apenas visualiza.",
        "Referência Pessoa (cadastro MTI).",
        "Planilha T1 FOCAL Vendas → Catálogo. Parceiro não edita (31/08).",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (somente leitura)",
    ),
    "form-patlasv4-proto-cat-catalogo-focal-posvendas": D(
        "Pessoa MTI responsável pelo pós-venda do catálogo.",
        "MTI informa. Parceiro visualiza.",
        "Referência Pessoa.",
        "Planilha T1 FOCAL Pós-vendas → Catálogo. Parceiro não edita.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (somente leitura)",
    ),
    "form-patlasv4-proto-cat-catalogo-unidade-dtic": D(
        "Unidade organizacional MTI responsável pelo catálogo.",
        "Obrigatória para publicar. Parceiro visualiza.",
        "Referência Organização (UO MTI).",
        "Planilha T1 Unidade DTIC* → Catálogo. Parceiro não edita (31/08).",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (somente leitura)",
    ),
    "form-patlasv4-proto-cat-catalogo-data-atualizacao-preco": D(
        "Data da última alteração de preço do catálogo ou de itens agregados.",
        "Atualizada por evento de reajuste ou alteração de valor unitário.",
        "Sistema registra ao homologar alteração de preço.",
        "Exibir em Catálogo e Produto quando houver evento (planilha T2 Data Atualização Preço).",
        classe="Catálogo (Atlas Fase 2)",
        preenche="Sistema (evento)",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-catalogo-cod-siag-cat": D(
        "Código SIAG do catálogo (nível N2).",
        "Importável na carga de códigos. Admin edita pós-importação.",
        "Importação ERP (código) ou digitação MTI.",
        "RN-IMP-01: Somente códigos importáveis. Parceiro não visualiza.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="Importação / MTI",
        visualiza="MTI · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-catalogo-cod-protheus-cat": D(
        "Código Protheus/Infocenter do catálogo (N2).",
        "Importado ou informado na homologação.",
        "Importação ERP.",
        "Parceiro não visualiza. ≠ Código Atlas.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="Importação / MTI",
        visualiza="MTI · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-catalogo-cod-siag-univ": D(
        "Código SIAG do catálogo universal (N3).",
        "Visível só se É catálogo universal = Sim.",
        "Importação ERP / MTI.",
        "Condicional Universal. Parceiro não vê.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="Importação / MTI",
        visualiza="MTI · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-catalogo-cod-protheus-univ": D(
        "Código Protheus do universal (N3).",
        "Visível só se É catálogo universal = Sim.",
        "Importação ERP.",
        "Condicional Universal.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="Importação / MTI",
        visualiza="MTI · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-catalogo-observacoes": D(
        "Notas internas MTI sobre o catálogo.",
        "Uso interno.",
        "MTI.",
        "Parceiro não visualiza.",
        classe="Catálogo (Atlas Fase 2)",
        preenche="MTI",
        visualiza="MTI (edição) · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-catalogo-produtos": D(
        "Itens de catálogo (produtos) vinculados a esta versão.",
        "Cadastre manualmente, via portal parceiro ou Importar CSV.",
        "Classe Produto (vínculo inverso).",
        "RN-P-01: Cada produto pertence a exatamente 1 catálogo. Catálogo pode misturar Licença + Serviço (tipo por item).",
        classe="Catálogo (Atlas Fase 2)",
        preenche="Parceiro / MTI / CSV",
        visualiza="MTI · Parceiro",
    ),
    # ═══ PRODUTO ═══
    "form-patlasv4-proto-cat-produto-catalogo": D(
        "Catálogo ao qual o item pertence — define contexto comercial completo.",
        "Selecione primeiro. Herda Parceria, Solução, Versão, Tipo de oferta e métricas.",
        "Referência Catálogo. CSV: coluna Catálogo antes do item.",
        "RN-PROD-01: Obrigatório. Produto só existe vinculado a catálogo.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro / MTI",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-parceria": D(
        "Parceria comercial do item (herdada do catálogo).",
        "Somente leitura. Vazio quando produto 100% MTI sem parceria.",
        "Herdado do Catálogo.",
        "RN-PROD-01b: Opcional — produto MTI exclusivo pode ficar sem parceria (31/08).",
        classe="Produto (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-produto-versao-catalogo": D(
        "Versão do catálogo em que o item será gravado.",
        "Somente consulta. Acompanha incrementos do catálogo.",
        "Herdado do Catálogo.",
        "RN-CAT-07: Nasce com versão corrente do catálogo.",
        classe="Produto (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-produto-solucao": D(
        "Solução comercial do item.",
        "Somente leitura — vem do Catálogo.",
        "Herdado.",
        "Equivalente planilha Classe Solução (referência, não recadastro).",
        classe="Produto (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-produto-vertical": D(
        "Vertical de TI do acordo.",
        "Somente consulta.",
        "Herdado da Parceria via Catálogo.",
        "RN-PROD-05: Cadastro na Parceria; não editar no Produto.",
        classe="Produto (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta RO)",
    ),
    "form-patlasv4-proto-cat-produto-tipo-oferta": D(
        "Modalidade Universal ou Individualizado do item.",
        "Somente leitura — herdado do Catálogo (toggles Universal/Individualizado).",
        "Catálogo: É universal / É individualizado → derivado pelo sistema.",
        "RN-PROD-01: Substitui UNIVERSAL N3 / INDIVIDUALIZADO N1. Universal exibe moeda universal; Individualizado não.",
        classe="Produto (Atlas Fase 2)",
        preenche="Sistema (herança)",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-produto-codigo-atlas": D(
        "Identificador interno Atlas do item.",
        "Gerado ao salvar. Não importar da planilha.",
        "Sistema: Sigla Parceria + sequencial.",
        "RN-PROD-08: 4–6 chars. Único. ≠ Código Protheus ≠ Código parceira.",
        classe="Produto (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-produto-identificador": D(
        "Nome do item de catálogo (termo validado 31/08) — o “prato” comercial.",
        "Parceiro preenche planilha col. C (Produto Catálogo Comercial). Distinto do nome da Solução.",
        "Cadastro Atlas / CSV. Não importa descrição ERP.",
        "Obrigatório. Não copiar automaticamente para Part Number. ≠ Objeto de comercialização.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro (col. C)",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-nome-comercializacao": D(
        "Nome científico / texto de comercialização técnica do item.",
        "MTI define; parceiro pode complementar. Não montar automaticamente a partir de outros campos.",
        "Cadastro Atlas.",
        "31/08: MTI define; não auto-gerar. Relacionado a métricas lic./serv. Planilha: Nome Científico.",
        classe="Produto (Atlas Fase 2)",
        preenche="MTI / Parceiro (!#)",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-part-number": D(
        "SKU / Part Number do fabricante ou parceiro.",
        "Opcional. Informe código estável para integrações.",
        "Parceiro / planilha PART NUMBER.",
        "Não copiar automaticamente do nome do item.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-tipo": D(
        "Classifica o item como Licença ou Serviço.",
        "Selecione por item. Catálogo pode conter licença e serviço juntos.",
        "Parceiro seleciona no cadastro/CSV.",
        "RN-PROD-02: Somente Licença | Serviço. ≠ Tipo Protheus (SC/IT/SV/SW — DELETE). "
        "Serviço exibe complexidade/peso/qtde; Licença oculta.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-grupo": D(
        "Grupo comercial para filtros e organização.",
        "Selecione grupo da parceria (ex.: Análise e modelagem). ≠ grupo 32 Protheus.",
        "Referência Grupo comercial Atlas.",
        "Obrigatório. Planilha col. F / Grupo.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro / MTI",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-descricao": D(
        "Descrição detalhada de escopo e entrega do item.",
        "Opcional. Complementa nome e nome científico.",
        "Parceiro / MTI.",
        "Planilha Descrição Prod.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro / MTI",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-modelo-venda": D(
        "Modelo comercial (por licença, UST, perpétuo…).",
        "Selecione cadastro mestre MTI. Perpétuo trava cobrança em Única.",
        "Referência Modelo de Venda.",
        "RN-PROD-07 / RN-MV-03: Perpétuo → Tipo cobrança = Única.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro (seleção)",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-cobranca": D(
        "Recorrência de cobrança (mensal, anual, única…).",
        "Selecione conforme modelo de venda.",
        "Referência Tipo de Cobrança.",
        "RN-COB-03: Sob demanda = consumo OS (Fase 3), não tipo de cobrança.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro (seleção)",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-metrica": D(
        "Unidade de medida comercial do item (UST, HST, USN…).",
        "Escolha apenas entre métricas permitidas do catálogo.",
        "Referência Métrica; filtrada pelo Catálogo.",
        "RN-PROD-06: Métrica Comum = licenciamento OU serviço do item. Planilha col. I.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-valor-unitario": D(
        "Preço unitário exibido ao parceiro (não preço final pós-rateio).",
        "Informado ou calculado após custo (parceiro) × markup (MTI). Parceiro vê valor unitário.",
        "Calculado a partir de Dados de Parceria por Produto ou informado conforme regra.",
        "RN-PREC-01: Parceiro vê unitário e % nos próprios produtos. Não importa preço da planilha ERP.",
        classe="Produto (Atlas Fase 2)",
        preenche="Sistema / Parceiro (via DPP)",
        visualiza="MTI · Parceiro (unitário; não preço final rateado)",
    ),
    "form-patlasv4-proto-cat-produto-moeda-universal": D(
        "Valor da moeda universal para itens Universal.",
        "Exibido quando Tipo de oferta = Universal. Condicional catálogo universal.",
        "Cadastro Produto / herança catálogo.",
        "≠ Fator de conversão de consumo (FC = Fase 3). Planilha: Fator FC moeda universal.",
        classe="Produto (Atlas Fase 2)",
        preenche="MTI / Sistema",
        visualiza="MTI · Parceiro (condicional)",
    ),
    "form-patlasv4-proto-cat-produto-data-atualizacao-preco": D(
        "Data da última alteração de preço deste item.",
        "Atualizada por evento de reajuste ou revisão de custo/markup.",
        "Sistema ao registrar evento.",
        "Exibir em Produto e Catálogo. Planilha T2 Data Atualização Preço.",
        classe="Produto (Atlas Fase 2)",
        preenche="Sistema (evento)",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-produto-dados-parceria": D(
        "Vínculo com condições comerciais (custo, markup, %, período mínimo).",
        "Cadastre em Dados de Parceria por Produto — classe canônica RN-DP-01.",
        "Classe Dados de Parceria por Produto.",
        "Parceiro preenche custo + período mínimo. Markup = MTI (sigilo). % calculados. CSV sem markup/% MTI.",
        classe="Produto (Atlas Fase 2)",
        preenche="Ver classe DPP",
        visualiza="MTI · Parceiro (parcial — RN-DP-03)",
    ),
    "form-patlasv4-proto-cat-produto-complexidade": D(
        "Faixa de complexidade do serviço.",
        "Selecione entre faixas da versão do catálogo quando Variação = Por Complexidade.",
        "Opções = faixas cadastradas no Catálogo.",
        "RN-PROD-03: Só Serviço + catálogo com variação por complexidade.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-coeficiente-complexidade": D(
        "Multiplicador numérico da faixa de complexidade.",
        "Somente leitura — preenchido ao escolher complexidade.",
        "Derivado da faixa no Catálogo.",
        "Automático.",
        classe="Produto (Atlas Fase 2)",
        preenche="Sistema",
        visualiza="MTI · Parceiro (consulta)",
    ),
    "form-patlasv4-proto-cat-produto-peso": D(
        "Peso do serviço quando catálogo varia por peso.",
        "Informe valor numérico para itens Serviço.",
        "Parceiro.",
        "RN-PROD-04: Só Serviço + Variação = Por Peso.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-qtde-metrica": D(
        "Quantidade padrão da métrica por execução.",
        "Preencha quando métrica exige quantidade.",
        "Parceiro.",
        "Só Serviço + flag exige quantidade.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-consumo-os": D(
        "Indica consumo via ordem de serviço (créditos).",
        "Marque para itens Universal com consumo sob demanda.",
        "Parceiro / MTI.",
        "Comportamento efetivo Fase 3. ≠ Tipo de cobrança.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro / MTI",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-cod-siag-item": D(
        "Código SIAG do item (N1).",
        "Importável na carga. Admin edita pós-importação.",
        "Importação ERP (somente códigos).",
        "Parceiro não visualiza. Obrigatório no contrato N1.",
        classe="Produto (Atlas Fase 2)",
        preenche="Importação / MTI",
        visualiza="MTI · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-produto-cod-protheus-item": D(
        "Código Protheus/Infocenter do item (N1).",
        "Importado na carga de códigos.",
        "Importação ERP.",
        "Parceiro não visualiza. ≠ Código Atlas.",
        classe="Produto (Atlas Fase 2)",
        preenche="Importação / MTI",
        visualiza="MTI · Parceiro (não exibe)",
    ),
    "form-patlasv4-proto-cat-produto-status": D(
        "Estágio do item no workflow (alinhado ao catálogo).",
        "Acompanha envio/análise/homologação/publicação.",
        "Workflow.",
        "Após envio, parceiro em RO (RN-MTI-01).",
        classe="Produto (Atlas Fase 2)",
        preenche="Workflow",
        visualiza="MTI · Parceiro",
    ),
    "form-patlasv4-proto-cat-produto-ativo": D(
        "Disponibilidade do item para novos vínculos.",
        "Desligue para inativar sem apagar histórico.",
        "Parceiro / MTI.",
        "Independe do Status de workflow.",
        classe="Produto (Atlas Fase 2)",
        preenche="Parceiro / MTI",
        visualiza="MTI · Parceiro",
    ),
}


def find_form(forms: list, fid: str) -> dict:
    for f in forms:
        if f.get("id") == fid:
            return f
    raise KeyError(fid)


def upsert_field(form: dict, field: dict, after_id: str | None = None) -> None:
    fields = form["fields"]
    idx = next((i for i, f in enumerate(fields) if f.get("id") == field["id"]), -1)
    if idx >= 0:
        fields[idx] = {**fields[idx], **field}
        return
    if after_id:
        ai = next((i for i, f in enumerate(fields) if f.get("id") == after_id), -1)
        if ai >= 0:
            fields.insert(ai + 1, field)
            return
    del_idx = next(
        (i for i, f in enumerate(fields) if str(f.get("label", "")).startswith("DELETE")),
        len(fields),
    )
    fields.insert(del_idx, field)


def patch_parceria(form: dict) -> None:
    form["metadata"] = (
        "FINAL F2 2026-08-31 · Reunião ATLAS Catálogo. RN-PAR-01..06. "
        "Import ERP = códigos. Índice reajuste. Salvar → Catálogo Rascunho."
    )
    # Seção renomeada
    for sec in form.get("sections", []):
        if sec.get("id") == "sec-mth7bkik-h2izhhi":
            sec["title"] = "Itens do catálogo da parceria"

    upsert_field(
        form,
        {
            "id": "form-patlasv4-proto-cat-parceria-indice-reajuste",
            "label": "#Índice de reajuste",
            "type": "textOptions",
            "size": "medium",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "sectionId": "sec-cat-parc-visao",
            "options": ["IPCA", "IGPM", "INPC", "CPI"],
            "spec": SPECS["form-patlasv4-proto-cat-parceria-indice-reajuste"],
        },
        "form-patlasv4-proto-cat-parceria-vertical",
    )

    upsert_field(
        form,
        {
            "id": "form-patlasv4-proto-cat-parceria-alerta-import",
            "label": "Regra importação",
            "type": "alert",
            "size": "large",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "highlight",
            "sectionId": "sec-cat-parc-visao",
            "alertVariant": "info",
            "alertTitle": "RN-IMP-01: Dados nascem no Atlas",
            "alertMessage": (
                "Importação ERP = somente códigos (parceira, N1/N2/N3). "
                "Dados comerciais cadastram-se no Atlas. Pós-importação: editável somente por administrador."
            ),
            "spec": "Regra transversal validada 31/08/2026 — não é campo persistido.",
        },
        "form-patlasv4-proto-cat-parceria-identificador",
    )

    for fld in form["fields"]:
        fid = fld.get("id", "")
        if fid in SPECS:
            fld["spec"] = SPECS[fid]
        if fid == "form-patlasv4-proto-cat-parceria-sigla":
            fld["label"] = "#Sigla (prefixo Código Atlas)"
            fld["hidden"] = False
            fld["required"] = True
        if fid == "form-patlasv4-proto-cat-parceria-codigo-parceira":
            fld["label"] = "?Código da parceira"
            fld["hidden"] = False
            fld["readOnly"] = True
            fld["required"] = False
        if fid == "form-patlasv4-proto-cat-parceria-produtos":
            fld["label"] = "Itens do catálogo da parceria"
        if fid == "form-patlasv4-proto-cat-parceria-versao":
            fld["label"] = "DELETE Versão (pertence ao Catálogo)"
            fld["hidden"] = True
            fld["sectionId"] = "sec-cat-parc-delete"


def patch_catalogo(form: dict) -> None:
    form["metadata"] = (
        "FINAL F2 2026-08-31 · Reunião ATLAS Catálogo. RN-CAT-01..08. "
        "Eixo Universal/Individualizado (não serviço/licenciamento). Tipo Licença/Serviço = por Produto."
    )

    upsert_field(
        form,
        {
            "id": "form-patlasv4-proto-cat-catalogo-objeto-comercializacao",
            "label": "#Objeto de comercialização",
            "type": "text",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "highlight",
            "sectionId": "sec-cat-fluxo",
            "textLong": True,
            "spec": SPECS["form-patlasv4-proto-cat-catalogo-objeto-comercializacao"],
        },
        "form-patlasv4-proto-cat-catalogo-solucao",
    )

    upsert_field(
        form,
        {
            "id": "form-patlasv4-proto-cat-catalogo-toggle-individualizado",
            "label": "#É catálogo individualizado",
            "type": "boolean",
            "size": "small",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "sectionId": "sec-cat-fluxo",
            "spec": SPECS["form-patlasv4-proto-cat-catalogo-toggle-individualizado"],
        },
        "form-patlasv4-proto-cat-catalogo-toggle-universal",
    )

    upsert_field(
        form,
        {
            "id": "form-patlasv4-proto-cat-catalogo-data-atualizacao-preco",
            "label": "#Data atualização preço",
            "type": "date",
            "size": "medium",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "sectionId": "sec-cat-fluxo",
            "spec": SPECS["form-patlasv4-proto-cat-catalogo-data-atualizacao-preco"],
        },
        "form-patlasv4-proto-cat-catalogo-versao",
    )

    upsert_field(
        form,
        {
            "id": "form-patlasv4-proto-cat-catalogo-alerta-oferta",
            "label": "Eixo de oferta",
            "type": "alert",
            "size": "large",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "highlight",
            "sectionId": "sec-cat-fluxo",
            "alertVariant": "info",
            "alertTitle": "Universal vs Individualizado (31/08)",
            "alertMessage": (
                "Eixo principal do catálogo: Universal e/ou Individualizado. "
                "Licença e Serviço são definidos por item (Produto.Tipo), não por toggle do catálogo."
            ),
            "spec": "RN-CAT-03 — decisão reunião 31/08.",
        },
        "form-patlasv4-proto-cat-catalogo-toggle-universal",
    )

    # Deprecar toggles serviço/licenciamento
    for fid, new_label in [
        ("form-patlasv4-proto-cat-catalogo-toggle-servicos", "DELETE É catálogo de serviços (legado 17/08)"),
        ("form-patlasv4-proto-cat-catalogo-toggle-licenca", "DELETE É catálogo de licenciamento (legado 17/08)"),
    ]:
        f = next((x for x in form["fields"] if x.get("id") == fid), None)
        if f:
            f["label"] = new_label
            f["hidden"] = True
            f["sectionId"] = "sec-cat-catalogo-delete"
            f["spec"] = (
                "**Classe:** Catálogo — **FORA DO MODELO 31/08**\n"
                "**Regras:** Substituído por toggles Universal/Individualizado + Produto.Tipo (Licença/Serviço).\n"
                "**Ação:** Oculto; mantido para rastreabilidade."
            )

    # Variação: mover para sec-cat-variacao se existir
    var_sec = next((s for s in form.get("sections", []) if s.get("id") == "sec-cat-variacao"), None)
    if var_sec:
        vf = next((x for x in form["fields"] if x.get("id") == "form-patlasv4-proto-cat-catalogo-variacao"), None)
        if vf:
            vf["hidden"] = False
            vf["sectionId"] = "sec-cat-variacao"

    # Visibility rules: individualizado + universal; variacao sem depender de toggle servicos
    rules = [r for r in form.get("fieldVisibilityRules", []) if r.get("id") != "rule-cat-servicos-exige-variacao"]
    rules.append(
        {
            "id": "rule-cat-individualizado-tipo-oferta",
            "operator": "eq",
            "sourceFieldId": "form-patlasv4-proto-cat-catalogo-toggle-individualizado",
            "action": "show",
            "targetFieldIds": [],
            "expectedBoolean": True,
            "sourceKind": "boolean",
        }
    )
    form["fieldVisibilityRules"] = rules

    for fld in form["fields"]:
        fid = fld.get("id", "")
        if fid in SPECS:
            fld["spec"] = SPECS[fid]

    # Presets: default individualizado true when not universal-only
    for p in form.get("exampleValuePresets", []):
        fv = p.get("fieldValues", {})
        if fv.get("form-patlasv4-proto-cat-catalogo-toggle-universal") is False:
            fv["form-patlasv4-proto-cat-catalogo-toggle-individualizado"] = True
        elif fv.get("form-patlasv4-proto-cat-catalogo-toggle-universal") is True:
            fv.setdefault("form-patlasv4-proto-cat-catalogo-toggle-individualizado", True)


def patch_produto(form: dict) -> None:
    form["metadata"] = (
        "FINAL F2 2026-08-31 · Reunião ATLAS Catálogo. RN-PROD-01..12 + RN-DP + RN-IMP. "
        "Item de catálogo · import só códigos · parceria opcional MTI."
    )

    upsert_field(
        form,
        {
            "id": "form-patlasv4-proto-cat-produto-data-atualizacao-preco",
            "label": "#Data atualização preço",
            "type": "date",
            "size": "medium",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "sectionId": "sec-prod-prec",
            "spec": SPECS["form-patlasv4-proto-cat-produto-data-atualizacao-preco"],
        },
        "form-patlasv4-proto-cat-produto-valor-unitario",
    )

    for fld in form["fields"]:
        fid = fld.get("id", "")
        if fid in SPECS:
            fld["spec"] = SPECS[fid]
        if fid == "form-patlasv4-proto-cat-produto-identificador":
            fld["label"] = "!Nome do item de catálogo"
        if fid == "form-patlasv4-proto-cat-produto-nome-comercializacao":
            fld["label"] = "!#Nome científico / comercialização"
        if fid == "form-patlasv4-proto-cat-produto-parceria":
            fld["required"] = False
        if fid == "form-patlasv4-proto-cat-produto-delete-data-preco":
            fld["label"] = "DELETE Data Atualização Preço (movido para campo ativo)"
            fld["hidden"] = True
        if fid == "form-patlasv4-proto-cat-produto-delete-indice-reajuste":
            fld["spec"] = (
                "**FORA F2 no Produto.** Índice de reajuste = classe Parceria (sigla IPCA/IGPM…). "
                "Cálculo numérico = evento pós-aprovação."
            )


def apply_specs_fallback(form: dict, classe: str) -> None:
    """Campos ativos sem spec no dict recebem template mínimo."""
    for fld in form.get("fields", []):
        if fld.get("type") == "alert":
            continue
        if str(fld.get("label", "")).startswith("DELETE"):
            continue
        if fld.get("hidden"):
            continue
        fid = fld.get("id", "")
        if fid in SPECS:
            continue
        label = fld.get("label", fid)
        fld["spec"] = D(
            f"Campo `{label}` da classe {classe}.",
            "Consulte regras de negócio RN associadas ao formulário.",
            "Cadastro Atlas Fase 2.",
            "Seguir legenda do label e governança portal MTI ↔ parceiro.",
            classe=f"{classe} (Atlas Fase 2)",
        )


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))

    parc = find_form(forms, "form-patlasv4-proto-cat-parceria")
    cat = find_form(forms, "form-patlasv4-proto-cat-catalogo")
    prod = find_form(forms, "form-patlasv4-proto-cat-produto")

    patch_parceria(parc)
    patch_catalogo(cat)
    patch_produto(prod)

    apply_specs_fallback(parc, "Parceria")
    apply_specs_fallback(cat, "Catálogo")
    apply_specs_fallback(prod, "Produto")

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for f, name in [(parc, "Parceria"), (cat, "Catálogo"), (prod, "Produto")]:
        active = [
            x
            for x in f["fields"]
            if not str(x.get("label", "")).startswith("DELETE")
            and x.get("type") != "alert"
            and not x.get("hidden")
        ]
        with_usar = sum(1 for x in active if "Como usar" in x.get("spec", ""))
        print(f"{name}: {len(active)} campos ativos · {with_usar} com 'Como usar'")

    print(f"\nOK: {FORMS}")


if __name__ == "__main__":
    main()
