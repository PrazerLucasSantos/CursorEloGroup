# Atlas — Fase 1 — Apresentação de Requisitos

*Estrutura alinhada ao documento Requisitos Atlas.docx: Para que serve → História → RF → RN → Campos → Exemplo.*

*Fontes: PEAP 0001/2025, 31 arquivos em Fontes de Dados, Discovery 15/06, checkpoints jun/2026.*

---

# Cadastro base

## F1 Nível organizacional

### Para que serve

Cadastrar tipos de nível da estrutura hierárquica (Empresa, Diretoria, Gerência, Setor) com controle ativo/inativo, sem alterar a classe nativa de Unidade Organizacional do Sido.

### História de Usuário

Como administrador da MTI, quero cadastrar níveis organizacionais ativos ou inativos e direcionar para o cadastro de unidades, para estruturar MTI, parceiros e clientes de forma flexível e recursiva.

### Requisitos Funcionais

- RF-NO-01: CRUD de tipos de nível organizacional.
- RF-NO-02: Campo ativo/inativo por nível.
- RF-NO-03: Método Cadastrar unidade organizacional abre formulário UO com nível pré-selecionado.
- RF-NO-04: Visualização em cards e árvore vertical (presidência → diretorias → unidades).

### Regras de Negócio

- RN-NO-01: Nível inativo não aparece em dropdowns de novos cadastros.
- RN-NO-02: Estrutura orgânica — profundidade ilimitada via unidade pai (Luiz 01/06).

### Campos da tela

*Formulário: `form-atlas-f1-nivel-organizacional` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| Nome do nível | Nome do tipo de nível organizacional (ex.: Empresa, Diretoria, Gerência, Setor, Gabinete). Cadastrável pela MTI. Fonte: reunião 12/06/2026. |
| Ativo | RN: nível inativo não aparece em novos cadastros de unidade organizacional. Fonte: Lucas 12/06. |
| Descrição | Descrição opcional do nível para orientar administradores. |
| Ordem hierárquica | Ordem relativa na árvore (1=mais alto). Usado para visualização verticalizada solicitada por Luiz 01/06. |

### Exemplo de Utilização

Cadastrar nível 'Diretoria' ativo → Cadastrar UO DIRC vinculada à MTI com nível Diretoria → exibir na árvore sob MTI.

---

## F1 Tipo Documento

### Para que serve

Configurar tipos de documento exigidos no cadastro organizacional (CNPJ, contrato social, alvará) com regras de vencimento e notificação.

### História de Usuário

Como gestor de cadastro, quero definir tipos de documento e prazos de validade, para controlar conformidade documental das organizações.

### Requisitos Funcionais

- RF-TD-01: CRUD tipos de documento.
- RF-TD-02: Notificação por e-mail antes do vencimento.
- RF-TD-03: Campo código parceiro/cliente Protheus (sem API F1).

### Regras de Negócio

- RN-TD-01: Documento vencido bloqueia emissão de OS conforme regra configurável.

### Campos da tela

*Formulário: `form-atlas-f1-tipo-documento` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Tipo 'Contrato social' — validade 365 dias — alerta 30 dias antes.

---

## F1 Cadastro Organizacional

### Para que serve

Cadastro Organizacional unificado MTI/Parceiro/Cliente com abas Dados Unidade, Ajustes, Dados cadastro, Documentos, Tributos, Contato e Usuários (somente leitura).

### História de Usuário

Como gestor MTI, quero cadastrar organizações e unidades com CNPJ, documentos e tributos, para habilitar fluxos comerciais e assinaturas.

### Requisitos Funcionais

- RF-CO-01: Três tipos — MTI, Parceiro, Cliente.
- RF-CO-02: Hierarquia via unidade pai e caminho único.
- RF-CO-03: Abas conforme Discovery 15/06 (sem Localização).
- RF-CO-04: Usuários somente leitura — cadastro em Cargo.
- RF-CO-05: Gestor responsável e governança.

### Regras de Negócio

- RN-CO-01: Organização raiz (Empresa=Sim) controla limite de usuários.
- RN-CO-02: Parceiro vê apenas contratos/OS de sua região quando configurado.
- RN-CO-03: Dados cadastro Protheus preenchidos manualmente F1; automático F3+.

