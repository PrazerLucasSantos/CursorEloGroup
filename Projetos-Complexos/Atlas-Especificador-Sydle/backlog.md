# Backlog Atlas — Fase 2 (Catálogo e Produto)

| Campo | Valor |
| --- | --- |
| **Fonte principal** | PPTX `v3.pptx` (Validação MTI Luiz/João/Gabriel — 21 a 25/08/2026) |
| **Extração** | `exports/_v3_pptx_extract.txt` |
| **Doc equivalente** | `exports/requisitos-atlas-fase2-validacao-20260826.md` (espelha PPTX v3) |
| **Doc anterior (não supersede)** | `exports/requisitos-atlas-fase2-final.md` — usar só para contraste; decisão 25/08 prevalece |
| **Contexto auxiliar** | Granola 21/08 (`fontes/referencias/granola-2026-08-21-atlas-catalogo-v5/`) |
| **Escopo** | Fase 2: cadastros base, Parceria, Solução, Grupo, Catálogo, Produto, Dados de Parceria por Produto, CSV, fluxo análise MTI / portal parceiro |
| **Fora do escopo (Fase 3)** | Consumo, OS, saldo, apostila, contrato, FC no consumo, Portal do Cliente, Tipos 1/2/3 de contratação, integração automática Atlas↔Proteus, campos fiscais/contábeis |
| **Data do backlog** | 2026-08-27 |

### Legenda de tags

| Tag | Uso |
| --- | --- |
| `validado-reuniao` | Evidência na PPTX v3 / validação 21–25/08 |
| `pendente-validacao` | Citado na PPTX, mas lista/fórmula/sign-off ainda aberto |
| `conflito` | Divergência entre fontes (resolução indicada) |
| `assumido` | Inferência operacional explícita (não inventar escopo) |

---

## Ordem de dependências (implementação)

1. **Organização/Parceiro** (pré-requisito externo — CNPJ já cadastrado)
2. **Listas base MTI:** Métrica → Tipo de Cobrança → Vertical de Serviço de TI → Modelo de Venda
3. **Parceria** (exige Organização + Vertical) → gera Catálogo Rascunho
4. **Solução** (exige Parceria)
5. **Grupo** (exige Parceria)
6. **Catálogo da Parceria** (exige Parceria + Solução + Métricas)
7. **Produto** (exige Catálogo + Grupo + Modelo + Cobrança + Métrica do catálogo)
8. **Dados de Parceria por Produto** (exige Parceria + Produto; motor de cálculo bloqueado até fórmula)
9. **Importação CSV** (no contexto do Catálogo)
10. **Portal do Parceiro** + **Backoffice MTI (análise/publicação)**

---

## Épico E1 — Cadastros base (listas parametrizadas MTI)

Parametrizar unidades e classificações reutilizadas por Catálogo e Produto, sem texto livre.

### Feature F1.1 — Métrica

#### PBI-MET-01 — CRUD de métricas (MTI)

- **Descrição:** Permitir à MTI criar, editar, consultar e listar métricas com Nome (único), Descrição e Ativo.
- **Critérios de aceite:**
  - [ ] MTI cria métrica com Nome obrigatório e Ativo
  - [ ] Sistema rejeita Nome duplicado
  - [ ] Parceiro não cria/edita métricas
  - [ ] Listagem e consulta exibem os campos cadastrados
- **Fonte:** Classe Métrica — RF-MET-01, RF-MET-02, RN-MET-01, RN-MET-02; campos Nome/Descrição/Ativo
- **Tag:** `validado-reuniao`
- **Dependências:** nenhuma (lista base)

#### PBI-MET-02 — Seleção apenas de métricas ativas (sem texto livre)

- **Descrição:** Em Catálogo e Produto, métrica só por referência a registro ativo.
- **Critérios de aceite:**
  - [ ] Campo métrica não aceita texto livre
  - [ ] Dropdown lista somente métricas Ativo = Sim
  - [ ] Métrica inativa não entra em novos vínculos
- **Fonte:** RF-MET-03, RN-MET-03
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-MET-01; Catálogo/Produto (consumo)

#### PBI-MET-03 — Relacionamentos e inativação com impacto

