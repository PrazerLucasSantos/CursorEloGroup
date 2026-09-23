# -*- coding: utf-8 -*-
"""Generate docs/campos-atlas-dados.js from consolidated Atlas field sources."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "campos-atlas-dados.js"


def field(
    id_,
    classe,
    grupo,
    nome,
    tipo,
    opcoes="",
    regra="",
    preenche="",
    visualiza="",
    protheus="Não",
    status="Confirmado",
):
    return {
        "id": id_,
        "classe": classe,
        "grupo": grupo,
        "nome": nome,
        "tipo": tipo,
        "opcoes": opcoes,
        "regra": regra,
        "preenche": preenche,
        "visualiza": visualiza,
        "protheus": protheus,
        "status": status,
        "marcado": False,
    }


rows = []

# ── Parceria (17 campos explícitos + Status planilha = 18) ──────────────────
P = "Parceria"
rows += [
    field("p1", P, "Parceria — Dados gerais", "Identificador", "Texto", "", "Nome comercial da parceria. Obrigatório.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("p2", P, "Parceria — Dados gerais", "Código da Parceira", "Texto", "", "Código interno da parceria. Pendente de validação formal.", "MTI", "MTI (edição) · Parceiro (consulta)", "Não", "Pendente"),
    field("p3", P, "Parceria — Dados gerais", "Descrição", "Texto / HTML", "", "Descrição do acordo comercial. Opcional.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("p4", P, "Parceria — Dados gerais", "Vertical de serviço de TI", "Referência", "Dados e IA · Automação e Processos · Cibersegurança · Nuvem · Conectividade · Identidade e Governo (+ cadastros MTI)", "Obrigatório. Vinculada à parceria (não à organização).", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("p5", P, "Parceria — Dados gerais", "Parceiros", "Referência (N) → Organização", "Organizações cadastradas", "Uma ou mais organizações vinculadas. Obrigatório ao menos uma.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("p6", P, "Parceria — Relacionamentos", "Catálogo da parceria", "Referência → Catálogo", "—", "Gerado automaticamente ao salvar a parceria (status Rascunho).", "Sistema", "MTI · Parceiro (consulta)"),
    field("p7", P, "Parceria — Relacionamentos", "Soluções", "Referência (N) → Solução", "Soluções vinculadas", "Relacionamento com soluções criadas após a parceria. Somente leitura.", "MTI / Sistema", "MTI · Parceiro (consulta)"),
    field("p8", P, "Parceria — Visualização consolidada", "Soluções (view)", "View embutida", "—", "Accordion na tela da Parceria: exibe informações da solução e tabela de produtos.", "Sistema", "MTI · Parceiro (consulta e edição de produtos no portal)"),
    field("p9", P, "Parceria — Workflow", "Status", "Enum", "Rascunho · Aguardando Análise - MTI · Ajuste Solicitado · Reprovado · Homologado · Ativo · Paralisado", "Fluxo de aprovação: envio pelo parceiro → análise MTI → ajuste/reprovação/homologação. Durante análise MTI a edição pelo parceiro é bloqueada.", "MTI (transições) · Parceiro (envio)", "MTI · Parceiro (consulta)"),
    field("p10", P, "Parceria — Controle", "Ativo?", "Booleano", "Sim · Não", "Indica disponibilidade para novos vínculos. Não substitui o Status de workflow.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("p11", P, "Parceria — Complementares", "Observações", "Texto longo", "", "Informações complementares. Opcional.", "MTI", "MTI (edição) · Parceiro (não exibe)"),
    field("p12", P, "Parceria — Versionamento", "Versão", "Texto / Número", "", "Controle de versão do registro. Pendente de alinhamento: nas reuniões de validação o versionamento estava associado ao Catálogo.", "Sistema", "MTI (consulta) · Parceiro (não exibe)", "Não", "Conflito"),
    field("p13", P, "Parceria — Versionamento", "Versão anterior", "Texto / Número", "", "Versão imediatamente anterior. Mesma ressalva de escopo (Parceria vs. Catálogo).", "Sistema", "MTI (consulta) · Parceiro (não exibe)", "Não", "Conflito"),
    field("p14", P, "Parceria — Vigência", "Início da vigência", "Data", "", "Data de início de vigência. Pendente de validação formal de escopo e exibição.", "MTI / Sistema", "MTI (consulta) · Parceiro (não exibe)", "Não", "Pendente"),
    field("p15", P, "Parceria — Vigência", "Fim da vigência", "Data", "", "Data de término de vigência. Campo da implementação — pendente de validação formal.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Não", "Pendente"),
    field("p16", P, "Parceria — Homologação DIREX", "Data homologação DIREX", "Data", "", "Data da homologação pela DIREX. Campo legado/oculto no protótipo mínimo.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Não", "Pendente"),
    field("p17", P, "Parceria — Homologação DIREX", "Responsável homologação", "Texto", "", "Responsável pela homologação DIREX. Campo legado/oculto no protótipo mínimo.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Não", "Pendente"),
    field("p18", P, "Parceria — Planilha", "Status Parceria (planilha)", "Enum", "Ativa · Concluída · Homologada · Paralisada · Homologada (DIREX) · Aguardando homologação DIREX", "Status da parceria conforme coluna da planilha de extração. Distinto do Status de workflow do portal.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Não", "Conflito"),
]

# ── Solução (11) ────────────────────────────────────────────────────────────
S = "Solução"
rows += [
    field("s1", S, "Solução — Informações", "Nome", "Texto", "", "Nome comercial da solução vinculada. Único na parceria.", "MTI", "MTI · Parceiro (consulta)"),
    field("s2", S, "Solução — Informações", "Código da solução", "Texto", "", "Código interno da solução. Campo da implementação — ausente no protótipo de referência.", "MTI", "MTI · Parceiro (consulta)", "Não", "Pendente"),
    field("s3", S, "Solução — Informações", "Parceria", "Referência → Parceria", "—", "Referência à parceria pai. Preenchimento automático. Somente leitura.", "Sistema", "MTI · Parceiro (consulta)"),
    field("s4", S, "Solução — Informações", "Catálogo da solução", "Referência → Catálogo", "—", "Gerado automaticamente ao salvar a solução.", "Sistema", "MTI · Parceiro (consulta)"),
    field("s5", S, "Solução — Informações", "Descrição", "Texto", "", "Descrição da solução. Opcional.", "MTI", "MTI · Parceiro (consulta)"),
    field("s6", S, "Solução — Informações", "Documentos de apoio", "Arquivo", "PDF · DOC", "Documentos de suporte. Opcional. Sign-off pendente.", "MTI", "MTI · Parceiro (consulta)", "Não", "Pendente"),
    field("s7", S, "Solução — Fabricante", "Fabricante — nome", "Texto", "", "Nome do fabricante da solução. Sign-off pendente (oculto no protótipo mínimo).", "MTI", "MTI · Parceiro (consulta)", "Não", "Pendente"),
    field("s8", S, "Solução — Fabricante", "Fabricante — contato", "Texto", "", "Contato do fabricante. Sign-off pendente (oculto no protótipo mínimo).", "MTI", "MTI · Parceiro (consulta)", "Não", "Pendente"),
    field("s9", S, "Solução — Complementares", "Observações", "Texto longo", "", "Informações complementares da solução. Opcional.", "MTI", "MTI (edição) · Parceiro (não exibe)"),
    field("s10", S, "Solução — Controle", "Ativo?", "Booleano", "Sim · Não", "Indica se a solução está ativa para novos vínculos.", "MTI", "MTI · Parceiro (consulta)"),
    field("s11", S, "Solução — Visualização consolidada", "Produtos da solução (view)", "View embutida", "—", "Consulta reversa dos produtos do catálogo da solução. Exibido na tela da Parceria.", "Sistema", "MTI · Parceiro (consulta e edição de produtos no portal)"),
]

# ── Catálogo (24 campos da lista consolidada) ────────────────────────────────
C = "Catálogo"
rows += [
    field("c1", C, "Catálogo — Identificação", "Nome do catálogo", "Texto", "", "Nome comercial da família do catálogo. Obrigatório.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c2", C, "Catálogo — Identificação", "Parceria", "Referência → Parceria", "—", "Somente parceria aprovada/habilitada. Selecionar antes dos demais vínculos.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c3", C, "Catálogo — Identificação", "Solução", "Referência → Solução", "—", "Filtrada pela Parceria. Produtos herdam este contexto.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c4", C, "Catálogo — Identificação", "Descrição", "Texto", "", "Escopo do catálogo. Opcional.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c5", C, "Catálogo — Identificação", "Versão", "Texto", "", "Ex.: 9.4 — único na família. Obrigatório para publicar.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c6", C, "Catálogo — Identificação", "Versão anterior", "Texto", "", "Preenchida ao criar nova versão; vazia na primeira.", "Sistema", "MTI (consulta) · Parceiro (consulta)"),
    field("c7", C, "Catálogo — Identificação", "Início de vigência", "Data", "", "Obrigatório para publicar.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c8", C, "Catálogo — Identificação", "Fim de vigência", "Data", "", "Preenchido quando a versão for substituída/encerrada.", "Sistema", "MTI (consulta) · Parceiro (consulta)"),
    field("c9", C, "Catálogo — Identificação", "Status do catálogo", "Enum", "Rascunho · Em análise · Ajuste solicitado · Reprovado · Aprovado · Publicado · Substituído", "Controlado pelo workflow; nunca digitado livremente.", "Sistema / MTI (transições)", "MTI · Parceiro (consulta)"),
    field("c10", C, "Catálogo — Propriedades", "É catálogo universal", "Booleano", "Sim · Não", "Padrão Não. Controla elegibilidade a Catálogo Universal (N3). Não confundir com Tipo de oferta do Produto.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c11", C, "Catálogo — Propriedades", "É catálogo de serviços", "Booleano", "Sim · Não", "Padrão Não. Pode ser Sim junto com universal (ex.: UST/HST).", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c12", C, "Catálogo — Propriedades", "É catálogo de licenciamento", "Booleano", "Sim · Não", "Padrão Não. Típico para métrica USN.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c13", C, "Catálogo — Métricas", "Métricas permitidas", "Referência embutida (N)", "USN · UST · HST · Unitário · Peça · Licenciamento", "Coleção CatalogoMetrica[]. Sem valor unitário genérico fora desta relação.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c14", C, "Catálogo — Métricas", "Valor unitário da métrica", "Moeda", "—", "Valor da métrica no Catálogo (> 0 para publicar). Não é preço do Produto. Composição da tabela embutida.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c15", C, "Catálogo — Responsáveis", "FOCAL Vendas", "Referência → Pessoa", "—", "Focal de vendas. Pertence ao Catálogo; não repetir em Produto.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c16", C, "Catálogo — Responsáveis", "FOCAL Pós Vendas", "Referência → Pessoa", "—", "Focal de pós-vendas. Pertence ao Catálogo; não repetir em Produto.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c17", C, "Catálogo — Responsáveis", "Unidade DTIC", "Referência → Unidade organizacional", "—", "Unidade MTI responsável. Obrigatória para publicar (pode vazia no Rascunho).", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c18", C, "Catálogo — Códigos N2", "Código N2 — SIAG", "Texto", "—", "Código SIAG do catálogo (nível N2). Manual/planilha nesta fase. Opcional F2; obrigatório no contrato.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Exibição (manual)"),
    field("c19", C, "Catálogo — Códigos N2", "Código N2 — Protheus", "Texto", "—", "Código Protheus/Infocenter do catálogo (nível N2). Manual/planilha nesta fase.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Exibição (manual)"),
    field("c20", C, "Catálogo — Códigos N3", "Código N3 — SIAG", "Texto", "—", "Código SIAG do Catálogo Universal (N3). Somente se É catálogo universal = Sim.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Exibição (manual)", "Pendente"),
    field("c21", C, "Catálogo — Códigos N3", "Código N3 — Protheus", "Texto", "—", "Código Protheus do Catálogo Universal (N3). Somente se É catálogo universal = Sim.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Exibição (manual)", "Pendente"),
    field("c22", C, "Catálogo — Complementares", "Observações", "Texto longo", "", "Nota complementar; não substitui campos estruturados.", "MTI", "MTI (edição) · Parceiro (não exibe)"),
    field("c23", C, "Catálogo — Controle", "Ativo?", "Booleano", "Sim · Não", "Indica se o catálogo está ativo.", "MTI", "MTI (edição) · Parceiro (consulta)"),
    field("c24", C, "Catálogo — Visualização consolidada", "Produtos do catálogo (view)", "View embutida", "—", "Lista de produtos vinculados ao catálogo. Cadastro/edição manual ou via CSV.", "Sistema", "MTI · Parceiro (consulta e edição de produtos no portal)"),
]

# ── Produto (~55 campos) ────────────────────────────────────────────────────
PR = "Produto"
rows += [
    # Contexto
    field("pr1", PR, "Produto — Contexto", "Catálogo", "Referência → Catálogo", "—", "Primeiro campo do cadastro. Controla Parceria, Solução, métricas e estrutura condicional.", "Parceiro / MTI", "MTI · Parceiro (edição no portal)"),
    field("pr2", PR, "Produto — Contexto", "Parceria", "Referência → Parceria", "—", "Obtida do Catálogo selecionado. Herdada. Somente leitura.", "Sistema", "MTI · Parceiro (consulta)"),
    field("pr3", PR, "Produto — Contexto", "Solução", "Referência → Solução", "—", "Obtida do Catálogo selecionado. Herdada. Somente leitura.", "Sistema", "MTI · Parceiro (consulta)"),
    field("pr4", PR, "Produto — Contexto", "Versão do catálogo", "Texto", "—", "Versão do Catálogo em que o Produto será gravado. Herdada.", "Sistema", "MTI · Parceiro (consulta)"),
    field("pr5", PR, "Produto — Contexto (flags)", "Catálogo usa complexidade?", "Booleano", "Sim · Não", "Flag técnica herdada do Catálogo (estrutura de variação). Controla exibição de Complexidade.", "Sistema", "Oculto ao usuário"),
    field("pr6", PR, "Produto — Contexto (flags)", "Catálogo usa peso?", "Booleano", "Sim · Não", "Flag técnica herdada do Catálogo. Controla exibição de Peso.", "Sistema", "Oculto ao usuário"),
    field("pr7", PR, "Produto — Contexto (flags)", "Métrica exige quantidade por execução?", "Booleano", "Sim · Não", "Herdado da configuração Catálogo/Métrica. Controla Quantidade da métrica por execução.", "Sistema", "Oculto ao usuário"),
    # Identificação
    field("pr8", PR, "Produto — Identificação", "Código Atlas", "Texto", "—", "Alfanumérico 4–6 caracteres com prefixo da parceria. Gerado pelo sistema.", "Sistema", "MTI (consulta) · Parceiro (consulta)"),
    field("pr9", PR, "Produto — Identificação", "Nome do produto", "Texto", "—", "Nome comercial do produto. Obrigatório.", "Parceiro", "MTI · Parceiro (edição no portal)"),
    field("pr10", PR, "Produto — Identificação", "Nome científico / comercialização", "Texto", "—", "Nome de comercialização (MTI + parceiro + descrição). Equivale à Descrição Produto na planilha.", "Parceiro / MTI", "MTI · Parceiro (edição no portal)"),
    field("pr11", PR, "Produto — Identificação", "Part Number (SKU)", "Texto", "—", "Identificador SKU do produto. Opcional. Não copiar automaticamente do Nome.", "Parceiro", "MTI · Parceiro (edição no portal)"),
    field("pr12", PR, "Produto — Identificação", "Tipo de produto", "Enum", "Licença · Serviço", "Define comportamento do cadastro (ex.: exibição de campos de serviço).", "Parceiro", "MTI · Parceiro (edição no portal)"),
    field("pr13", PR, "Produto — Identificação", "Categoria de serviços", "Referência → Categoria", "Treinamento e Capacitação · Consultoria em Processos · Soluções SaaS (+ cadastros MTI)", "Exibir quando Tipo de produto = Serviço. Separação vs Grupo ainda sob validação.", "Parceiro / MTI", "MTI · Parceiro (edição no portal)", "Não", "Pendente"),
    field("pr14", PR, "Produto — Identificação", "Descrição do produto", "Texto", "—", "Escopo, entrega e resultado do produto. Opcional.", "Parceiro / MTI", "MTI · Parceiro (edição no portal)"),
    # Classificação comercial
    field("pr15", PR, "Produto — Classificação comercial", "Tipo de oferta", "Enum", "Universal · Individualizado", "Herdado do Catálogo. Somente leitura no produto. Não confundir com É catálogo universal.", "MTI (no Catálogo)", "MTI · Parceiro (consulta)"),
    field("pr16", PR, "Produto — Classificação comercial", "Grupo", "Referência → Grupo", "Grupos da parceria", "Obrigatório. Filtrado pela parceria.", "Parceiro / MTI", "MTI · Parceiro (seleção no portal)"),
    field("pr17", PR, "Produto — Classificação comercial", "Modelo de venda", "Referência → Modelo de Venda", "Por licença · Por serviço · Pacote · Perpétuo · UST (+ cadastros MTI)", "Cadastro mestre MTI. Perpétuo → cobrança Única.", "Parceiro (seleção)", "MTI · Parceiro (edição no portal)"),
    field("pr18", PR, "Produto — Classificação comercial", "Tipo de cobrança", "Referência → Tipo de Cobrança", "Mensal · Anual · Subscrição · Conforme homologação · Única · Unitário (+ cadastros MTI)", "Cadastro mestre MTI. Sob Demanda não é tipo de cobrança (Fase 3).", "Parceiro (seleção)", "MTI · Parceiro (edição no portal)"),
    field("pr19", PR, "Produto — Classificação comercial", "Métrica", "Referência → Métrica", "UST · USN · HST · Unitário · Peça · Licenciamento (+ cadastros MTI)", "Cadastro mestre MTI. Filtrar pelas métricas do Catálogo.", "Parceiro (seleção)", "MTI · Parceiro (edição no portal)"),
    field("pr20", PR, "Produto — Classificação comercial", "Vertical de serviço", "Referência → Vertical", "Dados e IA · Automação · Cibersegurança · Nuvem · Conectividade · Identidade e governo", "Aplicável a produtos tipo Serviço. Na planilha coluna Vertical Atuação.", "Parceiro / MTI", "MTI · Parceiro (edição no portal)", "Não", "Pendente"),
    # Precificação
    field("pr21", PR, "Produto — Precificação", "Valor unitário", "Moeda", "—", "Preço próprio do Produto (Licença ou Serviço). Calculado ou informado conforme regra comercial.", "Parceiro / Sistema", "MTI · Parceiro (consulta)"),
    field("pr22", PR, "Produto — Precificação", "Valor da moeda universal", "Moeda", "—", "Fator de conversão (FC) da planilha de licenciamento. Exibir se Tipo de oferta = Universal. Sem FC no cadastro N3.", "Sistema", "MTI · Parceiro (pendente de validação)", "Não", "Pendente"),
    field("pr23", PR, "Produto — Precificação", "Quantidade da métrica por execução", "Número", "—", "Só Serviço + Catálogo/Métrica exigir quantidade. Oculto para Licença.", "Parceiro", "MTI · Parceiro (edição no portal)"),
    field("pr24", PR, "Produto — Precificação", "Consumo por ordem de serviço?", "Booleano", "Sim · Não", "Representa consumo sob demanda / via OS (créditos). Não é Tipo de cobrança. Condicional Universal/Serviço.", "Parceiro / MTI", "MTI · Parceiro (edição no portal)", "Não", "Pendente"),
    # Condições comerciais da parceria
    field("pr25", PR, "Produto — Condições comerciais da parceria", "Custo", "Moeda", "—", "Custo informado pelo parceiro. Não vai no CSV do portal.", "Parceiro", "MTI · Parceiro (edição no portal)"),
    field("pr26", PR, "Produto — Condições comerciais da parceria", "Markup", "Moeda", "—", "Custo de mercado informado pela MTI. Não exibido ao parceiro (rótulo protótipo: Custo de mercado MTI).", "MTI", "MTI (edição) · Parceiro (não exibe)"),
    field("pr27", PR, "Produto — Condições comerciais da parceria", "% Parceiro", "Percentual", "—", "Distribuição do parceiro. Calculado a partir de custo e mercado. Fórmula pendente (P-01).", "Sistema", "MTI · Parceiro (consulta)"),
    field("pr28", PR, "Produto — Condições comerciais da parceria", "% MTI", "Percentual", "—", "Distribuição da MTI. Calculado; % parceiro + % MTI = 100. Uso interno MTI.", "Sistema", "MTI (consulta) · Parceiro (não exibe)"),
    field("pr29", PR, "Produto — Condições comerciais da parceria", "Período mínimo", "Enum", "12 · 24 · 36 · 48 · 60 meses", "Obrigatório. Informado pelo parceiro. Sem Perpétuo.", "Parceiro", "MTI · Parceiro (edição no portal)"),
    field("pr30", PR, "Produto — Condições comerciais da parceria", "Complexidade", "Enum", "Muito Baixa · Baixa · Média · Alta · Muito Alta", "Só Serviço + Catálogo por complexidade. Opções = faixas do Catálogo.", "Parceiro", "MTI · Parceiro (edição no portal)"),
    field("pr31", PR, "Produto — Condições comerciais da parceria", "Coeficiente de complexidade", "Número", "—", "Somente leitura. Preenchido pela faixa selecionada na versão do Catálogo.", "Sistema", "MTI · Parceiro (consulta)"),
    field("pr32", PR, "Produto — Condições comerciais da parceria", "Peso", "Número", "—", "Só Serviço + Catálogo por peso. Oculto para Licença ou catálogo sem peso.", "Parceiro", "MTI · Parceiro (edição no portal)"),
    # Códigos N1 / N2 / N3
    field("pr33", PR, "Produto — Códigos N1 (item)", "Código N1 — SIAG", "Texto", "—", "Código SIAG do item (nível N1). Manual/planilha nesta fase. Obrigatório no contrato.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Exibição (manual)"),
    field("pr34", PR, "Produto — Códigos N1 (item)", "Código N1 — Protheus", "Texto", "—", "Código Protheus/Infocenter do item (nível N1). Manual/planilha nesta fase.", "MTI / Sistema", "MTI (consulta) · Parceiro (não exibe)", "Exibição (importado)"),
    field("pr35", PR, "Produto — Códigos N2 (catálogo)", "Código N2 — SIAG", "Texto", "—", "Código SIAG do catálogo vinculado (N2). Herdado/espelhado do Catálogo.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Exibição (manual)"),
    field("pr36", PR, "Produto — Códigos N2 (catálogo)", "Código N2 — Protheus", "Texto", "—", "Código Protheus do catálogo vinculado (N2). Herdado/espelhado do Catálogo.", "MTI / Sistema", "MTI (consulta) · Parceiro (não exibe)", "Exibição (importado)"),
    field("pr37", PR, "Produto — Códigos N3 (universal)", "Código N3 — SIAG", "Texto", "—", "Código SIAG do Catálogo Universal (N3). Condicional oferta Universal.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Exibição (manual)", "Pendente"),
    field("pr38", PR, "Produto — Códigos N3 (universal)", "Código N3 — Protheus", "Texto", "—", "Código Protheus do Catálogo Universal (N3). Condicional oferta Universal.", "MTI / Sistema", "MTI (consulta) · Parceiro (não exibe)", "Exibição (importado)", "Pendente"),
    # Eventos
    field("pr39", PR, "Produto — Eventos", "Evento início/fim", "Data (par)", "—", "Marca início e fim de vigência do produto na versão do catálogo. Eventos configurados com cuidado (apostilamento/contrato).", "Sistema / MTI", "MTI (consulta) · Parceiro (não exibe)", "Não", "Pendente"),
    field("pr40", PR, "Produto — Eventos", "Última notificação do fluxo", "Texto", "—", "Espelho da última notificação do workflow de análise/publicação.", "Sistema", "MTI (consulta) · Parceiro (não exibe)"),
    field("pr41", PR, "Produto — Eventos", "Fator de Conversão (FC)", "Número", "—", "Consumo N3→N2 (até 6 casas). Quase sempre 1,00 na planilha. Fase 3.", "Sistema", "MTI (consulta) · Parceiro (não exibe)", "Não", "Pendente"),
    # Integração Protheus — exibição
    field("pr42", PR, "Produto — Integração Protheus — exibição", "Código SIAG", "Texto", "—", "Código CIAG/contratação. Exibição/back-office. Sinônimo de Código N1 — SIAG.", "Sistema", "MTI (consulta) · Parceiro (não exibe)", "Exibição (importado)", "Implementado Sydle"),
    field("pr43", PR, "Produto — Integração Protheus — exibição", "Código Protheus", "Texto", "—", "Código Infocenter/faturamento. Sinônimo de Código N1 — Protheus.", "Sistema", "MTI (consulta) · Parceiro (não exibe)", "Exibição (importado)", "Implementado Sydle"),
    field("pr44", PR, "Produto — Integração Protheus — exibição", "Grupo Protheus", "Texto", "Ex.: 32", "Importado do Protheus. Sem seleção. Uso em filtros e relatórios.", "Importado Protheus", "MTI (consulta) · Parceiro (não exibe)", "Exibição (importado)"),
    field("pr45", PR, "Produto — Integração Protheus — exibição", "Código do parceiro — Protheus", "Texto", "—", "Código do parceiro no ERP (ex.: INQ9D6 - FACIL MOVA).", "MTI (cadastro de organização)", "MTI · Parceiro (consulta)", "Exibição (importado)"),
    field("pr46", PR, "Produto — Integração Protheus — exibição", "Local padrão", "Texto", "Ex.: 01 · 02 - Produtos e Serviço", "Valor importado do Protheus. Divergência planilha (02) vs protótipo (01) — pendente.", "Importado Protheus", "MTI (consulta) · Parceiro (não exibe)", "Exibição (importado)", "Conflito"),
    field("pr47", PR, "Produto — Integração Protheus — exibição", "Tipo", "Texto", "SW - sistema de informação · SC · IT · SV", "Classificação técnica importada do Protheus. Distinto de Tipo de produto Atlas (Licença/Serviço).", "Importado Protheus", "MTI (consulta) · Parceiro (não exibe)", "Exibição (importado)"),
    field("pr48", PR, "Produto — Integração Protheus — exibição", "Unidade", "Texto", "ST/HST · licença · horas técnicas · UN · HT · US · HR · LI", "Unidade de medida importada do Protheus. No Atlas o equivalente comercial é Métrica.", "Importado Protheus", "MTI (consulta) · Parceiro (não exibe)", "Exibição (importado)"),
    field("pr49", PR, "Produto — Integração Protheus — exibição", "Tipo Protheus", "Enum", "SW · SC · IT · SV", "Mapeamento ERP. Campo novo a definir no Atlas.", "MTI", "MTI (consulta) · Parceiro (não exibe)", "Exibição (importado)", "Pendente"),
    # Integração Protheus — fiscal (fora Fase 2)
    field("pr50", PR, "Produto — Integração Protheus — fiscal", "Origem", "Texto", "Ex.: 0 - Nacional, exceto…", "Campo fiscal. Fora do escopo Atlas Fase 2. Cadastrado pela contabilidade no ERP.", "Contabilidade (Protheus)", "Contabilidade · MTI (consulta)", "Não entra Fase 2"),
    field("pr51", PR, "Produto — Integração Protheus — fiscal", "Grupo tributário", "Texto", "Ex.: 001 - Órgão Público em MT", "Campo fiscal. Fora do escopo Atlas Fase 2.", "Contabilidade (Protheus)", "Contabilidade · MTI (consulta)", "Não entra Fase 2"),
    field("pr52", PR, "Produto — Integração Protheus — fiscal", "Retém IR (Imposto de Renda)", "Booleano", "Sim · Não", "Campo fiscal de retenção. Fora do escopo Atlas Fase 2.", "Contabilidade (Protheus)", "Contabilidade · MTI (consulta)", "Não entra Fase 2"),
    field("pr53", PR, "Produto — Integração Protheus — fiscal", "Calcula INSS", "Booleano", "Sim · Não", "Campo fiscal. Fora do escopo Atlas Fase 2.", "Contabilidade (Protheus)", "Contabilidade · MTI (consulta)", "Não entra Fase 2"),
    field("pr54", PR, "Produto — Integração Protheus — fiscal", "Retém PIS", "Booleano", "Sim · Não", "Campo fiscal de retenção. Fora do escopo Atlas Fase 2.", "Contabilidade (Protheus)", "Contabilidade · MTI (consulta)", "Não entra Fase 2"),
    field("pr55", PR, "Produto — Integração Protheus — fiscal", "Retém COFINS", "Booleano", "Sim · Não", "Campo fiscal de retenção. Fora do escopo Atlas Fase 2.", "Contabilidade (Protheus)", "Contabilidade · MTI (consulta)", "Não entra Fase 2"),
    field("pr56", PR, "Produto — Integração Protheus — fiscal", "Retém CSLL", "Booleano", "Sim · Não", "Campo fiscal de retenção. Fora do escopo Atlas Fase 2.", "Contabilidade (Protheus)", "Contabilidade · MTI (consulta)", "Não entra Fase 2"),
    field("pr57", PR, "Produto — Integração Protheus — fiscal", "Conta contábil", "Texto", "—", "Campo fiscal/contábil. Fora do escopo Atlas Fase 2. Confirmar valor padrão.", "Contabilidade (Protheus)", "Contabilidade · MTI (consulta)", "Não entra Fase 2", "Pendente"),
    field("pr58", PR, "Produto — Integração Protheus — fiscal", "Código natureza", "Texto", "Venda de serviços", "Sempre venda de serviços conforme matriz Protheus. Fora do escopo Atlas Fase 2.", "Contabilidade (Protheus)", "Contabilidade · MTI (consulta)", "Não entra Fase 2", "Pendente"),
    # Workflow e controle
    field("pr59", PR, "Produto — Workflow", "Status do produto", "Enum", "Rascunho · Em análise · Ajuste solicitado · Reprovado · Aprovado · Publicado · Substituído", "Workflow do produto/catálogo. Distinto do Status da Parceria. Gerado pelo fluxo de análise MTI.", "MTI / Sistema", "MTI · Parceiro (consulta)"),
    field("pr60", PR, "Produto — Controle", "Ativo?", "Booleano", "Sim · Não", "Indica se o produto está ativo para comercialização.", "Parceiro / MTI", "MTI · Parceiro (edição no portal)"),
]

# Validate unique ids
ids = [r["id"] for r in rows]
assert len(ids) == len(set(ids)), "Duplicate ids found"

body = json.dumps(rows, ensure_ascii=False, indent=2)
content = f"const SEED_DATA = {body};\n"
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(content, encoding="utf-8")

counts = {}
for r in rows:
    counts[r["classe"]] = counts.get(r["classe"], 0) + 1

print(f"Written {OUT} — total {len(rows)} fields")
for c in ["Parceria", "Solução", "Catálogo", "Produto"]:
    print(f"  {c}: {counts.get(c, 0)}")