### Campos da tela

*Formulário: `form-atlas-f1-unidade-organizacional` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Cadastrar Parceiro EloGroup → upload contrato social → vincular gestor → habilitar cargos.

---

## F1 Pessoas

### Para que serve

Cadastro único de pessoas (MTI, parceiro, cliente, interno) com documentos, contatos e vínculos organizacionais via Cargo/Ocupante.

### História de Usuário

Como RH/gestor, quero cadastrar pessoas e alocá-las em cargos, para controlar permissões e assinaturas.

### Requisitos Funcionais

- RF-PE-01: CRUD pessoa com CPF, e-mail, telefone.
- RF-PE-02: Método Criar servidor (não é classe).
- RF-PE-03: Realocação entre unidades pelo perfil da pessoa.

### Regras de Negócio

- RN-PE-01: Pessoa sem vínculo ativo não acessa workflows.
- RN-PE-02: Não existe classe Cliente — cliente é Organização tipo Cliente.

### Campos da tela

*Formulário: `form-atlas-f1-pessoa` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Cadastrar Lucas → alocar como Analista na DIRC → permissão Criar proposta.

---

## F1 Cargo

### Para que serve

Definir cargos por organização com ocupantes, permissões por tipo de processo, região e flag Pode assinar.

### História de Usuário

Como gestor, quero configurar cargos e permissões, para direcionar workflows e assinaturas por função.

### Requisitos Funcionais

- RF-CA-01: Ocupantes com ativo e período.
- RF-CA-02: Permissões filtradas por Tipo de Processo.
- RF-CA-03: Campo região (UF) para roteamento.
- RF-CA-04: Pode assinar Sim/Não.

### Regras de Negócio

- RN-CA-01: Ocupante inativo não roteia workflow.
- RN-CA-02: Aprovar/Recusar são ações de workflow, não permissão de cargo.
- RN-CA-03: Cargos vinculados à organização raiz, não à UO efêmera (Luiz 01/06).

### Campos da tela

*Formulário: `form-atlas-f1-cargo` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Cargo Gerente Comercial — região MT — Pode assinar — permissão Enviar para assinatura.

---

## F1 Solicitação de vínculo

### Para que serve

Fluxo para pessoa solicitar vínculo a organização parceiro/cliente com aprovação do gestor.

### História de Usuário

Como profissional externo, quero solicitar vínculo à organização, para obter acesso ao Atlas.

### Requisitos Funcionais

- RF-SV-01: Solicitar vínculo.
- RF-SV-02: Gestor aprova/rejeita.
- RF-SV-03: Auditoria registrada.

### Regras de Negócio

- RN-SV-01: Vínculo aprovado cria ocupante pendente ou ativo.

### Campos da tela

*Formulário: `form-atlas-f1-solicitacao-vinculo` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Analista parceiro solicita vínculo → gestor MTI Simplifica aprova.

---

# Configuração e documentos

## F1 Versões de Processo

### Para que serve

Versões de Processo por parceria — tipos Proposta, Contrato, OS, Projeto — com versionamento.

### História de Usuário

Como analista de processos, quero versionar configurações de fluxo, para evoluir sem quebrar instâncias em andamento.

### Requisitos Funcionais

- RF-VP-01: Versionamento — instância antiga permanece na versão original.
- RF-VP-02: Signatários configurados para envio simultâneo.
- RF-VP-03: Tipos de processo configuráveis.

### Regras de Negócio

- RN-VP-01: Apenas versão ativa inicia novos processos.
- RN-VP-02: Sem ordem hierárquica entre signatários (Luiz 15/06).

### Campos da tela

*Formulário: `form-atlas-f1-config-processo` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Versão 2.0 Proposta MTI Simplifica — 5 signatários paralelos.

---

## F1 Workflow de Processo

### Para que serve

Etapas sequenciais do fluxo — ação, assinatura, decisão — com direcionamento por cargo/unidade.

### História de Usuário

Como gestor, quero definir etapas e responsáveis, para conduzir propostas e contratos.

### Requisitos Funcionais