- **Descrição:** Exibir Parcerias/Catálogos/Produtos que usam a métrica; inativar com alerta; impedir hard delete com relacionamento.
- **Critérios de aceite:**
  - [ ] Consulta mostra grid reversivo de relacionamentos
  - [ ] Botão Inativar alerta listando impactos
  - [ ] Exclusão com relacionamento é bloqueada
- **Fonte:** RF-MET-04–06, RN-MET-04; métodos Inativar / Consultar relacionamentos
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-MET-01

#### PBI-MET-04 — Carga da lista oficial de códigos (planilha MTI)

- **Descrição:** Carregar códigos oficiais (USN, HST, UST e demais) conforme planilha comercial MTI antes do go-live.
- **Critérios de aceite:**
  - [ ] Lista oficial confirmada pela planilha MTI
  - [ ] USN/HST/UST presentes conforme evidências (MTPREV + extração 25/08)
  - [ ] Demais códigos alinhados à planilha (sem inventar)
- **Fonte:** RN-MET-05; necessidade/contexto slide Métrica
- **Tag:** `pendente-validacao`
- **Dependências:** PBI-MET-01; planilha MTI

---

### Feature F1.2 — Tipo de Cobrança

#### PBI-COB-01 — CRUD de tipos de cobrança (MTI)

- **Descrição:** Criar/editar/consultar/listar e ativar/inativar tipos de cobrança.
- **Critérios de aceite:**
  - [ ] Cadastro com Nome, Descrição (opc.), Ativo
  - [ ] Ativar/inativar controla disponibilidade para novos produtos
  - [ ] Tipo de Cobrança não é cadastrado no Catálogo
- **Fonte:** RF-COB-01, RF-COB-03; campos
- **Tag:** `validado-reuniao`
- **Dependências:** nenhuma

#### PBI-COB-02 — Valores Atlas e exclusão de “Sob demanda”

- **Descrição:** Disponibilizar valores Mensal, Anual, Subscrição, Conforme Homologação, Única, Unitário; não cadastrar “Sob demanda” como tipo.
- **Critérios de aceite:**
  - [ ] Lista contém os seis valores Atlas
  - [ ] “Sob demanda” não aparece como Tipo de Cobrança
  - [ ] Sem campos de pró-rata/carência/vencimento nesta classe
- **Fonte:** RN-COB-01, RN-COB-03, RN-COB-04
- **Tag:** `validado-reuniao` (valores); de-para volumetria planilha = `pendente-validacao`
- **Dependências:** PBI-COB-01

#### PBI-COB-03 — Obrigatoriedade no Produto e trava Perpétuo → Única

- **Descrição:** Exigir Tipo de Cobrança no Produto; se Modelo de Venda = Perpétuo, travar em Única.
- **Critérios de aceite:**
  - [ ] Produto sem tipo de cobrança não salva
  - [ ] Com Modelo = Perpétuo, cobrança = Única e não editável
- **Fonte:** RF-COB-02, RN-COB-02; RN-MV-03; RN-PROD-07
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-COB-01; PBI-MV-01; Produto

---

### Feature F1.3 — Vertical de Serviço de TI

#### PBI-VERT-01 — CRUD de Verticais (MTI)

- **Descrição:** Criar/editar/consultar/listar Verticais com Nome, Descrição e Ativo; cadastro exclusivo MTI.
- **Critérios de aceite:**
  - [ ] CRUD completo no backoffice MTI
  - [ ] Entidade nomeada “Vertical de Serviço de TI” (não “Categoria de Serviço”)
  - [ ] Somente ativas em novos relacionamentos
- **Fonte:** RF-VERT-01, RF-VERT-02, RF-VERT-05; RN-VERT-01, RN-VERT-04
- **Tag:** `validado-reuniao`
- **Dependências:** nenhuma

#### PBI-VERT-02 — Vínculo obrigatório na Parceria (não no Produto)

- **Descrição:** Vertical obriga na Parceria; não é campo editável do Produto (exibir herdada da Parceria do Catálogo, S.L.).
- **Critérios de aceite:**
  - [ ] Parceria sem Vertical não salva
  - [ ] Produto não permite editar Vertical
  - [ ] Produto exibe Vertical herdada (somente leitura) quando aplicável
  - [ ] Organização pode ter N Parcerias em Verticais distintas