- RF-WF-01: Etapas ordenadas.
- RF-WF-02: Etapa Assinatura dispara envelope GED.
- RF-WF-03: Responsável = cargo + unidade → ocupante ativo.
- RF-WF-04: Edição retorna à etapa zero com justificativa.

### Regras de Negócio

- RN-WF-01: Assinatura paralela — todos signatários ao mesmo tempo.
- RN-WF-02: Recusa cancela envelope.
- RN-WF-03: Etapa N só após N-1 concluída.

### Campos da tela

*Formulário: `form-atlas-f1-workflow-processo` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Elaborar → Revisar → Assinatura (3 signatários) → Emitir.

---

## F1 Template

### Para que serve

Modelos documentais Mustache com blocos parametrizáveis, plano de fundo e injeção condicional ECM.

### História de Usuário

Como gestor documental, quero montar templates por blocos, para gerar propostas e contratos padronizados.

### Requisitos Funcionais

- RF-TM-01: Blocos reutilizáveis.
- RF-TM-02: Mustache {{variáveis}}.
- RF-TM-03: Edição controlada antes de gerar PDF.
- RF-TM-04: Homologação de versão de template.

### Regras de Negócio

- RN-TM-01: Blocos de produtos F1 usam tabela texto livre; F3 usa catálogo.

### Campos da tela

*Formulário: `form-atlas-f1-template` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Template Proposta Simplifica — bloco capa + bloco itens + bloco assinaturas.

---

## F1 Assinatura de Documentos

### Para que serve

Configuração de envelope GED (Sigadoc), signatários, métodos Gov.br/MT Login/ICP/presencial.

### História de Usuário

Como gestor, quero enviar documentos para assinatura digital paralela, para formalizar propostas e contratos.

### Requisitos Funcionais

- RF-AS-01: Envelope multi-documento.
- RF-AS-02: Envio simultâneo a todos signatários.
- RF-AS-03: Quatro métodos de assinatura.
- RF-AS-04: Posição do carimbo configurável.

### Regras de Negócio

- RN-AS-01: Recusa de um signatário cancela envelope.
- RN-AS-02: Signatário referencia Pessoa ocupante do cargo, não classe Servidor.
- RN-AS-03: Painel: só Aprovar e Recusar.

### Campos da tela

*Formulário: `form-atlas-f1-assinatura-documentos` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Enviar proposta — 4 signatários paralelos — Gov.br + e-mail token.

---

## F1 Documentos e Templates

### Para que serve

Geração de PDF imutável a partir de template, hash SHA-256 e log de blocos renderizados.

### História de Usuário

Como analista, quero gerar PDF com integridade, para anexar ao processo e assinar.

### Requisitos Funcionais

- RF-DT-01: Gerar PDF.
- RF-DT-02: Hash de integridade.
- RF-DT-03: Log de blocos Mustache aplicados.
- RF-DT-04: Versionamento pós-assinatura.

### Regras de Negócio

- RN-DT-01: PDF assinado é imutável.

### Campos da tela

*Formulário: `form-atlas-f1-documentos-templates` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Gerar PDF proposta #2026-001 — hash registrado — enviar assinatura.

---

## F1 Cláusula — Biblioteca ECM

### Para que serve

Biblioteca de cláusulas reutilizáveis com injeção condicional por tipo de item/serviço.

### História de Usuário

Como jurídico, quero cláusulas parametrizadas, para compor contratos dinamicamente.

### Requisitos Funcionais

- RF-ECM-01: CRUD cláusulas.
- RF-ECM-02: Condição por tipo item.
- RF-ECM-03: Mustache no conteúdo.

### Regras de Negócio

- RN-ECM-01: RF04 proposta dispara cláusulas condicionais.

### Campos da tela

*Formulário: `form-atlas-f1-clausula-ecm` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Cláusula SLA — injetada se item tipo Cloud.

---

## F1 Modelo de Contrato

### Para que serve

Até 14 modelos de contrato por parceria vinculados a template e cláusulas ECM.

### História de Usuário

Como gestor de contratos, quero modelos por parceria, para formalizar propostas aprovadas.

### Requisitos Funcionais