- **Fonte:** RF-VERT-03; RN-VERT-02, RN-VERT-03; RN-PROD-05 (decisão 25/08)
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-VERT-01; Parceria; Produto (exibição)

#### PBI-VERT-03 — Consulta reversa e proteção contra exclusão

- **Descrição:** Exibir Parcerias relacionadas; impedir exclusão em uso; preferir inativar.
- **Critérios de aceite:**
  - [ ] Detalhe da Vertical lista Parcerias (S.L.)
  - [ ] Exclusão bloqueada se em uso
  - [ ] Inativação permitida
- **Fonte:** RF-VERT-04, RF-VERT-06; RN-VERT-05
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-VERT-01; Parceria

#### PBI-VERT-04 — Carga dos nomes oficiais das 5 verticais

- **Descrição:** Confirmar e carregar nomes oficiais das cinco verticais pela planilha MTI.
- **Critérios de aceite:**
  - [ ] Cinco nomes oficiais confirmados na planilha
  - [ ] Cadastro inicial refletindo a lista oficial
- **Fonte:** RN-VERT-06; pendências slide 23
- **Tag:** `pendente-validacao`
- **Dependências:** PBI-VERT-01; planilha MTI

---

### Feature F1.4 — Modelo de Venda

#### PBI-MV-01 — CRUD de modelos de venda (MTI)

- **Descrição:** Criar/editar/listar modelos; Nome, Descrição, Ativo; não excluir em uso (inativar).
- **Critérios de aceite:**
  - [ ] CRUD MTI funcional
  - [ ] Valores incluem Por Licença, Por Serviço, Por Pacote, Perpétuo (+ demais oficiais da planilha)
  - [ ] Modelo em uso não é excluído; inativação disponível
- **Fonte:** RF-MV-01; RN-MV-02, RN-MV-04; campos
- **Tag:** `validado-reuniao` (estrutura); lista completa planilha = `pendente-validacao`
- **Dependências:** nenhuma

#### PBI-MV-02 — Obrigatoriedade no Produto e distinção de Cobrança

- **Descrição:** Exigir Modelo de Venda no Produto; conceito distinto de Tipo de Cobrança; Perpétuo → Cobrança Única.
- **Critérios de aceite:**
  - [ ] Produto exige Modelo de Venda
  - [ ] UI/labels não confundem Modelo com Tipo de Cobrança
  - [ ] Perpétuo trava Cobrança = Única
- **Fonte:** RF-MV-02; RN-MV-01, RN-MV-03
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-MV-01; PBI-COB-03; Produto

---

## Épico E2 — Estrutura comercial (Parceria → Solução → Grupo → Catálogo)

Registrar o acordo e a estrutura que organiza o cardápio comercial.

### Feature F2.1 — Parceria

#### PBI-PAR-01 — CRUD de Parceria vinculada a Organização

- **Descrição:** MTI cria/edita/consulta/lista Parcerias; exige Organização e Vertical; campos Nome, Descrição, Observações, Ativo.
- **Critérios de aceite:**
  - [ ] Parceria distinta de Organização (CNPJ)
  - [ ] Organização e Vertical obrigatórias
  - [ ] Mesma Organização pode ter várias Parcerias
  - [ ] Ativar/inativar disponível
- **Fonte:** RF-PAR-01–04, RF-PAR-07; RN-PAR-01–02; campos
- **Tag:** `validado-reuniao`
- **Dependências:** Organização (pré-req); PBI-VERT-01

#### PBI-PAR-02 — Geração automática de Catálogo Rascunho ao salvar

- **Descrição:** Ao criar Parceria, gerar Catálogo em Rascunho com nome da parceria atrelado.
- **Critérios de aceite:**
  - [ ] Salvar nova Parceria cria Catálogo status Rascunho
  - [ ] Catálogo aparece no derivado Catálogos da Parceria
  - [ ] Edição de Parceria existente não duplica catálogo indevidamente (só na criação)
- **Fonte:** RF-PAR-05; RN-PAR-03; método Salvar
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PAR-01; Feature Catálogo

#### PBI-PAR-03 — Escopo do Portal do Parceiro e prefixo Código Atlas