- RF-MC-01: Modelo por parceria.
- RF-MC-02: Vínculo template + ECM.
- RF-MC-03: Geração a partir da proposta.

### Regras de Negócio

- RN-MC-01: Contrato só após proposta assinada.

### Campos da tela

*Formulário: `form-atlas-f1-modelo-contrato` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Modelo 118/2023 Seplag — template específico.

---

# Operação e auditoria

## F1 Processos

### Para que serve

Hub de instâncias de processo — número, tipo, versão, status, workflow — transversal ao fluxo.

### História de Usuário

Como operador, quero acompanhar instâncias de processo, para saber status e responsáveis.

### Requisitos Funcionais

- RF-PR-01: Instanciar processo.
- RF-PR-02: Disparar workflow.
- RF-PR-03: Cancelar/paralisar.
- RF-PR-04: Zerar pedido de venda (método OS).

### Regras de Negócio

- RN-PR-01: Hub transversal — detalhe de Proposta/Contrato/OS nas classes do Fluxo operacional.
- RN-PR-02: Sem catálogo F1 — itens texto livre.

### Campos da tela

*Formulário: `form-atlas-f1-processos` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Processo Proposta #4521 — status Em assinatura.

---

## F1 Painel de Assinaturas Pendentes

### Para que serve

Caixa de entrada pessoal — documentos aguardando Aprovar ou Recusar.

### História de Usuário

Como signatário, quero ver pendências e agir, para não atrasar formalizações.

### Requisitos Funcionais

- RF-PA-01: Lista filtrada por usuário.
- RF-PA-02: Ações Aprovar e Recusar.
- RF-PA-03: Tipos proposta, contrato, OS, projeto.

### Regras de Negócio

- RN-PA-01: Recusa cancela envelope GED.

### Campos da tela

*Formulário: `form-atlas-f1-painel-assinaturas-pendentes` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Felipe vê 2 propostas pendentes — Aprovar uma — Recusar outra com motivo.

---

## F1 Auditoria

### Para que serve

Trilha de auditoria — quem, cargo, ação, quando, IP — incluindo versionamento estrutural.

### História de Usuário

Como auditor, quero rastrear ações, para governança e compliance.

### Requisitos Funcionais

- RF-AU-01: Registrar toda ação relevante.
- RF-AU-02: Histórico de alteração por cadastro.
- RF-AU-03: Metadados de assinatura (suplente).

### Regras de Negócio

- RN-AU-01: Versionamento estrutura org. preserva histórico (Luiz 01/06).

### Campos da tela

*Formulário: `form-atlas-f1-auditoria` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Log: Fernanda assinou como suplente — metadado registrado.

---

# Fluxo operacional

## F1 Proposta

### Para que serve

Primeiro processo do fluxo — itens (texto livre F1), template, PDF, assinatura paralela.

### História de Usuário

Como gestor comercial, quero registrar proposta e enviar para assinatura, para iniciar ciclo comercial.

### Requisitos Funcionais

- RF-PROP-01: Itens texto livre/tabela manual F1.
- RF-PROP-02: Gerar documento ECM.
- RF-PROP-03: Enviar assinatura.
- RF-PROP-04: F3 — seleção catálogo homologado.

### Regras de Negócio

- RN-PROP-01: F1 — preço editável manual.
- RN-PROP-03 F3 — preço travado RN03 na abertura.
- RN-PROP-02: Região cliente filtra signatário parceiro.

### Campos da tela

*Formulário: `form-atlas-f1-proposta` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Proposta MPMG — 3 itens descritos — assinatura MTI+parceiro+cliente.

---

## F1 Documentos

### Para que serve

Documentos PDF imutáveis anexos ao processo com hash e status de assinatura.

### História de Usuário

Como analista, quero consultar PDFs gerados, para evidência legal.

### Requisitos Funcionais

- RF-DOC-01: Anexar PDF.
- RF-DOC-02: Exibir hash.
- RF-DOC-03: Bloquear edição pós-assinatura.

### Regras de Negócio

- RN-DOC-01: Documento assinado read-only.

### Campos da tela

*Formulário: `form-atlas-f1-documentos` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

PDF proposta assinada — hash SHA-256 visível.