- **Descrição:** Portal restrito às Parcerias do usuário; prefixo do Código Atlas deriva da sigla da Parceria (ex.: SIMP, CBAX); parceiro não publica/apostila.
- **Critérios de aceite:**
  - [ ] Usuário parceiro só vê/edita suas Parcerias
  - [ ] Prefixo configurável/derivado da Parceria para Código Atlas
  - [ ] Sem ações de publicar/apostilar no portal
- **Fonte:** RF-PAR-06; RN-PAR-04–05
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PAR-01; Portal; Produto (código)

---

### Feature F2.2 — Solução

#### PBI-SOL-01 — CRUD de Solução vinculada à Parceria

- **Descrição:** MTI cadastra Soluções com Nome, Parceria, Descrição, Ativo; Catálogo derivado automático quando existir.
- **Critérios de aceite:**
  - [ ] Solução exige Parceria
  - [ ] Dropdowns de Solução filtram pela Parceria selecionada
  - [ ] Campo Catálogo preenchido automaticamente (S.L.) quando houver
  - [ ] Inativar preferível a excluir com relacionamentos
- **Fonte:** RF-SOL-01–04; RN-SOL-01–04
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PAR-01

#### PBI-SOL-02 — Campos de Fabricante (opcionais)

- **Descrição:** Permitir Fabricante (nome, contato) e documentos de apoio — opcionais até sign-off MTI.
- **Critérios de aceite:**
  - [ ] Campos opcionais disponíveis no formulário
  - [ ] Não bloqueiam criação/homologação da Solução
  - [ ] Marcados como pendentes de validação formal
- **Fonte:** RF-SOL-05; RN-SOL-05; campos Fabricante
- **Tag:** `pendente-validacao`
- **Dependências:** PBI-SOL-01

---

### Feature F2.3 — Grupo

#### PBI-GRP-01 — CRUD de Grupo por Parceria

- **Descrição:** Criar/editar/consultar/listar Grupos vinculados à Parceria; MTI e Parceiro (só suas parcerias).
- **Critérios de aceite:**
  - [ ] Grupo exige Parceria
  - [ ] Parceiro não edita grupos de outras parcerias
  - [ ] Ativar/inativar; exclusão bloqueada se houver produtos
- **Fonte:** RF-GRP-01–02, RF-GRP-04–05; RN-GRP-01, RN-GRP-03
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PAR-01

#### PBI-GRP-02 — Obrigatoriedade e filtro de Grupo no Produto

- **Descrição:** Todo Produto exige Grupo da mesma Parceria do Catálogo.
- **Critérios de aceite:**
  - [ ] Produto sem Grupo não salva
  - [ ] Dropdown lista só grupos da Parceria do Catálogo selecionado
- **Fonte:** RF-GRP-03; RN-GRP-02
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-GRP-01; Produto

---

### Feature F2.4 — Catálogo da Parceria

#### PBI-CAT-01 — Identificação e vínculo Parceria + Solução

- **Descrição:** Manter Catálogo com Nome, Parceria, Solução (filtrada), Versão, Status, Ativo; Parceria S.L. quando gerado automaticamente.
- **Critérios de aceite:**
  - [ ] Catálogo exige Parceria e Solução
  - [ ] Solução filtrada pela Parceria
  - [ ] Status controlado pelo workflow (Rascunho · Em análise · Ajuste · Reprovado · Homologado · Publicado)
  - [ ] Versão atual nasce em 1.0; versão anterior rastreável
- **Fonte:** RF-CAT-01, RF-CAT-05; RN-CAT-01, RN-CAT-07; campos Identificação
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PAR-02; PBI-SOL-01

#### PBI-CAT-02 — Classificação comercial (3 indicadores independentes)

- **Descrição:** Informar É Universal?, É de Serviços?, É de Licenciamento? (booleanos independentes, não fiscais).
- **Critérios de aceite:**
  - [ ] Três toggles independentes e obrigatórios
  - [ ] Não tratados como campos fiscais
- **Fonte:** RF-CAT-02; RN-CAT-03; campos Classificação
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-CAT-01

#### PBI-CAT-03 — Métricas do catálogo com valor unitário

- **Descrição:** Associar métricas ativas do cadastro; cada uma exige valor unitário no catálogo (não substitui valor do Produto).
- **Critérios de aceite:**
  - [ ] Só métricas ativas selecionáveis
  - [ ] Valor unitário obrigatório por métrica associada
  - [ ] Valor da métrica do catálogo ≠ valor unitário do Produto
- **Fonte:** RF-CAT-03; RN-CAT-04–05
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-MET-01; PBI-CAT-01

#### PBI-CAT-04 — Responsáveis e códigos opcionais

- **Descrição:** Registrar Focal de Vendas, Focal de Pós-Vendas, Unidade DTIC; SIAG/Proteus opcionais Fase 2.
- **Critérios de aceite:**
  - [ ] Focais/DTIC editáveis no Catálogo
  - [ ] Não editáveis no Produto
  - [ ] Códigos SIAG/Proteus opcionais (sem integração automática)
- **Fonte:** RF-CAT-04, RF-CAT-08; RN-CAT-09–10; campos Responsáveis/Códigos
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-CAT-01

#### PBI-CAT-05 — Versionamento e fluxo de análise

- **Descrição:** Controlar rascunho → envio → análise → ajuste/reprovação/aprovação; travar edição do parceiro após envio; incrementar versão em evento de aprovação; homologação com assinaturas de diretores e presidente quando aplicável.
- **Critérios de aceite:**
  - [ ] Enviar para análise trava edição do parceiro
  - [ ] MTI: Aprovar / Solicitar ajuste / Reprovar (justificativa em ajuste/reprovação)
  - [ ] Evento de aprovação incrementa versão (1.1, 1.2…) sem sobrescrever histórico
  - [ ] Fluxo de assinaturas registrado na homologação de versão
- **Fonte:** RF-CAT-05–07; RN-CAT-07–08; métodos
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-CAT-01; Features Portal/MTI

#### PBI-CAT-06 — Unicidade de catálogo ativo por Parceria+Solução

- **Descrição:** Definir e implementar (após confirmação) regra de no máximo um catálogo ativo/publicado por Parceria+Solução.
- **Critérios de aceite:**
  - [ ] Regra confirmada com Luís
  - [ ] Sistema aplica a regra acordada (ou documenta ausência se rejeitada)
- **Fonte:** RN-CAT-06; pendências slide 23
- **Tag:** `pendente-validacao`
- **Dependências:** PBI-CAT-01

---

## Épico E3 — Produto, condições comerciais e carga CSV

### Feature F3.1 — Produto

#### PBI-PROD-01 — Cadastro vinculado ao Catálogo com herança

- **Descrição:** Cadastrar/editar Produto; Catálogo é o primeiro campo; herdar Parceria, Solução, Versão e Tipo de Oferta (S.L.).
- **Critérios de aceite:**
  - [ ] Sem Catálogo não há cadastro
  - [ ] Parceria/Solução/Versão/Tipo de Oferta preenchidos e somente leitura
  - [ ] Tipo de Oferta: Universal se Catálogo.É Universal? = Sim; senão Individualizado
  - [ ] Vertical exibida S.L. herdada da Parceria (não editável)
- **Fonte:** RF-PROD-01, RF-PROD-03; RN-PROD-01, RN-PROD-05; campos
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-CAT-01–02; PBI-VERT-02

#### PBI-PROD-02 — Identificação (Código Atlas, nomes, SKU, tipo)

- **Descrição:** Garantir Código Atlas único (4–6, prefixo parceria + sequencial); Nome obrigatório; Nome científico/comercialização opcional; Part Number opcional; Tipo Licença|Serviço.
- **Critérios de aceite:**
  - [ ] Código Atlas gerado/único no sistema; formato 4–6 alfanumérico
  - [ ] Distinto de Código Proteus (item ERP) e Código Parceiro Proteus
  - [ ] Part Number opcional e não copia o Nome
  - [ ] Tipo somente Licença ou Serviço (não Tipos 1/2/3)
- **Fonte:** RF-PROD-02, RF-PROD-06–07; RN-PROD-02, RN-PROD-08; campos
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PROD-01; PBI-PAR-03

#### PBI-PROD-03 — Comercialização (modelo, cobrança, métrica, valor)

- **Descrição:** Informar Modelo de Venda, Tipo de Cobrança, Métrica (entre as do Catálogo) e Valor unitário.
- **Critérios de aceite:**
  - [ ] Modelo e Cobrança obrigatórios
  - [ ] Métrica só entre as permitidas do Catálogo
  - [ ] Perpétuo → Cobrança Única
  - [ ] Sem Fator de Conversão no cadastro Fase 2