---

## F1 Contrato

### Para que serve

Formalização jurídica pós-proposta — modelo configurável, assinatura, vigência.

### História de Usuário

Como gestor de contratos, quero gerar contrato da proposta aprovada, para formalizar relação.

### Requisitos Funcionais

- RF-CONT-01: Gerar da proposta.
- RF-CONT-02: Modelo por parceria.
- RF-CONT-03: Assinatura.
- RF-CONT-04 F3: Enviar Protheus.

### Regras de Negócio

- RN-CONT-01: F1 sem integração Protheus.
- RN-CONT-02: Produtos contratados refletem proposta.

### Campos da tela

*Formulário: `form-atlas-f1-contrato` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Contrato 118/2023 gerado — assinado — vigente.

---

## F1 Ordem de Serviço

### Para que serve

Emissão de OS vinculada a contrato vigente — pedido de venda, assinatura, zerar pedido.

### História de Usuário

Como fiscal, quero emitir OS autorizada pelo contrato, para autorizar execução.

### Requisitos Funcionais

- RF-OS-01: Vínculo contrato.
- RF-OS-02: Pedido de venda.
- RF-OS-03: Método Zerar pedido de venda.
- RF-OS-04 F3: Nº projeto SNOW.

### Regras de Negócio

- RN-OS-01: OS só com contrato vigente.
- RN-OS-02: Escopo pptx UGPEN — zerar pedido permanece.

### Campos da tela

*Formulário: `form-atlas-f1-emissao-ordem-servico` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

OS #789 vinculada contrato Seplag — assinada — pedido venda emitido.

---

## F1 Projeto

### Para que serve

Unifica Termo de Homologação e RAER — gestão de homologação e entrega pós-OS.

### História de Usuário

Como gestor de entrega, quero acompanhar homologação e entrega do serviço, substituindo TH+RAER legado.

### Requisitos Funcionais

- RF-PJ-01: Vínculo OS/contrato.
- RF-PJ-02: Status homologação → homologado → em entrega.
- RF-PJ-03: Datas prevista/real.
- RF-PJ-04: Assinatura quando aplicável.

### Regras de Negócio

- RN-PJ-01: Distinto de projeto técnico SNOW (output).
- RN-PJ-02: Luiz 15/06 — classe Projeto unificada.

### Campos da tela

*Formulário: `form-atlas-f1-projeto` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Projeto pós-OS — em homologação — data prevista 30/09.

---

## F1 Dossiê da Entrega de Valor

### Para que serve

Dossiê de Entrega de Valor — outcome de negócio — abas DTIC, UGEPV, ASCOM, Monitoramento, Timeline.

### História de Usuário

Como UGEPV, quero registrar entrega de valor ao cidadão, em paralelo à execução técnica.

### Requisitos Funcionais

- RF-DV-01: 5 abas F1 manual.
- RF-DV-02: Read-only contrato/OS em UGEPV.
- RF-DV-03: Timeline eventos.
- RF-DV-04 F3: integração SNOW opcional.

### Regras de Negócio

- RN-DV-01: Outcome ≠ output SNOW.
- RN-DV-02: Paulo/Luiz 15/06 — F1 paralelo read-only.

### Campos da tela

*Formulário: `form-atlas-f1-dossie-entrega-valor` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Dossiê serviço X — UGEPV preenche outcome — ASCOM complementa.

---

## Seções globais (anexo)

### Fluxo operacional completo

Proposta → Documentos → Contrato → OS → Projeto → Dossiê EV (F1). Catálogo e integrações conforme fase.

### Regras gerais de assinatura

- Envio simultâneo a todos signatários (sem ordem hierárquica).
- Recusa cancela envelope GED.
- Signatário = Pessoa ocupante do cargo com Pode assinar.
- Painel: Aprovar e Recusar.

### Glossário

| Termo | Definição |
|-------|-----------|
| Projeto | Unifica TH+RAER — homologação e entrega pós-OS |
| Dossiê EV | Outcome (valor ao cidadão), não output SNOW |
| Catálogo | F3 — produtos homologados DIREX |
| Envelope | Agrupamento GED de documentos para assinatura |