- **Fonte:** RF-PROD-04; RN-PROD-06–07, RN-PROD-12; campos
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PROD-01; PBI-CAT-03; PBI-MV-02; PBI-COB-03

#### PBI-PROD-04 — Campos condicionais de Serviço e Universal

- **Descrição:** Se Serviço: Complexidade, Coeficiente (S.L. por faixa), Peso, Quantidade da métrica; se Licença: ocultar. Se Universal: Valor da moeda universal = 1 (S.L.); flag Consumo por OS = referência Fase 3.
- **Critérios de aceite:**
  - [ ] Licença oculta campos de serviço
  - [ ] Serviço exibe/exige campos quando aplicáveis
  - [ ] Universal mostra moeda = 1 S.L.
  - [ ] Flag “Consumo por OS?” não altera Tipo de Cobrança; escopo consumo = Fase 3
- **Fonte:** RF-PROD-05; RN-PROD-03–04; campos condicionais
- **Tag:** `validado-reuniao` (campos Serviço/Universal); flag OS = fora de escopo operacional Fase 3 (`assumido` como UI informativa apenas se mantida)
- **Dependências:** PBI-PROD-01

#### PBI-PROD-05 — Códigos externos, status e exclusões fiscais

- **Descrição:** SIAG/Proteus item opcionais; Status pelo workflow; Ativo; sem campos fiscais/contábeis/retenções; sem integração automática Proteus.
- **Critérios de aceite:**
  - [ ] Códigos SIAG/Proteus opcionais e manuais
  - [ ] Status refletindo workflow
  - [ ] Formulário sem IR/INSS/PIS/COFINS/CSLL/grupo tributário/conta etc.
- **Fonte:** RF-PROD-08; RN-PROD-09–11; campos códigos/status
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PROD-01; fluxo MTI

#### PBI-PROD-06 — Métodos CSV/PDF e participação no fluxo

- **Descrição:** Importar/exportar CSV no catálogo; exportar PDF; enviar para análise; pareceres MTI.
- **Critérios de aceite:**
  - [ ] Importar/Exportar CSV no contexto do catálogo
  - [ ] Exportar PDF
  - [ ] Enviar para análise trava edição
  - [ ] Aprovar / Solicitar ajuste / Reprovar disponíveis na análise MTI
- **Fonte:** RF-PROD-09–10; métodos Produto
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PROD-01; Feature CSV; Features Portal/MTI

---

### Feature F3.2 — Dados de Parceria por Produto

#### PBI-DP-01 — Registro comercial Parceria × Produto (± Solução)

- **Descrição:** Criar registro com Parceria, Produto, Solução (opc.), Período mínimo (12/24/36/48/60), Custo do parceiro, Custo de mercado (MTI), Ativo.
- **Critérios de aceite:**
  - [ ] Período mínimo obrigatório nas opções fechadas (sem Perpétuo neste campo)
  - [ ] Parceiro informa Custo do Parceiro
  - [ ] MTI informa Custo de Mercado
  - [ ] Separado do cadastro estrutural do Produto
- **Fonte:** RF-DP-01–04; RN-DP-01–02; campos
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PAR-01; PBI-PROD-01

#### PBI-DP-02 — Sigilo financeiro no Portal do Parceiro

- **Descrição:** Ocultar custo de mercado, valor unitário calculado e % de rateio no portal do parceiro.
- **Critérios de aceite:**
  - [ ] Portal não exibe custo de mercado, preço calculado nem % parceiro/MTI
  - [ ] Backoffice MTI exibe esses campos
- **Fonte:** RF-DP-06; RN-DP-03
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-DP-01; Portal

#### PBI-DP-03 — Motor de cálculo (valor unitário e rateio) — bloqueado

- **Descrição:** Após fórmula validada por Luís: calcular Valor unitário e Distribuições % (parceiro/MTI). Até lá, não implementar motor.
- **Critérios de aceite:**
  - [ ] Fórmula/sign-off documentado (custo parceiro + mercado → valor → rateio)
  - [ ] Campos calculados S.L. preenchidos conforme fórmula
  - [ ] Sem implementação do motor antes do martelo
- **Fonte:** RF-DP-05; RN-DP-04–05; observações slides 10–11; pendências
- **Tag:** `pendente-validacao`
- **Dependências:** PBI-DP-01; decisão Luís

---

### Feature F3.3 — Importação CSV e carga inicial

#### PBI-CSV-01 — Importar/exportar no contexto do Catálogo

- **Descrição:** Importar CSV no Catálogo/Parceria; exportar produtos; log de erros; vínculo preferencial por ID.
- **Critérios de aceite:**
  - [ ] Importação exige Catálogo de destino e arquivo
  - [ ] Validação de cabeçalhos, obrigatórios e referências ativas
  - [ ] Log exibe linhas rejeitadas
  - [ ] Exportação gera CSV do catálogo
- **Fonte:** RF-CSV-01–04; RN-CSV-03; campos
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-CAT-01; PBI-PROD-01; listas base

#### PBI-CSV-02 — Escopo comercial (bloco A) e exclusões

- **Descrição:** CSV Fase 2 = estrutura comercial (cols 1–13); rejeitar custo de mercado/% rateio/fiscais/FC; Sob Demanda não importa como Tipo de Cobrança; Código Atlas gerado (não vem preenchido).
- **Critérios de aceite:**
  - [ ] Arquivo do parceiro sem colunas de mercado/%/fiscais aceitas
  - [ ] Col FC ignorada (não calcula)
  - [ ] Sob Demanda não vira Tipo de Cobrança
  - [ ] Vertical da planilha mapeia para Parceria (não linha de produto)
  - [ ] Focais/DTIC (cols 11–13) → Catálogo
- **Fonte:** RF-CSV-05; RN-CSV-01–02, RN-CSV-06–07
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-CSV-01

#### PBI-CSV-03 — Layout final e modelos de planilha

- **Descrição:** Disponibilizar modelos serviços/licenciamento após confirmar layout oficial da planilha MTI (388×31).
- **Critérios de aceite:**
  - [ ] Layout de colunas/ordem confirmado com MTI
  - [ ] Modelos de planilha publicados para serviços e licenciamento
- **Fonte:** RF-CSV-01; RN-CSV-05; pendências
- **Tag:** `pendente-validacao`
- **Dependências:** PBI-CSV-01; planilha MTI / João

---

## Épico E4 — Portais e governança (análise / publicação)

### Feature F4.1 — Portal do Parceiro (Catálogo e Produto)

#### PBI-PP-01 — Montagem de rascunho no escopo da parceria

- **Descrição:** Com acesso nível 2, parceiro monta catálogo/produtos/grupos só das suas Parcerias; salva rascunho.
- **Critérios de aceite:**
  - [ ] Escopo restrito às Parcerias do usuário
  - [ ] Cadastro em tela ou CSV
  - [ ] Sem acesso a ERP, impostos, custo de mercado ou rateios
- **Fonte:** RF-PP-01–03; RN-PP-01–02; campos Portal
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PAR-03; Catálogo; Produto; Grupo; CSV

#### PBI-PP-02 — Envio, ajuste e exportações

- **Descrição:** Enviar para análise (S.L. até parecer); corrigir após ajuste e reenviar; exportar CSV/PDF; sem publicar/apostilar.
- **Critérios de aceite:**
  - [ ] Após envio, conteúdo enviado fica somente leitura
  - [ ] Em Ajuste, parceiro edita e reenvia
  - [ ] Export CSV e PDF disponíveis
  - [ ] Sem botões de publicar/apostilar
- **Fonte:** RF-PP-04–06; RN-PP-03
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-PP-01; PBI-CAT-05

---

### Feature F4.2 — Backoffice MTI (Análise e publicação)

#### PBI-MTI-01 — Fila de análise e pareceres

- **Descrição:** Listar envios pendentes; Aprovar / Solicitar ajuste / Reprovar com justificativa; informar custo de mercado quando aplicável.
- **Critérios de aceite:**
  - [ ] Fila de pendentes acessível
  - [ ] Justificativa obrigatória em ajuste/reprovação
  - [ ] Parceiro não edita enquanto Em análise
  - [ ] MTI pode informar custo de mercado no contexto do item
- **Fonte:** RF-MTI-01–03; RN-MTI-01; campos Parecer/Justificativa/Custo
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-CAT-05; PBI-DP-01

#### PBI-MTI-02 — Versionamento, homologação e publicação

- **Descrição:** Controlar versionamento na homologação; publicar catálogos/produtos homologados; publicação ≠ disponibilizar ao cliente (apostila = Fase 3).
- **Critérios de aceite:**
  - [ ] Evento de aprovação gera nova versão quando aplicável
  - [ ] Publicar disponível após Homologado
  - [ ] Sem apostilar contrato nesta feature (Fase 3)
  - [ ] Análise não trata campos fiscais no Atlas Fase 2
- **Fonte:** RF-MTI-04–05; RN-MTI-02–03; RN-CAT-08
- **Tag:** `validado-reuniao`
- **Dependências:** PBI-MTI-01; PBI-CAT-05

---

## Fora de escopo / não committed (Fase 3 e exclusões)

Itens citados na PPTX/docs **sem PBI committed** na Fase 2:

| Tema | Motivo | Observação |
| --- | --- | --- |
| Consumo / OS / saldo | Fase 3 | RN-CAT-11; flag OS no Produto só referência |
| Apostila / Contrato | Fase 3 | Publicar ≠ cliente ver |
| Portal do Cliente | Fase 3 | Doc antiga classe 13 |
| Catálogo Universal (N3) cadastro completo + consumo | Fase 3 / não committed | Doc antiga; PPTX v3 não traz classe Universal como entregável Fase 2 |
| Tipos 1 / 2 / 3 de contratação | Fase 3 | Nascem no contrato |
| Fator de Conversão (FC) e precisão 6 casas | Fase 3 | Não cadastrar/calcular no Produto |
| Pró-rata / carência / vencimento | Fase 3 | RN-COB-04 |
| Campos fiscais / retenções / conta contábil | Fora Atlas Fase 2 | Proteus |
| Integração automática Atlas↔Proteus | Pós-alfa | RN-PROD-11 / RN-CAT-10 |
| Motor de split financeiro | Bloqueado | PBI-DP-03 pendente Luís |

---

## Ambiguidade / conflitos registrados

| # | Tema | Evidência | Tratamento no backlog |
| --- | --- | --- | --- |
| 1 | **Vertical no Produto vs na Parceria** | Doc `requisitos-atlas-fase2-final.md` ainda coloca Vertical no Produto (Serviço); PPTX v3 / validação 25/08: Vertical na Parceria, Produto só herda S.L. | `conflito` resolvido a favor da PPTX v3 — PBI-VERT-02 |
| 2 | **RF-PROD-06** | PPTX 17/08: moeda/FC; pós-25/08: Código Atlas | Usar PPTX v3 / validação 20260826 |
| 3 | **Dados de Parceria: markup vs custo de mercado** | Doc antiga fala markup; PPTX v3: Custo de Mercado + fórmula pendente | Seguir PPTX; PBI-DP-03 `pendente-validacao` |
| 4 | **Lista Tipo de Cobrança** | Doc antiga sem Subscrição/Unitário; PPTX inclui | Seguir PPTX (6 valores) |
| 5 | **Unicidade Catálogo ativo Parceria+Solução** | RN-CAT-06 a confirmar Luís | PBI-CAT-06 `pendente-validacao` |
| 6 | **Parcelamento licença perpétua vs cobrança Única** | Pendência Luís/João (slide 23) | Sem PBI committed; detalhe operacional aberto |
| 7 | **“Consumo por OS?” no Produto** | Campo na PPTX, mas consumo = Fase 3 | Não criar fluxo de OS; se UI mantida, só informativo |

---

## Resumo quantitativo

| Nível | Quantidade |
| --- | --- |
| Épicos | **4** |
| Features | **12** |
| PBIs | **40** |

### Contagem por tag (PBIs)

| Tag | PBIs |
| --- | --- |
| `validado-reuniao` | 32 |
| `pendente-validacao` | 7 (MET-04, VERT-04, SOL-02, CAT-06, DP-03, CSV-03; + MV-01/COB-02 parcialmente) |
| `conflito` | 0 PBI aberto (conflito Vertical documentado como resolvido) |
| `assumido` | 0 PBI committed (apenas nota em PROD-04 / Fase 3) |
